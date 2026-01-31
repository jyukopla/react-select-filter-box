/**
 * Filter Reducer Tests
 *
 * Tests for the useReducer-based state management.
 */

import { describe, it, expect } from 'vitest'
import {
  filterReducer,
  initialFilterState,
  type FilterState,
  // Action creators
  focus,
  blur,
  inputChange,
  highlightSuggestion,
  selectField,
  selectOperator,
  confirmValue,
  selectConnector,
  complete,
  deleteLastStep,
  deleteToken,
  clearAll,
  startTokenEdit,
  completeTokenEdit,
  cancelTokenEdit,
  startOperatorEdit,
  cancelOperatorEdit,
  selectToken,
  selectAllTokens,
  deselectTokens,
  navigateLeft,
  navigateRight,
  setAnnouncement,
  closeDropdown,
  openDropdown,
  reset,
  // Selectors
  selectTokens,
  selectSuggestions,
  selectPlaceholder,
  selectIsTokenEditable,
  selectTokenExpressionIndex,
} from './filterReducer'
import type { FilterSchema, FilterExpression } from '@/types'

// =============================================================================
// Test Fixtures
// =============================================================================

const mockFieldValue = {
  key: 'status',
  label: 'Status',
  type: 'enum' as const,
}

const mockOperatorValue = {
  key: 'equals',
  label: 'equals',
  symbol: '=',
}

const mockConditionValue = {
  raw: 'active',
  display: 'active',
  serialized: 'active',
}

const mockSchema: FilterSchema = {
  fields: [
    {
      key: 'status',
      label: 'Status',
      type: 'enum',
      description: 'Process status',
      operators: [
        { key: 'equals', label: 'equals', symbol: '=' },
        { key: 'not-equals', label: 'not equals', symbol: '!=' },
      ],
    },
    {
      key: 'name',
      label: 'Name',
      type: 'string',
      operators: [
        { key: 'contains', label: 'contains' },
        { key: 'equals', label: 'equals', symbol: '=' },
      ],
    },
  ],
}

const mockExpressions: FilterExpression[] = [
  {
    condition: {
      field: mockFieldValue,
      operator: mockOperatorValue,
      value: mockConditionValue,
    },
  },
]

// =============================================================================
// Reducer Tests
// =============================================================================

