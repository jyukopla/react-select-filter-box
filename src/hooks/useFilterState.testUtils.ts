import type { FilterSchema, FilterExpression, CustomAutocompleteWidget } from '@/types'
import React from 'react'

/**
 * Shared test utilities for useFilterState tests
 */

/**
 * Create a mock custom widget for testing
 */
export const createMockCustomWidget = (): CustomAutocompleteWidget => ({
  render: ({ onConfirm, onCancel, initialValue }) =>
    React.createElement(
      'div',
      { 'data-testid': 'mock-custom-widget' },
      React.createElement('button', {
        'data-testid': 'confirm-btn',
        onClick: () => onConfirm(initialValue ?? 'new-value', 'New Value'),
      }),
      React.createElement('button', {
        'data-testid': 'cancel-btn',
        onClick: onCancel,
      })
    ),
  serialize: (value: unknown) => String(value),
  parse: (serialized: string) => serialized,
})

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

/**
 * Create a test schema with a custom widget on an operator
 */
export const createTestSchemaWithCustomWidget = (
  customWidget: CustomAutocompleteWidget
): FilterSchema => ({
  fields: [
    {
      key: 'date',
      label: 'Date',
      type: 'date',
      operators: [
        { key: 'on', label: 'on', customInput: customWidget },
        { key: 'before', label: 'before', customInput: customWidget },
      ],
    },
    {
      key: 'status',
      label: 'Status',
      type: 'enum',
      operators: [
        { key: 'eq', label: 'equals', symbol: '=' },
        { key: 'neq', label: 'not equals', symbol: '≠' },
      ],
    },
  ],
})

/**
 * Create a test expression with custom widget field
 */
export const createExpressionWithCustomWidget = (): FilterExpression => ({
  condition: {
    field: { key: 'date', label: 'Date', type: 'date' as const },
    operator: { key: 'on', label: 'on' },
    value: { raw: '2025-01-15', display: 'Jan 15, 2025', serialized: '2025-01-15' },
  },
})
