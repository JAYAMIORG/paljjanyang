'use client'

import { useState, Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Header } from '@/components/layout'
import { Button } from '@/components/ui'
import { useAuth } from '@/hooks'

function LoginContent() {
  const searchParams = useSearchParams()
  const { signInWithKakao, signInWithGoogle } = useAuth()
  const [error, setError] = useState<string | null>(null)

  const redirect = searchParams.get('redirect') || '/home'

  const handleKakaoLogin = async () => {
    setError(null)
    const { error } = await signInWithKakao(redirect)
    if (error) {
      setError('카카오 로그인에 실패했어요')
    }
  }

  const handleGoogleLogin = async () => {
    setError(null)
    const { error } = await signInWithGoogle(redirect)
    if (error) {
      setError('구글 로그인에 실패했어요')
    }
  }

  const emailLoginHref = redirect !== '/home'
    ? `/auth/email-login?redirect=${encodeURIComponent(redirect)}`
    : '/auth/email-login'

  const signupHref = redirect !== '/home'
    ? `/auth/signup?redirect=${encodeURIComponent(redirect)}`
    : '/auth/signup'

  return (
    <div className="min-h-screen bg-background">
      <Header showBack useHistoryBack title="시작하기" showAuth={false} />

      <main className="px-4 py-8 max-w-lg mx-auto">
        <div className="text-center mb-8">
          <span className="text-5xl block mb-4">🐱</span>
          <h1 className="font-serif text-heading text-primary">팔자냥</h1>
          <p className="text-body text-text-muted mt-2">
            사주로 나를 알아가는 여정을 시작해요
          </p>
        </div>

        {error && (
          <p className="text-small text-red-500 text-center mb-4">{error}</p>
        )}

        {/* 소셜 로그인 */}
        <div className="space-y-3 mb-6">
          <Button
            variant="secondary"
            fullWidth
            onClick={handleKakaoLogin}
            className="bg-[#FEE500] hover:bg-[#FDD800] text-[#191919] border-[#FEE500] hover:border-[#FDD800]"
          >
            <span className="flex items-center justify-center gap-2">
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" clipRule="evenodd" d="M9 0.5C4.02944 0.5 0 3.69745 0 7.62245C0 10.0505 1.55893 12.1892 3.93137 13.4637L2.93137 17.0721C2.84813 17.3803 3.20749 17.6241 3.47687 17.4428L7.72437 14.5909C8.14312 14.6409 8.56875 14.6674 9 14.6674C13.9706 14.6674 18 11.4699 18 7.54494C18 3.61994 13.9706 0.5 9 0.5Z" fill="#191919"/>
              </svg>
              카카오로 시작하기
            </span>
          </Button>
          <Button
            variant="secondary"
            fullWidth
            onClick={handleGoogleLogin}
          >
            <span className="flex items-center justify-center gap-2">
              <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
                <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z" fill="#4285F4"/>
                <path d="M9.003 18c2.43 0 4.467-.806 5.956-2.18l-2.909-2.26c-.806.54-1.836.86-3.047.86-2.344 0-4.328-1.584-5.036-3.711H.96v2.332C2.44 15.983 5.485 18 9.003 18z" fill="#34A853"/>
                <path d="M3.964 10.712c-.18-.54-.282-1.117-.282-1.71 0-.593.102-1.17.282-1.71V4.96H.957C.347 6.175 0 7.55 0 9.002c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
                <path d="M9.003 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.464.891 11.428 0 9.002 0 5.485 0 2.44 2.017.96 4.958L3.967 7.29c.708-2.127 2.692-3.71 5.036-3.71z" fill="#EA4335"/>
              </svg>
              Google로 시작하기
            </span>
          </Button>
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

        {/* 회원가입 링크 */}
        <p className="text-center text-body text-text-muted mt-6">
          아직 계정이 없으신가요?{' '}
          <Link href={signupHref} className="text-primary font-medium hover:underline">
            회원가입
          </Link>
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
            <div className="text-6xl mb-4 animate-bounce">🐱</div>
            <p className="text-body text-text-muted">로딩 중...</p>
          </div>
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  )
}
