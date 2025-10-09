// JokerVision AutoDealer Pro - Advanced Facebook Marketplace Injection
(function() {
    'use strict';

    class FacebookMarketplaceIntegration {
        constructor() {
            this.apiBaseUrl = window.JokerVisionConfig?.apiBaseUrl || 'https://dealergenius.preview.emergentagent.com/api';
            this.initialized = false;
            this.observers = [];
            this.init();
        }

        init() {
            if (this.initialized) return;
            
            // Wait for Facebook's React app to load
            this.waitForFacebookLoad(() => {
                this.setup();
                this.initialized = true;
            });
        }

        waitForFacebookLoad(callback) {
            const checkInterval = setInterval(() => {
                if (window.require && window.require('ServerJS')) {
                    clearInterval(checkInterval);
                    setTimeout(callback, 1000); // Give it a moment to fully load
                }
            }, 500);

            // Fallback timeout
            setTimeout(() => {
                clearInterval(checkInterval);
                callback();
            }, 10000);
        }

        setup() {
            console.log('JokerVision: Setting up Facebook Marketplace integration');
            
            this.interceptFormSubmissions();
            this.monitorListingCreation();
            this.enhancePhotoUploads();
            this.addAnalyticsTracking();
            this.setupAdvancedFeatures();
        }

        interceptFormSubmissions() {
            // Override Facebook's form submission to add our enhancements
            const originalFetch = window.fetch;
            window.fetch = async (url, options) => {
                if (url.includes('/marketplace/') && options && options.method === 'POST') {
                    console.log('JokerVision: Intercepting marketplace submission');
                    
                    try {
                        // Enhance the request with our AI optimizations
                        const enhancedOptions = await this.enhanceRequest(url, options);
                        const result = await originalFetch(url, enhancedOptions);
                        
                        // Log the submission for analytics
                        this.logListingSubmission(url, options);
                        
                        return result;
                    } catch (error) {
                        console.error('JokerVision: Error enhancing request:', error);
                        return originalFetch(url, options);
                    }
                }
                
                return originalFetch(url, options);
            };
        }

        async enhanceRequest(url, options) {
            try {
                if (options.body && typeof options.body === 'string') {
                    const formData = JSON.parse(options.body);
                    
                    // Check if this is a vehicle listing
                    if (this.isVehicleListing(formData)) {
                        const enhanced = await this.enhanceVehicleListing(formData);
                        return {
                            ...options,
                            body: JSON.stringify(enhanced)
                        };
                    }
                }
            } catch (error) {
                console.error('JokerVision: Error parsing request:', error);
            }
            
            return options;
        }

        isVehicleListing(data) {
            // Detect if this is a vehicle listing based on common patterns
            const stringified = JSON.stringify(data).toLowerCase();
            return stringified.includes('vehicle') || 
                   stringified.includes('car') || 
                   stringified.includes('truck') || 
                   stringified.includes('auto') ||
                   stringified.includes('mileage') ||
                   stringified.includes('engine');
        }

        async enhanceVehicleListing(listingData) {
            try {
                // Get user's tenant ID from extension storage
                const tenantId = await this.getTenantId();
                if (!tenantId) return listingData;

                // Extract vehicle information
                const vehicleInfo = this.extractVehicleInfo(listingData);
                
                // Get AI enhancements
                const enhancements = await this.getAIEnhancements(tenantId, vehicleInfo);
                
                // Apply enhancements to the listing
                return this.applyEnhancements(listingData, enhancements);
                
            } catch (error) {
                console.error('JokerVision: Error enhancing listing:', error);
                return listingData;
            }
        }

        extractVehicleInfo(data) {
            const info = {};
            const str = JSON.stringify(data);
            
            // Extract common vehicle attributes
            const yearMatch = str.match(/\b(19|20)\d{2}\b/);
            if (yearMatch) info.year = yearMatch[0];
            
            // Common makes
            const makes = ['toyota', 'honda', 'ford', 'chevrolet', 'nissan', 'bmw', 'mercedes', 'audi'];
            for (const make of makes) {
                if (str.toLowerCase().includes(make)) {
                    info.make = make;
                    break;
                }
            }
            
            // Look for price
            const priceMatch = str.match(/\$?(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/);
            if (priceMatch) info.price = parseFloat(priceMatch[1].replace(',', ''));
            
            return info;
        }

        async getAIEnhancements(tenantId, vehicleInfo) {
            try {
                const response = await fetch(`${this.apiBaseUrl}/ai/enhance-listing`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        tenant_id: tenantId,
                        vehicle_info: vehicleInfo
                    })
                });

                if (response.ok) {
                    return await response.json();
                }
            } catch (error) {
                console.error('JokerVision: Error getting AI enhancements:', error);
            }
            
            return null;
        }

        applyEnhancements(originalData, enhancements) {
            if (!enhancements) return originalData;
            
            const enhanced = { ...originalData };
            
            // Apply SEO-optimized description
            if (enhancements.optimized_description) {
                this.updateDescriptionInData(enhanced, enhancements.optimized_description);
            }
            
            // Apply optimized pricing
            if (enhancements.recommended_price) {
                this.updatePriceInData(enhanced, enhancements.recommended_price);
            }
            
            // Apply enhanced tags/keywords
            if (enhancements.keywords) {
                this.addKeywordsToData(enhanced, enhancements.keywords);
            }
            
            return enhanced;
        }

        updateDescriptionInData(data, newDescription) {
            // Find and update description field in the nested data structure
            this.recursiveUpdate(data, (key, value) => {
                if (typeof value === 'string' && value.length > 50 && 
                    (key.toLowerCase().includes('description') || 
                     key.toLowerCase().includes('body') ||
                     value.toLowerCase().includes('car') ||
                     value.toLowerCase().includes('vehicle'))) {
                    return this.blendDescriptions(value, newDescription);
                }
                return value;
            });
        }

        blendDescriptions(original, enhanced) {
            // Intelligently blend original and AI-enhanced descriptions
            if (original.length < 50) return enhanced;
            
            // Keep user's personal touches but enhance with AI improvements
            const sentences = enhanced.split('. ');
            const originalSentences = original.split('. ');
            
            // Use first part of original, then AI enhancements
            const blended = originalSentences.slice(0, 1).concat(sentences.slice(1));
            return blended.join('. ');
        }

        updatePriceInData(data, newPrice) {
            this.recursiveUpdate(data, (key, value) => {
                if ((key.toLowerCase().includes('price') || key.toLowerCase().includes('amount')) && 
                    typeof value === 'number') {
                    return newPrice;
                }
                return value;
            });
        }

        addKeywordsToData(data, keywords) {
            // Add keywords to title or tags if such fields exist
            this.recursiveUpdate(data, (key, value) => {
                if (typeof value === 'string' && 
                    (key.toLowerCase().includes('title') || key.toLowerCase().includes('tag'))) {
                    return this.enhanceWithKeywords(value, keywords);
                }
                return value;
            });
        }

        enhanceWithKeywords(text, keywords) {
            // Naturally integrate keywords into existing text
            const lowercaseText = text.toLowerCase();
            const newKeywords = keywords.filter(kw => !lowercaseText.includes(kw.toLowerCase()));
            
            if (newKeywords.length > 0) {
                return `${text} ${newKeywords.slice(0, 3).join(' ')}`.trim();
            }
            
            return text;
        }

        recursiveUpdate(obj, updateFn) {
            for (const key in obj) {
                if (obj.hasOwnProperty(key)) {
                    if (typeof obj[key] === 'object' && obj[key] !== null) {
                        this.recursiveUpdate(obj[key], updateFn);
                    } else {
                        obj[key] = updateFn(key, obj[key]);
                    }
                }
            }
        }

        monitorListingCreation() {
            // Monitor DOM changes to detect listing creation process
            const observer = new MutationObserver((mutations) => {
                mutations.forEach((mutation) => {
                    if (mutation.type === 'childList') {
                        mutation.addedNodes.forEach((node) => {
                            if (node.nodeType === Node.ELEMENT_NODE) {
                                this.checkForListingElements(node);
                            }
                        });
                    }
                });
            });

            observer.observe(document.body, {
                childList: true,
                subtree: true
            });

            this.observers.push(observer);
        }

        checkForListingElements(element) {
            // Look for specific Facebook Marketplace elements
            const selectors = [
                '[data-testid*="marketplace"]',
                '[aria-label*="Create listing"]',
                '[placeholder*="What are you selling"]',
                'input[type="file"][accept*="image"]'
            ];

            selectors.forEach(selector => {
                if (element.matches && element.matches(selector)) {
                    this.enhanceElement(element);
                } else if (element.querySelector) {
                    const found = element.querySelector(selector);
                    if (found) this.enhanceElement(found);
                }
            });
        }

        enhanceElement(element) {
            // Add JokerVision enhancements to specific elements
            if (element.dataset.jokerVisionEnhanced) return;
            element.dataset.jokerVisionEnhanced = 'true';

            if (element.type === 'file') {
                this.enhancePhotoUpload(element);
            } else if (element.tagName === 'TEXTAREA' || element.contentEditable === 'true') {
                this.enhanceTextInput(element);
            }
        }

        enhancePhotoUpload(fileInput) {
            // Add photo enhancement capabilities
            fileInput.addEventListener('change', async (event) => {
                const files = Array.from(event.target.files);
                const tenantId = await this.getTenantId();
                
                if (files.length > 0 && tenantId) {
                    await this.processPhotos(files, tenantId);
                }
            });
        }

        enhanceTextInput(textElement) {
            // Add AI text enhancement button
            const enhanceButton = document.createElement('button');
            enhanceButton.className = 'jokervision-ai-enhance';
            enhanceButton.innerHTML = '✨ AI Enhance';
            enhanceButton.type = 'button';
            
            enhanceButton.style.cssText = `
                position: absolute;
                top: 5px;
                right: 5px;
                z-index: 1000;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                border: none;
                border-radius: 4px;
                padding: 4px 8px;
                font-size: 11px;
                cursor: pointer;
                box-shadow: 0 2px 4px rgba(0,0,0,0.2);
            `;

            const container = textElement.closest('div');
            if (container) {
                container.style.position = 'relative';
                container.appendChild(enhanceButton);

                enhanceButton.addEventListener('click', async () => {
                    await this.enhanceTextContent(textElement);
                });
            }
        }

        async enhanceTextContent(textElement) {
            const tenantId = await this.getTenantId();
            if (!tenantId) return;

            const currentText = this.getTextValue(textElement);
            
            try {
                const response = await fetch(`${this.apiBaseUrl}/ai/enhance-text`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        tenant_id: tenantId,
                        text: currentText,
                        context: 'vehicle_listing'
                    })
                });

                if (response.ok) {
                    const result = await response.json();
                    this.setTextValue(textElement, result.enhanced_text);
                    
                    // Show success indicator
                    this.showEnhancementSuccess(textElement);
                }
            } catch (error) {
                console.error('JokerVision: Error enhancing text:', error);
            }
        }

        getTextValue(element) {
            if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
                return element.value;
            } else if (element.contentEditable === 'true') {
                return element.textContent;
            }
            return '';
        }

        setTextValue(element, value) {
            if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
                element.value = value;
                element.dispatchEvent(new Event('input', { bubbles: true }));
            } else if (element.contentEditable === 'true') {
                element.textContent = value;
                element.dispatchEvent(new Event('input', { bubbles: true }));
            }
        }

        showEnhancementSuccess(element) {
            const indicator = document.createElement('div');
            indicator.innerHTML = '✅ Enhanced!';
            indicator.style.cssText = `
                position: absolute;
                top: -25px;
                right: 5px;
                background: #28a745;
                color: white;
                padding: 2px 6px;
                border-radius: 3px;
                font-size: 10px;
                z-index: 1001;
            `;

            const container = element.closest('div');
            if (container) {
                container.appendChild(indicator);
                setTimeout(() => {
                    if (indicator.parentNode) {
                        indicator.parentNode.removeChild(indicator);
                    }
                }, 3000);
            }
        }

        async processPhotos(files, tenantId) {
            // Future implementation for photo enhancement
            console.log('JokerVision: Processing photos for enhancement', files.length);
        }

        enhancePhotoUploads() {
            // Monitor for photo upload areas and enhance them
            const photoObserver = new MutationObserver((mutations) => {
                mutations.forEach((mutation) => {
                    mutation.addedNodes.forEach((node) => {
                        if (node.nodeType === Node.ELEMENT_NODE) {
                            const fileInputs = node.querySelectorAll('input[type="file"]');
                            fileInputs.forEach(input => {
                                if (input.accept && input.accept.includes('image')) {
                                    this.enhanceElement(input);
                                }
                            });
                        }
                    });
                });
            });

            photoObserver.observe(document.body, {
                childList: true,
                subtree: true
            });

            this.observers.push(photoObserver);
        }

        addAnalyticsTracking() {
            // Track user interactions for analytics
            document.addEventListener('click', (event) => {
                if (event.target.closest('[data-testid*="marketplace"]')) {
                    this.trackInteraction('marketplace_click', {
                        element: event.target.tagName,
                        timestamp: Date.now()
                    });
                }
            });
        }

        async trackInteraction(event, data) {
            const tenantId = await this.getTenantId();
            if (!tenantId) return;

            try {
                await fetch(`${this.apiBaseUrl}/analytics/track-interaction`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        tenant_id: tenantId,
                        event: event,
                        data: data,
                        url: window.location.href
                    })
                });
            } catch (error) {
                console.error('JokerVision: Error tracking interaction:', error);
            }
        }

        setupAdvancedFeatures() {
            // Setup advanced features like competitor analysis
            this.monitorCompetitorListings();
            this.setupPriceTracking();
        }

        monitorCompetitorListings() {
            // Monitor competitor listings for analysis
            const listingObserver = new MutationObserver((mutations) => {
                mutations.forEach((mutation) => {
                    mutation.addedNodes.forEach((node) => {
                        if (node.nodeType === Node.ELEMENT_NODE) {
                            const listings = node.querySelectorAll('[data-testid*="marketplace-listing"]');
                            listings.forEach(listing => {
                                this.analyzeCompetitorListing(listing);
                            });
                        }
                    });
                });
            });

            listingObserver.observe(document.body, {
                childList: true,
                subtree: true
            });

            this.observers.push(listingObserver);
        }

        async analyzeCompetitorListing(listingElement) {
            const tenantId = await this.getTenantId();
            if (!tenantId) return;

            try {
                const listingData = this.extractListingData(listingElement);
                
                await fetch(`${this.apiBaseUrl}/analytics/competitor-listing`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        tenant_id: tenantId,
                        listing_data: listingData
                    })
                });
            } catch (error) {
                console.error('JokerVision: Error analyzing competitor listing:', error);
            }
        }

        extractListingData(element) {
            // Extract relevant data from competitor listings
            const data = {};
            
            const titleElement = element.querySelector('[data-testid*="title"], h3, h4');
            if (titleElement) data.title = titleElement.textContent.trim();
            
            const priceElement = element.querySelector('[data-testid*="price"], .price');
            if (priceElement) {
                const priceText = priceElement.textContent.replace(/[^\d.,]/g, '');
                data.price = parseFloat(priceText.replace(',', ''));
            }
            
            const locationElement = element.querySelector('[data-testid*="location"]');
            if (locationElement) data.location = locationElement.textContent.trim();
            
            return data;
        }

        setupPriceTracking() {
            // Track price changes in the market
            setInterval(async () => {
                const tenantId = await this.getTenantId();
                if (tenantId && window.location.href.includes('marketplace.facebook.com')) {
                    await this.collectMarketPrices(tenantId);
                }
            }, 300000); // Every 5 minutes
        }

        async collectMarketPrices(tenantId) {
            const listings = document.querySelectorAll('[data-testid*="marketplace-listing"]');
            const priceData = [];

            listings.forEach(listing => {
                const data = this.extractListingData(listing);
                if (data.price && data.title) {
                    priceData.push(data);
                }
            });

            if (priceData.length > 0) {
                try {
                    await fetch(`${this.apiBaseUrl}/analytics/market-prices`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            tenant_id: tenantId,
                            price_data: priceData,
                            timestamp: Date.now()
                        })
                    });
                } catch (error) {
                    console.error('JokerVision: Error collecting market prices:', error);
                }
            }
        }

        async logListingSubmission(url, options) {
            const tenantId = await this.getTenantId();
            if (!tenantId) return;

            try {
                await fetch(`${this.apiBaseUrl}/analytics/listing-submission`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        tenant_id: tenantId,
                        submission_url: url,
                        timestamp: Date.now()
                    })
                });
            } catch (error) {
                console.error('JokerVision: Error logging submission:', error);
            }
        }

        async getTenantId() {
            try {
                const result = await new Promise((resolve) => {
                    chrome.storage.local.get(['tenantId'], resolve);
                });
                return result.tenantId;
            } catch (error) {
                console.error('JokerVision: Error getting tenant ID:', error);
                return null;
            }
        }

        // Cleanup method
        destroy() {
            this.observers.forEach(observer => observer.disconnect());
            this.observers = [];
            this.initialized = false;
        }
    }

    // Initialize the integration
    const fbIntegration = new FacebookMarketplaceIntegration();

    // Cleanup on page unload
    window.addEventListener('beforeunload', () => {
        fbIntegration.destroy();
    });

})();