/**
 * Edge Cases Stories
 *
 * Demonstrates edge cases and special scenarios for the FilterBox component.
 */

import type { Meta, StoryObj } from '@storybook/react'
import { useState } from 'react'
import type { FilterExpression, FilterSchema } from '@/types'
import { FilterBox } from './FilterBox'

const meta = {
  title: 'FilterBox/Edge Cases',
  component: FilterBox,
  parameters: {
    layout: 'padded',
  },
} satisfies Meta<typeof FilterBox>

export default meta
type Story = StoryObj<typeof meta>

// =============================================================================
// Very Long Values
// =============================================================================

const longValueSchema: FilterSchema = {
  fields: [
    {
      key: 'description',
      label: 'Description',
      type: 'string',
      operators: [
        { key: 'eq', label: 'equals', symbol: '=' },
        { key: 'contains', label: 'contains' },
      ],
    },
    {
      key: 'id',
      label: 'Identifier',
      type: 'id',
      operators: [{ key: 'eq', label: 'equals', symbol: '=' }],
    },
  ],
}

const longValueExpressions: FilterExpression[] = [
  {
    condition: {
      field: { key: 'description', label: 'Description', type: 'string' },
      operator: { key: 'contains', label: 'contains' },
      value: {
        raw: 'This is a very long value that might cause layout issues if not handled properly with text overflow and ellipsis',
        display:
          'This is a very long value that might cause layout issues if not handled properly with text overflow and ellipsis',
        serialized:
          'This is a very long value that might cause layout issues if not handled properly with text overflow and ellipsis',
      },
    },
    connector: 'AND',
  },
  {
    condition: {
      field: { key: 'id', label: 'Identifier', type: 'id' },
      operator: { key: 'eq', label: 'equals', symbol: '=' },
      value: {
        raw: 'abc123def456ghi789jkl012mno345pqr678stu901vwx234yz',
        display: 'abc123def456ghi789jkl012mno345pqr678stu901vwx234yz',
        serialized: 'abc123def456ghi789jkl012mno345pqr678stu901vwx234yz',
      },
    },
  },
]

export const VeryLongValues: Story = {
  args: {
    schema: longValueSchema,
    value: longValueExpressions,
    onChange: () => {},
    placeholder: 'Add filter...',
  },
}

// =============================================================================
// Special Characters
// =============================================================================

const specialCharSchema: FilterSchema = {
  fields: [
    {
      key: 'query',
      label: 'Search Query',
      type: 'string',
      operators: [
        { key: 'eq', label: 'equals', symbol: '=' },
        { key: 'contains', label: 'contains' },
        { key: 'like', label: 'like' },
      ],
    },
    {
      key: 'regex',
      label: 'Regex Pattern',
      type: 'string',
      operators: [{ key: 'matches', label: 'matches' }],
    },
  ],
}

const specialCharExpressions: FilterExpression[] = [
  {
    condition: {
      field: { key: 'query', label: 'Search Query', type: 'string' },
      operator: { key: 'contains', label: 'contains' },
      value: {
        raw: '<script>alert("XSS")</script>',
        display: '<script>alert("XSS")</script>',
        serialized: '<script>alert("XSS")</script>',
      },
    },
    connector: 'AND',
  },
  {
    condition: {
      field: { key: 'regex', label: 'Regex Pattern', type: 'string' },
      operator: { key: 'matches', label: 'matches' },
      value: {
        raw: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$',
        display: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$',
        serialized: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$',
      },
    },
    connector: 'AND',
  },
  {
    condition: {
      field: { key: 'query', label: 'Search Query', type: 'string' },
      operator: { key: 'like', label: 'like' },
      value: {
        raw: 'O\'Brien & Co. "Partners"',
        display: 'O\'Brien & Co. "Partners"',
        serialized: 'O\'Brien & Co. "Partners"',
      },
    },
  },
]

export const SpecialCharacters: Story = {
  args: {
    schema: specialCharSchema,
    value: specialCharExpressions,
    onChange: () => {},
    placeholder: 'Add filter...',
  },
}

// =============================================================================
// Empty Schema (Edge Case)
// =============================================================================

const emptySchema: FilterSchema = {
  fields: [],
}

export const EmptySchema: Story = {
  args: {
    schema: emptySchema,
    value: [],
    onChange: () => {},
    placeholder: 'No fields available',
  },
}

// =============================================================================
// Single Field Schema
// =============================================================================

const singleFieldSchema: FilterSchema = {
  fields: [
    {
      key: 'status',
      label: 'Status',
      type: 'enum',
      operators: [{ key: 'eq', label: 'is', symbol: '=' }],
    },
  ],
}

export const SingleFieldSchema: Story = {
  args: {
    schema: singleFieldSchema,
    value: [],
    onChange: () => {},
    placeholder: 'Filter by status...',
  },
}

// =============================================================================
// Disabled State
// =============================================================================

