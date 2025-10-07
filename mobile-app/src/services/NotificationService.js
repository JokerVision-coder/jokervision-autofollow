/**
 * Notification Service for JokerVision Mobile App
 * Handles push notifications and local notifications
 */

import PushNotification from 'react-native-push-notification';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert, Platform } from 'react-native';

class NotificationService {
  constructor() {
    this.isInitialized = false;
    this.configure();
  }

  configure() {
    PushNotification.configure({
      // Called when token is generated (iOS and Android)
      onRegister: (token) => {
        console.log('✅ Push notification token:', token);
        this.saveDeviceToken(token.token);
      },

      // Called when a remote notification is received while app is in foreground
      onNotification: (notification) => {
        console.log('📱 Notification received:', notification);
        
        // Handle notification tap
        if (notification.userInteraction) {
          this.handleNotificationTap(notification);
        }
        
        // Required on iOS only
        notification.finish(PushNotification.FetchResult.NoData);
      },

      // Called when a remote notification is received while app is in background
      onAction: (notification) => {
        console.log('📱 Notification action:', notification.action);
        console.log('📱 Notification:', notification);
      },

      // Called when the user fails to register for remote notifications
      onRegistrationError: (err) => {
        console.error('❌ Push notification registration error:', err.message);
      },

      // IOS ONLY (optional): default: all - Permissions to register.
      permissions: {
        alert: true,
        badge: true,
        sound: true,
      },

      // Should the initial notification be popped automatically
      popInitialNotification: true,

      // (optional) default: true
      requestPermissions: true,
    });

    // Create notification channels for Android
    this.createNotificationChannels();
  }

  async initialize() {
    try {
      console.log('🔔 Initializing Notification Service...');
      
      // Request permissions
      const hasPermissions = await this.requestPermissions();
      if (!hasPermissions) {
        console.log('⚠️ Notification permissions not granted');
      }

      // Load notification settings
      await this.loadNotificationSettings();

      this.isInitialized = true;
      console.log('✅ Notification Service initialized');
      return true;
      
    } catch (error) {
      console.error('❌ Notification Service initialization failed:', error);
      return false;
    }
  }

  createNotificationChannels() {
    if (Platform.OS === 'android') {
      PushNotification.createChannel(
        {
          channelId: 'jokervision-default',
          channelName: 'JokerVision Default',
          channelDescription: 'Default notifications for JokerVision AutoFollow',
          playSound: true,
          soundName: 'default',
          importance: 4,
          vibrate: true,
        },
        (created) => console.log(`Default channel created: ${created}`)
      );

      PushNotification.createChannel(
        {
          channelId: 'jokervision-voice-ai',
          channelName: 'Voice AI Alerts',
          channelDescription: 'Notifications for Voice AI activities',
          playSound: true,
          soundName: 'default',
          importance: 4,
          vibrate: true,
        },
        (created) => console.log(`Voice AI channel created: ${created}`)
      );

      PushNotification.createChannel(
        {
          channelId: 'jokervision-leads',
          channelName: 'Lead Notifications',
          channelDescription: 'New lead and lead activity notifications',
          playSound: true,
          soundName: 'default',
          importance: 4,
          vibrate: true,
        },
        (created) => console.log(`Leads channel created: ${created}`)
      );

      PushNotification.createChannel(
        {
          channelId: 'jokervision-inventory',
          channelName: 'Inventory Updates',
          channelDescription: 'Vehicle inventory and posting notifications',
          playSound: false,
          importance: 3,
          vibrate: false,
        },
        (created) => console.log(`Inventory channel created: ${created}`)
      );
    }
  }

  async requestPermissions() {
    try {
      if (Platform.OS === 'ios') {
        const permissions = await PushNotification.requestPermissions();
        return permissions.alert && permissions.badge && permissions.sound;
      }
      return true; // Android permissions are requested automatically
    } catch (error) {
      console.error('Failed to request notification permissions:', error);
      return false;
    }
  }

