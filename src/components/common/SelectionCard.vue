<template>
  <div class="selection-card" :class="[{
    'selected': isSelected,
    'correct': isCorrect,
    'incorrect': isIncorrect,
    'disabled': isDisabled,
    'shake-animation': isIncorrect
  }, className]" @click="onSelect">
    <slot></slot>
    <!-- Animasyonlu Yıldızlar -->
    <span v-if="isCorrect" class="star star-left">✦</span>
    <span v-if="isCorrect" class="star star-right-top">✧</span>
    <span v-if="isCorrect" class="star star-right-bottom">✦</span>
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
  computed: {
    isIncorrect() {
      // Only show incorrect when answer is checked (isDisabled) and not correct
      return this.isSelected && this.isDisabled && !this.isCorrect;
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
  position: relative;
  transform: translateZ(0);
  height: fit-content;
  transition: all 0.1s ease;
}

.selection-card::before {
  background-color: var(--color-snow);
  border: 2px solid var(--color-swan);
  border-radius: 12px;
  bottom: -2px;
  box-shadow: 0 2px 0 var(--color-swan);
  content: "";
  left: -2px;
  position: absolute;
  right: -2px;
  top: -2px;
  z-index: -1;
  transition: all 0.1s ease;

}

.selection-card:active {
  transform: translateY(2px) translateZ(0);
}

.selection-card:not(.disabled):hover::before {
  background-color: var(--color-polar);
}

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

.selection-card.selected::before {
  color: var(--color-blue-jay);
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

/* Incorrect state styling */
.selection-card.incorrect {
  color: var(--internal-color-error, #e86f6f) !important;
  opacity: 1 !important;
}

.selection-card.incorrect :deep(span.card-text) {
  color: var(--internal-color-error, #e86f6f) !important;
}

.selection-card.incorrect :deep(.card-text-index) {
  color: var(--internal-color-error, #e86f6f) !important;
  border-color: var(--internal-border-error, #e86f6f) !important;
}

.selection-card.incorrect::before {
  border-color: var(--internal-border-error, #e86f6f) !important;
}

/* Combined states - selected + correct */
.selection-card.selected.correct {
  color: var(--internal-color-success) !important;
  opacity: 1 !important;
}

.selection-card.selected.correct :deep(span.card-text) {
  color: var(--internal-color-success) !important;
}

.selection-card.selected.correct :deep(.card-text-index) {
  color: var(--internal-color-success) !important;
  border-color: var(--internal-border-success) !important;
}

.selection-card.disabled {
  pointer-events: none;
  opacity: 0.4;
}

.selection-card.disabled::before {
  opacity: 0.4;
}

/* Shake animation for incorrect answers */
@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25%, 75% { transform: translateX(-3px); }
  50% { transform: translateX(3px); }
}


.selection-card.shake-animation {
  animation: shake 0.2s cubic-bezier(0.36, 0.07, 0.19, 0.97) both;
}

@media (min-width: 700px) {
  .selection-card {
    padding: 24px;
  }
}

/* Yıldız Animasyonları */
.star {
  position: absolute;
  color: var(--internal-color-success, #26a69a);
  font-size: 20px;
  pointer-events: none;
  opacity: 0;
  transform: scale(0);
  animation: appear-and-float 0.5s ease forwards;
}

.star-left {
  top: 50%;
  left: 12px;
  transform: translateY(-50%) scale(0);
}

.star-right-top {
  top: 5px;
  right: 35px;
}

.star-right-bottom {
  top: 15px;
  right: 20px;
}

@keyframes appear-and-float {
  0%, 100% {
    opacity: 0;
    transform: scale(0) rotate(0deg);
  }

  10% {
    opacity: 1;
    transform: scale(1.2) rotate(0deg);
  }

  50% {
    opacity: 1;
    transform: scale(1.4) rotate(15deg);
  }

  90% {
    opacity: 1;
    transform: scale(0) rotate(0deg);
  }
}

.correct .star {
  animation: appear-and-float 1s ease forwards;
}

.correct .star-left {
  animation: appear-and-float-left 1s ease forwards;
}

@keyframes appear-and-float-left {
  0%, 100% {
    opacity: 0;
    transform: translateY(-50%) scale(0) rotate(0deg);
  }

  10% {
    opacity: 1;
    transform: translateY(-50%) scale(1.2) rotate(0deg);
  }

  50% {
    opacity: 1;
    transform: translateY(-50%) scale(1.6) rotate(15deg);
  }

  90% {
    opacity: 1;
    transform: translateY(-50%) scale(0) rotate(0deg);
  }
}
</style>