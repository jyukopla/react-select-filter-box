import { describe, it, expect } from 'vitest'
import { validateExpression, validateExpressions, validateSchema } from './validation'
import type { FilterSchema, FilterExpression } from '@/types'

describe('validation', () => {
  const testSchema: FilterSchema = {
    fields: [
      {
        key: 'status',
        label: 'Status',
        type: 'enum',
        operators: [
          { key: 'eq', label: 'equals', symbol: '=' },
          { key: 'neq', label: 'not equals', symbol: '!=' },
        ],
      },
      {
        key: 'name',
        label: 'Name',
        type: 'string',
        operators: [{ key: 'contains', label: 'contains' }],
      },
    ],
  }

  describe('validateExpression', () => {
    it('should validate a valid expression', () => {
      const expression: FilterExpression = {
        condition: {
          field: { key: 'status', label: 'Status', type: 'enum' },
          operator: { key: 'eq', label: 'equals', symbol: '=' },
          value: { raw: 'active', display: 'active', serialized: 'active' },
        },
      }

      const result = validateExpression(expression, testSchema)
      expect(result.valid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('should error on unknown field', () => {
      const expression: FilterExpression = {
        condition: {
          field: { key: 'unknown', label: 'Unknown', type: 'string' },
          operator: { key: 'eq', label: 'equals' },
          value: { raw: 'test', display: 'test', serialized: 'test' },
        },
      }

      const result = validateExpression(expression, testSchema)
      expect(result.valid).toBe(false)
      expect(result.errors?.[0]?.type).toBe('field')
      expect(result.errors?.[0]?.message).toContain('unknown')
    })

    it('should error on invalid operator for field', () => {
      const expression: FilterExpression = {
        condition: {
          field: { key: 'status', label: 'Status', type: 'enum' },
          operator: { key: 'contains', label: 'contains' }, // Not valid for enum
          value: { raw: 'test', display: 'test', serialized: 'test' },
        },
      }

      const result = validateExpression(expression, testSchema)
      expect(result.valid).toBe(false)
      expect(result.errors?.[0]?.type).toBe('operator')
    })

    it('should error on empty value', () => {
      const expression: FilterExpression = {
        condition: {
          field: { key: 'status', label: 'Status', type: 'enum' },
          operator: { key: 'eq', label: 'equals' },
          value: { raw: '', display: '', serialized: '' },
        },
      }

      const result = validateExpression(expression, testSchema)
      expect(result.valid).toBe(false)
      expect(result.errors?.[0]?.type).toBe('value')
    })

    it('should allow empty value when valueRequired is false', () => {
      const expression: FilterExpression = {
        condition: {
          field: { key: 'status', label: 'Status', type: 'enum' },
          operator: { key: 'eq', label: 'equals' },
          value: { raw: '', display: '', serialized: '' },
        },
      }

      const schemaWithOptional: FilterSchema = {
        fields: [
          {
            ...testSchema.fields[0],
            valueRequired: false,
          },
        ],
      }

      const result = validateExpression(expression, schemaWithOptional)
      expect(result.valid).toBe(true)
    })
  })

  describe('validateExpressions', () => {
    it('should validate multiple valid expressions', () => {
      const expressions: FilterExpression[] = [
        {
          condition: {
            field: { key: 'status', label: 'Status', type: 'enum' },
            operator: { key: 'eq', label: 'equals' },
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

      const result = validateExpressions(expressions, testSchema)
      expect(result.valid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('should return all errors from multiple expressions', () => {
      const expressions: FilterExpression[] = [
        {
          condition: {
            field: { key: 'unknown', label: 'Unknown', type: 'string' },
            operator: { key: 'eq', label: 'equals' },
            value: { raw: 'test', display: 'test', serialized: 'test' },
          },
        },
        {
          condition: {
            field: { key: 'status', label: 'Status', type: 'enum' },
            operator: { key: 'contains', label: 'contains' },
            value: { raw: '', display: '', serialized: '' },
          },
        },
      ]

      const result = validateExpressions(expressions, testSchema)
      expect(result.valid).toBe(false)
      expect(result.errors?.length).toBeGreaterThan(1)
    })

    it('should include expressionIndex in errors', () => {
      const expressions: FilterExpression[] = [
        {
          condition: {
            field: { key: 'status', label: 'Status', type: 'enum' },
            operator: { key: 'eq', label: 'equals' },
            value: { raw: 'active', display: 'active', serialized: 'active' },
          },
        },
        {
          condition: {
            field: { key: 'unknown', label: 'Unknown', type: 'string' },
            operator: { key: 'eq', label: 'equals' },
            value: { raw: 'test', display: 'test', serialized: 'test' },
          },
        },
      ]

      const result = validateExpressions(expressions, testSchema)
      expect(result.errors?.[0]?.expressionIndex).toBe(1)
    })

    it('should validate empty array', () => {
      const result = validateExpressions([], testSchema)
      expect(result.valid).toBe(true)
    })
  })

  describe('validateSchema', () => {
    it('should validate a valid schema', () => {
      const result = validateSchema(testSchema)
      expect(result.valid).toBe(true)
    })

    it('should error on duplicate field keys', () => {
      const invalidSchema: FilterSchema = {
        fields: [
          {
            key: 'status',
            label: 'Status',
            type: 'enum',
            operators: [{ key: 'eq', label: 'equals' }],
          },
          {
            key: 'status', // Duplicate
            label: 'Another Status',
            type: 'enum',
            operators: [{ key: 'eq', label: 'equals' }],
          },
        ],
      }

      const result = validateSchema(invalidSchema)
      expect(result.valid).toBe(false)
      expect(result.errors?.[0]?.type).toBe('schema')
      expect(result.errors?.[0]?.message.toLowerCase()).toContain('duplicate')
    })

    it('should error on field with no operators', () => {
      const invalidSchema: FilterSchema = {
        fields: [
          {
            key: 'status',
            label: 'Status',
            type: 'enum',
            operators: [],
          },
        ],
      }

      const result = validateSchema(invalidSchema)
      expect(result.valid).toBe(false)
      expect(result.errors?.[0]?.field).toBe('status')
    })

    it('should error on empty fields array', () => {
      const invalidSchema: FilterSchema = {
        fields: [],
      }

      const result = validateSchema(invalidSchema)
      expect(result.valid).toBe(false)
      expect(result.errors?.[0]?.type).toBe('schema')
    })
  })

  describe('field uniqueness validation', () => {
    const schemaWithUnique: FilterSchema = {
      fields: [
        {
          key: 'status',
          label: 'Status',
          type: 'enum',
          operators: [{ key: 'eq', label: 'equals', symbol: '=' }],
          allowMultiple: false, // Can only appear once
        },
        {
          key: 'name',
          label: 'Name',
          type: 'string',
          operators: [{ key: 'contains', label: 'contains' }],
          // allowMultiple defaults to true
        },
      ],
    }

    it('should allow using unique field once', () => {
      const expressions: FilterExpression[] = [
        {
          condition: {
            field: { key: 'status', label: 'Status', type: 'enum' },
            operator: { key: 'eq', label: 'equals', symbol: '=' },
            value: { raw: 'active', display: 'active', serialized: 'active' },
          },
        },
      ]

      const result = validateExpressions(expressions, schemaWithUnique)
      expect(result.valid).toBe(true)
    })

    it('should error when unique field is used multiple times', () => {
      const expressions: FilterExpression[] = [
        {
          condition: {
            field: { key: 'status', label: 'Status', type: 'enum' },
            operator: { key: 'eq', label: 'equals', symbol: '=' },
            value: { raw: 'active', display: 'active', serialized: 'active' },
          },
          connector: 'AND',
        },
        {
          condition: {
            field: { key: 'status', label: 'Status', type: 'enum' },
            operator: { key: 'eq', label: 'equals', symbol: '=' },
            value: { raw: 'pending', display: 'pending', serialized: 'pending' },
          },
        },
      ]

      const result = validateExpressions(expressions, schemaWithUnique)
      expect(result.valid).toBe(false)
      expect(result.errors.some((e) => e.message.includes('can only be used once'))).toBe(true)
    })

    it('should allow using non-unique field multiple times', () => {
      const expressions: FilterExpression[] = [
        {
          condition: {
            field: { key: 'name', label: 'Name', type: 'string' },
            operator: { key: 'contains', label: 'contains' },
            value: { raw: 'John', display: 'John', serialized: 'John' },
          },
          connector: 'OR',
        },
        {
          condition: {
            field: { key: 'name', label: 'Name', type: 'string' },
            operator: { key: 'contains', label: 'contains' },
            value: { raw: 'Jane', display: 'Jane', serialized: 'Jane' },
          },
        },
      ]

      const result = validateExpressions(expressions, schemaWithUnique)
      expect(result.valid).toBe(true)
    })

    it('should report second occurrence of unique field', () => {
      const expressions: FilterExpression[] = [
        {
          condition: {
            field: { key: 'status', label: 'Status', type: 'enum' },
            operator: { key: 'eq', label: 'equals', symbol: '=' },
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
          connector: 'AND',
        },
        {
          condition: {
            field: { key: 'status', label: 'Status', type: 'enum' },
            operator: { key: 'eq', label: 'equals', symbol: '=' },
            value: { raw: 'pending', display: 'pending', serialized: 'pending' },
          },
        },
      ]

      const result = validateExpressions(expressions, schemaWithUnique)
      expect(result.valid).toBe(false)
      const uniqueError = result.errors.find((e) => e.message.includes('can only be used once'))
      expect(uniqueError?.expressionIndex).toBe(2) // Second occurrence at index 2
    })
  })

  describe('max expressions validation', () => {
    const schemaWithMax: FilterSchema = {
      fields: [
        {
          key: 'status',
          label: 'Status',
          type: 'enum',
          operators: [{ key: 'eq', label: 'equals', symbol: '=' }],
        },
        {
          key: 'name',
          label: 'Name',
          type: 'string',
          operators: [{ key: 'contains', label: 'contains' }],
        },
      ],
      maxExpressions: 2,
    }

    it('should allow expressions within limit', () => {
      const expressions: FilterExpression[] = [
        {
          condition: {
            field: { key: 'status', label: 'Status', type: 'enum' },
            operator: { key: 'eq', label: 'equals', symbol: '=' },
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

      const result = validateExpressions(expressions, schemaWithMax)
      expect(result.valid).toBe(true)
    })

    it('should error when expressions exceed limit', () => {
      const expressions: FilterExpression[] = [
        {
          condition: {
            field: { key: 'status', label: 'Status', type: 'enum' },
            operator: { key: 'eq', label: 'equals', symbol: '=' },
            value: { raw: 'active', display: 'active', serialized: 'active' },
          },
          connector: 'AND',
        },
        {
          condition: {
            field: { key: 'name', label: 'Name', type: 'string' },
            operator: { key: 'contains', label: 'contains' },
            value: { raw: 'John', display: 'John', serialized: 'John' },
          },
          connector: 'AND',
        },
        {
          condition: {
            field: { key: 'name', label: 'Name', type: 'string' },
            operator: { key: 'contains', label: 'contains' },
            value: { raw: 'Doe', display: 'Doe', serialized: 'Doe' },
          },
        },
      ]

      const result = validateExpressions(expressions, schemaWithMax)
      expect(result.valid).toBe(false)
      expect(result.errors.some((e) => e.message.includes('Maximum of 2 expressions'))).toBe(true)
    })

    it('should not limit when maxExpressions is not set', () => {
      const expressions: FilterExpression[] = Array.from({ length: 10 }, (_, i) => ({
        condition: {
          field: { key: 'name', label: 'Name', type: 'string' as const },
          operator: { key: 'contains', label: 'contains' },
          value: { raw: `value${i}`, display: `value${i}`, serialized: `value${i}` },
        },
        connector: i < 9 ? ('AND' as const) : undefined,
      }))

      const result = validateExpressions(expressions, testSchema)
      expect(result.valid).toBe(true)
    })
  })

  describe('multi-value validation', () => {
    const schemaWithMultiValue: FilterSchema = {
      fields: [
        {
          key: 'price',
          label: 'Price',
          type: 'number',
          operators: [
            { key: 'eq', label: 'equals', symbol: '=' },
            {
              key: 'between',
              label: 'between',
              multiValue: { count: 2, separator: 'and', labels: ['from', 'to'] },
            },
          ],
        },
        {
          key: 'tags',
          label: 'Tags',
          type: 'enum',
          operators: [
            { key: 'eq', label: 'equals' },
            {
              key: 'in',
              label: 'in',
              multiValue: { count: -1, separator: ',', labels: [] }, // Unlimited values
            },
          ],
        },
      ],
    }

    it('should validate correct number of values for between operator', () => {
      const expression: FilterExpression = {
        condition: {
          field: { key: 'price', label: 'Price', type: 'number' },
          operator: { key: 'between', label: 'between' },
          value: {
            raw: [100, 500], // Correct: 2 values
            display: '100 and 500',
            serialized: '100,500',
          },
        },
      }

      const result = validateExpression(expression, schemaWithMultiValue)
      expect(result.valid).toBe(true)
    })

    it('should error when between has too few values', () => {
      const expression: FilterExpression = {
        condition: {
          field: { key: 'price', label: 'Price', type: 'number' },
          operator: { key: 'between', label: 'between' },
          value: {
            raw: [100], // Wrong: only 1 value
            display: '100',
            serialized: '100',
          },
        },
      }

      const result = validateExpression(expression, schemaWithMultiValue)
      expect(result.valid).toBe(false)
      expect(result.errors.some((e) => e.message.includes('requires exactly 2 values'))).toBe(true)
    })

    it('should error when between has too many values', () => {
      const expression: FilterExpression = {
        condition: {
          field: { key: 'price', label: 'Price', type: 'number' },
          operator: { key: 'between', label: 'between' },
          value: {
            raw: [100, 200, 300], // Wrong: 3 values
            display: '100, 200, 300',
            serialized: '100,200,300',
          },
        },
      }

      const result = validateExpression(expression, schemaWithMultiValue)
      expect(result.valid).toBe(false)
      expect(result.errors.some((e) => e.message.includes('requires exactly 2 values'))).toBe(true)
    })

    it('should accept any number of values when count is -1 (unlimited)', () => {
      const expression: FilterExpression = {
        condition: {
          field: { key: 'tags', label: 'Tags', type: 'enum' },
          operator: { key: 'in', label: 'in' },
          value: {
            raw: ['tag1', 'tag2', 'tag3', 'tag4', 'tag5'],
            display: 'tag1, tag2, tag3, tag4, tag5',
            serialized: 'tag1,tag2,tag3,tag4,tag5',
          },
        },
      }

      const result = validateExpression(expression, schemaWithMultiValue)
      expect(result.valid).toBe(true)
    })

    it('should require at least one value when count is -1 (unlimited)', () => {
      const expression: FilterExpression = {
        condition: {
          field: { key: 'tags', label: 'Tags', type: 'enum' },
          operator: { key: 'in', label: 'in' },
          value: {
            raw: [], // Empty array
            display: '',
            serialized: '',
          },
        },
      }

      const result = validateExpression(expression, schemaWithMultiValue)
      expect(result.valid).toBe(false)
      expect(result.errors.some((e) => e.message.includes('requires at least one value'))).toBe(
        true
      )
    })

    it('should validate non-array values for multi-value operators', () => {
      const expression: FilterExpression = {
        condition: {
          field: { key: 'price', label: 'Price', type: 'number' },
          operator: { key: 'between', label: 'between' },
          value: {
            raw: 100, // Wrong: should be an array
            display: '100',
            serialized: '100',
          },
        },
      }

      const result = validateExpression(expression, schemaWithMultiValue)
      expect(result.valid).toBe(false)
      expect(result.errors.some((e) => e.message.includes('must be an array'))).toBe(true)
    })

    it('should not apply multi-value validation to regular operators', () => {
      const expression: FilterExpression = {
        condition: {
          field: { key: 'price', label: 'Price', type: 'number' },
          operator: { key: 'eq', label: 'equals', symbol: '=' },
          value: {
            raw: 100, // Single value is fine
            display: '100',
            serialized: '100',
          },
        },
      }

      const result = validateExpression(expression, schemaWithMultiValue)
      expect(result.valid).toBe(true)
    })
  })

  describe('field-level validators', () => {
    it('should run field-level validator when provided', () => {
      const schemaWithFieldValidator: FilterSchema = {
        fields: [
          {
            key: 'email',
            label: 'Email',
            type: 'string',
            operators: [{ key: 'eq', label: 'equals' }],
            validate: (value) => {
              const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
              if (!emailRegex.test(String(value.raw))) {
                return {
                  valid: false,
                  errors: [{ type: 'value', message: 'Invalid email format' }],
                }
              }
              return { valid: true, errors: [] }
            },
          },
        ],
      }

      const invalidExpression: FilterExpression = {
        condition: {
          field: { key: 'email', label: 'Email', type: 'string' },
          operator: { key: 'eq', label: 'equals' },
          value: { raw: 'not-an-email', display: 'not-an-email', serialized: 'not-an-email' },
        },
      }

      const result = validateExpression(invalidExpression, schemaWithFieldValidator)
      expect(result.valid).toBe(false)
      expect(result.errors.some((e) => e.message.includes('Invalid email format'))).toBe(true)
    })

    it('should pass field-level validation for valid value', () => {
      const schemaWithFieldValidator: FilterSchema = {
        fields: [
          {
            key: 'email',
            label: 'Email',
            type: 'string',
            operators: [{ key: 'eq', label: 'equals' }],
            validate: (value) => {
              const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
              if (!emailRegex.test(String(value.raw))) {
                return {
                  valid: false,
                  errors: [{ type: 'value', message: 'Invalid email format' }],
                }
              }
              return { valid: true, errors: [] }
            },
          },
        ],
      }

      const validExpression: FilterExpression = {
        condition: {
          field: { key: 'email', label: 'Email', type: 'string' },
          operator: { key: 'eq', label: 'equals' },
          value: {
            raw: 'test@example.com',
            display: 'test@example.com',
            serialized: 'test@example.com',
          },
        },
      }

      const result = validateExpression(validExpression, schemaWithFieldValidator)
      expect(result.valid).toBe(true)
    })

    it('should provide validation context to field validator', () => {
      let capturedContext: unknown = null

      const schemaWithContext: FilterSchema = {
        fields: [
          {
            key: 'status',
            label: 'Status',
            type: 'enum',
            operators: [{ key: 'eq', label: 'equals' }],
            validate: (value, context) => {
              capturedContext = context
              return { valid: true, errors: [] }
            },
          },
        ],
      }

      const expression: FilterExpression = {
        condition: {
          field: { key: 'status', label: 'Status', type: 'enum' },
          operator: { key: 'eq', label: 'equals' },
          value: { raw: 'active', display: 'active', serialized: 'active' },
        },
      }

      validateExpression(expression, schemaWithContext)

      expect(capturedContext).not.toBeNull()
      expect((capturedContext as { field: { key: string } }).field.key).toBe('status')
      expect((capturedContext as { operator: { key: string } }).operator.key).toBe('eq')
      expect((capturedContext as { schema: FilterSchema }).schema).toBeDefined()
    })

    it('should combine field-level errors with other validation errors', () => {
      const schemaWithFieldValidator: FilterSchema = {
        fields: [
          {
            key: 'age',
            label: 'Age',
            type: 'number',
            operators: [
              { key: 'eq', label: 'equals' },
              { key: 'gt', label: 'greater than' },
            ],
            validate: (value) => {
              const num = Number(value.raw)
              if (num < 0 || num > 150) {
                return {
                  valid: false,
                  errors: [{ type: 'value', message: 'Age must be between 0 and 150' }],
                }
              }
              return { valid: true, errors: [] }
            },
          },
        ],
      }

      const invalidExpression: FilterExpression = {
        condition: {
          field: { key: 'age', label: 'Age', type: 'number' },
          operator: { key: 'invalid', label: 'invalid' }, // Invalid operator
          value: { raw: 200, display: '200', serialized: '200' }, // Also invalid value
        },
      }

      const result = validateExpression(invalidExpression, schemaWithFieldValidator)
      expect(result.valid).toBe(false)
      expect(result.errors.length).toBeGreaterThanOrEqual(2)
      expect(result.errors.some((e) => e.type === 'operator')).toBe(true)
      expect(result.errors.some((e) => e.message.includes('Age must be between'))).toBe(true)
    })
  })

  describe('schema-level validation', () => {
    it('should run schema-level validation function', () => {
      const schemaWithValidation: FilterSchema = {
        fields: [
          {
            key: 'startDate',
            label: 'Start Date',
            type: 'date',
            operators: [{ key: 'after', label: 'after' }],
          },
          {
            key: 'endDate',
            label: 'End Date',
            type: 'date',
            operators: [{ key: 'before', label: 'before' }],
          },
        ],
        validate: (expressions) => {
          // Custom validation: if both dates present, startDate must be before endDate
          const startExpr = expressions.find((e) => e.condition.field.key === 'startDate')
          const endExpr = expressions.find((e) => e.condition.field.key === 'endDate')

          if (startExpr && endExpr) {
            const start = new Date(startExpr.condition.value.raw as string)
            const end = new Date(endExpr.condition.value.raw as string)
            if (start >= end) {
              return {
                valid: false,
                errors: [
                  {
                    type: 'expression',
                    message: 'Start date must be before end date',
                  },
                ],
              }
            }
          }
          return { valid: true, errors: [] }
        },
      }

      // Invalid: start after end
      const expressions: FilterExpression[] = [
        {
          condition: {
            field: { key: 'startDate', label: 'Start Date', type: 'date' },
            operator: { key: 'after', label: 'after' },
            value: { raw: '2024-12-01', display: '2024-12-01', serialized: '2024-12-01' },
          },
          connector: 'AND',
        },
        {
          condition: {
            field: { key: 'endDate', label: 'End Date', type: 'date' },
            operator: { key: 'before', label: 'before' },
            value: { raw: '2024-01-01', display: '2024-01-01', serialized: '2024-01-01' },
          },
        },
      ]

      const result = validateExpressions(expressions, schemaWithValidation)
      expect(result.valid).toBe(false)
      expect(result.errors.some((e) => e.message.includes('before end date'))).toBe(true)
    })
  })
})
