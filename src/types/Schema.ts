/**
 * Schema type definitions for filter configuration
 */

import type { ReactNode } from 'react'
import type {
  AutocompleteItem,
  ConditionValue,
  FieldType,
  FilterExpression,
  ValidationResult,
} from './Expression'

// =============================================================================
// Autocompleter Types
// =============================================================================

/**
 * Context provided to autocompleters
 */
export interface AutocompleteContext {
  /** Current input text */
  inputValue: string
  /** Current field configuration */
  field: FieldConfig
  /** Current operator configuration */
  operator: OperatorConfig
  /** Already completed expressions */
  existingExpressions: FilterExpression[]
  /** Full schema */
  schema: FilterSchema
}

/**
 * Custom autocomplete widget interface
 */
export interface CustomAutocompleteWidget {
  /** Render the custom widget */
  render: (props: CustomWidgetProps) => ReactNode
  /** Validate the value */
  validate?: (value: unknown) => boolean
  /** Serialize the value */
  serialize?: (value: unknown) => string
  /** Parse a serialized value */
  parse?: (serialized: string) => unknown
}

/**
 * Props for custom widget rendering
 */
export interface CustomWidgetProps {
  /** Callback when value is confirmed */
  onConfirm: (value: unknown, display: string) => void
  /** Callback when widget is cancelled */
  onCancel: () => void
  /** Initial value (for editing) */
  initialValue?: unknown
  /** Field configuration */
  fieldConfig: FieldConfig
  /** Operator configuration */
  operatorConfig: OperatorConfig
}

/**
 * Autocompleter interface for providing suggestions
 */
export interface Autocompleter {
  /** Get suggestions based on current context */
  getSuggestions: (
    context: AutocompleteContext
  ) => Promise<AutocompleteItem[]> | AutocompleteItem[]
  /** Optional custom rendering for suggestions */
  renderItem?: (item: AutocompleteItem, isHighlighted: boolean) => ReactNode
  /** Optional custom input widget instead of dropdown */
  customWidget?: CustomAutocompleteWidget
  /** Optional value validation */
  validate?: (value: unknown, context: AutocompleteContext) => boolean
  /** Optional parse display string back to value */
  parse?: (display: string, context: AutocompleteContext) => unknown
  /** Optional format value for display */
  format?: (value: unknown, context: AutocompleteContext) => string
}

// =============================================================================
// Multi-Value Configuration
// =============================================================================

/**
 * Configuration for operators that require multiple values (e.g., 'between')
 */
export interface MultiValueConfig {
  /** Number of values required (-1 for unlimited) */
  count: number
  /** Separator between values */
  separator: string
  /** Labels for each value input */
  labels: string[]
}

// =============================================================================
// Operator Configuration
// =============================================================================

/**
 * Configuration for an operator
 */
export interface OperatorConfig {
  /** Operator key (e.g., 'eq', 'before') */
  key: string
  /** Display label (e.g., 'equals', 'before') */
  label: string
  /** Optional symbol for compact display (e.g., '=', '≠') */
  symbol?: string
  /** Override field's value type */
  valueType?: FieldType
  /** Whether a value is required (default: true) */
  valueRequired?: boolean
  /** Custom autocompleter for values */
  valueAutocompleter?: Autocompleter
  /** Custom input widget */
  customInput?: CustomAutocompleteWidget
  /** For operators needing multiple values */
  multiValue?: MultiValueConfig
}

// =============================================================================
// Field Configuration
// =============================================================================

/**
 * Configuration for a filter field
 */
export interface FieldConfig {
  /** Field key (used in API) */
  key: string
  /** Display label */
  label: string
  /** Optional description */
  description?: string
  /** Field type (determines default operators and input) */
  type: FieldType
  /** Available operators for this field */
  operators: OperatorConfig[]
  /** Default operator key (first if not specified) */
  defaultOperator?: string
  /** Field-level color */
  color?: string
  /** Field icon */
  icon?: ReactNode
  /** Group for autocomplete display */
  group?: string
  /** Whether this field can appear multiple times (default: true) */
  allowMultiple?: boolean
  /** Whether a value is required (default: true) */
  valueRequired?: boolean
  /** Custom autocompleter for values */
  valueAutocompleter?: Autocompleter
  /** Custom value validation */
  validate?: (value: ConditionValue, context: ValidationContext) => ValidationResult
  /** Custom serialization for field values */
  serialize?: (value: ConditionValue) => unknown
  /** Custom deserialization for field values */
  deserialize?: (serialized: unknown) => ConditionValue
}

