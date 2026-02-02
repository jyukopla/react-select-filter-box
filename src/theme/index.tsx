/**
 * FilterBox Theme System
 *
 * Provides theming support for FilterBox components through CSS custom properties.
 */

import { createContext, useContext, useMemo, type ReactNode } from 'react'

/**
 * Token style properties
 */
export interface TokenStyles {
  /** Background color for field tokens */
  fieldBg?: string
  /** Border color for field tokens */
  fieldBorder?: string
  /** Text color for field tokens */
  fieldText?: string

  /** Background color for operator tokens */
  operatorBg?: string
  /** Border color for operator tokens */
  operatorBorder?: string
  /** Text color for operator tokens */
  operatorText?: string

  /** Background color for value tokens */
  valueBg?: string
  /** Border color for value tokens */
  valueBorder?: string
  /** Text color for value tokens */
  valueText?: string

  /** Background color for connector tokens */
  connectorBg?: string
  /** Border color for connector tokens */
  connectorBorder?: string
  /** Text color for connector tokens */
  connectorText?: string

  /** Gap between tokens */
  gap?: string
  /** Padding inside tokens */
  padding?: string
  /** Border radius of tokens */
  borderRadius?: string
}

/**
 * Container style properties
 */
export interface ContainerStyles {
  /** Background color */
  bg?: string
  /** Border color */
  border?: string
  /** Border color when focused */
  borderFocus?: string
  /** Box shadow */
  shadow?: string
  /** Padding */
  padding?: string
}

/**
 * Dropdown style properties
 */
export interface DropdownStyles {
  /** Background color */
  bg?: string
  /** Border color */
  border?: string
  /** Box shadow */
  shadow?: string
  /** Item hover background */
  itemHover?: string
  /** Item selected/highlighted background */
  itemSelected?: string
}

/**
 * Input style properties
 */
export interface InputStyles {
  /** Placeholder text color */
  placeholder?: string
}

/**
 * Typography properties
 */
export interface TypographyStyles {
  /** Font family */
  fontFamily?: string
  /** Font size */
  fontSize?: string
  /** Token font weight */
  tokenFontWeight?: string
}

/**
 * Complete theme configuration
 */
export interface FilterBoxTheme {
  /** Token styles */
  tokens?: Partial<TokenStyles>
  /** Container styles */
  container?: Partial<ContainerStyles>
  /** Dropdown styles */
  dropdown?: Partial<DropdownStyles>
  /** Input styles */
  input?: Partial<InputStyles>
  /** Typography styles */
  typography?: Partial<TypographyStyles>
}

/**
 * Theme context value
 */
interface FilterBoxThemeContextValue {
  theme: FilterBoxTheme
  cssVariables: Record<string, string>
}

const FilterBoxThemeContext = createContext<FilterBoxThemeContextValue | undefined>(undefined)

/**
 * Convert theme to CSS custom properties
 */
