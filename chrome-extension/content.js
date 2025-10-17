// JokerVision AutoFollow - Facebook Marketplace Content Script
console.log('JokerVision AutoFollow Content Script Loaded');

// Configuration
const CONFIG = {
  scanInterval: 2000,
  maxRetries: 3,
  debugMode: true
};

// State tracking
let isMonitoring = false;
let uploadQueue = [];
let leadQueue = [];

// Vehicle data extraction from Facebook Marketplace listing page
function extractVehicleData() {
  try {
    const vehicleData = {
      // Basic listing information
      title: getTextContent('[data-testid="post-title"], h1, .x1heor9g .x1qlqyl8, .marketplace-listing-title'),
      price: getTextContent('[data-testid="marketplace-price"], .notranslate, .x193iq5w .x1xp8e9x, .marketplace-listing-price'),
      description: getTextContent('[data-testid="post-description"], .marketplace-listing-description, .x11i5rnm .xat24cr .x1mh8g0r'),
      location: getTextContent('[data-testid="location"], .marketplace-listing-location, .x1i10hfl .x1qjc9v5'),
      
      // Images
      images: extractImages(),
      
      // Vehicle-specific details
      year: extractYear(),
      make: extractMake(),
      model: extractModel(), 
      mileage: extractMileage(),
      vin: extractVIN(),
      condition: extractCondition(),
      transmission: extractTransmission(),
      fuelType: extractFuelType(),
      exteriorColor: extractColor('exterior'),
      interiorColor: extractColor('interior'),
      
      // Listing metadata
      postDate: getTextContent('.x4k7w5x .x1h91t0o .x1fcty0u, .marketplace-listing-date'),
      seller: extractSellerInfo(),
      listingUrl: window.location.href,
      facebookId: extractFacebookId(),
      
      // Contact information for lead capture
      sellerProfile: extractSellerProfile(),
      
      // Extracted timestamp
      extractedAt: new Date().toISOString(),
      source: 'facebook_marketplace'
    };

    // Clean and validate data
    return cleanVehicleData(vehicleData);
    
  } catch (error) {
    console.error('Error extracting vehicle data:', error);
    return null;
  }
}

// Enhanced text extraction with multiple selectors
function getTextContent(selectors) {
  const selectorArray = selectors.split(', ');
  
  for (const selector of selectorArray) {
    const element = document.querySelector(selector);
    if (element && element.textContent.trim()) {
      return element.textContent.trim();
    }
  }
  
  return '';
}

// Extract images from listing
function extractImages() {
  const images = [];
  const imageSelectors = [
    'img[src*="scontent"]',
    '.marketplace-listing-photo img',
    '[data-testid="media-viewer"] img',
    '.x1ey2m1c img',
    '.x6s0dn4 img'
  ];
  
  imageSelectors.forEach(selector => {
    document.querySelectorAll(selector).forEach(img => {
      if (img.src && img.src.includes('scontent') && !images.includes(img.src)) {
        images.push(img.src);
      }
    });
  });
  
  return images.slice(0, 10); // Limit to 10 images
}

// Extract vehicle year
function extractYear() {
  const title = getTextContent('[data-testid="post-title"], h1');
  const description = getTextContent('[data-testid="post-description"]');
  const combined = `${title} ${description}`;
  
  // Look for 4-digit year (1990-2025)
  const yearMatch = combined.match(/(19|20)\d{2}/g);
  if (yearMatch) {
    // Return the most recent valid year found
    const years = yearMatch.map(y => parseInt(y)).filter(y => y >= 1990 && y <= 2025);
    return Math.max(...years).toString();
  }
  
  return '';
}

// Extract make and model using common car brands
function extractMake() {
  const title = getTextContent('[data-testid="post-title"], h1').toLowerCase();
  const description = getTextContent('[data-testid="post-description"]').toLowerCase();
  const combined = `${title} ${description}`;
  
  const carMakes = [
    'toyota', 'honda', 'ford', 'chevrolet', 'chevy', 'nissan', 'hyundai', 
    'kia', 'bmw', 'mercedes', 'benz', 'audi', 'volkswagen', 'vw', 'mazda',
    'subaru', 'jeep', 'ram', 'dodge', 'chrysler', 'buick', 'gmc', 'cadillac',
    'lincoln', 'acura', 'infiniti', 'lexus', 'volvo', 'jaguar', 'land rover',
    'porsche', 'tesla', 'mini', 'fiat', 'alfa romeo', 'mitsubishi'
  ];
  
  for (const make of carMakes) {
    if (combined.includes(make)) {
      return make.charAt(0).toUpperCase() + make.slice(1);
    }
  }
  
  return '';
}

