# Theming Guide

This guide explains how to customize the appearance of the React Sequential Filter Box.

## Overview

The FilterBox uses CSS Custom Properties (CSS Variables) for theming, making it easy to customize colors, spacing, and other visual properties without modifying the source code.

## Quick Start

### Method 1: CSS Custom Properties

Override CSS variables in your stylesheet:

```css
:root {
  /* Change the primary accent color */
  --filter-container-border-focus: #9c27b0;
  --filter-focus-ring-color: rgba(156, 39, 176, 0.4);

  /* Change token colors */
  --filter-token-field-bg: #f3e5f5;
  --filter-token-field-border: #9c27b0;
  --filter-token-field-text: #6a1b9a;
}
```

### Method 2: ThemeProvider Component

Use the built-in ThemeProvider for programmatic theming:

```tsx
import { FilterBox, ThemeProvider } from 'react-select-filter-box'

function App() {
  return (
    <ThemeProvider
      theme={{
        tokens: {
          fieldBg: '#f3e5f5',
          fieldBorder: '#9c27b0',
          fieldText: '#6a1b9a',
        },
        container: {
          borderFocus: '#9c27b0',
        },
      }}
    >
      <FilterBox schema={schema} value={value} onChange={onChange} />
    </ThemeProvider>
  )
}
```

## CSS Custom Properties Reference

### Token Colors

Each token type (field, operator, value, connector) has three color properties:

```css
:root {
  /* Field tokens (blue by default) */
  --filter-token-field-bg: #e3f2fd;
  --filter-token-field-border: #1976d2;
  --filter-token-field-text: #0d47a1;

  /* Operator tokens (pink by default) */
  --filter-token-operator-bg: #fce4ec;
  --filter-token-operator-border: #c2185b;
  --filter-token-operator-text: #880e4f;

  /* Value tokens (green by default) */
  --filter-token-value-bg: #e8f5e9;
  --filter-token-value-border: #388e3c;
  --filter-token-value-text: #1b5e20;

  /* Connector tokens (orange by default) */
  --filter-token-connector-bg: #fff3e0;
  --filter-token-connector-border: #ef6c00;
  --filter-token-connector-text: #bf360c;
}
```

### Container Styles

```css
:root {
  --filter-container-bg: #ffffff;
  --filter-container-border: #bdbdbd;
  --filter-container-border-focus: #1976d2;
  --filter-container-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  --filter-container-radius: 6px;
  --filter-container-padding: 8px;
}
```

### Dropdown Styles

```css
:root {
  --filter-dropdown-bg: #ffffff;
  --filter-dropdown-border: #bdbdbd;
  --filter-dropdown-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  --filter-dropdown-item-hover: #f5f5f5;
  --filter-dropdown-item-selected: #e3f2fd;
  --filter-dropdown-radius: 6px;
  --filter-dropdown-max-height: 300px;
}
```

### Input Styles

```css
:root {
  --filter-input-bg: transparent;
  --filter-input-text: #212121;
  --filter-input-placeholder: #616161;
}
```

### Spacing

```css
:root {
  --filter-token-gap: 4px;
  --filter-token-padding-x: 8px;
  --filter-token-padding-y: 4px;
  --filter-token-radius: 4px;
}
```

### Typography

```css
:root {
  --filter-font-family: system-ui, -apple-system, sans-serif;
  --filter-font-size: 14px;
  --filter-font-size-small: 12px;
  --filter-token-font-weight: 500;
  --filter-line-height: 1.5;
}
```

### Focus & Selection

```css
:root {
  --filter-focus-ring-color: rgba(25, 118, 210, 0.5);
  --filter-focus-ring-width: 3px;
  --filter-token-selected-ring: #1976d2;
}
```

### Transitions

```css
:root {
  --filter-transition-fast: 150ms ease;
  --filter-transition-normal: 200ms ease;
}
```

### Touch Targets

```css
:root {
  --filter-touch-target-size: 44px;
  --filter-touch-target-spacing: 8px;
}
```

## Theme Presets

### Dark Theme

```css
/* Apply to a container or use media query */
.dark-theme,
@media (prefers-color-scheme: dark) {
  --filter-token-field-bg: #1e3a5f;
  --filter-token-field-border: #64b5f6;
  --filter-token-field-text: #bbdefb;

  --filter-token-operator-bg: #4a1942;
  --filter-token-operator-border: #f48fb1;
  --filter-token-operator-text: #fce4ec;

  --filter-token-value-bg: #1b4332;
  --filter-token-value-border: #81c784;
  --filter-token-value-text: #c8e6c9;

  --filter-token-connector-bg: #4a2c00;
  --filter-token-connector-border: #ffb74d;
  --filter-token-connector-text: #ffe0b2;

  --filter-container-bg: #1e1e1e;
  --filter-container-border: #424242;
  --filter-container-border-focus: #64b5f6;

  --filter-dropdown-bg: #2d2d2d;
  --filter-dropdown-border: #424242;
  --filter-dropdown-item-hover: #3d3d3d;
  --filter-dropdown-item-selected: #1e3a5f;

  --filter-input-text: #e0e0e0;
  --filter-input-placeholder: #9e9e9e;
}
```

### High Contrast Theme

