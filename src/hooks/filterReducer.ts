/**
 * Filter State Reducer
 *
 * Implements useReducer pattern for complex state transitions in FilterBox.
 * This consolidates all filter-related state into a single reducer with typed actions.
 *
 * @module filterReducer
 */

import type {
  FilterExpression,
  AutocompleteItem,
  TokenData,
  FieldValue,
  OperatorValue,
  ConditionValue,
  FilterSchema,
} from '@/types'
import type { FilterStep } from '@/core'

// =============================================================================
// State Shape
// =============================================================================

/**
 * Complete state shape for the filter reducer
 */
export interface FilterState {
  /** Current step in the filter building process */
  step: FilterStep
  /** Whether the dropdown is currently open */
  isDropdownOpen: boolean
  /** Current value in the text input */
  inputValue: string
  /** Index of the currently highlighted suggestion */
  highlightedIndex: number
  /** Index of token being edited (-1 if none) */
  editingTokenIndex: number
  /** Index of currently selected token (-1 if none) */
  selectedTokenIndex: number
  /** Whether all tokens are selected (via Ctrl+A) */
  allTokensSelected: boolean
  /** Field being built for current expression */
  currentField: FieldValue | undefined
  /** Operator being built for current expression */
  currentOperator: OperatorValue | undefined
  /** Screen reader announcement text */
  announcement: string
  /** Index of expression whose operator is being edited (-1 if none) */
  editingOperatorIndex: number
}

/**
 * Initial state for the filter reducer
 */
export const initialFilterState: FilterState = {
  step: 'idle',
  isDropdownOpen: false,
  inputValue: '',
  highlightedIndex: 0,
  editingTokenIndex: -1,
  selectedTokenIndex: -1,
  allTokensSelected: false,
  currentField: undefined,
  currentOperator: undefined,
  announcement: '',
  editingOperatorIndex: -1,
}

// =============================================================================
// Action Types
// =============================================================================

/**
 * All possible action types for the filter reducer
 */
export type FilterActionType =
  | 'FOCUS'
  | 'BLUR'
  | 'INPUT_CHANGE'
  | 'HIGHLIGHT_SUGGESTION'
  | 'SELECT_FIELD'
  | 'SELECT_OPERATOR'
  | 'CONFIRM_VALUE'
  | 'SELECT_CONNECTOR'
  | 'COMPLETE'
  | 'DELETE_LAST_STEP'
  | 'DELETE_TOKEN'
  | 'CLEAR_ALL'
  | 'START_TOKEN_EDIT'
  | 'COMPLETE_TOKEN_EDIT'
  | 'CANCEL_TOKEN_EDIT'
  | 'START_OPERATOR_EDIT'
  | 'CANCEL_OPERATOR_EDIT'
  | 'SELECT_TOKEN'
  | 'SELECT_ALL_TOKENS'
  | 'DESELECT_TOKENS'
  | 'NAVIGATE_LEFT'
  | 'NAVIGATE_RIGHT'
  | 'SET_ANNOUNCEMENT'
  | 'CLOSE_DROPDOWN'
  | 'OPEN_DROPDOWN'
  | 'RESET'

/**
 * Discriminated union of all filter actions
 */
export type FilterAction =
  | { type: 'FOCUS' }
  | { type: 'BLUR' }
  | { type: 'INPUT_CHANGE'; payload: string }
  | { type: 'HIGHLIGHT_SUGGESTION'; payload: number }
  | { type: 'SELECT_FIELD'; payload: FieldValue }
  | { type: 'SELECT_OPERATOR'; payload: OperatorValue }
  | { type: 'CONFIRM_VALUE'; payload: ConditionValue }
  | { type: 'SELECT_CONNECTOR'; payload: 'AND' | 'OR' }
  | { type: 'COMPLETE' }
  | { type: 'DELETE_LAST_STEP' }
  | { type: 'DELETE_TOKEN'; payload: number }
  | { type: 'CLEAR_ALL' }
  | { type: 'START_TOKEN_EDIT'; payload: number }
  | { type: 'COMPLETE_TOKEN_EDIT'; payload: ConditionValue }
  | { type: 'CANCEL_TOKEN_EDIT' }
  | { type: 'START_OPERATOR_EDIT'; payload: number }
  | { type: 'CANCEL_OPERATOR_EDIT' }
  | { type: 'SELECT_TOKEN'; payload: number }
  | { type: 'SELECT_ALL_TOKENS' }
  | { type: 'DESELECT_TOKENS' }
  | { type: 'NAVIGATE_LEFT'; payload: { tokenCount: number } }
  | { type: 'NAVIGATE_RIGHT'; payload: { tokenCount: number } }
  | { type: 'SET_ANNOUNCEMENT'; payload: string }
  | { type: 'CLOSE_DROPDOWN' }
  | { type: 'OPEN_DROPDOWN' }
  | { type: 'RESET' }

