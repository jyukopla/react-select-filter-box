import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState, useCallback, useMemo } from 'react'
import { FilterBox } from './FilterBox'
import type {
  FilterSchema,
  FilterExpression,
  CustomAutocompleteWidget,
  CustomWidgetProps,
} from '@/types'
import {
  createDatePickerWidget,
  createNumberInputWidget,
  createDateRangeWidget,
} from '@/components/CustomInputs'

const meta = {
  title: 'Components/FilterBox/Custom Widgets',
  component: FilterBox,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Examples demonstrating custom input widgets that replace the standard dropdown autocomplete with specialized input experiences.',
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
// Date Picker Widget
// =============================================================================

const datePickerSchema: FilterSchema = {
  fields: [
    {
      key: 'created_at',
      label: 'Created At',
      type: 'date',
      description: 'Date the record was created',
      operators: [
        {
          key: 'eq',
          label: 'on',
          customInput: createDatePickerWidget({
            showPresets: true,
          }),
        },
        {
          key: 'before',
          label: 'before',
          customInput: createDatePickerWidget({
            showPresets: false,
          }),
        },
        {
          key: 'after',
          label: 'after',
          customInput: createDatePickerWidget({
            showPresets: true,
          }),
        },
      ],
    },
    {
      key: 'updated_at',
      label: 'Updated At',
      type: 'date',
      operators: [
        {
          key: 'eq',
          label: 'on',
          customInput: createDatePickerWidget({
            locale: 'en-GB',
            showPresets: true,
          }),
        },
        {
          key: 'before',
          label: 'before',
          customInput: createDatePickerWidget({
            locale: 'en-GB',
          }),
        },
        {
          key: 'after',
          label: 'after',
          customInput: createDatePickerWidget({
            locale: 'en-GB',
          }),
        },
      ],
    },
    {
      key: 'due_date',
      label: 'Due Date',
      type: 'date',
      description: 'Task due date with constraints',
      operators: [
        {
          key: 'eq',
          label: 'on',
          customInput: createDatePickerWidget({
            minDate: new Date(),
            showPresets: false,
          }),
        },
      ],
    },
  ],
}

export const DatePickerWidget: Story = {
  render: () => (
    <FilterBoxWithState
      schema={datePickerSchema}
      description="Date fields use a custom date picker widget instead of the standard autocomplete. Includes preset options like 'Today', 'Yesterday', and 'Last 7 days'."
    />
  ),
  parameters: {
    docs: {
      description: {
        story:
          'The DatePickerWidget provides a native date input with preset quick-select options. Supports locale configuration and min/max date constraints.',
      },
    },
  },
}

// =============================================================================
// DateTime Picker Widget (using DatePicker with time)
// =============================================================================

const dateTimeSchema: FilterSchema = {
  fields: [
    {
      key: 'event_time',
      label: 'Event Time',
      type: 'datetime',
      operators: [
        {
          key: 'eq',
          label: 'at',
          customInput: createDatePickerWidget({
            showPresets: true,
          }),
        },
        {
          key: 'before',
          label: 'before',
          customInput: createDatePickerWidget(),
        },
        {
          key: 'after',
          label: 'after',
          customInput: createDatePickerWidget(),
        },
      ],
    },
    {
      key: 'login_time',
      label: 'Login Time',
      type: 'datetime',
      operators: [
        {
          key: 'between',
          label: 'between',
          multiValue: { count: 2, separator: ' and ', labels: ['Start', 'End'] },
          customInput: createDateRangeWidget({
            showPresets: true,
          }),
        },
      ],
    },
  ],
}

export const DateTimePickerWidget: Story = {
  render: () => (
    <FilterBoxWithState
      schema={dateTimeSchema}
      description="DateTime fields support both single date selection and date range selection using specialized widgets."
    />
  ),
  parameters: {
    docs: {
      description: {
        story:
          'DateTime pickers can be configured for single dates or date ranges. The range picker includes preset options like "Last 7 days" and "This month".',
      },
    },
  },
}

// =============================================================================
// Number Input Widget
// =============================================================================

const numberInputSchema: FilterSchema = {
  fields: [
    {
      key: 'age',
      label: 'Age',
      type: 'number',
      operators: [
        {
          key: 'eq',
          label: 'equals',
          customInput: createNumberInputWidget({
            min: 0,
            max: 150,
            integer: true,
            placeholder: 'Enter age...',
          }),
        },
        {
          key: 'gt',
          label: 'greater than',
          customInput: createNumberInputWidget({
            min: 0,
            integer: true,
          }),
        },
        {
          key: 'lt',
          label: 'less than',
          customInput: createNumberInputWidget({
            min: 0,
            max: 150,
            integer: true,
          }),
        },
      ],
    },
    {
      key: 'price',
      label: 'Price',
      type: 'number',
      description: 'Product price in USD',
      operators: [
        {
          key: 'eq',
          label: 'equals',
          customInput: createNumberInputWidget({
            min: 0,
            step: 0.01,
            placeholder: 'Enter price...',
            format: (v) => `$${v.toFixed(2)}`,
          }),
        },
        {
          key: 'between',
          label: 'between',
          multiValue: { count: 2, separator: ' and ', labels: ['Min', 'Max'] },
        },
      ],
    },
    {
      key: 'quantity',
      label: 'Quantity',
      type: 'number',
      operators: [
        {
          key: 'eq',
          label: 'equals',
          customInput: createNumberInputWidget({
            min: 1,
            max: 10000,
            integer: true,
            showButtons: true,
          }),
        },
        {
          key: 'gte',
          label: 'at least',
          customInput: createNumberInputWidget({
            min: 1,
            integer: true,
            showButtons: true,
          }),
        },
      ],
    },
    {
      key: 'percentage',
      label: 'Percentage',
      type: 'number',
      operators: [
        {
          key: 'eq',
          label: 'equals',
          customInput: createNumberInputWidget({
            min: 0,
            max: 100,
            step: 0.1,
            placeholder: 'Enter percentage (0-100)...',
            format: (v) => `${v}%`,
          }),
        },
      ],
    },
  ],
}

export const NumberInputWidget: Story = {
  render: () => (
    <FilterBoxWithState
      schema={numberInputSchema}
      description="Number fields use a specialized number input with validation, min/max constraints, step increments, and custom formatting."
    />
  ),
  parameters: {
    docs: {
      description: {
        story:
          'The NumberInputWidget provides validation, min/max bounds, step increments, integer-only mode, and custom number formatting.',
      },
    },
  },
}

// =============================================================================
// Date Range Widget
// =============================================================================

const dateRangeSchema: FilterSchema = {
  fields: [
    {
      key: 'created_between',
      label: 'Created Between',
      type: 'date',
      operators: [
        {
          key: 'between',
          label: 'is between',
          customInput: createDateRangeWidget({
            showPresets: true,
          }),
        },
      ],
    },
    {
      key: 'period',
      label: 'Time Period',
      type: 'date',
      description: 'Select a date range',
      operators: [
        {
          key: 'within',
          label: 'within',
          customInput: createDateRangeWidget({
            showPresets: true,
            labels: { from: 'Start Date', to: 'End Date' },
          }),
        },
      ],
    },
    {
      key: 'fiscal_year',
      label: 'Fiscal Year',
      type: 'date',
      operators: [
        {
          key: 'in',
          label: 'in',
          customInput: createDateRangeWidget({
            showPresets: false,
            labels: { from: 'Year Start', to: 'Year End' },
          }),
        },
      ],
    },
  ],
}

export const DateRangeWidget: Story = {
  render: () => (
    <FilterBoxWithState
      schema={dateRangeSchema}
      description="Date range widget for selecting 'between' dates. Includes preset ranges like 'Last 7 days', 'Last 30 days', 'This month', and 'Last month'."
    />
  ),
  parameters: {
    docs: {
      description: {
        story:
          'The DateRangeWidget provides two date inputs for selecting a date range, with validation to ensure the start date is before the end date.',
      },
    },
  },
}

// =============================================================================
// Custom Widget Implementation
// =============================================================================

/**
 * Example: Color Picker Widget
 */
function ColorPickerComponent({ onConfirm, onCancel, initialValue }: CustomWidgetProps) {
  const [color, setColor] = useState<string>(
    typeof initialValue === 'string' ? initialValue : '#3b82f6'
  )

  const predefinedColors = useMemo(
    () => [
      { value: '#ef4444', label: 'Red' },
      { value: '#f97316', label: 'Orange' },
      { value: '#eab308', label: 'Yellow' },
      { value: '#22c55e', label: 'Green' },
      { value: '#3b82f6', label: 'Blue' },
      { value: '#8b5cf6', label: 'Purple' },
      { value: '#ec4899', label: 'Pink' },
      { value: '#6b7280', label: 'Gray' },
    ],
    []
  )

  const handleConfirm = useCallback(() => {
    const colorLabel = predefinedColors.find((c) => c.value === color)?.label ?? color
    onConfirm(color, colorLabel)
  }, [color, onConfirm, predefinedColors])

  return (
    <div className="custom-widget-container" style={{ padding: '12px' }}>
      <div style={{ marginBottom: '12px' }}>
        <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px', color: '#666' }}>
          Select Color:
        </label>
        <input
          type="color"
          value={color}
          onChange={(e) => setColor(e.target.value)}
          style={{ width: '100%', height: '40px', cursor: 'pointer', border: '1px solid #ddd' }}
        />
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginBottom: '12px' }}>
        {predefinedColors.map((c) => (
          <button
            key={c.value}
            type="button"
            onClick={() => setColor(c.value)}
            style={{
              width: '24px',
              height: '24px',
              borderRadius: '4px',
              border: color === c.value ? '2px solid #000' : '1px solid #ddd',
              backgroundColor: c.value,
              cursor: 'pointer',
            }}
            title={c.label}
          />
        ))}
      </div>
      <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
        <button
          type="button"
          onClick={onCancel}
          style={{
            padding: '6px 12px',
            border: '1px solid #ddd',
            borderRadius: '4px',
            background: '#fff',
            cursor: 'pointer',
          }}
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleConfirm}
          style={{
            padding: '6px 12px',
            border: 'none',
            borderRadius: '4px',
            background: '#3b82f6',
            color: 'white',
            cursor: 'pointer',
          }}
        >
          Apply
        </button>
      </div>
    </div>
  )
}

