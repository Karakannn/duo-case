<template>
  <div class="title-container">
    <div v-if="category" class="category">
      <span>
        <svg height="32" preserveAspectRatio="xMidYMin slice" width="32"
          style="color: rgb(var(--color-beetle)); overflow: visible;" viewBox="0 0 33 32">
          <path fill-rule="evenodd" clip-rule="evenodd"
            d="M16.5 28C23.1274 28 28.5 22.6274 28.5 16C28.5 9.37258 23.1274 4 16.5 4C9.87258 4 4.5 9.37258 4.5 16C4.5 22.6274 9.87258 28 16.5 28ZM11.8184 14.0055C11.3302 13.5173 11.3302 12.7259 11.8184 12.2377L14.1165 9.9396C14.6046 9.45145 15.3961 9.45145 15.8843 9.9396L18.1823 12.2377C18.6705 12.7259 18.6705 13.5173 18.1823 14.0055L15.8843 16.3036C15.3961 16.7917 14.6046 16.7917 14.1165 16.3036L11.8184 14.0055ZM18.586 16.4145C18.1955 16.805 18.1955 17.4382 18.586 17.8287L19.6467 18.8893C20.0372 19.2799 20.6704 19.2799 21.0609 18.8893L22.1215 17.8287C22.5121 17.4382 22.5121 16.805 22.1215 16.4145L21.0609 15.3538C20.6704 14.9633 20.0372 14.9633 19.6467 15.3538L18.586 16.4145ZM14.9356 20.5646C14.6427 20.8575 14.6427 21.3324 14.9356 21.6253L15.6427 22.3324C15.9356 22.6253 16.4105 22.6253 16.7034 22.3324L17.4105 21.6253C17.7034 21.3324 17.7034 20.8575 17.4105 20.5646L16.7034 19.8575C16.4105 19.5646 15.9356 19.5646 15.6427 19.8575L14.9356 20.5646Z"
            fill="#CE82FF"></path>
        </svg>
      </span>
      {{ category }}
    </div>
    <h5 class="text-white">{{ title }}</h5>
    <div v-if="imageUrl" class="question-image-container">
      <img :src="imageUrl" class="question-image">
    </div>
  </div>
</template>

<script>
export default {
  name: 'ExerciseTitle',
  props: {
    title: {
      type: String,
      default: ''
    },
    category: {
      type: String,
      default: 'NEW WORD'
    },
    imageUrl: {
      type: String,
      default: ''
    }
  }
}
</script>

<style scoped>
.title-container {
  display: flex;
  flex-direction: column;
  align-items: start;
  gap: 8px;
  width: 100%;
}

.category {
  color: var(--color-beetle);
  font-weight: 900;
  font-size: 16px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.title-container h5 {
  color: var(--color-hare);
  text-align: left;
  font-size: 25px;
  line-height: 1.25;
  margin: 0;
  text-align: left;
  width: 100%;
  font-weight: 700;

}

.question-image-container {
  margin-top: 20px;
  display: flex;
  justify-content: center;
  width: 100%;
}

.question-image {
  max-width: 300px;
  max-height: 200px;
  object-fit: contain;
  border-radius: 8px;
  border: 2px solid rgba(255, 255, 255, 0.2);
}
</style>
