# Testing Guide

This guide explains how to test applications that use the React Sequential Filter Box.

## Overview

The FilterBox component is designed for testability. This guide covers:

- Unit testing filter logic
- Component testing with React Testing Library
- Integration testing complete flows
- Accessibility testing

## Test Setup

### Dependencies

```bash
npm install -D vitest @testing-library/react @testing-library/user-event jsdom @testing-library/jest-dom
```

### Vitest Configuration

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./test/setup.ts'],
    globals: true,
  },
})
```

### Test Setup File

```typescript
// test/setup.ts
import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterEach } from 'vitest'

afterEach(() => {
  cleanup()
})
```

## Unit Testing

### Testing Schema Configuration

```typescript
import { describe, it, expect } from 'vitest'
import { validateSchema } from 'react-select-filter-box'
import { mySchema } from './mySchema'

describe('Filter Schema', () => {
  it('should have valid field configurations', () => {
    const result = validateSchema(mySchema)
    expect(result.valid).toBe(true)
  })

  it('should contain required fields', () => {
    const fieldKeys = mySchema.fields.map((f) => f.key)
    expect(fieldKeys).toContain('status')
    expect(fieldKeys).toContain('createdAt')
  })

  it('should have operators for each field', () => {
    mySchema.fields.forEach((field) => {
      expect(field.operators.length).toBeGreaterThan(0)
    })
  })
})
```

### Testing Custom Autocompleters

```typescript
import { describe, it, expect, vi } from 'vitest'
import { createAsyncAutocompleter } from 'react-select-filter-box'

describe('UserAutocompleter', () => {
  const mockFetch = vi.fn()

  const autocompleter = createAsyncAutocompleter(
    async (query) => {
      return mockFetch(query)
    },
    { debounceMs: 0 } // Disable debounce for tests
  )

  beforeEach(() => {
    mockFetch.mockReset()
  })

  it('should fetch suggestions based on query', async () => {
    mockFetch.mockResolvedValue([
      { key: '1', label: 'John Doe' },
      { key: '2', label: 'Jane Smith' },
    ])

    const context = createTestContext({ inputValue: 'john' })
    const suggestions = await autocompleter.getSuggestions(context)

    expect(mockFetch).toHaveBeenCalledWith('john')
    expect(suggestions).toHaveLength(2)
    expect(suggestions[0].label).toBe('John Doe')
  })

  it('should handle fetch errors gracefully', async () => {
    mockFetch.mockRejectedValue(new Error('Network error'))

    const context = createTestContext({ inputValue: 'test' })

    await expect(autocompleter.getSuggestions(context)).rejects.toThrow('Network error')
  })
})
```

### Testing Serialization

```typescript
import { describe, it, expect } from 'vitest'
import { serialize, deserialize } from 'react-select-filter-box'

describe('Expression Serialization', () => {
  const expressions = [
    {
      condition: {
        field: 'status',
        operator: 'eq',
        value: { raw: 'active', display: 'Active', serialized: 'active' },
      },
      connector: 'AND',
    },
  ]

  it('should serialize expressions to JSON', () => {
    const json = serialize(expressions)
    expect(json).toBe(
      JSON.stringify([
        {
          field: 'status',
          operator: 'eq',
          value: 'active',
          connector: 'AND',
        },
      ])
    )
  })

  it('should deserialize JSON to expressions', () => {
    const json = '[{"field":"status","operator":"eq","value":"active"}]'
    const result = deserialize(json, mySchema)

    expect(result).toHaveLength(1)
    expect(result[0].condition.field).toBe('status')
  })

  it('should roundtrip correctly', () => {
    const serialized = serialize(expressions)
    const deserialized = deserialize(serialized, mySchema)
    const reserialized = serialize(deserialized)

    expect(reserialized).toBe(serialized)
  })
})
```

## Component Testing

### Basic Rendering

```typescript
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { FilterBox } from 'react-select-filter-box'
import { mySchema } from './mySchema'

