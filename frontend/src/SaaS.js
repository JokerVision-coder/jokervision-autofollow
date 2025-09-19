import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './components/ui/card';
import { Button } from './components/ui/button';
import { Input } from './components/ui/input';
import { Label } from './components/ui/label';
import { Badge } from './components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './components/ui/dialog';
import { toast } from 'sonner';
import { 
  Building2, Users, DollarSign, TrendingUp, Crown, Zap, Star, 
  Check, X, Globe, Phone, Mail, Calendar, BarChart3, Settings,
  CreditCard, Shield, Headphones, Code, Palette
} from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// SaaS Platform Dashboard
const SaaSPlatform = () => {
  const [tenants, setTenants] = useState([]);
  const [analytics, setAnalytics] = useState({});
  const [subscriptionTiers, setSubscriptionTiers] = useState({});
  const [loading, setLoading] = useState(true);
  const [showAddTenantDialog, setShowAddTenantDialog] = useState(false);

  useEffect(() => {
    fetchTenants();
    fetchAnalytics();
    fetchSubscriptionTiers();
  }, []);

  const fetchTenants = async () => {
    try {
      const response = await axios.get(`${API}/tenants`);
      setTenants(response.data);
    } catch (error) {
      console.error('Error fetching tenants:', error);
      toast.error('Failed to load tenants');
    } finally {
      setLoading(false);
    }
  };

  const fetchAnalytics = async () => {
    try {
      const response = await axios.get(`${API}/platform/analytics`);
      setAnalytics(response.data);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    }
  };

  const fetchSubscriptionTiers = async () => {
    try {
      const response = await axios.get(`${API}/subscription-tiers`);
      setSubscriptionTiers(response.data);
    } catch (error) {
      console.error('Error fetching subscription tiers:', error);
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
        <div className="mb-8 fade-in-up">
          <h1 className="text-5xl font-bold joker-brand mb-2">JokerVision SaaS Platform</h1>
          <p className="text-glass-muted text-xl">Multi-Tenant Car Sales Management System</p>
        </div>

        {/* Platform Analytics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="glass-card glass-card-hover">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-glass">Total Tenants</CardTitle>
              <Building2 className="h-4 w-4 neon-purple" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-glass-bright">{analytics.tenants?.total || 0}</div>
              <p className="text-xs text-glass-muted">{analytics.tenants?.active || 0} active</p>
            </CardContent>
          </Card>

          <Card className="glass-card glass-card-hover">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-glass">Monthly Revenue</CardTitle>
              <DollarSign className="h-4 w-4 neon-green" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold profit-positive">
                ${(analytics.revenue?.monthly || 0).toLocaleString()}
              </div>
              <p className="text-xs text-glass-muted">
                ${(analytics.revenue?.annual_projection || 0).toLocaleString()} projected annually
              </p>
            </CardContent>
          </Card>

          <Card className="glass-card glass-card-hover">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-glass">Conversion Rate</CardTitle>
              <TrendingUp className="h-4 w-4 neon-cyan" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold neon-cyan">
                {(analytics.tenants?.conversion_rate || 0).toFixed(1)}%
              </div>
              <p className="text-xs text-glass-muted">Trial to paid conversion</p>
            </CardContent>
          </Card>

          <Card className="glass-card glass-card-hover">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-glass">AI Responses</CardTitle>
              <Zap className="h-4 w-4 neon-orange" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold neon-orange">
                {(analytics.usage?.total_ai_responses || 0).toLocaleString()}
              </div>
              <p className="text-xs text-glass-muted">This month</p>
            </CardContent>
          </Card>
        </div>

        {/* Subscription Tiers Overview */}
        <Card className="glass-card mb-8">
          <CardHeader>
            <CardTitle className="text-xl text-glass-bright flex items-center">
              <Crown className="w-5 h-5 mr-2 neon-orange" />
              Subscription Tiers
            </CardTitle>
            <CardDescription className="text-glass-muted">Revenue breakdown by subscription level</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {Object.entries(subscriptionTiers.tiers || {}).map(([key, tier]) => (
                <div key={key} className="text-center p-6 glass-card rounded-lg">
                  <div className={`text-2xl font-bold mb-2 ${
                    key === 'enterprise' ? 'tier-gold' : 
                    key === 'professional' ? 'tier-silver' : 'tier-bronze'
                  }`}>
                    {tier.name}
                  </div>
                  <div className="text-3xl font-bold profit-positive mb-2">
                    ${tier.price}/mo
                  </div>
                  <div className="text-sm text-glass-muted mb-4">
                    {analytics.subscription_breakdown?.[key] || 0} customers
                  </div>
                  <div className="space-y-2 text-xs text-glass">
                    <div>Up to {tier.max_users} users</div>
                    <div>{tier.max_leads.toLocaleString()} leads</div>
                    <div>{tier.sms_credits} SMS credits</div>
                    {tier.voice_minutes > 0 && <div>{tier.voice_minutes} voice minutes</div>}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Tenant Management */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-glass-bright">Tenant Management</h2>
          <Dialog open={showAddTenantDialog} onOpenChange={setShowAddTenantDialog}>
            <DialogTrigger asChild>
              <Button className="btn-neon">
                <Building2 className="w-4 h-4 mr-2" />
                Add Tenant
              </Button>
            </DialogTrigger>
            <DialogContent className="modal-glass max-w-2xl">
              <DialogHeader>
                <DialogTitle className="text-glass-bright">Add New Tenant</DialogTitle>
                <DialogDescription className="text-glass-muted">
                  Create a new dealership account with subscription
                </DialogDescription>
              </DialogHeader>
              <AddTenantForm 
                subscriptionTiers={subscriptionTiers.tiers || {}}
                onSuccess={() => { 
                  setShowAddTenantDialog(false); 
                  fetchTenants(); 
                  fetchAnalytics();
                }} 
              />
            </DialogContent>
          </Dialog>
        </div>

        <Card className="glass-card">
          <CardContent className="p-0">
            <div className="table-glass">
              <table className="w-full">
                <thead>
                  <tr>
                    <th>Company</th>
                    <th>Subdomain</th>
                    <th>Subscription</th>
                    <th>Status</th>
                    <th>Revenue</th>
                    <th>Created</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {tenants.map((tenant) => (
                    <tr key={tenant.id}>
                      <td>
                        <div>
                          <div className="font-semibold text-glass-bright">{tenant.company_name}</div>
                          <div className="text-sm text-glass-muted">{tenant.email}</div>
                        </div>
                      </td>
                      <td className="font-mono text-neon-cyan">{tenant.subdomain}</td>
                      <td>
                        <Badge className={`badge-neon ${
                          tenant.subscription_tier === 'enterprise' ? 'neon-orange' :
                          tenant.subscription_tier === 'professional' ? 'neon-purple' : 'neon-cyan'
                        }`}>
                          {tenant.subscription_tier}
                        </Badge>
                      </td>
                      <td>
                        <Badge className={`badge-neon ${
                          tenant.subscription_status === 'active' ? 'neon-green' : 'neon-orange'
                        }`}>
                          {tenant.subscription_status}
                        </Badge>
                      </td>
                      <td className="profit-positive font-semibold">
                        ${tenant.monthly_price}/mo
                      </td>
                      <td className="text-glass-muted">
                        {new Date(tenant.created_at).toLocaleDateString()}
                      </td>
                      <td>
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm" className="text-glass">
                            <Settings className="w-4 h-4" />
                          </Button>
                          <Button variant="outline" size="sm" className="text-glass">
                            <BarChart3 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

// Add Tenant Form Component
const AddTenantForm = ({ subscriptionTiers, onSuccess }) => {
  const [formData, setFormData] = useState({
    company_name: '',
    subdomain: '',
    phone: '',
    email: '',
    address: '',
    billing_email: '',
    subscription_tier: 'starter'
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API}/tenants`, formData);
      toast.success('Tenant created successfully!');
      onSuccess();
    } catch (error) {
      console.error('Error creating tenant:', error);
      toast.error(error.response?.data?.detail || 'Failed to create tenant');
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const generateSubdomain = () => {
    const subdomain = formData.company_name
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '')
      .substring(0, 20);
    setFormData({ ...formData, subdomain });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-h-96 overflow-y-auto">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label className="text-glass">Company Name *</Label>
          <Input
            name="company_name"
            value={formData.company_name}
            onChange={handleChange}
            required
            className="text-glass"
          />
        </div>
        <div>
          <Label className="text-glass">Subdomain *</Label>
          <div className="flex">
            <Input
              name="subdomain"
              value={formData.subdomain}
              onChange={handleChange}
              required
              className="text-glass"
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={generateSubdomain}
              className="ml-2"
            >
              Generate
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label className="text-glass">Phone *</Label>
          <Input
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            required
            className="text-glass"
          />
        </div>
        <div>
          <Label className="text-glass">Email *</Label>
          <Input
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            required
            className="text-glass"
          />
        </div>
      </div>

      <div>
        <Label className="text-glass">Address *</Label>
        <Input
          name="address"
          value={formData.address}
          onChange={handleChange}
          required
          className="text-glass"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label className="text-glass">Billing Email *</Label>
          <Input
            name="billing_email"
            type="email"
            value={formData.billing_email}
            onChange={handleChange}
            required
            className="text-glass"
          />
        </div>
        <div>
          <Label className="text-glass">Subscription Tier</Label>
          <Select value={formData.subscription_tier} onValueChange={(value) => setFormData({...formData, subscription_tier: value})}>
            <SelectTrigger className="glass-card text-glass">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="modal-glass">
              {Object.entries(subscriptionTiers).map(([key, tier]) => (
                <SelectItem key={key} value={key}>
                  {tier.name} - ${tier.price}/mo
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Button type="submit" className="w-full btn-neon">
        Create Tenant
      </Button>
    </form>
  );
};

// Pricing Page Component
const PricingPage = () => {
  const [subscriptionTiers, setSubscriptionTiers] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSubscriptionTiers();
  }, []);

  const fetchSubscriptionTiers = async () => {
    try {
      const response = await axios.get(`${API}/subscription-tiers`);
      setSubscriptionTiers(response.data);
    } catch (error) {
      console.error('Error fetching subscription tiers:', error);
    } finally {
      setLoading(false);
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
        <div className="text-center mb-16 fade-in-up">
          <h1 className="text-6xl font-bold joker-brand mb-4">Choose Your Plan</h1>
          <p className="text-glass-muted text-xl max-w-2xl mx-auto">
            Transform your car sales with JokerVision AutoFollow. Choose the perfect plan for your dealership.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {Object.entries(subscriptionTiers.tiers || {}).map(([key, tier]) => (
            <Card key={key} className={`glass-card glass-card-hover relative ${
              key === 'professional' ? 'border-2 border-purple-500 scale-105' : ''
            }`}>
              {key === 'professional' && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <Badge className="badge-neon neon-purple px-4 py-2">
                    <Star className="w-4 h-4 mr-1" />
                    Most Popular
                  </Badge>
                </div>
              )}
              
              <CardHeader className="text-center pb-8">
                <div className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center ${
                  key === 'enterprise' ? 'bg-gradient-to-r from-yellow-400 to-orange-500' :
                  key === 'professional' ? 'bg-gradient-to-r from-purple-500 to-pink-500' :
                  'bg-gradient-to-r from-blue-500 to-cyan-500'
                }`}>
                  {key === 'enterprise' ? <Crown className="w-8 h-8 text-white" /> :
                   key === 'professional' ? <Zap className="w-8 h-8 text-white" /> :
                   <Star className="w-8 h-8 text-white" />}
                </div>
                <CardTitle className="text-2xl text-glass-bright mb-2">{tier.name}</CardTitle>
                <div className="text-4xl font-bold profit-positive mb-2">
                  ${tier.price}<span className="text-lg text-glass-muted">/month</span>
                </div>
                <p className="text-glass-muted">Perfect for {
                  key === 'enterprise' ? 'large dealerships' :
                  key === 'professional' ? 'growing businesses' :
                  'small teams'
                }</p>
              </CardHeader>

              <CardContent className="space-y-6">
                <div className="space-y-3">
                  <div className="flex items-center text-glass">
                    <Users className="w-5 h-5 mr-3 neon-cyan" />
                    Up to {tier.max_users} team members
                  </div>
                  <div className="flex items-center text-glass">
                    <BarChart3 className="w-5 h-5 mr-3 neon-green" />
                    {tier.max_leads.toLocaleString()} leads per month
                  </div>
                  <div className="flex items-center text-glass">
                    <Phone className="w-5 h-5 mr-3 neon-purple" />
                    {tier.sms_credits} SMS credits
                  </div>
                  {tier.voice_minutes > 0 && (
                    <div className="flex items-center text-glass">
                      <PhoneCall className="w-5 h-5 mr-3 neon-orange" />
                      {tier.voice_minutes} voice minutes
                    </div>
                  )}
                  <div className="flex items-center text-glass">
                    <Zap className="w-5 h-5 mr-3 neon-yellow" />
                    {tier.ai_responses.toLocaleString()} AI responses
                  </div>
                </div>

                <div className="pt-4 border-t border-glass-muted">
                  <h4 className="font-semibold text-glass-bright mb-3">Features included:</h4>
                  <div className="space-y-2">
                    {tier.features.map((feature, index) => (
                      <div key={index} className="flex items-center text-sm text-glass">
                        <Check className="w-4 h-4 mr-2 neon-green flex-shrink-0" />
                        {feature}
                      </div>
                    ))}
                  </div>
                </div>

                <Button className={`w-full ${
                  key === 'professional' ? 'btn-neon-pink' :
                  key === 'enterprise' ? 'btn-neon-green' : 'btn-neon'
                }`}>
                  Start Free Trial
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Features Comparison */}
        <div className="mt-20">
          <h2 className="text-3xl font-bold text-glass-bright text-center mb-12">
            Feature Comparison
          </h2>
          
          <Card className="glass-card max-w-4xl mx-auto">
            <CardContent className="p-0">
              <div className="table-glass">
                <table className="w-full">
                  <thead>
                    <tr>
                      <th className="text-left">Feature</th>
                      <th>Starter</th>
                      <th>Professional</th>
                      <th>Enterprise</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="font-semibold text-glass-bright">Lead Management</td>
                      <td className="text-center"><Check className="w-5 h-5 neon-green mx-auto" /></td>
                      <td className="text-center"><Check className="w-5 h-5 neon-green mx-auto" /></td>
                      <td className="text-center"><Check className="w-5 h-5 neon-green mx-auto" /></td>
                    </tr>
                    <tr>
                      <td className="font-semibold text-glass-bright">SMS Follow-up</td>
                      <td className="text-center"><Check className="w-5 h-5 neon-green mx-auto" /></td>
                      <td className="text-center"><Check className="w-5 h-5 neon-green mx-auto" /></td>
                      <td className="text-center"><Check className="w-5 h-5 neon-green mx-auto" /></td>
                    </tr>
                    <tr>
                      <td className="font-semibold text-glass-bright">AI Voice Calling</td>
                      <td className="text-center"><X className="w-5 h-5 text-red-400 mx-auto" /></td>
                      <td className="text-center"><Check className="w-5 h-5 neon-green mx-auto" /></td>
                      <td className="text-center"><Check className="w-5 h-5 neon-green mx-auto" /></td>
                    </tr>
                    <tr>
                      <td className="font-semibold text-glass-bright">Facebook Integration</td>
                      <td className="text-center"><X className="w-5 h-5 text-red-400 mx-auto" /></td>
                      <td className="text-center"><Check className="w-5 h-5 neon-green mx-auto" /></td>
                      <td className="text-center"><Check className="w-5 h-5 neon-green mx-auto" /></td>
                    </tr>
                    <tr>
                      <td className="font-semibold text-glass-bright">Custom Branding</td>
                      <td className="text-center"><X className="w-5 h-5 text-red-400 mx-auto" /></td>
                      <td className="text-center"><Palette className="w-5 h-5 neon-purple mx-auto" /></td>
                      <td className="text-center"><Check className="w-5 h-5 neon-green mx-auto" /></td>
                    </tr>
                    <tr>
                      <td className="font-semibold text-glass-bright">API Access</td>
                      <td className="text-center"><X className="w-5 h-5 text-red-400 mx-auto" /></td>
                      <td className="text-center"><X className="w-5 h-5 text-red-400 mx-auto" /></td>
                      <td className="text-center"><Code className="w-5 h-5 neon-cyan mx-auto" /></td>
                    </tr>
                    <tr>
                      <td className="font-semibold text-glass-bright">Priority Support</td>
                      <td className="text-center"><Mail className="w-5 h-5 text-glass mx-auto" /></td>
                      <td className="text-center"><Phone className="w-5 h-5 neon-orange mx-auto" /></td>
                      <td className="text-center"><Headphones className="w-5 h-5 neon-green mx-auto" /></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export { SaaSPlatform, PricingPage };