<template>
  <div class="exercise-header">
    <div class="exercise-header-inner">
      <div class="back-button">
        <img src="https://d35aaqx5ub95lt.cloudfront.net/images/df223d5b9feb8017b323ed21103eb5ac.svg" alt="Back"
          class="cancel-icon" />
      </div>

      <div class="progress-container">
        <div class="progress" style="height: 16px;">
          <div class="progress-bar-inner" 
               :style="`width: ${progress}%`" 
               :class="getProgressColorClass(progress)"
               role="progressbar"></div>
        </div>

        <!-- Streak göstergesi - 2 ve üzeri streak varsa göster -->
        <div v-if="correctStreak >= 2" class="streak-counter">
          <span>ART ARDA {{ correctStreak }}</span>
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
    const { ref, watchEffect, computed } = Vue;

    // Hearts değerini tutacak lokal değişken
    const localHearts = ref(props.hearts);

    // Progress durumuna göre renk sınıfını döndüren hesaplanmış özellik
    const getProgressColorClass = (progressValue) => {
      console.log('Progress değeri:', progressValue);
      
      if (progressValue >= 66.67) {
        return 'progress-orange';
      } else if (progressValue >= 33.33) {
        return 'progress-yellow';
      }
      return 'progress-green';
    };

    // Props'tan ve globalStore'dan hearts değerini izle
    watchEffect(() => {
      // Props'tan gelen hearts değerini kullan
      localHearts.value = props.hearts;

      // Eğer globalStore varsa ve hearts değeri farklıysa, globalStore'dan al
      if (window.globalStore && typeof window.globalStore.hearts !== 'undefined') {
        if (localHearts.value !== window.globalStore.hearts) {
          localHearts.value = window.globalStore.hearts;
        }
      }
    });

    // Hearts değerini güncellemek için global fonksiyon
    window.updateHeaderHearts = (value) => {
      localHearts.value = value;
    };

    return {
      localHearts,
      getProgressColorClass
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
}

.progress {
  width: 100%;
  height: 16px;
  background-color: var(--color-swan);
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1) inset;
}

.progress-bar-inner {
  background-color: var(--color-owl);
  height: 100%;
  border-radius: 8px;
  transition: width 0.5s ease-in-out, background-color 0.5s ease-in-out;
  box-shadow: 0 0 5px rgba(255, 75, 75, 0.5);
}

/* Progress renk sınıfları */
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

@keyframes pulse {
  0% {
    transform: scale(1);
  }

  50% {
    transform: scale(1.1);
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

@media (min-width: 700px) {
  .exercise-header {
    padding: 50px 40px 0;
  }
}
</style>
