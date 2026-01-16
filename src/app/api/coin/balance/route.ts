import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export interface BalanceResponse {
  success: boolean
  data?: {
    balance: number
  }
  error?: {
    code: string
    message: string
  }
}

export async function GET() {
  try {
    const supabase = await createClient()

    if (!supabase) {
      return NextResponse.json<BalanceResponse>(
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
      return NextResponse.json<BalanceResponse>(
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

    // 코인 잔액 조회
    const { data: balanceData } = await supabase
      .from('coin_balances')
      .select('balance')
      .eq('user_id', user.id)
      .single()

    // 잔액이 없으면 0 반환 (신규 유저)
    const balance = balanceData?.balance ?? 0

    return NextResponse.json<BalanceResponse>({
      success: true,
      data: {
        balance: Number(balance),
      },
    })
  } catch (error) {
    console.error('Balance fetch error:', error)
    return NextResponse.json<BalanceResponse>(
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
