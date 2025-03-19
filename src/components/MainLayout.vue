<template>
  <div class="layout">
    <Header :progress="progress" :hearts="hearts" :correctStreak="correctStreak" />

    <div class="layout-content">
      <div class="layout-content-inner">
        <exercise-title v-if="currentExerciseData?.display?.type === 'title'" :title="currentExerciseData.display.title"
          :category="currentExerciseData.display.category" :imageUrl="currentExerciseData.display.imageUrl" />

        <character-speech v-if="currentExerciseData?.display?.type === 'character'"
          :text="currentExerciseData.display.text" :character-image="currentExerciseData.display.characterImage"
          :title="currentExerciseData.display.title" />

        <component :is="activeComponent" class="exercise-component mx-auto w-100"
          :exercise-data="currentExerciseData" />
      </div>
    </div>

    <Footer :showResult="showResult" :isCorrect="isCorrect" :canCheck="canCheck" :correctAnswer="correctAnswer"
      :correctStreak="correctStreak" />

    <HeartLostModal v-if="showHeartLostModal && !isCorrect" :show="showHeartLostModal" :remainingHearts="hearts"
      @continue="closeModal" />

    <NoHeartsModal v-if="showNoHeartsModal" :show="showNoHeartsModal" :totalHearts="5" @restart="restartExercise" />

    <CompletionModal v-if="showCompletionModal" :show="showCompletionModal" @restart="restartExercise" />
  </div>
</template>

<script>
import { ref, computed, onMounted, watch } from 'vue';

