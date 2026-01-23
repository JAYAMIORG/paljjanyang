'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks'
import { BackIcon } from '@/components/ui/Icons'

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

  const renderBackElement = () => {
    const className = "flex items-center justify-center w-11 h-11 min-w-[44px] min-h-[44px] -ml-2 rounded-full hover:bg-gray-100 transition-colors"

    if (useHistoryBack) {
      return (
        <button
          onClick={() => router.back()}
          aria-label="뒤로 가기"
          className={className}
        >
          <BackIcon />
        </button>
      )
    }

    return (
      <Link href={backHref} aria-label="뒤로 가기" className={className}>
        <BackIcon />
      </Link>
    )
  }

  return (
    <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-sm border-b border-gray-100">
      <div className="flex items-center justify-between h-14 px-4 max-w-lg mx-auto">
        <div className="flex items-center gap-2">
          {showBack ? (
            renderBackElement()
          ) : (
            <Link href="/" className="flex items-center">
              <Image
                src="/images/brand-copy.webp"
                alt="팔자냥"
                width={240}
                height={72}
                className="h-10 w-auto"
              />
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
                className="text-small font-medium text-primary hover:underline px-2 py-3 min-h-[44px] flex items-center"
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
