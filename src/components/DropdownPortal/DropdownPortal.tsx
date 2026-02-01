/**
 * DropdownPortal Component
 *
 * Renders children to a portal outside the current DOM hierarchy.
 * Useful for escaping overflow:hidden containers.
 */

import { type ReactNode, useLayoutEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import './DropdownPortal.css'

/** Data attribute used to identify portal elements as part of FilterBox */
export const FILTER_BOX_PORTAL_ATTR = 'data-filter-box-portal'

export interface DropdownPortalProps {
  /** Content to render in the portal */
  children: ReactNode
  /** Custom container to render to (defaults to document.body) */
  container?: Element | DocumentFragment
  /** Unique ID to link portal to its parent container */
  portalId?: string
}

/**
 * Portal component for rendering dropdown outside of overflow containers
 */
export function DropdownPortal({ children, container, portalId }: DropdownPortalProps) {
  const [portalElement, setPortalElement] = useState<HTMLDivElement | null>(null)

  useLayoutEffect(() => {
    // Create portal container div
    const div = document.createElement('div')
    div.className = 'dropdown-portal'
    // Add data attribute to identify this portal as part of the FilterBox
    div.setAttribute(FILTER_BOX_PORTAL_ATTR, portalId ?? 'true')

    // Append to container or body
    const target = container ?? document.body
    target.appendChild(div)
    setPortalElement(div)

    // Cleanup on unmount
    return () => {
      target.removeChild(div)
    }
  }, [container, portalId])

  if (!portalElement) {
    return null
  }

  return createPortal(children, portalElement)
}
