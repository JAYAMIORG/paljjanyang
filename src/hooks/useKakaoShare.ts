'use client'

import { useEffect, useState, useCallback } from 'react'

interface ShareContent {
  title: string
  description: string
  imageUrl?: string
  buttonText?: string
  shareUrl?: string
}

// 모바일 디바이스 감지 (export하여 외부에서도 사용 가능)
export function isMobileDevice(): boolean {
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
    const KAKAO_SDK_URL = 'https://developers.kakao.com/sdk/js/kakao.min.js'

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

    // 이미 스크립트가 로딩 중인지 확인 (중복 로딩 방지)
    const existingScript = document.querySelector(`script[src="${KAKAO_SDK_URL}"]`)
    if (existingScript) {
      // 이미 로딩 중인 스크립트가 있으면 load 이벤트 대기
      const handleExistingLoad = () => {
        if (window.Kakao && !window.Kakao.isInitialized()) {
          window.Kakao.init(kakaoKey)
        }
        setIsReady(true)
        setIsLoading(false)
      }

      if (window.Kakao) {
        handleExistingLoad()
      } else {
        existingScript.addEventListener('load', handleExistingLoad)
        return () => existingScript.removeEventListener('load', handleExistingLoad)
      }
      return
    }

    // 카카오 SDK 스크립트 로드
    const script = document.createElement('script')
    script.src = KAKAO_SDK_URL
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
      console.error('카카오 SDK 로딩 실패')
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
      const finalImageUrl = imageUrl || `${baseUrl}/images/animals/test.jpg`
      const isMobileNow = isMobileDevice()

      try {
        // Kakao.Share가 없으면 Kakao.Link 사용 (구버전 호환)
        const shareMethod = window.Kakao.Share?.sendDefault || window.Kakao.Link?.sendDefault

        if (!shareMethod) {
          return false
        }

        // PC에서는 카카오톡 웹 공유 페이지 사용 (팝업)
        if (!isMobileNow) {
          const kakaoKey = process.env.NEXT_PUBLIC_KAKAO_JS_KEY
          // 카카오 웹 공유 URL 생성
          const templateArgs = {
            objectType: 'feed',
            content: {
              title,
              description,
              imageUrl: finalImageUrl,
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
          }

          // 카카오 피커(친구 선택) 웹 공유
          const pickerUrl = `https://sharer.kakao.com/talk/friends/picker/link?app_key=${kakaoKey}&ka=sdk%2F1.43.0%20os%2Fjavascript%20sdk_type%2Fjavascript%20lang%2Fko-KR%20device%2FWin32%20origin%2F${encodeURIComponent(window.location.origin)}&link_ver=4.0&template_object=${encodeURIComponent(JSON.stringify(templateArgs))}`

          const popup = window.open(pickerUrl, 'kakao_share', 'width=480,height=700,scrollbars=yes')
          if (popup) {
            popup.focus()
            return true
          }
          return false
        }

        // 모바일에서는 SDK 사용 (앱 실행)
        shareMethod({
          objectType: 'feed',
          content: {
            title,
            description,
            imageUrl: finalImageUrl,
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
