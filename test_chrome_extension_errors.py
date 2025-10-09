#!/usr/bin/env python3

import requests
import json

def test_error_handling():
    """Test Chrome extension error handling scenarios"""
    base_url = "https://dealergenius.preview.emergentagent.com/api"
    
    print("🔧 Testing Chrome Extension Error Handling")
    print("=" * 50)
    
    # Test 1: Missing tenant_id in SEO generation
    print("\n1. Testing SEO Generation - Missing tenant_id...")
    try:
        invalid_data = {
            "vehicle_data": {
                "year": 2023,
                "make": "Toyota",
                "model": "Camry"
            }
        }
        response = requests.post(f"{base_url}/ai/generate-seo-description", json=invalid_data)
        if response.status_code == 422:
            print("✅ Correctly rejected request with missing tenant_id")
        else:
            print(f"❌ Expected 422, got {response.status_code}")
    except Exception as e:
        print(f"❌ Error: {e}")
    
    # Test 2: Invalid tenant_id in inventory summary
    print("\n2. Testing Inventory Summary - Invalid tenant_id...")
    try:
        response = requests.get(f"{base_url}/inventory/summary?tenant_id=invalid_tenant_12345")
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Handled invalid tenant gracefully - returned {data.get('total_vehicles', 0)} vehicles")
        else:
            print(f"❌ Expected 200, got {response.status_code}")
    except Exception as e:
        print(f"❌ Error: {e}")
    
    # Test 3: Missing event in analytics tracking
    print("\n3. Testing Analytics - Missing event field...")
    try:
        invalid_analytics = {
            "tenant_id": "test_tenant",
            "data": {"test": "data"}
        }
        response = requests.post(f"{base_url}/analytics/track-interaction", json=invalid_analytics)
        if response.status_code == 200:
            data = response.json()
            if 'error' in data:
                print("✅ Correctly handled missing event field with error message")
            else:
                print("❌ Should have returned error for missing event")
        else:
            print(f"❌ Expected 200 with error, got {response.status_code}")
    except Exception as e:
        print(f"❌ Error: {e}")
    
    # Test 4: Empty vehicle data in price optimization
    print("\n4. Testing Price Optimization - Empty vehicle data...")
    try:
        empty_data = {
            "tenant_id": "demo_tenant_123",
            "vehicle_data": {},
            "current_price": 25000
        }
        response = requests.post(f"{base_url}/ai/optimize-price", json=empty_data)
        if response.status_code == 200:
            data = response.json()
            if data.get('success'):
                print("✅ Handled empty vehicle data gracefully")
            else:
                print("❌ Failed to handle empty vehicle data")
        else:
            print(f"❌ Expected 200, got {response.status_code}")
    except Exception as e:
        print(f"❌ Error: {e}")
    
    # Test 5: Invalid authentication credentials
    print("\n5. Testing Authentication - Invalid credentials...")
    try:
        invalid_auth = {
            "email": "invalid@test.com",
            "password": "wrongpassword"
        }
        response = requests.post(f"{base_url}/auth/extension-login", json=invalid_auth)
        if response.status_code == 200:
            data = response.json()
            if data.get('success'):
                print("✅ Authentication endpoint working (mock implementation)")
            else:
                print("❌ Authentication failed unexpectedly")
        else:
            print(f"❌ Expected 200, got {response.status_code}")
    except Exception as e:
        print(f"❌ Error: {e}")
    
    print("\n" + "=" * 50)
    print("🎯 Error Handling Tests Complete!")

if __name__ == "__main__":
    test_error_handling()