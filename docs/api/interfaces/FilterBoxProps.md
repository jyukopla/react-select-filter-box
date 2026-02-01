[**React Select Filter Box v0.0.0**](../README.md)

---

[React Select Filter Box](../README.md) / FilterBoxProps

# Interface: FilterBoxProps

Defined in: [components/FilterBox/FilterBox.tsx:27](https://github.com/jyukopla/react-select-filter-box/blob/732c0bb5d34ae2c255c8387f5b4df9b4c06e4e67/src/components/FilterBox/FilterBox.tsx#L27)

react-select-filter-box

A Sequential Filter Box component for React that provides a Select2-like
single-line filter expression builder.

## Extends

- [`UseFilterStateProps`](UseFilterStateProps.md)

## Properties

### aria-label?

> `optional` **aria-label**: `string`

Defined in: [components/FilterBox/FilterBox.tsx:35](https://github.com/jyukopla/react-select-filter-box/blob/732c0bb5d34ae2c255c8387f5b4df9b4c06e4e67/src/components/FilterBox/FilterBox.tsx#L35)

Accessible label for the filter box

---

### autoFocus?

> `optional` **autoFocus**: `boolean`

Defined in: [components/FilterBox/FilterBox.tsx:39](https://github.com/jyukopla/react-select-filter-box/blob/732c0bb5d34ae2c255c8387f5b4df9b4c06e4e67/src/components/FilterBox/FilterBox.tsx#L39)

Auto-focus the input on mount

---

### className?

> `optional` **className**: `string`

Defined in: [components/FilterBox/FilterBox.tsx:29](https://github.com/jyukopla/react-select-filter-box/blob/732c0bb5d34ae2c255c8387f5b4df9b4c06e4e67/src/components/FilterBox/FilterBox.tsx#L29)

Additional CSS class names

---

### disabled?

> `optional` **disabled**: `boolean`

Defined in: [components/FilterBox/FilterBox.tsx:33](https://github.com/jyukopla/react-select-filter-box/blob/732c0bb5d34ae2c255c8387f5b4df9b4c06e4e67/src/components/FilterBox/FilterBox.tsx#L33)

Whether the filter box is disabled

---

### id?

> `optional` **id**: `string`

Defined in: [components/FilterBox/FilterBox.tsx:31](https://github.com/jyukopla/react-select-filter-box/blob/732c0bb5d34ae2c255c8387f5b4df9b4c06e4e67/src/components/FilterBox/FilterBox.tsx#L31)

ID for the component

---

### onChange()

> **onChange**: (`expressions`) => `void`

Defined in: [hooks/useFilterState.ts:26](https://github.com/jyukopla/react-select-filter-box/blob/732c0bb5d34ae2c255c8387f5b4df9b4c06e4e67/src/hooks/useFilterState.ts#L26)

Called when expressions change

#### Parameters

##### expressions

[`FilterExpression`](FilterExpression.md)[]

#### Returns

`void`

#### Inherited from

[`UseFilterStateProps`](UseFilterStateProps.md).[`onChange`](UseFilterStateProps.md#onchange)

---

### onError()?

> `optional` **onError**: (`errors`) => `void`

Defined in: [components/FilterBox/FilterBox.tsx:43](https://github.com/jyukopla/react-select-filter-box/blob/732c0bb5d34ae2c255c8387f5b4df9b4c06e4e67/src/components/FilterBox/FilterBox.tsx#L43)

Callback when validation errors occur

#### Parameters

##### errors

`ValidationError`[]

#### Returns

`void`

---

### schema

> **schema**: [`FilterSchema`](FilterSchema.md)

Defined in: [hooks/useFilterState.ts:22](https://github.com/jyukopla/react-select-filter-box/blob/732c0bb5d34ae2c255c8387f5b4df9b4c06e4e67/src/hooks/useFilterState.ts#L22)

Schema defining available fields and operators

#### Inherited from

[`UseFilterStateProps`](UseFilterStateProps.md).[`schema`](UseFilterStateProps.md#schema)

---

### showClearButton?

> `optional` **showClearButton**: `boolean`

Defined in: [components/FilterBox/FilterBox.tsx:41](https://github.com/jyukopla/react-select-filter-box/blob/732c0bb5d34ae2c255c8387f5b4df9b4c06e4e67/src/components/FilterBox/FilterBox.tsx#L41)

Show a clear button when there are filters (default: true)

---

### usePortal?

> `optional` **usePortal**: `boolean`

Defined in: [components/FilterBox/FilterBox.tsx:37](https://github.com/jyukopla/react-select-filter-box/blob/732c0bb5d34ae2c255c8387f5b4df9b4c06e4e67/src/components/FilterBox/FilterBox.tsx#L37)

Whether to render dropdown in a portal (default: true)

---

### value

> **value**: [`FilterExpression`](FilterExpression.md)[]

Defined in: [hooks/useFilterState.ts:24](https://github.com/jyukopla/react-select-filter-box/blob/732c0bb5d34ae2c255c8387f5b4df9b4c06e4e67/src/hooks/useFilterState.ts#L24)

Current filter expressions (controlled)

#### Inherited from

[`UseFilterStateProps`](UseFilterStateProps.md).[`value`](UseFilterStateProps.md#value)
