/**
 * NumberInputWidget
 *
 * A custom number input widget for entering numeric values.
 */

import { useState, useCallback, useRef, useEffect } from 'react'
import type { CustomAutocompleteWidget, CustomWidgetProps } from '@/types'
import './CustomInputs.css'

export interface NumberInputWidgetOptions {
  /** Minimum value */
  min?: number
  /** Maximum value */
  max?: number
  /** Step increment */
  step?: number
  /** Require integer values */
  integer?: boolean
  /** Placeholder text */
  placeholder?: string
  /** Custom formatter */
  format?: (value: number) => string
  /** Custom parser */
  parse?: (input: string) => number | null
  /** Show increment/decrement buttons */
  showButtons?: boolean
}

/**
 * NumberInput component for rendering inside dropdown
 */
function NumberInputComponent({
  onConfirm,
  onCancel,
  initialValue,
  options = {},
}: CustomWidgetProps & { options?: NumberInputWidgetOptions }) {
  const {
    min,
    max,
    step = 1,
    integer = false,
    placeholder = 'Enter number...',
    format = (v) => String(v),
    parse: customParse,
    showButtons = true,
  } = options

  const [inputValue, setInputValue] = useState<string>(
    typeof initialValue === 'number' ? String(initialValue) : ''
  )
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus()
    inputRef.current?.select()
  }, [])

  const parseValue = useCallback(
    (input: string): number | null => {
      if (customParse) {
        return customParse(input)
      }
      const trimmed = input.trim()
      if (trimmed === '') return null
      const parsed = integer ? parseInt(trimmed, 10) : parseFloat(trimmed)
      return isNaN(parsed) ? null : parsed
    },
    [customParse, integer]
  )

  const validateValue = useCallback(
    (value: number | null): string | null => {
      if (value === null) return 'Please enter a valid number'
      if (min !== undefined && value < min) return `Value must be at least ${min}`
      if (max !== undefined && value > max) return `Value must be at most ${max}`
      if (integer && !Number.isInteger(value)) return 'Value must be an integer'
      return null
    },
    [min, max, integer]
  )

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value
      setInputValue(value)
      const parsed = parseValue(value)
      setError(validateValue(parsed))
    },
    [parseValue, validateValue]
  )

  const handleConfirm = useCallback(() => {
    const parsed = parseValue(inputValue)
    const validationError = validateValue(parsed)
    if (validationError || parsed === null) {
      setError(validationError ?? 'Invalid value')
      return
    }
    onConfirm(parsed, format(parsed))
  }, [inputValue, parseValue, validateValue, onConfirm, format])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.preventDefault()
        handleConfirm()
      } else if (e.key === 'Escape') {
        e.preventDefault()
        onCancel()
      }
    },
    [handleConfirm, onCancel]
  )

  const adjustValue = useCallback(
    (delta: number) => {
      const current = parseValue(inputValue) ?? 0
      let newValue = current + delta
      if (min !== undefined) newValue = Math.max(min, newValue)
      if (max !== undefined) newValue = Math.min(max, newValue)
      if (integer) newValue = Math.round(newValue)
      setInputValue(String(newValue))
      setError(null)
    },
    [inputValue, parseValue, min, max, integer]
  )

  const parsedValue = parseValue(inputValue)
  const isValid = parsedValue !== null && validateValue(parsedValue) === null

  return (
    <div className="custom-widget custom-widget--number-input" onKeyDown={handleKeyDown}>
      <div className="custom-widget__header">
        <span className="custom-widget__title">Enter Number</span>
      </div>

      <div className="custom-widget__content">
        <div className="custom-widget__number-group">
          {showButtons && (
            <button
              type="button"
              className="custom-widget__number-btn"
              onClick={() => adjustValue(-step)}
              aria-label="Decrease"
            >
              −
            </button>
          )}
          <input
            ref={inputRef}
            type="text"
            inputMode={integer ? 'numeric' : 'decimal'}
            className="custom-widget__number-input"
            value={inputValue}
            onChange={handleInputChange}
            placeholder={placeholder}
            aria-invalid={!!error}
          />
          {showButtons && (
            <button
              type="button"
              className="custom-widget__number-btn"
              onClick={() => adjustValue(step)}
              aria-label="Increase"
            >
              +
            </button>
          )}
        </div>
        {error && <div className="custom-widget__error">{error}</div>}
        {(min !== undefined || max !== undefined) && (
          <div className="custom-widget__hint">
            {min !== undefined && max !== undefined
              ? `Range: ${min} to ${max}`
              : min !== undefined
                ? `Min: ${min}`
                : `Max: ${max}`}
          </div>
        )}
      </div>

      <div className="custom-widget__footer">
        <button
          type="button"
          className="custom-widget__btn custom-widget__btn--cancel"
          onClick={onCancel}
        >
          Cancel
        </button>
        <button
          type="button"
          className="custom-widget__btn custom-widget__btn--confirm"
          onClick={handleConfirm}
          disabled={!isValid}
        >
          Confirm
        </button>
      </div>
    </div>
  )
}

/**
 * Create a NumberInput widget for use with autocomplete
 */
// eslint-disable-next-line react-refresh/only-export-components
export function createNumberInputWidget(
  options: NumberInputWidgetOptions = {}
): CustomAutocompleteWidget {
  return {
    render: (props: CustomWidgetProps) => <NumberInputComponent {...props} options={options} />,
    validate: (value: unknown) => {
      if (typeof value !== 'number' || isNaN(value)) return false
      if (options.min !== undefined && value < options.min) return false
      if (options.max !== undefined && value > options.max) return false
      if (options.integer && !Number.isInteger(value)) return false
      return true
    },
    serialize: (value: unknown) => String(value),
    parse: (serialized: string) => {
      const parsed = options.integer ? parseInt(serialized, 10) : parseFloat(serialized)
      return isNaN(parsed) ? null : parsed
    },
  }
}

/**
 * Default NumberInput widget instance
 */
export const NumberInputWidget = createNumberInputWidget()
