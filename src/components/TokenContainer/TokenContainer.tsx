/**
 * TokenContainer Component
 *
 * Container that holds all tokens and the input field.
 */

import type { KeyboardEvent, FocusEvent, RefObject, InputHTMLAttributes } from 'react'
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
  /** Called when a token is clicked for editing */
  onTokenClick?: (position: number) => void
  /** Called when a token is clicked for selection (deletion) */
  onTokenSelect?: (position: number) => void
  /** Called when an operator token is clicked (for editing) */
  onOperatorClick?: (expressionIndex: number) => void
  /** Called when a connector token is clicked (for editing) */
  onConnectorClick?: (expressionIndex: number) => void
  /** Called when input gains focus */
  onInputFocus?: () => void
  /** Called when input loses focus (receives event to check relatedTarget) */
  onInputBlur?: (e?: FocusEvent<HTMLInputElement>) => void
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
  /** Called when an expression should be deleted */
  onExpressionDelete?: (expressionIndex: number) => void
  /** Whether the container should take full available width (default: true) */
  fullWidth?: boolean
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
  onTokenSelect,
  onOperatorClick,
  onConnectorClick,
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
  onExpressionDelete,
  fullWidth = true,
}: TokenContainerProps) {
  // Support both onInputFocus/onInputBlur and legacy onFocus/onBlur
  const handleFocus = onInputFocus ?? onFocus
  const handleBlur = onInputBlur ?? onBlur

  const handleContainerClick = () => {
    handleFocus?.()
    inputRef.current?.focus()
  }

  // Handle token click - operators and connectors get special handling
  const handleTokenClickInternal = (token: TokenData, index: number) => {
    if (
      token.type === 'operator' &&
      !token.isPending &&
      token.expressionIndex >= 0 &&
      onOperatorClick
    ) {
      onOperatorClick(token.expressionIndex)
    } else if (
      token.type === 'connector' &&
      !token.isPending &&
      token.expressionIndex >= 0 &&
      onConnectorClick
    ) {
      onConnectorClick(token.expressionIndex)
    } else if (token.type === 'value') {
      // Value tokens are editable
      onTokenClick?.(index)
    } else {
      // Other tokens (field) are selectable for deletion
      onTokenSelect?.(index)
      // Focus input after selection
      requestAnimationFrame(() => {
        inputRef.current?.focus()
      })
    }
  }

  return (
    <div
      className={clsx(
        'token-container',
        { 'token-container--disabled': disabled, 'token-container--full-width': fullWidth },
        className
      )}
      onClick={handleContainerClick}
    >
      {tokens.map((token, index) => {
        const isSelected = allTokensSelected || index === selectedTokenIndex
        // Tokens are deletable when selected and belong to a completed expression
        const isDeletable = isSelected && !token.isPending && token.expressionIndex >= 0
        return (
          <Token
            key={token.id}
            data={token}
            isEditable={
              (token.type === 'value' || token.type === 'operator' || token.type === 'connector') &&
              !token.isPending
            }
            isSelectable={!token.isPending && token.expressionIndex >= 0}
            isEditing={index === editingTokenIndex}
            isSelected={isSelected}
            isDeletable={isDeletable}
            onEdit={() => handleTokenClickInternal(token, index)}
            onSelect={() => handleTokenClickInternal(token, index)}
            onDelete={() => {
              if (token.expressionIndex >= 0 && onExpressionDelete) {
                onExpressionDelete(token.expressionIndex)
              }
            }}
            onEditComplete={(newValue) => onTokenEditComplete?.(newValue)}
            onEditCancel={() => onTokenEditCancel?.()}
          />
        )
      })}
      <TokenInput
        {...inputProps}
        value={inputValue}
        onChange={onInputChange}
        onKeyDown={onInputKeyDown}
        onFocus={handleFocus}
        onBlur={handleBlur}
        inputRef={inputRef}
        placeholder={placeholder}
        disabled={disabled}
      />
    </div>
  )
}
