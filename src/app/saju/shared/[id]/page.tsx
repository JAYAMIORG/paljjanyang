'use client'

import { useEffect, useState, useRef, useCallback, ReactNode } from 'react'
import Image from 'next/image'
import { useParams, useRouter } from 'next/navigation'
import html2canvas from 'html2canvas'
import { Header } from '@/components/layout'
import { Button, Card, LoadingScreen, WuXingRadarChart } from '@/components/ui'
import { YearlyResultContent, CompatibilityResultContent, DailyResultContent } from '@/components/result'
import { useKakaoShare } from '@/hooks'
import { WUXING_COLORS, WUXING_KOREAN } from '@/lib/saju/constants'
import type { SharedReadingResponse } from '@/app/api/saju/shared/[id]/route'

// 일간 오행 이모지 매핑
const DAY_MASTER_EMOJI: Record<string, string> = {
  '甲': '🌳', '乙': '🌿',
  '丙': '☀️', '丁': '🕯️',
  '戊': '⛰️', '己': '🏔️',
  '庚': '⚔️', '辛': '💎',
  '壬': '🌊', '癸': '💧',
}

const getDayMasterEmoji = (dayMaster: string): string => {
  return DAY_MASTER_EMOJI[dayMaster] || '🐱'
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

// 인라인 마크다운 파싱 (볼드, 이탤릭)
function parseInlineMarkdown(text: string): ReactNode[] {
  const parts: ReactNode[] = []
  const regex = /(\*\*(.+?)\*\*|\*(.+?)\*)/g
  let lastIndex = 0
  let match

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index))
    }

    if (match[2]) {
      parts.push(<strong key={match.index} className="font-semibold text-text">{match[2]}</strong>)
    } else if (match[3]) {
      parts.push(<em key={match.index}>{match[3]}</em>)
    }

    lastIndex = regex.lastIndex
  }

  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex))
  }

  return parts.length > 0 ? parts : [text]
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
            {parseInlineMarkdown(section.content)}
          </div>
        </Card>
      ))}
    </div>
  )
}

// LLM 실패 시 폴백 해석
function FallbackInterpretation({ data }: { data: NonNullable<SharedReadingResponse['data']> }) {
  const getPersonalityByElement = (element: string): string => {
    const traits: Record<string, string> = {
      '목(木)': '성장과 발전을 추구하는 진취적인 성격입니다',
      '화(火)': '열정적이고 활동적인 에너지가 넘칩니다',
      '토(土)': '안정적이고 신뢰감을 주는 성격입니다',
      '금(金)': '결단력이 있고 원칙을 중시합니다',
      '수(水)': '지혜롭고 유연한 사고를 가지고 있습니다',
    }
    return traits[element] || '균형 잡힌 성격입니다'
  }

  return (
    <div className="space-y-4">
      <Card>
        <h3 className="text-subheading font-semibold text-text mb-3">
          핵심 요약
        </h3>
        <p className="text-body text-text-muted leading-relaxed">
          당신은 <span className="font-semibold text-primary">{data.dayMasterKorean}</span>의
          성향을 가진 사람입니다. {data.dominantElement}이 강하여
          추진력과 에너지가 넘칩니다. 반면 {data.weakElement}이 부족하니
          이 부분을 보완하면 더욱 균형 잡힌 삶을 살 수 있습니다.
        </p>
      </Card>

      <Card>
        <h3 className="text-subheading font-semibold text-text mb-3">
          성격과 기질
        </h3>
        <p className="text-body text-text-muted leading-relaxed">
          {data.dayMasterKorean}의 성향을 가진 당신은 {getPersonalityByElement(data.dominantElement)}.
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
          특히 {data.dominantElement}의 기운을 잘 활용하면 좋은 기회가 찾아올 거예요.
        </p>
      </Card>
    </div>
  )
}

