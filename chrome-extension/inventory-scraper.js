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
    console.log('CarGurus: Current URL:', window.location.href);
    
    // Try multiple selector patterns for CarGurus (including dealership pages)
    const selectorPatterns = [
        'article[data-cg-ft="srp-listing-blade"]',  // Search results
        '[data-testid="listing-card"]',
        '.car-blade',
        'div[class*="listing-row"]',
        'div[class*="inventory"]',
        '.srp-listing-blade',
        '[data-listing-id]',
        'div[data-vehicle-id]',
        'article',  // Generic article tags
        'div[class*="vehicle-card"]',
        'div[class*="car-card"]'
    ];
    
    let listings = [];
    let usedSelector = '';
    
    for (const selector of selectorPatterns) {
        const found = document.querySelectorAll(selector);
        if (found.length > 0) {
            console.log(`CarGurus: Found ${found.length} elements with selector: ${selector}`);
            // Filter out elements that are too small (likely not vehicle cards)
            const filtered = Array.from(found).filter(el => {
                const text = el.textContent || '';
                return text.length > 50; // Vehicle cards should have substantial text
            });
            
            if (filtered.length > 0) {
                console.log(`CarGurus: After filtering, ${filtered.length} valid listings`);
                listings = filtered;
                usedSelector = selector;
                break;
            }
        }
    }
    
    if (listings.length === 0) {
        console.log('CarGurus: No listings found, trying to find ANY vehicle info on page');
        
        // Last resort: look for elements with price indicators
        const priceElements = document.querySelectorAll('*');
        Array.from(priceElements).forEach(el => {
            const text = el.textContent || '';
            if (text.match(/\$\d{2,3},\d{3}/) && text.length < 5000 && text.length > 100) {
                listings.push(el);
            }
        });
        console.log(`CarGurus: Found ${listings.length} elements with prices`);
    }
    
    if (listings.length === 0) {
        console.log('CarGurus: Still no listings, returning empty array');
        return [];
    }
    
    console.log(`CarGurus: Processing ${listings.length} listings...`);
    
    listings.forEach((listing, index) => {
        try {
            // Get all text content
            const allText = listing.textContent || '';
            console.log(`CarGurus listing ${index + 1} text length:`, allText.length);
            
            // Try multiple title selectors
            const titleSelectors = [
                'h2', 'h3', 'h4',
                '[class*="title"]',
                '[class*="model"]',
                '[class*="name"]',
                'a[class*="vehicle"]',
                '.make-model'
            ];
            
            let title = '';
            for (const sel of titleSelectors) {
                const el = listing.querySelector(sel);
                if (el && el.textContent.trim()) {
                    title = el.textContent.trim();
                    break;
                }
            }
            
            // If no title found, try to extract from text
            if (!title) {
                // Look for year make model pattern
                const titleMatch = allText.match(/(\d{4})\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)\s+([A-Za-z0-9\s]+)/);
                if (titleMatch) {
                    title = titleMatch[0];
                }
            }
            
            // Extract price - try multiple methods
            let price = '';
            const priceSelectors = [
                '[class*="price"]',
                '[data-price]',
                'span[class*="amount"]'
            ];
            
            for (const sel of priceSelectors) {
                const el = listing.querySelector(sel);
                if (el && el.textContent.includes('$')) {
                    price = el.textContent.trim();
                    break;
                }
            }
            
            // If no price element, search in text
            if (!price) {
                const priceMatch = allText.match(/\$[\d,]+/);
                price = priceMatch ? priceMatch[0] : '';
            }
            
            // Extract mileage
            let mileage = '';
            const mileageMatch = allText.match(/([\d,]+)\s*(mi|miles|km)/i);
            mileage = mileageMatch ? mileageMatch[1] + ' ' + mileageMatch[2] : '';
            
            // Extract year
            const year = extractYear(allText);
            
            // Get image
            const img = listing.querySelector('img');
            const image = img ? img.src : '';
            
            // Get link
            const link = listing.querySelector('a');
            const url = link ? link.href : window.location.href;
            
            const vehicle = {
                title: title,
                year: year,
                make: extractMake(allText),
                model: '',
                price: price,
                mileage: mileage,
                image: image,
                url: url,
                vin: extractVINFromListing(listing),
                dealer: '',
                fullText: allText.substring(0, 300),
                source: 'cargurus',
                scrapeMethod: usedSelector
            };
            
            console.log(`CarGurus listing ${index + 1}:`, {
                title: vehicle.title,
                price: vehicle.price,
                year: vehicle.year,
                textLength: allText.length
            });
            
            // Only add if we have at least title OR price OR year
            if (vehicle.title || vehicle.price || vehicle.year) {
                vehicles.push(vehicle);
            } else {
                console.log(`CarGurus listing ${index + 1}: SKIPPED (no data extracted)`);
            }
        } catch (error) {
            console.error(`Error scraping CarGurus listing ${index}:`, error);
        }
    });
    
    console.log(`CarGurus: Successfully scraped ${vehicles.length} vehicles with data`);
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
