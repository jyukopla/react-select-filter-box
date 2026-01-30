/**
 * TokenContainer Component
 *
 * Container that holds all tokens and the input field.
 */

import type { KeyboardEvent, RefObject } from 'react'
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
  onTokenClick: (position: number) => void
  /** Called when container gains focus */
  onFocus: () => void
  /** Called when container loses focus */
  onBlur: () => void
  /** Ref to the input element */
  inputRef: RefObject<HTMLInputElement | null>
  /** Placeholder for the input */
  placeholder?: string
  /** Whether the container is disabled */
  disabled?: boolean
  /** Additional CSS class */
  className?: string
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
  onFocus,
  onBlur,
  inputRef,
  placeholder,
  disabled,
  className,
}: TokenContainerProps) {
  const handleContainerClick = () => {
    onFocus()
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
          onEdit={() => onTokenClick(token.position)}
          onDelete={() => {}}
          onEditComplete={() => {}}
          onEditCancel={() => {}}
        />
      ))}
      <TokenInput
        value={inputValue}
        onChange={onInputChange}
        onKeyDown={onInputKeyDown}
        onFocus={onFocus}
        onBlur={onBlur}
        inputRef={inputRef}
        placeholder={tokens.length === 0 ? placeholder : undefined}
        disabled={disabled}
      />
    </div>
  )
}
