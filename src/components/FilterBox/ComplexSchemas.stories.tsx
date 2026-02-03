import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState, useMemo } from 'react'
import { FilterBox } from './FilterBox'
import type { FilterSchema, FilterExpression, FieldConfig, OperatorConfig } from '@/types'
import { getDefaultOperators } from '@/types'

const meta = {
  title: 'Components/FilterBox/Complex Schemas',
  component: FilterBox,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Examples demonstrating complex schema configurations including mixed field types, custom operators per field, field groups, and large schemas.',
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
    <div style={{ maxWidth: '750px' }}>
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
          maxHeight: '200px',
        }}
      >
        {JSON.stringify(value, null, 2) || '[]'}
      </pre>
    </div>
  )
}

// =============================================================================
// Mixed Field Types
// =============================================================================

const mixedFieldTypesSchema: FilterSchema = {
  fields: [
    // String fields
    {
      key: 'name',
      label: 'Name',
      type: 'string',
      description: 'User full name',
      operators: getDefaultOperators('string'),
    },
    {
      key: 'email',
      label: 'Email',
      type: 'string',
      operators: [
        { key: 'eq', label: 'equals' },
        { key: 'contains', label: 'contains' },
        { key: 'endsWith', label: 'ends with' },
      ],
    },
    // Number fields
    {
      key: 'age',
      label: 'Age',
      type: 'number',
      operators: getDefaultOperators('number'),
    },
    {
      key: 'salary',
      label: 'Salary',
      type: 'number',
      operators: [
        { key: 'eq', label: 'equals' },
        { key: 'gt', label: 'greater than' },
        { key: 'lt', label: 'less than' },
        {
          key: 'between',
          label: 'between',
          multiValue: { count: 2, separator: ' and ', labels: ['Min', 'Max'] },
        },
      ],
    },
    // Date fields
    {
      key: 'createdAt',
      label: 'Created At',
      type: 'date',
      operators: getDefaultOperators('date'),
    },
    {
      key: 'lastLogin',
      label: 'Last Login',
      type: 'datetime',
      operators: [
        { key: 'before', label: 'before' },
        { key: 'after', label: 'after' },
        { key: 'today', label: 'is today', valueRequired: false },
      ],
    },
    // Boolean field
    {
      key: 'isActive',
      label: 'Is Active',
      type: 'boolean',
      operators: [{ key: 'eq', label: 'is', valueRequired: false }],
      valueAutocompleter: {
        getSuggestions: () => [
          { value: true, label: 'Yes', displayValue: 'Active' },
          { value: false, label: 'No', displayValue: 'Inactive' },
        ],
      },
    },
    // Enum field
    {
      key: 'status',
      label: 'Status',
      type: 'enum',
      operators: [
        { key: 'eq', label: 'is' },
        { key: 'neq', label: 'is not' },
        {
          key: 'in',
          label: 'in',
          multiValue: { count: -1, separator: ', ', labels: ['Status'] },
        },
      ],
      valueAutocompleter: {
        getSuggestions: () => [
          { value: 'active', label: 'Active' },
          { value: 'pending', label: 'Pending' },
          { value: 'suspended', label: 'Suspended' },
          { value: 'closed', label: 'Closed' },
        ],
      },
    },
  ],
}

export const MixedFieldTypes: Story = {
  render: () => (
    <FilterBoxWithState
      schema={mixedFieldTypesSchema}
      description="Schema combining string, number, date, datetime, boolean, and enum field types. Each type has appropriate operators and value inputs."
    />
  ),
  parameters: {
    docs: {
      description: {
        story:
          'Demonstrates a schema with multiple field types: string, number, date, datetime, boolean, and enum.',
      },
    },
  },
}

// =============================================================================
// Custom Operators Per Field
// =============================================================================

