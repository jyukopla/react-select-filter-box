/**
 * Integration test: Value editing via keyboard with focus management
 *
 * Tests the complete workflow:
 * 1. Tab to autocomplete field and operator
 * 2. Type value and press Enter
 * 3. Press Left Arrow to select value
 * 4. Press Enter to edit value
 * 5. Press Enter to submit edited value
 * 6. Verify focus is restored and cursor is visible
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { FilterBox } from './FilterBox'
import type { FilterSchema } from '@/types'

describe('FilterBox - Keyboard Value Editing with Focus Management', () => {
  const schema: FilterSchema = {
    fields: [
      {
        key: 'processInstanceId',
        label: 'Process Instance ID',
        type: 'string',
        operators: [
          { key: 'eq', label: 'equals', symbol: '=' },
          { key: 'neq', label: 'not equals', symbol: '!=' },
        ],
      },
    ],
  }

  it('should restore focus after editing value with Enter key', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()

    // Start with an existing expression
    const initialValue = [
      {
        condition: {
          field: {
            key: 'processInstanceId',
            label: 'Process Instance ID',
            type: 'string' as const,
          },
          operator: { key: 'eq', label: 'equals', symbol: '=' },
          value: { raw: 'initial-value', display: 'initial-value', serialized: 'initial-value' },
        },
      },
    ]

    render(<FilterBox schema={schema} value={initialValue} onChange={onChange} autoFocus />)

    const input = screen.getByRole('combobox') as HTMLInputElement

    // At this point, connector dropdown should be open and input should have focus
    await waitFor(() => {
      expect(input).toHaveFocus()
    })

    // Step 1: Press Left Arrow to select value token
    await user.keyboard('{ArrowLeft}')

    // Verify value token is selected
    const valueToken = screen.getByRole('option', { name: /value: initial-value/i })
    expect(valueToken).toHaveClass('token--selected')

    // Step 2: Press Enter to edit the value
    await user.keyboard('{Enter}')

    // Value token should now be in editing mode with an inline input
    const editInput = await screen.findByRole('textbox', { name: /edit value/i })
    expect(editInput).toBeInTheDocument()
    expect(editInput).toHaveValue('initial-value')

    // Wait for focus to settle
    await waitFor(() => {
      expect(editInput).toHaveFocus()
    })

    // Step 3: Clear and type new value using fireEvent (more direct)
    fireEvent.change(editInput, { target: { value: 'edited-value' } })

    // Step 4: Press Enter to submit the edited value using fireEvent
    fireEvent.keyDown(editInput, { key: 'Enter', code: 'Enter' })

    // Verify the value was updated
    await waitFor(() => {
      expect(onChange).toHaveBeenCalled()
    })

    // Get the updated value from onChange
    const calls = onChange.mock.calls
    const lastCall = calls[calls.length - 1]
    expect(lastCall[0][0].condition.value.raw).toBe('edited-value')

    // Step 5: Verify focus is restored to the main input
    // This is the bug: focus should be on the main input, but it's lost
    await waitFor(
      () => {
        expect(input).toHaveFocus()
      },
      { timeout: 2000 }
    )

    // Step 6: Verify connector dropdown is NOT auto-opened (new usability behavior)
    // User needs to press ArrowDown to see connector options
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()

    // Step 7: Verify the input is ready for more input (cursor visible)
    // We can't directly test cursor visibility, but we can verify the input is focused
    // and that we can type into it
    expect(input).not.toBeDisabled()
  })

  it('should restore focus after editing value with keyboard and then pressing Escape', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()

    // Start with an existing expression
    const initialValue = [
      {
        condition: {
          field: {
            key: 'processInstanceId',
            label: 'Process Instance ID',
            type: 'string' as const,
          },
          operator: { key: 'eq', label: 'equals', symbol: '=' },
          value: { raw: 'test-value', display: 'test-value', serialized: 'test-value' },
        },
      },
    ]

    render(<FilterBox schema={schema} value={initialValue} onChange={onChange} autoFocus />)

    const input = screen.getByRole('combobox') as HTMLInputElement

    // Select value token
    await user.keyboard('{ArrowLeft}')

    // Edit value
    await user.keyboard('{Enter}')
    const editInput = await screen.findByRole('textbox', { name: /edit value/i })

    // Cancel edit with Escape
    fireEvent.keyDown(editInput, { key: 'Escape', code: 'Escape' })

    // Verify focus is restored to main input
    await waitFor(() => {
      expect(input).toHaveFocus()
    })
  })

  it('should maintain consistent state after editing value compared to initial entry', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()

    // Test scenario: Edit existing value
    const initialValue = [
      {
        condition: {
          field: {
            key: 'processInstanceId',
            label: 'Process Instance ID',
            type: 'string' as const,
          },
          operator: { key: 'eq', label: 'equals', symbol: '=' },
          value: { raw: 'my-value', display: 'my-value', serialized: 'my-value' },
        },
      },
    ]

    render(<FilterBox schema={schema} value={initialValue} onChange={onChange} autoFocus />)

    const input = screen.getByRole('combobox') as HTMLInputElement

    // Edit the value
    await user.keyboard('{ArrowLeft}') // Select value
    await user.keyboard('{Enter}') // Start editing
    const editInput = await screen.findByRole('textbox', { name: /edit value/i })
    fireEvent.change(editInput, { target: { value: 'my-value-edited' } })
    fireEvent.keyDown(editInput, { key: 'Enter', code: 'Enter' }) // Submit edit

    // Capture state after edit
    await waitFor(() => {
      expect(onChange).toHaveBeenCalled()
    })

    await waitFor(() => {
      expect(input).toHaveFocus()
    })

    const dropdownOpenAfterEdit = screen.queryByRole('listbox') !== null

    // Dropdown should NOT be auto-opened after edit (new usability behavior)
    // User presses ArrowDown to see connector options
    expect(dropdownOpenAfterEdit).toBe(false)
  })
})
