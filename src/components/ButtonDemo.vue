<template>
  <div class="button-demo">
    <h2 class="demo-title">Button Component Demo</h2>
    
    <div class="demo-section">
      <h3>Button Variants</h3>
      <div class="button-grid">
        <div class="button-item">
          <Button>Default Button</Button>
          <span class="variant-name">Default</span>
        </div>
        <div class="button-item">
          <Button variant="primary">Primary Button</Button>
          <span class="variant-name">Primary</span>
        </div>
        <div class="button-item">
          <Button variant="primaryOutline">Primary Outline</Button>
          <span class="variant-name">Primary Outline</span>
        </div>
        <div class="button-item">
          <Button variant="secondary">Secondary Button</Button>
          <span class="variant-name">Secondary</span>
        </div>
        <div class="button-item">
          <Button variant="secondaryOutline">Secondary Outline</Button>
          <span class="variant-name">Secondary Outline</span>
        </div>
        <div class="button-item">
          <Button variant="danger">Danger Button</Button>
          <span class="variant-name">Danger</span>
        </div>
        <div class="button-item">
          <Button variant="dangerOutline">Danger Outline</Button>
          <span class="variant-name">Danger Outline</span>
        </div>
        <div class="button-item">
          <Button variant="super">Super Button</Button>
          <span class="variant-name">Super</span>
        </div>
        <div class="button-item">
          <Button variant="superOutline">Super Outline</Button>
          <span class="variant-name">Super Outline</span>
        </div>
        <div class="button-item">
          <Button variant="ghost">Ghost Button</Button>
          <span class="variant-name">Ghost</span>
        </div>
      </div>
    </div>
    
    <div class="demo-section">
      <h3>Button Sizes</h3>
      <div class="button-grid">
        <div class="button-item">
          <Button size="sm" variant="primary">Small Button</Button>
          <span class="variant-name">Small (sm)</span>
        </div>
        <div class="button-item">
          <Button variant="primary">Default Size</Button>
          <span class="variant-name">Default</span>
        </div>
        <div class="button-item">
          <Button size="lg" variant="primary">Large Button</Button>
          <span class="variant-name">Large (lg)</span>
        </div>
        <div class="button-item">
          <Button size="icon" variant="primary">
            <span>+</span>
          </Button>
          <span class="variant-name">Icon</span>
        </div>
      </div>
    </div>
    
    <div class="demo-section">
      <h3>Rounded Buttons</h3>
      <div class="button-grid">
        <div class="button-item">
          <Button variant="primary" rounded>Rounded Button</Button>
          <span class="variant-name">Rounded</span>
        </div>
        <div class="button-item">
          <Button size="icon" variant="secondary" rounded>
            <span>+</span>
          </Button>
          <span class="variant-name">Rounded Icon</span>
        </div>
      </div>
    </div>
    
    <div class="demo-section">
      <h3>Disabled Buttons</h3>
      <div class="button-grid">
        <div class="button-item">
          <Button variant="primary" disabled>Disabled Button</Button>
          <span class="variant-name">Disabled</span>
        </div>
        <div class="button-item">
          <Button variant="primaryOutline" disabled>Disabled Outline</Button>
          <span class="variant-name">Disabled Outline</span>
        </div>
      </div>
    </div>
    
    <div class="demo-section code-example">
      <h3>Usage Example</h3>
      <pre>
&lt;Button&gt;Default Button&lt;/Button&gt;
&lt;Button variant="primary"&gt;Primary Button&lt;/Button&gt;
&lt;Button variant="secondary" size="lg"&gt;Large Secondary Button&lt;/Button&gt;
&lt;Button variant="danger" rounded&gt;Rounded Danger Button&lt;/Button&gt;
&lt;Button variant="primaryOutline" disabled&gt;Disabled Outline Button&lt;/Button&gt;
      </pre>
    </div>
  </div>
</template>

<script setup>
import Button from './common/Button.vue';
</script>

<style scoped>
.button-demo {
  font-family: 'Arial', sans-serif;
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.demo-title {
  font-size: 2rem;
  margin-bottom: 2rem;
  color: #4c4c4c; /* Duolingo Tundora */
}

.demo-section {
  margin-bottom: 3rem;
}

.demo-section h3 {
  font-size: 1.5rem;
  margin-bottom: 1rem;
  color: #6f6f6f; /* Duolingo Dove Gray */
  border-bottom: 1px solid #cfcfcf; /* Duolingo Alto */
  padding-bottom: 0.5rem;
}

.button-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 1.5rem;
}

.button-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  min-width: 150px;
}

.variant-name {
  font-size: 0.8rem;
  color: #6f6f6f; /* Duolingo Dove Gray */
}

.code-example pre {
  background-color: #f0f0f0; /* Duolingo Gallery */
  padding: 1rem;
  border-radius: 0.5rem;
  overflow-x: auto;
  font-family: monospace;
  font-size: 0.9rem;
  color: #4c4c4c; /* Duolingo Tundora */
}
</style>
