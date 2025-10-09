/**
 * VehicleCard Component
 * Reusable vehicle display card for inventory screens
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';

const { width } = Dimensions.get('window');

const VehicleCard = ({ 
  vehicle, 
  onPress, 
  onLeadGenerate, 
  onMarketplaceListing,
  style 
}) => {
  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const getConditionColor = (condition) => {
    switch (condition?.toLowerCase()) {
      case 'new':
        return '#11998e';
      case 'used':
        return '#f5af19';
      case 'certified':
        return '#667eea';
      default:
        return '#8e8e93';
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'available':
        return '#11998e';
      case 'pending':
        return '#f5af19';
      case 'sold':
        return '#e94560';
      default:
        return '#8e8e93';
    }
  };

  return (
    <TouchableOpacity 
      style={[styles.container, style]} 
      onPress={() => onPress?.(vehicle)}
      activeOpacity={0.8}
    >
      <LinearGradient
        colors={['#1a1a2e', '#16213e', '#0f3460']}
        style={styles.gradientContainer}
      >
        {/* Vehicle Image */}
        <View style={styles.imageContainer}>
          {vehicle.images && vehicle.images.length > 0 ? (
            <Image 
              source={{ uri: vehicle.images[0] }} 
              style={styles.vehicleImage}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.placeholderImage}>
              <Icon name="directions-car" size={40} color="#8e8e93" />
              <Text style={styles.placeholderText}>No Image</Text>
            </View>
          )}
          
          {/* Condition Badge */}
          <View 
            style={[
              styles.conditionBadge, 
              { backgroundColor: getConditionColor(vehicle.condition) }
            ]}
          >
            <Text style={styles.conditionText}>
              {vehicle.condition?.toUpperCase() || 'UNKNOWN'}
            </Text>
          </View>
          
          {/* Leads Count Badge */}
          {vehicle.leads_count > 0 && (
            <View style={styles.leadsBadge}>
              <Icon name="people" size={12} color="#ffffff" />
              <Text style={styles.leadsText}>{vehicle.leads_count}</Text>
            </View>
          )}
        </View>

        {/* Vehicle Details */}
        <View style={styles.detailsContainer}>
          {/* Title */}
          <Text style={styles.vehicleTitle} numberOfLines={1}>
            {vehicle.year} {vehicle.make} {vehicle.model}
          </Text>
          
          {/* Trim & Mileage */}
          <Text style={styles.vehicleSubtitle} numberOfLines={1}>
            {vehicle.trim && `${vehicle.trim} • `}
            {vehicle.mileage?.toLocaleString() || '0'} miles
          </Text>

          {/* Price */}
          <View style={styles.priceContainer}>
            <Text style={styles.currentPrice}>
              {formatPrice(vehicle.price || 0)}
            </Text>
            {vehicle.original_price && vehicle.original_price > vehicle.price && (
              <View style={styles.originalPriceContainer}>
                <Text style={styles.originalPrice}>
                  {formatPrice(vehicle.original_price)}
                </Text>
                <Text style={styles.savings}>
                  Save ${(vehicle.original_price - vehicle.price).toLocaleString()}
                </Text>
              </View>
            )}
          </View>

          {/* Status & Actions */}
          <View style={styles.statusActionContainer}>
            <View style={styles.statusContainer}>
              <View 
                style={[
                  styles.statusDot, 
                  { backgroundColor: getStatusColor(vehicle.status) }
                ]}
              />
              <Text style={styles.statusText}>
                {vehicle.status || 'Available'}
              </Text>
            </View>

            {/* Action Buttons */}
            <View style={styles.actionButtons}>
              {/* Generate Lead Button */}
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => onLeadGenerate?.(vehicle)}
              >
                <Icon name="person-add" size={16} color="#e94560" />
              </TouchableOpacity>

              {/* Marketplace Listing Button */}
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => onMarketplaceListing?.(vehicle)}
              >
                <Icon name="shopping-cart" size={16} color="#667eea" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Vehicle Features (Top 3) */}
          {vehicle.features && vehicle.features.length > 0 && (
            <View style={styles.featuresContainer}>
              <Text style={styles.featuresText}>
                {vehicle.features.slice(0, 3).join(' • ')}
              </Text>
            </View>
          )}

          {/* Stock Number & VIN */}
          <View style={styles.identifiersContainer}>
            {vehicle.stock_number && (
              <Text style={styles.identifierText}>
                Stock: {vehicle.stock_number}
              </Text>
            )}
            {vehicle.vin && (
              <Text style={styles.identifierText}>
                VIN: {vehicle.vin.slice(-8)}
              </Text>
            )}
          </View>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 15,
    marginVertical: 8,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 8,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  gradientContainer: {
    padding: 15,
  },
  imageContainer: {
    position: 'relative',
    height: 180,
    marginBottom: 12,
    borderRadius: 8,
    overflow: 'hidden',
  },
  vehicleImage: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
  placeholderImage: {
    width: '100%',
    height: '100%',
    backgroundColor: '#2a2a3e',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  },
  placeholderText: {
    color: '#8e8e93',
    fontSize: 12,
    marginTop: 4,
  },
  conditionBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  conditionText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  leadsBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(233, 69, 96, 0.9)',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 12,
  },
  leadsText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: 'bold',
    marginLeft: 2,
  },
  detailsContainer: {
    flex: 1,
  },
  vehicleTitle: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  vehicleSubtitle: {
    color: '#8e8e93',
    fontSize: 14,
    marginBottom: 8,
  },
  priceContainer: {
    marginBottom: 8,
  },
  currentPrice: {
    color: '#e94560',
    fontSize: 18,
    fontWeight: 'bold',
  },
  originalPriceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  originalPrice: {
    color: '#8e8e93',
    fontSize: 12,
    textDecorationLine: 'line-through',
    marginRight: 8,
  },
  savings: {
    color: '#11998e',
    fontSize: 12,
    fontWeight: '600',
  },
  statusActionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  statusText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '500',
  },
  actionButtons: {
    flexDirection: 'row',
  },
  actionButton: {
    padding: 8,
    borderRadius: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginLeft: 8,
  },
  featuresContainer: {
    marginBottom: 8,
  },
  featuresText: {
    color: '#8e8e93',
    fontSize: 11,
  },
  identifiersContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  identifierText: {
    color: '#666677',
    fontSize: 10,
  },
});

export default VehicleCard;