// useWordMatch.js - Kelime Eşleştirme egzersizi composable'ı

(function() {
  const { ref } = Vue;

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
    
    // State
    const word = ref('');
    const options = ref([]);
    const correctOption = ref('');
    const selectedOption = ref(null);
    
    // Init: Egzersiz verilerini yükle
    const init = () => {
      exercise.loadExerciseDataFromProps();
      
      if (exercise.exerciseData.value.question) {
        const questionData = exercise.exerciseData.value.question;
        word.value = questionData.word || '';
        options.value = questionData.options || [];
        correctOption.value = questionData.correctOption || '';
        selectedOption.value = null;
      }
    };
    
    // Bir seçenek seç
    const selectOption = (option) => {
      selectedOption.value = option;
      
      // "Kontrol Et" butonunu aktifleştir
      if (window.mainLayout) {
        // window.mainLayout.canCheck bir ref objesi veya boolean değer olabilir
        if (typeof window.mainLayout.canCheck === 'object' && window.mainLayout.canCheck.value !== undefined) {
          window.mainLayout.canCheck.value = true;
        } else {
          window.mainLayout.canCheck = true;
        }
      }
    };
    
    // Cevabı kontrol et
    const checkAnswer = () => {
      const isCorrect = selectedOption.value === correctOption.value;
      return exercise.checkAnswer({
        isCorrect,
        userAnswer: selectedOption.value,
        correctAnswer: correctOption.value
      });
    };
    
    // Sonuç içeriğini oluştur
    const renderResultContent = (isCorrect) => {
      return exercise.renderResultContent(isCorrect, correctOption.value);
    };
    
    // Sonraki egzersiz
    const onContinue = exercise.onContinue;
    
    return {
      // State
      word,
      options,
      selectedOption,
      
      // Methods
      init,
      selectOption,
      checkAnswer,
      onContinue,
      renderResultContent
    };
  };
})();
