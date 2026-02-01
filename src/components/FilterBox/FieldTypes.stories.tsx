import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'
import { FilterBox } from './FilterBox'
import type { FilterSchema, FilterExpression } from '@/types'
import { getDefaultOperators } from '@/types'

const meta = {
  title: 'Components/FilterBox/Field Types',
  component: FilterBox,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: 'Examples showing all supported field types with their default operators.',
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
// String Fields
// =============================================================================

const stringFieldsSchema: FilterSchema = {
  fields: [
    {
      key: 'name',
      label: 'Name',
      type: 'string',
      description: 'Full name of the user',
      operators: getDefaultOperators('string'),
    },
    {
      key: 'email',
      label: 'Email',
      type: 'string',
      description: 'Email address',
      operators: getDefaultOperators('string'),
    },
    {
      key: 'description',
      label: 'Description',
      type: 'string',
      description: 'Free-text description',
      operators: [
        { key: 'contains', label: 'contains' },
        { key: 'startsWith', label: 'starts with' },
        { key: 'endsWith', label: 'ends with' },
        { key: 'like', label: 'like (pattern)' },
      ],
    },
  ],
}

export const StringFields: Story = {
  render: () => (
    <FilterBoxWithState
      schema={stringFieldsSchema}
      description="String fields support text comparison operators like equals, contains, starts with, ends with, and pattern matching."
    />
  ),
  parameters: {
    docs: {
      description: {
        story:
          'String fields with text operators: equals, not equals, contains, starts with, ends with, like.',
      },
    },
  },
}

// =============================================================================
// Number Fields
// =============================================================================

const numberFieldsSchema: FilterSchema = {
  fields: [
    {
      key: 'age',
      label: 'Age',
      type: 'number',
      description: 'Age in years',
      operators: getDefaultOperators('number'),
    },
    {
      key: 'price',
      label: 'Price',
      type: 'number',
      description: 'Product price',
      operators: [
        { key: 'eq', label: 'equals', symbol: '=' },
        { key: 'gt', label: 'greater than', symbol: '>' },
        { key: 'gte', label: 'at least', symbol: '≥' },
        { key: 'lt', label: 'less than', symbol: '<' },
        { key: 'lte', label: 'at most', symbol: '≤' },
        { key: 'between', label: 'between' },
      ],
    },
    {
      key: 'quantity',
      label: 'Quantity',
      type: 'number',
      description: 'Item quantity',
      operators: [
        { key: 'eq', label: 'is', symbol: '=' },
        { key: 'neq', label: 'is not', symbol: '≠' },
        { key: 'gt', label: '>', symbol: '>' },
        { key: 'lt', label: '<', symbol: '<' },
      ],
    },
  ],
}

export const NumberFields: Story = {
  render: () => (
    <FilterBoxWithState
      schema={numberFieldsSchema}
      description="Number fields support numeric comparison operators including equals, greater than, less than, and between."
    />
  ),
  parameters: {
    docs: {
      description: {
        story: 'Number fields with comparison operators: =, ≠, >, ≥, <, ≤, between.',
      },
    },
  },
}

// =============================================================================
// Date Fields
// =============================================================================

const dateFieldsSchema: FilterSchema = {
  fields: [
    {
      key: 'createdAt',
      label: 'Created At',
      type: 'date',
      description: 'Date the record was created',
      operators: getDefaultOperators('date'),
    },
    {
      key: 'startDate',
      label: 'Start Date',
      type: 'date',
      description: 'Start date of the event',
      operators: [
        { key: 'on', label: 'on', symbol: '=' },
        { key: 'after', label: 'after', symbol: '>' },
        { key: 'before', label: 'before', symbol: '<' },
      ],
    },
    {
      key: 'deadline',
      label: 'Deadline',
      type: 'date',
      description: 'Due date',
      operators: [
        { key: 'before', label: 'before' },
        { key: 'onOrBefore', label: 'on or before', symbol: '≤' },
        { key: 'between', label: 'between' },
      ],
    },
  ],
}

export const DateFields: Story = {
  render: () => (
    <FilterBoxWithState
      schema={dateFieldsSchema}
      description="Date fields support temporal comparison operators. Enter dates in ISO format (YYYY-MM-DD) or use preset values like 'Today'."
    />
  ),
  parameters: {
    docs: {
      description: {
        story:
          'Date fields with temporal operators: on, before, after, between. Supports date presets.',
      },
    },
  },
}

// =============================================================================
// DateTime Fields
// =============================================================================

const datetimeFieldsSchema: FilterSchema = {
  fields: [
    {
      key: 'lastLogin',
      label: 'Last Login',
      type: 'datetime',
      description: 'When the user last logged in',
      operators: getDefaultOperators('datetime'),
    },
    {
      key: 'scheduledFor',
      label: 'Scheduled For',
      type: 'datetime',
      description: 'Scheduled execution time',
      operators: [
        { key: 'before', label: 'before' },
        { key: 'after', label: 'after' },
      ],
    },
    {
      key: 'expiresAt',
      label: 'Expires At',
      type: 'datetime',
      description: 'Expiration timestamp',
      operators: [
        { key: 'before', label: 'expires before' },
        { key: 'after', label: 'expires after' },
      ],
    },
  ],
}

export const DateTimeFields: Story = {
  render: () => (
    <FilterBoxWithState
      schema={datetimeFieldsSchema}
      description="DateTime fields include both date and time components. Enter values in ISO format (YYYY-MM-DDTHH:mm:ss)."
    />
  ),
  parameters: {
    docs: {
      description: {
        story: 'DateTime fields for timestamp filtering with before/after operators.',
      },
    },
  },
}

// =============================================================================
// Boolean Fields
// =============================================================================

const booleanFieldsSchema: FilterSchema = {
  fields: [
    {
      key: 'isActive',
      label: 'Is Active',
      type: 'boolean',
      description: 'Whether the item is active',
      operators: getDefaultOperators('boolean'),
    },
    {
      key: 'isVerified',
      label: 'Is Verified',
      type: 'boolean',
      description: 'Verification status',
      operators: [{ key: 'is', label: 'is', symbol: '=' }],
    },
    {
      key: 'hasChildren',
      label: 'Has Children',
      type: 'boolean',
      description: 'Whether the item has child records',
      operators: [{ key: 'is', label: 'is', symbol: '=' }],
    },
  ],
}

export const BooleanFields: Story = {
  render: () => (
    <FilterBoxWithState
      schema={booleanFieldsSchema}
      description="Boolean fields allow filtering by true/false values. Select from the dropdown options."
    />
  ),
  parameters: {
    docs: {
      description: {
        story: 'Boolean fields with true/false value selection.',
      },
    },
  },
}

// =============================================================================
// Enum Fields
// =============================================================================

const enumFieldsSchema: FilterSchema = {
  fields: [
    {
      key: 'status',
      label: 'Status',
      type: 'enum',
      description: 'Current status',
      operators: [
        { key: 'eq', label: 'is', symbol: '=' },
        { key: 'neq', label: 'is not', symbol: '≠' },
        { key: 'in', label: 'is one of' },
      ],
    },
    {
      key: 'priority',
      label: 'Priority',
      type: 'enum',
      description: 'Task priority level',
      operators: [
        { key: 'eq', label: 'is', symbol: '=' },
        { key: 'gt', label: 'higher than' },
        { key: 'lt', label: 'lower than' },
      ],
    },
    {
      key: 'category',
      label: 'Category',
      type: 'enum',
      description: 'Item category',
      operators: [
        { key: 'eq', label: 'is', symbol: '=' },
        { key: 'in', label: 'in', symbol: '∈' },
        { key: 'notIn', label: 'not in', symbol: '∉' },
      ],
    },
  ],
}

export const EnumFields: Story = {
  render: () => (
    <FilterBoxWithState
      schema={enumFieldsSchema}
      description="Enum fields have predefined options. Use 'is', 'is not', or 'is one of' operators to filter by enumerated values."
    />
  ),
  parameters: {
    docs: {
      description: {
        story: 'Enum fields for selecting from predefined options: is, is not, in, not in.',
      },
    },
  },
}

// =============================================================================
// ID Fields
// =============================================================================

const idFieldsSchema: FilterSchema = {
  fields: [
    {
      key: 'userId',
      label: 'User ID',
      type: 'id',
      description: 'Unique user identifier',
      operators: getDefaultOperators('id'),
    },
    {
      key: 'orderId',
      label: 'Order ID',
      type: 'id',
      description: 'Order reference number',
      operators: [
        { key: 'eq', label: 'is', symbol: '=' },
        { key: 'in', label: 'in list' },
      ],
    },
    {
      key: 'transactionId',
      label: 'Transaction ID',
      type: 'id',
      description: 'Unique transaction identifier',
      operators: [{ key: 'eq', label: 'equals', symbol: '=' }],
    },
  ],
}

export const IdFields: Story = {
  render: () => (
    <FilterBoxWithState
      schema={idFieldsSchema}
      description="ID fields are typically for unique identifiers. They usually support exact match or list-based operators."
    />
  ),
  parameters: {
    docs: {
      description: {
        story: 'ID fields for unique identifiers with equals and in list operators.',
      },
    },
  },
}

// =============================================================================
// Custom Type Fields
// =============================================================================

const customFieldsSchema: FilterSchema = {
  fields: [
    {
      key: 'location',
      label: 'Location',
      type: 'custom',
      description: 'Geographic location',
      operators: [
        { key: 'near', label: 'near' },
        { key: 'within', label: 'within radius' },
        { key: 'in', label: 'in region' },
      ],
    },
    {
      key: 'tags',
      label: 'Tags',
      type: 'custom',
      description: 'Associated tags',
      operators: [
        { key: 'hasAny', label: 'has any of' },
        { key: 'hasAll', label: 'has all of' },
        { key: 'hasNone', label: 'has none of' },
      ],
    },
    {
      key: 'rating',
      label: 'Rating',
      type: 'custom',
      description: 'User rating (1-5 stars)',
      operators: [
        { key: 'eq', label: 'exactly', symbol: '★' },
        { key: 'gte', label: 'at least', symbol: '≥★' },
      ],
    },
  ],
}

export const CustomFields: Story = {
  render: () => (
    <FilterBoxWithState
      schema={customFieldsSchema}
      description="Custom type fields allow domain-specific operators for specialized data types like locations, tags, or ratings."
    />
  ),
  parameters: {
    docs: {
      description: {
        story: 'Custom field types with domain-specific operators for specialized use cases.',
      },
    },
  },
}

// =============================================================================
// Mixed Field Types
// =============================================================================

const mixedFieldsSchema: FilterSchema = {
  fields: [
    {
      key: 'name',
      label: 'Name',
      type: 'string',
      group: 'Basic Info',
      operators: getDefaultOperators('string').slice(0, 3),
    },
    {
      key: 'age',
      label: 'Age',
      type: 'number',
      group: 'Basic Info',
      operators: getDefaultOperators('number').slice(0, 4),
    },
    {
      key: 'status',
      label: 'Status',
      type: 'enum',
      group: 'Status',
      operators: [{ key: 'eq', label: 'is', symbol: '=' }],
    },
    {
      key: 'isActive',
      label: 'Active',
      type: 'boolean',
      group: 'Status',
      operators: [{ key: 'is', label: 'is', symbol: '=' }],
    },
    {
      key: 'createdAt',
      label: 'Created',
      type: 'date',
      group: 'Dates',
      operators: getDefaultOperators('date').slice(0, 3),
    },
    {
      key: 'lastLogin',
      label: 'Last Login',
      type: 'datetime',
      group: 'Dates',
      operators: [{ key: 'after', label: 'after' }],
    },
    {
      key: 'userId',
      label: 'User ID',
      type: 'id',
      group: 'IDs',
      operators: [{ key: 'eq', label: 'is', symbol: '=' }],
    },
  ],
}

export const MixedFieldTypes: Story = {
  render: () => (
    <FilterBoxWithState
      schema={mixedFieldsSchema}
      description="This example combines all field types in one schema, organized into groups."
    />
  ),
  parameters: {
    docs: {
      description: {
        story: 'A comprehensive schema with all field types organized into groups.',
      },
    },
  },
}
