<template>
  <div class="exercise-container">
    <div class="exercise-component d-flex flex-column align-items-center justify-content-center gap-3">
      <div class="sentence-container mb-4">
        <div class="sentence-display d-flex fs-4 text-white">
          <span v-for="(part, index) in sentenceParts" :key="index">
            <span v-if="part.type === 'text'">{{ part.content }}</span>
            <span v-else-if="part.type === 'blank'" :ref="setBlankRef" class="blank-area">
            </span>
          </span>
        </div>
      </div>

      <div class="options-container">
        <div class="options-list d-flex flex-wrap justify-content-center origin">
          <div v-for="(option, index) in options" :key="index" class="word-container">
            <FillWord :text="option" :index="index" :blankElementRef="blankRef" :ref="el => wordRefs[index] = el"
              :isCorrect="isAnswerChecked && currentWordIndex === index && isCorrect"
              :isIncorrect="isAnswerChecked && currentWordIndex === index && !isCorrect" :isDisabled="isAnswerChecked"
              @word-selected="handleWordSelection" @animation-start="animationStarted"
              @animation-end="animationEnded" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  components: {
    Button: Vue.defineAsyncComponent(() => window["vue3-sfc-loader"].loadModule("./src/components/common/Button.vue", window.sfcOptions)),
    FillWord: Vue.defineAsyncComponent(() => window["vue3-sfc-loader"].loadModule("./src/components/common/FillWord.vue", window.sfcOptions))
  },
  props: {
    exerciseData: {
      type: Object,
      default: () => ({})
    }
  },
  setup(props) {
    const { onMounted, ref, reactive, computed } = Vue;
    const exercise = window.useFillInBlank(props);
    const blankRef = ref(null);
    const selectedWord = ref(null);
    const isAnimating = ref(false);
    const display = ref({});
    const isAnswerChecked = ref(false);
    const isCorrect = ref(false);
    const wordRefs = reactive({});
    const currentWordIndex = ref(null);

    const setBlankRef = (el) => {
      if (el) {
        blankRef.value = el;
      }
    };

    const handleWordSelection = async (data) => {
      if (isAnimating.value) return;

      if (data.location === 'destination') {
        if (currentWordIndex.value === data.index) {
          wordRefs[data.index].moveToOrigin();
          selectedWord.value = null;
          currentWordIndex.value = null;
          exercise.selectOption(null);
        }
      }
      else if (data.location === 'origin') {
        if (currentWordIndex.value !== null) {
          if (currentWordIndex.value !== data.index) {
            wordRefs[currentWordIndex.value].moveToOrigin();
            selectedWord.value = data.text;
            currentWordIndex.value = data.index;
            wordRefs[data.index].moveToDestination();
            exercise.selectOption(data.text);
          }
        } else {
          selectedWord.value = data.text;
          currentWordIndex.value = data.index;
          wordRefs[data.index].moveToDestination();
          exercise.selectOption(data.text);
        }
      }
    };

    const selectOption = (data) => {
      handleWordSelection(data);
    };

    const animationStarted = () => {
      isAnimating.value = true;
    };

    const animationEnded = (data) => {
      isAnimating.value = false;
    };

    const loadExerciseData = () => {
      const { exerciseData } = props;
      if (exerciseData && exerciseData.question) {
        const { question } = exerciseData;
        display.value = exerciseData.display || {};
      }
    };

    onMounted(() => {
      loadExerciseData();
      exercise.init();

      if (blankRef.value) {
        while (blankRef.value.firstChild) {
          blankRef.value.removeChild(blankRef.value.firstChild);
        }
      }

      window.activeExerciseComponent = {
        checkAnswer: () => {
          isAnswerChecked.value = true;
          const result = exercise.checkAnswer();
          isCorrect.value = result.isCorrect;
          return result;
        },
        onContinue: () => {
          isAnswerChecked.value = false;
          isCorrect.value = false;
          exercise.onContinue();
        },
        renderResultContent: exercise.renderResultContent
      };
    });

    return {
      ...exercise,
      blankRef,
      wordRefs,
      setBlankRef,
      handleWordSelection,
      animationStarted,
      animationEnded,
      display,
      currentWordIndex,
      isAnswerChecked,
      isCorrect
    };
  }
}
</script>

<style scoped>
.exercise-container {
  display: grid;
  align-content: start;
  grid-template-rows: min-content min-content;
}

.category {
  color: var(--color-beetle);
  font-weight: 700;
  font-size: 19px;
}

.title-container {
  display: flex;
  flex-direction: column;
  align-items: start;
  gap: 8px;
}

.title-container h5 {
  font-size: 32px;
  font-weight: 700;
  color: var(--color-hare);
}

.blank-space {
  display: inline-block;
  min-width: 120px;
  min-height: 36px;
  padding: 0 8px;
  border-bottom: 2px solid #58cc02;
  font-weight: bold;
  color: #58cc02;
  text-align: center;
  vertical-align: bottom;
  padding-bottom: 2px;
}

.options-container {
  max-width: 600px;
  margin: 0 auto;
}

.options-list {
  width: 100%;
}

.word-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  transition: 0.25s ease;
  min-height: 50px;
  min-width: 50px;
  z-index: 1;
  position: relative;
  background: rgb(55, 70, 79);
  border-radius: 12px;
  padding: 4px;
  margin: 0 4px;
}

.blank-area {
  min-height: 60px;
  min-width: 120px;
  border-bottom: 2px solid #ccc;
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 0 20px;
  z-index: 5;
  position: relative;
  padding-bottom: 2px;
}

@media (min-width: 700px) {
  .exercise-container {
    align-items: center;
    align-content: center;
  }
}
</style>