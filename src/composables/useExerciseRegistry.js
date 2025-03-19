(function () {
  const { reactive, readonly } = Vue;
  const exerciseTypes = reactive([]);
  const exerciseValidators = {};

  window.exerciseRegistry = {
    register(exerciseInfo, validator) {
      const exists = exerciseTypes.some(ex => ex.id === exerciseInfo.id);
      if (!exists) {
        exerciseTypes.push(exerciseInfo);
        exerciseValidators[exerciseInfo.id] = validator;
      }
    },

    validate(exerciseType, params) {
      const validator = exerciseValidators[exerciseType];

      if (!validator) {
        return {
          isValid: false,
          isCorrect: false,
          correctAnswer: null,
          feedbackMessage: "Bu egzersiz türü için doğrulama yapılamıyor."
        };
      }

      return validator(params);
    },

    getExerciseById(id) {
      return exerciseTypes.find(ex => ex.id === id) || null;
    },

    getExerciseByComponent(componentName) {
      return exerciseTypes.find(ex => ex.component === componentName) || null;
    },

    getAllExercises() {
      return [...exerciseTypes];
    }
  };

  window.validateExerciseAnswer = function (exerciseType, params) {
    return window.exerciseRegistry.validate(exerciseType, params);
  };

  Object.defineProperty(window, 'exerciseTypes', {
    get: () => readonly(exerciseTypes)
  });

  window.getExerciseById = window.exerciseRegistry.getExerciseById;
  window.getExerciseByComponent = window.exerciseRegistry.getExerciseByComponent;
  window.getAllExercises = window.exerciseRegistry.getAllExercises;
})();