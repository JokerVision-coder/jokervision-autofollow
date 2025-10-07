import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import { Button } from './components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './components/ui/card';
import { Badge } from './components/ui/badge';
import { 
  Smartphone, Download, QrCode, Share2, Settings, Users, MessageSquare,
  Bell, Calendar, Phone, Mail, BarChart3, Target, Star, Clock, Zap,
  CheckCircle, AlertCircle, Play, Pause, RefreshCw, Eye, Edit
} from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const MobileApp = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [appStats, setAppStats] = useState({});
  const [appConfig, setAppConfig] = useState({});
  const [pushNotifications, setPushNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showQRCode, setShowQRCode] = useState(false);

  useEffect(() => {
    fetchAppData();
  }, []);

  const fetchAppData = async () => {
    try {
      setLoading(true);
      const [statsRes, configRes, notificationsRes] = await Promise.all([
        axios.get(`${API}/mobile-app/stats?tenant_id=default_dealership`),
        axios.get(`${API}/mobile-app/config?tenant_id=default_dealership`),
        axios.get(`${API}/mobile-app/notifications?tenant_id=default_dealership`)
      ]);

      setAppStats(statsRes.data || {});
      setAppConfig(configRes.data || {});
      setPushNotifications(notificationsRes.data.notifications || []);
    } catch (error) {
      console.error('Error fetching app data:', error);
      loadMockData();
    } finally {
      setLoading(false);
    }
  };

  const loadMockData = () => {
    setAppStats({
      total_downloads: 2847,
      active_users: 1456,
      daily_active_users: 234,
      session_duration: "8:34",
      app_rating: 4.6,
      push_open_rate: 23.4,
      feature_usage: {
        leads: 89,
        appointments: 67,
        inventory: 45,
        chat: 78,
        calculator: 34
      }
    });

    setAppConfig({
      app_name: "JokerVision Mobile",
      version: "2.1.0",
      store_status: "published",
      last_update: "2024-01-20T10:00:00Z",
      supported_platforms: ["ios", "android"],
      features_enabled: [
        "lead_management", "appointment_booking", "inventory_search",
        "chat_support", "push_notifications", "offline_sync", "biometric_auth"
      ],
      app_store_url: "https://apps.apple.com/app/jokervision-mobile",
      play_store_url: "https://play.google.com/store/apps/details?id=com.jokervision.mobile"
    });

    setPushNotifications([
      {
        id: "notif_1",
        title: "New Lead Alert",
        message: "Sarah Johnson inquired about 2024 RAV4",
        sent_at: "2024-01-23T14:30:00Z",
        status: "delivered",
        open_rate: 78,
        recipients: 15
      },
      {
        id: "notif_2", 
        title: "Appointment Reminder",
        message: "Test drive scheduled in 1 hour",
        sent_at: "2024-01-23T13:00:00Z",
        status: "delivered",
        open_rate: 91,
        recipients: 8
      },
      {
        id: "notif_3",
        title: "Daily Sales Report",
        message: "3 vehicles sold today - great work!",
        sent_at: "2024-01-23T18:00:00Z",
        status: "scheduled",
        open_rate: 0,
        recipients: 25
      }
    ]);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="spinner-neon"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6">
      <div className="container mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-glass-bright mb-2">Mobile App</h1>
            <p className="text-glass-muted">React Native companion app for on-the-go lead management</p>
          </div>
          
          <div className="flex gap-3">
            <Button onClick={() => setShowQRCode(true)} className="btn-neon">
              <QrCode className="w-4 h-4 mr-2" />
              Download QR
            </Button>
            <Button className="btn-neon">
              <Download className="w-4 h-4 mr-2" />
              App Stores
            </Button>
            <Button variant="outline" className="text-glass-bright">
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </Button>
          </div>
        </div>

        {/* App Statistics Overview */}
        <AppStatsOverview stats={appStats} />

        {/* Mobile App Preview */}
        <MobileAppPreview config={appConfig} />

        {/* Tabs */}
        <div className="flex gap-4 mb-6">
          <Button
            onClick={() => setActiveTab('overview')}
            className={`${activeTab === 'overview' ? 'bg-purple-600 text-white' : 'text-glass-bright hover:bg-glass'}`}
          >
            <Smartphone className="w-4 h-4 mr-2" />
            Overview
          </Button>
          <Button
            onClick={() => setActiveTab('analytics')}
            className={`${activeTab === 'analytics' ? 'bg-purple-600 text-white' : 'text-glass-bright hover:bg-glass'}`}
          >
            <BarChart3 className="w-4 h-4 mr-2" />
            App Analytics
          </Button>
          <Button
            onClick={() => setActiveTab('notifications')}
            className={`${activeTab === 'notifications' ? 'bg-purple-600 text-white' : 'text-glass-bright hover:bg-glass'}`}
          >
            <Bell className="w-4 h-4 mr-2" />
            Push Notifications
          </Button>
          <Button
            onClick={() => setActiveTab('features')}
            className={`${activeTab === 'features' ? 'bg-purple-600 text-white' : 'text-glass-bright hover:bg-glass'}`}
          >
            <Zap className="w-4 h-4 mr-2" />
            Features
          </Button>
        </div>

        {/* Content Area */}
        {activeTab === 'overview' && <OverviewSection config={appConfig} stats={appStats} />}
        {activeTab === 'analytics' && <AnalyticsSection stats={appStats} />}
        {activeTab === 'notifications' && <NotificationsSection notifications={pushNotifications} />}
        {activeTab === 'features' && <FeaturesSection config={appConfig} />}

        {/* QR Code Modal */}
        {showQRCode && (
          <QRCodeModal onClose={() => setShowQRCode(false)} config={appConfig} />
        )}
      </div>
    </div>
  );
};

