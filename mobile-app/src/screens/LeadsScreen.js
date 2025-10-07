import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Dimensions,
  TextInput,
  Alert,
  Linking,
  Modal,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { getLeads, updateLeadStatus } from '../services/ApiService';

const { width } = Dimensions.get('window');

const LeadsScreen = ({ navigation }) => {
  const [leads, setLeads] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedLead, setSelectedLead] = useState(null);
  const [leadModalVisible, setLeadModalVisible] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLeads();
  }, []);

  const loadLeads = async () => {
    try {
      setLoading(true);
      const data = await getLeads();
      setLeads(data.leads || []);
    } catch (error) {
      console.error('Failed to load leads:', error);
      Alert.alert('Error', 'Failed to load leads data');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadLeads();
    setRefreshing(false);
  };

  const filteredLeads = leads.filter(lead => {
    const matchesSearch = searchQuery === '' || 
      `${lead.name} ${lead.phone} ${lead.email} ${lead.interestedVehicle}`.toLowerCase()
        .includes(searchQuery.toLowerCase());
    
    const matchesFilter = filterStatus === 'all' || 
      lead.status.toLowerCase() === filterStatus.toLowerCase();
      
    return matchesSearch && matchesFilter;
  });

  const handleLeadPress = (lead) => {
    setSelectedLead(lead);
    setLeadModalVisible(true);
  };

  const handleCallLead = (phone) => {
    Linking.openURL(`tel:${phone}`);
  };

  const handleSMSLead = (phone) => {
    Linking.openURL(`sms:${phone}`);
  };

  const handleEmailLead = (email) => {
    Linking.openURL(`mailto:${email}`);
  };

  const updateStatus = async (leadId, status) => {
    try {
      await updateLeadStatus(leadId, status);
      await loadLeads(); // Refresh the list
      Alert.alert('Success', `Lead status updated to ${status}`);
    } catch (error) {
      Alert.alert('Error', 'Failed to update lead status');
    }
  };

  const getLeadPriorityColor = (score) => {
    if (score >= 80) return '#11998e';
    if (score >= 60) return '#f5af19';
    return '#e94560';
  };

  const getStatusColor = (status) => {
    const statusColors = {
      'hot lead': '#11998e',
      'qualified': '#f5af19',
      'contacted': '#667eea',
      'new': '#e94560',
      'closed': '#8e8e93',
    };
    return statusColors[status.toLowerCase()] || '#8e8e93';
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#1a1a2e', '#16213e', '#0f3460']}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>👥 Revolutionary Leads</Text>
        <Text style={styles.headerSubtitle}>
          {leads.length} leads • AI-powered scoring & management
        </Text>
        
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Icon name="search" size={20} color="#8e8e93" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search leads..."
            placeholderTextColor="#8e8e93"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        
        {/* Filter Buttons */}
        <View style={styles.filterContainer}>
          {['all', 'hot lead', 'qualified', 'contacted', 'new'].map((filter) => (
            <TouchableOpacity
              key={filter}
              style={[
                styles.filterButton,
                filterStatus === filter && styles.filterButtonActive
              ]}
              onPress={() => setFilterStatus(filter)}
            >
              <Text style={[
                styles.filterButtonText,
                filterStatus === filter && styles.filterButtonTextActive
              ]}>
                {filter === 'all' ? 'All' : filter.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </LinearGradient>

      <ScrollView 
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Leads Stats */}
        <View style={styles.statsContainer}>
          <StatCard
            title="Total Leads"
            value={leads.length}
            icon="people"
            gradient={['#11998e', '#38ef7d']}
          />
          <StatCard
            title="Hot Leads"
            value={leads.filter(l => l.status === 'Hot Lead').length}
            icon="whatshot"
            gradient={['#e94560', '#f5af19']}
          />
          <StatCard
            title="Avg AI Score"
            value={Math.round(leads.reduce((sum, l) => sum + (l.aiScore || 0), 0) / leads.length) || 0}
            icon="psychology"
            gradient={['#667eea', '#764ba2']}
          />
          <StatCard
            title="Response Rate"
            value="94%"
            icon="trending-up"
            gradient={['#ffecd2', '#fcb69f']}
          />
        </View>

        {/* Leads List */}
        <View style={styles.leadsList}>
          {filteredLeads.map((lead) => (
            <LeadCard
              key={lead.id}
              lead={lead}
              onPress={() => handleLeadPress(lead)}
              onCall={() => handleCallLead(lead.phone)}
              onSMS={() => handleSMSLead(lead.phone)}
              onEmail={() => handleEmailLead(lead.email)}
            />
          ))}
          
          {filteredLeads.length === 0 && !loading && (
            <View style={styles.emptyState}>
              <Icon name="people" size={60} color="#8e8e93" />
              <Text style={styles.emptyTitle}>No leads found</Text>
              <Text style={styles.emptySubtitle}>
                {searchQuery || filterStatus !== 'all' 
                  ? 'Try adjusting your search or filters'
                  : 'New leads will appear here automatically'
                }
              </Text>
            </View>
          )}
        </View>

        {/* AI-Powered Features */}
        <LinearGradient
          colors={['#e94560', '#f5af19']}
          style={styles.featuresBanner}
        >
          <Text style={styles.bannerTitle}>🤖 AI-Powered Lead Management</Text>
          <Text style={styles.bannerText}>
            ✓ Intelligent lead scoring{'\n'}
            ✓ Automatic follow-up reminders{'\n'}
            ✓ Predictive conversion analysis{'\n'}
            ✓ Voice AI lead qualification
          </Text>
        </LinearGradient>
      </ScrollView>

      {/* Lead Detail Modal */}
      <LeadDetailModal
        visible={leadModalVisible}
        lead={selectedLead}
        onClose={() => {
          setLeadModalVisible(false);
          setSelectedLead(null);
        }}
        onUpdateStatus={updateStatus}
        onCall={handleCallLead}
        onSMS={handleSMSLead}
        onEmail={handleEmailLead}
      />
    </View>
  );
};

const StatCard = ({ title, value, icon, gradient }) => (
  <View style={styles.statCard}>
    <LinearGradient colors={gradient} style={styles.statGradient}>
      <Icon name={icon} size={20} color="#ffffff" />
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statTitle}>{title}</Text>
    </LinearGradient>
  </View>
);

const LeadCard = ({ lead, onPress, onCall, onSMS, onEmail }) => {
  const priorityColor = lead.aiScore >= 80 ? '#11998e' : lead.aiScore >= 60 ? '#f5af19' : '#e94560';
  const statusColor = {
    'hot lead': '#11998e',
    'qualified': '#f5af19',
    'contacted': '#667eea',
    'new': '#e94560',
  }[lead.status.toLowerCase()] || '#8e8e93';

  return (
    <TouchableOpacity style={styles.leadCard} onPress={onPress}>
      <View style={styles.leadHeader}>
        <View style={styles.leadInfo}>
          <Text style={styles.leadName}>{lead.name}</Text>
          <Text style={styles.leadVehicle}>{lead.interestedVehicle}</Text>
          <Text style={styles.leadSource}>From: {lead.source}</Text>
        </View>
        
        <View style={styles.leadMetrics}>
          <View style={[styles.scoreCircle, { borderColor: priorityColor }]}>
            <Text style={[styles.scoreText, { color: priorityColor }]}>
              {lead.aiScore}
            </Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: statusColor }]}>
            <Text style={styles.statusText}>{lead.status}</Text>
          </View>
        </View>
      </View>
      
      <View style={styles.leadContact}>
        <Text style={styles.contactText}>{lead.phone}</Text>
        <Text style={styles.contactText}>{lead.email}</Text>
        <Text style={styles.lastContactText}>
          Last contact: {lead.lastContact}
        </Text>
      </View>
      
      <View style={styles.leadActions}>
        <TouchableOpacity style={styles.actionButton} onPress={onCall}>
          <Icon name="phone" size={18} color="#11998e" />
          <Text style={styles.actionButtonText}>Call</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.actionButton} onPress={onSMS}>
          <Icon name="message" size={18} color="#667eea" />
          <Text style={styles.actionButtonText}>SMS</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.actionButton} onPress={onEmail}>
          <Icon name="email" size={18} color="#f5af19" />
          <Text style={styles.actionButtonText}>Email</Text>
        </TouchableOpacity>
      </View>
      
      {lead.notes && (
        <View style={styles.notesSection}>
          <Text style={styles.notesText}>{lead.notes}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const LeadDetailModal = ({ visible, lead, onClose, onUpdateStatus, onCall, onSMS, onEmail }) => {
  if (!lead) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <LinearGradient
        colors={['#0f0f23', '#1a1a2e']}
        style={styles.modalContainer}
      >
        <View style={styles.modalHeader}>
          <TouchableOpacity onPress={onClose}>
            <Icon name="close" size={24} color="#ffffff" />
          </TouchableOpacity>
          <Text style={styles.modalTitle}>Lead Details</Text>
          <View style={{width: 24}} />
        </View>
        
        <ScrollView style={styles.modalContent}>
          <View style={styles.leadDetailCard}>
            <View style={styles.leadDetailHeader}>
              <Text style={styles.leadDetailName}>{lead.name}</Text>
              <View style={styles.leadDetailScore}>
                <Icon name="psychology" size={20} color="#f5af19" />
                <Text style={styles.scoreValue}>AI Score: {lead.aiScore}</Text>
              </View>
            </View>
            
            <View style={styles.leadDetailInfo}>
              <DetailRow icon="phone" label="Phone" value={lead.phone} />
              <DetailRow icon="email" label="Email" value={lead.email} />
              <DetailRow icon="directions-car" label="Interest" value={lead.interestedVehicle} />
              <DetailRow icon="source" label="Source" value={lead.source} />
              <DetailRow icon="schedule" label="Last Contact" value={lead.lastContact} />
            </View>
            
            {lead.notes && (
              <View style={styles.notesDetail}>
                <Text style={styles.notesLabel}>Notes:</Text>
                <Text style={styles.notesDetailText}>{lead.notes}</Text>
              </View>
            )}
          </View>
          
          {/* Action Buttons */}
          <View style={styles.actionButtonsContainer}>
            <TouchableOpacity 
              style={[styles.primaryActionButton, { backgroundColor: '#11998e' }]}
              onPress={() => onCall(lead.phone)}
            >
              <Icon name="phone" size={20} color="#ffffff" />
              <Text style={styles.primaryActionText}>Call Now</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.primaryActionButton, { backgroundColor: '#667eea' }]}
              onPress={() => onSMS(lead.phone)}
            >
              <Icon name="message" size={20} color="#ffffff" />
              <Text style={styles.primaryActionText}>Send SMS</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.primaryActionButton, { backgroundColor: '#f5af19' }]}
              onPress={() => onEmail(lead.email)}
            >
              <Icon name="email" size={20} color="#ffffff" />
              <Text style={styles.primaryActionText}>Send Email</Text>
            </TouchableOpacity>
          </View>
          
          {/* Status Update Buttons */}
          <View style={styles.statusUpdateContainer}>
            <Text style={styles.statusUpdateTitle}>Update Status:</Text>
            <View style={styles.statusButtons}>
              {['Hot Lead', 'Qualified', 'Contacted', 'Closed'].map((status) => (
                <TouchableOpacity
                  key={status}
                  style={[
                    styles.statusUpdateButton,
                    lead.status === status && styles.statusUpdateButtonActive
                  ]}
                  onPress={() => onUpdateStatus(lead.id, status)}
                >
                  <Text style={[
                    styles.statusUpdateText,
                    lead.status === status && styles.statusUpdateTextActive
                  ]}>
                    {status}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </ScrollView>
      </LinearGradient>
    </Modal>
  );
};

const DetailRow = ({ icon, label, value }) => (
  <View style={styles.detailRow}>
    <Icon name={icon} size={18} color="#8e8e93" />
    <View style={styles.detailContent}>
      <Text style={styles.detailLabel}>{label}:</Text>
      <Text style={styles.detailValue}>{value}</Text>
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
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 5,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#8e8e93',
    marginBottom: 20,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 10,
    paddingHorizontal: 15,
    marginBottom: 15,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    height: 40,
    color: '#ffffff',
    fontSize: 16,
  },
  filterContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  filterButton: {
    flex: 1,
    padding: 6,
    marginHorizontal: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 6,
    alignItems: 'center',
  },
  filterButtonActive: {
    backgroundColor: '#e94560',
  },
  filterButtonText: {
    color: '#8e8e93',
    fontSize: 10,
    fontWeight: '600',
  },
  filterButtonTextActive: {
    color: '#ffffff',
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
    width: (width - 45) / 2,
    marginBottom: 15,
  },
  statGradient: {
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
    marginVertical: 3,
  },
  statTitle: {
    fontSize: 10,
    color: '#ffffff',
    textAlign: 'center',
  },
  leadsList: {
    padding: 15,
  },
  leadCard: {
    backgroundColor: '#1a1a2e',
    borderRadius: 15,
    padding: 15,
    marginBottom: 15,
  },
  leadHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  leadInfo: {
    flex: 1,
  },
  leadName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 3,
  },
  leadVehicle: {
    fontSize: 14,
    color: '#e94560',
    marginBottom: 2,
  },
  leadSource: {
    fontSize: 12,
    color: '#8e8e93',
  },
  leadMetrics: {
    alignItems: 'center',
  },
  scoreCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  scoreText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#ffffff',
  },
  leadContact: {
    marginBottom: 10,
  },
  contactText: {
    fontSize: 12,
    color: '#8e8e93',
    marginBottom: 2,
  },
  lastContactText: {
    fontSize: 11,
    color: '#667eea',
    fontStyle: 'italic',
  },
  leadActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#2a2a3e',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  actionButtonText: {
    fontSize: 12,
    color: '#ffffff',
    marginLeft: 5,
    fontWeight: '600',
  },
  notesSection: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#2a2a3e',
  },
  notesText: {
    fontSize: 12,
    color: '#8e8e93',
    fontStyle: 'italic',
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
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
  // Modal Styles
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 50,
    borderBottomWidth: 1,
    borderBottomColor: '#2a2a3e',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  leadDetailCard: {
    backgroundColor: '#1a1a2e',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
  },
  leadDetailHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  leadDetailName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  leadDetailScore: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  scoreValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#f5af19',
    marginLeft: 5,
  },
  leadDetailInfo: {
    marginBottom: 15,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  detailContent: {
    marginLeft: 15,
    flex: 1,
  },
  detailLabel: {
    fontSize: 12,
    color: '#8e8e93',
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 14,
    color: '#ffffff',
    fontWeight: '500',
  },
  notesDetail: {
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#2a2a3e',
  },
  notesLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 8,
  },
  notesDetailText: {
    fontSize: 14,
    color: '#8e8e93',
    lineHeight: 20,
  },
  actionButtonsContainer: {
    marginBottom: 20,
  },
  primaryActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  primaryActionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    marginLeft: 8,
  },
  statusUpdateContainer: {
    backgroundColor: '#1a1a2e',
    borderRadius: 15,
    padding: 20,
  },
  statusUpdateTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 15,
  },
  statusButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statusUpdateButton: {
    width: (width - 100) / 2,
    padding: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
  },
  statusUpdateButtonActive: {
    backgroundColor: '#e94560',
  },
  statusUpdateText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#8e8e93',
  },
  statusUpdateTextActive: {
    color: '#ffffff',
  },
});

export default LeadsScreen;