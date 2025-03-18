<template>
  <selection-card :is-selected="isSelected" :is-correct="isCorrect" :is-disabled="isDisabled" :class-name="'word-match'"
    @select="$emit('select')">
    <div class="option-content">
      <div class="option-number" :class="{ 'correct': isCorrect }">{{ number }}</div>
      <div class="option-text-container">
        <div class="option-text" :class="{ 'correct': isCorrect }">{{ text }}</div>
      </div>
    </div>
  </selection-card>
</template>

<script>
// Import using vue3-sfc-loader instead of path alias
const SelectionCard = window["vue3-sfc-loader"].loadModule(
  './src/components/common/SelectionCard.vue',
  window.sfcOptions
);

export default {
  name: 'OptionButton',
  components: {
    SelectionCard: Vue.defineAsyncComponent(() => SelectionCard)
  },
  props: {
    number: {
      type: [Number, String],
      required: true
    },
    text: {
      type: String,
      required: true
    },
    isSelected: {
      type: Boolean,
      default: false
    },
    isCorrect: {
      type: Boolean,
      default: false
    },
    isDisabled: {
      type: Boolean,
      default: false
    },
    className: {
      type: [String, Object, Array],
      default: ''
    }
  },
  emits: ['select']
}
</script>

<style scoped>
.word-match {
  padding: 12px 16px !important;
  color: var(--color-eel) !important;
}

.option-content {
  display: flex;
  align-items: center;
  width: 100%;
}

.option-number {
  display: inline-flex;
  align-items: center;
  border: 3px solid var(--color-swan);
  border-radius: 8px;
  color: var(--color-hare);
  font-size: 15px;
  height: 30px;
  justify-content: center;
  width: 30px;
  flex-shrink: 0;
  font-weight: 900;
}

.option-text-container {
  display: flex;
  align-items: center;
  flex-grow: 1;
  justify-content: center;
}

.option-text {
  margin-left: 8px;
  font-size: 19px;
  font-weight: 500;
  color: var(--color-eel);
}

/* Correct state styling */
.option-number.correct {
  color: var(--internal-color-success) !important;
  background-color: var(--internal-background-color-success);
  border: 2px solid var(--internal-border-success);
}

.option-text.correct {
  color: var(--internal-color-success) !important;
}

/* option-number mobile olduğunda hidden olmalı */
@media (max-width: 700px) {
  .option-number {
    display: none;
  }
}
</style>
