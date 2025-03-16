// useExercise.js - Temel egzersiz kompozisyonu
// Tüm egzersiz türleri için ortak işlevselliği sağlar

(function () {
  const { ref, computed, watch } = Vue;

  window.useExercise = function (props, options = {}) {
    const { exerciseType = '', defaultData = {} } = options;

    // Ortak durum değişkenleri
    const exerciseData = ref({});
    const isCorrect = ref(false);
    
    // Egzersiz verilerini props'tan yükle
    const loadExerciseDataFromProps = () => {
      if (props.exerciseData?.type === exerciseType && props.exerciseData?.question) {
        exerciseData.value = props.exerciseData;
      } else {
        exerciseData.value = { type: exerciseType, question: defaultData };
      }
      
      // Exercise verisini global olarak paylaş (geriye dönük uyumluluk için)
      window.currentExercise = { ...exerciseData.value.question, type: exerciseType };
    };
    
    // Check button'u güncelle
    const updateCheckButton = (isValid) => {
      if (window.mainLayout) window.mainLayout.canCheck = isValid;
    };
    
    // Cevabı kontrol et
    const checkAnswer = (result) => {
      isCorrect.value = result.isCorrect;
      return result;
    };
    
    // Sonraki egzersiz
    const onContinue = () => {
      if (window.mainLayout?.nextExercise) window.mainLayout.nextExercise();
    };
    
    // Sonuç içeriğini hazırla
    const renderResultContent = (isCorrect, correctAnswer) => {
      return isCorrect
        ? `<p>Doğru cevap!</p>`
        : `<p>Doğru cevap: <strong>${correctAnswer}</strong></p>`;
    };

    return {
      exerciseData,
      isCorrect,
      loadExerciseDataFromProps,
      updateCheckButton,
      checkAnswer,
      onContinue,
      renderResultContent
    };
  };
})();
