import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './App.css';
import { Button } from './components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './components/ui/card';
import { Input } from './components/ui/input';
import { Label } from './components/ui/label';
import { Textarea } from './components/ui/textarea';
import { Badge } from './components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './components/ui/select';
import { Switch } from './components/ui/switch';
import { toast, Toaster } from 'sonner';
import { Users, MessageSquare, Calendar, BarChart3, Plus, Send, Bot, Phone, Mail, DollarSign, Briefcase, Clock, Settings, Zap, TrendingUp, PhoneCall, MessageCircle } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Dashboard Component (Enhanced)
const Dashboard = () => {
  const [stats, setStats] = useState({});
  const [leads, setLeads] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [smsConfig, setSmsConfig] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
    fetchLeads();
    fetchAppointments();
    fetchSmsConfig();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await axios.get(`${API}/dashboard/stats`);
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
      toast.error('Failed to load dashboard stats');
    }
  };

  const fetchLeads = async () => {
    try {
      const response = await axios.get(`${API}/leads`);
      setLeads(response.data);
    } catch (error) {
      console.error('Error fetching leads:', error);
      toast.error('Failed to load leads');
    } finally {
      setLoading(false);
    }
  };

  const fetchAppointments = async () => {
    try {
      const response = await axios.get(`${API}/appointments`);
      setAppointments(response.data);
    } catch (error) {
      console.error('Error fetching appointments:', error);
    }
  };

  const fetchSmsConfig = async () => {
    try {
      const response = await axios.get(`${API}/config/sms`);
      setSmsConfig(response.data);
    } catch (error) {
      console.error('Error fetching SMS config:', error);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      new: 'bg-blue-100 text-blue-800',
      contacted: 'bg-yellow-100 text-yellow-800',
      scheduled: 'bg-green-100 text-green-800',
      closed: 'bg-gray-100 text-gray-800'
    };
    return colors[status] || colors.new;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const todayAppointments = appointments.filter(apt => {
    const aptDate = new Date(apt.appointment_datetime);
    const today = new Date();
    return aptDate.toDateString() === today.toDateString() && apt.status === 'scheduled';
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="container mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">AutoFollow Pro</h1>
          <p className="text-gray-600">Intelligent lead management for car sales professionals</p>
          
          {/* SMS Status Indicator */}
          <div className="mt-4 flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${smsConfig.provider === 'textbelt' ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
              <span className="text-sm text-gray-600">
                SMS: {smsConfig.provider === 'textbelt' ? 'TextBelt Active' : 'Mock Mode'}
                {smsConfig.free_mode && ' (Free)'}
              </span>
            </div>
          </div>
        </div>

        {/* Enhanced Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-6 mb-8">
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Leads</CardTitle>
              <Users className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">{stats.total_leads || 0}</div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">New Leads</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">{stats.new_leads || 0}</div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Contacted</CardTitle>
              <MessageSquare className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">{stats.contacted_leads || 0}</div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Scheduled</CardTitle>
              <Calendar className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">{stats.scheduled_leads || 0}</div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Today's Appointments</CardTitle>
              <Clock className="h-4 w-4 text-indigo-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">{todayAppointments.length}</div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">This Week</CardTitle>
              <BarChart3 className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">{stats.recent_leads || 0}</div>
            </CardContent>
          </Card>
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Leads */}
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl text-gray-900">Recent Leads</CardTitle>
              <CardDescription>Your latest customer inquiries</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {leads.slice(0, 5).map((lead) => (
                  <div key={lead.id} className="flex items-center justify-between p-4 bg-white rounded-lg shadow-sm border border-gray-100">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                        {lead.first_name[0]}{lead.last_name[0]}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{lead.first_name} {lead.last_name}</h3>
                        <div className="flex items-center space-x-3 text-sm text-gray-600">
                          <span className="flex items-center">
                            <Phone className="h-3 w-3 mr-1" />
                            {lead.primary_phone}
                          </span>
                          {lead.budget && (
                            <span className="flex items-center">
                              <DollarSign className="h-3 w-3 mr-1" />
                              {lead.budget}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Badge className={getStatusColor(lead.status)}>
                        {lead.status}
                      </Badge>
                      <Link to={`/leads/${lead.id}`}>
                        <Button variant="outline" size="sm">View</Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Today's Appointments */}
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl text-gray-900">Today's Appointments</CardTitle>
              <CardDescription>Scheduled meetings for today</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {todayAppointments.length > 0 ? (
                  todayAppointments.map((appointment) => {
                    const lead = leads.find(l => l.id === appointment.lead_id);
                    const aptTime = new Date(appointment.appointment_datetime);
                    return (
                      <div key={appointment.id} className="flex items-center justify-between p-4 bg-white rounded-lg shadow-sm border border-gray-100">
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                            <Calendar className="h-5 w-5" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900">{appointment.title}</h3>
                            <div className="text-sm text-gray-600">
                              {lead && `${lead.first_name} ${lead.last_name}`} • {aptTime.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                            </div>
                          </div>
                        </div>
                        <Badge className="bg-green-100 text-green-800">
                          {appointment.status}
                        </Badge>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No appointments scheduled for today</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

// Enhanced Leads Management Component
const LeadsManagement = () => {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showBulkDialog, setShowBulkDialog] = useState(false);
  const [showBulkFollowUpDialog, setShowBulkFollowUpDialog] = useState(false);
  const [selectedLeads, setSelectedLeads] = useState(new Set());
  const [showSmsConfigDialog, setShowSmsConfigDialog] = useState(false);
  const [smsConfig, setSmsConfig] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    fetchLeads();
    fetchSmsConfig();
  }, []);

  const fetchLeads = async () => {
    try {
      const response = await axios.get(`${API}/leads`);
      setLeads(response.data);
    } catch (error) {
      console.error('Error fetching leads:', error);
      toast.error('Failed to load leads');
    } finally {
      setLoading(false);
    }
  };

  const fetchSmsConfig = async () => {
    try {
      const response = await axios.get(`${API}/config/sms`);
      setSmsConfig(response.data);
    } catch (error) {
      console.error('Error fetching SMS config:', error);
    }
  };

  const handleSendSMS = async (leadId, language = 'english', provider = 'mock') => {
    try {
      const response = await axios.post(`${API}/sms/send?lead_id=${leadId}&language=${language}&provider=${provider}`);
      if (response.data.status === 'sent') {
        toast.success(`SMS sent successfully! ${response.data.provider === 'textbelt' ? '(Real SMS)' : '(Simulated)'}`);
      } else {
        toast.error(`SMS failed: ${response.data.message}`);
      }
      fetchLeads(); // Refresh to update status
    } catch (error) {
      console.error('Error sending SMS:', error);
      toast.error('Failed to send SMS');
    }
  };

  const handleVoiceCall = async (leadId) => {
    try {
      const response = await axios.post(`${API}/voice/call`, {
        lead_id: leadId,
        phone_number: leads.find(l => l.id === leadId)?.primary_phone
      });
      toast.success('Voice call initiated! AI will call the lead.');
      // In production, this would integrate with Twilio/OpenAI Realtime
    } catch (error) {
      console.error('Error initiating voice call:', error);
      toast.error('Failed to initiate voice call');
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      new: 'bg-blue-100 text-blue-800',
      contacted: 'bg-yellow-100 text-yellow-800',
      scheduled: 'bg-green-100 text-green-800',
      closed: 'bg-gray-100 text-gray-800'
    };
    return colors[status] || colors.new;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="container mx-auto px-6 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Leads Management</h1>
            <p className="text-gray-600">Manage and follow up with your sales leads</p>
          </div>
          <div className="flex space-x-3">
            <Dialog open={showSmsConfigDialog} onOpenChange={setShowSmsConfigDialog}>
              <DialogTrigger asChild>
                <Button variant="outline" className="bg-white">
                  <Settings className="w-4 h-4 mr-2" />
                  SMS Config
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>SMS Configuration</DialogTitle>
                  <DialogDescription>
                    Configure your SMS sending preferences
                  </DialogDescription>
                </DialogHeader>
                <SMSConfigForm 
                  config={smsConfig} 
                  onSuccess={() => { 
                    setShowSmsConfigDialog(false); 
                    fetchSmsConfig(); 
                  }} 
                />
              </DialogContent>
            </Dialog>

            <Dialog open={showBulkFollowUpDialog} onOpenChange={setShowBulkFollowUpDialog}>
              <DialogTrigger asChild>
                <Button variant="outline" className="bg-white">
                  <Clock className="w-4 h-4 mr-2" />
                  Follow-up System
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Scheduled Follow-up Messages</DialogTitle>
                  <DialogDescription>
                    Send automated follow-up messages based on lead pipeline stage
                  </DialogDescription>
                </DialogHeader>
                <FollowUpSystem 
                  leads={leads} 
                  onSuccess={() => { 
                    setShowBulkFollowUpDialog(false); 
                    fetchLeads(); 
                  }} 
                />
              </DialogContent>
            </Dialog>

            <Dialog open={showBulkDialog} onOpenChange={setShowBulkDialog}>
              <DialogTrigger asChild>
                <Button variant="outline" className="bg-white">
                  <Plus className="w-4 h-4 mr-2" />
                  Bulk Import
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Bulk Import Leads</DialogTitle>
                  <DialogDescription>
                    Paste your lead data in the format provided by your lead source
                  </DialogDescription>
                </DialogHeader>
                <BulkImportForm onSuccess={() => { setShowBulkDialog(false); fetchLeads(); }} />
              </DialogContent>
            </Dialog>

            <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Lead
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Add New Lead</DialogTitle>
                  <DialogDescription>
                    Enter the lead information manually
                  </DialogDescription>
                </DialogHeader>
                <AddLeadForm onSuccess={() => { setShowAddDialog(false); fetchLeads(); }} />
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="space-y-4">
              {leads.map((lead) => (
                <div key={lead.id} className="p-6 bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                        {lead.first_name[0]}{lead.last_name[0]}
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900">{lead.first_name} {lead.last_name}</h3>
                        <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                          <span className="flex items-center">
                            <Phone className="h-4 w-4 mr-1" />
                            {lead.primary_phone}
                          </span>
                          <span className="flex items-center">
                            <Mail className="h-4 w-4 mr-1" />
                            {lead.email}
                          </span>
                          {lead.budget && (
                            <span className="flex items-center">
                              <DollarSign className="h-4 w-4 mr-1" />
                              {lead.budget}
                            </span>
                          )}
                          {lead.vehicle_type && (
                            <span className="flex items-center">
                              <Briefcase className="h-4 w-4 mr-1" />
                              {lead.vehicle_type}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Badge className={getStatusColor(lead.status)}>
                        {lead.status}
                      </Badge>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleSendSMS(lead.id, 'english', smsConfig.provider)}
                          className="text-blue-600 border-blue-200 hover:bg-blue-50"
                        >
                          <Send className="w-4 h-4 mr-1" />
                          SMS (EN)
                          {smsConfig.provider === 'textbelt' && <Zap className="w-3 h-3 ml-1 text-yellow-500" />}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleSendSMS(lead.id, 'spanish', smsConfig.provider)}
                          className="text-green-600 border-green-200 hover:bg-green-50"
                        >
                          <Send className="w-4 h-4 mr-1" />
                          SMS (ES)
                          {smsConfig.provider === 'textbelt' && <Zap className="w-3 h-3 ml-1 text-yellow-500" />}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleVoiceCall(lead.id)}
                          className="text-purple-600 border-purple-200 hover:bg-purple-50"
                        >
                          <PhoneCall className="w-4 h-4 mr-1" />
                          AI Call
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => navigate(`/leads/${lead.id}`)}
                        >
                          View Details
                        </Button>
                      </div>
                    </div>
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

// Follow-up System Component
const FollowUpSystem = ({ leads, onSuccess }) => {
  const [selectedStage, setSelectedStage] = useState('second_follow');
  const [selectedLanguage, setSelectedLanguage] = useState('english');
  const [delayHours, setDelayHours] = useState(24);
  const [selectedLeads, setSelectedLeads] = useState(new Set());
  const [loading, setLoading] = useState(false);

  const followUpStages = {
    'initial': 'Initial Contact',
    'second_follow': 'Second Follow-up',
    'third_follow': 'Final Follow-up',
    'appointment_reminder': 'Appointment Reminder',
    'post_visit': 'Post-Visit Thank You'
  };

  const handleLeadSelection = (leadId, checked) => {
    const newSelected = new Set(selectedLeads);
    if (checked) {
      newSelected.add(leadId);
    } else {
      newSelected.delete(leadId);
    }
    setSelectedLeads(newSelected);
  };

  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedLeads(new Set(leads.map(lead => lead.id)));
    } else {
      setSelectedLeads(new Set());
    }
  };

  const handleBulkFollowUp = async () => {
    if (selectedLeads.size === 0) {
      toast.error('Please select at least one lead');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(`${API}/sms/bulk-follow-up`, {
        lead_ids: Array.from(selectedLeads),
        stage: selectedStage,
        delay_hours: delayHours,
        language: selectedLanguage
      });
      
      toast.success(`Scheduled ${response.data.scheduled_count} follow-up messages!`);
      onSuccess();
    } catch (error) {
      console.error('Error scheduling follow-ups:', error);
      toast.error('Failed to schedule follow-up messages');
    } finally {
      setLoading(false);
    }
  };

  const handleSingleFollowUp = async (leadId) => {
    try {
      await axios.post(`${API}/sms/follow-up?lead_id=${leadId}&stage=${selectedStage}&language=${selectedLanguage}`);
      toast.success('Follow-up message sent!');
    } catch (error) {
      console.error('Error sending follow-up:', error);
      toast.error('Failed to send follow-up message');
    }
  };

  return (
    <div className="space-y-6">
      {/* Follow-up Configuration */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="stage">Follow-up Stage</Label>
          <Select value={selectedStage} onValueChange={setSelectedStage}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(followUpStages).map(([key, label]) => (
                <SelectItem key={key} value={key}>{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="language">Language</Label>
          <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="english">English</SelectItem>
              <SelectItem value="spanish">Spanish</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="delay">Delay (Hours)</Label>
          <Input
            id="delay"
            type="number"
            value={delayHours}
            onChange={(e) => setDelayHours(parseInt(e.target.value))}
            min="0"
            max="168"
          />
        </div>

        <div className="flex items-end">
          <Button 
            onClick={handleBulkFollowUp}
            disabled={loading || selectedLeads.size === 0}
            className="w-full bg-gradient-to-r from-orange-600 to-red-600 text-white"
          >
            {loading ? 'Scheduling...' : `Send to ${selectedLeads.size} Leads`}
          </Button>
        </div>
      </div>

      {/* Lead Selection */}
      <div className="border rounded-lg">
        <div className="p-4 bg-gray-50 border-b flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={selectedLeads.size === leads.length && leads.length > 0}
              onChange={(e) => handleSelectAll(e.target.checked)}
              className="rounded"
            />
            <Label>Select All ({leads.length} leads)</Label>
          </div>
          <Badge variant="outline">{selectedLeads.size} selected</Badge>
        </div>

        <div className="max-h-60 overflow-y-auto">
          {leads.map((lead) => (
            <div key={lead.id} className="p-3 border-b flex items-center justify-between hover:bg-gray-50">
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={selectedLeads.has(lead.id)}
                  onChange={(e) => handleLeadSelection(lead.id, e.target.checked)}
                  className="rounded"
                />
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                  {lead.first_name[0]}{lead.last_name[0]}
                </div>
                <div>
                  <div className="font-medium">{lead.first_name} {lead.last_name}</div>
                  <div className="text-sm text-gray-600">{lead.primary_phone}</div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Badge className={`text-xs ${lead.status === 'new' ? 'bg-blue-100 text-blue-800' : 
                  lead.status === 'contacted' ? 'bg-yellow-100 text-yellow-800' : 
                  lead.status === 'scheduled' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                  {lead.status}
                </Badge>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleSingleFollowUp(lead.id)}
                  className="text-xs"
                >
                  Send Now
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Preview Message */}
      <div className="bg-blue-50 p-4 rounded-lg">
        <Label className="font-medium mb-2 block">Message Preview ({followUpStages[selectedStage]})</Label>
        <div className="text-sm text-gray-700 italic">
          {selectedStage === 'initial' && 'Initial contact message focusing on scheduling a visit...'}
          {selectedStage === 'second_follow' && 'Follow-up for leads who haven\'t responded to initial contact...'}
          {selectedStage === 'third_follow' && 'Final gentle follow-up with opt-out option...'}
          {selectedStage === 'appointment_reminder' && 'Reminder for scheduled appointments with visit details...'}
          {selectedStage === 'post_visit' && 'Thank you message after dealership visit...'}
        </div>
      </div>
    </div>
  );
};
const SMSConfigForm = ({ config, onSuccess }) => {
  const [provider, setProvider] = useState(config.provider || 'mock');
  const [apiKey, setApiKey] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API}/config/sms`, {
        provider,
        textbelt_api_key: apiKey
      });
      toast.success('SMS configuration updated!');
      onSuccess();
    } catch (error) {
      console.error('Error updating SMS config:', error);
      toast.error('Failed to update SMS configuration');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="provider">SMS Provider</Label>
        <Select value={provider} onValueChange={setProvider}>
          <SelectTrigger>
            <SelectValue placeholder="Select SMS provider" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="mock">Mock (Simulation)</SelectItem>
            <SelectItem value="textbelt">TextBelt (Real SMS)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {provider === 'textbelt' && (
        <div>
          <Label htmlFor="api_key">TextBelt API Key (Optional - uses free tier if empty)</Label>
          <Input
            id="api_key"
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="Enter your TextBelt API key"
          />
          <p className="text-xs text-gray-500 mt-1">
            Leave empty to use free tier (1 SMS per day). Get paid API key at textbelt.com
          </p>
        </div>
      )}

      <div className="bg-blue-50 p-4 rounded-lg">
        <h4 className="font-semibold mb-2">Current Status:</h4>
        <p className="text-sm">
          Provider: <strong>{config.provider || 'mock'}</strong><br />
          Mode: <strong>{config.free_mode ? 'Free Tier' : 'Paid API'}</strong><br />
          Status: <strong>{config.has_api_key ? 'API Key Configured' : 'Using Free/Mock'}</strong>
        </p>
      </div>

      <Button type="submit" className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        Update Configuration
      </Button>
    </form>
  );
};

// Add Lead Form Component
const AddLeadForm = ({ onSuccess }) => {
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    primary_phone: '',
    alternate_phone: '',
    email: '',
    date_of_birth: '',
    budget: '',
    income: '',
    vehicle_type: '',
    employment_status: '',
    employment_duration: '',
    occupation: '',
    employer: '',
    address: '',
    reference_number: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API}/leads`, formData);
      toast.success('Lead added successfully!');
      onSuccess();
    } catch (error) {
      console.error('Error adding lead:', error);
      toast.error('Failed to add lead');
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-h-96 overflow-y-auto">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="first_name">First Name *</Label>
          <Input
            id="first_name"
            name="first_name"
            value={formData.first_name}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <Label htmlFor="last_name">Last Name *</Label>
          <Input
            id="last_name"
            name="last_name"
            value={formData.last_name}
            onChange={handleChange}
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="primary_phone">Primary Phone *</Label>
          <Input
            id="primary_phone"
            name="primary_phone"
            value={formData.primary_phone}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <Label htmlFor="email">Email *</Label>
          <Input
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="budget">Budget</Label>
          <Input
            id="budget"
            name="budget"
            value={formData.budget}
            onChange={handleChange}
          />
        </div>
        <div>
          <Label htmlFor="vehicle_type">Vehicle Type</Label>
          <Input
            id="vehicle_type"
            name="vehicle_type"
            value={formData.vehicle_type}
            onChange={handleChange}
          />
        </div>
      </div>

      <div>
        <Label htmlFor="address">Address</Label>
        <Input
          id="address"
          name="address"
          value={formData.address}
          onChange={handleChange}
        />
      </div>

      <Button type="submit" className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        Add Lead
      </Button>
    </form>
  );
};

// Bulk Import Form Component
const BulkImportForm = ({ onSuccess }) => {
  const [bulkText, setBulkText] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await axios.post(`${API}/leads/bulk?leads_text=${encodeURIComponent(bulkText)}`);
      toast.success(`Successfully imported ${response.data.leads_created} leads!`);
      onSuccess();
    } catch (error) {
      console.error('Error importing leads:', error);
      toast.error('Failed to import leads');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="bulk_text">Paste Lead Data</Label>
        <Textarea
          id="bulk_text"
          value={bulkText}
          onChange={(e) => setBulkText(e.target.value)}
          placeholder="First Name: John
Last Name: Doe
Primary Phone: 555-123-4567
Email: john.doe@example.com
Budget: $300-500
..."
          rows={10}
          className="font-mono text-sm"
        />
      </div>
      <Button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        {loading ? 'Importing...' : 'Import Leads'}
      </Button>
    </form>
  );
};

// Enhanced Lead Detail Component with Appointment Scheduling
const LeadDetail = () => {
  const [lead, setLead] = useState(null);
  const [messages, setMessages] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [showScheduleDialog, setShowScheduleDialog] = useState(false);
  const pathParts = window.location.pathname.split('/');
  const id = pathParts[pathParts.length - 1];

  useEffect(() => {
    fetchLead();
    fetchMessages();
    fetchAppointments();
  }, [id]);

  const fetchLead = async () => {
    try {
      const response = await axios.get(`${API}/leads/${id}`);
      setLead(response.data);
    } catch (error) {
      console.error('Error fetching lead:', error);
      toast.error('Failed to load lead details');
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async () => {
    try {
      const response = await axios.get(`${API}/sms/messages/${id}`);
      setMessages(response.data);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const fetchAppointments = async () => {
    try {
      const response = await axios.get(`${API}/appointments/${id}`);
      setAppointments(response.data);
    } catch (error) {
      console.error('Error fetching appointments:', error);
    }
  };

  const handleAIResponse = async () => {
    if (!newMessage.trim()) return;

    setSending(true);
    try {
      const response = await axios.post(`${API}/ai/respond`, {
        lead_id: id,
        incoming_message: newMessage,
        phone_number: lead.primary_phone
      });
      
      toast.success('AI response generated and sent!');
      setNewMessage('');
      fetchMessages();
      
      // Show scheduling dialog if AI suggests scheduling
      if (response.data.suggests_scheduling) {
        setTimeout(() => {
          toast.info('Customer seems interested in scheduling. Consider creating an appointment!');
          setShowScheduleDialog(true);
        }, 2000);
      }
    } catch (error) {
      console.error('Error generating AI response:', error);
      toast.error('Failed to generate AI response');
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!lead) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Lead not found</h2>
          <Link to="/leads" className="text-blue-600 hover:underline">
            Return to leads
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="container mx-auto px-6 py-8">
        <div className="mb-6">
          <Link to="/leads" className="text-blue-600 hover:underline mb-4 inline-block">
            ← Back to Leads
          </Link>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            {lead.first_name} {lead.last_name}
          </h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Lead Information & Appointments */}
          <div className="lg:col-span-1 space-y-6">
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <CardTitle>Lead Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-sm font-medium text-gray-600">Contact</Label>
                  <div className="mt-1">
                    <p className="text-sm">{lead.primary_phone}</p>
                    <p className="text-sm">{lead.email}</p>
                  </div>
                </div>
                {lead.budget && (
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Budget</Label>
                    <p className="text-sm mt-1">{lead.budget}</p>
                  </div>
                )}
                {lead.vehicle_type && (
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Vehicle Type</Label>
                    <p className="text-sm mt-1">{lead.vehicle_type}</p>
                  </div>
                )}
                {lead.address && (
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Address</Label>
                    <p className="text-sm mt-1">{lead.address}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Appointments */}
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Appointments</CardTitle>
                <Dialog open={showScheduleDialog} onOpenChange={setShowScheduleDialog}>
                  <DialogTrigger asChild>
                    <Button size="sm" className="bg-gradient-to-r from-green-600 to-blue-600 text-white">
                      <Plus className="w-4 h-4 mr-1" />
                      Schedule
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Schedule Appointment</DialogTitle>
                      <DialogDescription>
                        Schedule a meeting with {lead.first_name} {lead.last_name}
                      </DialogDescription>
                    </DialogHeader>
                    <AppointmentForm 
                      leadId={id} 
                      onSuccess={() => { 
                        setShowScheduleDialog(false); 
                        fetchAppointments(); 
                      }} 
                    />
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {appointments.length > 0 ? (
                    appointments.map((appointment) => {
                      const aptTime = new Date(appointment.appointment_datetime);
                      return (
                        <div key={appointment.id} className="p-3 bg-gray-50 rounded-lg">
                          <div className="font-medium text-sm">{appointment.title}</div>
                          <div className="text-xs text-gray-600">
                            {aptTime.toLocaleDateString()} at {aptTime.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                          </div>
                          <Badge className="text-xs mt-1 bg-green-100 text-green-800">
                            {appointment.status}
                          </Badge>
                        </div>
                      );
                    })
                  ) : (
                    <p className="text-sm text-gray-500">No appointments scheduled</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Conversation */}
          <div className="lg:col-span-2">
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg h-[600px] flex flex-col">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MessageSquare className="w-5 h-5 mr-2" />
                  SMS Conversation
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col">
                <div className="flex-1 overflow-y-auto space-y-4 mb-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.direction === 'outbound' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                          message.direction === 'outbound'
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-900'
                        }`}
                      >
                        <p className="text-sm">{message.message}</p>
                        <p className="text-xs opacity-70 mt-1">
                          {new Date(message.created_at).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* AI Response Generator */}
                <div className="border-t pt-4">
                  <Label className="text-sm font-medium text-gray-600 mb-2 block">
                    Simulate Customer Message & Generate AI Response
                  </Label>
                  <div className="flex space-x-2">
                    <Input
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type customer message..."
                      className="flex-1"
                    />
                    <Button
                      onClick={handleAIResponse}
                      disabled={sending || !newMessage.trim()}
                      className="bg-gradient-to-r from-green-600 to-blue-600 text-white"
                    >
                      <Bot className="w-4 h-4 mr-2" />
                      {sending ? 'Generating...' : 'AI Respond'}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

// Appointment Form Component
const AppointmentForm = ({ leadId, onSuccess }) => {
  const [formData, setFormData] = useState({
    title: 'Vehicle Consultation',
    appointment_datetime: '',
    duration_minutes: 60,
    description: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API}/appointments`, {
        lead_id: leadId,
        ...formData,
        appointment_datetime: new Date(formData.appointment_datetime).toISOString()
      });
      toast.success('Appointment scheduled successfully!');
      onSuccess();
    } catch (error) {
      console.error('Error scheduling appointment:', error);
      toast.error('Failed to schedule appointment');
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="title">Appointment Title</Label>
        <Input
          id="title"
          name="title"
          value={formData.title}
          onChange={handleChange}
          required
        />
      </div>

      <div>
        <Label htmlFor="appointment_datetime">Date & Time</Label>
        <Input
          id="appointment_datetime"
          name="appointment_datetime"  
          type="datetime-local"
          value={formData.appointment_datetime}
          onChange={handleChange}
          required
        />
      </div>

      <div>
        <Label htmlFor="duration_minutes">Duration (minutes)</Label>
        <Select value={formData.duration_minutes.toString()} onValueChange={(value) => setFormData({...formData, duration_minutes: parseInt(value)})}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="30">30 minutes</SelectItem>
            <SelectItem value="60">1 hour</SelectItem>
            <SelectItem value="90">1.5 hours</SelectItem>
            <SelectItem value="120">2 hours</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="description">Description (Optional)</Label>
        <Textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Any special notes about this appointment..."
        />
      </div>

      <Button type="submit" className="w-full bg-gradient-to-r from-green-600 to-blue-600 text-white">
        Schedule Appointment
      </Button>
    </form>
  );
};

// Navigation Component
const Navigation = () => {
  return (
    <nav className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">AutoFollow Pro</span>
          </Link>
          <div className="flex space-x-6">
            <Link 
              to="/" 
              className="text-gray-600 hover:text-gray-900 font-medium transition-colors duration-200"
            >
              Dashboard
            </Link>
            <Link 
              to="/leads" 
              className="text-gray-600 hover:text-gray-900 font-medium transition-colors duration-200"
            >
              Leads
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

// Main App Component
function App() {
  return (
    <BrowserRouter>
      <div className="App">
        <Navigation />
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/leads" element={<LeadsManagement />} />
          <Route path="/leads/:id" element={<LeadDetail />} />
        </Routes>
        <Toaster position="top-right" />
      </div>
    </BrowserRouter>
  );
}

export default App;