const colorPickerWidget: CustomAutocompleteWidget = {
  render: (props) => <ColorPickerComponent {...props} />,
  validate: (value) => typeof value === 'string' && /^#[0-9a-fA-F]{6}$/.test(value),
  serialize: (value) => String(value),
  parse: (serialized) => serialized,
}

/**
 * Example: Rating Widget (1-5 stars)
 */
function RatingComponent({ onConfirm, onCancel, initialValue }: CustomWidgetProps) {
  const [rating, setRating] = useState<number>(typeof initialValue === 'number' ? initialValue : 0)
  const [hoverRating, setHoverRating] = useState<number>(0)

  const handleClick = useCallback(
    (value: number) => {
      setRating(value)
      onConfirm(value, `${'★'.repeat(value)}${'☆'.repeat(5 - value)}`)
    },
    [onConfirm]
  )

  return (
    <div className="custom-widget-container" style={{ padding: '12px' }}>
      <div style={{ marginBottom: '8px', fontSize: '12px', color: '#666' }}>Select Rating:</div>
      <div style={{ display: 'flex', gap: '4px', marginBottom: '12px' }}>
        {[1, 2, 3, 4, 5].map((value) => (
          <button
            key={value}
            type="button"
            onClick={() => handleClick(value)}
            onMouseEnter={() => setHoverRating(value)}
            onMouseLeave={() => setHoverRating(0)}
            style={{
              fontSize: '24px',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: value <= (hoverRating || rating) ? '#eab308' : '#d1d5db',
              transition: 'color 0.1s',
            }}
          >
            ★
          </button>
        ))}
      </div>
      <div style={{ textAlign: 'center', fontSize: '12px', color: '#666' }}>
        {rating > 0 ? `${rating} out of 5 stars` : 'Click a star to rate'}
      </div>
      <div style={{ marginTop: '12px', textAlign: 'right' }}>
        <button
          type="button"
          onClick={onCancel}
          style={{
            padding: '6px 12px',
            border: '1px solid #ddd',
            borderRadius: '4px',
            background: '#fff',
            cursor: 'pointer',
          }}
        >
          Cancel
        </button>
      </div>
    </div>
  )
}

