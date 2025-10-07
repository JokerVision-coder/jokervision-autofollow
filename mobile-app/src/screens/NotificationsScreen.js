import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
  Switch,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { getNotifications, markNotificationRead } from '../services/ApiService';

const NotificationsScreen = ({ navigation }) => {
  const [notifications, setNotifications] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState({
    pushNotifications: true,
    voiceAI: true,
    newLeads: true,
    inventoryUpdates: true,
    appointments: true,
    systemAlerts: false,
  });

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const data = await getNotifications();
      setNotifications(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to load notifications:', error);
      Alert.alert('Error', 'Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadNotifications();
    setRefreshing(false);
  };

  const handleNotificationPress = async (notification) => {
    try {
      if (!notification.read) {
        await markNotificationRead(notification.id);
        // Update local state
        setNotifications(prev => 
          prev.map(n => 
            n.id === notification.id ? { ...n, read: true } : n
          )
        );
      }

      // Handle notification action based on type
      switch (notification.type) {
        case 'new_lead':
          navigation.navigate('Leads');
          break;
        case 'voice_call':
          navigation.navigate('VoiceAI');
          break;
        case 'inventory':
          navigation.navigate('Inventory');
          break;
        case 'appointment':
          // Navigate to calendar/appointments (if implemented)
          Alert.alert('Navigation', 'Calendar feature coming soon!');
          break;
        default:
          // Show notification details
          Alert.alert(
            notification.title,
            notification.message,
            [{ text: 'OK' }]
          );
      }
    } catch (error) {
      console.error('Error handling notification:', error);
    }
  };

  const clearAllNotifications = () => {
    Alert.alert(
      'Clear All Notifications',
      'Are you sure you want to mark all notifications as read?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: () => {
            setNotifications(prev => 
              prev.map(n => ({ ...n, read: true }))
            );
          }
        },
      ]
    );
  };

  const updateSetting = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    // In a real app, this would sync with backend
    console.log(`Updated ${key} to ${value}`);
  };

  const unreadCount = notifications.filter(n => !n.read).length;
  const groupedNotifications = groupNotificationsByDate(notifications);

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#1a1a2e', '#16213e', '#0f3460']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.headerTitle}>🔔 Smart Notifications</Text>
            <Text style={styles.headerSubtitle}>
              {unreadCount} unread • Real-time business alerts
            </Text>
          </View>
          
          {unreadCount > 0 && (
            <TouchableOpacity
              style={styles.clearButton}
              onPress={clearAllNotifications}
            >
              <Text style={styles.clearButtonText}>Clear All</Text>
            </TouchableOpacity>
          )}
        </View>
      </LinearGradient>

      <ScrollView 
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Notification Stats */}
        <View style={styles.statsContainer}>
          <StatCard
            title="Unread"
            value={unreadCount}
            icon="notifications"
            gradient={['#e94560', '#f5af19']}
          />
          <StatCard
            title="Today"
            value={getTodayNotificationsCount(notifications)}
            icon="today"
            gradient={['#11998e', '#38ef7d']}
          />
          <StatCard
            title="Voice AI"
            value={getNotificationsByType(notifications, 'voice_call').length}
            icon="mic"
            gradient={['#667eea', '#764ba2']}
          />
          <StatCard
            title="New Leads"
            value={getNotificationsByType(notifications, 'new_lead').length}
            icon="people"
            gradient={['#ffecd2', '#fcb69f']}
          />
        </View>

        {/* Notifications List */}
        {Object.keys(groupedNotifications).map(date => (
          <View key={date} style={styles.dateSection}>
            <Text style={styles.dateHeader}>{date}</Text>
            {groupedNotifications[date].map((notification) => (
              <NotificationCard
                key={notification.id}
                notification={notification}
                onPress={() => handleNotificationPress(notification)}
              />
            ))}
          </View>
        ))}

        {notifications.length === 0 && !loading && (
          <View style={styles.emptyState}>
            <Icon name="notifications-none" size={60} color="#8e8e93" />
            <Text style={styles.emptyTitle}>No notifications yet</Text>
            <Text style={styles.emptySubtitle}>
              You'll receive real-time alerts here for leads, calls, and inventory updates
            </Text>
          </View>
        )}

        {/* Notification Settings */}
        <View style={styles.settingsSection}>
          <Text style={styles.settingsTitle}>📱 Notification Settings</Text>
          
          <View style={styles.settingsCard}>
            {Object.entries(settings).map(([key, value]) => (
              <SettingRow
                key={key}
                title={getSettingTitle(key)}
                description={getSettingDescription(key)}
                value={value}
                onValueChange={(newValue) => updateSetting(key, newValue)}
              />
            ))}
          </View>
        </View>

        {/* Revolutionary Features */}
        <LinearGradient
          colors={['#e94560', '#f5af19']}
          style={styles.featuresBanner}
        >
          <Text style={styles.bannerTitle}>🚀 Revolutionary Alerts</Text>
          <Text style={styles.bannerText}>
            ✓ Real-time voice AI notifications{'\n'}
            ✓ Smart lead priority alerts{'\n'}
            ✓ Instant inventory sync updates{'\n'}
            ✓ Predictive business insights
          </Text>
        </LinearGradient>
      </ScrollView>
    </View>
  );
};

