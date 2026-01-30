import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState, useEffect } from 'react'
import { FilterBox } from './FilterBox'
import type { FilterSchema, FilterExpression, AutocompleteItem } from '@/types'
import {
  createStaticAutocompleter,
  createEnumAutocompleter,
  createAsyncAutocompleter,
  createNumberAutocompleter,
  createDateAutocompleter,
  combineAutocompleters,
  withCache,
} from '@/autocompleters'

const meta = {
  title: 'Components/FilterBox/Autocomplete',
  component: FilterBox,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: 'Examples demonstrating different autocompleter types and configurations.',
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
  note,
}: { 
  schema: FilterSchema
  description?: string
  note?: string
}) {
  const [value, setValue] = useState<FilterExpression[]>([])
  return (
    <div style={{ maxWidth: '650px' }}>
      {description && (
        <p style={{ marginBottom: '0.5rem', color: '#666', fontSize: '14px' }}>{description}</p>
      )}
      {note && (
        <div style={{ marginBottom: '1rem', padding: '0.5rem', background: '#fffde7', border: '1px solid #fff9c4', borderRadius: '4px', fontSize: '13px', color: '#f57f17' }}>
          💡 {note}
        </div>
      )}
      <FilterBox schema={schema} value={value} onChange={setValue} />
      <pre style={{ marginTop: '1rem', fontSize: '12px', background: '#f5f5f5', padding: '1rem', borderRadius: '4px', overflow: 'auto' }}>
        {JSON.stringify(value, null, 2) || '[]'}
      </pre>
    </div>
  )
}

// =============================================================================
// Static String List
// =============================================================================

const statusValues = ['Active', 'Pending', 'Completed', 'Failed', 'Cancelled']

const staticStringSchema: FilterSchema = {
  fields: [
    {
      key: 'status',
      label: 'Status',
      type: 'enum',
      description: 'Filter by status',
      operators: [{ key: 'eq', label: 'is', symbol: '=' }],
      valueAutocompleter: createStaticAutocompleter(statusValues),
    },
    {
      key: 'country',
      label: 'Country',
      type: 'enum',
      description: 'Filter by country',
      operators: [{ key: 'eq', label: 'is', symbol: '=' }],
      valueAutocompleter: createStaticAutocompleter([
        'United States',
        'United Kingdom',
        'Canada',
        'Germany',
        'France',
        'Japan',
        'Australia',
        'Brazil',
        'India',
        'China',
      ]),
    },
  ],
}

export const StaticStringList: Story = {
  render: () => (
    <FilterBoxWithState
      schema={staticStringSchema}
      description="Static autocompleter with a simple list of string values. Start typing to filter the options."
      note="Try typing 'act' to filter status options or 'un' to filter countries."
    />
  ),
  parameters: {
    docs: {
      description: {
        story: 'Basic static autocompleter with a list of string values.',
      },
    },
  },
}

// =============================================================================
// Enum with Descriptions
// =============================================================================

const processStates = [
  { key: 'ACTIVE', label: 'Active', description: 'Process is currently running' },
  { key: 'SUSPENDED', label: 'Suspended', description: 'Process is temporarily paused' },
  { key: 'COMPLETED', label: 'Completed', description: 'Process finished successfully' },
  { key: 'TERMINATED', label: 'Terminated', description: 'Process was stopped externally' },
  { key: 'FAILED', label: 'Failed', description: 'Process ended with an error' },
]

