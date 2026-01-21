'use client'

import { forwardRef, ButtonHTMLAttributes } from 'react'

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'cartoon'
type ButtonSize = 'sm' | 'md' | 'lg'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  isLoading?: boolean
  fullWidth?: boolean
}

const variantStyles: Record<ButtonVariant, string> = {
  primary: `
    bg-primary text-white
    hover:bg-primary-dark
    shadow-button
    active:scale-[0.98]
  `,
  secondary: `
    bg-transparent text-primary
    border-2 border-primary-light
    hover:bg-primary-light/10
    active:scale-[0.98]
  `,
  ghost: `
    bg-transparent text-text-muted
    hover:text-primary
    hover:bg-primary/5
  `,
  cartoon: `
    bg-primary text-white
    border-b-4 border-primary-dark
    rounded-full
    shadow-lg
    active:translate-y-0 active:border-b-2 active:shadow-md
  `,
}

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'h-9 px-4 text-small rounded-lg',
  md: 'h-12 px-6 text-body rounded-button',
  lg: 'h-14 px-8 text-body rounded-button',
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      fullWidth = false,
      disabled,
      className = '',
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        aria-busy={isLoading}
        aria-disabled={disabled || isLoading}
        className={`
          inline-flex items-center justify-center
          font-semibold
          transition-all duration-200
          disabled:opacity-50 disabled:cursor-not-allowed
          ${variantStyles[variant]}
          ${sizeStyles[size]}
          ${fullWidth ? 'w-full' : ''}
          ${className}
        `}
        {...props}
      >
        {isLoading ? (
          <span className="flex items-center gap-2" role="status" aria-live="polite">
            <LoadingSpinner />
            <span>잠시만요...</span>
            <span className="sr-only">로딩 중</span>
          </span>
        ) : (
          children
        )}
      </button>
    )
  }
)

Button.displayName = 'Button'

function LoadingSpinner() {
  return (
    <svg
      className="animate-spin h-5 w-5"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      aria-hidden="true"
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
