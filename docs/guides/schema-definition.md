# Schema Definition Guide

This guide explains how to define filter schemas for the React Sequential Filter Box component.

## Overview

A filter schema defines:
- What fields are available for filtering
- What operators apply to each field
- How values are entered and validated
- How expressions are connected (AND/OR)

## Quick Start

### Basic Schema Definition

```typescript
import { FilterBox, type FilterSchema } from 'react-select-filter-box'

const schema: FilterSchema = {
  fields: [
    {
      key: 'name',
      label: 'Name',
      type: 'string',
      operators: [
        { key: 'eq', label: 'equals', symbol: '=' },
        { key: 'contains', label: 'contains' },
      ],
    },
    {
      key: 'age',
      label: 'Age',
      type: 'number',
      operators: [
        { key: 'eq', label: 'equals', symbol: '=' },
        { key: 'gt', label: 'greater than', symbol: '>' },
        { key: 'lt', label: 'less than', symbol: '<' },
      ],
    },
  ],
}

function App() {
  const [expressions, setExpressions] = useState([])
  
  return (
    <FilterBox
      schema={schema}
      value={expressions}
      onChange={setExpressions}
    />
  )
}
```

### Using the Schema Builder (Fluent API)

```typescript
import { SchemaBuilder } from 'react-select-filter-box'

const schema = new SchemaBuilder()
  .field('name', 'Name')
    .type('string')
    .description('Person name')
    .operators(['eq', 'contains', 'startsWith'])
    .done()
  .field('age', 'Age')
    .type('number')
    .done()
  .field('status', 'Status')
    .type('enum')
    .group('Process')
    .done()
  .maxExpressions(5)
  .build()
```

## Field Types

The component supports these built-in field types:

| Type | Description | Default Operators |
|------|-------------|-------------------|
| `string` | Text values | equals, not equals, contains, starts with, ends with, like |
| `number` | Numeric values | equals, not equals, >, ≥, <, ≤, between |
| `date` | Date values | before, after, on, between |
| `datetime` | Date and time values | before, after, on, between |
| `boolean` | True/false values | is |
| `enum` | Predefined options | is, is not, in |
| `id` | Unique identifiers | equals, in list |
| `custom` | Custom behavior | (defined per field) |

## Field Configuration

### Complete Field Configuration

```typescript
interface FieldConfig {
  // Required
  key: string          // Field identifier (used in API calls)
  label: string        // Display label
  type: FieldType      // Field type (see above)
  operators: OperatorConfig[]  // Available operators

  // Optional
  description?: string         // Tooltip description
  group?: string               // Group in autocomplete dropdown
  defaultOperator?: string     // Default operator key
  color?: string               // Custom color for field tokens
  icon?: ReactNode             // Icon in autocomplete
  allowMultiple?: boolean      // Can appear multiple times (default: true)
  valueRequired?: boolean      // Requires a value (default: true)
  valueAutocompleter?: Autocompleter  // Custom value suggestions
  validate?: (value, context) => ValidationResult  // Custom validation
  serialize?: (value) => unknown   // Custom serialization
  deserialize?: (data) => value    // Custom deserialization
}
```

### Field Examples

#### String Field

```typescript
{
  key: 'username',
  label: 'Username',
  type: 'string',
  description: 'The user login name',
  operators: [
    { key: 'eq', label: 'equals', symbol: '=' },
    { key: 'contains', label: 'contains' },
    { key: 'startsWith', label: 'starts with' },
  ],
}
```

#### Enum Field with Predefined Values

```typescript
import { createEnumAutocompleter } from 'react-select-filter-box'

{
  key: 'status',
  label: 'Status',
  type: 'enum',
  operators: [
    { key: 'eq', label: 'is', symbol: '=' },
    { key: 'neq', label: 'is not', symbol: '≠' },
  ],
  valueAutocompleter: createEnumAutocompleter([
    { value: 'active', label: 'Active', description: 'Currently running' },
    { value: 'completed', label: 'Completed', description: 'Finished successfully' },
    { value: 'suspended', label: 'Suspended', description: 'Temporarily paused' },
    { value: 'terminated', label: 'Terminated', description: 'Stopped by user' },
  ]),
}
```

