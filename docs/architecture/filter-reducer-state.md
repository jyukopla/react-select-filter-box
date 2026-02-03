# Filter Reducer State Documentation

This document provides detailed documentation of the `filterReducer` state management system as part of Phase 1 of the state machine review.

---

## State Shape

The `filterReducer` maintains the following state (defined in `FilterState` interface):

### Core Expression Building State

- **`step`**: `FilterStep` - Current step in filter building process
  - Possible values: `'idle'`, `'selecting-field'`, `'selecting-operator'`, `'entering-value'`, `'selecting-connector'`, `'editing-token'`
  - Managed by: Both `FilterStateMachine` and React reducer (dual management)

- **`currentField`**: `FieldValue | undefined` - Field being built for current expression
  - Set when: User selects a field
  - Cleared when: Expression completes or blur occurs

- **`currentOperator`**: `OperatorValue | undefined` - Operator being built for current expression
  - Set when: User selects an operator
  - Cleared when: Expression completes or blur occurs

### UI State (Managed Only by Reducer)

- **`isDropdownOpen`**: `boolean` - Whether autocomplete dropdown is visible
  - Modified by: `FOCUS`, `BLUR`, `OPEN_DROPDOWN`, `CLOSE_DROPDOWN` actions
  - Not managed by `FilterStateMachine`

- **`inputValue`**: `string` - Current value in text input field
  - Modified by: `INPUT_CHANGE` action
  - Reset on: Field/operator/connector selection, blur

- **`highlightedIndex`**: `number` - Index of currently highlighted suggestion (0-based)
  - Modified by: Arrow key navigation, `HIGHLIGHT_SUGGESTION` action
  - Reset to 0 on: Input change, field/operator selection

### Token Editing State

- **`editingTokenIndex`**: `number` - Index of value token being edited (-1 if none)
  - Set by: Double-clicking a value token
  - Managed by: React state only (not in `FilterStateMachine`)

- **`editingOperatorIndex`**: `number` - Index of operator being edited (-1 if none)
  - Set by: Double-clicking an operator token
  - Managed by: React state only

### Selection State (Keyboard Navigation)

- **`selectedTokenIndex`**: `number` - Index of currently selected token for deletion (-1 if none)
  - Set by: Single-clicking a token, arrow key navigation
  - Cleared by: Input change, deselect actions

- **`allTokensSelected`**: `boolean` - Whether all tokens are selected (Ctrl+A)
  - Set by: Ctrl+A keyboard shortcut
  - Cleared by: Any input or deselect action

### Accessibility State

- **`announcement`**: `string` - Text for screen reader announcements
  - Updated on: State changes requiring user feedback
  - Used by: `LiveRegion` component

---

## Action Types (24 Total)

### Expression Building Actions (Core State Machine Actions)

These actions are shared with `FilterStateMachine`:

1. **`FOCUS`** - Transition from idle to selecting-field
   - Modifies: `step`, `isDropdownOpen`
   - State machine equivalent: `FOCUS`

2. **`BLUR`** - Return to idle, discard partial work
   - Modifies: `step`, `isDropdownOpen`, `inputValue`, `currentField`, `currentOperator`, `editingOperatorIndex`
   - State machine equivalent: `BLUR`

3. **`SELECT_FIELD`** - Select a field
   - Modifies: `step` → `'selecting-operator'`, `currentField`, `inputValue`, `highlightedIndex`, `announcement`
   - State machine equivalent: `SELECT_FIELD`

4. **`SELECT_OPERATOR`** - Select an operator
   - Modifies: `step` → `'entering-value'`, `currentOperator`, `inputValue`, `highlightedIndex`, `announcement`
   - State machine equivalent: `SELECT_OPERATOR`

5. **`CONFIRM_VALUE`** - Confirm value and complete expression
   - Modifies: `step` → `'selecting-connector'`, `inputValue`, `currentField` (cleared), `currentOperator` (cleared), `announcement`
   - Note: Actual expression addition happens in parent hook
   - State machine equivalent: `CONFIRM_VALUE`

