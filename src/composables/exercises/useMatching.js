// useMatching.js - Eşleştirme egzersizi kompozisyonu
(function() {
  const { ref, computed } = Vue;

  window.useMatching = function(props = {}) {
    // Ortak egzersiz temelini kullan
    const exercise = window.useExercise(props, {
      exerciseType: 'matching',
      defaultData: {
        leftItems: [
          { id: 1, text: "elma" },
          { id: 2, text: "araba" },
          { id: 3, text: "ev" },
          { id: 4, text: "kitap" },
          { id: 5, text: "bilgisayar" }
        ],
        rightItems: [
          { id: 1, text: "apple" },
          { id: 2, text: "car" },
          { id: 3, text: "house" },
          { id: 4, text: "book" },
          { id: 5, text: "computer" }
        ],
        correctMatches: [
          { leftId: 1, rightId: 1 },
          { leftId: 2, rightId: 2 },
          { leftId: 3, rightId: 3 },
          { leftId: 4, rightId: 4 },
          { leftId: 5, rightId: 5 }
        ]
      }
    });
    
    // State
    const leftItems = ref([]);
    const rightItems = ref([]);
    const correctMatches = ref([]);
    const userMatches = ref([]);
    const isComplete = computed(() => userMatches.value.length === leftItems.value.length);
    
    // Init: Egzersiz verilerini yükle
    const init = () => {
      // Egzersiz verilerini yükle
      if (!props.exerciseData) {
        // Eğer props.exerciseData yoksa, global değişkenden veri almayı dene
        if (window.currentExerciseData && window.currentExerciseData.type === 'matching') {
          exercise.exerciseData.value = window.currentExerciseData;
        } else {
          // Varsayılan veriyi kullan
          exercise.exerciseData.value = { 
            type: 'matching', 
            question: exercise.defaultData 
          };
        }
      } else {
        exercise.loadExerciseDataFromProps();
      }
      
      // Veriyi state'e yükle
      if (exercise.exerciseData.value && exercise.exerciseData.value.question) {
        const questionData = exercise.exerciseData.value.question;
        leftItems.value = questionData.leftItems || [];
        rightItems.value = questionData.rightItems || [];
        correctMatches.value = questionData.correctMatches || [];
        userMatches.value = [];
      }
      
      // Kontrol butonunu devre dışı bırak
      if (window.mainLayout) {
        window.mainLayout.canCheck = false;
      }
    };
    
    // İki öğenin doğru eşleşip eşleşmediğini kontrol et
    const checkPair = (leftId, rightId) => {
      return correctMatches.value.some(match => 
        match.leftId === leftId && match.rightId === rightId
      );
    };
    
    // İki öğeyi eşleştir
    const matchItems = (leftItem, rightItem) => {
      // Eğer öğeler zaten eşleştirilmişse, işlem yapma
      if (userMatches.value.some(match => 
        match.leftId === leftItem.id && match.rightId === rightItem.id
      )) {
        return;
      }
      
      // Eşleştirmeyi kaydet
      userMatches.value.push({
        leftId: leftItem.id,
        rightId: rightItem.id
      });
      
      // Tüm öğeler eşleştirildi mi kontrol et
      if (isComplete.value) {
        // Kontrol butonunu etkinleştir
        if (window.mainLayout) {
          window.mainLayout.canCheck = true;
        }
      }
    };
    
    // Can azalt
    const decreaseHeart = () => {
      console.log('useMatching - decreaseHeart çağrıldı');
      
      // StepStore'a erişim için birkaç farklı yol dene
      if (window.stepStore) {
        console.log('useMatching - window.stepStore.decreaseHearts çağrılıyor');
        window.stepStore.decreaseHearts();
      } else if (window.useStepStore) {
        // Global stepStore'u kullan
        console.log('useMatching - window.useStepStore() kullanılıyor');
        const stepStore = window.useStepStore();
        stepStore.decreaseHearts();
      } else if (window.mainLayout && window.mainLayout.stepStore) {
        // mainLayout üzerinden stepStore'a eriş
        console.log('useMatching - window.mainLayout.stepStore.decreaseHearts çağrılıyor');
        window.mainLayout.stepStore.decreaseHearts();
      } else {
        console.log('useMatching - Hiçbir stepStore bulunamadı!');
      }
    };
    
    // Cevabı kontrol et
    const checkAnswer = () => {
      // Tüm eşleştirmelerin doğru olup olmadığını kontrol et
      const allCorrect = userMatches.value.every(userMatch => {
        return correctMatches.value.some(correctMatch => 
          correctMatch.leftId === userMatch.leftId && 
          correctMatch.rightId === userMatch.rightId
        );
      });
      
      // Sonucu kaydet
      exercise.checkAnswer({ isCorrect: allCorrect });
      
      return { isCorrect: allCorrect };
    };
    
    // Sonuç içeriğini hazırla
    const renderResultContent = () => {
      if (exercise.isCorrect.value) {
        return `<p>Harika! Tüm eşleştirmeleri doğru yaptınız.</p>`;
      } else {
        return `<p>Bazı eşleştirmeler yanlış. Tekrar deneyin.</p>`;
      }
    };
    
    // Egzersizi sıfırla
    const reset = () => {
      userMatches.value = [];
      
      // Kontrol butonunu devre dışı bırak
      if (window.mainLayout) {
        window.mainLayout.canCheck = false;
      }
    };
    
    return {
      ...exercise,
      leftItems,
      rightItems,
      correctMatches,
      userMatches,
      isComplete,
      init,
      checkPair,
      matchItems,
      decreaseHeart,
      checkAnswer,
      renderResultContent,
      reset
    };
  };
})();
