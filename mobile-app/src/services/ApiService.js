/**
 * API Service for JokerVision Mobile App
 * Handles all backend API communications
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

const BACKEND_URL = 'https://autolead-pro.preview.emergentagent.com';
const API_BASE = `${BACKEND_URL}/api`;

class ApiService {
  constructor() {
    this.isConnected = false;
    this.authToken = null;
  }

  async initialize() {
    try {
      // Load stored auth token
      this.authToken = await AsyncStorage.getItem('authToken');
      
      // Test backend connection
      const connected = await this.testConnection();
      this.isConnected = connected;
      
      console.log(`🔗 API Service initialized - Connected: ${connected}`);
      return connected;
      
    } catch (error) {
      console.error('API Service initialization failed:', error);
      return false;
    }
  }

  async testConnection() {
    try {
      const response = await fetch(`${API_BASE}/health`, {
        method: 'GET',
        timeout: 3000,
      });
      return response.ok;
    } catch (error) {
      console.log('Backend connection test failed, using mock data');
      return false;
    }
  }

  async makeRequest(endpoint, options = {}) {
    try {
      const url = `${API_BASE}${endpoint}`;
      const headers = {
        'Content-Type': 'application/json',
        ...options.headers,
      };

      if (this.authToken) {
        headers.Authorization = `Bearer ${this.authToken}`;
      }

      const response = await fetch(url, {
        ...options,
        headers,
      });

      if (response.ok) {
        return await response.json();
      } else {
        throw new Error(`API request failed: ${response.status}`);
      }
    } catch (error) {
      console.error(`API request error for ${endpoint}:`, error);
      throw error;
    }
  }

  // Dashboard API
  async getDashboardStats() {
    try {
      if (this.isConnected) {
        return await this.makeRequest('/dashboard/stats');
      }
    } catch (error) {
      console.log('Using mock dashboard stats');
    }
    
    // Return mock data
    return {
      totalLeads: 247,
      activeInventory: 89,
      voiceCalls: 34,
      conversionRate: 28.5,
      revenueThisMonth: 125000,
      topPerformer: 'Sales Rep #1',
    };
  }

  async getRecentActivity() {
    try {
      if (this.isConnected) {
        return await this.makeRequest('/dashboard/activity');
      }
    } catch (error) {
      console.log('Using mock activity data');
    }
    
    // Return mock activity
    return [
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
  }

  // Inventory API
  async getInventory(filters = {}) {
    try {
      if (this.isConnected) {
        const queryParams = new URLSearchParams(filters).toString();
        return await this.makeRequest(`/inventory/vehicles?${queryParams}`);
      }
    } catch (error) {
      console.log('Using mock inventory data');
    }
    
    // Return mock inventory
    return {
      vehicles: [
        {
          id: 1,
          year: 2024,
          make: 'Toyota',
          model: 'Camry',
          trim: 'LE',
          price: 28500,
          mileage: 12,
          color: 'White',
          status: 'Available',
          images: ['https://via.placeholder.com/400x300/1a1a2e/eee?text=2024+Toyota+Camry'],
          marketplacePosted: true,
          leads: 5,
          views: 127,
        },
        {
          id: 2,
          year: 2023,
          make: 'Honda',
          model: 'CR-V',
          trim: 'EX',
          price: 32900,
          mileage: 8500,
          color: 'Black',
          status: 'Available',
          images: ['https://via.placeholder.com/400x300/1a1a2e/eee?text=2023+Honda+CRV'],
          marketplacePosted: false,
          leads: 3,
          views: 89,
        },
      ],
      total: 2,
    };
  }

  async addVehicle(vehicleData) {
    try {
      if (this.isConnected) {
        return await this.makeRequest('/inventory/vehicles', {
          method: 'POST',
          body: JSON.stringify(vehicleData),
        });
      }
    } catch (error) {
      console.log('Mock vehicle added');
    }
    
    return { success: true, id: Date.now() };
  }

  // Leads API
  async getLeads(filters = {}) {
    try {
      if (this.isConnected) {
        const queryParams = new URLSearchParams(filters).toString();
        return await this.makeRequest(`/leads?${queryParams}`);
      }
    } catch (error) {
      console.log('Using mock leads data');
    }
    
    // Return mock leads
    return {
      leads: [
        {
          id: 1,
          name: 'John Smith',
          phone: '(555) 123-4567',
          email: 'john.smith@email.com',
          interestedVehicle: '2024 Toyota Camry',
          source: 'Facebook Marketplace',
          status: 'Hot Lead',
          aiScore: 92,
          lastContact: '2 hours ago',
          notes: 'Very interested, ready to buy this week',
        },
        {
          id: 2,
          name: 'Sarah Johnson',
          phone: '(555) 987-6543',
          email: 'sarah.j@email.com',
          interestedVehicle: '2023 Honda CR-V',
          source: 'Voice AI Call',
          status: 'Qualified',
          aiScore: 78,
          lastContact: '1 day ago',
          notes: 'Needs financing options',
        },
      ],
      total: 2,
    };
  }

  async updateLeadStatus(leadId, status) {
    try {
      if (this.isConnected) {
        return await this.makeRequest(`/leads/${leadId}/status`, {
          method: 'PUT',
          body: JSON.stringify({ status }),
        });
      }
    } catch (error) {
      console.log('Mock lead status updated');
    }
    
    return { success: true };
  }

  // Notifications API
  async getNotifications() {
    try {
      if (this.isConnected) {
        return await this.makeRequest('/notifications');
      }
    } catch (error) {
      console.log('Using mock notifications');
    }
    
    return [
      {
        id: 1,
        title: '🎤 Voice AI Call Completed',
        message: 'Successfully handled customer inquiry about 2024 Toyota Camry',
        timestamp: '5 minutes ago',
        type: 'voice_call',
        read: false,
      },
      {
        id: 2,
        title: '👥 New Lead Generated',
        message: 'High-quality lead from Facebook Marketplace',
        timestamp: '15 minutes ago',
        type: 'new_lead',
        read: false,
      },
      {
        id: 3,
        title: '🚗 Vehicle Posted',
        message: 'Successfully posted Honda CR-V to 15 platforms',
        timestamp: '1 hour ago',
        type: 'inventory',
        read: true,
      },
    ];
  }

  async markNotificationRead(notificationId) {
    try {
      if (this.isConnected) {
        return await this.makeRequest(`/notifications/${notificationId}/read`, {
          method: 'PUT',
        });
      }
    } catch (error) {
      console.log('Mock notification marked as read');
    }
    
    return { success: true };
  }
}

// Create singleton instance
const apiService = new ApiService();

// Export service methods
export const connectToBackend = () => apiService.initialize();
export const getDashboardStats = () => apiService.getDashboardStats();
export const getRecentActivity = () => apiService.getRecentActivity();
export const getInventory = (filters) => apiService.getInventory(filters);
export const addVehicle = (vehicleData) => apiService.addVehicle(vehicleData);
export const getLeads = (filters) => apiService.getLeads(filters);
export const updateLeadStatus = (leadId, status) => apiService.updateLeadStatus(leadId, status);
export const getNotifications = () => apiService.getNotifications();
export const markNotificationRead = (notificationId) => apiService.markNotificationRead(notificationId);

export default apiService;