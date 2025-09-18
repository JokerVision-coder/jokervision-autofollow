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
from datetime import datetime, timezone
from emergentintegrations.llm.chat import LlmChat, UserMessage
import json
import requests
import asyncio
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

# Lead Models
class Lead(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
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
    status: str = Field(default="new")  # new, contacted, scheduled, closed
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    last_contacted: Optional[datetime] = None
    notes: Optional[str] = None

class LeadCreate(BaseModel):
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

class SMSConfig(BaseModel):
    provider: str = "textbelt"  # "textbelt" or "mock"
    textbelt_api_key: Optional[str] = None

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

class AIResponseRequest(BaseModel):
    lead_id: str
    incoming_message: str
    phone_number: str

# SMS Templates
SMS_TEMPLATES = {
    "english": """Hi {first_name} 👋, this is Alfonso Martinez from Shottenkirk Toyota San Antonio 🚗. Thanks for reaching out through our ad 🙌. I'd love to help you find the perfect vehicle — can you tell me what you're looking for? (model, year, features, budget) 📝

I can have options ready for you when you visit. Do you prefer to come in today or tomorrow? 📅

📱 Call/Text: 210-632-8712""",
    
    "spanish": """Hola {first_name} 👋, soy Alfonso Martínez de Shottenkirk Toyota San Antonio 🚗. Gracias por contactarnos por nuestro anuncio 🙌. Me encantaría ayudarte a encontrar el vehículo ideal — ¿puedes decirme qué buscas? (modelo, año, características, presupuesto) 📝

Puedo tener opciones listas para cuando vengas. ¿Prefieres venir hoy o mañana? 📅

📱 Llamar/Mensaje: 210-632-8712"""
}

# Lead Management Routes
@api_router.post("/leads", response_model=Lead)
async def create_lead(lead_data: LeadCreate):
    lead_dict = lead_data.dict()
    lead_obj = Lead(**lead_dict)
    lead_doc = lead_obj.dict()
    lead_doc['created_at'] = lead_doc['created_at'].isoformat()
    if lead_doc.get('last_contacted'):
        lead_doc['last_contacted'] = lead_doc['last_contacted'].isoformat()
    
    await db.leads.insert_one(lead_doc)
    return lead_obj

@api_router.get("/leads", response_model=List[Lead])
async def get_leads():
    leads = await db.leads.find().sort("created_at", -1).to_list(1000)
    result = []
    for lead in leads:
        if isinstance(lead.get('created_at'), str):
            lead['created_at'] = datetime.fromisoformat(lead['created_at'])
        if isinstance(lead.get('last_contacted'), str) and lead.get('last_contacted'):
            lead['last_contacted'] = datetime.fromisoformat(lead['last_contacted'])
        result.append(Lead(**lead))
    return result

@api_router.get("/leads/{lead_id}", response_model=Lead)
async def get_lead(lead_id: str):
    lead = await db.leads.find_one({"id": lead_id})
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")
    
    if isinstance(lead.get('created_at'), str):
        lead['created_at'] = datetime.fromisoformat(lead['created_at'])
    if isinstance(lead.get('last_contacted'), str) and lead.get('last_contacted'):
        lead['last_contacted'] = datetime.fromisoformat(lead['last_contacted'])
    
    return Lead(**lead)

@api_router.put("/leads/{lead_id}", response_model=Lead)
async def update_lead(lead_id: str, update_data: LeadUpdate):
    update_dict = {k: v for k, v in update_data.dict().items() if v is not None}
    
    if update_dict:
        await db.leads.update_one({"id": lead_id}, {"$set": update_dict})
    
    updated_lead = await db.leads.find_one({"id": lead_id})
    if not updated_lead:
        raise HTTPException(status_code=404, detail="Lead not found")
    
    if isinstance(updated_lead.get('created_at'), str):
        updated_lead['created_at'] = datetime.fromisoformat(updated_lead['created_at'])
    if isinstance(updated_lead.get('last_contacted'), str) and updated_lead.get('last_contacted'):
        updated_lead['last_contacted'] = datetime.fromisoformat(updated_lead['last_contacted'])
    
    return Lead(**updated_lead)

async def send_textbelt_sms(phone: str, message: str, api_key: str = None) -> dict:
    """Send SMS via TextBelt API"""
    try:
        if api_key:
            # Use paid TextBelt API
            url = "https://textbelt.com/text"
            payload = {
                'phone': phone,
                'message': message,
                'key': api_key
            }
        else:
            # Use free TextBelt API (1 per day)
            url = "https://textbelt.com/text"
            payload = {
                'phone': phone,
                'message': message,
                'key': 'textbelt'
            }
        
        response = requests.post(url, data=payload, timeout=10)
        return response.json()
    except Exception as e:
        logging.error(f"TextBelt SMS error: {str(e)}")
        return {"success": False, "error": str(e)}

# SMS Routes
@api_router.post("/sms/send")
async def send_sms(lead_id: str, language: str = "english", provider: str = "mock", background_tasks: BackgroundTasks = None):
    # Get lead details
    lead = await db.leads.find_one({"id": lead_id})
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")
    
    # Generate SMS message from template
    template = SMS_TEMPLATES.get(language, SMS_TEMPLATES["english"])
    message = template.format(first_name=lead["first_name"])
    
    # Create SMS message record
    sms_data = SMSMessageCreate(
        lead_id=lead_id,
        phone_number=lead["primary_phone"],
        message=message,
        language=language
    )
    
    sms_obj = SMSMessage(**sms_data.dict())
    sms_doc = sms_obj.dict()
    sms_doc['created_at'] = sms_doc['created_at'].isoformat()
    
    await db.sms_messages.insert_one(sms_doc)
    
    # Update lead status
    await db.leads.update_one(
        {"id": lead_id}, 
        {
            "$set": {
                "status": "contacted",
                "last_contacted": datetime.now(timezone.utc).isoformat()
            }
        }
    )
    
    # Send SMS based on provider
    sms_result = {"status": "sent", "provider": provider}
    
    if provider == "textbelt":
        textbelt_key = os.environ.get('TEXTBELT_API_KEY')
        result = await asyncio.get_event_loop().run_in_executor(
            None, send_textbelt_sms, lead["primary_phone"], message, textbelt_key
        )
        
        if result.get("success"):
            sms_result.update({
                "message": "SMS sent successfully via TextBelt",
                "textbelt_id": result.get("textId"),
                "quota_remaining": result.get("quotaRemaining")
            })
        else:
            # Update SMS status to failed
            await db.sms_messages.update_one(
                {"id": sms_obj.id}, 
                {"$set": {"status": "failed"}}
            )
            sms_result.update({
                "status": "failed",
                "message": f"SMS failed: {result.get('error', 'Unknown error')}"
            })
    else:
        # Mock/simulation mode
        sms_result.update({
            "message": "SMS sent successfully (simulated)",
        })
    
    sms_result.update({
        "sms_content": message,
        "phone": lead["primary_phone"]
    })
    
    return sms_result

@api_router.get("/sms/messages/{lead_id}")
async def get_sms_messages(lead_id: str):
    messages = await db.sms_messages.find({"lead_id": lead_id}).sort("created_at", 1).to_list(1000)
    result = []
    for msg in messages:
        if isinstance(msg.get('created_at'), str):
            msg['created_at'] = datetime.fromisoformat(msg['created_at'])
        result.append(SMSMessage(**msg))
    return result

# Calendar/Appointment Routes
@api_router.post("/appointments", response_model=CalendarAppointment)
async def create_appointment(appointment_data: CalendarAppointmentCreate):
    # Verify lead exists
    lead = await db.leads.find_one({"id": appointment_data.lead_id})
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")
    
    appointment_obj = CalendarAppointment(**appointment_data.dict())
    appointment_doc = appointment_obj.dict()
    appointment_doc['appointment_datetime'] = appointment_doc['appointment_datetime'].isoformat()
    appointment_doc['created_at'] = appointment_doc['created_at'].isoformat()
    
    await db.appointments.insert_one(appointment_doc)
    
    # Update lead status to scheduled
    await db.leads.update_one(
        {"id": appointment_data.lead_id}, 
        {"$set": {"status": "scheduled"}}
    )
    
    return appointment_obj

@api_router.get("/appointments/{lead_id}")
async def get_lead_appointments(lead_id: str):
    appointments = await db.appointments.find({"lead_id": lead_id}).sort("appointment_datetime", 1).to_list(1000)
    result = []
    for apt in appointments:
        if isinstance(apt.get('appointment_datetime'), str):
            apt['appointment_datetime'] = datetime.fromisoformat(apt['appointment_datetime'])
        if isinstance(apt.get('created_at'), str):
            apt['created_at'] = datetime.fromisoformat(apt['created_at'])
        result.append(CalendarAppointment(**apt))
    return result

@api_router.get("/appointments")
async def get_all_appointments():
    appointments = await db.appointments.find().sort("appointment_datetime", 1).to_list(1000)
    result = []
    for apt in appointments:
        if isinstance(apt.get('appointment_datetime'), str):
            apt['appointment_datetime'] = datetime.fromisoformat(apt['appointment_datetime'])
        if isinstance(apt.get('created_at'), str):
            apt['created_at'] = datetime.fromisoformat(apt['created_at'])
        result.append(CalendarAppointment(**apt))
    return result

@api_router.put("/appointments/{appointment_id}")
async def update_appointment(appointment_id: str, status: str):
    await db.appointments.update_one(
        {"id": appointment_id}, 
        {"$set": {"status": status}}
    )
    return {"status": "updated", "appointment_id": appointment_id}

# Enhanced AI Response Route with Appointment Scheduling
@api_router.post("/ai/respond")
async def generate_ai_response(request: AIResponseRequest):
    try:
        # Get lead details for context
        lead = await db.leads.find_one({"id": request.lead_id})
        if not lead:
            raise HTTPException(status_code=404, detail="Lead not found")
        
        # Get conversation history
        messages = await db.sms_messages.find({"lead_id": request.lead_id}).sort("created_at", 1).to_list(1000)
        
        # Get upcoming appointments for context
        appointments = await db.appointments.find({"lead_id": request.lead_id}).to_list(1000)
        
        # Build context for AI
        lead_context = f"""
        Lead Information:
        - Name: {lead['first_name']} {lead['last_name']}
        - Phone: {lead['primary_phone']}
        - Email: {lead['email']}
        - Budget: {lead.get('budget', 'Not specified')}
        - Vehicle Type: {lead.get('vehicle_type', 'Not specified')}
        - Income: {lead.get('income', 'Not specified')}
        """
        
        conversation_history = ""
        for msg in messages[-5:]:  # Last 5 messages for context
            direction = "Customer" if msg.get('direction') == 'inbound' else "Alfonso"
            conversation_history += f"{direction}: {msg.get('message', '')}\n"
        
        appointment_context = ""
        if appointments:
            appointment_context = "\nUpcoming Appointments:\n"
            for apt in appointments:
                apt_datetime = apt.get('appointment_datetime')
                if isinstance(apt_datetime, str):
                    apt_datetime = datetime.fromisoformat(apt_datetime)
                appointment_context += f"- {apt.get('title', 'Appointment')} on {apt_datetime.strftime('%B %d, %Y at %I:%M %p')}\n"
        
        # Initialize AI chat
        emergent_key = os.environ.get('EMERGENT_LLM_KEY')
        if not emergent_key:
            raise HTTPException(status_code=500, detail="AI service not configured")
        
        system_message = f"""You are Alfonso Martinez, a professional car salesman at Shottenkirk Toyota San Antonio. 
        You are helpful, friendly, and focused on helping customers find the right vehicle.
        
        {lead_context}
        
        Previous conversation:
        {conversation_history}
        
        {appointment_context}
        
        Guidelines:
        - Be professional but friendly
        - Focus on understanding their needs
        - Suggest scheduling a visit to the dealership if they seem interested
        - If they want to schedule, ask for their preferred date/time
        - Provide helpful information about Toyota vehicles
        - Use appropriate emojis sparingly
        - Keep responses concise but helpful
        - Always end with your contact info: 📱 Call/Text: 210-632-8712
        
        Current date/time: {datetime.now(timezone.utc).strftime('%B %d, %Y at %I:%M %p')}
        """
        
        chat = LlmChat(
            api_key=emergent_key,
            session_id=f"lead_{request.lead_id}",
            system_message=system_message
        ).with_model("openai", "gpt-4o-mini")
        
        user_message = UserMessage(text=request.incoming_message)
        response = await chat.send_message(user_message)
        
        # Save the incoming message
        incoming_sms = SMSMessage(
            lead_id=request.lead_id,
            phone_number=request.phone_number,
            message=request.incoming_message,
            direction="inbound"
        )
        incoming_doc = incoming_sms.dict()
        incoming_doc['created_at'] = incoming_doc['created_at'].isoformat()
        await db.sms_messages.insert_one(incoming_doc)
        
        # Save the AI response
        response_sms = SMSMessage(
            lead_id=request.lead_id,
            phone_number=request.phone_number,
            message=response,
            direction="outbound"
        )
        response_doc = response_sms.dict()
        response_doc['created_at'] = response_doc['created_at'].isoformat()
        await db.sms_messages.insert_one(response_doc)
        
        # Analyze if customer wants to schedule an appointment
        schedule_keywords = ["schedule", "appointment", "visit", "come in", "see", "tomorrow", "today", "when can"]
        customer_message_lower = request.incoming_message.lower()
        suggests_scheduling = any(keyword in customer_message_lower for keyword in schedule_keywords)
        
        return {
            "response": response,
            "status": "success",
            "suggests_scheduling": suggests_scheduling
        }
        
    except Exception as e:
        logging.error(f"AI response error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"AI service error: {str(e)}")

# Bulk Import Route
@api_router.post("/leads/bulk")
async def bulk_import_leads(leads_text: str):
    try:
        # Parse leads from text (assuming similar format to the example)
        leads_created = []
        lead_blocks = leads_text.strip().split('\n\n')
        
        for block in lead_blocks:
            if not block.strip():
                continue
                
            lines = block.strip().split('\n')
            lead_data = {}
            
            for line in lines:
                if ':' in line:
                    key, value = line.split(':', 1)
                    key = key.strip().lower().replace(' ', '_')
                    value = value.strip()
                    
                    # Map common field names
                    field_mapping = {
                        'first_name': 'first_name',
                        'last_name': 'last_name',
                        'primary_phone': 'primary_phone',
                        'alternate_phone': 'alternate_phone',
                        'email': 'email',
                        'date_of_birth': 'date_of_birth',
                        'budget': 'budget',
                        'income': 'income',
                        'vehicle_type': 'vehicle_type',
                        'employment_status': 'employment_status',
                        'duration_of_employment': 'employment_duration',
                        'occupation': 'occupation',
                        'employer': 'employer',
                        'address': 'address',
                        'reference_#': 'reference_number'
                    }
                    
                    if key in field_mapping:
                        lead_data[field_mapping[key]] = value
            
            if lead_data.get('first_name') and lead_data.get('last_name'):
                lead_create = LeadCreate(**lead_data)
                lead_obj = Lead(**lead_create.dict())
                lead_doc = lead_obj.dict()
                lead_doc['created_at'] = lead_doc['created_at'].isoformat()
                
                await db.leads.insert_one(lead_doc)
                leads_created.append(lead_obj)
        
        return {
            "status": "success",
            "leads_created": len(leads_created),
            "leads": leads_created
        }
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error processing bulk import: {str(e)}")

# Dashboard Stats
@api_router.get("/dashboard/stats")
async def get_dashboard_stats():
    total_leads = await db.leads.count_documents({})
    new_leads = await db.leads.count_documents({"status": "new"})
    contacted_leads = await db.leads.count_documents({"status": "contacted"})
    scheduled_leads = await db.leads.count_documents({"status": "scheduled"})
    
    return {
        "total_leads": total_leads,
        "new_leads": new_leads,
        "contacted_leads": contacted_leads,
        "scheduled_leads": scheduled_leads
    }

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()