import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useDropdownPosition } from './useDropdownPosition';

describe('useDropdownPosition', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset window dimensions
    Object.defineProperty(window, 'innerHeight', { value: 800, writable: true });
    Object.defineProperty(window, 'innerWidth', { value: 1200, writable: true });
  });

  const createMockRef = (rect: Partial<DOMRect>) => ({
    current: {
      getBoundingClientRect: () => ({
        top: 0,
        left: 0,
        bottom: 0,
        right: 0,
        width: 200,
        height: 40,
        x: 0,
        y: 0,
        toJSON: () => {},
        ...rect,
      }),
    } as HTMLElement,
  });

  describe('basic positioning', () => {
    it('should position dropdown below anchor by default', () => {
      const anchorRef = createMockRef({
        top: 100,
        left: 50,
        bottom: 140,
        right: 250,
        width: 200,
        height: 40,
      });

      const { result } = renderHook(() =>
        useDropdownPosition({
          anchorRef: anchorRef as React.RefObject<HTMLElement>,
          isOpen: true,
        })
      );

      expect(result.current.position.top).toBe(140); // Below anchor (anchor.bottom)
      expect(result.current.position.left).toBe(50); // Aligned with anchor left
      expect(result.current.placement).toBe('bottom');
    });

    it('should match anchor width by default', () => {
      const anchorRef = createMockRef({
        top: 100,
        left: 50,
        bottom: 140,
        width: 300,
      });

      const { result } = renderHook(() =>
        useDropdownPosition({
          anchorRef: anchorRef as React.RefObject<HTMLElement>,
          isOpen: true,
        })
      );

      expect(result.current.position.width).toBe(300);
    });

    it('should return empty position when anchor ref is null', () => {
      const anchorRef = { current: null };

      const { result } = renderHook(() =>
        useDropdownPosition({
          anchorRef: anchorRef as React.RefObject<HTMLElement>,
          isOpen: true,
        })
      );

      expect(result.current.position.top).toBe(0);
      expect(result.current.position.left).toBe(0);
      expect(result.current.position.width).toBe(0);
    });

    it('should not compute position when closed', () => {
      const anchorRef = createMockRef({
        top: 100,
        left: 50,
        bottom: 140,
      });

      const { result } = renderHook(() =>
        useDropdownPosition({
          anchorRef: anchorRef as React.RefObject<HTMLElement>,
          isOpen: false,
        })
      );

      // Should return default/last position but placement should be 'bottom'
      expect(result.current.placement).toBe('bottom');
    });
  });

  describe('viewport flipping', () => {
    it('should flip to top when near bottom of viewport', () => {
      // Position anchor near bottom of viewport
      const anchorRef = createMockRef({
        top: 700,
        left: 50,
        bottom: 740,
        height: 40,
        width: 200,
      });

      const { result } = renderHook(() =>
        useDropdownPosition({
          anchorRef: anchorRef as React.RefObject<HTMLElement>,
          isOpen: true,
          dropdownHeight: 200, // Would overflow past 800px viewport
        })
      );

      expect(result.current.placement).toBe('top');
      // Top should be above the anchor (anchor.top - dropdownHeight)
      expect(result.current.position.top).toBe(500); // 700 - 200
    });

    it('should stay at bottom if there is enough space', () => {
      const anchorRef = createMockRef({
        top: 100,
        left: 50,
        bottom: 140,
        height: 40,
        width: 200,
      });

      const { result } = renderHook(() =>
        useDropdownPosition({
          anchorRef: anchorRef as React.RefObject<HTMLElement>,
          isOpen: true,
          dropdownHeight: 200,
        })
      );

      expect(result.current.placement).toBe('bottom');
      expect(result.current.position.top).toBe(140); // Below anchor
    });

    it('should prefer bottom when both top and bottom have equal space', () => {
      // Position anchor in the middle
      const anchorRef = createMockRef({
        top: 400,
        left: 50,
        bottom: 440,
        height: 40,
        width: 200,
      });

      const { result } = renderHook(() =>
        useDropdownPosition({
          anchorRef: anchorRef as React.RefObject<HTMLElement>,
          isOpen: true,
          dropdownHeight: 200,
        })
      );

      expect(result.current.placement).toBe('bottom');
    });

    it('should flip to top even when both overflow but top has more space', () => {
      // Window height 800, anchor near bottom with 100px below, 700px above
      const anchorRef = createMockRef({
        top: 700,
        left: 50,
        bottom: 740,
        height: 40,
        width: 200,
      });

      const { result } = renderHook(() =>
        useDropdownPosition({
          anchorRef: anchorRef as React.RefObject<HTMLElement>,
          isOpen: true,
          dropdownHeight: 500, // Both directions would overflow
        })
      );

      // Top has 700px space, bottom has 60px - should flip to top
      expect(result.current.placement).toBe('top');
    });
  });

  describe('offset configuration', () => {
    it('should apply vertical offset', () => {
      const anchorRef = createMockRef({
        top: 100,
        left: 50,
        bottom: 140,
        width: 200,
      });

      const { result } = renderHook(() =>
        useDropdownPosition({
          anchorRef: anchorRef as React.RefObject<HTMLElement>,
          isOpen: true,
          offset: 8,
        })
      );

      expect(result.current.position.top).toBe(148); // 140 + 8
    });

    it('should apply offset when flipped to top', () => {
      const anchorRef = createMockRef({
        top: 700,
        left: 50,
        bottom: 740,
        height: 40,
        width: 200,
      });

      const { result } = renderHook(() =>
        useDropdownPosition({
          anchorRef: anchorRef as React.RefObject<HTMLElement>,
          isOpen: true,
          dropdownHeight: 200,
          offset: 8,
        })
      );

      expect(result.current.placement).toBe('top');
      expect(result.current.position.top).toBe(492); // 700 - 200 - 8
    });
  });

  describe('minimum width', () => {
    it('should enforce minimum width', () => {
      const anchorRef = createMockRef({
        top: 100,
        left: 50,
        bottom: 140,
        width: 100, // Narrow anchor
      });

      const { result } = renderHook(() =>
        useDropdownPosition({
          anchorRef: anchorRef as React.RefObject<HTMLElement>,
          isOpen: true,
          minWidth: 200,
        })
      );

      expect(result.current.position.width).toBe(200);
    });

    it('should use anchor width if greater than minimum', () => {
      const anchorRef = createMockRef({
        top: 100,
        left: 50,
        bottom: 140,
        width: 300,
      });

      const { result } = renderHook(() =>
        useDropdownPosition({
          anchorRef: anchorRef as React.RefObject<HTMLElement>,
          isOpen: true,
          minWidth: 200,
        })
      );

      expect(result.current.position.width).toBe(300);
    });
  });

  describe('horizontal boundary checking', () => {
    it('should constrain left position to viewport', () => {
      // Anchor starts at negative position (scrolled)
      const anchorRef = createMockRef({
        top: 100,
        left: -50,
        bottom: 140,
        width: 200,
      });

      const { result } = renderHook(() =>
        useDropdownPosition({
          anchorRef: anchorRef as React.RefObject<HTMLElement>,
          isOpen: true,
        })
      );

      expect(result.current.position.left).toBeGreaterThanOrEqual(0);
    });

    it('should constrain right edge to viewport', () => {
      // Anchor near right edge
      const anchorRef = createMockRef({
        top: 100,
        left: 1100, // 1200 - 100
        bottom: 140,
        width: 200, // Would extend to 1300, past 1200
      });

      const { result } = renderHook(() =>
        useDropdownPosition({
          anchorRef: anchorRef as React.RefObject<HTMLElement>,
          isOpen: true,
        })
      );

      // Left should be adjusted so right edge is at viewport edge
      expect(result.current.position.left + result.current.position.width).toBeLessThanOrEqual(1200);
    });
  });

  describe('max height calculation', () => {
    it('should provide available height for bottom placement', () => {
      const anchorRef = createMockRef({
        top: 100,
        left: 50,
        bottom: 140,
        width: 200,
      });

      const { result } = renderHook(() =>
        useDropdownPosition({
          anchorRef: anchorRef as React.RefObject<HTMLElement>,
          isOpen: true,
        })
      );

      // Available height = viewport (800) - anchor bottom (140) - some padding
      expect(result.current.maxHeight).toBeLessThanOrEqual(660);
      expect(result.current.maxHeight).toBeGreaterThan(0);
    });

    it('should provide available height for top placement', () => {
      const anchorRef = createMockRef({
        top: 700,
        left: 50,
        bottom: 740,
        height: 40,
        width: 200,
      });

      const { result } = renderHook(() =>
        useDropdownPosition({
          anchorRef: anchorRef as React.RefObject<HTMLElement>,
          isOpen: true,
          dropdownHeight: 200,
        })
      );

      // When flipped to top, max height is anchor.top - padding
      expect(result.current.maxHeight).toBeLessThanOrEqual(700);
      expect(result.current.maxHeight).toBeGreaterThan(0);
    });
  });
});
