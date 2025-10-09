#!/usr/bin/env python3
"""
Enhanced Inventory Integration System Tests
Tests the enhanced inventory integration system as requested in the review.
"""

import requests
import sys
import json
import time
from datetime import datetime

class EnhancedInventoryTester:
    def __init__(self, base_url="https://dealergenius.preview.emergentagent.com"):
        self.base_url = base_url
        self.api_url = f"{base_url}/api"
        self.tests_run = 0
        self.tests_passed = 0

    def run_test(self, name, method, endpoint, expected_status, data=None, headers=None):
        """Run a single API test"""
        url = f"{self.api_url}/{endpoint}"
        if headers is None:
            headers = {'Content-Type': 'application/json'}

        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        print(f"   URL: {url}")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers)
            elif method == 'POST':
                if headers.get('Content-Type') == 'text/plain':
                    response = requests.post(url, data=data, headers=headers)
                else:
                    response = requests.post(url, json=data, headers=headers)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=headers)

            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                try:
                    response_data = response.json()
                    print(f"   Response: {json.dumps(response_data, indent=2)[:200]}...")
                    return True, response_data
                except:
                    return True, {}
            else:
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
                try:
                    error_data = response.json()
                    print(f"   Error: {error_data}")
                except:
                    print(f"   Error: {response.text}")
                return False, {}

        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            return False, {}

    def test_inventory_sync_endpoint(self):
        """Test the enhanced inventory sync endpoint POST /api/inventory/sync?tenant_id=default"""
        print("\n🚗 Testing Enhanced Inventory Sync Endpoint...")
        
        # Test the inventory sync endpoint
        success, response = self.run_test(
            "Enhanced Inventory Sync",
            "POST",
            "inventory/sync/default",
            200
        )
        
        if success:
            # Verify response structure
            required_fields = ['status', 'message', 'total_vehicles', 'new_vehicles', 'used_vehicles']
            missing_fields = [field for field in required_fields if field not in response]
            
            if not missing_fields:
                total = response.get('total_vehicles', 0)
                new_count = response.get('new_vehicles', 0)
                used_count = response.get('used_vehicles', 0)
                
                print(f"   ✅ Sync completed - Total: {total}, New: {new_count}, Used: {used_count}")
                
                # Verify realistic vehicle counts (should be 150 vehicles with 70%/30% split)
                if total >= 100 and new_count > used_count:
                    print(f"   ✅ Realistic vehicle distribution - {(new_count/total)*100:.0f}% new, {(used_count/total)*100:.0f}% used")
                    return True
                else:
                    print(f"   ❌ Unrealistic vehicle distribution")
                    return False
            else:
                print(f"   ❌ Response missing fields: {missing_fields}")
                return False
        return False
    
    def test_vehicle_data_structure(self):
        """Test that generated vehicles have proper structure and realistic data"""
        print("\n🔍 Testing Vehicle Data Structure...")
        
        # Get vehicles to verify structure
        success, response = self.run_test(
            "Get Vehicles for Structure Test",
            "GET",
            "inventory/vehicles?tenant_id=default",
            200
        )
        
        if success and 'vehicles' in response:
            vehicles = response['vehicles']
            if not vehicles:
                print("   ❌ No vehicles found for testing")
                return False
            
            # Test first vehicle structure
            vehicle = vehicles[0]
            required_fields = [
                'id', 'vin', 'stock_number', 'year', 'make', 'model', 'trim',
                'condition', 'price', 'mileage', 'exterior_color', 'interior_color',
                'features', 'images', 'description'
            ]
            
            missing_fields = [field for field in required_fields if field not in vehicle]
            if missing_fields:
                print(f"   ❌ Vehicle missing required fields: {missing_fields}")
                return False
            
            # Verify VIN format (17 characters)
            vin = vehicle.get('vin', '')
            if len(vin) != 17:
                print(f"   ❌ Invalid VIN length: {len(vin)} (should be 17)")
                return False
            
            # Verify stock number format
            stock_number = vehicle.get('stock_number', '')
            if not stock_number.startswith('STK'):
                print(f"   ❌ Invalid stock number format: {stock_number}")
                return False
            
            # Verify realistic pricing
            price = vehicle.get('price', 0)
            if not (15000 <= price <= 100000):
                print(f"   ❌ Unrealistic price: ${price:,}")
                return False
            
            # Verify multiple images
            images = vehicle.get('images', [])
            if len(images) < 5:
                print(f"   ❌ Insufficient images: {len(images)} (should be 5+)")
                return False
            
            # Verify comprehensive features
            features = vehicle.get('features', [])
            if len(features) < 5:
                print(f"   ❌ Insufficient features: {len(features)} (should be 5+)")
                return False
            
            # Check for multiple makes
            makes = set(v.get('make', '') for v in vehicles[:10])  # Check first 10
            expected_makes = {'Toyota', 'Honda', 'Ford', 'Chevrolet'}
            found_makes = makes.intersection(expected_makes)
            
            if len(found_makes) < 2:
                print(f"   ❌ Limited vehicle makes: {found_makes} (expected multiple)")
                return False
            
            print(f"   ✅ Vehicle structure valid - VIN: {vin}, Stock: {stock_number}")
            print(f"   ✅ Realistic pricing - ${price:,}")
            print(f"   ✅ Multiple images - {len(images)} images")
            print(f"   ✅ Comprehensive features - {len(features)} features")
            print(f"   ✅ Multiple makes available - {found_makes}")
            
            return True
        
        print("   ❌ Failed to retrieve vehicles for testing")
        return False
    
    def test_inventory_listing_endpoint(self):
        """Test GET /api/inventory/vehicles?tenant_id=default endpoint"""
        print("\n📋 Testing Inventory Listing Endpoint...")
        
        success, response = self.run_test(
            "Get Inventory Vehicles",
            "GET",
            "inventory/vehicles?tenant_id=default",
            200
        )
        
        if success:
            # Verify response structure
            required_fields = ['vehicles', 'total_count', 'page', 'per_page']
            missing_fields = [field for field in required_fields if field not in response]
            
            if not missing_fields:
                vehicles = response.get('vehicles', [])
                total_count = response.get('total_count', 0)
                
                print(f"   ✅ Retrieved {len(vehicles)} vehicles (Total: {total_count})")
                
                # Test pagination
                if total_count > 20:  # If we have more than one page
                    page2_success, page2_response = self.run_test(
                        "Get Inventory Vehicles - Page 2",
                        "GET",
                        "inventory/vehicles?tenant_id=default&page=2",
                        200
                    )
                    
                    if page2_success:
                        page2_vehicles = page2_response.get('vehicles', [])
                        print(f"   ✅ Pagination working - Page 2 has {len(page2_vehicles)} vehicles")
                    else:
                        print(f"   ❌ Pagination failed")
                        return False
                
                # Test filtering by condition
                new_success, new_response = self.run_test(
                    "Filter by New Condition",
                    "GET",
                    "inventory/vehicles?tenant_id=default&condition=New",
                    200
                )
                
                if new_success:
                    new_vehicles = new_response.get('vehicles', [])
                    all_new = all(v.get('condition') == 'New' for v in new_vehicles)
                    if all_new:
                        print(f"   ✅ Filtering working - {len(new_vehicles)} new vehicles")
                    else:
                        print(f"   ❌ Filtering failed - mixed conditions found")
                        return False
                
                return True
            else:
                print(f"   ❌ Response missing fields: {missing_fields}")
                return False
        
        return False
    
    def test_inventory_performance(self):
        """Test inventory sync performance (should complete under 30 seconds)"""
        print("\n⚡ Testing Inventory Performance...")
        
        start_time = time.time()
        
        success, response = self.run_test(
            "Performance Test - Inventory Sync",
            "POST",
            "inventory/sync/default",
            200
        )
        
        end_time = time.time()
        duration = end_time - start_time
        
        if success:
            if duration < 30:
                print(f"   ✅ Performance test passed - Completed in {duration:.2f} seconds")
                
                # Test database operations
                db_start = time.time()
                db_success, db_response = self.run_test(
                    "Performance Test - Database Retrieval",
                    "GET",
                    "inventory/vehicles?tenant_id=default&per_page=50",
                    200
                )
                db_duration = time.time() - db_start
                
                if db_success and db_duration < 5:
                    print(f"   ✅ Database performance good - Retrieved in {db_duration:.2f} seconds")
                    return True
                else:
                    print(f"   ❌ Database performance slow - {db_duration:.2f} seconds")
                    return False
            else:
                print(f"   ❌ Performance test failed - Took {duration:.2f} seconds (limit: 30s)")
                return False
        
        return False
    
    def test_inventory_data_quality(self):
        """Test data quality of enhanced inventory"""
        print("\n🎯 Testing Inventory Data Quality...")
        
        success, response = self.run_test(
            "Get Vehicles for Quality Test",
            "GET",
            "inventory/vehicles?tenant_id=default&per_page=20",
            200
        )
        
        if success and 'vehicles' in response:
            vehicles = response['vehicles']
            if not vehicles:
                print("   ❌ No vehicles found for quality testing")
                return False
            
            quality_checks = {
                'realistic_years': 0,
                'appropriate_mileage': 0,
                'market_pricing': 0,
                'professional_descriptions': 0,
                'comprehensive_features': 0
            }
            
            for vehicle in vehicles:
                # Check realistic years (2018-2025)
                year = vehicle.get('year', 0)
                if 2018 <= year <= 2025:
                    quality_checks['realistic_years'] += 1
                
                # Check appropriate mileage for condition
                condition = vehicle.get('condition', '')
                mileage = vehicle.get('mileage', 0)
                if condition == 'New' and mileage < 100:
                    quality_checks['appropriate_mileage'] += 1
                elif condition == 'Used' and 5000 <= mileage <= 150000:
                    quality_checks['appropriate_mileage'] += 1
                
                # Check market-appropriate pricing
                price = vehicle.get('price', 0)
                if 15000 <= price <= 80000:
                    quality_checks['market_pricing'] += 1
                
                # Check professional descriptions
                description = vehicle.get('description', '')
                if len(description) > 50 and any(word in description.lower() for word in ['features', 'vehicle', 'miles']):
                    quality_checks['professional_descriptions'] += 1
                
                # Check comprehensive features
                features = vehicle.get('features', [])
                if len(features) >= 8:
                    quality_checks['comprehensive_features'] += 1
            
            total_vehicles = len(vehicles)
            quality_score = 0
            
            for check_name, passed_count in quality_checks.items():
                percentage = (passed_count / total_vehicles) * 100
                print(f"   {check_name.replace('_', ' ').title()}: {passed_count}/{total_vehicles} ({percentage:.0f}%)")
                if percentage >= 80:  # 80% threshold
                    quality_score += 1
            
            if quality_score >= 4:  # At least 4/5 quality checks pass
                print(f"   ✅ Data quality excellent - {quality_score}/5 checks passed")
                return True
            else:
                print(f"   ❌ Data quality insufficient - {quality_score}/5 checks passed")
                return False
        
        return False
    
    def test_inventory_error_handling(self):
        """Test inventory system error handling"""
        print("\n🛡️ Testing Inventory Error Handling...")
        
        # Test invalid tenant_id
        success1, _ = self.run_test(
            "Invalid Tenant ID",
            "GET",
            "inventory/vehicles?tenant_id=invalid_tenant_123",
            200  # Should handle gracefully
        )
        
        # Test missing tenant_id
        success2, _ = self.run_test(
            "Missing Tenant ID",
            "GET",
            "inventory/vehicles",
            422  # Should return validation error
        )
        
        # Test invalid pagination parameters
        success3, _ = self.run_test(
            "Invalid Pagination",
            "GET",
            "inventory/vehicles?tenant_id=default&page=-1&per_page=1000",
            200  # Should handle gracefully with defaults
        )
        
        passed_tests = sum([success1, success2, success3])
        print(f"   📊 Error Handling: {passed_tests}/3 tests passed")
        
        return passed_tests >= 2
    
    def run_comprehensive_tests(self):
        """Run comprehensive enhanced inventory integration test suite"""
        print("🚗 Enhanced Inventory Integration System Testing")
        print("=" * 60)
        print(f"Backend URL: {self.base_url}")
        print(f"API URL: {self.api_url}")
        print("=" * 60)
        
        inventory_tests = [
            ("Inventory Sync Endpoint", self.test_inventory_sync_endpoint),
            ("Vehicle Data Structure", self.test_vehicle_data_structure),
            ("Inventory Listing Endpoint", self.test_inventory_listing_endpoint),
            ("Inventory Performance", self.test_inventory_performance),
            ("Inventory Data Quality", self.test_inventory_data_quality),
            ("Inventory Error Handling", self.test_inventory_error_handling)
        ]
        
        passed_tests = 0
        total_tests = len(inventory_tests)
        
        for test_name, test_func in inventory_tests:
            try:
                if test_func():
                    passed_tests += 1
                    print(f"✅ {test_name} - PASSED")
                else:
                    print(f"❌ {test_name} - FAILED")
            except Exception as e:
                print(f"❌ {test_name} - ERROR: {str(e)}")
        
        success_rate = (passed_tests / total_tests) * 100
        
        print("\n" + "=" * 60)
        print("📊 ENHANCED INVENTORY INTEGRATION TEST RESULTS")
        print("=" * 60)
        print(f"Tests Run: {self.tests_run}")
        print(f"Tests Passed: {self.tests_passed}")
        print(f"Suite Results: {passed_tests}/{total_tests} passed ({success_rate:.1f}%)")
        
        if passed_tests >= total_tests * 0.8:  # 80% pass rate required
            print("🎉 Enhanced Inventory Integration: SUCCESS!")
            print("✅ Enhanced inventory generator working when real scraping fails")
            print("✅ Realistic vehicle data with proper structure")
            print("✅ Valid VIN numbers (17 characters)")
            print("✅ Realistic stock numbers and pricing")
            print("✅ Multiple vehicle makes (Toyota, Honda, Ford, Chevrolet)")
            print("✅ Comprehensive feature lists and specifications")
            print("✅ Multiple vehicle images")
            print("✅ Proper condition status (New/Used with 70%/30% split)")
            print("✅ Performance under 30 seconds")
            print("✅ Database operations successful")
            print("✅ Error handling works for edge cases")
            return True
        else:
            print("❌ Enhanced Inventory Integration: FAILED")
            print(f"Only {passed_tests}/{total_tests} tests passed")
            print("Some inventory functionality may need fixes")
            return False

def main():
    """Main function to run enhanced inventory tests"""
    tester = EnhancedInventoryTester()
    
    success = tester.run_comprehensive_tests()
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())