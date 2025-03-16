<template>
  <div class="button-container" @mousedown="isPressed = true" @mouseup="isPressed = false"
    @mouseleave="isPressed = false" @touchstart="isPressed = true" @touchend="isPressed = false"
    @touchcancel="isPressed = false">
    <button :class="[
      'custom-button',
      variantClass,
      { 'is-pressed': isPressed },
      { 'is-disabled': disabled }
    ]" :disabled="disabled" @click="$emit('click')">
      <span class="button-content" :class="{ 'is-pressed': isPressed }">
        <slot />
      </span>
    </button>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue';

const isPressed = ref(false);

const props = defineProps({
  variant: {
    type: String,
    default: 'default',
    validator: (value) => ['default', 'secondary', 'danger'].includes(value)
  },
  disabled: {
    type: Boolean,
    default: false
  }
});

const variantClass = computed(() => {
  const variants = {
    default: 'button-default',
    secondary: 'button-secondary',
    danger: 'button-danger'
  };

  return variants[props.variant] || 'button-default';
});

defineEmits(['click']);
</script>

<style scoped>
.button-container {
  position: relative;
}

.custom-button {
  background: none;
  border: solid transparent;
  border-radius: 16px;
  border-width: 2px 2px 4px;
  color: rgb(82, 101, 109);
  height: 50px;
  padding: 0 16px;
  font-weight: 900;
  font-size: 15px;
  line-height: 1.2;
  position: relative;
}

.button-content {
  position: relative;
  z-index: 1;
}

.button-default {
  border-bottom: 4px solid rgba(0, 0, 0, 0.2);
  border-radius: 16px;
}

.button-default:active {
  color: rgb(19, 31, 36);
  transform: translateY(4px) translateZ(0);
}

.button-default::before {
  background-color: var(--internal-background-color-default);
  border-radius: 16px;
  bottom: 0;
  box-shadow: 0 4px 0;
  color: var(--internal-border-color-default);
  content: "";
  left: 0;
  position: absolute;
  right: 0;
  top: 0;
  transition: box-shadow 0.1s;
}

.button-default.is-disabled::before {
  background-color: var(--internal-background-color-disabled);
  color: var(--internal-color-disabled);
  box-shadow: 0 2px 0;
}

.button-secondary {
  align-items: center;
  justify-content: center;
  text-decoration: none;
  text-transform: uppercase;
  white-space: nowrap;
  filter: brightness(1);
}

.button-secondary:hover {
  filter: brightness(0.9);
}

.button-secondary:active {
  color: var(--internal-color-active);
  transform: translateY(2px) translateZ(0);
}

.button-secondary.is-disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.button-secondary::before {
  background-color: var(--internal-background-color);
  border: 3px solid var(--internal--switchable__border-color);
  border-radius: 16px;
  bottom: -2px;
  box-shadow: 0 2px 0;
  color: var(--internal--switchable__border-color);
  content: "";
  left: -2px;
  position: absolute;
  right: -2px;
  top: -2px;
}

.button-danger {
  border-bottom: 4px solid rgba(0, 0, 0, 0.2);
  border-radius: 16px;
  color: var(--internal-color-danger);
  font-weight: 900;
}

.button-danger:active {
  color: white;
  transform: translateY(4px) translateZ(0);
}

.button-danger::before {
  background-color: var(--internal-background-color-danger);
  border-radius: 16px;
  bottom: 0;
  box-shadow: 0 4px 0;
  color: var(--internal-color-danger);
  content: "";
  left: 0;
  position: absolute;
  right: 0;
  top: 0;
  transition: box-shadow 0.1s;
}

.button-danger.is-disabled::before {
  background-color: var(--internal-background-color-disabled);
  color: var(--internal-color-disabled);
 
}

.button-danger:not(.is-disabled):hover::before {
  filter: brightness(1.1);
}

@media (min-width: 700px) {
  .button-container {
    grid-column: auto / 2;
    justify-self: start;
  }

  .custom-button {
    min-width: 150px;
    width: 100%;
    outline: none;
  }
}
</style>
