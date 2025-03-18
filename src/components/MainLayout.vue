<template>
  <div class="layout">
    <Header :progress="progress" :hearts="hearts" :correctStreak="correctStreak" />

    <div class="layout-content">
      <div class="layout-content-inner">
        <exercise-title
          v-if="currentExerciseData && currentExerciseData.display && currentExerciseData.display.type === 'title'"
          :title="currentExerciseData.display.title" :category="currentExerciseData.display.category"
          :imageUrl="currentExerciseData.display.imageUrl" />

        <character-speech
          v-if="currentExerciseData && currentExerciseData.display && currentExerciseData.display.type === 'character'"
          :text="currentExerciseData.display.text" :character-image="currentExerciseData.display.characterImage"
          :title="currentExerciseData.display.title" />

        <component :is="activeComponent" class="exercise" :exercise-data="currentExerciseData" />
      </div>
    </div>

    <Footer :showResult="showResult" :isCorrect="isCorrect" :canCheck="canCheck" :correctAnswer="correctAnswer"
      :correctStreak="correctStreak" />

    <HeartLostModal v-if="showModal && !isCorrect" :show="showModal" :remainingHearts="hearts" @continue="closeModal" />
  </div>
</template>

<script>
import { ref, computed, onMounted, watch } from 'vue';

