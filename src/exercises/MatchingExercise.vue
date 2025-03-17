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
          <SelectionCard v-for="(item, index) in leftItems" :key="`left-${index}`" :isSelected="selectedLeft === index"
            :isMatched="matchedItems.left.includes(index)" :isCorrectMatch="correctMatches.includes(index)"
            :isWrongMatch="wrongMatches.left.includes(index)"
            :isDisabled="matchedItems.left.includes(index) || isAnimating" @select="selectItem('left', index)"
            class="match-item">
            <div class="card-text-container">
              <span class="card-text-index">{{ index + 1 }}</span>
              <div class="card-text">
                <span>{{ item.text }}</span>
              </div>
            </div>
          </SelectionCard>
        </div>

        <!-- Sağ taraf (karşılıklar/cevaplar) -->
        <div class="right-column">
          <SelectionCard v-for="(item, index) in rightItems" :key="`right-${index}`"
            :isSelected="selectedRight === index" :isMatched="matchedItems.right.includes(index)"
            :isCorrectMatch="correctMatches.includes(index)" :isWrongMatch="wrongMatches.right.includes(index)"
            :isDisabled="matchedItems.right.includes(index) || isAnimating" @select="selectItem('right', index)"
            class="match-item">
            <div class="card-text-container">
              <span class="card-text-index">{{ index + 1 }}</span>
              <div class="card-text">
                <span>{{ item.text }}</span>
              </div>
            </div>
          </SelectionCard>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'MatchingExercise',
  components: {
    SelectionCard: Vue.defineAsyncComponent(() => window["vue3-sfc-loader"].loadModule("./src/components/common/SelectionCard.vue", window.sfcOptions))
  },
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
.exercise-component {
  width: 100%;
}

.matching-exercise {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  max-width: 600px;
  margin: 0 auto;
}

.match-grid-container {
  display: flex;
  justify-content: space-between;
  width: 100%;
  gap: 20px;
}

.left-column,
.right-column {
  display: flex;
  flex-direction: column;
  width: 48%;
  gap: 12px;
}

.match-item {
  width: 100%;
  text-align: center;
  min-height: 0px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 0px;
}



.card-text-container {
  width: 100%;
  align-items: center;
  display: flex;
  justify-content: space-between;
  padding: 0px 16px;
}

.card-text {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;

}

.card-text span {
  font-size: 19px;
  font-weight: 500;
}

.card-text-index {
  display: inline-flex;
  align-items: center;
  border: 3px solid var(--color-swan);
  border-radius: 8px;
  color: var(--color-hare);
  font-size: 15px;
  height: 30px;
  justify-content: center;
  width: 30px;
  flex-shrink: 0;
  font-weight: 900;
}

/* Selected state styling for card-text-index */
:deep(.selection-card.selected .card-text-index) {
  border-color: var(--color-blue-jay);
  color: var(--color-whale);
}

/* Correct match state styling for card-text-index */
:deep(.selection-card.correct-match .card-text-index) {
  border-color: var(--color-owl);
  color: var(--color-owl);
}

/* Wrong match state styling for card-text-index */
:deep(.selection-card.wrong-match .card-text-index) {
  border-color: var(--color-cardinal);
  color: var(--color-cardinal);
}

/* Animasyon Stilleri */
@keyframes pulse {
  0% {
    transform: scale(1);
  }

  50% {
    transform: scale(1.05);
  }

  100% {
    transform: scale(1);
  }
}

@keyframes shake {
  0% {
    transform: translateX(0);
  }

  25% {
    transform: translateX(-5px);
  }

  50% {
    transform: translateX(5px);
  }

  75% {
    transform: translateX(-5px);
  }

  100% {
    transform: translateX(0);
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }

  to {
    opacity: 1;
  }
}

@keyframes fadeOut {
  from {
    opacity: 1;
  }

  to {
    opacity: 0;
  }
}

/* Responsive Tasarım */
@media (max-width: 768px) {
  .match-grid-container {
    flex-direction: column;
  }

  .left-column,
  .right-column {
    width: 100%;
  }
}
</style>
