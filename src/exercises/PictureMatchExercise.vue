<template>
  <div class="exercise-component">
    <div class="title-container text-center mb-4">
      <h5 class="text-white">{{ title }}</h5>
      <div v-if="questionImageUrl" class="question-image-container">
        <img :src="questionImageUrl" alt="Soru Görseli" class="question-image">
      </div>
    </div>
    
    <div class="options-grid">
      <div 
        v-for="(option, index) in options" 
        :key="index"
        class="option-item"
        :class="{ 'selected': selectedOption === option.name }"
        @click="selectOption(option)"
      >
        <img :src="option.imageUrl" :alt="option.name" class="option-image">
        <div class="option-text">{{ option.name }}</div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'PictureMatchExercise',
  props: {
    exerciseData: {
      type: Object,
      default: () => ({})
    }
  },
  setup(props) {
    const { ref, onMounted } = Vue;
    
    // PictureMatch composable'ını kullan
    const pictureMatch = window.usePictureMatch(props);
    
    // State
    const title = ref("Görsele uygun kelimeyi seçin");
    const questionImageUrl = ref("");
    
    // Init
    onMounted(() => {
      pictureMatch.init();
      
      // Global API
      window.activeExerciseComponent = {
        checkAnswer: pictureMatch.checkAnswer,
        onContinue: pictureMatch.onContinue,
        renderResultContent: pictureMatch.renderResultContent
      };
      
      // Başlığı ayarla
      questionImageUrl.value = pictureMatch.questionImageUrl.value;
    });
    
    return {
      title,
      questionImageUrl,
      options: pictureMatch.options,
      selectedOption: pictureMatch.selectedOption,
      selectOption: pictureMatch.selectOption
    };
  }
}
</script>

<style scoped>
.title-container {
  margin-bottom: 30px;
}

.question-image-container {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}

.question-image {
  max-width: 300px;
  max-height: 200px;
  object-fit: contain;
  border-radius: 8px;
  border: 2px solid rgba(255, 255, 255, 0.2);
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