6. **`SELECT_CONNECTOR`** - Select AND/OR connector
   - Modifies: `step` → `'selecting-field'`, `inputValue`, `announcement`
   - State machine equivalent: `SELECT_CONNECTOR`

7. **`COMPLETE`** - Finish expression building
   - Modifies: `step` → `'idle'`, `isDropdownOpen`, `announcement`
   - State machine equivalent: `COMPLETE`

8. **`DELETE_LAST_STEP`** - Delete last token/step (Backspace)
   - Modifies: `step` (reverses transition), context fields
   - Complex logic depending on current step
   - State machine equivalent: `DELETE_LAST`

9. **`CLEAR_ALL`** - Clear all tokens and reset
   - Modifies: Resets to `initialFilterState` except keeps focus state
   - State machine equivalent: `CLEAR`

10. **`RESET`** - Full reset including blur
    - Modifies: Complete reset to `initialFilterState`
    - State machine equivalent: `RESET`

### UI-Only Actions (Not in State Machine)

These actions manage UI state not tracked by `FilterStateMachine`:

11. **`INPUT_CHANGE`** - User types in input field
    - Modifies: `inputValue`, `selectedTokenIndex`, `allTokensSelected`, `highlightedIndex`

12. **`HIGHLIGHT_SUGGESTION`** - Change highlighted suggestion (arrow keys)
    - Modifies: `highlightedIndex`

13. **`OPEN_DROPDOWN`** - Explicitly open dropdown
    - Modifies: `isDropdownOpen`

14. **`CLOSE_DROPDOWN`** - Explicitly close dropdown
    - Modifies: `isDropdownOpen`

### Token Editing Actions (Not in State Machine)

These manage the editing states mentioned in the state machine review:

15. **`START_TOKEN_EDIT`** - Begin editing a value token
    - Modifies: `editingTokenIndex`, `step` → `'editing-token'`, `inputValue`, `announcement`
    - This is where `step` becomes `'editing-token'` without using state machine

16. **`COMPLETE_TOKEN_EDIT`** - Finish editing a value token
    - Modifies: `editingTokenIndex` → -1, `step` → `'idle'` or `'selecting-connector'`, `inputValue`, `announcement`

17. **`CANCEL_TOKEN_EDIT`** - Cancel editing a value token (Escape)
    - Modifies: `editingTokenIndex` → -1, `step`, `inputValue`, `announcement`

18. **`START_OPERATOR_EDIT`** - Begin editing an operator token
    - Modifies: `editingOperatorIndex`, `isDropdownOpen`, `inputValue`

19. **`CANCEL_OPERATOR_EDIT`** - Cancel editing an operator
    - Modifies: `editingOperatorIndex` → -1, `isDropdownOpen`

### Selection/Navigation Actions (Not in State Machine)

20. **`SELECT_TOKEN`** - Select a token for deletion
    - Modifies: `selectedTokenIndex`, `allTokensSelected`, `inputValue`

21. **`SELECT_ALL_TOKENS`** - Select all tokens (Ctrl+A)
    - Modifies: `allTokensSelected`, `selectedTokenIndex`, `inputValue`

22. **`DESELECT_TOKENS`** - Clear token selection
    - Modifies: `selectedTokenIndex` → -1, `allTokensSelected`

23. **`NAVIGATE_LEFT`** - Move selection left (Left arrow)
    - Modifies: `selectedTokenIndex`, `allTokensSelected`

24. **`NAVIGATE_RIGHT`** - Move selection right (Right arrow)
    - Modifies: `selectedTokenIndex`, `allTokensSelected`

25. **`SET_ANNOUNCEMENT`** - Update screen reader announcement
    - Modifies: `announcement`

26. **`DELETE_TOKEN`** - Delete a specific token
    - Modifies: Depends on which token, may affect `step`, context fields

---

## State Synchronization Patterns

### Pattern 1: Machine Drives Core, Reducer Drives UI

The typical flow in `useFilterState`:

