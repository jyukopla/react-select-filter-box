/**
 * useFilterState Hook
 *
 * Manages the state for the FilterBox component, integrating the state machine
 * with React state management.
 */

import { useState, useCallback, useMemo, useEffect } from 'react'
import { FilterStateMachine, type FilterStep } from '@/core'
import type {
  FilterSchema,
  FilterExpression,
  AutocompleteItem,
  TokenData,
  FieldValue,
  OperatorValue,
  ConditionValue,
} from '@/types'

export interface UseFilterStateProps {
  /** Schema defining available fields and operators */
  schema: FilterSchema
  /** Current filter expressions (controlled) */
  value: FilterExpression[]
  /** Called when expressions change */
  onChange: (expressions: FilterExpression[]) => void
}

export interface UseFilterStateReturn {
  /** Current state machine state */
  state: FilterStep
  /** Tokens to display */
  tokens: TokenData[]
  /** Whether dropdown is open */
  isDropdownOpen: boolean
  /** Current suggestions */
  suggestions: AutocompleteItem[]
  /** Currently highlighted suggestion index */
  highlightedIndex: number
  /** Current input value */
  inputValue: string
  /** Placeholder text */
  placeholder: string
  /** Screen reader announcement */
  announcement: string
  /** Index of token currently being edited (-1 if not editing) */
  editingTokenIndex: number
  /** Index of currently selected token (-1 if none) */
  selectedTokenIndex: number
  /** Whether all tokens are selected (via Ctrl+A) */
  allTokensSelected: boolean
  /** Handle focus event */
  handleFocus: () => void
  /** Handle blur event */
  handleBlur: () => void
  /** Handle input change */
  handleInputChange: (value: string) => void
  /** Handle key down */
  handleKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void
  /** Handle suggestion selection */
  handleSelect: (item: AutocompleteItem) => void
  /** Handle highlighting a suggestion */
  handleHighlight: (index: number) => void
  /** Confirm the current value */
  handleConfirmValue: () => void
  /** Clear all expressions */
  handleClear: () => void
  /** Start editing a token */
  handleTokenEdit: (tokenIndex: number) => void
  /** Complete editing a token */
  handleTokenEditComplete: (newValue: ConditionValue) => void
  /** Cancel editing a token */
  handleTokenEditCancel: () => void
}

/**
 * Convert expressions to tokens for display
 */
function expressionsToTokens(expressions: FilterExpression[]): TokenData[] {
  const tokens: TokenData[] = []
  let position = 0

  expressions.forEach((expr, exprIndex) => {
    // Field token
    tokens.push({
      id: `${exprIndex}-field`,
      type: 'field',
      value: expr.condition.field,
      position: position++,
      expressionIndex: exprIndex,
    })

    // Operator token
    tokens.push({
      id: `${exprIndex}-operator`,
      type: 'operator',
      value: expr.condition.operator,
      position: position++,
      expressionIndex: exprIndex,
    })

    // Value token
    tokens.push({
      id: `${exprIndex}-value`,
      type: 'value',
      value: expr.condition.value,
      position: position++,
      expressionIndex: exprIndex,
    })

    // Connector token (if present)
    if (expr.connector) {
      tokens.push({
        id: `${exprIndex}-connector`,
        type: 'connector',
        value: { key: expr.connector, label: expr.connector },
        position: position++,
        expressionIndex: exprIndex,
      })
    }
  })

  return tokens
}

/**
 * Get suggestions based on current state
 */
