// useTextInput.js - Metin Girişi egzersizi composable'ı

(function() {
  const { ref } = Vue;

  window.useTextInput = function(props) {
    // Ortak egzersiz temelini kullan
    const exercise = window.useExercise(props, {
      exerciseType: 'text-input',
      defaultData: {
        prompt: 'Translate this sentence',
        correctText: 'Bu cümleyi çevirin',
        allowPartialMatch: true
      }
    });
    
    // State
    const prompt = ref('');
    const correctText = ref('');
    const allowPartialMatch = ref(false);
    const userInput = ref('');
    
    // Init: Egzersiz verilerini yükle
    const init = () => {
      exercise.loadExerciseDataFromProps();
      
      if (exercise.exerciseData.value.question) {
        const questionData = exercise.exerciseData.value.question;
        prompt.value = questionData.prompt || '';
        correctText.value = questionData.correctText || '';
        allowPartialMatch.value = questionData.allowPartialMatch || false;
        userInput.value = '';
      }
    };
    
    // Metni normalize et (küçük harf, boşlukları temizle)
    const normalize = (text) => text.toLowerCase().replace(/\s+/g, ' ').trim();
    
    // Kullanıcı girişini güncelle
    const updateInput = (text) => {
      userInput.value = text;
      exercise.updateCheckButton(text.length > 0);
    };
    
    // Cevabı kontrol et
    const checkAnswer = () => {

      console.log('text-input checkAnswer', userInput.value);
      // Metinleri normalize et
      const normalizedInput = normalize(userInput.value);
      const normalizedCorrect = normalize(correctText.value);
      
      let isCorrect = false;
      
      if (allowPartialMatch.value) {
        // Kısmi eşleşme - ana kelimeleri içeriyor mu?
        const correctWords = normalizedCorrect.split(' ');
        const inputWords = normalizedInput.split(' ');
        const requiredWords = correctWords.filter(word => word.length > 3); // Önemli kelimeleri filtrele
        
        isCorrect = requiredWords.every(word => inputWords.includes(word));
      } else {
        // Tam eşleşme
        isCorrect = normalizedInput === normalizedCorrect;
      }
      
      return exercise.checkAnswer({
        isCorrect,
        userAnswer: userInput.value,
        correctAnswer: correctText.value
      });
    };
    
    // Sonuç içeriğini oluştur
    const renderResultContent = (isCorrect) => {
      return exercise.renderResultContent(isCorrect, correctText.value);
    };
    
    // Sonraki egzersiz
    const onContinue = exercise.onContinue;
    
    return {
      // State
      prompt,
      userInput,
      
      // Methods
      init,
      updateInput,
      checkAnswer,
      onContinue,
      renderResultContent
    };
  };
})();
