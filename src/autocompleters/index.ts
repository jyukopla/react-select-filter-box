/**
 * Pluggable Autocompleters
 *
 * Provides built-in autocompleter implementations and composition utilities.
 */

import type { Autocompleter, AutocompleteContext, AutocompleteItem } from '@/types'

// =============================================================================
// Static Autocompleter
// =============================================================================

export interface StaticAutocompleterOptions {
  /** Match mode for filtering suggestions */
  matchMode?: 'prefix' | 'substring' | 'fuzzy'
  /** Whether matching is case-sensitive */
  caseSensitive?: boolean
  /** Maximum number of results to return */
  maxResults?: number
}

/**
 * Create an autocompleter with static values
 */
export function createStaticAutocompleter(
  values: string[] | AutocompleteItem[],
  options: StaticAutocompleterOptions = {}
): Autocompleter {
  const { matchMode = 'substring', caseSensitive = false, maxResults } = options

  // Normalize values to AutocompleteItem[]
  const items: AutocompleteItem[] = values.map((v) =>
    typeof v === 'string' ? { type: 'value' as const, key: v, label: v } : v
  )

  return {
    getSuggestions: (context: AutocompleteContext): AutocompleteItem[] => {
      const { inputValue } = context
      if (!inputValue) {
        return maxResults ? items.slice(0, maxResults) : items
      }

      const query = caseSensitive ? inputValue : inputValue.toLowerCase()
      const filtered = items.filter((item) => {
        const label = caseSensitive ? item.label : item.label.toLowerCase()
        switch (matchMode) {
          case 'prefix':
            return label.startsWith(query)
          case 'fuzzy':
            return fuzzyMatch(label, query)
          case 'substring':
          default:
            return label.includes(query)
        }
      })

      return maxResults ? filtered.slice(0, maxResults) : filtered
    },
  }
}

/**
 * Simple fuzzy matching
 */
function fuzzyMatch(text: string, pattern: string): boolean {
  let patternIdx = 0
  for (let i = 0; i < text.length && patternIdx < pattern.length; i++) {
    if (text[i] === pattern[patternIdx]) {
      patternIdx++
    }
  }
  return patternIdx === pattern.length
}

// =============================================================================
// Enum Autocompleter
// =============================================================================

export interface EnumValue {
  key: string
  label: string
  description?: string
}

export interface EnumAutocompleterOptions {
  /** Whether multiple values can be selected (for "in" operator) */
  allowMultiple?: boolean
  /** Whether values are searchable */
  searchable?: boolean
}

/**
 * Create an autocompleter for enum values
 */
export function createEnumAutocompleter(
  values: EnumValue[],
  options: EnumAutocompleterOptions = {}
): Autocompleter {
  const { searchable = true } = options

  const items: AutocompleteItem[] = values.map((v) => ({
    type: 'value' as const,
    key: v.key,
    label: v.label,
    description: v.description,
  }))

  return {
    getSuggestions: (context: AutocompleteContext): AutocompleteItem[] => {
      const { inputValue } = context
      if (!searchable || !inputValue) {
        return items
      }

      const query = inputValue.toLowerCase()
      return items.filter(
        (item) =>
          item.label.toLowerCase().includes(query) ||
          (item.description?.toLowerCase().includes(query) ?? false)
      )
    },
  }
}

// =============================================================================
// Async Autocompleter
// =============================================================================

export interface AsyncAutocompleterOptions {
  /** Debounce time in milliseconds */
  debounceMs?: number
  /** Minimum characters before fetching */
  minChars?: number
  /** Whether to cache results */
  cacheResults?: boolean
  /** Message shown while loading */
  loadingMessage?: string
}

/**
 * Create an autocompleter that fetches from an async source.
 * Supports AbortSignal for canceling in-flight requests when new input arrives.
 */
