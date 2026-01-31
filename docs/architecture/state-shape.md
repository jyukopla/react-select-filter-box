# Internal State Shape

This document describes the internal state architecture of the React Sequential Filter Box.

## Overview

The FilterBox manages several layers of state:

1. **External State** (Controlled) - `FilterExpression[]` passed via props
2. **State Machine State** - Current step in the filter building process
3. **UI State** - Dropdown, input, selection, and editing states
4. **Derived State** - Computed values like tokens and suggestions

## State Layers

### 1. External State (Controlled)

```typescript
interface FilterExpression {
  condition: {
    field: string        // Field identifier (e.g., "status", "createdAt")
    operator: string     // Operator identifier (e.g., "eq", "contains")
    value: ConditionValue
  }
  connector?: 'AND' | 'OR'
}

type ConditionValue = 
  | string 
  | number 
  | boolean 
  | Date 
  | [Date, Date]  // For range operators
  | string[]      // For "in" operators
```

### 2. State Machine State

```typescript
type FilterStep =
  | 'IDLE'              // No active input, waiting for interaction
  | 'FIELD_SELECT'      // User is selecting a field
  | 'OPERATOR_SELECT'   // User is selecting an operator for chosen field
  | 'VALUE_INPUT'       // User is entering/selecting a value
  | 'CONNECTOR_SELECT'  // Expression complete, choosing AND/OR or done

interface StateMachineContext {
  currentField: FieldDefinition | null
  currentOperator: OperatorDefinition | null
  pendingValue: ConditionValue | null
  inputValue: string
}
```

### 3. UI State

```typescript
interface UIState {
  // Dropdown state
  isDropdownOpen: boolean
  highlightedIndex: number
  
  // Input state
  inputValue: string
  isFocused: boolean
  
  // Token selection/editing
  selectedTokenIndex: number      // -1 if none selected
  editingTokenIndex: number       // -1 if not editing
  editingOperatorIndex: number    // -1 if not editing operator
  allTokensSelected: boolean      // true when Ctrl+A pressed
  
  // Announcements
  announcement: string            // For screen readers
}
```

### 4. Derived State

```typescript
interface DerivedState {
  // Token representation of expressions
  tokens: TokenData[]
  
  // Pending tokens (incomplete expression)
  pendingTokens: TokenData[]
  
  // Combined tokens for display
  allTokens: TokenData[]  // [...tokens, ...pendingTokens]
  
  // Current suggestions based on state
  suggestions: AutocompleteItem[]
  
  // Dynamic placeholder
  placeholder: string
  
  // Validation state
  validationResult: {
    valid: boolean
    errors: ValidationError[]
  }
}
```

## Complete State Shape

```typescript
interface FilterBoxInternalState {
  // === State Machine ===
  step: FilterStep
  context: StateMachineContext
  
  // === UI State ===
  ui: {
    isDropdownOpen: boolean
    highlightedIndex: number
    inputValue: string
    isFocused: boolean
    selectedTokenIndex: number
    editingTokenIndex: number
    editingOperatorIndex: number
    allTokensSelected: boolean
    announcement: string
  }
  
  // === Derived (computed on render) ===
  derived: {
    tokens: TokenData[]
    pendingTokens: TokenData[]
    suggestions: AutocompleteItem[]
    placeholder: string
    validationResult: ValidationResult
  }
}
```

## State Transitions

### State Machine Transitions

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│  IDLE ─────────────────────────────────────────────────────────▶│
│   │                                                             │
│   │ focus() or startTyping()                                   │
│   ▼                                                             │
│  FIELD_SELECT ─────────────────────────────────────────────────▶│
│   │                                                             │
│   │ selectField(field)                                         │
│   ▼                                                             │
│  OPERATOR_SELECT ──────────────────────────────────────────────▶│
│   │                                                             │
│   │ selectOperator(operator)                                   │
│   ▼                                                             │
│  VALUE_INPUT ──────────────────────────────────────────────────▶│
│   │                                                             │
│   │ confirmValue(value)                                        │
│   ▼                                                             │
│  CONNECTOR_SELECT ─────────────────────────────────────────────▶│
│   │         │                                                   │
│   │         │ selectConnector(AND/OR)                          │
│   │         └──────────────────────────────────────────────────▶│
│   │                          │                                  │
│   │ blur() / escape()       ▼                                  │
│   └──────────────────▶  FIELD_SELECT (new expression)          │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### UI State Transitions

