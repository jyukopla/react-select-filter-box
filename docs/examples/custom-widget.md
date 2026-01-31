# Custom Widget Example

This example demonstrates how to create and use custom input widgets in the React Sequential Filter Box.

## Overview

Custom widgets allow you to provide specialized input interfaces for complex value types, such as:
- Color pickers
- Slider ranges
- Multi-select with tags
- Custom date/time pickers
- Rich text input

## Basic Custom Widget

```tsx
import type { CustomAutocompleteWidget, CustomWidgetProps } from 'react-select-filter-box'

// Simple color picker widget
const colorPickerWidget: CustomAutocompleteWidget = {
  render: ({ onConfirm, onCancel, initialValue }: CustomWidgetProps) => {
    const [color, setColor] = useState(initialValue as string || '#000000')

    return (
      <div className="color-picker-widget">
        <input
          type="color"
          value={color}
          onChange={(e) => setColor(e.target.value)}
          autoFocus
        />
        <div className="color-picker-widget__preview" style={{ backgroundColor: color }}>
          {color}
        </div>
        <div className="color-picker-widget__actions">
          <button onClick={() => onConfirm(color, color)}>Select</button>
          <button onClick={onCancel}>Cancel</button>
        </div>
      </div>
    )
  },

  validate: (value: unknown): boolean => {
    return typeof value === 'string' && /^#[0-9a-f]{6}$/i.test(value)
  },

  serialize: (value: unknown): string => {
    return String(value)
  },

  parse: (serialized: string): unknown => {
    return serialized
  },
}

// Use in schema
const schema: FilterSchema = {
  fields: [
    {
      key: 'color',
      label: 'Color',
      type: 'custom',
      operators: [{
        key: 'eq',
        label: 'is',
        customInput: colorPickerWidget,
      }],
    },
  ],
}
```

## Slider Range Widget

```tsx
import { useState } from 'react'
import type { CustomAutocompleteWidget, CustomWidgetProps } from 'react-select-filter-box'

interface RangeValue {
  min: number
  max: number
}

const sliderRangeWidget: CustomAutocompleteWidget = {
  render: ({ onConfirm, onCancel, initialValue, fieldConfig }: CustomWidgetProps) => {
    const options = fieldConfig.widgetOptions as { min: number; max: number; step: number }
    const initial = initialValue as RangeValue | undefined

    const [minValue, setMinValue] = useState(initial?.min ?? options.min)
    const [maxValue, setMaxValue] = useState(initial?.max ?? options.max)

    const handleConfirm = () => {
      const value: RangeValue = { min: minValue, max: maxValue }
      const display = `${minValue} - ${maxValue}`
      onConfirm(value, display)
    }

    return (
      <div className="slider-range-widget">
        <div className="slider-range-widget__row">
          <label>Min: {minValue}</label>
          <input
            type="range"
            min={options.min}
            max={maxValue}
            step={options.step}
            value={minValue}
            onChange={(e) => setMinValue(Number(e.target.value))}
          />
        </div>
        <div className="slider-range-widget__row">
          <label>Max: {maxValue}</label>
          <input
            type="range"
            min={minValue}
            max={options.max}
            step={options.step}
            value={maxValue}
            onChange={(e) => setMaxValue(Number(e.target.value))}
          />
        </div>
        <div className="slider-range-widget__display">
          Selected range: {minValue} - {maxValue}
        </div>
        <div className="slider-range-widget__actions">
          <button onClick={handleConfirm}>Apply</button>
          <button onClick={onCancel}>Cancel</button>
        </div>
      </div>
    )
  },

  validate: (value: unknown): boolean => {
    if (typeof value !== 'object' || value === null) return false
    const range = value as RangeValue
    return typeof range.min === 'number' && 
           typeof range.max === 'number' && 
           range.min <= range.max
  },

  serialize: (value: unknown): string => {
    const range = value as RangeValue
    return `${range.min}..${range.max}`
  },

  parse: (serialized: string): unknown => {
    const [min, max] = serialized.split('..').map(Number)
    return { min, max }
  },
}

// Schema usage
const schema: FilterSchema = {
  fields: [
    {
      key: 'price',
      label: 'Price',
      type: 'number',
      widgetOptions: { min: 0, max: 1000, step: 10 },
      operators: [{
        key: 'between',
        label: 'between',
        customInput: sliderRangeWidget,
      }],
    },
  ],
}
```

