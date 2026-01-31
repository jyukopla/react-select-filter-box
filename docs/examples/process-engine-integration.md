# Process Engine Integration Example

This example demonstrates how to integrate the React Sequential Filter Box with a process engine API.

## Overview

This example shows:
- Complex schema with multiple field types
- Async autocompleters for API-backed suggestions
- Date filters with presets
- Custom validation

## Schema Definition

```typescript
import {
  SchemaBuilder,
  createAsyncAutocompleter,
  createEnumAutocompleter,
  createDateAutocompleter,
  createNumberAutocompleter,
  DATE_OPERATORS,
  ID_OPERATORS,
} from 'react-select-filter-box'

// API client for fetching suggestions
const api = {
  fetchProcessDefinitions: async (query: string) => {
    const response = await fetch(`/api/process-definitions?q=${query}`)
    return response.json()
  },
  fetchUsers: async (query: string) => {
    const response = await fetch(`/api/users?q=${query}`)
    return response.json()
  },
}

// Build the schema
export const processInstanceSchema = new SchemaBuilder()
  // Identification
  .field('processInstanceId', 'Process Instance ID')
    .type('id')
    .group('Identification')
    .description('Unique process instance identifier')
    .done()

  .field('processDefinitionKey', 'Process Definition')
    .type('string')
    .group('Identification')
    .description('Process definition key or name')
    .valueAutocompleter(createAsyncAutocompleter(
      async (query, context, signal) => {
        const definitions = await api.fetchProcessDefinitions(query)
        return definitions.map((def: { key: string; name: string }) => ({
          type: 'value',
          key: def.key,
          label: def.name,
          description: def.key,
        }))
      },
      { debounceMs: 300, minChars: 2, cacheResults: true }
    ))
    .done()

  // Status
  .field('state', 'State')
    .type('enum')
    .group('Status')
    .description('Current process instance state')
    .valueAutocompleter(createEnumAutocompleter([
      { key: 'ACTIVE', label: 'Active', description: 'Currently running' },
      { key: 'COMPLETED', label: 'Completed', description: 'Finished successfully' },
      { key: 'SUSPENDED', label: 'Suspended', description: 'Temporarily paused' },
      { key: 'TERMINATED', label: 'Terminated', description: 'Cancelled or failed' },
    ]))
    .done()

  .field('hasIncidents', 'Has Incidents')
    .type('boolean')
    .group('Status')
    .description('Whether the process has open incidents')
    .done()

  // Assignments
  .field('assignee', 'Assignee')
    .type('string')
    .group('Assignments')
    .description('Currently assigned user')
    .valueAutocompleter(createAsyncAutocompleter(
      async (query) => {
        const users = await api.fetchUsers(query)
        return users.map((user: { id: string; name: string; email: string }) => ({
          type: 'value',
          key: user.id,
          label: user.name,
          description: user.email,
        }))
      },
      { debounceMs: 300 }
    ))
    .done()

  // Dates
  .field('startDate', 'Start Date')
    .type('date')
    .group('Dates')
    .description('When the process was started')
    .valueAutocompleter(createDateAutocompleter({
      presets: [
        { label: 'Today', value: new Date() },
        { label: 'Last 7 days', value: daysAgo(7) },
        { label: 'Last 30 days', value: daysAgo(30) },
        { label: 'This quarter', value: startOfQuarter(new Date()) },
      ],
    }))
    .done()

  .field('endDate', 'End Date')
    .type('date')
    .group('Dates')
    .description('When the process was completed')
    .done()

  // Variables
  .field('priority', 'Priority')
    .type('number')
    .group('Variables')
    .description('Process priority (1-10)')
    .valueAutocompleter(createNumberAutocompleter({
      min: 1,
      max: 10,
      integer: true,
    }))
    .done()

  // Configuration
  .maxExpressions(10)
  .build()

// Helper functions
function daysAgo(days: number): Date {
  const date = new Date()
  date.setDate(date.getDate() - days)
  return date
}

function startOfQuarter(date: Date): Date {
  const quarter = Math.floor(date.getMonth() / 3)
  return new Date(date.getFullYear(), quarter * 3, 1)
}
```

## Component Implementation

