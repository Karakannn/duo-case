<template>
    <div class="footer" :class="footerStateClass">
        <div class="footer-status" v-if="showResult">
            <div v-if="isCorrect" class="correct-answer d-flex align-items-center">
                <i class="fas fa-check-circle text-success me-2"></i>
                <span class="fw-bold">Doğru!</span>
            </div>
            <div v-else class="incorrect-answer d-flex align-items-center">
                <i class="fas fa-times-circle text-danger me-2"></i>
                <span class="fw-bold">Yanlış cevap</span>
                <span class="ms-2" v-if="correctAnswer">{{ correctAnswer }}</span>
            </div>
        </div>

        <Button :variant="isCorrect ? 'secondary' : 'primary'" size="lg" @click="handleFooterButton"
            :disabled="!canCheck && !showResult">
            {{ buttonText }}
        </Button>
    </div>
</template>

<script>
export default {
    name: 'Footer',
    components: {
        Button: Vue.defineAsyncComponent(() => window["vue3-sfc-loader"].loadModule("./src/components/common/Button.vue", window.sfcOptions))
    },
    setup() {
        const { computed, ref } = Vue;

        // Use reactive references to sync with MainLayout state
        const showResult = ref(false);
        const isCorrect = ref(false);
        const canCheck = ref(false);
        const correctAnswer = ref('');

        // Computed properties for footer state and button text
        const footerStateClass = computed(() => {
            if (!showResult.value) return '';
            return isCorrect.value ? 'correct-state' : 'incorrect-state';
        });

        const buttonText = computed(() => {
            if (showResult.value) {
                return 'DEVAM ET';
            }
            return 'KONTROL ET';
        });

        // Handle button click by delegating to MainLayout
        const handleFooterButton = () => {
            if (window.mainLayout && typeof window.mainLayout.handleFooterButton === 'function') {
                window.mainLayout.handleFooterButton();
            }
        };

        // Keep the component in sync with MainLayout state
        const syncWithMainLayout = () => {
            if (window.mainLayout) {
                showResult.value = window.mainLayout.showResult.value;
                isCorrect.value = window.mainLayout.isCorrect.value;
                canCheck.value = window.mainLayout.canCheck.value;
                correctAnswer.value = window.mainLayout.correctAnswer.value;
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
            showResult,
            isCorrect,
            canCheck,
            correctAnswer,
            footerStateClass,
            buttonText,
            handleFooterButton
        };
    }
};
</script>

<style scoped>
.footer {
    position: sticky;
    bottom: 0;
    width: 100%;
    padding: 1rem;
    background-color: var(--color-footer-bg);
    border-top: 1px solid var(--color-border);
    display: flex;
    flex-direction: column;
    align-items: center;
    transition: background-color 0.3s ease;
    z-index: var(--z-fixed);
}

.footer-status {
    margin-bottom: 0.8rem;
    font-size: 1.1rem;
}

.correct-state {
    background-color: rgba(88, 167, 0, 0.1);
}

.incorrect-state {
    background-color: rgba(235, 68, 68, 0.1);
}
</style>