describe('filterReducer', () => {
  describe('initial state', () => {
    it('should have correct initial values', () => {
      expect(initialFilterState.step).toBe('idle')
      expect(initialFilterState.isDropdownOpen).toBe(false)
      expect(initialFilterState.inputValue).toBe('')
      expect(initialFilterState.highlightedIndex).toBe(0)
      expect(initialFilterState.editingTokenIndex).toBe(-1)
      expect(initialFilterState.selectedTokenIndex).toBe(-1)
      expect(initialFilterState.allTokensSelected).toBe(false)
      expect(initialFilterState.currentField).toBeUndefined()
      expect(initialFilterState.currentOperator).toBeUndefined()
      expect(initialFilterState.announcement).toBe('')
      expect(initialFilterState.editingOperatorIndex).toBe(-1)
    })
  })

  describe('FOCUS action', () => {
    it('should transition from idle to selecting-field', () => {
      const result = filterReducer(initialFilterState, focus())
      expect(result.step).toBe('selecting-field')
      expect(result.isDropdownOpen).toBe(true)
    })

    it('should keep current step if not idle', () => {
      const state: FilterState = { ...initialFilterState, step: 'entering-value' }
      const result = filterReducer(state, focus())
      expect(result.step).toBe('entering-value')
      expect(result.isDropdownOpen).toBe(true)
    })
  })

  describe('BLUR action', () => {
    it('should reset to idle and close dropdown', () => {
      const state: FilterState = {
        ...initialFilterState,
        step: 'selecting-operator',
        isDropdownOpen: true,
        inputValue: 'test',
        currentField: mockFieldValue,
        currentOperator: mockOperatorValue,
        editingOperatorIndex: 1,
      }
      const result = filterReducer(state, blur())
      expect(result.step).toBe('idle')
      expect(result.isDropdownOpen).toBe(false)
      expect(result.inputValue).toBe('')
      expect(result.currentField).toBeUndefined()
      expect(result.currentOperator).toBeUndefined()
      expect(result.editingOperatorIndex).toBe(-1)
    })
  })

  describe('INPUT_CHANGE action', () => {
    it('should update input value and reset selection', () => {
      const state: FilterState = {
        ...initialFilterState,
        selectedTokenIndex: 2,
        allTokensSelected: true,
        highlightedIndex: 5,
      }
      const result = filterReducer(state, inputChange('test'))
      expect(result.inputValue).toBe('test')
      expect(result.selectedTokenIndex).toBe(-1)
      expect(result.allTokensSelected).toBe(false)
      expect(result.highlightedIndex).toBe(0)
    })
  })

  describe('HIGHLIGHT_SUGGESTION action', () => {
    it('should update highlighted index', () => {
      const result = filterReducer(initialFilterState, highlightSuggestion(3))
      expect(result.highlightedIndex).toBe(3)
    })
  })

  describe('SELECT_FIELD action', () => {
    it('should transition to selecting-operator', () => {
      const state: FilterState = { ...initialFilterState, step: 'selecting-field' }
      const result = filterReducer(state, selectField(mockFieldValue))
      expect(result.step).toBe('selecting-operator')
      expect(result.currentField).toEqual(mockFieldValue)
      expect(result.inputValue).toBe('')
      expect(result.highlightedIndex).toBe(0)
      expect(result.announcement).toContain('Status')
    })
  })

  describe('SELECT_OPERATOR action', () => {
    it('should transition to entering-value and close dropdown', () => {
      const state: FilterState = {
        ...initialFilterState,
        step: 'selecting-operator',
        currentField: mockFieldValue,
      }
      const result = filterReducer(state, selectOperator(mockOperatorValue))
      expect(result.step).toBe('entering-value')
      expect(result.currentOperator).toEqual(mockOperatorValue)
      expect(result.isDropdownOpen).toBe(false)
      expect(result.announcement).toContain('equals')
    })
  })

  describe('CONFIRM_VALUE action', () => {
    it('should transition to selecting-connector', () => {
      const state: FilterState = {
        ...initialFilterState,
        step: 'entering-value',
        currentField: mockFieldValue,
        currentOperator: mockOperatorValue,
      }
      const result = filterReducer(state, confirmValue(mockConditionValue))
      expect(result.step).toBe('selecting-connector')
      expect(result.currentField).toBeUndefined()
      expect(result.currentOperator).toBeUndefined()
      expect(result.isDropdownOpen).toBe(true)
      expect(result.announcement).toContain('active')
    })
  })

  describe('SELECT_CONNECTOR action', () => {
    it('should transition to selecting-field', () => {
      const state: FilterState = { ...initialFilterState, step: 'selecting-connector' }
      const result = filterReducer(state, selectConnector('AND'))
      expect(result.step).toBe('selecting-field')
      expect(result.announcement).toContain('AND')
    })
  })

  describe('COMPLETE action', () => {
    it('should transition to idle and close dropdown', () => {
      const state: FilterState = { ...initialFilterState, step: 'selecting-connector' }
      const result = filterReducer(state, complete())
      expect(result.step).toBe('idle')
      expect(result.isDropdownOpen).toBe(false)
    })
  })

  describe('DELETE_LAST_STEP action', () => {
    it('should go back from entering-value to selecting-operator', () => {
      const state: FilterState = {
        ...initialFilterState,
        step: 'entering-value',
        currentOperator: mockOperatorValue,
      }
      const result = filterReducer(state, deleteLastStep())
      expect(result.step).toBe('selecting-operator')
      expect(result.currentOperator).toBeUndefined()
      expect(result.isDropdownOpen).toBe(true)
    })

    it('should go back from selecting-operator to selecting-field', () => {
      const state: FilterState = {
        ...initialFilterState,
        step: 'selecting-operator',
        currentField: mockFieldValue,
      }
      const result = filterReducer(state, deleteLastStep())
      expect(result.step).toBe('selecting-field')
      expect(result.currentField).toBeUndefined()
    })

    it('should not change state from other steps', () => {
      const state: FilterState = { ...initialFilterState, step: 'selecting-connector' }
      const result = filterReducer(state, deleteLastStep())
      expect(result).toEqual(state)
    })
  })

  describe('DELETE_TOKEN action', () => {
    it('should deselect token and set announcement', () => {
      const state: FilterState = { ...initialFilterState, selectedTokenIndex: 2 }
      const result = filterReducer(state, deleteToken(2))
      expect(result.selectedTokenIndex).toBe(-1)
      expect(result.announcement).toContain('deleted')
    })
  })

  describe('CLEAR_ALL action', () => {
    it('should reset to initial state with announcement', () => {
      const state: FilterState = {
        ...initialFilterState,
        step: 'selecting-operator',
        currentField: mockFieldValue,
        inputValue: 'test',
      }
      const result = filterReducer(state, clearAll())
      expect(result.step).toBe('idle')
      expect(result.announcement).toContain('cleared')
    })
  })

  describe('token editing actions', () => {
    it('START_TOKEN_EDIT should set editing index and close dropdown', () => {
      const result = filterReducer(initialFilterState, startTokenEdit(2))
      expect(result.editingTokenIndex).toBe(2)
      expect(result.isDropdownOpen).toBe(false)
    })

    it('COMPLETE_TOKEN_EDIT should clear editing index', () => {
      const state: FilterState = { ...initialFilterState, editingTokenIndex: 2 }
      const result = filterReducer(state, completeTokenEdit(mockConditionValue))
      expect(result.editingTokenIndex).toBe(-1)
    })

    it('CANCEL_TOKEN_EDIT should clear editing index', () => {
      const state: FilterState = { ...initialFilterState, editingTokenIndex: 2 }
      const result = filterReducer(state, cancelTokenEdit())
      expect(result.editingTokenIndex).toBe(-1)
    })
  })

  describe('operator editing actions', () => {
    it('START_OPERATOR_EDIT should set editing index and open dropdown', () => {
      const result = filterReducer(initialFilterState, startOperatorEdit(1))
      expect(result.editingOperatorIndex).toBe(1)
      expect(result.isDropdownOpen).toBe(true)
      expect(result.highlightedIndex).toBe(0)
    })

    it('CANCEL_OPERATOR_EDIT should clear editing index and close dropdown', () => {
      const state: FilterState = {
        ...initialFilterState,
        editingOperatorIndex: 1,
        isDropdownOpen: true,
      }
      const result = filterReducer(state, cancelOperatorEdit())
      expect(result.editingOperatorIndex).toBe(-1)
      expect(result.isDropdownOpen).toBe(false)
    })
  })

  describe('token selection actions', () => {
    it('SELECT_TOKEN should set selected index and close dropdown', () => {
      const state: FilterState = {
        ...initialFilterState,
        isDropdownOpen: true,
        allTokensSelected: true,
      }
      const result = filterReducer(state, selectToken(2))
      expect(result.selectedTokenIndex).toBe(2)
      expect(result.allTokensSelected).toBe(false)
      expect(result.isDropdownOpen).toBe(false)
    })

    it('SELECT_ALL_TOKENS should set allTokensSelected', () => {
      const result = filterReducer(initialFilterState, selectAllTokens())
      expect(result.allTokensSelected).toBe(true)
    })

    it('DESELECT_TOKENS should clear selection', () => {
      const state: FilterState = {
        ...initialFilterState,
        selectedTokenIndex: 2,
        allTokensSelected: true,
      }
      const result = filterReducer(state, deselectTokens())
      expect(result.selectedTokenIndex).toBe(-1)
      expect(result.allTokensSelected).toBe(false)
    })
  })

  describe('navigation actions', () => {
    it('NAVIGATE_LEFT should select last token when none selected', () => {
      const result = filterReducer(initialFilterState, navigateLeft(5))
      expect(result.selectedTokenIndex).toBe(4)
      expect(result.isDropdownOpen).toBe(false)
    })

    it('NAVIGATE_LEFT should move to previous token', () => {
      const state: FilterState = { ...initialFilterState, selectedTokenIndex: 3 }
      const result = filterReducer(state, navigateLeft(5))
      expect(result.selectedTokenIndex).toBe(2)
    })

    it('NAVIGATE_LEFT should not go below 0', () => {
      const state: FilterState = { ...initialFilterState, selectedTokenIndex: 0 }
      const result = filterReducer(state, navigateLeft(5))
      expect(result.selectedTokenIndex).toBe(0)
    })

    it('NAVIGATE_LEFT should do nothing with no tokens', () => {
      const result = filterReducer(initialFilterState, navigateLeft(0))
      expect(result.selectedTokenIndex).toBe(-1)
    })

    it('NAVIGATE_RIGHT should move to next token', () => {
      const state: FilterState = { ...initialFilterState, selectedTokenIndex: 2 }
      const result = filterReducer(state, navigateRight(5))
      expect(result.selectedTokenIndex).toBe(3)
    })

    it('NAVIGATE_RIGHT should deselect at last token', () => {
      const state: FilterState = { ...initialFilterState, selectedTokenIndex: 4 }
      const result = filterReducer(state, navigateRight(5))
      expect(result.selectedTokenIndex).toBe(-1)
    })

    it('NAVIGATE_RIGHT should do nothing when not selected', () => {
      const result = filterReducer(initialFilterState, navigateRight(5))
      expect(result.selectedTokenIndex).toBe(-1)
    })
  })

  describe('utility actions', () => {
    it('SET_ANNOUNCEMENT should update announcement', () => {
      const result = filterReducer(initialFilterState, setAnnouncement('Hello'))
      expect(result.announcement).toBe('Hello')
    })

    it('CLOSE_DROPDOWN should set isDropdownOpen to false', () => {
      const state: FilterState = { ...initialFilterState, isDropdownOpen: true }
      const result = filterReducer(state, closeDropdown())
      expect(result.isDropdownOpen).toBe(false)
    })

    it('OPEN_DROPDOWN should set isDropdownOpen to true', () => {
      const result = filterReducer(initialFilterState, openDropdown())
      expect(result.isDropdownOpen).toBe(true)
    })

    it('RESET should return initial state', () => {
      const state: FilterState = {
        ...initialFilterState,
        step: 'entering-value',
        inputValue: 'test',
        currentField: mockFieldValue,
      }
      const result = filterReducer(state, reset())
      expect(result).toEqual(initialFilterState)
    })
  })

  describe('unknown action', () => {
    it('should return current state for unknown action', () => {
      const result = filterReducer(initialFilterState, { type: 'UNKNOWN' } as any)
      expect(result).toEqual(initialFilterState)
    })
  })
})

