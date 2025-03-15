import { ref, watch } from 'vue';

export function useTheme() {
  const isDarkMode = ref(false);
  
  // Initialize theme based on user preference or system preference
  const initializeTheme = () => {
    // Check for saved preference
    const savedTheme = localStorage.getItem('theme');
    
    if (savedTheme) {
      isDarkMode.value = savedTheme === 'dark';
    } else {
      // Check for system preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      isDarkMode.value = prefersDark;
    }
    
    applyTheme();
  };
  
  // Apply theme to document
  const applyTheme = () => {
    if (isDarkMode.value) {
      document.documentElement.classList.add('dark-theme');
    } else {
      document.documentElement.classList.remove('dark-theme');
    }
    
    // Save preference
    localStorage.setItem('theme', isDarkMode.value ? 'dark' : 'light');
  };
  
  // Toggle theme
  const toggleTheme = () => {
    isDarkMode.value = !isDarkMode.value;
  };
  
  // Watch for changes and apply theme
  watch(isDarkMode, () => {
    applyTheme();
  });
  
  // Initialize on mount
  if (typeof window !== 'undefined') {
    initializeTheme();
    
    // Listen for system preference changes
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
      if (localStorage.getItem('theme') === null) {
        isDarkMode.value = e.matches;
      }
    });
  }
  
  return {
    isDarkMode,
    toggleTheme
  };
}

// Also export as default for easier imports
export default useTheme;
