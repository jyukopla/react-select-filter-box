import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'
import { FilterBox } from './FilterBox'
import type { FilterSchema, FilterExpression } from '@/types'
import { getDefaultOperators } from '@/types'
import { FilterBoxThemeProvider, themes, createTheme, mergeThemes } from '@/theme'

const meta = {
  title: 'Components/FilterBox/Theming',
  component: FilterBox,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: 'Examples demonstrating theming capabilities and CSS custom property overrides.',
      },
    },
  },
  tags: ['autodocs'],
} satisfies Meta<typeof FilterBox>

export default meta
type Story = StoryObj<typeof meta>

// Sample schema for all stories
const sampleSchema: FilterSchema = {
  fields: [
    {
      key: 'status',
      label: 'Status',
      type: 'enum',
      operators: [{ key: 'eq', label: 'is', symbol: '=' }],
    },
    {
      key: 'name',
      label: 'Name',
      type: 'string',
      operators: getDefaultOperators('string').slice(0, 2),
    },
    {
      key: 'priority',
      label: 'Priority',
      type: 'enum',
      operators: [{ key: 'eq', label: 'is', symbol: '=' }],
    },
    {
      key: 'date',
      label: 'Date',
      type: 'date',
      operators: [{ key: 'after', label: 'after' }],
    },
  ],
}

const sampleExpressions: FilterExpression[] = [
  {
    condition: {
      field: { key: 'status', label: 'Status', type: 'enum' },
      operator: { key: 'eq', label: 'is', symbol: '=' },
      value: { raw: 'active', display: 'Active', serialized: 'active' },
    },
    connector: 'AND',
  },
  {
    condition: {
      field: { key: 'name', label: 'Name', type: 'string' },
      operator: { key: 'contains', label: 'contains' },
      value: { raw: 'John', display: 'John', serialized: 'John' },
    },
  },
]

// =============================================================================
// Built-in Themes
// =============================================================================

function ThemeShowcase({ 
  themeName, 
  bgColor,
  textColor = '#333',
}: { 
  themeName: 'light' | 'dark' | 'highContrast'
  bgColor: string
  textColor?: string
}) {
  const [value, setValue] = useState<FilterExpression[]>(sampleExpressions)
  const theme = themes[themeName]

  return (
    <div style={{ padding: '1.5rem', backgroundColor: bgColor, borderRadius: '8px', color: textColor }}>
      <h4 style={{ margin: '0 0 1rem 0', fontSize: '16px' }}>
        {themeName.charAt(0).toUpperCase() + themeName.slice(1)} Theme
      </h4>
      <FilterBoxThemeProvider theme={theme}>
        <FilterBox schema={sampleSchema} value={value} onChange={setValue} />
      </FilterBoxThemeProvider>
    </div>
  )
}

export const LightTheme: Story = {
  render: () => <ThemeShowcase themeName="light" bgColor="#ffffff" />,
  parameters: {
    docs: {
      description: {
        story: 'The default light theme with clean, professional colors.',
      },
    },
  },
}

export const DarkTheme: Story = {
  render: () => <ThemeShowcase themeName="dark" bgColor="#1e1e1e" textColor="#e0e0e0" />,
  parameters: {
    backgrounds: { default: 'dark' },
    docs: {
      description: {
        story: 'Dark theme suitable for dark mode interfaces.',
      },
    },
  },
}

export const HighContrastTheme: Story = {
  render: () => <ThemeShowcase themeName="highContrast" bgColor="#000000" textColor="#ffffff" />,
  parameters: {
    backgrounds: { default: 'dark' },
    docs: {
      description: {
        story: 'High contrast theme for improved accessibility.',
      },
    },
  },
}

// =============================================================================
// All Themes Side by Side
// =============================================================================

function AllThemesComparisonComponent() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <ThemeShowcase themeName="light" bgColor="#ffffff" />
      <ThemeShowcase themeName="dark" bgColor="#1e1e1e" textColor="#e0e0e0" />
      <ThemeShowcase themeName="highContrast" bgColor="#000000" textColor="#ffffff" />
    </div>
  )
}

