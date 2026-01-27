'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Header, Footer } from '@/components/layout'
import { Card, Button, LoadingScreen, ErrorCard } from '@/components/ui'
import { useAuth } from '@/hooks'
import type { ReadingDetailResponse } from '@/app/api/saju/history/[id]/route'

const TYPE_LABELS: Record<string, string> = {
  personal: '개인 사주',
  yearly: '신년운세',
  compatibility: '궁합',
  love: '연애운',
  daily: '오늘의 운세',
}

const WUXING_LABELS: Record<string, { name: string; color: string }> = {
  wood: { name: '목', color: 'bg-green-500' },
  fire: { name: '화', color: 'bg-red-500' },
  earth: { name: '토', color: 'bg-yellow-500' },
  metal: { name: '금', color: 'bg-gray-400' },
  water: { name: '수', color: 'bg-blue-500' },
}

// 오행 비교 컴포넌트
function WuXingComparisonBar({
  wuXing1,
  wuXing2,
  name1,
  name2,
}: {
  wuXing1: Record<string, number>
  wuXing2: Record<string, number>
  name1: string
  name2: string
}) {
  const elements = ['wood', 'fire', 'earth', 'metal', 'water'] as const
  const WUXING_KOREAN: Record<string, string> = {
    wood: '목',
    fire: '화',
    earth: '토',
    metal: '금',
    water: '수',
  }
  const WUXING_COLORS: Record<string, string> = {
    wood: '#7FB069',
    fire: '#FF6B6B',
    earth: '#FFB366',
    metal: '#A8A8A8',
    water: '#4ECDC4',
  }

  return (
    <div className="space-y-3">
      <div className="flex justify-between text-small text-text-muted mb-2">
        <span>{name1}</span>
        <span>{name2}</span>
      </div>
      {elements.map((element) => (
        <div key={element} className="flex items-center gap-2">
          <div className="flex-1 flex items-center justify-end gap-2">
            <span className="text-small text-text-muted">{wuXing1[element]}%</span>
            <div className="w-16 h-3 bg-gray-100 rounded-full overflow-hidden flex justify-end">
              <div
                className="h-full rounded-full"
                style={{
                  width: `${wuXing1[element]}%`,
                  backgroundColor: WUXING_COLORS[element],
                }}
              />
            </div>
          </div>
          <div
            className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
            style={{ backgroundColor: WUXING_COLORS[element] }}
          >
            {WUXING_KOREAN[element]}
          </div>
          <div className="flex-1 flex items-center gap-2">
            <div className="w-16 h-3 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full"
                style={{
                  width: `${wuXing2[element]}%`,
                  backgroundColor: WUXING_COLORS[element],
                }}
              />
            </div>
            <span className="text-small text-text-muted">{wuXing2[element]}%</span>
          </div>
        </div>
      ))}
    </div>
  )
}

