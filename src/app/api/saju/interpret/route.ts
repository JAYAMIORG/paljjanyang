import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import type { SajuResult } from '@/types/saju'
import type {
  PersonalInterpretation,
  YearlyInterpretation,
  CompatibilityInterpretation,
  LoveInterpretation,
  DailyInterpretation,
} from '@/types/interpretation'
import {
  SYSTEM_PROMPT,
  buildPersonalSajuPrompt,
  buildYearlySajuPrompt,
  buildCompatibilitySajuPrompt,
  buildLoveSajuPrompt,
  buildDailySajuPrompt,
} from '@/lib/llm/prompts'
import {
  generateCacheKey,
  getCachedInterpretation,
  saveCachedInterpretation,
  type SajuType,
} from '@/lib/cache/interpretation-cache'
import { openaiRateLimiter } from '@/lib/llm/rate-limiter'

/**
 * LLM 실패 시 코인 환불 및 Reading 상태 업데이트
 */
async function handleLLMFailure(
  adminClient: ReturnType<typeof createAdminClient>,
  readingId: string | undefined,
  userId: string,
  errorReason: string
): Promise<{ refunded: boolean; newBalance?: number }> {
  if (!adminClient || !readingId) {
    return { refunded: false }
  }

  try {
    // 1. Reading 상태를 'failed'로 업데이트
    await adminClient
      .from('readings')
      .update({
        status: 'failed',
        updated_at: new Date().toISOString(),
      })
      .eq('id', readingId)
      .eq('user_id', userId)

    // 2. 코인 환불 (Atomic RPC 사용)
    const { data: rpcResult, error: rpcError } = await adminClient
      .rpc('refund_coin', {
        p_user_id: userId,
        p_amount: 1,
        p_description: `사주 해석 실패 자동 환불 (${errorReason})`,
      })

    if (rpcError) {
      // RPC 함수가 없는 경우 fallback
      if (rpcError.code === 'PGRST202') {
        const { data: balanceData } = await adminClient
          .from('coin_balances')
          .select('balance')
          .eq('user_id', userId)
          .single()

        const currentBalance = Number(balanceData?.balance ?? 0)
        const newBalance = currentBalance + 1

        await adminClient
          .from('coin_balances')
          .upsert({
            user_id: userId,
            balance: newBalance,
            updated_at: new Date().toISOString(),
          })

        await adminClient
          .from('coin_transactions')
          .insert({
            user_id: userId,
            type: 'refund',
            amount: 1,
            balance_before: currentBalance,
            balance_after: newBalance,
            description: `사주 해석 실패 자동 환불 (${errorReason})`,
          })

        console.log(`[interpret] Fallback refund success: user=${userId}, newBalance=${newBalance}`)
        return { refunded: true, newBalance }
      }

      console.error('[interpret] Refund RPC error:', rpcError)
      return { refunded: false }
    }

    const result = rpcResult?.[0]
    if (result?.success) {
      console.log(`[interpret] Auto refund success: user=${userId}, newBalance=${result.new_balance}`)
      return { refunded: true, newBalance: result.new_balance }
    }

    return { refunded: false }
  } catch (error) {
    console.error('[interpret] Auto refund failed:', error)
    return { refunded: false }
  }
}

// JSON 응답 타입 유니온
type InterpretationData =
  | PersonalInterpretation
  | YearlyInterpretation
  | CompatibilityInterpretation
  | LoveInterpretation
  | DailyInterpretation

// OpenAI 클라이언트를 싱글톤으로 생성 (연결 재사용)
let openaiClient: OpenAI | null = null

function getOpenAIClient(): OpenAI | null {
  if (!process.env.OPENAI_API_KEY) {
    return null
  }
  if (!openaiClient) {
    openaiClient = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    })
  }
  return openaiClient
}

export interface InterpretRequest {
  type: 'personal' | 'yearly' | 'love' | 'compatibility' | 'daily'
  sajuResult: SajuResult
  gender: 'male' | 'female'
  // 궁합용 추가 필드
  sajuResult2?: SajuResult
  gender2?: 'male' | 'female'
  name1?: string
  name2?: string
  // 선저장된 reading ID (use-coin에서 생성됨)
  readingId?: string
}

export interface InterpretResponse {
  success: boolean
  data?: {
    interpretation: InterpretationData
    raw?: string // 디버깅용 원본 응답 (개발 모드에서만)
  }
  error?: {
    code: string
    message: string
    refunded?: boolean      // 자동 환불 여부
    newBalance?: number     // 환불 후 잔액
  }
}

/**
 * LLM 응답에서 JSON을 추출하고 파싱
 * - 마크다운 코드블록 제거
 * - JSON 유효성 검사
 */