| Current State | Action | Next State |
|--------------|--------|------------|
| Dropdown closed | Focus input | Dropdown open |
| Dropdown open | Select item | Dropdown may stay open |
| Dropdown open | Escape/blur | Dropdown closed |
| No token selected | Arrow left | Last token selected |
| Token selected | Arrow left/right | Adjacent token selected |
| Token selected | Backspace | Delete token (if last) |
| Token selected | Enter | Edit token (if value) |
| Editing token | Escape | Cancel edit |
| Editing token | Enter | Confirm edit |

## State Hook Implementation

The `useFilterState` hook encapsulates all state logic:

```typescript
function useFilterState(props: UseFilterStateProps): UseFilterStateReturn {
  // State machine instance
  const [machine] = useState(() => new FilterStateMachine())
  
  // UI state
  const [isDropdownOpen, setDropdownOpen] = useState(false)
  const [highlightedIndex, setHighlightedIndex] = useState(0)
  const [inputValue, setInputValue] = useState('')
  const [selectedTokenIndex, setSelectedTokenIndex] = useState(-1)
  const [editingTokenIndex, setEditingTokenIndex] = useState(-1)
  const [allTokensSelected, setAllTokensSelected] = useState(false)
  const [announcement, setAnnouncement] = useState('')
  
  // Derived state (memoized)
  const tokens = useMemo(
    () => expressionsToTokens(props.value),
    [props.value]
  )
  
  const pendingTokens = useMemo(
    () => getPendingTokens(machine.getContext()),
    [machine.getState(), machine.getContext()]
  )
  
  const suggestions = useMemo(
    () => getSuggestions(machine.getState(), props.schema, inputValue),
    [machine.getState(), props.schema, inputValue]
  )
  
  const placeholder = useMemo(
    () => getPlaceholder(machine.getState()),
    [machine.getState()]
  )
  
  // Event handlers...
  return { /* all state and handlers */ }
}
```

## Token State

Each token carries its own state:

```typescript
interface TokenData {
  // Identity
  id: string
  position: number
  expressionIndex: number
  
  // Type and value
  type: 'field' | 'operator' | 'value' | 'connector'
  value: unknown
  displayValue?: string  // Human-readable display
  
  // State flags
  isPending: boolean     // Part of incomplete expression
  isEditing?: boolean    // Currently being edited
  isSelected?: boolean   // Keyboard selected
  
  // Validation
  error?: string         // Validation error message
  
  // Metadata
  fieldType?: string     // For value tokens
  fieldId?: string       // Associated field
}
```

## Selection State Machine

Token selection follows its own mini state machine:

```
┌───────────────────────────────────────────────────────┐
│                  NO_SELECTION                         │
│                       │                               │
│                       │ ArrowLeft (from input)        │
│                       ▼                               │
│              SINGLE_SELECTION                         │
│                  │         │                          │
│    Ctrl+A        │         │ Arrow keys               │
│      │           │         │                          │
│      ▼           │         ▼                          │
│  ALL_SELECTED    │    SINGLE_SELECTION                │
│      │           │    (different token)               │
│      │           │                                    │
│      │ Backspace │ Backspace (if last)               │
│      │           │                                    │
│      ▼           ▼                                    │
│  DELETE_ALL   DELETE_TOKEN                            │
│      │           │                                    │
│      └───────────┴────────────────────────────────────│
│                       │                               │
│                       ▼                               │
│              NO_SELECTION                             │
└───────────────────────────────────────────────────────┘
```

## Persistence & Serialization

The external state (`FilterExpression[]`) can be serialized:

```typescript
// To JSON
const json = serialize(expressions)

// To URL query string  
const query = serializeToQueryString(expressions)

// From JSON
const expressions = deserialize(json)

// From URL
const expressions = deserializeFromQueryString(queryString)
```

## Performance Considerations

1. **Memoization**: All derived state is memoized with `useMemo`
2. **Callback stability**: Event handlers wrapped with `useCallback`
3. **Shallow comparison**: Token arrays use immutable updates
4. **Virtual scrolling**: Large suggestion lists use windowing