const StatCard = ({ title, value, icon, gradient }) => (
  <View style={styles.statCard}>
    <LinearGradient colors={gradient} style={styles.statGradient}>
      <Icon name={icon} size={18} color="#ffffff" />
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statTitle}>{title}</Text>
    </LinearGradient>
  </View>
);

const NotificationCard = ({ notification, onPress }) => {
  const getNotificationIcon = (type) => {
    switch (type) {
      case 'voice_call': return 'mic';
      case 'new_lead': return 'person-add';
      case 'inventory': return 'inventory';
      case 'appointment': return 'event';
      case 'system': return 'settings';
      default: return 'notifications';
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case 'voice_call': return '#667eea';
      case 'new_lead': return '#11998e';
      case 'inventory': return '#f5af19';
      case 'appointment': return '#38ef7d';
      case 'system': return '#8e8e93';
      default: return '#e94560';
    }
  };

  return (
    <TouchableOpacity 
      style={[
        styles.notificationCard,
        !notification.read && styles.notificationCardUnread
      ]} 
      onPress={onPress}
    >
      <View style={styles.notificationContent}>
        <View style={[
          styles.notificationIcon,
          { backgroundColor: getNotificationColor(notification.type) }
        ]}>
          <Icon 
            name={getNotificationIcon(notification.type)} 
            size={20} 
            color="#ffffff" 
          />
        </View>
        
        <View style={styles.notificationText}>
          <Text style={[
            styles.notificationTitle,
            !notification.read && styles.notificationTitleUnread
          ]}>
            {notification.title}
          </Text>
          <Text style={styles.notificationMessage}>
            {notification.message}
          </Text>
          <Text style={styles.notificationTime}>
            {notification.timestamp}
          </Text>
        </View>
        
        {!notification.read && (
          <View style={styles.unreadIndicator} />
        )}
      </View>
    </TouchableOpacity>
  );
};

const SettingRow = ({ title, description, value, onValueChange }) => (
  <View style={styles.settingRow}>
    <View style={styles.settingInfo}>
      <Text style={styles.settingTitle}>{title}</Text>
      <Text style={styles.settingDescription}>{description}</Text>
    </View>
    <Switch
      value={value}
      onValueChange={onValueChange}
      trackColor={{ false: '#2a2a3e', true: '#e94560' }}
      thumbColor={value ? '#ffffff' : '#8e8e93'}
    />
  </View>
);

// Helper functions
const groupNotificationsByDate = (notifications) => {
  const groups = {};
  
  notifications.forEach(notification => {
    const date = getRelativeDate(notification.timestamp);
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(notification);
  });
  
  return groups;
};

