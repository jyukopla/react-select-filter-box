import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterEach, vi } from 'vitest'

// Global cleanup after each test to prevent memory leaks
afterEach(() => {
  cleanup()
  vi.clearAllMocks()
  vi.resetAllMocks()
})

