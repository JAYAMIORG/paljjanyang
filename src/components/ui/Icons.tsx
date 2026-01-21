'use client'

import { SVGProps } from 'react'

type IconProps = SVGProps<SVGSVGElement> & {
  size?: number
}

// 공통 스타일 적용 헬퍼
const defaultStrokeProps = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
}

/**
 * 뒤로가기 화살표 아이콘 (chevron left)
 */
export function BackIcon({ size = 24, ...props }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      {...defaultStrokeProps}
      aria-hidden="true"
      {...props}
    >
      <path d="M15 18l-6-6 6-6" />
    </svg>
  )
}

/**
 * 닫기 X 아이콘
 */
export function CloseIcon({ size = 20, ...props }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      {...defaultStrokeProps}
      aria-hidden="true"
      {...props}
    >
      <path d="M18 6L6 18M6 6l12 12" />
    </svg>
  )
}

/**
 * 오른쪽 화살표 (chevron) 아이콘
 */
export function ChevronRightIcon({ size = 20, ...props }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      aria-hidden="true"
      {...props}
    >
      <path d="M7 5l5 5-5 5" />
    </svg>
  )
}

/**
 * 삭제 (휴지통) 아이콘
 */
export function TrashIcon({ size = 18, ...props }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      {...defaultStrokeProps}
      aria-hidden="true"
      {...props}
    >
      <path d="M3 6h18" />
      <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
      <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
    </svg>
  )
}

/**
 * 링크 아이콘
 */
export function LinkIcon({ size = 28, ...props }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      {...defaultStrokeProps}
      aria-hidden="true"
      {...props}
    >
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </svg>
  )
}

/**
 * 인스타그램 아이콘
 */
export function InstagramIcon({ size = 28, ...props }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      {...props}
    >
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
    </svg>
  )
}

/**
 * 카카오톡 아이콘
 */
export function KakaoIcon({ size = 28, ...props }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      {...props}
    >
      <path d="M12 3c-5.52 0-10 3.59-10 8 0 2.84 1.89 5.33 4.71 6.72-.17.64-.68 2.53-.78 2.92-.12.49.18.48.38.35.16-.1 2.49-1.68 3.49-2.36.72.11 1.46.17 2.2.17 5.52 0 10-3.59 10-8s-4.48-8-10-8z" />
    </svg>
  )
}

/**
 * 로딩 스피너 아이콘
 */
export function SpinnerIcon({ size = 24, className = '', ...props }: IconProps & { className?: string }) {
  return (
    <div
      className={`w-${size / 4} h-${size / 4} border-2 border-current border-t-transparent rounded-full animate-spin ${className}`}
      style={{ width: size, height: size }}
      role="status"
      aria-label="로딩 중"
      {...(props as React.HTMLAttributes<HTMLDivElement>)}
    />
  )
}
