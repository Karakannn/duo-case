// useWordBuilder.js - Kelime İnşa Etme egzersizi composable'ı

(function() {
  const { ref, computed } = Vue;

  window.useWordBuilder = function(props) {
    // Ortak egzersiz temelini kullan
    const exercise = window.useExercise(props, {
      exerciseType: 'word-builder',
      defaultData: {
        sentence: 'I ____ an apple',
        correctWord: 'have',
        letters: ['a', 'e', 't', 'n', 'o', 'c', 'h', 'r', 'v', 'p', 'l']
      }
    });
    
    // State
    const sentence = ref('');
    const correctWord = ref('');
    const availableLetters = ref([]);
    const userWord = ref('');
    const usedLetterIndices = ref([]);
    
    // Init: Egzersiz verilerini yükle
    const init = () => {
      exercise.loadExerciseDataFromProps();
      
      if (exercise.exerciseData.value.question) {
        const questionData = exercise.exerciseData.value.question;
        sentence.value = questionData.sentence || '';
        correctWord.value = questionData.correctWord || '';
        availableLetters.value = questionData.letters || [];
        userWord.value = '';
        usedLetterIndices.value = [];
      }
    };
    
    // Cümle parçalarını hesapla
    const sentenceParts = computed(() => {
      const parts = [];
      const blankIndex = sentence.value.indexOf('____');
      
      if (blankIndex !== -1) {
        // Boşluktan önceki metin
        if (blankIndex > 0) {
          parts.push({ type: 'text', content: sentence.value.substring(0, blankIndex) });
        }
        
        // Boşluk
        parts.push({ type: 'blank', content: '' });
        
        // Boşluktan sonraki metin
        const afterBlank = sentence.value.substring(blankIndex + 4);
        if (afterBlank) {
          parts.push({ type: 'text', content: afterBlank });
        }
      } else {
        parts.push({ type: 'text', content: sentence.value });
      }
      
      return parts;
    });
    
    // Harf seç
    const selectLetter = (letter, index) => {
      if (usedLetterIndices.value.includes(index)) return;
      
      userWord.value += letter;
      usedLetterIndices.value.push(index);
      exercise.updateCheckButton(userWord.value.length > 0);
    };
    
    // Kelimeyi temizle
    const clearWord = () => {
      userWord.value = '';
      usedLetterIndices.value = [];
      exercise.updateCheckButton(false);
    };
    
    // Cevabı kontrol et
    const checkAnswer = () => {
      const isCorrect = userWord.value.toLowerCase() === correctWord.value.toLowerCase();
      return exercise.checkAnswer({
        isCorrect,
        userAnswer: userWord.value,
        correctAnswer: correctWord.value
      });
    };
    
    // Sonuç içeriğini oluştur
    const renderResultContent = (isCorrect) => {
      return exercise.renderResultContent(isCorrect, correctWord.value);
    };
    
    // Sonraki egzersiz
    const onContinue = exercise.onContinue;
    
    return {
      // State
      sentenceParts,
      availableLetters,
      userWord,
      usedLetterIndices,
      
      // Methods
      init,
      selectLetter,
      clearWord,
      checkAnswer,
      onContinue,
      renderResultContent
    };
  };
})();
