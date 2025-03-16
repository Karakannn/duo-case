// useFillInBlank.js - Boşluk doldurma egzersizi composable'ı

(function() {
  const { ref, computed, watch } = Vue;

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
    
    // Bileşene özel state
    const sentence = ref('');
    const options = ref([]);
    const correctOption = ref('');
    const selectedOption = ref(null);
    
    // Egzersiz verilerini yükle
    const loadExerciseData = () => {
      if (exercise.exerciseData.value.question) {
        const questionData = exercise.exerciseData.value.question;
        
        sentence.value = questionData.sentence || '';
        options.value = questionData.options || [];
        correctOption.value = questionData.correctOption || '';
        
        // Seçimi sıfırla
        selectedOption.value = null;
      }
    };
    
    // Cümle parçalarını hesapla (metin ve boşluk)
    const sentenceParts = computed(() => {
      const parts = [];
      const blankIndex = sentence.value.indexOf('___');
      
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
        const afterBlank = sentence.value.substring(blankIndex + 3);
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
      sentence,
      options,
      selectedOption,
      sentenceParts,
      
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
