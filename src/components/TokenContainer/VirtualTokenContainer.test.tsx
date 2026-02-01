/**
 * VirtualTokenContainer Tests
 *
 * Tests for the windowed/virtualized token container.
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { VirtualTokenContainer } from './VirtualTokenContainer'
import type { TokenData } from '@/types'
import { useRef } from 'react'

// Test wrapper that provides the input ref
function TestWrapper(props: Omit<React.ComponentProps<typeof VirtualTokenContainer>, 'inputRef'>) {
  const inputRef = useRef<HTMLInputElement>(null)
  return <VirtualTokenContainer {...props} inputRef={inputRef} />
}

// Generate mock tokens for testing
function generateTokens(count: number): TokenData[] {
  const tokens: TokenData[] = []
  for (let i = 0; i < count; i++) {
    const exprIndex = Math.floor(i / 3)
    const type = i % 3 === 0 ? 'field' : i % 3 === 1 ? 'operator' : 'value'
    tokens.push({
      id: `token-${i}`,
      type,
      value:
        type === 'field'
          ? { key: `field-${exprIndex}`, label: `Field ${exprIndex}`, type: 'string' }
          : type === 'operator'
            ? { key: 'equals', label: 'equals', symbol: '=' }
            : {
                raw: `value-${exprIndex}`,
                display: `Value ${exprIndex}`,
                serialized: `value-${exprIndex}`,
              },
      position: i,
      expressionIndex: exprIndex,
      isPending: false,
    })
  }
  return tokens
}

describe('VirtualTokenContainer', () => {
  describe('basic rendering', () => {
    it('should render with no tokens', () => {
      render(
        <TestWrapper tokens={[]} inputValue="" onInputChange={vi.fn()} onInputKeyDown={vi.fn()} />
      )

      expect(screen.getByRole('combobox')).toBeInTheDocument()
    })

    it('should render small lists without virtualization', () => {
      const tokens = generateTokens(15) // 5 expressions = 15 tokens
      render(
        <TestWrapper
          tokens={tokens}
          inputValue=""
          onInputChange={vi.fn()}
          onInputKeyDown={vi.fn()}
        />
      )

      // All tokens should be rendered
      expect(screen.getByText('Field 0')).toBeInTheDocument()
      expect(screen.getByText('Field 4')).toBeInTheDocument()
    })

    it('should apply virtual class for large lists', () => {
      const tokens = generateTokens(60) // 20 expressions = 60 tokens
      const { container } = render(
        <TestWrapper
          tokens={tokens}
          inputValue=""
          onInputChange={vi.fn()}
          onInputKeyDown={vi.fn()}
          virtualizationThreshold={50}
        />
      )

      const tokenContainer = container.querySelector('.token-container')
      expect(tokenContainer).toHaveClass('token-container--virtual')
    })

    it('should not apply virtual class for small lists', () => {
      const tokens = generateTokens(30)
      const { container } = render(
        <TestWrapper
          tokens={tokens}
          inputValue=""
          onInputChange={vi.fn()}
          onInputKeyDown={vi.fn()}
          virtualizationThreshold={50}
        />
      )

      const tokenContainer = container.querySelector('.token-container')
      expect(tokenContainer).not.toHaveClass('token-container--virtual')
    })
  })

  describe('input handling', () => {
    it('should render input with correct value', () => {
      render(
        <TestWrapper
          tokens={[]}
          inputValue="test"
          onInputChange={vi.fn()}
          onInputKeyDown={vi.fn()}
        />
      )

      const input = screen.getByRole('combobox')
      expect(input).toHaveValue('test')
    })

    it('should call onInputChange when typing', async () => {
      const user = userEvent.setup()
      const onInputChange = vi.fn()

      render(
        <TestWrapper
          tokens={[]}
          inputValue=""
          onInputChange={onInputChange}
          onInputKeyDown={vi.fn()}
        />
      )

      const input = screen.getByRole('combobox')
      await user.type(input, 'a')

      expect(onInputChange).toHaveBeenCalled()
    })

    it('should show placeholder', () => {
      render(
        <TestWrapper
          tokens={[]}
          inputValue=""
          onInputChange={vi.fn()}
          onInputKeyDown={vi.fn()}
          placeholder="Select field..."
        />
      )

      expect(screen.getByPlaceholderText('Select field...')).toBeInTheDocument()
    })
  })

  describe('token interaction', () => {
    it('should call onTokenClick when value token is clicked', async () => {
      const user = userEvent.setup()
      const onTokenClick = vi.fn()
      const tokens = generateTokens(6)

      render(
        <TestWrapper
          tokens={tokens}
          inputValue=""
          onInputChange={vi.fn()}
          onInputKeyDown={vi.fn()}
          onTokenClick={onTokenClick}
        />
      )

      // Click on value token (index 2) - value tokens are editable
      await user.click(screen.getByText('Value 0'))
      expect(onTokenClick).toHaveBeenCalledWith(2)
    })

    it('should call onOperatorClick for operator tokens', async () => {
      const user = userEvent.setup()
      const onOperatorClick = vi.fn()
      const tokens = generateTokens(6)

      const { container } = render(
        <TestWrapper
          tokens={tokens}
          inputValue=""
          onInputChange={vi.fn()}
          onInputKeyDown={vi.fn()}
          onOperatorClick={onOperatorClick}
        />
      )

      // Find operator tokens by their class
      const tokenElements = container.querySelectorAll('.token--operator')
      await user.click(tokenElements[0])
      expect(onOperatorClick).toHaveBeenCalledWith(0) // expressionIndex
    })

    it('should highlight selected token', () => {
      const tokens = generateTokens(9)
      const { container } = render(
        <TestWrapper
          tokens={tokens}
          inputValue=""
          onInputChange={vi.fn()}
          onInputKeyDown={vi.fn()}
          selectedTokenIndex={3}
        />
      )

      const tokenElements = container.querySelectorAll('.token')
      expect(tokenElements[3]).toHaveClass('token--selected')
    })

    it('should highlight all tokens when allTokensSelected', () => {
      const tokens = generateTokens(6)
      const { container } = render(
        <TestWrapper
          tokens={tokens}
          inputValue=""
          onInputChange={vi.fn()}
          onInputKeyDown={vi.fn()}
          allTokensSelected={true}
        />
      )

      const tokenElements = container.querySelectorAll('.token')
      tokenElements.forEach((el) => {
        expect(el).toHaveClass('token--selected')
      })
    })
  })

  describe('editing', () => {
    it('should show editing state for editingTokenIndex', () => {
      const tokens = generateTokens(6)
      const { container } = render(
        <TestWrapper
          tokens={tokens}
          inputValue=""
          onInputChange={vi.fn()}
          onInputKeyDown={vi.fn()}
          editingTokenIndex={2} // Value token
        />
      )

      const tokenElements = container.querySelectorAll('.token')
      expect(tokenElements[2]).toHaveClass('token--editing')
    })
  })

  describe('disabled state', () => {
    it('should apply disabled class', () => {
      const { container } = render(
        <TestWrapper
          tokens={[]}
          inputValue=""
          onInputChange={vi.fn()}
          onInputKeyDown={vi.fn()}
          disabled={true}
        />
      )

      const tokenContainer = container.querySelector('.token-container')
      expect(tokenContainer).toHaveClass('token-container--disabled')
    })

    it('should disable the input', () => {
      render(
        <TestWrapper
          tokens={[]}
          inputValue=""
          onInputChange={vi.fn()}
          onInputKeyDown={vi.fn()}
          disabled={true}
        />
      )

      const input = screen.getByRole('combobox')
      expect(input).toBeDisabled()
    })
  })

  describe('virtualization threshold', () => {
    it('should respect custom virtualization threshold', () => {
      const tokens = generateTokens(30) // 30 tokens
      const { container } = render(
        <TestWrapper
          tokens={tokens}
          inputValue=""
          onInputChange={vi.fn()}
          onInputKeyDown={vi.fn()}
          virtualizationThreshold={20}
        />
      )

      const tokenContainer = container.querySelector('.token-container')
      expect(tokenContainer).toHaveClass('token-container--virtual')
    })

    it('should not virtualize at threshold', () => {
      const tokens = generateTokens(20)
      const { container } = render(
        <TestWrapper
          tokens={tokens}
          inputValue=""
          onInputChange={vi.fn()}
          onInputKeyDown={vi.fn()}
          virtualizationThreshold={20}
        />
      )

      const tokenContainer = container.querySelector('.token-container')
      expect(tokenContainer).not.toHaveClass('token-container--virtual')
    })
  })

  describe('focus handling', () => {
    it('should call onInputFocus when input is focused', async () => {
      const user = userEvent.setup()
      const onInputFocus = vi.fn()

      render(
        <TestWrapper
          tokens={[]}
          inputValue=""
          onInputChange={vi.fn()}
          onInputKeyDown={vi.fn()}
          onInputFocus={onInputFocus}
        />
      )

      const input = screen.getByRole('combobox')
      await user.click(input)

      expect(onInputFocus).toHaveBeenCalled()
    })

    it('should focus input when container is clicked', async () => {
      const user = userEvent.setup()
      const onInputFocus = vi.fn()

      const { container } = render(
        <TestWrapper
          tokens={generateTokens(3)}
          inputValue=""
          onInputChange={vi.fn()}
          onInputKeyDown={vi.fn()}
          onInputFocus={onInputFocus}
        />
      )

      const tokenContainer = container.querySelector('.token-container')!
      await user.click(tokenContainer)

      expect(onInputFocus).toHaveBeenCalled()
    })
  })
})
