// StepStore.js - Basit ve tek yerden adım yönetim sistemi
(function() {
  const { ref, computed, reactive, readonly } = Vue;

  // Global olarak erişilebilir StepStore fonksiyonu
  window.useStepStore = function() {
    // Tüm egzersiz adımlarını tek bir yerde tanımla
    const EXERCISE_STEPS = reactive([
      { id: 1, name: 'word-builder', component: 'WordBuilderExercise', title: 'Cümle Oluştur', progressPercentage: 25 },
      { id: 2, name: 'picture-match', component: 'PictureMatchExercise', title: 'Resimli Kelime Eşleştirme', progressPercentage: 50 },
      { id: 3, name: 'word-match', component: 'MatchingExercise', title: 'Doğru Çeviriyi Seç', progressPercentage: 75 },
      { id: 4, name: 'fill-in-blank', component: 'FillInBlankExercise', title: 'Boşluk Doldurma', progressPercentage: 100 }
    ]);

    // Durum değişkenleri
    const currentStepId = ref(1);
    const hearts = ref(5);
    const score = ref(0);

    // Hesaplanan özellikler
    const currentStep = computed(() => {
      return EXERCISE_STEPS.find(step => step.id === currentStepId.value) || EXERCISE_STEPS[0];
    });

    const currentProgress = computed(() => currentStep.value.progressPercentage);
    const totalSteps = computed(() => EXERCISE_STEPS.length);

    // Adım yönetim metodları
    function setStep(stepId) {
      if (stepId >= 1 && stepId <= totalSteps.value) {
        currentStepId.value = stepId;
      }
    }

    function nextStep() {
      if (currentStepId.value < totalSteps.value) {
        currentStepId.value++;
      } else {
        // Tüm adımlar tamamlandığında başa dön
        currentStepId.value = 1;
      }
      return currentStep.value;
    }

    function previousStep() {
      if (currentStepId.value > 1) {
        currentStepId.value--;
      }
      return currentStep.value;
    }

    // Puan ve can yönetimi
    function decreaseHearts() {
      if (hearts.value > 0) {
        hearts.value--;
      }
    }

    function increaseScore(points = 1) {
      score.value += points;
    }

    // Eski sistemle uyumluluk için yardımcı fonksiyonlar
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

    // Store API'sını döndür
    return {
      // State
      currentStepId,
      currentStep,
      currentProgress,
      totalSteps,
      hearts,
      score,
      allSteps: readonly(EXERCISE_STEPS),

      // Metodlar
      setStep,
      nextStep,
      previousStep,
      decreaseHearts,
      increaseScore,

      // Eski API uyumluluk metodları
      getProgress,
      getCurrentStep,
      getCurrentStepInfo,
      getHearts,
      getScore,
      getTotalSteps
    };
  };

  // Global store tek instance - eski pencere store'u ile uyumlu
  let globalStepStore;

  // Global olarak erişilebilir başlatma fonksiyonu
  window.initializeGlobalStore = function() {
    if (!globalStepStore) {
      globalStepStore = window.useStepStore();
      
      // Eski window.store API'si ile uyumluluk için global store'u ekle
      window.store = {
        ...window.store, // Varsa mevcut store özelliklerini koru
        
        // State getters
        getProgress: () => globalStepStore.getProgress(),
        getHearts: () => globalStepStore.getHearts(),
        getScore: () => globalStepStore.getScore(),
        getCurrentStep: () => globalStepStore.getCurrentStep(),
        getTotalSteps: () => globalStepStore.getTotalSteps(),
        getCurrentStepInfo: () => globalStepStore.getCurrentStepInfo(),
        
        // Actions
        setCurrentStep: (stepId) => globalStepStore.setStep(stepId),
        decreaseHearts: () => globalStepStore.decreaseHearts(),
        increaseScore: (points) => globalStepStore.increaseScore(points),
        nextStep: () => globalStepStore.nextStep(),
        
        // Eski state ile uyumluluk için alanlar
        _state: {
          get progress() { return globalStepStore.currentProgress.value; },
          get hearts() { return globalStepStore.hearts.value; },
          get score() { return globalStepStore.score.value; },
          get currentStep() { return globalStepStore.currentStepId.value; },
          get totalSteps() { return globalStepStore.totalSteps.value; },
          get steps() { return [...globalStepStore.allSteps]; }
        }
      };
    }
    
    return globalStepStore;
  };
})();
