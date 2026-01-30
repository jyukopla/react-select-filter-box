import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { FilterBox } from './FilterBox'
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
})
