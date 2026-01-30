import { describe, it, expect } from 'vitest'
import {
  validateExpression,
  validateExpressions,
  validateSchema,
  type ValidationResult,
} from './validation'
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
      expect(result.errors.some(e => e.message.includes('can only be used once'))).toBe(true)
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
      const uniqueError = result.errors.find(e => e.message.includes('can only be used once'))
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
      expect(result.errors.some(e => e.message.includes('Maximum of 2 expressions'))).toBe(true)
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
          const startExpr = expressions.find(e => e.condition.field.key === 'startDate')
          const endExpr = expressions.find(e => e.condition.field.key === 'endDate')
          
          if (startExpr && endExpr) {
            const start = new Date(startExpr.condition.value.raw as string)
            const end = new Date(endExpr.condition.value.raw as string)
            if (start >= end) {
              return {
                valid: false,
                errors: [{
                  type: 'expression',
                  message: 'Start date must be before end date',
                }],
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
      expect(result.errors.some(e => e.message.includes('before end date'))).toBe(true)
    })
  })
})
