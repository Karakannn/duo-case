<template>
  <div
    ref="wordElement"
    class="word"
    :class="{ 'in-origin': location === 'origin', 'in-destination': location === 'destination' }"
    :style="{ transform: transformValue }"
    @click="handleClick"
  >
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
  mounted() {
    // Store original parent container
    this.originalParent = this.$el.parentElement;
    
    // Get the index among siblings
    this.originalIndex = Array.from(this.originalParent.parentElement.children).indexOf(this.originalParent);
    
    // Initialize element after rendering
    this.$nextTick(() => {
      this.initializeElement();
      this.updatePosition();
      this.originalPosition = { ...this.position };
    });
    
    // Add event listeners
    window.addEventListener('resize', this.handleResize);
    this.$el.addEventListener('transitionend', this.handleTransitionEnd);
  },
  beforeDestroy() {
    // Remove event listeners
    window.removeEventListener('resize', this.handleResize);
    this.$el.removeEventListener('transitionend', this.handleTransitionEnd);
  },
  watch: {
    transformValue(newValue) {
      // Emit animation start event when transform is applied
      if (newValue && !this.isAnimating) {
        this.$emit('animation-start', {
          index: this.index,
          location: this.location
        });
      }
    }
  },
  methods: {
    initializeElement() {
      const rect = this.$el.getBoundingClientRect();
      
      // Set sizes for holder and container elements
      if (this.holderId && this.containerId) {
        const holder = document.getElementById(this.holderId);
        const wordContainer = document.getElementById(this.containerId);
        const wordWrapper = this.originalParent;
        
        if (holder && wordContainer && wordWrapper) {
          const width = rect.width;
          const height = rect.height;
          
          holder.style.width = `${width}px`;
          holder.style.height = `${height}px`;
          wordWrapper.style.width = `${width}px`;
          wordWrapper.style.height = `${height}px`;
          wordContainer.style.width = `${width}px`;
          wordContainer.style.height = `${height}px`;
        }
      }
    },
    updatePosition(skipEmit = false) {
      if (!this.$refs.wordElement) return;
      
      const rect = this.$refs.wordElement.getBoundingClientRect();
      this.position = {
        x: rect.x,
        y: rect.y,
        width: rect.width,
        height: rect.height
      };
      
      // Emit position to parent
      if (!skipEmit) {
        this.$emit('word-positioned', {
          index: this.index,
          position: this.position,
          location: this.location,
          word: this.text
        });
      }
    },
    setPositionX(x) {
      if (this.position) {
        this.position.x = x;
      }
    },
    processQueuedClick(onComplete) {
      this.handleClick();
      if (typeof onComplete === 'function') {
        onComplete();
      }
    },
    handleClick() {
      // Ignore clicks during animation
      if (this.isAnimating) return;
      
      // Set animating flag and toggle location
      this.isAnimating = true;
      this.location === 'origin' ? this.moveToDestination() : this.moveToOrigin();
      
      // Emit click event
      this.$emit('click', {
        index: this.index,
        location: this.location,
        position: this.position
      });
    },
    handleTransitionEnd(event) {
      // Only care about transform property
      if (event.propertyName === 'transform') {
        this.isAnimating = false;
        this.updatePosition();
      }
    },
    handleResize() {
      this.updatePosition(true);
      
      // Update original position if at origin
      if (this.location === 'origin') {
        this.originalPosition = { ...this.position };
      } else if (this.location === 'destination') {
        this.moveToDestination();
      }
    },
    moveToDestination() {
      const element = this.$el;
      const destinationContainer = this.destinationContainerRef;
      const destinationInnerContainer = this.destinationInnerContainerRef;
      
      if (!destinationContainer || !destinationInnerContainer) return;
      
      this.isAnimating = true;
      
      // Get current position and set holder dimensions
      const originalRect = element.getBoundingClientRect();
      const holderElement = document.getElementById(this.holderId);
      if (holderElement) {
        holderElement.style.width = `${originalRect.width}px`;
        holderElement.style.height = `${originalRect.height}px`;
      }
      
      // Calculate target position
      const destinationWords = Array.from(destinationInnerContainer.children);
      let targetX, targetY;
      
      if (destinationWords.length === 0) {
        // Position at the start if no words in destination
        const destinationRect = destinationInnerContainer.getBoundingClientRect();
        targetX = destinationRect.x + 10;
        targetY = destinationRect.y + 10;
      } else {
        // Position after the last word
        const lastWord = destinationWords[destinationWords.length - 1];
        const lastWordRect = lastWord.getBoundingClientRect();
        
        targetX = lastWordRect.x + lastWordRect.width + 10;
        targetY = lastWordRect.y;
      }
      
      // Calculate offsets and update location
      const xOffset = targetX - originalRect.x;
      const yOffset = targetY - originalRect.y;
      this.location = 'destination';
      this.transformValue = `translate(${xOffset}px, ${yOffset}px)`;
      
      // Handle transition end
      const handleTransitionComplete = (e) => {
        if (e.propertyName === 'transform') {
          element.removeEventListener('transitionend', handleTransitionComplete);
          this.transformValue = '';
          destinationInnerContainer.appendChild(element);
          this.isAnimating = false;
        }
      };
      
      element.addEventListener('transitionend', handleTransitionComplete);
      this.emitLocationChange();
    },
    moveToOrigin() {
      const element = this.$el;
      const holder = document.getElementById(this.holderId);
      
      if (!holder) return;
      
      this.isAnimating = true;
      
      // Calculate target position
      const currentRect = element.getBoundingClientRect();
      const holderRect = holder.getBoundingClientRect();
      const targetX = holderRect.x;
      const targetY = holderRect.y;
      
      // Calculate offsets and update location
      const xOffset = targetX - currentRect.x;
      const yOffset = targetY - currentRect.y;
      this.location = 'origin';
      this.transformValue = `translate(${xOffset}px, ${yOffset}px)`;
      
      // Handle transition end
      const handleTransitionComplete = (e) => {
        if (e.propertyName === 'transform') {
          element.removeEventListener('transitionend', handleTransitionComplete);
          this.transformValue = '';
          
          // Move back to original container
          const originalContainer = document.getElementById(this.containerId);
          if (originalContainer) {
            const wordWrapper = originalContainer.querySelector('.word-wrapper');
            if (wordWrapper) {
              wordWrapper.appendChild(element);
            } else {
              originalContainer.appendChild(element);
            }
          }
          
          this.isAnimating = false;
        }
      };
      
      element.addEventListener('transitionend', handleTransitionComplete);
      this.emitLocationChange();
    },
    emitLocationChange() {
      this.$emit('location-change', {
        index: this.index,
        location: this.location,
        position: this.position
      });
    }
  }
}
</script>

<style scoped>
.word {
  display: inline-block;
  padding: 10px 15px;
  margin: 0;
  background-color: #fff;
  border: 2px solid #58cc02;
  border-radius: var(--border-radius);
  font-size: 16px;
  font-weight: bold;
  color: #4b4b4b;
  cursor: pointer;
  text-align: center;
  user-select: none;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  position: relative;
  z-index: 1;
  white-space: nowrap;
}

.word:hover {
  transform: translateY(-3px);
  box-shadow: 0 5px 10px rgba(0, 0, 0, 0.15);
}

.word.in-origin {
  background-color: #fff;
}

.word.in-destination {
  background-color: #fff;
}
</style>