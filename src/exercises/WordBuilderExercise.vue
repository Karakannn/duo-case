<template>
  <exercise-container :title="title">
    <div class="wrapper">
      <h1 class="title">Write this in Spanish</h1>
      <div class="top-container">
        <div class="text-container">
          <p class="original-text">
            <span class="text-span" v-for="(word, index) in englishSentence" :key="index">{{ word }}</span>
          </p>
        </div>
        <div ref="destinationContainer" class="destination-container"></div>
      </div>
      <div ref="originContainer" class="origin-container">
        <div v-for="(word, index) in wordList" :key="index" class="word" :style="wordStyles[index]"
          @click="handleWordClick(index)">
          {{ word }}
        </div>
      </div>
    </div>
    <!-- Footer is provided by MainLayout -->
  </exercise-container>
</template>

<script>
export default {
  name: 'WordBuilderExercise',
  components: {
    ExerciseContainer: Vue.defineAsyncComponent(() =>
      window["vue3-sfc-loader"].loadModule("./src/components/common/ExerciseContainer.vue", window.sfcOptions)
    )
  },
  emits: ['complete'],
  setup(props, { emit }) {
    const { ref, reactive, computed, onMounted, watch } = Vue;

    // State
    const title = ref("Write this in Spanish");
    const isCorrect = ref(false);
    const showResult = ref(false);
    const currentExercise = ref(null);
    const wordList = ref([]);
    const englishSentence = ref([]);
    const destinationContainer = ref(null);
    const originContainer = ref(null);
    const destinationPosDefault = ref(null);
    const originArray = reactive([]);
    const destinationArray = reactive([]);
    const wordStyles = reactive({});

    // Sample exercises
    const exercises = [
      {
        english: "I eat an apple",
        spanish: "Yo como una manzana",
        list: ["manazana", "comes", "Yo", "una", "como", "naranja"],
      },
      {
        english: "This is my wife",
        spanish: "Este es mi esposa",
        list: ["Este", "esta", "esposa", "es", "mi", "hermana"],
      },
      {
        english: "My favorite sport is hockey",
        spanish: "Mi deporte favorito es hockey",
        list: ["deporte", "favorito", "hockey", "Mi", "es", "Tu"],
      },
    ];

    // Computed properties
    const correctAnswer = computed(() => currentExercise.value?.spanish || '');
    const userAnswer = computed(() => destinationArray.map(w => w.word).join(' '));

    // Watch for destination array changes to update MainLayout canCheck state
    watch(destinationArray, (newArray) => {
      if (window.mainLayout) {
        window.mainLayout.canCheck.value = newArray.length > 0;
      }
    });

    // Select random exercise and prepare words
    const initializeExercise = () => {
      try {
        // Reset arrays and select exercise
        destinationArray.length = 0;
        originArray.length = 0;
        currentExercise.value = exercises[Math.floor(Math.random() * exercises.length)];
        englishSentence.value = currentExercise.value.english.split(" ");
        wordList.value = [...currentExercise.value.list];

        // Get container position and initialize styles
        if (destinationContainer.value) {
          destinationPosDefault.value = destinationContainer.value.getBoundingClientRect();
        }

        // Reset word styling
        wordList.value.forEach((_, i) => wordStyles[i] = { transform: 'translate(0px, 0px)' });

        // Update word positions after DOM render
        setTimeout(updateWordPositions, 50);
      } catch (error) {
        console.error("Error initializing exercise:", error);
      }
    };

    // Calculate word positions for movement
    const updateWordPositions = () => {
      const words = document.querySelectorAll('.word');
      if (!words.length) return;

      originArray.length = 0;
      words.forEach((word, i) => {
        const pos = word.getBoundingClientRect();
        originArray.push({
          x: pos.x, y: pos.y, width: pos.width, height: pos.height,
          word: wordList.value[i], location: "origin", index: i
        });
      });
    };

    // Calculate next word position in destination
    const getDestinationPosition = () => {
      if (destinationArray.length === 0) return destinationPosDefault.value.x;

      return destinationArray.reduce(
        (sum, el) => sum + el.width + 20,
        destinationPosDefault.value.x
      );
    };

    // Handle clicking on a word
    const handleWordClick = (index) => {
      if (!originArray[index]) return;

      const destPos = getDestinationPosition();
      const wordObj = originArray[index];

      // Calculate movement distance
      let yTravel = wordObj.y - (destinationPosDefault.value.y +
        (destinationPosDefault.value.height - wordObj.height) / 2);

      let xTravel = wordObj.x > destPos
        ? -(wordObj.x - destPos)
        : destPos - wordObj.x;

      // Move word between containers
      if (wordObj.location === "origin") {
        wordObj.location = "destination";
        destinationArray.push({ ...wordObj });
      } else {
        yTravel = 0;
        xTravel = 0;
        wordObj.location = "origin";

        const idx = destinationArray.findIndex(w => w.index === index);
        if (idx !== -1) destinationArray.splice(idx, 1);
      }

      // Apply transform and update UI state
      wordStyles[index] = { transform: `translate(${xTravel}px, -${yTravel}px)` };
    };

    // Check if answer is correct
    const checkAnswer = () => {
      if (destinationArray.length === 0) return false;

      isCorrect.value = userAnswer.value === correctAnswer.value;
      showResult.value = true;

      // Update global state
      const store = window.store || {};
      if (isCorrect.value && store.increaseScore) {
        store.increaseScore(15);
      } else if (!isCorrect.value && store.decreaseHearts) {
        store.decreaseHearts();
      }

      if (window.mainLayout) {
        window.mainLayout.showResult.value = true;
        window.mainLayout.isCorrect.value = isCorrect.value;
        window.mainLayout.correctAnswer.value = correctAnswer.value;
      }

      return isCorrect.value;
    };

    // Reset the exercise
    const reset = () => {
      isCorrect.value = false;
      showResult.value = false;

      if (window.mainLayout) {
        window.mainLayout.canCheck.value = false;
        window.mainLayout.showResult.value = false;
      }

      setTimeout(initializeExercise, 100);
    };

    // Skip/continue handlers
    const handleSkip = () => {
      reset();

      const store = window.store || {};
      if (store.nextStep) {
        store.nextStep();
      }
    };

    const onContinue = () => {
      if (isCorrect.value) {
        emit('complete');

        const store = window.store || {};
        if (store.nextStep) {
          store.nextStep();
        }
      } else {
        reset();
      }
    };

    // Initialize on mount
    onMounted(() => {
      // Make component accessible globally for step management
      window.activeExerciseComponent = {
        checkAnswer,
        isCorrect,
        getCorrectAnswerText: () => correctAnswer.value,
        onContinue
      };

      reset();

      // Handle window resize
      window.addEventListener('resize', () => {
        if (destinationContainer.value) {
          destinationPosDefault.value = destinationContainer.value.getBoundingClientRect();
        }
        updateWordPositions();
      });
    });

    return {
      title,
      wordList,
      englishSentence,
      wordStyles,
      destinationContainer,
      originContainer,
      handleWordClick,
      checkAnswer,
      handleSkip
    };
  }
}
</script>