export const AllThemesComparison: Story = {
  render: () => <AllThemesComparisonComponent />,
  parameters: {
    docs: {
      description: {
        story: 'Side-by-side comparison of all built-in themes.',
      },
    },
  },
}

// =============================================================================
// Custom Theme with createTheme
// =============================================================================

function CustomThemeExample() {
  const [value, setValue] = useState<FilterExpression[]>(sampleExpressions)

  // Create a custom corporate theme based on light
  const corporateTheme = createTheme(themes.light, {
    tokens: {
      fieldBg: '#e8f4f8',
      fieldBorder: '#0078d4',
      fieldText: '#0078d4',
      operatorBg: '#fef3e2',
      operatorBorder: '#d97706',
      operatorText: '#92400e',
      valueBg: '#f0fdf4',
      valueBorder: '#16a34a',
      valueText: '#166534',
      connectorBg: '#fef2f2',
      connectorBorder: '#dc2626',
      connectorText: '#991b1b',
      borderRadius: '20px',
    },
    container: {
      bg: '#fafafa',
      border: '#d1d5db',
      borderFocus: '#0078d4',
    },
  })

  return (
    <div style={{ maxWidth: '650px' }}>
      <h4 style={{ margin: '0 0 0.5rem 0' }}>Corporate Blue Theme</h4>
      <p style={{ marginBottom: '1rem', color: '#666', fontSize: '14px' }}>
        Custom theme with brand colors and pill-shaped tokens (20px radius).
      </p>
      <FilterBoxThemeProvider theme={corporateTheme}>
        <FilterBox schema={sampleSchema} value={value} onChange={setValue} />
      </FilterBoxThemeProvider>
      <pre style={{ marginTop: '1rem', fontSize: '11px', background: '#f5f5f5', padding: '1rem', borderRadius: '4px', overflow: 'auto' }}>
{`const corporateTheme = createTheme(themes.light, {
  tokens: {
    fieldBg: '#e8f4f8',
    fieldBorder: '#0078d4',
    fieldText: '#0078d4',
    borderRadius: '20px',
  },
  container: {
    borderFocus: '#0078d4',
  },
})`}
      </pre>
    </div>
  )
}

export const CustomCorporateTheme: Story = {
  render: () => <CustomThemeExample />,
  parameters: {
    docs: {
      description: {
        story: 'Creating a custom theme with brand colors using createTheme().',
      },
    },
  },
}

// =============================================================================
// Monochrome Theme
// =============================================================================

function MonochromeThemeExample() {
  const [value, setValue] = useState<FilterExpression[]>(sampleExpressions)

  const monochromeTheme = createTheme(themes.light, {
    tokens: {
      fieldBg: '#f3f4f6',
      fieldBorder: '#6b7280',
      fieldText: '#374151',
      operatorBg: '#e5e7eb',
      operatorBorder: '#6b7280',
      operatorText: '#374151',
      valueBg: '#d1d5db',
      valueBorder: '#6b7280',
      valueText: '#1f2937',
      connectorBg: '#9ca3af',
      connectorBorder: '#6b7280',
      connectorText: '#1f2937',
      borderRadius: '4px',
    },
    container: {
      bg: '#ffffff',
      border: '#9ca3af',
      borderFocus: '#374151',
    },
  })

  return (
    <div style={{ maxWidth: '650px' }}>
      <h4 style={{ margin: '0 0 0.5rem 0' }}>Monochrome Theme</h4>
      <p style={{ marginBottom: '1rem', color: '#666', fontSize: '14px' }}>
        Grayscale theme for minimalist or print-friendly interfaces.
      </p>
      <FilterBoxThemeProvider theme={monochromeTheme}>
        <FilterBox schema={sampleSchema} value={value} onChange={setValue} />
      </FilterBoxThemeProvider>
    </div>
  )
}

export const MonochromeTheme: Story = {
  render: () => <MonochromeThemeExample />,
  parameters: {
    docs: {
      description: {
        story: 'Monochrome grayscale theme for minimalist designs.',
      },
    },
  },
}

