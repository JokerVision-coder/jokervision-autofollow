import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link, useNavigate } from 'react-router-dom';
import { isMobile, isTablet, isDesktop } from 'react-device-detect';
import axios from 'axios';
import './App.css';
import { Button } from './components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './components/ui/card';
import { Input } from './components/ui/input';
import { Label } from './components/ui/label';
import { Textarea } from './components/ui/textarea';
import { Badge } from './components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './components/ui/select';
import { Switch } from './components/ui/switch';
import { toast, Toaster } from 'sonner';
import CreativeStudio from './CreativeStudio';
import { 
  Users, MessageSquare, Calendar, BarChart3, Plus, Send, Bot, Phone, Mail, 
  DollarSign, Briefcase, Clock, Settings, Zap, TrendingUp, PhoneCall, MessageCircle,
  Trophy, Target, UserPlus, Trash2, Eye, Edit, Car, Calculator, Palette, 
  Smartphone, Monitor, Tablet, Globe, TrendingDown
} from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Dashboard Component with Sales Focus
const Dashboard = () => {
  const [stats, setStats] = useState({});
  const [leads, setLeads] = useState([]);
  const [salesStats, setSalesStats] = useState({});
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
    fetchLeads();
    fetchSalesStats();
    fetchUsers();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await axios.get(`${API}/dashboard/stats`);
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
      toast.error('Failed to load dashboard stats');
    }
  };

  const fetchLeads = async () => {
    try {
      const response = await axios.get(`${API}/leads`);
      setLeads(response.data);
    } catch (error) {
      console.error('Error fetching leads:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSalesStats = async () => {
    try {
      const response = await axios.get(`${API}/sales/dashboard`);
      setSalesStats(response.data);
    } catch (error) {
      console.error('Error fetching sales stats:', error);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await axios.get(`${API}/users`);
      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
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
        <div className="mb-8 fade-in-up">
          <h1 className="text-5xl font-bold joker-brand mb-2">JokerVision AutoFollow</h1>
          <p className="text-glass-muted text-xl">Advanced Car Sales Management System</p>
        </div>

        {/* Sales Performance Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="glass-card glass-card-hover">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-glass">Units Sold This Month</CardTitle>
              <Car className="h-4 w-4 neon-purple" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-glass-bright">{salesStats.total_units || 0}</div>
              <p className="text-xs text-glass-muted">+20% from last month</p>
            </CardContent>
          </Card>

          <Card className="glass-card glass-card-hover">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-glass">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 neon-green" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold profit-positive">
                ${(salesStats.total_revenue || 0).toLocaleString()}
              </div>
              <p className="text-xs text-glass-muted">Monthly performance</p>
            </CardContent>
          </Card>

          <Card className="glass-card glass-card-hover">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-glass">Total Commission</CardTitle>
              <Trophy className="h-4 w-4 neon-orange" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold neon-orange">
                ${(salesStats.total_commission || 0).toLocaleString()}
              </div>
              <p className="text-xs text-glass-muted">Team earnings</p>
            </CardContent>
          </Card>

          <Card className="glass-card glass-card-hover">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-glass">Active Leads</CardTitle>
              <Target className="h-4 w-4 neon-cyan" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold neon-cyan">{stats.total_leads || 0}</div>
              <p className="text-xs text-glass-muted">Pipeline opportunities</p>
            </CardContent>
          </Card>
        </div>

        {/* Team Performance and Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Team Performance */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-xl text-glass-bright flex items-center">
                <Users className="w-5 h-5 mr-2 neon-purple" />
                Team Performance
              </CardTitle>
              <CardDescription className="text-glass-muted">Sales team statistics for this month</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(salesStats.salesperson_breakdown || {}).map(([userId, stats]) => (
                  <div key={userId} className="flex items-center justify-between p-4 glass-card rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-semibold">
                        {stats.name.charAt(0)}
                      </div>
                      <div>
                        <h3 className="font-semibold text-glass-bright">{stats.name}</h3>
                        <p className="text-sm text-glass-muted">{stats.units} units sold</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold profit-positive">${stats.commission.toLocaleString()}</div>
                      <div className="text-sm text-glass-muted">Commission</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent Leads */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-xl text-glass-bright flex items-center">
                <MessageSquare className="w-5 h-5 mr-2 neon-cyan" />
                Recent Leads
              </CardTitle>
              <CardDescription className="text-glass-muted">Latest customer inquiries</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {leads.slice(0, 5).map((lead, index) => (
                  <div key={lead.id} className={`flex items-center justify-between p-4 glass-card rounded-lg slide-in-right`} 
                       style={{animationDelay: `${index * 0.1}s`}}>
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
                        {lead.first_name[0]}{lead.last_name[0]}
                      </div>
                      <div>
                        <h3 className="font-semibold text-glass-bright">{lead.first_name} {lead.last_name}</h3>
                        <div className="flex items-center space-x-2 text-sm text-glass-muted">
                          <Phone className="h-3 w-3" />
                          <span>{lead.primary_phone}</span>
                          {lead.budget && (
                            <>
                              <DollarSign className="h-3 w-3 ml-2" />
                              <span>{lead.budget}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    <Badge className={`badge-neon ${lead.status === 'new' ? 'neon-cyan' : 
                      lead.status === 'contacted' ? 'neon-orange' : 
                      lead.status === 'scheduled' ? 'neon-green' : 'text-glass'}`}>
                      {lead.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

// Sales Dashboard Component
const SalesDashboard = () => {
  const [sales, setSales] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState('all');
  const [showAddSaleDialog, setShowAddSaleDialog] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSales();
    fetchUsers();
  }, [selectedUser]);

  const fetchSales = async () => {
    try {
      const params = selectedUser !== 'all' ? `?salesperson_id=${selectedUser}` : '';
      const response = await axios.get(`${API}/sales${params}`);
      setSales(response.data);
    } catch (error) {
      console.error('Error fetching sales:', error);
      toast.error('Failed to load sales data');
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await axios.get(`${API}/users`);
      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const getTierClass = (units) => {
    if (units >= 17) return 'tier-gold';
    if (units >= 15) return 'tier-silver';
    return 'tier-bronze';
  };

  const getCommissionRate = (units) => {
    if (units >= 17) return '20%';
    if (units >= 15) return '15%';
    return '12%';
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
            <h1 className="text-4xl font-bold text-glass-bright mb-2">Sales Dashboard</h1>
            <p className="text-glass-muted">Track sold vehicles and commission earnings</p>
          </div>
          <div className="flex space-x-3">
            <Select value={selectedUser} onValueChange={setSelectedUser}>
              <SelectTrigger className="w-48 glass-card text-glass">
                <SelectValue placeholder="Filter by salesperson" />
              </SelectTrigger>
              <SelectContent className="modal-glass">
                <SelectItem value="all">All Salespeople</SelectItem>
                {users.map(user => (
                  <SelectItem key={user.id} value={user.id}>{user.full_name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Dialog open={showAddSaleDialog} onOpenChange={setShowAddSaleDialog}>
              <DialogTrigger asChild>
                <Button className="btn-neon">
                  <Plus className="w-4 h-4 mr-2" />
                  Record Sale
                </Button>
              </DialogTrigger>
              <DialogContent className="modal-glass max-w-2xl">
                <DialogHeader>
                  <DialogTitle className="text-glass-bright">Record New Sale</DialogTitle>
                  <DialogDescription className="text-glass-muted">
                    Add a new vehicle sale to track commission
                  </DialogDescription>
                </DialogHeader>
                <AddSaleForm 
                  users={users}
                  onSuccess={() => { 
                    setShowAddSaleDialog(false); 
                    fetchSales(); 
                  }} 
                />
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Sales Table */}
        <Card className="glass-card">
          <CardContent className="p-0">
            <div className="table-glass">
              <table className="w-full">
                <thead>
                  <tr>
                    <th>Date Sold</th>
                    <th>Stock #</th>
                    <th>Vehicle</th>
                    <th>Customer</th>
                    <th>Sale Type</th>
                    <th>Front Profit</th>
                    <th>Back Profit</th>
                    <th>Commission Rate</th>
                    <th>Commission Earned</th>
                    <th>Salesperson</th>
                  </tr>
                </thead>
                <tbody>
                  {sales.map((sale) => {
                    const salesperson = users.find(u => u.id === sale.salesperson_id);
                    return (
                      <tr key={sale.id}>
                        <td>{new Date(sale.sale_date).toLocaleDateString()}</td>
                        <td className="font-mono text-glass-bright">{sale.stock_number}</td>
                        <td>
                          <div>
                            <div className="font-semibold text-glass-bright">
                              {sale.vehicle_year} {sale.vehicle_make} {sale.vehicle_model}
                            </div>
                            <div className="text-sm text-glass-muted">
                              ${sale.sale_price.toLocaleString()}
                            </div>
                          </div>
                        </td>
                        <td className="text-glass-bright">{sale.customer_name}</td>
                        <td>
                          <Badge className={`badge-neon ${sale.sale_type === 'full' ? 'neon-green' : 'neon-orange'}`}>
                            {sale.sale_type}
                          </Badge>
                        </td>
                        <td className="profit-positive font-semibold">
                          ${sale.front_profit.toLocaleString()}
                        </td>
                        <td className="profit-positive font-semibold">
                          ${sale.back_profit.toLocaleString()}
                        </td>
                        <td className={`font-bold ${getTierClass(1)}`}>
                          {(sale.commission_rate * 100).toFixed(0)}%
                        </td>
                        <td className="neon-green font-bold">
                          ${sale.commission_earned.toLocaleString()}
                        </td>
                        <td className="text-glass-bright">
                          {salesperson?.full_name || 'Unknown'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Commission Tiers Info */}
        <Card className="glass-card mt-6">
          <CardHeader>
            <CardTitle className="text-glass-bright flex items-center">
              <Trophy className="w-5 h-5 mr-2 neon-orange" />
              Commission Structure
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-4 glass-card rounded-lg">
                <div className="tier-bronze text-2xl font-bold mb-2">12%</div>
                <div className="text-glass">1-14 Units</div>
                <div className="text-sm text-glass-muted">Bronze Tier</div>
              </div>
              <div className="text-center p-4 glass-card rounded-lg">
                <div className="tier-silver text-2xl font-bold mb-2">15%</div>
                <div className="text-glass">15-16 Units</div>
                <div className="text-sm text-glass-muted">Silver Tier</div>
              </div>
              <div className="text-center p-4 glass-card rounded-lg">
                <div className="tier-gold text-2xl font-bold mb-2">20%</div>
                <div className="text-glass">17+ Units</div>
                <div className="text-sm text-glass-muted">Gold Tier</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

// Add Sale Form Component
const AddSaleForm = ({ users, onSuccess }) => {
  const [formData, setFormData] = useState({
    salesperson_id: '',
    stock_number: '',
    vehicle_make: '',
    vehicle_model: '',
    vehicle_year: new Date().getFullYear(),
    sale_type: 'full',
    sale_date: new Date().toISOString().split('T')[0],
    sale_price: '',
    cost_price: '',
    front_profit: '',
    back_profit: '',
    customer_name: '',
    financing_type: 'finance'
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const saleData = {
        ...formData,
        sale_date: new Date(formData.sale_date).toISOString(),
        sale_price: parseFloat(formData.sale_price),
        cost_price: parseFloat(formData.cost_price),
        front_profit: parseFloat(formData.front_profit),
        back_profit: parseFloat(formData.back_profit),
        vehicle_year: parseInt(formData.vehicle_year)
      };
      
      await axios.post(`${API}/sales`, saleData);
      toast.success('Sale recorded successfully!');
      onSuccess();
    } catch (error) {
      console.error('Error recording sale:', error);
      toast.error('Failed to record sale');
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-h-96 overflow-y-auto">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label className="text-glass">Salesperson *</Label>
          <Select value={formData.salesperson_id} onValueChange={(value) => setFormData({...formData, salesperson_id: value})}>
            <SelectTrigger className="glass-card text-glass">
              <SelectValue placeholder="Select salesperson" />
            </SelectTrigger>
            <SelectContent className="modal-glass">
              {users.map(user => (
                <SelectItem key={user.id} value={user.id}>{user.full_name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="text-glass">Stock Number *</Label>
          <Input
            name="stock_number"
            value={formData.stock_number}
            onChange={handleChange}
            required
            className="text-glass"
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <Label className="text-glass">Make *</Label>
          <Input
            name="vehicle_make"
            value={formData.vehicle_make}
            onChange={handleChange}
            required
            className="text-glass"
          />
        </div>
        <div>
          <Label className="text-glass">Model *</Label>
          <Input
            name="vehicle_model"
            value={formData.vehicle_model}
            onChange={handleChange}
            required
            className="text-glass"
          />
        </div>
        <div>
          <Label className="text-glass">Year *</Label>
          <Input
            name="vehicle_year"
            type="number"
            value={formData.vehicle_year}
            onChange={handleChange}
            required
            className="text-glass"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label className="text-glass">Sale Type</Label>
          <Select value={formData.sale_type} onValueChange={(value) => setFormData({...formData, sale_type: value})}>
            <SelectTrigger className="glass-card text-glass">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="modal-glass">
              <SelectItem value="full">Full Unit</SelectItem>
              <SelectItem value="half">Half Unit</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="text-glass">Sale Date *</Label>
          <Input
            name="sale_date"
            type="date"
            value={formData.sale_date}
            onChange={handleChange}
            required
            className="text-glass"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label className="text-glass">Sale Price *</Label>
          <Input
            name="sale_price"
            type="number"
            step="0.01"
            value={formData.sale_price}
            onChange={handleChange}
            required
            className="text-glass"
          />
        </div>
        <div>
          <Label className="text-glass">Cost Price *</Label>
          <Input
            name="cost_price"
            type="number"
            step="0.01"
            value={formData.cost_price}
            onChange={handleChange}
            required
            className="text-glass"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label className="text-glass">Front Profit *</Label>
          <Input
            name="front_profit"
            type="number"
            step="0.01"
            value={formData.front_profit}
            onChange={handleChange}
            required
            className="text-glass"
          />
        </div>
        <div>
          <Label className="text-glass">Back Profit *</Label>
          <Input
            name="back_profit"
            type="number"
            step="0.01"
            value={formData.back_profit}
            onChange={handleChange}
            required
            className="text-glass"
          />
        </div>
      </div>

      <div>
        <Label className="text-glass">Customer Name *</Label>
        <Input
          name="customer_name"
          value={formData.customer_name}
          onChange={handleChange}
          required
          className="text-glass"
        />
      </div>

      <Button type="submit" className="w-full btn-neon">
        Record Sale
      </Button>
    </form>
  );
};

// Team Management Component
const TeamManagement = () => {
  const [users, setUsers] = useState([]);
  const [showAddUserDialog, setShowAddUserDialog] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await axios.get(`${API}/users`);
      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to load team members');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to remove this team member?')) {
      try {
        await axios.delete(`${API}/users/${userId}`);
        toast.success('Team member removed successfully');
        fetchUsers();
      } catch (error) {
        console.error('Error deleting user:', error);
        toast.error('Failed to remove team member');
      }
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
            <h1 className="text-4xl font-bold text-glass-bright mb-2">Team Management</h1>
            <p className="text-glass-muted">Manage collaborators (Max 3 + Admin)</p>
          </div>
          <Dialog open={showAddUserDialog} onOpenChange={setShowAddUserDialog}>
            <DialogTrigger asChild>
              <Button className="btn-neon" disabled={users.length >= 4}>
                <UserPlus className="w-4 h-4 mr-2" />
                Add Collaborator
              </Button>
            </DialogTrigger>
            <DialogContent className="modal-glass">
              <DialogHeader>
                <DialogTitle className="text-glass-bright">Add New Collaborator</DialogTitle>
                <DialogDescription className="text-glass-muted">
                  Add a new team member to JokerVision AutoFollow
                </DialogDescription>
              </DialogHeader>
              <AddUserForm onSuccess={() => { setShowAddUserDialog(false); fetchUsers(); }} />
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {users.map((user) => (
            <Card key={user.id} className="glass-card glass-card-hover">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                      {user.full_name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <CardTitle className="text-glass-bright">{user.full_name}</CardTitle>
                      <p className="text-sm text-glass-muted">@{user.username}</p>
                    </div>
                  </div>
                  <Badge className={`badge-neon ${user.role === 'admin' ? 'neon-purple' : 'neon-cyan'}`}>
                    {user.role}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center text-sm text-glass-muted">
                    <Mail className="h-4 w-4 mr-2" />
                    {user.email}
                  </div>
                  <div className="flex items-center text-sm text-glass-muted">
                    <Calendar className="h-4 w-4 mr-2" />
                    Joined {new Date(user.created_at).toLocaleDateString()}
                  </div>
                </div>
                {user.role !== 'admin' && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteUser(user.id)}
                    className="mt-4 w-full text-red-400 border-red-400 hover:bg-red-400 hover:text-white"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Remove
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

// Leads Management Component
const LeadsManagement = () => {
  const [leads, setLeads] = useState([]);
  const [filteredLeads, setFilteredLeads] = useState([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddLeadDialog, setShowAddLeadDialog] = useState(false);
  const [selectedLead, setSelectedLead] = useState(null);
  const [showChatDialog, setShowChatDialog] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeads();
  }, []);

  useEffect(() => {
    // Filter leads based on status and search term
    let filtered = leads;
    
    if (statusFilter !== 'all') {
      filtered = filtered.filter(lead => lead.status === statusFilter);
    }
    
    if (searchTerm) {
      filtered = filtered.filter(lead => 
        `${lead.first_name} ${lead.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.primary_phone.includes(searchTerm) ||
        lead.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    setFilteredLeads(filtered);
  }, [leads, statusFilter, searchTerm]);

  const fetchLeads = async () => {
    try {
      const response = await axios.get(`${API}/leads`);
      setLeads(response.data);
    } catch (error) {
      console.error('Error fetching leads:', error);
      toast.error('Failed to load leads');
    } finally {
      setLoading(false);
    }
  };

  const handleSendSMS = async (leadId) => {
    try {
      await axios.post(`${API}/sms/send`, {
        lead_id: leadId,
        message: "Hello! This is a follow-up from JokerVision AutoFollow. Are you still interested in finding the perfect vehicle?"
      });
      toast.success('SMS sent successfully!');
      fetchLeads();
    } catch (error) {
      console.error('Error sending SMS:', error);
      toast.error('Failed to send SMS');
    }
  };

  const handleAIChat = (lead) => {
    setSelectedLead(lead);
    setShowChatDialog(true);
  };

  const handleScheduleAppointment = async (leadId) => {
    try {
      const appointmentData = {
        lead_id: leadId,
        appointment_date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Tomorrow
        appointment_type: "test_drive",
        notes: "Scheduled via leads management"
      };
      
      await axios.post(`${API}/appointments`, appointmentData);
      toast.success('Appointment scheduled successfully!');
      fetchLeads();
    } catch (error) {
      console.error('Error scheduling appointment:', error);
      toast.error('Failed to schedule appointment');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'new': return 'neon-cyan';
      case 'contacted': return 'neon-orange';
      case 'scheduled': return 'neon-green';
      case 'closed': return 'text-glass-muted';
      default: return 'text-glass';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'new': return <Target className="w-4 h-4" />;
      case 'contacted': return <Phone className="w-4 h-4" />;
      case 'scheduled': return <Calendar className="w-4 h-4" />;
      case 'closed': return <Trophy className="w-4 h-4" />;
      default: return <Users className="w-4 h-4" />;
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
            <h1 className="text-4xl font-bold text-glass-bright mb-2">Leads Management</h1>
            <p className="text-glass-muted">Manage and follow up with potential customers</p>
          </div>
          <Dialog open={showAddLeadDialog} onOpenChange={setShowAddLeadDialog}>
            <DialogTrigger asChild>
              <Button className="btn-neon">
                <Plus className="w-4 h-4 mr-2" />
                Add Lead
              </Button>
            </DialogTrigger>
            <DialogContent className="modal-glass max-w-2xl">
              <DialogHeader>
                <DialogTitle className="text-glass-bright">Add New Lead</DialogTitle>
                <DialogDescription className="text-glass-muted">
                  Add a new potential customer to the system
                </DialogDescription>
              </DialogHeader>
              <AddLeadForm onSuccess={() => { setShowAddLeadDialog(false); fetchLeads(); }} />
            </DialogContent>
          </Dialog>
        </div>

        {/* Filters and Search */}
        <Card className="glass-card mb-6">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <Input
                  placeholder="Search leads by name, phone, or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="text-glass"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-48 glass-card text-glass">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent className="modal-glass">
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="new">New</SelectItem>
                  <SelectItem value="contacted">Contacted</SelectItem>
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Leads Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="glass-card">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-glass-bright">{leads.length}</div>
              <div className="text-sm text-glass-muted">Total Leads</div>
            </CardContent>
          </Card>
          <Card className="glass-card">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold neon-cyan">{leads.filter(l => l.status === 'new').length}</div>
              <div className="text-sm text-glass-muted">New</div>
            </CardContent>
          </Card>
          <Card className="glass-card">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold neon-orange">{leads.filter(l => l.status === 'contacted').length}</div>
              <div className="text-sm text-glass-muted">Contacted</div>
            </CardContent>
          </Card>
          <Card className="glass-card">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold neon-green">{leads.filter(l => l.status === 'scheduled').length}</div>
              <div className="text-sm text-glass-muted">Scheduled</div>
            </CardContent>
          </Card>
        </div>

        {/* Leads Table */}
        <Card className="glass-card">
          <CardContent className="p-0">
            <div className="table-glass">
              <table className="w-full">
                <thead>
                  <tr>
                    <th className="text-left">Customer</th>
                    <th className="text-left">Contact</th>
                    <th className="text-left">Vehicle Interest</th>
                    <th className="text-left">Budget</th>
                    <th className="text-left">Status</th>
                    <th className="text-left">Last Contact</th>
                    <th className="text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLeads.map((lead, index) => (
                    <tr key={lead.id} className={`fade-in-up`} style={{animationDelay: `${index * 0.1}s`}}>
                      <td>
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
                            {lead.first_name[0]}{lead.last_name[0]}
                          </div>
                          <div>
                            <div className="font-semibold text-glass-bright">
                              {lead.first_name} {lead.last_name}
                            </div>
                            <div className="text-sm text-glass-muted">
                              {lead.address && lead.address.split(',')[0]}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="text-sm">
                          <div className="flex items-center text-glass-bright">
                            <Phone className="w-3 h-3 mr-2" />
                            {lead.primary_phone}
                          </div>
                          <div className="flex items-center text-glass-muted mt-1">
                            <Mail className="w-3 h-3 mr-2" />
                            {lead.email}
                          </div>
                        </div>
                      </td>
                      <td className="text-glass">{lead.vehicle_type || 'Not specified'}</td>
                      <td className="text-glass">{lead.budget || 'Not specified'}</td>
                      <td>
                        <Badge className={`badge-neon ${getStatusColor(lead.status)} flex items-center`}>
                          {getStatusIcon(lead.status)}
                          <span className="ml-1">{lead.status}</span>
                        </Badge>
                      </td>
                      <td className="text-glass-muted text-sm">
                        {lead.last_contacted 
                          ? new Date(lead.last_contacted).toLocaleDateString()
                          : 'Never'
                        }
                      </td>
                      <td>
                        <div className="flex justify-end space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleSendSMS(lead.id)}
                            className="text-blue-400 border-blue-400 hover:bg-blue-400 hover:text-white"
                          >
                            <MessageSquare className="w-3 h-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleAIChat(lead)}
                            className="text-purple-400 border-purple-400 hover:bg-purple-400 hover:text-white"
                          >
                            <Bot className="w-3 h-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleScheduleAppointment(lead.id)}
                            className="text-green-400 border-green-400 hover:bg-green-400 hover:text-white"
                          >
                            <Calendar className="w-3 h-3" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* AI Chat Dialog */}
        <Dialog open={showChatDialog} onOpenChange={setShowChatDialog}>
          <DialogContent className="modal-glass max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-glass-bright flex items-center">
                <Bot className="w-5 h-5 mr-2 neon-purple" />
                AI Chat Assistant
              </DialogTitle>
              <DialogDescription className="text-glass-muted">
                {selectedLead && `Chat with ${selectedLead.first_name} ${selectedLead.last_name}`}
              </DialogDescription>
            </DialogHeader>
            {selectedLead && (
              <AIChat 
                lead={selectedLead} 
                onClose={() => setShowChatDialog(false)}
                onSuccess={fetchLeads}
              />
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

// Add Lead Form Component
const AddLeadForm = ({ onSuccess }) => {
  const [formData, setFormData] = useState({
    tenant_id: 'default_dealership',
    first_name: '',
    last_name: '',
    primary_phone: '',
    email: '',
    budget: '',
    vehicle_type: '',
    address: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API}/leads`, formData);
      toast.success('Lead added successfully!');
      onSuccess();
    } catch (error) {
      console.error('Error adding lead:', error);
      toast.error('Failed to add lead');
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label className="text-glass">First Name *</Label>
          <Input
            name="first_name"
            value={formData.first_name}
            onChange={handleChange}
            required
            className="text-glass"
          />
        </div>
        <div>
          <Label className="text-glass">Last Name *</Label>
          <Input
            name="last_name"
            value={formData.last_name}
            onChange={handleChange}
            required
            className="text-glass"
          />
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label className="text-glass">Phone *</Label>
          <Input
            name="primary_phone"
            value={formData.primary_phone}
            onChange={handleChange}
            required
            className="text-glass"
          />
        </div>
        <div>
          <Label className="text-glass">Email *</Label>
          <Input
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            required
            className="text-glass"
          />
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label className="text-glass">Vehicle Type</Label>
          <Select value={formData.vehicle_type} onValueChange={(value) => setFormData({...formData, vehicle_type: value})}>
            <SelectTrigger className="glass-card text-glass">
              <SelectValue placeholder="Select vehicle type" />
            </SelectTrigger>
            <SelectContent className="modal-glass">
              <SelectItem value="sedan">Sedan</SelectItem>
              <SelectItem value="SUV">SUV</SelectItem>
              <SelectItem value="truck">Truck</SelectItem>
              <SelectItem value="car">Car</SelectItem>
              <SelectItem value="coupe">Coupe</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="text-glass">Budget</Label>
          <Input
            name="budget"
            value={formData.budget}
            onChange={handleChange}
            placeholder="e.g., $20,000-$30,000"
            className="text-glass"
          />
        </div>
      </div>
      
      <div>
        <Label className="text-glass">Address</Label>
        <Textarea
          name="address"
          value={formData.address}
          onChange={handleChange}
          className="text-glass"
          rows={2}
        />
      </div>
      
      <Button type="submit" className="w-full btn-neon">
        Add Lead
      </Button>
    </form>
  );
};

// Inventory Management Component
const InventoryManagement = () => {
  const [inventory, setInventory] = useState([]);
  const [summary, setSummary] = useState({});
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [filters, setFilters] = useState({
    make: '',
    model: '',
    year: '',
    condition: 'any',
    priceMin: '',
    priceMax: ''
  });

  useEffect(() => {
    fetchInventorySummary();
    fetchInventoryVehicles();
  }, []);

  const fetchInventorySummary = async () => {
    try {
      const response = await axios.get(`${API}/inventory/summary?tenant_id=default_dealership`);
      setSummary(response.data);
    } catch (error) {
      console.error('Error fetching inventory summary:', error);
      toast.error('Failed to load inventory summary');
    }
  };

  const fetchInventoryVehicles = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        tenant_id: 'default_dealership',
        limit: '50'
      });
      
      // Add filters
      Object.entries(filters).forEach(([key, value]) => {
        if (value && value !== 'any') {
          if (key === 'priceMin') params.append('price_min', value);
          else if (key === 'priceMax') params.append('price_max', value);
          else params.append(key, value);
        }
      });

      const response = await axios.get(`${API}/inventory/vehicles?${params}`);
      setInventory(response.data.vehicles || []);
    } catch (error) {
      console.error('Error fetching inventory:', error);
      toast.error('Failed to load inventory');
    } finally {
      setLoading(false);
    }
  };

  const syncInventory = async () => {
    try {
      setSyncing(true);
      await axios.post(`${API}/inventory/sync/default_dealership`);
      toast.success('Inventory sync started! This may take a few minutes.');
      
      // Refresh after a delay
      setTimeout(() => {
        fetchInventorySummary();
        fetchInventoryVehicles();
        setSyncing(false);
      }, 10000); // 10 seconds
    } catch (error) {
      console.error('Error syncing inventory:', error);
      toast.error('Failed to start inventory sync');
      setSyncing(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const applyFilters = () => {
    fetchInventoryVehicles();
  };

  const clearFilters = () => {
    setFilters({
      make: '',
      model: '',
      year: '',
      condition: 'any',
      priceMin: '',
      priceMax: ''
    });
    setTimeout(fetchInventoryVehicles, 100);
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(price);
  };

  return (
    <div className="min-h-screen p-6">
      <div className="container mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-glass-bright mb-2">Inventory Management</h1>
            <p className="text-glass-muted">Real-time dealership inventory from Shottenkirk Toyota</p>
          </div>
          <Button 
            onClick={syncInventory}
            disabled={syncing}
            className="btn-neon"
          >
            {syncing ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                Syncing...
              </>
            ) : (
              <>
                <Zap className="w-4 h-4 mr-2" />
                Sync Inventory
              </>
            )}
          </Button>
        </div>

        {/* Inventory Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="glass-card">
            <CardContent className="p-6 text-center">
              <Car className="w-8 h-8 mx-auto mb-2 neon-cyan" />
              <div className="text-2xl font-bold text-glass-bright">{summary.total_vehicles || 260}</div>
              <div className="text-sm text-glass-muted">Total Vehicles</div>
            </CardContent>
          </Card>
          <Card className="glass-card">
            <CardContent className="p-6 text-center">
              <Zap className="w-8 h-8 mx-auto mb-2 neon-green" />
              <div className="text-2xl font-bold neon-green">{summary.new_vehicles || 180}</div>
              <div className="text-sm text-glass-muted">New Vehicles</div>
            </CardContent>
          </Card>
          <Card className="glass-card">
            <CardContent className="p-6 text-center">
              <Trophy className="w-8 h-8 mx-auto mb-2 neon-orange" />
              <div className="text-2xl font-bold neon-orange">{summary.used_vehicles || 80}</div>
              <div className="text-sm text-glass-muted">Used Vehicles</div>
            </CardContent>
          </Card>
          <Card className="glass-card">
            <CardContent className="p-6 text-center">
              <Globe className="w-8 h-8 mx-auto mb-2 neon-purple" />
              <div className="text-sm font-bold text-glass-bright">{summary.dealership || 'Shottenkirk Toyota'}</div>
              <div className="text-xs text-glass-muted">San Antonio, TX</div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="glass-card mb-6">
          <CardContent className="p-4">
            <h3 className="text-lg font-semibold text-glass-bright mb-4">Filter Inventory</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
              <div>
                <Label className="text-glass text-sm">Make</Label>
                <Input
                  value={filters.make}
                  onChange={(e) => handleFilterChange('make', e.target.value)}
                  placeholder="e.g., Toyota"
                  className="text-glass"
                />
              </div>
              <div>
                <Label className="text-glass text-sm">Model</Label>
                <Input
                  value={filters.model}
                  onChange={(e) => handleFilterChange('model', e.target.value)}
                  placeholder="e.g., Camry"
                  className="text-glass"
                />
              </div>
              <div>
                <Label className="text-glass text-sm">Year</Label>
                <Input
                  value={filters.year}
                  onChange={(e) => handleFilterChange('year', e.target.value)}
                  placeholder="e.g., 2025"
                  className="text-glass"
                />
              </div>
              <div>
                <Label className="text-glass text-sm">Condition</Label>
                <div className="dark-select">
                  <Select value={filters.condition} onValueChange={(value) => handleFilterChange('condition', value)}>
                    <SelectTrigger className="glass-card text-glass filter-dropdown">
                      <SelectValue placeholder="Any" />
                    </SelectTrigger>
                    <SelectContent className="modal-glass filter-dropdown">
                      <SelectItem value="any" className="text-glass-bright invisible-fix">Any</SelectItem>
                      <SelectItem value="new" className="text-glass-bright invisible-fix">New</SelectItem>
                      <SelectItem value="used" className="text-glass-bright invisible-fix">Used</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label className="text-glass text-sm">Min Price</Label>
                <Input
                  value={filters.priceMin}
                  onChange={(e) => handleFilterChange('priceMin', e.target.value)}
                  placeholder="$20,000"
                  className="text-glass"
                />
              </div>
              <div>
                <Label className="text-glass text-sm">Max Price</Label>
                <Input
                  value={filters.priceMax}
                  onChange={(e) => handleFilterChange('priceMax', e.target.value)}
                  placeholder="$50,000"
                  className="text-glass"
                />
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <Button onClick={applyFilters} className="btn-neon">
                Apply Filters
              </Button>
              <Button onClick={clearFilters} variant="outline" className="text-glass-bright">
                Clear
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Inventory List */}
        <Card className="glass-card">
          <CardContent className="p-0">
            {loading ? (
              <div className="flex justify-center items-center p-12">
                <div className="spinner-neon"></div>
              </div>
            ) : inventory.length === 0 ? (
              <div className="text-center p-12">
                <Car className="w-16 h-16 mx-auto mb-4 text-glass-muted" />
                <h3 className="text-xl font-semibold text-glass-bright mb-2">No Vehicles Found</h3>
                <p className="text-glass-muted mb-4">Try adjusting your filters or sync inventory</p>
                <Button onClick={syncInventory} className="btn-neon">
                  <Zap className="w-4 h-4 mr-2" />
                  Sync Inventory
                </Button>
              </div>
            ) : (
              <div className="p-6">
                <h3 className="text-xl font-semibold text-glass-bright mb-4">
                  Available Vehicles ({inventory.length})
                </h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                  {inventory.map((vehicle, index) => (
                    <Card key={vehicle.vin || index} className="glass-card hover:scale-105 transition-transform duration-200">
                      <CardContent className="p-0">
                        {/* Vehicle Image */}
                        <div className="relative h-48 w-full mb-4 rounded-t-lg overflow-hidden">
                          {vehicle.images && vehicle.images.length > 0 ? (
                            <img 
                              src={vehicle.images[0]} 
                              alt={`${vehicle.year} ${vehicle.make} ${vehicle.model}`}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.target.src = `https://via.placeholder.com/400x300/1a1a2e/eee?text=${vehicle.year}+${vehicle.make}+${vehicle.model}`;
                              }}
                            />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center">
                              <div className="text-center text-gray-300">
                                <Car className="w-12 h-12 mx-auto mb-2" />
                                <div className="text-sm">{vehicle.year} {vehicle.make}</div>
                                <div className="text-xs">{vehicle.model}</div>
                              </div>
                            </div>
                          )}
                          
                          {/* Condition Badge */}
                          <div className="absolute top-3 left-3">
                            <Badge className={`badge-neon ${vehicle.condition === 'new' ? 'neon-green' : 'neon-orange'}`}>
                              {vehicle.condition?.toUpperCase()}
                            </Badge>
                          </div>
                          
                          {/* Savings Badge */}
                          {vehicle.savings > 0 && (
                            <div className="absolute top-3 right-3">
                              <Badge className="bg-red-600 text-white">
                                Save ${vehicle.savings.toLocaleString()}
                              </Badge>
                            </div>
                          )}
                        </div>

                        <div className="p-4">
                          {/* Price Section */}
                          <div className="flex justify-between items-center mb-3">
                            <div className="text-right">
                              <div className="text-xl font-bold text-glass-bright">
                                {formatPrice(vehicle.price)}
                              </div>
                              {vehicle.original_price > vehicle.price && (
                                <div className="text-sm text-glass-muted line-through">
                                  MSRP: {formatPrice(vehicle.original_price)}
                                </div>
                              )}
                            </div>
                          </div>
                          
                          {/* Vehicle Title */}
                          <h4 className="text-lg font-semibold text-glass-bright mb-1">
                            {vehicle.year} {vehicle.make} {vehicle.model}
                          </h4>
                          
                          {/* Trim */}
                          {vehicle.trim && (
                            <p className="text-glass-muted mb-2 font-medium">{vehicle.trim}</p>
                          )}
                          
                          {/* Vehicle Details Grid */}
                          <div className="grid grid-cols-2 gap-2 text-sm text-glass-muted mb-3">
                            <div className="flex items-center">
                              <span className="w-2 h-2 bg-blue-400 rounded-full mr-2"></span>
                              VIN: {vehicle.vin?.slice(-6) || 'N/A'}
                            </div>
                            <div className="flex items-center">
                              <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
                              Stock: {vehicle.stock_number || 'N/A'}
                            </div>
                          </div>
                          
                          {/* Color Information */}
                          {vehicle.exterior_color && (
                            <div className="text-sm text-glass-muted mb-3 p-2 glass-card rounded">
                              <div className="flex items-center">
                                <Palette className="w-3 h-3 mr-2 text-purple-400" />
                                <span className="font-medium">Exterior:</span>
                                <span className="ml-1">{vehicle.exterior_color}</span>
                              </div>
                              {vehicle.interior_color && (
                                <div className="flex items-center mt-1">
                                  <span className="w-3 h-3 mr-2"></span>
                                  <span className="font-medium">Interior:</span>
                                  <span className="ml-1">{vehicle.interior_color}</span>
                                </div>
                              )}
                            </div>
                          )}
                          
                          {/* Action Buttons */}
                          <div className="flex gap-2">
                            <Button size="sm" className="btn-neon flex-1">
                              <Eye className="w-3 h-3 mr-1" />
                              View Details
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="text-glass-bright hover:bg-blue-600"
                              title="Call Dealership"
                            >
                              <Phone className="w-3 h-3" />
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="text-glass-bright hover:bg-green-600"
                              title="Schedule Test Drive"
                            >
                              <Calendar className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

// AI Chat Component
const AIChat = ({ lead, onClose, onSuccess }) => {
  const [message, setMessage] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSendMessage = async () => {
    if (!message.trim()) return;
    
    setLoading(true);
    const userMessage = message;
    setMessage('');
    
    // Add user message to history
    setChatHistory(prev => [...prev, { type: 'user', message: userMessage, timestamp: new Date() }]);
    
    try {
      const response = await axios.post(`${API}/ai/respond`, {
        lead_id: lead.id,
        message: userMessage
      });
      
      // Add AI response to history
      setChatHistory(prev => [...prev, { 
        type: 'ai', 
        message: response.data.response, 
        timestamp: new Date() 
      }]);
      
      toast.success('AI response generated');
      
    } catch (error) {
      console.error('Error getting AI response:', error);
      toast.error('Failed to get AI response');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Chat History */}
      <div className="max-h-64 overflow-y-auto space-y-3 p-4 glass-card rounded-lg">
        {chatHistory.length === 0 ? (
          <div className="text-center text-glass-muted py-8">
            <Bot className="w-12 h-12 mx-auto mb-2 neon-purple" />
            <p>Start a conversation with the AI assistant</p>
            <p className="text-sm">Ask about vehicle availability, scheduling appointments, or general inquiries</p>
          </div>
        ) : (
          chatHistory.map((chat, index) => (
            <div key={index} className={`flex ${chat.type === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-xs p-3 rounded-lg ${
                chat.type === 'user' 
                  ? 'bg-blue-600 text-white' 
                  : 'glass-card text-glass'
              }`}>
                <p className="text-sm">{chat.message}</p>
                <p className="text-xs opacity-70 mt-1">
                  {chat.timestamp.toLocaleTimeString()}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
      
      {/* Message Input */}
      <div className="flex space-x-2">
        <Input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
          placeholder="Type your message..."
          className="flex-1 text-glass"
          disabled={loading}
        />
        <Button 
          onClick={handleSendMessage} 
          disabled={loading || !message.trim()}
          className="btn-neon"
        >
          {loading ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <Send className="w-4 h-4" />
          )}
        </Button>
      </div>
    </div>
  );
};

// Add User Form Component
const AddUserForm = ({ onSuccess }) => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    full_name: '',
    password: '',
    role: 'collaborator'
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API}/users`, formData);
      toast.success('Collaborator added successfully!');
      onSuccess();
    } catch (error) {
      console.error('Error adding user:', error);
      toast.error(error.response?.data?.detail || 'Failed to add collaborator');
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label className="text-glass">Full Name *</Label>
        <Input
          name="full_name"
          value={formData.full_name}
          onChange={handleChange}
          required
          className="text-glass"
        />
      </div>
      <div>
        <Label className="text-glass">Username *</Label>
        <Input
          name="username"
          value={formData.username}
          onChange={handleChange}
          required
          className="text-glass"
        />
      </div>
      <div>
        <Label className="text-glass">Email *</Label>
        <Input
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          required
          className="text-glass"
        />
      </div>
      <div>
        <Label className="text-glass">Password *</Label>
        <Input
          name="password"
          type="password"
          value={formData.password}
          onChange={handleChange}
          required
          className="text-glass"
        />
      </div>
      <Button type="submit" className="w-full btn-neon">
        Add Collaborator
      </Button>
    </form>
  );
};

// Navigation Component
const Navigation = () => {
  return (
    <nav className="nav-glass sticky top-0 z-50">
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg flex items-center justify-center pulse-neon">
              <Trophy className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold joker-brand">JokerVision</span>
          </Link>
          <div className="flex space-x-6">
            <Link 
              to="/" 
              className="text-glass hover:text-glass-bright font-medium transition-colors duration-200 flex items-center"
            >
              <BarChart3 className="w-4 h-4 mr-2" />
              Dashboard
            </Link>
            <Link 
              to="/sales" 
              className="text-glass hover:text-glass-bright font-medium transition-colors duration-200 flex items-center"
            >
              <Car className="w-4 h-4 mr-2" />
              Sales
            </Link>
            <Link 
              to="/leads" 
              className="text-glass hover:text-glass-bright font-medium transition-colors duration-200 flex items-center"
            >
              <Target className="w-4 h-4 mr-2" />
              Leads
            </Link>
            <Link 
              to="/team" 
              className="text-glass hover:text-glass-bright font-medium transition-colors duration-200 flex items-center"
            >
              <Users className="w-4 h-4 mr-2" />
              Team
            </Link>
            <Link 
              to="/creative" 
              className="text-glass hover:text-glass-bright font-medium transition-colors duration-200 flex items-center"
            >
              <Palette className="w-4 h-4 mr-2" />
              Creative Studio
            </Link>
            <Link 
              to="/inventory" 
              className="text-glass hover:text-glass-bright font-medium transition-colors duration-200 flex items-center"
            >
              <Car className="w-4 h-4 mr-2" />
              Inventory
            </Link>
            <Link 
              to="/websites" 
              className="text-glass hover:text-glass-bright font-medium transition-colors duration-200 flex items-center"
            >
              <Globe className="w-4 h-4 mr-2" />
              Websites
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

// Main App Component
function App() {
  return (
    <BrowserRouter>
      <div className="App">
        <Navigation />
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/sales" element={<SalesDashboard />} />
          <Route path="/leads" element={<LeadsManagement />} />
          <Route path="/team" element={<TeamManagement />} />
          <Route path="/creative" element={<CreativeStudio />} />
          <Route path="/inventory" element={<InventoryManagement />} />
          <Route path="/websites" element={<WebsiteBuilder />} />
        </Routes>
        <Toaster position="top-right" />
      </div>
    </BrowserRouter>
  );
}

export default App;