'use client'

import { useEffect, useState, useCallback } from 'react'

interface ShareContent {
  title: string
  description: string
  imageUrl?: string
  buttonText?: string
  shareUrl?: string
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
    ({ title, description, imageUrl, buttonText = '사주 보러가기', shareUrl }: ShareContent) => {
      if (!isReady || !window.Kakao) {
        return false
      }

      const baseUrl = window.location.origin
      const contentUrl = shareUrl || window.location.href

      try {
        // Kakao.Share가 없으면 Kakao.Link 사용 (구버전 호환)
        const shareMethod = window.Kakao.Share?.sendDefault || window.Kakao.Link?.sendDefault

        if (!shareMethod) {
          return false
        }

        shareMethod({
          objectType: 'feed',
          content: {
            title,
            description,
            imageUrl: imageUrl || `${baseUrl}/og-image.png`,
            link: {
              mobileWebUrl: contentUrl,
              webUrl: contentUrl,
            },
          },
          buttons: [
            {
              title: buttonText,
              link: {
                mobileWebUrl: contentUrl,
                webUrl: contentUrl,
              },
            },
          ],
        })
        return true
      } catch {
        return false
      }
    },
    [isReady]
  )

  return { isReady, isLoading, isMobile, share }
}
