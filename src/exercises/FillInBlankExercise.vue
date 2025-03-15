<template>
  <div class="exercise-component">
    <div class="sentence-container mb-4">
      <div class="card bg-light p-4 rounded-4">
        <img :src="sentenceImage" alt="Sentence context" class="img-fluid mb-3" style="max-height: 180px;">
        <div class="sentence d-flex align-items-center justify-content-center flex-wrap gap-2">
          <span class="prefix fs-5">{{ sentencePrefix }}</span>
          <div class="blank position-relative">
            <input 
              type="text" 
              v-model="selectedWord" 
              class="form-control text-primary fw-bold text-center border-primary border-bottom border-0 bg-transparent"
              readonly
              :placeholder="placeholder"
            >
          </div>
          <span class="suffix fs-5">{{ sentenceSuffix }}</span>
        </div>
      </div>
    </div>
    
    <div class="options-container">
      <div class="row g-2 mb-4">
        <div v-for="(option, index) in options" :key="index" class="col-6">
          <Button 
            variant="primaryOutline"
            :class="{ 'selected': selectedWord === option }"
            @click="!showResult && (selectedWord = option)"
            :disabled="showResult"
          >
            {{ option }}
          </Button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'FillInBlankExercise',
  components: {
    Button: Vue.defineAsyncComponent(() => window["vue3-sfc-loader"].loadModule("./src/components/common/Button.vue", window.sfcOptions))
  },
  emits: ['complete'],
  setup(props, { emit }) {
    const { ref, computed, onMounted, watch } = Vue;
    
    // State
    const title = "Kumpletuhin ang pangungusap";
    const sentenceImage = "/src/assets/images/coffee.svg";
    const sentencePrefix = "Oh, the bus is";
    const sentenceSuffix = "today!";
    const placeholder = "___";
    const options = ref(["cloudy", "windy", "spicy", "busy"]);
    const correctAnswer = "busy";
    const selectedWord = ref("");
    
    // useExercise composable'ını kullan
    const exercise = window.useExercise({
      exerciseName: 'FillInBlankExercise',
      correctAnswerFn: () => selectedWord.value === correctAnswer,
      validateFn: () => !!selectedWord.value,
      resetStateFn: () => {
        selectedWord.value = "";
      },
      emit
    });
    
    // Kelime seçildiğinde check butonunu etkinleştir
    watch(selectedWord, (newValue) => {
      exercise.updateMainLayout(!!newValue);
    });
    
    // Get correct answer text for display
    const getCorrectAnswerText = () => {
      return correctAnswer;
    };
    
    // Get result content for result modal
    const getResultContent = () => {
      // Bu fonksiyon, sonuç modalında gösterilecek özel içeriği oluşturabilir
      const h = Vue.h;
      return h('div', { class: 'answer-section my-3' }, [
        h('div', { class: 'mb-2 fs-5' }, [
          h('span', {}, sentencePrefix + ' '),
          h('span', { 
            class: exercise.isCorrect.value ? 'text-success fw-bold' : 'text-danger fw-bold'
          }, selectedWord.value),
          h('span', {}, ' ' + sentenceSuffix)
        ])
      ]);
    };
    
    return {
      title,
      sentenceImage,
      sentencePrefix,
      sentenceSuffix,
      placeholder,
      options,
      selectedWord,
      ...exercise,
      getCorrectAnswerText,
      getResultContent
    };
  }
}
</script>

<style scoped>
.sentence-container {
  margin-bottom: 30px;
}

.blank {
  min-width: 100px;
}

.blank input {
  font-size: 1.2rem;
  box-shadow: none !important;
  border-radius: 0;
  padding: 4px 8px;
}

.blank input::placeholder {
  color: #7c7c7c;
}

.options-container button {
  font-size: 1rem;
  transition: all 0.2s ease;
}

.options-container button:hover:not(:disabled) {
  background-color: #3b3b3b;
  border-color: #4b4b4b;
}

.options-container button.selected {
  background-color: #3b82f6;
  border-color: #3b82f6;
  color: white;
}
</style>
