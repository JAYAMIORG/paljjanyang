/**
 * 인메모리 Rate Limiter
 *
 * 주의: Vercel Serverless Functions에서는 인스턴스가 공유되지 않을 수 있으므로
 * 프로덕션에서는 Redis 같은 외부 저장소 사용을 권장합니다.
 * 이 구현은 단일 서버 또는 개발 환경에서 유효합니다.
 */

interface RateLimitEntry {
  count: number
  resetTime: number
}

interface RateLimitConfig {
  /** 최대 요청 횟수 */
  limit: number
  /** 윈도우 기간 (밀리초) */
  windowMs: number
}

// 인메모리 저장소
const rateLimitStore = new Map<string, RateLimitEntry>()

// 주기적으로 만료된 항목 정리 (메모리 누수 방지)
let cleanupInterval: NodeJS.Timeout | null = null

function startCleanup() {
  if (cleanupInterval) return

  cleanupInterval = setInterval(() => {
    const now = Date.now()
    for (const [key, entry] of rateLimitStore.entries()) {
      if (entry.resetTime < now) {
        rateLimitStore.delete(key)
      }
    }
  }, 60000) // 1분마다 정리
}

/**
 * Rate Limit 체크 함수
 * @param identifier - 사용자 식별자 (IP, userId 등)
 * @param config - Rate Limit 설정
 * @returns 허용 여부와 남은 요청 횟수
 */
export function checkRateLimit(
  identifier: string,
  config: RateLimitConfig
): { allowed: boolean; remaining: number; resetTime: number } {
  startCleanup()

  const now = Date.now()
  const key = identifier
  const entry = rateLimitStore.get(key)

  // 기존 항목이 없거나 윈도우가 만료된 경우
  if (!entry || entry.resetTime < now) {
    const newEntry: RateLimitEntry = {
      count: 1,
      resetTime: now + config.windowMs,
    }
    rateLimitStore.set(key, newEntry)
    return {
      allowed: true,
      remaining: config.limit - 1,
      resetTime: newEntry.resetTime,
    }
  }

  // 아직 윈도우 내에 있는 경우
  if (entry.count >= config.limit) {
    return {
      allowed: false,
      remaining: 0,
      resetTime: entry.resetTime,
    }
  }

  // 카운트 증가
  entry.count++
  rateLimitStore.set(key, entry)

  return {
    allowed: true,
    remaining: config.limit - entry.count,
    resetTime: entry.resetTime,
  }
}

/**
 * 기본 Rate Limit 설정들
 */
export const RATE_LIMITS = {
  /** 일반 API - 분당 60회 */
  default: { limit: 60, windowMs: 60 * 1000 },
  /** 인증 API (로그인 등) - 분당 10회 */
  auth: { limit: 10, windowMs: 60 * 1000 },
  /** LLM API (비용이 많이 드는 API) - 분당 5회 */
  llm: { limit: 5, windowMs: 60 * 1000 },
  /** 결제 API - 분당 10회 */
  payment: { limit: 10, windowMs: 60 * 1000 },
  /** 공유 보상 - 시간당 10회 */
  shareReward: { limit: 10, windowMs: 60 * 60 * 1000 },
} as const

/**
 * 클라이언트 IP 추출 헬퍼
 */
export function getClientIp(request: Request): string {
  // Vercel/Cloudflare 등에서 설정하는 헤더 우선
  const forwardedFor = request.headers.get('x-forwarded-for')
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim()
  }

  const realIp = request.headers.get('x-real-ip')
  if (realIp) {
    return realIp
  }

  // 기본값
  return 'unknown'
}

/**
 * Rate Limit 응답 생성 헬퍼
 */
export function createRateLimitResponse(resetTime: number) {
  const retryAfter = Math.ceil((resetTime - Date.now()) / 1000)

  return new Response(
    JSON.stringify({
      success: false,
      error: {
        code: 'RATE_LIMIT_EXCEEDED',
        message: '요청이 너무 많습니다. 잠시 후 다시 시도해주세요.',
        retryAfter,
      },
    }),
    {
      status: 429,
      headers: {
        'Content-Type': 'application/json',
        'Retry-After': retryAfter.toString(),
        'X-RateLimit-Reset': new Date(resetTime).toISOString(),
      },
    }
  )
}
