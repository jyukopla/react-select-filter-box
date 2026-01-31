/**
 * VirtualTokenContainer Component
 *
 * Renders tokens with virtual scrolling for performance with large lists.
 * This component is used when there are many filter expressions.
 *
 * @module VirtualTokenContainer
 */

import type { KeyboardEvent, RefObject, InputHTMLAttributes } from 'react'
import { useRef, useLayoutEffect, useState, useMemo, useCallback } from 'react'
import { clsx } from 'clsx'
import { Token } from '../Token'
import { TokenInput } from '../TokenInput'
import type { TokenData, ConditionValue } from '@/types'
import './TokenContainer.css'

export interface VirtualTokenContainerProps {
  /** Array of tokens to display */
  tokens: TokenData[]
  /** Current input value */
  inputValue: string
  /** Called when input value changes */
  onInputChange: (value: string) => void
  /** Called on input keydown */
  onInputKeyDown: (e: KeyboardEvent<HTMLInputElement>) => void
  /** Called when a token is clicked */
  onTokenClick?: (position: number) => void
  /** Called when an operator token is clicked (for editing) */
  onOperatorClick?: (expressionIndex: number) => void
  /** Called when input gains focus */
  onInputFocus?: () => void
  /** Called when input loses focus */
  onInputBlur?: () => void
  /** Ref to the input element */
  inputRef: RefObject<HTMLInputElement | null>
  /** Placeholder for the input */
  placeholder?: string
  /** Whether the container is disabled */
  disabled?: boolean
  /** Additional CSS class */
  className?: string
  /** Additional props for the input element */
  inputProps?: Partial<InputHTMLAttributes<HTMLInputElement>>
  /** Index of token currently being edited (-1 if not editing) */
  editingTokenIndex?: number
  /** Index of currently selected token (-1 if none) */
  selectedTokenIndex?: number
  /** Whether all tokens are selected */
  allTokensSelected?: boolean
  /** Called when token edit is complete */
  onTokenEditComplete?: (newValue: ConditionValue) => void
  /** Called when token edit is cancelled */
  onTokenEditCancel?: () => void
  /** Estimated width of each token in pixels (for windowing calculation) */
  estimatedTokenWidth?: number
  /** Number of tokens to render outside visible area */
  overscan?: number
  /** Threshold for enabling virtual scrolling (default: 50 tokens) */
  virtualizationThreshold?: number
}

/**
 * VirtualTokenContainer - renders tokens with optional windowing for large lists
 *
 * When the number of tokens exceeds the virtualization threshold, only visible
 * tokens are rendered to maintain performance. For smaller lists, all tokens
 * are rendered normally.
 */
