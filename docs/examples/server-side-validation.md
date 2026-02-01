# Server-Side Validation Example

This example demonstrates how to implement server-side validation with the React Sequential Filter Box.

## Overview

Server-side validation allows you to:

- Validate filter expressions against business rules
- Check permissions for certain filter combinations
- Validate against current database state
- Provide detailed error messages from the server

## Basic Implementation

```tsx
import { useState, useCallback, useEffect } from 'react'
import {
  FilterBox,
  type FilterExpression,
  type ValidationError,
  serialize,
} from 'react-select-filter-box'

interface ServerValidationResult {
  valid: boolean
  errors: Array<{
    field?: string
    expressionIndex?: number
    message: string
    code: string
  }>
}

function FilterWithServerValidation({ schema }: { schema: FilterSchema }) {
  const [expressions, setExpressions] = useState<FilterExpression[]>([])
  const [serverErrors, setServerErrors] = useState<ValidationError[]>([])
  const [validating, setValidating] = useState(false)

  // Validate expressions on the server
  const validateOnServer = useCallback(async (exprs: FilterExpression[]) => {
    if (exprs.length === 0) {
      setServerErrors([])
      return
    }

    setValidating(true)

    try {
      const response = await fetch('/api/filters/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: serialize(exprs),
      })

      const result: ServerValidationResult = await response.json()

      if (!result.valid) {
        setServerErrors(
          result.errors.map((err) => ({
            field: err.field,
            expressionIndex: err.expressionIndex,
            message: err.message,
          }))
        )
      } else {
        setServerErrors([])
      }
    } catch (error) {
      console.error('Validation request failed:', error)
      setServerErrors([
        {
          message: 'Unable to validate filters. Please try again.',
        },
      ])
    } finally {
      setValidating(false)
    }
  }, [])

  // Debounced server validation
  useEffect(() => {
    const timer = setTimeout(() => {
      validateOnServer(expressions)
    }, 500)

    return () => clearTimeout(timer)
  }, [expressions, validateOnServer])

  // Handle expression changes
  const handleChange = (newExpressions: FilterExpression[]) => {
    setExpressions(newExpressions)
  }

  // Handle client-side validation errors
  const handleClientError = (errors: ValidationError[]) => {
    console.log('Client validation errors:', errors)
  }

  return (
    <div className="filter-with-validation">
      <FilterBox
        schema={schema}
        value={expressions}
        onChange={handleChange}
        onError={handleClientError}
      />

      {validating && <div className="validation-status">Validating...</div>}

      {serverErrors.length > 0 && (
        <div className="server-errors">
          <h4>Server Validation Errors:</h4>
          <ul>
            {serverErrors.map((error, index) => (
              <li key={index} className="server-error">
                {error.field && <strong>{error.field}: </strong>}
                {error.message}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
```

## Server-Side Validation Endpoint

```typescript
// Express.js example
import { Router } from 'express'

const router = Router()

interface FilterRequest {
  field: string
  operator: string
  value: unknown
  connector?: 'AND' | 'OR'
}

interface ValidationResult {
  valid: boolean
  errors: Array<{
    field?: string
    expressionIndex?: number
    message: string
    code: string
  }>
}

router.post('/api/filters/validate', async (req, res) => {
  const filters: FilterRequest[] = req.body
  const result: ValidationResult = { valid: true, errors: [] }

  for (let i = 0; i < filters.length; i++) {
    const filter = filters[i]
    const errors = await validateFilter(filter, i, filters, req.user)

    if (errors.length > 0) {
      result.valid = false
      result.errors.push(...errors)
    }
  }

  res.json(result)
})

async function validateFilter(
  filter: FilterRequest,
  index: number,
  allFilters: FilterRequest[],
  user: User
): Promise<ValidationResult['errors']> {
  const errors: ValidationResult['errors'] = []

  // Check field access permissions
  const hasAccess = await checkFieldAccess(filter.field, user)
  if (!hasAccess) {
    errors.push({
      field: filter.field,
      expressionIndex: index,
      message: `You don't have permission to filter by ${filter.field}`,
      code: 'PERMISSION_DENIED',
    })
    return errors
  }

  // Validate field-specific rules
  switch (filter.field) {
    case 'assignee':
      // Validate user exists
      const userExists = await checkUserExists(filter.value as string)
      if (!userExists) {
        errors.push({
          field: 'assignee',
          expressionIndex: index,
          message: 'The specified user does not exist',
          code: 'INVALID_USER',
        })
      }
      break

    case 'processDefinitionKey':
      // Validate process definition exists
      const processExists = await checkProcessExists(filter.value as string)
      if (!processExists) {
        errors.push({
          field: 'processDefinitionKey',
          expressionIndex: index,
          message: 'Process definition not found',
          code: 'PROCESS_NOT_FOUND',
        })
      }
      break

    case 'startDate':
      // Validate date is within allowed range
      const date = new Date(filter.value as string)
      const minDate = new Date('2020-01-01')
      if (date < minDate) {
        errors.push({
          field: 'startDate',
          expressionIndex: index,
          message: 'Start date cannot be before 2020',
          code: 'DATE_OUT_OF_RANGE',
        })
      }
      break
  }

  // Cross-field validation
  const conflictError = checkConflictingFilters(allFilters, index)
  if (conflictError) {
    errors.push(conflictError)
  }

  return errors
}

