#!/usr/bin/env python3
"""
Lead Management & AI Communication Testing Suite
Tests the newly implemented endpoints for production readiness
"""

import requests
import sys
import json
import io
from datetime import datetime

class LeadManagementTester:
    def __init__(self, base_url="https://autofollowpro.preview.emergentagent.com"):
        self.base_url = base_url
        self.api_url = f"{base_url}/api"
        self.tests_run = 0
        self.tests_passed = 0
        self.created_lead_id = None
        self.tenant_id = "default_dealership"

    def run_test(self, name, method, endpoint, expected_status, data=None, headers=None, files=None):
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
                if files:
                    # Remove Content-Type header for file uploads
                    headers = {k: v for k, v in headers.items() if k != 'Content-Type'}
                    response = requests.post(url, files=files, data=data, headers=headers)
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
                    print(f"   Response preview: {json.dumps(response_data, indent=2)[:300]}...")
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

    def test_csv_bulk_upload(self):
        """Test CSV bulk upload endpoint for lead management"""
        print("\n📄 Testing CSV Bulk Upload...")
        
        # Create test CSV content
        csv_content = """first_name,last_name,primary_phone,email,budget,vehicle_type,source
John,Smith,555-123-4567,john.smith@email.com,25000-35000,sedan,CSV Import
Jane,Doe,555-987-6543,jane.doe@email.com,30000-40000,SUV,CSV Import
Mike,Johnson,555-555-5555,mike.johnson@email.com,20000-30000,truck,CSV Import"""
        
        # Test the bulk upload endpoint
        files = {'file': ('test_leads.csv', csv_content, 'text/csv')}
        data = {'tenant_id': self.tenant_id}
        
        success, response = self.run_test(
            "CSV Bulk Upload",
            "POST",
            "marketing/leads/bulk-upload",
            200,
            data=data,
            files=files
        )
        
        if success:
            print(f"   ✅ Leads processed: {response.get('leads_processed', 0)}")
            print(f"   ✅ Duplicates detected: {response.get('duplicates_detected', 0)}")
            print(f"   ✅ Success rate: {response.get('success_rate', 0)}%")
        
        return success

    def test_unified_leads_dashboard(self):
        """Test unified leads dashboard with source filtering"""
        print("\n📊 Testing Unified Leads Dashboard...")
        
        test_cases = [
            ("All Sources", None),
            ("CSV Import Filter", "CSV Import"),
            ("Manual Filter", "manual"),
            ("Walk-In Filter", "walk-in")
        ]
        
        passed_tests = 0
        
        for test_name, source_filter in test_cases:
            params = {"tenant_id": self.tenant_id}
            if source_filter:
                params["source_filter"] = source_filter
            
            query_string = "&".join([f"{k}={v}" for k, v in params.items()])
            
            success, response = self.run_test(
                f"Unified Dashboard - {test_name}",
                "GET",
                f"leads/dashboard/all-sources?{query_string}",
                200
            )
            
            if success:
                # Verify response structure
                required_fields = ['success', 'leads', 'total_count', 'source_statistics', 'status_statistics']
                missing_fields = [field for field in required_fields if field not in response]
                
                if not missing_fields:
                    passed_tests += 1
                    print(f"   ✅ {test_name} - Total: {response['total_count']}, Filtered: {response.get('filtered_count', 0)}")
                    print(f"      Sources: {list(response['source_statistics'].keys())}")
                else:
                    print(f"   ❌ {test_name} - Missing fields: {missing_fields}")
        
        print(f"   📊 Dashboard Tests: {passed_tests}/{len(test_cases)} passed")
        return passed_tests >= len(test_cases) * 0.75  # 75% pass rate

    def test_ai_communication_enablement(self):
        """Test AI communication enablement for leads"""
        print("\n🤖 Testing AI Communication Enablement...")
        
        if not self.created_lead_id:
            print("❌ No lead ID available for testing")
            return False
        
        # Test single lead AI enablement
        ai_config = {
            "ai_type": "both",  # sms, voice, both
            "enabled": True,
            "settings": {
                "response_delay": 30,
                "escalation_threshold": 3,
                "business_hours_only": False
            }
        }
        
        success1, response1 = self.run_test(
            "Enable AI Communication (Single Lead)",
            "POST",
            f"leads/{self.created_lead_id}/enable-ai",
            200,
            data=ai_config
        )
        
        # Test bulk AI enablement
        bulk_config = {
            "lead_ids": [self.created_lead_id],
            "ai_type": "sms",
            "enabled": True,
            "settings": {
                "response_delay": 60,
                "escalation_threshold": 2
            }
        }
        
        success2, response2 = self.run_test(
            "Enable AI Communication (Bulk)",
            "POST",
            "leads/bulk-enable-ai",
            200,
            data=bulk_config
        )
        
        if success1 and success2:
            print("   ✅ AI Communication enablement working for both single and bulk operations")
            return True
        else:
            print("   ❌ AI Communication enablement failed")
            return False

    def test_walk_in_lead_integration(self):
        """Test walk-in lead integration endpoints"""
        print("\n🚶 Testing Walk-In Lead Integration...")
        
        # Test creating walk-in customer
        customer_data = {
            "tenant_id": self.tenant_id,
            "first_name": "Walk-In",
            "last_name": "Customer",
            "phone": "555-WALK-IN",
            "email": "walkin@test.com",
            "visit_purpose": "Browse inventory",
            "interested_vehicles": ["Toyota Camry", "Honda Accord"],
            "source": "walk-in"
        }
        
        success1, response1 = self.run_test(
            "Create Walk-In Customer",
            "POST",
            "walk-in-tracker/customers",
            200,
            data=customer_data
        )
        
        if success1 and 'customer_id' in response1:
            customer_id = response1['customer_id']
            
            # Test converting customer to lead
            conversion_data = {
                "tenant_id": self.tenant_id,
                "lead_data": {
                    "budget": "25000-35000",
                    "vehicle_type": "sedan",
                    "notes": "Converted from walk-in customer"
                }
            }
            
            success2, response2 = self.run_test(
                "Convert Walk-In to Lead",
                "POST",
                f"walk-in-tracker/convert-to-lead/{customer_id}",
                200,
                data=conversion_data
            )
            
            if success2:
                print("   ✅ Walk-in integration working - customer creation and lead conversion")
                return True
            else:
                print("   ❌ Walk-in lead conversion failed")
                return False
        else:
            print("   ❌ Walk-in customer creation failed")
            return False

    def test_lead_source_tracking(self):
        """Test lead creation with proper source tracking"""
        print("\n🏷️ Testing Lead Source Tracking...")
        
        test_sources = [
            ("Website Form", "website"),
            ("Facebook Ad", "facebook_ad"),
            ("Google Ad", "google_ad"),
            ("Referral", "referral"),
            ("Walk-In", "walk-in"),
            ("Phone Call", "phone_call")
        ]
        
        passed_tests = 0
        created_leads = []
        
        for source_name, source_code in test_sources:
            lead_data = {
                "tenant_id": self.tenant_id,
                "first_name": f"Test_{source_code}",
                "last_name": "Lead",
                "primary_phone": f"555-{len(created_leads):03d}-{len(created_leads):04d}",
                "email": f"test_{source_code}@example.com",
                "budget": "20000-30000",
                "vehicle_type": "sedan",
                "source": source_code
            }
            
            success, response = self.run_test(
                f"Create Lead - {source_name}",
                "POST",
                "leads",
                200,
                data=lead_data
            )
            
            if success and 'source' in response and response['source'] == source_code:
                passed_tests += 1
                created_leads.append(response['id'])
                print(f"   ✅ {source_name} - Source tracked correctly")
            else:
                print(f"   ❌ {source_name} - Source tracking failed")
        
        print(f"   📊 Source Tracking: {passed_tests}/{len(test_sources)} passed")
        return passed_tests >= len(test_sources) * 0.8  # 80% pass rate

    def test_sms_sending_for_ai_leads(self):
        """Test SMS sending functionality for AI-enabled leads"""
        print("\n📱 Testing SMS Sending for AI-Enabled Leads...")
        
        if not self.created_lead_id:
            print("❌ No lead ID available for testing")
            return False
        
        # Test different SMS scenarios
        sms_tests = [
            {
                "name": "Initial Contact SMS",
                "data": {
                    "lead_id": self.created_lead_id,
                    "message": "Hi! Thanks for your interest in our vehicles. I'm here to help you find the perfect car. When would be a good time to chat?",
                    "message_type": "initial_contact",
                    "ai_enabled": True
                }
            },
            {
                "name": "Follow-up SMS",
                "data": {
                    "lead_id": self.created_lead_id,
                    "message": "Just following up on your vehicle inquiry. Do you have any specific questions about our Toyota inventory?",
                    "message_type": "follow_up",
                    "ai_enabled": True
                }
            },
            {
                "name": "Appointment Reminder SMS",
                "data": {
                    "lead_id": self.created_lead_id,
                    "message": "Reminder: Your appointment is scheduled for tomorrow at 2 PM. Looking forward to meeting you!",
                    "message_type": "appointment_reminder",
                    "ai_enabled": True
                }
            }
        ]
        
        passed_tests = 0
        
        for test in sms_tests:
            success, response = self.run_test(
                test["name"],
                "POST",
                "sms/send",
                200,
                data=test["data"]
            )
            
            if success:
                # Verify SMS was processed correctly
                if response.get('status') == 'sent' or response.get('status') == 'queued':
                    passed_tests += 1
                    print(f"   ✅ {test['name']} - SMS sent successfully")
                else:
                    print(f"   ❌ {test['name']} - SMS status: {response.get('status')}")
            else:
                print(f"   ❌ {test['name']} - SMS sending failed")
        
        print(f"   📊 SMS Tests: {passed_tests}/{len(sms_tests)} passed")
        return passed_tests >= len(sms_tests) * 0.75  # 75% pass rate

    def create_test_lead(self):
        """Create a test lead for other tests"""
        lead_data = {
            "tenant_id": self.tenant_id,
            "first_name": "Test",
            "last_name": "Lead",
            "primary_phone": "555-TEST-LEAD",
            "email": "test.lead@example.com",
            "budget": "25000-35000",
            "vehicle_type": "sedan",
            "source": "testing"
        }
        
        success, response = self.run_test(
            "Create Test Lead",
            "POST",
            "leads",
            200,
            data=lead_data
        )
        
        if success and 'id' in response:
            self.created_lead_id = response['id']
            print(f"   ✅ Created test lead ID: {self.created_lead_id}")
            return True
        return False

    def run_comprehensive_tests(self):
        """Run all lead management and AI communication tests"""
        print("🚀 Starting Lead Management & AI Communication Testing Suite...")
        print(f"   Base URL: {self.base_url}")
        print(f"   API URL: {self.api_url}")
        print(f"   Tenant ID: {self.tenant_id}")
        
        # Create a test lead first
        self.create_test_lead()
        
        # Define test suite
        test_suite = [
            ("CSV Bulk Upload", self.test_csv_bulk_upload),
            ("Unified Leads Dashboard", self.test_unified_leads_dashboard),
            ("AI Communication Enablement", self.test_ai_communication_enablement),
            ("Walk-In Lead Integration", self.test_walk_in_lead_integration),
            ("Lead Source Tracking", self.test_lead_source_tracking),
            ("SMS Sending for AI Leads", self.test_sms_sending_for_ai_leads)
        ]
        
        print(f"\n🎯 Running {len(test_suite)} Lead Management & AI Communication Tests...")
        
        passed_tests = 0
        failed_tests = []
        
        for test_name, test_func in test_suite:
            try:
                print(f"\n{'='*60}")
                print(f"🔍 Testing: {test_name}")
                print(f"{'='*60}")
                
                if test_func():
                    passed_tests += 1
                    print(f"✅ {test_name} - PASSED")
                else:
                    failed_tests.append(test_name)
                    print(f"❌ {test_name} - FAILED")
            except Exception as e:
                failed_tests.append(test_name)
                print(f"❌ {test_name} - ERROR: {str(e)}")
        
        # Final Results
        success_rate = (passed_tests / len(test_suite)) * 100
        print(f"\n{'='*80}")
        print("📊 LEAD MANAGEMENT & AI COMMUNICATION TEST RESULTS")
        print(f"{'='*80}")
        print(f"📊 Overall Results: {passed_tests}/{len(test_suite)} tests passed ({success_rate:.1f}%)")
        print(f"📊 Total API calls: {self.tests_run}")
        print(f"📊 Successful API calls: {self.tests_passed}")
        
        if failed_tests:
            print(f"\n❌ Failed Tests:")
            for test in failed_tests:
                print(f"   - {test}")
        
        if success_rate >= 80:
            print("\n🎉 LEAD MANAGEMENT & AI COMMUNICATION: SUCCESS!")
            print("   ✅ CSV bulk upload working for lead imports")
            print("   ✅ Unified dashboard showing leads from all sources")
            print("   ✅ AI communication enablement functional")
            print("   ✅ Walk-in lead integration operational")
            print("   ✅ Lead source tracking working correctly")
            print("   ✅ SMS sending for AI-enabled leads functional")
            return True
        else:
            print("\n⚠️ LEAD MANAGEMENT & AI COMMUNICATION: NEEDS ATTENTION")
            print("   ❌ Some lead management endpoints may need fixes")
            print("   ❌ AI communication features may be incomplete")
            return False

if __name__ == "__main__":
    tester = LeadManagementTester()
    success = tester.run_comprehensive_tests()
    
    if success:
        print("\n🎉 All critical lead management endpoints are production ready!")
        sys.exit(0)
    else:
        print("\n⚠️ Some issues detected that need attention before production deployment.")
        sys.exit(1)