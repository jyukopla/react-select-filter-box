/**
 * Schema Builder Utilities
 *
 * Provides a fluent API for building filter schemas.
 */

import type { FilterSchema, FieldConfig, OperatorConfig, FieldType, Autocompleter } from '@/types'
import { getDefaultOperators } from '@/types'

/**
 * Field builder for fluent API
 */
export class FieldBuilder {
  private config: Partial<FieldConfig> = {}
  private schemaBuilder: SchemaBuilder

  constructor(schemaBuilder: SchemaBuilder, key: string, label: string) {
    this.schemaBuilder = schemaBuilder
    this.config.key = key
    this.config.label = label
    this.config.operators = []
  }

  /**
   * Set the field type (determines default operators)
   */
  type(type: FieldType): this {
    this.config.type = type
    // Apply default operators if none specified
    if (this.config.operators?.length === 0) {
      this.config.operators = getDefaultOperators(type)
    }
    return this
  }

  /**
   * Set the field description
   */
  description(description: string): this {
    this.config.description = description
    return this
  }

  /**
   * Set the field group for autocomplete display
   */
  group(group: string): this {
    this.config.group = group
    return this
  }

  /**
   * Set custom operators (replaces default operators)
   */
  operators(operators: OperatorConfig[] | string[]): this {
    if (typeof operators[0] === 'string') {
      // Filter default operators by key
      const type = this.config.type ?? 'string'
      const defaults = getDefaultOperators(type)
      this.config.operators = defaults.filter((op) => (operators as string[]).includes(op.key))
    } else {
      this.config.operators = operators as OperatorConfig[]
    }
    return this
  }

  /**
   * Add an operator to the field
   */
  addOperator(operator: OperatorConfig): this {
    this.config.operators = [...(this.config.operators ?? []), operator]
    return this
  }

  /**
   * Set whether this field can appear multiple times
   */
  allowMultiple(allow: boolean): this {
    this.config.allowMultiple = allow
    return this
  }

  /**
   * Set a custom value autocompleter
   */
  valueAutocompleter(autocompleter: Autocompleter): this {
    this.config.valueAutocompleter = autocompleter
    return this
  }

  /**
   * Set a custom color for the field
   */
  color(color: string): this {
    this.config.color = color
    return this
  }

  /**
   * Complete the field definition and return to schema builder
   */
  done(): SchemaBuilder {
    // Ensure type is set
    if (!this.config.type) {
      this.config.type = 'string'
    }
    // Ensure operators are set
    if (!this.config.operators || this.config.operators.length === 0) {
      this.config.operators = getDefaultOperators(this.config.type)
    }
    this.schemaBuilder.addFieldConfig(this.config as FieldConfig)
    return this.schemaBuilder
  }
}

/**
 * Schema builder for fluent API
 */
export class SchemaBuilder {
  private fields: FieldConfig[] = []
  private maxExpressions?: number
  private connectors?: { key: 'AND' | 'OR'; label: string; color?: string }[]

  /**
   * Start defining a new field
   */
  field(key: string, label: string): FieldBuilder {
    return new FieldBuilder(this, key, label)
  }

  /**
   * Add a pre-configured field
   */
  addField(config: FieldConfig): this {
    this.fields.push(config)
    return this
  }

  /**
   * Internal: Add a field from FieldBuilder
   */
  addFieldConfig(config: FieldConfig): void {
    this.fields.push(config)
  }

  /**
   * Set maximum number of expressions
   */
  max(count: number): this {
    this.maxExpressions = count
    return this
  }

  /**
   * Set custom connectors
   */
  withConnectors(connectors: { key: 'AND' | 'OR'; label: string; color?: string }[]): this {
    this.connectors = connectors
    return this
  }

  /**
   * Build the final schema
   */
  build(): FilterSchema {
    return {
      fields: this.fields,
      maxExpressions: this.maxExpressions,
      connectors: this.connectors,
    }
  }
}

/**
 * Create a new schema builder
 */
export function createSchema(): SchemaBuilder {
  return new SchemaBuilder()
}

/**
 * Define a schema directly (type-safe helper)
 */
export function defineSchema<T extends FilterSchema>(schema: T): T {
  return schema
}

/**
 * Merge multiple schemas together
 */
export function mergeSchemas(...schemas: FilterSchema[]): FilterSchema {
  const mergedFields: FieldConfig[] = []
  const seenKeys = new Set<string>()

  for (const schema of schemas) {
    for (const field of schema.fields) {
      if (!seenKeys.has(field.key)) {
        mergedFields.push(field)
        seenKeys.add(field.key)
      }
    }
  }

  return {
    fields: mergedFields,
    // Use the last schema's settings for other properties
    maxExpressions: schemas[schemas.length - 1]?.maxExpressions,
    connectors: schemas[schemas.length - 1]?.connectors,
  }
}

/**
 * Pick specific fields from a schema
 */
export function pickFields(schema: FilterSchema, fieldKeys: string[]): FilterSchema {
  return {
    ...schema,
    fields: schema.fields.filter((f) => fieldKeys.includes(f.key)),
  }
}

/**
 * Omit specific fields from a schema
 */
export function omitFields(schema: FilterSchema, fieldKeys: string[]): FilterSchema {
  return {
    ...schema,
    fields: schema.fields.filter((f) => !fieldKeys.includes(f.key)),
  }
}

/**
 * Extend a schema with additional fields or options
 */
export function extendSchema(
  baseSchema: FilterSchema,
  extension: Partial<FilterSchema>
): FilterSchema {
  return {
    ...baseSchema,
    ...extension,
    fields: [...baseSchema.fields, ...(extension.fields ?? [])],
  }
}
