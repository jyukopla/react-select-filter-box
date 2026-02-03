# Keyboard-Based Token Editing

Starting with version 0.0.0, you can edit field, operator, and connector tokens using keyboard navigation.

## Overview

When a token is selected via keyboard (using Left/Right arrow keys), you can press the Down or Up arrow key to open a dropdown for editing:

- **Field tokens**: Opens field selection dropdown
- **Operator tokens**: Opens operator selection dropdown
- **Connector tokens**: Opens connector selection dropdown (AND/OR)
- **Value tokens with custom widgets**: Opens the custom widget (e.g., date picker)

## Usage Flow

### Editing a Field

1. Build an expression (e.g., `Status = Active`)
2. Press **Left Arrow** three times to select the field token (`Status`)
3. Press **Down Arrow** or **Up Arrow** to open the field dropdown
4. Use arrow keys to navigate the dropdown
5. Press **Enter** to select a new field
6. Press **Escape** to cancel without changing

### Editing an Operator

1. Build an expression (e.g., `Status = Active`)
2. Press **Left Arrow** to select tokens (move backward)
3. Select the operator token (the `=` symbol)
4. Press **Down Arrow** or **Up Arrow** to open the operator dropdown
5. Use arrow keys to navigate the dropdown
6. Press **Enter** to select a new operator
7. Press **Escape** to cancel without changing

### Example Workflow

```
Initial state: Status = Active
                     ↑
             [Type value, press Enter]

Press Left Arrow:  Status = Active
                           ↑
                   [Cursor moves to value token]

Press Left Arrow:  Status = Active
                        ↑
                [Operator token selected]

Press Down Arrow:  Status = Active
                        ↓
                [Dropdown opens with operators]
                - equals (=)
                - not equals (!=)
                - contains
                - ...

Press Down, Enter: Status contains Active
                        ↑
                [Operator changed!]
```

## Benefits

- **Keyboard-only workflow**: No need to switch to mouse
- **Consistent interaction**: Same pattern for operators, connectors, and custom widgets
- **Efficient editing**: Change operators without deleting the entire expression
- **Accessible**: Works with screen readers and follows ARIA combobox pattern

## Comparison with Mouse

| Action        | Mouse                 | Keyboard                    |
| ------------- | --------------------- | --------------------------- |
| Select token  | Single-click          | Left/Right Arrow            |
| Edit field    | Single-click field    | Down/Up Arrow when selected |
| Edit operator | Single-click operator | Down/Up Arrow when selected |
| Edit value    | Double-click value    | Enter when selected         |
| Delete token  | Click + Backspace     | Backspace when selected     |

## Implementation Notes

The feature checks for:

- Token is selected (`selectedTokenIndex >= 0`)
- Dropdown is not already open
- Token is not pending (part of completed expression)
- Token belongs to valid expression (`expressionIndex >= 0`)

For value tokens, the dropdown only opens if the operator has a custom widget (like date picker). Regular text values use inline editing (Enter key).

### What Happens When You Change a Field

When you select a new field for an expression:

1. The field is updated
2. The operator is automatically set to the first operator for the new field
3. The value is preserved (if compatible)

This ensures the expression remains valid after field changes.
