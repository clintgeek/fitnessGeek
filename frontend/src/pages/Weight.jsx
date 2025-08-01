import React from 'react';
import { useWeight } from '../hooks/useWeight.js';
import {
  WeightLayout,
  WeightContent
} from '../components/Weight';

const Weight = () => {
  // Use custom hook for weight operations
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

export default Weight;