// =============================================================================
// Reducer Implementation
// =============================================================================

/**
 * Main filter reducer function
 *
 * Handles all state transitions for the filter box in a centralized,
 * predictable manner. Each action produces a new state without mutations.
 *
 * @param state - Current filter state
 * @param action - Action to apply
 * @returns New filter state
 */
export function filterReducer(state: FilterState, action: FilterAction): FilterState {
  switch (action.type) {
    case 'FOCUS':
      return {
        ...state,
        step: state.step === 'idle' ? 'selecting-field' : state.step,
        isDropdownOpen: true,
      }

    case 'BLUR':
      return {
        ...state,
        step: 'idle',
        isDropdownOpen: false,
        inputValue: '',
        currentField: undefined,
        currentOperator: undefined,
        editingOperatorIndex: -1,
      }

    case 'INPUT_CHANGE':
      return {
        ...state,
        inputValue: action.payload,
        selectedTokenIndex: -1,
        allTokensSelected: false,
        highlightedIndex: 0,
      }

    case 'HIGHLIGHT_SUGGESTION':
      return {
        ...state,
        highlightedIndex: action.payload,
      }

    case 'SELECT_FIELD':
      return {
        ...state,
        step: 'selecting-operator',
        currentField: action.payload,
        inputValue: '',
        highlightedIndex: 0,
        announcement: `Selected ${action.payload.label}. Now select an operator.`,
      }

    case 'SELECT_OPERATOR':
      return {
        ...state,
        step: 'entering-value',
        currentOperator: action.payload,
        inputValue: '',
        isDropdownOpen: false,
        highlightedIndex: 0,
        announcement: `Selected ${action.payload.label}. Now enter a value.`,
      }

    case 'CONFIRM_VALUE':
      return {
        ...state,
        step: 'selecting-connector',
        currentField: undefined,
        currentOperator: undefined,
        inputValue: '',
        isDropdownOpen: true,
        highlightedIndex: 0,
        announcement: `Filter added: value "${action.payload.display}". Select AND, OR, or press Enter to finish.`,
      }

    case 'SELECT_CONNECTOR':
      return {
        ...state,
        step: 'selecting-field',
        inputValue: '',
        highlightedIndex: 0,
        announcement: `Added ${action.payload} connector. Now select a field.`,
      }

    case 'COMPLETE':
      return {
        ...state,
        step: 'idle',
        isDropdownOpen: false,
        inputValue: '',
        announcement: 'Filter expression complete.',
      }

    case 'DELETE_LAST_STEP':
      // Handle stepping back in the expression building process
      if (state.step === 'entering-value') {
        return {
          ...state,
          step: 'selecting-operator',
          currentOperator: undefined,
          isDropdownOpen: true,
          announcement: 'Operator removed. Select operator.',
        }
      }
      if (state.step === 'selecting-operator') {
        return {
          ...state,
          step: 'selecting-field',
          currentField: undefined,
          isDropdownOpen: true,
          announcement: 'Field removed. Select field.',
        }
      }
      return state

    case 'DELETE_TOKEN':
      return {
        ...state,
        selectedTokenIndex: -1,
        announcement: `Filter expression deleted.`,
      }

    case 'CLEAR_ALL':
      return {
        ...initialFilterState,
        step: 'idle',
        announcement: 'All filters cleared.',
      }

    case 'START_TOKEN_EDIT':
      return {
        ...state,
        editingTokenIndex: action.payload,
        isDropdownOpen: false,
      }

    case 'COMPLETE_TOKEN_EDIT':
      return {
        ...state,
        editingTokenIndex: -1,
      }

    case 'CANCEL_TOKEN_EDIT':
      return {
        ...state,
        editingTokenIndex: -1,
      }

    case 'START_OPERATOR_EDIT':
      return {
        ...state,
        editingOperatorIndex: action.payload,
        isDropdownOpen: true,
        highlightedIndex: 0,
        announcement: 'Select a new operator.',
      }

    case 'CANCEL_OPERATOR_EDIT':
      return {
        ...state,
        editingOperatorIndex: -1,
        isDropdownOpen: false,
      }

    case 'SELECT_TOKEN':
      return {
        ...state,
        selectedTokenIndex: action.payload,
        allTokensSelected: false,
        isDropdownOpen: false,
      }

    case 'SELECT_ALL_TOKENS':
      return {
        ...state,
        allTokensSelected: true,
      }

    case 'DESELECT_TOKENS':
      return {
        ...state,
        selectedTokenIndex: -1,
        allTokensSelected: false,
      }

    case 'NAVIGATE_LEFT': {
      const { tokenCount } = action.payload
      if (tokenCount === 0) return state
      if (state.selectedTokenIndex === -1) {
        return {
          ...state,
          selectedTokenIndex: tokenCount - 1,
          isDropdownOpen: false,
        }
      }
      if (state.selectedTokenIndex > 0) {
        return {
          ...state,
          selectedTokenIndex: state.selectedTokenIndex - 1,
        }
      }
      return state
    }

    case 'NAVIGATE_RIGHT': {
      const { tokenCount } = action.payload
      if (state.selectedTokenIndex < 0) return state
      if (state.selectedTokenIndex < tokenCount - 1) {
        return {
          ...state,
          selectedTokenIndex: state.selectedTokenIndex + 1,
        }
      }
      return {
        ...state,
        selectedTokenIndex: -1,
      }
    }

    case 'SET_ANNOUNCEMENT':
      return {
        ...state,
        announcement: action.payload,
      }

    case 'CLOSE_DROPDOWN':
      return {
        ...state,
        isDropdownOpen: false,
      }

    case 'OPEN_DROPDOWN':
      return {
        ...state,
        isDropdownOpen: true,
      }

    case 'RESET':
      return initialFilterState

    default:
      return state
  }
}

