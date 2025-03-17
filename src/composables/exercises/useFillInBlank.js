// useFillInBlank.js - Boşluk doldurma egzersizi composable'ı

(function() {
  const { ref, computed } = Vue;

  window.useFillInBlank = function(props) {
    // Ortak egzersiz temelini kullan
    const exercise = window.useExercise(props, {
      exerciseType: 'fill-in-blank',
      defaultData: {
        sentence: 'I ___ to school every day.',
        options: ['go', 'went', 'going', 'gone'],
        correctOption: 'go'
      }
    });
    
    // State
    const sentence = ref('');
    const options = ref([]);
    const correctOption = ref('');
    const selectedOption = ref(null);
    
    // Init: Egzersiz verilerini yükle
    const init = () => {
      exercise.loadExerciseDataFromProps();
      
      if (exercise.exerciseData.value.question) {
        const questionData = exercise.exerciseData.value.question;
        sentence.value = questionData.sentence || '';
        options.value = questionData.options || [];
        correctOption.value = questionData.correctOption || '';
        selectedOption.value = null;
      }
    };
    
    // Cümle parçalarını hesapla
    const sentenceParts = computed(() => {
      const parts = [];
      const blankIndex = sentence.value.indexOf('___');
      
      if (blankIndex !== -1) {
        // Boşluktan önceki metin
        if (blankIndex > 0) {
          parts.push({ type: 'text', content: sentence.value.substring(0, blankIndex) });
        }
        
        // Boşluk
        parts.push({ type: 'blank', content: '' });
        
        // Boşluktan sonraki metin
        const afterBlank = sentence.value.substring(blankIndex + 3);
        if (afterBlank) {
          parts.push({ type: 'text', content: afterBlank });
        }
      } else {
        parts.push({ type: 'text', content: sentence.value });
      }
      
      return parts;
    });
    
    // Bir seçenek seç
    const selectOption = (option) => {
      selectedOption.value = option;
      exercise.updateCheckButton(true);
    };
    
    // Cevabı kontrol et
    const checkAnswer = () => {

      console.log('fill-in-blank checkAnswer', selectedOption.value);
      
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
      sentenceParts,
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
