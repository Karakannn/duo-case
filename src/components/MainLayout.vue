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

        <component :is="activeComponent" class="exercise-component" :exercise-data="currentExerciseData" />
      </div>
    </div>

    <Footer :showResult="showResult" :isCorrect="isCorrect" :canCheck="canCheck" :correctAnswer="correctAnswer"
      :correctStreak="correctStreak" />

    <HeartLostModal 
      v-if="showHeartLostModal && !isCorrect" 
      :show="showHeartLostModal" 
      :remainingHearts="hearts" 
      @continue="closeModal" 
    />
    
    <NoHeartsModal 
      v-if="showNoHeartsModal" 
      :show="showNoHeartsModal" 
      :totalHearts="5" 
      @restart="restartExercise" 
    />
    
    <CompletionModal 
      v-if="showCompletionModal" 
      :show="showCompletionModal" 
      @restart="restartExercise" 
    />
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
    // State
    const activeComponent = ref(null);
    const activeExercise = ref(null);
    const canCheck = ref(false);
    const showResult = ref(false);
    const showHeartLostModal = ref(false);
    const showNoHeartsModal = ref(false);
    const showCompletionModal = ref(false);
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

    // Update progress based on current exercise
    watch(() => currentExerciseData.value, (newExerciseData) => {
      if (newExerciseData && typeof newExerciseData.stepProgress === 'number') {
        console.log('MainLayout - Updating progress from exercise data:', newExerciseData.stepProgress);
        progress.value = newExerciseData.stepProgress;
      }
    }, { immediate: true });

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
        resetFooter,
        skipExercise
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

        // Get step information
        const currentStep = stepStore.currentStepId.value;
        const currentStepData = window.exerciseStepsManager.getStepById(currentStep);
        const nextStepData = window.exerciseStepsManager.getStepById(currentStep + 1);
        const stepsData = window.exerciseStepsManager.getActiveSequenceSteps();
        const totalSteps = stepsData.length;
        
        console.log(`Current step ${currentStep} with progress: ${currentStepData.stepProgress}`);
        
        if (isCorrect.value) {
          // Update streak for correct answers
          correctStreak.value++;
          console.log(`Streak increased to: ${correctStreak.value}`);
          
          // Update progress immediately when answer is correct
          if (nextStepData) {
            // Use the next step's progress value
            progress.value = nextStepData.stepProgress;
            console.log(`Answer is correct! Updating progress to: ${progress.value}`);
          } else {
            // If no next step (reached the end), set progress to 100%
            progress.value = 100;
            console.log(`Final exercise completed! Progress set to 100%`);
            
            // Show completion modal when the last exercise is completed correctly
            setTimeout(() => {
              showCompletionModal.value = true;
            }, 500);
          }
        } else {
          // Reset streak for incorrect answers
          correctStreak.value = 0;
          console.log(`Streak reset to 0`);
          
          // Show heart lost modal if hearts are still available
          if (hearts.value > 0) {
            showHeartLostModal.value = true;
          }
          
          console.log(`Answer is incorrect, keeping progress at: ${progress.value}`);
        }
        
        return result;
      }
    };

    const continueAction = () => {
      console.log('continueAction');
      
      if (!stepStore) return;

      // Close modals
      showHeartLostModal.value = false;
      showResult.value = false;
      
      // Check if we have more steps
      const currentStep = stepStore.currentStepId.value;
      const stepsData = window.exerciseStepsManager.getActiveSequenceSteps();
      const isLastStep = currentStep >= stepsData.length;

      if (isCorrect.value) {
        correctStreak.value++;
        console.log(`Correct streak increased to ${correctStreak.value}`);
        
        if (isLastStep) {
          // Show completion modal if this was the last step
          showCompletionModal.value = true;
          // Set progress to 100%
          progress.value = 100;
          console.log('All exercises completed! Showing completion modal.');
        } else {
          // Only move to next step, don't update progress here
          nextExercise();
        }
      } else {
        // Incorrect answer
        if (hearts.value > 0) {
          stepStore.decreaseHearts();
        }
        
        // Reset streak on incorrect answer
        correctStreak.value = 0;
        console.log('Streak reset to 0 due to incorrect answer');
        
        // Continue to next exercise if not the last one
        if (!isLastStep) {
          nextExercise();
        }
      }
      
      resetFooter();
    };

    const skipExercise = () => {
      console.log('Skipping exercise...');
      
      // Get correct answer from current exercise
      if (window.activeExerciseComponent && typeof window.activeExerciseComponent.checkAnswer === 'function') {
        const result = window.activeExerciseComponent.checkAnswer();
        
        // Force the result to be incorrect regardless of actual answer
        isCorrect.value = false;
        showResult.value = true;
        
        // Check if the current exercise is a matching exercise - don't show answer for matching
        const currentStepData = window.exerciseStepsManager.getStepById(stepStore.currentStepId.value);
        const isMatchingExercise = currentStepData && currentStepData.type === 'matching';
        
        // Set correct answer only for non-matching exercise types
        if (!isMatchingExercise && result && result.correctAnswer) {
          correctAnswer.value = result.correctAnswer;
          console.log('Setting correct answer for skip:', result.correctAnswer);
        } else {
          // Clear correct answer for matching exercises or if no correctAnswer in result
          correctAnswer.value = '';
          console.log('Not showing correct answer for this exercise type');
        }
        
        // Reset streak as this counts as incorrect
        correctStreak.value = 0;
        console.log('Streak reset to 0 due to skipping exercise');
        
        // Decrease hearts if applicable
        if (hearts.value > 0 && stepStore) {
          stepStore.decreaseHearts();
          console.log('Heart decreased due to skipping exercise');
        }
      }
    };

    const resetFooter = () => {
      canCheck.value = false;
      showResult.value = false;
      isCorrect.value = false;
      correctAnswer.value = '';
      activeExerciseContent.value = null;
      showCompletionModal.value = false;
    };

    const closeModal = () => {
      showHeartLostModal.value = false;
    };
    
    // Restart the exercise when all hearts are lost
    const restartExercise = () => {
      console.log('Restarting exercise from beginning...');
      
      // Reset hearts
      if (stepStore && stepStore.resetHearts) {
        stepStore.resetHearts();
      }
      
      // Reset progress
      progress.value = 0;
      
      // Reset streak
      correctStreak.value = 0;
      
      // Close modal
      showNoHeartsModal.value = false;
      showCompletionModal.value = false;
      
      // Reset to first exercise
      if (window.exerciseStepsManager) {
        // Get the first step
        const firstStep = window.exerciseStepsManager.getStepById(1);
        if (firstStep) {
          // Set step ID to 1
          stepStore.setStep(1);
          
          // Reset UI state before loading new exercise
          resetFooter();
          
          // Reset any active exercise component
          if (window.activeExerciseComponent) {
            // If the component has a reset method, call it
            if (typeof window.activeExerciseComponent.reset === 'function') {
              window.activeExerciseComponent.reset();
            }
            
            // If the component has an init method, call it to reinitialize
            if (typeof window.activeExerciseComponent.init === 'function') {
              window.activeExerciseComponent.init();
            }
          }
          
          // Force reload the exercise to ensure everything is fresh
          activeComponent.value = null;
          setTimeout(() => {
            loadExerciseDataAndComponent(1);
            console.log('Exercise completely restarted');
          }, 50);
        }
      }
    };

    // Watch hearts value and show NoHeartsModal when it reaches 0
    watch(hearts, (newVal) => {
      console.log(`Hearts value changed to: ${newVal}`);
      if (newVal <= 0) {
        console.log('No hearts left, showing restart modal');
        showNoHeartsModal.value = true;
      }
    });

    return {
      activeComponent,
      activeExercise,
      activeExerciseHasCustomContent,
      showResult,
      isCorrect,
      canCheck,
      correctAnswer,
      footerStateClass,
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
      restartExercise
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

.exercise-component {
  width: 100%;
  max-width: 600px;
  margin: 0 auto;
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
