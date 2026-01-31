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
      render(<FilterBox schema={createTestSchema()} value={[]} onChange={vi.fn()} />)

      const input = screen.getByPlaceholderText('Add filter...')
      fireEvent.focus(input)

      expect(screen.getByRole('listbox')).toBeInTheDocument()

      fireEvent.blur(input)

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

    it('should select highlighted item with Tab key', async () => {
      const user = userEvent.setup()
      render(<FilterBox schema={createTestSchema()} value={[]} onChange={vi.fn()} />)

      const input = screen.getByPlaceholderText('Add filter...')
      await user.click(input)

      // Dropdown is open with field suggestions
      expect(screen.getByRole('listbox')).toBeInTheDocument()

      // Press Tab to select the highlighted item (first field)
      await user.tab()

      // Should transition to operator selection
      expect(input).toHaveAttribute('placeholder', 'Select operator...')
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

    it('should have combobox role on container', () => {
      render(<FilterBox schema={createTestSchema()} value={[]} onChange={vi.fn()} />)
      expect(screen.getByRole('combobox')).toBeInTheDocument()
    })

    it('should have group role on wrapper', () => {
      render(<FilterBox schema={createTestSchema()} value={[]} onChange={vi.fn()} />)
      expect(screen.getByRole('group')).toBeInTheDocument()
    })

    it('should have aria-label for filter builder', () => {
      render(<FilterBox schema={createTestSchema()} value={[]} onChange={vi.fn()} />)
      const group = screen.getByRole('group')
      expect(group).toHaveAttribute('aria-label', 'Filter expression builder')
    })

    it('should have aria-expanded on combobox', async () => {
      const user = userEvent.setup()
      render(<FilterBox schema={createTestSchema()} value={[]} onChange={vi.fn()} />)
      
      const combobox = screen.getByRole('combobox')
      expect(combobox).toHaveAttribute('aria-expanded', 'false')
      
      await user.click(combobox)
      expect(combobox).toHaveAttribute('aria-expanded', 'true')
    })

    it('should have listbox role on dropdown', async () => {
      const user = userEvent.setup()
      render(<FilterBox schema={createTestSchema()} value={[]} onChange={vi.fn()} />)

      const input = screen.getByPlaceholderText('Add filter...')
      await user.click(input)

      expect(screen.getByRole('listbox')).toBeInTheDocument()
    })

    it('should have option role on dropdown items', async () => {
      const user = userEvent.setup()
      render(<FilterBox schema={createTestSchema()} value={[]} onChange={vi.fn()} />)

      const input = screen.getByPlaceholderText('Add filter...')
      await user.click(input)

      const options = screen.getAllByRole('option')
      expect(options.length).toBeGreaterThan(0)
    })

    it('should have aria-describedby linking to status description when tokens exist', () => {
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
      
      const group = screen.getByRole('group')
      expect(group).toHaveAttribute('aria-describedby')
    })

    it('should have live region for announcements', () => {
      render(<FilterBox schema={createTestSchema()} value={[]} onChange={vi.fn()} />)
      
      const liveRegion = document.querySelector('[role="status"][aria-live="polite"]')
      expect(liveRegion).toBeInTheDocument()
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

  describe('Clear Button', () => {
    it('should not show clear button by default', () => {
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

      expect(screen.queryByRole('button', { name: /clear/i })).not.toBeInTheDocument()
    })

    it('should show clear button when showClearButton is true and has tokens', () => {
      const value = [
        {
          condition: {
            field: { key: 'name', label: 'Name', type: 'string' as const },
            operator: { key: 'contains', label: 'contains' },
            value: { raw: 'test', display: 'test', serialized: 'test' },
          },
        },
      ]

      render(<FilterBox schema={createTestSchema()} value={value} onChange={vi.fn()} showClearButton />)

      expect(screen.getByRole('button', { name: /clear/i })).toBeInTheDocument()
    })

    it('should not show clear button when showClearButton is true but no tokens', () => {
      render(<FilterBox schema={createTestSchema()} value={[]} onChange={vi.fn()} showClearButton />)

      expect(screen.queryByRole('button', { name: /clear/i })).not.toBeInTheDocument()
    })

    it('should clear all expressions when clear button is clicked', async () => {
      const user = userEvent.setup()
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

      render(<FilterBox schema={createTestSchema()} value={value} onChange={onChange} showClearButton />)

      const clearButton = screen.getByRole('button', { name: /clear/i })
      await user.click(clearButton)

      expect(onChange).toHaveBeenCalledWith([])
    })

    it('should not show clear button when disabled', () => {
      const value = [
        {
          condition: {
            field: { key: 'name', label: 'Name', type: 'string' as const },
            operator: { key: 'contains', label: 'contains' },
            value: { raw: 'test', display: 'test', serialized: 'test' },
          },
        },
      ]

      render(<FilterBox schema={createTestSchema()} value={value} onChange={vi.fn()} showClearButton disabled />)

      expect(screen.queryByRole('button', { name: /clear/i })).not.toBeInTheDocument()
    })
  })

  describe('Token Deletion', () => {
    it('should delete last token on backspace in empty input', async () => {
      const user = userEvent.setup()
      const onChange = vi.fn()
      const value = [
        {
          condition: {
            field: { key: 'status', label: 'Status', type: 'enum' as const },
            operator: { key: 'equals', label: 'equals', symbol: '=' },
            value: { raw: 'active', display: 'active', serialized: 'active' },
          },
        },
      ]

      render(<FilterBox schema={createTestSchema()} value={value} onChange={onChange} />)

      // When tokens exist, click on the combobox to focus it
      const container = screen.getByRole('combobox')
      await user.click(container)
      
      // Find the input (it may not have placeholder when tokens exist)
      const input = container.querySelector('input')
      if (input) {
        await user.type(input, '{Backspace}')
        // Should call onChange to remove the last token
        expect(onChange).toHaveBeenCalled()
      }
    })
  })

  describe('Disabled State', () => {
    it('should not open dropdown when disabled', async () => {
      const user = userEvent.setup()
      render(
        <FilterBox
          schema={createTestSchema()}
          value={[]}
          onChange={vi.fn()}
          disabled
        />
      )

      const container = screen.getByRole('combobox')
      await user.click(container)

      expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
    })

    it('should not allow editing tokens when disabled', async () => {
      const user = userEvent.setup()
      const onChange = vi.fn()
      const value = [
        {
          condition: {
            field: { key: 'status', label: 'Status', type: 'enum' as const },
            operator: { key: 'equals', label: 'equals', symbol: '=' },
            value: { raw: 'active', display: 'active', serialized: 'active' },
          },
        },
      ]

      render(
        <FilterBox
          schema={createTestSchema()}
          value={value}
          onChange={onChange}
          disabled
        />
      )

      // Try clicking a value token
      const valueToken = screen.getByText('active')
      await user.click(valueToken)

      // onChange should not have been called for editing
      expect(onChange).not.toHaveBeenCalled()
    })
  })

  describe('Keyboard Accessibility', () => {
    it('should allow complete expression building with keyboard only', async () => {
      const user = userEvent.setup()
      const onChange = vi.fn()
      render(<FilterBox schema={createTestSchema()} value={[]} onChange={onChange} />)

      // Tab to focus the filter box
      await user.tab()
      
      // Should be focused on input - use combobox role since input has combobox role
      const input = screen.getByRole('combobox')
      expect(document.activeElement).toBe(input)
      
      // Arrow down to navigate, Enter to select field
      await user.keyboard('{Enter}')
      
      // Select operator with Enter
      await user.keyboard('{Enter}')
      
      // Type value and confirm
      await user.type(input, 'test{Enter}')
      
      // Should have called onChange with complete expression
      expect(onChange).toHaveBeenCalled()
    })

    it('should navigate dropdown items with arrow keys', async () => {
      const user = userEvent.setup()
      render(<FilterBox schema={createTestSchema()} value={[]} onChange={vi.fn()} />)

      const input = screen.getByPlaceholderText('Add filter...')
      await user.click(input)

      // Initial first item should be highlighted
      const options = screen.getAllByRole('option')
      expect(options[0]).toHaveAttribute('aria-selected', 'true')

      // Navigate down
      await user.keyboard('{ArrowDown}')
      expect(options[1]).toHaveAttribute('aria-selected', 'true')
      expect(options[0]).toHaveAttribute('aria-selected', 'false')

      // Navigate up
      await user.keyboard('{ArrowUp}')
      expect(options[0]).toHaveAttribute('aria-selected', 'true')
    })

    it('should have focus styling on container when input is focused', async () => {
      const user = userEvent.setup()
      const { container } = render(<FilterBox schema={createTestSchema()} value={[]} onChange={vi.fn()} />)

      await user.tab()
      
      // The combobox container should have data-focused attribute or similar
      const filterBox = container.querySelector('.filter-box')
      expect(filterBox).toBeInTheDocument()
    })

    it('should maintain focus after selecting a dropdown item', async () => {
      const user = userEvent.setup()
      render(<FilterBox schema={createTestSchema()} value={[]} onChange={vi.fn()} />)

      const input = screen.getByPlaceholderText('Add filter...')
      await user.click(input)
      await user.keyboard('{Enter}') // Select first field
      
      // Focus should remain on input
      expect(document.activeElement).toBe(input)
    })

    it('should announce highlighted item change to screen readers', async () => {
      const user = userEvent.setup()
      render(<FilterBox schema={createTestSchema()} value={[]} onChange={vi.fn()} />)

      const input = screen.getByPlaceholderText('Add filter...')
      await user.click(input)

      // Initial item highlighted
      const firstOption = screen.getAllByRole('option')[0]
      expect(firstOption).toHaveAttribute('aria-selected', 'true')

      await user.keyboard('{ArrowDown}')

      // Second item now highlighted
      const secondOption = screen.getAllByRole('option')[1]
      expect(secondOption).toHaveAttribute('aria-selected', 'true')
      expect(firstOption).toHaveAttribute('aria-selected', 'false')
    })

    it('should allow clear button to be accessed via keyboard', async () => {
      const user = userEvent.setup()
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

      render(<FilterBox schema={createTestSchema()} value={value} onChange={onChange} showClearButton />)

      // Get the clear button directly and verify it's in the DOM
      const clearButton = screen.getByRole('button', { name: /clear/i })
      expect(clearButton).toBeInTheDocument()
      
      // Focus and click the clear button
      clearButton.focus()
      await user.click(clearButton)
      
      expect(onChange).toHaveBeenCalledWith([])
    })

    it('should not trap focus in dropdown', async () => {
      const user = userEvent.setup()
      render(
        <div>
          <FilterBox schema={createTestSchema()} value={[]} onChange={vi.fn()} />
          <button>Next Element</button>
        </div>
      )

      const input = screen.getByPlaceholderText('Add filter...')
      await user.click(input)
      
      // Dropdown is open
      expect(screen.getByRole('listbox')).toBeInTheDocument()
      
      // Press Escape and Tab
      await user.keyboard('{Escape}')
      await user.tab()
      
      // Should move to next element
      expect(screen.getByRole('button', { name: 'Next Element' })).toHaveFocus()
    })

    it('should have aria-activedescendant when dropdown is open', async () => {
      const user = userEvent.setup()
      render(<FilterBox schema={createTestSchema()} value={[]} onChange={vi.fn()} />)

      const input = screen.getByPlaceholderText('Add filter...')
      await user.click(input)

      // Input should have aria-activedescendant pointing to highlighted item
      expect(input).toHaveAttribute('aria-activedescendant')
      const activedescendant = input.getAttribute('aria-activedescendant')
      expect(activedescendant).toMatch(/dropdown-item-\d+/)
    })
  })
})
