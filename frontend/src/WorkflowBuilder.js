import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { 
  Zap, Plus, Play, Pause, Edit, Trash2, Clock, Send, Phone, Mail,
  MessageSquare, GitBranch, Settings, Copy, Eye, BarChart3, Users,
  ArrowRight, ArrowDown, CheckCircle, AlertCircle, RefreshCw
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
const Textarea = ({ className = "", ...props }) => (
  <textarea className={`px-3 py-2 border rounded ${className}`} {...props} />
);
const Badge = ({ children, className = "" }) => <span className={`px-2 py-1 rounded text-xs ${className}`}>{children}</span>;

const WorkflowBuilder = () => {
  const [workflows, setWorkflows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showWorkflowModal, setShowWorkflowModal] = useState(false);
  const [selectedWorkflow, setSelectedWorkflow] = useState(null);
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    fetchWorkflows();
  }, []);

  const fetchWorkflows = async () => {
    try {
      const response = await axios.get(`${API}/workflows?tenant_id=default_dealership`);
      setWorkflows(response.data.workflows || []);
    } catch (error) {
      console.error('Error fetching workflows:', error);
      loadMockWorkflows();
    } finally {
      setLoading(false);
    }
  };

  const loadMockWorkflows = () => {
    setWorkflows([
      {
        id: 'wf_1',
        name: 'New Lead Follow-up',
        description: '3-step automated follow-up sequence for new leads',
        trigger: 'new_lead',
        active: true,
        total_runs: 234,
        success_rate: 78.5,
        steps: [
          { step_type: 'sms', delay_minutes: 5, content: 'Hi {name}! Thanks for your interest in Toyota. I\'m here to help you find the perfect vehicle.' },
          { step_type: 'wait', delay_minutes: 1440 },
          { step_type: 'email', delay_minutes: 0, content: 'Following up on your Toyota interest...' }
        ]
      },
      {
        id: 'wf_2',
        name: 'Appointment Reminder',
        description: 'Automated reminders before scheduled appointments',
        trigger: 'appointment_scheduled',
        active: true,
        total_runs: 156,
        success_rate: 91.2,
        steps: [
          { step_type: 'sms', delay_minutes: 1440, content: 'Reminder: You have an appointment tomorrow at {time} for your {vehicle} test drive.' },
          { step_type: 'sms', delay_minutes: 120, content: 'Your appointment is in 2 hours. See you soon!' }
        ]
      },
      {
        id: 'wf_3',
        name: 'Service Upsell',
        description: 'Follow-up sequence for service customers',
        trigger: 'service_completed',
        active: false,
        total_runs: 89,
        success_rate: 45.6,
        steps: [
          { step_type: 'wait', delay_minutes: 10080 }, // 1 week
          { step_type: 'email', delay_minutes: 0, content: 'How was your recent service experience?' },
          { step_type: 'wait', delay_minutes: 4320 }, // 3 days
          { step_type: 'sms', delay_minutes: 0, content: 'Don\'t forget about our current service specials!' }
        ]
      }
    ]);
  };

  const toggleWorkflow = async (workflowId, currentStatus) => {
    try {
      // Mock toggle
      setWorkflows(workflows.map(wf => 
        wf.id === workflowId ? { ...wf, active: !currentStatus } : wf
      ));
      toast.success(`Workflow ${!currentStatus ? 'activated' : 'deactivated'}`);
    } catch (error) {
      toast.error('Failed to update workflow');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="spinner-neon"></div>
      </div>
    );
  }

  const activeWorkflows = workflows.filter(wf => wf.active);
  const inactiveWorkflows = workflows.filter(wf => !wf.active);

  return (
    <div className="min-h-screen p-6">
      <div className="container mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-glass-bright mb-2">Workflow Builder</h1>
            <p className="text-glass-muted">Automate your sales process with smart follow-up sequences</p>
          </div>
          
          <div className="flex gap-3">
            <Button 
              onClick={() => setShowWorkflowModal(true)}
              className="btn-neon"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Workflow
            </Button>
            <Button onClick={fetchWorkflows} variant="outline" className="text-glass-bright">
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>

        {/* Workflow Statistics */}
        <WorkflowStats workflows={workflows} />

        {/* Tabs */}
        <div className="flex gap-4 mb-6">
          <Button
            onClick={() => setActiveTab('all')}
            className={`${activeTab === 'all' ? 'bg-purple-600 text-white' : 'text-glass-bright hover:bg-glass'}`}
          >
            <Zap className="w-4 h-4 mr-2" />
            All Workflows ({workflows.length})
          </Button>
          <Button
            onClick={() => setActiveTab('active')}
            className={`${activeTab === 'active' ? 'bg-purple-600 text-white' : 'text-glass-bright hover:bg-glass'}`}
          >
            <Play className="w-4 h-4 mr-2" />
            Active ({activeWorkflows.length})
          </Button>
          <Button
            onClick={() => setActiveTab('inactive')}
            className={`${activeTab === 'inactive' ? 'bg-purple-600 text-white' : 'text-glass-bright hover:bg-glass'}`}
          >
            <Pause className="w-4 h-4 mr-2" />
            Inactive ({inactiveWorkflows.length})
          </Button>
        </div>

        {/* Workflows List */}
        <div className="space-y-4">
          {(activeTab === 'all' ? workflows : 
            activeTab === 'active' ? activeWorkflows : inactiveWorkflows
          ).map(workflow => (
            <WorkflowCard 
              key={workflow.id} 
              workflow={workflow} 
              onToggle={toggleWorkflow}
              onEdit={(wf) => {
                setSelectedWorkflow(wf);
                setShowWorkflowModal(true);
              }}
              onView={setSelectedWorkflow}
            />
          ))}
        </div>

        {/* Workflow Details Modal */}
        {selectedWorkflow && !showWorkflowModal && (
          <WorkflowDetailsModal 
            workflow={selectedWorkflow}
            onClose={() => setSelectedWorkflow(null)}
            onEdit={() => setShowWorkflowModal(true)}
          />
        )}

        {/* Create/Edit Workflow Modal */}
        {showWorkflowModal && (
          <CreateWorkflowModal 
            workflow={selectedWorkflow}
            onClose={() => {
              setShowWorkflowModal(false);
              setSelectedWorkflow(null);
            }}
            onWorkflowCreated={(workflow) => {
              if (selectedWorkflow) {
                setWorkflows(workflows.map(wf => wf.id === workflow.id ? workflow : wf));
              } else {
                setWorkflows([workflow, ...workflows]);
              }
              setShowWorkflowModal(false);
              setSelectedWorkflow(null);
            }}
          />
        )}
      </div>
    </div>
  );
};

