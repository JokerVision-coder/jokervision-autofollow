// JokerVision AutoDealer Pro - Content Script for Facebook Marketplace
class MarketplaceContentScript {
    constructor() {
        this.apiBaseUrl = 'https://joker-dealership.preview.emergentagent.com/api';
        this.currentTenantId = null;
        this.isInitialized = false;
        this.init();
    }

    async init() {
        // Wait for page to load
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setup());
        } else {
            this.setup();
        }
    }

    async setup() {
        try {
            // Get user data from Chrome storage
            const result = await chrome.storage.local.get(['currentUser', 'tenantId']);
            if (result.tenantId) {
                this.currentTenantId = result.tenantId;
                this.isInitialized = true;
                
                // Setup page monitoring and injection
                this.setupPageMonitoring();
                this.injectJokerVisionUI();
                
                console.log('JokerVision AutoDealer Pro: Content script initialized');
            } else {
                console.log('JokerVision AutoDealer Pro: User not authenticated');
            }
        } catch (error) {
            console.error('JokerVision initialization error:', error);
        }
    }

    setupPageMonitoring() {
        // Monitor URL changes for SPA navigation
        let lastUrl = location.href;
        new MutationObserver(() => {
            const url = location.href;
            if (url !== lastUrl) {
                lastUrl = url;
                this.onPageChange();
            }
        }).observe(document, { subtree: true, childList: true });

        // Initial page check
        this.onPageChange();
    }

    onPageChange() {
        const currentUrl = window.location.href;
        
        if (currentUrl.includes('marketplace.facebook.com/create')) {
            // User is on vehicle listing creation page
            setTimeout(() => this.enhanceListingCreationPage(), 1000);
        } else if (currentUrl.includes('marketplace.facebook.com/item/')) {
            // User is viewing a specific listing
            setTimeout(() => this.enhanceListingViewPage(), 1000);
        } else if (currentUrl.includes('marketplace.facebook.com')) {
            // User is on marketplace homepage or browsing
            setTimeout(() => this.enhanceMarketplaceBrowsing(), 1000);
        }
    }

    injectJokerVisionUI() {
        // Create floating action button
        const fab = document.createElement('div');
        fab.id = 'jokervision-fab';
        fab.className = 'jokervision-fab';
        fab.innerHTML = `
            <div class="fab-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
            </div>
            <div class="fab-menu" style="display: none;">
                <button class="fab-menu-item" id="jv-optimize-seo">
                    <span>Optimize SEO</span>
                </button>
                <button class="fab-menu-item" id="jv-price-check">
                    <span>Price Check</span>
                </button>
                <button class="fab-menu-item" id="jv-bulk-actions">
                    <span>Bulk Actions</span>
                </button>
                <button class="fab-menu-item" id="jv-analytics">
                    <span>Analytics</span>
                </button>
            </div>
        `;

        // Add to page
        document.body.appendChild(fab);

        // Setup FAB functionality
        this.setupFAB(fab);
    }

    setupFAB(fab) {
        const fabIcon = fab.querySelector('.fab-icon');
        const fabMenu = fab.querySelector('.fab-menu');
        let isMenuOpen = false;

        fabIcon.addEventListener('click', () => {
            isMenuOpen = !isMenuOpen;
            fabMenu.style.display = isMenuOpen ? 'block' : 'none';
            fabIcon.style.transform = isMenuOpen ? 'rotate(45deg)' : 'rotate(0deg)';
        });

        // Setup menu item actions
        document.getElementById('jv-optimize-seo')?.addEventListener('click', () => {
            this.optimizeSEOForCurrentPage();
            this.closeFABMenu(fabIcon, fabMenu);
        });

        document.getElementById('jv-price-check')?.addEventListener('click', () => {
            this.runPriceCheck();
            this.closeFABMenu(fabIcon, fabMenu);
        });

        document.getElementById('jv-bulk-actions')?.addEventListener('click', () => {
            this.openBulkActionsPanel();
            this.closeFABMenu(fabIcon, fabMenu);
        });

        document.getElementById('jv-analytics')?.addEventListener('click', () => {
            this.showAnalyticsPanel();
            this.closeFABMenu(fabIcon, fabMenu);
        });

        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!fab.contains(e.target) && isMenuOpen) {
                this.closeFABMenu(fabIcon, fabMenu);
                isMenuOpen = false;
            }
        });
    }

    closeFABMenu(fabIcon, fabMenu) {
        fabMenu.style.display = 'none';
        fabIcon.style.transform = 'rotate(0deg)';
    }

    enhanceListingCreationPage() {
        console.log('Enhancing listing creation page');
        
        // Find description textarea
        const descriptionField = this.findDescriptionField();
        if (descriptionField) {
            this.addSEOEnhancementButton(descriptionField);
        }

        // Find price field
        const priceField = this.findPriceField();
        if (priceField) {
            this.addPriceOptimizationButton(priceField);
        }

        // Add photo enhancement tools
        this.addPhotoEnhancementTools();
    }

    findDescriptionField() {
        // Try multiple selectors to find the description field
        const selectors = [
            'textarea[placeholder*="description"]',
            'textarea[placeholder*="Describe"]',
            'textarea[aria-label*="description"]',
            'div[contenteditable="true"][aria-label*="description"]',
            'div[role="textbox"][aria-label*="description"]'
        ];

        for (const selector of selectors) {
            const field = document.querySelector(selector);
            if (field) return field;
        }

        return null;
    }

    findPriceField() {
        const selectors = [
            'input[placeholder*="price"]',
            'input[placeholder*="Price"]',
            'input[aria-label*="price"]',
            'input[type="number"]'
        ];

        for (const selector of selectors) {
            const field = document.querySelector(selector);
            if (field) return field;
        }

        return null;
    }

    addSEOEnhancementButton(descriptionField) {
        // Create SEO enhancement button
        const enhanceBtn = document.createElement('button');
        enhanceBtn.type = 'button';
        enhanceBtn.className = 'jokervision-enhance-btn';
        enhanceBtn.innerHTML = `
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
            </svg>
            Enhance with AI
        `;

        // Insert button near the description field
        const fieldContainer = descriptionField.closest('div');
        if (fieldContainer) {
            fieldContainer.style.position = 'relative';
            enhanceBtn.style.position = 'absolute';
            enhanceBtn.style.top = '5px';
            enhanceBtn.style.right = '5px';
            enhanceBtn.style.zIndex = '1000';
            fieldContainer.appendChild(enhanceBtn);

            enhanceBtn.addEventListener('click', async () => {
                await this.enhanceDescriptionWithAI(descriptionField);
            });
        }
    }

    addPriceOptimizationButton(priceField) {
        const optimizeBtn = document.createElement('button');
        optimizeBtn.type = 'button';
        optimizeBtn.className = 'jokervision-price-btn';
        optimizeBtn.innerHTML = `
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M7,15H9C9,16.08 10.37,17 12,17C13.63,17 15,16.08 15,15C15,13.9 13.96,13.5 11.76,12.97C9.64,12.44 7,11.78 7,9C7,7.21 8.47,5.69 10.5,5.18V3H13.5V5.18C15.53,5.69 17,7.21 17,9H15C15,7.92 13.63,7 12,7C10.37,7 9,7.92 9,9C9,10.1 10.04,10.5 12.24,11.03C14.36,11.56 17,12.22 17,15C17,16.79 15.53,18.31 13.5,18.82V21H10.5V18.82C8.47,18.31 7,16.79 7,15Z"/>
            </svg>
            Optimize Price
        `;

        const fieldContainer = priceField.closest('div');
        if (fieldContainer) {
            fieldContainer.style.position = 'relative';
            optimizeBtn.style.position = 'absolute';
            optimizeBtn.style.top = '5px';
            optimizeBtn.style.right = '5px';
            optimizeBtn.style.zIndex = '1000';
            fieldContainer.appendChild(optimizeBtn);

            optimizeBtn.addEventListener('click', async () => {
                await this.optimizePriceWithAI(priceField);
            });
        }
    }

    async enhanceDescriptionWithAI(descriptionField) {
        if (!this.currentTenantId) {
            this.showNotification('Please authenticate with JokerVision first', 'error');
            return;
        }

        // Show loading state
        const enhanceBtn = document.querySelector('.jokervision-enhance-btn');
        const originalText = enhanceBtn.innerHTML;
        enhanceBtn.innerHTML = '<div class="spinner"></div> Enhancing...';
        enhanceBtn.disabled = true;

        try {
            // Extract vehicle data from the page
            const vehicleData = this.extractVehicleDataFromPage();
            
            const response = await fetch(`${this.apiBaseUrl}/ai/generate-seo-description`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    tenant_id: this.currentTenantId,
                    vehicle_data: vehicleData,
                    current_description: descriptionField.value || ''
                })
            });

            if (response.ok) {
                const result = await response.json();
                
                // Update the description field
                this.setFieldValue(descriptionField, result.optimized_description);
                
                this.showNotification('Description enhanced with AI optimization!', 'success');
            } else {
                throw new Error('Failed to enhance description');
            }
        } catch (error) {
            console.error('SEO enhancement error:', error);
            this.showNotification('Failed to enhance description. Please try again.', 'error');
        } finally {
            enhanceBtn.innerHTML = originalText;
            enhanceBtn.disabled = false;
        }
    }

    async optimizePriceWithAI(priceField) {
        if (!this.currentTenantId) {
            this.showNotification('Please authenticate with JokerVision first', 'error');
            return;
        }

        try {
            const vehicleData = this.extractVehicleDataFromPage();
            const currentPrice = parseFloat(priceField.value) || 0;

            const response = await fetch(`${this.apiBaseUrl}/ai/optimize-price`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    tenant_id: this.currentTenantId,
                    vehicle_data: vehicleData,
                    current_price: currentPrice
                })
            });

            if (response.ok) {
                const result = await response.json();
                
                // Show price recommendation modal
                this.showPriceRecommendationModal(result, priceField);
            } else {
                throw new Error('Failed to optimize price');
            }
        } catch (error) {
            console.error('Price optimization error:', error);
            this.showNotification('Failed to optimize price. Please try again.', 'error');
        }
    }

    showPriceRecommendationModal(result, priceField) {
        const modal = document.createElement('div');
        modal.className = 'jokervision-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>AI Price Recommendation</h3>
                    <button class="modal-close">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="price-recommendation">
                        <div class="current-price">
                            <label>Current Price:</label>
                            <span>$${result.current_price?.toLocaleString()}</span>
                        </div>
                        <div class="recommended-price">
                            <label>Recommended Price:</label>
                            <span class="highlight">$${result.recommended_price?.toLocaleString()}</span>
                        </div>
                        <div class="price-explanation">
                            <p>${result.explanation}</p>
                        </div>
                        <div class="market-data">
                            <h4>Market Analysis:</h4>
                            <ul>
                                <li>Average market price: $${result.market_average?.toLocaleString()}</li>
                                <li>Price range: $${result.price_range?.min?.toLocaleString()} - $${result.price_range?.max?.toLocaleString()}</li>
                                <li>Confidence level: ${result.confidence_level}%</li>
                            </ul>
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary" id="keepCurrent">Keep Current</button>
                    <button class="btn btn-primary" id="applyRecommended">Apply Recommended</button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // Setup modal events
        modal.querySelector('.modal-close').addEventListener('click', () => {
            document.body.removeChild(modal);
        });

        modal.querySelector('#keepCurrent').addEventListener('click', () => {
            document.body.removeChild(modal);
        });

        modal.querySelector('#applyRecommended').addEventListener('click', () => {
            this.setFieldValue(priceField, result.recommended_price.toString());
            this.showNotification('Price updated with AI recommendation!', 'success');
            document.body.removeChild(modal);
        });
    }

    extractVehicleDataFromPage() {
        const data = {};

        // Try to extract vehicle information from various parts of the page
        const titleElement = document.querySelector('input[placeholder*="title"], input[aria-label*="title"]');
        if (titleElement) {
            data.title = titleElement.value;
        }

        // Extract from URL or page content
        const url = window.location.href;
        const pathParts = url.split('/');
        
        // Look for common vehicle data patterns
        const textContent = document.body.textContent;
        
        // Try to identify year, make, model from title or content
        const yearMatch = textContent.match(/\b(19|20)\d{2}\b/);
        if (yearMatch) data.year = yearMatch[0];

        // Common car makes
        const makes = ['Toyota', 'Honda', 'Ford', 'Chevrolet', 'Nissan', 'BMW', 'Mercedes', 'Audi', 'Lexus', 'Acura'];
        for (const make of makes) {
            if (textContent.includes(make)) {
                data.make = make;
                break;
            }
        }

        return data;
    }

    setFieldValue(field, value) {
        // Handle both regular inputs and contenteditable divs
        if (field.tagName === 'INPUT' || field.tagName === 'TEXTAREA') {
            field.value = value;
            field.dispatchEvent(new Event('input', { bubbles: true }));
            field.dispatchEvent(new Event('change', { bubbles: true }));
        } else if (field.contentEditable === 'true') {
            field.textContent = value;
            field.dispatchEvent(new Event('input', { bubbles: true }));
        }
    }

    addPhotoEnhancementTools() {
        // Find photo upload areas
        const photoAreas = document.querySelectorAll('input[type="file"], [aria-label*="photo"], [aria-label*="image"]');
        
        photoAreas.forEach(area => {
            if (!area.dataset.jokerVisionEnhanced) {
                area.dataset.jokerVisionEnhanced = 'true';
                this.addPhotoEnhancementButton(area);
            }
        });
    }

    addPhotoEnhancementButton(photoArea) {
        const enhanceBtn = document.createElement('button');
        enhanceBtn.type = 'button';
        enhanceBtn.className = 'jokervision-photo-btn';
        enhanceBtn.innerHTML = `
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M9,3V4H4V6H5V19A2,2 0 0,0 7,21H17A2,2 0 0,0 19,19V6H20V4H15V3H9M7,6H17V19H7V6M9,8V17H11V8H9M13,8V17H15V8H13Z"/>
            </svg>
            Enhance Photos
        `;

        const container = photoArea.closest('div');
        if (container) {
            container.appendChild(enhanceBtn);
            
            enhanceBtn.addEventListener('click', () => {
                this.showNotification('Photo enhancement coming soon!', 'info');
            });
        }
    }

    async optimizeSEOForCurrentPage() {
        const descriptionField = this.findDescriptionField();
        if (descriptionField) {
            await this.enhanceDescriptionWithAI(descriptionField);
        } else {
            this.showNotification('No description field found on this page', 'info');
        }
    }

    async runPriceCheck() {
        const priceField = this.findPriceField();
        if (priceField) {
            await this.optimizePriceWithAI(priceField);
        } else {
            this.showNotification('No price field found on this page', 'info');
        }
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `jokervision-notification ${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <span>${message}</span>
                <button class="notification-close">&times;</button>
            </div>
        `;

        document.body.appendChild(notification);

        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 5000);

        // Manual close
        notification.querySelector('.notification-close').addEventListener('click', () => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        });
    }

    openBulkActionsPanel() {
        this.showNotification('Bulk actions panel coming soon!', 'info');
    }

    showAnalyticsPanel() {
        this.showNotification('Analytics panel coming soon!', 'info');
    }

    // Listen for messages from popup
    setupMessageListener() {
        chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
            switch (request.action) {
                case 'extractVehicleData':
                    sendResponse(this.extractVehicleDataFromPage());
                    break;
                case 'updateDescription':
                    const descField = this.findDescriptionField();
                    if (descField) {
                        this.setFieldValue(descField, request.description);
                        sendResponse({ success: true });
                    } else {
                        sendResponse({ success: false, error: 'Description field not found' });
                    }
                    break;
                default:
                    sendResponse({ error: 'Unknown action' });
            }
        });
    }
}

// Initialize the content script
const marketplaceScript = new MarketplaceContentScript();
marketplaceScript.setupMessageListener();