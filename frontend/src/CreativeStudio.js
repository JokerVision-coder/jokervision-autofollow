import React, { useState, useEffect, useCallback } from 'react';
import { isMobile, isTablet, isDesktop } from 'react-device-detect';
import { useDropzone } from 'react-dropzone';
import * as XLSX from 'xlsx';
import Papa from 'papaparse';
import axios from 'axios';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './components/ui/card';
import { Button } from './components/ui/button';
import { Input } from './components/ui/input';
import { Label } from './components/ui/label';
import { Textarea } from './components/ui/textarea';
import { Badge } from './components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './components/ui/select';
import { toast } from 'sonner';
import { 
  Palette, Wand2, TrendingUp, Hash, Calendar, BarChart3, Upload, 
  FileImage, FileVideo, FileText, Folder, Download, Eye, Copy,
  Smartphone, Monitor, Tablet, Sparkles, Target, Lightbulb,
  Camera, Video, Music, Type, Layout, Zap, Star, Globe
} from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Responsive Layout Component
const ResponsiveLayout = ({ children, sidebar, header }) => {
  if (isMobile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        {header}
        <div className="p-4">
          {children}
        </div>
        {sidebar && (
          <div className="fixed bottom-0 left-0 right-0 bg-glass p-4 border-t border-glass-muted">
            {sidebar}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {header}
      <div className="flex">
        {sidebar && (
          <div className="w-80 bg-glass backdrop-blur-lg border-r border-glass-muted p-6 min-h-screen">
            {sidebar}
          </div>
        )}
        <div className="flex-1 p-6">
          {children}
        </div>
      </div>
    </div>
  );
};

// Creative Studio Main Component
const CreativeStudio = () => {
  const [activeTab, setActiveTab] = useState('templates');
  const [templates, setTemplates] = useState([]);
  const [contentIdeas, setContentIdeas] = useState([]);
  const [hashtagSuggestions, setHashtagSuggestions] = useState([]);
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchTemplates = async () => {
    try {
      const response = await axios.get(`${API}/creative/templates?tenant_id=default`);
      setTemplates([...response.data.custom_templates, ...response.data.builtin_templates]);
    } catch (error) {
      console.error('Error fetching templates:', error);
      toast.error('Failed to load templates');
    }
  };

  const generateContentIdeas = async (platform, objective = 'engagement') => {
    try {
      setLoading(true);
      const response = await axios.post(`${API}/creative/generate-ideas`, {
        tenant_id: 'default',
        platform,
        objective,
        count: 10
      });
      setContentIdeas(response.data.ideas);
      toast.success(`Generated ${response.data.ideas_generated} content ideas!`);
    } catch (error) {
      console.error('Error generating ideas:', error);
      toast.error('Failed to generate content ideas');
    } finally {
      setLoading(false);
    }
  };

  const researchHashtags = async (keywords, platform) => {
    try {
      setLoading(true);
      const response = await axios.post(`${API}/organic/hashtag-research`, {
        tenant_id: 'default',
        keywords: keywords.split(',').map(k => k.trim()),
        platform
      });
      setHashtagSuggestions(response.data.hashtag_suggestions);
      toast.success('Hashtag research completed!');
    } catch (error) {
      console.error('Error researching hashtags:', error);
      toast.error('Failed to research hashtags');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  const sidebar = (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-glass-bright mb-4">Creative Studio</h2>
        <div className="flex items-center space-x-2 text-sm text-glass-muted mb-4">
          {isDesktop && <Monitor className="w-4 h-4" />}
          {isTablet && <Tablet className="w-4 h-4" />}
          {isMobile && <Smartphone className="w-4 h-4" />}
          <span>{isDesktop ? 'Desktop' : isTablet ? 'Tablet' : 'Mobile'} Mode</span>
        </div>
      </div>

      <div className="space-y-3">
        <Button
          variant={activeTab === 'templates' ? 'default' : 'ghost'}
          onClick={() => setActiveTab('templates')}
          className="w-full justify-start text-glass"
        >
          <Layout className="w-4 h-4 mr-2" />
          Templates
        </Button>
        <Button
          variant={activeTab === 'ideas' ? 'default' : 'ghost'}
          onClick={() => setActiveTab('ideas')}
          className="w-full justify-start text-glass"
        >
          <Lightbulb className="w-4 h-4 mr-2" />
          Content Ideas
        </Button>
        <Button
          variant={activeTab === 'hashtags' ? 'default' : 'ghost'}
          onClick={() => setActiveTab('hashtags')}
          className="w-full justify-start text-glass"
        >
          <Hash className="w-4 h-4 mr-2" />
          Hashtag Research
        </Button>
        <Button
          variant={activeTab === 'assets' ? 'default' : 'ghost'}
          onClick={() => setActiveTab('assets')}
          className="w-full justify-start text-glass"
        >
          <Folder className="w-4 h-4 mr-2" />
          Asset Library
        </Button>
        <Button
          variant={activeTab === 'strategy' ? 'default' : 'ghost'}
          onClick={() => setActiveTab('strategy')}
          className="w-full justify-start text-glass"
        >
          <Target className="w-4 h-4 mr-2" />
          Growth Strategy
        </Button>
      </div>

      <div className="pt-6 border-t border-glass-muted">
        <h3 className="font-semibold text-glass-bright mb-3">Quick Actions</h3>
        <div className="space-y-2">
          <Button
            size="sm"
            variant="outline"
            className="w-full justify-start text-glass"
            onClick={() => generateContentIdeas('instagram')}
          >
            <Sparkles className="w-4 h-4 mr-2" />
            AI Ideas
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="w-full justify-start text-glass"
          >
            <BarChart3 className="w-4 h-4 mr-2" />
            Analytics
          </Button>
        </div>
      </div>
    </div>
  );

  const header = (
    <div className="bg-glass backdrop-blur-lg border-b border-glass-muted p-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold joker-brand">Creative Studio</h1>
        <div className="flex items-center space-x-3">
          <Badge className="badge-neon neon-purple">
            Pro Tools
          </Badge>
          {isMobile && (
            <Button size="sm" variant="outline">
              <Eye className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <ResponsiveLayout header={header} sidebar={!isMobile ? sidebar : null}>
      <div className="space-y-6">
        {isMobile && (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-5 glass-card">
              <TabsTrigger value="templates" className="text-xs">
                <Layout className="w-4 h-4" />
              </TabsTrigger>
              <TabsTrigger value="ideas" className="text-xs">
                <Lightbulb className="w-4 h-4" />
              </TabsTrigger>
              <TabsTrigger value="hashtags" className="text-xs">
                <Hash className="w-4 h-4" />
              </TabsTrigger>
              <TabsTrigger value="assets" className="text-xs">
                <Folder className="w-4 h-4" />
              </TabsTrigger>
              <TabsTrigger value="strategy" className="text-xs">
                <Target className="w-4 h-4" />
              </TabsTrigger>
            </TabsList>
          </Tabs>
        )}

        {activeTab === 'templates' && <TemplatesSection templates={templates} />}
        {activeTab === 'ideas' && <ContentIdeasSection ideas={contentIdeas} onGenerate={generateContentIdeas} loading={loading} />}
        {activeTab === 'hashtags' && <HashtagResearchSection suggestions={hashtagSuggestions} onResearch={researchHashtags} loading={loading} />}
        {activeTab === 'assets' && <AssetLibrarySection assets={assets} />}
        {activeTab === 'strategy' && <GrowthStrategySection />}
      </div>
    </ResponsiveLayout>
  );
};

// Templates Section
const TemplatesSection = ({ templates }) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-glass-bright">Creative Templates</h2>
        <Button className="btn-neon">
          <Plus className="w-4 h-4 mr-2" />
          Create Template
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {templates.map((template) => (
          <Card key={template.id} className="glass-card glass-card-hover">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-glass-bright">{template.name}</CardTitle>
                <Badge className={`badge-neon ${template.platform === 'instagram' ? 'neon-pink' : 
                  template.platform === 'facebook' ? 'neon-blue' : 
                  template.platform === 'tiktok' ? 'neon-purple' : 'neon-cyan'}`}>
                  {template.platform}
                </Badge>
              </div>
              <CardDescription className="text-glass-muted">
                {template.type} template for {template.platform}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="bg-glass rounded-lg p-4 min-h-32 flex items-center justify-center">
                  <div className="text-center text-glass-muted">
                    <Layout className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Template Preview</p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button size="sm" variant="outline" className="flex-1">
                    <Eye className="w-4 h-4 mr-1" />
                    Preview
                  </Button>
                  <Button size="sm" className="flex-1 btn-neon">
                    <Wand2 className="w-4 h-4 mr-1" />
                    Use Template
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

// Content Ideas Section
const ContentIdeasSection = ({ ideas, onGenerate, loading }) => {
  const [selectedPlatform, setSelectedPlatform] = useState('instagram');
  const [selectedObjective, setSelectedObjective] = useState('engagement');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-glass-bright">AI Content Ideas</h2>
        <div className="flex space-x-3">
          <Select value={selectedPlatform} onValueChange={setSelectedPlatform}>
            <SelectTrigger className="w-32 glass-card text-glass">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="modal-glass">
              <SelectItem value="instagram">Instagram</SelectItem>
              <SelectItem value="facebook">Facebook</SelectItem>
              <SelectItem value="tiktok">TikTok</SelectItem>
              <SelectItem value="linkedin">LinkedIn</SelectItem>
            </SelectContent>
          </Select>
          <Select value={selectedObjective} onValueChange={setSelectedObjective}>
            <SelectTrigger className="w-32 glass-card text-glass">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="modal-glass">
              <SelectItem value="engagement">Engagement</SelectItem>
              <SelectItem value="awareness">Awareness</SelectItem>
              <SelectItem value="traffic">Traffic</SelectItem>
              <SelectItem value="leads">Leads</SelectItem>
            </SelectContent>
          </Select>
          <Button 
            onClick={() => onGenerate(selectedPlatform, selectedObjective)}
            disabled={loading}
            className="btn-neon"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            {loading ? 'Generating...' : 'Generate Ideas'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {ideas.map((idea) => (
          <Card key={idea.id} className="glass-card glass-card-hover">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-glass-bright">{idea.title}</CardTitle>
                <Badge className={`badge-neon ${
                  idea.estimated_engagement === 'high' ? 'neon-green' :
                  idea.estimated_engagement === 'medium' ? 'neon-orange' : 'neon-cyan'
                }`}>
                  {idea.estimated_engagement} engagement
                </Badge>
              </div>
              <CardDescription className="text-glass-muted">
                {idea.content_type} content for {idea.platform}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-glass text-sm">{idea.description}</p>
                <div className="bg-glass rounded-lg p-3">
                  <p className="text-glass-bright text-sm font-medium mb-2">Suggested Copy:</p>
                  <p className="text-glass text-sm italic">"{idea.suggested_copy}"</p>
                </div>
                <div className="flex flex-wrap gap-1">
                  {idea.hashtags.slice(0, 5).map((tag, index) => (
                    <Badge key={index} className="badge-neon neon-purple text-xs">
                      {tag}
                    </Badge>
                  ))}
                  {idea.hashtags.length > 5 && (
                    <Badge className="badge-neon text-xs">
                      +{idea.hashtags.length - 5} more
                    </Badge>
                  )}
                </div>
                <div className="flex space-x-2">
                  <Button size="sm" variant="outline" className="flex-1">
                    <Copy className="w-4 h-4 mr-1" />
                    Copy
                  </Button>
                  <Button size="sm" className="flex-1 btn-neon">
                    <Wand2 className="w-4 h-4 mr-1" />
                    Create Post
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {ideas.length === 0 && !loading && (
        <div className="text-center py-12">
          <Lightbulb className="w-16 h-16 mx-auto mb-4 text-glass-muted opacity-50" />
          <h3 className="text-xl font-semibold text-glass-bright mb-2">Ready to spark creativity?</h3>
          <p className="text-glass-muted mb-6">Generate AI-powered content ideas tailored to your platform and goals.</p>
          <Button onClick={() => onGenerate(selectedPlatform, selectedObjective)} className="btn-neon">
            <Sparkles className="w-4 h-4 mr-2" />
            Generate Your First Ideas
          </Button>
        </div>
      )}
    </div>
  );
};

// Hashtag Research Section
const HashtagResearchSection = ({ suggestions, onResearch, loading }) => {
  const [keywords, setKeywords] = useState('');
  const [selectedPlatform, setSelectedPlatform] = useState('instagram');

  const handleResearch = () => {
    if (!keywords.trim()) {
      toast.error('Please enter keywords to research');
      return;
    }
    onResearch(keywords, selectedPlatform);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-glass-bright">Hashtag Research</h2>
      </div>

      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="text-glass-bright flex items-center">
            <Hash className="w-5 h-5 mr-2 neon-purple" />
            Research Hashtags
          </CardTitle>
          <CardDescription className="text-glass-muted">
            Find the perfect hashtags to maximize your reach and engagement
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="md:col-span-2">
              <Label className="text-glass">Keywords (comma-separated)</Label>
              <Input
                value={keywords}
                onChange={(e) => setKeywords(e.target.value)}
                placeholder="e.g., Toyota, car sales, automotive"
                className="text-glass"
              />
            </div>
            <div>
              <Label className="text-glass">Platform</Label>
              <Select value={selectedPlatform} onValueChange={setSelectedPlatform}>
                <SelectTrigger className="glass-card text-glass">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="modal-glass">
                  <SelectItem value="instagram">Instagram</SelectItem>
                  <SelectItem value="facebook">Facebook</SelectItem>
                  <SelectItem value="tiktok">TikTok</SelectItem>
                  <SelectItem value="linkedin">LinkedIn</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button 
            onClick={handleResearch}
            disabled={loading || !keywords.trim()}
            className="btn-neon w-full"
          >
            <Hash className="w-4 h-4 mr-2" />
            {loading ? 'Researching...' : 'Research Hashtags'}
          </Button>
        </CardContent>
      </Card>

      {suggestions.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {suggestions.slice(0, 30).map((hashtag) => (
            <Card key={hashtag.id} className="glass-card glass-card-hover">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-glass-bright">{hashtag.hashtag}</h3>
                  <Badge className={`badge-neon ${
                    hashtag.difficulty === 'low' ? 'neon-green' :
                    hashtag.difficulty === 'medium' ? 'neon-orange' : 'neon-red'
                  }`}>
                    {hashtag.difficulty}
                  </Badge>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-glass-muted">Volume:</span>
                    <span className="text-glass-bright">{hashtag.volume.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-glass-muted">Relevance:</span>
                    <span className="text-glass-bright">{(hashtag.relevance_score * 100).toFixed(0)}%</span>
                  </div>
                  {hashtag.trending && (
                    <Badge className="badge-neon neon-green text-xs">
                      <TrendingUp className="w-3 h-3 mr-1" />
                      Trending
                    </Badge>
                  )}
                </div>
                <Button size="sm" variant="outline" className="w-full mt-3">
                  <Copy className="w-4 h-4 mr-1" />
                  Copy
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

// Asset Library Section
const AssetLibrarySection = ({ assets }) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-glass-bright">Asset Library</h2>
        <BulkUploadComponent />
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="glass-card">
          <TabsTrigger value="all">All Assets</TabsTrigger>
          <TabsTrigger value="images">Images</TabsTrigger>
          <TabsTrigger value="videos">Videos</TabsTrigger>
          <TabsTrigger value="contacts">Contacts</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {[...Array(12)].map((_, i) => (
              <Card key={i} className="glass-card glass-card-hover">
                <CardContent className="p-4">
                  <div className="aspect-square bg-glass rounded-lg flex items-center justify-center mb-3">
                    <FileImage className="w-8 h-8 text-glass-muted opacity-50" />
                  </div>
                  <p className="text-sm text-glass-bright truncate">Asset {i + 1}</p>
                  <p className="text-xs text-glass-muted">Image • 1.2MB</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="contacts">
          <ContactsManagement />
        </TabsContent>
      </Tabs>
    </div>
  );
};

// Bulk Upload Component with Excel/CSV Support
const BulkUploadComponent = () => {
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [uploadType, setUploadType] = useState('assets');

  const onDrop = useCallback((acceptedFiles) => {
    acceptedFiles.forEach((file) => {
      const reader = new FileReader();
      
      reader.onabort = () => console.log('file reading was aborted');
      reader.onerror = () => console.log('file reading has failed');
      reader.onload = () => {
        const binaryStr = reader.result;
        
        if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
          // Handle Excel files
          const workbook = XLSX.read(binaryStr, { type: 'binary' });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const data = XLSX.utils.sheet_to_json(worksheet);
          
          console.log('Excel data:', data);
          processContactData(data);
          
        } else if (file.name.endsWith('.csv')) {
          // Handle CSV files
          Papa.parse(file, {
            header: true,
            complete: function(results) {
              console.log('CSV data:', results.data);
              processContactData(results.data);
            }
          });
        }
      };
      
      if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
        reader.readAsBinaryString(file);
      } else {
        reader.readAsText(file);
      }
    });
  }, []);

  const processContactData = async (data) => {
    try {
      // Map common field variations to our standard fields
      const mappedData = data.map(row => ({
        first_name: row['First Name'] || row['first_name'] || row['FirstName'] || '',
        last_name: row['Last Name'] || row['last_name'] || row['LastName'] || '',
        primary_phone: row['Phone'] || row['phone'] || row['Phone Number'] || row['primary_phone'] || '',
        email: row['Email'] || row['email'] || row['Email Address'] || '',
        budget: row['Budget'] || row['budget'] || '',
        vehicle_type: row['Vehicle Type'] || row['vehicle_type'] || row['Interest'] || '',
        address: row['Address'] || row['address'] || '',
        notes: row['Notes'] || row['notes'] || row['Comments'] || ''
      })).filter(contact => contact.first_name && contact.last_name); // Filter out empty rows

      if (mappedData.length > 0) {
        // Process leads in batches
        const batchSize = 50;
        let processed = 0;
        
        for (let i = 0; i < mappedData.length; i += batchSize) {
          const batch = mappedData.slice(i, i + batchSize);
          
          for (const contact of batch) {
            try {
              await axios.post(`${API}/leads`, {
                tenant_id: 'default',
                ...contact
              });
              processed++;
            } catch (error) {
              console.error('Error creating lead:', error);
            }
          }
        }
        
        toast.success(`Successfully imported ${processed} contacts!`);
        setShowUploadDialog(false);
      } else {
        toast.error('No valid contact data found in the file');
      }
    } catch (error) {
      console.error('Error processing contact data:', error);
      toast.error('Failed to process contact data');
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls'],
      'text/csv': ['.csv'],
      'image/*': ['.png', '.jpg', '.jpeg', '.gif'],
      'video/*': ['.mp4', '.mov', '.avi']
    }
  });

  return (
    <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
      <DialogTrigger asChild>
        <Button className="btn-neon">
          <Upload className="w-4 h-4 mr-2" />
          Bulk Upload
        </Button>
      </DialogTrigger>
      <DialogContent className="modal-glass max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-glass-bright">Bulk Upload</DialogTitle>
          <DialogDescription className="text-glass-muted">
            Upload contacts via Excel/CSV or creative assets
          </DialogDescription>
        </DialogHeader>
        
        <Tabs value={uploadType} onValueChange={setUploadType}>
          <TabsList className="glass-card w-full">
            <TabsTrigger value="assets" className="flex-1">Creative Assets</TabsTrigger>
            <TabsTrigger value="contacts" className="flex-1">Contacts (Excel/CSV)</TabsTrigger>
          </TabsList>
          
          <TabsContent value="assets" className="space-y-4">
            <div {...getRootProps()} className={`border-2 border-dashed border-glass-muted rounded-lg p-8 text-center transition-colors ${isDragActive ? 'border-neon-purple bg-glass' : ''}`}>
              <input {...getInputProps()} />
              <Upload className="w-12 h-12 mx-auto mb-4 text-glass-muted" />
              <h3 className="text-lg font-semibold text-glass-bright mb-2">
                {isDragActive ? 'Drop files here' : 'Upload Creative Assets'}
              </h3>
              <p className="text-glass-muted mb-4">
                Drag & drop images, videos, or click to browse
              </p>
              <p className="text-sm text-glass-muted">
                Supports: PNG, JPG, GIF, MP4, MOV, AVI
              </p>
            </div>
          </TabsContent>
          
          <TabsContent value="contacts" className="space-y-4">
            <div {...getRootProps()} className={`border-2 border-dashed border-glass-muted rounded-lg p-8 text-center transition-colors ${isDragActive ? 'border-neon-green bg-glass' : ''}`}>
              <input {...getInputProps()} />
              <FileText className="w-12 h-12 mx-auto mb-4 text-glass-muted" />
              <h3 className="text-lg font-semibold text-glass-bright mb-2">
                {isDragActive ? 'Drop contact files here' : 'Upload Contact List'}
              </h3>
              <p className="text-glass-muted mb-4">
                Drag & drop Excel or CSV files with contact information
              </p>
              <p className="text-sm text-glass-muted">
                Supports: XLSX, XLS, CSV
              </p>
            </div>
            
            <div className="bg-glass rounded-lg p-4">
              <h4 className="font-semibold text-glass-bright mb-2">Expected Columns:</h4>
              <div className="grid grid-cols-2 gap-2 text-sm text-glass">
                <div>• First Name</div>
                <div>• Last Name</div>
                <div>• Phone</div>
                <div>• Email</div>
                <div>• Budget (optional)</div>
                <div>• Vehicle Type (optional)</div>
                <div>• Address (optional)</div>
                <div>• Notes (optional)</div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

// Contacts Management Component
const ContactsManagement = () => {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchContacts();
  }, []);

  const fetchContacts = async () => {
    try {
      const response = await axios.get(`${API}/leads`);
      setContacts(response.data);
    } catch (error) {
      console.error('Error fetching contacts:', error);
      toast.error('Failed to load contacts');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="spinner-neon"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-glass-bright">Contact Management</h3>
        <Button className="btn-neon" size="sm">
          <Download className="w-4 h-4 mr-2" />
          Export Contacts
        </Button>
      </div>

      <Card className="glass-card">
        <CardContent className="p-0">
          <div className="table-glass">
            <table className="w-full">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Phone</th>
                  <th>Email</th>
                  <th>Budget</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {contacts.slice(0, 10).map((contact) => (
                  <tr key={contact.id}>
                    <td className="font-semibold text-glass-bright">
                      {contact.first_name} {contact.last_name}
                    </td>
                    <td className="text-glass">{contact.primary_phone}</td>
                    <td className="text-glass">{contact.email}</td>
                    <td className="text-glass">{contact.budget || 'N/A'}</td>
                    <td>
                      <Badge className={`badge-neon ${
                        contact.status === 'new' ? 'neon-blue' :
                        contact.status === 'contacted' ? 'neon-orange' :
                        contact.status === 'scheduled' ? 'neon-green' : 'neon-gray'
                      }`}>
                        {contact.status}
                      </Badge>
                    </td>
                    <td>
                      <Button size="sm" variant="outline">
                        <Eye className="w-4 h-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Growth Strategy Section
const GrowthStrategySection = () => {
  const [strategies, setStrategies] = useState([]);
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-glass-bright">Organic Growth Strategy</h2>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button className="btn-neon">
              <Target className="w-4 h-4 mr-2" />
              Create Strategy
            </Button>
          </DialogTrigger>
          <DialogContent className="modal-glass max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-glass-bright">Create Growth Strategy</DialogTitle>
              <DialogDescription className="text-glass-muted">
                Build a comprehensive organic social media strategy
              </DialogDescription>
            </DialogHeader>
            <StrategyCreationForm onSuccess={() => setShowCreateDialog(false)} />
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="glass-card glass-card-hover">
          <CardHeader>
            <CardTitle className="text-glass-bright flex items-center">
              <Globe className="w-5 h-5 mr-2 neon-blue" />
              Instagram Growth
            </CardTitle>
            <CardDescription className="text-glass-muted">
              Awareness & Engagement Strategy
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-glass-muted">Duration:</span>
                <span className="text-glass-bright">30 days</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-glass-muted">Posts/Week:</span>
                <span className="text-glass-bright">7</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-glass-muted">Target Growth:</span>
                <span className="text-glass-bright">+10%</span>
              </div>
              <Badge className="badge-neon neon-green">Active</Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

// Strategy Creation Form
const StrategyCreationForm = ({ onSuccess }) => {
  const [formData, setFormData] = useState({
    platform: 'instagram',
    objective: 'awareness',
    duration_days: 30,
    target_audience: {}
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API}/organic/strategy`, {
        tenant_id: 'default',
        ...formData
      });
      toast.success('Growth strategy created successfully!');
      onSuccess();
    } catch (error) {
      console.error('Error creating strategy:', error);
      toast.error('Failed to create strategy');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label className="text-glass">Platform</Label>
          <Select value={formData.platform} onValueChange={(value) => setFormData({...formData, platform: value})}>
            <SelectTrigger className="glass-card text-glass">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="modal-glass">
              <SelectItem value="instagram">Instagram</SelectItem>
              <SelectItem value="facebook">Facebook</SelectItem>
              <SelectItem value="tiktok">TikTok</SelectItem>
              <SelectItem value="linkedin">LinkedIn</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="text-glass">Objective</Label>
          <Select value={formData.objective} onValueChange={(value) => setFormData({...formData, objective: value})}>
            <SelectTrigger className="glass-card text-glass">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="modal-glass">
              <SelectItem value="awareness">Brand Awareness</SelectItem>
              <SelectItem value="engagement">Engagement</SelectItem>
              <SelectItem value="traffic">Website Traffic</SelectItem>
              <SelectItem value="leads">Lead Generation</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div>
        <Label className="text-glass">Duration (Days)</Label>
        <Input
          type="number"
          value={formData.duration_days}
          onChange={(e) => setFormData({...formData, duration_days: parseInt(e.target.value)})}
          className="text-glass"
        />
      </div>

      <Button type="submit" className="w-full btn-neon">
        Create Strategy
      </Button>
    </form>
  );
};

export default CreativeStudio;