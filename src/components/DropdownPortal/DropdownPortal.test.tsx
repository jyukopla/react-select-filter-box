import { describe, it, expect, afterEach } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'
import { DropdownPortal } from './DropdownPortal'

describe('DropdownPortal', () => {
  afterEach(cleanup)

  describe('Rendering', () => {
    it('should render children to document.body', () => {
      render(
        <DropdownPortal>
          <div data-testid="portal-content">Content</div>
        </DropdownPortal>
      )

      const content = screen.getByTestId('portal-content')
      expect(content.parentElement?.parentElement).toBe(document.body)
    })

    it('should not render when not mounted', () => {
      render(
        <div data-testid="parent">
          <DropdownPortal>
            <div data-testid="portal-content">Content</div>
          </DropdownPortal>
        </div>
      )

      // The portal content should NOT be inside the parent
      const parent = screen.getByTestId('parent')
      expect(parent.querySelector('[data-testid="portal-content"]')).toBeNull()
    })

    it('should render to custom container when provided', () => {
      const customContainer = document.createElement('div')
      customContainer.id = 'custom-portal-root'
      document.body.appendChild(customContainer)

      render(
        <DropdownPortal container={customContainer}>
          <div data-testid="portal-content">Content</div>
        </DropdownPortal>
      )

      const content = screen.getByTestId('portal-content')
      expect(content.parentElement?.parentElement).toBe(customContainer)

      // Cleanup
      document.body.removeChild(customContainer)
    })
  })

  describe('Cleanup', () => {
    it('should cleanup portal div on unmount', () => {
      const { unmount } = render(
        <DropdownPortal>
          <div data-testid="portal-content">Content</div>
        </DropdownPortal>
      )

      const initialPortalDivs = document.body.querySelectorAll('.dropdown-portal')
      expect(initialPortalDivs.length).toBe(1)

      unmount()

      const portalDivsAfterUnmount = document.body.querySelectorAll('.dropdown-portal')
      expect(portalDivsAfterUnmount.length).toBe(0)
    })
  })

  describe('Styling', () => {
    it('should have portal class', () => {
      render(
        <DropdownPortal>
          <div data-testid="portal-content">Content</div>
        </DropdownPortal>
      )

      const content = screen.getByTestId('portal-content')
      expect(content.parentElement).toHaveClass('dropdown-portal')
    })
  })
})
