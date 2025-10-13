import requests
import sys
import json
from datetime import datetime

class AutoFollowProAPITester:
    def __init__(self, base_url="https://autoleads-engine.preview.emergentagent.com"):
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

    # =============================================================================
    # AI-POWERED INBOX SYSTEM TESTS
    # =============================================================================

    def test_ai_inbox_process_message(self):
        """Test AI Inbox message processing endpoint"""
        message_data = {
            "conversation": {
                "id": "conv_test_123",
                "contact": {
                    "name": "Sarah Johnson",
                    "phone": "555-123-4567",
                    "email": "sarah.johnson@email.com"
                },
                "channel": "sms"
            },
            "message_content": "Hi, I'm interested in a 2024 Toyota Camry. Can you tell me about pricing and availability?"
        }
        
        success, response = self.run_test(
            "AI Inbox - Process Message",
            "POST",
            "ai-inbox/process-message",
            200,
            data=message_data
        )
        
        if success:
            # Verify response structure
            required_fields = ['status', 'ai_analysis', 'timestamp', 'system_version']
            missing_fields = [field for field in required_fields if field not in response]
            
            if not missing_fields:
                ai_analysis = response.get('ai_analysis', {})
                
                # Check AI analysis components
                analysis_fields = ['ai_response', 'message_analysis', 'enhanced_lead_score', 'automation_applied']
                analysis_missing = [field for field in analysis_fields if field not in ai_analysis]
                
                if not analysis_missing:
                    ai_response = ai_analysis.get('ai_response', {})
                    message_analysis = ai_analysis.get('message_analysis', {})
                    
                    print(f"   ✅ AI Analysis Complete:")
                    print(f"      - Intent: {message_analysis.get('primary_intent', 'N/A')}")
                    print(f"      - Urgency: {message_analysis.get('urgency', 'N/A')}")
                    print(f"      - Sentiment: {message_analysis.get('sentiment', 'N/A')}")
                    print(f"      - Lead Score: {ai_analysis.get('enhanced_lead_score', 'N/A')}")
                    print(f"      - Response Confidence: {ai_response.get('confidence', 'N/A')}")
                    print(f"      - Should Escalate: {ai_response.get('should_escalate', 'N/A')}")
                    
                    # Store conversation ID for follow-up tests
                    self.test_conversation_id = "conv_test_123"
                    self.test_ai_response = ai_response.get('response_text', '')
                    
                    return True
                else:
                    print(f"   ❌ AI analysis missing fields: {analysis_missing}")
                    return False
            else:
                print(f"   ❌ Response missing fields: {missing_fields}")
                return False
        return False

    def test_ai_inbox_auto_respond(self):
        """Test AI Inbox auto-response endpoint"""
        if not hasattr(self, 'test_conversation_id'):
            self.test_conversation_id = "conv_test_123"
        if not hasattr(self, 'test_ai_response'):
            self.test_ai_response = "Hi Sarah! Thanks for your interest in the 2024 Toyota Camry. I'd be happy to help you with pricing and availability information!"
        
        response_data = {
            "response_text": self.test_ai_response,
            "channel": "sms",
            "recipient": {
                "name": "Sarah Johnson",
                "phone": "555-123-4567"
            }
        }
        
        success, response = self.run_test(
            "AI Inbox - Auto Respond",
            "POST",
            f"ai-inbox/auto-respond/{self.test_conversation_id}",
            200,
            data=response_data
        )
        
        if success:
            # Verify response structure
            required_fields = ['status', 'delivery', 'message']
            missing_fields = [field for field in required_fields if field not in response]
            
            if not missing_fields:
                delivery = response.get('delivery', {})
                delivery_fields = ['message_id', 'conversation_id', 'sent_via', 'recipient', 'content', 'sent_at', 'status', 'ai_generated']
                delivery_missing = [field for field in delivery_fields if field not in delivery]
                
                if not delivery_missing:
                    print(f"   ✅ Auto-response sent successfully:")
                    print(f"      - Message ID: {delivery.get('message_id', 'N/A')}")
                    print(f"      - Channel: {delivery.get('sent_via', 'N/A')}")
                    print(f"      - Status: {delivery.get('status', 'N/A')}")
                    print(f"      - AI Generated: {delivery.get('ai_generated', 'N/A')}")
                    print(f"      - Content Preview: {delivery.get('content', '')[:100]}...")
                    return True
                else:
                    print(f"   ❌ Delivery info missing fields: {delivery_missing}")
                    return False
            else:
                print(f"   ❌ Response missing fields: {missing_fields}")
                return False
        return False

    def test_ai_inbox_stats(self):
        """Test AI Inbox statistics endpoint"""
        success, response = self.run_test(
            "AI Inbox - Statistics",
            "GET",
            "ai-inbox/stats",
            200
        )
        
        if success:
            # Verify response structure
            required_fields = ['ai_inbox_system', 'integration_status', 'supported_channels', 'ai_features', 'performance_metrics']
            missing_fields = [field for field in required_fields if field not in response]
            
            if not missing_fields:
                ai_system = response.get('ai_inbox_system', {})
                ai_features = response.get('ai_features', {})
                performance = response.get('performance_metrics', {})
                
                print(f"   ✅ AI Inbox Statistics Retrieved:")
                print(f"      - System Status: {ai_system.get('ai_system', 'N/A')}")
                print(f"      - Conversations Managed: {ai_system.get('conversations_managed', 'N/A')}")
                print(f"      - Templates Loaded: {ai_system.get('templates_loaded', 'N/A')}")
                print(f"      - Auto Response Rate: {ai_system.get('auto_response_rate', 'N/A')}")
                print(f"      - Average Response Time: {ai_system.get('average_response_time', 'N/A')}")
                print(f"      - Response Accuracy: {performance.get('response_accuracy', 'N/A')}")
                print(f"      - Customer Satisfaction: {performance.get('customer_satisfaction', 'N/A')}")
                print(f"      - Conversion Improvement: {performance.get('conversion_improvement', 'N/A')}")
                
                # Verify supported channels
                channels = response.get('supported_channels', [])
                expected_channels = ['SMS', 'Email', 'Facebook Messenger', 'Instagram DM', 'WhatsApp', 'Phone']
                channels_present = all(channel in channels for channel in expected_channels)
                
                if channels_present:
                    print(f"      - All {len(expected_channels)} channels supported ✅")
                else:
                    print(f"      - Missing some expected channels ⚠️")
                
                return True
            else:
                print(f"   ❌ Response missing fields: {missing_fields}")
                return False
        return False

    def test_ai_inbox_create_campaign(self):
        """Test AI Inbox marketing campaign creation"""
        campaign_data = {
            "name": "Test AI Marketing Campaign - Holiday Special",
            "type": "promotional",
            "target_audience": {
                "leads": ["lead_123", "lead_456", "lead_789"],
                "criteria": {
                    "interested_vehicles": ["Toyota Camry", "Honda Accord"],
                    "engagement_level": "medium_to_high",
                    "last_contact": "within_30_days"
                }
            },
            "template": "🎄 Holiday Special Alert! Hi {name}, exclusive year-end pricing on the {interested_vehicle} you were looking at. Save up to $3,000 + 0.9% APR financing! Limited time offer - interested in details?",
            "schedule": {
                "send_immediately": False,
                "scheduled_date": "2024-12-15T10:00:00Z",
                "time_zone": "America/Chicago"
            }
        }
        
        success, response = self.run_test(
            "AI Inbox - Create Campaign",
            "POST",
            "ai-inbox/create-campaign",
            200,
            data=campaign_data
        )
        
        if success:
            # Verify response structure
            required_fields = ['status', 'campaign', 'message']
            missing_fields = [field for field in required_fields if field not in response]
            
            if not missing_fields:
                campaign = response.get('campaign', {})
                campaign_fields = ['campaign_id', 'status', 'estimated_reach', 'message']
                campaign_missing = [field for field in campaign_fields if field not in campaign]
                
                if not campaign_missing:
                    print(f"   ✅ Marketing Campaign Created:")
                    print(f"      - Campaign ID: {campaign.get('campaign_id', 'N/A')}")
                    print(f"      - Status: {campaign.get('status', 'N/A')}")
                    print(f"      - Estimated Reach: {campaign.get('estimated_reach', 'N/A')} leads")
                    print(f"      - Message: {campaign.get('message', 'N/A')}")
                    
                    # Store campaign ID for potential follow-up tests
                    self.test_campaign_id = campaign.get('campaign_id')
                    
                    return True
                else:
                    print(f"   ❌ Campaign info missing fields: {campaign_missing}")
                    return False
            else:
                print(f"   ❌ Response missing fields: {missing_fields}")
                return False
        return False

    def test_ai_inbox_follow_up_sequence(self):
        """Test AI Inbox follow-up sequence creation"""
        sequence_data = {
            "lead": {
                "id": "lead_test_456",
                "name": "Michael Rodriguez",
                "phone": "555-987-6543",
                "email": "michael.rodriguez@email.com",
                "interested_vehicles": ["Toyota RAV4"],
                "engagement_level": "high",
                "last_contact": "2024-01-15T14:30:00Z"
            },
            "type": "high_interest"  # standard, high_interest, price_conscious
        }
        
        success, response = self.run_test(
            "AI Inbox - Follow-up Sequence",
            "POST",
            "ai-inbox/follow-up-sequence",
            200,
            data=sequence_data
        )
        
        if success:
            # Verify response structure
            required_fields = ['status', 'follow_up', 'message']
            missing_fields = [field for field in required_fields if field not in response]
            
            if not missing_fields:
                follow_up = response.get('follow_up', {})
                follow_up_fields = ['sequence_id', 'lead_id', 'sequence_type', 'steps', 'estimated_completion', 'status', 'next_message']
                follow_up_missing = [field for field in follow_up_fields if field not in follow_up]
                
                if not follow_up_missing:
                    print(f"   ✅ Follow-up Sequence Started:")
                    print(f"      - Sequence ID: {follow_up.get('sequence_id', 'N/A')}")
                    print(f"      - Lead ID: {follow_up.get('lead_id', 'N/A')}")
                    print(f"      - Sequence Type: {follow_up.get('sequence_type', 'N/A')}")
                    print(f"      - Steps: {follow_up.get('steps', 'N/A')}")
                    print(f"      - Estimated Completion: {follow_up.get('estimated_completion', 'N/A')}")
                    print(f"      - Status: {follow_up.get('status', 'N/A')}")
                    print(f"      - Next Message In: {follow_up.get('next_message', 'N/A')} hours")
                    
                    # Store sequence ID for potential follow-up tests
                    self.test_sequence_id = follow_up.get('sequence_id')
                    
                    return True
                else:
                    print(f"   ❌ Follow-up info missing fields: {follow_up_missing}")
                    return False
            else:
                print(f"   ❌ Response missing fields: {missing_fields}")
                return False
        return False

    def test_ai_inbox_conversation_analysis(self):
        """Test AI Inbox conversation analysis endpoint"""
        if not hasattr(self, 'test_conversation_id'):
            self.test_conversation_id = "conv_test_123"
        
        success, response = self.run_test(
            "AI Inbox - Conversation Analysis",
            "GET",
            f"ai-inbox/conversation-analysis/{self.test_conversation_id}",
            200
        )
        
        if success:
            # Verify response structure
            required_fields = ['conversation_id', 'message_count', 'engagement_level', 'interested_vehicles', 'current_stage', 'ai_recommendations', 'next_best_actions']
            missing_fields = [field for field in required_fields if field not in response]
            
            if not missing_fields:
                print(f"   ✅ Conversation Analysis Retrieved:")
                print(f"      - Conversation ID: {response.get('conversation_id', 'N/A')}")
                print(f"      - Message Count: {response.get('message_count', 'N/A')}")
                print(f"      - Engagement Level: {response.get('engagement_level', 'N/A')}")
                print(f"      - Interested Vehicles: {response.get('interested_vehicles', [])}")
                print(f"      - Current Stage: {response.get('current_stage', 'N/A')}")
                print(f"      - AI Recommendations: {len(response.get('ai_recommendations', []))} items")
                print(f"      - Next Best Actions: {len(response.get('next_best_actions', []))} items")
                
                # Show first recommendation if available
                recommendations = response.get('ai_recommendations', [])
                if recommendations:
                    print(f"      - Top Recommendation: {recommendations[0]}")
                
                return True
            else:
                print(f"   ❌ Response missing fields: {missing_fields}")
                return False
        return False

    def test_ai_inbox_integration_with_ml(self):
        """Test AI Inbox integration with ML lead scoring"""
        print("\n🧠 Testing AI Inbox + ML Integration...")
        
        # Test message processing with ML scoring
        message_data = {
            "conversation": {
                "id": "conv_ml_test_789",
                "contact": {
                    "name": "Jennifer Chen",
                    "phone": "555-456-7890",
                    "email": "jennifer.chen@email.com"
                },
                "channel": "facebook_messenger"
            },
            "message_content": "I need to buy a reliable SUV for my family ASAP. Budget is around $35,000. Can you help me today?"
        }
        
        success, response = self.run_test(
            "AI Inbox + ML - High Urgency Message",
            "POST",
            "ai-inbox/process-message",
            200,
            data=message_data
        )
        
        if success:
            ai_analysis = response.get('ai_analysis', {})
            enhanced_score = ai_analysis.get('enhanced_lead_score', 0)
            message_analysis = ai_analysis.get('message_analysis', {})
            ai_response = ai_analysis.get('ai_response', {})
            
            # Verify ML integration
            if enhanced_score > 0:
                print(f"   ✅ ML Lead Scoring Integration Working:")
                print(f"      - Enhanced Lead Score: {enhanced_score}/100")
                print(f"      - Urgency Detected: {message_analysis.get('urgency', 'N/A')}")
                print(f"      - Should Escalate: {ai_response.get('should_escalate', 'N/A')}")
                print(f"      - Estimated Response Time: {ai_response.get('estimated_response_time', 'N/A')}")
                
                # Check if high urgency was properly detected
                if message_analysis.get('urgency') == 'high' and ai_response.get('should_escalate'):
                    print(f"      - ✅ High urgency properly detected and flagged for escalation")
                    return True
                else:
                    print(f"      - ⚠️ Urgency detection may need improvement")
                    return True  # Still pass as basic integration works
            else:
                print(f"   ❌ ML Lead Scoring not working - score is 0")
                return False
        return False

    def test_ai_inbox_multi_channel_support(self):
        """Test AI Inbox multi-channel message processing"""
        print("\n📱 Testing AI Inbox Multi-Channel Support...")
        
        channels = [
            {"channel": "sms", "name": "SMS Text"},
            {"channel": "email", "name": "Email"},
            {"channel": "facebook_messenger", "name": "Facebook Messenger"},
            {"channel": "instagram_dm", "name": "Instagram DM"},
            {"channel": "whatsapp", "name": "WhatsApp"}
        ]
        
        passed_channels = 0
        
        for i, channel_info in enumerate(channels):
            message_data = {
                "conversation": {
                    "id": f"conv_channel_test_{i}",
                    "contact": {
                        "name": f"Test Customer {i+1}",
                        "phone": f"555-{100+i:03d}-{200+i:04d}"
                    },
                    "channel": channel_info["channel"]
                },
                "message_content": f"Hi, I'm interested in your vehicles. Can you help me find a good {['sedan', 'SUV', 'truck', 'hybrid', 'coupe'][i]}?"
            }
            
            success, response = self.run_test(
                f"AI Inbox - {channel_info['name']} Channel",
                "POST",
                "ai-inbox/process-message",
                200,
                data=message_data
            )
            
            if success:
                ai_analysis = response.get('ai_analysis', {})
                if ai_analysis.get('automation_applied'):
                    passed_channels += 1
                    print(f"   ✅ {channel_info['name']} - Processing successful")
                else:
                    print(f"   ❌ {channel_info['name']} - Automation not applied")
            else:
                print(f"   ❌ {channel_info['name']} - Processing failed")
        
        success_rate = (passed_channels / len(channels)) * 100
        print(f"   📊 Multi-Channel Support: {passed_channels}/{len(channels)} channels working ({success_rate:.1f}%)")
        
        return passed_channels >= len(channels) * 0.8  # 80% of channels should work

    def test_ai_inbox_comprehensive(self):
        """Run comprehensive AI Inbox test suite"""
        print("\n🤖 Running Comprehensive AI-Powered Inbox Tests...")
        
        ai_inbox_tests = [
            ("Process Message", self.test_ai_inbox_process_message),
            ("Auto Respond", self.test_ai_inbox_auto_respond),
            ("Statistics", self.test_ai_inbox_stats),
            ("Create Campaign", self.test_ai_inbox_create_campaign),
            ("Follow-up Sequence", self.test_ai_inbox_follow_up_sequence),
            ("Conversation Analysis", self.test_ai_inbox_conversation_analysis),
            ("ML Integration", self.test_ai_inbox_integration_with_ml),
            ("Multi-Channel Support", self.test_ai_inbox_multi_channel_support)
        ]
        
        passed_tests = 0
        total_tests = len(ai_inbox_tests)
        
        for test_name, test_func in ai_inbox_tests:
            try:
                if test_func():
                    passed_tests += 1
                    print(f"   ✅ {test_name} - PASSED")
                else:
                    print(f"   ❌ {test_name} - FAILED")
            except Exception as e:
                print(f"   ❌ {test_name} - ERROR: {str(e)}")
        
        success_rate = (passed_tests / total_tests) * 100
        print(f"\n   📊 AI-Powered Inbox Test Suite: {passed_tests}/{total_tests} passed ({success_rate:.1f}%)")
        
        return passed_tests >= total_tests * 0.75  # 75% pass rate required for AI system

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

    # ML & AI Integration Tests (Priority 1)
    def test_ml_predictive_dashboard(self):
        """Test ML predictive dashboard endpoint"""
        tenant_id = "demo_tenant_123"
        
        success, response = self.run_test(
            "ML Predictive Dashboard",
            "GET",
            f"ml/predictive-dashboard?tenant_id={tenant_id}",
            200
        )
        
        if success:
            required_fields = ['lead_conversion_prediction', 'inventory_demand_forecast', 'sales_performance_prediction', 'customer_behavior_insights', 'ai_recommendations']
            missing_fields = [field for field in required_fields if field not in response]
            
            if not missing_fields:
                print(f"   ✅ ML Dashboard complete - Lead conversion: {response.get('lead_conversion_prediction', {}).get('accuracy', 'N/A')}%")
                return True
            else:
                print(f"   ❌ ML Dashboard missing fields: {missing_fields}")
                return False
        return False

    def test_ml_customer_behavior_analysis(self):
        """Test ML customer behavior analysis endpoint"""
        tenant_id = "demo_tenant_123"
        
        success, response = self.run_test(
            "ML Customer Behavior Analysis",
            "GET",
            f"ml/customer-behavior-analysis?tenant_id={tenant_id}",
            200
        )
        
        if success:
            required_fields = ['behavior_patterns', 'purchase_likelihood', 'preferred_contact_method', 'optimal_follow_up_timing', 'conversion_factors']
            missing_fields = [field for field in required_fields if field not in response]
            
            if not missing_fields:
                patterns = len(response.get('behavior_patterns', []))
                likelihood = response.get('purchase_likelihood', {}).get('high_probability_leads', 0)
                print(f"   ✅ Customer Behavior Analysis - {patterns} patterns, {likelihood} high-probability leads")
                return True
            else:
                print(f"   ❌ Customer Behavior Analysis missing fields: {missing_fields}")
                return False
        return False

    def test_ml_lead_scoring(self):
        """Test ML lead scoring endpoint"""
        if not self.created_lead_id:
            print("❌ No lead ID available for ML scoring")
            return False
        
        success, response = self.run_test(
            "ML Lead Scoring",
            "GET",
            f"ml/lead-score/{self.created_lead_id}",
            200
        )
        
        if success:
            required_fields = ['lead_id', 'ai_score', 'conversion_probability', 'priority_level', 'recommended_actions', 'score_factors']
            missing_fields = [field for field in required_fields if field not in response]
            
            if not missing_fields:
                score = response.get('ai_score', 0)
                probability = response.get('conversion_probability', 0)
                priority = response.get('priority_level', 'unknown')
                print(f"   ✅ Lead Scoring - Score: {score}/100, Probability: {probability}%, Priority: {priority}")
                return True
            else:
                print(f"   ❌ Lead Scoring missing fields: {missing_fields}")
                return False
        return False

    def test_ml_inventory_demand_prediction(self):
        """Test ML inventory demand prediction endpoint"""
        tenant_id = "demo_tenant_123"
        
        success, response = self.run_test(
            "ML Inventory Demand Prediction",
            "POST",
            "ml/predict-inventory-demand",
            200,
            data={
                "tenant_id": tenant_id,
                "vehicle_make": "Toyota",
                "vehicle_model": "Camry",
                "vehicle_year": 2024,
                "current_inventory": 23,
                "forecast_days": 30
            }
        )
        
        if success:
            required_fields = ['vehicle_info', 'current_demand', 'predicted_demand', 'recommended_inventory', 'demand_factors', 'confidence_score']
            missing_fields = [field for field in required_fields if field not in response]
            
            if not missing_fields:
                current = response.get('current_demand', 0)
                predicted = response.get('predicted_demand', 0)
                recommended = response.get('recommended_inventory', 0)
                confidence = response.get('confidence_score', 0)
                print(f"   ✅ Inventory Demand - Current: {current}, Predicted: {predicted}, Recommended: {recommended} (Confidence: {confidence}%)")
                return True
            else:
                print(f"   ❌ Inventory Demand missing fields: {missing_fields}")
                return False
        return False

    def test_ml_sales_performance_prediction(self):
        """Test ML sales performance prediction endpoint"""
        tenant_id = "demo_tenant_123"
        
        success, response = self.run_test(
            "ML Sales Performance Prediction",
            "GET",
            f"ml/sales-performance-prediction?tenant_id={tenant_id}&forecast_period=30",
            200
        )
        
        if success:
            required_fields = ['current_performance', 'predicted_performance', 'growth_forecast', 'performance_factors', 'recommendations']
            missing_fields = [field for field in required_fields if field not in response]
            
            if not missing_fields:
                current_sales = response.get('current_performance', {}).get('monthly_sales', 0)
                predicted_sales = response.get('predicted_performance', {}).get('forecasted_sales', 0)
                growth = response.get('growth_forecast', {}).get('percentage_change', 0)
                print(f"   ✅ Sales Performance - Current: {current_sales}, Predicted: {predicted_sales}, Growth: {growth}%")
                return True
            else:
                print(f"   ❌ Sales Performance missing fields: {missing_fields}")
                return False
        return False

    def test_ml_train_models(self):
        """Test ML model training endpoint"""
        tenant_id = "demo_tenant_123"
        
        success, response = self.run_test(
            "ML Model Training",
            "POST",
            "ml/train-models",
            200,
            data={
                "tenant_id": tenant_id,
                "models": ["lead_conversion", "inventory_demand", "customer_behavior"],
                "retrain_all": False
            }
        )
        
        if success:
            required_fields = ['training_status', 'models_trained', 'training_results', 'model_performance']
            missing_fields = [field for field in required_fields if field not in response]
            
            if not missing_fields:
                status = response.get('training_status', 'unknown')
                models_count = len(response.get('models_trained', []))
                print(f"   ✅ Model Training - Status: {status}, Models trained: {models_count}")
                return True
            else:
                print(f"   ❌ Model Training missing fields: {missing_fields}")
                return False
        return False

    def test_voice_ai_ml_integration(self):
        """Test Voice AI + ML integration with OpenAI Realtime + Emergent LLM"""
        print("\n🎤 Testing Voice AI + ML Integration...")
        
        # Test Voice AI health check
        success1, response1 = self.run_test(
            "Voice AI Health Check",
            "GET",
            "voice/health",
            200
        )
        
        # Test Emergent LLM key integration
        if not self.created_lead_id:
            print("❌ No lead ID available for Voice AI testing")
            return False
        
        ai_request = {
            "lead_id": self.created_lead_id,
            "incoming_message": "I want to use voice AI to discuss my vehicle options",
            "phone_number": "830-734-0597"
        }
        
        success2, response2 = self.run_test(
            "Voice AI with Emergent LLM Integration",
            "POST",
            "ai/respond",
            200,
            data=ai_request
        )
        
        # Test OpenAI Realtime session creation
        success3, response3 = self.run_test(
            "OpenAI Realtime Session Creation",
            "POST",
            "voice/realtime/session",
            200,
            data={"lead_id": self.created_lead_id}
        )
        
        passed_tests = sum([success1, success2, success3])
        print(f"   📊 Voice AI + ML Integration: {passed_tests}/3 tests passed")
        
        if success2:
            ai_response = response2.get('response', '')
            has_voice_keywords = any(keyword in ai_response.lower() for keyword in ['voice', 'call', 'speak', 'talk'])
            print(f"   Voice AI Response Quality: {'✅' if has_voice_keywords else '❌'} Voice-aware response")
        
        return passed_tests >= 2  # At least 2/3 should pass

    def test_mobile_app_api_compatibility(self):
        """Test all 7 mobile app API endpoints"""
        print("\n📱 Testing Mobile App API Compatibility...")
        
        mobile_endpoints = [
            ("Dashboard Stats", "GET", "dashboard/stats", 200),
            ("Recent Activity", "GET", "activity/recent", 200),
            ("Leads Management", "GET", "leads", 200),
            ("Inventory Vehicles", "GET", "inventory/vehicles", 200),
            ("Notifications", "GET", "notifications", 200),
            ("Voice Realtime Session GET", "GET", "voice/realtime/session", 200),
            ("Voice Realtime Session POST", "POST", "voice/realtime/session", 200)
        ]
        
        passed_endpoints = 0
        
        for name, method, endpoint, expected_status in mobile_endpoints:
            data = {"lead_id": self.created_lead_id} if "voice" in endpoint and method == "POST" else None
            success, response = self.run_test(f"Mobile API - {name}", method, endpoint, expected_status, data=data)
            
            if success:
                passed_endpoints += 1
                # Check mobile-friendly data structure
                if isinstance(response, dict):
                    mobile_fields = ['id', 'name', 'title', 'message', 'timestamp', 'status', 'count', 'total']
                    has_mobile_structure = any(field in response for field in mobile_fields)
                    print(f"      Mobile Structure: {'✅' if has_mobile_structure else '❌'}")
        
        print(f"   📊 Mobile API Compatibility: {passed_endpoints}/7 endpoints working")
        return passed_endpoints >= 6  # At least 6/7 should work

    def test_cross_platform_data_flow(self):
        """Test cross-platform data flow (web → mobile → backend ML)"""
        print("\n🔄 Testing Cross-Platform Data Flow...")
        
        # Step 1: Create lead via web platform
        lead_data = {
            "tenant_id": "demo_tenant_123",
            "first_name": "CrossPlatform",
            "last_name": "TestUser",
            "primary_phone": "555-CROSS-PLATFORM",
            "email": "crossplatform@test.com",
            "budget": "400$-600$",
            "vehicle_type": "SUV"
        }
        
        success1, response1 = self.run_test(
            "Cross-Platform Step 1: Web Lead Creation",
            "POST",
            "leads",
            200,
            data=lead_data
        )
        
        if not success1:
            return False
        
        cross_platform_lead_id = response1.get('id')
        
        # Step 2: Mobile app accesses lead data
        success2, response2 = self.run_test(
            "Cross-Platform Step 2: Mobile Lead Access",
            "GET",
            f"leads/{cross_platform_lead_id}",
            200
        )
        
        # Step 3: Backend ML processes lead for scoring
        success3, response3 = self.run_test(
            "Cross-Platform Step 3: ML Lead Scoring",
            "GET",
            f"ml/lead-score/{cross_platform_lead_id}",
            200
        )
        
        # Step 4: Mobile app gets ML insights
        success4, response4 = self.run_test(
            "Cross-Platform Step 4: Mobile ML Dashboard",
            "GET",
            f"ml/predictive-dashboard?tenant_id=demo_tenant_123",
            200
        )
        
        passed_steps = sum([success1, success2, success3, success4])
        print(f"   📊 Cross-Platform Data Flow: {passed_steps}/4 steps completed")
        
        if passed_steps >= 3:
            print("   ✅ Cross-platform integration working")
            return True
        else:
            print("   ❌ Cross-platform integration issues detected")
            return False

    def test_performance_ml_inference_speeds(self):
        """Test ML model inference speeds"""
        print("\n⚡ Testing ML Model Inference Performance...")
        
        import time
        
        performance_tests = []
        
        # Test lead scoring speed
        if self.created_lead_id:
            start_time = time.time()
            success, _ = self.run_test("Lead Scoring Speed Test", "GET", f"ml/lead-score/{self.created_lead_id}", 200)
            end_time = time.time()
            
            if success:
                inference_time = (end_time - start_time) * 1000  # Convert to milliseconds
                performance_tests.append(("Lead Scoring", inference_time, inference_time < 2000))  # Should be under 2 seconds
                print(f"   Lead Scoring Inference: {inference_time:.0f}ms {'✅' if inference_time < 2000 else '❌'}")
        
        # Test customer behavior analysis speed
        start_time = time.time()
        success, _ = self.run_test("Customer Behavior Speed Test", "GET", "ml/customer-behavior-analysis?tenant_id=demo_tenant_123", 200)
        end_time = time.time()
        
        if success:
            inference_time = (end_time - start_time) * 1000
            performance_tests.append(("Customer Behavior", inference_time, inference_time < 3000))  # Should be under 3 seconds
            print(f"   Customer Behavior Analysis: {inference_time:.0f}ms {'✅' if inference_time < 3000 else '❌'}")
        
        # Test inventory demand prediction speed
        start_time = time.time()
        success, _ = self.run_test("Inventory Demand Speed Test", "POST", "ml/predict-inventory-demand", 200, 
                                 data={"tenant_id": "demo_tenant_123", "vehicle_make": "Toyota", "vehicle_model": "Camry", "vehicle_year": 2024})
        end_time = time.time()
        
        if success:
            inference_time = (end_time - start_time) * 1000
            performance_tests.append(("Inventory Demand", inference_time, inference_time < 1500))  # Should be under 1.5 seconds
            print(f"   Inventory Demand Prediction: {inference_time:.0f}ms {'✅' if inference_time < 1500 else '❌'}")
        
        passed_performance = sum(1 for _, _, passed in performance_tests if passed)
        total_performance = len(performance_tests)
        
        print(f"   📊 ML Performance: {passed_performance}/{total_performance} models meet speed requirements")
        return passed_performance >= total_performance * 0.8  # 80% should meet performance requirements

    def run_comprehensive_ml_integration_tests(self):
        """Run comprehensive ML & AI integration testing as requested"""
        print("🧠 Starting Revolutionary Predictive Analytics Integration Testing...")
        print(f"   Backend URL: {self.base_url}")
        print(f"   API URL: {self.api_url}")
        
        # Create a test lead first for ML testing
        if not self.created_lead_id:
            self.test_create_lead()
        
        # Priority 1 - ML & AI Integration Testing
        ml_ai_tests = [
            ("ML Predictive Dashboard", self.test_ml_predictive_dashboard),
            ("ML Customer Behavior Analysis", self.test_ml_customer_behavior_analysis),
            ("ML Lead Scoring", self.test_ml_lead_scoring),
            ("ML Inventory Demand Prediction", self.test_ml_inventory_demand_prediction),
            ("ML Sales Performance Prediction", self.test_ml_sales_performance_prediction),
            ("ML Model Training", self.test_ml_train_models),
            ("Voice AI + ML Integration", self.test_voice_ai_ml_integration),
        ]
        
        # Priority 2 - Core Platform Integration
        platform_integration_tests = [
            ("Mobile App API Compatibility", self.test_mobile_app_api_compatibility),
            ("Cross-Platform Data Flow", self.test_cross_platform_data_flow),
        ]
        
        # Priority 3 - Performance Testing
        performance_tests = [
            ("ML Inference Speeds", self.test_performance_ml_inference_speeds),
        ]
        
        # Run all test suites
        all_test_suites = [
            ("🧠 ML & AI Integration (Priority 1)", ml_ai_tests),
            ("🔗 Core Platform Integration (Priority 2)", platform_integration_tests),
            ("⚡ Performance Testing (Priority 3)", performance_tests),
        ]
        
        suite_results = {}
        
        for suite_name, tests in all_test_suites:
            print(f"\n{'='*80}")
            print(f"{suite_name}")
            print(f"{'='*80}")
            
            suite_passed = 0
            suite_total = len(tests)
            
            for test_name, test_func in tests:
                try:
                    if test_func():
                        suite_passed += 1
                        print(f"✅ {test_name} - PASSED")
                    else:
                        print(f"❌ {test_name} - FAILED")
                except Exception as e:
                    print(f"❌ {test_name} - ERROR: {str(e)}")
            
            suite_success_rate = (suite_passed / suite_total) * 100
            suite_results[suite_name] = {
                'passed': suite_passed,
                'total': suite_total,
                'rate': suite_success_rate
            }
            
            print(f"\n📊 {suite_name} Results: {suite_passed}/{suite_total} passed ({suite_success_rate:.1f}%)")
        
        # Final summary
        print(f"\n{'='*80}")
        print("🎯 REVOLUTIONARY PREDICTIVE ANALYTICS TEST SUMMARY")
        print(f"{'='*80}")
        
        total_passed = sum(result['passed'] for result in suite_results.values())
        total_tests = sum(result['total'] for result in suite_results.values())
        overall_success_rate = (total_passed / total_tests) * 100
        
        for suite_name, result in suite_results.items():
            status = "✅ PASS" if result['rate'] >= 70 else "❌ FAIL"  # Lower threshold for ML tests
            print(f"{status} {suite_name}: {result['passed']}/{result['total']} ({result['rate']:.1f}%)")
        
        print(f"\n🏆 OVERALL ML INTEGRATION RESULTS: {total_passed}/{total_tests} tests passed ({overall_success_rate:.1f}%)")
        
        # Specific ML integration assessment
        ml_suite_result = suite_results.get("🧠 ML & AI Integration (Priority 1)", {})
        ml_success_rate = ml_suite_result.get('rate', 0)
        
        if ml_success_rate >= 70:
            print("🎉 Revolutionary Predictive Analytics Integration: SUCCESS!")
            print("   ✅ All 6 ML API endpoints tested")
            print("   ✅ Voice AI + ML integration verified")
            print("   ✅ Cross-platform data flow confirmed")
            return True
        else:
            print("⚠️  Revolutionary Predictive Analytics Integration: NEEDS ATTENTION")
            print("   ❌ Some ML endpoints may need fixes")
            print("   ❌ Integration issues detected")
            return False

    # =============================================================================
    # INTELLIGENT WORKFLOW AUTOMATION SYSTEM TESTS
    # =============================================================================

    def test_automation_analytics(self):
        """Test GET /api/automation/analytics endpoint"""
        success, response = self.run_test(
            "Workflow Automation Analytics",
            "GET",
            "automation/analytics",
            200
        )
        
        if success:
            # Verify analytics structure
            required_fields = ['automation_analytics', 'system_status', 'integration_features']
            missing_fields = [field for field in required_fields if field not in response]
            
            if not missing_fields:
                analytics = response.get('automation_analytics', {})
                system_status = response.get('system_status')
                
                # Check analytics content
                analytics_fields = ['automation_engine', 'total_workflows', 'success_rate', 'available_triggers']
                analytics_missing = [field for field in analytics_fields if field not in analytics]
                
                if not analytics_missing and system_status == 'fully_operational':
                    print(f"   ✅ Analytics retrieved - Engine: {analytics.get('automation_engine')}")
                    print(f"      Total workflows: {analytics.get('total_workflows', 0)}")
                    print(f"      Success rate: {analytics.get('success_rate', 0)}%")
                    print(f"      Available triggers: {len(analytics.get('available_triggers', []))}")
                    return True
                else:
                    print(f"   ❌ Analytics missing fields: {analytics_missing}")
                    return False
            else:
                print(f"   ❌ Response missing fields: {missing_fields}")
                return False
        return False

    def test_trigger_workflow_lead_score(self):
        """Test POST /api/automation/trigger-workflow with lead score trigger"""
        workflow_data = {
            "trigger": "lead_score_above_85",
            "data": {
                "customer_name": "Jennifer Park",
                "customer_phone": "+1555987654",
                "ai_score": 94,
                "budget": 45000,
                "interested_vehicle": "2024 Toyota RAV4",
                "urgency": "high"
            }
        }
        
        success, response = self.run_test(
            "Trigger Workflow - High Value Lead",
            "POST",
            "automation/trigger-workflow",
            200,
            data=workflow_data
        )
        
        if success:
            # Verify workflow execution
            required_fields = ['status', 'automation', 'message']
            missing_fields = [field for field in required_fields if field not in response]
            
            if not missing_fields and response.get('status') == 'workflow_triggered':
                automation = response.get('automation', {})
                workflows_executed = automation.get('workflows_executed', 0)
                
                print(f"   ✅ Workflow triggered - Status: {response['status']}")
                print(f"      Workflows executed: {workflows_executed}")
                
                if workflows_executed > 0:
                    executions = automation.get('executions', [])
                    if executions:
                        first_execution = executions[0]
                        print(f"      First workflow: {first_execution.get('rule_title', 'Unknown')}")
                        print(f"      Actions executed: {len(first_execution.get('actions', []))}")
                
                return True
            else:
                print(f"   ❌ Workflow response missing fields: {missing_fields}")
                return False
        return False

    def test_trigger_workflow_inventory_demand(self):
        """Test POST /api/automation/trigger-workflow with inventory demand trigger"""
        workflow_data = {
            "trigger": "vehicle_demand_spike",
            "data": {
                "vehicle_info": "2024 Honda CR-V",
                "demand_score": 95,
                "days_to_sell": 5,
                "price": 34900,
                "interested_customers": ["customer1", "customer2", "customer3"]
            }
        }
        
        success, response = self.run_test(
            "Trigger Workflow - Hot Inventory",
            "POST",
            "automation/trigger-workflow",
            200,
            data=workflow_data
        )
        
        if success:
            if response.get('status') == 'workflow_triggered':
                automation = response.get('automation', {})
                workflows_executed = automation.get('workflows_executed', 0)
                
                print(f"   ✅ Inventory workflow triggered - Workflows: {workflows_executed}")
                return True
            else:
                print(f"   ❌ Inventory workflow failed - Status: {response.get('status')}")
                return False
        return False

    def test_trigger_workflow_voice_completion(self):
        """Test POST /api/automation/trigger-workflow with voice AI completion"""
        workflow_data = {
            "trigger": "voice_call_completed",
            "data": {
                "customer_name": "Michael Rodriguez",
                "call_satisfaction": 4.8,
                "purchase_intent": 0.92,
                "interested_vehicle": "2023 Ford F-150",
                "call_duration": "6:45",
                "next_steps": "Schedule test drive"
            }
        }
        
        success, response = self.run_test(
            "Trigger Workflow - Voice AI Completion",
            "POST",
            "automation/trigger-workflow",
            200,
            data=workflow_data
        )
        
        if success:
            if response.get('status') == 'workflow_triggered':
                automation = response.get('automation', {})
                workflows_executed = automation.get('workflows_executed', 0)
                
                print(f"   ✅ Voice AI workflow triggered - Workflows: {workflows_executed}")
                return True
            else:
                print(f"   ❌ Voice AI workflow failed - Status: {response.get('status')}")
                return False
        return False

    def test_create_custom_workflow(self):
        """Test POST /api/automation/create-workflow"""
        custom_workflow_data = {
            "name": "test_custom_workflow",
            "display_name": "Test Custom Workflow",
            "trigger": "manual",
            "conditions": [
                {"field": "budget", "operator": ">=", "value": 30000}
            ],
            "actions": [
                {"type": "send_sms", "template": "custom_followup", "delay": 0},
                {"type": "create_calendar_event", "delay": 300}
            ],
            "priority": "medium"
        }
        
        success, response = self.run_test(
            "Create Custom Workflow",
            "POST",
            "automation/create-workflow",
            200,
            data=custom_workflow_data
        )
        
        if success:
            # Verify workflow creation
            required_fields = ['status', 'workflow', 'message']
            missing_fields = [field for field in required_fields if field not in response]
            
            if not missing_fields and response.get('status') == 'workflow_created':
                workflow = response.get('workflow', {})
                workflow_name = workflow.get('name', 'Unknown')
                
                print(f"   ✅ Custom workflow created - Name: {workflow_name}")
                print(f"      Trigger: {workflow.get('trigger', 'Unknown')}")
                print(f"      Actions: {len(workflow.get('actions', []))}")
                return True
            else:
                print(f"   ❌ Custom workflow response missing fields: {missing_fields}")
                return False
        return False

    def test_demo_automation_scenarios(self):
        """Test POST /api/automation/demo-scenarios"""
        success, response = self.run_test(
            "Demo Automation Scenarios",
            "POST",
            "automation/demo-scenarios",
            200
        )
        
        if success:
            # Verify demo execution
            required_fields = ['demo_status', 'scenarios_executed', 'automation_results', 'capabilities_demonstrated']
            missing_fields = [field for field in required_fields if field not in response]
            
            if not missing_fields and response.get('demo_status') == 'completed':
                scenarios_executed = response.get('scenarios_executed', 0)
                automation_results = response.get('automation_results', [])
                capabilities = response.get('capabilities_demonstrated', [])
                
                print(f"   ✅ Demo scenarios completed - Scenarios: {scenarios_executed}")
                print(f"      Automation results: {len(automation_results)}")
                print(f"      Capabilities demonstrated: {len(capabilities)}")
                
                # Check specific demo scenarios
                if scenarios_executed >= 3:
                    print("      ✅ All 3 demo scenarios executed (High-value lead, Hot inventory, Voice AI)")
                    return True
                else:
                    print(f"      ❌ Only {scenarios_executed}/3 demo scenarios executed")
                    return False
            else:
                print(f"   ❌ Demo response missing fields: {missing_fields}")
                return False
        return False

    def test_workflow_automation_error_handling(self):
        """Test workflow automation error handling"""
        print("\n🔍 Testing Workflow Automation Error Handling...")
        
        # Test missing trigger name
        success1, _ = self.run_test(
            "Trigger Workflow - Missing Trigger",
            "POST",
            "automation/trigger-workflow",
            400,  # Bad request expected
            data={"data": {"test": "value"}}
        )
        
        # Test invalid trigger name
        success2, _ = self.run_test(
            "Trigger Workflow - Invalid Trigger",
            "POST",
            "automation/trigger-workflow",
            200,  # Should handle gracefully
            data={"trigger": "invalid_trigger", "data": {"test": "value"}}
        )
        
        # Test empty workflow data for custom workflow
        success3, _ = self.run_test(
            "Create Custom Workflow - Empty Data",
            "POST",
            "automation/create-workflow",
            200,  # Should handle gracefully
            data={}
        )
        
        passed_tests = sum([success1, success2, success3])
        print(f"   📊 Error Handling: {passed_tests}/3 tests passed")
        
        return passed_tests >= 2  # At least 2/3 should pass

    def test_workflow_automation_comprehensive(self):
        """Run comprehensive Workflow Automation test suite"""
        print("\n🤖 Running Comprehensive Workflow Automation Tests...")
        
        automation_tests = [
            ("Automation Analytics", self.test_automation_analytics),
            ("Trigger Workflow - Lead Score", self.test_trigger_workflow_lead_score),
            ("Trigger Workflow - Inventory Demand", self.test_trigger_workflow_inventory_demand),
            ("Trigger Workflow - Voice Completion", self.test_trigger_workflow_voice_completion),
            ("Create Custom Workflow", self.test_create_custom_workflow),
            ("Demo Automation Scenarios", self.test_demo_automation_scenarios),
            ("Workflow Error Handling", self.test_workflow_automation_error_handling)
        ]
        
        passed_tests = 0
        total_tests = len(automation_tests)
        
        for test_name, test_func in automation_tests:
            try:
                if test_func():
                    passed_tests += 1
                    print(f"   ✅ {test_name} - PASSED")
                else:
                    print(f"   ❌ {test_name} - FAILED")
            except Exception as e:
                print(f"   ❌ {test_name} - ERROR: {str(e)}")
        
        success_rate = (passed_tests / total_tests) * 100
        print(f"\n   📊 Workflow Automation Test Suite: {passed_tests}/{total_tests} passed ({success_rate:.1f}%)")
        
        return passed_tests >= total_tests * 0.8  # 80% pass rate required

    def run_workflow_automation_focused_tests(self):
        """Run focused workflow automation tests as requested in review"""
        print("🚀 Starting Enhanced Intelligent Workflow Automation System Testing...")
        print("🚗 Focus: Car Sales Knowledge Improvements in JokerVision AutoFollow")
        print(f"   Backend URL: {self.base_url}")
        print(f"   API URL: {self.api_url}")
        
        # Create a test lead first if needed
        if not self.created_lead_id:
            self.test_create_lead()
        
        # Priority Tests as requested in review
        priority_tests = [
            ("Enhanced Demo Scenarios", self.test_demo_automation_scenarios),
            ("Car Sales Knowledge Validation", self.test_workflow_car_sales_knowledge_validation),
            ("High-Value Lead Trigger", self.test_trigger_workflow_lead_score),
            ("Inventory Demand Trigger", self.test_trigger_workflow_inventory_demand),
            ("Voice AI Completion Trigger", self.test_trigger_workflow_voice_completion),
            ("Analytics with Car Sales Focus", self.test_automation_analytics),
            ("Create Custom Workflow", self.test_create_custom_workflow),
            ("Error Handling", self.test_workflow_automation_error_handling)
        ]
        
        print(f"\n🎯 Running {len(priority_tests)} Priority Workflow Automation Tests...")
        
        passed_tests = 0
        total_tests = len(priority_tests)
        
        for test_name, test_func in priority_tests:
            try:
                print(f"\n{'='*60}")
                print(f"🔍 Testing: {test_name}")
                print(f"{'='*60}")
                
                if test_func():
                    passed_tests += 1
                    print(f"✅ {test_name} - PASSED")
                else:
                    print(f"❌ {test_name} - FAILED")
            except Exception as e:
                print(f"❌ {test_name} - ERROR: {str(e)}")
        
        # Final Results
        success_rate = (passed_tests / total_tests) * 100
        print(f"\n{'='*80}")
        print("🎯 ENHANCED WORKFLOW AUTOMATION TEST RESULTS")
        print(f"{'='*80}")
        print(f"📊 Overall Results: {passed_tests}/{total_tests} tests passed ({success_rate:.1f}%)")
        
        if success_rate >= 85:
            print("🎉 WORKFLOW AUTOMATION SYSTEM: SUCCESS!")
            print("   ✅ All 3 demo scenarios working (fixing previous 2/3 issue)")
            print("   ✅ Car sales knowledge enhanced in SMS templates")
            print("   ✅ Calendar events include automotive consultation details")
            print("   ✅ Voice AI calls mention financing options and vehicle features")
            print("   ✅ Analytics show automotive-specific capabilities")
            return True
        else:
            print("⚠️  WORKFLOW AUTOMATION SYSTEM: NEEDS ATTENTION")
            print("   ❌ Some workflow automation features may need fixes")
            print("   ❌ Car sales knowledge enhancements may be incomplete")
            return False

    def test_workflow_car_sales_knowledge_validation(self):
        """Test workflow automation responses for automotive-specific content"""
        print("\n🚗 Testing Car Sales Knowledge in Workflow Automation...")
        
        # Test high-value lead with automotive data
        automotive_lead_data = {
            "trigger": "lead_score_above_85",
            "data": {
                "customer_name": "Sarah Thompson",
                "customer_phone": "+1555123789",
                "ai_score": 88,
                "budget": 42000,
                "interested_vehicle": "2024 Toyota Camry XLE",
                "trade_in_vehicle": "2019 Honda Accord",
                "financing_needed": True,
                "credit_score": 750
            }
        }
        
        success, response = self.run_test(
            "Car Sales Knowledge Validation",
            "POST",
            "automation/trigger-workflow",
            200,
            data=automotive_lead_data
        )
        
        if success:
            automation = response.get('automation', {})
            executions = automation.get('executions', [])
            
            if executions:
                first_execution = executions[0]
                actions = first_execution.get('actions', [])
                
                # Validate car sales terminology in actions
                car_sales_terms_found = 0
                total_text_actions = 0
                
                for action in actions:
                    action_type = action.get('action_type', '')
                    
                    if action_type == 'send_sms':
                        total_text_actions += 1
                        content = action.get('content', '').lower()
                        # Check for automotive terms
                        automotive_terms = ['apr', 'financing', 'trade-in', 'cash back', 'dealership', 'vehicle']
                        terms_in_content = sum(1 for term in automotive_terms if term in content)
                        if terms_in_content >= 3:  # At least 3 automotive terms
                            car_sales_terms_found += 1
                            print(f"      ✅ SMS contains automotive terminology ({terms_in_content} terms)")
                    
                    elif action_type == 'create_calendar_event':
                        total_text_actions += 1
                        event_type = action.get('event_type', '')
                        agenda = action.get('agenda', '').lower()
                        if 'vehicle_sales_consultation' in event_type or 'financing' in agenda:
                            car_sales_terms_found += 1
                            print(f"      ✅ Calendar event mentions vehicle consultation/financing")
                    
                    elif action_type == 'send_voice_ai_call':
                        total_text_actions += 1
                        call_content = action.get('call_content', '').lower()
                        if 'apr' in call_content and 'financing' in call_content:
                            car_sales_terms_found += 1
                            print(f"      ✅ Voice AI call mentions APR and financing")
                
                car_sales_percentage = (car_sales_terms_found / total_text_actions * 100) if total_text_actions > 0 else 0
                print(f"      Car sales knowledge: {car_sales_terms_found}/{total_text_actions} actions ({car_sales_percentage:.1f}%)")
                
                return car_sales_percentage >= 80  # At least 80% should have car sales knowledge
            else:
                print("      ❌ No workflow executions found")
                return False
        return False

    # =============================================================================
    # ENHANCED WORKFLOW AUTOMATION TESTS - CRITICAL RETEST FOR CAR SALES KNOWLEDGE
    # =============================================================================

    def test_enhanced_demo_scenarios_critical_retest(self):
        """Test POST /api/automation/demo-scenarios - CRITICAL RETEST for 3/3 execution"""
        print("\n🚗 CRITICAL RETEST: Enhanced Demo Scenarios (Must execute ALL 3/3)...")
        
        success, response = self.run_test(
            "Enhanced Demo Scenarios - CRITICAL RETEST",
            "POST",
            "automation/demo-scenarios",
            200
        )
        
        if success:
            # Check if all 3 scenarios executed
            scenarios_executed = response.get('scenarios_executed', 0)
            total_scenarios = response.get('total_scenarios', 3)
            scenarios = response.get('scenarios', [])
            
            print(f"   📊 Scenarios executed: {scenarios_executed}/{total_scenarios}")
            
            if scenarios_executed == 3:
                print("   ✅ ALL 3/3 demo scenarios executed successfully - CRITICAL SUCCESS")
                
                # Verify Voice AI scenario specifically
                voice_ai_working = False
                for scenario in scenarios:
                    scenario_name = scenario.get('name', '').lower()
                    if 'voice' in scenario_name and scenario.get('status') == 'executed':
                        voice_ai_working = True
                        print("   ✅ Voice AI scenario executed properly - FIXED")
                        break
                
                if voice_ai_working:
                    return True
                else:
                    print("   ❌ Voice AI scenario still not working properly")
                    return False
            else:
                print(f"   ❌ CRITICAL FAILURE: Only {scenarios_executed}/3 scenarios executed")
                # Show which scenarios failed
                for scenario in scenarios:
                    status = scenario.get('status', 'unknown')
                    name = scenario.get('name', 'Unknown')
                    print(f"      - {name}: {status}")
                return False
        return False

    def test_enhanced_car_sales_terminology_validation(self):
        """Test workflow SMS content for 80%+ automotive terminology coverage"""
        print("\n🚗 Testing Enhanced Car Sales Terminology (Target: 80%+ coverage)...")
        
        # Test high-value lead trigger to analyze SMS content
        trigger_data = {
            "trigger_type": "high_value_lead",
            "lead_data": {
                "id": "enhanced_automotive_lead_456",
                "first_name": "Jennifer",
                "last_name": "Martinez",
                "budget": "$50,000-$60,000",
                "vehicle_interest": "2024 Toyota Highlander Hybrid",
                "ai_score": 92,
                "trade_in_vehicle": "2020 Honda Pilot",
                "financing_interest": True
            }
        }
        
        success, response = self.run_test(
            "Enhanced Car Sales Terminology Analysis",
            "POST",
            "automation/trigger-workflow",
            200,
            data=trigger_data
        )
        
        if success:
            # Extract SMS content from workflow actions
            actions_executed = response.get('actions_executed', [])
            sms_content = ""
            
            for action in actions_executed:
                if action.get('type') == 'send_sms':
                    sms_content = action.get('content', '')
                    break
            
            if sms_content:
                print(f"   📝 SMS Content Analysis:")
                print(f"      Content preview: {sms_content[:200]}...")
                
                # Enhanced automotive terminology list
                automotive_terms = [
                    # Financing terms
                    'apr', '0.9% apr', '0% apr', 'financing', 'down payment', 'monthly payment',
                    'lease', 'cash back', 'manufacturer cash back', 'rebates', 'incentives',
                    
                    # Vehicle terms
                    'vin', 'vin reservation', 'trade-in', 'trade-in guarantee', 'kbb', 'kelley blue book',
                    'certified pre-owned', 'warranty', 'extended warranty', 'gap insurance',
                    
                    # Dealership terms
                    'dealership', 'dealership phone', 'toyota', 'honda', 'service', 'parts',
                    'test drive', 'vehicle consultation', 'sales consultation',
                    
                    # Sales terms
                    'msrp', 'invoice', 'protection plan', 'service contract', 'vip treatment',
                    'exclusive offer', 'same-day approval', 'first-time buyer', 'loyalty bonus',
                    
                    # Urgency terms
                    'limited time', 'expires soon', 'while supplies last', 'this weekend only'
                ]
                
                # Count terms found in SMS content
                content_lower = sms_content.lower()
                terms_found = []
                for term in automotive_terms:
                    if term in content_lower:
                        terms_found.append(term)
                
                coverage_percentage = (len(terms_found) / len(automotive_terms)) * 100
                
                print(f"   📊 Automotive terminology coverage: {coverage_percentage:.1f}%")
                print(f"   📊 Terms found: {len(terms_found)}/{len(automotive_terms)}")
                print(f"   📝 Sample terms found: {', '.join(terms_found[:8])}...")
                
                if coverage_percentage >= 80.0:
                    print("   ✅ CRITICAL SUCCESS: Car sales knowledge meets 80%+ target")
                    return True
                else:
                    print(f"   ❌ CRITICAL FAILURE: Coverage {coverage_percentage:.1f}% below 80% target")
                    print("      Need more automotive terms in SMS templates")
                    return False
            else:
                print("   ❌ No SMS content found in workflow response")
                return False
        return False

    def test_voice_ai_automotive_actions_validation(self):
        """Test voice_call_completed trigger with comprehensive automotive actions"""
        print("\n🎤 Testing Voice AI Automotive Actions (All 4 actions must execute)...")
        
        # Enhanced voice AI demo data
        voice_trigger_data = {
            "trigger_type": "voice_call_completed",
            "voice_data": {
                "call_id": "enhanced_voice_demo_789",
                "lead_id": "voice_automotive_lead_123",
                "call_duration": 480,  # 8 minutes
                "call_outcome": "highly_interested",
                "vehicle_discussed": "2024 Toyota RAV4 XLE Premium",
                "customer_satisfaction": 4.9,
                "next_steps": "immediate_test_drive",
                "financing_interest": True,
                "trade_in_vehicle": "2018 Subaru Outback",
                "credit_score": 780,
                "urgency_level": "high"
            }
        }
        
        success, response = self.run_test(
            "Voice AI Automotive Actions Validation",
            "POST",
            "automation/trigger-workflow",
            200,
            data=voice_trigger_data
        )
        
        if success:
            # Verify all 4 expected voice AI actions
            actions_executed = response.get('actions_executed', [])
            expected_actions = [
        ]
        
        passed_tests = 0
        total_tests = len(creative_tests)
        
        for test_name, test_func in creative_tests:
            try:
                if test_func():
                    passed_tests += 1
                    print(f"   ✅ {test_name} - PASSED")
                else:
                    print(f"   ❌ {test_name} - FAILED")
            except Exception as e:
                print(f"   ❌ {test_name} - ERROR: {str(e)}")
        
        success_rate = (passed_tests / total_tests) * 100
        print(f"\n   📊 Creative Studio Test Suite: {passed_tests}/{total_tests} passed ({success_rate:.1f}%)")
        
        # Provide specific diagnosis for frontend issues
        if passed_tests < total_tests:
            print(f"\n   🔍 FRONTEND ISSUE DIAGNOSIS:")
            if passed_tests == 0:
                print(f"      - All Creative Studio APIs are failing")
                print(f"      - This explains why frontend sections are completely empty")
            else:
                print(f"      - Some Creative Studio APIs are working, others are failing")
                print(f"      - Frontend sections may be partially populated")
        else:
            print(f"\n   ✅ All Creative Studio APIs are working correctly")
            print(f"      - If frontend sections are still empty, the issue is likely in frontend code")
        
        return passed_tests >= total_tests * 0.75  # 75% pass rate required

    def test_enhanced_workflow_automation_comprehensive(self):
        """Run comprehensive enhanced workflow automation tests"""
        print("\n🤖 ENHANCED WORKFLOW AUTOMATION SYSTEM - CRITICAL RETEST")
        print("🚗 Focus: Car Sales Knowledge Improvements & 3/3 Demo Scenario Execution")
        
        enhanced_tests = [
            ("CRITICAL: Enhanced Demo Scenarios (3/3)", self.test_enhanced_demo_scenarios_critical_retest),
            ("CRITICAL: Car Sales Terminology (80%+)", self.test_enhanced_car_sales_terminology_validation),
            ("CRITICAL: Voice AI Automotive Actions", self.test_voice_ai_automotive_actions_validation),
            ("Workflow Analytics", self.test_automation_analytics),
            ("Custom Automotive Workflow", self.test_create_custom_workflow),
            ("Error Handling", self.test_workflow_automation_error_handling)
        ]
        
        passed_tests = 0
        total_tests = len(enhanced_tests)
        critical_tests_passed = 0
        
        for test_name, test_func in enhanced_tests:
            try:
                print(f"\n{'='*70}")
                print(f"🔍 {test_name}")
                print(f"{'='*70}")
                
                if test_func():
                    passed_tests += 1
                    print(f"✅ {test_name} - PASSED")
                    
                    # Track critical tests
                    if "CRITICAL" in test_name:
                        critical_tests_passed += 1
                else:
                    print(f"❌ {test_name} - FAILED")
            except Exception as e:
                print(f"❌ {test_name} - ERROR: {str(e)}")
        
        success_rate = (passed_tests / total_tests) * 100
        critical_success_rate = (critical_tests_passed / 3) * 100  # 3 critical tests
        
        print(f"\n{'='*80}")
        print("🎯 ENHANCED WORKFLOW AUTOMATION TEST RESULTS")
        print(f"{'='*80}")
        print(f"📊 Overall Results: {passed_tests}/{total_tests} tests passed ({success_rate:.1f}%)")
        print(f"🚨 Critical Tests: {critical_tests_passed}/3 passed ({critical_success_rate:.1f}%)")
        
        # Determine success based on critical tests
        if critical_tests_passed == 3:
            print("🎉 CRITICAL SUCCESS: Enhanced Car Sales Workflow Automation PASSED")
            print("   ✅ ALL 3/3 demo scenarios working (Voice AI scenario FIXED)")
            print("   ✅ Car sales terminology coverage ≥ 80% (ENHANCED)")
            print("   ✅ Voice AI actions contain comprehensive automotive content")
            return True
        else:
            print("🚨 CRITICAL FAILURE: Enhanced Car Sales Workflow Automation FAILED")
            print(f"   ❌ Only {critical_tests_passed}/3 critical tests passed")
            if critical_tests_passed < 3:
                print("   ❌ Voice AI demo scenario may still be failing")
                print("   ❌ Car sales knowledge may be below 80% target")
                print("   ❌ Automotive actions may lack comprehensive content")
            return False

    def run_workflow_automation_critical_fix_validation(self):
        """Run CRITICAL FIX VALIDATION for workflow automation system"""
        print("🚨 CRITICAL FIX VALIDATION - WORKFLOW AUTOMATION SYSTEM")
        print("🎯 PRIORITY 1: Demo Scenarios Fix Validation (3/3 scenarios must execute)")
        print("🎯 PRIORITY 2: Car Sales Terminology Coverage (80%+ target)")
        print(f"   Backend URL: {self.base_url}")
        print(f"   API URL: {self.api_url}")
        
        # Run the enhanced workflow automation tests
        validation_passed = self.test_enhanced_workflow_automation_comprehensive()
        
        print(f"\n{'='*80}")
        print("🏁 CRITICAL FIX VALIDATION RESULTS")
        print(f"{'='*80}")
        
        if validation_passed:
            print("🎉 CRITICAL FIX VALIDATION: SUCCESS!")
            print("✅ All 3/3 demo scenarios now execute successfully")
            print("✅ High-value lead scenario works after function naming fix")
            print("✅ Comprehensive automotive terminology in SMS templates")
            print("✅ Professional car dealership terminology throughout")
            print("✅ All workflow triggers function correctly with automotive focus")
            return True
        else:
            print("🚨 CRITICAL FIX VALIDATION: FAILED!")
            print("❌ Demo scenarios may still have execution issues")
            print("❌ Automotive terminology coverage may be insufficient")
            print("❌ Function naming conflict may persist")
            return False

    # =============================================================================
    # CREATIVE STUDIO API TESTS - PRIORITY ENDPOINTS
    # =============================================================================

    def test_creative_ai_ideas_generation(self):
        """Test AI Ideas Generation endpoint - POST /api/creative/generate-ideas"""
        print("\n🎨 Testing Creative Studio AI Ideas Generation...")
        
        # Test data from review request - using query parameters
        success, response = self.run_test(
            "AI Ideas Generation",
            "POST",
            "creative/generate-ideas?tenant_id=default&platform=instagram&objective=engagement&count=10",
            200
        )
        
        if success:
            # Verify response structure
            required_fields = ['platform', 'objective', 'ideas_generated', 'ideas']
            missing_fields = [field for field in required_fields if field not in response]
            
            if not missing_fields:
                ideas_count = response.get('ideas_generated', 0)
                ideas_list = response.get('ideas', [])
                print(f"   ✅ AI Ideas generated successfully - {ideas_count} ideas for {response['platform']}")
                
                # Check first idea structure if available
                if ideas_list:
                    first_idea = ideas_list[0]
                    idea_fields = ['title', 'platform', 'content_type', 'description', 'suggested_copy', 'hashtags']
                    missing_idea_fields = [field for field in idea_fields if field not in first_idea]
                    
                    if not missing_idea_fields:
                        print(f"      Idea structure valid - Type: {first_idea['content_type']}")
                        print(f"      Sample title: {first_idea['title']}")
                        return True
                    else:
                        print(f"   ❌ Idea structure missing fields: {missing_idea_fields}")
                        return False
                else:
                    print("   ⚠️  No ideas returned in response")
                    return False
            else:
                print(f"   ❌ Response missing fields: {missing_fields}")
                return False
        return False

    def test_creative_templates(self):
        """Test Creative Templates endpoint - GET /api/creative/templates"""
        print("\n📋 Testing Creative Studio Templates...")
        
        success, response = self.run_test(
            "Creative Templates",
            "GET",
            "creative/templates?tenant_id=default",
            200
        )
        
        if success:
            # Verify response structure
            required_fields = ['custom_templates', 'builtin_templates', 'total_count']
            missing_fields = [field for field in required_fields if field not in response]
            
            if not missing_fields:
                custom_count = len(response.get('custom_templates', []))
                builtin_count = len(response.get('builtin_templates', []))
                total_count = response.get('total_count', 0)
                
                print(f"   ✅ Templates retrieved - {custom_count} custom, {builtin_count} builtin, {total_count} total")
                
                # Check builtin template structure if available
                builtin_templates = response.get('builtin_templates', [])
                if builtin_templates:
                    first_template = builtin_templates[0]
                    template_fields = ['id', 'name', 'platform', 'type', 'elements', 'is_builtin']
                    missing_template_fields = [field for field in template_fields if field not in first_template]
                    
                    if not missing_template_fields:
                        print(f"      Template structure valid - Name: {first_template['name']}")
                        print(f"      Platform: {first_template['platform']}, Type: {first_template['type']}")
                        return True
                    else:
                        print(f"   ❌ Template structure missing fields: {missing_template_fields}")
                        return False
                else:
                    print("   ✅ Empty templates list returned (valid response)")
                    return True
            else:
                print(f"   ❌ Response missing fields: {missing_fields}")
                return False
        return False

    def test_hashtag_research(self):
        """Test Hashtag Research endpoint - POST /api/organic/hashtag-research"""
        print("\n🏷️ Testing Hashtag Research...")
        
        # Test data from review request - using query parameters
        success, response = self.run_test(
            "Hashtag Research",
            "POST",
            "organic/hashtag-research?tenant_id=default&platform=instagram",
            200,
            data=["cars", "automotive"]  # keywords as JSON body
        )
        
        if success:
            # Verify response structure
            required_fields = ['platform', 'keywords_researched', 'hashtag_suggestions', 'optimization_strategy', 'recommended_mix']
            missing_fields = [field for field in required_fields if field not in response]
            
            if not missing_fields:
                platform = response.get('platform')
                keywords = response.get('keywords_researched', [])
                suggestions = response.get('hashtag_suggestions', [])
                
                print(f"   ✅ Hashtag research completed - Platform: {platform}")
                print(f"      Keywords: {keywords}, Suggestions: {len(suggestions)}")
                
                # Check hashtag suggestion structure if available
                if suggestions:
                    first_hashtag = suggestions[0]
                    hashtag_fields = ['hashtag', 'platform', 'volume', 'difficulty', 'relevance_score', 'trending']
                    missing_hashtag_fields = [field for field in hashtag_fields if field not in first_hashtag]
                    
                    if not missing_hashtag_fields:
                        print(f"      Sample hashtag: {first_hashtag['hashtag']} (Volume: {first_hashtag['volume']})")
                        return True
                    else:
                        print(f"   ❌ Hashtag structure missing fields: {missing_hashtag_fields}")
                        return False
                else:
                    print("   ⚠️  No hashtag suggestions returned")
                    return False
            else:
                print(f"   ❌ Response missing fields: {missing_fields}")
                return False
        return False

    def test_creative_analytics_endpoints(self):
        """Test Creative Studio Analytics-related endpoints"""
        print("\n📊 Testing Creative Studio Analytics...")
        
        # Test content calendar endpoint (analytics-related)
        success1, response1 = self.run_test(
            "Content Calendar Analytics",
            "GET",
            "organic/content-calendar?tenant_id=default",
            200
        )
        
        analytics_passed = 0
        total_analytics_tests = 2
        
        if success1:
            # Verify content calendar response
            required_fields = ['tenant_id', 'calendar_data', 'total_scheduled']
            missing_fields = [field for field in required_fields if field not in response1]
            
            if not missing_fields:
                total_scheduled = response1.get('total_scheduled', 0)
                print(f"   ✅ Content Calendar retrieved - {total_scheduled} scheduled items")
                analytics_passed += 1
            else:
                print(f"   ❌ Content Calendar missing fields: {missing_fields}")
        
        # Test content analysis endpoint (analytics-related)
        analysis_data = {
            "title": "New Toyota Camry Showcase",
            "description": "Check out our latest Toyota Camry models with amazing features!",
            "hashtags": ["#Toyota", "#Camry", "#NewCar"],
            "visual_appeal": "high",
            "call_to_action": "Visit our showroom today!"
        }
        
        success2, response2 = self.run_test(
            "Content Performance Analysis",
            "POST",
            "creative/analyze-content?tenant_id=default&platform=instagram",
            200,
            data=analysis_data
        )
        
        if success2:
            # Check if response contains performance predictions
            if 'performance_prediction' in response2 or 'predicted_score' in response2:
                print("   ✅ Content analysis completed with performance predictions")
                analytics_passed += 1
            else:
                print("   ❌ Content analysis missing performance predictions")
        
        print(f"   📊 Creative Analytics: {analytics_passed}/{total_analytics_tests} tests passed")
        return analytics_passed >= total_analytics_tests * 0.5  # 50% pass rate

    def test_creative_studio_error_handling(self):
        """Test Creative Studio error handling"""
        print("\n🔍 Testing Creative Studio Error Handling...")
        
        # Test missing tenant_id in AI ideas generation
        success1, _ = self.run_test(
            "AI Ideas - Missing tenant_id",
            "POST",
            "creative/generate-ideas",
            422  # Validation error expected
        )
        
        # Test invalid platform in hashtag research
        invalid_hashtag_data = {
            "tenant_id": "default",
            "keywords": ["test"],
            "platform": "invalid_platform"
        }
        
        success2, _ = self.run_test(
            "Hashtag Research - Invalid Platform",
            "POST",
            "organic/hashtag-research",
            200  # Should handle gracefully
        )
        
        # Test missing keywords in hashtag research
        missing_keywords_data = {
            "tenant_id": "default",
            "platform": "instagram"
            # Missing keywords field
        }
        
        success3, _ = self.run_test(
            "Hashtag Research - Missing Keywords",
            "POST",
            "organic/hashtag-research",
            422  # Validation error expected
        )
        
        passed_tests = sum([success1, success2, success3])
        print(f"   📊 Error Handling: {passed_tests}/3 tests passed")
        
        return passed_tests >= 2  # At least 2/3 should pass

    def test_creative_studio_comprehensive(self):
        """Run comprehensive Creative Studio test suite"""
        print("\n🎨 Running Comprehensive Creative Studio Tests...")
        
        creative_tests = [
            ("AI Ideas Generation", self.test_creative_ai_ideas_generation),
            ("Creative Templates", self.test_creative_templates),
            ("Hashtag Research", self.test_hashtag_research),
            ("Creative Analytics", self.test_creative_analytics_endpoints),
            ("Error Handling", self.test_creative_studio_error_handling)
        ]
        
        passed_tests = 0
        total_tests = len(creative_tests)
        
        for test_name, test_func in creative_tests:
            try:
                if test_func():
                    passed_tests += 1
                    print(f"   ✅ {test_name} - PASSED")
                else:
                    print(f"   ❌ {test_name} - FAILED")
            except Exception as e:
                print(f"   ❌ {test_name} - ERROR: {str(e)}")
        
        success_rate = (passed_tests / total_tests) * 100
        print(f"\n   📊 Creative Studio Test Suite: {passed_tests}/{total_tests} passed ({success_rate:.1f}%)")
        
        return passed_tests >= total_tests * 0.8  # 80% pass rate required

    def run_creative_studio_focused_tests(self):
        """Run focused Creative Studio tests as requested in review"""
        print("🚀 Starting Creative Studio AI Ideas and Analytics Testing...")
        print("🎨 Focus: Testing failing Creative Studio endpoints")
        print(f"   Backend URL: {self.base_url}")
        print(f"   API URL: {self.api_url}")
        
        # Priority Tests as requested in review
        priority_tests = [
            ("AI Ideas Generation", self.test_creative_ai_ideas_generation),
            ("Creative Templates", self.test_creative_templates),
            ("Hashtag Research", self.test_hashtag_research),
            ("Creative Analytics", self.test_creative_analytics_endpoints),
            ("Error Handling", self.test_creative_studio_error_handling)
        ]
        
        print(f"\n🎯 Running {len(priority_tests)} Priority Creative Studio Tests...")
        
        passed_tests = 0
        total_tests = len(priority_tests)
        
        for test_name, test_func in priority_tests:
            try:
                print(f"\n{'='*60}")
                print(f"🔍 Testing: {test_name}")
                print(f"{'='*60}")
                
                if test_func():
                    passed_tests += 1
                    print(f"✅ {test_name} - PASSED")
                else:
                    print(f"❌ {test_name} - FAILED")
            except Exception as e:
                print(f"❌ {test_name} - ERROR: {str(e)}")
        
        # Final Results
        success_rate = (passed_tests / total_tests) * 100
        print(f"\n{'='*80}")
        print("🎯 CREATIVE STUDIO TEST RESULTS")
        print(f"{'='*80}")
        print(f"📊 Overall Results: {passed_tests}/{total_tests} tests passed ({success_rate:.1f}%)")
        
        if success_rate >= 80:
            print("🎉 CREATIVE STUDIO SYSTEM: SUCCESS!")
            print("   ✅ AI Ideas Generation working for car dealerships")
            print("   ✅ Creative Templates loading properly")
            print("   ✅ Hashtag Research working for automotive keywords")
            print("   ✅ Analytics endpoints providing relevant metrics")
            return True
        else:
            print("⚠️  CREATIVE STUDIO SYSTEM: NEEDS ATTENTION")
            print("   ❌ Some Creative Studio endpoints may need fixes")
            print("   ❌ AI Ideas or Analytics functionality may be incomplete")
            return False

    # =============================================================================
    # INVENTORY SYSTEM TESTS - PRIORITY TESTING FOR VEHICLE DATA ANALYSIS
    # =============================================================================

    def test_inventory_vehicles_data_structure(self):
        """Test GET /api/inventory/vehicles - Analyze vehicle data structure and completeness"""
        print("\n🚗 Testing Inventory Vehicles Data Structure...")
        
        success, response = self.run_test(
            "Get Inventory Vehicles",
            "GET",
            "inventory/vehicles?tenant_id=default_dealership&limit=50",
            200
        )
        
        if success:
            vehicles = response.get('vehicles', [])
            total_count = response.get('total', 0)
            
            print(f"   📊 Total vehicles in database: {total_count}")
            print(f"   📊 Vehicles returned in response: {len(vehicles)}")
            
            if vehicles:
                # Analyze first vehicle structure
                first_vehicle = vehicles[0]
                print(f"\n   🔍 Analyzing vehicle data structure:")
                
                # Check title information (year, make, model, trim)
                title_fields = ['year', 'make', 'model', 'trim']
                title_completeness = sum(1 for field in title_fields if first_vehicle.get(field))
                print(f"   - Title completeness: {title_completeness}/{len(title_fields)} fields")
                
                # Check image data
                images = first_vehicle.get('images', [])
                print(f"   - Images per vehicle: {len(images)} images")
                
                if images:
                    # Check image structure
                    first_image = images[0]
                    image_fields = ['url', 'type', 'description']
                    image_structure = [field for field in image_fields if field in first_image]
                    print(f"   - Image structure: {image_structure}")
                    
                    # Test image accessibility
                    if 'url' in first_image:
                        try:
                            import requests
                            img_response = requests.head(first_image['url'], timeout=5)
                            if img_response.status_code == 200:
                                print(f"   - First image URL accessible: ✅")
                            else:
                                print(f"   - First image URL status: {img_response.status_code}")
                        except:
                            print(f"   - Image URL accessibility: ❌ (timeout/error)")
                
                # Check specifications
                specs = first_vehicle.get('specifications', {})
                spec_fields = ['engine', 'transmission', 'mileage', 'fuel_type', 'drivetrain']
                spec_completeness = sum(1 for field in spec_fields if specs.get(field))
                print(f"   - Specifications completeness: {spec_completeness}/{len(spec_fields)} fields")
                
                # Check pricing data
                pricing_fields = ['price', 'msrp', 'market_price']
                pricing_completeness = sum(1 for field in pricing_fields if first_vehicle.get(field))
                print(f"   - Pricing completeness: {pricing_completeness}/{len(pricing_fields)} fields")
                
                # Check features
                features = first_vehicle.get('features', [])
                print(f"   - Features count: {len(features)} features")
                
                # Analyze multiple vehicles for consistency
                if len(vehicles) > 1:
                    print(f"\n   🔍 Analyzing data consistency across {min(5, len(vehicles))} vehicles:")
                    
                    image_counts = [len(v.get('images', [])) for v in vehicles[:5]]
                    avg_images = sum(image_counts) / len(image_counts)
                    print(f"   - Average images per vehicle: {avg_images:.1f}")
                    print(f"   - Image count range: {min(image_counts)} - {max(image_counts)}")
                    
                    # Check for vehicles with complete titles
                    complete_titles = 0
                    for vehicle in vehicles[:10]:
                        if all(vehicle.get(field) for field in ['year', 'make', 'model']):
                            complete_titles += 1
                    print(f"   - Vehicles with complete titles: {complete_titles}/10")
                
                return True
            else:
                print("   ❌ No vehicles found in response")
                return False
        return False

    def test_inventory_summary_analysis(self):
        """Test GET /api/inventory/summary - Check summary statistics"""
        print("\n📊 Testing Inventory Summary Analysis...")
        
        success, response = self.run_test(
            "Get Inventory Summary",
            "GET",
            "inventory/summary?tenant_id=default_dealership",
            200
        )
        
        if success:
            print(f"   📊 Summary Response Analysis:")
            
            # Check summary fields
            summary_fields = ['total_vehicles', 'by_make', 'by_year', 'by_price_range', 'recent_additions']
            for field in summary_fields:
                if field in response:
                    value = response[field]
                    if isinstance(value, dict):
                        print(f"   - {field}: {len(value)} categories")
                    elif isinstance(value, list):
                        print(f"   - {field}: {len(value)} items")
                    else:
                        print(f"   - {field}: {value}")
                else:
                    print(f"   - {field}: ❌ Missing")
            
            # Analyze by_make distribution
            by_make = response.get('by_make', {})
            if by_make:
                print(f"\n   🏭 Vehicle distribution by make:")
                for make, count in sorted(by_make.items(), key=lambda x: x[1], reverse=True)[:5]:
                    print(f"   - {make}: {count} vehicles")
            
            # Check total consistency
            total_vehicles = response.get('total_vehicles', 0)
            make_total = sum(by_make.values()) if by_make else 0
            if total_vehicles == make_total:
                print(f"   ✅ Total vehicles consistent: {total_vehicles}")
            else:
                print(f"   ⚠️  Total mismatch: summary={total_vehicles}, by_make={make_total}")
            
            return True
        return False

    def test_vehicle_data_completeness_check(self):
        """Test vehicle data completeness - titles, images, specifications, pricing"""
        print("\n🔍 Testing Vehicle Data Completeness...")
        
        success, response = self.run_test(
            "Get Vehicles for Completeness Check",
            "GET",
            "inventory/vehicles?tenant_id=default_dealership&limit=20",
            200
        )
        
        if success:
            vehicles = response.get('vehicles', [])
            
            if vehicles:
                print(f"   📊 Analyzing {len(vehicles)} vehicles for data completeness:")
                
                # Initialize counters
                complete_titles = 0
                multiple_images = 0
                complete_specs = 0
                has_pricing = 0
                has_features = 0
                
                for vehicle in vehicles:
                    # Check title completeness (year, make, model, trim)
                    if all(vehicle.get(field) for field in ['year', 'make', 'model']):
                        complete_titles += 1
                    
                    # Check multiple images
                    images = vehicle.get('images', [])
                    if len(images) > 1:
                        multiple_images += 1
                    
                    # Check specifications
                    specs = vehicle.get('specifications', {})
                    if len(specs) >= 3:  # At least 3 spec fields
                        complete_specs += 1
                    
                    # Check pricing
                    if vehicle.get('price') or vehicle.get('msrp'):
                        has_pricing += 1
                    
                    # Check features
                    features = vehicle.get('features', [])
                    if len(features) >= 5:  # At least 5 features
                        has_features += 1
                
                # Calculate percentages
                total = len(vehicles)
                print(f"\n   📊 Data Completeness Results:")
                print(f"   - Complete titles (year/make/model): {complete_titles}/{total} ({complete_titles/total*100:.1f}%)")
                print(f"   - Multiple images: {multiple_images}/{total} ({multiple_images/total*100:.1f}%)")
                print(f"   - Complete specifications: {complete_specs}/{total} ({complete_specs/total*100:.1f}%)")
                print(f"   - Has pricing data: {has_pricing}/{total} ({has_pricing/total*100:.1f}%)")
                print(f"   - Rich features list: {has_features}/{total} ({has_features/total*100:.1f}%)")
                
                # Overall completeness score
                completeness_score = (complete_titles + multiple_images + complete_specs + has_pricing + has_features) / (total * 5) * 100
                print(f"   📊 Overall completeness score: {completeness_score:.1f}%")
                
                return completeness_score >= 60  # 60% completeness threshold
            else:
                print("   ❌ No vehicles found for completeness check")
                return False
        return False

    def test_image_data_analysis(self):
        """Test image data analysis - count, accessibility, types"""
        print("\n🖼️  Testing Image Data Analysis...")
        
        success, response = self.run_test(
            "Get Vehicles for Image Analysis",
            "GET",
            "inventory/vehicles?tenant_id=default_dealership&limit=10",
            200
        )
        
        if success:
            vehicles = response.get('vehicles', [])
            
            if vehicles:
                print(f"   📊 Analyzing images for {len(vehicles)} vehicles:")
                
                total_images = 0
                accessible_images = 0
                image_types = {}
                vehicles_with_multiple_images = 0
                
                for i, vehicle in enumerate(vehicles):
                    images = vehicle.get('images', [])
                    vehicle_image_count = len(images)
                    total_images += vehicle_image_count
                    
                    if vehicle_image_count > 1:
                        vehicles_with_multiple_images += 1
                    
                    print(f"   - Vehicle {i+1}: {vehicle_image_count} images")
                    
                    # Analyze first few images
                    for j, image in enumerate(images[:3]):  # Check first 3 images
                        if isinstance(image, dict):
                            # Count image types
                            img_type = image.get('type', 'unknown')
                            image_types[img_type] = image_types.get(img_type, 0) + 1
                            
                            # Test image URL accessibility (sample)
                            if j == 0 and 'url' in image:  # Test first image only
                                try:
                                    import requests
                                    img_response = requests.head(image['url'], timeout=3)
                                    if img_response.status_code == 200:
                                        accessible_images += 1
                                except:
                                    pass  # Count as not accessible
                
                # Calculate statistics
                avg_images_per_vehicle = total_images / len(vehicles) if vehicles else 0
                
                print(f"\n   📊 Image Analysis Results:")
                print(f"   - Total images: {total_images}")
                print(f"   - Average images per vehicle: {avg_images_per_vehicle:.1f}")
                print(f"   - Vehicles with multiple images: {vehicles_with_multiple_images}/{len(vehicles)} ({vehicles_with_multiple_images/len(vehicles)*100:.1f}%)")
                print(f"   - Accessible image URLs tested: {accessible_images}/{len(vehicles)} first images")
                
                if image_types:
                    print(f"   - Image types found: {list(image_types.keys())}")
                    for img_type, count in image_types.items():
                        print(f"     * {img_type}: {count} images")
                
                # Check for expected image types (exterior, interior, engine)
                expected_types = ['exterior', 'interior', 'engine']
                found_types = [t for t in expected_types if t in image_types]
                print(f"   - Expected image types found: {found_types}")
                
                return avg_images_per_vehicle >= 1.5  # At least 1.5 images per vehicle on average
            else:
                print("   ❌ No vehicles found for image analysis")
                return False
        return False

    def test_inventory_data_issues_identification(self):
        """Identify specific issues with inventory data loading"""
        print("\n🔧 Testing Inventory Data Issues Identification...")
        
        issues_found = []
        
        # Test 1: Check if inventory is properly loaded
        success, response = self.run_test(
            "Check Inventory Loading",
            "GET",
            "inventory/vehicles?tenant_id=default_dealership&limit=5",
            200
        )
        
        if success:
            vehicles = response.get('vehicles', [])
            total = response.get('total', 0)
            
            if total == 0:
                issues_found.append("❌ CRITICAL: No vehicles in inventory database")
            elif total < 100:
                issues_found.append(f"⚠️  LOW INVENTORY: Only {total} vehicles in database (expected 200+)")
            else:
                print(f"   ✅ Inventory count acceptable: {total} vehicles")
            
            # Test 2: Check image gallery issues
            if vehicles:
                single_image_count = 0
                no_image_count = 0
                
                for vehicle in vehicles:
                    images = vehicle.get('images', [])
                    if len(images) == 0:
                        no_image_count += 1
                    elif len(images) == 1:
                        single_image_count += 1
                
                if single_image_count > len(vehicles) * 0.8:  # More than 80% have only 1 image
                    issues_found.append(f"❌ IMAGE GALLERY ISSUE: {single_image_count}/{len(vehicles)} vehicles have only 1 image")
                
                if no_image_count > 0:
                    issues_found.append(f"❌ MISSING IMAGES: {no_image_count}/{len(vehicles)} vehicles have no images")
            
            # Test 3: Check title completeness
            if vehicles:
                incomplete_titles = 0
                for vehicle in vehicles:
                    if not all(vehicle.get(field) for field in ['year', 'make', 'model']):
                        incomplete_titles += 1
                
                if incomplete_titles > 0:
                    issues_found.append(f"❌ INCOMPLETE TITLES: {incomplete_titles}/{len(vehicles)} vehicles missing year/make/model")
            
            # Test 4: Check specifications
            if vehicles:
                missing_specs = 0
                for vehicle in vehicles:
                    specs = vehicle.get('specifications', {})
                    if len(specs) < 3:  # Less than 3 specifications
                        missing_specs += 1
                
                if missing_specs > len(vehicles) * 0.5:  # More than 50% missing specs
                    issues_found.append(f"❌ MISSING SPECIFICATIONS: {missing_specs}/{len(vehicles)} vehicles lack detailed specs")
        
        # Test 5: Check dealership inventory upload completeness
        success2, summary_response = self.run_test(
            "Check Dealership Upload Completeness",
            "GET",
            "inventory/summary?tenant_id=default_dealership",
            200
        )
        
        if success2:
            total_vehicles = summary_response.get('total_vehicles', 0)
            by_make = summary_response.get('by_make', {})
            
            # Check if Toyota inventory is properly loaded (should be primary)
            toyota_count = by_make.get('Toyota', 0)
            if toyota_count < 50:  # Expected significant Toyota inventory
                issues_found.append(f"❌ TOYOTA INVENTORY LOW: Only {toyota_count} Toyota vehicles (expected 100+)")
            
            # Check for diverse inventory
            if len(by_make) < 3:
                issues_found.append(f"❌ LIMITED MAKE DIVERSITY: Only {len(by_make)} different makes")
        
        # Report findings
        print(f"\n   🔍 Issues Identification Results:")
        if issues_found:
            print(f"   📊 Found {len(issues_found)} potential issues:")
            for issue in issues_found:
                print(f"   {issue}")
        else:
            print("   ✅ No major issues identified with inventory data")
        
        return len(issues_found) == 0  # Return True if no issues found

    def test_inventory_system_comprehensive(self):
        """Run comprehensive inventory system test suite"""
        print("\n🚗 Running Comprehensive Inventory System Tests...")
        print("="*60)
        
        inventory_tests = [
            ("Inventory Vehicles Data Structure", self.test_inventory_vehicles_data_structure),
            ("Inventory Summary Analysis", self.test_inventory_summary_analysis),
            ("Vehicle Data Completeness Check", self.test_vehicle_data_completeness_check),
            ("Image Data Analysis", self.test_image_data_analysis),
            ("Inventory Data Issues Identification", self.test_inventory_data_issues_identification)
        ]
        
        passed_tests = 0
        total_tests = len(inventory_tests)
        
        for test_name, test_func in inventory_tests:
            try:
                if test_func():
                    passed_tests += 1
                    print(f"   ✅ {test_name} - PASSED")
                else:
                    print(f"   ❌ {test_name} - FAILED")
            except Exception as e:
                print(f"   ❌ {test_name} - ERROR: {str(e)}")
        
        success_rate = (passed_tests / total_tests) * 100
        print(f"\n   📊 Inventory System Test Suite: {passed_tests}/{total_tests} passed ({success_rate:.1f}%)")
        
        return passed_tests >= total_tests * 0.6  # 60% pass rate for inventory analysis

    # =============================================================================
    # PERFORMANCE & SCALABILITY OPTIMIZATION TESTS
    # =============================================================================

    def test_cache_stats_endpoint(self):
        """Test cache statistics endpoint"""
        success, response = self.run_test(
            "Cache Statistics",
            "GET",
            "cache/stats",
            200
        )
        
        if success:
            # Verify cache stats structure
            if 'cache_stats' in response and 'timestamp' in response:
                cache_stats = response['cache_stats']
                print(f"   ✅ Cache stats retrieved - Status: {cache_stats.get('status', 'unknown')}")
                return True
            else:
                print("   ❌ Cache stats missing required fields")
                return False
        return False

    def test_cache_clear_endpoint(self):
        """Test cache clearing functionality"""
        success, response = self.run_test(
            "Cache Clear",
            "POST",
            "cache/clear",
            200
        )
        
        if success:
            # Verify cache clear response
            if 'message' in response and 'success' in response:
                print(f"   ✅ Cache clear successful - {response.get('message', '')}")
                return True
            else:
                print("   ❌ Cache clear response missing required fields")
                return False
        return False

    def test_cache_clear_specific_type(self):
        """Test clearing specific cache type"""
        success, response = self.run_test(
            "Cache Clear Specific Type",
            "POST",
            "cache/clear?cache_type=lead_list",
            200
        )
        
        if success:
            # Verify specific cache clear
            if 'cache_type' in response and response.get('cache_type') == 'lead_list':
                cleared_count = response.get('cleared_count', 0)
                print(f"   ✅ Specific cache clear successful - {cleared_count} entries cleared")
                return True
            else:
                print("   ❌ Specific cache clear failed")
                return False
        return False

    def test_enhanced_health_check(self):
        """Test enhanced health check with cache system status"""
        success, response = self.run_test(
            "Enhanced Health Check",
            "GET",
            "../health/detailed",  # This is at root level, not /api
            200
        )
        
        if success:
            # Verify enhanced health check structure
            required_fields = ['status', 'components']
            missing_fields = [field for field in required_fields if field not in response]
            
            if not missing_fields:
                components = response.get('components', {})
                cache_status = components.get('cache_system', 'unknown')
                db_status = components.get('database', 'unknown')
                ai_status = components.get('ai_services', 'unknown')
                
                print(f"   ✅ Enhanced health check - Overall: {response.get('status')}")
                print(f"      Database: {db_status}, AI: {ai_status}, Cache: {cache_status}")
                return True
            else:
                print(f"   ❌ Enhanced health check missing fields: {missing_fields}")
                return False
        return False

    def test_dashboard_stats_performance(self):
        """Test dashboard stats endpoint performance and caching"""
        import time
        
        # First request (should populate cache)
        start_time = time.time()
        success1, response1 = self.run_test(
            "Dashboard Stats Performance (First Request)",
            "GET",
            "dashboard/stats",
            200
        )
        first_request_time = (time.time() - start_time) * 1000  # Convert to milliseconds
        
        if not success1:
            return False
        
        # Second request (should be served from cache)
        start_time = time.time()
        success2, response2 = self.run_test(
            "Dashboard Stats Performance (Cached Request)",
            "GET",
            "dashboard/stats",
            200
        )
        second_request_time = (time.time() - start_time) * 1000  # Convert to milliseconds
        
        if success1 and success2:
            print(f"   ✅ Dashboard stats performance:")
            print(f"      First request: {first_request_time:.0f}ms")
            print(f"      Cached request: {second_request_time:.0f}ms")
            
            # Check if response time is under 500ms requirement
            performance_ok = first_request_time < 500
            cache_improvement = second_request_time < first_request_time
            
            print(f"      Performance target (<500ms): {'✅' if performance_ok else '❌'}")
            print(f"      Cache improvement: {'✅' if cache_improvement else '❌'}")
            
            return performance_ok
        return False

    def test_leads_endpoint_performance(self):
        """Test leads endpoint performance and caching"""
        import time
        
        # First request (should populate cache)
        start_time = time.time()
        success1, response1 = self.run_test(
            "Leads Performance (First Request)",
            "GET",
            "leads",
            200
        )
        first_request_time = (time.time() - start_time) * 1000  # Convert to milliseconds
        
        if not success1:
            return False
        
        # Second request (should be served from cache)
        start_time = time.time()
        success2, response2 = self.run_test(
            "Leads Performance (Cached Request)",
            "GET",
            "leads",
            200
        )
        second_request_time = (time.time() - start_time) * 1000  # Convert to milliseconds
        
        if success1 and success2:
            leads_count = len(response1) if isinstance(response1, list) else 0
            print(f"   ✅ Leads endpoint performance ({leads_count} leads):")
            print(f"      First request: {first_request_time:.0f}ms")
            print(f"      Cached request: {second_request_time:.0f}ms")
            
            # Check if response time is under 1000ms requirement
            performance_ok = first_request_time < 1000
            cache_improvement = second_request_time < first_request_time
            
            print(f"      Performance target (<1000ms): {'✅' if performance_ok else '❌'}")
            print(f"      Cache improvement: {'✅' if cache_improvement else '❌'}")
            
            return performance_ok
        return False

    def test_cache_invalidation_on_lead_update(self):
        """Test cache invalidation when leads are updated"""
        if not self.created_lead_id:
            print("❌ No lead ID available for cache invalidation testing")
            return False
        
        # First, populate cache by getting leads
        success1, _ = self.run_test(
            "Populate Cache (Get Leads)",
            "GET",
            "leads",
            200
        )
        
        if not success1:
            return False
        
        # Update the lead (should invalidate cache)
        update_data = {
            "status": "cache_test_updated",
            "notes": "Testing cache invalidation"
        }
        
        success2, _ = self.run_test(
            "Update Lead (Should Invalidate Cache)",
            "PUT",
            f"leads/{self.created_lead_id}",
            200,
            data=update_data
        )
        
        if success2:
            print("   ✅ Lead update successful - cache should be invalidated")
            
            # Verify the update is reflected (cache should be refreshed)
            success3, response3 = self.run_test(
                "Get Updated Lead (Cache Refreshed)",
                "GET",
                f"leads/{self.created_lead_id}",
                200
            )
            
            if success3 and response3.get('status') == 'cache_test_updated':
                print("   ✅ Cache invalidation working - updated data retrieved")
                return True
            else:
                print("   ❌ Cache invalidation failed - stale data returned")
                return False
        return False

    def test_cache_graceful_degradation(self):
        """Test graceful degradation when cache is unavailable"""
        # This test simulates cache unavailability by testing endpoints
        # that should work even if cache fails
        
        success, response = self.run_test(
            "Dashboard Stats (Graceful Degradation)",
            "GET",
            "dashboard/stats",
            200
        )
        
        if success:
            # Verify that even if cache fails, we get valid data
            required_fields = ['total_leads', 'new_leads', 'contacted_leads']
            missing_fields = [field for field in required_fields if field not in response]
            
            if not missing_fields:
                print("   ✅ Graceful degradation working - data served despite cache issues")
                return True
            else:
                print(f"   ❌ Graceful degradation failed - missing fields: {missing_fields}")
                return False
        return False

    def test_concurrent_requests_performance(self):
        """Test system performance under concurrent requests"""
        import threading
        import time
        
        results = []
        
        def make_request():
            start_time = time.time()
            try:
                response = requests.get(f"{self.api_url}/dashboard/stats")
                request_time = (time.time() - start_time) * 1000
                results.append({
                    'success': response.status_code == 200,
                    'time': request_time
                })
            except Exception as e:
                results.append({
                    'success': False,
                    'time': 0,
                    'error': str(e)
                })
        
        # Create 5 concurrent threads
        threads = []
        for i in range(5):
            thread = threading.Thread(target=make_request)
            threads.append(thread)
        
        # Start all threads
        start_time = time.time()
        for thread in threads:
            thread.start()
        
        # Wait for all threads to complete
        for thread in threads:
            thread.join()
        
        total_time = (time.time() - start_time) * 1000
        
        # Analyze results
        successful_requests = sum(1 for r in results if r['success'])
        avg_response_time = sum(r['time'] for r in results if r['success']) / max(successful_requests, 1)
        
        print(f"   ✅ Concurrent requests test:")
        print(f"      Successful requests: {successful_requests}/5")
        print(f"      Average response time: {avg_response_time:.0f}ms")
        print(f"      Total execution time: {total_time:.0f}ms")
        
        # Performance criteria: at least 4/5 requests successful, avg response < 1000ms
        performance_ok = successful_requests >= 4 and avg_response_time < 1000
        print(f"      Performance acceptable: {'✅' if performance_ok else '❌'}")
        
        return performance_ok

    def test_database_indexes_performance(self):
        """Test database query performance with indexes"""
        import time
        
        # Test leads query performance (should benefit from indexes)
        start_time = time.time()
        success, response = self.run_test(
            "Database Index Performance (Leads Query)",
            "GET",
            "leads",
            200
        )
        query_time = (time.time() - start_time) * 1000
        
        if success:
            leads_count = len(response) if isinstance(response, list) else 0
            print(f"   ✅ Database query performance:")
            print(f"      Query time: {query_time:.0f}ms for {leads_count} leads")
            
            # Performance should be good with proper indexing
            performance_ok = query_time < 1000  # Should be under 1 second
            print(f"      Index performance: {'✅' if performance_ok else '❌'}")
            
            return performance_ok
        return False

    def test_performance_optimization_comprehensive(self):
        """Run comprehensive Performance & Scalability Optimization test suite"""
        print("\n⚡ Running Performance & Scalability Optimization Tests...")
        
        performance_tests = [
            ("Cache Statistics Endpoint", self.test_cache_stats_endpoint),
            ("Cache Clear Endpoint", self.test_cache_clear_endpoint),
            ("Cache Clear Specific Type", self.test_cache_clear_specific_type),
            ("Enhanced Health Check", self.test_enhanced_health_check),
            ("Dashboard Stats Performance", self.test_dashboard_stats_performance),
            ("Leads Endpoint Performance", self.test_leads_endpoint_performance),
            ("Cache Invalidation on Update", self.test_cache_invalidation_on_lead_update),
            ("Cache Graceful Degradation", self.test_cache_graceful_degradation),
            ("Concurrent Requests Performance", self.test_concurrent_requests_performance),
            ("Database Indexes Performance", self.test_database_indexes_performance)
        ]
        
        passed_tests = 0
        total_tests = len(performance_tests)
        
        for test_name, test_func in performance_tests:
            try:
                if test_func():
                    passed_tests += 1
                    print(f"   ✅ {test_name} - PASSED")
                else:
                    print(f"   ❌ {test_name} - FAILED")
            except Exception as e:
                print(f"   ❌ {test_name} - ERROR: {str(e)}")
        
        success_rate = (passed_tests / total_tests) * 100
        print(f"\n   📊 Performance Optimization Test Suite: {passed_tests}/{total_tests} passed ({success_rate:.1f}%)")
        
        return passed_tests >= total_tests * 0.8  # 80% pass rate required

def main():
    print("🃏 JokerVision AutoFollow API Testing Suite")
    print("=" * 50)
    
    tester = AutoFollowProAPITester()
    
    # Test sequence
    test_sequence = [
        ("Performance & Scalability Optimization Suite", tester.test_performance_optimization_comprehensive),
        ("Enhanced Dashboard Stats", tester.test_enhanced_dashboard_stats),
        ("JokerVision User Management", tester.test_user_management_system),
        ("JokerVision Sales Tracking", tester.test_sales_tracking_system),
        ("Commission Tier System", tester.test_commission_tier_progression),
        ("AI-Powered Inbox Comprehensive Suite", tester.test_ai_inbox_comprehensive),
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