import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export interface InitiatePaymentRequest {
  packageId: string
}

export interface InitiatePaymentResponse {
  success: boolean
  data?: {
    orderId: string
    amount: number
    orderName: string
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
      return NextResponse.json<InitiatePaymentResponse>(
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
      return NextResponse.json<InitiatePaymentResponse>(
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

    const body: InitiatePaymentRequest = await request.json()
    const { packageId } = body

    if (!packageId) {
      return NextResponse.json<InitiatePaymentResponse>(
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
      return NextResponse.json<InitiatePaymentResponse>(
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

    // 주문 ID 생성 (고유값)
    const orderId = `ORDER_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
    const totalCoins = Number(packageData.coins) + Number(packageData.bonus_coins || 0)

    // 결제 레코드 생성 (pending 상태)
    const { data: payment, error: paymentError } = await supabase
      .from('payments')
      .insert({
        user_id: user.id,
        amount: packageData.price,
        package_id: packageId,
        coins_purchased: totalCoins,
        external_order_id: orderId,
        status: 'pending',
      })
      .select('id')
      .single()

    if (paymentError || !payment) {
      console.error('Payment creation error:', paymentError)
      return NextResponse.json<InitiatePaymentResponse>(
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

    return NextResponse.json<InitiatePaymentResponse>({
      success: true,
      data: {
        orderId,
        amount: packageData.price,
        orderName: `팔자냥 ${packageData.name}`,
      },
    })
  } catch (error) {
    console.error('Payment initiation error:', error)
    return NextResponse.json<InitiatePaymentResponse>(
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