const enumWithDescriptionsSchema: FilterSchema = {
  fields: [
    {
      key: 'state',
      label: 'State',
      type: 'enum',
      description: 'Process state',
      operators: [
        { key: 'eq', label: 'is', symbol: '=' },
        { key: 'neq', label: 'is not', symbol: '≠' },
      ],
      valueAutocompleter: createEnumAutocompleter(processStates),
    },
    {
      key: 'priority',
      label: 'Priority',
      type: 'enum',
      description: 'Task priority',
      operators: [{ key: 'eq', label: 'is', symbol: '=' }],
      valueAutocompleter: createEnumAutocompleter([
        { key: 'critical', label: 'Critical', description: 'Immediate attention required' },
        { key: 'high', label: 'High', description: 'Should be addressed soon' },
        { key: 'medium', label: 'Medium', description: 'Standard priority' },
        { key: 'low', label: 'Low', description: 'When time permits' },
      ]),
    },
  ],
}

export const EnumWithDescriptions: Story = {
  render: () => (
    <FilterBoxWithState
      schema={enumWithDescriptionsSchema}
      description="Enum autocompleter with labels and descriptions for each option."
      note="Each option shows a description to help users understand the values."
    />
  ),
  parameters: {
    docs: {
      description: {
        story: 'Enum autocompleter with rich item descriptions.',
      },
    },
  },
}

// =============================================================================
// Grouped Items
// =============================================================================

const groupedItemsSchema: FilterSchema = {
  fields: [
    {
      key: 'role',
      label: 'Role',
      type: 'enum',
      description: 'User role',
      operators: [{ key: 'eq', label: 'is', symbol: '=' }],
      valueAutocompleter: createStaticAutocompleter([
        { type: 'value', key: 'admin', label: 'Administrator', group: 'Administrative' },
        { type: 'value', key: 'moderator', label: 'Moderator', group: 'Administrative' },
        { type: 'value', key: 'developer', label: 'Developer', group: 'Technical' },
        { type: 'value', key: 'designer', label: 'Designer', group: 'Technical' },
        { type: 'value', key: 'viewer', label: 'Viewer', group: 'General' },
        { type: 'value', key: 'guest', label: 'Guest', group: 'General' },
      ] as AutocompleteItem[]),
    },
    {
      key: 'department',
      label: 'Department',
      type: 'enum',
      description: 'Company department',
      operators: [{ key: 'eq', label: 'is', symbol: '=' }],
      valueAutocompleter: createStaticAutocompleter([
        { type: 'value', key: 'engineering', label: 'Engineering', group: 'Product' },
        { type: 'value', key: 'product', label: 'Product Management', group: 'Product' },
        { type: 'value', key: 'design', label: 'Design', group: 'Product' },
        { type: 'value', key: 'hr', label: 'Human Resources', group: 'Operations' },
        { type: 'value', key: 'finance', label: 'Finance', group: 'Operations' },
        { type: 'value', key: 'sales', label: 'Sales', group: 'Commercial' },
        { type: 'value', key: 'marketing', label: 'Marketing', group: 'Commercial' },
      ] as AutocompleteItem[]),
    },
  ],
}

export const GroupedItems: Story = {
  render: () => (
    <FilterBoxWithState
      schema={groupedItemsSchema}
      description="Autocomplete items organized into groups for better navigation."
      note="Items are grouped by category in the dropdown."
    />
  ),
  parameters: {
    docs: {
      description: {
        story: 'Grouped autocomplete items for organized display.',
      },
    },
  },
}

// =============================================================================
// Match Modes
// =============================================================================

const matchModesSchema: FilterSchema = {
  fields: [
    {
      key: 'prefixMatch',
      label: 'Prefix Match',
      type: 'string',
      description: 'Matches from the beginning',
      operators: [{ key: 'eq', label: 'is', symbol: '=' }],
      valueAutocompleter: createStaticAutocompleter(
        ['Application', 'Applied', 'Append', 'Bicycle', 'Binary', 'Catalog'],
        { matchMode: 'prefix' }
      ),
    },
    {
      key: 'substringMatch',
      label: 'Substring Match',
      type: 'string',
      description: 'Matches anywhere in the string',
      operators: [{ key: 'eq', label: 'is', symbol: '=' }],
      valueAutocompleter: createStaticAutocompleter(
        ['Application', 'Applied', 'Append', 'Reapply', 'Multiplication'],
        { matchMode: 'substring' }
      ),
    },
    {
      key: 'fuzzyMatch',
      label: 'Fuzzy Match',
      type: 'string',
      description: 'Matches with fuzzy algorithm',
      operators: [{ key: 'eq', label: 'is', symbol: '=' }],
      valueAutocompleter: createStaticAutocompleter(
        ['ApplicationController', 'AppleDevice', 'AbstractFactory', 'ArrayPrototype'],
        { matchMode: 'fuzzy' }
      ),
    },
  ],
}

