import { describe, expect, it, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useFilterState } from './useFilterState'
import { createTestSchema } from './useFilterState.testUtils'

describe('useFilterState - Keyboard Navigation', () => {
  describe('Basic Navigation', () => {
    it('should highlight next item on arrow down', () => {
      const { result } = renderHook(() =>
        useFilterState({ schema: createTestSchema(), value: [], onChange: vi.fn() })
      )

      act(() => {
        result.current.handleFocus()
      })

      expect(result.current.highlightedIndex).toBe(0)

      act(() => {
        result.current.handleKeyDown({
          key: 'ArrowDown',
          preventDefault: vi.fn(),
        } as unknown as React.KeyboardEvent<HTMLInputElement>)
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
        result.current.handleKeyDown({
          key: 'ArrowDown',
          preventDefault: vi.fn(),
        } as unknown as React.KeyboardEvent<HTMLInputElement>)
      })

      act(() => {
        result.current.handleKeyDown({
          key: 'ArrowUp',
          preventDefault: vi.fn(),
        } as unknown as React.KeyboardEvent<HTMLInputElement>)
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
          connector: 'AND' as const,
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
})
