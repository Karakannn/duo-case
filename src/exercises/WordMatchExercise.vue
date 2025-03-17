<template>
  <div class="exercise-container">
    <div class="exercise-component">
      <h1 class="exercise-title">{{ title }}</h1>

      <div class="character-container">
        <div class="speech-bubble-container">
          <div class="speech-bubble">
            <span class="word-text">{{ word }}</span>
          </div>
          <svg class="speech-icon" height="20" viewBox="0 0 18 20">
            <path class="speech-icon-path"
              d="M2.00358 19.0909H18V0.909058L0.624575 15.9561C-0.682507 17.088 0.198558 19.0909 2.00358 19.0909Z">
            </path>
            <path class="speech-icon-path" clip-rule="evenodd"
              d="M18 2.48935V0L0.83037 15.6255C-0.943477 17.2398 0.312833 20 2.82143 20H18V18.2916H16.1228H2.82143C1.98523 18.2916 1.56646 17.3716 2.15774 16.8335L16.1228 4.12436L18 2.48935Z"
              fill-rule="evenodd"></path>
          </svg>
        </div>
      </div>

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

.exercise-title {
  font-size: 32px;
  line-height: 1.25;
  margin: 0;
  text-align: left;
  width: 100%;
  color: rgb(241, 247, 251);
  font-weight: 700;
}

.character-container {
  display: flex;
  justify-content: start;
  align-items: flex-start;
  position: relative;
  margin: 20px 0 30px;
  width: 100%;
}

.speech-bubble-container {
  position: relative;
}

.speech-bubble {
  background: var(--color-snow);
  border: 2px solid var(--color-swan);
  border-radius: 12px;
  color: var(--color-eel);
  font-size: 1.25rem;
  font-weight: 500;
  line-height: 2rem;
  padding: 10px 14px;
}

.speech-icon {
  position: absolute;
  left: -16px;
  top: 50%;
  transform: translateY(-50%);
  top: 32px;
  color: var(--color-eel);
}

.speech-icon-path {
  fill: var(--color-snow);
  stroke: var(--color-swan);
}

.word-text {
  font-size: 24px;
  font-weight: 700;
  color: var(--color-eel);
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

.word-match-option {
  border-radius: 12px;
  gap: 10px;
}

@media (min-width: 700px) {
  .exercise-component {
    width: 600px;
  }
}
</style>
