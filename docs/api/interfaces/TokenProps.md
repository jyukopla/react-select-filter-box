[**React Select Filter Box v0.0.0**](../README.md)

---

[React Select Filter Box](../README.md) / TokenProps

# Interface: TokenProps

Defined in: [components/Token/Token.tsx:18](https://github.com/jyukopla/react-select-filter-box/blob/732c0bb5d34ae2c255c8387f5b4df9b4c06e4e67/src/components/Token/Token.tsx#L18)

## Properties

### className?

> `optional` **className**: `string`

Defined in: [components/Token/Token.tsx:42](https://github.com/jyukopla/react-select-filter-box/blob/732c0bb5d34ae2c255c8387f5b4df9b4c06e4e67/src/components/Token/Token.tsx#L42)

Additional CSS class

---

### data

> **data**: [`TokenData`](TokenData.md)

Defined in: [components/Token/Token.tsx:20](https://github.com/jyukopla/react-select-filter-box/blob/732c0bb5d34ae2c255c8387f5b4df9b4c06e4e67/src/components/Token/Token.tsx#L20)

Token data

---

### errorMessage?

> `optional` **errorMessage**: `string`

Defined in: [components/Token/Token.tsx:32](https://github.com/jyukopla/react-select-filter-box/blob/732c0bb5d34ae2c255c8387f5b4df9b4c06e4e67/src/components/Token/Token.tsx#L32)

Error message to display on hover

---

### hasError?

> `optional` **hasError**: `boolean`

Defined in: [components/Token/Token.tsx:30](https://github.com/jyukopla/react-select-filter-box/blob/732c0bb5d34ae2c255c8387f5b4df9b4c06e4e67/src/components/Token/Token.tsx#L30)

Whether this token has a validation error

---

### isDeletable

> **isDeletable**: `boolean`

Defined in: [components/Token/Token.tsx:28](https://github.com/jyukopla/react-select-filter-box/blob/732c0bb5d34ae2c255c8387f5b4df9b4c06e4e67/src/components/Token/Token.tsx#L28)

Whether this token can be deleted

---

### isEditable

> **isEditable**: `boolean`

Defined in: [components/Token/Token.tsx:22](https://github.com/jyukopla/react-select-filter-box/blob/732c0bb5d34ae2c255c8387f5b4df9b4c06e4e67/src/components/Token/Token.tsx#L22)

Whether this token can be edited

---

### isEditing

> **isEditing**: `boolean`

Defined in: [components/Token/Token.tsx:24](https://github.com/jyukopla/react-select-filter-box/blob/732c0bb5d34ae2c255c8387f5b4df9b4c06e4e67/src/components/Token/Token.tsx#L24)

Whether this token is currently being edited

---

### isSelected

> **isSelected**: `boolean`

Defined in: [components/Token/Token.tsx:26](https://github.com/jyukopla/react-select-filter-box/blob/732c0bb5d34ae2c255c8387f5b4df9b4c06e4e67/src/components/Token/Token.tsx#L26)

Whether this token is selected

---

### onDelete()

> **onDelete**: () => `void`

Defined in: [components/Token/Token.tsx:36](https://github.com/jyukopla/react-select-filter-box/blob/732c0bb5d34ae2c255c8387f5b4df9b4c06e4e67/src/components/Token/Token.tsx#L36)

Called when delete is requested

#### Returns

`void`

---

### onEdit()

> **onEdit**: () => `void`

Defined in: [components/Token/Token.tsx:34](https://github.com/jyukopla/react-select-filter-box/blob/732c0bb5d34ae2c255c8387f5b4df9b4c06e4e67/src/components/Token/Token.tsx#L34)

Called when the token is clicked to edit

#### Returns

`void`

---

### onEditCancel()

> **onEditCancel**: () => `void`

Defined in: [components/Token/Token.tsx:40](https://github.com/jyukopla/react-select-filter-box/blob/732c0bb5d34ae2c255c8387f5b4df9b4c06e4e67/src/components/Token/Token.tsx#L40)

Called when editing is cancelled

#### Returns

`void`

---

### onEditComplete()

> **onEditComplete**: (`newValue`) => `void`

Defined in: [components/Token/Token.tsx:38](https://github.com/jyukopla/react-select-filter-box/blob/732c0bb5d34ae2c255c8387f5b4df9b4c06e4e67/src/components/Token/Token.tsx#L38)

Called when editing is completed with new value

#### Parameters

##### newValue

[`ConditionValue`](ConditionValue.md)

#### Returns

`void`
