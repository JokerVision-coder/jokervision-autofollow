/**
 * LeadCard Component
 * Reusable lead display card for leads screens
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';

const { width } = Dimensions.get('window');

const LeadCard = ({ 
  lead, 
  onPress, 
  onCall, 
  onMessage, 
  onScheduleAppointment,
  style 
}) => {
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'new':
        return '#11998e';
      case 'contacted':
        return '#667eea';
      case 'qualified':
        return '#f5af19';
      case 'appointment':
        return '#e94560';
      case 'converted':
        return '#11998e';
      case 'lost':
        return '#8e8e93';
      default:
        return '#8e8e93';
    }
  };

  const getSourceIcon = (source) => {
    switch (source?.toLowerCase()) {
      case 'facebook':
        return 'facebook';
      case 'website':
        return 'language';
      case 'voice_ai':
        return 'mic';
      case 'exclusive':
        return 'star';
      case 'referral':
        return 'people';
      default:
        return 'person';
    }
  };

  const getSourceColor = (source) => {
    switch (source?.toLowerCase()) {
      case 'exclusive':
        return '#e94560';
      case 'facebook':
        return '#4267B2';
      case 'voice_ai':
        return '#667eea';
      case 'referral':
        return '#11998e';
      default:
        return '#8e8e93';
    }
  };

  const formatTimeAgo = (timestamp) => {
    if (!timestamp) return 'Unknown';
    
    // Simple time formatting - in production use a proper date library
    const now = new Date();
    const time = new Date(timestamp);
    const diff = now - time;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  const formatBudget = (budget) => {
    if (!budget) return 'Not specified';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(budget);
  };

  return (
    <TouchableOpacity 
      style={[styles.container, style]} 
      onPress={() => onPress?.(lead)}
      activeOpacity={0.8}
    >
      <LinearGradient
        colors={['#1a1a2e', '#16213e', '#0f3460']}
        style={styles.gradientContainer}
      >
        {/* Header */}
        <View style={styles.headerContainer}>
          <View style={styles.leadInfo}>
            <Text style={styles.leadName} numberOfLines={1}>
              {lead.first_name} {lead.last_name}
            </Text>
            <View style={styles.sourceContainer}>
              <Icon 
                name={getSourceIcon(lead.source)} 
                size={14} 
                color={getSourceColor(lead.source)} 
              />
              <Text style={[styles.sourceText, { color: getSourceColor(lead.source) }]}>
                {lead.source?.replace('_', ' ').toUpperCase() || 'UNKNOWN'}
              </Text>
            </View>
          </View>

          <View style={styles.statusTimeContainer}>
            <View 
              style={[
                styles.statusBadge, 
                { backgroundColor: getStatusColor(lead.status) }
              ]}
            >
              <Text style={styles.statusText}>
                {lead.status?.toUpperCase() || 'NEW'}
              </Text>
            </View>
            <Text style={styles.timeText}>
              {formatTimeAgo(lead.created_at)}
            </Text>
          </View>
        </View>

        {/* Contact Information */}
        <View style={styles.contactContainer}>
          {lead.email && (
            <View style={styles.contactRow}>
              <Icon name="email" size={14} color="#8e8e93" />
              <Text style={styles.contactText} numberOfLines={1}>
                {lead.email}
              </Text>
            </View>
          )}
          {lead.primary_phone && (
            <View style={styles.contactRow}>
              <Icon name="phone" size={14} color="#8e8e93" />
              <Text style={styles.contactText} numberOfLines={1}>
                {lead.primary_phone}
              </Text>
            </View>
          )}
        </View>

        {/* Vehicle Interest & Budget */}
        {(lead.vehicle_interest || lead.budget) && (
          <View style={styles.interestContainer}>
            {lead.vehicle_interest && (
              <View style={styles.interestRow}>
                <Icon name="directions-car" size={14} color="#667eea" />
                <Text style={styles.interestText} numberOfLines={1}>
                  {lead.vehicle_interest}
                </Text>
              </View>
            )}
            {lead.budget && (
              <View style={styles.budgetRow}>
                <Icon name="attach-money" size={14} color="#11998e" />
                <Text style={styles.budgetText}>
                  {formatBudget(lead.budget)}
                </Text>
              </View>
            )}
          </View>
        )}

        {/* Notes/Message Preview */}
        {lead.notes && (
          <View style={styles.notesContainer}>
            <Text style={styles.notesText} numberOfLines={2}>
              "{lead.notes}"
            </Text>
          </View>
        )}

        {/* Urgency Indicators */}
        {lead.urgency_factors && lead.urgency_factors.length > 0 && (
          <View style={styles.urgencyContainer}>
            <Icon name="priority-high" size={12} color="#e94560" />
            <Text style={styles.urgencyText} numberOfLines={1}>
              {lead.urgency_factors.slice(0, 2).join(', ')}
            </Text>
          </View>
        )}

        {/* Action Buttons */}
        <View style={styles.actionContainer}>
          <TouchableOpacity
            style={[styles.actionButton, styles.callButton]}
            onPress={() => onCall?.(lead)}
          >
            <Icon name="call" size={16} color="#ffffff" />
            <Text style={styles.actionButtonText}>Call</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.messageButton]}
            onPress={() => onMessage?.(lead)}
          >
            <Icon name="message" size={16} color="#ffffff" />
            <Text style={styles.actionButtonText}>Text</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.appointmentButton]}
            onPress={() => onScheduleAppointment?.(lead)}
          >
            <Icon name="event" size={16} color="#ffffff" />
            <Text style={styles.actionButtonText}>Meet</Text>
          </TouchableOpacity>
        </View>

        {/* Lead Score (if available) */}
        {lead.lead_score && (
          <View style={styles.scoreContainer}>
            <Text style={styles.scoreLabel}>Score:</Text>
            <View style={[
              styles.scoreBar,
              { backgroundColor: lead.lead_score > 80 ? '#11998e' : 
                                 lead.lead_score > 60 ? '#f5af19' : '#e94560' }
            ]}>
              <Text style={styles.scoreText}>{lead.lead_score}</Text>
            </View>
          </View>
        )}
      </LinearGradient>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 15,
    marginVertical: 6,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 6,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
  gradientContainer: {
    padding: 15,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  leadInfo: {
    flex: 1,
  },
  leadName: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  sourceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sourceText: {
    fontSize: 10,
    fontWeight: '600',
    marginLeft: 4,
  },
  statusTimeContainer: {
    alignItems: 'flex-end',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    marginBottom: 4,
  },
  statusText: {
    color: '#ffffff',
    fontSize: 9,
    fontWeight: 'bold',
  },
  timeText: {
    color: '#8e8e93',
    fontSize: 10,
  },
  contactContainer: {
    marginBottom: 10,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 3,
  },
  contactText: {
    color: '#ffffff',
    fontSize: 12,
    marginLeft: 6,
    flex: 1,
  },
  interestContainer: {
    marginBottom: 10,
  },
  interestRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 3,
  },
  interestText: {
    color: '#667eea',
    fontSize: 12,
    marginLeft: 6,
    flex: 1,
    fontWeight: '500',
  },
  budgetRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  budgetText: {
    color: '#11998e',
    fontSize: 12,
    marginLeft: 6,
    fontWeight: '600',
  },
  notesContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    padding: 8,
    borderRadius: 6,
    marginBottom: 10,
  },
  notesText: {
    color: '#ffffff',
    fontSize: 11,
    fontStyle: 'italic',
  },
  urgencyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: 'rgba(233, 69, 96, 0.1)',
    borderRadius: 4,
  },
  urgencyText: {
    color: '#e94560',
    fontSize: 10,
    marginLeft: 4,
    fontWeight: '500',
  },
  actionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    flex: 0.3,
  },
  callButton: {
    backgroundColor: '#11998e',
  },
  messageButton: {
    backgroundColor: '#667eea',
  },
  appointmentButton: {
    backgroundColor: '#e94560',
  },
  actionButtonText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '600',
    marginLeft: 4,
  },
  scoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  scoreLabel: {
    color: '#8e8e93',
    fontSize: 10,
    marginRight: 6,
  },
  scoreBar: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  scoreText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: 'bold',
  },
});

export default LeadCard;