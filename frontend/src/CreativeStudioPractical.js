import React, { useState } from 'react';
import { Card, CardContent } from './components/ui/card';
import { Button } from './components/ui/button';
import { Input } from './components/ui/input';
import { Label } from './components/ui/label';
import { Textarea } from './components/ui/textarea';
import { Badge } from './components/ui/badge';
import { toast } from 'sonner';
import {
  Download, Sparkles, Hash, TrendingUp, Target, Calendar,
  Image as ImageIcon, Type, DollarSign, Star, Phone, MapPin,
  Instagram, Facebook, Smartphone, Plus, Copy, Lightbulb,
  BarChart3, Clock, ThumbsUp, MessageSquare, Heart, Share2
} from 'lucide-react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

// Ready-to-use automotive templates
const AUTOMOTIVE_TEMPLATES = [
  {
    id: 'new-arrival',
    name: 'New Arrival',
    category: 'inventory',
    preview: '🚗',
    gradient: 'from-blue-600 to-cyan-600',
    fields: {
      title: 'JUST ARRIVED',
      vehicle: '2024 Toyota Camry XSE',
      price: '$32,999',
      cta: 'Schedule Test Drive Today!'
    }
  },
  {
    id: 'flash-sale',
    name: 'Flash Sale',
    category: 'promotion',
    preview: '💥',
    gradient: 'from-red-600 to-orange-600',
    fields: {
      title: 'FLASH SALE',
      discount: 'UP TO $5,000 OFF',
      subtitle: 'This Weekend Only',
      cta: 'Limited Time - Visit Now!'
    }
  },
  {
    id: 'service-special',
    name: 'Service Special',
    category: 'service',
    preview: '🔧',
    gradient: 'from-green-600 to-emerald-600',
    fields: {
      title: 'SERVICE SPECIAL',
      service: 'Oil Change + Tire Rotation',
      price: '$49.99',
      cta: 'Book Your Appointment'
    }
  },
  {
    id: 'financing',
    name: 'Financing Offer',
    category: 'financing',
    preview: '💰',
    gradient: 'from-purple-600 to-pink-600',
    fields: {
      title: '0% APR FINANCING',
      subtitle: 'for 60 months',
      details: 'On select 2024 models',
      cta: 'Check Your Rate Today'
    }
  },
  {
    id: 'testimonial',
    name: 'Customer Review',
    category: 'social',
    preview: '⭐',
    gradient: 'from-yellow-600 to-amber-600',
    fields: {
      title: '5-STAR REVIEW',
      quote: 'Best car buying experience!',
      customer: 'Sarah J.',
      cta: 'Read More Reviews'
    }
  },
  {
    id: 'trade-in',
    name: 'Trade-In Value',
    category: 'promotion',
    preview: '🔄',
    gradient: 'from-indigo-600 to-blue-600',
    fields: {
      title: 'MAX TRADE-IN VALUE',
      subtitle: 'Get Top Dollar for Your Vehicle',
      offer: '+$2,000 Trade Bonus',
      cta: 'Get Your Free Appraisal'
    }
  },
  {
    id: 'inventory',
    name: 'Inventory Highlight',
    category: 'inventory',
    preview: '🏆',
    gradient: 'from-teal-600 to-cyan-600',
    fields: {
      title: '214 NEW VEHICLES',
      subtitle: 'Largest Selection in San Antonio',
      highlight: 'RAV4 • Camry • Tacoma • Tundra',
      cta: 'Browse Inventory Online'
    }
  },
  {
    id: 'appointment',
    name: 'Appointment Booking',
    category: 'engagement',
    preview: '📅',
    gradient: 'from-rose-600 to-red-600',
    fields: {
      title: 'SCHEDULE YOUR VISIT',
      subtitle: 'See it. Drive it. Love it.',
      availability: 'Same Day Appointments Available',
      cta: 'Book Now - Takes 30 Seconds'
    }
  }
];

