[**React Select Filter Box v0.0.0**](../README.md)

***

[React Select Filter Box](../README.md) / createAsyncAutocompleter

# Function: createAsyncAutocompleter()

> **createAsyncAutocompleter**(`fetchFn`, `options`): `Autocompleter`

Defined in: [autocompleters/index.ts:150](https://github.com/jyukopla/react-select-filter-box/blob/732c0bb5d34ae2c255c8387f5b4df9b4c06e4e67/src/autocompleters/index.ts#L150)

Create an autocompleter that fetches from an async source.
Supports AbortSignal for canceling in-flight requests when new input arrives.

## Parameters

### fetchFn

(`query`, `context`, `signal?`) => `Promise`\<[`AutocompleteItem`](../interfaces/AutocompleteItem.md)[]\>

### options

[`AsyncAutocompleterOptions`](../interfaces/AsyncAutocompleterOptions.md) = `{}`

## Returns

`Autocompleter`
