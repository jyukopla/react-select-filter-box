/**
 * Virtual List Hook
 *
 * Provides virtual scrolling for large lists, rendering only visible items.
 */

import { useState, useCallback, useMemo, useRef, useEffect } from 'react'

export interface UseVirtualListOptions {
  /** Total number of items in the list */
  itemCount: number
  /** Height of each item in pixels */
  itemHeight: number
  /** Height of the container/viewport in pixels */
  containerHeight: number
  /** Number of items to render above and below the visible area */
  overscan?: number
  /** Currently highlighted/focused item index for scroll-into-view */
  highlightedIndex?: number
}

export interface UseVirtualListResult {
  /** Total height of the virtual list (for scroll container) */
  totalHeight: number
  /** Start index of items to render */
  startIndex: number
  /** End index of items to render (exclusive) */
  endIndex: number
  /** Offset from top for the first rendered item */
  offsetTop: number
  /** Items currently visible with their indices and positions */
  virtualItems: VirtualItem[]
  /** Callback to handle scroll events */
  onScroll: (scrollTop: number) => void
  /** Current scroll position */
  scrollTop: number
  /** Ref callback to attach to the scroll container */
  scrollContainerRef: (node: HTMLElement | null) => void
  /** Scroll to a specific item index */
  scrollToIndex: (index: number, behavior?: ScrollBehavior) => void
}

export interface VirtualItem {
  /** Original index in the list */
  index: number
  /** Start position from top */
  start: number
  /** Size of the item */
  size: number
}

/**
 * Hook for virtual scrolling of large lists
 */
export function useVirtualList({
  itemCount,
  itemHeight,
  containerHeight,
  overscan = 3,
  highlightedIndex,
}: UseVirtualListOptions): UseVirtualListResult {
  const [scrollTop, setScrollTop] = useState(0)
  const scrollContainerNodeRef = useRef<HTMLElement | null>(null)

  // Calculate total height
  const totalHeight = itemCount * itemHeight

  // Calculate visible range
  const { startIndex, endIndex, offsetTop } = useMemo(() => {
    // First visible item
    const start = Math.floor(scrollTop / itemHeight)
    // Number of items that fit in viewport
    const visibleCount = Math.ceil(containerHeight / itemHeight)
    // Last visible item (exclusive)
    const end = start + visibleCount

    // Apply overscan
    const startWithOverscan = Math.max(0, start - overscan)
    const endWithOverscan = Math.min(itemCount, end + overscan)

    return {
      startIndex: startWithOverscan,
      endIndex: endWithOverscan,
      offsetTop: startWithOverscan * itemHeight,
    }
  }, [scrollTop, itemHeight, containerHeight, itemCount, overscan])

  // Generate virtual items
  const virtualItems = useMemo(() => {
    const items: VirtualItem[] = []
    for (let i = startIndex; i < endIndex; i++) {
      items.push({
        index: i,
        start: i * itemHeight,
        size: itemHeight,
      })
    }
    return items
  }, [startIndex, endIndex, itemHeight])

  // Handle scroll
  const onScroll = useCallback((newScrollTop: number) => {
    setScrollTop(newScrollTop)
  }, [])

  // Scroll container ref callback
  const scrollContainerRef = useCallback((node: HTMLElement | null) => {
    scrollContainerNodeRef.current = node
  }, [])

  // Scroll to specific index
  const scrollToIndex = useCallback(
    (index: number, behavior: ScrollBehavior = 'auto') => {
      const container = scrollContainerNodeRef.current
      if (!container) return

      const itemTop = index * itemHeight
      const itemBottom = itemTop + itemHeight
      const viewportTop = container.scrollTop
      const viewportBottom = viewportTop + containerHeight

      // Check if item is already fully visible
      if (itemTop >= viewportTop && itemBottom <= viewportBottom) {
        return // Already visible, no need to scroll
      }

      // Scroll to make item visible
      let newScrollTop: number
      if (itemTop < viewportTop) {
        // Item is above viewport, scroll up
        newScrollTop = itemTop
      } else {
        // Item is below viewport, scroll down
        newScrollTop = itemBottom - containerHeight
      }

      container.scrollTo({
        top: newScrollTop,
        behavior,
      })
    },
    [itemHeight, containerHeight]
  )

  // Auto-scroll when highlighted index changes
  useEffect(() => {
    if (highlightedIndex !== undefined && highlightedIndex >= 0) {
      scrollToIndex(highlightedIndex, 'smooth')
    }
  }, [highlightedIndex, scrollToIndex])

  return {
    totalHeight,
    startIndex,
    endIndex,
    offsetTop,
    virtualItems,
    onScroll,
    scrollTop,
    scrollContainerRef,
    scrollToIndex,
  }
}
