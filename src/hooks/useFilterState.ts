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
  OperatorConfig,
  FieldConfig,
  CustomAutocompleteWidget,
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
  /** Index of expression whose operator is being edited (-1 if not editing) */
  editingOperatorIndex: number
  /** Index of expression whose connector is being edited (-1 if not editing) */
  editingConnectorIndex: number
  /** Active custom widget to render (when in entering-value state with customInput) */
  activeCustomWidget: CustomAutocompleteWidget | undefined
  /** Current field config (when building expression) */
  currentFieldConfig: FieldConfig | undefined
  /** Current operator config (when building expression) */
  currentOperatorConfig: OperatorConfig | undefined
  /** Handle custom widget value confirmation */
  handleCustomWidgetConfirm: (value: unknown, display: string) => void
  /** Handle custom widget cancellation */
  handleCustomWidgetCancel: () => void
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
  /** Start editing an operator in an existing expression */
  handleOperatorEdit: (expressionIndex: number) => void
  /** Cancel operator editing */
  handleOperatorEditCancel: () => void
  /** Start editing a connector in an existing expression */
  handleConnectorEdit: (expressionIndex: number) => void
  /** Cancel connector editing */
  handleConnectorEditCancel: () => void
  /** Delete an expression by index */
  handleExpressionDelete: (expressionIndex: number) => void
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
      isPending: false,
    })

    // Operator token
    tokens.push({
      id: `${exprIndex}-operator`,
      type: 'operator',
      value: expr.condition.operator,
      position: position++,
      expressionIndex: exprIndex,
      isPending: false,
    })

    // Value token
    tokens.push({
      id: `${exprIndex}-value`,
      type: 'value',
      value: expr.condition.value,
      position: position++,
      expressionIndex: exprIndex,
      isPending: false,
    })

    // Connector token (if present)
    if (expr.connector) {
      tokens.push({
        id: `${exprIndex}-connector`,
        type: 'connector',
        value: { key: expr.connector, label: expr.connector },
        position: position++,
        expressionIndex: exprIndex,
        isPending: false,
      })
    }
  })

  return tokens
}

/**
 * Generate pending tokens for incomplete expression being built
 */
