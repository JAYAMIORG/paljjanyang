import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export interface CheckExistingRequest {
  type: 'personal' | 'yearly' | 'compatibility' | 'love'
  birthYear: number
  birthMonth: number
  birthDay: number
  birthHour?: number | null
  isLunar: boolean
  gender: 'male' | 'female'
  // 궁합용 두 번째 사람 정보
  birthYear2?: number
  birthMonth2?: number
  birthDay2?: number
  birthHour2?: number | null
  isLunar2?: boolean
  gender2?: 'male' | 'female'
}

export interface CheckExistingResponse {
  success: boolean
  data?: {
    exists: boolean
    readingId?: string
    status?: 'completed' | 'processing' | 'failed'  // reading 상태
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
      return NextResponse.json<CheckExistingResponse>(
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
      return NextResponse.json<CheckExistingResponse>(
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

    const body: CheckExistingRequest = await request.json()
    const {
      type,
      birthYear,
      birthMonth,
      birthDay,
      birthHour,
      isLunar,
      gender,
      // 궁합용
      birthYear2,
      birthMonth2,
      birthDay2,
      birthHour2,
      isLunar2,
      gender2,
    } = body

    // 입력 검증
    if (!type || !birthYear || !birthMonth || !birthDay || !gender) {
      return NextResponse.json<CheckExistingResponse>(
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

    // 1. 해당 생년월일로 등록된 person 찾기
    const { data: person } = await supabase
      .from('persons')
      .select('id')
      .eq('user_id', user.id)
      .eq('birth_year', birthYear)
      .eq('birth_month', birthMonth)
      .eq('birth_day', birthDay)
      .eq('gender', gender)
      .single()

    if (!person) {
      // person이 없으면 기존 기록도 없음
      return NextResponse.json<CheckExistingResponse>({
        success: true,
        data: {
          exists: false,
        },
      })
    }

    // 2. 해당 person으로 된 reading 찾기 (completed 또는 processing 상태)
    // failed 상태는 이미 환불되었으므로 제외
    let query = supabase
      .from('readings')
      .select('id, status')
      .eq('user_id', user.id)
      .eq('person1_id', person.id)
      .eq('type', type)
      .in('status', ['completed', 'processing'])

    // yearly 타입인 경우 올해 연도도 확인
    if (type === 'yearly') {
      query = query.eq('yearly_year', new Date().getFullYear())
    }

    // 궁합인 경우 두 번째 사람도 확인
    if (type === 'compatibility' && birthYear2 && birthMonth2 && birthDay2 && gender2) {
      const { data: person2 } = await supabase
        .from('persons')
        .select('id')
        .eq('user_id', user.id)
        .eq('birth_year', birthYear2)
        .eq('birth_month', birthMonth2)
        .eq('birth_day', birthDay2)
        .eq('gender', gender2)
        .single()

      if (!person2) {
        // 두 번째 person이 없으면 기존 기록도 없음
        return NextResponse.json<CheckExistingResponse>({
          success: true,
          data: {
            exists: false,
          },
        })
      }

      query = query.eq('person2_id', person2.id)
    }

    // 가장 최근 기록 1개만 가져오기
    const { data: reading } = await query
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (reading) {
      return NextResponse.json<CheckExistingResponse>({
        success: true,
        data: {
          exists: true,
          readingId: reading.id,
          status: reading.status as 'completed' | 'processing',
        },
      })
    }

    return NextResponse.json<CheckExistingResponse>({
      success: true,
      data: {
        exists: false,
      },
    })
  } catch (error) {
    console.error('Check existing reading error:', error)
    return NextResponse.json<CheckExistingResponse>(
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
