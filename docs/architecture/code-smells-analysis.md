# Code Smells & Anti-Patterns Analysis

This document identifies code smells and anti-patterns in the filter expression builder's state management (Phase 1.2 of state machine review).

---

## Overview

The filter expression builder exhibits several architectural issues stemming from its dual state management system and the evolution of requirements over time.

---

## 1. Dual State Management Anti-Pattern

### The Issue

Two parallel state management systems exist:

1. **`FilterStateMachine`** class - Pure state machine for expression building
2. **`filterReducer` + React state** - Reducer pattern with UI concerns

### Manifestation

```typescript
// In useFilterState.ts - typical pattern
const handleSelectField = (field: FieldValue) => {
  // Update state machine
  machine.transition({ type: 'SELECT_FIELD', payload: field })

  // Update React state
  setState(machine.getState()) // Read from machine

  // Update reducer state
  dispatch({ type: 'SELECT_FIELD', payload: field })

  // Now we have updated THREE pieces of state separately
}
```

### Problems

1. **Synchronization Risk:** Any inconsistency between `machine.getState()`, `state` (React), and `dispatch` state creates bugs
2. **Triple Writes:** Same logical change requires 3 separate updates
3. **Confusion:** Developers must understand both systems and their interaction
4. **Testing Complexity:** Must test both systems independently and together

### Evidence in Code

- `useFilterState.ts` lines 200-500: Most action handlers update both systems
- `editing-token` state exists ONLY in reducer, not in machine
- `stepBeforeEditRef` used to restore machine state after editing (workaround for desync)

### Recommendation

**Choose one system** (see Phase 4 of TODO-state-machine-review.md for options).

---

## 2. Large Monolithic Hook

### The Issue

`useFilterState.ts` is **1767 lines** with **20+ callbacks** and complex interdependencies.

### Metrics

```
File: src/hooks/useFilterState.ts
Lines: 1767
Functions/Callbacks: 24
State Variables: 12+
Refs: 8
Effects: 6
Cognitive Complexity: Very High
```

### Specific Callbacks

1. `handleFocus`
2. `handleBlur`
3. `handleInputChange`
4. `handleKeyDown`
5. `handleSuggestionSelect`
6. `handleFieldSelect`
7. `handleOperatorSelect`
8. `handleValueConfirm`
9. `handleConnectorSelect`
10. `handleComplete`
11. `handleTokenClick`
12. `handleTokenDoubleClick`
13. `handleTokenDelete`
14. `handleStartEdit`
15. `handleCompleteEdit`
16. `handleCancelEdit`
17. `handleStartOperatorEdit`
18. `handleCompleteOperatorEdit`
19. `handleCancelOperatorEdit`
20. `handleSelectAllTokens`
21. `handleCopy`
22. `handlePaste`
23. `handleUndo`
24. `handleRedo`

### Problems

1. **High Cognitive Load:** Impossible to understand entire hook at once
2. **Testing Difficulty:** Hard to test individual behaviors in isolation
3. **Maintenance Burden:** Changes risk breaking unrelated functionality
4. **Performance:** Too many callbacks and effects can cause re-render issues
5. **Onboarding:** New developers overwhelmed by file size

### Evidence

- Opening `useFilterState.ts` requires significant scrolling
- Individual tests often need to set up extensive mock context
- Bug fixes frequently touch multiple callbacks

### Recommendation

**Break into smaller, focused hooks:**

- `useExpressionBuilder` - Core expression building logic
- `useTokenEditing` - Token editing logic
- `useTokenSelection` - Selection and navigation
- `useClipboard` - Copy/paste functionality
- `useUndoRedo` - History management

---

## 3. Ref-Based Workarounds

### The Issue

Multiple `useRef` hooks used to work around state management limitations.

### Examples

#### 3.1 `stepBeforeEditRef`

```typescript
// Before editing, save current step
stepBeforeEditRef.current = machine.getState()

// Enter editing (bypasses machine)
dispatch({ type: 'START_TOKEN_EDIT', payload: index })

// Cancel editing - need to restore
// But machine state is now stale!
```

**Problem:** Using ref to maintain consistency indicates missing state machine transitions.