// App Statistics Overview Component
const AppStatsOverview = ({ stats }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
      <Card className="glass-card">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-glass-muted">Total Downloads</p>
              <p className="text-2xl font-bold text-glass-bright">
                {(stats.total_downloads || 0).toLocaleString()}
              </p>
            </div>
            <Download className="w-8 h-8 neon-green" />
          </div>
          <div className="flex items-center mt-2 text-sm text-green-400">
            <span className="ml-1">+12% this month</span>
          </div>
        </CardContent>
      </Card>

      <Card className="glass-card">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-glass-muted">Active Users</p>
              <p className="text-2xl font-bold text-glass-bright">
                {(stats.active_users || 0).toLocaleString()}
              </p>
            </div>
            <Users className="w-8 h-8 neon-blue" />
          </div>
          <div className="flex items-center mt-2 text-sm text-blue-400">
            <span className="ml-1">Daily: {stats.daily_active_users || 0}</span>
          </div>
        </CardContent>
      </Card>

      <Card className="glass-card">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-glass-muted">App Rating</p>
              <p className="text-2xl font-bold text-glass-bright">
                {stats.app_rating || 0}
              </p>
            </div>
            <Star className="w-8 h-8 neon-orange" />
          </div>
          <div className="flex items-center mt-2 text-sm text-orange-400">
            <span className="ml-1">4.6/5.0 stars</span>
          </div>
        </CardContent>
      </Card>

      <Card className="glass-card">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-glass-muted">Session Duration</p>
              <p className="text-2xl font-bold text-glass-bright">
                {stats.session_duration || "0:00"}
              </p>
            </div>
            <Clock className="w-8 h-8 neon-purple" />
          </div>
          <div className="flex items-center mt-2 text-sm text-purple-400">
            <span className="ml-1">Avg per session</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Mobile App Preview Component
const MobileAppPreview = ({ config }) => {
  return (
    <Card className="glass-card mb-8">
      <CardContent className="p-6">
        <h3 className="text-xl font-semibold text-glass-bright mb-4">Mobile App Preview</h3>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Phone Mockup */}
          <div className="text-center">
            <div className="mx-auto w-48 h-96 bg-gradient-to-b from-gray-900 to-black rounded-3xl p-4 relative border-4 border-gray-700">
              <div className="w-full h-full bg-gradient-to-b from-purple-900 to-black rounded-2xl p-4 flex flex-col">
                <div className="text-center mb-4">
                  <div className="text-white text-lg font-bold">JokerVision</div>
                  <div className="text-purple-300 text-xs">AutoFollow Mobile</div>
                </div>
                
                <div className="grid grid-cols-2 gap-2 flex-1">
                  <div className="bg-purple-600/20 rounded-lg p-2 text-center">
                    <Users className="w-6 h-6 text-purple-400 mx-auto mb-1" />
                    <div className="text-white text-xs">Leads</div>
                  </div>
                  <div className="bg-blue-600/20 rounded-lg p-2 text-center">
                    <Calendar className="w-6 h-6 text-blue-400 mx-auto mb-1" />
                    <div className="text-white text-xs">Calendar</div>
                  </div>
                  <div className="bg-green-600/20 rounded-lg p-2 text-center">
                    <Phone className="w-6 h-6 text-green-400 mx-auto mb-1" />
                    <div className="text-white text-xs">Calls</div>
                  </div>
                  <div className="bg-orange-600/20 rounded-lg p-2 text-center">
                    <MessageSquare className="w-6 h-6 text-orange-400 mx-auto mb-1" />
                    <div className="text-white text-xs">Messages</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* App Info */}
          <div className="col-span-2">
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-glass-bright mb-2">App Information</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex justify-between">
                    <span className="text-glass-muted">Version:</span>
                    <span className="text-glass-bright">{config.version}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-glass-muted">Status:</span>
                    <Badge className={config.store_status === 'published' ? 'bg-green-600 text-white' : 'bg-yellow-600 text-white'}>
                      {config.store_status?.toUpperCase()}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-glass-muted">Last Update:</span>
                    <span className="text-glass-bright">{new Date(config.last_update).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-glass-muted">Platforms:</span>
                    <div className="flex gap-1">
                      {config.supported_platforms?.map(platform => (
                        <Badge key={platform} className="bg-blue-600 text-white text-xs">
                          {platform.toUpperCase()}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-glass-bright mb-2">Download Links</h4>
                <div className="flex gap-3">
                  <Button className="btn-neon flex-1">
                    <Download className="w-4 h-4 mr-2" />
                    iOS App Store
                  </Button>
                  <Button className="btn-neon flex-1">
                    <Download className="w-4 h-4 mr-2" />
                    Google Play
                  </Button>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-glass-bright mb-2">Key Features</h4>
                <div className="grid grid-cols-2 gap-2">
                  {config.features_enabled?.slice(0, 6).map(feature => (
                    <div key={feature} className="flex items-center text-sm text-glass-muted">
                      <CheckCircle className="w-4 h-4 mr-2 text-green-400" />
                      {feature.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Overview Section Component
const OverviewSection = ({ config, stats }) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card className="glass-card">
        <CardContent className="p-6">
          <h3 className="text-xl font-semibold text-glass-bright mb-4">Feature Usage</h3>
          <div className="space-y-4">
            {Object.entries(stats.feature_usage || {}).map(([feature, usage]) => (
              <div key={feature} className="flex justify-between items-center">
                <span className="text-glass-bright capitalize">{feature}</span>
                <div className="flex items-center gap-2">
                  <div className="w-24 h-2 bg-glass-muted/20 rounded">
                    <div 
                      className="h-2 bg-purple-500 rounded" 
                      style={{width: `${usage}%`}}
                    ></div>
                  </div>
                  <span className="text-glass-bright font-semibold w-8">{usage}%</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="glass-card">
        <CardContent className="p-6">
          <h3 className="text-xl font-semibold text-glass-bright mb-4">App Store Optimization</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-glass-muted">App Store Rating</span>
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star 
                    key={i} 
                    className={`w-4 h-4 ${i < Math.floor(stats.app_rating || 0) ? 'text-yellow-400' : 'text-gray-400'}`} 
                  />
                ))}
                <span className="ml-2 text-glass-bright">{stats.app_rating}</span>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-glass-muted">Push Open Rate</span>
              <span className="text-glass-bright">{stats.push_open_rate}%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-glass-muted">User Retention (7d)</span>
              <span className="text-glass-bright">67%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-glass-muted">Crash Rate</span>
              <span className="text-green-400">0.02%</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Analytics Section Component
const AnalyticsSection = ({ stats }) => {
  return (
    <div className="space-y-6">
      <Card className="glass-card">
        <CardContent className="p-6">
          <h3 className="text-xl font-semibold text-glass-bright mb-4">User Analytics</h3>
          <div className="h-64 flex items-center justify-center text-glass-muted">
            <BarChart3 className="w-16 h-16 mb-4" />
          </div>
          <p className="text-center text-glass-muted">Mobile app analytics chart would appear here</p>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="glass-card">
          <CardContent className="p-6 text-center">
            <Users className="w-12 h-12 mx-auto mb-4 neon-blue" />
            <div className="text-2xl font-bold text-glass-bright">{stats.active_users?.toLocaleString()}</div>
            <div className="text-sm text-glass-muted">Monthly Active Users</div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardContent className="p-6 text-center">
            <Clock className="w-12 h-12 mx-auto mb-4 neon-green" />
            <div className="text-2xl font-bold neon-green">{stats.session_duration}</div>
            <div className="text-sm text-glass-muted">Avg Session Duration</div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardContent className="p-6 text-center">
            <Target className="w-12 h-12 mx-auto mb-4 neon-orange" />
            <div className="text-2xl font-bold neon-orange">89%</div>
            <div className="text-sm text-glass-muted">User Satisfaction</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

// Notifications Section Component
const NotificationsSection = ({ notifications }) => {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold text-glass-bright">Push Notifications</h3>
        <Button className="btn-neon">
          <Bell className="w-4 h-4 mr-2" />
          Send Notification
        </Button>
      </div>

      {notifications.map((notification) => (
        <NotificationCard key={notification.id} notification={notification} />
      ))}
    </div>
  );
};

// Notification Card Component
const NotificationCard = ({ notification }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'delivered': return 'bg-green-600 text-white';
      case 'scheduled': return 'bg-yellow-600 text-white';
      case 'failed': return 'bg-red-600 text-white';
      default: return 'bg-gray-600 text-white';
    }
  };

  return (
    <Card className="glass-card">
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <h4 className="font-semibold text-glass-bright mb-1">{notification.title}</h4>
            <p className="text-glass-muted mb-2">{notification.message}</p>
            <p className="text-xs text-glass-muted">
              Sent: {new Date(notification.sent_at).toLocaleString()}
            </p>
          </div>
          
          <div className="flex flex-col items-end gap-2">
            <Badge className={getStatusColor(notification.status)}>
              {notification.status.toUpperCase()}
            </Badge>
            <div className="text-sm text-glass-muted">
              {notification.recipients} recipients
            </div>
          </div>
        </div>

        <div className="flex justify-between items-center pt-4 border-t border-glass-muted/20">
          <div className="text-sm text-glass-muted">
            Open Rate: <span className="text-glass-bright font-semibold">{notification.open_rate}%</span>
          </div>
          
          <div className="flex gap-2">
            <Button size="sm" variant="outline" className="text-glass-bright">
              <Eye className="w-3 h-3 mr-1" />
              View
            </Button>
            <Button size="sm" variant="outline" className="text-glass-bright">
              <Edit className="w-3 h-3 mr-1" />
              Edit
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Features Section Component
const FeaturesSection = ({ config }) => {
  const allFeatures = [
    { id: 'lead_management', name: 'Lead Management', description: 'View and manage leads on the go' },
    { id: 'appointment_booking', name: 'Appointment Booking', description: 'Schedule and manage appointments' },
    { id: 'inventory_search', name: 'Inventory Search', description: 'Browse vehicle inventory' },
    { id: 'chat_support', name: 'Chat Support', description: 'Real-time customer communication' },
    { id: 'push_notifications', name: 'Push Notifications', description: 'Instant alerts and updates' },
    { id: 'offline_sync', name: 'Offline Sync', description: 'Work offline and sync when connected' },
    { id: 'biometric_auth', name: 'Biometric Auth', description: 'Secure fingerprint/face ID login' },
    { id: 'voice_calls', name: 'Voice Calls', description: 'Make calls directly from the app' },
    { id: 'document_scanner', name: 'Document Scanner', description: 'Scan and upload documents' },
    { id: 'gps_tracking', name: 'GPS Tracking', description: 'Location-based features' }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {allFeatures.map((feature) => {
        const isEnabled = config.features_enabled?.includes(feature.id);
        
        return (
          <Card key={feature.id} className={`glass-card ${isEnabled ? 'border-green-500' : 'border-gray-500'} border-2`}>
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h4 className="font-semibold text-glass-bright">{feature.name}</h4>
                  <p className="text-sm text-glass-muted">{feature.description}</p>
                </div>
                {isEnabled ? (
                  <CheckCircle className="w-6 h-6 text-green-400" />
                ) : (
                  <AlertCircle className="w-6 h-6 text-gray-400" />
                )}
              </div>
              
              <Badge className={isEnabled ? 'bg-green-600 text-white' : 'bg-gray-600 text-white'}>
                {isEnabled ? 'Enabled' : 'Disabled'}
              </Badge>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

// QR Code Modal Component
const QRCodeModal = ({ onClose, config }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="glass-card max-w-md w-full mx-4">
        <CardContent className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-semibold text-glass-bright">Download App</h3>
            <Button onClick={onClose} size="sm" variant="outline" className="text-glass-bright">
              ✕
            </Button>
          </div>

          <div className="text-center">
            <div className="w-48 h-48 mx-auto mb-4 bg-white rounded-lg p-4 flex items-center justify-center">
              <QrCode className="w-32 h-32 text-black" />
            </div>
            
            <h4 className="text-lg font-semibold text-glass-bright mb-2">Scan to Download</h4>
            <p className="text-glass-muted mb-6">Use your phone's camera to scan this QR code and download the JokerVision mobile app</p>
            
            <div className="flex gap-3">
              <Button className="btn-neon flex-1">
                <Share2 className="w-4 h-4 mr-2" />
                Share QR Code
              </Button>
              <Button onClick={onClose} variant="outline" className="text-glass-bright">
                Close
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MobileApp;