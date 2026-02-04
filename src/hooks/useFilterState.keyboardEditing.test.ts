/**
 * Tests for keyboard-triggered token editing (ArrowDown/ArrowUp on selected tokens)
 *
 * NOTE: This test file is currently skipped due to memory issues causing
 * JavaScript heap out of memory errors and worker timeouts in vitest.
 * The navigateToToken helper causes excessive re-renders.
 * TODO: Refactor tests to avoid repeated act() calls in loops.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useFilterState } from './useFilterState'
import { createTestSchema } from './useFilterState.testUtils'
import type { FilterExpression } from '@/types'

/**
 * Helper to navigate to a specific token index using ArrowLeft
 * Includes a safety limit to prevent infinite loops
 */
function navigateToToken(
  result: ReturnType<typeof renderHook<ReturnType<typeof useFilterState>, unknown>>['result'],
  targetIndex: number,
  maxIterations = 20
) {
  let iterations = 0

  // Start navigation
  act(() => {
    result.current.handleKeyDown({
      key: 'ArrowLeft',
      preventDefault: vi.fn(),
      stopPropagation: vi.fn(),
      ctrlKey: false,
      shiftKey: false,
      metaKey: false,
    } as unknown as React.KeyboardEvent<HTMLInputElement>)
  })

  while (result.current.selectedTokenIndex !== targetIndex && iterations < maxIterations) {
    iterations++
    act(() => {
      result.current.handleKeyDown({
        key: 'ArrowLeft',
        preventDefault: vi.fn(),
        stopPropagation: vi.fn(),
        ctrlKey: false,
        shiftKey: false,
        metaKey: false,
      } as unknown as React.KeyboardEvent<HTMLInputElement>)
    })
  }

  if (iterations >= maxIterations) {
    throw new Error(
      `Failed to navigate to token index ${targetIndex} after ${maxIterations} iterations. ` +
        `Current selectedTokenIndex: ${result.current.selectedTokenIndex}`
    )
  }
}

