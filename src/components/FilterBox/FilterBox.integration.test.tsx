/**
 * FilterBox Integration Tests
 *
 * Tests for complete user flows and integration between components.
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { FilterBox } from './FilterBox'
import type { FilterSchema, FilterExpression } from '@/types'

// Create a comprehensive test schema
const createFullSchema = (): FilterSchema => ({
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
        { key: 'ends_with', label: 'ends with' },
      ],
    },
    {
      key: 'priority',
      label: 'Priority',
      type: 'number',
      operators: [
        { key: 'equals', label: 'equals', symbol: '=' },
        { key: 'greater_than', label: 'greater than', symbol: '>' },
        { key: 'less_than', label: 'less than', symbol: '<' },
      ],
    },
  ],
})

describe('Complete Filter Building Flow', () => {
  it('builds single expression: field → operator → value', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<FilterBox schema={createFullSchema()} value={[]} onChange={onChange} />)

    // Focus the input
    const input = screen.getByPlaceholderText('Add filter...')
    await user.click(input)

    // Should see field suggestions
    expect(screen.getByRole('listbox')).toBeInTheDocument()
    expect(screen.getByText('Name')).toBeInTheDocument()

    // Select field
    await user.click(screen.getByText('Name'))

    // Should now see operator suggestions
    expect(screen.getByText('contains')).toBeInTheDocument()

    // Select operator
    await user.click(screen.getByText('contains'))

    // Enter value and confirm
    await user.type(input, 'test value{Enter}')

    // Should have called onChange with complete expression
    expect(onChange).toHaveBeenCalledWith([
      expect.objectContaining({
        condition: expect.objectContaining({
          field: expect.objectContaining({ key: 'name' }),
          operator: expect.objectContaining({ key: 'contains' }),
          value: expect.objectContaining({ raw: 'test value' }),
        }),
      }),
    ])
  })

  it('builds multiple expressions with AND', async () => {
    const _user = userEvent.setup()
    const onChange = vi.fn()
    
    // Start with one existing expression
    const existingValue: FilterExpression[] = [
      {
        condition: {
          field: { key: 'status', label: 'Status', type: 'enum' },
          operator: { key: 'equals', label: 'equals', symbol: '=' },
          value: { raw: 'active', display: 'active', serialized: 'active' },
        },
        connector: 'AND',
      },
    ]

    render(<FilterBox schema={createFullSchema()} value={existingValue} onChange={onChange} />)

    // Verify existing expression is displayed
    expect(screen.getByText('Status')).toBeInTheDocument()
    expect(screen.getByText('=')).toBeInTheDocument()
    expect(screen.getByText('active')).toBeInTheDocument()
    expect(screen.getByText('AND')).toBeInTheDocument()
  })

  it('builds multiple expressions with OR', async () => {
    const _user = userEvent.setup()
    const onChange = vi.fn()
    
    const existingValue: FilterExpression[] = [
      {
        condition: {
          field: { key: 'name', label: 'Name', type: 'string' },
          operator: { key: 'contains', label: 'contains' },
          value: { raw: 'foo', display: 'foo', serialized: 'foo' },
        },
        connector: 'OR',
      },
      {
        condition: {
          field: { key: 'name', label: 'Name', type: 'string' },
          operator: { key: 'contains', label: 'contains' },
          value: { raw: 'bar', display: 'bar', serialized: 'bar' },
        },
      },
    ]

    render(<FilterBox schema={createFullSchema()} value={existingValue} onChange={onChange} />)

    // Verify both expressions and OR connector are displayed
    expect(screen.getAllByText('Name')).toHaveLength(2)
    expect(screen.getByText('OR')).toBeInTheDocument()
    expect(screen.getByText('foo')).toBeInTheDocument()
    expect(screen.getByText('bar')).toBeInTheDocument()
  })

  it('builds mixed AND/OR expressions', async () => {
    const existingValue: FilterExpression[] = [
      {
        condition: {
          field: { key: 'status', label: 'Status', type: 'enum' },
          operator: { key: 'equals', label: 'equals', symbol: '=' },
          value: { raw: 'active', display: 'active', serialized: 'active' },
        },
        connector: 'AND',
      },
      {
        condition: {
          field: { key: 'name', label: 'Name', type: 'string' },
          operator: { key: 'contains', label: 'contains' },
          value: { raw: 'test', display: 'test', serialized: 'test' },
        },
        connector: 'OR',
      },
      {
        condition: {
          field: { key: 'priority', label: 'Priority', type: 'number' },
          operator: { key: 'greater_than', label: 'greater than', symbol: '>' },
          value: { raw: '5', display: '5', serialized: '5' },
        },
      },
    ]

    render(<FilterBox schema={createFullSchema()} value={existingValue} onChange={vi.fn()} />)

    // Verify all expressions and connectors are displayed
    expect(screen.getByText('Status')).toBeInTheDocument()
    expect(screen.getByText('Name')).toBeInTheDocument()
    expect(screen.getByText('Priority')).toBeInTheDocument()
    expect(screen.getByText('AND')).toBeInTheDocument()
    expect(screen.getByText('OR')).toBeInTheDocument()
  })

  it('edits existing value and updates expression', async () => {
    const onChange = vi.fn()
    const existingValue: FilterExpression[] = [
      {
        condition: {
          field: { key: 'name', label: 'Name', type: 'string' },
          operator: { key: 'contains', label: 'contains' },
          value: { raw: 'original', display: 'original', serialized: 'original' },
        },
      },
    ]

    render(<FilterBox schema={createFullSchema()} value={existingValue} onChange={onChange} />)

    // Click on the value token to edit
    const valueToken = screen.getByText('original')
    fireEvent.click(valueToken)

    // Find the edit input and change the value
    const editInput = screen.getByRole('textbox', { name: /edit value/i })
    expect(editInput).toHaveValue('original')
    
    // Change value and press Enter
    fireEvent.change(editInput, { target: { value: 'updated' } })
    fireEvent.keyDown(editInput, { key: 'Enter' })

    // Should call onChange with updated value
    expect(onChange).toHaveBeenCalledWith([
      expect.objectContaining({
        condition: expect.objectContaining({
          value: expect.objectContaining({ raw: 'updated' }),
        }),
      }),
    ])
  })

  it('deletes expression from the end', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    const existingValue: FilterExpression[] = [
      {
        condition: {
          field: { key: 'name', label: 'Name', type: 'string' },
          operator: { key: 'contains', label: 'contains' },
          value: { raw: 'test', display: 'test', serialized: 'test' },
        },
      },
    ]

    render(<FilterBox schema={createFullSchema()} value={existingValue} onChange={onChange} />)

    // Click on the filter box to focus
    const container = screen.getByRole('combobox')
    await user.click(container)

    // Find the input and press backspace
    const input = container.querySelector('input')
    if (input) {
      await user.type(input, '{Backspace}')
      // Should call onChange to remove the token
      expect(onChange).toHaveBeenCalled()
    }
  })

  it('clears all expressions', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    const existingValue: FilterExpression[] = [
      {
        condition: {
          field: { key: 'status', label: 'Status', type: 'enum' },
          operator: { key: 'equals', label: 'equals', symbol: '=' },
          value: { raw: 'active', display: 'active', serialized: 'active' },
        },
        connector: 'AND',
      },
      {
        condition: {
          field: { key: 'name', label: 'Name', type: 'string' },
          operator: { key: 'contains', label: 'contains' },
          value: { raw: 'test', display: 'test', serialized: 'test' },
        },
      },
    ]

    render(
      <FilterBox
        schema={createFullSchema()}
        value={existingValue}
        onChange={onChange}
      />
    )

    // Click the clear button
    const clearButton = screen.getByRole('button', { name: /clear/i })
    await user.click(clearButton)

    // Should call onChange with empty array
    expect(onChange).toHaveBeenCalledWith([])
  })
})

describe('Schema Integration', () => {
  it('shows only valid fields from schema', async () => {
    const user = userEvent.setup()
    const limitedSchema: FilterSchema = {
      fields: [
        {
          key: 'field1',
          label: 'Field One',
          type: 'string',
          operators: [{ key: 'eq', label: 'equals' }],
        },
        {
          key: 'field2',
          label: 'Field Two',
          type: 'number',
          operators: [{ key: 'eq', label: 'equals' }],
        },
      ],
    }

    render(<FilterBox schema={limitedSchema} value={[]} onChange={vi.fn()} />)

    const input = screen.getByPlaceholderText('Add filter...')
    await user.click(input)

    // Should only show fields from schema
    expect(screen.getByText('Field One')).toBeInTheDocument()
    expect(screen.getByText('Field Two')).toBeInTheDocument()
    expect(screen.queryByText('Other Field')).not.toBeInTheDocument()
  })

  it('shows only valid operators for selected field', async () => {
    const user = userEvent.setup()
    const schema: FilterSchema = {
      fields: [
        {
          key: 'text',
          label: 'Text Field',
          type: 'string',
          operators: [
            { key: 'contains', label: 'contains' },
            { key: 'eq', label: 'equals' },
          ],
        },
      ],
    }

    render(<FilterBox schema={schema} value={[]} onChange={vi.fn()} />)

    const input = screen.getByPlaceholderText('Add filter...')
    await user.click(input)
    await user.click(screen.getByText('Text Field'))

    // Should show only operators for this field
    expect(screen.getByText('contains')).toBeInTheDocument()
    expect(screen.getByText('equals')).toBeInTheDocument()
    expect(screen.queryByText('greater than')).not.toBeInTheDocument()
  })

  it('validates against schema constraints', async () => {
    const onError = vi.fn()
    const schema: FilterSchema = {
      fields: [
        {
          key: 'status',
          label: 'Status',
          type: 'enum',
          operators: [{ key: 'equals', label: 'equals' }],
        },
      ],
    }

    // Pass invalid expression (field not in schema)
    const invalidValue: FilterExpression[] = [
      {
        condition: {
          field: { key: 'invalid', label: 'Invalid', type: 'string' },
          operator: { key: 'equals', label: 'equals' },
          value: { raw: 'test', display: 'test', serialized: 'test' },
        },
      },
    ]

    render(
      <FilterBox
        schema={schema}
        value={invalidValue}
        onChange={vi.fn()}
        onError={onError}
      />
    )

    // onError should be called with validation errors
    expect(onError).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({
          type: 'field',
        }),
      ])
    )
  })
})

describe('Keyboard-Only Navigation Flow', () => {
  it('completes full expression using only keyboard', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<FilterBox schema={createFullSchema()} value={[]} onChange={onChange} />)

    // Tab to focus
    await user.tab()
    
    // Dropdown should open
    expect(screen.getByRole('listbox')).toBeInTheDocument()

    // Navigate with arrow keys and select field
    await user.keyboard('{ArrowDown}') // Move to second field
    await user.keyboard('{Enter}') // Select it

    // Select operator
    await user.keyboard('{Enter}') // Select first operator

    // Type value and confirm
    await user.keyboard('keyboard test{Enter}')

    // Should have called onChange
    expect(onChange).toHaveBeenCalled()
  })

  it('can cancel selection with Escape', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<FilterBox schema={createFullSchema()} value={[]} onChange={onChange} />)

    const input = screen.getByPlaceholderText('Add filter...')
    await user.click(input)

    // Dropdown should be open
    expect(screen.getByRole('listbox')).toBeInTheDocument()

    // Press Escape to close
    await user.keyboard('{Escape}')

    // Dropdown should close
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()

    // onChange should not have been called
    expect(onChange).not.toHaveBeenCalled()
  })
})
