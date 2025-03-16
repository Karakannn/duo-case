// useWordBuilder.js - Kelime İnşa Etme egzersizi composable'ı

(function() {
  const { ref, computed, watch } = Vue;

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
    
    // Bileşene özel state
    const sentence = ref('');
    const correctWord = ref('');
    const availableLetters = ref([]);
    const userWord = ref('');
    const usedLetterIndices = ref([]);
    
    // Egzersiz verilerini yükle
    const loadExerciseData = () => {
      if (exercise.exerciseData.value.question) {
        const questionData = exercise.exerciseData.value.question;
        
        sentence.value = questionData.sentence || '';
        correctWord.value = questionData.correctWord || '';
        availableLetters.value = questionData.letters || [];
        
        // Kullanıcı girdisini sıfırla
        userWord.value = '';
        usedLetterIndices.value = [];
      }
    };
    
    // Cümle parçalarını hesapla (metin ve boşluk)
    const sentenceParts = computed(() => {
      const parts = [];
      const blankIndex = sentence.value.indexOf('____');
      
      if (blankIndex !== -1) {
        // Boşluktan önceki metin
        if (blankIndex > 0) {
          parts.push({
            type: 'text',
            content: sentence.value.substring(0, blankIndex)
          });
        }
        
        // Boşluk
        parts.push({
          type: 'blank',
          content: ''
        });
        
        // Boşluktan sonraki metin
        const afterBlank = sentence.value.substring(blankIndex + 4);
        if (afterBlank) {
          parts.push({
            type: 'text',
            content: afterBlank
          });
        }
      } else {
        // Boşluk bulunamadı, tam cümleyi göster
        parts.push({
          type: 'text',
          content: sentence.value
        });
      }
      
      return parts;
    });
    
    // Harf seç
    const selectLetter = (letter, index) => {
      // Eğer harf zaten kullanılmışsa atla
      if (usedLetterIndices.value.includes(index)) return;
      
      // Kullanıcı kelimesine ekle
      userWord.value += letter;
      usedLetterIndices.value.push(index);
      
      // Check butonunu aktifleştir
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
      
      const result = {
        isCorrect,
        userAnswer: userWord.value,
        correctAnswer: correctWord.value
      };
      
      return exercise.checkAnswer(result);
    };
    
    // Sonuç içeriğini oluştur
    const renderResultContent = (isCorrect) => {
      return exercise.renderResultContent(isCorrect, correctWord.value);
    };
    
    // Props değişikliğini izle ve veriyi yükle
    watch(() => props.exerciseData, () => {
      exercise.loadExerciseDataFromProps();
      loadExerciseData();
    }, { deep: true, immediate: true });
    
    return {
      // State
      sentence,
      availableLetters,
      userWord,
      usedLetterIndices,
      sentenceParts,
      
      // Methods
      selectLetter,
      clearWord,
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
