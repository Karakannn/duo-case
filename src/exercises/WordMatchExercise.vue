<template>
  <div class="exercise-component">
    <div class="word-container mb-4">
      <div class="word-display p-3 bg-light rounded-3 shadow-sm text-center">
        <h2>{{ word }}</h2>
      </div>
    </div>

    <div class="options-container">
      <div class="options-list">
        <Button v-for="(option, index) in options" :key="index" variant="primaryOutline"
          :class="selectedOption === option ? 'selected' : ''" @click="selectOption(option)">
          {{ option }}
        </Button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  components: {
    Button: Vue.defineAsyncComponent(() => window["vue3-sfc-loader"].loadModule("./src/components/common/Button.vue", window.sfcOptions))
  },
  props: {
    exerciseData: {
      type: Object,
      default: () => ({})
    }
  },
  setup(props) {
    const { onMounted } = Vue;

    // Kelime eşleştirme egzersiz composable'ını kullan
    const exercise = window.useWordMatch(props);

    // Bileşen yüklendiğinde
    onMounted(() => {
      // Başlangıç kurulumu
      exercise.init();

      // Global API'yi ayarla
      window.activeExerciseComponent = {
        checkAnswer: exercise.checkAnswer,
        onContinue: exercise.onContinue,
        renderResultContent: exercise.renderResultContent
      };
    });

    return {
      // State
      word: exercise.word,
      options: exercise.options,
      selectedOption: exercise.selectedOption,

      // Methods
      selectOption: exercise.selectOption
    };
  }
}
</script>

<style scoped>
.exercise-component {
  min-height: 450px;
}

.word-container {
  margin-bottom: 2rem;
}

.word-display {
  color: #333;
  margin: 0 auto;
  max-width: 500px;
}

.word-display h2 {
  font-size: 2rem;
  margin: 0;
}

.options-container {
  display: grid;
  font-size: 19px;
  height: 100%;
  justify-content: center;
  text-align: center;
  width: 100%;
  margin: 0 auto;
  grid-template-columns: 1fr;
  grid-template-rows: minmax(0, 1fr);
}

.options-list {
  display: grid;
  grid-gap: 16px;
  grid-template-rows: min-content minmax(0, 1fr);
}

.options-list button {
  width: 100%;
  padding: 1rem;
  margin-bottom: 0.5rem;
  text-align: center;
  font-size: 1.1rem;
  border: 2px solid #ddd;
  border-radius: 8px;
  background-color: white;
  transition: all 0.2s ease;
}

.options-list button:hover:not(:disabled) {
  background-color: #f5f5f5;
  transform: translateY(-2px);
}

.options-list button.selected {
  background-color: #58cc02;
  color: white;
  border-color: #58cc02;
}


@media (min-width: 700px) {
  .options-container {
    grid-template-columns: min-content;
    grid-template-rows: min-content;
  }

  .options-list {
    min-height: 450px;
    overflow: visible;
    width: 600px;

  }
}
</style>
