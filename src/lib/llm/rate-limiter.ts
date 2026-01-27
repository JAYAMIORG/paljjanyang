/**
 * OpenAI API 레이트 리미터
 *
 * 동시 요청 수를 제한하고, 레이트 리밋 에러 시 자동 재시도
 */

interface QueuedRequest<T> {
  execute: () => Promise<T>
  resolve: (value: T) => void
  reject: (error: Error) => void
  retries: number
}

class OpenAIRateLimiter {
  private queue: QueuedRequest<unknown>[] = []
  private activeRequests = 0
  private readonly maxConcurrent: number
  private readonly maxRetries: number
  private readonly baseDelay: number

  constructor(options: {
    maxConcurrent?: number
    maxRetries?: number
    baseDelay?: number
  } = {}) {
    // Tier 2 기준: 5000 RPM = ~83 RPS, 안전하게 50 동시 요청으로 제한
    this.maxConcurrent = options.maxConcurrent ?? 50
    this.maxRetries = options.maxRetries ?? 3
    this.baseDelay = options.baseDelay ?? 1000 // 1초
  }

  /**
   * 레이트 리밋을 적용하여 요청 실행
   */
  async execute<T>(fn: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      this.queue.push({
        execute: fn as () => Promise<unknown>,
        resolve: resolve as (value: unknown) => void,
        reject,
        retries: 0,
      })
      this.processQueue()
    })
  }

  private async processQueue(): Promise<void> {
    if (this.activeRequests >= this.maxConcurrent || this.queue.length === 0) {
      return
    }

    const request = this.queue.shift()
    if (!request) return

    this.activeRequests++

    try {
      const result = await request.execute()
      request.resolve(result)
    } catch (error) {
      const isRateLimitError = this.isRateLimitError(error)

      if (isRateLimitError && request.retries < this.maxRetries) {
        // 레이트 리밋 에러: 지수 백오프 후 재시도
        const delay = this.baseDelay * Math.pow(2, request.retries)

        await this.sleep(delay)
        request.retries++
        this.queue.unshift(request) // 큐 앞에 다시 추가
      } else {
        request.reject(error as Error)
      }
    } finally {
      this.activeRequests--
      // 다음 요청 처리
      setImmediate(() => this.processQueue())
    }
  }

  private isRateLimitError(error: unknown): boolean {
    if (error instanceof Error) {
      const message = error.message.toLowerCase()
      return (
        message.includes('rate limit') ||
        message.includes('rate_limit') ||
        message.includes('too many requests') ||
        message.includes('429')
      )
    }
    return false
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  /**
   * 현재 상태 조회 (모니터링용)
   */
  getStatus(): {
    activeRequests: number
    queueLength: number
    maxConcurrent: number
  } {
    return {
      activeRequests: this.activeRequests,
      queueLength: this.queue.length,
      maxConcurrent: this.maxConcurrent,
    }
  }
}

// 싱글톤 인스턴스 (Vercel 환경에서는 함수 인스턴스마다 새로 생성될 수 있음)
// 하지만 동일 인스턴스 내에서는 공유됨
export const openaiRateLimiter = new OpenAIRateLimiter({
  maxConcurrent: 50,  // 동시 최대 50개 요청
  maxRetries: 3,      // 최대 3번 재시도
  baseDelay: 1000,    // 1초 기본 딜레이
})

export default OpenAIRateLimiter
