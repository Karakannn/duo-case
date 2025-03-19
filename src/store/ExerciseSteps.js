(function () {
  const exerciseSteps = [
    {
      type: 'fill-in-blank',
      id: 1,
      stepProgress: 30,
      display: {
        type: 'title',
        title: "Fill in the blank",
        category: "NEW WORD",
        imageUrl: ""
      },
      question: {
        sentence: 'I ___ to school every day.',
        options: ['go', 'went', 'going', 'gone'],
        correctAnswer: 'go'
      }
    },
    {
      type: 'matching',
      id: 2,
      stepProgress: 40,
      display: {
        type: 'title',
        title: "Complete the matches",
        category: "NEW WORD",
        imageUrl: ""
      },
      question: {
        leftItems: [
          { id: 1, text: "manzana" },
          { id: 2, text: "coche" },
          { id: 3, text: "casa" },
          { id: 4, text: "libro" },
          { id: 5, text: "ordenador" }
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
    {
      type: 'word-builder',
      id: 3,
      stepProgress: 60,
      display: {
        type: 'character',
        text: "I bought a new book",
        title: "Build this sentence",
        characterImage: "https://kasratabrizi.github.io/duolingo-exercise-project/assets/duo.svg"
      },
      question: {
        text: 'Compré un libro nuevo',
        meaning: 'I bought a new book',
        word: 'Book',
        parts: ['Compré', 'un', 'libro', 'nuevo'],
        correctSequence: [0, 1, 2, 3]
      }
    },
    {
      type: 'picture-match',
      id: 4,
      stepProgress: 80,
      display: {
        type: 'title',
        title: "Choose the matching word",
        category: "NEW WORD",
        imageUrl: ''
      },
      question: {
        correctOption: 'coffee',
        options: [
          { name: 'milk', imageUrl: 'https://d2pur3iezf4d1j.cloudfront.net/images/645fa42dcea02c7e2970a1285e321562' },
          { name: 'coffee', imageUrl: 'https://d2pur3iezf4d1j.cloudfront.net/images/6fd84b8a838c43c4a84b44b08b10177e' },
          { name: 'tea', imageUrl: 'https://d2pur3iezf4d1j.cloudfront.net/images/18a521f1507cb86689faa5b2e8277703' },
        ],
      }
    },
    {
      type: 'word-match',
      id: 5,
      stepProgress: 90,
      display: {
        type: 'character',
        title: "Choose the correct meaning",
        category: "NEW WORD",
        text: "Adiós",
        characterImage: "https://design.duolingo.com/b9352459555a7ded7c55.svg"
      },
      question: {
        word: 'Adiós',
        options: [
          { name: 'Hello', imageUrl: '' },
          { name: 'Goodbye', imageUrl: '' },
          { name: 'Thank you', imageUrl: '' },
          { name: 'How are you', imageUrl: '' }
        ],
        correctOption: 'Goodbye'
      }
    },
    {
      type: 'picture-match',
      id: 6,
      stepProgress: 100,
      display: {
        type: 'title',
        title: "Choose the matching word",
        category: "NEW WORD",
        imageUrl: '/images/question/dog.jpg'
      },
      question: {
        imageUrl: '/images/question/dog.jpg',
        options: [
          { name: 'perro', imageUrl: '/images/options/dog.jpg' },
          { name: 'gato', imageUrl: '/images/options/cat.jpg' },
          { name: 'caballo', imageUrl: '/images/options/horse.jpg' },
          { name: 'pájaro', imageUrl: '/images/options/bird.jpg' }
        ],
        correctOption: 'perro'
      }
    }
  ];

  const exerciseSequences = {
    default: [1, 2, 3, 4, 5, 6],
    wordFocus: [1, 3, 5],
    sentenceFocus: [2, 4, 6],
    custom: [3, 4, 6]
  };

  let activeSequence = 'default';

  function getStepById(stepId) {
    return exerciseSteps.find(step => step.id === stepId) || null;
  }

  function getActiveSequenceSteps() {
    const sequenceIds = exerciseSequences[activeSequence] || exerciseSequences.default;
    return sequenceIds.map(id => getStepById(id)).filter(step => step !== null);
  }

  function setActiveSequence(sequenceName) {
    if (exerciseSequences[sequenceName]) {
      activeSequence = sequenceName;
      return true;
    }
    return false;
  }

  function getActiveSequenceName() {
    return activeSequence;
  }

  function getAvailableSequences() {
    return Object.keys(exerciseSequences);
  }

  function getStepsByType(type) {
    return exerciseSteps.filter(step => step.type === type);
  }

  window.exerciseStepsManager = {
    getAllSteps: () => [...exerciseSteps],
    getStepById,
    getActiveSequenceSteps,
    setActiveSequence,
    getActiveSequenceName,
    getAvailableSequences,
    getStepsByType
  };

  window.getActiveSequenceExercises = () => {
    const steps = getActiveSequenceSteps();
    return steps.map(step => {
      const exerciseType = window.exerciseRegistry.getExerciseById(step.type);
      if (exerciseType) {
        return exerciseType;
      }
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