#### 3.2 `justSelectedTokenRef`

```typescript
const justSelectedTokenRef = useRef(false)

const handleTokenClick = () => {
  justSelectedTokenRef.current = true
  // ...
}

const handleFocus = () => {
  if (justSelectedTokenRef.current) {
    // Don't clear selection
    justSelectedTokenRef.current = false
    return
  }
  // Clear selection
}
```

**Problem:** Synchronization between click and focus handlers via ref is brittle and timing-dependent.

#### 3.3 `isUndoRedoOperation`

```typescript
const isUndoRedoOperation = useRef(false)

const handleUndo = () => {
  isUndoRedoOperation.current = true
  // ... restore state
  // Prevent this change from being added to history
}

useEffect(() => {
  if (isUndoRedoOperation.current) {
    isUndoRedoOperation.current = false
    return // Skip adding to history
  }
  // Add to history
}, [expressions])
```

**Problem:** Side-channel communication between action handlers and effects.

### Problems

1. **Timing Bugs:** Refs bypass React's state update batching
2. **Race Conditions:** Order of execution matters
3. **Hidden Dependencies:** Effects depend on refs not tracked in dep arrays
4. **Hard to Debug:** Refs don't show up in React DevTools
5. **Testing Challenges:** Refs require special handling in tests

### Recommendation

**Replace refs with explicit state machine states:**

- Add `EDIT_START`, `EDIT_COMPLETE`, `EDIT_CANCEL` as first-class transitions
- Track editing context in state machine
- Eliminate timing-dependent workarounds

---

## 4. Duplicated Logic

### The Issue

Same logic appears in multiple places.

### Examples

#### 4.1 `expressionsToTokens` Function

```typescript
// Appears in BOTH files:
// src/hooks/useFilterState.ts (lines ~150)
// src/hooks/filterReducer.ts (lines ~350)
```

**Problem:** Changes must be made in two places, risk of divergence.

#### 4.2 `getSuggestions` Logic

Suggestion generation logic is duplicated between:

- Main input handler
- Editing handlers
- Operator editing handlers

**Problem:** Each has slightly different variation, hard to maintain consistency.

#### 4.3 Placeholder Text Logic

```typescript
// Appears in multiple render conditions
const placeholder =
  step === 'selecting-field' ? 'Select field...' :
  step === 'selecting-operator' ? 'Select operator...' :
  step === 'entering-value' ? 'Enter value...' :
  // ... repeated in multiple components
```

**Problem:** Should be centralized in one place.

### Recommendation

**Extract to shared utilities:**

- `tokenUtils.ts` for token conversion
- `suggestionUtils.ts` for suggestion generation
- `placeholderUtils.ts` for UI text

---

## 5. Implicit State Contracts

### The Issue

State validity depends on implicit relationships not enforced by types.

### Examples

#### 5.1 Field/Operator/Value Relationship

```typescript
// Implicit contract: if currentOperator is set, currentField MUST be set
// But TypeScript doesn't enforce this

interface FilterState {
  currentField?: FieldValue // Can be undefined
  currentOperator?: OperatorValue // Can be undefined
  // But having operator without field is invalid!
}
```

**Problem:** Type system allows invalid states.

#### 5.2 Editing Index vs Editing State

```typescript
// Implicit contract: if editingTokenIndex >= 0, step should be 'editing-token'
// But nothing enforces this

if (editingTokenIndex >= 0) {
  // Assume step === 'editing-token'
  // But type system doesn't guarantee it
}
```

**Problem:** Bugs if assumptions violated.

### Recommendation

**Use discriminated unions:**

```typescript
type FilterState =
  | { step: 'idle' /* no field/operator */ }
  | { step: 'selecting-field' /* no field yet */ }
  | { step: 'selecting-operator'; currentField: FieldValue }
  | { step: 'entering-value'; currentField: FieldValue; currentOperator: OperatorValue }
  | { step: 'editing-token'; editingTokenIndex: number /* etc */ }
```

This makes invalid states unrepresentable.

---

## 6. Silent Failure Pattern

### The Issue

Invalid transitions are silently ignored instead of being caught.

