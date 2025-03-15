<template>
  <div v-if="show" class="result-modal">
    <div class="result-content" :class="isCorrect ? 'correct' : 'incorrect'">
      <!-- Success/Error Banner -->
      <div class="result-banner py-3 mb-3" :class="isCorrect ? 'bg-success' : 'bg-danger'">
        <h3 class="m-0 text-white">{{ isCorrect ? 'Doğru!' : 'Yanlış!' }}</h3>
      </div>
      
      <!-- Badge Banner (optional) -->
      <div v-if="isCorrect && showBadgeBanner" class="badge-banner mb-3">
        <div class="badge-icon">
          <i class="fas fa-medal text-warning fs-1"></i>
        </div>
        <div class="badge-text text-white">
          <div class="badge-title fs-5 fw-bold">BAGONG SALITA</div>
          <div class="badge-subtitle">Yeni bir kelime öğrendin!</div>
        </div>
      </div>
      
      <!-- Answer Content -->
      <div class="answer-content-wrapper p-3">
        <slot name="answer-content"></slot>
      </div>
      
      <!-- Correct Answer -->
      <div v-if="!isCorrect && correctAnswer" class="correct-solution mt-3 mb-3 p-3 rounded-3">
        <p class="text-white-50 mb-1">Doğru cevap:</p>
        <div class="solution text-white fs-5 fw-bold">{{ correctAnswer }}</div>
      </div>
      
      <!-- Continue Button -->
      <button 
        class="btn btn-lg w-100 rounded-pill continue-btn text-uppercase py-3" 
        :class="isCorrect ? 'btn-success' : 'btn-primary'"
        @click="onContinue"
      >
        {{ computedContinueText }}
      </button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ResultModal',
  props: {
    show: {
      type: Boolean,
      required: true,
      default: false
    },
    isCorrect: {
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
      default: null
    },
    showBadgeBanner: {
      type: Boolean,
      default: false
    }
  },
  emits: ['continue'],
  setup(props, { emit }) {
    const { computed } = Vue;
    
    // Compute continue text based on isCorrect
    const computedContinueText = computed(() => {
      if (props.continueText) {
        return props.continueText;
      }
      return props.isCorrect ? 'DEVAM' : 'ANLADIM';
    });
    
    function onContinue() {
      emit('continue');
    }
    
    return {
      computedContinueText,
      onContinue
    };
  }
}
</script>

<style scoped>
.result-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.85);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  animation: fade-in 0.3s ease;
}

.result-content {
  background-color: #1a1a1a;
  border-radius: 16px;
  width: 90%;
  max-width: 500px;
  text-align: center;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
  overflow: hidden;
  animation: slide-up 0.4s ease;
}

.result-banner {
  border-top-left-radius: 16px;
  border-top-right-radius: 16px;
}

.badge-banner {
  background-color: #3b3b3b;
  padding: 15px;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  text-align: left;
}

.badge-icon {
  margin-right: 15px;
}

.correct-solution {
  background-color: #2a2a2a;
}

.solution {
  font-weight: bold;
}

.continue-btn {
  border: none;
  margin: 15px 0 20px;
  transition: all 0.2s ease;
}

.continue-btn:hover {
  opacity: 0.9;
  transform: translateY(-2px);
}

@keyframes fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slide-up {
  from { transform: translateY(50px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}
</style>
