/**
 * Services Index File  
 * Exports all service modules for easy importing
 */

export { default as ApiService } from './ApiService';
export { default as VoiceAIService } from './VoiceAIService';  
export { default as NotificationService } from './NotificationService';
export { default as ExclusiveLeadsService } from './ExclusiveLeadsService';

// Export service functions
export { 
  connectToBackend,
  getDashboardStats,
  getRecentActivity,
  getInventory,
  getLeads,
  addVehicle,
  addLead
} from './ApiService';

export {
  initializeVoiceAI,
  startVoiceCall,
  endVoiceCall
} from './VoiceAIService';

export {
  setupPushNotifications,
  sendLocalNotification,
  clearAllNotifications
} from './NotificationService';

export {
  getExclusiveLeads,
  claimExclusiveLead,
  activateLeadProtection,
  getLeadIntelligence,
  getRealTimeAlerts
} from './ExclusiveLeadsService';