// Create a simple store for the application
const state = {
  progress: 25, // Default progress value
  hearts: 5, // Lives count
  exercises: [], // Exercises
  currentExerciseIndex: 0, // Current exercise index
  score: 0, // Score
  currentStep: 1, // Current step in the learning flow
  totalSteps: 3, // Total number of steps in the learning flow
  steps: [
    { id: 1, name: 'word-match', title: 'Word Match', path: '/word-match', progressPercentage: 25 },
    { id: 2, name: 'exercise', title: 'Image Selection', path: '/exercise', progressPercentage: 50 },
    { id: 3, name: 'word-builder', title: 'Word Builder', path: '/word-builder', progressPercentage: 75 }
  ]
};

// Store object with getters and actions
export const store = {
  // Getters
  getProgress: () => state.progress,
  getHearts: () => state.hearts,
  getCurrentExercise: () => state.exercises[state.currentExerciseIndex],
  getScore: () => state.score,
  getCurrentStep: () => state.currentStep,
  getTotalSteps: () => state.totalSteps,
  getStepInfo: (stepId) => state.steps.find(step => step.id === stepId),
  getCurrentStepInfo: () => state.steps.find(step => step.id === state.currentStep),
  getNextStepInfo: () => {
    const nextStepId = state.currentStep < state.totalSteps ? state.currentStep + 1 : 1;
    return state.steps.find(step => step.id === nextStepId);
  },

  // Actions
  setProgress: (progress) => {
    state.progress = progress;
  },
  decreaseHearts: () => {
    if (state.hearts > 0) {
      state.hearts--;
    }
  },
  resetHearts: () => {
    state.hearts = 5;
  },
  setExercises: (exercises) => {
    state.exercises = exercises;
    state.currentExerciseIndex = 0;
  },
  nextExercise: () => {
    if (state.currentExerciseIndex < state.exercises.length - 1) {
      state.currentExerciseIndex++;
    }
  },
  increaseScore: (points) => {
    state.score += points;
  },
  resetScore: () => {
    state.score = 0;
  },
  setCurrentStep: (stepId) => {
    if (stepId >= 1 && stepId <= state.totalSteps) {
      state.currentStep = stepId;
      const step = state.steps.find(s => s.id === stepId);
      if (step) {
        state.progress = step.progressPercentage;
      }
    }
  },
  nextStep: () => {
    if (state.currentStep < state.totalSteps) {
      state.currentStep++;
    } else {
      // Loop back to the first step when completing all steps
      state.currentStep = 1;
    }
    // Update progress based on current step
    const step = state.steps.find(s => s.id === state.currentStep);
    if (step) {
      state.progress = step.progressPercentage;
    }
    return state.steps.find(s => s.id === state.currentStep);
  }
};
