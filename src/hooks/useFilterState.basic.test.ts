import { describe, expect, it, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useFilterState } from './useFilterState'
import type { FilterSchema } from '@/types'
import { createTestSchema } from './useFilterState.testUtils'

describe('useFilterState - Basic', () => {
  describe('Initial State', () => {
    it('should start in idle state with empty expressions', () => {
      const { result } = renderHook(() =>
        useFilterState({ schema: createTestSchema(), value: [], onChange: vi.fn() })
      )

      expect(result.current.state).toBe('idle')
      expect(result.current.tokens).toEqual([])
    })

    it('should initialize with provided value', () => {
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

      expect(result.current.tokens).toHaveLength(3) // field, operator, value
    })
  })

  describe('Focus/Blur', () => {
    it('should transition to selecting-field on focus', () => {
      const { result } = renderHook(() =>
        useFilterState({ schema: createTestSchema(), value: [], onChange: vi.fn() })
      )

      act(() => {
        result.current.handleFocus()
      })

      expect(result.current.state).toBe('selecting-field')
      expect(result.current.isDropdownOpen).toBe(true)
    })

    it('should return to idle on blur', () => {
      const { result } = renderHook(() =>
        useFilterState({ schema: createTestSchema(), value: [], onChange: vi.fn() })
      )

      act(() => {
        result.current.handleFocus()
      })

      act(() => {
        result.current.handleBlur()
      })

      expect(result.current.state).toBe('idle')
      expect(result.current.isDropdownOpen).toBe(false)
    })
  })

  describe('Field Selection', () => {
    it('should provide field suggestions when selecting-field', () => {
      const { result } = renderHook(() =>
        useFilterState({ schema: createTestSchema(), value: [], onChange: vi.fn() })
      )

      act(() => {
        result.current.handleFocus()
      })

      expect(result.current.suggestions).toHaveLength(2)
      expect(result.current.suggestions[0]?.label).toBe('Status')
      expect(result.current.suggestions[1]?.label).toBe('Name')
    })

    it('should transition to selecting-operator after field selection', () => {
      const { result } = renderHook(() =>
        useFilterState({ schema: createTestSchema(), value: [], onChange: vi.fn() })
      )

      act(() => {
        result.current.handleFocus()
      })

      const fieldSuggestion = result.current.suggestions[0]!
      act(() => {
        result.current.handleSelect(fieldSuggestion)
      })

      expect(result.current.state).toBe('selecting-operator')
    })
  })

  describe('Operator Selection', () => {
    it('should provide operator suggestions for selected field', () => {
      const { result } = renderHook(() =>
        useFilterState({ schema: createTestSchema(), value: [], onChange: vi.fn() })
      )

      act(() => {
        result.current.handleFocus()
      })

      const fieldSuggestion = result.current.suggestions[0]!
      act(() => {
        result.current.handleSelect(fieldSuggestion)
      })

      expect(result.current.suggestions).toHaveLength(2)
      expect(result.current.suggestions[0]?.label).toBe('equals')
    })

    it('should transition to entering-value after operator selection', () => {
      const { result } = renderHook(() =>
        useFilterState({ schema: createTestSchema(), value: [], onChange: vi.fn() })
      )

      act(() => {
        result.current.handleFocus()
      })

      act(() => {
        result.current.handleSelect(result.current.suggestions[0]!)
      })

      act(() => {
        result.current.handleSelect(result.current.suggestions[0]!)
      })

      expect(result.current.state).toBe('entering-value')
    })

    it('should auto-select operator when field has only one operator', () => {
      const singleOperatorSchema: FilterSchema = {
        fields: [
          {
            key: 'email',
            label: 'Email',
            type: 'string',
            operators: [{ key: 'contains', label: 'contains' }],
          },
        ],
      }

      const { result } = renderHook(() =>
        useFilterState({ schema: singleOperatorSchema, value: [], onChange: vi.fn() })
      )

      act(() => {
        result.current.handleFocus()
      })

      // Select field with only one operator
      act(() => {
        result.current.handleSelect(result.current.suggestions[0]!)
      })

      // Should automatically transition to entering-value
      expect(result.current.state).toBe('entering-value')
      // Should have pending tokens for both field and operator
      expect(result.current.tokens.filter((t) => t.isPending)).toHaveLength(2)
      expect(result.current.tokens.find((t) => t.isPending && t.type === 'operator')).toBeDefined()
    })
  })

  describe('Value Entry', () => {
    it('should call onChange when expression is completed', () => {
      const onChange = vi.fn()
      const { result } = renderHook(() =>
        useFilterState({ schema: createTestSchema(), value: [], onChange })
      )

      // Focus
      act(() => {
        result.current.handleFocus()
      })

      // Select field
      act(() => {
        result.current.handleSelect(result.current.suggestions[0]!)
      })

      // Select operator
      act(() => {
        result.current.handleSelect(result.current.suggestions[0]!)
      })

      // Enter value
      act(() => {
        result.current.handleInputChange('active')
      })

      // Confirm value
      act(() => {
        result.current.handleConfirmValue()
      })

      expect(onChange).toHaveBeenCalled()
      expect(onChange.mock.calls[0]?.[0]).toHaveLength(1)
    })
  })

  describe('Placeholder', () => {
    it('should show field placeholder initially', () => {
      const { result } = renderHook(() =>
        useFilterState({ schema: createTestSchema(), value: [], onChange: vi.fn() })
      )

      act(() => {
        result.current.handleFocus()
      })

      expect(result.current.placeholder).toBe('Select field...')
    })

    it('should show operator placeholder after field selection', () => {
      const { result } = renderHook(() =>
        useFilterState({ schema: createTestSchema(), value: [], onChange: vi.fn() })
      )

      act(() => {
        result.current.handleFocus()
      })

      act(() => {
        result.current.handleSelect(result.current.suggestions[0]!)
      })

      expect(result.current.placeholder).toBe('Select operator...')
    })

    it('should show value placeholder after operator selection', () => {
      const { result } = renderHook(() =>
        useFilterState({ schema: createTestSchema(), value: [], onChange: vi.fn() })
      )

      act(() => {
        result.current.handleFocus()
      })

      act(() => {
        result.current.handleSelect(result.current.suggestions[0]!)
      })

      act(() => {
        result.current.handleSelect(result.current.suggestions[0]!)
      })

      expect(result.current.placeholder).toBe('Enter value...')
    })
  })
})
