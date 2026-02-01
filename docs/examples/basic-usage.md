# Basic Usage Example

This example demonstrates the basic usage of the React Sequential Filter Box.

## Installation

```bash
npm install react-select-filter-box
```

## Basic Example

```tsx
import { useState } from 'react'
import {
  FilterBox,
  type FilterSchema,
  type FilterExpression,
  STRING_OPERATORS,
  NUMBER_OPERATORS,
  ENUM_OPERATORS,
  createEnumAutocompleter,
} from 'react-select-filter-box'
import 'react-select-filter-box/styles.css'

// Define your filter schema
const schema: FilterSchema = {
  fields: [
    {
      key: 'name',
      label: 'Name',
      type: 'string',
      description: 'Filter by name',
      operators: STRING_OPERATORS,
    },
    {
      key: 'age',
      label: 'Age',
      type: 'number',
      description: 'Filter by age',
      operators: NUMBER_OPERATORS,
    },
    {
      key: 'status',
      label: 'Status',
      type: 'enum',
      description: 'Filter by status',
      operators: ENUM_OPERATORS,
      valueAutocompleter: createEnumAutocompleter([
        { key: 'active', label: 'Active' },
        { key: 'inactive', label: 'Inactive' },
        { key: 'pending', label: 'Pending' },
      ]),
    },
  ],
}

function App() {
  // Controlled state for filter expressions
  const [expressions, setExpressions] = useState<FilterExpression[]>([])

  // Handle filter changes
  const handleChange = (newExpressions: FilterExpression[]) => {
    setExpressions(newExpressions)
    console.log('Filters updated:', newExpressions)
  }

  return (
    <div className="app">
      <h1>User Filter</h1>

      <FilterBox
        schema={schema}
        value={expressions}
        onChange={handleChange}
        aria-label="Filter users"
        showClearButton
      />

      {/* Display current filters */}
      <div className="filter-display">
        <h2>Current Filters:</h2>
        <pre>{JSON.stringify(expressions, null, 2)}</pre>
      </div>
    </div>
  )
}

export default App
```

## With Initial Values

```tsx
const initialExpressions: FilterExpression[] = [
  {
    condition: {
      field: 'status',
      operator: 'eq',
      value: { raw: 'active', display: 'Active', serialized: 'active' },
    },
  },
]

function AppWithInitialValue() {
  const [expressions, setExpressions] = useState(initialExpressions)

  return <FilterBox schema={schema} value={expressions} onChange={setExpressions} />
}
```

## Using the Imperative API

```tsx
import { useRef } from 'react'
import { FilterBox, type FilterBoxHandle } from 'react-select-filter-box'

function AppWithRef() {
  const filterRef = useRef<FilterBoxHandle>(null)
  const [expressions, setExpressions] = useState([])

  const handleFocus = () => {
    filterRef.current?.focus()
  }

  const handleClear = () => {
    filterRef.current?.clear()
  }

  return (
    <div>
      <FilterBox ref={filterRef} schema={schema} value={expressions} onChange={setExpressions} />

      <div className="controls">
        <button onClick={handleFocus}>Focus Filter</button>
        <button onClick={handleClear}>Clear All</button>
      </div>
    </div>
  )
}
```

## Converting to API Queries

```tsx
import { serialize, serializeToQueryString } from 'react-select-filter-box'

function useFilterAPI(expressions: FilterExpression[]) {
  // Serialize to JSON for POST body
  const jsonPayload = serialize(expressions)

  // Serialize to query string for GET requests
  const queryString = serializeToQueryString(expressions)

  const fetchData = async () => {
    // Option 1: POST request with JSON body
    const response = await fetch('/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: jsonPayload,
    })

    // Option 2: GET request with query parameters
    // const response = await fetch(`/api/users?${queryString}`)

    return response.json()
  }

  return { fetchData, jsonPayload, queryString }
}
```

## Styling

```css
/* Basic styling */
.app {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.filter-display {
  margin-top: 20px;
  padding: 10px;
  background: #f5f5f5;
  border-radius: 4px;
}

/* Override filter box colors */
:root {
  --filter-container-border-focus: #6200ea;
  --filter-token-field-bg: #ede7f6;
  --filter-token-field-border: #6200ea;
  --filter-token-field-text: #4a148c;
}
```

## Full Working Example

See the complete example in the [Storybook](../../storybook-static/index.html) under "Real World Examples > Basic Filter".
