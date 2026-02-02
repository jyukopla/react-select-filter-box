# AGENTS.md

This file provides guidance for AI coding agents working on this project.

## Project Overview

**react-select-filter-box** is a React 18 component library that provides a Select2-like sequential filter expression builder. Users build filter expressions token-by-token (field → operator → value → connector) with context-aware autocomplete suggestions.

## Tech Stack

- **Runtime**: React 18 with TypeScript (strict mode)
- **Build**: Vite (library mode with dual ESM/CJS output)
- **Testing**: Vitest with jsdom, 100% coverage target
- **Storybook**: For component development and visual testing
- **Styling**: CSS custom properties (design tokens) with light/dark themes

## Project Structure

```
src/
├── autocompleters/     # Built-in autocomplete providers (enum, async, date)
├── components/         # React components
│   ├── AutocompleteDropdown/  # Dropdown with virtual scrolling
│   ├── CustomInputs/          # Date picker, number input widgets
│   ├── DropdownPortal/        # Portal for dropdown positioning
│   ├── ErrorDisplay/          # Validation error display
│   ├── FilterBox/             # Main public component
│   ├── LiveRegion/            # ARIA live region for announcements
│   ├── Token/                 # Token chip component
│   ├── TokenContainer/        # Horizontal token layout
│   └── TokenInput/            # Auto-sizing input field
├── core/               # State machine and core logic
├── hooks/              # Custom React hooks
├── styles/             # CSS with custom properties
├── theme/              # Theme provider and context
├── types/              # TypeScript type definitions
└── utils/              # Validation, serialization, schema utilities
```

## Key Concepts

### Sequential Token Model

Tokens must be entered in strict order: `field → operator → value → [connector → field → ...]`

- No reordering allowed (no drag-drop)
- Only the LAST token can be deleted
- To delete earlier tokens, must delete all following tokens first
- Value tokens are editable; field/operator tokens require deletion

### State Machine

The component uses a finite state machine (`src/core/StateMachine.ts`) with states:

- `idle` - No partial expression
- `field-selected` - Field chosen, awaiting operator
- `operator-selected` - Operator chosen, awaiting value
- `complete` - Full expression ready

### Autocompleters

Autocompleters are pluggable providers for suggestions:

- `createEnumAutocompleter()` - Static list of options
- `createAsyncAutocompleter()` - API-backed with caching
- `createDateAutocompleter()` - Date picker widget

## Coding Guidelines

### TypeScript

- Use strict TypeScript (`strict`, `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`)
- Export types from `src/types/` and re-export from `src/index.ts`
- Prefer interfaces for object shapes, type aliases for unions

### Components

- All components should be memoized where beneficial
- Use `useCallback` for event handlers passed as props
- Use `useMemo` for derived/computed state
- Components must support controlled mode via `value` + `onChange`

### Testing

- Follow TDD/BDD approach
- Every feature needs unit tests in Vitest
- Every component needs Storybook stories
- Target 100% code coverage
- Use `@testing-library/react` for component tests

### Accessibility

- Full ARIA support required (combobox pattern)
- All interactive elements must be keyboard accessible
- Use `aria-live` regions for dynamic announcements
- Respect `prefers-reduced-motion`

### Styling

- Use CSS custom properties for theming
- All colors, spacing, typography defined as design tokens
- Support light and dark themes
- No inline styles; use CSS modules or plain CSS files

## Important Notes

- **DO NOT** mention "Camunda" in code or commit messages
- Use "process engine" for example use cases
- This project was developed with AI coding agents
- Storybook examples should demonstrate real-world use cases

## Common Commands

This project uses a Makefile for common tasks. Dependencies are automatically installed when needed.

```bash
make test            # Run unit tests
make test-watch      # Run tests in watch mode
make test-coverage   # Run tests with coverage
make storybook       # Start Storybook dev server
make build-lib       # Build library for distribution
make lint            # Run ESLint
make typecheck       # TypeScript type checking
make format          # Format code with Prettier
make clean           # Remove node_modules, dist, coverage
make help            # Show all available targets
```

Alternatively, you can use npm scripts directly:

```bash
npm run test         # Run unit tests
npm run storybook    # Start Storybook dev server
npm run build:lib    # Build library for distribution
```

## File Naming Conventions

- Components: `PascalCase/` directories with `index.tsx` entry
- Tests: `*.test.ts` or `*.test.tsx` alongside source files
- Stories: `*.stories.tsx` alongside components
- Types: `PascalCase.ts` in `src/types/`
- Utilities: `camelCase.ts` in `src/utils/`

## Adding New Features

1. Define types in `src/types/`
2. Write tests first (TDD)
3. Implement in appropriate module
4. Add Storybook stories
5. Update documentation if public API changes
6. Export from `src/index.ts` if public
