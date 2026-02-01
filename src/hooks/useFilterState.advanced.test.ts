import { describe, expect, it, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useFilterState } from './useFilterState'
import type { FilterSchema, FilterExpression } from '@/types'
import { createTestSchema } from './useFilterState.testUtils'

describe('useFilterState - Advanced', () => {

  describe('Pending Tokens', () => {
    it('should include pending field token after field selection', () => {
      const { result } = renderHook(() =>
        useFilterState({ schema: createTestSchema(), value: [], onChange: vi.fn() })
      )

      // Focus to start selecting
      act(() => {
        result.current.handleFocus()
      })

      // Select a field
      act(() => {
        result.current.handleSelect({
          type: 'field',
          key: 'status',
          label: 'Status',
        })
      })

      // Should have pending field token
      expect(result.current.tokens).toHaveLength(1)
      expect(result.current.tokens[0]).toMatchObject({
        type: 'field',
        value: { key: 'status', label: 'Status' },
        isPending: true,
      })
    })

    it('should include pending field and operator tokens after operator selection', () => {
      const { result } = renderHook(() =>
        useFilterState({ schema: createTestSchema(), value: [], onChange: vi.fn() })
      )

      act(() => {
        result.current.handleFocus()
      })

      // Select field
      act(() => {
        result.current.handleSelect({
          type: 'field',
          key: 'status',
          label: 'Status',
        })
      })

      // Select operator
      act(() => {
        result.current.handleSelect({
          type: 'operator',
          key: 'eq',
          label: 'equals',
        })
      })

      // Should have pending field and operator tokens
      expect(result.current.tokens).toHaveLength(2)
      expect(result.current.tokens[0]).toMatchObject({
        type: 'field',
        isPending: true,
      })
      expect(result.current.tokens[1]).toMatchObject({
        type: 'operator',
        value: { key: 'eq', label: 'equals' },
        isPending: true,
      })
    })

    it('should convert pending tokens to completed after value confirmation', () => {
      const onChange = vi.fn()
      const { result } = renderHook(() =>
        useFilterState({ schema: createTestSchema(), value: [], onChange })
      )

      act(() => {
        result.current.handleFocus()
      })

      // Select field
      act(() => {
        result.current.handleSelect({
          type: 'field',
          key: 'status',
          label: 'Status',
        })
      })

      // Select operator
      act(() => {
        result.current.handleSelect({
          type: 'operator',
          key: 'eq',
          label: 'equals',
        })
      })

      // Enter value and confirm
      act(() => {
        result.current.handleInputChange('active')
      })

      act(() => {
        result.current.handleConfirmValue()
      })

      // onChange should be called with complete expression
      expect(onChange).toHaveBeenCalled()
    })

    it('should clear pending tokens after value confirmation', () => {
      const onChange = vi.fn()
      const { result, rerender } = renderHook(
        ({ value }) => useFilterState({ schema: createTestSchema(), value, onChange }),
        { initialProps: { value: [] as FilterExpression[] } }
      )

      act(() => {
        result.current.handleFocus()
      })

      // Build complete expression
      act(() => {
        result.current.handleSelect({
          type: 'field',
          key: 'status',
          label: 'Status',
        })
      })

      act(() => {
        result.current.handleSelect({
          type: 'operator',
          key: 'eq',
          label: 'equals',
        })
      })

      act(() => {
        result.current.handleInputChange('active')
      })

      act(() => {
        result.current.handleConfirmValue()
      })

      // Get the expression that was passed to onChange
      const newExpression = onChange.mock.calls[0][0]

      // Rerender with the new value (simulating controlled component)
      rerender({ value: newExpression })

      // Now tokens should be completed (no isPending)
      expect(result.current.tokens.some((t) => t.isPending)).toBe(false)
      expect(result.current.tokens).toHaveLength(3) // field, operator, value
    })
  })

  describe('Value Autocompleter', () => {
    it('should provide value suggestions from field autocompleter', async () => {
      const schemaWithAutocompleter: FilterSchema = {
        fields: [
          {
            key: 'status',
            label: 'Status',
            type: 'enum',
            operators: [{ key: 'eq', label: 'equals', symbol: '=' }],
            valueAutocompleter: {
              getSuggestions: () => [
                { type: 'value', key: 'active', label: 'Active' },
                { type: 'value', key: 'inactive', label: 'Inactive' },
              ],
            },
          },
        ],
      }

      const { result } = renderHook(() =>
        useFilterState({ schema: schemaWithAutocompleter, value: [], onChange: vi.fn() })
      )

      act(() => {
        result.current.handleFocus()
      })

      act(() => {
        result.current.handleSelect(result.current.suggestions[0]!)
      })

      // Wait for value suggestions to be fetched
      await vi.waitFor(
        () => {
          expect(result.current.state).toBe('entering-value')
          expect(result.current.suggestions).toHaveLength(2)
          expect(result.current.suggestions[0]?.label).toBe('Active')
          expect(result.current.suggestions[1]?.label).toBe('Inactive')
        },
        { timeout: 5000 }
      )
    })

    it('should provide value suggestions from operator autocompleter', async () => {
      const schemaWithOperatorAutocompleter: FilterSchema = {
        fields: [
          {
            key: 'priority',
            label: 'Priority',
            type: 'enum',
            operators: [
              {
                key: 'eq',
                label: 'equals',
                symbol: '=',
                valueAutocompleter: {
                  getSuggestions: () => [
                    { type: 'value', key: 'high', label: 'High' },
                    { type: 'value', key: 'low', label: 'Low' },
                  ],
                },
              },
            ],
          },
        ],
      }

      const { result } = renderHook(() =>
        useFilterState({ schema: schemaWithOperatorAutocompleter, value: [], onChange: vi.fn() })
      )

      act(() => {
        result.current.handleFocus()
      })

      act(() => {
        result.current.handleSelect(result.current.suggestions[0]!)
      })

      // Wait for value suggestions to be fetched
      await vi.waitFor(
        () => {
          expect(result.current.state).toBe('entering-value')
          expect(result.current.suggestions).toHaveLength(2)
          expect(result.current.suggestions[0]?.label).toBe('High')
          expect(result.current.suggestions[1]?.label).toBe('Low')
        },
        { timeout: 5000 }
      )
    })

    it('should handle async value autocompleters', async () => {
      const schemaWithAsyncAutocompleter: FilterSchema = {
        fields: [
          {
            key: 'user',
            label: 'User',
            type: 'string',
            operators: [{ key: 'eq', label: 'equals', symbol: '=' }],
            valueAutocompleter: {
              getSuggestions: async () =>
                Promise.resolve([
                  { type: 'value', key: 'alice', label: 'Alice' },
                  { type: 'value', key: 'bob', label: 'Bob' },
                ]),
            },
          },
        ],
      }

      const { result } = renderHook(() =>
        useFilterState({ schema: schemaWithAsyncAutocompleter, value: [], onChange: vi.fn() })
      )

      act(() => {
        result.current.handleFocus()
      })

      act(() => {
        result.current.handleSelect(result.current.suggestions[0]!)
      })

      // Wait for async suggestions to be fetched
      await vi.waitFor(
        () => {
          expect(result.current.state).toBe('entering-value')
          expect(result.current.suggestions).toHaveLength(2)
          expect(result.current.suggestions[0]?.label).toBe('Alice')
          expect(result.current.suggestions[1]?.label).toBe('Bob')
        },
        { timeout: 5000 }
      )
    })

    it('should filter value suggestions based on input', async () => {
      const schemaWithAutocompleter: FilterSchema = {
        fields: [
          {
            key: 'status',
            label: 'Status',
            type: 'enum',
            operators: [{ key: 'eq', label: 'equals', symbol: '=' }],
            valueAutocompleter: {
              getSuggestions: (context) => {
                const items = [
                  { type: 'value' as const, key: 'active', label: 'Active' },
                  { type: 'value' as const, key: 'inactive', label: 'Inactive' },
                  { type: 'value' as const, key: 'pending', label: 'Pending' },
                ]
                const query = context.inputValue.toLowerCase()
                return query
                  ? items.filter((item) => item.label.toLowerCase().includes(query))
                  : items
              },
            },
          },
        ],
      }

      const { result } = renderHook(() =>
        useFilterState({ schema: schemaWithAutocompleter, value: [], onChange: vi.fn() })
      )

      act(() => {
        result.current.handleFocus()
      })

      act(() => {
        result.current.handleSelect(result.current.suggestions[0]!)
      })

      // Type to filter
      act(() => {
        result.current.handleInputChange('act')
      })

      // Wait for filtered suggestions
      await vi.waitFor(
        () => {
          expect(result.current.suggestions).toHaveLength(2)
          expect(result.current.suggestions.map((s) => s.label)).toEqual(['Active', 'Inactive'])
        },
        { timeout: 5000 }
      )
    })

    it('should select value from autocomplete dropdown and complete expression', async () => {
      const onChange = vi.fn()
      const schemaWithAutocompleter: FilterSchema = {
        fields: [
          {
            key: 'status',
            label: 'Status',
            type: 'enum',
            operators: [{ key: 'eq', label: 'equals', symbol: '=' }],
            valueAutocompleter: {
              getSuggestions: () => [
                { type: 'value', key: 'active', label: 'Active' },
                { type: 'value', key: 'inactive', label: 'Inactive' },
              ],
            },
          },
        ],
      }

      const { result } = renderHook(() =>
        useFilterState({ schema: schemaWithAutocompleter, value: [], onChange })
      )

      act(() => {
        result.current.handleFocus()
      })

      // Select field (which auto-selects operator since there's only one)
      act(() => {
        result.current.handleSelect(result.current.suggestions[0]!)
      })

      // Wait for value suggestions
      await vi.waitFor(
        () => {
          expect(result.current.state).toBe('entering-value')
          expect(result.current.suggestions).toHaveLength(2)
        },
        { timeout: 5000 }
      )

      // Select a value from the dropdown
      act(() => {
        result.current.handleSelect({
          type: 'value',
          key: 'active',
          label: 'Active',
        })
      })

      // Should have called onChange with the completed expression
      expect(onChange).toHaveBeenCalled()
      const expression = onChange.mock.calls[0][0][0]
      expect(expression.condition.value.raw).toBe('active')
      expect(expression.condition.value.display).toBe('Active')

      // Should transition to selecting connector
      expect(result.current.state).toBe('selecting-connector')
    })
  })
})