```typescript
// User action triggers state machine transition
machine.transition({ type: 'SELECT_FIELD', payload: field })

// React state updated from machine
const newStep = machine.getState()
dispatch({ type: 'SELECT_FIELD', payload: field })

// Result: Both machine and reducer have same step
```

**Issue:** Two separate calls can drift if not careful.

### Pattern 2: Editing State Bypasses Machine

When editing a token:

```typescript
// Editing state set ONLY in React reducer, not in machine
dispatch({ type: 'START_TOKEN_EDIT', payload: tokenIndex })
// This sets step='editing-token' in reducer
// But machine.getState() still returns previous step
```

**Issue:** `machine.getState()` and `state.step` are now out of sync during editing.

### Pattern 3: State Restoration with Refs

When canceling edit:

```typescript
// Before editing, save state to ref
stepBeforeEditRef.current = machine.getState()

// Enter editing mode (bypass machine)
dispatch({ type: 'START_TOKEN_EDIT', payload: index })

// Cancel editing
dispatch({ type: 'CANCEL_TOKEN_EDIT' })
// Need to restore machine state from ref
machine.transition({ type: 'RESET' }) // or similar
```

**Issue:** Relies on refs to maintain consistency, fragile pattern.

---

## Implicit State Relationships

### Field Selection Implies Operator Selection Next

When `currentField` is set:

- `step` MUST be `'selecting-operator'` or later
- If not, state is inconsistent

### Operator Selection Implies Value Entry Next

When `currentOperator` is set:

- `step` MUST be `'entering-value'` or later
- `currentField` MUST also be set
- If not, state is inconsistent

### Editing Index Implies Editing Mode

When `editingTokenIndex >= 0`:

- `step` SHOULD be `'editing-token'`
- `inputValue` should contain the token's current value
- Dropdown should be open

When `editingOperatorIndex >= 0`:

- Dropdown should be open with operator suggestions
- No specific `step` required (this is UI-only state)

### Selected Token Implies No Input

When `selectedTokenIndex >= 0` or `allTokensSelected === true`:

- User can press Delete/Backspace to remove tokens
- `inputValue` should be empty
- Dropdown should be closed

---

## Discrepancies Between Systems

### 1. Action Name Differences

- Reducer: `DELETE_LAST_STEP` vs Machine: `DELETE_LAST`
- Reducer: `CLEAR_ALL` vs Machine: `CLEAR`
- Otherwise names match

### 2. State Representation

- Machine uses `FilterStep` enum for state
- Machine tracks `pendingConnector` (not in reducer)
- Reducer tracks many UI states (dropdown, input, selection) not in machine

### 3. Editing States

- Machine defines `'editing-token'` in `FilterStep` type
- But machine has no transition logic for this state
- All editing logic is in reducer only

### 4. Completion Detection

- Machine has explicit `completedExpressions` array
- Reducer doesn't track expressions (left to parent component)
- This is by design - reducer is stateless regarding actual expressions

---

## Recommendations

### Short Term

1. Add TypeScript type guards to detect inconsistent state
2. Add development-mode assertions to catch desync
3. Document the separation of concerns clearly

### Long Term (Refactoring)

Consider one of these approaches:

**Option A:** Extend machine to own all state

- Add UI states to `FilterStateMachine`
- Make reducer a thin wrapper around machine
- Single source of truth

**Option B:** Remove machine, use reducer only

- Move validation into reducer
- Simpler architecture
- Pure React patterns

**Option C:** Formalize the split

- Machine owns expression building logic
- Reducer owns UI interaction logic
- Clear interface between them
- Better documentation

---

## Related Files

- [src/hooks/filterReducer.ts](../../src/hooks/filterReducer.ts) - Reducer implementation
- [src/hooks/useFilterState.ts](../../src/hooks/useFilterState.ts) - Hook that uses both systems
- [src/core/StateMachine.ts](../../src/core/StateMachine.ts) - State machine implementation
- [docs/architecture/state-machine-diagram.md](../architecture/state-machine-diagram.md) - State machine documentation
