import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export interface CoinPackage {
  id: string
  name: string
  coins: number
  price: number
  bonusCoins: number
  totalCoins: number
}

export interface PackagesResponse {
  success: boolean
  data?: {
    packages: CoinPackage[]
  }
  error?: {
    code: string
    message: string
  }
}

export async function GET() {
  try {
    const supabase = await createClient()

    if (!supabase) {
      // Supabase 미설정 시 기본 패키지 반환
      return NextResponse.json<PackagesResponse>({
        success: true,
        data: {
          packages: [
            { id: '1', name: '1 코인', coins: 1, price: 880, bonusCoins: 0, totalCoins: 1 },
            { id: '2', name: '5 코인', coins: 5, price: 3900, bonusCoins: 0.5, totalCoins: 5.5 },
            { id: '3', name: '10 코인', coins: 10, price: 6900, bonusCoins: 2, totalCoins: 12 },
          ],
        },
      })
    }

    // 코인 패키지 조회
    const { data: packages, error } = await supabase
      .from('coin_packages')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true })

    if (error) {
      console.error('Packages fetch error:', error)
      // 에러 시 기본 패키지 반환
      return NextResponse.json<PackagesResponse>({
        success: true,
        data: {
          packages: [
            { id: '1', name: '1 코인', coins: 1, price: 880, bonusCoins: 0, totalCoins: 1 },
            { id: '2', name: '5 코인', coins: 5, price: 3900, bonusCoins: 0.5, totalCoins: 5.5 },
            { id: '3', name: '10 코인', coins: 10, price: 6900, bonusCoins: 2, totalCoins: 12 },
          ],
        },
      })
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const formattedPackages: CoinPackage[] = (packages || []).map((p: any) => ({
      id: p.id,
      name: p.name,
      coins: Number(p.coins),
      price: Number(p.price),
      bonusCoins: Number(p.bonus_coins || 0),
      totalCoins: Number(p.coins) + Number(p.bonus_coins || 0),
    }))

    return NextResponse.json<PackagesResponse>({
      success: true,
      data: {
        packages: formattedPackages,
      },
    })
  } catch (error) {
    console.error('Packages fetch error:', error)
    return NextResponse.json<PackagesResponse>(
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
