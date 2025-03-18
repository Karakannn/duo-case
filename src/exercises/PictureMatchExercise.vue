<template>
  <div class="exercise-container">
    <selection-card v-for="(option, index) in options" :key="index" :is-selected="selectedOption === option.name"
      :is-correct="isAnswerChecked && option.name === correctOptionName" :is-disabled="isAnswerChecked"
      :class-name="'picture-card'" @select="handleOptionSelect(option)">
      <div class="card-image-container">
        <div class="card-image" :style="{ backgroundImage: `url(${option.imageUrl})` }"></div>
      </div>
      <div class="card-text-container">
        <span class="card-text">{{ option.name }}</span>
        <span class="card-text-index">{{ index + 1 }}</span>
      </div>
    </selection-card>
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
    const options = ref([]);

    // Prevent selection when answer is checked
    const handleOptionSelect = (option) => {
      if (!isAnswerChecked.value) {
        selectedOption.value = option.name;

        // Enable the "Kontrol Et" button when a card is selected
        if (window.mainLayout) {
          window.mainLayout.setCanCheck(true);
          console.log('Card selected:', option.name, '- Enabling Kontrol Et button');
        }
      }
    };

    // Load exercise data
    const loadExerciseData = () => {
      const { exerciseData } = props;

      if (exerciseData && exerciseData.question) {
        const { question } = exerciseData;

        // Set options directly instead of using setOptions method
        options.value = question.options || [];

        // Set correct option directly instead of using setCorrectOption method
        correctOptionName.value = question.correctOption || '';

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
          const isCorrect = selectedOption.value === correctOptionName.value;

          // Return structured result that MainLayout expects
          return {
            isCorrect: isCorrect,
            correctAnswer: correctOptionName.value
          };
        },
        onContinue: () => {
          isAnswerChecked.value = false;
          selectedOption.value = '';

          // Disable the "Kontrol Et" button when resetting
          if (window.mainLayout) {
            window.mainLayout.setCanCheck(false);
          }
        }
      };
    });

    return {
      display,
      questionImageUrl,
      options,
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
  grid-gap: 8px;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
}

.picture-card {
  height: 100%;
  color: var(--color-eel);
}

.category {
  color: var(--color-beetle);
  font-weight: 700;
  font-size: 19px;
}



/* Styles needed for the card content */
.card-image-container {
  align-items: center;
  display: flex;
  flex-direction: column;
  justify-content: center;
  width: 100%;
  flex: 1;
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
  justify-content: center;
}

.card-text {
  font-size: 16px;
  font-weight: 500;

}

.card-text-index {
  display: none;
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

  .picture-card {
    height: fit-content;
  }

  .card-image-container {
    flex: none;
  }

  .exercise-container {
    grid-template-columns: repeat(auto-fit, minmax(0, 1fr));
    align-items: center;
  }

  .card-text {
    font-size: 19px;
  }

  .card-text-container {
    justify-content: space-between;
  }

  .card-text-index {
    display: inline-flex;
  }
}
</style>
