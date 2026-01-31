'use client'

import { useState, useEffect, Suspense } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useSearchParams } from 'next/navigation'
import { Header } from '@/components/layout'
import { Button } from '@/components/ui'
import { useAuth } from '@/hooks'

// 인앱 브라우저 감지 함수
function isInAppBrowser(): boolean {
  if (typeof window === 'undefined') return false
  const ua = navigator.userAgent || navigator.vendor
  // 카카오톡, 페이스북, 인스타그램, 라인, 네이버 등 인앱 브라우저 감지
  return /KAKAOTALK|FBAN|FBAV|Instagram|Line|NAVER|Snapchat|Twitter/i.test(ua)
}

// 외부 브라우저로 열기
function openInExternalBrowser() {
  const currentUrl = window.location.href

  // 안드로이드: intent 스킴 사용
  if (/android/i.test(navigator.userAgent)) {
    window.location.href = `intent://${currentUrl.replace(/^https?:\/\//, '')}#Intent;scheme=https;package=com.android.chrome;end`
    return
  }

  // iOS: Safari에서 열기 (카카오톡 등에서는 직접 지원 안됨, 안내만 제공)
  // 대부분의 경우 클립보드 복사 후 안내
  if (navigator.clipboard) {
    navigator.clipboard.writeText(currentUrl)
    alert('링크가 복사되었습니다.\nSafari 또는 Chrome에서 붙여넣기 해주세요.')
  }
}

function LoginContent() {
  const searchParams = useSearchParams()
  const { signInWithKakao, signInWithGoogle } = useAuth()
  const [error, setError] = useState<string | null>(null)
  const [isInApp, setIsInApp] = useState(false)
  const [showInAppWarning, setShowInAppWarning] = useState(false)

  const redirect = searchParams.get('redirect') || '/home'

  useEffect(() => {
    setIsInApp(isInAppBrowser())
  }, [])

  const handleKakaoLogin = async () => {
    setError(null)
    const { error } = await signInWithKakao(redirect)
    if (error) {
      setError('카카오 로그인에 실패했어요')
    }
  }

  const handleGoogleLogin = async () => {
    setError(null)
    // 인앱 브라우저에서 구글 로그인 시도 시 경고
    if (isInApp) {
      setShowInAppWarning(true)
      return
    }
    const { error } = await signInWithGoogle(redirect)
    if (error) {
      setError('구글 로그인에 실패했어요')
    }
  }

  const emailLoginHref = redirect !== '/home'
    ? `/auth/email-login?redirect=${encodeURIComponent(redirect)}`
    : '/auth/email-login'

  return (
    <div className="min-h-screen bg-background">
      <Header showBack backHref="/home" title="시작하기" showAuth={false} />

      <main className="px-4 py-8 max-w-lg mx-auto">
        <div className="text-center mb-8">
          <Image
            src="/images/brand-copy.webp"
            alt="팔자냥"
            width={240}
            height={72}
            className="h-20 w-auto mx-auto mb-4"
          />
          <p className="text-body text-text-muted">
            사주로 나를 알아가는 여정을 시작해요
          </p>
        </div>

        {error && (
          <p className="text-small text-red-500 text-center mb-4">{error}</p>
        )}

        {/* 인앱 브라우저 경고 모달 */}
        {showInAppWarning && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
            <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl">
              <h3 className="text-lg font-bold text-text mb-2">
                외부 브라우저에서 열어주세요
              </h3>
              <p className="text-sm text-text-muted mb-4">
                Google 로그인은 카카오톡, 인스타그램 등 인앱 브라우저에서 지원되지 않아요.
                <br /><br />
                Safari 또는 Chrome에서 열어주세요.
              </p>
              <div className="space-y-2">
                <Button
                  fullWidth
                  onClick={openInExternalBrowser}
                >
                  외부 브라우저로 열기
                </Button>
                <Button
                  variant="secondary"
                  fullWidth
                  onClick={() => setShowInAppWarning(false)}
                >
                  닫기
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* 소셜 로그인 */}
        <div className="space-y-3 mb-6" role="group" aria-label="소셜 로그인">
          <Button
            variant="secondary"
            fullWidth
            onClick={handleKakaoLogin}
            aria-label="카카오 계정으로 로그인"
            className="bg-[#FEE500] hover:bg-[#FDD800] text-[#191919] border-[#FEE500] hover:border-[#FDD800]"
          >
            <span className="flex items-center justify-center gap-2">
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <path fillRule="evenodd" clipRule="evenodd" d="M9 0.5C4.02944 0.5 0 3.69745 0 7.62245C0 10.0505 1.55893 12.1892 3.93137 13.4637L2.93137 17.0721C2.84813 17.3803 3.20749 17.6241 3.47687 17.4428L7.72437 14.5909C8.14312 14.6409 8.56875 14.6674 9 14.6674C13.9706 14.6674 18 11.4699 18 7.54494C18 3.61994 13.9706 0.5 9 0.5Z" fill="#191919"/>
              </svg>
              카카오로 시작하기
            </span>
          </Button>
          <div className="relative">
            <Button
              variant="secondary"
              fullWidth
              onClick={handleGoogleLogin}
              aria-label="Google 계정으로 로그인"
              className={isInApp ? 'opacity-70' : ''}
            >
              <span className="flex items-center justify-center gap-2">
                <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                  <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z" fill="#4285F4"/>
                  <path d="M9.003 18c2.43 0 4.467-.806 5.956-2.18l-2.909-2.26c-.806.54-1.836.86-3.047.86-2.344 0-4.328-1.584-5.036-3.711H.96v2.332C2.44 15.983 5.485 18 9.003 18z" fill="#34A853"/>
                  <path d="M3.964 10.712c-.18-.54-.282-1.117-.282-1.71 0-.593.102-1.17.282-1.71V4.96H.957C.347 6.175 0 7.55 0 9.002c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
                  <path d="M9.003 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.464.891 11.428 0 9.002 0 5.485 0 2.44 2.017.96 4.958L3.967 7.29c.708-2.127 2.692-3.71 5.036-3.71z" fill="#EA4335"/>
                </svg>
                Google로 시작하기
              </span>
            </Button>
            {isInApp && (
              <p className="text-caption text-text-light text-center mt-1">
                * 인앱 브라우저에서는 카카오 로그인을 권장해요
              </p>
            )}
          </div>
        </div>

        {/* 구분선 */}
        <div className="flex items-center gap-4 my-6">
          <div className="flex-1 h-px bg-gray-200" />
          <span className="text-small text-text-light">또는</span>
          <div className="flex-1 h-px bg-gray-200" />
        </div>

        {/* 이메일로 로그인 */}
        <Link href={emailLoginHref}>
          <Button variant="secondary" fullWidth>
            <span className="flex items-center justify-center gap-2">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                <polyline points="22,6 12,13 2,6"/>
              </svg>
              이메일로 로그인
            </span>
          </Button>
        </Link>

        {/* 안내 문구 */}
        <p className="text-center text-body text-text-muted mt-6">
          카카오 또는 Google로 간편하게 시작하세요
        </p>
      </main>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center">
            <Image
              src="/images/brand-character.webp"
              alt=""
              width={72}
              height={72}
              className="h-[72px] w-auto mx-auto mb-4 animate-bounce"
            />
            <p className="text-body text-text-muted">로딩 중...</p>
          </div>
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  )
}
