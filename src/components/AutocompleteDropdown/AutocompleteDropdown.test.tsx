import { describe, expect, it, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { AutocompleteDropdown, type AutocompleteDropdownProps } from './AutocompleteDropdown'
import type { AutocompleteItem } from '@/types'

describe('AutocompleteDropdown', () => {
  const createItems = (): AutocompleteItem[] => [
    { type: 'field', key: 'status', label: 'Status', description: 'Process status' },
    { type: 'field', key: 'name', label: 'Name' },
    { type: 'field', key: 'createdAt', label: 'Created At', disabled: true },
  ]

  const defaultProps: AutocompleteDropdownProps = {
    isOpen: true,
    items: createItems(),
    highlightedIndex: 0,
    onSelect: vi.fn(),
    onHighlight: vi.fn(),
  }

  describe('Rendering', () => {
    it('should render when isOpen is true', () => {
      render(<AutocompleteDropdown {...defaultProps} />)
      expect(screen.getByRole('listbox')).toBeInTheDocument()
    })

    it('should not render when isOpen is false', () => {
      render(<AutocompleteDropdown {...defaultProps} isOpen={false} />)
      expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
    })

    it('should render all items', () => {
      render(<AutocompleteDropdown {...defaultProps} />)
      expect(screen.getByText('Status')).toBeInTheDocument()
      expect(screen.getByText('Name')).toBeInTheDocument()
      expect(screen.getByText('Created At')).toBeInTheDocument()
    })

    it('should render item descriptions when provided', () => {
      render(<AutocompleteDropdown {...defaultProps} />)
      expect(screen.getByText('Process status')).toBeInTheDocument()
    })

    it('should show empty message when no items', () => {
      render(<AutocompleteDropdown {...defaultProps} items={[]} emptyMessage="No results" />)
      expect(screen.getByText('No results')).toBeInTheDocument()
    })

    it('should show loading message when loading', () => {
      render(<AutocompleteDropdown {...defaultProps} isLoading loadingMessage="Loading..." />)
      expect(screen.getByText('Loading...')).toBeInTheDocument()
    })
  })

  describe('Highlighting', () => {
    it('should highlight the item at highlightedIndex', () => {
      const { container } = render(<AutocompleteDropdown {...defaultProps} highlightedIndex={1} />)
      const items = container.querySelectorAll('.autocomplete-item')
      expect(items[1]).toHaveClass('autocomplete-item--highlighted')
    })

    it('should call onHighlight on mouse enter', () => {
      const onHighlight = vi.fn()
      render(<AutocompleteDropdown {...defaultProps} onHighlight={onHighlight} />)
      fireEvent.mouseEnter(screen.getByText('Name'))
      expect(onHighlight).toHaveBeenCalledWith(1)
    })
  })

  describe('Selection', () => {
    it('should call onSelect when item is clicked', () => {
      const onSelect = vi.fn()
      render(<AutocompleteDropdown {...defaultProps} onSelect={onSelect} />)
      fireEvent.click(screen.getByText('Status'))
      expect(onSelect).toHaveBeenCalledWith(defaultProps.items[0])
    })

    it('should not call onSelect when disabled item is clicked', () => {
      const onSelect = vi.fn()
      render(<AutocompleteDropdown {...defaultProps} onSelect={onSelect} />)
      fireEvent.click(screen.getByText('Created At'))
      expect(onSelect).not.toHaveBeenCalled()
    })
  })

  describe('Accessibility', () => {
    it('should have role="listbox"', () => {
      render(<AutocompleteDropdown {...defaultProps} />)
      expect(screen.getByRole('listbox')).toBeInTheDocument()
    })

    it('should have items with role="option"', () => {
      render(<AutocompleteDropdown {...defaultProps} />)
      const options = screen.getAllByRole('option')
      expect(options).toHaveLength(3)
    })

    it('should mark disabled items with aria-disabled', () => {
      render(<AutocompleteDropdown {...defaultProps} />)
      const disabledItem = screen.getByText('Created At').closest('[role="option"]')
      expect(disabledItem).toHaveAttribute('aria-disabled', 'true')
    })

    it('should set aria-selected on highlighted item', () => {
      render(<AutocompleteDropdown {...defaultProps} highlightedIndex={0} />)
      const options = screen.getAllByRole('option')
      expect(options[0]).toHaveAttribute('aria-selected', 'true')
    })
  })

  describe('Grouped Items', () => {
    const createGroupedItems = (): AutocompleteItem[] => [
      { type: 'field', key: 'status', label: 'Status', group: 'Basic' },
      { type: 'field', key: 'name', label: 'Name', group: 'Basic' },
      { type: 'field', key: 'createdAt', label: 'Created At', group: 'Dates' },
      { type: 'field', key: 'updatedAt', label: 'Updated At', group: 'Dates' },
      { type: 'field', key: 'unGrouped', label: 'Ungrouped Field' },
    ]

    it('should render group headers', () => {
      render(<AutocompleteDropdown {...defaultProps} items={createGroupedItems()} />)
      expect(screen.getByText('Basic')).toBeInTheDocument()
      expect(screen.getByText('Dates')).toBeInTheDocument()
    })

    it('should render ungrouped items at the end', () => {
      render(<AutocompleteDropdown {...defaultProps} items={createGroupedItems()} />)
      expect(screen.getByText('Ungrouped Field')).toBeInTheDocument()
    })

    it('should not render duplicate group headers', () => {
      render(<AutocompleteDropdown {...defaultProps} items={createGroupedItems()} />)
      const basicHeaders = screen.getAllByText('Basic')
      expect(basicHeaders).toHaveLength(1)
    })
  })

  describe('Virtual Scrolling', () => {
    const createLargeList = (count: number): AutocompleteItem[] => {
      return Array.from({ length: count }, (_, i) => ({
        type: 'field' as const,
        key: `item-${i}`,
        label: `Item ${i}`,
      }))
    }

    it('should enable virtual scrolling automatically for lists > 100 items', () => {
      const { container } = render(
        <AutocompleteDropdown {...defaultProps} items={createLargeList(150)} />
      )
      expect(container.querySelector('.autocomplete-dropdown--virtual')).toBeInTheDocument()
    })

    it('should not enable virtual scrolling for small lists', () => {
      const { container } = render(
        <AutocompleteDropdown {...defaultProps} items={createLargeList(50)} />
      )
      expect(container.querySelector('.autocomplete-dropdown--virtual')).not.toBeInTheDocument()
    })

    it('should enable virtual scrolling when explicitly set to true', () => {
      const { container } = render(
        <AutocompleteDropdown {...defaultProps} items={createLargeList(50)} virtualScrolling={true} />
      )
      expect(container.querySelector('.autocomplete-dropdown--virtual')).toBeInTheDocument()
    })

    it('should not use virtual scrolling for grouped items', () => {
      const groupedItems: AutocompleteItem[] = Array.from({ length: 150 }, (_, i) => ({
        type: 'field' as const,
        key: `item-${i}`,
        label: `Item ${i}`,
        group: i % 2 === 0 ? 'Even' : 'Odd',
      }))
      const { container } = render(
        <AutocompleteDropdown {...defaultProps} items={groupedItems} />
      )
      // Should fall back to standard mode due to groups
      expect(container.querySelector('.autocomplete-dropdown--virtual')).not.toBeInTheDocument()
    })

    it('should render only visible items in virtual mode', () => {
      const { container } = render(
        <AutocompleteDropdown 
          {...defaultProps} 
          items={createLargeList(200)} 
          virtualScrolling={true}
          maxHeight={300}
          itemHeight={40}
        />
      )
      // With 300px height and 40px items, should show ~8 items + overscan
      // Using container query because items are inside aria-hidden spacer for a11y
      const options = container.querySelectorAll('.autocomplete-item')
      expect(options.length).toBeLessThan(200)
      expect(options.length).toBeGreaterThan(0)
      expect(options.length).toBeLessThanOrEqual(15) // ~8 visible + 3 overscan each side
    })

    it('should highlight correct item in virtual mode', () => {
      const { container } = render(
        <AutocompleteDropdown 
          {...defaultProps} 
          items={createLargeList(150)} 
          highlightedIndex={2}
          virtualScrolling={true}
        />
      )
      const highlightedItem = container.querySelector('.autocomplete-item--highlighted')
      expect(highlightedItem).toBeInTheDocument()
      expect(highlightedItem).toHaveTextContent('Item 2')
    })

    it('should call onSelect in virtual mode', () => {
      const onSelect = vi.fn()
      render(
        <AutocompleteDropdown 
          {...defaultProps} 
          items={createLargeList(150)} 
          onSelect={onSelect}
          virtualScrolling={true}
        />
      )
      fireEvent.click(screen.getByText('Item 0'))
      expect(onSelect).toHaveBeenCalled()
    })

    it('should call onHighlight on mouse enter in virtual mode', () => {
      const onHighlight = vi.fn()
      render(
        <AutocompleteDropdown 
          {...defaultProps} 
          items={createLargeList(150)} 
          onHighlight={onHighlight}
          virtualScrolling={true}
        />
      )
      fireEvent.mouseEnter(screen.getByText('Item 1'))
      expect(onHighlight).toHaveBeenCalledWith(1)
    })
  })

  describe('Touch Accessibility', () => {
    it('should have autocomplete-item__content class for CSS min-height styling', () => {
      render(<AutocompleteDropdown {...defaultProps} />)
      const items = document.querySelectorAll('.autocomplete-item__content')
      expect(items.length).toBeGreaterThan(0)
      // The CSS will apply min-height: 44px via touch-accessibility.css
    })

    it('should have proper structure for touch targets', () => {
      render(<AutocompleteDropdown {...defaultProps} />)
      // Each item should have the content wrapper for proper touch sizing
      const options = screen.getAllByRole('option')
      options.forEach(option => {
        expect(option).toHaveClass('autocomplete-item')
      })
    })
  })
})
