(function () {
  const { ref, computed, readonly } = Vue;

  if (window.globalStepId === undefined) {
    window.globalStepId = 1;
  }

  function getGlobalStep() {
    return window.globalStepId || 1;
  }

  function updateGlobalStep(stepId) {
    window.globalStepId = stepId;
  }

  window.useStepStore = function () {
    const EXERCISE_STEPS = computed(() => {
      if (!window.exerciseTypes) return [];

      const sequenceExercises = window.getActiveSequenceExercises
        ? window.getActiveSequenceExercises()
        : [...window.exerciseTypes];

      const stepsWithProgress = [];

      if (window.exerciseStepsManager && window.exerciseStepsManager.getActiveSequenceSteps) {
        const activeSteps = window.exerciseStepsManager.getActiveSequenceSteps();

        sequenceExercises.forEach((exercise, index) => {
          const matchingStep = activeSteps.find(step => step.type === exercise.id);

          stepsWithProgress.push({
            id: index + 1,
            name: exercise.id,
            component: exercise.component,
            title: exercise.name,
            description: exercise.description,
            icon: exercise.icon,
            progressPercentage: matchingStep && matchingStep.stepProgress
              ? matchingStep.stepProgress
              : Math.round(((index + 1) / sequenceExercises.length) * 100)
          });
        });

        return stepsWithProgress;
      }

      return sequenceExercises.map((exercise, index) => ({
        id: index + 1,
        name: exercise.id,
        component: exercise.component,
        title: exercise.name,
        description: exercise.description,
        icon: exercise.icon,
        progressPercentage: Math.round(((index + 1) / sequenceExercises.length) * 100)
      }));
    });

    const initialStepId = getGlobalStep();
    const currentStepId = ref(initialStepId);
    const hearts = ref(5);
    const score = ref(0);
    const activeSequence = ref("default");

    const currentStep = computed(() => {
      if (EXERCISE_STEPS.value.length === 0) return null;

      const steps = EXERCISE_STEPS.value.filter(step => step.sequence === activeSequence.value);
      if (steps.length === 0) return null;

      const step = steps.find(s => s.id === currentStepId.value);
      return step || null;
    });

    const currentProgress = computed(() => currentStep.value ? currentStep.value.progressPercentage : 0);
    const totalSteps = computed(() => EXERCISE_STEPS.value.length);

    const refreshTrigger = ref(0);
    function triggerRefresh() {
      refreshTrigger.value++;
    }

    function setStep(stepId) {
      if (stepId >= 1 && stepId <= totalSteps.value) {
        currentStepId.value = stepId;
        updateGlobalStep(stepId);
      }
    }

    function nextStep() {
      if (currentStepId.value < totalSteps.value) {
        currentStepId.value++;
      } else {
        currentStepId.value = 1;
      }
      updateGlobalStep(currentStepId.value);
      return currentStep.value;
    }

    function previousStep() {
      if (currentStepId.value > 1) {
        currentStepId.value--;
        updateGlobalStep(currentStepId.value);
      }
      return currentStep.value;
    }

    function changeSequence(sequenceName) {
      if (window.setActiveSequence && window.setActiveSequence(sequenceName)) {
        activeSequence.value = sequenceName;
        currentStepId.value = 1;
        updateGlobalStep(1);
        return true;
      }
      return false;
    }

    function decreaseHearts() {
      if (hearts.value > 0) {
        hearts.value--;

        if (window.globalStore) {
          window.globalStore.hearts = hearts.value;
        }

        if (window.updateHeaderHearts) {
          window.updateHeaderHearts(hearts.value);
        }
      }
    }

    function resetHearts() {
      hearts.value = 5;

      if (window.globalStore) {
        window.globalStore.hearts = hearts.value;
      }

      if (window.updateHeaderHearts) {
        window.updateHeaderHearts(hearts.value);
      }
    }

    function increaseScore(points = 1) {
      score.value += points;
    }

    function getProgress() {
      return currentProgress.value;
    }

    function getCurrentStep() {
      return currentStepId.value;
    }

    function getCurrentStepInfo() {
      return currentStep.value;
    }

    function getHearts() {
      return hearts.value;
    }

    function getScore() {
      return score.value;
    }

    function getTotalSteps() {
      return totalSteps.value;
    }

    function getActiveSequence() {
      return activeSequence.value;
    }

    return {
      currentStepId,
      currentStep,
      currentProgress,
      totalSteps,
      hearts,
      score,
      activeSequence,
      allSteps: readonly(EXERCISE_STEPS),
      refreshTrigger,

      setStep,
      nextStep,
      previousStep,
      changeSequence,
      decreaseHearts,
      resetHearts,
      increaseScore,
      triggerRefresh,

      getProgress,
      getCurrentStep,
      getCurrentStepInfo,
      getHearts,
      getScore,
      getTotalSteps,
      getActiveSequence
    };
  };

  function initializeGlobalStore() {
    const globalStepStore = window.useStepStore();

    window.stepStore = globalStepStore;

    window.store = {
      getProgress: globalStepStore.getProgress,
      getCurrentStep: globalStepStore.getCurrentStep,
      getCurrentStepInfo: globalStepStore.getCurrentStepInfo,
      getHearts: globalStepStore.getHearts,
      getScore: globalStepStore.getScore,
      getTotalSteps: globalStepStore.getTotalSteps,
      getActiveSequence: globalStepStore.getActiveSequence,

      setStep: globalStepStore.setStep,
      nextStep: globalStepStore.nextStep,
      previousStep: globalStepStore.previousStep,
      changeSequence: globalStepStore.changeSequence,
      decreaseHearts: globalStepStore.decreaseHearts,
      increaseScore: globalStepStore.increaseScore
    };

    window.globalStore = {
      hearts: globalStepStore.hearts.value,
      score: globalStepStore.score.value,
      currentStepId: globalStepStore.currentStepId.value
    };

    return globalStepStore;
  }

  initializeGlobalStore();
})();