# Data Flow Architecture

This document describes how data flows through the React Sequential Filter Box component system.

## Overview

The FilterBox uses a unidirectional data flow pattern with a state machine at its core.

```
┌──────────────────────────────────────────────────────────────┐
│                          FilterBox                            │
│  ┌────────────────────────────────────────────────────────┐  │
│  │                    useFilterState                       │  │
│  │  ┌──────────────────────────────────────────────────┐  │  │
│  │  │              FilterStateMachine                   │  │  │
│  │  │                                                    │  │  │
│  │  │  ┌─────┐    ┌──────────┐    ┌─────────┐          │  │  │
│  │  │  │IDLE │───▶│FIELD_SEL │───▶│OP_SELECT│──┐       │  │  │
│  │  │  └─────┘    └──────────┘    └─────────┘  │       │  │  │
│  │  │      ▲                                   ▼       │  │  │
│  │  │      │      ┌──────────┐    ┌─────────┐          │  │  │
│  │  │      └──────│CONNECTOR │◀───│VALUE_IN │◀─┘       │  │  │
│  │  │             └──────────┘    └─────────┘          │  │  │
│  │  └──────────────────────────────────────────────────┘  │  │
│  │                         │                               │  │
│  │                         ▼                               │  │
│  │  ┌──────────────────────────────────────────────────┐  │  │
│  │  │               Derived State                       │  │  │
│  │  │  • tokens: TokenData[]                            │  │  │
│  │  │  • suggestions: AutocompleteItem[]                │  │  │
│  │  │  • placeholder: string                            │  │  │
│  │  │  • announcement: string                           │  │  │
│  │  └──────────────────────────────────────────────────┘  │  │
│  └────────────────────────────────────────────────────────┘  │
│                              │                                │
│              ┌───────────────┼───────────────┐               │
│              ▼               ▼               ▼               │
│     ┌──────────────┐ ┌──────────────┐ ┌──────────────┐      │
│     │TokenContainer│ │AutoDropdown  │ │  LiveRegion  │      │
│     └──────────────┘ └──────────────┘ └──────────────┘      │
└──────────────────────────────────────────────────────────────┘
                              │
                              ▼
                    ┌──────────────────┐
                    │   Parent (App)   │
                    │ onChange(exprs)  │
                    └──────────────────┘
```

## Core Concepts

### 1. Controlled Component Pattern

FilterBox is a fully controlled component:

```tsx
const [expressions, setExpressions] = useState<FilterExpression[]>([])

<FilterBox
  schema={schema}
  value={expressions}        // Controlled value
  onChange={setExpressions}  // Update handler
/>
```

### 2. State Machine (FilterStateMachine)

The core state machine enforces valid state transitions:

| State | Description | Valid Transitions |
|-------|-------------|-------------------|
| `IDLE` | No active input | → `FIELD_SELECT` (on focus/type) |
| `FIELD_SELECT` | Selecting a field | → `OPERATOR_SELECT` (on select) |
| `OPERATOR_SELECT` | Selecting an operator | → `VALUE_INPUT` (on select) |
| `VALUE_INPUT` | Entering/selecting value | → `CONNECTOR_SELECT` (on confirm) |
| `CONNECTOR_SELECT` | Adding AND/OR | → `FIELD_SELECT` (on select), → `IDLE` (on blur) |

### 3. Token Generation

Expressions are converted to tokens for display:

```typescript
FilterExpression[] → TokenData[]

// Example:
[{ 
  condition: { field: 'status', operator: 'eq', value: 'active' },
  connector: 'AND'
}]

// Becomes:
[
  { type: 'field', value: 'status', position: 0 },
  { type: 'operator', value: '=', position: 1 },
  { type: 'value', value: 'active', position: 2 },
  { type: 'connector', value: 'AND', position: 3 }
]
```

### 4. Suggestion Generation

Suggestions are generated based on current state and schema:

```typescript
function getSuggestions(
  state: FilterStep,
  schema: FilterSchema,
  inputValue: string,
  currentField?: FieldDefinition
): AutocompleteItem[]
```

## Event Handling Flow

### User Types in Input

```
1. User types "sta"
   │
2. handleInputChange("sta")
   │
3. Update internal inputValue state
   │
4. Re-filter suggestions based on input
   │  • Field suggestions filtered by "sta"
   │  • "status" field matches
   │
5. Update suggestions state
   │
6. AutocompleteDropdown re-renders
```

### User Selects Suggestion

```
1. User clicks/enters on "status" field
   │
2. handleSelect(item)
   │
3. State machine transition: FIELD_SELECT → OPERATOR_SELECT
   │
4. Add pending token for field
   │
5. Generate operator suggestions for "status" field
   │
6. Announce "status selected, choose operator"
   │
7. Components re-render with new state
```

### User Completes Expression

```
1. User confirms value "active"
   │
2. handleConfirmValue()
   │
3. Create new FilterExpression
   │
4. Call onChange([...expressions, newExpression])
   │
5. Parent updates state
   │
6. FilterBox receives new value prop
   │
7. State machine → CONNECTOR_SELECT or IDLE
```

## Data Structures

### FilterExpression

```typescript
interface FilterExpression {
  condition: {
    field: string
    operator: string
    value: ConditionValue  // string | number | boolean | Date | [Date, Date]
  }
  connector?: 'AND' | 'OR'
}
```

### TokenData

```typescript
interface TokenData {
  id: string
  type: 'field' | 'operator' | 'value' | 'connector'
  value: FieldValue | OperatorValue | ConditionValue | 'AND' | 'OR'
  displayValue?: string
  position: number
  expressionIndex: number
  isPending: boolean
  error?: string
}
```

### AutocompleteItem

```typescript
interface AutocompleteItem {
  id: string
  label: string
  value: unknown
  description?: string
  group?: string
  disabled?: boolean
  icon?: ReactNode
  // For custom widgets
  customWidget?: {
    type: 'datePicker' | 'dateRange' | 'numberInput' | 'custom'
    options?: Record<string, unknown>
    render?: (props: CustomWidgetProps) => ReactNode
  }
}
```

## Memoization Strategy

To optimize rendering performance:

```typescript
// Memoize token conversion
const tokens = useMemo(
  () => expressionsToTokens(expressions),
  [expressions]
)

// Memoize suggestions filtering
const filteredSuggestions = useMemo(
  () => filterSuggestions(suggestions, inputValue),
  [suggestions, inputValue]
)

// Memoize event handlers
const handleSelect = useCallback(
  (item: AutocompleteItem) => { ... },
  [/* dependencies */]
)
```

## Validation Flow

```
1. Expressions change (value prop update)
   │
2. useMemo: validateExpressions(expressions, schema)
   │
3. If errors exist:
   │  • Update tokens with error property
   │  • Set validation error announcement
   │  • Call onError callback
   │
4. Components render with error states
```

## Async Autocomplete Flow

```
1. User types "pro"
   │
2. Debounce (300ms default)
   │
3. AsyncAutocompleter.getSuggestions("pro")
   │
4. Show loading state / stale data
   │
5. Fetch completes
   │
6. Cache results
   │
7. Update suggestions
   │
8. Cancel if new input arrives
```

## Integration Points

### External Store Integration

```typescript
// With Zustand
const expressions = useFilterStore(state => state.filters)
const setExpressions = useFilterStore(state => state.setFilters)

<FilterBox
  schema={schema}
  value={expressions}
  onChange={setExpressions}
/>
```

### URL Synchronization

```typescript
// Serialize to URL
useEffect(() => {
  const query = serializeToQueryString(expressions)
  router.push(`/search?${query}`)
}, [expressions])

// Deserialize from URL
const initialExpressions = deserializeFromQueryString(searchParams)
```
