'use client'

import { Suspense } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useSearchParams } from 'next/navigation'
import { Header } from '@/components/layout'
import { Button } from '@/components/ui'

function SignupContent() {
  const searchParams = useSearchParams()
  const redirect = searchParams.get('redirect') || '/home'

  const loginHref = redirect !== '/home'
    ? `/auth/login?redirect=${encodeURIComponent(redirect)}`
    : '/auth/login'

  // 이메일 회원가입 임시 중단 안내
  return (
    <div className="min-h-screen bg-background">
      <Header showBack useHistoryBack title="회원가입" showAuth={false} />

      <main className="px-4 py-8 max-w-lg mx-auto text-center">
        <Image
          src="/images/brand-copy.webp"
          alt="팔자냥"
          width={240}
          height={72}
          className="h-20 w-auto mx-auto mb-6"
        />

        <span className="text-6xl block mb-4">🚧</span>
        <h2 className="text-heading font-semibold text-text mb-4">
          이메일 회원가입 임시 중단
        </h2>
        <p className="text-body text-text-muted mb-6">
          현재 이메일 회원가입이 임시 중단되었어요.
          <br />
          카카오 또는 Google로 가입해주세요.
        </p>

        <Link href={loginHref}>
          <Button fullWidth>로그인 페이지로 이동</Button>
        </Link>
      </main>
    </div>
  )
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
