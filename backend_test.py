import requests
import sys
import json
from datetime import datetime

class AutoFollowProAPITester:
    def __init__(self, base_url="https://dealerflow-suite.preview.emergentagent.com"):
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
            "tenant_id": "demo_tenant_123",
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
            "incoming_message": "I'm interested in scheduling an appointment to see a Toyota Camry",
            "phone_number": "830-734-0597"
        }
        
        success, response = self.run_test(
            "AI Response Generation",
            "POST",
            "ai/respond",
            200,
            data=ai_request
        )
        
        if success:
            # Check if AI response contains appointment-focused content
            ai_response = response.get('response', '')
            has_appointment_keywords = any(keyword in ai_response.lower() for keyword in ['appointment', 'visit', 'schedule', 'come in'])
            has_phone_number = '210-632-8712' in ai_response
            
            print(f"   AI Response Quality Check:")
            print(f"   - Contains appointment keywords: {'✅' if has_appointment_keywords else '❌'}")
            print(f"   - Contains contact phone: {'✅' if has_phone_number else '❌'}")
            print(f"   - Response preview: {ai_response[:150]}...")
            
        return success

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

    def test_facebook_messages_history(self):
        """Test getting Facebook messages for a lead"""
        if not self.created_lead_id:
            print("❌ No lead ID available for testing")
            return False
            
        return self.run_test(
            "Facebook Messages History",
            "GET",
            f"facebook/messages/{self.created_lead_id}",
            200
        )

    # Mass Marketing API Tests
    def test_get_marketing_campaigns(self):
        """Test GET /api/marketing/campaigns endpoint"""
        tenant_id = "default_dealership"
        
        success, response = self.run_test(
            "Get Marketing Campaigns",
            "GET",
            f"marketing/campaigns?tenant_id={tenant_id}",
            200
        )
        
        if success:
            # Verify response structure
            if 'campaigns' in response:
                campaigns = response['campaigns']
                print(f"   ✅ Retrieved {len(campaigns)} campaigns")
                
                # Check if mock data is returned
                if campaigns:
                    first_campaign = campaigns[0]
                    required_fields = ['id', 'name', 'type', 'content', 'audience_segment', 'recipients', 'status']
                    missing_fields = [field for field in required_fields if field not in first_campaign]
                    
                    if not missing_fields:
                        print(f"   ✅ Campaign structure valid - Type: {first_campaign['type']}, Recipients: {first_campaign['recipients']}")
                        return True
                    else:
                        print(f"   ❌ Campaign missing fields: {missing_fields}")
                        return False
                else:
                    print("   ✅ Empty campaigns list returned")
                    return True
            else:
                print("   ❌ Response missing 'campaigns' field")
                return False
        return False

    def test_get_marketing_segments(self):
        """Test GET /api/marketing/segments endpoint"""
        tenant_id = "default_dealership"
        
        success, response = self.run_test(
            "Get Marketing Segments",
            "GET",
            f"marketing/segments?tenant_id={tenant_id}",
            200
        )
        
        if success:
            # Verify response structure
            if 'segments' in response:
                segments = response['segments']
                print(f"   ✅ Retrieved {len(segments)} audience segments")
                
                # Check segment structure
                if segments:
                    first_segment = segments[0]
                    required_fields = ['id', 'name', 'description', 'criteria', 'count']
                    missing_fields = [field for field in required_fields if field not in first_segment]
                    
                    if not missing_fields:
                        print(f"   ✅ Segment structure valid - Name: {first_segment['name']}, Count: {first_segment['count']}")
                        return True
                    else:
                        print(f"   ❌ Segment missing fields: {missing_fields}")
                        return False
                else:
                    print("   ✅ Empty segments list returned")
                    return True
            else:
                print("   ❌ Response missing 'segments' field")
                return False
        return False

    def test_get_marketing_stats(self):
        """Test GET /api/marketing/stats endpoint"""
        tenant_id = "default_dealership"
        
        success, response = self.run_test(
            "Get Marketing Statistics",
            "GET",
            f"marketing/stats?tenant_id={tenant_id}",
            200
        )
        
        if success:
            # Verify stats structure
            required_fields = ['total_campaigns', 'active_campaigns', 'total_recipients', 'avg_open_rate', 'avg_click_rate', 'total_responses']
            missing_fields = [field for field in required_fields if field not in response]
            
            if not missing_fields:
                print(f"   ✅ Stats retrieved - Campaigns: {response['total_campaigns']}, Recipients: {response['total_recipients']}")
                print(f"      Open Rate: {response['avg_open_rate']}%, Click Rate: {response['avg_click_rate']}%")
                return True
            else:
                print(f"   ❌ Stats missing fields: {missing_fields}")
                return False
        return False

    def test_create_sms_campaign(self):
        """Test POST /api/marketing/campaigns with SMS campaign"""
        sms_campaign_data = {
            "tenant_id": "default_dealership",
            "name": "Test SMS Campaign - New Year Sale",
            "type": "sms",
            "content": "🎉 New Year Special! Save up to $5,000 on select Toyota models. Visit Shottenkirk Toyota San Antonio today! Text STOP to opt out.",
            "segment_id": "seg_1"
        }
        
        success, response = self.run_test(
            "Create SMS Campaign",
            "POST",
            "marketing/campaigns",
            200,
            data=sms_campaign_data
        )
        
        if success:
            # Verify campaign creation
            required_fields = ['id', 'name', 'type', 'content', 'status', 'recipients']
            missing_fields = [field for field in required_fields if field not in response]
            
            if not missing_fields:
                self.created_sms_campaign_id = response['id']
                print(f"   ✅ SMS Campaign created - ID: {response['id']}, Recipients: {response['recipients']}")
                print(f"      Status: {response['status']}, Type: {response['type']}")
                return True
            else:
                print(f"   ❌ Campaign response missing fields: {missing_fields}")
                return False
        return False

    def test_create_email_campaign(self):
        """Test POST /api/marketing/campaigns with Email campaign"""
        email_campaign_data = {
            "tenant_id": "default_dealership",
            "name": "Test Email Campaign - Service Special",
            "type": "email",
            "subject": "30% Off Winter Service Package - Limited Time!",
            "content": "<h2>Winter Service Special</h2><p>Get your Toyota ready for winter with our comprehensive service package. Save 30% on all winter maintenance services including oil change, tire rotation, and battery check.</p><p>Book your appointment today!</p>",
            "segment_id": "seg_2"
        }
        
        success, response = self.run_test(
            "Create Email Campaign",
            "POST",
            "marketing/campaigns",
            200,
            data=email_campaign_data
        )
        
        if success:
            # Verify campaign creation
            required_fields = ['id', 'name', 'type', 'subject', 'content', 'status', 'recipients']
            missing_fields = [field for field in required_fields if field not in response]
            
            if not missing_fields:
                self.created_email_campaign_id = response['id']
                print(f"   ✅ Email Campaign created - ID: {response['id']}, Recipients: {response['recipients']}")
                print(f"      Subject: {response['subject']}, Status: {response['status']}")
                return True
            else:
                print(f"   ❌ Campaign response missing fields: {missing_fields}")
                return False
        return False

    def test_create_scheduled_campaign(self):
        """Test POST /api/marketing/campaigns with scheduled date"""
        from datetime import datetime, timedelta
        
        # Schedule for tomorrow at 10 AM
        tomorrow = datetime.now() + timedelta(days=1)
        scheduled_time = tomorrow.replace(hour=10, minute=0, second=0, microsecond=0)
        
        scheduled_campaign_data = {
            "tenant_id": "default_dealership",
            "name": "Test Scheduled Campaign - Weekend Sale",
            "type": "sms",
            "content": "Weekend Sale Alert! 🚗 Special financing available on all Toyota models. Visit us this weekend for exclusive deals!",
            "segment_id": "seg_3",
            "scheduled_date": scheduled_time.isoformat()
        }
        
        success, response = self.run_test(
            "Create Scheduled Campaign",
            "POST",
            "marketing/campaigns",
            200,
            data=scheduled_campaign_data
        )
        
        if success:
            # Verify scheduled campaign
            if response.get('status') == 'scheduled' and 'scheduled_date' in response:
                print(f"   ✅ Scheduled Campaign created - Status: {response['status']}")
                print(f"      Scheduled for: {response['scheduled_date']}")
                return True
            else:
                print(f"   ❌ Campaign not properly scheduled - Status: {response.get('status')}")
                return False
        return False

    def test_create_audience_segment(self):
        """Test POST /api/marketing/segments"""
        segment_data = {
            "tenant_id": "default_dealership",
            "name": "Test Segment - Luxury Buyers",
            "description": "Customers interested in luxury Toyota models like Lexus and premium Camry/Highlander",
            "criteria": {
                "budget_min": 40000,
                "vehicle_type": "luxury",
                "interests": ["premium_features", "leather_seats", "navigation"]
            }
        }
        
        success, response = self.run_test(
            "Create Audience Segment",
            "POST",
            "marketing/segments",
            200,
            data=segment_data
        )
        
        if success:
            # Verify segment creation
            required_fields = ['id', 'name', 'description', 'criteria', 'count']
            missing_fields = [field for field in required_fields if field not in response]
            
            if not missing_fields:
                self.created_segment_id = response['id']
                print(f"   ✅ Audience Segment created - ID: {response['id']}, Count: {response['count']}")
                print(f"      Name: {response['name']}")
                return True
            else:
                print(f"   ❌ Segment response missing fields: {missing_fields}")
                return False
        return False

    def test_marketing_error_handling(self):
        """Test marketing API error handling"""
        print("\n🔍 Testing Marketing API Error Handling...")
        
        # Test missing tenant_id
        success1, _ = self.run_test(
            "Marketing Campaigns - Missing tenant_id",
            "GET",
            "marketing/campaigns",
            422  # Validation error expected
        )
        
        # Test invalid campaign creation (missing required fields)
        invalid_campaign = {
            "tenant_id": "test_tenant"
            # Missing name, type, content, segment_id
        }
        
        success2, response2 = self.run_test(
            "Create Campaign - Missing Fields",
            "POST",
            "marketing/campaigns",
            422,  # Validation error expected
            data=invalid_campaign
        )
        
        # Test invalid segment creation
        invalid_segment = {
            "tenant_id": "test_tenant"
            # Missing name, description
        }
        
        success3, response3 = self.run_test(
            "Create Segment - Missing Fields",
            "POST",
            "marketing/segments",
            422,  # Validation error expected
            data=invalid_segment
        )
        
        passed_tests = sum([success1, success2, success3])
        print(f"   📊 Error Handling: {passed_tests}/3 tests passed")
        
        return passed_tests >= 2  # At least 2/3 should pass

    def test_twilio_sms_integration(self):
        """Test Twilio SMS integration (mock if no API keys)"""
        print("\n📱 Testing Twilio SMS Integration...")
        
        # Check if Twilio credentials are configured
        import os
        twilio_sid = os.environ.get('TWILIO_ACCOUNT_SID')
        twilio_token = os.environ.get('TWILIO_AUTH_TOKEN')
        
        if twilio_sid and twilio_token:
            print("   ✅ Twilio credentials configured - will use real API")
            integration_type = "real"
        else:
            print("   ℹ️  Twilio credentials not configured - using mock responses")
            integration_type = "mock"
        
        # Create SMS campaign to test integration
        sms_campaign_data = {
            "tenant_id": "default_dealership",
            "name": "Twilio Integration Test",
            "type": "sms",
            "content": "Test message from Shottenkirk Toyota - Twilio integration test",
            "segment_id": "seg_1"
        }
        
        success, response = self.run_test(
            "SMS Campaign with Twilio Integration",
            "POST",
            "marketing/campaigns",
            200,
            data=sms_campaign_data
        )
        
        if success:
            print(f"   ✅ SMS Campaign created successfully with {integration_type} Twilio integration")
            return True
        else:
            print(f"   ❌ SMS Campaign failed with {integration_type} Twilio integration")
            return False

    def test_sendgrid_email_integration(self):
        """Test SendGrid email integration (mock if no API keys)"""
        print("\n📧 Testing SendGrid Email Integration...")
        
        # Check if SendGrid credentials are configured
        import os
        sendgrid_key = os.environ.get('SENDGRID_API_KEY')
        
        if sendgrid_key:
            print("   ✅ SendGrid API key configured - will use real API")
            integration_type = "real"
        else:
            print("   ℹ️  SendGrid API key not configured - using mock responses")
            integration_type = "mock"
        
        # Create email campaign to test integration
        email_campaign_data = {
            "tenant_id": "default_dealership",
            "name": "SendGrid Integration Test",
            "type": "email",
            "subject": "SendGrid Integration Test - Shottenkirk Toyota",
            "content": "<h2>Test Email</h2><p>This is a test email from Shottenkirk Toyota to verify SendGrid integration.</p>",
            "segment_id": "seg_2"
        }
        
        success, response = self.run_test(
            "Email Campaign with SendGrid Integration",
            "POST",
            "marketing/campaigns",
            200,
            data=email_campaign_data
        )
        
        if success:
            print(f"   ✅ Email Campaign created successfully with {integration_type} SendGrid integration")
            return True
        else:
            print(f"   ❌ Email Campaign failed with {integration_type} SendGrid integration")
            return False

    def test_mass_marketing_comprehensive(self):
        """Run comprehensive Mass Marketing test suite"""
        print("\n📢 Running Comprehensive Mass Marketing Tests...")
        
        marketing_tests = [
            ("Get Marketing Campaigns", self.test_get_marketing_campaigns),
            ("Get Marketing Segments", self.test_get_marketing_segments),
            ("Get Marketing Statistics", self.test_get_marketing_stats),
            ("Create SMS Campaign", self.test_create_sms_campaign),
            ("Create Email Campaign", self.test_create_email_campaign),
            ("Create Scheduled Campaign", self.test_create_scheduled_campaign),
            ("Create Audience Segment", self.test_create_audience_segment),
            ("Twilio SMS Integration", self.test_twilio_sms_integration),
            ("SendGrid Email Integration", self.test_sendgrid_email_integration),
            ("Marketing Error Handling", self.test_marketing_error_handling)
        ]
        
        passed_tests = 0
        total_tests = len(marketing_tests)
        
        for test_name, test_func in marketing_tests:
            try:
                if test_func():
                    passed_tests += 1
                    print(f"   ✅ {test_name} - PASSED")
                else:
                    print(f"   ❌ {test_name} - FAILED")
            except Exception as e:
                print(f"   ❌ {test_name} - ERROR: {str(e)}")
        
        success_rate = (passed_tests / total_tests) * 100
        print(f"\n   📊 Mass Marketing Test Suite: {passed_tests}/{total_tests} passed ({success_rate:.1f}%)")
        
        return passed_tests >= total_tests * 0.8  # 80% pass rate required

    # Chrome Extension API Tests
    def test_chrome_extension_health_check(self):
        """Test Chrome extension health check endpoint"""
        success, response = self.run_test(
            "Chrome Extension Health Check",
            "GET",
            "health",
            200
        )
        
        if success:
            # Verify response structure
            if 'status' in response and response['status'] == 'healthy':
                print("   ✅ Health check returned healthy status")
                return True
            else:
                print("   ❌ Health check missing status or not healthy")
                return False
        return False

    def test_chrome_extension_auth(self):
        """Test Chrome extension authentication"""
        auth_data = {
            "email": "test@jokervision.com",
            "password": "testpass123"
        }
        
        success, response = self.run_test(
            "Chrome Extension Authentication",
            "POST",
            "auth/extension-login",
            200,
            data=auth_data
        )
        
        if success:
            # Verify response structure
            required_fields = ['success', 'user', 'tenant_id', 'token']
            missing_fields = [field for field in required_fields if field not in response]
            
            if not missing_fields and response.get('success'):
                print("   ✅ Authentication successful with all required fields")
                self.extension_tenant_id = response.get('tenant_id')
                return True
            else:
                print(f"   ❌ Authentication missing fields: {missing_fields}")
                return False
        return False

    def test_inventory_sync(self):
        """Test inventory synchronization"""
        if not hasattr(self, 'extension_tenant_id'):
            self.extension_tenant_id = "demo_tenant_123"
        
        sync_data = {
            "tenant_id": self.extension_tenant_id,
            "source": "facebook_marketplace"
        }
        
        success, response = self.run_test(
            "Inventory Sync",
            "POST",
            "inventory/sync",
            200,
            data=sync_data
        )
        
        if success:
            # Verify sync response
            if response.get('status') == 'success' and 'vehicles_processed' in response:
                vehicles_count = response.get('vehicles_processed', 0)
                print(f"   ✅ Sync successful - {vehicles_count} vehicles processed")
                return True
            else:
                print("   ❌ Sync failed or missing required fields")
                return False
        return False

    def test_inventory_summary(self):
        """Test inventory summary retrieval"""
        if not hasattr(self, 'extension_tenant_id'):
            self.extension_tenant_id = "demo_tenant_123"
        
        success, response = self.run_test(
            "Inventory Summary",
            "GET",
            f"inventory/summary?tenant_id={self.extension_tenant_id}",
            200
        )
        
        if success:
            # Verify summary structure
            required_fields = ['total_vehicles', 'recent_vehicles']
            missing_fields = [field for field in required_fields if field not in response]
            
            if not missing_fields:
                total_vehicles = response.get('total_vehicles', 0)
                recent_count = len(response.get('recent_vehicles', []))
                print(f"   ✅ Summary retrieved - {total_vehicles} total, {recent_count} recent")
                return True
            else:
                print(f"   ❌ Summary missing fields: {missing_fields}")
                return False
        return False

    def test_seo_description_generation(self):
        """Test AI-powered SEO description generation"""
        if not hasattr(self, 'extension_tenant_id'):
            self.extension_tenant_id = "demo_tenant_123"
        
        seo_request = {
            "tenant_id": self.extension_tenant_id,
            "vehicle_data": {
                "year": 2023,
                "make": "Toyota",
                "model": "Camry",
                "price": 28999.99,
                "mileage": 15000,
                "features": ["Bluetooth", "Backup Camera", "Heated Seats"],
                "description": "Great condition Toyota Camry"
            },
            "current_description": "2023 Toyota Camry for sale"
        }
        
        success, response = self.run_test(
            "SEO Description Generation",
            "POST",
            "ai/generate-seo-description",
            200,
            data=seo_request
        )
        
        if success:
            # Verify AI response
            if response.get('success') and 'optimized_description' in response:
                description = response.get('optimized_description', '')
                char_count = response.get('character_count', 0)
                print(f"   ✅ SEO description generated - {char_count} characters")
                print(f"      Preview: {description[:100]}...")
                return True
            else:
                print("   ❌ SEO generation failed or missing optimized description")
                return False
        return False

    def test_price_optimization(self):
        """Test AI-powered price optimization"""
        if not hasattr(self, 'extension_tenant_id'):
            self.extension_tenant_id = "demo_tenant_123"
        
        price_request = {
            "tenant_id": self.extension_tenant_id,
            "vehicle_data": {
                "year": 2022,
                "make": "Honda",
                "model": "Accord",
                "price": 31500.00,
                "mileage": 25000,
                "features": ["Navigation", "Sunroof", "Leather Seats"]
            },
            "current_price": 31500.00
        }
        
        success, response = self.run_test(
            "Price Optimization",
            "POST",
            "ai/optimize-price",
            200,
            data=price_request
        )
        
        if success:
            # Verify price optimization response
            required_fields = ['success', 'current_price', 'recommended_price', 'market_average', 'confidence_level']
            missing_fields = [field for field in required_fields if field not in response]
            
            if not missing_fields and response.get('success'):
                current = response.get('current_price', 0)
                recommended = response.get('recommended_price', 0)
                confidence = response.get('confidence_level', 0)
                print(f"   ✅ Price optimization complete - Current: ${current:,.2f}, Recommended: ${recommended:,.2f}")
                print(f"      Confidence: {confidence}%")
                return True
            else:
                print(f"   ❌ Price optimization missing fields: {missing_fields}")
                return False
        return False

    def test_analytics_track_interaction(self):
        """Test analytics interaction tracking"""
        if not hasattr(self, 'extension_tenant_id'):
            self.extension_tenant_id = "demo_tenant_123"
        
        interaction_data = {
            "tenant_id": self.extension_tenant_id,
            "event": "listing_viewed",
            "data": {
                "vehicle_id": "test_vehicle_123",
                "listing_url": "https://facebook.com/marketplace/item/123456789"
            },
            "url": "https://facebook.com/marketplace"
        }
        
        success, response = self.run_test(
            "Analytics Interaction Tracking",
            "POST",
            "analytics/track-interaction",
            200,
            data=interaction_data
        )
        
        if success:
            if response.get('success') and 'message' in response:
                print("   ✅ Interaction tracked successfully")
                return True
            else:
                print("   ❌ Interaction tracking failed")
                return False
        return False

    def test_marketplace_performance_analytics(self):
        """Test marketplace performance analytics"""
        if not hasattr(self, 'extension_tenant_id'):
            self.extension_tenant_id = "demo_tenant_123"
        
        success, response = self.run_test(
            "Marketplace Performance Analytics",
            "GET",
            f"analytics/marketplace-performance?tenant_id={self.extension_tenant_id}",
            200
        )
        
        if success:
            # Verify analytics structure
            required_fields = ['listings_count', 'total_views', 'inquiries', 'conversion_rate']
            missing_fields = [field for field in required_fields if field not in response]
            
            if not missing_fields:
                listings = response.get('listings_count', 0)
                views = response.get('total_views', 0)
                inquiries = response.get('inquiries', 0)
                conversion = response.get('conversion_rate', 0)
                print(f"   ✅ Performance data - {listings} listings, {views} views, {inquiries} inquiries")
                print(f"      Conversion rate: {conversion}%")
                return True
            else:
                print(f"   ❌ Performance analytics missing fields: {missing_fields}")
                return False
        return False

    def test_chrome_extension_error_handling(self):
        """Test Chrome extension error handling"""
        print("\n🔍 Testing Chrome Extension Error Handling...")
        
        # Test missing tenant_id in SEO generation
        invalid_seo_request = {
            "vehicle_data": {
                "year": 2023,
                "make": "Toyota",
                "model": "Camry"
            }
        }
        
        success1, _ = self.run_test(
            "SEO Generation - Missing tenant_id (Should Fail)",
            "POST",
            "ai/generate-seo-description",
            422  # Validation error expected
        )
        
        # Test invalid tenant_id in inventory summary
        success2, _ = self.run_test(
            "Inventory Summary - Invalid tenant_id",
            "GET",
            "inventory/summary?tenant_id=invalid_tenant",
            200  # Should still return data but with error handling
        )
        
        # Test missing required fields in analytics
        invalid_analytics = {
            "tenant_id": "test_tenant"
            # Missing 'event' field
        }
        
        success3, response3 = self.run_test(
            "Analytics - Missing event field",
            "POST",
            "analytics/track-interaction",
            200
        )
        
        if success3 and 'error' in response3:
            print("   ✅ Analytics correctly handled missing event field")
            success3 = True
        else:
            success3 = False
        
        passed_tests = sum([success1, success2, success3])
        print(f"   📊 Error Handling: {passed_tests}/3 tests passed")
        
        return passed_tests >= 2  # At least 2/3 should pass

    def test_chrome_extension_comprehensive(self):
        """Run comprehensive Chrome extension test suite"""
        print("\n🔧 Running Comprehensive Chrome Extension Tests...")
        
        extension_tests = [
            ("Health Check", self.test_chrome_extension_health_check),
            ("Authentication", self.test_chrome_extension_auth),
            ("Inventory Sync", self.test_inventory_sync),
            ("Inventory Summary", self.test_inventory_summary),
            ("SEO Description Generation", self.test_seo_description_generation),
            ("Price Optimization", self.test_price_optimization),
            ("Analytics Tracking", self.test_analytics_track_interaction),
            ("Marketplace Performance", self.test_marketplace_performance_analytics),
            ("Error Handling", self.test_chrome_extension_error_handling)
        ]
        
        passed_tests = 0
        total_tests = len(extension_tests)
        
        for test_name, test_func in extension_tests:
            try:
                if test_func():
                    passed_tests += 1
                    print(f"   ✅ {test_name} - PASSED")
                else:
                    print(f"   ❌ {test_name} - FAILED")
            except Exception as e:
                print(f"   ❌ {test_name} - ERROR: {str(e)}")
        
        success_rate = (passed_tests / total_tests) * 100
        print(f"\n   📊 Chrome Extension Test Suite: {passed_tests}/{total_tests} passed ({success_rate:.1f}%)")
        
        return passed_tests >= total_tests * 0.8  # 80% pass rate required

    # Social Media Hub API Tests
    def test_get_social_media_accounts(self):
        """Test GET /api/social-media/accounts endpoint"""
        tenant_id = "default_dealership"
        
        success, response = self.run_test(
            "Get Social Media Accounts",
            "GET",
            f"social-media/accounts?tenant_id={tenant_id}",
            200
        )
        
        if success:
            # Verify response structure
            if 'accounts' in response:
                accounts = response['accounts']
                print(f"   ✅ Retrieved {len(accounts)} social media accounts")
                
                # Check account structure if accounts exist
                if accounts:
                    first_account = accounts[0]
                    required_fields = ['id', 'tenant_id', 'platform', 'name', 'username', 'followers', 'status']
                    missing_fields = [field for field in required_fields if field not in first_account]
                    
                    if not missing_fields:
                        print(f"   ✅ Account structure valid - Platform: {first_account['platform']}, Followers: {first_account['followers']}")
                        return True
                    else:
                        print(f"   ❌ Account missing fields: {missing_fields}")
                        return False
                else:
                    print("   ✅ Empty accounts list returned")
                    return True
            else:
                print("   ❌ Response missing 'accounts' field")
                return False
        return False

    def test_connect_social_media_account_facebook(self):
        """Test POST /api/social-media/accounts for Facebook"""
        facebook_account_data = {
            "tenant_id": "default_dealership",
            "platform": "facebook",
            "auth_code": "mock_facebook_auth_code_12345"
        }
        
        success, response = self.run_test(
            "Connect Facebook Account",
            "POST",
            "social-media/accounts",
            200,
            data=facebook_account_data
        )
        
        if success:
            # Verify account connection
            required_fields = ['id', 'tenant_id', 'platform', 'name', 'username', 'access_token']
            missing_fields = [field for field in required_fields if field not in response]
            
            if not missing_fields:
                self.created_facebook_account_id = response['id']
                print(f"   ✅ Facebook Account connected - ID: {response['id']}, Platform: {response['platform']}")
                print(f"      Name: {response['name']}, Username: {response['username']}")
                return True
            else:
                print(f"   ❌ Account response missing fields: {missing_fields}")
                return False
        return False

    def test_connect_social_media_account_instagram(self):
        """Test POST /api/social-media/accounts for Instagram"""
        instagram_account_data = {
            "tenant_id": "default_dealership",
            "platform": "instagram",
            "auth_code": "mock_instagram_auth_code_67890"
        }
        
        success, response = self.run_test(
            "Connect Instagram Account",
            "POST",
            "social-media/accounts",
            200,
            data=instagram_account_data
        )
        
        if success:
            # Verify account connection
            required_fields = ['id', 'tenant_id', 'platform', 'name', 'username', 'access_token']
            missing_fields = [field for field in required_fields if field not in response]
            
            if not missing_fields:
                self.created_instagram_account_id = response['id']
                print(f"   ✅ Instagram Account connected - ID: {response['id']}, Platform: {response['platform']}")
                print(f"      Name: {response['name']}, Username: {response['username']}")
                return True
            else:
                print(f"   ❌ Account response missing fields: {missing_fields}")
                return False
        return False

    def test_connect_social_media_account_tiktok(self):
        """Test POST /api/social-media/accounts for TikTok"""
        tiktok_account_data = {
            "tenant_id": "default_dealership",
            "platform": "tiktok",
            "auth_code": "mock_tiktok_auth_code_abcdef"
        }
        
        success, response = self.run_test(
            "Connect TikTok Account",
            "POST",
            "social-media/accounts",
            200,
            data=tiktok_account_data
        )
        
        if success:
            # Verify account connection
            required_fields = ['id', 'tenant_id', 'platform', 'name', 'username', 'access_token']
            missing_fields = [field for field in required_fields if field not in response]
            
            if not missing_fields:
                self.created_tiktok_account_id = response['id']
                print(f"   ✅ TikTok Account connected - ID: {response['id']}, Platform: {response['platform']}")
                print(f"      Name: {response['name']}, Username: {response['username']}")
                return True
            else:
                print(f"   ❌ Account response missing fields: {missing_fields}")
                return False
        return False

    def test_disconnect_social_media_account(self):
        """Test DELETE /api/social-media/accounts/{account_id}"""
        # Use a mock account ID for testing
        mock_account_id = "mock_account_to_delete"
        
        success, response = self.run_test(
            "Disconnect Social Media Account",
            "DELETE",
            f"social-media/accounts/{mock_account_id}",
            404  # Expected since mock account doesn't exist
        )
        
        # For this test, we expect 404 since we're using a mock ID
        # In a real scenario with actual accounts, we'd expect 200
        if success:
            print("   ✅ Account disconnection handled correctly (404 for non-existent account)")
            return True
        return False

    def test_get_social_media_posts(self):
        """Test GET /api/social-media/posts endpoint"""
        tenant_id = "default_dealership"
        
        success, response = self.run_test(
            "Get Social Media Posts",
            "GET",
            f"social-media/posts?tenant_id={tenant_id}&limit=20",
            200
        )
        
        if success:
            # Verify response structure
            if 'posts' in response:
                posts = response['posts']
                print(f"   ✅ Retrieved {len(posts)} social media posts")
                
                # Check post structure if posts exist
                if posts:
                    first_post = posts[0]
                    required_fields = ['id', 'tenant_id', 'platform', 'content', 'status', 'created_at']
                    missing_fields = [field for field in required_fields if field not in first_post]
                    
                    if not missing_fields:
                        print(f"   ✅ Post structure valid - Platform: {first_post['platform']}, Status: {first_post['status']}")
                        print(f"      Content preview: {first_post['content'][:50]}...")
                        return True
                    else:
                        print(f"   ❌ Post missing fields: {missing_fields}")
                        return False
                else:
                    print("   ✅ Empty posts list returned")
                    return True
            else:
                print("   ❌ Response missing 'posts' field")
                return False
        return False

    def test_create_multi_platform_post(self):
        """Test POST /api/social-media/posts for multi-platform posting"""
        multi_platform_post_data = {
            "tenant_id": "default_dealership",
            "platforms": ["facebook", "instagram", "tiktok"],
            "content": "🚗 New Year Special! Save up to $5,000 on select 2025 Toyota models. Visit Shottenkirk Toyota San Antonio today! #Toyota #NewYear #CarDeals",
            "media_type": "image",
            "media_url": "/api/placeholder/400/300"
        }
        
        success, response = self.run_test(
            "Create Multi-Platform Post",
            "POST",
            "social-media/posts",
            200,
            data=multi_platform_post_data
        )
        
        if success:
            # Verify multi-platform post creation
            if 'posts' in response and 'message' in response:
                posts = response['posts']
                message = response['message']
                
                if len(posts) == 3:  # Should create posts for all 3 platforms
                    platforms_created = [post.get('platform') for post in posts]
                    expected_platforms = ["facebook", "instagram", "tiktok"]
                    
                    if all(platform in platforms_created for platform in expected_platforms):
                        print(f"   ✅ Multi-platform post created successfully")
                        print(f"      Platforms: {', '.join(platforms_created)}")
                        print(f"      Message: {message}")
                        return True
                    else:
                        print(f"   ❌ Missing platforms - Expected: {expected_platforms}, Got: {platforms_created}")
                        return False
                else:
                    print(f"   ❌ Expected 3 posts, got {len(posts)}")
                    return False
            else:
                print("   ❌ Response missing 'posts' or 'message' field")
                return False
        return False

    def test_create_scheduled_social_media_post(self):
        """Test POST /api/social-media/posts with scheduling"""
        from datetime import datetime, timedelta
        
        # Schedule for tomorrow at 2 PM
        tomorrow = datetime.now() + timedelta(days=1)
        scheduled_time = tomorrow.replace(hour=14, minute=0, second=0, microsecond=0)
        
        scheduled_post_data = {
            "tenant_id": "default_dealership",
            "platforms": ["facebook", "instagram"],
            "content": "Weekend Sale Alert! 🚗 Special financing available on all Toyota models. Visit us this weekend for exclusive deals! #WeekendSale #Toyota",
            "media_type": "video",
            "media_url": "/api/placeholder/400/400",
            "scheduled_date": scheduled_time.isoformat()
        }
        
        success, response = self.run_test(
            "Create Scheduled Social Media Post",
            "POST",
            "social-media/posts",
            200,
            data=scheduled_post_data
        )
        
        if success:
            # Verify scheduled post creation
            if 'posts' in response:
                posts = response['posts']
                
                # Check if posts are scheduled
                scheduled_posts = [post for post in posts if post.get('status') == 'scheduled']
                
                if len(scheduled_posts) == len(posts):
                    print(f"   ✅ Scheduled posts created successfully")
                    print(f"      Platforms: {len(posts)} posts scheduled")
                    print(f"      Scheduled for: {scheduled_time.isoformat()}")
                    return True
                else:
                    print(f"   ❌ Not all posts were scheduled - {len(scheduled_posts)}/{len(posts)}")
                    return False
            else:
                print("   ❌ Response missing 'posts' field")
                return False
        return False

    def test_get_social_media_analytics(self):
        """Test GET /api/social-media/analytics endpoint"""
        tenant_id = "default_dealership"
        
        success, response = self.run_test(
            "Get Social Media Analytics",
            "GET",
            f"social-media/analytics?tenant_id={tenant_id}",
            200
        )
        
        if success:
            # Verify analytics structure
            required_fields = ['total_followers', 'total_posts', 'total_engagement', 'avg_engagement_rate', 'top_performing_platform']
            missing_fields = [field for field in required_fields if field not in response]
            
            if not missing_fields:
                print(f"   ✅ Analytics retrieved successfully")
                print(f"      Total Followers: {response['total_followers']:,}")
                print(f"      Total Posts: {response['total_posts']}")
                print(f"      Total Engagement: {response['total_engagement']:,}")
                print(f"      Avg Engagement Rate: {response['avg_engagement_rate']}%")
                print(f"      Top Platform: {response['top_performing_platform']}")
                
                # Check weekly stats if present
                if 'weekly_stats' in response:
                    weekly_stats = response['weekly_stats']
                    print(f"      Weekly Stats Available: {', '.join(weekly_stats.keys())}")
                
                return True
            else:
                print(f"   ❌ Analytics missing fields: {missing_fields}")
                return False
        return False

    def test_social_media_oauth_token_exchange(self):
        """Test OAuth token exchange functionality (mock)"""
        print("\n🔐 Testing OAuth Token Exchange...")
        
        # Test Facebook OAuth
        facebook_success = self.test_connect_social_media_account_facebook()
        
        # Test Instagram OAuth (uses Facebook login)
        instagram_success = self.test_connect_social_media_account_instagram()
        
        # Test TikTok OAuth
        tiktok_success = self.test_connect_social_media_account_tiktok()
        
        passed_tests = sum([facebook_success, instagram_success, tiktok_success])
        print(f"   📊 OAuth Token Exchange: {passed_tests}/3 platforms tested")
        
        return passed_tests >= 2  # At least 2/3 should pass

    def test_social_media_error_handling(self):
        """Test social media API error handling"""
        print("\n🔍 Testing Social Media API Error Handling...")
        
        # Test missing tenant_id
        success1, _ = self.run_test(
            "Social Media Accounts - Missing tenant_id",
            "GET",
            "social-media/accounts",
            422  # Validation error expected
        )
        
        # Test invalid platform in account creation
        invalid_account = {
            "tenant_id": "test_tenant",
            "platform": "invalid_platform",
            "auth_code": "test_code"
        }
        
        success2, response2 = self.run_test(
            "Connect Account - Invalid Platform",
            "POST",
            "social-media/accounts",
            400,  # Bad request expected
            data=invalid_account
        )
        
        # Test invalid post creation (missing required fields)
        invalid_post = {
            "tenant_id": "test_tenant"
            # Missing platforms, content
        }
        
        success3, response3 = self.run_test(
            "Create Post - Missing Fields",
            "POST",
            "social-media/posts",
            422,  # Validation error expected
            data=invalid_post
        )
        
        passed_tests = sum([success1, success2, success3])
        print(f"   📊 Error Handling: {passed_tests}/3 tests passed")
        
        return passed_tests >= 2  # At least 2/3 should pass

    def test_social_media_comprehensive(self):
        """Run comprehensive Social Media Hub test suite"""
        print("\n📱 Running Comprehensive Social Media Hub Tests...")
        
        social_media_tests = [
            ("Get Social Media Accounts", self.test_get_social_media_accounts),
            ("OAuth Token Exchange", self.test_social_media_oauth_token_exchange),
            ("Disconnect Account", self.test_disconnect_social_media_account),
            ("Get Social Media Posts", self.test_get_social_media_posts),
            ("Create Multi-Platform Post", self.test_create_multi_platform_post),
            ("Create Scheduled Post", self.test_create_scheduled_social_media_post),
            ("Get Analytics", self.test_get_social_media_analytics),
            ("Error Handling", self.test_social_media_error_handling)
        ]
        
        passed_tests = 0
        total_tests = len(social_media_tests)
        
        for test_name, test_func in social_media_tests:
            try:
                if test_func():
                    passed_tests += 1
                    print(f"   ✅ {test_name} - PASSED")
                else:
                    print(f"   ❌ {test_name} - FAILED")
            except Exception as e:
                print(f"   ❌ {test_name} - ERROR: {str(e)}")
        
        success_rate = (passed_tests / total_tests) * 100
        print(f"\n   📊 Social Media Hub Test Suite: {passed_tests}/{total_tests} passed ({success_rate:.1f}%)")
        
        return passed_tests >= total_tests * 0.8  # 80% pass rate required

