<template>
  <div 
    class="duo-btn-container"
    @mousedown="isPressed = true"
    @mouseup="isPressed = false"
    @mouseleave="isPressed = false"
    @touchstart="isPressed = true"
    @touchend="isPressed = false"
    @touchcancel="isPressed = false"
  >
    <button
      :class="[
        'duo-btn',
        variantClass,
        sizeClass,
        {'rounded-full': rounded},
        {'is-pressed': isPressed}
      ]"
      :disabled="disabled"
      @click="$emit('click')"
    >
      <span class="btn-content" :class="{'is-pressed': isPressed}">
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
    validator: (value) => ['default', 'primary', 'primaryOutline', 'secondary', 'secondaryOutline', 
                           'danger', 'dangerOutline', 'super', 'superOutline', 'ghost'].includes(value)
  },
  size: {
    type: String,
    default: 'default',
    validator: (value) => ['default', 'sm', 'lg', 'icon'].includes(value)
  },
  disabled: {
    type: Boolean,
    default: false
  },
  rounded: {
    type: Boolean,
    default: false
  }
});

const variantClass = computed(() => {
  const variants = {
    default: 'btn-default',
    primary: 'btn-primary',
    primaryOutline: 'btn-primary-outline',
    secondary: 'btn-secondary',
    secondaryOutline: 'btn-secondary-outline',
    danger: 'btn-danger',
    dangerOutline: 'btn-danger-outline',
    super: 'btn-super',
    superOutline: 'btn-super-outline',
    ghost: 'btn-ghost'
  };
  
  return variants[props.variant] || 'btn-default';
});

const sizeClass = computed(() => {
  const sizes = {
    default: 'btn-default-size',
    sm: 'btn-sm',
    lg: 'btn-lg',
    icon: 'btn-icon'
  };
  
  return sizes[props.size] || 'btn-default-size';
});

defineEmits(['click']);
</script>

<style scoped>
.duo-btn-container {
  position: relative;
  display: inline-block;
  width: 100%;
}

/* Base button styles */
.duo-btn {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  white-space: nowrap;
  font-size: 0.875rem;
  font-weight: 700;
  font-family: 'Nunito', sans-serif;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  border: none;
  box-sizing: border-box;
  cursor: pointer;
  transition: transform 0.05s ease-in-out;
}

.duo-btn:focus {
  outline: none;
}

.duo-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-content {
  position: relative;
  transition: transform 0.05s ease-in-out;
}

.btn-content.is-pressed {
  transform: translateY(2px);
}

/* Default button style */
.btn-default {
  border-radius: 0.75rem;
  background-color: #cfcfcf; /* Bottom layer - Duolingo Alto */
}

.btn-default::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 4px;
  background-color: #f0f0f0; /* Top layer - Duolingo Gallery */
  border-radius: 0.75rem;
  transition: bottom 0.05s ease-in-out;
}

.btn-default.is-pressed::before {
  bottom: 0;
}

.btn-default span {
  position: relative;
  z-index: 2;
  color: #4c4c4c; /* Duolingo Tundora */
}

/* Primary button style */
.btn-primary {
  border-radius: 0.75rem;
  background-color: #14d4f4; /* Bottom layer - Duolingo Bright Turquoise */
}

.btn-primary::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 4px;
  background-color: #1cb0f6; /* Top layer - Duolingo Dodger Blue */
  border-radius: 0.75rem;
  transition: bottom 0.05s ease-in-out;
}

.btn-primary.is-pressed::before {
  bottom: 0;
}

.btn-primary span {
  position: relative;
  z-index: 2;
  color: white;
}

/* Primary Outline button style */
.btn-primary-outline {
  border-radius: 0.75rem;
  background-color: #cfcfcf; /* Bottom layer - Duolingo Alto */
}

.btn-primary-outline::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 4px;
  background-color: white;
  border-radius: 0.75rem;
  transition: bottom 0.05s ease-in-out;
  border: 2px solid #1cb0f6; /* Duolingo Dodger Blue */
  box-sizing: border-box;
}

.btn-primary-outline.is-pressed::before {
  bottom: 0;
}

.btn-primary-outline span {
  position: relative;
  z-index: 2;
  color: #1cb0f6; /* Duolingo Dodger Blue */
}

/* Secondary button style */
.btn-secondary {
  border-radius: 0.75rem;
  background-color: #8ee000; /* Bottom layer - Duolingo Chartreuse */
}

