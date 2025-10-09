#!/usr/bin/env python3

import requests
import json
import sys

def test_chrome_extension_endpoints():
    """Test Chrome extension endpoints specifically"""
    base_url = "https://dealergenius.preview.emergentagent.com/api"
    
    print("🔧 Testing Chrome Extension API Endpoints")
    print("=" * 50)
    
    # Test 1: Health Check
    print("\n1. Testing Health Check...")
    try:
        response = requests.get(f"{base_url}/health")
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Health Check: {data['status']} at {data['timestamp']}")
        else:
            print(f"❌ Health Check failed: {response.status_code}")
    except Exception as e:
        print(f"❌ Health Check error: {e}")
    
    # Test 2: Extension Authentication
    print("\n2. Testing Extension Authentication...")
    try:
        auth_data = {"email": "test@jokervision.com", "password": "testpass123"}
        response = requests.post(f"{base_url}/auth/extension-login", json=auth_data)
        if response.status_code == 200:
            data = response.json()
            tenant_id = data.get('tenant_id')
            print(f"✅ Authentication successful: {data['user']['email']}")
            print(f"   Tenant ID: {tenant_id}")
        else:
            print(f"❌ Authentication failed: {response.status_code}")
            tenant_id = "demo_tenant_123"
    except Exception as e:
        print(f"❌ Authentication error: {e}")
        tenant_id = "demo_tenant_123"
    
    # Test 3: Inventory Sync
    print("\n3. Testing Inventory Sync...")
    try:
        sync_data = {"tenant_id": tenant_id, "source": "facebook_marketplace"}
        response = requests.post(f"{base_url}/inventory/sync", json=sync_data)
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Inventory Sync: {data['vehicles_processed']} vehicles processed")
        else:
            print(f"❌ Inventory Sync failed: {response.status_code}")
    except Exception as e:
        print(f"❌ Inventory Sync error: {e}")
    
    # Test 4: Inventory Summary
    print("\n4. Testing Inventory Summary...")
    try:
        response = requests.get(f"{base_url}/inventory/summary?tenant_id={tenant_id}")
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Inventory Summary: {data['total_vehicles']} total vehicles")
            print(f"   Recent vehicles: {len(data.get('recent_vehicles', []))}")
        else:
            print(f"❌ Inventory Summary failed: {response.status_code}")
    except Exception as e:
        print(f"❌ Inventory Summary error: {e}")
    
    # Test 5: SEO Description Generation
    print("\n5. Testing SEO Description Generation...")
    try:
        seo_data = {
            "tenant_id": tenant_id,
            "vehicle_data": {
                "year": 2023,
                "make": "Toyota",
                "model": "Camry",
                "price": 28999.99,
                "mileage": 15000,
                "features": ["Bluetooth", "Backup Camera", "Heated Seats"]
            },
            "current_description": "2023 Toyota Camry for sale"
        }
        response = requests.post(f"{base_url}/ai/generate-seo-description", json=seo_data)
        if response.status_code == 200:
            data = response.json()
            if data.get('success'):
                description = data.get('optimized_description', '')
                print(f"✅ SEO Description Generated ({data.get('character_count', 0)} chars)")
                print(f"   Preview: {description[:100]}...")
            else:
                print(f"❌ SEO Generation failed: {data}")
        else:
            print(f"❌ SEO Description failed: {response.status_code}")
            try:
                error_data = response.json()
                print(f"   Error: {error_data}")
            except:
                print(f"   Error: {response.text}")
    except Exception as e:
        print(f"❌ SEO Description error: {e}")
    
    # Test 6: Price Optimization
    print("\n6. Testing Price Optimization...")
    try:
        price_data = {
            "tenant_id": tenant_id,
            "vehicle_data": {
                "year": 2022,
                "make": "Honda",
                "model": "Accord",
                "price": 31500.00,
                "mileage": 25000
            },
            "current_price": 31500.00
        }
        response = requests.post(f"{base_url}/ai/optimize-price", json=price_data)
        if response.status_code == 200:
            data = response.json()
            if data.get('success'):
                current = data.get('current_price', 0)
                recommended = data.get('recommended_price', 0)
                confidence = data.get('confidence_level', 0)
                print(f"✅ Price Optimization: ${current:,.2f} → ${recommended:,.2f}")
                print(f"   Confidence: {confidence}%")
            else:
                print(f"❌ Price Optimization failed: {data}")
        else:
            print(f"❌ Price Optimization failed: {response.status_code}")
    except Exception as e:
        print(f"❌ Price Optimization error: {e}")
    
    # Test 7: Analytics Tracking
    print("\n7. Testing Analytics Tracking...")
    try:
        analytics_data = {
            "tenant_id": tenant_id,
            "event": "listing_viewed",
            "data": {"vehicle_id": "test_123"},
            "url": "https://facebook.com/marketplace"
        }
        response = requests.post(f"{base_url}/analytics/track-interaction", json=analytics_data)
        if response.status_code == 200:
            data = response.json()
            if data.get('success'):
                print(f"✅ Analytics Tracking: {data.get('message')}")
            else:
                print(f"❌ Analytics Tracking failed: {data}")
        else:
            print(f"❌ Analytics Tracking failed: {response.status_code}")
    except Exception as e:
        print(f"❌ Analytics Tracking error: {e}")
    
    # Test 8: Marketplace Performance
    print("\n8. Testing Marketplace Performance...")
    try:
        response = requests.get(f"{base_url}/analytics/marketplace-performance?tenant_id={tenant_id}")
        if response.status_code == 200:
            data = response.json()
            listings = data.get('listings_count', 0)
            views = data.get('total_views', 0)
            inquiries = data.get('inquiries', 0)
            conversion = data.get('conversion_rate', 0)
            print(f"✅ Marketplace Performance: {listings} listings, {views} views")
            print(f"   Inquiries: {inquiries}, Conversion: {conversion}%")
        else:
            print(f"❌ Marketplace Performance failed: {response.status_code}")
    except Exception as e:
        print(f"❌ Marketplace Performance error: {e}")
    
    print("\n" + "=" * 50)
    print("🎯 Chrome Extension API Testing Complete!")

if __name__ == "__main__":
    test_chrome_extension_endpoints()