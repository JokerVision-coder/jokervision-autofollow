import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { 
  Phone, PhoneCall, Mic, MicOff, Volume2, VolumeX, Settings, 
  Play, Pause, Square, Clock, Users, BarChart3, MessageSquare,
  Bot, Headphones, PhoneIncoming, PhoneOutgoing, Record, Brain
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

const VoiceIntegration = () => {
  const [activeTab, setActiveTab] = useState('calls');
  const [calls, setCalls] = useState([]);
  const [voiceSettings, setVoiceSettings] = useState({});
  const [callMetrics, setCallMetrics] = useState({});
  const [isRecording, setIsRecording] = useState(false);
  const [currentCall, setCurrentCall] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCalls();
    fetchVoiceSettings();
    fetchCallMetrics();
  }, []);

  const fetchCalls = async () => {
    try {
      const response = await axios.get(`${API}/voice/calls?tenant_id=default_dealership`);
      setCalls(response.data.calls || []);
    } catch (error) {
      console.error('Error fetching calls:', error);
      loadMockCalls();
    }
  };

  const fetchVoiceSettings = async () => {
    try {
      const response = await axios.get(`${API}/voice/settings?tenant_id=default_dealership`);
      setVoiceSettings(response.data || {});
    } catch (error) {
      console.error('Error fetching voice settings:', error);
      loadMockSettings();
    }
  };

  const fetchCallMetrics = async () => {
    try {
      const response = await axios.get(`${API}/voice/metrics?tenant_id=default_dealership`);
      setCallMetrics(response.data || {});
    } catch (error) {
      console.error('Error fetching metrics:', error);
      loadMockMetrics();
    } finally {
      setLoading(false);
    }
  };

  const loadMockCalls = () => {
    setCalls([
      {
        id: 'call_1',
        type: 'inbound',
        customer_name: 'Sarah Johnson',
        customer_phone: '+1-555-123-4567',
        duration: '4:32',
        status: 'completed',
        ai_summary: 'Customer interested in 2024 RAV4. Scheduled test drive for tomorrow at 2 PM.',
        lead_created: true,
        appointment_scheduled: true,
        timestamp: '2024-01-23T14:30:00Z',
        recording_url: 'https://example.com/recording1.mp3',
        sentiment: 'positive',
        keywords: ['RAV4', 'financing', 'test drive', 'trade-in']
      },
      {
        id: 'call_2',
        type: 'outbound',
        customer_name: 'Mike Chen',
        customer_phone: '+1-555-987-6543',
        duration: '2:45',
        status: 'completed',
        ai_summary: 'Follow-up call about service appointment. Customer confirmed appointment for oil change.',
        lead_created: false,
        appointment_scheduled: true,
        timestamp: '2024-01-23T11:15:00Z',
        recording_url: 'https://example.com/recording2.mp3',
        sentiment: 'neutral',
        keywords: ['service', 'oil change', 'appointment']
      },
      {
        id: 'call_3',
        type: 'ai_assistant',
        customer_name: 'Jennifer Lopez',
        customer_phone: '+1-555-456-7890',
        duration: '6:18',
        status: 'completed',
        ai_summary: 'AI handled initial inquiry about Camry pricing. Collected contact info and scheduled callback with human agent.',
        lead_created: true,
        appointment_scheduled: false,
        timestamp: '2024-01-23T09:45:00Z',
        recording_url: 'https://example.com/recording3.mp3',
        sentiment: 'positive',
        keywords: ['Camry', 'pricing', 'callback', 'financing options']
      }
    ]);
  };

  const loadMockSettings = () => {
    setVoiceSettings({
      ai_assistant_enabled: true,
      voice_model: 'openai_realtime',
      twilio_phone_number: '+1-555-DEALER1',
      call_recording: true,
      ai_transcription: true,
      auto_lead_creation: true,
      business_hours: {
        start: '09:00',
        end: '18:00',
        timezone: 'America/Chicago'
      },
      ai_personality: {
        name: 'Alex',
        style: 'professional_friendly',
        greeting: 'Hello! Thanks for calling Shottenkirk Toyota. How can I help you today?'
      }
    });
  };

  const loadMockMetrics = () => {
    setCallMetrics({
      total_calls: 156,
      inbound_calls: 89,
      outbound_calls: 45,
      ai_handled_calls: 22,
      avg_call_duration: '4:23',
      answer_rate: 87.3,
      conversion_rate: 23.5,
      appointments_scheduled: 34,
      leads_generated: 67,
      call_sentiment: {
        positive: 68,
        neutral: 24,
        negative: 8
      }
    });
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
            <h1 className="text-4xl font-bold text-glass-bright mb-2">Voice Integration</h1>
            <p className="text-glass-muted">AI-powered voice calls with Twilio & OpenAI Realtime API</p>
          </div>
          
          <div className="flex gap-3">
            <Button className="btn-neon">
              <PhoneCall className="w-4 h-4 mr-2" />
              Make Call
            </Button>
            <Button onClick={() => setActiveTab('settings')} variant="outline" className="text-glass-bright">
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </Button>
          </div>
        </div>

        {/* Call Metrics Overview */}
        <CallMetricsOverview metrics={callMetrics} />

        {/* Live Call Status */}
        {currentCall && <LiveCallStatus call={currentCall} />}

        {/* Tabs */}
        <div className="flex gap-4 mb-6">
          <Button
            onClick={() => setActiveTab('calls')}
            className={`${activeTab === 'calls' ? 'bg-purple-600 text-white' : 'text-glass-bright hover:bg-glass'}`}
          >
            <Phone className="w-4 h-4 mr-2" />
            Call History ({calls.length})
          </Button>
          <Button
            onClick={() => setActiveTab('ai-assistant')}
            className={`${activeTab === 'ai-assistant' ? 'bg-purple-600 text-white' : 'text-glass-bright hover:bg-glass'}`}
          >
            <Bot className="w-4 h-4 mr-2" />
            AI Assistant
          </Button>
          <Button
            onClick={() => setActiveTab('analytics')}
            className={`${activeTab === 'analytics' ? 'bg-purple-600 text-white' : 'text-glass-bright hover:bg-glass'}`}
          >
            <BarChart3 className="w-4 h-4 mr-2" />
            Analytics
          </Button>
          <Button
            onClick={() => setActiveTab('settings')}
            className={`${activeTab === 'settings' ? 'bg-purple-600 text-white' : 'text-glass-bright hover:bg-glass'}`}
          >
            <Settings className="w-4 h-4 mr-2" />
            Settings
          </Button>
        </div>

        {/* Content Area */}
        {activeTab === 'calls' && <CallsSection calls={calls} />}
        {activeTab === 'ai-assistant' && <AIAssistantSection settings={voiceSettings} />}
        {activeTab === 'analytics' && <VoiceAnalyticsSection metrics={callMetrics} calls={calls} />}
        {activeTab === 'settings' && <VoiceSettingsSection settings={voiceSettings} onUpdate={setVoiceSettings} />}
      </div>
    </div>
  );
};