export default {
  components: {
    Header: Vue.defineAsyncComponent(() => window["vue3-sfc-loader"].loadModule("./src/components/common/Header.vue", window.sfcOptions)),
    Footer: Vue.defineAsyncComponent(() => window["vue3-sfc-loader"].loadModule("./src/components/common/Footer.vue", window.sfcOptions)),
    HeartLostModal: Vue.defineAsyncComponent(() => window["vue3-sfc-loader"].loadModule("./src/components/common/HeartLostModal.vue", window.sfcOptions)),
    NoHeartsModal: Vue.defineAsyncComponent(() => window["vue3-sfc-loader"].loadModule("./src/components/common/NoHeartsModal.vue", window.sfcOptions)),
    ExerciseTitle: Vue.defineAsyncComponent(() => window["vue3-sfc-loader"].loadModule("./src/components/common/ExerciseTitle.vue", window.sfcOptions)),
    CharacterSpeech: Vue.defineAsyncComponent(() => window["vue3-sfc-loader"].loadModule("./src/components/common/CharacterSpeech.vue", window.sfcOptions)),
    CompletionModal: Vue.defineAsyncComponent(() => window["vue3-sfc-loader"].loadModule("./src/components/common/CompletionModal.vue", window.sfcOptions))
  },
  setup() {
    const activeComponent = ref(null);
    const canCheck = ref(false);
    const showResult = ref(false);
    const showHeartLostModal = ref(false);
    const showNoHeartsModal = ref(false);
    const showCompletionModal = ref(false);
    const isCorrect = ref(false);
    const correctAnswer = ref('');
    const progress = ref(0);
    const stepStore = window.useStepStore();
    const hearts = computed(() => stepStore?.hearts?.value ?? 5);
    const currentExerciseData = ref(null);
    const correctStreak = ref(0);

    const correctSound = ref(null);
    const wrongSound = ref(null);

    const playCorrectSound = () => {
      try {
        if (correctSound.value) {
          correctSound.value.currentTime = 0;
          correctSound.value.play();
        } else {
          correctSound.value = new Audio('./src/assets/sfx/correct.mp3');
          correctSound.value.play();
        }
      } catch (e) {
        console.error("Error playing correct sound:", e);
      }
    };

    const playWrongSound = () => {
      try {
        if (wrongSound.value) {
          wrongSound.value.currentTime = 0;
          wrongSound.value.play();
        } else {
          wrongSound.value = new Audio('./src/assets/sfx/wrong.mp3');
          wrongSound.value.play();
        }
      } catch (e) {
        console.error("Error playing wrong sound:", e);
      }
    };

    const buttonText = computed(() => {
      if (showResult.value) {
        return isCorrect.value ? 'CONTINUE' : 'GOT IT';
      }
      return 'CHECK';
    });

    watch(() => currentExerciseData.value, (newExerciseData) => {
      if (newExerciseData?.stepProgress !== undefined) {
        progress.value = newExerciseData.stepProgress;
      }
    }, { immediate: true });

    const exposeMainLayout = () => {
      window.mainLayout = {
        canCheck,
        setCanCheck: (value) => { canCheck.value = value; },
        nextExercise,
        checkAnswer,
        continueAction,
        resetFooter,
        skipExercise
      };

      Object.defineProperty(window.mainLayout, 'canCheck', {
        get: () => canCheck.value,
        set: (value) => { canCheck.value = value; }
      });
    };

    const loadExerciseDataAndComponent = (stepId) => {
      if (!window.exerciseStepsManager) return;

      const stepData = window.exerciseStepsManager.getStepById(stepId);
      if (stepData) {
        currentExerciseData.value = stepData;
        window.currentExerciseData = stepData;

        const componentMap = {
          'word-match': 'WordMatchExercise',
          'word-builder': 'WordBuilderExercise',
          'fill-in-blank': 'FillInBlankExercise',
          'picture-match': 'PictureMatchExercise',
          'matching': 'MatchingExercise'
        };

        setActiveExercise(componentMap[stepData.type] || 'WordMatchExercise');
      } else {
        setActiveExercise('WordMatchExercise');
      }
    };

    onMounted(() => {
      exposeMainLayout();

      progress.value = 0;
      correctStreak.value = 0;

      if (stepStore) {
        const globalStep = window.globalStepId || 1;
        stepStore.setStep(globalStep);
        loadExerciseDataAndComponent(stepStore.currentStepId.value);

        watch(() => stepStore.currentStepId.value, (newStepId) => {
          loadExerciseDataAndComponent(newStepId);
        }, { immediate: true });
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
      }

      resetFooter();
    };

    const checkAnswer = () => {
      if (!canCheck.value || !window.activeExerciseComponent?.checkAnswer) return;

      const result = window.activeExerciseComponent.checkAnswer();
      isCorrect.value = result.isCorrect;
      showResult.value = true;
      correctAnswer.value = result.correctAnswer;

      if (result.isCorrect) {
        playCorrectSound();
      } else {
        playWrongSound();
      }

      const currentStep = stepStore?.currentStepId?.value || 0;
      const nextStepData = window.exerciseStepsManager?.getStepById?.(currentStep + 1);
      const stepsData = window.exerciseStepsManager?.getActiveSequenceSteps?.() || [];
      const isLastStep = currentStep >= stepsData.length;

      if (isCorrect.value) {
        correctStreak.value++;

        if (nextStepData?.stepProgress !== undefined) {
          progress.value = nextStepData.stepProgress;
        } else {
          progress.value = 100;

          setTimeout(() => {
            showCompletionModal.value = true;
          }, 500);
        }
      } else {
        correctStreak.value = 0;

        if (hearts.value > 0 && stepStore) {
          stepStore.decreaseHearts();
        }

        if (hearts.value > 0) {
          showHeartLostModal.value = true;
        }
      }

      return result;
    };

    const continueAction = () => {
      if (!stepStore) return;

      showHeartLostModal.value = false;
      showResult.value = false;

      const stepsData = window.exerciseStepsManager.getActiveSequenceSteps();
      const isLastStep = stepStore.currentStepId.value >= stepsData.length;

      if (isCorrect.value) {
        if (isLastStep) {
          showCompletionModal.value = true;
          progress.value = 100;
        } else {
          nextExercise();
        }
      } else {
        if (!isLastStep) {
          nextExercise();
        }
      }

      resetFooter();
    };

    const skipExercise = () => {
      if (!window.activeExerciseComponent?.checkAnswer) return;

      const result = window.activeExerciseComponent.checkAnswer();

      isCorrect.value = false;
      showResult.value = true;

      playWrongSound();

      const currentStepData = window.exerciseStepsManager.getStepById(stepStore.currentStepId.value);
      const isMatchingExercise = currentStepData?.type === 'matching';

      correctAnswer.value = (!isMatchingExercise && result?.correctAnswer) ? result.correctAnswer : '';
      correctStreak.value = 0;

      if (hearts.value > 0 && stepStore) {
        stepStore.decreaseHearts();
      }
    };

    const resetFooter = () => {
      canCheck.value = false;
      showResult.value = false;
      isCorrect.value = false;
      correctAnswer.value = '';
      showCompletionModal.value = false;
    };

    const closeModal = () => {
      showHeartLostModal.value = false;
    };

    const restartExercise = () => {
      if (stepStore?.resetHearts) {
        stepStore.resetHearts();
      }

      progress.value = 0;
      correctStreak.value = 0;

      showNoHeartsModal.value = false;
      showCompletionModal.value = false;

      if (window.exerciseStepsManager) {
        const firstStep = window.exerciseStepsManager.getStepById(1);
        if (firstStep) {
          stepStore.setStep(1);
          resetFooter();

          if (window.activeExerciseComponent) {
            if (typeof window.activeExerciseComponent.reset === 'function') {
              window.activeExerciseComponent.reset();
            }

            if (typeof window.activeExerciseComponent.init === 'function') {
              window.activeExerciseComponent.init();
            }
          }

          activeComponent.value = null;
          setTimeout(() => {
            loadExerciseDataAndComponent(1);
          }, 50);
        }
      }
    };

    watch(hearts, (newVal) => {
      if (newVal <= 0) {
        showNoHeartsModal.value = true;
      }
    });

    return {
      activeComponent,
      showResult,
      isCorrect,
      canCheck,
      correctAnswer,
      buttonText,
      hearts,
      correctStreak,
      progress,
      currentExerciseData,
      showHeartLostModal,
      showNoHeartsModal,
      showCompletionModal,
      checkAnswer,
      continueAction,
      closeModal,
      nextExercise,
      skipExercise,
      restartExercise,
      playCorrectSound,
      playWrongSound
    };
  }
};
</script>

<style>
.layout {
  display: grid;
  grid-template-rows: min-content minmax(0, 1fr);
  overflow: hidden;
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

.exercise-component {
  max-width: 600px;
  animation: slide-right 0.5s ease-in-out;
}

@media (max-width: 768px) {
  .exercise-component {
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

@keyframes slide-right {
  from {
    opacity: 0;
    transform: translateX(-50px);
  }

  to {
    opacity: 1;
    transform: translateX(0);
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