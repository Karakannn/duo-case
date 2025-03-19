<template>
  <div v-if="show" class="heart-lost-modal">
    <div class="modal-content-container">
      <div class="modal-content">
        <div class="hearts-display">
          <div v-for="(heart, index) in totalHearts" :key="index" class="heart-icon">
            <img :src="index < remainingHearts ? filledHeartIcon : emptyHeartIcon"
              :alt="index < remainingHearts ? 'Filled Heart' : 'Empty Heart'" />
          </div>
        </div>

        <div class="message-container">
          <h2 class="title">Each mistake costs 1 heart!</h2>
          <p class="subtitle">Be careful and stay focused to protect your hearts.<br>You can do this!</p>
        </div>

        <button class="continue-button w-100" @click="handleContinue">
          CONTINUE
        </button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'HeartLostModal',
  props: {
    show: {
      type: Boolean,
      required: true,
      default: false
    },
    remainingHearts: {
      type: Number,
      default: 4
    },
    totalHearts: {
      type: Number,
      default: 5
    }
  },
  emits: ['continue'],
  setup(props, { emit }) {
    const filledHeartIcon = "https://d35aaqx5ub95lt.cloudfront.net/images/hearts/7631e3ee734dd4fe7792626b59457fa4.svg";
    const emptyHeartIcon = "https://d35aaqx5ub95lt.cloudfront.net/images/hearts/e38b9a1ee10d36ff6e57a66ae97e91ff.svg";

    function handleContinue() {
      emit('continue');
    }

    return {
      filledHeartIcon,
      emptyHeartIcon,
      handleContinue
    };
  }
}
</script>

<style scoped>
.heart-lost-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  background-color: rgb(0 0 0 / 40%);
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

.hearts-display {
  display: flex;
  justify-content: center;
}

.heart-icon {
  margin: 0 5px;
}

.heart-icon img {
  width: 32px;
  height: 32px;
}

.message-container {
  margin: 32px 0;
}

.title {
  color: var(--color-eel);
  font-size: 25px;
  font-weight: bold;
  margin-bottom: 16px;
  text-align: center;
}

.subtitle {
  color: var(--color-wolf);
  font-size: 17px;
  text-align: center;
}

.continue-button {
  background-color: #58cc02;
  color: white;
  border: none;
  border-radius: 12px;
  padding: 16px 24px;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  width: 100%;
  box-shadow: 0 4px 0 #58a700;
  transition: all 0.2s;
}

.continue-button:hover {
  background-color: #61e002;
}

.continue-button:active {
  transform: translateY(2px);
  box-shadow: 0 2px 0 #58a700;
}
</style>