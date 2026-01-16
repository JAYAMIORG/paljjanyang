'use client'

import { forwardRef, InputHTMLAttributes } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  hint?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, className = '', id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s/g, '-')

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-small font-medium text-text mb-2"
          >
            {label}
            {props.required && <span className="text-accent-rose ml-1">*</span>}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={`
            w-full h-12 px-4
            bg-white rounded-button
            border border-gray-200
            text-body text-text
            placeholder:text-text-light
            transition-all duration-150
            focus:outline-none focus:border-primary
            focus:ring-3 focus:ring-primary/10
            disabled:bg-gray-100 disabled:cursor-not-allowed
            ${error ? 'border-red-400 bg-red-50' : ''}
            ${className}
          `}
          {...props}
        />
        {error && (
          <p className="mt-1.5 text-small text-red-500">{error}</p>
        )}
        {hint && !error && (
          <p className="mt-1.5 text-small text-text-light">{hint}</p>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'