// Workflow Statistics Component
const WorkflowStats = ({ workflows }) => {
  const totalRuns = workflows.reduce((sum, wf) => sum + (wf.total_runs || 0), 0);
  const avgSuccessRate = workflows.length > 0 
    ? workflows.reduce((sum, wf) => sum + (wf.success_rate || 0), 0) / workflows.length 
    : 0;
  const activeCount = workflows.filter(wf => wf.active).length;

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <Card className="glass-card">
        <CardContent className="p-6 text-center">
          <Zap className="w-8 h-8 mx-auto mb-2 neon-purple" />
          <div className="text-2xl font-bold text-glass-bright">{workflows.length}</div>
          <div className="text-sm text-glass-muted">Total Workflows</div>
        </CardContent>
      </Card>
      
      <Card className="glass-card">
        <CardContent className="p-6 text-center">
          <Play className="w-8 h-8 mx-auto mb-2 neon-green" />
          <div className="text-2xl font-bold neon-green">{activeCount}</div>
          <div className="text-sm text-glass-muted">Active Workflows</div>
        </CardContent>
      </Card>
      
      <Card className="glass-card">
        <CardContent className="p-6 text-center">
          <Users className="w-8 h-8 mx-auto mb-2 neon-blue" />
          <div className="text-2xl font-bold neon-blue">{totalRuns.toLocaleString()}</div>
          <div className="text-sm text-glass-muted">Total Executions</div>
        </CardContent>
      </Card>
      
      <Card className="glass-card">
        <CardContent className="p-6 text-center">
          <BarChart3 className="w-8 h-8 mx-auto mb-2 neon-orange" />
          <div className="text-2xl font-bold neon-orange">{avgSuccessRate.toFixed(1)}%</div>
          <div className="text-sm text-glass-muted">Avg Success Rate</div>
        </CardContent>
      </Card>
    </div>
  );
};

