import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Dimensions,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { getDashboardStats, getRecentActivity } from '../services/ApiService';
import { formatCurrency, formatNumber } from '../utils/formatters';

const { width } = Dimensions.get('window');

const DashboardScreen = ({ navigation }) => {
  const [stats, setStats] = useState({
    totalLeads: 0,
    activeInventory: 0,
    voiceCalls: 0,
    conversionRate: 0,
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [statsData, activityData] = await Promise.all([
        getDashboardStats(),
        getRecentActivity(),
      ]);
      
      setStats(statsData);
      setRecentActivity(activityData);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
      // Load mock data for demo
      setStats({
        totalLeads: 247,
        activeInventory: 89,
        voiceCalls: 34,
        conversionRate: 28.5,
      });
      setRecentActivity(generateMockActivity());
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  };

  const generateMockActivity = () => [
    {
      id: 1,
      type: 'voice_call',
      title: 'Voice AI Call Completed',
      description: 'Customer interested in 2024 Toyota Camry',
      timestamp: '5 min ago',
      icon: 'mic',
      color: '#667eea',
    },
    {
      id: 2,
      type: 'new_lead',
      title: 'New Lead Generated',
      description: 'Facebook Marketplace inquiry',
      timestamp: '12 min ago',
      icon: 'person-add',
      color: '#11998e',
    },
    {
      id: 3,
      type: 'inventory_update',
      title: 'Vehicle Posted',
      description: 'Posted to 15 platforms successfully',
      timestamp: '1 hour ago',
      icon: 'inventory',
      color: '#f5af19',
    },
  ];

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <LinearGradient
        colors={['#1a1a2e', '#16213e', '#0f3460']}
        style={styles.header}
      >
        <Text style={styles.welcomeText}>Welcome back! 👋</Text>
        <Text style={styles.dealershipName}>JokerVision AutoFollow</Text>
      </LinearGradient>

      {/* Stats Cards */}
      <View style={styles.statsContainer}>
        <StatCard
          title="Total Leads"
          value={stats.totalLeads}
          icon="people"
          gradient={['#11998e', '#38ef7d']}
          onPress={() => navigation.navigate('Leads')}
        />
        <StatCard
          title="Active Inventory"
          value={stats.activeInventory}
          icon="inventory"
          gradient={['#667eea', '#764ba2']}
          onPress={() => navigation.navigate('Inventory')}
        />
        <StatCard
          title="Voice Calls"
          value={stats.voiceCalls}
          icon="mic"
          gradient={['#f093fb', '#f5576c']}
          onPress={() => navigation.navigate('VoiceAI')}
        />
        <StatCard
          title="Conversion Rate"
          value={`${stats.conversionRate}%`}
          icon="trending-up"
          gradient={['#ffecd2', '#fcb69f']}
        />
      </View>

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🚀 Quick Actions</Text>
        <View style={styles.quickActions}>
          <QuickActionButton
            title="Start Voice Call"
            icon="mic"
            color="#667eea"
            onPress={() => navigation.navigate('VoiceAI')}
          />
          <QuickActionButton
            title="Add Vehicle"
            icon="add"
            color="#11998e"
            onPress={() => navigation.navigate('Inventory')}
          />
          <QuickActionButton
            title="View Leads"
            icon="people"
            color="#f5af19"
            onPress={() => navigation.navigate('Leads')}
          />
        </View>
      </View>

      {/* Recent Activity */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📊 Recent Activity</Text>
        <View style={styles.activityList}>
          {recentActivity.map((activity) => (
            <ActivityItem key={activity.id} activity={activity} />
          ))}
        </View>
      </View>

      {/* Revolutionary Features Banner */}
      <LinearGradient
        colors={['#e94560', '#f5af19']}
        style={styles.featuresBanner}
      >
        <Text style={styles.bannerTitle}>🏆 Revolutionary Features</Text>
        <Text style={styles.bannerText}>
          ✓ Real-time Voice AI conversations{'\n'}
          ✓ 50+ platform inventory posting{'\n'}
          ✓ Advanced lead scoring & tracking{'\n'}
          ✓ Industry-first mobile integration
        </Text>
      </LinearGradient>
    </ScrollView>
  );
};

const StatCard = ({ title, value, icon, gradient, onPress }) => (
  <TouchableOpacity onPress={onPress} style={styles.statCard}>
    <LinearGradient colors={gradient} style={styles.statGradient}>
      <Icon name={icon} size={24} color="#ffffff" />
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statTitle}>{title}</Text>
    </LinearGradient>
  </TouchableOpacity>
);

const QuickActionButton = ({ title, icon, color, onPress }) => (
  <TouchableOpacity onPress={onPress} style={styles.quickActionButton}>
    <View style={[styles.quickActionIcon, { backgroundColor: color }]}>
      <Icon name={icon} size={24} color="#ffffff" />
    </View>
    <Text style={styles.quickActionTitle}>{title}</Text>
  </TouchableOpacity>
);

const ActivityItem = ({ activity }) => (
  <View style={styles.activityItem}>
    <View style={[styles.activityIcon, { backgroundColor: activity.color }]}>
      <Icon name={activity.icon} size={20} color="#ffffff" />
    </View>
    <View style={styles.activityContent}>
      <Text style={styles.activityTitle}>{activity.title}</Text>
      <Text style={styles.activityDescription}>{activity.description}</Text>
      <Text style={styles.activityTimestamp}>{activity.timestamp}</Text>
    </View>
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
  welcomeText: {
    fontSize: 16,
    color: '#ffffff',
    marginBottom: 5,
  },
  dealershipName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#e94560',
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 15,
    justifyContent: 'space-between',
  },
  statCard: {
    width: (width - 45) / 2,
    marginBottom: 15,
  },
  statGradient: {
    padding: 20,
    borderRadius: 15,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
    marginVertical: 5,
  },
  statTitle: {
    fontSize: 12,
    color: '#ffffff',
    textAlign: 'center',
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 15,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  quickActionButton: {
    alignItems: 'center',
  },
  quickActionIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  quickActionTitle: {
    fontSize: 12,
    color: '#ffffff',
    textAlign: 'center',
  },
  activityList: {
    backgroundColor: '#1a1a2e',
    borderRadius: 15,
    padding: 10,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#2a2a3e',
  },
  activityIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
  },
  activityDescription: {
    fontSize: 12,
    color: '#8e8e93',
    marginVertical: 2,
  },
  activityTimestamp: {
    fontSize: 11,
    color: '#e94560',
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

export default DashboardScreen;