export function createAsyncAutocompleter(
  fetchFn: (
    query: string,
    context: AutocompleteContext,
    signal?: AbortSignal
  ) => Promise<AutocompleteItem[]>,
  options: AsyncAutocompleterOptions = {}
): Autocompleter {
  const { debounceMs = 300, minChars = 1, cacheResults = true } = options

  const cache = new Map<string, AutocompleteItem[]>()
  let debounceTimer: ReturnType<typeof setTimeout> | null = null
  let currentAbortController: AbortController | null = null
  let lastQuery = ''

  return {
    getSuggestions: async (context: AutocompleteContext): Promise<AutocompleteItem[]> => {
      const { inputValue } = context

      // Clear pending debounce
      if (debounceTimer) {
        clearTimeout(debounceTimer)
        debounceTimer = null
      }

      // Cancel any in-flight request
      if (currentAbortController) {
        currentAbortController.abort()
        currentAbortController = null
      }

      // Check minimum characters
      if (inputValue.length < minChars) {
        return []
      }

      // Check cache
      if (cacheResults && cache.has(inputValue)) {
        return cache.get(inputValue)!
      }

      // Create new abort controller for this request
      const abortController = new AbortController()
      currentAbortController = abortController

      // Debounce
      if (debounceMs > 0 && inputValue !== lastQuery) {
        return new Promise((resolve, reject) => {
          debounceTimer = setTimeout(async () => {
            lastQuery = inputValue
            try {
              const results = await fetchFn(inputValue, context, abortController.signal)
              if (cacheResults) {
                cache.set(inputValue, results)
              }
              resolve(results)
            } catch (error) {
              // If aborted, resolve with empty array
              if (error instanceof DOMException && error.name === 'AbortError') {
                resolve([])
              } else {
                reject(error)
              }
            }
          }, debounceMs)
        })
      }

      // Fetch immediately
      lastQuery = inputValue
      try {
        const results = await fetchFn(inputValue, context, abortController.signal)
        if (cacheResults) {
          cache.set(inputValue, results)
        }
        return results
      } catch (error) {
        // If aborted, return empty array
        if (error instanceof DOMException && error.name === 'AbortError') {
          return []
        }
        throw error
      }
    },
  }
}

// =============================================================================
// Number Autocompleter
// =============================================================================

export interface NumberAutocompleterOptions {
  /** Minimum value */
  min?: number
  /** Maximum value */
  max?: number
  /** Step value for suggestions */
  step?: number
  /** Whether only integers are allowed */
  integer?: boolean
  /** Custom formatter */
  format?: (n: number) => string
  /** Custom parser */
  parse?: (s: string) => number
}

/**
 * Create an autocompleter for number input
 */
export function createNumberAutocompleter(options: NumberAutocompleterOptions = {}): Autocompleter {
  const {
    min = Number.MIN_SAFE_INTEGER,
    max = Number.MAX_SAFE_INTEGER,
    step = 1,
    integer = false,
    format = (n) => n.toString(),
    parse = (s) => (integer ? parseInt(s, 10) : parseFloat(s)),
  } = options

  return {
    getSuggestions: (context: AutocompleteContext): AutocompleteItem[] => {
      const { inputValue } = context

      // If input is empty, return some suggested values
      if (!inputValue) {
        const suggestions: AutocompleteItem[] = []
        const start = min > Number.MIN_SAFE_INTEGER ? min : 0
        for (let i = 0; i < 5 && start + i * step <= max; i++) {
          const value = start + i * step
          suggestions.push({
            type: 'value',
            key: value.toString(),
            label: format(value),
          })
        }
        return suggestions
      }

      // Parse the input and validate
      const value = parse(inputValue)
      if (isNaN(value)) {
        return []
      }

      // Suggest the entered value if valid
      if (value >= min && value <= max) {
        return [
          {
            type: 'value',
            key: value.toString(),
            label: format(value),
          },
        ]
      }

      return []
    },

    validate: (value: unknown): boolean => {
      const num = typeof value === 'number' ? value : parse(String(value))
      if (isNaN(num)) return false
      if (num < min || num > max) return false
      if (integer && !Number.isInteger(num)) return false
      return true
    },

    format: (value: unknown): string => {
      const num = typeof value === 'number' ? value : parse(String(value))
      return format(num)
    },

    parse: (display: string): unknown => {
      return parse(display)
    },
  }
}

// =============================================================================
// Date Autocompleter
// =============================================================================

export interface DatePreset {
  label: string
  value: Date
}

export interface DateAutocompleterOptions {
  /** Date format string */
  format?: string
  /** Minimum date */
  minDate?: Date
  /** Maximum date */
  maxDate?: Date
  /** Disabled dates */
  disabledDates?: Date[]
  /** Preset date options (e.g., "Today", "Yesterday") */
  presets?: DatePreset[]
}

/**
 * Format a date as ISO date string (YYYY-MM-DD)
 */
function formatDateISO(date: Date): string {
  return date.toISOString().split('T')[0]
}

