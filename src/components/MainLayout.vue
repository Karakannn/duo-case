<template>
  <div class="layout">
    <!-- Header -->
    <Header :progress="progress" :hearts="hearts" :correctStreak="correctStreak" />

    <!-- Main Content Area -->
    <div class="layout-content">
      <component :is="activeComponent" class="exercise" :exercise-data="currentExerciseData" />
    </div>

    <!-- Footer -->
    <Footer :showResult="showResult" :isCorrect="isCorrect" :canCheck="canCheck" :correctAnswer="correctAnswer"
      :correctStreak="correctStreak" />

    <!-- Result Modal - Only for incorrect answers -->
    <div v-if="showModal" class="modal-backdrop incorrect" @click="closeModal">
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
    const canCheck = ref(true);
    const showResult = ref(true);
    const showModal = ref(false);
    const isCorrect = ref(true);
    const correctAnswer = ref('coffee');
    const activeExerciseContent = ref(null);
    const progress = ref(0);
    const hearts = ref(5);
    const title = ref('');
    const currentExerciseData = ref(null);
    const correctStreak = ref(0); // Ardışık doğru cevap sayısı

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

    // MainLayout'u global olarak erişilebilir kıl
    const exposeMainLayout = () => {
      // window.mainLayout nesnesini oluştur
      window.mainLayout = {
        canCheck: canCheck.value,
        setCanCheck: (value) => {
          canCheck.value = value;
        },
        nextExercise,
        checkAnswer,
        continueAction
      };

      // canCheck özelliğini reactive yapmak için getter/setter kullan
      Object.defineProperty(window.mainLayout, 'canCheck', {
        get: () => canCheck.value,
        set: (value) => {
          canCheck.value = value;
        }
      });
    };

    // Global değişkenden adım numarasını al
    const getGlobalStep = () => {
      return window.globalStepId || 1;
    };

    // Step ID'ye göre egzersiz verisini yükle ve bileşeni ayarla
    const loadExerciseDataAndComponent = (stepId) => {
      if (!window.exerciseStepsManager) {
        console.error('Exercise Steps Manager is not available');
        return;
      }

      // Step ID'ye göre egzersiz verisini al
      const stepData = window.exerciseStepsManager.getStepById(stepId);

      if (stepData) {
        // Egzersiz verisini ayarla
        currentExerciseData.value = stepData;

        // Egzersiz tipine göre bileşeni belirle
        const componentMap = {
          'word-match': 'WordMatchExercise',
          'word-builder': 'WordBuilderExercise',
          'text-input': 'TextInputExercise',
          'fill-in-blank': 'FillInBlankExercise',
          'picture-match': 'PictureMatchExercise',
          'matching': 'MatchingExercise'
        };

        const componentName = componentMap[stepData.type] || 'WordMatchExercise';
        setActiveExercise(componentName);

        console.log(`Loaded exercise data for step ${stepId}:`, stepData);
        console.log(`Set active component to: ${componentName}`);
      } else {
        console.warn(`No exercise data found for step ID: ${stepId}`);
        // Varsayılan bileşen
        setActiveExercise('WordMatchExercise');
      }
    };

    // Initialize
    onMounted(() => {
      // MainLayout'u global olarak erişilebilir yapın
      exposeMainLayout();

      // Global değişkendeki adım numarasını kontrol et
      const globalStep = getGlobalStep();

      // Progress değerini minimal bir değer olarak ayarla (ipucu olarak)
      progress.value = 0;
      correctStreak.value = 0;

      // Step store durumunu ayarla
      if (stepStore) {
        // Başlangıç adımını ayarla
        stepStore.setStep(globalStep);

        // Egzersiz verisini yükle ve bileşeni ayarla
        loadExerciseDataAndComponent(stepStore.currentStepId.value);

        // Canları ayarla
        hearts.value = stepStore.hearts.value;

        // Step store değişikliklerini izle
        watch(() => stepStore.currentStepId.value, (newStepId) => {
          // Step ID değiştiğinde, egzersiz verisini ve bileşeni güncelle
          loadExerciseDataAndComponent(newStepId);

          console.log(`Step changed to ${newStepId}`);
        }, { immediate: true });

        // Hearts değerini izle
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
      if (!stepStore) return;

      // Bir sonraki adıma geç
      const nextStep = stepStore.nextStep();

      // KONTROL ET'e tıklandığında progress güncellendiği için, 
      // burada progress'i tekrar güncellemeye gerek yok

      // Varsa egzersiz verisini ve bileşeni yükle
      if (nextStep) {
        loadExerciseDataAndComponent(stepStore.currentStepId.value);
        console.log(`Moving to next exercise, step: ${stepStore.currentStepId.value}`);
      }

      // UI durumunu sıfırla
      resetFooter();
    };

    const checkAnswer = () => {
      if (!canCheck.value) {
        return;
      }

      if (window.activeExerciseComponent && typeof window.activeExerciseComponent.checkAnswer === 'function') {
        const result = window.activeExerciseComponent.checkAnswer();
        isCorrect.value = result.isCorrect;
        showResult.value = true;
        correctAnswer.value = result.correctAnswer;

        // Doğru cevap
        if (isCorrect.value) {
          correctStreak.value++;
          console.log(`Correct! Streak is now: ${correctStreak.value}`);

          // Doğru cevap verildiğinde hemen progress'i güncelle
          if (stepStore) {
            // Progress değerini güncelle
            progress.value = stepStore.currentProgress.value;
            console.log(`Correct answer, updating progress to: ${progress.value}%`);
          }
        } else {
          // Yanlış cevap - streak sıfırla ve progress sıfırla
          console.log(`Incorrect answer, resetting streak from ${correctStreak.value} to 0`);
          correctStreak.value = 0;
          progress.value = 0;

          if (stepStore) {
            stepStore.decreaseHeart();
            showModal.value = true;
          }
        }
      }
    };

    const continueAction = () => {
      if (showResult.value) {
        // Doğru cevap verdiyse (devam butonuna basıldığında)
        if (isCorrect.value) {
          // Bir sonraki adıma geç
          if (window.activeExerciseComponent && typeof window.activeExerciseComponent.onContinue === 'function') {
            window.activeExerciseComponent.onContinue();
          }

          // Streak 2 veya daha fazlaysa progress değerini güncelle
          if (correctStreak.value >= 2 && stepStore) {
            progress.value = stepStore.currentProgress.value;
            console.log(`Streak is ${correctStreak.value}, continuing with progress: ${progress.value}%`);
          } else {
            console.log(`Streak is ${correctStreak.value}, progress stays at: ${progress.value}%`);
          }
        } else {
          // Yanlış cevap - sadece onContinue çağır
          if (window.activeExerciseComponent && typeof window.activeExerciseComponent.onContinue === 'function') {
            window.activeExerciseComponent.onContinue();
          }
        }

        resetFooter();
      } else {
        checkAnswer();
      }
    };

    const resetFooter = () => {
      canCheck.value = false;
      showResult.value = false;
      isCorrect.value = false;
      correctAnswer.value = '';
      activeExerciseContent.value = null;
    };

    const closeModal = () => {
      showModal.value = false;
    };

    return {
      activeComponent,
      canCheck,
      showResult,
      isCorrect,
      correctAnswer,
      showModal,
      hearts,
      progress,
      correctStreak,
      footerStateClass,
      buttonText,
      title,
      currentExerciseData,

      // Methods
      checkAnswer,
      continueAction,
      closeModal,
      nextExercise
    };
  }
};
</script>

<style>
.layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.layout-content {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;  
  flex: 1;  
}

/* Animation for Exercise Components */
.exercise {
  animation: fade-in 0.3s ease-in-out;
}

@keyframes fade-in {
  from {
    opacity: 0;
    transform: translateY(10px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Modal Styles */
.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.6);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-content {
  background-color: white;
  border-radius: 12px;
  width: 90%;
  max-width: 500px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
  overflow: hidden;
  animation: modal-pop 0.3s forwards;
}

.modal-header {
  padding: 1.5rem;
  background-color: #ff4b4b;
  color: white;
  text-align: center;
}

.modal-body {
  padding: 2rem;
  text-align: center;
}

.modal-footer {
  padding: 1rem;
  text-align: center;
  border-top: 1px solid #eee;
}

.hearts-notification {
  font-size: 1.2rem;
  padding: 1rem;
  background-color: #f8f9fa;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
}

@keyframes modal-pop {
  0% {
    transform: scale(0.8);
    opacity: 0;
  }

  100% {
    transform: scale(1);
    opacity: 1;
  }
}
</style>
