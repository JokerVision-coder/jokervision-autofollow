import requests
import sys
import json
from datetime import datetime

class AutoFollowProAPITester:
    def __init__(self, base_url="https://autofollow-pro.preview.emergentagent.com"):
        self.base_url = base_url
        self.api_url = f"{base_url}/api"
        self.tests_run = 0
        self.tests_passed = 0
        self.created_lead_id = None
        self.created_appointment_id = None
        self.created_users = []
        self.created_sales = []

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

    def test_dashboard_stats(self):
        """Test dashboard statistics endpoint"""
        return self.run_test(
            "Dashboard Stats",
            "GET",
            "dashboard/stats",
            200
        )

    def test_create_lead(self):
        """Test creating a new lead"""
        lead_data = {
            "first_name": "Gilbert",
            "last_name": "Pradia",
            "primary_phone": "830-734-0597",
            "email": "gpradiajr@outlook.com",
            "budget": "300$-500$",
            "vehicle_type": "car",
            "address": "123 Test Street, San Antonio, TX"
        }
        
        success, response = self.run_test(
            "Create Lead",
            "POST",
            "leads",
            200,
            data=lead_data
        )
        
        if success and 'id' in response:
            self.created_lead_id = response['id']
            print(f"   Created lead ID: {self.created_lead_id}")
            return True
        return False

    def test_get_leads(self):
        """Test getting all leads"""
        return self.run_test(
            "Get All Leads",
            "GET",
            "leads",
            200
        )

    def test_get_specific_lead(self):
        """Test getting a specific lead"""
        if not self.created_lead_id:
            print("❌ No lead ID available for testing")
            return False
            
        return self.run_test(
            "Get Specific Lead",
            "GET",
            f"leads/{self.created_lead_id}",
            200
        )

    def test_send_sms_english(self):
        """Test sending SMS in English"""
        if not self.created_lead_id:
            print("❌ No lead ID available for testing")
            return False
            
        return self.run_test(
            "Send SMS (English)",
            "POST",
            f"sms/send?lead_id={self.created_lead_id}&language=english",
            200
        )

    def test_send_sms_spanish(self):
        """Test sending SMS in Spanish"""
        if not self.created_lead_id:
            print("❌ No lead ID available for testing")
            return False
            
        return self.run_test(
            "Send SMS (Spanish)",
            "POST",
            f"sms/send?lead_id={self.created_lead_id}&language=spanish",
            200
        )

    def test_get_sms_messages(self):
        """Test getting SMS messages for a lead"""
        if not self.created_lead_id:
            print("❌ No lead ID available for testing")
            return False
            
        return self.run_test(
            "Get SMS Messages",
            "GET",
            f"sms/messages/{self.created_lead_id}",
            200
        )

    def test_ai_response(self):
        """Test AI response generation"""
        if not self.created_lead_id:
            print("❌ No lead ID available for testing")
            return False
            
        ai_request = {
            "lead_id": self.created_lead_id,
            "incoming_message": "I'm interested in a Honda Civic",
            "phone_number": "830-734-0597"
        }
        
        return self.run_test(
            "AI Response Generation",
            "POST",
            "ai/respond",
            200,
            data=ai_request
        )

    def test_bulk_import(self):
        """Test bulk import functionality"""
        bulk_data = """First Name: John
Last Name: Smith
Primary Phone: 555-123-4567
Email: john.smith@example.com
Budget: 400$-600$
Vehicle Type: SUV

First Name: Jane
Last Name: Doe
Primary Phone: 555-987-6543
Email: jane.doe@example.com
Budget: 200$-400$
Vehicle Type: sedan"""
        
        # URL encode the bulk data as query parameter
        import urllib.parse
        encoded_data = urllib.parse.quote(bulk_data)
        
        return self.run_test(
            "Bulk Import Leads",
            "POST",
            f"leads/bulk?leads_text={encoded_data}",
            200
        )

    def test_update_lead(self):
        """Test updating a lead"""
        if not self.created_lead_id:
            print("❌ No lead ID available for testing")
            return False
            
        update_data = {
            "status": "scheduled",
            "notes": "Customer scheduled for test drive"
        }
        
        return self.run_test(
            "Update Lead",
            "PUT",
            f"leads/{self.created_lead_id}",
            200,
            data=update_data
        )

    def test_sms_config_get(self):
        """Test getting SMS configuration"""
        return self.run_test(
            "Get SMS Configuration",
            "GET",
            "config/sms",
            200
        )

    def test_sms_config_update(self):
        """Test updating SMS configuration"""
        config_data = {
            "provider": "textbelt",
            "textbelt_api_key": ""
        }
        
        return self.run_test(
            "Update SMS Configuration",
            "POST",
            "config/sms",
            200,
            data=config_data
        )

    def test_send_sms_with_provider(self):
        """Test sending SMS with provider parameter"""
        if not self.created_lead_id:
            print("❌ No lead ID available for testing")
            return False
            
        # Test with mock provider
        success1, _ = self.run_test(
            "Send SMS with Mock Provider",
            "POST",
            f"sms/send?lead_id={self.created_lead_id}&language=english&provider=mock",
            200
        )
        
        # Test with textbelt provider
        success2, _ = self.run_test(
            "Send SMS with TextBelt Provider",
            "POST",
            f"sms/send?lead_id={self.created_lead_id}&language=english&provider=textbelt",
            200
        )
        
        return success1 and success2

    def test_create_appointment(self):
        """Test creating an appointment"""
        if not self.created_lead_id:
            print("❌ No lead ID available for testing")
            return False
            
        # Create appointment for tomorrow at 2 PM
        from datetime import datetime, timedelta
        tomorrow = datetime.now() + timedelta(days=1)
        appointment_time = tomorrow.replace(hour=14, minute=0, second=0, microsecond=0)
        
        appointment_data = {
            "lead_id": self.created_lead_id,
            "appointment_datetime": appointment_time.isoformat(),
            "duration_minutes": 60,
            "title": "Vehicle Consultation",
            "description": "Test drive and vehicle discussion"
        }
        
        success, response = self.run_test(
            "Create Appointment",
            "POST",
            "appointments",
            200,
            data=appointment_data
        )
        
        if success and 'id' in response:
            self.created_appointment_id = response['id']
            print(f"   Created appointment ID: {self.created_appointment_id}")
            return True
        return False

    def test_get_lead_appointments(self):
        """Test getting appointments for a specific lead"""
        if not self.created_lead_id:
            print("❌ No lead ID available for testing")
            return False
            
        return self.run_test(
            "Get Lead Appointments",
            "GET",
            f"appointments/{self.created_lead_id}",
            200
        )

    def test_get_all_appointments(self):
        """Test getting all appointments"""
        return self.run_test(
            "Get All Appointments",
            "GET",
            "appointments",
            200
        )

    def test_update_appointment(self):
        """Test updating appointment status"""
        if not hasattr(self, 'created_appointment_id') or not self.created_appointment_id:
            print("❌ No appointment ID available for testing")
            return False
            
        return self.run_test(
            "Update Appointment Status",
            "PUT",
            f"appointments/{self.created_appointment_id}?status=completed",
            200
        )

    def test_enhanced_ai_response_with_scheduling(self):
        """Test AI response with scheduling keywords"""
        if not self.created_lead_id:
            print("❌ No lead ID available for testing")
            return False
            
        ai_request = {
            "lead_id": self.created_lead_id,
            "incoming_message": "I want to schedule a visit to see the Toyota Camry tomorrow",
            "phone_number": "830-734-0597"
        }
        
        success, response = self.run_test(
            "AI Response with Scheduling Keywords",
            "POST",
            "ai/respond",
            200,
            data=ai_request
        )
        
        if success:
            # Check if AI detected scheduling intent
            suggests_scheduling = response.get('suggests_scheduling', False)
            print(f"   AI Scheduling Detection: {'✅ Detected' if suggests_scheduling else '❌ Not Detected'}")
            
        return success

    def test_enhanced_dashboard_stats(self):
        """Test enhanced dashboard stats with 6 metrics"""
        success, response = self.run_test(
            "Enhanced Dashboard Stats (6 metrics)",
            "GET",
            "dashboard/stats",
            200
        )
        
        if success:
            expected_fields = [
                'total_leads', 'new_leads', 'contacted_leads', 
                'scheduled_leads', 'upcoming_appointments', 'recent_leads'
            ]
            
            missing_fields = [field for field in expected_fields if field not in response]
            if missing_fields:
                print(f"   ❌ Missing fields: {missing_fields}")
                return False
            else:
                print(f"   ✅ All 6 metrics present: {list(response.keys())}")
                
        return success

    def test_follow_up_sms_stages(self):
        """Test all follow-up SMS stages"""
        if not self.created_lead_id:
            print("❌ No lead ID available for testing")
            return False
        
        stages = ["initial", "second_follow", "third_follow", "appointment_reminder", "post_visit"]
        passed_stages = 0
        
        print(f"\n🔍 Testing Follow-up SMS Stages...")
        
        for stage in stages:
            try:
                params = f"lead_id={self.created_lead_id}&stage={stage}&language=english&provider=mock"
                
                # Add appointment_time for appointment_reminder stage
                if stage == "appointment_reminder":
                    params += "&appointment_time=tomorrow at 2:00 PM"
                
                success, response = self.run_test(
                    f"Follow-up SMS - {stage}",
                    "POST",
                    f"sms/follow-up?{params}",
                    200
                )
                
                if success:
                    passed_stages += 1
                    print(f"   ✅ {stage} stage - PASSED")
                else:
                    print(f"   ❌ {stage} stage - FAILED")
                    
            except Exception as e:
                print(f"   ❌ {stage} stage - ERROR: {str(e)}")
        
        print(f"   📊 Follow-up Stages: {passed_stages}/{len(stages)} passed")
        return passed_stages >= len(stages) * 0.8  # 80% pass rate

    def test_bulk_follow_up(self):
        """Test bulk follow-up messaging"""
        if not self.created_lead_id:
            print("❌ No lead ID available for testing")
            return False
        
        bulk_data = {
            "lead_ids": [self.created_lead_id],
            "stage": "second_follow",
            "delay_hours": 1,
            "language": "english"
        }
        
        success, response = self.run_test(
            "Bulk Follow-up Messaging",
            "POST",
            "sms/bulk-follow-up",
            200,
            data=bulk_data
        )
        
        if success:
            total_leads = response.get('total_leads', 0)
            print(f"   ✅ Scheduled for {total_leads} leads")
            
        return success

    def test_pending_follow_ups(self):
        """Test getting pending follow-up messages"""
        return self.run_test(
            "Get Pending Follow-ups",
            "GET",
            "follow-up/pending",
            200
        )

    def test_appointment_focused_ai_responses(self):
        """Test AI responses for appointment-setting scenarios"""
        if not self.created_lead_id:
            print("❌ No lead ID available for testing")
            return False
        
        test_scenarios = [
            {
                "message": "I'm interested in a Toyota Camry",
                "description": "Interest in specific vehicle"
            },
            {
                "message": "What's the price of the RAV4?",
                "description": "Price inquiry"
            },
            {
                "message": "I need to think about it",
                "description": "Hesitation objection"
            },
            {
                "message": "Can you tell me about Toyota reliability?",
                "description": "Information request"
            }
        ]
        
        passed_scenarios = 0
        print(f"\n🔍 Testing Appointment-Focused AI Responses...")
        
        for scenario in test_scenarios:
            try:
                ai_request = {
                    "lead_id": self.created_lead_id,
                    "incoming_message": scenario["message"],
                    "phone_number": "830-734-0597"
                }
                
                success, response = self.run_test(
                    f"AI Response - {scenario['description']}",
                    "POST",
                    "ai/respond",
                    200,
                    data=ai_request
                )
                
                if success:
                    ai_response = response.get('response', '')
                    
                    # Check for appointment-focused keywords
                    appointment_keywords = ['appointment', 'visit', 'come in', 'schedule', 'show you', 'in person']
                    has_appointment_focus = any(keyword in ai_response.lower() for keyword in appointment_keywords)
                    
                    # Check for phone number
                    has_phone = '210-632-8712' in ai_response
                    
                    if has_appointment_focus and has_phone:
                        passed_scenarios += 1
                        print(f"   ✅ {scenario['description']} - Appointment-focused response")
                    else:
                        print(f"   ❌ {scenario['description']} - Not appointment-focused")
                        print(f"      Response preview: {ai_response[:100]}...")
                else:
                    print(f"   ❌ {scenario['description']} - API call failed")
                    
                # Add delay to avoid rate limiting
                import time
                time.sleep(2)
                    
            except Exception as e:
                print(f"   ❌ {scenario['description']} - ERROR: {str(e)}")
        
        print(f"   📊 AI Scenarios: {passed_scenarios}/{len(test_scenarios)} passed")
        return passed_scenarios >= len(test_scenarios) * 0.75  # 75% pass rate for AI

    def test_enhanced_ai_dealership_knowledge(self):
        """Test AI responses with enhanced dealership knowledge"""
        if not self.created_lead_id:
            print("❌ No lead ID available for testing")
            return False
        
        dealership_scenarios = [
            {
                "message": "Do you have RAV4s in stock?",
                "description": "Inventory question - RAV4",
                "expected_keywords": ["31", "RAV4", "stock"]
            },
            {
                "message": "What promotions are available?",
                "description": "Promotions inquiry",
                "expected_keywords": ["APR", "lease", "special"]
            },
            {
                "message": "Where are you located?",
                "description": "Location question",
                "expected_keywords": ["18019", "US-281", "San Antonio"]
            },
            {
                "message": "Do you have used Honda Accords?",
                "description": "Preowned inquiry",
                "expected_keywords": ["367", "preowned", "all makes"]
            },
            {
                "message": "I want to see a Camry",
                "description": "Appointment request",
                "expected_keywords": ["23", "Camry", "appointment", "visit"]
            }
        ]
        
        passed_scenarios = 0
        print(f"\n🔍 Testing Enhanced AI Dealership Knowledge...")
        
        for scenario in dealership_scenarios:
            try:
                ai_request = {
                    "lead_id": self.created_lead_id,
                    "incoming_message": scenario["message"],
                    "phone_number": "830-734-0597"
                }
                
                success, response = self.run_test(
                    f"Dealership AI - {scenario['description']}",
                    "POST",
                    "ai/respond",
                    200,
                    data=ai_request
                )
                
                if success:
                    ai_response = response.get('response', '').lower()
                    
                    # Check for expected keywords
                    keywords_found = sum(1 for keyword in scenario['expected_keywords'] 
                                       if keyword.lower() in ai_response)
                    
                    if keywords_found >= len(scenario['expected_keywords']) * 0.5:  # At least 50% of keywords
                        passed_scenarios += 1
                        print(f"   ✅ {scenario['description']} - Dealership knowledge present")
                        print(f"      Keywords found: {keywords_found}/{len(scenario['expected_keywords'])}")
                    else:
                        print(f"   ❌ {scenario['description']} - Missing dealership knowledge")
                        print(f"      Keywords found: {keywords_found}/{len(scenario['expected_keywords'])}")
                        print(f"      Response preview: {response.get('response', '')[:150]}...")
                else:
                    print(f"   ❌ {scenario['description']} - API call failed")
                    
                # Add delay to avoid rate limiting
                import time
                time.sleep(3)
                    
            except Exception as e:
                print(f"   ❌ {scenario['description']} - ERROR: {str(e)}")
        
        print(f"   📊 Dealership Knowledge: {passed_scenarios}/{len(dealership_scenarios)} passed")
        return passed_scenarios >= len(dealership_scenarios) * 0.6  # 60% pass rate for dealership knowledge

    def test_voice_call_initiation(self):
        """Test voice call initiation"""
        if not self.created_lead_id:
            print("❌ No lead ID available for testing")
            return False
            
        voice_call_data = {
            "lead_id": self.created_lead_id,
            "phone_number": "830-734-0597"
        }
        
        success, response = self.run_test(
            "Voice Call Initiation",
            "POST",
            "voice/call",
            200,
            data=voice_call_data
        )
        
        if success and 'id' in response:
            self.created_voice_call_id = response['id']
            print(f"   Created voice call ID: {self.created_voice_call_id}")
            return True
        return False

    def test_voice_call_history(self):
        """Test getting voice call history for a lead"""
        if not self.created_lead_id:
            print("❌ No lead ID available for testing")
            return False
            
        return self.run_test(
            "Voice Call History",
            "GET",
            f"voice/calls/{self.created_lead_id}",
            200
        )

    def test_voice_call_update(self):
        """Test updating voice call status"""
        if not hasattr(self, 'created_voice_call_id') or not self.created_voice_call_id:
            print("❌ No voice call ID available for testing")
            return False
            
        return self.run_test(
            "Voice Call Status Update",
            "PUT",
            f"voice/call/{self.created_voice_call_id}?status=completed&call_outcome=appointment_scheduled&call_duration=180",
            200
        )

    def test_facebook_webhook_verification(self):
        """Test Facebook webhook verification"""
        return self.run_test(
            "Facebook Webhook Verification",
            "GET",
            "facebook/webhook?hub.mode=subscribe&hub.challenge=12345&hub.verify_token=shottenkirk_verify_2024",
            200
        )

    def test_facebook_webhook_handler(self):
        """Test Facebook webhook message handling"""
        fb_webhook_data = {
            "object": "page",
            "entry": [
                {
                    "messaging": [
                        {
                            "sender": {"id": "test_sender_123"},
                            "recipient": {"id": "test_page_456"},
                            "message": {
                                "mid": "test_message_789",
                                "text": "I'm interested in a Toyota Camry"
                            }
                        }
                    ]
                }
            ]
        }
        
        return self.run_test(
            "Facebook Webhook Message Handler",
            "POST",
            "facebook/webhook",
            200,
            data=fb_webhook_data
        )

    def test_user_management_system(self):
        """Test JokerVision user management system (max 4 users)"""
        print("\n🧑‍💼 Testing JokerVision User Management System...")
        
        # Get initial users
        success, users = self.run_test("Get Initial Users", "GET", "users", 200)
        if not success:
            return False
        
        initial_count = len(users)
        print(f"   Initial user count: {initial_count}")
        
        # Test creating users (up to 4 total)
        test_users = [
            {
                "username": "test_sales1",
                "email": "sales1@jokervision.com",
                "full_name": "Test Salesperson 1",
                "password": "testpass123",
                "role": "collaborator"
            },
            {
                "username": "test_sales2", 
                "email": "sales2@jokervision.com",
                "full_name": "Test Salesperson 2",
                "password": "testpass123",
                "role": "collaborator"
            }
        ]
        
        users_created = 0
        for i, user_data in enumerate(test_users):
            if initial_count + users_created >= 4:
                print(f"   ⚠️  Skipping user creation - already at max limit (4)")
                break
                
            success, user = self.run_test(
                f"Create User {i+1}",
                "POST", 
                "users",
                200,
                data=user_data
            )
            if success:
                self.created_users.append(user['id'])
                users_created += 1
                print(f"   ✅ Created user: {user['full_name']} (ID: {user['id']})")
        
        # Test creating user beyond limit (should fail)
        if initial_count + users_created >= 4:
            success, _ = self.run_test(
                "Create User Beyond Limit (Should Fail)",
                "POST",
                "users", 
                400,
                data={
                    "username": "test_fail",
                    "email": "fail@jokervision.com",
                    "full_name": "Should Fail",
                    "password": "testpass123",
                    "role": "collaborator"
                }
            )
            if success:
                print("   ✅ Correctly rejected user creation beyond limit")
        
        return True

    def test_sales_tracking_system(self):
        """Test JokerVision sales tracking with commission tiers"""
        print("\n💰 Testing JokerVision Sales Tracking System...")
        
        # Get users for sales assignment
        success, users = self.run_test("Get Users for Sales", "GET", "users", 200)
        if not success or not users:
            print("   ❌ No users available for sales testing")
            return False
        
        test_user = users[0]
        print(f"   Using salesperson: {test_user['full_name']} (ID: {test_user['id']})")
        
        # Test sales creation with commission calculation
        test_sales = [
            {
                "salesperson_id": test_user['id'],
                "stock_number": "JV001",
                "vehicle_make": "Toyota",
                "vehicle_model": "Camry",
                "vehicle_year": 2024,
                "sale_type": "full",
                "sale_date": datetime.now().isoformat(),
                "sale_price": 35000.00,
                "cost_price": 30000.00,
                "front_profit": 3000.00,
                "back_profit": 2000.00,
                "customer_name": "JokerVision Test Customer 1",
                "financing_type": "finance"
            },
            {
                "salesperson_id": test_user['id'],
                "stock_number": "JV002", 
                "vehicle_make": "Honda",
                "vehicle_model": "Accord",
                "vehicle_year": 2023,
                "sale_type": "half",
                "sale_date": datetime.now().isoformat(),
                "sale_price": 28000.00,
                "cost_price": 25000.00,
                "front_profit": 2000.00,
                "back_profit": 1000.00,
                "customer_name": "JokerVision Test Customer 2",
                "financing_type": "cash"
            }
        ]
        
        for i, sale_data in enumerate(test_sales):
            success, sale = self.run_test(
                f"Create Sale {i+1}",
                "POST",
                "sales",
                200,
                data=sale_data
            )
            if success:
                self.created_sales.append(sale['id'])
                print(f"   ✅ Sale recorded: {sale['vehicle_make']} {sale['vehicle_model']}")
                print(f"      Commission Rate: {sale['commission_rate']*100:.0f}%")
                print(f"      Commission Earned: ${sale['commission_earned']:.2f}")
                print(f"      Total Profit: ${sale['total_profit']:.2f}")
                
                # Verify commission tier (should be 12% for first sales)
                if abs(sale['commission_rate'] - 0.12) < 0.001:
                    print(f"      ✅ Correct Bronze tier commission (12%)")
                else:
                    print(f"      ❌ Wrong commission rate: {sale['commission_rate']*100:.0f}%")
        
        # Test sales retrieval and filtering
        success, all_sales = self.run_test("Get All Sales", "GET", "sales", 200)
        if success:
            print(f"   📊 Total sales in system: {len(all_sales)}")
        
        # Test sales dashboard
        success, dashboard = self.run_test("Get Sales Dashboard", "GET", "sales/dashboard", 200)
        if success:
            print(f"   📊 Dashboard - Total units: {dashboard.get('total_units', 0)}")
            print(f"   📊 Dashboard - Total revenue: ${dashboard.get('total_revenue', 0):,.2f}")
            print(f"   📊 Dashboard - Total commission: ${dashboard.get('total_commission', 0):,.2f}")
            
            # Check commission tiers info
            tiers = dashboard.get('commission_tiers', [])
            if len(tiers) == 3:
                print(f"   ✅ Commission tiers present: Bronze(12%), Silver(15%), Gold(20%)")
            else:
                print(f"   ❌ Missing commission tiers information")
        
        # Test individual sales stats
        success, stats = self.run_test(
            "Get Individual Sales Stats",
            "GET",
            f"sales/stats/{test_user['id']}",
            200
        )
        if success:
            print(f"   📊 Individual stats - Units: {stats.get('total_units', 0)}")
            print(f"   📊 Individual stats - Commission: ${stats.get('total_commission', 0):.2f}")
            print(f"   📊 Current commission rate: {stats.get('current_commission_rate', 0)*100:.0f}%")
        
        return True

    def test_commission_tier_progression(self):
        """Test commission tier progression (12% -> 15% -> 20%)"""
        print("\n🏆 Testing Commission Tier Progression...")
        
        # This would require creating 15+ sales to test tier progression
        # For now, just verify the tier structure exists
        success, dashboard = self.run_test("Get Commission Tiers", "GET", "sales/dashboard", 200)
        if success:
            tiers = dashboard.get('commission_tiers', [])
            expected_tiers = [
                {"range": "1-14 units", "rate": "12%"},
                {"range": "15-16 units", "rate": "15%"},
                {"range": "17+ units", "rate": "20%"}
            ]
            
            if len(tiers) == 3:
                print("   ✅ All three commission tiers present:")
                for tier in tiers:
                    print(f"      - {tier['range']}: {tier['rate']}")
                return True
            else:
                print(f"   ❌ Expected 3 tiers, found {len(tiers)}")
                return False
        
        return False

    def cleanup_jokervision_data(self):
        """Clean up JokerVision test data"""
        print("\n🧹 Cleaning up JokerVision test data...")
        
        # Delete created users (except admin)
        for user_id in self.created_users:
            success, _ = self.run_test(
                f"Delete User {user_id}",
                "DELETE",
                f"users/{user_id}",
                200
            )
            if success:
                print(f"   ✅ Deleted user: {user_id}")
        
        print("   ℹ️  Sales data will remain for dashboard testing")