### Example

```typescript
// In StateMachine.ts
private handleSelectField(field: FieldValue): void {
  if (this.state === 'selecting-field') {
    // Only valid from this state
    this.context.currentField = field
    this.state = 'selecting-operator'
  }
  // If not in correct state, silently do nothing
  // No error, no warning, no log
}
```

### Problems

1. **Bugs Hidden:** Invalid calls succeed silently
2. **Hard to Debug:** No indication of what went wrong
3. **Development Friction:** Developers waste time tracking down silent failures

### Recommendation

**Add development-mode validation:**

```typescript
private handleSelectField(field: FieldValue): void {
  if (this.state !== 'selecting-field') {
    if (process.env.NODE_ENV === 'development') {
      console.error(
        `Invalid transition: SELECT_FIELD called from state '${this.state}'. ` +
        `Expected 'selecting-field'.`
      )
    }
    return
  }
  // ... proceed
}
```

---

## 7. Incomplete Abstraction

### The Issue

`editing-token` state defined in state machine but not implemented.

### Example

```typescript
// In StateMachine.ts
export type FilterStep =
  | 'idle'
  | 'selecting-field'
  | 'selecting-operator'
  | 'entering-value'
  | 'selecting-connector'
  | 'editing-token' // <-- Defined but...

// No transition logic for 'editing-token'!
// All handled in React instead
```

### Problems

1. **Leaky Abstraction:** State machine claims to handle all states but doesn't
2. **Confusion:** Developers expect machine to manage this state
3. **Type System Lies:** `FilterStep` includes state machine doesn't handle

### Recommendation

**Either:**

- **Option A:** Implement editing-token transitions in machine
- **Option B:** Remove from `FilterStep`, make it React-only

---

## 8. God Object Pattern

### The Issue

`useFilterState` hook knows about and controls everything.

### Responsibilities

1. State machine management
2. Reducer management
3. Autocomplete logic
4. Token rendering
5. Keyboard handling
6. Mouse handling
7. Clipboard operations
8. Undo/redo
9. Accessibility announcements
10. Custom widget integration
11. Validation
12. Serialization
13. Focus management
14. Dropdown positioning

**Problem:** Single responsibility principle violated ~14x.

### Recommendation

**Separate concerns:**

- `useFilterState` - Core state orchestration only
- `useAutocomplete` - Suggestion logic
- `useKeyboardNavigation` - Keyboard handling
- `useClipboard` - Copy/paste
- `useUndoRedo` - History
- etc.

---

## Summary of Anti-Patterns

| Anti-Pattern             | Severity  | Impact | Effort to Fix |
| ------------------------ | --------- | ------ | ------------- |
| Dual State Management    | 🔴 High   | High   | High          |
| Large Monolithic Hook    | 🔴 High   | High   | Medium        |
| Ref-Based Workarounds    | 🟡 Medium | Medium | Low           |
| Duplicated Logic         | 🟡 Medium | Low    | Low           |
| Implicit State Contracts | 🟡 Medium | Medium | Medium        |
| Silent Failure           | 🟢 Low    | Low    | Low           |
| Incomplete Abstraction   | 🟡 Medium | Medium | Low           |
| God Object               | 🔴 High   | High   | High          |

---

## Prioritized Recommendations

### Phase 1 (Quick Wins)

1. ✅ Add development-mode warnings for invalid transitions
2. ✅ Extract duplicated utility functions
3. ✅ Document the dual state management explicitly

### Phase 2 (Medium Effort)

4. Break up `useFilterState` into smaller hooks
5. Replace refs with explicit state
6. Use discriminated unions for type safety

### Phase 3 (Major Refactoring)

7. Choose one state management approach (machine vs reducer)
8. Implement chosen approach
9. Migrate all code
10. Validate with comprehensive tests

---

## Related Documentation

- [TODO-state-machine-review.md](../../TODO-state-machine-review.md) - Full refactoring plan
- [state-machine-diagram.md](state-machine-diagram.md) - State machine documentation
- [filter-reducer-state.md](filter-reducer-state.md) - Reducer documentation
- [state-shape.md](state-shape.md) - State shape overview
