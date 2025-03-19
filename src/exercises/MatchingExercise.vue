<template>
  <div class="exercise-component d-flex flex-column justify-content-center">
    <div class="matching-exercise w-100">
      <div v-if="audioWord" class="audio-container mb-4 text-center">
        <div class="audio-button">
          <span class="badge bg-primary rounded-pill fs-5 px-4 py-2">
            <i class="fas fa-volume-up me-2"></i>
            <span>{{ audioWord }}</span>
          </span>
        </div>
      </div>

      <SelectionCard v-for="(item, index) in leftItems" :key="`left-${index}`" :isSelected="selectedLeft === index"
        :isMatched="matchedItems.left.includes(index)" :isCorrect="correctMatches.includes(index)" 
        :isDisabled="matchedItems.left.includes(index) || (isAnimating && (index === selectedLeft || wrongMatches.left.includes(index)))"
        @select="selectItem('left', index)" class="match-item w-100 text-center d-flex align-items-center justify-content-center h-100">
        <div class="card-text-container w-100 d-flex align-items-center justify-content-between">
          <span class="card-text-index d-none d-md-inline-flex align-items-center justify-content-center rounded-2 fw-bold">{{ index + 1 }}</span>
          <div class="card-text w-100 d-flex align-items-center justify-content-center">
            <span class="fs-5 fw-medium">{{ item.text }}</span>
          </div>
        </div>
      </SelectionCard>

      <SelectionCard v-for="(item, index) in rightItems" :key="`right-${index}`" :isSelected="selectedRight === index"
        :isMatched="matchedItems.right.includes(index)" :isCorrect="correctMatches.includes(index)" 
        :isDisabled="matchedItems.right.includes(index) || (isAnimating && (index === selectedRight || wrongMatches.right.includes(index)))"
        @select="selectItem('right', index)" class="match-item w-100 text-center d-flex align-items-center justify-content-center h-100">
        <div class="card-text-container w-100 d-flex align-items-center justify-content-between">
          <span class="card-text-index d-inline-flex align-items-center justify-content-center rounded-2 fw-bold">{{ index + 1 }}</span>
          <div class="card-text w-100 d-flex align-items-center justify-content-center">
            <span class="fs-5 fw-medium">{{ item.text }}</span>
          </div>
        </div>
      </SelectionCard>
    </div>
  </div>
</template>

