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

// Note: DarkTheme and other theme-related stories are in Theming.stories.tsx

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

// Keyboard Navigation Story
function KeyboardNavigationFilterBox(props: { schema: FilterSchema }) {
  const [value, setValue] = useState<FilterExpression[]>([
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
  ])
  return (
    <div style={{ maxWidth: '600px' }}>
      <h4 style={{ marginBottom: '1rem' }}>Keyboard Shortcuts</h4>
      <div style={{ marginBottom: '1rem', fontSize: '14px', color: '#666' }}>
        <ul style={{ margin: 0, paddingLeft: '1.2rem', lineHeight: 1.8 }}>
          <li><kbd>↑</kbd> / <kbd>↓</kbd> - Navigate dropdown items</li>
          <li><kbd>Enter</kbd> - Select highlighted item or confirm value</li>
          <li><kbd>Tab</kbd> - Select highlighted item (when dropdown open)</li>
          <li><kbd>Escape</kbd> - Close dropdown</li>
          <li><kbd>←</kbd> / <kbd>→</kbd> - Navigate between tokens (when input is empty)</li>
          <li><kbd>Delete</kbd> - Delete selected token</li>
          <li><kbd>Ctrl+A</kbd> - Select all tokens</li>
          <li><kbd>Ctrl+Backspace</kbd> - Delete all expressions</li>
        </ul>
      </div>
      <FilterBox schema={props.schema} value={value} onChange={setValue} autoFocus />
      <pre style={{ marginTop: '1rem', fontSize: '12px', background: '#f5f5f5', padding: '1rem' }}>
        {JSON.stringify(value, null, 2)}
      </pre>
    </div>
  )
}

export const KeyboardNavigation: Story = {
  render: () => <KeyboardNavigationFilterBox schema={basicSchema} />,
}

// Camunda Process Instance Filter - Real-world example
const camundaProcessInstanceSchema: FilterSchema = {
  fields: [
    {
      key: 'processInstanceId',
      label: 'Process Instance ID',
      type: 'id',
      description: 'Unique process instance identifier',
      operators: [{ key: 'eq', label: 'equals', symbol: '=' }],
    },
    {
      key: 'processInstanceBusinessKey',
      label: 'Business Key',
      type: 'string',
      description: 'Business correlation key',
      operators: [
        { key: 'eq', label: 'equals', symbol: '=' },
        { key: 'like', label: 'like' },
      ],
    },
    {
      key: 'processDefinitionKey',
      label: 'Process Definition',
      type: 'enum',
      group: 'Process',
      description: 'The process definition key',
      operators: [
        { key: 'eq', label: 'is', symbol: '=' },
        { key: 'in', label: 'in' },
      ],
    },
    {
      key: 'state',
      label: 'State',
      type: 'enum',
      group: 'Status',
      description: 'Current state of the process instance',
      operators: [{ key: 'eq', label: 'is', symbol: '=' }],
    },
    {
      key: 'startedBefore',
      label: 'Started Before',
      type: 'datetime',
      group: 'Dates',
      operators: [{ key: 'before', label: 'before', symbol: '<' }],
    },
    {
      key: 'startedAfter',
      label: 'Started After',
      type: 'datetime',
      group: 'Dates',
      operators: [{ key: 'after', label: 'after', symbol: '>' }],
    },
    {
      key: 'finishedBefore',
      label: 'Finished Before',
      type: 'datetime',
      group: 'Dates',
      operators: [{ key: 'before', label: 'before', symbol: '<' }],
    },
    {
      key: 'finishedAfter',
      label: 'Finished After',
      type: 'datetime',
      group: 'Dates',
      operators: [{ key: 'after', label: 'after', symbol: '>' }],
    },
    {
      key: 'startedBy',
      label: 'Started By',
      type: 'string',
      group: 'Users',
      description: 'User who started the process',
      operators: [{ key: 'eq', label: 'equals', symbol: '=' }],
    },
    {
      key: 'tenantId',
      label: 'Tenant',
      type: 'enum',
      group: 'Multi-tenancy',
      operators: [
        { key: 'eq', label: 'is', symbol: '=' },
        { key: 'in', label: 'in' },
      ],
    },
    {
      key: 'withIncidents',
      label: 'Has Incidents',
      type: 'boolean',
      group: 'Incidents',
      operators: [{ key: 'is', label: 'is', symbol: '=' }],
    },
    {
      key: 'incidentType',
      label: 'Incident Type',
      type: 'enum',
      group: 'Incidents',
      operators: [{ key: 'eq', label: 'is', symbol: '=' }],
    },
  ],
}

