[**React Select Filter Box v0.0.0**](../README.md)

***

[React Select Filter Box](../README.md) / deserialize

# Function: deserialize()

> **deserialize**(`serialized`, `schema`, `options`): [`FilterExpression`](../interfaces/FilterExpression.md)[]

Defined in: [utils/serialization.ts:85](https://github.com/jyukopla/react-select-filter-box/blob/732c0bb5d34ae2c255c8387f5b4df9b4c06e4e67/src/utils/serialization.ts#L85)

Deserialize from simple JSON format back to filter expressions
Supports custom field-level deserializers

## Parameters

### serialized

[`SerializedExpression`](../interfaces/SerializedExpression.md)[]

### schema

[`FilterSchema`](../interfaces/FilterSchema.md)

### options

`DeserializeOptions` = `{}`

## Returns

[`FilterExpression`](../interfaces/FilterExpression.md)[]
