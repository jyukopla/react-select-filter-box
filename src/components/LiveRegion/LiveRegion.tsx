/**
 * LiveRegion Component
 *
 * Provides an ARIA live region for screen reader announcements.
 * Visually hidden but accessible to assistive technology.
 */

import { useState, useCallback, useEffect, type ReactNode, type HTMLAttributes } from 'react'
import clsx from 'clsx'
import './LiveRegion.css'

export interface LiveRegionProps extends HTMLAttributes<HTMLDivElement> {
  /** Content to announce */
  children?: ReactNode
  /** Politeness level for announcements */
  politeness?: 'polite' | 'assertive'
}

/**
 * LiveRegion component for screen reader announcements.
 *
 * This is a visually hidden element that screen readers can access.
 * Use it to announce dynamic content changes to assistive technology users.
 */
export function LiveRegion({
  children,
  politeness = 'polite',
  className,
  ...rest
}: LiveRegionProps) {
  const role = politeness === 'assertive' ? 'alert' : 'status'

  return (
    <div
      role={role}
      aria-live={politeness}
      aria-atomic="true"
      className={clsx('sr-only', className)}
      {...rest}
    >
      {children}
    </div>
  )
}

export interface UseLiveAnnounceOptions {
  /** How long to show the message before clearing (ms) */
  clearAfter?: number
}

export interface UseLiveAnnounceReturn {
  /** Current message to display */
  message: string
  /** Function to announce a message */
  announce: (message: string) => void
  /** Function to clear the current message */
  clear: () => void
}

/**
 * Hook for managing live region announcements.
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { message, announce } = useLiveAnnounce()
 *
 *   const handleAdd = () => {
 *     // ... add item logic
 *     announce('Item added successfully')
 *   }
 *
 *   return (
 *     <>
 *       <LiveRegion>{message}</LiveRegion>
 *       <button onClick={handleAdd}>Add Item</button>
 *     </>
 *   )
 * }
 * ```
 */
export function useLiveAnnounce({
  clearAfter = 5000,
}: UseLiveAnnounceOptions = {}): UseLiveAnnounceReturn {
  const [message, setMessage] = useState('')

  const clear = useCallback(() => {
    setMessage('')
  }, [])

  const announce = useCallback(
    (newMessage: string) => {
      setMessage(newMessage)
    },
    []
  )

  // Clear message after timeout
  useEffect(() => {
    if (!message) return

    const timeout = setTimeout(() => {
      clear()
    }, clearAfter)

    return () => clearTimeout(timeout)
  }, [message, clearAfter, clear])

  return {
    message,
    announce,
    clear,
  }
}
