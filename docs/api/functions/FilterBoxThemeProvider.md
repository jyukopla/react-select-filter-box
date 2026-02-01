[**React Select Filter Box v0.0.0**](../README.md)

---

[React Select Filter Box](../README.md) / FilterBoxThemeProvider

# Function: FilterBoxThemeProvider()

> **FilterBoxThemeProvider**(`__namedParameters`): `Element`

Defined in: [theme/index.tsx:222](https://github.com/jyukopla/react-select-filter-box/blob/732c0bb5d34ae2c255c8387f5b4df9b4c06e4e67/src/theme/index.tsx#L222)

Theme provider component for FilterBox

Wraps FilterBox components to apply custom theming through CSS custom properties.

## Parameters

### \_\_namedParameters

[`FilterBoxThemeProviderProps`](../interfaces/FilterBoxThemeProviderProps.md)

## Returns

`Element`

## Example

```tsx
const customTheme = {
  tokens: {
    fieldBg: '#e8f4f8',
    fieldBorder: '#0078d4',
  },
  container: {
    borderFocus: '#0078d4',
  },
}

;<FilterBoxThemeProvider theme={customTheme}>
  <FilterBox schema={schema} value={value} onChange={onChange} />
</FilterBoxThemeProvider>
```
