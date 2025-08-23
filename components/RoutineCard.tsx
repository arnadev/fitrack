'use client';

import { useState } from 'react';

interface Exercise {
  name: string;
  sets: number;
  repLower: number;
  repUpper: number;
  weight: number;
}

interface Routine {
  _id: string;
  userId: string;
  name: string;
  exercises: Exercise[];
  createdAt: string;
}

interface RoutineCardProps {
  routine: Routine;
  isOwner?: boolean;
}

const RoutineCard = ({ routine, isOwner = false }: RoutineCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Store original values for cancel functionality
  const [editedRoutine, setEditedRoutine] = useState(routine);
  const [originalRoutine, setOriginalRoutine] = useState(routine);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getTotalSets = () => {
    return editedRoutine.exercises.reduce((total, exercise) => total + exercise.sets, 0);
  };

  const getExerciseCount = () => {
    return editedRoutine.exercises.length;
  };

  const handleEdit = () => {
    setOriginalRoutine(editedRoutine);
    setIsEditing(true);
  };

  const handleSave = async () => {
    try {
      const response = await fetch(`/api/routine`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          routineId: routine._id,
          ...editedRoutine
        }),
      });

      if (response.ok) {
        setIsEditing(false);
        // Update the routine data
        console.log('Routine updated successfully');
      } else {
        console.error('Failed to update routine');
      }
    } catch (error) {
      console.error('Error updating routine:', error);
    }
  };

  const handleCancel = () => {
    setEditedRoutine(originalRoutine);
    setIsEditing(false);
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this routine?')) {
      return;
    }

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/routine`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          routineId: routine._id
        }),
      });

      if (response.ok) {
        console.log('Routine deleted successfully');
        // You might want to add a callback prop to refresh the parent component
      } else {
        console.error('Failed to delete routine');
      }
    } catch (error) {
      console.error('Error deleting routine:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  const updateRoutineName = (newName: string) => {
    setEditedRoutine(prev => ({ ...prev, name: newName }));
  };

  const updateExercise = (index: number, field: keyof Exercise, value: string | number) => {
    setEditedRoutine(prev => ({
      ...prev,
      exercises: prev.exercises.map((exercise, i) => 
        i === index ? { ...exercise, [field]: value } : exercise
      )
    }));
  };

  return (
    <div className="w-full lg:w-1/3 bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            {isEditing ? (
              <input
                type="text"
                value={editedRoutine.name}
                onChange={(e) => updateRoutineName(e.target.value)}
                className="text-xl font-bold text-gray-900 mb-2 w-full border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            ) : (
              <h3 className="text-xl font-bold text-gray-900 mb-2 truncate">
                {editedRoutine.name}
              </h3>
            )}
            <div className="flex items-center space-x-4 text-sm text-gray-600">
              <div className="flex items-center">
                <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                {getExerciseCount()} exercises
              </div>
              <div className="flex items-center">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                {getTotalSets()} total sets
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Created {formatDate(routine.createdAt)}
            </p>
          </div>
          
          {/* Action Buttons */}
          <div className="flex items-center space-x-2 ml-4">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              title={isExpanded ? "Collapse" : "Expand"}
            >
              <svg
                className={`w-5 h-5 transform transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Exercise List - Expandable */}
      {isExpanded && (
        <div className="p-6 bg-gray-50">
          <h4 className="text-sm font-semibold text-gray-700 mb-4 uppercase tracking-wide">
            Exercises
          </h4>
          <div className="space-y-3">
            {editedRoutine.exercises.map((exercise, index) => (
              <div
                key={index}
                className="bg-white rounded-lg p-4 border border-gray-200"
              >
                <div className="flex items-center justify-between">
                  {isEditing ? (
                    <div className="flex-1 space-y-2">
                      <input
                        type="text"
                        value={exercise.name}
                        onChange={(e) => updateExercise(index, 'name', e.target.value)}
                        className="font-medium text-gray-900 w-full border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        placeholder="Exercise name"
                      />
                      <div className="flex space-x-6">
                        <span>
                        <label className="font-medium text-gray-900 mr-1">Sets</label>
                        <input
                          type="number"
                          value={exercise.sets}
                          onChange={(e) => updateExercise(index, 'sets', parseInt(e.target.value) || 0)}
                          className="w-20 text-xs border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          placeholder="Sets"
                        />
                        </span>
                        <span>
                        <label className="font-medium text-gray-900 mr-1">Rep Range</label>
                        <input
                          type="number"
                          value={exercise.repLower}
                          onChange={(e) => updateExercise(index, 'repLower', parseInt(e.target.value) || 0)}
                          className="w-20 text-xs border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          placeholder="Min reps"
                        />
                        <input
                          type="number"
                          value={exercise.repUpper}
                          onChange={(e) => updateExercise(index, 'repUpper', parseInt(e.target.value) || 0)}
                          className="w-20 text-xs border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          placeholder="Max reps"
                        />
                        </span>
                        <span>
                        <label className="font-medium text-gray-900 mr-1">Weight</label>
                        <input
                          type="number"
                          value={exercise.weight}
                          onChange={(e) => updateExercise(index, 'weight', parseInt(e.target.value) || 0)}
                          className="w-20 text-xs border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          placeholder="Weight"
                        />
                        </span>
                      </div>
                    </div>
                  ) : (
                    <>
                      <h5 className="font-medium text-gray-900 flex-1">
                        {exercise.name}
                      </h5>
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
                          {exercise.sets} sets
                        </span>
                        <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                          {exercise.repLower === exercise.repUpper 
                            ? `${exercise.repLower} reps`
                            : `${exercise.repLower}-${exercise.repUpper} reps`
                          }
                        </span>
                        <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-xs font-medium">
                          {exercise.weight} kg
                        </span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Action Buttons Footer */}
      {isOwner && (
        <div className="p-6 bg-gray-50 border-t border-gray-100">
          <div className="flex items-center justify-between space-x-3">
            {isEditing ? (
              <div className="flex space-x-2">
                <button
                  onClick={handleSave}
                  className="flex items-center px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Save
                </button>
                <button
                  onClick={handleCancel}
                  className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-colors"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Cancel
                </button>
              </div>
            ) : (
              <div className="flex space-x-2">
                <button
                  onClick={handleEdit}
                  className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-colors"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Edit
                </button>
                
                <button
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="flex items-center px-4 py-2 text-sm font-medium text-red-700 bg-white border border-red-300 rounded-lg hover:bg-red-50 hover:border-red-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isDeleting ? (
                    <>
                      <svg className="w-4 h-4 mr-2 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Deleting...
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      Delete
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default RoutineCard;