// Extract model (simplified approach)
function extractModel() {
  const title = getTextContent('[data-testid="post-title"], h1');
  const words = title.split(' ');
  
  // Look for model after make
  const make = extractMake().toLowerCase();
  const makeIndex = words.findIndex(word => word.toLowerCase() === make);
  
  if (makeIndex !== -1 && makeIndex + 1 < words.length) {
    return words[makeIndex + 1];
  }
  
  return '';
}

// Extract mileage
function extractMileage() {
  const description = getTextContent('[data-testid="post-description"]');
  const mileageMatch = description.match(/(\d{1,3}(?:,\d{3})*)\s*(miles?|mi|k|km)/i);
  
  if (mileageMatch) {
    return mileageMatch[1].replace(/,/g, '');
  }
  
  return '';
}

// Extract VIN
function extractVIN() {
  const description = getTextContent('[data-testid="post-description"]');
  const vinMatch = description.match(/\b[A-HJ-NPR-Z0-9]{17}\b/i);
  
  return vinMatch ? vinMatch[0] : '';
}

// Extract condition
function extractCondition() {
  const description = getTextContent('[data-testid="post-description"]').toLowerCase();
  const conditions = ['excellent', 'good', 'fair', 'poor', 'new', 'used', 'certified'];
  
  for (const condition of conditions) {
    if (description.includes(condition)) {
      return condition;
    }
  }
  
  return 'used';
}

// Extract transmission
function extractTransmission() {
  const description = getTextContent('[data-testid="post-description"]').toLowerCase();
  
  if (description.includes('manual') || description.includes('stick')) {
    return 'manual';
  } else if (description.includes('automatic') || description.includes('auto')) {
    return 'automatic';
  }
  
  return '';
}

// Extract fuel type
function extractFuelType() {
  const description = getTextContent('[data-testid="post-description"]').toLowerCase();
  
  if (description.includes('electric') || description.includes('ev')) {
    return 'electric';
  } else if (description.includes('hybrid')) {
    return 'hybrid';
  } else if (description.includes('diesel')) {
    return 'diesel';
  } else if (description.includes('gas') || description.includes('gasoline')) {
    return 'gasoline';
  }
  
  return 'gasoline';
}

// Extract color
function extractColor(type) {
  const description = getTextContent('[data-testid="post-description"]').toLowerCase();
  const colors = ['black', 'white', 'silver', 'gray', 'red', 'blue', 'green', 'brown', 'yellow', 'orange', 'purple'];
  
  for (const color of colors) {
    if (description.includes(`${type} ${color}`) || description.includes(`${color} ${type}`)) {
      return color;
    }
  }
  
  // Fallback: just look for color names
  for (const color of colors) {
    if (description.includes(color)) {
      return color;
    }
  }
  
  return '';
}

// Extract Facebook listing ID
function extractFacebookId() {
  const url = window.location.href;
  const idMatch = url.match(/item\/(\d+)/);
  
  return idMatch ? idMatch[1] : '';
}

// Extract seller information
function extractSellerInfo() {
  return {
    name: getTextContent('.marketplace-listing-seller-name, .x1i10hfl .x1qjc9v5 .x6s0dn4'),
    profileUrl: document.querySelector('.marketplace-listing-seller-link, a[href*="/profile/"]')?.href || '',
    rating: getTextContent('.marketplace-seller-rating'),
    responseTime: getTextContent('.marketplace-response-time')
  };
}

// Extract seller profile for lead capture
function extractSellerProfile() {
  const profileLinks = document.querySelectorAll('a[href*="/profile/"], a[href*="/people/"]');
  const messageButtons = document.querySelectorAll('button[aria-label*="Message"], [data-testid*="message"]');
  
  return {
    profileLinks: Array.from(profileLinks).map(link => link.href),
    hasMessageButton: messageButtons.length > 0,
    canContact: true
  };
}

