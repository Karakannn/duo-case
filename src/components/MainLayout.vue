<template>
  <div class="layout">
    <!-- Header -->
    <Header />

    <!-- Main Content Area -->
    <div class="layout-content">
      <div class="container py-4">
        <div class="row justify-content-center">
          <div class="col-lg-8">
            <component :is="activeComponent" class="exercise" />
          </div>
        </div>
      </div>
    </div>

    <!-- Footer -->
    <Footer 
      :showResult="showResult" 
      :isCorrect="isCorrect" 
      :canCheck="canCheck" 
      :correctAnswer="correctAnswer" 
    />

    <!-- Result Modal - Only for incorrect answers -->
    <div 
      v-if="showModal" 
      class="modal-backdrop incorrect" 
      @click="closeModal"
    >
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h2 class="modal-title">Yanlış!</h2>
        </div>
        <div class="modal-body">
          <div class="hearts-notification">
            <i class="fas fa-heart-broken text-danger me-2"></i>
            <span>1 canınız eksildi. Kalan: {{ hearts }}</span>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-lg btn-primary" @click="closeModal">
            TAMAM
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, watch } from 'vue';

export default {
  components: {
    Header: Vue.defineAsyncComponent(() => window["vue3-sfc-loader"].loadModule("./src/components/common/Header.vue", window.sfcOptions)),
    Footer: Vue.defineAsyncComponent(() => window["vue3-sfc-loader"].loadModule("./src/components/common/Footer.vue", window.sfcOptions))
  },
  setup() {
    // State
    const activeComponent = ref(null);
    const activeExercise = ref(null);
    const canCheck = ref(false);
    const showResult = ref(false);
    const showModal = ref(false);
    const isCorrect = ref(false);
    const correctAnswer = ref('');
    const activeExerciseContent = ref(null);
    const progress = ref(0);
    const hearts = ref(5);
    const title = ref('');

    // Current step tracking
    const currentStepIndex = ref(0);
    const stepStore = window.useStepStore();

    // Computed properties
    const activeExerciseHasCustomContent = computed(() => {
      return activeExerciseContent.value !== null;
    });

    const footerStateClass = computed(() => {
      if (!showResult.value) return '';
      return isCorrect.value ? 'correct-state' : 'incorrect-state';
    });

    const buttonText = computed(() => {
      if (showResult.value) {
        return isCorrect.value ? 'DEVAM ET' : 'ANLADIM';
      }
      return 'KONTROL ET';
    });

    // Initialize
    onMounted(() => {
      // Başlangıç egzersiz bileşenini ayarla
      // Bu örnekte varsayılan olarak WordMatchExercise gösteriliyor
      setActiveExercise('WordMatchExercise');
      
      // Step store durumunu ayarla
      const stepStore = window.useStepStore();
      if (stepStore) {
        // İlk adımı ayarla
        stepStore.setStep(1);
        
        // Progress ve can durumunu ayarla
        progress.value = stepStore.currentProgress.value;
        hearts.value = stepStore.hearts.value;
        
        // Step store değişikliklerini izle
        watch(() => stepStore.currentProgress.value, (newValue) => {
          progress.value = newValue;
        });
        
        watch(() => stepStore.hearts.value, (newValue) => {
          hearts.value = newValue;
        });
      }
    });

    // Methods
    const setActiveExercise = (componentName) => {
      resetFooter();
      activeComponent.value = Vue.defineAsyncComponent(() => 
        window["vue3-sfc-loader"].loadModule(`./src/exercises/${componentName}.vue`, window.sfcOptions)
      );
    };

    const nextExercise = () => {
      // Step store durumunu güncelle
      const stepStore = window.useStepStore();
      if (stepStore) {
        stepStore.nextStep();
      }
      
      // Sıradaki egzersiz bileşenini yükle
      currentStepIndex.value++;
      
      // Basit bir sıralama kullanarak egzersizleri döndür
      const exerciseComponents = [
        'WordMatchExercise',
        'PictureMatchExercise',
        'FillInBlankExercise'
      ];
      
      const nextIndex = currentStepIndex.value % exerciseComponents.length;
      setActiveExercise(exerciseComponents[nextIndex]);
    };
    
    const checkAnswer = () => {
      if (!canCheck.value) {
        return;
      }

      // Call check method on active exercise component
      if (window.activeExerciseComponent && typeof window.activeExerciseComponent.checkAnswer === 'function') {
        const result = window.activeExerciseComponent.checkAnswer();
        
        // Eğer bir sonuç döndüyse, sonucu göster
        if (result) {
          showResult.value = true;
          isCorrect.value = result.isCorrect;
          correctAnswer.value = result.correctAnswer || '';
          
          // Yanlış cevap verdiyse canı azalt ve modalı göster
          if (!result.isCorrect) {
            const stepStore = window.useStepStore();
            if (stepStore) {
              stepStore.decreaseHearts();
              hearts.value = stepStore.hearts.value;
              showModal.value = true;
            }
          }
        }
      }
    };

    const handleFooterButton = () => {
      if (showResult.value) {
        // DEVAM ET butonuna tıklandı - bir sonraki adıma geç
        nextExercise();
        
        // Sonucu sıfırla
        setTimeout(() => {
          resetFooter();
        }, 100);
      } else {
        // KONTROL ET butonuna tıklandı - sadece cevabı kontrol et
        checkAnswer();
      }
    };

    const updateExerciseContent = () => {
      if (window.activeExerciseComponent && window.activeExerciseComponent.renderResultContent) {
        activeExerciseContent.value = window.activeExerciseComponent.renderResultContent();
      } else {
        activeExerciseContent.value = null;
      }
    };

    const closeModal = () => {
      showModal.value = false;
    };

    const resetFooter = () => {
      showResult.value = false;
      showModal.value = false;
      isCorrect.value = false;
      canCheck.value = false;
      correctAnswer.value = '';
      activeExerciseContent.value = null; // İçeriği de sıfırla
    };

    // Make methods accessible for global access
    onMounted(() => {
      window.mainLayout = {
        showResult,
        isCorrect,
        canCheck,
        correctAnswer,
        checkAnswer,
        nextExercise,
        closeModal,
        setActiveExercise,
        resetFooter
      };
      
      // Global store'a referans ekle
      window.store = window.store || {};
      window.store.updateLayoutState = () => {
        const stepStore = window.useStepStore();
        if (stepStore) {
          progress.value = stepStore.currentProgress.value;
          hearts.value = stepStore.hearts.value;
        }
      };
    });

    return {
      // State
      activeComponent,
      title,
      currentStepIndex,
      showResult,
      showModal,
      isCorrect,
      correctAnswer,
      canCheck,
      
      // Computed
      buttonText,
      footerStateClass,
      activeExerciseHasCustomContent,
      activeExerciseContent,
      
      // Methods
      handleFooterButton,
      closeModal,
      
      // Referanslar
      activeExercise,
      
      // UI güncellemeleri
      progress,
      hearts
    };
  }
}
</script>

