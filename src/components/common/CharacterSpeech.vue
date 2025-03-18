<template>
  <div class="character-container">
    <div class="speech-bubble-container">
      <div class="speech-bubble">
        <span class="word-text">{{ text }}</span>
      </div>
      <svg class="speech-icon" height="20" viewBox="0 0 18 20">
        <path class="speech-icon-path"
          d="M2.00358 19.0909H18V0.909058L0.624575 15.9561C-0.682507 17.088 0.198558 19.0909 2.00358 19.0909Z">
        </path>
        <path class="speech-icon-path" clip-rule="evenodd"
          d="M18 2.48935V0L0.83037 15.6255C-0.943477 17.2398 0.312833 20 2.82143 20H18V18.2916H16.1228H2.82143C1.98523 18.2916 1.56646 17.3716 2.15774 16.8335L16.1228 4.12436L18 2.48935Z"
          fill-rule="evenodd"></path>
      </svg>
    </div>
  </div>
</template>

<script>
export default {
  name: 'CharacterSpeech',
  props: {
    text: {
      type: String,
      default: ''
    }
  }
}
</script>

<style scoped>
.character-container {
  display: flex;
  justify-content: start;
  align-items: flex-start;
  position: relative;
  margin: 20px 0 30px;
  width: 100%;
}

.speech-bubble-container {
  position: relative;
}

.speech-bubble {
  background: var(--color-snow);
  border: 2px solid var(--color-swan);
  border-radius: 12px;
  color: var(--color-eel);
  font-size: 1.25rem;
  font-weight: 500;
  line-height: 2rem;
  padding: 10px 14px;
}

.speech-icon {
  position: absolute;
  left: -16px;
  top: 50%;
  transform: translateY(-50%);
  top: 32px;
  color: var(--color-eel);
}

.speech-icon-path {
  fill: var(--color-snow);
  stroke: var(--color-swan);
}

.word-text {
  font-size: 24px;
  font-weight: 700;
  color: var(--color-eel);
}
</style>
