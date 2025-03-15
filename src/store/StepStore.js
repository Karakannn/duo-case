// StepStore.js - Basit ve tek yerden adım yönetim sistemi
(function() {
  const { ref, computed, reactive, readonly } = Vue;

  // Global olarak erişilebilir StepStore fonksiyonu
  window.useStepStore = function() {
    // Egzersiz türlerini merkezileştirilmiş exerciseTypes dizisinden al
    const EXERCISE_STEPS = computed(() => {
      // Eğer useExercise.js henüz yüklenmemişse boş dizi döndür
      if (!window.exerciseTypes) return [];
      
      // Aktif sıralamayı kullanarak adım listesini oluştur
      // getActiveSequenceExercises fonksiyonu useExercise.js'den geliyor
      const sequenceExercises = window.getActiveSequenceExercises 
        ? window.getActiveSequenceExercises() 
        : [...window.exerciseTypes];
      
      // Sıralama dizisini kullanarak adım listesini oluştur
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

    // Durum değişkenleri
    const currentStepId = ref(1);
    const hearts = ref(5);
    const score = ref(0);
    
    // Aktif sıralama
    const activeSequence = ref("default");

    // Hesaplanan özellikler
    const currentStep = computed(() => {
      if (EXERCISE_STEPS.value.length === 0) return null;
      return EXERCISE_STEPS.value.find(step => step.id === currentStepId.value) || EXERCISE_STEPS.value[0];
    });

    const currentProgress = computed(() => currentStep.value ? currentStep.value.progressPercentage : 0);
    const totalSteps = computed(() => EXERCISE_STEPS.value.length);

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
    
    // Egzersiz sıralamasını değiştir
    function changeSequence(sequenceName) {
      if (window.setActiveSequence && window.setActiveSequence(sequenceName)) {
        activeSequence.value = sequenceName;
        // İlk adıma geri dön
        currentStepId.value = 1;
        return true;
      }
      return false;
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
    
    function getActiveSequence() {
      return activeSequence.value;
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
      activeSequence,
      allSteps: readonly(EXERCISE_STEPS),

      // Metodlar
      setStep,
      nextStep,
      previousStep,
      changeSequence,
      decreaseHearts,
      increaseScore,

      // Eski API uyumluluk metodları
      getProgress,
      getCurrentStep,
      getCurrentStepInfo,
      getHearts,
      getScore,
      getTotalSteps,
      getActiveSequence
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
        getActiveSequence: () => globalStepStore.getActiveSequence(),
        
        // Actions
        setCurrentStep: (stepId) => globalStepStore.setStep(stepId),
        decreaseHearts: () => globalStepStore.decreaseHearts(),
        increaseScore: (points) => globalStepStore.increaseScore(points),
        nextStep: () => globalStepStore.nextStep(),
        changeSequence: (sequenceName) => globalStepStore.changeSequence(sequenceName),
        
        // Eski state ile uyumluluk için alanlar
        _state: {
          get progress() { return globalStepStore.currentProgress.value; },
          get hearts() { return globalStepStore.hearts.value; },
          get score() { return globalStepStore.score.value; },
          get currentStep() { return globalStepStore.currentStepId.value; },
          get totalSteps() { return globalStepStore.totalSteps.value; },
          get steps() { return [...globalStepStore.allSteps.value]; },
          get activeSequence() { return globalStepStore.activeSequence.value; }
        }
      };
    }
    
    return globalStepStore;
  };
})();