function parseJsonResponse(text: string): InterpretationData | null {
  try {
    // 마크다운 코드블록 제거 (```json ... ``` 또는 ``` ... ```)
    let cleaned = text.trim()

    // ```json 또는 ``` 로 시작하는 경우 제거
    const codeBlockMatch = cleaned.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/i)
    if (codeBlockMatch) {
      cleaned = codeBlockMatch[1].trim()
    }

    // JSON 객체 시작/끝 찾기 (앞뒤 텍스트 무시)
    const jsonStart = cleaned.indexOf('{')
    const jsonEnd = cleaned.lastIndexOf('}')

    if (jsonStart === -1 || jsonEnd === -1 || jsonEnd <= jsonStart) {
      console.error('JSON boundaries not found in response')
      return null
    }

    const jsonStr = cleaned.slice(jsonStart, jsonEnd + 1)
    const parsed = JSON.parse(jsonStr)

    return parsed as InterpretationData
  } catch (error) {
    console.error('JSON parse error:', error)
    console.error('Raw text:', text.slice(0, 500))
    return null
  }
}

export async function POST(request: NextRequest) {
  // catch 블록에서 환불 처리를 위해 변수 선언
  let userId: string | undefined
  let currentReadingId: string | undefined
  let currentAdminClient: ReturnType<typeof createAdminClient> = null

  try {
    // 인증 확인 (비용 공격 방지)
    const supabase = await createClient()
    if (!supabase) {
      return NextResponse.json<InterpretResponse>(
        {
          success: false,
          error: {
            code: 'CONFIG_ERROR',
            message: 'Supabase가 설정되지 않았습니다.',
          },
        },
        { status: 500 }
      )
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json<InterpretResponse>(
        {
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: '로그인이 필요합니다.',
          },
        },
        { status: 401 }
      )
    }
    userId = user.id  // catch 블록에서 사용

    const body: InterpretRequest = await request.json()
    const { type, sajuResult, gender, sajuResult2, gender2, name1, name2, readingId } = body
    currentReadingId = readingId  // catch 블록에서 사용

    // 입력 검증
    if (!sajuResult || !type || !gender) {
      return NextResponse.json<InterpretResponse>(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: '필수 정보가 누락되었습니다.',
          },
        },
        { status: 400 }
      )
    }

    // 궁합 타입 추가 검증
    if (type === 'compatibility' && (!sajuResult2 || !gender2)) {
      return NextResponse.json<InterpretResponse>(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: '궁합 분석에는 두 사람의 정보가 필요합니다.',
          },
        },
        { status: 400 }
      )
    }

    // ========================================
    // 캐시 조회 (LLM 호출 전)
    // ========================================
    const cacheKey = generateCacheKey({
      type: type as SajuType,
      bazi: sajuResult.bazi,
      gender,
      bazi2: sajuResult2?.bazi,
      gender2,
    })

    // Admin 클라이언트로 캐시 조회 (RLS 우회)
    const adminClient = createAdminClient()
    currentAdminClient = adminClient  // catch 블록에서 사용
    if (adminClient) {
      const cached = await getCachedInterpretation(adminClient, cacheKey)
      if (cached) {
        // 캐시 히트 - JSON 파싱 시도
        const parsedCache = parseJsonResponse(cached.interpretation)
        if (parsedCache) {
          // Reading 레코드 업데이트 (캐시 히트 시에도 처리)
          if (readingId) {
            const { error: updateError } = await adminClient
              .from('readings')
              .update({
                interpretation: parsedCache,
                status: 'completed',
              })
              .eq('id', readingId)
              .eq('user_id', user.id)

            if (updateError) {
              console.error('[interpret] Reading update error (cache hit):', updateError)
            }
          }

          return NextResponse.json<InterpretResponse>({
            success: true,
            data: {
              interpretation: parsedCache,
            },
          })
        }
        // 구 버전 캐시 (Markdown) - 무시하고 새로 생성
      }
    }

    // ========================================
    // 캐시 미스 - LLM 호출
    // ========================================

    // OpenAI 클라이언트 확인
    const openai = getOpenAIClient()
    if (!openai) {
      return NextResponse.json<InterpretResponse>(
        {
          success: false,
          error: {
            code: 'CONFIG_ERROR',
            message: 'API 설정이 필요합니다.',
          },
        },
        { status: 500 }
      )
    }

    // 프롬프트 생성
    let userPrompt: string
    switch (type) {
      case 'personal':
        userPrompt = buildPersonalSajuPrompt(sajuResult, gender)
        break
      case 'yearly':
        userPrompt = buildYearlySajuPrompt(sajuResult, gender)
        break
      case 'compatibility':
        userPrompt = buildCompatibilitySajuPrompt(
          sajuResult,
          gender,
          name1 || '첫 번째 사람',
          sajuResult2!,
          gender2!,
          name2 || '두 번째 사람'
        )
        break
      case 'love':
        userPrompt = buildLoveSajuPrompt(sajuResult, gender)
        break
      case 'daily':
        userPrompt = buildDailySajuPrompt(sajuResult, gender)
        break
      default:
        userPrompt = buildPersonalSajuPrompt(sajuResult, gender)
    }

    // 타입별 max_tokens 설정 (상세한 내용 필요한 타입은 토큰 증가)
    const maxTokens =
      type === 'personal' ? 8000 :
      type === 'yearly' ? 6000 :
      type === 'compatibility' ? 5000 :
      type === 'love' ? 5000 :
      type === 'daily' ? 2000 : 4096

    // OpenAI GPT-4o-mini API 호출 (레이트 리미터 적용)
    const completion = await openaiRateLimiter.execute(() =>
      openai.chat.completions.create({
        model: 'gpt-4o-mini',
        max_tokens: maxTokens,
        messages: [
          {
            role: 'system',
            content: SYSTEM_PROMPT,
          },
          {
            role: 'user',
            content: userPrompt,
          },
        ],
      })
    )

    // 응답 추출
    const responseText = completion.choices[0]?.message?.content
    if (!responseText) {
      throw new Error('No text response from OpenAI')
    }

    // JSON 파싱
    const parsedResponse = parseJsonResponse(responseText)
    if (!parsedResponse) {
      console.error('Failed to parse LLM JSON response')
      console.error('Raw response:', responseText.slice(0, 1000))

      // 자동 환불 처리
      const refundResult = await handleLLMFailure(
        adminClient,
        readingId,
        user.id,
        'JSON 파싱 실패'
      )

      return NextResponse.json<InterpretResponse>(
        {
          success: false,
          error: {
            code: 'PARSE_ERROR',
            message: '응답 형식 오류가 발생했습니다. 다시 시도해주세요.',
            refunded: refundResult.refunded,
            newBalance: refundResult.newBalance,
          },
        },
        { status: 500 }
      )
    }

    // ========================================
    // 캐시 저장 (LLM 호출 후, 백그라운드에서 실행)
    // ========================================
    if (adminClient) {
      // 비동기로 저장 (응답 지연 방지)
      // JSON을 문자열로 저장 (기존 스키마 호환)
      saveCachedInterpretation(adminClient, {
        cacheKey,
        type: type as SajuType,
        bazi: sajuResult.bazi,
        gender,
        interpretation: JSON.stringify(parsedResponse),
        bazi2: sajuResult2?.bazi,
        gender2,
      }).catch((err) => {
        console.error('Cache save failed:', err)
      })
    }

    // ========================================
    // Reading 레코드 업데이트 (선저장 후해석 패턴)
    // ========================================
    if (readingId && adminClient) {
      try {
        const { error: updateError } = await adminClient
          .from('readings')
          .update({
            interpretation: parsedResponse,
            status: 'completed',
          })
          .eq('id', readingId)
          .eq('user_id', user.id) // 보안: 본인 reading만 업데이트

        if (updateError) {
          console.error('[interpret] Reading update error:', updateError)
        }
      } catch (err) {
        console.error('[interpret] Reading update failed:', err)
      }
    }

    return NextResponse.json<InterpretResponse>({
      success: true,
      data: {
        interpretation: parsedResponse,
        ...(process.env.NODE_ENV === 'development' && { raw: responseText }),
      },
    })
  } catch (error) {
    console.error('Interpretation error:', error)

    // 레이트 리밋 에러 처리
    const errorMessage = error instanceof Error ? error.message : ''
    const isRateLimitError =
      errorMessage.toLowerCase().includes('rate limit') ||
      errorMessage.includes('429')

    // 자동 환불 처리 (userId와 readingId가 있는 경우에만)
    let refundResult: { refunded: boolean; newBalance?: number } = { refunded: false }
    if (userId && currentReadingId) {
      refundResult = await handleLLMFailure(
        currentAdminClient,
        currentReadingId,
        userId,
        isRateLimitError ? 'Rate Limit 초과' : 'LLM 호출 실패'
      )
    }

    if (isRateLimitError) {
      return NextResponse.json<InterpretResponse>(
        {
          success: false,
          error: {
            code: 'RATE_LIMIT_ERROR',
            message: refundResult.refunded
              ? '현재 요청이 많습니다. 코인이 자동 환불되었습니다.'
              : '현재 요청이 많습니다. 잠시 후 다시 시도해주세요.',
            refunded: refundResult.refunded,
            newBalance: refundResult.newBalance,
          },
        },
        { status: 429 }
      )
    }

    return NextResponse.json<InterpretResponse>(
      {
        success: false,
        error: {
          code: 'INTERPRETATION_ERROR',
          message: refundResult.refunded
            ? '해석 중 오류가 발생했습니다. 코인이 자동 환불되었습니다.'
            : error instanceof Error
              ? error.message
              : '해석 중 오류가 발생했습니다.',
          refunded: refundResult.refunded,
          newBalance: refundResult.newBalance,
        },
      },
      { status: 500 }
    )
  }
}
