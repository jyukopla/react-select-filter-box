[**React Select Filter Box v0.0.0**](../README.md)

---

[React Select Filter Box](../README.md) / FieldConfig

# Interface: FieldConfig

Defined in: [types/Schema.ts:133](https://github.com/jyukopla/react-select-filter-box/blob/732c0bb5d34ae2c255c8387f5b4df9b4c06e4e67/src/types/Schema.ts#L133)

Configuration for a filter field

## Properties

### allowMultiple?

> `optional` **allowMultiple**: `boolean`

Defined in: [types/Schema.ts:153](https://github.com/jyukopla/react-select-filter-box/blob/732c0bb5d34ae2c255c8387f5b4df9b4c06e4e67/src/types/Schema.ts#L153)

Whether this field can appear multiple times (default: true)

---

### color?

> `optional` **color**: `string`

Defined in: [types/Schema.ts:147](https://github.com/jyukopla/react-select-filter-box/blob/732c0bb5d34ae2c255c8387f5b4df9b4c06e4e67/src/types/Schema.ts#L147)

Field-level color

---

### defaultOperator?

> `optional` **defaultOperator**: `string`

Defined in: [types/Schema.ts:145](https://github.com/jyukopla/react-select-filter-box/blob/732c0bb5d34ae2c255c8387f5b4df9b4c06e4e67/src/types/Schema.ts#L145)

Default operator key (first if not specified)

---

### description?

> `optional` **description**: `string`

Defined in: [types/Schema.ts:139](https://github.com/jyukopla/react-select-filter-box/blob/732c0bb5d34ae2c255c8387f5b4df9b4c06e4e67/src/types/Schema.ts#L139)

Optional description

---

### deserialize()?

> `optional` **deserialize**: (`serialized`) => [`ConditionValue`](ConditionValue.md)

Defined in: [types/Schema.ts:163](https://github.com/jyukopla/react-select-filter-box/blob/732c0bb5d34ae2c255c8387f5b4df9b4c06e4e67/src/types/Schema.ts#L163)

Custom deserialization for field values

#### Parameters

##### serialized

`unknown`

#### Returns

[`ConditionValue`](ConditionValue.md)

---

### group?

> `optional` **group**: `string`

Defined in: [types/Schema.ts:151](https://github.com/jyukopla/react-select-filter-box/blob/732c0bb5d34ae2c255c8387f5b4df9b4c06e4e67/src/types/Schema.ts#L151)

Group for autocomplete display

---

### icon?

> `optional` **icon**: `ReactNode`

Defined in: [types/Schema.ts:149](https://github.com/jyukopla/react-select-filter-box/blob/732c0bb5d34ae2c255c8387f5b4df9b4c06e4e67/src/types/Schema.ts#L149)

Field icon

---

### key

> **key**: `string`

Defined in: [types/Schema.ts:135](https://github.com/jyukopla/react-select-filter-box/blob/732c0bb5d34ae2c255c8387f5b4df9b4c06e4e67/src/types/Schema.ts#L135)

Field key (used in API)

---

### label

> **label**: `string`

Defined in: [types/Schema.ts:137](https://github.com/jyukopla/react-select-filter-box/blob/732c0bb5d34ae2c255c8387f5b4df9b4c06e4e67/src/types/Schema.ts#L137)

Display label

---

### operators

> **operators**: [`OperatorConfig`](OperatorConfig.md)[]

Defined in: [types/Schema.ts:143](https://github.com/jyukopla/react-select-filter-box/blob/732c0bb5d34ae2c255c8387f5b4df9b4c06e4e67/src/types/Schema.ts#L143)

Available operators for this field

---

### serialize()?

> `optional` **serialize**: (`value`) => `unknown`

Defined in: [types/Schema.ts:161](https://github.com/jyukopla/react-select-filter-box/blob/732c0bb5d34ae2c255c8387f5b4df9b4c06e4e67/src/types/Schema.ts#L161)

Custom serialization for field values

#### Parameters

##### value

[`ConditionValue`](ConditionValue.md)

#### Returns

`unknown`

---

### type

> **type**: [`FieldType`](../type-aliases/FieldType.md)

Defined in: [types/Schema.ts:141](https://github.com/jyukopla/react-select-filter-box/blob/732c0bb5d34ae2c255c8387f5b4df9b4c06e4e67/src/types/Schema.ts#L141)

Field type (determines default operators and input)

---

### validate()?

> `optional` **validate**: (`value`, `context`) => [`ValidationResult`](ValidationResult.md)

Defined in: [types/Schema.ts:159](https://github.com/jyukopla/react-select-filter-box/blob/732c0bb5d34ae2c255c8387f5b4df9b4c06e4e67/src/types/Schema.ts#L159)

Custom value validation

#### Parameters

##### value

[`ConditionValue`](ConditionValue.md)

##### context

`ValidationContext`

#### Returns

[`ValidationResult`](ValidationResult.md)

---

### valueAutocompleter?

> `optional` **valueAutocompleter**: `Autocompleter`

Defined in: [types/Schema.ts:157](https://github.com/jyukopla/react-select-filter-box/blob/732c0bb5d34ae2c255c8387f5b4df9b4c06e4e67/src/types/Schema.ts#L157)

Custom autocompleter for values

---

### valueRequired?

> `optional` **valueRequired**: `boolean`

Defined in: [types/Schema.ts:155](https://github.com/jyukopla/react-select-filter-box/blob/732c0bb5d34ae2c255c8387f5b4df9b4c06e4e67/src/types/Schema.ts#L155)

Whether a value is required (default: true)
