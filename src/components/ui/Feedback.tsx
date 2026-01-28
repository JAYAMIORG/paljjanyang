'use client'

import { ReactNode } from 'react'
import Image from 'next/image'
import { Button } from './Button'

// ============================================
// Loading Components
// ============================================

interface LoadingScreenProps {
  message?: string
  emoji?: string
  useCharacter?: boolean
  showProgress?: boolean
  subMessage?: string
  exitHint?: string  // 이탈 시 안내 메시지
}

export function LoadingScreen({
  message = '로딩 중...',
  emoji,
  useCharacter = true,
  showProgress = false,
  subMessage,
  exitHint,
}: LoadingScreenProps) {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center px-6 w-full max-w-xs">
        {emoji ? (
          <div className="text-6xl mb-4 animate-bounce">{emoji}</div>
        ) : useCharacter ? (
          <Image
            src="/images/brand-character.webp"
            alt=""
            width={72}
            height={72}
            className="h-[72px] w-auto mx-auto mb-4 animate-bounce"
          />
        ) : (
          <div className="text-6xl mb-4 animate-bounce">🐱</div>
        )}
        <p className="text-body text-text-muted">{message}</p>

        {subMessage && (
          <p className="text-small text-text-light mt-2">{subMessage}</p>
        )}

        {showProgress && (
          <div className="mt-4 w-full">
            <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
              <div className="h-full bg-primary rounded-full animate-progress" />
            </div>
          </div>
        )}

        {exitHint && (
          <p className="text-small text-text-muted mt-4 pt-4 border-t border-gray-200">
            {exitHint}
          </p>
        )}
      </div>
    </div>
  )
}

interface LoadingCardProps {
  message?: string
  emoji?: string
  useCharacter?: boolean
}

export function LoadingCard({
  message = '불러오는 중...',
  emoji,
  useCharacter = true
}: LoadingCardProps) {
  return (
    <div className="bg-white rounded-2xl p-6">
      <div className="flex items-center justify-center py-8">
        <div className="text-center">
          {emoji ? (
            <div className="text-4xl mb-3 animate-pulse">{emoji}</div>
          ) : useCharacter ? (
            <Image
              src="/images/brand-character.webp"
              alt=""
              width={48}
              height={48}
              className="h-12 w-auto mx-auto mb-3 animate-pulse"
            />
          ) : (
            <div className="text-4xl mb-3 animate-pulse">🐱</div>
          )}
          <p className="text-body text-text-muted">{message}</p>
        </div>
      </div>
    </div>
  )
}

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function LoadingSpinner({ size = 'md', className = '' }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
  }

  return (
    <svg
      className={`animate-spin ${sizeClasses[size]} ${className}`}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  )
}

// ============================================
// Skeleton Components
// ============================================

interface SkeletonProps {
  className?: string
}

export function Skeleton({ className = '' }: SkeletonProps) {
  return (
    <div
      className={`animate-pulse bg-gray-200 rounded ${className}`}
      aria-hidden="true"
    />
  )
}

interface SkeletonTextProps {
  lines?: number
  className?: string
}

export function SkeletonText({ lines = 3, className = '' }: SkeletonTextProps) {
  return (
    <div className={`space-y-2 ${className}`} aria-hidden="true">
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className={`h-4 bg-gray-200 rounded animate-pulse ${i === lines - 1 ? 'w-3/4' : 'w-full'}`}
        />
      ))}
    </div>
  )
}

interface SkeletonCardProps {
  className?: string
  hasHeader?: boolean
  hasImage?: boolean
}

export function SkeletonCard({ className = '', hasHeader = true, hasImage = false }: SkeletonCardProps) {
  return (
    <div
      className={`bg-white rounded-2xl p-4 ${className}`}
      aria-busy="true"
      aria-label="로딩 중"
    >
      {hasImage && (
        <div className="h-40 bg-gray-200 rounded-xl mb-4 animate-pulse" />
      )}
      {hasHeader && (
        <div className="h-6 w-1/2 bg-gray-200 rounded mb-3 animate-pulse" />
      )}
      <SkeletonText lines={3} />
    </div>
  )
}