function CamundaProcessInstanceFilterBox() {
  const [value, setValue] = useState<FilterExpression[]>([
    {
      condition: {
        field: { key: 'state', label: 'State', type: 'enum' },
        operator: { key: 'eq', label: 'is', symbol: '=' },
        value: { raw: 'ACTIVE', display: 'Active', serialized: 'ACTIVE' },
      },
    },
  ])

  return (
    <div style={{ maxWidth: '700px' }}>
      <h3 style={{ marginBottom: '0.5rem' }}>Camunda 7 Process Instance Filter</h3>
      <p style={{ marginBottom: '1rem', color: '#666', fontSize: '14px' }}>
        A real-world example demonstrating how to filter process instances in Camunda 7.
        Fields are grouped by category for easier navigation.
      </p>
      <FilterBox schema={camundaProcessInstanceSchema} value={value} onChange={setValue} />
      <details style={{ marginTop: '1rem' }}>
        <summary style={{ cursor: 'pointer', color: '#666', fontSize: '14px' }}>
          Show filter expressions JSON
        </summary>
        <pre style={{ marginTop: '0.5rem', fontSize: '12px', background: '#f5f5f5', padding: '1rem' }}>
          {JSON.stringify(value, null, 2)}
        </pre>
      </details>
    </div>
  )
}

export const CamundaProcessInstance: Story = {
  render: () => <CamundaProcessInstanceFilterBox />,
  parameters: {
    docs: {
      description: {
        story: 'A comprehensive example showing how to configure the FilterBox for Camunda 7 process instance queries, with grouped fields and various data types.',
      },
    },
  },
}

// Clear Button Story
function ClearButtonFilterBox(props: { schema: FilterSchema }) {
  const [value, setValue] = useState<FilterExpression[]>([
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
  ])

  return (
    <div style={{ maxWidth: '600px' }}>
      <p style={{ marginBottom: '0.5rem', color: '#666', fontSize: '14px' }}>
        <strong>Click the × button</strong> to clear all filters at once.
        The button only appears when there are filters and the component is not disabled.
      </p>
      <FilterBox schema={props.schema} value={value} onChange={setValue} showClearButton />
      <pre style={{ marginTop: '1rem', fontSize: '12px', background: '#f5f5f5', padding: '1rem' }}>
        {JSON.stringify(value, null, 2)}
      </pre>
    </div>
  )
}

export const ClearButton: Story = {
  render: () => <ClearButtonFilterBox schema={basicSchema} />,
}

// External Value Updates - demonstrating controlled component behavior
function ExternalValueUpdatesFilterBox(props: { schema: FilterSchema }) {
  const [value, setValue] = useState<FilterExpression[]>([])

  const addStatusFilter = () => {
    setValue([
      ...value,
      {
        condition: {
          field: { key: 'status', label: 'Status', type: 'enum' },
          operator: { key: 'eq', label: 'is', symbol: '=' },
          value: { raw: 'active', display: 'active', serialized: 'active' },
        },
        connector: value.length > 0 ? 'AND' : undefined,
      },
    ])
  }

  const addNameFilter = () => {
    setValue([
      ...value,
      {
        condition: {
          field: { key: 'name', label: 'Name', type: 'string' },
          operator: { key: 'contains', label: 'contains' },
          value: { raw: 'test', display: 'test', serialized: 'test' },
        },
        connector: value.length > 0 ? 'OR' : undefined,
      },
    ])
  }

  const clearFilters = () => {
    setValue([])
  }

  return (
    <div style={{ maxWidth: '600px' }}>
      <p style={{ marginBottom: '1rem', color: '#666', fontSize: '14px' }}>
        Click the buttons below to add filters programmatically, demonstrating 
        that the FilterBox is a controlled component.
      </p>
      <div style={{ marginBottom: '1rem', display: 'flex', gap: '0.5rem' }}>
        <button onClick={addStatusFilter} style={{ padding: '0.5rem 1rem', cursor: 'pointer' }}>
          Add Status Filter
        </button>
        <button onClick={addNameFilter} style={{ padding: '0.5rem 1rem', cursor: 'pointer' }}>
          Add Name Filter
        </button>
        <button onClick={clearFilters} style={{ padding: '0.5rem 1rem', cursor: 'pointer' }}>
          Clear All
        </button>
      </div>
      <FilterBox schema={props.schema} value={value} onChange={setValue} />
      <pre style={{ marginTop: '1rem', fontSize: '12px', background: '#f5f5f5', padding: '1rem' }}>
        {JSON.stringify(value, null, 2)}
      </pre>
    </div>
  )
}

