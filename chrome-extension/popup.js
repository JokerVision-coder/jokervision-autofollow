// JokerVision AutoDealer Pro - Chrome Extension Popup JavaScript
// FIXED VERSION: Added comprehensive error handling to prevent reload loops

class JokerVisionExtension {
    constructor() {
        this.apiBaseUrl = 'https://autofollowpro.preview.emergentagent.com/api';
        this.websiteUrl = 'https://autofollowpro.preview.emergentagent.com';
        this.currentTenantId = null;
        this.currentUser = null;
        this.initialized = false;
    }

    async init() {
        try {
            if (this.initialized) return;
            this.initialized = true;

            console.log('JokerVision Extension: Initializing...');
            
            await this.loadUserData();
            this.setupEventListeners();
            this.initializeTabs();
            
            console.log('JokerVision Extension: Initialized successfully');
        } catch (error) {
            console.error('JokerVision Extension: Initialization error:', error);
            this.showError('Failed to initialize extension. Please refresh.');
        }
    }

    async loadUserData() {
        try {
            const result = await chrome.storage.local.get(['currentUser', 'tenantId']);
            if (result.currentUser && result.tenantId) {
                this.currentUser = result.currentUser;
                this.currentTenantId = result.tenantId;
                this.updateConnectionStatus('online', 'Connected');
            } else {
                this.updateConnectionStatus('offline', 'Not authenticated');
                this.showAuthenticationPrompt();
            }
        } catch (error) {
            console.error('Error loading user data:', error);
            this.updateConnectionStatus('offline', 'Connection error');
        }
    }

    showAuthenticationPrompt() {
        try {
            const container = document.querySelector('.container');
            if (!container) {
                console.error('Container element not found');
                return;
            }

            const authDiv = document.createElement('div');
            authDiv.className = 'auth-prompt';
            authDiv.innerHTML = `
                <div class="auth-content">
                    <h3>Authentication Required</h3>
                    <p>Please log in to your JokerVision dashboard first.</p>
                    <button class="btn btn-primary" id="openDashboard">Open Dashboard</button>
                </div>
            `;
            container.appendChild(authDiv);
            
            const dashboardBtn = document.getElementById('openDashboard');
            if (dashboardBtn) {
                dashboardBtn.addEventListener('click', () => {
                    chrome.tabs.create({ url: this.websiteUrl });
                });
            }
        } catch (error) {
            console.error('Error showing auth prompt:', error);
        }
    }

    updateConnectionStatus(status, message) {
        try {
            const statusIndicator = document.getElementById('connectionStatus');
            if (!statusIndicator) return;

            const statusDot = statusIndicator.querySelector('.status-dot');
            const statusText = statusIndicator.querySelector('span');
            
            if (statusDot) {
                statusDot.className = `status-dot ${status}`;
            }
            if (statusText) {
                statusText.textContent = message;
            }
        } catch (error) {
            console.error('Error updating connection status:', error);
        }
    }

    setupEventListeners() {
        try {
            // Tab switching
            const tabBtns = document.querySelectorAll('.tab-btn');
            tabBtns.forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const tab = e.target.closest('.tab-btn')?.dataset?.tab;
                    if (tab) this.switchTab(tab);
                });
            });

            // Safely attach event listeners only if elements exist
            this.attachListener('syncInventory', () => this.syncInventory());
            this.attachListener('bulkUpload', () => this.openBulkUploadModal());
            this.attachListener('priceOptimizer', () => this.runPriceOptimizer());
            this.attachListener('photoEnhance', () => this.enhancePhotos());
            this.attachListener('competitors', () => this.runCompetitorAnalysis());
            this.attachListener('generateDescriptions', () => this.generateSEODescriptions());
            this.attachListener('optimizeKeywords', () => this.optimizeKeywords());

        } catch (error) {
            console.error('Error setting up event listeners:', error);
        }
    }

    attachListener(id, callback) {
        const element = document.getElementById(id);
        if (element) {
            element.addEventListener('click', callback);
        }
    }

    initializeTabs() {
        try {
            const firstTab = document.querySelector('.tab-btn');
            if (firstTab && firstTab.dataset.tab) {
                this.switchTab(firstTab.dataset.tab);
            }
        } catch (error) {
            console.error('Error initializing tabs:', error);
        }
    }

    switchTab(tabName) {
        try {
            // Hide all tabs
            document.querySelectorAll('.tab-content').forEach(tab => {
                tab.classList.remove('active');
            });

            // Remove active from all buttons
            document.querySelectorAll('.tab-btn').forEach(btn => {
                btn.classList.remove('active');
            });

            // Show selected tab
            const selectedTab = document.getElementById(`${tabName}Tab`);
            const selectedBtn = document.querySelector(`[data-tab="${tabName}"]`);
            
            if (selectedTab) selectedTab.classList.add('active');
            if (selectedBtn) selectedBtn.classList.add('active');
        } catch (error) {
            console.error('Error switching tabs:', error);
        }
    }

    showError(message) {
        try {
            const container = document.querySelector('.container');
            if (!container) return;

            const errorDiv = document.createElement('div');
            errorDiv.style.cssText = 'padding: 20px; background: #f8d7da; color: #721c24; border-radius: 5px; margin: 10px;';
            errorDiv.textContent = message;
            container.insertBefore(errorDiv, container.firstChild);
        } catch (error) {
            console.error('Error showing error message:', error);
        }
    }

    // Placeholder methods (implement as needed)
    async syncInventory() { console.log('Sync inventory'); }
    openBulkUploadModal() { console.log('Bulk upload'); }
    runPriceOptimizer() { console.log('Price optimizer'); }
    enhancePhotos() { console.log('Enhance photos'); }
    runCompetitorAnalysis() { console.log('Competitor analysis'); }
    generateSEODescriptions() { console.log('Generate SEO'); }
    optimizeKeywords() { console.log('Optimize keywords'); }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        try {
            const extension = new JokerVisionExtension();
            extension.init();
        } catch (error) {
            console.error('Failed to initialize extension:', error);
        }
    });
} else {
    try {
        const extension = new JokerVisionExtension();
        extension.init();
    } catch (error) {
        console.error('Failed to initialize extension:', error);
    }
}
