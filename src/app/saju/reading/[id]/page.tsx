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
}

const WUXING_LABELS: Record<string, { name: string; color: string }> = {
  wood: { name: '목', color: 'bg-green-500' },
  fire: { name: '화', color: 'bg-red-500' },
  earth: { name: '토', color: 'bg-yellow-500' },
  metal: { name: '금', color: 'bg-gray-400' },
  water: { name: '수', color: 'bg-blue-500' },
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

        {/* 대운 */}
        {reading.daYun && reading.daYun.length > 0 && (
          <Card>
            <h3 className="text-body font-semibold text-text mb-3">대운 흐름</h3>
            <div className="flex overflow-x-auto gap-2 pb-2">
              {reading.daYun.slice(0, 8).map((dy, index) => (
                <div
                  key={index}
                  className="flex-shrink-0 bg-gray-50 rounded-lg p-2 text-center min-w-[60px]"
                >
                  <p className="text-caption text-text-muted">
                    {dy.startAge}-{dy.endAge}세
                  </p>
                  <p className="text-small font-medium">{dy.ganZhi}</p>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* 해석 */}
        {reading.interpretation && (
          <Card>
            <h3 className="text-body font-semibold text-text mb-3">상세 해석</h3>
            <div className="text-small text-text-muted whitespace-pre-wrap leading-relaxed">
              {reading.interpretation}
            </div>
          </Card>
        )}
      </main>

      <Footer />
    </div>
  )
}
