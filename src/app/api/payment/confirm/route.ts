import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { checkRateLimit, RATE_LIMITS, createRateLimitResponse } from '@/lib/utils'

export interface ConfirmPaymentRequest {
  paymentKey: string
  orderId: string
  amount: number
}

export interface ConfirmPaymentResponse {
  success: boolean
  data?: {
    balance: number
    coinsAdded: number
  }
  error?: {
    code: string
    message: string
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    if (!supabase) {
      return NextResponse.json<ConfirmPaymentResponse>(
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
      return NextResponse.json<ConfirmPaymentResponse>(
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

    // Rate Limit 체크 (결제 API - 분당 10회)
    const rateLimit = checkRateLimit(`payment:${user.id}`, RATE_LIMITS.payment)
    if (!rateLimit.allowed) {
      return createRateLimitResponse(rateLimit.resetTime)
    }

    const body: ConfirmPaymentRequest = await request.json()
    const { paymentKey, orderId, amount } = body

    if (!paymentKey || !orderId || !amount) {
      return NextResponse.json<ConfirmPaymentResponse>(
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

    // 결제 레코드 조회
    const { data: payment, error: paymentQueryError } = await supabase
      .from('payments')
      .select('*')
      .eq('external_order_id', orderId)
      .eq('user_id', user.id)
      .eq('status', 'pending')
      .single()

    if (paymentQueryError || !payment) {
      return NextResponse.json<ConfirmPaymentResponse>(
        {
          success: false,
          error: {
            code: 'PAYMENT_NOT_FOUND',
            message: '결제 정보를 찾을 수 없습니다.',
          },
        },
        { status: 400 }
      )
    }

    // 금액 검증
    if (payment.amount !== amount) {
      return NextResponse.json<ConfirmPaymentResponse>(
        {
          success: false,
          error: {
            code: 'AMOUNT_MISMATCH',
            message: '결제 금액이 일치하지 않습니다.',
          },
        },
        { status: 400 }
      )
    }

    // 토스페이먼츠 결제 승인 API 호출
    const tossSecretKey = process.env.TOSS_SECRET_KEY
    const isTestMode = process.env.PAYMENT_TEST_MODE === 'true'

    if (!tossSecretKey) {
      if (!isTestMode) {
        // 테스트 모드가 아닌데 API 키가 없으면 에러
        console.error('TOSS_SECRET_KEY not set and PAYMENT_TEST_MODE is not enabled')
        return NextResponse.json<ConfirmPaymentResponse>(
          {
            success: false,
            error: {
              code: 'CONFIG_ERROR',
              message: '결제 설정이 올바르지 않습니다.',
            },
          },
          { status: 500 }
        )
      }
      // 명시적 테스트 모드: 토스 API 없이 바로 승인 처리
      console.log('PAYMENT_TEST_MODE enabled, skipping Toss API verification')
    } else {
      // 실제 토스페이먼츠 API 호출
      const tossResponse = await fetch('https://api.tosspayments.com/v1/payments/confirm', {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${Buffer.from(tossSecretKey + ':').toString('base64')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          paymentKey,
          orderId,
          amount,
        }),
      })

      if (!tossResponse.ok) {
        const errorData = await tossResponse.json()
        console.error('Toss payment confirmation error:', errorData)

        // 결제 실패 처리
        await supabase
          .from('payments')
          .update({
            status: 'failed',
            failed_at: new Date().toISOString(),
            failure_reason: errorData.message || 'Payment confirmation failed',
          })
          .eq('id', payment.id)

        return NextResponse.json<ConfirmPaymentResponse>(
          {
            success: false,
            error: {
              code: 'PAYMENT_FAILED',
              message: errorData.message || '결제 승인에 실패했습니다.',
            },
          },
          { status: 400 }
        )
      }
    }

    // Admin client 생성 (RLS 우회 및 RPC 호출용)
    const adminClient = createAdminClient()
    if (!adminClient) {
      return NextResponse.json<ConfirmPaymentResponse>(
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

    // Atomic 결제 처리 (RPC 함수 사용)
    const { data: rpcResult, error: rpcError } = await adminClient
      .rpc('process_payment', {
        p_payment_id: payment.id,
        p_user_id: user.id,
        p_external_payment_id: paymentKey,
      })

    if (rpcError) {
      console.error('RPC process_payment error:', rpcError)

      // RPC 함수가 없는 경우 fallback (마이그레이션 실행 전)
      if (rpcError.code === 'PGRST202') {
        console.warn('process_payment RPC not found, using fallback logic')

        const coinsToAdd = Number(payment.coins_purchased)

        // 결제 상태 업데이트
        await adminClient
          .from('payments')
          .update({
            status: 'completed',
            external_payment_id: paymentKey,
            completed_at: new Date().toISOString(),
          })
          .eq('id', payment.id)

        // 코인 잔액 조회
        const { data: balanceData } = await adminClient
          .from('coin_balances')
          .select('balance')
          .eq('user_id', user.id)
          .single()

        const currentBalance = Number(balanceData?.balance || 0)
        const newBalance = currentBalance + coinsToAdd

        // 코인 잔액 업데이트
        await adminClient
          .from('coin_balances')
          .upsert({
            user_id: user.id,
            balance: newBalance,
            updated_at: new Date().toISOString(),
          })

        // 거래 내역 기록
        await adminClient
          .from('coin_transactions')
          .insert({
            user_id: user.id,
            type: 'purchase',
            amount: coinsToAdd,
            payment_id: payment.id,
            balance_before: currentBalance,
            balance_after: newBalance,
            description: '코인 충전',
          })

        return NextResponse.json<ConfirmPaymentResponse>({
          success: true,
          data: {
            balance: newBalance,
            coinsAdded: coinsToAdd,
          },
        })
      }

      return NextResponse.json<ConfirmPaymentResponse>(
        {
          success: false,
          error: {
            code: 'RPC_ERROR',
            message: '결제 처리 중 오류가 발생했습니다.',
          },
        },
        { status: 500 }
      )
    }

    // RPC 결과 처리
    const result = rpcResult?.[0]

    if (!result || !result.success) {
      const errorMessage = result?.error_message || '결제 처리에 실패했습니다.'

      return NextResponse.json<ConfirmPaymentResponse>(
        {
          success: false,
          error: {
            code: 'PAYMENT_PROCESS_ERROR',
            message: errorMessage,
          },
        },
        { status: 400 }
      )
    }

    return NextResponse.json<ConfirmPaymentResponse>({
      success: true,
      data: {
        balance: result.new_balance,
        coinsAdded: result.coins_added,
      },
    })
  } catch (error) {
    console.error('Payment confirmation error:', error)
    return NextResponse.json<ConfirmPaymentResponse>(
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