const standardSchema: FilterSchema = {
  fields: [
    {
      key: 'status',
      label: 'Status',
      type: 'enum',
      operators: [
        { key: 'eq', label: 'is', symbol: '=' },
        { key: 'neq', label: 'is not', symbol: '≠' },
      ],
    },
    {
      key: 'name',
      label: 'Name',
      type: 'string',
      operators: [
        { key: 'eq', label: 'equals', symbol: '=' },
        { key: 'contains', label: 'contains' },
      ],
    },
  ],
}

const prefilledExpressions: FilterExpression[] = [
  {
    condition: {
      field: { key: 'status', label: 'Status', type: 'enum' },
      operator: { key: 'eq', label: 'is', symbol: '=' },
      value: {
        raw: 'active',
        display: 'Active',
        serialized: 'active',
      },
    },
  },
]

export const DisabledState: Story = {
  args: {
    schema: standardSchema,
    value: prefilledExpressions,
    onChange: () => {},
    placeholder: 'Add filter...',
    disabled: true,
  },
}

// =============================================================================
// Read-Only State
// =============================================================================

export const ReadOnlyState: Story = {
  args: {
    schema: standardSchema,
    value: prefilledExpressions,
    onChange: () => {},
    placeholder: 'Add filter...',
    readOnly: true,
  },
}

// =============================================================================
// Maximum Expressions Reached
// =============================================================================

const maxExpressionsSchema: FilterSchema = {
  ...standardSchema,
  maxExpressions: 2,
}

const maxExpressions: FilterExpression[] = [
  {
    condition: {
      field: { key: 'status', label: 'Status', type: 'enum' },
      operator: { key: 'eq', label: 'is', symbol: '=' },
      value: {
        raw: 'active',
        display: 'Active',
        serialized: 'active',
      },
    },
    connector: 'AND',
  },
  {
    condition: {
      field: { key: 'name', label: 'Name', type: 'string' },
      operator: { key: 'contains', label: 'contains' },
      value: {
        raw: 'John',
        display: 'John',
        serialized: 'John',
      },
    },
  },
]

export const MaxExpressionsReached: Story = {
  args: {
    schema: maxExpressionsSchema,
    value: maxExpressions,
    onChange: () => {},
    placeholder: 'Maximum filters reached',
  },
}

// =============================================================================
// Unicode and Emoji Values
// =============================================================================

const unicodeExpressions: FilterExpression[] = [
  {
    condition: {
      field: { key: 'name', label: 'Name', type: 'string' },
      operator: { key: 'eq', label: 'equals', symbol: '=' },
      value: {
        raw: '日本語テスト',
        display: '日本語テスト',
        serialized: '日本語テスト',
      },
    },
    connector: 'AND',
  },
  {
    condition: {
      field: { key: 'name', label: 'Name', type: 'string' },
      operator: { key: 'contains', label: 'contains' },
      value: {
        raw: '🎉 Party Time! 🚀',
        display: '🎉 Party Time! 🚀',
        serialized: '🎉 Party Time! 🚀',
      },
    },
  },
]

export const UnicodeAndEmoji: Story = {
  args: {
    schema: standardSchema,
    value: unicodeExpressions,
    onChange: () => {},
    placeholder: 'Add filter...',
  },
}

// =============================================================================
// Whitespace Values
// =============================================================================

const whitespaceExpressions: FilterExpression[] = [
  {
    condition: {
      field: { key: 'name', label: 'Name', type: 'string' },
      operator: { key: 'eq', label: 'equals', symbol: '=' },
      value: {
        raw: '  leading and trailing spaces  ',
        display: '  leading and trailing spaces  ',
        serialized: '  leading and trailing spaces  ',
      },
    },
    connector: 'AND',
  },
  {
    condition: {
      field: { key: 'name', label: 'Name', type: 'string' },
      operator: { key: 'contains', label: 'contains' },
      value: {
        raw: 'text\twith\ttabs',
        display: 'text\twith\ttabs',
        serialized: 'text\twith\ttabs',
      },
    },
  },
]

export const WhitespaceValues: Story = {
  args: {
    schema: standardSchema,
    value: whitespaceExpressions,
    onChange: () => {},
    placeholder: 'Add filter...',
  },
}

// =============================================================================
// Many Expressions (Scrolling)
// =============================================================================

const manyExpressionsSchema: FilterSchema = {
  fields: [
    {
      key: 'tag',
      label: 'Tag',
      type: 'string',
      operators: [{ key: 'eq', label: 'is', symbol: '=' }],
    },
  ],
}

const manyExpressions: FilterExpression[] = Array.from({ length: 10 }, (_, i) => ({
  condition: {
    field: { key: 'tag', label: 'Tag', type: 'string' as const },
    operator: { key: 'eq', label: 'is', symbol: '=' },
    value: {
      raw: `Tag ${i + 1}`,
      display: `Tag ${i + 1}`,
      serialized: `tag${i + 1}`,
    },
  },
  connector: i < 9 ? ('OR' as const) : undefined,
}))

