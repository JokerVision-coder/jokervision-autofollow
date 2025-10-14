import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { 
  Plus, Edit, Trash2, BarChart3, DollarSign, Users, Calendar, 
  Phone, Mail, MessageSquare, Star, Clock, TrendingUp, Target,
  ChevronRight, MoreVertical, Zap, RefreshCw, Filter, Search,
  User, Car, AlertCircle, CheckCircle2, XCircle, ArrowRight
} from 'lucide-react';

const API = process.env.REACT_APP_BACKEND_URL;

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

const SalesPipeline = () => {
  const [pipelineStages, setPipelineStages] = useState([]);
  const [leads, setLeads] = useState([]);
  const [draggedLead, setDraggedLead] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pipelineStats, setPipelineStats] = useState({});
  const [showAddLeadModal, setShowAddLeadModal] = useState(false);
  const [newLead, setNewLead] = useState({
    first_name: '',
    last_name: '',
    primary_phone: '',
    email: '',
    vehicle_type: '',
    budget: '',
    notes: ''
  });

  useEffect(() => {
    fetchPipelineData();
  }, []);

  const handleAddLead = async () => {
    if (!newLead.first_name || !newLead.last_name || !newLead.primary_phone) {
      toast.error('Please fill in all required fields (Name and Phone)');
      return;
    }

    try {
      const leadData = {
        ...newLead,
        tenant_id: 'default_dealership',
        status: 'new',
        source: 'Manual Entry'
      };

      await axios.post(`${API}/leads`, leadData);
      toast.success('Lead added successfully!');
      setShowAddLeadModal(false);
      setNewLead({
        first_name: '',
        last_name: '',
        primary_phone: '',
        email: '',
        vehicle_type: '',
        budget: '',
        notes: ''
      });
      fetchPipelineData();
    } catch (error) {
      console.error('Error adding lead:', error);
      toast.error('Failed to add lead');
    }
  };

  const fetchPipelineData = async () => {
    try {
      setLoading(true);
      const [stagesResponse, leadsResponse, statsResponse] = await Promise.all([
        axios.get(`${API}/pipeline/stages?tenant_id=default_dealership`),
        axios.get(`${API}/leads?tenant_id=default_dealership`),
        axios.get(`${API}/pipeline/stats?tenant_id=default_dealership`)
      ]);
      
      setPipelineStages(stagesResponse.data.stages || []);
      setLeads(leadsResponse.data || []);
      setPipelineStats(statsResponse.data || {});
    } catch (error) {
      console.error('Error fetching pipeline data:', error);
      // Load mock data for demonstration
      loadMockData();
    } finally {
      setLoading(false);
    }
  };

  const loadMockData = () => {
    const mockStages = [
      { id: 'new', name: 'New Leads', color: 'bg-blue-600', order: 1, automation_enabled: true },
      { id: 'contacted', name: 'Contacted', color: 'bg-yellow-600', order: 2, automation_enabled: true },
      { id: 'qualified', name: 'Qualified', color: 'bg-orange-600', order: 3, automation_enabled: true },
      { id: 'appointment', name: 'Appointment Set', color: 'bg-purple-600', order: 4, automation_enabled: true },
      { id: 'negotiating', name: 'Negotiating', color: 'bg-red-600', order: 5, automation_enabled: false },
      { id: 'closed_won', name: 'Closed Won', color: 'bg-green-600', order: 6, automation_enabled: true },
      { id: 'closed_lost', name: 'Closed Lost', color: 'bg-gray-600', order: 7, automation_enabled: false }
    ];

    const mockLeads = [
      {
        id: '1',
        first_name: 'Sarah',
        last_name: 'Johnson',
        email: 'sarah@email.com',
        primary_phone: '+1-555-0123',
        pipeline_stage: 'new',
        vehicle_type: 'SUV',
        budget: '$35,000',
        last_contact: '2024-01-07T10:30:00Z',
        created_at: '2024-01-07T09:00:00Z',
        lead_score: 85,
        source: 'Website'
      },
      {
        id: '2',
        first_name: 'Mike',
        last_name: 'Rodriguez',
        email: 'mike@email.com',
        primary_phone: '+1-555-0456',
        pipeline_stage: 'contacted',
        vehicle_type: 'Truck',
        budget: '$45,000',
        last_contact: '2024-01-06T15:20:00Z',
        created_at: '2024-01-06T14:00:00Z',
        lead_score: 72,
        source: 'Facebook'
      },
      {
        id: '3',
        first_name: 'Jennifer',
        last_name: 'Chen',
        email: 'jennifer@email.com',
        primary_phone: '+1-555-0789',
        pipeline_stage: 'qualified',
        vehicle_type: 'Sedan',
        budget: '$28,000',
        last_contact: '2024-01-05T11:45:00Z',
        created_at: '2024-01-05T10:00:00Z',
        lead_score: 91,
        source: 'Google Ads'
      },
      {
        id: '4',
        first_name: 'David',
        last_name: 'Wilson',
        email: 'david@email.com',
        primary_phone: '+1-555-0321',
        pipeline_stage: 'appointment',
        vehicle_type: 'SUV',
        budget: '$42,000',
        last_contact: '2024-01-04T16:30:00Z',
        created_at: '2024-01-04T15:00:00Z',
        lead_score: 88,
        source: 'Referral'
      }
    ];

    setPipelineStages(mockStages);
    setLeads(mockLeads);
    setPipelineStats({
      total_leads: mockLeads.length,
      conversion_rate: 24.5,
      avg_deal_size: 38500,
      pipeline_velocity: 14.2
    });
  };

  const handleDragStart = (e, lead) => {
    setDraggedLead(lead);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = async (e, stageId) => {
    e.preventDefault();
    if (!draggedLead || draggedLead.pipeline_stage === stageId) {
      setDraggedLead(null);
      return;
    }

    try {
      // Update lead stage
      await axios.put(`${API}/leads/${draggedLead.id}`, {
        pipeline_stage: stageId
      });

      // Update local state
      setLeads(leads.map(lead => 
        lead.id === draggedLead.id 
          ? { ...lead, pipeline_stage: stageId }
          : lead
      ));

      // Trigger automation if enabled for this stage
      const stage = pipelineStages.find(s => s.id === stageId);
      if (stage?.automation_enabled) {
        await triggerStageAutomation(draggedLead.id, stageId);
      }

      toast.success(`Lead moved to ${stage?.name || stageId}`);
    } catch (error) {
      console.error('Error updating lead stage:', error);
      toast.error('Failed to update lead stage');
    } finally {
      setDraggedLead(null);
    }
  };

  const triggerStageAutomation = async (leadId, stageId) => {
    try {
      await axios.post(`${API}/pipeline/automation/trigger`, {
        lead_id: leadId,
        stage_id: stageId
      });
      toast.info('Automation triggered for this stage');
    } catch (error) {
      console.error('Error triggering automation:', error);
    }
  };

  const getLeadsForStage = (stageId) => {
    return leads.filter(lead => lead.pipeline_stage === stageId);
  };

  const getStageStats = (stageId) => {
    const stageLeads = getLeadsForStage(stageId);
    const totalValue = stageLeads.reduce((sum, lead) => {
      const budget = parseInt(lead.budget?.replace(/[$,]/g, '') || '0');
      return sum + budget;
    }, 0);
    
    return {
      count: stageLeads.length,
      totalValue: totalValue,
      avgValue: stageLeads.length > 0 ? totalValue / stageLeads.length : 0
    };
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
            <h1 className="text-4xl font-bold text-glass-bright mb-2">Sales Pipeline</h1>
            <p className="text-glass-muted">Drag & drop leads to automate your sales process</p>
          </div>
          
          <div className="flex gap-3">
            <Button className="btn-neon">
              <Plus className="w-4 h-4 mr-2" />
              Add Lead
            </Button>
            <Button onClick={fetchPipelineData} variant="outline" className="text-glass-bright">
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>

        {/* Pipeline Stats */}
        <PipelineStats stats={pipelineStats} />

        {/* Pipeline Stages */}
        <div className="mt-8">
          <div className="flex gap-6 overflow-x-auto pb-4">
            {pipelineStages.map((stage) => (
              <PipelineStage
                key={stage.id}
                stage={stage}
                leads={getLeadsForStage(stage.id)}
                stats={getStageStats(stage.id)}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, stage.id)}
                onDragStart={handleDragStart}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// Pipeline Stats Component
const PipelineStats = ({ stats }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <Card className="glass-card">
        <CardContent className="p-6 text-center">
          <Users className="w-8 h-8 mx-auto mb-2 neon-blue" />
          <div className="text-2xl font-bold text-glass-bright">{stats.total_leads || 0}</div>
          <div className="text-sm text-glass-muted">Total Leads</div>
        </CardContent>
      </Card>
      
      <Card className="glass-card">
        <CardContent className="p-6 text-center">
          <Target className="w-8 h-8 mx-auto mb-2 neon-green" />
          <div className="text-2xl font-bold neon-green">{stats.conversion_rate || 0}%</div>
          <div className="text-sm text-glass-muted">Conversion Rate</div>
        </CardContent>
      </Card>
      
      <Card className="glass-card">
        <CardContent className="p-6 text-center">
          <DollarSign className="w-8 h-8 mx-auto mb-2 neon-yellow" />
          <div className="text-2xl font-bold neon-yellow">${(stats.avg_deal_size || 0).toLocaleString()}</div>
          <div className="text-sm text-glass-muted">Avg Deal Size</div>
        </CardContent>
      </Card>
      
      <Card className="glass-card">
        <CardContent className="p-6 text-center">
          <Clock className="w-8 h-8 mx-auto mb-2 neon-purple" />
          <div className="text-2xl font-bold neon-purple">{stats.pipeline_velocity || 0} days</div>
          <div className="text-sm text-glass-muted">Pipeline Velocity</div>
        </CardContent>
      </Card>
    </div>
  );
};

// Pipeline Stage Component
const PipelineStage = ({ stage, leads, stats, onDragOver, onDrop, onDragStart }) => {
  return (
    <div 
      className="min-w-80 bg-glass backdrop-blur-lg rounded-lg p-4"
      onDragOver={onDragOver}
      onDrop={onDrop}
    >
      {/* Stage Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <div className={`w-3 h-3 rounded-full ${stage.color} mr-3`}></div>
          <h3 className="font-semibold text-glass-bright">{stage.name}</h3>
          {stage.automation_enabled && (
            <Zap className="w-4 h-4 ml-2 text-yellow-400" title="Automation Enabled" />
          )}
        </div>
        <Badge className="bg-gray-700 text-white">
          {leads.length}
        </Badge>
      </div>

      {/* Stage Stats */}
      <div className="mb-4 p-2 bg-glass rounded text-center">
        <div className="text-sm text-glass-muted">Total Value</div>
        <div className="font-semibold text-glass-bright">${stats.totalValue.toLocaleString()}</div>
      </div>

      {/* Leads */}
      <div className="space-y-3 min-h-[400px]">
        {leads.map((lead) => (
          <LeadCard
            key={lead.id}
            lead={lead}
            onDragStart={onDragStart}
          />
        ))}
        
        {leads.length === 0 && (
          <div className="flex items-center justify-center h-20 border-2 border-dashed border-gray-600 rounded-lg text-glass-muted">
            Drop leads here
          </div>
        )}
      </div>
    </div>
  );
};

// Lead Card Component
const LeadCard = ({ lead, onDragStart }) => {
  const getLeadScoreColor = (score) => {
    if (score >= 80) return 'text-green-400';
    if (score >= 60) return 'text-yellow-400';
    return 'text-red-400';
  };

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleDateString();
  };

  return (
    <Card 
      className="glass-card cursor-move hover:scale-105 transition-transform duration-200"
      draggable
      onDragStart={(e) => onDragStart(e, lead)}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h4 className="font-semibold text-glass-bright">
              {lead.first_name} {lead.last_name}
            </h4>
            <p className="text-sm text-glass-muted">{lead.email}</p>
          </div>
          <div className="text-right">
            <div className={`text-sm font-semibold ${getLeadScoreColor(lead.lead_score)}`}>
              {lead.lead_score}%
            </div>
            <div className="text-xs text-glass-muted">Score</div>
          </div>
        </div>

        <div className="space-y-2 mb-3">
          <div className="flex items-center text-sm text-glass-muted">
            <Car className="w-4 h-4 mr-2" />
            {lead.vehicle_type} • {lead.budget}
          </div>
          <div className="flex items-center text-sm text-glass-muted">
            <Calendar className="w-4 h-4 mr-2" />
            Last contact: {formatTimestamp(lead.last_contact)}
          </div>
        </div>

        <div className="flex items-center justify-between">
          <Badge className="bg-blue-600 text-white text-xs">
            {lead.source}
          </Badge>
          <div className="flex gap-1">
            <Button size="sm" variant="outline" className="p-1">
              <Phone className="w-3 h-3" />
            </Button>
            <Button size="sm" variant="outline" className="p-1">
              <Mail className="w-3 h-3" />
            </Button>
            <Button size="sm" variant="outline" className="p-1">
              <MessageSquare className="w-3 h-3" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SalesPipeline;