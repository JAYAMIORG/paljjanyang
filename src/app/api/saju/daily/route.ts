import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { createClient } from '@/lib/supabase/server'
import type { SajuResult } from '@/types/saju'
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
    interpretation: string
    isNew: boolean // 새로 생성된 결과인지
  }
  error?: {
    code: string
    message: string
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
      return NextResponse.json<DailyResponse>({
        success: true,
        data: {
          interpretation: existingReading.interpretation,
          isNew: false,
        },
      })
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

    // 결과 저장 (readings 테이블에 daily 타입으로)
    await supabase.from('readings').insert({
      user_id: user.id,
      reading_type: 'daily',
      input_data: {
        gender,
        dayMaster: sajuResult.dayMaster,
        wuXing: sajuResult.wuXing,
      },
      saju_result: sajuResult,
      interpretation: responseText,
    })

    return NextResponse.json<DailyResponse>({
      success: true,
      data: {
        interpretation: responseText,
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
