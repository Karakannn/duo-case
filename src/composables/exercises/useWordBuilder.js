(function () {
  const { ref, reactive } = Vue;

  window.useWordBuilder = function (props) {
    const wordList = ref([]);
    const correctAnswer = ref('');
    const english = ref('');
    const title = ref('Build this sentence');
    const isAnimating = ref(false);
    const isChecked = ref(false);
    const wordsState = reactive(new Map());

    const init = () => {
      const q = props?.exerciseData?.question;

      if (q) {
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
      isChecked.value = false;
      updateUI(false);
    };

    const moveWord = (index, toLocation) => {
      if (isChecked.value) return;

      if (typeof index !== 'number' || isNaN(index) || index < 0 || index >= wordList.value.length) {
        return;
      }

      wordsState.set(index, {
        index,
        location: toLocation,
        word: wordList.value[index],
        timestamp: toLocation === 'destination' ? Date.now() : null
      });

      updateUI(getDestinationWords().length > 0);
    };

    const getDestinationWords = () => {
      return Array.from(wordsState.values())
        .filter(w => w.location === 'destination')
        .sort((a, b) => a.timestamp - b.timestamp)
        .map(w => w.word);
    };

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

    const checkAnswer = () => {
      const userAnswer = getDestinationWords().join(' ');
      const expectedAnswer = correctAnswer.value.toLowerCase();
      const actualAnswer = userAnswer.toLowerCase();
      const isCorrect = actualAnswer === expectedAnswer;

      isChecked.value = true;

      return {
        isCorrect,
        userAnswer,
        correctAnswer: correctAnswer.value
      };
    };

    const reset = () => {
      wordsState.clear();
      isChecked.value = false;
      updateUI(false);
    };

    return {
      wordList,
      correctAnswer,
      english,
      title,
      isAnimating,
      isChecked,
      init,
      moveWord,
      checkAnswer,
      getDestinationWords,
      startAnimation: () => { isAnimating.value = true; },
      endAnimation: () => { isAnimating.value = false; },
      reset
    };
  };
})();