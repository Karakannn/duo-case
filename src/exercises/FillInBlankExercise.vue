<template>
  <div class="exercise-component">
    <div class="sentence-container">
      <div class="sentence-display">
        <span v-for="(part, index) in sentenceParts" :key="index">
          <span v-if="part.type === 'text'">{{ part.content }}</span>
          <span v-else-if="part.type === 'blank'" :ref="setBlankRef" class="blank-space destination blank-area">
          </span>
        </span>
      </div>
    </div>

    <div class="options-container">
      <div class="options-list d-flex flex-wrap justify-content-center gap-2 origin">
        <div v-for="(option, index) in options" :key="index" class="word-container">
          <FillWord :text="option" :index="index" :blankElementRef="blankRef" :ref="el => wordRefs[index] = el"
            @word-selected="handleWordSelection" @animation-start="animationStarted" @animation-end="animationEnded" />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  components: {
    Button: Vue.defineAsyncComponent(() => window["vue3-sfc-loader"].loadModule("./src/components/common/Button.vue", window.sfcOptions)),
    FillWord: Vue.defineAsyncComponent(() => window["vue3-sfc-loader"].loadModule("./src/components/words/FillWord.vue", window.sfcOptions))
  },
  props: {
    exerciseData: {
      type: Object,
      default: () => ({})
    }
  },
  setup(props) {
    const { onMounted, ref, reactive, computed } = Vue;

    // Boşluk doldurma egzersiz composable'ını kullan
    const exercise = window.useFillInBlank(props);

    // Blank element reference
    const blankRef = ref(null);
    const selectedWord = ref(null);
    const isAnimating = ref(false);
    const display = ref({});

    // Store references to all word components
    const wordRefs = reactive({});
    const currentWordIndex = ref(null);

    // Function to set the blank space ref
    const setBlankRef = (el) => {
      if (el) {
        blankRef.value = el;
      }
    };

    // Handle any word selection
    const handleWordSelection = async (data) => {
      if (isAnimating.value) return;

      // Kullanıcı zaten hedefte olan (blank alanda) bir kelimeye tıkladı
      if (data.location === 'destination') {
        console.log('Destination word clicked', data.index);
        if (currentWordIndex.value === data.index) {
          // Kelimeyi geri dön
          wordRefs[data.index].moveToOrigin();

          // Seçimi temizle
          selectedWord.value = null;
          currentWordIndex.value = null;

          // Egzersizi güncelle
          exercise.selectOption(null);
        }
      }
      // Kullanıcı orijinal konumundaki bir kelimeye tıkladı
      else if (data.location === 'origin') {
        console.log('Origin word clicked', data.index);

        // Eğer blank alanda zaten bir kelime varsa
        if (currentWordIndex.value !== null) {
          // Sadece farklı bir kelime ise devam et
          if (currentWordIndex.value !== data.index) {
            console.log('Resetting current word', currentWordIndex.value);

            // Animasyonları eş zamanlı başlat (önce önceki kelimenin geri dönmesini beklemeden)
            // Mevcut kelimeyi orijinal konumuna gönder
            wordRefs[currentWordIndex.value].moveToOrigin();

            // Hemen yeni kelimeyi ayarla (beklemeden)
            selectedWord.value = data.text;
            currentWordIndex.value = data.index;

            // Yeni kelimeyi blank alana taşı (eş zamanlı)
            wordRefs[data.index].moveToDestination();

            // Egzersizi güncelle
            exercise.selectOption(data.text);
          }
        } else {
          console.log('Setting first word', data.index);

          // Blank alanda kelime yoksa, bu kelimeyi ayarla
          selectedWord.value = data.text;
          currentWordIndex.value = data.index;

          // Kelimeyi blank alana taşı
          wordRefs[data.index].moveToDestination();

          // Egzersizi güncelle
          exercise.selectOption(data.text);
        }
      }
    };

    const selectOption = (data) => {
      // Bu artık handleWordSelection için bir proxy
      handleWordSelection(data);
    };

    const animationStarted = () => {
      console.log('Animation started');
      isAnimating.value = true;
    };

    const animationEnded = (data) => {
      console.log('Animation ended', data.location);
      isAnimating.value = false;
    };

    // Load exercise data
    const loadExerciseData = () => {
      // Egzersiz verilerini al
      const { exerciseData } = props;
      if (exerciseData && exerciseData.question) {
        const { question } = exerciseData;

        // Display verilerini ayarla
        display.value = exerciseData.display || {};
      }
    };

    // Component mounted
    onMounted(() => {
      loadExerciseData();

      // Başlangıç kurulumu 
      console.log('FillInBlankExercise - onMounted - Starting initialization');
      exercise.init();

      // Blank alanını temizle
      if (blankRef.value) {
        // Blank alanındaki tüm çocuk elementleri temizle
        while (blankRef.value.firstChild) {
          blankRef.value.removeChild(blankRef.value.firstChild);
        }
      }

      // Global API'yi ayarla
      window.activeExerciseComponent = {
        checkAnswer: () => {
          const result = exercise.checkAnswer();
          return result;
        },
        onContinue: exercise.onContinue,
        renderResultContent: exercise.renderResultContent
      };
    });

    return {
      ...exercise,
      blankRef,
      wordRefs,
      setBlankRef,
      handleWordSelection,
      animationStarted,
      animationEnded,
      display
    };
  }
}
</script>

<style scoped>
.sentence-container {
  margin-bottom: 2rem;
}

.sentence-display {
  display: flex;
  color: white;
}

.category {
  color: var(--color-beetle);
  font-weight: 700;
  font-size: 19px;
}

.title-container {
  display: flex;
  flex-direction: column;
  align-items: start;
  gap: 8px;
}

.title-container h5 {
  font-size: 32px;
  font-weight: 700;
  color: var(--color-hare);
}

.blank-space {
  display: inline-block;
  min-width: 120px;
  min-height: 36px;
  padding: 0 8px;
  border-bottom: 2px solid #58cc02;
  font-weight: bold;
  color: #58cc02;
  text-align: center;
  vertical-align: bottom;
  padding-bottom: 2px;
}

.options-container {
  max-width: 600px;
  margin: 0 auto;
}

.options-list {
  width: 100%;
}

.destination {
  display: flex;
  align-items: center;
  justify-content: center;
}

.origin {
  display: flex;
  flex-flow: row wrap;
  justify-content: center;
}

.word-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  transition: 0.25s ease;
  min-height: 50px;
  min-width: 50px;
  z-index: 1;
  position: relative;
  background: rgba(240, 240, 240, 0.5);
  border-radius: 12px;
  padding: 4px;
}

.word-container:empty {}

.blank-area {
  min-height: 60px;
  min-width: 120px;
  border-bottom: 2px solid #ccc;
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 0 20px;
  z-index: 5;
  position: relative;
  padding-bottom: 2px;
}
</style>