export const ExternalValueUpdates: Story = {
  render: () => <ExternalValueUpdatesFilterBox schema={basicSchema} />,
  parameters: {
    docs: {
      description: {
        story: 'Demonstrates how FilterBox responds to external value updates, confirming it works as a controlled component.',
      },
    },
  },
}

// All Token Types Story
function AllTokenTypesFilterBox(props: { schema: FilterSchema }) {
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
      connector: 'OR',
    },
    {
      condition: {
        field: { key: 'age', label: 'Age', type: 'number' },
        operator: { key: 'gt', label: 'greater than', symbol: '>' },
        value: { raw: 25, display: '25', serialized: '25' },
      },
    },
  ])

  return (
    <div style={{ maxWidth: '700px' }}>
      <h4 style={{ marginBottom: '0.5rem' }}>All Token Types Display</h4>
      <div style={{ marginBottom: '1rem', fontSize: '14px', color: '#666' }}>
        <p>This example shows all four token types with their distinct colors:</p>
        <ul style={{ margin: '0.5rem 0', paddingLeft: '1.2rem', lineHeight: 1.8 }}>
          <li><span style={{ color: '#1565c0' }}>■ Field tokens</span> (blue) - the field being filtered</li>
          <li><span style={{ color: '#c2185b' }}>■ Operator tokens</span> (pink) - the comparison operator</li>
          <li><span style={{ color: '#2e7d32' }}>■ Value tokens</span> (green) - the filter value (editable!)</li>
          <li><span style={{ color: '#e65100' }}>■ Connector tokens</span> (orange) - AND/OR connectors</li>
        </ul>
      </div>
      <FilterBox schema={props.schema} value={value} onChange={setValue} />
    </div>
  )
}

export const AllTokenTypes: Story = {
  render: () => <AllTokenTypesFilterBox schema={basicSchema} />,
  parameters: {
    docs: {
      description: {
        story: 'Shows all four token types (field, operator, value, connector) with their distinct color coding.',
      },
    },
  },
}

// Pending Token Preview Story
function PendingTokenPreviewFilterBox() {
  const [value, setValue] = useState<FilterExpression[]>([])

  return (
    <div style={{ maxWidth: '700px' }}>
      <h4 style={{ marginBottom: '0.5rem' }}>Incomplete Expression Preview</h4>
      <div style={{ marginBottom: '1rem', fontSize: '14px', color: '#666' }}>
        <p>As you build a filter expression, pending tokens are shown with a dashed border and subtle pulsing animation:</p>
        <ol style={{ margin: '0.5rem 0', paddingLeft: '1.2rem', lineHeight: 1.8 }}>
          <li>Click the filter box and select a field - see the pending field token appear</li>
          <li>Select an operator - both field and operator show as pending</li>
          <li>Enter a value and press Enter - tokens become solid (completed)</li>
        </ol>
        <p style={{ fontStyle: 'italic', marginTop: '8px' }}>
          This preview helps users understand what they&apos;re building before committing the expression.
        </p>
      </div>
      <FilterBox schema={basicSchema} value={value} onChange={setValue} />
    </div>
  )
}

export const PendingTokenPreview: Story = {
  render: () => <PendingTokenPreviewFilterBox />,
  parameters: {
    docs: {
      description: {
        story: `
Demonstrates the **incomplete expression preview** feature. 

As users build filter expressions step by step, pending tokens are displayed with:
- **Dashed borders** to indicate incomplete state
- **Reduced opacity** for visual distinction
- **Subtle pulse animation** to draw attention
- **Automatic conversion** to solid tokens when complete

This provides immediate visual feedback about the expression being built.
        `,
      },
    },
  },
}
// Note: Theme-related stories have been moved to Theming.stories.tsx