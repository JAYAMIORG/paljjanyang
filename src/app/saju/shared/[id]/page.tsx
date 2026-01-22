'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { useParams, useRouter } from 'next/navigation'
import { Header } from '@/components/layout'
import { Button, Card } from '@/components/ui'
import { InterpretationCard, FallbackInterpretation } from '@/components/result'
import { WUXING_COLORS, WUXING_KOREAN } from '@/lib/saju/constants'
import type { SharedReadingResponse } from '@/app/api/saju/shared/[id]/route'

export default function SharedResultPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string

  const [data, setData] = useState<SharedReadingResponse['data'] | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchSharedResult = async () => {
      try {
        const response = await fetch(`/api/saju/shared/${id}`)
        const result: SharedReadingResponse = await response.json()

        if (result.success && result.data) {
          setData(result.data)
        } else {
          setError(result.error?.message || '결과를 찾을 수 없습니다.')
        }
      } catch {
        setError('서버 연결에 실패했습니다.')
      } finally {
        setIsLoading(false)
      }
    }

    if (id) {
      fetchSharedResult()
    }
  }, [id])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Image
            src="/images/brand-character.png"
            alt=""
            width={96}
            height={96}
            className="h-24 w-auto mx-auto mb-4 animate-bounce"
          />
          <p className="text-body text-text-muted">사주 결과를 불러오는 중...</p>
        </div>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="px-4 py-6 max-w-lg mx-auto text-center">
          <div className="text-6xl mb-4">😿</div>
          <p className="text-body text-text mb-6">{error || '결과를 불러올 수 없습니다.'}</p>
          <Button onClick={() => router.push('/home')}>
            나도 사주 보러가기
          </Button>
        </main>
      </div>
    )
  }

  const typeLabel = {
    personal: '개인 사주',
    yearly: '신년운세',
    compatibility: '궁합',
    love: '연애운',
  }[data.type] || '사주'

  return (
    <div className="min-h-screen bg-background">
      <Header title="공유된 사주 결과" />

      <main className="px-4 py-6 max-w-lg mx-auto space-y-6">
        {/* 공유 안내 배너 */}
        <div className="bg-primary/10 border border-primary/20 rounded-xl p-4 text-center">
          <p className="text-small text-primary font-medium">
            친구가 공유한 {typeLabel} 결과예요!
          </p>
        </div>

        {/* 요약 카드 */}
        <Card variant="highlighted">
          <div className="text-center">
            <span className="text-5xl mb-3 block">{data.zodiacEmoji}</span>
            <h2 className="text-heading font-semibold text-text mb-2">
              {data.dayMasterKorean}의 기운
            </h2>
            <p className="text-body text-text-muted">
              {data.koreanGanji}
            </p>
          </div>

          {/* 오행 미니 차트 */}
          <div className="mt-6 flex justify-center gap-2">
            {(Object.entries(data.wuXing) as [keyof typeof data.wuXing, number][]).map(
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

        {/* 사주 팔자 */}
        <Card>
          <h3 className="text-subheading font-semibold text-text mb-4">
            사주팔자
          </h3>
          <div className="grid grid-cols-4 gap-2 text-center">
            {['year', 'month', 'day', 'time'].map((pillar) => {
              const ganZhi = data.bazi[pillar as keyof typeof data.bazi]
              return (
                <div key={pillar} className="bg-gray-50 rounded-lg p-3">
                  <p className="text-caption text-text-muted mb-1">
                    {pillar === 'year' ? '년주' : pillar === 'month' ? '월주' : pillar === 'day' ? '일주' : '시주'}
                  </p>
                  <p className="text-body font-serif text-primary">
                    {ganZhi || '미상'}
                  </p>
                </div>
              )
            })}
          </div>
        </Card>

        {/* 해석 - 원본과 동일한 형태로 표시 */}
        {data.interpretation ? (
          <InterpretationCard content={data.interpretation} />
        ) : (
          <FallbackInterpretation data={data} isShared />
        )}

        {/* CTA 영역 */}
        <Card className="text-center">
          <span className="text-4xl block mb-3">✨</span>
          <h3 className="text-subheading font-semibold text-text mb-2">
            나도 내 사주가 궁금하다면?
          </h3>
          <p className="text-body text-text-muted mb-4">
            단돈 1코인으로 AI가 분석해주는<br />
            나만의 사주를 확인해보세요!
          </p>
          <Button
            fullWidth
            onClick={() => router.push('/home')}
          >
            🐱 나도 사주 보러가기
          </Button>
        </Card>

        {/* 앱 소개 */}
        <div className="text-center py-4">
          <p className="text-small text-text-light">
            팔자냥 - MZ세대를 위한 사주 서비스
          </p>
        </div>
      </main>
    </div>
  )
}
