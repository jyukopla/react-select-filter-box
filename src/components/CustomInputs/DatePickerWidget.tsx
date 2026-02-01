/**
 * DatePickerWidget
 *
 * A custom date picker widget for selecting dates in the filter dropdown.
 */

import { useState, useCallback, useRef, useEffect } from 'react'
import type { CustomAutocompleteWidget, CustomWidgetProps } from '@/types'
import './CustomInputs.css'

export interface DatePickerWidgetOptions {
  /** Date format for display (simple format) */
  dateFormat?: string
  /** Minimum selectable date */
  minDate?: Date
  /** Maximum selectable date */
  maxDate?: Date
  /** Locale for date formatting */
  locale?: string
  /** Show preset options (Today, Yesterday, etc.) */
  showPresets?: boolean
  /** Custom preset options */
  presets?: Array<{ label: string; value: Date }>
}

const DEFAULT_PRESETS = [
  { label: 'Today', getDays: () => 0 },
  { label: 'Yesterday', getDays: () => -1 },
  { label: 'Last 7 days', getDays: () => -7 },
  { label: 'Last 30 days', getDays: () => -30 },
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
 * DatePicker component for rendering inside dropdown
 */
function DatePickerComponent({
  onConfirm,
  onCancel,
  initialValue,
  options = {},
}: CustomWidgetProps & { options?: DatePickerWidgetOptions }) {
  const { minDate, maxDate, locale = 'en-US', showPresets = true, presets } = options

  const [selectedDate, setSelectedDate] = useState<Date | null>(
    initialValue instanceof Date ? initialValue : null
  )
  const inputRef = useRef<HTMLInputElement>(null)

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const handleDateChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const date = parseDateFromInput(e.target.value)
    setSelectedDate(date)
  }, [])

  const handleConfirm = useCallback(() => {
    if (selectedDate) {
      onConfirm(selectedDate, formatDateForDisplay(selectedDate, locale))
    }
  }, [selectedDate, onConfirm, locale])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && selectedDate) {
        e.preventDefault()
        handleConfirm()
      } else if (e.key === 'Escape') {
        e.preventDefault()
        onCancel()
      }
    },
    [selectedDate, handleConfirm, onCancel]
  )

  const handlePresetClick = useCallback(
    (preset: { label: string; getDays: () => number }) => {
      const date = new Date()
      date.setDate(date.getDate() + preset.getDays())
      date.setHours(0, 0, 0, 0)
      onConfirm(date, preset.label)
    },
    [onConfirm]
  )

  const displayPresets =
    presets?.map((p) => ({
      label: p.label,
      getDays: () => Math.floor((p.value.getTime() - Date.now()) / (1000 * 60 * 60 * 24)),
    })) ?? DEFAULT_PRESETS

  return (
    <div className="custom-widget custom-widget--date-picker" onKeyDown={handleKeyDown}>
      <div className="custom-widget__header">
        <span className="custom-widget__title">Select Date</span>
      </div>

      <div className="custom-widget__content">
        <input
          ref={inputRef}
          type="date"
          className="custom-widget__date-input"
          value={selectedDate ? formatDateForInput(selectedDate) : ''}
          onChange={handleDateChange}
          min={minDate ? formatDateForInput(minDate) : undefined}
          max={maxDate ? formatDateForInput(maxDate) : undefined}
        />

        {showPresets && (
          <div className="custom-widget__presets">
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
          disabled={!selectedDate}
        >
          Confirm
        </button>
      </div>
    </div>
  )
}

/**
 * Create a DatePicker widget for use with autocomplete
 */
export function createDatePickerWidget(
  options: DatePickerWidgetOptions = {}
): CustomAutocompleteWidget {
  return {
    render: (props: CustomWidgetProps) => <DatePickerComponent {...props} options={options} />,
    validate: (value: unknown) => value instanceof Date && !isNaN(value.getTime()),
    serialize: (value: unknown) => {
      if (value instanceof Date) {
        return value.toISOString()
      }
      return String(value)
    },
    parse: (serialized: string) => {
      const date = new Date(serialized)
      return isNaN(date.getTime()) ? null : date
    },
  }
}

/**
 * Default DatePicker widget instance
 */
export const DatePickerWidget = createDatePickerWidget()
