import React, { useState, useEffect, useRef } from 'react';
import { Canvas as FabricCanvas, IText, Rect as FabricRect, Circle as FabricCircle, Line as FabricLine, Image as FabricImage } from 'fabric';
import { ChromePicker } from 'react-color';
import axios from 'axios';
import { Card, CardContent } from './components/ui/card';
import { Button } from './components/ui/button';
import { Input } from './components/ui/input';
import { Label } from './components/ui/label';
import { Textarea } from './components/ui/textarea';
import { Badge } from './components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './components/ui/dialog';
import { toast } from 'sonner';
import {
  Palette, Type, Image, Square, Circle, Minus, Pencil, Eraser,
  Undo, Redo, Download, Save, Upload, Trash2, Eye, Layers,
  ZoomIn, ZoomOut, Maximize2, Sparkles, Wand2, TrendingUp,
  Hash, Calendar, Target, Plus, Copy, AlignLeft, AlignCenter,
  AlignRight, Bold, Italic, Underline, Globe, Smartphone,
  Monitor, Tablet, FileText, Search, Star, FolderOpen, Layout,
  BarChart3, Lightbulb, Camera, Instagram, Facebook, Music
} from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Automotive-specific templates
const AUTOMOTIVE_TEMPLATES = [
  {
    id: 'new-arrival',
    name: 'New Arrival',
    category: 'inventory',
    description: 'Showcase new vehicle arrivals',
    thumbnail: '🚗',
    elements: [
      { type: 'text', text: 'JUST ARRIVED', fontSize: 48, fontWeight: 'bold', top: 50, left: 50 },
      { type: 'text', text: '2024 Model', fontSize: 32, top: 120, left: 50 },
      { type: 'text', text: 'Visit us today!', fontSize: 24, top: 400, left: 50 }
    ]
  },
  {
    id: 'sale-promo',
    name: 'Sale Promotion',
    category: 'marketing',
    description: 'Big sale event promotion',
    thumbnail: '💰',
    elements: [
      { type: 'text', text: 'HUGE SALE', fontSize: 56, fontWeight: 'bold', fill: '#ff0000', top: 100, left: 100 },
      { type: 'text', text: 'UP TO 30% OFF', fontSize: 42, top: 180, left: 100 },
      { type: 'text', text: 'Limited Time Only', fontSize: 28, top: 350, left: 100 }
    ]
  },
  {
    id: 'service-special',
    name: 'Service Special',
    category: 'service',
    description: 'Promote service specials',
    thumbnail: '🔧',
    elements: [
      { type: 'text', text: 'SERVICE SPECIAL', fontSize: 44, fontWeight: 'bold', top: 80, left: 80 },
      { type: 'text', text: 'Oil Change $29.99', fontSize: 36, top: 150, left: 80 },
      { type: 'text', text: 'Schedule Now!', fontSize: 28, top: 380, left: 80 }
    ]
  },
  {
    id: 'financing',
    name: 'Financing Offer',
    category: 'financing',
    description: 'Promote financing options',
    thumbnail: '📊',
    elements: [
      { type: 'text', text: '0% APR', fontSize: 64, fontWeight: 'bold', fill: '#00aa00', top: 120, left: 120 },
      { type: 'text', text: 'for 60 months', fontSize: 32, top: 200, left: 120 },
      { type: 'text', text: 'On select models', fontSize: 24, top: 360, left: 120 }
    ]
  },
  {
    id: 'testimonial',
    name: 'Customer Testimonial',
    category: 'social',
    description: 'Share customer reviews',
    thumbnail: '⭐',
    elements: [
      { type: 'text', text: '⭐⭐⭐⭐⭐', fontSize: 48, top: 100, left: 150 },
      { type: 'text', text: '"Best experience ever!"', fontSize: 28, fontStyle: 'italic', top: 180, left: 80 },
      { type: 'text', text: '- Happy Customer', fontSize: 22, top: 350, left: 150 }
    ]
  },
  {
    id: 'instagram-story',
    name: 'Instagram Story',
    category: 'social',
    description: 'Vertical Instagram story',
    thumbnail: '📱',
    size: { width: 1080, height: 1920 },
    elements: [
      { type: 'text', text: 'SWIPE UP', fontSize: 48, fontWeight: 'bold', top: 1700, left: 400 }
    ]
  }
];

