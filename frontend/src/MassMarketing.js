import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { 
  Send, Users, Mail, MessageSquare, Target, Filter, Search,
  Plus, Calendar, BarChart3, Eye, Edit, Trash2, Copy, Download,
  Upload, RefreshCw, Clock, CheckCircle2, AlertCircle, Zap,
  Tag, Settings, Play, Pause, ChevronDown, ChevronRight
} from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Simple component definitions
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
const Badge = ({ children, className = "" }) => <span className={`px-2 py-1 rounded text-xs ${className}`}>{children}</span>;

const MassMarketing = () => {
  const [activeTab, setActiveTab] = useState('campaigns');
  const [campaigns, setCampaigns] = useState([]);
  const [audienceSegments, setAudienceSegments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateCampaign, setShowCreateCampaign] = useState(false);
  const [campaignStats, setCampaignStats] = useState({});

  useEffect(() => {
    fetchCampaigns();
    fetchAudienceSegments();
    fetchCampaignStats();
  }, []);

  const fetchCampaigns = async () => {
    try {
      const response = await axios.get(`${API}/marketing/campaigns?tenant_id=default_dealership`);
      setCampaigns(response.data.campaigns || []);
    } catch (error) {
      console.error('Error fetching campaigns:', error);
      loadMockCampaigns();
    }
  };

  const fetchAudienceSegments = async () => {
    try {
      const response = await axios.get(`${API}/marketing/segments?tenant_id=default_dealership`);
      const segments = response.data?.segments || [];
      
      // Filter out any duplicate or test segments
      const uniqueSegments = segments.filter((seg, index, self) => 
        index === self.findIndex((s) => s.id === seg.id)
      );
      
      setAudienceSegments(uniqueSegments.length > 0 ? uniqueSegments : []);
      
      // If no segments or all have same name, load mock data
      if (uniqueSegments.length === 0 || uniqueSegments.every(s => s.name === uniqueSegments[0].name)) {
        loadMockSegments();
      }
    } catch (error) {
      console.error('Error fetching segments:', error);
      loadMockSegments();
    }
  };

  const fetchCampaignStats = async () => {
    try {
      const response = await axios.get(`${API}/marketing/stats?tenant_id=default_dealership`);
      setCampaignStats(response.data || {});
    } catch (error) {
      console.error('Error fetching stats:', error);
      loadMockStats();
    } finally {
      setLoading(false);
    }
  };

  const loadMockCampaigns = () => {
    setCampaigns([
      {
        id: 'camp_1',
        name: '2025 Model Year Sale',
        type: 'sms',
        status: 'active',
        subject: '',
        content: 'New 2025 Toyota models are here! Save up to $5,000. Visit us today or text STOP to opt out.',
        audience_segment: 'SUV Buyers',
        recipients: 1247,
        sent: 1247,
        delivered: 1198,
        opened: 456,
        clicked: 89,
        responses: 23,
        scheduled_date: '2024-01-07T09:00:00Z',
        created_at: '2024-01-06T15:30:00Z'
      },
      {
        id: 'camp_2',
        name: 'Service Department Promotion',
        type: 'email',
        status: 'completed',
        subject: '30% Off Winter Service Package',
        content: 'Get your Toyota ready for winter with our comprehensive service package...',
        audience_segment: 'Existing Customers',
        recipients: 2341,
        sent: 2341,
        delivered: 2298,
        opened: 892,
        clicked: 167,
        responses: 45,
        scheduled_date: '2024-01-05T08:00:00Z',
        created_at: '2024-01-04T14:20:00Z'
      },
      {
        id: 'camp_3',
        name: 'RAV4 Hybrid Launch',
        type: 'sms',
        status: 'scheduled',
        subject: '',
        content: 'The all-new RAV4 Hybrid has arrived! Schedule your test drive today.',
        audience_segment: 'Eco-Conscious Buyers',
        recipients: 567,
        sent: 0,
        delivered: 0,
        opened: 0,
        clicked: 0,
        responses: 0,
        scheduled_date: '2024-01-08T10:00:00Z',
        created_at: '2024-01-07T11:45:00Z'
      }
    ]);
  };

  const loadMockSegments = () => {
    setAudienceSegments([
      {
        id: 'seg_1',
        name: 'SUV Buyers',
        description: 'Customers interested in SUVs and crossovers',
        criteria: { vehicle_type: 'SUV', budget_min: 25000 },
        count: 1247,
        last_updated: '2024-01-07T10:30:00Z'
      },
      {
        id: 'seg_2', 
        name: 'Existing Customers',
        description: 'Previous buyers and service customers',
        criteria: { status: 'customer', last_purchase: 'within_2_years' },
        count: 2341,
        last_updated: '2024-01-06T16:20:00Z'
      },
      {
        id: 'seg_3',
        name: 'Eco-Conscious Buyers',
        description: 'Leads interested in hybrid and electric vehicles',
        criteria: { interests: 'hybrid', budget_min: 30000 },
        count: 567,
        last_updated: '2024-01-07T09:15:00Z'
      }
    ]);
  };

  const loadMockStats = () => {
    setCampaignStats({
      total_campaigns: 47,
      active_campaigns: 12,
      total_recipients: 45623,
      avg_open_rate: 34.2,
      avg_click_rate: 8.7,
      total_responses: 456
    });
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
            <h1 className="text-4xl font-bold text-glass-bright mb-2">Mass Marketing</h1>
            <p className="text-glass-muted">SMS & Email campaigns with advanced targeting</p>
          </div>
          
          <div className="flex gap-3">
            <Button 
              onClick={() => setShowCreateCampaign(true)}
              className="btn-neon"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Campaign
            </Button>
            <Button onClick={fetchCampaigns} variant="outline" className="text-glass-bright">
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>

        {/* Campaign Stats */}
        <CampaignStats stats={campaignStats} />

        {/* Tabs */}
        <div className="flex gap-4 mb-6">
          <Button
            onClick={() => setActiveTab('campaigns')}
            className={`${activeTab === 'campaigns' ? 'bg-purple-600 text-white' : 'text-glass-bright hover:bg-glass'}`}
          >
            <Send className="w-4 h-4 mr-2" />
            Campaigns
          </Button>
          <Button
            onClick={() => setActiveTab('segments')}
            className={`${activeTab === 'segments' ? 'bg-purple-600 text-white' : 'text-glass-bright hover:bg-glass'}`}
          >
            <Target className="w-4 h-4 mr-2" />
            Audience Segments
          </Button>
        </div>

        {/* Content Area */}
        {activeTab === 'campaigns' ? (
          <CampaignsSection 
            campaigns={campaigns}
            onRefresh={fetchCampaigns}
          />
        ) : (
          <AudienceSegmentsSection 
            segments={audienceSegments}
            onRefresh={fetchAudienceSegments}
          />
        )}

        {/* Create Campaign Modal */}
        {showCreateCampaign && (
          <CreateCampaignModal 
            onClose={() => setShowCreateCampaign(false)}
            segments={audienceSegments}
            onCampaignCreated={(campaign) => {
              setCampaigns([campaign, ...campaigns]);
              setShowCreateCampaign(false);
            }}
          />
        )}
      </div>
    </div>
  );
};

