<template>
  <div class="exercise-component">
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
  </div>
</template>

<script>
export default {
  name: 'TextInputExercise',
  components: {
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
    const isChecked = ref(false);
    
    // Get correct answer text for display
    const getCorrectAnswerText = () => {
      return correctAnswer;
    };
    
    // Get result content for result modal
    const getResultContent = () => {
      // Bu fonksiyon, sonuç modalında gösterilecek özel içeriği oluşturabilir
      const h = Vue.h;
      return h('div', { class: 'answer-section my-3' }, [
        h('div', { class: 'fs-5' }, [
          h('p', { class: 'mb-1' }, 'Çeviriniz:'),
          h('p', { 
            class: isCorrect.value ? 'text-success fw-bold' : 'text-danger fw-bold line-through'
          }, userInput.value || ''),
          !isCorrect.value && h('p', { class: 'text-success mt-2' }, [
            h('i', { class: 'fas fa-check-circle me-2' }),
            h('span', {}, correctAnswer)
          ])
        ])
      ]);
    };
    
    // Handle submit (check answer)
    const handleSubmit = () => {
      console.log('TextInputExercise - handleSubmit() çağrıldı');
      checkAnswer();
    };
    
    // Check answer
    const checkAnswer = () => {
      console.log('TextInputExercise - checkAnswer() çağrıldı');
      if (!userInput.value) {
        console.log('TextInputExercise - Kullanıcı girdisi boş, işlem yapılmadı');
        return;
      }
      
      isChecked.value = true;
      
      // Türkçe karakterlerden ve büyük/küçük harf farkından bağımsız karşılaştırma
      const normalizedUserInput = userInput.value.toLowerCase().trim();
      const normalizedCorrectAnswer = correctAnswer.toLowerCase().trim();
      
      isCorrect.value = normalizedUserInput === normalizedCorrectAnswer;
      console.log('TextInputExercise - Cevap kontrol edildi:', isCorrect.value ? 'doğru' : 'yanlış');
      
      // Update main layout
      if (window.mainLayout) {
        const mainLayout = window.mainLayout;
        
        // Cevap doğruysa puan artır
        if (isCorrect.value && window.store && typeof window.store.increaseScore === 'function') {
          window.store.increaseScore(15); // Metin girdisi zor olduğu için biraz daha fazla puan
          console.log('TextInputExercise - Puan artırıldı:', window.store.getScore());
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
        console.error('TextInputExercise - window.mainLayout bulunamadı!');
      }
      
      return isCorrect.value;
    };
    
    // Reset the exercise
    const reset = () => {
      console.log('TextInputExercise - reset() çağrıldı');
      userInput.value = "";
      isCorrect.value = false;
      showResult.value = false;
      isChecked.value = false;
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
        onContinue,
        renderResultContent: getResultContent
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
