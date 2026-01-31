# Custom Autocompleters Guide

This guide explains how to create custom autocompleters for the React Sequential Filter Box.

## Overview

Autocompleters provide suggestions for filter values. The component includes several built-in autocompleters, and you can create custom ones for specialized needs.

## Built-in Autocompleters

### Static Autocompleter

For predefined lists of values:

```typescript
import { createStaticAutocompleter } from 'react-select-filter-box'

// Simple string array
const colors = createStaticAutocompleter(['red', 'green', 'blue'])

// With descriptions
const statusAutocompleter = createStaticAutocompleter([
  { key: 'active', label: 'Active', description: 'Currently running' },
  { key: 'paused', label: 'Paused', description: 'Temporarily stopped' },
  { key: 'completed', label: 'Completed', description: 'Finished' },
])

// With options
const prefixMatcher = createStaticAutocompleter(values, {
  matchMode: 'prefix',      // 'prefix' | 'substring' | 'fuzzy'
  caseSensitive: false,
  maxResults: 10,
})
```

### Enum Autocompleter

For strongly-typed enumerated values:

```typescript
import { createEnumAutocompleter } from 'react-select-filter-box'

const processStates = createEnumAutocompleter([
  { key: 'ACTIVE', label: 'Active', description: 'Process is running' },
  { key: 'SUSPENDED', label: 'Suspended', description: 'Process is paused' },
  { key: 'COMPLETED', label: 'Completed' },
  { key: 'TERMINATED', label: 'Terminated' },
], {
  searchable: true,     // Allow filtering by typing
  allowMultiple: false, // For 'in' operator
})
```

### Async Autocompleter

For API-backed suggestions:

```typescript
import { createAsyncAutocompleter } from 'react-select-filter-box'

const userAutocompleter = createAsyncAutocompleter(
  async (query, context, signal) => {
    const response = await fetch(`/api/users?search=${query}`, {
      signal, // Pass AbortSignal for cancellation
    })
    const users = await response.json()
    return users.map(user => ({
      key: user.id,
      label: user.name,
      description: user.email,
    }))
  },
  {
    debounceMs: 300,    // Debounce API calls
    minChars: 2,        // Minimum characters before searching
    cacheResults: true, // Cache API responses
  }
)
```

### Number Autocompleter

For numeric values with validation:

```typescript
import { createNumberAutocompleter } from 'react-select-filter-box'

const ageAutocompleter = createNumberAutocompleter({
  min: 0,
  max: 150,
  integer: true,
})

const priceAutocompleter = createNumberAutocompleter({
  min: 0,
  max: 1000000,
  step: 0.01,
  format: (n) => `$${n.toFixed(2)}`,
  parse: (s) => parseFloat(s.replace(/[$,]/g, '')),
})
```

### Date Autocompleter

For date input with presets:

```typescript
import { createDateAutocompleter } from 'react-select-filter-box'

const dateAutocompleter = createDateAutocompleter({
  format: 'yyyy-MM-dd',
  minDate: new Date('2020-01-01'),
  maxDate: new Date(),
  presets: [
    { label: 'Today', value: new Date() },
    { label: 'Yesterday', value: subDays(new Date(), 1) },
    { label: 'Last Week', value: subWeeks(new Date(), 1) },
    { label: 'Last Month', value: subMonths(new Date(), 1) },
  ],
})
```

### DateTime Autocompleter

For date and time input:

```typescript
import { createDateTimeAutocompleter } from 'react-select-filter-box'

const dateTimeAutocompleter = createDateTimeAutocompleter({
  format: "yyyy-MM-dd'T'HH:mm",
  showTimeZone: true,
})
```

## Custom Autocompleter Interface

To create a fully custom autocompleter, implement the `Autocompleter` interface:

