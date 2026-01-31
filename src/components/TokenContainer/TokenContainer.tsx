/**
 * TokenContainer Component
 *
 * Container that holds all tokens and the input field.
 */

import type { KeyboardEvent, RefObject, InputHTMLAttributes } from 'react'
import { clsx } from 'clsx'
import { Token } from '../Token'
import { TokenInput } from '../TokenInput'
import type { TokenData, ConditionValue } from '@/types'
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
  /** Index of token currently being edited (-1 if not editing) */
  editingTokenIndex?: number
  /** Index of currently selected token (-1 if none) */
  selectedTokenIndex?: number
  /** Whether all tokens are selected */
  allTokensSelected?: boolean
  /** Called when token edit is complete */
  onTokenEditComplete?: (newValue: ConditionValue) => void
  /** Called when token edit is cancelled */
  onTokenEditCancel?: () => void
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
  editingTokenIndex = -1,
  selectedTokenIndex = -1,
  allTokensSelected = false,
  onTokenEditComplete,
  onTokenEditCancel,
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
      {tokens.map((token, index) => (
        <Token
          key={token.id}
          data={token}
          isEditable={token.type === 'value' && !token.isPending}
          isEditing={index === editingTokenIndex}
          isSelected={allTokensSelected || index === selectedTokenIndex}
          isDeletable={false}
          onEdit={() => onTokenClick?.(index)}
          onDelete={() => {}}
          onEditComplete={(newValue) => onTokenEditComplete?.(newValue)}
          onEditCancel={() => onTokenEditCancel?.()}
        />
      ))}
      <TokenInput
        value={inputValue}
        onChange={onInputChange}
        onKeyDown={onInputKeyDown}
        onFocus={handleFocus}
        onBlur={handleBlur}
        inputRef={inputRef}
        placeholder={placeholder}
        disabled={disabled}
        {...inputProps}
      />
    </div>
  )
}
