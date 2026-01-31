/**
 * FilterBox Component
 *
 * Main component that combines TokenContainer and AutocompleteDropdown
 * to provide a complete filter expression builder.
 */

import { useRef, useId, useEffect, useImperativeHandle, forwardRef } from 'react'
import clsx from 'clsx'
import { TokenContainer } from '@/components/TokenContainer'
import { AutocompleteDropdown } from '@/components/AutocompleteDropdown'
import { DropdownPortal } from '@/components/DropdownPortal'
import { LiveRegion } from '@/components/LiveRegion'
import { useFilterState, useDropdownPosition, useFocusManagement, type UseFilterStateProps } from '@/hooks'
import { validateExpressions, type ValidationError } from '@/utils'
import './FilterBox.css'

export interface FilterBoxHandle {
  /** Focus the input */
  focus: () => void
  /** Blur the input */
  blur: () => void
  /** Clear all filters */
  clear: () => void
}

export interface FilterBoxProps extends UseFilterStateProps {
  /** Additional CSS class names */
  className?: string
  /** ID for the component */
  id?: string
  /** Whether the filter box is disabled */
  disabled?: boolean
  /** Accessible label for the filter box */
  'aria-label'?: string
  /** Whether to render dropdown in a portal (default: true) */
  usePortal?: boolean
  /** Auto-focus the input on mount */
  autoFocus?: boolean
  /** Show a clear button when there are filters (default: false) */
  showClearButton?: boolean
  /** Callback when validation errors occur */
  onError?: (errors: ValidationError[]) => void
}

export const FilterBox = forwardRef<FilterBoxHandle, FilterBoxProps>(function FilterBox(
  {
    schema,
    value,
    onChange,
    className,
    id,
    disabled = false,
    'aria-label': ariaLabel,
    usePortal = true,
    autoFocus = false,
    showClearButton = false,
    onError,
  },
  ref
) {
  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const generatedId = useId()
  const dropdownId = id ? `${id}-dropdown` : `${generatedId}-dropdown`

  // Validate expressions and call onError when errors change
  useEffect(() => {
    if (onError && value.length > 0) {
      const result = validateExpressions(value, schema)
      if (!result.valid && result.errors.length > 0) {
        onError(result.errors)
      }
    }
  }, [value, schema, onError])

  const {
    tokens,
    isDropdownOpen,
    suggestions,
    highlightedIndex,
    inputValue,
    placeholder,
    announcement,
    editingTokenIndex,
    selectedTokenIndex,
    allTokensSelected,
    handleFocus,
    handleBlur,
    handleInputChange,
    handleKeyDown,
    handleSelect,
    handleHighlight,
    handleClear,
    handleTokenEdit,
    handleTokenEditComplete,
    handleTokenEditCancel,
    handleOperatorEdit,
  } = useFilterState({ schema, value, onChange })

  // Focus management for trap and restoration
  const { focusInput } = useFocusManagement({
    isDropdownOpen,
    isEditing: editingTokenIndex >= 0,
    inputRef,
    containerRef,
  })

  // Expose imperative handle
  useImperativeHandle(ref, () => ({
    focus: () => {
      focusInput()
    },
    blur: () => {
      inputRef.current?.blur()
    },
    clear: () => {
      handleClear()
    },
  }), [handleClear, focusInput])

  // Auto-focus on mount
  useEffect(() => {
    if (autoFocus && !disabled) {
      inputRef.current?.focus()
    }
  }, [autoFocus, disabled])

  const { position, maxHeight } = useDropdownPosition({
    anchorRef: containerRef,
    isOpen: isDropdownOpen && !disabled,
    dropdownHeight: 300,
    offset: 4,
  })

  const dropdownContent = (
    <AutocompleteDropdown
      id={dropdownId}
      items={suggestions}
      isOpen={isDropdownOpen && !disabled}
      highlightedIndex={highlightedIndex}
      onSelect={handleSelect}
      onHighlight={handleHighlight}
      maxHeight={maxHeight}
    />
  )

  return (
    <div
      ref={containerRef}
      className={clsx('filter-box', className)}
      data-disabled={disabled || undefined}
      role="group"
      aria-label={ariaLabel ?? 'Filter expression builder'}
      aria-describedby={tokens.length > 0 ? `${generatedId}-status` : undefined}
    >
      <LiveRegion>{announcement}</LiveRegion>
      {/* Hidden status for screen readers */}
      {tokens.length > 0 && (
        <div id={`${generatedId}-status`} className="sr-only">
          {`${Math.ceil(tokens.length / 4)} filter expression${Math.ceil(tokens.length / 4) !== 1 ? 's' : ''} applied`}
        </div>
      )}
      <div className="filter-box__content">
        <TokenContainer
          tokens={tokens}
          inputRef={inputRef}
          inputValue={inputValue}
        placeholder={placeholder}
        onInputChange={handleInputChange}
        onInputFocus={handleFocus}
        onInputBlur={handleBlur}
        onInputKeyDown={handleKeyDown}
        onTokenClick={handleTokenEdit}
        onOperatorClick={handleOperatorEdit}
        editingTokenIndex={editingTokenIndex}
        selectedTokenIndex={selectedTokenIndex}
        allTokensSelected={allTokensSelected}
        onTokenEditComplete={handleTokenEditComplete}
        onTokenEditCancel={handleTokenEditCancel}
        disabled={disabled}
        inputProps={{
          'aria-autocomplete': 'list',
          'aria-controls': isDropdownOpen ? dropdownId : undefined,
          'aria-expanded': isDropdownOpen,
          'aria-label': ariaLabel,
          'aria-activedescendant':
            isDropdownOpen && suggestions[highlightedIndex]
              ? `${dropdownId}-item-${highlightedIndex}`
              : undefined,
        }}
      />
        {showClearButton && tokens.length > 0 && !disabled && (
          <button
            type="button"
            className="filter-box__clear-button"
            onClick={handleClear}
            aria-label="Clear all filters"
          >
            ×
          </button>
        )}
      </div>
      {usePortal ? (
        <DropdownPortal>
          {isDropdownOpen && !disabled && (
            <div
              className="filter-box-dropdown-portal"
              style={{
                position: 'fixed',
                top: position.top,
                left: position.left,
                width: position.width,
                zIndex: 9999,
              }}
            >
              {dropdownContent}
            </div>
          )}
        </DropdownPortal>
      ) : (
        dropdownContent
      )}
    </div>
  )
})
