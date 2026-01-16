'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
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

function ResultContent() {
  const searchParams = useSearchParams()
  const { user, isConfigured } = useAuth()
  const [result, setResult] = useState<SajuResult | null>(null)
  const [interpretation, setInterpretation] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isInterpretLoading, setIsInterpretLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [isSaved, setIsSaved] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  const type = searchParams.get('type') || 'personal'
  const gender = searchParams.get('gender') || 'female'
  const year = searchParams.get('year')
  const month = searchParams.get('month')
  const day = searchParams.get('day')
  const hour = searchParams.get('hour')
  const lunar = searchParams.get('lunar')

  const handleSave = async () => {
    if (!result || !user) return

    setIsSaving(true)
    setSaveError(null)

    try {
      const response = await fetch('/api/saju/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type,
          sajuResult: result,
          interpretation,
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

      const data = await response.json()

      if (data.success) {
        setIsSaved(true)
      } else {
        setSaveError(data.error?.message || '저장에 실패했습니다.')
      }
    } catch {
      setSaveError('서버 연결에 실패했습니다.')
    } finally {
      setIsSaving(false)
    }
  }

  useEffect(() => {
    const fetchSaju = async () => {
      try {
        const year = searchParams.get('year')
        const month = searchParams.get('month')
        const day = searchParams.get('day')
        const hour = searchParams.get('hour')
        const lunar = searchParams.get('lunar')

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
  }, [searchParams, gender])

  // LLM 해석 요청
  useEffect(() => {
    if (!result) return

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
        }
      } catch {
        // LLM 실패 시 기본 텍스트 사용
        console.log('LLM interpretation failed, using fallback')
      } finally {
        setIsInterpretLoading(false)
      }
    }

    fetchInterpretation()
  }, [result, type, gender])

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
        <Header showBack backHref="/home" />
        <main className="px-4 py-6 max-w-lg mx-auto text-center">
          <div className="text-6xl mb-4">😿</div>
          <p className="text-body text-text">{error || '결과를 불러올 수 없습니다.'}</p>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Header showBack backHref="/home" title="사주 분석 결과" />

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

        {/* 저장 및 공유 */}
        <Card>
          <h3 className="text-subheading font-semibold text-text mb-4">
            결과 저장 & 공유
          </h3>

          {/* 저장 버튼 */}
          {isConfigured && (
            <div className="mb-4">
              {user ? (
                isSaved ? (
                  <div className="flex items-center justify-center gap-2 py-3 bg-green-50 rounded-lg">
                    <span className="text-green-600">✓</span>
                    <span className="text-body text-green-600">저장되었습니다!</span>
                    <Link href="/mypage" className="text-small text-primary underline ml-2">
                      마이페이지에서 보기
                    </Link>
                  </div>
                ) : (
                  <>
                    <Button
                      fullWidth
                      onClick={handleSave}
                      disabled={isSaving}
                    >
                      {isSaving ? '저장 중...' : '내 기록에 저장하기'}
                    </Button>
                    {saveError && (
                      <p className="text-small text-red-500 text-center mt-2">{saveError}</p>
                    )}
                  </>
                )
              ) : (
                <Link href={`/auth/login?redirect=${encodeURIComponent(window.location.pathname + window.location.search)}`}>
                  <Button variant="secondary" fullWidth>
                    로그인하고 저장하기
                  </Button>
                </Link>
              )}
            </div>
          )}

          {/* 공유 버튼들 */}
          <div className="grid grid-cols-3 gap-3">
            <Button variant="secondary" size="sm">
              인스타
            </Button>
            <Button variant="secondary" size="sm">
              링크복사
            </Button>
            <Button variant="secondary" size="sm">
              카카오
            </Button>
          </div>
          <p className="text-center text-small text-accent mt-3">
            공유하면 1코인 적립!
          </p>
        </Card>
      </main>
    </div>
  )
}

// LLM 해석 표시 컴포넌트
function InterpretationCard({ content }: { content: string }) {
  // 마크다운을 간단히 파싱하여 섹션별로 표시
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
    // ## 또는 ### 헤더 감지
    const headerMatch = line.match(/^#{1,3}\s+(.+)$/)
    if (headerMatch) {
      // 이전 섹션 저장
      if (currentSection.content.length > 0 || currentSection.title) {
        sections.push({
          title: currentSection.title,
          content: currentSection.content.join('\n').trim(),
        })
      }
      // 새 섹션 시작
      currentSection = { title: headerMatch[1], content: [] }
    } else {
      // 일반 텍스트
      currentSection.content.push(line)
    }
  }

  // 마지막 섹션 저장
  if (currentSection.content.length > 0 || currentSection.title) {
    sections.push({
      title: currentSection.title,
      content: currentSection.content.join('\n').trim(),
    })
  }

  // 빈 섹션 필터링
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
