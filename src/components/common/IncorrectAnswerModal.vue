<template>
  <div v-if="show" class="incorrect-answer-modal">
    <div class="modal-content incorrect">
      <!-- Error Banner -->
      <div class="modal-banner py-3 mb-3 bg-danger">
        <h3 class="m-0 text-white">Yanlış!</h3>
      </div>
      
      <!-- Hearts Notification -->
      <div class="hearts-notification p-3">
        <i class="fas fa-heart-broken text-danger me-2"></i>
        <span>1 canınız eksildi. Kalan: {{ remainingHearts }}</span>
      </div>
      
      <!-- Answer Content -->
      <div class="answer-content-wrapper p-3">
        <slot name="answer-content"></slot>
      </div>
      
      <!-- Correct Answer -->
      <div v-if="correctAnswer" class="correct-solution mt-3 mb-3 p-3 rounded-3">
        <p class="text-white-50 mb-1">Doğru cevap:</p>
        <div class="solution text-white fs-5 fw-bold">{{ correctAnswer }}</div>
      </div>
      
      <!-- Continue Button -->
      <Button 
        variant="primary"
        size="lg"
        @click="handleContinue"
      >
        {{ continueText || 'ANLADIM' }}
      </Button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'IncorrectAnswerModal',
  components: {
    Button: Vue.defineAsyncComponent(() => window["vue3-sfc-loader"].loadModule("./src/components/common/Button.vue", window.sfcOptions))
  },
  props: {
    show: {
      type: Boolean,
      required: true,
      default: false
    },
    correctAnswer: {
      type: String,
      default: ''
    },
    continueText: {
      type: String,
      default: 'ANLADIM'
    },
    remainingHearts: {
      type: Number,
      default: 5
    }
  },
  emits: ['continue'],
  setup(props, { emit }) {
    function handleContinue() {
      emit('continue');
    }
    
    return {
      handleContinue
    };
  }
}
</script>

<style scoped>
.incorrect-answer-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(0, 0, 0, 0.7);
  z-index: 1000;
}

.modal-content {
 
  max-width: 500px;
  background-color: #1cb0f6;
  border-radius: 16px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
}

.modal-banner {
  width: 100%;
}

.hearts-notification {
  background-color: rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  margin: 0 16px;
  font-weight: bold;
  color: white;
}

.answer-content-wrapper {
  width: 100%;
  background-color: rgba(255, 255, 255, 0.1);
}

.correct-solution {
  width: calc(100% - 32px);
  background-color: rgba(0, 0, 0, 0.2);
  text-align: left;
}

/* Animations */
.incorrect-answer-modal {
  animation: fadeIn 0.3s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
</style>
