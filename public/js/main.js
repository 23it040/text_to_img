document.addEventListener('DOMContentLoaded', () => {
  // DOM Elements
  const themeToggle = document.getElementById('theme-toggle');
  const body = document.body;
  const generateBtn = document.getElementById('generate-btn');
  const promptInput = document.getElementById('prompt-input');
  const loader = document.getElementById('loader');
  const imageContainer = document.getElementById('image-container');
  const generatedImage = document.getElementById('generated-image');
  const placeholderMessage = document.querySelector('.placeholder-message');
  const saveBtn = document.getElementById('save-btn');
  const starBtn = document.getElementById('star-btn');
  const shareBtn = document.getElementById('share-btn');
  const navLinks = document.querySelectorAll('nav ul li a');
  const starredGrid = document.querySelector('.starred-grid');
  const emptyState = document.querySelector('.empty-state');

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

  // Navigation Active State
  navLinks.forEach(link => {
    link.addEventListener('click', function() {
      navLinks.forEach(l => l.classList.remove('active'));
      this.classList.add('active');
    });
  });

  // Smooth Scrolling for Navigation
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      e.preventDefault();
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;
      
      const targetElement = document.querySelector(targetId);
      if (targetElement) {
        window.scrollTo({
          top: targetElement.offsetTop - 80,
          behavior: 'smooth'
        });
      }
    });
  });

  // Generate Image Function
  generateBtn.addEventListener('click', async () => {
    const prompt = promptInput.value.trim();
    
    if (!prompt) {
      showNotification('Please enter a prompt first.', 'error');
      return;
    }
    
    // Show loader
    generateBtn.disabled = true;
    loader.style.display = 'flex';
    
    try {
      const response = await fetch('/api/generate-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        // Display the generated image
        placeholderMessage.style.display = 'none';
        generatedImage.src = `data:image/png;base64,${data.imageData}`;
        generatedImage.style.display = 'block';
        
        // Enable control buttons
        saveBtn.disabled = false;
        starBtn.disabled = false;
        shareBtn.disabled = false;
        
        // Add animation
        generatedImage.classList.add('fade-in');
      } else {
        throw new Error(data.error || 'Failed to generate image');
      }
    } catch (error) {
      console.error('Error:', error);
      showNotification(error.message, 'error');
    } finally {
      // Hide loader
      generateBtn.disabled = false;
      loader.style.display = 'none';
    }
  });

  // Save Image Function
  saveBtn.addEventListener('click', () => {
    if (!generatedImage.src) return;
    
    const a = document.createElement('a');
    a.href = generatedImage.src;
    a.download = `text2image_${Date.now()}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    
    showNotification('Image saved successfully!', 'success');
  });

  // Star Image Function
  starBtn.addEventListener('click', () => {
    if (!generatedImage.src) return;
    
    const starredImages = JSON.parse(localStorage.getItem('starredImages') || '[]');
    const promptText = promptInput.value.trim();
    const imageData = {
      id: Date.now(),
      src: generatedImage.src,
      prompt: promptText,
      date: new Date().toISOString()
    };
    
    // Check if this image is already starred
    const isDuplicate = starredImages.some(img => img.src === imageData.src);
    
    if (!isDuplicate) {
      starredImages.push(imageData);
      localStorage.setItem('starredImages', JSON.stringify(starredImages));
      
      // Update the UI
      updateStarredGrid();
      showNotification('Image added to starred!', 'success');
      
      // Update star button
      starBtn.innerHTML = '<i class="fas fa-star"></i> Starred';
      starBtn.classList.add('starred');
    } else {
      showNotification('This image is already in your starred collection', 'info');
    }
  });

  // Share Image Function (mock implementation)
  shareBtn.addEventListener('click', () => {
    if (!generatedImage.src) return;
    
    // Check if Web Share API is available
    if (navigator.share) {
      navigator.share({
        title: 'My AI Generated Image',
        text: 'Check out this image I created with Text2Image!',
        url: window.location.href,
      })
        .then(() => showNotification('Shared successfully!', 'success'))
        .catch(error => {
          console.error('Error sharing:', error);
          showNotification('Could not share image', 'error');
        });
    } else {
      // Fallback - copy link to clipboard
      const dummy = document.createElement('input');
      document.body.appendChild(dummy);
      dummy.value = window.location.href;
      dummy.select();
      document.execCommand('copy');
      document.body.removeChild(dummy);
      
      showNotification('Link copied to clipboard!', 'success');
    }
  });
  
  // Load starred images on page load
  function updateStarredGrid() {
    const starredImages = JSON.parse(localStorage.getItem('starredImages') || '[]');
    
    if (starredImages.length === 0) {
      emptyState.style.display = 'flex';
      starredGrid.style.display = 'none';
      return;
    }
    
    emptyState.style.display = 'none';
    starredGrid.style.display = 'grid';
    starredGrid.innerHTML = '';
    
    // Sort by newest first
    starredImages.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    starredImages.forEach(image => {
      const card = document.createElement('div');
      card.classList.add('starred-card');
      card.innerHTML = `
        <div class="starred-image">
          <img src="${image.src}" alt="Starred image">
        </div>
        <div class="starred-info">
          <p class="starred-prompt">${truncateText(image.prompt, 50)}</p>
          <div class="starred-actions">
            <button class="download-btn" data-id="${image.id}">
              <i class="fas fa-download"></i>
            </button>
            <button class="remove-btn" data-id="${image.id}">
              <i class="fas fa-trash"></i>
            </button>
          </div>
        </div>
      `;
      starredGrid.appendChild(card);
      
      // Add event listeners for the buttons
      card.querySelector('.download-btn').addEventListener('click', function() {
        const a = document.createElement('a');
        a.href = image.src;
        a.download = `text2image_${image.id}.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      });
      
      card.querySelector('.remove-btn').addEventListener('click', function() {
        const id = this.getAttribute('data-id');
        removeStarredImage(id);
      });
    });
  }
  
  // Remove starred image
  function removeStarredImage(id) {
    const starredImages = JSON.parse(localStorage.getItem('starredImages') || '[]');
    const filteredImages = starredImages.filter(image => image.id !== parseInt(id));
    
    localStorage.setItem('starredImages', JSON.stringify(filteredImages));
    updateStarredGrid();
    showNotification('Image removed from starred', 'info');
  }
  
  // Helper function to truncate text
  function truncateText(text, maxLength) {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + '...';
  }
  
  // Notification system
  function showNotification(message, type = 'info') {
    // Check if notification container exists
    let notificationContainer = document.querySelector('.notification-container');
    
    if (!notificationContainer) {
      notificationContainer = document.createElement('div');
      notificationContainer.classList.add('notification-container');
      document.body.appendChild(notificationContainer);
    }
    
    const notification = document.createElement('div');
    notification.classList.add('notification', `notification-${type}`);
    notification.innerHTML = `
      <div class="notification-content">
        <i class="fas ${getIconForType(type)}"></i>
        <p>${message}</p>
      </div>
    `;
    
    notificationContainer.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
      notification.classList.add('show');
    }, 10);
    
    // Auto remove after 3 seconds
    setTimeout(() => {
      notification.classList.remove('show');
      setTimeout(() => {
        notification.remove();
      }, 300);
    }, 3000);
  }
  
  function getIconForType(type) {
    switch (type) {
      case 'success': return 'fa-check-circle';
      case 'error': return 'fa-exclamation-circle';
      case 'warning': return 'fa-exclamation-triangle';
      case 'info': 
      default: return 'fa-info-circle';
    }
  }
  
  // Add notification styles
  const style = document.createElement('style');
  style.innerHTML = `
    .notification-container {
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 9999;
    }
    
    .notification {
      background-color: white;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      margin-bottom: 10px;
      transform: translateX(120%);
      transition: transform 0.3s ease;
      overflow: hidden;
    }
    
    .notification.show {
      transform: translateX(0);
    }
    
    .notification-content {
      display: flex;
      align-items: center;
      padding: 12px 20px;
      min-width: 280px;
    }
    
    .notification i {
      margin-right: 12px;
      font-size: 1.2rem;
    }
    
    .notification-success {
      border-left: 4px solid #4CAF50;
    }
    
    .notification-success i {
      color: #4CAF50;
    }
    
    .notification-error {
      border-left: 4px solid #F44336;
    }
    
    .notification-error i {
      color: #F44336;
    }
    
    .notification-warning {
      border-left: 4px solid #FF9800;
    }
    
    .notification-warning i {
      color: #FF9800;
    }
    
    .notification-info {
      border-left: 4px solid #2196F3;
    }
    
    .notification-info i {
      color: #2196F3;
    }
    
    .starred-card {
      background-color: var(--bg-color);
      border-radius: var(--radius);
      overflow: hidden;
      box-shadow: 0 4px 15px var(--shadow-color);
      transition: var(--transition);
    }
    
    .starred-card:hover {
      transform: translateY(-5px);
      box-shadow: 0 8px 25px var(--shadow-color);
    }
    
    .starred-image {
      height: 200px;
      overflow: hidden;
    }
    
    .starred-image img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: var(--transition);
    }
    
    .starred-card:hover .starred-image img {
      transform: scale(1.05);
    }
    
    .starred-info {
      padding: 1rem;
    }
    
    .starred-prompt {
      margin-bottom: 0.8rem;
      font-size: 0.9rem;
      color: var(--text-color);
    }
    
    .starred-actions {
      display: flex;
      justify-content: flex-end;
      gap: 0.5rem;
    }
    
    .starred-actions button {
      background: none;
      border: none;
      font-size: 1rem;
      color: var(--text-color-light);
      cursor: pointer;
      transition: var(--transition);
      width: 30px;
      height: 30px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    
    .starred-actions button:hover {
      background-color: var(--bg-color-alt);
      color: var(--primary-color);
    }
    
    .download-btn:hover {
      color: var(--primary-color);
    }
    
    .remove-btn:hover {
      color: #F44336;
    }
    
    .fade-in {
      animation: fadeIn 0.5s ease-out;
    }
    
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
  `;
  document.head.appendChild(style);
  
  // Initialize the starred grid
  updateStarredGrid();
  
  // Add some initial animations for the page load
  const heroElements = document.querySelectorAll('#hero *');
  heroElements.forEach((el, index) => {
    el.style.opacity = '0';
    el.style.animation = `fadeInUp 0.8s ease-out ${index * 0.1}s forwards`;
  });
}); 