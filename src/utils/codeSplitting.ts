/**
 * Code Splitting Utilities
 *
 * Helpers for lazy loading components and autocompleters
 * to optimize bundle size.
 */

import { lazy, ComponentType, LazyExoticComponent } from 'react'
import type { Autocompleter, AutocompleteItem, AutocompleteContext } from '@/types'

/**
 * Options for lazy autocompleter
 */
export interface LazyAutocompleterOptions {
  /**
   * Fallback items to show while loading
   */
  fallbackItems?: AutocompleteItem[]
  /**
   * Error handler for failed loads
   */
  onError?: (error: Error) => void
}

/**
 * Create a lazy-loaded autocompleter that loads its implementation on first use.
 *
 * This is useful for heavy autocompleters that include large dependencies
 * or complex logic that shouldn't be in the main bundle.
 *
 * @example
 * ```ts
 * const autocompleter = createLazyAutocompleter(
 *   () => import('./heavyAutocompleter').then(m => m.createHeavyAutocompleter()),
 *   { fallbackItems: [{ key: 'loading', label: 'Loading...' }] }
 * )
 * ```
 */
export function createLazyAutocompleter(
  loader: () => Promise<Autocompleter>,
  options: LazyAutocompleterOptions = {}
): Autocompleter {
  const { fallbackItems = [], onError } = options

  let loadedAutocompleter: Autocompleter | null = null
  let loadPromise: Promise<Autocompleter> | null = null
  let loadError: Error | null = null

  const ensureLoaded = async (): Promise<Autocompleter | null> => {
    if (loadedAutocompleter) {
      return loadedAutocompleter
    }

    if (loadError) {
      return null
    }

    if (!loadPromise) {
      loadPromise = loader()
        .then((autocompleter) => {
          loadedAutocompleter = autocompleter
          return autocompleter
        })
        .catch((error) => {
          loadError = error instanceof Error ? error : new Error(String(error))
          onError?.(loadError)
          throw loadError
        })
    }

    return loadPromise
  }

  return {
    getSuggestions: async (context: AutocompleteContext): Promise<AutocompleteItem[]> => {
      try {
        const autocompleter = await ensureLoaded()
        if (!autocompleter) {
          return fallbackItems
        }

        const result = autocompleter.getSuggestions(context)
        return result instanceof Promise ? await result : result
      } catch {
        return fallbackItems
      }
    },

    validate: (value: unknown, context: AutocompleteContext): boolean => {
      if (!loadedAutocompleter?.validate) {
        return true // Allow any value while loading
      }
      return loadedAutocompleter.validate(value, context)
    },

    format: (value: unknown, context: AutocompleteContext): string | undefined => {
      if (!loadedAutocompleter?.format) {
        return String(value)
      }
      return loadedAutocompleter.format(value, context)
    },

    parse: (display: string, context: AutocompleteContext): unknown => {
      if (!loadedAutocompleter?.parse) {
        return display
      }
      return loadedAutocompleter.parse(display, context)
    },
  }
}

/**
 * Preload an autocompleter before it's needed.
 *
 * Call this during idle time or on hover to start loading
 * before the user actually needs the autocompleter.
 *
 * @example
 * ```ts
 * // Preload on hover
 * const handleMouseEnter = () => {
 *   preloadAutocompleter(() => import('./heavyAutocompleter'))
 * }
 * ```
 */
export function preloadAutocompleter(
  loader: () => Promise<Autocompleter | { default: Autocompleter }>
): void {
  // Start loading but don't wait
  loader().catch(() => {
    // Ignore preload errors - will be handled when actually used
  })
}

/**
 * Create a lazy React component with a loading state.
 *
 * @example
 * ```ts
 * const DatePickerWidget = createLazyComponent(
 *   () => import('./DatePickerWidget'),
 *   { fallback: <input type="date" /> }
 * )
 * ```
 */
export function createLazyComponent<T extends ComponentType<unknown>>(
  loader: () => Promise<{ default: T }>
): LazyExoticComponent<T> {
  return lazy(loader)
}

/**
 * Preload a dynamic import for a component.
 *
 * @example
 * ```ts
 * // Preload on route change
 * preloadComponent(() => import('./HeavyComponent'))
 * ```
 */
export function preloadComponent(loader: () => Promise<{ default: ComponentType<unknown> }>): void {
  loader().catch(() => {
    // Ignore preload errors
  })
}

/**
 * Create an autocompleter that loads different implementations
 * based on the field or context.
 *
 * @example
 * ```ts
 * const dynamicAutocompleter = createDynamicAutocompleter({
 *   'country': () => import('./countryAutocompleter'),
 *   'city': () => import('./cityAutocompleter'),
 *   'default': () => Promise.resolve(createStaticAutocompleter(['N/A'])),
 * })
 * ```
 */
export function createDynamicAutocompleter(
  loaders: Record<string, () => Promise<Autocompleter | { default: Autocompleter }>>
): Autocompleter {
  const cache = new Map<string, Autocompleter>()

  const getAutocompleter = async (key: string): Promise<Autocompleter | null> => {
    if (cache.has(key)) {
      return cache.get(key)!
    }

    const loader = loaders[key] || loaders['default']
    if (!loader) {
      return null
    }

    try {
      const result = await loader()
      const autocompleter = 'default' in result ? result.default : result
      cache.set(key, autocompleter)
      return autocompleter
    } catch {
      return null
    }
  }

  return {
    getSuggestions: async (context: AutocompleteContext): Promise<AutocompleteItem[]> => {
      const key = context.field?.key || 'default'
      const autocompleter = await getAutocompleter(key)
      if (!autocompleter) {
        return []
      }

      const result = autocompleter.getSuggestions(context)
      return result instanceof Promise ? await result : result
    },

    validate: (value: unknown, context: AutocompleteContext): boolean => {
      const key = context?.field?.key || 'default'
      const autocompleter = cache.get(key)
      return autocompleter?.validate?.(value, context) ?? true
    },

    format: (value: unknown, context: AutocompleteContext): string | undefined => {
      const key = context.field?.key || 'default'
      const autocompleter = cache.get(key)
      return autocompleter?.format?.(value, context) ?? String(value)
    },

    parse: (display: string, context: AutocompleteContext): unknown => {
      const key = context.field?.key || 'default'
      const autocompleter = cache.get(key)
      return autocompleter?.parse?.(display, context) ?? display
    },
  }
}
