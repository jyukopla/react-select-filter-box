/**
 * AutocompleteDropdown Component
 *
 * Dropdown list for autocomplete suggestions.
 */

import type { ReactNode } from 'react'
import { clsx } from 'clsx'
import type { AutocompleteItem } from '@/types'
import './AutocompleteDropdown.css'

export interface AutocompleteDropdownProps {
  /** Unique ID for the dropdown */
  id?: string
  /** Whether the dropdown is open */
  isOpen: boolean
  /** Items to display */
  items: AutocompleteItem[]
  /** Currently highlighted index */
  highlightedIndex: number
  /** Called when an item is selected */
  onSelect: (item: AutocompleteItem) => void
  /** Called when an item is highlighted */
  onHighlight: (index: number) => void
  /** Dropdown position (for portal rendering) */
  position?: { top: number; left: number; width: number }
  /** Maximum height of dropdown */
  maxHeight?: number
  /** Custom item renderer */
  renderItem?: (item: AutocompleteItem, isHighlighted: boolean) => ReactNode
  /** Message shown when no items */
  emptyMessage?: string
  /** Message shown when loading */
  loadingMessage?: string
  /** Whether items are loading */
  isLoading?: boolean
  /** Additional CSS class */
  className?: string
}

/**
 * Default item renderer
 */
function DefaultItem({
  item,
  isHighlighted,
  isDisabled,
}: {
  item: AutocompleteItem
  isHighlighted: boolean
  isDisabled: boolean
}) {
  return (
    <div
      className={clsx('autocomplete-item__content', {
        'autocomplete-item__content--highlighted': isHighlighted,
        'autocomplete-item__content--disabled': isDisabled,
      })}
    >
      {item.icon && <span className="autocomplete-item__icon">{item.icon}</span>}
      <div className="autocomplete-item__text">
        <span className="autocomplete-item__label">{item.label}</span>
        {item.description && (
          <span className="autocomplete-item__description">{item.description}</span>
        )}
      </div>
    </div>
  )
}

/**
 * AutocompleteDropdown component
 */
export function AutocompleteDropdown({
  id,
  isOpen,
  items,
  highlightedIndex,
  onSelect,
  onHighlight,
  position,
  maxHeight = 300,
  renderItem,
  emptyMessage = 'No results found',
  loadingMessage = 'Loading...',
  isLoading = false,
  className,
}: AutocompleteDropdownProps) {
  if (!isOpen) {
    return null
  }

  const style = position
    ? {
        position: 'absolute' as const,
        top: position.top,
        left: position.left,
        width: position.width,
        maxHeight,
      }
    : { maxHeight }

  const handleItemClick = (item: AutocompleteItem, e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()
    if (!item.disabled) {
      onSelect(item)
    }
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    // Prevent focus loss on the input when clicking dropdown items
    e.preventDefault()
  }

  return (
    <ul
      id={id}
      role="listbox"
      aria-label="Suggestions"
      className={clsx('autocomplete-dropdown', className)}
      style={style}
      onMouseDown={handleMouseDown}
    >
      {isLoading ? (
        <li className="autocomplete-dropdown__message">{loadingMessage}</li>
      ) : items.length === 0 ? (
        <li className="autocomplete-dropdown__message">{emptyMessage}</li>
      ) : (
        items.map((item, index) => {
          const isHighlighted = index === highlightedIndex
          const isDisabled = item.disabled ?? false

          return (
            <li
              key={item.key}
              role="option"
              aria-selected={isHighlighted}
              aria-disabled={isDisabled}
              className={clsx('autocomplete-item', {
                'autocomplete-item--highlighted': isHighlighted,
                'autocomplete-item--disabled': isDisabled,
              })}
              onClick={(e) => handleItemClick(item, e)}
              onMouseEnter={() => onHighlight(index)}
            >
              {renderItem ? (
                renderItem(item, isHighlighted)
              ) : (
                <DefaultItem item={item} isHighlighted={isHighlighted} isDisabled={isDisabled} />
              )}
            </li>
          )
        })
      )}
    </ul>
  )
}
