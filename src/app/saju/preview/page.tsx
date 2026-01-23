'use client'

import { useEffect, useState, Suspense } from 'react'
import Image from 'next/image'
import { useSearchParams, useRouter } from 'next/navigation'
import { Header } from '@/components/layout'
import { Button, Card, LoadingScreen, ErrorScreen, WuXingRadarChart } from '@/components/ui'
import { useAuth } from '@/hooks'
import type { SajuResult } from '@/types/saju'

function PreviewContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { user, loading: authLoading, isConfigured } = useAuth()
  const [result, setResult] = useState<SajuResult | null>(null)
  const [result2, setResult2] = useState<SajuResult | null>(null) // 궁합용 두 번째 사람
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [coinBalance, setCoinBalance] = useState<number | null>(null)
  const [hasExistingRecord, setHasExistingRecord] = useState<boolean | null>(null)

  const type = searchParams.get('type') || 'personal'
  const isCompatibility = type === 'compatibility'
  const name1 = searchParams.get('name1') || '첫 번째 사람'
  const name2 = searchParams.get('name2') || '두 번째 사람'

  useEffect(() => {
    const fetchSaju = async () => {
      try {
        // 첫 번째 사람 정보
        const year = searchParams.get('year')
        const month = searchParams.get('month')
        const day = searchParams.get('day')
        const hour = searchParams.get('hour')
        const lunar = searchParams.get('lunar')
        const gender = searchParams.get('gender')

        if (!year || !month || !day || !gender) {
          setError('필수 정보가 누락되었습니다.')
          setIsLoading(false)
          return
        }

        // 첫 번째 사람 사주 계산
        const response = await fetch('/api/saju/calculate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            birthYear: parseInt(year),
            birthMonth: parseInt(month),
            birthDay: parseInt(day),
            birthHour: hour && parseInt(hour) >= 0 ? parseInt(hour) : null,
            isLunar: lunar === '1',
            isLeapMonth: false,
            gender,
          }),
        })

        const data = await response.json()

        if (data.success) {
          setResult(data.data)
        } else {
          setError(data.error?.message || '사주 계산 중 오류가 발생했습니다.')
          setIsLoading(false)
          return
        }

        // 궁합인 경우 두 번째 사람 사주도 계산
        if (isCompatibility) {
          const year2 = searchParams.get('year2')
          const month2 = searchParams.get('month2')
          const day2 = searchParams.get('day2')
          const hour2 = searchParams.get('hour2')
          const lunar2 = searchParams.get('lunar2')
          const gender2 = searchParams.get('gender2')

          if (!year2 || !month2 || !day2 || !gender2) {
            setError('두 번째 사람의 정보가 누락되었습니다.')
            setIsLoading(false)
            return
          }

          const response2 = await fetch('/api/saju/calculate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              birthYear: parseInt(year2),
              birthMonth: parseInt(month2),
              birthDay: parseInt(day2),
              birthHour: hour2 && parseInt(hour2) >= 0 ? parseInt(hour2) : null,
              isLunar: lunar2 === '1',
              isLeapMonth: false,
              gender: gender2,
            }),
          })

          const data2 = await response2.json()

          if (data2.success) {
            setResult2(data2.data)
          } else {
            setError(data2.error?.message || '두 번째 사람의 사주 계산 중 오류가 발생했습니다.')
          }
        }
      } catch {
        setError('서버 연결에 실패했습니다.')
      } finally {
        setIsLoading(false)
      }
    }

    fetchSaju()
  }, [searchParams, isCompatibility])

  // 코인 잔액 조회 (인증 로딩 완료 후)
  useEffect(() => {
    const fetchCoinBalance = async () => {
      // 인증 로딩 중이면 대기
      if (authLoading) return

      if (!isConfigured || !user) {
        setCoinBalance(0)
        return
      }

      try {
        const response = await fetch('/api/coin/balance')
        const data = await response.json()
        if (data.success) {
          setCoinBalance(data.data.balance)
        } else {
          setCoinBalance(0)
        }
      } catch {
        setCoinBalance(0)
      }
    }

    fetchCoinBalance()
  }, [user, isConfigured, authLoading])

  // 기존 기록 확인 (인증 로딩 완료 후)
  useEffect(() => {
    const checkExistingRecord = async () => {
      if (authLoading) return
      if (!isConfigured || !user) {
        setHasExistingRecord(false)
        return
      }

      const year = searchParams.get('year')
      const month = searchParams.get('month')
      const day = searchParams.get('day')
      const hour = searchParams.get('hour')
      const lunar = searchParams.get('lunar')
      const gender = searchParams.get('gender')

      if (!year || !month || !day || !gender) {
        setHasExistingRecord(false)
        return
      }

      try {
        const checkBody: Record<string, unknown> = {
          type,
          birthYear: parseInt(year),
          birthMonth: parseInt(month),
          birthDay: parseInt(day),
          birthHour: hour && parseInt(hour) >= 0 ? parseInt(hour) : null,
          isLunar: lunar === '1',
          gender,
        }

        // 궁합인 경우 두 번째 사람 정보도 추가
        if (isCompatibility) {
          const year2 = searchParams.get('year2')
          const month2 = searchParams.get('month2')
          const day2 = searchParams.get('day2')
          const hour2 = searchParams.get('hour2')
          const lunar2 = searchParams.get('lunar2')
          const gender2 = searchParams.get('gender2')

          if (year2 && month2 && day2 && gender2) {
            checkBody.birthYear2 = parseInt(year2)
            checkBody.birthMonth2 = parseInt(month2)
            checkBody.birthDay2 = parseInt(day2)
            checkBody.birthHour2 = hour2 && parseInt(hour2) >= 0 ? parseInt(hour2) : null
            checkBody.isLunar2 = lunar2 === '1'
            checkBody.gender2 = gender2
          }
        }

        const response = await fetch('/api/saju/check-existing', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(checkBody),
        })

        const data = await response.json()
        if (data.success) {
          setHasExistingRecord(data.data?.exists || false)
        } else {
          setHasExistingRecord(false)
        }
      } catch {
        setHasExistingRecord(false)
      }
    }

    checkExistingRecord()
  }, [user, isConfigured, authLoading, searchParams, type, isCompatibility])

  // 전체 해석 보기 (결과 페이지에서 코인 차감)
  const handleViewResult = () => {
    // 인증 로딩 중이면 대기
    if (authLoading) return

    if (!user) {
      // 로그인 안 된 경우 로그인 페이지로
      const currentUrl = `/saju/result?${searchParams.toString()}`
      router.push(`/auth/login?redirect=${encodeURIComponent(currentUrl)}`)
      return
    }

    // 기존 기록이 있으면 코인 체크 없이 바로 이동
    if (!hasExistingRecord && coinBalance !== null && coinBalance < 1) {
      // 코인 부족 시 결제 페이지로 이동
      const resultUrl = `/saju/result?${searchParams.toString()}`
      router.push(`/coin?redirect=${encodeURIComponent(resultUrl)}`)
      return
    }

    // 결과 페이지로 이동 (코인 차감은 결과 페이지에서)
    const params = new URLSearchParams(searchParams.toString())
    router.push(`/saju/result?${params.toString()}`)
  }

  if (isLoading) {
    return <LoadingScreen message="사주를 분석하고 있어요..." />
  }

  if (error || !result) {
    return (
      <ErrorScreen
        message={error || '결과를 불러올 수 없습니다.'}
        showRetry
        onRetry={() => router.back()}
      />
    )
  }

  // 궁합인데 두 번째 사람 결과가 없으면 에러
  if (isCompatibility && !result2) {
    return (
      <ErrorScreen
        message="두 번째 사람의 사주를 불러올 수 없습니다."
        showRetry
        onRetry={() => router.back()}
      />
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Header showBack useHistoryBack title={isCompatibility ? '궁합 미리보기' : '내 만세력'} />

      <main className="px-4 py-4 max-w-lg mx-auto space-y-4">
        {isCompatibility && result2 ? (
          // 궁합: 두 사람의 사주 비교
          <>
            {/* 첫 번째 사람 */}
            <Card variant="highlighted">
              <p className="text-center text-small text-primary font-semibold mb-2">{name1}</p>
              <div className="text-center mb-4">
                <span className="text-3xl">{result.zodiacEmoji}</span>
                <h2 className="text-subheading font-semibold text-text mt-1">
                  {result.zodiac}
                </h2>
              </div>
              <div className="grid grid-cols-4 gap-2 text-center mb-2">
                <PillarCard label="년주" value={result.bazi.year} />
                <PillarCard label="월주" value={result.bazi.month} />
                <PillarCard label="일주" value={result.bazi.day} />
                <PillarCard label="시주" value={result.bazi.hour || '—'} disabled={!result.bazi.hour} />
              </div>
              <p className="text-center text-caption text-text-muted">{result.koreanGanji}</p>
            </Card>

            {/* 하트 아이콘 */}
            <div className="text-center">
              <span className="text-3xl">💕</span>
            </div>

            {/* 두 번째 사람 */}
            <Card variant="highlighted">
              <p className="text-center text-small text-primary font-semibold mb-2">{name2}</p>
              <div className="text-center mb-4">
                <span className="text-3xl">{result2.zodiacEmoji}</span>
                <h2 className="text-subheading font-semibold text-text mt-1">
                  {result2.zodiac}
                </h2>
              </div>
              <div className="grid grid-cols-4 gap-2 text-center mb-2">
                <PillarCard label="년주" value={result2.bazi.year} />
                <PillarCard label="월주" value={result2.bazi.month} />
                <PillarCard label="일주" value={result2.bazi.day} />
                <PillarCard label="시주" value={result2.bazi.hour || '—'} disabled={!result2.bazi.hour} />
              </div>
              <p className="text-center text-caption text-text-muted">{result2.koreanGanji}</p>
            </Card>

            {/* 두 사람 일간 비교 */}
            <Card>
              <h3 className="text-subheading font-semibold text-text mb-4">일간 비교</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <p className="text-small text-text-muted mb-1">{name1}</p>
                  <span className="text-2xl font-serif text-primary">{result.dayMaster}</span>
                  <p className="text-small text-text mt-1">{result.dayMasterKorean}</p>
                </div>
                <div className="text-center">
                  <p className="text-small text-text-muted mb-1">{name2}</p>
                  <span className="text-2xl font-serif text-primary">{result2.dayMaster}</span>
                  <p className="text-small text-text mt-1">{result2.dayMasterKorean}</p>
                </div>
              </div>
            </Card>
          </>
        ) : (
          // 단일 사주 - 간소화된 버전
          <>
            {/* 사주팔자 카드 */}
            <Card variant="highlighted">
              <div className="text-center mb-3">
                <span className="text-3xl">{result.zodiacEmoji}</span>
                <h2 className="text-subheading font-semibold text-text mt-1">
                  {result.zodiac}
                </h2>
              </div>

              {/* 사주팔자 표시 */}
              <div className="grid grid-cols-4 gap-2 text-center mb-3">
                <PillarCard label="년주" value={result.bazi.year} />
                <PillarCard label="월주" value={result.bazi.month} />
                <PillarCard label="일주" value={result.bazi.day} />
                <PillarCard
                  label="시주"
                  value={result.bazi.hour || '—'}
                  disabled={!result.bazi.hour}
                />
              </div>

              <p className="text-center text-caption text-text-muted">
                {result.koreanGanji}
              </p>

              {/* 일간 정보 - 카드 내부로 통합 */}
              <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-center gap-3">
                <span className="text-3xl font-serif">{result.dayMaster}</span>
                <div>
                  <p className="text-subheading font-semibold text-text">{result.dayMasterKorean}</p>
                  <p className="text-caption text-text-muted">당신의 본질적 성향</p>
                </div>
              </div>
            </Card>

            {/* 오행 분포 - 오각형 레이더 차트 */}
            <Card>
              <h3 className="text-body font-semibold text-text mb-2">오행 분포</h3>
              <div className="flex justify-center">
                <WuXingRadarChart wuXing={result.wuXing} size={180} />
              </div>
              <p className="text-center text-caption text-text-muted mt-1">
                <span className="text-primary font-medium">강:</span> {result.dominantElement} · <span className="text-accent-rose font-medium">약:</span> {result.weakElement}
              </p>
            </Card>
          </>
        )}

        {/* CTA 버튼 */}
        <div className="pt-2">
          <Button
            fullWidth
            size="lg"
            onClick={handleViewResult}
          >
            {hasExistingRecord
              ? (isCompatibility ? '💕 이전 궁합 결과 보기' : '🔮 이전 분석 결과 보기')
              : (isCompatibility ? '💕 궁합 분석 보기 (1코인)' : '🔮 전체 해석 보기 (1코인)')
            }
          </Button>
          {/* 보유 코인 또는 기존 기록 안내 */}
          <p className="text-center text-caption text-text-light mt-2">
            {hasExistingRecord
              ? '✨ 이미 분석한 기록이 있어요'
              : `보유 코인: ${coinBalance !== null ? coinBalance : '...'} 🪙`
            }
          </p>
        </div>
      </main>
    </div>
  )
}

function PillarCard({
  label,
  value,
  disabled = false,
}: {
  label: string
  value: string
  disabled?: boolean
}) {
  return (
    <div className={`${disabled ? 'opacity-40' : ''}`}>
      <p className="text-caption text-text-muted mb-1">{label}</p>
      <div className="bg-white rounded-lg p-2 border border-gray-100">
        <p className="text-heading font-serif text-primary">{value}</p>
      </div>
    </div>
  )
}

export default function PreviewPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center">
            <Image
              src="/images/brand-character.png"
              alt=""
              width={72}
              height={72}
              className="h-[72px] w-auto mx-auto mb-4 animate-bounce"
            />
            <p className="text-body text-text-muted">로딩 중...</p>
          </div>
        </div>
      }
    >
      <PreviewContent />
    </Suspense>
  )
}
