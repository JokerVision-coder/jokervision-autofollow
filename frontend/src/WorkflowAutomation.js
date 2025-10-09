import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Zap, 
  TrendingUp, 
  Users, 
  MessageSquare, 
  Calendar, 
  Car,
  BarChart3,
  Settings,
  Play,
  Plus,
  CheckCircle,
  AlertTriangle,
  Clock,
  Target
} from 'lucide-react';

const WorkflowAutomation = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [analytics, setAnalytics] = useState(null);
  const [demoResults, setDemoResults] = useState(null);
  const [isExecutingDemo, setIsExecutingDemo] = useState(false);
  const [customWorkflow, setCustomWorkflow] = useState({
    name: '',
    displayName: '',
    trigger: '',
    conditions: [],
    actions: [],
    priority: 'medium'
  });

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const backendUrl = process.env.REACT_APP_BACKEND_URL || '';
      const response = await fetch(`${backendUrl}/api/automation/analytics`);
      const data = await response.json();
      setAnalytics(data);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    }
  };

  const executeDemoScenarios = async () => {
    setIsExecutingDemo(true);
    try {
      const backendUrl = process.env.REACT_APP_BACKEND_URL || '';
      const response = await fetch(`${backendUrl}/api/automation/demo-scenarios`, {
        method: 'POST'
      });
      const data = await response.json();
      setDemoResults(data);
    } catch (error) {
      console.error('Error executing demo scenarios:', error);
    } finally {
      setIsExecutingDemo(false);
    }
  };

  const triggerCustomWorkflow = async (triggerName, triggerData) => {
    try {
      const backendUrl = process.env.REACT_APP_BACKEND_URL || '';
      const response = await fetch(`${backendUrl}/api/automation/trigger-workflow`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          trigger: triggerName,
          data: triggerData
        })
      });
      const data = await response.json();
      console.log('Workflow triggered:', data);
      fetchAnalytics(); // Refresh analytics
    } catch (error) {
      console.error('Error triggering workflow:', error);
    }
  };

  const createCustomWorkflow = async () => {
    try {
      const backendUrl = process.env.REACT_APP_BACKEND_URL || '';
      const response = await fetch(`${backendUrl}/api/automation/create-workflow`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(customWorkflow)
      });
      const data = await response.json();
      console.log('Custom workflow created:', data);
      setCustomWorkflow({
        name: '',
        displayName: '',
        trigger: '',
        conditions: [],
        actions: [],
        priority: 'medium'
      });
      fetchAnalytics();
    } catch (error) {
      console.error('Error creating workflow:', error);
    }
  };

  const renderOverviewTab = () => (
    <div className="space-y-6">
      {/* Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="bg-gradient-to-br from-blue-900/40 to-blue-800/40 backdrop-blur-lg border border-blue-500/30 rounded-2xl p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <Zap className="w-8 h-8 text-blue-400" />
            <span className="text-blue-400 text-sm font-medium">Active</span>
          </div>
          <h3 className="text-2xl font-bold text-white mb-2">
            {analytics?.automation_analytics?.total_workflows || 0}
          </h3>
          <p className="text-gray-300 text-sm">Total Workflows</p>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          className="bg-gradient-to-br from-green-900/40 to-green-800/40 backdrop-blur-lg border border-green-500/30 rounded-2xl p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <CheckCircle className="w-8 h-8 text-green-400" />
            <span className="text-green-400 text-sm font-medium">Success</span>
          </div>
          <h3 className="text-2xl font-bold text-white mb-2">
            {analytics?.automation_analytics?.success_rate || 0}%
          </h3>
          <p className="text-gray-300 text-sm">Success Rate</p>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          className="bg-gradient-to-br from-indigo-900/40 to-indigo-800/40 backdrop-blur-lg border border-indigo-500/30 rounded-2xl p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <BarChart3 className="w-8 h-8 text-purple-400" />
            <span className="text-purple-400 text-sm font-medium">24h</span>
          </div>
          <h3 className="text-2xl font-bold text-white mb-2">
            {analytics?.automation_analytics?.executions_24h || 0}
          </h3>
          <p className="text-gray-300 text-sm">Recent Executions</p>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          className="bg-gradient-to-br from-orange-900/40 to-orange-800/40 backdrop-blur-lg border border-orange-500/30 rounded-2xl p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <TrendingUp className="w-8 h-8 text-orange-400" />
            <span className="text-orange-400 text-sm font-medium">Impact</span>
          </div>
          <h3 className="text-2xl font-bold text-white mb-2">+42%</h3>
          <p className="text-gray-300 text-sm">Response Improvement</p>
        </motion.div>
      </div>

      {/* Demo Scenarios Section */}
      <div className="bg-gradient-to-br from-gray-900/60 to-gray-800/60 backdrop-blur-lg border border-gray-500/30 rounded-2xl p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-2xl font-bold text-white mb-2">🚗 Car Sales Automation Demo</h3>
            <p className="text-gray-300">Experience revolutionary automotive sales automation in action</p>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={executeDemoScenarios}
            disabled={isExecutingDemo}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-3 rounded-xl font-semibold flex items-center gap-2 disabled:opacity-50"
          >
            {isExecutingDemo ? (
              <>
                <Clock className="w-5 h-5 animate-spin" />
                Executing...
              </>
            ) : (
              <>
                <Play className="w-5 h-5" />
                Run Demo
              </>
            )}
          </motion.button>
        </div>

        {demoResults && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-r from-green-900/40 to-blue-900/40 rounded-xl p-6 border border-green-500/30"
          >
            <div className="flex items-center gap-3 mb-4">
              <CheckCircle className="w-6 h-6 text-green-400" />
              <h4 className="text-lg font-bold text-white">Demo Completed Successfully</h4>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gray-900/40 rounded-lg p-4">
                <h5 className="font-semibold text-white mb-2">Scenarios Executed</h5>
                <p className="text-2xl font-bold text-green-400">{demoResults.scenarios_executed}</p>
              </div>
              <div className="bg-gray-900/40 rounded-lg p-4">
                <h5 className="font-semibold text-white mb-2">Status</h5>
                <p className="text-green-400 font-semibold">{demoResults.demo_status}</p>
              </div>
              <div className="bg-gray-900/40 rounded-lg p-4">
                <h5 className="font-semibold text-white mb-2">Capabilities</h5>
                <p className="text-blue-400 font-semibold">{demoResults.capabilities_demonstrated?.length || 0} Features</p>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );

  const renderTriggersTab = () => (
    <div className="space-y-6">
      <div className="bg-gradient-to-br from-gray-900/60 to-gray-800/60 backdrop-blur-lg border border-gray-500/30 rounded-2xl p-8">
        <h3 className="text-2xl font-bold text-white mb-6">🎯 Available Automation Triggers</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {analytics?.automation_analytics?.available_triggers?.map((trigger, index) => (
            <motion.div
              key={trigger}
              whileHover={{ scale: 1.02 }}
              className="bg-gradient-to-br from-blue-900/40 to-purple-900/40 border border-blue-500/30 rounded-xl p-6"
            >
              <div className="flex items-center gap-4 mb-4">
                <Target className="w-8 h-8 text-blue-400" />
                <div>
                  <h4 className="text-lg font-bold text-white">{trigger.replace(/_/g, ' ').toUpperCase()}</h4>
                  <p className="text-gray-300 text-sm">Automotive sales trigger</p>
                </div>
              </div>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  // Trigger with sample automotive data
                  const sampleData = {
                    customer_name: "Test Customer",
                    customer_phone: "+1555123456",
                    ai_score: 90,
                    budget: 45000,
                    interested_vehicle: "2024 Toyota RAV4",
                    demand_score: 95,
                    call_satisfaction: 4.8,
                    purchase_intent: 0.9
                  };
                  triggerCustomWorkflow(trigger, sampleData);
                }}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-2 rounded-lg font-semibold"
              >
                Test Trigger
              </motion.button>
            </motion.div>
          ))}
        </div>
      </div>

      <div className="bg-gradient-to-br from-gray-900/60 to-gray-800/60 backdrop-blur-lg border border-gray-500/30 rounded-2xl p-8">
        <h3 className="text-2xl font-bold text-white mb-6">🚗 Car Sales Automation Capabilities</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {analytics?.automation_analytics?.automation_capabilities?.map((capability, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-gradient-to-br from-green-900/40 to-blue-900/40 border border-green-500/30 rounded-lg p-4"
            >
              <div className="flex items-center gap-3">
                <Car className="w-6 h-6 text-green-400" />
                <p className="text-white font-semibold text-sm">{capability}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderAnalyticsTab = () => (
    <div className="space-y-6">
      <div className="bg-gradient-to-br from-gray-900/60 to-gray-800/60 backdrop-blur-lg border border-gray-500/30 rounded-2xl p-8">
        <h3 className="text-2xl font-bold text-white mb-6">📊 Performance Metrics</h3>
        
        {analytics?.automation_analytics?.performance_metrics && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {Object.entries(analytics.automation_analytics.performance_metrics).map(([key, value], index) => (
              <motion.div
                key={key}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                className="bg-gradient-to-br from-purple-900/40 to-pink-900/40 border border-purple-500/30 rounded-xl p-6"
              >
                <h4 className="text-sm font-semibold text-purple-300 mb-2">
                  {key.replace(/_/g, ' ').toUpperCase()}
                </h4>
                <p className="text-2xl font-bold text-white">{value}</p>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-gradient-to-br from-gray-900/60 to-gray-800/60 backdrop-blur-lg border border-gray-500/30 rounded-2xl p-8">
        <h3 className="text-2xl font-bold text-white mb-6">🔗 Integration Features</h3>
        
        {analytics?.integration_features && (
          <div className="space-y-4">
            {Object.entries(analytics.integration_features).map(([feature, description], index) => (
              <motion.div
                key={feature}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-gradient-to-r from-blue-900/40 to-indigo-900/40 border border-blue-500/30 rounded-lg p-4"
              >
                <div className="flex items-center gap-3">
                  <Zap className="w-5 h-5 text-blue-400" />
                  <div>
                    <h4 className="font-semibold text-white">{feature.replace(/_/g, ' ').toUpperCase()}</h4>
                    <p className="text-gray-300 text-sm">{description}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
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
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-4">
            🤖 Intelligent Workflow Automation
          </h1>
          <p className="text-xl text-gray-300 mb-2">Revolutionary car sales automation system</p>
          <p className="text-lg text-blue-400 font-semibold">
            Powered by AI • Enhanced for Automotive Sales • JokerVision v2.0
          </p>
        </motion.div>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {[
            { key: 'overview', label: 'Overview', icon: BarChart3 },
            { key: 'triggers', label: 'Automation Triggers', icon: Target },
            { key: 'analytics', label: 'Performance Analytics', icon: TrendingUp },
            { key: 'settings', label: 'Workflow Settings', icon: Settings }
          ].map((tab) => (
            <motion.button
              key={tab.key}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all ${
                activeTab === tab.key
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/30'
                  : 'bg-gray-800/50 text-gray-300 hover:bg-gray-700/50 border border-gray-600/30'
              }`}
            >
              <tab.icon className="w-5 h-5" />
              {tab.label}
            </motion.button>
          ))}
        </div>

        {/* Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            {activeTab === 'overview' && renderOverviewTab()}
            {activeTab === 'triggers' && renderTriggersTab()}
            {activeTab === 'analytics' && renderAnalyticsTab()}
            {activeTab === 'settings' && (
              <div className="bg-gradient-to-br from-gray-900/60 to-gray-800/60 backdrop-blur-lg border border-gray-500/30 rounded-2xl p-8">
                <h3 className="text-2xl font-bold text-white mb-6">⚙️ Workflow Settings</h3>
                <div className="text-center py-12">
                  <Settings className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-400 text-lg">Advanced workflow configuration coming soon...</p>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default WorkflowAutomation;