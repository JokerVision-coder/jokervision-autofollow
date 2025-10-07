#!/usr/bin/env python3
"""
End-to-end test for Facebook Marketplace lead automation workflow
"""
import requests
import json
from datetime import datetime, timezone

BASE_URL = "http://localhost:8000/api"
TENANT_ID = "shottenkirk_toyota"

def test_facebook_lead_automation():
    """Test complete Facebook lead automation workflow"""
    print("🚗 Testing Facebook Marketplace Lead Automation")
    print("=" * 60)
    
    # Step 1: Create a workflow for Facebook leads
    print("\n1. Creating Facebook Lead Workflow...")
    workflow_data = {
        "id": "fb_lead_workflow",
        "tenant_id": TENANT_ID,
        "name": "Facebook Marketplace Lead Auto-Response",
        "description": "Instant response and appointment generation for Facebook leads",
        "trigger": "facebook_marketplace_lead",
        "steps": [
            {
                "step_type": "sms",
                "delay_minutes": 2,
                "content": "Hi {name}! Thanks for your interest in our {vehicle}. I'm Alfonso from Shottenkirk Toyota. Can we schedule a quick test drive?"
            },
            {
                "step_type": "create_appointment",
                "delay_minutes": 5,
                "content": "Auto-generate appointment for interested leads"
            },
            {
                "step_type": "email",
                "delay_minutes": 30,
                "content": "Follow-up email with vehicle details, financing options, and dealership information"
            }
        ],
        "active": True,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    response = requests.post(f"{BASE_URL}/workflows", json=workflow_data)
    if response.status_code == 200:
        print("✅ Workflow created successfully")
    else:
        print(f"❌ Failed to create workflow: {response.text}")
        return False
    
    # Step 2: Simulate Facebook Marketplace lead capture
    print("\n2. Simulating Facebook Marketplace Lead...")
    lead_data = {
        "id": "fb_lead_001",
        "tenant_id": TENANT_ID,
        "first_name": "Maria",
        "last_name": "Rodriguez",
        "primary_phone": "+1-210-555-0123",
        "email": "maria.rodriguez@gmail.com",
        "vehicle_interest": "2024 Toyota Camry Hybrid",
        "vehicle_make": "Toyota",
        "vehicle_model": "Camry Hybrid",
        "vehicle_year": "2024",
        "vehicle_price_range": "$25,000-$30,000",
        "interest_level": "high",
        "source": "facebook_marketplace",
        "inquiry_message": "Is this Camry still available? I'm very interested and can come see it today.",
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    # Step 3: Trigger the workflow
    print("\n3. Triggering Automated Workflow...")
    trigger_data = {
        "event_type": "facebook_marketplace_lead",
        "tenant_id": TENANT_ID,
        "lead_data": lead_data
    }
    
    response = requests.post(f"{BASE_URL}/workflows/trigger", json=trigger_data)
    if response.status_code == 200:
        result = response.json()
        print("✅ Workflow triggered successfully")
        print(f"   📊 Triggered {result['triggered_workflows']} workflow(s)")
        
        # Display execution results
        for workflow in result['workflows']:
            print(f"\n   🔄 Workflow: {workflow['workflow_name']}")
            execution = workflow['execution_result']
            print(f"   📈 Steps executed: {execution['steps_executed']}")
            
            for step in execution['execution_log']:
                step_type = step['step_type']
                status = step['status']
                delay = step['delay_applied']
                
                if step_type == "sms":
                    print(f"   📱 SMS → {step['recipient']} ({status}) [+{delay}min]")
                elif step_type == "email":
                    print(f"   📧 Email → {step['recipient']} ({status}) [+{delay}min]")
                elif step_type == "create_appointment":
                    print(f"   📅 Appointment created ({status}) [+{delay}min]")
                    if step.get('appointment_id'):
                        print(f"      ID: {step['appointment_id']}")
    else:
        print(f"❌ Failed to trigger workflow: {response.text}")
        return False
    
    # Step 4: Test Facebook auto-response feature
    print("\n4. Testing Facebook Auto-Response...")
    response = requests.post(f"{BASE_URL}/facebook-marketplace/auto-respond", json=lead_data)
    if response.status_code == 200:
        result = response.json()
        print("✅ Auto-response generated successfully")
        print(f"   📤 Response sent: {result['response_sent']}")
        print(f"   📱 Method: {result.get('method', 'N/A')}")
        if result.get('message'):
            print(f"   💬 Message preview: {result['message'][:100]}...")
    else:
        print(f"❌ Failed to generate auto-response: {response.text}")
        return False
    
    # Step 5: Verify workflow exists in database
    print("\n5. Verifying Workflow Storage...")
    response = requests.get(f"{BASE_URL}/workflows?tenant_id={TENANT_ID}")
    if response.status_code == 200:
        workflows = response.json()['workflows']
        fb_workflows = [w for w in workflows if 'facebook' in w['name'].lower()]
        print(f"✅ Found {len(fb_workflows)} Facebook workflow(s) in database")
        for workflow in fb_workflows:
            print(f"   📋 {workflow['name']} - {len(workflow['steps'])} steps")
    else:
        print(f"❌ Failed to retrieve workflows: {response.text}")
        return False
    
    print("\n" + "=" * 60)
    print("🎉 Facebook Marketplace Lead Automation Test Complete!")
    print("\n📋 Summary of Automated Actions:")
    print("   • Instant SMS response to lead")
    print("   • Automatic appointment generation")
    print("   • Follow-up email scheduling")
    print("   • Lead data processing and storage")
    print("   • Workflow execution logging")
    
    return True

if __name__ == "__main__":
    success = test_facebook_lead_automation()
    if success:
        print("\n✅ All automation features working correctly!")
    else:
        print("\n❌ Some automation features need attention")