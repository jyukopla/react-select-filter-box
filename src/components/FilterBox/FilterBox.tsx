/**
 * FilterBox Component
 *
 * Main component that combines TokenContainer and AutocompleteDropdown
 * to provide a complete filter expression builder.
 */

import {
  useRef,
  useId,
  useEffect,
  useImperativeHandle,
  forwardRef,
  useState,
  useMemo,
  useCallback,
} from 'react'
import clsx from 'clsx'
import { TokenContainer } from '@/components/TokenContainer'
import { AutocompleteDropdown } from '@/components/AutocompleteDropdown'
import { DropdownPortal, FILTER_BOX_PORTAL_ATTR } from '@/components/DropdownPortal'
import { LiveRegion } from '@/components/LiveRegion'
import {
  useFilterState,
  useDropdownPosition,
  useFocusManagement,
  type UseFilterStateProps,
} from '@/hooks'
import { validateExpressions, type ValidationError } from '@/utils'
import './FilterBox.css'

export interface FilterBoxHandle {
  /** Focus the input */
  focus: () => void
  /** Blur the input */
  blur: () => void
  /** Clear all filters */
  clear: () => void
}

export interface FilterBoxProps extends UseFilterStateProps {
  /** Additional CSS class names */
  className?: string
  /** ID for the component */
  id?: string
  /** Whether the filter box is disabled */
  disabled?: boolean
  /** Accessible label for the filter box */
  'aria-label'?: string
  /** Whether to render dropdown in a portal (default: true) */
  usePortal?: boolean
  /** Auto-focus the input on mount */
  autoFocus?: boolean
  /** Show a clear button when there are filters (default: true) */
  showClearButton?: boolean
  /** Callback when validation errors occur */
  onError?: (errors: ValidationError[]) => void
  /** ID of element to skip to (for skip link accessibility) */
  skipToId?: string
  /** Custom text for skip link (default: "Skip to content") */
  skipLinkText?: string
  /** Whether the token container should take full available width (default: true) */
  fullWidth?: boolean
}

