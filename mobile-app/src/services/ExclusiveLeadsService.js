/**
 * Exclusive Leads Service for JokerVision Mobile App
 * Integrates with the new Exclusive Lead Engine backend
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'https://autoleads-engine.preview.emergentagent.com';
const EXCLUSIVE_API_BASE = `${BACKEND_URL}/api/exclusive-leads`;

class ExclusiveLeadsService {
  constructor() {
    this.authToken = null;
    this.lastUpdate = null;
  }

  async initialize() {
    try {
      this.authToken = await AsyncStorage.getItem('authToken') || 'mobile-demo-token';
      console.log('🎯 Exclusive Leads Service initialized');
      return true;
    } catch (error) {
      console.error('Failed to initialize Exclusive Leads Service:', error);
      return false;
    }
  }

  async makeAuthenticatedRequest(endpoint, options = {}) {
    try {
      const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.authToken}`,
        ...options.headers,
      };

      const response = await fetch(`${EXCLUSIVE_API_BASE}${endpoint}`, {
        ...options,
        headers,
        timeout: 15000,
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }

      const data = await response.json();
      return { success: true, data };

    } catch (error) {
      console.error(`Exclusive Leads API Error (${endpoint}):`, error);
      return { success: false, error: error.message };
    }
  }

  async getExclusiveLeads() {
    try {
      const result = await this.makeAuthenticatedRequest('/leads?tenant_id=default');
      
      if (result.success) {
        this.lastUpdate = new Date().toISOString();
        return {
          success: true,
          leads: result.data.exclusive_leads || [],
          lastUpdate: this.lastUpdate,
        };
      } else {
        // Return mock exclusive leads for demo
        return this.getMockExclusiveLeads();
      }
    } catch (error) {
      console.error('Failed to fetch exclusive leads:', error);
      return this.getMockExclusiveLeads();
    }
  }

  async getLeadIntelligence() {
    try {
      const result = await this.makeAuthenticatedRequest('/intelligence?tenant_id=default');
      
      if (result.success) {
        return {
          success: true,
          intelligence: result.data.intelligence,
        };
      } else {
        return this.getMockIntelligence();
      }
    } catch (error) {
      console.error('Failed to fetch lead intelligence:', error);
      return this.getMockIntelligence();
    }
  }

  async getCompetitorAnalysis() {
    try {
      const result = await this.makeAuthenticatedRequest('/competitors?tenant_id=default');
      
      if (result.success) {
        return {
          success: true,
          competitors: result.data.competitor_data,
        };
      } else {
        return this.getMockCompetitorAnalysis();
      }
    } catch (error) {
      console.error('Failed to fetch competitor analysis:', error);
      return this.getMockCompetitorAnalysis();
    }
  }

  async claimExclusiveLead(leadId) {
    try {
      const result = await this.makeAuthenticatedRequest(
        `/claim/${leadId}?tenant_id=default`, 
        { method: 'POST' }
      );
      
      if (result.success) {
        return {
          success: true,
          message: result.data.claim_result.success_message,
          claimData: result.data.claim_result,
        };
      } else {
        throw new Error('Failed to claim exclusive lead');
      }
    } catch (error) {
      console.error('Failed to claim exclusive lead:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  async activateLeadProtection(leadId) {
    try {
      const result = await this.makeAuthenticatedRequest(
        `/activate-protection/${leadId}?tenant_id=default`, 
        { method: 'POST' }
      );
      
      if (result.success) {
        return {
          success: true,
          message: result.data.protection_result.success_message,
          protectionData: result.data.protection_result,
        };
      } else {
        throw new Error('Failed to activate lead protection');
      }
    } catch (error) {
      console.error('Failed to activate lead protection:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  async getRealTimeAlerts() {
    try {
      const result = await this.makeAuthenticatedRequest('/alerts?tenant_id=default');
      
      if (result.success) {
        return {
          success: true,
          alerts: result.data.real_time_alerts || [],
        };
      } else {
        return this.getMockAlerts();
      }
    } catch (error) {
      console.error('Failed to fetch real-time alerts:', error);
      return this.getMockAlerts();
    }
  }

  // Mock data methods for offline/demo mode
  getMockExclusiveLeads() {
    return {
      success: true,
      leads: [
        {
          id: 'exclusive_mobile_001',
          name: 'Sarah Johnson',
          phone: '+1 (555) 123-4567',
          email: 's.johnson.luxury@gmail.com',
          source: 'exclusive',
          exclusivity_level: 'diamond',
          vehicle_interest: '2024 BMW X7 M60i',
          budget: 125000,
          purchase_timeline: 'this_week',
          lead_score: 98,
          exclusivity_expires: new Date(Date.now() + 1800000).toISOString(), // 30 minutes
          competitor_interest: false,
          pre_qualified: true,
          financing_approved: true,
          urgency_factors: ['lease_expiring', 'company_bonus'],
          notes: 'Executive looking for immediate luxury SUV delivery'
        },
        {
          id: 'exclusive_mobile_002',
          name: 'Michael Chen',
          phone: '+1 (555) 987-6543',
          email: 'm.chen.business@outlook.com',
          source: 'exclusive',
          exclusivity_level: 'platinum',
          vehicle_interest: '2024 Ford F-150 Raptor R',
          budget: 98000,
          purchase_timeline: 'within_48_hours',
          lead_score: 95,
          exclusivity_expires: new Date(Date.now() + 3600000).toISOString(), // 1 hour
          competitor_interest: true,
          pre_qualified: true,
          financing_approved: false,
          urgency_factors: ['tax_benefits', 'business_expense'],
          notes: 'Business owner needs truck for company fleet'
        }
      ],
      lastUpdate: new Date().toISOString(),
    };
  }

  getMockIntelligence() {
    return {
      success: true,
      intelligence: {
        total_exclusive_leads: 47,
        avg_exclusivity_duration: '2.3 hours',
        conversion_rate_exclusive: 78.4,
        avg_deal_size_exclusive: 67500,
        competitor_advantage: '340% higher close rate than shared leads',
        ai_prediction_accuracy: 91.8,
      },
    };
  }

  getMockCompetitorAnalysis() {
    return {
      success: true,
      competitors: {
        competitors_monitored: 23,
        our_advantage: {
          lead_exclusivity: '100% vs 0% competitors',
          response_time: '47 seconds vs 8.2 minutes competitors',
          close_rate: '78.4% vs 23.1% competitors',
        },
        market_gaps_identified: 8,
      },
    };
  }

  getMockAlerts() {
    return {
      success: true,
      alerts: [
        {
          id: 'mobile_alert_001',
          type: 'exclusive_lead_expiring',
          priority: 'critical',
          message: 'Diamond-level lead expires in 30 minutes!',
          action_required: 'immediate_contact',
          lead_id: 'exclusive_mobile_001'
        },
        {
          id: 'mobile_alert_002',
          type: 'competitor_activity',
          priority: 'high',
          message: 'Competitor lost high-value BMW lead - opportunity to capture',
          action_required: 'market_positioning',
          opportunity_value: 85000
        }
      ],
    };
  }

  // Utility methods
  calculateTimeRemaining(expirationTime) {
    const now = new Date();
    const expiry = new Date(expirationTime);
    const diff = expiry - now;
    
    if (diff <= 0) return 'EXPIRED';
    
    const hours = Math.floor(diff / 3600000);
    const minutes = Math.floor((diff % 3600000) / 60000);
    
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  }

  formatExclusivityLevel(level) {
    const levels = {
      diamond: { emoji: '💎', color: '#e94560' },
      platinum: { emoji: '🏆', color: '#667eea' },
      gold: { emoji: '🥇', color: '#f5af19' },
      silver: { emoji: '🥈', color: '#8e8e93' }
    };
    return levels[level?.toLowerCase()] || levels.silver;
  }
}

// Export singleton instance
const exclusiveLeadsService = new ExclusiveLeadsService();
export default exclusiveLeadsService;

// Export service class for testing
export { ExclusiveLeadsService };

// Export convenience functions
export const getExclusiveLeads = () => exclusiveLeadsService.getExclusiveLeads();
export const claimExclusiveLead = (leadId) => exclusiveLeadsService.claimExclusiveLead(leadId);
export const activateLeadProtection = (leadId) => exclusiveLeadsService.activateLeadProtection(leadId);
export const getLeadIntelligence = () => exclusiveLeadsService.getLeadIntelligence();
export const getRealTimeAlerts = () => exclusiveLeadsService.getRealTimeAlerts();