<script>
export default {
  name: 'MatchingExercise',
  components: {
    SelectionCard: Vue.defineAsyncComponent(() => window["vue3-sfc-loader"].loadModule("./src/components/common/SelectionCard.vue", window.sfcOptions))
  },
  props: {
    exerciseData: {
      type: Object,
      default: () => ({})
    }
  },
  emits: ['complete'],
  setup(props, { emit }) {
    const { ref, computed, onMounted, watch, nextTick } = Vue;
    const matchingExercise = window.useMatching(props.exerciseData);
    const title = ref("Eşleştirmeleri tamamlayın");
    const audioWord = ref(null);
    const leftItems = matchingExercise.leftItems;
    const rightItems = matchingExercise.rightItems;
    const selectedLeft = ref(null);
    const selectedRight = ref(null);
    const matchedItems = ref({ left: [], right: [] });
    const correctMatches = ref([]);
    const wrongMatches = ref({ left: [], right: [] });
    const isAnimating = ref(false);

    onMounted(() => {
      // Initialize with the current exercise data
      matchingExercise.init();
      
      // Make the component available globally for the check answer function
      window.activeExerciseComponent = {
        checkAnswer: () => {
          const result = matchingExercise.checkAnswer();
          return {
            isCorrect: result.isCorrect,
            correctAnswer: ''
          };
        },
        onContinue: () => {
          selectedLeft.value = null;
          selectedRight.value = null;
          matchedItems.value = { left: [], right: [] };
          correctMatches.value = [];
          wrongMatches.value = { left: [], right: [] };
          matchingExercise.reset();
          if (window.mainLayout?.nextExercise) {
            window.mainLayout.nextExercise();
          }
        },
        renderResultContent: matchingExercise.renderResultContent
      };
    });

    const selectItem = (side, index) => {
      if (isAnimating.value) return;
      if (side === 'left' && matchedItems.value.left.includes(index)) return;
      if (side === 'right' && matchedItems.value.right.includes(index)) return;
      if (side === 'left' && selectedLeft.value !== null) {
        selectedLeft.value = index;
        return;
      }
      if (side === 'right' && selectedRight.value !== null) {
        selectedRight.value = index;
        return;
      }
      if (side === 'left') {
        selectedLeft.value = index;
      } else {
        selectedRight.value = index;
      }

      if (selectedLeft.value !== null && selectedRight.value !== null) {
        const leftId = leftItems.value[selectedLeft.value].id;
        const rightId = rightItems.value[selectedRight.value].id;
        const isCorrect = matchingExercise.checkPair(leftId, rightId);
        isAnimating.value = true;

        if (isCorrect) {
          correctMatches.value = [selectedLeft.value, selectedRight.value];
          const tempLeftIndex = selectedLeft.value;
          const tempRightIndex = selectedRight.value;
          
          if (matchedItems.value.left.length === leftItems.value.length - 1) {
            if (window.mainLayout) {
              window.mainLayout.canCheck = true;
            }
          }

          setTimeout(() => {
            matchedItems.value.left.push(tempLeftIndex);
            matchedItems.value.right.push(tempRightIndex);
            correctMatches.value = [];
            selectedLeft.value = null;
            selectedRight.value = null;
            matchingExercise.matchItems({ id: leftId }, { id: rightId });
            isAnimating.value = false;
          }, 1000);
        } else {
          wrongMatches.value.left = [selectedLeft.value];
          wrongMatches.value.right = [selectedRight.value];

          setTimeout(() => {
            wrongMatches.value.left = [];
            wrongMatches.value.right = [];
            selectedLeft.value = null;
            selectedRight.value = null;
            matchingExercise.decreaseHeart();
            isAnimating.value = false;
          }, 1000);
        }
      }
    };

    const checkAllMatched = () => {
      if (matchedItems.value.left.length === leftItems.value.length) {
        if (window.mainLayout) {
          window.mainLayout.canCheck = true;
        }
      }
    };

    const stepStore = window.useStepStore();
    if (stepStore) {
      watch(() => stepStore.currentStepId.value, () => {
        matchingExercise.init();
        selectedLeft.value = null;
        selectedRight.value = null;
        matchedItems.value = { left: [], right: [] };
        correctMatches.value = [];
        wrongMatches.value = { left: [], right: [] };
      });
    }

    return {
      title,
      audioWord,
      leftItems,
      rightItems,
      selectedLeft,
      selectedRight,
      matchedItems,
      correctMatches,
      wrongMatches,
      isAnimating,
      selectItem
    };
  }
}
</script>

<style scoped>
.matching-exercise {
  display: grid;
  grid-gap: 16px 20px;
  grid-auto-flow: column;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  grid-template-rows: repeat(5, 76px);
  justify-content: center;
  max-height: 100%;
}

.match-item {
  min-height: 0;
  padding: 12px 0;
}

.card-text-container {
  padding: 0 16px;
}

.card-text-index {
  border: 3px solid var(--color-swan);
  color: var(--color-hare);
  font-size: 15px;
  height: 30px;
  width: 30px;
  flex-shrink: 0;
}

@keyframes pulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
}

@keyframes shake {
  0% { transform: translateX(0); }
  25% { transform: translateX(-5px); }
  50% { transform: translateX(5px); }
  75% { transform: translateX(-5px); }
  100% { transform: translateX(0); }
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes fadeOut {
  from { opacity: 1; }
  to { opacity: 0; }
}



@media (min-width: 700px) {
  .match-item {
    justify-content: flex-start !important;
    height: auto;
    padding: 8px 0px !important;
  }

  .matching-exercise {
    grid-gap: 10px 30px;
    grid-template-rows: repeat(5, 1fr);
  }
}
</style>