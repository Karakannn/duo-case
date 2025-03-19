(function () {
  const { ref } = Vue;

  window.useWordMatch = function (props) {
    const word = ref('');
    const options = ref([]);
    const correctOption = ref('');
    const selectedOption = ref(null);

    const init = () => {
      if (props.exerciseData?.question) {
        const questionData = props.exerciseData.question;
        word.value = questionData.word || '';
        options.value = questionData.options || [];
        correctOption.value = questionData.correctOption || '';
        selectedOption.value = null;
      }
    };

    const selectOption = (option) => {
      selectedOption.value = option;

      if (window.mainLayout) {
        if (typeof window.mainLayout.canCheck === 'object' && window.mainLayout.canCheck.value !== undefined) {
          window.mainLayout.canCheck.value = true;
        } else {
          window.mainLayout.canCheck = true;
        }
      }
    };

    const checkAnswer = () => {
      const isCorrect = selectedOption.value === correctOption.value;
      return {
        isCorrect,
        userAnswer: selectedOption.value,
        correctAnswer: correctOption.value
      };
    };

    const renderResultContent = (isCorrect) => {
      return isCorrect ?
        `Correct! "${correctOption.value}" is the right answer.` :
        `Incorrect. The correct answer is "${correctOption.value}".`;
    };

    return {
      word,
      options,
      selectedOption,
      init,
      selectOption,
      checkAnswer,
      renderResultContent
    };
  };
})();