// Workflow Card Component
const WorkflowCard = ({ workflow, onToggle, onEdit, onView }) => {
  const getStepIcon = (stepType) => {
    switch (stepType) {
      case 'sms': return <MessageSquare className="w-4 h-4" />;
      case 'email': return <Mail className="w-4 h-4" />;
      case 'call': return <Phone className="w-4 h-4" />;
      case 'wait': return <Clock className="w-4 h-4" />;
      default: return <Zap className="w-4 h-4" />;
    }
  };

  const getTriggerLabel = (trigger) => {
    switch (trigger) {
      case 'new_lead': return 'New Lead Created';
      case 'appointment_scheduled': return 'Appointment Scheduled';
      case 'service_completed': return 'Service Completed';
      case 'no_response': return 'No Response Received';
      default: return trigger;
    }
  };

  return (
    <Card className="glass-card hover:scale-105 transition-transform duration-200">
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h3 className="text-xl font-semibold text-glass-bright">{workflow.name}</h3>
              <Badge className={`${workflow.active ? 'bg-green-600 text-white' : 'bg-gray-600 text-white'}`}>
                {workflow.active ? (
                  <>
                    <Play className="w-3 h-3 mr-1" />
                    Active
                  </>
                ) : (
                  <>
                    <Pause className="w-3 h-3 mr-1" />
                    Inactive
                  </>
                )}
              </Badge>
            </div>
            
            <p className="text-glass-muted mb-3">{workflow.description}</p>
            
            <div className="text-sm text-glass-muted mb-4">
              <span className="font-medium">Trigger:</span> {getTriggerLabel(workflow.trigger)}
            </div>

            {/* Workflow Steps Preview */}
            <div className="flex items-center gap-2 mb-4">
              {workflow.steps?.slice(0, 4).map((step, index) => (
                <React.Fragment key={index}>
                  <div className="flex items-center gap-1 px-2 py-1 bg-glass-muted/20 rounded text-xs">
                    {getStepIcon(step.step_type)}
                    <span className="capitalize">{step.step_type}</span>
                  </div>
                  {index < Math.min(workflow.steps.length - 1, 3) && (
                    <ArrowRight className="w-3 h-3 text-glass-muted" />
                  )}
                </React.Fragment>
              ))}
              {workflow.steps?.length > 4 && (
                <span className="text-xs text-glass-muted">+{workflow.steps.length - 4} more</span>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-2 ml-4">
            <Button size="sm" onClick={() => onToggle(workflow.id, workflow.active)} 
              className={workflow.active ? 'bg-orange-600 text-white' : 'btn-neon'}>
              {workflow.active ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
            </Button>
            <Button size="sm" onClick={() => onEdit(workflow)} variant="outline" className="text-glass-bright">
              <Edit className="w-3 h-3" />
            </Button>
            <Button size="sm" onClick={() => onView(workflow)} variant="outline" className="text-glass-bright">
              <Eye className="w-3 h-3" />
            </Button>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-3 gap-4 pt-4 border-t border-glass-muted/20">
          <div className="text-center">
            <div className="text-lg font-bold text-glass-bright">{workflow.total_runs || 0}</div>
            <div className="text-xs text-glass-muted">Executions</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold neon-green">{workflow.success_rate || 0}%</div>
            <div className="text-xs text-glass-muted">Success Rate</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold neon-blue">{workflow.steps?.length || 0}</div>
            <div className="text-xs text-glass-muted">Steps</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Workflow Details Modal
const WorkflowDetailsModal = ({ workflow, onClose, onEdit }) => {
  const getStepIcon = (stepType) => {
    switch (stepType) {
      case 'sms': return <MessageSquare className="w-5 h-5" />;
      case 'email': return <Mail className="w-5 h-5" />;
      case 'call': return <Phone className="w-5 h-5" />;
      case 'wait': return <Clock className="w-5 h-5" />;
      default: return <Zap className="w-5 h-5" />;
    }
  };

  const getStepColor = (stepType) => {
    switch (stepType) {
      case 'sms': return 'bg-blue-600';
      case 'email': return 'bg-green-600';
      case 'call': return 'bg-orange-600';
      case 'wait': return 'bg-gray-600';
      default: return 'bg-purple-600';
    }
  };

  const formatDelay = (minutes) => {
    if (minutes === 0) return 'Immediately';
    if (minutes < 60) return `${minutes} minutes`;
    if (minutes < 1440) return `${Math.floor(minutes / 60)} hours`;
    return `${Math.floor(minutes / 1440)} days`;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="glass-card max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <CardContent className="p-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h3 className="text-2xl font-semibold text-glass-bright">{workflow.name}</h3>
              <p className="text-glass-muted mt-1">{workflow.description}</p>
            </div>
            <Button onClick={onClose} size="sm" variant="outline" className="text-glass-bright">
              ✕
            </Button>
          </div>

          {/* Workflow Steps */}
          <div className="mb-6">
            <h4 className="text-lg font-semibold text-glass-bright mb-4">Workflow Steps</h4>
            
            <div className="space-y-4">
              {workflow.steps?.map((step, index) => (
                <div key={index} className="flex items-start gap-4">
                  <div className="flex flex-col items-center">
                    <div className={`p-3 rounded-full ${getStepColor(step.step_type)} text-white`}>
                      {getStepIcon(step.step_type)}
                    </div>
                    {index < workflow.steps.length - 1 && (
                      <div className="w-px h-12 bg-glass-muted/30 mt-2"></div>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-glass-bright capitalize">{step.step_type}</span>
                      {step.delay_minutes > 0 && (
                        <Badge className="bg-glass-muted text-glass-bright">
                          Wait: {formatDelay(step.delay_minutes)}
                        </Badge>
                      )}
                    </div>
                    
                    {step.content && (
                      <div className="text-sm text-glass-muted bg-glass-muted/10 p-3 rounded">
                        {step.content}
                      </div>
                    )}
                    
                    {step.step_type === 'wait' && !step.content && (
                      <div className="text-sm text-glass-muted">
                        Wait for {formatDelay(step.delay_minutes)} before next step
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Statistics */}
          <div className="grid grid-cols-3 gap-4 mb-6 p-4 bg-glass-muted/5 rounded-lg">
            <div className="text-center">
              <div className="text-2xl font-bold text-glass-bright">{workflow.total_runs || 0}</div>
              <div className="text-sm text-glass-muted">Total Executions</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold neon-green">{workflow.success_rate || 0}%</div>
              <div className="text-sm text-glass-muted">Success Rate</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold neon-blue">{workflow.steps?.length || 0}</div>
              <div className="text-sm text-glass-muted">Total Steps</div>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button onClick={onEdit} className="btn-neon flex-1">
              <Edit className="w-4 h-4 mr-2" />
              Edit Workflow
            </Button>
            <Button variant="outline" className="text-glass-bright">
              <Copy className="w-4 h-4 mr-2" />
              Duplicate
            </Button>
            <Button variant="outline" className="text-glass-bright">
              <BarChart3 className="w-4 h-4 mr-2" />
              Analytics
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Create Workflow Modal (Simplified)
const CreateWorkflowModal = ({ workflow, onClose, onWorkflowCreated }) => {
  const [workflowData, setWorkflowData] = useState({
    name: workflow?.name || '',
    description: workflow?.description || '',
    trigger: workflow?.trigger || 'new_lead',
    active: workflow?.active || true
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Mock workflow creation
      const newWorkflow = {
        id: workflow?.id || `wf_${Date.now()}`,
        ...workflowData,
        total_runs: workflow?.total_runs || 0,
        success_rate: workflow?.success_rate || 0,
        steps: workflow?.steps || [
          { step_type: 'sms', delay_minutes: 5, content: 'Welcome! Thanks for your interest.' },
          { step_type: 'wait', delay_minutes: 1440 },
          { step_type: 'email', delay_minutes: 0, content: 'Following up on your inquiry...' }
        ]
      };
      
      toast.success(`Workflow ${workflow ? 'updated' : 'created'} successfully!`);
      onWorkflowCreated(newWorkflow);
    } catch (error) {
      toast.error('Failed to save workflow');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="glass-card max-w-2xl w-full mx-4">
        <CardContent className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-semibold text-glass-bright">
              {workflow ? 'Edit Workflow' : 'Create New Workflow'}
            </h3>
            <Button onClick={onClose} size="sm" variant="outline" className="text-glass-bright">
              ✕
            </Button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-glass-bright mb-1">Workflow Name</label>
              <Input
                value={workflowData.name}
                onChange={(e) => setWorkflowData({...workflowData, name: e.target.value})}
                placeholder="e.g., New Lead Follow-up"
                className="text-glass w-full"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-glass-bright mb-1">Description</label>
              <Textarea
                value={workflowData.description}
                onChange={(e) => setWorkflowData({...workflowData, description: e.target.value})}
                placeholder="Describe what this workflow does"
                className="text-glass w-full"
                rows={3}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-glass-bright mb-1">Trigger Event</label>
              <select 
                value={workflowData.trigger} 
                onChange={(e) => setWorkflowData({...workflowData, trigger: e.target.value})}
                className="px-3 py-2 border rounded w-full text-glass"
              >
                <option value="new_lead">New Lead Created</option>
                <option value="appointment_scheduled">Appointment Scheduled</option>
                <option value="service_completed">Service Completed</option>
                <option value="no_response">No Response Received</option>
              </select>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="active"
                checked={workflowData.active}
                onChange={(e) => setWorkflowData({...workflowData, active: e.target.checked})}
                className="mr-2"
              />
              <label htmlFor="active" className="text-sm text-glass-bright">
                Activate workflow immediately
              </label>
            </div>

            <div className="flex gap-3 pt-4">
              <Button type="submit" className="btn-neon flex-1">
                <Plus className="w-4 h-4 mr-2" />
                {workflow ? 'Update Workflow' : 'Create Workflow'}
              </Button>
              <Button type="button" onClick={onClose} variant="outline" className="text-glass-bright">
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default WorkflowBuilder;