// =============================================================================
// Selector Tests
// =============================================================================

describe('selectors', () => {
  describe('selectTokens', () => {
    it('should return empty array for no expressions', () => {
      const tokens = selectTokens([])
      expect(tokens).toEqual([])
    })

    it('should convert expressions to tokens', () => {
      const tokens = selectTokens(mockExpressions)
      expect(tokens).toHaveLength(3) // field, operator, value
      expect(tokens[0].type).toBe('field')
      expect(tokens[1].type).toBe('operator')
      expect(tokens[2].type).toBe('value')
    })

    it('should include connector token when present', () => {
      const expressions: FilterExpression[] = [
        {
          ...mockExpressions[0],
          connector: 'AND',
        },
      ]
      const tokens = selectTokens(expressions)
      expect(tokens).toHaveLength(4)
      expect(tokens[3].type).toBe('connector')
    })

    it('should add pending field token', () => {
      const tokens = selectTokens([], mockFieldValue)
      expect(tokens).toHaveLength(1)
      expect(tokens[0].type).toBe('field')
      expect(tokens[0].isPending).toBe(true)
    })

    it('should add pending field and operator tokens', () => {
      const tokens = selectTokens([], mockFieldValue, mockOperatorValue)
      expect(tokens).toHaveLength(2)
      expect(tokens[0].type).toBe('field')
      expect(tokens[1].type).toBe('operator')
      expect(tokens[0].isPending).toBe(true)
      expect(tokens[1].isPending).toBe(true)
    })

    it('should set correct positions', () => {
      const tokens = selectTokens(mockExpressions, mockFieldValue)
      expect(tokens[0].position).toBe(0)
      expect(tokens[1].position).toBe(1)
      expect(tokens[2].position).toBe(2)
      expect(tokens[3].position).toBe(4) // After expression (4 slots reserved)
    })
  })

  describe('selectSuggestions', () => {
    it('should return fields when selecting-field', () => {
      const state: FilterState = { ...initialFilterState, step: 'selecting-field' }
      const suggestions = selectSuggestions(state, mockSchema, [])
      expect(suggestions).toHaveLength(2)
      expect(suggestions[0].label).toBe('Status')
      expect(suggestions[1].label).toBe('Name')
    })

    it('should filter fields by input value', () => {
      const state: FilterState = {
        ...initialFilterState,
        step: 'selecting-field',
        inputValue: 'stat',
      }
      const suggestions = selectSuggestions(state, mockSchema, [])
      expect(suggestions).toHaveLength(1)
      expect(suggestions[0].label).toBe('Status')
    })

    it('should return operators when selecting-operator', () => {
      const state: FilterState = {
        ...initialFilterState,
        step: 'selecting-operator',
        currentField: mockFieldValue,
      }
      const suggestions = selectSuggestions(state, mockSchema, [])
      expect(suggestions).toHaveLength(2)
      expect(suggestions[0].label).toBe('equals')
    })

    it('should return empty when selecting-operator with no field', () => {
      const state: FilterState = {
        ...initialFilterState,
        step: 'selecting-operator',
      }
      const suggestions = selectSuggestions(state, mockSchema, [])
      expect(suggestions).toHaveLength(0)
    })

    it('should return connectors when selecting-connector', () => {
      const state: FilterState = {
        ...initialFilterState,
        step: 'selecting-connector',
      }
      const suggestions = selectSuggestions(state, mockSchema, [])
      expect(suggestions).toHaveLength(2)
      expect(suggestions[0].label).toBe('AND')
      expect(suggestions[1].label).toBe('OR')
    })

    it('should return operators for editing operator index', () => {
      const state: FilterState = {
        ...initialFilterState,
        editingOperatorIndex: 0,
      }
      const suggestions = selectSuggestions(state, mockSchema, mockExpressions)
      expect(suggestions).toHaveLength(2)
      expect(suggestions[0].label).toBe('equals')
    })

    it('should return empty for idle state', () => {
      const suggestions = selectSuggestions(initialFilterState, mockSchema, [])
      expect(suggestions).toHaveLength(0)
    })
  })

  describe('selectPlaceholder', () => {
    it('should return correct placeholder for each step', () => {
      expect(selectPlaceholder('idle')).toBe('Add filter...')
      expect(selectPlaceholder('selecting-field')).toBe('Select field...')
      expect(selectPlaceholder('selecting-operator')).toBe('Select operator...')
      expect(selectPlaceholder('entering-value')).toBe('Enter value...')
      expect(selectPlaceholder('selecting-connector')).toBe('AND or OR?')
    })
  })

  describe('selectIsTokenEditable', () => {
    const tokens = selectTokens(mockExpressions)

    it('should return false for field tokens', () => {
      expect(selectIsTokenEditable(tokens, 0)).toBe(false)
    })

    it('should return false for operator tokens', () => {
      expect(selectIsTokenEditable(tokens, 1)).toBe(false)
    })

    it('should return true for value tokens', () => {
      expect(selectIsTokenEditable(tokens, 2)).toBe(true)
    })

    it('should return false for pending tokens', () => {
      const pendingTokens = selectTokens([], mockFieldValue)
      expect(selectIsTokenEditable(pendingTokens, 0)).toBe(false)
    })

    it('should return false for invalid index', () => {
      expect(selectIsTokenEditable(tokens, 99)).toBe(false)
    })
  })

  describe('selectTokenExpressionIndex', () => {
    const tokens = selectTokens(mockExpressions)

    it('should return expression index for completed tokens', () => {
      expect(selectTokenExpressionIndex(tokens, 0)).toBe(0)
      expect(selectTokenExpressionIndex(tokens, 1)).toBe(0)
      expect(selectTokenExpressionIndex(tokens, 2)).toBe(0)
    })

    it('should return -1 for pending tokens', () => {
      const pendingTokens = selectTokens([], mockFieldValue)
      expect(selectTokenExpressionIndex(pendingTokens, 0)).toBe(-1)
    })

    it('should return -1 for invalid index', () => {
      expect(selectTokenExpressionIndex(tokens, 99)).toBe(-1)
    })
  })
})

