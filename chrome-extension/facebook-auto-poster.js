// JokerVision - Facebook Marketplace Auto-Poster
// Automatically fills and posts vehicle listings to Facebook Marketplace

console.log('🚗 JokerVision FB Marketplace Auto-Poster loaded');

// Listen for auto-post commands
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'autoPostToFacebook') {
        console.log('📤 Starting auto-post to Facebook Marketplace');
        autoPostVehicle(request.vehicleData)
            .then(result => sendResponse(result))
            .catch(error => sendResponse({ success: false, error: error.message }));
        return true; // Keep channel open for async response
    }
});

// Main function to auto-post vehicle to Facebook Marketplace
async function autoPostVehicle(vehicle) {
    try {
        console.log('🚀 Auto-posting vehicle:', vehicle);
        
        // Step 1: Navigate to create listing page if not already there
        if (!window.location.href.includes('marketplace/create')) {
            console.log('📍 Navigating to create listing page...');
            window.location.href = 'https://www.facebook.com/marketplace/create/vehicle';
            
            // Wait for page load
            await waitForPageLoad();
        }
        
        // Step 2: Wait for form to be ready
        console.log('⏳ Waiting for form...');
        await waitForElement('[data-testid="marketplace-composer-title-input"], input[placeholder*="Title"], input[name="title"]');
        
        // Step 3: Fill in all fields
        console.log('✏️ Filling form fields...');
        await fillMarketplaceForm(vehicle);
        
        // Step 4: Upload photos
        if (vehicle.images && vehicle.images.length > 0) {
            console.log('📷 Uploading photos...');
            await uploadPhotos(vehicle.images);
        }
        
        // Step 5: Click publish button
        console.log('🎉 Publishing listing...');
        await clickPublishButton();
        
        console.log('✅ Vehicle posted successfully!');
        return { success: true, message: 'Vehicle posted to Facebook Marketplace' };
        
    } catch (error) {
        console.error('❌ Auto-post error:', error);
        return { success: false, error: error.message };
    }
}

// Fill all form fields
async function fillMarketplaceForm(vehicle) {
    // Title
    await fillField([
        '[data-testid="marketplace-composer-title-input"]',
        'input[placeholder*="Title"]',
        'input[name="title"]'
    ], vehicle.title || `${vehicle.year} ${vehicle.make} ${vehicle.model}`);
    
    // Price
    await fillField([
        '[data-testid="marketplace-composer-price-input"]',
        'input[placeholder*="Price"]',
        'input[name="price"]'
    ], vehicle.price?.replace(/[^0-9]/g, '') || '');
    
    // Category - Select "Vehicles"
    await selectCategory('Vehicles');
    
    // Condition - Select "Used" or "New"
    await selectCondition(vehicle.condition || 'Used');
    
    // Year
    await fillField([
        'input[placeholder*="Year"]',
        'input[name="year"]'
    ], vehicle.year || '');
    
    // Make
    await fillField([
        'input[placeholder*="Make"]',
        'input[name="make"]'
    ], vehicle.make || '');
    
    // Model
    await fillField([
        'input[placeholder*="Model"]',
        'input[name="model"]'
    ], vehicle.model || '');
    
    // Mileage
    await fillField([
        'input[placeholder*="Mileage"]',
        'input[name="mileage"]'
    ], vehicle.mileage?.replace(/[^0-9]/g, '') || '');
    
    // VIN (if available)
    if (vehicle.vin) {
        await fillField([
            'input[placeholder*="VIN"]',
            'input[name="vin"]'
        ], vehicle.vin);
    }
    
    // Description
    await fillField([
        '[data-testid="marketplace-composer-description-input"]',
        'textarea[placeholder*="Description"]',
        'textarea[name="description"]'
    ], vehicle.description || generateDescription(vehicle));
    
    // Location - usually auto-filled
    await fillField([
        'input[placeholder*="Location"]',
        'input[name="location"]'
    ], vehicle.location || '');
    
    console.log('✅ All fields filled');
}

// Generate description if not provided
function generateDescription(vehicle) {
    return `
${vehicle.year} ${vehicle.make} ${vehicle.model}

🚗 Mileage: ${vehicle.mileage || 'Contact for details'}
💰 Price: ${vehicle.price}
${vehicle.vin ? `🔑 VIN: ${vehicle.vin}` : ''}

${vehicle.transmission ? `⚙️ Transmission: ${vehicle.transmission}` : ''}
${vehicle.fuelType ? `⛽ Fuel Type: ${vehicle.fuelType}` : ''}
${vehicle.exteriorColor ? `🎨 Exterior: ${vehicle.exteriorColor}` : ''}
${vehicle.interiorColor ? `🪑 Interior: ${vehicle.interiorColor}` : ''}

Contact us today for more information!

${vehicle.fullText || ''}
    `.trim();
}