function themeToCssVariables(theme: FilterBoxTheme): Record<string, string> {
  const variables: Record<string, string> = {}

  // Token styles
  if (theme.tokens) {
    const t = theme.tokens
    if (t.fieldBg) variables['--filter-token-field-bg'] = t.fieldBg
    if (t.fieldBorder) variables['--filter-token-field-border'] = t.fieldBorder
    if (t.fieldText) variables['--filter-token-field-text'] = t.fieldText
    if (t.operatorBg) variables['--filter-token-operator-bg'] = t.operatorBg
    if (t.operatorBorder) variables['--filter-token-operator-border'] = t.operatorBorder
    if (t.operatorText) variables['--filter-token-operator-text'] = t.operatorText
    if (t.valueBg) variables['--filter-token-value-bg'] = t.valueBg
    if (t.valueBorder) variables['--filter-token-value-border'] = t.valueBorder
    if (t.valueText) variables['--filter-token-value-text'] = t.valueText
    if (t.connectorBg) variables['--filter-token-connector-bg'] = t.connectorBg
    if (t.connectorBorder) variables['--filter-token-connector-border'] = t.connectorBorder
    if (t.connectorText) variables['--filter-token-connector-text'] = t.connectorText
    if (t.gap) variables['--filter-token-gap'] = t.gap
    if (t.padding) variables['--filter-token-padding'] = t.padding
    if (t.borderRadius) variables['--filter-token-radius'] = t.borderRadius
  }

  // Container styles
  if (theme.container) {
    const c = theme.container
    if (c.bg) variables['--filter-container-bg'] = c.bg
    if (c.border) variables['--filter-container-border'] = c.border
    if (c.borderFocus) variables['--filter-container-border-focus'] = c.borderFocus
    if (c.shadow) variables['--filter-container-shadow'] = c.shadow
    if (c.padding) variables['--filter-container-padding'] = c.padding
  }

  // Dropdown styles
  if (theme.dropdown) {
    const d = theme.dropdown
    if (d.bg) variables['--filter-dropdown-bg'] = d.bg
    if (d.border) variables['--filter-dropdown-border'] = d.border
    if (d.shadow) variables['--filter-dropdown-shadow'] = d.shadow
    if (d.itemHover) variables['--filter-dropdown-item-hover'] = d.itemHover
    if (d.itemSelected) variables['--filter-dropdown-item-selected'] = d.itemSelected
  }

  // Input styles
  if (theme.input) {
    const i = theme.input
    if (i.placeholder) variables['--filter-input-placeholder'] = i.placeholder
  }

  // Typography styles
  if (theme.typography) {
    const ty = theme.typography
    if (ty.fontFamily) variables['--filter-font-family'] = ty.fontFamily
    if (ty.fontSize) variables['--filter-font-size'] = ty.fontSize
    if (ty.tokenFontWeight) variables['--filter-token-font-weight'] = ty.tokenFontWeight
  }

  return variables
}

/**
 * Props for FilterBoxThemeProvider
 */
export interface FilterBoxThemeProviderProps {
  /** Theme configuration */
  theme: FilterBoxTheme
  /** Child components */
  children: ReactNode
}

/**
 * Theme provider component for FilterBox
 *
 * Wraps FilterBox components to apply custom theming through CSS custom properties.
 *
 * @example
 * ```tsx
 * const customTheme = {
 *   tokens: {
 *     fieldBg: '#e8f4f8',
 *     fieldBorder: '#0078d4',
 *   },
 *   container: {
 *     borderFocus: '#0078d4',
 *   },
 * };
 *
 * <FilterBoxThemeProvider theme={customTheme}>
 *   <FilterBox schema={schema} value={value} onChange={onChange} />
 * </FilterBoxThemeProvider>
 * ```
 */
export function FilterBoxThemeProvider({ theme, children }: FilterBoxThemeProviderProps) {
  const contextValue = useMemo(
    () => ({
      theme,
      cssVariables: themeToCssVariables(theme),
    }),
    [theme]
  )

  const style = useMemo(
    () => contextValue.cssVariables as React.CSSProperties,
    [contextValue.cssVariables]
  )

  return (
    <FilterBoxThemeContext.Provider value={contextValue}>
      <div className="filter-box-theme-root" style={style}>
        {children}
      </div>
    </FilterBoxThemeContext.Provider>
  )
}

/**
 * Hook to access the current theme
 */
// eslint-disable-next-line react-refresh/only-export-components
export function useFilterBoxTheme(): FilterBoxTheme | undefined {
  const context = useContext(FilterBoxThemeContext)
  return context?.theme
}

/**
 * Hook to get CSS variables from the current theme
 */
// eslint-disable-next-line react-refresh/only-export-components
export function useThemeCssVariables(): Record<string, string> {
  const context = useContext(FilterBoxThemeContext)
  return context?.cssVariables ?? {}
}

/**
 * Pre-built themes
 */
