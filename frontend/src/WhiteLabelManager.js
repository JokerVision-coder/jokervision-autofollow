import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { 
  Building2, Palette, Settings, Users, Globe, Smartphone, Mail,
  Crown, Badge, Eye, Edit, Copy, Download, Upload, RefreshCw,
  Check, X, Star, Zap, Shield, Code, Database, ChevronRight
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
const BadgeComponent = ({ children, className = "" }) => <span className={`px-2 py-1 rounded text-xs ${className}`}>{children}</span>;

const WhiteLabelManager = () => {
  const [activeTab, setActiveTab] = useState('tenants');
  const [tenants, setTenants] = useState([]);
  const [whitelabelConfig, setWhitelabelConfig] = useState({});
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showTenantModal, setShowTenantModal] = useState(false);
  const [selectedTenant, setSelectedTenant] = useState(null);

  useEffect(() => {
    fetchWhiteLabelData();
  }, []);

  const fetchWhiteLabelData = async () => {
    try {
      setLoading(true);
      const [tenantsRes, configRes, templatesRes] = await Promise.all([
        axios.get(`${API}/whitelabel/tenants?master_tenant=default_dealership`),
        axios.get(`${API}/whitelabel/config?master_tenant=default_dealership`),
        axios.get(`${API}/whitelabel/templates?master_tenant=default_dealership`)
      ]);

      setTenants(tenantsRes.data.tenants || []);
      setWhitelabelConfig(configRes.data || {});
      setTemplates(templatesRes.data.templates || []);
    } catch (error) {
      console.error('Error fetching white label data:', error);
      loadMockData();
    } finally {
      setLoading(false);
    }
  };

  const loadMockData = () => {
    setTenants([
      {
        id: 'tenant_auto_city',
        name: 'Auto City Motors',
        domain: 'autocity.jokervision.app',
        status: 'active',
        plan: 'professional',
        users: 12,
        leads: 456,
        created_at: '2024-01-15T10:00:00Z',
        branding: {
          logo: 'https://example.com/autocity-logo.png',
          primary_color: '#1e40af',
          secondary_color: '#3b82f6',
          company_name: 'Auto City Motors'
        },
        features: ['leads', 'inventory', 'marketing', 'analytics'],
        subscription_status: 'paid',
        monthly_revenue: 199
      },
      {
        id: 'tenant_premier_auto',
        name: 'Premier Auto Sales',
        domain: 'premierauto.jokervision.app',
        status: 'active',
        plan: 'enterprise',
        users: 25,
        leads: 1234,
        created_at: '2024-01-08T14:30:00Z',
        branding: {
          logo: 'https://example.com/premier-logo.png',
          primary_color: '#dc2626',
          secondary_color: '#ef4444',
          company_name: 'Premier Auto Sales'
        },
        features: ['leads', 'inventory', 'marketing', 'analytics', 'voice', 'ai_toolkit'],
        subscription_status: 'paid',
        monthly_revenue: 399
      },
      {
        id: 'tenant_metro_motors',
        name: 'Metro Motors',
        domain: 'metromotors.jokervision.app',
        status: 'trial',
        plan: 'starter',
        users: 3,
        leads: 89,
        created_at: '2024-01-22T09:15:00Z',
        branding: {
          logo: 'https://example.com/metro-logo.png',
          primary_color: '#059669',
          secondary_color: '#10b981',
          company_name: 'Metro Motors'
        },
        features: ['leads', 'inventory'],
        subscription_status: 'trial',
        monthly_revenue: 0
      }
    ]);

    setWhitelabelConfig({
      master_branding: {
        platform_name: 'JokerVision AutoFollow',
        master_logo: 'https://example.com/jokervision-logo.png',
        default_theme: 'dark_purple'
      },
      customization_options: {
        logo_upload: true,
        color_customization: true,
        domain_mapping: true,
        email_templates: true,
        app_icons: true,
        favicon: true
      },
      revenue_sharing: {
        master_percentage: 30,
        tenant_percentage: 70,
        monthly_platform_fee: 50
      },
      total_tenants: 3,
      active_tenants: 2,
      trial_tenants: 1,
      monthly_recurring_revenue: 598,
      total_users: 40,
      total_leads: 1779
    });

    setTemplates([
      {
        id: 'template_dealership_pro',
        name: 'Dealership Pro',
        category: 'automotive',
        description: 'Professional automotive dealership template',
        preview_url: 'https://example.com/preview/dealership-pro',
        features: ['inventory', 'leads', 'financing', 'service'],
        color_schemes: ['blue', 'red', 'green', 'purple'],
        customizable_elements: ['logo', 'colors', 'fonts', 'layout'],
        price: 'free'
      },
      {
        id: 'template_luxury_auto',
        name: 'Luxury Auto',
        category: 'luxury',
        description: 'Premium template for luxury car dealers',
        preview_url: 'https://example.com/preview/luxury-auto',
        features: ['inventory', 'leads', 'vip_service', 'concierge'],
        color_schemes: ['gold', 'black', 'silver'],
        customizable_elements: ['logo', 'colors', 'fonts', 'layout', 'animations'],
        price: 'premium'
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
            <h1 className="text-4xl font-bold text-glass-bright mb-2">White Label Manager</h1>
            <p className="text-glass-muted">Multi-tenant platform management for dealership partners</p>
          </div>
          
          <div className="flex gap-3">
            <Button onClick={() => setShowTenantModal(true)} className="btn-neon">
              <Building2 className="w-4 h-4 mr-2" />
              Add Tenant
            </Button>
            <Button onClick={fetchWhiteLabelData} variant="outline" className="text-glass-bright">
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
            <Button variant="outline" className="text-glass-bright">
              <Settings className="w-4 h-4 mr-2" />
              Platform Settings
            </Button>
          </div>
        </div>

        {/* Platform Overview */}
        <PlatformOverview config={whitelabelConfig} />

        {/* Tabs */}
        <div className="flex gap-4 mb-6">
          <Button
            onClick={() => setActiveTab('tenants')}
            className={`${activeTab === 'tenants' ? 'bg-purple-600 text-white' : 'text-glass-bright hover:bg-glass'}`}
          >
            <Building2 className="w-4 h-4 mr-2" />
            Tenants ({tenants.length})
          </Button>
          <Button
            onClick={() => setActiveTab('branding')}
            className={`${activeTab === 'branding' ? 'bg-purple-600 text-white' : 'text-glass-bright hover:bg-glass'}`}
          >
            <Palette className="w-4 h-4 mr-2" />
            Branding
          </Button>
          <Button
            onClick={() => setActiveTab('templates')}
            className={`${activeTab === 'templates' ? 'bg-purple-600 text-white' : 'text-glass-bright hover:bg-glass'}`}
          >
            <Crown className="w-4 h-4 mr-2" />
            Templates
          </Button>
          <Button
            onClick={() => setActiveTab('revenue')}
            className={`${activeTab === 'revenue' ? 'bg-purple-600 text-white' : 'text-glass-bright hover:bg-glass'}`}
          >
            <Zap className="w-4 h-4 mr-2" />
            Revenue
          </Button>
        </div>

        {/* Content Area */}
        {activeTab === 'tenants' && <TenantsSection tenants={tenants} onEdit={setSelectedTenant} />}
        {activeTab === 'branding' && <BrandingSection config={whitelabelConfig} />}
        {activeTab === 'templates' && <TemplatesSection templates={templates} />}
        {activeTab === 'revenue' && <RevenueSection config={whitelabelConfig} tenants={tenants} />}

        {/* Tenant Modal */}
        {showTenantModal && (
          <TenantModal 
            tenant={selectedTenant}
            onClose={() => {
              setShowTenantModal(false);
              setSelectedTenant(null);
            }}
            onSave={(tenant) => {
              if (selectedTenant) {
                setTenants(tenants.map(t => t.id === tenant.id ? tenant : t));
              } else {
                setTenants([tenant, ...tenants]);
              }
              setShowTenantModal(false);
              setSelectedTenant(null);
            }}
          />
        )}
      </div>
    </div>
  );
};

// Platform Overview Component
const PlatformOverview = ({ config }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
      <Card className="glass-card">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-glass-muted">Total Tenants</p>
              <p className="text-2xl font-bold text-glass-bright">
                {config.total_tenants || 0}
              </p>
            </div>
            <Building2 className="w-8 h-8 neon-blue" />
          </div>
          <div className="flex items-center mt-2 text-sm text-blue-400">
            <span className="ml-1">{config.active_tenants} active</span>
          </div>
        </CardContent>
      </Card>

      <Card className="glass-card">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-glass-muted">Monthly Revenue</p>
              <p className="text-2xl font-bold text-glass-bright">
                ${(config.monthly_recurring_revenue || 0).toLocaleString()}
              </p>
            </div>
            <Zap className="w-8 h-8 neon-green" />
          </div>
          <div className="flex items-center mt-2 text-sm text-green-400">
            <span className="ml-1">+15% this month</span>
          </div>
        </CardContent>
      </Card>

      <Card className="glass-card">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-glass-muted">Total Users</p>
              <p className="text-2xl font-bold text-glass-bright">
                {(config.total_users || 0).toLocaleString()}
              </p>
            </div>
            <Users className="w-8 h-8 neon-orange" />
          </div>
          <div className="flex items-center mt-2 text-sm text-orange-400">
            <span className="ml-1">Across all tenants</span>
          </div>
        </CardContent>
      </Card>

      <Card className="glass-card">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-glass-muted">Total Leads</p>
              <p className="text-2xl font-bold text-glass-bright">
                {(config.total_leads || 0).toLocaleString()}
              </p>
            </div>
            <Star className="w-8 h-8 neon-purple" />
          </div>
          <div className="flex items-center mt-2 text-sm text-purple-400">
            <span className="ml-1">Platform-wide</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Tenants Section Component
const TenantsSection = ({ tenants, onEdit }) => {
  return (
    <div className="space-y-4">
      {tenants.map((tenant) => (
        <TenantCard key={tenant.id} tenant={tenant} onEdit={onEdit} />
      ))}
    </div>
  );
};

// Tenant Card Component
const TenantCard = ({ tenant, onEdit }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-600 text-white';
      case 'trial': return 'bg-yellow-600 text-white';
      case 'suspended': return 'bg-red-600 text-white';
      default: return 'bg-gray-600 text-white';
    }
  };

  const getPlanColor = (plan) => {
    switch (plan) {
      case 'starter': return 'bg-blue-600 text-white';
      case 'professional': return 'bg-purple-600 text-white';
      case 'enterprise': return 'bg-orange-600 text-white';
      default: return 'bg-gray-600 text-white';
    }
  };

  return (
    <Card className="glass-card hover:scale-105 transition-transform duration-200">
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-4">
            <div 
              className="w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold"
              style={{ backgroundColor: tenant.branding?.primary_color || '#6366f1' }}
            >
              {tenant.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h3 className="text-xl font-semibold text-glass-bright">{tenant.name}</h3>
              <p className="text-glass-muted">{tenant.domain}</p>
              <p className="text-xs text-glass-muted">
                Created: {new Date(tenant.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>
          
          <div className="flex flex-col items-end gap-2">
            <div className="flex gap-2">
              <BadgeComponent className={getStatusColor(tenant.status)}>
                {tenant.status.toUpperCase()}
              </BadgeComponent>
              <BadgeComponent className={getPlanColor(tenant.plan)}>
                {tenant.plan.toUpperCase()}
              </BadgeComponent>
            </div>
            <div className="text-sm text-glass-muted">
              ${tenant.monthly_revenue}/month
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="text-center">
            <div className="text-lg font-bold text-glass-bright">{tenant.users}</div>
            <div className="text-xs text-glass-muted">Users</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold neon-green">{tenant.leads}</div>
            <div className="text-xs text-glass-muted">Leads</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold neon-blue">{tenant.features?.length || 0}</div>
            <div className="text-xs text-glass-muted">Features</div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          {tenant.features?.slice(0, 4).map((feature, index) => (
            <BadgeComponent key={index} className="bg-glass-muted text-glass-bright text-xs">
              {feature}
            </BadgeComponent>
          ))}
          {tenant.features?.length > 4 && (
            <BadgeComponent className="bg-glass-muted text-glass-bright text-xs">
              +{tenant.features.length - 4} more
            </BadgeComponent>
          )}
        </div>

        <div className="flex justify-between items-center">
          <div className="flex gap-2">
            <Button size="sm" onClick={() => onEdit(tenant)} className="btn-neon">
              <Edit className="w-3 h-3 mr-1" />
              Manage
            </Button>
            <Button size="sm" variant="outline" className="text-glass-bright">
              <Eye className="w-3 h-3 mr-1" />
              Preview
            </Button>
            <Button size="sm" variant="outline" className="text-glass-bright">
              <Globe className="w-3 h-3" />
            </Button>
          </div>
          
          <div className="text-xs text-glass-muted">
            Subscription: {tenant.subscription_status}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Branding Section Component
const BrandingSection = ({ config }) => {
  return (
    <div className="space-y-6">
      <Card className="glass-card">
        <CardContent className="p-6">
          <h3 className="text-xl font-semibold text-glass-bright mb-4">Master Platform Branding</h3>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-glass-bright mb-3">Platform Identity</h4>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-glass-bright mb-1">Platform Name</label>
                  <Input
                    value={config.master_branding?.platform_name || ''}
                    className="text-glass w-full"
                    placeholder="JokerVision AutoFollow"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-glass-bright mb-1">Master Logo URL</label>
                  <Input
                    value={config.master_branding?.master_logo || ''}
                    className="text-glass w-full"
                    placeholder="https://example.com/logo.png"
                  />
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-medium text-glass-bright mb-3">Customization Options</h4>
              <div className="space-y-2">
                {Object.entries(config.customization_options || {}).map(([key, value]) => (
                  <label key={key} className="flex items-center p-2 rounded border cursor-pointer hover:bg-glass-muted/10">
                    <input
                      type="checkbox"
                      checked={value}
                      className="mr-3"
                    />
                    <span className="text-glass-bright capitalize">{key.replace('_', ' ')}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="glass-card">
        <CardContent className="p-6">
          <h3 className="text-xl font-semibold text-glass-bright mb-4">Revenue Sharing Model</h3>
          
          <div className="grid grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold neon-green">{config.revenue_sharing?.master_percentage}%</div>
              <div className="text-sm text-glass-muted">Platform Share</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold neon-blue">{config.revenue_sharing?.tenant_percentage}%</div>
              <div className="text-sm text-glass-muted">Tenant Share</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold neon-orange">${config.revenue_sharing?.monthly_platform_fee}</div>
              <div className="text-sm text-glass-muted">Platform Fee</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Templates Section Component
const TemplatesSection = ({ templates }) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {templates.map((template) => (
        <TemplateCard key={template.id} template={template} />
      ))}
    </div>
  );
};

// Template Card Component
const TemplateCard = ({ template }) => {
  return (
    <Card className="glass-card hover:scale-105 transition-transform duration-200">
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-lg font-semibold text-glass-bright">{template.name}</h3>
            <p className="text-sm text-glass-muted mb-2">{template.description}</p>
            <BadgeComponent className="bg-blue-600 text-white text-xs">
              {template.category}
            </BadgeComponent>
          </div>
          
          <BadgeComponent className={template.price === 'free' ? 'bg-green-600 text-white' : 'bg-orange-600 text-white'}>
            {template.price === 'free' ? 'FREE' : 'PREMIUM'}
          </BadgeComponent>
        </div>

        <div className="mb-4">
          <h4 className="font-medium text-glass-bright mb-2">Features</h4>
          <div className="flex flex-wrap gap-1">
            {template.features?.map((feature, index) => (
              <BadgeComponent key={index} className="bg-glass-muted text-glass-bright text-xs">
                {feature}
              </BadgeComponent>
            ))}
          </div>
        </div>

        <div className="mb-4">
          <h4 className="font-medium text-glass-bright mb-2">Color Schemes</h4>
          <div className="flex gap-2">
            {template.color_schemes?.map((color, index) => (
              <div
                key={index}
                className="w-6 h-6 rounded-full border-2 border-gray-300"
                style={{ backgroundColor: color }}
                title={color}
              ></div>
            ))}
          </div>
        </div>

        <div className="flex gap-3">
          <Button className="btn-neon flex-1">
            <Eye className="w-4 h-4 mr-2" />
            Preview
          </Button>
          <Button variant="outline" className="text-glass-bright">
            <Copy className="w-4 h-4 mr-2" />
            Clone
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

// Revenue Section Component
const RevenueSection = ({ config, tenants }) => {
  const totalRevenue = tenants.reduce((sum, tenant) => sum + (tenant.monthly_revenue || 0), 0);
  const platformRevenue = totalRevenue * (config.revenue_sharing?.master_percentage || 30) / 100;
  const tenantRevenue = totalRevenue - platformRevenue;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="glass-card">
          <CardContent className="p-6 text-center">
            <Zap className="w-12 h-12 mx-auto mb-4 neon-green" />
            <div className="text-3xl font-bold text-glass-bright">${totalRevenue.toLocaleString()}</div>
            <div className="text-sm text-glass-muted">Total Monthly Revenue</div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardContent className="p-6 text-center">
            <Crown className="w-12 h-12 mx-auto mb-4 neon-purple" />
            <div className="text-3xl font-bold neon-purple">${platformRevenue.toFixed(0)}</div>
            <div className="text-sm text-glass-muted">Platform Revenue</div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardContent className="p-6 text-center">
            <Building2 className="w-12 h-12 mx-auto mb-4 neon-blue" />
            <div className="text-3xl font-bold neon-blue">${tenantRevenue.toFixed(0)}</div>
            <div className="text-sm text-glass-muted">Partner Revenue</div>
          </CardContent>
        </Card>
      </div>

      <Card className="glass-card">
        <CardContent className="p-6">
          <h3 className="text-xl font-semibold text-glass-bright mb-4">Revenue by Tenant</h3>
          
          <div className="space-y-3">
            {tenants.map((tenant) => (
              <div key={tenant.id} className="flex justify-between items-center p-3 bg-glass-muted/10 rounded">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-8 h-8 rounded flex items-center justify-center text-white font-bold text-sm"
                    style={{ backgroundColor: tenant.branding?.primary_color || '#6366f1' }}
                  >
                    {tenant.name.charAt(0)}
                  </div>
                  <span className="text-glass-bright">{tenant.name}</span>
                </div>
                
                <div className="text-right">
                  <div className="text-glass-bright font-semibold">${tenant.monthly_revenue}/month</div>
                  <div className="text-xs text-glass-muted">
                    Platform: ${((tenant.monthly_revenue || 0) * 0.3).toFixed(0)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Tenant Modal Component
const TenantModal = ({ tenant, onClose, onSave }) => {
  const [tenantData, setTenantData] = useState({
    name: tenant?.name || '',
    domain: tenant?.domain || '',
    plan: tenant?.plan || 'starter',
    branding: {
      company_name: tenant?.branding?.company_name || '',
      primary_color: tenant?.branding?.primary_color || '#6366f1',
      secondary_color: tenant?.branding?.secondary_color || '#3b82f6'
    },
    features: tenant?.features || ['leads', 'inventory']
  });

  const allFeatures = [
    'leads', 'inventory', 'marketing', 'analytics', 'voice', 'ai_toolkit',
    'social_media', 'reviews', 'calendar', 'workflows', 'websites'
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const newTenant = {
      id: tenant?.id || `tenant_${Date.now()}`,
      ...tenantData,
      status: tenant?.status || 'trial',
      users: tenant?.users || 1,
      leads: tenant?.leads || 0,
      created_at: tenant?.created_at || new Date().toISOString(),
      subscription_status: tenant?.subscription_status || 'trial',
      monthly_revenue: tenant?.monthly_revenue || 0
    };
    
    onSave(newTenant);
    toast.success(`Tenant ${tenant ? 'updated' : 'created'} successfully!`);
  };

  const toggleFeature = (feature) => {
    setTenantData({
      ...tenantData,
      features: tenantData.features.includes(feature)
        ? tenantData.features.filter(f => f !== feature)
        : [...tenantData.features, feature]
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="glass-card max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <CardContent className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-semibold text-glass-bright">
              {tenant ? 'Edit Tenant' : 'Create New Tenant'}
            </h3>
            <Button onClick={onClose} size="sm" variant="outline" className="text-glass-bright">
              ✕
            </Button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-glass-bright mb-1">Company Name</label>
                <Input
                  value={tenantData.name}
                  onChange={(e) => setTenantData({...tenantData, name: e.target.value})}
                  placeholder="e.g., Auto City Motors"
                  className="text-glass w-full"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-glass-bright mb-1">Domain</label>
                <Input
                  value={tenantData.domain}
                  onChange={(e) => setTenantData({...tenantData, domain: e.target.value})}
                  placeholder="e.g., autocity.jokervision.app"
                  className="text-glass w-full"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-glass-bright mb-1">Subscription Plan</label>
              <select 
                value={tenantData.plan} 
                onChange={(e) => setTenantData({...tenantData, plan: e.target.value})}
                className="px-3 py-2 border rounded w-full text-glass"
              >
                <option value="starter">Starter - $99/month</option>
                <option value="professional">Professional - $199/month</option>
                <option value="enterprise">Enterprise - $399/month</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-glass-bright mb-1">Primary Color</label>
                <Input
                  type="color"
                  value={tenantData.branding.primary_color}
                  onChange={(e) => setTenantData({
                    ...tenantData, 
                    branding: {...tenantData.branding, primary_color: e.target.value}
                  })}
                  className="text-glass w-full h-10"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-glass-bright mb-1">Secondary Color</label>
                <Input
                  type="color"
                  value={tenantData.branding.secondary_color}
                  onChange={(e) => setTenantData({
                    ...tenantData, 
                    branding: {...tenantData.branding, secondary_color: e.target.value}
                  })}
                  className="text-glass w-full h-10"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-glass-bright mb-1">Features</label>
              <div className="grid grid-cols-3 gap-2">
                {allFeatures.map((feature) => (
                  <label key={feature} className="flex items-center p-2 rounded border cursor-pointer hover:bg-glass-muted/10">
                    <input
                      type="checkbox"
                      checked={tenantData.features.includes(feature)}
                      onChange={() => toggleFeature(feature)}
                      className="mr-2"
                    />
                    <span className="text-sm text-glass-bright capitalize">{feature}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button type="submit" className="btn-neon flex-1">
                <Building2 className="w-4 h-4 mr-2" />
                {tenant ? 'Update Tenant' : 'Create Tenant'}
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

export default WhiteLabelManager;