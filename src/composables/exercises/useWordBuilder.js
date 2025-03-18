// useWordBuilder.js
(function() {
  const { ref, reactive } = Vue;

  window.useWordBuilder = function(props) {
    const exercise = window.useExercise(props, {
      exerciseType: 'word-builder',
      getExerciseData: () => props?.exerciseData || { question: { text: '', meaning: '', parts: [] } }
    });
    
    // Core state
    const wordList = ref([]);
    const correctAnswer = ref('');
    const english = ref('');
    const title = ref('Build this sentence');
    const isAnimating = ref(false);
    const wordsState = reactive(new Map());
    
    // Initialize exercise data
    const init = () => {
      exercise.loadExerciseDataFromProps();
      const q = exercise.exerciseData.value?.question;
      
      if (q) {
        // Ensure all word parts are strings
        wordList.value = Array.isArray(q.parts) 
          ? q.parts.map(part => String(part))
          : [];
        
        correctAnswer.value = q.text || '';
        english.value = q.meaning || '';
      } else {
        wordList.value = [];
        correctAnswer.value = '';
        english.value = '';
      }
      
      wordsState.clear();
      isAnimating.value = false;
      updateUI(false);
    };
    
    // Handle word movement
    const moveWord = (index, toLocation) => {
      // Validate index
      if (typeof index !== 'number' || isNaN(index) || index < 0 || index >= wordList.value.length) {
        return;
      }
      
      // Update state
      wordsState.set(index, {
        index,
        location: toLocation,
        word: wordList.value[index]
      });
      
      // Update UI
      updateUI(getDestinationWords().length > 0);
    };
    
    // Get words in destination
    const getDestinationWords = () => {
      return Array.from(wordsState.values())
        .filter(w => w.location === 'destination')
        .sort((a, b) => a.index - b.index)
        .map(w => w.word);
    };
    
    // Update UI state
    const updateUI = (canCheck) => {
      if (window.activeExerciseComponent) {
        if (typeof window.activeExerciseComponent.canCheck === 'object') {
          window.activeExerciseComponent.canCheck.value = canCheck;
        } else {
          window.activeExerciseComponent.canCheck = canCheck;
        }
      }
      
      if (window.mainLayout?.setCanCheck) {
        window.mainLayout.setCanCheck(canCheck);
      } else if (window.mainLayout?.canCheck !== undefined) {
        window.mainLayout.canCheck = canCheck;
      }
      
      window.dispatchEvent(new CustomEvent('word-builder-can-check', { 
        detail: { canCheck } 
      }));
    };
    
    // Check answer
    const checkAnswer = () => {
      const userAnswer = getDestinationWords().join(' ');
      
      return {
        isCorrect: userAnswer.toLowerCase() === correctAnswer.value.toLowerCase(),
        userAnswer,
        correctAnswer: correctAnswer.value
      };
    };
    
    return {
      wordList,
      correctAnswer,
      english,
      title,
      isAnimating,
      init,
      moveWord,
      checkAnswer,
      getDestinationWords,
      startAnimation: () => { isAnimating.value = true; },
      endAnimation: () => { isAnimating.value = false; },
      reset: () => { wordsState.clear(); updateUI(false); }
    };
  };
})();