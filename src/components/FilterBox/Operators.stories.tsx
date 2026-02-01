import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'
import { FilterBox } from './FilterBox'
import type { FilterSchema, FilterExpression } from '@/types'

const meta = {
  title: 'Components/FilterBox/Operators',
  component: FilterBox,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: 'Examples showcasing all supported operator types and their behaviors.',
      },
    },
  },
  tags: ['autodocs'],
} satisfies Meta<typeof FilterBox>

export default meta
type Story = StoryObj<typeof meta>

// Helper component for stories
function FilterBoxWithState({
  schema,
  description,
}: {
  schema: FilterSchema
  description?: string
}) {
  const [value, setValue] = useState<FilterExpression[]>([])
  return (
    <div style={{ maxWidth: '650px' }}>
      {description && (
        <p style={{ marginBottom: '1rem', color: '#666', fontSize: '14px' }}>{description}</p>
      )}
      <FilterBox schema={schema} value={value} onChange={setValue} />
      <pre
        style={{
          marginTop: '1rem',
          fontSize: '12px',
          background: '#f5f5f5',
          padding: '1rem',
          borderRadius: '4px',
          overflow: 'auto',
        }}
      >
        {JSON.stringify(value, null, 2) || '[]'}
      </pre>
    </div>
  )
}

// =============================================================================
// Equality Operators
// =============================================================================

const equalityOperatorsSchema: FilterSchema = {
  fields: [
    {
      key: 'status',
      label: 'Status',
      type: 'string',
      description: 'Compare with exact equality',
      operators: [
        { key: 'eq', label: 'equals', symbol: '=' },
        { key: 'neq', label: 'not equals', symbol: '≠' },
      ],
    },
    {
      key: 'code',
      label: 'Code',
      type: 'string',
      description: 'Exact match comparison',
      operators: [
        { key: 'eq', label: 'is exactly', symbol: '=' },
        { key: 'neq', label: 'is not', symbol: '!=' },
      ],
    },
    {
      key: 'type',
      label: 'Type',
      type: 'enum',
      description: 'Category type',
      operators: [
        { key: 'eq', label: 'is', symbol: '=' },
        { key: 'neq', label: 'is not', symbol: '≠' },
      ],
    },
  ],
}

export const EqualityOperators: Story = {
  render: () => (
    <FilterBoxWithState
      schema={equalityOperatorsSchema}
      description="Equality operators compare values for exact matches. Use '=' for equals and '≠' for not equals."
    />
  ),
  parameters: {
    docs: {
      description: {
        story: 'Equality operators: equals (=) and not equals (≠) for exact value matching.',
      },
    },
  },
}

// =============================================================================
// Comparison Operators
// =============================================================================

const comparisonOperatorsSchema: FilterSchema = {
  fields: [
    {
      key: 'price',
      label: 'Price',
      type: 'number',
      description: 'Product price for comparison',
      operators: [
        { key: 'eq', label: 'equals', symbol: '=' },
        { key: 'gt', label: 'greater than', symbol: '>' },
        { key: 'gte', label: 'greater or equal', symbol: '≥' },
        { key: 'lt', label: 'less than', symbol: '<' },
        { key: 'lte', label: 'less or equal', symbol: '≤' },
      ],
    },
    {
      key: 'quantity',
      label: 'Quantity',
      type: 'number',
      description: 'Stock quantity',
      operators: [
        { key: 'gt', label: 'more than', symbol: '>' },
        { key: 'lt', label: 'less than', symbol: '<' },
        { key: 'gte', label: 'at least', symbol: '≥' },
        { key: 'lte', label: 'at most', symbol: '≤' },
      ],
    },
    {
      key: 'rating',
      label: 'Rating',
      type: 'number',
      description: 'Star rating (1-5)',
      operators: [
        { key: 'gte', label: 'at least', symbol: '★≥' },
        { key: 'lte', label: 'at most', symbol: '★≤' },
      ],
    },
  ],
}

export const ComparisonOperators: Story = {
  render: () => (
    <FilterBoxWithState
      schema={comparisonOperatorsSchema}
      description="Comparison operators for numeric values: greater than (>), less than (<), greater or equal (≥), less or equal (≤)."
    />
  ),
  parameters: {
    docs: {
      description: {
        story: 'Comparison operators for numeric and ordinal values: >, <, ≥, ≤.',
      },
    },
  },
}

// =============================================================================
// Text Operators
// =============================================================================

