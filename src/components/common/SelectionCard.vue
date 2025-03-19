<template>
  <div class="selection-card" :class="[{
    'selected': isSelected,
    'correct': isCorrect,
    'incorrect': isIncorrect,
    'disabled': isDisabled,
    'shake-animation': isIncorrect
  }, className]" @click="onSelect">
    <slot></slot>
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
:root {
  --transition-speed: 0.1s;
  --star-color: var(--internal-color-success, #26a69a);
}

.selection-card {
  color: var(--color-eel);
  font-size: 19px;
  padding: 12px;
  border: 2px solid transparent;
  border-bottom-width: 4px;
  border-radius: 12px;
  cursor: pointer;
  display: inline-flex;
  flex-direction: column;
  position: relative;
  transform: translateZ(0);
  height: fit-content;
  transition: all var(--transition-speed) ease;
}

.selection-card::before {
  content: "";
  position: absolute;
  inset: -2px;
  z-index: -1;
  background-color: var(--color-snow);
  border: 2px solid var(--color-swan);
  border-radius: 12px;
  box-shadow: 0 2px 0 var(--color-swan);
  transition: inherit;
}

.selection-card:active {
  transform: translateY(2px) translateZ(0);
}

.selection-card:not(.disabled):hover::before {
  background-color: var(--color-polar);
}

/* State: Selected */
.selection-card.selected {
  color: var(--color-whale);
}

.selection-card.selected::before {
  background-color: var(--color-iguana);
  border-color: var(--color-blue-jay);
}

.selection-card.selected :deep(span.card-text) {
  color: var(--color-whale) !important;
}

.selection-card.selected :deep(.card-text-index) {
  color: var(--color-whale) !important;
  border: 3px solid var(--color-blue-jay) !important;
}

/* State: Correct */
.selection-card.correct,
.selection-card.correct :deep(span.card-text),
.selection-card.correct :deep(.card-text-index) {
  color: var(--internal-color-success) !important;
  opacity: 1 !important;
}

.selection-card.correct :deep(.card-text-index) {
  border-color: var(--internal-border-success) !important;
}

.selection-card.correct::before {
  background-color: var(--internal-background-color-success);
  border-color: var(--internal-border-success) !important;
}

/* State: Incorrect */
.selection-card.incorrect,
.selection-card.incorrect :deep(span.card-text),
.selection-card.incorrect :deep(.card-text-index) {
  color: var(--internal-color-error, #e86f6f) !important;
}

.selection-card.incorrect {
  opacity: 1 !important;
}

.selection-card.incorrect :deep(.card-text-index) {
  border-color: var(--internal-border-error, #e86f6f) !important;
}

.selection-card.incorrect::before {
  border-color: var(--internal-border-error, #e86f6f) !important;
}

/* State: Disabled */
.selection-card.disabled,
.selection-card.disabled::before {
  opacity: 0.4;
}

.selection-card.disabled {
  pointer-events: none;
}

/* Media query */
@media (min-width: 700px) {
  .selection-card {
    padding: 24px;
  }
}

/* Animations */
@keyframes shake {

  0%,
  100% {
    transform: translateX(0);
  }

  25%,
  75% {
    transform: translateX(-3px);
  }

  50% {
    transform: translateX(3px);
  }
}

.selection-card.shake-animation {
  animation: shake 0.2s cubic-bezier(0.36, 0.07, 0.19, 0.97) both;
}

/* Star styling */
.star {
  position: absolute;
  color: var(--star-color);
  font-size: 20px;
  pointer-events: none;
  opacity: 0;
  transform: scale(0);
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

  0%,
  100% {
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

@keyframes appear-and-float-left {

  0%,
  100% {
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

.correct .star {
  animation: appear-and-float 1s ease forwards;
}

.correct .star-left {
  animation: appear-and-float-left 1s ease forwards;
}
</style>