<style scoped>
.layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  padding: 20px 0;
}

.layout-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  position: relative;
}

.footer {
  padding: 1rem;
  margin-top: auto;
  background-color: #222;
  border-top: 1px solid #333;
  transition: all 0.3s ease;
}

.footer.correct-state {
  background-color: rgba(25, 135, 84, 0.15);
}

.footer.incorrect-state {
  background-color: rgba(220, 53, 69, 0.15);
}

.footer-status {
  margin-bottom: 1rem;
  padding: 0.75rem;
  border-radius: 8px;
  background-color: #333;
}

.correct-answer {
  color: #28a745;
}

.incorrect-answer {
  color: #dc3545;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  padding: 2rem;
}

.continue-btn {
  letter-spacing: 1px;
  font-weight: 700;
}

.exercise-container {
  padding: 1rem 0;
  max-width: 600px;
  margin: 0 auto;
}

.exercise-title {
  margin-top: 0.5rem;
  margin-bottom: 2rem;
}

.exercise-content {
  padding: 0;
}

.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
}

.modal-backdrop.correct {
  background-color: rgba(25, 135, 84, 0.5);
}

.modal-backdrop.incorrect {
  background-color: rgba(220, 53, 69, 0.5);
}

.modal-content {
  background-color: #fff;
  padding: 2rem;
  border-radius: 10px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);
  width: 500px;
  max-width: 90%;
}

.modal-header {
  margin-bottom: 1rem;
}

.modal-title {
  font-size: 1.5rem;
  font-weight: bold;
}

.modal-body {
  margin-bottom: 1rem;
}

.correct-answer {
  margin-bottom: 1rem;
}

.answer-label {
  font-weight: bold;
}

.answer-text {
  font-size: 1.2rem;
}

.exercise-feedback {
  font-size: 1.2rem;
}

.modal-footer {
  margin-top: 1rem;
}

.btn-lg {
  padding: 0.5rem 1rem;
  font-size: 1.2rem;
}

.hearts-notification {
  margin-bottom: 1rem;
  font-size: 1.2rem;
}
</style>
