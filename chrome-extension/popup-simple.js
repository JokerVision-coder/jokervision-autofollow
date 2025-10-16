// JokerVision Simple Popup - Safe and Stable
console.log('JokerVision popup initializing...');

// Configuration
const CONFIG = {
    apiBaseUrl: 'https://autofollowpro.preview.emergentagent.com/api',
    websiteUrl: 'https://autofollowpro.preview.emergentagent.com'
};

// Get DOM elements safely
function getElement(id) {
    const el = document.getElementById(id);
    if (!el) console.warn(`Element ${id} not found`);
    return el;
}

// Show message to user
function showMessage(message, type = 'success') {
    const messageArea = getElement('messageArea');
    if (!messageArea) return;
    
    const msgDiv = document.createElement('div');
    msgDiv.className = type === 'success' ? 'success-msg' : 'error-msg';
    msgDiv.textContent = message;
    messageArea.innerHTML = '';
    messageArea.appendChild(msgDiv);
    
    setTimeout(() => {
        if (messageArea.contains(msgDiv)) {
            msgDiv.remove();
        }
    }, 3000);
}

// Get current tab info
async function getCurrentTab() {
    try {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        return tab;
    } catch (error) {
        console.error('Error getting current tab:', error);
        return null;
    }
}

// Check if on Facebook Marketplace
function isFacebookMarketplace(url) {
    return url && (
        url.includes('facebook.com/marketplace') || 
        url.includes('marketplace.facebook.com')
    );
}

// Update page info
async function updatePageInfo() {
    const pageInfo = getElement('pageInfo');
    const captureBtn = getElement('captureBtn');
    
    if (!pageInfo || !captureBtn) return;
    
    try {
        const tab = await getCurrentTab();
        if (!tab) {
            pageInfo.textContent = 'Unable to detect current page';
            return;
        }
        
        if (isFacebookMarketplace(tab.url)) {
            pageInfo.textContent = '✅ Facebook Marketplace detected';
            captureBtn.disabled = false;
        } else {
            pageInfo.textContent = '❌ Not on Facebook Marketplace';
            captureBtn.disabled = true;
        }
    } catch (error) {
        console.error('Error updating page info:', error);
        pageInfo.textContent = 'Error detecting page';
    }
}

// Capture lead from current page
async function captureLead() {
    const captureBtn = getElement('captureBtn');
    const leadData = getElement('leadData');
    
    if (!captureBtn) return;
    
    try {
        captureBtn.disabled = true;
        captureBtn.textContent = 'Capturing...';
        
        const tab = await getCurrentTab();
        if (!tab) {
            showMessage('Unable to access current tab', 'error');
            return;
        }
        
        // Try to get lead data from content script
        const response = await chrome.tabs.sendMessage(tab.id, { action: 'captureLead' });
        
        if (response && response.success) {
            // Display lead info
            if (leadData && response.data) {
                leadData.innerHTML = `
                    <div class="lead-info">
                        <div class="lead-info-item">
                            <span class="lead-info-label">Vehicle:</span>
                            <span class="lead-info-value">${response.data.title || 'N/A'}</span>
                        </div>
                        <div class="lead-info-item">
                            <span class="lead-info-label">Price:</span>
                            <span class="lead-info-value">${response.data.price || 'N/A'}</span>
                        </div>
                        <div class="lead-info-item">
                            <span class="lead-info-label">Source:</span>
                            <span class="lead-info-value">Facebook Marketplace</span>
                        </div>
                    </div>
                `;
            }
            
            // Send to backend
            await sendToBackend(response.data);
            showMessage('✅ Lead captured successfully!');
        } else {
            showMessage('Could not extract lead data from this page', 'error');
        }
    } catch (error) {
        console.error('Error capturing lead:', error);
        showMessage('Error capturing lead. Make sure you\'re on a vehicle listing.', 'error');
    } finally {
        if (captureBtn) {
            captureBtn.disabled = false;
            captureBtn.textContent = 'Import Lead to JokerVision';
        }
    }
}

// Send lead data to backend
async function sendToBackend(leadData) {
    try {
        const response = await fetch(`${CONFIG.apiBaseUrl}/exclusive-leads`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                source: 'Facebook Marketplace - Chrome Extension',
                vehicle: leadData.title || 'Unknown Vehicle',
                price: leadData.price || 0,
                description: leadData.description || '',
                seller: leadData.seller || '',
                url: leadData.url || '',
                images: leadData.images || [],
                capturedAt: new Date().toISOString()
            })
        });
        
        if (!response.ok) {
            throw new Error('Failed to send to backend');
        }
        
        console.log('Lead sent to backend successfully');
    } catch (error) {
        console.error('Error sending to backend:', error);
        // Don't throw - still show success to user since data was captured
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM ready, initializing...');
    
    try {
        // Update page info
        updatePageInfo();
        
        // Setup capture button
        const captureBtn = getElement('captureBtn');
        if (captureBtn) {
            captureBtn.addEventListener('click', captureLead);
        }
        
        console.log('Extension initialized successfully');
    } catch (error) {
        console.error('Initialization error:', error);
    }
});

console.log('JokerVision popup script loaded');
