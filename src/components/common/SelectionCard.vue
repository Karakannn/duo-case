<template>
  <div class="selection-card" :class="[{
    'selected': isSelected,
    'correct': isCorrect,
    'disabled': isDisabled
  }, className]" @click="onSelect">
    <slot></slot>
  </div>
</template>

<script>
export default {
  name: 'SelectionCard',
  props: {
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
  emits: ['select'],
  setup(props, { emit }) {
    const onSelect = () => {
      if (!props.isDisabled) {
        emit('select');
      }
    };

    return {
      onSelect
    };
  }
}
</script>

<style scoped>
.selection-card {
  color: var(--color-eel);
  flex-direction: column;
  font-size: 19px;
  padding: 12px;
  border: solid transparent;
  border-radius: 12px;
  border-width: 2px 2px 4px;
  cursor: pointer;
  display: inline-flex;
  outline: 0;
  position: relative;
  touch-action: manipulation;
  transform: translateZ(0);
  user-select: none;
  height: fit-content;
}

.selection-card::before {
  background-color: var(--color-snow);
  border: 3px solid var(--color-swan);
  border-radius: 12px;
  bottom: -2px;
  box-shadow: 0 2px 0 var(--color-swan);
  content: "";
  left: -2px;
  position: absolute;
  right: -2px;
  top: -2px;
  z-index: -1;
}

.selection-card:not(.disabled):hover::before {
  background-color: var(--color-polar);
}

/* Selected state styling */
.selection-card.selected {
  color: var(--color-whale);
}

.selection-card.selected :deep(span.card-text) {
  color: var(--color-whale) !important;
}

.selection-card.selected :deep(.card-text-index) {
  color: var(--color-whale) !important;
  border-width: 3px;
  border-color: var(--color-blue-jay) !important;
}

.selection-card:not(.disabled):active {
  transform: translateY(2px) translateZ(0);
}

.selection-card.selected::before {
  background-color: var(--color-iguana);
  border-color: var(--color-blue-jay);
}

/* Correct state styling */
.selection-card.correct {
  color: var(--internal-color-success) !important;
}

.selection-card.correct :deep(span.card-text) {
  color: var(--internal-color-success) !important;
}

.selection-card.correct :deep(.card-text-index) {
  color: var(--internal-color-success) !important;
  border-color: var(--internal-border-success) !important;
}

.selection-card.correct::before {
  background-color: var(--internal-background-color-success);
  border-color: var(--internal-border-success) !important;
}

/* Combined states - selected + correct */
.selection-card.selected.correct {
  color: var(--internal-color-success) !important;
}

.selection-card.selected.correct :deep(span.card-text) {
  color: var(--internal-color-success) !important;
}

.selection-card.selected.correct :deep(.card-text-index) {
  color: var(--internal-color-success) !important;
  border-color: var(--internal-border-success) !important;
}

.selection-card.disabled {
  cursor: default;
  opacity: 0.9;
}

@media (min-width: 700px) {
  .selection-card {
    padding: 24px;
  }
}
</style>
