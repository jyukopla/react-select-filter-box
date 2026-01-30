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

  // Validate multi-value if operator has multiValue config
  if (operatorConfig?.multiValue) {
    const multiValueResult = validateMultiValue(
      value.raw,
      operatorConfig.multiValue.count,
      field.key,
      operator.key,
      expressionIndex
    )
    errors.push(...multiValueResult.errors)
  }

  // Validate value is not empty (unless valueRequired is false)
  // Note: multi-value validation handles empty arrays separately
  const valueRequired = fieldConfig.valueRequired !== false
  if (valueRequired && isEmpty(value.raw) && !operatorConfig?.multiValue) {
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

  // Validate max expressions limit
  if (schema.maxExpressions !== undefined && expressions.length > schema.maxExpressions) {
    errors.push({
      type: 'schema',
      message: `Maximum of ${schema.maxExpressions} expressions allowed, but ${expressions.length} provided`,
    })
  }

  // Track field usage for uniqueness validation
  const fieldUsage = new Map<string, number[]>()

  for (let i = 0; i < expressions.length; i++) {
    const expr = expressions[i]
    const result = validateExpression(expr, schema, i)
    errors.push(...result.errors)

    // Track which expressions use each field
    const fieldKey = expr.condition.field.key
    if (!fieldUsage.has(fieldKey)) {
      fieldUsage.set(fieldKey, [])
    }
    fieldUsage.get(fieldKey)!.push(i)
  }

  // Validate field uniqueness (if allowMultiple is false)
  for (const field of schema.fields) {
    if (field.allowMultiple === false) {
      const usage = fieldUsage.get(field.key)
      if (usage && usage.length > 1) {
        errors.push({
          type: 'field',
          message: `Field "${field.label}" can only be used once, but appears ${usage.length} times`,
          field: field.key,
          expressionIndex: usage[1], // Mark the second occurrence
        })
      }
    }
  }

  // Apply schema-level validation if provided
  if (schema.validate) {
    const schemaResult = schema.validate(expressions)
    if (!schemaResult.valid) {
      errors.push(...schemaResult.errors)
    }
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

/**
 * Validate multi-value for operators like 'between' or 'in'
 * @param value - The raw value (should be an array for multi-value operators)
 * @param expectedCount - Expected number of values (-1 for unlimited)
 * @param fieldKey - Field key for error messages
 * @param operatorKey - Operator key for error messages
 * @param expressionIndex - Expression index for error context
 */
function validateMultiValue(
  value: unknown,
  expectedCount: number,
  fieldKey: string,
  operatorKey: string,
  expressionIndex?: number
): ValidationResult {
  const errors: ValidationError[] = []

  // Multi-value must be an array
  if (!Array.isArray(value)) {
    errors.push({
      type: 'value',
      message: `Value for "${operatorKey}" operator on field "${fieldKey}" must be an array`,
      expressionIndex,
      field: fieldKey,
    })
    return { valid: false, errors }
  }

  // Check count constraints
  if (expectedCount === -1) {
    // Unlimited, but must have at least one value
    if (value.length === 0) {
      errors.push({
        type: 'value',
        message: `Operator "${operatorKey}" on field "${fieldKey}" requires at least one value`,
        expressionIndex,
        field: fieldKey,
      })
    }
  } else {
    // Fixed count
    if (value.length !== expectedCount) {
      errors.push({
        type: 'value',
        message: `Operator "${operatorKey}" on field "${fieldKey}" requires exactly ${expectedCount} values, but got ${value.length}`,
        expressionIndex,
        field: fieldKey,
      })
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  }
}
