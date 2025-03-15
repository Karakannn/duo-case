<template>
  <div class="exercise-component">
    <div class="sentence-container mb-4">
      <div class="card bg-light p-4 rounded-4">
        <div class="sentence d-flex align-items-center justify-content-center flex-wrap gap-2">
          <span class="prefix fs-5">{{ sentence.prefix }}</span>
          <div class="blank position-relative">
            <input 
              type="text" 
              v-model="selectedOption" 
              class="form-control text-primary fw-bold text-center border-primary border-bottom border-0 bg-transparent"
              readonly
              :placeholder="selectedOption ? '' : '___'"
            >
          </div>
          <span class="suffix fs-5">{{ sentence.suffix }}</span>
        </div>
      </div>
    </div>
    
    <div class="options-container">
      <div class="row g-2 mb-4">
        <div v-for="(option, index) in options" :key="index" class="col-6">
          <Button 
            variant="primaryOutline"
            :class="{ 'selected': selectedOption === option }"
            @click="selectOption(option)"
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
  components: {
    Button: Vue.defineAsyncComponent(() => window["vue3-sfc-loader"].loadModule("./src/components/common/Button.vue", window.sfcOptions))
  },
  setup() {
    const { ref, onMounted } = Vue;

    // Merkezi store'u kullan
    const stepStore = window.useStepStore();
    
    // Merkezi useExercise composable'ını kullan
    const exerciseManager = window.useExercise({
      exerciseName: 'fill-in-blank'
    });

    // Egzersiz verisi
    const sentence = ref({
      prefix: "The cat",
      suffix: "on the mat."
    });
    const options = ref(["sits", "sit", "sitting"]);
    const correctOption = ref("sits");
    const selectedOption = ref(null);

    // Cevap kontrolü - merkezi doğrulama mekanizmasını kullan
    function checkAnswer() {
      // exerciseManager'a gerekli parametreleri gönder
      return exerciseManager.checkAnswer({
        selectedOption: selectedOption.value,
        correctOption: correctOption.value
      });
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
      resetState();
      
      // Global değişkene referans ekle - MainLayout'un erişmesi için
      window.activeExerciseComponent = {
        checkAnswer,
        onContinue,
        renderResultContent: exerciseManager.renderResultContent
      };
    });

    return {
      sentence,
      options,
      selectedOption,
      selectOption,
      showResult: exerciseManager.showResult
    };
  }
}
</script>

<style scoped>
.sentence-container {
  max-width: 500px;
  margin: 0 auto;
}

.blank {
  display: inline-block;
  min-width: 100px;
}

.blank input {
  box-shadow: none !important;
  outline: none !important;
  border-radius: 0;
  font-size: 1.2rem;
}

.options-container {
  max-width: 450px;
  margin: 0 auto;
}

.options-container .col-6 {
  padding: 5px;
}

.options-container button {
  width: 100%;
  padding: 10px;
  font-size: 1rem;
  border-radius: 10px;
}

.options-container button.selected {
  background-color: #58a700;
  color: white;
  border-color: #58a700;
}
</style>
