import { NextResponse } from 'next/server'
import { openaiRateLimiter } from '@/lib/llm/rate-limiter'
import { createAdminClient } from '@/lib/supabase/admin'
import { getCacheStats } from '@/lib/cache/interpretation-cache'

export interface SystemStatusResponse {
  success: boolean
  data?: {
    timestamp: string
    rateLimiter: {
      activeRequests: number
      queueLength: number
      maxConcurrent: number
    }
    cache: {
      totalEntries: number
      totalHits: number
      hitRate: string
      estimatedSavingsUSD: number
    } | null
    health: 'healthy' | 'degraded' | 'unhealthy'
  }
  error?: {
    code: string
    message: string
  }
}

// 예상 비용 (call 당)
const ESTIMATED_COST_PER_CALL_USD = 0.01

export async function GET() {
  try {
    // 레이트 리미터 상태
    const rateLimiterStatus = openaiRateLimiter.getStatus()

    // 캐시 통계
    let cacheData = null
    const adminClient = createAdminClient()
    if (adminClient) {
      const stats = await getCacheStats(adminClient)
      if (stats) {
        const totalRequests = stats.totalEntries + stats.totalHits
        const hitRate = totalRequests > 0
          ? ((stats.totalHits / totalRequests) * 100).toFixed(1)
          : '0.0'

        cacheData = {
          totalEntries: stats.totalEntries,
          totalHits: stats.totalHits,
          hitRate: `${hitRate}%`,
          estimatedSavingsUSD: Math.round(stats.totalHits * ESTIMATED_COST_PER_CALL_USD * 100) / 100,
        }
      }
    }

    // 시스템 건강 상태 판단
    let health: 'healthy' | 'degraded' | 'unhealthy' = 'healthy'

    // 큐 길이가 100개 이상이면 degraded
    if (rateLimiterStatus.queueLength > 100) {
      health = 'degraded'
    }

    // 큐 길이가 500개 이상이면 unhealthy
    if (rateLimiterStatus.queueLength > 500) {
      health = 'unhealthy'
    }

    return NextResponse.json<SystemStatusResponse>({
      success: true,
      data: {
        timestamp: new Date().toISOString(),
        rateLimiter: rateLimiterStatus,
        cache: cacheData,
        health,
      },
    })
  } catch (error) {
    console.error('Status check error:', error)
    return NextResponse.json<SystemStatusResponse>(
      {
        success: false,
        error: {
          code: 'STATUS_ERROR',
          message: 'Failed to get system status',
        },
      },
      { status: 500 }
    )
  }
}