// Campaign Stats Component
const CampaignStats = ({ stats }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-6">
      <Card className="glass-card">
        <CardContent className="p-6 text-center">
          <Send className="w-8 h-8 mx-auto mb-2 neon-blue" />
          <div className="text-2xl font-bold text-glass-bright">{stats.total_campaigns || 0}</div>
          <div className="text-sm text-glass-muted">Total Campaigns</div>
        </CardContent>
      </Card>
      
      <Card className="glass-card">
        <CardContent className="p-6 text-center">
          <Play className="w-8 h-8 mx-auto mb-2 neon-green" />
          <div className="text-2xl font-bold neon-green">{stats.active_campaigns || 0}</div>
          <div className="text-sm text-glass-muted">Active Campaigns</div>
        </CardContent>
      </Card>
      
      <Card className="glass-card">
        <CardContent className="p-6 text-center">
          <Users className="w-8 h-8 mx-auto mb-2 neon-purple" />
          <div className="text-2xl font-bold neon-purple">{(stats.total_recipients || 0).toLocaleString()}</div>
          <div className="text-sm text-glass-muted">Total Recipients</div>
        </CardContent>
      </Card>
      
      <Card className="glass-card">
        <CardContent className="p-6 text-center">
          <Eye className="w-8 h-8 mx-auto mb-2 neon-yellow" />
          <div className="text-2xl font-bold neon-yellow">{stats.avg_open_rate || 0}%</div>
          <div className="text-sm text-glass-muted">Avg Open Rate</div>
        </CardContent>
      </Card>
      
      <Card className="glass-card">
        <CardContent className="p-6 text-center">
          <Target className="w-8 h-8 mx-auto mb-2 neon-orange" />
          <div className="text-2xl font-bold neon-orange">{stats.avg_click_rate || 0}%</div>
          <div className="text-sm text-glass-muted">Avg Click Rate</div>
        </CardContent>
      </Card>
      
      <Card className="glass-card">
        <CardContent className="p-6 text-center">
          <MessageSquare className="w-8 h-8 mx-auto mb-2 neon-cyan" />
          <div className="text-2xl font-bold neon-cyan">{stats.total_responses || 0}</div>
          <div className="text-sm text-glass-muted">Total Responses</div>
        </CardContent>
      </Card>
    </div>
  );
};

