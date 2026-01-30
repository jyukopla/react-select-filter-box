import { describe, it, expect } from 'vitest'
import {
  serialize,
  deserialize,
  toDisplayString,
  toQueryString,
  fromQueryString,
} from './serialization'
import type { FilterExpression, FilterSchema } from '@/types'

const testSchema: FilterSchema = {
  fields: [
    {
      key: 'status',
      label: 'Status',
      type: 'enum',
      operators: [
        { key: 'eq', label: 'is', symbol: '=' },
        { key: 'neq', label: 'is not', symbol: '!=' },
      ],
    },
    {
      key: 'name',
      label: 'Name',
      type: 'string',
      operators: [
        { key: 'contains', label: 'contains' },
        { key: 'eq', label: 'equals', symbol: '=' },
      ],
    },
    {
      key: 'age',
      label: 'Age',
      type: 'number',
      operators: [
        { key: 'gt', label: 'greater than', symbol: '>' },
        { key: 'lt', label: 'less than', symbol: '<' },
      ],
    },
  ],
}

describe('Serialization', () => {
  describe('serialize', () => {
    it('should serialize a single expression', () => {
      const expressions: FilterExpression[] = [
        {
          condition: {
            field: { key: 'status', label: 'Status', type: 'enum' },
            operator: { key: 'eq', label: 'is', symbol: '=' },
            value: { raw: 'active', display: 'active', serialized: 'active' },
          },
        },
      ]

      const result = serialize(expressions)

      expect(result).toEqual([
        { field: 'status', operator: 'eq', value: 'active' },
      ])
    })

    it('should serialize multiple expressions with connectors', () => {
      const expressions: FilterExpression[] = [
        {
          condition: {
            field: { key: 'status', label: 'Status', type: 'enum' },
            operator: { key: 'eq', label: 'is', symbol: '=' },
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
        },
      ]

      const result = serialize(expressions)

      expect(result).toEqual([
        { field: 'status', operator: 'eq', value: 'active', connector: 'AND' },
        { field: 'name', operator: 'contains', value: 'John' },
      ])
    })

    it('should return empty array for empty expressions', () => {
      expect(serialize([])).toEqual([])
    })
  })

  describe('deserialize', () => {
    it('should deserialize a single expression', () => {
      const serialized = [{ field: 'status', operator: 'eq', value: 'active' }]

      const result = deserialize(serialized, testSchema)

      expect(result).toHaveLength(1)
      expect(result[0]?.condition.field.key).toBe('status')
      expect(result[0]?.condition.operator.key).toBe('eq')
      expect(result[0]?.condition.value.raw).toBe('active')
    })

    it('should deserialize multiple expressions with connectors', () => {
      const serialized = [
        { field: 'status', operator: 'eq', value: 'active', connector: 'AND' as const },
        { field: 'name', operator: 'contains', value: 'John' },
      ]

      const result = deserialize(serialized, testSchema)

      expect(result).toHaveLength(2)
      expect(result[0]?.connector).toBe('AND')
      expect(result[1]?.connector).toBeUndefined()
    })

    it('should throw for unknown field', () => {
      const serialized = [{ field: 'unknown', operator: 'eq', value: 'test' }]

      expect(() => deserialize(serialized, testSchema)).toThrow('Unknown field: unknown')
    })

    it('should throw for unknown operator', () => {
      const serialized = [{ field: 'status', operator: 'unknown', value: 'test' }]

      expect(() => deserialize(serialized, testSchema)).toThrow('Unknown operator: unknown')
    })
  })

  describe('toDisplayString', () => {
    it('should generate human-readable string for single expression', () => {
      const expressions: FilterExpression[] = [
        {
          condition: {
            field: { key: 'status', label: 'Status', type: 'enum' },
            operator: { key: 'eq', label: 'is', symbol: '=' },
            value: { raw: 'active', display: 'Active', serialized: 'active' },
          },
        },
      ]

      const result = toDisplayString(expressions)

      expect(result).toBe('Status is Active')
    })

    it('should generate string for multiple expressions', () => {
      const expressions: FilterExpression[] = [
        {
          condition: {
            field: { key: 'status', label: 'Status', type: 'enum' },
            operator: { key: 'eq', label: 'is', symbol: '=' },
            value: { raw: 'active', display: 'Active', serialized: 'active' },
          },
          connector: 'AND',
        },
        {
          condition: {
            field: { key: 'name', label: 'Name', type: 'string' },
            operator: { key: 'contains', label: 'contains' },
            value: { raw: 'John', display: 'John', serialized: 'John' },
          },
        },
      ]

      const result = toDisplayString(expressions)

      expect(result).toBe('Status is Active AND Name contains John')
    })

    it('should return empty string for empty expressions', () => {
      expect(toDisplayString([])).toBe('')
    })
  })

  describe('toQueryString', () => {
    it('should generate query string for single expression', () => {
      const expressions: FilterExpression[] = [
        {
          condition: {
            field: { key: 'status', label: 'Status', type: 'enum' },
            operator: { key: 'eq', label: 'is', symbol: '=' },
            value: { raw: 'active', display: 'active', serialized: 'active' },
          },
        },
      ]

      const result = toQueryString(expressions)

      expect(result).toBe('status=active')
    })

    it('should encode special characters', () => {
      const expressions: FilterExpression[] = [
        {
          condition: {
            field: { key: 'name', label: 'Name', type: 'string' },
            operator: { key: 'contains', label: 'contains' },
            value: { raw: 'John Doe', display: 'John Doe', serialized: 'John Doe' },
          },
        },
      ]

      const result = toQueryString(expressions)

      // URLSearchParams uses + for spaces (valid URL encoding)
      expect(result).toBe('name=John+Doe')
    })

    it('should handle multiple expressions', () => {
      const expressions: FilterExpression[] = [
        {
          condition: {
            field: { key: 'status', label: 'Status', type: 'enum' },
            operator: { key: 'eq', label: 'is', symbol: '=' },
            value: { raw: 'active', display: 'active', serialized: 'active' },
          },
          connector: 'AND',
        },
        {
          condition: {
            field: { key: 'age', label: 'Age', type: 'number' },
            operator: { key: 'gt', label: 'greater than', symbol: '>' },
            value: { raw: 25, display: '25', serialized: '25' },
          },
        },
      ]

      const result = toQueryString(expressions)

      expect(result).toBe('status=active&age=25')
    })
  })

  describe('fromQueryString', () => {
    it('should parse simple query string', () => {
      const queryString = 'status=active'

      const result = fromQueryString(queryString, testSchema)

      expect(result).toHaveLength(1)
      expect(result[0]?.condition.field.key).toBe('status')
      expect(result[0]?.condition.value.raw).toBe('active')
    })

    it('should parse multiple params', () => {
      const queryString = 'status=active&name=John'

      const result = fromQueryString(queryString, testSchema)

      expect(result).toHaveLength(2)
    })

    it('should decode URL encoded values', () => {
      const queryString = 'name=John%20Doe'

      const result = fromQueryString(queryString, testSchema)

      expect(result[0]?.condition.value.raw).toBe('John Doe')
    })

    it('should skip unknown fields', () => {
      const queryString = 'unknown=value&status=active'

      const result = fromQueryString(queryString, testSchema)

      expect(result).toHaveLength(1)
      expect(result[0]?.condition.field.key).toBe('status')
    })
  })
})
