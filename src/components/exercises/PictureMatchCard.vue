<template>
  <div class="picture-match-card" :class="{ 'selected': isSelected }" @click="onSelect">
    <div class="card-image-container">
      <div class="card-image" :style="{ backgroundImage: `url(${option.imageUrl})` }"></div>
    </div>
    <div class="card-text-container">
      <span class="card-text">{{ option.name }}</span>
      <span class="card-text-index">{{ index }}</span>
    </div>
  </div>
</template>

<script>
export default {
  name: 'PictureMatchCard',
  props: {
    option: {
      type: Object,
      required: true,
      default: () => ({})
    },
    isSelected: {
      type: Boolean,
      default: false
    },
    index: {
      type: [Number, String],
      default: 1
    }
  },
  emits: ['select'],
  setup(props, { emit }) {
    const onSelect = () => {
      emit('select', props.option);
    };

    return {
      onSelect
    };
  }
}
</script>

<style scoped>
.picture-match-card {
  color: var(--color-eel);
  flex-direction: column;
  font-size: 19px;
  padding: 12px;
  border: solid transparent;
  border-radius: 12px;
  border-width: 2px 2px 4px;
  cursor: pointer;
  display: inline-flex;
  outline: 0;
  position: relative;
  touch-action: manipulation;
  transform: translateZ(0);
  user-select: none;
  height: fit-content;
}

.picture-match-card::before {
  background-color: var(--color-snow);
  border: 3px solid var(--color-swan);
  border-radius: 12px;
  bottom: -2px;
  box-shadow: 0 2px 0 var(--color-swan);
  content: "";
  left: -2px;
  position: absolute;
  right: -2px;
  top: -2px;
  z-index: -1;
}

.picture-match-card:hover::before {
  background-color: var(--color-polar);
}

.picture-match-card.selected {
  color: var(--color-whale);
}

.picture-match-card:active {
  transform: translateY(2px) translateZ(0);

}

.picture-match-card.selected::before {
  background-color: var(--color-iguana);
  color: var(--color-whale) !important;

  border-color: var(--color-blue-jay);
}

.picture-match-card.selected .card-text-index {
  color: var(--color-whale) !important;
  border-width: 3px;
  border-color: var(--color-blue-jay);
}

.card-image-container {
  align-items: center;
  display: flex;
  flex-direction: column;
  justify-content: center;
  width: 100%;

}

.card-image {
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  width: 100%;
  height: 160px;
  background-position: 50%;
  background-repeat: no-repeat;
  background-size: contain;
  margin: 0 0 10px;
  border-radius: 8px;
}

.card-text-container {
  width: 100%;
  align-items: center;
  display: flex;
  justify-content: space-between;
}

.card-text {
  font-size: 19px;
  font-weight: 500;
}

.card-text-index {
  display: inline-flex;
  align-items: center;
  border: 3px solid var(--color-swan);
  border-radius: 8px;
  color: var(--color-hare);
  font-size: 15px;
  height: 30px;
  justify-content: center;
  width: 30px;
  flex-shrink: 0;
  font-weight: 900;

}

@media (min-width: 700px) {
  .picture-match-card {
    padding: 24px;
  }
}
</style>
