import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export interface ShareRewardResponse {
  success: boolean
  data?: {
    rewarded: boolean
    alreadyClaimed: boolean
    newBalance: number
  }
  error?: {
    code: string
    message: string
  }
}

export async function POST() {
  try {
    const supabase = await createClient()

    if (!supabase) {
      return NextResponse.json<ShareRewardResponse>(
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
      return NextResponse.json<ShareRewardResponse>(
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

    // Admin 클라이언트 생성 (RLS 우회)
    const adminClient = createAdminClient()
    if (!adminClient) {
      return NextResponse.json<ShareRewardResponse>(
        {
          success: false,
          error: {
            code: 'CONFIG_ERROR',
            message: '서버 설정 오류입니다.',
          },
        },
        { status: 500 }
      )
    }

    // 이미 공유 보상을 받았는지 확인 (type='reward', description='공유 보상')
    const { data: existingReward } = await adminClient
      .from('coin_transactions')
      .select('id')
      .eq('user_id', user.id)
      .eq('type', 'reward')
      .eq('description', '공유 보상')
      .single()

    if (existingReward) {
      // 이미 받은 경우 - 현재 잔액만 반환
      const { data: balanceData } = await adminClient
        .from('coin_balances')
        .select('balance')
        .eq('user_id', user.id)
        .single()

      return NextResponse.json<ShareRewardResponse>({
        success: true,
        data: {
          rewarded: false,
          alreadyClaimed: true,
          newBalance: Number(balanceData?.balance || 0),
        },
      })
    }

    // 현재 잔액 조회
    const { data: balanceData } = await adminClient
      .from('coin_balances')
      .select('balance')
      .eq('user_id', user.id)
      .single()

    const currentBalance = Number(balanceData?.balance || 0)
    const rewardAmount = 1
    const newBalance = currentBalance + rewardAmount

    // 잔액 업데이트 (없으면 생성)
    if (balanceData) {
      await adminClient
        .from('coin_balances')
        .update({
          balance: newBalance,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', user.id)
    } else {
      await adminClient
        .from('coin_balances')
        .insert({
          user_id: user.id,
          balance: newBalance,
        })
    }

    // 거래 내역 추가
    const { error: insertError } = await adminClient
      .from('coin_transactions')
      .insert({
        user_id: user.id,
        amount: rewardAmount,
        type: 'reward',
        description: '공유 보상',
        balance_before: currentBalance,
        balance_after: newBalance,
      })

    if (insertError) {
      console.error('Failed to insert transaction:', insertError)
      // 롤백: 잔액 원복
      await adminClient
        .from('coin_balances')
        .update({
          balance: currentBalance,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', user.id)

      return NextResponse.json<ShareRewardResponse>(
        {
          success: false,
          error: {
            code: 'DB_ERROR',
            message: '보상 지급에 실패했습니다.',
          },
        },
        { status: 500 }
      )
    }

    return NextResponse.json<ShareRewardResponse>({
      success: true,
      data: {
        rewarded: true,
        alreadyClaimed: false,
        newBalance,
      },
    })
  } catch (error) {
    console.error('Share reward error:', error)
    return NextResponse.json<ShareRewardResponse>(
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
