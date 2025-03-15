<template>
  <div class="layout">
    <!-- Header with progress bar and hearts -->
    <div class="exercise-header d-flex align-items-center justify-content-between mb-4 w-100">
      <div class="back-button">
        <i class="fas fa-times fs-4 text-secondary"></i>
      </div>
      
      <div class="progress flex-grow-1 mx-3" style="height: 16px;">
        <div 
          class="progress-bar bg-success" 
          :style="`width: ${progress}%`" 
          role="progressbar"
        ></div>
      </div>
      
      <div class="hearts-container d-flex align-items-center">
        <i class="fas fa-heart text-danger fs-4"></i>
        <span class="ms-1 text-danger fw-bold">{{ hearts }}</span>
      </div>
    </div>

    <!-- Main Content Area -->
    <div class="layout-content">
      <component 
        v-if="mainComponent" 
        :is="mainComponent"
        @check-answer="checkAnswer"
      />
      <div v-else class="loading-container">
        <div class="spinner-border text-success" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
        <p class="mt-3 text-white">Yükleniyor...</p>
      </div>
    </div>

    <!-- Global Footer -->
    <div class="footer" :class="footerStateClass">
      <div class="footer-status" v-if="showResult">
        <div v-if="isCorrect" class="correct-answer d-flex align-items-center">
          <i class="fas fa-check-circle text-success me-2"></i>
          <span class="fw-bold">Doğru!</span>
        </div>
        <div v-else class="incorrect-answer d-flex align-items-center">
          <i class="fas fa-times-circle text-danger me-2"></i>
          <span class="fw-bold">Yanlış cevap</span>
          <span class="ms-2" v-if="correctAnswer">{{ correctAnswer }}</span>
        </div>
      </div>
      
      <button 
        class="btn btn-lg w-100 rounded-pill continue-btn text-uppercase py-3" 
        :class="isCorrect ? 'btn-success' : 'btn-primary'"
        @click="handleFooterButton"
        :disabled="!canCheck && !showResult"
      >
        {{ buttonText }}
      </button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'MainLayout',
  setup() {
    const { ref, reactive, computed, onMounted, onBeforeUnmount, markRaw } = Vue;
    
    // State
    const mainComponent = ref(null);
    const canCheck = ref(false);
    const showResult = ref(false);
    const isCorrect = ref(false);
    const correctAnswer = ref('');
    
    // Load main component - using markRaw to prevent reactivity issues
    mainComponent.value = markRaw(Vue.defineAsyncComponent(() => 
      window["vue3-sfc-loader"].loadModule("./src/components/ExerciseController.vue", window.sfcOptions)
    ));
    
    // Get progress and hearts from store
    const getStore = () => window.store || { 
      getProgress: () => 25,
      getHearts: () => 5
    };
    
    const progress = computed(() => {
      const store = getStore();
      return store.getProgress ? store.getProgress() : 25;
    });
    
    const hearts = computed(() => {
      const store = getStore();
      return store.getHearts ? store.getHearts() : 5;
    });
    
    // Computed properties for footer state and button text
    const footerStateClass = computed(() => {
      if (!showResult.value) return '';
      return isCorrect.value ? 'correct-state' : 'incorrect-state';
    });
    
    const buttonText = computed(() => {
      if (showResult.value) {
        return 'DEVAM ET';
      }
      return 'KONTROL ET';
    });
    
    // Methods
    const checkAnswer = () => {
      console.log('MainLayout - checkAnswer() çağrıldı');
      if (!canCheck.value) {
        console.warn('MainLayout - canCheck false olduğu için işlem yapılmadı');
        return;
      }
      
      // Call check method on active exercise component
      if (window.activeExerciseComponent && typeof window.activeExerciseComponent.checkAnswer === 'function') {
        console.log('MainLayout - activeExerciseComponent.checkAnswer() çağrılıyor');
        const result = window.activeExerciseComponent.checkAnswer();
        console.log('MainLayout - checkAnswer result:', result);
        
        // State zaten her bir bileşen içinde güncelleniyor, 
        // burada ayrıca updateResultState çağırmaya gerek yok
      } else {
        console.error('MainLayout - window.activeExerciseComponent veya checkAnswer metodu mevcut değil!', window.activeExerciseComponent);
      }
    };
    
    const showResultModal = (isCorrectVal) => {
      console.log('MainLayout - showResultModal çağrıldı, isCorrect:', isCorrectVal);
      showResult.value = true;
      isCorrect.value = isCorrectVal;
    };

    const handleFooterButton = () => {
      console.log('MainLayout - handleFooterButton çağrıldı, showResult:', showResult.value);
      
      if (showResult.value) {
        // User clicked "DEVAM ET" after seeing result
        console.log('MainLayout - Sonuç gösteriliyor, DEVAM ET butonuna basıldı');
        
        if (window.activeExerciseComponent && window.activeExerciseComponent.onContinue) {
          console.log('MainLayout - activeExerciseComponent.onContinue() çağrılıyor');
          window.activeExerciseComponent.onContinue();
        } else {
          console.error('MainLayout - activeExerciseComponent veya onContinue metodu bulunamadı!');
        }
      } else {
        // User clicked "KONTROL ET"
        console.log('MainLayout - Cevap kontrol ediliyor, KONTROL ET butonuna basıldı');
        
        if (window.activeExerciseComponent && window.activeExerciseComponent.checkAnswer) {
          console.log('MainLayout - activeExerciseComponent.checkAnswer() çağrılıyor');
          const result = window.activeExerciseComponent.checkAnswer();
          console.log('MainLayout - checkAnswer sonucu:', result);
        } else {
          console.error('MainLayout - activeExerciseComponent veya checkAnswer metodu bulunamadı!');
        }
      }
    };
    
    const updateResultState = (result) => {
      console.log('MainLayout - updateResultState çağrıldı, params:', result);
      showResult.value = result.show;
      isCorrect.value = result.isCorrect;
      correctAnswer.value = result.correctAnswer;
    };
    
    const resetFooter = () => {
      console.log('MainLayout - resetFooter() çağrıldı');
      showResult.value = false;
      isCorrect.value = false;
      correctAnswer.value = '';
      canCheck.value = false;
    };
    
    // Make the component globally accessible
    onMounted(() => {
      window.mainLayout = {
        canCheck,
        showResult,
        isCorrect,
        correctAnswer,
        checkAnswer,
        resetFooter,
        handleFooterButton,
        updateResultState,
        showResultModal
      };
    });
    
    // Clean up
    onBeforeUnmount(() => {
      window.mainLayout = null;
    });
    
    return {
      mainComponent,
      progress,
      hearts,
      canCheck,
      showResult,
      isCorrect,
      correctAnswer,
      footerStateClass,
      buttonText,
      checkAnswer,
      handleFooterButton,
      showResultModal
    };
  }
}
</script>

<style scoped>
.layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  padding: 16px;
  max-width: 600px;
  margin: 0 auto;
  box-sizing: border-box;
}

.exercise-header {
  position: sticky;
  top: 0;
  z-index: 10;
}

.layout-content {
  flex: 1;
  padding-bottom: 100px;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 300px;
}

.footer {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: #1a1a1a;
  padding: 12px 16px;
  z-index: 1000;
  border-top: 1px solid #333;
  max-width: 600px;
  margin: 0 auto;
}

.footer-status {
  margin-bottom: 12px;
  padding: 10px;
  border-radius: 6px;
  font-size: 1.1rem;
}

.correct-state .footer-status {
  background-color: rgba(88, 167, 0, 0.2);
}

.incorrect-state .footer-status {
  background-color: rgba(220, 53, 69, 0.2);
}

.continue-btn {
  font-weight: bold;
}

.continue-btn:disabled {
  opacity: 0.5;
}

.back-button {
  cursor: pointer;
}

.back-button i:hover {
  color: white !important;
}
</style>
