'use client'

import { HTMLAttributes, forwardRef } from 'react'

type CardVariant = 'default' | 'highlighted'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant
}

const variantStyles: Record<CardVariant, string> = {
  default: `
    bg-background-cream
    border border-gray-200
    shadow-card
  `,
  highlighted: `
    bg-gradient-to-br from-background-cream to-primary-light/10
    border-2 border-accent/30
    shadow-card-hover
  `,
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ variant = 'default', className = '', children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={`
          rounded-card p-5
          transition-all duration-200
          ${variantStyles[variant]}
          ${className}
        `}
        {...props}
      >
        {children}
      </div>
    )
  }
)

Card.displayName = 'Card'