// Growth strategies and content ideas
const CONTENT_STRATEGIES = {
  bestTimes: [
    { platform: 'Instagram', time: '11 AM - 1 PM', days: 'Wed-Fri', boost: '2.3x' },
    { platform: 'Facebook', time: '1 PM - 3 PM', days: 'Wed-Thu', boost: '1.8x' },
    { platform: 'TikTok', time: '6 PM - 9 PM', days: 'Tue-Fri', boost: '3.1x' }
  ],
  contentIdeas: [
    { title: 'Vehicle Walkaround', description: '60-sec feature tour', engagement: 'Very High', emoji: '🎥' },
    { title: 'Customer Spotlight', description: 'Happy customer + new car', engagement: 'Very High', emoji: '😊' },
    { title: 'Behind the Scenes', description: 'Team at work', engagement: 'High', emoji: '👥' },
    { title: 'Maintenance Tips', description: 'Quick car care advice', engagement: 'Medium', emoji: '💡' },
    { title: 'Before & After', description: 'Trade-in transformation', engagement: 'High', emoji: '✨' },
    { title: 'Staff Introduction', description: 'Meet your sales team', engagement: 'Medium', emoji: '👋' },
    { title: 'Test Drive Clips', description: 'Customer reactions', engagement: 'Very High', emoji: '🚗' },
    { title: 'Community Events', description: 'Local sponsorships', engagement: 'High', emoji: '🎉' }
  ],
  hashtags: [
    { tag: '#NewCarDay', volume: '89K', competition: 'Low', recommended: true },
    { tag: '#CarDeals', volume: '125K', competition: 'Medium', recommended: true },
    { tag: '#TestDrive', volume: '67K', competition: 'Low', recommended: true },
    { tag: '#DealershipLife', volume: '45K', competition: 'Low', recommended: true },
    { tag: '#CarShopping', volume: '156K', competition: 'Medium', recommended: false },
    { tag: '#AutoSales', volume: '203K', competition: 'High', recommended: false },
    { tag: '#TradeIn', volume: '52K', competition: 'Medium', recommended: true },
    { tag: '#FinancingAvailable', volume: '34K', competition: 'Low', recommended: true }
  ],
  crispCaptions: [
    {
      type: 'Transition/Disrupt/Ask',
      example: "I know you're just browsing online... That's exactly why I want to show you this in person! Available for test drive today at 3pm or 5pm - which works better?",
      use: 'For cold leads'
    },
    {
      type: 'Urgency + Appointment',
      example: "This 2024 RAV4 won't last long - already have 2 other appointments scheduled to see it. Can you come in today at 2pm or tomorrow at 10am?",
      use: 'For hot inventory'
    },
    {
      type: 'Value + CTA',
      example: "Your current vehicle could be worth $2,000 MORE than you think! Free appraisal takes 10 minutes. Available today 1-5pm. What time works?",
      use: 'For trade-ins'
    }
  ]
};

