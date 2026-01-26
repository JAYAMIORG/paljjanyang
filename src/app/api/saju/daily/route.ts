import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { createClient } from '@/lib/supabase/server'
import type { SajuResult } from '@/types/saju'
import type { DailyInterpretation } from '@/types/interpretation'
import { SYSTEM_PROMPT, buildDailySajuPrompt } from '@/lib/llm/prompts'

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
}

export interface DailyResponse {
  success: boolean
  data?: {
    interpretation: DailyInterpretation
    isNew: boolean // 새로 생성된 결과인지
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
    const { sajuResult, gender } = body

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

    // 오늘 이미 조회한 기록이 있는지 확인
    const { data: existingReading } = await supabase
      .from('readings')
      .select('interpretation')
      .eq('user_id', user.id)
      .eq('reading_type', 'daily')
      .gte('created_at', `${todayString}T00:00:00`)
      .lt('created_at', `${todayString}T23:59:59`)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    // 이미 오늘 조회한 기록이 있으면 저장된 결과 반환
    if (existingReading?.interpretation) {
      // 저장된 해석을 JSON으로 파싱 시도
      let parsedInterpretation: DailyInterpretation | null = null
      try {
        parsedInterpretation = typeof existingReading.interpretation === 'string'
          ? JSON.parse(existingReading.interpretation)
          : existingReading.interpretation
      } catch {
        // 구 형식 (마크다운) - 무시하고 새로 생성
        parsedInterpretation = null
      }

      if (parsedInterpretation) {
        return NextResponse.json<DailyResponse>({
          success: true,
          data: {
            interpretation: parsedInterpretation,
            isNew: false,
          },
        })
      }
    }

    // OpenAI 클라이언트 확인
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

    // 프롬프트 생성 및 LLM 호출
    const userPrompt = buildDailySajuPrompt(sajuResult, gender)

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      max_tokens: 500, // 짧은 응답이므로 토큰 제한
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

    // JSON 파싱
    const parsedResponse = parseJsonResponse(responseText)
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

    // 결과 저장 (readings 테이블에 daily 타입으로) - JSON을 문자열로 저장
    await supabase.from('readings').insert({
      user_id: user.id,
      reading_type: 'daily',
      input_data: {
        gender,
        dayMaster: sajuResult.dayMaster,
        wuXing: sajuResult.wuXing,
      },
      saju_result: sajuResult,
      interpretation: JSON.stringify(parsedResponse),
    })

    return NextResponse.json<DailyResponse>({
      success: true,
      data: {
        interpretation: parsedResponse,
        isNew: true,
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
