import { describe, it, expect, vi } from 'vitest'
import { render, screen, act, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createRef } from 'react'
import { FilterBox, type FilterBoxHandle } from './FilterBox'
import type { FilterSchema } from '@/types'

const createTestSchema = (): FilterSchema => ({
  fields: [
    {
      key: 'status',
      label: 'Status',
      type: 'enum',
      operators: [
        { key: 'equals', label: 'equals', symbol: '=' },
        { key: 'not_equals', label: 'not equals', symbol: '!=' },
      ],
    },
    {
      key: 'name',
      label: 'Name',
      type: 'string',
      operators: [
        { key: 'contains', label: 'contains' },
        { key: 'starts_with', label: 'starts with' },
      ],
    },
  ],
})

describe('FilterBox', () => {
  describe('Rendering', () => {
    it('should render with placeholder', () => {
      render(<FilterBox schema={createTestSchema()} value={[]} onChange={vi.fn()} />)

      expect(screen.getByPlaceholderText('Add filter...')).toBeInTheDocument()
    })

    it('should render existing tokens', () => {
      const value = [
        {
          condition: {
            field: { key: 'status', label: 'Status', type: 'enum' as const },
            operator: { key: 'equals', label: 'equals', symbol: '=' },
            value: { raw: 'active', display: 'active', serialized: 'active' },
          },
        },
      ]

      render(<FilterBox schema={createTestSchema()} value={value} onChange={vi.fn()} />)

      expect(screen.getByText('Status')).toBeInTheDocument()
      // Operator displays symbol if available
      expect(screen.getByText('=')).toBeInTheDocument()
      expect(screen.getByText('active')).toBeInTheDocument()
    })

    it('should apply custom className', () => {
      const { container } = render(
        <FilterBox
          schema={createTestSchema()}
          value={[]}
          onChange={vi.fn()}
          className="custom-filter"
        />
      )

      expect(container.querySelector('.custom-filter')).toBeInTheDocument()
    })
  })

  describe('Focus and Dropdown', () => {
    it('should show dropdown with field suggestions on focus', async () => {
      const user = userEvent.setup()
      render(<FilterBox schema={createTestSchema()} value={[]} onChange={vi.fn()} />)

      const input = screen.getByPlaceholderText('Add filter...')
      await user.click(input)

      expect(screen.getByRole('listbox')).toBeInTheDocument()
      expect(screen.getByText('Status')).toBeInTheDocument()
      expect(screen.getByText('Name')).toBeInTheDocument()
    })

    it('should close dropdown on blur', async () => {
      const user = userEvent.setup()
      render(<FilterBox schema={createTestSchema()} value={[]} onChange={vi.fn()} />)

      const input = screen.getByPlaceholderText('Add filter...')
      await user.click(input)

      expect(screen.getByRole('listbox')).toBeInTheDocument()

      await user.tab() // blur

      expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
    })
  })

  describe('Field Selection', () => {
    it('should show operators after selecting a field', async () => {
      const user = userEvent.setup()
      render(<FilterBox schema={createTestSchema()} value={[]} onChange={vi.fn()} />)

      const input = screen.getByPlaceholderText('Add filter...')
      await user.click(input)
      await user.click(screen.getByText('Status'))

      // After field selection, should transition to operator selection
      // The placeholder changes to indicate operator selection
      expect(input).toHaveAttribute('placeholder', 'Select operator...')
      // Operators should be shown in dropdown
      expect(screen.getByText('equals')).toBeInTheDocument()
    })
  })

  describe('Keyboard Navigation', () => {
    it('should navigate suggestions with arrow keys', async () => {
      const user = userEvent.setup()
      render(<FilterBox schema={createTestSchema()} value={[]} onChange={vi.fn()} />)

      const input = screen.getByPlaceholderText('Add filter...')
      await user.click(input)

      // First item should be highlighted
      const firstItem = screen.getAllByRole('option')[0]
      expect(firstItem).toHaveClass('autocomplete-item--highlighted')

      await user.keyboard('{ArrowDown}')

      const secondItem = screen.getAllByRole('option')[1]
      expect(secondItem).toHaveClass('autocomplete-item--highlighted')
    })

    it('should select with Enter key', async () => {
      const user = userEvent.setup()
      render(<FilterBox schema={createTestSchema()} value={[]} onChange={vi.fn()} />)

      const input = screen.getByPlaceholderText('Add filter...')
      await user.click(input)
      await user.keyboard('{Enter}')

      // After selecting a field with Enter, should transition to operator selection
      expect(input).toHaveAttribute('placeholder', 'Select operator...')
    })

    it('should close dropdown on Escape', async () => {
      const user = userEvent.setup()
      render(<FilterBox schema={createTestSchema()} value={[]} onChange={vi.fn()} />)

      const input = screen.getByPlaceholderText('Add filter...')
      await user.click(input)

      expect(screen.getByRole('listbox')).toBeInTheDocument()

      await user.keyboard('{Escape}')

      expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
    })
  })

  describe('Complete Flow', () => {
    it('should complete a full filter expression', async () => {
      const user = userEvent.setup()
      const onChange = vi.fn()
      render(<FilterBox schema={createTestSchema()} value={[]} onChange={onChange} />)

      // Focus and select field
      const input = screen.getByPlaceholderText('Add filter...')
      await user.click(input)
      await user.click(screen.getByText('Name'))

      // After field selection, operators are shown
      // The dropdown stays open with operator suggestions
      expect(screen.getByText('contains')).toBeInTheDocument()
      await user.click(screen.getByText('contains'))

      // After operator selection, we're in value entry mode
      // Dropdown closes for free-text entry
      await user.type(input, 'test')
      await user.keyboard('{Enter}')

      // onChange should be called with the expression
      expect(onChange).toHaveBeenCalledWith([
        expect.objectContaining({
          condition: expect.objectContaining({
            field: expect.objectContaining({ key: 'name' }),
            operator: expect.objectContaining({ key: 'contains' }),
            value: expect.objectContaining({ raw: 'test' }),
          }),
        }),
      ])
    })
  })

  describe('Accessibility', () => {
    it('should have proper ARIA attributes', async () => {
      const user = userEvent.setup()
      render(<FilterBox schema={createTestSchema()} value={[]} onChange={vi.fn()} />)

      const input = screen.getByPlaceholderText('Add filter...')
      await user.click(input)

      expect(input).toHaveAttribute('aria-autocomplete', 'list')
      expect(input).toHaveAttribute('aria-controls')
      expect(screen.getByRole('listbox')).toBeInTheDocument()
    })
  })

  describe('Portal Rendering', () => {
    it('should render dropdown in portal by default', async () => {
      const user = userEvent.setup()
      const { container } = render(
        <FilterBox schema={createTestSchema()} value={[]} onChange={vi.fn()} />
      )

      const input = screen.getByPlaceholderText('Add filter...')
      await user.click(input)

      const dropdown = screen.getByRole('listbox')
      // Dropdown should be in body, not in the FilterBox container
      expect(container.contains(dropdown)).toBe(false)
      expect(document.body.contains(dropdown)).toBe(true)
    })

    it('should render dropdown inline when usePortal is false', async () => {
      const user = userEvent.setup()
      const { container } = render(
        <FilterBox
          schema={createTestSchema()}
          value={[]}
          onChange={vi.fn()}
          usePortal={false}
        />
      )

      const input = screen.getByPlaceholderText('Add filter...')
      await user.click(input)

      const dropdown = screen.getByRole('listbox')
      // Dropdown should be in the FilterBox container
      expect(container.contains(dropdown)).toBe(true)
    })

    it('should have positioned dropdown in portal', async () => {
      const user = userEvent.setup()
      render(<FilterBox schema={createTestSchema()} value={[]} onChange={vi.fn()} />)

      const input = screen.getByPlaceholderText('Add filter...')
      await user.click(input)

      // Portal wrapper should have positioning styles
      const portal = document.querySelector('.filter-box-dropdown-portal')
      expect(portal).toBeInTheDocument()
      expect(portal).toHaveStyle({ position: 'fixed' })
    })
  })

  describe('Screen Reader Announcements', () => {
    it('should announce suggestion count when dropdown opens', async () => {
      const user = userEvent.setup()
      render(<FilterBox schema={createTestSchema()} value={[]} onChange={vi.fn()} />)

      const input = screen.getByPlaceholderText('Add filter...')
      await user.click(input)

      // Should have a live region with announcement
      const liveRegion = screen.getByRole('status')
      expect(liveRegion).toHaveTextContent(/2 fields available/)
    })

    it('should announce when a field is selected', async () => {
      const user = userEvent.setup()
      render(<FilterBox schema={createTestSchema()} value={[]} onChange={vi.fn()} />)

      const input = screen.getByPlaceholderText('Add filter...')
      await user.click(input)
      
      // First clear the initial announcement by waiting
      const liveRegion = screen.getByRole('status')
      
      await user.click(screen.getByText('Status'))

      // After field selection, it announces operators are available
      expect(liveRegion).toHaveTextContent(/2 operators available/)
    })
  })

  describe('Focus Management', () => {
    it('should auto-focus when autoFocus prop is true', () => {
      render(<FilterBox schema={createTestSchema()} value={[]} onChange={vi.fn()} autoFocus />)

      // Auto-focus triggers the focus handler which changes placeholder to 'Select field...'
      const input = screen.getByPlaceholderText('Select field...')
      expect(document.activeElement).toBe(input)
    })

    it('should not auto-focus when disabled', () => {
      render(<FilterBox schema={createTestSchema()} value={[]} onChange={vi.fn()} autoFocus disabled />)

      // Disabled input still shows 'Add filter...' since it never got focus
      const input = screen.getByPlaceholderText('Add filter...')
      expect(document.activeElement).not.toBe(input)
    })

    it('should expose focus method via ref', () => {
      const ref = createRef<FilterBoxHandle>()
      render(<FilterBox ref={ref} schema={createTestSchema()} value={[]} onChange={vi.fn()} />)

      act(() => {
        ref.current?.focus()
      })

      // After focus, placeholder changes to 'Select field...'
      const input = screen.getByPlaceholderText('Select field...')
      expect(document.activeElement).toBe(input)
    })

    it('should expose blur method via ref', async () => {
      const user = userEvent.setup()
      const ref = createRef<FilterBoxHandle>()
      render(<FilterBox ref={ref} schema={createTestSchema()} value={[]} onChange={vi.fn()} />)

      const input = screen.getByPlaceholderText('Add filter...')
      await user.click(input)
      expect(document.activeElement).toBe(input)

      act(() => {
        ref.current?.blur()
      })

      expect(document.activeElement).not.toBe(input)
    })

    it('should expose clear method via ref', async () => {
      const onChange = vi.fn()
      const ref = createRef<FilterBoxHandle>()
      const existingValue = [
        {
          condition: {
            field: { key: 'status', label: 'Status', type: 'enum' as const },
            operator: { key: 'equals', label: 'equals', symbol: '=' },
            value: { raw: 'active', display: 'active', serialized: 'active' },
          },
        },
      ]

      render(<FilterBox ref={ref} schema={createTestSchema()} value={existingValue} onChange={onChange} />)

      act(() => {
        ref.current?.clear()
      })

      expect(onChange).toHaveBeenCalledWith([])
    })
  })

  describe('Token Editing', () => {
    it('should allow editing value tokens on click', async () => {
      const user = userEvent.setup()
      const value = [
        {
          condition: {
            field: { key: 'name', label: 'Name', type: 'string' as const },
            operator: { key: 'contains', label: 'contains' },
            value: { raw: 'test', display: 'test', serialized: 'test' },
          },
        },
      ]

      render(<FilterBox schema={createTestSchema()} value={value} onChange={vi.fn()} />)

      const valueToken = screen.getByText('test')
      await user.click(valueToken)

      // Value token should be in edit mode with an input
      const input = screen.getByRole('textbox', { name: /edit value/i })
      expect(input).toBeInTheDocument()
      expect(input).toHaveValue('test')
    })

    it('should update value when editing is confirmed with Enter', async () => {
      const onChange = vi.fn()
      const value = [
        {
          condition: {
            field: { key: 'name', label: 'Name', type: 'string' as const },
            operator: { key: 'contains', label: 'contains' },
            value: { raw: 'test', display: 'test', serialized: 'test' },
          },
        },
      ]

      render(<FilterBox schema={createTestSchema()} value={value} onChange={onChange} />)

      const valueToken = screen.getByText('test')
      fireEvent.click(valueToken)

      const input = screen.getByRole('textbox', { name: /edit value/i })
      fireEvent.change(input, { target: { value: 'new value' } })
      fireEvent.keyDown(input, { key: 'Enter' })

      expect(onChange).toHaveBeenCalledWith([
        expect.objectContaining({
          condition: expect.objectContaining({
            value: expect.objectContaining({ raw: 'new value' }),
          }),
        }),
      ])
    })

    it('should cancel editing on Escape', async () => {
      const onChange = vi.fn()
      const value = [
        {
          condition: {
            field: { key: 'name', label: 'Name', type: 'string' as const },
            operator: { key: 'contains', label: 'contains' },
            value: { raw: 'test', display: 'test', serialized: 'test' },
          },
        },
      ]

      render(<FilterBox schema={createTestSchema()} value={value} onChange={onChange} />)

      const valueToken = screen.getByText('test')
      fireEvent.click(valueToken)

      // Get the edit input that appears in the token
      const editInput = screen.getByRole('textbox', { name: /edit value/i })
      expect(editInput).toHaveValue('test')
      
      // Change the value
      fireEvent.change(editInput, { target: { value: 'changed' } })
      expect(editInput).toHaveValue('changed')
      
      // Press Escape
      fireEvent.keyDown(editInput, { key: 'Escape' })

      // Should not call onChange since edit was cancelled
      expect(onChange).not.toHaveBeenCalled()
      // Should exit edit mode and show original value
      expect(screen.getByText('test')).toBeInTheDocument()
      // Edit input should no longer be present
      expect(screen.queryByRole('textbox', { name: /edit value/i })).not.toBeInTheDocument()
    })

    it('should not allow editing field tokens', async () => {
      const user = userEvent.setup()
      const value = [
        {
          condition: {
            field: { key: 'name', label: 'Name', type: 'string' as const },
            operator: { key: 'contains', label: 'contains' },
            value: { raw: 'test', display: 'test', serialized: 'test' },
          },
        },
      ]

      render(<FilterBox schema={createTestSchema()} value={value} onChange={vi.fn()} />)

      const fieldToken = screen.getByText('Name')
      await user.click(fieldToken)

      // No edit input should appear for field tokens
      expect(screen.queryByRole('textbox', { name: /edit field/i })).not.toBeInTheDocument()
    })

    it('should not allow editing operator tokens', async () => {
      const user = userEvent.setup()
      const value = [
        {
          condition: {
            field: { key: 'name', label: 'Name', type: 'string' as const },
            operator: { key: 'contains', label: 'contains' },
            value: { raw: 'test', display: 'test', serialized: 'test' },
          },
        },
      ]

      render(<FilterBox schema={createTestSchema()} value={value} onChange={vi.fn()} />)

      const operatorToken = screen.getByText('contains')
      await user.click(operatorToken)

      // No edit input should appear for operator tokens
      expect(screen.queryByRole('textbox', { name: /edit operator/i })).not.toBeInTheDocument()
    })
  })
})