function getSuggestions(
  state: FilterStep,
  schema: FilterSchema,
  currentField?: FieldValue,
  inputValue: string = ''
): AutocompleteItem[] {
  const filterByInput = (items: AutocompleteItem[]) => {
    if (!inputValue) return items
    const lower = inputValue.toLowerCase()
    return items.filter(
      (item) =>
        item.label.toLowerCase().includes(lower) ||
        (item.description?.toLowerCase().includes(lower) ?? false)
    )
  }

  switch (state) {
    case 'selecting-field':
      return filterByInput(
        schema.fields.map((field) => ({
          type: 'field' as const,
          key: field.key,
          label: field.label,
          description: field.description,
          icon: field.icon,
          group: field.group,
        }))
      )

    case 'selecting-operator':
      if (!currentField) return []
      const fieldConfig = schema.fields.find((f) => f.key === currentField.key)
      if (!fieldConfig) return []
      return filterByInput(
        fieldConfig.operators.map((op) => ({
          type: 'operator' as const,
          key: op.key,
          label: op.label,
          description: op.symbol ? `Symbol: ${op.symbol}` : undefined,
        }))
      )

    case 'selecting-connector':
      const connectors = schema.connectors ?? [
        { key: 'AND' as const, label: 'AND' },
        { key: 'OR' as const, label: 'OR' },
      ]
      return filterByInput(
        connectors.map((conn) => ({
          type: 'connector' as const,
          key: conn.key,
          label: conn.label,
        }))
      )

    default:
      return []
  }
}

/**
 * Get placeholder text based on current state
 */
function getPlaceholder(state: FilterStep): string {
  switch (state) {
    case 'selecting-field':
      return 'Select field...'
    case 'selecting-operator':
      return 'Select operator...'
    case 'entering-value':
      return 'Enter value...'
    case 'selecting-connector':
      return 'AND or OR?'
    default:
      return 'Add filter...'
  }
}

/**
 * Hook for managing filter box state
 */
