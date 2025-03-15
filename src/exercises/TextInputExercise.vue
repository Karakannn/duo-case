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
            @keyup.enter="handleSubmit()"
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
    
    // Merkezi store ve exercise manager'ı kullan
    const stepStore = window.useStepStore();
    const exerciseManager = window.useExercise({
      exerciseName: 'text-input'
    });
    
    // State
    const title = "Çevirin";
    const characterImage = "/src/assets/images/character.svg";
    const phraseToTranslate = "coffee";
    const correctAnswer = "kahve";
    const userInput = ref("");
    
    // Handle submit (check answer) - Enter tuşuyla kontrol
    const handleSubmit = () => {
      if (window.mainLayout && window.mainLayout.handleFooterButton) {
        window.mainLayout.handleFooterButton(); 
      }
    };
    
    // Cevap kontrolü - merkezi doğrulama mekanizmasını kullan
    function checkAnswer() {
      if (!userInput.value) {
        return null;
      }
      
      // exerciseManager'a gerekli parametreleri gönder
      return exerciseManager.checkAnswer({
        userInput: userInput.value,
        correctText: correctAnswer,
        allowPartialMatch: false
      });
    }
    
    // Durum sıfırlama
    function resetState() {
      userInput.value = "";
      exerciseManager.reset();
    }
    
    // Bir sonraki egzersize geç
    function onContinue() {
      // Önce kendimizi sıfırlayalım
      resetState();
      
      // Sonra bir sonraki adıma geçelim
      if (window.mainLayout && window.mainLayout.nextExercise) {
        window.mainLayout.nextExercise();
      }
    }
    
    // Initialize
    onMounted(() => {
      resetState();
      
      // Make this component accessible globally
      window.activeExerciseComponent = {
        checkAnswer,
        onContinue,
        renderResultContent: exerciseManager.renderResultContent
      };
    });
    
    // Update check button when input changes
    watch(userInput, val => { 
      if (window.mainLayout) {
        window.mainLayout.canCheck.value = !!val;
      }
    });
    
    return {
      title,
      characterImage,
      phraseToTranslate,
      correctAnswer,
      userInput,
      handleSubmit,
      
      // useExercise'dan gelen değerleri yayınla
      showResult: exerciseManager.showResult
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
