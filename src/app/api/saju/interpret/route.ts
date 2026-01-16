import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import type { SajuResult } from '@/types/saju'
import {
  SYSTEM_PROMPT,
  buildPersonalSajuPrompt,
  buildYearlySajuPrompt,
  buildLoveSajuPrompt,
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
  type: 'personal' | 'yearly' | 'love' | 'compatibility'
  sajuResult: SajuResult
  gender: 'male' | 'female'
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
    const body: InterpretRequest = await request.json()
    const { type, sajuResult, gender } = body

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
      case 'love':
        userPrompt = buildLoveSajuPrompt(sajuResult, gender)
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
