<template>
  <div class="exercise-component">
    <h1 class="title">Doğru anlamı seç</h1>
    
    <div class="word-container">
      <div class="word-bubble">
        <div class="word-text">{{ word }}</div>
      </div>
    </div>

    <div class="options-container">
      <div class="options-list">
        <OptionButton 
          v-for="(option, index) in options" 
          :key="index" 
          :number="index + 1"
          :text="option"
          :isSelected="selectedOption === option"
          @select="selectOption(option)"
        />
      </div>
    </div>
  </div>
</template>

<script>
export default {
  components: {
    OptionButton: Vue.defineAsyncComponent(() => window["vue3-sfc-loader"].loadModule("./src/components/exercises/OptionButton.vue", window.sfcOptions))
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
  display: flex;
  flex-direction: column;
  align-items: center;
  min-height: 450px;
  padding: 20px;
  color: white;
}

.title {
  font-size: 28px;
  font-weight: 700;
  margin-bottom: 32px;
  text-align: center;
}

.word-container {
  display: flex;
  justify-content: center;
  margin-bottom: 32px;
  width: 100%;
}

.word-bubble {
  position: relative;
  background-color: var(--color-ui-700);
  padding: 12px 20px;
  border-radius: 8px;
  display: inline-block;
}

.word-bubble::after {
  content: '';
  position: absolute;
  bottom: -10px;
  left: 20px;
  width: 0;
  height: 0;
  border-left: 10px solid transparent;
  border-right: 10px solid transparent;
  border-top: 10px solid var(--color-ui-700);
}

.word-text {
  font-size: 18px;
  font-weight: 700;
}

.options-container {
  width: 100%;
  max-width: 600px;
}

.options-list {
  display: flex;
  flex-direction: column;
  width: 100%;
}

@media (min-width: 700px) {
  .options-container {
    width: 600px;
  }
}
</style>
