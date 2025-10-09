import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
  Dimensions,
  Modal,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import LeadCard from '../components/LeadCard';
import exclusiveLeadsService from '../services/ExclusiveLeadsService';
import { formatCurrency, formatTimeAgo } from '../utils/formatters';

const { width } = Dimensions.get('window');

const ExclusiveLeadsScreen = ({ navigation }) => {
  const [exclusiveLeads, setExclusiveLeads] = useState([]);
  const [intelligence, setIntelligence] = useState({});
  const [alerts, setAlerts] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedLead, setSelectedLead] = useState(null);
  const [leadDetailsModal, setLeadDetailsModal] = useState(false);

  useEffect(() => {
    initializeExclusiveLeads();
    
    // Set up auto-refresh for real-time updates
    const refreshInterval = setInterval(() => {
      loadRealTimeAlerts();
    }, 30000); // Refresh alerts every 30 seconds

    return () => clearInterval(refreshInterval);
  }, []);

  const initializeExclusiveLeads = async () => {
    try {
      await exclusiveLeadsService.initialize();
      await loadAllData();
    } catch (error) {
      console.error('Failed to initialize exclusive leads:', error);
      Alert.alert('Error', 'Failed to load exclusive leads data');
    }
  };

  const loadAllData = async () => {
    try {
      setLoading(true);
      
      const [leadsResult, intelligenceResult, alertsResult] = await Promise.all([
        exclusiveLeadsService.getExclusiveLeads(),
        exclusiveLeadsService.getLeadIntelligence(),
        exclusiveLeadsService.getRealTimeAlerts(),
      ]);

      if (leadsResult.success) {
        setExclusiveLeads(leadsResult.leads);
      }

      if (intelligenceResult.success) {
        setIntelligence(intelligenceResult.intelligence);
      }

      if (alertsResult.success) {
        setAlerts(alertsResult.alerts);
      }

    } catch (error) {
      console.error('Failed to load exclusive leads data:', error);
      Alert.alert('Error', 'Failed to refresh data');
    } finally {
      setLoading(false);
    }
  };

  const loadRealTimeAlerts = async () => {
    try {
      const alertsResult = await exclusiveLeadsService.getRealTimeAlerts();
      if (alertsResult.success) {
        setAlerts(alertsResult.alerts);
      }
    } catch (error) {
      console.error('Failed to load alerts:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadAllData();
    setRefreshing(false);
  };

  const handleClaimLead = async (lead) => {
    try {
      Alert.alert(
        '🔒 Claim Exclusive Lead',
        `Claim exclusive access to ${lead.name}? This will give you priority access for ${exclusiveLeadsService.calculateTimeRemaining(lead.exclusivity_expires)}.`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Claim Now',
            style: 'default',
            onPress: async () => {
              const result = await exclusiveLeadsService.claimExclusiveLead(lead.id);
              if (result.success) {
                Alert.alert('Success! 🎉', result.message);
                await loadAllData(); // Refresh data
              } else {
                Alert.alert('Error', result.error || 'Failed to claim lead');
              }
            }
          }
        ]
      );
    } catch (error) {
      console.error('Error claiming lead:', error);
      Alert.alert('Error', 'Failed to claim exclusive lead');
    }
  };

  const handleActivateProtection = async (lead) => {
    try {
      const result = await exclusiveLeadsService.activateLeadProtection(lead.id);
      if (result.success) {
        Alert.alert('Protection Activated! 🛡️', result.message);
        await loadAllData(); // Refresh data
      } else {
        Alert.alert('Error', result.error || 'Failed to activate protection');
      }
    } catch (error) {
      console.error('Error activating protection:', error);
      Alert.alert('Error', 'Failed to activate lead protection');
    }
  };

  const handleLeadPress = (lead) => {
    setSelectedLead(lead);
    setLeadDetailsModal(true);
  };

  const handleCall = (lead) => {
    Alert.alert(
      '📞 Call Lead',
      `Call ${lead.name} at ${lead.phone}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Call', onPress: () => {
          // In a real app, this would initiate a phone call
          console.log('Calling:', lead.phone);
        }}
      ]
    );
  };

  const handleMessage = (lead) => {
    Alert.alert(
      '💬 Send Message',
      `Send SMS to ${lead.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Send', onPress: () => {
          // In a real app, this would open SMS composer
          console.log('Messaging:', lead.phone);
        }}
      ]
    );
  };

  const renderIntelligenceCard = () => (
    <LinearGradient
      colors={['#1a1a2e', '#16213e', '#0f3460']}
      style={styles.intelligenceCard}
    >
      <View style={styles.intelligenceHeader}>
        <Icon name="insights" size={24} color="#e94560" />
        <Text style={styles.intelligenceTitle}>Exclusive Intelligence</Text>
      </View>
      
      <View style={styles.statsGrid}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{intelligence.total_exclusive_leads || 0}</Text>
          <Text style={styles.statLabel}>Exclusive Leads</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{intelligence.conversion_rate_exclusive || 0}%</Text>
          <Text style={styles.statLabel}>Close Rate</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>
            {formatCurrency(intelligence.avg_deal_size_exclusive || 0)}
          </Text>
          <Text style={styles.statLabel}>Avg Deal</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{intelligence.ai_prediction_accuracy || 0}%</Text>
          <Text style={styles.statLabel}>AI Accuracy</Text>
        </View>
      </View>

      {intelligence.competitor_advantage && (
        <View style={styles.advantageContainer}>
          <Text style={styles.advantageText}>
            🚀 {intelligence.competitor_advantage}
          </Text>
        </View>
      )}
    </LinearGradient>
  );

  const renderAlert = (alert) => (
    <TouchableOpacity key={alert.id} style={styles.alertContainer}>
      <LinearGradient
        colors={alert.priority === 'critical' ? ['#e94560', '#f5af19'] : ['#667eea', '#764ba2']}
        style={styles.alertGradient}
      >
        <View style={styles.alertContent}>
          <Icon 
            name={alert.type === 'exclusive_lead_expiring' ? 'timer' : 'trending-up'} 
            size={16} 
            color="#ffffff" 
          />
          <Text style={styles.alertText} numberOfLines={2}>
            {alert.message}
          </Text>
        </View>
        <Text style={styles.alertPriority}>
          {alert.priority?.toUpperCase()}
        </Text>
      </LinearGradient>
    </TouchableOpacity>
  );

  const renderLeadDetailsModal = () => (
    <Modal
      visible={leadDetailsModal}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setLeadDetailsModal(false)}
    >
      <View style={styles.modalOverlay}>
        <LinearGradient
          colors={['#1a1a2e', '#16213e', '#0f3460']}
          style={styles.modalContent}
        >
          {selectedLead && (
            <>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>
                  {exclusiveLeadsService.formatExclusivityLevel(selectedLead.exclusivity_level).emoji} 
                  {selectedLead.name}
                </Text>
                <TouchableOpacity
                  onPress={() => setLeadDetailsModal(false)}
                  style={styles.closeButton}
                >
                  <Icon name="close" size={24} color="#ffffff" />
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.modalBody}>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Vehicle Interest:</Text>
                  <Text style={styles.detailValue}>{selectedLead.vehicle_interest}</Text>
                </View>
                
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Budget:</Text>
                  <Text style={styles.detailValue}>{formatCurrency(selectedLead.budget)}</Text>
                </View>

                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Timeline:</Text>
                  <Text style={styles.detailValue}>
                    {selectedLead.purchase_timeline?.replace('_', ' ') || 'Not specified'}
                  </Text>
                </View>

                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Lead Score:</Text>
                  <Text style={[styles.detailValue, { color: '#11998e' }]}>
                    {selectedLead.lead_score}/100
                  </Text>
                </View>

                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Exclusivity Expires:</Text>
                  <Text style={[styles.detailValue, { color: '#e94560' }]}>
                    {exclusiveLeadsService.calculateTimeRemaining(selectedLead.exclusivity_expires)}
                  </Text>
                </View>

                {selectedLead.urgency_factors && selectedLead.urgency_factors.length > 0 && (
                  <View style={styles.urgencySection}>
                    <Text style={styles.detailLabel}>Urgency Factors:</Text>
                    {selectedLead.urgency_factors.map((factor, index) => (
                      <Text key={index} style={styles.urgencyFactor}>
                        • {factor.replace('_', ' ')}
                      </Text>
                    ))}
                  </View>
                )}

                {selectedLead.notes && (
                  <View style={styles.notesSection}>
                    <Text style={styles.detailLabel}>Notes:</Text>
                    <Text style={styles.notesText}>{selectedLead.notes}</Text>
                  </View>
                )}
              </ScrollView>

              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={[styles.modalActionButton, styles.claimButton]}
                  onPress={() => {
                    setLeadDetailsModal(false);
                    handleClaimLead(selectedLead);
                  }}
                >
                  <Text style={styles.actionButtonText}>🔒 Claim Lead</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.modalActionButton, styles.protectionButton]}
                  onPress={() => {
                    setLeadDetailsModal(false);
                    handleActivateProtection(selectedLead);
                  }}
                >
                  <Text style={styles.actionButtonText}>🛡️ Activate Protection</Text>
                </TouchableOpacity>
              </View>
            </>
          )}
        </LinearGradient>
      </View>
    </Modal>
  );

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Header */}
      <LinearGradient
        colors={['#e94560', '#f5af19', '#f12711']}
        style={styles.headerContainer}
      >
        <Text style={styles.headerTitle}>👑 EXCLUSIVE LEAD DOMINATION</Text>
        <Text style={styles.headerSubtitle}>
          🚀 CRUSHING ALME & ALL COMPETITORS
        </Text>
        <Text style={styles.performanceText}>
          340% Higher Performance
        </Text>
      </LinearGradient>

      {/* Real-time Alerts */}
      {alerts.length > 0 && (
        <View style={styles.alertsSection}>
          <Text style={styles.sectionTitle}>🚨 Real-Time Alerts</Text>
          {alerts.map(renderAlert)}
        </View>
      )}

      {/* Intelligence Card */}
      {renderIntelligenceCard()}

      {/* Exclusive Leads */}
      <View style={styles.leadsSection}>
        <Text style={styles.sectionTitle}>
          💎 Exclusive Lead Pipeline ({exclusiveLeads.length})
        </Text>
        
        {loading ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Loading exclusive leads...</Text>
          </View>
        ) : exclusiveLeads.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Icon name="inbox" size={48} color="#8e8e93" />
            <Text style={styles.emptyText}>No exclusive leads available</Text>
            <Text style={styles.emptySubtext}>Pull to refresh</Text>
          </View>
        ) : (
          exclusiveLeads.map((lead) => (
            <LeadCard
              key={lead.id}
              lead={lead}
              onPress={handleLeadPress}
              onCall={handleCall}
              onMessage={handleMessage}
              onScheduleAppointment={(lead) => {
                Alert.alert('Schedule Meeting', `Schedule appointment with ${lead.name}`);
              }}
            />
          ))
        )}
      </View>

      {/* Lead Details Modal */}
      {renderLeadDetailsModal()}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f1419',
  },
  headerContainer: {
    padding: 20,
    alignItems: 'center',
    marginBottom: 15,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 5,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 5,
  },
  performanceText: {
    fontSize: 16,
    color: '#ffffff',
    fontWeight: '600',
    textAlign: 'center',
  },
  alertsSection: {
    marginBottom: 15,
    paddingHorizontal: 15,
  },
  alertContainer: {
    marginVertical: 4,
    borderRadius: 8,
    overflow: 'hidden',
  },
  alertGradient: {
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  alertContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  alertText: {
    color: '#ffffff',
    fontSize: 12,
    marginLeft: 8,
    flex: 1,
    fontWeight: '500',
  },
  alertPriority: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  intelligenceCard: {
    marginHorizontal: 15,
    marginBottom: 15,
    padding: 15,
    borderRadius: 12,
  },
  intelligenceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  intelligenceTitle: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  statItem: {
    width: '48%',
    alignItems: 'center',
    marginBottom: 10,
  },
  statValue: {
    color: '#e94560',
    fontSize: 18,
    fontWeight: 'bold',
  },
  statLabel: {
    color: '#8e8e93',
    fontSize: 11,
    marginTop: 2,
  },
  advantageContainer: {
    backgroundColor: 'rgba(233, 69, 96, 0.1)',
    padding: 8,
    borderRadius: 6,
  },
  advantageText: {
    color: '#e94560',
    fontSize: 12,
    textAlign: 'center',
    fontWeight: '500',
  },
  sectionTitle: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    paddingHorizontal: 15,
  },
  leadsSection: {
    marginBottom: 20,
  },
  loadingContainer: {
    padding: 30,
    alignItems: 'center',
  },
  loadingText: {
    color: '#8e8e93',
    fontSize: 14,
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    color: '#8e8e93',
    fontSize: 16,
    marginTop: 10,
  },
  emptySubtext: {
    color: '#666677',
    fontSize: 12,
    marginTop: 5,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    borderRadius: 12,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  modalTitle: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
  },
  closeButton: {
    padding: 5,
  },
  modalBody: {
    padding: 20,
    maxHeight: 300,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  detailLabel: {
    color: '#8e8e93',
    fontSize: 14,
    flex: 1,
  },
  detailValue: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
    textAlign: 'right',
  },
  urgencySection: {
    marginTop: 10,
  },
  urgencyFactor: {
    color: '#e94560',
    fontSize: 12,
    marginVertical: 2,
  },
  notesSection: {
    marginTop: 10,
  },
  notesText: {
    color: '#ffffff',
    fontSize: 12,
    fontStyle: 'italic',
    marginTop: 5,
    padding: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 6,
  },
  modalActions: {
    flexDirection: 'row',
    padding: 20,
  },
  modalActionButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  claimButton: {
    backgroundColor: '#e94560',
  },
  protectionButton: {
    backgroundColor: '#667eea',
  },
  actionButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default ExclusiveLeadsScreen;