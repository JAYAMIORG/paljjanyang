'use client'

import { useEffect, useState, useCallback } from 'react'

interface ShareContent {
  title: string
  description: string
  imageUrl?: string
  buttonText?: string
}

// 모바일 디바이스 감지
function isMobileDevice(): boolean {
  if (typeof window === 'undefined') return false
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  )
}

export function useKakaoShare() {
  const [isReady, setIsReady] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    setIsMobile(isMobileDevice())
  }, [])

  useEffect(() => {
    const kakaoKey = process.env.NEXT_PUBLIC_KAKAO_JS_KEY

    if (!kakaoKey) {
      setIsLoading(false)
      return
    }

    // 이미 SDK가 로드되었는지 확인
    if (window.Kakao) {
      if (!window.Kakao.isInitialized()) {
        window.Kakao.init(kakaoKey)
      }
      setIsReady(true)
      setIsLoading(false)
      return
    }

    // 카카오 SDK 스크립트 로드
    const script = document.createElement('script')
    script.src = 'https://developers.kakao.com/sdk/js/kakao.min.js'
    script.async = true

    script.onload = () => {
      if (window.Kakao && !window.Kakao.isInitialized()) {
        window.Kakao.init(kakaoKey)
      }
      setIsReady(true)
      setIsLoading(false)
    }

    script.onerror = () => {
      setIsLoading(false)
    }

    document.head.appendChild(script)
  }, [])

  const share = useCallback(
    ({ title, description, imageUrl, buttonText = '사주 보러가기' }: ShareContent) => {
      // 데스크톱에서는 안내 메시지 표시
      if (!isMobile) {
        const currentUrl = window.location.href
        // 클립보드에 URL 복사 시도
        navigator.clipboard.writeText(currentUrl).then(() => {
          alert('📱 카카오톡 공유는 모바일에서 이용해주세요!\n\n링크가 클립보드에 복사되었습니다.')
        }).catch(() => {
          alert('📱 카카오톡 공유는 모바일에서 이용해주세요!')
        })
        return false
      }

      if (!isReady || !window.Kakao) {
        alert('카카오톡 공유 기능을 불러오는 중입니다. 잠시 후 다시 시도해주세요.')
        return false
      }

      const currentUrl = window.location.href
      const baseUrl = window.location.origin

      try {
        // Kakao.Share가 없으면 Kakao.Link 사용 (구버전 호환)
        const shareMethod = window.Kakao.Share?.sendDefault || window.Kakao.Link?.sendDefault

        if (!shareMethod) {
          console.error('[Kakao] Share/Link API를 찾을 수 없습니다')
          alert('카카오톡 공유에 실패했습니다.')
          return false
        }

        shareMethod({
          objectType: 'feed',
          content: {
            title,
            description,
            imageUrl: imageUrl || `${baseUrl}/og-image.png`,
            link: {
              mobileWebUrl: currentUrl,
              webUrl: currentUrl,
            },
          },
          buttons: [
            {
              title: buttonText,
              link: {
                mobileWebUrl: baseUrl,
                webUrl: baseUrl,
              },
            },
          ],
        })
        return true
      } catch (error) {
        console.error('[Kakao] 공유 실패:', error)
        alert('카카오톡 공유에 실패했습니다.')
        return false
      }
    },
    [isReady, isMobile]
  )

  return { isReady, isLoading, isMobile, share }
}
