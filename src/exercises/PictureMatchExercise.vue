<template>
  <div class="exercise-component">
    <div v-if="audioWord" class="audio-container mb-4 text-center">
      <div class="audio-button">
        <span class="badge bg-primary rounded-pill fs-5 px-4 py-2">
          <i class="fas fa-volume-up me-2"></i>
          <span>{{ audioWord }}</span>
        </span>
      </div>
    </div>
    
    <div class="row g-3">
      <div v-for="(option, index) in options" :key="index" class="col-6">
        <div 
          :class="['option-card', 'card', 'p-3', 'h-100', 'text-center', 
                  selected === index ? 'selected' : '',
                  exercise.showResult && index === selected ? (exercise.isCorrect ? 'correct' : 'incorrect') : '']"
          @click="!exercise.showResult && selectOption(index)"
        >
          <div class="option-image mb-2">
            <img :src="option.image" :alt="option.text" class="img-fluid mx-auto" style="max-height: 100px;">
          </div>
          <div class="option-text">
            {{ option.text }}
          </div>
        </div>
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
    
    // useExercise composable'ını kullan
    const exercise = window.useExercise({
      exerciseName: 'PictureMatchExercise',
      correctAnswerFn: () => selected.value === correctIndex,
      validateFn: () => selected.value !== null,
      resetStateFn: () => {
        selected.value = null;
      },
      emit
    });
    
    // Seçim değiştiğinde check butonunu güncelle
    watch(selected, val => { 
      exercise.updateMainLayout(!!val);
    });
    
    // Seçenek seçme
    const selectOption = (index) => {
      selected.value = index;
    };
    
    return {
      title,
      audioWord,
      options,
      selected,
      selectOption,
      ...exercise
    };
  }
}
</script>

<style scoped>
.option-card {
  cursor: pointer;
  transition: all 0.2s ease;
  background-color: #2a2a2a;
  color: white;
  border: 2px solid transparent;
}

.option-card:hover:not(.selected) {
  border-color: #4b4b4b;
  transform: translateY(-2px);
}

.option-card.selected {
  border-color: #58a700;
  background-color: #1d3b05;
}

.option-card.correct {
  border-color: #58a700;
  background-color: #1d3b05;
}

.option-card.incorrect {
  border-color: #ea2b2b;
  background-color: #3b1515;
}

.audio-button {
  display: inline-block;
  cursor: pointer;
  transition: all 0.2s ease;
}

.audio-button:hover {
  transform: scale(1.05);
}

.audio-container {
  margin-top: 10px;
  margin-bottom: 20px;
}
</style>
