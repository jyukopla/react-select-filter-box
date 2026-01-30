/**
 * DateRangeWidget
 *
 * A custom widget for selecting date ranges (e.g., for "between" operators).
 */

import { useState, useCallback, useRef, useEffect } from 'react'
import type { CustomAutocompleteWidget, CustomWidgetProps } from '@/types'
import './CustomInputs.css'

export interface DateRangeWidgetOptions {
  /** Minimum selectable date */
  minDate?: Date
  /** Maximum selectable date */
  maxDate?: Date
  /** Locale for date formatting */
  locale?: string
  /** Labels for from/to fields */
  labels?: { from: string; to: string }
  /** Show preset ranges */
  showPresets?: boolean
  /** Custom preset ranges */
  presets?: Array<{ label: string; from: Date; to: Date }>
}

export interface DateRange {
  from: Date
  to: Date
}

const DEFAULT_RANGE_PRESETS = [
  {
    label: 'Last 7 days',
    getDates: () => {
      const to = new Date()
      const from = new Date()
      from.setDate(from.getDate() - 7)
      return { from, to }
    },
  },
  {
    label: 'Last 30 days',
    getDates: () => {
      const to = new Date()
      const from = new Date()
      from.setDate(from.getDate() - 30)
      return { from, to }
    },
  },
  {
    label: 'This month',
    getDates: () => {
      const to = new Date()
      const from = new Date(to.getFullYear(), to.getMonth(), 1)
      return { from, to }
    },
  },
  {
    label: 'Last month',
    getDates: () => {
      const now = new Date()
      const from = new Date(now.getFullYear(), now.getMonth() - 1, 1)
      const to = new Date(now.getFullYear(), now.getMonth(), 0)
      return { from, to }
    },
  },
]

/**
 * Format a date for display
 */