  async saveDeviceToken(token) {
    try {
      await AsyncStorage.setItem('deviceToken', token);
      
      // In a real app, send this token to your backend
      console.log('📤 Should send device token to backend:', token);
      
    } catch (error) {
      console.error('Failed to save device token:', error);
    }
  }

  async loadNotificationSettings() {
    try {
      const settings = await AsyncStorage.getItem('notificationSettings');
      if (settings) {
        this.settings = JSON.parse(settings);
      } else {
        // Default settings
        this.settings = {
          pushNotifications: true,
          voiceAI: true,
          newLeads: true,
          inventoryUpdates: true,
          appointments: true,
          systemAlerts: false,
        };
      }
      console.log('📋 Notification settings loaded:', this.settings);
    } catch (error) {
      console.error('Failed to load notification settings:', error);
    }
  }

  async updateNotificationSettings(newSettings) {
    try {
      this.settings = { ...this.settings, ...newSettings };
      await AsyncStorage.setItem('notificationSettings', JSON.stringify(this.settings));
      console.log('💾 Notification settings saved:', this.settings);
    } catch (error) {
      console.error('Failed to save notification settings:', error);
    }
  }

  // Local Notifications
  showLocalNotification(title, message, data = {}, channelId = 'jokervision-default') {
    if (!this.settings?.pushNotifications) {
      console.log('🔕 Push notifications disabled, skipping local notification');
      return;
    }

    PushNotification.localNotification({
      channelId,
      title,
      message,
      playSound: true,
      soundName: 'default',
      actions: ['View', 'Dismiss'],
      userInfo: data,
      largeIcon: 'ic_launcher',
      smallIcon: 'ic_notification',
    });
  }

  // Voice AI Notifications
  showVoiceAINotification(title, message, data = {}) {
    if (!this.settings?.voiceAI) {
      console.log('🔕 Voice AI notifications disabled');
      return;
    }

    this.showLocalNotification(
      title,
      message,
      { type: 'voice_ai', ...data },
      'jokervision-voice-ai'
    );
  }

  // Lead Notifications
  showNewLeadNotification(leadData) {
    if (!this.settings?.newLeads) {
      console.log('🔕 New lead notifications disabled');
      return;
    }

    this.showLocalNotification(
      '👥 New Lead Generated!',
      `${leadData.name} is interested in ${leadData.interestedVehicle || 'a vehicle'}`,
      { type: 'new_lead', leadId: leadData.id },
      'jokervision-leads'
    );
  }

  showLeadActivityNotification(title, message, leadData) {
    if (!this.settings?.newLeads) {
      console.log('🔕 Lead notifications disabled');
      return;
    }

    this.showLocalNotification(
      title,
      message,
      { type: 'lead_activity', leadId: leadData.id },
      'jokervision-leads'
    );
  }

  // Inventory Notifications
  showInventoryNotification(title, message, vehicleData = {}) {
    if (!this.settings?.inventoryUpdates) {
      console.log('🔕 Inventory notifications disabled');
      return;
    }

    this.showLocalNotification(
      title,
      message,
      { type: 'inventory', vehicleId: vehicleData.id },
      'jokervision-inventory'
    );
  }

  // Appointment Notifications
  showAppointmentNotification(title, message, appointmentData = {}) {
    if (!this.settings?.appointments) {
      console.log('🔕 Appointment notifications disabled');
      return;
    }

    this.showLocalNotification(
      title,
      message,
      { type: 'appointment', appointmentId: appointmentData.id },
      'jokervision-default'
    );
  }

  // Scheduled Notifications
  scheduleNotification(title, message, date, data = {}) {
    PushNotification.localNotificationSchedule({
      channelId: 'jokervision-default',
      title,
      message,
      date: new Date(date),
      playSound: true,
      soundName: 'default',
      userInfo: data,
    });
  }

