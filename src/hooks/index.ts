export { useFilterState, type UseFilterStateProps, type UseFilterStateReturn } from './useFilterState'
export {
  useDropdownPosition,
  type UseDropdownPositionOptions,
  type UseDropdownPositionResult,
  type DropdownPosition,
  type DropdownPlacement,
} from './useDropdownPosition'
export {
  useFocusManagement,
  type UseFocusManagementProps,
  type UseFocusManagementReturn,
} from './useFocusManagement'
export {
  useVirtualList,
  type UseVirtualListOptions,
  type UseVirtualListResult,
  type VirtualItem,
} from './useVirtualList'

// Filter Reducer - useReducer-based state management
export {
  filterReducer,
  initialFilterState,
  type FilterState,
  type FilterAction,
  type FilterActionType,
  // Selectors
  selectTokens,
  selectSuggestions,
  selectPlaceholder,
  selectIsTokenEditable,
  selectTokenExpressionIndex,
  // Action Creators
  focus,
  blur,
  inputChange,
  highlightSuggestion,
  selectField,
  selectOperator,
  confirmValue,
  selectConnector,
  complete,
  deleteLastStep,
  deleteToken,
  clearAll,
  startTokenEdit,
  completeTokenEdit,
  cancelTokenEdit,
  startOperatorEdit,
  cancelOperatorEdit,
  selectToken,
  selectAllTokens,
  deselectTokens,
  navigateLeft,
  navigateRight,
  setAnnouncement,
  closeDropdown,
  openDropdown,
  reset,
} from './filterReducer'
