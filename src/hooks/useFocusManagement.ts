/**
 * useFocusManagement Hook
 *
 * Manages focus trap within the FilterBox component and restores focus
 * after dropdown closes.
 */

import { useRef, useCallback, useEffect } from 'react'
import { FILTER_BOX_PORTAL_ATTR } from '@/components/DropdownPortal/DropdownPortal'

export interface UseFocusManagementProps {
  /** Whether the dropdown is currently open */
  isDropdownOpen: boolean
  /** Whether the component is in editing mode */
  isEditing: boolean
  /** Ref to the main input element */
  inputRef: React.RefObject<HTMLInputElement | null>
  /** Ref to the container element */
  containerRef: React.RefObject<HTMLDivElement | null>
  /** Callback when focus should be trapped */
  onFocusTrap?: () => void
  /** Unique portal ID used to identify associated portal elements */
  portalId?: string
}

export interface UseFocusManagementReturn {
  /** Store the element that had focus before component was activated */
  storeFocusOrigin: () => void
  /** Restore focus to the element that had focus before */
  restoreFocus: () => void
  /** Focus the input element */
  focusInput: () => void
  /** Check if focus is within the component */
  isFocusWithin: () => boolean
}

/**
 * Hook for managing focus trap and restoration in FilterBox
 */
export function useFocusManagement({
  isDropdownOpen,
  isEditing,
  inputRef,
  containerRef,
  portalId,
}: UseFocusManagementProps): UseFocusManagementReturn {
  // Store the element that had focus before the component was activated
  const focusOriginRef = useRef<HTMLElement | null>(null)

  // Store the last known focus position within the component
  const lastInternalFocusRef = useRef<HTMLElement | null>(null)

  /**
   * Check if an element is inside a FilterBox portal
   */
  const isInFilterBoxPortal = useCallback(
    (element: Node | null): boolean => {
      if (!element || !(element instanceof HTMLElement)) return false

      // Check if the element is inside a portal with matching ID or any FilterBox portal
      const portalContainer = element.closest(`[${FILTER_BOX_PORTAL_ATTR}]`)
      if (!portalContainer) return false

      // If we have a specific portal ID, check for exact match
      if (portalId) {
        return portalContainer.getAttribute(FILTER_BOX_PORTAL_ATTR) === portalId
      }

      // Otherwise, consider any FilterBox portal as valid
      return true
    },
    [portalId]
  )

  /**
   * Store the element that currently has focus (before component activation)
   */
  const storeFocusOrigin = useCallback(() => {
    const activeElement = document.activeElement
    if (activeElement instanceof HTMLElement && !containerRef.current?.contains(activeElement)) {
      focusOriginRef.current = activeElement
    }
  }, [containerRef])

  /**
   * Restore focus to the element that had focus before component was activated
   */
  const restoreFocus = useCallback(() => {
    if (focusOriginRef.current && typeof focusOriginRef.current.focus === 'function') {
      // Small delay to ensure DOM is ready
      requestAnimationFrame(() => {
        focusOriginRef.current?.focus()
        focusOriginRef.current = null
      })
    }
  }, [])

  /**
   * Focus the input element
   */
  const focusInput = useCallback(() => {
    if (inputRef.current) {
      inputRef.current.focus()
    }
  }, [inputRef])

  /**
   * Check if focus is currently within the component (including portal)
   */
  const isFocusWithin = useCallback((): boolean => {
    const activeElement = document.activeElement
    const container = containerRef.current
    if (!container) return false

    // Check if focus is in the main container or in the associated portal
    return container.contains(activeElement) || isInFilterBoxPortal(activeElement)
  }, [containerRef, isInFilterBoxPortal])

  /**
   * Handle focus trap - keep focus within the component when dropdown is open
   */
  useEffect(() => {
    if (!isDropdownOpen && !isEditing) {
      return undefined
    }

    const container = containerRef.current
    if (!container) return undefined

    const handleFocusOut = (e: FocusEvent) => {
      const relatedTarget = e.relatedTarget as Node | null

      // If focus is leaving the container
      if (relatedTarget && !container.contains(relatedTarget)) {
        // Check if focus is moving to a FilterBox portal (e.g., custom widget)
        // If so, don't trap focus - allow interaction with the portal content
        if (isInFilterBoxPortal(relatedTarget)) {
          return
        }

        // Store last internal focus position
        if (e.target instanceof HTMLElement) {
          lastInternalFocusRef.current = e.target
        }

        // If dropdown is open, trap focus back to input
        if (isDropdownOpen && inputRef.current) {
          // Use requestAnimationFrame to avoid conflicts with other focus handlers
          requestAnimationFrame(() => {
            // Only refocus if still open and focus went outside (and not in portal)
            const activeElement = document.activeElement
            if (!container.contains(activeElement) && !isInFilterBoxPortal(activeElement)) {
              inputRef.current?.focus()
            }
          })
        }
      }
    }

    container.addEventListener('focusout', handleFocusOut)

    return () => {
      container.removeEventListener('focusout', handleFocusOut)
    }
  }, [isDropdownOpen, isEditing, containerRef, inputRef, isInFilterBoxPortal])

  /**
   * Handle focus restoration after dropdown closes
   */
  useEffect(() => {
    // When dropdown closes, ensure input is focused
    if (!isDropdownOpen && !isEditing && inputRef.current) {
      const container = containerRef.current
      if (container?.contains(document.activeElement)) {
        // Focus is within component, move it to input
        inputRef.current.focus()
      }
    }
  }, [isDropdownOpen, isEditing, inputRef, containerRef])

  return {
    storeFocusOrigin,
    restoreFocus,
    focusInput,
    isFocusWithin,
  }
}
