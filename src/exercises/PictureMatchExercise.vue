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
  components: {},
  emits: ['complete'],
  setup(props, { emit }) {
    const { ref, onMounted, watch } = Vue;
    
    // Gerekli kompozisyonu kullan
    const pictureMatch = window.usePictureMatch();
    const exerciseBase = window.useExercise({ exerciseName: 'picture-match' });
    
    // State
    const title = ref("");
    const audioWord = ref("");
    const options = ref([]);
    const correctOption = ref("");
    
    // Mevcut adım bilgisini yükle
    const loadCurrentStepData = () => {
      const stepData = exerciseBase.getCurrentStepData();
      
      if (stepData && stepData.type === 'picture-match' && stepData.question) {
        // Adım verisinden soru bilgisini al
        title.value = `Bunlardan hangisi "${stepData.question.correctOption}"?`;
        audioWord.value = stepData.question.correctOption || "";
        
        // Seçenekleri resimli formata dönüştür
        options.value = stepData.question.options.map(option => {
          return {
            text: option,
            image: stepData.question.imageUrl || `/src/assets/images/${option}.svg`
          };
        });
        
        correctOption.value = stepData.question.correctOption || "";
        
        console.log('PictureMatch exercise loaded with data:', stepData);
      } else {
        // Adım verisi bulunamazsa varsayılan değerleri kullan
        title.value = "Bunlardan hangisi \"çay\"?";
        audioWord.value = "çay";
        options.value = [
          { text: "milk", image: "/src/assets/images/milk.svg" },
          { text: "coffee", image: "/src/assets/images/coffee.svg" },
          { text: "tea", image: "/src/assets/images/tea.svg" }
        ];
        correctOption.value = "tea";
        
        console.warn('No matching step data found for PictureMatch, using default values');
      }
      
      // Egzersiz için global değişkenleri güncelle
      window.currentExercise = {
        correctPairs: [{ id: audioWord.value, matchId: correctOption.value }],
        options: options.value
      };
    };
    
    // Selected değeri kompozisyondan al
    const selected = pictureMatch.selectedOption;
    
    // Seçenek seçme
    const selectOption = (index) => {
      pictureMatch.selectOption(index);
    };
    
    // Bileşen yüklendiğinde
    onMounted(() => {
      // Adım verisini yükle
      loadCurrentStepData();
      
      // Kompozisyonu sıfırla
      pictureMatch.reset();
      
      // Global erişim için
      window.activeExerciseComponent = {
        checkAnswer: () => {
          const selectedPairs = selected.value !== null ? 
            [{ id: audioWord.value, matchId: options.value[selected.value].text }] : 
            [];
            
          return pictureMatch.checkAnswer({
            selectedPairs: selectedPairs
          });
        },
        onContinue: () => {
          pictureMatch.reset();
          
          // Sonraki egzersize geç
          if (window.mainLayout?.nextExercise) {
            window.mainLayout.nextExercise();
          }
        },
        renderResultContent: pictureMatch.renderResultContent
      };
    });
    
    // Adım değiştiğinde veriyi güncelle
    const stepStore = window.useStepStore();
    if (stepStore) {
      watch(() => stepStore.currentStepId.value, () => {
        loadCurrentStepData();
        pictureMatch.reset();
      });
    }
    
    return {
      title,
      audioWord,
      options,
      selected,
      selectOption,
      showResult: pictureMatch.showResult
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
