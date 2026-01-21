import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const pgToken = searchParams.get('pg_token')
    const partnerOrderId = searchParams.get('partner_order_id')
    // Vercel 자동 감지: NEXT_PUBLIC_BASE_URL > VERCEL_URL > localhost
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL
      || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null)
      || 'http://localhost:3000'

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

    let externalPaymentId: string | null = null

    if (!kakaoAdminKey) {
      // KAKAO_ADMIN_KEY 없으면 테스트 모드 (ready 라우트와 동일한 로직)
      console.log('KAKAO_ADMIN_KEY not set, using test mode')
    } else {
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
      externalPaymentId = kakaoData.tid
    }

    // Atomic 결제 처리 (RPC 함수 사용)
    const { data: rpcResult, error: rpcError } = await adminClient
      .rpc('process_payment', {
        p_payment_id: payment.id,
        p_user_id: user.id,
        p_external_payment_id: externalPaymentId,
      })

    if (rpcError) {
      console.error('RPC process_payment error:', JSON.stringify(rpcError))

      // RPC 함수가 없거나 에러 발생 시 fallback (마이그레이션 실행 전)
      // PGRST202: function not found, 42883: undefined function, 22P02: invalid enum value
      if (rpcError.code === 'PGRST202' || rpcError.code === '42883' || rpcError.code === '22P02' || rpcError.message?.includes('function')) {
        console.warn('process_payment RPC not found or error, using fallback logic')

        const { data: currentBalance } = await adminClient
          .from('coin_balances')
          .select('balance')
          .eq('user_id', user.id)
          .single()

        const balanceBefore = Number(currentBalance?.balance || 0)
        const coinsToAdd = Number(payment.coins_purchased)
        const newBalance = balanceBefore + coinsToAdd

        await adminClient
          .from('coin_balances')
          .upsert({
            user_id: user.id,
            balance: newBalance,
            updated_at: new Date().toISOString(),
          })

        await adminClient
          .from('coin_transactions')
          .insert({
            user_id: user.id,
            amount: coinsToAdd,
            type: 'purchase',
            description: '카카오페이 충전',
            payment_id: payment.id,
            balance_before: balanceBefore,
            balance_after: newBalance,
          })

        await adminClient
          .from('payments')
          .update({
            status: 'completed',
            external_payment_id: externalPaymentId || payment.external_payment_id,
            completed_at: new Date().toISOString(),
          })
          .eq('id', payment.id)

        return NextResponse.redirect(
          `${baseUrl}/payment/success?paymentType=kakaopay&orderId=${partnerOrderId}&amount=${payment.amount}&coins=${coinsToAdd}&balance=${newBalance}`
        )
      }

      return NextResponse.redirect(`${baseUrl}/payment/fail?reason=rpc_error`)
    }

    // RPC 결과 처리
    const result = rpcResult?.[0]

    if (!result || !result.success) {
      console.error('RPC process_payment failed:', result?.error_message)
      return NextResponse.redirect(`${baseUrl}/payment/fail?reason=process_error`)
    }

    return NextResponse.redirect(
      `${baseUrl}/payment/success?paymentType=kakaopay&orderId=${partnerOrderId}&amount=${payment.amount}&coins=${result.coins_added}&balance=${result.new_balance}`
    )
  } catch (error) {
    console.error('KakaoPay approve error:', error)
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL
      || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null)
      || 'http://localhost:3000'
    return NextResponse.redirect(`${baseUrl}/payment/fail?reason=internal_error`)
  }
}
