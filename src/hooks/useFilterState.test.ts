import { describe, expect, it, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useFilterState } from './useFilterState'
import type { FilterSchema, FieldValue, OperatorValue, ConditionValue } from '@/types'

describe('useFilterState', () => {
  const createTestSchema = (): FilterSchema => ({
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

  describe('Keyboard Navigation', () => {
    it('should highlight next item on arrow down', () => {
      const { result } = renderHook(() =>
        useFilterState({ schema: createTestSchema(), value: [], onChange: vi.fn() })
      )

      act(() => {
        result.current.handleFocus()
      })

      expect(result.current.highlightedIndex).toBe(0)

      act(() => {
        result.current.handleKeyDown({ key: 'ArrowDown', preventDefault: vi.fn() } as unknown as React.KeyboardEvent<HTMLInputElement>)
      })

      expect(result.current.highlightedIndex).toBe(1)
    })

    it('should highlight previous item on arrow up', () => {
      const { result } = renderHook(() =>
        useFilterState({ schema: createTestSchema(), value: [], onChange: vi.fn() })
      )

      act(() => {
        result.current.handleFocus()
      })

      act(() => {
        result.current.handleKeyDown({ key: 'ArrowDown', preventDefault: vi.fn() } as unknown as React.KeyboardEvent<HTMLInputElement>)
      })

      act(() => {
        result.current.handleKeyDown({ key: 'ArrowUp', preventDefault: vi.fn() } as unknown as React.KeyboardEvent<HTMLInputElement>)
      })

      expect(result.current.highlightedIndex).toBe(0)
    })

    it('should select highlighted item on enter', () => {
      const { result } = renderHook(() =>
        useFilterState({ schema: createTestSchema(), value: [], onChange: vi.fn() })
      )

      act(() => {
        result.current.handleFocus()
      })

      act(() => {
        result.current.handleKeyDown({
          key: 'Enter',
          preventDefault: vi.fn(),
        } as unknown as React.KeyboardEvent<HTMLInputElement>)
      })

      expect(result.current.state).toBe('selecting-operator')
    })

    it('should close dropdown on escape', () => {
      const { result } = renderHook(() =>
        useFilterState({ schema: createTestSchema(), value: [], onChange: vi.fn() })
      )

      act(() => {
        result.current.handleFocus()
      })

      act(() => {
        result.current.handleKeyDown({ key: 'Escape' } as React.KeyboardEvent<HTMLInputElement>)
      })

      expect(result.current.isDropdownOpen).toBe(false)
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
