/**
 * useFocusManagement Hook
 *
 * Manages focus trap within the FilterBox component and restores focus
 * after dropdown closes.
 */

import { useRef, useCallback, useEffect } from 'react'

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
}: UseFocusManagementProps): UseFocusManagementReturn {
  // Store the element that had focus before the component was activated
  const focusOriginRef = useRef<HTMLElement | null>(null)

  // Store the last known focus position within the component
  const lastInternalFocusRef = useRef<HTMLElement | null>(null)

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
   * Check if focus is currently within the component
   */
  const isFocusWithin = useCallback((): boolean => {
    const activeElement = document.activeElement
    return containerRef.current?.contains(activeElement) ?? false
  }, [containerRef])

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
        // Store last internal focus position
        if (e.target instanceof HTMLElement) {
          lastInternalFocusRef.current = e.target
        }

        // If dropdown is open, trap focus back to input
        if (isDropdownOpen && inputRef.current) {
          // Use requestAnimationFrame to avoid conflicts with other focus handlers
          requestAnimationFrame(() => {
            // Only refocus if still open and focus went outside
            if (!container.contains(document.activeElement)) {
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
  }, [isDropdownOpen, isEditing, containerRef, inputRef])

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
