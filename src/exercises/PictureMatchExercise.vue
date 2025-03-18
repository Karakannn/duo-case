<template>
  <div class="exercise-container">
    <div class="exercise-component">
      <div class="options-grid">
        <selection-card v-for="(option, index) in options" :key="index" :is-selected="selectedOption === option.name"
          :is-correct="isAnswerChecked && option.name === correctOptionName" :is-disabled="isAnswerChecked"
          :class-name="'picture-card'" @select="handleOptionSelect(option)">
          <div class="card-image-container">
            <div class="card-image" :style="{ backgroundImage: `url(${option.imageUrl})` }"></div>
          </div>
          <div class="card-text-container">
            <span class="card-text" style="color: var(--color-hare)">{{ option.name }}</span>
            <span class="card-text-index">{{ index + 1 }}</span>
          </div>
        </selection-card>
      </div>
    </div>
  </div>
</template>

<script>
// Import the selection card component
const SelectionCard = window["vue3-sfc-loader"].loadModule(
  './src/components/common/SelectionCard.vue',
  window.sfcOptions
);

export default {
  name: 'PictureMatchExercise',
  components: {
    SelectionCard: Vue.defineAsyncComponent(() => SelectionCard),
  },
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
    const display = ref({
      type: 'title',
      title: "Görsele uygun kelimeyi seçin",
      category: "YENİ KELİME",
      imageUrl: "",
      text: ""
    });
    const questionImageUrl = ref("");
    const isAnswerChecked = ref(false);
    const correctOptionName = ref("");
    const selectedOption = ref("");

    // Prevent selection when answer is checked
    const handleOptionSelect = (option) => {
      if (!isAnswerChecked.value) {
        selectedOption.value = option.name;
      }
    };

    // Load exercise data
    const loadExerciseData = () => {
      const { exerciseData } = props;
      
      if (exerciseData && exerciseData.question) {
        const { question } = exerciseData;
        
        // Set options
        pictureMatch.setOptions(question.options || []);
        
        // Set correct option
        pictureMatch.setCorrectOption(question.correctOption || '');
        
        // Set question image URL
        questionImageUrl.value = question.imageUrl || '';
        
        // Set display data
        if (exerciseData.display) {
          display.value = exerciseData.display;
        }
      }
    };

    // Component mounted
    onMounted(() => {
      loadExerciseData();
      
      // Global API'yi ayarla
      window.activeExerciseComponent = {
        checkAnswer: () => {
          isAnswerChecked.value = true;
          return selectedOption.value === correctOptionName.value;
        },
        onContinue: () => {
          isAnswerChecked.value = false;
          selectedOption.value = '';
        }
      };
    });

    return {
      display,
      questionImageUrl,
      options: pictureMatch.options,
      selectedOption,
      handleOptionSelect,
      isAnswerChecked,
      correctOptionName
    };
  }
}
</script>

<style scoped>
.exercise-container {
  display: flex;
  align-content: center;
  font-size: 19px;
  justify-content: center;
  text-align: center;
  width: 100%;
}

.exercise-component {
  display: grid;
  grid-template-rows: min-content minmax(0, 1fr);
  grid-gap: 16px;
  height: auto;
}

.category {
  color: var(--color-beetle);
  font-weight: 700;
  font-size: 19px;
}

.options-grid {
  display: grid;
  grid-gap: 8px;
  align-items: center;
  grid-template-columns: repeat(2, 1fr);
}

/* Styles needed for the card content */
.card-image-container {
  align-items: center;
  display: flex;
  flex-direction: column;
  justify-content: center;
  width: 100%;
}

.card-image {
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  width: 100%;
  height: 160px;
  background-position: 50%;
  background-repeat: no-repeat;
  background-size: contain;
  margin: 0 0 10px;
  border-radius: 8px;
}

.card-text-container {
  width: 100%;
  align-items: center;
  display: flex;
  justify-content: space-between;
}

.card-text {
  font-size: 19px;
  font-weight: 500;
}

.card-text-index {
  display: inline-flex;
  align-items: center;
  border: 3px solid var(--color-swan);
  border-radius: 8px;
  color: var(--color-hare);
  font-size: 15px;
  height: 30px;
  justify-content: center;
  width: 30px;
  flex-shrink: 0;
  font-weight: 900;
}

@media (min-width: 700px) {
  .options-grid {
    grid-template-columns: repeat(auto-fit, minmax(0, 1fr));
  }

  .exercise-component {
    min-height: 450px;
    overflow: visible;
    width: 600px;
    grid-gap: 24px;
  }
}
</style>