// =============================================================================
// State Selectors
// =============================================================================

/**
 * Convert expressions to tokens for display
 */
export function selectTokens(
  expressions: FilterExpression[],
  currentField?: FieldValue,
  currentOperator?: OperatorValue
): TokenData[] {
  const tokens: TokenData[] = []
  let position = 0

  // Add tokens from completed expressions
  expressions.forEach((expr, exprIndex) => {
    // Field token
    tokens.push({
      id: `${exprIndex}-field`,
      type: 'field',
      value: expr.condition.field,
      position: position++,
      expressionIndex: exprIndex,
      isPending: false,
    })

    // Operator token
    tokens.push({
      id: `${exprIndex}-operator`,
      type: 'operator',
      value: expr.condition.operator,
      position: position++,
      expressionIndex: exprIndex,
      isPending: false,
    })

    // Value token
    tokens.push({
      id: `${exprIndex}-value`,
      type: 'value',
      value: expr.condition.value,
      position: position++,
      expressionIndex: exprIndex,
      isPending: false,
    })

    // Connector token (if present)
    if (expr.connector) {
      tokens.push({
        id: `${exprIndex}-connector`,
        type: 'connector',
        value: { key: expr.connector, label: expr.connector },
        position: position++,
        expressionIndex: exprIndex,
        isPending: false,
      })
    }
  })

  // Add pending tokens for expression being built
  const basePosition = expressions.length * 4

  if (currentField) {
    tokens.push({
      id: 'pending-field',
      type: 'field',
      value: currentField,
      position: basePosition,
      expressionIndex: -1,
      isPending: true,
    })
  }

  if (currentOperator) {
    tokens.push({
      id: 'pending-operator',
      type: 'operator',
      value: currentOperator,
      position: basePosition + 1,
      expressionIndex: -1,
      isPending: true,
    })
  }

  return tokens
}

