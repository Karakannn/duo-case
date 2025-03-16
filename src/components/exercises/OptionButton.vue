<template>
  <selection-card 
    :is-selected="isSelected" 
    :is-correct="isCorrect"
    :is-disabled="isDisabled"
    @select="$emit('select')">
    <div class="option-content">
      <div class="option-number" :class="{ 'correct': isCorrect }">{{ number }}</div>
      <div class="option-text" :class="{ 'correct': isCorrect }">{{ text }}</div>
    </div>
  </selection-card>
</template>

<script>
import SelectionCard from '@/components/common/SelectionCard.vue';

export default {
  name: 'OptionButton',
  components: {
    SelectionCard
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
    }
  },
  emits: ['select']
}
</script>

<style scoped>
.option-content {
  display: flex;
  align-items: center;
  width: 100%;
}

.option-number {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  margin: 8px;
  border-radius: 50%;
  background-color: var(--color-swan);
  color: var(--color-hare);
  font-weight: 700;
}

.option-text {
  margin-left: 8px;
  font-size: 19px;
  font-weight: 500;
  color: var(--color-hare);
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
</style>
