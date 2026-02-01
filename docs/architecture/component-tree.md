# Component Tree Structure

This document describes the component hierarchy of the React Sequential Filter Box.

## Overview

```
FilterBox
├── LiveRegion (announcements)
├── LiveRegion (validation errors - assertive)
├── TokenContainer
│   ├── Token[] (for each filter token)
│   │   ├── Token (field | operator | value | connector)
│   │   └── InlineEdit (when editing)
│   └── TokenInput (auto-sizing input)
├── ClearButton (optional)
└── AutocompleteDropdown (via DropdownPortal)
    ├── VirtualList (when >100 items)
    │   └── AutocompleteItem[]
    └── CustomInputWidget (for specialized inputs)
        ├── DatePickerWidget
        ├── DateRangeWidget
        └── NumberInputWidget
```

## Component Descriptions

### FilterBox (Root Component)

The main entry point that orchestrates all filter functionality.

**Responsibilities:**

- Manages component refs and imperative handle
- Coordinates dropdown positioning
- Handles validation and error announcements
- Provides accessible container with ARIA attributes

**Key Props:**

- `schema: FilterSchema` - Defines available fields and operators
- `value: FilterExpression[]` - Current filter expressions (controlled)
- `onChange: (expressions: FilterExpression[]) => void` - Change handler
- `disabled?: boolean` - Disable all interactions
- `usePortal?: boolean` - Render dropdown in portal (default: true)

### TokenContainer

Displays tokens horizontally and manages the input field.

**Responsibilities:**

- Renders tokens in order
- Positions input at the end (or at editing position)
- Handles horizontal scrolling for overflow
- Manages click-to-focus behavior

**Key Props:**

- `tokens: TokenData[]` - Array of token data
- `inputRef: RefObject<HTMLInputElement>` - Reference to input
- `editingTokenIndex: number` - Currently editing token (-1 if none)
- `onTokenClick: (index: number) => void` - Token click handler

### Token

Individual token chip representing a field, operator, value, or connector.

**Responsibilities:**

- Displays token with type-specific styling
- Handles hover and focus states
- Supports inline editing for value tokens
- Shows error state with tooltip for validation errors

**Key Props:**

- `type: 'field' | 'operator' | 'value' | 'connector'` - Token type
- `value: string` - Display value
- `isEditing?: boolean` - Whether in edit mode
- `isPending?: boolean` - Whether token is pending (incomplete expression)
- `error?: string` - Validation error message

### TokenInput

Auto-sizing input field for entering filter values.

**Responsibilities:**

- Auto-sizes to fit content
- Displays contextual placeholder
- Handles keyboard events for navigation/selection
- Manages focus states

**Key Props:**

- `value: string` - Current input value
- `placeholder: string` - Placeholder text
- `onChange: (value: string) => void` - Input change handler
- `onKeyDown: (e: KeyboardEvent) => void` - Keyboard handler

### AutocompleteDropdown

Dropdown displaying autocomplete suggestions.

**Responsibilities:**

- Renders suggestion list with keyboard navigation
- Supports virtual scrolling for large lists (>100 items)
- Displays grouped suggestions
- Renders custom input widgets when needed

**Key Props:**

- `items: AutocompleteItem[]` - Suggestions to display
- `isOpen: boolean` - Whether dropdown is visible
- `highlightedIndex: number` - Currently highlighted item
- `onSelect: (item: AutocompleteItem) => void` - Selection handler
- `maxHeight?: number` - Maximum dropdown height

### DropdownPortal

Portal wrapper for rendering dropdown outside the DOM hierarchy.

**Responsibilities:**

- Escapes overflow containers
- Maintains proper z-index stacking
- Positions dropdown relative to anchor

### LiveRegion

ARIA live region for screen reader announcements.

**Responsibilities:**

- Announces token additions/deletions
- Announces dropdown state changes
- Announces validation errors (assertive)

**Key Props:**

- `children: ReactNode` - Content to announce
- `politeness?: 'polite' | 'assertive'` - ARIA politeness level

### Custom Input Widgets

Specialized input components rendered inline in the dropdown.

#### DatePickerWidget

- Full date picker for date fields
- Validates date constraints

#### DateRangeWidget

- Dual date picker for "between" operators
- Ensures start date <= end date

#### NumberInputWidget

- Number input with min/max/step validation
- Handles decimal precision

## Component Composition Pattern

```tsx
// Example usage showing component composition
<FilterBox
  schema={schema}
  value={expressions}
  onChange={setExpressions}
  showClearButton
  autoFocus
/>
```

## State Flow

See [data-flow.md](./data-flow.md) for detailed data flow architecture.
