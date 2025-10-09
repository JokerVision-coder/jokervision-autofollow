/**
 * JokerVision AutoFollow Mobile App
 * Revolutionary automotive dealership management on mobile
 * Created by: Alfonso Martinez Sandoval
 */

import React, { useEffect, useState } from 'react';
import {
  StatusBar,
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Alert,
  Dimensions,
  Platform,
} from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import LinearGradient from 'react-native-linear-gradient';
import PushNotification from 'react-native-push-notification';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/MaterialIcons';

// Import screens
import DashboardScreen from './src/screens/DashboardScreen';
import InventoryScreen from './src/screens/InventoryScreen';
import LeadsScreen from './src/screens/LeadsScreen';
import VoiceAIScreen from './src/screens/VoiceAIScreen';
import NotificationsScreen from './src/screens/NotificationsScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import PredictiveAIScreen from './src/screens/PredictiveAIScreen';
import ExclusiveLeadsScreen from './src/screens/ExclusiveLeadsScreen';

// Import services
import { initializeVoiceAI } from './src/services/VoiceAIService';
import { setupPushNotifications } from './src/services/NotificationService';
import { connectToBackend } from './src/services/ApiService';
import exclusiveLeadsService from './src/services/ExclusiveLeadsService';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();
const { width } = Dimensions.get('window');

// Revolutionary gradient colors matching web platform
const GRADIENT_COLORS = {
  primary: ['#1a1a2e', '#16213e', '#0f3460'],
  accent: ['#e94560', '#f5af19', '#f12711'],
  success: ['#11998e', '#38ef7d'],
  voice: ['#667eea', '#764ba2'],
};

const JokerVisionMobileApp = () => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('connecting');
  const [voiceAIAvailable, setVoiceAIAvailable] = useState(false);

  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      console.log('🚀 Initializing JokerVision Mobile App...');
      
      // Setup push notifications
      await setupPushNotifications();
      
      // Initialize Voice AI
      const voiceStatus = await initializeVoiceAI();
      setVoiceAIAvailable(voiceStatus);
      
      // Connect to backend
      const backendStatus = await connectToBackend();
      setConnectionStatus(backendStatus ? 'connected' : 'offline');
      
      // Initialize Exclusive Leads Service
      await exclusiveLeadsService.initialize();
      
      // Load saved preferences
      await loadUserPreferences();
      
      setIsInitialized(true);
      
      console.log('✅ JokerVision Mobile App initialized successfully');
      
      // Show welcome notification
      PushNotification.localNotification({
        title: '🚀 JokerVision AutoFollow',
        message: 'Revolutionary mobile app ready! Voice AI enabled.',
        playSound: true,
      });
      
    } catch (error) {
      console.error('❌ App initialization failed:', error);
      Alert.alert(
        'Initialization Error',
        'Failed to initialize app. Please restart.',
        [{ text: 'OK' }]
      );
    }
  };

  const loadUserPreferences = async () => {
    try {
      const preferences = await AsyncStorage.getItem('userPreferences');
      if (preferences) {
        // Apply saved preferences
        console.log('✅ User preferences loaded');
      }
    } catch (error) {
      console.log('⚠️ No saved preferences found');
    }
  };

  if (!isInitialized) {
    return <LoadingScreen />;
  }

  return (
    <NavigationContainer>
      <StatusBar barStyle="light-content" backgroundColor="#1a1a2e" />
      <MainTabNavigator 
        connectionStatus={connectionStatus}
        voiceAIAvailable={voiceAIAvailable}
      />
    </NavigationContainer>
  );
};

const LoadingScreen = () => (
  <LinearGradient
    colors={GRADIENT_COLORS.primary}
    style={styles.loadingContainer}
  >
    <View style={styles.loadingContent}>
      <Text style={styles.loadingTitle}>🚀 JokerVision</Text>
      <Text style={styles.loadingSubtitle}>AutoFollow Mobile</Text>
      <Text style={styles.loadingText}>Initializing Revolutionary AI...</Text>
      <View style={styles.loadingSpinner}>
        <Text style={styles.spinnerText}>⚡</Text>
      </View>
    </View>
  </LinearGradient>
);