const CreativeStudioPractical = () => {
  const [activeTab, setActiveTab] = useState('templates');
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [customFields, setCustomFields] = useState({});
  const [generating, setGenerating] = useState(false);

  // Template editor
  const openTemplateEditor = (template) => {
    setSelectedTemplate(template);
    setCustomFields(template.fields);
  };

  const updateField = (key, value) => {
    setCustomFields({ ...customFields, [key]: value });
  };

  const generateAICaption = async () => {
    setGenerating(true);
    try {
      // Simulate AI generation
      setTimeout(() => {
        const caption = `${customFields.title || 'Check out this amazing deal!'}\n\n${customFields.subtitle || ''}\n\n${customFields.cta || 'Visit us today!'}\n\n#NewCarDay #CarDeals #TestDrive`;
        toast.success('AI caption generated!');
        navigator.clipboard.writeText(caption);
        setGenerating(false);
      }, 1500);
    } catch (error) {
      toast.error('Failed to generate caption');
      setGenerating(false);
    }
  };

  const downloadTemplate = () => {
    // In production, this would generate actual image
    toast.success('Template downloaded! (Production will generate actual image)');
  };

  const copyToClipboard = () => {
    const text = Object.values(customFields).join('\n');
    navigator.clipboard.writeText(text);
    toast.success('Content copied to clipboard!');
  };

  // Render Templates Tab
  const renderTemplatesTab = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white">Ready-to-Use Templates</h2>
          <p className="text-gray-400">Professional designs for car dealership marketing</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {AUTOMOTIVE_TEMPLATES.map(template => (
          <Card
            key={template.id}
            className="bg-gray-800/50 backdrop-blur-lg border-gray-600 hover:border-cyan-500 transition cursor-pointer group"
            onClick={() => openTemplateEditor(template)}
          >
            <CardContent className="p-6">
              <div className={`w-full h-40 bg-gradient-to-br ${template.gradient} rounded-lg mb-4 flex items-center justify-center text-6xl group-hover:scale-105 transition`}>
                {template.preview}
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">{template.name}</h3>
              <Badge className="bg-cyan-600">{template.category}</Badge>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Template Editor Modal */}
      {selectedTemplate && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setSelectedTemplate(null)}>
          <Card className="bg-gray-800 border-gray-600 w-full max-w-6xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <CardContent className="p-8">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-3xl font-bold text-white">{selectedTemplate.name}</h3>
                  <p className="text-gray-400">Customize your content</p>
                </div>
                <button onClick={() => setSelectedTemplate(null)} className="text-gray-400 hover:text-white">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Preview */}
                <div>
                  <Label className="text-white mb-2">Preview</Label>
                  <div className={`w-full h-96 bg-gradient-to-br ${selectedTemplate.gradient} rounded-xl p-8 flex flex-col justify-center items-center text-center text-white shadow-2xl`}>
                    <div className="text-7xl mb-4">{selectedTemplate.preview}</div>
                    {Object.entries(customFields).map(([key, value]) => (
                      <div key={key} className="mb-2">
                        {key === 'title' && <h2 className="text-4xl font-bold mb-2">{value}</h2>}
                        {key === 'subtitle' && <p className="text-2xl mb-2">{value}</p>}
                        {key === 'price' && <p className="text-5xl font-bold mb-2">{value}</p>}
                        {key === 'discount' && <p className="text-4xl font-bold mb-2">{value}</p>}
                        {key === 'vehicle' && <p className="text-2xl mb-2">{value}</p>}
                        {key === 'service' && <p className="text-2xl mb-2">{value}</p>}
                        {key === 'quote' && <p className="text-xl italic mb-2">"{value}"</p>}
                        {key === 'customer' && <p className="text-lg mb-2">- {value}</p>}
                        {key === 'details' && <p className="text-lg mb-2">{value}</p>}
                        {key === 'offer' && <p className="text-2xl font-semibold mb-2">{value}</p>}
                        {key === 'highlight' && <p className="text-lg mb-2">{value}</p>}
                        {key === 'availability' && <p className="text-lg mb-2">{value}</p>}
                        {key === 'cta' && <p className="text-xl font-semibold mt-4">{value}</p>}
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 flex gap-2">
                    <Button onClick={downloadTemplate} className="btn-neon flex-1">
                      <Download className="w-4 h-4 mr-2" />
                      Download Image
                    </Button>
                    <Button onClick={copyToClipboard} variant="outline" className="text-white">
                      <Copy className="w-4 h-4 mr-2" />
                      Copy Text
                    </Button>
                  </div>
                </div>

                {/* Editor */}
                <div className="space-y-4">
                  <div>
                    <Label className="text-white mb-2">Customize Fields</Label>
                    <p className="text-sm text-gray-400 mb-4">Edit the content for your post</p>
                  </div>

                  {Object.keys(selectedTemplate.fields).map(key => (
                    <div key={key}>
                      <Label className="text-white capitalize">{key.replace('_', ' ')}</Label>
                      <Input
                        value={customFields[key] || ''}
                        onChange={(e) => updateField(key, e.target.value)}
                        className="mt-1 bg-gray-700 text-white border-gray-600"
                        placeholder={`Enter ${key}...`}
                      />
                    </div>
                  ))}

                  <div className="border-t border-gray-600 pt-4 mt-6">
                    <Label className="text-white mb-2">AI Caption Generator</Label>
                    <p className="text-sm text-gray-400 mb-3">Generate CRISP-aligned captions automatically</p>
                    <Button onClick={generateAICaption} disabled={generating} className="w-full bg-purple-600 hover:bg-purple-700">
                      <Sparkles className="w-4 h-4 mr-2" />
                      {generating ? 'Generating...' : 'Generate AI Caption'}
                    </Button>
                  </div>

                  <div className="bg-gray-700/50 p-4 rounded-lg">
                    <h4 className="text-white font-semibold mb-2">💡 Quick Tips</h4>
                    <ul className="text-sm text-gray-300 space-y-1">
                      <li>• Use specific times for urgency ("Today at 3pm")</li>
                      <li>• Include price or value proposition</li>
                      <li>• Always end with clear CTA</li>
                      <li>• Add relevant hashtags (#NewCarDay)</li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );

  // Render Content Strategy Tab
  const renderStrategyTab = () => (
    <div className="space-y-6">
      {/* Best Times to Post */}
      <Card className="bg-gray-800/50 backdrop-blur-lg border-gray-600">
        <CardContent className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <Clock className="w-6 h-6 text-cyan-400" />
            <h3 className="text-xl font-bold text-white">Best Times to Post</h3>
          </div>
          <div className="space-y-3">
            {CONTENT_STRATEGIES.bestTimes.map((time, i) => (
              <div key={i} className="flex items-center justify-between bg-gray-700/50 p-4 rounded-lg">
                <div>
                  <h4 className="font-semibold text-white">{time.platform}</h4>
                  <p className="text-sm text-gray-400">{time.time}</p>
                  <p className="text-xs text-gray-500">{time.days}</p>
                </div>
                <Badge className="bg-green-600">{time.boost} higher engagement</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Content Ideas */}
      <Card className="bg-gray-800/50 backdrop-blur-lg border-gray-600">
        <CardContent className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <Lightbulb className="w-6 h-6 text-yellow-400" />
            <h3 className="text-xl font-bold text-white">Content Ideas for Car Sales</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {CONTENT_STRATEGIES.contentIdeas.map((idea, i) => (
              <div key={i} className="bg-gray-700/50 p-4 rounded-lg">
                <div className="flex items-start gap-3">
                  <span className="text-3xl">{idea.emoji}</span>
                  <div>
                    <h4 className="font-semibold text-white">{idea.title}</h4>
                    <p className="text-sm text-gray-400 mb-2">{idea.description}</p>
                    <Badge variant={idea.engagement === 'Very High' ? 'default' : 'secondary'}>
                      {idea.engagement} Engagement
                    </Badge>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Hashtag Research */}
      <Card className="bg-gray-800/50 backdrop-blur-lg border-gray-600">
        <CardContent className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <Hash className="w-6 h-6 text-purple-400" />
            <h3 className="text-xl font-bold text-white">Top Automotive Hashtags</h3>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {CONTENT_STRATEGIES.hashtags.filter(h => h.recommended).map((hashtag, i) => (
              <div key={i} className="bg-gray-700/50 p-3 rounded-lg cursor-pointer hover:bg-gray-700 transition" onClick={() => {
                navigator.clipboard.writeText(hashtag.tag);
                toast.success(`Copied ${hashtag.tag}`);
              }}>
                <p className="font-semibold text-white mb-1">{hashtag.tag}</p>
                <p className="text-xs text-gray-400">{hashtag.volume} posts</p>
                <Badge variant="outline" className="mt-2 text-xs">
                  {hashtag.competition} competition
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* CRISP Caption Examples */}
      <Card className="bg-gray-800/50 backdrop-blur-lg border-gray-600">
        <CardContent className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <Target className="w-6 h-6 text-red-400" />
            <h3 className="text-xl font-bold text-white">CRISP-Certified Caption Examples</h3>
          </div>
          <div className="space-y-4">
            {CONTENT_STRATEGIES.crispCaptions.map((caption, i) => (
              <div key={i} className="bg-gradient-to-r from-cyan-900/30 to-blue-900/30 p-4 rounded-lg border border-cyan-600/30">
                <div className="flex items-center justify-between mb-2">
                  <Badge className="bg-cyan-600">{caption.type}</Badge>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      navigator.clipboard.writeText(caption.example);
                      toast.success('Caption copied!');
                    }}
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
                <p className="text-white italic mb-2">"{caption.example}"</p>
                <p className="text-sm text-gray-400">Best for: {caption.use}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-6">
      <div className="container mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-4xl font-bold text-white mb-2">
            🎨 Creative Studio for Car Sales
          </h1>
          <p className="text-gray-400">Create professional social media content in seconds</p>
        </div>

        {/* Tabs */}
        <div className="bg-gray-800/50 backdrop-blur-lg rounded-xl p-2 mb-6 flex gap-2">
          <Button
            variant={activeTab === 'templates' ? 'default' : 'ghost'}
            className="flex-1"
            onClick={() => setActiveTab('templates')}
          >
            <ImageIcon className="w-4 h-4 mr-2" />
            Templates
          </Button>
          <Button
            variant={activeTab === 'strategy' ? 'default' : 'ghost'}
            className="flex-1"
            onClick={() => setActiveTab('strategy')}
          >
            <TrendingUp className="w-4 h-4 mr-2" />
            Growth Strategies
          </Button>
        </div>

        {/* Content */}
        {activeTab === 'templates' && renderTemplatesTab()}
        {activeTab === 'strategy' && renderStrategyTab()}
      </div>
    </div>
  );
};

export default CreativeStudioPractical;