// =============================================================================
// Pastel Theme
// =============================================================================

function PastelThemeExample() {
  const [value, setValue] = useState<FilterExpression[]>(sampleExpressions)

  const pastelTheme = createTheme(themes.light, {
    tokens: {
      fieldBg: '#dbeafe',
      fieldBorder: '#93c5fd',
      fieldText: '#1e40af',
      operatorBg: '#fce7f3',
      operatorBorder: '#f9a8d4',
      operatorText: '#9d174d',
      valueBg: '#dcfce7',
      valueBorder: '#86efac',
      valueText: '#166534',
      connectorBg: '#fef3c7',
      connectorBorder: '#fcd34d',
      connectorText: '#92400e',
      borderRadius: '8px',
    },
    container: {
      bg: '#fefefe',
      border: '#e5e7eb',
      borderFocus: '#93c5fd',
    },
  })

  return (
    <div style={{ maxWidth: '650px' }}>
      <h4 style={{ margin: '0 0 0.5rem 0' }}>Pastel Theme</h4>
      <p style={{ marginBottom: '1rem', color: '#666', fontSize: '14px' }}>
        Soft pastel colors for a friendly, approachable look.
      </p>
      <FilterBoxThemeProvider theme={pastelTheme}>
        <FilterBox schema={sampleSchema} value={value} onChange={setValue} />
      </FilterBoxThemeProvider>
    </div>
  )
}

export const PastelTheme: Story = {
  render: () => <PastelThemeExample />,
  parameters: {
    docs: {
      description: {
        story: 'Soft pastel color theme for friendly interfaces.',
      },
    },
  },
}

// =============================================================================
// Token Color Customization
// =============================================================================

function TokenColorCustomization() {
  const [value, setValue] = useState<FilterExpression[]>(sampleExpressions)

  // Theme that emphasizes the difference between token types
  const distinctTokensTheme = createTheme(themes.light, {
    tokens: {
      // Field tokens: Purple
      fieldBg: '#f3e8ff',
      fieldBorder: '#a855f7',
      fieldText: '#7c3aed',
      // Operator tokens: Cyan
      operatorBg: '#ecfeff',
      operatorBorder: '#22d3d1',
      operatorText: '#0891b2',
      // Value tokens: Amber
      valueBg: '#fffbeb',
      valueBorder: '#f59e0b',
      valueText: '#b45309',
      // Connector tokens: Red
      connectorBg: '#fef2f2',
      connectorBorder: '#f87171',
      connectorText: '#dc2626',
    },
  })

  return (
    <div style={{ maxWidth: '650px' }}>
      <h4 style={{ margin: '0 0 0.5rem 0' }}>Distinct Token Colors</h4>
      <p style={{ marginBottom: '1rem', color: '#666', fontSize: '14px' }}>
        Each token type uses a highly distinct color for clear visual differentiation:
      </p>
      <ul style={{ marginBottom: '1rem', fontSize: '14px', color: '#666', lineHeight: 1.8 }}>
        <li><span style={{ color: '#7c3aed', fontWeight: 500 }}>■ Fields</span> – Purple</li>
        <li><span style={{ color: '#0891b2', fontWeight: 500 }}>■ Operators</span> – Cyan</li>
        <li><span style={{ color: '#b45309', fontWeight: 500 }}>■ Values</span> – Amber</li>
        <li><span style={{ color: '#dc2626', fontWeight: 500 }}>■ Connectors</span> – Red</li>
      </ul>
      <FilterBoxThemeProvider theme={distinctTokensTheme}>
        <FilterBox schema={sampleSchema} value={value} onChange={setValue} />
      </FilterBoxThemeProvider>
    </div>
  )
}

export const DistinctTokenColors: Story = {
  render: () => <TokenColorCustomization />,
  parameters: {
    docs: {
      description: {
        story: 'Highly distinct colors for each token type for maximum visual clarity.',
      },
    },
  },
}