const MainTabNavigator = ({ connectionStatus, voiceAIAvailable }) => {
  const getTabBarIcon = (routeName, focused, color, size) => {
    let iconName;
    
    switch (routeName) {
      case 'Dashboard':
        iconName = 'dashboard';
        break;
      case 'Inventory':
        iconName = 'inventory';
        break;
      case 'ExclusiveLeads':
        iconName = 'star';
        break;
      case 'VoiceAI':
        iconName = 'mic';
        break;
      case 'Notifications':
        iconName = 'notifications';
        break;
      default:
        iconName = 'circle';
    }
    
    return (
      <View style={styles.tabIcon}>
        <Icon name={iconName} size={size} color={color} />
        {focused && <View style={styles.tabIndicator} />}
      </View>
    );
  };

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => 
          getTabBarIcon(route.name, focused, color, size),
        tabBarActiveTintColor: '#e94560',
        tabBarInactiveTintColor: '#8e8e93',
        tabBarStyle: {
          backgroundColor: '#1a1a2e',
          borderTopColor: '#2a2a3e',
          height: 80,
          paddingBottom: 10,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
        headerStyle: {
          backgroundColor: '#1a1a2e',
          borderBottomColor: '#2a2a3e',
        },
        headerTintColor: '#ffffff',
        headerTitleStyle: {
          fontWeight: 'bold',
          fontSize: 18,
        },
      })}
    >
      <Tab.Screen 
        name="Dashboard" 
        component={DashboardScreen}
        options={{
          title: '🚀 Dashboard',
          headerRight: () => (
            <ConnectionStatus status={connectionStatus} />
          ),
        }}
      />
      
      <Tab.Screen 
        name="Inventory" 
        component={InventoryScreen}
        options={{ title: '🚗 Inventory' }}
      />
      
      <Tab.Screen 
        name="ExclusiveLeads" 
        component={ExclusiveLeadsScreen}
        options={{ 
          title: '👑 Exclusive', 
          tabBarBadge: '●',
          tabBarBadgeStyle: { 
            backgroundColor: '#e94560',
            fontSize: 8,
          },
        }}
      />
      
      <Tab.Screen 
        name="VoiceAI" 
        component={VoiceAIScreen}
        options={{
          title: '🎤 Voice AI',
          tabBarBadge: voiceAIAvailable ? '●' : null,
          tabBarBadgeStyle: { 
            backgroundColor: voiceAIAvailable ? '#11998e' : '#e94560',
            fontSize: 8,
          },
        }}
      />
      
      <Tab.Screen 
        name="PredictiveAI" 
        component={PredictiveAIScreen}
        options={{ title: '🧠 Predictive AI' }}
      />
      
      <Tab.Screen 
        name="Notifications" 
        component={NotificationsScreen}
        options={{ title: '🔔 Alerts' }}
      />
      
      <Tab.Screen 
        name="Leads" 
        component={LeadsScreen}
        options={{ title: '👥 Leads' }}
      />
      
      <Tab.Screen 
        name="Settings" 
        component={SettingsScreen}
        options={{ title: '⚙️ Settings' }}
      />
    </Tab.Navigator>
  );
};

const ConnectionStatus = ({ status }) => {
  const getStatusColor = () => {
    switch (status) {
      case 'connected': return '#11998e';
      case 'connecting': return '#f5af19';
      case 'offline': return '#e94560';
      default: return '#8e8e93';
    }
  };

  return (
    <View style={styles.connectionStatus}>
      <View 
        style={[
          styles.statusDot, 
          { backgroundColor: getStatusColor() }
        ]} 
      />
      <Text style={[styles.statusText, { color: getStatusColor() }]}>
        {status.toUpperCase()}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContent: {
    alignItems: 'center',
    padding: 20,
  },
  loadingTitle: {
    fontSize: 42,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 10,
  },
  loadingSubtitle: {
    fontSize: 24,
    color: '#e94560',
    marginBottom: 30,
    fontWeight: '600',
  },
  loadingText: {
    fontSize: 16,
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 30,
  },
  loadingSpinner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(233, 69, 96, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  spinnerText: {
    fontSize: 24,
    animation: 'spin 2s linear infinite',
  },
  tabIcon: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 40,
  },
  tabIndicator: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#e94560',
    marginTop: 4,
  },
  connectionStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 15,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 5,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '600',
  },
});

export default JokerVisionMobileApp;