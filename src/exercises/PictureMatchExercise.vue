<template>
  <div class="exercise-component">
    <div class="title-container text-center mb-4">
      <h5 class="text-white">{{ title }}</h5>
      <div v-if="audioWord" class="audio-badge badge bg-primary rounded-pill fs-5 px-4 py-2 mt-3">
        <i class="fas fa-volume-up me-2"></i>
        <span>{{ audioWord }}</span>
      </div>
    </div>
    
    <div class="options-grid">
      <div 
        v-for="(option, index) in options" 
        :key="index"
        class="option-item"
        :class="{ 'selected': selected === index }"
        @click="selectOption(index)"
      >
        <img :src="option.image" :alt="option.text" class="option-image">
        <div class="option-text">{{ option.text }}</div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'PictureMatchExercise',
  components: {
  },
  emits: ['complete'],
  setup(props, { emit }) {
    const { ref, computed, onMounted, watch } = Vue;
    
    // Merkezi store ve exercise manager'ı kullan
    const stepStore = window.useStepStore();
    const exerciseManager = window.useExercise({
      exerciseName: 'picture-match'
    });
    
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
    
    // Seçim değiştiğinde check butonunu güncelle
    watch(selected, val => { 
      if (window.mainLayout) {
        window.mainLayout.canCheck.value = val !== null;
      }
    });
    
    // Seçenek seçme
    const selectOption = (index) => {
      selected.value = index;
    };
    
    // Cevap kontrolü - merkezi doğrulama mekanizmasını kullan
    function checkAnswer() {
      // Eşleştirme egzersizi için, şu an sadece tek bir seçenek var
      // Gerçek bir resim eşleştirme senaryosunda multiple seçimler olabilir
      // ve bunlar bir dizi olarak geçirilebilir
      const selectedPairs = [{ id: "çay", matchId: options.value[selected.value].text }];
      const correctPairs = [{ id: "çay", matchId: "tea" }];
      
      // exerciseManager'a gerekli parametreleri gönder
      return exerciseManager.checkAnswer({
        selectedPairs: selectedPairs,
        correctPairs: correctPairs
      });
    }
    
    // Durum sıfırlama
    function resetState() {
      selected.value = null;
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
      title,
      audioWord,
      options,
      selected,
      selectOption,
      showResult: exerciseManager.showResult
    };
  }
}
</script>

<style scoped>
.title-container {
  margin-bottom: 30px;
}

.audio-badge {
  cursor: pointer;
  display: inline-block;
}

.options-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 20px;
  max-width: 700px;
  margin: 0 auto;
}

.option-item {
  background-color: rgba(255, 255, 255, 0.1);
  border: 2px solid transparent;
  border-radius: 12px;
  padding: 15px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.option-item:hover {
  background-color: rgba(255, 255, 255, 0.15);
}

.option-item.selected {
  border-color: #58a700;
  background-color: rgba(88, 167, 0, 0.2);
}

.option-image {
  max-width: 100%;
  height: 120px;
  object-fit: contain;
  margin-bottom: 15px;
}

.option-text {
  color: white;
  font-size: 1.1rem;
  text-align: center;
}
</style>
