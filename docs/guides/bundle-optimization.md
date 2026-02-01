# Bundle Optimization Guide

This guide covers best practices for optimizing bundle size when using react-select-filter-box.

## Current Bundle Size

The library is designed to be lightweight:

| Format | Size (gzipped) |
| ------ | -------------- |
| ESM    | ~15-20kB       |
| CJS    | ~12-15kB       |
| CSS    | ~3-5kB         |

## Minimal Dependencies

The library has minimal runtime dependencies:

- **clsx** (~0.2kB) - Utility for conditionally joining classNames
- **React** (peer) - Required, bring your own
- **ReactDOM** (peer) - Required, bring your own

## Tree Shaking

The library is fully tree-shakable. Only import what you need:

```tsx
// ✅ Good - only imports what's needed
import { FilterBox } from 'react-select-filter-box'
import { createStaticAutocompleter } from 'react-select-filter-box/autocompleters'

// ❌ Avoid - imports everything
import * as FilterBoxLib from 'react-select-filter-box'
```

## Optional Features

### Date/Time Autocompleters

The built-in date and datetime autocompleters use the native JavaScript `Date` object and don't require any external date libraries. They provide:

- ISO 8601 date parsing and formatting
- Common date presets (Today, Yesterday, etc.)
- Date range support

If you need more advanced date functionality, you can integrate with your preferred date library:

```tsx
import { createStaticAutocompleter } from 'react-select-filter-box/autocompleters'
import { format, parse, isValid } from 'date-fns' // Optional dependency

const customDateAutocompleter = {
  getSuggestions: (context) => {
    const { inputValue } = context
    // Use date-fns for parsing
    const date = parse(inputValue, 'MM/dd/yyyy', new Date())
    if (isValid(date)) {
      return [
        {
          key: format(date, 'yyyy-MM-dd'),
          label: format(date, 'MMMM d, yyyy'),
        },
      ]
    }
    return []
  },
  validate: (value) => isValid(new Date(value)),
  format: (value) => format(new Date(value), 'MMMM d, yyyy'),
}
```

### Custom Widgets

Custom input widgets (date pickers, color pickers, etc.) are not bundled by default. Use dynamic imports to load them on demand:

```tsx
import { lazy, Suspense } from 'react'

// Lazy load a date picker widget
const DatePickerWidget = lazy(() => import('./widgets/DatePickerWidget'))

const schema = {
  fields: [
    {
      key: 'date',
      label: 'Date',
      type: 'date',
      operators: [{ key: 'eq', label: 'is' }],
      customWidget: (props) => (
        <Suspense fallback={<input type="date" {...props} />}>
          <DatePickerWidget {...props} />
        </Suspense>
      ),
    },
  ],
}
```

### Paginated Autocompleters

For large datasets, use the paginated autocompleter to lazy-load suggestions:

```tsx
import { createPaginatedAutocompleter } from 'react-select-filter-box/autocompleters'

const userAutocompleter = createPaginatedAutocompleter(
  async (query, page, pageSize, cursor, signal) => {
    const response = await fetch(`/api/users?q=${query}&page=${page}&limit=${pageSize}`, { signal })
    const data = await response.json()
    return {
      items: data.users.map((u) => ({ key: u.id, label: u.name })),
      hasMore: data.hasNextPage,
      total: data.totalCount,
    }
  },
  { pageSize: 20, debounceMs: 300 }
)
```

## Code Splitting Patterns

### Splitting by Feature

If you have multiple filter schemas, load them on demand:

```tsx
// schemas/index.ts
export const loadOrderSchema = () => import('./orderSchema')
export const loadUserSchema = () => import('./userSchema')
export const loadProductSchema = () => import('./productSchema')

// Usage
const [schema, setSchema] = useState(null)

useEffect(() => {
  loadOrderSchema().then((mod) => setSchema(mod.default))
}, [])
```

### Splitting Complex Autocompleters

Heavy autocompleters (with caching, validation, etc.) can be loaded dynamically:

```tsx
// autocompleters/heavyAutocompleter.ts
import {
  createAsyncAutocompleter,
  withCache,
  withStaleWhileRevalidate,
} from 'react-select-filter-box/autocompleters'

export const createHeavyAutocompleter = () => {
  return withStaleWhileRevalidate(
    withCache(
      createAsyncAutocompleter(async (query) => {
        // Heavy computation or API calls
      })
    ),
    { maxAge: 60000 }
  )
}

// Usage - load only when needed
const loadAutocompleter = () => import('./autocompleters/heavyAutocompleter')

// In component
useEffect(() => {
  loadAutocompleter().then((mod) => {
    setAutocompleter(mod.createHeavyAutocompleter())
  })
}, [])
```

## CSS Optimization

### Custom CSS Properties

Override CSS custom properties instead of duplicating styles:

```css
/* Only override what you need */
:root {
  --filter-box-primary: #3b82f6;
  --filter-box-radius: 6px;
}
```

### Minimal CSS Import

The library's CSS is modular. If you're using CSS-in-JS or custom styles, you can skip the default CSS entirely:

```tsx
// Only import the component, no CSS
import { FilterBox } from 'react-select-filter-box'

// Apply your own styles via className
;<FilterBox className="my-custom-filter" />
```

## Build Configuration

### Vite

```ts
// vite.config.ts
import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    rollupOptions: {
      // Mark react as external
      external: ['react', 'react-dom'],
    },
  },
})
```

### Webpack

```js
// webpack.config.js
module.exports = {
  externals: {
    react: 'React',
    'react-dom': 'ReactDOM',
  },
  optimization: {
    splitChunks: {
      chunks: 'all',
    },
  },
}
```

## Analyzing Bundle Size

Use bundle analysis tools to verify optimization:

```bash
# Vite
npx vite-bundle-visualizer

# Webpack
npx webpack-bundle-analyzer stats.json

# Source map explorer
npx source-map-explorer dist/*.js
```

## Performance Checklist

- [ ] Only import needed components and utilities
- [ ] Use lazy loading for custom widgets
- [ ] Use paginated autocompleters for large datasets
- [ ] Load schemas dynamically if you have multiple
- [ ] Minimize CSS by using custom properties
- [ ] Mark react/react-dom as externals
- [ ] Analyze bundle to find optimization opportunities
