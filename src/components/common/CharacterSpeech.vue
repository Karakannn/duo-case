<template>
  <div class="character-container">
    <h5 v-if="title" class="character-title">{{ title }}</h5>

    <div class="character-container-inner">
      <div class="character-image" v-if="characterImage">
        <img :src="characterImage" alt="Character" class="character-img">
      </div>
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
  </div>
</template>

<script>
export default {
  name: 'CharacterSpeech',
  props: {
    text: {
      type: String,
      default: ''
    },
    characterImage: {
      type: String,
      default: ''
    },
    title: {
      type: String,
      default: ''
    }
  }
}
</script>

<style scoped>
.character-container {
  display: flex;
  flex-direction: column;
  align-items: start;
  justify-content: start;
  width: 100%;
  gap: 16px;
}

.character-title {
  color: rgb(241, 247, 251);
  font-size: 25px;
  line-height: 1.25;
  margin: 0;
  text-align: left;
  width: 100%;
  font-weight: 900;

}

.character-container-inner {
  display: flex;
  justify-content: start;
  align-items: center;
  position: relative;
  padding-left: 16px;
  gap: 16px;
}

.character-image {
  display: flex;
  align-items: center;
  justify-content: center;
}

.character-img {
  width: 80px;
  height: 80px;
  object-fit: contain;
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
  font-size: 20px;
  font-weight: 500;
  color: var(--color-eel);
}

@media (min-width: 700px) {

  .character-img {
    width: 120px;
    height: 120px;
  }

  .character-title {
    font-size: 32px;
  }

  .character-container {
    gap: 24px;
  }

  .character-container-inner {
    gap: 24px;
  }
}
</style>
