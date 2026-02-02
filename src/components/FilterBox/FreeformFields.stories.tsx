/**
 * Storybook stories for Freeform Fields feature
 *
 * Demonstrates the ability to create custom field names at runtime.
 */

import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'
import { FilterBox } from './FilterBox'
import type { FilterSchema, FilterExpression } from '@/types'

const meta: Meta<typeof FilterBox> = {
  title: 'Components/FilterBox/Freeform Fields',
  component: FilterBox,
  parameters: {
    docs: {
      description: {
        component: `
# Freeform Fields

The freeform fields feature allows users to create custom field names at runtime, 
instead of being limited to predefined schema fields.

## Use Cases

- **Variable-based filtering**: Filter by user-defined variable names
- **Dynamic data sources**: When the exact field names aren't known at build time
- **Flexible search**: Allow power users to filter by any attribute

## How It Works

1. Enable \`allowFreeformFields: true\` in your schema
2. User types a field name that doesn't match any predefined field
3. A "Create field:" option appears in the dropdown
4. User selects it to create a custom field
5. Standard operators and value input follow
        `,
      },
    },
  },
}

export default meta
type Story = StoryObj<typeof FilterBox>

// =============================================================================
// Helper Components
// =============================================================================

interface FilterBoxWithStateProps {
  schema: FilterSchema
  description?: string
  initialValue?: FilterExpression[]
}

function FilterBoxWithState({ schema, description, initialValue = [] }: FilterBoxWithStateProps) {
  const [value, setValue] = useState<FilterExpression[]>(initialValue)

  return (
    <div style={{ maxWidth: '750px' }}>
      {description && <p style={{ marginBottom: '1rem', color: '#666' }}>{description}</p>}
      <FilterBox schema={schema} value={value} onChange={setValue} />
      <pre
        style={{
          marginTop: '1rem',
          fontSize: '12px',
          background: '#f5f5f5',
          padding: '1rem',
          borderRadius: '4px',
          overflow: 'auto',
          maxHeight: '300px',
        }}
      >
        {JSON.stringify(value, null, 2) || '[]'}
      </pre>
    </div>
  )
}

// =============================================================================
// Basic Freeform Fields
// =============================================================================

const basicFreeformSchema: FilterSchema = {
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
      key: 'priority',
      label: 'Priority',
      type: 'enum',
      operators: [
        { key: 'eq', label: 'is', symbol: '=' },
        { key: 'gte', label: 'at least', symbol: '≥' },
      ],
    },
  ],
  allowFreeformFields: true,
}

export const BasicFreeformFields: Story = {
  render: () => (
    <FilterBoxWithState
      schema={basicFreeformSchema}
      description="Type any field name not in the list (e.g., 'assignee', 'department', 'customField') and select 'Create field:' to add it."
    />
  ),
  parameters: {
    docs: {
      description: {
        story: `
Basic example with freeform fields enabled. Users can:
1. Select predefined fields (Status, Priority)
2. Type any custom field name and press Enter to create it

Try typing "department" or "teamName" to see the freeform option.
        `,
      },
    },
  },
}

// =============================================================================
// Custom Operators for Freeform Fields
// =============================================================================

