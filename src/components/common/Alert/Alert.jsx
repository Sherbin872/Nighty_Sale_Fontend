// src/components/common/Alert.jsx - Simple alert function
const showAlert = (message, type = 'info') => {


  // Create alert element
  // console.log(message.message);
  
  const alert = document.createElement('div');
  alert.className = `global-alert global-alert-${type}`;
  alert.innerHTML = `
    <span>${message.message}</span>
    <button onclick="this.parentElement.remove()">×</button>
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
  
  // Auto-remove after 3 seconds
  setTimeout(() => {
    if (alert.parentElement) {
      alert.remove();
    }
  }, 3000);
  
  // Add CSS animation
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
 

export default showAlert;

// Use in ProductDetails.jsx
// import { showAlert } from '../../components/common/Alert';
// showAlert('Product added to cart!', 'success');