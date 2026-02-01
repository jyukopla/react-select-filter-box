import type { FilterSchema, FilterExpression } from '@/types'

/**
 * Shared test utilities for useFilterState tests
 */

export const createTestSchema = (): FilterSchema => ({
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
})

export const createExpressionValue = (): FilterExpression => ({
  condition: {
    field: { key: 'status', label: 'Status', type: 'enum' as const },
    operator: { key: 'eq', label: 'equals', symbol: '=' },
    value: { raw: 'active', display: 'Active', serialized: 'active' },
  },
})

export const createExpressionWithConnector = (): FilterExpression => ({
  condition: {
    field: { key: 'status', label: 'Status', type: 'enum' as const },
    operator: { key: 'eq', label: 'equals', symbol: '=' },
    value: { raw: 'active', display: 'Active', serialized: 'active' },
  },
  connector: 'AND',
})

