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

export interface ShareRewardStatusResponse {
  success: boolean
  data?: {
    alreadyClaimed: boolean
  }
  error?: {
    code: string
    message: string
  }
}

// GET: 공유 보상 수령 여부 확인
export async function GET() {
  try {
    const supabase = await createClient()

    if (!supabase) {
      return NextResponse.json<ShareRewardStatusResponse>(
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
      return NextResponse.json<ShareRewardStatusResponse>(
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

    // profiles에서 share_reward_claimed 확인
    const { data: profile } = await supabase
      .from('profiles')
      .select('share_reward_claimed')
      .eq('id', user.id)
      .single()

    return NextResponse.json<ShareRewardStatusResponse>({
      success: true,
      data: {
        alreadyClaimed: profile?.share_reward_claimed ?? false,
      },
    })
  } catch (error) {
    console.error('Share reward status check error:', error)
    return NextResponse.json<ShareRewardStatusResponse>(
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

    // 공유 보상 처리 (직접 DB 작업)
    // profiles에서 이미 공유 보상을 받았는지 확인
    const { data: profile } = await adminClient
      .from('profiles')
      .select('share_reward_claimed')
      .eq('id', user.id)
      .single()

    if (profile?.share_reward_claimed) {
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

    // 코인 잔액 조회
    const { data: balanceData } = await adminClient
      .from('coin_balances')
      .select('balance')
      .eq('user_id', user.id)
      .single()

    const currentBalance = Number(balanceData?.balance || 0)
    const rewardAmount = 1
    const newBalance = currentBalance + rewardAmount

    // 코인 잔액 업데이트
    const { error: balanceError } = await adminClient
      .from('coin_balances')
      .upsert({
        user_id: user.id,
        balance: newBalance,
        updated_at: new Date().toISOString(),
      })

    if (balanceError) {
      console.error('Balance upsert error:', balanceError)
      return NextResponse.json<ShareRewardResponse>(
        {
          success: false,
          error: {
            code: 'BALANCE_ERROR',
            message: '코인 잔액 업데이트에 실패했습니다.',
          },
        },
        { status: 500 }
      )
    }

    // 트랜잭션 기록
    const { error: transactionError } = await adminClient
      .from('coin_transactions')
      .insert({
        user_id: user.id,
        amount: rewardAmount,
        type: 'reward',
        description: '공유 보상',
        balance_before: currentBalance,
        balance_after: newBalance,
      })

    if (transactionError) {
      console.error('Transaction insert error:', transactionError)
    }

    // 프로필 업데이트 (share_reward_claimed = true)
    const { error: profileError } = await adminClient
      .from('profiles')
      .upsert({
        id: user.id,
        share_reward_claimed: true,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'id',
      })

    if (profileError) {
      console.error('Profile upsert error:', profileError)
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