// Clean and validate extracted data
function cleanVehicleData(data) {
  // Remove empty fields
  Object.keys(data).forEach(key => {
    if (data[key] === '' || data[key] === null || data[key] === undefined) {
      delete data[key];
    }
  });
  
  // Validate required fields
  if (!data.title || !data.price) {
    return null;
  }
  
  // Clean price (remove currency symbols, commas)
  if (data.price) {
    data.price = data.price.replace(/[$,]/g, '');
  }
  
  return data;
}

// Scan entire Facebook Marketplace for inventory
function scanMarketplaceInventory() {
  const vehicles = [];
  const listingSelectors = [
    '[data-testid="marketplace-listing"], .marketplace-listing-item',
    '.x9f619 .x78zum5 .x1q0g3np .x2lah0s',
    '.x1i10hfl .xjbqb8w .x6umtig .x1b1mbwd'
  ];
  
  listingSelectors.forEach(selector => {
    document.querySelectorAll(selector).forEach(listing => {
      // Extract basic info from listing preview
      const vehiclePreview = {
        title: listing.querySelector('span, .x1lliihq, .marketplace-listing-title')?.textContent?.trim(),
        price: listing.querySelector('.x193iq5w, .marketplace-listing-price')?.textContent?.trim(),
        location: listing.querySelector('.x1i10hfl .x1qjc9v5, .marketplace-listing-location')?.textContent?.trim(),
        image: listing.querySelector('img')?.src,
        url: listing.querySelector('a')?.href,
        listingId: listing.querySelector('a')?.href?.match(/item\/(\d+)/)?.[1]
      };
      
      if (vehiclePreview.title && vehiclePreview.price) {
        vehicles.push(vehiclePreview);
      }
    });
  });
  
  return vehicles;
}

// Monitor for lead activity (messages, inquiries)
function monitorLeadActivity() {
  if (isMonitoring) return;
  
  isMonitoring = true;
  console.log('Starting lead monitoring...');
  
  // Watch for message threads
  const messageObserver = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => {
        if (node.nodeType === 1 && node.textContent) {
          // Check if it's a potential lead inquiry
          if (isLeadInquiry(node.textContent)) {
            captureLead(node);
          }
        }
      });
    });
  });
  
  // Start observing
  messageObserver.observe(document.body, {
    childList: true,
    subtree: true
  });
  
  // Also check for existing messages
  document.querySelectorAll('[data-testid="message"], .message-item').forEach(msg => {
    if (isLeadInquiry(msg.textContent)) {
      captureLead(msg);
    }
  });
}

// Check if message content indicates a lead inquiry
function isLeadInquiry(text) {
  const leadKeywords = [
    'interested', 'available', 'test drive', 'see the car', 'price', 'financing',
    'trade', 'negotiate', 'cash', 'payment', 'warranty', 'history', 'accident',
    'miles', 'condition', 'inspection', 'appointment', 'schedule', 'visit'
  ];
  
  const lowerText = text.toLowerCase();
  return leadKeywords.some(keyword => lowerText.includes(keyword));
}

// Capture lead from message
function captureLead(messageElement) {
  const leadData = {
    message: messageElement.textContent.trim(),
    timestamp: new Date().toISOString(),
    source: 'facebook_marketplace_message',
    
    // Extract sender info if available
    sender: {
      name: messageElement.querySelector('.message-sender-name')?.textContent || '',
      profileUrl: messageElement.querySelector('a[href*="/profile/"]')?.href || ''
    },
    
    // Vehicle context if on listing page
    vehicleContext: window.location.href.includes('/item/') ? extractVehicleData() : null,
    
    // Page context
    pageUrl: window.location.href,
    listingId: extractFacebookId()
  };
  
  // Send to background script
  chrome.runtime.sendMessage({
    action: 'capturedLead',
    data: leadData
  }, (response) => {
    if (response && response.success) {
      console.log('Lead captured successfully:', response.leadId);
      
      // Show inline notification
      showInlineNotification('Lead captured! Auto-response sent.', 'success');
      
      // Suggest appointment booking if enabled
      if (response.appointmentSuggestions) {
        showAppointmentSuggestion(response.appointmentSuggestions[0]);
      }
    }
  });
}