const getRelativeDate = (timestamp) => {
  // Simple implementation - in real app would use proper date library
  const now = new Date();
  const notifDate = new Date(timestamp);
  
  if (notifDate.toDateString() === now.toDateString()) {
    return 'Today';
  }
  
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  
  if (notifDate.toDateString() === yesterday.toDateString()) {
    return 'Yesterday';
  }
  
  return notifDate.toLocaleDateString();
};

const getTodayNotificationsCount = (notifications) => {
  const today = new Date().toDateString();
  return notifications.filter(n => 
    new Date(n.timestamp).toDateString() === today
  ).length;
};

const getNotificationsByType = (notifications, type) => {
  return notifications.filter(n => n.type === type);
};

const getSettingTitle = (key) => {
  const titles = {
    pushNotifications: 'Push Notifications',
    voiceAI: 'Voice AI Alerts',
    newLeads: 'New Lead Alerts',
    inventoryUpdates: 'Inventory Updates',
    appointments: 'Appointment Reminders',
    systemAlerts: 'System Alerts',
  };
  return titles[key] || key;
};

const getSettingDescription = (key) => {
  const descriptions = {
    pushNotifications: 'Receive push notifications on your device',
    voiceAI: 'Alerts for Voice AI call completions and insights',
    newLeads: 'Instant notifications when new leads are generated',
    inventoryUpdates: 'Updates when vehicles are posted or sold',
    appointments: 'Reminders for scheduled test drives and meetings',
    systemAlerts: 'Technical alerts and system maintenance notices',
  };
  return descriptions[key] || '';
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f0f23',
  },
  header: {
    padding: 20,
    paddingTop: 30,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 5,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#8e8e93',
  },
  clearButton: {
    backgroundColor: 'rgba(233, 69, 96, 0.2)',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 15,
  },
  clearButtonText: {
    color: '#e94560',
    fontSize: 12,
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 15,
    justifyContent: 'space-between',
  },
  statCard: {
    width: '48%',
    marginBottom: 10,
  },
  statGradient: {
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    marginVertical: 2,
  },
  statTitle: {
    fontSize: 10,
    color: '#ffffff',
    textAlign: 'center',
  },
  dateSection: {
    marginBottom: 20,
  },
  dateHeader: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
    marginLeft: 20,
    marginBottom: 10,
    marginTop: 10,
  },
  notificationCard: {
    backgroundColor: '#1a1a2e',
    marginHorizontal: 15,
    marginBottom: 8,
    borderRadius: 12,
    padding: 15,
  },
  notificationCardUnread: {
    backgroundColor: '#1e1e3a',
    borderLeftWidth: 3,
    borderLeftColor: '#e94560',
  },
  notificationContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  notificationIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  notificationText: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 3,
  },
  notificationTitleUnread: {
    fontWeight: 'bold',
  },
  notificationMessage: {
    fontSize: 12,
    color: '#8e8e93',
    marginBottom: 5,
    lineHeight: 16,
  },
  notificationTime: {
    fontSize: 11,
    color: '#667eea',
  },
  unreadIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#e94560',
    marginTop: 5,
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
    marginTop: 50,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    marginTop: 15,
    marginBottom: 5,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#8e8e93',
    textAlign: 'center',
    lineHeight: 20,
  },
  settingsSection: {
    padding: 20,
  },
  settingsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 15,
  },
  settingsCard: {
    backgroundColor: '#1a1a2e',
    borderRadius: 15,
    padding: 5,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#2a2a3e',
  },
  settingInfo: {
    flex: 1,
    marginRight: 15,
  },
  settingTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 3,
  },
  settingDescription: {
    fontSize: 12,
    color: '#8e8e93',
    lineHeight: 16,
  },
  featuresBanner: {
    margin: 20,
    padding: 20,
    borderRadius: 15,
  },
  bannerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 10,
  },
  bannerText: {
    fontSize: 14,
    color: '#ffffff',
    lineHeight: 20,
  },
});

export default NotificationsScreen;