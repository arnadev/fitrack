'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAlert } from '@/contexts/AlertContext';

interface ExerciseString {
  name: string;
  sets: string;
  repLower: string;
  repUpper: string;
  weight: string;
}

const CreateRoutineModal = () => {
  const router = useRouter();
  const { showAlert } = useAlert();
  const [isExpanded, setIsExpanded] = useState(false);
  const [name, setName] = useState('');
  const [exercises, setExercises] = useState<ExerciseString[]>([
    { name: '', sets: '', repLower: '', repUpper: '', weight: '' }
  ]);

  const handleAddExercise = () => {
    setExercises([...exercises, { name: '', sets: '', repLower: '', repUpper: '', weight: '' }]);
  };

  const handleRemoveExercise = (index: number) => {
    if (exercises.length > 1) {
      setExercises(exercises.filter((_, i) => i !== index));
    }
  };

  const handleExerciseChange = (index: number, field: keyof ExerciseString, value: string) => {
    const updatedExercises = exercises.map((exercise, i) =>
      i === index ? { ...exercise, [field]: value } : exercise
    );
    setExercises(updatedExercises);
  };

  const handleSave = async () => {
    if (!name.trim()) {
      showAlert({ type: 'warning', message: 'Please enter a routine name' });
      return;
    }

    if (exercises.some(ex => !ex.name.trim())) {
      showAlert({ type: 'warning', message: 'Please fill in all exercise names' });
      return;
    }

    // Validate numeric values
    const invalidExercise = exercises.find(ex => {
      const sets = parseInt(ex.sets) || 0;
      const repLower = parseInt(ex.repLower) || 0;
      const repUpper = parseInt(ex.repUpper) || 0;
      const weight = parseInt(ex.weight) || 0;
      
      return sets <= 0 || repLower <= 0 || repUpper <= 0 || weight < 0 || repLower > repUpper;
    });

    if (invalidExercise) {
      showAlert({ type: 'warning', message: 'All exercises must have positive sets/reps, non-negative weight, and repLower ≤ repUpper' });
      return;
    }

    // Convert string values to numbers for API
    const exercisesForAPI = exercises.map(ex => ({
      name: ex.name.trim(),
      sets: parseInt(ex.sets) || 0,
      repLower: parseInt(ex.repLower) || 0,
      repUpper: parseInt(ex.repUpper) || 0,
      weight: parseInt(ex.weight) || 0
    }));

    try {
      const response = await fetch('/api/routine', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          name,
          exercises: exercisesForAPI
        }),
      });

      if (response.ok) {
        showAlert({ type: 'success', message: 'Routine created successfully' });
        handleCancel(); // Reset form and close modal
        router.refresh(); // Refresh to show the new routine
      } else {
        showAlert({ type: 'error', message: 'Failed to create routine' });
      }
    } catch (error) {
      console.error('Error creating routine:', error);
      showAlert({ type: 'error', message: 'Error creating routine' });
    }
  };

  const handleCancel = () => {
    setName('');
    setExercises([{ name: '', sets: '', repLower: '', repUpper: '', weight: '' }]);
    setIsExpanded(false);
  };

  return (
    <>
        <div className="w-full bg-white rounded-xl border border-gray-100 overflow-hidden cursor-pointer group">
            <div className="rounded-full flex items-center justify-center mt-4 ">
              <svg
                onClick={() => setIsExpanded(true)}
                className="w-8 h-8 text-indigo-600 hover:scale-120 transition-transform"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </div>
        </div>
      {/* Expanded State - Modal with Blur Background */}
      {isExpanded && (
        <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
            {/* Header */}
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">Create New Routine</h2>
                <button
                  onClick={handleCancel}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Form Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
              {/* Routine Name */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Routine Name
                </label>
                <input
                  type="text"
                  required
                  maxLength={100}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full text-lg font-medium text-gray-900 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Enter routine name..."
                />
              </div>

              {/* Exercises */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Exercises</h3>
                  <button
                    onClick={handleAddExercise}
                    className="flex items-center px-3 py-2 text-sm font-medium text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors"
                  >
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Add Exercise
                  </button>
                </div>

                <div className="space-y-4">
                  {exercises.map((exercise, index) => (
                    <div key={index} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-medium text-gray-900">Exercise {index + 1}</h4>
                        {exercises.length > 1 && (
                          <button
                            onClick={() => handleRemoveExercise(index)}
                            className="text-red-600 hover:text-red-700 p-1"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        )}
                      </div>
                      
                      <div className="space-y-3">
                        <input
                          type="text"
                          required
                          maxLength={100}
                          value={exercise.name}
                          onChange={(e) => handleExerciseChange(index, 'name', e.target.value)}
                          className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          placeholder="Exercise name"
                        />
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Sets</label>
                            <input
                              type="number"
                              min="1"
                              max="100"
                              value={exercise.sets}
                              onChange={(e) => handleExerciseChange(index, 'sets', e.target.value)}
                              className="w-full border border-gray-300 rounded px-2 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Min Reps</label>
                            <input
                              type="number"
                              min="1"
                              max="1000"
                              value={exercise.repLower}
                              onChange={(e) => handleExerciseChange(index, 'repLower', e.target.value)}
                              className="w-full border border-gray-300 rounded px-2 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Max Reps</label>
                            <input
                              type="number"
                              min="1"
                              max="1000"
                              value={exercise.repUpper}
                              onChange={(e) => handleExerciseChange(index, 'repUpper', e.target.value)}
                              className="w-full border border-gray-300 rounded px-2 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Weight (kg)</label>
                            <input
                              type="number"
                              min="0"
                              max="10000"
                              value={exercise.weight}
                              onChange={(e) => handleExerciseChange(index, 'weight', e.target.value)}
                              className="w-full border border-gray-300 rounded px-2 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="p-6 bg-gray-50 border-t border-gray-100">
              <div className="flex justify-end space-x-3">
                <button
                  onClick={handleCancel}
                  className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-colors"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="flex items-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Save Routine
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CreateRoutineModal;