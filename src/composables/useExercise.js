// useExercise.js - Tek bir yerden tüm egzersiz türlerini yönetmek için composable
(function() {
  const { ref, computed, reactive, readonly, watch } = Vue;

  // Egzersiz türlerine özel cevap doğrulama fonksiyonları - merkezi doğrulama mantığı
  const exerciseValidators = {
    // WordMatch egzersiz kontrolü
    'word-match': (params) => {
      const { selectedOption, correctOption } = params;
      return {
        isValid: selectedOption !== null && selectedOption !== undefined,
        isCorrect: selectedOption === correctOption,
        correctAnswer: correctOption,
        feedbackMessage: selectedOption === correctOption
          ? "Tebrikler, doğru çeviriyi buldunuz."
          : `Yanlış cevap. Doğru çeviri: ${correctOption}`
      };
    },
    
    // Fill-in-Blank egzersiz kontrolü
    'fill-in-blank': (params) => {
      const { selectedOption, correctOption } = params;
      return {
        isValid: selectedOption !== null && selectedOption !== undefined,
        isCorrect: selectedOption === correctOption,
        correctAnswer: correctOption,
        feedbackMessage: selectedOption === correctOption
          ? "Tebrikler, doğru cevabı seçtiniz."
          : `Yanlış cevap. Doğru cevap: ${correctOption}`
      };
    },
    
    // WordBuilder egzersiz kontrolü
    'word-builder': (params) => {
      const { builtSentence, correctSentence } = params;
      // Boşlukları ve noktalama işaretlerini temizleyerek karşılaştır
      const normalize = (text) => text.toLowerCase().replace(/\s+/g, ' ').trim();
      const normalizedBuilt = normalize(builtSentence);
      const normalizedCorrect = normalize(correctSentence);
      
      return {
        isValid: builtSentence.length > 0,
        isCorrect: normalizedBuilt === normalizedCorrect,
        correctAnswer: correctSentence,
        feedbackMessage: normalizedBuilt === normalizedCorrect
          ? "Tebrikler, cümleyi doğru bir şekilde oluşturdunuz."
          : `Yanlış cevap. Doğru cümle: "${correctSentence}"`
      };
    },
    
    // PictureMatch egzersiz kontrolü
    'picture-match': (params) => {
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
    },
    
    // TextInput egzersiz kontrolü
    'text-input': (params) => {
      const { userInput, correctText, allowPartialMatch = false } = params;
      
      // Metinleri normalize et (küçük harf, boşlukları temizle)
      const normalize = (text) => text.toLowerCase().replace(/\s+/g, ' ').trim();
      const normalizedInput = normalize(userInput);
      const normalizedCorrect = normalize(correctText);
      
      let isCorrect = false;
      
      if (allowPartialMatch) {
        // Kısmi eşleşme - ana kelimeleri içeriyor mu?
        const correctWords = normalizedCorrect.split(' ');
        const inputWords = normalizedInput.split(' ');
        const requiredWords = correctWords.filter(word => word.length > 3); // Önemli kelimeleri filtrele
        
        isCorrect = requiredWords.every(word => inputWords.includes(word));
      } else {
        // Tam eşleşme
        isCorrect = normalizedInput === normalizedCorrect;
      }
      
      return {
        isValid: userInput.length > 0,
        isCorrect: isCorrect,
        correctAnswer: correctText,
        feedbackMessage: isCorrect
          ? "Tebrikler, doğru metni yazdınız."
          : `Yanlış cevap. Doğru metin: "${correctText}"`
      };
    }
  };

  // Egzersiz türüne göre doğru cevap kontrolü yap
  window.validateExerciseAnswer = function(exerciseType, params) {
    // İlgili egzersiz türü için doğrulama fonksiyonunu bul
    const validator = exerciseValidators[exerciseType];
    
    if (!validator) {
      console.error(`${exerciseType} egzersiz türü için doğrulama fonksiyonu bulunamadı.`);
      return {
        isValid: false,
        isCorrect: false,
        correctAnswer: null,
        feedbackMessage: "Bu egzersiz türü için doğrulama yapılamıyor."
      };
    }
    
    // Doğrulama fonksiyonunu çağır ve sonucu döndür
    return validator(params);
  };

  // Global olarak erişilebilir Exercise yönetim composable
  window.useExercise = function(options = {}) {
    const { exerciseName = '' } = options;

    // Ortak durum değişkenleri
    const isCorrect = ref(false);
    const showResult = ref(false);
    const checkButtonEnabled = ref(false);
    const resultFeedback = ref({ 
      title: "", 
      message: "", 
      correctAnswer: null 
    });

    // Ana layout için kontroller
    function updateMainLayout(isValid) {
      checkButtonEnabled.value = isValid;
      // MainLayout'a bildir
      if (window.mainLayout) {
        window.mainLayout.canCheck = isValid;
      }
    }

    // Cevabı kontrol etme 
    function checkAnswer(params) {
      // Merkezi doğrulama fonksiyonunu kullan
      const validationResult = window.validateExerciseAnswer(exerciseName, params);
      
      if (validationResult.isValid) {
        isCorrect.value = validationResult.isCorrect;
        showResult.value = true;
        
        // Sonuç geri bildirimini güncelle
        resultFeedback.value = {
          title: isCorrect.value ? "Doğru!" : "Yanlış!",
          message: validationResult.feedbackMessage,
          correctAnswer: validationResult.correctAnswer
        };
        
        // Puan ve can yönetimi
        const stepStore = window.useStepStore();
        
        if (isCorrect.value) {
          stepStore.increaseScore(10);
        } else {
          stepStore.decreaseHearts();
        }
        
        // MainLayout'a bildir
        if (window.mainLayout && window.mainLayout.showResultModal) {
          window.mainLayout.showResultModal(isCorrect.value);
        }
        
        return {
          show: true,
          isCorrect: isCorrect.value,
          correctAnswer: validationResult.correctAnswer,
          message: validationResult.feedbackMessage
        };
      }
      
      return null;
    }

    // Egzersizi sıfırlama
    function reset() {
      isCorrect.value = false;
      showResult.value = false;
      checkButtonEnabled.value = false;
      resultFeedback.value = { title: "", message: "", correctAnswer: null };
    }

    // Sonuç içeriğini hazırla
    function renderResultContent() {
      return resultFeedback.value;
    }

    return {
      // State
      isCorrect,
      showResult,
      checkButtonEnabled,
      resultFeedback,

      // Metodlar
      checkAnswer,
      updateMainLayout,
      reset,
      renderResultContent
    };
  };

  // Tüm egzersiz türlerinin merkezi tanımlaması
  window.exerciseTypes = reactive([
    { 
      id: 'word-builder', 
      name: 'Kelime İnşa Etme',
      description: 'Verilen kelimelerle doğru cümleyi oluşturun',
      component: 'WordBuilderExercise', 
      path: '/exercises/WordBuilderExercise.vue',
      icon: 'fa-solid fa-arrows-to-dot'
    },
    { 
      id: 'word-match', 
      name: 'Kelime Eşleştirme',  
      description: 'Verilen kelimenin çevirisini bulun',
      component: 'WordMatchExercise', 
      path: '/exercises/WordMatchExercise.vue',
      icon: 'fa-solid fa-arrows-left-right'
    },
    { 
      id: 'picture-match', 
      name: 'Resim Eşleştirme',
      description: 'Verilen kelimeye uygun resmi seçin',
      component: 'PictureMatchExercise', 
      path: '/exercises/PictureMatchExercise.vue',
      icon: 'fa-solid fa-image'
    },
    { 
      id: 'fill-in-blank', 
      name: 'Boşluk Doldurma',
      description: 'Cümlede boş bırakılan yeri doğru kelime ile doldurun',
      component: 'FillInBlankExercise', 
      path: '/exercises/FillInBlankExercise.vue',
      icon: 'fa-solid fa-ellipsis'
    },
    { 
      id: 'text-input', 
      name: 'Metin Girişi',
      description: 'Verilen cümleyi çevirin',
      component: 'TextInputExercise', 
      path: '/exercises/TextInputExercise.vue',
      icon: 'fa-solid fa-keyboard'
    }
  ]);

  // Egzersiz getirme yardımcı fonksiyonları
  window.getExerciseById = function(id) {
    return window.exerciseTypes.find(ex => ex.id === id) || null;
  };

  window.getExerciseByComponent = function(componentName) {
    return window.exerciseTypes.find(ex => ex.component === componentName) || null;
  };

  window.getAllExercises = function() {
    return [...window.exerciseTypes];
  };

  // Yeni bir egzersiz tipi ekleme fonksiyonu
  window.addExerciseType = function(exerciseType) {
    const exists = window.exerciseTypes.some(ex => ex.id === exerciseType.id);
    if (!exists) {
      window.exerciseTypes.push(exerciseType);
    }
  };
})();
