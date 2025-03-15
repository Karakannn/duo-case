<template>
  <exercise-container :title="title">
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
          <button 
            class="btn btn-outline-secondary rounded-pill w-100 py-2"
            :class="{ 'selected': selectedWord === option }"
            @click="!showResult && (selectedWord = option)"
            :disabled="showResult"
          >
            {{ option }}
          </button>
        </div>
      </div>
    </div>
  </exercise-container>
</template>

<script>
export default {
  name: 'FillInBlankExercise',
  components: {
    ExerciseContainer: Vue.defineAsyncComponent(() => window["vue3-sfc-loader"].loadModule("./src/components/common/ExerciseContainer.vue", window.sfcOptions))
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
    const isCorrect = ref(false);
    const showResult = ref(false);
    
    // Get correct answer text for display
    const getCorrectAnswerText = () => {
      return correctAnswer;
    };
    
    // Check answer
    const checkAnswer = () => {
      console.log('FillInBlankExercise - checkAnswer() çağrıldı');
      if (!selectedWord.value) return;
      
      isCorrect.value = selectedWord.value === correctAnswer;
      showResult.value = true;
      
      // Update store
      const store = window.store || {};
      if (isCorrect.value && store.increaseScore) {
        console.log('FillInBlankExercise - store.increaseScore çağrılıyor');
        store.increaseScore(15);
      } else if (!isCorrect.value && store.decreaseHearts) {
        console.log('FillInBlankExercise - store.decreaseHearts çağrılıyor');
        store.decreaseHearts();
      }
      
      // Update layout state
      if (window.mainLayout) {
        console.log('FillInBlankExercise - mainLayout state güncelleniyor');
        window.mainLayout.showResult.value = true;
        window.mainLayout.isCorrect.value = isCorrect.value;
        window.mainLayout.correctAnswer.value = getCorrectAnswerText();
      } else {
        console.error('FillInBlankExercise - window.mainLayout mevcut değil!');
      }
      
      console.log('FillInBlankExercise - isCorrect:', isCorrect.value);
      return isCorrect.value;
    };
    
    // Reset exercise
    const reset = () => {
      console.log('FillInBlankExercise - reset() çağrıldı');
      selectedWord.value = "";
      isCorrect.value = false;
      showResult.value = false;
      if (window.mainLayout) window.mainLayout.canCheck.value = false;
    };
    
    // Handle continue action
    const onContinue = () => {
      console.log('FillInBlankExercise - onContinue() çağrıldı, isCorrect:', isCorrect.value);
      if (isCorrect.value) {
        console.log('FillInBlankExercise - emit("complete") çağrılıyor');
        emit('complete');
      } else {
        console.log('FillInBlankExercise - reset() çağrılıyor (yanlış cevap durumunda)');
        reset();
      }
    };
    
    // Initialize
    onMounted(() => {
      console.log('FillInBlankExercise - onMounted çağrıldı');
      reset();
      if (window.activeExerciseComponent) {
        console.log('FillInBlankExercise - eski activeExerciseComponent sıfırlanıyor');
        window.activeExerciseComponent = null;
      }
      
      // Make this component accessible globally
      console.log('FillInBlankExercise - yeni activeExerciseComponent oluşturuluyor');
      window.activeExerciseComponent = {
        checkAnswer,
        isCorrect,
        getCorrectAnswerText,
        onContinue
      };
      console.log('FillInBlankExercise - activeExerciseComponent:', window.activeExerciseComponent);
    });
    
    // Update check button when word changes
    watch(selectedWord, val => { 
      if (window.mainLayout) window.mainLayout.canCheck.value = !!val; 
    });
    
    return {
      title, sentenceImage, sentencePrefix, sentenceSuffix, placeholder,
      options, correctAnswer, selectedWord, isCorrect, showResult, 
      checkAnswer, reset
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
