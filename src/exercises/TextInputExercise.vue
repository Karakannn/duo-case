<template>
  <exercise-container :title="title">
    <div class="translation-container mb-4">
      <div class="character-section d-flex align-items-center justify-content-start mb-2">
        <div class="character-image">
          <img :src="characterImage" alt="Character" class="img-fluid" style="height: 80px;">
        </div>
        <div class="speech-bubble ms-3 badge bg-secondary rounded-pill fs-5 px-3 py-2">
          <i class="fas fa-volume-up me-2"></i>
          {{ phraseToTranslate }}
        </div>
      </div>
      
      <div class="input-section mt-4">
        <div class="form-floating">
          <input 
            type="text" 
            class="form-control bg-dark text-white border-secondary" 
            id="translation-input"
            placeholder="Type your answer"
            v-model="userInput"
            :disabled="showResult"
            @keyup.enter="!showResult && handleSubmit()"
          >
          <label for="translation-input" class="text-white-50">Type your answer</label>
        </div>
      </div>
    </div>
  </exercise-container>
</template>

<script>
export default {
  name: 'TextInputExercise',
  components: {
    ExerciseContainer: Vue.defineAsyncComponent(() => window["vue3-sfc-loader"].loadModule("./src/components/common/ExerciseContainer.vue", window.sfcOptions))
  },
  emits: ['complete'],
  setup(props, { emit }) {
    const { ref, onMounted, watch } = Vue;
    
    // State
    const title = "Çevirin";
    const characterImage = "/src/assets/images/character.svg";
    const phraseToTranslate = "coffee";
    const correctAnswer = "kahve";
    const userInput = ref("");
    const isCorrect = ref(false);
    const showResult = ref(false);
    
    // Check if the answer is close enough to be considered correct
    const isAnswerCorrect = (input) => {
      // Convert both strings to lowercase and trim whitespace for comparison
      const normalizedInput = input.toLowerCase().trim();
      const normalizedCorrect = correctAnswer.toLowerCase().trim();
      
      // For now, simple exact match
      return normalizedInput === normalizedCorrect;
    };
    
    // Get correct answer text for display
    const getCorrectAnswerText = () => {
      return correctAnswer;
    };
    
    // Handle submit (check answer)
    const handleSubmit = () => {
      console.log('TextInputExercise - handleSubmit() çağrıldı');
      if (!userInput.value) return false;
      
      isCorrect.value = isAnswerCorrect(userInput.value);
      showResult.value = true;
      
      // Update store with score or decrease hearts
      const store = window.store || {};
      if (isCorrect.value && store.increaseScore) {
        console.log('TextInputExercise - store.increaseScore çağrılıyor');
        store.increaseScore(10);
      } else if (!isCorrect.value && store.decreaseHearts) {
        console.log('TextInputExercise - store.decreaseHearts çağrılıyor');
        store.decreaseHearts();
      }
      
      // Update layout state
      if (window.mainLayout) {
        console.log('TextInputExercise - mainLayout state güncelleniyor');
        window.mainLayout.showResult.value = true;
        window.mainLayout.isCorrect.value = isCorrect.value;
        window.mainLayout.correctAnswer.value = getCorrectAnswerText();
      } else {
        console.error('TextInputExercise - window.mainLayout mevcut değil!');
      }
      
      console.log('TextInputExercise - isCorrect:', isCorrect.value);
      return isCorrect.value;
    };
    
    // Check answer (alias for handleSubmit)
    const checkAnswer = handleSubmit;
    
    // Reset the exercise
    const reset = () => {
      console.log('TextInputExercise - reset() çağrıldı');
      userInput.value = "";
      isCorrect.value = false;
      showResult.value = false;
      if (window.mainLayout) window.mainLayout.canCheck.value = false;
    };
    
    // Handle continue button click
    const onContinue = () => {
      console.log('TextInputExercise - onContinue() çağrıldı, isCorrect:', isCorrect.value);
      if (isCorrect.value) {
        console.log('TextInputExercise - emit("complete") çağrılıyor');
        emit('complete');
      } else {
        console.log('TextInputExercise - reset() çağrılıyor (yanlış cevap durumunda)');
        reset();
      }
    };
    
    // Initialize
    onMounted(() => {
      console.log('TextInputExercise - onMounted çağrıldı');
      reset();
      if (window.activeExerciseComponent) {
        console.log('TextInputExercise - eski activeExerciseComponent sıfırlanıyor');
        window.activeExerciseComponent = null;
      }
      
      // Make this component accessible globally
      console.log('TextInputExercise - yeni activeExerciseComponent oluşturuluyor');
      window.activeExerciseComponent = {
        checkAnswer,
        isCorrect,
        getCorrectAnswerText,
        onContinue
      };
      console.log('TextInputExercise - activeExerciseComponent:', window.activeExerciseComponent);
    });
    
    // Update check button when input changes
    watch(userInput, val => { 
      if (window.mainLayout) window.mainLayout.canCheck.value = !!val; 
    });
    
    return {
      title,
      characterImage,
      phraseToTranslate,
      correctAnswer,
      userInput,
      isCorrect,
      showResult,
      handleSubmit,
      reset
    };
  }
}
</script>

<style scoped>
.translation-container {
  margin-bottom: 20px;
}

.character-image {
  width: 80px;
  height: 80px;
}

.speech-bubble {
  position: relative;
  background: #444444;
}

.input-section {
  margin-top: 20px;
}

.form-floating input {
  height: 60px;
  font-size: 1.2rem;
}

.form-floating label {
  font-size: 1rem;
}
</style>
