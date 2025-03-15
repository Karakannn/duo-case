<template>
  <div class="layout">
    <!-- Header with progress bar and hearts -->
    <Header/>

    <!-- Main Content Area -->
    <div class="layout-content">
      <!-- ExerciseContainer ve ExerciseController birleştirildi -->
      <div class="exercise-container">
        <div v-if="title" class="exercise-title text-center mb-4">
          <h5 class="text-white-50">{{ title }}</h5>
        </div>
        
        <div class="exercise-content">
          <component 
            v-if="activeComponent" 
            :is="activeComponent" 
            :key="currentStepIndex" 
            ref="activeExercise"
            @complete="nextExercise"
          />
          <div v-else class="loading-container">
            <div class="spinner-border text-success" role="status">
              <span class="visually-hidden">Loading...</span>
            </div>
            <p class="mt-3 text-white">Yükleniyor...</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Sonuç Modalı (Son durumu göstermek için) -->
    <result-modal :show="showResult" :is-correct="isCorrect" :correct-answer="correctAnswer"
      @continue="handleFooterButton">
      <template v-if="activeExerciseHasCustomContent" #answer-content>
        <component :is="activeExerciseContent" />
      </template>
    </result-modal>

    <!-- Global Footer -->
    <Footer/>
  </div>
</template>

