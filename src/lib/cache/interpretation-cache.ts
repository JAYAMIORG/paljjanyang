/**
 * LLM 해석 결과 캐싱 유틸리티
 *
 * 동일한 사주 정보(bazi + gender + type)에 대해 캐시된 해석 결과를 반환하여
 * LLM API 비용을 절감하고 응답 속도를 개선합니다.
 */

import { createHash } from 'crypto'
import type { SajuResult, Bazi } from '@/types/saju'
import type { SupabaseClient } from '@supabase/supabase-js'

export type SajuType = 'personal' | 'yearly' | 'love' | 'compatibility' | 'daily'

export interface CacheKeyParams {
  type: SajuType
  bazi: Bazi
  gender: string
  // 궁합용
  bazi2?: Bazi
  gender2?: string
}

export interface CacheEntry {
  interpretation: string
  hitCount: number
}

export interface CacheSaveParams {
  cacheKey: string
  type: SajuType
  bazi: Bazi
  gender: string
  interpretation: string
  // 궁합용
  bazi2?: Bazi
  gender2?: string
}

/**
 * 캐시 키 생성
 * 동일한 사주 정보는 항상 동일한 키를 생성
 */
export function generateCacheKey(params: CacheKeyParams): string {
  const { type, bazi, gender, bazi2, gender2 } = params

  // 기본 키 구성요소
  const keyParts = [
    type,
    bazi.year,
    bazi.month,
    bazi.day,
    bazi.hour || 'null',
    gender,
  ]

  // 궁합인 경우 두 번째 사람 정보 추가
  if (type === 'compatibility' && bazi2 && gender2) {
    // 두 사람의 순서를 일관되게 정렬 (키 중복 방지)
    const person1Key = `${bazi.year}:${bazi.month}:${bazi.day}:${bazi.hour || 'null'}:${gender}`
    const person2Key = `${bazi2.year}:${bazi2.month}:${bazi2.day}:${bazi2.hour || 'null'}:${gender2}`

    // 알파벳 순으로 정렬하여 A-B와 B-A가 같은 키가 되도록
    if (person1Key > person2Key) {
      keyParts.push(bazi2.year, bazi2.month, bazi2.day, bazi2.hour || 'null', gender2)
    } else {
      // 순서 바꿔서 추가
      keyParts.length = 1 // type만 남기고
      keyParts.push(
        bazi2.year, bazi2.month, bazi2.day, bazi2.hour || 'null', gender2,
        bazi.year, bazi.month, bazi.day, bazi.hour || 'null', gender
      )
    }
  }

  // SHA-256 해시 생성
  const keyString = keyParts.join(':')
  return createHash('sha256').update(keyString).digest('hex')
}

/**
 * 캐시에서 해석 결과 조회
 * 히트 시 자동으로 hit_count 증가
 */
export async function getCachedInterpretation(
  supabase: SupabaseClient,
  cacheKey: string
): Promise<CacheEntry | null> {
  try {
    // PostgreSQL 함수 호출 (히트 카운트 자동 증가)
    const { data, error } = await supabase
      .rpc('get_cached_interpretation', { p_cache_key: cacheKey })

    if (error) {
      console.error('Cache lookup error:', error)
      return null
    }

    if (data && data.length > 0) {
      console.log(`[CACHE HIT] key=${cacheKey.substring(0, 8)}... hitCount=${data[0].hit_count}`)
      return {
        interpretation: data[0].interpretation,
        hitCount: data[0].hit_count,
      }
    }

    console.log(`[CACHE MISS] key=${cacheKey.substring(0, 8)}...`)
    return null
  } catch (error) {
    console.error('Cache lookup exception:', error)
    return null
  }
}

/**
 * 해석 결과를 캐시에 저장
 */
export async function saveCachedInterpretation(
  supabase: SupabaseClient,
  params: CacheSaveParams
): Promise<boolean> {
  const { cacheKey, type, bazi, gender, interpretation, bazi2, gender2 } = params

  try {
    const insertData: Record<string, unknown> = {
      cache_key: cacheKey,
      saju_type: type,
      bazi_year: bazi.year,
      bazi_month: bazi.month,
      bazi_day: bazi.day,
      bazi_hour: bazi.hour,
      gender,
      interpretation,
    }

    // 궁합인 경우 두 번째 사람 정보 추가
    if (type === 'compatibility' && bazi2 && gender2) {
      insertData.bazi2_year = bazi2.year
      insertData.bazi2_month = bazi2.month
      insertData.bazi2_day = bazi2.day
      insertData.bazi2_hour = bazi2.hour
      insertData.gender2 = gender2
    }

    const { error } = await supabase
      .from('interpretation_cache')
      .insert(insertData)

    if (error) {
      // 중복 키 에러는 무시 (동시 요청 시 발생 가능)
      if (error.code === '23505') {
        console.log(`[CACHE] Duplicate key ignored: ${cacheKey.substring(0, 8)}...`)
        return true
      }
      console.error('Cache save error:', error)
      return false
    }

    console.log(`[CACHE SAVE] key=${cacheKey.substring(0, 8)}... type=${type}`)
    return true
  } catch (error) {
    console.error('Cache save exception:', error)
    return false
  }
}

/**
 * 캐시 통계 조회 (관리자용)
 */
export async function getCacheStats(supabase: SupabaseClient): Promise<{
  totalEntries: number
  totalHits: number
  hitsByType: Record<string, number>
} | null> {
  try {
    // 전체 통계
    const { data: stats, error: statsError } = await supabase
      .from('interpretation_cache')
      .select('saju_type, hit_count')

    if (statsError) {
      console.error('Cache stats error:', statsError)
      return null
    }

    const totalEntries = stats?.length || 0
    const totalHits = stats?.reduce((sum, row) => sum + (row.hit_count || 0), 0) || 0

    const hitsByType: Record<string, number> = {}
    stats?.forEach(row => {
      hitsByType[row.saju_type] = (hitsByType[row.saju_type] || 0) + (row.hit_count || 0)
    })

    return { totalEntries, totalHits, hitsByType }
  } catch (error) {
    console.error('Cache stats exception:', error)
    return null
  }
}