// =============================================================================
// Action Creator Tests
// =============================================================================

describe('action creators', () => {
  it('focus() should create FOCUS action', () => {
    expect(focus()).toEqual({ type: 'FOCUS' })
  })

  it('blur() should create BLUR action', () => {
    expect(blur()).toEqual({ type: 'BLUR' })
  })

  it('inputChange() should create INPUT_CHANGE action', () => {
    expect(inputChange('test')).toEqual({ type: 'INPUT_CHANGE', payload: 'test' })
  })

  it('highlightSuggestion() should create HIGHLIGHT_SUGGESTION action', () => {
    expect(highlightSuggestion(5)).toEqual({ type: 'HIGHLIGHT_SUGGESTION', payload: 5 })
  })

  it('selectField() should create SELECT_FIELD action', () => {
    expect(selectField(mockFieldValue)).toEqual({ type: 'SELECT_FIELD', payload: mockFieldValue })
  })

  it('selectOperator() should create SELECT_OPERATOR action', () => {
    expect(selectOperator(mockOperatorValue)).toEqual({ type: 'SELECT_OPERATOR', payload: mockOperatorValue })
  })

  it('confirmValue() should create CONFIRM_VALUE action', () => {
    expect(confirmValue(mockConditionValue)).toEqual({ type: 'CONFIRM_VALUE', payload: mockConditionValue })
  })

  it('selectConnector() should create SELECT_CONNECTOR action', () => {
    expect(selectConnector('AND')).toEqual({ type: 'SELECT_CONNECTOR', payload: 'AND' })
  })

  it('complete() should create COMPLETE action', () => {
    expect(complete()).toEqual({ type: 'COMPLETE' })
  })

  it('deleteLastStep() should create DELETE_LAST_STEP action', () => {
    expect(deleteLastStep()).toEqual({ type: 'DELETE_LAST_STEP' })
  })

  it('deleteToken() should create DELETE_TOKEN action', () => {
    expect(deleteToken(2)).toEqual({ type: 'DELETE_TOKEN', payload: 2 })
  })

  it('clearAll() should create CLEAR_ALL action', () => {
    expect(clearAll()).toEqual({ type: 'CLEAR_ALL' })
  })

  it('startTokenEdit() should create START_TOKEN_EDIT action', () => {
    expect(startTokenEdit(2)).toEqual({ type: 'START_TOKEN_EDIT', payload: 2 })
  })

  it('completeTokenEdit() should create COMPLETE_TOKEN_EDIT action', () => {
    expect(completeTokenEdit(mockConditionValue)).toEqual({ type: 'COMPLETE_TOKEN_EDIT', payload: mockConditionValue })
  })

  it('cancelTokenEdit() should create CANCEL_TOKEN_EDIT action', () => {
    expect(cancelTokenEdit()).toEqual({ type: 'CANCEL_TOKEN_EDIT' })
  })

  it('startOperatorEdit() should create START_OPERATOR_EDIT action', () => {
    expect(startOperatorEdit(1)).toEqual({ type: 'START_OPERATOR_EDIT', payload: 1 })
  })

  it('cancelOperatorEdit() should create CANCEL_OPERATOR_EDIT action', () => {
    expect(cancelOperatorEdit()).toEqual({ type: 'CANCEL_OPERATOR_EDIT' })
  })

  it('selectToken() should create SELECT_TOKEN action', () => {
    expect(selectToken(2)).toEqual({ type: 'SELECT_TOKEN', payload: 2 })
  })

  it('selectAllTokens() should create SELECT_ALL_TOKENS action', () => {
    expect(selectAllTokens()).toEqual({ type: 'SELECT_ALL_TOKENS' })
  })

  it('deselectTokens() should create DESELECT_TOKENS action', () => {
    expect(deselectTokens()).toEqual({ type: 'DESELECT_TOKENS' })
  })

  it('navigateLeft() should create NAVIGATE_LEFT action', () => {
    expect(navigateLeft(5)).toEqual({ type: 'NAVIGATE_LEFT', payload: { tokenCount: 5 } })
  })

  it('navigateRight() should create NAVIGATE_RIGHT action', () => {
    expect(navigateRight(5)).toEqual({ type: 'NAVIGATE_RIGHT', payload: { tokenCount: 5 } })
  })

  it('setAnnouncement() should create SET_ANNOUNCEMENT action', () => {
    expect(setAnnouncement('Test')).toEqual({ type: 'SET_ANNOUNCEMENT', payload: 'Test' })
  })

  it('closeDropdown() should create CLOSE_DROPDOWN action', () => {
    expect(closeDropdown()).toEqual({ type: 'CLOSE_DROPDOWN' })
  })

  it('openDropdown() should create OPEN_DROPDOWN action', () => {
    expect(openDropdown()).toEqual({ type: 'OPEN_DROPDOWN' })
  })

  it('reset() should create RESET action', () => {
    expect(reset()).toEqual({ type: 'RESET' })
  })
})
