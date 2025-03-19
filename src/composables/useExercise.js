(function () {
  const { ref } = Vue;

  window.useExercise = function (props, options = {}) {
    const { exerciseType = '', defaultData = {} } = options;
    const exerciseData = ref({});
    const isCorrect = ref(false);

    const loadExerciseDataFromProps = () => {
      if (props.exerciseData?.type === exerciseType && props.exerciseData?.question) {
        exerciseData.value = props.exerciseData;
      } else {
        exerciseData.value = { type: exerciseType, question: defaultData };
      }
      window.currentExercise = { ...exerciseData.value.question, type: exerciseType };
    };

    const updateCheckButton = (isValid) => {
      if (window.mainLayout) window.mainLayout.canCheck = isValid;
    };

    const checkAnswer = (result) => {
      isCorrect.value = result.isCorrect;
      return result;
    };

    const onContinue = () => {
      if (window.mainLayout?.nextExercise) window.mainLayout.nextExercise();
    };

    const renderResultContent = (isCorrect, correctAnswer) => {
      return isCorrect
        ? `<p>Doğru cevap!</p>`
        : `<p>Doğru cevap: <strong>${correctAnswer}</strong></p>`;
    };

    return {
      exerciseData,
      isCorrect,
      loadExerciseDataFromProps,
      updateCheckButton,
      checkAnswer,
      onContinue,
      renderResultContent
    };
  };
})();