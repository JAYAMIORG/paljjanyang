'use client'

import { useEffect, useRef, useCallback, ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { CloseIcon } from './Icons'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  children: ReactNode
  title?: string
  showCloseButton?: boolean
  closeOnOverlayClick?: boolean
  closeOnEscape?: boolean
  className?: string
}

export function Modal({
  isOpen,
  onClose,
  children,
  title,
  showCloseButton = true,
  closeOnOverlayClick = true,
  closeOnEscape = true,
  className = '',
}: ModalProps) {
  const modalRef = useRef<HTMLDivElement>(null)
  const previousActiveElement = useRef<HTMLElement | null>(null)

  // 포커스 트랩: 모달 내에서만 탭 이동 가능
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!isOpen) return

      // ESC 키로 닫기
      if (e.key === 'Escape' && closeOnEscape) {
        onClose()
        return
      }

      // Tab 키 포커스 트랩
      if (e.key === 'Tab' && modalRef.current) {
        const focusableElements = modalRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        )
        const firstElement = focusableElements[0]
        const lastElement = focusableElements[focusableElements.length - 1]

        if (e.shiftKey) {
          // Shift + Tab
          if (document.activeElement === firstElement) {
            e.preventDefault()
            lastElement?.focus()
          }
        } else {
          // Tab
          if (document.activeElement === lastElement) {
            e.preventDefault()
            firstElement?.focus()
          }
        }
      }
    },
    [isOpen, onClose, closeOnEscape]
  )

  // 모달 열릴 때 포커스 이동, 닫힐 때 원래 요소로 복원
  useEffect(() => {
    let focusTimeoutId: NodeJS.Timeout | null = null
    const originalOverflow = document.body.style.overflow

    if (isOpen) {
      previousActiveElement.current = document.activeElement as HTMLElement
      // 모달 내 첫 번째 포커스 가능 요소로 이동
      focusTimeoutId = setTimeout(() => {
        const firstFocusable = modalRef.current?.querySelector<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        )
        firstFocusable?.focus()
      }, 0)

      // 배경 스크롤 방지
      document.body.style.overflow = 'hidden'
    } else {
      // 모달 닫힐 때 이전 요소로 포커스 복원
      previousActiveElement.current?.focus()
      document.body.style.overflow = originalOverflow
    }

    return () => {
      if (focusTimeoutId) {
        clearTimeout(focusTimeoutId)
      }
      document.body.style.overflow = originalOverflow
    }
  }, [isOpen])

  // 키보드 이벤트 리스너
  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  // 오버레이 클릭 핸들러
  const handleOverlayClick = (e: React.MouseEvent) => {
    if (closeOnOverlayClick && e.target === e.currentTarget) {
      onClose()
    }
  }

  if (!isOpen) return null

  // Portal을 사용하여 body에 직접 렌더링
  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? 'modal-title' : undefined}
    >
      {/* 오버레이 */}
      <div
        className="absolute inset-0 bg-black/50 animate-fade-in"
        onClick={handleOverlayClick}
        aria-hidden="true"
      />

      {/* 모달 컨텐츠 */}
      <div
        ref={modalRef}
        className={`
          relative bg-white rounded-2xl shadow-xl
          w-full max-w-sm mx-auto
          animate-scale-in
          ${className}
        `}
      >
        {/* 헤더 */}
        {(title || showCloseButton) && (
          <div className="flex items-center justify-between p-4 border-b border-gray-100">
            {title && (
              <h2 id="modal-title" className="text-subheading font-semibold text-text">
                {title}
              </h2>
            )}
            {showCloseButton && (
              <button
                onClick={onClose}
                className="p-2 -mr-2 text-text-light hover:text-text transition-colors rounded-full hover:bg-gray-100"
                aria-label="닫기"
              >
                <CloseIcon />
              </button>
            )}
          </div>
        )}

        {/* 본문 */}
        <div className="p-4">
          {children}
        </div>
      </div>
    </div>,
    document.body
  )
}

// 확인 다이얼로그 전용 컴포넌트
interface ConfirmDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title?: string
  message: string
  confirmText?: string
  cancelText?: string
  variant?: 'default' | 'danger'
  isLoading?: boolean
}

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title = '확인',
  message,
  confirmText = '확인',
  cancelText = '취소',
  variant = 'default',
  isLoading = false,
}: ConfirmDialogProps) {
  const handleConfirm = () => {
    if (!isLoading) {
      onConfirm()
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      showCloseButton={false}
      closeOnOverlayClick={!isLoading}
      closeOnEscape={!isLoading}
    >
      <div className="text-center">
        <p className="text-body text-text-muted mb-6 whitespace-pre-wrap">
          {message}
        </p>
        <div className="flex gap-3">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 h-12 rounded-button border border-gray-200 text-text font-medium hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            {cancelText}
          </button>
          <button
            onClick={handleConfirm}
            disabled={isLoading}
            className={`
              flex-1 h-12 rounded-button font-medium transition-colors disabled:opacity-50
              ${variant === 'danger'
                ? 'bg-red-500 text-white hover:bg-red-600'
                : 'bg-primary text-white hover:bg-primary-dark'
              }
            `}
          >
            {isLoading ? '처리 중...' : confirmText}
          </button>
        </div>
      </div>
    </Modal>
  )
}

// 알림 다이얼로그 전용 컴포넌트
interface AlertDialogProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  message: string
  buttonText?: string
  variant?: 'default' | 'success' | 'error'
}

export function AlertDialog({
  isOpen,
  onClose,
  title,
  message,
  buttonText = '확인',
  variant = 'default',
}: AlertDialogProps) {
  const iconMap = {
    default: null,
    success: <span className="text-4xl" aria-hidden="true">✅</span>,
    error: <span className="text-4xl" aria-hidden="true">❌</span>,
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      showCloseButton={false}
    >
      <div className="text-center">
        {iconMap[variant] && (
          <div className="mb-4">{iconMap[variant]}</div>
        )}
        <p className="text-body text-text-muted mb-6 whitespace-pre-wrap">
          {message}
        </p>
        <button
          onClick={onClose}
          className="w-full h-12 rounded-button bg-primary text-white font-medium hover:bg-primary-dark transition-colors"
        >
          {buttonText}
        </button>
      </div>
    </Modal>
  )
}
