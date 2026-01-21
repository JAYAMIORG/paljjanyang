#!/usr/bin/env node
/**
 * 간단한 부하 테스트 스크립트
 *
 * 사용법:
 *   node scripts/load-test.js [옵션]
 *
 * 옵션:
 *   --url=<URL>           테스트 URL (기본: http://localhost:3000)
 *   --concurrent=<N>      동시 요청 수 (기본: 10)
 *   --total=<N>           총 요청 수 (기본: 100)
 *   --endpoint=<path>     테스트할 엔드포인트 (기본: /api/admin/status)
 */

const http = require('http')
const https = require('https')

// 파라미터 파싱
const args = process.argv.slice(2).reduce((acc, arg) => {
  const [key, value] = arg.replace('--', '').split('=')
  acc[key] = value
  return acc
}, {})

const BASE_URL = args.url || 'http://localhost:3000'
const CONCURRENT = parseInt(args.concurrent) || 10
const TOTAL_REQUESTS = parseInt(args.total) || 100
const ENDPOINT = args.endpoint || '/api/admin/status'

// 통계
const stats = {
  success: 0,
  failed: 0,
  totalTime: 0,
  minTime: Infinity,
  maxTime: 0,
  times: [],
}

function makeRequest(url) {
  return new Promise((resolve) => {
    const startTime = Date.now()
    const protocol = url.startsWith('https') ? https : http

    const req = protocol.get(url, (res) => {
      let data = ''
      res.on('data', (chunk) => (data += chunk))
      res.on('end', () => {
        const duration = Date.now() - startTime
        resolve({
          success: res.statusCode >= 200 && res.statusCode < 400,
          statusCode: res.statusCode,
          duration,
        })
      })
    })

    req.on('error', () => {
      const duration = Date.now() - startTime
      resolve({
        success: false,
        statusCode: 0,
        duration,
      })
    })

    req.setTimeout(30000, () => {
      req.destroy()
      const duration = Date.now() - startTime
      resolve({
        success: false,
        statusCode: 0,
        duration,
      })
    })
  })
}

async function runBatch(batchSize, url) {
  const promises = Array(batchSize)
    .fill(null)
    .map(() => makeRequest(url))

  const results = await Promise.all(promises)

  results.forEach((result) => {
    if (result.success) {
      stats.success++
    } else {
      stats.failed++
    }
    stats.totalTime += result.duration
    stats.minTime = Math.min(stats.minTime, result.duration)
    stats.maxTime = Math.max(stats.maxTime, result.duration)
    stats.times.push(result.duration)
  })

  return results
}

function calculatePercentile(arr, p) {
  const sorted = [...arr].sort((a, b) => a - b)
  const index = Math.ceil((p / 100) * sorted.length) - 1
  return sorted[Math.max(0, index)]
}

async function main() {
  const url = `${BASE_URL}${ENDPOINT}`

  console.log('========================================')
  console.log('🚀 부하 테스트 시작')
  console.log('========================================')
  console.log(`URL: ${url}`)
  console.log(`동시 요청 수: ${CONCURRENT}`)
  console.log(`총 요청 수: ${TOTAL_REQUESTS}`)
  console.log('----------------------------------------')

  const startTime = Date.now()
  const batches = Math.ceil(TOTAL_REQUESTS / CONCURRENT)

  for (let i = 0; i < batches; i++) {
    const batchSize = Math.min(CONCURRENT, TOTAL_REQUESTS - i * CONCURRENT)
    process.stdout.write(`\r진행률: ${Math.round(((i + 1) / batches) * 100)}%`)
    await runBatch(batchSize, url)
  }

  const totalDuration = Date.now() - startTime

  console.log('\n')
  console.log('========================================')
  console.log('📊 테스트 결과')
  console.log('========================================')
  console.log(`총 소요 시간: ${(totalDuration / 1000).toFixed(2)}초`)
  console.log(`성공: ${stats.success}`)
  console.log(`실패: ${stats.failed}`)
  console.log(`성공률: ${((stats.success / (stats.success + stats.failed)) * 100).toFixed(1)}%`)
  console.log('----------------------------------------')
  console.log(`RPS (초당 요청 수): ${(TOTAL_REQUESTS / (totalDuration / 1000)).toFixed(1)}`)
  console.log(`평균 응답 시간: ${(stats.totalTime / (stats.success + stats.failed)).toFixed(0)}ms`)
  console.log(`최소 응답 시간: ${stats.minTime}ms`)
  console.log(`최대 응답 시간: ${stats.maxTime}ms`)
  console.log(`P50 (중앙값): ${calculatePercentile(stats.times, 50)}ms`)
  console.log(`P95: ${calculatePercentile(stats.times, 95)}ms`)
  console.log(`P99: ${calculatePercentile(stats.times, 99)}ms`)
  console.log('========================================')

  // 결과 판정
  const avgTime = stats.totalTime / (stats.success + stats.failed)
  const successRate = stats.success / (stats.success + stats.failed)

  if (successRate >= 0.99 && avgTime < 500) {
    console.log('✅ 결과: 우수 (성공률 99%+, 평균 응답 500ms 미만)')
  } else if (successRate >= 0.95 && avgTime < 1000) {
    console.log('⚠️ 결과: 양호 (성공률 95%+, 평균 응답 1초 미만)')
  } else {
    console.log('❌ 결과: 개선 필요')
  }
}

main().catch(console.error)