<script>
export default {
  name: 'MainLayout',
  components: {
    ResultModal: Vue.defineAsyncComponent(() => window["vue3-sfc-loader"].loadModule("./src/components/common/ResultModal.vue", window.sfcOptions)),
    Button: Vue.defineAsyncComponent(() => window["vue3-sfc-loader"].loadModule("./src/components/common/Button.vue", window.sfcOptions)),
    Header: Vue.defineAsyncComponent(() => window["vue3-sfc-loader"].loadModule("./src/components/common/Header.vue", window.sfcOptions)),
    Footer: Vue.defineAsyncComponent(() => window["vue3-sfc-loader"].loadModule("./src/components/common/Footer.vue", window.sfcOptions))
  },
  setup() {
    const { ref, reactive, computed, onMounted, onBeforeUnmount, watch, nextTick, markRaw } = Vue;

    // Step Store'u kullan - global değişkenden
    const stepStore = window.useStepStore();

    // State
    const mainComponent = ref(null);
    const canCheck = ref(false);
    const showResult = ref(false);
    const isCorrect = ref(false);
    const correctAnswer = ref('');
    const activeExerciseContent = ref(null);
    const activeExercise = ref(null);
    
    // ExerciseContainer'dan gelen özellik
    const title = computed(() => {
      // Adım bilgisine göre başlık al
      return stepStore.currentStep.value.title || '';
    });
    
    // ExerciseController'dan birleştirilen kodlar
    // Exercise Components - dinamik olarak yükleme
    const getExerciseComponent = (componentName) => {
      return markRaw(Vue.defineAsyncComponent(() => 
        window["vue3-sfc-loader"].loadModule(`./src/exercises/${componentName}.vue`, window.sfcOptions)
      ));
    };
    
    // Aktif bileşeni hesapla
    const activeComponent = computed(() => {
      const currentStep = stepStore.currentStep.value;
      console.log('MainLayout - activeComponent computed çalıştı, adım:', currentStep.id, 'bileşen:', currentStep.component);
      
      // İlgili bileşeni dinamik olarak yükle
      return getExerciseComponent(currentStep.component);
    });
    
    // Geçerli adım indeksini takip et
    const currentStepIndex = computed(() => stepStore.currentStepId.value - 1);
    
    // Bir sonraki egzersize geç
    const nextExercise = () => {
      console.log('MainLayout - nextExercise() çağrıldı');
      console.log('MainLayout - Moving to next exercise from step:', stepStore.currentStepId.value);
      
      // Adımı ilerlet
      stepStore.nextStep();
      
      // Store güncellemesini tetikle
      triggerStoreUpdate();
      
      // Reset the global state after component change
      nextTick(() => {
        console.log('MainLayout - nextTick callback çalışıyor');
        
        // State'i sıfırla
        showResult.value = false;
        isCorrect.value = false;
        canCheck.value = false;
        correctAnswer.value = '';
        
        // Clean up old references to ensure correct component initialization
        console.log('MainLayout - activeExerciseComponent sıfırlanıyor');
        window.activeExerciseComponent = null;
      });
    };
    
    // Update global reference when component changes
    watch(activeComponent, (newVal, oldVal) => {
      console.log('MainLayout - activeComponent değişti!', {
        eski: oldVal ? oldVal.name : 'null',
        yeni: newVal ? newVal.name : 'null'
      });
      
      // Clear previous references first
      window.activeExerciseComponent = null;
      
      console.log('MainLayout - Active component changed, waiting for component to initialize...');
    });

    // Computed for active exercise component content
    const activeExerciseHasCustomContent = computed(() => {
      return activeExerciseContent.value !== null;
    });

    // Get progress and hearts from store
    const getStore = () => window.store || {
      getProgress: () => 25,
      getHearts: () => 5
    };

    // UI'ı zorla güncellemek için bir reaktif değer
    const storeUpdateTrigger = ref(0);

    // Store değerleri her değiştiğinde bu fonksiyonu çağırarak UI'ı güncelleme
    const triggerStoreUpdate = () => {
      storeUpdateTrigger.value += 1;
      console.log('MainLayout - Store update tetiklendi:', storeUpdateTrigger.value);
    };

    const progress = computed(() => {
      // storeUpdateTrigger değeri değişince computed yeniden hesaplanacak
      const triggerUpdate = storeUpdateTrigger.value;
      const store = getStore();
      return store.getProgress ? store.getProgress() : 25;
    });

    const hearts = computed(() => {
      // storeUpdateTrigger değeri değişince computed yeniden hesaplanacak
      const triggerUpdate = storeUpdateTrigger.value;
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

    // Update active exercise content
    const updateExerciseContent = () => {
      console.log('MainLayout - updateExerciseContent çağrıldı');
      if (window.activeExerciseComponent && window.activeExerciseComponent.renderResultContent) {
        activeExerciseContent.value = window.activeExerciseComponent.renderResultContent;
      } else {
        activeExerciseContent.value = null;
      }
    };

    const showResultModal = (isCorrectVal) => {
      console.log('MainLayout - showResultModal çağrıldı, isCorrect:', isCorrectVal);
      showResult.value = true;
      isCorrect.value = isCorrectVal;
      updateExerciseContent(); // Aktif egzersizin içeriğini güncelle
    };

    const handleFooterButton = () => {
      console.log('MainLayout - handleFooterButton çağrıldı, showResult:', showResult.value);

      if (showResult.value) {
        // User clicked "DEVAM ET" or "ANLADIM" after seeing result
        console.log('MainLayout - Sonuç gösteriliyor, butonuna basıldı');

        if (isCorrect.value) {
          // Doğru cevap - bir sonraki egzersize ilerle
          console.log('MainLayout - Doğru cevap, bir sonraki egzersize geçiliyor');

          if (window.activeExerciseComponent && window.activeExerciseComponent.onContinue) {
            console.log('MainLayout - activeExerciseComponent.onContinue() çağrılıyor');
            window.activeExerciseComponent.onContinue();
            // Store değişecek, UI güncellemesini tetikleme
            triggerStoreUpdate();
          } else {
            console.error('MainLayout - activeExerciseComponent veya onContinue metodu bulunamadı!');
          }
        } else {
          // Yanlış cevap - modalı kapat, aynı soruyu tekrar göster
          console.log('MainLayout - Yanlış cevap, modal kapatılıyor');
          resetFooter();

          // Kalbi azalt (eğer store'da bu fonksiyon varsa)
          if (window.store && typeof window.store.decreaseHearts === 'function') {
            window.store.decreaseHearts();
            console.log('MainLayout - Can azaltıldı, kalan can:', window.store.getHearts());
            // UI'ı güncellemek için tetikle
            triggerStoreUpdate();
          }
        }
      } else {
        // User clicked "KONTROL ET"
        console.log('MainLayout - Cevap kontrol ediliyor, KONTROL ET butonuna basıldı');
        checkAnswer();
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
        triggerStoreUpdate, // Export this for other components
        showResultModal, // Export to allow showing modal externally
        updateResultState, // Export to allow updating state
        resetFooter // Export to allow resetting the footer
      };

      // Expose methods to global scope for component interaction
      window.showResultModal = showResultModal;
      window.updateResultState = updateResultState;
    });

    // Clean up global references
    onBeforeUnmount(() => {
      // Remove global references
      window.mainLayout = null;
      window.showResultModal = null;
      window.updateResultState = null;
      window.activeExerciseComponent = null;
    });

    return {
      // Original MainLayout props
      progress,
      hearts,
      canCheck,
      showResult,
      isCorrect,
      correctAnswer,
      footerStateClass,
      buttonText,
      handleFooterButton,
      checkAnswer,
      activeExerciseHasCustomContent,
      activeExerciseContent,
      
      // ExerciseContainer'dan gelen
      title,
      
      // ExerciseController'dan gelenler
      activeComponent,
      currentStepIndex,
      activeExercise,
      nextExercise
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
</style>