export default function SharedResultPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string
  const { share: shareKakao, isReady: isKakaoReady } = useKakaoShare()
  const dayPillarImageRef = useRef<HTMLDivElement>(null)
  const shareCardRef = useRef<HTMLDivElement>(null)
  const [isShareLoading, setIsShareLoading] = useState(false)

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

  // 일주 동물 이미지 다운로드
  const handleDownloadDayPillarImage = async () => {
    if (!dayPillarImageRef.current || !data) return

    try {
      const canvas = await html2canvas(dayPillarImageRef.current, {
        backgroundColor: '#FFFFFF',
        scale: 2,
        useCORS: true,
        allowTaint: true,
        logging: false,
      })

      const link = document.createElement('a')
      link.download = `나의일주_${data.dayPillarAnimal}.png`
      link.href = canvas.toDataURL('image/png')
      link.click()
    } catch (err) {
      console.error('이미지 다운로드 실패:', err)
      alert('이미지 다운로드에 실패했습니다.')
    }
  }

  // 공유 카드 이미지 생성
  const generateShareImage = useCallback(async (): Promise<Blob | null> => {
    if (!shareCardRef.current) return null

    try {
      const element = shareCardRef.current
      const originalStyle = element.parentElement?.getAttribute('style') || ''
      if (element.parentElement) {
        element.parentElement.style.cssText = 'position: fixed; left: 0; top: 0; z-index: -1; opacity: 0;'
      }

      const canvas = await html2canvas(element, {
        scale: 2,
        backgroundColor: '#FFF8F0',
        logging: false,
        useCORS: true,
        height: element.scrollHeight,
        windowHeight: element.scrollHeight + 100,
      })

      if (element.parentElement) {
        element.parentElement.style.cssText = originalStyle
      }

      return new Promise((resolve) => {
        canvas.toBlob((blob) => resolve(blob), 'image/png', 1.0)
      })
    } catch (error) {
      console.error('이미지 생성 실패:', error)
      return null
    }
  }, [])

  // 인스타그램 공유
  const handleInstagramShare = async () => {
    if (!data) return

    setIsShareLoading(true)

    try {
      const imageBlob = await generateShareImage()

      if (!imageBlob) {
        alert('이미지 생성에 실패했습니다.')
        setIsShareLoading(false)
        return
      }

      if (navigator.share && navigator.canShare) {
        const file = new File([imageBlob], 'saju-result.png', { type: 'image/png' })

        if (navigator.canShare({ files: [file] })) {
          await navigator.share({
            title: '나의 사주 결과',
            text: `${data.dayMasterKorean}의 사주 결과를 확인해보세요!`,
            files: [file],
          })
          setIsShareLoading(false)
          return
        }
      }

      const url = URL.createObjectURL(imageBlob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'saju-result.png'
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      alert('이미지가 저장되었습니다. 인스타그램에서 직접 업로드해주세요!')
    } catch (error) {
      if ((error as Error).name !== 'AbortError') {
        console.error('공유 실패:', error)
        alert('공유에 실패했습니다.')
      }
    } finally {
      setIsShareLoading(false)
    }
  }

  // 공유 URL 생성
  const getShareUrl = () => {
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : ''
    return `${baseUrl}/saju/shared/${id}`
  }

  // 링크 복사
  const handleCopyLink = async () => {
    try {
      const shareUrl = getShareUrl()
      await navigator.clipboard.writeText(shareUrl)
      alert('링크가 복사되었습니다!')
    } catch {
      alert('링크 복사에 실패했습니다.')
    }
  }

  // 카카오 공유
  const handleKakaoShare = async () => {
    if (!data) return

    const shareUrl = getShareUrl()

    const typeLabel = {
      personal: '개인 사주',
      yearly: '신년운세',
      compatibility: '궁합',
      love: '연애운',
    }[data.type] || '사주'

    const dayPillarAnimal = data.dayPillarAnimal

    const productionUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://bazi-azure.vercel.app'
    const ganziMatch = dayPillarAnimal.match(/\(([가-힣]{2})/)
    const ganziKorean = ganziMatch ? ganziMatch[1] : null
    const imageUrl = ganziKorean
      ? `${productionUrl}/images/animals/${encodeURIComponent(ganziKorean)}.png`
      : `${productionUrl}/images/og-default.png`

    shareKakao({
      title: `${dayPillarAnimal}의 ${typeLabel} - 팔자냥`,
      description: `${data.koreanGanji} - 나의 사주를 확인해보세요!`,
      imageUrl,
      buttonText: '결과 보러가기',
      shareUrl,
    })
  }

  if (isLoading) {
    return (
      <LoadingScreen message="사주 결과를 불러오는 중..." />
    )
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-background">
        <Header showBack useHistoryBack />
        <main className="px-4 py-6 max-w-lg mx-auto text-center">
          <div className="text-6xl mb-4">😿</div>
          <p className="text-body text-text mb-6">{error || '결과를 불러올 수 없습니다.'}</p>
          <Button onClick={() => router.push('/home')}>
            홈으로 가기
          </Button>
        </main>
      </div>
    )
  }

  const type = data.type
  const pageTitle = {
    personal: '사주 분석 결과',
    yearly: '신년운세 결과',
    compatibility: '궁합 분석 결과',
    love: '연애운 결과',
    daily: '오늘의 운세',
  }[type] || '사주 분석 결과'

  return (
    <div className="min-h-screen bg-background">
      <Header showBack useHistoryBack title={pageTitle} />

      {/* 공유용 카드 (화면 밖에 숨김) */}
      <div style={{ position: 'fixed', left: '-9999px', top: '-9999px' }}>
        <div
          ref={shareCardRef}
          style={{
            width: '400px',
            padding: '24px',
            background: 'linear-gradient(180deg, #FFF8F0 0%, #FFFFFF 100%)',
            fontFamily: 'system-ui, -apple-system, sans-serif',
          }}
        >
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '20px',
            paddingBottom: '16px',
            borderBottom: '1px solid #E5E7EB'
          }}>
            <span style={{ fontSize: '20px', fontWeight: 'bold', color: '#D4A574' }}>🐱 팔자냥</span>
            <span style={{ fontSize: '12px', color: '#9CA3AF' }}>AI 사주 분석</span>
          </div>

          <div style={{
            backgroundColor: '#FFF8F0',
            borderRadius: '16px',
            padding: '20px',
            marginBottom: '16px',
            border: '1px solid #F3E8DE'
          }}>
            <div style={{ textAlign: 'center' }}>
              <span style={{ fontSize: '48px', display: 'block', marginBottom: '8px' }}>{getDayMasterEmoji(data.dayMaster)}</span>
              <h2 style={{ fontSize: '22px', fontWeight: 'bold', color: '#1F2937', marginBottom: '4px' }}>
                {data.dayMasterKorean}의 기운
              </h2>
              <p style={{ color: '#6B7280', marginBottom: '16px', fontSize: '14px' }}>
                {data.koreanGanji}
              </p>

              <div style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
                {(Object.entries(data.wuXing) as [keyof typeof data.wuXing, number][]).map(
                  ([element, value]) => (
                    <div
                      key={element}
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        opacity: value > 10 ? 1 : 0.5,
                      }}
                    >
                      <div
                        style={{
                          width: '36px',
                          height: '36px',
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#FFFFFF',
                          fontSize: '13px',
                          fontWeight: 'bold',
                          backgroundColor: WUXING_COLORS[element],
                        }}
                      >
                        {value}
                      </div>
                      <span style={{ fontSize: '11px', color: '#6B7280', marginTop: '4px' }}>
                        {WUXING_KOREAN[element].charAt(0)}
                      </span>
                    </div>
                  )
                )}
              </div>
            </div>
          </div>

          <div style={{
            textAlign: 'center',
            padding: '16px',
            backgroundColor: '#D4A574',
            borderRadius: '12px',
            marginTop: '8px'
          }}>
            <p style={{ fontSize: '14px', color: '#FFFFFF', fontWeight: 'bold', marginBottom: '4px' }}>
              나도 내 사주가 궁금하다면?
            </p>
            <p style={{ fontSize: '12px', color: '#FFF8F0' }}>
              paljjanyang.com
            </p>
          </div>
        </div>
      </div>

      <main className="px-4 py-6 max-w-lg mx-auto space-y-6">
        {/* 일주 동물 - 개인 사주만 (가장 상단) */}
        {type === 'personal' && data.dayPillarAnimal && (
          <Card>
            <h3 className="text-subheading font-semibold text-text mb-4">
              나의 일주
            </h3>
            <div className="text-center">
              {(() => {
                const match = data.dayPillarAnimal.match(/\(([가-힣]{2})/)
                const ganziKorean = match ? match[1] : null
                return ganziKorean ? (
                  <div
                    ref={dayPillarImageRef}
                    onClick={handleDownloadDayPillarImage}
                    className="mb-4 inline-block cursor-pointer hover:opacity-90 transition-opacity"
                    title="클릭하여 이미지 저장"
                  >
                    <Image
                      src={`/images/animals/${ganziKorean}.png`}
                      alt={data.dayPillarAnimal}
                      width={400}
                      height={400}
                      className="rounded-2xl"
                    />
                  </div>
                ) : null
              })()}
              <p className="text-4xl font-serif mb-2">
                {data.bazi.day}
              </p>
              <p className="text-heading font-bold text-primary">
                {data.dayPillarAnimal}
              </p>
              <p className="text-small text-text-muted mt-2">
                일주(日柱)는 타고난 본성과 성격을 나타내요
              </p>
            </div>
          </Card>
        )}

        {/* 요약 카드 - 신년운세/궁합/오늘의운세 외 타입에서만 표시 */}
        {type !== 'yearly' && type !== 'compatibility' && type !== 'daily' && (
          <Card variant="highlighted">
            <div className="text-center">
              <span className="text-5xl mb-3 block">{getDayMasterEmoji(data.dayMaster)}</span>
              <h2 className="text-heading font-semibold text-text mb-2">
                {data.dayMasterKorean}의 기운
              </h2>
              <p className="text-body text-text-muted">
                {data.koreanGanji}
              </p>
            </div>

            {/* 오행 분포 - 오각형 레이더 차트 */}
            <div className="mt-6 flex flex-col items-center">
              <WuXingRadarChart wuXing={data.wuXing} size={180} />
              <p className="text-center text-caption text-text-muted mt-2">
                <span className="text-primary font-medium">강:</span> {data.dominantElement} · <span className="text-accent-rose font-medium">약:</span> {data.weakElement}
              </p>
            </div>
          </Card>
        )}

        {/* 전문가 해석 또는 폴백 - 타입별 분기 */}
        {type === 'yearly' ? (
          <YearlyResultContent
            result={{
              bazi: data.bazi,
              wuXing: data.wuXing,
              dayMaster: data.dayMaster,
              dayMasterKorean: data.dayMasterKorean,
              koreanGanji: data.koreanGanji,
              zodiacEmoji: data.zodiacEmoji,
              dominantElement: data.dominantElement,
              weakElement: data.weakElement,
              daYun: data.daYun.map((dy, index) => ({
                ...dy,
                index,
                startYear: new Date().getFullYear() + dy.startAge,
                endYear: new Date().getFullYear() + dy.endAge,
              })),
              shiShen: { yearGan: '', monthGan: '', hourGan: null },
              zodiac: '',
              naYin: '',
              dayPillarAnimal: data.dayPillarAnimal,
              dayNaYin: '',
            }}
            interpretation={data.interpretation}
          />
        ) : data.interpretation ? (
          <InterpretationCard content={data.interpretation} />
        ) : (
          <FallbackInterpretation data={data} />
        )}

        {/* 대운 흐름 - 신년운세/궁합/오늘의운세 외 타입에서만 표시 */}
        {type !== 'yearly' && type !== 'compatibility' && type !== 'daily' && data.daYun && data.daYun.length > 0 && (
          <Card>
            <h3 className="text-subheading font-semibold text-text mb-4">
              대운 흐름
            </h3>
            <div className="overflow-x-auto -mx-2 px-2">
              <div className="flex gap-2" style={{ minWidth: 'max-content' }}>
                {data.daYun.slice(0, 8).map((dy, index) => (
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
        )}

        {/* 공유 - 오늘의 운세 제외 */}
        {type !== 'daily' && (
          <Card>
            <h3 className="text-subheading font-semibold text-text mb-4">
              친구에게 공유하기
            </h3>

            <div className="flex justify-center gap-4">
              <button
                onClick={handleInstagramShare}
                disabled={isShareLoading}
                className={`w-14 h-14 flex items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 text-white transition-opacity ${
                  isShareLoading ? 'opacity-50 cursor-wait' : 'hover:opacity-90'
                }`}
              >
                {isShareLoading ? (
                  <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                )}
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
            <p className="text-center text-small text-text-muted mt-3">
              친구에게 결과를 공유해보세요
            </p>
          </Card>
        )}

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
