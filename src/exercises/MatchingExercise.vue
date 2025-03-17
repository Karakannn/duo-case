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
          <button 
            v-for="(item, index) in leftItems" 
            :key="`left-${index}`"
            class="match-item"
            :class="{ 
              'selected': selectedLeft === index,
              'matched': matchedItems.left.includes(index),
              'correct-match': correctMatches.includes(index),
              'wrong-match': wrongMatches.left.includes(index)
            }"
            @click="selectItem('left', index)"
            :disabled="matchedItems.left.includes(index) || isAnimating"
          >
            {{ item.text }}
          </button>
        </div>
        
        <!-- Sağ taraf (karşılıklar/cevaplar) -->
        <div class="right-column">
          <button 
            v-for="(item, index) in rightItems" 
            :key="`right-${index}`"
            class="match-item"
            :class="{ 
              'selected': selectedRight === index,
              'matched': matchedItems.right.includes(index),
              'correct-match': correctMatches.includes(index),
              'wrong-match': wrongMatches.right.includes(index)
            }"
            @click="selectItem('right', index)"
            :disabled="matchedItems.right.includes(index) || isAnimating"
          >
            {{ item.text }}
          </button>
        </div>
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
    const { ref, computed, onMounted, watch, nextTick } = Vue;
    
    // Gerekli kompozisyonu içe aktar
    const matchingExercise = window.useMatching();
    
    // State
    const title = ref("Eşleştirmeleri tamamlayın");
    const audioWord = ref(null);  // Eğer ses çalınacaksa
    
    // Eşleştirilecek öğeler - kompozisyondan al
    const leftItems = matchingExercise.leftItems;
    const rightItems = matchingExercise.rightItems;
    
    // Kullanıcının seçimleri
    const selectedLeft = ref(null);
    const selectedRight = ref(null);
    
    // Eşleştirilmiş öğeler
    const matchedItems = ref({
      left: [],
      right: []
    });
    
    // Doğru eşleşmeler (geçici olarak gösterilecek)
    const correctMatches = ref([]);
    
    // Yanlış eşleşmeler (geçici olarak gösterilecek)
    const wrongMatches = ref({
      left: [],
      right: []
    });
    
    // Animasyon durumu
    const isAnimating = ref(false);
    
    // Bir öğeyi seç
    const selectItem = (side, index) => {
      // Eğer animasyon çalışıyorsa, işlem yapma
      if (isAnimating.value) return;
      
      // Eğer öğe zaten eşleştirilmişse, işlem yapma
      if (side === 'left' && matchedItems.value.left.includes(index)) return;
      if (side === 'right' && matchedItems.value.right.includes(index)) return;
      
      // Eğer zaten bir seçim yapılmışsa ve aynı taraftan başka bir öğe seçiliyorsa, önceki seçimi temizle
      if (side === 'left' && selectedLeft.value !== null) {
        selectedLeft.value = index;
        return;
      }
      
      if (side === 'right' && selectedRight.value !== null) {
        selectedRight.value = index;
        return;
      }
      
      // Seçimi kaydet
      if (side === 'left') {
        selectedLeft.value = index;
      } else {
        selectedRight.value = index;
      }
      
      // Eğer her iki taraftan da bir öğe seçilmişse, eşleştirmeyi kontrol et
      if (selectedLeft.value !== null && selectedRight.value !== null) {
        const leftId = leftItems.value[selectedLeft.value].id;
        const rightId = rightItems.value[selectedRight.value].id;
        
        // Eşleştirmeyi kontrol et
        const isCorrect = matchingExercise.checkPair(leftId, rightId);
        
        // Animasyon başlat
        isAnimating.value = true;
        
        if (isCorrect) {
          // Doğru eşleşme - yeşil border göster
          correctMatches.value = [selectedLeft.value, selectedRight.value];
          
          // Eşleştirilmiş öğeleri geçici olarak kaydet
          const tempLeftIndex = selectedLeft.value;
          const tempRightIndex = selectedRight.value;
          
          // Eğer bu son eşleşme olacaksa, hemen kontrol butonunu aktif et
          if (matchedItems.value.left.length === leftItems.value.length - 1) {
            if (window.mainLayout) {
              window.mainLayout.canCheck = true;
            }
          }
          
          // 1 saniye sonra doğru eşleşmeyi kaydet ve seçimleri temizle
          setTimeout(() => {
            // Eşleştirilmiş öğeleri kaydet
            matchedItems.value.left.push(tempLeftIndex);
            matchedItems.value.right.push(tempRightIndex);
            
            // Doğru eşleşme göstergesini temizle
            correctMatches.value = [];
            
            // Seçimleri temizle
            selectedLeft.value = null;
            selectedRight.value = null;
            
            // Eşleştirmeyi composable'a bildir
            matchingExercise.matchItems(
              { id: leftId }, 
              { id: rightId }
            );
            
            // Animasyon bitti
            isAnimating.value = false;
          }, 1000);
        } else {
          // Yanlış eşleşme - kırmızı border göster
          wrongMatches.value.left.push(selectedLeft.value);
          wrongMatches.value.right.push(selectedRight.value);
          
          // 1 saniye sonra yanlış eşleşmeyi temizle
          setTimeout(() => {
            // Yanlış eşleşme göstergesini temizle
            wrongMatches.value.left = [];
            wrongMatches.value.right = [];
            
            // Seçimleri temizle
            selectedLeft.value = null;
            selectedRight.value = null;
            
            // Can azalt
            matchingExercise.decreaseHeart();
            
            // Animasyon bitti
            isAnimating.value = false;
          }, 1000);
        }
      }
    };
    
    // Tüm öğeler eşleştirildi mi kontrol et
    const checkAllMatched = () => {
      if (matchedItems.value.left.length === leftItems.value.length) {
        // Tüm öğeler eşleştirildi, kontrol butonunu etkinleştir
        if (window.mainLayout) {
          window.mainLayout.canCheck = true;
        }
      }
    };
    
    // Initialize
    onMounted(() => {
      // Kompozisyonu başlat
      matchingExercise.init();
      
      // Global erişim için
      window.activeExerciseComponent = {
        checkAnswer: matchingExercise.checkAnswer,
        onContinue: () => {
          // Bileşen durumunu sıfırla
          selectedLeft.value = null;
          selectedRight.value = null;
          matchedItems.value = { left: [], right: [] };
          correctMatches.value = [];
          wrongMatches.value = { left: [], right: [] };
          
          // Kompozisyonu sıfırla
          matchingExercise.reset();
          
          // Sonraki egzersize geç
          if (window.mainLayout?.nextExercise) {
            window.mainLayout.nextExercise();
          }
        },
        renderResultContent: matchingExercise.renderResultContent
      };
    });
    
    // Adım değiştiğinde veriyi güncelle
    const stepStore = window.useStepStore();
    if (stepStore) {
      watch(() => stepStore.currentStepId.value, () => {
        matchingExercise.init();
        // Bileşen durumunu sıfırla
        selectedLeft.value = null;
        selectedRight.value = null;
        matchedItems.value = { left: [], right: [] };
        correctMatches.value = [];
        wrongMatches.value = { left: [], right: [] };
      });
    }
    
    return {
      title,
      audioWord,
      leftItems,
      rightItems,
      selectedLeft,
      selectedRight,
      matchedItems,
      correctMatches,
      wrongMatches,
      isAnimating,
      selectItem
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
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  font-size: 1.1rem;
  user-select: none;
  background-color: rgba(255, 255, 255, 0.1);
  color: white !important;
  border: 2px solid transparent;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.match-item:hover:not(:disabled) {
  background-color: rgba(255, 255, 255, 0.15);
}

.match-item.selected {
  background-color: #007bff;
  color: white !important;
}

.match-item.matched {
  background-color: rgba(255, 255, 255, 0.05);
  color: rgba(255, 255, 255, 0.5) !important;
  border: 2px solid #28a745;
  cursor: default;
}

.match-item.correct-match {
  border: 2px solid #28a745;
  background-color: rgba(40, 167, 69, 0.2);
  color: white !important;
}

.match-item.wrong-match {
  border: 2px solid #dc3545;
  background-color: rgba(220, 53, 69, 0.2);
  color: white !important;
}

.match-item:disabled:not(.matched):not(.correct-match):not(.wrong-match) {
  opacity: 1;
  cursor: not-allowed;
}
</style>
