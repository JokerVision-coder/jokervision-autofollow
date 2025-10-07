#!/usr/bin/env python3
"""
Comprehensive demo of Facebook Marketplace Lead Automation System
This demonstrates the complete workflow from lead capture to appointment scheduling
"""
import requests
import json
import time
from datetime import datetime, timezone

BASE_URL = "http://localhost:8000/api"
TENANT_ID = "shottenkirk_toyota_demo"

def print_section(title):
    """Print a formatted section header"""
    print(f"\n{'='*60}")
    print(f"🚗 {title}")
    print('='*60)

def print_step(step_num, description):
    """Print a formatted step"""
    print(f"\n{step_num}. {description}")
    print("-" * 50)

def demo_facebook_marketplace_automation():
    """Complete demonstration of Facebook Marketplace automation"""
    
    print_section("FACEBOOK MARKETPLACE LEAD AUTOMATION DEMO")
    print("This demo shows how leads from Facebook Marketplace are automatically")
    print("processed with instant responses and appointment scheduling.")
    
    # Step 1: Create comprehensive workflow
    print_step(1, "Creating Advanced Facebook Lead Workflow")
    
    workflow_data = {
        "id": "advanced_fb_workflow",
        "tenant_id": TENANT_ID,
        "name": "Advanced Facebook Marketplace Automation",
        "description": "Multi-step automation for Facebook leads with personalized responses",
        "trigger": "facebook_marketplace_lead",
        "steps": [
            {
                "step_type": "sms",
                "delay_minutes": 1,
                "content": "Hi {name}! 👋 Thanks for your interest in our {vehicle}. I'm Alfonso from Shottenkirk Toyota San Antonio. I'd love to help you find the perfect car! When would be a good time for a quick test drive?"
            },
            {
                "step_type": "create_appointment",
                "delay_minutes": 3,
                "content": "Generate appointment for qualified leads"
            },
            {
                "step_type": "email",
                "delay_minutes": 15,
                "content": "Dear {name}, Thank you for your interest in the {year} {make} {vehicle}. We have this vehicle available at our {location} location. Our team is ready to help you with financing options and answer any questions you may have."
            },
            {
                "step_type": "sms",
                "delay_minutes": 1440,  # 24 hours later
                "content": "Hi {name}! Just following up on your interest in the {vehicle}. We have some great financing options available. Would you like to schedule a visit this week? 🚗"
            }
        ],
        "active": True,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    response = requests.post(f"{BASE_URL}/workflows", json=workflow_data)
    if response.status_code == 200:
        print("✅ Advanced workflow created successfully")
        print(f"   📋 Workflow ID: {workflow_data['id']}")
        print(f"   🔄 Steps: {len(workflow_data['steps'])}")
    else:
        print(f"❌ Failed to create workflow: {response.text}")
        return False
    
    # Step 2: Simulate multiple Facebook leads
    print_step(2, "Simulating Multiple Facebook Marketplace Leads")
    
    leads = [
        {
            "id": "fb_lead_high_001",
            "first_name": "Jennifer",
            "last_name": "Martinez",
            "primary_phone": "+1-210-555-0101",
            "email": "jennifer.martinez@gmail.com",
            "vehicle_interest": "2024 Toyota RAV4 Hybrid",
            "vehicle_make": "Toyota",
            "vehicle_model": "RAV4 Hybrid",
            "vehicle_year": "2024",
            "interest_level": "high",
            "inquiry_message": "Is this RAV4 still available? I need something reliable for my family.",
            "budget": "$35,000-$40,000"
        },
        {
            "id": "fb_lead_medium_002", 
            "first_name": "Carlos",
            "last_name": "Rodriguez",
            "primary_phone": "+1-210-555-0102",
            "email": "carlos.rodriguez@yahoo.com",
            "vehicle_interest": "2024 Toyota Camry",
            "vehicle_make": "Toyota",
            "vehicle_model": "Camry",
            "vehicle_year": "2024",
            "interest_level": "medium",
            "inquiry_message": "What's the best price you can do on this Camry?",
            "budget": "$25,000-$30,000"
        },
        {
            "id": "fb_lead_high_003",
            "first_name": "Amanda",
            "last_name": "Johnson",
            "primary_phone": "+1-210-555-0103", 
            "email": "amanda.johnson@outlook.com",
            "vehicle_interest": "2024 Toyota Tacoma",
            "vehicle_make": "Toyota",
            "vehicle_model": "Tacoma",
            "vehicle_year": "2024",
            "interest_level": "high",
            "inquiry_message": "I need this truck for work. Can I see it today?",
            "budget": "$40,000-$45,000"
        }
    ]
    
    # Process each lead
    for i, lead_data in enumerate(leads, 1):
        print(f"\n   👤 Processing Lead {i}: {lead_data['first_name']} {lead_data['last_name']}")
        print(f"      🚗 Interest: {lead_data['vehicle_interest']}")
        print(f"      📊 Level: {lead_data['interest_level']}")
        
        # Add common fields
        lead_data.update({
            "tenant_id": TENANT_ID,
            "source": "facebook_marketplace",
            "created_at": datetime.now(timezone.utc).isoformat()
        })
        
        # Trigger workflow for this lead
        trigger_data = {
            "event_type": "facebook_marketplace_lead",
            "tenant_id": TENANT_ID,
            "lead_data": lead_data
        }
        
        response = requests.post(f"{BASE_URL}/workflows/trigger", json=trigger_data)
        if response.status_code == 200:
            result = response.json()
            print(f"      ✅ Workflow triggered - {result['triggered_workflows']} workflow(s)")
            
            # Show execution details
            for workflow in result['workflows']:
                execution = workflow['execution_result']
                sms_count = sum(1 for step in execution['execution_log'] if step['step_type'] == 'sms')
                email_count = sum(1 for step in execution['execution_log'] if step['step_type'] == 'email')
                appointment_count = sum(1 for step in execution['execution_log'] if step['step_type'] == 'create_appointment')
                
                print(f"         📱 SMS: {sms_count} | 📧 Email: {email_count} | 📅 Appointments: {appointment_count}")
        else:
            print(f"      ❌ Failed to trigger workflow: {response.text}")
    
    # Step 3: Test personalized auto-responses
    print_step(3, "Testing Personalized Auto-Response System")
    
    for lead_data in leads[:2]:  # Test first 2 leads
        print(f"\n   🤖 Generating response for {lead_data['first_name']}...")
        
        response = requests.post(f"{BASE_URL}/facebook-marketplace/auto-respond", json=lead_data)
        if response.status_code == 200:
            result = response.json()
            print(f"      ✅ Response generated ({result.get('method', 'unknown')})")
            if result.get('message'):
                # Show first 80 characters of message
                preview = result['message'].replace('\n', ' ')[:80] + "..."
                print(f"      💬 Preview: {preview}")
        else:
            print(f"      ❌ Failed: {response.text}")
    
    # Step 4: Check generated appointments
    print_step(4, "Verifying Auto-Generated Appointments")
    
    response = requests.get(f"{BASE_URL}/appointments")
    if response.status_code == 200:
        appointments = response.json()
        auto_appointments = [apt for apt in appointments if apt.get('auto_generated')]
        
        print(f"   📅 Total appointments in system: {len(appointments)}")
        print(f"   🤖 Auto-generated appointments: {len(auto_appointments)}")
        
        if auto_appointments:
            print("\n   Recent auto-generated appointments:")
            for apt in auto_appointments[-3:]:  # Show last 3
                title = apt.get('title', 'No title')
                status = apt.get('status', 'Unknown')
                customer = apt.get('customer_name', 'Unknown customer')
                print(f"      • {title} - {customer} ({status})")
    else:
        print(f"   ❌ Failed to retrieve appointments: {response.text}")
    
    # Step 5: Show workflow analytics
    print_step(5, "Workflow Analytics & Performance")
    
    response = requests.get(f"{BASE_URL}/workflows?tenant_id={TENANT_ID}")
    if response.status_code == 200:
        workflows = response.json()['workflows']
        fb_workflows = [w for w in workflows if 'facebook' in w['name'].lower()]
        
        print(f"   📊 Active Facebook workflows: {len(fb_workflows)}")
        
        for workflow in fb_workflows:
            print(f"\n   🔄 {workflow['name']}")
            print(f"      📋 Steps: {len(workflow['steps'])}")
            print(f"      🎯 Trigger: {workflow['trigger']}")
            print(f"      ✅ Active: {workflow['active']}")
            
            # Show step breakdown
            steps = workflow['steps']
            step_types = {}
            for step in steps:
                step_type = step['step_type']
                step_types[step_type] = step_types.get(step_type, 0) + 1
            
            print(f"      📈 Step breakdown: {dict(step_types)}")
    
    # Summary
    print_section("AUTOMATION SUMMARY")
    print("✅ Facebook Marketplace Lead Automation is fully operational!")
    print("\n🚀 Key Features Demonstrated:")
    print("   • Instant SMS responses with personalized content")
    print("   • Automatic appointment generation for qualified leads")
    print("   • Multi-step email follow-up sequences")
    print("   • Interest-level based response customization")
    print("   • Complete workflow execution logging")
    print("   • Database integration for lead and appointment tracking")
    
    print("\n📈 Business Impact:")
    print("   • Zero response time for Facebook leads")
    print("   • Automated appointment scheduling reduces manual work")
    print("   • Personalized messaging improves conversion rates")
    print("   • 24/7 lead processing capability")
    print("   • Scalable workflow system for multiple lead sources")
    
    return True

if __name__ == "__main__":
    print("🎬 Starting Facebook Marketplace Automation Demo...")
    time.sleep(1)
    
    success = demo_facebook_marketplace_automation()
    
    if success:
        print(f"\n🎉 Demo completed successfully!")
        print("The Facebook Marketplace lead automation system is ready for production use.")
    else:
        print(f"\n❌ Demo encountered issues. Check server logs for details.")