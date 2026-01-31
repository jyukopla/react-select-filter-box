[**React Select Filter Box v0.0.0**](../README.md)

***

[React Select Filter Box](../README.md) / OperatorConfig

# Interface: OperatorConfig

Defined in: [types/Schema.ts:107](https://github.com/jyukopla/react-select-filter-box/blob/732c0bb5d34ae2c255c8387f5b4df9b4c06e4e67/src/types/Schema.ts#L107)

Configuration for an operator

## Properties

### customInput?

> `optional` **customInput**: `CustomAutocompleteWidget`

Defined in: [types/Schema.ts:121](https://github.com/jyukopla/react-select-filter-box/blob/732c0bb5d34ae2c255c8387f5b4df9b4c06e4e67/src/types/Schema.ts#L121)

Custom input widget

***

### key

> **key**: `string`

Defined in: [types/Schema.ts:109](https://github.com/jyukopla/react-select-filter-box/blob/732c0bb5d34ae2c255c8387f5b4df9b4c06e4e67/src/types/Schema.ts#L109)

Operator key (e.g., 'eq', 'before')

***

### label

> **label**: `string`

Defined in: [types/Schema.ts:111](https://github.com/jyukopla/react-select-filter-box/blob/732c0bb5d34ae2c255c8387f5b4df9b4c06e4e67/src/types/Schema.ts#L111)

Display label (e.g., 'equals', 'before')

***

### multiValue?

> `optional` **multiValue**: `MultiValueConfig`

Defined in: [types/Schema.ts:123](https://github.com/jyukopla/react-select-filter-box/blob/732c0bb5d34ae2c255c8387f5b4df9b4c06e4e67/src/types/Schema.ts#L123)

For operators needing multiple values

***

### symbol?

> `optional` **symbol**: `string`

Defined in: [types/Schema.ts:113](https://github.com/jyukopla/react-select-filter-box/blob/732c0bb5d34ae2c255c8387f5b4df9b4c06e4e67/src/types/Schema.ts#L113)

Optional symbol for compact display (e.g., '=', '≠')

***

### valueAutocompleter?

> `optional` **valueAutocompleter**: `Autocompleter`

Defined in: [types/Schema.ts:119](https://github.com/jyukopla/react-select-filter-box/blob/732c0bb5d34ae2c255c8387f5b4df9b4c06e4e67/src/types/Schema.ts#L119)

Custom autocompleter for values

***

### valueRequired?

> `optional` **valueRequired**: `boolean`

Defined in: [types/Schema.ts:117](https://github.com/jyukopla/react-select-filter-box/blob/732c0bb5d34ae2c255c8387f5b4df9b4c06e4e67/src/types/Schema.ts#L117)

Whether a value is required (default: true)

***

### valueType?

> `optional` **valueType**: [`FieldType`](../type-aliases/FieldType.md)

Defined in: [types/Schema.ts:115](https://github.com/jyukopla/react-select-filter-box/blob/732c0bb5d34ae2c255c8387f5b4df9b4c06e4e67/src/types/Schema.ts#L115)

Override field's value type