```typescript
import type { Autocompleter, AutocompleteContext, AutocompleteItem } from 'react-select-filter-box'

interface Autocompleter {
  // Required: Return suggestions based on context
  getSuggestions: (
    context: AutocompleteContext
  ) => Promise<AutocompleteItem[]> | AutocompleteItem[]
  
  // Optional: Custom rendering for suggestions
  renderItem?: (item: AutocompleteItem, isHighlighted: boolean) => ReactNode
  
  // Optional: Custom input widget instead of dropdown
  customWidget?: CustomAutocompleteWidget
  
  // Optional: Value validation
  validate?: (value: unknown, context: AutocompleteContext) => boolean
  
  // Optional: Parse display string back to value
  parse?: (display: string, context: AutocompleteContext) => unknown
  
  // Optional: Format value for display
  format?: (value: unknown, context: AutocompleteContext) => string
}
```

### AutocompleteContext

The context provides information about the current filter state:

```typescript
interface AutocompleteContext {
  inputValue: string              // Current user input
  field: FieldConfig              // Current field configuration
  operator: OperatorConfig        // Current operator configuration
  existingExpressions: FilterExpression[]  // Already added filters
  schema: FilterSchema            // Full schema
}
```

## Creating Custom Autocompleters

### Example: User Autocompleter with Avatar

```typescript
import type { Autocompleter, AutocompleteContext } from 'react-select-filter-box'

interface User {
  id: string
  name: string
  email: string
  avatarUrl: string
}

export function createUserAutocompleter(apiUrl: string): Autocompleter {
  const cache = new Map<string, User[]>()
  
  return {
    getSuggestions: async (context: AutocompleteContext) => {
      const { inputValue } = context
      
      if (inputValue.length < 2) {
        return []
      }
      
      // Check cache
      if (cache.has(inputValue)) {
        return formatUsers(cache.get(inputValue)!)
      }
      
      // Fetch from API
      const response = await fetch(
        `${apiUrl}/users/search?q=${encodeURIComponent(inputValue)}`
      )
      const users: User[] = await response.json()
      
      // Cache results
      cache.set(inputValue, users)
      
      return formatUsers(users)
    },
    
    // Custom rendering with avatars
    renderItem: (item, isHighlighted) => (
      <div className={`user-item ${isHighlighted ? 'highlighted' : ''}`}>
        <img src={item.icon} alt="" className="avatar" />
        <div className="user-info">
          <span className="user-name">{item.label}</span>
          <span className="user-email">{item.description}</span>
        </div>
      </div>
    ),
    
    validate: (value) => {
      return typeof value === 'string' && value.length > 0
    },
  }
}

function formatUsers(users: User[]): AutocompleteItem[] {
  return users.map(user => ({
    type: 'value',
    key: user.id,
    label: user.name,
    description: user.email,
    icon: user.avatarUrl,
  }))
}
```

### Example: Dependent Field Autocompleter

Create an autocompleter that depends on other filter values:

```typescript
import type { Autocompleter, AutocompleteContext } from 'react-select-filter-box'

export function createCityAutocompleter(): Autocompleter {
  return {
    getSuggestions: async (context: AutocompleteContext) => {
      const { inputValue, existingExpressions } = context
      
      // Find the country filter
      const countryFilter = existingExpressions.find(
        expr => expr.condition.field === 'country'
      )
      
      if (!countryFilter) {
        // No country selected, show all cities
        return fetchCities(inputValue)
      }
      
      // Filter cities by selected country
      const country = countryFilter.condition.value
      return fetchCities(inputValue, country)
    },
  }
}

async function fetchCities(query: string, country?: string) {
  const url = country
    ? `/api/cities?q=${query}&country=${country}`
    : `/api/cities?q=${query}`
  
  const response = await fetch(url)
  const cities = await response.json()
  
  return cities.map(city => ({
    type: 'value',
    key: city.id,
    label: city.name,
    description: city.country,
  }))
}
```

### Example: Free-form Text Autocompleter

Allow any text input while showing suggestions:

