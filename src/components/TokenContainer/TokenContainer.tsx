/**
 * TokenContainer Component
 *
 * Container that holds all tokens and the input field.
 */

import type { KeyboardEvent, RefObject, InputHTMLAttributes } from 'react'
import { clsx } from 'clsx'
import { Token } from '../Token'
import { TokenInput } from '../TokenInput'
import type { TokenData } from '@/types'
import './TokenContainer.css'

export interface TokenContainerProps {
  /** Array of tokens to display */
  tokens: TokenData[]
  /** Current input value */
  inputValue: string
  /** Called when input value changes */
  onInputChange: (value: string) => void
  /** Called on input keydown */
  onInputKeyDown: (e: KeyboardEvent<HTMLInputElement>) => void
  /** Called when a token is clicked */
  onTokenClick?: (position: number) => void
  /** Called when input gains focus */
  onInputFocus?: () => void
  /** Called when input loses focus */
  onInputBlur?: () => void
  /** Called when container gains focus (legacy) */
  onFocus?: () => void
  /** Called when container loses focus (legacy) */
  onBlur?: () => void
  /** Ref to the input element */
  inputRef: RefObject<HTMLInputElement | null>
  /** Placeholder for the input */
  placeholder?: string
  /** Whether the container is disabled */
  disabled?: boolean
  /** Additional CSS class */
  className?: string
  /** Additional props for the input element */
  inputProps?: Partial<InputHTMLAttributes<HTMLInputElement>>
}

/**
 * TokenContainer component that renders tokens and an input field
 */
export function TokenContainer({
  tokens,
  inputValue,
  onInputChange,
  onInputKeyDown,
  onTokenClick,
  onInputFocus,
  onInputBlur,
  onFocus,
  onBlur,
  inputRef,
  placeholder,
  disabled,
  className,
  inputProps,
}: TokenContainerProps) {
  // Support both onInputFocus/onInputBlur and legacy onFocus/onBlur
  const handleFocus = onInputFocus ?? onFocus
  const handleBlur = onInputBlur ?? onBlur

  const handleContainerClick = () => {
    handleFocus?.()
    inputRef.current?.focus()
  }

  return (
    <div
      className={clsx('token-container', { 'token-container--disabled': disabled }, className)}
      onClick={handleContainerClick}
    >
      {tokens.map((token) => (
        <Token
          key={token.id}
          data={token}
          isEditable={token.type === 'value'}
          isEditing={false}
          isDeletable={false}
          onEdit={() => onTokenClick?.(token.position)}
          onDelete={() => {}}
          onEditComplete={() => {}}
          onEditCancel={() => {}}
        />
      ))}
      <TokenInput
        value={inputValue}
        onChange={onInputChange}
        onKeyDown={onInputKeyDown}
        onFocus={handleFocus}
        onBlur={handleBlur}
        inputRef={inputRef}
        placeholder={tokens.length === 0 ? placeholder : undefined}
        disabled={disabled}
        {...inputProps}
      />
    </div>
  )
}
