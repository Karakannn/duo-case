(function () {
  const { ref, computed, onMounted } = Vue;

  window.useMatching = function (exerciseData = {}) {
    const leftItems = ref([]);
    const rightItems = ref([]);
    const correctMatches = ref([]);
    const userMatches = ref([]);
    const isComplete = computed(() => userMatches.value.length === leftItems.value.length);

    const init = () => {
      if (exerciseData?.question) {
        const questionData = exerciseData.question;
        leftItems.value = questionData.leftItems || [];
        rightItems.value = questionData.rightItems || [];
        correctMatches.value = questionData.correctMatches || [];
        userMatches.value = [];
      }

      if (window.mainLayout) {
        window.mainLayout.canCheck = false;
      }
    };

    onMounted(() => {
      init();
    });

    const checkPair = (leftId, rightId) => {
      return correctMatches.value.some(match =>
        match.leftId === leftId && match.rightId === rightId
      );
    };

    const matchItems = (leftItem, rightItem) => {
      if (userMatches.value.some(match =>
        match.leftId === leftItem.id && match.rightId === rightItem.id
      )) {
        return;
      }

      userMatches.value.push({
        leftId: leftItem.id,
        rightId: rightItem.id
      });

      if (isComplete.value && window.mainLayout) {
        window.mainLayout.canCheck = true;
      }
    };

    const decreaseHeart = () => {
      if (window.stepStore) {
        window.stepStore.decreaseHearts();
      } else if (window.useStepStore) {
        const stepStore = window.useStepStore();
        stepStore.decreaseHearts();
      } else if (window.mainLayout?.stepStore) {
        window.mainLayout.stepStore.decreaseHearts();
      }
    };

    const checkAnswer = () => {
      const allCorrect = userMatches.value.every(userMatch => {
        return correctMatches.value.some(correctMatch =>
          correctMatch.leftId === userMatch.leftId &&
          correctMatch.rightId === userMatch.rightId
        );
      });

      if (!allCorrect) {
        decreaseHeart();
      }

      return { isCorrect: allCorrect };
    };

    const renderResultContent = (isCorrect) => {
      return isCorrect ?
        `<p>Great! All matches are correct.</p>` :
        `<p>Some matches are incorrect. Please try again.</p>`;
    };

    const reset = () => {
      userMatches.value = [];

      if (window.mainLayout) {
        window.mainLayout.canCheck = false;
      }
    };

    return {
      leftItems,
      rightItems,
      correctMatches,
      userMatches,
      isComplete,
      init,
      checkPair,
      matchItems,
      decreaseHeart,
      checkAnswer,
      renderResultContent,
      reset
    };
  };
})();