<template>
    <div class="footer"
        :class="{ 'correct-state': showResult && isCorrect, 'incorrect-state': showResult && !isCorrect }">
        <div class="footer-inner">
            <div class="footer-status" v-if="showResult">
                <div class="footer-status-inner" :class="isCorrect ? 'correct-answer' : 'incorrect-answer'">
                    <div class="correct-container" v-if="isCorrect">
                        <div class="correct-icon-container">
                            <img class="correct-icon"
                                src="https://d35aaqx5ub95lt.cloudfront.net/images/b377ec812acb8c96d87d52e8009478ad.svg"
                                alt="">
                        </div>

                        <div class="correct-text">
                            <h5>Congratulations!</h5>
                            <div class="report">
                                <img src="https://d35aaqx5ub95lt.cloudfront.net/images/d34573d6f0ce85b0d7d63486550fcf5d.svg"
                                    alt="">
                                <span class="report-text">REPORT</span>
                            </div>
                        </div>
                    </div>

                    <div class="incorrect-container" v-if="!isCorrect">
                        <div class="incorrect-icon-container">
                            <img class="incorrect-icon"
                                src="https://d35aaqx5ub95lt.cloudfront.net/images/bd13fa941b2407b4914296afe4435646.svg"
                                alt="">
                        </div>

                        <div class="incorrect-text">
                            <div class="answer" v-if="correctAnswer">
                                <h5>Correct answer:</h5>
                                <span>{{ correctAnswer }}</span>
                            </div>

                            <div class="report">
                                <img src="https://d35aaqx5ub95lt.cloudfront.net/images/366d3244bdf3cdc1d272f62cc42f5270.svg"
                                    alt="">
                                <span class="report-text">REPORT</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <Button class="skip-button" v-if="!showResult" :id="showResult ? 'continueButton' : 'checkAnswerButton'"
                :variant="'secondary'" @click="handleSkip()">
                SKIP
            </Button>

            <Button :class="'footer-check-button'" :id="showResult ? 'continueButton' : 'checkAnswerButton'"
                :variant="showResult && !isCorrect ? 'danger' : 'default'"
                @click="showResult ? handleContinue() : handleCheck()" :disabled="!showResult && !canCheck">
                {{ showResult ? 'CONTINUE' : 'CHECK' }}
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
        correctAnswer: { type: String, default: '' },
        correctStreak: { type: Number, default: 0 }
    },
    setup(props) {

        const handleCheck = () => {
            if (!props.canCheck) {
                return;
            }

            if (window.mainLayout?.checkAnswer) {
                window.mainLayout.checkAnswer();
            }
        };

        const handleSkip = () => {
            if (window.mainLayout?.skipExercise) {
                window.mainLayout.skipExercise();
            }
        };

        const handleContinue = () => {
            if (window.mainLayout?.nextExercise) {
                window.mainLayout.nextExercise();

                setTimeout(() => {
                    window.mainLayout?.resetFooter?.();
                }, 100);
            }
        };

        return {
            handleCheck,
            handleSkip,
            handleContinue
        };
    }
};
</script>

<style scoped>
.footer-inner {
    position: relative;
    margin: 0 auto;
    max-width: 1080px;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.footer-status {
    position: absolute;
    bottom: 0;
    left: 0;
    margin: 0 -16px;
    padding: 24px 16px 72px;
    position: absolute;
    right: 0;
    background-color: rgb(32, 47, 54);
    transform: translateY(100%);
    transition: transform 0.2s ease-out;
}

@keyframes slideUpDebounce {
    0% {
        transform: translateY(100%);
    }

    100% {
        transform: translateY(0);
    }
}

@keyframes iconBounce {
    0% {
        transform: scale(0.8);
    }

    60% {
        transform: scale(1.1);
    }

    100% {
        transform: scale(1);
    }
}

.footer-status::after {
    background-color: inherit;
    color: inherit;
    content: "";
    height: 100vh;
    left: 0;
    position: absolute;
    right: 0;
    top: 100%;
    width: 100%;
}

.footer-status-inner {
    display: grid;
}

.correct-container {
    grid-gap: 16px;
    display: grid;
    grid-auto-flow: column;
}

.correct-icon-container {
    display: none;
}

.correct-icon {
    height: 31px !important;
    width: 41px !important;
}

.correct {
    display: flex;
    gap: 16px;
    align-items: center;
}

.correct-text {
    grid-gap: 16px;
    display: grid;
    grid-auto-flow: column;
    justify-content: space-between;
    padding: 0;
    width: 100%;
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

.footer-check-button {
    width: 100%;
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

.incorrect-container {
    grid-gap: 16px;
    display: grid;
    grid-auto-flow: column;
}

.incorrect-icon-container {
    display: none;
}

.incorrect-icon {
    height: 31px !important;
    width: 41px !important;
}

.incorrect-text {
    grid-gap: 16px;
    display: grid;
    grid-auto-flow: column;
    justify-content: space-between;
    padding: 0;
    width: 100%;
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

.incorrect-icon {
    height: 31px !important;
    width: 41px !important;
}

.report-text {
    display: none;
}

@media (max-width: 700px) {
    .skip-button {
        display: none;
    }

    .footer-status {
        animation: slideUpDebounce 0.2s ease-out forwards;
        animation-timing-function: cubic-bezier(.35, 1.8, .35, .83);
    }
}

@media (min-width: 700px) {
    .footer {
        background-color: var(--color-snow);
        border-top: 2px solid var(--color-swan);
    }

    .footer-inner {
        align-items: center;
        grid-auto-rows: auto;
        grid-template-columns: repeat(5, 1fr);
        grid-template-rows: 100%;
        justify-content: space-between;
        grid-gap: 8px 16px;
        min-height: 140px;
        padding: 0 40px;
        width: 100%;
    }

    .correct-container {
        grid-template-columns: min-content 1fr;
    }

    .correct-icon-container {
        background: var(--color-snow);
        border-radius: 98px;
        display: flex;
        align-items: center;
        justify-content: center;
        float: left;
        height: 80px;
        width: 80px;
        animation: iconBounce 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
    }

    .correct-text {
        align-items: center;
        grid-auto-flow: row;
    }

    .incorrect-text {
        align-items: center;
        grid-auto-flow: row;
    }

    .incorrect-container {
        grid-template-columns: min-content 1fr;
    }

    .incorrect-icon-container {
        background: var(--color-snow);
        border-radius: 98px;
        display: flex;
        align-items: center;
        justify-content: center;
        float: left;
        height: 80px;
        width: 80px;
        animation: iconBounce 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
    }

    .footer-status {
        display: flex;
        flex-direction: column;
        grid-column: 1 / 5;
        justify-content: center;
        margin: 0;
        min-height: 140px;
        padding: 16px 0;
        position: relative;
        animation: none;
        transform: translateY(0);
    }

    .report-text {
        display: block;
    }

    .footer-check-button {
        width: max-content;
    }
}

.correct-state {
    background-color: var(--color-sea-sponge);
}

.incorrect-state {
    background-color: var(--color-walking-fish);
}
</style>