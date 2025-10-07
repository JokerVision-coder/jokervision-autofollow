import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { 
  BarChart3, TrendingUp, TrendingDown, Users, DollarSign, Calendar,
  Target, Zap, MessageSquare, Phone, Mail, Globe, Star, Clock,
  Filter, Download, RefreshCw, Eye, PieChart, Activity, Award
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
const Badge = ({ children, className = "" }) => <span className={`px-2 py-1 rounded text-xs ${className}`}>{children}</span>;

const AdvancedAnalytics = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [dateRange, setDateRange] = useState('30d');
  const [analytics, setAnalytics] = useState({});
  const [salesMetrics, setSalesMetrics] = useState({});
  const [marketingMetrics, setMarketingMetrics] = useState({});
  const [customerMetrics, setCustomerMetrics] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, [dateRange]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const [analyticsRes, salesRes, marketingRes, customerRes] = await Promise.all([
        axios.get(`${API}/analytics/overview?tenant_id=default_dealership&period=${dateRange}`),
        axios.get(`${API}/analytics/sales?tenant_id=default_dealership&period=${dateRange}`),
        axios.get(`${API}/analytics/marketing?tenant_id=default_dealership&period=${dateRange}`),
        axios.get(`${API}/analytics/customers?tenant_id=default_dealership&period=${dateRange}`)
      ]);

      setAnalytics(analyticsRes.data || {});
      setSalesMetrics(salesRes.data || {});
      setMarketingMetrics(marketingRes.data || {});
      setCustomerMetrics(customerRes.data || {});
    } catch (error) {
      console.error('Error fetching analytics:', error);
      loadMockAnalytics();
    } finally {
      setLoading(false);
    }
  };

  const loadMockAnalytics = () => {
    setAnalytics({
      total_revenue: 2847500,
      revenue_growth: 18.5,
      total_leads: 1247,
      leads_growth: 23.2,
      conversion_rate: 12.8,
      conversion_growth: 5.4,
      avg_deal_size: 35750,
      deal_size_growth: -2.1,
      appointments_scheduled: 234,
      appointments_completed: 187,
      response_time: '4.2 minutes',
      customer_satisfaction: 4.7
    });

    setSalesMetrics({
      vehicles_sold: 87,
      total_revenue: 2847500,
      avg_sale_price: 32730,
      financing_rate: 73,
      trade_ins: 52,
      service_revenue: 147800,
      parts_revenue: 89400,
      top_salesperson: 'Mike Johnson',
      top_salesperson_sales: 15,
      monthly_trend: [
        { month: 'Jan', sales: 12, revenue: 392800 },
        { month: 'Feb', sales: 18, revenue: 589400 },
        { month: 'Mar', sales: 15, revenue: 491200 },
        { month: 'Apr', sales: 21, revenue: 687300 },
        { month: 'May', sales: 19, revenue: 622100 },
        { month: 'Jun', sales: 23, revenue: 752700 }
      ]
    });

    setMarketingMetrics({
      total_campaigns: 15,
      active_campaigns: 6,
      total_spend: 12400,
      cost_per_lead: 28.50,
      roi: 234,
      email_open_rate: 28.4,
      email_click_rate: 6.8,
      social_followers: 3420,
      social_engagement: 8.9,
      website_visitors: 4800,
      website_conversion: 3.2,
      facebook_leads: 89,
      google_leads: 156,
      organic_leads: 67,
      referral_leads: 23
    });

    setCustomerMetrics({
      total_customers: 892,
      new_customers: 156,
      returning_customers: 234,
      customer_lifetime_value: 4280,
      satisfaction_score: 4.7,
      retention_rate: 78,
      review_rating: 4.5,
      total_reviews: 347,
      service_customers: 423,
      sales_customers: 469,
      top_concerns: [
        { issue: 'Pricing', count: 34, resolved: 29 },
        { issue: 'Availability', count: 28, resolved: 25 },
        { issue: 'Financing', count: 23, resolved: 21 }
      ]
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
            <h1 className="text-4xl font-bold text-glass-bright mb-2">Advanced Analytics</h1>
            <p className="text-glass-muted">Comprehensive business intelligence and performance insights</p>
          </div>
          
          <div className="flex gap-3">
            <select 
              value={dateRange} 
              onChange={(e) => setDateRange(e.target.value)}
              className="px-3 py-2 border rounded text-glass"
            >
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
              <option value="90d">Last 90 Days</option>
              <option value="1y">Last Year</option>
            </select>
            <Button onClick={fetchAnalytics} variant="outline" className="text-glass-bright">
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
            <Button className="btn-neon">
              <Download className="w-4 h-4 mr-2" />
              Export Report
            </Button>
          </div>
        </div>

        {/* Key Performance Indicators */}
        <KPIOverview analytics={analytics} />

        {/* Tabs */}
        <div className="flex gap-4 mb-6">
          <Button
            onClick={() => setActiveTab('overview')}
            className={`${activeTab === 'overview' ? 'bg-purple-600 text-white' : 'text-glass-bright hover:bg-glass'}`}
          >
            <BarChart3 className="w-4 h-4 mr-2" />
            Overview
          </Button>
          <Button
            onClick={() => setActiveTab('sales')}
            className={`${activeTab === 'sales' ? 'bg-purple-600 text-white' : 'text-glass-bright hover:bg-glass'}`}
          >
            <DollarSign className="w-4 h-4 mr-2" />
            Sales Analytics
          </Button>
          <Button
            onClick={() => setActiveTab('marketing')}
            className={`${activeTab === 'marketing' ? 'bg-purple-600 text-white' : 'text-glass-bright hover:bg-glass'}`}
          >
            <Target className="w-4 h-4 mr-2" />
            Marketing ROI
          </Button>
          <Button
            onClick={() => setActiveTab('customers')}
            className={`${activeTab === 'customers' ? 'bg-purple-600 text-white' : 'text-glass-bright hover:bg-glass'}`}
          >
            <Users className="w-4 h-4 mr-2" />
            Customer Insights
          </Button>
        </div>

        {/* Content Area */}
        {activeTab === 'overview' && <OverviewSection analytics={analytics} />}
        {activeTab === 'sales' && <SalesAnalyticsSection metrics={salesMetrics} />}
        {activeTab === 'marketing' && <MarketingROISection metrics={marketingMetrics} />}
        {activeTab === 'customers' && <CustomerInsightsSection metrics={customerMetrics} />}
      </div>
    </div>
  );
};

// KPI Overview Component
const KPIOverview = ({ analytics }) => {
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const getTrendIcon = (growth) => {
    return growth >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />;
  };

  const getTrendColor = (growth) => {
    return growth >= 0 ? 'neon-green' : 'text-red-400';
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
      <Card className="glass-card">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-glass-muted">Total Revenue</p>
              <p className="text-2xl font-bold text-glass-bright">
                {formatCurrency(analytics.total_revenue || 0)}
              </p>
            </div>
            <DollarSign className="w-8 h-8 neon-green" />
          </div>
          <div className={`flex items-center mt-2 text-sm ${getTrendColor(analytics.revenue_growth)}`}>
            {getTrendIcon(analytics.revenue_growth)}
            <span className="ml-1">{Math.abs(analytics.revenue_growth || 0)}% from last period</span>
          </div>
        </CardContent>
      </Card>

      <Card className="glass-card">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-glass-muted">Total Leads</p>
              <p className="text-2xl font-bold text-glass-bright">
                {(analytics.total_leads || 0).toLocaleString()}
              </p>
            </div>
            <Users className="w-8 h-8 neon-blue" />
          </div>
          <div className={`flex items-center mt-2 text-sm ${getTrendColor(analytics.leads_growth)}`}>
            {getTrendIcon(analytics.leads_growth)}
            <span className="ml-1">{Math.abs(analytics.leads_growth || 0)}% from last period</span>
          </div>
        </CardContent>
      </Card>

      <Card className="glass-card">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-glass-muted">Conversion Rate</p>
              <p className="text-2xl font-bold text-glass-bright">
                {analytics.conversion_rate || 0}%
              </p>
            </div>
            <Target className="w-8 h-8 neon-orange" />
          </div>
          <div className={`flex items-center mt-2 text-sm ${getTrendColor(analytics.conversion_growth)}`}>
            {getTrendIcon(analytics.conversion_growth)}
            <span className="ml-1">{Math.abs(analytics.conversion_growth || 0)}% from last period</span>
          </div>
        </CardContent>
      </Card>

      <Card className="glass-card">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-glass-muted">Avg Deal Size</p>
              <p className="text-2xl font-bold text-glass-bright">
                {formatCurrency(analytics.avg_deal_size || 0)}
              </p>
            </div>
            <Award className="w-8 h-8 neon-purple" />
          </div>
          <div className={`flex items-center mt-2 text-sm ${getTrendColor(analytics.deal_size_growth)}`}>
            {getTrendIcon(analytics.deal_size_growth)}
            <span className="ml-1">{Math.abs(analytics.deal_size_growth || 0)}% from last period</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Overview Section Component
const OverviewSection = ({ analytics }) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card className="glass-card">
        <CardContent className="p-6">
          <h3 className="text-xl font-semibold text-glass-bright mb-4">Performance Summary</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-glass-muted">Appointments Scheduled</span>
              <span className="text-glass-bright font-semibold">{analytics.appointments_scheduled}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-glass-muted">Appointments Completed</span>
              <span className="text-glass-bright font-semibold">{analytics.appointments_completed}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-glass-muted">Avg Response Time</span>
              <span className="text-glass-bright font-semibold">{analytics.response_time}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-glass-muted">Customer Satisfaction</span>
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 text-yellow-400" />
                <span className="text-glass-bright font-semibold">{analytics.customer_satisfaction}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="glass-card">
        <CardContent className="p-6">
          <h3 className="text-xl font-semibold text-glass-bright mb-4">Revenue Trend</h3>
          <div className="h-48 flex items-center justify-center text-glass-muted">
            <BarChart3 className="w-16 h-16 mb-4" />
          </div>
          <p className="text-center text-glass-muted">Revenue trend chart would appear here</p>
        </CardContent>
      </Card>
    </div>
  );
};

// Sales Analytics Section Component
const SalesAnalyticsSection = ({ metrics }) => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="glass-card">
          <CardContent className="p-6 text-center">
            <DollarSign className="w-8 h-8 mx-auto mb-2 neon-green" />
            <div className="text-2xl font-bold text-glass-bright">{metrics.vehicles_sold}</div>
            <div className="text-sm text-glass-muted">Vehicles Sold</div>
          </CardContent>
        </Card>
        
        <Card className="glass-card">
          <CardContent className="p-6 text-center">
            <BarChart3 className="w-8 h-8 mx-auto mb-2 neon-blue" />
            <div className="text-2xl font-bold neon-blue">{metrics.financing_rate}%</div>
            <div className="text-sm text-glass-muted">Financing Rate</div>
          </CardContent>
        </Card>
        
        <Card className="glass-card">
          <CardContent className="p-6 text-center">
            <Activity className="w-8 h-8 mx-auto mb-2 neon-orange" />
            <div className="text-2xl font-bold neon-orange">{metrics.trade_ins}</div>
            <div className="text-sm text-glass-muted">Trade-ins</div>
          </CardContent>
        </Card>
        
        <Card className="glass-card">
          <CardContent className="p-6 text-center">
            <Award className="w-8 h-8 mx-auto mb-2 neon-purple" />
            <div className="text-2xl font-bold neon-purple">${metrics.avg_sale_price?.toLocaleString()}</div>
            <div className="text-sm text-glass-muted">Avg Sale Price</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="glass-card">
          <CardContent className="p-6">
            <h3 className="text-xl font-semibold text-glass-bright mb-4">Sales Performance</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-glass-muted/10 rounded">
                <span className="text-glass-bright">Vehicle Sales</span>
                <span className="font-semibold neon-green">${metrics.total_revenue?.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-glass-muted/10 rounded">
                <span className="text-glass-bright">Service Revenue</span>
                <span className="font-semibold neon-blue">${metrics.service_revenue?.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-glass-muted/10 rounded">
                <span className="text-glass-bright">Parts Revenue</span>
                <span className="font-semibold neon-orange">${metrics.parts_revenue?.toLocaleString()}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardContent className="p-6">
            <h3 className="text-xl font-semibold text-glass-bright mb-4">Top Performer</h3>
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full mx-auto mb-4 flex items-center justify-center">
                <Award className="w-8 h-8 text-white" />
              </div>
              <h4 className="text-lg font-semibold text-glass-bright">{metrics.top_salesperson}</h4>
              <p className="text-glass-muted">Sales Champion</p>
              <div className="mt-4">
                <div className="text-2xl font-bold neon-green">{metrics.top_salesperson_sales}</div>
                <div className="text-sm text-glass-muted">Vehicles Sold This Month</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

// Marketing ROI Section Component
const MarketingROISection = ({ metrics }) => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="glass-card">
          <CardContent className="p-6 text-center">
            <Target className="w-8 h-8 mx-auto mb-2 neon-green" />
            <div className="text-2xl font-bold text-glass-bright">{metrics.total_campaigns}</div>
            <div className="text-sm text-glass-muted">Total Campaigns</div>
          </CardContent>
        </Card>
        
        <Card className="glass-card">
          <CardContent className="p-6 text-center">
            <DollarSign className="w-8 h-8 mx-auto mb-2 neon-blue" />
            <div className="text-2xl font-bold neon-blue">${metrics.cost_per_lead}</div>
            <div className="text-sm text-glass-muted">Cost Per Lead</div>
          </CardContent>
        </Card>
        
        <Card className="glass-card">
          <CardContent className="p-6 text-center">
            <BarChart3 className="w-8 h-8 mx-auto mb-2 neon-orange" />
            <div className="text-2xl font-bold neon-orange">{metrics.roi}%</div>
            <div className="text-sm text-glass-muted">ROI</div>
          </CardContent>
        </Card>
        
        <Card className="glass-card">
          <CardContent className="p-6 text-center">
            <Globe className="w-8 h-8 mx-auto mb-2 neon-purple" />
            <div className="text-2xl font-bold neon-purple">{metrics.website_visitors?.toLocaleString()}</div>
            <div className="text-sm text-glass-muted">Website Visitors</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="glass-card">
          <CardContent className="p-6">
            <h3 className="text-xl font-semibold text-glass-bright mb-4">Lead Sources</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-glass-muted">Google Ads</span>
                <span className="text-glass-bright font-semibold">{metrics.google_leads}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-glass-muted">Facebook</span>
                <span className="text-glass-bright font-semibold">{metrics.facebook_leads}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-glass-muted">Organic</span>
                <span className="text-glass-bright font-semibold">{metrics.organic_leads}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-glass-muted">Referrals</span>
                <span className="text-glass-bright font-semibold">{metrics.referral_leads}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardContent className="p-6">
            <h3 className="text-xl font-semibold text-glass-bright mb-4">Email Marketing</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-glass-muted">Open Rate</span>
                <div className="flex items-center gap-2">
                  <div className="w-20 h-2 bg-glass-muted/20 rounded">
                    <div className="h-2 bg-blue-500 rounded" style={{width: `${metrics.email_open_rate}%`}}></div>
                  </div>
                  <span className="text-glass-bright font-semibold">{metrics.email_open_rate}%</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-glass-muted">Click Rate</span>
                <div className="flex items-center gap-2">
                  <div className="w-20 h-2 bg-glass-muted/20 rounded">
                    <div className="h-2 bg-green-500 rounded" style={{width: `${metrics.email_click_rate * 4}%`}}></div>
                  </div>
                  <span className="text-glass-bright font-semibold">{metrics.email_click_rate}%</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

// Customer Insights Section Component
const CustomerInsightsSection = ({ metrics }) => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="glass-card">
          <CardContent className="p-6 text-center">
            <Users className="w-8 h-8 mx-auto mb-2 neon-green" />
            <div className="text-2xl font-bold text-glass-bright">{metrics.total_customers}</div>
            <div className="text-sm text-glass-muted">Total Customers</div>
          </CardContent>
        </Card>
        
        <Card className="glass-card">
          <CardContent className="p-6 text-center">
            <Activity className="w-8 h-8 mx-auto mb-2 neon-blue" />
            <div className="text-2xl font-bold neon-blue">{metrics.retention_rate}%</div>
            <div className="text-sm text-glass-muted">Retention Rate</div>
          </CardContent>
        </Card>
        
        <Card className="glass-card">
          <CardContent className="p-6 text-center">
            <DollarSign className="w-8 h-8 mx-auto mb-2 neon-orange" />
            <div className="text-2xl font-bold neon-orange">${metrics.customer_lifetime_value?.toLocaleString()}</div>
            <div className="text-sm text-glass-muted">Lifetime Value</div>
          </CardContent>
        </Card>
        
        <Card className="glass-card">
          <CardContent className="p-6 text-center">
            <Star className="w-8 h-8 mx-auto mb-2 neon-purple" />
            <div className="text-2xl font-bold neon-purple">{metrics.satisfaction_score}</div>
            <div className="text-sm text-glass-muted">Satisfaction Score</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="glass-card">
          <CardContent className="p-6">
            <h3 className="text-xl font-semibold text-glass-bright mb-4">Customer Breakdown</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-glass-muted/10 rounded">
                <span className="text-glass-bright">New Customers</span>
                <span className="font-semibold neon-green">{metrics.new_customers}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-glass-muted/10 rounded">
                <span className="text-glass-bright">Returning Customers</span>
                <span className="font-semibold neon-blue">{metrics.returning_customers}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-glass-muted/10 rounded">
                <span className="text-glass-bright">Service Customers</span>
                <span className="font-semibold neon-orange">{metrics.service_customers}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardContent className="p-6">
            <h3 className="text-xl font-semibold text-glass-bright mb-4">Top Concerns</h3>
            <div className="space-y-3">
              {metrics.top_concerns?.map((concern, index) => (
                <div key={index} className="flex justify-between items-center">
                  <div>
                    <span className="text-glass-bright font-medium">{concern.issue}</span>
                    <div className="text-xs text-glass-muted">{concern.count} total, {concern.resolved} resolved</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold text-glass-bright">
                      {Math.round((concern.resolved / concern.count) * 100)}%
                    </div>
                    <div className="text-xs text-glass-muted">Resolution Rate</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdvancedAnalytics;