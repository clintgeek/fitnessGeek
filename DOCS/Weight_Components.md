# Weight Components Documentation

## Overview

The Weight page has been componentized following the same pattern as Dashboard and FoodLog pages. This provides better maintainability, reusability, and separation of concerns.

## Architecture

### Custom Hook: `useWeight`

**Location**: `frontend/src/hooks/useWeight.js`

**Purpose**: Centralizes all weight-related state management and business logic.

**Features**:
- Weight logs state management
- Weight goals state management
- Loading states
- Success/error message handling with auto-close
- API calls for CRUD operations
- Current weight calculation

**Returns**:
```javascript
{
  // State
  weightLogs,
  weightGoal,
  loading,
  error,
  success,
  currentWeight,

  // Actions
  addWeightLog,
  deleteWeightLog,
  loadWeightData,
  clearSuccessMessage,
  clearErrorMessage,
  setAutoCloseMessage
}
```

### Layout Component: `WeightLayout`

**Location**: `frontend/src/components/Weight/WeightLayout.jsx`

**Purpose**: Handles the overall layout, loading states, and alert messages.

**Props**:
- `loading`: Boolean for loading state
- `successMessage`: String for success message
- `errorMessage`: String for error message
- `onClearSuccess`: Function to clear success message
- `onClearError`: Function to clear error message
- `children`: React children

**Features**:
- Loading spinner when data is loading
- Auto-dismissible success/error alerts
- Consistent padding and layout

### Content Component: `WeightContent`

**Location**: `frontend/src/components/Weight/WeightContent.jsx`

**Purpose**: Handles the main content layout and conditional rendering of weight components.

**Props**:
- `weightLogs`: Array of weight log objects
- `weightGoal`: Weight goal object
- `currentWeight`: Current weight value
- `onAddWeight`: Function to add weight log
- `onDeleteWeight`: Function to delete weight log
- `unit`: String for weight unit (default: 'lbs')

**Features**:
- Conditional rendering of ProgressTracker (only when goal is set)
- Conditional rendering of WeightChart (only when logs exist)
- Consistent spacing between components
- Proper prop passing to child components

## Component Hierarchy

```
Weight Page
├── WeightLayout
│   ├── Loading Spinner (if loading)
│   ├── Success/Error Alerts
│   └── WeightContent
│       ├── ProgressTracker (conditional)
│       ├── WeightChart (conditional)
│       ├── QuickAddWeight
│       └── WeightLogList
```

## Usage Example

```jsx
import React from 'react';
import { useWeight } from '../hooks/useWeight.js';
import { WeightLayout, WeightContent } from '../components/Weight';

const Weight = () => {
  const {
    weightLogs,
    weightGoal,
    loading,
    success,
    error,
    currentWeight,
    addWeightLog,
    deleteWeightLog,
    clearSuccessMessage,
    clearErrorMessage
  } = useWeight();

  return (
    <WeightLayout
      loading={loading}
      successMessage={success}
      errorMessage={error}
      onClearSuccess={clearSuccessMessage}
      onClearError={clearErrorMessage}
    >
      <WeightContent
        weightLogs={weightLogs}
        weightGoal={weightGoal}
        currentWeight={currentWeight}
        onAddWeight={addWeightLog}
        onDeleteWeight={deleteWeightLog}
        unit="lbs"
      />
    </WeightLayout>
  );
};
```

## Benefits

1. **Separation of Concerns**: Logic is separated from UI components
2. **Reusability**: Components can be reused in different contexts
3. **Testability**: Each component and hook can be tested independently
4. **Maintainability**: Changes are isolated to specific components
5. **Consistency**: Follows the same pattern as other pages
6. **Auto-close Messages**: Success/error messages auto-close after 3 seconds

## Existing Components

The following existing components are used within the new structure:

- **WeightChart**: Displays weight trend over time
- **ProgressTracker**: Shows progress toward weight goals
- **QuickAddWeight**: Allows quick weight entry
- **WeightLogList**: Displays list of weight logs

All existing components maintain their current functionality while being integrated into the new componentized structure.