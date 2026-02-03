import { describe, expect, it, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useFilterState } from './useFilterState'
import type { FilterExpression, ConditionValue } from '@/types'
import {
  createTestSchema,
  createMockCustomWidget,
  createTestSchemaWithCustomWidget,
  createExpressionWithCustomWidget,
} from './useFilterState.testUtils'

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

      // Focus - in selecting-connector state, dropdown is not auto-opened
      act(() => {
        result.current.handleFocus()
      })

      // Dropdown is closed in selecting-connector state (user presses ArrowDown to open)
      expect(result.current.isDropdownOpen).toBe(false)
      expect(result.current.state).toBe('selecting-connector')

      // Open dropdown with ArrowDown
      act(() => {
        result.current.handleKeyDown({
          key: 'ArrowDown',
          preventDefault: vi.fn(),
          stopPropagation: vi.fn(),
          ctrlKey: false,
          shiftKey: false,
          metaKey: false,
        } as unknown as React.KeyboardEvent<HTMLInputElement>)
      })

      expect(result.current.isDropdownOpen).toBe(true)

      // Start editing (should close dropdown)
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

  describe('State Restoration After Token Edit', () => {
    it('should restore step to selecting-connector after editing a value token', () => {
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

      // Focus to activate - with a completed expression, state should be selecting-connector
      act(() => {
        result.current.handleFocus()
      })
      expect(result.current.state).toBe('selecting-connector')

      // Close dropdown (simulating user pressing Escape)
      act(() => {
        result.current.handleKeyDown({
          key: 'Escape',
          preventDefault: vi.fn(),
          stopPropagation: vi.fn(),
          ctrlKey: false,
        } as unknown as React.KeyboardEvent<HTMLInputElement>)
      })
      expect(result.current.isDropdownOpen).toBe(false)

      // Start editing a value token - this should preserve the state
      act(() => {
        result.current.handleTokenEdit(2) // value token
      })
      expect(result.current.editingTokenIndex).toBe(2)

      // Complete the edit with a new value
      const newValue = {
        raw: 'inactive',
        display: 'Inactive',
        serialized: 'inactive',
      }
      act(() => {
        result.current.handleTokenEditComplete(newValue)
      })

      // State should be restored to selecting-connector, not selecting-field
      expect(result.current.state).toBe('selecting-connector')
      expect(result.current.editingTokenIndex).toBe(-1)
    })

    it('should restore step to selecting-connector after cancelling token edit', () => {
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

      // Focus to activate
      act(() => {
        result.current.handleFocus()
      })
      expect(result.current.state).toBe('selecting-connector')

      // Start editing a value token
      act(() => {
        result.current.handleTokenEdit(2) // value token
      })

      // Cancel the edit
      act(() => {
        result.current.handleTokenEditCancel()
      })

      // State should be restored to selecting-connector
      expect(result.current.state).toBe('selecting-connector')
      expect(result.current.editingTokenIndex).toBe(-1)
    })
  })

  describe('Custom Widget Editing', () => {
    it('should update existing expression when confirming custom widget edit (not create new)', () => {
      const customWidget = createMockCustomWidget()
      const schema = createTestSchemaWithCustomWidget(customWidget)
      const initialValue = [createExpressionWithCustomWidget()]
      const onChange = vi.fn()

      const { result } = renderHook(() => useFilterState({ schema, value: initialValue, onChange }))

      // Initial state: one expression
      expect(result.current.tokens.length).toBe(3) // field, operator, value

      // Double-click on value token (index 2) to edit with custom widget
      act(() => {
        result.current.handleTokenEdit(2)
      })

      // State should be editing-token, not entering-value
      expect(result.current.state).toBe('editing-token')
      expect(result.current.editingTokenIndex).toBe(2)
      expect(result.current.activeCustomWidget).toBeDefined()
      expect(result.current.isDropdownOpen).toBe(true)

      // Now confirm the custom widget with a new value
      act(() => {
        result.current.handleCustomWidgetConfirm('2025-02-20', 'Feb 20, 2025')
      })

      // Should have called onChange with UPDATED expression, not a new one
      expect(onChange).toHaveBeenCalledTimes(1)
      const updatedExpressions = onChange.mock.calls[0][0]

      // Should still be just one expression (updated, not two)
      expect(updatedExpressions.length).toBe(1)

      // The value should be updated
      expect(updatedExpressions[0].condition.value.raw).toBe('2025-02-20')
      expect(updatedExpressions[0].condition.value.display).toBe('Feb 20, 2025')

      // Should be back to selecting-connector state
      expect(result.current.state).toBe('selecting-connector')
      expect(result.current.editingTokenIndex).toBe(-1)
    })

    it('should not show pending tokens when editing with custom widget', () => {
      const customWidget = createMockCustomWidget()
      const schema = createTestSchemaWithCustomWidget(customWidget)
      const initialValue = [createExpressionWithCustomWidget()]
      const onChange = vi.fn()

      const { result } = renderHook(() => useFilterState({ schema, value: initialValue, onChange }))

      // Initial state: one expression with 3 tokens
      expect(result.current.tokens.length).toBe(3)
      expect(result.current.tokens.every((t) => !t.isPending)).toBe(true)

      // Double-click on value token (index 2) to edit with custom widget
      act(() => {
        result.current.handleTokenEdit(2)
      })

      // Should still only have 3 tokens (no pending tokens added)
      expect(result.current.tokens.length).toBe(3)
      expect(result.current.tokens.every((t) => !t.isPending)).toBe(true)

      // Confirm the currentField and currentOperator are set (for widget context)
      // but they don't create pending tokens
      expect(result.current.state).toBe('editing-token')
    })

    it('should cancel custom widget edit without changes', () => {
      const customWidget = createMockCustomWidget()
      const schema = createTestSchemaWithCustomWidget(customWidget)
      const initialValue = [createExpressionWithCustomWidget()]
      const onChange = vi.fn()

      const { result } = renderHook(() => useFilterState({ schema, value: initialValue, onChange }))

      // Focus to activate
      act(() => {
        result.current.handleFocus()
      })

      // Double-click on value token (index 2) to edit with custom widget
      act(() => {
        result.current.handleTokenEdit(2)
      })

      expect(result.current.state).toBe('editing-token')

      // Cancel the custom widget edit
      act(() => {
        result.current.handleCustomWidgetCancel()
      })

      // Should NOT have called onChange
      expect(onChange).not.toHaveBeenCalled()

      // Should restore to previous state
      expect(result.current.editingTokenIndex).toBe(-1)
      expect(result.current.isDropdownOpen).toBe(false)
    })

    it('should show custom widget when editing via keyboard (Enter on selected token)', () => {
      const customWidget = createMockCustomWidget()
      const schema = createTestSchemaWithCustomWidget(customWidget)
      const initialValue = [createExpressionWithCustomWidget()]
      const onChange = vi.fn()

      const { result } = renderHook(() => useFilterState({ schema, value: initialValue, onChange }))

      // Focus to activate
      act(() => {
        result.current.handleFocus()
      })

      // Use arrow key to select the value token (index 2)
      // First, simulate selecting the token via handleTokenSelect (as arrow keys would)
      act(() => {
        result.current.handleTokenSelect(2)
      })

      expect(result.current.selectedTokenIndex).toBe(2)

      // Now press Enter to edit the selected token
      act(() => {
        result.current.handleKeyDown({
          key: 'Enter',
          preventDefault: vi.fn(),
          stopPropagation: vi.fn(),
          ctrlKey: false,
          shiftKey: false,
          metaKey: false,
        } as unknown as React.KeyboardEvent<HTMLInputElement>)
      })

      // Should be in editing-token state with custom widget shown
      expect(result.current.state).toBe('editing-token')
      expect(result.current.editingTokenIndex).toBe(2)
      expect(result.current.activeCustomWidget).toBeDefined()
      expect(result.current.isDropdownOpen).toBe(true)
      expect(result.current.selectedTokenIndex).toBe(-1) // Selection should be cleared
    })
  })
})