// Campaigns Section Component
const CampaignsSection = ({ campaigns, onRefresh }) => {
  if (campaigns.length === 0) {
    return (
      <Card className="glass-card">
        <CardContent className="p-12 text-center">
          <Send className="w-16 h-16 mx-auto mb-4 text-glass-muted" />
          <h3 className="text-xl font-semibold text-glass-bright mb-2">No Campaigns Yet</h3>
          <p className="text-glass-muted">Create your first SMS or email campaign to reach your audience</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {campaigns.map((campaign) => (
        <CampaignCard key={campaign.id} campaign={campaign} />
      ))}
    </div>
  );
};

// Campaign Card Component
const CampaignCard = ({ campaign }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'neon-green';
      case 'completed': return 'text-glass-muted';
      case 'scheduled': return 'neon-orange';
      case 'draft': return 'neon-blue';
      default: return 'text-glass';
    }
  };

  const getTypeIcon = (type) => {
    return type === 'sms' ? <MessageSquare className="w-5 h-5" /> : <Mail className="w-5 h-5" />;
  };

  const getTypeColor = (type) => {
    return type === 'sms' ? 'bg-blue-600' : 'bg-red-600';
  };

  const calculateOpenRate = () => {
    return campaign.sent > 0 ? ((campaign.opened / campaign.sent) * 100).toFixed(1) : 0;
  };

  const calculateClickRate = () => {
    return campaign.opened > 0 ? ((campaign.clicked / campaign.opened) * 100).toFixed(1) : 0;
  };

  return (
    <Card className="glass-card hover:scale-105 transition-transform duration-200">
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center">
            <div className={`p-2 rounded-full ${getTypeColor(campaign.type)} text-white mr-4`}>
              {getTypeIcon(campaign.type)}
            </div>
            <div>
              <h4 className="font-semibold text-glass-bright">{campaign.name}</h4>
              <p className="text-sm text-glass-muted">{campaign.audience_segment} • {campaign.recipients.toLocaleString()} recipients</p>
            </div>
          </div>
          
          <Badge className={`badge-neon ${getStatusColor(campaign.status)}`}>
            {campaign.status.toUpperCase()}
          </Badge>
        </div>

        {campaign.subject && (
          <p className="text-sm font-medium text-glass-bright mb-2">Subject: {campaign.subject}</p>
        )}
        
        <p className="text-sm text-glass-muted mb-4 line-clamp-2">{campaign.content}</p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <div className="text-center">
            <div className="text-lg font-bold text-glass-bright">{campaign.sent.toLocaleString()}</div>
            <div className="text-xs text-glass-muted">Sent</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-glass-bright">{calculateOpenRate()}%</div>
            <div className="text-xs text-glass-muted">Open Rate</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-glass-bright">{calculateClickRate()}%</div>
            <div className="text-xs text-glass-muted">Click Rate</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-glass-bright">{campaign.responses}</div>
            <div className="text-xs text-glass-muted">Responses</div>
          </div>
        </div>

        <div className="flex justify-between items-center">
          <div className="text-sm text-glass-muted">
            {campaign.status === 'scheduled' 
              ? `Scheduled: ${new Date(campaign.scheduled_date).toLocaleDateString()}`
              : `Sent: ${new Date(campaign.scheduled_date).toLocaleDateString()}`
            }
          </div>
          
          <div className="flex gap-2">
            <Button size="sm" className="btn-neon">
              <BarChart3 className="w-3 h-3 mr-1" />
              Analytics
            </Button>
            <Button size="sm" variant="outline" className="text-glass-bright">
              <Copy className="w-3 h-3" />
            </Button>
            <Button size="sm" variant="outline" className="text-glass-bright">
              <Edit className="w-3 h-3" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Audience Segments Section Component
const AudienceSegmentsSection = ({ segments, onRefresh }) => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-glass-bright">Audience Segments</h2>
        <Button className="btn-neon" onClick={() => setShowCreateModal(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Create Segment
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {segments.length > 0 ? (
          segments.map((segment) => (
            <SegmentCard key={segment.id} segment={segment} />
          ))
        ) : (
          <div className="col-span-3 text-center py-12">
            <Target className="w-16 h-16 text-gray-500 mx-auto mb-4" />
            <p className="text-gray-400 mb-4">No audience segments yet</p>
            <Button className="btn-neon" onClick={() => setShowCreateModal(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create Your First Segment
            </Button>
          </div>
        )}
      </div>
      
      {showCreateModal && (
        <CreateSegmentModal
          onClose={() => setShowCreateModal(false)}
          onSegmentCreated={(segment) => {
            onRefresh();
            setShowCreateModal(false);
          }}
        />
      )}
    </div>
  );
};

// Segment Card Component
const SegmentCard = ({ segment }) => {
  return (
    <Card className="glass-card hover:scale-105 transition-transform duration-200">
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-3">
          <h4 className="font-semibold text-glass-bright">{segment.name}</h4>
          <Badge className="bg-purple-600 text-white">
            {segment.count.toLocaleString()}
          </Badge>
        </div>
        
        <p className="text-sm text-glass-muted mb-4">{segment.description}</p>
        
        <div className="flex justify-between items-center">
          <div className="text-sm text-glass-muted">
            Updated: {new Date(segment.last_updated).toLocaleDateString()}
          </div>
          
          <div className="flex gap-2">
            <Button size="sm" variant="outline" className="text-glass-bright">
              <Eye className="w-3 h-3" />
            </Button>
            <Button size="sm" variant="outline" className="text-glass-bright">
              <Edit className="w-3 h-3" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Create Campaign Modal Component
const CreateCampaignModal = ({ onClose, segments, onCampaignCreated }) => {
  const [campaignData, setCampaignData] = useState({
    name: '',
    type: 'sms',
    subject: '',
    content: '',
    segment_id: '',
    scheduled_date: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${API}/marketing/campaigns`, {
        tenant_id: 'default_dealership',
        ...campaignData
      });
      
      toast.success('Campaign created successfully!');
      onCampaignCreated(response.data);
    } catch (error) {
      console.error('Error creating campaign:', error);
      toast.error('Failed to create campaign');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="glass-card max-w-2xl w-full mx-4">
        <CardContent className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-semibold text-glass-bright">Create Marketing Campaign</h3>
            <Button onClick={onClose} size="sm" variant="outline" className="text-glass-bright">
              ✕
            </Button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-glass-bright mb-1">Campaign Name</label>
              <Input
                value={campaignData.name}
                onChange={(e) => setCampaignData({...campaignData, name: e.target.value})}
                placeholder="e.g., 2025 Model Year Sale"
                className="text-glass"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-glass-bright mb-1">Type</label>
                <select 
                  value={campaignData.type} 
                  onChange={(e) => setCampaignData({...campaignData, type: e.target.value})}
                  className="px-3 py-2 border rounded w-full text-glass"
                >
                  <option value="sms">SMS Campaign</option>
                  <option value="email">Email Campaign</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-glass-bright mb-1">Audience Segment</label>
                <select 
                  value={campaignData.segment_id} 
                  onChange={(e) => setCampaignData({...campaignData, segment_id: e.target.value})}
                  className="px-3 py-2 border rounded w-full text-glass"
                  required
                >
                  <option value="">Select Segment</option>
                  {segments.map(segment => (
                    <option key={segment.id} value={segment.id}>
                      {segment.name} ({segment.count} contacts)
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {campaignData.type === 'email' && (
              <div>
                <label className="block text-sm font-medium text-glass-bright mb-1">Subject Line</label>
                <Input
                  value={campaignData.subject}
                  onChange={(e) => setCampaignData({...campaignData, subject: e.target.value})}
                  placeholder="e.g., 30% Off Winter Service Package"
                  className="text-glass"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-glass-bright mb-1">
                Message Content {campaignData.type === 'sms' && '(160 characters recommended)'}
              </label>
              <Textarea
                value={campaignData.content}
                onChange={(e) => setCampaignData({...campaignData, content: e.target.value})}
                placeholder={campaignData.type === 'sms' 
                  ? "New 2025 Toyota models are here! Save up to $5,000. Visit us today."
                  : "Write your email content here..."
                }
                className="text-glass"
                rows={campaignData.type === 'sms' ? 3 : 6}
                required
              />
              {campaignData.type === 'sms' && (
                <p className="text-sm text-glass-muted mt-1">
                  Characters: {campaignData.content.length}/160
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-glass-bright mb-1">Schedule Date (Optional)</label>
              <Input
                type="datetime-local"
                value={campaignData.scheduled_date}
                onChange={(e) => setCampaignData({...campaignData, scheduled_date: e.target.value})}
                className="text-glass"
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button type="submit" className="btn-neon flex-1">
                <Send className="w-4 h-4 mr-2" />
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

// Create Segment Modal Component
const CreateSegmentModal = ({ onClose, onSegmentCreated }) => {
  const [segmentData, setSegmentData] = useState({
    name: '',
    description: '',
    criteria: {
      vehicle_type: '',
      budget_min: '',
      budget_max: '',
      interests: ''
    }
  });

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    
    if (!segmentData.name || !segmentData.description) {
      toast.error('Please fill in all required fields');
      return;
    }
    
    try {
      const response = await axios.post(`${API}/marketing/segments`, {
        tenant_id: 'default_dealership',
        ...segmentData
      });
      
      toast.success(`Segment "${segmentData.name}" created successfully!`);
      onSegmentCreated(response.data.segment || response.data);
      onClose();
    } catch (error) {
      console.error('Error creating segment:', error);
      toast.error(error.response?.data?.detail || 'Failed to create segment');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
      <Card className="bg-gray-800 border-gray-600 w-full max-w-2xl" onClick={(e) => e.stopPropagation()}>
        <CardContent className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-2xl font-bold text-glass-bright">Create Audience Segment</h3>
            <button onClick={onClose} className="text-glass-muted hover:text-glass-bright">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-glass-bright mb-1">Segment Name</label>
              <Input
                value={segmentData.name}
                onChange={(e) => setSegmentData({...segmentData, name: e.target.value})}
                placeholder="e.g., SUV Buyers, First-Time Buyers, Trade-In Prospects"
                className="text-glass w-full"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-glass-bright mb-1">Description</label>
              <Textarea
                value={segmentData.description}
                onChange={(e) => setSegmentData({...segmentData, description: e.target.value})}
                placeholder="Describe this audience segment..."
                className="text-glass w-full"
                rows={3}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-glass-bright mb-1">Vehicle Type Interest</label>
                <select
                  value={segmentData.criteria.vehicle_type}
                  onChange={(e) => setSegmentData({
                    ...segmentData,
                    criteria: {...segmentData.criteria, vehicle_type: e.target.value}
                  })}
                  className="px-3 py-2 border rounded w-full text-glass bg-gray-700"
                >
                  <option value="">Any</option>
                  <option value="sedan">Sedan</option>
                  <option value="SUV">SUV</option>
                  <option value="truck">Truck</option>
                  <option value="hybrid">Hybrid/Electric</option>
                  <option value="luxury">Luxury</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-glass-bright mb-1">Interest Tags</label>
                <Input
                  value={segmentData.criteria.interests}
                  onChange={(e) => setSegmentData({
                    ...segmentData,
                    criteria: {...segmentData.criteria, interests: e.target.value}
                  })}
                  placeholder="e.g., family, performance, eco"
                  className="text-glass w-full"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-glass-bright mb-1">Min Budget ($)</label>
                <Input
                  type="number"
                  value={segmentData.criteria.budget_min}
                  onChange={(e) => setSegmentData({
                    ...segmentData,
                    criteria: {...segmentData.criteria, budget_min: e.target.value}
                  })}
                  placeholder="25000"
                  className="text-glass w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-glass-bright mb-1">Max Budget ($)</label>
                <Input
                  type="number"
                  value={segmentData.criteria.budget_max}
                  onChange={(e) => setSegmentData({
                    ...segmentData,
                    criteria: {...segmentData.criteria, budget_max: e.target.value}
                  })}
                  placeholder="50000"
                  className="text-glass w-full"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <Button 
                type="button" 
                onClick={(e) => {
                  e.preventDefault();
                  handleSubmit();
                }}
                className="btn-neon flex-1"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Segment
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

export default MassMarketing;