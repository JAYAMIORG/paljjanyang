'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks'

interface HeaderProps {
  showBack?: boolean
  title?: string
  backHref?: string
  useHistoryBack?: boolean
  showAuth?: boolean
  hideMyPageLink?: boolean
}

export function Header({ showBack = false, title, backHref = '/', useHistoryBack = false, showAuth = true, hideMyPageLink = false }: HeaderProps) {
  const router = useRouter()
  const { user, loading, signOut, isConfigured } = useAuth()

  const handleSignOut = async () => {
    await signOut()
    router.push('/')
  }

  const handleBack = () => {
    router.back()
  }

  const BackButton = () => (
    <button
      onClick={handleBack}
      className="flex items-center justify-center w-10 h-10 -ml-2 rounded-full hover:bg-gray-100 transition-colors"
    >
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M15 18l-6-6 6-6" />
      </svg>
    </button>
  )

  const BackLink = () => (
    <Link
      href={backHref}
      className="flex items-center justify-center w-10 h-10 -ml-2 rounded-full hover:bg-gray-100 transition-colors"
    >
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M15 18l-6-6 6-6" />
      </svg>
    </Link>
  )

  return (
    <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-sm border-b border-gray-100">
      <div className="flex items-center justify-between h-14 px-4 max-w-lg mx-auto">
        <div className="flex items-center gap-2">
          {showBack ? (
            useHistoryBack ? <BackButton /> : <BackLink />
          ) : (
            <Link href="/" className="flex items-center gap-2">
              <span className="text-2xl">🐱</span>
              <span className="font-serif text-xl font-bold text-primary">팔자냥</span>
            </Link>
          )}
          {title && (
            <h1 className="text-subheading font-semibold text-text">{title}</h1>
          )}
        </div>

        {showAuth && isConfigured && (
          <div className="flex items-center gap-2">
            {loading ? (
              <div className="w-8 h-8 rounded-full bg-gray-100 animate-pulse" />
            ) : user ? (
              <div className="flex items-center gap-2">
                {!hideMyPageLink && (
                  <Link
                    href="/mypage"
                    className="text-small text-text-muted hover:text-primary transition-colors"
                  >
                    마이페이지
                  </Link>
                )}
                <button
                  onClick={handleSignOut}
                  className="text-small text-text-light hover:text-text-muted transition-colors"
                >
                  로그아웃
                </button>
              </div>
            ) : (
              <Link
                href="/auth/login"
                className="text-small font-medium text-primary hover:underline"
              >
                로그인
              </Link>
            )}
          </div>
        )}
      </div>
    </header>
  )
}
