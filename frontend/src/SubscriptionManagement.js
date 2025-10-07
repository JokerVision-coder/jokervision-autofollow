import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { 
  CreditCard, Crown, Zap, Users, MessageSquare, Mail, Phone,
  CheckCircle2, X, TrendingUp, BarChart3, Shield, Star,
  Settings, Download, RefreshCw, AlertTriangle, Calendar
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

const SubscriptionManagement = () => {
  const [activeTab, setActiveTab] = useState('current');
  const [plans, setPlans] = useState([]);
  const [currentSubscription, setCurrentSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [billingHistory, setBillingHistory] = useState([]);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  useEffect(() => {
    fetchSubscriptionData();
  }, []);

  const fetchSubscriptionData = async () => {
    try {
      const [plansResponse, currentResponse] = await Promise.all([
        axios.get(`${API}/subscription/plans`),
        axios.get(`${API}/subscription/current?tenant_id=default_dealership`)
      ]);
      
      setPlans(plansResponse.data.plans || []);
      setCurrentSubscription(currentResponse.data || {});
      
      // Mock billing history
      setBillingHistory([
        {
          id: 'bill_1',
          date: '2024-01-25',
          amount: 199.00,
          status: 'paid',
          plan: 'Professional',
          period: 'January 2024'
        },
        {
          id: 'bill_2', 
          date: '2023-12-25',
          amount: 199.00,
          status: 'paid',
          plan: 'Professional',
          period: 'December 2023'
        },
        {
          id: 'bill_3',
          date: '2023-11-25',
          amount: 199.00,
          status: 'paid',
          plan: 'Professional', 
          period: 'November 2023'
        }
      ]);
      
    } catch (error) {
      console.error('Error fetching subscription data:', error);
      loadMockData();
    } finally {
      setLoading(false);
    }
  };

  const loadMockData = () => {
    setPlans([
      {
        id: 'starter',
        name: 'Starter',
        price_monthly: 99.00,
        price_yearly: 990.00,
        features: ['Lead Management', 'SMS Follow-up', 'Basic Analytics', 'Email Support'],
        max_users: 3,
        max_leads: 1000,
        sms_credits: 500,
        email_credits: 2000,
        support_level: 'email'
      },
      {
        id: 'professional',
        name: 'Professional',
        price_monthly: 199.00,
        price_yearly: 1990.00,
        features: ['Everything in Starter', 'Social Media Management', 'Advanced Analytics', 'Calendar Integration', 'Phone Support'],
        max_users: 10,
        max_leads: 5000,
        sms_credits: 2000,
        email_credits: 10000,
        support_level: 'phone'
      },
      {
        id: 'enterprise',
        name: 'Enterprise',
        price_monthly: 399.00,
        price_yearly: 3990.00,
        features: ['Everything in Professional', 'White Label', 'API Access', 'Custom Integrations', 'Dedicated Support'],
        max_users: 50,
        max_leads: 25000,
        sms_credits: 10000,
        email_credits: 50000,
        support_level: 'dedicated'
      }
    ]);

    setCurrentSubscription({
      plan_id: 'professional',
      plan_name: 'Professional',
      status: 'active',
      billing_cycle: 'monthly',
      next_billing_date: '2024-02-25T00:00:00Z',
      usage: {
        users: 4,
        leads: 1247,
        sms_sent: 892,
        emails_sent: 3456
      },
      limits: {
        max_users: 10,
        max_leads: 5000,
        sms_credits: 2000,
        email_credits: 10000
      }
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
            <h1 className="text-4xl font-bold text-glass-bright mb-2">Subscription Management</h1>
            <p className="text-glass-muted">Manage your JokerVision AutoFollow subscription and billing</p>
          </div>
          
          <div className="flex gap-3">
            <Button 
              onClick={() => setShowUpgradeModal(true)}
              className="btn-neon"
            >
              <TrendingUp className="w-4 h-4 mr-2" />
              Upgrade Plan
            </Button>
            <Button onClick={fetchSubscriptionData} variant="outline" className="text-glass-bright">
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>

        {/* Current Subscription Overview */}
        <CurrentSubscriptionCard subscription={currentSubscription} />

        {/* Tabs */}
        <div className="flex gap-4 mb-6">
          <Button
            onClick={() => setActiveTab('current')}
            className={`${activeTab === 'current' ? 'bg-purple-600 text-white' : 'text-glass-bright hover:bg-glass'}`}
          >
            <CreditCard className="w-4 h-4 mr-2" />
            Current Plan
          </Button>
          <Button
            onClick={() => setActiveTab('plans')}
            className={`${activeTab === 'plans' ? 'bg-purple-600 text-white' : 'text-glass-bright hover:bg-glass'}`}
          >
            <Crown className="w-4 h-4 mr-2" />
            All Plans
          </Button>
          <Button
            onClick={() => setActiveTab('billing')}
            className={`${activeTab === 'billing' ? 'bg-purple-600 text-white' : 'text-glass-bright hover:bg-glass'}`}
          >
            <BarChart3 className="w-4 h-4 mr-2" />
            Billing History
          </Button>
          <Button
            onClick={() => setActiveTab('usage')}
            className={`${activeTab === 'usage' ? 'bg-purple-600 text-white' : 'text-glass-bright hover:bg-glass'}`}
          >
            <TrendingUp className="w-4 h-4 mr-2" />
            Usage Analytics
          </Button>
        </div>

        {/* Content Area */}
        {activeTab === 'current' && <CurrentPlanDetails subscription={currentSubscription} />}
        {activeTab === 'plans' && <AllPlansSection plans={plans} currentPlan={currentSubscription?.plan_id} />}
        {activeTab === 'billing' && <BillingHistory history={billingHistory} />}
        {activeTab === 'usage' && <UsageAnalytics subscription={currentSubscription} />}

        {/* Upgrade Modal */}
        {showUpgradeModal && (
          <UpgradeModal 
            plans={plans}
            currentPlan={currentSubscription?.plan_id}
            onClose={() => setShowUpgradeModal(false)}
            onUpgrade={(planId) => {
              toast.success(`Upgraded to ${plans.find(p => p.id === planId)?.name} plan!`);
              setShowUpgradeModal(false);
            }}
          />
        )}
      </div>
    </div>
  );
};

// Current Subscription Card
const CurrentSubscriptionCard = ({ subscription }) => {
  const nextBillingDate = subscription?.next_billing_date 
    ? new Date(subscription.next_billing_date).toLocaleDateString()
    : 'N/A';

  return (
    <Card className="glass-card mb-8">
      <CardContent className="p-6">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-4">
            <div className="p-4 rounded-full bg-purple-600 text-white">
              <Crown className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-glass-bright">{subscription?.plan_name} Plan</h2>
              <p className="text-glass-muted">
                Status: <Badge className={`ml-1 ${
                  subscription?.status === 'active' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
                }`}>
                  {subscription?.status?.toUpperCase()}
                </Badge>
              </p>
              <p className="text-glass-muted">Next billing: {nextBillingDate}</p>
            </div>
          </div>

          <div className="text-right">
            <div className="text-sm text-glass-muted">Billing Cycle</div>
            <div className="text-lg font-semibold text-glass-bright capitalize">
              {subscription?.billing_cycle}
            </div>
          </div>
        </div>

        {/* Usage Progress Bars */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
          <UsageMetric 
            label="Users"
            current={subscription?.usage?.users || 0}
            limit={subscription?.limits?.max_users || 0}
            color="blue"
          />
          <UsageMetric 
            label="Leads"
            current={subscription?.usage?.leads || 0}
            limit={subscription?.limits?.max_leads || 0}
            color="green"
          />
          <UsageMetric 
            label="SMS Credits"
            current={subscription?.usage?.sms_sent || 0}
            limit={subscription?.limits?.sms_credits || 0}
            color="purple"
          />
          <UsageMetric 
            label="Email Credits"
            current={subscription?.usage?.emails_sent || 0}
            limit={subscription?.limits?.email_credits || 0}
            color="orange"
          />
        </div>
      </CardContent>
    </Card>
  );
};

// Usage Metric Component
const UsageMetric = ({ label, current, limit, color }) => {
  const percentage = limit > 0 ? (current / limit) * 100 : 0;
  const colorClass = {
    blue: 'bg-blue-600',
    green: 'bg-green-600',
    purple: 'bg-purple-600',
    orange: 'bg-orange-600'
  }[color] || 'bg-gray-600';

  return (
    <div>
      <div className="flex justify-between text-sm mb-1">
        <span className="text-glass-muted">{label}</span>
        <span className="text-glass-bright">{current.toLocaleString()}/{limit.toLocaleString()}</span>
      </div>
      <div className="w-full bg-glass-muted/20 rounded-full h-2">
        <div 
          className={`${colorClass} h-2 rounded-full transition-all duration-300`}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        ></div>
      </div>
      <div className="text-xs text-glass-muted mt-1">{percentage.toFixed(1)}% used</div>
    </div>
  );
};

// Current Plan Details
const CurrentPlanDetails = ({ subscription }) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <Card className="glass-card">
        <CardContent className="p-6">
          <h3 className="text-xl font-semibold text-glass-bright mb-4">Plan Features</h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Users className="w-5 h-5 text-blue-400" />
              <span className="text-glass-bright">Up to {subscription?.limits?.max_users} users</span>
            </div>
            <div className="flex items-center gap-3">
              <TrendingUp className="w-5 h-5 text-green-400" />
              <span className="text-glass-bright">Up to {subscription?.limits?.max_leads?.toLocaleString()} leads</span>
            </div>
            <div className="flex items-center gap-3">
              <MessageSquare className="w-5 h-5 text-purple-400" />
              <span className="text-glass-bright">{subscription?.limits?.sms_credits?.toLocaleString()} SMS credits/month</span>
            </div>
            <div className="flex items-center gap-3">
              <Mail className="w-5 h-5 text-orange-400" />
              <span className="text-glass-bright">{subscription?.limits?.email_credits?.toLocaleString()} email credits/month</span>
            </div>
            <div className="flex items-center gap-3">
              <Phone className="w-5 h-5 text-pink-400" />
              <span className="text-glass-bright">Phone support included</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="glass-card">
        <CardContent className="p-6">
          <h3 className="text-xl font-semibold text-glass-bright mb-4">Account Actions</h3>
          <div className="space-y-3">
            <Button className="w-full btn-neon">
              <Settings className="w-4 h-4 mr-2" />
              Manage Billing
            </Button>
            <Button className="w-full" variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Download Invoice
            </Button>
            <Button className="w-full" variant="outline">
              <Calendar className="w-4 h-4 mr-2" />
              Change Billing Date
            </Button>
            <Button className="w-full text-red-400 border-red-400 hover:bg-red-400 hover:text-white" variant="outline">
              <AlertTriangle className="w-4 h-4 mr-2" />
              Cancel Subscription
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// All Plans Section
const AllPlansSection = ({ plans, currentPlan }) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {plans.map((plan) => (
        <PlanCard 
          key={plan.id} 
          plan={plan} 
          isCurrent={plan.id === currentPlan}
        />
      ))}
    </div>
  );
};

// Plan Card Component
const PlanCard = ({ plan, isCurrent }) => {
  const isPopular = plan.id === 'professional';

  return (
    <Card className={`glass-card hover:scale-105 transition-transform duration-200 ${
      isPopular ? 'ring-2 ring-purple-500' : ''
    } ${isCurrent ? 'ring-2 ring-green-500' : ''}`}>
      <CardContent className="p-6">
        {isPopular && (
          <Badge className="bg-purple-600 text-white mb-4">
            <Star className="w-3 h-3 mr-1" />
            Most Popular
          </Badge>
        )}
        
        {isCurrent && (
          <Badge className="bg-green-600 text-white mb-4">
            <CheckCircle2 className="w-3 h-3 mr-1" />
            Current Plan
          </Badge>
        )}

        <div className="mb-6">
          <h3 className="text-2xl font-bold text-glass-bright">{plan.name}</h3>
          <div className="mt-2">
            <span className="text-3xl font-bold text-glass-bright">${plan.price_monthly}</span>
            <span className="text-glass-muted">/month</span>
          </div>
          <div className="text-sm text-glass-muted">
            or ${plan.price_yearly}/year (save ${(plan.price_monthly * 12 - plan.price_yearly).toFixed(0)})
          </div>
        </div>

        <div className="space-y-3 mb-6">
          {plan.features.map((feature, index) => (
            <div key={index} className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-400" />
              <span className="text-sm text-glass-bright">{feature}</span>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
          <div>
            <div className="text-glass-muted">Users</div>
            <div className="font-semibold text-glass-bright">{plan.max_users}</div>
          </div>
          <div>
            <div className="text-glass-muted">Leads</div>
            <div className="font-semibold text-glass-bright">{plan.max_leads.toLocaleString()}</div>
          </div>
          <div>
            <div className="text-glass-muted">SMS Credits</div>
            <div className="font-semibold text-glass-bright">{plan.sms_credits.toLocaleString()}</div>
          </div>
          <div>
            <div className="text-glass-muted">Email Credits</div>
            <div className="font-semibold text-glass-bright">{plan.email_credits.toLocaleString()}</div>
          </div>
        </div>

        <Button 
          className={`w-full ${
            isCurrent 
              ? 'bg-green-600 text-white cursor-not-allowed' 
              : isPopular 
              ? 'btn-neon' 
              : 'border border-glass-muted text-glass-bright hover:bg-glass'
          }`}
          disabled={isCurrent}
        >
          {isCurrent ? 'Current Plan' : `Upgrade to ${plan.name}`}
        </Button>
      </CardContent>
    </Card>
  );
};

// Billing History Component
const BillingHistory = ({ history }) => {
  return (
    <Card className="glass-card">
      <CardContent className="p-6">
        <h3 className="text-xl font-semibold text-glass-bright mb-6">Billing History</h3>
        
        <div className="space-y-4">
          {history.map((bill) => (
            <div key={bill.id} className="flex justify-between items-center p-4 bg-glass-muted/10 rounded-lg">
              <div>
                <div className="font-medium text-glass-bright">{bill.plan} - {bill.period}</div>
                <div className="text-sm text-glass-muted">{new Date(bill.date).toLocaleDateString()}</div>
              </div>
              
              <div className="text-right">
                <div className="font-semibold text-glass-bright">${bill.amount.toFixed(2)}</div>
                <Badge className={`${
                  bill.status === 'paid' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
                }`}>
                  {bill.status.toUpperCase()}
                </Badge>
              </div>
              
              <Button size="sm" variant="outline" className="text-glass-bright ml-4">
                <Download className="w-3 h-3 mr-1" />
                Invoice
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

// Usage Analytics Component
const UsageAnalytics = ({ subscription }) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <Card className="glass-card">
        <CardContent className="p-6">
          <h3 className="text-xl font-semibold text-glass-bright mb-4">Monthly Usage Trends</h3>
          <div className="h-64 flex items-center justify-center text-glass-muted">
            <BarChart3 className="w-16 h-16 mb-4" />
          </div>
          <p className="text-center text-glass-muted">Usage analytics chart would appear here</p>
        </CardContent>
      </Card>

      <Card className="glass-card">
        <CardContent className="p-6">
          <h3 className="text-xl font-semibold text-glass-bright mb-4">Feature Utilization</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-glass-bright">Lead Management</span>
              <Badge className="bg-green-600 text-white">High Usage</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-glass-bright">SMS Campaigns</span>
              <Badge className="bg-yellow-600 text-white">Medium Usage</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-glass-bright">Social Media</span>
              <Badge className="bg-red-600 text-white">Low Usage</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-glass-bright">Analytics</span>
              <Badge className="bg-green-600 text-white">High Usage</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Upgrade Modal Component
const UpgradeModal = ({ plans, currentPlan, onClose, onUpgrade }) => {
  const availablePlans = plans.filter(plan => plan.id !== currentPlan);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="glass-card max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <CardContent className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-2xl font-semibold text-glass-bright">Upgrade Your Plan</h3>
            <Button onClick={onClose} size="sm" variant="outline" className="text-glass-bright">
              <X className="w-4 h-4" />
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {availablePlans.map((plan) => (
              <Card key={plan.id} className="glass-card border-2 border-purple-500/50 hover:border-purple-500">
                <CardContent className="p-4">
                  <div className="text-center mb-4">
                    <h4 className="text-xl font-bold text-glass-bright">{plan.name}</h4>
                    <div className="text-2xl font-bold text-glass-bright mt-2">
                      ${plan.price_monthly}/month
                    </div>
                  </div>

                  <div className="space-y-2 mb-4">
                    {plan.features.slice(0, 4).map((feature, index) => (
                      <div key={index} className="flex items-center gap-2 text-sm">
                        <CheckCircle2 className="w-3 h-3 text-green-400" />
                        <span className="text-glass-bright">{feature}</span>
                      </div>
                    ))}
                    {plan.features.length > 4 && (
                      <div className="text-sm text-glass-muted">
                        +{plan.features.length - 4} more features
                      </div>
                    )}
                  </div>

                  <Button 
                    onClick={() => onUpgrade(plan.id)}
                    className="btn-neon w-full"
                  >
                    Upgrade to {plan.name}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SubscriptionManagement;