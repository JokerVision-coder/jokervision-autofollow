import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { 
  Globe, Plus, Eye, Edit, Trash2, Copy, Settings, Palette, 
  Type, Image as ImageIcon, MousePointer, Layout, Smartphone,
  Monitor, Tablet, Code, Download, Upload, Link, BarChart3,
  Users, Mail, Phone, Car, DollarSign, Calendar, Zap,
  ChevronDown, ChevronUp, Save, Play
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

const API = process.env.REACT_APP_BACKEND_URL;

const WebsiteBuilder = () => {
  const [websites, setWebsites] = useState([]);
  const [selectedWebsite, setSelectedWebsite] = useState(null);
  const [showEditor, setShowEditor] = useState(false);
  const [loading, setLoading] = useState(true);
  const [templates, setTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState(null);

  useEffect(() => {
    fetchWebsites();
    fetchTemplates();
  }, []);

  const fetchWebsites = async () => {
    try {
      const response = await axios.get(`${API}/websites?tenant_id=default_dealership`);
      setWebsites(response.data.websites || []);
    } catch (error) {
      console.error('Error fetching websites:', error);
      toast.error('Failed to load websites');
    } finally {
      setLoading(false);
    }
  };

  const fetchTemplates = async () => {
    try {
      const response = await axios.get(`${API}/website/templates`);
      setTemplates(response.data.templates || []);
    } catch (error) {
      console.error('Error fetching templates:', error);
    }
  };

  const createWebsite = async (templateId = null) => {
    try {
      const websiteData = {
        tenant_id: 'default_dealership',
        name: `New Landing Page ${websites.length + 1}`,
        template_id: templateId,
        type: 'landing_page'
      };
      
      const response = await axios.post(`${API}/websites`, websiteData);
      setSelectedWebsite(response.data);
      setShowEditor(true);
      toast.success('Website created successfully!');
      fetchWebsites();
    } catch (error) {
      console.error('Error creating website:', error);
      toast.error('Failed to create website');
    }
  };

  const deleteWebsite = async (websiteId) => {
    try {
      await axios.delete(`${API}/websites/${websiteId}`);
      toast.success('Website deleted successfully!');
      fetchWebsites();
    } catch (error) {
      console.error('Error deleting website:', error);
      toast.error('Failed to delete website');
    }
  };

  const publishWebsite = async (websiteId) => {
    try {
      await axios.post(`${API}/websites/${websiteId}/publish`);
      toast.success('Website published successfully!');
      fetchWebsites();
    } catch (error) {
      console.error('Error publishing website:', error);
      toast.error('Failed to publish website');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="spinner-neon"></div>
      </div>
    );
  }

  if (showEditor && selectedWebsite) {
    return <WebsiteEditor website={selectedWebsite} onClose={() => {
      setShowEditor(false);
      setSelectedWebsite(null);
      fetchWebsites();
    }} />;
  }

  return (
    <div className="min-h-screen p-6">
      <div className="container mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-glass-bright mb-2">Website Builder</h1>
            <p className="text-glass-muted">Create landing pages and funnels to capture more leads</p>
          </div>
          
          <div className="flex gap-3">
            <Dialog>
              <DialogTrigger asChild>
                <Button className="btn-neon">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Website
                </Button>
              </DialogTrigger>
              <DialogContent className="modal-glass max-w-4xl">
                <DialogHeader>
                  <DialogTitle className="text-glass-bright">Choose a Template</DialogTitle>
                </DialogHeader>
                <TemplateSelector 
                  templates={templates} 
                  onSelect={(templateId) => createWebsite(templateId)}
                  onBlank={() => createWebsite()}
                />
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Website Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="glass-card">
            <CardContent className="p-6 text-center">
              <Globe className="w-8 h-8 mx-auto mb-2 neon-cyan" />
              <div className="text-2xl font-bold text-glass-bright">{websites.length}</div>
              <div className="text-sm text-glass-muted">Total Websites</div>
            </CardContent>
          </Card>
          
          <Card className="glass-card">
            <CardContent className="p-6 text-center">
              <Play className="w-8 h-8 mx-auto mb-2 neon-green" />
              <div className="text-2xl font-bold neon-green">
                {websites.filter(w => w.status === 'published').length}
              </div>
              <div className="text-sm text-glass-muted">Published</div>
            </CardContent>
          </Card>
          
          <Card className="glass-card">
            <CardContent className="p-6 text-center">
              <Users className="w-8 h-8 mx-auto mb-2 neon-purple" />
              <div className="text-2xl font-bold neon-purple">
                {websites.reduce((sum, w) => sum + (w.leads_captured || 0), 0)}
              </div>
              <div className="text-sm text-glass-muted">Leads Captured</div>
            </CardContent>
          </Card>
          
          <Card className="glass-card">
            <CardContent className="p-6 text-center">
              <BarChart3 className="w-8 h-8 mx-auto mb-2 neon-orange" />
              <div className="text-2xl font-bold neon-orange">
                {websites.reduce((sum, w) => sum + (w.conversion_rate || 0), 0).toFixed(1)}%
              </div>
              <div className="text-sm text-glass-muted">Avg Conversion</div>
            </CardContent>
          </Card>
        </div>

        {/* Website List */}
        <Card className="glass-card">
          <CardContent className="p-6">
            {websites.length === 0 ? (
              <div className="text-center py-12">
                <Globe className="w-16 h-16 mx-auto mb-4 text-glass-muted" />
                <h3 className="text-xl font-semibold text-glass-bright mb-2">No Websites Yet</h3>
                <p className="text-glass-muted mb-6">Create your first landing page to start capturing leads</p>
                <Button onClick={() => createWebsite()} className="btn-neon">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Your First Website
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {websites.map((website) => (
                  <WebsiteCard 
                    key={website.id}
                    website={website}
                    onEdit={(site) => {
                      setSelectedWebsite(site);
                      setShowEditor(true);
                    }}
                    onDelete={deleteWebsite}
                    onPublish={publishWebsite}
                  />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

// Template Selector Component
const TemplateSelector = ({ templates, onSelect, onBlank }) => {
  const defaultTemplates = [
    {
      id: 'blank',
      name: 'Blank Page',
      description: 'Start from scratch',
      category: 'Basic',
      preview_image: null,
      features: ['Custom Design', 'Full Control']
    },
    {
      id: 'auto_landing',
      name: 'Auto Dealership Landing',
      description: 'Perfect for showcasing vehicles and capturing leads',
      category: 'Automotive',
      preview_image: '/templates/auto-landing.jpg',
      features: ['Hero Section', 'Vehicle Showcase', 'Lead Form', 'Testimonials']
    },
    {
      id: 'promo_funnel',
      name: 'Promotional Funnel', 
      description: 'Multi-step funnel for special offers',
      category: 'Marketing',
      preview_image: '/templates/promo-funnel.jpg',
      features: ['Multi-Step Form', 'Countdown Timer', 'Social Proof', 'Mobile Optimized']
    },
    {
      id: 'service_landing',
      name: 'Service Department',
      description: 'Capture service appointments and maintenance leads',
      category: 'Automotive',
      preview_image: '/templates/service-landing.jpg',
      features: ['Service Booking', 'Maintenance Reminders', 'Contact Forms']
    }
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {defaultTemplates.map((template) => (
          <Card key={template.id} className="glass-card cursor-pointer hover:scale-105 transition-transform">
            <CardContent className="p-4">
              <div className="aspect-video bg-gradient-to-br from-gray-700 to-gray-800 rounded-lg mb-4 flex items-center justify-center">
                {template.preview_image ? (
                  <img 
                    src={template.preview_image} 
                    alt={template.name}
                    className="w-full h-full object-cover rounded-lg"
                  />
                ) : (
                  <div className="text-center text-gray-300">
                    <Layout className="w-12 h-12 mx-auto mb-2" />
                    <div className="text-sm">{template.name}</div>
                  </div>
                )}
              </div>
              
              <div className="mb-3">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="font-semibold text-glass-bright">{template.name}</h4>
                  <Badge className="badge-neon neon-blue text-xs">{template.category}</Badge>
                </div>
                <p className="text-sm text-glass-muted">{template.description}</p>
              </div>
              
              <div className="mb-4">
                <div className="flex flex-wrap gap-1">
                  {template.features.map((feature, idx) => (
                    <span key={idx} className="text-xs px-2 py-1 bg-gray-700 rounded text-gray-300">
                      {feature}
                    </span>
                  ))}
                </div>
              </div>
              
              <Button 
                onClick={() => template.id === 'blank' ? onBlank() : onSelect(template.id)}
                className="w-full btn-neon"
                size="sm"
              >
                Use Template
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

// Website Card Component
const WebsiteCard = ({ website, onEdit, onDelete, onPublish }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'published': return 'neon-green';
      case 'draft': return 'neon-orange';
      default: return 'text-glass-muted';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <Card className="glass-card hover:scale-105 transition-transform duration-200">
      <CardContent className="p-4">
        <div className="aspect-video bg-gradient-to-br from-gray-700 to-gray-800 rounded-lg mb-4 flex items-center justify-center relative overflow-hidden">
          {website.preview_image ? (
            <img 
              src={website.preview_image} 
              alt={website.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="text-center text-gray-300">
              <Globe className="w-12 h-12 mx-auto mb-2" />
              <div className="text-sm">{website.type?.replace('_', ' ')}</div>
            </div>
          )}
          
          <div className="absolute top-2 right-2">
            <Badge className={`badge-neon ${getStatusColor(website.status)}`}>
              {website.status?.toUpperCase()}
            </Badge>
          </div>
        </div>
        
        <div className="mb-3">
          <h4 className="font-semibold text-glass-bright mb-1">{website.name}</h4>
          <p className="text-sm text-glass-muted">{website.description || 'No description'}</p>
        </div>
        
        <div className="grid grid-cols-2 gap-2 text-sm text-glass-muted mb-4">
          <div>Views: {website.views || 0}</div>
          <div>Leads: {website.leads_captured || 0}</div>
          <div>Created: {formatDate(website.created_at)}</div>
          <div>Rate: {website.conversion_rate || 0}%</div>
        </div>
        
        <div className="flex gap-2">
          <Button size="sm" onClick={() => onEdit(website)} className="btn-neon flex-1">
            <Edit className="w-3 h-3 mr-1" />
            Edit
          </Button>
          
          {website.status === 'draft' ? (
            <Button size="sm" onClick={() => onPublish(website.id)} variant="outline" className="text-green-400">
              <Play className="w-3 h-3" />
            </Button>
          ) : (
            <Button size="sm" variant="outline" className="text-blue-400">
              <Eye className="w-3 h-3" />
            </Button>
          )}
          
          <Button size="sm" onClick={() => onDelete(website.id)} variant="outline" className="text-red-400">
            <Trash2 className="w-3 h-3" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

// Website Editor Component (Simplified for now)
const WebsiteEditor = ({ website, onClose }) => {
  const [websiteData, setWebsiteData] = useState(website);
  const [activeSection, setActiveSection] = useState('design');
  const [previewMode, setPreviewMode] = useState('desktop');

  const saveWebsite = async () => {
    try {
      await axios.put(`${API}/websites/${website.id}`, websiteData);
      toast.success('Website saved successfully!');
    } catch (error) {
      console.error('Error saving website:', error);
      toast.error('Failed to save website');
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex">
      {/* Editor Sidebar */}
      <div className="w-80 bg-glass backdrop-blur-lg border-r border-glass-muted p-4 overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-glass-bright">Website Editor</h3>
          <Button size="sm" onClick={onClose} variant="outline" className="text-glass-bright">
            ✕
          </Button>
        </div>
        
        <div className="space-y-4">
          <div>
            <Label className="text-glass">Website Name</Label>
            <Input 
              value={websiteData.name}
              onChange={(e) => setWebsiteData({...websiteData, name: e.target.value})}
              className="text-glass"
            />
          </div>
          
          <div>
            <Label className="text-glass">Description</Label>
            <Textarea 
              value={websiteData.description || ''}
              onChange={(e) => setWebsiteData({...websiteData, description: e.target.value})}
              className="text-glass"
              rows={3}
            />
          </div>
          
          <div className="space-y-2">
            <Button 
              onClick={() => setActiveSection('design')}
              variant={activeSection === 'design' ? 'default' : 'ghost'}
              className="w-full justify-start text-glass-bright"
            >
              <Palette className="w-4 h-4 mr-2" />
              Design
            </Button>
            
            <Button 
              onClick={() => setActiveSection('content')}
              variant={activeSection === 'content' ? 'default' : 'ghost'}
              className="w-full justify-start text-glass-bright"
            >
              <Type className="w-4 h-4 mr-2" />
              Content
            </Button>
            
            <Button 
              onClick={() => setActiveSection('forms')}
              variant={activeSection === 'forms' ? 'default' : 'ghost'}
              className="w-full justify-start text-glass-bright"
            >
              <Mail className="w-4 h-4 mr-2" />
              Lead Forms
            </Button>
            
            <Button 
              onClick={() => setActiveSection('settings')}
              variant={activeSection === 'settings' ? 'default' : 'ghost'}
              className="w-full justify-start text-glass-bright"
            >
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </Button>
          </div>
          
          <div className="pt-4 border-t border-glass-muted">
            <Button onClick={saveWebsite} className="w-full btn-neon">
              <Save className="w-4 h-4 mr-2" />
              Save Website
            </Button>
          </div>
        </div>
      </div>
      
      {/* Editor Main Area */}
      <div className="flex-1 flex flex-col">
        {/* Editor Toolbar */}
        <div className="bg-glass backdrop-blur-lg border-b border-glass-muted p-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h4 className="font-semibold text-glass-bright">Editing: {websiteData.name}</h4>
            <div className="flex gap-2">
              <Button 
                size="sm" 
                variant={previewMode === 'desktop' ? 'default' : 'ghost'}
                onClick={() => setPreviewMode('desktop')}
                className="text-glass-bright"
              >
                <Monitor className="w-4 h-4" />
              </Button>
              <Button 
                size="sm" 
                variant={previewMode === 'tablet' ? 'default' : 'ghost'}
                onClick={() => setPreviewMode('tablet')}
                className="text-glass-bright"
              >
                <Tablet className="w-4 h-4" />
              </Button>
              <Button 
                size="sm" 
                variant={previewMode === 'mobile' ? 'default' : 'ghost'}
                onClick={() => setPreviewMode('mobile')}
                className="text-glass-bright"
              >
                <Smartphone className="w-4 h-4" />
              </Button>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button size="sm" variant="outline" className="text-glass-bright">
              <Eye className="w-4 h-4 mr-1" />
              Preview
            </Button>
            <Button size="sm" className="btn-neon">
              <Play className="w-4 h-4 mr-1" />
              Publish
            </Button>
          </div>
        </div>
        
        {/* Website Preview Area */}
        <div className="flex-1 p-6 bg-gray-800">
          <div className={`mx-auto bg-white rounded-lg shadow-2xl ${
            previewMode === 'desktop' ? 'max-w-6xl' : 
            previewMode === 'tablet' ? 'max-w-2xl' : 'max-w-sm'
          }`}>
            <WebsitePreview website={websiteData} mode={previewMode} />
          </div>
        </div>
      </div>
    </div>
  );
};

// Website Preview Component
const WebsitePreview = ({ website, mode }) => {
  return (
    <div className="min-h-screen bg-white text-gray-900">
      {/* Sample Landing Page Preview */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-20">
        <div className="container mx-auto px-6 text-center">
          <h1 className="text-5xl font-bold mb-4">
            {website.name || 'Your Landing Page Title'}
          </h1>
          <p className="text-xl mb-8">
            {website.description || 'Capture more leads with our amazing automotive deals'}
          </p>
          <Button className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-3 text-lg">
            Get Started Today
          </Button>
        </div>
      </div>
      
      <div className="py-16">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <Car className="w-16 h-16 mx-auto mb-4 text-blue-600" />
              <h3 className="text-xl font-bold mb-2">Quality Vehicles</h3>
              <p className="text-gray-600">Find your perfect car from our extensive inventory</p>
            </div>
            <div className="text-center">
              <DollarSign className="w-16 h-16 mx-auto mb-4 text-green-600" />
              <h3 className="text-xl font-bold mb-2">Best Prices</h3>
              <p className="text-gray-600">Competitive pricing and financing options</p>
            </div>
            <div className="text-center">
              <Calendar className="w-16 h-16 mx-auto mb-4 text-purple-600" />
              <h3 className="text-xl font-bold mb-2">Easy Scheduling</h3>
              <p className="text-gray-600">Book test drives and appointments online</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Lead Capture Form */}
      <div className="bg-gray-100 py-16">
        <div className="container mx-auto px-6">
          <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow-lg">
            <h3 className="text-2xl font-bold mb-4 text-center">Get Your Quote Today</h3>
            <div className="space-y-4">
              <Input placeholder="Full Name" />
              <Input placeholder="Email Address" type="email" />
              <Input placeholder="Phone Number" type="tel" />
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Vehicle Interest" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sedan">Sedan</SelectItem>
                  <SelectItem value="suv">SUV</SelectItem>
                  <SelectItem value="truck">Truck</SelectItem>
                </SelectContent>
              </Select>
              <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                Submit
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WebsiteBuilder;