<style>
:root {
  --grey-color: rgb(228, 228, 228);
  --darker-grey-color: rgb(189, 189, 189);
  --text-color: rgb(60, 60, 60);
  --border-radius: 15px;
}

.wrapper {
  height: 60vh;
  width: 50vw;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 5em;
}

.title {
  width: 100%;
  font-weight: 600;
  text-align: left;
  color: var(--text-color);
  font-size: 1.5em;
  margin-bottom: 0.5em;
}

.top-container {
  margin-top: 50px;
  width: 100%;
  height: 250px;
}

.text-container {
  display: flex;
  justify-content: flex-start;
  align-items: center;
}

.original-text {
  border: 2px solid var(--grey-color);
  padding: 1em;
  width: auto;
  border-radius: var(--border-radius);
  margin-left: 20px;
  font-size: 1.2em;
  background-color: white;
  color: var(--text-color);
}

.text-span {
  display: inline-block;
  border-bottom: 2px dashed var(--darker-grey-color);
  margin-right: 5px;
}

.destination-container {
  padding: 0.5em 0;
  height: 60px;
  width: 100%;
  border-top: 2px solid var(--grey-color);
  border-bottom: 2px solid var(--grey-color);
  display: flex;
  justify-content: flex-start;
  align-items: center;
  background-color: rgba(255, 255, 255, 0.1);
}

.origin-container {
  padding: 3em 0;
  width: 100%;
  display: flex;
  justify-content: flex-start;
  align-items: center;
  flex-wrap: wrap;
}

.word {
  position: relative;
  border: 1px solid var(--grey-color);
  background-color: white;
  margin: 0 0.2em;
  padding: 0.5em 1em;
  border-radius: var(--border-radius);
  box-shadow: 0px 3px 0px 0px var(--grey-color);
  transition: 0.2s transform ease-in-out;
  cursor: pointer;
  z-index: 1;
  font-size: 1.2em;
  font-weight: 400;
  color: var(--text-color);
}

.word:active {
  transform: translateY(2px);
  box-shadow: none;
}
</style>
