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
import { Checkbox } from './components/ui/checkbox';
import { Switch } from './components/ui/switch';
import { Textarea } from './components/ui/textarea';
import { 
  Target, 
  Phone, 
  Mail, 
  MessageSquare, 
  Calendar, 
  Clock, 
  TrendingUp, 
  Users, 
  Zap, 
  CheckCircle2, 
  AlertTriangle, 
  RefreshCw,
  Plus,
  Eye,
  Edit,
  Trash2,
  Filter,
  Search,
  Send,
  Bell,
  Star,
  Heart,
  ThumbsUp,
  MapPin,
  Car,
  DollarSign,
  BarChart3,
  Activity,
  Smartphone,
  Globe,
  Facebook,
  Instagram,
  Twitter,
  Youtube,
  Linkedin,
  PlayCircle,
  Camera,
  Mic,
  HeadphonesIcon,
  PhoneCall,
  Video,
  MessageCircle,
  Settings,
  Timer,
  CalendarCheck,
  UserCheck,
  Briefcase,
  Trophy,
  Flame,
  Lightning,
  Rocket,
  ArrowRight,
  TrendingDown,
  Database,
  Wifi,
  Link2
} from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const LeadGenerationHub = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [leads, setLeads] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [followUpQueue, setFollowUpQueue] = useState([]);
  const [dailyMetrics, setDailyMetrics] = useState({});
  const [leadSources, setLeadSources] = useState([]);
  const [automationRules, setAutomationRules] = useState([]);
  const [selectedLead, setSelectedLead] = useState(null);
  const [showAppointmentModal, setShowAppointmentModal] = useState(false);

  useEffect(() => {
    initializeLeadGenerationHub();
    // Refresh data every 30 seconds for real-time updates
    const interval = setInterval(initializeLeadGenerationHub, 30000);
    return () => clearInterval(interval);
  }, []);

  const initializeLeadGenerationHub = async () => {
    try {
      await Promise.all([
        fetchTodaysLeads(),
        fetchTodaysAppointments(), 
        fetchFollowUpQueue(),
        fetchDailyMetrics(),
        fetchLeadSources(),
        fetchAutomationRules()
      ]);
    } catch (error) {
      console.error('Error initializing lead generation hub:', error);
    }
  };

  const fetchTodaysLeads = async () => {
    // Mock comprehensive lead data with multiple channels
    const mockLeads = [
      {
        id: 'lead_001',
        name: 'Sarah Martinez',
        phone: '+1 (555) 234-5678',
        email: 'sarah.martinez@email.com',
        source: 'facebook_marketplace',
        vehicle_interest: '2024 Toyota RAV4',
        status: 'new',
        created_at: new Date(Date.now() - 300000).toISOString(), // 5 minutes ago
        lead_score: 92,
        budget: 45000,
        timeline: 'this_week',
        last_contact: null,
        appointment_set: false,
        follow_up_count: 0,
        urgency: 'high',
        notes: 'Very interested in hybrid models, mentioned trade-in'
      },
      {
        id: 'lead_002', 
        name: 'Michael Chen',
        phone: '+1 (555) 876-5432',
        email: 'mchen.auto@gmail.com',
        source: 'website_form',
        vehicle_interest: '2023 Honda Accord Sport',
        status: 'contacted',
        created_at: new Date(Date.now() - 1200000).toISOString(), // 20 minutes ago
        lead_score: 87,
        budget: 35000,
        timeline: 'within_month',
        last_contact: new Date(Date.now() - 300000).toISOString(),
        appointment_set: false,
        follow_up_count: 1,
        urgency: 'medium',
        notes: 'First-time buyer, needs financing information'
      },
      {
        id: 'lead_003',
        name: 'Jennifer Williams', 
        phone: '+1 (555) 345-6789',
        email: 'j.williams.car@yahoo.com',
        source: 'google_ads',
        vehicle_interest: '2024 Ford F-150 Lariat',
        status: 'follow_up_scheduled',
        created_at: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
        lead_score: 94,
        budget: 65000,
        timeline: 'this_week',
        last_contact: new Date(Date.now() - 1800000).toISOString(),
        appointment_set: true,
        appointment_time: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
        follow_up_count: 2,
        urgency: 'high',
        notes: 'Cash buyer, very serious, wants extended warranty'
      },
      {
        id: 'lead_004',
        name: 'Robert Johnson',
        phone: '+1 (555) 987-1234', 
        email: 'rob.johnson.trucks@gmail.com',
        source: 'instagram_dm',
        vehicle_interest: '2023 Chevrolet Silverado',
        status: 'new',
        created_at: new Date(Date.now() - 600000).toISOString(), // 10 minutes ago
        lead_score: 78,
        budget: 48000,
        timeline: 'within_month',
        last_contact: null,
        appointment_set: false,
        follow_up_count: 0,
        urgency: 'medium',
        notes: 'Work truck needed, interested in towing capacity'
      }
    ];
    
    setLeads(mockLeads);
  };

  const fetchTodaysAppointments = async () => {
    const mockAppointments = [
      {
        id: 'apt_001',
        lead_id: 'lead_003',
        customer_name: 'Jennifer Williams',
        phone: '+1 (555) 345-6789',
        vehicle_interest: '2024 Ford F-150 Lariat',
        appointment_time: '2024-01-10T10:00:00Z',
        status: 'confirmed',
        type: 'test_drive',
        sales_rep: 'current_user',
        notes: 'Bring financing options and warranty information'
      },
      {
        id: 'apt_002',
        lead_id: 'lead_005',
        customer_name: 'David Rodriguez',
        phone: '+1 (555) 432-8765',
        vehicle_interest: '2023 BMW X3',
        appointment_time: '2024-01-10T14:30:00Z', 
        status: 'confirmed',
        type: 'vehicle_viewing',
        sales_rep: 'current_user',
        notes: 'Luxury features demonstration requested'
      },
      {
        id: 'apt_003',
        lead_id: 'lead_006',
        customer_name: 'Lisa Thompson',
        phone: '+1 (555) 654-9876',
        vehicle_interest: '2024 Toyota Camry Hybrid',
        appointment_time: '2024-01-10T16:00:00Z',
        status: 'pending_confirmation',
        type: 'consultation',
        sales_rep: 'current_user',
        notes: 'First-time hybrid buyer, needs education on benefits'
      }
    ];
    
    setAppointments(mockAppointments);
  };

  const fetchFollowUpQueue = async () => {
    const mockFollowUps = [
      {
        id: 'followup_001',
        lead_id: 'lead_002',
        customer_name: 'Michael Chen',
        phone: '+1 (555) 876-5432',
        action_type: 'phone_call',
        scheduled_time: new Date(Date.now() + 1800000).toISOString(), // 30 minutes
        priority: 'high',
        message_template: 'Follow up on Honda Accord inquiry - financing options ready'
      },
      {
        id: 'followup_002', 
        lead_id: 'lead_007',
        customer_name: 'Amanda Davis',
        phone: '+1 (555) 789-0123',
        action_type: 'sms',
        scheduled_time: new Date(Date.now() + 900000).toISOString(), // 15 minutes
        priority: 'medium',
        message_template: 'Hi Amanda! Following up on your Subaru interest. Great financing deals available today!'
      }
    ];
    
    setFollowUpQueue(mockFollowUps);
  };

  const fetchDailyMetrics = async () => {
    const mockMetrics = {
      // Today's Performance vs 10 Appointment Goal
      appointments_today: 7, // Current count
      appointments_goal: 10,
      appointments_remaining: 3,
      
      // Lead Generation Performance  
      leads_today: 24,
      leads_yesterday: 18,
      leads_this_week: 127,
      
      // Conversion Metrics
      lead_to_appointment_rate: 29.2, // 7/24 = 29.2%
      appointment_show_rate: 85.7,
      appointment_to_sale_rate: 42.1,
      
      // Source Performance
      best_performing_source: 'facebook_marketplace',
      worst_performing_source: 'cold_calls',
      
      // Follow-up Performance
      follow_ups_completed: 31,
      follow_ups_pending: 12,
      avg_response_time: '4.2 minutes',
      
      // Weekly Goals
      weekly_appointment_goal: 50,
      weekly_appointments_current: 34,
      
      // Performance Trends
      appointments_trend: '+14%',
      conversion_trend: '+8%'
    };
    
    setDailyMetrics(mockMetrics);
  };

  const fetchLeadSources = async () => {
    const mockSources = [
      {
        id: 'facebook_marketplace',
        name: 'Facebook Marketplace',
        icon: 'Facebook',
        leads_today: 8,
        conversion_rate: 34.5,
        avg_lead_score: 89,
        status: 'active',
        cost_per_lead: 12.50
      },
      {
        id: 'website_form',
        name: 'Website Contact Form', 
        icon: 'Globe',
        leads_today: 6,
        conversion_rate: 28.2,
        avg_lead_score: 76,
        status: 'active',
        cost_per_lead: 8.75
      },
      {
        id: 'google_ads',
        name: 'Google Ads',
        icon: 'Target',
        leads_today: 4,
        conversion_rate: 41.3,
        avg_lead_score: 92,
        status: 'active', 
        cost_per_lead: 24.30
      },
      {
        id: 'instagram_dm',
        name: 'Instagram Direct Messages',
        icon: 'Instagram',
        leads_today: 3,
        conversion_rate: 22.1,
        avg_lead_score: 68,
        status: 'active',
        cost_per_lead: 6.45
      },
      {
        id: 'referrals',
        name: 'Customer Referrals',
        icon: 'Users',
        leads_today: 2,
        conversion_rate: 67.8,
        avg_lead_score: 95,
        status: 'active',
        cost_per_lead: 0.00
      },
      {
        id: 'phone_calls',
        name: 'Inbound Phone Calls',
        icon: 'Phone',
        leads_today: 1,
        conversion_rate: 52.4,
        avg_lead_score: 88,
        status: 'active',
        cost_per_lead: 5.20
      }
    ];
    
    setLeadSources(mockSources);
  };

  const fetchAutomationRules = async () => {
    const mockRules = [
      {
        id: 'auto_001',
        name: '5-Minute Response Rule',
        description: 'Automatically send SMS + Email within 5 minutes of new lead',
        trigger: 'new_lead',
        actions: ['send_sms', 'send_email', 'create_follow_up_task'],
        status: 'active',
        success_rate: 94.2
      },
      {
        id: 'auto_002', 
        name: 'High-Value Lead Alert',
        description: 'Instant notification for leads with budget >$50K',
        trigger: 'high_value_lead',
        actions: ['priority_notification', 'assign_senior_rep', 'schedule_immediate_call'],
        status: 'active',
        success_rate: 87.8
      },
      {
        id: 'auto_003',
        name: 'Appointment Reminder Sequence',
        description: '24hr, 2hr, and 30min appointment reminders',
        trigger: 'appointment_scheduled',
        actions: ['send_confirmation_sms', 'send_reminder_24hr', 'send_reminder_2hr', 'send_final_reminder'],
        status: 'active',
        success_rate: 91.5
      }
    ];
    
    setAutomationRules(mockRules);
  };

  const contactLead = async (leadId, method) => {
    try {
      toast.info(`📞 Initiating ${method} contact with lead...`);
      
      // Simulate contact attempt
      setTimeout(() => {
        setLeads(prevLeads => prevLeads.map(lead => 
          lead.id === leadId 
            ? { 
                ...lead, 
                status: 'contacted',
                last_contact: new Date().toISOString(),
                follow_up_count: lead.follow_up_count + 1
              }
            : lead
        ));
        
        toast.success(`✅ ${method} contact completed! Follow-up scheduled.`);
      }, 1500);
      
    } catch (error) {
      toast.error(`❌ Failed to contact lead via ${method}`);
    }
  };

  const scheduleAppointment = async (leadId, appointmentData) => {
    try {
      const newAppointment = {
        id: `apt_${Date.now()}`,
        lead_id: leadId,
        ...appointmentData,
        status: 'confirmed',
        sales_rep: 'current_user'
      };
      
      setAppointments(prev => [...prev, newAppointment]);
      
      // Update lead status
      setLeads(prevLeads => prevLeads.map(lead => 
        lead.id === leadId 
          ? { ...lead, appointment_set: true, status: 'appointment_scheduled' }
          : lead
      ));
      
      // Update daily metrics
      setDailyMetrics(prev => ({
        ...prev,
        appointments_today: prev.appointments_today + 1,
        appointments_remaining: Math.max(0, prev.appointments_remaining - 1)
      }));
      
      toast.success('🎯 Appointment scheduled successfully! 1 step closer to your 10 daily appointments goal!');
      setShowAppointmentModal(false);
      
    } catch (error) {
      toast.error('❌ Failed to schedule appointment');
    }
  };

  const renderDashboard = () => (
    <div className="space-y-6">
      {/* Key Performance Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className={`${
          dailyMetrics.appointments_today >= dailyMetrics.appointments_goal 
            ? 'bg-gradient-to-br from-green-900/40 to-green-800/40 border-green-500/30' 
            : 'bg-gradient-to-br from-orange-900/40 to-red-800/40 border-orange-500/30'
        }`}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <Trophy className={`w-8 h-8 ${
                dailyMetrics.appointments_today >= dailyMetrics.appointments_goal ? 'text-green-400' : 'text-orange-400'
              }`} />
              <Badge className={`${
                dailyMetrics.appointments_today >= dailyMetrics.appointments_goal ? 'bg-green-500' : 'bg-orange-500'
              }`}>
                Goal: {dailyMetrics.appointments_goal}
              </Badge>
            </div>
            <h3 className="text-3xl font-bold text-white">
              {dailyMetrics.appointments_today}/{dailyMetrics.appointments_goal}
            </h3>
            <p className="text-gray-300 text-sm">Appointments Today</p>
            <p className={`text-xs mt-1 ${
              dailyMetrics.appointments_remaining === 0 ? 'text-green-400' : 'text-orange-300'
            }`}>
              {dailyMetrics.appointments_remaining === 0 
                ? '🎉 Daily goal achieved!' 
                : `${dailyMetrics.appointments_remaining} more needed`}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-900/40 to-blue-800/40 border-blue-500/30">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <Target className="w-8 h-8 text-blue-400" />
              <Badge className="bg-blue-500">Today</Badge>
            </div>
            <h3 className="text-3xl font-bold text-white">{dailyMetrics.leads_today}</h3>
            <p className="text-blue-300 text-sm">New Leads</p>
            <p className="text-gray-400 text-xs mt-1">
              +{dailyMetrics.leads_today - dailyMetrics.leads_yesterday} from yesterday
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-cyan-900/40 to-cyan-800/40 border-cyan-500/30">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <TrendingUp className="w-8 h-8 text-cyan-400" />
              <Badge className="bg-cyan-500">Conversion</Badge>
            </div>
            <h3 className="text-3xl font-bold text-white">{dailyMetrics.lead_to_appointment_rate}%</h3>
            <p className="text-cyan-300 text-sm">Lead → Appointment</p>
            <p className="text-gray-400 text-xs mt-1">{dailyMetrics.conversion_trend} this week</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-indigo-900/40 to-indigo-800/40 border-indigo-500/30">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <Clock className="w-8 h-8 text-indigo-400" />
              <Badge className="bg-indigo-500">Response Time</Badge>
            </div>
            <h3 className="text-3xl font-bold text-white">{dailyMetrics.avg_response_time}</h3>
            <p className="text-indigo-300 text-sm">Avg Response</p>
            <p className="text-gray-400 text-xs mt-1">Industry best: &lt;5min</p>
          </CardContent>
        </Card>
      </div>

      {/* Daily Goal Progress */}
      <Card className="bg-gradient-to-br from-gray-900/60 to-gray-800/60 backdrop-blur-lg border border-gray-500/30">
        <CardHeader>
          <CardTitle className="text-2xl text-white flex items-center">
            <Rocket className="w-6 h-6 mr-3 text-orange-400" />
            🎯 Daily 10 Appointments Challenge
          </CardTitle>
          <CardDescription className="text-gray-300">
            Track your progress toward booking 10 appointments today
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-white font-semibold">Today's Progress</span>
              <span className="text-white font-bold">
                {dailyMetrics.appointments_today} / {dailyMetrics.appointments_goal}
              </span>
            </div>
            
            <div className="w-full bg-gray-700 rounded-full h-4">
              <div 
                className={`h-4 rounded-full transition-all duration-500 ${
                  dailyMetrics.appointments_today >= dailyMetrics.appointments_goal
                    ? 'bg-gradient-to-r from-green-500 to-emerald-500'
                    : 'bg-gradient-to-r from-blue-500 to-cyan-500'
                }`}
                style={{
                  width: `${Math.min(100, (dailyMetrics.appointments_today / dailyMetrics.appointments_goal) * 100)}%`
                }}
              ></div>
            </div>
            
            <div className="grid grid-cols-5 gap-2">
              {Array.from({ length: dailyMetrics.appointments_goal }, (_, index) => (
                <div
                  key={index}
                  className={`h-8 rounded flex items-center justify-center text-sm font-semibold ${
                    index < dailyMetrics.appointments_today
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-700 text-gray-400'
                  }`}
                >
                  {index + 1}
                </div>
              ))}
            </div>
            
            {dailyMetrics.appointments_remaining > 0 && (
              <div className="bg-orange-900/20 border border-orange-500/30 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Flame className="w-5 h-5 text-orange-400" />
                  <span className="text-orange-300 font-semibold">
                    {dailyMetrics.appointments_remaining} appointments needed to reach daily goal!
                  </span>
                </div>
                <p className="text-gray-300 text-sm">
                  Focus on high-score leads and follow up on pending contacts
                </p>
              </div>
            )}
            
            {dailyMetrics.appointments_today >= dailyMetrics.appointments_goal && (
              <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Trophy className="w-5 h-5 text-green-400" />
                  <span className="text-green-300 font-semibold">
                    🎉 Congratulations! Daily goal achieved!
                  </span>
                </div>
                <p className="text-gray-300 text-sm">
                  Keep the momentum going - every additional appointment is bonus performance!
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Recent Hot Leads */}
      <Card className="bg-gradient-to-br from-gray-900/60 to-gray-800/60 backdrop-blur-lg border border-gray-500/30">
        <CardHeader>
          <CardTitle className="text-2xl text-white flex items-center">
            <Lightning className="w-6 h-6 mr-3 text-yellow-400" />
            🔥 Hot Leads - Action Required
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {leads.filter(lead => lead.urgency === 'high' && !lead.appointment_set).slice(0, 3).map((lead) => (
              <div key={lead.id} className="flex items-center justify-between p-4 bg-red-900/20 border border-red-500/30 rounded-xl">
                <div className="flex items-center gap-4">
                  <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                  <div>
                    <h4 className="font-semibold text-white">{lead.name}</h4>
                    <p className="text-sm text-gray-300">
                      {lead.vehicle_interest} • Score: {lead.lead_score} • {lead.source.replace('_', ' ')}
                    </p>
                    <p className="text-xs text-red-300">
                      Created {new Date(lead.created_at).toLocaleTimeString()} • {lead.notes}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    onClick={() => contactLead(lead.id, 'phone')}
                    className="bg-gradient-to-r from-green-600 to-emerald-600"
                  >
                    <Phone className="w-4 h-4 mr-1" />
                    Call
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => contactLead(lead.id, 'sms')}
                    className="bg-gradient-to-r from-blue-600 to-cyan-600"
                  >
                    <MessageSquare className="w-4 h-4 mr-1" />
                    SMS
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => {
                      setSelectedLead(lead);
                      setShowAppointmentModal(true);
                    }}
                    className="bg-gradient-to-r from-orange-600 to-red-600"
                  >
                    <Calendar className="w-4 h-4 mr-1" />
                    Book
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
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
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-orange-400 via-red-400 to-pink-400 bg-clip-text text-transparent mb-4">
            🎯 Lead Generation & Appointment Setting Hub
          </h1>
          <p className="text-xl text-gray-300 mb-2">
            Automotive Sales Performance System - Goal: 10 Appointments Per Day
          </p>
          <p className="text-lg text-orange-400 font-semibold">
            Multi-Channel Lead Generation • Automated Follow-up • High-Performance Booking
          </p>
        </motion.div>

        {/* Navigation */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5 glass-card mb-8">
            <TabsTrigger value="dashboard" className="flex items-center gap-2">
              <Trophy className="w-4 h-4" />
              Performance Dashboard
            </TabsTrigger>
            <TabsTrigger value="leads" className="flex items-center gap-2">
              <Target className="w-4 h-4" />
              Active Leads
            </TabsTrigger>
            <TabsTrigger value="appointments" className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Today's Appointments
            </TabsTrigger>
            <TabsTrigger value="sources" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Lead Sources
            </TabsTrigger>
            <TabsTrigger value="automation" className="flex items-center gap-2">
              <Zap className="w-4 h-4" />
              Automation
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard">
            {renderDashboard()}
          </TabsContent>

          <TabsContent value="leads">
            <Card className="bg-gradient-to-br from-gray-900/60 to-gray-800/60 backdrop-blur-lg border border-gray-500/30">
              <CardHeader>
                <CardTitle className="text-2xl text-white">Today's Lead Pipeline</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <Target className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-400 text-lg">Lead management interface coming up next...</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="appointments">
            <Card className="bg-gradient-to-br from-gray-900/60 to-gray-800/60 backdrop-blur-lg border border-gray-500/30">
              <CardHeader>
                <CardTitle className="text-2xl text-white">Today's Appointment Schedule</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {appointments.map((apt) => (
                    <div key={apt.id} className="flex items-center justify-between p-4 bg-gray-800/40 rounded-xl">
                      <div className="flex items-center gap-4">
                        <CalendarCheck className="w-6 h-6 text-green-400" />
                        <div>
                          <h4 className="font-semibold text-white">{apt.customer_name}</h4>
                          <p className="text-sm text-gray-300">
                            {apt.vehicle_interest} • {new Date(apt.appointment_time).toLocaleTimeString()}
                          </p>
                          <p className="text-xs text-gray-400">{apt.notes}</p>
                        </div>
                      </div>
                      <Badge className={apt.status === 'confirmed' ? 'bg-green-500' : 'bg-orange-500'}>
                        {apt.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="sources">
            <Card className="bg-gradient-to-br from-gray-900/60 to-gray-800/60 backdrop-blur-lg border border-gray-500/30">
              <CardHeader>
                <CardTitle className="text-2xl text-white">Lead Source Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {leadSources.map((source) => (
                    <div key={source.id} className="p-4 bg-gray-800/40 rounded-xl">
                      <div className="flex items-center gap-3 mb-3">
                        {source.icon === 'Facebook' && <Facebook className="w-6 h-6 text-blue-600" />}
                        {source.icon === 'Globe' && <Globe className="w-6 h-6 text-blue-500" />}
                        {source.icon === 'Target' && <Target className="w-6 h-6 text-green-500" />}
                        {source.icon === 'Instagram' && <Instagram className="w-6 h-6 text-pink-500" />}
                        {source.icon === 'Users' && <Users className="w-6 h-6 text-purple-500" />}
                        {source.icon === 'Phone' && <Phone className="w-6 h-6 text-orange-500" />}
                        <h4 className="font-semibold text-white">{source.name}</h4>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-300">Today's Leads:</span>
                          <span className="text-white font-semibold">{source.leads_today}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-300">Conversion:</span>
                          <span className="text-green-400 font-semibold">{source.conversion_rate}%</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-300">Avg Score:</span>
                          <span className="text-blue-400 font-semibold">{source.avg_lead_score}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-300">Cost/Lead:</span>
                          <span className="text-orange-400 font-semibold">${source.cost_per_lead}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="automation">
            <Card className="bg-gradient-to-br from-gray-900/60 to-gray-800/60 backdrop-blur-lg border border-gray-500/30">
              <CardHeader>
                <CardTitle className="text-2xl text-white">Lead Generation Automation Rules</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {automationRules.map((rule) => (
                    <div key={rule.id} className="flex items-center justify-between p-4 bg-gray-800/40 rounded-xl">
                      <div>
                        <h4 className="font-semibold text-white mb-1">{rule.name}</h4>
                        <p className="text-sm text-gray-300 mb-2">{rule.description}</p>
                        <Badge className={rule.status === 'active' ? 'bg-green-500' : 'bg-gray-500'}>
                          {rule.status} • {rule.success_rate}% success
                        </Badge>
                      </div>
                      <Switch checked={rule.status === 'active'} />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Appointment Booking Modal */}
        <Dialog open={showAppointmentModal} onOpenChange={setShowAppointmentModal}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Schedule Appointment</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Customer</Label>
                <Input value={selectedLead?.name || ''} disabled />
              </div>
              <div>
                <Label>Vehicle Interest</Label>
                <Input value={selectedLead?.vehicle_interest || ''} disabled />
              </div>
              <div>
                <Label>Appointment Type</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select appointment type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="test_drive">Test Drive</SelectItem>
                    <SelectItem value="vehicle_viewing">Vehicle Viewing</SelectItem>
                    <SelectItem value="consultation">Sales Consultation</SelectItem>
                    <SelectItem value="financing">Financing Discussion</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Date & Time</Label>
                <Input type="datetime-local" />
              </div>
              <div>
                <Label>Notes</Label>
                <Textarea placeholder="Appointment notes..." />
              </div>
              <Button 
                className="w-full bg-gradient-to-r from-green-600 to-emerald-600"
                onClick={() => scheduleAppointment(selectedLead?.id, {
                  customer_name: selectedLead?.name,
                  phone: selectedLead?.phone,
                  vehicle_interest: selectedLead?.vehicle_interest,
                  appointment_time: new Date(Date.now() + 86400000).toISOString(),
                  type: 'consultation',
                  notes: 'Scheduled via Lead Generation Hub'
                })}
              >
                <Calendar className="w-4 h-4 mr-2" />
                Confirm Appointment
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default LeadGenerationHub;