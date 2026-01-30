/**
 * react-select-filter-box
 *
 * A Sequential Filter Box component for React that provides a Select2-like
 * single-line filter expression builder.
 */

// Main Component
export { FilterBox, type FilterBoxProps, type FilterBoxHandle } from './components'

// Individual Components
export {
  Token,
  TokenInput,
  TokenContainer,
  AutocompleteDropdown,
  type TokenProps,
  type TokenInputProps,
  type TokenContainerProps,
  type AutocompleteDropdownProps,
} from './components'

// Hooks
export { useFilterState, type UseFilterStateProps, type UseFilterStateReturn } from './hooks'
export {
  useDropdownPosition,
  type UseDropdownPositionOptions,
  type UseDropdownPositionResult,
  type DropdownPosition,
  type DropdownPlacement,
} from './hooks'

// Types
export {
  type FilterExpression,
  type FilterCondition,
  type FilterSchema,
  type FieldConfig,
  type OperatorConfig,
  type FieldType,
  type FieldValue,
  type OperatorValue,
  type ConditionValue,
  type ConnectorValue,
  type TokenData,
  type AutocompleteItem,
  type ValidationResult,
  getDefaultOperators,
  DEFAULT_CONNECTORS,
  STRING_OPERATORS,
  NUMBER_OPERATORS,
  DATE_OPERATORS,
  BOOLEAN_OPERATORS,
  ENUM_OPERATORS,
  ID_OPERATORS,
} from './types'

// Utilities
export {
  serialize,
  deserialize,
  toDisplayString,
  toQueryString,
  fromQueryString,
  type SerializedExpression,
} from './utils'

// Core (for advanced use cases)
export { FilterStateMachine, type FilterStep } from './core'