describe('FilterBox', () => {
  it('should render empty state', () => {
    render(
      <FilterBox
        schema={mySchema}
        value={[]}
        onChange={() => {}}
      />
    )

    expect(screen.getByRole('group')).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/select field/i)).toBeInTheDocument()
  })

  it('should render with initial expressions', () => {
    const expressions = [
      {
        condition: {
          field: 'status',
          operator: 'eq',
          value: { raw: 'active', display: 'Active', serialized: 'active' },
        },
      },
    ]

    render(
      <FilterBox
        schema={mySchema}
        value={expressions}
        onChange={() => {}}
      />
    )

    expect(screen.getByText('Status')).toBeInTheDocument()
    expect(screen.getByText('=')).toBeInTheDocument()
    expect(screen.getByText('Active')).toBeInTheDocument()
  })
})
```

### User Interaction Testing

```typescript
import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { FilterBox } from 'react-select-filter-box'

describe('FilterBox Interactions', () => {
  it('should open dropdown on focus', async () => {
    const user = userEvent.setup()

    render(
      <FilterBox
        schema={mySchema}
        value={[]}
        onChange={() => {}}
      />
    )

    const input = screen.getByRole('textbox')
    await user.click(input)

    await waitFor(() => {
      expect(screen.getByRole('listbox')).toBeInTheDocument()
    })
  })

  it('should filter fields by typing', async () => {
    const user = userEvent.setup()

    render(
      <FilterBox
        schema={mySchema}
        value={[]}
        onChange={() => {}}
      />
    )

    const input = screen.getByRole('textbox')
    await user.type(input, 'stat')

    await waitFor(() => {
      expect(screen.getByText('Status')).toBeInTheDocument()
      // Other fields should be filtered out
      expect(screen.queryByText('Created Date')).not.toBeInTheDocument()
    })
  })

  it('should call onChange when expression is completed', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()

    render(
      <FilterBox
        schema={mySchema}
        value={[]}
        onChange={onChange}
      />
    )

    const input = screen.getByRole('textbox')

    // Select field
    await user.click(input)
    await user.click(screen.getByText('Status'))

    // Select operator
    await user.click(screen.getByText('equals'))

    // Select value
    await user.click(screen.getByText('Active'))

    await waitFor(() => {
      expect(onChange).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            condition: expect.objectContaining({
              field: 'status',
              operator: 'eq',
            }),
          }),
        ])
      )
    })
  })
})
```

### Keyboard Navigation Testing

```typescript
describe('Keyboard Navigation', () => {
  it('should navigate dropdown with arrow keys', async () => {
    const user = userEvent.setup()

    render(
      <FilterBox schema={mySchema} value={[]} onChange={() => {}} />
    )

    const input = screen.getByRole('textbox')
    await user.click(input)

    // First item should be highlighted
    const firstOption = screen.getAllByRole('option')[0]
    expect(firstOption).toHaveClass('autocomplete-item--highlighted')

    // Arrow down to highlight second item
    await user.keyboard('{ArrowDown}')

    const secondOption = screen.getAllByRole('option')[1]
    expect(secondOption).toHaveClass('autocomplete-item--highlighted')
  })

  it('should select highlighted item with Enter', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()

    render(
      <FilterBox schema={mySchema} value={[]} onChange={onChange} />
    )

    const input = screen.getByRole('textbox')
    await user.click(input)
    await user.keyboard('{Enter}') // Select first field
    await user.keyboard('{Enter}') // Select first operator
    await user.keyboard('{Enter}') // Select first value

    expect(onChange).toHaveBeenCalled()
  })

  it('should close dropdown with Escape', async () => {
    const user = userEvent.setup()

    render(
      <FilterBox schema={mySchema} value={[]} onChange={() => {}} />
    )

    const input = screen.getByRole('textbox')
    await user.click(input)

    expect(screen.getByRole('listbox')).toBeInTheDocument()

    await user.keyboard('{Escape}')

    await waitFor(() => {
      expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
    })
  })

  it('should delete last token with Backspace', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()

    const expressions = [
      {
        condition: {
          field: 'status',
          operator: 'eq',
          value: { raw: 'active', display: 'Active', serialized: 'active' },
        },
      },
    ]

    render(
      <FilterBox
        schema={mySchema}
        value={expressions}
        onChange={onChange}
      />
    )

    const input = screen.getByRole('textbox')
    await user.click(input)
    await user.keyboard('{Backspace}{Backspace}') // Two backspaces to confirm delete

    await waitFor(() => {
      expect(onChange).toHaveBeenCalledWith([])
    })
  })
})
```

## Integration Testing

### Complete Flow Testing

```typescript
describe('Complete Filter Flow', () => {
  it('should build and modify a complete filter expression', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()

    const { rerender } = render(
      <FilterBox
        schema={mySchema}
        value={[]}
        onChange={onChange}
      />
    )

    // Build first expression
    const input = screen.getByRole('textbox')
    await user.click(input)
    await user.click(screen.getByText('Status'))
    await user.click(screen.getByText('equals'))
    await user.click(screen.getByText('Active'))

    // Verify expression was created
    const newExpressions = onChange.mock.calls[0][0]
    expect(newExpressions).toHaveLength(1)

    // Rerender with new value
    rerender(
      <FilterBox
        schema={mySchema}
        value={newExpressions}
        onChange={onChange}
      />
    )

    // Add connector and second expression
    await user.click(screen.getByText('AND'))
    // ... continue building
  })
})
```

## Accessibility Testing

### ARIA Attributes

```typescript
describe('Accessibility', () => {
  it('should have correct ARIA attributes on container', () => {
    render(
      <FilterBox
        schema={mySchema}
        value={[]}
        onChange={() => {}}
        aria-label="Filter processes"
      />
    )

    const container = screen.getByRole('group')
    expect(container).toHaveAttribute('aria-label', 'Filter processes')
  })

  it('should have correct ARIA attributes on dropdown', async () => {
    const user = userEvent.setup()

    render(
      <FilterBox schema={mySchema} value={[]} onChange={() => {}} />
    )

    await user.click(screen.getByRole('textbox'))

    const listbox = screen.getByRole('listbox')
    expect(listbox).toBeInTheDocument()

    const options = screen.getAllByRole('option')
    options.forEach(option => {
      expect(option).toHaveAttribute('aria-selected')
    })
  })

  it('should announce changes to screen readers', async () => {
    const user = userEvent.setup()

    render(
      <FilterBox schema={mySchema} value={[]} onChange={() => {}} />
    )

    await user.click(screen.getByRole('textbox'))
    await user.click(screen.getByText('Status'))

    // Check that live region contains announcement
    const liveRegion = document.querySelector('[aria-live]')
    expect(liveRegion?.textContent).toMatch(/status.*selected/i)
  })
})
```

### Keyboard Accessibility

```typescript
describe('Keyboard Accessibility', () => {
  it('should be fully operable with keyboard', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()

    render(
      <FilterBox schema={mySchema} value={[]} onChange={onChange} />
    )

    // Tab to focus
    await user.tab()
    expect(screen.getByRole('textbox')).toHaveFocus()

    // Open dropdown
    await user.keyboard('{Enter}')
    expect(screen.getByRole('listbox')).toBeInTheDocument()

    // Navigate and select
    await user.keyboard('{ArrowDown}{Enter}')
    await user.keyboard('{Enter}')
    await user.keyboard('{Enter}')

    expect(onChange).toHaveBeenCalled()
  })
})
```

## Test Utilities

### Create Test Context Helper

```typescript
import type { AutocompleteContext } from 'react-select-filter-box'

