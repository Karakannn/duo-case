<template>
  <div v-if="show" class="completion-modal">
    <div class="confetti-container" ref="confettiContainer"></div>
    <div class="modal-content-container">
      <div class="modal-content">
        <div class="trophy-container">
          <img src="https://d35aaqx5ub95lt.cloudfront.net/images/goals/e07e459ea20aef826b42caa71498d85f.svg"
            alt="Trophy" class="trophy-icon">
        </div>

        <div class="message-container">
          <h2 class="title">Congratulations!</h2>
          <p class="subtitle">You have successfully completed all exercises.</p>
        </div>

        <button class="restart-button w-100" @click="$emit('restart')">
          RESTART
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';

const props = defineProps({
  show: {
    type: Boolean,
    required: true,
    default: false
  }
});

defineEmits(['restart']);
const confettiContainer = ref(null);

function createConfetti() {
  if (!confettiContainer.value) return;

  confettiContainer.value.innerHTML = '';

  const colors = ['#FF4B4B', '#58CC02', '#FFD700', '#1CB0F6', '#FF9600', '#A560E8'];
  const confettiCount = 150;

  for (let i = 0; i < confettiCount; i++) {
    const confetti = document.createElement('div');
    confetti.className = 'confetti-piece';
    confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
    confetti.style.left = Math.random() * 100 + 'vw';
    confetti.style.width = Math.random() * 10 + 5 + 'px';
    confetti.style.height = Math.random() * 10 + 5 + 'px';
    confetti.style.opacity = Math.random() + 0.5;
    confetti.style.animationDelay = Math.random() * 3 + 's';
    confetti.style.animationDuration = Math.random() * 3 + 2 + 's';

    confettiContainer.value.appendChild(confetti);
  }
}

watch(() => props.show, (newValue) => {
  if (newValue) setTimeout(createConfetti, 100);
});
</script>

<style scoped>
.completion-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  background-color: rgba(0, 0, 0, 0.4);
}

.confetti-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  pointer-events: none;
  z-index: 1;
}

.confetti-piece {
  position: absolute;
  top: -20px;
  border-radius: 4px;
  animation: confettiFall linear forwards;
}

@keyframes confettiFall {
  0% {
    transform: translateY(0) rotate(0deg);
    opacity: 1;
  }

  100% {
    transform: translateY(100vh) rotate(360deg);
    opacity: 0;
  }
}

.modal-content-container {
  padding: 30px;
  border-radius: 16px;
  margin: 24px;
  background-color: var(--color-snow);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
}

.modal-content {
  align-items: center;
  display: flex;
  background-color: var(--color-snow);
  flex-direction: column;
  min-width: 380px;
  width: 100%;
  border: none;
}

.trophy-icon {
  width: 100px;
  height: 100px;
  animation: trophyBounce 1s ease;
}

@keyframes trophyBounce {
  0% {
    transform: scale(0.5);
  }

  50% {
    transform: scale(1.2);
  }

  100% {
    transform: scale(1);
  }
}

.trophy-container {
  margin-bottom: 20px;
}

.message-container {
  margin: 20px 0;
}

.title {
  color: #58CC02;
  font-size: 28px;
  font-weight: bold;
  text-align: center;
  margin-bottom: 16px;
}

.subtitle {
  color: var(--color-eel);
  font-size: 17px;
  text-align: center;
}

.restart-button {
  background-color: var(--color-owl);
  color: white;
  border: none;
  border-radius: 12px;
  padding: 16px 24px;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  width: 100%;
  box-shadow: 0 4px 0 var(--color-owl);
  transition: all 0.2s;
}

.restart-button:hover {
  background-color: #61e002;
}

.restart-button:active {
  transform: translateY(2px);
  box-shadow: 0 2px 0 #58a700;
}
</style>