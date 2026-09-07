// FitAdapt Dark Mode & Theme Controller
// Persists user preference via localStorage with system fallback (Section 9.1)

(function () {
  const root = document.documentElement;
  const saved = localStorage.getItem('theme');
  if (saved === 'dark' || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }
})();

function toggleTheme() {
  const root = document.documentElement;
  root.classList.toggle('dark');
  const isDark = root.classList.contains('dark');
  localStorage.setItem('theme', isDark ? 'dark' : 'light');

  // Update theme toggle icons if present
  updateThemeIcons(isDark);
}

function updateThemeIcons(isDark) {
  const sunIcons = document.querySelectorAll('.theme-icon-sun');
  const moonIcons = document.querySelectorAll('.theme-icon-moon');

  sunIcons.forEach(el => {
    el.style.display = isDark ? 'block' : 'none';
  });
  moonIcons.forEach(el => {
    el.style.display = isDark ? 'none' : 'block';
  });
}

document.addEventListener('DOMContentLoaded', () => {
  const isDark = document.documentElement.classList.contains('dark');
  updateThemeIcons(isDark);
});
