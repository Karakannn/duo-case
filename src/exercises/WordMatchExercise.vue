<template>
  <exercise-container :title="title">
    <div class="word-container mb-4 d-flex align-items-center justify-content-center">
      <div class="character-image me-3">
        <img src="/src/assets/images/character.svg" alt="Character" class="img-fluid" style="height: 100px;">
      </div>
      <div class="word-badge badge bg-secondary rounded-pill fs-5 px-3 py-2">
        {{ word }}
      </div>
    </div>
    
    <div class="options-container">
      <div class="option-list d-flex flex-column gap-2">
        <Button 
          v-for="(option, index) in options" 
          :key="index"
          variant="primaryOutline"
          :class="selected === index ? 'selected' : ''"
          @click="!showResult && (selected = index)"
          :disabled="showResult"
        >
          {{ option }}
        </Button>
      </div>
    </div>
  
    <div class="mt-4">
      <Button 
        variant="secondary"
        size="lg"
        :disabled="selected === null || showResult"
        @click="checkAnswer"
      >
        DENETLE
      </Button>
    </div>
    
    <result-modal 
      :show="showResult" 
      :is-correct="isCorrect" 
      :correct-answer="options[correctIndex]"
      @continue="isCorrect ? $emit('complete') : reset()"
    >
      <template #answer-content>
        <div :class="['fs-5', isCorrect ? 'text-success' : 'text-danger']">
          <i :class="isCorrect ? 'fas fa-check-circle' : 'fas fa-times-circle'"></i>
          <span class="ms-2">{{ options[selected] }}</span>
        </div>
      </template>
    </result-modal>
  </exercise-container>
</template>

<script>
export default {
  name: 'WordMatchExercise',
  components: {
    ExerciseContainer: Vue.defineAsyncComponent(() => window["vue3-sfc-loader"].loadModule("./src/components/common/ExerciseContainer.vue", window.sfcOptions)),
    ResultModal: Vue.defineAsyncComponent(() => window["vue3-sfc-loader"].loadModule("./src/components/common/ResultModal.vue", window.sfcOptions)),
    Button: Vue.defineAsyncComponent(() => window["vue3-sfc-loader"].loadModule("./src/components/common/Button.vue", window.sfcOptions))
  },
  emits: ['complete'],
  setup(props, { emit }) {
    const { ref, computed, onMounted, watch } = Vue;
    
    // State
    const title = "Doğru çeviriyi seç";
    const word = "Coffee";
    const options = ref(['kahve', 'çay', 'su', 'şeker']);
    const correctIndex = 0; 
    const selected = ref(null);
    const isCorrect = ref(false);
    const showResult = ref(false);
    
    // Check answer
    const checkAnswer = () => {
      if (selected.value === null) return;
      
      isCorrect.value = selected.value === correctIndex;
      showResult.value = true;
      
      const store = window.store || {};
      isCorrect.value 
        ? (store.increaseScore && store.increaseScore(10)) 
        : (store.decreaseHearts && store.decreaseHearts());
    };
    
    // Reset exercise
    const reset = () => {
      selected.value = null;
      isCorrect.value = false;
      showResult.value = false;
      if (window.mainLayout) window.mainLayout.canCheck = false;
    };
    
    // Initialize
    onMounted(() => {
      reset();
      if (window.activeExerciseComponent) window.activeExerciseComponent.checkAnswer = checkAnswer;
    });
    
    // Update check button when selection changes
    watch(selected, val => { if (window.mainLayout) window.mainLayout.canCheck = !!val; });
    
    return {
      title, word, options, selected, correctIndex, 
      isCorrect, showResult, checkAnswer, reset, $emit: emit
    };
  }
}
</script>

<style scoped>
.word-badge {
  font-size: 1.2rem;
}

.options-container button {
  font-size: 1.1rem;
  transition: all 0.2s ease;
}

.options-container button:hover:not(:disabled):not(.selected) {
  background-color: #3b3b3b;
  border-color: #4b4b4b;
}

.options-container button.selected {
  border-color: #3b82f6;
}
</style>
