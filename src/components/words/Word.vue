<template>
  <button 
    :id="`word-${index}`" 
    class="word"
    :class="{
      'word-correct': isCorrect,
      'word-incorrect': isIncorrect,
      'word-destination': location === 'destination',
      'word-origin': location === 'origin'
    }"
    @click="handleClick"
    ref="wordRef"
    :data-index="index"
  >
    {{ text }}
  </button>
</template>

<script>
import { ref, onMounted } from 'vue';

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
    const wordRef = ref(null);

    const handleClick = () => {
      emit('word-click', {
        element: wordRef.value,
        index: props.index,
        location: location.value,
        text: props.text
      });
    };

    onMounted(() => {
      if (wordRef.value) {
        wordRef.value.__component = {
          setLocation: (newLocation) => location.value = newLocation,
          resetFeedback: () => { isCorrect.value = false; isIncorrect.value = false; },
          setFeedback: (correct) => { isCorrect.value = correct; isIncorrect.value = !correct; },
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
  background-color: #57b894 !important;
  color: white !important;
  border-color: #57b894 !important;
}

.word-incorrect {
  background-color: #e86f6f !important;
  color: white !important;
  border-color: #e86f6f !important;
}
</style>