/**
 * Filter State Machine
 *
 * Manages the state transitions for building filter expressions.
 */

import type {
  FieldValue,
  OperatorValue,
  ConditionValue,
  FilterExpression,
  FilterCondition,
} from '@/types'

// =============================================================================
// State Types
// =============================================================================

/**
 * Possible states in the filter state machine
 */
export type FilterStep =
  | 'idle' // No input started
  | 'selecting-field' // Choosing a field
  | 'selecting-operator' // Choosing an operator for current field
  | 'entering-value' // Entering/selecting a value
  | 'selecting-connector' // Choosing AND/OR or completing
  | 'editing-token' // Editing an existing token

/**
 * Context maintained by the state machine
 */
export interface FilterContext {
  /** Completed filter expressions */
  completedExpressions: FilterExpression[]
  /** Currently selected field (during expression building) */
  currentField?: FieldValue
  /** Currently selected operator (during expression building) */
  currentOperator?: OperatorValue
  /** Pending connector (set when continuing after an expression) */
  pendingConnector?: 'AND' | 'OR'
}

// =============================================================================
// Action Types
// =============================================================================

/**
 * Action types for the state machine
 */
export type FilterActionType =
  | 'FOCUS'
  | 'BLUR'
  | 'SELECT_FIELD'
  | 'SELECT_OPERATOR'
  | 'CONFIRM_VALUE'
  | 'SELECT_CONNECTOR'
  | 'COMPLETE'
  | 'DELETE_LAST'
  | 'CLEAR'
  | 'RESET'

/**
 * Actions that can be dispatched to the state machine
 */
export type FilterAction =
  | { type: 'FOCUS' }
  | { type: 'BLUR' }
  | { type: 'SELECT_FIELD'; payload: FieldValue }
  | { type: 'SELECT_OPERATOR'; payload: OperatorValue }
  | { type: 'CONFIRM_VALUE'; payload: ConditionValue }
  | { type: 'SELECT_CONNECTOR'; payload: 'AND' | 'OR' }
  | { type: 'COMPLETE' }
  | { type: 'DELETE_LAST' }
  | { type: 'CLEAR' }
  | { type: 'RESET' }

// =============================================================================
// State Machine Implementation
// =============================================================================

/**
 * Filter State Machine class that manages state transitions
 * for building filter expressions sequentially.
 */
export class FilterStateMachine {
  private state: FilterStep = 'idle'
  private context: FilterContext = {
    completedExpressions: [],
    currentField: undefined,
    currentOperator: undefined,
    pendingConnector: undefined,
  }

  /**
   * Get the current state
   */
  getState(): FilterStep {
    return this.state
  }

  /**
   * Get the current context
   */
  getContext(): FilterContext {
    return { ...this.context }
  }

  /**
   * Check if a transition is allowed from the current state
   */
  canTransition(action: FilterAction): boolean {
    const availableActions = this.getAvailableActions()
    return availableActions.includes(action.type)
  }

  /**
   * Get available action types for the current state
   */
  getAvailableActions(): FilterActionType[] {
    switch (this.state) {
      case 'idle':
        return ['FOCUS']
      case 'selecting-field':
        return ['SELECT_FIELD', 'BLUR', 'DELETE_LAST']
      case 'selecting-operator':
        return ['SELECT_OPERATOR', 'BLUR', 'DELETE_LAST']
      case 'entering-value':
        return ['CONFIRM_VALUE', 'BLUR', 'DELETE_LAST']
      case 'selecting-connector':
        return ['SELECT_CONNECTOR', 'COMPLETE', 'BLUR', 'DELETE_LAST']
      case 'editing-token':
        return ['CONFIRM_VALUE', 'BLUR']
      default:
        return []
    }
  }

  /**
   * Transition to a new state based on the action
   */
  transition(action: FilterAction): void {
    switch (action.type) {
      case 'FOCUS':
        this.handleFocus()
        break
      case 'BLUR':
        this.handleBlur()
        break
      case 'SELECT_FIELD':
        this.handleSelectField(action.payload)
        break
      case 'SELECT_OPERATOR':
        this.handleSelectOperator(action.payload)
        break
      case 'CONFIRM_VALUE':
        this.handleConfirmValue(action.payload)
        break
      case 'SELECT_CONNECTOR':
        this.handleSelectConnector(action.payload)
        break
      case 'COMPLETE':
        this.handleComplete()
        break
      case 'DELETE_LAST':
        this.handleDeleteLast()
        break
      case 'CLEAR':
        this.clear()
        break
      case 'RESET':
        this.reset()
        break
    }
  }

