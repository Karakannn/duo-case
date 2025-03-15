<template>
  <div class="exercise-component">
    <div class="wrapper">
      <h1 class="title">Write this in Spanish</h1>
      <div class="top-container">
        <div class="text-container">
          <p class="original-text">
            <span class="text-span" v-for="(word, index) in englishSentence" :key="index">{{ word }}</span>
          </p>
        </div>
        <div ref="destinationContainer" class="destination-container">
          <!-- Words will be positioned here via transform -->
        </div>
      </div>
      <div ref="originContainer" class="origin-container">
        <Word 
          v-for="(word, index) in wordList" 
          :key="index" 
          :text="word" 
          :index="index"
          :destination-container-ref="destinationContainer"
          :word-positions="wordPositionsArray"
          :initial-location="getInitialLocation(index)"
          @click="handleWordClick"
          @location-change="handleLocationChange"
          @word-positioned="handleWordPositioned"
          ref="wordComponents"
        />
      </div>
    </div>
    <!-- Footer is provided by MainLayout -->
  </div>
</template>

<script>
import Word from '../components/words/Word.vue';

export default {
  name: 'WordBuilderExercise',
  components: {
    Word
  },
  emits: ['complete'],
  setup(props, { emit }) {
    const { ref, reactive, computed, onMounted, watch, nextTick } = Vue;

    // State
    const title = ref("Write this in Spanish");
    const isCorrect = ref(false);
    const showResult = ref(false);
    const currentExercise = ref(null);
    const wordList = ref([]);
    const englishSentence = ref([]);
    const destinationContainer = ref(null);
    const originContainer = ref(null);
    const wordComponents = ref([]);
    const wordPositionsArray = reactive([]);
    const destinationWords = reactive([]);
    const exerciseInitialized = ref(false);

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
    const userAnswer = computed(() => {
      const wordsInDestination = wordPositionsArray
        .filter(w => w && w.location === 'destination')
        .sort((a, b) => a.position.x - b.position.x);
      
      console.log('Computing userAnswer, words in destination:', wordsInDestination);
      return wordsInDestination.map(w => w.word).join(' ');
    });

    // Helper function to get word location
    const getInitialLocation = (index) => {
      if (!exerciseInitialized.value) return 'origin';
      const inDestination = destinationWords.findIndex(w => w.index === index) !== -1;
      console.log(`getInitialLocation for index ${index}: ${inDestination ? 'destination' : 'origin'}`);
      return inDestination ? 'destination' : 'origin';
    };
    
    // Watch for destination words changes to update MainLayout canCheck state
    watch(destinationWords, (newArray) => {
      console.log('destinationWords changed:', newArray);
      if (window.mainLayout) {
        window.mainLayout.canCheck.value = newArray.length > 0;
      }
    });

    // Select random exercise and prepare words
    const initializeExercise = () => {
      try {
        console.log('Initializing exercise');
        exerciseInitialized.value = false;
        
        // Reset arrays and select exercise
        destinationWords.length = 0;
        wordPositionsArray.length = 0;
        
        currentExercise.value = exercises[Math.floor(Math.random() * exercises.length)];
        englishSentence.value = currentExercise.value.english.split(" ");
        wordList.value = [...currentExercise.value.list];
        
        console.log('Exercise initialized with wordList:', wordList.value);
        
        // Need to wait for DOM update before marking as initialized
        nextTick(() => {
          console.log('Exercise fully initialized');
          exerciseInitialized.value = true;
        });
      } catch (error) {
        console.error("Error initializing exercise:", error);
      }
    };

    // Handle word positioning events from Word components
    const handleWordPositioned = (wordData) => {
      const { index, position, location, word } = wordData;
      console.log(`Word ${index} positioned at ${location}:`, position);
      
      // Update position in our tracking array
      wordPositionsArray[index] = {
        index,
        position,
        location,
        word
      };
    };

    // Handle word click events
    const handleWordClick = (wordData) => {
      const { index, location } = wordData;
      console.log(`Word ${index} clicked, location: ${location}`);
      // All logic is now in the Word component
    };

    // Handle location changes from Word component
    const handleLocationChange = (wordData) => {
      const { index, location, position } = wordData;
      console.log(`Word ${index} location changed to ${location}`);
      
      // Update our tracking of destination words
      if (location === 'destination') {
        // Add to destination if not already there
        if (destinationWords.findIndex(w => w.index === index) === -1) {
          console.log(`Adding word ${index} to destination`);
          destinationWords.push({ 
            index,
            word: wordList.value[index],
            position
          });
        }
      } else {
        // Remove from destination
        const idx = destinationWords.findIndex(w => w.index === index);
        if (idx !== -1) {
          console.log(`Removing word ${index} from destination`);
          destinationWords.splice(idx, 1);
        }
      }
      
      // Update word position in our tracking array
      if (wordPositionsArray[index]) {
        wordPositionsArray[index].location = location;
      }
    };

    // Check if answer is correct
    const checkAnswer = () => {
      if (destinationWords.length === 0) return false;

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
    });

    return {
      title,
      wordList,
      englishSentence,
      destinationContainer,
      originContainer,
      wordComponents,
      wordPositionsArray,
      handleWordClick,
      handleLocationChange,
      handleWordPositioned,
      getInitialLocation,
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

/* Word styles moved to Word.vue component */
</style>
