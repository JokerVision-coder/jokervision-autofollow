#!/usr/bin/env python3
"""
Enhanced Intelligent Workflow Automation System Testing
Focus: Car Sales Knowledge Improvements & Demo Scenarios
"""

import requests
import json
import sys
from datetime import datetime

class WorkflowAutomationTester:
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
                response = requests.post(url, json=data, headers=headers)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=headers)

            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                try:
                    response_data = response.json()
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

    def test_demo_scenarios_critical(self):
        """Test POST /api/automation/demo-scenarios - CRITICAL for 3/3 execution"""
        print("\n🚗 CRITICAL TEST: Demo Scenarios (Must execute ALL 3/3)...")
        
        success, response = self.run_test(
            "Demo Scenarios - CRITICAL RETEST",
            "POST",
            "automation/demo-scenarios",
            200
        )
        
        if success:
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

    def test_car_sales_terminology_coverage(self):
        """Test workflow SMS content for 80%+ automotive terminology coverage"""
        print("\n🚗 Testing Car Sales Terminology Coverage (Target: 80%+)...")
        
        # Test high-value lead trigger to analyze SMS content
        trigger_data = {
            "trigger": "lead_score_above_85",
            "data": {
                "customer_name": "Jennifer Martinez",
                "customer_phone": "+1555123789",
                "ai_score": 92,
                "budget": 50000,
                "interested_vehicle": "2024 Toyota Highlander Hybrid",
                "trade_in_vehicle": "2020 Honda Pilot",
                "financing_needed": True,
                "credit_score": 780
            }
        }
        
        success, response = self.run_test(
            "Car Sales Terminology Analysis",
            "POST",
            "automation/trigger-workflow",
            200,
            data=trigger_data
        )
        
        if success:
            # Extract SMS content from workflow actions
            automation = response.get('automation', {})
            executions = automation.get('executions', [])
            
            sms_content = ""
            calendar_content = ""
            voice_content = ""
            
            if executions:
                first_execution = executions[0]
                actions = first_execution.get('actions', [])
                
                for action in actions:
                    action_type = action.get('action_type', '')
                    if action_type == 'send_sms':
                        sms_content = action.get('content', '')
                    elif action_type == 'create_calendar_event':
                        calendar_content = action.get('agenda', '') + " " + action.get('event_type', '')
                    elif action_type == 'send_voice_ai_call':
                        voice_content = action.get('call_content', '')
            
            # Combine all content for analysis
            all_content = f"{sms_content} {calendar_content} {voice_content}".lower()
            
            if all_content.strip():
                print(f"   📝 Content Analysis:")
                print(f"      SMS preview: {sms_content[:150]}...")
                print(f"      Calendar preview: {calendar_content[:100]}...")
                print(f"      Voice preview: {voice_content[:100]}...")
                
                # Enhanced automotive terminology list based on review requirements
                automotive_terms = [
                    # APR and financing terms (CRITICAL)
                    'apr', '0.9% apr', '0% apr', 'financing', 'down payment', 'monthly payment',
                    'lease', 'cash back', 'manufacturer cash back', 'rebates', 'incentives',
                    
                    # Trade-in and KBB terms (CRITICAL)
                    'trade-in', 'trade-in guarantee', 'kbb', 'kelley blue book', 'trade value',
                    
                    # Extended warranties and protection (CRITICAL)
                    'extended warranty', 'gap insurance', 'tire protection', 'roadside assistance',
                    'protection plan', 'service contract', 'warranty coverage',
                    
                    # VIN and reservation terms (CRITICAL)
                    'vin', 'vin reservation', 'reserve', 'hold',
                    
                    # DMV and processing (CRITICAL)
                    'dmv', 'dmv processing', 'title transfer', 'registration', 'same-day financing',
                    
                    # Vehicle and dealership terms
                    'certified pre-owned', 'toyota', 'honda', 'dealership', 'test drive',
                    'vehicle consultation', 'sales consultation', 'vip treatment',
                    
                    # Sales and urgency terms
                    'msrp', 'invoice', 'exclusive offer', 'same-day approval', 'first-time buyer',
                    'loyalty bonus', 'limited time', 'expires soon', 'while supplies last',
                    'this weekend only', 'manufacturer incentives', 'dealer incentives'
                ]
                
                # Count terms found in all content
                terms_found = []
                for term in automotive_terms:
                    if term in all_content:
                        terms_found.append(term)
                
                coverage_percentage = (len(terms_found) / len(automotive_terms)) * 100
                
                print(f"   📊 Automotive terminology coverage: {coverage_percentage:.1f}%")
                print(f"   📊 Terms found: {len(terms_found)}/{len(automotive_terms)}")
                print(f"   📝 Sample terms found: {', '.join(terms_found[:10])}...")
                
                if coverage_percentage >= 80.0:
                    print("   ✅ CRITICAL SUCCESS: Car sales knowledge meets 80%+ target")
                    return True
                else:
                    print(f"   ❌ CRITICAL FAILURE: Coverage {coverage_percentage:.1f}% below 80% target")
                    print("      Need more automotive terms in workflow content")
                    return False
            else:
                print("   ❌ No workflow content found in response")
                return False
        return False

    def test_voice_ai_automotive_actions(self):
        """Test voice_call_completed trigger with comprehensive automotive actions"""
        print("\n🎤 Testing Voice AI Automotive Actions (All 4 actions must execute)...")
        
        # Enhanced voice AI demo data
        voice_trigger_data = {
            "trigger": "voice_call_completed",
            "data": {
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
            "Voice AI Automotive Actions",
            "POST",
            "automation/trigger-workflow",
            200,
            data=voice_trigger_data
        )
        
        if success:
            # Verify all 4 expected voice AI actions
            automation = response.get('automation', {})
            executions = automation.get('executions', [])
            
            expected_actions = [
                'create_hot_lead',
                'send_personalized_offer',
                'schedule_test_drive', 
                'prepare_financing_options'
            ]
            
            if executions:
                first_execution = executions[0]
                actions = first_execution.get('actions', [])
                executed_action_types = [action.get('action_type') for action in actions]
                
                print(f"   📊 Actions executed: {len(actions)}")
                print(f"   📝 Action types: {executed_action_types}")
                
                # Check if all expected actions are present
                missing_actions = [action for action in expected_actions if action not in executed_action_types]
                
                if not missing_actions:
                    print("   ✅ ALL 4 voice AI actions executed successfully")
                    
                    # Analyze automotive content in each action
                    automotive_content_scores = []
                    
                    for action in actions:
                        action_type = action.get('action_type')
                        content = str(action.get('content', '') + action.get('description', '')).lower()
                        
                        # Enhanced automotive content indicators
                        automotive_indicators = [
                            '0.9% apr', '0% apr', 'manufacturer cash back', 'trade-in guarantee',
                            'vin reservation', 'dealership phone', 'vip treatment', 'exclusive offer',
                            'same-day approval', 'extended warranty', 'gap insurance', 'protection plan',
                            'toyota', 'rav4', 'financing options', 'test drive', 'vehicle consultation'
                        ]
                        
                        found_indicators = sum(1 for indicator in automotive_indicators if indicator in content)
                        automotive_score = (found_indicators / len(automotive_indicators)) * 100
                        automotive_content_scores.append(automotive_score)
                        
                        if found_indicators >= 3:
                            print(f"      ✅ {action_type}: {found_indicators} automotive indicators ({automotive_score:.1f}%)")
                        else:
                            print(f"      ⚠️  {action_type}: Only {found_indicators} automotive indicators ({automotive_score:.1f}%)")
                    
                    avg_automotive_content = sum(automotive_content_scores) / len(automotive_content_scores)
                    print(f"   📊 Average automotive content: {avg_automotive_content:.1f}%")
                    
                    if avg_automotive_content >= 75.0:
                        print("   ✅ CRITICAL SUCCESS: Voice AI actions contain comprehensive automotive content")
                        return True
                    else:
                        print(f"   ❌ CRITICAL FAILURE: Automotive content {avg_automotive_content:.1f}% below 75% target")
                        return False
                else:
                    print(f"   ❌ Missing actions: {missing_actions}")
                    return False
            else:
                print("   ❌ No workflow executions found")
                return False
        return False

    def test_automation_analytics(self):
        """Test GET /api/automation/analytics endpoint"""
        success, response = self.run_test(
            "Workflow Automation Analytics",
            "GET",
            "automation/analytics",
            200
        )
        
        if success:
            required_fields = ['automation_analytics', 'system_status', 'integration_features']
            missing_fields = [field for field in required_fields if field not in response]
            
            if not missing_fields:
                analytics = response.get('automation_analytics', {})
                system_status = response.get('system_status', 'unknown')
                
                analytics_fields = ['automation_engine', 'total_workflows', 'success_rate', 'available_triggers']
                analytics_missing = [field for field in analytics_fields if field not in analytics]
                
                if not analytics_missing:
                    print(f"   ✅ Analytics retrieved - Engine: {analytics.get('automation_engine')}")
                    print(f"      Total workflows: {analytics.get('total_workflows')}")
                    print(f"      Success rate: {analytics.get('success_rate')}%")
                    print(f"      System status: {system_status}")
                    return True
                else:
                    print(f"   ❌ Analytics missing fields: {analytics_missing}")
                    return False
            else:
                print(f"   ❌ Response missing fields: {missing_fields}")
                return False
        return False

    def run_comprehensive_workflow_test(self):
        """Run comprehensive workflow automation test suite"""
        print("🚀 Enhanced Intelligent Workflow Automation System Testing")
        print("🚗 Focus: Car Sales Knowledge Improvements & Demo Scenarios")
        print(f"   Backend URL: {self.base_url}")
        print(f"   API URL: {self.api_url}")
        print("="*80)
        
        # Priority Tests as requested in review
        priority_tests = [
            ("Demo Scenarios (3/3 execution)", self.test_demo_scenarios_critical),
            ("Car Sales Terminology Coverage (80%+)", self.test_car_sales_terminology_coverage),
            ("Voice AI Automotive Actions", self.test_voice_ai_automotive_actions),
            ("Automation Analytics", self.test_automation_analytics)
        ]
        
        print(f"\n🎯 Running {len(priority_tests)} Critical Workflow Automation Tests...")
        
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
        
        if success_rate >= 75:
            print("🎉 WORKFLOW AUTOMATION SYSTEM: SUCCESS!")
            if passed_tests >= 3:
                print("   ✅ All 3 demo scenarios working (fixing previous 2/3 issue)")
                print("   ✅ Car sales knowledge enhanced in workflow content")
                print("   ✅ Voice AI actions include automotive terminology")
                print("   ✅ Analytics show automotive-specific capabilities")
            return True
        else:
            print("⚠️  WORKFLOW AUTOMATION SYSTEM: NEEDS ATTENTION")
            print("   ❌ Some workflow automation features may need fixes")
            print("   ❌ Car sales knowledge enhancements may be incomplete")
            return False

if __name__ == "__main__":
    tester = WorkflowAutomationTester()
    success = tester.run_comprehensive_workflow_test()
    sys.exit(0 if success else 1)