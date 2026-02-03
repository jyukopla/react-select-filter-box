# AGENTS.md

Guidance for AI coding agents working on this project.

## Project Overview

**react-select-filter-box** is a React component library providing a Select2-like sequential filter expression builder. Users build filter expressions token-by-token (field → operator → value → connector) with context-aware autocomplete.

## Tech Stack

- **Runtime**: React 18/19 with TypeScript (strict mode)
- **Build**: Vite (library mode, dual ESM/CJS output)
- **Testing**: Vitest + @testing-library/react, 100% coverage target
- **Storybook**: Component development and visual testing
- **Styling**: CSS custom properties with light/dark themes

## Project Structure

```
src/
├── autocompleters/     # Built-in providers (enum, async, date)
├── components/         # React components
│   ├── FilterBox/      # Main public component
│   ├── Token/          # Token chip (field, operator, value, connector)
│   ├── TokenContainer/ # Token layout with input
│   ├── AutocompleteDropdown/  # Virtual scrolling dropdown
│   └── ...             # Other UI components
├── core/               # State machine (StateMachine.ts)
├── hooks/              # useFilterState, useDropdownPosition, etc.
├── types/              # TypeScript definitions
└── utils/              # Validation, serialization, schema utilities
```

## Key Concepts

### Sequential Token Model

Tokens follow strict order: `field → operator → value → [connector → ...]`

- **Single-click** on token: Select for deletion (Backspace/Delete)
- **Double-click** on value/operator/connector: Edit inline
- **Arrow keys** when token is selected:
  - Left/Right: Navigate between tokens
  - Down/Up: Open dropdown to edit operator/connector/value tokens
- Only selected tokens can be deleted; connectors only remove the link
- Undo/Redo: Ctrl+Z / Ctrl+Shift+Z (or Ctrl+Y)
- Copy/Paste: Ctrl+C / Ctrl+V (copies as JSON)
- Select All: Ctrl+A

### State Machine

States in `src/core/StateMachine.ts`:

- `idle` → `selecting-field` → `selecting-operator` → `entering-value` → `selecting-connector`
- `editing-token` - When editing an existing token

### Autocompleters

```typescript
createEnumAutocompleter([...])      // Static options
createAsyncAutocompleter(fn, opts)  // API-backed with caching
createDateAutocompleter()           // Date picker widget
```

## Coding Guidelines

### TypeScript

- Strict mode with `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`
- Types in `src/types/`, re-export from `src/index.ts`

### Components

- Memoize with `memo()`, `useCallback`, `useMemo` where beneficial
- Support controlled mode via `value` + `onChange`

### Testing

- TDD: Write tests first
- Use `@testing-library/react` for component tests
- Every component needs Storybook stories

### Accessibility

- ARIA combobox pattern, keyboard navigation
- `aria-live` regions for announcements
- Respect `prefers-reduced-motion`

### Styling

- CSS custom properties only (no inline styles)
- Design tokens for colors, spacing, typography

## Commands

```bash
make test            # Run tests
make test-coverage   # Tests with coverage
make storybook       # Start Storybook
make build-lib       # Build for distribution
make lint            # ESLint
make typecheck       # TypeScript check
make format          # Prettier
make help            # All targets
```

## File Conventions

- Components: `PascalCase/index.tsx`
- Tests: `*.test.tsx` alongside source
- Stories: `*.stories.tsx` alongside source
- Types: `src/types/PascalCase.ts`

## Adding Features

1. Define types in `src/types/`
2. Write tests first (TDD)
3. Implement in appropriate module
4. Add Storybook stories
5. Export from `src/index.ts` if public

## Notes

- **DO NOT** mention "Camunda" anywhere
- Use "process engine" for examples
- This project was developed with AI coding agents