export const ManyExpressions: Story = {
  args: {
    schema: manyExpressionsSchema,
    value: manyExpressions,
    onChange: () => {},
    placeholder: 'Add more tags...',
  },
}

// =============================================================================
// Error State Demo
// =============================================================================

const errorSchema: FilterSchema = {
  fields: [
    {
      key: 'email',
      label: 'Email',
      type: 'string',
      operators: [{ key: 'eq', label: 'equals', symbol: '=' }],
      validate: (value) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(String(value.raw))) {
          return {
            valid: false,
            errors: [{ type: 'value', message: 'Invalid email format' }],
          }
        }
        return { valid: true, errors: [] }
      },
    },
  ],
}

const errorExpressions: FilterExpression[] = [
  {
    condition: {
      field: { key: 'email', label: 'Email', type: 'string' },
      operator: { key: 'eq', label: 'equals', symbol: '=' },
      value: {
        raw: 'not-an-email',
        display: 'not-an-email',
        serialized: 'not-an-email',
      },
    },
  },
]

export const ErrorState: Story = {
  args: {
    schema: errorSchema,
    value: errorExpressions,
    onChange: () => {},
    placeholder: 'Enter valid email...',
  },
}

// =============================================================================
// Interactive Error Handling
// =============================================================================

function InteractiveErrorHandlingComponent() {
  const [expressions, setExpressions] = useState<FilterExpression[]>([])
  const [lastError, setLastError] = useState<string | null>(null)

  const schema: FilterSchema = {
    fields: [
      {
        key: 'age',
        label: 'Age',
        type: 'number',
        operators: [
          { key: 'eq', label: 'equals', symbol: '=' },
          { key: 'gt', label: 'greater than', symbol: '>' },
        ],
        validate: (value) => {
          const num = Number(value.raw)
          if (isNaN(num)) {
            return {
              valid: false,
              errors: [{ type: 'value', message: 'Must be a valid number' }],
            }
          }
          if (num < 0 || num > 150) {
            return {
              valid: false,
              errors: [{ type: 'value', message: 'Age must be between 0 and 150' }],
            }
          }
          return { valid: true, errors: [] }
        },
      },
    ],
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <FilterBox
        schema={schema}
        value={expressions}
        onChange={setExpressions}
        onError={(errors) => {
          if (errors.length > 0) {
            setLastError(errors[0].message)
          } else {
            setLastError(null)
          }
        }}
        placeholder="Enter age filter..."
      />
      {lastError && (
        <div
          style={{
            padding: '12px',
            backgroundColor: '#fef2f2',
            border: '1px solid #fecaca',
            borderRadius: '8px',
            color: '#dc2626',
          }}
        >
          ⚠️ {lastError}
        </div>
      )}
      <div style={{ fontSize: '12px', color: '#666' }}>
        Try entering invalid values like "abc" or "-5" to see error handling.
      </div>
    </div>
  )
}

export const InteractiveErrorHandling: Story = {
  render: () => <InteractiveErrorHandlingComponent />,
}

// =============================================================================
// Rapid State Changes
// =============================================================================

function RapidStateChangesComponent() {
  const [expressions, setExpressions] = useState<FilterExpression[]>([])
  const [updateCount, setUpdateCount] = useState(0)

  const schema: FilterSchema = {
    fields: [
      {
        key: 'status',
        label: 'Status',
        type: 'enum',
        operators: [{ key: 'eq', label: 'is' }],
      },
    ],
  }

  const handleChange = (newExpressions: FilterExpression[]) => {
    setExpressions(newExpressions)
    setUpdateCount((c) => c + 1)
  }

  const clearAll = () => {
    setExpressions([])
    setUpdateCount((c) => c + 1)
  }

  const addRandom = () => {
    const statuses = ['Active', 'Pending', 'Completed', 'Failed']
    const randomStatus = statuses[Math.floor(Math.random() * statuses.length)]
    setExpressions((prev) => [
      ...prev,
      {
        condition: {
          field: { key: 'status', label: 'Status', type: 'enum' },
          operator: { key: 'eq', label: 'is' },
          value: {
            raw: randomStatus.toLowerCase(),
            display: randomStatus,
            serialized: randomStatus.toLowerCase(),
          },
        },
        connector: prev.length > 0 ? 'OR' : undefined,
      },
    ])
    setUpdateCount((c) => c + 1)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div style={{ display: 'flex', gap: '8px' }}>
        <button onClick={addRandom}>Add Random Filter</button>
        <button onClick={clearAll}>Clear All</button>
      </div>
      <FilterBox
        schema={schema}
        value={expressions}
        onChange={handleChange}
        placeholder="Add status filter..."
      />
      <div style={{ fontSize: '12px', color: '#666' }}>State update count: {updateCount}</div>
    </div>
  )
}

export const RapidStateChanges: Story = {
  render: () => <RapidStateChangesComponent />,
}
