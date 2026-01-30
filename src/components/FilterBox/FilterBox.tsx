/**
 * FilterBox Component
 *
 * Main component that combines TokenContainer and AutocompleteDropdown
 * to provide a complete filter expression builder.
 */

import { useRef, useId } from 'react'
import clsx from 'clsx'
import { TokenContainer } from '@/components/TokenContainer'
import { AutocompleteDropdown } from '@/components/AutocompleteDropdown'
import { DropdownPortal } from '@/components/DropdownPortal'
import { LiveRegion } from '@/components/LiveRegion'
import { useFilterState, useDropdownPosition, type UseFilterStateProps } from '@/hooks'
import './FilterBox.css'

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
}

export function FilterBox({
  schema,
  value,
  onChange,
  className,
  id,
  disabled = false,
  'aria-label': ariaLabel,
  usePortal = true,
}: FilterBoxProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const generatedId = useId()
  const dropdownId = id ? `${id}-dropdown` : `${generatedId}-dropdown`

  const {
    tokens,
    isDropdownOpen,
    suggestions,
    highlightedIndex,
    inputValue,
    placeholder,
    announcement,
    handleFocus,
    handleBlur,
    handleInputChange,
    handleKeyDown,
    handleSelect,
    handleHighlight,
  } = useFilterState({ schema, value, onChange })

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
    >
      <LiveRegion>{announcement}</LiveRegion>
      <TokenContainer
        tokens={tokens}
        inputRef={inputRef}
        inputValue={inputValue}
        placeholder={placeholder}
        onInputChange={handleInputChange}
        onInputFocus={handleFocus}
        onInputBlur={handleBlur}
        onInputKeyDown={handleKeyDown}
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
}
