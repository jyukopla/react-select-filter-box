[**React Select Filter Box v0.0.0**](../README.md)

---

[React Select Filter Box](../README.md) / StaleWhileRevalidateOptions

# Interface: StaleWhileRevalidateOptions

Defined in: [autocompleters/index.ts:715](https://github.com/jyukopla/react-select-filter-box/blob/732c0bb5d34ae2c255c8387f5b4df9b4c06e4e67/src/autocompleters/index.ts#L715)

Options for stale-while-revalidate wrapper

## Properties

### maxAge

> **maxAge**: `number`

Defined in: [autocompleters/index.ts:717](https://github.com/jyukopla/react-select-filter-box/blob/732c0bb5d34ae2c255c8387f5b4df9b4c06e4e67/src/autocompleters/index.ts#L717)

Time in ms before cached data is considered stale (triggers background revalidation)

---

### onUpdate()?

> `optional` **onUpdate**: (`items`) => `void`

Defined in: [autocompleters/index.ts:721](https://github.com/jyukopla/react-select-filter-box/blob/732c0bb5d34ae2c255c8387f5b4df9b4c06e4e67/src/autocompleters/index.ts#L721)

Callback when fresh data arrives after returning stale data

#### Parameters

##### items

[`AutocompleteItem`](AutocompleteItem.md)[]

#### Returns

`void`

---

### staleAge?

> `optional` **staleAge**: `number`

Defined in: [autocompleters/index.ts:719](https://github.com/jyukopla/react-select-filter-box/blob/732c0bb5d34ae2c255c8387f5b4df9b4c06e4e67/src/autocompleters/index.ts#L719)

Time in ms before cached data is completely expired (forces fresh fetch). Default: maxAge \* 2