## Multi-Select Tags Widget

```tsx
import { useState } from 'react'

const tagsWidget: CustomAutocompleteWidget = {
  render: ({ onConfirm, onCancel, initialValue }: CustomWidgetProps) => {
    const [tags, setTags] = useState<string[]>(initialValue as string[] || [])
    const [input, setInput] = useState('')

    const addTag = () => {
      if (input.trim() && !tags.includes(input.trim())) {
        setTags([...tags, input.trim()])
        setInput('')
      }
    }

    const removeTag = (tag: string) => {
      setTags(tags.filter(t => t !== tag))
    }

    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.preventDefault()
        addTag()
      }
      if (e.key === 'Backspace' && !input && tags.length > 0) {
        removeTag(tags[tags.length - 1])
      }
    }

    const handleConfirm = () => {
      if (tags.length > 0) {
        onConfirm(tags, tags.join(', '))
      }
    }

    return (
      <div className="tags-widget">
        <div className="tags-widget__container">
          {tags.map(tag => (
            <span key={tag} className="tags-widget__tag">
              {tag}
              <button onClick={() => removeTag(tag)}>×</button>
            </span>
          ))}
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type and press Enter"
            autoFocus
          />
        </div>
        <div className="tags-widget__actions">
          <button onClick={handleConfirm} disabled={tags.length === 0}>
            Apply ({tags.length} tags)
          </button>
          <button onClick={onCancel}>Cancel</button>
        </div>
      </div>
    )
  },

  validate: (value: unknown): boolean => {
    return Array.isArray(value) && value.length > 0
  },

  serialize: (value: unknown): string => {
    return (value as string[]).join(',')
  },

  parse: (serialized: string): unknown => {
    return serialized.split(',').map(s => s.trim()).filter(Boolean)
  },
}
```

## Rich Date Range Widget

```tsx
import { useState } from 'react'
import DatePicker from 'react-datepicker'

const dateRangeWidget: CustomAutocompleteWidget = {
  render: ({ onConfirm, onCancel, initialValue }: CustomWidgetProps) => {
    const initial = initialValue as [Date, Date] | undefined
    const [startDate, setStartDate] = useState<Date | null>(initial?.[0] ?? null)
    const [endDate, setEndDate] = useState<Date | null>(initial?.[1] ?? null)

    const handleConfirm = () => {
      if (startDate && endDate) {
        const display = `${formatDate(startDate)} to ${formatDate(endDate)}`
        onConfirm([startDate, endDate], display)
      }
    }

    const isValid = startDate && endDate && startDate <= endDate

    return (
      <div className="date-range-widget">
        <div className="date-range-widget__pickers">
          <div className="date-range-widget__picker">
            <label>Start Date</label>
            <DatePicker
              selected={startDate}
              onChange={setStartDate}
              selectsStart
              startDate={startDate}
              endDate={endDate}
              maxDate={endDate ?? undefined}
              inline
            />
          </div>
          <div className="date-range-widget__picker">
            <label>End Date</label>
            <DatePicker
              selected={endDate}
              onChange={setEndDate}
              selectsEnd
              startDate={startDate}
              endDate={endDate}
              minDate={startDate ?? undefined}
              inline
            />
          </div>
        </div>

        {startDate && endDate && (
          <div className="date-range-widget__summary">
            Selected: {formatDate(startDate)} to {formatDate(endDate)}
            ({Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))} days)
          </div>
        )}

        <div className="date-range-widget__actions">
          <button onClick={handleConfirm} disabled={!isValid}>
            Apply
          </button>
          <button onClick={onCancel}>Cancel</button>
        </div>
      </div>
    )
  },

  validate: (value: unknown): boolean => {
    if (!Array.isArray(value) || value.length !== 2) return false
    const [start, end] = value as [Date, Date]
    return start instanceof Date && end instanceof Date && start <= end
  },

  serialize: (value: unknown): string => {
    const [start, end] = value as [Date, Date]
    return `${start.toISOString()},${end.toISOString()}`
  },

  parse: (serialized: string): unknown => {
    const [start, end] = serialized.split(',').map(s => new Date(s))
    return [start, end]
  },
}

function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}
```

