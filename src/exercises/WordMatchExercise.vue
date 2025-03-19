<template>
  <div class="exercise-container">
    <div class="d-flex flex-column align-items-start w-100 mx-auto" style="max-width: 600px;">
      <div class="w-100">
        <div class="d-flex flex-column gap-3 w-100">
          <option-button v-for="(option, index) in options" :key="index" :number="index + 1" :text="option.name"
            :isSelected="selectedOption === option.name"
            :isCorrect="isAnswerChecked && selectedOption === correctOption && option.name === correctOption"
            :isDisabled="isAnswerChecked"
            :className="'word-match-option d-flex align-items-center justify-content-center p-3 border border-1 rounded-2 option-item'"
            @select="handleOptionSelect(option.name)" />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
const OptionButton = window["vue3-sfc-loader"].loadModule(
  './src/components/common/OptionButton.vue',
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

    const title = ref("Choose the correct translation");
    const word = ref("");
    const options = ref([]);
    const selectedOption = ref("");
    const isAnswerChecked = ref(false);
    const correctOption = ref("");
    const currentExercise = ref(null);
    const currentStepIndex = ref(0);

    const loadExerciseData = () => {
      let exercises = [];

      if (window.exerciseStepsManager) {
        exercises = window.exerciseStepsManager.getStepsByType('word-match') || [];
      } else if (window.exerciseSteps) {
        exercises = window.exerciseSteps.filter(step => step.type === 'word-match') || [];
      }

      if (exercises && exercises.length > 0) {
        currentExercise.value = exercises[currentStepIndex.value % exercises.length];
        initializeExerciseData();
      }
    };

    const initializeExerciseData = () => {
      if (currentExercise.value && currentExercise.value.question) {
        const questionData = currentExercise.value.question;

        title.value = questionData.title || "Choose the correct translation";
        word.value = questionData.word || questionData.text || '';

        if (questionData.options && Array.isArray(questionData.options)) {
          options.value = questionData.options.map(option => {
            return {
              name: option.text || option.name || '',
              imageUrl: option.imageUrl || ''
            };
          });
        } else if (questionData.choices && Array.isArray(questionData.choices)) {
          options.value = questionData.choices.map(choice => {
            return {
              name: choice.text || choice.name || '',
              imageUrl: choice.imageUrl || ''
            };
          });
        } else {
          options.value = [];
        }

        correctOption.value = questionData.correctOption ||
          questionData.correctAnswer ||
          questionData.answer ||
          '';
      }
    };

    const init = () => {
      selectedOption.value = "";
      isAnswerChecked.value = false;
      loadExerciseData();
    };

    const moveToNextExercise = () => {
      currentStepIndex.value++;
      init();
    };

    const handleOptionSelect = (option) => {
      selectedOption.value = option;

      if (window.mainLayout) {
        if (typeof window.mainLayout.canCheck === 'object' && window.mainLayout.canCheck.value !== undefined) {
          window.mainLayout.canCheck.value = true;
        } else {
          window.mainLayout.canCheck = true;
        }
      }
    };

    const checkAnswer = () => {
      if (!selectedOption.value) {
        return {
          isCorrect: false,
          userAnswer: '',
          correctAnswer: correctOption.value
        };
      }

      const isCorrect = selectedOption.value === correctOption.value;

      const store = window.store || {};
      if (isCorrect && store.increaseScore) {
        store.increaseScore(10);
      } else if (!isCorrect && store.decreaseHearts) {
        store.decreaseHearts();
      }

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

    const onContinue = () => {
      if (isAnswerChecked.value) {
        moveToNextExercise();
        isAnswerChecked.value = false;

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

    onMounted(() => {
      if (props.exerciseData && props.exerciseData.question) {
        currentExercise.value = props.exerciseData;
        initializeExerciseData();
      } else {
        loadExerciseData();
      }

      if (window.mainLayout) {
        if (typeof window.mainLayout.canCheck === 'object' && window.mainLayout.canCheck.value !== undefined) {
          window.mainLayout.canCheck.value = false;
        } else {
          window.mainLayout.canCheck = false;
        }
      }

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
.option-item:hover {
  background-color: #f0f0f0;
}
</style>