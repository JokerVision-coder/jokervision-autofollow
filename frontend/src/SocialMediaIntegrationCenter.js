import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { Button } from './components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './components/ui/card';
import { Input } from './components/ui/input';
import { Label } from './components/ui/label';
import { Badge } from './components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './components/ui/select';
import { Checkbox } from './components/ui/checkbox';
import { Switch } from './components/ui/switch';
import { 
  Facebook, 
  Instagram, 
  Twitter, 
  Linkedin, 
  Youtube, 
  MessageSquare, 
  Mail, 
  Phone,
  Globe,
  Link as LinkIcon, 
  Settings, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  Zap, 
  Shield, 
  Key,
  Eye,
  EyeOff,
  RefreshCw,
  Plus,
  Trash2,
  Edit,
  Share2,
  BarChart3,
  Users,
  Bell,
  Calendar,
  Camera,
  Video,
  Smartphone,
  Monitor,
  Wifi,
  Cloud,
  Database,
  CreditCard,
  TrendingUp,
  Target,
  Search,
  Star,
  Heart,
  MessageCircle,
  Send,
  PlayCircle,
  Mic,
  MapPin,
  DollarSign,
  ShoppingCart,
  Briefcase
} from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const SocialMediaIntegrationCenter = () => {
  const [activeTab, setActiveTab] = useState('accounts');
  const [connectedAccounts, setConnectedAccounts] = useState([]);
  const [availableIntegrations, setAvailableIntegrations] = useState([]);
  const [automationRules, setAutomationRules] = useState([]);
  const [showAddAccount, setShowAddAccount] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState('');
  const [credentials, setCredentials] = useState({});
  const [loading, setLoading] = useState(false);

  // Comprehensive list of all possible integrations
  const platformCategories = {
    social_media: {
      name: 'Social Media Platforms',
      icon: Users,
      platforms: [
        { id: 'facebook_personal', name: 'Facebook Personal', icon: Facebook, color: 'text-blue-600', description: 'Personal Facebook profile for networking and personal branding' },
        { id: 'facebook_business', name: 'Facebook Business Page', icon: Facebook, color: 'text-blue-700', description: 'Business page for dealership marketing and customer engagement' },
        { id: 'instagram_personal', name: 'Instagram Personal', icon: Instagram, color: 'text-pink-500', description: 'Personal Instagram account for lifestyle and behind-the-scenes content' },
        { id: 'instagram_business', name: 'Instagram Business', icon: Instagram, color: 'text-pink-600', description: 'Business Instagram for vehicle showcases and marketing' },
        { id: 'twitter', name: 'Twitter/X', icon: Twitter, color: 'text-sky-500', description: 'Professional Twitter for industry news and customer service' },
        { id: 'linkedin_personal', name: 'LinkedIn Personal', icon: Linkedin, color: 'text-blue-700', description: 'Personal LinkedIn profile for professional networking' },
        { id: 'linkedin_company', name: 'LinkedIn Company Page', icon: Linkedin, color: 'text-blue-800', description: 'Company LinkedIn page for B2B marketing and recruitment' },
        { id: 'tiktok', name: 'TikTok', icon: PlayCircle, color: 'text-black', description: 'TikTok for viral vehicle content and younger demographics' },
        { id: 'youtube', name: 'YouTube Channel', icon: Youtube, color: 'text-red-600', description: 'YouTube channel for vehicle reviews and dealership tours' },
        { id: 'snapchat', name: 'Snapchat Business', icon: Camera, color: 'text-yellow-500', description: 'Snapchat for location-based marketing and AR experiences' }
      ]
    },
    marketplace_platforms: {
      name: 'Vehicle Marketplaces',
      icon: ShoppingCart,
      platforms: [
        { id: 'facebook_marketplace', name: 'Facebook Marketplace', icon: Facebook, color: 'text-blue-600', description: 'Primary vehicle listing platform with massive reach' },
        { id: 'autotrader', name: 'AutoTrader', icon: Globe, color: 'text-orange-600', description: 'Leading automotive marketplace for vehicle listings' },
        { id: 'cars_com', name: 'Cars.com', icon: Globe, color: 'text-blue-800', description: 'Major automotive marketplace and research platform' },
        { id: 'cargurus', name: 'CarGurus', icon: Globe, color: 'text-green-600', description: 'Data-driven automotive marketplace with price analysis' },
        { id: 'craigslist', name: 'Craigslist', icon: Globe, color: 'text-purple-600', description: 'Local classified ads platform for vehicle sales' },
        { id: 'ebay_motors', name: 'eBay Motors', icon: Globe, color: 'text-blue-500', description: 'Auction and fixed-price vehicle sales platform' },
        { id: 'vroom', name: 'Vroom', icon: Globe, color: 'text-red-500', description: 'Online vehicle buying and selling platform' },
        { id: 'carvana', name: 'Carvana', icon: Globe, color: 'text-blue-400', description: 'Digital automotive retail platform' }
      ]
    },
    communication_tools: {
      name: 'Communication & Messaging',
      icon: MessageSquare,
      platforms: [
        { id: 'whatsapp_business', name: 'WhatsApp Business', icon: MessageSquare, color: 'text-green-600', description: 'Professional WhatsApp for customer communication' },
        { id: 'messenger', name: 'Facebook Messenger', icon: MessageCircle, color: 'text-blue-600', description: 'Facebook Messenger for instant customer support' },
        { id: 'gmail', name: 'Gmail', icon: Mail, color: 'text-red-500', description: 'Gmail account for professional email communication' },
        { id: 'outlook', name: 'Microsoft Outlook', icon: Mail, color: 'text-blue-600', description: 'Outlook for enterprise email and calendar integration' },
        { id: 'twilio_sms', name: 'Twilio SMS', icon: Phone, color: 'text-red-600', description: 'Professional SMS marketing and communication platform' },
        { id: 'slack', name: 'Slack Workspace', icon: MessageSquare, color: 'text-purple-600', description: 'Team communication and workflow integration' },
        { id: 'telegram', name: 'Telegram Business', icon: Send, color: 'text-blue-500', description: 'Telegram for secure business communications' }
      ]
    },
    crm_sales_tools: {
      name: 'CRM & Sales Management',
      icon: Briefcase,
      platforms: [
        { id: 'salesforce', name: 'Salesforce CRM', icon: Cloud, color: 'text-blue-600', description: 'Enterprise CRM for comprehensive customer management' },
        { id: 'hubspot', name: 'HubSpot CRM', icon: Database, color: 'text-orange-500', description: 'All-in-one CRM, marketing, and sales platform' },
        { id: 'pipedrive', name: 'Pipedrive', icon: TrendingUp, color: 'text-green-600', description: 'Sales-focused CRM with pipeline management' },
        { id: 'zoho_crm', name: 'Zoho CRM', icon: Database, color: 'text-red-600', description: 'Comprehensive business CRM solution' },
        { id: 'dealertrack', name: 'DealerTrack', icon: Briefcase, color: 'text-blue-800', description: 'Automotive industry-specific CRM and DMS' },
        { id: 'reynolds_reynolds', name: 'Reynolds & Reynolds', icon: Monitor, color: 'text-gray-600', description: 'Automotive dealership management system' }
      ]
    },
    review_reputation: {
      name: 'Reviews & Reputation Management',
      icon: Star,
      platforms: [
        { id: 'google_my_business', name: 'Google My Business', icon: Globe, color: 'text-blue-600', description: 'Google business listing and review management' },
        { id: 'yelp_business', name: 'Yelp Business', icon: Star, color: 'text-red-600', description: 'Yelp business profile and review monitoring' },
        { id: 'dealerrater', name: 'DealerRater', icon: Star, color: 'text-blue-500', description: 'Automotive industry review platform' },
        { id: 'cars_com_reviews', name: 'Cars.com Reviews', icon: Star, color: 'text-blue-800', description: 'Vehicle and dealership review platform' },
        { id: 'better_business_bureau', name: 'Better Business Bureau', icon: Shield, color: 'text-blue-700', description: 'BBB business profile and accreditation' },
        { id: 'trustpilot', name: 'Trustpilot', icon: Star, color: 'text-green-600', description: 'Customer review and trust platform' }
      ]
    },
    analytics_advertising: {
      name: 'Analytics & Advertising',
      icon: BarChart3,
      platforms: [
        { id: 'google_analytics', name: 'Google Analytics', icon: BarChart3, color: 'text-orange-500', description: 'Website traffic and user behavior analytics' },
        { id: 'facebook_ads', name: 'Facebook Ads Manager', icon: Target, color: 'text-blue-600', description: 'Facebook and Instagram advertising platform' },
        { id: 'google_ads', name: 'Google Ads', icon: Target, color: 'text-blue-500', description: 'Google search and display advertising' },
        { id: 'facebook_pixel', name: 'Facebook Pixel', icon: Eye, color: 'text-blue-700', description: 'Facebook conversion tracking and optimization' },
        { id: 'google_tag_manager', name: 'Google Tag Manager', icon: Settings, color: 'text-blue-600', description: 'Website tag and analytics management' },
        { id: 'hotjar', name: 'Hotjar', icon: Eye, color: 'text-red-500', description: 'Website heatmaps and user session recordings' }
      ]
    },
    calendar_scheduling: {
      name: 'Calendar & Scheduling',
      icon: Calendar,
      platforms: [
        { id: 'google_calendar', name: 'Google Calendar', icon: Calendar, color: 'text-blue-600', description: 'Google calendar for appointment scheduling' },
        { id: 'outlook_calendar', name: 'Outlook Calendar', icon: Calendar, color: 'text-blue-700', description: 'Microsoft calendar integration' },
        { id: 'calendly', name: 'Calendly', icon: Clock, color: 'text-blue-500', description: 'Automated appointment scheduling platform' },
        { id: 'acuity', name: 'Acuity Scheduling', icon: Calendar, color: 'text-orange-500', description: 'Advanced appointment booking system' },
        { id: 'apple_calendar', name: 'Apple Calendar', icon: Calendar, color: 'text-gray-800', description: 'Apple calendar and scheduling integration' }
      ]
    },
    payment_financial: {
      name: 'Payment & Financial Tools',
      icon: CreditCard,
      platforms: [
        { id: 'stripe', name: 'Stripe Payments', icon: CreditCard, color: 'text-purple-600', description: 'Online payment processing and invoicing' },
        { id: 'paypal', name: 'PayPal Business', icon: CreditCard, color: 'text-blue-500', description: 'PayPal payment processing and invoicing' },
        { id: 'square', name: 'Square', icon: CreditCard, color: 'text-black', description: 'Point-of-sale and payment processing' },
        { id: 'quickbooks', name: 'QuickBooks', icon: DollarSign, color: 'text-blue-600', description: 'Accounting and financial management software' },
        { id: 'dealertrack_financing', name: 'DealerTrack Financing', icon: DollarSign, color: 'text-green-600', description: 'Automotive financing and lending platform' }
      ]
    }
  };

  useEffect(() => {
    initializeIntegrationCenter();
  }, []);

  const initializeIntegrationCenter = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchConnectedAccounts(),
        fetchAvailableIntegrations(),
        fetchAutomationRules()
      ]);
    } catch (error) {
      console.error('Error initializing integration center:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchConnectedAccounts = async () => {
    // Mock data for connected accounts
    setConnectedAccounts([
      {
        id: 'fb_personal_001',
        platform: 'facebook_personal',
        name: 'John Smith Personal',
        username: '@johnsmith.automotive',
        status: 'connected',
        permissions: ['post', 'read', 'manage'],
        lastSync: '2 minutes ago',
        followers: '2.3K',
        engagement: '4.2%',
        postsToday: 3
      },
      {
        id: 'ig_business_001', 
        platform: 'instagram_business',
        name: 'Smith Auto Sales',
        username: '@smithautosales',
        status: 'connected',
        permissions: ['post', 'read', 'manage', 'ads'],
        lastSync: '5 minutes ago',
        followers: '8.7K',
        engagement: '6.8%',
        postsToday: 5
      },
      {
        id: 'gmail_001',
        platform: 'gmail',
        name: 'john.smith@smithautosales.com',
        username: 'john.smith@smithautosales.com',
        status: 'connected',
        permissions: ['read', 'send'],
        lastSync: '1 minute ago',
        emailsToday: 23,
        responseRate: '94%'
      },
      {
        id: 'gads_001',
        platform: 'google_ads',
        name: 'Smith Auto Sales Ads',
        username: 'Ad Account: 123-456-7890',
        status: 'warning',
        permissions: ['read', 'manage'],
        lastSync: '2 hours ago',
        spend: '$1,247',
        conversions: 12
      }
    ]);
  };

  const fetchAvailableIntegrations = async () => {
    const allPlatforms = Object.values(platformCategories).flatMap(cat => cat.platforms);
    setAvailableIntegrations(allPlatforms);
  };

  const fetchAutomationRules = async () => {
    setAutomationRules([
      {
        id: 'auto_001',
        name: 'Cross-Platform Vehicle Posts',
        description: 'Automatically post new vehicles to Facebook, Instagram, and Twitter',
        platforms: ['facebook_business', 'instagram_business', 'twitter'],
        trigger: 'new_inventory',
        status: 'active',
        executions: 47
      },
      {
        id: 'auto_002', 
        name: 'Lead Follow-up Sequence',
        description: 'Send automated email and SMS sequences to new leads',
        platforms: ['gmail', 'twilio_sms'],
        trigger: 'new_lead',
        status: 'active',
        executions: 128
      },
      {
        id: 'auto_003',
        name: 'Review Response Automation',
        description: 'Auto-respond to Google and Yelp reviews with personalized messages',
        platforms: ['google_my_business', 'yelp_business'],
        trigger: 'new_review',
        status: 'paused',
        executions: 23
      }
    ]);
  };

  const connectPlatform = async (platformId) => {
    setLoading(true);
    try {
      // Simulate OAuth connection flow
      toast.info(`🔗 Redirecting to ${platformId} authentication...`);
      
      setTimeout(() => {
        toast.success(`✅ Successfully connected ${platformId}! Integration is now active.`);
        
        // Add to connected accounts
        const platform = availableIntegrations.find(p => p.id === platformId);
        const newAccount = {
          id: `${platformId}_${Date.now()}`,
          platform: platformId,
          name: `${platform.name} Account`,
          username: `@your${platformId}account`,
          status: 'connected',
          permissions: ['read', 'post', 'manage'],
          lastSync: 'Just now',
          followers: Math.floor(Math.random() * 10000) + 1000,
          engagement: `${(Math.random() * 5 + 2).toFixed(1)}%`,
          postsToday: Math.floor(Math.random() * 10)
        };
        
        setConnectedAccounts(prev => [...prev, newAccount]);
        setShowAddAccount(false);
      }, 2000);
      
    } catch (error) {
      toast.error(`❌ Failed to connect ${platformId}. Please try again.`);
    } finally {
      setLoading(false);
    }
  };

  const disconnectAccount = async (accountId) => {
    try {
      setConnectedAccounts(prev => prev.filter(acc => acc.id !== accountId));
      toast.success('✅ Account disconnected successfully');
    } catch (error) {
      toast.error('❌ Failed to disconnect account');
    }
  };

  const syncAccount = async (accountId) => {
    try {
      toast.info('🔄 Syncing account data...');
      
      setTimeout(() => {
        setConnectedAccounts(prev => prev.map(acc => 
          acc.id === accountId 
            ? { ...acc, lastSync: 'Just now' }
            : acc
        ));
        toast.success('✅ Account synced successfully');
      }, 1500);
      
    } catch (error) {
      toast.error('❌ Failed to sync account');
    }
  };

  const renderAccountsTab = () => (
    <div className="space-y-6">
      {/* Connected Accounts Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-blue-900/40 to-blue-800/40 backdrop-blur-lg border border-blue-500/30">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-300">Connected Accounts</p>
                <p className="text-2xl font-bold text-white">{connectedAccounts.length}</p>
              </div>
              <Users className="w-8 h-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-900/40 to-green-800/40 backdrop-blur-lg border border-green-500/30">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-300">Active Integrations</p>
                <p className="text-2xl font-bold text-white">{connectedAccounts.filter(acc => acc.status === 'connected').length}</p>
              </div>
              <CheckCircle2 className="w-8 h-8 text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-900/40 to-orange-800/40 backdrop-blur-lg border border-orange-500/30">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-orange-300">Need Attention</p>
                <p className="text-2xl font-bold text-white">{connectedAccounts.filter(acc => acc.status === 'warning').length}</p>
              </div>
              <AlertCircle className="w-8 h-8 text-orange-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-indigo-900/40 to-indigo-800/40 backdrop-blur-lg border border-indigo-500/30">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-indigo-300">Auto Rules</p>
                <p className="text-2xl font-bold text-white">{automationRules.filter(rule => rule.status === 'active').length}</p>
              </div>
              <Zap className="w-8 h-8 text-indigo-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Connected Accounts List */}
      <Card className="bg-gradient-to-br from-gray-900/60 to-gray-800/60 backdrop-blur-lg border border-gray-500/30">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl text-white">Connected Accounts</CardTitle>
            <Dialog open={showAddAccount} onOpenChange={setShowAddAccount}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-blue-600 to-cyan-600">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Account
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="text-2xl">Add New Integration</DialogTitle>
                </DialogHeader>
                <AddAccountModal 
                  platformCategories={platformCategories}
                  onConnect={connectPlatform}
                  loading={loading}
                />
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {connectedAccounts.map((account) => (
              <div key={account.id} className="flex items-center justify-between p-4 bg-gray-800/40 rounded-xl">
                <div className="flex items-center gap-4">
                  <div className={`w-3 h-3 rounded-full ${
                    account.status === 'connected' ? 'bg-green-500' :
                    account.status === 'warning' ? 'bg-orange-500' : 
                    'bg-red-500'
                  }`}></div>
                  
                  <div className="w-12 h-12 bg-gray-700 rounded-lg flex items-center justify-center">
                    {getPlatformIcon(account.platform)}
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-white">{account.name}</h4>
                    <p className="text-sm text-gray-300">{account.username}</p>
                    <p className="text-xs text-gray-400">Last sync: {account.lastSync}</p>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <div className="text-right">
                    {account.followers && (
                      <p className="text-sm text-white">{account.followers} followers</p>
                    )}
                    {account.engagement && (
                      <p className="text-xs text-gray-400">{account.engagement} engagement</p>
                    )}
                    {account.emailsToday && (
                      <p className="text-sm text-white">{account.emailsToday} emails today</p>
                    )}
                    {account.spend && (
                      <p className="text-sm text-white">${account.spend} spent</p>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => syncAccount(account.id)}
                      className="border-gray-600"
                    >
                      <RefreshCw className="w-4 h-4" />
                    </Button>
                    
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-gray-600"
                    >
                      <Settings className="w-4 h-4" />
                    </Button>
                    
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => disconnectAccount(account.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const getPlatformIcon = (platformId) => {
    const iconMap = {
      facebook_personal: <Facebook className="w-6 h-6 text-blue-600" />,
      facebook_business: <Facebook className="w-6 h-6 text-blue-700" />,
      instagram_personal: <Instagram className="w-6 h-6 text-pink-500" />,
      instagram_business: <Instagram className="w-6 h-6 text-pink-600" />,
      gmail: <Mail className="w-6 h-6 text-red-500" />,
      google_ads: <Target className="w-6 h-6 text-blue-500" />,
      twitter: <Twitter className="w-6 h-6 text-sky-500" />,
      linkedin_personal: <Linkedin className="w-6 h-6 text-blue-700" />,
      youtube: <Youtube className="w-6 h-6 text-red-600" />,
    };
    
    return iconMap[platformId] || <Globe className="w-6 h-6 text-gray-400" />;
  };

  const AddAccountModal = ({ platformCategories, onConnect, loading }) => (
    <div className="space-y-6">
      {Object.entries(platformCategories).map(([categoryKey, category]) => (
        <div key={categoryKey}>
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <category.icon className="w-5 h-5" />
            {category.name}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {category.platforms.map((platform) => {
              const isConnected = connectedAccounts.some(acc => acc.platform === platform.id);
              return (
                <div key={platform.id} className="p-4 bg-gray-800/40 rounded-lg border border-gray-600">
                  <div className="flex items-start gap-3">
                    <platform.icon className={`w-8 h-8 ${platform.color} flex-shrink-0 mt-1`} />
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold text-white">{platform.name}</h4>
                        {isConnected && <Badge className="bg-green-500 text-xs">Connected</Badge>}
                      </div>
                      <p className="text-sm text-gray-300 mb-3">{platform.description}</p>
                      <Button
                        size="sm"
                        onClick={() => onConnect(platform.id)}
                        disabled={loading || isConnected}
                        className={isConnected ? "bg-gray-600" : "bg-gradient-to-r from-blue-600 to-cyan-600"}
                      >
                        {isConnected ? (
                          <>
                            <CheckCircle2 className="w-4 h-4 mr-2" />
                            Connected
                          </>
                        ) : loading ? (
                          <>
                            <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                            Connecting...
                          </>
                        ) : (
                          <>
                            <LinkIcon className="w-4 h-4 mr-2" />
                            Connect
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-cyan-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-600 bg-clip-text text-transparent mb-4">
            🔗 Social Media & App Integration Center
          </h1>
          <p className="text-xl text-gray-300 mb-2">Connect and manage all your personal and business accounts</p>
          <p className="text-lg text-cyan-400 font-semibold">
            Unified Account Management • Cross-Platform Automation • Complete Integration Control
          </p>
        </motion.div>

        {/* Navigation */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 glass-card mb-8">
            <TabsTrigger value="accounts" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Connected Accounts
            </TabsTrigger>
            <TabsTrigger value="integrations" className="flex items-center gap-2">
              <Globe className="w-4 h-4" />
              Available Integrations
            </TabsTrigger>
            <TabsTrigger value="automation" className="flex items-center gap-2">
              <Zap className="w-4 h-4" />
              Automation Rules
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Integration Analytics
            </TabsTrigger>
          </TabsList>

          <TabsContent value="accounts">
            {renderAccountsTab()}
          </TabsContent>

          <TabsContent value="integrations">
            <Card className="bg-gradient-to-br from-gray-900/60 to-gray-800/60 backdrop-blur-lg border border-gray-500/30">
              <CardHeader>
                <CardTitle className="text-2xl text-white">Available Integrations</CardTitle>
                <CardDescription className="text-gray-300">
                  Connect your personal and business accounts across all major platforms
                </CardDescription>
              </CardHeader>
              <CardContent>
                <AddAccountModal 
                  platformCategories={platformCategories}
                  onConnect={connectPlatform}
                  loading={loading}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="automation">
            <Card className="bg-gradient-to-br from-gray-900/60 to-gray-800/60 backdrop-blur-lg border border-gray-500/30">
              <CardHeader>
                <CardTitle className="text-2xl text-white">Cross-Platform Automation Rules</CardTitle>
                <CardDescription className="text-gray-300">
                  Automate actions across all your connected accounts
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {automationRules.map((rule) => (
                    <div key={rule.id} className="flex items-center justify-between p-4 bg-gray-800/40 rounded-xl">
                      <div>
                        <h4 className="font-semibold text-white mb-1">{rule.name}</h4>
                        <p className="text-sm text-gray-300 mb-2">{rule.description}</p>
                        <div className="flex items-center gap-2">
                          <Badge className={rule.status === 'active' ? 'bg-green-500' : 'bg-gray-500'}>
                            {rule.status}
                          </Badge>
                          <span className="text-xs text-gray-400">{rule.executions} executions</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Switch checked={rule.status === 'active'} />
                        <Button size="sm" variant="outline" className="border-gray-600">
                          <Settings className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics">
            <Card className="bg-gradient-to-br from-gray-900/60 to-gray-800/60 backdrop-blur-lg border border-gray-500/30">
              <CardHeader>
                <CardTitle className="text-2xl text-white">Integration Performance Analytics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-400 text-lg">Analytics dashboard coming soon...</p>
                  <p className="text-gray-500">Track performance across all connected platforms</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default SocialMediaIntegrationCenter;