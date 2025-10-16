// JokerVision AutoDealer Pro - Full-Featured Extension (Safe Version)
console.log('JokerVision AutoDealer Pro loading...');

// Configuration (no window object dependency)
const CONFIG = {
    apiBaseUrl: 'https://autofollowpro.preview.emergentagent.com/api',
    websiteUrl: 'https://autofollowpro.preview.emergentagent.com'
};

// Safe DOM element getter
function getElement(id) {
    try {
        return document.getElementById(id);
    } catch (error) {
        console.error(`Error getting element ${id}:`, error);
        return null;
    }
}

// Safe query selector
function querySelector(selector) {
    try {
        return document.querySelector(selector);
    } catch (error) {
        console.error(`Error querying ${selector}:`, error);
        return null;
    }
}

// Show message to user
function showMessage(message, type = 'info') {
    console.log(`Message [${type}]:`, message);
    // Could add toast notification here
}

// Check if on Facebook Marketplace
function isFacebookMarketplace(url) {
    return url && (url.includes('facebook.com/marketplace') || url.includes('marketplace.facebook.com'));
}

// Check if on inventory website
function isInventoryWebsite(url) {
    return url && (
        url.includes('cars.com') || url.includes('autotrader.com') || 
        url.includes('cargurus.com') || url.includes('carfax.com') || url.includes('carvana.com')
    );
}

// Get current tab
async function getCurrentTab() {
    try {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        return tab;
    } catch (error) {
        console.error('Error getting current tab:', error);
        return null;
    }
}

// Update connection status
function updateConnectionStatus(status, message) {
    try {
        const statusIndicator = getElement('connectionStatus');
        if (!statusIndicator) return;
        
        const statusDot = statusIndicator.querySelector('.status-dot');
        const statusText = statusIndicator.querySelector('span');
        
        if (statusDot) statusDot.className = `status-dot ${status}`;
        if (statusText) statusText.textContent = message;
    } catch (error) {
        console.error('Error updating connection status:', error);
    }
}

// Switch tabs
function switchTab(tabName) {
    try {
        // Hide all tabs
        document.querySelectorAll('.tab-pane').forEach(tab => {
            tab.classList.remove('active');
        });
        
        // Remove active from all buttons
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        
        // Show selected tab
        const selectedTab = getElement(`${tabName}`);
        const selectedBtn = querySelector(`[data-tab="${tabName}"]`);
        
        if (selectedTab) selectedTab.classList.add('active');
        if (selectedBtn) selectedBtn.classList.add('active');
    } catch (error) {
        console.error('Error switching tabs:', error);
    }
}

// Setup tab navigation
function setupTabs() {
    try {
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const tab = btn.getAttribute('data-tab');
                if (tab) switchTab(tab);
            });
        });
    } catch (error) {
        console.error('Error setting up tabs:', error);
    }
}

// Sync inventory
async function syncInventory() {
    try {
        showMessage('Syncing inventory...');
        const response = await fetch(`${CONFIG.apiBaseUrl}/inventory/sync`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ tenant_id: 'default', source: 'chrome_extension' })
        });
        
        if (response.ok) {
            const result = await response.json();
            showMessage('Inventory synced successfully!');
            updateVehicleCount(result.vehicles_processed || 0);
        }
    } catch (error) {
        console.error('Sync error:', error);
        showMessage('Sync failed', 'error');
    }
}

// Update vehicle count
function updateVehicleCount(count) {
    const vehicleCount = getElement('vehicleCount');
    if (vehicleCount) vehicleCount.textContent = count;
    
    const lastSync = getElement('lastSync');
    if (lastSync) lastSync.textContent = new Date().toLocaleTimeString();
}

// Scrape inventory from current page
async function scrapeInventory() {
    try {
        showMessage('Scraping inventory...');
        
        const tab = await getCurrentTab();
        if (!tab) return;
        
        const response = await chrome.tabs.sendMessage(tab.id, { action: 'scrapeInventory' });
        
        if (response && response.success) {
            const count = response.vehicles ? response.vehicles.length : 0;
            showMessage(`Found ${count} vehicles!`);
            
            // Upload to backend
            await uploadInventoryToBackend(response);
            showMessage(`✅ ${count} vehicles uploaded!`);
        }
    } catch (error) {
        console.error('Scrape error:', error);
        showMessage('Scraping failed', 'error');
    }
}