// Growth strategies content
const GROWTH_STRATEGIES = {
  contentIdeas: [
    { id: 1, title: 'Behind the Scenes', description: 'Show your dealership team at work', engagement: 'High' },
    { id: 2, title: 'Customer Spotlights', description: 'Feature happy customers with their new cars', engagement: 'Very High' },
    { id: 3, title: 'Vehicle Features', description: 'Highlight unique features of new models', engagement: 'High' },
    { id: 4, title: 'Maintenance Tips', description: 'Share valuable car care advice', engagement: 'Medium' },
    { id: 5, title: 'Community Events', description: 'Showcase local sponsorships and events', engagement: 'High' },
    { id: 6, title: 'Staff Introductions', description: 'Introduce your sales team members', engagement: 'Medium' },
    { id: 7, title: 'Before & After', description: 'Show trade-in transformations', engagement: 'High' },
    { id: 8, title: 'Quick Tours', description: '60-second vehicle walkarounds', engagement: 'Very High' }
  ],
  bestTimes: [
    { platform: 'Instagram', time: '11:00 AM - 1:00 PM', days: 'Wed, Thu, Fri', engagement: '2.3x' },
    { platform: 'Facebook', time: '1:00 PM - 3:00 PM', days: 'Wed, Thu', engagement: '1.8x' },
    { platform: 'TikTok', time: '6:00 PM - 9:00 PM', days: 'Tue, Wed, Fri', engagement: '3.1x' },
    { platform: 'LinkedIn', time: '7:00 AM - 9:00 AM', days: 'Tue, Wed, Thu', engagement: '1.5x' }
  ],
  hashtags: [
    { tag: '#CarDeals', volume: '125K', competition: 'Medium' },
    { tag: '#NewCarDay', volume: '89K', competition: 'Low' },
    { tag: '#DealershipLife', volume: '45K', competition: 'Low' },
    { tag: '#AutoSales', volume: '203K', competition: 'High' },
    { tag: '#CarShopping', volume: '156K', competition: 'Medium' },
    { tag: '#TestDrive', volume: '67K', competition: 'Low' },
    { tag: '#FinancingAvailable', volume: '34K', competition: 'Low' },
    { tag: '#TradeIn', volume: '52K', competition: 'Medium' }
  ],
  engagementTactics: [
    { tactic: 'Ask Questions', example: 'What\'s your dream car?', effectiveness: '4.5/5' },
    { tactic: 'Run Polls', example: 'Sedan or SUV?', effectiveness: '4.2/5' },
    { tactic: 'Share User Content', example: 'Repost customer photos', effectiveness: '4.8/5' },
    { tactic: 'Go Live', example: 'Live inventory tours', effectiveness: '4.6/5' },
    { tactic: 'Use CTAs', example: 'Schedule test drive today!', effectiveness: '4.3/5' },
    { tactic: 'Create Urgency', example: 'Limited time offer', effectiveness: '4.4/5' }
  ]
};

