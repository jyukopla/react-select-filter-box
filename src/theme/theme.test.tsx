/**
 * Tests for Theme System
 */

import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import {
  FilterBoxThemeProvider,
  useFilterBoxTheme,
  useThemeCssVariables,
  themes,
  mergeThemes,
  createTheme,
  type FilterBoxTheme,
} from './index'

// Test component to access theme context
function ThemeConsumer() {
  const theme = useFilterBoxTheme()
  const variables = useThemeCssVariables()
  return (
    <div data-testid="theme-consumer">
      <span data-testid="has-theme">{theme ? 'yes' : 'no'}</span>
      <span data-testid="var-count">{Object.keys(variables).length}</span>
    </div>
  )
}

describe('FilterBoxThemeProvider', () => {
  it('should render children', () => {
    render(
      <FilterBoxThemeProvider theme={themes.light}>
        <div data-testid="child">Hello</div>
      </FilterBoxThemeProvider>
    )
    expect(screen.getByTestId('child')).toBeInTheDocument()
  })

  it('should apply CSS variables to wrapper', () => {
    const { container } = render(
      <FilterBoxThemeProvider theme={themes.light}>
        <div>Content</div>
      </FilterBoxThemeProvider>
    )
    const wrapper = container.querySelector('.filter-box-theme-root')
    expect(wrapper).toBeInTheDocument()
    expect(wrapper).toHaveStyle({ '--filter-token-field-bg': '#e3f2fd' })
  })

  it('should provide theme context to children', () => {
    render(
      <FilterBoxThemeProvider theme={themes.light}>
        <ThemeConsumer />
      </FilterBoxThemeProvider>
    )
    expect(screen.getByTestId('has-theme')).toHaveTextContent('yes')
  })

  it('should convert theme to CSS variables', () => {
    render(
      <FilterBoxThemeProvider theme={themes.light}>
        <ThemeConsumer />
      </FilterBoxThemeProvider>
    )
    // Light theme has many properties defined
    const varCount = parseInt(screen.getByTestId('var-count').textContent ?? '0')
    expect(varCount).toBeGreaterThan(10)
  })
})

describe('useFilterBoxTheme', () => {
  it('should return undefined outside provider', () => {
    render(<ThemeConsumer />)
    expect(screen.getByTestId('has-theme')).toHaveTextContent('no')
  })

  it('should return theme inside provider', () => {
    render(
      <FilterBoxThemeProvider theme={themes.dark}>
        <ThemeConsumer />
      </FilterBoxThemeProvider>
    )
    expect(screen.getByTestId('has-theme')).toHaveTextContent('yes')
  })
})

describe('useThemeCssVariables', () => {
  it('should return empty object outside provider', () => {
    render(<ThemeConsumer />)
    expect(screen.getByTestId('var-count')).toHaveTextContent('0')
  })
})

describe('themes', () => {
  it('should have light theme', () => {
    expect(themes.light).toBeDefined()
    expect(themes.light.tokens?.fieldBg).toBe('#e3f2fd')
  })

  it('should have dark theme', () => {
    expect(themes.dark).toBeDefined()
    expect(themes.dark.tokens?.fieldBg).toBe('#1e3a5f')
    expect(themes.dark.container?.bg).toBe('#1e1e1e')
  })

  it('should have high contrast theme', () => {
    expect(themes.highContrast).toBeDefined()
    expect(themes.highContrast.tokens?.fieldBg).toBe('#000080')
  })
})

describe('mergeThemes', () => {
  it('should merge multiple themes', () => {
    const base: FilterBoxTheme = {
      tokens: { fieldBg: 'red', fieldBorder: 'blue' },
      container: { bg: 'white' },
    }
    const override: FilterBoxTheme = {
      tokens: { fieldBg: 'green' },
      dropdown: { bg: 'black' },
    }

    const merged = mergeThemes(base, override)

    expect(merged.tokens?.fieldBg).toBe('green')
    expect(merged.tokens?.fieldBorder).toBe('blue')
    expect(merged.container?.bg).toBe('white')
    expect(merged.dropdown?.bg).toBe('black')
  })

  it('should handle undefined themes', () => {
    const theme: FilterBoxTheme = {
      tokens: { fieldBg: 'red' },
    }

    const merged = mergeThemes(undefined, theme, undefined)

    expect(merged.tokens?.fieldBg).toBe('red')
  })

  it('should return empty object for no themes', () => {
    const merged = mergeThemes()
    expect(merged).toEqual({})
  })

  it('should merge all style categories', () => {
    const theme1: FilterBoxTheme = {
      tokens: { fieldBg: 'a' },
      container: { bg: 'b' },
      dropdown: { bg: 'c' },
      input: { placeholder: 'd' },
      typography: { fontFamily: 'e' },
    }
    const theme2: FilterBoxTheme = {
      tokens: { operatorBg: 'f' },
      container: { border: 'g' },
    }

    const merged = mergeThemes(theme1, theme2)

    expect(merged.tokens?.fieldBg).toBe('a')
    expect(merged.tokens?.operatorBg).toBe('f')
    expect(merged.container?.bg).toBe('b')
    expect(merged.container?.border).toBe('g')
    expect(merged.dropdown?.bg).toBe('c')
    expect(merged.input?.placeholder).toBe('d')
    expect(merged.typography?.fontFamily).toBe('e')
  })
})

describe('createTheme', () => {
  it('should create theme from base with overrides', () => {
    const custom = createTheme(themes.light, {
      tokens: { fieldBg: '#custom' },
    })

    expect(custom.tokens?.fieldBg).toBe('#custom')
    expect(custom.tokens?.fieldBorder).toBe('#2196f3') // from light theme
    expect(custom.container?.bg).toBe('#ffffff') // from light theme
  })

  it('should not modify the base theme', () => {
    const originalFieldBg = themes.light.tokens?.fieldBg

    createTheme(themes.light, {
      tokens: { fieldBg: '#modified' },
    })

    expect(themes.light.tokens?.fieldBg).toBe(originalFieldBg)
  })
})

describe('CSS variable generation', () => {
  it('should generate all token variables', () => {
    const { container } = render(
      <FilterBoxThemeProvider
        theme={{
          tokens: {
            fieldBg: '#a',
            fieldBorder: '#b',
            fieldText: '#c',
            operatorBg: '#d',
            operatorBorder: '#e',
            operatorText: '#f',
            valueBg: '#g',
            valueBorder: '#h',
            valueText: '#i',
            connectorBg: '#j',
            connectorBorder: '#k',
            connectorText: '#l',
            gap: '4px',
            padding: '8px',
            borderRadius: '6px',
          },
        }}
      >
        <div>Content</div>
      </FilterBoxThemeProvider>
    )

    const wrapper = container.querySelector('.filter-box-theme-root')
    expect(wrapper).toHaveStyle({ '--filter-token-field-bg': '#a' })
    expect(wrapper).toHaveStyle({ '--filter-token-operator-text': '#f' })
    expect(wrapper).toHaveStyle({ '--filter-token-gap': '4px' })
    expect(wrapper).toHaveStyle({ '--filter-token-radius': '6px' })
  })

  it('should generate container variables', () => {
    const { container } = render(
      <FilterBoxThemeProvider
        theme={{
          container: {
            bg: '#white',
            border: '#gray',
            borderFocus: '#blue',
            shadow: '0 2px 4px black',
            padding: '12px',
          },
        }}
      >
        <div>Content</div>
      </FilterBoxThemeProvider>
    )

    const wrapper = container.querySelector('.filter-box-theme-root')
    expect(wrapper).toHaveStyle({ '--filter-container-bg': '#white' })
    expect(wrapper).toHaveStyle({ '--filter-container-border-focus': '#blue' })
  })

  it('should generate dropdown variables', () => {
    const { container } = render(
      <FilterBoxThemeProvider
        theme={{
          dropdown: {
            bg: '#dropdown-bg',
            border: '#dropdown-border',
            shadow: 'shadow-value',
            itemHover: '#hover',
            itemSelected: '#selected',
          },
        }}
      >
        <div>Content</div>
      </FilterBoxThemeProvider>
    )

    const wrapper = container.querySelector('.filter-box-theme-root')
    expect(wrapper).toHaveStyle({ '--filter-dropdown-bg': '#dropdown-bg' })
    expect(wrapper).toHaveStyle({ '--filter-dropdown-item-selected': '#selected' })
  })

  it('should generate typography variables', () => {
    const { container } = render(
      <FilterBoxThemeProvider
        theme={{
          typography: {
            fontFamily: 'Arial, sans-serif',
            fontSize: '16px',
            tokenFontWeight: '600',
          },
        }}
      >
        <div>Content</div>
      </FilterBoxThemeProvider>
    )

    const wrapper = container.querySelector('.filter-box-theme-root')
    expect(wrapper).toHaveStyle({ '--filter-font-family': 'Arial, sans-serif' })
    expect(wrapper).toHaveStyle({ '--filter-font-size': '16px' })
  })
})