```typescript
export function createSearchTermAutocompleter(
  recentSearches: string[]
): Autocompleter {
  return {
    getSuggestions: (context: AutocompleteContext) => {
      const { inputValue } = context
      
      const suggestions: AutocompleteItem[] = []
      
      // Always add the current input as the first option
      if (inputValue.trim()) {
        suggestions.push({
          type: 'value',
          key: `custom:${inputValue}`,
          label: inputValue,
          description: 'Use this value',
        })
      }
      
      // Add matching recent searches
      const matchingRecent = recentSearches
        .filter(s => s.toLowerCase().includes(inputValue.toLowerCase()))
        .slice(0, 5)
        .map(s => ({
          type: 'value' as const,
          key: s,
          label: s,
          description: 'Recent search',
        }))
      
      return [...suggestions, ...matchingRecent]
    },
  }
}
```

## Autocompleter Composition

Combine multiple autocompleters:

```typescript
import { composeAutocompleters, chainAutocompleters } from 'react-select-filter-box'

// Merge results from multiple sources
const combinedAutocompleter = composeAutocompleters([
  recentSearchesAutocompleter,
  apiAutocompleter,
  staticFallbackAutocompleter,
])

// Chain: try each until one returns results
const fallbackAutocompleter = chainAutocompleters([
  cacheAutocompleter,
  apiAutocompleter,
  defaultValuesAutocompleter,
])
```

## Custom Input Widgets

For complex value input (dates, ranges, etc.), use custom widgets:

```typescript
import type { CustomAutocompleteWidget } from 'react-select-filter-box'

const dateRangeWidget: CustomAutocompleteWidget = {
  render: ({ onConfirm, onCancel, initialValue }) => (
    <DateRangePicker
      value={initialValue}
      onSelect={(range) => {
        onConfirm(range, formatDateRange(range))
      }}
      onCancel={onCancel}
    />
  ),
  
  validate: (value) => {
    return Array.isArray(value) && 
           value.length === 2 && 
           value[0] < value[1]
  },
  
  serialize: (value) => {
    const [start, end] = value as [Date, Date]
    return `${formatDate(start)}..${formatDate(end)}`
  },
  
  parse: (serialized) => {
    const [start, end] = serialized.split('..')
    return [new Date(start), new Date(end)]
  },
}

// Use in field configuration
{
  key: 'dateRange',
  label: 'Date Range',
  type: 'date',
  operators: [{
    key: 'between',
    label: 'between',
    customInput: dateRangeWidget,
  }],
}
```

## Best Practices

### 1. Handle Loading States

```typescript
createAsyncAutocompleter(async (query, context) => {
  try {
    return await fetchData(query)
  } catch (error) {
    console.error('Failed to fetch suggestions:', error)
    return [] // Return empty array on error
  }
}, {
  loadingMessage: 'Searching...',
})
```

### 2. Implement Cancellation

```typescript
createAsyncAutocompleter(async (query, context, signal) => {
  const response = await fetch(`/api/search?q=${query}`, { signal })
  if (!response.ok) throw new Error('Search failed')
  return response.json()
})
```

### 3. Cache Aggressively

```typescript
const cache = new Map()

function getCacheKey(query: string, context: AutocompleteContext) {
  return `${context.field.key}:${context.operator.key}:${query}`
}

getSuggestions: async (context) => {
  const key = getCacheKey(context.inputValue, context)
  if (cache.has(key)) return cache.get(key)
  
  const results = await fetchData(context.inputValue)
  cache.set(key, results)
  return results
}
```

### 4. Limit Results

```typescript
getSuggestions: (context) => {
  return allItems
    .filter(item => matches(item, context.inputValue))
    .slice(0, 50) // Limit to 50 results
}
```

## Next Steps

- [Schema Definition Guide](./schema-definition.md)
- [Theming Guide](./theming.md)
- [Custom Widgets Guide](./custom-widgets.md)
