/**
 * Code Splitting Utilities Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  createLazyAutocompleter,
  preloadAutocompleter,
  createDynamicAutocompleter,
} from './codeSplitting'
import type { Autocompleter, AutocompleteContext, AutocompleteItem } from '@/types'

const createMockContext = (inputValue = ''): AutocompleteContext => ({
  inputValue,
  field: {
    key: 'test',
    label: 'Test',
    type: 'string',
    operators: [],
  },
  operator: {
    key: 'eq',
    label: 'equals',
  },
  existingExpressions: [],
  schema: { fields: [] },
})

const createMockAutocompleter = (items: AutocompleteItem[]): Autocompleter => ({
  getSuggestions: () => items,
  validate: (value) => typeof value === 'string',
  format: (value) => String(value),
  parse: (display) => display,
})

describe('createLazyAutocompleter', () => {
  it('should load autocompleter on first use', async () => {
    const mockItems = [{ key: 'a', label: 'A' }]
    const loader = vi.fn().mockResolvedValue(createMockAutocompleter(mockItems))

    const lazyAutocompleter = createLazyAutocompleter(loader)

    expect(loader).not.toHaveBeenCalled()

    const result = await lazyAutocompleter.getSuggestions(createMockContext())

    expect(loader).toHaveBeenCalledTimes(1)
    expect(result).toEqual(mockItems)
  })

  it('should cache loaded autocompleter', async () => {
    const mockItems = [{ key: 'a', label: 'A' }]
    const loader = vi.fn().mockResolvedValue(createMockAutocompleter(mockItems))

    const lazyAutocompleter = createLazyAutocompleter(loader)

    await lazyAutocompleter.getSuggestions(createMockContext())
    await lazyAutocompleter.getSuggestions(createMockContext())
    await lazyAutocompleter.getSuggestions(createMockContext())

    expect(loader).toHaveBeenCalledTimes(1)
  })

  it('should return fallback items on error', async () => {
    const fallbackItems = [{ key: 'fallback', label: 'Fallback' }]
    const loader = vi.fn().mockRejectedValue(new Error('Load failed'))
    const onError = vi.fn()

    const lazyAutocompleter = createLazyAutocompleter(loader, {
      fallbackItems,
      onError,
    })

    const result = await lazyAutocompleter.getSuggestions(createMockContext())

    expect(result).toEqual(fallbackItems)
    expect(onError).toHaveBeenCalled()
  })

  it('should handle async getSuggestions from loaded autocompleter', async () => {
    const mockItems = [{ key: 'async', label: 'Async' }]
    const asyncAutocompleter: Autocompleter = {
      getSuggestions: async () => mockItems,
    }
    const loader = vi.fn().mockResolvedValue(asyncAutocompleter)

    const lazyAutocompleter = createLazyAutocompleter(loader)
    const result = await lazyAutocompleter.getSuggestions(createMockContext())

    expect(result).toEqual(mockItems)
  })

  it('should delegate validate to loaded autocompleter', async () => {
    const mockAutocompleter = createMockAutocompleter([])
    const loader = vi.fn().mockResolvedValue(mockAutocompleter)

    const lazyAutocompleter = createLazyAutocompleter(loader)

    // Before loading - should return true
    expect(lazyAutocompleter.validate?.('test')).toBe(true)

    // Load the autocompleter
    await lazyAutocompleter.getSuggestions(createMockContext())

    // After loading - should delegate
    expect(lazyAutocompleter.validate?.('test')).toBe(true)
    expect(lazyAutocompleter.validate?.(123)).toBe(false)
  })

  it('should delegate format to loaded autocompleter', async () => {
    const mockAutocompleter = createMockAutocompleter([])
    mockAutocompleter.format = (value) => `formatted: ${value}`
    const loader = vi.fn().mockResolvedValue(mockAutocompleter)

    const lazyAutocompleter = createLazyAutocompleter(loader)
    await lazyAutocompleter.getSuggestions(createMockContext())

    const result = lazyAutocompleter.format?.('test', createMockContext())
    expect(result).toBe('formatted: test')
  })

  it('should delegate parse to loaded autocompleter', async () => {
    const mockAutocompleter = createMockAutocompleter([])
    mockAutocompleter.parse = (display) => `parsed: ${display}`
    const loader = vi.fn().mockResolvedValue(mockAutocompleter)

    const lazyAutocompleter = createLazyAutocompleter(loader)
    await lazyAutocompleter.getSuggestions(createMockContext())

    const result = lazyAutocompleter.parse?.('test', createMockContext())
    expect(result).toBe('parsed: test')
  })

  it('should not retry after error', async () => {
    const loader = vi.fn().mockRejectedValue(new Error('Load failed'))

    const lazyAutocompleter = createLazyAutocompleter(loader)

    await lazyAutocompleter.getSuggestions(createMockContext())
    await lazyAutocompleter.getSuggestions(createMockContext())

    expect(loader).toHaveBeenCalledTimes(1)
  })
})

describe('preloadAutocompleter', () => {
  it('should call loader without waiting', () => {
    const loader = vi.fn().mockResolvedValue(createMockAutocompleter([]))

    preloadAutocompleter(loader)

    expect(loader).toHaveBeenCalledTimes(1)
  })

  it('should silently handle errors', async () => {
    const loader = vi.fn().mockRejectedValue(new Error('Preload failed'))

    // Should not throw
    expect(() => preloadAutocompleter(loader)).not.toThrow()

    // Wait for the promise to settle
    await new Promise((resolve) => setTimeout(resolve, 0))
  })

  it('should handle module with default export', () => {
    const mockAutocompleter = createMockAutocompleter([])
    const loader = vi.fn().mockResolvedValue({ default: mockAutocompleter })

    preloadAutocompleter(loader)

    expect(loader).toHaveBeenCalledTimes(1)
  })
})

describe('createDynamicAutocompleter', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should load autocompleter based on field key', async () => {
    const countryItems = [{ key: 'us', label: 'United States' }]
    const cityItems = [{ key: 'nyc', label: 'New York' }]

    const dynamicAutocompleter = createDynamicAutocompleter({
      country: () => Promise.resolve(createMockAutocompleter(countryItems)),
      city: () => Promise.resolve(createMockAutocompleter(cityItems)),
    })

    const countryContext: AutocompleteContext = {
      ...createMockContext(),
      field: { key: 'country', label: 'Country', type: 'string', operators: [] },
    }

    const cityContext: AutocompleteContext = {
      ...createMockContext(),
      field: { key: 'city', label: 'City', type: 'string', operators: [] },
    }

    const countryResult = await dynamicAutocompleter.getSuggestions(countryContext)
    expect(countryResult).toEqual(countryItems)

    const cityResult = await dynamicAutocompleter.getSuggestions(cityContext)
    expect(cityResult).toEqual(cityItems)
  })

  it('should use default loader for unknown keys', async () => {
    const defaultItems = [{ key: 'default', label: 'Default' }]

    const dynamicAutocompleter = createDynamicAutocompleter({
      known: () => Promise.resolve(createMockAutocompleter([{ key: 'known', label: 'Known' }])),
      default: () => Promise.resolve(createMockAutocompleter(defaultItems)),
    })

    const unknownContext: AutocompleteContext = {
      ...createMockContext(),
      field: { key: 'unknown', label: 'Unknown', type: 'string', operators: [] },
    }

    const result = await dynamicAutocompleter.getSuggestions(unknownContext)
    expect(result).toEqual(defaultItems)
  })

  it('should cache loaded autocompleters', async () => {
    const loader = vi.fn().mockResolvedValue(createMockAutocompleter([]))

    const dynamicAutocompleter = createDynamicAutocompleter({
      test: loader,
    })

    const context: AutocompleteContext = {
      ...createMockContext(),
      field: { key: 'test', label: 'Test', type: 'string', operators: [] },
    }

    await dynamicAutocompleter.getSuggestions(context)
    await dynamicAutocompleter.getSuggestions(context)
    await dynamicAutocompleter.getSuggestions(context)

    expect(loader).toHaveBeenCalledTimes(1)
  })

  it('should return empty array if no loader found', async () => {
    const dynamicAutocompleter = createDynamicAutocompleter({})

    const result = await dynamicAutocompleter.getSuggestions(createMockContext())
    expect(result).toEqual([])
  })

  it('should handle module with default export', async () => {
    const items = [{ key: 'a', label: 'A' }]
    const dynamicAutocompleter = createDynamicAutocompleter({
      test: () => Promise.resolve({ default: createMockAutocompleter(items) }),
    })

    const context: AutocompleteContext = {
      ...createMockContext(),
      field: { key: 'test', label: 'Test', type: 'string', operators: [] },
    }

    const result = await dynamicAutocompleter.getSuggestions(context)
    expect(result).toEqual(items)
  })

  it('should delegate validate to cached autocompleter', async () => {
    const mockAutocompleter = createMockAutocompleter([])
    mockAutocompleter.validate = (value) => value === 'valid'

    const dynamicAutocompleter = createDynamicAutocompleter({
      test: () => Promise.resolve(mockAutocompleter),
    })

    const context: AutocompleteContext = {
      ...createMockContext(),
      field: { key: 'test', label: 'Test', type: 'string', operators: [] },
    }

    // Load the autocompleter
    await dynamicAutocompleter.getSuggestions(context)

    // Validate should delegate
    expect(dynamicAutocompleter.validate?.('valid', context)).toBe(true)
    expect(dynamicAutocompleter.validate?.('invalid', context)).toBe(false)
  })

  it('should delegate format to cached autocompleter', async () => {
    const mockAutocompleter = createMockAutocompleter([])
    mockAutocompleter.format = (value) => `FORMATTED: ${value}`

    const dynamicAutocompleter = createDynamicAutocompleter({
      test: () => Promise.resolve(mockAutocompleter),
    })

    const context: AutocompleteContext = {
      ...createMockContext(),
      field: { key: 'test', label: 'Test', type: 'string', operators: [] },
    }

    await dynamicAutocompleter.getSuggestions(context)

    expect(dynamicAutocompleter.format?.('test', context)).toBe('FORMATTED: test')
  })

  it('should delegate parse to cached autocompleter', async () => {
    const mockAutocompleter = createMockAutocompleter([])
    mockAutocompleter.parse = (display) => `PARSED: ${display}`

    const dynamicAutocompleter = createDynamicAutocompleter({
      test: () => Promise.resolve(mockAutocompleter),
    })

    const context: AutocompleteContext = {
      ...createMockContext(),
      field: { key: 'test', label: 'Test', type: 'string', operators: [] },
    }

    await dynamicAutocompleter.getSuggestions(context)

    expect(dynamicAutocompleter.parse?.('test', context)).toBe('PARSED: test')
  })

  it('should return empty on loader error', async () => {
    const dynamicAutocompleter = createDynamicAutocompleter({
      test: () => Promise.reject(new Error('Load failed')),
    })

    const context: AutocompleteContext = {
      ...createMockContext(),
      field: { key: 'test', label: 'Test', type: 'string', operators: [] },
    }

    const result = await dynamicAutocompleter.getSuggestions(context)
    expect(result).toEqual([])
  })

  it('should handle context without field', async () => {
    const defaultItems = [{ key: 'default', label: 'Default' }]

    const dynamicAutocompleter = createDynamicAutocompleter({
      default: () => Promise.resolve(createMockAutocompleter(defaultItems)),
    })

    const contextWithoutField: AutocompleteContext = {
      ...createMockContext(),
      field: undefined as unknown as AutocompleteContext['field'],
    }

    const result = await dynamicAutocompleter.getSuggestions(contextWithoutField)
    expect(result).toEqual(defaultItems)
  })
})
