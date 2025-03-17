<template>
  <div class="exercise-component">
    <div class="wrapper">
      <h1 class="exercise-title">{{ title }}</h1>

      <!-- English sentence to translate -->
      <div class="english-sentence">
        {{ englishSentence }}
      </div>

      <div class="top-container">
        <div class="character-container">
          <div class="speech-bubble-container">
            <div class="speech-bubble">
              <span class="word-text">{{ word }}</span>
            </div>
            <svg class="speech-icon" height="20" viewBox="0 0 18 20">
              <path class="speech-icon-path"
                d="M2.00358 19.0909H18V0.909058L0.624575 15.9561C-0.682507 17.088 0.198558 19.0909 2.00358 19.0909Z">
              </path>
              <path class="speech-icon-path" clip-rule="evenodd"
                d="M18 2.48935V0L0.83037 15.6255C-0.943477 17.2398 0.312833 20 2.82143 20H18V18.2916H16.1228H2.82143C1.98523 18.2916 1.56646 17.3716 2.15774 16.8335L16.1228 4.12436L18 2.48935Z"
                fill-rule="evenodd"></path>
            </svg>
          </div>
        </div>
      </div>

      <div class="bottom-container">
        <div ref="destinationContainer" class="destination-container">
        </div>
        <div ref="originContainer" class="origin-container">
          <Word v-for="(word, index) in wordList" :key="index" :index="index" :text="word"
            :destination-container-ref="destinationContainer" :initial-location="getInitialLocation(index)"
            @click="handleWordClick" @word-positioned="handleWordPositioned" @location-change="handleLocationChange"
            @animation-start="handleAnimationStart" @animation-end="handleAnimationEnd" ref="wordComponents" />
        </div>
      </div>
    </div>

  </div>
</template>

<script>
// Use global Vue
const { ref, reactive, computed, onMounted, watch, nextTick } = Vue;

export default {
  name: 'WordBuilderExercise',
  components: {
    Word: Vue.defineAsyncComponent(() =>
      window["vue3-sfc-loader"].loadModule(
        '/src/components/words/Word.vue',
        window.sfcOptions
      )
    )
  },
  setup() {
    // Container references
    const destinationContainer = ref(null);
    const originContainer = ref(null);
    const wordComponents = ref([]);

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
        const component = wordComponents.value ?
          wordComponents.value.find(c => c.index === nextIndex) : null;

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
            const component = wordComponents.value ?
              wordComponents.value.find(c => c.index === index) : null;

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
}

.origin-container {
  width: 100%;
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
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
</style>
