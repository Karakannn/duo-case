<template>
  <div class="d-flex flex-column align-items-start w-100" style="max-width: 600px;">
    <div class="words w-100 d-grid" style="grid-auto-rows: 1fr; gap: 24px;"
      :class="{ 'checked': wordBuilder.isChecked.value }">
      <div ref="destination" class="destination d-flex flex-row flex-wrap align-items-start align-content-start"></div>
      <div ref="origin" class="origin d-flex flex-row flex-wrap align-items-center justify-content-center">
        <div v-for="(word, i) in processedWords" :key="i" class="word-container position-relative mx-1"
          :data-word-index="i">
          <Word :text="word" :index="i" :initial-location="'origin'" @word-click="handleWordClick"
            @animation-start="wordBuilder.startAnimation" @animation-end="wordBuilder.endAnimation"
            :disabled="wordBuilder.isChecked.value" />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, watch, computed } from 'vue';
import Word from '../components/common/Word.vue';

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

    const processedWords = computed(() => {
      const rawWords = wordBuilder.wordList.value || [];
      return rawWords.map(word => String(word));
    });

    const handleWordClick = ({ element, location, index }) => {
      if (wordBuilder.isAnimating.value || wordBuilder.isChecked.value) return;

      location === 'origin'
        ? moveWord(element, index, 'origin', 'destination')
        : moveWord(element, index, 'destination', 'origin');
    };

    const moveWord = (wordElement, index, fromLocation, toLocation) => {
      const container = fromLocation === 'origin'
        ? wordElement.closest('.word-container')
        : origin.value.querySelector(`.word-container[data-word-index="${index}"]`);

      if (!container) return;

      const id = Date.now();

      if (fromLocation === 'origin') {
        container.dataset.id = id;
        container.style.height = `${wordElement.offsetHeight}px`;
        container.style.width = `${wordElement.offsetWidth}px`;
      }

      const siblings = fromLocation === 'destination'
        ? Array.from(destination.value.querySelectorAll('.word')).filter(w => w !== wordElement)
        : [];

      const first = wordElement.getBoundingClientRect();
      siblings.forEach(sib => sib.__first = sib.getBoundingClientRect());

      const targetContainer = toLocation === 'destination' ? destination.value : container;
      targetContainer.appendChild(wordElement);

      const last = wordElement.getBoundingClientRect();
      siblings.forEach(sib => sib.__last = sib.getBoundingClientRect());

      wordElement.__component?.setLocation(toLocation);
      wordBuilder.moveWord(index, toLocation);

      wordElement.__component?.performFlip({ first, last });
      siblings.forEach(sib => {
        sib.__component?.performFlip({ first: sib.__first, last: sib.__last });
      });

      if (toLocation === 'origin') {
        setTimeout(() => {
          container.style.height = "";
          container.style.width = "";
          container.removeAttribute("data-id");
        }, 300);
      }
    };

    const checkAnswer = () => {
      const result = wordBuilder.checkAnswer();
      const words = Array.from(destination.value.querySelectorAll('.word'));

      words.forEach((word, idx) => {
        word.__component?.setFeedback(result.isCorrect);
      });

      return result;
    };

    const onContinue = () => {
      document.querySelectorAll('.word').forEach(word => {
        word.__component?.resetFeedback();
      });

      wordBuilder.reset();

      if (destination.value) {
        destination.value.innerHTML = '';
      }
    };

    onMounted(() => {
      wordBuilder.init();

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

.word-container {
  background: rgb(55, 70, 79);
  border-radius: 0.5rem;
  outline: none;
  border: none;
}

.words.checked .word {
  cursor: default;
  pointer-events: none;
}

.destination {
  min-height: 120px;
  background: repeating-linear-gradient(to bottom, transparent 0, transparent 48px, var(--color-swan) 48px, var(--color-swan) 49px, var(--color-swan) 49px, transparent 52px);
  border-top: 2px solid var(--color-swan);
}
</style>