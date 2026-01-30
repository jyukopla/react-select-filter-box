import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'
import { FilterBox } from './FilterBox'
import type { FilterSchema, FilterExpression } from '@/types'
import { getDefaultOperators } from '@/types'

const meta = {
  title: 'Components/FilterBox',
  component: FilterBox,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof FilterBox>

export default meta
type Story = StoryObj<typeof meta>

const basicSchema: FilterSchema = {
  fields: [
    {
      key: 'status',
      label: 'Status',
      type: 'enum',
      operators: [
        { key: 'eq', label: 'is', symbol: '=' },
        { key: 'neq', label: 'is not', symbol: '!=' },
      ],
    },
    {
      key: 'name',
      label: 'Name',
      type: 'string',
      operators: getDefaultOperators('string'),
    },
    {
      key: 'age',
      label: 'Age',
      type: 'number',
      operators: getDefaultOperators('number'),
    },
    {
      key: 'createdAt',
      label: 'Created At',
      type: 'date',
      operators: getDefaultOperators('date'),
    },
    {
      key: 'isActive',
      label: 'Is Active',
      type: 'boolean',
      operators: getDefaultOperators('boolean'),
    },
  ],
}

function FilterBoxWithState(props: { schema: FilterSchema }) {
  const [value, setValue] = useState<FilterExpression[]>([])
  return (
    <div style={{ maxWidth: '600px' }}>
      <FilterBox schema={props.schema} value={value} onChange={setValue} />
      <pre style={{ marginTop: '1rem', fontSize: '12px', background: '#f5f5f5', padding: '1rem' }}>
        {JSON.stringify(value, null, 2)}
      </pre>
    </div>
  )
}

export const Default: Story = {
  render: () => <FilterBoxWithState schema={basicSchema} />,
}

export const WithExistingValue: Story = {
  args: {
    schema: basicSchema,
    value: [
      {
        condition: {
          field: { key: 'status', label: 'Status', type: 'enum' },
          operator: { key: 'eq', label: 'is', symbol: '=' },
          value: { raw: 'active', display: 'active', serialized: 'active' },
        },
      },
      {
        condition: {
          field: { key: 'name', label: 'Name', type: 'string' },
          operator: { key: 'contains', label: 'contains' },
          value: { raw: 'John', display: 'John', serialized: 'John' },
        },
        connector: 'AND',
      },
    ],
    onChange: () => {},
  },
}

export const Disabled: Story = {
  args: {
    schema: basicSchema,
    value: [
      {
        condition: {
          field: { key: 'status', label: 'Status', type: 'enum' },
          operator: { key: 'eq', label: 'is', symbol: '=' },
          value: { raw: 'active', display: 'active', serialized: 'active' },
        },
      },
    ],
    onChange: () => {},
    disabled: true,
  },
}

export const Empty: Story = {
  args: {
    schema: basicSchema,
    value: [],
    onChange: () => {},
  },
}

const processEngineSchema: FilterSchema = {
  fields: [
    {
      key: 'processDefinitionKey',
      label: 'Process Definition',
      type: 'string',
      description: 'The process definition key',
      operators: [
        { key: 'eq', label: 'equals', symbol: '=' },
        { key: 'like', label: 'like' },
      ],
    },
    {
      key: 'state',
      label: 'State',
      type: 'enum',
      description: 'Instance state',
      operators: [
        { key: 'eq', label: 'is', symbol: '=' },
        { key: 'in', label: 'is one of' },
      ],
    },
    {
      key: 'startDate',
      label: 'Start Date',
      type: 'date',
      description: 'When the process started',
      operators: [
        { key: 'after', label: 'after', symbol: '>' },
        { key: 'before', label: 'before', symbol: '<' },
        { key: 'between', label: 'between' },
      ],
    },
    {
      key: 'businessKey',
      label: 'Business Key',
      type: 'string',
      description: 'Business correlation key',
      operators: [
        { key: 'eq', label: 'equals', symbol: '=' },
        { key: 'like', label: 'like' },
      ],
    },
    {
      key: 'tenantId',
      label: 'Tenant ID',
      type: 'id',
      description: 'Multi-tenant identifier',
      operators: [
        { key: 'eq', label: 'is', symbol: '=' },
        { key: 'in', label: 'is one of' },
      ],
    },
  ],
}

export const ProcessEngine: Story = {
  render: () => <FilterBoxWithState schema={processEngineSchema} />,
}

// Grouped fields example
const groupedFieldsSchema: FilterSchema = {
  fields: [
    // Basic fields group
    {
      key: 'name',
      label: 'Name',
      type: 'string',
      group: 'Basic',
      operators: getDefaultOperators('string'),
    },
    {
      key: 'email',
      label: 'Email',
      type: 'string',
      group: 'Basic',
      operators: getDefaultOperators('string'),
    },
    {
      key: 'status',
      label: 'Status',
      type: 'enum',
      group: 'Basic',
      operators: [
        { key: 'eq', label: 'is', symbol: '=' },
        { key: 'neq', label: 'is not', symbol: '!=' },
      ],
    },
    // Date fields group
    {
      key: 'createdAt',
      label: 'Created At',
      type: 'date',
      group: 'Dates',
      operators: getDefaultOperators('date'),
    },
    {
      key: 'updatedAt',
      label: 'Updated At',
      type: 'date',
      group: 'Dates',
      operators: getDefaultOperators('date'),
    },
    {
      key: 'deletedAt',
      label: 'Deleted At',
      type: 'date',
      group: 'Dates',
      operators: getDefaultOperators('date'),
    },
    // Numeric fields group
    {
      key: 'age',
      label: 'Age',
      type: 'number',
      group: 'Numbers',
      operators: getDefaultOperators('number'),
    },
    {
      key: 'salary',
      label: 'Salary',
      type: 'number',
      group: 'Numbers',
      operators: getDefaultOperators('number'),
    },
  ],
}

export const GroupedFields: Story = {
  render: () => <FilterBoxWithState schema={groupedFieldsSchema} />,
}

// Large schema example (many fields)
const largeSchema: FilterSchema = {
  fields: Array.from({ length: 30 }, (_, i) => ({
    key: `field${i + 1}`,
    label: `Field ${i + 1}`,
    type: 'string' as const,
    group: `Group ${Math.floor(i / 10) + 1}`,
    operators: [
      { key: 'eq', label: 'equals', symbol: '=' },
      { key: 'contains', label: 'contains' },
    ],
  })),
}

export const LargeSchema: Story = {
  render: () => <FilterBoxWithState schema={largeSchema} />,
}

// Import dark theme styles
import '@/styles/themes/dark.css'

function DarkThemeFilterBox(props: { schema: FilterSchema }) {
  const [value, setValue] = useState<FilterExpression[]>([])
  return (
    <div data-theme="dark" style={{ 
      maxWidth: '600px', 
      padding: '2rem', 
      background: '#1e1e1e',
      borderRadius: '8px',
      color: '#e0e0e0',
    }}>
      <FilterBox schema={props.schema} value={value} onChange={setValue} />
      <pre style={{ 
        marginTop: '1rem', 
        fontSize: '12px', 
        background: '#2d2d2d', 
        padding: '1rem',
        borderRadius: '4px',
        color: '#90caf9',
      }}>
        {JSON.stringify(value, null, 2)}
      </pre>
    </div>
  )
}

export const DarkTheme: Story = {
  render: () => <DarkThemeFilterBox schema={basicSchema} />,
  parameters: {
    backgrounds: { default: 'dark' },
  },
}

function AutoFocusFilterBox(props: { schema: FilterSchema }) {
  const [value, setValue] = useState<FilterExpression[]>([])
  return (
    <div style={{ maxWidth: '600px' }}>
      <p style={{ marginBottom: '0.5rem', color: '#666' }}>
        The filter box is focused automatically on mount.
      </p>
      <FilterBox schema={props.schema} value={value} onChange={setValue} autoFocus />
    </div>
  )
}

export const AutoFocus: Story = {
  render: () => <AutoFocusFilterBox schema={basicSchema} />,
}

// Horizontal scrolling demo with narrow container and many tokens
function HorizontalScrollFilterBox(props: { schema: FilterSchema }) {
  const [value, setValue] = useState<FilterExpression[]>([
    {
      condition: {
        field: { key: 'status', label: 'Status', type: 'enum' },
        operator: { key: 'eq', label: 'is', symbol: '=' },
        value: { raw: 'active', display: 'Active', serialized: 'active' },
      },
      connector: 'AND',
    },
    {
      condition: {
        field: { key: 'name', label: 'Name', type: 'string' },
        operator: { key: 'contains', label: 'contains' },
        value: { raw: 'John', display: 'John', serialized: 'John' },
      },
      connector: 'AND',
    },
    {
      condition: {
        field: { key: 'age', label: 'Age', type: 'number' },
        operator: { key: 'gt', label: 'greater than', symbol: '>' },
        value: { raw: 25, display: '25', serialized: '25' },
      },
      connector: 'OR',
    },
    {
      condition: {
        field: { key: 'createdAt', label: 'Created At', type: 'date' },
        operator: { key: 'after', label: 'after', symbol: '>' },
        value: { raw: '2024-01-01', display: '2024-01-01', serialized: '2024-01-01' },
      },
    },
  ])
  return (
    <div style={{ maxWidth: '350px' }}>
      <p style={{ marginBottom: '0.5rem', color: '#666', fontSize: '14px' }}>
        Container width is limited to 350px. Scroll horizontally to see all tokens.
      </p>
      <FilterBox schema={props.schema} value={value} onChange={setValue} />
      <pre style={{ marginTop: '1rem', fontSize: '12px', background: '#f5f5f5', padding: '1rem' }}>
        {JSON.stringify(value, null, 2)}
      </pre>
    </div>
  )
}

export const HorizontalScroll: Story = {
  render: () => <HorizontalScrollFilterBox schema={basicSchema} />,
}

// Token Editing Story
function TokenEditingFilterBox(props: { schema: FilterSchema }) {
  const [value, setValue] = useState<FilterExpression[]>([
    {
      condition: {
        field: { key: 'name', label: 'Name', type: 'string' },
        operator: { key: 'contains', label: 'contains' },
        value: { raw: 'Click me to edit', display: 'Click me to edit', serialized: 'Click me to edit' },
      },
    },
    {
      condition: {
        field: { key: 'status', label: 'Status', type: 'enum' },
        operator: { key: 'eq', label: 'is', symbol: '=' },
        value: { raw: 'active', display: 'active', serialized: 'active' },
      },
      connector: 'AND',
    },
  ])
  return (
    <div style={{ maxWidth: '600px' }}>
      <p style={{ marginBottom: '0.5rem', color: '#666', fontSize: '14px' }}>
        <strong>Click on any value token</strong> (green chips) to edit it inline. 
        Press <kbd>Enter</kbd> to confirm or <kbd>Escape</kbd> to cancel.
      </p>
      <FilterBox schema={props.schema} value={value} onChange={setValue} />
      <pre style={{ marginTop: '1rem', fontSize: '12px', background: '#f5f5f5', padding: '1rem' }}>
        {JSON.stringify(value, null, 2)}
      </pre>
    </div>
  )
}

export const TokenEditing: Story = {
  render: () => <TokenEditingFilterBox schema={basicSchema} />,
}
