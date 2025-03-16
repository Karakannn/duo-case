// ExerciseSteps.js - Egzersiz adımlarını merkezileştiren yapı
(function() {
  // Tüm egzersiz adımlarını içeren dizi
  // Her adım farklı tipteki egzersizlerin soru ve cevaplarını içerir
  const exerciseSteps = [
    // WordMatch Egzersizi Örneği
   /*  {
      type: 'word-match',
      id: 1,
      question: {
        word: 'Hello',
        options: ['Merhaba', 'Güle güle', 'Teşekkürler', 'Nasılsın'],
        correctOption: 'Merhaba'
      }
    }, */
    {
      type: 'picture-match',
      id: 1,
      stepProgress: 0, // İlerleme yüzdesi - 0'dan başlar
      question: {
        imageUrl: '/images/question/dog.jpg',
        options: [
          { name: 'milk', imageUrl: 'https://d2pur3iezf4d1j.cloudfront.net/images/645fa42dcea02c7e2970a1285e321562' },
          { name: 'coffee', imageUrl: 'https://d2pur3iezf4d1j.cloudfront.net/images/6fd84b8a838c43c4a84b44b08b10177e' },
          { name: 'tea', imageUrl: 'https://d2pur3iezf4d1j.cloudfront.net/images/18a521f1507cb86689faa5b2e8277703' },
        ],
        correctOption: 'coffee'
      }
    },

    // WordMatch Egzersizi Örneği 2
    {
      type: 'word-match',
      id: 2,
      stepProgress: 20, // İlerleme yüzdesi
      question: {
        word: 'Goodbye',
        options: ['Merhaba', 'Güle güle', 'Teşekkürler', 'Nasılsın'],
        correctOption: 'Güle güle'
      }
    },
    // WordBuilder Egzersizi Örneği
    {
      type: 'word-builder',
      id: 3,
      stepProgress: 40, // İlerleme yüzdesi
      question: {
        sentence: 'I ____ an apple',
        letters: ['a', 'e', 't', 'n', 'o', 'c', 'h', 'r', 'v', 'p', 'l'],
        correctWord: 'have'
      }
    },
    // TextInput Egzersizi Örneği
    {
      type: 'text-input',
      id: 4,
      stepProgress: 60, // İlerleme yüzdesi
      question: {
        prompt: 'Çevir: "The cat is black"',
        correctAnswer: 'Kedi siyahtır'
      }
    },
    // FillInBlank Egzersizi Örneği
    {
      type: 'fill-in-blank',
      id: 5,
      stepProgress: 80, // İlerleme yüzdesi
      question: {
        sentence: 'I ___ to school every day.',
        options: ['go', 'went', 'going', 'gone'],
        correctAnswer: 'go'
      }
    },
    // PictureMatch Egzersizi Örneği
    {
      type: 'picture-match',
      id: 6,
      stepProgress: 100, // İlerleme yüzdesi - %100 ile tamamlanır
      question: {
        imageUrl: '/images/question/dog.jpg',
        options: [
          { name: 'köpek', imageUrl: '/images/options/dog.jpg' },
          { name: 'kedi', imageUrl: '/images/options/cat.jpg' },
          { name: 'at', imageUrl: '/images/options/horse.jpg' },
          { name: 'kuş', imageUrl: '/images/options/bird.jpg' }
        ],
        correctOption: 'köpek'
      }
    }
  ];

  // Adım sıralamaları - farklı egzersiz dizileri oluşturmak için
  const exerciseSequences = {
    // Varsayılan sıralama - tüm adımlar
    default: [1, 2, 3, 4, 5, 6],
    // Sadece kelime eşleştirme ve kelime oluşturma
    wordFocus: [1, 2, 3],
    // Sadece cümle odaklı egzersizler
    sentenceFocus: [4, 5],
    // Özel sıralama örneği
    custom: [2, 4, 6]
  };

  // Aktif sıralama
  let activeSequence = 'default';

  // Adımları ID'lerine göre almak için yardımcı fonksiyon
  function getStepById(stepId) {
    return exerciseSteps.find(step => step.id === stepId) || null;
  }

  // Aktif sıralamadaki adımları al
  function getActiveSequenceSteps() {
    const sequenceIds = exerciseSequences[activeSequence] || exerciseSequences.default;
    return sequenceIds.map(id => getStepById(id)).filter(step => step !== null);
  }

  // Sıralamayı değiştir
  function setActiveSequence(sequenceName) {
    if (exerciseSequences[sequenceName]) {
      activeSequence = sequenceName;
      return true;
    }
    return false;
  }

  // Aktif sıralamayı al
  function getActiveSequenceName() {
    return activeSequence;
  }

  // Sıralama listesini al
  function getAvailableSequences() {
    return Object.keys(exerciseSequences);
  }

  // Belirli bir tipteki egzersizleri filtrele
  function getStepsByType(type) {
    return exerciseSteps.filter(step => step.type === type);
  }

  // Global olarak fonksiyonları dışa aktar
  window.exerciseStepsManager = {
    getAllSteps: () => [...exerciseSteps],
    getStepById,
    getActiveSequenceSteps,
    setActiveSequence,
    getActiveSequenceName,
    getAvailableSequences,
    getStepsByType
  };

  // Geriye uyumluluk için
  window.getActiveSequenceExercises = () => {
    const steps = getActiveSequenceSteps();
    // Egzersiz türlerini adımlardan al
    return steps.map(step => {
      const exerciseType = window.exerciseRegistry.getExerciseById(step.type);
      if (exerciseType) {
        return exerciseType;
      }
      // Eğer o tipte egzersiz bulunamazsa, adımın tipini kullan
      return {
        id: step.type,
        name: step.type.charAt(0).toUpperCase() + step.type.slice(1).replace('-', ' '),
        component: step.type.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join('') + 'Exercise',
        icon: 'fa-solid fa-question'
      };
    });
  };

  window.setActiveSequence = setActiveSequence;
})();
