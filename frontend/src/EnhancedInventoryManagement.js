import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import { Button } from './components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './components/ui/card';
import { Input } from './components/ui/input';
import { Label } from './components/ui/label';
import { Badge } from './components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './components/ui/select';
import { Checkbox } from './components/ui/checkbox';
import { Textarea } from './components/ui/textarea';
import { 
  Car, Zap, Upload, Facebook, Share2, Eye, Edit, Trash2, Filter, Plus,
  MapPin, Calendar, Phone, Mail, DollarSign, Settings, CheckCircle2,
  Clock, AlertTriangle, TrendingUp, BarChart3, Camera, FileText,
  Globe, Users, MessageSquare, Target, Star, RefreshCw, Download
} from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const EnhancedInventoryManagement = () => {
  const [inventory, setInventory] = useState([]);
  const [summary, setSummary] = useState({});
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [selectedVehicles, setSelectedVehicles] = useState(new Set());
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [activeTab, setActiveTab] = useState('inventory');
  const [showAddVehicleDialog, setShowAddVehicleDialog] = useState(false);
  const [showMarketplaceDialog, setShowMarketplaceDialog] = useState(false);
  const [marketplaceStats, setMarketplaceStats] = useState({});
  const [filters, setFilters] = useState({
    make: '',
    model: '',
    year: '',
    condition: 'any',
    priceMin: '',
    priceMax: '',
    status: 'any'
  });

  useEffect(() => {
    fetchInventorySummary();
    fetchInventoryVehicles();
    fetchMarketplaceStats();
  }, []);

  useEffect(() => {
    fetchInventoryVehicles();
  }, [filters]);

  const fetchInventorySummary = async () => {
    try {
      const response = await axios.get(`${API}/inventory/summary?tenant_id=default_dealership`);
      setSummary(response.data);
    } catch (error) {
      console.error('Error fetching inventory summary:', error);
      // Use mock data for demo
      setSummary({
        total_vehicles: 347,
        new_vehicles: 201,
        used_vehicles: 146,
        marketplace_listed: 89,
        leads_generated: 156,
        dealership: 'Shottenkirk Toyota'
      });
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
      setInventory(response.data.vehicles || generateMockInventory());
    } catch (error) {
      console.error('Error fetching inventory:', error);
      setInventory(generateMockInventory());
    } finally {
      setLoading(false);
    }
  };

  const fetchMarketplaceStats = async () => {
    try {
      const response = await axios.get(`${API}/chrome-extension/marketplace-performance`);
      setMarketplaceStats(response.data);
    } catch (error) {
      // Use mock marketplace stats
      setMarketplaceStats({
        total_listings: 89,
        active_listings: 76,
        leads_this_week: 23,
        views_this_week: 1247,
        messages_this_week: 18,
        avg_response_time: '2.3 hours'
      });
    }
  };

  const generateMockInventory = () => {
    const makes = ['Toyota', 'Honda', 'Ford', 'Chevrolet', 'Nissan', 'BMW', 'Mercedes', 'Audi'];
    const models = ['Camry', 'Accord', 'F-150', 'Silverado', 'Altima', 'X3', 'C-Class', 'A4'];
    const conditions = ['New', 'Used', 'Certified Pre-Owned'];
    const statuses = ['Available', 'Marketplace Listed', 'Pending Sale', 'Sold'];
    
    return Array.from({ length: 24 }, (_, index) => {
      const make = makes[Math.floor(Math.random() * makes.length)];
      const model = models[Math.floor(Math.random() * models.length)];
      const year = 2020 + Math.floor(Math.random() * 5);
      const condition = conditions[Math.floor(Math.random() * conditions.length)];
      const basePrice = 25000 + Math.floor(Math.random() * 40000);
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      
      return {
        id: `veh_${index + 1}`,
        vin: `1HGCM82633A${String(index + 100000).slice(-6)}`,
        stock_number: `ST${String(index + 1000).slice(-4)}`,
        year,
        make,
        model,
        trim: ['Base', 'LX', 'EX', 'Limited', 'Sport'][Math.floor(Math.random() * 5)],
        condition,
        price: basePrice,
        original_price: basePrice + Math.floor(Math.random() * 5000),
        mileage: condition === 'New' ? Math.floor(Math.random() * 50) : 15000 + Math.floor(Math.random() * 80000),
        exterior_color: ['White', 'Black', 'Silver', 'Blue', 'Red'][Math.floor(Math.random() * 5)],
        interior_color: ['Black', 'Gray', 'Beige', 'Brown'][Math.floor(Math.random() * 4)],
        fuel_type: ['Gasoline', 'Hybrid', 'Electric'][Math.floor(Math.random() * 3)],
        transmission: ['Automatic', 'Manual', 'CVT'][Math.floor(Math.random() * 3)],
        engine: '2.4L 4-Cylinder',
        features: ['Bluetooth', 'Backup Camera', 'Apple CarPlay', 'Heated Seats'],
        images: [`https://via.placeholder.com/400x300/1a1a2e/eee?text=${year}+${make}+${model}`],
        status,
        marketplace_listed: status === 'Marketplace Listed',
        leads_count: Math.floor(Math.random() * 8),
        views_count: Math.floor(Math.random() * 150),
        last_updated: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString()
      };
    });
  };

  const syncInventory = async () => {
    try {
      setSyncing(true);
      await axios.post(`${API}/inventory/sync/default_dealership`);
      toast.success('Inventory sync started! This may take a few minutes.');
      
      setTimeout(() => {
        fetchInventorySummary();
        fetchInventoryVehicles();
        setSyncing(false);
      }, 3000);
    } catch (error) {
      console.error('Error syncing inventory:', error);
      toast.error('Failed to start inventory sync');
      setSyncing(false);
    }
  };

  const handleVehicleSelect = (vehicleId) => {
    const newSelected = new Set(selectedVehicles);
    if (newSelected.has(vehicleId)) {
      newSelected.delete(vehicleId);
    } else {
      newSelected.add(vehicleId);
    }
    setSelectedVehicles(newSelected);
  };

  const selectAllVehicles = () => {
    if (selectedVehicles.size === inventory.length) {
      setSelectedVehicles(new Set());
    } else {
      setSelectedVehicles(new Set(inventory.map(v => v.id)));
    }
  };

  const postToMarketplace = async (vehicleIds = null) => {
    const vehicles = vehicleIds || Array.from(selectedVehicles);
    if (vehicles.length === 0) {
      toast.error('Please select vehicles to post');
      return;
    }

    try {
      const response = await axios.post(`${API}/chrome-extension/marketplace-upload`, {
        vehicle_ids: vehicles,
        tenant_id: 'default_dealership'
      });
      
      toast.success(`Successfully posted ${vehicles.length} vehicle(s) to Facebook Marketplace`);
      setSelectedVehicles(new Set());
      fetchInventoryVehicles();
      fetchMarketplaceStats();
    } catch (error) {
      console.error('Error posting to marketplace:', error);
      toast.error('Failed to post to Facebook Marketplace');
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      make: '',
      model: '',
      year: '',
      condition: 'any',
      priceMin: '',
      priceMax: '',
      status: 'any'
    });
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(price);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Available': return 'bg-green-600 text-white';
      case 'Marketplace Listed': return 'bg-blue-600 text-white';
      case 'Pending Sale': return 'bg-yellow-600 text-white';
      case 'Sold': return 'bg-gray-600 text-white';
      default: return 'bg-gray-600 text-white';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Available': return <Car className="w-3 h-3" />;
      case 'Marketplace Listed': return <Facebook className="w-3 h-3" />;
      case 'Pending Sale': return <Clock className="w-3 h-3" />;
      case 'Sold': return <CheckCircle2 className="w-3 h-3" />;
      default: return <Car className="w-3 h-3" />;
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
            <h1 className="text-4xl font-bold text-glass-bright mb-2">Enhanced Inventory Management</h1>
            <p className="text-glass-muted">Complete vehicle inventory with integrated Facebook Marketplace</p>
          </div>
          
          <div className="flex gap-3">
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
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Sync Inventory
                </>
              )}
            </Button>
            
            <Button 
              onClick={() => postToMarketplace()}
              disabled={selectedVehicles.size === 0}
              className="btn-neon"
            >
              <Facebook className="w-4 h-4 mr-2" />
              Post to Marketplace ({selectedVehicles.size})
            </Button>
            
            <Button 
              onClick={() => setShowAddVehicleDialog(true)}
              className="btn-neon"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Vehicle
            </Button>
          </div>
        </div>

        {/* Enhanced Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 mb-8">
          <Card className="glass-card">
            <CardContent className="p-6 text-center">
              <Car className="w-8 h-8 mx-auto mb-2 neon-cyan" />
              <div className="text-2xl font-bold text-glass-bright">{summary.total_vehicles || 347}</div>
              <div className="text-sm text-glass-muted">Total Vehicles</div>
            </CardContent>
          </Card>
          
          <Card className="glass-card">
            <CardContent className="p-6 text-center">
              <Zap className="w-8 h-8 mx-auto mb-2 neon-green" />
              <div className="text-2xl font-bold neon-green">{summary.new_vehicles || 201}</div>
              <div className="text-sm text-glass-muted">New Vehicles</div>
            </CardContent>
          </Card>
          
          <Card className="glass-card">
            <CardContent className="p-6 text-center">
              <Settings className="w-8 h-8 mx-auto mb-2 neon-orange" />
              <div className="text-2xl font-bold neon-orange">{summary.used_vehicles || 146}</div>
              <div className="text-sm text-glass-muted">Used Vehicles</div>
            </CardContent>
          </Card>
          
          <Card className="glass-card">
            <CardContent className="p-6 text-center">
              <Facebook className="w-8 h-8 mx-auto mb-2 neon-blue" />
              <div className="text-2xl font-bold neon-blue">{marketplaceStats.total_listings || 89}</div>
              <div className="text-sm text-glass-muted">Marketplace Listings</div>
            </CardContent>
          </Card>
          
          <Card className="glass-card">
            <CardContent className="p-6 text-center">
              <Target className="w-8 h-8 mx-auto mb-2 neon-purple" />
              <div className="text-2xl font-bold neon-purple">{marketplaceStats.leads_this_week || 23}</div>
              <div className="text-sm text-glass-muted">Weekly Leads</div>
            </CardContent>
          </Card>
          
          <Card className="glass-card">
            <CardContent className="p-6 text-center">
              <Eye className="w-8 h-8 mx-auto mb-2 neon-yellow" />
              <div className="text-2xl font-bold neon-yellow">{(marketplaceStats.views_this_week || 1247).toLocaleString()}</div>
              <div className="text-sm text-glass-muted">Weekly Views</div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="inventory">Vehicle Inventory</TabsTrigger>
            <TabsTrigger value="marketplace">Marketplace Manager</TabsTrigger>
            <TabsTrigger value="analytics">Analytics & Reports</TabsTrigger>
          </TabsList>
          
          <TabsContent value="inventory">
            <InventoryTab 
              inventory={inventory}
              selectedVehicles={selectedVehicles}
              viewMode={viewMode}
              filters={filters}
              onVehicleSelect={handleVehicleSelect}
              onSelectAll={selectAllVehicles}
              onFilterChange={handleFilterChange}
              onClearFilters={clearFilters}
              onViewModeChange={setViewMode}
              onPostToMarketplace={postToMarketplace}
              formatPrice={formatPrice}
              getStatusColor={getStatusColor}
              getStatusIcon={getStatusIcon}
            />
          </TabsContent>
          
          <TabsContent value="marketplace">
            <MarketplaceTab 
              marketplaceStats={marketplaceStats}
              inventory={inventory}
              onPostToMarketplace={postToMarketplace}
              formatPrice={formatPrice}
            />
          </TabsContent>
          
          <TabsContent value="analytics">
            <AnalyticsTab 
              summary={summary}
              marketplaceStats={marketplaceStats}
              inventory={inventory}
            />
          </TabsContent>
        </Tabs>

        {/* Add Vehicle Dialog */}
        <Dialog open={showAddVehicleDialog} onOpenChange={setShowAddVehicleDialog}>
          <DialogContent className="modal-glass max-w-4xl">
            <DialogHeader>
              <DialogTitle className="text-glass-bright">Add New Vehicle</DialogTitle>
              <DialogDescription className="text-glass-muted">
                Add a new vehicle to your inventory
              </DialogDescription>
            </DialogHeader>
            <AddVehicleForm 
              onSuccess={() => { 
                setShowAddVehicleDialog(false); 
                fetchInventoryVehicles(); 
                fetchInventorySummary();
              }} 
            />
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

// Inventory Tab Component
const InventoryTab = ({ 
  inventory, selectedVehicles, viewMode, filters, 
  onVehicleSelect, onSelectAll, onFilterChange, onClearFilters, 
  onViewModeChange, onPostToMarketplace, formatPrice, getStatusColor, getStatusIcon 
}) => {
  return (
    <div className="space-y-6">
      {/* Advanced Filters */}
      <Card className="glass-card">
        <CardContent className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-glass-bright">Advanced Filters</h3>
            <div className="flex gap-2">
              <Button
                onClick={() => onViewModeChange(viewMode === 'grid' ? 'list' : 'grid')}
                variant="outline"
                size="sm"
                className="text-glass-bright"
              >
                {viewMode === 'grid' ? 'List View' : 'Grid View'}
              </Button>
              <Button onClick={onClearFilters} variant="outline" size="sm" className="text-glass-bright">
                Clear Filters
              </Button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-4">
            <div>
              <Label className="text-glass text-sm">Make</Label>
              <Select value={filters.make} onValueChange={(value) => onFilterChange('make', value)}>
                <SelectTrigger className="glass-card text-glass">
                  <SelectValue placeholder="All Makes" />
                </SelectTrigger>
                <SelectContent className="modal-glass">
                  <SelectItem value="">All Makes</SelectItem>
                  <SelectItem value="Toyota">Toyota</SelectItem>
                  <SelectItem value="Honda">Honda</SelectItem>
                  <SelectItem value="Ford">Ford</SelectItem>
                  <SelectItem value="Chevrolet">Chevrolet</SelectItem>
                  <SelectItem value="Nissan">Nissan</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label className="text-glass text-sm">Model</Label>
              <Input
                value={filters.model}
                onChange={(e) => onFilterChange('model', e.target.value)}
                placeholder="Any Model"
                className="text-glass"
              />
            </div>
            
            <div>
              <Label className="text-glass text-sm">Year</Label>
              <Input
                value={filters.year}
                onChange={(e) => onFilterChange('year', e.target.value)}
                placeholder="Any Year"
                className="text-glass"
              />
            </div>
            
            <div>
              <Label className="text-glass text-sm">Condition</Label>
              <Select value={filters.condition} onValueChange={(value) => onFilterChange('condition', value)}>
                <SelectTrigger className="glass-card text-glass">
                  <SelectValue placeholder="Any" />
                </SelectTrigger>
                <SelectContent className="modal-glass">
                  <SelectItem value="any">Any</SelectItem>
                  <SelectItem value="New">New</SelectItem>
                  <SelectItem value="Used">Used</SelectItem>
                  <SelectItem value="Certified Pre-Owned">Certified Pre-Owned</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label className="text-glass text-sm">Min Price</Label>
              <Input
                value={filters.priceMin}
                onChange={(e) => onFilterChange('priceMin', e.target.value)}
                placeholder="$0"
                type="number"
                className="text-glass"
              />
            </div>
            
            <div>
              <Label className="text-glass text-sm">Max Price</Label>
              <Input
                value={filters.priceMax}
                onChange={(e) => onFilterChange('priceMax', e.target.value)}
                placeholder="Any"
                type="number"
                className="text-glass"
              />
            </div>
            
            <div>
              <Label className="text-glass text-sm">Status</Label>
              <Select value={filters.status} onValueChange={(value) => onFilterChange('status', value)}>
                <SelectTrigger className="glass-card text-glass">
                  <SelectValue placeholder="Any" />
                </SelectTrigger>
                <SelectContent className="modal-glass">
                  <SelectItem value="any">Any Status</SelectItem>
                  <SelectItem value="Available">Available</SelectItem>
                  <SelectItem value="Marketplace Listed">Marketplace Listed</SelectItem>
                  <SelectItem value="Pending Sale">Pending Sale</SelectItem>
                  <SelectItem value="Sold">Sold</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bulk Actions */}
      <Card className="glass-card">
        <CardContent className="p-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <Checkbox
                checked={selectedVehicles.size === inventory.length}
                onCheckedChange={onSelectAll}
                className="text-glass-bright"
              />
              <span className="text-glass-bright">
                {selectedVehicles.size > 0 
                  ? `${selectedVehicles.size} vehicle(s) selected` 
                  : `${inventory.length} vehicles total`
                }
              </span>
            </div>
            
            {selectedVehicles.size > 0 && (
              <div className="flex gap-2">
                <Button onClick={() => onPostToMarketplace()} className="btn-neon">
                  <Facebook className="w-4 h-4 mr-2" />
                  Post to Marketplace
                </Button>
                <Button variant="outline" className="text-glass-bright">
                  <Edit className="w-4 h-4 mr-2" />
                  Bulk Edit
                </Button>
                <Button variant="outline" className="text-red-400 border-red-400">
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Selected
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Vehicle Grid/List */}
      <div className={viewMode === 'grid' 
        ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" 
        : "space-y-4"
      }>
        {inventory.map((vehicle) => (
          <VehicleCard 
            key={vehicle.id}
            vehicle={vehicle}
            isSelected={selectedVehicles.has(vehicle.id)}
            onSelect={onVehicleSelect}
            onPostToMarketplace={onPostToMarketplace}
            viewMode={viewMode}
            formatPrice={formatPrice}
            getStatusColor={getStatusColor}
            getStatusIcon={getStatusIcon}
          />
        ))}
      </div>
    </div>
  );
};