// eslint-disable-next-line react-refresh/only-export-components
export const themes = {
  /** Default light theme */
  light: {
    tokens: {
      fieldBg: '#e3f2fd',
      fieldBorder: '#2196f3',
      fieldText: '#1565c0',
      operatorBg: '#fce4ec',
      operatorBorder: '#e91e63',
      operatorText: '#c2185b',
      valueBg: '#e8f5e9',
      valueBorder: '#4caf50',
      valueText: '#2e7d32',
      connectorBg: '#fff3e0',
      connectorBorder: '#ff9800',
      connectorText: '#e65100',
    },
    container: {
      bg: '#ffffff',
      border: '#e0e0e0',
      borderFocus: '#2196f3',
    },
    dropdown: {
      bg: '#ffffff',
      border: '#e0e0e0',
      itemHover: '#f5f5f5',
      itemSelected: '#e3f2fd',
    },
    input: {
      placeholder: '#9e9e9e',
    },
  } satisfies FilterBoxTheme,

  /** Dark theme */
  dark: {
    tokens: {
      fieldBg: '#1e3a5f',
      fieldBorder: '#42a5f5',
      fieldText: '#90caf9',
      operatorBg: '#4a1e34',
      operatorBorder: '#f48fb1',
      operatorText: '#f8bbd0',
      valueBg: '#1e3e2a',
      valueBorder: '#81c784',
      valueText: '#a5d6a7',
      connectorBg: '#3d2e1f',
      connectorBorder: '#ffb74d',
      connectorText: '#ffe0b2',
    },
    container: {
      bg: '#1e1e1e',
      border: '#3e3e3e',
      borderFocus: '#42a5f5',
    },
    dropdown: {
      bg: '#2d2d2d',
      border: '#3e3e3e',
      itemHover: '#3e3e3e',
      itemSelected: '#1e3a5f',
    },
    input: {
      placeholder: '#808080',
    },
  } satisfies FilterBoxTheme,

  /** High contrast theme */
  highContrast: {
    tokens: {
      fieldBg: '#000080',
      fieldBorder: '#0000ff',
      fieldText: '#ffffff',
      operatorBg: '#800000',
      operatorBorder: '#ff0000',
      operatorText: '#ffffff',
      valueBg: '#008000',
      valueBorder: '#00ff00',
      valueText: '#ffffff',
      connectorBg: '#808000',
      connectorBorder: '#ffff00',
      connectorText: '#000000',
    },
    container: {
      bg: '#000000',
      border: '#ffffff',
      borderFocus: '#00ffff',
    },
    dropdown: {
      bg: '#000000',
      border: '#ffffff',
      itemHover: '#444444',
      itemSelected: '#0000aa',
    },
    input: {
      placeholder: '#aaaaaa',
    },
  } satisfies FilterBoxTheme,
} as const

/**
 * Merge multiple themes together
 */
// eslint-disable-next-line react-refresh/only-export-components
export function mergeThemes(...themesToMerge: (FilterBoxTheme | undefined)[]): FilterBoxTheme {
  const result: FilterBoxTheme = {}

  for (const theme of themesToMerge) {
    if (!theme) continue

    if (theme.tokens) {
      result.tokens = { ...result.tokens, ...theme.tokens }
    }
    if (theme.container) {
      result.container = { ...result.container, ...theme.container }
    }
    if (theme.dropdown) {
      result.dropdown = { ...result.dropdown, ...theme.dropdown }
    }
    if (theme.input) {
      result.input = { ...result.input, ...theme.input }
    }
    if (theme.typography) {
      result.typography = { ...result.typography, ...theme.typography }
    }
  }

  return result
}

/**
 * Create a custom theme by extending a base theme
 */
// eslint-disable-next-line react-refresh/only-export-components
export function createTheme(baseTheme: FilterBoxTheme, overrides: FilterBoxTheme): FilterBoxTheme {
  return mergeThemes(baseTheme, overrides)
}
