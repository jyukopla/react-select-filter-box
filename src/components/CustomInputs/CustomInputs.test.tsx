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

describe('DatePickerWidget advanced interactions', () => {
  const defaultProps = {
    onConfirm: vi.fn(),
    onCancel: vi.fn(),
    fieldConfig: mockFieldConfig,
    operatorConfig: mockOperatorConfig,
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should allow selecting a date via input and confirming', async () => {
    const onConfirm = vi.fn()
    render(DatePickerWidget.render({ ...defaultProps, onConfirm }))
    
    const input = document.querySelector('input[type="date"]') as HTMLInputElement
    fireEvent.change(input, { target: { value: '2024-06-15' } })
    
    fireEvent.click(screen.getByRole('button', { name: 'Confirm' }))
    
    expect(onConfirm).toHaveBeenCalled()
    const confirmedDate = onConfirm.mock.calls[0][0]
    expect(confirmedDate).toBeInstanceOf(Date)
  })

  it('should handle escape key to cancel', () => {
    const onCancel = vi.fn()
    render(DatePickerWidget.render({ ...defaultProps, onCancel }))
    
    const widget = screen.getByText('Select Date').closest('.custom-widget')
    fireEvent.keyDown(widget!, { key: 'Escape' })
    
    expect(onCancel).toHaveBeenCalled()
  })

  it('should handle enter key to confirm when date is selected', () => {
    const onConfirm = vi.fn()
    render(DatePickerWidget.render({ ...defaultProps, onConfirm }))
    
    const input = document.querySelector('input[type="date"]') as HTMLInputElement
    fireEvent.change(input, { target: { value: '2024-06-15' } })
    
    const widget = screen.getByText('Select Date').closest('.custom-widget')
    fireEvent.keyDown(widget!, { key: 'Enter' })
    
    expect(onConfirm).toHaveBeenCalled()
  })

  it('should respect min and max date constraints', () => {
    const widget = createDatePickerWidget({
      minDate: new Date('2024-01-01'),
      maxDate: new Date('2024-12-31'),
    })
    render(widget.render(defaultProps))
    
    const input = document.querySelector('input[type="date"]') as HTMLInputElement
    expect(input).toHaveAttribute('min', '2024-01-01')
    expect(input).toHaveAttribute('max', '2024-12-31')
  })

  it('should render with initial value', () => {
    const initialValue = new Date('2024-06-15')
    render(DatePickerWidget.render({ ...defaultProps, initialValue }))
    
    const input = document.querySelector('input[type="date"]') as HTMLInputElement
    expect(input.value).toBe('2024-06-15')
  })

  it('should use custom presets', () => {
    const customPresets = [
      { label: 'Custom Day', value: new Date('2024-07-04') },
    ]
    const widget = createDatePickerWidget({ presets: customPresets })
    render(widget.render(defaultProps))
    
    expect(screen.getByRole('button', { name: 'Custom Day' })).toBeInTheDocument()
  })

  it('should handle non-string values in serialize', () => {
    expect(DatePickerWidget.serialize?.(123)).toBe('123')
    expect(DatePickerWidget.serialize?.(null)).toBe('null')
  })

  it('should return null for invalid parse input', () => {
    expect(DatePickerWidget.parse?.('invalid-date')).toBeNull()
  })
})

