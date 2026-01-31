# react-select-filter-box

A Sequential Filter Box component for React that provides a Select2-like single-line filter expression builder.

[![CI](https://github.com/your-org/react-select-filter-box/actions/workflows/ci.yml/badge.svg)](https://github.com/your-org/react-select-filter-box/actions/workflows/ci.yml)
[![License: EUPL-1.2](https://img.shields.io/badge/License-EUPL--1.2-blue.svg)](https://opensource.org/licenses/EUPL-1.2)

## Features

- 🎯 **Sequential Token Input** - Build filter expressions token by token (field → operator → value)
- 🔍 **Smart Autocomplete** - Context-aware suggestions with keyboard navigation
- 🎨 **Fully Themeable** - Customizable colors, typography, and token styles
- ♿ **Accessible** - Full ARIA support and keyboard navigation
- ⚡ **High Performance** - Virtual scrolling for large lists, request cancellation, SWR caching
- 📦 **Type-Safe** - Full TypeScript support with comprehensive type definitions
- 🧩 **Pluggable Autocompleters** - Built-in and custom autocomplete providers

## Installation

```bash
npm install react-select-filter-box
```

## Quick Start

```tsx
import { FilterBox, type FilterSchema, type FilterExpression } from 'react-select-filter-box'
import 'react-select-filter-box/styles'

const schema: FilterSchema = {
  fields: [
    {
      key: 'status',
      label: 'Status',
      type: 'enum',
      operators: [
        { key: 'eq', label: 'is', symbol: '=' },
        { key: 'neq', label: 'is not', symbol: '≠' },
      ],
    },
    {
      key: 'assignee',
      label: 'Assignee',
      type: 'string',
      operators: [
        { key: 'eq', label: 'is', symbol: '=' },
        { key: 'contains', label: 'contains', symbol: '~' },
      ],
    },
  ],
}

function App() {
  const [value, setValue] = useState<FilterExpression[]>([])

  return (
    <FilterBox
      schema={schema}
      value={value}
      onChange={setValue}
      placeholder="Add a filter..."
    />
  )
}
```

## Schema Definition

Define your filter schema with fields, operators, and optional autocompleters:

```tsx
import { 
  FilterSchema, 
  createEnumAutocompleter,
  createAsyncAutocompleter,
  createDateAutocompleter,
} from 'react-select-filter-box'

const schema: FilterSchema = {
  fields: [
    {
      key: 'priority',
      label: 'Priority',
      type: 'enum',
      operators: [
        { key: 'eq', label: 'is', symbol: '=' },
      ],
      valueAutocompleter: createEnumAutocompleter([
        { key: 'high', label: 'High', color: '#e74c3c' },
        { key: 'medium', label: 'Medium', color: '#f39c12' },
        { key: 'low', label: 'Low', color: '#27ae60' },
      ]),
    },
    {
      key: 'created',
      label: 'Created',
      type: 'date',
      operators: [
        { key: 'gte', label: 'after', symbol: '≥' },
        { key: 'lte', label: 'before', symbol: '≤' },
      ],
      valueAutocompleter: createDateAutocompleter(),
    },
    {
      key: 'owner',
      label: 'Owner',
      type: 'string',
      operators: [
        { key: 'eq', label: 'is', symbol: '=' },
      ],
      valueAutocompleter: createAsyncAutocompleter(
        async (query) => {
          const response = await fetch(`/api/users?q=${query}`)
          const users = await response.json()
          return users.map(u => ({ type: 'value', key: u.id, label: u.name }))
        },
        { debounceMs: 300, minChars: 2 }
      ),
    },
  ],
}
```

## Built-in Autocompleters

| Autocompleter | Description |
|---------------|-------------|
| `createStaticAutocompleter` | Static list of suggestions |
| `createEnumAutocompleter` | Enum values with colors and descriptions |
| `createAsyncAutocompleter` | Async/API-backed suggestions with debouncing |
| `createNumberAutocompleter` | Number input with min/max/step validation |
| `createDateAutocompleter` | Date picker with presets (Today, Yesterday, etc.) |
| `createDateTimeAutocompleter` | DateTime picker with time presets |

### Autocompleter Wrappers

| Wrapper | Description |
|---------|-------------|
| `withCache(autocompleter, ttlMs)` | Add caching with TTL |
| `withDebounce(autocompleter, ms)` | Add debouncing |
| `withStaleWhileRevalidate(autocompleter, options)` | SWR caching pattern |
| `combineAutocompleters(...autocompleters)` | Combine multiple autocompleters |
| `mapAutocompleter(autocompleter, fn)` | Transform results |

## Theming

```tsx
import { FilterBoxThemeProvider, createTheme } from 'react-select-filter-box'

const customTheme = createTheme({
  colors: {
    primary: '#3b82f6',
    background: '#ffffff',
    border: '#e5e7eb',
  },
  tokens: {
    field: { background: '#dbeafe', color: '#1e40af' },
    operator: { background: '#fef3c7', color: '#92400e' },
    value: { background: '#d1fae5', color: '#065f46' },
  },
})

function App() {
  return (
    <FilterBoxThemeProvider theme={customTheme}>
      <FilterBox schema={schema} value={value} onChange={setValue} />
    </FilterBoxThemeProvider>
  )
}
```

## Serialization

Convert filter expressions to/from JSON or query strings:

```tsx
import { serialize, deserialize, toQueryString, fromQueryString } from 'react-select-filter-box'

// To JSON
const json = serialize(expressions)

// From JSON
const expressions = deserialize(json, schema)

// To query string
const qs = toQueryString(expressions)
// → "status=active&assignee~john"

// From query string
const expressions = fromQueryString(qs, schema)
```

## Validation

```tsx
import { validateExpressions } from 'react-select-filter-box'

const result = validateExpressions(expressions, schema)

if (!result.valid) {
  console.error('Validation errors:', result.errors)
}
```

## API Reference

### FilterBox Props

| Prop | Type | Description |
|------|------|-------------|
| `schema` | `FilterSchema` | Field and operator definitions |
| `value` | `FilterExpression[]` | Current filter expressions |
| `onChange` | `(value: FilterExpression[]) => void` | Change handler |
| `placeholder` | `string` | Input placeholder text |
| `disabled` | `boolean` | Disable the component |
| `maxExpressions` | `number` | Maximum number of expressions |
| `onError` | `(errors: ValidationError[]) => void` | Error callback |
| `className` | `string` | Additional CSS class |

## Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Run tests
npm test

# Run Storybook
npm run storybook

# Build library
npm run build:lib
```

## License

[EUPL-1.2](LICENSE)
