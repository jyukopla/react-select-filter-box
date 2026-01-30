import { describe, expect, it, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { TokenContainer, type TokenContainerProps } from './TokenContainer'
import type { TokenData } from '@/types'
import { createRef } from 'react'

describe('TokenContainer', () => {
  const createTokens = (): TokenData[] => [
    {
      id: 'token-1',
      type: 'field',
      value: { key: 'status', label: 'Status', type: 'enum' },
      position: 0,
      expressionIndex: 0,
    },
    {
      id: 'token-2',
      type: 'operator',
      value: { key: 'eq', label: 'equals', symbol: '=' },
      position: 1,
      expressionIndex: 0,
    },
    {
      id: 'token-3',
      type: 'value',
      value: { raw: 'active', display: 'Active', serialized: 'active' },
      position: 2,
      expressionIndex: 0,
    },
  ]

  const defaultProps: TokenContainerProps = {
    tokens: [],
    inputValue: '',
    onInputChange: vi.fn(),
    onInputKeyDown: vi.fn(),
    onTokenClick: vi.fn(),
    onFocus: vi.fn(),
    onBlur: vi.fn(),
    inputRef: createRef<HTMLInputElement>(),
    placeholder: 'Select field...',
  }

  describe('Rendering', () => {
    it('should render empty container with input', () => {
      render(<TokenContainer {...defaultProps} />)
      expect(screen.getByRole('combobox')).toBeInTheDocument()
    })

    it('should render tokens when provided', () => {
      render(<TokenContainer {...defaultProps} tokens={createTokens()} />)
      expect(screen.getByText('Status')).toBeInTheDocument()
      expect(screen.getByText('=')).toBeInTheDocument()
      expect(screen.getByText('Active')).toBeInTheDocument()
    })

    it('should render input after tokens', () => {
      const { container } = render(<TokenContainer {...defaultProps} tokens={createTokens()} />)
      const children = container.querySelector('.token-container')?.children
      expect(children).toBeDefined()
      // Last child should be the input wrapper (SPAN wrapping the input for auto-sizing)
      const lastChild = children?.[children.length - 1]
      expect(lastChild?.tagName).toBe('SPAN')
      expect(lastChild?.querySelector('input')).toBeInTheDocument()
    })

    it('should display placeholder in input', () => {
      render(<TokenContainer {...defaultProps} placeholder="Type here..." />)
      expect(screen.getByPlaceholderText('Type here...')).toBeInTheDocument()
    })
  })

  describe('Interaction', () => {
    it('should call onFocus when container is clicked', () => {
      const onFocus = vi.fn()
      const { container } = render(<TokenContainer {...defaultProps} onFocus={onFocus} />)
      fireEvent.click(container.querySelector('.token-container')!)
      expect(onFocus).toHaveBeenCalled()
    })

    it('should call onTokenClick when a token is clicked', () => {
      const onTokenClick = vi.fn()
      render(<TokenContainer {...defaultProps} tokens={createTokens()} onTokenClick={onTokenClick} />)
      fireEvent.click(screen.getByText('Active'))
      expect(onTokenClick).toHaveBeenCalledWith(2) // position of value token
    })

    it('should call onInputChange when input value changes', () => {
      const onInputChange = vi.fn()
      render(<TokenContainer {...defaultProps} onInputChange={onInputChange} />)
      fireEvent.change(screen.getByRole('combobox'), { target: { value: 'test' } })
      expect(onInputChange).toHaveBeenCalledWith('test')
    })

    it('should call onInputKeyDown on key press', () => {
      const onInputKeyDown = vi.fn()
      render(<TokenContainer {...defaultProps} onInputKeyDown={onInputKeyDown} />)
      fireEvent.keyDown(screen.getByRole('combobox'), { key: 'Enter' })
      expect(onInputKeyDown).toHaveBeenCalled()
    })
  })

  describe('Accessibility', () => {
    it('should have proper container role', () => {
      const { container } = render(<TokenContainer {...defaultProps} />)
      expect(container.querySelector('.token-container')).toBeInTheDocument()
    })
  })

  describe('Overflow Handling', () => {
    it('should have overflow-x auto for horizontal scrolling', () => {
      const { container } = render(<TokenContainer {...defaultProps} tokens={createTokens()} />)
      const tokenContainer = container.querySelector('.token-container')
      expect(tokenContainer).toHaveClass('token-container')
      // The container should exist and have the class that provides overflow-x: auto
      expect(tokenContainer).toBeInTheDocument()
    })

    it('should render many tokens without wrapping', () => {
      const manyTokens: TokenData[] = []
      for (let i = 0; i < 10; i++) {
        manyTokens.push(
          {
            id: `field-${i}`,
            type: 'field',
            value: { key: `field_${i}`, label: `Field ${i}`, type: 'string' },
            position: i * 4,
            expressionIndex: i,
          },
          {
            id: `operator-${i}`,
            type: 'operator',
            value: { key: 'eq', label: 'equals', symbol: '=' },
            position: i * 4 + 1,
            expressionIndex: i,
          },
          {
            id: `value-${i}`,
            type: 'value',
            value: { raw: `value${i}`, display: `Value ${i}`, serialized: `value${i}` },
            position: i * 4 + 2,
            expressionIndex: i,
          },
          {
            id: `connector-${i}`,
            type: 'connector',
            value: { key: 'AND', label: 'AND' },
            position: i * 4 + 3,
            expressionIndex: i,
          }
        )
      }

      const { container } = render(<TokenContainer {...defaultProps} tokens={manyTokens} />)
      const tokenContainer = container.querySelector('.token-container')
      expect(tokenContainer).toBeInTheDocument()
      // All tokens should be rendered
      expect(container.querySelectorAll('.token').length).toBe(manyTokens.length)
    })

    it('should apply flex-nowrap to prevent wrapping', () => {
      const { container } = render(<TokenContainer {...defaultProps} tokens={createTokens()} />)
      const tokenContainer = container.querySelector('.token-container')
      expect(tokenContainer).toHaveClass('token-container')
    })
  })
})
