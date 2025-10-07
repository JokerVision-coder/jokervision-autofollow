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
import { 
  UserX, Clock, Phone, Mail, MessageSquare, AlertCircle, CheckCircle2,
  Calendar, DollarSign, Car, Users, TrendingUp, Target, Zap,
  Plus, Eye, Edit, Trash2, Search, Filter, RefreshCw, Send
} from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const WalkInTracker = () => {
  const [walkInCustomers, setWalkInCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [followUpStats, setFollowUpStats] = useState({});
  const [filters, setFilters] = useState({
    status: 'all',
    priority: 'all',
    dateRange: 'today'
  });

  useEffect(() => {
    fetchWalkInCustomers();
    fetchFollowUpStats();
  }, [filters]);

  const fetchWalkInCustomers = async () => {
    try {
      setLoading(true);
      // Mock data for now - will integrate with backend
      const mockData = generateMockWalkIns();
      setWalkInCustomers(mockData);
    } catch (error) {
      console.error('Error fetching walk-in customers:', error);
      setWalkInCustomers(generateMockWalkIns());
    } finally {
      setLoading(false);
    }
  };

  const fetchFollowUpStats = async () => {
    setFollowUpStats({
      totalWalkIns: 23,
      pendingFollowUp: 18,
      contacted: 5,
      converted: 2,
      conversionRate: 8.7,
      avgResponseTime: '2.3 hours'
    });
  };

  const generateMockWalkIns = () => {
    const statuses = ['pending', 'contacted', 'scheduled', 'converted', 'lost'];
    const priorities = ['high', 'medium', 'low'];
    const reasons = [
      'Price too high', 'Wanted different color', 'Financing issues', 
      'Comparing options', 'Spouse approval needed', 'Trade-in value low',
      'Looking for specific features', 'Timing not right'
    ];

    return Array.from({ length: 23 }, (_, index) => ({
      id: `walkin_${index + 1}`,
      customerName: `Customer ${index + 1}`,
      phone: `(555) ${String(Math.floor(Math.random() * 900) + 100)}-${String(Math.floor(Math.random() * 9000) + 1000)}`,
      email: `customer${index + 1}@email.com`,
      visitDate: new Date(Date.now() - Math.random() * 3 * 24 * 60 * 60 * 1000).toISOString(),
      interestedVehicle: `2024 Toyota Camry LE`,
      budget: 25000 + Math.floor(Math.random() * 30000),
      status: statuses[Math.floor(Math.random() * statuses.length)],
      priority: priorities[Math.floor(Math.random() * priorities.length)],
      reasonNotBought: reasons[Math.floor(Math.random() * reasons.length)],
      salesperson: `Sales Rep ${Math.floor(Math.random() * 5) + 1}`,
      notes: 'Customer showed strong interest but needed time to think.',
      followUpScheduled: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      aiScore: Math.floor(Math.random() * 40) + 60, // 60-100 range
      contactAttempts: Math.floor(Math.random() * 3),
      lastContactDate: Math.random() > 0.5 ? new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000).toISOString() : null
    }));
  };

  const handleFollowUp = async (customerId, method) => {
    const customer = walkInCustomers.find(c => c.id === customerId);
    if (!customer) return;

    try {
      if (method === 'sms') {
        // Integrate with existing SMS system
        toast.success(`📱 SMS follow-up sent to ${customer.customerName}`);
      } else if (method === 'call') {
        // Integrate with voice AI system
        toast.success(`📞 AI voice call initiated to ${customer.customerName}`);
      } else if (method === 'email') {
        toast.success(`📧 Email follow-up sent to ${customer.customerName}`);
      }

      // Update status
      setWalkInCustomers(prev => prev.map(c => 
        c.id === customerId 
          ? { ...c, status: 'contacted', lastContactDate: new Date().toISOString(), contactAttempts: c.contactAttempts + 1 }
          : c
      ));

    } catch (error) {
      toast.error('Failed to send follow-up');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-red-600 text-white';
      case 'contacted': return 'bg-blue-600 text-white';
      case 'scheduled': return 'bg-yellow-600 text-white';
      case 'converted': return 'bg-green-600 text-white';
      case 'lost': return 'bg-gray-600 text-white';
      default: return 'bg-gray-600 text-white';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'text-red-400 bg-red-900/40';
      case 'medium': return 'text-yellow-400 bg-yellow-900/40';
      case 'low': return 'text-green-400 bg-green-900/40';
      default: return 'text-gray-400 bg-gray-900/40';
    }
  };

  const filteredCustomers = walkInCustomers.filter(customer => {
    if (filters.status !== 'all' && customer.status !== filters.status) return false;
    if (filters.priority !== 'all' && customer.priority !== filters.priority) return false;
    // Add date filtering logic here
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
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-indigo-900 p-6">
      <div className="container mx-auto">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-red-400 via-pink-400 to-purple-400 bg-clip-text text-transparent mb-2">
              🚶 Walk-In Customer Tracker
            </h1>
            <p className="text-xl text-gray-300">
              Revolutionary follow-up system for customers who didn't buy - 
              <span className="text-green-400 ml-2">Convert Lost Opportunities!</span>
            </p>
          </div>
          
          <div className="flex gap-3">
            <Button 
              onClick={() => setShowAddModal(true)}
              className="btn-neon"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Walk-In
            </Button>
            
            <Button 
              onClick={fetchWalkInCustomers}
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
              <Users className="w-8 h-8 mx-auto mb-2 text-blue-400" />
              <div className="text-2xl font-bold text-glass-bright">{followUpStats.totalWalkIns}</div>
              <div className="text-sm text-glass-muted">Total Walk-Ins</div>
            </CardContent>
          </Card>
          
          <Card className="glass-card">
            <CardContent className="p-4 text-center">
              <AlertCircle className="w-8 h-8 mx-auto mb-2 text-red-400" />
              <div className="text-2xl font-bold text-red-400">{followUpStats.pendingFollowUp}</div>
              <div className="text-sm text-glass-muted">Pending Follow-Up</div>
            </CardContent>
          </Card>
          
          <Card className="glass-card">
            <CardContent className="p-4 text-center">
              <Phone className="w-8 h-8 mx-auto mb-2 text-green-400" />
              <div className="text-2xl font-bold text-green-400">{followUpStats.contacted}</div>
              <div className="text-sm text-glass-muted">Contacted</div>
            </CardContent>
          </Card>
          
          <Card className="glass-card">
            <CardContent className="p-4 text-center">
              <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-purple-400" />
              <div className="text-2xl font-bold text-purple-400">{followUpStats.converted}</div>
              <div className="text-sm text-glass-muted">Converted</div>
            </CardContent>
          </Card>
          
          <Card className="glass-card">
            <CardContent className="p-4 text-center">
              <TrendingUp className="w-8 h-8 mx-auto mb-2 text-yellow-400" />
              <div className="text-2xl font-bold text-yellow-400">{followUpStats.conversionRate}%</div>
              <div className="text-sm text-glass-muted">Conversion Rate</div>
            </CardContent>
          </Card>
          
          <Card className="glass-card">
            <CardContent className="p-4 text-center">
              <Clock className="w-8 h-8 mx-auto mb-2 text-cyan-400" />
              <div className="text-2xl font-bold text-cyan-400">{followUpStats.avgResponseTime}</div>
              <div className="text-sm text-glass-muted">Avg Response</div>
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
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="contacted">Contacted</SelectItem>
                    <SelectItem value="scheduled">Scheduled</SelectItem>
                    <SelectItem value="converted">Converted</SelectItem>
                    <SelectItem value="lost">Lost</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label className="text-glass text-sm">Priority Filter</Label>
                <Select value={filters.priority} onValueChange={(value) => setFilters(prev => ({...prev, priority: value}))}>
                  <SelectTrigger className="w-40 glass-card text-glass">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="modal-glass">
                    <SelectItem value="all">All Priority</SelectItem>
                    <SelectItem value="high">High Priority</SelectItem>
                    <SelectItem value="medium">Medium Priority</SelectItem>
                    <SelectItem value="low">Low Priority</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex-1" />
              
              <Badge className="bg-blue-600 text-white">
                {filteredCustomers.length} customers
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Customer List */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredCustomers.map((customer) => (
            <Card key={customer.id} className="glass-card hover:scale-105 transition-all duration-300">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg text-glass-bright">{customer.customerName}</CardTitle>
                    <CardDescription className="text-glass-muted">{customer.interestedVehicle}</CardDescription>
                  </div>
                  
                  <div className="flex gap-2">
                    <Badge className={getStatusColor(customer.status)}>
                      {customer.status}
                    </Badge>
                    <Badge className={getPriorityColor(customer.priority)}>
                      {customer.priority}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="text-glass-muted">Visit Date</div>
                    <div className="text-glass-bright">{new Date(customer.visitDate).toLocaleDateString()}</div>
                  </div>
                  <div>
                    <div className="text-glass-muted">Budget</div>
                    <div className="text-glass-bright">${customer.budget?.toLocaleString()}</div>
                  </div>
                  <div>
                    <div className="text-glass-muted">AI Score</div>
                    <div className="text-glass-bright">{customer.aiScore}%</div>
                  </div>
                  <div>
                    <div className="text-glass-muted">Attempts</div>
                    <div className="text-glass-bright">{customer.contactAttempts}</div>
                  </div>
                </div>
                
                <div>
                  <div className="text-glass-muted text-sm">Reason Not Bought</div>
                  <div className="text-glass-bright text-sm">{customer.reasonNotBought}</div>
                </div>
                
                <div>
                  <div className="text-glass-muted text-sm">Notes</div>
                  <div className="text-glass-bright text-sm">{customer.notes}</div>
                </div>
                
                {customer.status === 'pending' && (
                  <div className="bg-red-900/40 p-3 rounded-lg">
                    <div className="text-red-400 font-semibold text-sm flex items-center">
                      <AlertCircle className="w-4 h-4 mr-2" />
                      URGENT: Follow-up needed!
                    </div>
                  </div>
                )}
                
                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    onClick={() => handleFollowUp(customer.id, 'sms')}
                    className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 text-white"
                  >
                    <MessageSquare className="w-3 h-3 mr-1" />
                    SMS
                  </Button>
                  <Button 
                    size="sm" 
                    onClick={() => handleFollowUp(customer.id, 'call')}
                    className="flex-1 bg-gradient-to-r from-blue-500 to-cyan-500 text-white"
                  >
                    <Phone className="w-3 h-3 mr-1" />
                    Call
                  </Button>
                  <Button 
                    size="sm" 
                    onClick={() => handleFollowUp(customer.id, 'email')}
                    className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white"
                  >
                    <Mail className="w-3 h-3 mr-1" />
                    Email
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Add Walk-In Modal */}
        {showAddModal && (
          <AddWalkInModal 
            isOpen={showAddModal}
            onClose={() => setShowAddModal(false)}
            onAdd={(newCustomer) => {
              setWalkInCustomers(prev => [newCustomer, ...prev]);
              setShowAddModal(false);
              toast.success('Walk-in customer added successfully!');
            }}
          />
        )}
      </div>
    </div>
  );
};

// Add Walk-In Modal Component
const AddWalkInModal = ({ isOpen, onClose, onAdd }) => {
  const [formData, setFormData] = useState({
    customerName: '',
    phone: '',
    email: '',
    interestedVehicle: '',
    budget: '',
    priority: 'medium',
    reasonNotBought: '',
    salesperson: '',
    notes: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const newCustomer = {
      id: `walkin_${Date.now()}`,
      ...formData,
      visitDate: new Date().toISOString(),
      status: 'pending',
      followUpScheduled: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      aiScore: Math.floor(Math.random() * 40) + 60,
      contactAttempts: 0,
      lastContactDate: null,
      budget: parseFloat(formData.budget) || 0
    };
    
    onAdd(newCustomer);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="modal-glass max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-glass-bright">Add Walk-In Customer</DialogTitle>
          <DialogDescription className="text-glass-muted">
            Track customers who visited but didn't purchase for immediate follow-up
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
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
              <Label className="text-glass">Interested Vehicle *</Label>
              <Input
                name="interestedVehicle"
                value={formData.interestedVehicle}
                onChange={handleChange}
                required
                className="text-glass"
                placeholder="2024 Toyota Camry LE"
              />
            </div>
            
            <div>
              <Label className="text-glass">Budget</Label>
              <Input
                name="budget"
                type="number"
                value={formData.budget}
                onChange={handleChange}
                className="text-glass"
                placeholder="35000"
              />
            </div>
            
            <div>
              <Label className="text-glass">Priority</Label>
              <Select value={formData.priority} onValueChange={(value) => setFormData({...formData, priority: value})}>
                <SelectTrigger className="glass-card text-glass">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="modal-glass">
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div>
            <Label className="text-glass">Reason Not Bought</Label>
            <Select value={formData.reasonNotBought} onValueChange={(value) => setFormData({...formData, reasonNotBought: value})}>
              <SelectTrigger className="glass-card text-glass">
                <SelectValue placeholder="Select reason" />
              </SelectTrigger>
              <SelectContent className="modal-glass">
                <SelectItem value="Price too high">Price too high</SelectItem>
                <SelectItem value="Wanted different color">Wanted different color</SelectItem>
                <SelectItem value="Financing issues">Financing issues</SelectItem>
                <SelectItem value="Comparing options">Comparing options</SelectItem>
                <SelectItem value="Spouse approval needed">Spouse approval needed</SelectItem>
                <SelectItem value="Trade-in value low">Trade-in value low</SelectItem>
                <SelectItem value="Looking for specific features">Looking for specific features</SelectItem>
                <SelectItem value="Timing not right">Timing not right</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label className="text-glass">Salesperson</Label>
            <Input
              name="salesperson"
              value={formData.salesperson}
              onChange={handleChange}
              className="text-glass"
              placeholder="Sales Rep Name"
            />
          </div>
          
          <div>
            <Label className="text-glass">Notes</Label>
            <Textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              className="text-glass"
              placeholder="Additional notes about the customer interaction..."
              rows={3}
            />
          </div>
          
          <div className="flex gap-3 pt-4">
            <Button type="button" onClick={onClose} variant="outline" className="flex-1">
              Cancel
            </Button>
            <Button type="submit" className="flex-1 btn-neon">
              Add Customer
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default WalkInTracker;