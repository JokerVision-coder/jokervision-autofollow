from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional
import uuid
from datetime import datetime, timezone, timedelta
from emergentintegrations.llm.chat import LlmChat, UserMessage
import json
import requests
import asyncio
import random
from fastapi import BackgroundTasks

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Lead Models - Updated for Multi-Tenant
class LeadCreate(BaseModel):
    tenant_id: str = "demo_tenant_123"
    first_name: str
    last_name: str
    primary_phone: str
    alternate_phone: Optional[str] = None
    email: str
    date_of_birth: Optional[str] = None
    budget: Optional[str] = None
    income: Optional[str] = None
    vehicle_type: Optional[str] = None
    employment_status: Optional[str] = None
    employment_duration: Optional[str] = None
    occupation: Optional[str] = None
    employer: Optional[str] = None
    address: Optional[str] = None
    reference_number: Optional[str] = None
    marketplace_inquiry: Optional[str] = None

class Lead(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    tenant_id: str = "demo_tenant_123"
    first_name: str
    last_name: str
    primary_phone: str
    alternate_phone: Optional[str] = None
    email: str
    date_of_birth: Optional[str] = None
    budget: Optional[str] = None
    income: Optional[str] = None
    vehicle_type: Optional[str] = None
    employment_status: Optional[str] = None
    employment_duration: Optional[str] = None
    occupation: Optional[str] = None
    employer: Optional[str] = None
    address: Optional[str] = None
    reference_number: Optional[str] = None
    marketplace_inquiry: Optional[str] = None
    status: str = "new"
    fb_sender_id: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class LeadUpdate(BaseModel):
    status: Optional[str] = None
    notes: Optional[str] = None

# SMS Message Models
class SMSMessage(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    lead_id: str
    phone_number: str
    message: str
    direction: str  # "outbound" or "inbound"
    language: str = "english"  # "english" or "spanish"
    status: str = "sent"  # "sent", "failed", "delivered"
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class SMSMessageCreate(BaseModel):
    lead_id: str
    phone_number: str
    message: str
    direction: str = "outbound"
    language: str = "english"

# AI Chat Models
class AIChatRequest(BaseModel):
    lead_id: str
    incoming_message: str
    phone_number: str

class AIChatResponse(BaseModel):
    response: str
    follow_up_scheduled: bool = False
    appointment_suggested: bool = False

# Calendar Appointment Models
class CalendarAppointment(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    lead_id: str
    appointment_datetime: datetime
    duration_minutes: int = 60
    title: str
    description: Optional[str] = None
    status: str = "scheduled"  # scheduled, completed, cancelled
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class CalendarAppointmentCreate(BaseModel):
    lead_id: str
    appointment_datetime: datetime
    duration_minutes: int = 60
    title: str
    description: Optional[str] = None

# Basic API Routes
@api_router.get("/")
async def root():
    return {"message": "JokerVision AutoFollow API", "status": "running", "version": "2.0.0"}

@api_router.get("/health")
async def health_check():
    return {"status": "healthy", "service": "jokervision-backend", "database": "connected"}

# Lead Management Routes
@api_router.post("/leads", response_model=Lead)
async def create_lead(lead_data: LeadCreate):
    """Create a new lead"""
    lead_obj = Lead(**lead_data.dict())
    
    # Convert datetime to string for MongoDB storage
    lead_doc = lead_obj.dict()
    lead_doc['created_at'] = lead_doc['created_at'].isoformat()
    
    await db.leads.insert_one(lead_doc)
    return lead_obj

@api_router.get("/leads", response_model=List[Lead])
async def get_leads(status: str = None, limit: int = 100):
    """Get all leads with optional status filter"""
    query = {}
    if status:
        query["status"] = status
    
    leads = await db.leads.find(query).sort("created_at", -1).limit(limit).to_list(limit)
    
    # Convert datetime strings back to datetime objects for Pydantic
    result = []
    for lead in leads:
        if isinstance(lead.get('created_at'), str):
            lead['created_at'] = datetime.fromisoformat(lead['created_at'])
        result.append(Lead(**lead))
    
    return result

@api_router.get("/leads/{lead_id}", response_model=Lead)
async def get_lead(lead_id: str):
    """Get a specific lead by ID"""
    lead = await db.leads.find_one({"id": lead_id})
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")
    
    if isinstance(lead.get('created_at'), str):
        lead['created_at'] = datetime.fromisoformat(lead['created_at'])
    
    return Lead(**lead)

@api_router.put("/leads/{lead_id}")
async def update_lead(lead_id: str, lead_update: LeadUpdate):
    """Update lead status and notes"""
    update_data = {k: v for k, v in lead_update.dict().items() if v is not None}
    
    if not update_data:
        raise HTTPException(status_code=400, detail="No update data provided")
    
    result = await db.leads.update_one({"id": lead_id}, {"$set": update_data})
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Lead not found")
    
    return {"status": "updated", "lead_id": lead_id}

# SMS Routes
@api_router.post("/sms/send", response_model=SMSMessage)
async def send_sms(sms_data: SMSMessageCreate):
    """Send SMS to lead"""
    # Create SMS message record
    sms_message = SMSMessage(**sms_data.dict())
    
    # Store in database
    message_doc = sms_message.dict()
    message_doc['created_at'] = message_doc['created_at'].isoformat()
    
    await db.sms_messages.insert_one(message_doc)
    
    # For now, we'll simulate SMS sending (replace with real TextBelt integration later)
    print(f"SMS sent to {sms_data.phone_number}: {sms_data.message}")
    
    return sms_message

@api_router.get("/sms/{lead_id}")
async def get_sms_messages(lead_id: str):
    """Get SMS conversation history for a lead"""
    messages = await db.sms_messages.find({"lead_id": lead_id}).sort("created_at", 1).to_list(1000)
    
    result = []
    for msg in messages:
        if isinstance(msg.get('created_at'), str):
            msg['created_at'] = datetime.fromisoformat(msg['created_at'])
        result.append(SMSMessage(**msg))
    
    return result

# AI Chat Routes
@api_router.post("/ai/chat", response_model=AIChatResponse)
async def ai_chat_response(chat_request: AIChatRequest):
    """Generate AI response for lead communication"""
    try:
        # Get lead details
        lead = await db.leads.find_one({"id": chat_request.lead_id})
        if not lead:
            raise HTTPException(status_code=404, detail="Lead not found")
        
        # Get conversation history
        sms_history = await db.sms_messages.find({"lead_id": chat_request.lead_id}).sort("created_at", 1).to_list(10)
        
        # Build context for AI
        lead_context = f"""
        Lead Information:
        - Name: {lead['first_name']} {lead['last_name']}
        - Phone: {lead['primary_phone']}
        - Vehicle Interest: {lead.get('vehicle_type', 'Not specified')}
        - Budget: {lead.get('budget', 'Not specified')}
        """
        
        conversation_history = ""
        for msg in sms_history[-5:]:  # Last 5 messages for context
            direction = "Customer" if msg.get('direction') == 'inbound' else "Alfonso"
            conversation_history += f"{direction}: {msg.get('message', '')}\n"
        
        # AI System Message for car sales context
        system_message = f"""You are Alfonso Martinez, a car salesman at Shottenkirk Toyota San Antonio.
        
        DEALERSHIP INFO: 18019 US-281, San Antonio TX 78232 | 210-526-2851
        INVENTORY: 214 New Toyotas + 367 Preowned vehicles (all makes/models)
        
        {lead_context}
        
        Previous conversation:
        {conversation_history}
        
        YOUR ROLE: Focus ONLY on setting appointments - not selling cars via text.
        
        GOALS:
        1. Get them to visit the dealership or schedule a phone call
        2. Create urgency and interest
        3. Be helpful but direct about scheduling
        4. Mention specific times/availability
        
        STYLE: Professional, friendly, brief (1-2 sentences), action-oriented
        
        Current time: {datetime.now(timezone.utc).strftime('%B %d, %Y at %I:%M %p')}
        """
        
        # Use Emergent LLM API
        emergent_key = os.environ.get('EMERGENT_LLM_KEY')
        if not emergent_key:
            return AIChatResponse(
                response="Thanks for your interest! I'd love to help you find the perfect vehicle. Can you give me a call at 210-632-8712?",
                follow_up_scheduled=False,
                appointment_suggested=True
            )
        
        chat = LlmChat(
            api_key=emergent_key,
            session_id=f"lead_{chat_request.lead_id}",
            system_message=system_message
        ).with_model("openai", "gpt-4o-mini")
        
        user_message = UserMessage(text=chat_request.incoming_message)
        response = await chat.send_message(user_message)
        
        # Analyze response for follow-up actions
        response_lower = response.lower()
        appointment_suggested = any(word in response_lower for word in ["visit", "appointment", "schedule", "call", "come in"])
        follow_up_scheduled = any(word in response_lower for word in ["follow up", "contact", "reach out"])
        
        return AIChatResponse(
            response=response,
            follow_up_scheduled=follow_up_scheduled,
            appointment_suggested=appointment_suggested
        )
        
    except Exception as e:
        logging.error(f"AI chat error: {str(e)}")
        return AIChatResponse(
            response="I'd be happy to help you with your vehicle needs! Please give me a call at 210-632-8712 so we can discuss the best options for you.",
            follow_up_scheduled=False,
            appointment_suggested=True
        )

# Appointment Routes
@api_router.post("/appointments", response_model=CalendarAppointment)
async def create_appointment(appointment_data: CalendarAppointmentCreate):
    """Schedule an appointment with a lead"""
    appointment_obj = CalendarAppointment(**appointment_data.dict())
    
    # Convert datetime to string for MongoDB
    appointment_doc = appointment_obj.dict()
    appointment_doc['created_at'] = appointment_doc['created_at'].isoformat() 
    appointment_doc['appointment_datetime'] = appointment_doc['appointment_datetime'].isoformat()
    
    await db.appointments.insert_one(appointment_doc)
    
    # Update lead status to scheduled
    await db.leads.update_one(
        {"id": appointment_data.lead_id},
        {"$set": {"status": "scheduled"}}
    )
    
    return appointment_obj

@api_router.get("/appointments")
async def get_appointments(date: str = None):
    """Get appointments, optionally filtered by date"""
    query = {}
    if date:
        # Parse date and create range for the whole day
        try:
            target_date = datetime.fromisoformat(date)
            start_of_day = target_date.replace(hour=0, minute=0, second=0, microsecond=0)
            end_of_day = target_date.replace(hour=23, minute=59, second=59, microsecond=999999)
            
            query["appointment_datetime"] = {
                "$gte": start_of_day.isoformat(),
                "$lte": end_of_day.isoformat()
            }
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid date format")
    
    appointments = await db.appointments.find(query).sort("appointment_datetime", 1).to_list(1000)
    
    result = []
    for appointment in appointments:
        if isinstance(appointment.get('created_at'), str):
            appointment['created_at'] = datetime.fromisoformat(appointment['created_at'])
        if isinstance(appointment.get('appointment_datetime'), str):
            appointment['appointment_datetime'] = datetime.fromisoformat(appointment['appointment_datetime'])
        result.append(CalendarAppointment(**appointment))
    
    return result

# Dashboard Stats
@api_router.get("/dashboard/stats")
async def get_dashboard_stats():
    """Get dashboard statistics"""
    # Get counts
    total_leads = await db.leads.count_documents({})
    new_leads = await db.leads.count_documents({"status": "new"})
    contacted_leads = await db.leads.count_documents({"status": "contacted"})
    scheduled_leads = await db.leads.count_documents({"status": "scheduled"})
    
    # Get today's appointments
    today = datetime.now(timezone.utc).replace(hour=0, minute=0, second=0, microsecond=0)
    tomorrow = today + timedelta(days=1)
    
    todays_appointments = await db.appointments.count_documents({
        "appointment_datetime": {
            "$gte": today.isoformat(),
            "$lt": tomorrow.isoformat()
        },
        "status": "scheduled"
    })
    
    # Get recent leads (last 7 days)
    week_ago = datetime.now(timezone.utc) - timedelta(days=7)
    recent_leads = await db.leads.count_documents({
        "created_at": {"$gte": week_ago.isoformat()}
    })
    
    return {
        "total_leads": total_leads,
        "new_leads": new_leads,
        "contacted_leads": contacted_leads,
        "scheduled_leads": scheduled_leads,
        "todays_appointments": todays_appointments,
        "recent_leads": recent_leads,
        "conversion_rate": round((scheduled_leads / total_leads * 100) if total_leads > 0 else 0, 1)
    }

# Recent Leads for Dashboard
@api_router.get("/dashboard/recent-leads")
async def get_recent_leads(limit: int = 5):
    """Get most recent leads for dashboard"""
    leads = await db.leads.find().sort("created_at", -1).limit(limit).to_list(limit)
    
    result = []
    for lead in leads:
        if isinstance(lead.get('created_at'), str):
            lead['created_at'] = datetime.fromisoformat(lead['created_at'])
        result.append(Lead(**lead))
    
    return result

# Include the router in the main app
app.include_router(api_router)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(level=logging.INFO)
