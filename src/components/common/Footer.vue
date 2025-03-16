<template>
  <div class="footer" :class="{ 'correct-state': showResult && isCorrect, 'incorrect-state': showResult && !isCorrect }">
    <!-- Result status section -->
    <div class="footer-status" v-if="showResult">
      <div class="d-flex align-items-center" :class="isCorrect ? 'correct-answer' : 'incorrect-answer'">
        <i class="fas me-2" :class="isCorrect ? 'fa-check-circle text-success' : 'fa-times-circle text-danger'"></i>
        <span class="fw-bold">{{ isCorrect ? 'Aferin!' : 'Doğru cevap:' }}</span>
        <span class="ms-2" v-if="!isCorrect && correctAnswer">{{ correctAnswer }}</span>
      </div>
    </div>

    <!-- Action buttons -->
    <Button 
      :id="showResult ? 'continueButton' : 'checkAnswerButton'"
      :variant="showResult ? (isCorrect ? 'success' : 'danger') : 'primary'" 
      size="lg" 
      @click="showResult ? handleContinue() : handleCheck()"
      :disabled="!showResult && !canCheck">
      {{ showResult ? 'DEVAM ET' : 'KONTROL ET' }}
    </Button>
  </div>
</template>

<script>
export default {
  name: 'Footer',
  components: {
    Button: Vue.defineAsyncComponent(() => window["vue3-sfc-loader"].loadModule("./src/components/common/Button.vue", window.sfcOptions))
  },
  props: {
    showResult: { type: Boolean, default: false },
    isCorrect: { type: Boolean, default: false },
    canCheck: { type: Boolean, default: false },
    correctAnswer: { type: String, default: '' }
  },
  setup() {
    const handleCheck = () => {
      if (window.mainLayout?.checkAnswer) {
        window.mainLayout.checkAnswer();
      }
    };
    
    const handleContinue = () => {
      if (window.mainLayout?.nextExercise) {
        window.mainLayout.nextExercise();
        
        // Reset after short delay
        setTimeout(() => {
          window.mainLayout?.resetFooter?.();
        }, 100);
      }
    };

    return {
      handleCheck,
      handleContinue
    };
  }
};
</script>

<style scoped>
.footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background-color: #f8f9fa;
  border-top: 1px solid #dee2e6;
  position: fixed;
  bottom: 0;
  width: 100%;
  z-index: 1000;
}

.footer-status {
  flex-grow: 1;
  margin-right: 1rem;
}

.correct-state { background-color: #d4edda; border-top-color: #c3e6cb; }
.incorrect-state { background-color: #f8d7da; border-top-color: #f5c6cb; }
</style>