/**
 * Core expression types for the filter box
 */

import type { ReactNode } from 'react'

// =============================================================================
// Field Types
// =============================================================================

/**
 * Supported field types that determine default operators and input behavior
 */
export type FieldType =
  | 'string'
  | 'number'
  | 'date'
  | 'datetime'
  | 'boolean'
  | 'enum'
  | 'id'
  | 'custom'

// =============================================================================
// Value Types
// =============================================================================

/**
 * A field value with metadata
 */
export interface FieldValue {
  /** API field key */
  key: string
  /** Display label */
  label: string
  /** Field type for styling and behavior */
  type: FieldType
}

/**
 * An operator value with metadata
 */
export interface OperatorValue {
  /** Operator key (e.g., 'eq', 'before') */
  key: string
  /** Display label (e.g., 'equals', 'before') */
  label: string
  /** Optional symbol for compact display (e.g., '=', '≠') */
  symbol?: string
}

/**
 * A condition value with raw, display, and serialized forms
 */
export interface ConditionValue {
  /** Raw value (string, Date, number, etc.) */
  raw: unknown
  /** Display string for UI */
  display: string
  /** Serialized string for API */
  serialized: string
}

/**
 * A connector value for joining expressions
 */
export interface ConnectorValue {
  /** Connector type */
  key: 'AND' | 'OR'
  /** Display label */
  label: string
}

// =============================================================================
// Expression Types
// =============================================================================

/**
 * A complete filter condition (field + operator + value)
 */
export interface FilterCondition {
  /** The field being filtered */
  field: FieldValue
  /** The operator to apply */
  operator: OperatorValue
  /** The value to filter by */
  value: ConditionValue
}

/**
 * A filter expression with optional connector to next expression
 */
export interface FilterExpression {
  /** The condition for this expression */
  condition: FilterCondition
  /** Connector to the NEXT expression (undefined for last expression) */
  connector?: 'AND' | 'OR'
}

// =============================================================================
// Token Types
// =============================================================================

/**
 * Token types in the filter box
 */
export type TokenType = 'field' | 'operator' | 'value' | 'connector'

/**
 * Token data representing a single token in the filter box
 */
export interface TokenData {
  /** Unique identifier */
  id: string
  /** Token type */
  type: TokenType
  /** Token value (varies by type) */
  value: FieldValue | OperatorValue | ConditionValue | ConnectorValue
  /** Position in token sequence */
  position: number
  /** Which expression this belongs to (-1 for pending tokens) */
  expressionIndex: number
  /** Whether this token is part of an incomplete expression being built */
  isPending?: boolean
}

// =============================================================================
// Autocomplete Types
// =============================================================================

/**
 * Types of autocomplete items
 */
export type AutocompleteItemType = 'field' | 'operator' | 'value' | 'connector' | 'custom'

/**
 * An item in the autocomplete dropdown
 */
export interface AutocompleteItem {
  /** Item type */
  type: AutocompleteItemType
  /** Unique key */
  key: string
  /** Display label */
  label: string
  /** Optional description */
  description?: string
  /** Optional icon */
  icon?: ReactNode
  /** Whether this item is disabled */
  disabled?: boolean
  /** Optional group for grouped display */
  group?: string
  /** Custom metadata */
  metadata?: unknown
}

// =============================================================================
// Validation Types
// =============================================================================

/**
 * Validation error types
 */
export type ValidationErrorType = 'field' | 'operator' | 'value' | 'expression' | 'schema'

/**
 * A validation error
 */
export interface ValidationError {
  /** Error type */
  type: ValidationErrorType
  /** Error message */
  message: string
  /** Expression index (if applicable) */
  expressionIndex?: number
  /** Field key (if applicable) */
  field?: string
}

/**
 * A validation warning
 */
export interface ValidationWarning {
  /** Warning message */
  message: string
  /** Expression index (if applicable) */
  expressionIndex?: number
  /** Field key (if applicable) */
  field?: string
}

/**
 * Validation result
 */
export interface ValidationResult {
  /** Whether validation passed */
  valid: boolean
  /** Validation errors */
  errors?: ValidationError[]
  /** Validation warnings */
  warnings?: ValidationWarning[]
}
