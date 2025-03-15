<template>
  <exercise-container :title="title">
    <div v-if="audioWord" class="audio-container mb-4 text-center">
      <div class="audio-button">
        <span class="badge bg-primary rounded-pill fs-5 px-4 py-2">
          <i class="fas fa-volume-up me-2"></i>
          <span>{{ audioWord }}</span>
        </span>
      </div>
    </div>
    
    <div class="row g-3">
      <div v-for="(option, index) in options" :key="index" class="col-6">
        <div 
          :class="['option-card', 'card', 'p-3', 'h-100', 'text-center', 
                  selected === index ? 'selected' : '',
                  showResult && index === selected ? (isCorrect ? 'correct' : 'incorrect') : '']"
          @click="!showResult && selectOption(index)"
        >
          <div class="option-image mb-2">
            <img :src="option.image" :alt="option.text" class="img-fluid mx-auto" style="max-height: 100px;">
          </div>
          <div class="option-text">
            {{ option.text }}
          </div>
        </div>
      </div>
    </div>
  </exercise-container>
</template>

<script>
export default {
  name: 'PictureMatchExercise',
  components: {
    ExerciseContainer: Vue.defineAsyncComponent(() => window["vue3-sfc-loader"].loadModule("./src/components/common/ExerciseContainer.vue", window.sfcOptions))
  },
  emits: ['complete'],
  setup(props, { emit }) {
    const { ref, computed, onMounted, watch } = Vue;
    
    // State
    const title = "Bunlardan hangisi \"çay\"?";
    const audioWord = "çay";  // This would be the word played in audio
    const options = ref([
      { text: "milk", image: "/src/assets/images/milk.svg" },
      { text: "coffee", image: "/src/assets/images/coffee.svg" },
      { text: "tea", image: "/src/assets/images/tea.svg" }
    ]);
    const correctIndex = 2; // "tea" is correct (index 2)
    const selected = ref(null);
    const isCorrect = ref(false);
    const showResult = ref(false);
    
    // Get correct answer text for display
    const getCorrectAnswerText = () => {
      if (correctIndex === null || correctIndex < 0 || correctIndex >= options.value.length) {
        return '';
      }
      return options.value[correctIndex].text || '';
    };
    
    // Safely select an option
    const selectOption = (index) => {
      if (index !== null && index >= 0 && index < options.value.length) {
        selected.value = index;
      }
    };
    
    // Check answer and update state
    const checkAnswer = () => {
      console.log('PictureMatchExercise - checkAnswer() çağrıldı');
      if (selected.value === null) return;
      
      isCorrect.value = selected.value === correctIndex;
      showResult.value = true;
      
      const store = window.store || {};
      if (isCorrect.value && store.increaseScore) {
        console.log('PictureMatchExercise - store.increaseScore çağrılıyor');
        store.increaseScore(10);
      } else if (!isCorrect.value && store.decreaseHearts) {
        console.log('PictureMatchExercise - store.decreaseHearts çağrılıyor');
        store.decreaseHearts();
      }
      
      // Update layout state
      if (window.mainLayout) {
        console.log('PictureMatchExercise - mainLayout state güncelleniyor');
        window.mainLayout.showResult.value = true;
        window.mainLayout.isCorrect.value = isCorrect.value;
        window.mainLayout.correctAnswer.value = getCorrectAnswerText();
      } else {
        console.error('PictureMatchExercise - window.mainLayout mevcut değil!');
      }
      
      console.log('PictureMatchExercise - isCorrect:', isCorrect.value);
      return isCorrect.value;
    };
    
    // Reset exercise
    const reset = () => {
      console.log('PictureMatchExercise - reset() çağrıldı');
      selected.value = null;
      isCorrect.value = false;
      showResult.value = false;
      if (window.mainLayout) window.mainLayout.canCheck.value = false;
    };
    
    // Handle continue action
    const onContinue = () => {
      console.log('PictureMatchExercise - onContinue() çağrıldı, isCorrect:', isCorrect.value);
      if (isCorrect.value) {
        console.log('PictureMatchExercise - emit("complete") çağrılıyor');
        emit('complete');
      } else {
        console.log('PictureMatchExercise - reset() çağrılıyor (yanlış cevap durumunda)');
        reset();
      }
    };
    
    // Initialize
    onMounted(() => {
      console.log('PictureMatchExercise - onMounted çağrıldı');
      reset();
      if (window.activeExerciseComponent) {
        console.log('PictureMatchExercise - eski activeExerciseComponent sıfırlanıyor');
        window.activeExerciseComponent = null;
      }
      
      // Make this component accessible globally
      console.log('PictureMatchExercise - yeni activeExerciseComponent oluşturuluyor');
      window.activeExerciseComponent = {
        checkAnswer,
        isCorrect,
        getCorrectAnswerText,
        onContinue
      };
      console.log('PictureMatchExercise - activeExerciseComponent:', window.activeExerciseComponent);
    });
    
    // Update check button when selection changes
    watch(selected, val => { 
      if (window.mainLayout) {
        window.mainLayout.canCheck.value = val !== null;
      }
    });
    
    return {
      title, 
      audioWord, 
      options, 
      selected, 
      correctIndex, 
      isCorrect, 
      showResult, 
      checkAnswer, 
      selectOption,
      getCorrectAnswerText,
      reset, 
      onContinue
    };
  }
}
</script>

<style scoped>
.option-card {
  cursor: pointer;
  transition: all 0.2s ease;
  background-color: #2a2a2a;
  color: white;
  border: 2px solid transparent;
}

.option-card:hover:not(.selected) {
  border-color: #4b4b4b;
  transform: translateY(-2px);
}

.option-card.selected {
  border-color: #58a700;
  background-color: #1d3b05;
}

.option-card.correct {
  border-color: #58a700;
  background-color: #1d3b05;
}

.option-card.incorrect {
  border-color: #ea2b2b;
  background-color: #3b1515;
}

.audio-button {
  display: inline-block;
  cursor: pointer;
  transition: all 0.2s ease;
}

.audio-button:hover {
  transform: scale(1.05);
}

.audio-container {
  margin-top: 10px;
  margin-bottom: 20px;
}
</style>