const customOperatorsSchema: FilterSchema = {
  fields: [
    {
      key: 'ip_address',
      label: 'IP Address',
      type: 'string',
      description: 'IPv4 or IPv6 address',
      operators: [
        { key: 'eq', label: 'equals' },
        { key: 'startsWith', label: 'starts with' },
        { key: 'inSubnet', label: 'in subnet', symbol: '∈' },
        { key: 'inRange', label: 'in IP range' },
      ],
    },
    {
      key: 'url',
      label: 'URL',
      type: 'string',
      description: 'Web URL',
      operators: [
        { key: 'eq', label: 'matches exactly' },
        { key: 'contains', label: 'contains' },
        { key: 'matchesDomain', label: 'matches domain' },
        { key: 'matchesPath', label: 'matches path pattern' },
      ],
    },
    {
      key: 'amount',
      label: 'Transaction Amount',
      type: 'number',
      operators: [
        { key: 'eq', label: 'equals', symbol: '=' },
        { key: 'gt', label: 'greater than', symbol: '>' },
        { key: 'gte', label: 'greater or equal', symbol: '≥' },
        { key: 'lt', label: 'less than', symbol: '<' },
        { key: 'lte', label: 'less or equal', symbol: '≤' },
        {
          key: 'between',
          label: 'between',
          symbol: '↔',
          multiValue: { count: 2, separator: ' - ', labels: ['From', 'To'] },
        },
        { key: 'percentile', label: 'above percentile' },
      ],
    },
    {
      key: 'timestamp',
      label: 'Event Time',
      type: 'datetime',
      operators: [
        { key: 'before', label: 'before' },
        { key: 'after', label: 'after' },
        { key: 'withinLast', label: 'within last (hours)' },
        { key: 'olderThan', label: 'older than (days)' },
        { key: 'onDate', label: 'on date', valueType: 'date' },
        { key: 'inTimeWindow', label: 'in time window' },
      ],
    },
    {
      key: 'text',
      label: 'Log Message',
      type: 'string',
      description: 'Full-text log search',
      operators: [
        { key: 'contains', label: 'contains' },
        { key: 'regex', label: 'matches regex', symbol: '~' },
        { key: 'fuzzy', label: 'fuzzy match', symbol: '≈' },
        { key: 'phrase', label: 'exact phrase' },
        { key: 'proximity', label: 'words within N' },
      ],
    },
  ],
}

export const CustomOperatorsPerField: Story = {
  render: () => (
    <FilterBoxWithState
      schema={customOperatorsSchema}
      description="Each field has domain-specific custom operators. IP addresses have subnet matching, URLs have domain matching, amounts have percentile filters, etc."
    />
  ),
  parameters: {
    docs: {
      description: {
        story:
          'Shows how different fields can have completely different sets of operators tailored to their data type and use case.',
      },
    },
  },
}

// =============================================================================
// Field Groups
// =============================================================================