/**
 * Parse an ISO date string to Date
 */
function parseDateISO(str: string): Date | null {
  const date = new Date(str)
  return isNaN(date.getTime()) ? null : date
}

/**
 * Create an autocompleter for date input
 */
export function createDateAutocompleter(options: DateAutocompleterOptions = {}): Autocompleter {
  const { presets = getDefaultDatePresets() } = options

  return {
    getSuggestions: (context: AutocompleteContext): AutocompleteItem[] => {
      const { inputValue } = context

      // If no input, show presets
      if (!inputValue) {
        return presets.map((preset) => ({
          type: 'value' as const,
          key: formatDateISO(preset.value),
          label: preset.label,
          description: formatDateISO(preset.value),
        }))
      }

      // Filter presets by input
      const query = inputValue.toLowerCase()
      const matchingPresets = presets
        .filter((preset) => preset.label.toLowerCase().includes(query))
        .map((preset) => ({
          type: 'value' as const,
          key: formatDateISO(preset.value),
          label: preset.label,
          description: formatDateISO(preset.value),
        }))

      // Try to parse as date
      const parsedDate = parseDateISO(inputValue)
      if (parsedDate) {
        return [
          {
            type: 'value' as const,
            key: formatDateISO(parsedDate),
            label: formatDateISO(parsedDate),
          },
          ...matchingPresets,
        ]
      }

      return matchingPresets
    },

    validate: (value: unknown): boolean => {
      if (value instanceof Date) return !isNaN(value.getTime())
      if (typeof value === 'string') return parseDateISO(value) !== null
      return false
    },

    format: (value: unknown): string => {
      if (value instanceof Date) return formatDateISO(value)
      if (typeof value === 'string') {
        const date = parseDateISO(value)
        return date ? formatDateISO(date) : value
      }
      return String(value)
    },

    parse: (display: string): unknown => {
      return parseDateISO(display)
    },
  }
}

/**
 * Get default date presets
 */
function getDefaultDatePresets(): DatePreset[] {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)

  const lastWeek = new Date(today)
  lastWeek.setDate(lastWeek.getDate() - 7)

  const lastMonth = new Date(today)
  lastMonth.setMonth(lastMonth.getMonth() - 1)

  const startOfWeek = new Date(today)
  startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay())

  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)

  return [
    { label: 'Today', value: today },
    { label: 'Yesterday', value: yesterday },
    { label: 'Start of this week', value: startOfWeek },
    { label: 'Start of this month', value: startOfMonth },
    { label: 'One week ago', value: lastWeek },
    { label: 'One month ago', value: lastMonth },
  ]
}

// =============================================================================
// DateTime Autocompleter
// =============================================================================

export interface DateTimePreset {
  label: string
  value: Date
}

export interface DateTimeAutocompleterOptions {
  /** Minimum datetime */
  minDateTime?: Date
  /** Maximum datetime */
  maxDateTime?: Date
  /** Preset datetime options */
  presets?: DateTimePreset[]
}

/**
 * Format a date as ISO datetime string
 */
function formatDateTimeISO(date: Date): string {
  return date.toISOString()
}

/**
 * Format a date for display (human-readable with time)
 */
