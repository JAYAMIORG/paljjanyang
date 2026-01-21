import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { checkRateLimit, RATE_LIMITS, createRateLimitResponse } from '@/lib/utils'

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

    // Rate Limit 체크 (사용자당 분당 60회)
    const rateLimit = checkRateLimit(`use-coin:${user.id}`, RATE_LIMITS.default)
    if (!rateLimit.allowed) {
      return createRateLimitResponse(rateLimit.resetTime)
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

    // 사주 유형별 한국어 이름
    const typeKorean: Record<string, string> = {
      personal: '개인 사주',
      yearly: '신년운세',
      compatibility: '궁합',
      love: '연애운',
    }

    const coinsRequired = 1
    const description = `${typeKorean[type]} 조회`

    // Atomic 코인 차감 (RPC 함수 사용)
    const { data: rpcResult, error: rpcError } = await adminClient
      .rpc('use_coin', {
        p_user_id: user.id,
        p_amount: coinsRequired,
        p_description: description,
      })

    if (rpcError) {
      console.error('RPC use_coin error:', rpcError)

      // RPC 함수가 없는 경우 fallback (마이그레이션 실행 전)
      if (rpcError.code === 'PGRST202') {
        // 기존 로직으로 fallback (race condition 위험 있음)
        console.warn('use_coin RPC not found, using fallback logic')

        const { data: balanceData } = await adminClient
          .from('coin_balances')
          .select('balance')
          .eq('user_id', user.id)
          .single()

        const currentBalance = Number(balanceData?.balance ?? 0)

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

        const newBalance = currentBalance - coinsRequired

        await adminClient
          .from('coin_balances')
          .update({ balance: newBalance, updated_at: new Date().toISOString() })
          .eq('user_id', user.id)

        const { data: txData } = await adminClient
          .from('coin_transactions')
          .insert({
            user_id: user.id,
            type: 'spend',
            amount: -coinsRequired,
            target: 'reading',
            balance_before: currentBalance,
            balance_after: newBalance,
            description,
          })
          .select('id')
          .single()

        return NextResponse.json<UseCoinResponse>({
          success: true,
          data: {
            transactionId: txData?.id || '',
            remainingBalance: newBalance,
          },
        })
      }

      return NextResponse.json<UseCoinResponse>(
        {
          success: false,
          error: {
            code: 'RPC_ERROR',
            message: '코인 차감 중 오류가 발생했습니다.',
          },
        },
        { status: 500 }
      )
    }

    // RPC 결과 처리
    const result = rpcResult?.[0]

    if (!result || !result.success) {
      const errorMessage = result?.error_message || '코인 차감에 실패했습니다.'
      const isInsufficientCoins = errorMessage.includes('부족')

      return NextResponse.json<UseCoinResponse>(
        {
          success: false,
          error: {
            code: isInsufficientCoins ? 'INSUFFICIENT_COINS' : 'USE_COIN_ERROR',
            message: errorMessage,
            currentBalance: result?.new_balance ?? 0,
          },
        },
        { status: 400 }
      )
    }

    return NextResponse.json<UseCoinResponse>({
      success: true,
      data: {
        transactionId: result.transaction_id || '',
        remainingBalance: result.new_balance,
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
