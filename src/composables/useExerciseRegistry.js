// useExerciseRegistry.js - Tüm egzersiz türlerini merkezi olarak yöneten kayıt sistemi
(function() {
  const { reactive, readonly } = Vue;

  // Egzersiz türleri ve doğrulama fonksiyonları için merkezi depo
  const exerciseTypes = reactive([]);
  const exerciseValidators = {};

  // Egzersiz kayıt sistemi
  window.exerciseRegistry = {
    // Yeni bir egzersiz türü ve doğrulayıcısını kaydet
    register(exerciseInfo, validator) {
      // Zaten var mı kontrol et
      const exists = exerciseTypes.some(ex => ex.id === exerciseInfo.id);
      if (!exists) {
        // Egzersiz türünü kaydet
        exerciseTypes.push(exerciseInfo);
        // Doğrulama fonksiyonunu kaydet
        exerciseValidators[exerciseInfo.id] = validator;
        console.log(`Egzersiz türü kaydedildi: ${exerciseInfo.name}`);
      }
    },

    // Belirli bir egzersiz türü için doğrulama yap
    validate(exerciseType, params) {
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
      
      return validator(params);
    },

    // ID'ye göre egzersiz türü getir
    getExerciseById(id) {
      return exerciseTypes.find(ex => ex.id === id) || null;
    },

    // Bileşen adına göre egzersiz türü getir
    getExerciseByComponent(componentName) {
      return exerciseTypes.find(ex => ex.component === componentName) || null;
    },

    // Tüm egzersiz türlerini getir
    getAllExercises() {
      return [...exerciseTypes];
    }
  };

  // Global olarak doğrulama fonksiyonunu ata
  window.validateExerciseAnswer = function(exerciseType, params) {
    return window.exerciseRegistry.validate(exerciseType, params);
  };

  // Global olarak egzersiz türleri listesini ata (sadece okuma için)
  Object.defineProperty(window, 'exerciseTypes', {
    get: () => readonly(exerciseTypes)
  });

  // Eski yardımcı fonksiyonları korumak için (geriye dönük uyumluluk)
  window.getExerciseById = window.exerciseRegistry.getExerciseById;
  window.getExerciseByComponent = window.exerciseRegistry.getExerciseByComponent;
  window.getAllExercises = window.exerciseRegistry.getAllExercises;
})();