const fieldGroupsSchema: FilterSchema = {
  fields: [
    // User Information Group
    {
      key: 'user_id',
      label: 'User ID',
      type: 'string',
      group: 'User Information',
      operators: [{ key: 'eq', label: 'equals' }],
    },
    {
      key: 'user_name',
      label: 'User Name',
      type: 'string',
      group: 'User Information',
      operators: getDefaultOperators('string'),
    },
    {
      key: 'user_email',
      label: 'User Email',
      type: 'string',
      group: 'User Information',
      operators: [
        { key: 'eq', label: 'equals' },
        { key: 'contains', label: 'contains' },
        { key: 'endsWith', label: 'ends with domain' },
      ],
    },
    {
      key: 'user_role',
      label: 'User Role',
      type: 'enum',
      group: 'User Information',
      operators: [
        { key: 'eq', label: 'is' },
        { key: 'in', label: 'in', multiValue: { count: -1, separator: ', ', labels: ['Role'] } },
      ],
      valueAutocompleter: {
        getSuggestions: () => [
          { value: 'admin', label: 'Administrator' },
          { value: 'editor', label: 'Editor' },
          { value: 'viewer', label: 'Viewer' },
          { value: 'guest', label: 'Guest' },
        ],
      },
    },

    // Order Details Group
    {
      key: 'order_id',
      label: 'Order ID',
      type: 'string',
      group: 'Order Details',
      operators: [{ key: 'eq', label: 'equals' }],
    },
    {
      key: 'order_total',
      label: 'Order Total',
      type: 'number',
      group: 'Order Details',
      operators: getDefaultOperators('number'),
    },
    {
      key: 'order_status',
      label: 'Order Status',
      type: 'enum',
      group: 'Order Details',
      operators: [
        { key: 'eq', label: 'is' },
        { key: 'neq', label: 'is not' },
      ],
      valueAutocompleter: {
        getSuggestions: () => [
          { value: 'pending', label: 'Pending' },
          { value: 'processing', label: 'Processing' },
          { value: 'shipped', label: 'Shipped' },
          { value: 'delivered', label: 'Delivered' },
          { value: 'cancelled', label: 'Cancelled' },
        ],
      },
    },
    {
      key: 'order_date',
      label: 'Order Date',
      type: 'date',
      group: 'Order Details',
      operators: getDefaultOperators('date'),
    },

    // Payment Group
    {
      key: 'payment_method',
      label: 'Payment Method',
      type: 'enum',
      group: 'Payment',
      operators: [{ key: 'eq', label: 'is' }],
      valueAutocompleter: {
        getSuggestions: () => [
          { value: 'credit_card', label: 'Credit Card' },
          { value: 'debit_card', label: 'Debit Card' },
          { value: 'paypal', label: 'PayPal' },
          { value: 'bank_transfer', label: 'Bank Transfer' },
          { value: 'crypto', label: 'Cryptocurrency' },
        ],
      },
    },
    {
      key: 'payment_status',
      label: 'Payment Status',
      type: 'enum',
      group: 'Payment',
      operators: [{ key: 'eq', label: 'is' }],
      valueAutocompleter: {
        getSuggestions: () => [
          { value: 'pending', label: 'Pending' },
          { value: 'completed', label: 'Completed' },
          { value: 'failed', label: 'Failed' },
          { value: 'refunded', label: 'Refunded' },
        ],
      },
    },

    // Shipping Group
    {
      key: 'shipping_country',
      label: 'Shipping Country',
      type: 'string',
      group: 'Shipping',
      operators: [
        { key: 'eq', label: 'is' },
        { key: 'in', label: 'in', multiValue: { count: -1, separator: ', ', labels: ['Country'] } },
      ],
    },
    {
      key: 'shipping_method',
      label: 'Shipping Method',
      type: 'enum',
      group: 'Shipping',
      operators: [{ key: 'eq', label: 'is' }],
      valueAutocompleter: {
        getSuggestions: () => [
          { value: 'standard', label: 'Standard' },
          { value: 'express', label: 'Express' },
          { value: 'overnight', label: 'Overnight' },
          { value: 'pickup', label: 'Store Pickup' },
        ],
      },
    },
    {
      key: 'estimated_delivery',
      label: 'Est. Delivery',
      type: 'date',
      group: 'Shipping',
      operators: [
        { key: 'before', label: 'before' },
        { key: 'after', label: 'after' },
      ],
    },
  ],
}

export const FieldGroups: Story = {
  render: () => (
    <FilterBoxWithState
      schema={fieldGroupsSchema}
      description="Fields organized into logical groups: User Information, Order Details, Payment, and Shipping. Groups help users find relevant fields quickly."
    />
  ),
  parameters: {
    docs: {
      description: {
        story:
          'Demonstrates field grouping for better organization. Fields are grouped by category and displayed in sections in the autocomplete dropdown.',
      },
    },
  },
}

// =============================================================================
// Large Schema (50+ Fields)
// =============================================================================