// Show inline notification on Facebook page
function showInlineNotification(message, type = 'info') {
  const notification = document.createElement('div');
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 12px 20px;
    background: ${type === 'success' ? '#28a745' : type === 'error' ? '#dc3545' : '#007bff'};
    color: white;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    z-index: 10000;
    font-family: -apple-system, BlinkMacSystemFont, sans-serif;
    font-size: 14px;
    font-weight: 500;
    max-width: 300px;
    word-wrap: break-word;
  `;
  notification.textContent = message;
  
  document.body.appendChild(notification);
  
  // Remove after 5 seconds
  setTimeout(() => {
    if (notification.parentNode) {
      notification.parentNode.removeChild(notification);
    }
  }, 5000);
}

// Show appointment suggestion popup
function showAppointmentSuggestion(suggestion) {
  const popup = document.createElement('div');
  popup.style.cssText = `
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: white;
    padding: 20px;
    border-radius: 12px;
    box-shadow: 0 10px 30px rgba(0,0,0,0.3);
    z-index: 10001;
    max-width: 400px;
    font-family: -apple-system, BlinkMacSystemFont, sans-serif;
  `;
  
  popup.innerHTML = `
    <h3 style="margin: 0 0 15px 0; color: #333;">Schedule Test Drive?</h3>
    <p style="margin: 0 0 20px 0; color: #666; line-height: 1.4;">
      Available: ${suggestion.date} at ${suggestion.time}<br>
      Vehicle: ${suggestion.vehicle || 'Selected vehicle'}
    </p>
    <div style="display: flex; gap: 10px;">
      <button id="scheduleNow" style="flex: 1; padding: 10px; background: #007bff; color: white; border: none; border-radius: 6px; cursor: pointer;">
        Schedule Now
      </button>
      <button id="scheduleLater" style="flex: 1; padding: 10px; background: #6c757d; color: white; border: none; border-radius: 6px; cursor: pointer;">
        Later
      </button>
    </div>
  `;
  
  document.body.appendChild(popup);
  
  // Add event listeners
  popup.querySelector('#scheduleNow').addEventListener('click', () => {
    chrome.runtime.sendMessage({
      action: 'scheduleAppointment',
      data: {
        ...suggestion,
        source: 'facebook_marketplace_auto'
      }
    });
    document.body.removeChild(popup);
  });
  
  popup.querySelector('#scheduleLater').addEventListener('click', () => {
    document.body.removeChild(popup);
  });
  
  // Auto-remove after 15 seconds
  setTimeout(() => {
    if (popup.parentNode) {
      popup.parentNode.removeChild(popup);
    }
  }, 15000);
}

// Add JokerVision enhancement buttons to Facebook Marketplace
function enhanceFacebookMarketplace() {
  // Only run on marketplace pages
  if (!window.location.href.includes('facebook.com/marketplace')) {
    return;
  }
  
  // Add floating action button
  const fab = document.createElement('div');
  fab.style.cssText = `
    position: fixed;
    bottom: 30px;
    right: 30px;
    width: 60px;
    height: 60px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border-radius: 50%;
    box-shadow: 0 4px 20px rgba(102, 126, 234, 0.4);
    cursor: pointer;
    z-index: 9999;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-weight: bold;
    font-size: 24px;
    transition: transform 0.3s;
  `;
  fab.innerHTML = 'JV';
  fab.title = 'JokerVision AutoFollow Tools';
  
  fab.addEventListener('click', showJokerVisionMenu);
  fab.addEventListener('mouseenter', () => fab.style.transform = 'scale(1.1)');
  fab.addEventListener('mouseleave', () => fab.style.transform = 'scale(1)');
  
  document.body.appendChild(fab);
}

// Show JokerVision tools menu
function showJokerVisionMenu() {
  const menu = document.createElement('div');
  menu.style.cssText = `
    position: fixed;
    bottom: 100px;
    right: 30px;
    background: white;
    border-radius: 12px;
    box-shadow: 0 10px 30px rgba(0,0,0,0.2);
    padding: 20px;
    z-index: 10000;
    min-width: 250px;
  `;
  
  menu.innerHTML = `
    <h3 style="margin: 0 0 15px 0; color: #333;">JokerVision Tools</h3>
    <div id="jvMenuButtons" style="display: flex; flex-direction: column; gap: 10px;">
      <button class="jv-menu-btn" data-action="scanInventory">Scan All Inventory</button>
      <button class="jv-menu-btn" data-action="uploadCurrent">Upload Current Listing</button>
      <button class="jv-menu-btn" data-action="startMonitoring">Start Lead Monitoring</button>
      <button class="jv-menu-btn" data-action="openDashboard">Open Dashboard</button>
    </div>
    <button id="closeMenu" style="position: absolute; top: 10px; right: 15px; background: none; border: none; font-size: 18px; cursor: pointer;">×</button>
  `;
  
  document.body.appendChild(menu);
  
  // Add button styles
  menu.querySelectorAll('.jv-menu-btn').forEach(btn => {
    btn.style.cssText = `
      padding: 12px 16px;
      background: #f8f9fa;
      border: 1px solid #dee2e6;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.3s;
      text-align: left;
      color: #212529;
      font-size: 14px;
      font-weight: 500;
    `;
    
    btn.addEventListener('mouseenter', () => {
      btn.style.background = '#667eea';
      btn.style.color = 'white';
      btn.style.borderColor = '#667eea';
    });
    btn.addEventListener('mouseleave', () => {
      btn.style.background = '#f8f9fa';
      btn.style.color = '#212529';
      btn.style.borderColor = '#dee2e6';
    });
  });
  
  // Add event listeners
  menu.addEventListener('click', (e) => {
    const action = e.target.dataset.action;
    
    switch (action) {
      case 'scanInventory':
        handleScanInventory();
        break;
      case 'uploadCurrent':
        handleUploadCurrent();
        break;
      case 'startMonitoring':
        monitorLeadActivity();
        showInlineNotification('Lead monitoring started!', 'success');
        break;
      case 'openDashboard':
        chrome.runtime.sendMessage({action: 'openDashboard'});
        break;
    }
    
    document.body.removeChild(menu);
  });
  
  menu.querySelector('#closeMenu').addEventListener('click', () => {
    document.body.removeChild(menu);
  });
}

// Handle inventory scanning
function handleScanInventory() {
  showInlineNotification('Scanning inventory...', 'info');
  
  const vehicles = scanMarketplaceInventory();
  
  if (vehicles.length > 0) {
    chrome.runtime.sendMessage({
      action: 'uploadVehicleData',
      data: {
        type: 'bulk_scan',
        vehicles: vehicles,
        scanDate: new Date().toISOString()
      }
    }, (response) => {
      if (response && response.success) {
        showInlineNotification(`${vehicles.length} vehicles scanned and uploaded!`, 'success');
      } else {
        showInlineNotification('Scan failed. Please try again.', 'error');
      }
    });
  } else {
    showInlineNotification('No vehicles found to scan.', 'error');
  }
}

// Handle current listing upload
function handleUploadCurrent() {
  showInlineNotification('Extracting vehicle data...', 'info');
  
  const vehicleData = extractVehicleData();
  
  if (vehicleData) {
    chrome.runtime.sendMessage({
      action: 'uploadVehicleData',
      data: vehicleData
    }, (response) => {
      if (response && response.success) {
        showInlineNotification('Vehicle uploaded successfully!', 'success');
      } else {
        showInlineNotification('Upload failed. Please try again.', 'error');
      }
    });
  } else {
    showInlineNotification('Could not extract vehicle data.', 'error');
  }
}

// Listen for messages from background script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  switch (request.action) {
    case 'extractVehicleData':
      const vehicleData = extractVehicleData();
      sendResponse(vehicleData);
      break;
      
    case 'scanAndUploadInventory':
      handleScanInventory();
      sendResponse({success: true});
      break;
      
    case 'monitorLeadActivity':
      monitorLeadActivity();
      sendResponse({success: true});
      break;
      
    case 'enhancePage':
      enhanceFacebookMarketplace();
      sendResponse({success: true});
      break;
  }
});

// Initialize when page loads
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', enhanceFacebookMarketplace);
} else {
  enhanceFacebookMarketplace();
}

// Re-enhance when navigating within Facebook (SPA)
let currentUrl = window.location.href;
setInterval(() => {
  if (window.location.href !== currentUrl) {
    currentUrl = window.location.href;
    setTimeout(enhanceFacebookMarketplace, 1000); // Delay for page load
  }
}, 1000);