/**
 * Get suggestions based on current state
 */
export function selectSuggestions(
  state: FilterState,
  schema: FilterSchema,
  expressions: FilterExpression[]
): AutocompleteItem[] {
  const { step, currentField, inputValue, editingOperatorIndex } = state

  const filterByInput = (items: AutocompleteItem[]) => {
    if (!inputValue) return items
    const lower = inputValue.toLowerCase()
    return items.filter(
      (item) =>
        item.label.toLowerCase().includes(lower) ||
        (item.description?.toLowerCase().includes(lower) ?? false)
    )
  }

  // If editing an operator, show operators for that expression's field
  if (editingOperatorIndex >= 0 && expressions[editingOperatorIndex]) {
    const expr = expressions[editingOperatorIndex]
    const fieldKey = expr.condition.field.key
    const fieldConfig = schema.fields.find((f) => f.key === fieldKey)
    if (fieldConfig) {
      return fieldConfig.operators.map((op) => ({
        type: 'operator' as const,
        key: op.key,
        label: op.label,
        description: op.symbol ? `Symbol: ${op.symbol}` : undefined,
      }))
    }
    return []
  }

  switch (step) {
    case 'selecting-field':
      return filterByInput(
        schema.fields.map((field) => ({
          type: 'field' as const,
          key: field.key,
          label: field.label,
          description: field.description,
          icon: field.icon,
          group: field.group,
        }))
      )

    case 'selecting-operator': {
      if (!currentField) return []
      const fieldConfig = schema.fields.find((f) => f.key === currentField.key)
      if (!fieldConfig) return []
      return filterByInput(
        fieldConfig.operators.map((op) => ({
          type: 'operator' as const,
          key: op.key,
          label: op.label,
          description: op.symbol ? `Symbol: ${op.symbol}` : undefined,
        }))
      )
    }

    case 'selecting-connector': {
      const connectors = schema.connectors ?? [
        { key: 'AND' as const, label: 'AND' },
        { key: 'OR' as const, label: 'OR' },
      ]
      return filterByInput(
        connectors.map((conn) => ({
          type: 'connector' as const,
          key: conn.key,
          label: conn.label,
        }))
      )
    }

    default:
      return []
  }
}

/**
 * Get placeholder text based on current step
 */
export function selectPlaceholder(step: FilterStep): string {
  switch (step) {
    case 'selecting-field':
      return 'Select field...'
    case 'selecting-operator':
      return 'Select operator...'
    case 'entering-value':
      return 'Enter value...'
    case 'selecting-connector':
      return 'AND or OR?'
    default:
      return 'Add filter...'
  }
}

/**
 * Check if a token can be edited (only value tokens)
 */
export function selectIsTokenEditable(tokens: TokenData[], tokenIndex: number): boolean {
  const token = tokens[tokenIndex]
  return token?.type === 'value' && !token.isPending
}

/**
 * Get the expression index for a token
 */
export function selectTokenExpressionIndex(tokens: TokenData[], tokenIndex: number): number {
  const token = tokens[tokenIndex]
  return token?.expressionIndex ?? -1
}

// =============================================================================
// Action Creators
// =============================================================================

/**
 * Create a FOCUS action
 */
export function focus(): FilterAction {
  return { type: 'FOCUS' }
}

/**
 * Create a BLUR action
 */
export function blur(): FilterAction {
  return { type: 'BLUR' }
}

/**
 * Create an INPUT_CHANGE action
 */
export function inputChange(value: string): FilterAction {
  return { type: 'INPUT_CHANGE', payload: value }
}

/**
 * Create a HIGHLIGHT_SUGGESTION action
 */
export function highlightSuggestion(index: number): FilterAction {
  return { type: 'HIGHLIGHT_SUGGESTION', payload: index }
}

