<template>
  <div 
    class="option-card"
    :class="{ 'selected': selected }"
    @click="$emit('select')"
  >
    <slot></slot>
  </div>
</template>

<script>
export default {
  name: 'OptionCard',
  props: {
    selected: {
      type: Boolean,
      default: false
    }
  },
  emits: ['select']
}
</script>

<style scoped>
.option-card {
  background-color: #334155;
  padding: 16px;
  border-radius: 8px;
  cursor: pointer;
  text-align: center;
  font-size: 18px;
  transition: all 0.2s ease;
}

.option-card:hover {
  background-color: #475569;
  transform: translateY(-2px);
}

.option-card.selected {
  background-color: #3b82f6;
  border: 2px solid #60a5fa;
}
</style>
