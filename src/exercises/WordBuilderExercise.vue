<template>
  <exercise-container :title="title">
    <div class="target-sentence mb-4 fs-5 text-white-50">
      {{ sentenceTarget }}
    </div>
    
    <div class="word-bank mb-4 border border-secondary rounded p-3">
      <div class="d-flex flex-wrap justify-content-center gap-2">
        <div 
          v-for="(word, index) in availableWords" 
          :key="`word-${index}`"
          class="word-chip"
          :class="{'invisible': selectedWordIndexes.includes(index)}"
          @click="selectWord(index)"
        >
          {{ word }}
        </div>
      </div>
    </div>
    
    <div class="answer-area p-3 border border-secondary rounded mb-4">
      <div class="d-flex flex-wrap justify-content-center gap-2">
        <template v-for="(wordIndex, position) in selectedWordIndexes" :key="`selected-${position}`">
          <div 
            v-if="wordIndex !== null"
            class="word-chip selected-word"
            @click="removeWord(position)"
          >
            {{ availableWords[wordIndex] }}
          </div>
          <div v-else class="word-chip selected-word empty">
            &nbsp;
          </div>
        </template>
      </div>
    </div>
  </exercise-container>
</template>

<script>
export default {
  name: 'WordBuilderExercise',
  components: {
    ExerciseContainer: Vue.defineAsyncComponent(() => window["vue3-sfc-loader"].loadModule("./src/components/common/ExerciseContainer.vue", window.sfcOptions))
  },
  emits: ['complete'],
  setup(props, { emit }) {
    const { ref, computed, onMounted, watch } = Vue;
    
    // Exercise data
    const title = "Doğru cümleyi oluştur";
    const sentenceTarget = "I drink coffee every morning";
    const availableWords = [
      "coffee", "I", "every", "drink", "morning"
    ];
    
    // The correct order of word indexes
    const correctOrder = [1, 3, 0, 2, 4]; // "I drink coffee every morning"
    
    // State
    const selectedWordIndexes = ref([]);
    const isCorrect = ref(false);
    const showResult = ref(false);
    
    // Clear selected words
    const clearSelection = () => {
      selectedWordIndexes.value = [];
    };
    
    // Select a word from the bank
    const selectWord = (index) => {
      if (!showResult.value) {
        selectedWordIndexes.value.push(index);
      }
    };
    
    // Remove a word from the selection
    const removeWord = (position) => {
      if (!showResult.value) {
        selectedWordIndexes.value.splice(position, 1);
      }
    };
    
    // Get the user's answer as a string
    const getUserAnswer = () => {
      return selectedWordIndexes.value
        .map(index => availableWords[index])
        .join(' ');
    };
    
    // Get the correct answer as a string
    const getCorrectAnswerText = () => {
      return correctOrder
        .map(index => availableWords[index])
        .join(' ');
    };
    
    // Check if the answer is correct
    const checkAnswer = () => {
      if (selectedWordIndexes.value.length === 0) return false;
      
      // Compare with correct order
      const isValid = selectedWordIndexes.value.length === correctOrder.length &&
        selectedWordIndexes.value.every((wordIndex, position) => wordIndex === correctOrder[position]);
      
      isCorrect.value = isValid;
      showResult.value = true;
      
      // Update store
      const store = window.store || {};
      if (isCorrect.value && store.increaseScore) {
        store.increaseScore(15);
      } else if (!isCorrect.value && store.decreaseHearts) {
        store.decreaseHearts();
      }
      
      // Update layout state
      if (window.mainLayout) {
        window.mainLayout.showResult.value = true;
        window.mainLayout.isCorrect.value = isCorrect.value;
        window.mainLayout.correctAnswer.value = getCorrectAnswerText();
      }
      
      return isCorrect.value;
    };
    
    // Reset the exercise
    const reset = () => {
      clearSelection();
      isCorrect.value = false;
      showResult.value = false;
      if (window.mainLayout) {
        window.mainLayout.canCheck.value = false;
      }
    };
    
    // Handle continue after showing results
    const onContinue = () => {
      if (isCorrect.value) {
        emit('complete');
      } else {
        reset();
      }
    };
    
    // Initialize
    onMounted(() => {
      reset();
      
      // Make this component accessible globally
      window.activeExerciseComponent = {
        checkAnswer,
        isCorrect,
        getCorrectAnswerText,
        onContinue
      };
    });
    
    // Update check button when selection changes
    watch(selectedWordIndexes, val => {
      if (window.mainLayout) {
        window.mainLayout.canCheck.value = val.length > 0;
      }
    });
    
    return {
      title,
      sentenceTarget,
      availableWords,
      selectedWordIndexes,
      isCorrect,
      showResult,
      selectWord,
      removeWord,
      checkAnswer,
      reset,
      onContinue
    };
  }
}
</script>

<style scoped>
.target-sentence {
  text-align: center;
  padding: 12px;
  margin-bottom: 20px;
}

.word-bank {
  background-color: #2c2c2c;
  min-height: 60px;
}

.answer-area {
  background-color: #2c2c2c;
  min-height: 60px;
}

.word-chip {
  display: inline-block;
  padding: 8px 16px;
  background-color: #444;
  color: white;
  border-radius: 20px;
  margin: 4px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.word-chip:hover {
  background-color: #555;
}

.word-chip.selected-word {
  background-color: #58a700;
}

.word-chip.selected-word:hover {
  background-color: #4a8e00;
}

.word-chip.empty {
  background-color: transparent;
  border: 2px dashed #555;
  cursor: default;
}
</style>
