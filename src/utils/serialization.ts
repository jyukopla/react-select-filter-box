/**
 * Serialization utilities for filter expressions
 */

import type { FilterExpression, FilterSchema, FieldConfig, FieldType } from '@/types'

/**
 * Serialized expression format (for JSON/API)
 */
export interface SerializedExpression {
  field: string
  operator: string
  value: unknown
  connector?: 'AND' | 'OR'
}

/**
 * Serialize filter expressions to a simple JSON format
 */
export function serialize(expressions: FilterExpression[]): SerializedExpression[] {
  return expressions.map((expr) => {
    const result: SerializedExpression = {
      field: expr.condition.field.key,
      operator: expr.condition.operator.key,
      value: expr.condition.value.serialized,
    }
    if (expr.connector) {
      result.connector = expr.connector
    }
    return result
  })
}

/**
 * Deserialize from simple JSON format back to filter expressions
 */
export function deserialize(
  serialized: SerializedExpression[],
  schema: FilterSchema
): FilterExpression[] {
  return serialized.map((item) => {
    // Find field config
    const fieldConfig = schema.fields.find((f) => f.key === item.field)
    if (!fieldConfig) {
      throw new Error(`Unknown field: ${item.field}`)
    }

    // Find operator config
    const operatorConfig = fieldConfig.operators.find((op) => op.key === item.operator)
    if (!operatorConfig) {
      throw new Error(`Unknown operator: ${item.operator} for field ${item.field}`)
    }

    const valueStr = String(item.value)

    const expression: FilterExpression = {
      condition: {
        field: {
          key: fieldConfig.key,
          label: fieldConfig.label,
          type: fieldConfig.type,
        },
        operator: {
          key: operatorConfig.key,
          label: operatorConfig.label,
          symbol: operatorConfig.symbol,
        },
        value: {
          raw: item.value,
          display: valueStr,
          serialized: valueStr,
        },
      },
    }

    if (item.connector) {
      expression.connector = item.connector
    }

    return expression
  })
}

/**
 * Generate a human-readable display string from expressions
 */
export function toDisplayString(expressions: FilterExpression[]): string {
  if (expressions.length === 0) return ''

  return expressions
    .map((expr, index) => {
      const field = expr.condition.field.label
      const operator = expr.condition.operator.label
      const value = expr.condition.value.display

      let part = `${field} ${operator} ${value}`

      if (expr.connector && index < expressions.length - 1) {
        part += ` ${expr.connector}`
      }

      return part
    })
    .join(' ')
}

/**
 * Generate URL query string from expressions
 * Simple format: field=value&field2=value2
 */
export function toQueryString(expressions: FilterExpression[]): string {
  const params = new URLSearchParams()

  for (const expr of expressions) {
    const key = expr.condition.field.key
    const value = String(expr.condition.value.serialized)
    params.set(key, value)
  }

  return params.toString()
}

/**
 * Parse URL query string to filter expressions
 * Uses the first valid operator for each field
 */
export function fromQueryString(
  queryString: string,
  schema: FilterSchema
): FilterExpression[] {
  const params = new URLSearchParams(queryString)
  const expressions: FilterExpression[] = []
  const entries = Array.from(params.entries())

  entries.forEach(([key, value], index) => {
    const fieldConfig = schema.fields.find((f) => f.key === key)
    if (!fieldConfig) {
      // Skip unknown fields
      return
    }

    // Use first operator as default
    const operatorConfig = fieldConfig.operators[0]
    if (!operatorConfig) {
      return
    }

    const expression: FilterExpression = {
      condition: {
        field: {
          key: fieldConfig.key,
          label: fieldConfig.label,
          type: fieldConfig.type,
        },
        operator: {
          key: operatorConfig.key,
          label: operatorConfig.label,
          symbol: operatorConfig.symbol,
        },
        value: {
          raw: value,
          display: value,
          serialized: value,
        },
      },
    }

    // Add connector if not last item
    if (index < entries.length - 1) {
      expression.connector = 'AND'
    }

    expressions.push(expression)
  })

  return expressions
}
