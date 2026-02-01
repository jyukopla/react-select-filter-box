import { useState, useEffect, useCallback, RefObject } from 'react'

export interface DropdownPosition {
  top: number
  left: number
  width: number
}

export type DropdownPlacement = 'top' | 'bottom'

export interface UseDropdownPositionOptions {
  /** Reference to the anchor element */
  anchorRef: RefObject<HTMLElement | null>
  /** Whether the dropdown is currently open */
  isOpen: boolean
  /** Expected height of the dropdown (for flip calculation) */
  dropdownHeight?: number
  /** Offset from anchor in pixels */
  offset?: number
  /** Minimum width for the dropdown */
  minWidth?: number
  /** Padding from viewport edges */
  viewportPadding?: number
}

export interface UseDropdownPositionResult {
  /** Calculated position for the dropdown */
  position: DropdownPosition
  /** Current placement (top or bottom) */
  placement: DropdownPlacement
  /** Maximum height available for the dropdown */
  maxHeight: number
  /** Force recalculation of position */
  updatePosition: () => void
}

const DEFAULT_OFFSET = 0
const DEFAULT_VIEWPORT_PADDING = 8

export function useDropdownPosition({
  anchorRef,
  isOpen,
  dropdownHeight = 300,
  offset = DEFAULT_OFFSET,
  minWidth = 0,
  viewportPadding = DEFAULT_VIEWPORT_PADDING,
}: UseDropdownPositionOptions): UseDropdownPositionResult {
  const [position, setPosition] = useState<DropdownPosition>({
    top: 0,
    left: 0,
    width: 0,
  })
  const [placement, setPlacement] = useState<DropdownPlacement>('bottom')
  const [maxHeight, setMaxHeight] = useState<number>(300)

  const calculatePosition = useCallback(() => {
    const anchor = anchorRef.current
    if (!anchor) {
      return
    }

    const rect = anchor.getBoundingClientRect()
    const viewportHeight = window.innerHeight
    const viewportWidth = window.innerWidth

    // Calculate available space above and below
    const spaceBelow = viewportHeight - rect.bottom - viewportPadding
    const spaceAbove = rect.top - viewportPadding

    // Determine placement
    let newPlacement: DropdownPlacement = 'bottom'
    let top: number

    if (spaceBelow >= dropdownHeight) {
      // Enough space below
      newPlacement = 'bottom'
      top = rect.bottom + offset
    } else if (spaceAbove >= dropdownHeight) {
      // Not enough below, but enough above
      newPlacement = 'top'
      top = rect.top - dropdownHeight - offset
    } else if (spaceAbove > spaceBelow) {
      // Neither has enough space, but more space above
      newPlacement = 'top'
      top = rect.top - dropdownHeight - offset
    } else {
      // Default to bottom
      newPlacement = 'bottom'
      top = rect.bottom + offset
    }

    // Calculate width
    let width = Math.max(rect.width, minWidth)

    // Calculate left position with viewport constraints
    let left = rect.left

    // Constrain to left edge
    if (left < viewportPadding) {
      left = viewportPadding
    }

    // Constrain to right edge
    if (left + width > viewportWidth - viewportPadding) {
      // First, try to shift left
      left = viewportWidth - viewportPadding - width
      // If still overflowing left, constrain width
      if (left < viewportPadding) {
        left = viewportPadding
        width = viewportWidth - 2 * viewportPadding
      }
    }

    // Calculate max height based on placement
    const calculatedMaxHeight =
      newPlacement === 'bottom'
        ? viewportHeight - rect.bottom - viewportPadding - offset
        : rect.top - viewportPadding - offset

    setPosition({ top, left, width })
    setPlacement(newPlacement)
    setMaxHeight(Math.max(0, calculatedMaxHeight))
  }, [anchorRef, dropdownHeight, offset, minWidth, viewportPadding])

  // Update position when open state changes or on scroll/resize
  useEffect(() => {
    if (!isOpen) {
      return undefined
    }

    calculatePosition()

    // Recalculate on scroll and resize
    const handleUpdate = () => {
      calculatePosition()
    }

    window.addEventListener('scroll', handleUpdate, true)
    window.addEventListener('resize', handleUpdate)

    return () => {
      window.removeEventListener('scroll', handleUpdate, true)
      window.removeEventListener('resize', handleUpdate)
    }
  }, [isOpen, calculatePosition])

  return {
    position,
    placement,
    maxHeight,
    updatePosition: calculatePosition,
  }
}
