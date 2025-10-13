import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { 
  X, Mail, Phone, MessageSquare, Calendar, User, Tag,
  Clock, DollarSign, Car, MapPin, FileText, Settings,
  Bot, Mic, Send, CheckCircle2, AlertCircle, Zap
} from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const LeadDetailsModal = ({ lead, onClose, onUpdate }) => {
  const [activeTab, setActiveTab] = useState('details');
  const [smsMessage, setSmsMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [aiEnabled, setAiEnabled] = useState(lead.ai_communication_enabled || false);

  const handleSendSMS = async () => {
    if (!smsMessage.trim()) {
      toast.error('Please enter a message');
      return;
    }

    setSending(true);
    try {
      await axios.post(`${API}/sms/send`, {
        lead_id: lead.id,
        phone_number: lead.primary_phone,
        message: smsMessage,
        tenant_id: 'default_dealership'
      });
      
      toast.success('SMS sent successfully!');
      setSmsMessage('');
    } catch (error) {
      console.error('Error sending SMS:', error);
      toast.error('Failed to send SMS');
    } finally {
      setSending(false);
    }
  };

  const handleEnableAI = async (type) => {
    try {
      await axios.post(`${API}/leads/${lead.id}/enable-ai`, {
        ai_type: type, // 'sms' or 'voice' or 'both'
        tenant_id: 'default_dealership'
      });
      
      setAiEnabled(true);
      toast.success(`AI ${type} enabled for ${lead.first_name}!`);
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error('Error enabling AI:', error);
      toast.error('Failed to enable AI');
    }
  };

  const getSourceBadgeColor = (source) => {
    const colors = {
      'Mass Marketing Import': 'bg-purple-500/20 text-purple-400 border-purple-500/30',
      'Exclusive Lead Engine': 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      'Website': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      'Walk-In': 'bg-green-500/20 text-green-400 border-green-500/30',
      'manual': 'bg-gray-500/20 text-gray-400 border-gray-500/30'
    };
    return colors[source] || colors['manual'];
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-slate-900 to-purple-900 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden border border-purple-500/20">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600/20 to-blue-600/20 p-6 border-b border-purple-500/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
                <User className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">
                  {lead.first_name} {lead.last_name}
                </h2>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`px-2 py-1 rounded text-xs border ${getSourceBadgeColor(lead.source)}`}>
                    {lead.source}
                  </span>
                  <span className="px-2 py-1 rounded text-xs bg-blue-500/20 text-blue-400 border border-blue-500/30">
                    {lead.status}
                  </span>
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <X className="w-6 h-6 text-white" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 px-6 pt-4 border-b border-purple-500/20">
          <button
            onClick={() => setActiveTab('details')}
            className={`px-4 py-2 rounded-t-lg transition-colors ${
              activeTab === 'details'
                ? 'bg-purple-600 text-white'
                : 'text-gray-400 hover:bg-white/5'
            }`}
          >
            Details
          </button>
          <button
            onClick={() => setActiveTab('communicate')}
            className={`px-4 py-2 rounded-t-lg transition-colors ${
              activeTab === 'communicate'
                ? 'bg-purple-600 text-white'
                : 'text-gray-400 hover:bg-white/5'
            }`}
          >
            Communicate
          </button>
          <button
            onClick={() => setActiveTab('ai-setup')}
            className={`px-4 py-2 rounded-t-lg transition-colors ${
              activeTab === 'ai-setup'
                ? 'bg-purple-600 text-white'
                : 'text-gray-400 hover:bg-white/5'
            }`}
          >
            <Bot className="w-4 h-4 inline mr-2" />
            AI Setup
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {activeTab === 'details' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Contact Information */}
                <div className="bg-white/5 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                    <Phone className="w-5 h-5 text-purple-400" />
                    Contact Information
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-gray-300">
                      <Mail className="w-4 h-4 text-blue-400" />
                      {lead.email}
                    </div>
                    <div className="flex items-center gap-2 text-gray-300">
                      <Phone className="w-4 h-4 text-green-400" />
                      {lead.primary_phone}
                    </div>
                    {lead.alternate_phone && (
                      <div className="flex items-center gap-2 text-gray-300">
                        <Phone className="w-4 h-4 text-green-400" />
                        {lead.alternate_phone} (Alt)
                      </div>
                    )}
                  </div>
                </div>

                {/* Lead Details */}
                <div className="bg-white/5 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-purple-400" />
                    Lead Details
                  </h3>
                  <div className="space-y-2 text-sm">
                    {lead.budget && (
                      <div className="flex items-center gap-2 text-gray-300">
                        <DollarSign className="w-4 h-4 text-yellow-400" />
                        Budget: {lead.budget}
                      </div>
                    )}
                    {lead.vehicle_type && (
                      <div className="flex items-center gap-2 text-gray-300">
                        <Car className="w-4 h-4 text-blue-400" />
                        Interest: {lead.vehicle_type}
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-gray-300">
                      <Clock className="w-4 h-4 text-gray-400" />
                      Created: {new Date(lead.created_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </div>

              {/* Notes */}
              {lead.notes && (
                <div className="bg-white/5 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-white mb-2">Notes</h3>
                  <p className="text-gray-300 text-sm">{lead.notes}</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'communicate' && (
            <div className="space-y-6">
              {/* Quick Actions */}
              <div className="grid grid-cols-3 gap-4">
                <button className="bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 rounded-lg p-4 text-center transition-colors">
                  <MessageSquare className="w-6 h-6 text-blue-400 mx-auto mb-2" />
                  <div className="text-sm text-white">Send SMS</div>
                </button>
                <button className="bg-green-500/20 hover:bg-green-500/30 border border-green-500/30 rounded-lg p-4 text-center transition-colors">
                  <Phone className="w-6 h-6 text-green-400 mx-auto mb-2" />
                  <div className="text-sm text-white">Call</div>
                </button>
                <button className="bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/30 rounded-lg p-4 text-center transition-colors">
                  <Calendar className="w-6 h-6 text-purple-400 mx-auto mb-2" />
                  <div className="text-sm text-white">Schedule</div>
                </button>
              </div>

              {/* SMS Composer */}
              <div className="bg-white/5 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-white mb-3">Send SMS</h3>
                <textarea
                  value={smsMessage}
                  onChange={(e) => setSmsMessage(e.target.value)}
                  placeholder="Type your message..."
                  className="w-full bg-white/10 border border-purple-500/30 rounded-lg p-3 text-white placeholder-gray-400 min-h-[120px] focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <div className="flex justify-between items-center mt-3">
                  <span className="text-sm text-gray-400">
                    {smsMessage.length} characters
                  </span>
                  <button
                    onClick={handleSendSMS}
                    disabled={sending || !smsMessage.trim()}
                    className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-6 py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    {sending ? 'Sending...' : 'Send SMS'}
                    <Send className="w-4 h-4 inline ml-2" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'ai-setup' && (
            <div className="space-y-6">
              {/* AI Status */}
              <div className={`rounded-lg p-4 border ${
                aiEnabled 
                  ? 'bg-green-500/10 border-green-500/30' 
                  : 'bg-yellow-500/10 border-yellow-500/30'
              }`}>
                <div className="flex items-center gap-3">
                  {aiEnabled ? (
                    <CheckCircle2 className="w-6 h-6 text-green-400" />
                  ) : (
                    <AlertCircle className="w-6 h-6 text-yellow-400" />
                  )}
                  <div>
                    <h3 className="font-semibold text-white">
                      {aiEnabled ? 'AI Communication Enabled' : 'AI Communication Not Enabled'}
                    </h3>
                    <p className="text-sm text-gray-400">
                      {aiEnabled 
                        ? 'This lead will receive AI-powered responses' 
                        : 'Enable AI to automate communication with this lead'}
                    </p>
                  </div>
                </div>
              </div>

              {/* AI Options */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* SMS Bot */}
                <div className="bg-white/5 rounded-lg p-6 border border-purple-500/20 hover:border-purple-500/40 transition-all">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                      <MessageSquare className="w-6 h-6 text-blue-400" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-white">SMS AI Bot</h4>
                      <p className="text-xs text-gray-400">Auto-respond to texts</p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-300 mb-4">
                    AI will automatically respond to SMS messages from this lead using CRISP sales methodology.
                  </p>
                  <button
                    onClick={() => handleEnableAI('sms')}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg transition-colors"
                  >
                    <Zap className="w-4 h-4 inline mr-2" />
                    Enable SMS Bot
                  </button>
                </div>

                {/* Voice AI */}
                <div className="bg-white/5 rounded-lg p-6 border border-purple-500/20 hover:border-purple-500/40 transition-all">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center">
                      <Mic className="w-6 h-6 text-purple-400" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-white">Voice AI</h4>
                      <p className="text-xs text-gray-400">AI phone calls</p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-300 mb-4">
                    AI voice agent will handle phone calls with this lead professionally and book appointments.
                  </p>
                  <button
                    onClick={() => handleEnableAI('voice')}
                    className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 rounded-lg transition-colors"
                  >
                    <Zap className="w-4 h-4 inline mr-2" />
                    Enable Voice AI
                  </button>
                </div>
              </div>

              {/* Enable Both */}
              <button
                onClick={() => handleEnableAI('both')}
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white py-3 rounded-lg transition-all text-lg font-semibold"
              >
                <Bot className="w-5 h-5 inline mr-2" />
                Enable Both SMS & Voice AI
              </button>

              {/* AI Features */}
              <div className="bg-white/5 rounded-lg p-4">
                <h4 className="font-semibold text-white mb-3">AI Features Include:</h4>
                <ul className="space-y-2 text-sm text-gray-300">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-400 mt-0.5" />
                    CRISP sales methodology for effective communication
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-400 mt-0.5" />
                    Automatic appointment booking and scheduling
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-400 mt-0.5" />
                    Intelligent follow-up sequences
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-400 mt-0.5" />
                    24/7 instant response capability
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-400 mt-0.5" />
                    Lead qualification and scoring
                  </li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LeadDetailsModal;
