'use client'

import { useEffect, useState, Suspense, useRef } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Header } from '@/components/layout'
import { Button, Card } from '@/components/ui'
import { useAuth, useKakaoShare } from '@/hooks'
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

function ResultContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const { share: shareKakao, isReady: isKakaoReady } = useKakaoShare()
  const [result, setResult] = useState<SajuResult | null>(null)
  const [interpretation, setInterpretation] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isInterpretLoading, setIsInterpretLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [coinError, setCoinError] = useState<string | null>(null)
  const [showInsufficientModal, setShowInsufficientModal] = useState(false)
  const [coinBalance, setCoinBalance] = useState<number>(0)
  const hasSavedRef = useRef(false)
  const hasDeductedCoinRef = useRef(false)
  const hasStartedRef = useRef(false)

  const type = searchParams.get('type') || 'personal'
  const gender = searchParams.get('gender') || 'female'
  const year = searchParams.get('year')
  const month = searchParams.get('month')
  const day = searchParams.get('day')
  const hour = searchParams.get('hour')
  const lunar = searchParams.get('lunar')

  // 자동 저장 함수
  const autoSave = async (sajuResult: SajuResult, interpretationText: string | null) => {
    if (!user || hasSavedRef.current) return

    hasSavedRef.current = true

    try {
      const response = await fetch('/api/saju/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type,
          sajuResult,
          interpretation: interpretationText,
          gender,
          birthInfo: {
            year: parseInt(year!),
            month: parseInt(month!),
            day: parseInt(day!),
            hour: hour ? parseInt(hour) : undefined,
            isLunar: lunar === '1',
          },
        }),
      })

      await response.json()
    } catch {
      // 저장 실패해도 결과는 보여줌
      console.error('Auto-save failed')
    }
  }

  // 코인 차감 함수
  const deductCoin = async (): Promise<boolean> => {
    if (hasDeductedCoinRef.current) return true
    if (!user) {
      setCoinError('로그인이 필요합니다.')
      return false
    }

    try {
      const response = await fetch('/api/saju/use-coin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type }),
      })

      const data = await response.json()

      if (data.success) {
        hasDeductedCoinRef.current = true
        return true
      } else {
        if (data.error?.code === 'INSUFFICIENT_COINS') {
          setCoinBalance(data.error.currentBalance ?? 0)
          setShowInsufficientModal(true)
        }
        setCoinError(data.error?.message || '코인 차감에 실패했습니다.')
        return false
      }
    } catch {
      setCoinError('서버 연결에 실패했습니다.')
      return false
    }
  }

  // 사주 계산 및 코인 차감
  useEffect(() => {
    // 인증 로딩 중이면 대기
    if (authLoading) return

    // 이미 시작했으면 중복 실행 방지
    if (hasStartedRef.current) return

    const fetchSaju = async () => {
      hasStartedRef.current = true

      try {
        if (!year || !month || !day || !gender) {
          setError('필수 정보가 누락되었습니다.')
          setIsLoading(false)
          return
        }

        // 로그인 체크 (인증 로딩 완료 후)
        if (!user) {
          const currentUrl = `/saju/result?${searchParams.toString()}`
          router.push(`/auth/login?redirect=${encodeURIComponent(currentUrl)}`)
          return
        }

        // 코인 차감 먼저 시도
        const coinDeducted = await deductCoin()
        if (!coinDeducted) {
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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading, user])

  // LLM 해석 요청 및 자동 저장
  useEffect(() => {
    if (!result || !user) return

    const fetchInterpretation = async () => {
      setIsInterpretLoading(true)
      try {
        const response = await fetch('/api/saju/interpret', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type,
            sajuResult: result,
            gender,
          }),
        })

        const data = await response.json()
        if (data.success) {
          setInterpretation(data.data.interpretation)
          // 해석 완료 후 자동 저장
          await autoSave(result, data.data.interpretation)
        } else {
          // LLM 실패해도 자동 저장 (기본 해석으로)
          await autoSave(result, null)
        }
      } catch {
        console.log('LLM interpretation failed, using fallback')
        // LLM 실패해도 자동 저장
        await autoSave(result, null)
      } finally {
        setIsInterpretLoading(false)
      }
    }

    fetchInterpretation()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [result])

  // 링크 복사
  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href)
      alert('링크가 복사되었습니다!')
    } catch {
      alert('링크 복사에 실패했습니다.')
    }
  }

  // 인스타 공유 (이미지 저장 안내)
  const handleInstagramShare = () => {
    alert('화면을 스크린샷하여 인스타그램에 공유해주세요!')
  }

  // 카카오 공유
  const handleKakaoShare = () => {
    if (!result) return

    const typeLabel = {
      personal: '개인 사주',
      yearly: '신년운세',
      compatibility: '궁합',
      love: '연애운',
    }[type] || '사주'

    shareKakao({
      title: `${result.dayMasterKorean}의 ${typeLabel} 결과`,
      description: `${result.koreanGanji} - 나의 사주를 확인해보세요!`,
      buttonText: '나도 사주 보러가기',
    })
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

  // 코인 부족 모달
  if (showInsufficientModal) {
    return (
      <div className="min-h-screen bg-background">
        <Header showBack useHistoryBack />
        <main className="px-4 py-6 max-w-lg mx-auto">
          <div className="bg-white rounded-2xl p-6 text-center">
            <span className="text-5xl block mb-4">😿</span>
            <h3 className="text-heading font-semibold text-text mb-2">
              코인이 부족해요
            </h3>
            <p className="text-body text-text-muted mb-6">
              전체 해석을 보려면 1코인이 필요해요.<br />
              현재 보유 코인: <span className="font-semibold text-primary">{coinBalance}</span>
            </p>
            <div className="space-y-3">
              <Button
                fullWidth
                onClick={() => router.push('/coin')}
              >
                💰 코인 충전하러 가기
              </Button>
              <Button
                variant="ghost"
                fullWidth
                onClick={() => router.push('/home')}
              >
                홈으로 돌아가기
              </Button>
            </div>
          </div>
        </main>
      </div>
    )
  }

  if (coinError && !showInsufficientModal) {
    return (
      <div className="min-h-screen bg-background">
        <Header showBack useHistoryBack />
        <main className="px-4 py-6 max-w-lg mx-auto text-center">
          <div className="text-6xl mb-4">😿</div>
          <p className="text-body text-text mb-6">{coinError}</p>
          <Button onClick={() => router.push('/home')}>홈으로 돌아가기</Button>
        </main>
      </div>
    )
  }

  if (error || !result) {
    return (
      <div className="min-h-screen bg-background">
        <Header showBack useHistoryBack />
        <main className="px-4 py-6 max-w-lg mx-auto text-center">
          <div className="text-6xl mb-4">😿</div>
          <p className="text-body text-text">{error || '결과를 불러올 수 없습니다.'}</p>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Header showBack useHistoryBack title="사주 분석 결과" />

      <main className="px-4 py-6 max-w-lg mx-auto space-y-6">
        {/* 요약 카드 */}
        <Card variant="highlighted">
          <div className="text-center">
            <span className="text-5xl mb-3 block">{result.zodiacEmoji}</span>
            <h2 className="text-heading font-semibold text-text mb-2">
              {result.dayMasterKorean}의 기운
            </h2>
            <p className="text-body text-text-muted">
              {result.koreanGanji}
            </p>
          </div>

          {/* 오행 미니 차트 */}
          <div className="mt-6 flex justify-center gap-2">
            {(Object.entries(result.wuXing) as [keyof typeof result.wuXing, number][]).map(
              ([element, value]) => (
                <div
                  key={element}
                  className="flex flex-col items-center"
                  style={{ opacity: value > 10 ? 1 : 0.4 }}
                >
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-white text-small font-bold"
                    style={{ backgroundColor: WUXING_COLORS[element] }}
                  >
                    {value}
                  </div>
                  <span className="text-caption text-text-light mt-1">
                    {WUXING_KOREAN[element].charAt(0)}
                  </span>
                </div>
              )
            )}
          </div>
        </Card>

        {/* 전문가 해석 또는 로딩/폴백 */}
        {isInterpretLoading ? (
          <Card>
            <div className="flex items-center justify-center py-8">
              <div className="text-center">
                <div className="text-4xl mb-3 animate-pulse">🐱</div>
                <p className="text-body text-text-muted">전문가가 사주를 해석하고 있어요...</p>
              </div>
            </div>
          </Card>
        ) : interpretation ? (
          <InterpretationCard content={interpretation} />
        ) : (
          <FallbackInterpretation result={result} />
        )}

        {/* 대운 흐름 */}
        <Card>
          <h3 className="text-subheading font-semibold text-text mb-4">
            대운 흐름
          </h3>
          <div className="overflow-x-auto -mx-2 px-2">
            <div className="flex gap-2" style={{ minWidth: 'max-content' }}>
              {result.daYun.slice(0, 8).map((dy, index) => (
                <div
                  key={index}
                  className={`
                    flex-shrink-0 w-16 p-2 rounded-lg text-center
                    ${index === 0 ? 'bg-primary/10 border border-primary/30' : 'bg-gray-50'}
                  `}
                >
                  <p className="text-caption text-text-muted">
                    {dy.startAge}-{dy.endAge}세
                  </p>
                  <p className="text-body font-serif text-primary">{dy.ganZhi}</p>
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* 공유 */}
        <Card>
          <h3 className="text-subheading font-semibold text-text mb-4">
            친구에게 공유하기
          </h3>

          {/* 공유 버튼들 - 아이콘만 */}
          <div className="flex justify-center gap-4">
            <button
              onClick={handleInstagramShare}
              className="w-14 h-14 flex items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 text-white hover:opacity-90 transition-opacity"
            >
              <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
              </svg>
            </button>

            <button
              onClick={handleKakaoShare}
              disabled={!isKakaoReady}
              className={`w-14 h-14 flex items-center justify-center rounded-xl bg-[#FEE500] text-[#3C1E1E] transition-opacity ${
                isKakaoReady ? 'hover:opacity-90' : 'opacity-50 cursor-not-allowed'
              }`}
            >
              <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 3c-5.52 0-10 3.59-10 8 0 2.84 1.89 5.33 4.71 6.72-.17.64-.68 2.53-.78 2.92-.12.49.18.48.38.35.16-.1 2.49-1.68 3.49-2.36.72.11 1.46.17 2.2.17 5.52 0 10-3.59 10-8s-4.48-8-10-8z"/>
              </svg>
            </button>

            <button
              onClick={handleCopyLink}
              className="w-14 h-14 flex items-center justify-center rounded-xl bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
            >
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
              </svg>
            </button>
          </div>
          <p className="text-center text-small text-accent mt-3">
            공유하면 1코인 적립!
          </p>
        </Card>

        {/* 다른 사주 보기 버튼 */}
        <Button
          variant="secondary"
          fullWidth
          onClick={() => router.push('/home')}
        >
          다른 사주 보러가기
        </Button>
      </main>
    </div>
  )
}

// LLM 해석 표시 컴포넌트
function InterpretationCard({ content }: { content: string }) {
  const sections = parseMarkdownSections(content)

  return (
    <div className="space-y-4">
      {sections.map((section, index) => (
        <Card key={index}>
          {section.title && (
            <h3 className="text-subheading font-semibold text-text mb-3">
              {section.title}
            </h3>
          )}
          <div className="text-body text-text-muted leading-relaxed whitespace-pre-wrap">
            {section.content}
          </div>
        </Card>
      ))}
    </div>
  )
}

// 마크다운 섹션 파싱
function parseMarkdownSections(markdown: string): { title: string | null; content: string }[] {
  const lines = markdown.split('\n')
  const sections: { title: string | null; content: string }[] = []
  let currentSection: { title: string | null; content: string[] } = { title: null, content: [] }

  for (const line of lines) {
    const headerMatch = line.match(/^#{1,3}\s+(.+)$/)
    if (headerMatch) {
      if (currentSection.content.length > 0 || currentSection.title) {
        sections.push({
          title: currentSection.title,
          content: currentSection.content.join('\n').trim(),
        })
      }
      currentSection = { title: headerMatch[1], content: [] }
    } else {
      currentSection.content.push(line)
    }
  }

  if (currentSection.content.length > 0 || currentSection.title) {
    sections.push({
      title: currentSection.title,
      content: currentSection.content.join('\n').trim(),
    })
  }

  return sections.filter(s => s.content.trim() || s.title)
}

// LLM 실패 시 폴백 해석
function FallbackInterpretation({ result }: { result: SajuResult }) {
  return (
    <div className="space-y-4">
      <Card>
        <h3 className="text-subheading font-semibold text-text mb-3">
          핵심 요약
        </h3>
        <p className="text-body text-text-muted leading-relaxed">
          당신은 <span className="font-semibold text-primary">{result.dayMasterKorean}</span>의
          성향을 가진 사람입니다. {result.dominantElement}이 강하여
          추진력과 에너지가 넘칩니다. 반면 {result.weakElement}이 부족하니
          이 부분을 보완하면 더욱 균형 잡힌 삶을 살 수 있습니다.
        </p>
      </Card>

      <Card>
        <h3 className="text-subheading font-semibold text-text mb-3">
          성격과 기질
        </h3>
        <p className="text-body text-text-muted leading-relaxed">
          {result.dayMasterKorean}의 성향을 가진 당신은 {getPersonalityByElement(result.dominantElement)}.
          목표를 향해 꾸준히 나아가는 성격이며, 주변 사람들에게 신뢰를 주는 편입니다.
        </p>
      </Card>

      <Card>
        <h3 className="text-subheading font-semibold text-text mb-3">
          올해의 운세
        </h3>
        <p className="text-body text-text-muted leading-relaxed">
          올해는 전반적으로 안정적인 흐름입니다.
          상반기에는 준비와 계획에 집중하고, 하반기에는 실행에 옮기면 좋은 결과를 얻을 수 있어요.
          특히 {result.dominantElement}의 기운을 잘 활용하면 좋은 기회가 찾아올 거예요.
        </p>
      </Card>
    </div>
  )
}

function getPersonalityByElement(element: string): string {
  const traits: Record<string, string> = {
    '목(木)': '성장과 발전을 추구하는 진취적인 성격입니다',
    '화(火)': '열정적이고 활동적인 에너지가 넘칩니다',
    '토(土)': '안정적이고 신뢰감을 주는 성격입니다',
    '금(金)': '결단력이 있고 원칙을 중시합니다',
    '수(水)': '지혜롭고 유연한 사고를 가지고 있습니다',
  }
  return traits[element] || '균형 잡힌 성격입니다'
}

export default function ResultPage() {
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
      <ResultContent />
    </Suspense>
  )
}
