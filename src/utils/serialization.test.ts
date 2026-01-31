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

    it('should use custom field formatter', () => {
      const expressions: FilterExpression[] = [
        {
          condition: {
            field: { key: 'startDate', label: 'Start Date', type: 'date' },
            operator: { key: 'before', label: 'before' },
            value: { raw: '2024-01-15', display: '2024-01-15', serialized: '2024-01-15' },
          },
        },
      ]

      const result = toDisplayString(expressions, {
        formatField: (field) => field.label.toUpperCase(),
      })

      expect(result).toBe('START DATE before 2024-01-15')
    })

    it('should use custom operator formatter', () => {
      const expressions: FilterExpression[] = [
        {
          condition: {
            field: { key: 'status', label: 'Status', type: 'enum' },
            operator: { key: 'eq', label: 'equals', symbol: '=' },
            value: { raw: 'active', display: 'Active', serialized: 'active' },
          },
        },
      ]

      const result = toDisplayString(expressions, {
        formatOperator: (operator) => operator.symbol || operator.label,
      })

      expect(result).toBe('Status = Active')
    })

    it('should use custom value formatter', () => {
      const expressions: FilterExpression[] = [
        {
          condition: {
            field: { key: 'startDate', label: 'Started', type: 'date' },
            operator: { key: 'before', label: 'before' },
            value: { raw: '2024-01-15T00:00:00.000Z', display: '2024-01-15', serialized: '2024-01-15T00:00:00.000Z' },
          },
        },
      ]

      const result = toDisplayString(expressions, {
        formatValue: (value, field) => {
          if (field.type === 'date') {
            return new Date(String(value.raw)).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })
          }
          return value.display
        },
      })

      expect(result).toBe('Started before Jan 15, 2024')
    })

    it('should use custom connector formatter', () => {
      const expressions: FilterExpression[] = [
        {
          condition: {
            field: { key: 'status', label: 'Status', type: 'enum' },
            operator: { key: 'eq', label: 'is' },
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

      const result = toDisplayString(expressions, {
        formatConnector: (connector) => connector.toLowerCase(),
      })

      expect(result).toBe('Status is Active and Name contains John')
    })

    it('should combine multiple custom formatters', () => {
      const expressions: FilterExpression[] = [
        {
          condition: {
            field: { key: 'status', label: 'Status', type: 'enum' },
            operator: { key: 'eq', label: 'equals', symbol: '=' },
            value: { raw: 'active', display: 'Active', serialized: 'active' },
          },
          connector: 'AND',
        },
        {
          condition: {
            field: { key: 'count', label: 'Count', type: 'number' },
            operator: { key: 'gt', label: 'greater than', symbol: '>' },
            value: { raw: 10, display: '10', serialized: '10' },
          },
        },
      ]

      const result = toDisplayString(expressions, {
        formatField: (field) => `[${field.label}]`,
        formatOperator: (operator) => operator.symbol || operator.label,
        formatValue: (value) => `"${value.display}"`,
        formatConnector: (connector) => `&&`,
      })

      expect(result).toBe('[Status] = "Active" && [Count] > "10"')
    })

    it('should use custom expression formatter to override entire expression', () => {
      const expressions: FilterExpression[] = [
        {
          condition: {
            field: { key: 'status', label: 'Status', type: 'enum' },
            operator: { key: 'eq', label: 'is' },
            value: { raw: 'active', display: 'Active', serialized: 'active' },
          },
        },
      ]

      const result = toDisplayString(expressions, {
        formatExpression: (expr) => {
          return `${expr.condition.field.key}=${expr.condition.value.raw}`
        },
      })

      expect(result).toBe('status=active')
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

  describe('custom field serialization', () => {
    const schemaWithCustomSerializers: FilterSchema = {
      fields: [
        {
          key: 'date',
          label: 'Date',
          type: 'date',
          operators: [
            { key: 'eq', label: 'on', symbol: '=' },
            { key: 'before', label: 'before', symbol: '<' },
          ],
          // Custom serializer: convert Date to ISO string
          serialize: (value) => {
            if (value.raw instanceof Date) {
              return value.raw.toISOString()
            }
            return value.serialized
          },
          // Custom deserializer: convert ISO string back to proper ConditionValue
          deserialize: (serialized) => {
            const date = new Date(serialized as string)
            const display = date.toLocaleDateString()
            return {
              raw: date,
              display,
              serialized: date.toISOString(),
            }
          },
        },
        {
          key: 'price',
          label: 'Price',
          type: 'number',
          operators: [
            { key: 'eq', label: 'is', symbol: '=' },
            { key: 'gt', label: 'above', symbol: '>' },
          ],
          // Custom serializer: convert to cents for API
          serialize: (value) => {
            const dollars = typeof value.raw === 'number' ? value.raw : parseFloat(String(value.raw))
            return Math.round(dollars * 100) // cents
          },
          // Custom deserializer: convert cents back to dollars
          deserialize: (serialized) => {
            const cents = serialized as number
            const dollars = cents / 100
            return {
              raw: dollars,
              display: `$${dollars.toFixed(2)}`,
              serialized: dollars.toString(),
            }
          },
        },
        {
          key: 'status',
          label: 'Status',
          type: 'enum',
          operators: [{ key: 'eq', label: 'is', symbol: '=' }],
          // No custom serializer - uses default
        },
      ],
    }

    it('should use custom field serializer when serializing', () => {
      const expressions: FilterExpression[] = [
        {
          condition: {
            field: { key: 'date', label: 'Date', type: 'date' },
            operator: { key: 'eq', label: 'on', symbol: '=' },
            value: {
              raw: new Date('2024-06-15T00:00:00.000Z'),
              display: '2024-06-15',
              serialized: '2024-06-15',
            },
          },
        },
      ]

      const result = serialize(expressions, schemaWithCustomSerializers)

      expect(result).toHaveLength(1)
      expect(result[0]?.value).toBe('2024-06-15T00:00:00.000Z')
    })

    it('should use custom field serializer for price (dollars to cents)', () => {
      const expressions: FilterExpression[] = [
        {
          condition: {
            field: { key: 'price', label: 'Price', type: 'number' },
            operator: { key: 'gt', label: 'above', symbol: '>' },
            value: {
              raw: 19.99,
              display: '$19.99',
              serialized: '19.99',
            },
          },
        },
      ]

      const result = serialize(expressions, schemaWithCustomSerializers)

      expect(result).toHaveLength(1)
      expect(result[0]?.value).toBe(1999) // cents
    })

    it('should use default serialization when no custom serializer', () => {
      const expressions: FilterExpression[] = [
        {
          condition: {
            field: { key: 'status', label: 'Status', type: 'enum' },
            operator: { key: 'eq', label: 'is', symbol: '=' },
            value: { raw: 'active', display: 'Active', serialized: 'active' },
          },
        },
      ]

      const result = serialize(expressions, schemaWithCustomSerializers)

      expect(result).toHaveLength(1)
      expect(result[0]?.value).toBe('active')
    })

    it('should use custom field deserializer when deserializing', () => {
      const serialized = [
        { field: 'date', operator: 'eq', value: '2024-06-15T00:00:00.000Z' },
      ]

      const result = deserialize(serialized, schemaWithCustomSerializers)

      expect(result).toHaveLength(1)
      expect(result[0]?.condition.value.raw).toBeInstanceOf(Date)
      expect((result[0]?.condition.value.raw as Date).getFullYear()).toBe(2024)
    })

    it('should use custom field deserializer for price (cents to dollars)', () => {
      const serialized = [
        { field: 'price', operator: 'gt', value: 1999 },
      ]

      const result = deserialize(serialized, schemaWithCustomSerializers)

      expect(result).toHaveLength(1)
      expect(result[0]?.condition.value.raw).toBe(19.99)
      expect(result[0]?.condition.value.display).toBe('$19.99')
    })

    it('should allow disabling custom serializers via options', () => {
      const expressions: FilterExpression[] = [
        {
          condition: {
            field: { key: 'price', label: 'Price', type: 'number' },
            operator: { key: 'eq', label: 'is', symbol: '=' },
            value: {
              raw: 10.00,
              display: '$10.00',
              serialized: '10.00',
            },
          },
        },
      ]

      const result = serialize(expressions, schemaWithCustomSerializers, { useFieldSerializers: false })

      expect(result[0]?.value).toBe('10.00') // Not converted to cents
    })

    it('should allow disabling custom deserializers via options', () => {
      const serialized = [
        { field: 'price', operator: 'gt', value: 500 },
      ]

      const result = deserialize(serialized, schemaWithCustomSerializers, { useFieldDeserializers: false })

      expect(result[0]?.condition.value.raw).toBe(500) // Not converted from cents
      expect(result[0]?.condition.value.display).toBe('500')
    })
  })

  describe('schema-level serialization', () => {
    const schemaWithSchemaSerializer: FilterSchema = {
      fields: [
        {
          key: 'status',
          label: 'Status',
          type: 'enum',
          operators: [{ key: 'eq', label: 'is', symbol: '=' }],
        },
        {
          key: 'name',
          label: 'Name',
          type: 'string',
          operators: [{ key: 'contains', label: 'contains' }],
        },
      ],
      // Schema-level serializer: custom format
      serialize: (expressions) => {
        return expressions.map((expr) => ({
          f: expr.condition.field.key,
          o: expr.condition.operator.key,
          v: expr.condition.value.serialized,
          c: expr.connector,
        }))
      },
      // Schema-level deserializer: custom format
      deserialize: (data) => {
        const items = data as Array<{ f: string; o: string; v: string; c?: 'AND' | 'OR' }>
        return items.map((item) => ({
          condition: {
            field: { key: item.f, label: item.f, type: 'string' as const },
            operator: { key: item.o, label: item.o },
            value: { raw: item.v, display: item.v, serialized: item.v },
          },
          connector: item.c,
        }))
      },
    }

    it('should use schema-level serializer when available', () => {
      const expressions: FilterExpression[] = [
        {
          condition: {
            field: { key: 'status', label: 'Status', type: 'enum' },
            operator: { key: 'eq', label: 'is', symbol: '=' },
            value: { raw: 'active', display: 'active', serialized: 'active' },
          },
        },
      ]

      const result = serialize(expressions, schemaWithSchemaSerializer)

      expect(result).toHaveLength(1)
      expect(result[0]).toEqual({ f: 'status', o: 'eq', v: 'active', c: undefined })
    })

    it('should use schema-level deserializer when available', () => {
      const data = [{ f: 'status', o: 'eq', v: 'active' }]

      const result = deserialize(data as any, schemaWithSchemaSerializer)

      expect(result).toHaveLength(1)
      expect(result[0]?.condition.field.key).toBe('status')
      expect(result[0]?.condition.value.raw).toBe('active')
    })

    it('should allow disabling schema-level serializer via options', () => {
      const expressions: FilterExpression[] = [
        {
          condition: {
            field: { key: 'status', label: 'Status', type: 'enum' },
            operator: { key: 'eq', label: 'is', symbol: '=' },
            value: { raw: 'active', display: 'active', serialized: 'active' },
          },
        },
      ]

      // Without schema serializer, should return standard format
      const result = serialize(expressions, schemaWithSchemaSerializer, { useSchemaSerializer: false })

      expect(result).toHaveLength(1)
      expect(result[0]).toEqual({ field: 'status', operator: 'eq', value: 'active' })
    })
  })

  describe('Serialization Roundtrip Integration', () => {
    it('should roundtrip single expression through serialize/deserialize', () => {
      const original: FilterExpression[] = [
        {
          condition: {
            field: { key: 'status', label: 'Status', type: 'enum' },
            operator: { key: 'eq', label: 'is', symbol: '=' },
            value: { raw: 'active', display: 'active', serialized: 'active' },
          },
        },
      ]

      const serialized = serialize(original)
      const deserialized = deserialize(serialized, testSchema)

      expect(deserialized).toHaveLength(1)
      expect(deserialized[0]?.condition.field.key).toBe(original[0]?.condition.field.key)
      expect(deserialized[0]?.condition.operator.key).toBe(original[0]?.condition.operator.key)
      expect(deserialized[0]?.condition.value.raw).toBe(original[0]?.condition.value.raw)
    })

    it('should roundtrip multiple expressions with AND connector', () => {
      const original: FilterExpression[] = [
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

      const serialized = serialize(original)
      const deserialized = deserialize(serialized, testSchema)

      expect(deserialized).toHaveLength(2)
      expect(deserialized[0]?.connector).toBe('AND')
      expect(deserialized[1]?.condition.field.key).toBe('name')
    })

    it('should roundtrip expressions through query string format', () => {
      const original: FilterExpression[] = [
        {
          condition: {
            field: { key: 'status', label: 'Status', type: 'enum' },
            operator: { key: 'eq', label: 'is', symbol: '=' },
            value: { raw: 'active', display: 'active', serialized: 'active' },
          },
        },
      ]

      const queryString = toQueryString(original)
      const parsed = fromQueryString(queryString, testSchema)

      expect(parsed).toHaveLength(1)
      expect(parsed[0]?.condition.field.key).toBe('status')
      expect(parsed[0]?.condition.value.raw).toBe('active')
    })

    it('should preserve data integrity through JSON stringify/parse', () => {
      const original: FilterExpression[] = [
        {
          condition: {
            field: { key: 'age', label: 'Age', type: 'number' },
            operator: { key: 'gt', label: 'greater than', symbol: '>' },
            value: { raw: '25', display: '25', serialized: '25' },
          },
        },
      ]

      const serialized = serialize(original)
      const jsonString = JSON.stringify(serialized)
      const parsed = JSON.parse(jsonString)
      const deserialized = deserialize(parsed, testSchema)

      expect(deserialized).toHaveLength(1)
      expect(deserialized[0]?.condition.field.key).toBe('age')
      expect(deserialized[0]?.condition.value.raw).toBe('25')
    })
  })
})
