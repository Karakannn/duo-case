// useWordBuilder.js - Word Builder exercise composable

(function() {
  const { ref, computed, reactive, nextTick } = Vue;

  window.useWordBuilder = function(props) {
    // Use common exercise base
    const exercise = window.useExercise(props, {
      exerciseType: 'word-builder',
      defaultData: {
        english: "I eat an apple",
        correctAnswer: "Yo como una manzana",
        list: ["manazana", "comes", "Yo", "una", "como", "naranja"]
      }
    });
    
    // State
    const english = ref('');
    const correctAnswer = ref('');
    const wordList = ref([]);
    const userAnswer = ref('');
    const title = ref('Write this in Spanish');
    const word = ref('');
    
    // Animation and positioning state
    const destinationWords = reactive([]);
    const wordPositionsArray = reactive([]);
    const isAnyWordAnimating = ref(false);
    const clickQueue = ref([]);
    const exerciseInitialized = ref(false);
    
    // Init: Load exercise data
    const init = () => {
      exercise.loadExerciseDataFromProps();
      
      if (exercise.exerciseData.value.question) {
        const questionData = exercise.exerciseData.value.question;
        english.value = questionData.english || questionData.meaning || '';
        correctAnswer.value = questionData.correctAnswer || questionData.text || '';
        wordList.value = questionData.list || questionData.parts || [];
        userAnswer.value = '';
        
        // Set title if provided
        if (questionData.title) {
          title.value = questionData.title;
        }
        
        // Set word for speech bubble
        if (questionData.word) {
          word.value = questionData.word;
        } else {
          word.value = wordList.value.length > 0 ? wordList.value[0] : "Word";
        }
        
        // Reset all arrays
        destinationWords.length = 0;
        wordPositionsArray.length = 0;
        clickQueue.value = [];
        
        nextTick(() => {
          exerciseInitialized.value = true;
        });
      }
    };
    
    // Determine if a word should start at origin or destination
    const getInitialLocation = (index) => {
      if (!exerciseInitialized.value) return 'origin';
      const inDestination = destinationWords.findIndex(w => w.index === index) !== -1;
      return inDestination ? 'destination' : 'origin';
    };
    
    // Process the click queue sequentially
    const processClickQueue = () => {
      if (clickQueue.value.length === 0 || isAnyWordAnimating.value) {
        return;
      }

      // Get the next word to process
      const nextIndex = clickQueue.value.shift();
      
      return {
        nextIndex,
        onAnimationComplete: () => {
          // This callback is called when animation is complete
          isAnyWordAnimating.value = false;

          // Process next in queue
          nextTick(() => {
            processClickQueue();
          });
        }
      };
    };
    
    // Handle word click
    const handleWordClick = (wordData) => {
      const { index, location } = wordData;

      // Check if we should move the word back to origin
      if (location === 'destination') {
        // Add to queue regardless of animation state
        if (clickQueue.value.indexOf(index) === -1) {
          clickQueue.value.push(index);

          // If no animation is running, start processing the queue
          if (!isAnyWordAnimating.value) {
            return processClickQueue();
          }
        }
        return null;
      }

      // If a word is already animating, queue this click
      if (isAnyWordAnimating.value) {
        // Only add to queue if not already in queue and not already at destination
        const isInQueue = clickQueue.value.indexOf(index) !== -1;
        const isAtDestination = wordPositionsArray[index]?.location === 'destination';

        if (!isInQueue && !isAtDestination) {
          clickQueue.value.push(index);
        }
        return null;
      }

      // Add to queue and process immediately
      clickQueue.value.push(index);
      return processClickQueue();
    };

    // Handle animation start
    const handleAnimationStart = (wordData) => {
      isAnyWordAnimating.value = true;
    };

    // Handle animation end
    const handleAnimationEnd = (wordData) => {
      isAnyWordAnimating.value = false;

      // Process next in queue
      nextTick(() => {
        return processClickQueue();
      });
    };
    
    // Handle word positioning events
    const handleWordPositioned = (wordData) => {
      const { index, position, location, word } = wordData;

      // Update position in our tracking array
      wordPositionsArray[index] = {
        index,
        position,
        location,
        word
      };
    };
    
    // Handle location changes from Word component
    const handleLocationChange = (wordData, containerRef) => {
      const { index, location, position } = wordData;

      // Update our tracking of destination words
      if (location === 'destination') {
        // Add to destination if not already there
        if (destinationWords.findIndex(w => w.index === index) === -1) {
          // Add to end of destination words array
          destinationWords.push({
            index,
            word: wordList.value[index],
            position,
            addedTime: Date.now() // Add timestamp to track order of addition
          });

          // Force recalculation of positions
          return repositionDestinationWords(containerRef);
        }
      } else {
        // Remove from destination
        const idx = destinationWords.findIndex(w => w.index === index);
        if (idx !== -1) {
          destinationWords.splice(idx, 1);

          // Force recalculation to close gaps
          return repositionDestinationWords(containerRef);
        }
      }

      // Update word position in our tracking array
      if (wordPositionsArray[index]) {
        wordPositionsArray[index].location = location;
      }
      
      // Update user answer based on destination words
      const wordsInDestination = wordPositionsArray
        .filter(w => w && w.location === 'destination')
        .sort((a, b) => a.position.x - b.position.x);

      updateUserAnswer(wordsInDestination.map(w => w.word));
      
      return null;
    };

    // Recalculate and reposition all destination words to close gaps
    const repositionDestinationWords = (containerRef) => {
      if (!containerRef || !containerRef.value || destinationWords.length === 0) return null;

      // Get container dimensions
      const containerRect = containerRef.value.getBoundingClientRect();
      const containerLeft = containerRect.left;

      // Gap between words
      const wordGap = 20;

      // This way, new words are always added to the right (since we push to the array)
      const wordsToPosition = [...destinationWords];
      
      // Calculate positions for each word, adding them from left to right
      let currentX = containerLeft + wordGap;
      
      // Calculate positions for all words
      const positionedWords = wordsToPosition.map((word) => {
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

      return positionedWords;
    };
    
    // Update user answer based on words in destination
    const updateUserAnswer = (words) => {
      userAnswer.value = words.join(' ');
      exercise.updateCheckButton(words.length > 0);
    };
    
    // Check answer
    const checkAnswer = () => {
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
      userAnswer,
      title,
      word,
      
      // Methods
      init,
      getInitialLocation,
      handleWordClick,
      handleAnimationStart,
      handleAnimationEnd,
      handleWordPositioned,
      handleLocationChange,
      checkAnswer
    };
  };
})();
