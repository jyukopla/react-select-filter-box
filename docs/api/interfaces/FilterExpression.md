[**React Select Filter Box v0.0.0**](../README.md)

***

[React Select Filter Box](../README.md) / FilterExpression

# Interface: FilterExpression

Defined in: [types/Expression.ts:93](https://github.com/jyukopla/react-select-filter-box/blob/732c0bb5d34ae2c255c8387f5b4df9b4c06e4e67/src/types/Expression.ts#L93)

A filter expression with optional connector to next expression

## Properties

### condition

> **condition**: [`FilterCondition`](FilterCondition.md)

Defined in: [types/Expression.ts:95](https://github.com/jyukopla/react-select-filter-box/blob/732c0bb5d34ae2c255c8387f5b4df9b4c06e4e67/src/types/Expression.ts#L95)

The condition for this expression

***

### connector?

> `optional` **connector**: `"AND"` \| `"OR"`

Defined in: [types/Expression.ts:97](https://github.com/jyukopla/react-select-filter-box/blob/732c0bb5d34ae2c255c8387f5b4df9b4c06e4e67/src/types/Expression.ts#L97)

Connector to the NEXT expression (undefined for last expression)