export function createTestContext(
  overrides: Partial<AutocompleteContext> = {}
): AutocompleteContext {
  return {
    inputValue: '',
    field: {
      key: 'status',
      label: 'Status',
      type: 'enum',
      operators: [{ key: 'eq', label: 'equals', symbol: '=' }],
    },
    operator: { key: 'eq', label: 'equals', symbol: '=' },
    existingExpressions: [],
    schema: { fields: [] },
    ...overrides,
  }
}
```

### Render with Theme Helper

```typescript
import { ThemeProvider } from 'react-select-filter-box'

export function renderWithTheme(
  ui: React.ReactElement,
  theme = {}
) {
  return render(
    <ThemeProvider theme={theme}>
      {ui}
    </ThemeProvider>
  )
}
```

## Best Practices

1. **Use `userEvent` over `fireEvent`** - More realistic user interactions
2. **Wait for async updates** - Use `waitFor` for state changes
3. **Test behavior, not implementation** - Focus on user-facing functionality
4. **Mock API calls** - Use `vi.fn()` for async autocompleters
5. **Test keyboard navigation** - Essential for accessibility
6. **Snapshot sparingly** - Prefer explicit assertions

## Next Steps

- [Schema Definition Guide](./schema-definition.md)
- [Custom Autocompleters Guide](./custom-autocompleters.md)
- [Theming Guide](./theming.md)