describe.skip('useFilterState - Keyboard Token Editing', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Field Token Keyboard Editing', () => {
    it('should open field dropdown when ArrowDown is pressed on selected field token', () => {
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
        useFilterState({
          schema: createTestSchema(),
          value: initialValue,
          onChange: vi.fn(),
        })
      )

      // Find field token (should be at index 0: field, operator, value)
      const fieldTokenIndex = result.current.tokens.findIndex((t) => t.type === 'field')
      expect(fieldTokenIndex).toBe(0)
      expect(result.current.tokens[fieldTokenIndex].type).toBe('field')

      // Navigate to field token using helper
      navigateToToken(result, fieldTokenIndex)

      expect(result.current.selectedTokenIndex).toBe(fieldTokenIndex)
      expect(result.current.isDropdownOpen).toBe(false)

      // Now press ArrowDown to open the field dropdown
      const preventDefault = vi.fn()
      act(() => {
        result.current.handleKeyDown({
          key: 'ArrowDown',
          preventDefault,
          stopPropagation: vi.fn(),
          ctrlKey: false,
          shiftKey: false,
          metaKey: false,
        } as unknown as React.KeyboardEvent<HTMLInputElement>)
      })

      // Should have opened the field editing dropdown
      expect(preventDefault).toHaveBeenCalled()
      expect(result.current.isDropdownOpen).toBe(true)
      expect(result.current.editingFieldIndex).toBe(0)
      expect(result.current.selectedTokenIndex).toBe(-1) // Selection should be cleared
    })

    it('should display field suggestions when dropdown is opened via keyboard', () => {
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
        useFilterState({
          schema: createTestSchema(),
          value: initialValue,
          onChange: vi.fn(),
        })
      )

      // Navigate to field token
      const fieldTokenIndex = 0

      navigateToToken(result, fieldTokenIndex)

      // Open field dropdown
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

      // Should show all field suggestions
      expect(result.current.suggestions.length).toBeGreaterThan(0)
      expect(result.current.suggestions.every((s) => s.type === 'field')).toBe(true)
    })
  })

  describe('Operator Token Keyboard Editing', () => {
    it('should open operator dropdown when ArrowDown is pressed on selected operator token', () => {
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
        useFilterState({
          schema: createTestSchema(),
          value: initialValue,
          onChange: vi.fn(),
        })
      )

      // Find operator token (should be at index 1: field, operator, value)
      const operatorTokenIndex = result.current.tokens.findIndex((t) => t.type === 'operator')
      expect(operatorTokenIndex).toBe(1)
      expect(result.current.tokens[operatorTokenIndex].type).toBe('operator')

      // Navigate to operator token using helper
      navigateToToken(result, operatorTokenIndex)

      expect(result.current.selectedTokenIndex).toBe(operatorTokenIndex)
      expect(result.current.isDropdownOpen).toBe(false)

      // Now press ArrowDown to open the operator dropdown
      const preventDefault = vi.fn()
      act(() => {
        result.current.handleKeyDown({
          key: 'ArrowDown',
          preventDefault,
          stopPropagation: vi.fn(),
          ctrlKey: false,
          shiftKey: false,
          metaKey: false,
        } as unknown as React.KeyboardEvent<HTMLInputElement>)
      })

      // Should have opened the operator editing dropdown
      expect(preventDefault).toHaveBeenCalled()
      expect(result.current.isDropdownOpen).toBe(true)
      expect(result.current.editingOperatorIndex).toBe(0)
      expect(result.current.selectedTokenIndex).toBe(-1) // Selection should be cleared
    })

    it('should open operator dropdown when ArrowUp is pressed on selected operator token', () => {
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
        useFilterState({
          schema: createTestSchema(),
          value: initialValue,
          onChange: vi.fn(),
        })
      )

      // Navigate to operator token
      const operatorTokenIndex = result.current.tokens.findIndex((t) => t.type === 'operator')

      navigateToToken(result, operatorTokenIndex)

      // Press ArrowUp to open operator dropdown
      const preventDefault = vi.fn()
      act(() => {
        result.current.handleKeyDown({
          key: 'ArrowUp',
          preventDefault,
          stopPropagation: vi.fn(),
          ctrlKey: false,
          shiftKey: false,
          metaKey: false,
        } as unknown as React.KeyboardEvent<HTMLInputElement>)
      })

      expect(preventDefault).toHaveBeenCalled()
      expect(result.current.isDropdownOpen).toBe(true)
      expect(result.current.editingOperatorIndex).toBe(0)
    })

    it('should display operator suggestions when dropdown is opened via keyboard', () => {
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
        useFilterState({
          schema: createTestSchema(),
          value: initialValue,
          onChange: vi.fn(),
        })
      )

      // Navigate to operator token
      const operatorTokenIndex = result.current.tokens.findIndex((t) => t.type === 'operator')

      navigateToToken(result, operatorTokenIndex)

      // Open operator dropdown
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

      // Should show operator suggestions for status field
      expect(result.current.suggestions.length).toBeGreaterThan(0)
      expect(result.current.suggestions.some((s) => s.type === 'operator')).toBe(true)
    })
  })

  describe('Connector Token Keyboard Editing', () => {
    it('should open connector dropdown when ArrowDown is pressed on selected connector token', () => {
      const initialValue: FilterExpression[] = [
        {
          condition: {
            field: { key: 'status', label: 'Status', type: 'enum' as const },
            operator: { key: 'eq', label: 'equals', symbol: '=' },
            value: { raw: 'active', display: 'Active', serialized: 'active' },
          },
          connector: { key: 'AND', label: 'AND' },
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
        useFilterState({
          schema: createTestSchema(),
          value: initialValue,
          onChange: vi.fn(),
        })
      )

      // Find connector token
      const connectorTokenIndex = result.current.tokens.findIndex((t) => t.type === 'connector')
      expect(connectorTokenIndex).toBeGreaterThan(0)
      expect(result.current.tokens[connectorTokenIndex].type).toBe('connector')

      // Navigate to connector token using helper
      navigateToToken(result, connectorTokenIndex)

      expect(result.current.selectedTokenIndex).toBe(connectorTokenIndex)

      // Press ArrowDown to open connector dropdown
      const preventDefault = vi.fn()
      act(() => {
        result.current.handleKeyDown({
          key: 'ArrowDown',
          preventDefault,
          stopPropagation: vi.fn(),
          ctrlKey: false,
          shiftKey: false,
          metaKey: false,
        } as unknown as React.KeyboardEvent<HTMLInputElement>)
      })

      expect(preventDefault).toHaveBeenCalled()
      expect(result.current.isDropdownOpen).toBe(true)
      expect(result.current.editingConnectorIndex).toBe(0)
      expect(result.current.selectedTokenIndex).toBe(-1)
    })
  })

  describe('Value Token with Custom Widget Keyboard Editing', () => {
    it('should open custom widget dropdown when ArrowDown is pressed on selected value token with custom widget', () => {
      const schema = createTestSchema()
      const initialValue: FilterExpression[] = [
        {
          condition: {
            field: { key: 'createdAt', label: 'Created Date', type: 'date' as const },
            operator: { key: 'eq', label: 'equals', symbol: '=' },
            value: { raw: '2024-01-15', display: 'Jan 15, 2024', serialized: '2024-01-15' },
          },
        },
      ]

      const { result } = renderHook(() =>
        useFilterState({
          schema,
          value: initialValue,
          onChange: vi.fn(),
        })
      )

      // Navigate to value token
      const valueTokenIndex = result.current.tokens.findIndex((t) => t.type === 'value')
      expect(valueTokenIndex).toBeGreaterThan(0)

      navigateToToken(result, valueTokenIndex)

      // Press ArrowDown to open custom widget
      const preventDefault = vi.fn()
      act(() => {
        result.current.handleKeyDown({
          key: 'ArrowDown',
          preventDefault,
          stopPropagation: vi.fn(),
          ctrlKey: false,
          shiftKey: false,
          metaKey: false,
        } as unknown as React.KeyboardEvent<HTMLInputElement>)
      })

      expect(preventDefault).toHaveBeenCalled()
      expect(result.current.isDropdownOpen).toBe(true)
      expect(result.current.state).toBe('editing-token')
      expect(result.current.editingTokenIndex).toBe(valueTokenIndex)
      expect(result.current.activeCustomWidget).toBeDefined()
    })
  })

  describe('ArrowDown/ArrowUp with Dropdown Already Open', () => {
    it('should navigate dropdown items when dropdown is already open', () => {
      const { result } = renderHook(() =>
        useFilterState({
          schema: createTestSchema(),
          value: [],
          onChange: vi.fn(),
        })
      )

      // Focus to open dropdown
      act(() => {
        result.current.handleFocus()
      })

      expect(result.current.isDropdownOpen).toBe(true)
      expect(result.current.highlightedIndex).toBe(-1)

      // Press ArrowDown to highlight first item
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

      expect(result.current.highlightedIndex).toBe(0)

      // Press ArrowDown again to move to next item
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

      expect(result.current.highlightedIndex).toBe(1)

      // Press ArrowUp to move back
      act(() => {
        result.current.handleKeyDown({
          key: 'ArrowUp',
          preventDefault: vi.fn(),
          stopPropagation: vi.fn(),
          ctrlKey: false,
          shiftKey: false,
          metaKey: false,
        } as unknown as React.KeyboardEvent<HTMLInputElement>)
      })

      expect(result.current.highlightedIndex).toBe(0)
    })
  })

  describe('Edge Cases', () => {
    it('should open field dropdown when ArrowDown is pressed on selected field token', () => {
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
        useFilterState({
          schema: createTestSchema(),
          value: initialValue,
          onChange: vi.fn(),
        })
      )

      // Find field token (should be first)
      const fieldTokenIndex = 0
      expect(result.current.tokens[fieldTokenIndex].type).toBe('field')

      // Navigate to field token
      navigateToToken(result, fieldTokenIndex)

      // Press ArrowDown to open field dropdown
      const preventDefault = vi.fn()
      act(() => {
        result.current.handleKeyDown({
          key: 'ArrowDown',
          preventDefault,
          stopPropagation: vi.fn(),
          ctrlKey: false,
          shiftKey: false,
          metaKey: false,
        } as unknown as React.KeyboardEvent<HTMLInputElement>)
      })

      // Should open field editing dropdown
      expect(preventDefault).toHaveBeenCalled()
      expect(result.current.isDropdownOpen).toBe(true)
      expect(result.current.editingFieldIndex).toBe(0)
    })

    it('should not trigger editing for pending tokens', () => {
      const { result } = renderHook(() =>
        useFilterState({
          schema: createTestSchema(),
          value: [],
          onChange: vi.fn(),
        })
      )

      // Focus and start selecting a field
      act(() => {
        result.current.handleFocus()
      })

      // Select a field to create pending operator token
      const statusField = result.current.suggestions.find((s) => s.key === 'status')
      if (statusField) {
        act(() => {
          result.current.handleSelect(statusField)
        })
      }

      // Find the pending operator token
      const pendingOperatorToken = result.current.tokens.find(
        (t) => t.type === 'operator' && t.isPending
      )
      expect(pendingOperatorToken).toBeDefined()

      // Navigate to it
      if (pendingOperatorToken) {
        const pendingIndex = result.current.tokens.indexOf(pendingOperatorToken)

        // Try to navigate to the pending token (may fail if it's a pending token)
        let iterations = 0
        const maxIterations = 20

        act(() => {
          result.current.handleKeyDown({
            key: 'ArrowLeft',
            preventDefault: vi.fn(),
            stopPropagation: vi.fn(),
            ctrlKey: false,
            shiftKey: false,
            metaKey: false,
          } as unknown as React.KeyboardEvent<HTMLInputElement>)
        })

        while (
          result.current.selectedTokenIndex !== pendingIndex &&
          result.current.selectedTokenIndex !== -1 &&
          iterations < maxIterations
        ) {
          iterations++
          act(() => {
            result.current.handleKeyDown({
              key: 'ArrowLeft',
              preventDefault: vi.fn(),
              stopPropagation: vi.fn(),
              ctrlKey: false,
              shiftKey: false,
              metaKey: false,
            } as unknown as React.KeyboardEvent<HTMLInputElement>)
          })
        }

        // Press ArrowDown - should not trigger editing for pending token
        const beforeEditingIndex = result.current.editingOperatorIndex
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

        // Should not have started editing pending token
        expect(result.current.editingOperatorIndex).toBe(beforeEditingIndex)
      }
    })
  })
})
