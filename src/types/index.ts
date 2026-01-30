/**
 * Public types API
 */

export type {
  // Expression types
  FieldType,
  FieldValue,
  OperatorValue,
  ConditionValue,
  ConnectorValue,
  FilterCondition,
  FilterExpression,
  TokenType,
  TokenData,
  AutocompleteItemType,
  AutocompleteItem,
  ValidationErrorType,
  ValidationError,
  ValidationWarning,
  ValidationResult,
} from './Expression'

export type {
  // Schema types
  AutocompleteContext,
  CustomAutocompleteWidget,
  CustomWidgetProps,
  Autocompleter,
  MultiValueConfig,
  OperatorConfig,
  FieldConfig,
  ValidationContext,
  ConnectorConfig,
  FilterSchema,
} from './Schema'

export {
  // Default configurations
  DEFAULT_CONNECTORS,
  STRING_OPERATORS,
  NUMBER_OPERATORS,
  DATE_OPERATORS,
  BOOLEAN_OPERATORS,
  ENUM_OPERATORS,
  ID_OPERATORS,
  getDefaultOperators,
} from './Schema'
