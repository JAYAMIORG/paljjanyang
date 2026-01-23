'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { Header } from '@/components/layout'
import { Button, Input, Card } from '@/components/ui'
import { createClient } from '@/lib/supabase/client'

export default function UpdatePasswordPage() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isValidSession, setIsValidSession] = useState(false)
  const [checkingSession, setCheckingSession] = useState(true)

  const supabase = createClient()

  useEffect(() => {
    const checkSession = async () => {
      if (!supabase) {
        setCheckingSession(false)
        return
      }

      const { data: { session } } = await supabase.auth.getSession()
      setIsValidSession(!!session)
      setCheckingSession(false)
    }

    checkSession()
  }, [supabase])

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (password !== confirmPassword) {
      setError('비밀번호가 일치하지 않아요')
      return
    }

    if (password.length < 6) {
      setError('비밀번호는 6자 이상이어야 해요')
      return
    }

    if (!supabase) {
      setError('서비스가 준비되지 않았어요')
      return
    }

    setIsLoading(true)

    const { error } = await supabase.auth.updateUser({
      password: password,
    })

    if (error) {
      setError('비밀번호 변경에 실패했어요. 다시 시도해주세요.')
      setIsLoading(false)
      return
    }

    setSuccess(true)
    setIsLoading(false)
  }

  if (checkingSession) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Image
            src="/images/brand-character.webp"
            alt=""
            width={72}
            height={72}
            className="h-[72px] w-auto mx-auto mb-4 animate-bounce"
          />
          <p className="text-body text-text-muted">확인 중...</p>
        </div>
      </div>
    )
  }

  if (!isValidSession) {
    return (
      <div className="min-h-screen bg-background">
        <Header showBack backHref="/auth/login" title="비밀번호 변경" showAuth={false} />

        <main className="px-4 py-8 max-w-lg mx-auto">
          <Card>
            <div className="text-center py-4">
              <span className="text-5xl block mb-4" aria-hidden="true">⚠️</span>
              <h2 className="text-subheading font-semibold text-text mb-2">
                유효하지 않은 링크
              </h2>
              <p className="text-body text-text-muted mb-6">
                비밀번호 재설정 링크가 만료되었거나 유효하지 않아요.
                <br />
                다시 비밀번호 재설정을 요청해주세요.
              </p>
              <Button fullWidth onClick={() => router.push('/auth/reset-password')}>
                비밀번호 재설정 다시 요청
              </Button>
            </div>
          </Card>
        </main>
      </div>
    )
  }

  if (success) {
    return (
      <div className="min-h-screen bg-background">
        <Header showBack backHref="/auth/login" title="비밀번호 변경" showAuth={false} />

        <main className="px-4 py-8 max-w-lg mx-auto">
          <Card>
            <div className="text-center py-4">
              <span className="text-5xl block mb-4" aria-hidden="true">🎉</span>
              <h2 className="text-subheading font-semibold text-text mb-2">
                비밀번호가 변경되었어요
              </h2>
              <p className="text-body text-text-muted mb-6">
                새 비밀번호로 로그인해주세요.
              </p>
              <Button fullWidth onClick={() => router.push('/auth/email-login')}>
                로그인하러 가기
              </Button>
            </div>
          </Card>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Header showBack backHref="/auth/login" title="새 비밀번호 설정" showAuth={false} />

      <main className="px-4 py-8 max-w-lg mx-auto">
        <div className="text-center mb-8">
          <span className="text-5xl block mb-4" aria-hidden="true">🔐</span>
          <h1 className="font-serif text-heading text-primary">새 비밀번호</h1>
          <p className="text-body text-text-muted mt-2">
            새로운 비밀번호를 입력해주세요
          </p>
        </div>

        <Card>
          <form onSubmit={handleUpdatePassword} className="space-y-4">
            <Input
              label="새 비밀번호"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="6자 이상 입력하세요"
              required
              minLength={6}
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
              <p className="text-small text-red-500 text-center" role="alert">{error}</p>
            )}

            <Button
              type="submit"
              fullWidth
              disabled={isLoading || !password || !confirmPassword}
              isLoading={isLoading}
            >
              {isLoading ? '변경 중...' : '비밀번호 변경'}
            </Button>
          </form>
        </Card>
      </main>
    </div>
  )
}
