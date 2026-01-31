/**
 * useFocusManagement Hook Tests
 */

import { renderHook, act } from '@testing-library/react'
import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { useFocusManagement } from './useFocusManagement'

describe('useFocusManagement', () => {
  let inputElement: HTMLInputElement
  let containerElement: HTMLDivElement
  let externalElement: HTMLButtonElement

  beforeEach(() => {
    // Create DOM elements
    containerElement = document.createElement('div')
    inputElement = document.createElement('input')
    externalElement = document.createElement('button')
    externalElement.textContent = 'External'
    
    containerElement.appendChild(inputElement)
    document.body.appendChild(containerElement)
    document.body.appendChild(externalElement)
  })

  afterEach(() => {
    document.body.removeChild(containerElement)
    document.body.removeChild(externalElement)
  })

  describe('storeFocusOrigin', () => {
    it('should store focus origin when element outside container is focused', () => {
      const inputRef = { current: inputElement }
      const containerRef = { current: containerElement }

      externalElement.focus()

      const { result } = renderHook(() =>
        useFocusManagement({
          isDropdownOpen: false,
          isEditing: false,
          inputRef,
          containerRef,
        })
      )

      act(() => {
        result.current.storeFocusOrigin()
      })

      // Focus origin should be stored
      expect(document.activeElement).toBe(externalElement)
    })

    it('should not store focus origin when element inside container is focused', () => {
      const inputRef = { current: inputElement }
      const containerRef = { current: containerElement }

      inputElement.focus()

      const { result } = renderHook(() =>
        useFocusManagement({
          isDropdownOpen: false,
          isEditing: false,
          inputRef,
          containerRef,
        })
      )

      act(() => {
        result.current.storeFocusOrigin()
      })

      expect(document.activeElement).toBe(inputElement)
    })
  })

  describe('restoreFocus', () => {
    it('should restore focus to origin after being called', async () => {
      const inputRef = { current: inputElement }
      const containerRef = { current: containerElement }

      externalElement.focus()

      const { result } = renderHook(() =>
        useFocusManagement({
          isDropdownOpen: false,
          isEditing: false,
          inputRef,
          containerRef,
        })
      )

      act(() => {
        result.current.storeFocusOrigin()
      })

      inputElement.focus()
      expect(document.activeElement).toBe(inputElement)

      act(() => {
        result.current.restoreFocus()
      })

      // Wait for requestAnimationFrame
      await new Promise((resolve) => requestAnimationFrame(resolve))
      
      expect(document.activeElement).toBe(externalElement)
    })
  })

  describe('focusInput', () => {
    it('should focus the input element', () => {
      const inputRef = { current: inputElement }
      const containerRef = { current: containerElement }

      externalElement.focus()
      expect(document.activeElement).toBe(externalElement)

      const { result } = renderHook(() =>
        useFocusManagement({
          isDropdownOpen: false,
          isEditing: false,
          inputRef,
          containerRef,
        })
      )

      act(() => {
        result.current.focusInput()
      })

      expect(document.activeElement).toBe(inputElement)
    })

    it('should not throw when inputRef is null', () => {
      const inputRef = { current: null }
      const containerRef = { current: containerElement }

      const { result } = renderHook(() =>
        useFocusManagement({
          isDropdownOpen: false,
          isEditing: false,
          inputRef,
          containerRef,
        })
      )

      expect(() => {
        act(() => {
          result.current.focusInput()
        })
      }).not.toThrow()
    })
  })

  describe('isFocusWithin', () => {
    it('should return true when focus is within container', () => {
      const inputRef = { current: inputElement }
      const containerRef = { current: containerElement }

      inputElement.focus()

      const { result } = renderHook(() =>
        useFocusManagement({
          isDropdownOpen: false,
          isEditing: false,
          inputRef,
          containerRef,
        })
      )

      expect(result.current.isFocusWithin()).toBe(true)
    })

    it('should return false when focus is outside container', () => {
      const inputRef = { current: inputElement }
      const containerRef = { current: containerElement }

      externalElement.focus()

      const { result } = renderHook(() =>
        useFocusManagement({
          isDropdownOpen: false,
          isEditing: false,
          inputRef,
          containerRef,
        })
      )

      expect(result.current.isFocusWithin()).toBe(false)
    })

    it('should return false when containerRef is null', () => {
      const inputRef = { current: inputElement }
      const containerRef = { current: null }

      const { result } = renderHook(() =>
        useFocusManagement({
          isDropdownOpen: false,
          isEditing: false,
          inputRef,
          containerRef,
        })
      )

      expect(result.current.isFocusWithin()).toBe(false)
    })
  })

  describe('focus trap behavior', () => {
    it('should not trap focus when dropdown is closed', () => {
      const inputRef = { current: inputElement }
      const containerRef = { current: containerElement }

      renderHook(() =>
        useFocusManagement({
          isDropdownOpen: false,
          isEditing: false,
          inputRef,
          containerRef,
        })
      )

      inputElement.focus()
      externalElement.focus()

      // Focus should remain on external element (not trapped)
      expect(document.activeElement).toBe(externalElement)
    })
  })
})
