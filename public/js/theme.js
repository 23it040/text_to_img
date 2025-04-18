document.addEventListener('DOMContentLoaded', () => {
  // Theme toggle functionality
  const themeToggle = document.getElementById('theme-toggle');
  const body = document.body;
  
  // Check for saved theme in localStorage
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme === 'dark') {
    body.classList.remove('light-mode');
    body.classList.add('dark-mode');
  }

  // Theme Toggle Function
  themeToggle.addEventListener('click', () => {
    if (body.classList.contains('light-mode')) {
      body.classList.remove('light-mode');
      body.classList.add('dark-mode');
      localStorage.setItem('theme', 'dark');
    } else {
      body.classList.remove('dark-mode');
      body.classList.add('light-mode');
      localStorage.setItem('theme', 'light');
    }
  });
  
  // Add page entrance animations
  const pageElements = document.querySelectorAll('main > section > *');
  pageElements.forEach((el, index) => {
    el.style.opacity = '0';
    el.style.animation = `fadeInUp 0.8s ease-out ${index * 0.1}s forwards`;
  });
}); 