export const MatchModes: Story = {
  render: () => (
    <FilterBoxWithState
      schema={matchModesSchema}
      description="Different match modes for filtering: prefix (starts with), substring (contains), and fuzzy matching."
      note="Try typing 'app' in each field to see different matching behaviors."
    />
  ),
  parameters: {
    docs: {
      description: {
        story: 'Different matching modes: prefix, substring, and fuzzy matching.',
      },
    },
  },
}

// =============================================================================
// Async Autocompleter (Simulated)
// =============================================================================

// Simulated API response
const simulateApiCall = async (query: string): Promise<AutocompleteItem[]> => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 500))
  
  const allUsers = [
    { key: 'user1', label: 'John Smith', description: 'john.smith@example.com' },
    { key: 'user2', label: 'Jane Doe', description: 'jane.doe@example.com' },
    { key: 'user3', label: 'Bob Johnson', description: 'bob.j@example.com' },
    { key: 'user4', label: 'Alice Williams', description: 'alice.w@example.com' },
    { key: 'user5', label: 'Charlie Brown', description: 'charlie.b@example.com' },
  ]
  
  if (!query) return allUsers.slice(0, 3)
  
  return allUsers
    .filter(u => u.label.toLowerCase().includes(query.toLowerCase()))
    .map(u => ({ ...u, type: 'value' as const }))
}

const asyncSchema: FilterSchema = {
  fields: [
    {
      key: 'assignee',
      label: 'Assignee',
      type: 'string',
      description: 'Assigned user (async lookup)',
      operators: [{ key: 'eq', label: 'is', symbol: '=' }],
      valueAutocompleter: createAsyncAutocompleter(simulateApiCall, {
        debounceMs: 300,
        minChars: 1,
        cacheResults: true,
      }),
    },
  ],
}

export const AsyncAutocomplete: Story = {
  render: () => (
    <FilterBoxWithState
      schema={asyncSchema}
      description="Async autocompleter that fetches suggestions from an API (simulated 500ms delay)."
      note="Type at least 1 character to trigger the async lookup. Results are debounced by 300ms."
    />
  ),
  parameters: {
    docs: {
      description: {
        story: 'Async autocompleter with debouncing and caching for API-backed suggestions.',
      },
    },
  },
}

// =============================================================================
// Number Autocompleter
// =============================================================================

const numberSchema: FilterSchema = {
  fields: [
    {
      key: 'age',
      label: 'Age',
      type: 'number',
      description: 'Age filter (18-100)',
      operators: [
        { key: 'eq', label: 'is', symbol: '=' },
        { key: 'gte', label: 'at least', symbol: '≥' },
        { key: 'lte', label: 'at most', symbol: '≤' },
      ],
      valueAutocompleter: createNumberAutocompleter({
        min: 18,
        max: 100,
        step: 5,
        integer: true,
      }),
    },
    {
      key: 'price',
      label: 'Price',
      type: 'number',
      description: 'Price filter ($0-$1000)',
      operators: [
        { key: 'eq', label: 'is', symbol: '=' },
        { key: 'gt', label: 'above', symbol: '>' },
        { key: 'lt', label: 'below', symbol: '<' },
      ],
      valueAutocompleter: createNumberAutocompleter({
        min: 0,
        max: 1000,
        step: 50,
        format: (n) => `$${n.toFixed(2)}`,
        parse: (s) => parseFloat(s.replace('$', '')),
      }),
    },
    {
      key: 'rating',
      label: 'Rating',
      type: 'number',
      description: 'Star rating (1-5)',
      operators: [
        { key: 'gte', label: 'at least', symbol: '★≥' },
      ],
      valueAutocompleter: createNumberAutocompleter({
        min: 1,
        max: 5,
        step: 1,
        integer: true,
        format: (n) => '★'.repeat(n),
        parse: (s) => s.length,
      }),
    },
  ],
}

