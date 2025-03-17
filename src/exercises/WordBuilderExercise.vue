<template>
  <div class="exercise-component">
    <div class="wrapper">
      <h1 class="exercise-title">{{ title }}</h1>
      
      <div class="top-container">
        <div class="character-container">
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
        <div 
          ref="destinationContainer" 
          class="destination-container"
        >
          <div 
            ref="destinationInnerContainer" 
            class="destination-inner-container"
          ></div>
        </div>
        
        <div 
          ref="originContainer" 
          class="origin-container"
        >
          <div 
            ref="originInnerContainer" 
            class="origin-inner-container"
          >
            <div 
              v-for="(word, index) in wordList" 
              :key="index" 
              :id="`word-container-${index}`" 
              class="word-container"
            >
              <div class="word-holder" :id="`word-holder-${index}`"></div>
              <div class="word-wrapper">
                <Word 
                  :ref="el => { if (el) wordComponents[index] = el }"
                  :text="word" 
                  :index="index" 
                  :initial-location="getInitialLocation(index)" 
                  :holder-id="`word-holder-${index}`" 
                  :container-id="`word-container-${index}`" 
                  :destination-container-ref="destinationContainer" 
                  :destination-inner-container-ref="destinationInnerContainer" 
                  :origin-inner-container-ref="originInnerContainer"
                  @click="handleWordClick" 
                  @word-positioned="handleWordPositioned" 
                  @location-change="handleLocationChange" 
                  @animation-start="handleAnimationStart" 
                  @animation-end="handleAnimationEnd" 
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, nextTick } from 'vue';
import Word from '../components/words/Word.vue';

export default {
  name: 'WordBuilderExercise',
  components: {
    Word
  },
  setup() {
    const destinationContainer = ref(null);
    const originContainer = ref(null);
    const wordComponents = ref([]);
    const destinationInnerContainer = ref(null);
    const originInnerContainer = ref(null);

    // Use the enhanced wordBuilder composable
    const wordBuilder = window.useWordBuilder({});

    // Initialize the exercise
    const initializeExercise = () => {
      wordBuilder.init();
    };

    // Handle word click
    const handleWordClick = (wordData) => {
      const result = wordBuilder.handleWordClick(wordData);
      if (result) {
        const { nextIndex, onAnimationComplete } = result;

        // Find the word component by index and trigger animation
        const component = wordComponents.value[nextIndex];
        
        if (component) {
          component.processQueuedClick(onAnimationComplete);
        }
      }
    };

    // Handle word positioned
    const handleWordPositioned = (wordData) => {
      wordBuilder.handleWordPositioned(wordData);
    };

    // Handle location change
    const handleLocationChange = (wordData) => {
      const repositionResult = wordBuilder.handleLocationChange(wordData, destinationContainer);

      // If we have a repositioning result, update the positions of words in UI
      if (repositionResult && Array.isArray(repositionResult)) {
        nextTick(() => {
          repositionResult.forEach(wordData => {
            const { index, position } = wordData;
            // Find the component by index
            const component = wordComponents.value[index];

            if (component && position) {
              // Update position directly on the component
              component.setPositionX(position.x);
            }
          });
        });
      }
    };

    // Handle animation start
    const handleAnimationStart = (wordData) => {
      wordBuilder.handleAnimationStart(wordData);
    };

    // Handle animation end
    const handleAnimationEnd = (wordData) => {
      wordBuilder.handleAnimationEnd(wordData);
    };

    // Initialize the exercise on component mount
    onMounted(() => {
      initializeExercise();

      // Initialize mainLayout for compatibility with other components
      if (window.mainLayout) {
        if (!window.mainLayout.canCheck) {
          window.mainLayout.canCheck = ref(false);
        }
        if (!window.mainLayout.showResult) {
          window.mainLayout.showResult = ref(false);
        }
      }
    });

    return {
      // Expose props from the wordBuilder composable
      title: wordBuilder.title,
      word: wordBuilder.word,
      englishSentence: wordBuilder.english,
      wordList: wordBuilder.wordList,

      // Container references
      destinationContainer,
      originContainer,
      wordComponents,
      destinationInnerContainer,
      originInnerContainer,

      // Expose methods from the wordBuilder composable
      getInitialLocation: wordBuilder.getInitialLocation,

      // Handlers
      handleWordClick,
      handleWordPositioned,
      handleLocationChange,
      handleAnimationStart,
      handleAnimationEnd,

      // Initialization
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
  align-items: flex-start;
  position: relative;
  margin: 20px 0 30px;
  width: 100%;
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
</style>
