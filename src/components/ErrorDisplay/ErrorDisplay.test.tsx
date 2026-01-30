/**
 * Tests for ErrorDisplay components
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { renderHook, act } from '@testing-library/react'
import {
  ErrorTooltip,
  ErrorSummary,
  ErrorIndicator,
  useValidationErrors,
} from './ErrorDisplay'
import type { ValidationError } from '@/types'

describe('ErrorTooltip', () => {
  const mockErrors: ValidationError[] = [
    { type: 'value', message: 'Invalid value format' },
  ]

  it('should render children when no errors', () => {
    render(
      <ErrorTooltip errors={[]}>
        <span>Child content</span>
      </ErrorTooltip>
    )
    expect(screen.getByText('Child content')).toBeInTheDocument()
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument()
  })

  it('should show tooltip on hover with errors', () => {
    render(
      <ErrorTooltip errors={mockErrors}>
        <span>Hover me</span>
      </ErrorTooltip>
    )
    
    fireEvent.mouseEnter(screen.getByText('Hover me').parentElement!)
    expect(screen.getByRole('tooltip')).toBeInTheDocument()
    expect(screen.getByText('Invalid value format')).toBeInTheDocument()
  })

  it('should hide tooltip on mouse leave', () => {
    render(
      <ErrorTooltip errors={mockErrors}>
        <span>Hover me</span>
      </ErrorTooltip>
    )
    
    const trigger = screen.getByText('Hover me').parentElement!
    fireEvent.mouseEnter(trigger)
    expect(screen.getByRole('tooltip')).toBeInTheDocument()
    
    fireEvent.mouseLeave(trigger)
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument()
  })

  it('should show multiple errors as list', () => {
    const multipleErrors: ValidationError[] = [
      { type: 'value', message: 'Error 1' },
      { type: 'field', message: 'Error 2' },
    ]
    
    render(
      <ErrorTooltip errors={multipleErrors}>
        <span>Hover me</span>
      </ErrorTooltip>
    )
    
    fireEvent.mouseEnter(screen.getByText('Hover me').parentElement!)
    expect(screen.getByText('Error 1')).toBeInTheDocument()
    expect(screen.getByText('Error 2')).toBeInTheDocument()
  })

  it('should not show tooltip when show is false', () => {
    render(
      <ErrorTooltip errors={mockErrors} show={false}>
        <span>Hover me</span>
      </ErrorTooltip>
    )
    
    fireEvent.mouseEnter(screen.getByText('Hover me').parentElement!)
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument()
  })

  it('should show tooltip on focus', () => {
    render(
      <ErrorTooltip errors={mockErrors}>
        <button>Focus me</button>
      </ErrorTooltip>
    )
    
    fireEvent.focus(screen.getByRole('button').parentElement!)
    expect(screen.getByRole('tooltip')).toBeInTheDocument()
  })
})

describe('ErrorSummary', () => {
  const mockErrors: ValidationError[] = [
    { type: 'value', message: 'Invalid date', expressionIndex: 0, field: 'startDate' },
    { type: 'field', message: 'Unknown field', expressionIndex: 1 },
  ]

  it('should render error summary', () => {
    render(<ErrorSummary errors={mockErrors} />)
    expect(screen.getByRole('alert')).toBeInTheDocument()
    expect(screen.getByText('Validation Errors')).toBeInTheDocument()
  })

  it('should display all errors', () => {
    render(<ErrorSummary errors={mockErrors} />)
    expect(screen.getByText('Invalid date')).toBeInTheDocument()
    expect(screen.getByText('Unknown field')).toBeInTheDocument()
  })

  it('should show expression index', () => {
    render(<ErrorSummary errors={mockErrors} />)
    expect(screen.getByText('Expression 1:')).toBeInTheDocument()
    expect(screen.getByText('Expression 2:')).toBeInTheDocument()
  })

  it('should show field name', () => {
    render(<ErrorSummary errors={mockErrors} />)
    expect(screen.getByText('startDate:')).toBeInTheDocument()
  })

  it('should hide when no errors', () => {
    render(<ErrorSummary errors={[]} />)
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })

  it('should hide when show is false', () => {
    render(<ErrorSummary errors={mockErrors} show={false} />)
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })

  it('should use custom title', () => {
    render(<ErrorSummary errors={mockErrors} title="Filter Errors" />)
    expect(screen.getByText('Filter Errors')).toBeInTheDocument()
  })

  it('should show dismiss button when dismissible', () => {
    const onDismiss = vi.fn()
    render(
      <ErrorSummary errors={mockErrors} dismissible onDismiss={onDismiss} />
    )
    
    const dismissBtn = screen.getByRole('button', { name: 'Dismiss errors' })
    expect(dismissBtn).toBeInTheDocument()
    
    fireEvent.click(dismissBtn)
    expect(onDismiss).toHaveBeenCalled()
  })
})

describe('ErrorIndicator', () => {
  it('should not render when no error', () => {
    const { container } = render(<ErrorIndicator hasError={false} />)
    expect(container.querySelector('.error-indicator')).not.toBeInTheDocument()
  })

  it('should render when has error', () => {
    render(<ErrorIndicator hasError={true} />)
    expect(screen.getByLabelText('1 error')).toBeInTheDocument()
  })

  it('should show error count', () => {
    render(<ErrorIndicator hasError={true} errorCount={5} />)
    expect(screen.getByText('5')).toBeInTheDocument()
    expect(screen.getByLabelText('5 errors')).toBeInTheDocument()
  })

  it('should apply size classes', () => {
    const { rerender, container } = render(
      <ErrorIndicator hasError={true} size="small" />
    )
    expect(container.querySelector('.error-indicator--small')).toBeInTheDocument()
    
    rerender(<ErrorIndicator hasError={true} size="large" />)
    expect(container.querySelector('.error-indicator--large')).toBeInTheDocument()
  })
})

describe('useValidationErrors', () => {
  it('should initialize with empty errors', () => {
    const { result } = renderHook(() => useValidationErrors())
    expect(result.current.errors).toEqual([])
    expect(result.current.hasErrors).toBe(false)
  })

  it('should add error', () => {
    const { result } = renderHook(() => useValidationErrors())
    
    act(() => {
      result.current.addError({ type: 'value', message: 'Test error' })
    })
    
    expect(result.current.errors).toHaveLength(1)
    expect(result.current.hasErrors).toBe(true)
  })

  it('should remove errors by expression index', () => {
    const { result } = renderHook(() => useValidationErrors())
    
    act(() => {
      result.current.addError({ type: 'value', message: 'Error 1', expressionIndex: 0 })
      result.current.addError({ type: 'value', message: 'Error 2', expressionIndex: 1 })
      result.current.addError({ type: 'value', message: 'Error 3', expressionIndex: 0 })
    })
    
    expect(result.current.errors).toHaveLength(3)
    
    act(() => {
      result.current.removeErrorsByExpression(0)
    })
    
    expect(result.current.errors).toHaveLength(1)
    expect(result.current.errors[0].message).toBe('Error 2')
  })

  it('should clear all errors', () => {
    const { result } = renderHook(() => useValidationErrors())
    
    act(() => {
      result.current.addError({ type: 'value', message: 'Error 1' })
      result.current.addError({ type: 'value', message: 'Error 2' })
    })
    
    expect(result.current.errors).toHaveLength(2)
    
    act(() => {
      result.current.clearErrors()
    })
    
    expect(result.current.errors).toHaveLength(0)
    expect(result.current.hasErrors).toBe(false)
  })

  it('should get errors for specific expression', () => {
    const { result } = renderHook(() => useValidationErrors())
    
    act(() => {
      result.current.addError({ type: 'value', message: 'Expr 0 - Error 1', expressionIndex: 0 })
      result.current.addError({ type: 'value', message: 'Expr 1 - Error', expressionIndex: 1 })
      result.current.addError({ type: 'value', message: 'Expr 0 - Error 2', expressionIndex: 0 })
    })
    
    const expr0Errors = result.current.getErrorsForExpression(0)
    expect(expr0Errors).toHaveLength(2)
    expect(expr0Errors[0].message).toBe('Expr 0 - Error 1')
  })

  it('should call onError callback when errors change', () => {
    const onError = vi.fn()
    const { result } = renderHook(() => useValidationErrors({ onError }))
    
    act(() => {
      result.current.addError({ type: 'value', message: 'Test' })
    })
    
    expect(onError).toHaveBeenCalledWith([{ type: 'value', message: 'Test' }])
    
    act(() => {
      result.current.clearErrors()
    })
    
    expect(onError).toHaveBeenLastCalledWith([])
  })
})
