<template>
  <div class="exercise-container">
    <div class="exercise-component">
      <div class="title-container">
        <div class="category">
          <span>
            <svg height="32" preserveAspectRatio="xMidYMin slice" width="32"
              style="color: rgb(var(--color-beetle)); overflow: visible;" viewBox="0 0 33 32">
              <path fill-rule="evenodd" clip-rule="evenodd"
                d="M16.5 28C23.1274 28 28.5 22.6274 28.5 16C28.5 9.37258 23.1274 4 16.5 4C9.87258 4 4.5 9.37258 4.5 16C4.5 22.6274 9.87258 28 16.5 28ZM11.8184 14.0055C11.3302 13.5173 11.3302 12.7259 11.8184 12.2377L14.1165 9.9396C14.6046 9.45145 15.3961 9.45145 15.8843 9.9396L18.1823 12.2377C18.6705 12.7259 18.6705 13.5173 18.1823 14.0055L15.8843 16.3036C15.3961 16.7917 14.6046 16.7917 14.1165 16.3036L11.8184 14.0055ZM18.586 16.4145C18.1955 16.805 18.1955 17.4382 18.586 17.8287L19.6467 18.8893C20.0372 19.2799 20.6704 19.2799 21.0609 18.8893L22.1215 17.8287C22.5121 17.4382 22.5121 16.805 22.1215 16.4145L21.0609 15.3538C20.6704 14.9633 20.0372 14.9633 19.6467 15.3538L18.586 16.4145ZM14.9356 20.5646C14.6427 20.8575 14.6427 21.3324 14.9356 21.6253L15.6427 22.3324C15.9356 22.6253 16.4105 22.6253 16.7034 22.3324L17.4105 21.6253C17.7034 21.3324 17.7034 20.8575 17.4105 20.5646L16.7034 19.8575C16.4105 19.5646 15.9356 19.5646 15.6427 19.8575L14.9356 20.5646Z"
                fill="#CE82FF"></path>
            </svg>
          </span>
          YENİ KELİME

        </div>
        <h5 class="text-white">{{ title }}</h5>
        <!--  <div v-if="questionImageUrl" class="question-image-container">
          <img :src="questionImageUrl" alt="Soru Görseli" class="question-image">
        </div> -->
      </div>

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
    SelectionCard: Vue.defineAsyncComponent(() => SelectionCard)
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
    const title = ref("Görsele uygun kelimeyi seçin");
    const questionImageUrl = ref("");
    const isAnswerChecked = ref(false);
    const correctOptionName = ref("");

    // Prevent selection when answer is checked
    const handleOptionSelect = (option) => {
      if (!isAnswerChecked.value) {
        pictureMatch.selectOption(option);
      }
    };

    // Init
    onMounted(() => {
      pictureMatch.init();

      // Try to get the correct option directly from the loaded pictureMatch data
      const exercise = window.currentExercise;
      if (exercise && exercise.correctOption) {
        correctOptionName.value = exercise.correctOption;
      }

      // Global API'yi ayarla ve cevap kontrolünü yönet
      window.activeExerciseComponent = {
        checkAnswer: () => {
          const result = pictureMatch.checkAnswer();

          // Store the correct option name from the result
          if (result && result.correctAnswer) {
            correctOptionName.value = result.correctAnswer;
          }

          // Mark answer as checked
          isAnswerChecked.value = true;

          return result;
        },
        onContinue: () => {
          isAnswerChecked.value = false;
          pictureMatch.onContinue();

          // Update correctOptionName for the new exercise
          setTimeout(() => {
            if (window.currentExercise && window.currentExercise.correctOption) {
              correctOptionName.value = window.currentExercise.correctOption;
            }
          }, 100);
        },
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

.title-container {
  display: flex;
  flex-direction: column;
  align-items: start;
  gap: 8px;
}

.title-container h5 {
  font-size: 32px;
  font-weight: 700;
  color: var(--color-hare);
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
