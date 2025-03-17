<template>
  <div class="exercise-component">
    <div class="wrapper">
      <h1 class="exercise-title">{{ title }}</h1>

      <div class="top-container">
        <div class="character-container">
          <img src="https://kasratabrizi.github.io/duolingo-exercise-project/assets/duo.svg" class="character-image"
            alt="" srcset="">
          <div class="speech-bubble-container">
            <div class="speech-bubble">
              <div class="speech-icon">
                <svg width="32" height="32" viewBox="0 0 32 32">
                  <path class="speech-icon-path" d="M0 16 L16 0 L16 32 Z" />
                </svg>
              </div>
              <div class="word-text">{{ englishSentence }}</div>
            </div>
          </div>
        </div>
      </div>

      <div class="bottom-container">
        <div ref="destinationContainer" class="destination-container">
          <div ref="destinationInnerContainer" class="destination-inner-container"></div>
        </div>

        <div ref="originContainer" class="origin-container">
          <div ref="originInnerContainer" class="origin-inner-container">
            <div v-for="(word, index) in wordList" :key="index" :id="`word-container-${index}`" class="word-container">
              <div class="word-holder" :id="`word-holder-${index}`"></div>
              <div class="word-wrapper">
                <Word :ref="el => registerWordComponent(el)" :text="word" :index="index"
                  :initial-location="getInitialLocation(index)" :holder-id="`word-holder-${index}`"
                  :container-id="`word-container-${index}`" :destination-container-ref="destinationContainer"
                  :destination-inner-container-ref="destinationInnerContainer"
                  :origin-inner-container-ref="originInnerContainer" @click="handleWordClick"
                  @word-positioned="handleWordPositioned" @location-change="handleLocationChange"
                  @animation-start="handleAnimationStart" @animation-end="handleAnimationEnd" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, nextTick, watch } from 'vue';
import Word from '../components/words/Word.vue';

export default {
  name: 'WordBuilderExercise',
  components: {
    Word
  },
  props: {
    exerciseData: {
      type: Object,
      default: () => ({})
    }
  },
  setup(props) {
    // Initialize the word builder composable with props
    const wordBuilder = window.useWordBuilder({
      exerciseData: props.exerciseData
    });

    // Component state
    const wordComponents = ref([]);
    const selectedWords = ref([]);

    // References to DOM elements
    const destinationContainer = ref(null);
    const originContainer = ref(null);
    const destinationInnerContainer = ref(null);
    const originInnerContainer = ref(null);

    /**
     * Initialize or reset the exercise
     */
    const initializeExercise = () => {
      wordBuilder.init();
      selectedWords.value = [];

      nextTick(() => {
        wordComponents.value.forEach(comp => {
          if (comp && typeof comp.reset === 'function') {
            comp.reset();
          }
        });
      });
    };

    /**
     * Register a Word component instance
     */
    const registerWordComponent = (component) => {
      if (component && !wordComponents.value.includes(component)) {
        wordComponents.value.push(component);
      }
    };

    /**
     * Get words in the destination area sorted by position
     */
    const getOrderedDestinationWords = () => {
      const destinationWords = wordComponents.value
        .filter(comp => comp && comp.currentLocation === 'destination')
        .map(comp => ({
          word: comp.word,
          position: comp.position
        }));

      return destinationWords.sort((a, b) => a.position.x - b.position.x);
    };

    /**
     * Handle word click events
     */
    const handleWordClick = (wordData) => {
      const { index, location } = wordData;

      // Update selected words tracking
      if (location === 'destination') {
        if (!selectedWords.value.includes(index)) {
          selectedWords.value.push(index);
        }
      } else {
        const idx = selectedWords.value.indexOf(index);
        if (idx !== -1) {
          selectedWords.value.splice(idx, 1);
        }
      }

      // Update check button state
      updateCheckButtonState(selectedWords.value.length > 0);

      // Delegate to word builder composable
      return wordBuilder.handleWordClick(wordData);
    };

    /**
     * Update the check button state in the main layout
     */
    const updateCheckButtonState = (canCheck) => {
      if (window.mainLayout) {
        if (typeof window.mainLayout.canCheck === 'object' && window.mainLayout.canCheck.value !== undefined) {
          window.mainLayout.canCheck.value = canCheck;
        } else {
          window.mainLayout.canCheck = canCheck;
        }
      }
    };

    /**
     * Check the user's answer
     */
    const checkAnswer = () => {

      const orderedWords = getOrderedDestinationWords();
      const userAnswerByPosition = orderedWords.map(w => w.word).join(' ');
      const correctAnswer = wordBuilder.correctAnswer.value;
      const isCorrect = userAnswerByPosition.toLowerCase() === correctAnswer.toLowerCase();
      // Apply visual feedback
      nextTick(() => {
        const destinationWords = wordComponents.value.filter(comp =>
          comp && comp.currentLocation === 'destination');

        destinationWords.forEach(wordComp => {
          if (isCorrect) {
            wordComp.$el.classList.add('word-correct');
          } else {
            wordComp.$el.classList.add('word-incorrect');
          }
        });
      });

      return {
        isCorrect,
        userAnswer: userAnswerByPosition,
        correctAnswer
      };
    };

    /**
     * Handle continue action after answer check
     */
    const onContinue = () => {
      // Remove visual feedback classes
      wordComponents.value.forEach(comp => {
        if (comp && comp.$el) {
          comp.$el.classList.remove('word-correct', 'word-incorrect');
        }
      });

      // Reset exercise
      initializeExercise();
      updateCheckButtonState(false);
    };

    // Event handler delegation to word builder
    const handleWordPositioned = (wordData) => wordBuilder.handleWordPositioned(wordData);
    const handleLocationChange = (wordData) => wordBuilder.handleLocationChange(wordData, destinationInnerContainer);
    const handleAnimationStart = (wordData) => wordBuilder.handleAnimationStart(wordData);
    const handleAnimationEnd = (wordData) => wordBuilder.handleAnimationEnd(wordData);

    // Initialize on component mount
    onMounted(() => {
      initializeExercise();

      // Register with global exercise component
      window.activeExerciseComponent = {
        checkAnswer,
        onContinue,
        renderResultContent: () => null
      };

      // Initialize check button state
      updateCheckButtonState(false);

      // Watch for changes in selected words to update check button
      watch(() => selectedWords.value.length, (newCount) => {
        updateCheckButtonState(newCount > 0);
      });
    });

    return {
      // State
      title: wordBuilder.title,
      word: wordBuilder.word,
      englishSentence: wordBuilder.english,
      wordList: wordBuilder.wordList,

      // DOM refs
      destinationContainer,
      originContainer,
      destinationInnerContainer,
      originInnerContainer,

      // Word component registration
      wordComponents,
      registerWordComponent,

      // Word builder methods
      getInitialLocation: wordBuilder.getInitialLocation,

      // Event handlers
      handleWordClick,
      handleWordPositioned,
      handleLocationChange,
      handleAnimationStart,
      handleAnimationEnd,

      // Exercise control
      checkAnswer,
      initializeExercise
    };
  }
}
</script>

