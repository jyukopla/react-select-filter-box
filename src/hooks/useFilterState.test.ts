import { describe, expect, it, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useFilterState } from './useFilterState'
import type { FilterSchema, FieldValue, OperatorValue, ConditionValue, FilterExpression } from '@/types'

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

    it('should select highlighted item on Tab when dropdown is open', () => {
      const { result } = renderHook(() =>
        useFilterState({ schema: createTestSchema(), value: [], onChange: vi.fn() })
      )

      act(() => {
        result.current.handleFocus()
      })

      expect(result.current.isDropdownOpen).toBe(true)

      const preventDefault = vi.fn()
      act(() => {
        result.current.handleKeyDown({
          key: 'Tab',
          preventDefault,
        } as unknown as React.KeyboardEvent<HTMLInputElement>)
      })

      // Tab should select the first field and move to operator selection
      expect(result.current.state).toBe('selecting-operator')
      expect(preventDefault).toHaveBeenCalled()
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

  describe('Token Selection', () => {
    it('should have selectedTokenIndex of -1 initially', () => {
      const { result } = renderHook(() =>
        useFilterState({ schema: createTestSchema(), value: [], onChange: vi.fn() })
      )

      expect(result.current.selectedTokenIndex).toBe(-1)
    })

    it('should select last token when pressing ArrowLeft with empty input', () => {
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

      // Focus the input
      act(() => {
        result.current.handleFocus()
      })

      // Clear input if needed
      act(() => {
        result.current.handleInputChange('')
      })

      const preventDefault = vi.fn()
      act(() => {
        result.current.handleKeyDown({
          key: 'ArrowLeft',
          preventDefault,
        } as unknown as React.KeyboardEvent<HTMLInputElement>)
      })

      // Should select the last token (value token at index 2)
      expect(result.current.selectedTokenIndex).toBe(2)
      expect(preventDefault).toHaveBeenCalled()
    })

    it('should navigate to previous token with ArrowLeft', () => {
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

      act(() => {
        result.current.handleFocus()
        result.current.handleInputChange('')
      })

      // Select last token
      act(() => {
        result.current.handleKeyDown({
          key: 'ArrowLeft',
          preventDefault: vi.fn(),
        } as unknown as React.KeyboardEvent<HTMLInputElement>)
      })

      expect(result.current.selectedTokenIndex).toBe(2)

      // Navigate to previous token
      act(() => {
        result.current.handleKeyDown({
          key: 'ArrowLeft',
          preventDefault: vi.fn(),
        } as unknown as React.KeyboardEvent<HTMLInputElement>)
      })

      expect(result.current.selectedTokenIndex).toBe(1)
    })

    it('should clear token selection and focus input when pressing ArrowRight on last token', () => {
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

      act(() => {
        result.current.handleFocus()
        result.current.handleInputChange('')
      })

      // Select last token
      act(() => {
        result.current.handleKeyDown({
          key: 'ArrowLeft',
          preventDefault: vi.fn(),
        } as unknown as React.KeyboardEvent<HTMLInputElement>)
      })

      expect(result.current.selectedTokenIndex).toBe(2)

      // Press ArrowRight should deselect and focus input
      act(() => {
        result.current.handleKeyDown({
          key: 'ArrowRight',
          preventDefault: vi.fn(),
        } as unknown as React.KeyboardEvent<HTMLInputElement>)
      })

      expect(result.current.selectedTokenIndex).toBe(-1)
    })

    it('should navigate to next token with ArrowRight when not on last token', () => {
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

      act(() => {
        result.current.handleFocus()
        result.current.handleInputChange('')
      })

      // Select first token by going left multiple times
      act(() => {
        result.current.handleKeyDown({
          key: 'ArrowLeft',
          preventDefault: vi.fn(),
        } as unknown as React.KeyboardEvent<HTMLInputElement>)
      })
      act(() => {
        result.current.handleKeyDown({
          key: 'ArrowLeft',
          preventDefault: vi.fn(),
        } as unknown as React.KeyboardEvent<HTMLInputElement>)
      })
      act(() => {
        result.current.handleKeyDown({
          key: 'ArrowLeft',
          preventDefault: vi.fn(),
        } as unknown as React.KeyboardEvent<HTMLInputElement>)
      })

      expect(result.current.selectedTokenIndex).toBe(0)

      // Navigate right
      act(() => {
        result.current.handleKeyDown({
          key: 'ArrowRight',
          preventDefault: vi.fn(),
        } as unknown as React.KeyboardEvent<HTMLInputElement>)
      })

      expect(result.current.selectedTokenIndex).toBe(1)
    })

    it('should delete selected token when pressing Delete', () => {
      const initialValue = [
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

      act(() => {
        result.current.handleFocus()
        result.current.handleInputChange('')
      })

      // Select last token
      act(() => {
        result.current.handleKeyDown({
          key: 'ArrowLeft',
          preventDefault: vi.fn(),
        } as unknown as React.KeyboardEvent<HTMLInputElement>)
      })

      expect(result.current.selectedTokenIndex).toBe(2)

      // Delete the selected token - this should delete the whole expression since all parts are related
      act(() => {
        result.current.handleKeyDown({
          key: 'Delete',
          preventDefault: vi.fn(),
        } as unknown as React.KeyboardEvent<HTMLInputElement>)
      })

      // Should call onChange with empty array (whole expression deleted)
      expect(onChange).toHaveBeenCalledWith([])
    })

    it('should clear token selection when typing in input', () => {
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

      act(() => {
        result.current.handleFocus()
        result.current.handleInputChange('')
      })

      // Select a token
      act(() => {
        result.current.handleKeyDown({
          key: 'ArrowLeft',
          preventDefault: vi.fn(),
        } as unknown as React.KeyboardEvent<HTMLInputElement>)
      })

      expect(result.current.selectedTokenIndex).toBe(2)

      // Type something
      act(() => {
        result.current.handleInputChange('test')
      })

      expect(result.current.selectedTokenIndex).toBe(-1)
    })
  })

  describe('Modifier Key Combinations', () => {
    it('should select all tokens with Ctrl+A', () => {
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

      act(() => {
        result.current.handleFocus()
      })

      const preventDefault = vi.fn()
      act(() => {
        result.current.handleKeyDown({
          key: 'a',
          ctrlKey: true,
          preventDefault,
        } as unknown as React.KeyboardEvent<HTMLInputElement>)
      })

      // Should have all tokens selected
      expect(result.current.allTokensSelected).toBe(true)
      expect(preventDefault).toHaveBeenCalled()
    })

    it('should delete all expressions with Ctrl+Backspace', () => {
      const initialValue = [
        {
          condition: {
            field: { key: 'status', label: 'Status', type: 'enum' as const },
            operator: { key: 'eq', label: 'equals', symbol: '=' },
            value: { raw: 'active', display: 'Active', serialized: 'active' },
          },
        },
        {
          connector: { key: 'AND' as const, label: 'AND' },
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

      act(() => {
        result.current.handleFocus()
      })

      const preventDefault = vi.fn()
      act(() => {
        result.current.handleKeyDown({
          key: 'Backspace',
          ctrlKey: true,
          preventDefault,
        } as unknown as React.KeyboardEvent<HTMLInputElement>)
      })

      // Should clear all expressions
      expect(onChange).toHaveBeenCalledWith([])
      expect(preventDefault).toHaveBeenCalled()
    })
  })

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
        ({ value }) =>
          useFilterState({ schema: createTestSchema(), value, onChange }),
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
      expect(result.current.tokens.some(t => t.isPending)).toBe(false)
      expect(result.current.tokens).toHaveLength(3) // field, operator, value
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
      expect(result.current.suggestions.every(s => s.type === 'operator')).toBe(true)
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
})