function generateLargeSchema(): FilterSchema {
  const fields: FieldConfig[] = []

  // Generate categorized fields
  const categories = [
    { name: 'Customer', prefix: 'customer', count: 8 },
    { name: 'Product', prefix: 'product', count: 10 },
    { name: 'Order', prefix: 'order', count: 8 },
    { name: 'Invoice', prefix: 'invoice', count: 6 },
    { name: 'Shipping', prefix: 'shipping', count: 6 },
    { name: 'Analytics', prefix: 'analytics', count: 8 },
    { name: 'System', prefix: 'system', count: 6 },
    { name: 'Metadata', prefix: 'meta', count: 8 },
  ]

  const fieldTypes: Array<{
    suffix: string
    type: FieldConfig['type']
    operators: OperatorConfig[]
  }> = [
    { suffix: 'id', type: 'string', operators: [{ key: 'eq', label: 'equals' }] },
    { suffix: 'name', type: 'string', operators: getDefaultOperators('string') },
    { suffix: 'count', type: 'number', operators: getDefaultOperators('number') },
    { suffix: 'amount', type: 'number', operators: getDefaultOperators('number') },
    { suffix: 'date', type: 'date', operators: getDefaultOperators('date') },
    {
      suffix: 'status',
      type: 'enum',
      operators: [
        { key: 'eq', label: 'is' },
        { key: 'neq', label: 'is not' },
      ],
    },
    {
      suffix: 'enabled',
      type: 'boolean',
      operators: [{ key: 'eq', label: 'is', valueRequired: false }],
    },
    {
      suffix: 'type',
      type: 'enum',
      operators: [{ key: 'eq', label: 'is' }],
    },
  ]

  for (const category of categories) {
    for (let i = 0; i < category.count; i++) {
      const fieldType = fieldTypes[i % fieldTypes.length]
      const key = `${category.prefix}_${fieldType.suffix}_${Math.floor(i / fieldTypes.length) + 1}`
      const label = `${category.name} ${fieldType.suffix.charAt(0).toUpperCase()}${fieldType.suffix.slice(1)} ${Math.floor(i / fieldTypes.length) + 1}`

      fields.push({
        key,
        label,
        type: fieldType.type,
        group: category.name,
        operators: fieldType.operators,
      })
    }
  }

  return { fields }
}

export const LargeSchema: Story = {
  render: () => {
    const schema = useMemo(() => generateLargeSchema(), [])
    return (
      <FilterBoxWithState
        schema={schema}
        description={`Large schema with ${schema.fields.length} fields across 8 categories. Tests autocomplete performance with many fields and virtual scrolling.`}
      />
    )
  },
  parameters: {
    docs: {
      description: {
        story:
          'A schema with 60+ fields to test performance and usability with large datasets. Uses virtual scrolling in the autocomplete dropdown.',
      },
    },
  },
}

// =============================================================================
// Nested Field Structure (Dot Notation)
// =============================================================================