const ratingWidget: CustomAutocompleteWidget = {
  render: (props) => <RatingComponent {...props} />,
  validate: (value) => typeof value === 'number' && value >= 1 && value <= 5,
  serialize: (value) => String(value),
  parse: (serialized) => parseInt(serialized, 10),
}

/**
 * Example: Slider Widget
 */
function SliderComponent({ onConfirm, onCancel, initialValue }: CustomWidgetProps) {
  const [value, setValue] = useState<number>(typeof initialValue === 'number' ? initialValue : 50)

  const handleConfirm = useCallback(() => {
    onConfirm(value, `${value}%`)
  }, [value, onConfirm])

  return (
    <div className="custom-widget-container" style={{ padding: '12px' }}>
      <div style={{ marginBottom: '8px', fontSize: '12px', color: '#666' }}>
        Adjust Value: <strong>{value}%</strong>
      </div>
      <input
        type="range"
        min={0}
        max={100}
        value={value}
        onChange={(e) => setValue(Number(e.target.value))}
        style={{ width: '100%', marginBottom: '12px' }}
      />
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          fontSize: '10px',
          color: '#999',
        }}
      >
        <span>0%</span>
        <span>50%</span>
        <span>100%</span>
      </div>
      <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '12px' }}>
        <button
          type="button"
          onClick={onCancel}
          style={{
            padding: '6px 12px',
            border: '1px solid #ddd',
            borderRadius: '4px',
            background: '#fff',
            cursor: 'pointer',
          }}
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleConfirm}
          style={{
            padding: '6px 12px',
            border: 'none',
            borderRadius: '4px',
            background: '#3b82f6',
            color: 'white',
            cursor: 'pointer',
          }}
        >
          Apply
        </button>
      </div>
    </div>
  )
}

