<template>
  <div class="exercise-component">
    <div class="matching-exercise">
      <!-- Audio container (if available) -->
      <div v-if="audioWord" class="audio-container mb-4 text-center">
        <div class="audio-button">
          <span class="badge bg-primary rounded-pill fs-5 px-4 py-2">
            <i class="fas fa-volume-up me-2"></i>
            <span>{{ audioWord }}</span>
          </span>
        </div>
      </div>
      
      <!-- 5x5 eşleştirme gridi -->
      <div class="match-grid-container">
        <!-- Sol taraf (sorular/ifadeler) -->
        <div class="left-column">
          <div 
            v-for="(item, index) in leftItems" 
            :key="`left-${index}`"
            class="match-item"
            :class="{ 
              'selected': selectedLeft === index,
              'matched': isItemMatched('left', index)
            }"
            @click="selectItem('left', index)"
          >
            {{ item.text }}
          </div>
        </div>
        
        <!-- Sağ taraf (karşılıklar/cevaplar) -->
        <div class="right-column">
          <div 
            v-for="(item, index) in rightItems" 
            :key="`right-${index}`"
            class="match-item"
            :class="{ 
              'selected': selectedRight === index,
              'matched': isItemMatched('right', index)
            }"
            @click="selectItem('right', index)"
          >
            {{ item.text }}
          </div>
        </div>
      </div>
      
      <!-- Eşleştirme Çizgileri -->
      <div class="match-lines">
        <svg width="100%" height="100%" class="match-lines-svg">
          <line 
            v-for="(match, index) in matches" 
            :key="`line-${index}`"
            :x1="0" 
            :y1="getPositionY('left', match.leftIndex)" 
            :x2="100" 
            :y2="getPositionY('right', match.rightIndex)"
            class="match-line"
          />
        </svg>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'MatchingExercise',
  components: {
  },
  emits: ['complete'],
  setup(props, { emit }) {
    const { ref, computed, onMounted, watch } = Vue;
    
    // Merkezi store ve exercise manager'ı kullan
    const stepStore = window.useStepStore();
    const exerciseManager = window.useExercise({
      exerciseName: 'picture-match' // Aynı doğrulayıcıyı kullanabiliriz, çünkü mantık benzer
    });
    
    // State
    const title = "Eşleştirmeleri tamamlayın";
    const audioWord = null;  // Eğer ses çalınacaksa
    
    // Eşleştirilecek öğeler (sol taraf)
    const leftItems = ref([
      { id: 1, text: "bir" },
      { id: 2, text: "dört" },
      { id: 3, text: "otuz" },
      { id: 4, text: "otobüs" },
      { id: 5, text: "kedi" }
    ]);
    
    // Eşleştirilecek öğeler (sağ taraf)
    const rightItems = ref([
      { id: 1, text: "one" },
      { id: 2, text: "four" },
      { id: 3, text: "thirty" },
      { id: 4, text: "bus" },
      { id: 5, text: "cat" }
    ]);
    
    // Doğru eşleştirmeler (id bazında)
    const correctMatches = [
      { leftId: 1, rightId: 1 },
      { leftId: 2, rightId: 2 },
      { leftId: 3, rightId: 3 },
      { leftId: 4, rightId: 4 },
      { leftId: 5, rightId: 5 }
    ];
    
    // Kullanıcının seçimleri
    const selectedLeft = ref(null);
    const selectedRight = ref(null);
    
    // Yapılan eşleştirmeler
    const matches = ref([]);
    
    // İlerleme durumu
    const isComplete = computed(() => matches.value.length === leftItems.value.length);
    
    // Bir öğenin eşleştirilip eşleştirilmediğini kontrol et
    const isItemMatched = (side, index) => {
      if (side === 'left') {
        return matches.value.some(match => match.leftIndex === index);
      } else {
        return matches.value.some(match => match.rightIndex === index);
      }
    };
    
    // Bir öğe seçildiğinde
    const selectItem = (side, index) => {
      // Eğer öğe zaten eşleştirilmişse, işlem yapma
      if (side === 'left' && isItemMatched('left', index)) return;
      if (side === 'right' && isItemMatched('right', index)) return;
      
      if (side === 'left') {
        selectedLeft.value = index;
      } else {
        selectedRight.value = index;
      }
      
      // Eğer her iki taraftan da bir öğe seçilmişse, eşleştirme yap
      if (selectedLeft.value !== null && selectedRight.value !== null) {
        // Eşleştirmeyi kaydet
        matches.value.push({
          leftIndex: selectedLeft.value,
          rightIndex: selectedRight.value,
          leftId: leftItems.value[selectedLeft.value].id,
          rightId: rightItems.value[selectedRight.value].id
        });
        
        // Seçimleri sıfırla
        selectedLeft.value = null;
        selectedRight.value = null;
      }
    };
    
    // SVG çizgisi için Y pozisyonu hesapla
    const getPositionY = (side, index) => {
      // Bu değerler CSS'e göre ayarlanmalıdır
      // Gerçek uygulamada DOM ölçümleri kullanılabilir
      const itemHeight = 60; // px
      const itemMargin = 10; // px
      return (index * (itemHeight + itemMargin)) + (itemHeight / 2);
    };
    
    // Kullanıcı eşleştirmelerini doğru eşleştirmelerle karşılaştır
    const getUserMatchesAsValidatedPairs = () => {
      // Kullanıcı eşleştirmelerini pairs formatında oluştur
      return matches.value.map(match => {
        return {
          id: leftItems.value[match.leftIndex].id,
          matchId: rightItems.value[match.rightIndex].id
        };
      });
    };
    
    // Doğru eşleştirmeleri pairs formatında oluştur
    const getCorrectPairs = () => {
      return correctMatches.map(match => {
        return {
          id: match.leftId,
          matchId: match.rightId
        };
      });
    };
    
    // Cevap kontrolü - merkezi doğrulama mekanizmasını kullan
    function checkAnswer() {
      // Tüm eşleştirmeler yapılmadıysa, işlem yapma
      if (!isComplete.value) {
        return null;
      }
      
      // exerciseManager'a gerekli parametreleri gönder
      return exerciseManager.checkAnswer({
        selectedPairs: getUserMatchesAsValidatedPairs(),
        correctPairs: getCorrectPairs()
      });
    }
    
    // Durum sıfırlama
    function resetState() {
      selectedLeft.value = null;
      selectedRight.value = null;
      matches.value = [];
      exerciseManager.reset();
    }
    
    // Bir sonraki egzersize geç
    function onContinue() {
      // Önce kendimizi sıfırlayalım
      resetState();
      
      // Sonra bir sonraki adıma geçelim
      if (window.mainLayout && window.mainLayout.nextExercise) {
        window.mainLayout.nextExercise();
      }
    }
    
    // Initialize
    onMounted(() => {
      resetState();
      
      // Make this component accessible globally
      window.activeExerciseComponent = {
        checkAnswer,
        onContinue,
        renderResultContent: exerciseManager.renderResultContent
      };
    });
    
    // Watch for changes to activate check button
    watch(matches, (newVal) => {
      if (window.mainLayout) {
        window.mainLayout.canCheck.value = isComplete.value;
      }
    });
    
    return {
      title,
      audioWord,
      leftItems,
      rightItems,
      selectedLeft,
      selectedRight,
      matches,
      isComplete,
      isItemMatched,
      selectItem,
      getPositionY,
      
      // useExercise'dan gelen değerleri yayınla
      isCorrect: exerciseManager.isCorrect,
      showResult: exerciseManager.showResult
    };
  }
}
</script>