describe('NumberInputWidget advanced interactions', () => {
  const defaultProps = {
    onConfirm: vi.fn(),
    onCancel: vi.fn(),
    fieldConfig: { ...mockFieldConfig, type: 'number' as const },
    operatorConfig: mockOperatorConfig,
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should handle escape key to cancel', () => {
    const onCancel = vi.fn()
    render(NumberInputWidget.render({ ...defaultProps, onCancel }))
    
    const widget = screen.getByText('Enter Number').closest('.custom-widget')
    fireEvent.keyDown(widget!, { key: 'Escape' })
    
    expect(onCancel).toHaveBeenCalled()
  })

  it('should handle enter key to confirm', async () => {
    const onConfirm = vi.fn()
    const user = userEvent.setup()
    render(NumberInputWidget.render({ ...defaultProps, onConfirm }))
    
    const input = screen.getByPlaceholderText('Enter number...')
    await user.type(input, '42')
    
    const widget = screen.getByText('Enter Number').closest('.custom-widget')
    fireEvent.keyDown(widget!, { key: 'Enter' })
    
    expect(onConfirm).toHaveBeenCalledWith(42, '42')
  })

  it('should decrement value', async () => {
    const user = userEvent.setup()
    render(NumberInputWidget.render(defaultProps))
    
    const input = screen.getByPlaceholderText('Enter number...')
    await user.type(input, '10')
    
    fireEvent.click(screen.getByRole('button', { name: 'Decrease' }))
    
    expect(input).toHaveValue('9')
  })

  it('should respect step value', async () => {
    const widget = createNumberInputWidget({ step: 5 })
    const user = userEvent.setup()
    render(widget.render(defaultProps))
    
    const input = screen.getByPlaceholderText('Enter number...')
    await user.type(input, '10')
    
    fireEvent.click(screen.getByRole('button', { name: 'Increase' }))
    
    expect(input).toHaveValue('15')
  })

  it('should respect min constraint on decrement', async () => {
    const widget = createNumberInputWidget({ min: 0 })
    const user = userEvent.setup()
    render(widget.render(defaultProps))
    
    const input = screen.getByPlaceholderText('Enter number...')
    await user.type(input, '0')
    
    fireEvent.click(screen.getByRole('button', { name: 'Decrease' }))
    
    expect(input).toHaveValue('0')
  })

  it('should respect max constraint on increment', async () => {
    const widget = createNumberInputWidget({ max: 100 })
    const user = userEvent.setup()
    render(widget.render(defaultProps))
    
    const input = screen.getByPlaceholderText('Enter number...')
    await user.type(input, '100')
    
    fireEvent.click(screen.getByRole('button', { name: 'Increase' }))
    
    expect(input).toHaveValue('100')
  })

  it('should render with initial value', () => {
    render(NumberInputWidget.render({ ...defaultProps, initialValue: 42 }))
    
    const input = screen.getByPlaceholderText('Enter number...')
    expect(input).toHaveValue('42')
  })

  it('should serialize and parse numbers correctly', () => {
    expect(NumberInputWidget.serialize?.(42)).toBe('42')
    expect(NumberInputWidget.serialize?.(3.14)).toBe('3.14')
    expect(NumberInputWidget.parse?.('42')).toBe(42)
    expect(NumberInputWidget.parse?.('3.14')).toBe(3.14)
    expect(NumberInputWidget.parse?.('invalid')).toBeNull()
  })

  it('should validate non-number values as false', () => {
    expect(NumberInputWidget.validate?.('not a number')).toBe(false)
    expect(NumberInputWidget.validate?.(null)).toBe(false)
    expect(NumberInputWidget.validate?.(NaN)).toBe(false)
  })
})

