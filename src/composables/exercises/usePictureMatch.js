// usePictureMatch.js - Resim Eşleştirme egzersizi composable'ı
(function() {
  const { ref } = Vue;

  window.usePictureMatch = function(props) {
    // Ortak egzersiz temelini kullan
    const exercise = window.useExercise(props, {
      exerciseType: 'picture-match',
      defaultData: {
        imageUrl: '/images/question/dog.jpg',
        options: [
          { name: 'köpek', imageUrl: '/images/options/dog.jpg' },
          { name: 'kedi', imageUrl: '/images/options/cat.jpg' }
        ],
        correctOption: 'köpek'
      }
    });
    
    // State
    const questionImageUrl = ref('');
    const options = ref([]);
    const correctOption = ref('');
    const selectedOption = ref(null);
    
    // Init: Egzersiz verilerini yükle
    const init = () => {
      exercise.loadExerciseDataFromProps();
      
      if (exercise.exerciseData.value.question) {
        const questionData = exercise.exerciseData.value.question;
        questionImageUrl.value = questionData.imageUrl || '';
        options.value = questionData.options || [];
        correctOption.value = questionData.correctOption || '';
        selectedOption.value = null;
      }
    };
    
    // Bir seçenek seç
    const selectOption = (option) => {
      selectedOption.value = option.name;
      exercise.updateCheckButton(true);
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
      questionImageUrl,
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

  // Egzersiz türünü global olarak kaydet (eğer kaydedilmemişse)
  if (window.exerciseTypes && !window.exerciseTypes.find(e => e.id === 'picture-match')) {
    window.exerciseTypes.push({
      id: 'picture-match',
      name: 'Resim Eşleştirme',
      description: 'Verilen görüntüye uygun kelimeyi seçin',
      component: 'PictureMatchExercise',
      icon: 'fa-solid fa-image'
    });
  }
})();
