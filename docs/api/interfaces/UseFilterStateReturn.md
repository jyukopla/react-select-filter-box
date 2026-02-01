[**React Select Filter Box v0.0.0**](../README.md)

---

[React Select Filter Box](../README.md) / UseFilterStateReturn

# Interface: UseFilterStateReturn

Defined in: [hooks/useFilterState.ts:29](https://github.com/jyukopla/react-select-filter-box/blob/732c0bb5d34ae2c255c8387f5b4df9b4c06e4e67/src/hooks/useFilterState.ts#L29)

## Properties

### allTokensSelected

> **allTokensSelected**: `boolean`

Defined in: [hooks/useFilterState.ts:51](https://github.com/jyukopla/react-select-filter-box/blob/732c0bb5d34ae2c255c8387f5b4df9b4c06e4e67/src/hooks/useFilterState.ts#L51)

Whether all tokens are selected (via Ctrl+A)

---

### announcement

> **announcement**: `string`

Defined in: [hooks/useFilterState.ts:45](https://github.com/jyukopla/react-select-filter-box/blob/732c0bb5d34ae2c255c8387f5b4df9b4c06e4e67/src/hooks/useFilterState.ts#L45)

Screen reader announcement

---

### editingOperatorIndex

> **editingOperatorIndex**: `number`

Defined in: [hooks/useFilterState.ts:53](https://github.com/jyukopla/react-select-filter-box/blob/732c0bb5d34ae2c255c8387f5b4df9b4c06e4e67/src/hooks/useFilterState.ts#L53)

Index of expression whose operator is being edited (-1 if not editing)

---

### editingTokenIndex

> **editingTokenIndex**: `number`

Defined in: [hooks/useFilterState.ts:47](https://github.com/jyukopla/react-select-filter-box/blob/732c0bb5d34ae2c255c8387f5b4df9b4c06e4e67/src/hooks/useFilterState.ts#L47)

Index of token currently being edited (-1 if not editing)

---

### handleBlur()

> **handleBlur**: () => `void`

Defined in: [hooks/useFilterState.ts:57](https://github.com/jyukopla/react-select-filter-box/blob/732c0bb5d34ae2c255c8387f5b4df9b4c06e4e67/src/hooks/useFilterState.ts#L57)

Handle blur event

#### Returns

`void`

---

### handleClear()

> **handleClear**: () => `void`

Defined in: [hooks/useFilterState.ts:69](https://github.com/jyukopla/react-select-filter-box/blob/732c0bb5d34ae2c255c8387f5b4df9b4c06e4e67/src/hooks/useFilterState.ts#L69)

Clear all expressions

#### Returns

`void`

---

### handleConfirmValue()

> **handleConfirmValue**: () => `void`

Defined in: [hooks/useFilterState.ts:67](https://github.com/jyukopla/react-select-filter-box/blob/732c0bb5d34ae2c255c8387f5b4df9b4c06e4e67/src/hooks/useFilterState.ts#L67)

Confirm the current value

#### Returns

`void`

---

### handleFocus()

> **handleFocus**: () => `void`

Defined in: [hooks/useFilterState.ts:55](https://github.com/jyukopla/react-select-filter-box/blob/732c0bb5d34ae2c255c8387f5b4df9b4c06e4e67/src/hooks/useFilterState.ts#L55)

Handle focus event

#### Returns

`void`

---

### handleHighlight()

> **handleHighlight**: (`index`) => `void`

Defined in: [hooks/useFilterState.ts:65](https://github.com/jyukopla/react-select-filter-box/blob/732c0bb5d34ae2c255c8387f5b4df9b4c06e4e67/src/hooks/useFilterState.ts#L65)

Handle highlighting a suggestion

#### Parameters

##### index

`number`

#### Returns

`void`

---

### handleInputChange()

> **handleInputChange**: (`value`) => `void`

Defined in: [hooks/useFilterState.ts:59](https://github.com/jyukopla/react-select-filter-box/blob/732c0bb5d34ae2c255c8387f5b4df9b4c06e4e67/src/hooks/useFilterState.ts#L59)

Handle input change

#### Parameters

##### value

`string`

#### Returns

`void`

---

### handleKeyDown()

> **handleKeyDown**: (`e`) => `void`

Defined in: [hooks/useFilterState.ts:61](https://github.com/jyukopla/react-select-filter-box/blob/732c0bb5d34ae2c255c8387f5b4df9b4c06e4e67/src/hooks/useFilterState.ts#L61)

Handle key down

#### Parameters

##### e

`KeyboardEvent`\<`HTMLInputElement`\>

#### Returns

`void`

---

### handleOperatorEdit()

> **handleOperatorEdit**: (`expressionIndex`) => `void`

Defined in: [hooks/useFilterState.ts:77](https://github.com/jyukopla/react-select-filter-box/blob/732c0bb5d34ae2c255c8387f5b4df9b4c06e4e67/src/hooks/useFilterState.ts#L77)

Start editing an operator in an existing expression

#### Parameters

##### expressionIndex

`number`

#### Returns

`void`

---

### handleOperatorEditCancel()

> **handleOperatorEditCancel**: () => `void`

Defined in: [hooks/useFilterState.ts:79](https://github.com/jyukopla/react-select-filter-box/blob/732c0bb5d34ae2c255c8387f5b4df9b4c06e4e67/src/hooks/useFilterState.ts#L79)

Cancel operator editing

#### Returns

`void`

---

### handleSelect()

> **handleSelect**: (`item`) => `void`

Defined in: [hooks/useFilterState.ts:63](https://github.com/jyukopla/react-select-filter-box/blob/732c0bb5d34ae2c255c8387f5b4df9b4c06e4e67/src/hooks/useFilterState.ts#L63)

Handle suggestion selection

#### Parameters

##### item

[`AutocompleteItem`](AutocompleteItem.md)

#### Returns

`void`

---

### handleTokenEdit()

> **handleTokenEdit**: (`tokenIndex`) => `void`

Defined in: [hooks/useFilterState.ts:71](https://github.com/jyukopla/react-select-filter-box/blob/732c0bb5d34ae2c255c8387f5b4df9b4c06e4e67/src/hooks/useFilterState.ts#L71)

Start editing a token

#### Parameters

##### tokenIndex

`number`

#### Returns

`void`

---

### handleTokenEditCancel()

> **handleTokenEditCancel**: () => `void`

Defined in: [hooks/useFilterState.ts:75](https://github.com/jyukopla/react-select-filter-box/blob/732c0bb5d34ae2c255c8387f5b4df9b4c06e4e67/src/hooks/useFilterState.ts#L75)

Cancel editing a token

#### Returns

`void`

---

### handleTokenEditComplete()

> **handleTokenEditComplete**: (`newValue`) => `void`

Defined in: [hooks/useFilterState.ts:73](https://github.com/jyukopla/react-select-filter-box/blob/732c0bb5d34ae2c255c8387f5b4df9b4c06e4e67/src/hooks/useFilterState.ts#L73)

Complete editing a token

#### Parameters

##### newValue

[`ConditionValue`](ConditionValue.md)

#### Returns

`void`

---

### highlightedIndex

> **highlightedIndex**: `number`

Defined in: [hooks/useFilterState.ts:39](https://github.com/jyukopla/react-select-filter-box/blob/732c0bb5d34ae2c255c8387f5b4df9b4c06e4e67/src/hooks/useFilterState.ts#L39)

Currently highlighted suggestion index

---

### inputValue

> **inputValue**: `string`

Defined in: [hooks/useFilterState.ts:41](https://github.com/jyukopla/react-select-filter-box/blob/732c0bb5d34ae2c255c8387f5b4df9b4c06e4e67/src/hooks/useFilterState.ts#L41)

Current input value

---

### isDropdownOpen

> **isDropdownOpen**: `boolean`

Defined in: [hooks/useFilterState.ts:35](https://github.com/jyukopla/react-select-filter-box/blob/732c0bb5d34ae2c255c8387f5b4df9b4c06e4e67/src/hooks/useFilterState.ts#L35)

Whether dropdown is open

---

### placeholder

> **placeholder**: `string`

Defined in: [hooks/useFilterState.ts:43](https://github.com/jyukopla/react-select-filter-box/blob/732c0bb5d34ae2c255c8387f5b4df9b4c06e4e67/src/hooks/useFilterState.ts#L43)

Placeholder text

---

### selectedTokenIndex

> **selectedTokenIndex**: `number`

Defined in: [hooks/useFilterState.ts:49](https://github.com/jyukopla/react-select-filter-box/blob/732c0bb5d34ae2c255c8387f5b4df9b4c06e4e67/src/hooks/useFilterState.ts#L49)

Index of currently selected token (-1 if none)

---

### state

> **state**: [`FilterStep`](../type-aliases/FilterStep.md)

Defined in: [hooks/useFilterState.ts:31](https://github.com/jyukopla/react-select-filter-box/blob/732c0bb5d34ae2c255c8387f5b4df9b4c06e4e67/src/hooks/useFilterState.ts#L31)

Current state machine state

---

### suggestions

> **suggestions**: [`AutocompleteItem`](AutocompleteItem.md)[]

Defined in: [hooks/useFilterState.ts:37](https://github.com/jyukopla/react-select-filter-box/blob/732c0bb5d34ae2c255c8387f5b4df9b4c06e4e67/src/hooks/useFilterState.ts#L37)

Current suggestions

---

### tokens

> **tokens**: [`TokenData`](TokenData.md)[]

Defined in: [hooks/useFilterState.ts:33](https://github.com/jyukopla/react-select-filter-box/blob/732c0bb5d34ae2c255c8387f5b4df9b4c06e4e67/src/hooks/useFilterState.ts#L33)

Tokens to display
