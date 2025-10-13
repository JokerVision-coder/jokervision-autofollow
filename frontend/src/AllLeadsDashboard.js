import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { 
  Users, Filter, Search, Download, RefreshCw, Mail, Phone,
  MessageSquare, Calendar, TrendingUp, Tag, Eye, Edit2,
  CheckCircle2, AlertCircle, Clock, ExternalLink, Bot, Zap
} from 'lucide-react';
import LeadDetailsModal from './LeadDetailsModal';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

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
const Badge = ({ children, className = "" }) => <span className={`px-2 py-1 rounded text-xs ${className}`}>{children}</span>;

const AllLeadsDashboard = () => {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sourceFilter, setSourceFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [statistics, setStatistics] = useState({});
  const [availableSources, setAvailableSources] = useState([]);

  useEffect(() => {
    fetchAllLeads();
  }, [sourceFilter, statusFilter]);

  const fetchAllLeads = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        tenant_id: 'default_dealership',
        limit: 200
      });
      
      if (sourceFilter !== 'all') {
        params.append('source_filter', sourceFilter);
      }
      if (statusFilter !== 'all') {
        params.append('status_filter', statusFilter);
      }

      const response = await axios.get(`${API}/leads/dashboard/all-sources?${params.toString()}`);
      
      setLeads(response.data.leads || []);
      setStatistics({
        total: response.data.total_count || 0,
        filtered: response.data.filtered_count || 0,
        bySource: response.data.source_statistics || {},
        byStatus: response.data.status_statistics || {}
      });
      setAvailableSources(response.data.available_sources || []);
    } catch (error) {
      console.error('Error fetching leads:', error);
      toast.error('Failed to load leads');
      // Load mock data as fallback
      loadMockData();
    } finally {
      setLoading(false);
    }
  };

  const loadMockData = () => {
    setLeads([
      {
        id: '1',
        first_name: 'John',
        last_name: 'Doe',
        email: 'john.doe@example.com',
        primary_phone: '555-123-4567',
        source: 'Mass Marketing Import',
        status: 'new',
        created_at: new Date().toISOString(),
        budget: '$45,000'
      },
      {
        id: '2',
        first_name: 'Jane',
        last_name: 'Smith',
        email: 'jane.smith@example.com',
        primary_phone: '555-234-5678',
        source: 'Exclusive Lead Engine',
        status: 'contacted',
        created_at: new Date().toISOString(),
        budget: '$65,000'
      }
    ]);
    setStatistics({
      total: 2,
      filtered: 2,
      bySource: { 'Mass Marketing Import': 1, 'Exclusive Lead Engine': 1 },
      byStatus: { 'new': 1, 'contacted': 1 }
    });
    setAvailableSources(['Mass Marketing Import', 'Exclusive Lead Engine', 'Website', 'Walk-In']);
  };

  const getSourceBadgeColor = (source) => {
    const colors = {
      'Mass Marketing Import': 'bg-purple-500/20 text-purple-400 border-purple-500/30',
      'Exclusive Lead Engine': 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      'Website': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      'Walk-In': 'bg-green-500/20 text-green-400 border-green-500/30',
      'Facebook Auto Poster': 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30',
      'Social Media Hub': 'bg-pink-500/20 text-pink-400 border-pink-500/30',
      'Lead Generation Hub': 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
      'manual': 'bg-gray-500/20 text-gray-400 border-gray-500/30'
    };
    return colors[source] || colors['manual'];
  };

  const getStatusBadgeColor = (status) => {
    const colors = {
      'new': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      'contacted': 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      'scheduled': 'bg-purple-500/20 text-purple-400 border-purple-500/30',
      'qualified': 'bg-green-500/20 text-green-400 border-green-500/30',
      'converted': 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
      'lost': 'bg-red-500/20 text-red-400 border-red-500/30'
    };
    return colors[status] || colors['new'];
  };

  const filteredLeads = leads.filter(lead => {
    if (!searchQuery) return true;
    const search = searchQuery.toLowerCase();
    return (
      lead.first_name?.toLowerCase().includes(search) ||
      lead.last_name?.toLowerCase().includes(search) ||
      lead.email?.toLowerCase().includes(search) ||
      lead.primary_phone?.includes(search)
    );
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="spinner-neon"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400">
                All Leads Dashboard
              </h1>
              <p className="text-glass-muted mt-2">
                Unified view of leads from all sources across JokerVision
              </p>
            </div>
            <Button
              onClick={fetchAllLeads}
              className="bg-purple-600 hover:bg-purple-700 text-white"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="glass-card">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-glass-bright">
                    {statistics.total || 0}
                  </div>
                  <div className="text-sm text-glass-muted">Total Leads</div>
                </div>
                <Users className="w-8 h-8 text-purple-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-glass-bright">
                    {Object.keys(statistics.bySource || {}).length}
                  </div>
                  <div className="text-sm text-glass-muted">Lead Sources</div>
                </div>
                <Tag className="w-8 h-8 text-blue-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-glass-bright">
                    {statistics.byStatus?.['new'] || 0}
                  </div>
                  <div className="text-sm text-glass-muted">New Leads</div>
                </div>
                <AlertCircle className="w-8 h-8 text-yellow-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-glass-bright">
                    {statistics.byStatus?.['converted'] || 0}
                  </div>
                  <div className="text-sm text-glass-muted">Converted</div>
                </div>
                <CheckCircle2 className="w-8 h-8 text-green-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Source Statistics */}
        <Card className="glass-card mb-6">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-glass-bright mb-4">Leads by Source</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {Object.entries(statistics.bySource || {}).map(([source, count]) => (
                <div key={source} className="bg-glass/20 rounded-lg p-3 text-center">
                  <div className="text-xl font-bold text-glass-bright">{count}</div>
                  <Badge className={`${getSourceBadgeColor(source)} border mt-2`}>
                    {source}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Filters and Search */}
        <Card className="glass-card mb-6">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-glass-muted" />
                <Input
                  type="text"
                  placeholder="Search leads..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 bg-glass/30 border-neon-purple/30 text-glass-bright"
                />
              </div>

              {/* Source Filter */}
              <div>
                <select
                  value={sourceFilter}
                  onChange={(e) => setSourceFilter(e.target.value)}
                  className="w-full px-3 py-2 bg-glass/30 border border-neon-purple/30 rounded text-glass-bright"
                >
                  <option value="all">All Sources</option>
                  {availableSources.map(source => (
                    <option key={source} value={source}>{source}</option>
                  ))}
                </select>
              </div>

              {/* Status Filter */}
              <div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-3 py-2 bg-glass/30 border border-neon-purple/30 rounded text-glass-bright"
                >
                  <option value="all">All Statuses</option>
                  <option value="new">New</option>
                  <option value="contacted">Contacted</option>
                  <option value="scheduled">Scheduled</option>
                  <option value="qualified">Qualified</option>
                  <option value="converted">Converted</option>
                  <option value="lost">Lost</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Leads List */}
        <Card className="glass-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-glass-bright">
                Leads ({filteredLeads.length})
              </h3>
              <Button className="bg-blue-600 hover:bg-blue-700 text-white" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>

            <div className="space-y-3">
              {filteredLeads.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="w-16 h-16 text-glass-muted mx-auto mb-4" />
                  <p className="text-glass-muted">No leads found</p>
                </div>
              ) : (
                filteredLeads.map(lead => (
                  <div key={lead.id} className="bg-glass/20 rounded-lg p-4 hover:bg-glass/30 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="text-lg font-semibold text-glass-bright">
                            {lead.first_name} {lead.last_name}
                          </h4>
                          <Badge className={`${getSourceBadgeColor(lead.source)} border`}>
                            {lead.source}
                          </Badge>
                          <Badge className={`${getStatusBadgeColor(lead.status)} border`}>
                            {lead.status}
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm text-glass-muted">
                          <div className="flex items-center gap-2">
                            <Mail className="w-4 h-4" />
                            {lead.email}
                          </div>
                          <div className="flex items-center gap-2">
                            <Phone className="w-4 h-4" />
                            {lead.primary_phone}
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4" />
                            {new Date(lead.created_at).toLocaleDateString()}
                          </div>
                        </div>

                        {lead.budget && (
                          <div className="mt-2 text-sm text-purple-400">
                            Budget: {lead.budget}
                          </div>
                        )}
                      </div>

                      <div className="flex gap-2">
                        <Button className="bg-blue-500/20 hover:bg-blue-500/30 text-blue-400" size="sm">
                          <MessageSquare className="w-4 h-4" />
                        </Button>
                        <Button className="bg-green-500/20 hover:bg-green-500/30 text-green-400" size="sm">
                          <Phone className="w-4 h-4" />
                        </Button>
                        <Button className="bg-purple-500/20 hover:bg-purple-500/30 text-purple-400" size="sm">
                          <Calendar className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AllLeadsDashboard;