  // Handle notification tap
  handleNotificationTap(notification) {
    console.log('👆 Notification tapped:', notification);
    
    const { type, leadId, vehicleId, appointmentId } = notification.data || notification.userInfo || {};
    
    // In a real app, you would navigate to specific screens based on notification type
    // For now, we'll just log the action
    switch (type) {
      case 'voice_ai':
        console.log('📱 Navigate to Voice AI screen');
        break;
      case 'new_lead':
      case 'lead_activity':
        console.log(`📱 Navigate to lead details: ${leadId}`);
        break;
      case 'inventory':
        console.log(`📱 Navigate to vehicle details: ${vehicleId}`);
        break;
      case 'appointment':
        console.log(`📱 Navigate to appointment details: ${appointmentId}`);
        break;
      default:
        console.log('📱 Navigate to dashboard');
    }
  }

  // Cancel all notifications
  cancelAllLocalNotifications() {
    PushNotification.cancelAllLocalNotifications();
    console.log('🗑️ All local notifications cancelled');
  }

  // Get badge count
  async getBadgeCount() {
    return new Promise((resolve) => {
      PushNotification.getApplicationIconBadgeNumber((count) => {
        resolve(count);
      });
    });
  }

  // Set badge count
  setBadgeCount(count) {
    PushNotification.setApplicationIconBadgeNumber(count);
  }

  // Clear badge
  clearBadge() {
    this.setBadgeCount(0);
  }

  // Convenience methods for common notifications
  notifyVoiceCallCompleted(callData) {
    this.showVoiceAINotification(
      '🎤 Voice AI Call Completed',
      `Successfully handled customer inquiry${callData.customerName ? ` from ${callData.customerName}` : ''}`,
      callData
    );
  }

  notifyNewLead(leadData) {
    this.showNewLeadNotification(leadData);
  }

  notifyVehiclePosted(vehicleData) {
    this.showInventoryNotification(
      '🚗 Vehicle Posted Successfully',
      `${vehicleData.year} ${vehicleData.make} ${vehicleData.model} posted to ${vehicleData.platformCount || 'multiple'} platforms`,
      vehicleData
    );
  }

  notifyTestDriveScheduled(appointmentData) {
    this.showAppointmentNotification(
      '📅 Test Drive Scheduled',
      `${appointmentData.customerName} - ${appointmentData.date} at ${appointmentData.time}`,
      appointmentData
    );
  }

  notifyLeadStatusChanged(leadData, newStatus) {
    this.showLeadActivityNotification(
      '📊 Lead Status Updated',
      `${leadData.name} status changed to ${newStatus}`,
      leadData
    );
  }

  // Check if notifications are enabled
  get notificationsEnabled() {
    return this.settings?.pushNotifications ?? true;
  }

  get initialized() {
    return this.isInitialized;
  }
}

// Create singleton instance
const notificationService = new NotificationService();

// Export service methods
export const setupPushNotifications = () => notificationService.initialize();
export const showLocalNotification = (title, message, data, channelId) => 
  notificationService.showLocalNotification(title, message, data, channelId);
export const showVoiceAINotification = (title, message, data) => 
  notificationService.showVoiceAINotification(title, message, data);
export const notifyNewLead = (leadData) => 
  notificationService.notifyNewLead(leadData);
export const notifyVoiceCallCompleted = (callData) => 
  notificationService.notifyVoiceCallCompleted(callData);
export const notifyVehiclePosted = (vehicleData) => 
  notificationService.notifyVehiclePosted(vehicleData);
export const notifyTestDriveScheduled = (appointmentData) => 
  notificationService.notifyTestDriveScheduled(appointmentData);
export const scheduleNotification = (title, message, date, data) => 
  notificationService.scheduleNotification(title, message, date, data);
export const cancelAllLocalNotifications = () => 
  notificationService.cancelAllLocalNotifications();
export const setBadgeCount = (count) => 
  notificationService.setBadgeCount(count);
export const clearBadge = () => 
  notificationService.clearBadge();

export default notificationService;