const textOperatorsSchema: FilterSchema = {
  fields: [
    {
      key: 'title',
      label: 'Title',
      type: 'string',
      description: 'Document title',
      operators: [
        { key: 'eq', label: 'equals', symbol: '=' },
        { key: 'contains', label: 'contains' },
        { key: 'notContains', label: 'does not contain' },
      ],
    },
    {
      key: 'filename',
      label: 'Filename',
      type: 'string',
      description: 'Name of the file',
      operators: [
        { key: 'startsWith', label: 'starts with' },
        { key: 'endsWith', label: 'ends with' },
        { key: 'contains', label: 'contains' },
      ],
    },
    {
      key: 'description',
      label: 'Description',
      type: 'string',
      description: 'Item description',
      operators: [
        { key: 'like', label: 'matches pattern' },
        { key: 'regex', label: 'matches regex' },
      ],
    },
    {
      key: 'email',
      label: 'Email',
      type: 'string',
      description: 'Email address',
      operators: [
        { key: 'eq', label: 'is', symbol: '=' },
        { key: 'endsWith', label: 'domain is', symbol: '@' },
      ],
    },
  ],
}

export const TextOperators: Story = {
  render: () => (
    <FilterBoxWithState
      schema={textOperatorsSchema}
      description="Text operators for string matching: contains, starts with, ends with, pattern matching (like), and regex."
    />
  ),
  parameters: {
    docs: {
      description: {
        story: 'Text operators for string fields: contains, starts with, ends with, like, regex.',
      },
    },
  },
}

// =============================================================================
// Date Operators
// =============================================================================

const dateOperatorsSchema: FilterSchema = {
  fields: [
    {
      key: 'createdAt',
      label: 'Created Date',
      type: 'date',
      description: 'When the record was created',
      operators: [
        { key: 'on', label: 'on', symbol: '=' },
        { key: 'before', label: 'before', symbol: '<' },
        { key: 'after', label: 'after', symbol: '>' },
        { key: 'onOrBefore', label: 'on or before', symbol: '≤' },
        { key: 'onOrAfter', label: 'on or after', symbol: '≥' },
      ],
    },
    {
      key: 'eventDate',
      label: 'Event Date',
      type: 'date',
      description: 'Date of the event',
      operators: [
        { key: 'between', label: 'between' },
        { key: 'notBetween', label: 'not between' },
      ],
    },
    {
      key: 'dueDate',
      label: 'Due Date',
      type: 'date',
      description: 'Deadline',
      operators: [
        { key: 'inLast', label: 'in the last' },
        { key: 'inNext', label: 'in the next' },
        { key: 'isToday', label: 'is today' },
        { key: 'isThisWeek', label: 'is this week' },
      ],
    },
  ],
}

export const DateOperators: Story = {
  render: () => (
    <FilterBoxWithState
      schema={dateOperatorsSchema}
      description="Date operators for temporal filtering: on, before, after, between, relative date ranges."
    />
  ),
  parameters: {
    docs: {
      description: {
        story:
          'Date operators: on, before, after, between, and relative date ranges like "in the last N days".',
      },
    },
  },
}

// =============================================================================
// List Operators
// =============================================================================

const listOperatorsSchema: FilterSchema = {
  fields: [
    {
      key: 'status',
      label: 'Status',
      type: 'enum',
      description: 'Filter by multiple statuses',
      operators: [
        { key: 'eq', label: 'is', symbol: '=' },
        { key: 'in', label: 'is one of', symbol: '∈' },
        { key: 'notIn', label: 'is not one of', symbol: '∉' },
      ],
    },
    {
      key: 'tags',
      label: 'Tags',
      type: 'custom',
      description: 'Item tags',
      operators: [
        { key: 'hasAny', label: 'has any of' },
        { key: 'hasAll', label: 'has all of' },
        { key: 'hasNone', label: 'has none of' },
      ],
    },
    {
      key: 'categoryId',
      label: 'Category',
      type: 'id',
      description: 'Product category',
      operators: [
        { key: 'in', label: 'in list' },
        { key: 'notIn', label: 'not in list' },
      ],
    },
  ],
}

export const ListOperators: Story = {
  render: () => (
    <FilterBoxWithState
      schema={listOperatorsSchema}
      description="List operators for matching against multiple values: in, not in, has any of, has all of."
    />
  ),
  parameters: {
    docs: {
      description: {
        story: 'List operators for multi-value matching: in, not in, has any, has all, has none.',
      },
    },
  },
}

// =============================================================================
// Between Operator (Multi-Value)
// =============================================================================

const betweenOperatorSchema: FilterSchema = {
  fields: [
    {
      key: 'price',
      label: 'Price',
      type: 'number',
      description: 'Price range filter',
      operators: [
        { key: 'between', label: 'between' },
        { key: 'notBetween', label: 'not between' },
      ],
    },
    {
      key: 'dateRange',
      label: 'Date',
      type: 'date',
      description: 'Date range filter',
      operators: [{ key: 'between', label: 'between' }],
    },
    {
      key: 'age',
      label: 'Age',
      type: 'number',
      description: 'Age range',
      operators: [{ key: 'between', label: 'from...to' }],
    },
  ],
}

export const BetweenOperator: Story = {
  render: () => (
    <FilterBoxWithState
      schema={betweenOperatorSchema}
      description="The 'between' operator requires two values (min and max) for range filtering."
    />
  ),
  parameters: {
    docs: {
      description: {
        story: 'Between operator for range filtering - requires two values for the range bounds.',
      },
    },
  },
}