#### Date Field

```typescript
import { createDateAutocompleter } from 'react-select-filter-box'

{
  key: 'createdAt',
  label: 'Created Date',
  type: 'date',
  group: 'Dates',
  operators: [
    { key: 'after', label: 'after' },
    { key: 'before', label: 'before' },
    { key: 'on', label: 'on' },
    { 
      key: 'between', 
      label: 'between',
      multiValue: { count: 2, separator: 'and', labels: ['from', 'to'] },
    },
  ],
  valueAutocompleter: createDateAutocompleter({
    format: 'yyyy-MM-dd',
    minDate: new Date('2020-01-01'),
    maxDate: new Date(),
  }),
}
```

## Operator Configuration

### Operator Structure

```typescript
interface OperatorConfig {
  key: string          // Operator identifier
  label: string        // Display label
  symbol?: string      // Short symbol (e.g., '=', '≠', '>')
  valueType?: FieldType     // Override field's value type
  valueRequired?: boolean   // Whether value is needed (default: true)
  valueAutocompleter?: Autocompleter  // Custom autocompleter
  customInput?: CustomAutocompleteWidget  // Custom input widget
  multiValue?: MultiValueConfig  // For operators needing multiple values
}
```

### Multi-Value Operators

For operators like "between" that require multiple values:

```typescript
{
  key: 'between',
  label: 'between',
  multiValue: {
    count: 2,           // Number of values required
    separator: 'and',   // Display separator
    labels: ['from', 'to'],  // Labels for each input
  },
}
```

### Operators Without Values

For operators like "is null" or "is empty":

```typescript
{
  key: 'isNull',
  label: 'is null',
  valueRequired: false,  // No value input needed
}
```

## Using Default Operators

Import and use predefined operator sets:

```typescript
import {
  STRING_OPERATORS,
  NUMBER_OPERATORS,
  DATE_OPERATORS,
  BOOLEAN_OPERATORS,
  ENUM_OPERATORS,
  ID_OPERATORS,
  getDefaultOperators,
} from 'react-select-filter-box'

// Use predefined operators
{
  key: 'price',
  label: 'Price',
  type: 'number',
  operators: NUMBER_OPERATORS,
}

// Or get defaults by type
{
  key: 'createdAt',
  label: 'Created',
  type: 'date',
  operators: getDefaultOperators('date'),
}

// Filter defaults to specific operators
{
  key: 'name',
  label: 'Name',
  type: 'string',
  operators: STRING_OPERATORS.filter(op => 
    ['eq', 'contains'].includes(op.key)
  ),
}
```

## Schema-Level Configuration

### Complete Schema Structure

```typescript
interface FilterSchema {
  fields: FieldConfig[]
  connectors?: ConnectorConfig[]  // Default: AND, OR
  maxExpressions?: number         // Limit number of expressions
  validate?: (expressions) => ValidationResult  // Schema validation
  serialize?: (expressions) => unknown    // Custom serialization
  deserialize?: (data) => expressions     // Custom deserialization
}
```

### Custom Connectors

```typescript
const schema: FilterSchema = {
  fields: [...],
  connectors: [
    { key: 'AND', label: 'AND', color: '#ff9800' },
    { key: 'OR', label: 'OR', color: '#2196f3' },
  ],
}
```

### Limiting Expressions

```typescript
const schema: FilterSchema = {
  fields: [...],
  maxExpressions: 5,  // Maximum 5 filter expressions
}
```

### Schema-Level Validation

