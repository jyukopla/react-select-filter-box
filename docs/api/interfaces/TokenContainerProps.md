[**React Select Filter Box v0.0.0**](../README.md)

---

[React Select Filter Box](../README.md) / TokenContainerProps

# Interface: TokenContainerProps

Defined in: [components/TokenContainer/TokenContainer.tsx:14](https://github.com/jyukopla/react-select-filter-box/blob/732c0bb5d34ae2c255c8387f5b4df9b4c06e4e67/src/components/TokenContainer/TokenContainer.tsx#L14)

## Properties

### allTokensSelected?

> `optional` **allTokensSelected**: `boolean`

Defined in: [components/TokenContainer/TokenContainer.tsx:50](https://github.com/jyukopla/react-select-filter-box/blob/732c0bb5d34ae2c255c8387f5b4df9b4c06e4e67/src/components/TokenContainer/TokenContainer.tsx#L50)

Whether all tokens are selected

---

### className?

> `optional` **className**: `string`

Defined in: [components/TokenContainer/TokenContainer.tsx:42](https://github.com/jyukopla/react-select-filter-box/blob/732c0bb5d34ae2c255c8387f5b4df9b4c06e4e67/src/components/TokenContainer/TokenContainer.tsx#L42)

Additional CSS class

---

### disabled?

> `optional` **disabled**: `boolean`

Defined in: [components/TokenContainer/TokenContainer.tsx:40](https://github.com/jyukopla/react-select-filter-box/blob/732c0bb5d34ae2c255c8387f5b4df9b4c06e4e67/src/components/TokenContainer/TokenContainer.tsx#L40)

Whether the container is disabled

---

### editingTokenIndex?

> `optional` **editingTokenIndex**: `number`

Defined in: [components/TokenContainer/TokenContainer.tsx:46](https://github.com/jyukopla/react-select-filter-box/blob/732c0bb5d34ae2c255c8387f5b4df9b4c06e4e67/src/components/TokenContainer/TokenContainer.tsx#L46)

Index of token currently being edited (-1 if not editing)

---

### inputProps?

> `optional` **inputProps**: `Partial`\<`InputHTMLAttributes`\<`HTMLInputElement`\>\>

Defined in: [components/TokenContainer/TokenContainer.tsx:44](https://github.com/jyukopla/react-select-filter-box/blob/732c0bb5d34ae2c255c8387f5b4df9b4c06e4e67/src/components/TokenContainer/TokenContainer.tsx#L44)

Additional props for the input element

---

### inputRef

> **inputRef**: `RefObject`\<`HTMLInputElement`\>

Defined in: [components/TokenContainer/TokenContainer.tsx:36](https://github.com/jyukopla/react-select-filter-box/blob/732c0bb5d34ae2c255c8387f5b4df9b4c06e4e67/src/components/TokenContainer/TokenContainer.tsx#L36)

Ref to the input element

---

### inputValue

> **inputValue**: `string`

Defined in: [components/TokenContainer/TokenContainer.tsx:18](https://github.com/jyukopla/react-select-filter-box/blob/732c0bb5d34ae2c255c8387f5b4df9b4c06e4e67/src/components/TokenContainer/TokenContainer.tsx#L18)

Current input value

---

### onBlur()?

> `optional` **onBlur**: () => `void`

Defined in: [components/TokenContainer/TokenContainer.tsx:34](https://github.com/jyukopla/react-select-filter-box/blob/732c0bb5d34ae2c255c8387f5b4df9b4c06e4e67/src/components/TokenContainer/TokenContainer.tsx#L34)

Called when container loses focus (legacy)

#### Returns

`void`

---

### onFocus()?

> `optional` **onFocus**: () => `void`

Defined in: [components/TokenContainer/TokenContainer.tsx:32](https://github.com/jyukopla/react-select-filter-box/blob/732c0bb5d34ae2c255c8387f5b4df9b4c06e4e67/src/components/TokenContainer/TokenContainer.tsx#L32)

Called when container gains focus (legacy)

#### Returns

`void`

---

### onInputBlur()?

> `optional` **onInputBlur**: () => `void`

Defined in: [components/TokenContainer/TokenContainer.tsx:30](https://github.com/jyukopla/react-select-filter-box/blob/732c0bb5d34ae2c255c8387f5b4df9b4c06e4e67/src/components/TokenContainer/TokenContainer.tsx#L30)

Called when input loses focus

#### Returns

`void`

---

### onInputChange()

> **onInputChange**: (`value`) => `void`

Defined in: [components/TokenContainer/TokenContainer.tsx:20](https://github.com/jyukopla/react-select-filter-box/blob/732c0bb5d34ae2c255c8387f5b4df9b4c06e4e67/src/components/TokenContainer/TokenContainer.tsx#L20)

Called when input value changes

#### Parameters

##### value

`string`

#### Returns

`void`

---

### onInputFocus()?

> `optional` **onInputFocus**: () => `void`

Defined in: [components/TokenContainer/TokenContainer.tsx:28](https://github.com/jyukopla/react-select-filter-box/blob/732c0bb5d34ae2c255c8387f5b4df9b4c06e4e67/src/components/TokenContainer/TokenContainer.tsx#L28)

Called when input gains focus

#### Returns

`void`

---

### onInputKeyDown()

> **onInputKeyDown**: (`e`) => `void`

Defined in: [components/TokenContainer/TokenContainer.tsx:22](https://github.com/jyukopla/react-select-filter-box/blob/732c0bb5d34ae2c255c8387f5b4df9b4c06e4e67/src/components/TokenContainer/TokenContainer.tsx#L22)

Called on input keydown

#### Parameters

##### e

`KeyboardEvent`\<`HTMLInputElement`\>

#### Returns

`void`

---

### onOperatorClick()?

> `optional` **onOperatorClick**: (`expressionIndex`) => `void`

Defined in: [components/TokenContainer/TokenContainer.tsx:26](https://github.com/jyukopla/react-select-filter-box/blob/732c0bb5d34ae2c255c8387f5b4df9b4c06e4e67/src/components/TokenContainer/TokenContainer.tsx#L26)

Called when an operator token is clicked (for editing)

#### Parameters

##### expressionIndex

`number`

#### Returns

`void`

---

### onTokenClick()?

> `optional` **onTokenClick**: (`position`) => `void`

Defined in: [components/TokenContainer/TokenContainer.tsx:24](https://github.com/jyukopla/react-select-filter-box/blob/732c0bb5d34ae2c255c8387f5b4df9b4c06e4e67/src/components/TokenContainer/TokenContainer.tsx#L24)

Called when a token is clicked

#### Parameters

##### position

`number`

#### Returns

`void`

---

### onTokenEditCancel()?

> `optional` **onTokenEditCancel**: () => `void`

Defined in: [components/TokenContainer/TokenContainer.tsx:54](https://github.com/jyukopla/react-select-filter-box/blob/732c0bb5d34ae2c255c8387f5b4df9b4c06e4e67/src/components/TokenContainer/TokenContainer.tsx#L54)

Called when token edit is cancelled

#### Returns

`void`

---

### onTokenEditComplete()?

> `optional` **onTokenEditComplete**: (`newValue`) => `void`

Defined in: [components/TokenContainer/TokenContainer.tsx:52](https://github.com/jyukopla/react-select-filter-box/blob/732c0bb5d34ae2c255c8387f5b4df9b4c06e4e67/src/components/TokenContainer/TokenContainer.tsx#L52)

Called when token edit is complete

#### Parameters

##### newValue

[`ConditionValue`](ConditionValue.md)

#### Returns

`void`

---

### placeholder?

> `optional` **placeholder**: `string`

Defined in: [components/TokenContainer/TokenContainer.tsx:38](https://github.com/jyukopla/react-select-filter-box/blob/732c0bb5d34ae2c255c8387f5b4df9b4c06e4e67/src/components/TokenContainer/TokenContainer.tsx#L38)

Placeholder for the input

---

### selectedTokenIndex?

> `optional` **selectedTokenIndex**: `number`

Defined in: [components/TokenContainer/TokenContainer.tsx:48](https://github.com/jyukopla/react-select-filter-box/blob/732c0bb5d34ae2c255c8387f5b4df9b4c06e4e67/src/components/TokenContainer/TokenContainer.tsx#L48)

Index of currently selected token (-1 if none)

---

### tokens

> **tokens**: [`TokenData`](TokenData.md)[]

Defined in: [components/TokenContainer/TokenContainer.tsx:16](https://github.com/jyukopla/react-select-filter-box/blob/732c0bb5d34ae2c255c8387f5b4df9b4c06e4e67/src/components/TokenContainer/TokenContainer.tsx#L16)

Array of tokens to display
