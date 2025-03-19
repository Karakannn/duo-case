<template>
    <div ref="wordElement" class="fill-word" :class="{
        'in-origin': location === 'origin',
        'in-destination': location === 'destination',
        'word-correct': isCorrect,
        'word-incorrect': isIncorrect,
        'wave-animation': isWaving,
        'disabled': isDisabled
    }" @click="handleClick">
        {{ text }}
    </div>
</template>

<script>
export default {
    name: 'FillWord',
    props: {
        text: {
            type: String,
            required: true
        },
        index: {
            type: Number,
            required: true
        },
        blankElementRef: {
            type: [Object, HTMLElement],
            required: true
        },
        isCorrect: {
            type: Boolean,
            default: false
        },
        isIncorrect: {
            type: Boolean,
            default: false
        },
        isDisabled: {
            type: Boolean,
            default: false
        }
    },
    data() {
        return {
            location: 'origin',
            isAnimating: false,
            isWaving: false,
            uniqueId: `word-${Math.random().toString(36).substr(2, 9)}`,
            containerUniqueId: `container-${Math.random().toString(36).substr(2, 9)}`,
            animation: null,
            containerRef: null,
            originalContainerRef: null,
            wordWidth: 0,
            wordHeight: 0
        }
    },
    watch: {
        isCorrect(newVal) {
            if (newVal) this.startWaveAnimation();
        },
        isIncorrect(newVal) {
            if (newVal) this.startWaveAnimation();
        }
    },
    mounted() {
        this.containerRef = this.$el.parentElement;
        this.originalContainerRef = this.$el.parentElement;

        this.$nextTick(() => {
            if (this.$refs.wordElement) {
                this.measureWordDimensions();
            }
        });

        if (this.originalContainerRef) {
            this.originalContainerRef.dataset.containerId = this.containerUniqueId;
            this.setContainerDimensions(this.originalContainerRef);
        }

        window.addEventListener('resize', this.handleResize);
    },
    beforeDestroy() {
        window.removeEventListener('resize', this.handleResize);
        if (this.animation) {
            this.animation.cancel();
        }
    },
    methods: {
        setContainerDimensions(container) {
            if (container && this.wordWidth && this.wordHeight) {
                const extraSpace = 0;

                container.style.width = `${this.wordWidth + extraSpace}px`;
                container.style.height = `${this.wordHeight + extraSpace}px`;
                container.style.minWidth = `${this.wordWidth + extraSpace}px`;
                container.style.minHeight = `${this.wordHeight + extraSpace}px`;
                container.style.boxSizing = 'border-box';
            }
        },

        measureWordDimensions() {
            const element = this.$refs.wordElement;
            if (element) {
                const computedStyle = window.getComputedStyle(element);
                const marginLeft = parseFloat(computedStyle.marginLeft) || 0;
                const marginRight = parseFloat(computedStyle.marginRight) || 0;
                const marginTop = parseFloat(computedStyle.marginTop) || 0;
                const marginBottom = parseFloat(computedStyle.marginBottom) || 0;

                this.wordWidth = element.offsetWidth;
                this.wordHeight = element.offsetHeight;

                this.setContainerDimensions(this.originalContainerRef);
            }
        },

        reset() {
            if (this.location !== 'origin') {
                this.moveToOrigin();
            }
        },

        handleClick() {
            if (this.isAnimating || this.isDisabled) return;

            this.$emit('word-selected', {
                index: this.index,
                text: this.text,
                location: this.location
            });
        },

        startWaveAnimation() {
            this.isWaving = true;

            setTimeout(() => {
                this.isWaving = false;
            }, 500);
        },

        handleResize() {
            if (this.animation) {
                this.animation.cancel();
                this.isAnimating = false;
            }

            this.$nextTick(() => {
                if (this.$refs.wordElement && this.location === 'origin') {
                    this.measureWordDimensions();
                }
            });
        },

        moveToOrigin() {
            if (this.isAnimating) return Promise.reject('Animation already in progress');

            return new Promise((resolve, reject) => {
                const element = this.$refs.wordElement;

                if (this.location === 'origin') {
                    return resolve();
                }

                const first = element.getBoundingClientRect();
                const container = document.querySelector(`[data-container-id="${this.containerUniqueId}"]`);

                if (!container) {
                    return reject('Original container not found');
                }

                if (element.contains(container)) {
                    return reject('DOM hierarchy error');
                }

                this.location = 'origin';

                try {
                    container.appendChild(element);
                    const last = element.getBoundingClientRect();

                    this.isAnimating = true;
                    this.$emit('animation-start', { index: this.index, text: this.text, location: this.location });

                    this.animation = element.animate(
                        [
                            { transform: `translate(${first.left - last.left}px, ${first.top - last.top}px)` },
                            { transform: 'translate(0, 0)' }
                        ],
                        {
                            duration: 200,
                            easing: 'ease'
                        }
                    );

                    this.animation.onfinish = () => {
                        this.isAnimating = false;
                        this.$emit('animation-end', {
                            index: this.index,
                            text: this.text,
                            location: this.location
                        });
                        resolve();
                    };

                    this.animation.oncancel = () => {
                        this.isAnimating = false;
                        resolve();
                    };
                } catch (error) {
                    this.isAnimating = false;
                    reject(error);
                }
            });
        },

        moveToDestination() {
            if (this.isAnimating) return Promise.reject('Animation already in progress');

            return new Promise((resolve, reject) => {
                const element = this.$refs.wordElement;
                const first = element.getBoundingClientRect();

                if (!this.wordWidth || !this.wordHeight) {
                    this.measureWordDimensions();
                }

                let blankElement = null;
                if (this.blankElementRef) {
                    if (this.blankElementRef.$el) {
                        blankElement = this.blankElementRef.$el;
                    } else if (Array.isArray(this.blankElementRef)) {
                        blankElement = this.blankElementRef[0];
                    } else if (this.blankElementRef instanceof HTMLElement) {
                        blankElement = this.blankElementRef;
                    }
                }

                if (!blankElement) {
                    return reject('No valid blank element found');
                }

                while (blankElement.firstChild) {
                    blankElement.removeChild(blankElement.firstChild);
                }

                element.dataset.wordId = this.uniqueId;

                if (this.containerRef && !this.containerRef.dataset.containerId) {
                    this.containerRef.dataset.containerId = this.containerUniqueId;
                    this.originalContainerRef = this.containerRef;
                }

                this.location = 'destination';
                blankElement.appendChild(element);
                const last = element.getBoundingClientRect();

                this.isAnimating = true;
                this.$emit('animation-start', { index: this.index, text: this.text, location: this.location });

                this.animation = element.animate(
                    [
                        { transform: `translate(${first.left - last.left}px, ${first.top - last.top}px)` },
                        { transform: 'translate(0, 0)' }
                    ],
                    {
                        duration: 200,
                        easing: 'ease-out'
                    }
                );

                this.animation.onfinish = () => {
                    this.isAnimating = false;
                    this.$emit('animation-end', {
                        index: this.index,
                        text: this.text,
                        location: this.location
                    });
                    resolve();
                };

                this.animation.oncancel = () => {
                    this.isAnimating = false;
                    resolve();
                };
            });
        }
    }
}
</script>

