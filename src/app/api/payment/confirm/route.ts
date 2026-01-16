import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

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
    if (!tossSecretKey) {
      // 테스트 모드: 토스 API 없이 바로 승인 처리
      console.log('TOSS_SECRET_KEY not set, using test mode')
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

    // 결제 성공 처리
    const coinsToAdd = Number(payment.coins_purchased)

    // 결제 상태 업데이트
    await supabase
      .from('payments')
      .update({
        status: 'completed',
        external_payment_id: paymentKey,
        completed_at: new Date().toISOString(),
      })
      .eq('id', payment.id)

    // 코인 잔액 조회
    const { data: balanceData } = await supabase
      .from('coin_balances')
      .select('balance')
      .eq('user_id', user.id)
      .single()

    const currentBalance = Number(balanceData?.balance || 0)
    const newBalance = currentBalance + coinsToAdd

    // 코인 잔액 업데이트 (없으면 생성)
    await supabase
      .from('coin_balances')
      .upsert({
        user_id: user.id,
        balance: newBalance,
        updated_at: new Date().toISOString(),
      })

    // 거래 내역 기록
    await supabase
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
