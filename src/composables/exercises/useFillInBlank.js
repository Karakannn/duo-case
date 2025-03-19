(function () {
  const { ref, computed } = Vue;

  window.useFillInBlank = function (props) {
    const sentence = ref('');
    const options = ref([]);
    const correctAnswer = ref('');
    const selectedOption = ref(null);

    const init = () => {
      if (props.exerciseData?.question) {
        const questionData = props.exerciseData.question;

        sentence.value = questionData.sentence || '';
        options.value = questionData.options || [];
        correctAnswer.value = questionData.correctAnswer || '';
        selectedOption.value = null;

        if (window.mainLayout) {
          if (typeof window.mainLayout.canCheck === 'object' && window.mainLayout.canCheck.value !== undefined) {
            window.mainLayout.canCheck.value = false;
          } else {
            window.mainLayout.canCheck = false;
          }
        }
      }
    };

    const sentenceParts = computed(() => {
      const parts = [];
      const blankIndex = sentence.value.indexOf('___');

      if (blankIndex !== -1) {
        if (blankIndex > 0) {
          parts.push({ type: 'text', content: sentence.value.substring(0, blankIndex) });
        }

        parts.push({ type: 'blank', content: '' });

        const afterBlank = sentence.value.substring(blankIndex + 3);
        if (afterBlank) {
          parts.push({ type: 'text', content: afterBlank });
        }
      } else {
        parts.push({ type: 'text', content: sentence.value });
      }

      return parts;
    });

    const selectOption = (option) => {
      selectedOption.value = option;

      const isValid = option !== null && option !== undefined;

      if (window.mainLayout) {
        if (typeof window.mainLayout.canCheck === 'object' && window.mainLayout.canCheck.value !== undefined) {
          window.mainLayout.canCheck.value = isValid;
        } else {
          window.mainLayout.canCheck = isValid;
        }
      }
    };

    const checkAnswer = () => {
      const isExactMatch = selectedOption.value === correctAnswer.value;
      const isCaseInsensitiveMatch =
        selectedOption.value &&
        correctAnswer.value &&
        selectedOption.value.toLowerCase() === correctAnswer.value.toLowerCase();

      const isCorrect = isExactMatch || isCaseInsensitiveMatch;

      return {
        isCorrect,
        userAnswer: selectedOption.value,
        correctAnswer: correctAnswer.value
      };
    };

    const renderResultContent = (isCorrect) => {
      return isCorrect ?
        `Correct! "${correctAnswer.value}" is the right answer.` :
        `Incorrect. The correct answer is "${correctAnswer.value}".`;
    };

    return {
      sentenceParts,
      options,
      selectedOption,
      init,
      selectOption,
      checkAnswer,
      renderResultContent
    };
  };
})();