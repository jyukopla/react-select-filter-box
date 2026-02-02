import { describe, expect, it, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useFilterState } from './useFilterState'
import type { FilterExpression, ConditionValue } from '@/types'
import { createTestSchema } from './useFilterState.testUtils'

describe('useFilterState - Editing', () => {
  describe('Token Editing', () => {
    it('should set editingTokenIndex when handleTokenEdit is called on value token', () => {
      const initialValue = [
        {
          condition: {
            field: { key: 'status', label: 'Status', type: 'enum' as const },
            operator: { key: 'eq', label: 'equals', symbol: '=' },
            value: { raw: 'active', display: 'Active', serialized: 'active' },
          },
        },
      ]

      const { result } = renderHook(() =>
        useFilterState({ schema: createTestSchema(), value: initialValue, onChange: vi.fn() })
      )

      // Token index 2 is the value token (field=0, operator=1, value=2)
      act(() => {
        result.current.handleTokenEdit(2)
      })

      expect(result.current.editingTokenIndex).toBe(2)
    })

    it('should not set editingTokenIndex for field token', () => {
      const initialValue = [
        {
          condition: {
            field: { key: 'status', label: 'Status', type: 'enum' as const },
            operator: { key: 'eq', label: 'equals', symbol: '=' },
            value: { raw: 'active', display: 'Active', serialized: 'active' },
          },
        },
      ]

      const { result } = renderHook(() =>
        useFilterState({ schema: createTestSchema(), value: initialValue, onChange: vi.fn() })
      )

      // Token index 0 is the field token
      act(() => {
        result.current.handleTokenEdit(0)
      })

      expect(result.current.editingTokenIndex).toBe(-1)
    })

    it('should call onChange with updated value when handleTokenEditComplete is called', () => {
      const onChange = vi.fn()
      const initialValue = [
        {
          condition: {
            field: { key: 'status', label: 'Status', type: 'enum' as const },
            operator: { key: 'eq', label: 'equals', symbol: '=' },
            value: { raw: 'active', display: 'Active', serialized: 'active' },
          },
        },
      ]

      const { result } = renderHook(() =>
        useFilterState({ schema: createTestSchema(), value: initialValue, onChange })
      )

      // Start editing value token (index 2)
      act(() => {
        result.current.handleTokenEdit(2)
      })

      // Complete edit with new value
      const newValue: ConditionValue = {
        raw: 'inactive',
        display: 'inactive',
        serialized: 'inactive',
      }

      act(() => {
        result.current.handleTokenEditComplete(newValue)
      })

      expect(onChange).toHaveBeenCalledWith([
        expect.objectContaining({
          condition: expect.objectContaining({
            value: expect.objectContaining({ raw: 'inactive' }),
          }),
        }),
      ])
      expect(result.current.editingTokenIndex).toBe(-1)
    })

    it('should reset editingTokenIndex when handleTokenEditCancel is called', () => {
      const initialValue = [
        {
          condition: {
            field: { key: 'status', label: 'Status', type: 'enum' as const },
            operator: { key: 'eq', label: 'equals', symbol: '=' },
            value: { raw: 'active', display: 'Active', serialized: 'active' },
          },
        },
      ]

      const { result } = renderHook(() =>
        useFilterState({ schema: createTestSchema(), value: initialValue, onChange: vi.fn() })
      )

      // Start editing
      act(() => {
        result.current.handleTokenEdit(2)
      })

      expect(result.current.editingTokenIndex).toBe(2)

      // Cancel editing
      act(() => {
        result.current.handleTokenEditCancel()
      })

      expect(result.current.editingTokenIndex).toBe(-1)
    })

    it('should close dropdown when entering edit mode', () => {
      const initialValue = [
        {
          condition: {
            field: { key: 'status', label: 'Status', type: 'enum' as const },
            operator: { key: 'eq', label: 'equals', symbol: '=' },
            value: { raw: 'active', display: 'Active', serialized: 'active' },
          },
        },
      ]

      const { result } = renderHook(() =>
        useFilterState({ schema: createTestSchema(), value: initialValue, onChange: vi.fn() })
      )

      // Focus to open dropdown
      act(() => {
        result.current.handleFocus()
      })

      expect(result.current.isDropdownOpen).toBe(true)

      // Start editing
      act(() => {
        result.current.handleTokenEdit(2)
      })

      expect(result.current.isDropdownOpen).toBe(false)
    })
  })

  describe('Operator Editing', () => {
    it('should allow clicking operator token to start editing', () => {
      const initialValue: FilterExpression[] = [
        {
          condition: {
            field: { key: 'status', label: 'Status', type: 'enum' as const },
            operator: { key: 'eq', label: 'equals', symbol: '=' },
            value: { raw: 'active', display: 'Active', serialized: 'active' },
          },
        },
      ]

      const { result } = renderHook(() =>
        useFilterState({ schema: createTestSchema(), value: initialValue, onChange: vi.fn() })
      )

      // Find the operator token index (second token, index 1)
      expect(result.current.tokens[1].type).toBe('operator')

      // Click on operator token to start editing
      act(() => {
        result.current.handleOperatorEdit(0) // expression index
      })

      // Should be in operator editing mode
      expect(result.current.editingOperatorIndex).toBe(0)
      expect(result.current.isDropdownOpen).toBe(true)
      // Suggestions should be operators for that field
      expect(result.current.suggestions.every((s) => s.type === 'operator')).toBe(true)
    })

    it('should update operator when new one is selected during editing', () => {
      const initialValue: FilterExpression[] = [
        {
          condition: {
            field: { key: 'status', label: 'Status', type: 'enum' as const },
            operator: { key: 'eq', label: 'equals', symbol: '=' },
            value: { raw: 'active', display: 'Active', serialized: 'active' },
          },
        },
      ]

      const onChange = vi.fn()
      const { result } = renderHook(() =>
        useFilterState({ schema: createTestSchema(), value: initialValue, onChange })
      )

      // Start editing operator
      act(() => {
        result.current.handleOperatorEdit(0)
      })

      // Select a different operator
      act(() => {
        result.current.handleSelect({
          type: 'operator',
          key: 'neq',
          label: 'not equals',
        })
      })

      // onChange should be called with updated expression
      expect(onChange).toHaveBeenCalled()
      const updatedExpressions = onChange.mock.calls[0][0]
      expect(updatedExpressions[0].condition.operator.key).toBe('neq')
    })

    it('should cancel operator editing on Escape', () => {
      const initialValue: FilterExpression[] = [
        {
          condition: {
            field: { key: 'status', label: 'Status', type: 'enum' as const },
            operator: { key: 'eq', label: 'equals', symbol: '=' },
            value: { raw: 'active', display: 'Active', serialized: 'active' },
          },
        },
      ]

      const { result } = renderHook(() =>
        useFilterState({ schema: createTestSchema(), value: initialValue, onChange: vi.fn() })
      )

      // Start editing operator
      act(() => {
        result.current.handleOperatorEdit(0)
      })

      expect(result.current.editingOperatorIndex).toBe(0)

      // Cancel with escape
      act(() => {
        result.current.handleOperatorEditCancel()
      })

      expect(result.current.editingOperatorIndex).toBe(-1)
      expect(result.current.isDropdownOpen).toBe(false)
    })
  })

  describe('Connector Editing', () => {
    it('should allow clicking connector token to start editing', () => {
      const initialValue: FilterExpression[] = [
        {
          condition: {
            field: { key: 'status', label: 'Status', type: 'enum' as const },
            operator: { key: 'eq', label: 'equals', symbol: '=' },
            value: { raw: 'active', display: 'Active', serialized: 'active' },
          },
          connector: 'AND',
        },
        {
          condition: {
            field: { key: 'name', label: 'Name', type: 'string' as const },
            operator: { key: 'contains', label: 'contains' },
            value: { raw: 'test', display: 'test', serialized: 'test' },
          },
        },
      ]

      const { result } = renderHook(() =>
        useFilterState({ schema: createTestSchema(), value: initialValue, onChange: vi.fn() })
      )

      // Find the connector token (fourth token, index 3)
      expect(result.current.tokens[3].type).toBe('connector')

      // Click on connector token to start editing
      act(() => {
        result.current.handleConnectorEdit(0) // expression index
      })

      // Should be in connector editing mode
      expect(result.current.editingConnectorIndex).toBe(0)
      expect(result.current.isDropdownOpen).toBe(true)
      // Suggestions should be connectors
      expect(result.current.suggestions.every((s) => s.type === 'connector')).toBe(true)
      expect(result.current.suggestions.map((s) => s.key)).toEqual(['AND', 'OR'])
    })

    it('should update connector when new one is selected during editing', () => {
      const initialValue: FilterExpression[] = [
        {
          condition: {
            field: { key: 'status', label: 'Status', type: 'enum' as const },
            operator: { key: 'eq', label: 'equals', symbol: '=' },
            value: { raw: 'active', display: 'Active', serialized: 'active' },
          },
          connector: 'AND',
        },
        {
          condition: {
            field: { key: 'name', label: 'Name', type: 'string' as const },
            operator: { key: 'contains', label: 'contains' },
            value: { raw: 'test', display: 'test', serialized: 'test' },
          },
        },
      ]

      const onChange = vi.fn()
      const { result } = renderHook(() =>
        useFilterState({ schema: createTestSchema(), value: initialValue, onChange })
      )

      // Start editing connector
      act(() => {
        result.current.handleConnectorEdit(0)
      })

      // Select a different connector (OR instead of AND)
      act(() => {
        result.current.handleSelect({
          type: 'connector',
          key: 'OR',
          label: 'OR',
        })
      })

      // onChange should be called with updated expression
      expect(onChange).toHaveBeenCalled()
      const updatedExpressions = onChange.mock.calls[0][0]
      expect(updatedExpressions[0].connector).toBe('OR')
      // Second expression should remain unchanged
      expect(updatedExpressions[1].condition.field.key).toBe('name')
    })

    it('should cancel connector editing on handleConnectorEditCancel', () => {
      const initialValue: FilterExpression[] = [
        {
          condition: {
            field: { key: 'status', label: 'Status', type: 'enum' as const },
            operator: { key: 'eq', label: 'equals', symbol: '=' },
            value: { raw: 'active', display: 'Active', serialized: 'active' },
          },
          connector: 'AND',
        },
        {
          condition: {
            field: { key: 'name', label: 'Name', type: 'string' as const },
            operator: { key: 'contains', label: 'contains' },
            value: { raw: 'test', display: 'test', serialized: 'test' },
          },
        },
      ]

      const { result } = renderHook(() =>
        useFilterState({ schema: createTestSchema(), value: initialValue, onChange: vi.fn() })
      )

      // Start editing connector
      act(() => {
        result.current.handleConnectorEdit(0)
      })

      expect(result.current.editingConnectorIndex).toBe(0)

      // Cancel editing
      act(() => {
        result.current.handleConnectorEditCancel()
      })

      expect(result.current.editingConnectorIndex).toBe(-1)
      expect(result.current.isDropdownOpen).toBe(false)
    })

    it('should not start editing if expression has no connector', () => {
      const initialValue: FilterExpression[] = [
        {
          condition: {
            field: { key: 'status', label: 'Status', type: 'enum' as const },
            operator: { key: 'eq', label: 'equals', symbol: '=' },
            value: { raw: 'active', display: 'Active', serialized: 'active' },
          },
          // No connector - this is the last expression
        },
      ]

      const { result } = renderHook(() =>
        useFilterState({ schema: createTestSchema(), value: initialValue, onChange: vi.fn() })
      )

      // Try to start editing connector on expression without connector
      act(() => {
        result.current.handleConnectorEdit(0)
      })

      // Should not enter editing mode
      expect(result.current.editingConnectorIndex).toBe(-1)
    })
  })
})
