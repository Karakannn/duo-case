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
        correctAnswer: 'go'
      }
    });
    
    // State
    const sentence = ref('');
    const options = ref([]);
    const correctAnswer = ref('');
    const selectedOption = ref(null);
    
    // Init: Egzersiz verilerini yükle
    const init = () => {
      exercise.loadExerciseDataFromProps();
      
      console.log('FillInBlank init - Raw exercise data:', JSON.stringify(exercise.exerciseData.value));
      
      if (exercise.exerciseData.value.question) {
        const questionData = exercise.exerciseData.value.question;
        console.log('FillInBlank init - Question data:', JSON.stringify(questionData));
        
        sentence.value = questionData.sentence || '';
        options.value = questionData.options || [];
        
        // Düzeltme: Hem correctOption hem de correctAnswer property'lerini kontrol et
        correctAnswer.value = questionData.correctAnswer || '';
        console.log('FillInBlank init - Correct answer set to:', correctAnswer.value);
        
        selectedOption.value = null;
        
        // Başlangıçta check button'u devre dışı bırak
        exercise.updateCheckButton(false);
        console.log('FillInBlank init - Check button disabled initially');
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
      console.log('selectOption called with:', option);
      selectedOption.value = option;
      
      // Check button'u güncelle - sadece bir kelime seçiliyse aktif olsun
      const isValid = option !== null && option !== undefined;
      console.log('Updating check button state:', isValid);
      exercise.updateCheckButton(isValid);
    };
    
    // Cevabı kontrol et
    const checkAnswer = () => {
      console.log('fill-in-blank checkAnswer called');
      console.log('Selected option:', selectedOption.value);
      console.log('Correct answer:', correctAnswer.value);
      
      // Detaylı karşılaştırma logu
      console.log('Type of selected option:', typeof selectedOption.value);
      console.log('Type of correct answer:', typeof correctAnswer.value);
      console.log('Strict equality check (===):', selectedOption.value === correctAnswer.value);
      console.log('Loose equality check (==):', selectedOption.value == correctAnswer.value);
      console.log('Case-insensitive comparison:', 
        selectedOption.value && correctAnswer.value && 
        selectedOption.value.toLowerCase() === correctAnswer.value.toLowerCase());
      
      // Eşleşme kontrolü - case-insensitive olarak da kontrol et
      const isExactMatch = selectedOption.value === correctAnswer.value;
      const isCaseInsensitiveMatch = 
        selectedOption.value && 
        correctAnswer.value && 
        selectedOption.value.toLowerCase() === correctAnswer.value.toLowerCase();
      
      const isCorrect = isExactMatch || isCaseInsensitiveMatch;
      console.log('Is answer correct?', isCorrect, 
        '(Exact match:', isExactMatch, 
        ', Case-insensitive match:', isCaseInsensitiveMatch, ')');
      
      return exercise.checkAnswer({
        isCorrect,
        userAnswer: selectedOption.value,
        correctAnswer: correctAnswer.value
      });
    };
    
    // Sonuç içeriğini oluştur
    const renderResultContent = (isCorrect) => {
      return exercise.renderResultContent(isCorrect, correctAnswer.value);
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
