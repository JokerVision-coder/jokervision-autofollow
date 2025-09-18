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

class FollowUpMessage(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    lead_id: str
    stage: str  # "initial", "second_follow", "third_follow", "appointment_reminder", "post_visit"
    message_template: str
    scheduled_datetime: datetime
    status: str = "pending"  # "pending", "sent", "failed"
    language: str = "english"
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class FollowUpMessageCreate(BaseModel):
    lead_id: str
    stage: str
    scheduled_datetime: datetime
    language: str = "english"

class BulkFollowUpRequest(BaseModel):
    lead_ids: List[str]
    stage: str
    delay_hours: int = 24
    language: str = "english"

class VoiceCall(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    lead_id: str
    phone_number: str
    call_duration: Optional[int] = None  # in seconds
    status: str = "initiated"  # initiated, in_progress, completed, failed, no_answer
    transcript: Optional[str] = None
    recording_url: Optional[str] = None
    call_outcome: Optional[str] = None  # appointment_scheduled, callback_requested, not_interested, no_answer
    scheduled_callback: Optional[datetime] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    completed_at: Optional[datetime] = None

class VoiceCallCreate(BaseModel):
    lead_id: str
    phone_number: str

class FacebookMessage(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    lead_id: Optional[str] = None  # Will be created if new lead
    fb_sender_id: str
    fb_page_id: str
    message_text: str
    message_type: str = "text"  # text, image, attachment
    direction: str  # inbound, outbound
    fb_message_id: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class FacebookLeadCreate(BaseModel):
    fb_sender_id: str
    first_name: str
    last_name: str
    phone_number: Optional[str] = None
    marketplace_inquiry: Optional[str] = None  # What vehicle they inquired about
    fb_profile_url: Optional[str] = None

class WebhookVerification(BaseModel):
    hub_mode: str = Field(alias="hub.mode")
    hub_challenge: str = Field(alias="hub.challenge") 
    hub_verify_token: str = Field(alias="hub.verify_token")

# Shottenkirk Toyota San Antonio Dealership Information
DEALERSHIP_INFO = {
    "name": "Shottenkirk Toyota San Antonio",
    "phone": "210-526-2851",
    "address": "18019 US-281, San Antonio TX 78232",
    "hours": {
        "sales": "Monday-Friday: 7 AM - 7 PM, Saturday: 7 AM - 5 PM, Sunday: Closed",
        "service": "Monday-Friday: 7 AM - 7 PM, Saturday: 7 AM - 5 PM, Sunday: Closed"
    },
    "inventory": {
        "new_toyota": {
            "total": 214,
            "popular_models": {
                "Tacoma": {"count": 44, "incentives": "APR and Lease specials"},
                "RAV4": {"count": 31, "incentives": "APR and Lease specials"},
                "Tundra": {"count": 29, "incentives": "APR specials"},
                "Camry": {"count": 23, "incentives": "APR and Lease specials"},
                "4Runner": {"count": 21, "incentives": "Available"},
                "Corolla": {"count": 18, "incentives": "APR and Lease specials"},
                "Sienna": {"count": 14, "incentives": "Available"},
                "Highlander": {"count": 7, "incentives": "Available"},
                "Corolla Cross": {"count": 6, "incentives": "Available"},
                "GR86": {"count": 5, "incentives": "Available"},
                "Grand Highlander": {"count": 4, "incentives": "Available"},
                "Crown": {"count": 3, "incentives": "Available"},
                "Land Cruiser": {"count": 2, "incentives": "Limited availability"},
                "Prius Plug-in Hybrid": {"count": 2, "incentives": "Available"},
                "GR Supra": {"count": 1, "incentives": "Available"},
                "Prius": {"count": 1, "incentives": "Available"},
                "RAV4 Plug-in Hybrid": {"count": 1, "incentives": "Limited availability"},
                "Sequoia": {"count": 1, "incentives": "Available"}
            }
        },
        "preowned": {
            "total": 367,
            "certified": "Toyota Certified Gold & Silver programs available"
        }
    },
    "services": [
        "New Toyota Sales",
        "Preowned Vehicle Sales (All Makes & Models)",
        "Toyota Certified Pre-Owned",
        "Service & Maintenance",
        "Genuine Toyota Parts",
        "Toyota Rent A Car",
        "Financing & Leasing",
        "Trade-in Evaluations"
    ],
    "current_promotions": {
        "Corolla": "APR and Lease specials available",
        "Camry": "APR and Lease specials available", 
        "RAV4": "APR and Lease specials available",
        "Tacoma": "APR and Lease specials available",
        "Tundra": "APR specials available"
    },
    "unique_selling_points": [
        "214 New Toyotas in stock",
        "367 Preowned vehicles (all makes & models)",
        "Toyota Certified Pre-Owned programs",
        "Award-winning Service & Parts department",
        "Toyota Rent A Car on-site",
        "Shuttle service available",
        "Comfortable customer lounge with WiFi",
        "Same-day service when possible"
    ]
}
FOLLOW_UP_TEMPLATES = {
    "english": {
        "initial": """Hi {first_name}! 👋 Alfonso here from Shottenkirk Toyota San Antonio. 

I see you're interested in finding the perfect vehicle. I'd love to help you get behind the wheel of something amazing! 🚗

Rather than going back and forth with messages, how about we schedule a quick 15-minute call or visit? I can show you exactly what we have that fits your budget of {budget} and answer all your questions.

What works better - today after 3pm or tomorrow morning? 

📱 Call/Text: 210-632-8712""",

        "second_follow": """Hi {first_name}, Alfonso from Shottenkirk Toyota again! 

I wanted to follow up on your vehicle inquiry. I know car shopping can feel overwhelming, but I promise I'll make it simple and stress-free for you! 😊

I have some great options in your {budget} range that just came in. Instead of describing them over text, how about a quick 10-minute visit? No pressure - just want to show you what's available.

Are you free this evening or would tomorrow work better?

📱 Call/Text: 210-632-8712""",

        "third_follow": """Hi {first_name}, this is Alfonso from Shottenkirk Toyota 🚗

I don't want to keep bothering you, but I genuinely want to help you find the right vehicle. Sometimes timing just isn't right, and that's totally okay!

If you're still looking, I'm here to help. If not, just let me know and I'll stop reaching out. 

But if you ARE still interested, I have 15 minutes available today to show you some options - no commitment required.

What do you say?

📱 Call/Text: 210-632-8712""",

        "appointment_reminder": """Hi {first_name}! 👋 

Just a friendly reminder about our appointment tomorrow at {appointment_time}. I'm excited to show you some great vehicles that match what you're looking for!

Please bring:
• Driver's license
• Proof of insurance (if you plan to test drive)

If anything comes up and you need to reschedule, just let me know!

See you soon! 
📱 Call/Text: 210-632-8712""",

        "post_visit": """Hi {first_name}! 

Thank you for taking the time to visit us today. I hope you felt comfortable and got all your questions answered! 

If you need any more information or want to move forward, I'm just a text away. If you decide to think it over, that's perfectly fine too - no pressure from me.

Either way, it was great meeting you!

📱 Call/Text: 210-632-8712"""
    },
    
    "spanish": {
        "initial": """¡Hola {first_name}! 👋 Soy Alfonso de Shottenkirk Toyota San Antonio.

Veo que estás interesado en encontrar el vehículo perfecto. ¡Me encantaría ayudarte a encontrar algo increíble! 🚗

En lugar de intercambiar mensajes, ¿qué tal si programamos una llamada rápida de 15 minutos o una visita? Puedo mostrarte exactamente lo que tenemos que se ajuste a tu presupuesto de {budget} y responder todas tus preguntas.

¿Qué te funciona mejor - hoy después de las 3pm o mañana por la mañana?

📱 Llamar/Mensaje: 210-632-8712""",

        "second_follow": """¡Hola {first_name}, Alfonso de Shottenkirk Toyota otra vez!

Quería hacer seguimiento sobre tu consulta de vehículo. Sé que comprar un auto puede sentirse abrumador, ¡pero te prometo que lo haré simple y sin estrés! 😊

Tengo algunas opciones excelentes en tu rango de {budget} que acaban de llegar. En lugar de describirlas por mensaje, ¿qué tal una visita rápida de 10 minutos? Sin presión - solo quiero mostrarte qué está disponible.

¿Estás libre esta tarde o te funcionaría mejor mañana?

📱 Llamar/Mensaje: 210-632-8712""",

        "third_follow": """Hola {first_name}, soy Alfonso de Shottenkirk Toyota 🚗

No quiero seguir molestándote, pero genuinamente quiero ayudarte a encontrar el vehículo correcto. A veces el momento no es el indicado, ¡y eso está totalmente bien!

Si todavía estás buscando, estoy aquí para ayudar. Si no, solo avísame y dejaré de contactarte.

Pero si AÚN estás interesado, tengo 15 minutos disponibles hoy para mostrarte algunas opciones - sin compromiso requerido.

¿Qué dices?

📱 Llamar/Mensaje: 210-632-8712""",

        "appointment_reminder": """¡Hola {first_name}! 👋

Solo un recordatorio amigable sobre nuestra cita mañana a las {appointment_time}. ¡Estoy emocionado de mostrarte algunos vehículos geniales que coinciden con lo que buscas!

Por favor trae:
• Licencia de conducir
• Prueba de seguro (si planeas hacer una prueba de manejo)

Si surge algo y necesitas reprogramar, ¡solo avísame!

¡Nos vemos pronto!
📱 Llamar/Mensaje: 210-632-8712""",

        "post_visit": """¡Hola {first_name}!

Gracias por tomarte el tiempo de visitarnos hoy. ¡Espero que te hayas sentido cómodo y hayas obtenido respuestas a todas tus preguntas!

Si necesitas más información o quieres seguir adelante, estoy a solo un mensaje de distancia. Si decides pensarlo, eso también está perfectamente bien - no hay presión de mi parte.

¡De cualquier manera, fue genial conocerte!

📱 Llamar/Mensaje: 210-632-8712"""
    }
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

def send_textbelt_sms(phone: str, message: str, api_key: str = None) -> dict:
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
    templates = FOLLOW_UP_TEMPLATES.get(language, FOLLOW_UP_TEMPLATES["english"])
    template = templates.get("initial", templates["initial"])
    message = template.format(
        first_name=lead["first_name"],
        budget=lead.get("budget", "your budget")
    )
    
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

# Follow-up SMS Routes
@api_router.post("/sms/follow-up")
async def send_follow_up_sms(lead_id: str, stage: str, language: str = "english", provider: str = "mock", appointment_time: str = None):
    """Send a follow-up SMS with a specific stage template"""
    # Get lead details
    lead = await db.leads.find_one({"id": lead_id})
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")
    
    # Validate stage
    valid_stages = ["initial", "second_follow", "third_follow", "appointment_reminder", "post_visit"]
    if stage not in valid_stages:
        raise HTTPException(status_code=400, detail=f"Invalid stage. Must be one of: {valid_stages}")
    
    # Generate SMS message from template
    templates = FOLLOW_UP_TEMPLATES.get(language, FOLLOW_UP_TEMPLATES["english"])
    template = templates.get(stage)
    
    if not template:
        raise HTTPException(status_code=400, detail=f"Template not found for stage: {stage}")
    
    # Format the message with lead data
    format_data = {
        "first_name": lead["first_name"],
        "budget": lead.get("budget", "your budget")
    }
    
    # Add appointment time if provided (for appointment_reminder stage)
    if appointment_time:
        format_data["appointment_time"] = appointment_time
    
    try:
        message = template.format(**format_data)
    except KeyError as e:
        raise HTTPException(status_code=400, detail=f"Missing required field for template: {str(e)}")
    
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
    
    # Update lead status based on stage
    status_mapping = {
        "initial": "contacted",
        "second_follow": "contacted", 
        "third_follow": "contacted",
        "appointment_reminder": "scheduled",
        "post_visit": "contacted"
    }
    
    await db.leads.update_one(
        {"id": lead_id}, 
        {
            "$set": {
                "status": status_mapping.get(stage, "contacted"),
                "last_contacted": datetime.now(timezone.utc).isoformat()
            }
        }
    )
    
    # Send SMS based on provider
    sms_result = {"status": "sent", "provider": provider, "stage": stage}
    
    if provider == "textbelt":
        textbelt_key = os.environ.get('TEXTBELT_API_KEY')
        result = await asyncio.get_event_loop().run_in_executor(
            None, send_textbelt_sms, lead["primary_phone"], message, textbelt_key
        )
        
        if result.get("success"):
            sms_result.update({
                "message": "Follow-up SMS sent successfully via TextBelt",
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
                "message": f"Follow-up SMS failed: {result.get('error', 'Unknown error')}"
            })
    else:
        # Mock/simulation mode
        sms_result.update({
            "message": f"Follow-up SMS ({stage}) sent successfully (simulated)",
        })
    
    sms_result.update({
        "sms_content": message,
        "phone": lead["primary_phone"]
    })
    
    return sms_result

@api_router.post("/sms/bulk-follow-up")
async def send_bulk_follow_up(request: BulkFollowUpRequest):
    """Send follow-up messages to multiple leads"""
    results = []
    
    for lead_id in request.lead_ids:
        try:
            # Schedule follow-up message
            scheduled_time = datetime.now(timezone.utc) + timedelta(hours=request.delay_hours)
            
            follow_up = FollowUpMessage(
                lead_id=lead_id,
                stage=request.stage,
                message_template=request.stage,
                scheduled_datetime=scheduled_time,
                language=request.language
            )
            
            follow_up_doc = follow_up.dict()
            follow_up_doc['scheduled_datetime'] = follow_up_doc['scheduled_datetime'].isoformat()
            follow_up_doc['created_at'] = follow_up_doc['created_at'].isoformat()
            
            await db.follow_up_messages.insert_one(follow_up_doc)
            
            results.append({
                "lead_id": lead_id,
                "status": "scheduled",
                "scheduled_time": scheduled_time.isoformat()
            })
            
        except Exception as e:
            results.append({
                "lead_id": lead_id,
                "status": "failed",
                "error": str(e)
            })
    
    return {
        "status": "completed",
        "total_leads": len(request.lead_ids),
        "results": results
    }

@api_router.get("/follow-up/pending")
async def get_pending_follow_ups():
    """Get all pending follow-up messages"""
    now = datetime.now(timezone.utc)
    pending_messages = await db.follow_up_messages.find({
        "status": "pending",
        "scheduled_datetime": {"$lte": now.isoformat()}
    }).to_list(1000)
    
    result = []
    for msg in pending_messages:
        if isinstance(msg.get('scheduled_datetime'), str):
            msg['scheduled_datetime'] = datetime.fromisoformat(msg['scheduled_datetime'])
        if isinstance(msg.get('created_at'), str):
            msg['created_at'] = datetime.fromisoformat(msg['created_at'])
        result.append(FollowUpMessage(**msg))
    
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
        
        system_message = f"""You are Alfonso Martinez, a TOP-PERFORMING car sales professional at Shottenkirk Toyota San Antonio with 15+ years of experience. Your #1 GOAL is to schedule appointments - NOT to sell cars over text.

        CORE PHILOSOPHY: "I can't sell a car through a text message, but I CAN get them to visit."

        {lead_context}
        
        Previous conversation:
        {conversation_history}
        
        {appointment_context}
        
        CRITICAL RULES FOR APPOINTMENT SETTING:
        
        1. **APPOINTMENT-FIRST MINDSET**: 
           - Your success is measured by appointments scheduled, not information shared
           - Every response should guide toward scheduling a visit
           - Use phrases like "Let me show you in person" or "It's easier if I show you"
        
        2. **OVERCOME COMMON OBJECTIONS**:
           - "Just looking" → "Perfect! Let me show you what's available so you know your options"
           - "Need to think" → "I understand. How about a quick 10-minute look? No commitment"
           - "Too expensive" → "Let me show you some options in your range. You might be surprised"
           - "Need to talk to spouse" → "Great idea! Bring them along. When works for both of you?"
        
        3. **CREATE URGENCY (Honestly)**:
           - Mention specific vehicles that match their needs
           - Reference current incentives with end dates
           - Use scarcity: "I have one left in that color/trim"
           - Time-sensitive: "This promotion ends this weekend"
        
        4. **APPOINTMENT SETTING TECHNIQUES**:
           - Offer 2 specific times: "Are you free today at 4pm or tomorrow at 10am?"
           - Keep visits short: "15-minute look" or "quick 10 minutes"
           - Remove pressure: "No commitment, just want to show you options"
           - Make it convenient: "I can have everything ready when you arrive"
        
        5. **TOYOTA EXPERTISE** (Use to build credibility):
           - Reliability: "Toyota's resale value is consistently highest"
           - Efficiency: "Camry gets 40+ MPG, saves you $2000/year in gas"
           - Safety: "All Toyotas come with Toyota Safety Sense 2.0 standard"
           - Warranty: "Toyota Care includes 2 years free maintenance"
        
        6. **BUDGET QUALIFICATION**:
           - If budget mentioned: Work within it, show value
           - If no budget: "What monthly payment feels comfortable?"
           - Focus on TOTAL cost of ownership, not just price
        
        7. **RESPONSE STYLE**:
           - Keep responses SHORT (2-3 sentences max)
           - Be conversational, not salesy
           - Use emojis sparingly (1-2 per message)
           - Always end with specific next step (appointment time)
           - Include your direct number: 📱 Call/Text: 210-632-8712
        
        8. **NEVER DO**:
           - Don't try to explain features over text
           - Don't negotiate prices via message
           - Don't overwhelm with too many options
           - Don't be pushy - be persistent but respectful
        
        9. **QUALIFYING QUESTIONS** (Keep brief):
           - Timeline: "When were you hoping to make a decision?"
           - Decision maker: "Will you be the only one deciding?"
           - Trade-in: "Do you have a vehicle to trade?"
           - Financing: "Will you be financing or paying cash?"
        
        10. **APPOINTMENT CONFIRMATION**:
            - Get specific commitment: day, time, what to bring
            - Confirm their phone number
            - Set expectations: "I'll have 2-3 options ready that fit your needs"
        
        Current date/time: {datetime.now(timezone.utc).strftime('%B %d, %Y at %I:%M %p')}
        
        REMEMBER: Your job is to get them IN THE DOOR, not to sell them a car over text!
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

# Configuration Routes
@api_router.get("/config/sms")
async def get_sms_config():
    textbelt_key = os.environ.get('TEXTBELT_API_KEY')
    return {
        "provider": "textbelt" if textbelt_key else "mock",
        "has_api_key": bool(textbelt_key),
        "free_mode": not bool(textbelt_key)
    }

@api_router.post("/config/sms")
async def update_sms_config(config: SMSConfig):
    # In a production app, you'd store this in database or update environment
    # For now, we'll just return the configuration
    return {
        "status": "updated",
        "provider": config.provider,
        "message": "SMS configuration updated (restart required for environment changes)"
    }

# Dashboard Stats (Enhanced)
@api_router.get("/dashboard/stats")
async def get_dashboard_stats():
    total_leads = await db.leads.count_documents({})
    new_leads = await db.leads.count_documents({"status": "new"})
    contacted_leads = await db.leads.count_documents({"status": "contacted"})
    scheduled_leads = await db.leads.count_documents({"status": "scheduled"})
    
    # Get upcoming appointments count
    today = datetime.now(timezone.utc).replace(hour=0, minute=0, second=0, microsecond=0)
    upcoming_appointments = await db.appointments.count_documents({
        "appointment_datetime": {"$gte": today.isoformat()},
        "status": "scheduled"
    })
    
    # Get recent activity (last 7 days)
    week_ago = datetime.now(timezone.utc) - timedelta(days=7)
    recent_leads = await db.leads.count_documents({
        "created_at": {"$gte": week_ago.isoformat()}
    })
    
    return {
        "total_leads": total_leads,
        "new_leads": new_leads,
        "contacted_leads": contacted_leads,
        "scheduled_leads": scheduled_leads,
        "upcoming_appointments": upcoming_appointments,
        "recent_leads": recent_leads
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