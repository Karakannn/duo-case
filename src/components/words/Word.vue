<template>
  <div 
    class="word" 
    :class="{ 'in-destination': location === 'destination' }"
    @click="handleClick"
    ref="wordElement"
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
    destinationContainerRef: {
      type: Object,
      default: null
    },
    initialLocation: {
      type: String,
      default: 'origin',
      validator: (value) => ['origin', 'destination'].includes(value)
    },
    wordPositions: {
      type: Array,
      default: () => []
    }
  },
  emits: ['click', 'location-change', 'word-positioned'],
  data() {
    return {
      location: this.initialLocation,
      position: {
        x: 0,
        y: 0,
        width: 0,
        height: 0
      },
      originalPosition: null,
      isAnimating: false,
      transformValue: ''
    };
  },
  mounted() {
    console.log(`[${this.index}] Word mounted with initialLocation: ${this.initialLocation}`);
    
    // Allow the DOM to render first
    this.$nextTick(() => {
      // Get initial position
      this.updatePosition(true);
      
      // Save original position for transform calculations
      this.originalPosition = { ...this.position };
      console.log(`[${this.index}] Original position saved:`, this.originalPosition);
      
      // If starting in destination, apply transform
      if (this.initialLocation === 'destination') {
        console.log(`[${this.index}] Word starting at destination`);
        this.moveToDestination();
      }
      
      // Setup transition listener
      this.$refs.wordElement.addEventListener('transitionend', this.handleTransitionEnd);
    });
    
    // Handle window resize
    window.addEventListener('resize', this.handleResize);
  },
  beforeUnmount() {
    window.removeEventListener('resize', this.handleResize);
    if (this.$refs.wordElement) {
      this.$refs.wordElement.removeEventListener('transitionend', this.handleTransitionEnd);
    }
  },
  watch: {
    // Apply transform whenever it changes
    transformValue(newValue) {
      if (this.$refs.wordElement) {
        this.$refs.wordElement.style.transform = newValue;
      }
    }
  },
  methods: {
    updatePosition(skipEmit = false) {
      if (!this.$refs.wordElement) return;
      
      const rect = this.$refs.wordElement.getBoundingClientRect();
      this.position = {
        x: rect.x,
        y: rect.y,
        width: rect.width,
        height: rect.height
      };
      
      console.log(`[${this.index}] Position updated:`, this.position, `location: ${this.location}`);
      
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
    handleClick() {
      console.log(`[${this.index}] Word CLICKED, current location: ${this.location}, isAnimating: ${this.isAnimating}`);
      
      // Ignore clicks during animation
      if (this.isAnimating) {
        console.log(`[${this.index}] Animation in progress, ignoring click`);
        return;
      }
      
      // Set animating flag
      this.isAnimating = true;
      console.log(`[${this.index}] Setting isAnimating = true`);
      
      // Toggle location
      if (this.location === 'origin') {
        console.log(`[${this.index}] Moving TO destination`);
        this.moveToDestination();
      } else {
        console.log(`[${this.index}] Moving BACK TO origin`);
        this.moveToOrigin();
      }
      
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
        console.log(`[${this.index}] Transition ENDED for transform`);
        
        // Clear animating flag
        this.isAnimating = false;
        console.log(`[${this.index}] Animation completed, isAnimating = false`);
        
        // Update position
        this.updatePosition();
      }
    },
    handleResize() {
      console.log(`[${this.index}] Window resized`);
      
      // Update position measurements
      this.updatePosition(true);
      
      // Update original position if we're currently at origin
      if (this.location === 'origin') {
        this.originalPosition = { ...this.position };
        console.log(`[${this.index}] Original position updated on resize:`, this.originalPosition);
      }
      
      // Reapply transform if we're at destination
      if (this.location === 'destination') {
        this.moveToDestination();
      }
    },
    moveToDestination() {
      if (!this.destinationContainerRef || !this.originalPosition) {
        console.error(`[${this.index}] Missing references`);
        this.isAnimating = false;
        return;
      }
      
      // Get destination container position
      const destContainer = this.destinationContainerRef;
      const destRect = destContainer.getBoundingClientRect();
      
      // Calculate X position (based on words already in destination)
      let destX = destRect.x + 10; // Add some padding
      
      const wordsInDestination = this.wordPositions
        .filter(w => w && w.location === 'destination' && w.index !== this.index)
        .sort((a, b) => a.position.x - b.position.x);
      
      console.log(`[${this.index}] Words in destination:`, wordsInDestination.length);
      
      // Adjust destX based on existing words
      if (wordsInDestination.length > 0) {
        const totalWidth = wordsInDestination.reduce(
          (sum, w) => sum + w.position.width, 0
        ) + (wordsInDestination.length * 10); // 10px gap between words
        
        destX += totalWidth;
      }
      
      // Calculate Y position (center vertically)
      const destY = destRect.y + (destRect.height / 2) - (this.position.height / 2);
      
      // Calculate transform offsets
      const xOffset = destX - this.originalPosition.x;
      const yOffset = destY - this.originalPosition.y;
      
      console.log(`[${this.index}] Setting transform from (${this.originalPosition.x}, ${this.originalPosition.y}) to (${destX}, ${destY})`);
      console.log(`[${this.index}] Transform offsets: X=${xOffset}, Y=${yOffset}`);
      
      // Update location first (for CSS class)
      this.location = 'destination';
      
      // Emit location change
      this.emitLocationChange();
      
      // Set transform (will apply via watcher)
      this.transformValue = `translate(${xOffset}px, ${yOffset}px)`;
    },
    moveToOrigin() {
      console.log(`[${this.index}] Moving back to origin position`);
      
      // Update location first (for CSS class)
      this.location = 'origin';
      
      // Emit location change
      this.emitLocationChange();
      
      // Reset transform to origin position (will apply via watcher)
      this.transformValue = 'translate(0px, 0px)';
    },
    emitLocationChange() {
      console.log(`[${this.index}] Location CHANGED to: ${this.location}`);
      
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
  position: relative;
  display: inline-block;
  border: 1px solid var(--grey-color);
  background-color: white;
  margin: 0 0.2em;
  padding: 0.5em 1em;
  border-radius: var(--border-radius);
  box-shadow: 0px 3px 0px 0px var(--grey-color);
  transition: transform 0.3s ease-out;
  cursor: pointer;
  z-index: 1;
  font-size: 1.2em;
  font-weight: 400;
  color: var(--text-color);
  will-change: transform;
}

.word:active {
  transform: translate(0, 2px);
  box-shadow: none;
}

.in-destination {
  box-shadow: 0px 2px 0px 0px var(--darker-grey-color);
}
</style>
