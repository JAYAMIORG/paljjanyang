import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export interface RefundCoinRequest {
  type: 'personal' | 'yearly' | 'compatibility' | 'love'
  reason: string
}

export interface RefundCoinResponse {
  success: boolean
  data?: {
    transactionId: string
    newBalance: number
  }
  error?: {
    code: string
    message: string
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()

    if (!supabase) {
      return NextResponse.json<RefundCoinResponse>(
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
      return NextResponse.json<RefundCoinResponse>(
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

    const body: RefundCoinRequest = await request.json()
    const { type, reason } = body

    if (!type || !reason) {
      return NextResponse.json<RefundCoinResponse>(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: '필수 정보가 누락되었습니다.',
          },
        },
        { status: 400 }
      )
    }

    // Admin client 생성 (RLS 우회)
    const adminClient = createAdminClient()
    if (!adminClient) {
      return NextResponse.json<RefundCoinResponse>(
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

    const refundAmount = 1
    const description = `${typeKorean[type]} 환불 (${reason})`

    // Atomic 코인 환불 (RPC 함수 사용)
    const { data: rpcResult, error: rpcError } = await adminClient
      .rpc('refund_coin', {
        p_user_id: user.id,
        p_amount: refundAmount,
        p_description: description,
      })

    if (rpcError) {
      console.error('RPC refund_coin error:', rpcError)

      // RPC 함수가 없는 경우 fallback (마이그레이션 실행 전)
      if (rpcError.code === 'PGRST202') {
        console.warn('refund_coin RPC not found, using fallback logic')

        const { data: balanceData } = await adminClient
          .from('coin_balances')
          .select('balance')
          .eq('user_id', user.id)
          .single()

        const currentBalance = Number(balanceData?.balance ?? 0)
        const newBalance = currentBalance + refundAmount

        await adminClient
          .from('coin_balances')
          .upsert({
            user_id: user.id,
            balance: newBalance,
            updated_at: new Date().toISOString(),
          })

        const { data: txData } = await adminClient
          .from('coin_transactions')
          .insert({
            user_id: user.id,
            type: 'refund',
            amount: refundAmount,
            balance_before: currentBalance,
            balance_after: newBalance,
            description,
          })
          .select('id')
          .single()

        return NextResponse.json<RefundCoinResponse>({
          success: true,
          data: {
            transactionId: txData?.id || '',
            newBalance,
          },
        })
      }

      return NextResponse.json<RefundCoinResponse>(
        {
          success: false,
          error: {
            code: 'RPC_ERROR',
            message: '코인 환불 중 오류가 발생했습니다.',
          },
        },
        { status: 500 }
      )
    }

    // RPC 결과 처리
    const result = rpcResult?.[0]

    if (!result || !result.success) {
      const errorMessage = result?.error_message || '코인 환불에 실패했습니다.'

      return NextResponse.json<RefundCoinResponse>(
        {
          success: false,
          error: {
            code: 'REFUND_ERROR',
            message: errorMessage,
          },
        },
        { status: 400 }
      )
    }

    return NextResponse.json<RefundCoinResponse>({
      success: true,
      data: {
        transactionId: result.transaction_id || '',
        newBalance: result.new_balance,
      },
    })

  } catch (error) {
    console.error('Refund coin error:', error)
    return NextResponse.json<RefundCoinResponse>(
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
