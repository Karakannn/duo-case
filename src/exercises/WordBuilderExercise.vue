<template>
  <div class="exercise-component">
    <div class="sentence-container mb-4">
      <div class="sentence-display p-3 bg-light rounded-3 shadow-sm text-center">
        <span v-for="(part, index) in sentenceParts" :key="index">
          <span v-if="part.type === 'text'">{{ part.content }}</span>
          <span v-else-if="part.type === 'blank'" class="blank-space">
            {{ userWord }}
          </span>
        </span>
      </div>
    </div>
    
    <div class="letters-container">
      <div class="letters-grid">
        <div
          v-for="(letter, index) in availableLetters"
          :key="index"
          class="letter-tile"
          :class="{ 'used': usedLetterIndices.includes(index) }"
          @click="selectLetter(letter, index)"
        >
          {{ letter }}
        </div>
      </div>
      
      <div class="word-builder-controls mt-3">
        <button 
          class="btn btn-outline-light" 
          @click="clearWord"
          :disabled="userWord.length === 0"
        >
          <i class="fas fa-trash-alt"></i> Temizle
        </button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    exerciseData: {
      type: Object,
      default: () => ({})
    }
  },
  setup(props) {
    const { onMounted } = Vue;
    
    // Kelime oluşturma egzersiz composable'ını kullan
    const exercise = window.useWordBuilder(props);
    
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
      availableLetters: exercise.availableLetters,
      userWord: exercise.userWord,
      usedLetterIndices: exercise.usedLetterIndices,
      
      // Methods
      selectLetter: exercise.selectLetter,
      clearWord: exercise.clearWord
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
  min-width: 80px;
  border-bottom: 2px solid #58cc02;
  font-weight: bold;
  color: #58cc02;
}

.letters-container {
  max-width: 500px;
  margin: 0 auto;
}

.letters-grid {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 8px;
}

.letter-tile {
  width: 50px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: white;
  color: #333;
  font-size: 1.2rem;
  font-weight: bold;
  border-radius: 8px;
  cursor: pointer;
  user-select: none;
  transition: all 0.2s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.letter-tile:hover:not(.used) {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.letter-tile.used {
  background-color: #ddd;
  color: #999;
  cursor: not-allowed;
}

.word-builder-controls {
  display: flex;
  justify-content: center;
  margin-top: 1rem;
}
</style>
