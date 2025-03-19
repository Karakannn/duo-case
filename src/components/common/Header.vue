<template>
  <div class="exercise-header">
    <div class="exercise-header-inner">
      <div class="back-button">
        <img src="https://d35aaqx5ub95lt.cloudfront.net/images/df223d5b9feb8017b323ed21103eb5ac.svg" alt="Back"
          class="cancel-icon" />
      </div>

      <div class="progress-container">
        <div class="progress" style="height: 16px;">
          <div class="progress-bar-inner" :style="`width: ${progress}%`" :class="getProgressColorClass(progress)"
            role="progressbar">
            <div class="stars-container" v-if="showStars">
              <span class="star star-1">✦</span>
              <span class="star star-2">✧</span>
              <span class="star star-3">✦</span>
            </div>
            <div class="ping-animation" v-if="showPing"></div>
          </div>
        </div>

        <div v-if="correctStreak >= 2" class="streak-counter" :class="getCounterColorClass(progress)">
          <span>STREAK {{ correctStreak }}</span>
        </div>
      </div>

      <div class="hearts-container d-flex align-items-center">
        <img src="https://d35aaqx5ub95lt.cloudfront.net/images/hearts/7631e3ee734dd4fe7792626b59457fa4.svg" alt="Heart"
          class="heart-icon" />
        <span class="ms-1 text-danger fw-bold">{{ localHearts }}</span>
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
  setup(props) {
    const { ref, watchEffect } = Vue;
    const localHearts = ref(props.hearts);
    const showStars = ref(false);
    const showPing = ref(false);
    const prevProgress = ref(props.progress);

    const getCounterColorClass = (progressValue) => {
      if (progressValue >= 66.67) {
        return 'counter-orange';
      } else if (progressValue >= 33.33) {
        return 'counter-yellow';
      }
      return 'counter-green';
    };

    const getProgressColorClass = (progressValue) => {
      if (progressValue >= 66.67) {
        return 'progress-orange';
      } else if (progressValue >= 33.33) {
        return 'progress-yellow';
      }
      return 'progress-green';
    };

    watchEffect(() => {
      localHearts.value = props.hearts;

      if (window.globalStore && typeof window.globalStore.hearts !== 'undefined') {
        if (localHearts.value !== window.globalStore.hearts) {
          localHearts.value = window.globalStore.hearts;
        }
      }

      if (props.progress > prevProgress.value) {
        showStars.value = true;
        showPing.value = true;
        setTimeout(() => {
          showStars.value = false;
        }, 2000);
        setTimeout(() => {
          showPing.value = false;
        }, 1500);
      }
      prevProgress.value = props.progress;
    });

    window.updateHeaderHearts = (value) => {
      localHearts.value = value;
    };

    return {
      localHearts,
      getProgressColorClass,
      getCounterColorClass,
      showStars,
      showPing
    };
  }
}
</script>

<style scoped>
.exercise-header {
  margin: 0 auto;
  max-width: 1080px;
  width: 100%;
}

.exercise-header-inner {
  width: 100%;
  display: grid;
  grid-gap: 20px;
  grid-template-columns: min-content 1fr min-content;
  align-items: center;
}

.progress-container {
  flex-grow: 1;
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  overflow: visible;
}

.progress {
  width: 100%;
  height: 16px;
  background-color: var(--color-swan);
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1) inset;
  overflow: visible;
}

.progress-bar-inner {
  background-color: var(--color-owl);
  height: 100%;
  border-radius: 8px;
  transition: width 0.5s ease-in-out, background-color 0.5s ease-in-out;
  box-shadow: 0 0 5px rgba(255, 75, 75, 0.5);
  position: relative;
  overflow: visible;
}

.progress-green {
  background-color: var(--color-owl);
}

.progress-yellow {
  background-color: #FFD700;
}

.progress-orange {
  background-color: rgb(255, 171, 51);
}

.streak-counter {
  position: absolute;
  top: -20px;
  left: 0;
  font-size: 12px;
  font-weight: 900;
  color: var(--color-owl);
  animation: pulse 0.2s ease;
}

.streak-counter.counter-green {
  color: var(--color-owl);
}

.streak-counter.counter-yellow {
  color: #FFD700;
}

.streak-counter.counter-orange {
  color: rgb(255, 171, 51);
}

@keyframes pulse {
  0% {
    transform: scale(1);
  }

  50% {
    transform: scale(1.3);
  }

  100% {
    transform: scale(1);
  }
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

.stars-container {
  position: absolute;
  right: 0;
  top: 0;
  height: 100%;
  pointer-events: none;
}

.star {
  position: absolute;
  color: #FFD700;
  font-size: 16px;
  animation: float-away 2s ease-out forwards;
}

.star-1 {
  right: -5px;
  top: -15px;
  animation-delay: 0.1s;
}

.star-2 {
  right: 0;
  top: -5px;
  animation-delay: 0.3s;
}

.star-3 {
  right: -10px;
  top: 0;
  animation-delay: 0.5s;
}

@keyframes float-away {
  0% {
    opacity: 0;
    transform: scale(0.5) translate(0, 0);
  }

  20% {
    opacity: 1;
    transform: scale(1.2) translate(0, 0);
  }

  100% {
    opacity: 0;
    transform: scale(0.8) translate(20px, -30px);
  }
}

.ping-animation {
  position: absolute;
  right: 0;
  top: 50%;
  transform: translate(50%, -50%);
  width: 12px;
  height: 12px;
  border-radius: 50%;
  z-index: 10;
  animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) forwards;
}

.progress-green .ping-animation {
  background-color: var(--color-owl);
}

.progress-yellow .ping-animation {
  background-color: var(--color-yellow);
}

.progress-orange .ping-animation {
  background-color: var(--color-orange);
}

@keyframes ping {
  0% {
    transform: translate(50%, -50%) scale(0);
    opacity: 1;
  }

  70% {
    transform: translate(50%, -50%) scale(2.5);
    opacity: 0.7;
  }

  100% {
    transform: translate(50%, -50%) scale(4);
    opacity: 0;
  }
}

@media (min-width: 700px) {
  .exercise-header {
    padding: 50px 40px 0;
  }
}
</style>