```css
/* For users who need higher contrast */
@media (prefers-contrast: high) {
  --filter-token-field-bg: #000000;
  --filter-token-field-border: #ffffff;
  --filter-token-field-text: #ffffff;

  --filter-container-border: #000000;
  --filter-container-border-focus: #0000ff;

  --filter-focus-ring-color: #ffff00;
  --filter-focus-ring-width: 4px;
}
```

## ThemeProvider API

### Theme Interface

```typescript
interface FilterBoxTheme {
  tokens?: {
    fieldBg?: string
    fieldBorder?: string
    fieldText?: string
    operatorBg?: string
    operatorBorder?: string
    operatorText?: string
    valueBg?: string
    valueBorder?: string
    valueText?: string
    connectorBg?: string
    connectorBorder?: string
    connectorText?: string
    gap?: string
    padding?: string
    borderRadius?: string
  }
  container?: {
    bg?: string
    border?: string
    borderFocus?: string
    shadow?: string
    padding?: string
  }
  dropdown?: {
    bg?: string
    border?: string
    shadow?: string
    itemHover?: string
    itemSelected?: string
  }
  input?: {
    bg?: string
    text?: string
    placeholder?: string
  }
}
```

### Using ThemeProvider

```tsx
import { ThemeProvider, type FilterBoxTheme } from 'react-select-filter-box'

const purpleTheme: FilterBoxTheme = {
  tokens: {
    fieldBg: '#f3e5f5',
    fieldBorder: '#9c27b0',
    fieldText: '#6a1b9a',
  },
  container: {
    borderFocus: '#9c27b0',
  },
}

function App() {
  const [isDark, setIsDark] = useState(false)

  const theme = isDark ? darkTheme : lightTheme

  return (
    <ThemeProvider theme={theme}>
      <FilterBox {...props} />
    </ThemeProvider>
  )
}
```

### Nested Themes

ThemeProvider supports nesting for different sections:

```tsx
<ThemeProvider theme={globalTheme}>
  <FilterBox {...props} /> {/* Uses globalTheme */}
  <ThemeProvider theme={specialTheme}>
    <FilterBox {...props} /> {/* Uses specialTheme */}
  </ThemeProvider>
</ThemeProvider>
```

## Field-Level Styling

Override colors for specific fields:

```typescript
const schema: FilterSchema = {
  fields: [
    {
      key: 'priority',
      label: 'Priority',
      type: 'enum',
      color: '#f44336', // Custom field color
      // ...
    },
  ],
}
```

## Custom Token Variants

Create styled token variants using the StyledToken component:

```tsx
import { StyledToken } from 'react-select-filter-box'

// Use pre-built variants
<StyledToken variant="primary" data={tokenData} />
<StyledToken variant="success" data={tokenData} />
<StyledToken variant="warning" data={tokenData} />
<StyledToken variant="danger" data={tokenData} />

// Or define custom variants
const customVariants = {
  critical: {
    bg: '#b71c1c',
    border: '#f44336',
    text: '#ffffff',
  },
}

<StyledToken variant="critical" customVariants={customVariants} data={tokenData} />
```

## Responsive Theming

Adjust styling based on viewport:

```css
:root {
  --filter-font-size: 14px;
  --filter-token-padding-x: 8px;
}

@media (max-width: 768px) {
  :root {
    --filter-font-size: 16px; /* Larger on mobile for readability */
    --filter-token-padding-x: 12px;
    --filter-touch-target-size: 48px; /* Larger touch targets */
  }
}
```

## Reduced Motion

The component respects `prefers-reduced-motion`:

```css
@media (prefers-reduced-motion: reduce) {
  :root {
    --filter-transition-fast: 0ms;
    --filter-transition-normal: 0ms;
  }

  .token {
    animation: none;
  }
}
```

## Integration with Design Systems

### Material UI

```tsx
import { useTheme } from '@mui/material/styles'

function ThemedFilterBox() {
  const muiTheme = useTheme()

  const theme: FilterBoxTheme = {
    tokens: {
      fieldBg: muiTheme.palette.primary.light,
      fieldBorder: muiTheme.palette.primary.main,
      fieldText: muiTheme.palette.primary.contrastText,
    },
    container: {
      borderFocus: muiTheme.palette.primary.main,
    },
  }

  return (
    <ThemeProvider theme={theme}>
      <FilterBox {...props} />
    </ThemeProvider>
  )
}
```

### Tailwind CSS

Use Tailwind's colors with CSS variables:

```css
:root {
  --filter-token-field-bg: theme('colors.blue.100');
  --filter-token-field-border: theme('colors.blue.500');
  --filter-token-field-text: theme('colors.blue.900');
}
```

## Accessibility Considerations

When customizing colors, ensure WCAG compliance:

1. **Text Contrast**: Minimum 4.5:1 ratio for normal text
2. **Large Text**: Minimum 3:1 ratio for 18px+ or 14px bold
3. **UI Components**: Minimum 3:1 ratio for focus indicators

Use tools like [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/) to verify your color choices.

## Next Steps

- [Schema Definition Guide](./schema-definition.md)
- [Custom Autocompleters Guide](./custom-autocompleters.md)
- [Testing Guide](./testing.md)