// Upload inventory to backend
async function uploadInventoryToBackend(scrapedData) {
    try {
        const response = await fetch(`${CONFIG.apiBaseUrl}/inventory/upload-scraped`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                vehicles: scrapedData.vehicles,
                source: scrapedData.siteType,
                sourceUrl: scrapedData.url,
                scrapedAt: scrapedData.scrapedAt,
                autoPostToFacebook: true
            })
        });
        
        if (!response.ok) throw new Error('Upload failed');
        
        const result = await response.json();
        console.log('Upload successful:', result);
        return result;
    } catch (error) {
        console.error('Upload error:', error);
        throw error;
    }
}

// Capture lead from Facebook Marketplace
async function captureLead() {
    try {
        showMessage('Capturing lead...');
        
        const tab = await getCurrentTab();
        if (!tab) return;
        
        const response = await chrome.tabs.sendMessage(tab.id, { action: 'captureLead' });
        
        if (response && response.success) {
            showMessage('Lead captured!');
            await sendToBackend(response.data);
        }
    } catch (error) {
        console.error('Capture error:', error);
        showMessage('Capture failed', 'error');
    }
}

// Send lead to backend
async function sendToBackend(leadData) {
    try {
        await fetch(`${CONFIG.apiBaseUrl}/exclusive-leads`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                source: 'Facebook Marketplace - Chrome Extension',
                vehicle: leadData.title || 'Unknown Vehicle',
                price: leadData.price || 0,
                url: leadData.url || ''
            })
        });
    } catch (error) {
        console.error('Send error:', error);
    }
}

// Setup event listeners with error handling
function setupEventListeners() {
    try {
        // Sync inventory
        const syncBtn = getElement('syncInventory');
        if (syncBtn) syncBtn.addEventListener('click', syncInventory);
        
        // Bulk upload (same as scrape)
        const bulkUploadBtn = getElement('bulkUpload');
        if (bulkUploadBtn) bulkUploadBtn.addEventListener('click', scrapeInventory);
        
        // Price optimizer
        const priceBtn = getElement('priceOptimizer');
        if (priceBtn) priceBtn.addEventListener('click', () => showMessage('Price optimizer coming soon!'));
        
        // Photo enhance
        const photoBtn = getElement('photoEnhance');
        if (photoBtn) photoBtn.addEventListener('click', () => showMessage('Photo AI coming soon!'));
        
        // Competitors
        const compBtn = getElement('competitors');
        if (compBtn) compBtn.addEventListener('click', () => showMessage('Spy Mode coming soon!'));
        
        // SEO tools
        const seoBtn = getElement('generateDescriptions');
        if (seoBtn) seoBtn.addEventListener('click', () => showMessage('SEO Generator coming soon!'));
        
        const keywordBtn = getElement('optimizeKeywords');
        if (keywordBtn) keywordBtn.addEventListener('click', () => showMessage('Keyword optimizer coming soon!'));
        
        // Open dashboard
        const dashBtn = getElement('openDashboard');
        if (dashBtn) dashBtn.addEventListener('click', () => {
            chrome.tabs.create({ url: CONFIG.websiteUrl });
        });
        
        // Open settings
        const settingsBtn = getElement('openSettings');
        if (settingsBtn) settingsBtn.addEventListener('click', () => showMessage('Settings coming soon!'));
        
    } catch (error) {
        console.error('Error setting up event listeners:', error);
    }
}

// Initialize extension
async function initializeExtension() {
    try {
        console.log('Initializing JokerVision AutoDealer Pro...');
        
        // Setup tabs
        setupTabs();
        
        // Setup event listeners
        setupEventListeners();
        
        // Update connection status
        updateConnectionStatus('online', 'Connected');
        
        // Check current page
        const tab = await getCurrentTab();
        if (tab) {
            if (isFacebookMarketplace(tab.url)) {
                showMessage('Facebook Marketplace detected');
            } else if (isInventoryWebsite(tab.url)) {
                showMessage('Inventory website detected');
            }
        }
        
        console.log('JokerVision AutoDealer Pro initialized successfully!');
    } catch (error) {
        console.error('Initialization error:', error);
        updateConnectionStatus('offline', 'Error');
    }
}

// Wait for DOM to be ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeExtension);
} else {
    initializeExtension();
}

console.log('JokerVision AutoDealer Pro script loaded');
