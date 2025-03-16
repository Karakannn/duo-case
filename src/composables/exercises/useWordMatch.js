// useWordMatch.js - Kelime Eşleştirme egzersizi composable'ı

(function() {
  const { ref, computed, watch } = Vue;

  window.useWordMatch = function(props) {
    // Ortak egzersiz temelini kullan
    const exercise = window.useExercise(props, {
      exerciseType: 'word-match',
      defaultData: {
        word: 'apple',
        options: ['elma', 'armut', 'muz', 'kiraz'],
        correctOption: 'elma'
      }
    });
    
    // Bileşene özel state
    const word = ref('');
    const options = ref([]);
    const correctOption = ref('');
    const selectedOption = ref(null);
    
    // Egzersiz verilerini yükle
    const loadExerciseData = () => {
      if (exercise.exerciseData.value.question) {
        const questionData = exercise.exerciseData.value.question;
        
        word.value = questionData.word || '';
        options.value = questionData.options || [];
        correctOption.value = questionData.correctOption || '';
        
        // Seçimi sıfırla
        selectedOption.value = null;
      }
    };
    
    // Bir seçenek seç
    const selectOption = (option) => {
      selectedOption.value = option;
      
      // Check butonunu aktifleştir
      exercise.updateCheckButton(true);
    };
    
    // Cevabı kontrol et
    const checkAnswer = () => {
      const isCorrect = selectedOption.value === correctOption.value;
      
      const result = {
        isCorrect,
        userAnswer: selectedOption.value,
        correctAnswer: correctOption.value
      };
      
      return exercise.checkAnswer(result);
    };
    
    // Sonuç içeriğini oluştur
    const renderResultContent = (isCorrect) => {
      return exercise.renderResultContent(isCorrect, correctOption.value);
    };
    
    // Props değişikliğini izle ve veriyi yükle
    watch(() => props.exerciseData, () => {
      exercise.loadExerciseDataFromProps();
      loadExerciseData();
    }, { deep: true, immediate: true });
    
    return {
      // State
      word,
      options,
      selectedOption,
      
      // Methods
      selectOption,
      checkAnswer,
      onContinue: exercise.onContinue,
      renderResultContent,
      
      // Initial Setup
      init: () => {
        exercise.loadExerciseDataFromProps();
        loadExerciseData();
      }
    };
  };
})();
