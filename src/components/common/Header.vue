<template>
  <div class="exercise-header w-100">
    <div class="exercise-header-inner">
      <div class="back-button">
        <img src="https://d35aaqx5ub95lt.cloudfront.net/images/df223d5b9feb8017b323ed21103eb5ac.svg" alt="Back"
          class="cancel-icon" />
      </div>

      <div class="progress" style="height: 16px;">
        <div class="progress-bar-inner" :style="`width: ${progress}%`" role="progressbar"></div>
      </div>

      <div class="hearts-container d-flex align-items-center">
        <img src="https://d35aaqx5ub95lt.cloudfront.net/images/hearts/7631e3ee734dd4fe7792626b59457fa4.svg" alt="Heart"
          class="heart-icon" />
        <span class="ms-1 text-danger fw-bold">{{ hearts }}</span>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Header',
  props: {
    progress: {
      type: Number,
      default: 0
    },
    hearts: {
      type: Number,
      default: 5
    }
  },
  emits: ['select']
}
</script>

<style scoped>
.exercise-header {
  padding: 50px 40px 0;
  margin: 0 auto;
  max-width: 1080px;

}

.exercise-header-inner {
  width: 100%;
  display: flex;
  gap: 24px;
  align-items: center;
  justify-content: space-between;
}

.exercise-info {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
}

.progress {
  flex-grow: 1;
  height: 16px;
  background-color: var(--color-progress-bar-bg);
  border-radius: 3px;
}

.progress-bar-inner {
  background-color: var(--color-progress-bar-bg-inner);
}

.heart-icon {
  width: 32px;
  height: 32px;
  color: var(--color-cardinal);
  font-weight: 700;
}

.cancel-icon {
  height: 18px;
  width: 18px;
}
</style>
