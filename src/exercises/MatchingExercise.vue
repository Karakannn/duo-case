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
      <!-- Sol taraf (sorular/ifadeler) -->
      <SelectionCard v-for="(item, index) in leftItems" :key="`left-${index}`" :isSelected="selectedLeft === index"
        :isMatched="matchedItems.left.includes(index)" :isCorrect="correctMatches.includes(index)" :isDisabled="matchedItems.left.includes(index) ||
          (isAnimating && (index === selectedLeft || wrongMatches.left.includes(index)))"
        @select="selectItem('left', index)" class="match-item">
        <div class="card-text-container">
          <span class="card-text-index">{{ index + 1 }}</span>
          <div class="card-text">
            <span>{{ item.text }}</span>
          </div>
        </div>
      </SelectionCard>

      <!-- Sağ taraf (karşılıklar/cevaplar) -->
      <SelectionCard v-for="(item, index) in rightItems" :key="`right-${index}`" :isSelected="selectedRight === index"
        :isMatched="matchedItems.right.includes(index)" :isCorrect="correctMatches.includes(index)" :isDisabled="matchedItems.right.includes(index) ||
          (isAnimating && (index === selectedRight || wrongMatches.right.includes(index)))"
        @select="selectItem('right', index)" class="match-item">
        <div class="card-text-container">
          <span class="card-text-index">{{ index + 1 }}</span>
          <div class="card-text">
            <span>{{ item.text }}</span>
          </div>
        </div>
      </SelectionCard>
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
          // Doğru eşleşme - correctMatches'e soldaki ve sağdaki indexleri ekle
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
            // Eşleştirilmiş öğeleri kaydet - animasyon SONRASI disabled olmaları için
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
          wrongMatches.value.left = [selectedLeft.value];
          wrongMatches.value.right = [selectedRight.value];

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
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.matching-exercise {
  display: grid;
  grid-gap: 16px 20px;
  grid-auto-flow: column;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  grid-template-rows: repeat(5, 76px);
  justify-content: center;
  max-height: 100%;
}

.match-item {
  width: 100%;
  text-align: center;
  min-height: 0px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 12px 0px;
  height: 100%;
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

/* /
:deep(.selection-card.selected .card-text-index) {
  border-color: var(--color-blue-jay);
  color: var(--color-whale);
}

:deep(.selection-card.correct-match .card-text-index) {
  border-color: var(--color-owl);
  color: var(--color-owl);
}


:deep(.selection-card.wrong-match .card-text-index) {
  border-color: var(--color-cardinal);
  color: var(--color-cardinal);
} */

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

@media (max-width: 700px) {
  .card-text-index {
    display: none;
  }
}

@media (min-width: 700px) {
  .match-item {
    justify-content: flex-start;
    height: auto;
    padding: 8px 0px;
  }

  .matching-exercise {
    grid-gap: 10px 30px;
    grid-template-columns: repeat(2, 255px);
    grid-template-rows: repeat(5, 1fr);

  }
}
</style>