// Vehicle Card Component
const VehicleCard = ({ 
  vehicle, isSelected, onSelect, onPostToMarketplace, 
  viewMode, formatPrice, getStatusColor, getStatusIcon 
}) => {
  if (viewMode === 'list') {
    return (
      <Card className={`glass-card transition-all duration-200 ${isSelected ? 'border-purple-500 border-2' : ''}`}>
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <Checkbox
              checked={isSelected}
              onCheckedChange={() => onSelect(vehicle.id)}
            />
            
            <div className="w-20 h-16 bg-gradient-to-br from-gray-700 to-gray-800 rounded-lg flex-shrink-0">
              <img 
                src={vehicle.images[0]} 
                alt={`${vehicle.year} ${vehicle.make} ${vehicle.model}`}
                className="w-full h-full object-cover rounded-lg"
                onError={(e) => {
                  e.target.src = `https://via.placeholder.com/80x64/1a1a2e/eee?text=${vehicle.make}`;
                }}
              />
            </div>
            
            <div className="flex-1 grid grid-cols-6 gap-4 items-center">
              <div>
                <div className="font-semibold text-glass-bright">
                  {vehicle.year} {vehicle.make} {vehicle.model}
                </div>
                <div className="text-sm text-glass-muted">{vehicle.trim}</div>
              </div>
              
              <div>
                <div className="font-bold text-glass-bright">{formatPrice(vehicle.price)}</div>
                <div className="text-sm text-glass-muted">{vehicle.mileage.toLocaleString()} miles</div>
              </div>
              
              <div>
                <div className="text-glass-bright">{vehicle.stock_number}</div>
                <div className="text-sm text-glass-muted">{vehicle.condition}</div>
              </div>
              
              <div>
                <div className="text-glass-bright">{vehicle.exterior_color}</div>
                <div className="text-sm text-glass-muted">{vehicle.fuel_type}</div>
              </div>
              
              <div>
                <Badge className={getStatusColor(vehicle.status)}>
                  {getStatusIcon(vehicle.status)}
                  <span className="ml-1">{vehicle.status}</span>
                </Badge>
              </div>
              
              <div className="flex gap-2">
                <Button size="sm" variant="outline" className="text-glass-bright">
                  <Eye className="w-3 h-3" />
                </Button>
                <Button size="sm" variant="outline" className="text-glass-bright">
                  <Edit className="w-3 h-3" />
                </Button>
                {!vehicle.marketplace_listed && (
                  <Button 
                    size="sm" 
                    onClick={() => onPostToMarketplace([vehicle.id])}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    <Facebook className="w-3 h-3" />
                  </Button>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`glass-card hover:scale-105 transition-all duration-200 ${isSelected ? 'border-purple-500 border-2' : ''}`}>
      <CardContent className="p-0">
        <div className="relative">
          <Checkbox
            checked={isSelected}
            onCheckedChange={() => onSelect(vehicle.id)}
            className="absolute top-3 left-3 z-10 bg-black/50 border-white"
          />
          
          <div className="relative h-48 w-full rounded-t-lg overflow-hidden">
            <img 
              src={vehicle.images[0]} 
              alt={`${vehicle.year} ${vehicle.make} ${vehicle.model}`}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.src = `https://via.placeholder.com/400x300/1a1a2e/eee?text=${vehicle.year}+${vehicle.make}+${vehicle.model}`;
              }}
            />
            
            <div className="absolute top-3 right-3">
              <Badge className={getStatusColor(vehicle.status)}>
                {getStatusIcon(vehicle.status)}
                <span className="ml-1">{vehicle.status}</span>
              </Badge>
            </div>
            
            {vehicle.marketplace_listed && (
              <div className="absolute bottom-3 left-3">
                <Badge className="bg-blue-600 text-white">
                  <Facebook className="w-3 h-3 mr-1" />
                  Listed
                </Badge>
              </div>
            )}
          </div>

          <div className="p-4">
            <div className="flex justify-between items-start mb-3">
              <div className="text-xl font-bold text-glass-bright">
                {formatPrice(vehicle.price)}
              </div>
              {vehicle.original_price > vehicle.price && (
                <div className="text-sm text-glass-muted line-through">
                  {formatPrice(vehicle.original_price)}
                </div>
              )}
            </div>
            
            <h4 className="text-lg font-semibold text-glass-bright mb-1">
              {vehicle.year} {vehicle.make} {vehicle.model}
            </h4>
            
            <p className="text-glass-muted mb-2">{vehicle.trim}</p>
            
            <div className="grid grid-cols-2 gap-2 text-sm text-glass-muted mb-3">
              <div>Stock: {vehicle.stock_number}</div>
              <div>Miles: {vehicle.mileage?.toLocaleString() || 0}</div>
              <div>Color: {vehicle.exterior_color}</div>
              <div>Fuel: {vehicle.fuel_type}</div>
            </div>
            
            {vehicle.marketplace_listed && (
              <div className="grid grid-cols-2 gap-2 text-sm mb-3 p-2 bg-blue-600/20 rounded">
                <div className="flex items-center text-blue-400">
                  <Eye className="w-3 h-3 mr-1" />
                  {vehicle.views_count} views
                </div>
                <div className="flex items-center text-blue-400">
                  <MessageSquare className="w-3 h-3 mr-1" />
                  {vehicle.leads_count} leads
                </div>
              </div>
            )}
            
            <div className="flex gap-2">
              <Button size="sm" className="btn-neon flex-1">
                <Eye className="w-3 h-3 mr-1" />
                View Details
              </Button>
              
              {!vehicle.marketplace_listed ? (
                <Button 
                  size="sm" 
                  onClick={() => onPostToMarketplace([vehicle.id])}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <Facebook className="w-3 h-3 mr-1" />
                  Post
                </Button>
              ) : (
                <Button size="sm" variant="outline" className="text-glass-bright">
                  <Edit className="w-3 h-3" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Marketplace Tab Component
const MarketplaceTab = ({ marketplaceStats, inventory, onPostToMarketplace, formatPrice }) => {
  const marketplaceListed = inventory.filter(v => v.marketplace_listed);
  
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card className="glass-card">
          <CardContent className="p-6 text-center">
            <Facebook className="w-8 h-8 mx-auto mb-2 neon-blue" />
            <div className="text-2xl font-bold neon-blue">{marketplaceStats.active_listings || 76}</div>
            <div className="text-sm text-glass-muted">Active Listings</div>
          </CardContent>
        </Card>
        
        <Card className="glass-card">
          <CardContent className="p-6 text-center">
            <MessageSquare className="w-8 h-8 mx-auto mb-2 neon-green" />
            <div className="text-2xl font-bold neon-green">{marketplaceStats.messages_this_week || 18}</div>
            <div className="text-sm text-glass-muted">Messages This Week</div>
          </CardContent>
        </Card>
        
        <Card className="glass-card">
          <CardContent className="p-6 text-center">
            <Eye className="w-8 h-8 mx-auto mb-2 neon-orange" />
            <div className="text-2xl font-bold neon-orange">{(marketplaceStats.views_this_week || 1247).toLocaleString()}</div>
            <div className="text-sm text-glass-muted">Views This Week</div>
          </CardContent>
        </Card>
        
        <Card className="glass-card">
          <CardContent className="p-6 text-center">
            <Clock className="w-8 h-8 mx-auto mb-2 neon-purple" />
            <div className="text-2xl font-bold neon-purple">{marketplaceStats.avg_response_time || '2.3h'}</div>
            <div className="text-sm text-glass-muted">Avg Response Time</div>
          </CardContent>
        </Card>
      </div>

      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="text-glass-bright">Facebook Marketplace Performance</CardTitle>
          <CardDescription className="text-glass-muted">
            Manage your Facebook Marketplace listings and track performance
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {marketplaceListed.length === 0 ? (
              <div className="text-center py-12">
                <Facebook className="w-16 h-16 mx-auto mb-4 text-glass-muted" />
                <h3 className="text-xl font-semibold text-glass-bright mb-2">No Marketplace Listings</h3>
                <p className="text-glass-muted mb-4">Start posting your inventory to Facebook Marketplace to generate leads</p>
                <Button onClick={() => onPostToMarketplace([])} className="btn-neon">
                  <Facebook className="w-4 h-4 mr-2" />
                  Post Vehicles to Marketplace
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {marketplaceListed.map((vehicle) => (
                  <Card key={vehicle.id} className="glass-card">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-gray-700 to-gray-800 rounded-lg flex-shrink-0">
                          <img 
                            src={vehicle.images[0]} 
                            alt={`${vehicle.year} ${vehicle.make} ${vehicle.model}`}
                            className="w-full h-full object-cover rounded-lg"
                            onError={(e) => {
                              e.target.src = `https://via.placeholder.com/48x48/1a1a2e/eee?text=${vehicle.make}`;
                            }}
                          />
                        </div>
                        <div className="flex-1">
                          <div className="font-semibold text-glass-bright">
                            {vehicle.year} {vehicle.make} {vehicle.model}
                          </div>
                          <div className="text-sm text-glass-muted">{formatPrice(vehicle.price)}</div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div className="flex items-center text-glass-muted">
                          <Eye className="w-3 h-3 mr-1" />
                          {vehicle.views_count} views
                        </div>
                        <div className="flex items-center text-glass-muted">
                          <MessageSquare className="w-3 h-3 mr-1" />
                          {vehicle.leads_count} leads
                        </div>
                      </div>
                      
                      <div className="flex gap-2 mt-3">
                        <Button size="sm" variant="outline" className="text-glass-bright flex-1">
                          <Eye className="w-3 h-3 mr-1" />
                          View Listing
                        </Button>
                        <Button size="sm" variant="outline" className="text-glass-bright">
                          <Edit className="w-3 h-3" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Analytics Tab Component
const AnalyticsTab = ({ summary, marketplaceStats, inventory }) => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-glass-bright">Inventory Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-glass-muted">Total Inventory Value</span>
                <span className="text-glass-bright font-bold">
                  ${(inventory.reduce((sum, v) => sum + v.price, 0)).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-glass-muted">Average Vehicle Price</span>
                <span className="text-glass-bright font-bold">
                  ${Math.round(inventory.reduce((sum, v) => sum + v.price, 0) / inventory.length).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-glass-muted">Marketplace Conversion Rate</span>
                <span className="text-glass-bright font-bold">
                  {Math.round((inventory.filter(v => v.marketplace_listed).length / inventory.length) * 100)}%
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-glass-bright">Lead Generation</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-glass-muted">Total Leads This Week</span>
                <span className="text-glass-bright font-bold">{marketplaceStats.leads_this_week || 23}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-glass-muted">Average Leads per Listing</span>
                <span className="text-glass-bright font-bold">
                  {Math.round((marketplaceStats.leads_this_week || 23) / (marketplaceStats.active_listings || 76) * 10) / 10}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-glass-muted">Response Rate</span>
                <span className="text-glass-bright font-bold">87%</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="text-glass-bright">Marketplace Analytics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center text-glass-muted">
            <BarChart3 className="w-16 h-16 mb-4" />
          </div>
          <p className="text-center text-glass-muted">Advanced analytics charts would appear here</p>
        </CardContent>
      </Card>
    </div>
  );
};

// Add Vehicle Form Component
const AddVehicleForm = ({ onSuccess }) => {
  const [formData, setFormData] = useState({
    make: '',
    model: '',
    year: new Date().getFullYear(),
    trim: '',
    condition: 'New',
    price: '',
    mileage: '',
    exterior_color: '',
    interior_color: '',
    fuel_type: 'Gasoline',
    transmission: 'Automatic',
    engine: '',
    description: '',
    features: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API}/inventory/vehicles`, {
        ...formData,
        tenant_id: 'default_dealership',
        price: parseFloat(formData.price),
        year: parseInt(formData.year),
        mileage: parseInt(formData.mileage),
        features: formData.features.split(',').map(f => f.trim()).filter(f => f)
      });
      
      toast.success('Vehicle added successfully!');
      onSuccess();
    } catch (error) {
      console.error('Error adding vehicle:', error);
      toast.error('Failed to add vehicle');
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-h-96 overflow-y-auto">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label className="text-glass">Make *</Label>
          <Input
            name="make"
            value={formData.make}
            onChange={handleChange}
            required
            className="text-glass"
          />
        </div>
        <div>
          <Label className="text-glass">Model *</Label>
          <Input
            name="model"
            value={formData.model}
            onChange={handleChange}
            required
            className="text-glass"
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <Label className="text-glass">Year *</Label>
          <Input
            name="year"
            type="number"
            value={formData.year}
            onChange={handleChange}
            required
            className="text-glass"
          />
        </div>
        <div>
          <Label className="text-glass">Trim</Label>
          <Input
            name="trim"
            value={formData.trim}
            onChange={handleChange}
            className="text-glass"
          />
        </div>
        <div>
          <Label className="text-glass">Condition *</Label>
          <Select value={formData.condition} onValueChange={(value) => setFormData({...formData, condition: value})}>
            <SelectTrigger className="glass-card text-glass">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="modal-glass">
              <SelectItem value="New">New</SelectItem>
              <SelectItem value="Used">Used</SelectItem>
              <SelectItem value="Certified Pre-Owned">Certified Pre-Owned</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label className="text-glass">Price *</Label>
          <Input
            name="price"
            type="number"
            value={formData.price}
            onChange={handleChange}
            required
            className="text-glass"
          />
        </div>
        <div>
          <Label className="text-glass">Mileage</Label>
          <Input
            name="mileage"
            type="number"
            value={formData.mileage}
            onChange={handleChange}
            className="text-glass"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label className="text-glass">Exterior Color</Label>
          <Input
            name="exterior_color"
            value={formData.exterior_color}
            onChange={handleChange}
            className="text-glass"
          />
        </div>
        <div>
          <Label className="text-glass">Interior Color</Label>
          <Input
            name="interior_color"
            value={formData.interior_color}
            onChange={handleChange}
            className="text-glass"
          />
        </div>
      </div>

      <div>
        <Label className="text-glass">Features (comma-separated)</Label>
        <Textarea
          name="features"
          value={formData.features}
          onChange={handleChange}
          placeholder="Bluetooth, Backup Camera, Apple CarPlay"
          className="text-glass"
          rows={2}
        />
      </div>

      <Button type="submit" className="w-full btn-neon">
        Add Vehicle to Inventory
      </Button>
    </form>
  );
};

export default EnhancedInventoryManagement;