.btn-secondary::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 4px;
  background-color: #7ac70c; /* Top layer - Duolingo Pistachio */
  border-radius: 0.75rem;
  transition: bottom 0.05s ease-in-out;
}

.btn-secondary.is-pressed::before {
  bottom: 0;
}

.btn-secondary span {
  position: relative;
  z-index: 2;
  color: white;
}

/* Secondary Outline button style */
.btn-secondary-outline {
  border-radius: 0.75rem;
  background-color: #cfcfcf; /* Bottom layer - Duolingo Alto */
}

.btn-secondary-outline::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 4px;
  background-color: white;
  border-radius: 0.75rem;
  transition: bottom 0.05s ease-in-out;
  border: 2px solid #7ac70c; /* Duolingo Pistachio */
  box-sizing: border-box;
}

.btn-secondary-outline.is-pressed::before {
  bottom: 0;
}

.btn-secondary-outline span {
  position: relative;
  z-index: 2;
  color: #7ac70c; /* Duolingo Pistachio */
}

/* Danger button style */
.btn-danger {
  border-radius: 0.75rem;
  background-color: #d33131; /* Bottom layer - Duolingo Persian Red */
}

.btn-danger::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 4px;
  background-color: #e53838; /* Top layer - Duolingo Cinnabar */
  border-radius: 0.75rem;
  transition: bottom 0.05s ease-in-out;
}

.btn-danger.is-pressed::before {
  bottom: 0;
}

.btn-danger span {
  position: relative;
  z-index: 2;
  color: white;
}

/* Danger Outline button style */
.btn-danger-outline {
  border-radius: 0.75rem;
  background-color: #cfcfcf; /* Bottom layer - Duolingo Alto */
}

.btn-danger-outline::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 4px;
  background-color: white;
  border-radius: 0.75rem;
  transition: bottom 0.05s ease-in-out;
  border: 2px solid #e53838; /* Duolingo Cinnabar */
  box-sizing: border-box;
}

.btn-danger-outline.is-pressed::before {
  bottom: 0;
}

.btn-danger-outline span {
  position: relative;
  z-index: 2;
  color: #e53838; /* Duolingo Cinnabar */
}

/* Super button style */
.btn-super {
  border-radius: 0.75rem;
  background-color: #a560e8; /* Bottom layer - Duolingo Medium Purple */
}

.btn-super::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 4px;
  background-color: #8549ba; /* Top layer - Duolingo Studio */
  border-radius: 0.75rem;
  transition: bottom 0.05s ease-in-out;
}

.btn-super.is-pressed::before {
  bottom: 0;
}

.btn-super span {
  position: relative;
  z-index: 2;
  color: white;
}

/* Super Outline button style */
.btn-super-outline {
  border-radius: 0.75rem;
  background-color: #cfcfcf; /* Bottom layer - Duolingo Alto */
}

.btn-super-outline::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 4px;
  background-color: white;
  border-radius: 0.75rem;
  transition: bottom 0.05s ease-in-out;
  border: 2px solid #8549ba; /* Duolingo Studio */
  box-sizing: border-box;
}

.btn-super-outline.is-pressed::before {
  bottom: 0;
}

.btn-super-outline span {
  position: relative;
  z-index: 2;
  color: #8549ba; /* Duolingo Studio */
}

/* Ghost button style */
.btn-ghost {
  border-radius: 0.75rem;
  background-color: transparent;
}

.btn-ghost::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: transparent;
  border-radius: 0.75rem;
  transition: background-color 0.05s ease-in-out;
}

.btn-ghost.is-pressed::before {
  background-color: rgba(207, 207, 207, 0.3); /* Duolingo Alto with transparency */
}

.btn-ghost span {
  position: relative;
  z-index: 2;
  color: #6f6f6f; /* Duolingo Dove Gray */
}

/* Button sizes */
.btn-default-size {
  height: 2.75rem; /* h-11 */
  padding: 0.5rem 1rem; /* px-4 py-2 */
}

.btn-sm {
  height: 2.25rem; /* h-9 */
  padding: 0 0.75rem; /* px-3 */
}

.btn-lg {
  height: 3rem; /* h-12 */
  padding: 0 2rem; /* px-8 */
}

.btn-icon {
  height: 2.5rem; /* h-10 */
  width: 2.5rem; /* w-10 */
  padding: 0;
}

.rounded-full {
  border-radius: 9999px !important;
}

.rounded-full::before {
  border-radius: 9999px !important;
}
</style>
