document.addEventListener('DOMContentLoaded', () => {
  // DOM Elements
  const generateBtn = document.getElementById('generate-btn');
  const promptInput = document.getElementById('prompt-input');
  const loader = document.getElementById('loader');
  const imageContainer = document.getElementById('image-container');
  const generatedImage = document.getElementById('generated-image');
  const placeholderMessage = document.querySelector('.placeholder-message');
  const saveBtn = document.getElementById('save-btn');

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
        // Check if we got a text response
        if (data.textResponse) {
          // Display the text response
          placeholderMessage.style.display = 'none';
          
          // Create or get text element
          let textElement = document.getElementById('generated-text');
          if (!textElement) {
            textElement = document.createElement('div');
            textElement.id = 'generated-text';
            textElement.style.padding = '20px';
            textElement.style.whiteSpace = 'pre-wrap';
            textElement.style.overflow = 'auto';
            textElement.style.maxHeight = '100%';
            imageContainer.appendChild(textElement);
          }
          
          textElement.textContent = data.textResponse;
          textElement.style.display = 'block';
          generatedImage.style.display = 'none';
          
          showNotification('Received text response from Gemini', 'info');
          
          // Enable buttons for the text
          saveBtn.disabled = false;
        } else if (data.imageUrl) {
          // Display the generated image
          placeholderMessage.style.display = 'none';
          generatedImage.src = data.imageUrl;
          generatedImage.style.display = 'block';
          
          // Hide text element if it exists
          const textElement = document.getElementById('generated-text');
          if (textElement) {
            textElement.style.display = 'none';
          }
          
          // Enable control buttons
          saveBtn.disabled = false;
          
          // Add animation
          generatedImage.classList.add('fade-in');
        }
      } else {
        throw new Error(data.error || 'Failed to generate content');
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

  // Save Function - now handles both image and text
  saveBtn.addEventListener('click', () => {
    // Check if we have an image
    if (generatedImage.style.display !== 'none' && generatedImage.src) {
      const a = document.createElement('a');
      a.href = generatedImage.src;
      a.download = `text2image_${Date.now()}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      
      showNotification('Image saved successfully!', 'success');
    } 
    // Check if we have a text response
    else {
      const textElement = document.getElementById('generated-text');
      if (textElement && textElement.textContent) {
        const blob = new Blob([textElement.textContent], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `text2image_response_${Date.now()}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        showNotification('Text saved successfully!', 'success');
      }
    }
  });
  
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
    
    .fade-in {
      animation: fadeIn 0.5s ease-out;
    }
    
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
  `;
  document.head.appendChild(style);
}); 