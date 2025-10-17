// JokerVision - Inventory Scraper for Dealership Websites
// Supports: Cars.com, AutoTrader, CarGurus, and generic dealership sites

console.log('JokerVision Inventory Scraper loaded');

// Detect which site we're on
function detectInventoryWebsite() {
    const url = window.location.href;
    const hostname = window.location.hostname;
    
    if (hostname.includes('cars.com')) return 'cars.com';
    if (hostname.includes('autotrader.com')) return 'autotrader';
    if (hostname.includes('cargurus.com')) return 'cargurus';
    if (hostname.includes('carfax.com')) return 'carfax';
    
    // Check if page has vehicle listings (generic dealership site)
    const hasVehicleElements = document.querySelector('.vehicle, .car, .inventory-item, [data-vehicle], [data-vin]');
    if (hasVehicleElements) return 'generic';
    
    return null;
}

// Scrape Cars.com inventory
function scrapeCarsComInventory() {
    const vehicles = [];
    
    // Cars.com uses these selectors (as of 2024-2025)
    const listings = document.querySelectorAll('.vehicle-card, [data-testid="vehicle-card"]');
    
    listings.forEach(listing => {
        try {
            const vehicle = {
                title: listing.querySelector('.title, .vehicle-card-title, h2')?.textContent?.trim(),
                year: listing.querySelector('.year')?.textContent?.trim(),
                make: listing.querySelector('.make')?.textContent?.trim(),
                model: listing.querySelector('.model')?.textContent?.trim(),
                price: listing.querySelector('.price, .primary-price')?.textContent?.trim(),
                mileage: listing.querySelector('.mileage')?.textContent?.trim(),
                image: listing.querySelector('img')?.src,
                url: listing.querySelector('a')?.href,
                vin: listing.getAttribute('data-vin') || extractVINFromListing(listing),
                source: 'cars.com'
            };
            
            if (vehicle.title || vehicle.make) {
                vehicles.push(vehicle);
            }
        } catch (error) {
            console.error('Error scraping Cars.com listing:', error);
        }
    });
    
    return vehicles;
}

// Scrape AutoTrader inventory
function scrapeAutoTraderInventory() {
    const vehicles = [];
    
    // AutoTrader selectors
    const listings = document.querySelectorAll('[data-cmp="inventoryListing"], .inventory-listing');
    
    listings.forEach(listing => {
        try {
            const vehicle = {
                title: listing.querySelector('.listing-title, h2')?.textContent?.trim(),
                year: listing.querySelector('.year')?.textContent?.trim(),
                make: listing.querySelector('.make')?.textContent?.trim(),
                model: listing.querySelector('.model')?.textContent?.trim(),
                price: listing.querySelector('.first-price, .primary-price')?.textContent?.trim(),
                mileage: listing.querySelector('.mileage')?.textContent?.trim(),
                image: listing.querySelector('img')?.src,
                url: listing.querySelector('a')?.href,
                vin: listing.getAttribute('data-vin') || extractVINFromListing(listing),
                trim: listing.querySelector('.trim')?.textContent?.trim(),
                source: 'autotrader'
            };
            
            if (vehicle.title || vehicle.make) {
                vehicles.push(vehicle);
            }
        } catch (error) {
            console.error('Error scraping AutoTrader listing:', error);
        }
    });
    
    return vehicles;
}

// Scrape CarGurus inventory
function scrapeCarGurusInventory() {
    const vehicles = [];
    
    console.log('CarGurus: Starting scrape...');
    
    // Try multiple selector patterns for CarGurus
    const selectorPatterns = [
        '[data-testid="listing-card"]',
        '.listing-row',
        '[data-cg-ft="listing-card"]',
        '.car-blade',
        'article[data-listing-id]',
        '[class*="listing"]',
        '[class*="vehicle"]'
    ];
    
    let listings = [];
    for (const selector of selectorPatterns) {
        const found = document.querySelectorAll(selector);
        if (found.length > 0) {
            console.log(`CarGurus: Found ${found.length} listings with selector: ${selector}`);
            listings = found;
            break;
        }
    }
    
    if (listings.length === 0) {
        console.log('CarGurus: No listings found with any selector, trying generic scrape');
        return [];
    }
    
    listings.forEach((listing, index) => {
        try {
            // Try to extract all text content
            const allText = listing.textContent || '';
            
            // Look for vehicle title in multiple places
            let title = listing.querySelector('.cg-dealFinder-result-model, [class*="title"], [class*="model"], h2, h3, h4')?.textContent?.trim();
            
            // Extract price
            let price = listing.querySelector('.price-section, .price, [class*="price"]')?.textContent?.trim();
            if (!price) {
                const priceMatch = allText.match(/\$[\d,]+/);
                price = priceMatch ? priceMatch[0] : '';
            }
            
            // Extract mileage
            let mileage = listing.querySelector('.cg-dealFinder-result-stats, [class*="mileage"]')?.textContent?.trim();
            if (!mileage) {
                const mileageMatch = allText.match(/([\d,]+)\s*(mi|miles|km)/i);
                mileage = mileageMatch ? mileageMatch[0] : '';
            }
            
            const vehicle = {
                title: title || '',
                year: extractYear(allText),
                make: extractMake(allText),
                model: '',
                price: price,
                mileage: mileage,
                image: listing.querySelector('img')?.src || '',
                url: listing.querySelector('a')?.href || window.location.href,
                vin: extractVINFromListing(listing),
                dealer: listing.querySelector('.dealer-name, [class*="dealer"]')?.textContent?.trim() || '',
                fullText: allText.substring(0, 500),
                source: 'cargurus'
            };
            
            console.log(`CarGurus listing ${index + 1}:`, {title: vehicle.title, price: vehicle.price});
            
            if (vehicle.title || vehicle.price || vehicle.year) {
                vehicles.push(vehicle);
            }
        } catch (error) {
            console.error(`Error scraping CarGurus listing ${index}:`, error);
        }
    });
    
    console.log(`CarGurus: Scraped ${vehicles.length} vehicles`);
    return vehicles;
}

