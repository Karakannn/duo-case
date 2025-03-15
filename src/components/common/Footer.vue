<template>
    <div class="footer" :class="footerStateClass">
        <div class="footer-status" v-if="showResult">
            <div v-if="isCorrect" class="correct-answer d-flex align-items-center">
                <i class="fas fa-check-circle text-success me-2"></i>
                <span class="fw-bold">Aferin!</span>
            </div>
            <div v-else class="incorrect-answer d-flex align-items-center">
                <i class="fas fa-times-circle text-danger me-2"></i>
                <span class="fw-bold">Doğru cevap:</span>
                <span class="ms-2" v-if="correctAnswer">{{ correctAnswer }}</span>
            </div>
        </div>

        <!-- İki tamamen farklı buton -->
        <div v-if="!showResult">
            <Button 
                id="checkAnswerButton"
                variant="primary" 
                size="lg" 
                @click="checkAnswerButton"
                :disabled="!canCheck">
                KONTROL ET
            </Button>
        </div>
        
        <div v-else>
            <Button 
                id="continueButton"
                :variant="isCorrect ? 'success' : 'danger'" 
                size="lg" 
                @click="continueButton">
                DEVAM ET
            </Button>
        </div>
    </div>
</template>

<script>
export default {
    name: 'Footer',
    components: {
        Button: Vue.defineAsyncComponent(() => window["vue3-sfc-loader"].loadModule("./src/components/common/Button.vue", window.sfcOptions))
    },
    props: {
        showResult: {
            type: Boolean,
            default: false
        },
        isCorrect: {
            type: Boolean,
            default: false
        },
        canCheck: {
            type: Boolean,
            default: false
        },
        correctAnswer: {
            type: String,
            default: ''
        }
    },
    setup(props) {
        const { computed, ref } = Vue;
        const { showResult, isCorrect, canCheck, correctAnswer } = props;
        
        // Use reactive references to sync with MainLayout state
        const showResultState = ref(showResult);
        const isCorrectState = ref(isCorrect);
        const canCheckState = ref(canCheck);
        const correctAnswerState = ref(correctAnswer);

        // Computed properties for footer state and button text
        const footerStateClass = computed(() => {
            if (!showResultState.value) return '';
            return isCorrectState.value ? 'correct-state' : 'incorrect-state';
        });

        // Ayrı buton işleyici fonksiyonları
        const checkAnswerButton = () => {
            if (window.mainLayout && typeof window.mainLayout.checkAnswer === 'function') {
                window.mainLayout.checkAnswer();
            }
        };
        
        const continueButton = () => {
            if (window.mainLayout && typeof window.mainLayout.nextExercise === 'function') {
                window.mainLayout.nextExercise();
                
                // Sonucu sıfırla
                setTimeout(() => {
                    if (window.mainLayout && typeof window.mainLayout.resetFooter === 'function') {
                        window.mainLayout.resetFooter();
                    }
                }, 100);
            }
        };

        // Keep the component in sync with MainLayout state
        const syncWithMainLayout = () => {
            if (window.mainLayout) {
                showResultState.value = window.mainLayout.showResult.value;
                isCorrectState.value = window.mainLayout.isCorrect.value;
                canCheckState.value = window.mainLayout.canCheck.value;
                correctAnswerState.value = window.mainLayout.correctAnswer.value;
            }
        };

        // Update state every 100ms to stay in sync
        let syncInterval;
        Vue.onMounted(() => {
            syncInterval = setInterval(syncWithMainLayout, 100);
        });

        Vue.onBeforeUnmount(() => {
            clearInterval(syncInterval);
        });

        return {
            showResult: showResultState,
            isCorrect: isCorrectState,
            canCheck: canCheckState,
            correctAnswer: correctAnswerState,
            footerStateClass,
            checkAnswerButton,
            continueButton
        };
    }
};
</script>

<style scoped>
.footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem;
    background-color: #f8f9fa;
    border-top: 1px solid #dee2e6;
    position: fixed;
    bottom: 0;
    width: 100%;
    z-index: 1000;
}

.footer-status {
    flex-grow: 1;
    margin-right: 1rem;
}

.correct-state {
    background-color: #d4edda;
    border-top-color: #c3e6cb;
}

.incorrect-state {
    background-color: #f8d7da;
    border-top-color: #f5c6cb;
}
</style>