function formatDateTimeDisplay(date: Date): string {
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

/**
 * Parse an ISO datetime string to Date
 */
function parseDateTimeISO(str: string): Date | null {
  const date = new Date(str)
  return isNaN(date.getTime()) ? null : date
}

/**
 * Create an autocompleter for datetime input
 */
export function createDateTimeAutocompleter(
  options: DateTimeAutocompleterOptions = {}
): Autocompleter {
  const { presets = getDefaultDateTimePresets() } = options

  return {
    getSuggestions: (context: AutocompleteContext): AutocompleteItem[] => {
      const { inputValue } = context

      // If no input, show presets
      if (!inputValue) {
        return presets.map((preset) => ({
          type: 'value' as const,
          key: formatDateTimeISO(preset.value),
          label: preset.label,
          description: formatDateTimeDisplay(preset.value),
        }))
      }

      // Filter presets by input
      const query = inputValue.toLowerCase()
      const matchingPresets = presets
        .filter((preset) => preset.label.toLowerCase().includes(query))
        .map((preset) => ({
          type: 'value' as const,
          key: formatDateTimeISO(preset.value),
          label: preset.label,
          description: formatDateTimeDisplay(preset.value),
        }))

      // Try to parse as datetime
      const parsedDate = parseDateTimeISO(inputValue)
      if (parsedDate) {
        return [
          {
            type: 'value' as const,
            key: formatDateTimeISO(parsedDate),
            label: formatDateTimeDisplay(parsedDate),
            description: formatDateTimeISO(parsedDate),
          },
          ...matchingPresets,
        ]
      }

      return matchingPresets
    },

    validate: (value: unknown): boolean => {
      if (value instanceof Date) return !isNaN(value.getTime())
      if (typeof value === 'string') return parseDateTimeISO(value) !== null
      return false
    },

    format: (value: unknown): string => {
      if (value instanceof Date) return formatDateTimeISO(value)
      if (typeof value === 'string') {
        const date = parseDateTimeISO(value)
        return date ? formatDateTimeISO(date) : value
      }
      return String(value)
    },

    parse: (display: string): unknown => {
      return parseDateTimeISO(display)
    },
  }
}

/**
 * Get default datetime presets
 */
function getDefaultDateTimePresets(): DateTimePreset[] {
  const now = new Date()

  const today = new Date(now)
  today.setHours(0, 0, 0, 0)

  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)

  const oneHourAgo = new Date(now)
  oneHourAgo.setHours(oneHourAgo.getHours() - 1)

  const startOfDay = new Date(now)
  startOfDay.setHours(0, 0, 0, 0)

  const endOfDay = new Date(now)
  endOfDay.setHours(23, 59, 59, 999)

  return [
    { label: 'Now', value: now },
    { label: 'One hour ago', value: oneHourAgo },
    { label: 'Today (start)', value: startOfDay },
    { label: 'Today (end)', value: endOfDay },
    { label: 'Yesterday', value: yesterday },
  ]
}

// =============================================================================
// Autocompleter Composition
// =============================================================================

/**
 * Combine multiple autocompleters
 */
export function combineAutocompleters(...autocompleters: Autocompleter[]): Autocompleter {
  return {
    getSuggestions: async (context: AutocompleteContext): Promise<AutocompleteItem[]> => {
      const results = await Promise.all(autocompleters.map((ac) => ac.getSuggestions(context)))
      return results.flat()
    },
  }
}

/**
 * Transform autocompleter results
 */
export function mapAutocompleter(
  autocompleter: Autocompleter,
  transform: (items: AutocompleteItem[]) => AutocompleteItem[]
): Autocompleter {
  return {
    getSuggestions: async (context: AutocompleteContext): Promise<AutocompleteItem[]> => {
      const items = await autocompleter.getSuggestions(context)
      return transform(items)
    },
  }
}

/**
 * Add caching to any autocompleter
 */
export function withCache(autocompleter: Autocompleter, ttlMs: number = 60000): Autocompleter {
  const cache = new Map<string, { items: AutocompleteItem[]; timestamp: number }>()

  return {
    getSuggestions: async (context: AutocompleteContext): Promise<AutocompleteItem[]> => {
      const key = context.inputValue
      const cached = cache.get(key)

      if (cached && Date.now() - cached.timestamp < ttlMs) {
        return cached.items
      }

      const items = await autocompleter.getSuggestions(context)
      cache.set(key, { items, timestamp: Date.now() })
      return items
    },
  }
}

/**
 * Add debouncing to any autocompleter
 */
export function withDebounce(autocompleter: Autocompleter, ms: number): Autocompleter {
  let debounceTimer: ReturnType<typeof setTimeout> | null = null

  return {
    getSuggestions: (context: AutocompleteContext): Promise<AutocompleteItem[]> => {
      return new Promise((resolve) => {
        if (debounceTimer) {
          clearTimeout(debounceTimer)
        }
        debounceTimer = setTimeout(async () => {
          const items = await autocompleter.getSuggestions(context)
          resolve(items)
        }, ms)
      })
    },
  }
}

// =============================================================================
// Lazy Load / Paginated Autocompleter
// =============================================================================

/**
 * Page info returned by paginated fetch function
 */
export interface PaginatedResult {
  /** Items for this page */
  items: AutocompleteItem[]
  /** Whether there are more items to load */
  hasMore: boolean
  /** Total count of items (optional) */
  total?: number
  /** Cursor or token for next page (optional) */
  nextCursor?: string
}

/**
 * Pagination state managed by the autocompleter
 */
