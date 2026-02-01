# Screen Reader Testing Guide

This guide provides instructions for manually testing the FilterBox component with screen readers to ensure full accessibility compliance.

## Prerequisites

### Screen Reader Setup

#### Windows (NVDA)

1. Download NVDA from [nvaccess.org](https://www.nvaccess.org/download/)
2. Install and launch NVDA
3. Use Insert key as the NVDA modifier

#### Windows (JAWS)

1. Install JAWS from Freedom Scientific
2. Launch JAWS before opening the browser
3. Use Insert key as the JAWS modifier

#### macOS (VoiceOver)

1. Enable via System Preferences → Accessibility → VoiceOver
2. Or press Cmd+F5 to toggle
3. Use Ctrl+Option as the VoiceOver modifier (VO)

#### Linux (Orca)

1. Install via package manager: `sudo apt install orca`
2. Enable in GNOME accessibility settings
3. Use Insert key as the Orca modifier

### Browser Setup

Test in multiple browsers as screen reader behavior varies:

- **Chrome/Edge**: Best NVDA/JAWS support
- **Firefox**: Good NVDA support, some differences
- **Safari**: Required for VoiceOver testing

---

## Test Scenarios

### 1. Initial Component Recognition

**Goal**: Verify the FilterBox is recognized as an interactive form control.

**Steps**:

1. Navigate to a page with the FilterBox component
2. Use Tab to move focus to the FilterBox
3. Listen for screen reader announcement

**Expected Behavior**:

- ✅ Announces as "combobox" or "edit combo"
- ✅ Announces placeholder text "Add filter..."
- ✅ Indicates it's collapsed (no popup)
- ✅ If labeled, announces the label

**NVDA Example**: "Add filter, combo box, collapsed"

**VoiceOver Example**: "Add filter, combo box"

---

### 2. Opening the Dropdown

**Goal**: Verify dropdown opening is announced.

**Steps**:

1. Focus the FilterBox input
2. Press Enter or start typing

**Expected Behavior**:

- ✅ Announces "expanded" state
- ✅ Announces number of available options
- ✅ Example: "3 fields available. Use arrow keys to navigate."

---

### 3. Navigating Options

**Goal**: Verify arrow key navigation announces options.

**Steps**:

1. Open the dropdown
2. Press Down Arrow to move through options
3. Press Up Arrow to move backwards

**Expected Behavior**:

- ✅ Each option is announced with its label
- ✅ Current position indicated (e.g., "1 of 3")
- ✅ Option description read if available
- ✅ Group headers announced when entering new group

**NVDA Example**: "Status, 1 of 3, Current process status"

---

### 4. Selecting a Field

**Goal**: Verify field selection and state transition.

**Steps**:

1. Navigate to a field option
2. Press Enter to select

**Expected Behavior**:

- ✅ Announces selected field name
- ✅ Announces transition to operator selection
- ✅ Example: "Selected Status. Now select an operator."
- ✅ New options list announced

---

### 5. Selecting an Operator

**Goal**: Verify operator selection announcement.

**Steps**:

1. After selecting a field, navigate operators
2. Select an operator with Enter

**Expected Behavior**:

- ✅ Announces selected operator
- ✅ Announces transition to value entry
- ✅ Example: "Selected equals. Now enter a value."
- ✅ Input ready for typing

---

### 6. Entering a Value

**Goal**: Verify value entry and confirmation.

**Steps**:

1. After selecting operator, type a value
2. Press Enter to confirm

**Expected Behavior**:

- ✅ Characters echoed as typed (if enabled in screen reader)
- ✅ On Enter, announces filter creation
- ✅ Example: "Filter added: value 'active'. Select AND, OR, or press Enter to finish."

---

### 7. Completing or Continuing

**Goal**: Verify connector selection and completion.

**Steps**:

1. After entering value, choose AND, OR, or press Enter to finish

**Expected Behavior**:

- ✅ Connector options announced if continuing
- ✅ "Filter expression complete" if finishing
- ✅ Total filter count updated

---

### 8. Token Navigation

**Goal**: Verify navigation through existing tokens.

**Steps**:

1. With filters applied, focus the input
2. Press Left Arrow to navigate to tokens
3. Use Left/Right to move between tokens

**Expected Behavior**:

- ✅ Each token announces its type and value
- ✅ Example: "Name field token" → "contains operator token" → "test value token"
- ✅ Selection state indicated

---

### 9. Token Editing

**Goal**: Verify value token editing is accessible.

**Steps**:

1. Navigate to a value token
2. Press Enter or click to edit
3. Change the value
4. Press Enter to confirm or Escape to cancel

**Expected Behavior**:

- ✅ "Editing [value]" announced
- ✅ Input replaces token with current value
- ✅ On confirm: "Value updated to [new value]"
- ✅ On cancel: "Edit cancelled"

---

### 10. Token Deletion

**Goal**: Verify deletion is announced.

**Steps**:

1. Navigate to a token
2. Press Delete key

**Expected Behavior**:

- ✅ "Filter expression deleted" announced
- ✅ Remaining filters count updated
- ✅ Focus moves appropriately

---

### 11. Clear All

**Goal**: Verify clear all action.

**Steps**:

1. With filters applied, press Ctrl+Backspace
2. Or activate the clear button

**Expected Behavior**:

- ✅ "All filters cleared" announced
- ✅ Component returns to initial state

---

### 12. Error States

**Goal**: Verify validation errors are announced.

**Steps**:

1. Trigger a validation error (e.g., empty value)
2. Listen for error announcement

**Expected Behavior**:

- ✅ Error message announced
- ✅ aria-invalid state communicated
- ✅ Error can be reviewed

---

### 13. Disabled State

**Goal**: Verify disabled state is communicated.

**Steps**:

1. Navigate to a disabled FilterBox

**Expected Behavior**:

- ✅ "Disabled" or "dimmed" announced
- ✅ Cannot interact with the control

---

## Accessibility Checklist

### ARIA Implementation

- [ ] `role="combobox"` on input
- [ ] `aria-expanded` updates with dropdown state
- [ ] `aria-haspopup="listbox"` present
- [ ] `aria-controls` points to dropdown
- [ ] `role="listbox"` on dropdown
- [ ] `role="option"` on each option
- [ ] `aria-selected` on highlighted option
- [ ] `aria-activedescendant` updates with selection

### Live Regions

- [ ] `aria-live="polite"` region exists
- [ ] Announcements are timely and informative
- [ ] Not too verbose or redundant

### Keyboard Support

- [ ] Tab navigates to/from component
- [ ] Arrow keys navigate options
- [ ] Enter selects options
- [ ] Escape closes dropdown
- [ ] Backspace deletes appropriately

### Focus Management

- [ ] Focus visible at all times
- [ ] Focus trapped in dropdown when open
- [ ] Focus restored after closing dropdown

---

## Known Screen Reader Differences

### NVDA

- May require Browse Mode off (press Escape in dropdown)
- Virtual buffer can interfere with typing

### JAWS

- May announce more verbosely
- Forms mode auto-switches

### VoiceOver

- Requires Safari for best results
- Quick Nav should be off (Left/Right arrows)
- Use VO+Space to interact

### Orca

- GNOME compatibility varies
- Firefox provides best support

---

## Reporting Issues

When reporting accessibility issues, include:

1. **Screen Reader**: Name and version
2. **Browser**: Name and version
3. **OS**: Name and version
4. **Steps to Reproduce**: Exact keyboard/interaction sequence
5. **Expected**: What should be announced
6. **Actual**: What was actually announced
7. **Recording**: Audio/video if possible

File issues at: [GitHub Issues](https://github.com/your-org/react-select-filter-box/issues)

---

## Resources

- [WebAIM Screen Reader Testing](https://webaim.org/techniques/screenreader/)
- [NVDA User Guide](https://www.nvaccess.org/files/nvda/documentation/userGuide.html)
- [VoiceOver User Guide](https://support.apple.com/guide/voiceover/welcome/mac)
- [WAI-ARIA Combobox Pattern](https://www.w3.org/WAI/ARIA/apg/patterns/combobox/)
- [Deque Accessibility Testing](https://www.deque.com/axe/)