describe('DateRangeWidget advanced interactions', () => {
  const defaultProps = {
    onConfirm: vi.fn(),
    onCancel: vi.fn(),
    fieldConfig: mockFieldConfig,
    operatorConfig: { ...mockOperatorConfig, key: 'between', label: 'between' },
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should show error when from date is after to date', () => {
    render(DateRangeWidget.render(defaultProps))
    
    const inputs = document.querySelectorAll('input[type="date"]') as NodeListOf<HTMLInputElement>
    fireEvent.change(inputs[0], { target: { value: '2024-06-30' } })
    fireEvent.change(inputs[1], { target: { value: '2024-06-01' } })
    
    expect(screen.getByText('Start date must be before end date')).toBeInTheDocument()
  })

  it('should allow confirming valid date range', () => {
    const onConfirm = vi.fn()
    render(DateRangeWidget.render({ ...defaultProps, onConfirm }))
    
    const inputs = document.querySelectorAll('input[type="date"]') as NodeListOf<HTMLInputElement>
    fireEvent.change(inputs[0], { target: { value: '2024-06-01' } })
    fireEvent.change(inputs[1], { target: { value: '2024-06-30' } })
    
    fireEvent.click(screen.getByRole('button', { name: 'Confirm' }))
    
    expect(onConfirm).toHaveBeenCalled()
    const range = onConfirm.mock.calls[0][0]
    expect(range.from).toBeInstanceOf(Date)
    expect(range.to).toBeInstanceOf(Date)
  })

  it('should handle escape key to cancel', () => {
    const onCancel = vi.fn()
    render(DateRangeWidget.render({ ...defaultProps, onCancel }))
    
    const widget = screen.getByText('Select Date Range').closest('.custom-widget')
    fireEvent.keyDown(widget!, { key: 'Escape' })
    
    expect(onCancel).toHaveBeenCalled()
  })

  it('should handle enter key to confirm valid range', () => {
    const onConfirm = vi.fn()
    render(DateRangeWidget.render({ ...defaultProps, onConfirm }))
    
    const inputs = document.querySelectorAll('input[type="date"]') as NodeListOf<HTMLInputElement>
    fireEvent.change(inputs[0], { target: { value: '2024-06-01' } })
    fireEvent.change(inputs[1], { target: { value: '2024-06-30' } })
    
    const widget = screen.getByText('Select Date Range').closest('.custom-widget')
    fireEvent.keyDown(widget!, { key: 'Enter' })
    
    expect(onConfirm).toHaveBeenCalled()
  })

  it('should not confirm on enter when range is invalid', () => {
    const onConfirm = vi.fn()
    render(DateRangeWidget.render({ ...defaultProps, onConfirm }))
    
    const inputs = document.querySelectorAll('input[type="date"]') as NodeListOf<HTMLInputElement>
    fireEvent.change(inputs[0], { target: { value: '2024-06-30' } })
    fireEvent.change(inputs[1], { target: { value: '2024-06-01' } })
    
    const widget = screen.getByText('Select Date Range').closest('.custom-widget')
    fireEvent.keyDown(widget!, { key: 'Enter' })
    
    expect(onConfirm).not.toHaveBeenCalled()
  })

  it('should hide presets when showPresets is false', () => {
    const widget = createDateRangeWidget({ showPresets: false })
    render(widget.render(defaultProps))
    expect(screen.queryByRole('button', { name: 'Last 7 days' })).not.toBeInTheDocument()
  })

  it('should render with initial value', () => {
    const initialValue = {
      from: new Date('2024-06-01'),
      to: new Date('2024-06-30'),
    }
    render(DateRangeWidget.render({ ...defaultProps, initialValue }))
    
    const inputs = document.querySelectorAll('input[type="date"]') as NodeListOf<HTMLInputElement>
    expect(inputs[0].value).toBe('2024-06-01')
    expect(inputs[1].value).toBe('2024-06-30')
  })

  it('should return null for invalid parse input', () => {
    expect(DateRangeWidget.parse?.('invalid-json')).toBeNull()
    expect(DateRangeWidget.parse?.('')).toBeNull()
  })

  it('should respect min and max date constraints', () => {
    const widget = createDateRangeWidget({
      minDate: new Date('2024-01-01'),
      maxDate: new Date('2024-12-31'),
    })
    render(widget.render(defaultProps))
    
    const inputs = document.querySelectorAll('input[type="date"]') as NodeListOf<HTMLInputElement>
    expect(inputs[0]).toHaveAttribute('min', '2024-01-01')
    expect(inputs[1]).toHaveAttribute('max', '2024-12-31')
  })

  it('should use custom presets', () => {
    const customPresets = [
      { label: 'Custom Range', from: new Date('2024-01-01'), to: new Date('2024-01-31') },
    ]
    const widget = createDateRangeWidget({ presets: customPresets })
    render(widget.render(defaultProps))
    
    expect(screen.getByRole('button', { name: 'Custom Range' })).toBeInTheDocument()
  })

  it('should call onCancel when cancel button is clicked', () => {
    const onCancel = vi.fn()
    render(DateRangeWidget.render({ ...defaultProps, onCancel }))
    
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }))
    
    expect(onCancel).toHaveBeenCalled()
  })
})
