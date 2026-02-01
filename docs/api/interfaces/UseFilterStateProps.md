[**React Select Filter Box v0.0.0**](../README.md)

---

[React Select Filter Box](../README.md) / UseFilterStateProps

# Interface: UseFilterStateProps

Defined in: [hooks/useFilterState.ts:20](https://github.com/jyukopla/react-select-filter-box/blob/732c0bb5d34ae2c255c8387f5b4df9b4c06e4e67/src/hooks/useFilterState.ts#L20)

## Extended by

- [`FilterBoxProps`](FilterBoxProps.md)

## Properties

### onChange()

> **onChange**: (`expressions`) => `void`

Defined in: [hooks/useFilterState.ts:26](https://github.com/jyukopla/react-select-filter-box/blob/732c0bb5d34ae2c255c8387f5b4df9b4c06e4e67/src/hooks/useFilterState.ts#L26)

Called when expressions change

#### Parameters

##### expressions

[`FilterExpression`](FilterExpression.md)[]

#### Returns

`void`

---

### schema

> **schema**: [`FilterSchema`](FilterSchema.md)

Defined in: [hooks/useFilterState.ts:22](https://github.com/jyukopla/react-select-filter-box/blob/732c0bb5d34ae2c255c8387f5b4df9b4c06e4e67/src/hooks/useFilterState.ts#L22)

Schema defining available fields and operators

---

### value

> **value**: [`FilterExpression`](FilterExpression.md)[]

Defined in: [hooks/useFilterState.ts:24](https://github.com/jyukopla/react-select-filter-box/blob/732c0bb5d34ae2c255c8387f5b4df9b4c06e4e67/src/hooks/useFilterState.ts#L24)

Current filter expressions (controlled)
