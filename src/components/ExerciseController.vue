<template>
  <div class="exercise-container">
    <div class="exercise-wrapper">
      <component 
        v-if="activeComponent" 
        :is="activeComponent" 
        :key="currentStepIndex" 
        ref="activeExercise"
        @complete="nextExercise"
      />
    </div>
  </div>
</template>

<script>
export default {
  name: 'ExerciseController',
  setup() {
    const { ref, onMounted, onBeforeUnmount, computed, watch, nextTick, markRaw } = Vue;
    
    // Exercise Components - use markRaw to prevent Vue reactivity warnings
    const exercises = [
      {
        component: markRaw(Vue.defineAsyncComponent(() => 
          window["vue3-sfc-loader"].loadModule("./src/exercises/WordBuilderExercise.vue", window.sfcOptions)
        )),
        id: 'wordBuilder'
      },
      {
        component: markRaw(Vue.defineAsyncComponent(() => 
          window["vue3-sfc-loader"].loadModule("./src/exercises/PictureMatchExercise.vue", window.sfcOptions)
        )),
        id: 'pictureMatch'
      },
      {
        component: markRaw(Vue.defineAsyncComponent(() => 
          window["vue3-sfc-loader"].loadModule("./src/exercises/MatchingExercise.vue", window.sfcOptions)
        )),
        id: 'wordMatch'
      },
      {
        component: markRaw(Vue.defineAsyncComponent(() => 
          window["vue3-sfc-loader"].loadModule("./src/exercises/FillInBlankExercise.vue", window.sfcOptions)
        )),
        id: 'fillInBlank'
      },
      {
        component: markRaw(Vue.defineAsyncComponent(() => 
          window["vue3-sfc-loader"].loadModule("./src/exercises/TextInputExercise.vue", window.sfcOptions)
        )),
        id: 'textInput'
      }
    ];
    
    // State
    const currentStepIndex = ref(0);
    const activeExercise = ref(null);
    const currentStep = ref(1); // Yerel reaktif adım değişkeni
    
    // Update local step from store
    const syncCurrentStep = () => {
      console.log('ExerciseController - syncCurrentStep çağrıldı');
      const store = window.store || {};
      if (store && typeof store.getCurrentStep === 'function') {
        currentStep.value = store.getCurrentStep();
        console.log('ExerciseController - currentStep senkronize edildi:', currentStep.value);
      }
    };
    
    // Computed for the active component based on current step
    const activeComponent = computed(() => {
      // Sync with global store
      syncCurrentStep();
      
      // Map step to exercise index
      const exerciseIndex = (currentStep.value - 1) % exercises.length;
      
      // Update the current exercise index
      currentStepIndex.value = exerciseIndex;
      
      console.log('ExerciseController - activeComponent computed çalıştı, adım:', currentStep.value, 'egzersiz:', exerciseIndex);
      
      // Return the corresponding component
      if (exerciseIndex >= 0 && exerciseIndex < exercises.length) {
        return exercises[exerciseIndex].component;
      }
      
      return null;
    });
    
    // Move to the next exercise
    const nextExercise = () => {
      console.log('ExerciseController - nextExercise() çağrıldı');
      console.log('ExerciseController - Moving to next exercise from step:', currentStepIndex.value);
      
      // Update store progress (if available)
      const store = window.store || {};
      if (store.nextStep) {
        try {
          console.log('ExerciseController - store.nextStep() çağrılıyor...');
          // nextStep zaten içeride progress'i güncelliyor, ayrıca güncellemeye gerek yok
          store.nextStep();
          
          // Force Vue to react by updating local step
          syncCurrentStep();
          
          // MainLayout'ı da güncelle (eğer mevcutsa)
          if (window.mainLayout && typeof window.mainLayout.triggerStoreUpdate === 'function') {
            window.mainLayout.triggerStoreUpdate();
            console.log('ExerciseController - MainLayout store güncellemesi tetiklendi');
          }
          
          console.log('ExerciseController - Advanced to next step in lesson. New step:', currentStep.value);
        } catch (err) {
          console.error('ExerciseController - Error advancing to next step:', err);
        }
      } else {
        console.warn('ExerciseController - store.nextStep mevcut değil!');
      }
      
      // Reset the global state after component change
      nextTick(() => {
        console.log('ExerciseController - nextTick callback çalışıyor');
        // Safety check for global state
        if (window.mainLayout) {
          console.log('ExerciseController - mainLayout state sıfırlanıyor');
          const layout = window.mainLayout;
          layout.showResult.value = false;
          layout.isCorrect.value = false;
          layout.canCheck.value = false;
          layout.correctAnswer.value = '';
        } else {
          console.warn('ExerciseController - window.mainLayout mevcut değil!');
        }
        
        // Clean up old references to ensure correct component initialization
        console.log('ExerciseController - activeExerciseComponent sıfırlanıyor');
        window.activeExerciseComponent = null;
        console.log('ExerciseController - activeComponent değeri:', activeComponent.value);
      });
    };
    
    // Update global reference when component changes
    watch(activeComponent, (newVal, oldVal) => {
      console.log('ExerciseController - activeComponent değişti!', {
        eski: oldVal ? oldVal.name : 'null',
        yeni: newVal ? newVal.name : 'null'
      });
      
      // Clear previous references first
      window.activeExerciseComponent = null;
      
      console.log('ExerciseController - Active component changed, waiting for component to initialize...');
    });
    
    // Initialize component based on current step
    onMounted(() => {
      console.log('ExerciseController - onMounted çağrıldı');
      syncCurrentStep(); // İlk açılışta adım bilgisini senkronize et
      
      // Initialize with first exercise
      if (window.mainLayout) {
        window.mainLayout.canCheck.value = false;
        window.mainLayout.showResult.value = false;
        window.mainLayout.isCorrect.value = false;
      }
      
      // Set progress from store
      const store = window.store || {};
      if (typeof store.setProgress === 'function') {
        const totalSteps = 5; // Toplam egzersiz adımı
        const currentStep = store.getCurrentStep ? store.getCurrentStep() : 1;
        
        // Geçerli adımın yüzdelik ilerlemesi (20%, 40%, 60%, 80%, 100%)
        const progressPercentage = Math.round((currentStep / totalSteps) * 100);
        store.setProgress(progressPercentage);
      }
    });
    
    // Clean up on unmount
    onBeforeUnmount(() => {
      // Clean up global references
      window.activeExerciseComponent = null;
    });
    
    return {
      activeComponent,
      currentStepIndex,
      activeExercise,
      nextExercise
    };
  }
}
</script>

<style scoped>
.exercise-container {
  max-width: 600px;
  margin: 0 auto;
  padding: 0;
}

.exercise-wrapper {
  position: relative;
  min-height: 300px;
}
</style>
