import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  Share,
  Linking,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';

const SettingsScreen = ({ navigation }) => {
  const [settings, setSettings] = useState({
    darkMode: true,
    notifications: true,
    voiceAI: true,
    autoSync: true,
    biometrics: false,
    analytics: true,
    backgroundSync: true,
  });

  const updateSetting = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    console.log(`Updated ${key} to ${value}`);
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: '🚀 JokerVision AutoFollow - Revolutionary automotive dealership management! Get the app now!',
        title: 'JokerVision AutoFollow',
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const handleSupport = () => {
    Alert.alert(
      'Contact Support',
      'How would you like to contact our support team?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Email', 
          onPress: () => Linking.openURL('mailto:support@jokervision.com')
        },
        { 
          text: 'Phone', 
          onPress: () => Linking.openURL('tel:+1-800-JOKER-AI')
        },
      ]
    );
  };

  const handleAbout = () => {
    Alert.alert(
      'JokerVision AutoFollow',
      'Version 2.1.0\n\nRevolutionary automotive dealership management platform with AI-powered lead generation, voice AI integration, and industry-first mobile capabilities.\n\n© 2024 JokerVision Technologies',
      [{ text: 'OK' }]
    );
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Logout', 
          style: 'destructive',
          onPress: () => {
            // Handle logout logic
            console.log('User logged out');
          }
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#1a1a2e', '#16213e', '#0f3460']}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>⚙️ Settings</Text>
        <Text style={styles.headerSubtitle}>
          Customize your JokerVision experience
        </Text>
      </LinearGradient>

      <ScrollView style={styles.content}>
        {/* User Profile Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>👤 Profile</Text>
          <View style={styles.card}>
            <TouchableOpacity style={styles.profileRow}>
              <View style={styles.profileInfo}>
                <View style={styles.avatar}>
                  <Icon name="person" size={30} color="#ffffff" />
                </View>
                <View style={styles.profileText}>
                  <Text style={styles.profileName}>Sales Representative</Text>
                  <Text style={styles.profileEmail}>rep@dealership.com</Text>
                </View>
              </View>
              <Icon name="chevron-right" size={20} color="#8e8e93" />
            </TouchableOpacity>
          </View>
        </View>

        {/* App Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📱 App Settings</Text>
          <View style={styles.card}>
            <SettingRow
              icon="dark-mode"
              title="Dark Mode"
              description="Enhanced viewing experience"
              value={settings.darkMode}
              onValueChange={(value) => updateSetting('darkMode', value)}
            />
            <SettingRow
              icon="notifications"
              title="Push Notifications"
              description="Real-time business alerts"
              value={settings.notifications}
              onValueChange={(value) => updateSetting('notifications', value)}
            />
            <SettingRow
              icon="sync"
              title="Auto Sync"
              description="Automatic data synchronization"
              value={settings.autoSync}
              onValueChange={(value) => updateSetting('autoSync', value)}
            />
            <SettingRow
              icon="fingerprint"
              title="Biometric Login"
              description="Use fingerprint or face ID"
              value={settings.biometrics}
              onValueChange={(value) => updateSetting('biometrics', value)}
            />
          </View>
        </View>

        {/* Voice AI Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🎤 Voice AI</Text>
          <View style={styles.card}>
            <SettingRow
              icon="mic"
              title="Voice AI Enabled"
              description="Revolutionary voice conversations"
              value={settings.voiceAI}
              onValueChange={(value) => updateSetting('voiceAI', value)}
            />
            <SettingRow
              icon="cloud-sync"
              title="Background Sync"
              description="Sync voice data in background"
              value={settings.backgroundSync}
              onValueChange={(value) => updateSetting('backgroundSync', value)}
            />
          </View>
        </View>

        {/* Privacy & Data */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🔒 Privacy & Data</Text>
          <View style={styles.card}>
            <SettingRow
              icon="analytics"
              title="Usage Analytics"
              description="Help improve the app"
              value={settings.analytics}
              onValueChange={(value) => updateSetting('analytics', value)}
            />
            <TouchableOpacity style={styles.menuRow}>
              <Icon name="security" size={20} color="#667eea" />
              <View style={styles.menuContent}>
                <Text style={styles.menuTitle}>Data & Privacy</Text>
                <Text style={styles.menuDescription}>Manage your data and privacy settings</Text>
              </View>
              <Icon name="chevron-right" size={20} color="#8e8e93" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Support & Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>ℹ️ Support & Info</Text>
          <View style={styles.card}>
            <TouchableOpacity style={styles.menuRow} onPress={handleSupport}>
              <Icon name="help" size={20} color="#11998e" />
              <View style={styles.menuContent}>
                <Text style={styles.menuTitle}>Help & Support</Text>
                <Text style={styles.menuDescription}>Get help or contact support</Text>
              </View>
              <Icon name="chevron-right" size={20} color="#8e8e93" />
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.menuRow} onPress={handleShare}>
              <Icon name="share" size={20} color="#f5af19" />
              <View style={styles.menuContent}>
                <Text style={styles.menuTitle}>Share App</Text>
                <Text style={styles.menuDescription}>Tell others about JokerVision</Text>
              </View>
              <Icon name="chevron-right" size={20} color="#8e8e93" />
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.menuRow} onPress={handleAbout}>
              <Icon name="info" size={20} color="#667eea" />
              <View style={styles.menuContent}>
                <Text style={styles.menuTitle}>About</Text>
                <Text style={styles.menuDescription}>Version, credits, and legal info</Text>
              </View>
              <Icon name="chevron-right" size={20} color="#8e8e93" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Revolutionary Features Info */}
        <LinearGradient
          colors={['#e94560', '#f5af19']}
          style={styles.featuresBanner}
        >
          <Text style={styles.bannerTitle}>🚀 Revolutionary Platform</Text>
          <Text style={styles.bannerText}>
            You're using the industry's first and only comprehensive automotive dealership management platform with real-time Voice AI, 50+ platform integration, and predictive analytics.
          </Text>
        </LinearGradient>

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <LinearGradient
            colors={['rgba(233, 69, 96, 0.1)', 'rgba(233, 69, 96, 0.2)']}
            style={styles.logoutGradient}
          >
            <Icon name="logout" size={20} color="#e94560" />
            <Text style={styles.logoutText}>Logout</Text>
          </LinearGradient>
        </TouchableOpacity>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            JokerVision AutoFollow v2.1.0{'\n'}
            Revolutionary Automotive Technology
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

