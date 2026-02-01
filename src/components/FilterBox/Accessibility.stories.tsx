/**
 * Accessibility Stories
 *
 * Demonstrates accessibility features of the FilterBox component.
 */

import type { Meta, StoryObj } from '@storybook/react'
import { useState } from 'react'
import type { FilterExpression, FilterSchema } from '@/types'
import { FilterBox } from './FilterBox'

const meta = {
  title: 'FilterBox/Accessibility',
  component: FilterBox,
  parameters: {
    layout: 'padded',
    a11y: {
      // axe-core configuration
      config: {
        rules: [
          { id: 'color-contrast', enabled: true },
          { id: 'keyboard-access', enabled: true },
        ],
      },
    },
  },
} satisfies Meta<typeof FilterBox>

export default meta
type Story = StoryObj<typeof meta>

// =============================================================================
// Standard Schema for Accessibility Tests
// =============================================================================

const accessibleSchema: FilterSchema = {
  fields: [
    {
      key: 'status',
      label: 'Status',
      type: 'enum',
      description: 'Filter by the current status of the item',
      operators: [
        { key: 'eq', label: 'is equal to', symbol: '=' },
        { key: 'neq', label: 'is not equal to', symbol: '≠' },
      ],
    },
    {
      key: 'name',
      label: 'Name',
      type: 'string',
      description: 'Filter by the name or title',
      operators: [
        { key: 'eq', label: 'equals', symbol: '=' },
        { key: 'contains', label: 'contains' },
        { key: 'startsWith', label: 'starts with' },
      ],
    },
    {
      key: 'date',
      label: 'Date Created',
      type: 'date',
      description: 'Filter by creation date',
      operators: [
        { key: 'before', label: 'is before' },
        { key: 'after', label: 'is after' },
      ],
    },
  ],
}

// =============================================================================
// Screen Reader Demo
// =============================================================================

export const ScreenReaderDemo: Story = {
  render: () => {
    const [value, setValue] = useState<FilterExpression[]>([])
    return (
      <FilterBox
        schema={accessibleSchema}
        value={value}
        onChange={setValue}
        placeholder="Start typing to filter..."
        aria-label="Filter expressions"
      />
    )
  },
  parameters: {
    docs: {
      description: {
        story: `
This component is designed with screen reader users in mind:

- **ARIA Labels**: All interactive elements have proper ARIA labels
- **Live Regions**: Changes are announced via ARIA live regions
- **Role Attributes**: Proper roles for dropdown, options, and tokens
- **Descriptions**: Field descriptions are available to assistive technology

### Testing with Screen Readers

1. **VoiceOver (Mac)**: Press Cmd+F5 to enable
2. **NVDA (Windows)**: Free screen reader for Windows
3. **JAWS (Windows)**: Commercial screen reader

### Expected Behavior

- Focus on the input announces "Filter expressions, combobox"
- Dropdown options are announced with their labels
- Token creation is announced via live region
- Arrow key navigation announces current selection
        `,
      },
    },
  },
}

// =============================================================================
// Keyboard Only Navigation
// =============================================================================

