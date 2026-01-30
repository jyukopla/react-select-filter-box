/**
 * TokenInput Component
 *
 * Auto-sizing input for entering new token values.
 */

import type { KeyboardEvent, RefObject, InputHTMLAttributes } from 'react'
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
  ...restProps
}: TokenInputProps) {
  return (
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
      style={{ minWidth: '50px' }}
      {...restProps}
    />
  )
}
