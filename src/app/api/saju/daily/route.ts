import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import type { SajuResult } from '@/types/saju'
import type { DailyInterpretation } from '@/types/interpretation'
import { SYSTEM_PROMPT, buildDailySajuPrompt } from '@/lib/llm/prompts'
import {
  generateCacheKey,
  getCachedInterpretation,
  saveCachedInterpretation,
} from '@/lib/cache/interpretation-cache'

function getOpenAIClient() {
  if (!process.env.OPENAI_API_KEY) {
    return null
  }
  return new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  })
}

export interface DailyRequest {
  sajuResult: SajuResult
  gender: 'male' | 'female'
  personId?: string
  personName?: string
  birthDate?: string // "YYYY-M-D" 형식
}

export interface DailyResponse {
  success: boolean
  data?: {
    interpretation: DailyInterpretation
    isNew: boolean // 새로 생성된 결과인지
    readingId: string // 공유 페이지 리다이렉트용
  }
  error?: {
    code: string
    message: string
  }
}

/**
 * LLM 응답에서 JSON을 추출하고 파싱
 */
function parseJsonResponse(text: string): DailyInterpretation | null {
  try {
    let cleaned = text.trim()

    // 마크다운 코드블록 제거
    const codeBlockMatch = cleaned.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/i)
    if (codeBlockMatch) {
      cleaned = codeBlockMatch[1].trim()
    }

    // JSON 객체 시작/끝 찾기
    const jsonStart = cleaned.indexOf('{')
    const jsonEnd = cleaned.lastIndexOf('}')

    if (jsonStart === -1 || jsonEnd === -1 || jsonEnd <= jsonStart) {
      console.error('JSON boundaries not found in daily response')
      return null
    }

    const jsonStr = cleaned.slice(jsonStart, jsonEnd + 1)
    return JSON.parse(jsonStr) as DailyInterpretation
  } catch (error) {
    console.error('Daily JSON parse error:', error)
    return null
  }
}

