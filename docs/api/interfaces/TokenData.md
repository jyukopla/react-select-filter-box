[**React Select Filter Box v0.0.0**](../README.md)

***

[React Select Filter Box](../README.md) / TokenData

# Interface: TokenData

Defined in: [types/Expression.ts:112](https://github.com/jyukopla/react-select-filter-box/blob/732c0bb5d34ae2c255c8387f5b4df9b4c06e4e67/src/types/Expression.ts#L112)

Token data representing a single token in the filter box

## Properties

### expressionIndex

> **expressionIndex**: `number`

Defined in: [types/Expression.ts:122](https://github.com/jyukopla/react-select-filter-box/blob/732c0bb5d34ae2c255c8387f5b4df9b4c06e4e67/src/types/Expression.ts#L122)

Which expression this belongs to (-1 for pending tokens)

***

### id

> **id**: `string`

Defined in: [types/Expression.ts:114](https://github.com/jyukopla/react-select-filter-box/blob/732c0bb5d34ae2c255c8387f5b4df9b4c06e4e67/src/types/Expression.ts#L114)

Unique identifier

***

### isPending?

> `optional` **isPending**: `boolean`

Defined in: [types/Expression.ts:124](https://github.com/jyukopla/react-select-filter-box/blob/732c0bb5d34ae2c255c8387f5b4df9b4c06e4e67/src/types/Expression.ts#L124)

Whether this token is part of an incomplete expression being built

***

### position

> **position**: `number`

Defined in: [types/Expression.ts:120](https://github.com/jyukopla/react-select-filter-box/blob/732c0bb5d34ae2c255c8387f5b4df9b4c06e4e67/src/types/Expression.ts#L120)

Position in token sequence

***

### type

> **type**: `TokenType`

Defined in: [types/Expression.ts:116](https://github.com/jyukopla/react-select-filter-box/blob/732c0bb5d34ae2c255c8387f5b4df9b4c06e4e67/src/types/Expression.ts#L116)

Token type

***

### value

> **value**: [`FieldValue`](FieldValue.md) \| [`OperatorValue`](OperatorValue.md) \| [`ConditionValue`](ConditionValue.md) \| [`ConnectorValue`](ConnectorValue.md)

Defined in: [types/Expression.ts:118](https://github.com/jyukopla/react-select-filter-box/blob/732c0bb5d34ae2c255c8387f5b4df9b4c06e4e67/src/types/Expression.ts#L118)

Token value (varies by type)
