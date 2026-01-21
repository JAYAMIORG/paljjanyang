import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { createClient } from '@/lib/supabase/server'
import { checkRateLimit, RATE_LIMITS, createRateLimitResponse } from '@/lib/utils'
import type { SajuResult } from '@/types/saju'
import {
  SYSTEM_PROMPT,
  buildPersonalSajuPrompt,
  buildYearlySajuPrompt,
  buildCompatibilitySajuPrompt,
  buildLoveSajuPrompt,
  buildDailySajuPrompt,
} from '@/lib/llm/prompts'

// OpenAI 클라이언트를 lazy하게 생성
function getOpenAIClient() {
  if (!process.env.OPENAI_API_KEY) {
    return null
  }
  return new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  })
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
}

export interface InterpretResponse {
  success: boolean
  data?: {
    interpretation: string
  }
  error?: {
    code: string
    message: string
  }
}

export async function POST(request: NextRequest) {
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

    // Rate Limit 체크 (사용자당 분당 5회)
    const rateLimit = checkRateLimit(`llm:${user.id}`, RATE_LIMITS.llm)
    if (!rateLimit.allowed) {
      return createRateLimitResponse(rateLimit.resetTime)
    }

    const body: InterpretRequest = await request.json()
    const { type, sajuResult, gender, sajuResult2, gender2, name1, name2 } = body

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

    // OpenAI GPT-4o-mini API 호출
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      max_tokens: 4096,
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

    // 응답 추출
    const responseText = completion.choices[0]?.message?.content
    if (!responseText) {
      throw new Error('No text response from OpenAI')
    }

    return NextResponse.json<InterpretResponse>({
      success: true,
      data: {
        interpretation: responseText,
      },
    })
  } catch (error) {
    console.error('Interpretation error:', error)

    return NextResponse.json<InterpretResponse>(
      {
        success: false,
        error: {
          code: 'INTERPRETATION_ERROR',
          message:
            error instanceof Error
              ? error.message
              : '해석 중 오류가 발생했습니다.',
        },
      },
      { status: 500 }
    )
  }
}