export interface PaginationState {
  /** Current page number (0-indexed) */
  page: number
  /** Cursor for next page fetch */
  cursor?: string
  /** Whether more items are available */
  hasMore: boolean
  /** Whether currently loading more items */
  isLoading: boolean
  /** Total items (if known) */
  total?: number
}

export interface PaginatedAutocompleterOptions {
  /** Number of items per page */
  pageSize?: number
  /** Debounce time in milliseconds for initial fetch */
  debounceMs?: number
  /** Minimum characters before fetching */
  minChars?: number
  /** Whether to cache results per query */
  cacheResults?: boolean
  /** Maximum pages to cache per query */
  maxCachedPages?: number
}

/**
 * Create an autocompleter that loads suggestions lazily with pagination support.
 *
 * This is useful for large datasets where you don't want to load all items at once.
 * The autocompleter supports:
 * - Cursor-based or page-based pagination
 * - Lazy loading triggered by scroll/load more
 * - Per-query caching with page limits
 * - Request cancellation for new queries
 *
 * @example
 * ```ts
 * const autocompleter = createPaginatedAutocompleter(
 *   async (query, page, pageSize, cursor, signal) => {
 *     const response = await fetch(`/api/search?q=${query}&page=${page}`, { signal })
 *     const data = await response.json()
 *     return {
 *       items: data.results.map(r => ({ key: r.id, label: r.name })),
 *       hasMore: data.hasNextPage,
 *       nextCursor: data.nextCursor,
 *       total: data.totalCount
 *     }
 *   },
 *   { pageSize: 20 }
 * )
 * ```
 */
export function createPaginatedAutocompleter(
  fetchFn: (
    query: string,
    page: number,
    pageSize: number,
    cursor: string | undefined,
    signal?: AbortSignal
  ) => Promise<PaginatedResult>,
  options: PaginatedAutocompleterOptions = {}
): Autocompleter & {
  /** Load next page of results */
  loadMore: () => Promise<AutocompleteItem[]>
  /** Get current pagination state */
  getPaginationState: () => PaginationState
  /** Reset pagination (call when query changes) */
  reset: () => void
} {
  const {
    pageSize = 20,
    debounceMs = 300,
    minChars = 0,
    cacheResults = true,
    maxCachedPages = 5,
  } = options

  // Cache structure: query -> { pages: Map<number, items[]>, hasMore, total, cursor }
  const cache = new Map<
    string,
    {
      pages: Map<number, AutocompleteItem[]>
      hasMore: boolean
      total?: number
      cursor?: string
    }
  >()

  let currentQuery = ''
  let currentPage = 0
  let currentCursor: string | undefined
  let hasMore = true
  let isLoading = false
  let total: number | undefined
  let debounceTimer: ReturnType<typeof setTimeout> | null = null
  let currentAbortController: AbortController | null = null

  const reset = () => {
    currentPage = 0
    currentCursor = undefined
    hasMore = true
    isLoading = false
    total = undefined
  }

  const getAllCachedItems = (query: string): AutocompleteItem[] => {
    const cached = cache.get(query)
    if (!cached) return []

    const items: AutocompleteItem[] = []
    const sortedPages = Array.from(cached.pages.entries()).sort((a, b) => a[0] - b[0])
    for (const [, pageItems] of sortedPages) {
      items.push(...pageItems)
    }
    return items
  }

  const fetchPage = async (
    query: string,
    page: number,
    cursor: string | undefined,
    signal?: AbortSignal
  ): Promise<AutocompleteItem[]> => {
    isLoading = true

    try {
      const result = await fetchFn(query, page, pageSize, cursor, signal)

      // Update state
      hasMore = result.hasMore
      total = result.total
      currentCursor = result.nextCursor

      // Cache results
      if (cacheResults) {
        let queryCache = cache.get(query)
        if (!queryCache) {
          queryCache = { pages: new Map(), hasMore: true }
          cache.set(query, queryCache)
        }

        // Add new page to cache
        queryCache.pages.set(page, result.items)
        queryCache.hasMore = result.hasMore
        queryCache.total = result.total
        queryCache.cursor = result.nextCursor

        // Limit cached pages
        if (queryCache.pages.size > maxCachedPages) {
          const oldestPage = Math.min(...queryCache.pages.keys())
          queryCache.pages.delete(oldestPage)
        }
      }

      isLoading = false
      return result.items
    } catch (error) {
      isLoading = false
      throw error
    }
  }

  const getSuggestions = async (context: AutocompleteContext): Promise<AutocompleteItem[]> => {
    const { inputValue } = context

    // Clear pending debounce
    if (debounceTimer) {
      clearTimeout(debounceTimer)
      debounceTimer = null
    }

    // Cancel any in-flight request
    if (currentAbortController) {
      currentAbortController.abort()
      currentAbortController = null
    }

    // Reset if query changed
    if (inputValue !== currentQuery) {
      reset()
      currentQuery = inputValue
    }

    // Check minimum characters
    if (inputValue.length < minChars) {
      return []
    }

    // Check cache for this query (including empty results)
    if (cacheResults && cache.has(inputValue)) {
      const queryCache = cache.get(inputValue)!
      hasMore = queryCache.hasMore
      total = queryCache.total
      currentCursor = queryCache.cursor
      if (queryCache.pages.size > 0) {
        currentPage = Math.max(...queryCache.pages.keys())
      }
      return getAllCachedItems(inputValue)
    }

    // Create new abort controller for this request
    const abortController = new AbortController()
    currentAbortController = abortController

    // Debounce initial fetch
    if (debounceMs > 0) {
      return new Promise((resolve, reject) => {
        debounceTimer = setTimeout(async () => {
          try {
            const items = await fetchPage(inputValue, 0, undefined, abortController.signal)
            resolve(items)
          } catch (error) {
            if (error instanceof DOMException && error.name === 'AbortError') {
              resolve([])
            } else {
              reject(error)
            }
          }
        }, debounceMs)
      })
    }

    // Fetch immediately
    try {
      return await fetchPage(inputValue, 0, undefined, abortController.signal)
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') {
        return []
      }
      throw error
    }
  }

  const loadMore = async (): Promise<AutocompleteItem[]> => {
    if (!hasMore || isLoading) {
      return getAllCachedItems(currentQuery)
    }

    const nextPage = currentPage + 1

    // Check if next page is cached
    const queryCache = cache.get(currentQuery)
    if (queryCache?.pages.has(nextPage)) {
      currentPage = nextPage
      return getAllCachedItems(currentQuery)
    }

    // Fetch next page
    currentPage = nextPage
    await fetchPage(currentQuery, nextPage, currentCursor)

    return getAllCachedItems(currentQuery)
  }

  const getPaginationState = (): PaginationState => ({
    page: currentPage,
    cursor: currentCursor,
    hasMore,
    isLoading,
    total,
  })

  return {
    getSuggestions,
    loadMore,
    getPaginationState,
    reset,
  }
}

