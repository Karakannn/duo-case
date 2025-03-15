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
    const isChecked = ref(false);
    const showResult = ref(false);
    
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
            class: isCorrect.value ? 'text-success fw-bold' : 'text-danger fw-bold'
          }, selectedWord.value),
          h('span', {}, ' ' + sentenceSuffix)
        ])
      ]);
    };
    
    // Check answer
    const checkAnswer = () => {
      console.log('FillInBlankExercise - checkAnswer() çağrıldı');
      if (!selectedWord.value) {
        console.log('FillInBlankExercise - Seçili kelime yok, işlem yapılmadı');
        return;
      }
      
      isChecked.value = true;
      isCorrect.value = selectedWord.value === correctAnswer;
      console.log('FillInBlankExercise - Cevap kontrol edildi:', isCorrect.value ? 'doğru' : 'yanlış');
      
      // Update main layout
      if (window.mainLayout) {
        const mainLayout = window.mainLayout;
        
        // Cevap doğruysa puan artır
        if (isCorrect.value && window.store && typeof window.store.increaseScore === 'function') {
          window.store.increaseScore(10); // Her doğru cevap için 10 puan
          console.log('FillInBlankExercise - Puan artırıldı:', window.store.getScore());
        }
        
        // Sonuç ekranını göster
        mainLayout.updateResultState({
          show: true,
          isCorrect: isCorrect.value,
          correctAnswer: isCorrect.value ? '' : getCorrectAnswerText()
        });
        
        // Sonucu bildir
        mainLayout.showResultModal(isCorrect.value);
      } else {
        console.error('FillInBlankExercise - window.mainLayout bulunamadı!');
      }
      
      return isCorrect.value;
    };
    
    // Reset exercise
    const reset = () => {
      console.log('FillInBlankExercise - reset() çağrıldı');
      selectedWord.value = "";
      isCorrect.value = false;
      isChecked.value = false;
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
        onContinue,
        renderResultContent: getResultContent
      };
      console.log('FillInBlankExercise - activeExerciseComponent:', window.activeExerciseComponent);
    });
    
    // Update check button when word changes
    watch(selectedWord, val => { 
      if (window.mainLayout) window.mainLayout.canCheck.value = !!val; 
    });
    
    return {
      title, sentenceImage, sentencePrefix, sentenceSuffix, placeholder,
      options, correctAnswer, selectedWord, isCorrect, isChecked, showResult, 
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
