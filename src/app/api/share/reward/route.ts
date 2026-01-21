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

// GET: 공유 보상 수령 여부 확인 (readingId 기반)
export async function GET(request: NextRequest) {
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

    // readingId 파라미터 확인
    const { searchParams } = new URL(request.url)
    const readingId = searchParams.get('readingId')

    if (!readingId) {
      // readingId가 없으면 아직 저장 전이므로 false 반환
      return NextResponse.json<ShareRewardStatusResponse>({
        success: true,
        data: {
          alreadyClaimed: false,
        },
      })
    }

    // coin_transactions에서 해당 reading에 대한 공유 보상이 있는지 확인
    const { data: existingReward } = await supabase
      .from('coin_transactions')
      .select('id')
      .eq('user_id', user.id)
      .eq('target_id', readingId)
      .eq('type', 'reward')
      .limit(1)
      .single()

    return NextResponse.json<ShareRewardStatusResponse>({
      success: true,
      data: {
        alreadyClaimed: !!existingReward,
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

export async function POST(request: NextRequest) {
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

    // readingId 파라미터 확인
    const body = await request.json().catch(() => ({}))
    const readingId = body.readingId

    if (!readingId) {
      return NextResponse.json<ShareRewardResponse>(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'readingId가 필요합니다.',
          },
        },
        { status: 400 }
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

    // 해당 reading에 대한 공유 보상이 이미 있는지 확인
    const { data: existingReward } = await adminClient
      .from('coin_transactions')
      .select('id')
      .eq('user_id', user.id)
      .eq('target_id', readingId)
      .eq('type', 'reward')
      .limit(1)
      .single()

    if (existingReward) {
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

    // 거래 내역 추가 (target_id에 readingId 저장)
    await adminClient
      .from('coin_transactions')
      .insert({
        user_id: user.id,
        amount: rewardAmount,
        type: 'reward',
        target_id: readingId,
        description: '공유 보상',
        balance_before: currentBalance,
        balance_after: newBalance,
      })

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
