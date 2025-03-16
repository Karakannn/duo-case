<template>
    <div class="footer"
        :class="{ 'correct-state': showResult && isCorrect, 'incorrect-state': showResult && !isCorrect }">
        <!-- Result status section -->
        <div class="footer-inner">
            <div class="footer-status" v-if="showResult">
                <div class="d-flex align-items-center" :class="isCorrect ? 'correct-answer' : 'incorrect-answer'">

                    <div v-if="isCorrect" class="correct">
                        <div class="correct-container">
                            <img src="https://d35aaqx5ub95lt.cloudfront.net/images/b377ec812acb8c96d87d52e8009478ad.svg"
                                alt="">
                        </div>

                        <div class="correct-text">
                            <h5>Tebrikler!</h5>
                            <div class="report">
                                <img src="https://d35aaqx5ub95lt.cloudfront.net/images/d34573d6f0ce85b0d7d63486550fcf5d.svg"
                                    alt="">
                                <span>BİLDİR</span>
                            </div>
                        </div>
                    </div>

                    <div v-if="!isCorrect" class="incorrect">
                        <div class="incorrect-container">
                            <img src="https://d35aaqx5ub95lt.cloudfront.net/images/bd13fa941b2407b4914296afe4435646.svg"
                                alt="">
                        </div>

                        <div class="incorrect-text">
                            <div class="answer">
                                <h5>Doğru cevap:</h5>
                                <span v-if="correctAnswer">{{ correctAnswer }}</span>
                            </div>

                            <div class="report">
                                <img src="https://d35aaqx5ub95lt.cloudfront.net/images/366d3244bdf3cdc1d272f62cc42f5270.svg"
                                    alt="">
                                <span>BİLDİR</span>
                            </div>
                        </div>
                    </div>

                </div>
            </div>

            <Button v-if="!showResult" :id="showResult ? 'continueButton' : 'checkAnswerButton'" :variant="'secondary'">
                GEC
            </Button>

            <Button :id="showResult ? 'continueButton' : 'checkAnswerButton'"
                :variant="showResult && !isCorrect ? 'danger' : 'default'"
                @click="showResult ? handleContinue() : handleCheck()" :disabled="!showResult && !canCheck">
                {{ showResult ? 'DEVAM ET' : 'KONTROL ET' }}
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
        showResult: { type: Boolean, default: false },
        isCorrect: { type: Boolean, default: false },
        canCheck: { type: Boolean, default: false },
        correctAnswer: { type: String, default: '' }
    },
    setup() {
        const handleCheck = () => {
            if (window.mainLayout?.checkAnswer) {
                window.mainLayout.checkAnswer();
            }
        };

        const handleContinue = () => {
            if (window.mainLayout?.nextExercise) {
                window.mainLayout.nextExercise();

                // Reset after short delay
                setTimeout(() => {
                    window.mainLayout?.resetFooter?.();
                }, 100);
            }
        };

        return {
            handleCheck,
            handleContinue
        };
    }
};
</script>

<style scoped>
.footer {
    height: 100%;
    max-height: 140px;
    background-color: var(--color-snow);
    border-top: 2px solid var(--color-swan);
}

.footer-inner {
    margin: 0 auto;
    max-width: 1080px;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.footer-status {
    padding: 16px 0;
    flex-grow: 1;
    margin-right: 1rem;
}

.correct {
    display: flex;
    gap: 16px;
    align-items: center;
}


.correct-text {
    display: flex;
    flex-direction: column;
    gap: 16px;
}

.report {
    display: flex;
    gap: 5px;
    align-items: center;
    color: var(--color-tree-frog);
    opacity: 0.7;
}

.report:hover {
    filter: brightness(1.1);
}

.report img {
    height: 20px;
    width: 20px;
}

.report span {
    font-size: 14px;
}

.correct-text h5 {
    line-height: 30px;
    color: var(--color-tree-frog);
    font-size: 24px;
    font-weight: 900;
}

.correct-text span {
    text-transform: uppercase;
    font-weight: 700;
    font-size: 15px;
}

.correct-container {
    background: var(--color-snow);
    border-radius: 98px;
    display: block;
    float: left;
    height: 80px;
    width: 80px;

}

.correct-container img {
    display: block;
    margin: 27px 0 0 20px;
    height: 31px;
    width: 41px;
}

.incorrect {
    display: flex;
    gap: 16px;
    align-items: center;
}

.incorrect-text {
    display: flex;
    flex-direction: column;
    gap: 16px;
}

.answer {
    display: flex;
    flex-direction: column;
    align-items: start;

}

.incorrect-text h5 {
    line-height: 30px;
    font-size: 24px;
    font-weight: 900;
    color: var(--color-fire-ant);
    margin-bottom: 0;
}

.incorrect-text span {
    font-weight: 500;
    font-size: 18px;
    color: var(--color-fire-ant);
}

.incorrect-text .report {
    display: flex;
    gap: 5px;
    align-items: center;
    color: var(--color-fire-ant);
    opacity: 0.7;
    cursor: pointer;
}

.incorrect-text .report:hover {
    opacity: 1;
}

.incorrect-text .report img {
    height: 20px;
    width: 20px;
}

.incorrect-container {
    background: var(--color-snow);
    border-radius: 98px;
    display: block;
    float: left;
    height: 80px;
    width: 80px;
}

.incorrect-container img {
    display: block;
    margin: 27px 0 0 20px;
    height: 31px;
    width: 41px;
}

@media (min-width: 700px) {
    .footer-inner {
        min-height: 140px;
        padding: 0 40px;
        width: 100%;
    }
}

.correct-state {
    background-color: var(--color-sea-sponge);
}

.incorrect-state {
    background-color: var(--color-walking-fish);
}
</style>