// Call Metrics Overview Component
const CallMetricsOverview = ({ metrics }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <Card className="glass-card">
        <CardContent className="p-6 text-center">
          <Phone className="w-8 h-8 mx-auto mb-2 neon-blue" />
          <div className="text-2xl font-bold text-glass-bright">{metrics.total_calls || 0}</div>
          <div className="text-sm text-glass-muted">Total Calls</div>
        </CardContent>
      </Card>
      
      <Card className="glass-card">
        <CardContent className="p-6 text-center">
          <Clock className="w-8 h-8 mx-auto mb-2 neon-green" />
          <div className="text-2xl font-bold neon-green">{metrics.avg_call_duration || '0:00'}</div>
          <div className="text-sm text-glass-muted">Avg Duration</div>
        </CardContent>
      </Card>
      
      <Card className="glass-card">
        <CardContent className="p-6 text-center">
          <BarChart3 className="w-8 h-8 mx-auto mb-2 neon-orange" />
          <div className="text-2xl font-bold neon-orange">{metrics.conversion_rate || 0}%</div>
          <div className="text-sm text-glass-muted">Conversion Rate</div>
        </CardContent>
      </Card>
      
      <Card className="glass-card">
        <CardContent className="p-6 text-center">
          <Bot className="w-8 h-8 mx-auto mb-2 neon-purple" />
          <div className="text-2xl font-bold neon-purple">{metrics.ai_handled_calls || 0}</div>
          <div className="text-sm text-glass-muted">AI Handled</div>
        </CardContent>
      </Card>
    </div>
  );
};

