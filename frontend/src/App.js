import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link, useNavigate } from 'react-router-dom';
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
import { 
  Users, MessageSquare, Calendar, BarChart3, Plus, Send, Bot, Phone, Mail, 
  DollarSign, Briefcase, Clock, Settings, Zap, TrendingUp, PhoneCall, MessageCircle,
  Trophy, Target, UserPlus, Trash2, Eye, Edit, Car, Calculator
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
          <Route path="/team" element={<TeamManagement />} />
        </Routes>
        <Toaster position="top-right" />
      </div>
    </BrowserRouter>
  );
}

export default App;