/**
 * Serialization utilities for filter expressions
 */

import type { FilterExpression, FilterSchema, ConditionValue, FieldValue, OperatorValue } from '@/types'

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
 * Options for serialization
 */
export interface SerializeOptions {
  /** Use custom field serializers if available */
  useFieldSerializers?: boolean
  /** Use schema-level serializer if available */
  useSchemaSerializer?: boolean
}

/**
 * Options for deserialization
 */
export interface DeserializeOptions {
  /** Use custom field deserializers if available */
  useFieldDeserializers?: boolean
  /** Use schema-level deserializer if available */
  useSchemaDeserializer?: boolean
}

/**
 * Serialize filter expressions to a simple JSON format
 * Supports custom field-level serializers
 */
export function serialize(
  expressions: FilterExpression[],
  schema?: FilterSchema,
  options: SerializeOptions = {}
): SerializedExpression[] {
  const { useFieldSerializers = true, useSchemaSerializer = true } = options

  // Check for schema-level serializer
  if (useSchemaSerializer && schema?.serialize) {
    const result = schema.serialize(expressions)
    // If schema serializer returns SerializedExpression[], use it directly
    if (Array.isArray(result)) {
      return result as SerializedExpression[]
    }
    // Otherwise, fall back to default serialization
  }

  return expressions.map((expr) => {
    let serializedValue: unknown = expr.condition.value.serialized

    // Apply field-level serializer if available
    if (useFieldSerializers && schema) {
      const fieldConfig = schema.fields.find((f) => f.key === expr.condition.field.key)
      if (fieldConfig?.serialize) {
        serializedValue = fieldConfig.serialize(expr.condition.value)
      }
    }

    const result: SerializedExpression = {
      field: expr.condition.field.key,
      operator: expr.condition.operator.key,
      value: serializedValue,
    }
    if (expr.connector) {
      result.connector = expr.connector
    }
    return result
  })
}

/**
 * Deserialize from simple JSON format back to filter expressions
 * Supports custom field-level deserializers
 */
export function deserialize(
  serialized: SerializedExpression[],
  schema: FilterSchema,
  options: DeserializeOptions = {}
): FilterExpression[] {
  const { useFieldDeserializers = true, useSchemaDeserializer = true } = options

  // Check for schema-level deserializer
  if (useSchemaDeserializer && schema.deserialize) {
    return schema.deserialize(serialized)
  }

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

    // Apply field-level deserializer if available
    let value: ConditionValue
    if (useFieldDeserializers && fieldConfig.deserialize) {
      value = fieldConfig.deserialize(item.value)
    } else {
      const valueStr = String(item.value)
      value = {
        raw: item.value,
        display: valueStr,
        serialized: valueStr,
      }
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
        value,
      },
    }

    if (item.connector) {
      expression.connector = item.connector
    }

    return expression
  })
}

/**
 * Options for customizing display string generation
 */
export interface DisplayFormatOptions {
  /** Custom field label formatter */
  formatField?: (field: FieldValue) => string
  /** Custom operator label formatter */
  formatOperator?: (operator: OperatorValue) => string
  /** Custom value formatter */
  formatValue?: (value: ConditionValue, field: FieldValue, operator: OperatorValue) => string
  /** Custom connector formatter */
  formatConnector?: (connector: 'AND' | 'OR') => string
  /** Custom full expression formatter (overrides individual formatters) */
  formatExpression?: (expression: FilterExpression, index: number) => string
}

/**
 * Generate a human-readable display string from expressions
 */
export function toDisplayString(
  expressions: FilterExpression[],
  options: DisplayFormatOptions = {}
): string {
  if (expressions.length === 0) return ''

  const {
    formatField = (f) => f.label,
    formatOperator = (o) => o.label,
    formatValue = (v) => v.display,
    formatConnector = (c) => c,
    formatExpression,
  } = options

  return expressions
    .map((expr, index) => {
      // Use custom expression formatter if provided
      if (formatExpression) {
        const formatted = formatExpression(expr, index)
        if (expr.connector && index < expressions.length - 1) {
          return `${formatted} ${formatConnector(expr.connector)}`
        }
        return formatted
      }

      // Otherwise use individual formatters
      const field = formatField(expr.condition.field)
      const operator = formatOperator(expr.condition.operator)
      const value = formatValue(
        expr.condition.value,
        expr.condition.field,
        expr.condition.operator
      )

      let part = `${field} ${operator} ${value}`

      if (expr.connector && index < expressions.length - 1) {
        part += ` ${formatConnector(expr.connector)}`
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