// Generic scraper for any dealership website
function scrapeGenericInventory() {
    const vehicles = [];
    
    // Try common patterns
    const selectors = [
        '.vehicle',
        '.car',
        '.inventory-item',
        '[data-vehicle]',
        '[data-vin]',
        '.product',
        '.listing'
    ];
    
    for (const selector of selectors) {
        const listings = document.querySelectorAll(selector);
        
        if (listings.length > 0) {
            listings.forEach(listing => {
                try {
                    // Try to extract any vehicle information we can find
                    const allText = listing.textContent;
                    
                    const vehicle = {
                        title: listing.querySelector('h1, h2, h3, .title, .name')?.textContent?.trim(),
                        price: extractPrice(listing),
                        mileage: extractMileage(listing),
                        image: listing.querySelector('img')?.src,
                        url: listing.querySelector('a')?.href || window.location.href,
                        vin: extractVINFromListing(listing),
                        year: extractYear(allText),
                        make: extractMake(allText),
                        model: extractModel(allText),
                        fullText: allText.substring(0, 500), // First 500 chars for AI processing
                        source: 'generic'
                    };
                    
                    if (vehicle.title || vehicle.vin || vehicle.price) {
                        vehicles.push(vehicle);
                    }
                } catch (error) {
                    console.error('Error scraping generic listing:', error);
                }
            });
            
            if (vehicles.length > 0) break; // Found vehicles, stop trying other selectors
        }
    }
    
    return vehicles;
}

// Helper: Extract VIN from listing
function extractVINFromListing(element) {
    const text = element.textContent;
    const vinMatch = text.match(/VIN[:\s]*([A-HJ-NPR-Z0-9]{17})/i);
    return vinMatch ? vinMatch[1] : '';
}

// Helper: Extract price
function extractPrice(element) {
    const priceSelectors = ['.price', '[class*="price"]', '[data-price]'];
    
    for (const selector of priceSelectors) {
        const priceEl = element.querySelector(selector);
        if (priceEl) return priceEl.textContent.trim();
    }
    
    // Try regex on all text
    const text = element.textContent;
    const priceMatch = text.match(/\$[\d,]+/);
    return priceMatch ? priceMatch[0] : '';
}

// Helper: Extract mileage
function extractMileage(element) {
    const text = element.textContent;
    const mileageMatch = text.match(/([\d,]+)\s*(mi|miles|km)/i);
    return mileageMatch ? mileageMatch[1] : '';
}

// Helper: Extract year
function extractYear(text) {
    const yearMatch = text.match(/\b(19|20)\d{2}\b/);
    return yearMatch ? yearMatch[0] : '';
}

// Helper: Extract make (common car brands)
function extractMake(text) {
    const makes = ['Toyota', 'Honda', 'Ford', 'Chevrolet', 'Nissan', 'BMW', 'Mercedes', 'Audi', 'Volkswagen', 'Hyundai', 'Kia', 'Mazda', 'Subaru', 'Jeep', 'Ram', 'GMC', 'Dodge', 'Chrysler', 'Lexus', 'Acura', 'Infiniti', 'Cadillac', 'Buick', 'Lincoln', 'Volvo', 'Porsche', 'Tesla', 'Rivian'];
    
    for (const make of makes) {
        if (text.includes(make)) return make;
    }
    return '';
}

// Helper: Extract model (after make)
function extractModel(text) {
    // This is complex, would need AI or more sophisticated parsing
    // For now, return empty and let backend AI handle it
    return '';
}

// Main scraping function
function scrapeCurrentPage() {
    const siteType = detectInventoryWebsite();
    
    if (!siteType) {
        console.log('Not an inventory website');
        return { success: false, message: 'Not on a supported inventory website' };
    }
    
    console.log(`Detected website type: ${siteType}`);
    
    let vehicles = [];
    
    switch (siteType) {
        case 'cars.com':
            vehicles = scrapeCarsComInventory();
            break;
        case 'autotrader':
            vehicles = scrapeAutoTraderInventory();
            break;
        case 'cargurus':
            vehicles = scrapeCarGurusInventory();
            break;
        case 'generic':
            vehicles = scrapeGenericInventory();
            break;
    }
    
    console.log(`Scraped ${vehicles.length} vehicles`);
    
    return {
        success: true,
        vehicles: vehicles,
        siteType: siteType,
        scrapedAt: new Date().toISOString(),
        url: window.location.href
    };
}

// Listen for messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'scrapeInventory') {
        const result = scrapeCurrentPage();
        sendResponse(result);
    }
    return true;
});

// Export for testing
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { scrapeCurrentPage, detectInventoryWebsite };
}