/**
 * Options for stale-while-revalidate wrapper
 */
export interface StaleWhileRevalidateOptions {
  /** Time in ms before cached data is considered stale (triggers background revalidation) */
  maxAge: number
  /** Time in ms before cached data is completely expired (forces fresh fetch). Default: maxAge * 2 */
  staleAge?: number
  /** Callback when fresh data arrives after returning stale data */
  onUpdate?: (items: AutocompleteItem[]) => void
}

/**
 * Add stale-while-revalidate caching to any autocompleter.
 * Returns stale cached data immediately while fetching fresh data in the background.
 */
export function withStaleWhileRevalidate(
  autocompleter: Autocompleter,
  options: StaleWhileRevalidateOptions
): Autocompleter {
  const { maxAge, staleAge = maxAge * 2, onUpdate } = options
  const cache = new Map<string, { items: AutocompleteItem[]; timestamp: number }>()

  return {
    getSuggestions: async (context: AutocompleteContext): Promise<AutocompleteItem[]> => {
      const key = context.inputValue
      const cached = cache.get(key)
      const now = Date.now()

      if (cached) {
        const age = now - cached.timestamp

        // Fresh data - return directly
        if (age < maxAge) {
          return cached.items
        }

        // Stale but not expired - return stale, fetch in background
        if (age < staleAge) {
          // Fire and forget background revalidation
          Promise.resolve(autocompleter.getSuggestions(context))
            .then((items) => {
              cache.set(key, { items, timestamp: Date.now() })
              onUpdate?.(items)
            })
            .catch(() => {
              // Ignore errors during background revalidation
            })

          return cached.items
        }

        // Completely expired - fall through to fresh fetch
      }

      // No cache or expired - fetch fresh
      const items = await autocompleter.getSuggestions(context)
      cache.set(key, { items, timestamp: Date.now() })
      return items
    },
  }
}
