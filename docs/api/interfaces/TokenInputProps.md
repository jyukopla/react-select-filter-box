[**React Select Filter Box v0.0.0**](../README.md)

---

[React Select Filter Box](../README.md) / TokenInputProps

# Interface: TokenInputProps

Defined in: [components/TokenInput/TokenInput.tsx:11](https://github.com/jyukopla/react-select-filter-box/blob/732c0bb5d34ae2c255c8387f5b4df9b4c06e4e67/src/components/TokenInput/TokenInput.tsx#L11)

## Extends

- `Omit`\<`InputHTMLAttributes`\<`HTMLInputElement`\>, `"value"` \| `"onChange"` \| `"onKeyDown"` \| `"onFocus"` \| `"onBlur"`\>

## Properties

### autoFocus?

> `optional` **autoFocus**: `boolean`

Defined in: [components/TokenInput/TokenInput.tsx:25](https://github.com/jyukopla/react-select-filter-box/blob/732c0bb5d34ae2c255c8387f5b4df9b4c06e4e67/src/components/TokenInput/TokenInput.tsx#L25)

Whether to auto-focus on mount

#### Overrides

`Omit.autoFocus`

---

### className?

> `optional` **className**: `string`

Defined in: [components/TokenInput/TokenInput.tsx:29](https://github.com/jyukopla/react-select-filter-box/blob/732c0bb5d34ae2c255c8387f5b4df9b4c06e4e67/src/components/TokenInput/TokenInput.tsx#L29)

Additional CSS class

#### Overrides

`Omit.className`

---

### disabled?

> `optional` **disabled**: `boolean`

Defined in: [components/TokenInput/TokenInput.tsx:31](https://github.com/jyukopla/react-select-filter-box/blob/732c0bb5d34ae2c255c8387f5b4df9b4c06e4e67/src/components/TokenInput/TokenInput.tsx#L31)

Whether input is disabled

#### Overrides

`Omit.disabled`

---

### inputRef

> **inputRef**: `RefObject`\<`HTMLInputElement`\>

Defined in: [components/TokenInput/TokenInput.tsx:27](https://github.com/jyukopla/react-select-filter-box/blob/732c0bb5d34ae2c255c8387f5b4df9b4c06e4e67/src/components/TokenInput/TokenInput.tsx#L27)

Ref to the input element

---

### minWidth?

> `optional` **minWidth**: `number`

Defined in: [components/TokenInput/TokenInput.tsx:33](https://github.com/jyukopla/react-select-filter-box/blob/732c0bb5d34ae2c255c8387f5b4df9b4c06e4e67/src/components/TokenInput/TokenInput.tsx#L33)

Minimum width of the input

---

### onBlur()?

> `optional` **onBlur**: () => `void`

Defined in: [components/TokenInput/TokenInput.tsx:21](https://github.com/jyukopla/react-select-filter-box/blob/732c0bb5d34ae2c255c8387f5b4df9b4c06e4e67/src/components/TokenInput/TokenInput.tsx#L21)

Called when input loses focus

#### Returns

`void`

---

### onChange()

> **onChange**: (`value`) => `void`

Defined in: [components/TokenInput/TokenInput.tsx:15](https://github.com/jyukopla/react-select-filter-box/blob/732c0bb5d34ae2c255c8387f5b4df9b4c06e4e67/src/components/TokenInput/TokenInput.tsx#L15)

Called when value changes

#### Parameters

##### value

`string`

#### Returns

`void`

---

### onFocus()?

> `optional` **onFocus**: () => `void`

Defined in: [components/TokenInput/TokenInput.tsx:19](https://github.com/jyukopla/react-select-filter-box/blob/732c0bb5d34ae2c255c8387f5b4df9b4c06e4e67/src/components/TokenInput/TokenInput.tsx#L19)

Called when input gains focus

#### Returns

`void`

---

### onKeyDown()

> **onKeyDown**: (`e`) => `void`

Defined in: [components/TokenInput/TokenInput.tsx:17](https://github.com/jyukopla/react-select-filter-box/blob/732c0bb5d34ae2c255c8387f5b4df9b4c06e4e67/src/components/TokenInput/TokenInput.tsx#L17)

Called on keydown events

#### Parameters

##### e

`KeyboardEvent`\<`HTMLInputElement`\>

#### Returns

`void`

---

### placeholder?

> `optional` **placeholder**: `string`

Defined in: [components/TokenInput/TokenInput.tsx:23](https://github.com/jyukopla/react-select-filter-box/blob/732c0bb5d34ae2c255c8387f5b4df9b4c06e4e67/src/components/TokenInput/TokenInput.tsx#L23)

Placeholder text

#### Overrides

`Omit.placeholder`

---

### value

> **value**: `string`

Defined in: [components/TokenInput/TokenInput.tsx:13](https://github.com/jyukopla/react-select-filter-box/blob/732c0bb5d34ae2c255c8387f5b4df9b4c06e4e67/src/components/TokenInput/TokenInput.tsx#L13)

Current input value