export function VirtualTokenContainer({
  tokens,
  inputValue,
  onInputChange,
  onInputKeyDown,
  onTokenClick,
  onOperatorClick,
  onInputFocus,
  onInputBlur,
  inputRef,
  placeholder,
  disabled,
  className,
  inputProps,
  editingTokenIndex = -1,
  selectedTokenIndex = -1,
  allTokensSelected = false,
  onTokenEditComplete,
  onTokenEditCancel,
  estimatedTokenWidth = 80,
  overscan = 5,
  virtualizationThreshold = 50,
}: VirtualTokenContainerProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [scrollLeft, setScrollLeft] = useState(0)
  const [containerWidth, setContainerWidth] = useState(0)

  // Track container width for calculating visible range
  useLayoutEffect(() => {
    if (!containerRef.current) return

    const updateWidth = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.clientWidth)
      }
    }

    updateWidth()

    // ResizeObserver may not be available in all test environments
    if (typeof ResizeObserver !== 'undefined') {
      const resizeObserver = new ResizeObserver(updateWidth)
      resizeObserver.observe(containerRef.current)
      return () => resizeObserver.disconnect()
    }

    // Fallback: listen to window resize
    window.addEventListener('resize', updateWidth)
    return () => window.removeEventListener('resize', updateWidth)
  }, [])

  // Handle scroll events
  const handleScroll = useCallback(() => {
    if (containerRef.current) {
      setScrollLeft(containerRef.current.scrollLeft)
    }
  }, [])

  // Determine if virtualization should be used
  const shouldVirtualize = tokens.length > virtualizationThreshold

  // Calculate visible token range for virtualization
  const { startIndex, endIndex, offsetLeft, totalWidth } = useMemo(() => {
    if (!shouldVirtualize) {
      return {
        startIndex: 0,
        endIndex: tokens.length,
        offsetLeft: 0,
        totalWidth: 0,
      }
    }

    // Estimate total width
    const total = tokens.length * estimatedTokenWidth

    // Calculate visible range based on scroll position
    const start = Math.floor(scrollLeft / estimatedTokenWidth)
    const visibleCount = Math.ceil(containerWidth / estimatedTokenWidth)
    const end = start + visibleCount

    // Apply overscan
    const startWithOverscan = Math.max(0, start - overscan)
    const endWithOverscan = Math.min(tokens.length, end + overscan)

    return {
      startIndex: startWithOverscan,
      endIndex: endWithOverscan,
      offsetLeft: startWithOverscan * estimatedTokenWidth,
      totalWidth: total,
    }
  }, [shouldVirtualize, tokens.length, scrollLeft, containerWidth, estimatedTokenWidth, overscan])

  // Get visible tokens
  const visibleTokens = useMemo(() => {
    return tokens.slice(startIndex, endIndex)
  }, [tokens, startIndex, endIndex])

  // Handle token click
  const handleTokenClick = useCallback((token: TokenData, localIndex: number) => {
    const actualIndex = startIndex + localIndex
    if (token.type === 'operator' && !token.isPending && token.expressionIndex >= 0 && onOperatorClick) {
      onOperatorClick(token.expressionIndex)
    } else {
      onTokenClick?.(actualIndex)
    }
  }, [startIndex, onOperatorClick, onTokenClick])

  // Handle container click to focus input
  const handleContainerClick = useCallback(() => {
    onInputFocus?.()
    inputRef.current?.focus()
  }, [onInputFocus, inputRef])

  // Scroll selected token into view
  useLayoutEffect(() => {
    if (selectedTokenIndex >= 0 && containerRef.current && shouldVirtualize) {
      const estimatedOffset = selectedTokenIndex * estimatedTokenWidth
      const viewportEnd = scrollLeft + containerWidth

      if (estimatedOffset < scrollLeft) {
        containerRef.current.scrollLeft = Math.max(0, estimatedOffset - 20)
      } else if (estimatedOffset + estimatedTokenWidth > viewportEnd) {
        containerRef.current.scrollLeft = estimatedOffset - containerWidth + estimatedTokenWidth + 20
      }
    }
  }, [selectedTokenIndex, estimatedTokenWidth, scrollLeft, containerWidth, shouldVirtualize])

  return (
    <div
      ref={containerRef}
      className={clsx(
        'token-container',
        { 'token-container--disabled': disabled },
        { 'token-container--virtual': shouldVirtualize },
        className
      )}
      onClick={handleContainerClick}
      onScroll={handleScroll}
      style={shouldVirtualize ? { overflowX: 'auto' } : undefined}
    >
      {shouldVirtualize ? (
        // Virtualized rendering
        <div
          className="token-container__virtual-spacer"
          style={{
            width: totalWidth,
            display: 'flex',
            position: 'relative',
          }}
        >
          <div
            className="token-container__virtual-content"
            style={{
              display: 'flex',
              position: 'absolute',
              left: offsetLeft,
            }}
          >
            {visibleTokens.map((token, localIndex) => {
              const actualIndex = startIndex + localIndex
              return (
                <Token
                  key={token.id}
                  data={token}
                  isEditable={(token.type === 'value' || token.type === 'operator') && !token.isPending}
                  isEditing={actualIndex === editingTokenIndex}
                  isSelected={allTokensSelected || actualIndex === selectedTokenIndex}
                  isDeletable={false}
                  onEdit={() => handleTokenClick(token, localIndex)}
                  onDelete={() => {}}
                  onEditComplete={(newValue) => onTokenEditComplete?.(newValue)}
                  onEditCancel={() => onTokenEditCancel?.()}
                />
              )
            })}
          </div>
        </div>
      ) : (
        // Regular rendering for small lists
        tokens.map((token, index) => (
          <Token
            key={token.id}
            data={token}
            isEditable={(token.type === 'value' || token.type === 'operator') && !token.isPending}
            isEditing={index === editingTokenIndex}
            isSelected={allTokensSelected || index === selectedTokenIndex}
            isDeletable={false}
            onEdit={() => handleTokenClick(token, index)}
            onDelete={() => {}}
            onEditComplete={(newValue) => onTokenEditComplete?.(newValue)}
            onEditCancel={() => onTokenEditCancel?.()}
          />
        ))
      )}
      <TokenInput
        {...inputProps}
        value={inputValue}
        onChange={onInputChange}
        onKeyDown={onInputKeyDown}
        onFocus={onInputFocus}
        onBlur={onInputBlur}
        inputRef={inputRef}
        placeholder={placeholder}
        disabled={disabled}
      />
    </div>
  )
}
