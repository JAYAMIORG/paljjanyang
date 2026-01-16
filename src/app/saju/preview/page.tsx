'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Header } from '@/components/layout'
import { Button, Card } from '@/components/ui'
import { useAuth } from '@/hooks'
import type { SajuResult } from '@/types/saju'

const WUXING_COLORS: Record<string, string> = {
  wood: '#7FB069',
  fire: '#FF6B6B',
  earth: '#FFB366',
  metal: '#A8A8A8',
  water: '#4ECDC4',
}

const WUXING_KOREAN: Record<string, string> = {
  wood: '목(木)',
  fire: '화(火)',
  earth: '토(土)',
  metal: '금(金)',
  water: '수(水)',
}

function PreviewContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { user, loading: authLoading, isConfigured } = useAuth()
  const [result, setResult] = useState<SajuResult | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [coinBalance, setCoinBalance] = useState<number | null>(null)

  const type = searchParams.get('type') || 'personal'

  useEffect(() => {
    const fetchSaju = async () => {
      try {
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
        }
      } catch {
        setError('서버 연결에 실패했습니다.')
      } finally {
        setIsLoading(false)
      }
    }

    fetchSaju()
  }, [searchParams])

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

    if (coinBalance !== null && coinBalance < 1) {
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
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-bounce">🐱</div>
          <p className="text-body text-text-muted">사주를 분석하고 있어요...</p>
        </div>
      </div>
    )
  }

  if (error || !result) {
    return (
      <div className="min-h-screen bg-background">
        <Header showBack />
        <main className="px-4 py-6 max-w-lg mx-auto text-center">
          <div className="text-6xl mb-4">😿</div>
          <p className="text-body text-text mb-6">{error || '결과를 불러올 수 없습니다.'}</p>
          <Button onClick={() => router.back()}>다시 시도하기</Button>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Header showBack useHistoryBack title="내 만세력" />

      <main className="px-4 py-6 max-w-lg mx-auto space-y-6">
        {/* 사주팔자 카드 */}
        <Card variant="highlighted">
          <div className="text-center mb-4">
            <span className="text-4xl">{result.zodiacEmoji}</span>
            <h2 className="text-heading font-semibold text-text mt-2">
              {result.zodiac}
            </h2>
          </div>

          {/* 사주팔자 표시 */}
          <div className="grid grid-cols-4 gap-2 text-center mb-4">
            <PillarCard label="년주" value={result.bazi.year} />
            <PillarCard label="월주" value={result.bazi.month} />
            <PillarCard label="일주" value={result.bazi.day} />
            <PillarCard
              label="시주"
              value={result.bazi.hour || '—'}
              disabled={!result.bazi.hour}
            />
          </div>

          <p className="text-center text-small text-text-muted">
            {result.koreanGanji}
          </p>
        </Card>

        {/* 일간 정보 */}
        <Card>
          <h3 className="text-subheading font-semibold text-text mb-3">일간 (Day Master)</h3>
          <div className="flex items-center gap-3">
            <span className="text-3xl font-serif">{result.dayMaster}</span>
            <div>
              <p className="text-body font-semibold text-text">{result.dayMasterKorean}</p>
              <p className="text-small text-text-muted">당신의 본질적 성향</p>
            </div>
          </div>
        </Card>

        {/* 오행 분포 */}
        <Card>
          <h3 className="text-subheading font-semibold text-text mb-4">오행 분포</h3>
          <div className="space-y-3">
            {(Object.entries(result.wuXing) as [keyof typeof result.wuXing, number][]).map(
              ([element, value]) => (
                <WuXingBar key={element} element={element} value={value} />
              )
            )}
          </div>
          <div className="mt-4 pt-4 border-t border-gray-100">
            <p className="text-small text-text-muted">
              <span className="font-semibold text-primary">강한 오행:</span> {result.dominantElement} |{' '}
              <span className="font-semibold text-accent-rose">약한 오행:</span> {result.weakElement}
            </p>
          </div>
        </Card>

        {/* CTA 버튼 */}
        <div className="pt-4">
          <Button
            fullWidth
            size="lg"
            onClick={handleViewResult}
          >
            🔮 전체 해석 보기 (1코인)
          </Button>
          {/* 보유 코인 표시 */}
          <p className="text-center text-small text-text-light mt-2">
            보유 코인: {coinBalance !== null ? coinBalance : '...'} 🪙
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

function WuXingBar({ element, value }: { element: string; value: number }) {
  return (
    <div className="flex items-center gap-3">
      <span className="w-16 text-small text-text-muted">
        {WUXING_KOREAN[element]}
      </span>
      <div className="flex-1 h-4 bg-gray-100 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{
            width: `${value}%`,
            backgroundColor: WUXING_COLORS[element],
          }}
        />
      </div>
      <span className="w-10 text-small text-text-muted text-right">{value}%</span>
    </div>
  )
}

export default function PreviewPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center">
            <div className="text-6xl mb-4 animate-bounce">🐱</div>
            <p className="text-body text-text-muted">로딩 중...</p>
          </div>
        </div>
      }
    >
      <PreviewContent />
    </Suspense>
  )
}