// =============================================================================
// Null/Empty Operators
// =============================================================================

const nullOperatorsSchema: FilterSchema = {
  fields: [
    {
      key: 'email',
      label: 'Email',
      type: 'string',
      description: 'Check for null or empty email',
      operators: [
        { key: 'eq', label: 'is', symbol: '=' },
        { key: 'isNull', label: 'is empty' },
        { key: 'isNotNull', label: 'is not empty' },
      ],
    },
    {
      key: 'completedAt',
      label: 'Completed Date',
      type: 'date',
      description: 'Completion timestamp',
      operators: [
        { key: 'isNull', label: 'not completed' },
        { key: 'isNotNull', label: 'is completed' },
        { key: 'before', label: 'completed before' },
      ],
    },
    {
      key: 'assignee',
      label: 'Assignee',
      type: 'string',
      description: 'Assigned user',
      operators: [
        { key: 'isNull', label: 'unassigned' },
        { key: 'isNotNull', label: 'assigned' },
        { key: 'eq', label: 'is', symbol: '=' },
      ],
    },
  ],
}

export const NullOperators: Story = {
  render: () => (
    <FilterBoxWithState
      schema={nullOperatorsSchema}
      description="Null/empty operators check for missing or empty values: is empty, is not empty."
    />
  ),
  parameters: {
    docs: {
      description: {
        story:
          'Null/empty operators for checking missing values: isNull, isNotNull, isEmpty, isNotEmpty.',
      },
    },
  },
}

// =============================================================================
// Custom Symbol Display
// =============================================================================

const customSymbolsSchema: FilterSchema = {
  fields: [
    {
      key: 'priority',
      label: 'Priority',
      type: 'enum',
      description: 'Task priority with custom symbols',
      operators: [
        { key: 'eq', label: 'is', symbol: '◆' },
        { key: 'gte', label: 'at least', symbol: '≥◆' },
        { key: 'lte', label: 'at most', symbol: '≤◆' },
      ],
    },
    {
      key: 'temperature',
      label: 'Temperature',
      type: 'number',
      description: 'Temperature reading',
      operators: [
        { key: 'gt', label: 'above', symbol: '🌡️>' },
        { key: 'lt', label: 'below', symbol: '🌡️<' },
        { key: 'eq', label: 'exactly', symbol: '🌡️=' },
      ],
    },
    {
      key: 'direction',
      label: 'Direction',
      type: 'enum',
      description: 'Movement direction',
      operators: [{ key: 'eq', label: 'is', symbol: '→' }],
    },
  ],
}

export const CustomSymbols: Story = {
  render: () => (
    <FilterBoxWithState
      schema={customSymbolsSchema}
      description="Operators can display custom symbols for a more visual representation."
    />
  ),
  parameters: {
    docs: {
      description: {
        story: 'Custom operator symbols for enhanced visual display using the symbol property.',
      },
    },
  },
}

// =============================================================================
// All Operator Types Combined
// =============================================================================

const allOperatorsSchema: FilterSchema = {
  fields: [
    {
      key: 'name',
      label: 'Name',
      type: 'string',
      group: 'Text',
      operators: [
        { key: 'eq', label: '=', symbol: '=' },
        { key: 'contains', label: 'contains' },
        { key: 'startsWith', label: 'starts with' },
      ],
    },
    {
      key: 'amount',
      label: 'Amount',
      type: 'number',
      group: 'Numeric',
      operators: [
        { key: 'eq', label: '=', symbol: '=' },
        { key: 'gt', label: '>', symbol: '>' },
        { key: 'lt', label: '<', symbol: '<' },
        { key: 'between', label: 'between' },
      ],
    },
    {
      key: 'date',
      label: 'Date',
      type: 'date',
      group: 'Temporal',
      operators: [
        { key: 'on', label: 'on', symbol: '=' },
        { key: 'before', label: 'before', symbol: '<' },
        { key: 'after', label: 'after', symbol: '>' },
      ],
    },
    {
      key: 'status',
      label: 'Status',
      type: 'enum',
      group: 'Selection',
      operators: [
        { key: 'eq', label: 'is', symbol: '=' },
        { key: 'in', label: 'in', symbol: '∈' },
      ],
    },
    {
      key: 'archived',
      label: 'Archived',
      type: 'boolean',
      group: 'Status',
      operators: [
        { key: 'is', label: 'is' },
        { key: 'isNull', label: 'not set' },
      ],
    },
  ],
}

export const AllOperatorTypes: Story = {
  render: () => (
    <FilterBoxWithState
      schema={allOperatorsSchema}
      description="A comprehensive example showcasing all operator categories in one schema."
    />
  ),
  parameters: {
    docs: {
      description: {
        story:
          'Comprehensive example with all operator types: equality, comparison, text, date, list, and null.',
      },
    },
  },
}
