import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { 
  MessageSquare, Phone, Mail, Video, Send, Paperclip, Search,
  Filter, Archive, Star, MoreVertical, Clock, CheckCircle2,
  Facebook, Instagram, Chrome, Smartphone, MessageCircle,
  Calendar, User, Tag, Zap, RefreshCw, Bell, Volume2
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
const Textarea = ({ className = "", ...props }) => (
  <textarea className={`px-3 py-2 border rounded ${className}`} {...props} />
);
const Badge = ({ children, className = "" }) => <span className={`px-2 py-1 rounded text-xs ${className}`}>{children}</span>;

const Communications = () => {
  const [activeChannel, setActiveChannel] = useState('all');
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchConversations();
  }, [activeChannel]);

  const fetchConversations = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API}/communications/conversations?tenant_id=default_dealership&channel=${activeChannel}`);
      setConversations(response.data.conversations || []);
    } catch (error) {
      console.error('Error fetching conversations:', error);
      toast.error('Failed to load conversations');
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (conversationId) => {
    try {
      const response = await axios.get(`${API}/communications/conversations/${conversationId}/messages`);
      setMessages(response.data.messages || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast.error('Failed to load messages');
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return;

    try {
      await axios.post(`${API}/communications/conversations/${selectedConversation.id}/messages`, {
        content: newMessage,
        type: 'outbound'
      });
      
      setNewMessage('');
      fetchMessages(selectedConversation.id);
      toast.success('Message sent!');
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    }
  };

  const getChannelIcon = (channel) => {
    switch (channel) {
      case 'sms': return <MessageSquare className="w-4 h-4" />;
      case 'email': return <Mail className="w-4 h-4" />;
      case 'facebook': return <Facebook className="w-4 h-4" />;
      case 'instagram': return <Instagram className="w-4 h-4" />;
      case 'whatsapp': return <MessageCircle className="w-4 h-4" />;
      case 'phone': return <Phone className="w-4 h-4" />;
      case 'google': return <Chrome className="w-4 h-4" />;
      default: return <MessageSquare className="w-4 h-4" />;
    }
  };

  const getChannelColor = (channel) => {
    switch (channel) {
      case 'sms': return 'bg-blue-600';
      case 'email': return 'bg-red-600';
      case 'facebook': return 'bg-blue-800';
      case 'instagram': return 'bg-pink-600';
      case 'whatsapp': return 'bg-green-600';
      case 'phone': return 'bg-purple-600';
      case 'google': return 'bg-yellow-600';
      default: return 'bg-gray-600';
    }
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
            <h1 className="text-4xl font-bold text-glass-bright mb-2">Communications Hub</h1>
            <p className="text-glass-muted">Unified inbox for all customer communications</p>
          </div>
          
          <div className="flex gap-3">
            <Button className="btn-neon">
              <Bell className="w-4 h-4 mr-2" />
              Notifications
            </Button>
            <Button onClick={fetchConversations} variant="outline" className="text-glass-bright">
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-12 gap-6 h-[calc(100vh-200px)]">
          {/* Channel Sidebar */}
          <div className="col-span-2">
            <ChannelSidebar 
              activeChannel={activeChannel}
              onChannelChange={setActiveChannel}
            />
          </div>

          {/* Conversations List */}
          <div className="col-span-4">
            <ConversationsList 
              conversations={conversations}
              selectedConversation={selectedConversation}
              onSelectConversation={(conv) => {
                setSelectedConversation(conv);
                fetchMessages(conv.id);
              }}
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              getChannelIcon={getChannelIcon}
              getChannelColor={getChannelColor}
            />
          </div>

          {/* Messages Area */}
          <div className="col-span-6">
            {selectedConversation ? (
              <MessagesArea 
                conversation={selectedConversation}
                messages={messages}
                newMessage={newMessage}
                onMessageChange={setNewMessage}
                onSendMessage={sendMessage}
                getChannelIcon={getChannelIcon}
                getChannelColor={getChannelColor}
              />
            ) : (
              <EmptyMessagesArea />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Channel Sidebar Component
const ChannelSidebar = ({ activeChannel, onChannelChange }) => {
  const channels = [
    { id: 'all', name: 'All Channels', icon: <MessageSquare className="w-5 h-5" />, count: 24 },
    { id: 'sms', name: 'SMS', icon: <Smartphone className="w-5 h-5" />, count: 8 },
    { id: 'email', name: 'Email', icon: <Mail className="w-5 h-5" />, count: 6 },
    { id: 'facebook', name: 'Facebook', icon: <Facebook className="w-5 h-5" />, count: 4 },
    { id: 'instagram', name: 'Instagram DM', icon: <Instagram className="w-5 h-5" />, count: 3 },
    { id: 'whatsapp', name: 'WhatsApp', icon: <MessageCircle className="w-5 h-5" />, count: 2 },
    { id: 'phone', name: 'Phone Calls', icon: <Phone className="w-5 h-5" />, count: 1 },
    { id: 'google', name: 'Google Messages', icon: <Chrome className="w-5 h-5" />, count: 0 }
  ];

  return (
    <Card className="glass-card h-full">
      <CardContent className="p-4">
        <h3 className="text-lg font-semibold text-glass-bright mb-4">Channels</h3>
        <div className="space-y-2">
          {channels.map((channel) => (
            <button
              key={channel.id}
              onClick={() => onChannelChange(channel.id)}
              className={`w-full flex items-center justify-between p-3 rounded-lg transition-colors ${
                activeChannel === channel.id 
                  ? 'bg-purple-600 text-white' 
                  : 'text-glass-bright hover:bg-glass'
              }`}
            >
              <div className="flex items-center">
                {channel.icon}
                <span className="ml-3 text-sm font-medium">{channel.name}</span>
              </div>
              {channel.count > 0 && (
                <Badge className="bg-red-600 text-white text-xs">
                  {channel.count}
                </Badge>
              )}
            </button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

// Conversations List Component
const ConversationsList = ({ 
  conversations, 
  selectedConversation, 
  onSelectConversation, 
  searchTerm, 
  onSearchChange,
  getChannelIcon,
  getChannelColor 
}) => {
  const mockConversations = [
    {
      id: 1,
      contact: { name: 'Sarah Johnson', phone: '+1-555-0123' },
      channel: 'sms',
      last_message: 'Interested in the 2025 Camry',
      last_message_time: '2 min ago',
      unread_count: 2,
      status: 'active'
    },
    {
      id: 2,
      contact: { name: 'Mike Rodriguez', email: 'mike@email.com' },
      channel: 'email',
      last_message: 'What financing options do you have?',
      last_message_time: '15 min ago',
      unread_count: 0,
      status: 'active'
    },
    {
      id: 3,
      contact: { name: 'Facebook User', phone: 'fb_user_123' },
      channel: 'facebook',
      last_message: 'Do you have RAV4 in stock?',
      last_message_time: '1 hour ago',
      unread_count: 1,
      status: 'active'
    },
    {
      id: 4,
      contact: { name: 'Jennifer Chen', phone: '+1-555-0456' },
      channel: 'whatsapp',
      last_message: 'Can we schedule a test drive?',
      last_message_time: '2 hours ago',
      unread_count: 0,
      status: 'active'
    }
  ];

  const displayConversations = conversations.length > 0 ? conversations : mockConversations;

  return (
    <Card className="glass-card h-full">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-glass-bright">Conversations</h3>
          <Button size="sm" variant="outline" className="text-glass-bright">
            <Filter className="w-4 h-4" />
          </Button>
        </div>
        
        <div className="mb-4">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-glass-muted" />
            <Input
              placeholder="Search conversations..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10 text-glass"
            />
          </div>
        </div>

        <div className="space-y-2 overflow-y-auto max-h-[calc(100vh-350px)]">
          {displayConversations.map((conversation) => (
            <ConversationItem
              key={conversation.id}
              conversation={conversation}
              isSelected={selectedConversation?.id === conversation.id}
              onSelect={() => onSelectConversation(conversation)}
              getChannelIcon={getChannelIcon}
              getChannelColor={getChannelColor}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

// Conversation Item Component
const ConversationItem = ({ 
  conversation, 
  isSelected, 
  onSelect, 
  getChannelIcon, 
  getChannelColor 
}) => {
  return (
    <div
      onClick={onSelect}
      className={`p-3 rounded-lg cursor-pointer transition-colors ${
        isSelected 
          ? 'bg-purple-600 text-white' 
          : 'text-glass-bright hover:bg-glass'
      }`}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center">
          <div className={`p-1 rounded-full ${getChannelColor(conversation.channel)} text-white mr-3`}>
            {getChannelIcon(conversation.channel)}
          </div>
          <div className="font-medium">{conversation.contact.name}</div>
        </div>
        <div className="flex items-center">
          {conversation.unread_count > 0 && (
            <Badge className="bg-red-600 text-white text-xs mr-2">
              {conversation.unread_count}
            </Badge>
          )}
          <span className="text-xs text-glass-muted">{conversation.last_message_time}</span>
        </div>
      </div>
      <div className="text-sm text-glass-muted truncate">
        {conversation.last_message}
      </div>
    </div>
  );
};

// Messages Area Component
const MessagesArea = ({ 
  conversation, 
  messages, 
  newMessage, 
  onMessageChange, 
  onSendMessage,
  getChannelIcon,
  getChannelColor 
}) => {
  const mockMessages = [
    {
      id: 1,
      content: 'Hi, I\'m interested in the 2025 Toyota Camry. Do you have any in stock?',
      type: 'inbound',
      timestamp: '2024-01-07T10:30:00Z',
      sender: conversation.contact.name
    },
    {
      id: 2,
      content: 'Hello! Yes, we have several 2025 Camry models available. What trim level are you interested in?',
      type: 'outbound',
      timestamp: '2024-01-07T10:32:00Z',
      sender: 'You'
    },
    {
      id: 3,
      content: 'I\'m looking for something with good fuel economy and safety features.',
      type: 'inbound',
      timestamp: '2024-01-07T10:35:00Z',
      sender: conversation.contact.name
    }
  ];

  const displayMessages = messages.length > 0 ? messages : mockMessages;

  return (
    <Card className="glass-card h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-glass-muted">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className={`p-2 rounded-full ${getChannelColor(conversation.channel)} text-white mr-3`}>
              {getChannelIcon(conversation.channel)}
            </div>
            <div>
              <h3 className="font-semibold text-glass-bright">{conversation.contact.name}</h3>
              <p className="text-sm text-glass-muted">{conversation.contact.phone || conversation.contact.email}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" className="text-glass-bright">
              <Phone className="w-4 h-4" />
            </Button>
            <Button size="sm" variant="outline" className="text-glass-bright">
              <Calendar className="w-4 h-4" />
            </Button>
            <Button size="sm" variant="outline" className="text-glass-bright">
              <MoreVertical className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 p-4 overflow-y-auto">
        <div className="space-y-4">
          {displayMessages.map((message) => (
            <MessageBubble key={message.id} message={message} />
          ))}
        </div>
      </div>

      {/* Message Input */}
      <div className="p-4 border-t border-glass-muted">
        <div className="flex gap-3">
          <div className="flex-1 flex gap-2">
            <Input
              placeholder={`Send a ${conversation.channel} message...`}
              value={newMessage}
              onChange={(e) => onMessageChange(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && onSendMessage()}
              className="flex-1 text-glass"
            />
            <Button variant="outline" className="text-glass-bright">
              <Paperclip className="w-4 h-4" />
            </Button>
          </div>
          <Button onClick={onSendMessage} className="btn-neon">
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
};

// Message Bubble Component
const MessageBubble = ({ message }) => {
  const isOutbound = message.type === 'outbound';
  
  return (
    <div className={`flex ${isOutbound ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
        isOutbound 
          ? 'bg-purple-600 text-white' 
          : 'bg-glass text-glass-bright'
      }`}>
        <p className="text-sm">{message.content}</p>
        <p className={`text-xs mt-1 ${isOutbound ? 'text-purple-200' : 'text-glass-muted'}`}>
          {new Date(message.timestamp).toLocaleTimeString()}
        </p>
      </div>
    </div>
  );
};

// Empty Messages Area Component
const EmptyMessagesArea = () => {
  return (
    <Card className="glass-card h-full flex items-center justify-center">
      <div className="text-center">
        <MessageSquare className="w-16 h-16 mx-auto mb-4 text-glass-muted" />
        <h3 className="text-xl font-semibold text-glass-bright mb-2">Select a Conversation</h3>
        <p className="text-glass-muted">Choose a conversation from the list to start messaging</p>
      </div>
    </Card>
  );
};

export default Communications;