export default {
  components: {
    Header: Vue.defineAsyncComponent(() => window["vue3-sfc-loader"].loadModule("./src/components/common/Header.vue", window.sfcOptions)),
    Footer: Vue.defineAsyncComponent(() => window["vue3-sfc-loader"].loadModule("./src/components/common/Footer.vue", window.sfcOptions)),
    HeartLostModal: Vue.defineAsyncComponent(() => window["vue3-sfc-loader"].loadModule("./src/components/common/HeartLostModal.vue", window.sfcOptions)),
    ExerciseTitle: Vue.defineAsyncComponent(() => window["vue3-sfc-loader"].loadModule("./src/components/common/ExerciseTitle.vue", window.sfcOptions)),
    CharacterSpeech: Vue.defineAsyncComponent(() => window["vue3-sfc-loader"].loadModule("./src/components/common/CharacterSpeech.vue", window.sfcOptions))
  },
  setup() {
    // State
    const activeComponent = ref(null);
    const activeExercise = ref(null);
    const canCheck = ref(false);
    const showResult = ref(false);
    const showModal = ref(false);
    const isCorrect = ref(true);
    const correctAnswer = ref('coffee');
    const activeExerciseContent = ref(null);
    const progress = ref(0);
    const stepStore = window.useStepStore();
    const hearts = computed(() => {
      if (stepStore && stepStore.hearts) {
        console.log(`MainLayout - hearts computed - StepStore hearts değeri: ${stepStore.hearts.value}`);
        return stepStore.hearts.value;
      }
      return 5;
    });
    const title = ref('');
    const currentExerciseData = ref(null);
    const correctStreak = ref(0);

    // Current step tracking
    const currentStepIndex = ref(0);

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
      window.mainLayout = {
        canCheck,
        setCanCheck: (value) => {
          canCheck.value = value;
        },
        nextExercise,
        checkAnswer,
        continueAction,
        resetFooter
      };

      Object.defineProperty(window.mainLayout, 'canCheck', {
        get: () => canCheck.value,
        set: (value) => {
          canCheck.value = value;
        }
      });
    };

    const getGlobalStep = () => {
      return window.globalStepId || 1;
    };

    const loadExerciseDataAndComponent = (stepId) => {
      if (!window.exerciseStepsManager) {
        console.log('MainLayout - window.exerciseStepsManager bulunamadı');
        return;
      }

      const stepData = window.exerciseStepsManager.getStepById(stepId);
      console.log('MainLayout - stepId:', stepId);
      console.log('MainLayout - stepData:', stepData);

      if (stepData) {
        currentExerciseData.value = stepData;
        // Global değişken olarak da ayarla
        window.currentExerciseData = stepData;
        console.log('MainLayout - currentExerciseData.value:', currentExerciseData.value);
        console.log('MainLayout - window.currentExerciseData:', window.currentExerciseData);

        const componentMap = {
          'word-match': 'WordMatchExercise',
          'word-builder': 'WordBuilderExercise',
          'fill-in-blank': 'FillInBlankExercise',
          'picture-match': 'PictureMatchExercise',
          'matching': 'MatchingExercise'
        };

        const componentName = componentMap[stepData.type] || 'WordMatchExercise';
        setActiveExercise(componentName);

      } else {
        setActiveExercise('WordMatchExercise');
      }
    };

    onMounted(() => {
      exposeMainLayout();

      const globalStep = getGlobalStep();

      progress.value = 0;
      correctStreak.value = 0;

      if (stepStore) {
        console.log('MainLayout - onMounted - stepStore bulundu');
        stepStore.setStep(globalStep);

        loadExerciseDataAndComponent(stepStore.currentStepId.value);

        watch(() => stepStore.currentStepId.value, (newStepId) => {
          loadExerciseDataAndComponent(newStepId);

          console.log(`Step changed to ${newStepId}`);
        }, { immediate: true });

        watch(() => stepStore.hearts.value, (newValue, oldValue) => {
          console.log(`MainLayout - stepStore.hearts değişti: ${oldValue} -> ${newValue}`);
        });
      } else {
        console.log('MainLayout - onMounted - stepStore bulunamadı!');
      }
    });

    const setActiveExercise = (componentName) => {
      resetFooter();
      activeComponent.value = Vue.defineAsyncComponent(() =>
        window["vue3-sfc-loader"].loadModule(`./src/exercises/${componentName}.vue`, window.sfcOptions)
      );
    };

    const nextExercise = () => {
      if (!stepStore) return;

      const nextStep = stepStore.nextStep();

      if (nextStep) {
        loadExerciseDataAndComponent(stepStore.currentStepId.value);
        console.log(`Moving to next exercise, step: ${stepStore.currentStepId.value}`);
      }

      resetFooter();
    };

    const checkAnswer = () => {
      if (!canCheck.value) {
        return;
      }

      console.log('checkAnswer', canCheck.value);
      console.log('window.activeExerciseComponent', window.activeExerciseComponent);


      if (window.activeExerciseComponent && typeof window.activeExerciseComponent.checkAnswer === 'function') {
        const result = window.activeExerciseComponent.checkAnswer();
        isCorrect.value = result.isCorrect;
        showResult.value = true;
        correctAnswer.value = result.correctAnswer;

        if (isCorrect.value) {
          correctStreak.value++;
          console.log(`Correct! Streak is now: ${correctStreak.value}`);

          if (stepStore) {
            progress.value = stepStore.currentProgress.value;
            console.log(`Correct answer, updating progress to: ${progress.value}%`);
          }
        } else {
          correctStreak.value = 0;
          progress.value = 0;

          if (stepStore) {
            console.log('MainLayout - Yanlış cevap, can azaltılıyor');
            stepStore.decreaseHearts();
            showModal.value = true;
          }
        }
      }
    };

    const continueAction = () => {
      if (showResult.value) {
        if (isCorrect.value) {
          if (window.activeExerciseComponent && typeof window.activeExerciseComponent.onContinue === 'function') {
            window.activeExerciseComponent.onContinue();
          }

          if (correctStreak.value >= 2 && stepStore) {
            progress.value = stepStore.currentProgress.value;
            console.log(`Streak is ${correctStreak.value}, continuing with progress: ${progress.value}%`);
          } else {
            console.log(`Streak is ${correctStreak.value}, progress stays at: ${progress.value}%`);
          }
        } else {
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
  display: grid;
  grid-template-rows: min-content minmax(0, 1fr);
  overflow-x: hidden;
  overflow-y: auto;
  grid-gap: 16px;
  height: 100vh;
  width: 100%;
  background-color: var(--color-snow);
  padding: 24px 16px;
}

.layout-content {
  align-content: center;
  display: grid;
  font-size: 19px;
  grid-template-columns: 1fr;
  grid-template-rows: minmax(0, 1fr);
  height: 100%;
  justify-content: center;
  text-align: center;
  width: 100%;
}

.layout-content-inner {
  display: grid;
  grid-gap: 24px;
  grid-template-rows: min-content minmax(0, 1fr);
}

.exercise {
  width: 100%;
  max-width: 600px;
  margin: 0 auto;
}

@media (max-width: 768px) {

  .exercise {
    max-width: 100%;
  }
}

@media (min-width: 700px) {

  .layout {
    padding: 0;
  }
  
  .layout-content {
    grid-template-columns: min-content;
    grid-template-rows: min-content;
  }

  .layout-content-inner {
    min-height: 450px;
    overflow: visible;
    width: 600px;
    grid-gap: 24px;
  }
}





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

.modal-content-container {
  animation: modal-pop 0.3s forwards;
}

.modal-content {
  border-radius: 12px;
  max-width: 500px;
  overflow: hidden;
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
