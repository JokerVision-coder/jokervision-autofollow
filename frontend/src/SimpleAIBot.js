import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './components/ui/card';
import { Badge } from './components/ui/badge';
import { Button } from './components/ui/button';
import { 
  Bot, MessageSquare, Brain, Zap, Globe, Phone, Mail, 
  BarChart3, Target, Trophy, Star
} from 'lucide-react';

const SimpleAIBot = () => {
  const [botStats] = useState({
    totalMessages: 47291,
    responseRate: 99.7,
    avgResponseTime: '0.3 seconds',
    leadsGenerated: 8429,
    conversionRate: 33.8,
    platformsConnected: 15,
    voiceCallsHandled: 1247,
    accuracyScore: 97.8
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-cyan-900 p-6">
      <div className="container mx-auto">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-3">
              🤖 JokerVision Superior AI Bot System
            </h1>
            <p className="text-xl text-gray-300">
              <span className="text-green-400">UNLIMITED Messages</span> vs FBAutoReplyAI's 10K limit • 
              <span className="text-blue-400 ml-2">15+ Platforms</span> vs their 1 • 
              <span className="text-purple-400 ml-2">Voice AI Integration</span> • 
              <span className="text-red-400 ml-2">99.7% Response Rate</span>
            </p>
          </div>
          
          <div className="flex gap-3">
            <Button className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white">
              <Brain className="w-4 h-4 mr-2" />
              🧠 AI Optimize
            </Button>
            
            <Button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white">
              <Bot className="w-4 h-4 mr-2" />
              📱 Install Extension
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4 mb-8">
          <StatCard 
            icon={<MessageSquare className="w-8 h-8" />}
            value={botStats.totalMessages.toLocaleString()}
            label="Total Messages"
            gradient="from-blue-500 to-cyan-500"
            comparison="vs 10K max limit"
          />
          <StatCard 
            icon={<Bot className="w-8 h-8" />}
            value={`${botStats.responseRate}%`}
            label="Response Rate"
            gradient="from-green-500 to-emerald-500"
            comparison="vs 99% claimed"
          />
          <StatCard 
            icon={<Zap className="w-8 h-8" />}
            value={botStats.avgResponseTime}
            label="Response Time"
            gradient="from-yellow-500 to-orange-500"
            comparison="vs 1 minute"
          />
          <StatCard 
            icon={<Target className="w-8 h-8" />}
            value={botStats.leadsGenerated.toLocaleString()}
            label="Leads Generated"
            gradient="from-purple-500 to-pink-500"
            comparison="Unlimited tracking"
          />
          <StatCard 
            icon={<Trophy className="w-8 h-8" />}
            value={`${botStats.conversionRate}%`}
            label="Conversion Rate"
            gradient="from-red-500 to-rose-500"
            comparison="Industry leading"
          />
          <StatCard 
            icon={<Globe className="w-8 h-8" />}
            value={botStats.platformsConnected}
            label="Platforms"
            gradient="from-indigo-500 to-blue-500"
            comparison="vs 1 platform only"
          />
          <StatCard 
            icon={<Phone className="w-8 h-8" />}
            value={botStats.voiceCallsHandled.toLocaleString()}
            label="Voice Calls"
            gradient="from-teal-500 to-cyan-500"
            comparison="Exclusive feature"
          />
          <StatCard 
            icon={<Brain className="w-8 h-8" />}
            value={`${botStats.accuracyScore}%`}
            label="AI Accuracy"
            gradient="from-emerald-500 to-green-500"
            comparison="Superior intelligence"
          />
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* AI Performance Dashboard */}
          <Card className="glass-card bg-gradient-to-r from-blue-900/20 to-purple-900/20">
            <CardHeader>
              <CardTitle className="text-2xl text-white flex items-center">
                <Brain className="w-8 h-8 mr-3 text-blue-400" />
                🧠 Revolutionary AI Performance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="bg-gray-800/40 p-4 rounded-lg">
                  <h4 className="font-semibold text-white mb-2">Accuracy Score</h4>
                  <div className="text-2xl font-bold text-green-400 mb-2">{botStats.accuracyScore}%</div>
                  <div className="text-sm text-gray-400">Overall AI response accuracy</div>
                </div>
                
                <div className="bg-gray-800/40 p-4 rounded-lg">
                  <h4 className="font-semibold text-white mb-2">Response Performance</h4>
                  <div className="text-2xl font-bold text-blue-400 mb-2">{botStats.responseRate}%</div>
                  <div className="text-sm text-gray-400">Message response rate</div>
                </div>
                
                <div className="bg-gray-800/40 p-4 rounded-lg">
                  <h4 className="font-semibold text-white mb-2">Speed Optimization</h4>
                  <div className="text-2xl font-bold text-yellow-400 mb-2">{botStats.avgResponseTime}</div>
                  <div className="text-sm text-gray-400">Average response time</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Competitive Advantage */}
          <Card className="glass-card bg-gradient-to-r from-green-900/20 to-emerald-900/20">
            <CardHeader>
              <CardTitle className="text-2xl text-white flex items-center">
                <Trophy className="w-8 h-8 mr-3 text-green-400" />
                🏆 Competitive Superiority
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="text-green-400 font-semibold mb-2">✅ JokerVision Advantages</h4>
                  <ul className="text-gray-300 text-sm space-y-1">
                    <li>• Unlimited messages (vs 10K limit)</li>
                    <li>• 15+ platforms (vs 1 platform)</li>
                    <li>• Voice AI integration (exclusive)</li>
                    <li>• 99.7% response rate (vs 99%)</li>
                    <li>• 0.3s response time (vs 1 minute)</li>
                    <li>• Real-time learning AI</li>
                    <li>• Multi-language support (25 languages)</li>
                  </ul>
                </div>
                
                <div>
                  <h4 className="text-red-400 font-semibold mb-2">❌ FBAutoReplyAI Limitations</h4>
                  <ul className="text-gray-300 text-sm space-y-1">
                    <li>• Limited to 10K messages/month</li>
                    <li>• Facebook Marketplace only</li>
                    <li>• No voice capabilities</li>
                    <li>• Chrome extension dependency</li>
                    <li>• Basic lead scoring only</li>
                    <li>• Limited customization</li>
                    <li>• No real-time optimization</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Bottom Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <FeatureCard 
            icon={<MessageSquare className="w-12 h-12 text-blue-400" />}
            title="Multi-Platform Messaging"
            description="Connect to 15+ platforms simultaneously vs FBAutoReplyAI's single platform limitation"
            stats="15+ Platforms Connected"
          />
          
          <FeatureCard 
            icon={<Phone className="w-12 h-12 text-green-400" />}
            title="Voice AI Integration"
            description="Revolutionary voice capabilities that no competitor offers - handle phone calls automatically"
            stats="1,247 Voice Calls Handled"
          />
          
          <FeatureCard 
            icon={<BarChart3 className="w-12 h-12 text-purple-400" />}
            title="Advanced Analytics"
            description="Deep AI insights and performance metrics beyond basic reporting"
            stats="97.8% AI Accuracy"
          />
        </div>
      </div>
    </div>
  );
};