// =============================================================================
// CSS Custom Properties Override
// =============================================================================

function CSSVariablesExample() {
  const [value, setValue] = useState<FilterExpression[]>(sampleExpressions)

  return (
    <div style={{ maxWidth: '650px' }}>
      <h4 style={{ margin: '0 0 0.5rem 0' }}>CSS Custom Properties Override</h4>
      <p style={{ marginBottom: '1rem', color: '#666', fontSize: '14px' }}>
        You can override theme variables directly via CSS custom properties on a container.
      </p>
      <div
        style={{
          // Using inline style to demonstrate CSS variable overrides
          // In real usage, this would be in a CSS file
          '--filter-token-field-bg': '#fef9c3',
          '--filter-token-field-border': '#ca8a04',
          '--filter-token-field-text': '#854d0e',
          '--filter-token-radius': '0px',
          '--filter-container-border-focus': '#ca8a04',
        } as React.CSSProperties}
      >
        <FilterBox schema={sampleSchema} value={value} onChange={setValue} />
      </div>
      <pre style={{ marginTop: '1rem', fontSize: '11px', background: '#f5f5f5', padding: '1rem', borderRadius: '4px', overflow: 'auto' }}>
{`.my-container {
  --filter-token-field-bg: #fef9c3;
  --filter-token-field-border: #ca8a04;
  --filter-token-field-text: #854d0e;
  --filter-token-radius: 0px;
  --filter-container-border-focus: #ca8a04;
}`}
      </pre>
    </div>
  )
}

export const CSSVariablesOverride: Story = {
  render: () => <CSSVariablesExample />,
  parameters: {
    docs: {
      description: {
        story: 'Override theme using CSS custom properties directly on container elements.',
      },
    },
  },
}

// =============================================================================
// Theme Switching
// =============================================================================

function ThemeSwitcher() {
  const [value, setValue] = useState<FilterExpression[]>(sampleExpressions)
  const [themeName, setThemeName] = useState<'light' | 'dark' | 'highContrast'>('light')

  const bgColors = {
    light: '#ffffff',
    dark: '#1e1e1e',
    highContrast: '#000000',
  }

  const textColors = {
    light: '#333333',
    dark: '#e0e0e0',
    highContrast: '#ffffff',
  }

  return (
    <div style={{ maxWidth: '650px' }}>
      <h4 style={{ margin: '0 0 0.5rem 0' }}>Dynamic Theme Switching</h4>
      <p style={{ marginBottom: '1rem', color: '#666', fontSize: '14px' }}>
        Switch between themes at runtime using the theme provider.
      </p>
      <div style={{ marginBottom: '1rem', display: 'flex', gap: '0.5rem' }}>
        <button
          onClick={() => setThemeName('light')}
          style={{
            padding: '0.5rem 1rem',
            cursor: 'pointer',
            background: themeName === 'light' ? '#2196f3' : '#e0e0e0',
            color: themeName === 'light' ? '#fff' : '#333',
            border: 'none',
            borderRadius: '4px',
          }}
        >
          Light
        </button>
        <button
          onClick={() => setThemeName('dark')}
          style={{
            padding: '0.5rem 1rem',
            cursor: 'pointer',
            background: themeName === 'dark' ? '#2196f3' : '#e0e0e0',
            color: themeName === 'dark' ? '#fff' : '#333',
            border: 'none',
            borderRadius: '4px',
          }}
        >
          Dark
        </button>
        <button
          onClick={() => setThemeName('highContrast')}
          style={{
            padding: '0.5rem 1rem',
            cursor: 'pointer',
            background: themeName === 'highContrast' ? '#2196f3' : '#e0e0e0',
            color: themeName === 'highContrast' ? '#fff' : '#333',
            border: 'none',
            borderRadius: '4px',
          }}
        >
          High Contrast
        </button>
      </div>
      <div style={{ 
        padding: '1.5rem', 
        backgroundColor: bgColors[themeName], 
        borderRadius: '8px',
        color: textColors[themeName],
        transition: 'background-color 0.3s, color 0.3s',
      }}>
        <FilterBoxThemeProvider theme={themes[themeName]}>
          <FilterBox schema={sampleSchema} value={value} onChange={setValue} />
        </FilterBoxThemeProvider>
      </div>
    </div>
  )
}

