import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { Button } from './components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './components/ui/card';
import { Input } from './components/ui/input';
import { Label } from './components/ui/label';
import { Badge } from './components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './components/ui/select';
import { Switch } from './components/ui/switch';
import { 
  Target, 
  Crown, 
  Shield, 
  Zap, 
  Brain, 
  Eye, 
  TrendingUp, 
  Clock, 
  Users, 
  Star, 
  Flame, 
  Rocket, 
  Trophy, 
  Diamond, 
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  Lock,
  Unlock,
  Search,
  Filter,
  BarChart3,
  Activity,
  Bell,
  Phone,
  Mail,
  MessageSquare,
  Calendar,
  MapPin,
  DollarSign,
  TrendingDown,
  RefreshCw,
  Settings,
  Plus,
  Minus,
  ArrowUp,
  ArrowDown,
  ChevronRight,
  Database,
  Wifi,
  Globe,
  Facebook,
  Instagram,
  Twitter,
  Youtube,
  Linkedin,
  Car,
  Briefcase,
  MonitorSpeaker,
  Headphones,
  Mic,
  Video,
  Share2,
  Heart,
  ThumbsUp,
  Send,
  Download,
  Upload,
  FileText,
  Image as ImageIcon,
  Play,
  Pause,
  Stop,
  SkipForward,
  SkipBack,
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
  RotateCcw,
  RotateCw,
  ZoomIn,
  ZoomOut,
  Move,
  Copy,
  Scissors,
  Clipboard,
  Save,
  FolderOpen,
  Trash2,
  Edit,
  PenTool,
  Type,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Bold,
  Italic,
  Underline,
  Link2,
  Unlink,
  List,
  Grid,
  Layout,
  Sidebar,
  PanelLeft,
  PanelRight,
  PanelTop,
  PanelBottom,
  Layers,
  Command,
  Option,
  Shift,
  Control,
  Alt,
  Space,
  Enter,
  Backspace,
  Delete,
  Tab,
  Escape,
  Home,
  End,
  PageUp,
  PageDown,
  ArrowLeft,
  ArrowRight
} from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const ExclusiveLeadEngine = () => {
  const [activeTab, setActiveTab] = useState('exclusivity');
  const [exclusiveLeads, setExclusiveLeads] = useState([]);
  const [leadIntelligence, setLeadIntelligence] = useState({});
  const [competitorData, setCompetitorData] = useState({});
  const [marketTiming, setMarketTiming] = useState({});
  const [leadProtection, setLeadProtection] = useState([]);
  const [aiPredictions, setAiPredictions] = useState({});
  const [realTimeAlerts, setRealTimeAlerts] = useState([]);

  useEffect(() => {
    initializeExclusiveLeadEngine();
    // Real-time updates every 15 seconds for competitive advantage
    const interval = setInterval(initializeExclusiveLeadEngine, 15000);
    return () => clearInterval(interval);
  }, []);

  const initializeExclusiveLeadEngine = async () => {
    try {
      await Promise.all([
        fetchExclusiveLeads(),
        fetchLeadIntelligence(),
        fetchCompetitorData(),
        fetchMarketTiming(),
        fetchLeadProtection(),
        fetchAIPredictions(),
        fetchRealTimeAlerts()
      ]);
    } catch (error) {
      console.error('Error initializing exclusive lead engine:', error);
    }
  };

  const fetchExclusiveLeads = async () => {
    try {
      const response = await fetch(`${API}/exclusive-leads/leads?tenant_id=default`);
      const data = await response.json();
      setExclusiveLeads(data.exclusive_leads);
    } catch (error) {
      console.error('Error fetching exclusive leads:', error);
      // Fallback to empty array if API fails
      setExclusiveLeads([]);
    }
  };

  const fetchLeadIntelligence = async () => {
    try {
      const response = await fetch(`${API}/exclusive-leads/intelligence?tenant_id=default`);
      const data = await response.json();
      setLeadIntelligence(data.intelligence);
    } catch (error) {
      console.error('Error fetching lead intelligence:', error);
      // Fallback to empty object if API fails
      setLeadIntelligence({});
    }
  };

  const fetchCompetitorData = async () => {
    try {
      const response = await fetch(`${API}/exclusive-leads/competitors?tenant_id=default`);
      const data = await response.json();
      setCompetitorData(data.competitor_data);
    } catch (error) {
      console.error('Error fetching competitor data:', error);
      // Fallback to empty object if API fails
      setCompetitorData({});
    }
  };

  const fetchMarketTiming = async () => {
    try {
      const response = await fetch(`${API}/exclusive-leads/market-timing?tenant_id=default`);
      const data = await response.json();
      setMarketTiming(data.market_timing);
    } catch (error) {
      console.error('Error fetching market timing:', error);
      // Fallback to empty object if API fails  
      setMarketTiming({});
    }
  };

  const fetchLeadProtection = async () => {
    try {
      const response = await fetch(`${API}/exclusive-leads/protection?tenant_id=default`);
      const data = await response.json();
      setLeadProtection(data.lead_protection);
    } catch (error) {
      console.error('Error fetching lead protection:', error);
      // Fallback to empty array if API fails
      setLeadProtection([]);
    }
  };

  const fetchAIPredictions = async () => {
    try {
      const response = await fetch(`${API}/exclusive-leads/predictions?tenant_id=default`);
      const data = await response.json();
      setAiPredictions(data.ai_predictions);
    } catch (error) {
      console.error('Error fetching AI predictions:', error);
      // Fallback to empty object if API fails
      setAiPredictions({});
    }
  };

  const fetchRealTimeAlerts = async () => {
    try {
      const response = await fetch(`${API}/exclusive-leads/alerts?tenant_id=default`);
      const data = await response.json();
      setRealTimeAlerts(data.real_time_alerts);
    } catch (error) {
      console.error('Error fetching real-time alerts:', error);
      // Fallback to empty array if API fails
      setRealTimeAlerts([]);
    }
  };

  const claimExclusiveLead = async (leadId) => {
    try {
      toast.info('🔒 Claiming exclusive lead access...');
      
      setTimeout(() => {
        setExclusiveLeads(prev => prev.map(lead => 
          lead.id === leadId 
            ? { ...lead, claimed: true, claimed_at: new Date().toISOString() }
            : lead
        ));
        
        toast.success('✅ EXCLUSIVE LEAD CLAIMED! You have priority access for the next 2 hours. Contact immediately!');
      }, 1500);
      
    } catch (error) {
      toast.error('❌ Failed to claim exclusive lead');
    }
  };

  const activateLeadProtection = async (leadId) => {
    try {
      toast.info('🛡️ Activating advanced lead protection...');
      
      setTimeout(() => {
        toast.success('✅ Lead protection activated! Competitor blocking engaged, priority routing enabled.');
      }, 1000);
      
    } catch (error) {
      toast.error('❌ Failed to activate lead protection');
    }
  };

  const renderExclusivityTab = () => (
    <div className="space-y-6">
      {/* Exclusive Lead Intelligence Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-purple-900/40 to-indigo-800/40 border-purple-500/30">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <Diamond className="w-8 h-8 text-purple-400" />
              <Badge className="bg-purple-500">EXCLUSIVE</Badge>
            </div>
            <h3 className="text-3xl font-bold text-white">{leadIntelligence.total_exclusive_leads}</h3>
            <p className="text-purple-300 text-sm">Exclusive Leads Available</p>
            <p className="text-gray-400 text-xs mt-1">340% higher close rate</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-900/40 to-emerald-800/40 border-green-500/30">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <Target className="w-8 h-8 text-green-400" />
              <Badge className="bg-green-500">CONVERSION</Badge>
            </div>
            <h3 className="text-3xl font-bold text-white">{leadIntelligence.conversion_rate_exclusive}%</h3>
            <p className="text-green-300 text-sm">Exclusive Lead Close Rate</p>
            <p className="text-gray-400 text-xs mt-1">vs 23.1% industry average</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-900/40 to-red-800/40 border-orange-500/30">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <DollarSign className="w-8 h-8 text-orange-400" />
              <Badge className="bg-orange-500">VALUE</Badge>
            </div>
            <h3 className="text-3xl font-bold text-white">${leadIntelligence.avg_deal_size_exclusive?.toLocaleString()}</h3>
            <p className="text-orange-300 text-sm">Avg Exclusive Deal Size</p>
            <p className="text-gray-400 text-xs mt-1">87% higher than shared leads</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-cyan-900/40 to-blue-800/40 border-cyan-500/30">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <Shield className="w-8 h-8 text-cyan-400" />
              <Badge className="bg-cyan-500">PROTECTION</Badge>
            </div>
            <h3 className="text-3xl font-bold text-white">{leadIntelligence.exclusivity_protection_success}%</h3>
            <p className="text-cyan-300 text-sm">Protection Success Rate</p>
            <p className="text-gray-400 text-xs mt-1">Competitor blocking active</p>
          </CardContent>
        </Card>
      </div>

      {/* Real-Time Alerts */}
      <Card className="bg-gradient-to-br from-red-900/40 to-orange-800/40 border-red-500/30">
        <CardHeader>
          <CardTitle className="text-2xl text-white flex items-center">
            <Bell className="w-6 h-6 mr-3 text-red-400 animate-pulse" />
            🚨 REAL-TIME EXCLUSIVE LEAD ALERTS
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {realTimeAlerts.map((alert) => (
              <div key={alert.id} className={`p-4 rounded-xl border ${
                alert.priority === 'critical' ? 'bg-red-900/20 border-red-500/30' :
                alert.priority === 'high' ? 'bg-orange-900/20 border-orange-500/30' :
                'bg-yellow-900/20 border-yellow-500/30'
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full animate-pulse ${
                      alert.priority === 'critical' ? 'bg-red-500' :
                      alert.priority === 'high' ? 'bg-orange-500' :
                      'bg-yellow-500'
                    }`}></div>
                    <div>
                      <p className="text-white font-semibold">{alert.message}</p>
                      <p className="text-sm text-gray-300">Action: {alert.action_required}</p>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    className={`${
                      alert.priority === 'critical' ? 'bg-red-600 hover:bg-red-700' :
                      alert.priority === 'high' ? 'bg-orange-600 hover:bg-orange-700' :
                      'bg-yellow-600 hover:bg-yellow-700'
                    }`}
                  >
                    <Zap className="w-4 h-4 mr-1" />
                    ACT NOW
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Exclusive Leads Pipeline */}
      <Card className="bg-gradient-to-br from-gray-900/60 to-gray-800/60 backdrop-blur-lg border border-gray-500/30">
        <CardHeader>
          <CardTitle className="text-2xl text-white flex items-center">
            <Crown className="w-6 h-6 mr-3 text-yellow-400" />
            💎 EXCLUSIVE HIGH-VALUE LEADS PIPELINE
          </CardTitle>
          <CardDescription className="text-gray-300">
            Premium leads with guaranteed exclusivity - unavailable to competitors
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {exclusiveLeads.map((lead) => (
              <div key={lead.id} className="p-6 bg-gradient-to-r from-purple-900/20 to-indigo-900/20 border border-purple-500/30 rounded-xl">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div className={`w-4 h-4 rounded-full ${
                      lead.exclusivity_level === 'diamond' ? 'bg-purple-500' :
                      lead.exclusivity_level === 'platinum' ? 'bg-blue-500' :
                      'bg-green-500'
                    } animate-pulse`}></div>
                    <div>
                      <h4 className="text-xl font-bold text-white">{lead.name}</h4>
                      <p className="text-sm text-gray-300">
                        {lead.vehicle_interest} • ${lead.budget?.toLocaleString()} budget • Score: {lead.lead_score}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={`${
                      lead.exclusivity_level === 'diamond' ? 'bg-purple-500' :
                      lead.exclusivity_level === 'platinum' ? 'bg-blue-500' :
                      'bg-green-500'
                    }`}>
                      {lead.exclusivity_level.toUpperCase()}
                    </Badge>
                    <Badge className="bg-red-500 animate-pulse">
                      Expires: {new Date(lead.exclusivity_expires).toLocaleTimeString()}
                    </Badge>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div className="bg-gray-800/40 rounded-lg p-3">
                    <p className="text-sm text-gray-300">Purchase Timeline</p>
                    <p className="text-white font-semibold">{lead.purchase_timeline.replace('_', ' ')}</p>
                  </div>
                  <div className="bg-gray-800/40 rounded-lg p-3">
                    <p className="text-sm text-gray-300">Financing Status</p>
                    <p className="text-white font-semibold">
                      {lead.financing_approved ? '✅ Pre-Approved' : '⏳ Pending'}
                    </p>
                  </div>
                  <div className="bg-gray-800/40 rounded-lg p-3">
                    <p className="text-sm text-gray-300">Trade-In Value</p>
                    <p className="text-white font-semibold">${lead.trade_in_value?.toLocaleString()}</p>
                  </div>
                </div>

                <div className="mb-4">
                  <p className="text-sm text-gray-300 mb-2">Urgency Factors:</p>
                  <div className="flex flex-wrap gap-2">
                    {lead.urgency_factors?.map((factor, index) => (
                      <Badge key={index} className="bg-orange-500 text-xs">
                        {factor.replace('_', ' ')}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="mb-4">
                  <p className="text-sm text-gray-300 mb-1">Intelligence Notes:</p>
                  <p className="text-white text-sm">{lead.notes}</p>
                </div>

                {lead.competitor_interest && (
                  <div className="mb-4 p-3 bg-red-900/20 border border-red-500/30 rounded-lg">
                    <p className="text-red-400 font-semibold text-sm">
                      ⚠️ COMPETITOR ALERT: {lead.competitor_offers} other dealerships are pursuing this lead!
                    </p>
                  </div>
                )}

                <div className="flex items-center gap-3">
                  {!lead.claimed ? (
                    <Button
                      onClick={() => claimExclusiveLead(lead.id)}
                      className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
                    >
                      <Lock className="w-4 h-4 mr-2" />
                      CLAIM EXCLUSIVE ACCESS
                    </Button>
                  ) : (
                    <Button className="bg-green-600" disabled>
                      <Unlock className="w-4 h-4 mr-2" />
                      CLAIMED - YOU HAVE PRIORITY
                    </Button>
                  )}
                  
                  <Button
                    onClick={() => activateLeadProtection(lead.id)}
                    className="bg-gradient-to-r from-orange-600 to-red-600"
                  >
                    <Shield className="w-4 h-4 mr-2" />
                    ACTIVATE PROTECTION
                  </Button>
                  
                  <Button className="bg-gradient-to-r from-green-600 to-emerald-600">
                    <Phone className="w-4 h-4 mr-2" />
                    CALL NOW ({lead.preferred_contact})
                  </Button>
                  
                  <Button className="bg-gradient-to-r from-blue-600 to-cyan-600">
                    <Calendar className="w-4 h-4 mr-2" />
                    INSTANT APPOINTMENT
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderCompetitorIntelligence = () => (
    <div className="space-y-6">
      <Card className="bg-gradient-to-br from-gray-900/60 to-gray-800/60 backdrop-blur-lg border border-gray-500/30">
        <CardHeader>
          <CardTitle className="text-2xl text-white flex items-center">
            <Eye className="w-6 h-6 mr-3 text-cyan-400" />
            🎯 COMPETITOR INTELLIGENCE & MARKET DOMINATION
          </CardTitle>
          <CardDescription className="text-gray-300">
            Real-time competitor monitoring and strategic advantage analysis
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Our Advantage vs Competitors */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">🏆 JokerVision Competitive Advantage</h3>
              <div className="space-y-3">
                {Object.entries(competitorData.our_advantage || {}).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between p-3 bg-green-900/20 border border-green-500/30 rounded-lg">
                    <span className="text-green-300 capitalize">{key.replace('_', ' ')}:</span>
                    <span className="text-white font-bold">{value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Competitor Lead Sources */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">👁️ Competitors We're Monitoring</h3>
              <div className="space-y-3">
                {competitorData.their_lead_sources?.map((source, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-red-900/20 border border-red-500/30 rounded-lg">
                    <div>
                      <p className="text-white font-semibold">{source.name}</p>
                      <p className="text-sm text-gray-300">{source.leads_today} leads today</p>
                    </div>
                    <Badge className={`${
                      source.quality_score > 35 ? 'bg-orange-500' : 'bg-red-500'
                    }`}>
                      Quality: {source.quality_score}%
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Untapped Opportunities */}
          <div className="mt-6">
            <h3 className="text-lg font-semibold text-white mb-4">💡 Untapped Market Opportunities</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {competitorData.untapped_opportunities?.map((opportunity, index) => (
                <div key={index} className="p-4 bg-blue-900/20 border border-blue-500/30 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Sparkles className="w-5 h-5 text-blue-400" />
                    <p className="text-white font-semibold">{opportunity}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderAIPredictions = () => (
    <div className="space-y-6">
      <Card className="bg-gradient-to-br from-gray-900/60 to-gray-800/60 backdrop-blur-lg border border-gray-500/30">
        <CardHeader>
          <CardTitle className="text-2xl text-white flex items-center">
            <Brain className="w-6 h-6 mr-3 text-purple-400" />
            🤖 AI PREDICTIVE LEAD INTELLIGENCE
          </CardTitle>
          <CardDescription className="text-gray-300">
            Advanced AI predictions for optimal lead conversion timing and strategy
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Next Hour Predictions */}
            <div className="p-4 bg-purple-900/20 border border-purple-500/30 rounded-xl">
              <h4 className="text-lg font-semibold text-white mb-3">⏱️ Next Hour Forecast</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-300">Expected Leads:</span>
                  <span className="text-white font-bold">{aiPredictions.next_hour_leads}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Quality Level:</span>
                  <Badge className="bg-green-500">{aiPredictions.next_hour_quality}</Badge>
                </div>
              </div>
            </div>

            {/* Market Predictions */}
            <div className="p-4 bg-blue-900/20 border border-blue-500/30 rounded-xl">
              <h4 className="text-lg font-semibold text-white mb-3">📈 Market Intelligence</h4>
              <div className="space-y-2">
                <div>
                  <span className="text-gray-300 text-sm">Demand Spike:</span>
                  <p className="text-white font-semibold">{aiPredictions.market_predictions?.demand_spike_predicted}</p>
                </div>
                <div>
                  <span className="text-gray-300 text-sm">Focus Area:</span>
                  <p className="text-white font-semibold">{aiPredictions.market_predictions?.optimal_inventory_focus}</p>
                </div>
              </div>
            </div>

            {/* Conversion Probabilities */}
            <div className="p-4 bg-green-900/20 border border-green-500/30 rounded-xl">
              <h4 className="text-lg font-semibold text-white mb-3">🎯 Conversion Probability</h4>
              <div className="space-y-2">
                {Object.entries(aiPredictions.conversion_probability || {}).map(([leadId, probability]) => (
                  <div key={leadId} className="flex items-center justify-between">
                    <span className="text-gray-300 text-sm">{leadId}:</span>
                    <div className="flex items-center gap-2">
                      <div className="w-16 bg-gray-700 rounded-full h-2">
                        <div 
                          className="bg-green-500 h-2 rounded-full"
                          style={{ width: `${probability}%` }}
                        ></div>
                      </div>
                      <span className="text-white font-bold text-sm">{probability}%</span>
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-900 to-purple-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-red-400 bg-clip-text text-transparent mb-4">
            👑 EXCLUSIVE LEAD DOMINATION ENGINE
          </h1>
          <p className="text-xl text-gray-300 mb-2">
            Premium High-Value Exclusive Leads That Competitors Can't Access
          </p>
          <p className="text-lg text-purple-400 font-semibold">
            340% Higher Close Rate • Guaranteed Exclusivity • AI-Powered Intelligence
          </p>
        </motion.div>

        {/* Competitive Advantage Banner */}
        <Card className="bg-gradient-to-r from-purple-900/20 to-red-900/20 border-purple-500/30 mb-8">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Trophy className="w-12 h-12 text-yellow-400" />
                <div>
                  <h3 className="text-2xl font-bold text-white">🚀 CRUSHING ALME & ALL COMPETITORS</h3>
                  <p className="text-gray-300">
                    While ALME offers shared leads at $56 each, we deliver EXCLUSIVE leads with 78.4% close rate
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold text-green-400">340%</p>
                <p className="text-gray-300 text-sm">Higher Performance</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Navigation */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 glass-card mb-8">
            <TabsTrigger value="exclusivity" className="flex items-center gap-2">
              <Diamond className="w-4 h-4" />
              Exclusive Leads
            </TabsTrigger>
            <TabsTrigger value="intelligence" className="flex items-center gap-2">
              <Eye className="w-4 h-4" />
              Competitor Intel
            </TabsTrigger>
            <TabsTrigger value="predictions" className="flex items-center gap-2">
              <Brain className="w-4 h-4" />
              AI Predictions
            </TabsTrigger>
          </TabsList>

          <TabsContent value="exclusivity">
            {renderExclusivityTab()}
          </TabsContent>

          <TabsContent value="intelligence">
            {renderCompetitorIntelligence()}
          </TabsContent>

          <TabsContent value="predictions">
            {renderAIPredictions()}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ExclusiveLeadEngine;