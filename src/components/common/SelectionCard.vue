<template>
  <div class="selection-card" :class="[{
    'selected': isSelected,
    'correct': isCorrect,
    'disabled': isDisabled,
    'matched': isMatched,
    'correct-match': isCorrectMatch,
    'wrong-match': isWrongMatch
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
    isMatched: {
      type: Boolean,
      default: false
    },
    isCorrectMatch: {
      type: Boolean,
      default: false
    },
    isWrongMatch: {
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
.selection-card.selected:not(.matched):not(.correct-match):not(.wrong-match) {
  color: var(--color-whale);
}

.selection-card.selected:not(.matched):not(.correct-match):not(.wrong-match) :deep(span.card-text) {
  color: var(--color-whale) !important;
}

.selection-card.selected:not(.matched):not(.correct-match):not(.wrong-match)::before {
  border-color: var(--color-blue-jay);
  box-shadow: 0 2px 0 var(--color-blue-jay);
}

/* Correct state styling */
.selection-card.correct {
  color: var(--color-owl);
}

.selection-card.correct::before {
  background-color: var(--color-snow);
  border-color: var(--color-owl);
  box-shadow: 0 2px 0 var(--color-owl);
}

.selection-card.correct :deep(span.card-text) {
  color: var(--color-owl) !important;
}

.selection-card.correct :deep(.card-text-index) {
  color: var(--color-owl) !important;
  border-width: 3px;
  border-color: var(--internal-border-success) !important;
}

/* Matched state styling */
.selection-card.matched {
  color: var(--color-eel);
}

.selection-card.matched::before {
  background-color: var(--color-polar);
  border-color: var(--color-swan);
  box-shadow: 0 2px 0 var(--color-swan);
}

/* Correct match state styling */
.selection-card.correct-match {
  color: var(--color-owl);
}

.selection-card.correct-match::before {
  background-color: rgba(88, 204, 2, 0.1);
  border-color: var(--color-owl);
  box-shadow: 0 2px 0 var(--color-owl);
}

/* Wrong match state styling */
.selection-card.wrong-match {
  color: var(--color-cardinal);
}

.selection-card.wrong-match::before {
  background-color: rgba(255, 75, 75, 0.1);
  border-color: var(--color-cardinal);
  box-shadow: 0 2px 0 var(--color-cardinal);
}

/* Disabled state styling */
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
