/**
 * useFilterState Hook
 *
 * Manages the state for the FilterBox component, integrating the state machine
 * with React state management.
 */

import { useState, useCallback, useMemo, useEffect, useRef } from 'react'
import { FilterStateMachine, type FilterStep } from '@/core'
import { serialize, deserialize } from '@/utils/serialization'
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
  AutocompleteContext,
  Autocompleter,
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
  /** Initial value for custom widget when editing existing value */
  customWidgetInitialValue: unknown
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
  /** Select a token (for deletion with Delete or Backspace) */
  handleTokenSelect: (tokenIndex: number) => void
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
 * Check if a field key represents a freeform field
 */
function isFreeformField(schema: FilterSchema, fieldKey: string): boolean {
  if (!schema.allowFreeformFields) return false
  return !schema.fields.some((f) => f.key === fieldKey)
}

/**
 * Generate a freeform field config based on schema settings
 */
function getFreeformFieldConfig(
  schema: FilterSchema,
  fieldKey: string,
  fieldLabel: string
): FieldConfig {
  const freeformConfig = schema.freeformFieldConfig ?? {}
  const type = freeformConfig.type ?? 'string'

  // Import getDefaultOperators dynamically to avoid circular dependency
  const defaultOps: OperatorConfig[] = [
    { key: 'eq', label: 'equals', symbol: '=' },
    { key: 'neq', label: 'not equals', symbol: '≠' },
    { key: 'contains', label: 'contains' },
    { key: 'startsWith', label: 'starts with' },
    { key: 'endsWith', label: 'ends with' },
  ]

  return {
    key: fieldKey,
    label: fieldLabel,
    type,
    operators: freeformConfig.operators ?? defaultOps,
    valueAutocompleter: freeformConfig.valueAutocompleter,
    color: freeformConfig.color,
    group: freeformConfig.group ?? 'Custom',
  }
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
    case 'selecting-field': {
      const fieldSuggestions = filterByInput(
        schema.fields.map((field) => ({
          type: 'field' as const,
          key: field.key,
          label: field.label,
          description: field.description,
          icon: field.icon,
          group: field.group,
        }))
      )

      // Add freeform field option if enabled and there's input text
      if (schema.allowFreeformFields && inputValue.trim()) {
        const trimmedInput = inputValue.trim()
        const freeformConfig = schema.freeformFieldConfig ?? {}
        const createLabel = freeformConfig.createLabel ?? 'Create field: '

        // Only add if the exact field doesn't already exist
        const exactMatch = schema.fields.some(
          (f) => f.key === trimmedInput || f.label.toLowerCase() === trimmedInput.toLowerCase()
        )

        if (!exactMatch) {
          // Validate freeform field name if validator is provided
          if (freeformConfig.validateFieldName) {
            const validationResult = freeformConfig.validateFieldName(trimmedInput)
            if (validationResult !== true && validationResult !== false) {
              // Has error message - don't show the option
              // Could show error message in UI in future enhancement
            } else if (validationResult === false) {
              // Invalid but no message - don't show the option
            } else {
              // Valid - add the freeform option
              fieldSuggestions.push({
                type: 'field' as const,
                key: `__freeform__:${trimmedInput}`,
                label: `${createLabel}"${trimmedInput}"`,
                description: 'Create a custom field',
                group: freeformConfig.group ?? 'Custom',
              })
            }
          } else {
            // No validator - always allow
            fieldSuggestions.push({
              type: 'field' as const,
              key: `__freeform__:${trimmedInput}`,
              label: `${createLabel}"${trimmedInput}"`,
              description: 'Create a custom field',
              group: freeformConfig.group ?? 'Custom',
            })
          }
        }
      }

      return fieldSuggestions
    }

    case 'selecting-operator': {
      if (!currentField) return []

      // Check if this is a freeform field
      if (isFreeformField(schema, currentField.key)) {
        const freeformConfig = schema.freeformFieldConfig ?? {}
        const _type = freeformConfig.type ?? 'string'
        const operators = freeformConfig.operators ?? [
          { key: 'eq', label: 'equals', symbol: '=' },
          { key: 'neq', label: 'not equals', symbol: '≠' },
          { key: 'contains', label: 'contains' },
          { key: 'startsWith', label: 'starts with' },
          { key: 'endsWith', label: 'ends with' },
        ]
        return filterByInput(
          operators.map((op) => ({
            type: 'operator' as const,
            key: op.key,
            label: op.label,
            description: op.symbol ? `Symbol: ${op.symbol}` : undefined,
          }))
        )
      }

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
 * Get value autocompleter for the current field/operator
 */
function getValueAutocompleter(
  fieldConfig?: FieldConfig,
  operatorConfig?: OperatorConfig
): Autocompleter | undefined {
  // Operator-specific autocompleter takes precedence
  if (operatorConfig?.valueAutocompleter) {
    return operatorConfig.valueAutocompleter
  }
  // Fall back to field-level autocompleter
  return fieldConfig?.valueAutocompleter
}

/**
 * Get placeholder text based on current state
 */
function getPlaceholder(state: FilterStep, schema?: FilterSchema): string {
  switch (state) {
    case 'selecting-field':
      if (schema?.allowFreeformFields) {
        return schema.freeformFieldConfig?.placeholder ?? 'Type or select field...'
      }
      return 'Select field...'
    case 'selecting-operator':
      return 'Select operator...'
    case 'entering-value':
      return 'Enter value...'
    case 'selecting-connector': {
      const connectors = schema?.connectors ?? [
        { key: 'AND' as const, label: 'AND' },
        { key: 'OR' as const, label: 'OR' },
      ]
      const labels = connectors.map((c) => c.label)
      return labels.length === 2 ? `${labels[0]} or ${labels[1]}?` : `Select connector...`
    }
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
  const [valueSuggestions, setValueSuggestions] = useState<AutocompleteItem[]>([])

  // Store the step before token editing so we can restore it after
  const stepBeforeEditRef = useRef<FilterStep | null>(null)

  // Track if we just selected a token (to prevent handleFocus from clearing it)
  const justSelectedTokenRef = useRef(false)

  // Undo/Redo history stacks
  const undoStack = useRef<FilterExpression[][]>([])
  const redoStack = useRef<FilterExpression[][]>([])
  const isUndoRedoOperation = useRef(false)
  const previousValue = useRef<FilterExpression[]>([])

  // Track history changes - push to undo stack when expressions change (but not during undo/redo)
  useEffect(() => {
    if (isUndoRedoOperation.current) {
      isUndoRedoOperation.current = false
      previousValue.current = value
      return
    }

    // Don't push duplicate states
    if (JSON.stringify(previousValue.current) !== JSON.stringify(value)) {
      undoStack.current.push(JSON.parse(JSON.stringify(previousValue.current)))
      // Limit history to 50 entries
      if (undoStack.current.length > 50) {
        undoStack.current.shift()
      }
      // Clear redo stack when new changes are made
      redoStack.current = []
      previousValue.current = JSON.parse(JSON.stringify(value))
    }
  }, [value])

  // Sync machine with external value on mount
  useEffect(() => {
    machine.loadExpressions(value)
  }, [machine, value])

  // Derived state - combine completed tokens with pending tokens
  const tokens = useMemo(() => {
    const completedTokens = expressionsToTokens(value)
    // Don't show pending tokens when editing an existing token with custom widget
    // In editing-token state, currentField/currentOperator are set for widget context only
    if (state === 'editing-token') {
      return completedTokens
    }
    const pendingTokens = generatePendingTokens(currentField, currentOperator, value.length)
    return [...completedTokens, ...pendingTokens]
  }, [value, currentField, currentOperator, state])

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
      const fieldLabel = expr.condition.field.label
      // First check schema fields, then check if it's a freeform field
      let fieldConfig = schema.fields.find((f) => f.key === fieldKey)
      if (!fieldConfig && isFreeformField(schema, fieldKey)) {
        fieldConfig = getFreeformFieldConfig(schema, fieldKey, fieldLabel)
      }
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
    // If in entering-value state, return value suggestions
    if (state === 'entering-value') {
      return valueSuggestions
    }
    return getSuggestions(state, schema, currentField, inputValue)
  }, [
    state,
    schema,
    currentField,
    inputValue,
    editingOperatorIndex,
    editingConnectorIndex,
    value,
    valueSuggestions,
  ])

  const placeholder = useMemo(() => getPlaceholder(state, schema), [state, schema])

  // Compute current field config (when building expression)
  const currentFieldConfig = useMemo(() => {
    if (!currentField) return undefined
    // Check for predefined field first
    const predefinedConfig = schema.fields.find((f) => f.key === currentField.key)
    if (predefinedConfig) return predefinedConfig
    // If not found and freeform is enabled, generate a freeform config
    if (schema.allowFreeformFields) {
      return getFreeformFieldConfig(schema, currentField.key, currentField.label)
    }
    return undefined
  }, [currentField, schema])

  // Compute current operator config (when building expression)
  const currentOperatorConfig = useMemo(() => {
    if (!currentFieldConfig || !currentOperator) return undefined
    return currentFieldConfig.operators.find((op) => op.key === currentOperator.key)
  }, [currentFieldConfig, currentOperator])

  // Compute active custom widget (show when in entering-value state and operator has customInput)
  const activeCustomWidget = useMemo(() => {
    if (state !== 'entering-value' && state !== 'editing-token') return undefined
    return currentOperatorConfig?.customInput
  }, [state, currentOperatorConfig])

  // Compute the initial value for custom widget when editing
  const customWidgetInitialValue = useMemo(() => {
    if (state !== 'editing-token' || editingTokenIndex < 0) return undefined

    const token = tokens[editingTokenIndex]
    if (!token || token.type !== 'value') return undefined

    const expressionIndex = token.expressionIndex
    if (expressionIndex < 0 || expressionIndex >= value.length) return undefined

    const conditionValue = value[expressionIndex]?.condition.value
    if (!conditionValue) return undefined

    // If the widget has a parse function, use it to convert serialized back to raw
    if (activeCustomWidget?.parse) {
      return activeCustomWidget.parse(conditionValue.serialized)
    }

    // Otherwise return the raw value
    return conditionValue.raw
  }, [state, editingTokenIndex, tokens, value, activeCustomWidget])

  // Fetch value suggestions when in entering-value state
  useEffect(() => {
    if (state !== 'entering-value') {
      setValueSuggestions([])
      return
    }

    const autocompleter = getValueAutocompleter(currentFieldConfig, currentOperatorConfig)
    if (!autocompleter) {
      setValueSuggestions([])
      return
    }

    // Build autocomplete context
    const context: AutocompleteContext = {
      inputValue,
      field: currentFieldConfig!,
      operator: currentOperatorConfig!,
      existingExpressions: value,
      schema,
    }

    // Handle both sync and async autocompleters
    const result = autocompleter.getSuggestions(context)

    if (result instanceof Promise) {
      let cancelled = false
      result
        .then((suggestions) => {
          if (!cancelled) {
            setValueSuggestions(suggestions)
          }
        })
        .catch(() => {
          if (!cancelled) {
            setValueSuggestions([])
          }
        })
      return () => {
        cancelled = true
      }
    } else {
      setValueSuggestions(result)
    }
    // Note: value and schema are intentionally not in deps to avoid unnecessary re-fetches
    // The autocompleter receives them in context but doesn't need to re-run when they change
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state, inputValue, currentFieldConfig, currentOperatorConfig])

  // Reset highlighted index when state changes (new suggestions context)
  useEffect(() => {
    setHighlightedIndex(-1)
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
    // If a token was just selected, don't clear the selection
    if (justSelectedTokenRef.current) {
      justSelectedTokenRef.current = false
      return
    }
    machine.transition({ type: 'FOCUS' })
    // Determine correct state based on completed expressions and partial expression
    let newState = machine.getState()
    // If there are completed expressions but no partial expression in progress,
    // we should be in selecting-connector state
    if (value.length > 0 && !currentField && !currentOperator) {
      newState = 'selecting-connector'
    }
    setState(newState)
    setIsDropdownOpen(true)
    // Clear token selection when input gains focus (Issue 3: deselect on focus move)
    setSelectedTokenIndex(-1)
    setAllTokensSelected(false)
    // Announcement will be set after suggestions are calculated
  }, [machine, value.length, currentField, currentOperator])

  const handleBlur = useCallback(() => {
    machine.transition({ type: 'BLUR' })
    setState(machine.getState())
    setIsDropdownOpen(false)
    setInputValue('')
    setCurrentField(undefined)
    setCurrentOperator(undefined)
    // Clear token selection when losing focus
    setSelectedTokenIndex(-1)
    setAllTokensSelected(false)
    // Clear editing states when losing focus
    setEditingTokenIndex(-1)
    setEditingOperatorIndex(-1)
    setEditingConnectorIndex(-1)
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
        const fieldKey = expr.condition.field.key
        const fieldLabel = expr.condition.field.label
        // First check schema fields, then check if it's a freeform field
        let fieldConfig = schema.fields.find((f) => f.key === fieldKey)
        if (!fieldConfig && isFreeformField(schema, fieldKey)) {
          fieldConfig = getFreeformFieldConfig(schema, fieldKey, fieldLabel)
        }
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
        // Check if this is a freeform field selection
        if (item.key.startsWith('__freeform__:')) {
          const freeformFieldName = item.key.replace('__freeform__:', '')
          const freeformConfig = schema.freeformFieldConfig ?? {}
          const type = freeformConfig.type ?? 'string'

          const fieldValue: FieldValue = {
            key: freeformFieldName,
            label: freeformFieldName,
            type,
          }
          setCurrentField(fieldValue)
          machine.transition({ type: 'SELECT_FIELD', payload: fieldValue })
          setState(machine.getState())
          setInputValue('')

          // Get operators for freeform field
          const operators = freeformConfig.operators ?? [
            { key: 'eq', label: 'equals', symbol: '=' },
            { key: 'neq', label: 'not equals', symbol: '≠' },
            { key: 'contains', label: 'contains' },
            { key: 'startsWith', label: 'starts with' },
            { key: 'endsWith', label: 'ends with' },
          ]

          // Auto-select operator if there's only one
          if (operators.length === 1) {
            const opConfig = operators[0]
            const operatorValue: OperatorValue = {
              key: opConfig.key,
              label: opConfig.label,
              symbol: opConfig.symbol,
            }
            setCurrentOperator(operatorValue)
            machine.transition({ type: 'SELECT_OPERATOR', payload: operatorValue })
            setState(machine.getState())
            const hasValueAutocompleter = freeformConfig.valueAutocompleter !== undefined
            setIsDropdownOpen(hasValueAutocompleter)
            setAnnouncement(
              `Created field "${freeformFieldName}" with ${operatorValue.label}. Now enter a value.`
            )
          } else {
            setAnnouncement(`Created field "${freeformFieldName}". Now select an operator.`)
          }
          return
        }

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
            // Keep dropdown open if there's a custom widget or value autocompleter
            const hasCustomWidget = opConfig.customInput !== undefined
            const hasValueAutocompleter =
              opConfig.valueAutocompleter !== undefined ||
              fieldConfig.valueAutocompleter !== undefined
            setIsDropdownOpen(hasCustomWidget || hasValueAutocompleter)
            setAnnouncement(
              `Selected ${fieldValue.label} with ${operatorValue.label}. Now enter a value.`
            )
          } else {
            setAnnouncement(`Selected ${fieldValue.label}. Now select an operator.`)
          }
        }
      } else if (currentState === 'selecting-operator') {
        // Check if this is a freeform field
        const isFreeform = isFreeformField(schema, currentField?.key ?? '')

        if (isFreeform) {
          // Handle freeform field operator selection
          const freeformConfig = schema.freeformFieldConfig ?? {}
          const operators = freeformConfig.operators ?? [
            { key: 'eq', label: 'equals', symbol: '=' },
            { key: 'neq', label: 'not equals', symbol: '≠' },
            { key: 'contains', label: 'contains' },
            { key: 'startsWith', label: 'starts with' },
            { key: 'endsWith', label: 'ends with' },
          ]
          const opConfig = operators.find((op) => op.key === item.key)
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
            const hasValueAutocompleter = freeformConfig.valueAutocompleter !== undefined
            setIsDropdownOpen(hasValueAutocompleter)
            setAnnouncement(`Selected ${operatorValue.label}. Now enter a value.`)
          }
        } else {
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
            // Keep dropdown open if there's a value autocompleter
            const hasValueAutocompleter =
              opConfig.valueAutocompleter !== undefined ||
              fieldConfig?.valueAutocompleter !== undefined
            setIsDropdownOpen(hasValueAutocompleter)
            setAnnouncement(`Selected ${operatorValue.label}. Now enter a value.`)
          }
        }
      } else if (currentState === 'selecting-connector') {
        machine.transition({ type: 'SELECT_CONNECTOR', payload: item.key as 'AND' | 'OR' })
        const newExpressions = machine.getContext().completedExpressions
        onChange([...newExpressions])
        setState(machine.getState())
        setInputValue('')
        setAnnouncement(`Added ${item.key} connector. Now select a field.`)
      } else if (currentState === 'entering-value' && item.type === 'value') {
        // Handle value selection from autocomplete dropdown
        const conditionValue: ConditionValue = {
          raw: item.key,
          display: item.label,
          serialized: String(item.key),
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
          `Filter added: value "${item.label}". Select AND, OR, or press Enter to finish.`
        )
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
    (widgetValue: unknown, display: string) => {
      // Use React state instead of machine.getState() because editing-token
      // state is managed in React state only, not the state machine
      const currentState = state

      // Handle editing-token state (editing existing value with custom widget)
      if (currentState === 'editing-token' && editingTokenIndex >= 0) {
        // Find which expression this token belongs to
        const token = tokens[editingTokenIndex]
        if (!token || token.type !== 'value') return

        const expressionIndex = token.expressionIndex
        if (expressionIndex < 0 || expressionIndex >= value.length) return

        // Serialize the value if the widget has a serialize function
        const serialized = activeCustomWidget?.serialize
          ? activeCustomWidget.serialize(widgetValue)
          : String(widgetValue)

        const conditionValue: ConditionValue = {
          raw: widgetValue,
          display,
          serialized,
        }

        // Create updated expressions
        const newExpressions = value.map((expr, idx) => {
          if (idx === expressionIndex) {
            return {
              ...expr,
              condition: {
                ...expr.condition,
                value: conditionValue,
              },
            }
          }
          return expr
        })

        setEditingTokenIndex(-1)
        setIsDropdownOpen(true)
        setState('selecting-connector')
        setCurrentField(undefined)
        setCurrentOperator(undefined)
        stepBeforeEditRef.current = null

        onChange(newExpressions)
        setAnnouncement(`Value updated to "${display}". Select AND, OR, or press Enter to finish.`)
        return
      }

      // Handle entering-value state (new value entry)
      // Use machine state for this since entering-value is managed by state machine
      if (machine.getState() !== 'entering-value') return

      // Serialize the value if the widget has a serialize function
      const serialized = activeCustomWidget?.serialize
        ? activeCustomWidget.serialize(widgetValue)
        : String(widgetValue)

      const conditionValue: ConditionValue = {
        raw: widgetValue,
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
    [machine, onChange, activeCustomWidget, editingTokenIndex, tokens, value, state]
  )

  // Handle custom widget cancellation
  const handleCustomWidgetCancel = useCallback(() => {
    // Use React state instead of machine.getState() because editing-token
    // state is managed in React state only, not the state machine
    const currentState = state

    // Handle editing-token state (cancel edit)
    if (currentState === 'editing-token') {
      setEditingTokenIndex(-1)
      setCurrentField(undefined)
      setCurrentOperator(undefined)
      setIsDropdownOpen(false)

      // Restore the step from before editing started
      if (stepBeforeEditRef.current !== null) {
        setState(stepBeforeEditRef.current)
        stepBeforeEditRef.current = null
      }
      setAnnouncement('Edit cancelled.')
      return
    }

    // Handle entering-value state (cancel new value entry)
    // Go back to operator selection
    machine.transition({ type: 'DELETE_LAST' })
    setState(machine.getState())
    setCurrentOperator(undefined)
    setIsDropdownOpen(true)
    setAnnouncement('Value input cancelled. Select an operator.')
  }, [machine, state])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault()
          setHighlightedIndex((prev) => {
            // If nothing selected, select first item
            if (prev === -1) return suggestions.length > 0 ? 0 : -1
            // Otherwise move down
            return Math.min(prev + 1, suggestions.length - 1)
          })
          break
        case 'ArrowUp':
          e.preventDefault()
          setHighlightedIndex((prev) => {
            // If at first item, deselect
            if (prev === 0) return -1
            // If nothing selected, do nothing
            if (prev === -1) return -1
            // Otherwise move up
            return Math.max(prev - 1, 0)
          })
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
          if (isDropdownOpen && highlightedIndex >= 0 && suggestions[highlightedIndex]) {
            e.preventDefault()
            handleSelect(suggestions[highlightedIndex])
          } else if (selectedTokenIndex >= 0) {
            // When a token is arrow-selected, Enter should enable editing (for value tokens)
            e.preventDefault()
            const token = tokens[selectedTokenIndex]
            if (token?.type === 'value' && !token.isPending && token.expressionIndex >= 0) {
              // Get the field and operator configs to check for custom widget
              const expression = value[token.expressionIndex]
              if (expression) {
                const fieldKey = expression.condition.field.key
                const operatorKey = expression.condition.operator.key
                const fieldConfig = schema.fields.find((f) => f.key === fieldKey)
                const operatorConfig = fieldConfig?.operators.find((op) => op.key === operatorKey)

                // Check if this operator has a custom widget
                if (operatorConfig?.customInput) {
                  // Set up context for editing with custom widget
                  setCurrentField(expression.condition.field)
                  setCurrentOperator(expression.condition.operator)
                  stepBeforeEditRef.current = state

                  // Transition to editing-token state and open dropdown with custom widget
                  setState('editing-token')
                  setEditingTokenIndex(selectedTokenIndex)
                  setSelectedTokenIndex(-1)
                  setIsDropdownOpen(true)
                  setInputValue('') // Clear input to show widget
                } else {
                  // Regular inline editing for non-widget values
                  stepBeforeEditRef.current = state
                  setEditingTokenIndex(selectedTokenIndex)
                  setSelectedTokenIndex(-1)
                  setIsDropdownOpen(false)
                }
              }
            }
          } else if (state === 'entering-value') {
            e.preventDefault()
            handleConfirmValue()
          } else if (state === 'selecting-connector' && isDropdownOpen) {
            // When in selecting-connector state with dropdown open but nothing highlighted,
            // close the dropdown to "complete" the expression without adding a connector
            e.preventDefault()
            setIsDropdownOpen(false)
          }
          // Otherwise, allow Enter to bubble up (e.g., form submission)
          break
        case 'Escape':
          setIsDropdownOpen(false)
          break
        case 'Tab':
          // Tab behavior:
          // 1. If nothing selected, select first item
          // 2. If item selected, add it to expression
          if (isDropdownOpen && suggestions.length > 0) {
            if (highlightedIndex === -1) {
              // First Tab: select first item
              e.preventDefault()
              setHighlightedIndex(0)
            } else if (suggestions[highlightedIndex]) {
              // Second Tab: add selected item
              e.preventDefault()
              handleSelect(suggestions[highlightedIndex])
            }
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
          } else if (selectedTokenIndex >= 0) {
            e.preventDefault()
            const token = tokens[selectedTokenIndex]
            if (token && token.expressionIndex >= 0) {
              const expressionIndex = token.expressionIndex

              // Special handling for connector tokens: only remove the connector, not the expression
              if (token.type === 'connector') {
                const newExpressions = value.map((expr, i) => {
                  if (i === expressionIndex && expr.connector) {
                    // Remove only the connector
                    const { connector: _, ...rest } = expr
                    return rest
                  }
                  return expr
                })
                onChange(newExpressions)
                setSelectedTokenIndex(-1)
                setAnnouncement(`Connector removed from expression ${expressionIndex + 1}.`)
              } else {
                // For non-connector tokens, delete the entire expression
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
                
                // Update machine state based on remaining expressions
                if (newExpressions.length === 0) {
                  machine.clear()
                  setState('idle')
                  setInputValue('')
                  setCurrentField(undefined)
                  setCurrentOperator(undefined)
                } else {
                  machine.loadExpressions(newExpressions)
                  setState('selecting-connector')
                }
              }
            }
          } else if (inputValue === '' && state === 'entering-value') {
            machine.transition({ type: 'DELETE_LAST' })
            setState(machine.getState())
            setCurrentOperator(undefined)
            setIsDropdownOpen(true)
            setAnnouncement('Operator removed. Select operator.')
          } else if (
            inputValue === '' &&
            (state === 'idle' || state === 'selecting-field' || state === 'selecting-connector') &&
            value.length > 0
          ) {
            e.preventDefault()
            // If no token is selected, select the last token first (instead of deleting immediately)
            // The next backspace will delete it
            setSelectedTokenIndex(tokens.length - 1)
            setIsDropdownOpen(false)
            setAnnouncement(`Selected last filter expression. Press Backspace or Delete to remove.`)
          }
          break
        case 'Delete':
          if (selectedTokenIndex >= 0) {
            e.preventDefault()
            const token = tokens[selectedTokenIndex]
            if (token && token.expressionIndex >= 0) {
              const expressionIndex = token.expressionIndex

              // Special handling for connector tokens: only remove the connector, not the expression
              if (token.type === 'connector') {
                const newExpressions = value.map((expr, i) => {
                  if (i === expressionIndex && expr.connector) {
                    // Remove only the connector
                    const { connector: _, ...rest } = expr
                    return rest
                  }
                  return expr
                })
                onChange(newExpressions)
                setSelectedTokenIndex(-1)
                setAnnouncement(`Connector removed from expression ${expressionIndex + 1}.`)
              } else {
                // For non-connector tokens, delete the entire expression
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
                
                // Update machine state based on remaining expressions
                if (newExpressions.length === 0) {
                  machine.clear()
                  setState('idle')
                  setInputValue('')
                  setCurrentField(undefined)
                  setCurrentOperator(undefined)
                } else {
                  machine.loadExpressions(newExpressions)
                  setState('selecting-connector')
                }
              }
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
        case 'z':
          // Ctrl+Z for undo
          if (e.ctrlKey && !e.shiftKey) {
            e.preventDefault()
            if (undoStack.current.length > 0) {
              // Save current state to redo stack
              redoStack.current.push(JSON.parse(JSON.stringify(value)))
              // Pop and restore previous state from undo stack
              const previousState = undoStack.current.pop()!

              isUndoRedoOperation.current = true
              onChange(previousState)

              // Clear partial expression state
              setInputValue('')
              setCurrentField(undefined)
              setCurrentOperator(undefined)
              setSelectedTokenIndex(-1)
              setAllTokensSelected(false)
              setIsDropdownOpen(false)

              // Update machine state - use clear() if going back to empty, otherwise load expressions
              if (previousState.length === 0) {
                machine.clear()
                setState('idle')
              } else {
                machine.loadExpressions(previousState)
                setState('selecting-connector')
              }

              setAnnouncement(
                previousState.length === 0
                  ? 'Undone. All filters cleared.'
                  : `Undone. ${previousState.length} filter${previousState.length !== 1 ? 's' : ''} remaining.`
              )
            } else {
              setAnnouncement('Nothing to undo.')
            }
          }
          // Ctrl+Shift+Z for redo
          else if (e.ctrlKey && e.shiftKey) {
            e.preventDefault()
            if (redoStack.current.length > 0) {
              // Save current state to undo stack
              undoStack.current.push(value)
              // Pop and restore next state from redo stack
              const nextState = redoStack.current.pop()!

              isUndoRedoOperation.current = true
              onChange(nextState)

              // Clear partial expression state
              setInputValue('')
              setCurrentField(undefined)
              setCurrentOperator(undefined)
              setSelectedTokenIndex(-1)
              setAllTokensSelected(false)
              setIsDropdownOpen(false)

              // Update machine state - use clear() if going to empty, otherwise load expressions
              if (nextState.length === 0) {
                machine.clear()
                setState('idle')
              } else {
                machine.loadExpressions(nextState)
                setState('selecting-connector')
              }

              setAnnouncement(
                nextState.length === 0
                  ? 'Redone. All filters cleared.'
                  : `Redone. ${nextState.length} filter${nextState.length !== 1 ? 's' : ''} restored.`
              )
            } else {
              setAnnouncement('Nothing to redo.')
            }
          }
          break
        case 'c':
          // Ctrl+C for copy
          if (e.ctrlKey) {
            e.preventDefault()
            if (selectedTokenIndex >= 0 || allTokensSelected) {
              // Determine which expressions to copy
              let expressionsToCopy: FilterExpression[]
              if (allTokensSelected) {
                // Copy all expressions
                expressionsToCopy = value
              } else {
                // Copy the selected expression
                const token = tokens[selectedTokenIndex]
                if (token && token.expressionIndex >= 0) {
                  expressionsToCopy = [value[token.expressionIndex]]
                } else {
                  expressionsToCopy = []
                }
              }

              if (expressionsToCopy.length > 0) {
                // Serialize to JSON and copy to clipboard
                const serialized = serialize(expressionsToCopy, schema)
                const text = JSON.stringify(serialized, null, 2)

                // Use Clipboard API
                if (navigator.clipboard && navigator.clipboard.writeText) {
                  navigator.clipboard.writeText(text).then(
                    () => {
                      setAnnouncement(
                        `Copied ${expressionsToCopy.length} expression${expressionsToCopy.length !== 1 ? 's' : ''} to clipboard.`
                      )
                    },
                    () => {
                      setAnnouncement('Failed to copy to clipboard.')
                    }
                  )
                } else {
                  // Fallback for older browsers
                  setAnnouncement('Clipboard not supported.')
                }
              }
            }
          }
          break
        case 'v':
          // Ctrl+V for paste
          if (e.ctrlKey) {
            e.preventDefault()
            // Use Clipboard API to read from clipboard
            if (navigator.clipboard && navigator.clipboard.readText) {
              navigator.clipboard.readText().then(
                (text) => {
                  try {
                    // Parse JSON
                    const parsed = JSON.parse(text)
                    if (!Array.isArray(parsed)) {
                      setAnnouncement('Invalid clipboard data.')
                      return
                    }

                    // Deserialize back to expressions
                    const pastedExpressions = deserialize(parsed, schema)

                    if (pastedExpressions.length === 0) {
                      setAnnouncement('No valid expressions to paste.')
                      return
                    }

                    // Append pasted expressions to current expressions
                    const newExpressions = [...value]

                    // If there are existing expressions, remove connector from last one
                    // and add it to pasted expressions
                    if (newExpressions.length > 0) {
                      // Remove connector from last existing expression
                      const lastExisting = newExpressions[newExpressions.length - 1]
                      if (!lastExisting.connector) {
                        // Add AND connector to connect with pasted expressions
                        newExpressions[newExpressions.length - 1] = {
                          ...lastExisting,
                          connector: 'AND',
                        }
                      }
                    }

                    // Add pasted expressions
                    pastedExpressions.forEach((expr, index) => {
                      // Remove connector from last pasted expression
                      if (index === pastedExpressions.length - 1 && expr.connector) {
                        const { connector: _, ...exprWithoutConnector } = expr
                        newExpressions.push(exprWithoutConnector)
                      } else {
                        newExpressions.push(expr)
                      }
                    })

                    onChange(newExpressions)

                    // Clear partial expression state
                    setInputValue('')
                    setCurrentField(undefined)
                    setCurrentOperator(undefined)
                    setSelectedTokenIndex(-1)
                    setAllTokensSelected(false)

                    // Update machine state
                    machine.loadExpressions(newExpressions)
                    setState('selecting-connector')

                    setAnnouncement(
                      `Pasted ${pastedExpressions.length} expression${pastedExpressions.length !== 1 ? 's' : ''}.`
                    )
                  } catch (_error) {
                    setAnnouncement('Invalid clipboard data format.')
                  }
                },
                () => {
                  setAnnouncement('Failed to read from clipboard.')
                }
              )
            } else {
              setAnnouncement('Clipboard not supported.')
            }
          }
          break
        case 'y':
          // Ctrl+Y for redo (alternative)
          if (e.ctrlKey) {
            e.preventDefault()
            if (redoStack.current.length > 0) {
              // Save current state to undo stack
              undoStack.current.push(value)
              // Pop and restore next state from redo stack
              const nextState = redoStack.current.pop()!

              isUndoRedoOperation.current = true
              onChange(nextState)

              // Clear partial expression state
              setInputValue('')
              setCurrentField(undefined)
              setCurrentOperator(undefined)
              setSelectedTokenIndex(-1)
              setAllTokensSelected(false)
              setIsDropdownOpen(false)

              // Update machine state - use clear() if going to empty, otherwise load expressions
              if (nextState.length === 0) {
                machine.clear()
                setState('idle')
              } else {
                machine.loadExpressions(nextState)
                setState('selecting-connector')
              }

              setAnnouncement(
                nextState.length === 0
                  ? 'Redone. All filters cleared.'
                  : `Redone. ${nextState.length} filter${nextState.length !== 1 ? 's' : ''} restored.`
              )
            } else {
              setAnnouncement('Nothing to redo.')
            }
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
      allTokensSelected,
      value,
      onChange,
      handleSelect,
      handleConfirmValue,
      machine,
      schema,
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
      if (token?.type === 'value' && token.expressionIndex >= 0) {
        const expression = value[token.expressionIndex]
        if (!expression) return

        // Get the field and operator configs
        const fieldKey = expression.condition.field.key
        const operatorKey = expression.condition.operator.key
        const fieldConfig = schema.fields.find((f) => f.key === fieldKey)
        const operatorConfig = fieldConfig?.operators.find((op) => op.key === operatorKey)

        // Check if this operator has a custom widget
        if (operatorConfig?.customInput) {
          // Set up context for editing with custom widget
          setCurrentField(expression.condition.field)
          setCurrentOperator(expression.condition.operator)
          stepBeforeEditRef.current = state

          // Transition to editing-token state and open dropdown with custom widget
          setState('editing-token')
          setEditingTokenIndex(tokenIndex)
          setIsDropdownOpen(true)
          setInputValue('') // Clear input to show widget
        } else {
          // Regular inline editing for non-widget values
          stepBeforeEditRef.current = state
          setEditingTokenIndex(tokenIndex)
          setIsDropdownOpen(false)
        }
      }
    },
    [tokens, value, schema, state]
  )

  // Token selection handler (for mouse clicks)
  const handleTokenSelect = useCallback(
    (tokenIndex: number) => {
      // Select the token (for deletion with Delete or Backspace)
      const token = tokens[tokenIndex]
      if (token && !token.isPending && token.expressionIndex >= 0) {
        // Set flag to prevent handleFocus from clearing the selection
        justSelectedTokenRef.current = true
        setSelectedTokenIndex(tokenIndex)
        setIsDropdownOpen(false)
        setAllTokensSelected(false)
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

      // After editing completes, transition to selecting-connector state
      // This keeps the FilterBox active and allows user to continue with AND/OR
      setState('selecting-connector')
      setIsDropdownOpen(true)
      stepBeforeEditRef.current = null

      onChange(newExpressions)
    },
    [editingTokenIndex, tokens, value, onChange]
  )

  const handleTokenEditCancel = useCallback(() => {
    setEditingTokenIndex(-1)

    // Restore the step from before editing started
    if (stepBeforeEditRef.current !== null) {
      setState(stepBeforeEditRef.current)
      stepBeforeEditRef.current = null
    }
  }, [])

  // Operator editing handlers
  const handleOperatorEdit = useCallback(
    (expressionIndex: number) => {
      if (expressionIndex < 0 || expressionIndex >= value.length) return
      setEditingOperatorIndex(expressionIndex)
      setIsDropdownOpen(true)
      setHighlightedIndex(-1)
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
      setHighlightedIndex(-1)
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
      
      // Update machine state based on remaining expressions
      if (newExpressions.length === 0) {
        machine.clear()
        setState('idle')
        setInputValue('')
        setCurrentField(undefined)
        setCurrentOperator(undefined)
      } else {
        machine.loadExpressions(newExpressions)
        setState('selecting-connector')
      }
    },
    [value, onChange, machine]
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
    customWidgetInitialValue,
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
    handleTokenSelect,
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
