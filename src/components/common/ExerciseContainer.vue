<template>
  <div class="exercise-container">
    <div v-if="title" class="exercise-title text-center mb-4">
      <h5 class="text-white-50">{{ title }}</h5>
    </div>
    
    <div class="exercise-content">
      <slot></slot>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ExerciseContainer',
  props: {
    title: {
      type: String,
      default: ''
    }
  }
}
</script>

<style scoped>
.exercise-container {
  padding: 1rem 0;
}

.exercise-title {
  margin-top: 0.5rem;
  margin-bottom: 2rem;
}

.exercise-content {
  padding: 0;
}
</style>
