/**
 * Tests for expression deletion bug fix
 *
 * Issue: After deleting the last expression with Backspace/Delete, the state
 * remains in 'selecting-connector' and the connector placeholder is shown,
 * preventing the user from adding a new expression without blurring and focusing again.
 *
 * Expected behavior: After deleting the last expression, state should return to 'idle'.
 */

import { describe, it, expect, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useFilterState } from './useFilterState'
import type { FilterSchema } from '@/types'

describe('Expression Deletion State Reset', () => {
  const schema: FilterSchema = {
    fields: [
      {
        key: 'processInstanceId',
        label: 'Process Instance ID',
        type: 'id',
        operators: [{ key: 'eq', label: 'equals', symbol: '=' }],
      },
      {
        key: 'status',
        label: 'Status',
        type: 'string',
        operators: [{ key: 'eq', label: 'equals', symbol: '=' }],
      },
    ],
  }

  it('should reset to idle state after deleting the last expression with Backspace', () => {
    const onChange = vi.fn()
    const initialValue = [
      {
        condition: {
          field: { key: 'processInstanceId', label: 'Process Instance ID', type: 'id' },
          operator: { key: 'eq', label: 'equals', symbol: '=' },
          value: { raw: '12345', display: '12345', serialized: '12345' },
        },
      },
    ]

    const { result } = renderHook(() =>
      useFilterState({
        schema,
        value: initialValue,
        onChange,
      })
    )

    // Initial state should be idle (not actively editing)
    expect(result.current.state).toBe('idle')
    
    // Focus to start interaction
    act(() => {
      result.current.handleFocus()
    })
    // After focusing with existing expressions, state goes to selecting-connector
    expect(result.current.state).toBe('selecting-connector')

    // Press Backspace once to select the last token
    act(() => {
      result.current.handleKeyDown(
        new KeyboardEvent('keydown', { key: 'Backspace' }) as unknown as React.KeyboardEvent
      )
    })
    expect(result.current.selectedTokenIndex).toBeGreaterThanOrEqual(0)

    // Press Backspace again to delete the expression
    act(() => {
      result.current.handleKeyDown(
        new KeyboardEvent('keydown', { key: 'Backspace' }) as unknown as React.KeyboardEvent
      )
    })

    // Bug fix: State should now be 'idle', not stuck in 'selecting-connector'
    expect(result.current.state).toBe('idle')
    expect(result.current.placeholder).toBe('Add filter...')
    expect(onChange).toHaveBeenLastCalledWith([])
  })

  it('should reset to idle state after deleting the last expression with Delete key', () => {
    const onChange = vi.fn()
    const initialValue = [
      {
        condition: {
          field: { key: 'status', label: 'Status', type: 'string' },
          operator: { key: 'eq', label: 'equals', symbol: '=' },
          value: { raw: 'test', display: 'test', serialized: 'test' },
        },
      },
    ]

    const { result } = renderHook(() =>
      useFilterState({
        schema,
        value: initialValue,
        onChange,
      })
    )

    expect(result.current.state).toBe('idle')
    
    // Focus to enable interaction
    act(() => {
      result.current.handleFocus()
    })
    expect(result.current.state).toBe('selecting-connector')

    // Select the token
    act(() => {
      result.current.handleKeyDown(
        new KeyboardEvent('keydown', { key: 'Backspace' }) as unknown as React.KeyboardEvent
      )
    })

    // Delete with Delete key
    act(() => {
      result.current.handleKeyDown(
        new KeyboardEvent('keydown', { key: 'Delete' }) as unknown as React.KeyboardEvent
      )
    })

    // State should be idle
    expect(result.current.state).toBe('idle')
    expect(result.current.placeholder).toBe('Add filter...')
  })

  it('should transition to selecting-connector when deleting one of multiple expressions', () => {
    const onChange = vi.fn()
    const initialValue = [
      {
        condition: {
          field: { key: 'processInstanceId', label: 'Process Instance ID', type: 'id' },
          operator: { key: 'eq', label: 'equals', symbol: '=' },
          value: { raw: '123', display: '123', serialized: '123' },
        },
        connector: 'AND' as const,
      },
      {
        condition: {
          field: { key: 'status', label: 'Status', type: 'string' },
          operator: { key: 'eq', label: 'equals', symbol: '=' },
          value: { raw: 'active', display: 'active', serialized: 'active' },
        },
      },
    ]

    const { result } = renderHook(() =>
      useFilterState({
        schema,
        value: initialValue,
        onChange,
      })
    )

    // Call handleExpressionDelete directly to delete the second expression
    act(() => {
      result.current.handleExpressionDelete(1)
    })

    // Should still be in selecting-connector since there's one expression left
    expect(result.current.state).toBe('selecting-connector')
    expect(onChange).toHaveBeenLastCalledWith([
      {
        condition: {
          field: { key: 'processInstanceId', label: 'Process Instance ID', type: 'id' },
          operator: { key: 'eq', label: 'equals', symbol: '=' },
          value: { raw: '123', display: '123', serialized: '123' },
        },
        // Connector should be removed since it's now the last expression
      },
    ])
  })

  it('should reset to idle when using handleExpressionDelete on the last expression', () => {
    const onChange = vi.fn()
    const initialValue = [
      {
        condition: {
          field: { key: 'status', label: 'Status', type: 'string' },
          operator: { key: 'eq', label: 'equals', symbol: '=' },
          value: { raw: 'active', display: 'active', serialized: 'active' },
        },
      },
    ]

    const { result } = renderHook(() =>
      useFilterState({
        schema,
        value: initialValue,
        onChange,
      })
    )

    expect(result.current.state).toBe('idle')

    // Delete the only expression
    act(() => {
      result.current.handleExpressionDelete(0)
    })

    // State should still be idle
    expect(result.current.state).toBe('idle')
    expect(result.current.placeholder).toBe('Add filter...')
    expect(onChange).toHaveBeenLastCalledWith([])
  })
})
