<template>
  <exercise-container :title="title">
    <div v-if="audioWord" class="audio-container mb-4 text-center">
      <div class="audio-button">
        <span class="badge bg-primary rounded-pill fs-5 px-4 py-2">
          <i class="fas fa-volume-up me-2"></i>
          <span>{{ audioWord }}</span>
        </span>
      </div>
    </div>
    
    <div class="row g-3">
      <div v-for="(option, index) in options" :key="index" class="col-6">
        <div 
          :class="['option-card', 'card', 'p-3', 'h-100', 'text-center', 
                  selected === index ? 'selected' : '',
                  showResult && index === selected ? (isCorrect ? 'correct' : 'incorrect') : '']"
          @click="!showResult && selectOption(index)"
        >
          <div class="option-image mb-2">
            <img :src="option.image" :alt="option.text" class="img-fluid mx-auto" style="max-height: 100px;">
          </div>
          <div class="option-text">
            {{ option.text }}
          </div>
        </div>
      </div>
    </div>
  </exercise-container>
</template>

<script>
export default {
  name: 'PictureMatchExercise',
  components: {
    ExerciseContainer: Vue.defineAsyncComponent(() => window["vue3-sfc-loader"].loadModule("./src/components/common/ExerciseContainer.vue", window.sfcOptions))
  },
  emits: ['complete'],
  setup(props, { emit }) {
    const { ref, computed, onMounted, watch } = Vue;
    
    // State
    const title = "Bunlardan hangisi \"çay\"?";
    const audioWord = "çay";  // This would be the word played in audio
    const options = ref([
      { text: "milk", image: "/src/assets/images/milk.svg" },
      { text: "coffee", image: "/src/assets/images/coffee.svg" },
      { text: "tea", image: "/src/assets/images/tea.svg" }
    ]);
    const correctIndex = 2; // "tea" is correct (index 2)
    const selected = ref(null);
    const isCorrect = ref(false);
    const showResult = ref(false);
    
    // Get correct answer text for display
    const getCorrectAnswerText = () => {
      if (correctIndex === null || correctIndex < 0 || correctIndex >= options.value.length) {
        return '';
      }
      return options.value[correctIndex].text || '';
    };
    
    // Safely select an option
    const selectOption = (index) => {
      if (index !== null && index >= 0 && index < options.value.length) {
        selected.value = index;
      }
    };
    
    // Check the selected answer
    const checkAnswer = () => {
      console.log('PictureMatchExercise - checkAnswer() çağrıldı');
      if (selected.value === null) return;
      
      isCorrect.value = selected.value === correctIndex;
      console.log('PictureMatchExercise - cevap kontrol edildi:', isCorrect.value ? 'doğru' : 'yanlış');
      
      // Update main layout
      if (window.mainLayout) {
        const mainLayout = window.mainLayout;
        
        // Cevap doğruysa puan artır
        if (isCorrect.value && window.store && typeof window.store.increaseScore === 'function') {
          window.store.increaseScore(10); // Her doğru cevap için 10 puan
          console.log('PictureMatchExercise - Puan artırıldı:', window.store.getScore());
        }
        
        // Sonuç ekranını göster
        mainLayout.updateResultState({
          show: true,
          isCorrect: isCorrect.value,
          correctAnswer: isCorrect.value ? '' : getCorrectAnswerText()
        });
        
        // Sonucu bildir
        mainLayout.showResultModal(isCorrect.value);
      } else {
        console.error('PictureMatchExercise - window.mainLayout bulunamadı!');
      }
      
      return isCorrect.value;
    };
    
    // Reset exercise
    const reset = () => {
      console.log('PictureMatchExercise - reset() çağrıldı');
      selected.value = null;
      isCorrect.value = false;
      showResult.value = false;
      if (window.mainLayout) window.mainLayout.canCheck.value = false;
    };
    
    // Handle continue action
    const onContinue = () => {
      console.log('PictureMatchExercise - onContinue() çağrıldı, isCorrect:', isCorrect.value);
      if (isCorrect.value) {
        console.log('PictureMatchExercise - emit("complete") çağrılıyor');
        emit('complete');
      } else {
        console.log('PictureMatchExercise - reset() çağrılıyor (yanlış cevap durumunda)');
        reset();
      }
    };
    
    // Get the result content for result modal
    const getResultContent = () => {
      // Bu fonksiyon, sonuç modalında gösterilecek özel içeriği oluşturabilir
      const h = Vue.h;
      if (correctIndex === null || correctIndex < 0 || !options.value || !options.value[correctIndex]) {
        // Geçerli bir seçenek yoksa boş bir div döndür
        return h('div', { class: 'mb-3 p-3 rounded-3' }, []);
      }

      return h('div', { class: 'mb-3 p-3 rounded-3' }, [
        h('div', { class: 'mb-2 fs-5 ' + (isCorrect.value ? 'text-success' : 'text-danger') }, [
          h('i', { class: isCorrect.value ? 'fas fa-check-circle me-2' : 'fas fa-times-circle me-2' }),
          h('span', { class: 'fw-bold' }, isCorrect.value ? 'Doğru!' : 'Yanlış'),
          h('div', { class: 'mt-3' }, [
            h('img', { 
              src: options.value[correctIndex].image, 
              alt: options.value[correctIndex].text,
              style: 'max-height: 120px; max-width: 100%;',
              class: 'rounded-3'
            })
          ])
        ])
      ]);
    };
    
    // Initialize
    onMounted(() => {
      console.log('PictureMatchExercise - onMounted çağrıldı');
      reset();
      if (window.activeExerciseComponent) {
        console.log('PictureMatchExercise - eski activeExerciseComponent sıfırlanıyor');
        window.activeExerciseComponent = null;
      }
      
      // Make this component accessible globally
      console.log('PictureMatchExercise - yeni activeExerciseComponent oluşturuluyor');
      window.activeExerciseComponent = {
        checkAnswer,
        isCorrect,
        getCorrectAnswerText,
        onContinue,
        renderResultContent: getResultContent
      };
      console.log('PictureMatchExercise - activeExerciseComponent:', window.activeExerciseComponent);
    });
    
    // Update check button when selection changes
    watch(selected, val => { 
      if (window.mainLayout) {
        window.mainLayout.canCheck.value = val !== null;
      }
    });
    
    return {
      title, 
      audioWord, 
      options, 
      selected, 
      correctIndex, 
      isCorrect, 
      showResult, 
      checkAnswer, 
      selectOption,
      getCorrectAnswerText,
      reset, 
      onContinue,
      getResultContent
    };
  }
}
</script>

<style scoped>
.option-card {
  cursor: pointer;
  transition: all 0.2s ease;
  background-color: #2a2a2a;
  color: white;
  border: 2px solid transparent;
}

.option-card:hover:not(.selected) {
  border-color: #4b4b4b;
  transform: translateY(-2px);
}

.option-card.selected {
  border-color: #58a700;
  background-color: #1d3b05;
}

.option-card.correct {
  border-color: #58a700;
  background-color: #1d3b05;
}

.option-card.incorrect {
  border-color: #ea2b2b;
  background-color: #3b1515;
}

.audio-button {
  display: inline-block;
  cursor: pointer;
  transition: all 0.2s ease;
}

.audio-button:hover {
  transform: scale(1.05);
}

.audio-container {
  margin-top: 10px;
  margin-bottom: 20px;
}
</style>