const nestedFieldsSchema: FilterSchema = {
  fields: [
    {
      key: 'user.profile.firstName',
      label: 'User → Profile → First Name',
      type: 'string',
      group: 'User Profile',
      operators: getDefaultOperators('string'),
    },
    {
      key: 'user.profile.lastName',
      label: 'User → Profile → Last Name',
      type: 'string',
      group: 'User Profile',
      operators: getDefaultOperators('string'),
    },
    {
      key: 'user.profile.age',
      label: 'User → Profile → Age',
      type: 'number',
      group: 'User Profile',
      operators: getDefaultOperators('number'),
    },
    {
      key: 'user.settings.theme',
      label: 'User → Settings → Theme',
      type: 'enum',
      group: 'User Settings',
      operators: [{ key: 'eq', label: 'is' }],
      valueAutocompleter: {
        getSuggestions: () => [
          { value: 'light', label: 'Light' },
          { value: 'dark', label: 'Dark' },
          { value: 'system', label: 'System' },
        ],
      },
    },
    {
      key: 'user.settings.notifications.email',
      label: 'User → Settings → Notifications → Email',
      type: 'boolean',
      group: 'User Settings',
      operators: [{ key: 'eq', label: 'is', valueRequired: false }],
      valueAutocompleter: {
        getSuggestions: () => [
          { value: true, label: 'Enabled' },
          { value: false, label: 'Disabled' },
        ],
      },
    },
    {
      key: 'user.settings.notifications.push',
      label: 'User → Settings → Notifications → Push',
      type: 'boolean',
      group: 'User Settings',
      operators: [{ key: 'eq', label: 'is', valueRequired: false }],
      valueAutocompleter: {
        getSuggestions: () => [
          { value: true, label: 'Enabled' },
          { value: false, label: 'Disabled' },
        ],
      },
    },
    {
      key: 'order.items[].product.name',
      label: 'Order → Items → Product → Name',
      type: 'string',
      group: 'Order Items',
      operators: [
        { key: 'contains', label: 'contains' },
        { key: 'eq', label: 'equals' },
      ],
    },
    {
      key: 'order.items[].quantity',
      label: 'Order → Items → Quantity',
      type: 'number',
      group: 'Order Items',
      operators: getDefaultOperators('number'),
    },
    {
      key: 'order.shipping.address.country',
      label: 'Order → Shipping → Address → Country',
      type: 'string',
      group: 'Shipping Address',
      operators: [
        { key: 'eq', label: 'is' },
        { key: 'in', label: 'in', multiValue: { count: -1, separator: ', ', labels: ['Country'] } },
      ],
    },
    {
      key: 'order.shipping.address.postalCode',
      label: 'Order → Shipping → Address → Postal Code',
      type: 'string',
      group: 'Shipping Address',
      operators: [
        { key: 'eq', label: 'equals' },
        { key: 'startsWith', label: 'starts with' },
      ],
    },
  ],
}

export const NestedFieldStructure: Story = {
  render: () => (
    <FilterBoxWithState
      schema={nestedFieldsSchema}
      description="Fields with dot notation keys for nested data structures. Useful for filtering JSON documents or nested API responses."
    />
  ),
  parameters: {
    docs: {
      description: {
        story:
          'Demonstrates nested field keys using dot notation. Common for filtering nested JSON structures or document databases.',
      },
    },
  },
}

// =============================================================================
// Restricted Field Usage
// =============================================================================

const restrictedFieldsSchema: FilterSchema = {
  fields: [
    {
      key: 'id',
      label: 'ID',
      type: 'string',
      description: 'Can only be used once',
      operators: [{ key: 'eq', label: 'equals' }],
      allowMultiple: false,
    },
    {
      key: 'email',
      label: 'Email',
      type: 'string',
      description: 'Can only be used once',
      operators: [
        { key: 'eq', label: 'equals' },
        { key: 'contains', label: 'contains' },
      ],
      allowMultiple: false,
    },
    {
      key: 'tag',
      label: 'Tag',
      type: 'string',
      description: 'Can be used multiple times',
      operators: [{ key: 'eq', label: 'is' }],
      allowMultiple: true, // default
      valueAutocompleter: {
        getSuggestions: () => [
          { value: 'important', label: 'Important' },
          { value: 'urgent', label: 'Urgent' },
          { value: 'bug', label: 'Bug' },
          { value: 'feature', label: 'Feature' },
          { value: 'documentation', label: 'Documentation' },
        ],
      },
    },
    {
      key: 'status',
      label: 'Status',
      type: 'enum',
      description: 'Can be used multiple times with different operators',
      operators: [
        { key: 'eq', label: 'is' },
        { key: 'neq', label: 'is not' },
      ],
      allowMultiple: true,
      valueAutocompleter: {
        getSuggestions: () => [
          { value: 'open', label: 'Open' },
          { value: 'in_progress', label: 'In Progress' },
          { value: 'resolved', label: 'Resolved' },
          { value: 'closed', label: 'Closed' },
        ],
      },
    },
    {
      key: 'priority',
      label: 'Priority',
      type: 'enum',
      description: 'Unique - disappears after use',
      operators: [{ key: 'eq', label: 'is' }],
      allowMultiple: false,
      valueAutocompleter: {
        getSuggestions: () => [
          { value: 'low', label: 'Low' },
          { value: 'medium', label: 'Medium' },
          { value: 'high', label: 'High' },
          { value: 'critical', label: 'Critical' },
        ],
      },
    },
  ],
}

