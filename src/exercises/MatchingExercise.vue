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
  components: {},
  emits: ['complete'],
  setup(props, { emit }) {
    const { ref, computed, onMounted, watch } = Vue;
    
    // Gerekli kompozisyonu içe aktar
    const matchExercise = window.usePictureMatch();
    const exerciseBase = window.useExercise({ exerciseName: 'matching' });
    
    // State
    const title = ref("Eşleştirmeleri tamamlayın");
    const audioWord = ref(null);  // Eğer ses çalınacaksa
    
    // Eşleştirilecek öğeler
    const leftItems = ref([]);
    const rightItems = ref([]);
    
    // Doğru eşleştirmeler (id bazında)
    const correctMatches = ref([]);
    
    // Kullanıcının seçimleri
    const selectedLeft = ref(null);
    const selectedRight = ref(null);
    
    // Yapılan eşleştirmeler - state'i kompozisyondan kullan
    const matches = ref([]);
    
    // Mevcut adım bilgisini yükle
    const loadCurrentStepData = () => {
      const stepData = exerciseBase.getCurrentStepData();
      
      if (stepData && stepData.type === 'matching' && stepData.question) {
        // Adım verisinden soru bilgisini al
        if (stepData.question.audioWord) {
          audioWord.value = stepData.question.audioWord;
        } else {
          audioWord.value = null;
        }
        
        // Eşleştirme öğelerini yükle
        if (stepData.question.leftItems && stepData.question.rightItems) {
          leftItems.value = stepData.question.leftItems;
          rightItems.value = stepData.question.rightItems;
          
          // Doğru eşleştirmeleri belirle
          if (stepData.question.correctMatches) {
            correctMatches.value = stepData.question.correctMatches;
          } else {
            // Eğer doğru eşleştirmeler belirtilmemişse, varsayılan olarak aynı index'leri eşleştir
            correctMatches.value = leftItems.value.map((item, index) => ({
              leftId: item.id,
              rightId: rightItems.value[index].id
            }));
          }
        } else {
          // Varsayılan değerleri kullan
          loadDefaultData();
        }
        
        console.log('Matching exercise loaded with data:', stepData);
      } else {
        // Adım verisi bulunamazsa varsayılan değerleri kullan
        loadDefaultData();
        console.warn('No matching step data found for Matching, using default values');
      }
      
      // Bileşen durumunu sıfırla
      selectedLeft.value = null;
      selectedRight.value = null;
      matches.value = [];
      
      // Egzersiz için global değişkenleri güncelle
      window.currentExercise = {
        correctPairs: formatCorrectPairs()
      };
    };
    
    // Varsayılan değerleri yükle
    const loadDefaultData = () => {
      leftItems.value = [
        { id: 1, text: "bir" },
        { id: 2, text: "dört" },
        { id: 3, text: "otuz" },
        { id: 4, text: "otobüs" },
        { id: 5, text: "kedi" }
      ];
      
      rightItems.value = [
        { id: 1, text: "one" },
        { id: 2, text: "four" },
        { id: 3, text: "thirty" },
        { id: 4, text: "bus" },
        { id: 5, text: "cat" }
      ];
      
      correctMatches.value = [
        { leftId: 1, rightId: 1 },
        { leftId: 2, rightId: 2 },
        { leftId: 3, rightId: 3 },
        { leftId: 4, rightId: 4 },
        { leftId: 5, rightId: 5 }
      ];
    };
    
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
        const newMatch = {
          leftIndex: selectedLeft.value,
          rightIndex: selectedRight.value,
          leftId: leftItems.value[selectedLeft.value].id,
          rightId: rightItems.value[selectedRight.value].id
        };
        
        matches.value.push(newMatch);
        
        // Kompozisyona bildir
        matchExercise.matchItems(
          { id: newMatch.leftId }, 
          { id: newMatch.rightId }
        );
        
        // Seçimleri sıfırla
        selectedLeft.value = null;
        selectedRight.value = null;
      }
    };
    
    // SVG çizgisi için Y pozisyonu hesapla
    const getPositionY = (side, index) => {
      const itemHeight = 60; // px
      const itemMargin = 10; // px
      return (index * (itemHeight + itemMargin)) + (itemHeight / 2);
    };
    
    // Doğru eşleştirmeleri formatla
    const formatCorrectPairs = () => {
      return correctMatches.value.map(match => ({
        id: match.leftId,
        matchId: match.rightId
      }));
    };
    
    // Initialize
    onMounted(() => {
      // Adım verisini yükle
      loadCurrentStepData();
      
      // Kompozisyonu sıfırla
      matchExercise.reset();
      
      // Global erişim için
      window.activeExerciseComponent = {
        checkAnswer: matchExercise.checkAnswer,
        onContinue: () => {
          // Bileşen durumunu sıfırla
          selectedLeft.value = null;
          selectedRight.value = null;
          matches.value = [];
          
          // Kompozisyonu sıfırla
          matchExercise.reset();
          
          // Sonraki egzersize geç
          if (window.mainLayout?.nextExercise) {
            window.mainLayout.nextExercise();
          }
        },
        renderResultContent: matchExercise.renderResultContent
      };
    });
    
    // Adım değiştiğinde veriyi güncelle
    const stepStore = window.useStepStore();
    if (stepStore) {
      watch(() => stepStore.currentStepId.value, () => {
        loadCurrentStepData();
        matchExercise.reset();
      });
    }
    
    return {
      title,
      audioWord,
      leftItems,
      rightItems,
      matches,
      selectedLeft,
      selectedRight,
      isComplete,
      isItemMatched,
      selectItem,
      getPositionY
    };
  }
}
</script>

<style scoped>
.matching-exercise {
  position: relative;
  max-width: 900px;
  margin: 0 auto;
}

.audio-container {
  margin-bottom: 20px;
}

.audio-button {
  cursor: pointer;
  display: inline-block;
}

.match-grid-container {
  display: flex;
  justify-content: space-between;
  position: relative;
  z-index: 10;
}

.left-column,
.right-column {
  width: 45%;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.match-item {
  background-color: rgba(255, 255, 255, 0.1);
  color: white;
  padding: 15px;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s ease;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  font-size: 1.1rem;
  user-select: none;
}

.match-item:hover {
  background-color: rgba(255, 255, 255, 0.15);
}

.match-item.selected {
  background-color: #007bff;
  border-color: #0056b3;
}

.match-item.matched {
  background-color: #28a745;
  cursor: default;
}

.match-lines {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 5;
  pointer-events: none;
}

.match-lines-svg {
  position: absolute;
  top: 0;
  left: 0;
}

.match-line {
  stroke: rgba(255, 255, 255, 0.7);
  stroke-width: 2;
}
</style>
