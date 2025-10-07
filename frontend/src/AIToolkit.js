import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { 
  Brain, Calculator, DollarSign, Car, Zap, TrendingUp, BarChart3,
  MessageSquare, Sparkles, RefreshCw, Download, Share, Settings,
  Lightbulb, Target, Users, Smartphone, Mail, Phone, ArrowRight
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
const Badge = ({ children, className = "" }) => <span className={`px-2 py-1 rounded text-xs ${className}`}>{children}</span>;

const AIToolkit = () => {
  const [activeTab, setActiveTab] = useState('calculators');
  const [loading, setLoading] = useState(false);

  const toolCategories = [
    { id: 'calculators', name: 'Smart Calculators', icon: Calculator },
    { id: 'content', name: 'Content Generation', icon: MessageSquare },
    { id: 'insights', name: 'AI Insights', icon: Brain },
    { id: 'automation', name: 'Automation Tools', icon: Zap }
  ];

  return (
    <div className="min-h-screen p-6">
      <div className="container mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-glass-bright mb-2">AI Toolkit</h1>
            <p className="text-glass-muted">Powerful AI tools to enhance your sales process</p>
          </div>
          
          <div className="flex gap-3">
            <Button className="btn-neon">
              <Sparkles className="w-4 h-4 mr-2" />
              AI Suggestions
            </Button>
            <Button variant="outline" className="text-glass-bright">
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </Button>
          </div>
        </div>

        {/* Tool Categories */}
        <div className="flex gap-4 mb-8">
          {toolCategories.map((category) => {
            const Icon = category.icon;
            return (
              <Button
                key={category.id}
                onClick={() => setActiveTab(category.id)}
                className={`${activeTab === category.id ? 'bg-purple-600 text-white' : 'text-glass-bright hover:bg-glass'}`}
              >
                <Icon className="w-4 h-4 mr-2" />
                {category.name}
              </Button>
            );
          })}
        </div>

        {/* Tool Content */}
        {activeTab === 'calculators' && <CalculatorTools />}
        {activeTab === 'content' && <ContentGenerationTools />}
        {activeTab === 'insights' && <AIInsightsTools />}
        {activeTab === 'automation' && <AutomationTools />}
      </div>
    </div>
  );
};

// Calculator Tools Component
const CalculatorTools = () => {
  const [paymentCalc, setPaymentCalc] = useState({
    vehicle_price: 35000,
    down_payment: 5000,
    trade_value: 0,
    apr: 4.5,
    term_months: 60
  });
  
  const [tradeEstimate, setTradeEstimate] = useState({
    year: 2020,
    make: 'Toyota',
    model: 'Camry',
    mileage: 50000,
    condition: 'good'
  });
  
  const [paymentResult, setPaymentResult] = useState(null);
  const [tradeResult, setTradeResult] = useState(null);

  const calculatePayment = async () => {
    try {
      const response = await axios.post(`${API}/ai/payment-calculator`, paymentCalc);
      setPaymentResult(response.data);
    } catch (error) {
      // Mock calculation
      const loanAmount = paymentCalc.vehicle_price - paymentCalc.down_payment - paymentCalc.trade_value;
      const monthlyRate = (paymentCalc.apr / 100) / 12;
      const numPayments = paymentCalc.term_months;
      const monthlyPayment = (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / (Math.pow(1 + monthlyRate, numPayments) - 1);
      
      setPaymentResult({
        loan_amount: loanAmount,
        monthly_payment: monthlyPayment,
        total_interest: (monthlyPayment * numPayments) - loanAmount,
        total_cost: monthlyPayment * numPayments,
        recommendations: [
          "Consider a larger down payment to reduce monthly costs",
          "Shop around for better interest rates",
          "Extended warranties available for additional protection"
        ]
      });
    }
  };

  const estimateTradeValue = async () => {
    try {
      const response = await axios.post(`${API}/ai/trade-estimator`, tradeEstimate);
      setTradeResult(response.data);
    } catch (error) {
      // Mock estimation
      const baseValue = 25000 - (2024 - tradeEstimate.year) * 2000;
      const mileageAdjustment = Math.max(0, (100000 - tradeEstimate.mileage) / 100000 * 5000);
      const conditionMultiplier = {excellent: 1.1, good: 1.0, fair: 0.85, poor: 0.7}[tradeEstimate.condition] || 1.0;
      const estimatedValue = Math.max(1000, (baseValue + mileageAdjustment) * conditionMultiplier);
      
      setTradeResult({
        estimated_value: estimatedValue,
        value_range: {
          low: estimatedValue * 0.85,
          high: estimatedValue * 1.15
        },
        factors: [
          `Year: ${tradeEstimate.year}`,
          `Mileage: ${tradeEstimate.mileage.toLocaleString()} miles`,
          `Condition: ${tradeEstimate.condition}`,
          `Make/Model: ${tradeEstimate.make} ${tradeEstimate.model}`
        ]
      });
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Payment Calculator */}
      <Card className="glass-card">
        <CardContent className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 rounded-full bg-blue-600 text-white">
              <Calculator className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-glass-bright">Payment Calculator</h3>
              <p className="text-sm text-glass-muted">Calculate monthly payments with AI insights</p>
            </div>
          </div>

          <div className="space-y-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-glass-bright mb-1">Vehicle Price</label>
              <Input
                type="number"
                value={paymentCalc.vehicle_price}
                onChange={(e) => setPaymentCalc({...paymentCalc, vehicle_price: Number(e.target.value)})}
                className="text-glass w-full"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-glass-bright mb-1">Down Payment</label>
                <Input
                  type="number"
                  value={paymentCalc.down_payment}
                  onChange={(e) => setPaymentCalc({...paymentCalc, down_payment: Number(e.target.value)})}
                  className="text-glass w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-glass-bright mb-1">Trade Value</label>
                <Input
                  type="number"
                  value={paymentCalc.trade_value}
                  onChange={(e) => setPaymentCalc({...paymentCalc, trade_value: Number(e.target.value)})}
                  className="text-glass w-full"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-glass-bright mb-1">APR (%)</label>
                <Input
                  type="number"
                  step="0.1"
                  value={paymentCalc.apr}
                  onChange={(e) => setPaymentCalc({...paymentCalc, apr: Number(e.target.value)})}
                  className="text-glass w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-glass-bright mb-1">Loan Term (months)</label>
                <select 
                  value={paymentCalc.term_months}
                  onChange={(e) => setPaymentCalc({...paymentCalc, term_months: Number(e.target.value)})}
                  className="px-3 py-2 border rounded w-full text-glass"
                >
                  <option value="36">36 months</option>
                  <option value="48">48 months</option>
                  <option value="60">60 months</option>
                  <option value="72">72 months</option>
                  <option value="84">84 months</option>
                </select>
              </div>
            </div>
          </div>

          <Button onClick={calculatePayment} className="btn-neon w-full mb-4">
            <Calculator className="w-4 h-4 mr-2" />
            Calculate Payment
          </Button>

          {paymentResult && (
            <div className="space-y-3 p-4 bg-glass-muted/10 rounded-lg">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-glass-muted">Monthly Payment</div>
                  <div className="text-xl font-bold text-glass-bright">${paymentResult.monthly_payment?.toFixed(2)}</div>
                </div>
                <div>
                  <div className="text-sm text-glass-muted">Total Interest</div>
                  <div className="text-lg font-semibold text-glass-bright">${paymentResult.total_interest?.toFixed(2)}</div>
                </div>
              </div>
              
              <div className="text-sm text-glass-muted">
                <div>Loan Amount: ${paymentResult.loan_amount?.toFixed(2)}</div>
                <div>Total Cost: ${paymentResult.total_cost?.toFixed(2)}</div>
              </div>
              
              <div className="mt-3">
                <div className="text-sm font-medium text-glass-bright mb-2">AI Recommendations:</div>
                <ul className="text-sm text-glass-muted space-y-1">
                  {paymentResult.recommendations?.map((rec, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <Lightbulb className="w-3 h-3 mt-0.5 text-yellow-400" />
                      {rec}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Trade-in Estimator */}
      <Card className="glass-card">
        <CardContent className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 rounded-full bg-green-600 text-white">
              <Car className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-glass-bright">Trade-in Estimator</h3>
              <p className="text-sm text-glass-muted">AI-powered trade-in value estimation</p>
            </div>
          </div>

          <div className="space-y-4 mb-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-glass-bright mb-1">Year</label>
                <Input
                  type="number"
                  value={tradeEstimate.year}
                  onChange={(e) => setTradeEstimate({...tradeEstimate, year: Number(e.target.value)})}
                  className="text-glass w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-glass-bright mb-1">Make</label>
                <select 
                  value={tradeEstimate.make}
                  onChange={(e) => setTradeEstimate({...tradeEstimate, make: e.target.value})}
                  className="px-3 py-2 border rounded w-full text-glass"
                >
                  <option value="Toyota">Toyota</option>
                  <option value="Honda">Honda</option>
                  <option value="Ford">Ford</option>
                  <option value="Chevrolet">Chevrolet</option>
                  <option value="Nissan">Nissan</option>
                </select>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-glass-bright mb-1">Model</label>
              <Input
                value={tradeEstimate.model}
                onChange={(e) => setTradeEstimate({...tradeEstimate, model: e.target.value})}
                className="text-glass w-full"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-glass-bright mb-1">Mileage</label>
                <Input
                  type="number"
                  value={tradeEstimate.mileage}
                  onChange={(e) => setTradeEstimate({...tradeEstimate, mileage: Number(e.target.value)})}
                  className="text-glass w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-glass-bright mb-1">Condition</label>
                <select 
                  value={tradeEstimate.condition}
                  onChange={(e) => setTradeEstimate({...tradeEstimate, condition: e.target.value})}
                  className="px-3 py-2 border rounded w-full text-glass"
                >
                  <option value="excellent">Excellent</option>
                  <option value="good">Good</option>
                  <option value="fair">Fair</option>
                  <option value="poor">Poor</option>
                </select>
              </div>
            </div>
          </div>

          <Button onClick={estimateTradeValue} className="btn-neon w-full mb-4">
            <Car className="w-4 h-4 mr-2" />
            Estimate Value
          </Button>

          {tradeResult && (
            <div className="space-y-3 p-4 bg-glass-muted/10 rounded-lg">
              <div className="text-center">
                <div className="text-sm text-glass-muted">Estimated Trade Value</div>
                <div className="text-2xl font-bold text-glass-bright">${tradeResult.estimated_value?.toFixed(2)}</div>
                <div className="text-sm text-glass-muted">
                  Range: ${tradeResult.value_range?.low?.toFixed(2)} - ${tradeResult.value_range?.high?.toFixed(2)}
                </div>
              </div>
              
              <div>
                <div className="text-sm font-medium text-glass-bright mb-2">Value Factors:</div>
                <ul className="text-sm text-glass-muted space-y-1">
                  {tradeResult.factors?.map((factor, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                      {factor}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

// Content Generation Tools Component
const ContentGenerationTools = () => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <Card className="glass-card">
        <CardContent className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <MessageSquare className="w-6 h-6 text-purple-400" />
            <h3 className="text-xl font-semibold text-glass-bright">SMS Templates</h3>
          </div>
          <p className="text-glass-muted mb-4">Generate personalized SMS messages for different scenarios</p>
          <div className="space-y-2 mb-4">
            <Button className="w-full text-left justify-start" variant="outline">New Lead Welcome</Button>
            <Button className="w-full text-left justify-start" variant="outline">Appointment Reminder</Button>
            <Button className="w-full text-left justify-start" variant="outline">Follow-up Message</Button>
          </div>
          <Button className="btn-neon w-full">
            <Sparkles className="w-4 h-4 mr-2" />
            Generate Template
          </Button>
        </CardContent>
      </Card>

      <Card className="glass-card">
        <CardContent className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <Mail className="w-6 h-6 text-blue-400" />
            <h3 className="text-xl font-semibold text-glass-bright">Email Content</h3>
          </div>
          <p className="text-glass-muted mb-4">Create compelling email campaigns with AI assistance</p>
          <div className="space-y-2 mb-4">
            <Button className="w-full text-left justify-start" variant="outline">Newsletter Template</Button>
            <Button className="w-full text-left justify-start" variant="outline">Promotional Email</Button>
            <Button className="w-full text-left justify-start" variant="outline">Service Reminder</Button>
          </div>
          <Button className="btn-neon w-full">
            <Brain className="w-4 h-4 mr-2" />
            Create Email
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

// AI Insights Tools Component
const AIInsightsTools = () => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <Card className="glass-card">
        <CardContent className="p-6 text-center">
          <TrendingUp className="w-12 h-12 mx-auto mb-4 text-green-400" />
          <h3 className="text-lg font-semibold text-glass-bright mb-2">Sales Forecasting</h3>
          <p className="text-sm text-glass-muted mb-4">AI-powered sales predictions based on current trends</p>
          <Button className="btn-neon w-full">
            View Forecast
          </Button>
        </CardContent>
      </Card>

      <Card className="glass-card">
        <CardContent className="p-6 text-center">
          <Users className="w-12 h-12 mx-auto mb-4 text-blue-400" />
          <h3 className="text-lg font-semibold text-glass-bright mb-2">Lead Scoring</h3>
          <p className="text-sm text-glass-muted mb-4">Automatically score leads based on conversion probability</p>
          <Button className="btn-neon w-full">
            Analyze Leads
          </Button>
        </CardContent>
      </Card>

      <Card className="glass-card">
        <CardContent className="p-6 text-center">
          <Target className="w-12 h-12 mx-auto mb-4 text-purple-400" />
          <h3 className="text-lg font-semibold text-glass-bright mb-2">Market Insights</h3>
          <p className="text-sm text-glass-muted mb-4">Real-time market analysis and competitive intelligence</p>
          <Button className="btn-neon w-full">
            View Insights
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

// Automation Tools Component
const AutomationTools = () => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <Card className="glass-card">
        <CardContent className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <Zap className="w-6 h-6 text-yellow-400" />
            <h3 className="text-xl font-semibold text-glass-bright">Smart Responses</h3>
          </div>
          <p className="text-glass-muted mb-6">AI automatically responds to common customer inquiries</p>
          
          <div className="space-y-4 mb-6">
            <div className="flex justify-between items-center p-3 bg-glass-muted/10 rounded">
              <span className="text-glass-bright">Price Inquiries</span>
              <Badge className="bg-green-600 text-white">Active</Badge>
            </div>
            <div className="flex justify-between items-center p-3 bg-glass-muted/10 rounded">
              <span className="text-glass-bright">Availability Questions</span>
              <Badge className="bg-green-600 text-white">Active</Badge>
            </div>
            <div className="flex justify-between items-center p-3 bg-glass-muted/10 rounded">
              <span className="text-glass-bright">Appointment Requests</span>
              <Badge className="bg-gray-600 text-white">Inactive</Badge>
            </div>
          </div>
          
          <Button className="btn-neon w-full">
            <Settings className="w-4 h-4 mr-2" />
            Configure Responses
          </Button>
        </CardContent>
      </Card>

      <Card className="glass-card">
        <CardContent className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <Brain className="w-6 h-6 text-pink-400" />
            <h3 className="text-xl font-semibold text-glass-bright">Lead Enrichment</h3>
          </div>
          <p className="text-glass-muted mb-6">Automatically enhance lead profiles with AI-gathered data</p>
          
          <div className="space-y-4 mb-6">
            <div className="flex items-center justify-between">
              <span className="text-glass-bright text-sm">Social Media Profiles</span>
              <ArrowRight className="w-4 h-4 text-glass-muted" />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-glass-bright text-sm">Property Records</span>
              <ArrowRight className="w-4 h-4 text-glass-muted" />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-glass-bright text-sm">Purchase History</span>
              <ArrowRight className="w-4 h-4 text-glass-muted" />
            </div>
          </div>
          
          <Button className="btn-neon w-full">
            <Sparkles className="w-4 h-4 mr-2" />
            Start Enrichment
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default AIToolkit;