function KeyboardOnlyComponent() {
  const [expressions, setExpressions] = useState<FilterExpression[]>([])
  const [focusLog, setFocusLog] = useState<string[]>([])

  const logFocus = (element: string) => {
    setFocusLog((prev) => [...prev.slice(-4), `→ ${element}`])
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div>
        <h3 style={{ margin: '0 0 8px' }}>Keyboard Navigation Demo</h3>
        <p style={{ margin: 0, color: '#666', fontSize: '14px' }}>
          Use Tab, Arrow keys, Enter, and Escape to navigate. Focus log below shows your navigation
          path.
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <label htmlFor="before-input">Focus trap start:</label>
        <input
          id="before-input"
          type="text"
          placeholder="Tab from here to FilterBox"
          onFocus={() => logFocus('Before input')}
          style={{ padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
        />
      </div>

      <div onFocus={() => logFocus('FilterBox')}>
        <FilterBox
          schema={accessibleSchema}
          value={expressions}
          onChange={(newExpressions) => {
            setExpressions(newExpressions)
            logFocus('FilterBox (changed)')
          }}
          placeholder="Use keyboard to navigate..."
        />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <label htmlFor="after-input">Focus trap end:</label>
        <input
          id="after-input"
          type="text"
          placeholder="Tab to exit FilterBox here"
          onFocus={() => logFocus('After input')}
          style={{ padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
        />
      </div>

      <div
        style={{
          padding: '12px',
          backgroundColor: '#f5f5f5',
          borderRadius: '8px',
          fontFamily: 'monospace',
          fontSize: '12px',
        }}
      >
        <strong>Focus Log:</strong>
        <br />
        {focusLog.length === 0 ? 'No focus events yet...' : focusLog.join('\n')}
      </div>

      <div
        style={{
          padding: '16px',
          backgroundColor: '#e0f2fe',
          borderRadius: '8px',
          fontSize: '14px',
        }}
      >
        <strong>Keyboard Shortcuts:</strong>
        <ul style={{ margin: '8px 0 0', paddingLeft: '20px' }}>
          <li>
            <kbd>Tab</kbd> - Move focus in/out of FilterBox
          </li>
          <li>
            <kbd>↓</kbd> / <kbd>↑</kbd> - Navigate dropdown items
          </li>
          <li>
            <kbd>Enter</kbd> - Select highlighted item
          </li>
          <li>
            <kbd>Escape</kbd> - Close dropdown / cancel edit
          </li>
          <li>
            <kbd>Backspace</kbd> - Delete last token (when input is empty)
          </li>
          <li>
            <kbd>←</kbd> / <kbd>→</kbd> - Navigate between tokens
          </li>
        </ul>
      </div>
    </div>
  )
}

export const KeyboardOnlyNavigation: Story = {
  render: () => <KeyboardOnlyComponent />,
  parameters: {
    docs: {
      description: {
        story: 'Demonstrates that the FilterBox is fully navigable using only the keyboard.',
      },
    },
  },
}

// =============================================================================
// High Contrast Mode
// =============================================================================

function HighContrastComponent() {
  const [expressions, setExpressions] = useState<FilterExpression[]>([
    {
      condition: {
        field: { key: 'status', label: 'Status', type: 'enum' },
        operator: { key: 'eq', label: 'is equal to', symbol: '=' },
        value: { raw: 'active', display: 'Active', serialized: 'active' },
      },
      connector: 'AND',
    },
    {
      condition: {
        field: { key: 'name', label: 'Name', type: 'string' },
        operator: { key: 'contains', label: 'contains' },
        value: { raw: 'test', display: 'test', serialized: 'test' },
      },
    },
  ])
  const [theme, setTheme] = useState<'default' | 'high-contrast' | 'high-contrast-dark'>(
    'high-contrast'
  )

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
        <button
          onClick={() => setTheme('default')}
          style={{
            padding: '8px 16px',
            backgroundColor: theme === 'default' ? '#2196f3' : '#f0f0f0',
            color: theme === 'default' ? 'white' : 'black',
            border: '2px solid #2196f3',
            borderRadius: '4px',
            cursor: 'pointer',
            fontWeight: 'bold',
          }}
        >
          Default
        </button>
        <button
          onClick={() => setTheme('high-contrast')}
          style={{
            padding: '8px 16px',
            backgroundColor: theme === 'high-contrast' ? '#000066' : '#f0f0f0',
            color: theme === 'high-contrast' ? 'white' : 'black',
            border: '3px solid #000066',
            borderRadius: '4px',
            cursor: 'pointer',
            fontWeight: 'bold',
          }}
        >
          High Contrast
        </button>
        <button
          onClick={() => setTheme('high-contrast-dark')}
          style={{
            padding: '8px 16px',
            backgroundColor: theme === 'high-contrast-dark' ? '#000000' : '#f0f0f0',
            color: theme === 'high-contrast-dark' ? '#00ffff' : 'black',
            border: '3px solid #00ffff',
            borderRadius: '4px',
            cursor: 'pointer',
            fontWeight: 'bold',
          }}
        >
          High Contrast Dark
        </button>
      </div>

      <div
        data-theme={theme !== 'default' ? theme : undefined}
        style={{
          padding: '20px',
          backgroundColor:
            theme === 'high-contrast-dark'
              ? '#000000'
              : theme === 'high-contrast'
                ? '#ffffff'
                : 'transparent',
          borderRadius: '8px',
          border: theme !== 'default' ? '2px solid currentColor' : 'none',
        }}
      >
        <FilterBox
          schema={accessibleSchema}
          value={expressions}
          onChange={setExpressions}
          placeholder="High contrast theme..."
          aria-label="Filter with high contrast support"
        />
      </div>

      <div
        style={{
          padding: '16px',
          backgroundColor: '#f3f4f6',
          borderRadius: '8px',
          fontSize: '14px',
        }}
      >
        <strong>High Contrast Mode Features:</strong>
        <ul style={{ marginTop: '8px', marginLeft: '20px' }}>
          <li>Increased color contrast (meets WCAG AAA 7:1 ratio)</li>
          <li>Thicker borders for better visibility</li>
          <li>Larger text size for improved readability</li>
          <li>Distinct focus indicators</li>
          <li>
            Respects <code>prefers-contrast: more</code> media query
          </li>
        </ul>
      </div>
    </div>
  )
}

export const HighContrastMode: Story = {
  render: () => <HighContrastComponent />,
  parameters: {
    docs: {
      description: {
        story: `
High contrast mode for users with low vision. This theme:

- Uses pure black and white backgrounds  
- Has bright, distinct colors for different token types
- Increases border visibility
- Ensures minimum 7:1 contrast ratio for text
- Supports both light and dark high-contrast variants
- Automatically activates with \`prefers-contrast: more\` media query
        `,
      },
    },
  },
}

// =============================================================================
// Reduced Motion
// =============================================================================

export const ReducedMotion: Story = {
  args: {
    schema: accessibleSchema,
    value: [],
    onChange: () => {},
    placeholder: 'Animations disabled...',
  },
  decorators: [
    (Story) => (
      <div>
        <style>
          {`
            /* Simulate prefers-reduced-motion */
            .reduced-motion-container * {
              animation: none !important;
              transition: none !important;
            }
          `}
        </style>
        <div className="reduced-motion-container">
          <Story />
        </div>
        <div
          style={{
            marginTop: '16px',
            padding: '12px',
            backgroundColor: '#fef3c7',
            borderRadius: '8px',
            fontSize: '14px',
          }}
        >
          <strong>Reduced Motion Mode:</strong> All animations and transitions are disabled for
          users who prefer reduced motion. The component respects the{' '}
          <code>prefers-reduced-motion</code> media query.
        </div>
      </div>
    ),
  ],
  parameters: {
    docs: {
      description: {
        story:
          'Demonstrates the FilterBox with all animations disabled for users who prefer reduced motion.',
      },
    },
  },
}

// =============================================================================
// Large Text / Zoom
// =============================================================================

export const LargeTextZoom: Story = {
  args: {
    schema: accessibleSchema,
    value: [
      {
        condition: {
          field: { key: 'status', label: 'Status', type: 'enum' },
          operator: { key: 'eq', label: 'is equal to', symbol: '=' },
          value: { raw: 'active', display: 'Active', serialized: 'active' },
        },
      },
    ],
    onChange: () => {},
    placeholder: 'Large text mode...',
  },
  decorators: [
    (Story) => (
      <div style={{ fontSize: '24px' }}>
        <style>
          {`
            .large-text-demo {
              --filter-font-size: 1.5em;
              --filter-token-padding: 8px 16px;
              --filter-container-padding: 16px;
            }
          `}
        </style>
        <div className="large-text-demo">
          <Story />
        </div>
        <div
          style={{
            marginTop: '16px',
            padding: '12px',
            backgroundColor: '#e0e7ff',
            borderRadius: '8px',
            fontSize: '14px',
          }}
        >
          <strong>Large Text Mode:</strong> The component scales properly when browser zoom is
          increased or when users have configured larger system fonts. All text remains readable and
          layout adapts accordingly.
        </div>
      </div>
    ),
  ],
  parameters: {
    docs: {
      description: {
        story: 'Shows that the FilterBox scales properly with increased font sizes (200% zoom).',
      },
    },
  },
}

// =============================================================================
// Focus Indicators
// =============================================================================

function FocusIndicatorsComponent() {
  const [expressions, setExpressions] = useState<FilterExpression[]>([
    {
      condition: {
        field: { key: 'status', label: 'Status', type: 'enum' },
        operator: { key: 'eq', label: 'is equal to', symbol: '=' },
        value: { raw: 'active', display: 'Active', serialized: 'active' },
      },
      connector: 'AND',
    },
    {
      condition: {
        field: { key: 'name', label: 'Name', type: 'string' },
        operator: { key: 'contains', label: 'contains' },
        value: { raw: 'test', display: 'test', serialized: 'test' },
      },
    },
  ])

  return (
    <div>
      <style>
        {`
          .focus-visible-demo :focus {
            outline: 3px solid #2563eb !important;
            outline-offset: 2px !important;
          }
          
          .focus-visible-demo :focus:not(:focus-visible) {
            outline: none !important;
          }
          
          .focus-visible-demo :focus-visible {
            outline: 3px solid #2563eb !important;
            outline-offset: 2px !important;
          }
        `}
      </style>
      <div className="focus-visible-demo">
        <FilterBox
          schema={accessibleSchema}
          value={expressions}
          onChange={setExpressions}
          placeholder="Tab to see focus indicators..."
        />
      </div>
      <div
        style={{
          marginTop: '16px',
          padding: '12px',
          backgroundColor: '#dbeafe',
          borderRadius: '8px',
          fontSize: '14px',
        }}
      >
        <strong>Focus Indicators:</strong> Visible focus rings appear on all interactive elements
        when navigating with the keyboard. Focus indicators are hidden for mouse users (using{' '}
        <code>:focus-visible</code>).
      </div>
    </div>
  )
}

export const FocusIndicators: Story = {
  render: () => <FocusIndicatorsComponent />,
  parameters: {
    docs: {
      description: {
        story:
          'Demonstrates clear focus indicators for keyboard navigation. All interactive elements have visible focus states.',
      },
    },
  },
}

// =============================================================================
// ARIA Live Announcements
// =============================================================================

function AriaLiveComponent() {
  const [expressions, setExpressions] = useState<FilterExpression[]>([])
  const [announcements, setAnnouncements] = useState<string[]>([])

  const handleChange = (newExpressions: FilterExpression[]) => {
    if (newExpressions.length > expressions.length) {
      const lastExpr = newExpressions[newExpressions.length - 1]
      setAnnouncements((prev) => [
        ...prev.slice(-4),
        `Added filter: ${lastExpr.condition.field.label} ${lastExpr.condition.operator.label} ${lastExpr.condition.value.display}`,
      ])
    } else if (newExpressions.length < expressions.length) {
      setAnnouncements((prev) => [...prev.slice(-4), 'Filter removed'])
    }
    setExpressions(newExpressions)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <FilterBox
        schema={accessibleSchema}
        value={expressions}
        onChange={handleChange}
        placeholder="Add filters to see announcements..."
      />

      <div
        style={{
          padding: '16px',
          backgroundColor: '#f3f4f6',
          borderRadius: '8px',
        }}
      >
        <strong>Screen Reader Announcements Log:</strong>
        <div
          style={{
            marginTop: '8px',
            fontFamily: 'monospace',
            fontSize: '13px',
            color: '#374151',
          }}
        >
          {announcements.length === 0 ? (
            <em>Add or remove filters to see announcements...</em>
          ) : (
            announcements.map((a, i) => <div key={i}>📢 {a}</div>)
          )}
        </div>
      </div>

      <div
        style={{
          padding: '12px',
          backgroundColor: '#ecfdf5',
          borderRadius: '8px',
          fontSize: '14px',
        }}
      >
        <strong>ARIA Live Regions:</strong> Changes to the filter expressions are announced to
        screen readers via ARIA live regions. This ensures users are informed of dynamic content
        changes.
      </div>
    </div>
  )
}

export const AriaLiveAnnouncements: Story = {
  render: () => <AriaLiveComponent />,
  parameters: {
    docs: {
      description: {
        story: 'Demonstrates ARIA live region announcements when filters are added or removed.',
      },
    },
  },
}
