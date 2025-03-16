<template>
  <div class="exercise-component">
    <div class="prompt-container mb-4">
      <div class="character-image me-3">
        <img src="/src/assets/images/character.svg" alt="Character" class="img-fluid" style="height: 100px;">
      </div>
      <div class="prompt-badge bg-light p-3 rounded-3 shadow-sm">
        {{ prompt }}
      </div>
    </div>
    
    <div class="input-container">
      <textarea 
        v-model="userInput"
        class="form-control mb-3"
        rows="3"
        :placeholder="placeholder"
        @input="onInputChange"
      ></textarea>
    </div>
  </div>
</template>

<script>
export default {
  name: 'TextInputExercise',
  props: {
    exerciseData: {
      type: Object,
      default: () => ({})
    }
  },
  setup(props) {
    const { ref, onMounted, watchEffect } = Vue;
    
    // Ortak egzersiz composable'ını kullan
    const exercise = window.useExercise(props, {
      exerciseType: 'text-input',
      defaultData: {
        prompt: 'Çevir: "The cat is black"',
        correctAnswer: 'Kedi siyahtır'
      }
    });
    
    // Bileşene özel state
    const prompt = ref('');
    const correctAnswer = ref('');
    const userInput = ref('');
    const placeholder = ref('Cevabınızı buraya yazın...');
    
    // Egzersiz verilerini yükle
    const loadExerciseData = () => {
      if (exercise.exerciseData.value.question) {
        const questionData = exercise.exerciseData.value.question;
        
        prompt.value = questionData.prompt || '';
        correctAnswer.value = questionData.correctAnswer || '';
        
        // Kullanıcı girdisini sıfırla
        userInput.value = '';
      }
    };
    
    // Girdi değişikliklerini işle
    const onInputChange = () => {
      exercise.updateCheckButton(userInput.value.trim().length > 0);
    };
    
    // Cevabı kontrol et
    const checkAnswer = () => {
      // Karşılaştırma için cevapları normalleştir (küçük harf, boşluk temizleme)
      const normalizedUserAnswer = userInput.value.trim().toLowerCase();
      const normalizedCorrectAnswer = correctAnswer.value.trim().toLowerCase();
      
      // Eşleşme kontrolü
      const isCorrect = normalizedUserAnswer === normalizedCorrectAnswer;
      
      const result = {
        isCorrect,
        userAnswer: userInput.value,
        correctAnswer: correctAnswer.value
      };
      
      return exercise.checkAnswer(result);
    };
    
    // Sonuç içeriğini oluştur
    const renderResultContent = (isCorrect) => {
      return exercise.renderResultContent(isCorrect, correctAnswer.value);
    };
    
    // Bileşen yüklendiğinde
    onMounted(() => {
      // Verileri yükle
      exercise.loadExerciseDataFromProps();
      loadExerciseData();
      
      // Global API'yi ayarla
      window.activeExerciseComponent = {
        checkAnswer,
        onContinue: exercise.onContinue,
        renderResultContent
      };
    });
    
    // Props değişimini izle
    watchEffect(() => {
      if (props.exerciseData) {
        loadExerciseData();
      }
    });
    
    return {
      prompt,
      userInput,
      placeholder,
      onInputChange
    };
  }
}
</script>

<style scoped>
.prompt-container {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 2rem;
}

.prompt-badge {
  color: #333;
  font-size: 1.1rem;
  line-height: 1.5;
  max-width: 500px;
}

.input-container {
  max-width: 600px;
  margin: 0 auto;
}

textarea.form-control {
  font-size: 1.1rem;
  padding: 12px;
  border: 2px solid #ddd;
  border-radius: 10px;
  transition: all 0.3s ease;
}

textarea.form-control:focus {
  border-color: #58cc02;
  box-shadow: 0 0 0 0.2rem rgba(88, 204, 2, 0.25);
}
</style>