```tsx
import { useState, useCallback } from 'react'
import {
  FilterBox,
  type FilterExpression,
  serialize,
} from 'react-select-filter-box'
import { processInstanceSchema } from './processInstanceSchema'
import 'react-select-filter-box/styles.css'

interface ProcessInstance {
  id: string
  processDefinitionKey: string
  state: string
  startDate: string
  // ... other fields
}

function ProcessInstanceFilter() {
  const [expressions, setExpressions] = useState<FilterExpression[]>([])
  const [results, setResults] = useState<ProcessInstance[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Fetch filtered results when expressions change
  const fetchResults = useCallback(async (filters: FilterExpression[]) => {
    if (filters.length === 0) {
      setResults([])
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/process-instances/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: serialize(filters),
      })

      if (!response.ok) {
        throw new Error('Search failed')
      }

      const data = await response.json()
      setResults(data.items)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }, [])

  // Handle filter changes with debounce
  const handleChange = useCallback((newExpressions: FilterExpression[]) => {
    setExpressions(newExpressions)
    
    // Debounce API calls
    const timer = setTimeout(() => {
      fetchResults(newExpressions)
    }, 500)

    return () => clearTimeout(timer)
  }, [fetchResults])

  // Handle validation errors
  const handleError = useCallback((errors: ValidationError[]) => {
    console.warn('Filter validation errors:', errors)
  }, [])

  return (
    <div className="process-filter">
      <header className="process-filter__header">
        <h1>Process Instances</h1>
        <FilterBox
          schema={processInstanceSchema}
          value={expressions}
          onChange={handleChange}
          onError={handleError}
          aria-label="Filter process instances"
          showClearButton
          autoFocus
        />
      </header>

      <main className="process-filter__results">
        {loading && <div className="loading">Loading...</div>}
        {error && <div className="error">Error: {error}</div>}
        {!loading && !error && (
          <ProcessInstanceTable data={results} />
        )}
      </main>
    </div>
  )
}
```

## Converting Filters to API Request

```typescript
import type { FilterExpression } from 'react-select-filter-box'

interface ProcessInstanceQuery {
  processInstanceId?: string
  processDefinitionKey?: string
  state?: string[]
  hasIncidents?: boolean
  assignee?: string
  startDateAfter?: string
  startDateBefore?: string
  priority?: number
}

function expressionsToQuery(expressions: FilterExpression[]): ProcessInstanceQuery {
  const query: ProcessInstanceQuery = {}

  for (const expr of expressions) {
    const { field, operator, value } = expr.condition
    const rawValue = typeof value === 'object' && 'raw' in value ? value.raw : value

    switch (field) {
      case 'processInstanceId':
        query.processInstanceId = String(rawValue)
        break
        
      case 'processDefinitionKey':
        query.processDefinitionKey = String(rawValue)
        break
        
      case 'state':
        if (operator === 'in') {
          query.state = Array.isArray(rawValue) ? rawValue : [String(rawValue)]
        } else {
          query.state = [String(rawValue)]
        }
        break
        
      case 'hasIncidents':
        query.hasIncidents = rawValue === 'true' || rawValue === true
        break
        
      case 'startDate':
        if (operator === 'after') {
          query.startDateAfter = formatDateForAPI(rawValue as Date)
        } else if (operator === 'before') {
          query.startDateBefore = formatDateForAPI(rawValue as Date)
        } else if (operator === 'between') {
          const [start, end] = rawValue as [Date, Date]
          query.startDateAfter = formatDateForAPI(start)
          query.startDateBefore = formatDateForAPI(end)
        }
        break
        
      case 'priority':
        query.priority = Number(rawValue)
        break
    }
  }

  return query
}

function formatDateForAPI(date: Date): string {
  return date.toISOString()
}
```

## URL Synchronization

```tsx
import { useSearchParams } from 'react-router-dom'
import {
  serializeToQueryString,
  deserializeFromQueryString,
} from 'react-select-filter-box'

function ProcessInstanceFilterWithURL() {
  const [searchParams, setSearchParams] = useSearchParams()

  // Initialize from URL
  const initialExpressions = useMemo(() => {
    return deserializeFromQueryString(
      searchParams.toString(),
      processInstanceSchema
    )
  }, [])

  const [expressions, setExpressions] = useState(initialExpressions)

  // Sync to URL on change
  useEffect(() => {
    const queryString = serializeToQueryString(expressions)
    setSearchParams(new URLSearchParams(queryString))
  }, [expressions, setSearchParams])

  return (
    <FilterBox
      schema={processInstanceSchema}
      value={expressions}
      onChange={setExpressions}
    />
  )
}
```

## Styling

```css
.process-filter {
  display: flex;
  flex-direction: column;
  height: 100vh;
}

.process-filter__header {
  padding: 16px;
  border-bottom: 1px solid #e0e0e0;
}

.process-filter__header h1 {
  margin: 0 0 16px 0;
  font-size: 24px;
}

.process-filter__results {
  flex: 1;
  overflow: auto;
  padding: 16px;
}

/* Process engine specific colors */
:root {
  --filter-token-field-bg: #e0f7fa;
  --filter-token-field-border: #00acc1;
  --filter-token-field-text: #006064;
}
```

## Complete Working Example

See the full implementation in Storybook under "Real World Examples > Process Instance Filter".
