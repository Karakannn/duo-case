// useExercise.js - Temel egzersiz kompozisyonu 
// Tüm egzersiz türleri için ortak işlevselliği sağlar

(function () {
  const { ref, computed, watch } = Vue;

  // Global olarak erişilebilir Exercise yönetim composable
  window.useExercise = function (props, options = {}) {
    const { exerciseType = '', defaultData = {} } = options;

    // Ortak durum değişkenleri
    const isCorrect = ref(false);
    const showResult = ref(false);
    const userAnswer = ref(null);
    
    // Props'tan egzersiz verisi
    const exerciseData = ref({});
    
    // Egzersiz verilerini props'tan yükle
    const loadExerciseDataFromProps = () => {
      if (props.exerciseData && props.exerciseData.type === exerciseType && props.exerciseData.question) {
        // Geçerli props datası varsa onu kullan
        exerciseData.value = props.exerciseData;
        console.log(`${exerciseType} exercise loaded with props data:`, props.exerciseData);
      } else {
        // Yoksa varsayılan değerleri kullan
        exerciseData.value = { 
          type: exerciseType, 
          question: defaultData 
        };
        console.warn(`No valid ${exerciseType} exercise data in props, using defaults`);
      }
      
      // Egzersiz verilerini global olarak paylaş
      window.currentExercise = {
        ...exerciseData.value.question,
        type: exerciseType
      };
      
      // Kullanıcı cevabını sıfırla
      userAnswer.value = null;
      
      // Diğer değerleri sıfırla
      isCorrect.value = false;
      showResult.value = false;
    };
    
    // Check button'u aktifleştir/pasifleştir
    const updateCheckButton = (isValid) => {
      if (window.mainLayout) {
        window.mainLayout.canCheck = isValid;
      }
    };
    
    // Cevabı kontrol et (her bileşen kendi implementasyonunu sağlar)
    const checkAnswer = (result) => {
      isCorrect.value = result.isCorrect;
      userAnswer.value = result.userAnswer;
      
      return {
        isCorrect: isCorrect.value,
        correctAnswer: result.correctAnswer,
        userAnswer: userAnswer.value
      };
    };
    
    // Sonraki egzersiz
    const onContinue = () => {
      // Cevabı sıfırla
      userAnswer.value = null;
      
      // Sonraki egzersize geç
      if (window.mainLayout?.nextExercise) {
        window.mainLayout.nextExercise();
      }
    };
    
    // Sonuç içeriğini hazırla
    const renderResultContent = (isCorrect, correctAnswer) => {
      return isCorrect
        ? `<p>Doğru cevap!</p>`
        : `<p>Doğru cevap: <strong>${correctAnswer}</strong></p>`;
    };
    
    // Props değişikliğini izle
    watch(() => props.exerciseData, (newData) => {
      loadExerciseDataFromProps();
    }, { deep: true });

    return {
      // State
      exerciseData,
      isCorrect,
      showResult,
      userAnswer,
      
      // Methods
      loadExerciseDataFromProps,
      updateCheckButton,
      checkAnswer,
      onContinue,
      renderResultContent
    };
  };
})();