```typescript
const schema: FilterSchema = {
  fields: [...],
  validate: (expressions) => {
    // Require at least one expression
    if (expressions.length === 0) {
      return {
        valid: false,
        errors: [{ message: 'At least one filter is required' }],
      }
    }
    
    // Check for conflicting filters
    const hasActive = expressions.some(e => 
      e.condition.field === 'status' && e.condition.value === 'active'
    )
    const hasTerminated = expressions.some(e => 
      e.condition.field === 'status' && e.condition.value === 'terminated'
    )
    
    if (hasActive && hasTerminated) {
      return {
        valid: false,
        errors: [{ 
          message: 'Cannot filter for both active and terminated status' 
        }],
      }
    }
    
    return { valid: true, errors: [] }
  },
}
```

## Field Groups

Organize fields into groups in the autocomplete dropdown:

```typescript
const schema: FilterSchema = {
  fields: [
    // Process fields
    { key: 'processId', label: 'Process ID', type: 'id', group: 'Process' },
    { key: 'processName', label: 'Name', type: 'string', group: 'Process' },
    { key: 'status', label: 'Status', type: 'enum', group: 'Process' },
    
    // Time fields
    { key: 'startDate', label: 'Start Date', type: 'date', group: 'Time' },
    { key: 'endDate', label: 'End Date', type: 'date', group: 'Time' },
    
    // Variables (ungrouped - appears at top)
    { key: 'priority', label: 'Priority', type: 'number' },
  ],
}
```

## TypeScript Integration

### Type-Safe Schemas

```typescript
import type { FilterSchema, FieldConfig } from 'react-select-filter-box'

// Define your field keys as a union type
type MyFieldKey = 'name' | 'age' | 'status' | 'createdAt'

// Create type-safe field configurations
const fields: Record<MyFieldKey, FieldConfig> = {
  name: { key: 'name', label: 'Name', type: 'string', operators: STRING_OPERATORS },
  age: { key: 'age', label: 'Age', type: 'number', operators: NUMBER_OPERATORS },
  status: { key: 'status', label: 'Status', type: 'enum', operators: ENUM_OPERATORS },
  createdAt: { key: 'createdAt', label: 'Created', type: 'date', operators: DATE_OPERATORS },
}

const schema: FilterSchema = {
  fields: Object.values(fields),
}
```

## Complete Example

```typescript
import {
  FilterBox,
  SchemaBuilder,
  createEnumAutocompleter,
  createDateAutocompleter,
  createAsyncAutocompleter,
  STRING_OPERATORS,
} from 'react-select-filter-box'

// Build a comprehensive process engine filter schema
const processSchema = new SchemaBuilder()
  // Process identification
  .field('processInstanceId', 'Process ID')
    .type('id')
    .group('Identification')
    .description('Unique process instance identifier')
    .done()
  .field('processDefinitionKey', 'Definition Key')
    .type('string')
    .group('Identification')
    .valueAutocompleter(createAsyncAutocompleter({
      fetchSuggestions: async (query) => {
        const response = await fetch(`/api/process-definitions?q=${query}`)
        return response.json()
      },
      debounceMs: 300,
    }))
    .done()
    
  // Status
  .field('state', 'State')
    .type('enum')
    .group('Status')
    .valueAutocompleter(createEnumAutocompleter([
      { value: 'ACTIVE', label: 'Active' },
      { value: 'COMPLETED', label: 'Completed' },
      { value: 'SUSPENDED', label: 'Suspended' },
      { value: 'TERMINATED', label: 'Terminated' },
    ]))
    .done()
    
  // Time
  .field('startDate', 'Start Date')
    .type('date')
    .group('Time')
    .valueAutocompleter(createDateAutocompleter())
    .done()
  .field('endDate', 'End Date')
    .type('date')
    .group('Time')
    .valueAutocompleter(createDateAutocompleter())
    .done()
    
  // Configuration
  .maxExpressions(10)
  .build()

export default processSchema
```

## Next Steps

- [Custom Autocompleters Guide](./custom-autocompleters.md)
- [Theming Guide](./theming.md)
- [Validation Guide](./validation.md)
