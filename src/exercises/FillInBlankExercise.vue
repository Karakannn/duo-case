<template>
  <div class="exercise-component">
    <div class="sentence-container mb-4">
      <div class="sentence-display p-3 bg-light rounded-3 shadow-sm">
        <span v-for="(part, index) in sentenceParts" :key="index">
          <span v-if="part.type === 'text'">{{ part.content }}</span>
          <span v-else-if="part.type === 'blank'" class="blank-space">
            <span v-if="selectedOption">{{ selectedOption }}</span>
            <span v-else>&nbsp;</span>
          </span>
        </span>
      </div>
    </div>
    
    <div class="options-container">
      <div class="options-list d-flex flex-column gap-2">
        <Button 
          v-for="(option, index) in options" 
          :key="index"
          variant="primaryOutline"
          :class="selectedOption === option ? 'selected' : ''"
          @click="selectOption(option)"
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
  props: {
    exerciseData: {
      type: Object,
      default: () => ({})
    }
  },
  setup(props) {
    const { onMounted } = Vue;
    
    // Boşluk doldurma egzersiz composable'ını kullan
    const exercise = window.useFillInBlank(props);
    
    // Bileşen yüklendiğinde
    onMounted(() => {
      // Başlangıç kurulumu 
      exercise.init();
      
      // Global API'yi ayarla
      window.activeExerciseComponent = {
        checkAnswer: exercise.checkAnswer,
        onContinue: exercise.onContinue,
        renderResultContent: exercise.renderResultContent
      };
    });
    
    return {
      // State
      sentenceParts: exercise.sentenceParts,
      options: exercise.options,
      selectedOption: exercise.selectedOption,
      
      // Methods
      selectOption: exercise.selectOption
    };
  }
}
</script>

<style scoped>
.sentence-container {
  margin-bottom: 2rem;
}

.sentence-display {
  color: #333;
  font-size: 1.3rem;
  line-height: 1.5;
  margin: 0 auto;
  max-width: 600px;
}

.blank-space {
  display: inline-block;
  min-width: 60px;
  border-bottom: 2px solid #58cc02;
  font-weight: bold;
  color: #58cc02;
  text-align: center;
}

.options-container {
  max-width: 500px;
  margin: 0 auto;
}

.options-list {
  width: 100%;
}

.options-list button {
  width: 100%;
  padding: 1rem;
  margin-bottom: 0.5rem;
  text-align: center;
  font-size: 1.1rem;
  border: 2px solid #ddd;
  border-radius: 8px;
  background-color: white;
  transition: all 0.2s ease;
}

.options-list button:hover:not(:disabled) {
  background-color: #f5f5f5;
  transform: translateY(-2px);
}

.options-list button.selected {
  background-color: #58cc02;
  color: white;
  border-color: #58cc02;
}
</style>
