/**
 * Schema Builder Tests
 */

import { describe, it, expect } from 'vitest'
import {
  createSchema,
  defineSchema,
  mergeSchemas,
  pickFields,
  omitFields,
  extendSchema,
} from './schemaBuilder'
import type { FilterSchema } from '@/types'

describe('schemaBuilder', () => {
  describe('createSchema', () => {
    it('should create a simple schema with fluent API', () => {
      const schema = createSchema()
        .field('name', 'Name')
        .type('string')
        .done()
        .build()

      expect(schema.fields).toHaveLength(1)
      expect(schema.fields[0].key).toBe('name')
      expect(schema.fields[0].label).toBe('Name')
      expect(schema.fields[0].type).toBe('string')
      expect(schema.fields[0].operators.length).toBeGreaterThan(0)
    })

    it('should create schema with multiple fields', () => {
      const schema = createSchema()
        .field('status', 'Status')
        .type('enum')
        .done()
        .field('age', 'Age')
        .type('number')
        .done()
        .build()

      expect(schema.fields).toHaveLength(2)
      expect(schema.fields[0].key).toBe('status')
      expect(schema.fields[1].key).toBe('age')
    })

    it('should support field description', () => {
      const schema = createSchema()
        .field('email', 'Email')
        .type('string')
        .description('User email address')
        .done()
        .build()

      expect(schema.fields[0].description).toBe('User email address')
    })

    it('should support field grouping', () => {
      const schema = createSchema()
        .field('firstName', 'First Name')
        .type('string')
        .group('Personal')
        .done()
        .field('lastName', 'Last Name')
        .type('string')
        .group('Personal')
        .done()
        .build()

      expect(schema.fields[0].group).toBe('Personal')
      expect(schema.fields[1].group).toBe('Personal')
    })

    it('should support custom operators by key', () => {
      const schema = createSchema()
        .field('name', 'Name')
        .type('string')
        .operators(['eq', 'contains'])
        .done()
        .build()

      expect(schema.fields[0].operators).toHaveLength(2)
      expect(schema.fields[0].operators.map((op) => op.key)).toEqual([
        'eq',
        'contains',
      ])
    })

    it('should support custom operator config', () => {
      const customOperators = [
        { key: 'custom', label: 'Custom Op', symbol: '~' },
      ]
      const schema = createSchema()
        .field('data', 'Data')
        .type('string')
        .operators(customOperators)
        .done()
        .build()

      expect(schema.fields[0].operators).toEqual(customOperators)
    })

    it('should support adding individual operators', () => {
      const schema = createSchema()
        .field('data', 'Data')
        .type('string')
        .operators(['eq'])
        .addOperator({ key: 'custom', label: 'Custom' })
        .done()
        .build()

      expect(schema.fields[0].operators.map((op) => op.key)).toContain('custom')
    })

    it('should support allowMultiple', () => {
      const schema = createSchema()
        .field('tag', 'Tag')
        .type('string')
        .allowMultiple(false)
        .done()
        .build()

      expect(schema.fields[0].allowMultiple).toBe(false)
    })

    it('should support max expressions', () => {
      const schema = createSchema()
        .field('name', 'Name')
        .type('string')
        .done()
        .max(5)
        .build()

      expect(schema.maxExpressions).toBe(5)
    })

    it('should support custom connectors', () => {
      const schema = createSchema()
        .field('name', 'Name')
        .type('string')
        .done()
        .withConnectors([
          { key: 'AND', label: 'And Also' },
          { key: 'OR', label: 'Or Else' },
        ])
        .build()

      expect(schema.connectors).toHaveLength(2)
      expect(schema.connectors?.[0].label).toBe('And Also')
    })

    it('should default to string type if not specified', () => {
      const schema = createSchema()
        .field('name', 'Name')
        .done()
        .build()

      expect(schema.fields[0].type).toBe('string')
    })
  })

  describe('defineSchema', () => {
    it('should return the same schema object', () => {
      const input: FilterSchema = {
        fields: [
          {
            key: 'test',
            label: 'Test',
            type: 'string',
            operators: [{ key: 'eq', label: 'equals' }],
          },
        ],
      }

      const result = defineSchema(input)
      expect(result).toBe(input)
    })
  })

  describe('mergeSchemas', () => {
    it('should merge fields from multiple schemas', () => {
      const schema1: FilterSchema = {
        fields: [
          {
            key: 'field1',
            label: 'Field 1',
            type: 'string',
            operators: [{ key: 'eq', label: 'equals' }],
          },
        ],
      }
      const schema2: FilterSchema = {
        fields: [
          {
            key: 'field2',
            label: 'Field 2',
            type: 'number',
            operators: [{ key: 'eq', label: 'equals' }],
          },
        ],
      }

      const merged = mergeSchemas(schema1, schema2)

      expect(merged.fields).toHaveLength(2)
      expect(merged.fields.map((f) => f.key)).toEqual(['field1', 'field2'])
    })

    it('should skip duplicate field keys', () => {
      const schema1: FilterSchema = {
        fields: [
          {
            key: 'duplicate',
            label: 'First',
            type: 'string',
            operators: [{ key: 'eq', label: 'equals' }],
          },
        ],
      }
      const schema2: FilterSchema = {
        fields: [
          {
            key: 'duplicate',
            label: 'Second',
            type: 'number',
            operators: [{ key: 'eq', label: 'equals' }],
          },
        ],
      }

      const merged = mergeSchemas(schema1, schema2)

      expect(merged.fields).toHaveLength(1)
      expect(merged.fields[0].label).toBe('First') // First one wins
    })

    it('should use last schema settings for maxExpressions', () => {
      const schema1: FilterSchema = { fields: [], maxExpressions: 5 }
      const schema2: FilterSchema = { fields: [], maxExpressions: 10 }

      const merged = mergeSchemas(schema1, schema2)

      expect(merged.maxExpressions).toBe(10)
    })
  })

  describe('pickFields', () => {
    it('should pick only specified fields', () => {
      const schema: FilterSchema = {
        fields: [
          {
            key: 'a',
            label: 'A',
            type: 'string',
            operators: [{ key: 'eq', label: 'equals' }],
          },
          {
            key: 'b',
            label: 'B',
            type: 'string',
            operators: [{ key: 'eq', label: 'equals' }],
          },
          {
            key: 'c',
            label: 'C',
            type: 'string',
            operators: [{ key: 'eq', label: 'equals' }],
          },
        ],
      }

      const picked = pickFields(schema, ['a', 'c'])

      expect(picked.fields).toHaveLength(2)
      expect(picked.fields.map((f) => f.key)).toEqual(['a', 'c'])
    })
  })

  describe('omitFields', () => {
    it('should omit specified fields', () => {
      const schema: FilterSchema = {
        fields: [
          {
            key: 'a',
            label: 'A',
            type: 'string',
            operators: [{ key: 'eq', label: 'equals' }],
          },
          {
            key: 'b',
            label: 'B',
            type: 'string',
            operators: [{ key: 'eq', label: 'equals' }],
          },
          {
            key: 'c',
            label: 'C',
            type: 'string',
            operators: [{ key: 'eq', label: 'equals' }],
          },
        ],
      }

      const omitted = omitFields(schema, ['b'])

      expect(omitted.fields).toHaveLength(2)
      expect(omitted.fields.map((f) => f.key)).toEqual(['a', 'c'])
    })
  })

  describe('extendSchema', () => {
    it('should add new fields to schema', () => {
      const base: FilterSchema = {
        fields: [
          {
            key: 'base',
            label: 'Base',
            type: 'string',
            operators: [{ key: 'eq', label: 'equals' }],
          },
        ],
      }

      const extended = extendSchema(base, {
        fields: [
          {
            key: 'new',
            label: 'New',
            type: 'number',
            operators: [{ key: 'eq', label: 'equals' }],
          },
        ],
      })

      expect(extended.fields).toHaveLength(2)
      expect(extended.fields.map((f) => f.key)).toEqual(['base', 'new'])
    })

    it('should override other properties', () => {
      const base: FilterSchema = {
        fields: [],
        maxExpressions: 5,
      }

      const extended = extendSchema(base, {
        maxExpressions: 10,
      })

      expect(extended.maxExpressions).toBe(10)
    })
  })
})
