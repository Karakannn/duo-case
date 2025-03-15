<template>
  <div class="layout">
    <!-- Header with progress bar and hearts -->
    <Header/>

    <!-- Main Content Area -->
    <div class="layout-content">
      <component v-if="mainComponent" :is="mainComponent" @check-answer="checkAnswer" />
      <div v-else class="loading-container">
        <div class="spinner-border text-success" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
        <p class="mt-3 text-white">Yükleniyor...</p>
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
    const { ref, reactive, computed, onMounted, onBeforeUnmount, markRaw } = Vue;

    // State
    const mainComponent = ref(null);
    const canCheck = ref(false);
    const showResult = ref(false);
    const isCorrect = ref(false);
    const correctAnswer = ref('');
    const activeExerciseContent = ref(null);

    // Computed for active exercise component content
    const activeExerciseHasCustomContent = computed(() => {
      return activeExerciseContent.value !== null;
    });

    // Load main component - using markRaw to prevent reactivity issues
    mainComponent.value = markRaw(Vue.defineAsyncComponent(() =>
      window["vue3-sfc-loader"].loadModule("./src/components/ExerciseController.vue", window.sfcOptions)
    ));

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
        checkAnswer,
        resetFooter,
        handleFooterButton,
        updateResultState,
        showResultModal,
        triggerStoreUpdate
      };
    });

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
      showResultModal,
      activeExerciseContent,
      activeExerciseHasCustomContent,
      triggerStoreUpdate
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
</style>
