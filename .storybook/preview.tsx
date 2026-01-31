import type { Preview } from '@storybook/react-vite'
import React from 'react'

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },

    a11y: {
      // 'todo' - show a11y violations in the test UI only
      // 'error' - fail CI on a11y violations
      // 'off' - skip a11y checks entirely
      test: 'todo',
    },

    // Fix viewport height issue - ensure enough space for dropdowns
    layout: 'fullscreen',
    docs: {
      story: {
        inline: true,
        iframeHeight: 450,
      },
      canvas: {
        sourceState: 'shown',
      },
    },
  },
  decorators: [
    (Story) => (
      <div style={{ minHeight: '400px', padding: '20px', boxSizing: 'border-box' }}>
        <Story />
      </div>
    ),
  ],
}

export default preview