// 오늘 날짜 문자열 (YYYY-MM-DD)
function getTodayString(): string {
  const today = new Date()
  return today.toISOString().split('T')[0]
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    if (!supabase) {
      return NextResponse.json<DailyResponse>(
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
      return NextResponse.json<DailyResponse>(
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

    const body: DailyRequest = await request.json()
    const { sajuResult, gender, personId, personName, birthDate } = body

    if (!sajuResult || !gender) {
      return NextResponse.json<DailyResponse>(
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

    const todayString = getTodayString()

    // birthDate 파싱 및 person 찾기/생성
    let resolvedPersonId: string | null = personId || null
    if (!resolvedPersonId && birthDate) {
      const parts = birthDate.split('-')
      if (parts.length >= 3) {
        const birthYear = parseInt(parts[0])
        const birthMonth = parseInt(parts[1])
        const birthDay = parseInt(parts[2])

        // 기존 person 찾기
        const { data: existingPerson } = await supabase
          .from('persons')
          .select('id')
          .eq('user_id', user.id)
          .eq('birth_year', birthYear)
          .eq('birth_month', birthMonth)
          .eq('birth_day', birthDay)
          .eq('gender', gender)
          .limit(1)
          .single()

        if (existingPerson) {
          resolvedPersonId = existingPerson.id
        } else {
          // 새 person 생성
          const { data: newPerson } = await supabase
            .from('persons')
            .insert({
              user_id: user.id,
              name: personName || '나',
              relationship: 'self',
              birth_year: birthYear,
              birth_month: birthMonth,
              birth_day: birthDay,
              gender,
              is_lunar: false,
            })
            .select('id')
            .single()

          if (newPerson) {
            resolvedPersonId = newPerson.id
          }
        }
      }
    }

    // 1. 먼저 이 유저가 오늘 이미 같은 사주로 조회했는지 확인
    const { data: existingReading } = await supabase
      .from('readings')
      .select('id, interpretation')
      .eq('user_id', user.id)
      .eq('type', 'daily')
      .eq('korean_ganji', sajuResult.koreanGanji)
      .gte('created_at', `${todayString}T00:00:00`)
      .lt('created_at', `${todayString}T23:59:59`)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    // 이미 오늘 조회한 기록이 있으면 저장된 결과 반환
    if (existingReading?.interpretation) {
      let parsedInterpretation: DailyInterpretation | null = null
      try {
        parsedInterpretation = typeof existingReading.interpretation === 'string'
          ? JSON.parse(existingReading.interpretation)
          : existingReading.interpretation
      } catch {
        parsedInterpretation = null
      }

      if (parsedInterpretation) {
        return NextResponse.json<DailyResponse>({
          success: true,
          data: {
            interpretation: parsedInterpretation,
            isNew: false,
            readingId: existingReading.id,
          },
        })
      }
    }

    // 2. 공유 캐시 확인 (같은 사주 + 오늘 날짜)
    const cacheKey = generateCacheKey({
      type: 'daily',
      bazi: sajuResult.bazi,
      gender,
      date: todayString,
    })

    const adminClient = createAdminClient()
    let parsedResponse: DailyInterpretation | null = null

    if (adminClient) {
      const cached = await getCachedInterpretation(adminClient, cacheKey)
      if (cached) {
        // 캐시 히트 - JSON 파싱
        try {
          parsedResponse = JSON.parse(cached.interpretation) as DailyInterpretation
        } catch {
          // Old cache format - regenerating
        }
      }
    }

    // 3. 캐시 미스 - LLM 호출
    if (!parsedResponse) {
      const openai = getOpenAIClient()
      if (!openai) {
        return NextResponse.json<DailyResponse>(
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

      const userPrompt = buildDailySajuPrompt(sajuResult, gender)

      const completion = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        max_tokens: 2000,
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

      const responseText = completion.choices[0]?.message?.content
      if (!responseText) {
        throw new Error('No text response from OpenAI')
      }

      parsedResponse = parseJsonResponse(responseText)
      if (!parsedResponse) {
        console.error('Failed to parse daily LLM JSON response')
        return NextResponse.json<DailyResponse>(
          {
            success: false,
            error: {
              code: 'PARSE_ERROR',
              message: '응답 형식 오류가 발생했습니다. 다시 시도해주세요.',
            },
          },
          { status: 500 }
        )
      }

      // 4. 공유 캐시에 저장 (백그라운드)
      if (adminClient) {
        saveCachedInterpretation(adminClient, {
          cacheKey,
          type: 'daily',
          bazi: sajuResult.bazi,
          gender,
          interpretation: JSON.stringify(parsedResponse),
        }).catch((err) => {
          console.error('Daily cache save failed:', err)
        })
      }
    }

    // 5. 유저별 기록 저장 (readings 테이블) - 다른 타입들과 동일한 형식
    const { data: newReading } = await supabase.from('readings').insert({
      user_id: user.id,
      type: 'daily',
      status: 'completed',
      person1_id: resolvedPersonId,
      person1_name: personName || null,
      person1_bazi: sajuResult.bazi,
      person1_wuxing: sajuResult.wuXing,
      person1_day_master: sajuResult.dayMaster,
      korean_ganji: sajuResult.koreanGanji,
      interpretation: parsedResponse,
      coins_used: 0,
      is_free: true,
    }).select('id').single()

    return NextResponse.json<DailyResponse>({
      success: true,
      data: {
        interpretation: parsedResponse,
        isNew: true,
        readingId: newReading?.id || '',
      },
    })
  } catch (error) {
    console.error('Daily fortune error:', error)

    return NextResponse.json<DailyResponse>(
      {
        success: false,
        error: {
          code: 'DAILY_ERROR',
          message:
            error instanceof Error
              ? error.message
              : '오늘의 운세 조회 중 오류가 발생했습니다.',
        },
      },
      { status: 500 }
    )
  }
}