const sliderWidget: CustomAutocompleteWidget = {
  render: (props) => <SliderComponent {...props} />,
  validate: (value) => typeof value === 'number' && value >= 0 && value <= 100,
  serialize: (value) => String(value),
  parse: (serialized) => parseInt(serialized, 10),
}

const customWidgetSchema: FilterSchema = {
  fields: [
    {
      key: 'color',
      label: 'Color',
      type: 'custom',
      description: 'Product color selection',
      operators: [
        {
          key: 'eq',
          label: 'is',
          customInput: colorPickerWidget,
        },
      ],
    },
    {
      key: 'rating',
      label: 'Rating',
      type: 'number',
      description: '5-star rating system',
      operators: [
        {
          key: 'gte',
          label: 'at least',
          customInput: ratingWidget,
        },
        {
          key: 'eq',
          label: 'exactly',
          customInput: ratingWidget,
        },
      ],
    },
    {
      key: 'discount',
      label: 'Discount',
      type: 'number',
      description: 'Discount percentage',
      operators: [
        {
          key: 'gte',
          label: 'at least',
          customInput: sliderWidget,
        },
        {
          key: 'lte',
          label: 'at most',
          customInput: sliderWidget,
        },
      ],
    },
  ],
}

export const CustomWidgetImplementation: Story = {
  render: () => (
    <FilterBoxWithState
      schema={customWidgetSchema}
      description="Custom-built widgets: Color Picker with hex color selection, Star Rating for 1-5 ratings, and Slider for percentage values."
    />
  ),
  parameters: {
    docs: {
      description: {
        story:
          'Demonstrates how to create completely custom input widgets. Each widget implements the CustomAutocompleteWidget interface with render, validate, serialize, and parse methods.',
      },
    },
  },
}

// =============================================================================
// Mixed Widgets in Single Schema
// =============================================================================

const mixedWidgetsSchema: FilterSchema = {
  fields: [
    {
      key: 'product_name',
      label: 'Product Name',
      type: 'string',
      operators: [
        { key: 'contains', label: 'contains' },
        { key: 'eq', label: 'equals' },
      ],
    },
    {
      key: 'price',
      label: 'Price',
      type: 'number',
      operators: [
        {
          key: 'between',
          label: 'between',
          multiValue: { count: 2, separator: ' and ', labels: ['Min', 'Max'] },
        },
        {
          key: 'lt',
          label: 'less than',
          customInput: createNumberInputWidget({
            min: 0,
            step: 0.01,
            format: (v) => `$${v.toFixed(2)}`,
          }),
        },
      ],
    },
    {
      key: 'created_date',
      label: 'Created Date',
      type: 'date',
      operators: [
        {
          key: 'between',
          label: 'between',
          customInput: createDateRangeWidget({ showPresets: true }),
        },
        {
          key: 'after',
          label: 'after',
          customInput: createDatePickerWidget({ showPresets: true }),
        },
      ],
    },
    {
      key: 'color',
      label: 'Color',
      type: 'custom',
      operators: [
        {
          key: 'eq',
          label: 'is',
          customInput: colorPickerWidget,
        },
      ],
    },
    {
      key: 'rating',
      label: 'Rating',
      type: 'number',
      operators: [
        {
          key: 'gte',
          label: 'at least',
          customInput: ratingWidget,
        },
      ],
    },
    {
      key: 'category',
      label: 'Category',
      type: 'enum',
      operators: [{ key: 'eq', label: 'is' }],
      valueAutocompleter: {
        getSuggestions: () => [
          { value: 'electronics', label: 'Electronics' },
          { value: 'clothing', label: 'Clothing' },
          { value: 'books', label: 'Books' },
          { value: 'home', label: 'Home & Garden' },
        ],
      },
    },
  ],
}

