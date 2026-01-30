import { describe, expect, it, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { TokenInput, type TokenInputProps } from './TokenInput'
import { createRef } from 'react'

describe('TokenInput', () => {
  const defaultProps: TokenInputProps = {
    value: '',
    onChange: vi.fn(),
    onKeyDown: vi.fn(),
    onFocus: vi.fn(),
    onBlur: vi.fn(),
    inputRef: createRef<HTMLInputElement>(),
  }

  describe('Rendering', () => {
    it('should render an input element', () => {
      render(<TokenInput {...defaultProps} />)
      expect(screen.getByRole('combobox')).toBeInTheDocument()
    })

    it('should display the value', () => {
      render(<TokenInput {...defaultProps} value="test value" />)
      expect(screen.getByRole('combobox')).toHaveValue('test value')
    })

    it('should display placeholder when provided', () => {
      render(<TokenInput {...defaultProps} placeholder="Select field..." />)
      expect(screen.getByPlaceholderText('Select field...')).toBeInTheDocument()
    })
  })

  describe('Events', () => {
    it('should call onChange when input value changes', () => {
      const onChange = vi.fn()
      render(<TokenInput {...defaultProps} onChange={onChange} />)
      fireEvent.change(screen.getByRole('combobox'), { target: { value: 'new value' } })
      expect(onChange).toHaveBeenCalledWith('new value')
    })

    it('should call onKeyDown when key is pressed', () => {
      const onKeyDown = vi.fn()
      render(<TokenInput {...defaultProps} onKeyDown={onKeyDown} />)
      fireEvent.keyDown(screen.getByRole('combobox'), { key: 'Enter' })
      expect(onKeyDown).toHaveBeenCalled()
    })

    it('should call onFocus when input is focused', () => {
      const onFocus = vi.fn()
      render(<TokenInput {...defaultProps} onFocus={onFocus} />)
      fireEvent.focus(screen.getByRole('combobox'))
      expect(onFocus).toHaveBeenCalled()
    })

    it('should call onBlur when input loses focus', () => {
      const onBlur = vi.fn()
      render(<TokenInput {...defaultProps} onBlur={onBlur} />)
      fireEvent.blur(screen.getByRole('combobox'))
      expect(onBlur).toHaveBeenCalled()
    })
  })

  describe('Ref', () => {
    it('should forward ref to input element', () => {
      const ref = createRef<HTMLInputElement>()
      render(<TokenInput {...defaultProps} inputRef={ref} />)
      expect(ref.current).toBeInstanceOf(HTMLInputElement)
    })
  })

  describe('Accessibility', () => {
    it('should have role="combobox"', () => {
      render(<TokenInput {...defaultProps} />)
      expect(screen.getByRole('combobox')).toBeInTheDocument()
    })

    it('should have aria-autocomplete="list"', () => {
      render(<TokenInput {...defaultProps} />)
      expect(screen.getByRole('combobox')).toHaveAttribute('aria-autocomplete', 'list')
    })
  })

  describe('Auto-sizing', () => {
    it('should render a sizer span for measuring', () => {
      const { container } = render(<TokenInput {...defaultProps} />)
      const sizer = container.querySelector('.token-input-sizer')
      expect(sizer).toBeInTheDocument()
      expect(sizer).toHaveAttribute('aria-hidden', 'true')
    })

    it('should have the wrapper element', () => {
      const { container } = render(<TokenInput {...defaultProps} />)
      const wrapper = container.querySelector('.token-input-wrapper')
      expect(wrapper).toBeInTheDocument()
    })

    it('should show value text in sizer when value is set', () => {
      const { container } = render(<TokenInput {...defaultProps} value="test text" />)
      const sizer = container.querySelector('.token-input-sizer')
      expect(sizer).toHaveTextContent('test text')
    })

    it('should show placeholder in sizer when value is empty', () => {
      const { container } = render(<TokenInput {...defaultProps} placeholder="Select..." />)
      const sizer = container.querySelector('.token-input-sizer')
      expect(sizer).toHaveTextContent('Select...')
    })

    it('should accept custom minWidth', () => {
      const { container } = render(<TokenInput {...defaultProps} minWidth={100} />)
      const input = container.querySelector('input')
      expect(input).toHaveStyle({ width: '100px' })
    })
  })
})
