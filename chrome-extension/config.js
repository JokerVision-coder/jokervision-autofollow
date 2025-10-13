/**
 * Chrome Extension Configuration
 * Update this file for different deployment environments
 */

// Configuration for different environments
const ENVIRONMENTS = {
  development: {
    apiBaseUrl: 'https://autoleads-engine.preview.emergentagent.com/api',
    websiteUrl: 'https://autoleads-engine.preview.emergentagent.com'
  },
  staging: {
    apiBaseUrl: 'https://autoleads-engine.preview.emergentagent.com/api',
    websiteUrl: 'https://autoleads-engine.preview.emergentagent.com'
  },
  production: {
    apiBaseUrl: 'https://jokervision.emergent.host/api',
    websiteUrl: 'https://jokervision.emergent.host'
  }
};

// Detect environment or use override
const CURRENT_ENVIRONMENT = window.location.hostname.includes('jokervision.emergent.host') 
  ? 'production' 
  : window.location.hostname.includes('staging')
  ? 'staging'
  : 'development';

// Export configuration
window.JokerVisionConfig = ENVIRONMENTS[CURRENT_ENVIRONMENT];

// For use in modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ENVIRONMENTS[CURRENT_ENVIRONMENT];
}