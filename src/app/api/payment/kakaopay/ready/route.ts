import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export interface KakaoPayReadyRequest {
  packageId: string
}

export interface KakaoPayReadyResponse {
  success: boolean
  data?: {
    tid: string
    next_redirect_pc_url: string
    next_redirect_mobile_url: string
    next_redirect_app_url: string
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
      return NextResponse.json<KakaoPayReadyResponse>(
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
      return NextResponse.json<KakaoPayReadyResponse>(
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

    const body: KakaoPayReadyRequest = await request.json()
    const { packageId } = body

    if (!packageId) {
      return NextResponse.json<KakaoPayReadyResponse>(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: '패키지를 선택해주세요.',
          },
        },
        { status: 400 }
      )
    }

    // 패키지 조회
    const { data: packageData, error: packageError } = await supabase
      .from('coin_packages')
      .select('*')
      .eq('id', packageId)
      .eq('is_active', true)
      .single()

    if (packageError || !packageData) {
      console.error('Package query error:', packageError, 'packageId:', packageId)
      return NextResponse.json<KakaoPayReadyResponse>(
        {
          success: false,
          error: {
            code: 'PACKAGE_NOT_FOUND',
            message: '유효하지 않은 패키지입니다.',
          },
        },
        { status: 400 }
      )
    }

    console.log('Package found:', packageData)

    // 주문 ID 생성
    const orderId = `KAKAO_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
    const totalCoins = Number(packageData.coins) + Number(packageData.bonus_coins || 0)

    // 카카오페이 Admin Key 확인
    const kakaoAdminKey = process.env.KAKAO_ADMIN_KEY
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'

    // 결제 레코드 생성 (pending 상태) - 테스트/실제 모두 필요
    // Admin 클라이언트 사용 (RLS 우회)
    const adminClient = createAdminClient()
    if (!adminClient) {
      console.error('Admin client creation failed - check SUPABASE_SERVICE_ROLE_KEY')
      return NextResponse.json<KakaoPayReadyResponse>(
        {
          success: false,
          error: {
            code: 'CONFIG_ERROR',
            message: '서버 설정 오류입니다. (Admin client)',
          },
        },
        { status: 500 }
      )
    }
    console.log('Admin client created successfully')

    const paymentData = {
      user_id: user.id,
      amount: packageData.price,
      package_id: packageId,
      coins_purchased: totalCoins,
      external_order_id: orderId,
      method: 'kakao' as const,
      status: 'pending' as const,
    }
    console.log('Creating payment:', JSON.stringify(paymentData, null, 2))

    const { data: insertedPayment, error: paymentError } = await adminClient
      .from('payments')
      .insert(paymentData)
      .select()

    console.log('Insert result:', { insertedPayment, paymentError })

    if (paymentError) {
      console.error('Payment creation error:', JSON.stringify(paymentError, null, 2))
      return NextResponse.json<KakaoPayReadyResponse>(
        {
          success: false,
          error: {
            code: 'DB_ERROR',
            message: '결제 정보 생성에 실패했습니다.',
          },
        },
        { status: 500 }
      )
    }

    // 테스트 모드: KAKAO_ADMIN_KEY 없으면 바로 approve로 리다이렉트
    if (!kakaoAdminKey) {
      const testTid = `test_tid_${Date.now()}`

      // TID 저장 (admin 클라이언트 사용)
      await adminClient
        .from('payments')
        .update({ external_payment_id: testTid })
        .eq('external_order_id', orderId)

      return NextResponse.json<KakaoPayReadyResponse>({
        success: true,
        data: {
          tid: testTid,
          next_redirect_pc_url: `${baseUrl}/api/payment/kakaopay/approve?partner_order_id=${orderId}&pg_token=test_token`,
          next_redirect_mobile_url: `${baseUrl}/api/payment/kakaopay/approve?partner_order_id=${orderId}&pg_token=test_token`,
          next_redirect_app_url: `${baseUrl}/api/payment/kakaopay/approve?partner_order_id=${orderId}&pg_token=test_token`,
        },
      })
    }

    // 카카오페이 Ready API 호출
    const kakaoParams = new URLSearchParams({
      cid: process.env.KAKAO_CID || 'TC0ONETIME', // 테스트용 CID
      partner_order_id: orderId,
      partner_user_id: user.id,
      item_name: `팔자냥 ${packageData.name}`,
      quantity: '1',
      total_amount: String(packageData.price),
      tax_free_amount: '0',
      approval_url: `${baseUrl}/api/payment/kakaopay/approve?partner_order_id=${orderId}`,
      cancel_url: `${baseUrl}/payment/fail?reason=cancel`,
      fail_url: `${baseUrl}/payment/fail?reason=fail`,
    })

    const kakaoResponse = await fetch('https://kapi.kakao.com/v1/payment/ready', {
      method: 'POST',
      headers: {
        'Authorization': `KakaoAK ${kakaoAdminKey}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: kakaoParams.toString(),
    })

    if (!kakaoResponse.ok) {
      const errorData = await kakaoResponse.json()
      console.error('KakaoPay ready error:', errorData)
      return NextResponse.json<KakaoPayReadyResponse>(
        {
          success: false,
          error: {
            code: 'KAKAOPAY_ERROR',
            message: '카카오페이 결제 준비에 실패했습니다.',
          },
        },
        { status: 500 }
      )
    }

    const kakaoData = await kakaoResponse.json()

    // TID 저장 (approve 시 필요) - admin 클라이언트 사용
    await adminClient
      .from('payments')
      .update({ external_payment_id: kakaoData.tid })
      .eq('external_order_id', orderId)

    return NextResponse.json<KakaoPayReadyResponse>({
      success: true,
      data: {
        tid: kakaoData.tid,
        next_redirect_pc_url: kakaoData.next_redirect_pc_url,
        next_redirect_mobile_url: kakaoData.next_redirect_mobile_url,
        next_redirect_app_url: kakaoData.next_redirect_app_url,
      },
    })
  } catch (error) {
    console.error('KakaoPay ready error:', error)
    return NextResponse.json<KakaoPayReadyResponse>(
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
