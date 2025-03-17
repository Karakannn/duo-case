// useWordBuilder.js - Word Builder exercise composable

(function() {
  const { ref, computed, reactive, nextTick } = Vue;

  window.useWordBuilder = function(props) {
    // Use common exercise base with data from props
    const exercise = window.useExercise(props, {
      exerciseType: 'word-builder',
      getExerciseData: () => {
        // If exerciseData is provided in props, use it directly
        if (props && props.exerciseData) {
          return props.exerciseData;
        }
        
        // Fallback to empty data
        return {
          question: {
            text: '',
            meaning: '',
            parts: []
          }
        };
      }
    });
    
    // State
    const english = ref('');
    const correctAnswer = ref('');
    const wordList = ref([]);
    const title = ref('Build this sentence');
    const word = ref('');
    const userAnswer = ref('');
    
    // Animation and positioning state
    const wordPositionsArray = reactive([]);
    const isAnyWordAnimating = ref(false);
    const clickQueue = ref([]);
    const destinationWords = reactive([]);
    
    // Init: Load exercise data
    const init = () => {
      exercise.loadExerciseDataFromProps();
      
      console.log('Exercise data loaded:', exercise.exerciseData.value);
      
      if (exercise.exerciseData.value && exercise.exerciseData.value.question) {
        const questionData = exercise.exerciseData.value.question;
        console.log('Word builder question data:', questionData);
        
        // Set English text (meaning in ExerciseSteps)
        english.value = questionData.meaning || '';
        
        // Set correct answer (text in ExerciseSteps)
        correctAnswer.value = questionData.text || '';
        
        // Set word list (parts in ExerciseSteps)
        if (Array.isArray(questionData.parts)) {
          wordList.value = [...questionData.parts]; // Create a copy of the array
        } else {
          wordList.value = [];
          console.warn('No parts array found in question data');
        }
        
        // Set title
        title.value = 'Build this sentence';
        
        // Set word for speech bubble
        if (questionData.word) {
          word.value = questionData.word;
        } else if (wordList.value.length > 0) {
          // Just use the first word part if no specific word is set
          word.value = wordList.value[0];
        } else {
          word.value = "Word";
        }
        
        // Reset animation and positioning state
        wordPositionsArray.length = 0;
        clickQueue.value = [];
        isAnyWordAnimating.value = false;
        destinationWords.length = 0;
        
        console.log('Initialized word builder with:');
        console.log('- English:', english.value);
        console.log('- Correct answer:', correctAnswer.value);
        console.log('- Word list:', wordList.value);
        console.log('- Title:', title.value);
        console.log('- Word:', word.value);
      } else {
        console.error('No valid exercise data found for word builder');
        
        // Set default values in case of missing data
        english.value = '';
        correctAnswer.value = '';
        wordList.value = [];
        word.value = 'Word';
      }
    };
    
    // Determine if a word should start at origin or destination
    const getInitialLocation = (index) => {
      return wordPositionsArray[index]?.location === 'destination' ? 'destination' : 'origin';
    };
    
    // Process the click queue efficiently
    const processClickQueue = () => {
      if (clickQueue.value.length === 0 || isAnyWordAnimating.value) {
        return null;
      }
      
      const nextIndex = clickQueue.value.shift();
      isAnyWordAnimating.value = true;
      
      return {
        nextIndex,
        onAnimationComplete: () => {
          isAnyWordAnimating.value = false;
          
          // Process next in queue if any
          if (clickQueue.value.length > 0) {
            nextTick(processClickQueue);
          }
        }
      };
    };
    
    // Handle word click
    const handleWordClick = (wordData) => {
      const { index, location } = wordData;
      
      // If word is already in queue, ignore
      if (clickQueue.value.includes(index)) {
        return null;
      }
      
      // Add to queue
      clickQueue.value.push(index);
      
      // Process immediately if no animation is in progress
      if (!isAnyWordAnimating.value) {
        return processClickQueue();
      }
      
      return null;
    };
    
    // Handle animation start
    const handleAnimationStart = () => {
      isAnyWordAnimating.value = true;
    };
    
    // Handle animation end
    const handleAnimationEnd = () => {
      isAnyWordAnimating.value = false;
      
      // Process next in queue if any
      if (clickQueue.value.length > 0) {
        nextTick(processClickQueue);
      }
    };
    
    // Handle word positioning events
    const handleWordPositioned = (wordData) => {
      const { index, position, location, word } = wordData;
      
      // Update position in tracking array
      wordPositionsArray[index] = {
        index,
        position,
        location,
        word
      };
    };
    
    // Handle location change
    const handleLocationChange = (wordData, destinationContainer) => {
      const { index, location } = wordData;
      
      // Update location in tracking array
      if (wordPositionsArray[index]) {
        wordPositionsArray[index].location = location;
      }
      
      // Reposition words in destination if needed
      if (location === 'destination' && destinationContainer) {
        nextTick(() => {
          repositionDestinationWords(destinationContainer);
        });
      }
    };
    
    // Reposition words in destination container
    const repositionDestinationWords = (destinationContainer) => {
      if (!destinationContainer || !destinationContainer.value || 
          wordPositionsArray.filter(w => w && w.location === 'destination').length === 0) {
        return null;
      }

      // Get container dimensions
      const containerRect = destinationContainer.value.getBoundingClientRect();
      const containerLeft = containerRect.left;

      // Gap between words
      const wordGap = 10;

      // Get words in destination sorted by x position
      const wordsInDestination = wordPositionsArray
        .filter(w => w && w.location === 'destination')
        .sort((a, b) => a.position.x - b.position.x);
      
      // Calculate positions for each word, adding them from left to right
      let currentX = containerLeft + wordGap;
      
      // Calculate positions for all words
      const positionedWords = wordsInDestination.map((word) => {
        // Calculate width based on word length with padding
        const wordWidth = word.word.length * 12 + 24;
        
        // Create new position
        const newPosition = { 
          x: currentX, 
          y: containerRect.top,
          width: wordWidth,
          height: 30 // Approximate height
        };
        
        // Update currentX for next word
        currentX += wordWidth + wordGap;
        
        // Return updated word data
        return { 
          ...word, 
          position: newPosition 
        };
      });

      // Update destination words array
      destinationWords.length = 0;
      positionedWords.forEach(word => {
        destinationWords.push({
          index: word.index,
          word: word.word,
          position: word.position,
          addedTime: Date.now()
        });
      });

      // Update user answer
      updateUserAnswer(wordsInDestination.map(w => w.word));
      
      return positionedWords;
    };
    
    // Update user answer based on words in destination
    const updateUserAnswer = (words) => {
      userAnswer.value = words.join(' ');
      exercise.updateCheckButton(words.length > 0);
    };
    
    // Check answer
    const checkAnswer = () => {

      console.log('Checking answer:', userAnswer.value, correctAnswer.value);
      
      const isCorrect = userAnswer.value.toLowerCase() === correctAnswer.value.toLowerCase();
      return exercise.checkAnswer({
        isCorrect,
        userAnswer: userAnswer.value,
        correctAnswer: correctAnswer.value
      });
    };
    
    return {
      // State
      english,
      correctAnswer,
      wordList,
      title,
      word,
      userAnswer,
      
      // Methods
      init,
      getInitialLocation,
      handleWordClick,
      handleWordPositioned,
      handleLocationChange,
      handleAnimationStart,
      handleAnimationEnd,
      checkAnswer
    };
  };
})();