function formatDateForDisplay(date: Date, locale: string = 'en-US'): string {
  return date.toLocaleDateString(locale, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

/**
 * Format a date for input[type="date"]
 */
function formatDateForInput(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/**
 * Parse a date from input[type="date"]
 */
function parseDateFromInput(value: string): Date | null {
  if (!value) return null
  const date = new Date(value + 'T00:00:00')
  return isNaN(date.getTime()) ? null : date
}

/**
 * Format a date range for display
 */
function formatRangeForDisplay(range: DateRange, locale: string = 'en-US'): string {
  return `${formatDateForDisplay(range.from, locale)} to ${formatDateForDisplay(range.to, locale)}`
}

/**
 * DateRange component for rendering inside dropdown
 */
function DateRangeComponent({
  onConfirm,
  onCancel,
  initialValue,
  options = {},
}: CustomWidgetProps & { options?: DateRangeWidgetOptions }) {
  const {
    minDate,
    maxDate,
    locale = 'en-US',
    labels = { from: 'From', to: 'To' },
    showPresets = true,
    presets,
  } = options

  const initial = initialValue as DateRange | undefined
  const [fromDate, setFromDate] = useState<Date | null>(initial?.from ?? null)
  const [toDate, setToDate] = useState<Date | null>(initial?.to ?? null)
  const [error, setError] = useState<string | null>(null)
  const fromInputRef = useRef<HTMLInputElement>(null)

  // Focus first input on mount
  useEffect(() => {
    fromInputRef.current?.focus()
  }, [])

  const validateRange = useCallback((from: Date | null, to: Date | null): string | null => {
    if (!from || !to) return null
    if (from > to) return 'Start date must be before end date'
    return null
  }, [])

  const handleFromChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const date = parseDateFromInput(e.target.value)
    setFromDate(date)
    setError(validateRange(date, toDate))
  }, [toDate, validateRange])

  const handleToChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const date = parseDateFromInput(e.target.value)
    setToDate(date)
    setError(validateRange(fromDate, date))
  }, [fromDate, validateRange])

  const handleConfirm = useCallback(() => {
    if (!fromDate || !toDate) return
    const validationError = validateRange(fromDate, toDate)
    if (validationError) {
      setError(validationError)
      return
    }
    const range: DateRange = { from: fromDate, to: toDate }
    onConfirm(range, formatRangeForDisplay(range, locale))
  }, [fromDate, toDate, validateRange, onConfirm, locale])

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && fromDate && toDate && !error) {
      e.preventDefault()
      handleConfirm()
    } else if (e.key === 'Escape') {
      e.preventDefault()
      onCancel()
    }
  }, [fromDate, toDate, error, handleConfirm, onCancel])

  const handlePresetClick = useCallback((preset: { label: string; getDates: () => { from: Date; to: Date } }) => {
    const { from, to } = preset.getDates()
    const range: DateRange = { from, to }
    onConfirm(range, preset.label)
  }, [onConfirm])

  const displayPresets = presets?.map(p => ({
    label: p.label,
    getDates: () => ({ from: p.from, to: p.to }),
  })) ?? DEFAULT_RANGE_PRESETS

  const isValid = fromDate !== null && toDate !== null && !error

  return (
    <div className="custom-widget custom-widget--date-range" onKeyDown={handleKeyDown}>
      <div className="custom-widget__header">
        <span className="custom-widget__title">Select Date Range</span>
      </div>
      
      <div className="custom-widget__content">
        <div className="custom-widget__date-range-fields">
          <div className="custom-widget__field">
            <label className="custom-widget__label">{labels.from}</label>
            <input
              ref={fromInputRef}
              type="date"
              className="custom-widget__date-input"
              value={fromDate ? formatDateForInput(fromDate) : ''}
              onChange={handleFromChange}
              min={minDate ? formatDateForInput(minDate) : undefined}
              max={toDate ? formatDateForInput(toDate) : maxDate ? formatDateForInput(maxDate) : undefined}
            />
          </div>
          <div className="custom-widget__field">
            <label className="custom-widget__label">{labels.to}</label>
            <input
              type="date"
              className="custom-widget__date-input"
              value={toDate ? formatDateForInput(toDate) : ''}
              onChange={handleToChange}
              min={fromDate ? formatDateForInput(fromDate) : minDate ? formatDateForInput(minDate) : undefined}
              max={maxDate ? formatDateForInput(maxDate) : undefined}
            />
          </div>
        </div>
        
        {error && <div className="custom-widget__error">{error}</div>}
        
        {showPresets && (
          <div className="custom-widget__presets custom-widget__presets--range">
            {displayPresets.map((preset) => (
              <button
                key={preset.label}
                type="button"
                className="custom-widget__preset-btn"
                onClick={() => handlePresetClick(preset)}
              >
                {preset.label}
              </button>
            ))}
          </div>
        )}
      </div>
      
      <div className="custom-widget__footer">
        <button
          type="button"
          className="custom-widget__btn custom-widget__btn--cancel"
          onClick={onCancel}
        >
          Cancel
        </button>
        <button
          type="button"
          className="custom-widget__btn custom-widget__btn--confirm"
          onClick={handleConfirm}
          disabled={!isValid}
        >
          Confirm
        </button>
      </div>
    </div>
  )
}

/**
 * Create a DateRange widget for use with autocomplete
 */
export function createDateRangeWidget(options: DateRangeWidgetOptions = {}): CustomAutocompleteWidget {
  return {
    render: (props: CustomWidgetProps) => (
      <DateRangeComponent {...props} options={options} />
    ),
    validate: (value: unknown) => {
      if (!value || typeof value !== 'object') return false
      const range = value as DateRange
      return (
        range.from instanceof Date &&
        range.to instanceof Date &&
        !isNaN(range.from.getTime()) &&
        !isNaN(range.to.getTime()) &&
        range.from <= range.to
      )
    },
    serialize: (value: unknown) => {
      const range = value as DateRange
      return JSON.stringify({
        from: range.from.toISOString(),
        to: range.to.toISOString(),
      })
    },
    parse: (serialized: string) => {
      try {
        const parsed = JSON.parse(serialized)
        return {
          from: new Date(parsed.from),
          to: new Date(parsed.to),
        }
      } catch {
        return null
      }
    },
  }
}

/**
 * Default DateRange widget instance
 */
export const DateRangeWidget = createDateRangeWidget()
