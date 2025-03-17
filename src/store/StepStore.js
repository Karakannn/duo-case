// StepStore.js - Basit ve tek yerden adım yönetim sistemi
(function() {
  const { ref, computed, reactive, readonly } = Vue;

  // Global adım değişkeni (başlangıçta 1)
  if (window.globalStepId === undefined) {
    window.globalStepId = 1;
  }

  // Global adım değişkeninden adım numarasını al
  function getGlobalStep() {
    return window.globalStepId || 1;
  }

  // Global adım değişkenini güncelle
  function updateGlobalStep(stepId) {
    window.globalStepId = stepId;
  }

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
      
      // Adımları exerciseStepsManager'dan al
      const stepsWithProgress = [];
      
      if (window.exerciseStepsManager && window.exerciseStepsManager.getActiveSequenceSteps) {
        const activeSteps = window.exerciseStepsManager.getActiveSequenceSteps();
        
        // Adım bilgilerini eşleştir
        sequenceExercises.forEach((exercise, index) => {
          // İlgili adımı bul
          const matchingStep = activeSteps.find(step => step.type === exercise.id);
          
          stepsWithProgress.push({
            id: index + 1,
            name: exercise.id,
            component: exercise.component,
            title: exercise.name,
            description: exercise.description,
            icon: exercise.icon,
            // Adımın kendi stepProgress değeri varsa onu kullan, yoksa otomatik hesapla
            progressPercentage: matchingStep && matchingStep.stepProgress 
              ? matchingStep.stepProgress 
              : Math.round(((index + 1) / sequenceExercises.length) * 100)
          });
        });
        
        return stepsWithProgress;
      }
      
      // Eğer exerciseStepsManager yoksa veya getActiveSequenceSteps metodu yoksa, eski yöntemi kullan
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

    // Global değişkenden başlangıç adımını al
    const initialStepId = getGlobalStep();

    // Adım bilgisi ve durum değişkenleri
    const currentStepId = ref(initialStepId);
    const hearts = ref(5);
    const score = ref(0);
    const activeSequence = ref("default");

    // Hesaplanan özellikler
    const currentStep = computed(() => {
      if (EXERCISE_STEPS.value.length === 0) return null;
      
      const steps = EXERCISE_STEPS.value.filter(step => step.sequence === activeSequence.value);
      if (steps.length === 0) return null;
      
      const step = steps.find(s => s.id === currentStepId.value);
      return step || null;
    });

    const currentProgress = computed(() => currentStep.value ? currentStep.value.progressPercentage : 0);
    const totalSteps = computed(() => EXERCISE_STEPS.value.length);

    // Reaktif değişkenlerin güncellenmesini tetiklemek için yardımcı fonksiyon
    const refreshTrigger = ref(0);
    function triggerRefresh() {
      refreshTrigger.value++;
    }

    // Adım yönetim metodları
    function setStep(stepId) {
      if (stepId >= 1 && stepId <= totalSteps.value) {
        currentStepId.value = stepId;
        // Global değişkeni güncelle
        updateGlobalStep(stepId);
      }
    }

    function nextStep() {
      if (currentStepId.value < totalSteps.value) {
        currentStepId.value++;
      } else {
        // Tüm adımlar tamamlandığında başa dön
        currentStepId.value = 1;
      }
      // Global değişkeni güncelle
      updateGlobalStep(currentStepId.value);
      return currentStep.value;
    }

    function previousStep() {
      if (currentStepId.value > 1) {
        currentStepId.value--;
        // Global değişkeni güncelle
        updateGlobalStep(currentStepId.value);
      }
      return currentStep.value;
    }
    
    // Egzersiz sıralamasını değiştir
    function changeSequence(sequenceName) {
      if (window.setActiveSequence && window.setActiveSequence(sequenceName)) {
        activeSequence.value = sequenceName;
        // İlk adıma geri dön
        currentStepId.value = 1;
        // Global değişkeni güncelle
        updateGlobalStep(1);
        return true;
      }
      return false;
    }

    // Puan ve can yönetimi
    function decreaseHearts() {
      if (hearts.value > 0) {
        hearts.value--;
        console.log(`StepStore - Can azaltıldı. Yeni can: ${hearts.value}`);
        
        // Global değişkenleri güncelle
        if (window.globalStore) {
          window.globalStore.hearts = hearts.value;
        }
        
        // Header bileşenini doğrudan güncelle
        if (window.updateHeaderHearts) {
          window.updateHeaderHearts(hearts.value);
        }
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

    // Store'u döndür
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
      refreshTrigger,
      
      // Actions
      setStep,
      nextStep,
      previousStep,
      changeSequence,
      decreaseHearts,
      increaseScore,
      triggerRefresh,
      
      // Getters
      getProgress,
      getCurrentStep,
      getCurrentStepInfo,
      getHearts,
      getScore,
      getTotalSteps,
      getActiveSequence
    };
  };

  // Global StepStore'u başlat
  function initializeGlobalStore() {
    const globalStepStore = window.useStepStore();
    
    // Global değişkenlere ata
    window.stepStore = globalStepStore;
    
    // Eski API uyumluluğu için window.store'u güncelle
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
    
    // Basit bir global store objesi oluştur
    window.globalStore = {
      hearts: globalStepStore.hearts.value,
      score: globalStepStore.score.value,
      currentStepId: globalStepStore.currentStepId.value
    };
    
    return globalStepStore;
  }
  
  // Otomatik olarak global store'u başlat
  initializeGlobalStore();
})();
