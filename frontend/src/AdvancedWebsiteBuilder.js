import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { 
  Globe, Plus, Eye, Settings, Code, Palette, Layout, MessageCircle,
  FileText, BarChart3, Users, Phone, Mail, Star, Calendar, Search,
  Edit, Trash2, Copy, Download, Share2, Monitor, Smartphone, Tablet
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

const AdvancedWebsiteBuilder = () => {
  const [activeTab, setActiveTab] = useState('websites');
  const [websites, setWebsites] = useState([]);
  const [widgets, setWidgets] = useState([]);
  const [analytics, setAnalytics] = useState({});
  const [loading, setLoading] = useState(true);
  const [showBuilderModal, setShowBuilderModal] = useState(false);
  const [selectedWebsite, setSelectedWebsite] = useState(null);

  useEffect(() => {
    fetchWebsites();
    fetchWidgets();
    fetchAnalytics();
  }, []);

  const fetchWebsites = async () => {
    try {
      const response = await axios.get(`${API}/websites?tenant_id=default_dealership`);
      setWebsites(response.data.websites || []);
    } catch (error) {
      console.error('Error fetching websites:', error);
      loadMockWebsites();
    }
  };

  const fetchWidgets = async () => {
    try {
      const response = await axios.get(`${API}/website-widgets?tenant_id=default_dealership`);
      setWidgets(response.data.widgets || []);
    } catch (error) {
      console.error('Error fetching widgets:', error);
      loadMockWidgets();
    }
  };

  const fetchAnalytics = async () => {
    try {
      const response = await axios.get(`${API}/website-analytics?tenant_id=default_dealership`);
      setAnalytics(response.data || {});
    } catch (error) {
      console.error('Error fetching analytics:', error);
      loadMockAnalytics();
    } finally {
      setLoading(false);
    }
  };

  const loadMockWebsites = () => {
    setWebsites([
      {
        id: 'site_1',
        name: 'Toyota Sales Landing Page',
        url: 'https://shottenkirk-toyota-sales.jokervision.app',
        template: 'dealership_modern',
        status: 'published',
        visits: 2340,
        conversions: 89,
        conversion_rate: 3.8,
        created_at: '2024-01-15T10:00:00Z',
        last_updated: '2024-01-22T14:30:00Z',
        features: ['chat_widget', 'lead_forms', 'inventory_feed', 'reviews_display'],
        seo_score: 85
      },
      {
        id: 'site_2', 
        name: 'Service Department Page',
        url: 'https://shottenkirk-service.jokervision.app',
        template: 'service_focused',
        status: 'published',
        visits: 1560,
        conversions: 67,
        conversion_rate: 4.3,
        created_at: '2024-01-10T09:00:00Z',
        last_updated: '2024-01-20T11:15:00Z',
        features: ['appointment_booking', 'service_calculator', 'testimonials'],
        seo_score: 92
      },
      {
        id: 'site_3',
        name: 'Financing Calculator Page', 
        url: 'https://shottenkirk-finance.jokervision.app',
        template: 'calculator_focused',
        status: 'draft',
        visits: 0,
        conversions: 0,
        conversion_rate: 0,
        created_at: '2024-01-22T16:45:00Z',
        last_updated: '2024-01-22T16:45:00Z',
        features: ['payment_calculator', 'trade_estimator', 'credit_application'],
        seo_score: 78
      }
    ]);
  };

  const loadMockWidgets = () => {
    setWidgets([
      {
        id: 'widget_1',
        type: 'chat_widget',
        name: 'Live Chat Assistant',
        status: 'active',
        websites: 2,
        conversations: 156,
        leads_generated: 23
      },
      {
        id: 'widget_2',
        type: 'lead_form',
        name: 'Test Drive Request Form',
        status: 'active',
        websites: 3,
        submissions: 89,
        leads_generated: 89
      },
      {
        id: 'widget_3',
        type: 'reviews_feed',
        name: 'Live Reviews Display',
        status: 'active',
        websites: 2,
        reviews_shown: 247,
        engagement_boost: '12%'
      }
    ]);
  };

  const loadMockAnalytics = () => {
    setAnalytics({
      total_websites: 3,
      total_visits: 3900,
      total_conversions: 156,
      avg_conversion_rate: 4.0,
      top_performing_page: 'Service Department Page',
      monthly_growth: 15.2,
      seo_avg_score: 85,
      active_widgets: 8,
      leads_this_month: 234
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
            <h1 className="text-4xl font-bold text-glass-bright mb-2">Advanced Website Builder</h1>
            <p className="text-glass-muted">Create high-converting dealership websites with advanced widgets</p>
          </div>
          
          <div className="flex gap-3">
            <Button 
              onClick={() => setShowBuilderModal(true)}
              className="btn-neon"
            >
              <Plus className="w-4 h-4 mr-2" />
              New Website
            </Button>
            <Button variant="outline" className="text-glass-bright">
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </Button>
          </div>
        </div>

        {/* Analytics Overview */}
        <AnalyticsOverview analytics={analytics} />

        {/* Tabs */}
        <div className="flex gap-4 mb-6">
          <Button
            onClick={() => setActiveTab('websites')}
            className={`${activeTab === 'websites' ? 'bg-purple-600 text-white' : 'text-glass-bright hover:bg-glass'}`}
          >
            <Globe className="w-4 h-4 mr-2" />
            Websites ({websites.length})
          </Button>
          <Button
            onClick={() => setActiveTab('widgets')}
            className={`${activeTab === 'widgets' ? 'bg-purple-600 text-white' : 'text-glass-bright hover:bg-glass'}`}
          >
            <Layout className="w-4 h-4 mr-2" />
            Widgets ({widgets.length})
          </Button>
          <Button
            onClick={() => setActiveTab('analytics')}
            className={`${activeTab === 'analytics' ? 'bg-purple-600 text-white' : 'text-glass-bright hover:bg-glass'}`}
          >
            <BarChart3 className="w-4 h-4 mr-2" />
            Analytics
          </Button>
          <Button
            onClick={() => setActiveTab('templates')}
            className={`${activeTab === 'templates' ? 'bg-purple-600 text-white' : 'text-glass-bright hover:bg-glass'}`}
          >
            <Palette className="w-4 h-4 mr-2" />
            Templates
          </Button>
        </div>

        {/* Content Area */}
        {activeTab === 'websites' && <WebsitesSection websites={websites} onEdit={setSelectedWebsite} />}
        {activeTab === 'widgets' && <WidgetsSection widgets={widgets} />}
        {activeTab === 'analytics' && <AnalyticsSection analytics={analytics} websites={websites} />}
        {activeTab === 'templates' && <TemplatesSection />}

        {/* Website Builder Modal */}
        {showBuilderModal && (
          <WebsiteBuilderModal 
            website={selectedWebsite}
            onClose={() => {
              setShowBuilderModal(false);
              setSelectedWebsite(null);
            }}
            onSave={(website) => {
              if (selectedWebsite) {
                setWebsites(websites.map(w => w.id === website.id ? website : w));
              } else {
                setWebsites([website, ...websites]);
              }
              setShowBuilderModal(false);
              setSelectedWebsite(null);
            }}
          />
        )}
      </div>
    </div>
  );
};

// Analytics Overview Component
const AnalyticsOverview = ({ analytics }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <Card className="glass-card">
        <CardContent className="p-6 text-center">
          <Globe className="w-8 h-8 mx-auto mb-2 neon-blue" />
          <div className="text-2xl font-bold text-glass-bright">{analytics.total_websites || 0}</div>
          <div className="text-sm text-glass-muted">Active Websites</div>
        </CardContent>
      </Card>
      
      <Card className="glass-card">
        <CardContent className="p-6 text-center">
          <Users className="w-8 h-8 mx-auto mb-2 neon-green" />
          <div className="text-2xl font-bold neon-green">{(analytics.total_visits || 0).toLocaleString()}</div>
          <div className="text-sm text-glass-muted">Total Visits</div>
        </CardContent>
      </Card>
      
      <Card className="glass-card">
        <CardContent className="p-6 text-center">
          <Star className="w-8 h-8 mx-auto mb-2 neon-orange" />
          <div className="text-2xl font-bold neon-orange">{analytics.total_conversions || 0}</div>
          <div className="text-sm text-glass-muted">Conversions</div>
        </CardContent>
      </Card>
      
      <Card className="glass-card">
        <CardContent className="p-6 text-center">
          <BarChart3 className="w-8 h-8 mx-auto mb-2 neon-purple" />
          <div className="text-2xl font-bold neon-purple">{analytics.avg_conversion_rate || 0}%</div>
          <div className="text-sm text-glass-muted">Avg Conversion</div>
        </CardContent>
      </Card>
    </div>
  );
};

// Websites Section Component
const WebsitesSection = ({ websites, onEdit }) => {
  return (
    <div className="space-y-4">
      {websites.map((website) => (
        <WebsiteCard key={website.id} website={website} onEdit={onEdit} />
      ))}
    </div>
  );
};

// Website Card Component
const WebsiteCard = ({ website, onEdit }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'published': return 'bg-green-600 text-white';
      case 'draft': return 'bg-yellow-600 text-white';
      case 'archived': return 'bg-gray-600 text-white';
      default: return 'bg-gray-600 text-white';
    }
  };

  return (
    <Card className="glass-card hover:scale-105 transition-transform duration-200">
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h3 className="text-xl font-semibold text-glass-bright">{website.name}</h3>
              <Badge className={getStatusColor(website.status)}>
                {website.status.toUpperCase()}
              </Badge>
              <Badge className="bg-blue-600 text-white">
                SEO: {website.seo_score}
              </Badge>
            </div>
            
            <p className="text-glass-muted mb-3">{website.url}</p>
            
            <div className="flex flex-wrap gap-2 mb-4">
              {website.features?.map((feature, index) => (
                <Badge key={index} className="bg-glass-muted text-glass-bright text-xs">
                  {feature.replace('_', ' ')}
                </Badge>
              ))}
            </div>
          </div>

          <div className="flex gap-2 ml-4">
            <Button size="sm" onClick={() => onEdit(website)} className="btn-neon">
              <Edit className="w-3 h-3 mr-1" />
              Edit
            </Button>
            <Button size="sm" variant="outline" className="text-glass-bright">
              <Eye className="w-3 h-3 mr-1" />
              View
            </Button>
            <Button size="sm" variant="outline" className="text-glass-bright">
              <Share2 className="w-3 h-3" />
            </Button>
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="grid grid-cols-3 gap-4 pt-4 border-t border-glass-muted/20">
          <div className="text-center">
            <div className="text-lg font-bold text-glass-bright">{website.visits?.toLocaleString()}</div>
            <div className="text-xs text-glass-muted">Visits</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold neon-green">{website.conversions}</div>
            <div className="text-xs text-glass-muted">Conversions</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold neon-orange">{website.conversion_rate}%</div>
            <div className="text-xs text-glass-muted">Conv. Rate</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Widgets Section Component
const WidgetsSection = ({ widgets }) => {
  const getWidgetIcon = (type) => {
    switch (type) {
      case 'chat_widget': return <MessageCircle className="w-6 h-6" />;
      case 'lead_form': return <FileText className="w-6 h-6" />;
      case 'reviews_feed': return <Star className="w-6 h-6" />;
      case 'appointment_booking': return <Calendar className="w-6 h-6" />;
      case 'payment_calculator': return <BarChart3 className="w-6 h-6" />;
      default: return <Layout className="w-6 h-6" />;
    }
  };

  const getWidgetColor = (type) => {
    switch (type) {
      case 'chat_widget': return 'bg-blue-600';
      case 'lead_form': return 'bg-green-600';
      case 'reviews_feed': return 'bg-yellow-600';
      case 'appointment_booking': return 'bg-purple-600';
      case 'payment_calculator': return 'bg-orange-600';
      default: return 'bg-gray-600';
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {widgets.map((widget) => (
        <Card key={widget.id} className="glass-card hover:scale-105 transition-transform duration-200">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className={`p-3 rounded-full ${getWidgetColor(widget.type)} text-white`}>
                {getWidgetIcon(widget.type)}
              </div>
              <div>
                <h3 className="font-semibold text-glass-bright">{widget.name}</h3>
                <p className="text-sm text-glass-muted capitalize">{widget.type.replace('_', ' ')}</p>
              </div>
            </div>

            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-glass-muted">Status:</span>
                <Badge className={widget.status === 'active' ? 'bg-green-600 text-white' : 'bg-gray-600 text-white'}>
                  {widget.status}
                </Badge>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-glass-muted">Websites:</span>
                <span className="text-glass-bright">{widget.websites}</span>
              </div>
              {widget.leads_generated && (
                <div className="flex justify-between text-sm">
                  <span className="text-glass-muted">Leads Generated:</span>
                  <span className="text-glass-bright font-semibold">{widget.leads_generated}</span>
                </div>
              )}
            </div>

            <div className="flex gap-2">
              <Button size="sm" className="btn-neon flex-1">
                <Settings className="w-3 h-3 mr-1" />
                Configure
              </Button>
              <Button size="sm" variant="outline" className="text-glass-bright">
                <Code className="w-3 h-3" />
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}

      {/* Add New Widget Card */}
      <Card className="glass-card border-2 border-dashed border-glass-muted/50 hover:border-purple-500 transition-colors cursor-pointer">
        <CardContent className="p-6 text-center">
          <Plus className="w-12 h-12 mx-auto mb-4 text-glass-muted" />
          <h3 className="text-lg font-semibold text-glass-bright mb-2">Add New Widget</h3>
          <p className="text-sm text-glass-muted mb-4">Enhance your websites with interactive widgets</p>
          <Button className="btn-neon">
            Create Widget
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

// Analytics Section Component
const AnalyticsSection = ({ analytics, websites }) => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Performance Chart */}
        <Card className="glass-card">
          <CardContent className="p-6">
            <h3 className="text-xl font-semibold text-glass-bright mb-4">Website Performance</h3>
            <div className="h-64 flex items-center justify-center text-glass-muted">
              <BarChart3 className="w-16 h-16 mb-4" />
            </div>
            <p className="text-center text-glass-muted">Performance analytics chart would appear here</p>
          </CardContent>
        </Card>

        {/* Top Performers */}
        <Card className="glass-card">
          <CardContent className="p-6">
            <h3 className="text-xl font-semibold text-glass-bright mb-4">Top Performing Pages</h3>
            <div className="space-y-3">
              {websites.slice(0, 3).map((website, index) => (
                <div key={website.id} className="flex items-center justify-between p-3 bg-glass-muted/10 rounded">
                  <div>
                    <div className="font-medium text-glass-bright">{website.name}</div>
                    <div className="text-sm text-glass-muted">{website.visits} visits</div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold neon-green">{website.conversion_rate}%</div>
                    <div className="text-xs text-glass-muted">Conversion</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Device Analytics */}
      <Card className="glass-card">
        <CardContent className="p-6">
          <h3 className="text-xl font-semibold text-glass-bright mb-4">Device Breakdown</h3>
          <div className="grid grid-cols-3 gap-6">
            <div className="text-center">
              <Monitor className="w-8 h-8 mx-auto mb-2 text-blue-400" />
              <div className="text-2xl font-bold text-glass-bright">45%</div>
              <div className="text-sm text-glass-muted">Desktop</div>
            </div>
            <div className="text-center">
              <Smartphone className="w-8 h-8 mx-auto mb-2 text-green-400" />
              <div className="text-2xl font-bold text-glass-bright">42%</div>
              <div className="text-sm text-glass-muted">Mobile</div>
            </div>
            <div className="text-center">
              <Tablet className="w-8 h-8 mx-auto mb-2 text-orange-400" />
              <div className="text-2xl font-bold text-glass-bright">13%</div>
              <div className="text-sm text-glass-muted">Tablet</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Templates Section Component
const TemplatesSection = () => {
  const templates = [
    {
      id: 'dealership_modern',
      name: 'Modern Dealership',
      description: 'Clean, modern design perfect for car dealerships',
      preview: '/api/placeholder/300/200',
      features: ['Inventory showcase', 'Lead forms', 'Chat widget', 'Mobile responsive'],
      price: 'Free'
    },
    {
      id: 'service_focused',
      name: 'Service Center',
      description: 'Optimized for service department marketing',
      preview: '/api/placeholder/300/200', 
      features: ['Service booking', 'Calculator widgets', 'Testimonials', 'SEO optimized'],
      price: 'Free'
    },
    {
      id: 'finance_calculator',
      name: 'Finance Calculator',
      description: 'Lead generation through financing tools',
      preview: '/api/placeholder/300/200',
      features: ['Payment calculator', 'Trade estimator', 'Credit application', 'Lead capture'],
      price: 'Free'
    }
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {templates.map((template) => (
        <Card key={template.id} className="glass-card hover:scale-105 transition-transform duration-200">
          <CardContent className="p-6">
            <img 
              src={template.preview} 
              alt={template.name}
              className="w-full h-32 object-cover rounded-lg mb-4"
            />
            
            <h3 className="text-lg font-semibold text-glass-bright mb-2">{template.name}</h3>
            <p className="text-sm text-glass-muted mb-4">{template.description}</p>
            
            <div className="space-y-2 mb-4">
              {template.features.map((feature, index) => (
                <div key={index} className="flex items-center text-xs text-glass-muted">
                  <Star className="w-3 h-3 mr-2 text-yellow-400" />
                  {feature}
                </div>
              ))}
            </div>
            
            <div className="flex justify-between items-center">
              <Badge className="bg-green-600 text-white">{template.price}</Badge>
              <Button className="btn-neon">
                Use Template
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

// Website Builder Modal Component
const WebsiteBuilderModal = ({ website, onClose, onSave }) => {
  const [websiteData, setWebsiteData] = useState({
    name: website?.name || '',
    template: website?.template || 'dealership_modern',
    features: website?.features || [],
    domain: website?.url || ''
  });

  const availableFeatures = [
    'chat_widget', 'lead_forms', 'inventory_feed', 'reviews_display',
    'appointment_booking', 'payment_calculator', 'trade_estimator',
    'testimonials', 'blog', 'seo_optimization'
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const newWebsite = {
      id: website?.id || `site_${Date.now()}`,
      ...websiteData,
      url: `https://${websiteData.name.toLowerCase().replace(/\s+/g, '-')}.jokervision.app`,
      status: website?.status || 'draft',
      visits: website?.visits || 0,
      conversions: website?.conversions || 0,
      conversion_rate: website?.conversion_rate || 0,
      created_at: website?.created_at || new Date().toISOString(),
      last_updated: new Date().toISOString(),
      seo_score: 85
    };
    
    onSave(newWebsite);
    toast.success(`Website ${website ? 'updated' : 'created'} successfully!`);
  };

  const toggleFeature = (feature) => {
    setWebsiteData({
      ...websiteData,
      features: websiteData.features.includes(feature)
        ? websiteData.features.filter(f => f !== feature)
        : [...websiteData.features, feature]
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="glass-card max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <CardContent className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-semibold text-glass-bright">
              {website ? 'Edit Website' : 'Create New Website'}
            </h3>
            <Button onClick={onClose} size="sm" variant="outline" className="text-glass-bright">
              ✕
            </Button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-glass-bright mb-1">Website Name</label>
              <Input
                value={websiteData.name}
                onChange={(e) => setWebsiteData({...websiteData, name: e.target.value})}
                placeholder="e.g., Toyota Sales Landing Page"
                className="text-glass w-full"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-glass-bright mb-1">Template</label>
              <select 
                value={websiteData.template} 
                onChange={(e) => setWebsiteData({...websiteData, template: e.target.value})}
                className="px-3 py-2 border rounded w-full text-glass"
              >
                <option value="dealership_modern">Modern Dealership</option>
                <option value="service_focused">Service Center</option>
                <option value="finance_calculator">Finance Calculator</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-glass-bright mb-1">Features</label>
              <div className="grid grid-cols-2 gap-2">
                {availableFeatures.map((feature) => (
                  <label key={feature} className="flex items-center p-2 rounded border cursor-pointer hover:bg-glass-muted/10">
                    <input
                      type="checkbox"
                      checked={websiteData.features.includes(feature)}
                      onChange={() => toggleFeature(feature)}
                      className="mr-2"
                    />
                    <span className="text-sm text-glass-bright capitalize">{feature.replace('_', ' ')}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button type="submit" className="btn-neon flex-1">
                <Plus className="w-4 h-4 mr-2" />
                {website ? 'Update Website' : 'Create Website'}
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

export default AdvancedWebsiteBuilder;