/**
 * Validation Utilities
 *
 * Provides validation functions for filter expressions and schemas.
 */

import type { FilterSchema, FilterExpression } from '@/types'

/**
 * Validation error types
 */
export type ValidationErrorType = 'field' | 'operator' | 'value' | 'expression' | 'schema'

/**
 * Validation error
 */
export interface ValidationError {
  type: ValidationErrorType
  message: string
  expressionIndex?: number
  field?: string
}

/**
 * Validation result
 */
export interface ValidationResult {
  valid: boolean
  errors: ValidationError[]
}

/**
 * Validate a single expression against a schema
 */
export function validateExpression(
  expression: FilterExpression,
  schema: FilterSchema,
  expressionIndex?: number
): ValidationResult {
  const errors: ValidationError[] = []

  const { condition } = expression
  const { field, operator, value } = condition

  // Validate field exists in schema
  const fieldConfig = schema.fields.find((f) => f.key === field.key)
  if (!fieldConfig) {
    errors.push({
      type: 'field',
      message: `Field "${field.key}" not found in schema`,
      expressionIndex,
      field: field.key,
    })
    // Can't validate further without field config
    return { valid: false, errors }
  }

  // Validate operator is valid for field
  const operatorConfig = fieldConfig.operators.find((op) => op.key === operator.key)
  if (!operatorConfig) {
    errors.push({
      type: 'operator',
      message: `Operator "${operator.key}" is not valid for field "${field.key}"`,
      expressionIndex,
      field: field.key,
    })
  }

  // Validate value is not empty (unless valueRequired is false)
  const valueRequired = fieldConfig.valueRequired !== false
  if (valueRequired && isEmpty(value.raw)) {
    errors.push({
      type: 'value',
      message: `Value is required for field "${field.key}"`,
      expressionIndex,
      field: field.key,
    })
  }

  return {
    valid: errors.length === 0,
    errors,
  }
}

/**
 * Validate multiple expressions against a schema
 */
export function validateExpressions(
  expressions: FilterExpression[],
  schema: FilterSchema
): ValidationResult {
  const errors: ValidationError[] = []

  for (let i = 0; i < expressions.length; i++) {
    const result = validateExpression(expressions[i], schema, i)
    errors.push(...result.errors)
  }

  return {
    valid: errors.length === 0,
    errors,
  }
}

/**
 * Validate a schema configuration
 */
export function validateSchema(schema: FilterSchema): ValidationResult {
  const errors: ValidationError[] = []

  // Check for empty fields
  if (schema.fields.length === 0) {
    errors.push({
      type: 'schema',
      message: 'Schema must have at least one field',
    })
    return { valid: false, errors }
  }

  // Check for duplicate field keys
  const fieldKeys = new Set<string>()
  for (const field of schema.fields) {
    if (fieldKeys.has(field.key)) {
      errors.push({
        type: 'schema',
        message: `Duplicate field key: "${field.key}"`,
        field: field.key,
      })
    }
    fieldKeys.add(field.key)

    // Check for empty operators
    if (field.operators.length === 0) {
      errors.push({
        type: 'schema',
        message: `Field "${field.key}" must have at least one operator`,
        field: field.key,
      })
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  }
}

/**
 * Check if a value is empty
 */
function isEmpty(value: unknown): boolean {
  if (value === null || value === undefined) return true
  if (typeof value === 'string') return value.trim() === ''
  if (Array.isArray(value)) return value.length === 0
  return false
}
