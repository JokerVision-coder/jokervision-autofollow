/**
 * Chrome Extension Configuration
 * Update this file for different deployment environments
 */

// Configuration for different environments
const ENVIRONMENTS = {
  development: {
    apiBaseUrl: 'https://dealergenius.preview.emergentagent.com/api',
    websiteUrl: 'https://dealergenius.preview.emergentagent.com'
  },
  staging: {
    apiBaseUrl: 'https://dealergenius-staging.preview.emergentagent.com/api',
    websiteUrl: 'https://dealergenius-staging.preview.emergentagent.com'
  },
  production: {
    apiBaseUrl: 'https://jokervision.emergent.host/api',
    websiteUrl: 'https://jokervision.emergent.host'
  }
};

// Set current environment
const CURRENT_ENVIRONMENT = 'development'; // Change this for different deployments

// Export configuration
window.JokerVisionConfig = ENVIRONMENTS[CURRENT_ENVIRONMENT];

// For use in modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ENVIRONMENTS[CURRENT_ENVIRONMENT];
}