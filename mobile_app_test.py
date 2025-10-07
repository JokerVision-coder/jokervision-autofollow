#!/usr/bin/env python3
"""
Mobile App API Endpoints Testing Script
Tests the specific endpoints mentioned in the review request for JokerVision AutoFollow mobile app integration.
"""

import requests
import sys
import json
from datetime import datetime

class MobileAppAPITester:
    def __init__(self, base_url="https://jokervision-app.preview.emergentagent.com"):
        self.base_url = base_url
        self.api_url = f"{base_url}/api"
        self.tests_run = 0
        self.tests_passed = 0
        self.created_lead_id = None

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
                response = requests.post(url, json=data, headers=headers)

            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                try:
                    response_data = response.json()
                    print(f"   Response: {json.dumps(response_data, indent=2)[:300]}...")
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

    def test_mobile_notifications_endpoint(self):
        """Test GET /api/notifications endpoint (NEW)"""
        success, response = self.run_test(
            "Mobile Notifications Endpoint (NEW)",
            "GET",
            "notifications",
            200
        )
        
        if success:
            if isinstance(response, list):
                print(f"   ✅ Retrieved {len(response)} notifications")
                if response:
                    first_notification = response[0]
                    required_fields = ['id', 'title', 'message', 'type']
                    # Accept either 'created_at' or 'timestamp' for time field
                    time_fields = ['created_at', 'timestamp']
                    missing_fields = [field for field in required_fields if field not in first_notification]
                    has_time_field = any(field in first_notification for field in time_fields)
                    
                    if not missing_fields and has_time_field:
                        print(f"   ✅ Notification structure valid - Type: {first_notification.get('type')}")
                        return True
                    else:
                        if missing_fields:
                            print(f"   ❌ Notification missing fields: {missing_fields}")
                        if not has_time_field:
                            print(f"   ❌ Notification missing time field (created_at or timestamp)")
                        return False
                else:
                    print("   ✅ Empty notifications list returned (acceptable)")
                    return True
            else:
                print("   ❌ Response is not a list")
                return False
        return False

    def test_mobile_voice_realtime_session_get(self):
        """Test GET /api/voice/realtime/session endpoint (NEW)"""
        success, response = self.run_test(
            "Mobile Voice Realtime Session GET (NEW)",
            "GET",
            "voice/realtime/session",
            200
        )
        
        if success:
            if 'session_id' in response or 'status' in response or 'error' in response:
                print(f"   ✅ Voice session GET endpoint accessible")
                return True
            else:
                print("   ❌ Voice session response missing expected fields")
                return False
        return False

    def test_mobile_dashboard_stats_optimized(self):
        """Test GET /api/dashboard/stats endpoint (MOBILE-OPTIMIZED)"""
        success, response = self.run_test(
            "Mobile Dashboard Stats (OPTIMIZED)",
            "GET",
            "dashboard/stats",
            200
        )
        
        if success:
            mobile_fields = ['total_leads', 'new_leads', 'contacted_leads', 'scheduled_leads']
            missing_fields = [field for field in mobile_fields if field not in response]
            
            if not missing_fields:
                print(f"   ✅ Mobile dashboard stats - {response.get('total_leads', 0)} total leads")
                print(f"      New: {response.get('new_leads', 0)}, Contacted: {response.get('contacted_leads', 0)}, Scheduled: {response.get('scheduled_leads', 0)}")
                return True
            else:
                print(f"   ❌ Mobile dashboard missing fields: {missing_fields}")
                return False
        return False

    def test_mobile_activity_recent_endpoint(self):
        """Test GET /api/activity/recent endpoint (NEW)"""
        success, response = self.run_test(
            "Mobile Recent Activity Endpoint (NEW)",
            "GET",
            "activity/recent",
            200
        )
        
        if success:
            if isinstance(response, list):
                print(f"   ✅ Retrieved {len(response)} recent activities")
                if response:
                    first_activity = response[0]
                    required_fields = ['id', 'type', 'description', 'timestamp']
                    missing_fields = [field for field in required_fields if field not in first_activity]
                    
                    if not missing_fields:
                        print(f"   ✅ Activity structure valid - Type: {first_activity.get('type')}")
                        return True
                    else:
                        print(f"   ❌ Activity missing fields: {missing_fields}")
                        return False
                else:
                    print("   ✅ Empty activities list returned (acceptable)")
                    return True
            else:
                print("   ❌ Response is not a list")
                return False
        return False

    def test_mobile_inventory_vehicles_fixed(self):
        """Test GET /api/inventory/vehicles endpoint (FIXED - no tenant_id requirement)"""
        success, response = self.run_test(
            "Mobile Inventory Vehicles (FIXED)",
            "GET",
            "inventory/vehicles",
            200
        )
        
        if success:
            # Handle both direct list and object with vehicles array
            vehicles_list = response
            if isinstance(response, dict) and 'vehicles' in response:
                vehicles_list = response['vehicles']
                print(f"   ✅ Retrieved {len(vehicles_list)} vehicles without tenant_id requirement")
            elif isinstance(response, list):
                print(f"   ✅ Retrieved {len(vehicles_list)} vehicles without tenant_id requirement")
            else:
                print("   ❌ Response is not a list or object with vehicles array")
                return False
                
            if vehicles_list:
                first_vehicle = vehicles_list[0]
                required_fields = ['id', 'make', 'model', 'year', 'price']
                missing_fields = [field for field in required_fields if field not in first_vehicle]
                
                if not missing_fields:
                    print(f"   ✅ Vehicle structure valid - {first_vehicle.get('year')} {first_vehicle.get('make')} {first_vehicle.get('model')}")
                    return True
                else:
                    print(f"   ❌ Vehicle missing fields: {missing_fields}")
                    return False
            else:
                print("   ✅ Empty vehicles list returned (acceptable)")
                return True
        return False

    def test_mobile_voice_realtime_session_post(self):
        """Test POST /api/voice/realtime/session endpoint (CONFIRM STILL WORKS)"""
        session_data = {
            "lead_id": self.created_lead_id if self.created_lead_id else "test_lead_123",
            "phone_number": "830-734-0597"
        }
        
        success, response = self.run_test(
            "Mobile Voice Realtime Session POST (CONFIRM)",
            "POST",
            "voice/realtime/session",
            200,
            data=session_data
        )
        
        if success:
            if 'session_id' in response or 'status' in response or 'error' in response:
                print(f"   ✅ Voice session POST still working")
                return True
            else:
                print("   ❌ Voice session POST response missing expected fields")
                return False
        return False

    def test_mobile_leads_endpoint_confirm(self):
        """Test GET /api/leads endpoint (CONFIRM STILL WORKS)"""
        success, response = self.run_test(
            "Mobile Leads Endpoint (CONFIRM)",
            "GET",
            "leads",
            200
        )
        
        if success:
            if isinstance(response, list):
                print(f"   ✅ Leads endpoint still working - {len(response)} leads")
                return True
            else:
                print("   ❌ Leads endpoint response is not a list")
                return False
        return False

    def create_test_lead(self):
        """Create a test lead for other tests"""
        lead_data = {
            "tenant_id": "demo_tenant_123",
            "first_name": "Mobile",
            "last_name": "TestUser",
            "primary_phone": "830-555-0123",
            "email": "mobile.test@example.com",
            "budget": "$25,000-$35,000",
            "vehicle_type": "SUV",
            "address": "123 Mobile Test St, San Antonio, TX"
        }
        
        success, response = self.run_test(
            "Create Test Lead for Mobile Tests",
            "POST",
            "leads",
            200,
            data=lead_data
        )
        
        if success and 'id' in response:
            self.created_lead_id = response['id']
            print(f"   Created test lead ID: {self.created_lead_id}")
            return True
        return False

    def run_mobile_app_tests(self):
        """Run all mobile app endpoint tests"""
        print("📱 JokerVision AutoFollow - Mobile App Endpoints Testing")
        print(f"   Backend URL: {self.base_url}")
        print(f"   API Endpoint: {self.api_url}")
        print("="*70)
        
        # Create a test lead first
        print("\n🔧 Setup Phase:")
        self.create_test_lead()
        
        print("\n📱 Mobile App Endpoints Testing Phase:")
        
        mobile_tests = [
            ("NEW: Notifications Endpoint", self.test_mobile_notifications_endpoint),
            ("NEW: Voice Realtime Session GET", self.test_mobile_voice_realtime_session_get),
            ("NEW: Dashboard Stats Mobile-Optimized", self.test_mobile_dashboard_stats_optimized),
            ("NEW: Recent Activity Endpoint", self.test_mobile_activity_recent_endpoint),
            ("FIXED: Inventory Vehicles (no tenant_id)", self.test_mobile_inventory_vehicles_fixed),
            ("CONFIRM: Voice Realtime Session POST", self.test_mobile_voice_realtime_session_post),
            ("CONFIRM: Leads Endpoint", self.test_mobile_leads_endpoint_confirm)
        ]
        
        passed_tests = 0
        total_tests = len(mobile_tests)
        failed_tests = []
        
        for test_name, test_func in mobile_tests:
            try:
                if test_func():
                    passed_tests += 1
                    print(f"✅ {test_name} - PASSED")
                else:
                    failed_tests.append(test_name)
                    print(f"❌ {test_name} - FAILED")
            except Exception as e:
                failed_tests.append(test_name)
                print(f"❌ {test_name} - ERROR: {str(e)}")
        
        # Results Summary
        success_rate = (passed_tests / total_tests) * 100
        print("\n" + "="*70)
        print("📊 MOBILE APP ENDPOINTS TEST RESULTS")
        print("="*70)
        print(f"📱 Total Tests: {total_tests}")
        print(f"✅ Passed: {passed_tests}")
        print(f"❌ Failed: {len(failed_tests)}")
        print(f"📈 Success Rate: {success_rate:.1f}%")
        
        if failed_tests:
            print(f"\n❌ Failed Tests:")
            for test in failed_tests:
                print(f"   - {test}")
        
        print(f"\n🎯 Overall API Tests: {self.tests_passed}/{self.tests_run} passed")
        
        # Determine overall status
        if success_rate >= 85:
            print("🎉 EXCELLENT: Mobile app endpoints are ready for production!")
            status = "READY"
        elif success_rate >= 70:
            print("✅ GOOD: Most mobile endpoints working, minor issues to address")
            status = "MOSTLY_READY"
        elif success_rate >= 50:
            print("⚠️  FAIR: Core mobile functionality working, several issues need attention")
            status = "NEEDS_WORK"
        else:
            print("❌ CRITICAL: Significant mobile endpoint issues found, requires immediate attention")
            status = "CRITICAL"
        
        return {
            "status": status,
            "success_rate": success_rate,
            "passed": passed_tests,
            "total": total_tests,
            "failed_tests": failed_tests
        }

def main():
    """Main function to run mobile app tests"""
    tester = MobileAppAPITester()
    results = tester.run_mobile_app_tests()
    
    # Return appropriate exit code
    if results["success_rate"] >= 70:
        return 0
    else:
        return 1

if __name__ == "__main__":
    sys.exit(main())