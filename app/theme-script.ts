// This script runs before the app loads to set the initial theme
export function initTheme() {
  return {
    __html: `
      (function() {
        try {
          const savedTheme = localStorage.getItem('theme');
          if (savedTheme === 'dark' || (savedTheme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
            document.documentElement.classList.add('dark');
          }
        } catch (e) {
          console.log('Failed to initialize theme');
        }
      })();
    `,
  };
}
