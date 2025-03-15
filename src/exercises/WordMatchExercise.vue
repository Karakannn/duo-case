<template>
  <div class="exercise-component">
    <div class="word-container mb-4 d-flex align-items-center justify-content-center">
      <div class="character-image me-3">
        <img src="/src/assets/images/character.svg" alt="Character" class="img-fluid" style="height: 100px;">
      </div>
      <div class="word-badge badge bg-secondary rounded-pill fs-5 px-3 py-2">
        {{ word }}
      </div>
    </div>
    
    <div class="options-container">
      <div class="option-list d-flex flex-column gap-2">
        <Button 
          v-for="(option, index) in options" 
          :key="index"
          variant="primaryOutline"
          :class="selectedOption === option ? 'selected' : ''"
          @click="selectOption(option)"
          :disabled="showResult"
        >
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
  setup() {
    const { ref, onMounted, nextTick } = Vue;

    // Merkezi store'u kullan
    const stepStore = window.useStepStore();
    
    // Merkezi useExercise composable'ını kullan
    const exerciseManager = window.useExercise({
      exerciseName: 'word-match'
    });

    // Egzersiz verisi
    const word = ref("elma");
    const options = ref(["apple", "car", "house", "boat"]);
    const correctOption = ref("apple");
    const selectedOption = ref(null);

    // Cevap kontrolü - merkezi doğrulama mekanizmasını kullan
    function checkAnswer() {
      if (!selectedOption.value) {
        return null;
      }
      
      // Doğru/yanlış kontrolü
      const isCorrect = selectedOption.value === correctOption.value;
      
      // MainLayout'un modalı göstermesi için sonucu döndür
      return {
        isCorrect,
        correctAnswer: correctOption.value,
        show: true
      };
    }

    // Durum sıfırlama
    function resetState() {
      selectedOption.value = null;
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

    // Seçenek seçildiğinde MainLayout'un kontrol butonunu aktifleştir
    function selectOption(option) {
      selectedOption.value = option;
      
      // MainLayout'un kontrol butonunu etkinleştir
      if (window.mainLayout) {
        window.mainLayout.canCheck.value = true;
      }
    }

    // Bileşen yüklendiğinde
    onMounted(() => {
      console.log("WordMatchExercise component loaded");
      resetState();
      
      // Global değişkene referans ekle - MainLayout'un erişmesi için
      window.activeExerciseComponent = {
        checkAnswer,
        renderResultContent: exerciseManager.renderResultContent
      };
    });

    return {
      word,
      options,
      selectedOption,
      selectOption,
      showResult: exerciseManager.showResult
    };
  }
}
</script>

<style scoped>
.word-badge {
  font-size: 1.5rem;
}

.options-container {
  max-width: 450px;
  margin: 0 auto;
}

.option-list button {
  text-align: left;
  padding: 15px;
  margin-bottom: 10px;
  border-radius: 10px;
  font-size: 1.1rem;
}

.option-list button.selected {
  background-color: #58a700;
  color: white;
  border-color: #58a700;
}
</style>
