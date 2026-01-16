import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export interface ReadingHistoryItem {
  id: string
  type: 'personal' | 'yearly' | 'compatibility' | 'love'
  koreanGanji: string
  personName: string
  createdAt: string
  interpretation?: string
}

export interface HistoryResponse {
  success: boolean
  data?: {
    readings: ReadingHistoryItem[]
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
      return NextResponse.json<HistoryResponse>(
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
      return NextResponse.json<HistoryResponse>(
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

    // 페이지네이션 파라미터
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const offset = (page - 1) * limit

    // 사주 기록 조회
    const { data, error: readingsError } = await supabase
      .from('readings')
      .select(`
        id,
        type,
        korean_ganji,
        interpretation,
        created_at
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (readingsError) {
      console.error('Readings fetch error:', readingsError)
      return NextResponse.json<HistoryResponse>(
        {
          success: false,
          error: {
            code: 'DB_ERROR',
            message: '기록 조회에 실패했습니다.',
          },
        },
        { status: 500 }
      )
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const formattedReadings: ReadingHistoryItem[] = (data || []).map((r: any) => ({
      id: r.id,
      type: r.type as ReadingHistoryItem['type'],
      koreanGanji: r.korean_ganji || '',
      personName: '나',
      createdAt: r.created_at,
      interpretation: typeof r.interpretation === 'object' && r.interpretation !== null
        ? r.interpretation.text
        : undefined,
    }))

    return NextResponse.json<HistoryResponse>({
      success: true,
      data: {
        readings: formattedReadings,
      },
    })
  } catch (error) {
    console.error('History fetch error:', error)
    return NextResponse.json<HistoryResponse>(
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
