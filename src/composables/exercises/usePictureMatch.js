(function () {
  const { ref } = Vue;

  window.usePictureMatch = function (props) {
    const questionImageUrl = ref('');
    const options = ref([]);
    const correctOption = ref('');
    const selectedOption = ref(null);

    const init = () => {
      if (props.exerciseData?.question) {
        const questionData = props.exerciseData.question;
        questionImageUrl.value = questionData.imageUrl || '';
        options.value = questionData.options || [];
        correctOption.value = questionData.correctOption || '';
        selectedOption.value = null;
      }
    };

    const selectOption = (option) => {
      selectedOption.value = option.name;

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
      questionImageUrl,
      options,
      selectedOption,
      init,
      selectOption,
      checkAnswer,
      renderResultContent
    };
  };

  if (window.exerciseTypes && !window.exerciseTypes.find(e => e.id === 'picture-match')) {
    window.exerciseTypes.push({
      id: 'picture-match',
      name: 'Picture Matching',
      description: 'Select the word that matches the given image',
      component: 'PictureMatchExercise',
      icon: 'fa-solid fa-image'
    });
  }
})();