export const RestrictedFieldUsage: Story = {
  render: () => (
    <FilterBoxWithState
      schema={restrictedFieldsSchema}
      description="Some fields can only be used once (ID, Email, Priority), while others can be repeated (Tag, Status). Fields with allowMultiple: false disappear from the autocomplete after being used."
    />
  ),
  parameters: {
    docs: {
      description: {
        story:
          'Demonstrates the allowMultiple property. Fields like ID and email typically should only appear once, while tags can be added multiple times.',
      },
    },
  },
}

// =============================================================================
// Complex Validation Rules
// =============================================================================

const complexValidationSchema: FilterSchema = {
  fields: [
    {
      key: 'email',
      label: 'Email',
      type: 'string',
      operators: [{ key: 'eq', label: 'equals' }],
      validate: (value) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (typeof value !== 'string' || !emailRegex.test(value)) {
          return { valid: false, message: 'Please enter a valid email address' }
        }
        return { valid: true }
      },
    },
    {
      key: 'phone',
      label: 'Phone',
      type: 'string',
      operators: [{ key: 'eq', label: 'equals' }],
      validate: (value) => {
        const phoneRegex = /^\+?[\d\s-()]{10,}$/
        if (typeof value !== 'string' || !phoneRegex.test(value)) {
          return { valid: false, message: 'Please enter a valid phone number (10+ digits)' }
        }
        return { valid: true }
      },
    },
    {
      key: 'percentage',
      label: 'Percentage',
      type: 'number',
      operators: [
        { key: 'eq', label: 'equals' },
        { key: 'gt', label: 'greater than' },
        { key: 'lt', label: 'less than' },
      ],
      validate: (value) => {
        const num = Number(value)
        if (isNaN(num) || num < 0 || num > 100) {
          return { valid: false, message: 'Percentage must be between 0 and 100' }
        }
        return { valid: true }
      },
    },
    {
      key: 'url',
      label: 'URL',
      type: 'string',
      operators: [{ key: 'eq', label: 'equals' }],
      validate: (value) => {
        try {
          if (typeof value !== 'string') throw new Error()
          new URL(value)
          return { valid: true }
        } catch {
          return { valid: false, message: 'Please enter a valid URL (e.g., https://example.com)' }
        }
      },
    },
    {
      key: 'ipv4',
      label: 'IPv4 Address',
      type: 'string',
      operators: [{ key: 'eq', label: 'equals' }],
      validate: (value) => {
        const ipv4Regex = /^(\d{1,3}\.){3}\d{1,3}$/
        if (typeof value !== 'string' || !ipv4Regex.test(value)) {
          return { valid: false, message: 'Please enter a valid IPv4 address (e.g., 192.168.1.1)' }
        }
        const parts = value.split('.').map(Number)
        if (parts.some((p) => p < 0 || p > 255)) {
          return { valid: false, message: 'Each IPv4 octet must be between 0 and 255' }
        }
        return { valid: true }
      },
    },
    {
      key: 'creditCard',
      label: 'Credit Card',
      type: 'string',
      operators: [{ key: 'eq', label: 'equals' }],
      validate: (value) => {
        if (typeof value !== 'string') {
          return { valid: false, message: 'Invalid credit card number' }
        }
        // Simple Luhn check (simplified)
        const digits = value.replace(/\D/g, '')
        if (digits.length < 13 || digits.length > 19) {
          return { valid: false, message: 'Credit card must be 13-19 digits' }
        }
        return { valid: true }
      },
    },
  ],
}

