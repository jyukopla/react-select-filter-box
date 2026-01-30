/**
 * Tests for Custom Input Widgets
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {
  DatePickerWidget,
  createDatePickerWidget,
  NumberInputWidget,
  createNumberInputWidget,
  DateRangeWidget,
  createDateRangeWidget,
} from './index'
import type { FieldConfig, OperatorConfig } from '@/types'

const mockFieldConfig: FieldConfig = {
  key: 'testField',
  label: 'Test Field',
  type: 'date',
  operators: [],
}

const mockOperatorConfig: OperatorConfig = {
  key: 'eq',
  label: 'equals',
}

describe('DatePickerWidget', () => {
  const defaultProps = {
    onConfirm: vi.fn(),
    onCancel: vi.fn(),
    fieldConfig: mockFieldConfig,
    operatorConfig: mockOperatorConfig,
  }

  it('should render date picker', () => {
    render(DatePickerWidget.render(defaultProps))
    expect(screen.getByText('Select Date')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Confirm' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument()
  })

  it('should render preset buttons by default', () => {
    render(DatePickerWidget.render(defaultProps))
    expect(screen.getByRole('button', { name: 'Today' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Yesterday' })).toBeInTheDocument()
  })

  it('should call onConfirm when preset is clicked', () => {
    const onConfirm = vi.fn()
    render(DatePickerWidget.render({ ...defaultProps, onConfirm }))
    
    fireEvent.click(screen.getByRole('button', { name: 'Today' }))
    
    expect(onConfirm).toHaveBeenCalled()
    expect(onConfirm.mock.calls[0][0]).toBeInstanceOf(Date)
    expect(onConfirm.mock.calls[0][1]).toBe('Today')
  })

  it('should call onCancel when cancel is clicked', () => {
    const onCancel = vi.fn()
    render(DatePickerWidget.render({ ...defaultProps, onCancel }))
    
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }))
    
    expect(onCancel).toHaveBeenCalled()
  })

  it('should disable confirm button when no date selected', () => {
    render(DatePickerWidget.render(defaultProps))
    expect(screen.getByRole('button', { name: 'Confirm' })).toBeDisabled()
  })

  it('should validate dates correctly', () => {
    expect(DatePickerWidget.validate?.(new Date())).toBe(true)
    expect(DatePickerWidget.validate?.(new Date('invalid'))).toBe(false)
    expect(DatePickerWidget.validate?.('not a date')).toBe(false)
    expect(DatePickerWidget.validate?.(null)).toBe(false)
  })

  it('should serialize and parse dates', () => {
    const date = new Date('2024-01-15T00:00:00.000Z')
    const serialized = DatePickerWidget.serialize?.(date)
    expect(serialized).toBe('2024-01-15T00:00:00.000Z')
    
    const parsed = DatePickerWidget.parse?.(serialized!)
    expect(parsed).toEqual(date)
  })

  it('should hide presets when showPresets is false', () => {
    const widget = createDatePickerWidget({ showPresets: false })
    render(widget.render(defaultProps))
    expect(screen.queryByRole('button', { name: 'Today' })).not.toBeInTheDocument()
  })
})

describe('NumberInputWidget', () => {
  const defaultProps = {
    onConfirm: vi.fn(),
    onCancel: vi.fn(),
    fieldConfig: { ...mockFieldConfig, type: 'number' as const },
    operatorConfig: mockOperatorConfig,
  }

  it('should render number input', () => {
    render(NumberInputWidget.render(defaultProps))
    expect(screen.getByText('Enter Number')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Enter number...')).toBeInTheDocument()
  })

  it('should render increment/decrement buttons', () => {
    render(NumberInputWidget.render(defaultProps))
    expect(screen.getByRole('button', { name: 'Decrease' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Increase' })).toBeInTheDocument()
  })

  it('should call onConfirm when valid number is entered', async () => {
    const onConfirm = vi.fn()
    const user = userEvent.setup()
    render(NumberInputWidget.render({ ...defaultProps, onConfirm }))
    
    const input = screen.getByPlaceholderText('Enter number...')
    await user.type(input, '42')
    
    fireEvent.click(screen.getByRole('button', { name: 'Confirm' }))
    
    expect(onConfirm).toHaveBeenCalledWith(42, '42')
  })

  it('should show error for invalid number', async () => {
    const user = userEvent.setup()
    render(NumberInputWidget.render(defaultProps))
    
    const input = screen.getByPlaceholderText('Enter number...')
    await user.type(input, 'abc')
    
    expect(screen.getByText('Please enter a valid number')).toBeInTheDocument()
  })

  it('should validate min/max constraints', () => {
    const widget = createNumberInputWidget({ min: 0, max: 100 })
    
    expect(widget.validate?.(50)).toBe(true)
    expect(widget.validate?.(-1)).toBe(false)
    expect(widget.validate?.(101)).toBe(false)
  })

  it('should validate integer constraint', () => {
    const widget = createNumberInputWidget({ integer: true })
    
    expect(widget.validate?.(42)).toBe(true)
    expect(widget.validate?.(3.14)).toBe(false)
  })

  it('should increment/decrement value', async () => {
    const user = userEvent.setup()
    render(NumberInputWidget.render(defaultProps))
    
    const input = screen.getByPlaceholderText('Enter number...')
    await user.type(input, '10')
    
    fireEvent.click(screen.getByRole('button', { name: 'Increase' }))
    
    expect(input).toHaveValue('11')
  })

  it('should hide buttons when showButtons is false', () => {
    const widget = createNumberInputWidget({ showButtons: false })
    render(widget.render(defaultProps))
    expect(screen.queryByRole('button', { name: 'Increase' })).not.toBeInTheDocument()
  })

  it('should show range hint', () => {
    const widget = createNumberInputWidget({ min: 0, max: 100 })
    render(widget.render(defaultProps))
    expect(screen.getByText('Range: 0 to 100')).toBeInTheDocument()
  })
})

describe('DateRangeWidget', () => {
  const defaultProps = {
    onConfirm: vi.fn(),
    onCancel: vi.fn(),
    fieldConfig: mockFieldConfig,
    operatorConfig: { ...mockOperatorConfig, key: 'between', label: 'between' },
  }

  it('should render date range inputs', () => {
    render(DateRangeWidget.render(defaultProps))
    expect(screen.getByText('Select Date Range')).toBeInTheDocument()
    expect(screen.getByText('From')).toBeInTheDocument()
    expect(screen.getByText('To')).toBeInTheDocument()
  })

  it('should render range presets', () => {
    render(DateRangeWidget.render(defaultProps))
    expect(screen.getByRole('button', { name: 'Last 7 days' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'This month' })).toBeInTheDocument()
  })

  it('should call onConfirm when preset is clicked', () => {
    const onConfirm = vi.fn()
    render(DateRangeWidget.render({ ...defaultProps, onConfirm }))
    
    fireEvent.click(screen.getByRole('button', { name: 'Last 7 days' }))
    
    expect(onConfirm).toHaveBeenCalled()
    const value = onConfirm.mock.calls[0][0]
    expect(value).toHaveProperty('from')
    expect(value).toHaveProperty('to')
  })

  it('should validate date range correctly', () => {
    const validRange = {
      from: new Date('2024-01-01'),
      to: new Date('2024-01-31'),
    }
    const invalidRange = {
      from: new Date('2024-01-31'),
      to: new Date('2024-01-01'),
    }

    expect(DateRangeWidget.validate?.(validRange)).toBe(true)
    expect(DateRangeWidget.validate?.(invalidRange)).toBe(false)
    expect(DateRangeWidget.validate?.(null)).toBe(false)
    expect(DateRangeWidget.validate?.({})).toBe(false)
  })

  it('should serialize and parse date ranges', () => {
    const range = {
      from: new Date('2024-01-01T00:00:00.000Z'),
      to: new Date('2024-01-31T00:00:00.000Z'),
    }
    
    const serialized = DateRangeWidget.serialize?.(range)
    expect(serialized).toContain('2024-01-01')
    expect(serialized).toContain('2024-01-31')
    
    const parsed = DateRangeWidget.parse?.(serialized!)
    expect(parsed?.from.toISOString()).toBe(range.from.toISOString())
    expect(parsed?.to.toISOString()).toBe(range.to.toISOString())
  })

  it('should use custom labels', () => {
    const widget = createDateRangeWidget({
      labels: { from: 'Start Date', to: 'End Date' },
    })
    render(widget.render(defaultProps))
    expect(screen.getByText('Start Date')).toBeInTheDocument()
    expect(screen.getByText('End Date')).toBeInTheDocument()
  })

  it('should disable confirm when dates are incomplete', () => {
    render(DateRangeWidget.render(defaultProps))
    expect(screen.getByRole('button', { name: 'Confirm' })).toBeDisabled()
  })
})

describe('Widget creation functions', () => {
  it('createDatePickerWidget creates valid widget', () => {
    const widget = createDatePickerWidget()
    expect(widget.render).toBeDefined()
    expect(widget.validate).toBeDefined()
    expect(widget.serialize).toBeDefined()
    expect(widget.parse).toBeDefined()
  })

  it('createNumberInputWidget creates valid widget', () => {
    const widget = createNumberInputWidget({ min: 0, max: 100, step: 5 })
    expect(widget.render).toBeDefined()
    expect(widget.validate).toBeDefined()
  })

  it('createDateRangeWidget creates valid widget', () => {
    const widget = createDateRangeWidget({ showPresets: false })
    expect(widget.render).toBeDefined()
    expect(widget.validate).toBeDefined()
  })
})
