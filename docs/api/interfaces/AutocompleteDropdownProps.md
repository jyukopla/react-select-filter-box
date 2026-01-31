[**React Select Filter Box v0.0.0**](../README.md)

***

[React Select Filter Box](../README.md) / AutocompleteDropdownProps

# Interface: AutocompleteDropdownProps

Defined in: [components/AutocompleteDropdown/AutocompleteDropdown.tsx:14](https://github.com/jyukopla/react-select-filter-box/blob/732c0bb5d34ae2c255c8387f5b4df9b4c06e4e67/src/components/AutocompleteDropdown/AutocompleteDropdown.tsx#L14)

## Properties

### className?

> `optional` **className**: `string`

Defined in: [components/AutocompleteDropdown/AutocompleteDropdown.tsx:40](https://github.com/jyukopla/react-select-filter-box/blob/732c0bb5d34ae2c255c8387f5b4df9b4c06e4e67/src/components/AutocompleteDropdown/AutocompleteDropdown.tsx#L40)

Additional CSS class

***

### emptyMessage?

> `optional` **emptyMessage**: `string`

Defined in: [components/AutocompleteDropdown/AutocompleteDropdown.tsx:34](https://github.com/jyukopla/react-select-filter-box/blob/732c0bb5d34ae2c255c8387f5b4df9b4c06e4e67/src/components/AutocompleteDropdown/AutocompleteDropdown.tsx#L34)

Message shown when no items

***

### highlightedIndex

> **highlightedIndex**: `number`

Defined in: [components/AutocompleteDropdown/AutocompleteDropdown.tsx:22](https://github.com/jyukopla/react-select-filter-box/blob/732c0bb5d34ae2c255c8387f5b4df9b4c06e4e67/src/components/AutocompleteDropdown/AutocompleteDropdown.tsx#L22)

Currently highlighted index

***

### id?

> `optional` **id**: `string`

Defined in: [components/AutocompleteDropdown/AutocompleteDropdown.tsx:16](https://github.com/jyukopla/react-select-filter-box/blob/732c0bb5d34ae2c255c8387f5b4df9b4c06e4e67/src/components/AutocompleteDropdown/AutocompleteDropdown.tsx#L16)

Unique ID for the dropdown

***

### isLoading?

> `optional` **isLoading**: `boolean`

Defined in: [components/AutocompleteDropdown/AutocompleteDropdown.tsx:38](https://github.com/jyukopla/react-select-filter-box/blob/732c0bb5d34ae2c255c8387f5b4df9b4c06e4e67/src/components/AutocompleteDropdown/AutocompleteDropdown.tsx#L38)

Whether items are loading

***

### isOpen

> **isOpen**: `boolean`

Defined in: [components/AutocompleteDropdown/AutocompleteDropdown.tsx:18](https://github.com/jyukopla/react-select-filter-box/blob/732c0bb5d34ae2c255c8387f5b4df9b4c06e4e67/src/components/AutocompleteDropdown/AutocompleteDropdown.tsx#L18)

Whether the dropdown is open

***

### itemHeight?

> `optional` **itemHeight**: `number`

Defined in: [components/AutocompleteDropdown/AutocompleteDropdown.tsx:47](https://github.com/jyukopla/react-select-filter-box/blob/732c0bb5d34ae2c255c8387f5b4df9b4c06e4e67/src/components/AutocompleteDropdown/AutocompleteDropdown.tsx#L47)

Height of each item in pixels (for virtual scrolling)

***

### items

> **items**: [`AutocompleteItem`](AutocompleteItem.md)[]

Defined in: [components/AutocompleteDropdown/AutocompleteDropdown.tsx:20](https://github.com/jyukopla/react-select-filter-box/blob/732c0bb5d34ae2c255c8387f5b4df9b4c06e4e67/src/components/AutocompleteDropdown/AutocompleteDropdown.tsx#L20)

Items to display

***

### loadingMessage?

> `optional` **loadingMessage**: `string`

Defined in: [components/AutocompleteDropdown/AutocompleteDropdown.tsx:36](https://github.com/jyukopla/react-select-filter-box/blob/732c0bb5d34ae2c255c8387f5b4df9b4c06e4e67/src/components/AutocompleteDropdown/AutocompleteDropdown.tsx#L36)

Message shown when loading

***

### maxHeight?

> `optional` **maxHeight**: `number`

Defined in: [components/AutocompleteDropdown/AutocompleteDropdown.tsx:30](https://github.com/jyukopla/react-select-filter-box/blob/732c0bb5d34ae2c255c8387f5b4df9b4c06e4e67/src/components/AutocompleteDropdown/AutocompleteDropdown.tsx#L30)

Maximum height of dropdown

***

### onHighlight()

> **onHighlight**: (`index`) => `void`

Defined in: [components/AutocompleteDropdown/AutocompleteDropdown.tsx:26](https://github.com/jyukopla/react-select-filter-box/blob/732c0bb5d34ae2c255c8387f5b4df9b4c06e4e67/src/components/AutocompleteDropdown/AutocompleteDropdown.tsx#L26)

Called when an item is highlighted

#### Parameters

##### index

`number`

#### Returns

`void`

***

### onSelect()

> **onSelect**: (`item`) => `void`

Defined in: [components/AutocompleteDropdown/AutocompleteDropdown.tsx:24](https://github.com/jyukopla/react-select-filter-box/blob/732c0bb5d34ae2c255c8387f5b4df9b4c06e4e67/src/components/AutocompleteDropdown/AutocompleteDropdown.tsx#L24)

Called when an item is selected

#### Parameters

##### item

[`AutocompleteItem`](AutocompleteItem.md)

#### Returns

`void`

***

### position?

> `optional` **position**: `object`

Defined in: [components/AutocompleteDropdown/AutocompleteDropdown.tsx:28](https://github.com/jyukopla/react-select-filter-box/blob/732c0bb5d34ae2c255c8387f5b4df9b4c06e4e67/src/components/AutocompleteDropdown/AutocompleteDropdown.tsx#L28)

Dropdown position (for portal rendering)

#### left

> **left**: `number`

#### top

> **top**: `number`

#### width

> **width**: `number`

***

### renderItem()?

> `optional` **renderItem**: (`item`, `isHighlighted`) => `ReactNode`

Defined in: [components/AutocompleteDropdown/AutocompleteDropdown.tsx:32](https://github.com/jyukopla/react-select-filter-box/blob/732c0bb5d34ae2c255c8387f5b4df9b4c06e4e67/src/components/AutocompleteDropdown/AutocompleteDropdown.tsx#L32)

Custom item renderer

#### Parameters

##### item

[`AutocompleteItem`](AutocompleteItem.md)

##### isHighlighted

`boolean`

#### Returns

`ReactNode`

***

### virtualScrolling?

> `optional` **virtualScrolling**: `boolean` \| `"auto"`

Defined in: [components/AutocompleteDropdown/AutocompleteDropdown.tsx:45](https://github.com/jyukopla/react-select-filter-box/blob/732c0bb5d34ae2c255c8387f5b4df9b4c06e4e67/src/components/AutocompleteDropdown/AutocompleteDropdown.tsx#L45)

Enable virtual scrolling for large lists.
When true (or 'auto' with >100 items), only visible items are rendered.
