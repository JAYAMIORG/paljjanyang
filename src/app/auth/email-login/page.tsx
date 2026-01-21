'use client'

import { useState, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Header } from '@/components/layout'
import { Button, Input, Card } from '@/components/ui'
import { useAuth } from '@/hooks'
import { getKoreanErrorMessage } from '@/lib/utils'

function EmailLoginContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { signInWithEmail } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const redirect = searchParams.get('redirect') || '/home'

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    const { error } = await signInWithEmail(email, password)

    if (error) {
      setError(getKoreanErrorMessage(error))
      setIsLoading(false)
      return
    }

    router.push(redirect)
  }

  return (
    <div className="min-h-screen bg-background">
      <Header showBack useHistoryBack title="이메일 로그인" showAuth={false} />

      <main className="px-4 py-8 max-w-lg mx-auto">
        <div className="text-center mb-8">
          <span className="text-5xl block mb-4" aria-hidden="true">🐱</span>
          <h1 className="font-serif text-heading text-primary">팔자냥</h1>
          <p className="text-body text-text-muted mt-2">
            다시 만나서 반가워요!
          </p>
        </div>

        {/* 이메일 로그인 */}
        <Card>
          <form onSubmit={handleEmailLogin} className="space-y-4">
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
              placeholder="비밀번호를 입력하세요"
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
              {isLoading ? '로그인 중...' : '로그인'}
            </Button>

            <div className="text-center pt-2">
              <Link
                href="/auth/reset-password"
                className="text-small text-text-muted hover:text-primary transition-colors"
              >
                비밀번호를 잊으셨나요?
              </Link>
            </div>
          </form>
        </Card>

        {/* 회원가입 링크 */}
        <p className="text-center text-body text-text-muted mt-6">
          아직 계정이 없으신가요?{' '}
          <Link
            href={`/auth/signup${redirect !== '/home' ? `?redirect=${encodeURIComponent(redirect)}` : ''}`}
            className="text-primary font-medium hover:underline"
          >
            회원가입
          </Link>
        </p>
      </main>
    </div>
  )
}

export default function EmailLoginPage() {
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
      <EmailLoginContent />
    </Suspense>
  )
}