interface SkeletonListProps {
  count?: number
  className?: string
}

export function SkeletonList({ count = 3, className = '' }: SkeletonListProps) {
  return (
    <div className={`space-y-3 ${className}`} aria-busy="true" aria-label="목록 로딩 중">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 p-4 bg-white rounded-xl">
          <div className="w-12 h-12 bg-gray-200 rounded-full animate-pulse" />
          <div className="flex-1 space-y-2">
            <div className="h-4 w-1/3 bg-gray-200 rounded animate-pulse" />
            <div className="h-3 w-2/3 bg-gray-200 rounded animate-pulse" />
          </div>
        </div>
      ))}
    </div>
  )
}

// ============================================
// Error Components
// ============================================

interface ErrorScreenProps {
  title?: string
  message?: string
  emoji?: string
  useCharacter?: boolean
  showRetry?: boolean
  onRetry?: () => void
  showHome?: boolean
  onHome?: () => void
}

export function ErrorScreen({
  title = '오류가 발생했어요',
  message = '잠시 후 다시 시도해주세요.',
  emoji,
  useCharacter = true,
  showRetry = false,
  onRetry,
  showHome = false,
  onHome,
}: ErrorScreenProps) {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="text-center max-w-sm">
        {emoji ? (
          <div className="text-6xl mb-4">{emoji}</div>
        ) : useCharacter ? (
          <Image
            src="/images/brand-character.webp"
            alt=""
            width={80}
            height={80}
            className="h-20 w-auto mx-auto mb-4"
          />
        ) : (
          <div className="text-6xl mb-4">😿</div>
        )}
        <h2 className="text-heading font-semibold text-text mb-2">{title}</h2>
        <p className="text-body text-text-muted mb-6 whitespace-pre-line">{message}</p>
        <div className="flex flex-col gap-3">
          {showRetry && onRetry && (
            <Button onClick={onRetry} fullWidth>
              다시 시도
            </Button>
          )}
          {showHome && onHome && (
            <Button variant="ghost" onClick={onHome} fullWidth>
              홈으로 돌아가기
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

interface ErrorCardProps {
  message?: string
  emoji?: string
  useCharacter?: boolean
  showRetry?: boolean
  onRetry?: () => void
}

export function ErrorCard({
  message = '오류가 발생했어요',
  emoji,
  useCharacter = true,
  showRetry = false,
  onRetry,
}: ErrorCardProps) {
  return (
    <div className="bg-white rounded-2xl p-6">
      <div className="text-center py-4">
        {emoji ? (
          <div className="text-4xl mb-3">{emoji}</div>
        ) : useCharacter ? (
          <Image
            src="/images/brand-character.webp"
            alt=""
            width={48}
            height={48}
            className="h-12 w-auto mx-auto mb-3"
          />
        ) : (
          <div className="text-4xl mb-3">😿</div>
        )}
        <p className="text-body text-text-muted mb-4">{message}</p>
        {showRetry && onRetry && (
          <Button size="sm" onClick={onRetry}>
            다시 시도
          </Button>
        )}
      </div>
    </div>
  )
}

// ============================================
// Empty State Components
// ============================================

interface EmptyStateProps {
  title?: string
  message?: string
  emoji?: string
  action?: ReactNode
}

export function EmptyState({
  title,
  message = '데이터가 없어요',
  emoji = '📭',
  action,
}: EmptyStateProps) {
  return (
    <div className="bg-white rounded-2xl p-6">
      <div className="text-center py-8">
        <div className="text-4xl mb-3">{emoji}</div>
        {title && (
          <h3 className="text-subheading font-semibold text-text mb-2">{title}</h3>
        )}
        <p className="text-body text-text-muted mb-4">{message}</p>
        {action}
      </div>
    </div>
  )
}

// ============================================
// Toast Component
// ============================================

interface ToastProps {
  message: string
  emoji?: string
  type?: 'success' | 'error' | 'info'
  isVisible: boolean
}

export function Toast({
  message,
  emoji,
  type = 'success',
  isVisible,
}: ToastProps) {
  if (!isVisible) return null

  const typeStyles = {
    success: 'bg-primary text-white',
    error: 'bg-red-500 text-white',
    info: 'bg-gray-800 text-white',
  }

  const defaultEmoji = {
    success: '🎉',
    error: '😿',
    info: '💡',
  }

  return (
    <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 animate-bounce">
      <div className={`${typeStyles[type]} px-6 py-3 rounded-full shadow-lg flex items-center gap-2`}>
        <span className="text-xl">{emoji || defaultEmoji[type]}</span>
        <span className="font-medium">{message}</span>
      </div>
    </div>
  )
}

// ============================================
// Network Error Component
// ============================================

interface NetworkErrorProps {
  onRetry?: () => void
}

export function NetworkError({ onRetry }: NetworkErrorProps) {
  return (
    <ErrorScreen
      title="연결할 수 없어요"
      message="네트워크 연결을 확인하고 다시 시도해주세요."
      emoji="📡"
      showRetry={!!onRetry}
      onRetry={onRetry}
    />
  )
}

// ============================================
// Not Found Component
// ============================================

interface NotFoundProps {
  message?: string
  onHome?: () => void
}

export function NotFound({
  message = '페이지를 찾을 수 없어요',
  onHome
}: NotFoundProps) {
  return (
    <ErrorScreen
      title="404"
      message={message}
      emoji="🔍"
      showHome={!!onHome}
      onHome={onHome}
    />
  )
}

// ============================================
// Insufficient Coins Modal
// ============================================

interface InsufficientCoinsModalProps {
  currentBalance: number
  requiredAmount?: number
  onCharge: () => void
  onClose: () => void
}

export function InsufficientCoinsModal({
  currentBalance,
  requiredAmount = 1,
  onCharge,
  onClose,
}: InsufficientCoinsModalProps) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
      <div className="bg-white rounded-2xl p-6 max-w-sm w-full text-center">
        <Image
          src="/images/brand-character.webp"
          alt=""
          width={64}
          height={64}
          className="h-16 w-auto mx-auto mb-4"
        />
        <h3 className="text-heading font-semibold text-text mb-2">
          코인이 부족해요
        </h3>
        <p className="text-body text-text-muted mb-6">
          이 기능을 이용하려면 {requiredAmount}코인이 필요해요.
          <br />
          현재 보유 코인: <span className="font-semibold text-primary">{currentBalance}</span>
        </p>
        <div className="space-y-3">
          <Button fullWidth onClick={onCharge}>
            💰 코인 충전하러 가기
          </Button>
          <Button variant="ghost" fullWidth onClick={onClose}>
            닫기
          </Button>
        </div>
      </div>
    </div>
  )
}

// ============================================
// Confirm Modal
// ============================================

interface ConfirmModalProps {
  title: string
  message: string
  emoji?: string
  confirmText?: string
  cancelText?: string
  confirmVariant?: 'primary' | 'secondary' | 'ghost'
  isLoading?: boolean
  onConfirm: () => void
  onCancel: () => void
}

export function ConfirmModal({
  title,
  message,
  emoji = '🤔',
  confirmText = '확인',
  cancelText = '취소',
  confirmVariant = 'primary',
  isLoading = false,
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
      <div className="bg-white rounded-2xl p-6 max-w-sm w-full text-center">
        <span className="text-5xl block mb-4">{emoji}</span>
        <h3 className="text-heading font-semibold text-text mb-2">{title}</h3>
        <p className="text-body text-text-muted mb-6">{message}</p>
        <div className="flex gap-3">
          <Button
            variant="ghost"
            fullWidth
            onClick={onCancel}
            disabled={isLoading}
          >
            {cancelText}
          </Button>
          <Button
            variant={confirmVariant}
            fullWidth
            onClick={onConfirm}
            isLoading={isLoading}
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </div>
  )
}