export default function ReadingDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { user, loading: authLoading, isConfigured } = useAuth()
  const [reading, setReading] = useState<ReadingDetailResponse['data'] | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const id = params.id as string

  useEffect(() => {
    if (!authLoading && !user && isConfigured) {
      router.push('/auth/login?redirect=/mypage')
    }
  }, [authLoading, user, isConfigured, router])

  useEffect(() => {
    if (!user || !id) return

    const fetchReading = async () => {
      try {
        const response = await fetch(`/api/saju/history/${id}`)
        const data = await response.json()

        if (data.success) {
          setReading(data.data)
        } else {
          setError(data.error?.message || '결과를 불러올 수 없습니다.')
        }
      } catch {
        setError('서버 연결에 실패했습니다.')
      } finally {
        setIsLoading(false)
      }
    }

    fetchReading()
  }, [user, id])

  if (authLoading || (!user && isConfigured)) {
    return <LoadingScreen message="로딩 중..." />
  }

  if (isLoading) {
    return <LoadingScreen message="결과를 불러오는 중..." />
  }

  if (error || !reading) {
    return (
      <div className="min-h-screen bg-background">
        <Header showBack backHref="/mypage" title="상세 보기" />
        <main className="px-4 py-8 max-w-lg mx-auto">
          <ErrorCard message={error || '결과를 찾을 수 없습니다.'} />
          <div className="mt-4">
            <Link href="/mypage">
              <Button variant="secondary" fullWidth>마이페이지로 돌아가기</Button>
            </Link>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header showBack backHref="/mypage" title={TYPE_LABELS[reading.type] || '사주 결과'} />

      <main className="px-4 py-6 max-w-lg mx-auto space-y-4 flex-1">
        {reading.type === 'compatibility' && reading.person2 ? (
          // 궁합 결과 뷰
          <>
            {/* 두 사람 요약 */}
            <Card variant="highlighted">
              <div className="flex items-center justify-center gap-4">
                <div className="text-center">
                  <span className="text-3xl block mb-1">{reading.zodiacEmoji}</span>
                  <p className="font-semibold text-text">{reading.name1 || '첫 번째'}</p>
                  <p className="text-small text-primary">{reading.dayMasterKorean}</p>
                </div>
                <span className="text-2xl">💕</span>
                <div className="text-center">
                  <span className="text-3xl block mb-1">{reading.person2.zodiacEmoji}</span>
                  <p className="font-semibold text-text">{reading.name2 || '두 번째'}</p>
                  <p className="text-small text-primary">{reading.person2.dayMasterKorean}</p>
                </div>
              </div>
              <p className="text-small text-text-muted text-center mt-3">
                {new Date(reading.createdAt).toLocaleDateString('ko-KR')} 분석
              </p>
            </Card>

            {/* 오행 비교 */}
            <Card>
              <h3 className="text-body font-semibold text-text mb-3">🔮 오행 궁합</h3>
              <WuXingComparisonBar
                wuXing1={reading.wuXing}
                wuXing2={reading.person2.wuXing}
                name1={reading.name1 || '첫 번째'}
                name2={reading.name2 || '두 번째'}
              />
            </Card>

            {/* 해석 */}
            {reading.interpretation && (
              <Card>
                <h3 className="text-body font-semibold text-text mb-3">상세 해석</h3>
                <div className="text-small text-text-muted whitespace-pre-wrap leading-relaxed">
                  {reading.interpretation}
                </div>
              </Card>
            )}
          </>
        ) : (
          // 일반 사주 결과 뷰
          <>
            {/* 기본 정보 */}
            <Card>
              <div className="flex items-center gap-4 mb-4">
                <span className="text-4xl">{reading.zodiacEmoji}</span>
                <div>
                  <h2 className="text-subheading font-semibold text-text">{reading.dayMasterKorean}</h2>
                  <p className="text-small text-text-muted">
                    {new Date(reading.createdAt).toLocaleDateString('ko-KR')} 분석
                  </p>
                </div>
              </div>

              {reading.koreanGanji && (
                <div className="bg-primary/5 rounded-lg p-3 text-center">
                  <p className="text-body font-medium text-primary">{reading.koreanGanji}</p>
                </div>
              )}
            </Card>

            {/* 사주팔자 */}
            <Card>
              <h3 className="text-body font-semibold text-text mb-3">사주팔자</h3>
              <div className="grid grid-cols-4 gap-2 text-center">
                <div className="bg-gray-50 rounded-lg p-2">
                  <p className="text-caption text-text-muted">시주</p>
                  <p className="text-body font-medium">{reading.bazi.time || '-'}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-2">
                  <p className="text-caption text-text-muted">일주</p>
                  <p className="text-body font-medium">{reading.bazi.day}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-2">
                  <p className="text-caption text-text-muted">월주</p>
                  <p className="text-body font-medium">{reading.bazi.month}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-2">
                  <p className="text-caption text-text-muted">년주</p>
                  <p className="text-body font-medium">{reading.bazi.year}</p>
                </div>
              </div>
            </Card>

            {/* 오행 분포 */}
            <Card>
              <h3 className="text-body font-semibold text-text mb-3">오행 분포</h3>
              <div className="space-y-2">
                {Object.entries(reading.wuXing).map(([key, value]) => (
                  <div key={key} className="flex items-center gap-2">
                    <span className="w-8 text-small text-text-muted">
                      {WUXING_LABELS[key]?.name}
                    </span>
                    <div className="flex-1 bg-gray-100 rounded-full h-4 overflow-hidden">
                      <div
                        className={`h-full ${WUXING_LABELS[key]?.color} transition-all`}
                        style={{ width: `${value}%` }}
                      />
                    </div>
                    <span className="w-10 text-small text-text-muted text-right">
                      {value}%
                    </span>
                  </div>
                ))}
              </div>
              <div className="mt-3 flex gap-4 text-small">
                <p className="text-text-muted">
                  강한 기운: <span className="text-primary font-medium">{reading.dominantElement}</span>
                </p>
                <p className="text-text-muted">
                  약한 기운: <span className="text-accent font-medium">{reading.weakElement}</span>
                </p>
              </div>
            </Card>

            {/* 해석 */}
            {reading.interpretation && (
              <Card>
                <h3 className="text-body font-semibold text-text mb-3">상세 해석</h3>
                <div className="text-small text-text-muted whitespace-pre-wrap leading-relaxed">
                  {reading.interpretation}
                </div>
              </Card>
            )}
          </>
        )}
      </main>

      <Footer />
    </div>
  )
}