// Live Call Status Component
const LiveCallStatus = ({ call }) => {
  return (
    <Card className="glass-card border-2 border-green-500 mb-6">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center">
              <Phone className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-glass-bright">Live Call in Progress</h3>
              <p className="text-glass-muted">{call.customer_name} - {call.customer_phone}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="text-green-400 font-mono text-lg">00:02:34</div>
            <Button size="sm" className="bg-red-600 text-white">
              <Square className="w-4 h-4 mr-1" />
              End Call
            </Button>
          </div>
        </div>
        
        <div className="mt-4 p-4 bg-glass-muted/10 rounded">
          <p className="text-sm text-glass-bright">
            <strong>AI Transcript:</strong> "Hello, I'm interested in learning more about your Toyota vehicles..."
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

// Calls Section Component
const CallsSection = ({ calls }) => {
  return (
    <div className="space-y-4">
      {calls.map((call) => (
        <CallCard key={call.id} call={call} />
      ))}
    </div>
  );
};

// Call Card Component
const CallCard = ({ call }) => {
  const getCallTypeIcon = (type) => {
    switch (type) {
      case 'inbound': return <PhoneIncoming className="w-5 h-5" />;
      case 'outbound': return <PhoneOutgoing className="w-5 h-5" />;
      case 'ai_assistant': return <Bot className="w-5 h-5" />;
      default: return <Phone className="w-5 h-5" />;
    }
  };

  const getCallTypeColor = (type) => {
    switch (type) {
      case 'inbound': return 'bg-green-600';
      case 'outbound': return 'bg-blue-600';
      case 'ai_assistant': return 'bg-purple-600';
      default: return 'bg-gray-600';
    }
  };

  const getSentimentColor = (sentiment) => {
    switch (sentiment) {
      case 'positive': return 'text-green-400';
      case 'neutral': return 'text-yellow-400';
      case 'negative': return 'text-red-400';
      default: return 'text-glass-muted';
    }
  };

  return (
    <Card className="glass-card hover:scale-105 transition-transform duration-200">
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-full ${getCallTypeColor(call.type)} text-white`}>
              {getCallTypeIcon(call.type)}
            </div>
            <div>
              <h3 className="text-lg font-semibold text-glass-bright">{call.customer_name}</h3>
              <p className="text-glass-muted">{call.customer_phone}</p>
              <p className="text-xs text-glass-muted">
                {new Date(call.timestamp).toLocaleDateString()} at {new Date(call.timestamp).toLocaleTimeString()}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Badge className={getSentimentColor(call.sentiment)}>
              {call.sentiment}
            </Badge>
            <Badge className="bg-glass-muted text-glass-bright">
              {call.duration}
            </Badge>
          </div>
        </div>

        <div className="mb-4">
          <h4 className="font-medium text-glass-bright mb-2">AI Summary:</h4>
          <p className="text-sm text-glass-muted">{call.ai_summary}</p>
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          {call.keywords?.map((keyword, index) => (
            <Badge key={index} className="bg-blue-600/20 text-blue-400 text-xs">
              {keyword}
            </Badge>
          ))}
        </div>

        <div className="flex justify-between items-center">
          <div className="flex gap-4 text-sm">
            {call.lead_created && (
              <span className="text-green-400">✓ Lead Created</span>
            )}
            {call.appointment_scheduled && (
              <span className="text-blue-400">📅 Appointment Scheduled</span>
            )}
          </div>
          
          <div className="flex gap-2">
            <Button size="sm" variant="outline" className="text-glass-bright">
              <Play className="w-3 h-3 mr-1" />
              Play Recording
            </Button>
            <Button size="sm" variant="outline" className="text-glass-bright">
              <MessageSquare className="w-3 h-3 mr-1" />
              Transcript
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// AI Assistant Section Component
const AIAssistantSection = ({ settings }) => {
  return (
    <div className="space-y-6">
      <Card className="glass-card">
        <CardContent className="p-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
              <Bot className="w-8 h-8 text-white" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-glass-bright">{settings.ai_personality?.name || 'AI Assistant'}</h3>
              <p className="text-glass-muted">Your AI-powered voice assistant for customer calls</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-glass-bright mb-3">Capabilities</h4>
              <ul className="space-y-2 text-sm text-glass-muted">
                <li className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-green-400" />
                  Answer incoming calls 24/7
                </li>
                <li className="flex items-center gap-2">
                  <Brain className="w-4 h-4 text-blue-400" />
                  Natural conversation with OpenAI Realtime
                </li>
                <li className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-purple-400" />
                  Real-time transcription and analysis
                </li>
                <li className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-orange-400" />
                  Automatic lead capture and qualification
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-glass-bright mb-3">Current Settings</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-glass-muted">Status:</span>
                  <Badge className={settings.ai_assistant_enabled ? 'bg-green-600 text-white' : 'bg-red-600 text-white'}>
                    {settings.ai_assistant_enabled ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-glass-muted">Voice Model:</span>
                  <span className="text-glass-bright">{settings.voice_model || 'OpenAI Realtime'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-glass-muted">Phone Number:</span>
                  <span className="text-glass-bright">{settings.twilio_phone_number || 'Not configured'}</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="glass-card">
        <CardContent className="p-6">
          <h4 className="font-semibold text-glass-bright mb-4">AI Training & Scripts</h4>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <h5 className="font-medium text-glass-bright mb-2">Greeting Script</h5>
              <div className="p-3 bg-glass-muted/10 rounded text-sm text-glass-muted">
                {settings.ai_personality?.greeting || 'Default greeting not configured'}
              </div>
            </div>
            <div>
              <h5 className="font-medium text-glass-bright mb-2">Knowledge Base</h5>
              <ul className="space-y-1 text-sm text-glass-muted">
                <li>• Vehicle inventory and pricing</li>
                <li>• Service department information</li>
                <li>• Financing options and rates</li>
                <li>• Dealership hours and location</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Voice Analytics Section Component
const VoiceAnalyticsSection = ({ metrics, calls }) => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Call Volume Chart */}
        <Card className="glass-card">
          <CardContent className="p-6">
            <h3 className="text-xl font-semibold text-glass-bright mb-4">Call Volume Trends</h3>
            <div className="h-64 flex items-center justify-center text-glass-muted">
              <BarChart3 className="w-16 h-16 mb-4" />
            </div>
            <p className="text-center text-glass-muted">Call volume analytics chart</p>
          </CardContent>
        </Card>

        {/* Sentiment Analysis */}
        <Card className="glass-card">
          <CardContent className="p-6">
            <h3 className="text-xl font-semibold text-glass-bright mb-4">Call Sentiment Analysis</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-glass-bright">Positive</span>
                <div className="flex items-center gap-2">
                  <div className="w-32 h-2 bg-glass-muted/20 rounded">
                    <div className="h-2 bg-green-500 rounded" style={{width: `${metrics.call_sentiment?.positive || 0}%`}}></div>
                  </div>
                  <span className="text-green-400 font-medium">{metrics.call_sentiment?.positive || 0}%</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-glass-bright">Neutral</span>
                <div className="flex items-center gap-2">
                  <div className="w-32 h-2 bg-glass-muted/20 rounded">
                    <div className="h-2 bg-yellow-500 rounded" style={{width: `${metrics.call_sentiment?.neutral || 0}%`}}></div>
                  </div>
                  <span className="text-yellow-400 font-medium">{metrics.call_sentiment?.neutral || 0}%</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-glass-bright">Negative</span>
                <div className="flex items-center gap-2">
                  <div className="w-32 h-2 bg-glass-muted/20 rounded">
                    <div className="h-2 bg-red-500 rounded" style={{width: `${metrics.call_sentiment?.negative || 0}%`}}></div>
                  </div>
                  <span className="text-red-400 font-medium">{metrics.call_sentiment?.negative || 0}%</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Metrics */}
      <Card className="glass-card">
        <CardContent className="p-6">
          <h3 className="text-xl font-semibold text-glass-bright mb-4">Performance Metrics</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold neon-green">{metrics.answer_rate || 0}%</div>
              <div className="text-sm text-glass-muted">Answer Rate</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold neon-blue">{metrics.appointments_scheduled || 0}</div>
              <div className="text-sm text-glass-muted">Appointments</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold neon-orange">{metrics.leads_generated || 0}</div>
              <div className="text-sm text-glass-muted">Leads Generated</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold neon-purple">{metrics.conversion_rate || 0}%</div>
              <div className="text-sm text-glass-muted">Conversion Rate</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Voice Settings Section Component
const VoiceSettingsSection = ({ settings, onUpdate }) => {
  const [localSettings, setLocalSettings] = useState(settings);

  const handleSave = () => {
    onUpdate(localSettings);
    toast.success('Voice settings updated successfully!');
  };

  return (
    <div className="space-y-6">
      <Card className="glass-card">
        <CardContent className="p-6">
          <h3 className="text-xl font-semibold text-glass-bright mb-4">AI Assistant Configuration</h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-glass-bright">Enable AI Assistant</h4>
                <p className="text-sm text-glass-muted">Allow AI to handle incoming calls automatically</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={localSettings.ai_assistant_enabled || false}
                  onChange={(e) => setLocalSettings({...localSettings, ai_assistant_enabled: e.target.checked})}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium text-glass-bright mb-1">AI Personality Name</label>
              <Input
                value={localSettings.ai_personality?.name || ''}
                onChange={(e) => setLocalSettings({
                  ...localSettings,
                  ai_personality: {...localSettings.ai_personality, name: e.target.value}
                })}
                placeholder="e.g., Alex"
                className="text-glass w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-glass-bright mb-1">Greeting Message</label>
              <textarea
                value={localSettings.ai_personality?.greeting || ''}
                onChange={(e) => setLocalSettings({
                  ...localSettings,
                  ai_personality: {...localSettings.ai_personality, greeting: e.target.value}
                })}
                placeholder="Hello! Thanks for calling..."
                className="px-3 py-2 border rounded w-full text-glass h-20"
              />
            </div>

            <Button onClick={handleSave} className="btn-neon">
              Save Settings
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="glass-card">
        <CardContent className="p-6">
          <h3 className="text-xl font-semibold text-glass-bright mb-4">Twilio Configuration</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-glass-bright mb-1">Phone Number</label>
              <Input
                value={localSettings.twilio_phone_number || ''}
                onChange={(e) => setLocalSettings({...localSettings, twilio_phone_number: e.target.value})}
                placeholder="+1-555-DEALER1"
                className="text-glass w-full"
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-glass-bright">Call Recording</h4>
                <p className="text-sm text-glass-muted">Record all calls for training and compliance</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={localSettings.call_recording || false}
                  onChange={(e) => setLocalSettings({...localSettings, call_recording: e.target.checked})}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
              </label>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default VoiceIntegration;