export const NumberAutocomplete: Story = {
  render: () => (
    <FilterBoxWithState
      schema={numberSchema}
      description="Number autocompleter with validation, min/max bounds, custom formatting, and step suggestions."
      note="The age field suggests values in steps of 5, price formats with $ symbol."
    />
  ),
  parameters: {
    docs: {
      description: {
        story: 'Number autocompleter with min/max validation and custom formatting.',
      },
    },
  },
}

// =============================================================================
// Date Autocompleter
// =============================================================================

const dateSchema: FilterSchema = {
  fields: [
    {
      key: 'createdAt',
      label: 'Created',
      type: 'date',
      description: 'Creation date with presets',
      operators: [
        { key: 'after', label: 'after', symbol: '>' },
        { key: 'before', label: 'before', symbol: '<' },
      ],
      valueAutocompleter: createDateAutocompleter(),
    },
    {
      key: 'dueDate',
      label: 'Due Date',
      type: 'date',
      description: 'Deadline with custom presets',
      operators: [{ key: 'before', label: 'before', symbol: '<' }],
      valueAutocompleter: createDateAutocompleter({
        presets: [
          { label: 'End of Today', value: new Date(new Date().setHours(23, 59, 59, 999)) },
          { label: 'End of Week', value: getEndOfWeek() },
          { label: 'End of Month', value: getEndOfMonth() },
          { label: 'End of Quarter', value: getEndOfQuarter() },
        ],
      }),
    },
  ],
}

function getEndOfWeek(): Date {
  const now = new Date()
  const day = now.getDay()
  const diff = 7 - day
  return new Date(now.getTime() + diff * 24 * 60 * 60 * 1000)
}

function getEndOfMonth(): Date {
  const now = new Date()
  return new Date(now.getFullYear(), now.getMonth() + 1, 0)
}

function getEndOfQuarter(): Date {
  const now = new Date()
  const quarter = Math.floor(now.getMonth() / 3)
  return new Date(now.getFullYear(), (quarter + 1) * 3, 0)
}

export const DateAutocomplete: Story = {
  render: () => (
    <FilterBoxWithState
      schema={dateSchema}
      description="Date autocompleter with preset date options like 'Today', 'Yesterday', 'Last Week'."
      note="Select from presets or type a date in YYYY-MM-DD format."
    />
  ),
  parameters: {
    docs: {
      description: {
        story: 'Date autocompleter with preset date options and ISO date parsing.',
      },
    },
  },
}

// =============================================================================
// Combined Autocompleters
// =============================================================================

const recentSearches = [
  { type: 'value' as const, key: 'recent1', label: 'John', description: 'Recent search', group: 'Recent' },
  { type: 'value' as const, key: 'recent2', label: 'Jane', description: 'Recent search', group: 'Recent' },
]

const suggestions = [
  { type: 'value' as const, key: 'sugg1', label: 'John Smith', group: 'Suggestions' },
  { type: 'value' as const, key: 'sugg2', label: 'Jane Doe', group: 'Suggestions' },
  { type: 'value' as const, key: 'sugg3', label: 'Bob Johnson', group: 'Suggestions' },
]

