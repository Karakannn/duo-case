// Modified Word component with Mexican wave animation

<template>
  <button 
    :id="`word-${index}`" 
    class="word"
    :class="{
      'word-correct': isCorrect,
      'word-incorrect': isIncorrect,
      'word-destination': location === 'destination',
      'word-origin': location === 'origin',
      'wave-animation': isWaving
    }"
    @click="handleClick"
    ref="wordRef"
    :data-index="index"
  >
    {{ text }}
  </button>
</template>

<script>
import { ref, onMounted, watch } from 'vue';

export default {
  name: 'Word',
  props: {
    text: { type: String, required: true },
    index: { type: Number, required: true },
    initialLocation: { type: String, default: 'origin' }
  },
  emits: ['word-click', 'animation-start', 'animation-end'],
  setup(props, { emit }) {
    const location = ref(props.initialLocation);
    const isCorrect = ref(false);
    const isIncorrect = ref(false);
    const isWaving = ref(false);
    const wordRef = ref(null);

    const handleClick = () => {
      emit('word-click', {
        element: wordRef.value,
        index: props.index,
        location: location.value,
        text: props.text
      });
    };

    // Function to trigger the Mexican wave animation
    const startWaveAnimation = (isCorrectAnswer) => {
      if (!wordRef.value) return;
      
      // Set feedback state
      isCorrect.value = isCorrectAnswer;
      isIncorrect.value = !isCorrectAnswer;
      
      // Calculate delay based on word index for the wave effect
      const delay = props.index * 100; // 100ms between each word
      
      // Start wave animation with delay
      setTimeout(() => {
        isWaving.value = true;
        
        // Reset wave animation after it completes
        setTimeout(() => {
          isWaving.value = false;
        }, 500); // Animation duration
      }, delay);
    };

    onMounted(() => {
      if (wordRef.value) {
        wordRef.value.__component = {
          setLocation: (newLocation) => location.value = newLocation,
          resetFeedback: () => { 
            isCorrect.value = false; 
            isIncorrect.value = false; 
            isWaving.value = false;
          },
          setFeedback: (correct) => {
            startWaveAnimation(correct);
          },
          performFlip: ({ first, last }) => {
            if (!wordRef.value) return;
            
            emit('animation-start', { index: props.index });
            
            const animation = wordRef.value.animate(
              [
                { transform: `translate(${first.left - last.left}px, ${first.top - last.top}px)` },
                { transform: 'translate(0, 0)' }
              ],
              { duration: 300, easing: 'ease' }
            );
            
            animation.onfinish = () => emit('animation-end', { index: props.index });
            return animation;
          }
        };
      }
    });

    return {
      location,
      isCorrect,
      isIncorrect,
      isWaving,
      wordRef,
      handleClick
    };
  }
}
</script>

<style scoped>
.word {
  appearance: none;
  all: unset;
  box-sizing: border-box;
  background: #122023;
  border: 1px solid #596265;
  padding: 0.5rem;
  border-radius: 0.5rem;
  cursor: pointer;
  font-weight: 700;
  user-select: none;
  color: #fff;
  font-size: 16px;
}

.word:active,
.word:focus {
  background: #1a2f33;
}

.word-destination {
  margin: 0 0.125rem 0.5rem;
}

.word-origin {
  transition: transform 0.25s ease;
}

.word-correct {
  color: var(--internal-color-success) !important;
  background-color: var(--internal-background-color-success);
  border: 2px solid var(--internal-border-success);
}

.word-incorrect {
  border: 2px solid var(--internal-border-error, #e86f6f);
  color: var(--internal-color-error, #e86f6f) !important;
}

/* Mexican Wave Animation */
@keyframes mexicanWave {
  0% {
    transform: translateY(0);
  }
  25% {
    transform: translateY(-10px);
  }
  50% {
    transform: translateY(0);
  }
  75% {
    transform: translateY(5px);
  }
  100% {
    transform: translateY(0);
  }
}

.wave-animation {
  animation: mexicanWave 0.5s ease;
}

@media (min-width: 700px) {
  .word {
    font-size: 19px;
  }
}
</style>