// src/components/common/Alert.jsx
const Alert = (message, type = 'info') => {
  // FIX: Handle both simple strings and Error objects safely
  const textToShow = typeof message === 'string' ? message : (message?.message || String(message));

  // Create alert element
  const alert = document.createElement('div');
  alert.className = `global-alert global-alert-${type}`;
  
  // FIX: Removed the inline onclick string, we will add an event listener below
  alert.innerHTML = `
    <span>${textToShow}</span>
    <button class="ns-alert-close-btn">×</button>
  `;
  
  // Style
  alert.style.cssText = `
    position: fixed;
    top: 100px;
    right: 20px;
    padding: 1rem 1.5rem;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    z-index: 9999;
    animation: slideIn 0.3s ease;
    max-width: 400px;
    font-family: inherit;
  `;
  
  // Type-specific styles
  const styles = {
    info: 'background: #2196f3; color: white;',
    success: 'background: #4caf50; color: white;',
    warning: 'background: #ff9800; color: white;',
    error: 'background: #f44336; color: white;'
  };
  
  alert.style.cssText += styles[type] || styles.info;
  
  // Add to DOM
  document.body.appendChild(alert);

  // FIX: Add a proper event listener to the close button
  const closeBtn = alert.querySelector('.ns-alert-close-btn');
  closeBtn.addEventListener('click', () => {
    alert.remove();
  });
  
  // Auto-remove after 3 seconds
  setTimeout(() => {
    if (alert.parentElement) {
      alert.remove();
    }
  }, 3000);
  
  // Add CSS animation (only once)
  if (!document.querySelector('#alert-styles')) {
    const style = document.createElement('style');
    style.id = 'alert-styles';
    style.textContent = `
      @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
      }
      .global-alert button {
        background: none;
        border: none;
        color: inherit;
        font-size: 1.5rem;
        cursor: pointer;
        padding: 0;
        line-height: 1;
      }
    `;
    document.head.appendChild(style);
  }
};

export default Alert;