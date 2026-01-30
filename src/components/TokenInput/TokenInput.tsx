/**
 * TokenInput Component
 *
 * Auto-sizing input for entering new token values.
 */

import { type KeyboardEvent, type RefObject, type InputHTMLAttributes, useState, useRef, useLayoutEffect } from 'react'
import { clsx } from 'clsx'
import './TokenInput.css'

export interface TokenInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange' | 'onKeyDown' | 'onFocus' | 'onBlur'> {
  /** Current input value */
  value: string
  /** Called when value changes */
  onChange: (value: string) => void
  /** Called on keydown events */
  onKeyDown: (e: KeyboardEvent<HTMLInputElement>) => void
  /** Called when input gains focus */
  onFocus?: () => void
  /** Called when input loses focus */
  onBlur?: () => void
  /** Placeholder text */
  placeholder?: string
  /** Whether to auto-focus on mount */
  autoFocus?: boolean
  /** Ref to the input element */
  inputRef: RefObject<HTMLInputElement | null>
  /** Additional CSS class */
  className?: string
  /** Whether input is disabled */
  disabled?: boolean
  /** Minimum width of the input */
  minWidth?: number
}

/**
 * TokenInput component - an auto-sizing input field for the filter box
 */
export function TokenInput({
  value,
  onChange,
  onKeyDown,
  onFocus,
  onBlur,
  placeholder,
  autoFocus,
  inputRef,
  className,
  disabled,
  minWidth = 50,
  ...restProps
}: TokenInputProps) {
  const sizerRef = useRef<HTMLSpanElement>(null)
  const [width, setWidth] = useState(minWidth)

  // Measure and update width when value or placeholder changes
  useLayoutEffect(() => {
    if (sizerRef.current) {
      const measuredWidth = sizerRef.current.scrollWidth
      setWidth(Math.max(measuredWidth + 2, minWidth))
    }
  }, [value, placeholder, minWidth])

  // Display text for sizing (value or placeholder)
  const sizerText = value || placeholder || ''

  return (
    <span className="token-input-wrapper">
      {/* Hidden sizer span */}
      <span
        ref={sizerRef}
        className="token-input-sizer"
        aria-hidden="true"
      >
        {sizerText}
      </span>
      <input
        ref={inputRef}
        type="text"
        role="combobox"
        aria-autocomplete="list"
        aria-expanded={false}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={onKeyDown}
        onFocus={onFocus}
        onBlur={onBlur}
        placeholder={placeholder}
        autoFocus={autoFocus}
        disabled={disabled}
        className={clsx('token-input', className)}
        style={{ width: `${width}px` }}
        {...restProps}
      />
    </span>
  )
}
