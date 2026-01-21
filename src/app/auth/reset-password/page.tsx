'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Header } from '@/components/layout'
import { Button, Input, Card } from '@/components/ui'
import { useAuth } from '@/hooks'

export default function ResetPasswordPage() {
  const { resetPassword } = useAuth()
  const [email, setEmail] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    const { error } = await resetPassword(email)

    if (error) {
      setError('비밀번호 재설정 이메일 발송에 실패했어요. 이메일 주소를 확인해주세요.')
      setIsLoading(false)
      return
    }

    setSuccess(true)
    setIsLoading(false)
  }

  if (success) {
    return (
      <div className="min-h-screen bg-background">
        <Header showBack backHref="/auth/email-login" title="비밀번호 재설정" showAuth={false} />

        <main className="px-4 py-8 max-w-lg mx-auto">
          <Card>
            <div className="text-center py-4">
              <span className="text-5xl block mb-4" aria-hidden="true">📧</span>
              <h2 className="text-subheading font-semibold text-text mb-2">
                이메일을 확인해주세요
              </h2>
              <p className="text-body text-text-muted mb-6">
                <strong>{email}</strong>로 비밀번호 재설정 링크를 보냈어요.
                <br />
                메일함을 확인해주세요.
              </p>
              <Link href="/auth/email-login">
                <Button variant="secondary" fullWidth>
                  로그인으로 돌아가기
                </Button>
              </Link>
            </div>
          </Card>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Header showBack backHref="/auth/email-login" title="비밀번호 재설정" showAuth={false} />

      <main className="px-4 py-8 max-w-lg mx-auto">
        <div className="text-center mb-8">
          <span className="text-5xl block mb-4" aria-hidden="true">🔑</span>
          <h1 className="font-serif text-heading text-primary">비밀번호 찾기</h1>
          <p className="text-body text-text-muted mt-2">
            가입한 이메일 주소를 입력하면
            <br />
            비밀번호 재설정 링크를 보내드려요
          </p>
        </div>

        <Card>
          <form onSubmit={handleResetPassword} className="space-y-4">
            <Input
              label="이메일"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email@example.com"
              required
            />

            {error && (
              <p className="text-small text-red-500 text-center" role="alert">{error}</p>
            )}

            <Button
              type="submit"
              fullWidth
              disabled={isLoading || !email}
              isLoading={isLoading}
            >
              {isLoading ? '발송 중...' : '재설정 링크 받기'}
            </Button>
          </form>
        </Card>

        <p className="text-center text-body text-text-muted mt-6">
          비밀번호가 기억나셨나요?{' '}
          <Link
            href="/auth/email-login"
            className="text-primary font-medium hover:underline"
          >
            로그인
          </Link>
        </p>
      </main>
    </div>
  )
}
