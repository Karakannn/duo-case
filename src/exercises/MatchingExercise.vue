<template>
  <exercise-container :title="title">
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
  </exercise-container>
</template>

<script>
export default {
  name: 'MatchingExercise',
  components: {
    ExerciseContainer: Vue.defineAsyncComponent(() => window["vue3-sfc-loader"].loadModule("./src/components/common/ExerciseContainer.vue", window.sfcOptions))
  },
  emits: ['complete'],
  setup(props, { emit }) {
    const { ref, computed, onMounted, watch } = Vue;
    
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
    const isCorrect = ref(false);
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
        
        // Tüm öğeler eşleştirildi mi kontrol et
        if (isComplete.value) {
          checkAllMatches();
        }
        
        // Check butonu aktif edilsin
        if (window.mainLayout) window.mainLayout.canCheck.value = true;
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
    
    // Tüm eşleştirmelerin doğru olup olmadığını kontrol et
    const checkAllMatches = () => {
      // Her eşleşme doğru mu kontrol et
      const allCorrect = matches.value.every(match => {
        const leftId = leftItems.value[match.leftIndex].id;
        const rightId = rightItems.value[match.rightIndex].id;
        return correctMatches.some(cm => cm.leftId === leftId && cm.rightId === rightId);
      });
      
      isCorrect.value = allCorrect;
    };
    
    // Check answer - called by MainLayout
    const checkAnswer = () => {
      console.log('MatchingExercise - checkAnswer() çağrıldı');
      
      // Tüm eşleştirmeler yapılmadıysa, işlem yapma
      if (!isComplete.value) {
        console.log('MatchingExercise - Tüm eşleştirmeler tamamlanmadı!');
        return false;
      }
      
      // Doğru eşleştirmeleri kontrol et
      checkAllMatches();
      console.log('MatchingExercise - cevap kontrol edildi:', isCorrect.value ? 'doğru' : 'yanlış');
      
      // Update main layout
      if (window.mainLayout) {
        const mainLayout = window.mainLayout;
        
        // Cevap doğruysa puan artır
        if (isCorrect.value && window.store && typeof window.store.increaseScore === 'function') {
          window.store.increaseScore(20); // Eşleştirme zor olduğu için daha fazla puan
          console.log('MatchingExercise - Puan artırıldı:', window.store.getScore());
        }
        
        // Sonuç ekranını göster
        mainLayout.updateResultState({
          show: true,
          isCorrect: isCorrect.value,
          correctAnswer: isCorrect.value ? '' : 'Doğru eşleştirmeler gösterilemiyor'
        });
        
        // Sonucu bildir
        mainLayout.showResultModal(isCorrect.value);
      } else {
        console.error('MatchingExercise - window.mainLayout bulunamadı!');
      }
      
      return isCorrect.value;
    };
    
    // Reset exercise
    const reset = () => {
      console.log('MatchingExercise - reset() çağrıldı');
      selectedLeft.value = null;
      selectedRight.value = null;
      matches.value = [];
      isCorrect.value = false;
      if (window.mainLayout) window.mainLayout.canCheck.value = false;
    };
    
    // Handle continue action
    const onContinue = () => {
      console.log('MatchingExercise - onContinue() çağrıldı, isCorrect:', isCorrect.value);
      if (isCorrect.value) {
        console.log('MatchingExercise - emit("complete") çağrılıyor');
        emit('complete');
      } else {
        console.log('MatchingExercise - reset() çağrılıyor (yanlış cevap durumunda)');
        reset();
      }
    };
    
    // Özel sonuç içeriği oluştur
    const getResultContent = () => {
      const h = Vue.h;
      return h('div', { class: 'mb-3 p-3 rounded-3' }, [
        h('div', { class: 'mb-2 fs-5 ' + (isCorrect.value ? 'text-success' : 'text-danger') }, [
          h('i', { class: isCorrect.value ? 'fas fa-check-circle me-2' : 'fas fa-times-circle me-2' }),
          h('span', { class: 'fw-bold' }, isCorrect.value ? 'Mükemmel eşleştirme!' : 'Yanlış eşleştirmeler var')
        ])
      ]);
    };
    
    // Initialize
    onMounted(() => {
      console.log('MatchingExercise - onMounted çağrıldı');
      reset();
      if (window.activeExerciseComponent) {
        console.log('MatchingExercise - eski activeExerciseComponent sıfırlanıyor');
        window.activeExerciseComponent = null;
      }
      
      // Make this component accessible globally
      console.log('MatchingExercise - yeni activeExerciseComponent oluşturuluyor');
      window.activeExerciseComponent = {
        checkAnswer,
        isCorrect,
        getCorrectAnswerText: () => 'Eşleştirmeleri doğru yapınız',
        onContinue,
        renderResultContent: getResultContent
      };
      console.log('MatchingExercise - activeExerciseComponent:', window.activeExerciseComponent);
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
      isCorrect,
      isComplete,
      isItemMatched,
      selectItem,
      getPositionY,
      checkAnswer,
      reset,
      onContinue
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