  /**
   * Reset the state machine to initial state
   */
  reset(): void {
    this.state = 'idle'
    this.context = {
      completedExpressions: [],
      currentField: undefined,
      currentOperator: undefined,
      pendingConnector: undefined,
    }
  }

  /**
   * Clear all expressions but maintain current state
   */
  clear(): void {
    this.context = {
      ...this.context,
      completedExpressions: [],
      currentField: undefined,
      currentOperator: undefined,
      pendingConnector: undefined,
    }
  }

  /**
   * Load expressions from external source
   */
  loadExpressions(expressions: FilterExpression[]): void {
    this.context = {
      ...this.context,
      completedExpressions: [...expressions],
    }
  }

  // ===========================================================================
  // Private Handlers
  // ===========================================================================

  private handleFocus(): void {
    if (this.state === 'idle') {
      this.state = 'selecting-field'
    }
  }

  private handleBlur(): void {
    // Discard any partial expression in progress
    this.context = {
      ...this.context,
      currentField: undefined,
      currentOperator: undefined,
      pendingConnector: undefined,
    }
    this.state = 'idle'
  }

  private handleSelectField(field: FieldValue): void {
    if (this.state === 'selecting-field') {
      this.context = {
        ...this.context,
        currentField: field,
      }
      this.state = 'selecting-operator'
    }
  }

  private handleSelectOperator(operator: OperatorValue): void {
    if (this.state === 'selecting-operator') {
      this.context = {
        ...this.context,
        currentOperator: operator,
      }
      this.state = 'entering-value'
    }
  }

  private handleConfirmValue(value: ConditionValue): void {
    if (
      this.state === 'entering-value' &&
      this.context.currentField &&
      this.context.currentOperator
    ) {
      const condition: FilterCondition = {
        field: this.context.currentField,
        operator: this.context.currentOperator,
        value: value,
      }

      const newExpression: FilterExpression = {
        condition,
        connector: undefined,
      }

      this.context = {
        ...this.context,
        completedExpressions: [...this.context.completedExpressions, newExpression],
        currentField: undefined,
        currentOperator: undefined,
      }
      this.state = 'selecting-connector'
    }
  }

  private handleSelectConnector(connector: 'AND' | 'OR'): void {
    if (this.state === 'selecting-connector') {
      // Update the last expression with the connector
      const expressions = [...this.context.completedExpressions]
      const lastIndex = expressions.length - 1
      const lastExpression = expressions[lastIndex]
      if (lastExpression) {
        expressions[lastIndex] = {
          ...lastExpression,
          connector,
        }
      }

      this.context = {
        ...this.context,
        completedExpressions: expressions,
        pendingConnector: connector,
      }
      this.state = 'selecting-field'
    }
  }

  private handleComplete(): void {
    if (this.state === 'selecting-connector') {
      this.context = {
        ...this.context,
        pendingConnector: undefined,
      }
      this.state = 'idle'
    }
  }

  private handleDeleteLast(): void {
    switch (this.state) {
      case 'selecting-connector': {
        // Remove the last completed expression and go back to entering-value
        const expressions = this.context.completedExpressions.slice(0, -1)
        const deletedExpression =
          this.context.completedExpressions[this.context.completedExpressions.length - 1]

        if (deletedExpression) {
          // Restore the field and operator from the deleted expression
          this.context = {
            ...this.context,
            completedExpressions: expressions,
            currentField: deletedExpression.condition.field,
            currentOperator: deletedExpression.condition.operator,
          }
        }
        this.state = 'entering-value'
        break
      }

      case 'entering-value': {
        // Clear the operator and go back to selecting-operator
        this.context = {
          ...this.context,
          currentOperator: undefined,
        }
        this.state = 'selecting-operator'
        break
      }

      case 'selecting-operator': {
        // Clear the field and go back to selecting-field
        this.context = {
          ...this.context,
          currentField: undefined,
        }
        this.state = 'selecting-field'
        break
      }

      case 'selecting-field': {
        // If there are completed expressions, go to selecting-connector of the last one
        if (this.context.completedExpressions.length > 0) {
          // Remove the connector from the last expression
          const expressions = [...this.context.completedExpressions]
          const lastIndex = expressions.length - 1
          const lastExpression = expressions[lastIndex]
          if (lastExpression) {
            expressions[lastIndex] = {
              ...lastExpression,
              connector: undefined,
            }
          }
          this.context = {
            ...this.context,
            completedExpressions: expressions,
          }
          this.state = 'selecting-connector'
        }
        break
      }
    }
  }
}