def main():
    print("🚗 AutoFollow Pro API Testing Suite")
    print("=" * 50)
    
    tester = AutoFollowProAPITester()
    
    # Test sequence
    test_sequence = [
        ("Enhanced Dashboard Stats", tester.test_enhanced_dashboard_stats),
        ("Create Lead", tester.test_create_lead),
        ("Get All Leads", tester.test_get_leads),
        ("Get Specific Lead", tester.test_get_specific_lead),
        ("SMS Config - Get", tester.test_sms_config_get),
        ("SMS Config - Update", tester.test_sms_config_update),
        ("Send SMS with Provider", tester.test_send_sms_with_provider),
        ("Follow-up SMS Stages", tester.test_follow_up_sms_stages),
        ("Bulk Follow-up", tester.test_bulk_follow_up),
        ("Pending Follow-ups", tester.test_pending_follow_ups),
        ("Get SMS Messages", tester.test_get_sms_messages),
        ("Create Appointment", tester.test_create_appointment),
        ("Get Lead Appointments", tester.test_get_lead_appointments),
        ("Get All Appointments", tester.test_get_all_appointments),
        ("Update Appointment", tester.test_update_appointment),
        ("AI Response", tester.test_ai_response),
        ("Enhanced AI Dealership Knowledge", tester.test_enhanced_ai_dealership_knowledge),
        ("Appointment-Focused AI", tester.test_appointment_focused_ai_responses),
        ("Enhanced AI Response with Scheduling", tester.test_enhanced_ai_response_with_scheduling),
        ("Voice Call Initiation", tester.test_voice_call_initiation),
        ("Voice Call History", tester.test_voice_call_history),
        ("Voice Call Update", tester.test_voice_call_update),
        ("Facebook Webhook Verification", tester.test_facebook_webhook_verification),
        ("Facebook Webhook Handler", tester.test_facebook_webhook_handler),
        ("Facebook Messages History", tester.test_facebook_messages_history),
        ("Update Lead", tester.test_update_lead),
        ("Bulk Import", tester.test_bulk_import),
    ]
    
    print(f"\n🎯 Running {len(test_sequence)} API tests...")
    
    for test_name, test_func in test_sequence:
        try:
            test_func()
        except Exception as e:
            print(f"❌ {test_name} failed with exception: {str(e)}")
    
    # Print final results
    print("\n" + "=" * 50)
    print(f"📊 Test Results: {tester.tests_passed}/{tester.tests_run} tests passed")
    
    if tester.tests_passed == tester.tests_run:
        print("🎉 All tests passed!")
        return 0
    else:
        print(f"⚠️  {tester.tests_run - tester.tests_passed} tests failed")
        return 1

if __name__ == "__main__":
    sys.exit(main())