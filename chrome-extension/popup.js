// JokerVision AutoDealer Pro - Chrome Extension Popup JavaScript
class JokerVisionExtension {
    constructor() {
        this.apiBaseUrl = 'https://joker-dealership.preview.emergentagent.com/api';
        this.currentTenantId = null;
        this.currentUser = null;
        this.init();
    }

    async init() {
        await this.loadUserData();
        this.setupEventListeners();
        this.initializeTabs();
        this.checkConnectionStatus();
        await this.loadInventoryData();
    }

    async loadUserData() {
        try {
            // Try to get user data from Chrome storage
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
        // Show authentication modal or redirect to main app
        const authDiv = document.createElement('div');
        authDiv.className = 'auth-prompt';
        authDiv.innerHTML = `
            <div class="auth-content">
                <h3>Authentication Required</h3>
                <p>Please log in to your JokerVision dashboard first.</p>
                <button class="btn btn-primary" id="openDashboard">Open Dashboard</button>
            </div>
        `;
        document.querySelector('.container').appendChild(authDiv);
        
        document.getElementById('openDashboard').addEventListener('click', () => {
            chrome.tabs.create({ url: 'https://joker-dealership.preview.emergentagent.com' });
        });
    }

    updateConnectionStatus(status, message) {
        const statusIndicator = document.getElementById('connectionStatus');
        const statusDot = statusIndicator.querySelector('.status-dot');
        const statusText = statusIndicator.querySelector('span');
        
        statusDot.className = `status-dot ${status}`;
        statusText.textContent = message;
    }

    setupEventListeners() {
        // Tab switching
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.switchTab(e.target.closest('.tab-btn').dataset.tab);
            });
        });

        // Inventory actions
        document.getElementById('syncInventory')?.addEventListener('click', () => {
            this.syncInventory();
        });

        document.getElementById('bulkUpload')?.addEventListener('click', () => {
            this.openBulkUploadModal();
        });

        document.getElementById('priceOptimizer')?.addEventListener('click', () => {
            this.runPriceOptimizer();
        });

        document.getElementById('photoEnhance')?.addEventListener('click', () => {
            this.enhancePhotos();
        });

        document.getElementById('competitors')?.addEventListener('click', () => {
            this.runCompetitorAnalysis();
        });

        // SEO Tools
        document.getElementById('generateDescriptions')?.addEventListener('click', () => {
            this.generateSEODescriptions();
        });

        document.getElementById('optimizeKeywords')?.addEventListener('click', () => {
            this.optimizeKeywords();
        });

        document.getElementById('startABTest')?.addEventListener('click', () => {
            this.startABTest();
        });

        // Automation toggles
        document.getElementById('autoPosting')?.addEventListener('change', (e) => {
            this.toggleAutoPosting(e.target.checked);
        });

        // Footer actions
        document.getElementById('openDashboard')?.addEventListener('click', () => {
            chrome.tabs.create({ url: 'https://joker-dealership.preview.emergentagent.com' });
        });

        document.getElementById('openSettings')?.addEventListener('click', () => {
            this.openSettings();
        });
    }

    initializeTabs() {
        // Show first tab by default
        this.switchTab('inventory');
    }

    switchTab(tabName) {
        // Update tab buttons
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');

        // Update tab content
        document.querySelectorAll('.tab-pane').forEach(pane => {
            pane.classList.remove('active');
        });
        document.getElementById(tabName).classList.add('active');
    }

    async checkConnectionStatus() {
        try {
            const response = await fetch(`${this.apiBaseUrl}/health`);
            if (response.ok) {
                this.updateConnectionStatus('online', 'Connected');
            } else {
                throw new Error('Server unavailable');
            }
        } catch (error) {
            this.updateConnectionStatus('offline', 'Connection failed');
        }
    }

    async loadInventoryData() {
        if (!this.currentTenantId) return;

        try {
            // Load inventory summary
            const response = await fetch(`${this.apiBaseUrl}/inventory/summary?tenant_id=${this.currentTenantId}`);
            if (response.ok) {
                const data = await response.json();
                this.updateInventoryUI(data);
            }
        } catch (error) {
            console.error('Error loading inventory:', error);
        }
    }

    updateInventoryUI(data) {
        // Update vehicle count
        document.getElementById('vehicleCount').textContent = data.total_vehicles || 0;
        
        // Update last sync time
        const lastSync = data.last_sync ? new Date(data.last_sync).toLocaleString() : 'Never';
        document.getElementById('lastSync').textContent = lastSync;

        // Update vehicle queue
        if (data.recent_vehicles) {
            this.updateVehicleQueue(data.recent_vehicles);
        }
    }

    updateVehicleQueue(vehicles) {
        const queueContainer = document.getElementById('vehicleQueue');
        if (!vehicles || vehicles.length === 0) {
            queueContainer.innerHTML = '<div class="no-vehicles">No vehicles in queue</div>';
            return;
        }

        queueContainer.innerHTML = vehicles.map(vehicle => `
            <div class="queue-item">
                <div class="vehicle-info">
                    <span class="vehicle-name">${vehicle.year} ${vehicle.make} ${vehicle.model}</span>
                    <span class="vehicle-price">$${vehicle.price?.toLocaleString()}</span>
                </div>
                <div class="queue-status ${vehicle.status.toLowerCase()}">${vehicle.status}</div>
            </div>
        `).join('');
    }

    async syncInventory() {
        if (!this.currentTenantId) {
            this.showError('Please authenticate first');
            return;
        }

        const syncBtn = document.getElementById('syncInventory');
        const originalText = syncBtn.innerHTML;
        
        // Show loading state
        syncBtn.innerHTML = '<div class="spinner"></div> Syncing...';
        syncBtn.disabled = true;

        try {
            const response = await fetch(`${this.apiBaseUrl}/inventory/sync`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    tenant_id: this.currentTenantId,
                    source: 'facebook_marketplace'
                })
            });

            if (response.ok) {
                const result = await response.json();
                this.showSuccess(`Synced ${result.vehicles_processed} vehicles successfully`);
                await this.loadInventoryData();
            } else {
                throw new Error('Sync failed');
            }
        } catch (error) {
            console.error('Sync error:', error);
            this.showError('Failed to sync inventory. Please try again.');
        } finally {
            syncBtn.innerHTML = originalText;
            syncBtn.disabled = false;
        }
    }

    async generateSEODescriptions() {
        if (!this.currentTenantId) {
            this.showError('Please authenticate first');
            return;
        }

        const generateBtn = document.getElementById('generateDescriptions');
        const originalText = generateBtn.textContent;
        
        generateBtn.textContent = 'Generating...';
        generateBtn.disabled = true;

        try {
            // Get current tab to see if we're on Facebook Marketplace
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            
            if (tab.url.includes('marketplace.facebook.com')) {
                // Extract vehicle data from current page
                const vehicleData = await this.extractVehicleDataFromPage(tab.id);
                
                // Generate SEO optimized description using AI
                const response = await fetch(`${this.apiBaseUrl}/ai/generate-seo-description`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        tenant_id: this.currentTenantId,
                        vehicle_data: vehicleData
                    })
                });

                if (response.ok) {
                    const result = await response.json();
                    
                    // Inject the optimized description back into the page
                    await chrome.tabs.sendMessage(tab.id, {
                        action: 'updateDescription',
                        description: result.optimized_description
                    });

                    this.showSuccess('SEO description generated and applied!');
                } else {
                    throw new Error('Failed to generate description');
                }
            } else {
                // Generate descriptions for all inventory items
                const response = await fetch(`${this.apiBaseUrl}/inventory/generate-seo-descriptions`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        tenant_id: this.currentTenantId
                    })
                });

                if (response.ok) {
                    const result = await response.json();
                    this.showSuccess(`Generated descriptions for ${result.processed_count} vehicles`);
                } else {
                    throw new Error('Failed to generate descriptions');
                }
            }
        } catch (error) {
            console.error('SEO generation error:', error);
            this.showError('Failed to generate SEO descriptions');
        } finally {
            generateBtn.textContent = originalText;
            generateBtn.disabled = false;
        }
    }

    async extractVehicleDataFromPage(tabId) {
        try {
            const result = await chrome.tabs.sendMessage(tabId, {
                action: 'extractVehicleData'
            });
            return result;
        } catch (error) {
            console.error('Error extracting vehicle data:', error);
            return {};
        }
    }

    async runPriceOptimizer() {
        if (!this.currentTenantId) {
            this.showError('Please authenticate first');
            return;
        }

        try {
            const response = await fetch(`${this.apiBaseUrl}/ai/optimize-pricing`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    tenant_id: this.currentTenantId
                })
            });

            if (response.ok) {
                const result = await response.json();
                this.showSuccess(`Optimized pricing for ${result.vehicles_updated} vehicles`);
                await this.loadInventoryData();
            } else {
                throw new Error('Price optimization failed');
            }
        } catch (error) {
            console.error('Price optimization error:', error);
            this.showError('Failed to optimize pricing');
        }
    }

    async enhancePhotos() {
        this.showInfo('Photo enhancement feature coming soon!');
    }

    async runCompetitorAnalysis() {
        if (!this.currentTenantId) {
            this.showError('Please authenticate first');
            return;
        }

        try {
            const response = await fetch(`${this.apiBaseUrl}/analytics/competitor-analysis`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    tenant_id: this.currentTenantId
                })
            });

            if (response.ok) {
                const result = await response.json();
                this.showSuccess('Competitor analysis completed! Check your dashboard for details.');
            } else {
                throw new Error('Competitor analysis failed');
            }
        } catch (error) {
            console.error('Competitor analysis error:', error);
            this.showError('Failed to run competitor analysis');
        }
    }

    async optimizeKeywords() {
        this.showInfo('Keyword optimization in progress...');
    }

    async startABTest() {
        this.showInfo('A/B testing feature coming soon!');
    }

    async toggleAutoPosting(enabled) {
        if (!this.currentTenantId) {
            this.showError('Please authenticate first');
            return;
        }

        try {
            const response = await fetch(`${this.apiBaseUrl}/automation/auto-posting`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    tenant_id: this.currentTenantId,
                    enabled: enabled
                })
            });

            if (response.ok) {
                this.showSuccess(`Auto-posting ${enabled ? 'enabled' : 'disabled'}`);
            } else {
                throw new Error('Failed to update auto-posting settings');
            }
        } catch (error) {
            console.error('Auto-posting toggle error:', error);
            this.showError('Failed to update auto-posting settings');
        }
    }

    openBulkUploadModal() {
        // Create modal for bulk upload
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Bulk Vehicle Upload</h3>
                    <button class="modal-close">&times;</button>
                </div>
                <div class="modal-body">
                    <p>Select vehicles to upload to Facebook Marketplace:</p>
                    <input type="file" id="vehicleFileInput" accept=".csv,.xlsx" style="display: none;">
                    <button class="btn btn-primary" id="selectFile">Select CSV/Excel File</button>
                    <div id="uploadProgress" class="upload-progress" style="display: none;">
                        <div class="progress-bar">
                            <div class="progress-fill"></div>
                        </div>
                        <span class="progress-text">0%</span>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Setup modal event listeners
        modal.querySelector('.modal-close').addEventListener('click', () => {
            document.body.removeChild(modal);
        });
        
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                document.body.removeChild(modal);
            }
        });
        
        modal.querySelector('#selectFile').addEventListener('click', () => {
            modal.querySelector('#vehicleFileInput').click();
        });
        
        modal.querySelector('#vehicleFileInput').addEventListener('change', (e) => {
            if (e.target.files[0]) {
                this.processBulkUpload(e.target.files[0], modal);
            }
        });
    }

    async processBulkUpload(file, modal) {
        const progressDiv = modal.querySelector('#uploadProgress');
        const progressFill = modal.querySelector('.progress-fill');
        const progressText = modal.querySelector('.progress-text');
        
        progressDiv.style.display = 'block';
        
        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('tenant_id', this.currentTenantId);
            
            const response = await fetch(`${this.apiBaseUrl}/inventory/bulk-upload`, {
                method: 'POST',
                body: formData
            });
            
            if (response.ok) {
                const result = await response.json();
                this.showSuccess(`Successfully uploaded ${result.processed_count} vehicles`);
                document.body.removeChild(modal);
                await this.loadInventoryData();
            } else {
                throw new Error('Upload failed');
            }
        } catch (error) {
            console.error('Bulk upload error:', error);
            this.showError('Failed to upload vehicles');
        }
    }

    openSettings() {
        // Create settings modal
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Extension Settings</h3>
                    <button class="modal-close">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="setting-item">
                        <label>Auto-sync Interval</label>
                        <select id="syncInterval">
                            <option value="5">5 minutes</option>
                            <option value="15">15 minutes</option>
                            <option value="30">30 minutes</option>
                            <option value="60">1 hour</option>
                        </select>
                    </div>
                    <div class="setting-item">
                        <label>Default Language</label>
                        <select id="defaultLanguage">
                            <option value="english">English</option>
                            <option value="spanish">Spanish</option>
                        </select>
                    </div>
                    <div class="setting-item">
                        <label>
                            <input type="checkbox" id="enableNotifications">
                            Enable notifications
                        </label>
                    </div>
                    <button class="btn btn-primary" id="saveSettings">Save Settings</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Setup modal event listeners
        modal.querySelector('.modal-close').addEventListener('click', () => {
            document.body.removeChild(modal);
        });
        
        modal.querySelector('#saveSettings').addEventListener('click', async () => {
            await this.saveSettings({
                syncInterval: modal.querySelector('#syncInterval').value,
                defaultLanguage: modal.querySelector('#defaultLanguage').value,
                enableNotifications: modal.querySelector('#enableNotifications').checked
            });
            document.body.removeChild(modal);
        });
    }

    async saveSettings(settings) {
        try {
            await chrome.storage.local.set({ extensionSettings: settings });
            this.showSuccess('Settings saved successfully');
        } catch (error) {
            console.error('Error saving settings:', error);
            this.showError('Failed to save settings');
        }
    }

    // Utility methods for showing messages
    showSuccess(message) {
        this.showMessage(message, 'success');
    }

    showError(message) {
        this.showMessage(message, 'error');
    }

    showInfo(message) {
        this.showMessage(message, 'info');
    }

    showMessage(message, type) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `${type}-message`;
        messageDiv.textContent = message;
        
        document.querySelector('.container').insertBefore(messageDiv, document.querySelector('.nav-tabs'));
        
        setTimeout(() => {
            if (messageDiv.parentNode) {
                messageDiv.parentNode.removeChild(messageDiv);
            }
        }, 5000);
    }
}

// Initialize the extension when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new JokerVisionExtension();
});