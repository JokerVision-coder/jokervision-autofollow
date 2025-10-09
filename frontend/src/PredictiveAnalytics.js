import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  Brain, 
  Target, 
  Zap, 
  AlertCircle, 
  CheckCircle, 
  Clock,
  Users,
  Car,
  DollarSign,
  BarChart3,
  PieChart,
  Activity,
  Sparkles,
  Bot,
  Lightbulb
} from 'lucide-react';

const PredictiveAnalytics = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState('overview');
  const [leadScores, setLeadScores] = useState([]);
  const [inventoryPredictions, setInventoryPredictions] = useState([]);
  const [behaviorAnalysis, setBehaviorAnalysis] = useState(null);

  useEffect(() => {
    loadPredictiveData();
  }, []);

  const loadPredictiveData = async () => {
    try {
      setLoading(true);
      
      // Load dashboard insights
      const dashboardResponse = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/ml/predictive-dashboard`);
      if (dashboardResponse.ok) {
        const data = await dashboardResponse.json();
        setDashboardData(data);
      }

      // Load behavior analysis
      const behaviorResponse = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/ml/customer-behavior-analysis`);
      if (behaviorResponse.ok) {
        const behaviorData = await behaviorResponse.json();
        setBehaviorAnalysis(behaviorData);
      }

      // Mock lead scores for demo
      setLeadScores([
        { id: 1, name: 'John Martinez', score: 94, probability: 87, status: 'Hot', source: 'Voice AI Call' },
        { id: 2, name: 'Sarah Johnson', score: 89, probability: 82, status: 'Hot', source: 'Facebook Marketplace' },
        { id: 3, name: 'Mike Thompson', score: 76, probability: 68, status: 'Warm', source: 'Website Form' },
        { id: 4, name: 'Lisa Chen', score: 71, probability: 63, status: 'Warm', source: 'Voice AI Call' },
        { id: 5, name: 'David Wilson', score: 45, probability: 35, status: 'Cold', source: 'Phone Call' },
      ]);

      // Mock inventory predictions
      setInventoryPredictions([
        { id: 1, vehicle: '2024 Toyota Camry', demandScore: 92, daysToSell: 12, category: 'Hot', price: 28500 },
        { id: 2, vehicle: '2023 Honda CR-V', demandScore: 87, daysToSell: 18, category: 'Hot', price: 32900 },
        { id: 3, vehicle: '2024 Ford F-150', demandScore: 78, daysToSell: 25, category: 'Good', price: 45200 },
        { id: 4, vehicle: '2023 BMW X3', demandScore: 65, daysToSell: 35, category: 'Good', price: 52800 },
        { id: 5, vehicle: '2022 Chevrolet Malibu', demandScore: 43, daysToSell: 52, category: 'Slow', price: 24900 },
      ]);

    } catch (error) {
      console.error('Failed to load predictive data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-400';
    if (score >= 60) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getScoreBackground = (score) => {
    if (score >= 80) return 'bg-green-500/20';
    if (score >= 60) return 'bg-yellow-500/20';
    return 'bg-red-500/20';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-cyan-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-white">Loading Revolutionary AI Analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-cyan-900">
      {/* Header */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-cyan-600/20"></div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                🧠 Revolutionary Predictive Analytics
              </h1>
              <p className="text-gray-300 text-lg mt-2">
                Industry-first AI-powered insights for automotive dealership success
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="bg-green-500/20 px-4 py-2 rounded-full border border-green-500/30">
                <span className="text-green-400 font-semibold flex items-center">
                  <Bot className="w-4 h-4 mr-2" />
                  AI Models Active
                </span>
              </div>
              <button 
                onClick={loadPredictiveData}
                className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-lg text-white font-semibold transition-colors"
              >
                Refresh Insights
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="border-b border-gray-700">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'overview', name: 'AI Overview', icon: Brain },
              { id: 'leads', name: 'Lead Intelligence', icon: Target },
              { id: 'inventory', name: 'Inventory Forecasting', icon: Car },
              { id: 'behavior', name: 'Customer Analytics', icon: Users },
              { id: 'performance', name: 'Sales Predictions', icon: TrendingUp }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setSelectedTab(tab.id)}
                  className={`${
                    selectedTab === tab.id
                      ? 'border-purple-500 text-purple-400'
                      : 'border-transparent text-gray-400 hover:text-gray-300'
                  } whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium flex items-center space-x-2 transition-colors`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.name}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* AI Overview Tab */}
        {selectedTab === 'overview' && dashboardData && (
          <div className="space-y-6">
            
            {/* Real-time Alerts */}
            {dashboardData.real_time_alerts && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {dashboardData.real_time_alerts.map((alert, index) => (
                  <div key={index} className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6">
                    <div className="flex items-start space-x-3">
                      <div className={`p-2 rounded-lg ${
                        alert.urgency === 'high' ? 'bg-red-500/20 text-red-400' :
                        alert.urgency === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                        'bg-blue-500/20 text-blue-400'
                      }`}>
                        <AlertCircle className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-white font-semibold">{alert.message}</h3>
                        <p className="text-gray-400 text-sm mt-1">{alert.action}</p>
                        <span className={`inline-block px-2 py-1 rounded text-xs font-medium mt-2 ${
                          alert.urgency === 'high' ? 'bg-red-500/20 text-red-400' :
                          alert.urgency === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                          'bg-blue-500/20 text-blue-400'
                        }`}>
                          {alert.urgency.toUpperCase()} PRIORITY
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Key Insights Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-gradient-to-br from-green-600/20 to-green-800/20 border border-green-600/30 rounded-xl p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-400 text-sm font-medium">Lead Insights</p>
                    <p className="text-2xl font-bold text-white">{dashboardData.lead_insights?.high_probability_leads || 0}</p>
                    <p className="text-green-400 text-xs">{dashboardData.lead_insights?.conversion_forecast || 'Steady performance'}</p>
                  </div>
                  <Target className="w-8 h-8 text-green-400" />
                </div>
              </div>

              <div className="bg-gradient-to-br from-blue-600/20 to-blue-800/20 border border-blue-600/30 rounded-xl p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-400 text-sm font-medium">Inventory Intelligence</p>
                    <p className="text-2xl font-bold text-white">{dashboardData.inventory_insights?.fast_moving_vehicles || 0}</p>
                    <p className="text-blue-400 text-xs">{dashboardData.inventory_insights?.demand_forecast || 'Stable demand'}</p>
                  </div>
                  <Car className="w-8 h-8 text-blue-400" />
                </div>
              </div>

              <div className="bg-gradient-to-br from-purple-600/20 to-purple-800/20 border border-purple-600/30 rounded-xl p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-400 text-sm font-medium">Sales Predictions</p>
                    <p className="text-2xl font-bold text-white">{dashboardData.sales_insights?.monthly_forecast?.split(' ')[0] || '$2.4M'}</p>
                    <p className="text-purple-400 text-xs">{dashboardData.sales_insights?.top_performer || 'Strong performance'}</p>
                  </div>
                  <DollarSign className="w-8 h-8 text-purple-400" />
                </div>
              </div>

              <div className="bg-gradient-to-br from-pink-600/20 to-pink-800/20 border border-pink-600/30 rounded-xl p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-pink-400 text-sm font-medium">AI Advantage</p>
                    <p className="text-2xl font-bold text-white">+28%</p>
                    <p className="text-pink-400 text-xs">Voice AI Conversion Boost</p>
                  </div>
                  <Sparkles className="w-8 h-8 text-pink-400" />
                </div>
              </div>
            </div>

            {/* AI Recommendations */}
            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                <Lightbulb className="w-5 h-5 mr-2 text-yellow-400" />
                Revolutionary AI Recommendations
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {dashboardData.ai_recommendations?.map((recommendation, index) => (
                  <div key={index} className="flex items-start space-x-3 p-4 bg-gray-700/30 rounded-lg">
                    <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                    <p className="text-gray-300">{recommendation}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Competitive Advantages */}
            {dashboardData.competitive_advantages && (
              <div className="bg-gradient-to-r from-purple-600/10 to-pink-600/10 border border-purple-600/30 rounded-xl p-6">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                  <Zap className="w-5 h-5 mr-2 text-yellow-400" />
                  Industry-Leading Competitive Advantages
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {dashboardData.competitive_advantages.map((advantage, index) => (
                    <div key={index} className="flex items-center space-x-3 p-3 bg-purple-600/10 rounded-lg">
                      <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                      <p className="text-gray-200 text-sm">{advantage}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Lead Intelligence Tab */}
        {selectedTab === 'leads' && (
          <div className="space-y-6">
            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6">
              <h3 className="text-xl font-bold text-white mb-6 flex items-center">
                <Target className="w-5 h-5 mr-2 text-green-400" />
                AI-Powered Lead Scoring & Intelligence
              </h3>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-700">
                      <th className="text-left text-gray-400 font-medium pb-3">Lead</th>
                      <th className="text-left text-gray-400 font-medium pb-3">AI Score</th>
                      <th className="text-left text-gray-400 font-medium pb-3">Conversion %</th>
                      <th className="text-left text-gray-400 font-medium pb-3">Status</th>
                      <th className="text-left text-gray-400 font-medium pb-3">Source</th>
                      <th className="text-left text-gray-400 font-medium pb-3">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leadScores.map((lead) => (
                      <tr key={lead.id} className="border-b border-gray-800">
                        <td className="py-4">
                          <div className="text-white font-medium">{lead.name}</div>
                        </td>
                        <td className="py-4">
                          <div className="flex items-center space-x-2">
                            <div className={`px-3 py-1 rounded-full text-sm font-bold ${getScoreBackground(lead.score)} ${getScoreColor(lead.score)}`}>
                              {lead.score}
                            </div>
                          </div>
                        </td>
                        <td className="py-4">
                          <span className={`font-semibold ${getScoreColor(lead.probability)}`}>
                            {lead.probability}%
                          </span>
                        </td>
                        <td className="py-4">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            lead.status === 'Hot' ? 'bg-red-500/20 text-red-400' :
                            lead.status === 'Warm' ? 'bg-yellow-500/20 text-yellow-400' :
                            'bg-blue-500/20 text-blue-400'
                          }`}>
                            {lead.status}
                          </span>
                        </td>
                        <td className="py-4 text-gray-300">{lead.source}</td>
                        <td className="py-4">
                          <button className="bg-purple-600 hover:bg-purple-700 px-3 py-1 rounded text-sm text-white transition-colors">
                            Contact Now
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Inventory Forecasting Tab */}
        {selectedTab === 'inventory' && (
          <div className="space-y-6">
            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6">
              <h3 className="text-xl font-bold text-white mb-6 flex items-center">
                <Car className="w-5 h-5 mr-2 text-blue-400" />
                Predictive Inventory Demand Forecasting
              </h3>
              
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {inventoryPredictions.map((prediction) => (
                  <div key={prediction.id} className="bg-gray-700/30 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold text-white">{prediction.vehicle}</h4>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        prediction.category === 'Hot' ? 'bg-green-500/20 text-green-400' :
                        prediction.category === 'Good' ? 'bg-yellow-500/20 text-yellow-400' :
                        'bg-red-500/20 text-red-400'
                      }`}>
                        {prediction.category}
                      </span>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Demand Score:</span>
                        <span className={`font-semibold ${getScoreColor(prediction.demandScore)}`}>
                          {prediction.demandScore}/100
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Days to Sell:</span>
                        <span className="text-white">{prediction.daysToSell} days</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Price:</span>
                        <span className="text-white">${prediction.price.toLocaleString()}</span>
                      </div>
                    </div>
                    
                    <div className="mt-4 pt-3 border-t border-gray-600">
                      <button className="w-full bg-blue-600 hover:bg-blue-700 px-3 py-2 rounded text-sm text-white transition-colors">
                        View Details & Recommendations
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Customer Analytics Tab */}
        {selectedTab === 'behavior' && behaviorAnalysis && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              
              {/* Customer Stats */}
              <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6">
                <h4 className="text-lg font-semibold text-white mb-4 flex items-center">
                  <Users className="w-5 h-5 mr-2 text-blue-400" />
                  Customer Insights
                </h4>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Analyzed Customers:</span>
                    <span className="text-white font-semibold">{behaviorAnalysis.total_analyzed}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Avg Budget:</span>
                    <span className="text-green-400 font-semibold">${behaviorAnalysis.average_budget?.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Avg Response:</span>
                    <span className="text-white font-semibold">{behaviorAnalysis.average_response_time_hours}h</span>
                  </div>
                </div>
              </div>

              {/* Budget Distribution */}
              <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6">
                <h4 className="text-lg font-semibold text-white mb-4 flex items-center">
                  <PieChart className="w-5 h-5 mr-2 text-green-400" />
                  Budget Distribution
                </h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Under $25K:</span>
                    <span className="text-white font-semibold">{behaviorAnalysis.budget_distribution?.under_25k}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">$25K - $50K:</span>
                    <span className="text-white font-semibold">{behaviorAnalysis.budget_distribution?.['25k_50k']}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">$50K+:</span>
                    <span className="text-white font-semibold">{behaviorAnalysis.budget_distribution?.['50k_plus']}</span>
                  </div>
                </div>
              </div>

              {/* Top Lead Sources */}
              <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6">
                <h4 className="text-lg font-semibold text-white mb-4 flex items-center">
                  <BarChart3 className="w-5 h-5 mr-2 text-purple-400" />
                  Top Lead Sources
                </h4>
                <div className="space-y-3">
                  {behaviorAnalysis.top_lead_sources?.slice(0, 3).map(([source, count], index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-gray-400">{source}:</span>
                      <span className="text-white font-semibold">{count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Behavioral Insights */}
            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6">
              <h4 className="text-lg font-semibold text-white mb-4 flex items-center">
                <Activity className="w-5 h-5 mr-2 text-yellow-400" />
                AI-Generated Behavioral Insights
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {behaviorAnalysis.behavioral_insights?.map((insight, index) => (
                  <div key={index} className="flex items-start space-x-3 p-4 bg-gray-700/30 rounded-lg">
                    <div className="w-2 h-2 bg-yellow-400 rounded-full mt-2"></div>
                    <p className="text-gray-300">{insight}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Optimization Opportunities */}
            {behaviorAnalysis.optimization_opportunities && (
              <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6">
                <h4 className="text-lg font-semibold text-white mb-4 flex items-center">
                  <Zap className="w-5 h-5 mr-2 text-green-400" />
                  Optimization Opportunities
                </h4>
                <div className="space-y-4">
                  {behaviorAnalysis.optimization_opportunities.map((opportunity, index) => (
                    <div key={index} className="border border-gray-600 rounded-lg p-4">
                      <h5 className="font-semibold text-white mb-2">{opportunity.area}</h5>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-400">Current:</span>
                          <p className="text-gray-300">{opportunity.current}</p>
                        </div>
                        <div>
                          <span className="text-gray-400">Recommendation:</span>
                          <p className="text-green-400">{opportunity.recommendation}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Sales Performance Predictions Tab */}
        {selectedTab === 'performance' && (
          <div className="space-y-6">
            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6">
              <h3 className="text-xl font-bold text-white mb-6 flex items-center">
                <TrendingUp className="w-5 h-5 mr-2 text-purple-400" />
                AI Sales Performance Predictions
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-4">
                  <h4 className="font-semibold text-white">Current Performance</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Performance Score:</span>
                      <span className="text-green-400 font-bold">85/100</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Conversion Rate:</span>
                      <span className="text-white">16%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Avg Deal Size:</span>
                      <span className="text-white">$31,500</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Voice AI Usage:</span>
                      <span className="text-purple-400">65%</span>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h4 className="font-semibold text-white">Monthly Predictions</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Expected Leads:</span>
                      <span className="text-blue-400 font-bold">47</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Expected Sales:</span>
                      <span className="text-green-400 font-bold">8</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Expected Revenue:</span>
                      <span className="text-green-400 font-bold">$252K</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Performance Tier:</span>
                      <span className="text-yellow-400 font-bold">Excellent</span>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h4 className="font-semibold text-white">AI Recommendations</h4>
                  <div className="space-y-2">
                    <div className="flex items-start space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-400 mt-1 flex-shrink-0" />
                      <span className="text-gray-300 text-sm">Leverage Voice AI for better engagement</span>
                    </div>
                    <div className="flex items-start space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-400 mt-1 flex-shrink-0" />
                      <span className="text-gray-300 text-sm">Focus on upselling opportunities</span>
                    </div>
                    <div className="flex items-start space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-400 mt-1 flex-shrink-0" />
                      <span className="text-gray-300 text-sm">Maintain current response time</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default PredictiveAnalytics;