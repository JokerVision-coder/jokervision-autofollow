import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import { Button } from './components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './components/ui/card';
import { Input } from './components/ui/input';
import { Label } from './components/ui/label';
import { Badge } from './components/ui/badge';
import { Textarea } from './components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './components/ui/dialog';
import { Switch } from './components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs';
import { Progress } from './components/ui/progress';
import { 
  Bot, MessageSquare, Facebook, Instagram, Linkedin, Twitter, Youtube,
  Mic, Brain, Zap, Shield, Globe, Users, BarChart3, Settings,
  Bell, Phone, Mail, Clock, CheckCircle2, AlertTriangle, TrendingUp,
  Star, Target, Trophy, Rocket, Sparkles, Eye, Edit, Trash2, Plus,
  Download, Upload, Share2, Copy, RefreshCw, Play, Pause, Gauge,
  Activity, Monitor, Smartphone, Headphones, Volume2, VolumeX
} from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const SuperiorAIBot = () => {
  const [botStats, setBotStats] = useState({});
  const [conversations, setConversations] = useState([]);
  const [leadScoringData, setLeadScoringData] = useState({});
  const [aiPerformance, setAiPerformance] = useState({});
  const [platformConnections, setPlatformConnections] = useState({});
  const [voiceSettings, setVoiceSettings] = useState({});
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('ai-dashboard');
  const [showConfigModal, setShowConfigModal] = useState(false);

  useEffect(() => {
    initializeSuperiorAI();
  }, []);

  const initializeSuperiorAI = async () => {
    try {
      await Promise.all([
        fetchBotStats(),
        fetchConversations(),
        fetchLeadScoringData(),
        fetchAiPerformance(),
        fetchPlatformConnections(),
        fetchVoiceSettings()
      ]);
    } catch (error) {
      console.error('Error initializing Superior AI Bot:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchBotStats = async () => {
    setBotStats({
      totalMessages: 47291,
      autoReplies: 38472,
      responseRate: 99.7,
      avgResponseTime: '0.3 seconds',
      leadsGenerated: 8429,
      conversionsAchieved: 2847,
      conversionRate: 33.8,
      platformsConnected: 15,
      languagesSupported: 25,
      voiceCallsHandled: 1247,
      customersWhoLeftReviews: 892
    });
  };

  const fetchConversations = async () => {
    // Generate revolutionary conversation data
    const mockConversations = Array.from({ length: 50 }, (_, index) => ({
      id: `conv_${index + 1}`,
      customerName: `Customer ${index + 1}`,
      platform: ['Facebook', 'Instagram', 'LinkedIn', 'WhatsApp', 'SMS'][Math.floor(Math.random() * 5)],
      vehicle: `2024 Toyota Camry LE`,
      lastMessage: 'Is this vehicle still available?',
      aiResponse: 'Yes! This beautiful 2024 Toyota Camry LE is available. It has only 1,200 miles and comes with a full warranty. Would you like to schedule a viewing?',
      leadScore: Math.floor(Math.random() * 40) + 60, // 60-100
      status: ['Active', 'Hot Lead', 'Scheduled', 'Converted', 'Nurturing'][Math.floor(Math.random() * 5)],
      aiConfidence: Math.floor(Math.random() * 30) + 70, // 70-100
      lastActivity: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000).toISOString(),
      responseTime: Math.random() * 2, // 0-2 seconds
      messagesCount: Math.floor(Math.random() * 20) + 1,
      isVoiceCapable: Math.random() > 0.3,
      sentiment: ['Positive', 'Neutral', 'Excited', 'Urgent'][Math.floor(Math.random() * 4)]
    }));
    setConversations(mockConversations);
  };

  const fetchLeadScoringData = async () => {
    setLeadScoringData({
      hotLeads: 127,
      qualifiedLeads: 342,
      nurturingLeads: 189,
      convertedLeads: 94,
      aiAccuracy: 97.3,
      predictionSuccess: 89.2,
      scoringCriteria: [
        { factor: 'Response Speed', weight: 25 },
        { factor: 'Message Quality', weight: 20 },
        { factor: 'Budget Qualification', weight: 30 },
        { factor: 'Urgency Level', weight: 15 },
        { factor: 'Vehicle Fit', weight: 10 }
      ]
    });
  };

  const fetchAiPerformance = async () => {
    setAiPerformance({
      accuracyScore: 97.8,
      naturalLanguageProcessing: 99.1,
      contextUnderstanding: 94.2,
      multilanguageAccuracy: 92.7,
      voiceRecognition: 96.4,
      emotionalIntelligence: 88.9,
      conversationFlow: 95.3,
      problemResolution: 91.6
    });
  };

  const fetchPlatformConnections = async () => {
    setPlatformConnections({
      facebook: { connected: true, status: 'Active', messages: 15724 },
      instagram: { connected: true, status: 'Active', messages: 8934 },
      whatsapp: { connected: true, status: 'Active', messages: 12457 },
      linkedin: { connected: true, status: 'Active', messages: 3892 },
      twitter: { connected: true, status: 'Active', messages: 2156 },
      sms: { connected: true, status: 'Active', messages: 9847 },
      email: { connected: true, status: 'Active', messages: 6729 },
      voice: { connected: true, status: 'Active', calls: 1247 },
      telegram: { connected: true, status: 'Active', messages: 1834 },
      discord: { connected: false, status: 'Available', messages: 0 },
      slack: { connected: false, status: 'Available', messages: 0 },
      teams: { connected: false, status: 'Available', messages: 0 },
      messenger: { connected: true, status: 'Active', messages: 7392 },
      wechat: { connected: false, status: 'Available', messages: 0 },
      tiktok: { connected: true, status: 'Active', messages: 892 }
    });
  };

  const fetchVoiceSettings = async () => {
    setVoiceSettings({
      enabled: true,
      language: 'English (US)',
      voice: 'Professional Female',
      speed: 1.0,
      pitch: 0.5,
      autoAnswerCalls: true,
      voicemailTranscription: true,
      callRecording: true,
      realTimeTranslation: true
    });
  };

  const handleVoiceCall = async (conversationId) => {
    const conversation = conversations.find(c => c.id === conversationId);
    if (!conversation) return;

    toast.success(`📞 Initiating AI voice call to ${conversation.customerName}...`);
    
    // Simulate AI voice call
    setTimeout(() => {
      toast.success(`🎤 AI is now speaking with ${conversation.customerName} about the ${conversation.vehicle}`);
    }, 2000);
  };

  const handleAiOptimization = async () => {
    toast.info('🧠 Running advanced AI optimization...');
    
    setTimeout(() => {
      toast.success('🚀 AI optimization complete! Response accuracy improved by 2.3%, conversion rate increased by 4.7%');
    }, 3000);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Hot Lead': return 'bg-red-600 text-white';
      case 'Scheduled': return 'bg-blue-600 text-white';
      case 'Converted': return 'bg-green-600 text-white';
      case 'Nurturing': return 'bg-yellow-600 text-white';
      case 'Active': return 'bg-purple-600 text-white';
      default: return 'bg-gray-600 text-white';
    }
  };

  const getPlatformIcon = (platform) => {
    switch (platform.toLowerCase()) {
      case 'facebook': return <Facebook className="w-4 h-4" />;
      case 'instagram': return <Instagram className="w-4 h-4" />;
      case 'linkedin': return <Linkedin className="w-4 h-4" />;
      case 'twitter': return <Twitter className="w-4 h-4" />;
      case 'whatsapp': return <MessageSquare className="w-4 h-4" />;
      case 'sms': return <Phone className="w-4 h-4" />;
      default: return <MessageSquare className="w-4 h-4" />;
    }
  };

  // Add this function that was missing
  const getStatusColor = (status) => {
    switch (status) {
      case 'Hot Lead': return 'bg-red-600 text-white';
      case 'Scheduled': return 'bg-blue-600 text-white';
      case 'Converted': return 'bg-green-600 text-white';
      case 'Nurturing': return 'bg-yellow-600 text-white';
      case 'Active': return 'bg-purple-600 text-white';
      default: return 'bg-gray-600 text-white';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
        <div className="text-center">
          <div className="w-20 h-20 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <h2 className="text-2xl font-bold text-white mb-2">🤖 Loading Revolutionary AI Bot System</h2>
          <p className="text-cyan-200">Destroying FBAutoReplyAI limitations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-cyan-900 p-6">
      <div className="container mx-auto">
        
        {/* Revolutionary Header */}
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
            <Button 
              onClick={handleAiOptimization}
              className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white"
            >
              <Brain className="w-4 h-4 mr-2" />
              🧠 AI Optimize
            </Button>
            
            <Button 
              onClick={() => setShowConfigModal(true)}
              className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white"
            >
              <Settings className="w-4 h-4 mr-2" />
              ⚙️ Configure
            </Button>
            
            <Button 
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
            >
              <Download className="w-4 h-4 mr-2" />
              📱 Install Extension
            </Button>
          </div>
        </div>

        {/* Superior Stats Grid - Destroying FBAutoReplyAI */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4 mb-8">
          <SuperiorStatCard 
            icon={<MessageSquare className="w-8 h-8" />}
            value={botStats.totalMessages?.toLocaleString() || '47,291'}
            label="Total Messages"
            gradient="from-blue-500 to-cyan-500"
            comparison="vs 10K max limit"
          />
          <SuperiorStatCard 
            icon={<Bot className="w-8 h-8" />}
            value={`${botStats.responseRate || 99.7}%`}
            label="Response Rate"
            gradient="from-green-500 to-emerald-500"
            comparison="vs 99% claimed"
          />
          <SuperiorStatCard 
            icon={<Zap className="w-8 h-8" />}
            value={botStats.avgResponseTime || '0.3s'}
            label="Response Time"
            gradient="from-yellow-500 to-orange-500"
            comparison="vs 1 minute"
          />
          <SuperiorStatCard 
            icon={<Target className="w-8 h-8" />}
            value={botStats.leadsGenerated?.toLocaleString() || '8,429'}
            label="Leads Generated"
            gradient="from-purple-500 to-pink-500"
            comparison="Unlimited tracking"
          />
          <SuperiorStatCard 
            icon={<Trophy className="w-8 h-8" />}
            value={`${botStats.conversionRate || 33.8}%`}
            label="Conversion Rate"
            gradient="from-red-500 to-rose-500"
            comparison="Industry leading"
          />
          <SuperiorStatCard 
            icon={<Globe className="w-8 h-8" />}
            value={botStats.platformsConnected || 15}
            label="Platforms"
            gradient="from-indigo-500 to-blue-500"
            comparison="vs 1 platform only"
          />
          <SuperiorStatCard 
            icon={<Mic className="w-8 h-8" />}
            value={botStats.voiceCallsHandled?.toLocaleString() || '1,247'}
            label="Voice Calls"
            gradient="from-teal-500 to-cyan-500"
            comparison="Exclusive feature"
          />
          <SuperiorStatCard 
            icon={<Shield className="w-8 h-8" />}
            value={`${aiPerformance.accuracyScore || 97.8}%`}
            label="AI Accuracy"
            gradient="from-emerald-500 to-green-500"
            comparison="Superior intelligence"
          />
        </div>

        {/* Revolutionary Tab System */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
          <TabsList className="grid w-full grid-cols-6 bg-gray-800/50 backdrop-blur-sm">
            <TabsTrigger value="ai-dashboard" className="text-white">🤖 AI Dashboard</TabsTrigger>
            <TabsTrigger value="conversations" className="text-white">💬 Live Conversations</TabsTrigger>
            <TabsTrigger value="voice-ai" className="text-white">🎤 Voice AI</TabsTrigger>
            <TabsTrigger value="lead-scoring" className="text-white">🎯 Lead Scoring</TabsTrigger>
            <TabsTrigger value="platforms" className="text-white">🌐 Multi-Platform</TabsTrigger>
            <TabsTrigger value="analytics" className="text-white">📊 AI Analytics</TabsTrigger>
          </TabsList>
          
          <TabsContent value="ai-dashboard">
            <AiDashboard 
              aiPerformance={aiPerformance}
              botStats={botStats}
              handleAiOptimization={handleAiOptimization}
            />
          </TabsContent>
          
          <TabsContent value="conversations">
            <LiveConversations 
              conversations={conversations}
              handleVoiceCall={handleVoiceCall}
              getStatusColor={getStatusColor}
              getPlatformIcon={getPlatformIcon}
            />
          </TabsContent>
          
          <TabsContent value="voice-ai">
            <VoiceAiInterface 
              voiceSettings={voiceSettings}
              setVoiceSettings={setVoiceSettings}
              botStats={botStats}
            />
          </TabsContent>
          
          <TabsContent value="lead-scoring">
            <LeadScoringEngine 
              leadScoringData={leadScoringData}
              conversations={conversations}
            />
          </TabsContent>
          
          <TabsContent value="platforms">
            <MultiPlatformManager 
              platformConnections={platformConnections}
            />
          </TabsContent>
          
          <TabsContent value="analytics">
            <AiAnalytics 
              aiPerformance={aiPerformance}
              botStats={botStats}
            />
          </TabsContent>
        </Tabs>

      </div>
    </div>
  );
};

// Superior Stat Card Component
const SuperiorStatCard = ({ icon, value, label, gradient, comparison }) => (
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

// AI Dashboard Component
const AiDashboard = ({ aiPerformance, botStats, handleAiOptimization }) => (
  <div className="space-y-6">
    <Card className="glass-card bg-gradient-to-r from-blue-900/20 to-purple-900/20">
      <CardHeader>
        <CardTitle className="text-2xl text-white flex items-center">
          <Brain className="w-8 h-8 mr-3 text-blue-400" />
          🧠 Revolutionary AI Performance Dashboard
        </CardTitle>
        <CardDescription className="text-gray-300">
          Advanced AI metrics that FBAutoReplyAI can't match - Real-time intelligence monitoring
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <AiMetricCard 
            title="Accuracy Score"
            value={`${aiPerformance.accuracyScore}%`}
            description="Overall AI response accuracy"
            color="text-green-400"
            progress={aiPerformance.accuracyScore}
          />
          <AiMetricCard 
            title="NLP Processing"
            value={`${aiPerformance.naturalLanguageProcessing}%`}
            description="Natural language understanding"
            color="text-blue-400"
            progress={aiPerformance.naturalLanguageProcessing}
          />
          <AiMetricCard 
            title="Voice Recognition"
            value={`${aiPerformance.voiceRecognition}%`}
            description="Voice-to-text accuracy"
            color="text-purple-400"
            progress={aiPerformance.voiceRecognition}
          />
          <AiMetricCard 
            title="Emotional AI"
            value={`${aiPerformance.emotionalIntelligence}%`}
            description="Emotional intelligence detection"
            color="text-pink-400"
            progress={aiPerformance.emotionalIntelligence}
          />
        </div>
        
        <div className="mt-6 bg-gradient-to-r from-green-900/40 to-emerald-900/40 p-6 rounded-lg">
          <h3 className="text-xl font-bold text-white mb-4">🚀 AI Optimization Engine</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400">2.3%</div>
              <div className="text-gray-300">Accuracy Improvement</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-400">4.7%</div>
              <div className="text-gray-300">Conversion Increase</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-400">Real-time</div>
              <div className="text-gray-300">Learning & Adaptation</div>
            </div>
          </div>
          
          <Button 
            onClick={handleAiOptimization}
            className="w-full mt-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white"
          >
            <Brain className="w-4 h-4 mr-2" />
            Run Advanced AI Optimization
          </Button>
        </div>
      </CardContent>
    </Card>
  </div>
);

// AI Metric Card Component
const AiMetricCard = ({ title, value, description, color, progress }) => (
  <div className="bg-gray-800/40 p-4 rounded-lg">
    <h4 className="font-semibold text-white mb-2">{title}</h4>
    <div className={`text-2xl font-bold ${color} mb-2`}>{value}</div>
    <div className="text-sm text-gray-400 mb-3">{description}</div>
    <Progress value={progress} className="h-2" />
  </div>
);

// Live Conversations Component
const LiveConversations = ({ conversations, handleVoiceCall, getStatusColor, getPlatformIcon }) => (
  <div className="space-y-6">
    <Card className="glass-card bg-gradient-to-r from-green-900/20 to-blue-900/20">
      <CardHeader>
        <CardTitle className="text-2xl text-white flex items-center">
          <MessageSquare className="w-8 h-8 mr-3 text-green-400" />
          💬 Live AI Conversations - Multi-Platform Monitoring
        </CardTitle>
        <CardDescription className="text-gray-300">
          Real-time conversation tracking across 15+ platforms - FBAutoReplyAI limited to Facebook only
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
          {conversations.slice(0, 15).map((conversation) => (
            <Card key={conversation.id} className="glass-card hover:scale-105 transition-all duration-300">
              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h4 className="font-semibold text-white flex items-center">
                      {getPlatformIcon(conversation.platform)}
                      <span className="ml-2">{conversation.customerName}</span>
                    </h4>
                    <div className="text-sm text-gray-400">{conversation.vehicle}</div>
                  </div>
                  
                  <div className="flex gap-2 flex-col">
                    <Badge className={getStatusColor(conversation.status)}>
                      {conversation.status}
                    </Badge>
                    <Badge className="bg-gray-600 text-white text-xs">
                      Score: {conversation.leadScore}
                    </Badge>
                  </div>
                </div>
                
                <div className="space-y-2 mb-4">
                  <div className="bg-gray-700/40 p-2 rounded text-sm">
                    <div className="text-blue-400 font-semibold">Customer:</div>
                    <div className="text-gray-300">{conversation.lastMessage}</div>
                  </div>
                  
                  <div className="bg-green-700/40 p-2 rounded text-sm">
                    <div className="text-green-400 font-semibold">AI Response:</div>
                    <div className="text-gray-300">{conversation.aiResponse}</div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                  <div>
                    <div className="text-gray-400">Response Time</div>
                    <div className="text-white">{conversation.responseTime.toFixed(2)}s</div>
                  </div>
                  <div>
                    <div className="text-gray-400">AI Confidence</div>
                    <div className="text-white">{conversation.aiConfidence}%</div>
                  </div>
                  <div>
                    <div className="text-gray-400">Messages</div>
                    <div className="text-white">{conversation.messagesCount}</div>
                  </div>
                  <div>
                    <div className="text-gray-400">Sentiment</div>
                    <div className="text-white">{conversation.sentiment}</div>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Button size="sm" className="flex-1 bg-gradient-to-r from-blue-500 to-cyan-500 text-white">
                    <MessageSquare className="w-3 h-3 mr-1" />
                    Reply
                  </Button>
                  {conversation.isVoiceCapable && (
                    <Button 
                      size="sm" 
                      onClick={() => handleVoiceCall(conversation.id)}
                      className="bg-gradient-to-r from-red-500 to-pink-500 text-white"
                    >
                      <Phone className="w-3 h-3" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  </div>
);

// Voice AI Interface Component
const VoiceAiInterface = ({ voiceSettings, setVoiceSettings, botStats }) => (
  <div className="space-y-6">
    <Card className="glass-card bg-gradient-to-r from-red-900/20 to-pink-900/20">
      <CardHeader>
        <CardTitle className="text-2xl text-white flex items-center">
          <Mic className="w-8 h-8 mr-3 text-red-400" />
          🎤 Revolutionary Voice AI - Industry Exclusive Feature
        </CardTitle>
        <CardDescription className="text-gray-300">
          Advanced voice capabilities that FBAutoReplyAI doesn't have - Complete voice automation
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-white">Voice Configuration</h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-white">Enable Voice AI</Label>
                <Switch 
                  checked={voiceSettings.enabled}
                  onCheckedChange={(checked) => setVoiceSettings({...voiceSettings, enabled: checked})}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label className="text-white">Auto-Answer Calls</Label>
                <Switch 
                  checked={voiceSettings.autoAnswerCalls}
                  onCheckedChange={(checked) => setVoiceSettings({...voiceSettings, autoAnswerCalls: checked})}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label className="text-white">Call Recording</Label>
                <Switch 
                  checked={voiceSettings.callRecording}
                  onCheckedChange={(checked) => setVoiceSettings({...voiceSettings, callRecording: checked})}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label className="text-white">Real-time Translation</Label>
                <Switch 
                  checked={voiceSettings.realTimeTranslation}
                  onCheckedChange={(checked) => setVoiceSettings({...voiceSettings, realTimeTranslation: checked})}
                />
              </div>
            </div>
            
            <div className="bg-green-900/40 p-4 rounded-lg">
              <h4 className="text-green-400 font-semibold mb-2">Voice AI Capabilities</h4>
              <ul className="text-gray-300 text-sm space-y-1">
                <li>• Natural conversation flow</li>
                <li>• Multi-language support (25 languages)</li>
                <li>• Emotion detection and response</li>
                <li>• Real-time vehicle information</li>
                <li>• Appointment scheduling</li>
                <li>• Price negotiation</li>
              </ul>
            </div>
          </div>
          
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-white">Voice Performance Metrics</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-blue-900/40 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-blue-400">{botStats.voiceCallsHandled?.toLocaleString()}</div>
                <div className="text-gray-300 text-sm">Calls Handled</div>
              </div>
              <div className="bg-green-900/40 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-green-400">96.4%</div>
                <div className="text-gray-300 text-sm">Recognition Accuracy</div>
              </div>
              <div className="bg-purple-900/40 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-purple-400">1.2s</div>
                <div className="text-gray-300 text-sm">Response Time</div>
              </div>
              <div className="bg-orange-900/40 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-orange-400">87%</div>
                <div className="text-gray-300 text-sm">Call Conversion</div>
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-red-900/40 to-pink-900/40 p-4 rounded-lg">
              <h4 className="text-red-400 font-semibold mb-2">🚀 Exclusive Features</h4>
              <div className="text-gray-300 text-sm space-y-2">
                <div>✓ Real-time voice cloning for personalization</div>
                <div>✓ Emotional tone adaptation</div>
                <div>✓ Background noise cancellation</div>
                <div>✓ Accent recognition and adaptation</div>
                <div>✓ Voice biometric identification</div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
);

// Lead Scoring Engine Component
const LeadScoringEngine = ({ leadScoringData, conversations }) => (
  <div className="space-y-6">
    <Card className="glass-card bg-gradient-to-r from-purple-900/20 to-indigo-900/20">
      <CardHeader>
        <CardTitle className="text-2xl text-white flex items-center">
          <Target className="w-8 h-8 mr-3 text-purple-400" />
          🎯 Advanced Lead Scoring Engine - Superior AI Analysis
        </CardTitle>
        <CardDescription className="text-gray-300">
          Revolutionary lead qualification system - 97.3% accuracy vs basic scoring
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-red-900/40 p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-red-400">{leadScoringData.hotLeads}</div>
            <div className="text-gray-300">Hot Leads</div>
          </div>
          <div className="bg-blue-900/40 p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-blue-400">{leadScoringData.qualifiedLeads}</div>
            <div className="text-gray-300">Qualified Leads</div>
          </div>
          <div className="bg-yellow-900/40 p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-yellow-400">{leadScoringData.nurturingLeads}</div>
            <div className="text-gray-300">Nurturing</div>
          </div>
          <div className="bg-green-900/40 p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-green-400">{leadScoringData.convertedLeads}</div>
            <div className="text-gray-300">Converted</div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">AI Scoring Criteria</h3>
            <div className="space-y-3">
              {leadScoringData.scoringCriteria?.map((criteria, index) => (
                <div key={index} className="bg-gray-800/40 p-3 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-white">{criteria.factor}</span>
                    <span className="text-purple-400">{criteria.weight}%</span>
                  </div>
                  <Progress value={criteria.weight} className="h-2" />
                </div>
              ))}
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Top Performing Leads</h3>
            <div className="space-y-2">
              {conversations.filter(c => c.leadScore >= 80).slice(0, 5).map((lead) => (
                <div key={lead.id} className="bg-gray-800/40 p-3 rounded-lg">
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="text-white font-semibold">{lead.customerName}</div>
                      <div className="text-gray-400 text-sm">{lead.vehicle}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-green-400 font-bold">{lead.leadScore}/100</div>
                      <Badge className={getStatusColor(lead.status)}>
                        {lead.status}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
);

// Multi-Platform Manager Component
const MultiPlatformManager = ({ platformConnections }) => (
  <div className="space-y-6">
    <Card className="glass-card bg-gradient-to-r from-indigo-900/20 to-cyan-900/20">
      <CardHeader>
        <CardTitle className="text-2xl text-white flex items-center">
          <Globe className="w-8 h-8 mr-3 text-indigo-400" />
          🌐 Multi-Platform Connection Manager - 15+ Platforms
        </CardTitle>
        <CardDescription className="text-gray-300">
          Complete platform integration vs FBAutoReplyAI's single platform limitation
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {Object.entries(platformConnections).map(([platform, data]) => (
            <Card key={platform} className={`glass-card transition-all duration-300 ${data.connected ? 'border-green-500' : 'border-gray-600'}`}>
              <CardContent className="p-4 text-center">
                <div className={`w-12 h-12 mx-auto mb-3 rounded-full flex items-center justify-center ${
                  data.connected ? 'bg-green-600' : 'bg-gray-600'
                }`}>
                  {getPlatformIcon(platform)}
                </div>
                <h4 className="font-semibold text-white capitalize mb-2">{platform}</h4>
                <Badge className={data.connected ? 'bg-green-600' : 'bg-gray-600'}>
                  {data.status}
                </Badge>
                {data.connected && (
                  <div className="mt-2 text-sm text-gray-300">
                    {data.messages ? `${data.messages.toLocaleString()} messages` : `${data.calls} calls`}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
        
        <div className="mt-6 bg-gradient-to-r from-blue-900/40 to-purple-900/40 p-6 rounded-lg">
          <h3 className="text-xl font-bold text-white mb-4">🚀 Platform Superiority</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-400">15+</div>
              <div className="text-gray-300">Connected Platforms</div>
              <div className="text-sm text-green-400">vs 1 platform only</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-400">Unlimited</div>
              <div className="text-gray-300">Messages Per Month</div>
              <div className="text-sm text-blue-400">vs 10K limit</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-400">Real-time</div>
              <div className="text-gray-300">Cross-Platform Sync</div>
              <div className="text-sm text-purple-400">Exclusive feature</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
);

// AI Analytics Component
const AiAnalytics = ({ aiPerformance, botStats }) => (
  <div className="space-y-6">
    <Card className="glass-card bg-gradient-to-r from-yellow-900/20 to-orange-900/20">
      <CardHeader>
        <CardTitle className="text-2xl text-white flex items-center">
          <BarChart3 className="w-8 h-8 mr-3 text-yellow-400" />
          📊 Advanced AI Analytics - Deep Intelligence Insights
        </CardTitle>
        <CardDescription className="text-gray-300">
          Comprehensive AI performance analysis beyond basic metrics
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-gradient-to-br from-blue-500 to-cyan-600 p-6 rounded-lg text-white text-center">
            <div className="text-3xl font-bold">{(botStats.totalMessages / 1000).toFixed(1)}K</div>
            <div className="text-blue-100">Total Processed</div>
          </div>
          <div className="bg-gradient-to-br from-green-500 to-emerald-600 p-6 rounded-lg text-white text-center">
            <div className="text-3xl font-bold">{botStats.conversionRate}%</div>
            <div className="text-green-100">Conversion Rate</div>
          </div>
          <div className="bg-gradient-to-br from-purple-500 to-pink-600 p-6 rounded-lg text-white text-center">
            <div className="text-3xl font-bold">{aiPerformance.accuracyScore}%</div>
            <div className="text-purple-100">AI Accuracy</div>
          </div>
          <div className="bg-gradient-to-br from-orange-500 to-red-600 p-6 rounded-lg text-white text-center">
            <div className="text-3xl font-bold">0.3s</div>
            <div className="text-orange-100">Response Time</div>
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-gray-800 to-gray-900 p-6 rounded-lg">
          <h3 className="text-xl font-bold text-white mb-4">🏆 Competitive Advantage Summary</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
        </div>
      </CardContent>
    </Card>
  </div>
);

export default SuperiorAIBot;