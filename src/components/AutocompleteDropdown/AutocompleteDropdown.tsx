/**
 * AutocompleteDropdown Component
 *
 * Dropdown list for autocomplete suggestions.
 * Supports virtual scrolling for large lists (>100 items).
 */

import { type ReactNode, useRef, useCallback, memo } from 'react'
import { clsx } from 'clsx'
import type { AutocompleteItem } from '@/types'
import { useVirtualList } from '@/hooks'
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
  /**
   * Enable virtual scrolling for large lists.
   * When true (or 'auto' with >100 items), only visible items are rendered.
   */
  virtualScrolling?: boolean | 'auto'
  /** Height of each item in pixels (for virtual scrolling) */
  itemHeight?: number
}

/**
 * Memoized default item renderer for performance optimization.
 * Only re-renders when item, highlight, or disabled state changes.
 */
const DefaultItem = memo(function DefaultItem({
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
})

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
  virtualScrolling = 'auto',
  itemHeight = 40,
}: AutocompleteDropdownProps) {
  const scrollContainerRef = useRef<HTMLUListElement>(null)

  // Determine if we should use virtual scrolling
  const shouldVirtualize =
    virtualScrolling === true || (virtualScrolling === 'auto' && items.length > 100)

  // Check if any items have groups (virtual scrolling doesn't support groups)
  const hasGroups = items.some((item) => item.group !== undefined)
  const useVirtual = shouldVirtualize && !hasGroups

  // Virtual list hook
  const virtualList = useVirtualList({
    itemCount: items.length,
    itemHeight,
    containerHeight: maxHeight,
    overscan: 3,
    highlightedIndex,
  })

  const handleScroll = useCallback(
    (e: React.UIEvent<HTMLUListElement>) => {
      if (useVirtual) {
        virtualList.onScroll(e.currentTarget.scrollTop)
      }
    },
    [useVirtual, virtualList]
  )

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

  // Render loading or empty state
  if (isLoading) {
    return (
      <ul
        id={id}
        role="listbox"
        aria-label="Suggestions"
        className={clsx('autocomplete-dropdown', className)}
        style={style}
        onMouseDown={handleMouseDown}
      >
        <li className="autocomplete-dropdown__message">{loadingMessage}</li>
      </ul>
    )
  }

  if (items.length === 0) {
    return (
      <ul
        id={id}
        role="listbox"
        aria-label="Suggestions"
        className={clsx('autocomplete-dropdown', className)}
        style={style}
        onMouseDown={handleMouseDown}
      >
        <li className="autocomplete-dropdown__message">{emptyMessage}</li>
      </ul>
    )
  }

  // Virtual scrolling mode (flat list, no groups)
  if (useVirtual) {
    return (
      <ul
        id={id}
        ref={(node) => {
          virtualList.scrollContainerRef(node)
          if (scrollContainerRef.current !== node) {
            ;(scrollContainerRef as React.MutableRefObject<HTMLUListElement | null>).current = node
          }
        }}
        role="listbox"
        aria-label="Suggestions"
        className={clsx('autocomplete-dropdown', 'autocomplete-dropdown--virtual', className)}
        style={style}
        onMouseDown={handleMouseDown}
        onScroll={handleScroll}
      >
        <li
          className="autocomplete-dropdown__virtual-spacer"
          style={{ height: virtualList.totalHeight, position: 'relative' }}
          aria-hidden="true"
        >
          <ul
            className="autocomplete-dropdown__virtual-items"
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              transform: `translateY(${virtualList.offsetTop}px)`,
            }}
          >
            {virtualList.virtualItems.map(({ index }) => {
              const item = items[index]
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
                  style={{ height: itemHeight }}
                  onClick={(e) => handleItemClick(item, e)}
                  onMouseEnter={() => onHighlight(index)}
                >
                  {renderItem ? (
                    renderItem(item, isHighlighted)
                  ) : (
                    <DefaultItem
                      item={item}
                      isHighlighted={isHighlighted}
                      isDisabled={isDisabled}
                    />
                  )}
                </li>
              )
            })}
          </ul>
        </li>
      </ul>
    )
  }

  // Standard mode with groups support
  // Group items by their group property, preserving original order for keyboard navigation
  const groupedItems = items.reduce<
    { group: string | undefined; items: { item: AutocompleteItem; originalIndex: number }[] }[]
  >((acc, item, originalIndex) => {
    const group = item.group
    const existingGroup = acc.find((g) => g.group === group)
    if (existingGroup) {
      existingGroup.items.push({ item, originalIndex })
    } else {
      acc.push({ group, items: [{ item, originalIndex }] })
    }
    return acc
  }, [])

  // NOTE: We intentionally do NOT reorder groups here to preserve keyboard navigation order.
  // The highlightedIndex corresponds to the original items array order, so visual reordering
  // would cause a mismatch between keyboard navigation (by index) and visual order.
  // Groups are displayed in the order they first appear in the items array.

  return (
    <ul
      id={id}
      role="listbox"
      aria-label="Suggestions"
      className={clsx('autocomplete-dropdown', className)}
      style={style}
      onMouseDown={handleMouseDown}
    >
      {groupedItems.map((groupData) => (
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
                    <DefaultItem
                      item={item}
                      isHighlighted={isHighlighted}
                      isDisabled={isDisabled}
                    />
                  )}
                </li>
              )
            })}
          </ul>
        </li>
      ))}
    </ul>
  )
}
