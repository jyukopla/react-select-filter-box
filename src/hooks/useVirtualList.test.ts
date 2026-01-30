/**
 * Tests for useVirtualList hook
 */

import { describe, it, expect, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useVirtualList } from './useVirtualList'

describe('useVirtualList', () => {
  describe('basic calculations', () => {
    it('should calculate total height correctly', () => {
      const { result } = renderHook(() =>
        useVirtualList({
          itemCount: 100,
          itemHeight: 40,
          containerHeight: 300,
        })
      )

      expect(result.current.totalHeight).toBe(4000)
    })

    it('should calculate visible range at scroll position 0', () => {
      const { result } = renderHook(() =>
        useVirtualList({
          itemCount: 100,
          itemHeight: 40,
          containerHeight: 300,
          overscan: 2,
        })
      )

      // Visible: 300 / 40 = 7.5, so 8 items
      // With overscan of 2: start = 0, end = 8 + 2 = 10
      expect(result.current.startIndex).toBe(0)
      expect(result.current.endIndex).toBe(10)
      expect(result.current.offsetTop).toBe(0)
    })

    it('should calculate visible range when scrolled', () => {
      const { result } = renderHook(() =>
        useVirtualList({
          itemCount: 100,
          itemHeight: 40,
          containerHeight: 300,
          overscan: 2,
        })
      )

      // Scroll down 200px (5 items)
      act(() => {
        result.current.onScroll(200)
      })

      // First visible item is 200/40 = 5
      // Visible count: ceil(300/40) = 8
      // With overscan: start = 5 - 2 = 3, end = 5 + 8 + 2 = 15
      expect(result.current.startIndex).toBe(3)
      expect(result.current.endIndex).toBe(15)
      expect(result.current.offsetTop).toBe(120) // 3 * 40
    })

    it('should clamp start index to 0', () => {
      const { result } = renderHook(() =>
        useVirtualList({
          itemCount: 100,
          itemHeight: 40,
          containerHeight: 300,
          overscan: 10, // Large overscan
        })
      )

      expect(result.current.startIndex).toBe(0)
    })

    it('should clamp end index to item count', () => {
      const { result } = renderHook(() =>
        useVirtualList({
          itemCount: 5, // Small list
          itemHeight: 40,
          containerHeight: 300,
          overscan: 3,
        })
      )

      expect(result.current.endIndex).toBe(5)
    })
  })

  describe('virtual items', () => {
    it('should generate correct virtual items', () => {
      const { result } = renderHook(() =>
        useVirtualList({
          itemCount: 100,
          itemHeight: 40,
          containerHeight: 300,
          overscan: 0,
        })
      )

      const items = result.current.virtualItems
      expect(items.length).toBe(8) // ceil(300/40) = 8

      expect(items[0]).toEqual({ index: 0, start: 0, size: 40 })
      expect(items[1]).toEqual({ index: 1, start: 40, size: 40 })
      expect(items[7]).toEqual({ index: 7, start: 280, size: 40 })
    })

    it('should update virtual items when scrolling', () => {
      const { result } = renderHook(() =>
        useVirtualList({
          itemCount: 100,
          itemHeight: 40,
          containerHeight: 300,
          overscan: 0,
        })
      )

      act(() => {
        result.current.onScroll(400) // Scroll to item 10
      })

      const items = result.current.virtualItems
      expect(items[0].index).toBe(10)
      expect(items[0].start).toBe(400)
    })
  })

  describe('scrollToIndex', () => {
    it('should scroll to make item visible when above viewport', () => {
      const mockContainer = {
        scrollTop: 400,
        scrollTo: vi.fn(),
      }

      const { result } = renderHook(() =>
        useVirtualList({
          itemCount: 100,
          itemHeight: 40,
          containerHeight: 300,
        })
      )

      // Set up container ref
      act(() => {
        result.current.scrollContainerRef(mockContainer as unknown as HTMLElement)
      })

      // Scroll to item 2 (which is at position 80, above viewport at 400)
      act(() => {
        result.current.scrollToIndex(2)
      })

      expect(mockContainer.scrollTo).toHaveBeenCalledWith({
        top: 80,
        behavior: 'auto',
      })
    })

    it('should scroll to make item visible when below viewport', () => {
      const mockContainer = {
        scrollTop: 0,
        scrollTo: vi.fn(),
      }

      const { result } = renderHook(() =>
        useVirtualList({
          itemCount: 100,
          itemHeight: 40,
          containerHeight: 300,
        })
      )

      // Set up container ref
      act(() => {
        result.current.scrollContainerRef(mockContainer as unknown as HTMLElement)
      })

      // Scroll to item 20 (which is at position 800, below viewport at 0-300)
      act(() => {
        result.current.scrollToIndex(20)
      })

      expect(mockContainer.scrollTo).toHaveBeenCalledWith({
        top: 540, // (20 * 40 + 40) - 300 = 540
        behavior: 'auto',
      })
    })

    it('should not scroll if item is already visible', () => {
      const mockContainer = {
        scrollTop: 0,
        scrollTo: vi.fn(),
      }

      const { result } = renderHook(() =>
        useVirtualList({
          itemCount: 100,
          itemHeight: 40,
          containerHeight: 300,
        })
      )

      // Set up container ref
      act(() => {
        result.current.scrollContainerRef(mockContainer as unknown as HTMLElement)
      })

      // Scroll to item 2 (which is at position 80, inside viewport at 0-300)
      act(() => {
        result.current.scrollToIndex(2)
      })

      expect(mockContainer.scrollTo).not.toHaveBeenCalled()
    })

    it('should support smooth scroll behavior', () => {
      const mockContainer = {
        scrollTop: 400,
        scrollTo: vi.fn(),
      }

      const { result } = renderHook(() =>
        useVirtualList({
          itemCount: 100,
          itemHeight: 40,
          containerHeight: 300,
        })
      )

      act(() => {
        result.current.scrollContainerRef(mockContainer as unknown as HTMLElement)
      })

      act(() => {
        result.current.scrollToIndex(0, 'smooth')
      })

      expect(mockContainer.scrollTo).toHaveBeenCalledWith({
        top: 0,
        behavior: 'smooth',
      })
    })
  })

  describe('edge cases', () => {
    it('should handle empty list', () => {
      const { result } = renderHook(() =>
        useVirtualList({
          itemCount: 0,
          itemHeight: 40,
          containerHeight: 300,
        })
      )

      expect(result.current.totalHeight).toBe(0)
      expect(result.current.startIndex).toBe(0)
      expect(result.current.endIndex).toBe(0)
      expect(result.current.virtualItems).toEqual([])
    })

    it('should handle single item', () => {
      const { result } = renderHook(() =>
        useVirtualList({
          itemCount: 1,
          itemHeight: 40,
          containerHeight: 300,
        })
      )

      expect(result.current.totalHeight).toBe(40)
      expect(result.current.virtualItems.length).toBe(1)
      expect(result.current.virtualItems[0]).toEqual({ index: 0, start: 0, size: 40 })
    })

    it('should handle small lists that fit entirely in viewport', () => {
      const { result } = renderHook(() =>
        useVirtualList({
          itemCount: 3,
          itemHeight: 40,
          containerHeight: 300,
        })
      )

      expect(result.current.totalHeight).toBe(120)
      expect(result.current.virtualItems.length).toBe(3)
    })

    it('should handle scrolling past end', () => {
      const { result } = renderHook(() =>
        useVirtualList({
          itemCount: 10,
          itemHeight: 40,
          containerHeight: 300,
          overscan: 0,
        })
      )

      // Scroll way past the end
      act(() => {
        result.current.onScroll(1000)
      })

      // Should clamp to max
      expect(result.current.endIndex).toBe(10)
    })
  })

  describe('default values', () => {
    it('should use default overscan of 3', () => {
      const { result } = renderHook(() =>
        useVirtualList({
          itemCount: 100,
          itemHeight: 40,
          containerHeight: 300,
        })
      )

      // Visible: 8 items, with default overscan of 3: end = 8 + 3 = 11
      expect(result.current.endIndex).toBe(11)
    })
  })
})