export function useFilterState({
  schema,
  value,
  onChange,
}: UseFilterStateProps): UseFilterStateReturn {
  // State machine instance (stable reference)
  const [machine] = useState(() => new FilterStateMachine())

  // React state
  const [state, setState] = useState<FilterStep>('idle')
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [inputValue, setInputValue] = useState('')
  const [highlightedIndex, setHighlightedIndex] = useState(0)
  const [editingTokenIndex, setEditingTokenIndex] = useState(-1)
  const [selectedTokenIndex, setSelectedTokenIndex] = useState(-1)
  const [allTokensSelected, setAllTokensSelected] = useState(false)
  const [currentField, setCurrentField] = useState<FieldValue | undefined>()
  const [currentOperator, setCurrentOperator] = useState<OperatorValue | undefined>()
  const [announcement, setAnnouncement] = useState('')

  // Sync machine with external value on mount
  useEffect(() => {
    machine.loadExpressions(value)
  }, [machine, value])

  // Derived state
  const tokens = useMemo(() => expressionsToTokens(value), [value])

  const suggestions = useMemo(
    () => getSuggestions(state, schema, currentField, inputValue),
    [state, schema, currentField, inputValue]
  )

  const placeholder = useMemo(() => getPlaceholder(state), [state])

  // Reset highlighted index when state changes (new suggestions context)
  useEffect(() => {
    setHighlightedIndex(0)
  }, [state])

  // Generate announcements when dropdown opens or suggestions change
  useEffect(() => {
    if (isDropdownOpen && suggestions.length > 0) {
      const count = suggestions.length
      const itemType = suggestions[0]?.type === 'field' ? 'field' :
                       suggestions[0]?.type === 'operator' ? 'operator' :
                       suggestions[0]?.type === 'connector' ? 'connector' : 'suggestion'
      setAnnouncement(`${count} ${itemType}${count !== 1 ? 's' : ''} available. Use arrow keys to navigate.`)
    } else if (isDropdownOpen && suggestions.length === 0) {
      setAnnouncement('No suggestions available.')
    }
  }, [isDropdownOpen, suggestions])

  // Handlers
  const handleFocus = useCallback(() => {
    machine.transition({ type: 'FOCUS' })
    const newState = machine.getState()
    setState(newState)
    setIsDropdownOpen(true)
    // Announcement will be set after suggestions are calculated
  }, [machine])

  const handleBlur = useCallback(() => {
    machine.transition({ type: 'BLUR' })
    setState(machine.getState())
    setIsDropdownOpen(false)
    setInputValue('')
    setCurrentField(undefined)
    setCurrentOperator(undefined)
  }, [machine])

  const handleInputChange = useCallback((newValue: string) => {
    setInputValue(newValue)
    // Clear token selection when typing
    setSelectedTokenIndex(-1)
    setAllTokensSelected(false)
  }, [])

  const handleHighlight = useCallback((index: number) => {
    setHighlightedIndex(index)
  }, [])

  const handleSelect = useCallback(
    (item: AutocompleteItem) => {
      const currentState = machine.getState()

      if (currentState === 'selecting-field') {
        const fieldConfig = schema.fields.find((f) => f.key === item.key)
        if (fieldConfig) {
          const fieldValue: FieldValue = {
            key: fieldConfig.key,
            label: fieldConfig.label,
            type: fieldConfig.type,
          }
          setCurrentField(fieldValue)
          machine.transition({ type: 'SELECT_FIELD', payload: fieldValue })
          setState(machine.getState())
          setInputValue('')
          setAnnouncement(`Selected ${fieldValue.label}. Now select an operator.`)
        }
      } else if (currentState === 'selecting-operator') {
        const fieldConfig = schema.fields.find((f) => f.key === currentField?.key)
        const opConfig = fieldConfig?.operators.find((op) => op.key === item.key)
        if (opConfig) {
          const operatorValue: OperatorValue = {
            key: opConfig.key,
            label: opConfig.label,
            symbol: opConfig.symbol,
          }
          setCurrentOperator(operatorValue)
          machine.transition({ type: 'SELECT_OPERATOR', payload: operatorValue })
          setState(machine.getState())
          setInputValue('')
          // Close dropdown for value entry (free text)
          setIsDropdownOpen(false)
          setAnnouncement(`Selected ${operatorValue.label}. Now enter a value.`)
        }
      } else if (currentState === 'selecting-connector') {
        machine.transition({ type: 'SELECT_CONNECTOR', payload: item.key as 'AND' | 'OR' })
        const newExpressions = machine.getContext().completedExpressions
        onChange([...newExpressions])
        setState(machine.getState())
        setInputValue('')
        setAnnouncement(`Added ${item.key} connector. Now select a field.`)
      }
    },
    [machine, schema, currentField, onChange]
  )

  const handleConfirmValue = useCallback(() => {
    if (machine.getState() === 'entering-value' && inputValue.trim()) {
      const conditionValue: ConditionValue = {
        raw: inputValue.trim(),
        display: inputValue.trim(),
        serialized: inputValue.trim(),
      }
      machine.transition({ type: 'CONFIRM_VALUE', payload: conditionValue })
      const newExpressions = machine.getContext().completedExpressions
      onChange([...newExpressions])
      setState(machine.getState())
      setInputValue('')
      setCurrentField(undefined)
      setCurrentOperator(undefined)
      setIsDropdownOpen(true)
      setAnnouncement(`Filter added: value "${inputValue.trim()}". Select AND, OR, or press Enter to finish.`)
    }
  }, [machine, inputValue, onChange])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault()
          setHighlightedIndex((prev) => Math.min(prev + 1, suggestions.length - 1))
          break
        case 'ArrowUp':
          e.preventDefault()
          setHighlightedIndex((prev) => Math.max(prev - 1, 0))
          break
        case 'ArrowLeft':
          // Navigate to tokens when input is empty
          if (inputValue === '' && tokens.length > 0) {
            e.preventDefault()
            if (selectedTokenIndex === -1) {
              // Select last token
              setSelectedTokenIndex(tokens.length - 1)
            } else if (selectedTokenIndex > 0) {
              // Navigate to previous token
              setSelectedTokenIndex(selectedTokenIndex - 1)
            }
            setIsDropdownOpen(false)
          }
          break
        case 'ArrowRight':
          // Navigate through tokens
          if (selectedTokenIndex >= 0) {
            e.preventDefault()
            if (selectedTokenIndex < tokens.length - 1) {
              // Navigate to next token
              setSelectedTokenIndex(selectedTokenIndex + 1)
            } else {
              // Was on last token, deselect and focus input
              setSelectedTokenIndex(-1)
            }
          }
          break
        case 'Enter':
          e.preventDefault()
          if (isDropdownOpen && suggestions[highlightedIndex]) {
            handleSelect(suggestions[highlightedIndex])
          } else if (state === 'entering-value') {
            handleConfirmValue()
          }
          break
        case 'Escape':
          setIsDropdownOpen(false)
          break
        case 'Tab':
          // Tab selects the highlighted item and moves to next step
          if (isDropdownOpen && suggestions[highlightedIndex]) {
            e.preventDefault()
            handleSelect(suggestions[highlightedIndex])
          }
          // If dropdown is not open, let Tab move focus naturally
          break
        case 'Backspace':
          // Ctrl+Backspace deletes all expressions
          if (e.ctrlKey && tokens.length > 0) {
            e.preventDefault()
            machine.clear()
            setState('idle')
            setInputValue('')
            setCurrentField(undefined)
            setCurrentOperator(undefined)
            setSelectedTokenIndex(-1)
            setAllTokensSelected(false)
            onChange([])
            setAnnouncement('All filters cleared.')
          } else if (inputValue === '' && state === 'entering-value') {
            machine.transition({ type: 'DELETE_LAST' })
            setState(machine.getState())
            setCurrentOperator(undefined)
            setIsDropdownOpen(true)
            setAnnouncement('Operator removed. Select operator.')
          }
          break
        case 'Delete':
          // Delete the selected token (entire expression)
          if (selectedTokenIndex >= 0) {
            e.preventDefault()
            const token = tokens[selectedTokenIndex]
            if (token) {
              const expressionIndex = token.expressionIndex
              const newExpressions = value.filter((_, i) => i !== expressionIndex)
              onChange(newExpressions)
              setSelectedTokenIndex(-1)
              setAnnouncement(`Filter expression ${expressionIndex + 1} deleted.`)
            }
          }
          break
        case 'a':
          // Ctrl+A selects all tokens
          if (e.ctrlKey && tokens.length > 0) {
            e.preventDefault()
            setAllTokensSelected(true)
          }
          break
      }
    },
    [
      suggestions,
      highlightedIndex,
      isDropdownOpen,
      state,
      inputValue,
      tokens,
      selectedTokenIndex,
      value,
      onChange,
      handleSelect,
      handleConfirmValue,
      machine,
    ]
  )

  const handleClear = useCallback(() => {
    machine.clear()
    setState('idle')
    setInputValue('')
    setCurrentField(undefined)
    setCurrentOperator(undefined)
    setEditingTokenIndex(-1)
    onChange([])
    setAnnouncement('All filters cleared.')
  }, [machine, onChange])

  // Token editing handlers
  const handleTokenEdit = useCallback((tokenIndex: number) => {
    // Only value tokens are editable
    const token = tokens[tokenIndex]
    if (token?.type === 'value') {
      setEditingTokenIndex(tokenIndex)
      setIsDropdownOpen(false)
    }
  }, [tokens])

  const handleTokenEditComplete = useCallback((newValue: ConditionValue) => {
    if (editingTokenIndex < 0) return

    // Find which expression this token belongs to
    const token = tokens[editingTokenIndex]
    if (!token || token.type !== 'value') return

    const expressionIndex = token.expressionIndex
    if (expressionIndex < 0 || expressionIndex >= value.length) return

    // Create updated expressions
    const newExpressions = value.map((expr, idx) => {
      if (idx === expressionIndex) {
        return {
          ...expr,
          condition: {
            ...expr.condition,
            value: newValue,
          },
        }
      }
      return expr
    })

    setEditingTokenIndex(-1)
    onChange(newExpressions)
  }, [editingTokenIndex, tokens, value, onChange])

  const handleTokenEditCancel = useCallback(() => {
    setEditingTokenIndex(-1)
  }, [])

  return {
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
    handleFocus,
    handleBlur,
    handleInputChange,
    handleKeyDown,
    handleSelect,
    handleHighlight,
    handleConfirmValue,
    handleClear,
    handleTokenEdit,
    handleTokenEditComplete,
    handleTokenEditCancel,
  }
}