<style>
.exercise-component {
  position: relative;
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
}

.wrapper {
  width: 100%;
  max-width: 600px;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
  margin-bottom: 5em;
}

.exercise-title {
  font-size: 32px;
  line-height: 1.25;
  margin: 0;
  text-align: left;
  width: 100%;
  color: rgb(241, 247, 251);
  font-weight: 700;
}

.top-container {
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
}

.character-container {
  display: flex;
  justify-content: start;
  align-items: center;
  gap: 32px;
  position: relative;
  margin: 20px 0 30px;
  width: 100%;
}

.character-image {
  width: 150px;
  object-fit: cover;
}

.speech-bubble-container {
  position: relative;
}

.speech-bubble {
  background: var(--color-snow);
  border: 2px solid var(--color-swan);
  border-radius: 12px;
  color: var(--color-eel);
  font-size: 1.25rem;
  font-weight: 500;
  line-height: 2rem;
  padding: 10px 14px;
}

.speech-icon {
  position: absolute;
  left: -16px;
  top: 50%;
  transform: translateY(-50%);
  top: 32px;
  color: var(--color-eel);
}

.speech-icon-path {
  fill: var(--color-snow);
  stroke: var(--color-swan);
}

.word-text {
  font-size: 1.25rem;
  font-weight: 500;
  line-height: 2rem;
}

.bottom-container {
  width: 100%;
  border-top: 3px solid var(--color-swan);
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
  row-gap: 32px;
}

.destination-container {
  border-bottom: 3px solid var(--color-swan);
  width: 100%;
  height: 60px;
  position: relative;
}

.destination-inner-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
}

.origin-container {
  width: 100%;
  position: relative;
  min-height: 120px;
}

.origin-inner-container {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
  gap: 4px;
  padding: 15px 0;
}

.check-button {
  width: 100%;
  margin-top: 1em;
  padding: 0.5em;
  background-color: var(--primary-color);
  color: white;
  border: none;
  border-radius: var(--border-radius);
  font-size: 1.2em;
  cursor: pointer;
  transition: background-color 0.3s;
}

.check-button:hover {
  background-color: var(--primary-color-dark);
}

.check-button:disabled {
  background-color: var(--grey-color);
  cursor: not-allowed;
}

.result-container {
  width: 100%;
  margin-top: 1em;
  padding: 1em;
  border-radius: var(--border-radius);
  text-align: center;
}

.correct {
  background-color: var(--success-color-light);
  color: var(--success-color-dark);
}

.incorrect {
  background-color: var(--error-color-light);
  color: var(--error-color-dark);
}

.english-sentence {
  font-size: 1.25rem;
  font-weight: 500;
  line-height: 2rem;
  margin: 1em 0;
}

.word-container {
  position: relative;
  display: inline-block;
  margin: 0 2px;
  padding: 0;
}

.word-wrapper {
  position: absolute;
  top: 0;
  left: 0;
  z-index: 1;
}

.word-holder {
  position: absolute;
  top: 0;
  left: 0;
  border: 2px dashed #ccc;
  border-radius: var(--border-radius);
  background-color: transparent;
  z-index: 0;
}

.word-container.destination .word {
  background-color: var(--color-swan);
  color: var(--color-hare);
}

/* Correct and incorrect answer styling */
.word-correct {
  background-color: var(--color-correct) !important;
  color: white !important;
  border-color: var(--color-correct) !important;
  transition: all 0.3s ease;
}

.word-incorrect {
  background-color: var(--color-incorrect) !important;
  color: white !important;
  border-color: var(--color-incorrect) !important;
  transition: all 0.3s ease;
}
</style>