/**
 * Create a SELECT_FIELD action
 */
export function selectField(field: FieldValue): FilterAction {
  return { type: 'SELECT_FIELD', payload: field }
}

/**
 * Create a SELECT_OPERATOR action
 */
export function selectOperator(operator: OperatorValue): FilterAction {
  return { type: 'SELECT_OPERATOR', payload: operator }
}

/**
 * Create a CONFIRM_VALUE action
 */
export function confirmValue(value: ConditionValue): FilterAction {
  return { type: 'CONFIRM_VALUE', payload: value }
}

/**
 * Create a SELECT_CONNECTOR action
 */
export function selectConnector(connector: 'AND' | 'OR'): FilterAction {
  return { type: 'SELECT_CONNECTOR', payload: connector }
}

/**
 * Create a COMPLETE action
 */
export function complete(): FilterAction {
  return { type: 'COMPLETE' }
}

/**
 * Create a DELETE_LAST_STEP action
 */
export function deleteLastStep(): FilterAction {
  return { type: 'DELETE_LAST_STEP' }
}

/**
 * Create a DELETE_TOKEN action
 */
export function deleteToken(tokenIndex: number): FilterAction {
  return { type: 'DELETE_TOKEN', payload: tokenIndex }
}

/**
 * Create a CLEAR_ALL action
 */
export function clearAll(): FilterAction {
  return { type: 'CLEAR_ALL' }
}

/**
 * Create a START_TOKEN_EDIT action
 */
export function startTokenEdit(tokenIndex: number): FilterAction {
  return { type: 'START_TOKEN_EDIT', payload: tokenIndex }
}

/**
 * Create a COMPLETE_TOKEN_EDIT action
 */
export function completeTokenEdit(value: ConditionValue): FilterAction {
  return { type: 'COMPLETE_TOKEN_EDIT', payload: value }
}

/**
 * Create a CANCEL_TOKEN_EDIT action
 */
export function cancelTokenEdit(): FilterAction {
  return { type: 'CANCEL_TOKEN_EDIT' }
}

/**
 * Create a START_OPERATOR_EDIT action
 */
export function startOperatorEdit(expressionIndex: number): FilterAction {
  return { type: 'START_OPERATOR_EDIT', payload: expressionIndex }
}

/**
 * Create a CANCEL_OPERATOR_EDIT action
 */
export function cancelOperatorEdit(): FilterAction {
  return { type: 'CANCEL_OPERATOR_EDIT' }
}

/**
 * Create a SELECT_TOKEN action
 */
export function selectToken(tokenIndex: number): FilterAction {
  return { type: 'SELECT_TOKEN', payload: tokenIndex }
}

/**
 * Create a SELECT_ALL_TOKENS action
 */
export function selectAllTokens(): FilterAction {
  return { type: 'SELECT_ALL_TOKENS' }
}

/**
 * Create a DESELECT_TOKENS action
 */
export function deselectTokens(): FilterAction {
  return { type: 'DESELECT_TOKENS' }
}

/**
 * Create a NAVIGATE_LEFT action
 */
export function navigateLeft(tokenCount: number): FilterAction {
  return { type: 'NAVIGATE_LEFT', payload: { tokenCount } }
}

/**
 * Create a NAVIGATE_RIGHT action
 */
export function navigateRight(tokenCount: number): FilterAction {
  return { type: 'NAVIGATE_RIGHT', payload: { tokenCount } }
}

/**
 * Create a SET_ANNOUNCEMENT action
 */
export function setAnnouncement(message: string): FilterAction {
  return { type: 'SET_ANNOUNCEMENT', payload: message }
}

/**
 * Create a CLOSE_DROPDOWN action
 */
export function closeDropdown(): FilterAction {
  return { type: 'CLOSE_DROPDOWN' }
}

/**
 * Create an OPEN_DROPDOWN action
 */
export function openDropdown(): FilterAction {
  return { type: 'OPEN_DROPDOWN' }
}

/**
 * Create a RESET action
 */
export function reset(): FilterAction {
  return { type: 'RESET' }
}
