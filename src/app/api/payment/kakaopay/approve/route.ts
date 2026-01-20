import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const pgToken = searchParams.get('pg_token')
    const partnerOrderId = searchParams.get('partner_order_id')
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'

    if (!pgToken || !partnerOrderId) {
      return NextResponse.redirect(`${baseUrl}/payment/fail?reason=invalid_params`)
    }

    const supabase = await createClient()

    if (!supabase) {
      return NextResponse.redirect(`${baseUrl}/payment/fail?reason=config_error`)
    }

    // 인증 확인
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.redirect(`${baseUrl}/payment/fail?reason=unauthorized`)
    }

    // Admin 클라이언트 생성 (RLS 우회)
    const adminClient = createAdminClient()
    if (!adminClient) {
      return NextResponse.redirect(`${baseUrl}/payment/fail?reason=config_error`)
    }

    // 결제 정보 조회 (admin 클라이언트 사용)
    const { data: payment, error: paymentError } = await adminClient
      .from('payments')
      .select('*')
      .eq('external_order_id', partnerOrderId)
      .eq('user_id', user.id)
      .eq('status', 'pending')
      .single()

    if (paymentError || !payment) {
      console.error('Payment not found:', paymentError)
      return NextResponse.redirect(`${baseUrl}/payment/fail?reason=payment_not_found`)
    }

    const kakaoAdminKey = process.env.KAKAO_ADMIN_KEY

    if (!kakaoAdminKey) {
      // 테스트 모드: 바로 성공 처리
      // 코인 잔액 조회
      const { data: currentBalance } = await adminClient
        .from('coin_balances')
        .select('balance')
        .eq('user_id', user.id)
        .single()

      const balanceBefore = Number(currentBalance?.balance || 0)
      const coinsToAdd = Number(payment.coins_purchased)
      const newBalance = balanceBefore + coinsToAdd

      // 코인 잔액 업데이트
      await adminClient
        .from('coin_balances')
        .upsert({
          user_id: user.id,
          balance: newBalance,
          updated_at: new Date().toISOString(),
        })

      // 코인 거래 내역 추가
      await adminClient
        .from('coin_transactions')
        .insert({
          user_id: user.id,
          amount: coinsToAdd,
          type: 'purchase',
          description: `카카오페이 충전 (테스트)`,
          payment_id: payment.id,
          balance_before: balanceBefore,
          balance_after: newBalance,
        })

      // 결제 상태 업데이트
      await adminClient
        .from('payments')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString(),
        })
        .eq('id', payment.id)

      return NextResponse.redirect(
        `${baseUrl}/payment/success?paymentType=kakaopay&orderId=${partnerOrderId}&amount=${payment.amount}&coins=${coinsToAdd}&balance=${newBalance}`
      )
    }

    // 카카오페이 Approve API 호출
    const kakaoResponse = await fetch('https://kapi.kakao.com/v1/payment/approve', {
      method: 'POST',
      headers: {
        'Authorization': `KakaoAK ${kakaoAdminKey}`,
        'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
      },
      body: new URLSearchParams({
        cid: process.env.KAKAO_CID || 'TC0ONETIME',
        tid: payment.external_payment_id,
        partner_order_id: partnerOrderId,
        partner_user_id: user.id,
        pg_token: pgToken,
      }),
    })

    if (!kakaoResponse.ok) {
      const errorData = await kakaoResponse.json()
      console.error('KakaoPay approve error:', errorData)
      return NextResponse.redirect(`${baseUrl}/payment/fail?reason=kakaopay_error`)
    }

    const kakaoData = await kakaoResponse.json()

    // 코인 잔액 조회
    const { data: currentBalance } = await adminClient
      .from('coin_balances')
      .select('balance')
      .eq('user_id', user.id)
      .single()

    const balanceBefore = Number(currentBalance?.balance || 0)
    const coinsToAdd = Number(payment.coins_purchased)
    const newBalance = balanceBefore + coinsToAdd

    // 코인 잔액 업데이트
    await adminClient
      .from('coin_balances')
      .upsert({
        user_id: user.id,
        balance: newBalance,
        updated_at: new Date().toISOString(),
      })

    // 코인 거래 내역 추가
    await adminClient
      .from('coin_transactions')
      .insert({
        user_id: user.id,
        amount: coinsToAdd,
        type: 'purchase',
        description: `카카오페이 충전`,
        payment_id: payment.id,
        balance_before: balanceBefore,
        balance_after: newBalance,
      })

    // 결제 상태 업데이트
    await adminClient
      .from('payments')
      .update({
        status: 'completed',
        external_payment_id: kakaoData.tid,
        completed_at: new Date().toISOString(),
      })
      .eq('id', payment.id)

    return NextResponse.redirect(
      `${baseUrl}/payment/success?paymentType=kakaopay&orderId=${partnerOrderId}&amount=${payment.amount}&coins=${coinsToAdd}&balance=${newBalance}`
    )
  } catch (error) {
    console.error('KakaoPay approve error:', error)
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
    return NextResponse.redirect(`${baseUrl}/payment/fail?reason=internal_error`)
  }
}