const SettingRow = ({ icon, title, description, value, onValueChange }) => (
  <View style={styles.settingRow}>
    <Icon name={icon} size={20} color="#8e8e93" />
    <View style={styles.settingContent}>
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
  content: {
    flex: 1,
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
    marginLeft: 20,
    marginBottom: 10,
  },
  card: {
    backgroundColor: '#1a1a2e',
    marginHorizontal: 20,
    borderRadius: 15,
    padding: 5,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 15,
  },
  profileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#e94560',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  profileText: {
    flex: 1,
  },
  profileName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 2,
  },
  profileEmail: {
    fontSize: 14,
    color: '#8e8e93',
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#2a2a3e',
  },
  settingContent: {
    flex: 1,
    marginLeft: 15,
  },
  settingTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 2,
  },
  settingDescription: {
    fontSize: 12,
    color: '#8e8e93',
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#2a2a3e',
  },
  menuContent: {
    flex: 1,
    marginLeft: 15,
  },
  menuTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 2,
  },
  menuDescription: {
    fontSize: 12,
    color: '#8e8e93',
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
  logoutButton: {
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 15,
    overflow: 'hidden',
  },
  logoutGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#e94560',
    marginLeft: 8,
  },
  footer: {
    padding: 20,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: '#8e8e93',
    textAlign: 'center',
    lineHeight: 18,
  },
});

export default SettingsScreen;