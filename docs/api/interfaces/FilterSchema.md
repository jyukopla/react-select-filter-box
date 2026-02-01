[**React Select Filter Box v0.0.0**](../README.md)

---

[React Select Filter Box](../README.md) / FilterSchema

# Interface: FilterSchema

Defined in: [types/Schema.ts:203](https://github.com/jyukopla/react-select-filter-box/blob/732c0bb5d34ae2c255c8387f5b4df9b4c06e4e67/src/types/Schema.ts#L203)

Complete filter schema configuration

## Properties

### connectors?

> `optional` **connectors**: `ConnectorConfig`[]

Defined in: [types/Schema.ts:207](https://github.com/jyukopla/react-select-filter-box/blob/732c0bb5d34ae2c255c8387f5b4df9b4c06e4e67/src/types/Schema.ts#L207)

Available connectors (default: AND, OR)

---

### deserialize()?

> `optional` **deserialize**: (`data`) => [`FilterExpression`](FilterExpression.md)[]

Defined in: [types/Schema.ts:215](https://github.com/jyukopla/react-select-filter-box/blob/732c0bb5d34ae2c255c8387f5b4df9b4c06e4e67/src/types/Schema.ts#L215)

Custom deserialization

#### Parameters

##### data

`unknown`

#### Returns

[`FilterExpression`](FilterExpression.md)[]

---

### fields

> **fields**: [`FieldConfig`](FieldConfig.md)[]

Defined in: [types/Schema.ts:205](https://github.com/jyukopla/react-select-filter-box/blob/732c0bb5d34ae2c255c8387f5b4df9b4c06e4e67/src/types/Schema.ts#L205)

Available fields

---

### maxExpressions?

> `optional` **maxExpressions**: `number`

Defined in: [types/Schema.ts:211](https://github.com/jyukopla/react-select-filter-box/blob/732c0bb5d34ae2c255c8387f5b4df9b4c06e4e67/src/types/Schema.ts#L211)

Maximum number of expressions allowed

---

### serialize()?

> `optional` **serialize**: (`expressions`) => `unknown`

Defined in: [types/Schema.ts:213](https://github.com/jyukopla/react-select-filter-box/blob/732c0bb5d34ae2c255c8387f5b4df9b4c06e4e67/src/types/Schema.ts#L213)

Custom serialization

#### Parameters

##### expressions

[`FilterExpression`](FilterExpression.md)[]

#### Returns

`unknown`

---

### validate()?

> `optional` **validate**: (`expressions`) => [`ValidationResult`](ValidationResult.md)

Defined in: [types/Schema.ts:209](https://github.com/jyukopla/react-select-filter-box/blob/732c0bb5d34ae2c255c8387f5b4df9b4c06e4e67/src/types/Schema.ts#L209)

Schema-level validation

#### Parameters

##### expressions

[`FilterExpression`](FilterExpression.md)[]

#### Returns

[`ValidationResult`](ValidationResult.md)
