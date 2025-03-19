(function () {
  const { ref, watch } = Vue;

  window.useTheme = function () {
    const isDarkMode = ref(false);

    const initializeTheme = () => {
      const savedTheme = localStorage.getItem('theme');

      if (savedTheme) {
        isDarkMode.value = savedTheme === 'dark';
      } else {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        isDarkMode.value = prefersDark;
      }

      applyTheme();
    };

    const applyTheme = () => {
      if (isDarkMode.value) {
        document.documentElement.classList.add('dark-theme');
      } else {
        document.documentElement.classList.remove('dark-theme');
      }

      localStorage.setItem('theme', isDarkMode.value ? 'dark' : 'light');
    };

    const toggleTheme = () => {
      isDarkMode.value = !isDarkMode.value;
    };

    watch(isDarkMode, () => {
      applyTheme();
    });

    if (typeof window !== 'undefined') {
      initializeTheme();

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
  };
})();