import React, { useState, useEffect } from 'react';
import { 
  Card, 
  CardContent,
  Button,
  Input,
  Badge,
  Textarea
} from './components/ui';
import { 
  MessageSquare, 
  Send, 
  Bot, 
  Zap, 
  Clock, 
  CheckCircle, 
  AlertTriangle,
  Phone,
  Mail,
  Facebook,
  MessageCircle,
  Search,
  Filter,
  Users,
  Target,
  TrendingUp,
  Sparkles,
  Brain,
  Lightbulb,
  Star,
  RefreshCw
} from 'lucide-react';

const AIInbox = () => {
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [aiResponse, setAiResponse] = useState(null);
  const [aiStats, setAiStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeChannel, setActiveChannel] = useState('all');
  const [autoResponseEnabled, setAutoResponseEnabled] = useState(true);

  useEffect(() => {
    loadAIInboxData();
    loadConversations();
  }, []);

  const loadAIInboxData = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/ai-inbox/stats`);
      if (response.ok) {
        const data = await response.json();
        setAiStats(data);
      }
    } catch (error) {
      console.error('Failed to load AI inbox stats:', error);
    }
  };

  const loadConversations = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/communications/conversations?tenant_id=default_dealership&channel=${activeChannel}`);
      if (response.ok) {
        const data = await response.json();
        setConversations(data.conversations || []);
      } else {
        // Use enhanced mock data with AI features
        setConversations([
          {
            id: "conv_1",
            contact: { name: "Sarah Johnson", phone: "+1-555-0123" },
            channel: "sms",
            last_message: "Hi, interested in the 2024 Toyota Camry. What's the pricing?",
            last_message_time: "2 min ago",
            unread_count: 2,
            status: "active",
            ai_score: 94,
            urgency: "high",
            next_action: "Send pricing info + schedule test drive"
          },
          {
            id: "conv_2",
            contact: { name: "Mike Rodriguez", email: "mike@email.com" },
            channel: "email",
            last_message: "What financing options do you have for pre-owned vehicles?",
            last_message_time: "15 min ago",
            unread_count: 0,
            status: "responded",
            ai_score: 76,
            urgency: "medium",
            next_action: "Follow up with financing calculator"
          },
          {
            id: "conv_3",
            contact: { name: "Jennifer Park", phone: "fb_user_456" },
            channel: "facebook",
            last_message: "Do you have Honda CR-V 2023 available? Need it urgent!",
            last_message_time: "1 hour ago",
            unread_count: 1,
            status: "urgent",
            ai_score: 91,
            urgency: "high",
            next_action: "Check inventory + immediate response"
          },
          {
            id: "conv_4",
            contact: { name: "Alex Thompson", phone: "+1-555-0789" },
            channel: "whatsapp",
            last_message: "Thanks for the info! Can we schedule a test drive for this weekend?",
            last_message_time: "2 hours ago",
            unread_count: 0,
            status: "scheduling",
            ai_score: 88,
            urgency: "medium",
            next_action: "Send calendar availability"
          }
        ]);
      }
    } catch (error) {
      console.error('Failed to load conversations:', error);
    }
  };

  const processMessageWithAI = async (messageContent, conversationData) => {
    try {
      setLoading(true);
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/ai-inbox/process-message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          conversation: conversationData,
          message_content: messageContent
        })
      });

      if (response.ok) {
        const result = await response.json();
        setAiResponse(result.ai_analysis);
        return result;
      }
    } catch (error) {
      console.error('Failed to process message with AI:', error);
    } finally {
      setLoading(false);
    }
  };

  const sendAIResponse = async (conversationId, responseText, channel, recipient) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/ai-inbox/auto-respond/${conversationId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          response_text: responseText,
          channel: channel,
          recipient: recipient
        })
      });

      if (response.ok) {
        const result = await response.json();
        // Add the AI response to the conversation
        setMessages(prev => [...prev, {
          id: result.delivery.message_id,
          content: responseText,
          sender: 'ai_bot',
          timestamp: result.delivery.sent_at,
          ai_generated: true
        }]);
        return result;
      }
    } catch (error) {
      console.error('Failed to send AI response:', error);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return;

    const messageData = {
      id: Date.now(),
      content: newMessage,
      sender: 'user',
      timestamp: new Date().toISOString(),
      ai_generated: false
    };

    setMessages(prev => [...prev, messageData]);
    
    // Process message with AI if auto-response is enabled
    if (autoResponseEnabled) {
      const aiResult = await processMessageWithAI(newMessage, selectedConversation);
      
      if (aiResult?.ai_analysis?.ai_response) {
        const aiResponseData = aiResult.ai_analysis.ai_response;
        
        // Automatically send AI response after a brief delay
        setTimeout(() => {
          sendAIResponse(
            selectedConversation.id,
            aiResponseData.response_text,
            selectedConversation.channel,
            selectedConversation.contact
          );
        }, 1500);
      }
    }

    setNewMessage('');
  };

  const getChannelIcon = (channel) => {
    switch (channel) {
      case 'sms': return <MessageSquare className="w-4 h-4" />;
      case 'email': return <Mail className="w-4 h-4" />;
      case 'facebook': return <Facebook className="w-4 h-4" />;
      case 'whatsapp': return <MessageCircle className="w-4 h-4" />;
      default: return <MessageSquare className="w-4 h-4" />;
    }
  };

  const getUrgencyColor = (urgency) => {
    switch (urgency) {
      case 'high': return 'text-red-400';
      case 'medium': return 'text-yellow-400';
      default: return 'text-green-400';
    }
  };

  const getScoreColor = (score) => {
    if (score >= 85) return 'text-green-400';
    if (score >= 70) return 'text-yellow-400';
    return 'text-red-400';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-800">
      {/* Header */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-pink-600/20"></div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                🤖 AI-Powered Unified Inbox
              </h1>
              <p className="text-gray-300 text-lg mt-2">
                Revolutionary automated response & campaign management system
              </p>
            </div>
            
            {/* AI Status */}
            <div className="flex items-center space-x-4">
              <div className={`flex items-center space-x-2 px-4 py-2 rounded-full border ${
                autoResponseEnabled 
                  ? 'bg-green-500/20 border-green-500/30 text-green-400' 
                  : 'bg-gray-500/20 border-gray-500/30 text-gray-400'
              }`}>
                <Bot className="w-4 h-4" />
                <span className="text-sm font-semibold">
                  {autoResponseEnabled ? 'AI Active' : 'AI Paused'}
                </span>
              </div>
              
              <Button
                onClick={() => setAutoResponseEnabled(!autoResponseEnabled)}
                className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                  autoResponseEnabled
                    ? 'bg-green-600 hover:bg-green-700 text-white'
                    : 'bg-gray-600 hover:bg-gray-700 text-white'
                }`}
              >
                {autoResponseEnabled ? 'Disable' : 'Enable'} AI
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* AI Stats Dashboard */}
        {aiStats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card className="bg-gradient-to-br from-green-600/20 to-green-800/20 border border-green-600/30">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-400 text-sm font-medium">Response Rate</p>
                    <p className="text-2xl font-bold text-white">{aiStats.ai_inbox_system?.auto_response_rate * 100}%</p>
                    <p className="text-green-400 text-xs">AI Automation Active</p>
                  </div>
                  <Zap className="w-8 h-8 text-green-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-blue-600/20 to-blue-800/20 border border-blue-600/30">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-400 text-sm font-medium">Avg Response Time</p>
                    <p className="text-2xl font-bold text-white">{aiStats.ai_inbox_system?.average_response_time}</p>
                    <p className="text-blue-400 text-xs">Lightning Fast</p>
                  </div>
                  <Clock className="w-8 h-8 text-blue-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-600/20 to-purple-800/20 border border-purple-600/30">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-400 text-sm font-medium">Conversion Boost</p>
                    <p className="text-2xl font-bold text-white">+{aiStats.performance_metrics?.conversion_improvement || '28%'}</p>
                    <p className="text-purple-400 text-xs">vs Manual Response</p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-purple-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-pink-600/20 to-pink-800/20 border border-pink-600/30">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-pink-400 text-sm font-medium">Satisfaction</p>
                    <p className="text-2xl font-bold text-white">{aiStats.performance_metrics?.customer_satisfaction || '4.8/5'}</p>
                    <p className="text-pink-400 text-xs">Customer Rating</p>
                  </div>
                  <Star className="w-8 h-8 text-pink-400" />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Conversations List */}
          <Card className="bg-gray-800/50 backdrop-blur-sm border border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-white">Conversations</h3>
                <Button
                  onClick={loadConversations}
                  size="sm"
                  variant="outline"
                  className="text-gray-300 border-gray-600 hover:bg-gray-700"
                >
                  <RefreshCw className="w-4 h-4" />
                </Button>
              </div>
              
              <div className="space-y-3">
                {conversations.map((conversation) => (
                  <div
                    key={conversation.id}
                    onClick={() => setSelectedConversation(conversation)}
                    className={`p-4 rounded-lg cursor-pointer transition-colors border ${
                      selectedConversation?.id === conversation.id
                        ? 'bg-purple-600/20 border-purple-600/30'
                        : 'bg-gray-700/30 border-gray-600/30 hover:bg-gray-700/50'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="flex items-center space-x-2">
                          {getChannelIcon(conversation.channel)}
                          <span className="text-white font-medium">
                            {conversation.contact.name}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        {conversation.ai_score && (
                          <Badge className={`text-xs ${getScoreColor(conversation.ai_score)} bg-transparent border`}>
                            {conversation.ai_score}
                          </Badge>
                        )}
                        
                        {conversation.unread_count > 0 && (
                          <Badge className="bg-red-600 text-white text-xs">
                            {conversation.unread_count}
                          </Badge>
                        )}
                      </div>
                    </div>
                    
                    <p className="text-gray-300 text-sm mt-2 line-clamp-2">
                      {conversation.last_message}
                    </p>
                    
                    <div className="flex items-center justify-between mt-3">
                      <span className="text-gray-500 text-xs">
                        {conversation.last_message_time}
                      </span>
                      
                      {conversation.urgency && (
                        <span className={`text-xs font-medium ${getUrgencyColor(conversation.urgency)}`}>
                          {conversation.urgency.toUpperCase()}
                        </span>
                      )}
                    </div>
                    
                    {conversation.next_action && (
                      <div className="mt-2 p-2 bg-blue-600/20 rounded-lg border border-blue-600/30">
                        <div className="flex items-center space-x-2">
                          <Lightbulb className="w-3 h-3 text-blue-400" />
                          <span className="text-blue-400 text-xs font-medium">
                            AI Suggestion: {conversation.next_action}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Chat Interface */}
          <div className="lg:col-span-2">
            <Card className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 h-[600px] flex flex-col">
              <CardContent className="p-6 flex-1 flex flex-col">
                
                {selectedConversation ? (
                  <>
                    {/* Chat Header */}
                    <div className="flex items-center justify-between pb-4 border-b border-gray-700">
                      <div className="flex items-center space-x-3">
                        {getChannelIcon(selectedConversation.channel)}
                        <div>
                          <h3 className="text-lg font-bold text-white">
                            {selectedConversation.contact.name}
                          </h3>
                          <p className="text-gray-400 text-sm">
                            {selectedConversation.contact.phone || selectedConversation.contact.email}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        {selectedConversation.ai_score && (
                          <Badge className={`${getScoreColor(selectedConversation.ai_score)} bg-transparent border`}>
                            AI Score: {selectedConversation.ai_score}
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto py-4 space-y-4">
                      {messages.length > 0 ? messages.map((message) => (
                        <div
                          key={message.id}
                          className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                              message.sender === 'user'
                                ? 'bg-purple-600 text-white'
                                : message.ai_generated
                                ? 'bg-blue-600/20 border border-blue-600/30 text-blue-100'
                                : 'bg-gray-700 text-white'
                            }`}
                          >
                            {message.ai_generated && (
                              <div className="flex items-center space-x-1 mb-1">
                                <Bot className="w-3 h-3 text-blue-400" />
                                <span className="text-blue-400 text-xs font-medium">AI Response</span>
                              </div>
                            )}
                            <p className="text-sm">{message.content}</p>
                            <p className="text-xs opacity-70 mt-1">
                              {new Date(message.timestamp).toLocaleTimeString()}
                            </p>
                          </div>
                        </div>
                      )) : (
                        <div className="flex-1 flex items-center justify-center">
                          <div className="text-center">
                            <MessageSquare className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                            <p className="text-gray-400">Select a conversation to view messages</p>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* AI Response Preview */}
                    {aiResponse && (
                      <div className="mb-4 p-4 bg-green-600/20 border border-green-600/30 rounded-lg">
                        <div className="flex items-center space-x-2 mb-2">
                          <Sparkles className="w-4 h-4 text-green-400" />
                          <span className="text-green-400 font-medium text-sm">AI Generated Response</span>
                          <Badge className="bg-green-600/30 text-green-300 text-xs">
                            {Math.round(aiResponse.ai_response?.confidence * 100)}% Confidence
                          </Badge>
                        </div>
                        <p className="text-green-100 text-sm">
                          {aiResponse.ai_response?.response_text}
                        </p>
                        
                        <div className="flex items-center justify-between mt-3">
                          <div className="flex items-center space-x-4 text-xs">
                            <span className="text-green-400">
                              Intent: {aiResponse.message_analysis?.primary_intent}
                            </span>
                            <span className="text-green-400">
                              Urgency: {aiResponse.ai_response?.urgency_level}
                            </span>
                          </div>
                          
                          <Button
                            onClick={() => {
                              sendAIResponse(
                                selectedConversation.id,
                                aiResponse.ai_response?.response_text,
                                selectedConversation.channel,
                                selectedConversation.contact
                              );
                              setAiResponse(null);
                            }}
                            size="sm"
                            className="bg-green-600 hover:bg-green-700 text-white"
                          >
                            Send AI Response
                          </Button>
                        </div>
                      </div>
                    )}

                    {/* Message Input */}
                    <div className="flex items-center space-x-2">
                      <Textarea
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type your message..."
                        className="flex-1 bg-gray-700 border-gray-600 text-white placeholder-gray-400 resize-none"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleSendMessage();
                          }
                        }}
                      />
                      <Button
                        onClick={handleSendMessage}
                        disabled={!newMessage.trim() || loading}
                        className="bg-purple-600 hover:bg-purple-700 text-white"
                      >
                        {loading ? (
                          <RefreshCw className="w-4 h-4 animate-spin" />
                        ) : (
                          <Send className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  </>
                ) : (
                  <div className="flex-1 flex items-center justify-center">
                    <div className="text-center">
                      <Brain className="w-20 h-20 text-gray-600 mx-auto mb-6" />
                      <h3 className="text-xl font-bold text-white mb-2">
                        AI-Powered Communications
                      </h3>
                      <p className="text-gray-400 mb-6">
                        Select a conversation to start intelligent automated responses
                      </p>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="bg-purple-600/20 p-3 rounded-lg">
                          <CheckCircle className="w-5 h-5 text-purple-400 mx-auto mb-2" />
                          <p className="text-purple-300">Auto-Response</p>
                        </div>
                        <div className="bg-blue-600/20 p-3 rounded-lg">
                          <Target className="w-5 h-5 text-blue-400 mx-auto mb-2" />
                          <p className="text-blue-300">Intent Detection</p>
                        </div>
                        <div className="bg-green-600/20 p-3 rounded-lg">
                          <Users className="w-5 h-5 text-green-400 mx-auto mb-2" />
                          <p className="text-green-300">Lead Scoring</p>
                        </div>
                        <div className="bg-yellow-600/20 p-3 rounded-lg">
                          <Zap className="w-5 h-5 text-yellow-400 mx-auto mb-2" />
                          <p className="text-yellow-300">Smart Campaigns</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIInbox;