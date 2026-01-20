import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export interface KakaoPayCancelRequest {
  paymentId: string
  cancelAmount?: number // 부분 취소 시 사용
  cancelReason?: string
}

export interface KakaoPayCancelResponse {
  success: boolean
  data?: {
    cancelledAmount: number
    refundedCoins: number
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
      return NextResponse.json<KakaoPayCancelResponse>(
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
      return NextResponse.json<KakaoPayCancelResponse>(
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

    const body: KakaoPayCancelRequest = await request.json()
    const { paymentId, cancelReason } = body

    if (!paymentId) {
      return NextResponse.json<KakaoPayCancelResponse>(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: '결제 ID가 필요합니다.',
          },
        },
        { status: 400 }
      )
    }

    // Admin 클라이언트 생성 (RLS 우회)
    const adminClient = createAdminClient()
    if (!adminClient) {
      return NextResponse.json<KakaoPayCancelResponse>(
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

    // 결제 정보 조회
    const { data: payment, error: paymentError } = await adminClient
      .from('payments')
      .select('*')
      .eq('id', paymentId)
      .eq('user_id', user.id)
      .eq('status', 'completed')
      .single()

    if (paymentError || !payment) {
      return NextResponse.json<KakaoPayCancelResponse>(
        {
          success: false,
          error: {
            code: 'PAYMENT_NOT_FOUND',
            message: '취소 가능한 결제를 찾을 수 없습니다.',
          },
        },
        { status: 404 }
      )
    }

    // 결제 후 7일 이내인지 확인
    const paymentDate = new Date(payment.completed_at || payment.created_at)
    const now = new Date()
    const daysDiff = Math.floor((now.getTime() - paymentDate.getTime()) / (1000 * 60 * 60 * 24))

    if (daysDiff > 7) {
      return NextResponse.json<KakaoPayCancelResponse>(
        {
          success: false,
          error: {
            code: 'REFUND_PERIOD_EXPIRED',
            message: '결제 후 7일이 경과하여 환불이 불가능합니다.',
          },
        },
        { status: 400 }
      )
    }

    // 코인 사용 여부 확인 (해당 결제로 충전된 코인이 사용되었는지)
    const { data: transactions } = await adminClient
      .from('coin_transactions')
      .select('amount, type')
      .eq('user_id', user.id)
      .eq('payment_id', paymentId)

    const purchasedCoins = transactions
      ?.filter(t => t.type === 'purchase')
      .reduce((sum, t) => sum + Number(t.amount), 0) || 0

    // 현재 잔액 확인
    const { data: balanceData } = await adminClient
      .from('coin_balances')
      .select('balance')
      .eq('user_id', user.id)
      .single()

    const currentBalance = Number(balanceData?.balance || 0)

    // 환불할 코인보다 현재 잔액이 적으면 사용한 것으로 판단
    if (currentBalance < purchasedCoins) {
      return NextResponse.json<KakaoPayCancelResponse>(
        {
          success: false,
          error: {
            code: 'COINS_ALREADY_USED',
            message: '충전한 코인이 이미 사용되어 환불이 불가능합니다.',
          },
        },
        { status: 400 }
      )
    }

    const kakaoAdminKey = process.env.KAKAO_ADMIN_KEY

    // 실제 카카오페이 취소 API 호출 (KAKAO_ADMIN_KEY가 있는 경우)
    if (kakaoAdminKey && payment.external_payment_id) {
      const kakaoParams = new URLSearchParams({
        cid: process.env.KAKAO_CID || 'TC0ONETIME',
        tid: payment.external_payment_id,
        cancel_amount: String(payment.amount),
        cancel_tax_free_amount: '0',
      })

      const kakaoResponse = await fetch('https://kapi.kakao.com/v1/payment/cancel', {
        method: 'POST',
        headers: {
          'Authorization': `KakaoAK ${kakaoAdminKey}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: kakaoParams.toString(),
      })

      if (!kakaoResponse.ok) {
        const errorData = await kakaoResponse.json()
        console.error('KakaoPay cancel error:', errorData)
        return NextResponse.json<KakaoPayCancelResponse>(
          {
            success: false,
            error: {
              code: 'KAKAOPAY_CANCEL_ERROR',
              message: '카카오페이 결제 취소에 실패했습니다.',
            },
          },
          { status: 500 }
        )
      }
    }

    // 코인 차감
    const newBalance = currentBalance - purchasedCoins

    await adminClient
      .from('coin_balances')
      .update({
        balance: newBalance,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', user.id)

    // 환불 거래 내역 추가
    await adminClient
      .from('coin_transactions')
      .insert({
        user_id: user.id,
        amount: -purchasedCoins,
        type: 'refund',
        description: cancelReason || '결제 취소 환불',
        payment_id: paymentId,
        balance_before: currentBalance,
        balance_after: newBalance,
      })

    // 결제 상태 업데이트
    await adminClient
      .from('payments')
      .update({
        status: 'refunded',
        failure_reason: cancelReason || '사용자 요청에 의한 환불',
      })
      .eq('id', paymentId)

    return NextResponse.json<KakaoPayCancelResponse>({
      success: true,
      data: {
        cancelledAmount: payment.amount,
        refundedCoins: purchasedCoins,
      },
    })
  } catch (error) {
    console.error('KakaoPay cancel error:', error)
    return NextResponse.json<KakaoPayCancelResponse>(
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