export const ThemeSwitching: Story = {
  render: () => <ThemeSwitcher />,
  parameters: {
    docs: {
      description: {
        story: 'Dynamic theme switching at runtime.',
      },
    },
  },
}

// =============================================================================
// Merging Themes
// =============================================================================

function MergedThemeExample() {
  const [value, setValue] = useState<FilterExpression[]>(sampleExpressions)

  // Merge multiple theme configurations
  const baseModifications = {
    tokens: {
      borderRadius: '12px',
    },
  }

  const colorModifications = {
    tokens: {
      fieldBg: '#e0f2fe',
      fieldBorder: '#0284c7',
      fieldText: '#0369a1',
    },
  }

  const mergedTheme = mergeThemes(themes.light, baseModifications, colorModifications)

  return (
    <div style={{ maxWidth: '650px' }}>
      <h4 style={{ margin: '0 0 0.5rem 0' }}>Merged Themes</h4>
      <p style={{ marginBottom: '1rem', color: '#666', fontSize: '14px' }}>
        Combine multiple theme modifications using mergeThemes().
      </p>
      <FilterBoxThemeProvider theme={mergedTheme}>
        <FilterBox schema={sampleSchema} value={value} onChange={setValue} />
      </FilterBoxThemeProvider>
      <pre style={{ marginTop: '1rem', fontSize: '11px', background: '#f5f5f5', padding: '1rem', borderRadius: '4px', overflow: 'auto' }}>
{`const mergedTheme = mergeThemes(
  themes.light,
  { tokens: { borderRadius: '12px' } },
  { tokens: { fieldBg: '#e0f2fe', fieldBorder: '#0284c7' } }
)`}
      </pre>
    </div>
  )
}

export const MergedThemes: Story = {
  render: () => <MergedThemeExample />,
  parameters: {
    docs: {
      description: {
        story: 'Combining multiple theme modifications with mergeThemes().',
      },
    },
  },
}

// =============================================================================
// Compact vs Comfortable Spacing
// =============================================================================

function SpacingVariantsExample() {
  const [value, setValue] = useState<FilterExpression[]>(sampleExpressions)

  const compactTheme = createTheme(themes.light, {
    tokens: {
      padding: '2px 6px',
      gap: '2px',
      fontSize: '12px',
    },
    container: {
      padding: '4px',
    },
  })

  const comfortableTheme = createTheme(themes.light, {
    tokens: {
      padding: '8px 16px',
      gap: '8px',
      fontSize: '16px',
    },
    container: {
      padding: '12px',
    },
  })

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', maxWidth: '650px' }}>
      <div>
        <h4 style={{ margin: '0 0 0.5rem 0' }}>Compact Spacing</h4>
        <p style={{ marginBottom: '1rem', color: '#666', fontSize: '14px' }}>
          Reduced padding and font size for dense UIs.
        </p>
        <FilterBoxThemeProvider theme={compactTheme}>
          <FilterBox schema={sampleSchema} value={value} onChange={setValue} />
        </FilterBoxThemeProvider>
      </div>

      <div>
        <h4 style={{ margin: '0 0 0.5rem 0' }}>Comfortable Spacing</h4>
        <p style={{ marginBottom: '1rem', color: '#666', fontSize: '14px' }}>
          Increased padding and font size for touch-friendly or relaxed UIs.
        </p>
        <FilterBoxThemeProvider theme={comfortableTheme}>
          <FilterBox schema={sampleSchema} value={value} onChange={setValue} />
        </FilterBoxThemeProvider>
      </div>
    </div>
  )
}

export const SpacingVariants: Story = {
  render: () => <SpacingVariantsExample />,
  parameters: {
    docs: {
      description: {
        story: 'Compact and comfortable spacing variants through theming.',
      },
    },
  },
}
