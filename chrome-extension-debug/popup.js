// Simplified popup.js for debugging
console.log('JokerVision popup loaded');

document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded');
    
    // Simple test
    const testDiv = document.createElement('div');
    testDiv.textContent = 'Extension loaded successfully!';
    testDiv.style.padding = '10px';
    testDiv.style.background = '#d4edda';
    testDiv.style.margin = '10px';
    testDiv.style.borderRadius = '5px';
    
    if (document.body) {
        document.body.insertBefore(testDiv, document.body.firstChild);
    }
});