/**
 * Context for field validation
 */
export interface ValidationContext {
  /** Current field configuration */
  field: FieldConfig
  /** Current operator configuration */
  operator: OperatorConfig
  /** All expressions */
  expressions: FilterExpression[]
  /** Full schema */
  schema: FilterSchema
}

// =============================================================================
// Connector Configuration
// =============================================================================

/**
 * Configuration for a connector (AND/OR)
 */
export interface ConnectorConfig {
  /** Connector key */
  key: 'AND' | 'OR'
  /** Display label */
  label: string
  /** Optional color */
  color?: string
}

// =============================================================================
// Schema Configuration
// =============================================================================

/**
 * Complete filter schema configuration
 */
export interface FilterSchema {
  /** Available fields */
  fields: FieldConfig[]
  /** Available connectors (default: AND, OR) */
  connectors?: ConnectorConfig[]
  /** Schema-level validation */
  validate?: (expressions: FilterExpression[]) => ValidationResult
  /** Maximum number of expressions allowed */
  maxExpressions?: number
  /** Custom serialization */
  serialize?: (expressions: FilterExpression[]) => unknown
  /** Custom deserialization */
  deserialize?: (data: unknown) => FilterExpression[]
}

// =============================================================================
// Default Configurations
// =============================================================================

/**
 * Default connector configurations
 */
export const DEFAULT_CONNECTORS: ConnectorConfig[] = [
  { key: 'AND', label: 'AND' },
  { key: 'OR', label: 'OR' },
]

/**
 * Default operators for string fields
 */
export const STRING_OPERATORS: OperatorConfig[] = [
  { key: 'eq', label: 'equals', symbol: '=' },
  { key: 'neq', label: 'not equals', symbol: '≠' },
  { key: 'contains', label: 'contains' },
  { key: 'startsWith', label: 'starts with' },
  { key: 'endsWith', label: 'ends with' },
  { key: 'like', label: 'like' },
]

/**
 * Default operators for number fields
 */
export const NUMBER_OPERATORS: OperatorConfig[] = [
  { key: 'eq', label: 'equals', symbol: '=' },
  { key: 'neq', label: 'not equals', symbol: '≠' },
  { key: 'gt', label: 'greater than', symbol: '>' },
  { key: 'gte', label: 'greater or equal', symbol: '≥' },
  { key: 'lt', label: 'less than', symbol: '<' },
  { key: 'lte', label: 'less or equal', symbol: '≤' },
  {
    key: 'between',
    label: 'between',
    multiValue: { count: 2, separator: 'and', labels: ['from', 'to'] },
  },
]

/**
 * Default operators for date fields
 */
export const DATE_OPERATORS: OperatorConfig[] = [
  { key: 'before', label: 'before' },
  { key: 'after', label: 'after' },
  { key: 'on', label: 'on' },
  {
    key: 'between',
    label: 'between',
    multiValue: { count: 2, separator: 'and', labels: ['from', 'to'] },
  },
]

/**
 * Default operators for boolean fields
 */
export const BOOLEAN_OPERATORS: OperatorConfig[] = [{ key: 'is', label: 'is' }]

/**
 * Default operators for enum fields
 */
export const ENUM_OPERATORS: OperatorConfig[] = [
  { key: 'eq', label: 'is', symbol: '=' },
  { key: 'neq', label: 'is not', symbol: '≠' },
  {
    key: 'in',
    label: 'in',
    multiValue: { count: -1, separator: ',', labels: [] },
  },
]

/**
 * Default operators for ID fields
 */
export const ID_OPERATORS: OperatorConfig[] = [
  { key: 'eq', label: 'equals', symbol: '=' },
  { key: 'in', label: 'in list' },
]

/**
 * Get default operators for a field type
 */
export function getDefaultOperators(type: FieldType): OperatorConfig[] {
  switch (type) {
    case 'string':
      return STRING_OPERATORS
    case 'number':
      return NUMBER_OPERATORS
    case 'date':
    case 'datetime':
      return DATE_OPERATORS
    case 'boolean':
      return BOOLEAN_OPERATORS
    case 'enum':
      return ENUM_OPERATORS
    case 'id':
      return ID_OPERATORS
    case 'custom':
    default:
      return STRING_OPERATORS
  }
}