function generatePendingTokens(
  currentField?: FieldValue,
  currentOperator?: OperatorValue,
  completedExpressionsCount: number = 0
): TokenData[] {
  const tokens: TokenData[] = []
  const basePosition = completedExpressionsCount * 4 // max 4 tokens per expression

  if (currentField) {
    tokens.push({
      id: 'pending-field',
      type: 'field',
      value: currentField,
      position: basePosition,
      expressionIndex: -1, // -1 indicates pending
      isPending: true,
    })
  }

  if (currentOperator) {
    tokens.push({
      id: 'pending-operator',
      type: 'operator',
      value: currentOperator,
      position: basePosition + 1,
      expressionIndex: -1,
      isPending: true,
    })
  }

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

    case 'selecting-operator': {
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
    }

    case 'selecting-connector': {
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
    }

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
  const [editingOperatorIndex, setEditingOperatorIndex] = useState(-1)
  const [editingConnectorIndex, setEditingConnectorIndex] = useState(-1)

  // Sync machine with external value on mount
  useEffect(() => {
    machine.loadExpressions(value)
  }, [machine, value])

  // Derived state - combine completed tokens with pending tokens
  const tokens = useMemo(() => {
    const completedTokens = expressionsToTokens(value)
    const pendingTokens = generatePendingTokens(currentField, currentOperator, value.length)
    return [...completedTokens, ...pendingTokens]
  }, [value, currentField, currentOperator])

  // Get suggestions - handles both normal state and operator/connector editing mode
  const suggestions = useMemo(() => {
    // If editing a connector, show connector options
    if (editingConnectorIndex >= 0 && value[editingConnectorIndex]) {
      const connectors = schema.connectors ?? [
        { key: 'AND' as const, label: 'AND' },
        { key: 'OR' as const, label: 'OR' },
      ]
      return connectors.map((conn) => ({
        type: 'connector' as const,
        key: conn.key,
        label: conn.label,
      }))
    }
    // If editing an operator, show operators for that expression's field
    if (editingOperatorIndex >= 0 && value[editingOperatorIndex]) {
      const expr = value[editingOperatorIndex]
      const fieldKey = expr.condition.field.key
      const fieldConfig = schema.fields.find((f) => f.key === fieldKey)
      if (fieldConfig) {
        return fieldConfig.operators.map((op) => ({
          type: 'operator' as const,
          key: op.key,
          label: op.label,
          description: op.symbol ? `Symbol: ${op.symbol}` : undefined,
        }))
      }
      return []
    }
    return getSuggestions(state, schema, currentField, inputValue)
  }, [state, schema, currentField, inputValue, editingOperatorIndex, editingConnectorIndex, value])

  const placeholder = useMemo(() => getPlaceholder(state), [state])

  // Compute current field config (when building expression)
  const currentFieldConfig = useMemo(() => {
    if (!currentField) return undefined
    return schema.fields.find((f) => f.key === currentField.key)
  }, [currentField, schema.fields])

  // Compute current operator config (when building expression)
  const currentOperatorConfig = useMemo(() => {
    if (!currentFieldConfig || !currentOperator) return undefined
    return currentFieldConfig.operators.find((op) => op.key === currentOperator.key)
  }, [currentFieldConfig, currentOperator])

  // Compute active custom widget (show when in entering-value state and operator has customInput)
  const activeCustomWidget = useMemo(() => {
    if (state !== 'entering-value') return undefined
    return currentOperatorConfig?.customInput
  }, [state, currentOperatorConfig])

  // Reset highlighted index when state changes (new suggestions context)
  useEffect(() => {
    setHighlightedIndex(0)
  }, [state])

  // Generate announcements when dropdown opens or suggestions change
  useEffect(() => {
    if (isDropdownOpen && suggestions.length > 0) {
      const count = suggestions.length
      const itemType =
        suggestions[0]?.type === 'field'
          ? 'field'
          : suggestions[0]?.type === 'operator'
            ? 'operator'
            : suggestions[0]?.type === 'connector'
              ? 'connector'
              : 'suggestion'
      setAnnouncement(
        `${count} ${itemType}${count !== 1 ? 's' : ''} available. Use arrow keys to navigate.`
      )
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
      // Handle connector editing mode
      if (editingConnectorIndex >= 0 && item.type === 'connector') {
        const expr = value[editingConnectorIndex]
        const newConnector = item.key as 'AND' | 'OR'
        // Update the expression with new connector
        const newExpressions = [...value]
        newExpressions[editingConnectorIndex] = {
          ...expr,
          connector: newConnector,
        }
        onChange(newExpressions)
        setEditingConnectorIndex(-1)
        setIsDropdownOpen(false)
        setAnnouncement(`Connector changed to ${newConnector}`)
        return
      }

      // Handle operator editing mode
      if (editingOperatorIndex >= 0 && item.type === 'operator') {
        const expr = value[editingOperatorIndex]
        const fieldConfig = schema.fields.find((f) => f.key === expr.condition.field.key)
        const opConfig = fieldConfig?.operators.find((op) => op.key === item.key)
        if (opConfig) {
          const operatorValue: OperatorValue = {
            key: opConfig.key,
            label: opConfig.label,
            symbol: opConfig.symbol,
          }
          // Update the expression with new operator
          const newExpressions = [...value]
          newExpressions[editingOperatorIndex] = {
            ...expr,
            condition: {
              ...expr.condition,
              operator: operatorValue,
            },
          }
          onChange(newExpressions)
          setEditingOperatorIndex(-1)
          setIsDropdownOpen(false)
          setAnnouncement(`Operator changed to ${operatorValue.label}`)
        }
        return
      }

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

          // Auto-select operator if there's only one
          if (fieldConfig.operators.length === 1) {
            const opConfig = fieldConfig.operators[0]
            const operatorValue: OperatorValue = {
              key: opConfig.key,
              label: opConfig.label,
              symbol: opConfig.symbol,
            }
            setCurrentOperator(operatorValue)
            machine.transition({ type: 'SELECT_OPERATOR', payload: operatorValue })
            setState(machine.getState())
            // Close dropdown for value entry (free text) unless there's a custom widget
            const hasCustomWidget = opConfig.customInput !== undefined
            setIsDropdownOpen(hasCustomWidget)
            setAnnouncement(`Selected ${fieldValue.label} with ${operatorValue.label}. Now enter a value.`)
          } else {
            setAnnouncement(`Selected ${fieldValue.label}. Now select an operator.`)
          }
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
    [machine, schema, currentField, onChange, editingOperatorIndex, editingConnectorIndex, value]
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
      setAnnouncement(
        `Filter added: value "${inputValue.trim()}". Select AND, OR, or press Enter to finish.`
      )
    }
  }, [machine, inputValue, onChange])

  // Handle custom widget value confirmation
  const handleCustomWidgetConfirm = useCallback(
    (value: unknown, display: string) => {
      if (machine.getState() !== 'entering-value') return

      // Serialize the value if the widget has a serialize function
      const serialized = activeCustomWidget?.serialize
        ? activeCustomWidget.serialize(value)
        : String(value)

      const conditionValue: ConditionValue = {
        raw: value,
        display,
        serialized,
      }
      machine.transition({ type: 'CONFIRM_VALUE', payload: conditionValue })
      const newExpressions = machine.getContext().completedExpressions
      onChange([...newExpressions])
      setState(machine.getState())
      setInputValue('')
      setCurrentField(undefined)
      setCurrentOperator(undefined)
      setIsDropdownOpen(true)
      setAnnouncement(`Filter added: value "${display}". Select AND, OR, or press Enter to finish.`)
    },
    [machine, onChange, activeCustomWidget]
  )

  // Handle custom widget cancellation
  const handleCustomWidgetCancel = useCallback(() => {
    // Go back to operator selection
    machine.transition({ type: 'DELETE_LAST' })
    setState(machine.getState())
    setCurrentOperator(undefined)
    setIsDropdownOpen(true)
    setAnnouncement('Value input cancelled. Select an operator.')
  }, [machine])

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
            if (token && token.expressionIndex >= 0) {
              const expressionIndex = token.expressionIndex
              // Remove the expression and fix connectors
              const newExpressions = value
                .filter((_, i) => i !== expressionIndex)
                .map((expr, i, arr) => {
                  // If this is now the last expression, remove its connector
                  if (i === arr.length - 1 && expr.connector) {
                    const { connector: _, ...rest } = expr
                    return rest
                  }
                  return expr
                })
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
  const handleTokenEdit = useCallback(
    (tokenIndex: number) => {
      // Only value tokens are editable
      const token = tokens[tokenIndex]
      if (token?.type === 'value') {
        setEditingTokenIndex(tokenIndex)
        setIsDropdownOpen(false)
      }
    },
    [tokens]
  )

  const handleTokenEditComplete = useCallback(
    (newValue: ConditionValue) => {
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
    },
    [editingTokenIndex, tokens, value, onChange]
  )

  const handleTokenEditCancel = useCallback(() => {
    setEditingTokenIndex(-1)
  }, [])

  // Operator editing handlers
  const handleOperatorEdit = useCallback(
    (expressionIndex: number) => {
      if (expressionIndex < 0 || expressionIndex >= value.length) return
      setEditingOperatorIndex(expressionIndex)
      setIsDropdownOpen(true)
      setHighlightedIndex(0)
      setAnnouncement('Select a new operator')
    },
    [value.length]
  )

  const handleOperatorEditCancel = useCallback(() => {
    setEditingOperatorIndex(-1)
    setIsDropdownOpen(false)
  }, [])

  // Connector editing handlers
  const handleConnectorEdit = useCallback(
    (expressionIndex: number) => {
      // Only expressions with connectors can be edited
      if (expressionIndex < 0 || expressionIndex >= value.length) return
      if (!value[expressionIndex]?.connector) return
      setEditingConnectorIndex(expressionIndex)
      setIsDropdownOpen(true)
      setHighlightedIndex(0)
      setAnnouncement('Select a new connector')
    },
    [value]
  )

  const handleConnectorEditCancel = useCallback(() => {
    setEditingConnectorIndex(-1)
    setIsDropdownOpen(false)
  }, [])

  // Delete an expression by index
  const handleExpressionDelete = useCallback(
    (expressionIndex: number) => {
      if (expressionIndex < 0 || expressionIndex >= value.length) return

      // Remove the expression and fix connectors
      const newExpressions = value
        .filter((_, i) => i !== expressionIndex)
        .map((expr, i, arr) => {
          // If this is now the last expression, remove its connector
          if (i === arr.length - 1 && expr.connector) {
            const { connector: _, ...rest } = expr
            return rest
          }
          return expr
        })
      onChange(newExpressions)
      setSelectedTokenIndex(-1)
      setAnnouncement(`Filter expression ${expressionIndex + 1} deleted.`)
    },
    [value, onChange]
  )

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
    editingOperatorIndex,
    editingConnectorIndex,
    activeCustomWidget,
    currentFieldConfig,
    currentOperatorConfig,
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
    handleOperatorEdit,
    handleOperatorEditCancel,
    handleConnectorEdit,
    handleConnectorEditCancel,
    handleCustomWidgetConfirm,
    handleCustomWidgetCancel,
    handleExpressionDelete,
  }
}
