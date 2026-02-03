import { describe, expect, it, beforeEach } from 'vitest'
import { FilterStateMachine } from './StateMachine'
import type { FieldValue, OperatorValue, ConditionValue, FilterExpression } from '@/types'

describe('FilterStateMachine', () => {
  let machine: FilterStateMachine

  beforeEach(() => {
    machine = new FilterStateMachine()
  })

  describe('Initial State', () => {
    it('should start in idle state', () => {
      expect(machine.getState()).toBe('idle')
    })

    it('should have empty context', () => {
      const context = machine.getContext()
      expect(context.completedExpressions).toEqual([])
      expect(context.currentField).toBeUndefined()
      expect(context.currentOperator).toBeUndefined()
      expect(context.pendingConnector).toBeUndefined()
    })
  })

  describe('State Transitions', () => {
    describe('idle → selecting-field', () => {
      it('should transition to selecting-field on focus', () => {
        machine.transition({ type: 'FOCUS' })
        expect(machine.getState()).toBe('selecting-field')
      })

      it('should allow focus transition from idle', () => {
        expect(machine.canTransition({ type: 'FOCUS' })).toBe(true)
      })
    })

    describe('selecting-field → selecting-operator', () => {
      beforeEach(() => {
        machine.transition({ type: 'FOCUS' })
      })

      it('should transition to selecting-operator on select field', () => {
        const field: FieldValue = { key: 'status', label: 'Status', type: 'enum' }
        machine.transition({ type: 'SELECT_FIELD', payload: field })
        expect(machine.getState()).toBe('selecting-operator')
      })

      it('should store selected field in context', () => {
        const field: FieldValue = { key: 'status', label: 'Status', type: 'enum' }
        machine.transition({ type: 'SELECT_FIELD', payload: field })
        expect(machine.getContext().currentField).toEqual(field)
      })

      it('should allow select field transition', () => {
        const field: FieldValue = { key: 'status', label: 'Status', type: 'enum' }
        expect(machine.canTransition({ type: 'SELECT_FIELD', payload: field })).toBe(true)
      })
    })

    describe('selecting-operator → entering-value', () => {
      beforeEach(() => {
        machine.transition({ type: 'FOCUS' })
        const field: FieldValue = { key: 'status', label: 'Status', type: 'enum' }
        machine.transition({ type: 'SELECT_FIELD', payload: field })
      })

      it('should transition to entering-value on select operator', () => {
        const operator: OperatorValue = { key: 'eq', label: 'equals', symbol: '=' }
        machine.transition({ type: 'SELECT_OPERATOR', payload: operator })
        expect(machine.getState()).toBe('entering-value')
      })

      it('should store selected operator in context', () => {
        const operator: OperatorValue = { key: 'eq', label: 'equals', symbol: '=' }
        machine.transition({ type: 'SELECT_OPERATOR', payload: operator })
        expect(machine.getContext().currentOperator).toEqual(operator)
      })
    })

    describe('entering-value → selecting-connector', () => {
      beforeEach(() => {
        machine.transition({ type: 'FOCUS' })
        const field: FieldValue = { key: 'status', label: 'Status', type: 'enum' }
        machine.transition({ type: 'SELECT_FIELD', payload: field })
        const operator: OperatorValue = { key: 'eq', label: 'equals', symbol: '=' }
        machine.transition({ type: 'SELECT_OPERATOR', payload: operator })
      })

      it('should transition to selecting-connector on confirm value', () => {
        const value: ConditionValue = { raw: 'active', display: 'Active', serialized: 'active' }
        machine.transition({ type: 'CONFIRM_VALUE', payload: value })
        expect(machine.getState()).toBe('selecting-connector')
      })

      it('should add completed expression to context', () => {
        const value: ConditionValue = { raw: 'active', display: 'Active', serialized: 'active' }
        machine.transition({ type: 'CONFIRM_VALUE', payload: value })
        const context = machine.getContext()
        expect(context.completedExpressions).toHaveLength(1)
        expect(context.completedExpressions[0]?.condition.value).toEqual(value)
      })

      it('should clear current field and operator after completing expression', () => {
        const value: ConditionValue = { raw: 'active', display: 'Active', serialized: 'active' }
        machine.transition({ type: 'CONFIRM_VALUE', payload: value })
        const context = machine.getContext()
        expect(context.currentField).toBeUndefined()
        expect(context.currentOperator).toBeUndefined()
      })
    })

    describe('selecting-connector → selecting-field (AND/OR)', () => {
      beforeEach(() => {
        machine.transition({ type: 'FOCUS' })
        const field: FieldValue = { key: 'status', label: 'Status', type: 'enum' }
        machine.transition({ type: 'SELECT_FIELD', payload: field })
        const operator: OperatorValue = { key: 'eq', label: 'equals', symbol: '=' }
        machine.transition({ type: 'SELECT_OPERATOR', payload: operator })
        const value: ConditionValue = { raw: 'active', display: 'Active', serialized: 'active' }
        machine.transition({ type: 'CONFIRM_VALUE', payload: value })
      })

      it('should transition to selecting-field on select AND', () => {
        machine.transition({ type: 'SELECT_CONNECTOR', payload: 'AND' })
        expect(machine.getState()).toBe('selecting-field')
      })

      it('should transition to selecting-field on select OR', () => {
        machine.transition({ type: 'SELECT_CONNECTOR', payload: 'OR' })
        expect(machine.getState()).toBe('selecting-field')
      })

      it('should update last expression with connector', () => {
        machine.transition({ type: 'SELECT_CONNECTOR', payload: 'AND' })
        const context = machine.getContext()
        expect(context.completedExpressions[0]?.connector).toBe('AND')
      })
    })

    describe('selecting-connector → idle (complete)', () => {
      beforeEach(() => {
        machine.transition({ type: 'FOCUS' })
        const field: FieldValue = { key: 'status', label: 'Status', type: 'enum' }
        machine.transition({ type: 'SELECT_FIELD', payload: field })
        const operator: OperatorValue = { key: 'eq', label: 'equals', symbol: '=' }
        machine.transition({ type: 'SELECT_OPERATOR', payload: operator })
        const value: ConditionValue = { raw: 'active', display: 'Active', serialized: 'active' }
        machine.transition({ type: 'CONFIRM_VALUE', payload: value })
      })

      it('should transition to idle on blur', () => {
        machine.transition({ type: 'BLUR' })
        expect(machine.getState()).toBe('idle')
      })

      it('should transition to idle on complete', () => {
        machine.transition({ type: 'COMPLETE' })
        expect(machine.getState()).toBe('idle')
      })

      it('should preserve completed expressions on complete', () => {
        machine.transition({ type: 'COMPLETE' })
        expect(machine.getContext().completedExpressions).toHaveLength(1)
      })
    })

    describe('Any state → idle on blur', () => {
      it('should return to idle on blur from selecting-field', () => {
        machine.transition({ type: 'FOCUS' })
        machine.transition({ type: 'BLUR' })
        expect(machine.getState()).toBe('idle')
      })

      it('should return to idle on blur from selecting-operator and discard partial', () => {
        machine.transition({ type: 'FOCUS' })
        const field: FieldValue = { key: 'status', label: 'Status', type: 'enum' }
        machine.transition({ type: 'SELECT_FIELD', payload: field })
        machine.transition({ type: 'BLUR' })
        expect(machine.getState()).toBe('idle')
        expect(machine.getContext().currentField).toBeUndefined()
      })
    })
  })

  describe('getAvailableActions', () => {
    it('should return FOCUS action in idle state', () => {
      const actions = machine.getAvailableActions()
      expect(actions).toContain('FOCUS')
    })

    it('should return SELECT_FIELD and BLUR in selecting-field state', () => {
      machine.transition({ type: 'FOCUS' })
      const actions = machine.getAvailableActions()
      expect(actions).toContain('SELECT_FIELD')
      expect(actions).toContain('BLUR')
    })

    it('should return SELECT_OPERATOR and BLUR in selecting-operator state', () => {
      machine.transition({ type: 'FOCUS' })
      const field: FieldValue = { key: 'status', label: 'Status', type: 'enum' }
      machine.transition({ type: 'SELECT_FIELD', payload: field })
      const actions = machine.getAvailableActions()
      expect(actions).toContain('SELECT_OPERATOR')
      expect(actions).toContain('BLUR')
    })

    it('should return CONFIRM_VALUE and BLUR in entering-value state', () => {
      machine.transition({ type: 'FOCUS' })
      const field: FieldValue = { key: 'status', label: 'Status', type: 'enum' }
      machine.transition({ type: 'SELECT_FIELD', payload: field })
      const operator: OperatorValue = { key: 'eq', label: 'equals', symbol: '=' }
      machine.transition({ type: 'SELECT_OPERATOR', payload: operator })
      const actions = machine.getAvailableActions()
      expect(actions).toContain('CONFIRM_VALUE')
      expect(actions).toContain('BLUR')
    })

    it('should return SELECT_CONNECTOR, COMPLETE, and BLUR in selecting-connector state', () => {
      machine.transition({ type: 'FOCUS' })
      const field: FieldValue = { key: 'status', label: 'Status', type: 'enum' }
      machine.transition({ type: 'SELECT_FIELD', payload: field })
      const operator: OperatorValue = { key: 'eq', label: 'equals', symbol: '=' }
      machine.transition({ type: 'SELECT_OPERATOR', payload: operator })
      const value: ConditionValue = { raw: 'active', display: 'Active', serialized: 'active' }
      machine.transition({ type: 'CONFIRM_VALUE', payload: value })
      const actions = machine.getAvailableActions()
      expect(actions).toContain('SELECT_CONNECTOR')
      expect(actions).toContain('COMPLETE')
      expect(actions).toContain('BLUR')
    })
  })

  describe('Reset and Clear', () => {
    it('should reset to initial state', () => {
      machine.transition({ type: 'FOCUS' })
      const field: FieldValue = { key: 'status', label: 'Status', type: 'enum' }
      machine.transition({ type: 'SELECT_FIELD', payload: field })
      machine.reset()
      expect(machine.getState()).toBe('idle')
      expect(machine.getContext().completedExpressions).toEqual([])
    })

    it('should clear all expressions', () => {
      machine.transition({ type: 'FOCUS' })
      const field: FieldValue = { key: 'status', label: 'Status', type: 'enum' }
      machine.transition({ type: 'SELECT_FIELD', payload: field })
      const operator: OperatorValue = { key: 'eq', label: 'equals', symbol: '=' }
      machine.transition({ type: 'SELECT_OPERATOR', payload: operator })
      const value: ConditionValue = { raw: 'active', display: 'Active', serialized: 'active' }
      machine.transition({ type: 'CONFIRM_VALUE', payload: value })
      machine.transition({ type: 'COMPLETE' })

      machine.clear()
      expect(machine.getContext().completedExpressions).toEqual([])
    })
  })

  describe('Delete Last Token', () => {
    it('should delete the last expression when in selecting-connector state', () => {
      machine.transition({ type: 'FOCUS' })
      const field: FieldValue = { key: 'status', label: 'Status', type: 'enum' }
      machine.transition({ type: 'SELECT_FIELD', payload: field })
      const operator: OperatorValue = { key: 'eq', label: 'equals', symbol: '=' }
      machine.transition({ type: 'SELECT_OPERATOR', payload: operator })
      const value: ConditionValue = { raw: 'active', display: 'Active', serialized: 'active' }
      machine.transition({ type: 'CONFIRM_VALUE', payload: value })

      machine.transition({ type: 'DELETE_LAST' })
      expect(machine.getState()).toBe('entering-value')
      expect(machine.getContext().completedExpressions).toEqual([])
    })

    it('should go back to selecting-operator when deleting from entering-value', () => {
      machine.transition({ type: 'FOCUS' })
      const field: FieldValue = { key: 'status', label: 'Status', type: 'enum' }
      machine.transition({ type: 'SELECT_FIELD', payload: field })
      const operator: OperatorValue = { key: 'eq', label: 'equals', symbol: '=' }
      machine.transition({ type: 'SELECT_OPERATOR', payload: operator })

      machine.transition({ type: 'DELETE_LAST' })
      expect(machine.getState()).toBe('selecting-operator')
      expect(machine.getContext().currentOperator).toBeUndefined()
    })

    it('should go back to selecting-field when deleting from selecting-operator', () => {
      machine.transition({ type: 'FOCUS' })
      const field: FieldValue = { key: 'status', label: 'Status', type: 'enum' }
      machine.transition({ type: 'SELECT_FIELD', payload: field })

      machine.transition({ type: 'DELETE_LAST' })
      expect(machine.getState()).toBe('selecting-field')
      expect(machine.getContext().currentField).toBeUndefined()
    })
  })

  describe('Load Initial Expressions', () => {
    it('should load initial expressions', () => {
      const expressions: FilterExpression[] = [
        {
          condition: {
            field: { key: 'status', label: 'Status', type: 'enum' },
            operator: { key: 'eq', label: 'equals', symbol: '=' },
            value: { raw: 'active', display: 'Active', serialized: 'active' },
          },
          connector: 'AND',
        },
        {
          condition: {
            field: { key: 'name', label: 'Name', type: 'string' },
            operator: { key: 'contains', label: 'contains' },
            value: { raw: 'test', display: 'test', serialized: 'test' },
          },
        },
      ]

      machine.loadExpressions(expressions)
      expect(machine.getContext().completedExpressions).toEqual(expressions)
    })
  })

  describe('Invalid Transition Handling', () => {
    it('should not allow SELECT_FIELD from idle state', () => {
      const field: FieldValue = { key: 'status', label: 'Status', type: 'enum' }
      expect(machine.canTransition({ type: 'SELECT_FIELD', payload: field })).toBe(false)
    })

    it('should not allow SELECT_OPERATOR from idle state', () => {
      const operator: OperatorValue = { key: 'eq', label: 'equals', symbol: '=' }
      expect(machine.canTransition({ type: 'SELECT_OPERATOR', payload: operator })).toBe(false)
    })

    it('should not allow CONFIRM_VALUE from idle state', () => {
      const value: ConditionValue = { raw: 'test', display: 'test', serialized: 'test' }
      expect(machine.canTransition({ type: 'CONFIRM_VALUE', payload: value })).toBe(false)
    })

    it('should not allow SELECT_CONNECTOR from idle state', () => {
      expect(machine.canTransition({ type: 'SELECT_CONNECTOR', payload: 'AND' })).toBe(false)
    })

    it('should not allow SELECT_OPERATOR from selecting-field state', () => {
      machine.transition({ type: 'FOCUS' })
      const operator: OperatorValue = { key: 'eq', label: 'equals', symbol: '=' }
      expect(machine.canTransition({ type: 'SELECT_OPERATOR', payload: operator })).toBe(false)
    })

    it('should not allow CONFIRM_VALUE from selecting-field state', () => {
      machine.transition({ type: 'FOCUS' })
      const value: ConditionValue = { raw: 'test', display: 'test', serialized: 'test' }
      expect(machine.canTransition({ type: 'CONFIRM_VALUE', payload: value })).toBe(false)
    })

    it('should not allow SELECT_FIELD from selecting-operator state', () => {
      machine.transition({ type: 'FOCUS' })
      const field: FieldValue = { key: 'status', label: 'Status', type: 'enum' }
      machine.transition({ type: 'SELECT_FIELD', payload: field })
      const anotherField: FieldValue = { key: 'name', label: 'Name', type: 'string' }
      expect(machine.canTransition({ type: 'SELECT_FIELD', payload: anotherField })).toBe(false)
    })

    it('should not allow CONFIRM_VALUE from selecting-operator state', () => {
      machine.transition({ type: 'FOCUS' })
      const field: FieldValue = { key: 'status', label: 'Status', type: 'enum' }
      machine.transition({ type: 'SELECT_FIELD', payload: field })
      const value: ConditionValue = { raw: 'test', display: 'test', serialized: 'test' }
      expect(machine.canTransition({ type: 'CONFIRM_VALUE', payload: value })).toBe(false)
    })

    it('should not allow SELECT_FIELD from entering-value state', () => {
      machine.transition({ type: 'FOCUS' })
      const field: FieldValue = { key: 'status', label: 'Status', type: 'enum' }
      machine.transition({ type: 'SELECT_FIELD', payload: field })
      const operator: OperatorValue = { key: 'eq', label: 'equals', symbol: '=' }
      machine.transition({ type: 'SELECT_OPERATOR', payload: operator })
      const anotherField: FieldValue = { key: 'name', label: 'Name', type: 'string' }
      expect(machine.canTransition({ type: 'SELECT_FIELD', payload: anotherField })).toBe(false)
    })

    it('should not allow SELECT_CONNECTOR from entering-value state', () => {
      machine.transition({ type: 'FOCUS' })
      const field: FieldValue = { key: 'status', label: 'Status', type: 'enum' }
      machine.transition({ type: 'SELECT_FIELD', payload: field })
      const operator: OperatorValue = { key: 'eq', label: 'equals', symbol: '=' }
      machine.transition({ type: 'SELECT_OPERATOR', payload: operator })
      expect(machine.canTransition({ type: 'SELECT_CONNECTOR', payload: 'AND' })).toBe(false)
    })

    it('should not allow SELECT_OPERATOR from selecting-connector state', () => {
      machine.transition({ type: 'FOCUS' })
      const field: FieldValue = { key: 'status', label: 'Status', type: 'enum' }
      machine.transition({ type: 'SELECT_FIELD', payload: field })
      const operator: OperatorValue = { key: 'eq', label: 'equals', symbol: '=' }
      machine.transition({ type: 'SELECT_OPERATOR', payload: operator })
      const value: ConditionValue = { raw: 'active', display: 'Active', serialized: 'active' }
      machine.transition({ type: 'CONFIRM_VALUE', payload: value })
      const anotherOperator: OperatorValue = { key: 'neq', label: 'not equals' }
      expect(machine.canTransition({ type: 'SELECT_OPERATOR', payload: anotherOperator })).toBe(
        false
      )
    })

    it('should not allow CONFIRM_VALUE from selecting-connector state', () => {
      machine.transition({ type: 'FOCUS' })
      const field: FieldValue = { key: 'status', label: 'Status', type: 'enum' }
      machine.transition({ type: 'SELECT_FIELD', payload: field })
      const operator: OperatorValue = { key: 'eq', label: 'equals', symbol: '=' }
      machine.transition({ type: 'SELECT_OPERATOR', payload: operator })
      const value: ConditionValue = { raw: 'active', display: 'Active', serialized: 'active' }
      machine.transition({ type: 'CONFIRM_VALUE', payload: value })
      expect(machine.canTransition({ type: 'CONFIRM_VALUE', payload: value })).toBe(false)
    })
  })

  describe('editing-token state', () => {
    it('should return correct available actions for editing-token state', () => {
      // Note: editing-token state is defined in FilterStep but not directly transitionable via machine
      // This test verifies that getAvailableActions handles it correctly
      const testMachine = new FilterStateMachine()
      // Access private state for testing purposes
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ;(testMachine as any).state = 'editing-token'
      const actions = testMachine.getAvailableActions()
      expect(actions).toEqual(['CONFIRM_VALUE', 'BLUR'])
    })

    it('should not transition from editing-token state via CONFIRM_VALUE (managed by React)', () => {
      // Setup: create an expression first
      machine.transition({ type: 'FOCUS' })
      const field: FieldValue = { key: 'status', label: 'Status', type: 'enum' }
      machine.transition({ type: 'SELECT_FIELD', payload: field })
      const operator: OperatorValue = { key: 'eq', label: 'equals', symbol: '=' }
      machine.transition({ type: 'SELECT_OPERATOR', payload: operator })

      // Set state to editing-token manually (simulating React state management)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ;(machine as any).state = 'editing-token'
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ;(machine as any).context.currentField = field
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ;(machine as any).context.currentOperator = operator

      const newValue: ConditionValue = { raw: 'updated', display: 'Updated', serialized: 'updated' }
      machine.transition({ type: 'CONFIRM_VALUE', payload: newValue })

      // The machine does not handle editing-token state transitions
      // It remains in editing-token state, leaving React to manage the transition
      expect(machine.getState()).toBe('editing-token')
      // However, if the preconditions are met (entering-value state), it would add an expression
      // But editing-token is not entering-value, so no expression is added
      expect(machine.getContext().completedExpressions).toHaveLength(0)
    })

    it('should handle BLUR when in editing-token state', () => {
      // Setup: create an expression first
      machine.transition({ type: 'FOCUS' })
      const field: FieldValue = { key: 'status', label: 'Status', type: 'enum' }
      machine.transition({ type: 'SELECT_FIELD', payload: field })
      const operator: OperatorValue = { key: 'eq', label: 'equals', symbol: '=' }
      machine.transition({ type: 'SELECT_OPERATOR', payload: operator })

      // Set state to editing-token manually
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ;(machine as any).state = 'editing-token'
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ;(machine as any).context.currentField = field
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ;(machine as any).context.currentOperator = operator

      machine.transition({ type: 'BLUR' })

      // Should return to idle and clear context
      expect(machine.getState()).toBe('idle')
      expect(machine.getContext().currentField).toBeUndefined()
      expect(machine.getContext().currentOperator).toBeUndefined()
    })
  })

  describe('Reset and Clear edge cases', () => {
    it('should reset to initial state during partial expression (field selected)', () => {
      machine.transition({ type: 'FOCUS' })
      const field: FieldValue = { key: 'status', label: 'Status', type: 'enum' }
      machine.transition({ type: 'SELECT_FIELD', payload: field })

      machine.reset()

      expect(machine.getState()).toBe('idle')
      expect(machine.getContext().currentField).toBeUndefined()
      expect(machine.getContext().completedExpressions).toEqual([])
    })

    it('should reset to initial state during partial expression (operator selected)', () => {
      machine.transition({ type: 'FOCUS' })
      const field: FieldValue = { key: 'status', label: 'Status', type: 'enum' }
      machine.transition({ type: 'SELECT_FIELD', payload: field })
      const operator: OperatorValue = { key: 'eq', label: 'equals', symbol: '=' }
      machine.transition({ type: 'SELECT_OPERATOR', payload: operator })

      machine.reset()

      expect(machine.getState()).toBe('idle')
      expect(machine.getContext().currentField).toBeUndefined()
      expect(machine.getContext().currentOperator).toBeUndefined()
      expect(machine.getContext().completedExpressions).toEqual([])
    })

    it('should clear expressions during mid-transition', () => {
      machine.transition({ type: 'FOCUS' })
      const field: FieldValue = { key: 'status', label: 'Status', type: 'enum' }
      machine.transition({ type: 'SELECT_FIELD', payload: field })
      const operator: OperatorValue = { key: 'eq', label: 'equals', symbol: '=' }
      machine.transition({ type: 'SELECT_OPERATOR', payload: operator })

      machine.clear()

      expect(machine.getState()).toBe('idle')
      expect(machine.getContext().currentField).toBeUndefined()
      expect(machine.getContext().currentOperator).toBeUndefined()
      expect(machine.getContext().completedExpressions).toEqual([])
    })

    it('should clear pendingConnector on clear', () => {
      machine.transition({ type: 'FOCUS' })
      const field: FieldValue = { key: 'status', label: 'Status', type: 'enum' }
      machine.transition({ type: 'SELECT_FIELD', payload: field })
      const operator: OperatorValue = { key: 'eq', label: 'equals', symbol: '=' }
      machine.transition({ type: 'SELECT_OPERATOR', payload: operator })
      const value: ConditionValue = { raw: 'active', display: 'Active', serialized: 'active' }
      machine.transition({ type: 'CONFIRM_VALUE', payload: value })
      machine.transition({ type: 'SELECT_CONNECTOR', payload: 'AND' })

      machine.clear()

      expect(machine.getContext().pendingConnector).toBeUndefined()
    })
  })

  describe('loadExpressions edge cases', () => {
    it('should load empty array of expressions', () => {
      // First add some expressions
      machine.transition({ type: 'FOCUS' })
      const field: FieldValue = { key: 'status', label: 'Status', type: 'enum' }
      machine.transition({ type: 'SELECT_FIELD', payload: field })
      const operator: OperatorValue = { key: 'eq', label: 'equals', symbol: '=' }
      machine.transition({ type: 'SELECT_OPERATOR', payload: operator })
      const value: ConditionValue = { raw: 'active', display: 'Active', serialized: 'active' }
      machine.transition({ type: 'CONFIRM_VALUE', payload: value })

      // Load empty array
      machine.loadExpressions([])

      expect(machine.getContext().completedExpressions).toEqual([])
    })

    it('should load expressions while in mid-transition', () => {
      machine.transition({ type: 'FOCUS' })
      const field: FieldValue = { key: 'status', label: 'Status', type: 'enum' }
      machine.transition({ type: 'SELECT_FIELD', payload: field })

      const expressions: FilterExpression[] = [
        {
          condition: {
            field: { key: 'name', label: 'Name', type: 'string' },
            operator: { key: 'contains', label: 'contains' },
            value: { raw: 'test', display: 'test', serialized: 'test' },
          },
        },
      ]

      machine.loadExpressions(expressions)

      expect(machine.getContext().completedExpressions).toEqual(expressions)
      // Should preserve current state and partial context
      expect(machine.getState()).toBe('selecting-operator')
      expect(machine.getContext().currentField).toEqual(field)
    })

    it('should replace existing expressions when loading new ones', () => {
      const expression1: FilterExpression[] = [
        {
          condition: {
            field: { key: 'status', label: 'Status', type: 'enum' },
            operator: { key: 'eq', label: 'equals', symbol: '=' },
            value: { raw: 'active', display: 'Active', serialized: 'active' },
          },
        },
      ]

      machine.loadExpressions(expression1)
      expect(machine.getContext().completedExpressions).toHaveLength(1)

      const expression2: FilterExpression[] = [
        {
          condition: {
            field: { key: 'name', label: 'Name', type: 'string' },
            operator: { key: 'contains', label: 'contains' },
            value: { raw: 'test', display: 'test', serialized: 'test' },
          },
        },
        {
          condition: {
            field: { key: 'age', label: 'Age', type: 'number' },
            operator: { key: 'gt', label: 'greater than', symbol: '>' },
            value: { raw: '18', display: '18', serialized: '18' },
          },
        },
      ]

      machine.loadExpressions(expression2)
      expect(machine.getContext().completedExpressions).toEqual(expression2)
    })

    it('should not mutate loaded expressions array', () => {
      const expressions: FilterExpression[] = [
        {
          condition: {
            field: { key: 'status', label: 'Status', type: 'enum' },
            operator: { key: 'eq', label: 'equals', symbol: '=' },
            value: { raw: 'active', display: 'Active', serialized: 'active' },
          },
        },
      ]

      machine.loadExpressions(expressions)

      // Modify the internal state
      machine.transition({ type: 'FOCUS' })
      const field: FieldValue = { key: 'name', label: 'Name', type: 'string' }
      machine.transition({ type: 'SELECT_FIELD', payload: field })
      const operator: OperatorValue = { key: 'contains', label: 'contains' }
      machine.transition({ type: 'SELECT_OPERATOR', payload: operator })
      const value: ConditionValue = { raw: 'test', display: 'test', serialized: 'test' }
      machine.transition({ type: 'CONFIRM_VALUE', payload: value })

      // Original array should remain unchanged
      expect(expressions).toHaveLength(1)
    })
  })

  describe('DELETE_LAST edge cases', () => {
    it('should handle DELETE_LAST from selecting-field with no completed expressions', () => {
      machine.transition({ type: 'FOCUS' })
      // In selecting-field state with no expressions
      expect(machine.getState()).toBe('selecting-field')

      machine.transition({ type: 'DELETE_LAST' })

      // Should remain in selecting-field state
      expect(machine.getState()).toBe('selecting-field')
      expect(machine.getContext().completedExpressions).toEqual([])
    })

    it('should handle DELETE_LAST from selecting-field with completed expressions', () => {
      machine.transition({ type: 'FOCUS' })
      const field: FieldValue = { key: 'status', label: 'Status', type: 'enum' }
      machine.transition({ type: 'SELECT_FIELD', payload: field })
      const operator: OperatorValue = { key: 'eq', label: 'equals', symbol: '=' }
      machine.transition({ type: 'SELECT_OPERATOR', payload: operator })
      const value: ConditionValue = { raw: 'active', display: 'Active', serialized: 'active' }
      machine.transition({ type: 'CONFIRM_VALUE', payload: value })
      machine.transition({ type: 'SELECT_CONNECTOR', payload: 'AND' })
      // Now in selecting-field for next expression

      machine.transition({ type: 'DELETE_LAST' })

      // Should go to selecting-connector of the last expression
      expect(machine.getState()).toBe('selecting-connector')
      // Last expression should have connector removed
      expect(machine.getContext().completedExpressions[0]?.connector).toBeUndefined()
    })

    it('should restore field and operator when deleting from selecting-connector', () => {
      machine.transition({ type: 'FOCUS' })
      const field: FieldValue = { key: 'status', label: 'Status', type: 'enum' }
      machine.transition({ type: 'SELECT_FIELD', payload: field })
      const operator: OperatorValue = { key: 'eq', label: 'equals', symbol: '=' }
      machine.transition({ type: 'SELECT_OPERATOR', payload: operator })
      const value: ConditionValue = { raw: 'active', display: 'Active', serialized: 'active' }
      machine.transition({ type: 'CONFIRM_VALUE', payload: value })

      machine.transition({ type: 'DELETE_LAST' })

      expect(machine.getState()).toBe('entering-value')
      expect(machine.getContext().currentField).toEqual(field)
      expect(machine.getContext().currentOperator).toEqual(operator)
      expect(machine.getContext().completedExpressions).toEqual([])
    })

    it('should handle multiple rapid DELETE_LAST operations', () => {
      machine.transition({ type: 'FOCUS' })
      const field: FieldValue = { key: 'status', label: 'Status', type: 'enum' }
      machine.transition({ type: 'SELECT_FIELD', payload: field })
      const operator: OperatorValue = { key: 'eq', label: 'equals', symbol: '=' }
      machine.transition({ type: 'SELECT_OPERATOR', payload: operator })
      const value: ConditionValue = { raw: 'active', display: 'Active', serialized: 'active' }
      machine.transition({ type: 'CONFIRM_VALUE', payload: value })

      // Rapid deletes
      machine.transition({ type: 'DELETE_LAST' }) // selecting-connector → entering-value
      machine.transition({ type: 'DELETE_LAST' }) // entering-value → selecting-operator
      machine.transition({ type: 'DELETE_LAST' }) // selecting-operator → selecting-field

      expect(machine.getState()).toBe('selecting-field')
      expect(machine.getContext().currentField).toBeUndefined()
      expect(machine.getContext().currentOperator).toBeUndefined()
    })

    it('should handle DELETE_LAST from selecting-connector when it is the only expression', () => {
      machine.transition({ type: 'FOCUS' })
      const field: FieldValue = { key: 'status', label: 'Status', type: 'enum' }
      machine.transition({ type: 'SELECT_FIELD', payload: field })
      const operator: OperatorValue = { key: 'eq', label: 'equals', symbol: '=' }
      machine.transition({ type: 'SELECT_OPERATOR', payload: operator })
      const value: ConditionValue = { raw: 'active', display: 'Active', serialized: 'active' }
      machine.transition({ type: 'CONFIRM_VALUE', payload: value })
      // Now in selecting-connector with 1 expression

      machine.transition({ type: 'DELETE_LAST' })

      expect(machine.getState()).toBe('entering-value')
      expect(machine.getContext().completedExpressions).toEqual([])
      expect(machine.getContext().currentField).toEqual(field)
      expect(machine.getContext().currentOperator).toEqual(operator)
    })

    it('should delete correct expression when multiple expressions exist', () => {
      // Create two expressions
      machine.transition({ type: 'FOCUS' })
      const field1: FieldValue = { key: 'status', label: 'Status', type: 'enum' }
      machine.transition({ type: 'SELECT_FIELD', payload: field1 })
      const operator1: OperatorValue = { key: 'eq', label: 'equals', symbol: '=' }
      machine.transition({ type: 'SELECT_OPERATOR', payload: operator1 })
      const value1: ConditionValue = { raw: 'active', display: 'Active', serialized: 'active' }
      machine.transition({ type: 'CONFIRM_VALUE', payload: value1 })
      machine.transition({ type: 'SELECT_CONNECTOR', payload: 'AND' })

      const field2: FieldValue = { key: 'name', label: 'Name', type: 'string' }
      machine.transition({ type: 'SELECT_FIELD', payload: field2 })
      const operator2: OperatorValue = { key: 'contains', label: 'contains' }
      machine.transition({ type: 'SELECT_OPERATOR', payload: operator2 })
      const value2: ConditionValue = { raw: 'test', display: 'test', serialized: 'test' }
      machine.transition({ type: 'CONFIRM_VALUE', payload: value2 })
      // Now have 2 expressions, in selecting-connector

      machine.transition({ type: 'DELETE_LAST' })

      expect(machine.getState()).toBe('entering-value')
      expect(machine.getContext().completedExpressions).toHaveLength(1)
      expect(machine.getContext().completedExpressions[0]?.condition.field).toEqual(field1)
      expect(machine.getContext().currentField).toEqual(field2)
      expect(machine.getContext().currentOperator).toEqual(operator2)
    })
  })

  describe('Invalid transition behavior', () => {
    it('should silently ignore invalid SELECT_FIELD from idle state', () => {
      const field: FieldValue = { key: 'status', label: 'Status', type: 'enum' }
      machine.transition({ type: 'SELECT_FIELD', payload: field })

      // State should remain unchanged
      expect(machine.getState()).toBe('idle')
      expect(machine.getContext().currentField).toBeUndefined()
    })

    it('should silently ignore invalid CONFIRM_VALUE from selecting-field', () => {
      machine.transition({ type: 'FOCUS' })
      const value: ConditionValue = { raw: 'test', display: 'test', serialized: 'test' }
      machine.transition({ type: 'CONFIRM_VALUE', payload: value })

      // State should remain unchanged
      expect(machine.getState()).toBe('selecting-field')
      expect(machine.getContext().completedExpressions).toEqual([])
    })

    it('should silently ignore COMPLETE from non-selecting-connector state', () => {
      machine.transition({ type: 'FOCUS' })
      machine.transition({ type: 'COMPLETE' })

      expect(machine.getState()).toBe('selecting-field')
    })

    it('should handle DELETE_LAST from idle state', () => {
      machine.transition({ type: 'DELETE_LAST' })

      // Should remain in idle state
      expect(machine.getState()).toBe('idle')
    })
  })

  describe('CLEAR and RESET actions always work', () => {
    it('should allow CLEAR from any state', () => {
      machine.transition({ type: 'FOCUS' })
      const field: FieldValue = { key: 'status', label: 'Status', type: 'enum' }
      machine.transition({ type: 'SELECT_FIELD', payload: field })

      machine.transition({ type: 'CLEAR' })

      expect(machine.getState()).toBe('idle')
      expect(machine.getContext().completedExpressions).toEqual([])
    })

    it('should allow RESET from any state', () => {
      machine.transition({ type: 'FOCUS' })
      const field: FieldValue = { key: 'status', label: 'Status', type: 'enum' }
      machine.transition({ type: 'SELECT_FIELD', payload: field })
      const operator: OperatorValue = { key: 'eq', label: 'equals', symbol: '=' }
      machine.transition({ type: 'SELECT_OPERATOR', payload: operator })

      machine.transition({ type: 'RESET' })

      expect(machine.getState()).toBe('idle')
      expect(machine.getContext()).toEqual({
        completedExpressions: [],
        currentField: undefined,
        currentOperator: undefined,
        pendingConnector: undefined,
      })
    })
  })
})
