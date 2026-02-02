/**
 * Tests for connector deletion bug
 *
 * Issue: When deleting a connector using backspace, it also deletes the expression
 * visually before the connector.
 */

import { describe, it, expect, vi } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { useFilterState } from './useFilterState'
import type { FilterSchema, FilterExpression } from '@/types'

describe('useFilterState - Connector Deletion', () => {
  const schema: FilterSchema = {
    fields: [
      {
        key: 'status',
        label: 'Status',
        type: 'string',
        operators: [{ key: 'eq', label: 'equals', symbol: '=' }],
      },
      {
        key: 'name',
        label: 'Name',
        type: 'string',
        operators: [{ key: 'eq', label: 'equals', symbol: '=' }],
      },
    ],
  }

  it('should only remove connector when deleting connector token, not entire expression', async () => {
    const onChange = vi.fn()
    const expressions: FilterExpression[] = [
      {
        condition: {
          field: { key: 'status', label: 'Status', type: 'string' },
          operator: { key: 'eq', label: 'equals', symbol: '=' },
          value: { raw: 'active', display: 'active', serialized: 'active' },
        },
        connector: 'AND', // This connector connects to the next expression
      },
      {
        condition: {
          field: { key: 'name', label: 'Name', type: 'string' },
          operator: { key: 'eq', label: 'equals', symbol: '=' },
          value: { raw: 'test', display: 'test', serialized: 'test' },
        },
      },
    ]

    const { result } = renderHook(() =>
      useFilterState({
        schema,
        value: expressions,
        onChange,
      })
    )

    // Find the connector token (should be at index 3: field, operator, value, connector)
    const connectorToken = result.current.tokens.find((t) => t.type === 'connector')
    expect(connectorToken).toBeDefined()
    expect(connectorToken?.type).toBe('connector')

    // The connector belongs to expression 0
    expect(connectorToken?.expressionIndex).toBe(0)

    // Simulate arrow-key selection of connector token
    const connectorTokenIndex = result.current.tokens.findIndex((t) => t.type === 'connector')

    // Simulate keyboard selection (ArrowLeft until connector is selected)
    act(() => {
      const event = new KeyboardEvent('keydown', {
        key: 'ArrowLeft',
      }) as unknown as React.KeyboardEvent<HTMLInputElement>
      result.current.handleKeyDown(event)
    })

    await waitFor(() => {
      expect(result.current.selectedTokenIndex).toBeGreaterThanOrEqual(0)
    })

    // Keep pressing ArrowLeft until connector is selected
    while (result.current.selectedTokenIndex !== connectorTokenIndex) {
      act(() => {
        const event = new KeyboardEvent('keydown', {
          key: 'ArrowLeft',
        }) as unknown as React.KeyboardEvent<HTMLInputElement>
        result.current.handleKeyDown(event)
      })
    }

    expect(result.current.selectedTokenIndex).toBe(connectorTokenIndex)

    // Now press Backspace to delete the connector
    act(() => {
      const event = new KeyboardEvent('keydown', {
        key: 'Backspace',
        bubbles: true,
      }) as unknown as React.KeyboardEvent<HTMLInputElement>
      event.preventDefault = vi.fn()
      result.current.handleKeyDown(event)
    })

    // The connector should be removed, but both expressions should remain
    await waitFor(() => {
      const call = onChange.mock.calls[onChange.mock.calls.length - 1]
      const newExpressions = call?.[0]

      // Should have 2 expressions
      expect(newExpressions).toHaveLength(2)

      // First expression should NOT have a connector
      expect(newExpressions[0].connector).toBeUndefined()

      // Both expressions should still have their original fields
      expect(newExpressions[0].condition.field.key).toBe('status')
      expect(newExpressions[1].condition.field.key).toBe('name')
    })
  })

  it('should handle Backspace on connector in selecting-connector state', () => {
    const onChange = vi.fn()
    const expressions: FilterExpression[] = [
      {
        condition: {
          field: { key: 'status', label: 'Status', type: 'string' },
          operator: { key: 'eq', label: 'equals', symbol: '=' },
          value: { raw: 'active', display: 'active', serialized: 'active' },
        },
        connector: 'AND',
      },
      {
        condition: {
          field: { key: 'name', label: 'Name', type: 'string' },
          operator: { key: 'eq', label: 'equals', symbol: '=' },
          value: { raw: 'test', display: 'test', serialized: 'test' },
        },
      },
    ]

    const { result: _result } = renderHook(() =>
      useFilterState({
        schema,
        value: expressions,
        onChange,
      })
    )

    // When in selecting-connector state with empty input, Backspace should go back to previous state
    // This is the machine's DELETE_LAST behavior
    // But it shouldn't delete an entire expression just because a connector exists
  })
})
