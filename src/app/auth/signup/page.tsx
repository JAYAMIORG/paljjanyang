'use client'

import { useState, Suspense } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useSearchParams } from 'next/navigation'
import { Header } from '@/components/layout'
import { Button, Input, Card } from '@/components/ui'
import { useAuth } from '@/hooks'
import { getKoreanErrorMessage } from '@/lib/utils'

function SignupContent() {
  const searchParams = useSearchParams()
  const { signUpWithEmail } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const redirect = searchParams.get('redirect') || '/home'

  const handleEmailSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    // 비밀번호 확인
    if (password !== confirmPassword) {
      setError('비밀번호가 일치하지 않아요')
      return
    }

    // 비밀번호 길이 확인
    if (password.length < 6) {
      setError('비밀번호는 6자 이상이어야 해요')
      return
    }

    setIsLoading(true)

    const { error } = await signUpWithEmail(email, password)

    if (error) {
      setError(getKoreanErrorMessage(error))
      setIsLoading(false)
      return
    }

    setIsSuccess(true)
    setIsLoading(false)
  }

  const emailLoginHref = redirect !== '/home'
    ? `/auth/email-login?redirect=${encodeURIComponent(redirect)}`
    : '/auth/email-login'

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-background">
        <Header showBack useHistoryBack title="회원가입" showAuth={false} />
        <main className="px-4 py-8 max-w-lg mx-auto text-center">
          <span className="text-6xl block mb-4">📧</span>
          <h2 className="text-heading font-semibold text-text mb-4">
            이메일을 확인해주세요!
          </h2>
          <p className="text-body text-text-muted mb-6">
            <span className="text-primary font-medium">{email}</span>으로
            인증 메일을 보냈어요.
            <br />
            메일의 링크를 클릭하면 가입이 완료돼요.
          </p>
          <Link href={emailLoginHref}>
            <Button variant="secondary">로그인하러 가기</Button>
          </Link>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Header showBack useHistoryBack title="이메일로 회원가입" showAuth={false} />

      <main className="px-4 py-8 max-w-lg mx-auto">
        <div className="text-center mb-8">
          <Image
            src="/images/brand-copy.png"
            alt="팔자냥"
            width={240}
            height={72}
            className="h-20 w-auto mx-auto mb-4"
          />
          <p className="text-body text-text-muted">
            사주로 나를 알아가는 여정을 시작해요
          </p>
        </div>

        {/* 이메일 회원가입 */}
        <Card>
          <form onSubmit={handleEmailSignup} className="space-y-4">
            <Input
              label="이메일"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email@example.com"
              required
            />
            <Input
              label="비밀번호"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="6자 이상 입력하세요"
              hint="6자 이상 입력해주세요"
              required
            />
            <Input
              label="비밀번호 확인"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="비밀번호를 다시 입력하세요"
              required
            />

            {error && (
              <p className="text-small text-red-500 text-center">{error}</p>
            )}

            <Button
              type="submit"
              fullWidth
              disabled={isLoading}
            >
              {isLoading ? '가입 중...' : '회원가입'}
            </Button>
          </form>
        </Card>

        {/* 로그인 링크 */}
        <p className="text-center text-body text-text-muted mt-6">
          이미 계정이 있으신가요?{' '}
          <Link href={emailLoginHref} className="text-primary font-medium hover:underline">
            이메일로 로그인
          </Link>
        </p>

        {/* 약관 동의 문구 */}
        <p className="text-center text-caption text-text-light mt-4 flex flex-wrap items-center justify-center gap-1">
          <span>가입 시</span>
          <Link href="/terms" className="underline hover:text-text-muted px-1 py-2 min-h-[44px] inline-flex items-center">이용약관</Link>
          <span>과</span>
          <Link href="/privacy" className="underline hover:text-text-muted px-1 py-2 min-h-[44px] inline-flex items-center">개인정보처리방침</Link>
          <span>에 동의하게 됩니다.</span>
        </p>
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
              src="/images/brand-character.png"
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
