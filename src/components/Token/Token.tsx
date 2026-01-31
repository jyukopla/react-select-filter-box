/**
 * Token Component
 *
 * Renders a single token (field, operator, value, or connector) in the filter box.
 */

import { memo, useState, useEffect, useRef, type KeyboardEvent } from 'react'
import { clsx } from 'clsx'
import type {
  TokenData,
  FieldValue,
  OperatorValue,
  ConditionValue,
  ConnectorValue,
} from '@/types'
import './Token.css'

export interface TokenProps {
  /** Token data */
  data: TokenData
  /** Whether this token can be edited */
  isEditable: boolean
  /** Whether this token is currently being edited */
  isEditing: boolean
  /** Whether this token is selected */
  isSelected: boolean
  /** Whether this token can be deleted */
  isDeletable: boolean
  /** Whether this token has a validation error */
  hasError?: boolean
  /** Error message to display on hover */
  errorMessage?: string
  /** Called when the token is clicked to edit */
  onEdit: () => void
  /** Called when delete is requested */
  onDelete: () => void
  /** Called when editing is completed with new value */
  onEditComplete: (newValue: ConditionValue) => void
  /** Called when editing is cancelled */
  onEditCancel: () => void
  /** Additional CSS class */
  className?: string
}

/**
 * Get the display text for a token
 */
function getTokenDisplay(data: TokenData): string {
  switch (data.type) {
    case 'field': {
      const fieldValue = data.value as FieldValue
      return fieldValue.label
    }
    case 'operator': {
      const operatorValue = data.value as OperatorValue
      return operatorValue.symbol ?? operatorValue.label
    }
    case 'value': {
      const conditionValue = data.value as ConditionValue
      return conditionValue.display
    }
    case 'connector': {
      const connectorValue = data.value as ConnectorValue
      return connectorValue.label
    }
    default:
      return ''
  }
}

/**
 * Get the aria-label for a token
 */
function getTokenAriaLabel(data: TokenData): string {
  const display = getTokenDisplay(data)
  return `${data.type}: ${display}`
}

/**
 * Token component that displays a single token in the filter expression
 * 
 * Memoized to prevent unnecessary re-renders when parent updates.
 */
export const Token = memo(function Token({
  data,
  isEditable,
  isEditing,
  isSelected,
  isDeletable: _isDeletable,
  hasError = false,
  errorMessage,
  onEdit,
  onDelete: _onDelete,
  onEditComplete,
  onEditCancel,
  className,
}: TokenProps) {
  const display = getTokenDisplay(data)
  const ariaLabel = getTokenAriaLabel(data)
  const inputRef = useRef<HTMLInputElement>(null)
  const [editValue, setEditValue] = useState(display)

  // Auto-focus and select all when entering edit mode
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [isEditing])

  // Reset edit value when starting to edit
  useEffect(() => {
    if (isEditing) {
      setEditValue(display)
    }
  }, [isEditing, display])

  const handleClick = () => {
    if (isEditable && !isEditing) {
      onEdit()
    }
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      const newValue: ConditionValue = {
        raw: editValue,
        display: editValue,
        serialized: editValue,
      }
      onEditComplete(newValue)
    } else if (e.key === 'Escape') {
      e.preventDefault()
      onEditCancel()
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditValue(e.target.value)
  }

  // Render inline input when editing
  if (isEditing) {
    return (
      <span
        className={clsx(
          'token',
          `token--${data.type}`,
          'token--editing',
          className
        )}
      >
        <input
          ref={inputRef}
          type="text"
          className="token__edit-input"
          value={editValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          aria-label={`Edit ${data.type}`}
        />
      </span>
    )
  }

  return (
    <span
      role="option"
      aria-selected={isSelected}
      aria-label={ariaLabel}
      aria-invalid={hasError ? 'true' : undefined}
      title={hasError && errorMessage ? errorMessage : undefined}
      data-error-message={hasError && errorMessage ? errorMessage : undefined}
      className={clsx(
        'token',
        `token--${data.type}`,
        {
          'token--editable': isEditable,
          'token--selected': isSelected,
          'token--error': hasError,
          'token--pending': data.isPending,
        },
        className
      )}
      onClick={handleClick}
    >
      {display}
    </span>
  )
})