<style scoped>
.fill-word {
    appearance: none;
    all: unset;
    box-sizing: border-box;
    background: #122023;
    border: 1px solid #596265;
    padding: 0.5rem;
    border-radius: 0.5rem;
    cursor: pointer;
    font-weight: 700;
    user-select: none;
    color: #fff;
    font-size: 16px;
    position: relative;
    z-index: 1;
}

.fill-word:active,
.fill-word:focus {
    background: #1a2f33;
}

.fill-word.in-destination {
    margin: 0 0.125rem 0.5rem;
}

.fill-word.in-origin {
    transition: transform 0.25s ease;
}

.fill-word.word-correct {
    color: var(--internal-color-success) !important;
    background-color: var(--internal-background-color-success);
    border: 2px solid var(--internal-border-success);
}

.fill-word.word-incorrect {
    border: 2px solid var(--internal-border-error, #e86f6f);
    color: var(--internal-color-error, #e86f6f) !important;
}

.fill-word.disabled {
    pointer-events: none;
    cursor: default;
}

@keyframes mexicanWave {
    0% {
        transform: translateY(0);
    }

    25% {
        transform: translateY(-10px);
    }

    50% {
        transform: translateY(0);
    }

    75% {
        transform: translateY(5px);
    }

    100% {
        transform: translateY(0);
    }
}

.wave-animation {
    animation: mexicanWave 0.5s ease;
}

@media (min-width: 700px) {
    .fill-word {
        font-size: 19px;
    }
}
</style>