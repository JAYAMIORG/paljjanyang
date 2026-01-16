'use client'

import { forwardRef, SelectHTMLAttributes } from 'react'

interface SelectOption {
  value: string | number
  label: string
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string
  options: SelectOption[]
  placeholder?: string
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, options, placeholder, className = '', id, ...props }, ref) => {
    const selectId = id || label?.toLowerCase().replace(/\s/g, '-')

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={selectId}
            className="block text-small font-medium text-text mb-2"
          >
            {label}
            {props.required && <span className="text-accent-rose ml-1">*</span>}
          </label>
        )}
        <select
          ref={ref}
          id={selectId}
          className={`
            w-full h-12 px-4
            bg-white rounded-button
            border border-gray-200
            text-body text-text
            transition-all duration-150
            focus:outline-none focus:border-primary
            focus:ring-3 focus:ring-primary/10
            disabled:bg-gray-100 disabled:cursor-not-allowed
            appearance-none
            bg-[url('data:image/svg+xml;charset=UTF-8,%3csvg%20xmlns%3d%22http%3a%2f%2fwww.w3.org%2f2000%2fsvg%22%20width%3d%2224%22%20height%3d%2224%22%20viewBox%3d%220%200%2024%2024%22%20fill%3d%22none%22%20stroke%3d%22%236B6B6B%22%20stroke-width%3d%222%22%20stroke-linecap%3d%22round%22%20stroke-linejoin%3d%22round%22%3e%3cpolyline%20points%3d%226%209%2012%2015%2018%209%22%3e%3c%2fpolyline%3e%3c%2fsvg%3e')]
            bg-[length:20px_20px]
            bg-[right_12px_center]
            bg-no-repeat
            ${error ? 'border-red-400 bg-red-50' : ''}
            ${className}
          `}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {error && (
          <p className="mt-1.5 text-small text-red-500">{error}</p>
        )}
      </div>
    )
  }
)

Select.displayName = 'Select'