function checkConflictingFilters(
  filters: FilterRequest[],
  currentIndex: number
): ValidationResult['errors'][0] | null {
  const currentFilter = filters[currentIndex]

  // Example: Can't filter for both completed AND active state
  if (currentFilter.field === 'state') {
    const stateFilters = filters.filter((f, i) => f.field === 'state' && i !== currentIndex)

    for (const other of stateFilters) {
      if (
        (currentFilter.value === 'ACTIVE' && other.value === 'COMPLETED') ||
        (currentFilter.value === 'COMPLETED' && other.value === 'ACTIVE')
      ) {
        return {
          field: 'state',
          expressionIndex: currentIndex,
          message: 'Cannot filter for both active and completed states',
          code: 'CONFLICTING_FILTERS',
        }
      }
    }
  }

  return null
}
```

## Displaying Errors on Tokens

```tsx
import { FilterBox, type FilterExpression, type ValidationError } from 'react-select-filter-box'

function FilterWithTokenErrors({ schema }: { schema: FilterSchema }) {
  const [expressions, setExpressions] = useState<FilterExpression[]>([])
  const [serverErrors, setServerErrors] = useState<ValidationError[]>([])

  // Map errors to expressions for display
  const expressionsWithErrors = useMemo(() => {
    return expressions.map((expr, index) => {
      const error = serverErrors.find((e) => e.expressionIndex === index)
      if (error) {
        return {
          ...expr,
          error: error.message, // This will show error styling on the token
        }
      }
      return expr
    })
  }, [expressions, serverErrors])

  // ... validation logic from above

  return <FilterBox schema={schema} value={expressionsWithErrors} onChange={setExpressions} />
}
```

## Async Validation on Value Entry

```tsx
import { createAsyncAutocompleter } from 'react-select-filter-box'

// Autocompleter that validates values against the server
const validatingAutocompleter = createAsyncAutocompleter(
  async (query, context, signal) => {
    // Fetch suggestions
    const response = await fetch(`/api/validate-and-suggest/${context.field.key}?q=${query}`, {
      signal,
    })

    const result = await response.json()

    // Return suggestions with validation status
    return result.suggestions.map(
      (item: { value: string; label: string; valid: boolean; validationMessage?: string }) => ({
        type: 'value',
        key: item.value,
        label: item.label,
        description: item.valid ? undefined : item.validationMessage,
        disabled: !item.valid, // Disable invalid options
      })
    )
  },
  { debounceMs: 300 }
)
```

## Preventing Submission with Errors

```tsx
function FilterFormWithSubmit({ schema, onSubmit }) {
  const [expressions, setExpressions] = useState<FilterExpression[]>([])
  const [errors, setErrors] = useState<ValidationError[]>([])
  const [isValid, setIsValid] = useState(true)

  const handleChange = (newExpressions: FilterExpression[]) => {
    setExpressions(newExpressions)
    // Trigger validation
    validateAsync(newExpressions)
  }

  const handleError = (clientErrors: ValidationError[]) => {
    setErrors(clientErrors)
    setIsValid(clientErrors.length === 0)
  }

  const validateAsync = async (exprs: FilterExpression[]) => {
    // Server validation logic...
    const result = await fetch('/api/filters/validate', {
      method: 'POST',
      body: serialize(exprs),
    }).then((r) => r.json())

    setErrors(result.errors || [])
    setIsValid(result.valid)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!isValid) {
      return // Don't submit with errors
    }

    onSubmit(expressions)
  }

  return (
    <form onSubmit={handleSubmit}>
      <FilterBox
        schema={schema}
        value={expressions}
        onChange={handleChange}
        onError={handleError}
      />

      {errors.length > 0 && (
        <div className="form-errors">
          {errors.map((e, i) => (
            <p key={i} className="error">
              {e.message}
            </p>
          ))}
        </div>
      )}

      <button type="submit" disabled={!isValid || expressions.length === 0}>
        Apply Filters
      </button>
    </form>
  )
}
```

## Styling for Validation States

```css
/* Validation status indicator */
.validation-status {
  padding: 8px;
  font-size: 12px;
  color: #616161;
  display: flex;
  align-items: center;
  gap: 8px;
}

.validation-status::before {
  content: '';
  width: 12px;
  height: 12px;
  border: 2px solid #1976d2;
  border-radius: 50%;
  border-top-color: transparent;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* Server errors */
.server-errors {
  margin-top: 16px;
  padding: 12px;
  background: #ffebee;
  border-left: 4px solid #f44336;
  border-radius: 4px;
}

.server-errors h4 {
  margin: 0 0 8px 0;
  color: #c62828;
}

.server-errors ul {
  margin: 0;
  padding-left: 20px;
}

.server-error {
  color: #c62828;
  margin-bottom: 4px;
}

/* Form submit button */
button[type='submit']:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
```

## Best Practices

1. **Debounce validation requests** - Don't call the server on every keystroke
2. **Show clear error messages** - Include field names and actionable suggestions
3. **Validate both client and server** - Client for UX, server for security
4. **Handle network errors gracefully** - Don't block usage on network failure
5. **Cache validation results** - Avoid repeated calls for same values
6. **Use error codes** - For programmatic handling and i18n

## Next Steps

- [Schema Definition Guide](../guides/schema-definition.md)
- [Testing Guide](../guides/testing.md)
- [Custom Autocompleters Guide](../guides/custom-autocompleters.md)