const CreativeStudioNew = () => {
  const canvasRef = useRef(null);
  const [canvas, setCanvas] = useState(null);
  const [activeTab, setActiveTab] = useState('canvas');
  const [selectedTool, setSelectedTool] = useState('select');
  const [selectedObject, setSelectedObject] = useState(null);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [currentColor, setCurrentColor] = useState('#000000');
  const [layers, setLayers] = useState([]);
  const [templates, setTemplates] = useState(AUTOMOTIVE_TEMPLATES);
  const [showTemplateDialog, setShowTemplateDialog] = useState(false);
  const [showAIDialog, setShowAIDialog] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [canvasSize, setCanvasSize] = useState({ width: 1080, height: 1080 });
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Initialize canvas
  useEffect(() => {
    if (canvasRef.current && !canvas) {
      const fabricCanvas = new Canvas(canvasRef.current, {
        width: canvasSize.width,
        height: canvasSize.height,
        backgroundColor: '#ffffff'
      });

      // Add selection event handlers
      fabricCanvas.on('selection:created', (e) => {
        setSelectedObject(e.selected[0]);
      });

      fabricCanvas.on('selection:updated', (e) => {
        setSelectedObject(e.selected[0]);
      });

      fabricCanvas.on('selection:cleared', () => {
        setSelectedObject(null);
      });

      fabricCanvas.on('object:modified', updateLayers);
      fabricCanvas.on('object:added', updateLayers);
      fabricCanvas.on('object:removed', updateLayers);

      setCanvas(fabricCanvas);
    }
  }, []);

  const updateLayers = () => {
    if (canvas) {
      const objects = canvas.getObjects();
      setLayers(objects.map((obj, index) => ({
        id: obj.id || `layer-${index}`,
        type: obj.type,
        name: obj.name || `${obj.type} ${index + 1}`
      })));
    }
  };

  // Tool handlers
  const addText = () => {
    if (!canvas) return;
    const text = new IText('Double click to edit', {
      left: 100,
      top: 100,
      fontSize: 32,
      fill: currentColor,
      fontFamily: 'Arial'
    });
    canvas.add(text);
    canvas.setActiveObject(text);
  };

  const addShape = (shape) => {
    if (!canvas) return;
    let obj;
    
    switch (shape) {
      case 'rectangle':
        obj = new Rect({
          left: 100,
          top: 100,
          width: 200,
          height: 150,
          fill: currentColor,
          stroke: '#000',
          strokeWidth: 2
        });
        break;
      case 'circle':
        obj = new Circle({
          left: 100,
          top: 100,
          radius: 75,
          fill: currentColor,
          stroke: '#000',
          strokeWidth: 2
        });
        break;
      case 'line':
        obj = new Line([50, 100, 250, 100], {
          stroke: currentColor,
          strokeWidth: 3
        });
        break;
    }
    
    if (obj) {
      canvas.add(obj);
      canvas.setActiveObject(obj);
    }
  };

  const uploadImage = (e) => {
    const file = e.target.files[0];
    if (file && canvas) {
      const reader = new FileReader();
      reader.onload = (event) => {
        FabricImage.fromURL(event.target.result).then((img) => {
          img.scaleToWidth(300);
          canvas.add(img);
          canvas.setActiveObject(img);
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const deleteSelected = () => {
    if (canvas && selectedObject) {
      canvas.remove(selectedObject);
      setSelectedObject(null);
    }
  };

  const clearCanvas = () => {
    if (canvas) {
      canvas.clear();
      canvas.backgroundColor = '#ffffff';
      canvas.renderAll();
    }
  };

  const exportCanvas = (format = 'png') => {
    if (!canvas) return;
    
    const dataURL = canvas.toDataURL({
      format: format,
      quality: 1.0,
      multiplier: 2
    });

    const link = document.createElement('a');
    link.download = `design-${Date.now()}.${format}`;
    link.href = dataURL;
    link.click();
    
    toast.success('Design exported successfully!');
  };

  const applyTemplate = (template) => {
    if (!canvas) return;
    
    canvas.clear();
    canvas.backgroundColor = '#ffffff';
    
    if (template.size) {
      canvas.setWidth(template.size.width);
      canvas.setHeight(template.size.height);
      setCanvasSize(template.size);
    }
    
    template.elements.forEach(element => {
      if (element.type === 'text') {
        const text = new IText(element.text, {
          left: element.left,
          top: element.top,
          fontSize: element.fontSize,
          fill: element.fill || '#000000',
          fontWeight: element.fontWeight || 'normal',
          fontStyle: element.fontStyle || 'normal'
        });
        canvas.add(text);
      }
    });
    
    canvas.renderAll();
    setShowTemplateDialog(false);
    toast.success(`Template "${template.name}" applied!`);
  };

  const generateAIContent = async () => {
    if (!aiPrompt.trim()) {
      toast.error('Please enter a description');
      return;
    }

    try {
      toast.info('Generating AI content...');
      
      // Simulate AI generation (replace with actual API call)
      setTimeout(() => {
        if (canvas) {
          const aiText = new IText(`AI Generated: ${aiPrompt}`, {
            left: 100,
            top: 100,
            fontSize: 36,
            fill: '#4F46E5',
            fontWeight: 'bold'
          });
          canvas.add(aiText);
        }
        
        setShowAIDialog(false);
        setAiPrompt('');
        toast.success('AI content generated!');
      }, 2000);
    } catch (error) {
      toast.error('Failed to generate AI content');
    }
  };

  const resizeCanvas = (preset) => {
    if (!canvas) return;
    
    const sizes = {
      'instagram-post': { width: 1080, height: 1080, name: 'Instagram Post (1:1)' },
      'instagram-story': { width: 1080, height: 1920, name: 'Instagram Story (9:16)' },
      'facebook-post': { width: 1200, height: 630, name: 'Facebook Post (1.91:1)' },
      'youtube-thumbnail': { width: 1280, height: 720, name: 'YouTube Thumbnail (16:9)' }
    };
    
    const size = sizes[preset];
    if (size) {
      canvas.setWidth(size.width);
      canvas.setHeight(size.height);
      setCanvasSize({ width: size.width, height: size.height });
      toast.success(`Resized to ${size.name}`);
    }
  };

  // Render different tabs
  const renderCanvasTab = () => (
    <div className="flex gap-4 h-full">
      {/* Left Toolbar */}
      <div className="w-20 bg-gray-800/50 backdrop-blur-lg rounded-xl p-2 space-y-2">
        <Button
          variant={selectedTool === 'select' ? 'default' : 'ghost'}
          className="w-full h-14 flex flex-col items-center justify-center"
          onClick={() => setSelectedTool('select')}
        >
          <Maximize2 className="w-5 h-5" />
          <span className="text-xs mt-1">Select</span>
        </Button>
        
        <Button
          variant={selectedTool === 'text' ? 'default' : 'ghost'}
          className="w-full h-14 flex flex-col items-center justify-center"
          onClick={() => {
            setSelectedTool('text');
            addText();
          }}
        >
          <Type className="w-5 h-5" />
          <span className="text-xs mt-1">Text</span>
        </Button>
        
        <Button
          variant="ghost"
          className="w-full h-14 flex flex-col items-center justify-center"
          onClick={() => document.getElementById('image-upload').click()}
        >
          <Image className="w-5 h-5" />
          <span className="text-xs mt-1">Image</span>
        </Button>
        <input
          id="image-upload"
          type="file"
          accept="image/*"
          onChange={uploadImage}
          className="hidden"
        />
        
        <Button
          variant="ghost"
          className="w-full h-14 flex flex-col items-center justify-center"
          onClick={() => addShape('rectangle')}
        >
          <Square className="w-5 h-5" />
          <span className="text-xs mt-1">Shape</span>
        </Button>
        
        <div className="border-t border-gray-600 my-2"></div>
        
        <Button
          variant="ghost"
          className="w-full h-14 flex flex-col items-center justify-center"
          onClick={() => setShowColorPicker(!showColorPicker)}
        >
          <Palette className="w-5 h-5" />
          <div 
            className="w-6 h-2 rounded mt-1" 
            style={{ backgroundColor: currentColor }}
          ></div>
        </Button>
        
        <Button
          variant="ghost"
          className="w-full h-14 flex flex-col items-center justify-center"
          onClick={deleteSelected}
          disabled={!selectedObject}
        >
          <Trash2 className="w-5 h-5" />
          <span className="text-xs mt-1">Delete</span>
        </Button>
      </div>

      {/* Canvas Area */}
      <div className="flex-1 flex flex-col">
        {/* Top Toolbar */}
        <div className="bg-gray-800/50 backdrop-blur-lg rounded-xl p-3 mb-4 flex items-center justify-between">
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setShowTemplateDialog(true)}>
              <Layout className="w-4 h-4 mr-2" />
              Templates
            </Button>
            <Button variant="outline" size="sm" onClick={() => setShowAIDialog(true)}>
              <Sparkles className="w-4 h-4 mr-2" />
              AI Generate
            </Button>
            <Button variant="outline" size="sm" onClick={clearCanvas}>
              <Eraser className="w-4 h-4 mr-2" />
              Clear
            </Button>
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => exportCanvas('png')}>
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        {/* Canvas Container */}
        <div className="flex-1 bg-gray-800/30 rounded-xl p-6 flex items-center justify-center overflow-auto">
          <div className="bg-white shadow-2xl" style={{ 
            width: canvasSize.width, 
            height: canvasSize.height,
            maxWidth: '100%',
            maxHeight: '100%'
          }}>
            <canvas ref={canvasRef} />
          </div>
        </div>

        {/* Bottom Toolbar - Platform Presets */}
        <div className="bg-gray-800/50 backdrop-blur-lg rounded-xl p-3 mt-4 flex items-center gap-2 overflow-x-auto">
          <span className="text-sm text-gray-300 mr-2">Quick Resize:</span>
          <Button variant="ghost" size="sm" onClick={() => resizeCanvas('instagram-post')}>
            <Instagram className="w-4 h-4 mr-1" />
            IG Post
          </Button>
          <Button variant="ghost" size="sm" onClick={() => resizeCanvas('instagram-story')}>
            <Smartphone className="w-4 h-4 mr-1" />
            IG Story
          </Button>
          <Button variant="ghost" size="sm" onClick={() => resizeCanvas('facebook-post')}>
            <Facebook className="w-4 h-4 mr-1" />
            FB Post
          </Button>
          <Button variant="ghost" size="sm" onClick={() => resizeCanvas('youtube-thumbnail')}>
            <Monitor className="w-4 h-4 mr-1" />
            YouTube
          </Button>
        </div>
      </div>

      {/* Right Properties Panel */}
      <div className="w-80 bg-gray-800/50 backdrop-blur-lg rounded-xl p-4 space-y-4 overflow-y-auto">
        <h3 className="text-lg font-semibold text-white">Properties</h3>
        
        {selectedObject ? (
          <div className="space-y-4">
            <div>
              <Label className="text-gray-300">Type</Label>
              <Badge className="mt-1">{selectedObject.type}</Badge>
            </div>
            
            {selectedObject.type === 'i-text' && (
              <>
                <div>
                  <Label className="text-gray-300">Font Size</Label>
                  <Input
                    type="number"
                    value={selectedObject.fontSize || 16}
                    onChange={(e) => {
                      selectedObject.set('fontSize', parseInt(e.target.value));
                      canvas.renderAll();
                    }}
                    className="mt-1"
                  />
                </div>
                
                <div className="flex gap-2">
                  <Button
                    variant={selectedObject.fontWeight === 'bold' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => {
                      selectedObject.set('fontWeight', selectedObject.fontWeight === 'bold' ? 'normal' : 'bold');
                      canvas.renderAll();
                    }}
                  >
                    <Bold className="w-4 h-4" />
                  </Button>
                  <Button
                    variant={selectedObject.fontStyle === 'italic' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => {
                      selectedObject.set('fontStyle', selectedObject.fontStyle === 'italic' ? 'normal' : 'italic');
                      canvas.renderAll();
                    }}
                  >
                    <Italic className="w-4 h-4" />
                  </Button>
                </div>
              </>
            )}
            
            <div>
              <Label className="text-gray-300">Opacity</Label>
              <Input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={selectedObject.opacity || 1}
                onChange={(e) => {
                  selectedObject.set('opacity', parseFloat(e.target.value));
                  canvas.renderAll();
                }}
                className="mt-1"
              />
            </div>
          </div>
        ) : (
          <div className="text-center text-gray-400 py-8">
            <p>Select an object to edit properties</p>
          </div>
        )}

        <div className="border-t border-gray-600 pt-4">
          <h4 className="text-sm font-semibold text-white mb-2">Layers</h4>
          <div className="space-y-1">
            {layers.map((layer, index) => (
              <div
                key={layer.id}
                className="bg-gray-700/50 p-2 rounded cursor-pointer hover:bg-gray-700"
                onClick={() => {
                  const obj = canvas.getObjects()[index];
                  canvas.setActiveObject(obj);
                  canvas.renderAll();
                }}
              >
                <span className="text-sm text-gray-300">{layer.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Color Picker Dialog */}
      {showColorPicker && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setShowColorPicker(false)}>
          <div className="bg-gray-800 p-4 rounded-xl" onClick={(e) => e.stopPropagation()}>
            <ChromePicker
              color={currentColor}
              onChange={(color) => setCurrentColor(color.hex)}
            />
            <Button className="w-full mt-4" onClick={() => setShowColorPicker(false)}>
              Done
            </Button>
          </div>
        </div>
      )}
    </div>
  );

  const renderTemplatesTab = () => {
    const filteredTemplates = templates.filter(t => {
      const matchesSearch = t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          t.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || t.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });

    return (
      <div className="space-y-4">
        <div className="flex gap-4">
          <div className="flex-1">
            <Input
              placeholder="Search templates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-gray-800/50"
            />
          </div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-2 bg-gray-800/50 text-white rounded-lg border border-gray-600"
          >
            <option value="all">All Categories</option>
            <option value="inventory">Inventory</option>
            <option value="marketing">Marketing</option>
            <option value="service">Service</option>
            <option value="financing">Financing</option>
            <option value="social">Social Media</option>
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTemplates.map(template => (
            <Card key={template.id} className="bg-gray-800/50 backdrop-blur-lg border-gray-600 hover:border-purple-500 transition cursor-pointer" onClick={() => applyTemplate(template)}>
              <CardContent className="p-6">
                <div className="text-6xl text-center mb-4">{template.thumbnail}</div>
                <h3 className="text-lg font-semibold text-white mb-2">{template.name}</h3>
                <p className="text-sm text-gray-400 mb-4">{template.description}</p>
                <Badge>{template.category}</Badge>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  };

  const renderGrowthTab = () => (
    <div className="space-y-6">
      {/* Content Ideas */}
      <Card className="bg-gray-800/50 backdrop-blur-lg border-gray-600">
        <CardContent className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <Lightbulb className="w-6 h-6 text-yellow-400" />
            <h3 className="text-xl font-bold text-white">Content Ideas</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {GROWTH_STRATEGIES.contentIdeas.map(idea => (
              <div key={idea.id} className="bg-gray-700/50 p-4 rounded-lg">
                <h4 className="font-semibold text-white mb-2">{idea.title}</h4>
                <p className="text-sm text-gray-400 mb-2">{idea.description}</p>
                <Badge variant={idea.engagement === 'Very High' ? 'default' : 'secondary'}>
                  {idea.engagement} Engagement
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Best Times to Post */}
      <Card className="bg-gray-800/50 backdrop-blur-lg border-gray-600">
        <CardContent className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <Calendar className="w-6 h-6 text-blue-400" />
            <h3 className="text-xl font-bold text-white">Best Times to Post</h3>
          </div>
          <div className="space-y-3">
            {GROWTH_STRATEGIES.bestTimes.map((time, index) => (
              <div key={index} className="flex items-center justify-between bg-gray-700/50 p-4 rounded-lg">
                <div>
                  <h4 className="font-semibold text-white">{time.platform}</h4>
                  <p className="text-sm text-gray-400">{time.time}</p>
                  <p className="text-xs text-gray-500">{time.days}</p>
                </div>
                <Badge className="bg-green-600">{time.engagement} higher engagement</Badge>
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
            <h3 className="text-xl font-bold text-white">Trending Hashtags</h3>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {GROWTH_STRATEGIES.hashtags.map((hashtag, index) => (
              <div key={index} className="bg-gray-700/50 p-3 rounded-lg">
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

      {/* Engagement Tactics */}
      <Card className="bg-gray-800/50 backdrop-blur-lg border-gray-600">
        <CardContent className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <Target className="w-6 h-6 text-red-400" />
            <h3 className="text-xl font-bold text-white">Engagement Tactics</h3>
          </div>
          <div className="space-y-3">
            {GROWTH_STRATEGIES.engagementTactics.map((tactic, index) => (
              <div key={index} className="bg-gray-700/50 p-4 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold text-white">{tactic.tactic}</h4>
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-400" />
                    <span className="text-sm text-gray-300">{tactic.effectiveness}</span>
                  </div>
                </div>
                <p className="text-sm text-gray-400 italic">"{tactic.example}"</p>
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
          <h1 className="text-4xl font-bold text-white mb-2">Creative Studio</h1>
          <p className="text-gray-400">Professional design tools for automotive marketing</p>
        </div>

        {/* Tabs */}
        <div className="bg-gray-800/50 backdrop-blur-lg rounded-xl p-2 mb-6 flex gap-2">
          <Button
            variant={activeTab === 'canvas' ? 'default' : 'ghost'}
            className="flex-1"
            onClick={() => setActiveTab('canvas')}
          >
            <Palette className="w-4 h-4 mr-2" />
            Design Canvas
          </Button>
          <Button
            variant={activeTab === 'templates' ? 'default' : 'ghost'}
            className="flex-1"
            onClick={() => setActiveTab('templates')}
          >
            <Layout className="w-4 h-4 mr-2" />
            Templates
          </Button>
          <Button
            variant={activeTab === 'growth' ? 'default' : 'ghost'}
            className="flex-1"
            onClick={() => setActiveTab('growth')}
          >
            <TrendingUp className="w-4 h-4 mr-2" />
            Growth Strategies
          </Button>
        </div>

        {/* Content */}
        <div className="min-h-[600px]">
          {activeTab === 'canvas' && renderCanvasTab()}
          {activeTab === 'templates' && renderTemplatesTab()}
          {activeTab === 'growth' && renderGrowthTab()}
        </div>

        {/* Template Selection Dialog */}
        <Dialog open={showTemplateDialog} onOpenChange={setShowTemplateDialog}>
          <DialogContent className="max-w-4xl bg-gray-800 text-white">
            <DialogHeader>
              <DialogTitle>Choose a Template</DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-3 gap-4 max-h-96 overflow-y-auto">
              {templates.map(template => (
                <div
                  key={template.id}
                  className="bg-gray-700 p-4 rounded-lg cursor-pointer hover:bg-gray-600 transition"
                  onClick={() => applyTemplate(template)}
                >
                  <div className="text-4xl text-center mb-2">{template.thumbnail}</div>
                  <h4 className="text-sm font-semibold text-center">{template.name}</h4>
                </div>
              ))}
            </div>
          </DialogContent>
        </Dialog>

        {/* AI Generation Dialog */}
        <Dialog open={showAIDialog} onOpenChange={setShowAIDialog}>
          <DialogContent className="bg-gray-800 text-white">
            <DialogHeader>
              <DialogTitle>AI Content Generator</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Describe what you want to create</Label>
                <Textarea
                  placeholder="e.g., Create a bold car sale promotion with red and yellow colors..."
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  rows={4}
                  className="mt-2 bg-gray-700 text-white"
                />
              </div>
              <Button onClick={generateAIContent} className="w-full">
                <Sparkles className="w-4 h-4 mr-2" />
                Generate
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default CreativeStudioNew;
