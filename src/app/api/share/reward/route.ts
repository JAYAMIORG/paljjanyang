import { NextRequest, NextResponse } from 'next/server'
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

// GET: 공유 보상 수령 여부 확인 (계정당 1회)
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

// POST: 공유 보상 요청 (계정당 1회)
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

    // profiles에서 이미 공유 보상을 받았는지 확인
    const { data: profile } = await adminClient
      .from('profiles')
      .select('share_reward_claimed')
      .eq('id', user.id)
      .single()

    if (profile?.share_reward_claimed) {
      // 이미 보상 받음
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

    // 보상 지급
    const { data: balanceData } = await adminClient
      .from('coin_balances')
      .select('balance')
      .eq('user_id', user.id)
      .single()

    const currentBalance = Number(balanceData?.balance || 0)
    const rewardAmount = 1
    const newBalance = currentBalance + rewardAmount

    // 잔액 업데이트
    await adminClient
      .from('coin_balances')
      .upsert({
        user_id: user.id,
        balance: newBalance,
        updated_at: new Date().toISOString(),
      })

    // 거래 내역 추가
    await adminClient
      .from('coin_transactions')
      .insert({
        user_id: user.id,
        amount: rewardAmount,
        type: 'reward',
        description: '공유 보상',
        balance_before: currentBalance,
        balance_after: newBalance,
      })

    // profiles에 share_reward_claimed 업데이트
    await adminClient
      .from('profiles')
      .update({ share_reward_claimed: true, updated_at: new Date().toISOString() })
      .eq('id', user.id)

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