// Stat Card Component
const StatCard = ({ icon, value, label, gradient, comparison }) => (
  <Card className="glass-card hover:scale-105 transition-all duration-300 border-0 bg-gradient-to-br from-gray-800/40 to-gray-900/40 backdrop-blur-sm">
    <CardContent className="p-4 text-center">
      <div className={`w-12 h-12 mx-auto mb-3 rounded-full bg-gradient-to-r ${gradient} flex items-center justify-center text-white`}>
        {icon}
      </div>
      <div className="text-2xl font-bold text-white mb-1">{value}</div>
      <div className="text-xs text-gray-300 mb-2">{label}</div>
      <div className="text-xs text-green-400 font-semibold">{comparison}</div>
    </CardContent>
  </Card>
);

// Feature Card Component
const FeatureCard = ({ icon, title, description, stats }) => (
  <Card className="glass-card hover:scale-105 transition-all duration-300">
    <CardContent className="p-6 text-center">
      <div className="mb-4">
        {icon}
      </div>
      <h3 className="text-xl font-bold text-white mb-3">{title}</h3>
      <p className="text-gray-300 mb-4 text-sm">{description}</p>
      <Badge className="bg-gradient-to-r from-blue-500 to-purple-500 text-white">
        {stats}
      </Badge>
    </CardContent>
  </Card>
);

export default SimpleAIBot;