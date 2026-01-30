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
})
