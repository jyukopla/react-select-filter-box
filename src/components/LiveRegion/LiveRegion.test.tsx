import { describe, it, expect, vi } from 'vitest'
import { render, screen, act } from '@testing-library/react'
import { LiveRegion, useLiveAnnounce } from './LiveRegion'
import { renderHook } from '@testing-library/react'

describe('LiveRegion', () => {
  describe('Rendering', () => {
    it('should render with aria-live="polite" by default', () => {
      render(<LiveRegion>Hello</LiveRegion>)

      const region = screen.getByRole('status')
      expect(region).toHaveAttribute('aria-live', 'polite')
    })

    it('should render with aria-live="assertive" when politeness is assertive', () => {
      render(<LiveRegion politeness="assertive">Urgent!</LiveRegion>)

      const region = screen.getByRole('alert')
      expect(region).toHaveAttribute('aria-live', 'assertive')
    })

    it('should have aria-atomic="true"', () => {
      render(<LiveRegion>Content</LiveRegion>)

      const region = screen.getByRole('status')
      expect(region).toHaveAttribute('aria-atomic', 'true')
    })

    it('should be visually hidden', () => {
      render(<LiveRegion>Hidden content</LiveRegion>)

      const region = screen.getByRole('status')
      expect(region).toHaveClass('sr-only')
    })

    it('should display children content', () => {
      render(<LiveRegion>Announcement text</LiveRegion>)

      expect(screen.getByText('Announcement text')).toBeInTheDocument()
    })

    it('should be visually hidden with sr-only class', () => {
      render(<LiveRegion>Screen reader text</LiveRegion>)

      const region = screen.getByRole('status')
      // The sr-only class positions element off-screen but still readable
      expect(region).toHaveClass('sr-only')
    })
  })

  describe('announcements', () => {
    it('should update content when children change', () => {
      const { rerender } = render(<LiveRegion>First</LiveRegion>)
      expect(screen.getByText('First')).toBeInTheDocument()

      rerender(<LiveRegion>Second</LiveRegion>)
      expect(screen.getByText('Second')).toBeInTheDocument()
    })

    it('should support custom className', () => {
      render(<LiveRegion className="custom-live">Content</LiveRegion>)

      const region = screen.getByRole('status')
      expect(region).toHaveClass('custom-live')
      expect(region).toHaveClass('sr-only')
    })
  })
})

describe('useLiveAnnounce', () => {
  // Wrapper component to test the hook
  function TestAnnouncer() {
    const { announce, message } = useLiveAnnounce()
    return (
      <>
        <LiveRegion data-testid="live-region">{message}</LiveRegion>
        <button onClick={() => announce('Hello world')}>Announce</button>
        <button onClick={() => announce('Message one')} data-testid="btn1">
          Button 1
        </button>
        <button onClick={() => announce('Message two')} data-testid="btn2">
          Button 2
        </button>
        <button onClick={() => announce('Disappearing')} data-testid="temp">
          Temp
        </button>
      </>
    )
  }

  it('should provide announce function', async () => {
    render(<TestAnnouncer />)

    const button = screen.getByRole('button', { name: 'Announce' })
    await act(async () => {
      button.click()
    })

    const region = screen.getByRole('status')
    expect(region).toHaveTextContent('Hello world')
  })

  it('should clear message after timeout', async () => {
    vi.useFakeTimers()

    render(<TestAnnouncer />)

    await act(async () => {
      screen.getByTestId('temp').click()
    })

    const region = screen.getByRole('status')
    expect(region).toHaveTextContent('Disappearing')

    await act(async () => {
      vi.advanceTimersByTime(5000)
    })

    expect(region).toHaveTextContent('')

    vi.useRealTimers()
  })

  it('should update message on subsequent announces', async () => {
    render(<TestAnnouncer />)

    const region = screen.getByRole('status')

    await act(async () => {
      screen.getByTestId('btn1').click()
    })
    expect(region).toHaveTextContent('Message one')

    await act(async () => {
      screen.getByTestId('btn2').click()
    })
    expect(region).toHaveTextContent('Message two')
  })

  it('should start with empty message', () => {
    const { result } = renderHook(() => useLiveAnnounce())

    expect(result.current.message).toBe('')
  })
})
