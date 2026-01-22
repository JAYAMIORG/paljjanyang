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

    // Atomic 공유 보상 처리 (RPC 함수 사용)
    const { data: rpcResult, error: rpcError } = await adminClient
      .rpc('claim_share_reward', {
        p_user_id: user.id,
      })

    if (rpcError) {
      console.error('RPC claim_share_reward error:', rpcError)

      // RPC 함수가 없는 경우 fallback (마이그레이션 실행 전)
      if (rpcError.code === 'PGRST202') {
        console.warn('claim_share_reward RPC not found, using fallback logic')

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

        const { data: balanceData } = await adminClient
          .from('coin_balances')
          .select('balance')
          .eq('user_id', user.id)
          .single()

        const currentBalance = Number(balanceData?.balance || 0)
        const rewardAmount = 1
        const newBalance = currentBalance + rewardAmount

        const { error: balanceError } = await adminClient
          .from('coin_balances')
          .upsert({
            user_id: user.id,
            balance: newBalance,
            updated_at: new Date().toISOString(),
          })

        if (balanceError) {
          console.error('Balance upsert error:', balanceError)
        }

        const { error: transactionError } = await adminClient
          .from('coin_transactions')
          .insert({
            user_id: user.id,
            amount: rewardAmount,
            type: 'bonus',
            description: '공유 보상',
            balance_before: currentBalance,
            balance_after: newBalance,
          })

        if (transactionError) {
          console.error('Transaction insert error:', transactionError)
        }

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
      }

      return NextResponse.json<ShareRewardResponse>(
        {
          success: false,
          error: {
            code: 'RPC_ERROR',
            message: '보상 처리 중 오류가 발생했습니다.',
          },
        },
        { status: 500 }
      )
    }

    // RPC 결과 처리
    const result = rpcResult?.[0]

    if (!result || !result.success) {
      return NextResponse.json<ShareRewardResponse>(
        {
          success: false,
          error: {
            code: 'REWARD_ERROR',
            message: result?.error_message || '보상 처리에 실패했습니다.',
          },
        },
        { status: 400 }
      )
    }

    return NextResponse.json<ShareRewardResponse>({
      success: true,
      data: {
        rewarded: !result.already_claimed,
        alreadyClaimed: result.already_claimed,
        newBalance: result.new_balance,
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
