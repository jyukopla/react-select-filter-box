/**
 * Token Component
 *
 * Renders a single token (field, operator, value, or connector) in the filter box.
 */

import { memo } from 'react'
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
  /** Whether this token can be deleted */
  isDeletable: boolean
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
  isEditing: _isEditing,
  isDeletable: _isDeletable,
  onEdit,
  onDelete: _onDelete,
  onEditComplete: _onEditComplete,
  onEditCancel: _onEditCancel,
  className,
}: TokenProps) {
  const display = getTokenDisplay(data)
  const ariaLabel = getTokenAriaLabel(data)

  const handleClick = () => {
    if (isEditable) {
      onEdit()
    }
  }

  return (
    <span
      role="option"
      aria-selected={false}
      aria-label={ariaLabel}
      className={clsx(
        'token',
        `token--${data.type}`,
        {
          'token--editable': isEditable,
        },
        className
      )}
      onClick={handleClick}
    >
      {display}
    </span>
  )
})
