// usePictureMatch.js - Resim Eşleştirme egzersizleri için özel kompozisyon
(function() {
  const { ref, computed } = Vue;

  // Egzersiz tanımı
  const exerciseInfo = {
    id: 'picture-match',
    name: 'Resim Eşleştirme',
    description: 'Verilen kelimeye uygun resmi seçin',
    component: 'PictureMatchExercise',
    path: '/exercises/PictureMatchExercise.vue',
    icon: 'fa-solid fa-image'
  };

  // Doğrulama fonksiyonu
  function validatePictureMatch(params) {
    const { selectedPairs, correctPairs } = params;

    // Tüm eşleştirmelerin doğruluğunu kontrol et
    const allCorrect = correctPairs.every(pair => {
      const matchingPair = selectedPairs.find(selected => selected.id === pair.id);
      return matchingPair && matchingPair.matchId === pair.matchId;
    });

    return {
      isValid: selectedPairs.length === correctPairs.length,
      isCorrect: allCorrect,
      correctAnswer: correctPairs,
      feedbackMessage: allCorrect
        ? "Tebrikler, tüm resimleri doğru eşleştirdiniz."
        : "Yanlış eşleştirmeler var. Lütfen tekrar deneyin."
    };
  }

  // Kompozisyon
  window.usePictureMatch = function() {
    const selectedPairs = ref([]);
    const canCheck = computed(() => selectedPairs.value.length > 0);

    // Ana exercise kullanımını çağırma
    const baseExercise = window.useExercise({
      exerciseName: 'picture-match'
    });

    // Eşleştirme
    function matchItems(item1, item2) {
      // Eğer zaten eşleştirilmişse, kaldır
      const existingMatchIndex = selectedPairs.value.findIndex(
        pair => pair.id === item1.id || pair.matchId === item2.id
      );
      
      if (existingMatchIndex !== -1) {
        selectedPairs.value.splice(existingMatchIndex, 1);
      }
      
      // Yeni eşleştirmeyi ekle
      selectedPairs.value.push({
        id: item1.id,
        matchId: item2.id
      });
      
      baseExercise.updateMainLayout(canCheck.value);
    }

    // Eşleştirmeyi kaldır
    function removeMatch(pairId) {
      const index = selectedPairs.value.findIndex(pair => pair.id === pairId);
      if (index !== -1) {
        selectedPairs.value.splice(index, 1);
        baseExercise.updateMainLayout(canCheck.value);
      }
    }

    // Cevabı kontrol etme
    function checkAnswer() {
      return baseExercise.checkAnswer({
        selectedPairs: selectedPairs.value,
        correctPairs: window.currentExercise.correctPairs
      });
    }

    // Egzersizi sıfırlama
    function reset() {
      selectedPairs.value = [];
      baseExercise.reset();
    }

    return {
      ...baseExercise,
      selectedPairs,
      canCheck,
      matchItems,
      removeMatch,
      checkAnswer,
      reset
    };
  };

  // Global olarak egzersiz tanımını kaydet
  if (window.exerciseRegistry) {
    window.exerciseRegistry.register(exerciseInfo, validatePictureMatch);
  }
})();
