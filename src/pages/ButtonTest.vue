<template>
  <div class="button-test-page">
    <h1 class="page-title">Duolingo 3D Button Test Sayfası</h1>
    
    <div class="test-section">
      <h2>Temel Buton Varyantları</h2>
      <p class="description">Duolingo'nun tipik 3D butonu. Bastığınızda alt kısma basılma etkisi oluşur.</p>
      <div class="button-row">
        <div class="button-sample">
          <Button>Varsayılan</Button>
          <span class="button-name">Default</span>
        </div>
        <div class="button-sample">
          <Button variant="primary">Ana</Button>
          <span class="button-name">Primary</span>
        </div>
        <div class="button-sample">
          <Button variant="primaryOutline">Ana Çizgili</Button>
          <span class="button-name">Primary Outline</span>
        </div>
      </div>
      
      <div class="button-row">
        <div class="button-sample">
          <Button variant="secondary">İkincil</Button>
          <span class="button-name">Secondary</span>
        </div>
        <div class="button-sample">
          <Button variant="secondaryOutline">İkincil Çizgili</Button>
          <span class="button-name">Secondary Outline</span>
        </div>
      </div>
      
      <div class="button-row">
        <div class="button-sample">
          <Button variant="danger">Tehlike</Button>
          <span class="button-name">Danger</span>
        </div>
        <div class="button-sample">
          <Button variant="dangerOutline">Tehlike Çizgili</Button>
          <span class="button-name">Danger Outline</span>
        </div>
      </div>
      
      <div class="button-row">
        <div class="button-sample">
          <Button variant="super">Süper</Button>
          <span class="button-name">Super</span>
        </div>
        <div class="button-sample">
          <Button variant="superOutline">Süper Çizgili</Button>
          <span class="button-name">Super Outline</span>
        </div>
      </div>
      
      <div class="button-row">
        <div class="button-sample">
          <Button variant="ghost">Hayalet</Button>
          <span class="button-name">Ghost</span>
        </div>
      </div>
    </div>
    
    <div class="test-section">
      <h2>Buton Boyutları</h2>
      <p class="description">Farklı boyutlarda 3D butonlar.</p>
      <div class="button-row align-items-end">
        <div class="button-sample">
          <Button size="sm" variant="primary">Küçük</Button>
          <span class="button-name">Small (sm)</span>
        </div>
        <div class="button-sample">
          <Button variant="primary">Normal</Button>
          <span class="button-name">Default</span>
        </div>
        <div class="button-sample">
          <Button size="lg" variant="primary">Büyük</Button>
          <span class="button-name">Large (lg)</span>
        </div>
        <div class="button-sample">
          <Button size="icon" variant="primary">+</Button>
          <span class="button-name">Icon</span>
        </div>
      </div>
    </div>
    
    <div class="test-section">
      <h2>Yuvarlak Köşeli Butonlar</h2>
      <p class="description">Tam yuvarlak köşeli 3D butonlar.</p>
      <div class="button-row">
        <div class="button-sample">
          <Button variant="primary" rounded>Yuvarlak</Button>
          <span class="button-name">Rounded Primary</span>
        </div>
        <div class="button-sample">
          <Button variant="secondary" rounded>Yuvarlak</Button>
          <span class="button-name">Rounded Secondary</span>
        </div>
        <div class="button-sample">
          <Button size="icon" variant="primary" rounded>+</Button>
          <span class="button-name">Rounded Icon</span>
        </div>
      </div>
    </div>
    
    <div class="test-section">
      <h2>Devre Dışı Butonlar</h2>
      <p class="description">Devre dışı bırakılmış 3D butonlar.</p>
      <div class="button-row">
        <div class="button-sample">
          <Button variant="primary" disabled>Devre Dışı</Button>
          <span class="button-name">Disabled Primary</span>
        </div>
        <div class="button-sample">
          <Button variant="primaryOutline" disabled>Devre Dışı</Button>
          <span class="button-name">Disabled Outline</span>
        </div>
        <div class="button-sample">
          <Button variant="secondary" disabled>Devre Dışı</Button>
          <span class="button-name">Disabled Secondary</span>
        </div>
      </div>
    </div>
    
    <div class="test-section">
      <h2>Etkileşimli Demo</h2>
      <p class="description">Bu butonlara basılı tutarak 3D etkisini deneyebilirsiniz.</p>
      <div class="interactive-demo">
        <div class="button-row">
          <Button variant="primary" size="lg">Bana Bas</Button>
          <Button variant="secondary" size="lg">Beni Dene</Button>
          <Button variant="danger" size="lg">Tehlike</Button>
        </div>
      </div>
    </div>
    
    <div class="test-section">
      <h2>Kullanım Örnekleri</h2>
      <div class="example-code">
        <h3>Temel Kullanım</h3>
        <pre><code>&lt;Button&gt;Varsayılan Buton&lt;/Button&gt;
&lt;Button variant="primary"&gt;Ana Buton&lt;/Button&gt;</code></pre>
      </div>
      
      <div class="example-code">
        <h3>Boyut ve Varyant</h3>
        <pre><code>&lt;Button variant="secondary" size="lg"&gt;Büyük İkincil Buton&lt;/Button&gt;
&lt;Button variant="danger" size="sm"&gt;Küçük Tehlike Butonu&lt;/Button&gt;</code></pre>
      </div>
      
      <div class="example-code">
        <h3>Yuvarlak ve Devre Dışı</h3>
        <pre><code>&lt;Button variant="primary" rounded&gt;Yuvarlak Buton&lt;/Button&gt;
&lt;Button variant="primaryOutline" disabled&gt;Devre Dışı Buton&lt;/Button&gt;</code></pre>
      </div>
    </div>
  </div>
</template>

<script setup>
import Button from '../components/common/Button.vue';
</script>

<style scoped>
.button-test-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  font-family: 'Nunito', sans-serif;
}

.page-title {
  color: #4c4c4c;
  margin-bottom: 2rem;
  font-size: 2.5rem;
  font-weight: bold;
  text-align: center;
}

.test-section {
  margin-bottom: 3rem;
  background-color: #f0f0f0;
  border-radius: 1rem;
  padding: 1.5rem;
}

.test-section h2 {
  color: #1cb0f6;
  margin-bottom: 0.5rem;
  font-size: 1.5rem;
  font-weight: bold;
  border-bottom: 2px solid #cfcfcf;
  padding-bottom: 0.5rem;
}

.description {
  margin-bottom: 1.5rem;
  color: #6f6f6f;
  font-size: 1rem;
}

.button-row {
  display: flex;
  flex-wrap: wrap;
  gap: 1.5rem;
  margin-bottom: 1.5rem;
}

.button-sample {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  min-width: 150px;
}

.button-name {
  font-size: 0.8rem;
  color: #6f6f6f;
}

.align-items-end {
  align-items: flex-end;
}

.interactive-demo {
  padding: 2rem;
  background-color: #fff;
  border-radius: 0.75rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.interactive-demo .button-row {
  justify-content: center;
}

.example-code {
  margin-bottom: 1rem;
}

.example-code h3 {
  color: #7ac70c;
  font-size: 1.2rem;
  margin-bottom: 0.5rem;
}

.example-code pre {
  background-color: #4c4c4c;
  color: #f0f0f0;
  padding: 1rem;
  border-radius: 0.5rem;
  overflow-x: auto;
  font-family: monospace;
  font-size: 0.9rem;
}

@media (max-width: 768px) {
  .button-row {
    justify-content: center;
  }
  
  .button-sample {
    min-width: 100px;
  }
}
</style>
