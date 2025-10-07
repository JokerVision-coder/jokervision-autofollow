#!/usr/bin/env python3
"""
Test script for the new workflow automation endpoints
"""
import requests
import json
from datetime import datetime, timezone

# Test configuration
BASE_URL = "http://localhost:8000/api"
TENANT_ID = "test_tenant_123"

def test_create_workflow():
    """Test creating a new workflow"""
    workflow_data = {
        "id": "test_workflow_001",
        "tenant_id": TENANT_ID,
        "name": "Facebook Lead Auto-Response",
        "description": "Automated response workflow for Facebook Marketplace leads",
        "trigger": "facebook_lead",
        "steps": [
            {
                "step_type": "sms",
                "delay_minutes": 5,
                "content": "Hi {name}! Thanks for your interest in our {vehicle}. I'll be in touch shortly!"
            },
            {
                "step_type": "create_appointment",
                "delay_minutes": 30,
                "content": "Auto-generate appointment for high-interest leads"
            },
            {
                "step_type": "email",
                "delay_minutes": 60,
                "content": "Follow-up email with vehicle details and financing options"
            }
        ],
        "active": True,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    try:
        response = requests.post(f"{BASE_URL}/workflows", json=workflow_data)
        print(f"Create Workflow Status: {response.status_code}")
        if response.status_code == 200:
            print("✅ Workflow created successfully")
            print(json.dumps(response.json(), indent=2))
        else:
            print(f"❌ Failed to create workflow: {response.text}")
        return response.status_code == 200
    except Exception as e:
        print(f"❌ Error testing workflow creation: {str(e)}")
        return False

def test_trigger_workflow():
    """Test triggering a workflow with lead data"""
    trigger_data = {
        "event_type": "facebook_lead",
        "tenant_id": TENANT_ID,
        "lead_data": {
            "id": "lead_123",
            "tenant_id": TENANT_ID,
            "first_name": "John",
            "last_name": "Doe",
            "primary_phone": "+1234567890",
            "email": "john.doe@example.com",
            "vehicle_interest": "2024 Toyota Camry",
            "vehicle_make": "Toyota",
            "vehicle_year": "2024",
            "interest_level": "high",
            "source": "facebook_marketplace"
        }
    }
    
    try:
        response = requests.post(f"{BASE_URL}/workflows/trigger", json=trigger_data)
        print(f"Trigger Workflow Status: {response.status_code}")
        if response.status_code == 200:
            print("✅ Workflow triggered successfully")
            print(json.dumps(response.json(), indent=2))
        else:
            print(f"❌ Failed to trigger workflow: {response.text}")
        return response.status_code == 200
    except Exception as e:
        print(f"❌ Error testing workflow trigger: {str(e)}")
        return False

def test_facebook_auto_respond():
    """Test Facebook Marketplace auto-response"""
    lead_data = {
        "first_name": "Sarah",
        "last_name": "Johnson", 
        "primary_phone": "+1987654321",
        "email": "sarah.johnson@example.com",
        "vehicle_interest": "2024 Toyota RAV4",
        "interest_level": "high",
        "dealership": "Shottenkirk Toyota"
    }
    
    try:
        response = requests.post(f"{BASE_URL}/facebook-marketplace/auto-respond", json=lead_data)
        print(f"Auto-Response Status: {response.status_code}")
        if response.status_code == 200:
            print("✅ Auto-response generated successfully")
            result = response.json()
            print(f"Response sent: {result.get('response_sent')}")
            print(f"Message: {result.get('message', '')[:100]}...")
        else:
            print(f"❌ Failed to generate auto-response: {response.text}")
        return response.status_code == 200
    except Exception as e:
        print(f"❌ Error testing auto-response: {str(e)}")
        return False

def main():
    """Run all workflow tests"""
    print("🚀 Testing Workflow Automation Endpoints")
    print("=" * 50)
    
    # Test 1: Create workflow
    print("\n1. Testing Workflow Creation...")
    create_success = test_create_workflow()
    
    # Test 2: Trigger workflow
    print("\n2. Testing Workflow Trigger...")
    trigger_success = test_trigger_workflow()
    
    # Test 3: Facebook auto-response
    print("\n3. Testing Facebook Auto-Response...")
    response_success = test_facebook_auto_respond()
    
    # Summary
    print("\n" + "=" * 50)
    print("📊 Test Results Summary:")
    print(f"✅ Workflow Creation: {'PASS' if create_success else 'FAIL'}")
    print(f"✅ Workflow Trigger: {'PASS' if trigger_success else 'FAIL'}")
    print(f"✅ Auto-Response: {'PASS' if response_success else 'FAIL'}")
    
    total_tests = 3
    passed_tests = sum([create_success, trigger_success, response_success])
    print(f"\n🎯 Overall: {passed_tests}/{total_tests} tests passed")
    
    if passed_tests == total_tests:
        print("🎉 All workflow automation features are working!")
    else:
        print("⚠️  Some tests failed - check server logs for details")

if __name__ == "__main__":
    main()