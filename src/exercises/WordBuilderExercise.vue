<template>
  <div class="exercise-component">
    <div class="words">
      <div ref="destination" class="destination"></div>
      <div ref="origin" class="origin">
        <div v-for="(word, i) in processedWords" :key="i" class="word-container" :data-word-index="i">
          <Word 
            :text="word" 
            :index="i" 
            :initial-location="'origin'"
            @word-click="handleWordClick"
            @animation-start="wordBuilder.startAnimation"
            @animation-end="wordBuilder.endAnimation"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, watch, computed } from 'vue';
import Word from '../components/words/Word.vue';

export default {
  name: 'WordBuilderExercise',
  components: { Word },
  props: {
    exerciseData: {
      type: Object,
      default: () => ({})
    }
  },
  setup(props) {
    const wordBuilder = window.useWordBuilder({ exerciseData: props.exerciseData });
    const destination = ref(null);
    const origin = ref(null);
    
    // Process words to ensure they're strings
    const processedWords = computed(() => {
      const rawWords = wordBuilder.wordList.value || [];
      return rawWords.map(word => String(word));
    });
    
    // Handle word click
    const handleWordClick = ({ element, location, index }) => {
      if (wordBuilder.isAnimating.value) return;
      
      location === 'origin' 
        ? moveWord(element, index, 'origin', 'destination')
        : moveWord(element, index, 'destination', 'origin');
    };

    // Unified move word function
    const moveWord = (wordElement, index, fromLocation, toLocation) => {
      // Get container
      const container = fromLocation === 'origin'
        ? wordElement.closest('.word-container')
        : origin.value.querySelector(`.word-container[data-word-index="${index}"]`);
      
      if (!container) return;
      
      // Set up animation
      const id = Date.now();
      
      if (fromLocation === 'origin') {
        container.dataset.id = id;
        
        // Preserve space in origin
        container.style.height = `${wordElement.offsetHeight}px`;
        container.style.width = `${wordElement.offsetWidth}px`;
      }
      
      // Find siblings if moving from destination
      const siblings = fromLocation === 'destination'
        ? Array.from(destination.value.querySelectorAll('.word')).filter(w => w !== wordElement)
        : [];
      
      // Capture initial positions
      const first = wordElement.getBoundingClientRect();
      siblings.forEach(sib => sib.__first = sib.getBoundingClientRect());
      
      // Move element
      const targetContainer = toLocation === 'destination' ? destination.value : container;
      targetContainer.appendChild(wordElement);
      
      // Get final positions
      const last = wordElement.getBoundingClientRect();
      siblings.forEach(sib => sib.__last = sib.getBoundingClientRect());
      
      // Update word state
      wordElement.__component?.setLocation(toLocation);
      
      // Update logic state
      wordBuilder.moveWord(index, toLocation);
      
      // Run animations
      wordElement.__component?.performFlip({ first, last });
      siblings.forEach(sib => {
        sib.__component?.performFlip({ first: sib.__first, last: sib.__last });
      });
      
      // Clean up if moving to origin
      if (toLocation === 'origin') {
        setTimeout(() => {
          container.style.height = "";
          container.style.width = "";
          container.removeAttribute("data-id");
        }, 300);
      }
    };

    // Check answer
    const checkAnswer = () => {
      const result = wordBuilder.checkAnswer();
      
      destination.value.querySelectorAll('.word').forEach(word => {
        word.__component?.setFeedback(result.isCorrect);
      });
      
      return result;
    };
    
    // Reset after checking
    const onContinue = () => {
      document.querySelectorAll('.word').forEach(word => {
        word.__component?.resetFeedback();
      });
      
      wordBuilder.reset();
      
      if (destination.value) {
        destination.value.innerHTML = '';
      }
    };

    // Initialize
    onMounted(() => {
      wordBuilder.init();
      
      // Register with global systems
      window.activeExerciseComponent = {
        checkAnswer,
        onContinue,
        canCheck: ref(false),
        renderResultContent: () => null
      };
      
      if (window.mainLayout) {
        window.mainLayout.activeExerciseComponent = window.activeExerciseComponent;
      }
    });

    // Handle exercise data changes
    watch(() => props.exerciseData, (newData, oldData) => {
      if (newData !== oldData) {
        wordBuilder.init();
        if (destination.value) {
          destination.value.innerHTML = '';
        }
      }
    }, { deep: true });

    return {
      processedWords,
      destination,
      origin,
      wordBuilder,
      handleWordClick
    };
  }
}
</script>

<style>
@import url("https://fonts.googleapis.com/css2?family=Open+Sans:wght@300;400;700&display=swap");

.exercise-component {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 0 1rem;
  width: 100%;
}

.words {
  display: flex;
  flex-direction: column;
  padding: 2rem;
  border: 1px solid #596265;
  border-radius: 1rem;
  width: 350px;
  max-width: 100%;
}

.destination {
  display: flex;
  flex-flow: row wrap;
  align-items: flex-start;
  align-content: flex-start;
  margin: 0 0 4rem;
  min-height: 100px;
  background: repeating-linear-gradient(
    to bottom,
    transparent 0,
    transparent 44px,
    #263032 44px,
    #263032 45px,
    transparent 45px,
    transparent 48px
  );
}

.origin {
  display: flex;
  flex-flow: row wrap;
  justify-content: center;
  align-items: flex-start;
  max-width: 275px;
  margin: 0 auto;
}

.word-container {
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  margin: 0 0.125rem 0.25rem;
  border-radius: 0.5rem;
  background: #596265;
  box-sizing: content-box;
  padding-bottom: 0.125rem;
  transition: 0.25s ease;
}

.word-container:empty {
  background: #263032;
}
</style>