<template>
  <div class="exercise-container">
    <div class="exercise-component">

      <div class="options-container">
        <div class="options-list">
          <option-button v-for="(option, index) in options" :key="option" :number="index + 1" :text="option"
            :isSelected="selectedOption === option" :isCorrect="isAnswerChecked && option === correctOption"
            :isDisabled="isAnswerChecked" :className="'word-match-option'" @select="handleOptionSelect(option)" />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
// Import using vue3-sfc-loader
const OptionButton = window["vue3-sfc-loader"].loadModule(
  './src/components/exercises/OptionButton.vue',
  window.sfcOptions
);

export default {
  name: 'WordMatchExercise',
  components: {
    OptionButton: Vue.defineAsyncComponent(() => OptionButton)
  },
  props: {
    exerciseData: {
      type: Object,
      default: () => ({})
    }
  },
  setup(props) {
    const { ref, onMounted } = Vue;

    // State
    const title = ref("Choose the correct translation");
    const word = ref("");
    const options = ref([]);
    const selectedOption = ref("");
    const isAnswerChecked = ref(false);
    const correctOption = ref("");
    const currentExercise = ref(null);
    const currentStepIndex = ref(0);

    // Load exercise data from ExerciseSteps.js
    const loadExerciseData = () => {
      // Get all word-match exercises
      let exercises = [];

      if (window.exerciseStepsManager) {
        exercises = window.exerciseStepsManager.getStepsByType('word-match') || [];
      } else if (window.exerciseSteps) {
        // Try to access directly if manager is not available
        exercises = window.exerciseSteps.filter(step => step.type === 'word-match') || [];
      }

      // Select current exercise based on step index
      if (exercises && exercises.length > 0) {
        currentExercise.value = exercises[currentStepIndex.value % exercises.length];
        initializeExerciseData();
      } else {
        console.error('No word-match exercises found in ExerciseSteps');
      }
    };

    // Initialize exercise data from the current exercise
    const initializeExerciseData = () => {
      if (currentExercise.value && currentExercise.value.question) {
        const questionData = currentExercise.value.question;

        // Set title from exercise data or use default
        title.value = questionData.title || "Choose the correct translation";

        // Set the word to translate - try different possible field names
        word.value = questionData.word || questionData.text || '';

        // Set options - try different possible field names
        if (questionData.options && Array.isArray(questionData.options)) {
          options.value = [...questionData.options];
        } else if (questionData.choices && Array.isArray(questionData.choices)) {
          options.value = [...questionData.choices];
        } else {
          options.value = [];
          console.error('No options found in exercise data');
        }

        // Set correct option - try different possible field names
        correctOption.value = questionData.correctOption ||
          questionData.correctAnswer ||
          questionData.answer ||
          '';
      } else {
        console.error('Invalid exercise data structure:', currentExercise.value);
      }
    };

    // Initialize with an exercise from steps
    const init = () => {
      // Reset state
      selectedOption.value = "";
      isAnswerChecked.value = false;

      // Load exercise data
      loadExerciseData();
    };

    // Move to next exercise
    const moveToNextExercise = () => {
      currentStepIndex.value++;
      init();
    };

    // Handle option selection
    const handleOptionSelect = (option) => {
      selectedOption.value = option;

      // Enable "Kontrol Et" button when an option is selected
      if (window.mainLayout) {
        if (typeof window.mainLayout.canCheck === 'object' && window.mainLayout.canCheck.value !== undefined) {
          window.mainLayout.canCheck.value = true;
        } else {
          window.mainLayout.canCheck = true;
        }
      }
    };

    // Check answer
    const checkAnswer = () => {
      if (!selectedOption.value) return false;

      const isCorrect = selectedOption.value === correctOption.value;

      // Update global state
      const store = window.store || {};
      if (isCorrect && store.increaseScore) {
        store.increaseScore(10);
      } else if (!isCorrect && store.decreaseHearts) {
        store.decreaseHearts();
      }

      // Update UI state
      isAnswerChecked.value = true;

      if (window.mainLayout) {
        if (window.mainLayout.showResult) {
          window.mainLayout.showResult.value = true;
        } else {
          window.mainLayout.showResult = ref(true);
        }

        if (window.mainLayout.isCorrect) {
          window.mainLayout.isCorrect.value = isCorrect;
        } else {
          window.mainLayout.isCorrect = ref(isCorrect);
        }

        if (window.mainLayout.correctAnswer) {
          window.mainLayout.correctAnswer.value = correctOption.value;
        } else {
          window.mainLayout.correctAnswer = ref(correctOption.value);
        }
      }

      return {
        isCorrect,
        userAnswer: selectedOption.value,
        correctAnswer: correctOption.value
      };
    };

    // Continue to next exercise
    const onContinue = () => {
      if (isAnswerChecked.value) {
        moveToNextExercise();

        // Reset UI state
        if (window.mainLayout) {
          if (window.mainLayout.canCheck) {
            window.mainLayout.canCheck.value = false;
          }

          if (window.mainLayout.showResult) {
            window.mainLayout.showResult.value = false;
          }
        }
      }
    };

    // Initialize from props if available or from ExerciseSteps otherwise
    onMounted(() => {
      if (props.exerciseData && props.exerciseData.question) {
        // Initialize from props
        currentExercise.value = props.exerciseData;
        initializeExerciseData();
      } else {
        // Initialize from ExerciseSteps
        loadExerciseData();
      }

      // Make sure canCheck is set to false initially
      if (window.mainLayout) {
        if (typeof window.mainLayout.canCheck === 'object' && window.mainLayout.canCheck.value !== undefined) {
          window.mainLayout.canCheck.value = false;
        } else {
          window.mainLayout.canCheck = false;
        }
      }

      // Set the active exercise component for global use
      window.activeExerciseComponent = {
        checkAnswer,
        onContinue
      };
    });

    return {
      title,
      word,
      options,
      selectedOption,
      isAnswerChecked,
      correctOption,
      handleOptionSelect
    };
  }
}
</script>

<style scoped>
.exercise-container {
  display: flex;
  align-items: center;
  flex-direction: column;
  font-size: 19px;
  justify-content: center;
  text-align: center;
  width: 100%;
}

.exercise-component {
  display: flex;
  flex-direction: column;
  align-items: start;
  width: 100%;
  max-width: 600px;
  padding: 20px 0;
}

.options-container {
  width: 100%;
  margin-top: 20px;
}

.options-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 100%;
}

.option-item {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 10px;
  cursor: pointer;
}

.option-item:hover {
  background-color: #f0f0f0;
}

@media (min-width: 700px) {
  .exercise-component {
    width: 600px;
  }
}
</style>
