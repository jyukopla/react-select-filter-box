[**React Select Filter Box v0.0.0**](../README.md)

---

[React Select Filter Box](../README.md) / withStaleWhileRevalidate

# Function: withStaleWhileRevalidate()

> **withStaleWhileRevalidate**(`autocompleter`, `options`): `Autocompleter`

Defined in: [autocompleters/index.ts:728](https://github.com/jyukopla/react-select-filter-box/blob/732c0bb5d34ae2c255c8387f5b4df9b4c06e4e67/src/autocompleters/index.ts#L728)

Add stale-while-revalidate caching to any autocompleter.
Returns stale cached data immediately while fetching fresh data in the background.

## Parameters

### autocompleter

`Autocompleter`

### options

[`StaleWhileRevalidateOptions`](../interfaces/StaleWhileRevalidateOptions.md)

## Returns

`Autocompleter`
