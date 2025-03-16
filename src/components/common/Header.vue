<template>
  <div class="exercise-header w-100">
    <div class="exercise-header-inner">
      <div class="back-button">
        <img src="https://d35aaqx5ub95lt.cloudfront.net/images/df223d5b9feb8017b323ed21103eb5ac.svg" alt="Back"
          class="cancel-icon" />
      </div>

      <div class="progress-container">
        <div class="progress" style="height: 16px;">
          <div class="progress-bar-inner" :style="`width: ${progress}%`" role="progressbar"></div>
        </div>
        
        <!-- Streak göstergesi - 2 ve üzeri streak varsa göster -->
        <div v-if="correctStreak >= 2" class="streak-counter">
          <span>{{ correctStreak }} 🔥</span>
        </div>
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
    },
    correctStreak: {
      type: Number,
      default: 0
    }
  },
  emits: ['select'],
  mounted() {
    console.log(`Header mounted with progress: ${this.progress}%, streak: ${this.correctStreak}`);
  },
  watch: {
    progress(newValue) {
      console.log(`Progress updated in Header: ${newValue}%`);
    },
    correctStreak(newValue) {
      console.log(`Streak updated: ${newValue}`);
    }
  }
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

.progress-container {
  flex-grow: 1;
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.progress {
  width: 100%;
  height: 16px;
  background-color: #f0f0f0;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1) inset;
}

.progress-bar-inner {
  background-color: #ff4b4b;
  height: 100%;
  border-radius: 8px;
  transition: width 0.5s ease-in-out;
  box-shadow: 0 0 5px rgba(255,75,75,0.5);
}

.streak-counter {
  position: absolute;
  top: -25px;
  font-weight: bold;
  color: #ff4b4b;
  background-color: #fff;
  padding: 3px 8px;
  border-radius: 12px;
  box-shadow: 0 2px 5px rgba(0,0,0,0.2);
  animation: pulse 1.5s infinite;
}

@keyframes pulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.1); }
  100% { transform: scale(1); }
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
