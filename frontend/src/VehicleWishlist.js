import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import { Button } from './components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './components/ui/card';
import { Input } from './components/ui/input';
import { Label } from './components/ui/label';
import { Badge } from './components/ui/badge';
import { Textarea } from './components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './components/ui/dialog';
import { Checkbox } from './components/ui/checkbox';
import { 
  Search, Bell, Car, Users, Clock, CheckCircle2, AlertTriangle,
  Phone, Mail, MessageSquare, Plus, Eye, Edit, Trash2, 
  Calendar, DollarSign, Star, Target, Zap, RefreshCw, Send,
  CarIcon, Truck, Bike, Plane, Heart, BookmarkPlus, TrendingUp
} from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const VehicleWishlist = () => {
  const [wishlistRequests, setWishlistRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showMatchModal, setShowMatchModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [availableInventory, setAvailableInventory] = useState([]);
  const [wishlistStats, setWishlistStats] = useState({});
  const [filters, setFilters] = useState({
    status: 'all',
    urgency: 'all',
    make: 'all'
  });

  useEffect(() => {
    fetchWishlistRequests();
    fetchWishlistStats();
    fetchAvailableInventory();
  }, [filters]);

  const fetchWishlistRequests = async () => {
    try {
      setLoading(true);
      // Mock data for now - will integrate with backend
      const mockData = generateMockWishlist();
      setWishlistRequests(mockData);
    } catch (error) {
      console.error('Error fetching wishlist requests:', error);
      setWishlistRequests(generateMockWishlist());
    } finally {
      setLoading(false);
    }
  };

  const fetchWishlistStats = async () => {
    setWishlistStats({
      totalRequests: 47,
      activeRequests: 34,
      fulfilledRequests: 13,
      avgWaitTime: '5.2 days',
      conversionRate: 72.3,
      urgentRequests: 8
    });
  };

  const fetchAvailableInventory = async () => {
    // Mock available inventory
    const mockInventory = Array.from({ length: 25 }, (_, index) => ({
      id: `inv_${index + 1}`,
      year: 2023 + Math.floor(Math.random() * 2),
      make: ['Toyota', 'Honda', 'Ford', 'Chevrolet', 'Nissan'][Math.floor(Math.random() * 5)],
      model: ['Camry', 'Accord', 'F-150', 'Silverado', 'Altima'][Math.floor(Math.random() * 5)],
      trim: ['Base', 'LX', 'EX', 'Limited'][Math.floor(Math.random() * 4)],
      color: ['White', 'Black', 'Silver', 'Blue', 'Red'][Math.floor(Math.random() * 5)],
      price: 25000 + Math.floor(Math.random() * 30000),
      mileage: Math.floor(Math.random() * 50000),
      arrivalDate: new Date(Date.now() + Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString()
    }));
    setAvailableInventory(mockInventory);
  };

  const generateMockWishlist = () => {
    const makes = ['Toyota', 'Honda', 'Ford', 'Chevrolet', 'Nissan', 'BMW', 'Mercedes', 'Audi'];
    const models = ['Camry', 'Accord', 'F-150', 'Silverado', 'Altima', 'X3', 'C-Class', 'A4'];
    const statuses = ['active', 'fulfilled', 'expired', 'cancelled'];
    const urgencyLevels = ['low', 'medium', 'high', 'urgent'];

    return Array.from({ length: 47 }, (_, index) => {
      const make = makes[Math.floor(Math.random() * makes.length)];
      const model = models[Math.floor(Math.random() * models.length)];
      
      return {
        id: `wish_${index + 1}`,
        customerName: `Customer ${index + 1}`,
        phone: `(555) ${String(Math.floor(Math.random() * 900) + 100)}-${String(Math.floor(Math.random() * 9000) + 1000)}`,
        email: `customer${index + 1}@email.com`,
        requestDate: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
        
        // Vehicle specifications
        desiredYear: 2022 + Math.floor(Math.random() * 3),
        desiredMake: make,
        desiredModel: model,
        desiredTrim: ['Base', 'LX', 'EX', 'Limited', 'Sport'][Math.floor(Math.random() * 5)],
        desiredColor: ['White', 'Black', 'Silver', 'Blue', 'Red', 'Gray'][Math.floor(Math.random() * 6)],
        maxBudget: 30000 + Math.floor(Math.random() * 40000),
        maxMileage: Math.floor(Math.random() * 50000),
        
        // Request details
        status: statuses[Math.floor(Math.random() * statuses.length)],
        urgency: urgencyLevels[Math.floor(Math.random() * urgencyLevels.length)],
        flexibleSpecs: Math.random() > 0.5,
        willingToWait: Math.random() > 0.3,
        depositAmount: Math.random() > 0.6 ? 1000 + Math.floor(Math.random() * 4000) : 0,
        
        // Customer preferences
        preferredFeatures: ['Bluetooth', 'Backup Camera', 'Sunroof', 'Leather Seats', 'Navigation'],
        dealbreakers: ['Manual Transmission', 'Accident History'],
        timeframe: ['Immediate', '1-2 weeks', '1 month', '2-3 months'][Math.floor(Math.random() * 4)],
        
        // Sales info
        salesperson: `Sales Rep ${Math.floor(Math.random() * 5) + 1}`,
        notes: 'Customer is very specific about color and features. High conversion probability.',
        lastContactDate: Math.random() > 0.4 ? new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString() : null,
        
        // AI scoring
        aiMatchScore: Math.floor(Math.random() * 40) + 60, // 60-100 range
        conversionProbability: Math.floor(Math.random() * 50) + 50, // 50-100 range
        estimatedValue: 35000 + Math.floor(Math.random() * 25000),
        
        // Auto-notification preferences
        notifyBySMS: true,
        notifyByEmail: true,
        notifyByCall: Math.random() > 0.5,
        autoScheduleViewing: Math.random() > 0.3
      };
    });
  };

  const handleNotifyCustomer = async (requestId, vehicle = null) => {
    const request = wishlistRequests.find(r => r.id === requestId);
    if (!request) return;

    try {
      if (vehicle) {
        // Found matching vehicle - notify customer
        toast.success(`🎉 Perfect match found! Notifying ${request.customerName} about ${vehicle.year} ${vehicle.make} ${vehicle.model}`);
        
        // Send notifications based on preferences
        if (request.notifyBySMS) {
          toast.success(`📱 SMS notification sent to ${request.phone}`);
        }
        if (request.notifyByEmail) {
          toast.success(`📧 Email notification sent to ${request.email}`);
        }
        if (request.notifyByCall) {
          toast.success(`📞 Auto-call scheduled to ${request.phone}`);
        }
        
        // Update request status
        setWishlistRequests(prev => prev.map(r => 
          r.id === requestId 
            ? { ...r, status: 'fulfilled', lastContactDate: new Date().toISOString() }
            : r
        ));
        
      } else {
        // Manual follow-up notification
        toast.success(`📬 Follow-up notification sent to ${request.customerName}`);
      }

    } catch (error) {
      toast.error('Failed to send notification');
    }
  };

  const handleAutoMatch = () => {
    let matchesFound = 0;
    
    wishlistRequests.filter(r => r.status === 'active').forEach(request => {
      const matches = availableInventory.filter(vehicle => 
        vehicle.make.toLowerCase() === request.desiredMake.toLowerCase() &&
        vehicle.model.toLowerCase() === request.desiredModel.toLowerCase() &&
        vehicle.year >= request.desiredYear - 1 && vehicle.year <= request.desiredYear + 1 &&
        vehicle.price <= request.maxBudget * 1.1 // 10% budget flexibility
      );
      
      if (matches.length > 0) {
        matchesFound++;
        handleNotifyCustomer(request.id, matches[0]);
      }
    });

    if (matchesFound > 0) {
      toast.success(`🎯 Found ${matchesFound} perfect matches! Customers being notified now.`);
    } else {
      toast.info('🔍 No matches found in current inventory. Keep monitoring!');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-600 text-white';
      case 'fulfilled': return 'bg-blue-600 text-white';
      case 'expired': return 'bg-yellow-600 text-white';
      case 'cancelled': return 'bg-gray-600 text-white';
      default: return 'bg-gray-600 text-white';
    }
  };

  const getUrgencyColor = (urgency) => {
    switch (urgency) {
      case 'urgent': return 'text-red-400 bg-red-900/40';
      case 'high': return 'text-orange-400 bg-orange-900/40';
      case 'medium': return 'text-yellow-400 bg-yellow-900/40';
      case 'low': return 'text-green-400 bg-green-900/40';
      default: return 'text-gray-400 bg-gray-900/40';
    }
  };

  const filteredRequests = wishlistRequests.filter(request => {
    if (filters.status !== 'all' && request.status !== filters.status) return false;
    if (filters.urgency !== 'all' && request.urgency !== filters.urgency) return false;
    if (filters.make !== 'all' && request.desiredMake !== filters.make) return false;
    return true;
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="spinner-neon"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-indigo-900 p-6">
      <div className="container mx-auto">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 via-cyan-400 to-teal-400 bg-clip-text text-transparent mb-2">
              🔔 Vehicle Wishlist & Auto-Notifications
            </h1>
            <p className="text-xl text-gray-300">
              Revolutionary system to notify customers when their desired vehicle arrives - 
              <span className="text-green-400 ml-2">Never Miss a Sale!</span>
            </p>
          </div>
          
          <div className="flex gap-3">
            <Button 
              onClick={handleAutoMatch}
              className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white"
            >
              <Zap className="w-4 h-4 mr-2" />
              AI Auto-Match
            </Button>
            
            <Button 
              onClick={() => setShowAddModal(true)}
              className="btn-neon"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Request
            </Button>
            
            <Button 
              onClick={fetchWishlistRequests}
              className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          <Card className="glass-card">
            <CardContent className="p-4 text-center">
              <BookmarkPlus className="w-8 h-8 mx-auto mb-2 text-blue-400" />
              <div className="text-2xl font-bold text-glass-bright">{wishlistStats.totalRequests}</div>
              <div className="text-sm text-glass-muted">Total Requests</div>
            </CardContent>
          </Card>
          
          <Card className="glass-card">
            <CardContent className="p-4 text-center">
              <Clock className="w-8 h-8 mx-auto mb-2 text-green-400" />
              <div className="text-2xl font-bold text-green-400">{wishlistStats.activeRequests}</div>
              <div className="text-sm text-glass-muted">Active Requests</div>
            </CardContent>
          </Card>
          
          <Card className="glass-card">
            <CardContent className="p-4 text-center">
              <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-purple-400" />
              <div className="text-2xl font-bold text-purple-400">{wishlistStats.fulfilledRequests}</div>
              <div className="text-sm text-glass-muted">Fulfilled</div>
            </CardContent>
          </Card>
          
          <Card className="glass-card">
            <CardContent className="p-4 text-center">
              <AlertTriangle className="w-8 h-8 mx-auto mb-2 text-red-400" />
              <div className="text-2xl font-bold text-red-400">{wishlistStats.urgentRequests}</div>
              <div className="text-sm text-glass-muted">Urgent</div>
            </CardContent>
          </Card>
          
          <Card className="glass-card">
            <CardContent className="p-4 text-center">
              <TrendingUp className="w-8 h-8 mx-auto mb-2 text-yellow-400" />
              <div className="text-2xl font-bold text-yellow-400">{wishlistStats.conversionRate}%</div>
              <div className="text-sm text-glass-muted">Conversion Rate</div>
            </CardContent>
          </Card>
          
          <Card className="glass-card">
            <CardContent className="p-4 text-center">
              <Calendar className="w-8 h-8 mx-auto mb-2 text-cyan-400" />
              <div className="text-2xl font-bold text-cyan-400">{wishlistStats.avgWaitTime}</div>
              <div className="text-sm text-glass-muted">Avg Wait Time</div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="glass-card mb-6">
          <CardContent className="p-4">
            <div className="flex gap-4 items-center">
              <div>
                <Label className="text-glass text-sm">Status Filter</Label>
                <Select value={filters.status} onValueChange={(value) => setFilters(prev => ({...prev, status: value}))}>
                  <SelectTrigger className="w-40 glass-card text-glass">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="modal-glass">
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="fulfilled">Fulfilled</SelectItem>
                    <SelectItem value="expired">Expired</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label className="text-glass text-sm">Urgency Filter</Label>
                <Select value={filters.urgency} onValueChange={(value) => setFilters(prev => ({...prev, urgency: value}))}>
                  <SelectTrigger className="w-40 glass-card text-glass">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="modal-glass">
                    <SelectItem value="all">All Urgency</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label className="text-glass text-sm">Make Filter</Label>
                <Select value={filters.make} onValueChange={(value) => setFilters(prev => ({...prev, make: value}))}>
                  <SelectTrigger className="w-40 glass-card text-glass">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="modal-glass">
                    <SelectItem value="all">All Makes</SelectItem>
                    <SelectItem value="Toyota">Toyota</SelectItem>
                    <SelectItem value="Honda">Honda</SelectItem>
                    <SelectItem value="Ford">Ford</SelectItem>
                    <SelectItem value="Chevrolet">Chevrolet</SelectItem>
                    <SelectItem value="Nissan">Nissan</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex-1" />
              
              <Badge className="bg-blue-600 text-white">
                {filteredRequests.length} requests
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Wishlist Requests */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredRequests.map((request) => (
            <Card key={request.id} className="glass-card hover:scale-105 transition-all duration-300">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg text-glass-bright">{request.customerName}</CardTitle>
                    <CardDescription className="text-glass-muted">
                      {request.desiredYear} {request.desiredMake} {request.desiredModel}
                    </CardDescription>
                  </div>
                  
                  <div className="flex gap-2 flex-col">
                    <Badge className={getStatusColor(request.status)}>
                      {request.status}
                    </Badge>
                    <Badge className={getUrgencyColor(request.urgency)}>
                      {request.urgency}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="text-glass-muted">Request Date</div>
                    <div className="text-glass-bright">{new Date(request.requestDate).toLocaleDateString()}</div>
                  </div>
                  <div>
                    <div className="text-glass-muted">Max Budget</div>
                    <div className="text-glass-bright">${request.maxBudget?.toLocaleString()}</div>
                  </div>
                  <div>
                    <div className="text-glass-muted">AI Match Score</div>
                    <div className="text-glass-bright">{request.aiMatchScore}%</div>
                  </div>
                  <div>
                    <div className="text-glass-muted">Timeframe</div>
                    <div className="text-glass-bright">{request.timeframe}</div>
                  </div>
                </div>
                
                <div>
                  <div className="text-glass-muted text-sm">Desired Color</div>
                  <div className="text-glass-bright text-sm">{request.desiredColor} {request.desiredTrim}</div>
                </div>
                
                <div>
                  <div className="text-glass-muted text-sm">Customer Preferences</div>
                  <div className="text-glass-bright text-sm">
                    Max {request.maxMileage?.toLocaleString()} miles
                    {request.depositAmount > 0 && (
                      <Badge className="ml-2 bg-green-600 text-white">
                        ${request.depositAmount} deposit ready
                      </Badge>
                    )}
                  </div>
                </div>
                
                <div>
                  <div className="text-glass-muted text-sm">Notification Preferences</div>
                  <div className="flex gap-1">
                    {request.notifyBySMS && <Badge className="bg-blue-600 text-white text-xs">SMS</Badge>}
                    {request.notifyByEmail && <Badge className="bg-green-600 text-white text-xs">Email</Badge>}
                    {request.notifyByCall && <Badge className="bg-purple-600 text-white text-xs">Call</Badge>}
                    {request.autoScheduleViewing && <Badge className="bg-orange-600 text-white text-xs">Auto-Schedule</Badge>}
                  </div>
                </div>
                
                {request.status === 'active' && request.urgency === 'urgent' && (
                  <div className="bg-red-900/40 p-3 rounded-lg">
                    <div className="text-red-400 font-semibold text-sm flex items-center">
                      <AlertTriangle className="w-4 h-4 mr-2" />
                      URGENT: High-priority customer waiting!
                    </div>
                  </div>
                )}
                
                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    onClick={() => handleNotifyCustomer(request.id)}
                    className="flex-1 bg-gradient-to-r from-blue-500 to-cyan-500 text-white"
                  >
                    <Bell className="w-3 h-3 mr-1" />
                    Notify
                  </Button>
                  <Button 
                    size="sm" 
                    onClick={() => {setSelectedRequest(request); setShowMatchModal(true);}}
                    className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 text-white"
                  >
                    <Search className="w-3 h-3 mr-1" />
                    Find Match
                  </Button>
                  <Button 
                    size="sm" 
                    className="bg-gradient-to-r from-purple-500 to-pink-500 text-white"
                  >
                    <Edit className="w-3 h-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Modals */}
        {showAddModal && (
          <AddWishlistModal 
            isOpen={showAddModal}
            onClose={() => setShowAddModal(false)}
            onAdd={(newRequest) => {
              setWishlistRequests(prev => [newRequest, ...prev]);
              setShowAddModal(false);
              toast.success('Wishlist request added successfully!');
            }}
          />
        )}

        {showMatchModal && selectedRequest && (
          <VehicleMatchModal 
            isOpen={showMatchModal}
            onClose={() => {setShowMatchModal(false); setSelectedRequest(null);}}
            request={selectedRequest}
            availableInventory={availableInventory}
            onNotifyMatch={handleNotifyCustomer}
          />
        )}
      </div>
    </div>
  );
};

// Add Wishlist Request Modal
const AddWishlistModal = ({ isOpen, onClose, onAdd }) => {
  const [formData, setFormData] = useState({
    customerName: '',
    phone: '',
    email: '',
    desiredYear: new Date().getFullYear(),
    desiredMake: '',
    desiredModel: '',
    desiredTrim: '',
    desiredColor: '',
    maxBudget: '',
    maxMileage: '',
    urgency: 'medium',
    timeframe: '1 month',
    depositAmount: '',
    notifyBySMS: true,
    notifyByEmail: true,
    notifyByCall: false,
    autoScheduleViewing: false,
    salesperson: '',
    notes: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const newRequest = {
      id: `wish_${Date.now()}`,
      ...formData,
      requestDate: new Date().toISOString(),
      status: 'active',
      flexibleSpecs: true,
      willingToWait: true,
      preferredFeatures: [],
      dealbreakers: [],
      lastContactDate: null,
      aiMatchScore: Math.floor(Math.random() * 40) + 60,
      conversionProbability: Math.floor(Math.random() * 50) + 50,
      estimatedValue: parseFloat(formData.maxBudget) || 35000,
      maxBudget: parseFloat(formData.maxBudget) || 0,
      maxMileage: parseFloat(formData.maxMileage) || 0,
      depositAmount: parseFloat(formData.depositAmount) || 0
    };
    
    onAdd(newRequest);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({ 
      ...formData, 
      [name]: type === 'checkbox' ? checked : value 
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="modal-glass max-w-4xl">
        <DialogHeader>
          <DialogTitle className="text-glass-bright">Add Vehicle Wishlist Request</DialogTitle>
          <DialogDescription className="text-glass-muted">
            Track customers looking for specific vehicles and notify them when available
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 max-h-96 overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-glass">Customer Name *</Label>
              <Input
                name="customerName"
                value={formData.customerName}
                onChange={handleChange}
                required
                className="text-glass"
                placeholder="John Doe"
              />
            </div>
            
            <div>
              <Label className="text-glass">Phone *</Label>
              <Input
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleChange}
                required
                className="text-glass"
                placeholder="(555) 123-4567"
              />
            </div>
            
            <div>
              <Label className="text-glass">Email</Label>
              <Input
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                className="text-glass"
                placeholder="john@email.com"
              />
            </div>
            
            <div>
              <Label className="text-glass">Desired Year</Label>
              <Input
                name="desiredYear"
                type="number"
                value={formData.desiredYear}
                onChange={handleChange}
                className="text-glass"
                min="2015"
                max="2025"
              />
            </div>
            
            <div>
              <Label className="text-glass">Make *</Label>
              <Input
                name="desiredMake"
                value={formData.desiredMake}
                onChange={handleChange}
                required
                className="text-glass"
                placeholder="Toyota"
              />
            </div>
            
            <div>
              <Label className="text-glass">Model *</Label>
              <Input
                name="desiredModel"
                value={formData.desiredModel}
                onChange={handleChange}
                required
                className="text-glass"
                placeholder="Camry"
              />
            </div>
            
            <div>
              <Label className="text-glass">Trim</Label>
              <Input
                name="desiredTrim"
                value={formData.desiredTrim}
                onChange={handleChange}
                className="text-glass"
                placeholder="LE"
              />
            </div>
            
            <div>
              <Label className="text-glass">Desired Color</Label>
              <Select value={formData.desiredColor} onValueChange={(value) => setFormData({...formData, desiredColor: value})}>
                <SelectTrigger className="glass-card text-glass">
                  <SelectValue placeholder="Any Color" />
                </SelectTrigger>
                <SelectContent className="modal-glass">
                  <SelectItem value="White">White</SelectItem>
                  <SelectItem value="Black">Black</SelectItem>
                  <SelectItem value="Silver">Silver</SelectItem>
                  <SelectItem value="Blue">Blue</SelectItem>
                  <SelectItem value="Red">Red</SelectItem>
                  <SelectItem value="Gray">Gray</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label className="text-glass">Max Budget *</Label>
              <Input
                name="maxBudget"
                type="number"
                value={formData.maxBudget}
                onChange={handleChange}
                required
                className="text-glass"
                placeholder="45000"
              />
            </div>
            
            <div>
              <Label className="text-glass">Max Mileage</Label>
              <Input
                name="maxMileage"
                type="number"
                value={formData.maxMileage}
                onChange={handleChange}
                className="text-glass"
                placeholder="30000"
              />
            </div>
            
            <div>
              <Label className="text-glass">Urgency</Label>
              <Select value={formData.urgency} onValueChange={(value) => setFormData({...formData, urgency: value})}>
                <SelectTrigger className="glass-card text-glass">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="modal-glass">
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label className="text-glass">Timeframe</Label>
              <Select value={formData.timeframe} onValueChange={(value) => setFormData({...formData, timeframe: value})}>
                <SelectTrigger className="glass-card text-glass">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="modal-glass">
                  <SelectItem value="Immediate">Immediate</SelectItem>
                  <SelectItem value="1-2 weeks">1-2 weeks</SelectItem>
                  <SelectItem value="1 month">1 month</SelectItem>
                  <SelectItem value="2-3 months">2-3 months</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div>
            <Label className="text-glass">Deposit Amount (Optional)</Label>
            <Input
              name="depositAmount"
              type="number"
              value={formData.depositAmount}
              onChange={handleChange}
              className="text-glass"
              placeholder="2500"
            />
          </div>
          
          <div>
            <Label className="text-glass mb-3 block">Notification Preferences</Label>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  name="notifyBySMS"
                  checked={formData.notifyBySMS}
                  onCheckedChange={(checked) => setFormData({...formData, notifyBySMS: checked})}
                />
                <Label className="text-glass">SMS Notifications</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  name="notifyByEmail"
                  checked={formData.notifyByEmail}
                  onCheckedChange={(checked) => setFormData({...formData, notifyByEmail: checked})}
                />
                <Label className="text-glass">Email Notifications</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  name="notifyByCall"
                  checked={formData.notifyByCall}
                  onCheckedChange={(checked) => setFormData({...formData, notifyByCall: checked})}
                />
                <Label className="text-glass">Phone Call Notifications</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  name="autoScheduleViewing"
                  checked={formData.autoScheduleViewing}
                  onCheckedChange={(checked) => setFormData({...formData, autoScheduleViewing: checked})}
                />
                <Label className="text-glass">Auto-Schedule Viewing</Label>
              </div>
            </div>
          </div>
          
          <div>
            <Label className="text-glass">Notes</Label>
            <Textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              className="text-glass"
              placeholder="Additional customer preferences or notes..."
              rows={3}
            />
          </div>
          
          <div className="flex gap-3 pt-4">
            <Button type="button" onClick={onClose} variant="outline" className="flex-1">
              Cancel
            </Button>
            <Button type="submit" className="flex-1 btn-neon">
              Add to Wishlist
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

// Vehicle Match Modal
const VehicleMatchModal = ({ isOpen, onClose, request, availableInventory, onNotifyMatch }) => {
  const matches = availableInventory.filter(vehicle => 
    vehicle.make.toLowerCase().includes(request.desiredMake.toLowerCase()) ||
    vehicle.model.toLowerCase().includes(request.desiredModel.toLowerCase()) ||
    (vehicle.price <= request.maxBudget * 1.2) // 20% budget flexibility
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="modal-glass max-w-4xl">
        <DialogHeader>
          <DialogTitle className="text-glass-bright">
            Find Matching Vehicles for {request.customerName}
          </DialogTitle>
          <DialogDescription className="text-glass-muted">
            Looking for: {request.desiredYear} {request.desiredMake} {request.desiredModel} - Budget: ${request.maxBudget?.toLocaleString()}
          </DialogDescription>
        </DialogHeader>
        
        <div className="max-h-96 overflow-y-auto">
          {matches.length === 0 ? (
            <div className="text-center py-8">
              <Car className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <p className="text-glass-muted">No matching vehicles found in current inventory.</p>
              <p className="text-glass-muted">The customer will be notified when a match arrives.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {matches.map((vehicle) => (
                <Card key={vehicle.id} className="glass-card">
                  <CardContent className="p-4">
                    <h4 className="font-semibold text-glass-bright mb-2">
                      {vehicle.year} {vehicle.make} {vehicle.model}
                    </h4>
                    <div className="space-y-1 text-sm text-glass-muted mb-3">
                      <div>Trim: {vehicle.trim}</div>
                      <div>Color: {vehicle.color}</div>
                      <div>Price: ${vehicle.price?.toLocaleString()}</div>
                      <div>Mileage: {vehicle.mileage?.toLocaleString()} miles</div>
                      <div>Arrival: {new Date(vehicle.arrivalDate).toLocaleDateString()}</div>
                    </div>
                    
                    <Button 
                      onClick={() => {
                        onNotifyMatch(request.id, vehicle);
                        onClose();
                      }}
                      className="w-full btn-neon"
                      size="sm"
                    >
                      <Bell className="w-3 h-3 mr-2" />
                      Notify Customer
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default VehicleWishlist;