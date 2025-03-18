// ExerciseSteps.js - Egzersiz adımlarını merkezileştiren yapı
(function () {
  // Tüm egzersiz adımlarını içeren dizi
  // Her adım farklı tipteki egzersizlerin soru ve cevaplarını içerir
  const exerciseSteps = [

    // FillInBlank Egzersizi Örneği
    {
      type: 'word-match',
      id: 1,
      stepProgress: 20,
      display: {
        type: 'character',
        title:"Doğru anlamı seçin",
        category: "YENİ KELİME",
        text: "Good bye",
        characterImage: "https://design.duolingo.com/b9352459555a7ded7c55.svg" // Opsiyonel karakter görseli
      },
      question: {
        word: 'Goodbye',
        options: ['Merhaba', 'Güle güle', 'Teşekkürler', 'Nasılsın'],
        correctOption: 'Güle güle'
      }
    },
    {
      type: 'fill-in-blank',
      id: 2,
      stepProgress: 40, // İlerleme yüzdesi
      display: {
        type: 'title',
        title: "Cümledeki boşluğu doldurun",
        category: "YENİ KELİME",
        imageUrl: "" // Opsiyonel
      },
      question: {
        sentence: 'I ___ to school every day.',
        options: ['go', 'went', 'going', 'gone'],
        correctAnswer: 'go'
      }
    },


    {
      type: 'word-builder',
      id: 3,
      stepProgress: 0,
      display: {
        type: 'character',
        text: "Book",
        characterImage: "" // Opsiyonel karakter görseli
      },
      question: {
        text: 'Yeni bir kitap aldım',
        meaning: 'I bought a new book',
        word: 'Book',
        parts: ['Yeni', 'bir', 'kitap', 'aldım'],
        correctSequence: [0, 1, 2, 3]
      }
    },
    // PictureMatch Egzersizi Örneği
    {
      type: 'picture-match',
      id: 4,
      stepProgress: 30,
      display: {
        type: 'title',
        title: "Görsele uygun kelimeyi seçin",
        category: "YENİ KELİME",
        imageUrl: '/images/question/dog.jpg' // Opsiyonel
      },
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

    {
      type: 'matching',
      id: 5,
      stepProgress: 0,
      display: {
        type: 'title',
        title: "Eşleştirmeleri tamamlayın",
        category: "YENİ KELİME",
        imageUrl: "" // Opsiyonel
      },
      question: {
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
    },

    // PictureMatch Egzersizi Örneği
    {
      type: 'picture-match',
      id: 6,
      stepProgress: 100,
      display: {
        type: 'title',
        title: "Görsele uygun kelimeyi seçin",
        category: "YENİ KELİME",
        imageUrl: '/images/question/dog.jpg' // Opsiyonel
      },
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

  const exerciseSequences = {
    default: [1, 2, 3, 4, 5, 6],
    wordFocus: [1, 3],
    sentenceFocus: [4, 5],
    custom: [3, 4, 6]
  };

  let activeSequence = 'default';

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
