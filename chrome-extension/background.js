// JokerVision AutoDealer Pro - Background Service Worker
class JokerVisionBackground {
    constructor() {
        this.apiBaseUrl = 'https://leadgenie-sales.preview.emergentagent.com/api';
        this.syncInterval = null;
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setupAlarms();
        console.log('JokerVision AutoDealer Pro: Background service worker initialized');
    }

    setupEventListeners() {
        // Handle extension installation/startup
        chrome.runtime.onInstalled.addListener((details) => {
            this.onInstalled(details);
        });

        chrome.runtime.onStartup.addListener(() => {
            this.onStartup();
        });

        // Handle messages from content scripts and popup
        chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
            this.handleMessage(request, sender, sendResponse);
            return true; // Keep message channel open for async responses
        });

        // Handle web requests for API interception
        chrome.webRequest.onBeforeRequest.addListener(
            (details) => this.interceptApiRequests(details),
            { urls: ["https://graph.facebook.com/*", "https://www.facebook.com/api/*"] },
            ["requestBody"]
        );

        // Handle tab updates to detect Facebook Marketplace
        chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
            this.onTabUpdated(tabId, changeInfo, tab);
        });

        // Handle alarms for scheduled tasks
        chrome.alarms.onAlarm.addListener((alarm) => {
            this.handleAlarm(alarm);
        });
    }

    async onInstalled(details) {
        if (details.reason === 'install') {
            // First installation
            await this.setDefaultSettings();
            this.showWelcomeNotification();
        } else if (details.reason === 'update') {
            // Extension updated
            this.showUpdateNotification();
        }
    }

    async onStartup() {
        // Load user settings and start background tasks
        await this.loadUserSettings();
        this.startBackgroundSync();
    }

    async setDefaultSettings() {
        const defaultSettings = {
            syncInterval: 15, // minutes
            autoPosting: false,
            defaultLanguage: 'english',
            enableNotifications: true,
            priceOptimization: true,
            seoEnhancement: true
        };

        await chrome.storage.local.set({ extensionSettings: defaultSettings });
    }

    async loadUserSettings() {
        try {
            const result = await chrome.storage.local.get(['extensionSettings', 'currentUser', 'tenantId']);
            this.settings = result.extensionSettings || {};
            this.currentUser = result.currentUser;
            this.currentTenantId = result.tenantId;
        } catch (error) {
            console.error('Error loading user settings:', error);
        }
    }

    async handleMessage(request, sender, sendResponse) {
        try {
            switch (request.action) {
                case 'authenticate':
                    const authResult = await this.handleAuthentication(request.credentials);
                    sendResponse(authResult);
                    break;

                case 'syncInventory':
                    const syncResult = await this.syncInventory(request.tenantId);
                    sendResponse(syncResult);
                    break;

                case 'generateSEO':
                    const seoResult = await this.generateSEOContent(request.vehicleData);
                    sendResponse(seoResult);
                    break;

                case 'optimizePrice':
                    const priceResult = await this.optimizePrice(request.vehicleData);
                    sendResponse(priceResult);
                    break;

                case 'uploadVehicle':
                    const uploadResult = await this.uploadVehicleToMarketplace(request.vehicleData);
                    sendResponse(uploadResult);
                    break;

                case 'getAnalytics':
                    const analyticsResult = await this.getAnalytics(request.tenantId);
                    sendResponse(analyticsResult);
                    break;

                default:
                    sendResponse({ error: 'Unknown action' });
            }
        } catch (error) {
            console.error('Error handling message:', error);
            sendResponse({ error: error.message });
        }
    }

    async handleAuthentication(credentials) {
        try {
            // Authenticate with JokerVision API
            const response = await fetch(`${this.apiBaseUrl}/auth/extension-login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(credentials)
            });

            if (response.ok) {
                const result = await response.json();
                
                // Store authentication data
                await chrome.storage.local.set({
                    currentUser: result.user,
                    tenantId: result.tenant_id,
                    authToken: result.token
                });

                this.currentUser = result.user;
                this.currentTenantId = result.tenant_id;

                return { success: true, user: result.user };
            } else {
                throw new Error('Authentication failed');
            }
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    async syncInventory(tenantId) {
        if (!tenantId) {
            throw new Error('Tenant ID required');
        }

        try {
            const response = await fetch(`${this.apiBaseUrl}/inventory/sync`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    tenant_id: tenantId,
                    source: 'facebook_marketplace'
                })
            });

            if (response.ok) {
                const result = await response.json();
                
                // Show notification if enabled
                if (this.settings.enableNotifications) {
                    this.showNotification(
                        'Inventory Sync Complete',
                        `Synced ${result.vehicles_processed} vehicles successfully`
                    );
                }

                return result;
            } else {
                throw new Error('Sync failed');
            }
        } catch (error) {
            if (this.settings.enableNotifications) {
                this.showNotification('Sync Failed', error.message, 'error');
            }
            throw error;
        }
    }

    async generateSEOContent(vehicleData) {
        if (!this.currentTenantId) {
            throw new Error('Not authenticated');
        }

        try {
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
                return await response.json();
            } else {
                throw new Error('SEO generation failed');
            }
        } catch (error) {
            throw error;
        }
    }

    async optimizePrice(vehicleData) {
        if (!this.currentTenantId) {
            throw new Error('Not authenticated');
        }

        try {
            const response = await fetch(`${this.apiBaseUrl}/ai/optimize-price`, {
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
                return await response.json();
            } else {
                throw new Error('Price optimization failed');
            }
        } catch (error) {
            throw error;
        }
    }

    async uploadVehicleToMarketplace(vehicleData) {
        // This would integrate with Facebook's API
        // For now, return a simulated response
        return {
            success: true,
            listing_id: 'fb_' + Date.now(),
            message: 'Vehicle uploaded to Facebook Marketplace'
        };
    }

    async getAnalytics(tenantId) {
        if (!tenantId) {
            throw new Error('Tenant ID required');
        }

        try {
            const response = await fetch(`${this.apiBaseUrl}/analytics/marketplace-performance?tenant_id=${tenantId}`);
            
            if (response.ok) {
                return await response.json();
            } else {
                throw new Error('Failed to fetch analytics');
            }
        } catch (error) {
            throw error;
        }
    }

    setupAlarms() {
        // Create alarm for periodic sync
        chrome.alarms.create('inventorySync', {
            delayInMinutes: 1,
            periodInMinutes: this.settings?.syncInterval || 15
        });

        // Create alarm for daily analytics
        chrome.alarms.create('dailyAnalytics', {
            delayInMinutes: 5,
            periodInMinutes: 1440 // 24 hours
        });
    }

    async handleAlarm(alarm) {
        switch (alarm.name) {
            case 'inventorySync':
                if (this.currentTenantId && this.settings?.autoSync) {
                    await this.syncInventory(this.currentTenantId);
                }
                break;

            case 'dailyAnalytics':
                if (this.currentTenantId) {
                    await this.generateDailyAnalytics();
                }
                break;
        }
    }

    async generateDailyAnalytics() {
        try {
            const analytics = await this.getAnalytics(this.currentTenantId);
            
            // Store analytics for later use
            await chrome.storage.local.set({
                lastAnalytics: {
                    data: analytics,
                    timestamp: Date.now()
                }
            });

            if (this.settings.enableNotifications && analytics.significant_changes) {
                this.showNotification(
                    'Daily Analytics Update',
                    `Performance changes detected: ${analytics.summary}`
                );
            }
        } catch (error) {
            console.error('Error generating daily analytics:', error);
        }
    }

    interceptApiRequests(details) {
        // Intercept Facebook API requests to gather additional data
        if (details.url.includes('marketplace') && details.method === 'POST') {
            console.log('Intercepted marketplace API call:', details);
            
            // Log for analytics purposes
            this.logMarketplaceActivity({
                url: details.url,
                timestamp: Date.now(),
                type: 'api_call'
            });
        }
    }

    async logMarketplaceActivity(activity) {
        if (!this.currentTenantId) return;

        try {
            await fetch(`${this.apiBaseUrl}/analytics/log-activity`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    tenant_id: this.currentTenantId,
                    activity: activity
                })
            });
        } catch (error) {
            console.error('Error logging activity:', error);
        }
    }

    onTabUpdated(tabId, changeInfo, tab) {
        if (changeInfo.status === 'complete' && tab.url) {
            if (tab.url.includes('marketplace.facebook.com')) {
                // Inject additional functionality when user visits Facebook Marketplace
                this.enhanceMarketplacePage(tabId, tab.url);
            }
        }
    }

    async enhanceMarketplacePage(tabId, url) {
        try {
            // Inject additional scripts or notify content script
            await chrome.tabs.sendMessage(tabId, {
                action: 'enhancePage',
                url: url,
                timestamp: Date.now()
            });
        } catch (error) {
            // Tab might not be ready yet, ignore error
            console.log('Tab not ready for enhancement:', error.message);
        }
    }

    showWelcomeNotification() {
        this.showNotification(
            'JokerVision AutoDealer Pro Installed!',
            'Click the extension icon to get started with AI-powered vehicle listings.',
            'success'
        );
    }

    showUpdateNotification() {
        this.showNotification(
            'JokerVision Updated!',
            'New features and improvements are now available.',
            'info'
        );
    }

    showNotification(title, message, type = 'info') {
        if (!this.settings?.enableNotifications) return;

        const iconUrl = type === 'error' ? 'icons/icon48.png' : 'icons/icon48.png';

        chrome.notifications.create({
            type: 'basic',
            iconUrl: iconUrl,
            title: title,
            message: message
        }, (notificationId) => {
            // Auto-clear notification after 5 seconds
            setTimeout(() => {
                chrome.notifications.clear(notificationId);
            }, 5000);
        });
    }

    startBackgroundSync() {
        if (this.settings?.autoSync && this.currentTenantId) {
            console.log('Starting background sync...');
            // Sync will be handled by alarms
        }
    }
}

// Initialize the background service
const jokerVisionBackground = new JokerVisionBackground();