export const FilterBox = forwardRef<FilterBoxHandle, FilterBoxProps>(function FilterBox(
  {
    schema,
    value = [],
    onChange,
    className,
    id,
    disabled = false,
    'aria-label': ariaLabel,
    usePortal = true,
    autoFocus = false,
    showClearButton = true,
    onError,
    skipToId,
    skipLinkText = 'Skip to content',
    fullWidth = true,
  },
  ref
) {
  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const generatedId = useId()
  const dropdownId = id ? `${id}-dropdown` : `${generatedId}-dropdown`
  const [validationErrorAnnouncement, setValidationErrorAnnouncement] = useState('')

  // Validate expressions and announce errors to screen readers
  const validationResult = useMemo(() => {
    if (value.length === 0) return { valid: true, errors: [] }
    return validateExpressions(value, schema)
  }, [value, schema])

  // Call onError when validation errors change
  useEffect(() => {
    if (onError && !validationResult.valid && validationResult.errors.length > 0) {
      onError(validationResult.errors)
    }
  }, [validationResult, onError])

  // Announce validation errors to screen readers
  useEffect(() => {
    if (!validationResult.valid && validationResult.errors.length > 0) {
      const errorCount = validationResult.errors.length
      const errorMessages = validationResult.errors
        .map((e) => e.message)
        .slice(0, 3)
        .join('. ')
      const announcement =
        errorCount === 1
          ? `Validation error: ${errorMessages}`
          : `${errorCount} validation errors. ${errorMessages}${errorCount > 3 ? '...' : ''}`
      setValidationErrorAnnouncement(announcement)
    } else {
      setValidationErrorAnnouncement('')
    }
  }, [validationResult])

  const {
    state,
    tokens,
    isDropdownOpen,
    suggestions,
    highlightedIndex,
    inputValue,
    placeholder,
    announcement,
    editingTokenIndex,
    selectedTokenIndex,
    allTokensSelected,
    activeCustomWidget,
    customWidgetInitialValue,
    currentFieldConfig,
    currentOperatorConfig,
    handleFocus,
    handleBlur,
    handleInputChange,
    handleKeyDown,
    handleSelect,
    handleHighlight,
    handleClear,
    handleTokenEdit,
    handleTokenSelect,
    handleTokenEditComplete,
    handleTokenEditCancel,
    handleOperatorEdit,
    handleConnectorEdit,
    handleCustomWidgetConfirm,
    handleCustomWidgetCancel,
    handleExpressionDelete,
  } = useFilterState({ schema, value, onChange })

  // Use a unique portal ID based on the generated component ID
  const portalId = `${generatedId}-portal`

  // Focus management for trap and restoration
  const { focusInput } = useFocusManagement({
    isDropdownOpen,
    isEditing: editingTokenIndex >= 0,
    inputRef,
    containerRef,
    portalId,
    hasActiveCustomWidget: !!activeCustomWidget,
  })

  // Wrap the blur handler to prevent blur when focus moves to custom widget in portal
  // This fixes Issue 4: clicking on custom widget was closing the dropdown and clearing expression
  const handleInputBlur = useCallback(
    (event?: React.FocusEvent<HTMLInputElement>) => {
      // Check if focus is moving to an element inside the FilterBox portal (custom widget)
      const relatedTarget = event?.relatedTarget as HTMLElement | null
      if (relatedTarget) {
        // Check if the target is inside a FilterBox portal (matches our portalId or any FilterBox portal)
        const portalContainer = relatedTarget.closest(`[${FILTER_BOX_PORTAL_ATTR}]`)
        if (portalContainer) {
          // Focus is moving to the portal (custom widget) - don't blur
          return
        }
        // Also check if focus is moving within the container itself
        if (containerRef.current?.contains(relatedTarget)) {
          return
        }
      } else {
        // When relatedTarget is null (e.g., clicking on non-focusable elements like tokens),
        // we need to wait a tick to check if the click was inside the container
        setTimeout(() => {
          const activeElement = document.activeElement
          // Check if focus is now inside our container
          if (containerRef.current?.contains(activeElement)) {
            return
          }
          // Check if focus is in a portal
          const portalContainer = activeElement?.closest(`[${FILTER_BOX_PORTAL_ATTR}]`)
          if (portalContainer) {
            return
          }
          // Focus has truly left - call blur handler
          handleBlur()
        }, 0)
        return
      }
      // Otherwise, call the actual blur handler
      handleBlur()
    },
    [handleBlur]
  )

  // Container-level blur handler to catch when focus leaves the entire FilterBox
  // This handles cases where tokens are clicked (which don't focus the input)
  // and then the user clicks outside
  const handleContainerBlur = useCallback(
    (event: React.FocusEvent<HTMLDivElement>) => {
      const relatedTarget = event.relatedTarget as HTMLElement | null

      // If focus is moving to null (e.g., clicking on non-focusable element outside)
      // we need to wait a tick to check if focus actually left the container
      if (!relatedTarget) {
        // Use setTimeout to check after the click event completes
        setTimeout(() => {
          // Check if focus is now inside our container or portal
          const activeElement = document.activeElement
          if (containerRef.current?.contains(activeElement)) {
            return
          }
          // Check if focus is in a portal
          const portalContainer = activeElement?.closest(`[${FILTER_BOX_PORTAL_ATTR}]`)
          if (portalContainer) {
            return
          }
          // Focus has truly left - call blur handler
          handleBlur()
        }, 0)
        return
      }

      // Check if the target is inside a FilterBox portal
      const portalContainer = relatedTarget.closest(`[${FILTER_BOX_PORTAL_ATTR}]`)
      if (portalContainer) {
        return
      }

      // Check if focus is moving within the container itself
      if (containerRef.current?.contains(relatedTarget)) {
        return
      }

      // Focus has left the container entirely - call blur handler
      handleBlur()
    },
    [handleBlur]
  )

  // Expose imperative handle
  useImperativeHandle(
    ref,
    () => ({
      focus: () => {
        focusInput()
      },
      blur: () => {
        inputRef.current?.blur()
      },
      clear: () => {
        handleClear()
      },
    }),
    [handleClear, focusInput]
  )

  // Auto-focus on mount
  useEffect(() => {
    if (autoFocus && !disabled) {
      inputRef.current?.focus()
    }
  }, [autoFocus, disabled])

  // Focus input after editing a token completes or cancels
  // This ensures the cursor is visible and ready for continued input
  const prevEditingTokenIndexRef = useRef(editingTokenIndex)
  useEffect(() => {
    const prevEditingTokenIndex = prevEditingTokenIndexRef.current
    prevEditingTokenIndexRef.current = editingTokenIndex

    // When editingTokenIndex transitions from >= 0 to -1,
    // it means the user just finished editing (either confirmed or cancelled)
    // We should restore focus to the input
    if (prevEditingTokenIndex >= 0 && editingTokenIndex === -1 && state === 'selecting-connector') {
      // Use a small delay to ensure the DOM has updated
      const timeoutId = setTimeout(() => {
        focusInput()
      }, 0)
      return () => clearTimeout(timeoutId)
    }
  }, [editingTokenIndex, state, focusInput])

  const { position, maxHeight } = useDropdownPosition({
    anchorRef: containerRef,
    isOpen: (isDropdownOpen || !!activeCustomWidget) && !disabled,
    dropdownHeight: 300,
    offset: 4,
  })

  // Render custom widget or autocomplete dropdown
  const dropdownContent = activeCustomWidget ? (
    <div className="filter-box__custom-widget">
      {activeCustomWidget.render({
        onConfirm: handleCustomWidgetConfirm,
        onCancel: handleCustomWidgetCancel,
        initialValue: customWidgetInitialValue,
        fieldConfig: currentFieldConfig!,
        operatorConfig: currentOperatorConfig!,
      })}
    </div>
  ) : (
    <AutocompleteDropdown
      id={dropdownId}
      items={suggestions}
      isOpen={isDropdownOpen && !disabled}
      highlightedIndex={highlightedIndex}
      onSelect={handleSelect}
      onHighlight={handleHighlight}
      maxHeight={maxHeight}
    />
  )

  // Should show dropdown portal when dropdown is open or custom widget is active
  const showDropdownPortal = (isDropdownOpen || !!activeCustomWidget) && !disabled

  return (
    <div
      ref={containerRef}
      className={clsx('filter-box', className)}
      data-disabled={disabled || undefined}
      role="group"
      aria-label={ariaLabel ?? 'Filter expression builder'}
      aria-describedby={tokens.length > 0 ? `${generatedId}-status` : undefined}
      onBlur={handleContainerBlur}
    >
      {/* Skip link for keyboard accessibility */}
      {skipToId && (
        <a href={`#${skipToId}`} className="filter-box__skip-link">
          {skipLinkText}
        </a>
      )}
      <LiveRegion>{announcement}</LiveRegion>
      {/* Separate live region for validation errors with assertive politeness */}
      <LiveRegion politeness="assertive">{validationErrorAnnouncement}</LiveRegion>
      {/* Hidden status for screen readers */}
      {tokens.length > 0 && (
        <div id={`${generatedId}-status`} className="sr-only">
          {`${Math.ceil(tokens.length / 4)} filter expression${Math.ceil(tokens.length / 4) !== 1 ? 's' : ''} applied`}
        </div>
      )}
      <div className="filter-box__content">
        <TokenContainer
          tokens={tokens}
          inputRef={inputRef}
          inputValue={inputValue}
          placeholder={placeholder}
          onInputChange={handleInputChange}
          onInputFocus={handleFocus}
          onInputBlur={handleInputBlur}
          onInputKeyDown={handleKeyDown}
          onTokenClick={handleTokenEdit}
          onTokenSelect={handleTokenSelect}
          onOperatorClick={handleOperatorEdit}
          onConnectorClick={handleConnectorEdit}
          editingTokenIndex={editingTokenIndex}
          selectedTokenIndex={selectedTokenIndex}
          allTokensSelected={allTokensSelected}
          onTokenEditComplete={handleTokenEditComplete}
          onTokenEditCancel={handleTokenEditCancel}
          onExpressionDelete={handleExpressionDelete}
          disabled={disabled}
          fullWidth={fullWidth}
          inputProps={{
            'aria-autocomplete': 'list',
            'aria-controls': isDropdownOpen ? dropdownId : undefined,
            'aria-expanded': isDropdownOpen,
            'aria-label': ariaLabel,
            'aria-activedescendant':
              isDropdownOpen && suggestions[highlightedIndex]
                ? `${dropdownId}-item-${highlightedIndex}`
                : undefined,
          }}
        />
        {showClearButton && tokens.length > 0 && !disabled && (
          <button
            type="button"
            className="filter-box__clear-button"
            onClick={handleClear}
            aria-label="Clear all filters"
          >
            ×
          </button>
        )}
      </div>
      {usePortal ? (
        <DropdownPortal portalId={portalId}>
          {showDropdownPortal && (
            <div
              className="filter-box-dropdown-portal"
              style={{
                position: 'fixed',
                top: position.top,
                left: position.left,
                width: position.width,
                zIndex: 9999,
              }}
            >
              {dropdownContent}
            </div>
          )}
        </DropdownPortal>
      ) : (
        (showDropdownPortal || isDropdownOpen) && dropdownContent
      )}
    </div>
  )
})
