/**
 * ErrorDisplay Components
 *
 * Components for displaying validation errors in the FilterBox.
 */

import { useState, useCallback, useRef, useEffect, type ReactNode } from 'react'
import { clsx } from 'clsx'
import type { ValidationError } from '@/types'
import './ErrorDisplay.css'

// =============================================================================
// Error Tooltip
// =============================================================================

export interface ErrorTooltipProps {
  /** The error(s) to display */
  errors: ValidationError[]
  /** The element to attach the tooltip to */
  children: ReactNode
  /** Whether to show the tooltip */
  show?: boolean
  /** Position of the tooltip */
  position?: 'top' | 'bottom' | 'left' | 'right'
  /** Additional CSS class */
  className?: string
}

/**
 * Tooltip component for displaying validation errors on hover
 */
export function ErrorTooltip({
  errors,
  children,
  show = true,
  position = 'top',
  className,
}: ErrorTooltipProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 })
  const triggerRef = useRef<HTMLDivElement>(null)
  const tooltipRef = useRef<HTMLDivElement>(null)

  const updatePosition = useCallback(() => {
    if (!triggerRef.current || !tooltipRef.current) return

    const triggerRect = triggerRef.current.getBoundingClientRect()
    const tooltipRect = tooltipRef.current.getBoundingClientRect()

    let top = 0
    let left = 0

    switch (position) {
      case 'top':
        top = -tooltipRect.height - 8
        left = (triggerRect.width - tooltipRect.width) / 2
        break
      case 'bottom':
        top = triggerRect.height + 8
        left = (triggerRect.width - tooltipRect.width) / 2
        break
      case 'left':
        top = (triggerRect.height - tooltipRect.height) / 2
        left = -tooltipRect.width - 8
        break
      case 'right':
        top = (triggerRect.height - tooltipRect.height) / 2
        left = triggerRect.width + 8
        break
    }

    setTooltipPosition({ top, left })
  }, [position])

  useEffect(() => {
    if (isVisible) {
      updatePosition()
    }
  }, [isVisible, updatePosition])

  const handleMouseEnter = useCallback(() => {
    if (show && errors.length > 0) {
      setIsVisible(true)
    }
  }, [show, errors])

  const handleMouseLeave = useCallback(() => {
    setIsVisible(false)
  }, [])

  if (errors.length === 0) {
    return <>{children}</>
  }

  return (
    <div
      ref={triggerRef}
      className={clsx('error-tooltip-trigger', className)}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onFocus={handleMouseEnter}
      onBlur={handleMouseLeave}
    >
      {children}
      {isVisible && (
        <div
          ref={tooltipRef}
          role="tooltip"
          className={clsx('error-tooltip', `error-tooltip--${position}`)}
          style={{ top: tooltipPosition.top, left: tooltipPosition.left }}
        >
          <div className="error-tooltip__content">
            {errors.length === 1 ? (
              <span className="error-tooltip__message">{errors[0].message}</span>
            ) : (
              <ul className="error-tooltip__list">
                {errors.map((error, index) => (
                  <li key={index} className="error-tooltip__item">
                    {error.message}
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div className="error-tooltip__arrow" />
        </div>
      )}
    </div>
  )
}

// =============================================================================
// Error Summary
// =============================================================================

export interface ErrorSummaryProps {
  /** List of validation errors */
  errors: ValidationError[]
  /** Whether to show the summary */
  show?: boolean
  /** Title for the summary */
  title?: string
  /** Whether the summary is dismissible */
  dismissible?: boolean
  /** Callback when summary is dismissed */
  onDismiss?: () => void
  /** Additional CSS class */
  className?: string
}

/**
 * Component for displaying a summary of all validation errors
 */
export function ErrorSummary({
  errors,
  show = true,
  title = 'Validation Errors',
  dismissible = false,
  onDismiss,
  className,
}: ErrorSummaryProps) {
  if (!show || errors.length === 0) {
    return null
  }

  return (
    <div role="alert" aria-live="polite" className={clsx('error-summary', className)}>
      <div className="error-summary__header">
        <span className="error-summary__icon" aria-hidden="true">
          ⚠
        </span>
        <span className="error-summary__title">{title}</span>
        {dismissible && (
          <button
            type="button"
            className="error-summary__dismiss"
            onClick={onDismiss}
            aria-label="Dismiss errors"
          >
            ×
          </button>
        )}
      </div>
      <ul className="error-summary__list">
        {errors.map((error, index) => (
          <li key={index} className="error-summary__item">
            {error.expressionIndex !== undefined && (
              <span className="error-summary__index">Expression {error.expressionIndex + 1}:</span>
            )}
            {error.field && <span className="error-summary__field">{error.field}:</span>}
            <span className="error-summary__message">{error.message}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

// =============================================================================
// Error Indicator
// =============================================================================

export interface ErrorIndicatorProps {
  /** Whether there is an error */
  hasError: boolean
  /** Error count (for badge display) */
  errorCount?: number
  /** Size of the indicator */
  size?: 'small' | 'medium' | 'large'
  /** Additional CSS class */
  className?: string
}

/**
 * Small error indicator icon/badge
 */
export function ErrorIndicator({
  hasError,
  errorCount,
  size = 'small',
  className,
}: ErrorIndicatorProps) {
  if (!hasError) {
    return null
  }

  return (
    <span
      className={clsx('error-indicator', `error-indicator--${size}`, className)}
      aria-label={`${errorCount ?? 1} error${(errorCount ?? 1) > 1 ? 's' : ''}`}
    >
      {errorCount !== undefined && errorCount > 1 ? errorCount : '!'}
    </span>
  )
}

// =============================================================================
// useValidationErrors Hook
// =============================================================================

export interface UseValidationErrorsOptions {
  /** Called when validation errors change */
  onError?: (errors: ValidationError[]) => void
}

export interface UseValidationErrorsReturn {
  /** Current validation errors */
  errors: ValidationError[]
  /** Add an error */
  addError: (error: ValidationError) => void
  /** Remove errors by expression index */
  removeErrorsByExpression: (expressionIndex: number) => void
  /** Clear all errors */
  clearErrors: () => void
  /** Check if there are any errors */
  hasErrors: boolean
  /** Get errors for a specific expression */
  getErrorsForExpression: (expressionIndex: number) => ValidationError[]
}

/**
 * Hook for managing validation errors
 */
export function useValidationErrors({
  onError,
}: UseValidationErrorsOptions = {}): UseValidationErrorsReturn {
  const [errors, setErrors] = useState<ValidationError[]>([])

  const addError = useCallback(
    (error: ValidationError) => {
      setErrors((prev) => {
        const newErrors = [...prev, error]
        onError?.(newErrors)
        return newErrors
      })
    },
    [onError]
  )

  const removeErrorsByExpression = useCallback(
    (expressionIndex: number) => {
      setErrors((prev) => {
        const newErrors = prev.filter((e) => e.expressionIndex !== expressionIndex)
        if (newErrors.length !== prev.length) {
          onError?.(newErrors)
        }
        return newErrors
      })
    },
    [onError]
  )

  const clearErrors = useCallback(() => {
    setErrors([])
    onError?.([])
  }, [onError])

  const getErrorsForExpression = useCallback(
    (expressionIndex: number) => {
      return errors.filter((e) => e.expressionIndex === expressionIndex)
    },
    [errors]
  )

  return {
    errors,
    addError,
    removeErrorsByExpression,
    clearErrors,
    hasErrors: errors.length > 0,
    getErrorsForExpression,
  }
}
