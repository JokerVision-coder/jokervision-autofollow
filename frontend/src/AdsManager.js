import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { 
  Search, Plus, Eye, Edit, Trash2, BarChart3, DollarSign, 
  Users, MousePointer, TrendingUp, Calendar, Settings, Play, Pause,
  Globe, MapPin, Car, Phone, Mail, Target, Zap, AlertCircle,
  ExternalLink, Copy, Download, Upload, RefreshCw, Clock
} from 'lucide-react';

const API = process.env.REACT_APP_BACKEND_URL;

// Simple component definitions (reusing pattern from WebsiteBuilder)
const Card = ({ children, className = "" }) => <div className={`${className}`}>{children}</div>;
const CardContent = ({ children, className = "" }) => <div className={`${className}`}>{children}</div>;
const Button = ({ children, className = "", onClick, size = "", variant = "", disabled = false, ...props }) => (
  <button 
    className={`px-4 py-2 rounded transition-colors ${className} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    onClick={onClick}
    disabled={disabled}
    {...props}
  >
    {children}
  </button>
);
const Input = ({ className = "", ...props }) => (
  <input className={`px-3 py-2 border rounded ${className}`} {...props} />
);
const Textarea = ({ className = "", ...props }) => (
  <textarea className={`px-3 py-2 border rounded ${className}`} {...props} />
);
const Label = ({ children, className = "" }) => <label className={`block mb-1 ${className}`}>{children}</label>;
const Badge = ({ children, className = "" }) => <span className={`px-2 py-1 rounded text-xs ${className}`}>{children}</span>;

const AdsManager = () => {
  const [activeTab, setActiveTab] = useState('google_ads');
  const [googleAds, setGoogleAds] = useState([]);
  const [craigslistAds, setCraigslistAds] = useState([]);
  const [facebookAds, setFacebookAds] = useState([]);
  const [instagramAds, setInstagramAds] = useState([]);
  const [tiktokAds, setTiktokAds] = useState([]);
  const [linkedinAds, setLinkedinAds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [campaigns, setCampaigns] = useState([]);
  const [showCreateAd, setShowCreateAd] = useState(false);

  useEffect(() => {
    fetchAdsData();
  }, [activeTab]);

  const fetchAdsData = async () => {
    try {
      setLoading(true);
      switch (activeTab) {
        case 'google_ads':
          const [adsResponse, campaignsResponse] = await Promise.all([
            axios.get(`${API}/google-ads?tenant_id=default_dealership`),
            axios.get(`${API}/google-ads/campaigns?tenant_id=default_dealership`)
          ]);
          setGoogleAds(adsResponse.data.ads || []);
          setCampaigns(campaignsResponse.data.campaigns || []);
          break;
        case 'facebook':
          const fbResponse = await axios.get(`${API}/facebook-ads?tenant_id=default_dealership`);
          setFacebookAds(fbResponse.data.ads || []);
          break;
        case 'instagram':
          const igResponse = await axios.get(`${API}/instagram-ads?tenant_id=default_dealership`);
          setInstagramAds(igResponse.data.ads || []);
          break;
        case 'tiktok':
          const ttResponse = await axios.get(`${API}/tiktok-ads?tenant_id=default_dealership`);
          setTiktokAds(ttResponse.data.ads || []);
          break;
        case 'linkedin':
          const liResponse = await axios.get(`${API}/linkedin-ads?tenant_id=default_dealership`);
          setLinkedinAds(liResponse.data.ads || []);
          break;
        case 'craigslist':
          const clResponse = await axios.get(`${API}/craigslist-ads?tenant_id=default_dealership`);
          setCraigslistAds(clResponse.data.ads || []);
          break;
      }
    } catch (error) {
      console.error('Error fetching ads:', error);
      toast.error('Failed to load ads data');
    } finally {
      setLoading(false);
    }
  };

  const createGoogleAdsCampaign = async (campaignData) => {
    try {
      await axios.post(`${API}/google-ads/campaigns`, {
        tenant_id: 'default_dealership',
        ...campaignData
      });
      toast.success('Google Ads campaign created!');
      fetchAdsData();
    } catch (error) {
      console.error('Error creating campaign:', error);
      toast.error('Failed to create campaign');
    }
  };

  const syncInventoryToCraigslist = async () => {
    try {
      await axios.post(`${API}/craigslist-ads/sync-inventory`, {
        tenant_id: 'default_dealership'
      });
      toast.success('Inventory sync to Craigslist initiated!');
      fetchAdsData();
    } catch (error) {
      console.error('Error syncing to Craigslist:', error);
      toast.error('Failed to sync inventory');
    }
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
            <h1 className="text-4xl font-bold text-glass-bright mb-2">Ads Manager</h1>
            <p className="text-glass-muted">Manage Google Ads and Craigslist campaigns for maximum lead generation</p>
          </div>
          
          <div className="flex gap-3">
            <Button 
              onClick={() => setShowCreateAd(true)}
              className="btn-neon"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Campaign
            </Button>
          </div>
        </div>

        {/* Platform Tabs */}
        <div className="flex gap-4 mb-6">
          <Button
            onClick={() => setActiveTab('google_ads')}
            className={`${activeTab === 'google_ads' ? 'bg-blue-600 text-white' : 'text-glass-bright hover:bg-glass'}`}
          >
            <Search className="w-4 h-4 mr-2" />
            Google Ads
          </Button>
          <Button
            onClick={() => setActiveTab('craigslist')}
            className={`${activeTab === 'craigslist' ? 'bg-orange-600 text-white' : 'text-glass-bright hover:bg-glass'}`}
          >
            <Globe className="w-4 h-4 mr-2" />
            Craigslist
          </Button>
        </div>

        {activeTab === 'google_ads' ? (
          <GoogleAdsSection 
            ads={googleAds} 
            campaigns={campaigns}
            onCreateCampaign={createGoogleAdsCampaign}
            onRefresh={fetchAdsData}
          />
        ) : (
          <CraigslistSection 
            ads={craigslistAds}
            onSyncInventory={syncInventoryToCraigslist}
            onRefresh={fetchAdsData}
          />
        )}
      </div>
    </div>
  );
};

// Google Ads Section Component
const GoogleAdsSection = ({ ads, campaigns, onCreateCampaign, onRefresh }) => {
  const [showCreateForm, setShowCreateForm] = useState(false);

  const totalSpent = campaigns.reduce((sum, c) => sum + (c.spent || 0), 0);
  const totalClicks = campaigns.reduce((sum, c) => sum + (c.clicks || 0), 0);
  const totalImpressions = campaigns.reduce((sum, c) => sum + (c.impressions || 0), 0);
  const avgCTR = totalImpressions > 0 ? ((totalClicks / totalImpressions) * 100).toFixed(2) : 0;

  return (
    <div className="space-y-6">
      {/* Google Ads Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="glass-card">
          <CardContent className="p-6 text-center">
            <DollarSign className="w-8 h-8 mx-auto mb-2 neon-green" />
            <div className="text-2xl font-bold text-glass-bright">${totalSpent.toFixed(2)}</div>
            <div className="text-sm text-glass-muted">Total Spent</div>
          </CardContent>
        </Card>
        
        <Card className="glass-card">
          <CardContent className="p-6 text-center">
            <MousePointer className="w-8 h-8 mx-auto mb-2 neon-blue" />
            <div className="text-2xl font-bold neon-blue">{totalClicks.toLocaleString()}</div>
            <div className="text-sm text-glass-muted">Total Clicks</div>
          </CardContent>
        </Card>
        
        <Card className="glass-card">
          <CardContent className="p-6 text-center">
            <Eye className="w-8 h-8 mx-auto mb-2 neon-purple" />
            <div className="text-2xl font-bold neon-purple">{totalImpressions.toLocaleString()}</div>
            <div className="text-sm text-glass-muted">Impressions</div>
          </CardContent>
        </Card>
        
        <Card className="glass-card">
          <CardContent className="p-6 text-center">
            <Target className="w-8 h-8 mx-auto mb-2 neon-orange" />
            <div className="text-2xl font-bold neon-orange">{avgCTR}%</div>
            <div className="text-sm text-glass-muted">Avg CTR</div>
          </CardContent>
        </Card>
      </div>

      {/* Active Campaigns */}
      <Card className="glass-card">
        <CardContent className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold text-glass-bright">Google Ads Campaigns</h3>
            <div className="flex gap-2">
              <Button onClick={onRefresh} size="sm" variant="outline" className="text-glass-bright">
                <RefreshCw className="w-4 h-4" />
              </Button>
              <Button onClick={() => setShowCreateForm(true)} size="sm" className="btn-neon">
                <Plus className="w-4 h-4 mr-1" />
                New Campaign
              </Button>
            </div>
          </div>
          
          {campaigns.length === 0 ? (
            <div className="text-center py-12">
              <Search className="w-16 h-16 mx-auto mb-4 text-glass-muted" />
              <h4 className="text-lg font-semibold text-glass-bright mb-2">No Google Ads Campaigns</h4>
              <p className="text-glass-muted mb-6">Create your first campaign to start driving traffic and leads</p>
              <Button onClick={() => setShowCreateForm(true)} className="btn-neon">
                <Plus className="w-4 h-4 mr-2" />
                Create Campaign
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {campaigns.map((campaign) => (
                <GoogleAdsCampaignCard key={campaign.id} campaign={campaign} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Campaign Form */}
      {showCreateForm && (
        <GoogleAdsCreateForm 
          onClose={() => setShowCreateForm(false)}
          onCreate={onCreateCampaign}
        />
      )}
    </div>
  );
};

// Craigslist Section Component
const CraigslistSection = ({ ads, onSyncInventory, onRefresh }) => {
  const activeAds = ads.filter(ad => ad.status === 'active').length;
  const totalViews = ads.reduce((sum, ad) => sum + (ad.views || 0), 0);
  const totalLeads = ads.reduce((sum, ad) => sum + (ad.leads || 0), 0);
  const avgConversion = totalViews > 0 ? ((totalLeads / totalViews) * 100).toFixed(2) : 0;

  return (
    <div className="space-y-6">
      {/* Craigslist Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="glass-card">
          <CardContent className="p-6 text-center">
            <Globe className="w-8 h-8 mx-auto mb-2 neon-orange" />
            <div className="text-2xl font-bold text-glass-bright">{ads.length}</div>
            <div className="text-sm text-glass-muted">Total Listings</div>
          </CardContent>
        </Card>
        
        <Card className="glass-card">
          <CardContent className="p-6 text-center">
            <Play className="w-8 h-8 mx-auto mb-2 neon-green" />
            <div className="text-2xl font-bold neon-green">{activeAds}</div>
            <div className="text-sm text-glass-muted">Active Ads</div>
          </CardContent>
        </Card>
        
        <Card className="glass-card">
          <CardContent className="p-6 text-center">
            <Eye className="w-8 h-8 mx-auto mb-2 neon-blue" />
            <div className="text-2xl font-bold neon-blue">{totalViews.toLocaleString()}</div>
            <div className="text-sm text-glass-muted">Total Views</div>
          </CardContent>
        </Card>
        
        <Card className="glass-card">
          <CardContent className="p-6 text-center">
            <Users className="w-8 h-8 mx-auto mb-2 neon-purple" />
            <div className="text-2xl font-bold neon-purple">{avgConversion}%</div>
            <div className="text-sm text-glass-muted">Conversion Rate</div>
          </CardContent>
        </Card>
      </div>

      {/* Craigslist Management */}
      <Card className="glass-card">
        <CardContent className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold text-glass-bright">Craigslist Listings</h3>
            <div className="flex gap-2">
              <Button onClick={onRefresh} size="sm" variant="outline" className="text-glass-bright">
                <RefreshCw className="w-4 h-4" />
              </Button>
              <Button onClick={onSyncInventory} size="sm" className="btn-neon">
                <Zap className="w-4 h-4 mr-1" />
                Sync Inventory
              </Button>
            </div>
          </div>
          
          {ads.length === 0 ? (
            <div className="text-center py-12">
              <Globe className="w-16 h-16 mx-auto mb-4 text-glass-muted" />
              <h4 className="text-lg font-semibold text-glass-bright mb-2">No Craigslist Listings</h4>
              <p className="text-glass-muted mb-6">Sync your inventory to automatically create Craigslist listings</p>
              <Button onClick={onSyncInventory} className="btn-neon">
                <Zap className="w-4 h-4 mr-2" />
                Sync Inventory to Craigslist
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {ads.map((ad) => (
                <CraigslistAdCard key={ad.id} ad={ad} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card className="glass-card">
        <CardContent className="p-6">
          <h4 className="text-lg font-semibold text-glass-bright mb-4">Quick Actions</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button className="btn-neon p-6 h-auto flex-col">
              <Upload className="w-8 h-8 mb-2" />
              <div className="text-sm font-medium">Bulk Upload</div>
              <div className="text-xs text-glass-muted">Upload multiple vehicles</div>
            </Button>
            
            <Button className="btn-neon p-6 h-auto flex-col">
              <RefreshCw className="w-8 h-8 mb-2" />
              <div className="text-sm font-medium">Auto Renew</div>
              <div className="text-xs text-glass-muted">Keep listings fresh</div>
            </Button>
            
            <Button className="btn-neon p-6 h-auto flex-col">
              <BarChart3 className="w-8 h-8 mb-2" />
              <div className="text-sm font-medium">Analytics</div>
              <div className="text-xs text-glass-muted">View performance</div>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Google Ads Campaign Card
const GoogleAdsCampaignCard = ({ campaign }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'neon-green';
      case 'paused': return 'neon-orange';
      case 'ended': return 'text-glass-muted';
      default: return 'text-glass';
    }
  };

  return (
    <Card className="glass-card hover:scale-105 transition-transform duration-200">
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-3">
          <div>
            <h4 className="font-semibold text-glass-bright">{campaign.name}</h4>
            <p className="text-sm text-glass-muted">{campaign.type} • {campaign.targeting}</p>
          </div>
          <Badge className={`badge-neon ${getStatusColor(campaign.status)}`}>
            {campaign.status?.toUpperCase()}
          </Badge>
        </div>
        
        <div className="grid grid-cols-4 gap-4 text-sm mb-4">
          <div>
            <div className="text-glass-bright font-medium">${campaign.spent || 0}</div>
            <div className="text-glass-muted">Spent</div>
          </div>
          <div>
            <div className="text-glass-bright font-medium">{campaign.clicks || 0}</div>
            <div className="text-glass-muted">Clicks</div>
          </div>
          <div>
            <div className="text-glass-bright font-medium">{campaign.conversions || 0}</div>
            <div className="text-glass-muted">Conversions</div>
          </div>
          <div>
            <div className="text-glass-bright font-medium">
              {campaign.impressions > 0 ? ((campaign.clicks / campaign.impressions) * 100).toFixed(2) : 0}%
            </div>
            <div className="text-glass-muted">CTR</div>
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button size="sm" className="btn-neon flex-1">
            <BarChart3 className="w-3 h-3 mr-1" />
            View Stats
          </Button>
          <Button size="sm" variant="outline" className="text-glass-bright">
            <Edit className="w-3 h-3" />
          </Button>
          <Button size="sm" variant="outline" className="text-glass-bright">
            {campaign.status === 'active' ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

// Craigslist Ad Card
const CraigslistAdCard = ({ ad }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'neon-green';
      case 'expired': return 'neon-orange';
      case 'flagged': return 'text-red-400';
      default: return 'text-glass';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <Card className="glass-card hover:scale-105 transition-transform duration-200">
      <CardContent className="p-4">
        <div className="flex gap-4">
          {/* Vehicle Image */}
          <div className="w-20 h-20 bg-gradient-to-br from-gray-700 to-gray-800 rounded-lg flex items-center justify-center">
            {ad.image ? (
              <img src={ad.image} alt={ad.title} className="w-full h-full object-cover rounded-lg" />
            ) : (
              <Car className="w-8 h-8 text-gray-400" />
            )}
          </div>
          
          {/* Ad Details */}
          <div className="flex-1">
            <div className="flex justify-between items-start mb-2">
              <div>
                <h4 className="font-semibold text-glass-bright">{ad.title}</h4>
                <p className="text-sm text-glass-muted">${ad.price?.toLocaleString()} • {ad.location}</p>
              </div>
              <Badge className={`badge-neon ${getStatusColor(ad.status)}`}>
                {ad.status?.toUpperCase()}
              </Badge>
            </div>
            
            <div className="grid grid-cols-3 gap-4 text-sm mb-3">
              <div>
                <div className="text-glass-bright font-medium">{ad.views || 0}</div>
                <div className="text-glass-muted">Views</div>
              </div>
              <div>
                <div className="text-glass-bright font-medium">{ad.replies || 0}</div>
                <div className="text-glass-muted">Replies</div>
              </div>
              <div>
                <div className="text-glass-bright font-medium">
                  {formatDate(ad.posted_date)}
                </div>
                <div className="text-glass-muted">Posted</div>
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button size="sm" className="btn-neon">
                <ExternalLink className="w-3 h-3 mr-1" />
                View Listing
              </Button>
              <Button size="sm" variant="outline" className="text-glass-bright">
                <Edit className="w-3 h-3" />
              </Button>
              <Button size="sm" variant="outline" className="text-green-400">
                <RefreshCw className="w-3 h-3" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Google Ads Create Form
const GoogleAdsCreateForm = ({ onClose, onCreate }) => {
  const [formData, setFormData] = useState({
    name: '',
    type: 'search',
    budget: '',
    targeting: '',
    keywords: '',
    description: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onCreate(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="glass-card max-w-lg w-full mx-4">
        <CardContent className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-semibold text-glass-bright">Create Google Ads Campaign</h3>
            <Button onClick={onClose} size="sm" variant="outline" className="text-glass-bright">
              ✕
            </Button>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label className="text-glass">Campaign Name</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                placeholder="e.g., 2025 Toyota Camry Campaign"
                className="text-glass"
                required
              />
            </div>
            
            <div>
              <Label className="text-glass">Campaign Type</Label>
              <select 
                value={formData.type} 
                onChange={(e) => setFormData({...formData, type: e.target.value})}
                className="px-3 py-2 border rounded w-full text-glass"
              >
                <option value="search">Search Campaign</option>
                <option value="display">Display Campaign</option>
                <option value="video">Video Campaign</option>
                <option value="shopping">Shopping Campaign</option>
              </select>
            </div>
            
            <div>
              <Label className="text-glass">Daily Budget ($)</Label>
              <Input
                type="number"
                value={formData.budget}
                onChange={(e) => setFormData({...formData, budget: e.target.value})}
                placeholder="50"
                className="text-glass"
                required
              />
            </div>
            
            <div>
              <Label className="text-glass">Target Keywords</Label>
              <Textarea
                value={formData.keywords}
                onChange={(e) => setFormData({...formData, keywords: e.target.value})}
                placeholder="toyota camry, buy toyota, car dealership san antonio"
                className="text-glass"
                rows={3}
              />
            </div>
            
            <div className="flex gap-3 pt-4">
              <Button type="submit" className="btn-neon flex-1">
                Create Campaign
              </Button>
              <Button type="button" onClick={onClose} variant="outline" className="text-glass-bright">
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdsManager;