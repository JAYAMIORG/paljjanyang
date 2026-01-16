import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export interface UseCoinRequest {
  type: 'personal' | 'yearly' | 'compatibility' | 'love'
}

export interface UseCoinResponse {
  success: boolean
  data?: {
    transactionId: string
    remainingBalance: number
  }
  error?: {
    code: string
    message: string
    currentBalance?: number
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()

    if (!supabase) {
      return NextResponse.json<UseCoinResponse>(
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
      return NextResponse.json<UseCoinResponse>(
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

    const body: UseCoinRequest = await request.json()
    const { type } = body

    if (!type || !['personal', 'yearly', 'compatibility', 'love'].includes(type)) {
      return NextResponse.json<UseCoinResponse>(
        {
          success: false,
          error: {
            code: 'INVALID_TYPE',
            message: '유효하지 않은 사주 유형입니다.',
          },
        },
        { status: 400 }
      )
    }

    // Admin client 생성 (RLS 우회)
    const adminClient = createAdminClient()
    if (!adminClient) {
      return NextResponse.json<UseCoinResponse>(
        {
          success: false,
          error: {
            code: 'CONFIG_ERROR',
            message: 'Service Role Key가 설정되지 않았습니다.',
          },
        },
        { status: 500 }
      )
    }

    // 현재 코인 잔액 확인
    const { data: balanceData, error: balanceError } = await adminClient
      .from('coin_balances')
      .select('balance, user_id')
      .eq('user_id', user.id)
      .single()

    if (balanceError && balanceError.code !== 'PGRST116') {
      console.error('Balance fetch error:', balanceError)
    }

    const currentBalance = Number(balanceData?.balance ?? 0)
    const coinsRequired = 1

    if (currentBalance < coinsRequired) {
      return NextResponse.json<UseCoinResponse>(
        {
          success: false,
          error: {
            code: 'INSUFFICIENT_COINS',
            message: '코인이 부족합니다.',
            currentBalance,
          },
        },
        { status: 400 }
      )
    }

    // 코인 차감
    const newBalance = currentBalance - coinsRequired

    // 잔액 업데이트
    const { error: updateError } = await adminClient
      .from('coin_balances')
      .update({
        balance: newBalance,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', user.id)

    if (updateError) {
      console.error('Balance update error:', updateError)
      return NextResponse.json<UseCoinResponse>(
        {
          success: false,
          error: {
            code: 'UPDATE_ERROR',
            message: '코인 차감에 실패했습니다.',
          },
        },
        { status: 500 }
      )
    }

    // 거래 내역 기록
    const typeKorean: Record<string, string> = {
      personal: '개인 사주',
      yearly: '신년운세',
      compatibility: '궁합',
      love: '연애운',
    }

    const { data: transactionData, error: transactionError } = await adminClient
      .from('coin_transactions')
      .insert({
        user_id: user.id,
        type: 'spend',
        amount: -coinsRequired,
        target: 'reading',
        balance_before: currentBalance,
        balance_after: newBalance,
        description: `${typeKorean[type]} 조회`,
      })
      .select('id')
      .single()

    if (transactionError) {
      console.error('Transaction record error:', transactionError)
      // 거래 기록 실패해도 코인 차감은 이미 됨
    }

    return NextResponse.json<UseCoinResponse>({
      success: true,
      data: {
        transactionId: transactionData?.id || '',
        remainingBalance: newBalance,
      },
    })

  } catch (error) {
    console.error('Use coin error:', error)
    return NextResponse.json<UseCoinResponse>(
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
