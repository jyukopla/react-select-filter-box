# Visual Regression Testing with Chromatic

This document describes how to set up and use visual regression testing with Chromatic for the FilterBox component library.

## Prerequisites

1. A Chromatic account at [chromatic.com](https://www.chromatic.com/)
2. A project token from Chromatic

## Setup

### 1. Install Chromatic CLI

Chromatic is already configured in this project. The CLI is included as a dev dependency.

```bash
npm install --save-dev chromatic
```

### 2. Get Project Token

1. Sign up at [chromatic.com](https://www.chromatic.com/)
2. Create a new project or link to this repository
3. Copy the project token from the project settings

### 3. Set Environment Variable

Set the Chromatic project token as an environment variable:

```bash
export CHROMATIC_PROJECT_TOKEN=your-token-here
```

Or create a `.env.local` file (not committed to git):

```
CHROMATIC_PROJECT_TOKEN=your-token-here
```

## Running Visual Tests

### Manual Run

```bash
npm run chromatic
```

This will:
1. Build Storybook
2. Upload snapshots to Chromatic
3. Compare with the baseline
4. Report any visual changes

### CI/CD Integration

The GitHub Actions workflow includes Chromatic visual testing. On every PR:
1. Storybook is built
2. Snapshots are uploaded to Chromatic
3. Visual changes are flagged for review

## Key Component States

The following states are captured for visual regression testing:

### FilterBox Component
- Empty state
- With placeholder
- Single expression
- Multiple expressions
- Focused state
- Disabled state
- Error state
- With dropdown open
- Token selection
- Token editing

### Token Component
- Field token (different types)
- Operator token
- Value token
- Connector token
- Selected state
- Hover state
- Pending state

### AutocompleteDropdown
- With items
- With grouped items
- With descriptions
- Highlighted item
- Empty state
- Loading state

### Themes
- Light theme
- Dark theme
- Custom theme

## Reviewing Changes

When Chromatic detects visual changes:

1. Open the Chromatic link in the PR comment
2. Review each changed component
3. Accept changes that are intentional
4. Deny changes that are regressions

## Best Practices

### Writing Stories for Visual Testing

1. **Stable Viewport**: Use consistent viewport sizes
2. **No Animations**: Disable animations in Chromatic builds
3. **Deterministic Content**: Avoid random or time-based content
4. **Loading States**: Handle async content properly

### Story Parameters

```tsx
export const Default: Story = {
  parameters: {
    // Skip Chromatic for this story
    chromatic: { disableSnapshot: true },
  },
}

export const Responsive: Story = {
  parameters: {
    // Capture at multiple viewports
    chromatic: { viewports: [320, 768, 1200] },
  },
}

export const Interactive: Story = {
  parameters: {
    // Wait for interactions before capture
    chromatic: { delay: 300 },
  },
}
```

### Reducing Flakiness

- Use `data-chromatic="ignore"` on dynamic elements
- Mock API calls with consistent responses
- Use fixed dates/times in stories

## Configuration

### `.storybook/preview.tsx`

```tsx
export const parameters = {
  chromatic: {
    // Global Chromatic options
    pauseAnimationAtEnd: true,
    diffThreshold: 0.2,
  },
}
```

### Ignore Specific Elements

```tsx
<div data-chromatic="ignore">
  {/* This content is ignored in visual diffs */}
  <LiveClock />
</div>
```

## Troubleshooting

### Build Failures

If Chromatic build fails:
1. Run `npm run build-storybook` locally
2. Check for TypeScript/ESLint errors
3. Verify all story files are valid

### Flaky Tests

If tests are inconsistent:
1. Check for animations (use `pauseAnimationAtEnd`)
2. Check for async content (use `delay`)
3. Check for random/dynamic content

### Large Diffs

If there are many unexpected changes:
1. Check for CSS changes affecting multiple components
2. Check for theme/font changes
3. Review component updates

## Resources

- [Chromatic Documentation](https://www.chromatic.com/docs/)
- [Storybook Visual Testing](https://storybook.js.org/docs/writing-tests/visual-testing)
- [Chromatic GitHub Action](https://github.com/chromaui/action)
