<template>
    <div ref="wordElement" class="fill-word"
        :class="{ 'in-origin': location === 'origin', 'in-destination': location === 'destination' }"
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
        }
    },
    data() {
        return {
            location: 'origin',
            isAnimating: false,
            uniqueId: `word-${Math.random().toString(36).substr(2, 9)}`,
            containerUniqueId: `container-${Math.random().toString(36).substr(2, 9)}`,
            animation: null,
            containerRef: null,
            originalContainerRef: null,
            wordWidth: 0,
            wordHeight: 0
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
            if (this.isAnimating) return;

            console.log(`Word ${this.text} clicked, current location: ${this.location}`);

            this.$emit('word-selected', {
                index: this.index,
                text: this.text,
                location: this.location
            });
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
    position: relative;
    cursor: pointer;
    white-space: nowrap;
    font-size: 19px;
    font-weight: 600;
    letter-spacing: normal;
    text-transform: none;
    background: none;
    border: solid transparent;
    border-radius: 12px;
    border-width: 2px 2px 4px;
    color: rgb(241, 247, 251);
    height: auto;
    padding: 12px 16px;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
    transition: transform 0.2s ease, box-shadow 0.2s ease;
    will-change: transform;
    font-size: 19px;
    z-index: 1;
}

.fill-word::before {
    background-color: var(--internal-word-background);
    border: 3px solid var(--internal-word-border);
    border-radius: 12px;
    bottom: -2px;
    box-shadow: 0 2px 0;
    color: var(--internal-word-border);
    content: "";
    left: -2px;
    position: absolute;
    right: -2px;
    top: -2px;
    z-index: -1;
}

.fill-word.in-destination {}
</style>