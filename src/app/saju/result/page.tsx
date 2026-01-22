'use client'

import { useEffect, useState, Suspense, useRef, useCallback } from 'react'
import Image from 'next/image'
import { useSearchParams, useRouter } from 'next/navigation'
import html2canvas from 'html2canvas'
import { Header } from '@/components/layout'
import { Button, Card, LoadingScreen, ErrorScreen, InsufficientCoinsModal } from '@/components/ui'
import { YearlyResultContent, CompatibilityResultContent, DailyResultContent } from '@/components/result'
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

// 일간 오행 이모지 매핑
const DAY_MASTER_EMOJI: Record<string, string> = {
  '甲': '🌳', '乙': '🌿',
  '丙': '☀️', '丁': '🕯️',
  '戊': '⛰️', '己': '🏔️',
  '庚': '⚔️', '辛': '💎',
  '壬': '🌊', '癸': '💧',
}

// 일간에서 이모지 가져오기
const getDayMasterEmoji = (dayMaster: string): string => {
  return DAY_MASTER_EMOJI[dayMaster] || '🐱'
}

function ResultContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const { share: shareKakao, isReady: isKakaoReady, isMobile } = useKakaoShare()
  const [result, setResult] = useState<SajuResult | null>(null)
  const [result2, setResult2] = useState<SajuResult | null>(null) // 궁합용
  const [showMobileOnlyModal, setShowMobileOnlyModal] = useState(false)
  const [copiedLink, setCopiedLink] = useState(false)
  const [isShareLoading, setIsShareLoading] = useState(false)
  const [interpretation, setInterpretation] = useState<string | null>(null)
  const shareCardRef = useRef<HTMLDivElement>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isInterpretLoading, setIsInterpretLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [coinError, setCoinError] = useState<string | null>(null)
  const [showInsufficientModal, setShowInsufficientModal] = useState(false)
  const [coinBalance, setCoinBalance] = useState<number>(0)
  const [readingId, setReadingId] = useState<string | null>(null)
  const [shareRewardClaimed, setShareRewardClaimed] = useState(false)
  const [showRewardToast, setShowRewardToast] = useState(false)
  const [isDailyNew, setIsDailyNew] = useState(true) // 오늘의 운세가 새로 생성된 것인지
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
  const savedId = searchParams.get('id') // 저장된 결과 ID

  // 타입별 분기
  const isCompatibility = type === 'compatibility'
  const isDaily = type === 'daily'
  const name1 = searchParams.get('name1') || '첫 번째 사람'
  const name2 = searchParams.get('name2') || '두 번째 사람'
  const gender2 = searchParams.get('gender2') || 'female'
  const year2 = searchParams.get('year2')
  const month2 = searchParams.get('month2')
  const day2 = searchParams.get('day2')
  const hour2 = searchParams.get('hour2')
  const lunar2 = searchParams.get('lunar2')

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

      const data = await response.json()
      if (data.success && data.data?.readingId) {
        setReadingId(data.data.readingId)
        // URL에 id 추가하여 새로고침 시 저장된 결과 사용
        const newUrl = new URL(window.location.href)
        newUrl.searchParams.set('id', data.data.readingId)
        window.history.replaceState({}, '', newUrl.toString())
      }
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

  // 코인 환불 함수 (사주 계산 실패 시 롤백용)
  const refundCoin = async (reason: string): Promise<boolean> => {
    if (!hasDeductedCoinRef.current || !user) return false

    try {
      const response = await fetch('/api/saju/refund-coin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, reason }),
      })

      const data = await response.json()

      if (data.success) {
        hasDeductedCoinRef.current = false
        console.log('Coin refunded successfully:', data.data?.newBalance)
        return true
      } else {
        console.error('Coin refund failed:', data.error?.message)
        return false
      }
    } catch (err) {
      console.error('Coin refund error:', err)
      return false
    }
  }

  // 저장된 결과 불러오기
  const fetchSavedReading = async (id: string): Promise<boolean> => {
    try {
      const response = await fetch(`/api/saju/history/${id}`)
      const data = await response.json()

      if (data.success && data.data) {
        setResult({
          bazi: data.data.bazi,
          wuXing: data.data.wuXing,
          dayMaster: data.data.dayMaster,
          dayMasterKorean: data.data.dayMasterKorean,
          koreanGanji: data.data.koreanGanji,
          zodiacEmoji: data.data.zodiacEmoji,
          dominantElement: data.data.dominantElement,
          weakElement: data.data.weakElement,
          daYun: data.data.daYun || [],
          // 저장되지 않은 필드는 기본값 사용
          shiShen: { yearGan: '', monthGan: '', hourGan: null },
          zodiac: '',
          naYin: '',
        })
        setInterpretation(data.data.interpretation)
        setReadingId(id)
        hasSavedRef.current = true // 이미 저장된 결과
        hasDeductedCoinRef.current = true // 이미 코인 차감됨
        return true
      }
      return false
    } catch {
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
        // 로그인 체크 (인증 로딩 완료 후)
        if (!user) {
          const currentUrl = `/saju/result?${searchParams.toString()}`
          router.push(`/auth/login?redirect=${encodeURIComponent(currentUrl)}`)
          return
        }

        // 저장된 결과가 있으면 불러오기
        if (savedId) {
          const loaded = await fetchSavedReading(savedId)
          if (loaded) {
            setIsLoading(false)
            return
          }
        }

        // 새로 계산하는 경우
        if (!year || !month || !day || !gender) {
          setError('필수 정보가 누락되었습니다.')
          setIsLoading(false)
          return
        }

        // 궁합인 경우 두 번째 사람 정보도 확인
        if (isCompatibility && (!year2 || !month2 || !day2 || !gender2)) {
          setError('궁합 분석에는 두 사람의 정보가 필요합니다.')
          setIsLoading(false)
          return
        }

        // 오늘의 운세는 무료 - 별도 API 사용
        if (isDaily) {
          // 먼저 사주 계산
          const calcResponse = await fetch('/api/saju/calculate', {
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

          const calcData = await calcResponse.json()
          if (!calcData.success) {
            setError(calcData.error?.message || '사주 계산 중 오류가 발생했습니다.')
            setIsLoading(false)
            return
          }

          // daily API 호출 (하루 1회 제한 + LLM 해석)
          const dailyResponse = await fetch('/api/saju/daily', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              sajuResult: calcData.data,
              gender,
            }),
          })

          const dailyData = await dailyResponse.json()
          if (!dailyData.success) {
            setError(dailyData.error?.message || '오늘의 운세 조회 중 오류가 발생했습니다.')
            setIsLoading(false)
            return
          }

          setResult(calcData.data)
          setInterpretation(dailyData.data.interpretation)
          setIsDailyNew(dailyData.data.isNew)
          hasSavedRef.current = true // daily는 API에서 자동 저장
          hasDeductedCoinRef.current = true // 무료이지만 중복 방지용
          setIsLoading(false)
          return
        }

        // 코인 차감 먼저 시도 (daily 외 타입)
        const coinDeducted = await deductCoin()
        if (!coinDeducted) {
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
        if (!data.success) {
          await refundCoin('사주 계산 실패')
          setError(data.error?.message || '사주 계산 중 오류가 발생했습니다.')
          return
        }

        setResult(data.data)

        // 궁합인 경우 두 번째 사람도 계산
        if (isCompatibility) {
          const response2 = await fetch('/api/saju/calculate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              birthYear: parseInt(year2!),
              birthMonth: parseInt(month2!),
              birthDay: parseInt(day2!),
              birthHour: hour2 && parseInt(hour2) >= 0 ? parseInt(hour2) : null,
              isLunar: lunar2 === '1',
              isLeapMonth: false,
              gender: gender2,
            }),
          })

          const data2 = await response2.json()
          if (!data2.success) {
            await refundCoin('두 번째 사람 사주 계산 실패')
            setError(data2.error?.message || '두 번째 사람 사주 계산 중 오류가 발생했습니다.')
            return
          }

          setResult2(data2.data)
        }
      } catch {
        // 네트워크 오류 시에도 코인 환불
        await refundCoin('서버 연결 실패')
        setError('서버 연결에 실패했습니다.')
      } finally {
        setIsLoading(false)
      }
    }

    fetchSaju()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading, user])

  // LLM 해석 요청 및 자동 저장 (저장된 결과가 아닌 경우만)
  useEffect(() => {
    if (!result || !user) return

    // 궁합인 경우 두 번째 결과도 있어야 함
    if (isCompatibility && !result2) return

    // 이미 저장된 결과를 불러온 경우 스킵
    if (hasSavedRef.current) return

    const fetchInterpretation = async () => {
      setIsInterpretLoading(true)
      try {
        // 궁합인 경우 두 사람 정보 모두 전달
        const requestBody = isCompatibility
          ? {
              type,
              sajuResult: result,
              gender,
              sajuResult2: result2,
              gender2,
              name1,
              name2,
            }
          : {
              type,
              sajuResult: result,
              gender,
            }

        const response = await fetch('/api/saju/interpret', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(requestBody),
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
  }, [result, result2])

  // 공유 보상 수령 여부 확인
  useEffect(() => {
    if (!user) return

    const checkShareRewardStatus = async () => {
      try {
        const response = await fetch('/api/share/reward')
        const data = await response.json()
        if (data.success && data.data?.alreadyClaimed) {
          setShareRewardClaimed(true)
        }
      } catch {
        // 실패해도 무시 (기본값 false 유지)
      }
    }

    checkShareRewardStatus()
  }, [user])

  // 공유 보상 요청
  const claimShareReward = async () => {
    if (shareRewardClaimed) return

    try {
      const response = await fetch('/api/share/reward', {
        method: 'POST',
      })
      const data = await response.json()

      if (data.success) {
        if (data.data.rewarded) {
          // 보상 지급됨
          setShowRewardToast(true)
          setTimeout(() => setShowRewardToast(false), 3000)
        }
        setShareRewardClaimed(true)
      }
    } catch {
      // 보상 실패해도 공유는 진행
      console.error('Share reward failed')
    }
  }

  // 링크 복사
  const handleCopyLink = async () => {
    try {
      const shareUrl = getShareUrl()
      await navigator.clipboard.writeText(shareUrl)
      await claimShareReward()
      alert('링크가 복사되었습니다!')
    } catch {
      alert('링크 복사에 실패했습니다.')
    }
  }

  // 공유 카드 이미지 생성
  const generateShareImage = useCallback(async (): Promise<Blob | null> => {
    if (!shareCardRef.current) return null

    try {
      // 캡처 전 요소를 화면에 임시로 표시 (오프스크린 렌더링 문제 해결)
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

      // 원래 스타일로 복원
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
    if (!result) return

    setIsShareLoading(true)

    try {
      const imageBlob = await generateShareImage()

      if (!imageBlob) {
        alert('이미지 생성에 실패했습니다.')
        setIsShareLoading(false)
        return
      }

      // Web Share API 지원 확인 (모바일)
      if (navigator.share && navigator.canShare) {
        const file = new File([imageBlob], 'saju-result.png', { type: 'image/png' })

        if (navigator.canShare({ files: [file] })) {
          await navigator.share({
            title: '나의 사주 결과',
            text: `${result.dayMasterKorean}의 사주 결과를 확인해보세요!`,
            files: [file],
          })
          await claimShareReward()
          setIsShareLoading(false)
          return
        }
      }

      // Web Share API 미지원 시 이미지 다운로드
      const url = URL.createObjectURL(imageBlob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'saju-result.png'
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      await claimShareReward()
      alert('이미지가 저장되었습니다. 인스타그램에서 직접 업로드해주세요!')
    } catch (error) {
      // 사용자가 공유 취소한 경우는 에러 아님
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
    if (readingId) {
      return `${baseUrl}/saju/shared/${readingId}`
    }
    return typeof window !== 'undefined' ? window.location.href : ''
  }

  // 카카오 공유
  const handleKakaoShare = async () => {
    if (!result) return

    const shareUrl = getShareUrl()

    // 데스크톱에서는 안내 모달 표시
    if (!isMobile) {
      try {
        await navigator.clipboard.writeText(shareUrl)
        setCopiedLink(true)
        await claimShareReward()
      } catch {
        setCopiedLink(false)
      }
      setShowMobileOnlyModal(true)
      return
    }

    const typeLabel = {
      personal: '개인 사주',
      yearly: '신년운세',
      compatibility: '궁합',
      love: '연애운',
    }[type] || '사주'

    shareKakao({
      title: `${result.dayMasterKorean}의 ${typeLabel} 결과`,
      description: `${result.koreanGanji} - 나의 사주를 확인해보세요!`,
      buttonText: '결과 보러가기',
      shareUrl,
    })

    // 카카오 공유 시 보상 지급 (실제 공유 여부 확인 불가)
    await claimShareReward()
  }

  // 사주 계산 중이거나 LLM 해석 로딩 중일 때 전체 로딩 화면 표시
  if (isLoading || isInterpretLoading) {
    return (
      <LoadingScreen
        message={isLoading ? '사주를 계산하고 있어요...' : '운명을 해석하고 있어요...'}
      />
    )
  }

  // 코인 부족 시
  if (showInsufficientModal) {
    return (
      <ErrorScreen
        title="코인이 부족해요"
        message={`전체 해석을 보려면 1코인이 필요해요.\n현재 보유 코인: ${coinBalance}`}
        emoji="😿"
        showRetry
        onRetry={() => router.push('/coin')}
        showHome
        onHome={() => router.push('/home')}
      />
    )
  }

  if (coinError && !showInsufficientModal) {
    return (
      <ErrorScreen
        message={coinError}
        showHome
        onHome={() => router.push('/home')}
      />
    )
  }

  if (error || !result) {
    return (
      <ErrorScreen
        message={error || '결과를 불러올 수 없습니다.'}
        showHome
        onHome={() => router.push('/home')}
      />
    )
  }

  // 타입에 따른 제목
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

      {/* 공유용 카드 (화면 밖에 숨김) - 인라인 스타일 사용 (html2canvas 호환) */}
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
          {/* 헤더 */}
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

          {/* 요약 카드 */}
          <div style={{
            backgroundColor: '#FFF8F0',
            borderRadius: '16px',
            padding: '20px',
            marginBottom: '16px',
            border: '1px solid #F3E8DE'
          }}>
            <div style={{ textAlign: 'center' }}>
              <span style={{ fontSize: '48px', display: 'block', marginBottom: '8px' }}>{getDayMasterEmoji(result.dayMaster)}</span>
              <h2 style={{ fontSize: '22px', fontWeight: 'bold', color: '#1F2937', marginBottom: '4px' }}>
                {result.dayMasterKorean}의 기운
              </h2>
              <p style={{ color: '#6B7280', marginBottom: '16px', fontSize: '14px' }}>
                {result.koreanGanji}
              </p>

              {/* 오행 차트 */}
              <div style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
                {(Object.entries(result.wuXing) as [keyof typeof result.wuXing, number][]).map(
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

          {/* 해석 내용 - 전체 표시 */}
          {interpretation && (
            <div style={{ marginBottom: '16px' }}>
              {parseMarkdownSections(interpretation).map((section, index) => (
                <div
                  key={index}
                  style={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: '12px',
                    padding: '16px',
                    marginBottom: '12px',
                    border: '1px solid #E5E7EB'
                  }}
                >
                  {section.title && (
                    <h3 style={{
                      fontSize: '15px',
                      fontWeight: 'bold',
                      color: '#D4A574',
                      marginBottom: '8px'
                    }}>
                      {section.title}
                    </h3>
                  )}
                  <p style={{
                    fontSize: '13px',
                    color: '#4B5563',
                    lineHeight: '1.6',
                    whiteSpace: 'pre-wrap'
                  }}>
                    {section.content}
                  </p>
                </div>
              ))}
            </div>
          )}

          {/* 폴백 해석 (LLM 해석 없을 때) */}
          {!interpretation && (
            <div style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '12px',
              padding: '16px',
              marginBottom: '16px',
              border: '1px solid #E5E7EB'
            }}>
              <h3 style={{
                fontSize: '15px',
                fontWeight: 'bold',
                color: '#D4A574',
                marginBottom: '8px'
              }}>
                핵심 요약
              </h3>
              <p style={{ fontSize: '13px', color: '#4B5563', lineHeight: '1.6' }}>
                {result.dayMasterKorean}의 성향을 가진 사주입니다.
                {result.dominantElement}이 강하여 추진력과 에너지가 넘치는 특징이 있습니다.
              </p>
            </div>
          )}

          {/* 하단 CTA */}
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
        {/* 요약 카드 - 신년운세/궁합/오늘의운세 외 타입에서만 표시 */}
        {type !== 'yearly' && type !== 'compatibility' && type !== 'daily' && (
          <Card variant="highlighted">
            <div className="text-center">
              <span className="text-5xl mb-3 block">{getDayMasterEmoji(result.dayMaster)}</span>
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
        )}

        {/* 전문가 해석 또는 폴백 - 타입별 분기 */}
        {type === 'daily' ? (
          <DailyResultContent
            result={result}
            interpretation={interpretation}
            isNew={isDailyNew}
          />
        ) : type === 'yearly' ? (
          <YearlyResultContent result={result} interpretation={interpretation} />
        ) : type === 'compatibility' && result2 ? (
          <CompatibilityResultContent
            result1={result}
            result2={result2}
            name1={name1}
            name2={name2}
            gender1={gender}
            gender2={gender2}
            interpretation={interpretation}
          />
        ) : interpretation ? (
          <InterpretationCard content={interpretation} />
        ) : (
          <FallbackInterpretation result={result} />
        )}

        {/* 대운 흐름 - 신년운세/궁합/오늘의운세 외 타입에서만 표시 */}
        {type !== 'yearly' && type !== 'compatibility' && type !== 'daily' && (
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
        )}

        {/* 공유 - 오늘의 운세 제외 */}
        {type !== 'daily' && (
        <Card>
          <h3 className="text-subheading font-semibold text-text mb-4">
            친구에게 공유하기
          </h3>

          {/* 공유 버튼들 - 아이콘만 */}
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
          {!shareRewardClaimed ? (
            <p className="text-center text-small text-accent mt-3">
              공유하면 1코인 적립!
            </p>
          ) : (
            <p className="text-center text-small text-text-muted mt-3">
              친구에게 결과를 공유해보세요
            </p>
          )}
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

      {/* 모바일 전용 안내 모달 */}
      {showMobileOnlyModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full text-center">
            <span className="text-5xl block mb-4">📱</span>
            <h3 className="text-heading font-semibold text-text mb-2">
              모바일에서 이용해주세요
            </h3>
            <p className="text-body text-text-muted mb-4">
              카카오톡 공유는 모바일에서만 가능해요.
              {copiedLink && (
                <>
                  <br />
                  <span className="text-primary font-medium">링크가 복사되었어요!</span>
                </>
              )}
            </p>
            <div className="space-y-2">
              {copiedLink && (
                <p className="text-small text-text-light bg-gray-50 p-3 rounded-lg break-all">
                  {getShareUrl()}
                </p>
              )}
              <Button
                fullWidth
                onClick={() => setShowMobileOnlyModal(false)}
              >
                확인
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* 공유 보상 토스트 */}
      {showRewardToast && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 animate-bounce">
          <div className="bg-primary text-white px-6 py-3 rounded-full shadow-lg flex items-center gap-2">
            <span className="text-xl">🎉</span>
            <span className="font-medium">1코인 적립 완료!</span>
          </div>
        </div>
      )}
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
            <Image
              src="/images/brand-character.png"
              alt=""
              width={96}
              height={96}
              className="h-24 w-auto mx-auto mb-4 animate-bounce"
            />
            <p className="text-body text-text-muted">로딩 중...</p>
          </div>
        </div>
      }
    >
      <ResultContent />
    </Suspense>
  )
}
