<template>
  <div ref="wordElement" class="word"
    :class="{ 'in-origin': location === 'origin', 'in-destination': location === 'destination' }"
    :style="{ transform: transformValue }" @click="handleClick">
    {{ text }}
  </div>
</template>

<script>
export default {
  name: 'Word',
  props: {
    text: {
      type: String,
      required: true
    },
    index: {
      type: Number,
      required: true
    },
    initialLocation: {
      type: String,
      default: 'origin',
      validator: value => ['origin', 'destination'].includes(value)
    },
    destinationContainerRef: {
      type: Object,
      required: true
    },
    destinationInnerContainerRef: {
      type: Object,
      required: true
    },
    originInnerContainerRef: {
      type: Object,
      default: null
    },
    containerId: {
      type: String,
      required: true
    },
    holderId: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      location: this.initialLocation,
      position: { x: 0, y: 0, width: 0, height: 0 },
      originalPosition: null,
      isAnimating: false,
      transformValue: '',
      originalParent: null,
      originalIndex: null
    }
  },
  computed: {
    word() {
      return this.text;
    },
    currentLocation() {
      return this.location;
    }
  },
  mounted() {
    this.originalParent = this.$el.parentElement;
    this.originalIndex = Array.from(this.originalParent.parentElement.children).indexOf(this.originalParent);

    this.$nextTick(() => {
      this.initializeElement();
      this.updatePosition();
      this.originalPosition = { ...this.position };
    });

    window.addEventListener('resize', this.handleResize);
    this.$el.addEventListener('transitionend', this.handleTransitionEnd);
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.handleResize);
    this.$el.removeEventListener('transitionend', this.handleTransitionEnd);
  },
  methods: {
    reset() {
      if (this.location !== 'origin') {
        this.moveToOrigin(true); // Force immediate move without animation
      }
    },
    
    initializeElement() {
      const rect = this.$el.getBoundingClientRect();
      if (this.holderId && this.containerId) {
        const holder = document.getElementById(this.holderId);
        const wordContainer = document.getElementById(this.containerId);
        const wordWrapper = this.originalParent;

        if (holder && wordContainer && wordWrapper) {
          const width = rect.width;
          const height = rect.height;

          // Set holder styles
          holder.style.width = `${width}px`;
          holder.style.height = `${height}px`;
          holder.style.backgroundColor = 'rgb(55, 70, 79)';
          holder.style.border = '2px solid rgb(55, 70, 79)';
          holder.style.borderRadius = '12px';
          holder.style.boxShadow = '0 2px 0';

          // Set wrapper and container dimensions
          wordWrapper.style.width = `${width}px`;
          wordWrapper.style.height = `${height}px`;
          wordContainer.style.width = `${width}px`;
          wordContainer.style.height = `${height}px`;
        }
      }
      
      // Set initial position based on location
      if (this.location === 'destination') {
        const destinationInnerContainer = this.destinationInnerContainerRef;
        if (destinationInnerContainer) {
          destinationInnerContainer.appendChild(this.$el);
        }
      }
    },
    
    updatePosition(skipEmit = false) {
      const rect = this.$el.getBoundingClientRect();
      this.position = {
        x: rect.left,
        y: rect.top,
        width: rect.width,
        height: rect.height
      };
      
      if (!skipEmit) {
        this.$emit('word-positioned', {
          index: this.index,
          position: this.position,
          location: this.location,
          word: this.text
        });
      }
    },
    
    handleClick() {
      if (this.isAnimating) return;
      
      this.isAnimating = true;
      this.$emit('animation-start', {
        index: this.index,
        location: this.location
      });
      
      // Toggle location
      this.location === 'origin' ? this.moveToDestination() : this.moveToOrigin();
      
      this.$emit('click', {
        index: this.index,
        location: this.location,
        position: this.position
      });
    },
    
    handleTransitionEnd(event) {
      if (event.propertyName === 'transform') {
        this.isAnimating = false;
        this.updatePosition();
        
        this.$emit('animation-end', {
          index: this.index,
          location: this.location,
          position: this.position
        });
      }
    },
    
    handleResize() {
      this.updatePosition(true);
      
      if (this.location === 'origin') {
        this.originalPosition = { ...this.position };
      } else if (this.location === 'destination') {
        this.repositionInDestination();
      }
    },
    
    moveToDestination(immediate = false) {
      const element = this.$el;
      const destinationContainer = this.destinationContainerRef;
      const destinationInnerContainer = this.destinationInnerContainerRef;
      
      if (!destinationContainer || !destinationInnerContainer) return;
      
      // Get current position and update holder dimensions
      const originalRect = element.getBoundingClientRect();
      this.updateHolderDimensions(originalRect);
      
      // Calculate target position
      const targetPosition = this.calculateDestinationPosition(destinationInnerContainer);
      
      // Update location and apply transform
      this.location = 'destination';
      
      if (immediate) {
        // Move immediately without animation
        destinationInnerContainer.appendChild(element);
        this.transformValue = '';
        this.isAnimating = false;
        this.updatePosition();
        this.emitLocationChange();
      } else {
        // Apply transform for animation
        const xOffset = targetPosition.x - originalRect.x;
        const yOffset = targetPosition.y - originalRect.y;
        this.transformValue = `translate(${xOffset}px, ${yOffset}px)`;
        
        // Set up one-time handler for animation completion
        const handleComplete = (e) => {
          if (e.propertyName === 'transform') {
            element.removeEventListener('transitionend', handleComplete);
            this.transformValue = '';
            destinationInnerContainer.appendChild(element);
          }
        };
        
        element.addEventListener('transitionend', handleComplete);
        this.emitLocationChange();
      }
    },
    
    moveToOrigin(immediate = false) {
      const element = this.$el;
      const holder = document.getElementById(this.holderId);
      
      if (!holder) return;
      
      // Get current position
      const currentRect = element.getBoundingClientRect();
      const holderRect = holder.getBoundingClientRect();
      
      // Update location
      this.location = 'origin';
      
      if (immediate) {
        // Move immediately without animation
        const container = document.getElementById(this.containerId);
        if (container) {
          const wordWrapper = container.querySelector('.word-wrapper');
          if (wordWrapper) {
            wordWrapper.appendChild(element);
          } else {
            container.appendChild(element);
          }
        }
        this.transformValue = '';
        this.isAnimating = false;
        this.updatePosition();
        this.emitLocationChange();
      } else {
        // Apply transform for animation
        const xOffset = holderRect.x - currentRect.x;
        const yOffset = holderRect.y - currentRect.y;
        this.transformValue = `translate(${xOffset}px, ${yOffset}px)`;
        
        // Set up one-time handler for animation completion
        const handleComplete = (e) => {
          if (e.propertyName === 'transform') {
            element.removeEventListener('transitionend', handleComplete);
            
            // Move element back to original container
            const container = document.getElementById(this.containerId);
            if (container) {
              const wordWrapper = container.querySelector('.word-wrapper');
              if (wordWrapper) {
                wordWrapper.appendChild(element);
              } else {
                container.appendChild(element);
              }
            }
            
            this.transformValue = '';
          }
        };
        
        element.addEventListener('transitionend', handleComplete);
        this.emitLocationChange();
      }
    },
    
    calculateDestinationPosition(destinationInnerContainer) {
      const destinationWords = Array.from(destinationInnerContainer.children);
      const destinationRect = destinationInnerContainer.getBoundingClientRect();
      
      if (destinationWords.length === 0) {
        // Position at the start if no words in destination
        return {
          x: destinationRect.x + 10,
          y: destinationRect.y + 10
        };
      } else {
        // Position after the last word
        const lastWord = destinationWords[destinationWords.length - 1];
        const lastWordRect = lastWord.getBoundingClientRect();
        
        return {
          x: lastWordRect.x + lastWordRect.width + 10,
          y: lastWordRect.y
        };
      }
    },
    
    updateHolderDimensions(rect) {
      const holderElement = document.getElementById(this.holderId);
      if (holderElement) {
        holderElement.style.width = `${rect.width}px`;
        holderElement.style.height = `${rect.height}px`;
      }
    },
    
    repositionInDestination() {
      const destinationInnerContainer = this.destinationInnerContainerRef;
      if (destinationInnerContainer && this.location === 'destination') {
        this.moveToDestination(true);
      }
    },
    
    emitLocationChange() {
      this.$emit('location-change', {
        index: this.index,
        location: this.location,
        position: this.position,
        word: this.text
      });
    }
  }
}
</script>

<style scoped>
.word {
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
  z-index: 1;
}

.word::before {
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

.word:active {
  transform: translateY(2px) translateZ(0) !important;
}

/* .word.in-origin {
  background-color: #fff;
} */

/* .word.in-destination {
  background-color: #fff;
} */
</style>