export const MixedWidgets: Story = {
  render: () => (
    <FilterBoxWithState
      schema={mixedWidgetsSchema}
      description="A real-world schema mixing standard autocomplete fields with custom widgets: text search, price range, date picker, color picker, star rating, and enum selection."
    />
  ),
  parameters: {
    docs: {
      description: {
        story:
          'Shows how standard autocomplete fields can be combined with various custom widgets in the same schema for a rich filtering experience.',
      },
    },
  },
}

// =============================================================================
// Theming Custom Widgets
// =============================================================================

/**
 * Example: Themed Color Picker
 */
function ThemedColorPickerComponent({ onConfirm, onCancel, initialValue }: CustomWidgetProps) {
  const [color, setColor] = useState<string>(
    typeof initialValue === 'string' ? initialValue : '#3b82f6'
  )

  // Use CSS custom properties for theming
  const predefinedColors = useMemo(
    () => [
      { value: 'var(--filter-token-field-bg, #e0f2fe)', label: 'Field Color' },
      { value: 'var(--filter-token-operator-bg, #fce7f3)', label: 'Operator Color' },
      { value: 'var(--filter-token-value-bg, #d1fae5)', label: 'Value Color' },
      { value: 'var(--filter-token-connector-bg, #fef3c7)', label: 'Connector Color' },
    ],
    []
  )

  const handleConfirm = useCallback(() => {
    const colorLabel = predefinedColors.find((c) => c.value === color)?.label ?? color
    onConfirm(color, colorLabel)
  }, [color, onConfirm, predefinedColors])

  return (
    <div
      className="custom-widget-container"
      style={{
        padding: '12px',
        backgroundColor: 'var(--filter-dropdown-bg, #fff)',
        color: 'var(--filter-text-color, #1e293b)',
      }}
    >
      <div style={{ marginBottom: '12px' }}>
        <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px', opacity: 0.7 }}>
          Select Theme Color:
        </label>
        <input
          type="color"
          value={color.startsWith('var(') ? '#3b82f6' : color}
          onChange={(e) => setColor(e.target.value)}
          style={{ width: '100%', height: '40px', cursor: 'pointer' }}
        />
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '12px' }}>
        {predefinedColors.map((c) => (
          <button
            key={c.value}
            type="button"
            onClick={() => setColor(c.value)}
            style={{
              padding: '4px 8px',
              borderRadius: '4px',
              border: color === c.value ? '2px solid currentColor' : '1px solid #ddd',
              backgroundColor: c.value,
              cursor: 'pointer',
              fontSize: '11px',
            }}
          >
            {c.label}
          </button>
        ))}
      </div>
      <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
        <button
          type="button"
          onClick={onCancel}
          style={{
            padding: '6px 12px',
            border: '1px solid var(--filter-border-color, #e2e8f0)',
            borderRadius: '4px',
            background: 'var(--filter-bg, #fff)',
            color: 'inherit',
            cursor: 'pointer',
          }}
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleConfirm}
          style={{
            padding: '6px 12px',
            border: 'none',
            borderRadius: '4px',
            background: 'var(--filter-focus-ring, #3b82f6)',
            color: 'white',
            cursor: 'pointer',
          }}
        >
          Apply
        </button>
      </div>
    </div>
  )
}

const themedColorPickerWidget: CustomAutocompleteWidget = {
  render: (props) => <ThemedColorPickerComponent {...props} />,
  validate: (value) => typeof value === 'string',
  serialize: (value) => String(value),
  parse: (serialized) => serialized,
}

const themedWidgetSchema: FilterSchema = {
  fields: [
    {
      key: 'theme_color',
      label: 'Theme Color',
      type: 'custom',
      operators: [
        {
          key: 'eq',
          label: 'is',
          customInput: themedColorPickerWidget,
        },
      ],
    },
  ],
}

export const ThemedWidgets: Story = {
  render: () => (
    <div>
      <FilterBoxWithState
        schema={themedWidgetSchema}
        description="Custom widgets can use CSS custom properties to match the current theme. This color picker adapts to the FilterBox theme."
      />
      <div style={{ marginTop: '2rem' }}>
        <h4 style={{ marginBottom: '0.5rem' }}>Dark Theme</h4>
        <div
          style={{
            padding: '1rem',
            background: '#1e293b',
            borderRadius: '8px',
            ['--filter-bg' as string]: '#1e293b',
            ['--filter-text-color' as string]: '#f8fafc',
            ['--filter-border-color' as string]: '#475569',
            ['--filter-dropdown-bg' as string]: '#334155',
            ['--filter-focus-ring' as string]: '#60a5fa',
          }}
        >
          <FilterBoxWithState schema={themedWidgetSchema} />
        </div>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'Custom widgets should use CSS custom properties for colors and styling to properly integrate with the theming system.',
      },
    },
  },
}
