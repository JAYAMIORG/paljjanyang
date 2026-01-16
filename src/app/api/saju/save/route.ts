import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { SajuResult } from '@/types/saju'

export interface SaveReadingRequest {
  type: 'personal' | 'yearly' | 'compatibility' | 'love'
  sajuResult: SajuResult
  interpretation?: string
  gender: 'male' | 'female'
  birthInfo: {
    year: number
    month: number
    day: number
    hour?: number
    isLunar: boolean
    name?: string
  }
}

export interface SaveReadingResponse {
  success: boolean
  data?: {
    readingId: string
  }
  error?: {
    code: string
    message: string
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    if (!supabase) {
      return NextResponse.json<SaveReadingResponse>(
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

    // 인증 확인
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json<SaveReadingResponse>(
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

    const body: SaveReadingRequest = await request.json()
    const { type, sajuResult, interpretation, gender, birthInfo } = body

    // 입력 검증
    if (!type || !sajuResult || !gender || !birthInfo) {
      return NextResponse.json<SaveReadingResponse>(
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

    // 1. Person 생성 또는 조회
    const { data: existingPerson } = await supabase
      .from('persons')
      .select('id')
      .eq('user_id', user.id)
      .eq('birth_year', birthInfo.year)
      .eq('birth_month', birthInfo.month)
      .eq('birth_day', birthInfo.day)
      .eq('gender', gender)
      .single()

    let personId: string

    if (existingPerson) {
      personId = existingPerson.id
    } else {
      const { data: newPerson, error: personError } = await supabase
        .from('persons')
        .insert({
          user_id: user.id,
          name: birthInfo.name || '나',
          relationship: 'self',
          birth_year: birthInfo.year,
          birth_month: birthInfo.month,
          birth_day: birthInfo.day,
          birth_hour: birthInfo.hour ?? null,
          is_lunar: birthInfo.isLunar,
          is_leap_month: false,
          gender,
        })
        .select('id')
        .single()

      if (personError || !newPerson) {
        console.error('Person creation error:', personError)
        return NextResponse.json<SaveReadingResponse>(
          {
            success: false,
            error: {
              code: 'DB_ERROR',
              message: '인물 정보 저장에 실패했습니다.',
            },
          },
          { status: 500 }
        )
      }

      personId = newPerson.id
    }

    // 2. Reading 생성
    const readingData: Record<string, unknown> = {
      user_id: user.id,
      type,
      status: 'completed',
      person1_id: personId,
      person1_bazi: sajuResult.bazi,
      person1_wuxing: sajuResult.wuXing,
      person1_day_master: sajuResult.dayMaster,
      korean_ganji: sajuResult.koreanGanji,
      coins_used: 0, // MVP에서는 무료
      is_free: true,
      completed_at: new Date().toISOString(),
    }

    // yearly 타입인 경우 연도 추가
    if (type === 'yearly') {
      readingData.yearly_year = new Date().getFullYear()
    }

    // 해석 결과가 있으면 저장
    if (interpretation) {
      readingData.interpretation = { text: interpretation }
    }

    const { data: reading, error: readingError } = await supabase
      .from('readings')
      .insert(readingData)
      .select('id')
      .single()

    if (readingError || !reading) {
      console.error('Reading creation error:', readingError)
      return NextResponse.json<SaveReadingResponse>(
        {
          success: false,
          error: {
            code: 'DB_ERROR',
            message: '사주 결과 저장에 실패했습니다.',
          },
        },
        { status: 500 }
      )
    }

    return NextResponse.json<SaveReadingResponse>({
      success: true,
      data: {
        readingId: reading.id,
      },
    })
  } catch (error) {
    console.error('Save reading error:', error)
    return NextResponse.json<SaveReadingResponse>(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: '서버 오류가 발생했습니다.',
        },
      },
      { status: 500 }
    )
  }
}
