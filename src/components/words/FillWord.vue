<template>
    <div ref="wordElement" class="fill-word"
        :class="{ 
            'in-origin': location === 'origin', 
            'in-destination': location === 'destination',
            'word-correct': isCorrect,
            'word-incorrect': isIncorrect,
            'wave-animation': isWaving,
            'disabled': isDisabled
        }"
        @click="handleClick">
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

        // Kelime boyutlarını ölç ve sakla
        this.$nextTick(() => {
            if (this.$refs.wordElement) {
                this.measureWordDimensions();
            }
        });

        // Orijinal container'ı işaretle
        if (this.originalContainerRef) {
            this.originalContainerRef.dataset.containerId = this.containerUniqueId;

            // Container stilini burada ayarla, animasyon sırasında değişmesin
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
        // Container boyutlarını düzenle
        setContainerDimensions(container) {
            if (container && this.wordWidth && this.wordHeight) {
                // Kelimenin tam boyutu kadar olması için padding eklemiyoruz
                // Sadece ekstra marginler veya padding için 2px ekleyebiliriz
                const extraSpace = 0; // Hiç extra space olmadan tam kelime boyutu

                container.style.width = `${this.wordWidth + extraSpace}px`;
                container.style.height = `${this.wordHeight + extraSpace}px`;
                container.style.minWidth = `${this.wordWidth + extraSpace}px`;
                container.style.minHeight = `${this.wordHeight + extraSpace}px`;
                container.style.boxSizing = 'border-box'; // Ölçüm border dahil olsun
            }
        },

        // Kelime boyutlarını ölç
        measureWordDimensions() {
            const element = this.$refs.wordElement;
            if (element) {
                // Kelimenin toplam boyutunu hesaplarken marjinleri de dahil et
                const computedStyle = window.getComputedStyle(element);
                const marginLeft = parseFloat(computedStyle.marginLeft) || 0;
                const marginRight = parseFloat(computedStyle.marginRight) || 0;
                const marginTop = parseFloat(computedStyle.marginTop) || 0;
                const marginBottom = parseFloat(computedStyle.marginBottom) || 0;

                // Kelimenin kendi boyutu (marjinler dahil)
                this.wordWidth = element.offsetWidth;
                this.wordHeight = element.offsetHeight;

                // Detaylı boyut bilgilerini konsola yaz
               /*  console.log(`[${this.text}] Kelime - Ölçülen Boyutlar:`, {
                    width: element.offsetWidth,
                    height: element.offsetHeight,
                    computedWidth: parseFloat(computedStyle.width),
                    computedHeight: parseFloat(computedStyle.height),
                    marginLeft,
                    marginRight,
                    marginTop,
                    marginBottom,
                    totalWidth: this.wordWidth,
                    totalHeight: this.wordHeight
                }); */

                // Container'ı boyutlandır
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

            console.log(`Word ${this.text} clicked, current location: ${this.location}`);

            this.$emit('word-selected', {
                index: this.index,
                text: this.text,
                location: this.location
            });
        },

        startWaveAnimation() {
            this.isWaving = true;
            
            // Reset wave animation after it completes
            setTimeout(() => {
                this.isWaving = false;
            }, 500); // Animation duration
        },

        handleResize() {
            // Cancel any ongoing animation if the window is resized
            if (this.animation) {
                this.animation.cancel();
                this.isAnimating = false;
            }

            // Resize sonrası kelime boyutları güncellenebilir, kontrol et
            this.$nextTick(() => {
                if (this.$refs.wordElement && this.location === 'origin') {
                    this.measureWordDimensions();
                }
            });
        },

        moveToOrigin() {
            if (this.isAnimating) return Promise.reject('Animation already in progress');

            console.log(`Moving word to origin: ${this.text}`);

            return new Promise((resolve, reject) => {
                const element = this.$refs.wordElement;

                // Element zaten orijinal konumundaysa bir şey yapma
                if (this.location === 'origin') {
                    console.log('Word already in origin position');
                    return resolve();
                }

                // İlk pozisyonu al
                const first = element.getBoundingClientRect();

                // İlk pozisyon boyutlarını konsola yaz
                console.log(`[${this.text}] Destination Konumunda - Pozisyon ve Boyut:`, {
                    left: first.left,
                    top: first.top,
                    width: first.width,
                    height: first.height
                });

                // Orijinal container'ı bul
                const container = document.querySelector(`[data-container-id="${this.containerUniqueId}"]`);

                if (!container) {
                    console.error('Original container not found with ID:', this.containerUniqueId);
                    return reject('Original container not found');
                }

                // Container boyutlarını konsola yaz
                console.log(`[${this.text}] Origin Container - Boyutlar:`, {
                    width: container.offsetWidth,
                    height: container.offsetHeight,
                    style: {
                        width: container.style.width,
                        height: container.style.height,
                        minWidth: container.style.minWidth,
                        minHeight: container.style.minHeight
                    }
                });

                // DOM döngüsü kontrolü - çocuğu ebeveyne ekleme hatası
                if (element.contains(container)) {
                    console.error('DOM hierarchy error: child contains the parent');
                    return reject('DOM hierarchy error');
                }

                // Konum belirle ve durumu güncelle
                this.location = 'origin';

                try {
                    // Elementi orijinal konumuna taşı
                    container.appendChild(element);

                    // Yeni pozisyonu al
                    const last = element.getBoundingClientRect();

                    // Son pozisyon boyutlarını konsola yaz
                    console.log(`[${this.text}] Origin Konumunda - Pozisyon ve Boyut:`, {
                        left: last.left,
                        top: last.top,
                        width: last.width,
                        height: last.height,
                        hareket: {
                            x: first.left - last.left,
                            y: first.top - last.top
                        }
                    });

                    // FLIP animasyonu ile hareket ettir
                    this.isAnimating = true;
                    this.$emit('animation-start', { index: this.index, text: this.text, location: this.location });

                    // FLIP animasyonu
                    this.animation = element.animate(
                        [
                            { transform: `translate(${first.left - last.left}px, ${first.top - last.top}px)` },
                            { transform: 'translate(0, 0)' }
                        ],
                        {
                            duration: 200, // Daha hızlı animasyon
                            easing: 'ease'
                        }
                    );

                    // Animasyon bittiğinde
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
                    console.error('Error during moveToOrigin:', error);
                    this.isAnimating = false;
                    reject(error);
                }
            });
        },

        moveToDestination() {
            if (this.isAnimating) return Promise.reject('Animation already in progress');

            console.log(`Moving word to destination: ${this.text}`);

            return new Promise((resolve, reject) => {
                // Başlangıç pozisyonunu al
                const element = this.$refs.wordElement;
                const first = element.getBoundingClientRect();

                // Başlangıç pozisyon boyutlarını konsola yaz
                console.log(`[${this.text}] Origin Konumunda - Pozisyon ve Boyut:`, {
                    left: first.left,
                    top: first.top,
                    width: first.width,
                    height: first.height
                });

                // Kelime boyutlarını yeniden ölç ve sakla
                if (!this.wordWidth || !this.wordHeight) {
                    this.measureWordDimensions();
                }

                // Blank alanının referansını al
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
                    console.error('No valid blank element found');
                    return reject('No valid blank element found');
                }

                // Blank alanında başka bir eleman varsa, önce onu temizle
                while (blankElement.firstChild) {
                    blankElement.removeChild(blankElement.firstChild);
                }

                // Blank container'ın boyutunu takip et
                const blankWidth = blankElement.offsetWidth;
                const blankHeight = blankElement.offsetHeight;

                // Blank container özelliklerini logla
                console.log(`[${this.text}] Blank Container - Başlangıç Boyutları:`, {
                    width: blankWidth,
                    height: blankHeight
                });

                // Element'i işaretle
                element.dataset.wordId = this.uniqueId;

                // Orijinal container'ı işaretle (zaten yapmadıysak)
                if (this.containerRef && !this.containerRef.dataset.containerId) {
                    this.containerRef.dataset.containerId = this.containerUniqueId;
                    this.originalContainerRef = this.containerRef;
                }

                // Konum belirle ve durumu güncelle
                this.location = 'destination';

                // Elementi hedef konumuna taşı
                blankElement.appendChild(element);

                // Yeni pozisyonu al
                const last = element.getBoundingClientRect();

                // Hedef pozisyon boyutlarını konsola yaz
                console.log(`[${this.text}] Destination Konumunda - Pozisyon ve Boyut:`, {
                    left: last.left,
                    top: last.top,
                    width: last.width,
                    height: last.height,
                    hareket: {
                        x: first.left - last.left,
                        y: first.top - last.top
                    }
                });

                // FLIP animasyonu ile hareket ettir
                this.isAnimating = true;
                this.$emit('animation-start', { index: this.index, text: this.text, location: this.location });

                // FLIP animasyonu
                this.animation = element.animate(
                    [
                        { transform: `translate(${first.left - last.left}px, ${first.top - last.top}px)` },
                        { transform: 'translate(0, 0)' }
                    ],
                    {
                        duration: 200, // Daha hızlı animasyon
                        easing: 'ease-out'
                    }
                );

                // Animasyon bittiğinde
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

/* Mexican Wave Animation */
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