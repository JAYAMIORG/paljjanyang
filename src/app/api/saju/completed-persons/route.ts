import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export interface CompletedPersonsResponse {
  success: boolean
  data?: {
    completedPersonIds: string[]
  }
  error?: {
    code: string
    message: string
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    if (!supabase) {
      return NextResponse.json<CompletedPersonsResponse>(
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
      return NextResponse.json<CompletedPersonsResponse>(
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

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')

    if (!type || !['personal', 'yearly', 'compatibility', 'love', 'daily'].includes(type)) {
      return NextResponse.json<CompletedPersonsResponse>(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: '유효한 type 파라미터가 필요합니다.',
          },
        },
        { status: 400 }
      )
    }

    // 해당 type의 completed readings에서 person1_id 목록 조회
    let query = supabase
      .from('readings')
      .select('person1_id')
      .eq('user_id', user.id)
      .eq('type', type)
      .eq('status', 'completed')
      .not('person1_id', 'is', null)

    // yearly 타입인 경우 올해 연도만 필터
    if (type === 'yearly') {
      query = query.eq('yearly_year', new Date().getFullYear())
    }

    const { data, error: readingsError } = await query

    if (readingsError) {
      console.error('Completed readings fetch error:', readingsError)
      return NextResponse.json<CompletedPersonsResponse>(
        {
          success: false,
          error: {
            code: 'DB_ERROR',
            message: '조회에 실패했습니다.',
          },
        },
        { status: 500 }
      )
    }

    // person1_id 목록을 unique하게 추출
    const completedPersonIds = [...new Set(data?.map(r => r.person1_id).filter(Boolean) as string[])]

    return NextResponse.json<CompletedPersonsResponse>({
      success: true,
      data: {
        completedPersonIds,
      },
    })
  } catch (error) {
    console.error('Completed persons fetch error:', error)
    return NextResponse.json<CompletedPersonsResponse>(
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