def main():
    print("🃏 JokerVision AutoFollow API Testing Suite")
    print("=" * 50)
    
    tester = AutoFollowProAPITester()
    
    # Test sequence
    test_sequence = [
        ("Enhanced Dashboard Stats", tester.test_enhanced_dashboard_stats),
        ("JokerVision User Management", tester.test_user_management_system),
        ("JokerVision Sales Tracking", tester.test_sales_tracking_system),
        ("Commission Tier System", tester.test_commission_tier_progression),
        ("Chrome Extension Comprehensive Suite", tester.test_chrome_extension_comprehensive),
        ("Mass Marketing Comprehensive Suite", tester.test_mass_marketing_comprehensive),
        ("Social Media Hub Comprehensive Suite", tester.test_social_media_comprehensive),
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
    
    # Cleanup JokerVision test data
    try:
        tester.cleanup_jokervision_data()
    except Exception as e:
        print(f"⚠️  Cleanup failed: {str(e)}")
    
    # Print final results
    print("\n" + "=" * 50)
    print(f"📊 Test Results: {tester.tests_passed}/{tester.tests_run} tests passed")
    
    if tester.tests_passed == tester.tests_run:
        print("🎉 All JokerVision AutoFollow tests passed!")
        return 0
    else:
        print(f"⚠️  {tester.tests_run - tester.tests_passed} tests failed")
        return 1

if __name__ == "__main__":
    sys.exit(main())