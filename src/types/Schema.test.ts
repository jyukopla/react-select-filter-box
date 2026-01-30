import { describe, expect, it } from 'vitest'
import {
  getDefaultOperators,
  STRING_OPERATORS,
  NUMBER_OPERATORS,
  DATE_OPERATORS,
  BOOLEAN_OPERATORS,
  ENUM_OPERATORS,
  ID_OPERATORS,
  DEFAULT_CONNECTORS,
} from './Schema'
import type { FieldType } from './Expression'

describe('Schema', () => {
  describe('DEFAULT_CONNECTORS', () => {
    it('should have AND and OR connectors', () => {
      expect(DEFAULT_CONNECTORS).toHaveLength(2)
      expect(DEFAULT_CONNECTORS[0]).toEqual({ key: 'AND', label: 'AND' })
      expect(DEFAULT_CONNECTORS[1]).toEqual({ key: 'OR', label: 'OR' })
    })
  })

  describe('STRING_OPERATORS', () => {
    it('should include common string operators', () => {
      const keys = STRING_OPERATORS.map((op) => op.key)
      expect(keys).toContain('eq')
      expect(keys).toContain('neq')
      expect(keys).toContain('contains')
      expect(keys).toContain('startsWith')
      expect(keys).toContain('endsWith')
      expect(keys).toContain('like')
    })

    it('should have symbols for equality operators', () => {
      const eq = STRING_OPERATORS.find((op) => op.key === 'eq')
      const neq = STRING_OPERATORS.find((op) => op.key === 'neq')
      expect(eq?.symbol).toBe('=')
      expect(neq?.symbol).toBe('≠')
    })
  })

  describe('NUMBER_OPERATORS', () => {
    it('should include comparison operators', () => {
      const keys = NUMBER_OPERATORS.map((op) => op.key)
      expect(keys).toContain('eq')
      expect(keys).toContain('neq')
      expect(keys).toContain('gt')
      expect(keys).toContain('gte')
      expect(keys).toContain('lt')
      expect(keys).toContain('lte')
      expect(keys).toContain('between')
    })

    it('should have multiValue config for between operator', () => {
      const between = NUMBER_OPERATORS.find((op) => op.key === 'between')
      expect(between?.multiValue).toBeDefined()
      expect(between?.multiValue?.count).toBe(2)
      expect(between?.multiValue?.separator).toBe('and')
    })
  })

  describe('DATE_OPERATORS', () => {
    it('should include date comparison operators', () => {
      const keys = DATE_OPERATORS.map((op) => op.key)
      expect(keys).toContain('before')
      expect(keys).toContain('after')
      expect(keys).toContain('on')
      expect(keys).toContain('between')
    })
  })

  describe('BOOLEAN_OPERATORS', () => {
    it('should include is operator', () => {
      expect(BOOLEAN_OPERATORS).toHaveLength(1)
      expect(BOOLEAN_OPERATORS[0]?.key).toBe('is')
    })
  })

  describe('ENUM_OPERATORS', () => {
    it('should include eq, neq, and in operators', () => {
      const keys = ENUM_OPERATORS.map((op) => op.key)
      expect(keys).toContain('eq')
      expect(keys).toContain('neq')
      expect(keys).toContain('in')
    })

    it('should have multiValue config for in operator with unlimited count', () => {
      const inOp = ENUM_OPERATORS.find((op) => op.key === 'in')
      expect(inOp?.multiValue).toBeDefined()
      expect(inOp?.multiValue?.count).toBe(-1)
    })
  })

  describe('ID_OPERATORS', () => {
    it('should include eq and in operators', () => {
      const keys = ID_OPERATORS.map((op) => op.key)
      expect(keys).toContain('eq')
      expect(keys).toContain('in')
    })
  })

  describe('getDefaultOperators', () => {
    it('should return STRING_OPERATORS for string type', () => {
      expect(getDefaultOperators('string')).toBe(STRING_OPERATORS)
    })

    it('should return NUMBER_OPERATORS for number type', () => {
      expect(getDefaultOperators('number')).toBe(NUMBER_OPERATORS)
    })

    it('should return DATE_OPERATORS for date type', () => {
      expect(getDefaultOperators('date')).toBe(DATE_OPERATORS)
    })

    it('should return DATE_OPERATORS for datetime type', () => {
      expect(getDefaultOperators('datetime')).toBe(DATE_OPERATORS)
    })

    it('should return BOOLEAN_OPERATORS for boolean type', () => {
      expect(getDefaultOperators('boolean')).toBe(BOOLEAN_OPERATORS)
    })

    it('should return ENUM_OPERATORS for enum type', () => {
      expect(getDefaultOperators('enum')).toBe(ENUM_OPERATORS)
    })

    it('should return ID_OPERATORS for id type', () => {
      expect(getDefaultOperators('id')).toBe(ID_OPERATORS)
    })

    it('should return STRING_OPERATORS for custom type', () => {
      expect(getDefaultOperators('custom')).toBe(STRING_OPERATORS)
    })

    it('should return STRING_OPERATORS for unknown type', () => {
      expect(getDefaultOperators('unknown' as FieldType)).toBe(STRING_OPERATORS)
    })
  })
})
