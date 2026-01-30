import { describe, expect, it, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { Token, type TokenProps } from './Token'
import type { TokenData } from '@/types'

describe('Token', () => {
  const createFieldToken = (overrides: Partial<TokenData> = {}): TokenData => ({
    id: 'token-1',
    type: 'field',
    value: { key: 'status', label: 'Status', type: 'enum' },
    position: 0,
    expressionIndex: 0,
    ...overrides,
  })

  const createOperatorToken = (overrides: Partial<TokenData> = {}): TokenData => ({
    id: 'token-2',
    type: 'operator',
    value: { key: 'eq', label: 'equals', symbol: '=' },
    position: 1,
    expressionIndex: 0,
    ...overrides,
  })

  const createValueToken = (overrides: Partial<TokenData> = {}): TokenData => ({
    id: 'token-3',
    type: 'value',
    value: { raw: 'active', display: 'Active', serialized: 'active' },
    position: 2,
    expressionIndex: 0,
    ...overrides,
  })

  const createConnectorToken = (overrides: Partial<TokenData> = {}): TokenData => ({
    id: 'token-4',
    type: 'connector',
    value: { key: 'AND', label: 'AND' },
    position: 3,
    expressionIndex: 0,
    ...overrides,
  })

  const defaultProps: TokenProps = {
    data: createFieldToken(),
    isEditable: false,
    isEditing: false,
    isDeletable: false,
    onEdit: vi.fn(),
    onDelete: vi.fn(),
    onEditComplete: vi.fn(),
    onEditCancel: vi.fn(),
  }

  describe('Rendering', () => {
    it('should render field token with label', () => {
      render(<Token {...defaultProps} data={createFieldToken()} />)
      expect(screen.getByText('Status')).toBeInTheDocument()
    })

    it('should render operator token with symbol when available', () => {
      render(<Token {...defaultProps} data={createOperatorToken()} />)
      expect(screen.getByText('=')).toBeInTheDocument()
    })

    it('should render operator token with label when no symbol', () => {
      const token = createOperatorToken()
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ;(token.value as any).symbol = undefined
      render(<Token {...defaultProps} data={token} />)
      expect(screen.getByText('equals')).toBeInTheDocument()
    })

    it('should render value token with display value', () => {
      render(<Token {...defaultProps} data={createValueToken()} />)
      expect(screen.getByText('Active')).toBeInTheDocument()
    })

    it('should render connector token', () => {
      render(<Token {...defaultProps} data={createConnectorToken()} />)
      expect(screen.getByText('AND')).toBeInTheDocument()
    })

    it('should apply correct CSS class for token type', () => {
      const { container } = render(<Token {...defaultProps} data={createFieldToken()} />)
      expect(container.querySelector('.token--field')).toBeInTheDocument()
    })

    it('should apply custom className', () => {
      const { container } = render(
        <Token {...defaultProps} data={createFieldToken()} className="custom-class" />
      )
      expect(container.querySelector('.custom-class')).toBeInTheDocument()
    })
  })

  describe('Interaction', () => {
    it('should call onEdit when clicked and editable', () => {
      const onEdit = vi.fn()
      render(<Token {...defaultProps} data={createValueToken()} isEditable onEdit={onEdit} />)
      fireEvent.click(screen.getByText('Active'))
      expect(onEdit).toHaveBeenCalledTimes(1)
    })

    it('should not call onEdit when clicked and not editable', () => {
      const onEdit = vi.fn()
      render(
        <Token {...defaultProps} data={createFieldToken()} isEditable={false} onEdit={onEdit} />
      )
      fireEvent.click(screen.getByText('Status'))
      expect(onEdit).not.toHaveBeenCalled()
    })
  })

  describe('Accessibility', () => {
    it('should have role="option"', () => {
      render(<Token {...defaultProps} data={createFieldToken()} />)
      expect(screen.getByRole('option')).toBeInTheDocument()
    })

    it('should have aria-label with token type and value', () => {
      render(<Token {...defaultProps} data={createFieldToken()} />)
      const token = screen.getByRole('option')
      expect(token).toHaveAttribute('aria-label', 'field: Status')
    })
  })

  describe('Token Type Styling', () => {
    it('should have field type class', () => {
      const { container } = render(<Token {...defaultProps} data={createFieldToken()} />)
      expect(container.querySelector('.token--field')).toBeInTheDocument()
    })

    it('should have operator type class', () => {
      const { container } = render(<Token {...defaultProps} data={createOperatorToken()} />)
      expect(container.querySelector('.token--operator')).toBeInTheDocument()
    })

    it('should have value type class', () => {
      const { container } = render(<Token {...defaultProps} data={createValueToken()} />)
      expect(container.querySelector('.token--value')).toBeInTheDocument()
    })

    it('should have connector type class', () => {
      const { container } = render(<Token {...defaultProps} data={createConnectorToken()} />)
      expect(container.querySelector('.token--connector')).toBeInTheDocument()
    })
  })

  describe('Editing Mode', () => {
    it('should show inline input when isEditing is true', () => {
      render(<Token {...defaultProps} data={createValueToken()} isEditable isEditing />)
      const input = screen.getByRole('textbox')
      expect(input).toBeInTheDocument()
      expect(input).toHaveValue('Active')
    })

    it('should not show display text when editing', () => {
      render(<Token {...defaultProps} data={createValueToken()} isEditable isEditing />)
      // When editing, the display text is replaced by input
      expect(screen.queryByText('Active')).not.toBeInTheDocument()
    })

    it('should call onEditComplete with new value on Enter', () => {
      const onEditComplete = vi.fn()
      render(
        <Token
          {...defaultProps}
          data={createValueToken()}
          isEditable
          isEditing
          onEditComplete={onEditComplete}
        />
      )
      const input = screen.getByRole('textbox')
      fireEvent.change(input, { target: { value: 'new value' } })
      fireEvent.keyDown(input, { key: 'Enter' })
      expect(onEditComplete).toHaveBeenCalledWith({
        raw: 'new value',
        display: 'new value',
        serialized: 'new value',
      })
    })

    it('should call onEditCancel on Escape', () => {
      const onEditCancel = vi.fn()
      render(
        <Token
          {...defaultProps}
          data={createValueToken()}
          isEditable
          isEditing
          onEditCancel={onEditCancel}
        />
      )
      const input = screen.getByRole('textbox')
      fireEvent.keyDown(input, { key: 'Escape' })
      expect(onEditCancel).toHaveBeenCalledTimes(1)
    })

    it('should auto-focus input when entering edit mode', () => {
      render(<Token {...defaultProps} data={createValueToken()} isEditable isEditing />)
      const input = screen.getByRole('textbox')
      expect(document.activeElement).toBe(input)
    })

    it('should select all text when entering edit mode', () => {
      render(<Token {...defaultProps} data={createValueToken()} isEditable isEditing />)
      const input = screen.getByRole('textbox') as HTMLInputElement
      expect(input.selectionStart).toBe(0)
      expect(input.selectionEnd).toBe(input.value.length)
    })
  })
})
