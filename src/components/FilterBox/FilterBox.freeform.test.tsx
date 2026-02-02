import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { FilterBox } from './FilterBox'
import type { FilterSchema, FilterExpression, FreeformFieldConfig } from '@/types'

/**
 * Test schema with freeform fields enabled
 */
const createFreeformSchema = (freeformConfig?: FreeformFieldConfig): FilterSchema => ({
  fields: [
    {
      key: 'status',
      label: 'Status',
      type: 'enum',
      operators: [
        { key: 'eq', label: 'equals', symbol: '=' },
        { key: 'neq', label: 'not equals', symbol: '≠' },
      ],
    },
    {
      key: 'name',
      label: 'Name',
      type: 'string',
      operators: [
        { key: 'eq', label: 'equals', symbol: '=' },
        { key: 'contains', label: 'contains' },
      ],
    },
  ],
  allowFreeformFields: true,
  freeformFieldConfig: freeformConfig,
})

/**
 * Test schema without freeform fields (for comparison)
 */
const createStandardSchema = (): FilterSchema => ({
  fields: [
    {
      key: 'status',
      label: 'Status',
      type: 'enum',
      operators: [{ key: 'eq', label: 'equals', symbol: '=' }],
    },
  ],
})

describe('FilterBox - Freeform Fields', () => {
  describe('Schema Configuration', () => {
    it('should not show create option when allowFreeformFields is false', async () => {
      const user = userEvent.setup()
      render(<FilterBox schema={createStandardSchema()} value={[]} onChange={vi.fn()} />)

      const input = screen.getByPlaceholderText('Add filter...')
      await user.click(input)
      await user.type(input, 'customField')

      // Should not show "Create field:" option
      expect(screen.queryByText(/Create field:/)).not.toBeInTheDocument()
    })

    it('should show create option when allowFreeformFields is true and user types', async () => {
      const user = userEvent.setup()
      render(<FilterBox schema={createFreeformSchema()} value={[]} onChange={vi.fn()} />)

      const input = screen.getByPlaceholderText('Add filter...')
      await user.click(input)
      await user.type(input, 'myVariable')

      // Should show "Create field:" option
      expect(screen.getByText(/Create field:.*"myVariable"/)).toBeInTheDocument()
    })

    it('should not show create option for exact match with existing field', async () => {
      const user = userEvent.setup()
      render(<FilterBox schema={createFreeformSchema()} value={[]} onChange={vi.fn()} />)

      const input = screen.getByPlaceholderText('Add filter...')
      await user.click(input)
      await user.type(input, 'status')

      // Should show "Status" field but not "Create field: status"
      expect(screen.getByText('Status')).toBeInTheDocument()
      expect(screen.queryByText(/Create field:.*"status"/)).not.toBeInTheDocument()
    })

    it('should use custom placeholder when configured', async () => {
      render(
        <FilterBox
          schema={createFreeformSchema({ placeholder: 'Enter variable name...' })}
          value={[]}
          onChange={vi.fn()}
        />
      )

      // Focus the input first to trigger state change
      const input = screen.getByPlaceholderText('Add filter...')
      fireEvent.focus(input)

      // Now check for the custom placeholder
      expect(screen.getByPlaceholderText('Enter variable name...')).toBeInTheDocument()
    })

    it('should use custom createLabel when configured', async () => {
      const user = userEvent.setup()
      render(
        <FilterBox
          schema={createFreeformSchema({ createLabel: 'New variable: ' })}
          value={[]}
          onChange={vi.fn()}
        />
      )

      const input = screen.getByPlaceholderText('Add filter...')
      await user.click(input)
      await user.type(input, 'myVar')

      expect(screen.getByText(/New variable:.*"myVar"/)).toBeInTheDocument()
    })
  })

  describe('Freeform Field Selection', () => {
    it('should create a freeform field when selecting create option', async () => {
      const user = userEvent.setup()
      const onChange = vi.fn()
      render(<FilterBox schema={createFreeformSchema()} value={[]} onChange={onChange} />)

      const input = screen.getByPlaceholderText('Add filter...')
      await user.click(input)
      await user.type(input, 'variableName')

      // Click the create option
      const createOption = screen.getByText(/Create field:.*"variableName"/)
      await user.click(createOption)

      // Should transition to operator selection - check placeholder changes
      expect(screen.getByPlaceholderText('Select operator...')).toBeInTheDocument()
    })

    it('should show default operators for freeform field', async () => {
      const user = userEvent.setup()
      render(<FilterBox schema={createFreeformSchema()} value={[]} onChange={vi.fn()} />)

      const input = screen.getByPlaceholderText('Add filter...')
      await user.click(input)
      await user.type(input, 'myField')

      const createOption = screen.getByText(/Create field:.*"myField"/)
      await user.click(createOption)

      // Should show default string operators
      expect(screen.getByText('equals')).toBeInTheDocument()
      expect(screen.getByText('not equals')).toBeInTheDocument()
      expect(screen.getByText('contains')).toBeInTheDocument()
    })

    it('should show custom operators when configured', async () => {
      const user = userEvent.setup()
      const customSchema = createFreeformSchema({
        operators: [
          { key: 'eq', label: 'is', symbol: '=' },
          { key: 'regex', label: 'matches regex' },
        ],
      })
      render(<FilterBox schema={customSchema} value={[]} onChange={vi.fn()} />)

      const input = screen.getByPlaceholderText('Add filter...')
      await user.click(input)
      await user.type(input, 'customField')

      const createOption = screen.getByText(/Create field:.*"customField"/)
      await user.click(createOption)

      // Should show custom operators
      expect(screen.getByText('is')).toBeInTheDocument()
      expect(screen.getByText('matches regex')).toBeInTheDocument()
      // Should not show default operators
      expect(screen.queryByText('contains')).not.toBeInTheDocument()
    })
  })

  describe('Complete Filter Expression with Freeform Field', () => {
    it('should complete full expression: freeform field → operator → value', async () => {
      const user = userEvent.setup()
      const onChange = vi.fn()
      render(<FilterBox schema={createFreeformSchema()} value={[]} onChange={onChange} />)

      // 1. Type custom field name and select create option
      const input = screen.getByPlaceholderText('Add filter...')
      await user.click(input)
      await user.type(input, 'userName')

      const createOption = screen.getByText(/Create field:.*"userName"/)
      await user.click(createOption)

      // 2. Select operator
      const equalsOp = screen.getByText('equals')
      await user.click(equalsOp)

      // 3. Enter value
      const valueInput = screen.getByPlaceholderText('Enter value...')
      await user.type(valueInput, 'John Doe')
      await user.keyboard('{Enter}')

      // Should call onChange with the complete expression
      expect(onChange).toHaveBeenCalled()
      const lastCall = onChange.mock.calls[onChange.mock.calls.length - 1]
      const expressions: FilterExpression[] = lastCall[0]

      expect(expressions).toHaveLength(1)
      expect(expressions[0].condition.field.key).toBe('userName')
      expect(expressions[0].condition.field.label).toBe('userName')
      expect(expressions[0].condition.field.type).toBe('string')
      expect(expressions[0].condition.operator.key).toBe('eq')
      expect(expressions[0].condition.value.display).toBe('John Doe')
    })

    it('should build multiple expressions with freeform and predefined fields', async () => {
      const user = userEvent.setup()
      const onChange = vi.fn()
      let currentValue: FilterExpression[] = []

      const { rerender } = render(
        <FilterBox
          schema={createFreeformSchema()}
          value={currentValue}
          onChange={(newValue) => {
            currentValue = newValue
            onChange(newValue)
          }}
        />
      )

      // 1. Create first expression with freeform field
      const input = screen.getByPlaceholderText('Add filter...')
      await user.click(input)
      await user.type(input, 'customVar')

      const createOption = screen.getByText(/Create field:.*"customVar"/)
      await user.click(createOption)

      const containsOp = screen.getByText('contains')
      await user.click(containsOp)

      const valueInput = screen.getByPlaceholderText('Enter value...')
      await user.type(valueInput, 'test')
      await user.keyboard('{Enter}')

      // Rerender with updated value
      rerender(
        <FilterBox
          schema={createFreeformSchema()}
          value={currentValue}
          onChange={(newValue) => {
            currentValue = newValue
            onChange(newValue)
          }}
        />
      )

      // 2. Add AND connector and predefined field
      const andOption = screen.getByText('AND')
      await user.click(andOption)

      // Rerender after connector selection
      rerender(
        <FilterBox
          schema={createFreeformSchema()}
          value={currentValue}
          onChange={(newValue) => {
            currentValue = newValue
            onChange(newValue)
          }}
        />
      )

      // Now select predefined Status field
      const statusField = screen.getByText('Status')
      await user.click(statusField)

      const statusEquals = screen.getByText('equals')
      await user.click(statusEquals)

      const statusValueInput = screen.getByPlaceholderText('Enter value...')
      await user.type(statusValueInput, 'active')
      await user.keyboard('{Enter}')

      // Verify both expressions
      expect(currentValue).toHaveLength(2)
      expect(currentValue[0].condition.field.key).toBe('customVar')
      expect(currentValue[0].connector).toBe('AND')
      expect(currentValue[1].condition.field.key).toBe('status')
    })
  })

  describe('Field Name Validation', () => {
    it('should respect validateFieldName function', async () => {
      const user = userEvent.setup()
      const schema = createFreeformSchema({
        validateFieldName: (name) => {
          // Only allow alphanumeric field names
          return /^[a-zA-Z][a-zA-Z0-9]*$/.test(name)
        },
      })
      render(<FilterBox schema={schema} value={[]} onChange={vi.fn()} />)

      const input = screen.getByPlaceholderText('Add filter...')
      await user.click(input)

      // Valid field name
      await user.clear(input)
      await user.type(input, 'myField123')
      expect(screen.getByText(/Create field:.*"myField123"/)).toBeInTheDocument()

      // Invalid field name (starts with number)
      await user.clear(input)
      await user.type(input, '123invalid')
      expect(screen.queryByText(/Create field:/)).not.toBeInTheDocument()

      // Invalid field name (contains special chars)
      await user.clear(input)
      await user.type(input, 'field-with-dash')
      expect(screen.queryByText(/Create field:/)).not.toBeInTheDocument()
    })
  })

  describe('Freeform Field Type Configuration', () => {
    it('should use string type by default', async () => {
      const user = userEvent.setup()
      const onChange = vi.fn()
      render(<FilterBox schema={createFreeformSchema()} value={[]} onChange={onChange} />)

      const input = screen.getByPlaceholderText('Add filter...')
      await user.click(input)
      await user.type(input, 'stringField')

      const createOption = screen.getByText(/Create field:.*"stringField"/)
      await user.click(createOption)

      await user.click(screen.getByText('equals'))
      await user.type(screen.getByPlaceholderText('Enter value...'), 'value')
      await user.keyboard('{Enter}')

      const expressions = onChange.mock.calls[onChange.mock.calls.length - 1][0]
      expect(expressions[0].condition.field.type).toBe('string')
    })

    it('should use custom type when configured', async () => {
      const user = userEvent.setup()
      const onChange = vi.fn()
      const schema = createFreeformSchema({ type: 'number' })
      render(<FilterBox schema={schema} value={[]} onChange={onChange} />)

      const input = screen.getByPlaceholderText('Add filter...')
      await user.click(input)
      await user.type(input, 'numericField')

      const createOption = screen.getByText(/Create field:.*"numericField"/)
      await user.click(createOption)

      await user.click(screen.getByText('equals'))
      await user.type(screen.getByPlaceholderText('Enter value...'), '42')
      await user.keyboard('{Enter}')

      const expressions = onChange.mock.calls[onChange.mock.calls.length - 1][0]
      expect(expressions[0].condition.field.type).toBe('number')
    })
  })

  describe('Keyboard Navigation', () => {
    it('should select freeform option with arrow keys and Enter', async () => {
      const user = userEvent.setup()
      const onChange = vi.fn()
      render(<FilterBox schema={createFreeformSchema()} value={[]} onChange={onChange} />)

      const input = screen.getByPlaceholderText('Add filter...')
      await user.click(input)
      await user.type(input, 'newField')

      // The create option should be at the end of the list
      // Navigate down until we reach it
      await user.keyboard('{ArrowDown}')
      await user.keyboard('{ArrowDown}')
      await user.keyboard('{ArrowDown}') // Should now highlight the create option

      await user.keyboard('{Enter}')

      // Should transition to operator selection
      expect(screen.getByPlaceholderText('Select operator...')).toBeInTheDocument()
    })
  })

  describe('Display and Tokens', () => {
    it('should display freeform field in token correctly', () => {
      const value: FilterExpression[] = [
        {
          condition: {
            field: { key: 'customVariable', label: 'customVariable', type: 'string' },
            operator: { key: 'eq', label: 'equals', symbol: '=' },
            value: { raw: 'test', display: 'test', serialized: 'test' },
          },
        },
      ]

      render(<FilterBox schema={createFreeformSchema()} value={value} onChange={vi.fn()} />)

      // The field token should show the custom field name
      expect(screen.getByText('customVariable')).toBeInTheDocument()
      expect(screen.getByText('=')).toBeInTheDocument()
      expect(screen.getByText('test')).toBeInTheDocument()
    })
  })

  describe('Edge Cases', () => {
    it('should handle empty input gracefully', async () => {
      const user = userEvent.setup()
      render(<FilterBox schema={createFreeformSchema()} value={[]} onChange={vi.fn()} />)

      const input = screen.getByPlaceholderText('Add filter...')
      await user.click(input)

      // Should not show create option for empty input
      expect(screen.queryByText(/Create field:/)).not.toBeInTheDocument()
    })

    it('should handle whitespace-only input', async () => {
      const user = userEvent.setup()
      render(<FilterBox schema={createFreeformSchema()} value={[]} onChange={vi.fn()} />)

      const input = screen.getByPlaceholderText('Add filter...')
      await user.click(input)
      await user.type(input, '   ')

      // Should not show create option for whitespace-only
      expect(screen.queryByText(/Create field:/)).not.toBeInTheDocument()
    })

    it('should trim whitespace from field name', async () => {
      const user = userEvent.setup()
      const onChange = vi.fn()
      render(<FilterBox schema={createFreeformSchema()} value={[]} onChange={onChange} />)

      const input = screen.getByPlaceholderText('Add filter...')
      await user.click(input)
      await user.type(input, '  myField  ')

      // Create option should show trimmed name
      const createOption = screen.getByText(/Create field:.*"myField"/)
      await user.click(createOption)

      // Complete the expression
      await user.click(screen.getByText('equals'))
      await user.type(screen.getByPlaceholderText('Enter value...'), 'val')
      await user.keyboard('{Enter}')

      const expressions = onChange.mock.calls[onChange.mock.calls.length - 1][0]
      expect(expressions[0].condition.field.key).toBe('myField')
    })
  })

  describe('Operator Editing for Freeform Fields', () => {
    it('should allow editing operator on a freeform field expression', async () => {
      const user = userEvent.setup()
      const onChange = vi.fn()
      // Start with an existing freeform field expression
      const initialValue: FilterExpression[] = [
        {
          condition: {
            field: { key: 'customField', label: 'customField', type: 'string' },
            operator: { key: 'eq', label: 'equals', symbol: '=' },
            value: { raw: 'test', display: 'test', serialized: 'test' },
          },
        },
      ]
      render(<FilterBox schema={createFreeformSchema()} value={initialValue} onChange={onChange} />)

      // Click on the operator token to edit it
      const operatorToken = screen.getByText('=')
      await user.click(operatorToken)

      // Should show operator options from freeform field config
      expect(screen.getByText('equals')).toBeInTheDocument()
      expect(screen.getByText('not equals')).toBeInTheDocument()
      expect(screen.getByText('contains')).toBeInTheDocument()

      // Select a new operator
      await user.click(screen.getByText('contains'))

      // Verify onChange was called with updated operator
      expect(onChange).toHaveBeenCalled()
      const lastCall = onChange.mock.calls[onChange.mock.calls.length - 1][0]
      expect(lastCall[0].condition.operator.key).toBe('contains')
      expect(lastCall[0].condition.operator.label).toBe('contains')
    })

    it('should use custom operators from freeformFieldConfig when editing', async () => {
      const user = userEvent.setup()
      const onChange = vi.fn()
      const customOperators = [
        { key: 'is', label: 'is', symbol: '≡' },
        { key: 'isNot', label: 'is not', symbol: '≢' },
      ]
      const initialValue: FilterExpression[] = [
        {
          condition: {
            field: { key: 'myCustomField', label: 'myCustomField', type: 'string' },
            operator: { key: 'is', label: 'is', symbol: '≡' },
            value: { raw: 'val', display: 'val', serialized: 'val' },
          },
        },
      ]
      render(
        <FilterBox
          schema={createFreeformSchema({ operators: customOperators })}
          value={initialValue}
          onChange={onChange}
        />
      )

      // Click on the operator token
      const operatorToken = screen.getByText('≡')
      await user.click(operatorToken)

      // Should show custom operators only
      expect(screen.getByText('is')).toBeInTheDocument()
      expect(screen.getByText('is not')).toBeInTheDocument()
      // Should not show default operators
      expect(screen.queryByText('contains')).not.toBeInTheDocument()
    })
  })
})
