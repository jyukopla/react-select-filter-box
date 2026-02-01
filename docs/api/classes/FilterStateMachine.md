[**React Select Filter Box v0.0.0**](../README.md)

---

[React Select Filter Box](../README.md) / FilterStateMachine

# Class: FilterStateMachine

Defined in: [core/StateMachine.ts:86](https://github.com/jyukopla/react-select-filter-box/blob/732c0bb5d34ae2c255c8387f5b4df9b4c06e4e67/src/core/StateMachine.ts#L86)

Filter State Machine class that manages state transitions
for building filter expressions sequentially.

## Constructors

### Constructor

> **new FilterStateMachine**(): `FilterStateMachine`

#### Returns

`FilterStateMachine`

## Methods

### canTransition()

> **canTransition**(`action`): `boolean`

Defined in: [core/StateMachine.ts:112](https://github.com/jyukopla/react-select-filter-box/blob/732c0bb5d34ae2c255c8387f5b4df9b4c06e4e67/src/core/StateMachine.ts#L112)

Check if a transition is allowed from the current state

#### Parameters

##### action

`FilterAction`

#### Returns

`boolean`

---

### clear()

> **clear**(): `void`

Defined in: [core/StateMachine.ts:193](https://github.com/jyukopla/react-select-filter-box/blob/732c0bb5d34ae2c255c8387f5b4df9b4c06e4e67/src/core/StateMachine.ts#L193)

Clear all expressions but maintain current state

#### Returns

`void`

---

### getAvailableActions()

> **getAvailableActions**(): `FilterActionType`[]

Defined in: [core/StateMachine.ts:120](https://github.com/jyukopla/react-select-filter-box/blob/732c0bb5d34ae2c255c8387f5b4df9b4c06e4e67/src/core/StateMachine.ts#L120)

Get available action types for the current state

#### Returns

`FilterActionType`[]

---

### getContext()

> **getContext**(): `FilterContext`

Defined in: [core/StateMachine.ts:105](https://github.com/jyukopla/react-select-filter-box/blob/732c0bb5d34ae2c255c8387f5b4df9b4c06e4e67/src/core/StateMachine.ts#L105)

Get the current context

#### Returns

`FilterContext`

---

### getState()

> **getState**(): [`FilterStep`](../type-aliases/FilterStep.md)

Defined in: [core/StateMachine.ts:98](https://github.com/jyukopla/react-select-filter-box/blob/732c0bb5d34ae2c255c8387f5b4df9b4c06e4e67/src/core/StateMachine.ts#L98)

Get the current state

#### Returns

[`FilterStep`](../type-aliases/FilterStep.md)

---

### loadExpressions()

> **loadExpressions**(`expressions`): `void`

Defined in: [core/StateMachine.ts:206](https://github.com/jyukopla/react-select-filter-box/blob/732c0bb5d34ae2c255c8387f5b4df9b4c06e4e67/src/core/StateMachine.ts#L206)

Load expressions from external source

#### Parameters

##### expressions

[`FilterExpression`](../interfaces/FilterExpression.md)[]

#### Returns

`void`

---

### reset()

> **reset**(): `void`

Defined in: [core/StateMachine.ts:180](https://github.com/jyukopla/react-select-filter-box/blob/732c0bb5d34ae2c255c8387f5b4df9b4c06e4e67/src/core/StateMachine.ts#L180)

Reset the state machine to initial state

#### Returns

`void`

---

### transition()

> **transition**(`action`): `void`

Defined in: [core/StateMachine.ts:142](https://github.com/jyukopla/react-select-filter-box/blob/732c0bb5d34ae2c255c8387f5b4df9b4c06e4e67/src/core/StateMachine.ts#L142)

Transition to a new state based on the action

#### Parameters

##### action

`FilterAction`

#### Returns

`void`