// Helper: Fill a form field by trying multiple selectors
async function fillField(selectors, value) {
    if (!value) return;
    
    for (const selector of selectors) {
        const field = document.querySelector(selector);
        if (field) {
            // Clear existing value
            field.value = '';
            field.focus();
            
            // Type value character by character (more natural)
            for (const char of value.toString()) {
                field.value += char;
                field.dispatchEvent(new Event('input', { bubbles: true }));
                await sleep(10); // Small delay between characters
            }
            
            field.dispatchEvent(new Event('change', { bubbles: true }));
            field.blur();
            
            console.log(`✓ Filled ${selector}: ${value}`);
            return;
        }
    }
    
    console.warn(`⚠️ Field not found for selectors:`, selectors);
}

// Helper: Select from dropdown
async function selectDropdown(selectors, value) {
    for (const selector of selectors) {
        const dropdown = document.querySelector(selector);
        if (dropdown) {
            dropdown.value = value;
            dropdown.dispatchEvent(new Event('change', { bubbles: true }));
            console.log(`✓ Selected ${selector}: ${value}`);
            return;
        }
    }
}

// Select category
async function selectCategory(category) {
    // Click category selector
    const categoryBtn = document.querySelector('[aria-label*="Category"]');
    if (categoryBtn) {
        categoryBtn.click();
        await sleep(500);
        
        // Find and click "Vehicles" option
        const options = document.querySelectorAll('[role="option"]');
        for (const option of options) {
            if (option.textContent.includes(category)) {
                option.click();
                await sleep(300);
                console.log('✓ Category selected:', category);
                return;
            }
        }
    }
}

// Select condition
async function selectCondition(condition) {
    const conditionBtn = document.querySelector('[aria-label*="Condition"]');
    if (conditionBtn) {
        conditionBtn.click();
        await sleep(500);
        
        const options = document.querySelectorAll('[role="option"]');
        for (const option of options) {
            if (option.textContent.toLowerCase().includes(condition.toLowerCase())) {
                option.click();
                await sleep(300);
                console.log('✓ Condition selected:', condition);
                return;
            }
        }
    }
}

// Upload photos
async function uploadPhotos(imageUrls) {
    try {
        // Find file input
        const fileInput = document.querySelector('input[type="file"][accept*="image"]');
        if (!fileInput) {
            console.warn('⚠️ Photo upload input not found');
            return;
        }
        
        // Download images and convert to files
        const files = [];
        for (let i = 0; i < Math.min(imageUrls.length, 10); i++) {
            try {
                const imageUrl = imageUrls[i];
                const response = await fetch(imageUrl);
                const blob = await response.blob();
                const file = new File([blob], `vehicle_${i}.jpg`, { type: 'image/jpeg' });
                files.push(file);
            } catch (error) {
                console.warn(`⚠️ Failed to download image ${i}:`, error);
            }
        }
        
        if (files.length > 0) {
            // Create FileList
            const dataTransfer = new DataTransfer();
            files.forEach(file => dataTransfer.items.add(file));
            fileInput.files = dataTransfer.files;
            
            // Trigger change event
            fileInput.dispatchEvent(new Event('change', { bubbles: true }));
            
            console.log(`✓ Uploaded ${files.length} photos`);
            
            // Wait for uploads to process
            await sleep(2000 * files.length);
        }
    } catch (error) {
        console.error('❌ Photo upload error:', error);
    }
}

// Click publish button
async function clickPublishButton() {
    const publishSelectors = [
        'button[aria-label*="Publish"]',
        'button[aria-label*="Post"]',
        'div[aria-label*="Publish"]',
        'div[aria-label*="Post"]',
        'button:has-text("Publish")',
        'button:has-text("Post")'
    ];
    
    for (const selector of publishSelectors) {
        const buttons = document.querySelectorAll(selector);
        for (const button of buttons) {
            if (button.textContent.includes('Publish') || 
                button.textContent.includes('Post') ||
                button.getAttribute('aria-label')?.includes('Publish')) {
                
                button.click();
                console.log('✓ Publish button clicked');
                
                // Wait for posting to complete
                await sleep(3000);
                return;
            }
        }
    }
    
    console.warn('⚠️ Publish button not found');
}

// Helper: Wait for element to appear
function waitForElement(selector, timeout = 10000) {
    return new Promise((resolve, reject) => {
        if (document.querySelector(selector)) {
            return resolve(document.querySelector(selector));
        }
        
        const observer = new MutationObserver(() => {
            if (document.querySelector(selector)) {
                observer.disconnect();
                resolve(document.querySelector(selector));
            }
        });
        
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
        
        setTimeout(() => {
            observer.disconnect();
            reject(new Error(`Element ${selector} not found after ${timeout}ms`));
        }, timeout);
    });
}

// Helper: Wait for page load
function waitForPageLoad() {
    return new Promise(resolve => {
        if (document.readyState === 'complete') {
            resolve();
        } else {
            window.addEventListener('load', resolve);
        }
    });
}

// Helper: Sleep
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

console.log('✅ JokerVision FB Marketplace Auto-Poster ready');
