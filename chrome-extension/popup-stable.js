console.log('1. External script started');

const API_URL = 'https://autofollowpro.preview.emergentagent.com/api';

function switchTab(tabName) {
    console.log('Switching to tab:', tabName);
    document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    
    const tabContent = document.getElementById(tabName);
    const tabButton = document.getElementById('tab' + tabName.charAt(0).toUpperCase() + tabName.slice(1));
    
    if (tabContent) tabContent.classList.add('active');
    if (tabButton) tabButton.classList.add('active');
}

async function syncInventory() {
    console.log('2. Sync button clicked!');
    try {
        const statusEl = document.getElementById('statusText');
        if (statusEl) statusEl.textContent = 'Syncing...';
        
        console.log('Sending request to:', `${API_URL}/inventory/sync`);
        
        const response = await fetch(`${API_URL}/inventory/sync`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ tenant_id: 'default', source: 'extension' })
        });
        
        console.log('Response status:', response.status);
        
        if (response.ok) {
            const data = await response.json();
            console.log('Response data:', data);
            
            const countEl = document.getElementById('vehicleCount');
            const syncEl = document.getElementById('lastSync');
            
            if (countEl) countEl.textContent = data.vehicles_processed || 0;
            if (syncEl) syncEl.textContent = new Date().toLocaleTimeString();
            if (statusEl) statusEl.textContent = 'Sync Complete!';
            
            setTimeout(() => {
                if (statusEl) statusEl.textContent = 'Extension Active';
            }, 3000);
        } else {
            const errorText = await response.text();
            console.error('Sync failed:', errorText);
            if (statusEl) statusEl.textContent = 'Sync Failed: ' + response.status;
        }
    } catch (error) {
        console.error('Sync error:', error);
        const statusEl = document.getElementById('statusText');
        if (statusEl) statusEl.textContent = 'Sync Error: ' + error.message;
    }
}

async function scrapeInventory() {
    console.log('3. Scrape button clicked!');
    try {
        const resultDiv = document.getElementById('scrapeResult');
        if (resultDiv) {
            resultDiv.style.display = 'block';
            resultDiv.textContent = 'Scraping...';
        }
        
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        
        // Try to inject the content script if it's not already loaded
        try {
            await chrome.scripting.executeScript({
                target: { tabId: tab.id },
                files: ['inventory-scraper.js']
            });
            console.log('Content script injected');
        } catch (injectError) {
            console.log('Script already loaded or injection failed:', injectError.message);
        }
        
        // Wait a moment for script to load
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const response = await chrome.tabs.sendMessage(tab.id, { action: 'scrapeInventory' });
        
        if (response && response.success) {
            const count = response.vehicles ? response.vehicles.length : 0;
            if (resultDiv) resultDiv.textContent = `✅ Found ${count} vehicles! Uploading...`;
            
            const uploadResponse = await fetch(`${API_URL}/inventory/upload-scraped`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    vehicles: response.vehicles,
                    source: response.siteType,
                    sourceUrl: response.url,
                    autoPostToFacebook: true
                })
            });
            
            if (uploadResponse.ok) {
                if (resultDiv) resultDiv.textContent = `✅ ${count} vehicles uploaded and queued for Facebook!`;
            } else {
                if (resultDiv) resultDiv.textContent = '❌ Upload failed';
            }
        } else {
            if (resultDiv) resultDiv.textContent = '❌ No inventory found on this page';
        }
    } catch (error) {
        console.error('Scrape error:', error);
        const resultDiv = document.getElementById('scrapeResult');
        if (resultDiv) {
            if (error.message.includes('Receiving end does not exist')) {
                resultDiv.textContent = '❌ Please reload the page and try again';
            } else {
                resultDiv.textContent = '❌ Error: ' + error.message;
            }
        }
    }
}

function openDashboard() {
    console.log('4. Opening dashboard');
    chrome.tabs.create({ url: 'https://autofollowpro.preview.emergentagent.com' });
}

// Setup event listeners when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    console.log('5. DOM loaded, setting up event listeners...');
    
    // Tab buttons
    const tabInventory = document.getElementById('tabInventory');
    const tabScrape = document.getElementById('tabScrape');
    const tabAnalytics = document.getElementById('tabAnalytics');
    
    if (tabInventory) {
        tabInventory.addEventListener('click', () => switchTab('inventory'));
        console.log('Inventory tab listener attached');
    }
    if (tabScrape) {
        tabScrape.addEventListener('click', () => switchTab('scrape'));
        console.log('Scrape tab listener attached');
    }
    if (tabAnalytics) {
        tabAnalytics.addEventListener('click', () => switchTab('analytics'));
        console.log('Analytics tab listener attached');
    }
    
    // Action buttons
    const btnSync = document.getElementById('btnSyncInventory');
    const btnScrape = document.getElementById('btnScrapeInventory');
    const btnDashboard = document.getElementById('btnOpenDashboard');
    
    if (btnSync) {
        btnSync.addEventListener('click', syncInventory);
        console.log('Sync button listener attached');
    } else {
        console.error('Sync button not found!');
    }
    
    if (btnScrape) {
        btnScrape.addEventListener('click', scrapeInventory);
        console.log('Scrape button listener attached');
    }
    
    if (btnDashboard) {
        btnDashboard.addEventListener('click', openDashboard);
        console.log('Dashboard button listener attached');
    }
    
    console.log('6. All event listeners attached!');
});

console.log('7. Script fully loaded');
