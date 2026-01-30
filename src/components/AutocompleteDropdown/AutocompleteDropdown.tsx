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

  // Group items by their group property
  const groupedItems = items.reduce<{ group: string | undefined; items: { item: AutocompleteItem; originalIndex: number }[] }[]>(
    (acc, item, originalIndex) => {
      const group = item.group
      const existingGroup = acc.find((g) => g.group === group)
      if (existingGroup) {
        existingGroup.items.push({ item, originalIndex })
      } else {
        acc.push({ group, items: [{ item, originalIndex }] })
      }
      return acc
    },
    []
  )

  // Move ungrouped items (group === undefined) to the end
  const sortedGroups = [
    ...groupedItems.filter((g) => g.group !== undefined),
    ...groupedItems.filter((g) => g.group === undefined),
  ]

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
        sortedGroups.map((groupData) => (
          <li key={groupData.group ?? '__ungrouped'} className="autocomplete-group">
            {groupData.group && (
              <div className="autocomplete-group__header" role="presentation">
                {groupData.group}
              </div>
            )}
            <ul className="autocomplete-group__items" role="group">
              {groupData.items.map(({ item, originalIndex }) => {
                const isHighlighted = originalIndex === highlightedIndex
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
                    onMouseEnter={() => onHighlight(originalIndex)}
                  >
                    {renderItem ? (
                      renderItem(item, isHighlighted)
                    ) : (
                      <DefaultItem item={item} isHighlighted={isHighlighted} isDisabled={isDisabled} />
                    )}
                  </li>
                )
              })}
            </ul>
          </li>
        ))
      )}
    </ul>
  )
}
