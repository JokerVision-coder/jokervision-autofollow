/**
 * Utils Index File
 * Exports all utility functions for easy importing
 */

export * from './formatters';
export * from './deviceUtils';

// Re-export commonly used functions
export {
  formatCurrency,
  formatTimeAgo,
  formatPhone,
  formatDate,
  validateEmail,
  validatePhone
} from './formatters';

export {
  DEVICE_INFO,
  makePhoneCall,
  sendSMS,
  openEmail,
  requestMicrophonePermission,
  requestPhonePermission,
  hapticFeedback,
  copyToClipboard,
  isNetworkConnected
} from './deviceUtils';