const customOperatorsFreeformSchema: FilterSchema = {
  fields: [
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
  allowFreeformFields: true,
  freeformFieldConfig: {
    operators: [
      { key: 'eq', label: 'equals', symbol: '=' },
      { key: 'neq', label: 'not equals', symbol: '≠' },
      { key: 'contains', label: 'contains' },
      { key: 'regex', label: 'matches regex', symbol: '~' },
      { key: 'isEmpty', label: 'is empty', valueRequired: false },
      { key: 'isNotEmpty', label: 'is not empty', valueRequired: false },
    ],
  },
}

export const CustomOperators: Story = {
  render: () => (
    <FilterBoxWithState
      schema={customOperatorsFreeformSchema}
      description="Freeform fields have custom operators including 'matches regex', 'is empty', and 'is not empty'."
    />
  ),
  parameters: {
    docs: {
      description: {
        story: `
Configure custom operators specifically for freeform fields using \`freeformFieldConfig.operators\`.

This example adds regex matching and empty checks for user-defined fields.
        `,
      },
    },
  },
}

// =============================================================================
// Field Name Validation
// =============================================================================

const validatedFreeformSchema: FilterSchema = {
  fields: [
    {
      key: 'id',
      label: 'ID',
      type: 'id',
      operators: [{ key: 'eq', label: 'equals', symbol: '=' }],
    },
  ],
  allowFreeformFields: true,
  freeformFieldConfig: {
    validateFieldName: (name: string) => {
      // Only allow camelCase or snake_case identifiers
      const validPattern = /^[a-z][a-zA-Z0-9_]*$/
      if (!validPattern.test(name)) {
        return 'Field name must start with lowercase letter and contain only letters, numbers, and underscores'
      }
      // Disallow reserved words
      const reserved = ['id', 'type', 'class', 'function']
      if (reserved.includes(name.toLowerCase())) {
        return false
      }
      return true
    },
    createLabel: 'Add variable: ',
    group: 'Variables',
  },
}

export const FieldNameValidation: Story = {
  render: () => (
    <FilterBoxWithState
      schema={validatedFreeformSchema}
      description="Try typing 'myVariable' (valid), '123invalid' (invalid - starts with number), or 'id' (reserved word)."
    />
  ),
  parameters: {
    docs: {
      description: {
        story: `
Use \`validateFieldName\` to control which field names are allowed.

This example:
- Only allows camelCase/snake_case identifiers
- Blocks reserved words like 'id', 'type', 'class'
- Returns validation messages for invalid names
        `,
      },
    },
  },
}

// =============================================================================
// Custom Placeholder and Labels
// =============================================================================

const customLabelsFreeformSchema: FilterSchema = {
  fields: [
    {
      key: 'processId',
      label: 'Process ID',
      type: 'id',
      operators: [{ key: 'eq', label: 'equals', symbol: '=' }],
    },
  ],
  allowFreeformFields: true,
  freeformFieldConfig: {
    placeholder: 'Type variable name or select field...',
    createLabel: 'Create variable: ',
    group: 'Custom Variables',
    color: '#9c27b0',
  },
}

export const CustomLabels: Story = {
  render: () => (
    <FilterBoxWithState
      schema={customLabelsFreeformSchema}
      description="Custom placeholder, create label, and grouping for the freeform option."
    />
  ),
  parameters: {
    docs: {
      description: {
        story: `
Customize the UX for freeform fields:
- \`placeholder\`: Custom input placeholder when selecting fields
- \`createLabel\`: Label prefix for the create option
- \`group\`: Group name in the dropdown
- \`color\`: Token color for freeform fields
        `,
      },
    },
  },
}

// =============================================================================
// Variable Comparison Use Case
// =============================================================================

const variableComparisonSchema: FilterSchema = {
  fields: [
    {
      key: 'processDefinitionKey',
      label: 'Process',
      type: 'enum',
      group: 'Process',
      operators: [{ key: 'eq', label: 'is', symbol: '=' }],
    },
    {
      key: 'state',
      label: 'State',
      type: 'enum',
      group: 'Process',
      operators: [
        { key: 'eq', label: 'is', symbol: '=' },
        { key: 'in', label: 'in' },
      ],
    },
  ],
  allowFreeformFields: true,
  freeformFieldConfig: {
    type: 'string',
    placeholder: 'Type process variable name...',
    createLabel: 'Variable: ',
    group: 'Process Variables',
    operators: [
      { key: 'eq', label: 'equals', symbol: '=' },
      { key: 'neq', label: 'not equals', symbol: '≠' },
      { key: 'contains', label: 'contains' },
      { key: 'gt', label: 'greater than', symbol: '>' },
      { key: 'lt', label: 'less than', symbol: '<' },
      { key: 'isNull', label: 'is null', valueRequired: false },
      { key: 'isNotNull', label: 'is not null', valueRequired: false },
    ],
  },
}

export const ProcessVariableFilter: Story = {
  render: () => (
    <FilterBoxWithState
      schema={variableComparisonSchema}
      description="Filter by predefined process fields or any process variable. Try: 'customerName = John' or 'orderTotal > 1000'"
    />
  ),
  parameters: {
    docs: {
      description: {
        story: `
Real-world use case: Filtering process instances by variable values.

Users can:
1. Filter by standard process fields (Process, State)
2. Type any variable name (customerName, orderAmount, etc.)
3. Use comparison operators appropriate for the variable type

Example expressions:
- \`customerName = John Doe\`
- \`orderTotal > 500\`
- \`priority is not null\`
        `,
      },
    },
  },
}

// =============================================================================
// Mixed Freeform and Predefined
// =============================================================================

const mixedFieldsSchema: FilterSchema = {
  fields: [
    {
      key: 'createdDate',
      label: 'Created Date',
      type: 'date',
      group: 'Dates',
      operators: [
        { key: 'before', label: 'before' },
        { key: 'after', label: 'after' },
        { key: 'on', label: 'on' },
      ],
    },
    {
      key: 'amount',
      label: 'Amount',
      type: 'number',
      group: 'Values',
      operators: [
        { key: 'eq', label: 'equals', symbol: '=' },
        { key: 'gt', label: 'greater than', symbol: '>' },
        { key: 'lt', label: 'less than', symbol: '<' },
      ],
    },
    {
      key: 'status',
      label: 'Status',
      type: 'enum',
      group: 'Metadata',
      operators: [{ key: 'eq', label: 'is', symbol: '=' }],
    },
  ],
  allowFreeformFields: true,
  freeformFieldConfig: {
    group: 'Custom Attributes',
    operators: [
      { key: 'eq', label: 'equals', symbol: '=' },
      { key: 'contains', label: 'contains' },
    ],
  },
}

export const MixedPredefinedAndFreeform: Story = {
  render: () => (
    <FilterBoxWithState
      schema={mixedFieldsSchema}
      description="Combine predefined fields (with specific types and operators) with freeform fields for flexibility."
    />
  ),
  parameters: {
    docs: {
      description: {
        story: `
Best of both worlds:
- **Predefined fields** have specific types, operators, and validation
- **Freeform fields** provide flexibility for edge cases

The freeform option appears at the bottom of the dropdown under "Custom Attributes".
        `,
      },
    },
  },
}

// =============================================================================
// With Initial Freeform Values
// =============================================================================

const initialValueSchema: FilterSchema = {
  fields: [
    {
      key: 'category',
      label: 'Category',
      type: 'enum',
      operators: [{ key: 'eq', label: 'is', symbol: '=' }],
    },
  ],
  allowFreeformFields: true,
}

const initialExpressions: FilterExpression[] = [
  {
    condition: {
      field: { key: 'customAttribute', label: 'customAttribute', type: 'string' },
      operator: { key: 'eq', label: 'equals', symbol: '=' },
      value: { raw: 'test value', display: 'test value', serialized: 'test value' },
    },
    connector: 'AND',
  },
  {
    condition: {
      field: { key: 'category', label: 'Category', type: 'enum' },
      operator: { key: 'eq', label: 'is', symbol: '=' },
      value: { raw: 'active', display: 'active', serialized: 'active' },
    },
  },
]

export const WithInitialFreeformValues: Story = {
  render: () => (
    <FilterBoxWithState
      schema={initialValueSchema}
      description="Freeform fields can be loaded from saved filter expressions. The 'customAttribute' field was created by a user."
      initialValue={initialExpressions}
    />
  ),
  parameters: {
    docs: {
      description: {
        story: `
Freeform field values persist and can be loaded from saved configurations.

When loading expressions with freeform fields, they display correctly 
even if the field isn't in the predefined schema.
        `,
      },
    },
  },
}
