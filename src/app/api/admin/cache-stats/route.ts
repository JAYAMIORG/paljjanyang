import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getCacheStats } from '@/lib/cache/interpretation-cache'

export interface CacheStatsResponse {
  success: boolean
  data?: {
    totalEntries: number
    totalHits: number
    hitsByType: Record<string, number>
    estimatedSavingsUSD: number
  }
  error?: {
    code: string
    message: string
  }
}

// GPT-4o-mini 기준 예상 비용 (입력 토큰당)
const ESTIMATED_COST_PER_CALL_USD = 0.01 // 약 $0.01/call 가정

export async function GET() {
  try {
    const adminClient = createAdminClient()
    if (!adminClient) {
      return NextResponse.json<CacheStatsResponse>(
        {
          success: false,
          error: {
            code: 'CONFIG_ERROR',
            message: 'Admin client not configured',
          },
        },
        { status: 500 }
      )
    }

    const stats = await getCacheStats(adminClient)
    if (!stats) {
      return NextResponse.json<CacheStatsResponse>(
        {
          success: false,
          error: {
            code: 'STATS_ERROR',
            message: 'Failed to fetch cache stats',
          },
        },
        { status: 500 }
      )
    }

    // 캐시 히트로 절감한 비용 계산
    const estimatedSavingsUSD = stats.totalHits * ESTIMATED_COST_PER_CALL_USD

    return NextResponse.json<CacheStatsResponse>({
      success: true,
      data: {
        ...stats,
        estimatedSavingsUSD: Math.round(estimatedSavingsUSD * 100) / 100,
      },
    })
  } catch (error) {
    console.error('Cache stats error:', error)
    return NextResponse.json<CacheStatsResponse>(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Internal server error',
        },
      },
      { status: 500 }
    )
  }
}