## Styling Custom Widgets

```css
/* Generic widget styles */
.custom-widget {
  padding: 16px;
  background: #ffffff;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  max-width: 400px;
}

.custom-widget__actions {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #e0e0e0;
}

.custom-widget__actions button {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.custom-widget__actions button:first-child {
  background: #1976d2;
  color: white;
}

.custom-widget__actions button:first-child:disabled {
  background: #bdbdbd;
  cursor: not-allowed;
}

.custom-widget__actions button:last-child {
  background: #f5f5f5;
  color: #333;
}

/* Tags widget */
.tags-widget__container {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  padding: 8px;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  min-height: 44px;
}

.tags-widget__tag {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  background: #e3f2fd;
  border-radius: 4px;
  font-size: 14px;
}

.tags-widget__tag button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  padding: 0;
  border: none;
  background: transparent;
  cursor: pointer;
  font-size: 14px;
}

.tags-widget__container input {
  flex: 1;
  min-width: 100px;
  border: none;
  outline: none;
  font-size: 14px;
}

/* Slider range widget */
.slider-range-widget__row {
  margin-bottom: 16px;
}

.slider-range-widget__row label {
  display: block;
  margin-bottom: 4px;
  font-weight: 500;
}

.slider-range-widget__row input[type="range"] {
  width: 100%;
}

.slider-range-widget__display {
  padding: 8px;
  background: #f5f5f5;
  border-radius: 4px;
  text-align: center;
  font-weight: 500;
}

/* Date range widget */
.date-range-widget__pickers {
  display: flex;
  gap: 16px;
}

.date-range-widget__picker label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
}

.date-range-widget__summary {
  margin-top: 16px;
  padding: 8px;
  background: #e8f5e9;
  border-radius: 4px;
  text-align: center;
}
```

## Integration with Schema

```typescript
import { FilterSchema } from 'react-select-filter-box'

const schema: FilterSchema = {
  fields: [
    // Color field with color picker
    {
      key: 'backgroundColor',
      label: 'Background Color',
      type: 'custom',
      group: 'Appearance',
      operators: [{
        key: 'eq',
        label: 'is',
        customInput: colorPickerWidget,
      }],
    },

    // Tags field with multi-select
    {
      key: 'tags',
      label: 'Tags',
      type: 'custom',
      group: 'Organization',
      operators: [{
        key: 'containsAny',
        label: 'contains any of',
        customInput: tagsWidget,
      }, {
        key: 'containsAll',
        label: 'contains all of',
        customInput: tagsWidget,
      }],
    },

    // Price range with slider
    {
      key: 'price',
      label: 'Price',
      type: 'number',
      group: 'Details',
      widgetOptions: { min: 0, max: 10000, step: 100 },
      operators: [{
        key: 'between',
        label: 'between',
        customInput: sliderRangeWidget,
      }],
    },

    // Date range with rich picker
    {
      key: 'createdAt',
      label: 'Created Date',
      type: 'date',
      group: 'Dates',
      operators: [{
        key: 'between',
        label: 'between',
        customInput: dateRangeWidget,
      }],
    },
  ],
}
```

## Best Practices

1. **Always handle keyboard navigation** - Support Enter to confirm, Escape to cancel
2. **Provide visual feedback** - Show the current value clearly
3. **Validate on confirm** - Don't allow invalid values to be submitted
4. **Auto-focus the primary input** - Improve keyboard accessibility
5. **Keep the UI compact** - Widget should fit within dropdown area
6. **Support initial values** - For editing existing tokens

## Next Steps

- [Schema Definition Guide](../guides/schema-definition.md)
- [Theming Guide](../guides/theming.md)
- [Custom Autocompleters Guide](../guides/custom-autocompleters.md)