<style scoped>
.matching-exercise {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.match-grid-container {
  display: flex;
  width: 100%;
  justify-content: space-between;
  position: relative;
  min-height: 350px;
}

.left-column, .right-column {
  display: flex;
  flex-direction: column;
  width: 45%;
  gap: 10px;
}

.match-item {
  background-color: #2a2a2a;
  color: white;
  border-radius: 8px;
  padding: 15px;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 2px solid transparent;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.match-item:hover:not(.matched) {
  background-color: #3a3a3a;
}

.match-item.selected {
  border-color: #58a700;
  box-shadow: 0 0 0 2px rgba(88, 167, 0, 0.5);
}

.match-item.matched {
  background-color: #1f4b00;
  border-color: #58a700;
  cursor: default;
}

.match-lines {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: -1;
}

.match-line {
  stroke: #58a700;
  stroke-width: 2;
  stroke-dasharray: 5;
  animation: dash 1s linear infinite;
}

@keyframes dash {
  to {
    stroke-dashoffset: -10;
  }
}

/* Responsive düzenlemeler */
@media (max-width: 576px) {
  .match-grid-container {
    flex-direction: column;
    align-items: center;
    gap: 20px;
  }
  
  .left-column, .right-column {
    width: 100%;
  }
  
  .match-lines {
    display: none; /* Mobilde çizgileri gizle */
  }
}
</style>
