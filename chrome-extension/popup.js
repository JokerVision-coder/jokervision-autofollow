// JokerVision - Minimal Safe Popup
// Config defined here (no inline scripts allowed by CSP)
window.JokerVisionConfig = {
    apiBaseUrl: 'https://autofollowpro.preview.emergentagent.com/api',
    websiteUrl: 'https://autofollowpro.preview.emergentagent.com'
};

console.log('JokerVision popup loaded');

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded');
    
    try {
        // Simple message
        console.log('Extension is ready');
        
        // Just show a simple status message
        const container = document.querySelector('.container');
        if (container) {
            const statusDiv = document.createElement('div');
            statusDiv.style.cssText = 'padding: 15px; background: #d4edda; margin: 10px; border-radius: 8px; text-align: center;';
            statusDiv.innerHTML = '<strong>✅ Extension Loaded Successfully!</strong><br><small>Ready to capture leads from Facebook Marketplace</small>';
            container.insertBefore(statusDiv, container.firstChild);
        }
    } catch (error) {
        console.error('Error:', error);
    }
});
