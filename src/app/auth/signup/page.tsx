'use client'

import { Suspense, useEffect } from 'react'
import Image from 'next/image'
import { useSearchParams, useRouter } from 'next/navigation'

function SignupContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const redirect = searchParams.get('redirect') || '/home'

  // 로그인 페이지로 리다이렉트
  useEffect(() => {
    const loginHref = redirect !== '/home'
      ? `/auth/login?redirect=${encodeURIComponent(redirect)}`
      : '/auth/login'
    router.replace(loginHref)
  }, [redirect, router])

  return null
}

export default function SignupPage() {
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
      <SignupContent />
    </Suspense>
  )
}