export const ComplexValidation: Story = {
  render: () => (
    <FilterBoxWithState
      schema={complexValidationSchema}
      description="Each field has custom validation: email format, phone number format, percentage range (0-100), URL format, IPv4 address format, and credit card length validation."
    />
  ),
  parameters: {
    docs: {
      description: {
        story:
          'Demonstrates field-level validation with custom validate functions. Each field has specific validation rules appropriate to its data type.',
      },
    },
  },
}

// =============================================================================
// Dynamic Schema Generation
// =============================================================================

function DynamicSchemaDemo() {
  const [fieldCount, setFieldCount] = useState(5)

  const schema = useMemo<FilterSchema>(() => {
    const fields: FieldConfig[] = []
    for (let i = 1; i <= fieldCount; i++) {
      fields.push({
        key: `field_${i}`,
        label: `Dynamic Field ${i}`,
        type: i % 3 === 0 ? 'number' : i % 2 === 0 ? 'enum' : 'string',
        operators:
          i % 3 === 0
            ? getDefaultOperators('number')
            : i % 2 === 0
              ? [
                  { key: 'eq', label: 'is' },
                  { key: 'neq', label: 'is not' },
                ]
              : getDefaultOperators('string'),
        ...(i % 2 === 0 && {
          valueAutocompleter: {
            getSuggestions: () => [
              { value: `option_${i}_a`, label: `Option ${i}-A` },
              { value: `option_${i}_b`, label: `Option ${i}-B` },
              { value: `option_${i}_c`, label: `Option ${i}-C` },
            ],
          },
        }),
      })
    }
    return { fields }
  }, [fieldCount])

  const [value, setValue] = useState<FilterExpression[]>([])

  return (
    <div style={{ maxWidth: '750px' }}>
      <div style={{ marginBottom: '1rem' }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          Number of fields:
          <input
            type="range"
            min={1}
            max={20}
            value={fieldCount}
            onChange={(e) => setFieldCount(Number(e.target.value))}
            style={{ flex: 1 }}
          />
          <span style={{ minWidth: '2em' }}>{fieldCount}</span>
        </label>
      </div>
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

export const DynamicSchema: Story = {
  render: () => <DynamicSchemaDemo />,
  parameters: {
    docs: {
      description: {
        story:
          'Schema generated dynamically based on runtime configuration. Use the slider to change the number of fields. Demonstrates that schemas can be built programmatically.',
      },
    },
  },
}

// =============================================================================
// Schema with Icons
// =============================================================================

const schemaWithIcons: FilterSchema = {
  fields: [
    {
      key: 'user',
      label: 'User',
      type: 'string',
      icon: '👤',
      operators: getDefaultOperators('string'),
    },
    {
      key: 'email',
      label: 'Email',
      type: 'string',
      icon: '📧',
      operators: [
        { key: 'eq', label: 'equals' },
        { key: 'contains', label: 'contains' },
      ],
    },
    {
      key: 'phone',
      label: 'Phone',
      type: 'string',
      icon: '📱',
      operators: [{ key: 'eq', label: 'equals' }],
    },
    {
      key: 'location',
      label: 'Location',
      type: 'string',
      icon: '📍',
      operators: [
        { key: 'eq', label: 'is' },
        { key: 'contains', label: 'contains' },
      ],
    },
    {
      key: 'date',
      label: 'Date',
      type: 'date',
      icon: '📅',
      operators: getDefaultOperators('date'),
    },
    {
      key: 'time',
      label: 'Time',
      type: 'datetime',
      icon: '⏰',
      operators: [
        { key: 'before', label: 'before' },
        { key: 'after', label: 'after' },
      ],
    },
    {
      key: 'status',
      label: 'Status',
      type: 'enum',
      icon: '🏷️',
      operators: [{ key: 'eq', label: 'is' }],
      valueAutocompleter: {
        getSuggestions: () => [
          { value: 'active', label: '🟢 Active' },
          { value: 'pending', label: '🟡 Pending' },
          { value: 'inactive', label: '🔴 Inactive' },
        ],
      },
    },
    {
      key: 'priority',
      label: 'Priority',
      type: 'enum',
      icon: '⚡',
      operators: [{ key: 'eq', label: 'is' }],
      valueAutocompleter: {
        getSuggestions: () => [
          { value: 'low', label: '🔵 Low' },
          { value: 'medium', label: '🟠 Medium' },
          { value: 'high', label: '🔴 High' },
        ],
      },
    },
  ],
}

export const SchemaWithIcons: Story = {
  render: () => (
    <FilterBoxWithState
      schema={schemaWithIcons}
      description="Fields decorated with emoji icons for quick visual identification. Icons can be any ReactNode, including custom SVG components."
    />
  ),
  parameters: {
    docs: {
      description: {
        story:
          'Demonstrates field icons for visual identification. Icons help users quickly scan and find the field they need.',
      },
    },
  },
}

// =============================================================================
// Custom Connectors
// =============================================================================

const customConnectorsSchema: FilterSchema = {
  fields: [
    {
      key: 'status',
      label: 'Status',
      type: 'enum',
      operators: [{ key: 'eq', label: 'is', symbol: '=' }],
    },
    {
      key: 'priority',
      label: 'Priority',
      type: 'enum',
      operators: [{ key: 'eq', label: 'is', symbol: '=' }],
    },
    {
      key: 'assignee',
      label: 'Assignee',
      type: 'string',
      operators: [{ key: 'eq', label: 'equals', symbol: '=' }],
    },
  ],
  connectors: [
    { key: 'AND', label: 'All' },
    { key: 'OR', label: 'Any' },
  ],
}

const symbolConnectorsSchema: FilterSchema = {
  fields: [
    {
      key: 'category',
      label: 'Category',
      type: 'string',
      operators: [{ key: 'eq', label: 'equals', symbol: '=' }],
    },
    {
      key: 'price',
      label: 'Price',
      type: 'number',
      operators: [{ key: 'gt', label: 'greater than', symbol: '>' }],
    },
  ],
  connectors: [
    { key: 'AND', label: '&' },
    { key: 'OR', label: '|' },
  ],
}

export const CustomConnectors: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', maxWidth: '750px' }}>
      <div>
        <h3 style={{ fontSize: '16px', marginBottom: '0.5rem' }}>Word-based Connectors</h3>
        <p style={{ marginBottom: '1rem', color: '#666', fontSize: '14px' }}>
          Using "All" and "Any" instead of "AND" and "OR". Notice the placeholder updates to "All
          or Any?" when selecting connectors.
        </p>
        <FilterBoxWithState schema={customConnectorsSchema} />
      </div>

      <div>
        <h3 style={{ fontSize: '16px', marginBottom: '0.5rem' }}>Symbol Connectors</h3>
        <p style={{ marginBottom: '1rem', color: '#666', fontSize: '14px' }}>
          Using "&" and "|" symbols. The placeholder shows "& or |?" to reflect the custom labels.
        </p>
        <FilterBoxWithState schema={symbolConnectorsSchema} />
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: `
Custom connector labels allow you to use alternative terminology that better matches your domain or user base.
The placeholder text dynamically reflects the connector labels you provide in the schema.

Default connectors are \`AND\` and \`OR\`, but you can customize them:

\`\`\`typescript
const schema: FilterSchema = {
  fields: [...],
  connectors: [
    { key: 'AND', label: 'All' },
    { key: 'OR', label: 'Any' },
  ],
}
\`\`\`

The connector placeholder will automatically update from "AND or OR?" to match your custom labels.
        `,
      },
    },
  },
}
