/**
 * Autocompleter Tests
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  createStaticAutocompleter,
  createEnumAutocompleter,
  createAsyncAutocompleter,
  createNumberAutocompleter,
  createDateAutocompleter,
  combineAutocompleters,
  mapAutocompleter,
  withCache,
  withDebounce,
  withStaleWhileRevalidate,
} from './index'
import type { AutocompleteContext, AutocompleteItem } from '@/types'

// Mock context
const createMockContext = (inputValue: string = ''): AutocompleteContext => ({
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

describe('createStaticAutocompleter', () => {
  it('should return all items when input is empty', () => {
    const autocompleter = createStaticAutocompleter(['Apple', 'Banana', 'Cherry'])
    const context = createMockContext('')

    const result = autocompleter.getSuggestions(context)

    expect(result).toHaveLength(3)
    expect(result.map((r) => r.label)).toEqual(['Apple', 'Banana', 'Cherry'])
  })

  it('should filter by substring match by default', () => {
    const autocompleter = createStaticAutocompleter(['Apple', 'Banana', 'Cherry'])
    const context = createMockContext('an')

    const result = autocompleter.getSuggestions(context)

    expect(result).toHaveLength(1)
    expect(result[0].label).toBe('Banana')
  })

  it('should filter by prefix match when configured', () => {
    const autocompleter = createStaticAutocompleter(['Apple', 'Apricot', 'Banana'], {
      matchMode: 'prefix',
    })
    const context = createMockContext('Ap')

    const result = autocompleter.getSuggestions(context)

    expect(result).toHaveLength(2)
    expect(result.map((r) => r.label)).toEqual(['Apple', 'Apricot'])
  })

  it('should support fuzzy matching', () => {
    const autocompleter = createStaticAutocompleter(['Apple', 'Apricot', 'Banana'], {
      matchMode: 'fuzzy',
    })
    const context = createMockContext('ae')

    const result = autocompleter.getSuggestions(context)

    // "ae" matches "Apple" (a...e)
    expect(result.some((r) => r.label === 'Apple')).toBe(true)
  })

  it('should respect case sensitivity', () => {
    const autocompleter = createStaticAutocompleter(['Apple', 'apple'], {
      caseSensitive: true,
    })
    const context = createMockContext('Apple')

    const result = autocompleter.getSuggestions(context)

    expect(result).toHaveLength(1)
    expect(result[0].label).toBe('Apple')
  })

  it('should limit results when maxResults is set', () => {
    const autocompleter = createStaticAutocompleter(
      ['A', 'B', 'C', 'D', 'E'],
      { maxResults: 3 }
    )
    const context = createMockContext('')

    const result = autocompleter.getSuggestions(context)

    expect(result).toHaveLength(3)
  })

  it('should accept AutocompleteItem array', () => {
    const items: AutocompleteItem[] = [
      { type: 'value', key: 'active', label: 'Active', description: 'Active status' },
      { type: 'value', key: 'inactive', label: 'Inactive' },
    ]
    const autocompleter = createStaticAutocompleter(items)
    const context = createMockContext('')

    const result = autocompleter.getSuggestions(context)

    expect(result).toHaveLength(2)
    expect(result[0].description).toBe('Active status')
  })
})

describe('createEnumAutocompleter', () => {
  const enumValues = [
    { key: 'ACTIVE', label: 'Active', description: 'Currently active' },
    { key: 'INACTIVE', label: 'Inactive', description: 'Not active' },
    { key: 'PENDING', label: 'Pending' },
  ]

  it('should return all values when input is empty', () => {
    const autocompleter = createEnumAutocompleter(enumValues)
    const context = createMockContext('')

    const result = autocompleter.getSuggestions(context)

    expect(result).toHaveLength(3)
  })

  it('should filter by label', () => {
    const autocompleter = createEnumAutocompleter(enumValues)
    const context = createMockContext('act')

    const result = autocompleter.getSuggestions(context)

    expect(result).toHaveLength(2) // Active and Inactive
  })

  it('should filter by description', () => {
    const autocompleter = createEnumAutocompleter(enumValues)
    const context = createMockContext('currently')

    const result = autocompleter.getSuggestions(context)

    expect(result).toHaveLength(1)
    expect(result[0].key).toBe('ACTIVE')
  })

  it('should not filter when searchable is false', () => {
    const autocompleter = createEnumAutocompleter(enumValues, { searchable: false })
    const context = createMockContext('xyz')

    const result = autocompleter.getSuggestions(context)

    expect(result).toHaveLength(3) // All values returned
  })
})

describe('createAsyncAutocompleter', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('should call fetch function with query', async () => {
    const fetchFn = vi.fn().mockResolvedValue([
      { type: 'value', key: '1', label: 'Result 1' },
    ])

    const autocompleter = createAsyncAutocompleter(fetchFn, { debounceMs: 0 })
    const context = createMockContext('test')

    const result = await autocompleter.getSuggestions(context)

    expect(fetchFn).toHaveBeenCalledWith('test', context, expect.any(AbortSignal))
    expect(result).toHaveLength(1)
  })

  it('should respect minChars', async () => {
    const fetchFn = vi.fn().mockResolvedValue([])

    const autocompleter = createAsyncAutocompleter(fetchFn, { minChars: 3 })
    const context = createMockContext('ab')

    const result = await autocompleter.getSuggestions(context)

    expect(fetchFn).not.toHaveBeenCalled()
    expect(result).toEqual([])
  })

  it('should cache results', async () => {
    const fetchFn = vi.fn().mockResolvedValue([
      { type: 'value', key: '1', label: 'Result 1' },
    ])

    const autocompleter = createAsyncAutocompleter(fetchFn, {
      debounceMs: 0,
      cacheResults: true,
    })
    const context = createMockContext('test')

    // First call
    await autocompleter.getSuggestions(context)
    // Second call with same query
    await autocompleter.getSuggestions(context)

    expect(fetchFn).toHaveBeenCalledTimes(1)
  })

  it('should cancel in-flight requests when a new request is made', async () => {
    const signals: AbortSignal[] = []
    const fetchFn = vi.fn().mockImplementation((query: string, context: AutocompleteContext, signal?: AbortSignal) => {
      if (signal) {
        signals.push(signal)
      }
      return new Promise((resolve, reject) => {
        const timeoutId = setTimeout(() => {
          resolve([{ type: 'value', key: query, label: query }])
        }, 100)
        
        if (signal) {
          signal.addEventListener('abort', () => {
            clearTimeout(timeoutId)
            reject(new DOMException('Aborted', 'AbortError'))
          })
        }
      })
    })

    const autocompleter = createAsyncAutocompleter(fetchFn, { debounceMs: 0 })
    
    // Start first request
    const promise1 = autocompleter.getSuggestions(createMockContext('first'))
    
    // Immediately start second request (should cancel first)
    const promise2 = autocompleter.getSuggestions(createMockContext('second'))
    
    vi.advanceTimersByTime(150)
    
    // First signal should be aborted
    expect(signals[0]?.aborted).toBe(true)
    // Second signal should not be aborted
    expect(signals[1]?.aborted).toBe(false)
    
    // Second request should succeed
    const result2 = await promise2
    expect(result2).toHaveLength(1)
    expect(result2[0].key).toBe('second')
  })

  it('should pass abort signal to fetch function', async () => {
    const fetchFn = vi.fn().mockImplementation((query, context, signal) => {
      expect(signal).toBeInstanceOf(AbortSignal)
      return Promise.resolve([])
    })

    const autocompleter = createAsyncAutocompleter(fetchFn, { debounceMs: 0 })
    await autocompleter.getSuggestions(createMockContext('test'))

    expect(fetchFn).toHaveBeenCalledWith(
      'test',
      expect.any(Object),
      expect.any(AbortSignal)
    )
  })
})

describe('withStaleWhileRevalidate', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('should return cached results immediately while fetching fresh data', async () => {
    let fetchCount = 0
    const fetchFn = vi.fn().mockImplementation(async () => {
      fetchCount++
      return [{ type: 'value', key: `result-${fetchCount}`, label: `Result ${fetchCount}` }]
    })

    const onUpdate = vi.fn()
    // Disable the async autocompleter's built-in cache to test SWR behavior
    const baseAutocompleter = createAsyncAutocompleter(fetchFn, { debounceMs: 0, cacheResults: false })
    const autocompleter = withStaleWhileRevalidate(baseAutocompleter, {
      maxAge: 1000,
      onUpdate,
    })
    const context = createMockContext('test')

    // First call - no cache, should fetch
    const result1 = await autocompleter.getSuggestions(context)
    expect(result1).toHaveLength(1)
    expect(result1[0].key).toBe('result-1')

    // Advance time past maxAge to make cache stale (but not expired)
    vi.advanceTimersByTime(1500)

    // Second call - should return stale data immediately
    const result2 = await autocompleter.getSuggestions(context)
    expect(result2).toHaveLength(1)
    expect(result2[0].key).toBe('result-1') // Stale data

    // Wait for background fetch to complete
    await vi.runAllTimersAsync()

    // onUpdate should have been called with fresh data
    expect(onUpdate).toHaveBeenCalledWith([
      expect.objectContaining({ key: 'result-2' }),
    ])
  })

  it('should return fresh cached data without triggering revalidation', async () => {
    const fetchFn = vi.fn().mockResolvedValue([
      { type: 'value', key: 'cached', label: 'Cached' },
    ])

    const onUpdate = vi.fn()
    const baseAutocompleter = createAsyncAutocompleter(fetchFn, { debounceMs: 0, cacheResults: false })
    const autocompleter = withStaleWhileRevalidate(baseAutocompleter, {
      maxAge: 5000,
      onUpdate,
    })
    const context = createMockContext('test')

    // First call
    await autocompleter.getSuggestions(context)
    
    // Second call within maxAge
    vi.advanceTimersByTime(1000)
    const result = await autocompleter.getSuggestions(context)

    expect(result[0].key).toBe('cached')
    expect(fetchFn).toHaveBeenCalledTimes(1) // No refetch
    expect(onUpdate).not.toHaveBeenCalled()
  })

  it('should completely expire cache after staleAge', async () => {
    let fetchCount = 0
    const fetchFn = vi.fn().mockImplementation(async () => {
      fetchCount++
      return [{ type: 'value', key: `result-${fetchCount}`, label: `Result ${fetchCount}` }]
    })

    const baseAutocompleter = createAsyncAutocompleter(fetchFn, { debounceMs: 0, cacheResults: false })
    const autocompleter = withStaleWhileRevalidate(baseAutocompleter, {
      maxAge: 1000,
      staleAge: 5000,
    })
    const context = createMockContext('test')

    // First call
    await autocompleter.getSuggestions(context)

    // Advance past staleAge - cache should be completely expired
    vi.advanceTimersByTime(6000)

    // Should fetch fresh, not return stale
    const result = await autocompleter.getSuggestions(context)
    expect(result[0].key).toBe('result-2')
    expect(fetchFn).toHaveBeenCalledTimes(2)
  })
})

describe('createNumberAutocompleter', () => {
  it('should return default suggestions when input is empty', () => {
    const autocompleter = createNumberAutocompleter({ min: 0, max: 100, step: 10 })
    const context = createMockContext('')

    const result = autocompleter.getSuggestions(context)

    expect(result).toHaveLength(5) // 0, 10, 20, 30, 40
    expect(result.map((r) => r.key)).toEqual(['0', '10', '20', '30', '40'])
  })

  it('should validate entered number', () => {
    const autocompleter = createNumberAutocompleter({ min: 0, max: 100 })
    const context = createMockContext('50')

    const result = autocompleter.getSuggestions(context)

    expect(result).toHaveLength(1)
    expect(result[0].key).toBe('50')
  })

  it('should return empty for out of range number', () => {
    const autocompleter = createNumberAutocompleter({ min: 0, max: 100 })
    const context = createMockContext('150')

    const result = autocompleter.getSuggestions(context)

    expect(result).toHaveLength(0)
  })

  it('should return empty for invalid number', () => {
    const autocompleter = createNumberAutocompleter()
    const context = createMockContext('not a number')

    const result = autocompleter.getSuggestions(context)

    expect(result).toHaveLength(0)
  })

  it('should validate with min/max constraints', () => {
    const autocompleter = createNumberAutocompleter({ min: 10, max: 20 })

    expect(autocompleter.validate?.(15, createMockContext())).toBe(true)
    expect(autocompleter.validate?.(5, createMockContext())).toBe(false)
    expect(autocompleter.validate?.(25, createMockContext())).toBe(false)
  })

  it('should validate integers when configured', () => {
    const autocompleter = createNumberAutocompleter({ integer: true })

    expect(autocompleter.validate?.(5, createMockContext())).toBe(true)
    expect(autocompleter.validate?.(5.5, createMockContext())).toBe(false)
  })

  it('should format numbers', () => {
    const autocompleter = createNumberAutocompleter({
      format: (n) => `$${n.toFixed(2)}`,
    })

    expect(autocompleter.format?.(100, createMockContext())).toBe('$100.00')
  })

  it('should parse strings', () => {
    const autocompleter = createNumberAutocompleter()

    expect(autocompleter.parse?.('42', createMockContext())).toBe(42)
  })
})

describe('createDateAutocompleter', () => {
  it('should return presets when input is empty', () => {
    const autocompleter = createDateAutocompleter()
    const context = createMockContext('')

    const result = autocompleter.getSuggestions(context)

    expect(result.length).toBeGreaterThan(0)
    expect(result.some((r) => r.label === 'Today')).toBe(true)
    expect(result.some((r) => r.label === 'Yesterday')).toBe(true)
  })

  it('should filter presets by label', () => {
    const autocompleter = createDateAutocompleter()
    const context = createMockContext('week')

    const result = autocompleter.getSuggestions(context)

    expect(result.every((r) => r.label.toLowerCase().includes('week'))).toBe(true)
  })

  it('should parse ISO date input', () => {
    const autocompleter = createDateAutocompleter()
    const context = createMockContext('2024-01-15')

    const result = autocompleter.getSuggestions(context)

    expect(result).toHaveLength(1)
    expect(result[0].key).toBe('2024-01-15')
  })

  it('should validate dates', () => {
    const autocompleter = createDateAutocompleter()

    expect(autocompleter.validate?.(new Date(), createMockContext())).toBe(true)
    expect(autocompleter.validate?.('2024-01-15', createMockContext())).toBe(true)
    expect(autocompleter.validate?.('invalid', createMockContext())).toBe(false)
  })

  it('should format dates', () => {
    const autocompleter = createDateAutocompleter()
    const date = new Date('2024-01-15')

    expect(autocompleter.format?.(date, createMockContext())).toBe('2024-01-15')
  })

  it('should support custom presets', () => {
    const customPresets = [
      { label: 'Custom Date', value: new Date('2024-06-01') },
    ]
    const autocompleter = createDateAutocompleter({ presets: customPresets })
    const context = createMockContext('')

    const result = autocompleter.getSuggestions(context)

    expect(result).toHaveLength(1)
    expect(result[0].label).toBe('Custom Date')
  })
})

describe('combineAutocompleters', () => {
  it('should combine results from multiple autocompleters', async () => {
    const auto1 = createStaticAutocompleter(['A', 'B'])
    const auto2 = createStaticAutocompleter(['C', 'D'])

    const combined = combineAutocompleters(auto1, auto2)
    const context = createMockContext('')

    const result = await combined.getSuggestions(context)

    expect(result).toHaveLength(4)
    expect(result.map((r) => r.label)).toEqual(['A', 'B', 'C', 'D'])
  })
})

describe('mapAutocompleter', () => {
  it('should transform results', async () => {
    const autocompleter = createStaticAutocompleter(['apple', 'banana'])
    const mapped = mapAutocompleter(autocompleter, (items) =>
      items.map((item) => ({ ...item, label: item.label.toUpperCase() }))
    )
    const context = createMockContext('')

    const result = await mapped.getSuggestions(context)

    expect(result.map((r) => r.label)).toEqual(['APPLE', 'BANANA'])
  })
})

describe('withCache', () => {
  it('should cache results', async () => {
    let callCount = 0
    const autocompleter = {
      getSuggestions: () => {
        callCount++
        return [{ type: 'value' as const, key: '1', label: 'Result' }]
      },
    }

    const cached = withCache(autocompleter, 60000)
    const context = createMockContext('test')

    await cached.getSuggestions(context)
    await cached.getSuggestions(context)

    expect(callCount).toBe(1)
  })

  it('should refresh cache after TTL expires', async () => {
    let callCount = 0
    const autocompleter = {
      getSuggestions: () => {
        callCount++
        return [{ type: 'value' as const, key: '1', label: 'Result' }]
      },
    }

    // Very short TTL
    const cached = withCache(autocompleter, 1)
    const context = createMockContext('test')

    await cached.getSuggestions(context)
    // Wait for cache to expire
    await new Promise(resolve => setTimeout(resolve, 10))
    await cached.getSuggestions(context)

    expect(callCount).toBe(2)
  })

  it('should cache by input value', async () => {
    let callCount = 0
    const autocompleter = {
      getSuggestions: () => {
        callCount++
        return [{ type: 'value' as const, key: '1', label: 'Result' }]
      },
    }

    const cached = withCache(autocompleter, 60000)

    await cached.getSuggestions(createMockContext('test1'))
    await cached.getSuggestions(createMockContext('test2'))
    await cached.getSuggestions(createMockContext('test1')) // Should hit cache

    expect(callCount).toBe(2)
  })
})

describe('withDebounce', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('should debounce multiple rapid calls', async () => {
    let callCount = 0
    const autocompleter = {
      getSuggestions: vi.fn().mockImplementation(() => {
        callCount++
        return [{ type: 'value' as const, key: '1', label: 'Result' }]
      }),
    }

    const debounced = withDebounce(autocompleter, 100)
    const context = createMockContext('test')

    // Start multiple requests rapidly
    const promise1 = debounced.getSuggestions(context)
    const promise2 = debounced.getSuggestions(context)
    const promise3 = debounced.getSuggestions(context)

    // Fast forward time
    await vi.advanceTimersByTimeAsync(150)

    // Only the last call should be made after debounce period
    expect(callCount).toBe(1)
  })

  it('should return results after debounce period', async () => {
    const autocompleter = {
      getSuggestions: vi.fn().mockReturnValue([
        { type: 'value' as const, key: '1', label: 'Result' },
      ]),
    }

    const debounced = withDebounce(autocompleter, 50)
    const context = createMockContext('test')

    const resultPromise = debounced.getSuggestions(context)

    await vi.advanceTimersByTimeAsync(100)

    const result = await resultPromise
    expect(result).toHaveLength(1)
    expect(result[0].label).toBe('Result')
  })
})

describe('createDateAutocompleter', () => {
  describe('validate', () => {
    it('should validate Date objects', () => {
      const autocompleter = createDateAutocompleter()
      expect(autocompleter.validate?.(new Date())).toBe(true)
      expect(autocompleter.validate?.(new Date('invalid'))).toBe(false)
    })

    it('should validate ISO date strings', () => {
      const autocompleter = createDateAutocompleter()
      expect(autocompleter.validate?.('2024-01-15')).toBe(true)
      expect(autocompleter.validate?.('invalid-date')).toBe(false)
    })

    it('should reject non-date values', () => {
      const autocompleter = createDateAutocompleter()
      expect(autocompleter.validate?.(null)).toBe(false)
      expect(autocompleter.validate?.(123)).toBe(false)
    })
  })

  describe('format', () => {
    it('should format Date objects', () => {
      const autocompleter = createDateAutocompleter()
      const date = new Date('2024-01-15T00:00:00.000Z')
      expect(autocompleter.format?.(date)).toBe('2024-01-15')
    })

    it('should format ISO date strings', () => {
      const autocompleter = createDateAutocompleter()
      expect(autocompleter.format?.('2024-01-15')).toBe('2024-01-15')
    })

    it('should return string representation for other values', () => {
      const autocompleter = createDateAutocompleter()
      expect(autocompleter.format?.(123)).toBe('123')
      expect(autocompleter.format?.('invalid')).toBe('invalid')
    })
  })

  describe('parse', () => {
    it('should parse ISO date strings', () => {
      const autocompleter = createDateAutocompleter()
      const result = autocompleter.parse?.('2024-01-15')
      expect(result).toBeInstanceOf(Date)
      expect((result as Date).toISOString().startsWith('2024-01-15')).toBe(true)
    })

    it('should return null for invalid dates', () => {
      const autocompleter = createDateAutocompleter()
      expect(autocompleter.parse?.('invalid')).toBeNull()
    })
  })

  describe('getSuggestions', () => {
    it('should return presets when input is empty', () => {
      const autocompleter = createDateAutocompleter()
      const context = createMockContext('')
      const result = autocompleter.getSuggestions(context)

      expect(result.length).toBeGreaterThan(0)
      expect(result.some(r => r.label === 'Today')).toBe(true)
    })

    it('should filter presets by input', () => {
      const autocompleter = createDateAutocompleter()
      const context = createMockContext('tod')
      const result = autocompleter.getSuggestions(context)

      expect(result.some(r => r.label === 'Today')).toBe(true)
    })

    it('should allow custom presets', () => {
      const customPreset = { label: 'Custom', value: new Date('2024-07-04') }
      const autocompleter = createDateAutocompleter({ presets: [customPreset] })
      const context = createMockContext('')
      const result = autocompleter.getSuggestions(context)

      expect(result.some(r => r.label === 'Custom')).toBe(true)
    })

    it('should parse date input and include in suggestions', () => {
      const autocompleter = createDateAutocompleter()
      const context = createMockContext('2024-01-15')
      const result = autocompleter.getSuggestions(context)

      expect(result.some(r => r.key.includes('2024-01-15'))).toBe(true)
    })
  })
})

// =============================================================================
// DateTimeAutocompleter Tests
// =============================================================================

import { createDateTimeAutocompleter } from './index'

describe('createDateTimeAutocompleter', () => {
  describe('getSuggestions', () => {
    it('should return presets when input is empty', () => {
      const autocompleter = createDateTimeAutocompleter()
      const context = createMockContext('')
      const result = autocompleter.getSuggestions(context)

      expect(result.length).toBeGreaterThan(0)
      // Check that presets include "Now" or similar
      expect(result.some(r => r.label === 'Now' || r.label === 'Today')).toBe(true)
    })

    it('should filter presets by input', () => {
      const autocompleter = createDateTimeAutocompleter()
      const context = createMockContext('yester')
      const result = autocompleter.getSuggestions(context)

      expect(result.some(r => r.label.toLowerCase().includes('yesterday'))).toBe(true)
    })

    it('should parse ISO datetime string', () => {
      const autocompleter = createDateTimeAutocompleter()
      const context = createMockContext('2024-01-15T10:30:00')
      const result = autocompleter.getSuggestions(context)

      expect(result.some(r => r.key.includes('2024-01-15'))).toBe(true)
    })

    it('should handle custom presets', () => {
      const customPreset = { label: 'Meeting Time', value: new Date('2024-01-15T14:00:00') }
      const autocompleter = createDateTimeAutocompleter({ presets: [customPreset] })
      const context = createMockContext('')
      const result = autocompleter.getSuggestions(context)

      expect(result.some(r => r.label === 'Meeting Time')).toBe(true)
    })
  })

  describe('validate', () => {
    it('should validate Date objects', () => {
      const autocompleter = createDateTimeAutocompleter()
      expect(autocompleter.validate?.(new Date())).toBe(true)
      expect(autocompleter.validate?.(new Date('invalid'))).toBe(false)
    })

    it('should validate ISO datetime strings', () => {
      const autocompleter = createDateTimeAutocompleter()
      expect(autocompleter.validate?.('2024-01-15T10:30:00.000Z')).toBe(true)
      expect(autocompleter.validate?.('invalid')).toBe(false)
    })
  })

  describe('format', () => {
    it('should format Date to ISO datetime string', () => {
      const autocompleter = createDateTimeAutocompleter()
      const date = new Date('2024-01-15T10:30:00.000Z')
      const formatted = autocompleter.format?.(date, createMockContext(''))
      expect(formatted).toBe('2024-01-15T10:30:00.000Z')
    })

    it('should return string values as-is if valid', () => {
      const autocompleter = createDateTimeAutocompleter()
      const result = autocompleter.format?.('2024-01-15T10:30:00.000Z', createMockContext(''))
      expect(result).toContain('2024-01-15')
    })
  })

  describe('parse', () => {
    it('should parse ISO datetime string to Date', () => {
      const autocompleter = createDateTimeAutocompleter()
      const result = autocompleter.parse?.('2024-01-15T10:30:00.000Z', createMockContext(''))
      expect(result).toBeInstanceOf(Date)
      expect((result as Date).toISOString()).toBe('2024-01-15T10:30:00.000Z')
    })

    it('should return null for invalid strings', () => {
      const autocompleter = createDateTimeAutocompleter()
      const result = autocompleter.parse?.('invalid', createMockContext(''))
      expect(result).toBeNull()
    })
  })
})
