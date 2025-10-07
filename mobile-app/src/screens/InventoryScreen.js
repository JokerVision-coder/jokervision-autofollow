import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Dimensions,
  Image,
  TextInput,
  Alert,
  Modal,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { getInventory, addVehicle } from '../services/ApiService';

const { width } = Dimensions.get('window');

const InventoryScreen = ({ navigation }) => {
  const [inventory, setInventory] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadInventory();
  }, []);

  const loadInventory = async () => {
    try {
      setLoading(true);
      const data = await getInventory();
      setInventory(data.vehicles || []);
    } catch (error) {
      console.error('Failed to load inventory:', error);
      Alert.alert('Error', 'Failed to load inventory data');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadInventory();
    setRefreshing(false);
  };

  const filteredInventory = inventory.filter(vehicle => {
    const matchesSearch = searchQuery === '' || 
      `${vehicle.year} ${vehicle.make} ${vehicle.model}`.toLowerCase()
        .includes(searchQuery.toLowerCase());
    
    const matchesFilter = filterStatus === 'all' || 
      vehicle.status.toLowerCase() === filterStatus.toLowerCase();
      
    return matchesSearch && matchesFilter;
  });

  const handleAddVehicle = () => {
    setAddModalVisible(true);
  };

  const handleVehiclePress = (vehicle) => {
    Alert.alert(
      `${vehicle.year} ${vehicle.make} ${vehicle.model}`,
      `Price: $${vehicle.price.toLocaleString()}\nMileage: ${vehicle.mileage.toLocaleString()} miles\nColor: ${vehicle.color}\nStatus: ${vehicle.status}`,
      [
        { text: 'Edit', onPress: () => console.log('Edit vehicle') },
        { text: 'Share', onPress: () => console.log('Share vehicle') },
        { text: 'Close', style: 'cancel' },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#1a1a2e', '#16213e', '#0f3460']}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>🚗 Revolutionary Inventory</Text>
        <Text style={styles.headerSubtitle}>
          {inventory.length} vehicles • Real-time sync across 50+ platforms
        </Text>
        
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Icon name="search" size={20} color="#8e8e93" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search vehicles..."
            placeholderTextColor="#8e8e93"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        
        {/* Filter Buttons */}
        <View style={styles.filterContainer}>
          {['all', 'available', 'sold', 'pending'].map((filter) => (
            <TouchableOpacity
              key={filter}
              style={[
                styles.filterButton,
                filterStatus === filter && styles.filterButtonActive
              ]}
              onPress={() => setFilterStatus(filter)}
            >
              <Text style={[
                styles.filterButtonText,
                filterStatus === filter && styles.filterButtonTextActive
              ]}>
                {filter.charAt(0).toUpperCase() + filter.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </LinearGradient>

      <ScrollView 
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Inventory Stats */}
        <View style={styles.statsContainer}>
          <StatCard
            title="Total Vehicles"
            value={inventory.length}
            icon="inventory"
            gradient={['#11998e', '#38ef7d']}
          />
          <StatCard
            title="Platforms Posted"
            value="50+"
            icon="share"
            gradient={['#667eea', '#764ba2']}
          />
          <StatCard
            title="Total Views"
            value="12.4K"
            icon="visibility"
            gradient={['#f093fb', '#f5576c']}
          />
          <StatCard
            title="Active Leads"
            value={inventory.reduce((sum, v) => sum + (v.leads || 0), 0)}
            icon="people"
            gradient={['#ffecd2', '#fcb69f']}
          />
        </View>

        {/* Vehicle List */}
        <View style={styles.vehicleList}>
          {filteredInventory.map((vehicle) => (
            <VehicleCard
              key={vehicle.id}
              vehicle={vehicle}
              onPress={() => handleVehiclePress(vehicle)}
            />
          ))}
          
          {filteredInventory.length === 0 && !loading && (
            <View style={styles.emptyState}>
              <Icon name="inventory" size={60} color="#8e8e93" />
              <Text style={styles.emptyTitle}>No vehicles found</Text>
              <Text style={styles.emptySubtitle}>
                {searchQuery || filterStatus !== 'all' 
                  ? 'Try adjusting your search or filters'
                  : 'Add your first vehicle to get started'
                }
              </Text>
            </View>
          )}
        </View>

        {/* Revolutionary Features */}
        <LinearGradient
          colors={['#e94560', '#f5af19']}
          style={styles.featuresBanner}
        >
          <Text style={styles.bannerTitle}>🚀 Exclusive Features</Text>
          <Text style={styles.bannerText}>
            ✓ Auto-post to 50+ platforms{'\n'}
            ✓ Real-time lead tracking{'\n'}
            ✓ AI-powered descriptions{'\n'}
            ✓ Performance analytics
          </Text>
        </LinearGradient>
      </ScrollView>

      {/* Floating Add Button */}
      <TouchableOpacity
        style={styles.floatingButton}
        onPress={handleAddVehicle}
      >
        <LinearGradient
          colors={['#e94560', '#f5af19']}
          style={styles.floatingButtonGradient}
        >
          <Icon name="add" size={28} color="#ffffff" />
        </LinearGradient>
      </TouchableOpacity>

      {/* Add Vehicle Modal */}
      <AddVehicleModal
        visible={addModalVisible}
        onClose={() => setAddModalVisible(false)}
        onSave={(vehicleData) => {
          // Handle adding vehicle
          console.log('Adding vehicle:', vehicleData);
          setAddModalVisible(false);
          onRefresh();
        }}
      />
    </View>
  );
};

const StatCard = ({ title, value, icon, gradient }) => (
  <View style={styles.statCard}>
    <LinearGradient colors={gradient} style={styles.statGradient}>
      <Icon name={icon} size={20} color="#ffffff" />
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statTitle}>{title}</Text>
    </LinearGradient>
  </View>
);

const VehicleCard = ({ vehicle, onPress }) => (
  <TouchableOpacity style={styles.vehicleCard} onPress={onPress}>
    <Image 
      source={{ uri: vehicle.images[0] }}
      style={styles.vehicleImage}
      defaultSource={{ uri: 'https://via.placeholder.com/120x80/1a1a2e/eee?text=Vehicle' }}
    />
    
    <View style={styles.vehicleInfo}>
      <Text style={styles.vehicleTitle}>
        {vehicle.year} {vehicle.make} {vehicle.model}
      </Text>
      <Text style={styles.vehicleSubtitle}>
        {vehicle.trim} • {vehicle.color}
      </Text>
      <Text style={styles.vehiclePrice}>
        ${vehicle.price.toLocaleString()}
      </Text>
      <View style={styles.vehicleStats}>
        <Text style={styles.vehicleStatText}>
          {vehicle.mileage.toLocaleString()} miles
        </Text>
        <View style={styles.vehicleStatDot} />
        <Text style={styles.vehicleStatText}>
          {vehicle.views || 0} views
        </Text>
        <View style={styles.vehicleStatDot} />
        <Text style={styles.vehicleStatText}>
          {vehicle.leads || 0} leads
        </Text>
      </View>
    </View>
    
    <View style={styles.vehicleActions}>
      <View style={[
        styles.statusBadge,
        { backgroundColor: vehicle.status === 'Available' ? '#11998e' : '#e94560' }
      ]}>
        <Text style={styles.statusText}>{vehicle.status}</Text>
      </View>
      
      <TouchableOpacity style={styles.actionButton}>
        <Icon name="more-vert" size={20} color="#8e8e93" />
      </TouchableOpacity>
    </View>
  </TouchableOpacity>
);

const AddVehicleModal = ({ visible, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    year: '',
    make: '',
    model: '',
    price: '',
    mileage: '',
    color: '',
  });

  const handleSave = () => {
    if (!formData.year || !formData.make || !formData.model || !formData.price) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }
    
    onSave(formData);
    setFormData({
      year: '',
      make: '',
      model: '',
      price: '',
      mileage: '',
      color: '',
    });
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <LinearGradient
        colors={['#0f0f23', '#1a1a2e']}
        style={styles.modalContainer}
      >
        <View style={styles.modalHeader}>
          <TouchableOpacity onPress={onClose}>
            <Icon name="close" size={24} color="#ffffff" />
          </TouchableOpacity>
          <Text style={styles.modalTitle}>Add New Vehicle</Text>
          <TouchableOpacity onPress={handleSave}>
            <Text style={styles.saveButton}>Save</Text>
          </TouchableOpacity>
        </View>
        
        <ScrollView style={styles.modalContent}>
          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>Year *</Text>
            <TextInput
              style={styles.formInput}
              value={formData.year}
              onChangeText={(text) => setFormData({...formData, year: text})}
              placeholder="2024"
              placeholderTextColor="#8e8e93"
              keyboardType="numeric"
            />
          </View>
          
          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>Make *</Text>
            <TextInput
              style={styles.formInput}
              value={formData.make}
              onChangeText={(text) => setFormData({...formData, make: text})}
              placeholder="Toyota"
              placeholderTextColor="#8e8e93"
            />
          </View>
          
          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>Model *</Text>
            <TextInput
              style={styles.formInput}
              value={formData.model}
              onChangeText={(text) => setFormData({...formData, model: text})}
              placeholder="Camry"
              placeholderTextColor="#8e8e93"
            />
          </View>
          
          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>Price *</Text>
            <TextInput
              style={styles.formInput}
              value={formData.price}
              onChangeText={(text) => setFormData({...formData, price: text})}
              placeholder="28500"
              placeholderTextColor="#8e8e93"
              keyboardType="numeric"
            />
          </View>
          
          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>Mileage</Text>
            <TextInput
              style={styles.formInput}
              value={formData.mileage}
              onChangeText={(text) => setFormData({...formData, mileage: text})}
              placeholder="15000"
              placeholderTextColor="#8e8e93"
              keyboardType="numeric"
            />
          </View>
          
          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>Color</Text>
            <TextInput
              style={styles.formInput}
              value={formData.color}
              onChangeText={(text) => setFormData({...formData, color: text})}
              placeholder="White"
              placeholderTextColor="#8e8e93"
            />
          </View>
        </ScrollView>
      </LinearGradient>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f0f23',
  },
  header: {
    padding: 20,
    paddingTop: 30,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 5,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#8e8e93',
    marginBottom: 20,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 10,
    paddingHorizontal: 15,
    marginBottom: 15,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    height: 40,
    color: '#ffffff',
    fontSize: 16,
  },
  filterContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  filterButton: {
    flex: 1,
    padding: 8,
    marginHorizontal: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    alignItems: 'center',
  },
  filterButtonActive: {
    backgroundColor: '#e94560',
  },
  filterButtonText: {
    color: '#8e8e93',
    fontSize: 12,
    fontWeight: '600',
  },
  filterButtonTextActive: {
    color: '#ffffff',
  },
  content: {
    flex: 1,
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 15,
    justifyContent: 'space-between',
  },
  statCard: {
    width: (width - 45) / 2,
    marginBottom: 15,
  },
  statGradient: {
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
    marginVertical: 3,
  },
  statTitle: {
    fontSize: 10,
    color: '#ffffff',
    textAlign: 'center',
  },
  vehicleList: {
    padding: 15,
  },
  vehicleCard: {
    flexDirection: 'row',
    backgroundColor: '#1a1a2e',
    borderRadius: 15,
    padding: 15,
    marginBottom: 15,
    alignItems: 'center',
  },
  vehicleImage: {
    width: 80,
    height: 60,
    borderRadius: 8,
    marginRight: 15,
  },
  vehicleInfo: {
    flex: 1,
  },
  vehicleTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 3,
  },
  vehicleSubtitle: {
    fontSize: 12,
    color: '#8e8e93',
    marginBottom: 5,
  },
  vehiclePrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#e94560',
    marginBottom: 5,
  },
  vehicleStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  vehicleStatText: {
    fontSize: 10,
    color: '#8e8e93',
  },
  vehicleStatDot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: '#8e8e93',
    marginHorizontal: 8,
  },
  vehicleActions: {
    alignItems: 'center',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 10,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#ffffff',
  },
  actionButton: {
    padding: 5,
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    marginTop: 15,
    marginBottom: 5,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#8e8e93',
    textAlign: 'center',
  },
  featuresBanner: {
    margin: 20,
    padding: 20,
    borderRadius: 15,
  },
  bannerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 10,
  },
  bannerText: {
    fontSize: 14,
    color: '#ffffff',
    lineHeight: 20,
  },
  floatingButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  floatingButtonGradient: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 50,
    borderBottomWidth: 1,
    borderBottomColor: '#2a2a3e',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  saveButton: {
    fontSize: 16,
    fontWeight: '600',
    color: '#e94560',
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  formGroup: {
    marginBottom: 20,
  },
  formLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 8,
  },
  formInput: {
    backgroundColor: '#1a1a2e',
    borderRadius: 10,
    padding: 15,
    color: '#ffffff',
    fontSize: 16,
  },
});

export default InventoryScreen;