const combinedSchema: FilterSchema = {
  fields: [
    {
      key: 'search',
      label: 'Search',
      type: 'string',
      description: 'Combined recent + suggestions',
      operators: [{ key: 'contains', label: 'contains' }],
      valueAutocompleter: combineAutocompleters(
        createStaticAutocompleter(recentSearches),
        createStaticAutocompleter(suggestions)
      ),
    },
  ],
}

export const CombinedAutocompleters: Story = {
  render: () => (
    <FilterBoxWithState
      schema={combinedSchema}
      description="Multiple autocompleters combined to show results from different sources."
      note="Shows 'Recent' searches and 'Suggestions' in one dropdown."
    />
  ),
  parameters: {
    docs: {
      description: {
        story: 'Combined autocompleters merging results from multiple sources.',
      },
    },
  },
}

// =============================================================================
// Large List with Virtual Scrolling
// =============================================================================

const largeListSchema: FilterSchema = {
  fields: [
    {
      key: 'productId',
      label: 'Product',
      type: 'enum',
      description: 'Large product list (200+ items)',
      operators: [{ key: 'eq', label: 'is', symbol: '=' }],
      valueAutocompleter: createStaticAutocompleter(
        Array.from({ length: 200 }, (_, i) => ({
          type: 'value' as const,
          key: `product-${i + 1}`,
          label: `Product ${i + 1}`,
          description: `SKU: PRD-${String(i + 1).padStart(4, '0')}`,
        })),
        { maxResults: 50 }
      ),
    },
  ],
}

export const LargeListVirtualScrolling: Story = {
  render: () => (
    <FilterBoxWithState
      schema={largeListSchema}
      description="Large list of 200+ items with virtual scrolling for smooth performance."
      note="The dropdown uses virtual scrolling to efficiently render large lists."
    />
  ),
  parameters: {
    docs: {
      description: {
        story: 'Large autocomplete list with virtual scrolling for performance.',
      },
    },
  },
}

// =============================================================================
// Cached Autocompleter
// =============================================================================

let apiCallCount = 0

const cachedApiCall = async (query: string): Promise<AutocompleteItem[]> => {
  apiCallCount++
  await new Promise(resolve => setTimeout(resolve, 300))
  
  return [
    { type: 'value', key: `result-${apiCallCount}`, label: `Result for "${query}" (API call #${apiCallCount})` },
  ]
}

function CachedAutocompleterStory() {
  const [value, setValue] = useState<FilterExpression[]>([])
  
  useEffect(() => {
    apiCallCount = 0
  }, [])
  
  const schema: FilterSchema = {
    fields: [
      {
        key: 'cached',
        label: 'Cached Search',
        type: 'string',
        description: 'Results are cached',
        operators: [{ key: 'eq', label: 'is', symbol: '=' }],
        valueAutocompleter: withCache(
          createAsyncAutocompleter(cachedApiCall, { debounceMs: 100 }),
          60000 // 1 minute cache
        ),
      },
    ],
  }
  
  return (
    <div style={{ maxWidth: '650px' }}>
      <p style={{ marginBottom: '0.5rem', color: '#666', fontSize: '14px' }}>
        Async autocompleter with result caching. Same queries return cached results.
      </p>
      <div style={{ marginBottom: '1rem', padding: '0.5rem', background: '#e3f2fd', border: '1px solid #bbdefb', borderRadius: '4px', fontSize: '13px' }}>
        💡 Type the same query multiple times - subsequent requests use cached results.
      </div>
      <FilterBox schema={schema} value={value} onChange={setValue} />
      <pre style={{ marginTop: '1rem', fontSize: '12px', background: '#f5f5f5', padding: '1rem', borderRadius: '4px' }}>
        {JSON.stringify(value, null, 2) || '[]'}
      </pre>
    </div>
  )
}

export const CachedAutocompleter: Story = {
  render: () => <CachedAutocompleterStory />,
  parameters: {
    docs: {
      description: {
        story: 'Cached async autocompleter that remembers previous results.',
      },
    },
  },
}
