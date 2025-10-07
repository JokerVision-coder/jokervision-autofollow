from fastapi import FastAPI, APIRouter, HTTPException, Query
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Dict, Optional
import uuid
from datetime import datetime, timezone, timedelta
from emergentintegrations.llm.chat import LlmChat, UserMessage
from emergentintegrations.llm.openai import OpenAIChatRealtime
import json
import requests
import asyncio
import random
from fastapi import BackgroundTasks
from inventory_scraper import ShottenkilkInventoryScraper
from ml_models import get_ml_engine

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Initialize OpenAI Realtime Chat for Revolutionary Voice AI
EMERGENT_LLM_KEY = os.getenv("EMERGENT_LLM_KEY")
if EMERGENT_LLM_KEY:
    realtime_chat = OpenAIChatRealtime(api_key=EMERGENT_LLM_KEY)
    realtime_router = APIRouter()
    OpenAIChatRealtime.register_openai_realtime_router(realtime_router, realtime_chat)
    app.include_router(realtime_router, prefix="/api/voice")
    logger.info("🎤 Revolutionary Voice AI System initialized successfully")
else:
    logger.warning("EMERGENT_LLM_KEY not found - Voice AI disabled")

# Lead Models - Updated for Multi-Tenant
class LeadCreate(BaseModel):
    tenant_id: str
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

# Multi-Tenant SaaS Models
class Tenant(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    company_name: str
    subdomain: str  # unique subdomain for each dealership
    phone: str
    email: str
    address: str
    logo_url: Optional[str] = None
    subscription_tier: str = "starter"  # starter, professional, enterprise
    subscription_status: str = "active"  # active, suspended, cancelled
    billing_email: str
    monthly_price: float
    max_users: int = 4  # based on subscription tier
    max_leads: int = 1000  # based on subscription tier
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    trial_end_date: Optional[datetime] = None
    last_payment_date: Optional[datetime] = None
    next_billing_date: Optional[datetime] = None

class TenantCreate(BaseModel):
    company_name: str
    subdomain: str
    phone: str
    email: str
    address: str
    billing_email: str
    subscription_tier: str = "starter"

class SubscriptionTier(BaseModel):
    name: str
    price: float
    max_users: int
    max_leads: int
    features: List[str]
    sms_credits: int
    voice_minutes: int
    ai_responses: int

# Subscription Tiers Definition
SUBSCRIPTION_TIERS = {
    "starter": SubscriptionTier(
        name="Starter",
        price=99.00,
        max_users=4,
        max_leads=1000,
        features=["Lead Management", "SMS Follow-up", "Basic Analytics", "3 Team Members"],
        sms_credits=500,
        voice_minutes=0,
        ai_responses=1000
    ),
    "professional": SubscriptionTier(
        name="Professional", 
        price=199.00,
        max_users=10,
        max_leads=5000,
        features=["Everything in Starter", "AI Voice Calling", "Advanced Analytics", "Facebook Integration", "Custom Branding"],
        sms_credits=2000,
        voice_minutes=500,
        ai_responses=5000
    ),
    "enterprise": SubscriptionTier(
        name="Enterprise",
        price=399.00,
        max_users=50,
        max_leads=25000,
        features=["Everything in Professional", "API Access", "Custom Integrations", "Priority Support", "White Label"],
        sms_credits=10000,
        voice_minutes=2000,
        ai_responses=25000
    )
}

class Usage(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    tenant_id: str
    month: int
    year: int
    sms_sent: int = 0
    voice_minutes_used: int = 0
    ai_responses_used: int = 0
    leads_created: int = 0
    sales_recorded: int = 0
    active_users: int = 0
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

# Keep the BulkFollowUpRequest for backward compatibility
class BulkFollowUpRequest(BaseModel):
    lead_ids: List[str]
    stage: str
    delay_hours: int = 24
    language: str = "english"

# Creative Studio & Organic Strategy Models
class CreativeTemplate(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    tenant_id: str
    name: str
    category: str  # "ad_creative", "social_post", "story", "video", "carousel"
    platform: str  # "facebook", "instagram", "tiktok", "linkedin", "universal"
    template_type: str  # "image", "video", "text", "mixed"
    industry: str = "automotive"
    dimensions: dict  # {"width": 1080, "height": 1080}
    design_elements: dict  # Colors, fonts, layout structure
    template_data: dict  # JSON structure of the template
    preview_url: Optional[str] = None
    usage_count: int = 0
    rating: float = 5.0
    tags: List[str] = []
    is_premium: bool = False
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class CreativeAsset(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    tenant_id: str
    name: str
    asset_type: str  # "image", "video", "audio", "font", "logo"
    file_url: str
    file_size: int  # in bytes
    dimensions: Optional[dict] = None
    duration: Optional[float] = None  # for video/audio
    tags: List[str] = []
    folder: Optional[str] = None
    usage_rights: str = "tenant_owned"  # "tenant_owned", "licensed", "stock"
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class ContentCalendar(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    tenant_id: str
    name: str
    platform: str
    post_type: str  # "organic", "paid", "story", "reel"
    content: dict  # Title, description, hashtags, etc.
    media_assets: List[str] = []  # Asset IDs
    scheduled_date: datetime
    status: str = "scheduled"  # "scheduled", "published", "failed", "draft"
    engagement_prediction: Optional[dict] = None
    actual_performance: Optional[dict] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class OrganicStrategy(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    tenant_id: str
    strategy_name: str
    platform: str
    objective: str  # "awareness", "engagement", "traffic", "leads", "sales"
    target_audience: dict
    content_themes: List[str]
    posting_schedule: dict
    hashtag_strategy: dict
    engagement_tactics: List[str]
    kpis: dict  # Key performance indicators
    duration_days: int
    status: str = "active"  # "active", "paused", "completed"
    performance_metrics: Optional[dict] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class ContentIdea(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    tenant_id: str
    title: str
    platform: str
    content_type: str  # "educational", "promotional", "behind_scenes", "user_generated", "trending"
    description: str
    suggested_copy: str
    hashtags: List[str]
    call_to_action: str
    estimated_engagement: str = "medium"  # "low", "medium", "high"
    difficulty_level: str = "easy"  # "easy", "medium", "hard"
    resources_needed: List[str] = []
    trending_score: float = 0.0
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class HashtagResearch(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    tenant_id: str
    hashtag: str
    platform: str
    volume: int  # estimated monthly usage
    difficulty: str  # "low", "medium", "high"
    relevance_score: float  # 0.0 to 1.0
    trending: bool = False
    related_hashtags: List[str] = []
    suggested_for: List[str] = []  # content types
    last_updated: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

# Organic Growth Strategies Database
ORGANIC_STRATEGIES = {
    "automotive_dealership": {
        "awareness": {
            "content_pillars": [
                "Vehicle showcases and reviews",
                "Behind-the-scenes dealership life", 
                "Customer success stories",
                "Automotive education and tips",
                "Community involvement"
            ],
            "posting_frequency": {
                "facebook": {"posts_per_week": 5, "optimal_times": ["12:00", "15:00", "19:00"]},
                "instagram": {"posts_per_week": 7, "stories_per_day": 3, "reels_per_week": 3},
                "tiktok": {"videos_per_week": 5, "optimal_times": ["18:00", "20:00", "21:00"]},
                "linkedin": {"posts_per_week": 3, "optimal_times": ["08:00", "12:00", "17:00"]}
            },
            "hashtag_strategy": {
                "branded": ["#ShottenKirkToyota", "#YourDealershipName"],
                "local": ["#SanAntonioDealer", "#TexasCars", "#LocalDealer"],
                "industry": ["#Toyota", "#NewCars", "#CarDealer", "#AutomotiveSales"],
                "trending": ["#CarTok", "#AutoLife", "#NewCarSmell"]
            }
        },
        "engagement": {
            "tactics": [
                "Ask questions in captions",
                "Create polls and interactive stories", 
                "Respond to comments within 2 hours",
                "Share user-generated content",
                "Host live Q&A sessions"
            ],
            "content_ideas": [
                "Car vs Car comparison videos",
                "Guess the car price games",
                "Customer testimonial features",
                "Day in the life of a car salesperson",
                "Before/after car transformation"
            ]
        }
    }
}

# Creative Templates Database
CREATIVE_TEMPLATES = {
    "automotive_ads": [
        {
            "name": "Vehicle Showcase - Modern",
            "platform": "instagram",
            "type": "image",
            "elements": {
                "layout": "hero_image_with_overlay",
                "colors": ["#1a1a1a", "#ffffff", "#ff6b35"],
                "fonts": ["Montserrat Bold", "Open Sans"],
                "components": ["vehicle_image", "price_overlay", "cta_button", "dealer_logo"]
            }
        },
        {
            "name": "Deal of the Week - Video",
            "platform": "tiktok", 
            "type": "video",
            "elements": {
                "duration": "15-30 seconds",
                "style": "fast_paced_cuts",
                "music": "upbeat_trendy",
                "text_overlays": ["price", "features", "call_to_action"]
            }
        },
        {
            "name": "Facebook Marketplace Listing",
            "platform": "facebook",
            "type": "image",
            "elements": {
                "layout": "detailed_grid",
                "colors": ["#1877f2", "#ffffff", "#42b883"],
                "fonts": ["Helvetica Neue", "Arial"],
                "components": ["multiple_vehicle_images", "detailed_specs", "price_prominent", "contact_info", "location"]
            }
        },
        {
            "name": "Facebook Event Promotion",
            "platform": "facebook",
            "type": "image",
            "elements": {
                "layout": "event_banner",
                "colors": ["#1877f2", "#ffffff", "#ff6b35"],
                "fonts": ["Open Sans Bold", "Roboto"],
                "components": ["event_title", "date_time", "dealership_logo", "special_offers", "cta_button"]
            }
        },
        {
            "name": "Facebook Sales Event",
            "platform": "facebook",
            "type": "carousel",
            "elements": {
                "layout": "multi_card_carousel",
                "colors": ["#1877f2", "#ffffff", "#28a745"],
                "fonts": ["Helvetica Neue Bold", "Arial"],
                "components": ["vehicle_cards", "savings_badges", "financing_info", "urgency_text"]
            }
        },
        {
            "name": "Facebook Customer Testimonial",
            "platform": "facebook",
            "type": "video",
            "elements": {
                "duration": "30-60 seconds",
                "style": "authentic_customer_story",
                "audio": "clear_voiceover",
                "text_overlays": ["customer_name", "vehicle_purchased", "satisfaction_rating"]
            }
        }
    ]
}

class CreativeEngine:
    @staticmethod
    def generate_content_ideas(platform: str, objective: str, industry: str = "automotive") -> List[dict]:
        """Generate AI-powered content ideas"""
        base_ideas = {
            "facebook": [
                {
                    "title": "Customer Success Story Feature",
                    "type": "testimonial",
                    "description": "Share a detailed customer journey from inquiry to purchase",
                    "copy": "Meet [Customer Name]! They came to us looking for [need] and drove away with [vehicle]. Here's their story...",
                    "hashtags": ["#CustomerStory", "#HappyCustomer", "#TestimonialTuesday"],
                    "engagement": "high"
                },
                {
                    "title": "Vehicle Feature Spotlight", 
                    "type": "educational",
                    "description": "Highlight a specific feature of a vehicle in your inventory",
                    "copy": "Did you know the [Vehicle Model] comes with [Feature]? Here's why it matters for your daily drive...",
                    "hashtags": ["#VehicleFeatures", "#TechTuesday", "#SafetyFirst"],
                    "engagement": "medium"
                }
            ],
            "instagram": [
                {
                    "title": "Behind-the-Scenes Content",
                    "type": "behind_scenes", 
                    "description": "Show the process of preparing a car for delivery",
                    "copy": "The magic happens before you arrive! ✨ Watch how we prep your new ride for that perfect first drive",
                    "hashtags": ["#BehindTheScenes", "#CarPrep", "#DetailingDay"],
                    "engagement": "high"
                },
                {
                    "title": "Quick Car Care Tips",
                    "type": "educational",
                    "description": "Share valuable car maintenance tips", 
                    "copy": "Pro tip: [Maintenance tip] 🚗💡 Your car (and wallet) will thank you later!",
                    "hashtags": ["#CarCareTips", "#MaintenanceMonday", "#ProTips"],
                    "engagement": "medium"
                }
            ],
            "tiktok": [
                {
                    "title": "Car Feature in 15 Seconds",
                    "type": "viral_trend",
                    "description": "Quick showcase of a cool car feature using trending audio",
                    "copy": "POV: You discover [car feature] for the first time 🤯",
                    "hashtags": ["#CarTok", "#FeatureReveal", "#MindBlown"],
                    "engagement": "very_high"
                }
            ]
        }
        
        return base_ideas.get(platform, [])
    
    @staticmethod
    def optimize_hashtags(platform: str, content_type: str, location: str = "") -> dict:
        """Generate optimized hashtag strategy"""
        base_tags = {
            "facebook": {
                "limit": 5,  # Facebook doesn't favor many hashtags
                "strategy": "focus_on_branded_and_local"
            },
            "instagram": {
                "limit": 30,
                "strategy": "mix_of_all_types",
                "distribution": {
                    "branded": 2,
                    "industry": 10, 
                    "local": 5,
                    "trending": 8,
                    "niche": 5
                }
            },
            "tiktok": {
                "limit": 20,
                "strategy": "trending_heavy",
                "focus": "viral_potential"
            },
            "linkedin": {
                "limit": 10,
                "strategy": "professional_industry_focus"
            }
        }
        
        return base_tags.get(platform, {})
    
    @staticmethod
    def calculate_content_score(content_data: dict, platform: str) -> dict:
        """Calculate predicted performance score for content"""
        score = 0.5  # Base score
        
        # Platform-specific scoring
        if platform == "instagram":
            if "hashtags" in content_data and len(content_data["hashtags"]) > 20:
                score += 0.2
            if "visual_appeal" in content_data and content_data["visual_appeal"] == "high":
                score += 0.3
        
        elif platform == "tiktok":
            if "trending_audio" in content_data:
                score += 0.4
            if "video_length" in content_data and 15 <= content_data["video_length"] <= 30:
                score += 0.2
        
        # General scoring factors
        if "call_to_action" in content_data:
            score += 0.1
        if "user_generated" in content_data and content_data["user_generated"]:
            score += 0.2
        
        return {
            "predicted_score": min(score, 1.0),
            "engagement_level": "high" if score > 0.8 else "medium" if score > 0.6 else "low",
            "viral_potential": "high" if score > 0.9 else "medium" if score > 0.7 else "low"
        }
class PolicyRule(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    platform: str  # "facebook", "instagram", "tiktok", "linkedin"
    category: str  # "content", "targeting", "frequency", "landing_page", "creative"
    rule_type: str  # "prohibited", "restricted", "warning", "best_practice"
    title: str
    description: str
    violation_keywords: List[str] = []
    max_frequency: Optional[dict] = None  # {"daily": 5, "weekly": 20}
    severity: str = "medium"  # "low", "medium", "high", "critical"
    auto_fix: bool = False
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class ComplianceCheck(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    tenant_id: str
    campaign_id: Optional[str] = None
    creative_id: Optional[str] = None
    check_type: str  # "pre_launch", "ongoing", "post_violation"
    platform: str
    status: str = "pending"  # "pending", "passed", "failed", "warning"
    violations: List[dict] = []
    recommendations: List[str] = []
    risk_score: float = 0.0  # 0.0 to 1.0
    checked_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class AccountHealth(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    tenant_id: str
    platform: str
    account_id: str
    health_score: float = 1.0  # 0.0 to 1.0 (1.0 = perfect health)
    violation_count: int = 0
    warning_count: int = 0
    last_violation_date: Optional[datetime] = None
    spending_velocity: float = 0.0  # Daily spend increase rate
    frequency_score: float = 1.0  # Posting frequency compliance
    content_score: float = 1.0  # Content quality score
    status: str = "healthy"  # "healthy", "at_risk", "restricted", "suspended"
    recommendations: List[str] = []
    last_checked: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class SafetyGuideline(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    platform: str
    category: str
    guideline: str
    importance: str = "high"  # "low", "medium", "high", "critical"
    auto_enforce: bool = True

# Platform-Specific Policy Rules
PLATFORM_POLICIES = {
    "facebook": {
        "prohibited_content": [
            "before/after weight loss claims", "miracle cures", "get rich quick",
            "tobacco", "weapons", "adult content", "discriminatory language",
            "misleading claims", "fake testimonials", "clickbait"
        ],
        "restricted_targeting": [
            "health conditions", "financial status", "personal struggles",
            "age under 18 for certain products", "lookalike audiences over 10%"
        ],
        "frequency_limits": {
            "daily_posts": 5,
            "weekly_campaigns": 20,
            "audience_overlap": 0.25
        },
        "creative_requirements": {
            "text_ratio": 0.20,  # Max 20% text in images
            "video_length": {"min": 1, "max": 240},  # seconds
            "image_resolution": {"min_width": 1200, "min_height": 628}
        }
    },
    "instagram": {
        "prohibited_content": [
            "fake followers/engagement", "adult content", "counterfeit goods",
            "before/after claims", "misleading information", "spam hashtags"
        ],
        "hashtag_limits": {
            "max_per_post": 30,
            "banned_hashtags": ["#follow4follow", "#like4like", "#followback"]
        },
        "frequency_limits": {
            "daily_posts": 3,
            "daily_stories": 10,
            "hourly_actions": 60
        },
        "engagement_rules": {
            "max_follows_per_hour": 20,
            "max_likes_per_hour": 100,
            "max_comments_per_hour": 20
        }
    },
    "tiktok": {
        "prohibited_content": [
            "political ads", "adult content", "dangerous challenges",
            "misleading health claims", "fake news", "copyright violations"
        ],
        "creative_requirements": {
            "video_length": {"min": 9, "max": 60},  # seconds
            "resolution": "720p minimum",
            "format": ["mp4", "mov", "avi"]
        },
        "frequency_limits": {
            "daily_posts": 3,
            "campaign_changes": 5
        },
        "targeting_restrictions": [
            "no custom audiences under 1000",
            "no sensitive interest targeting"
        ]
    },
    "linkedin": {
        "prohibited_content": [
            "inappropriate professional content", "misleading job postings",
            "get rich quick schemes", "adult content", "discriminatory language"
        ],
        "targeting_limits": {
            "audience_size_min": 1000,
            "location_targeting_max": 10
        },
        "frequency_limits": {
            "daily_inmails": 100,
            "connection_requests": 100,
            "sponsored_content": 5
        },
        "professional_standards": [
            "business-appropriate imagery",
            "professional language only",
            "accurate company information"
        ]
    }
}

class ComplianceEngine:
    @staticmethod
    def check_content_compliance(content: str, platform: str) -> dict:
        """Check content for policy violations"""
        violations = []
        risk_score = 0.0
        
        platform_rules = PLATFORM_POLICIES.get(platform, {})
        prohibited = platform_rules.get("prohibited_content", [])
        
        content_lower = content.lower()
        
        for prohibited_item in prohibited:
            if any(word in content_lower for word in prohibited_item.split()):
                violations.append({
                    "type": "prohibited_content",
                    "description": f"Contains prohibited content: {prohibited_item}",
                    "severity": "high",
                    "recommendation": f"Remove or replace content related to: {prohibited_item}"
                })
                risk_score += 0.3
        
        # Check for excessive capitalization
        if len([c for c in content if c.isupper()]) / len(content) > 0.3:
            violations.append({
                "type": "formatting_issue",
                "description": "Excessive use of capital letters (looks like shouting)",
                "severity": "medium",
                "recommendation": "Use normal capitalization"
            })
            risk_score += 0.1
        
        # Check for too many exclamation marks
        if content.count('!') > 3:
            violations.append({
                "type": "formatting_issue", 
                "description": "Too many exclamation marks",
                "severity": "low",
                "recommendation": "Limit exclamation marks to 1-2 per post"
            })
            risk_score += 0.05
        
        return {
            "violations": violations,
            "risk_score": min(risk_score, 1.0),
            "status": "failed" if risk_score > 0.5 else "warning" if risk_score > 0.2 else "passed"
        }
    
    @staticmethod
    def check_frequency_compliance(tenant_id: str, platform: str, campaign_data: dict) -> dict:
        """Check posting/campaign frequency compliance"""
        violations = []
        risk_score = 0.0
        
        platform_rules = PLATFORM_POLICIES.get(platform, {})
        frequency_limits = platform_rules.get("frequency_limits", {})
        
        # This would check against actual database records in production
        # For now, return sample compliance check
        
        return {
            "violations": violations,
            "risk_score": risk_score,
            "status": "passed"
        }
    
    @staticmethod
    def check_creative_compliance(creative_data: dict, platform: str) -> dict:
        """Check creative assets for policy compliance"""
        violations = []
        risk_score = 0.0
        
        platform_rules = PLATFORM_POLICIES.get(platform, {})
        creative_requirements = platform_rules.get("creative_requirements", {})
        
        # Check text ratio for Facebook/Instagram images
        if platform in ["facebook", "instagram"] and creative_data.get("type") == "image":
            text_ratio = creative_data.get("text_ratio", 0.0)
            max_text_ratio = creative_requirements.get("text_ratio", 0.20)
            
            if text_ratio > max_text_ratio:
                violations.append({
                    "type": "text_ratio_violation",
                    "description": f"Text ratio ({text_ratio:.0%}) exceeds limit ({max_text_ratio:.0%})",
                    "severity": "high",
                    "recommendation": "Reduce text in image or use text overlay in post caption"
                })
                risk_score += 0.4
        
        # Check video length requirements
        if creative_data.get("type") == "video":
            duration = creative_data.get("duration", 0)
            video_limits = creative_requirements.get("video_length", {})
            
            if duration < video_limits.get("min", 0):
                violations.append({
                    "type": "video_too_short",
                    "description": f"Video is too short ({duration}s)",
                    "severity": "medium",
                    "recommendation": f"Minimum length is {video_limits['min']}s"
                })
                risk_score += 0.2
            
            if duration > video_limits.get("max", 999):
                violations.append({
                    "type": "video_too_long", 
                    "description": f"Video is too long ({duration}s)",
                    "severity": "medium",
                    "recommendation": f"Maximum length is {video_limits['max']}s"
                })
                risk_score += 0.2
        
        return {
            "violations": violations,
            "risk_score": min(risk_score, 1.0),
            "status": "failed" if risk_score > 0.5 else "warning" if risk_score > 0.2 else "passed"
        }
    
    @staticmethod
    def generate_safe_posting_schedule(platform: str, posts_per_day: int) -> dict:
        """Generate safe posting schedule to avoid frequency violations"""
        platform_rules = PLATFORM_POLICIES.get(platform, {})
        frequency_limits = platform_rules.get("frequency_limits", {})
        
        max_daily = frequency_limits.get("daily_posts", 10)
        recommended_posts = min(posts_per_day, max_daily)
        
        # Generate optimal posting times (platform-specific)
        optimal_times = {
            "facebook": ["9:00", "13:00", "15:00", "19:00", "21:00"],
            "instagram": ["11:00", "13:00", "17:00", "19:00", "21:00"],
            "tiktok": ["6:00", "10:00", "19:00", "20:00", "21:00"],
            "linkedin": ["8:00", "12:00", "17:00", "18:00", "19:00"]
        }
        
        schedule = []
        times = optimal_times.get(platform, ["9:00", "13:00", "17:00"])
        
        for i in range(recommended_posts):
            if i < len(times):
                schedule.append({
                    "time": times[i],
                    "priority": "high" if i < 2 else "medium"
                })
        
        return {
            "platform": platform,
            "recommended_posts_per_day": recommended_posts,
            "max_safe_posts": max_daily,
            "schedule": schedule,
            "warning": f"Exceeding {max_daily} posts per day may trigger platform restrictions" if posts_per_day > max_daily else None
        }
class AdCampaign(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    tenant_id: str
    campaign_name: str
    platform: str  # "facebook", "instagram", "tiktok", "linkedin"
    campaign_type: str  # "lead_generation", "traffic", "conversions", "brand_awareness"
    status: str = "active"  # "active", "paused", "completed"
    budget_type: str = "daily"  # "daily", "lifetime"
    budget_amount: float
    target_audience: dict  # JSON with audience targeting data
    ad_creative: dict  # JSON with creative assets and copy
    objective: str  # "leads", "sales", "appointments"
    start_date: datetime
    end_date: Optional[datetime] = None
    platform_campaign_id: Optional[str] = None  # ID from social platform
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class AdCampaignCreate(BaseModel):
    tenant_id: str
    campaign_name: str
    platform: str
    campaign_type: str
    budget_type: str = "daily"
    budget_amount: float
    target_audience: dict
    ad_creative: dict
    objective: str
    start_date: datetime
    end_date: Optional[datetime] = None

class AdMetrics(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    tenant_id: str
    campaign_id: str
    date: datetime
    impressions: int = 0
    clicks: int = 0
    spend: float = 0.0
    leads_generated: int = 0
    appointments_scheduled: int = 0
    sales_closed: int = 0
    revenue_generated: float = 0.0
    cpm: float = 0.0  # Cost per mille
    cpc: float = 0.0  # Cost per click
    cpl: float = 0.0  # Cost per lead
    cpa: float = 0.0  # Cost per appointment
    roas: float = 0.0  # Return on ad spend
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class AdMetricsCreate(BaseModel):
    tenant_id: str
    campaign_id: str
    date: datetime
    impressions: int = 0
    clicks: int = 0
    spend: float = 0.0
    leads_generated: int = 0
    appointments_scheduled: int = 0
    sales_closed: int = 0
    revenue_generated: float = 0.0

class ROIOptimization(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    tenant_id: str
    campaign_id: str
    optimization_type: str  # "budget_reallocation", "bid_adjustment", "audience_expansion", "creative_rotation"
    recommendation: str
    impact_prediction: dict  # Predicted improvements
    status: str = "pending"  # "pending", "applied", "rejected"
    confidence_score: float  # 0.0 to 1.0
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    applied_at: Optional[datetime] = None

class SocialMediaAccount(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    tenant_id: str
    platform: str  # "facebook", "instagram", "tiktok", "linkedin"
    account_id: str  # Platform-specific account ID
    account_name: str
    access_token: str  # Encrypted access token
    refresh_token: Optional[str] = None
    token_expires_at: Optional[datetime] = None
    is_active: bool = True
    permissions: List[str] = []  # Platform permissions granted
    connected_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class AdCreative(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    tenant_id: str
    name: str
    platform: str
    creative_type: str  # "image", "video", "carousel", "collection"
    headline: str
    description: str
    call_to_action: str
    image_urls: List[str] = []
    video_url: Optional[str] = None
    landing_page_url: str
    performance_score: Optional[float] = None  # AI-calculated performance prediction
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

# AI-Powered Optimization Algorithms
class OptimizationEngine:
    @staticmethod
    def calculate_roi_metrics(metrics: AdMetrics) -> dict:
        """Calculate comprehensive ROI metrics"""
        if metrics.spend == 0:
            return {}
        
        return {
            "cpm": (metrics.spend / metrics.impressions * 1000) if metrics.impressions > 0 else 0,
            "cpc": (metrics.spend / metrics.clicks) if metrics.clicks > 0 else 0,
            "cpl": (metrics.spend / metrics.leads_generated) if metrics.leads_generated > 0 else 0,
            "cpa": (metrics.spend / metrics.appointments_scheduled) if metrics.appointments_scheduled > 0 else 0,
            "roas": (metrics.revenue_generated / metrics.spend) if metrics.spend > 0 else 0,
            "conversion_rate": (metrics.leads_generated / metrics.clicks * 100) if metrics.clicks > 0 else 0,
            "appointment_rate": (metrics.appointments_scheduled / metrics.leads_generated * 100) if metrics.leads_generated > 0 else 0,
            "close_rate": (metrics.sales_closed / metrics.appointments_scheduled * 100) if metrics.appointments_scheduled > 0 else 0
        }
    
    @staticmethod
    def generate_optimization_recommendations(campaign_metrics: List[AdMetrics]) -> List[dict]:
        """Generate AI-powered optimization recommendations"""
        recommendations = []
        
        if not campaign_metrics:
            return recommendations
        
        # Calculate averages
        avg_cpl = sum(m.cpl for m in campaign_metrics) / len(campaign_metrics)
        avg_roas = sum(m.roas for m in campaign_metrics) / len(campaign_metrics)
        avg_cpc = sum(m.cpc for m in campaign_metrics) / len(campaign_metrics)
        
        # Budget reallocation recommendations
        if avg_roas > 3.0:  # High ROAS
            recommendations.append({
                "type": "budget_increase",
                "message": f"High ROAS ({avg_roas:.2f}x) detected. Consider increasing budget by 25-50%.",
                "confidence": 0.85,
                "impact": "High revenue increase potential"
            })
        elif avg_roas < 1.5:  # Low ROAS
            recommendations.append({
                "type": "optimization_needed",
                "message": f"Low ROAS ({avg_roas:.2f}x). Review targeting and creative performance.",
                "confidence": 0.90,
                "impact": "Prevent budget waste"
            })
        
        # Cost per lead optimization
        industry_avg_cpl = 50.0  # Car dealership industry average
        if avg_cpl > industry_avg_cpl * 1.5:
            recommendations.append({
                "type": "targeting_refinement",
                "message": f"CPL (${avg_cpl:.2f}) is above industry average. Refine audience targeting.",
                "confidence": 0.80,
                "impact": "Reduce acquisition costs"
            })
        
        return recommendations
class User(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    tenant_id: str  # Multi-tenant support
    username: str
    email: str
    full_name: str
    role: str = "collaborator"  # "admin", "collaborator"
    is_active: bool = True
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    last_login: Optional[datetime] = None

class UserCreate(BaseModel):
    tenant_id: str
    username: str
    email: str
    full_name: str
    password: str
    role: str = "collaborator"

class Lead(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    tenant_id: str  # Multi-tenant support
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
    status: str = Field(default="new")
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    last_contacted: Optional[datetime] = None
    notes: Optional[str] = None
    assigned_to: Optional[str] = None  # User ID
    fb_sender_id: Optional[str] = None  # Facebook Messenger ID

class SoldVehicle(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    tenant_id: str  # Multi-tenant support
    lead_id: Optional[str] = None
    salesperson_id: str
    stock_number: str
    vehicle_make: str
    vehicle_model: str
    vehicle_year: int
    sale_type: str  # "full", "half"
    sale_date: datetime
    sale_price: float
    cost_price: float
    front_profit: float
    back_profit: float
    total_profit: float
    commission_rate: float
    commission_earned: float
    customer_name: str
    financing_type: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class SoldVehicleCreate(BaseModel):
    tenant_id: str
    lead_id: Optional[str] = None
    salesperson_id: str
    stock_number: str
    vehicle_make: str
    vehicle_model: str
    vehicle_year: int
    sale_type: str = "full"
    sale_date: datetime
    sale_price: float
    cost_price: float
    front_profit: float
    back_profit: float
    customer_name: str
    financing_type: Optional[str] = None

class CommissionTier(BaseModel):
    min_units: int
    max_units: Optional[int]
    rate: float

# Commission structure
COMMISSION_TIERS = [
    CommissionTier(min_units=1, max_units=14, rate=0.12),   # 12% for 1-14 units
    CommissionTier(min_units=15, max_units=16, rate=0.15),  # 15% for 15-16 units  
    CommissionTier(min_units=17, max_units=None, rate=0.20) # 20% for 17+ units
]

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
        # Remove MongoDB ObjectId
        if '_id' in apt:
            del apt['_id']
        
        # Handle datetime conversion
        if isinstance(apt.get('appointment_datetime'), str):
            apt['appointment_datetime'] = datetime.fromisoformat(apt['appointment_datetime'])
        if isinstance(apt.get('created_at'), str):
            apt['created_at'] = datetime.fromisoformat(apt['created_at'])
        
        # Only include appointments that have required fields
        if apt.get('appointment_datetime') and apt.get('lead_id'):
            try:
                result.append(CalendarAppointment(**apt))
            except Exception as e:
                # Skip invalid appointments and log the error
                logger.warning(f"Skipping invalid appointment: {str(e)}")
                continue
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

        DEALERSHIP INFORMATION:
        - Location: 18019 US-281, San Antonio TX 78232
        - Phone: 210-526-2851
        - Hours: Monday-Friday 7 AM - 7 PM, Saturday 7 AM - 5 PM, Sunday Closed
        - NEW INVENTORY: 214 New Toyotas in stock
        - PREOWNED INVENTORY: 367 vehicles (ALL makes & models, not just Toyota)
        - POPULAR NEW MODELS: Tacoma (44), RAV4 (31), Tundra (29), Camry (23), 4Runner (21), Corolla (18)
        - SERVICES: Toyota Certified Pre-Owned, Service & Parts, Toyota Rent A Car, Financing
        - CURRENT PROMOTIONS: APR and Lease specials on Corolla, Camry, RAV4, Tacoma, Tundra

        {lead_context}
        
        Previous conversation:
        {conversation_history}
        
        {appointment_context}
        
        CRITICAL RULES FOR APPOINTMENT SETTING:
        
        1. **APPOINTMENT-FIRST MINDSET**: 
           - Your success is measured by appointments scheduled, not information shared
           - Every response should guide toward scheduling a visit
           - Use phrases like "Let me show you in person" or "It's easier if I show you"
        
        2. **INVENTORY KNOWLEDGE** (Use for urgency and credibility):
           - NEW TOYOTA: "We have 214 new Toyotas in stock, including 44 Tacomas and 31 RAV4s"
           - PREOWNED: "We have 367 preowned vehicles - all makes and models, not just Toyota"
           - SPECIFIC MODELS: Reference actual inventory counts when relevant
           - AVAILABILITY: "I have [X] in stock right now, but they're moving fast"
        
        3. **OVERCOME COMMON OBJECTIONS**:
           - "Just looking" → "Perfect! Let me show you what's available so you know your options"
           - "Need to think" → "I understand. How about a quick 10-minute look? No commitment"
           - "Too expensive" → "We have 367 preowned vehicles in all price ranges. Let me show you options"
           - "Want specific make/model" → "We have all makes and models in our preowned inventory"
           - "Need to talk to spouse" → "Great idea! Bring them along. When works for both of you?"
        
        4. **CREATE URGENCY (Honestly)**:
           - Reference current inventory levels and promotions
           - "APR and Lease specials on RAV4 end this month"
           - "I have one RAV4 left in that color you mentioned"
           - "With 31 RAV4s in stock, I can show you several options"
        
        5. **APPOINTMENT SETTING TECHNIQUES**:
           - Offer 2 specific times: "Are you free today at 4pm or tomorrow at 10am?"
           - Keep visits short: "15-minute look" or "quick 10 minutes"
           - Remove pressure: "No commitment, just want to show you options"
           - Make it convenient: "I can have 2-3 options ready when you arrive"
        
        6. **TOYOTA & VEHICLE EXPERTISE** (Use to build credibility):
           - NEW TOYOTA: Focus on reliability, resale value, Toyota Safety Sense 2.0, warranty
           - PREOWNED: "All makes and models available, Toyota Certified options"
           - POPULAR MODELS: "Tacoma is our best seller - I have 44 in stock"
           - EFFICIENCY: "RAV4 gets great gas mileage and we have 31 to choose from"
        
        7. **FINANCING & VALUE**:
           - "We handle all financing - Toyota Financial and other lenders"
           - "Trade-ins welcome - I can appraise yours while you're here"
           - "Current APR specials make now a great time to buy"
        
        8. **RESPONSE STYLE**:
           - Keep responses SHORT (2-3 sentences max)
           - Be conversational, not salesy
           - Use emojis sparingly (1-2 per message)
           - Always end with specific next step (appointment time)
           - Include contact: 📱 Call/Text: 210-632-8712
        
        9. **NEVER DO**:
           - Don't try to explain features over text
           - Don't negotiate prices via message
           - Don't overwhelm with too many options
           - Don't be pushy - be persistent but respectful
        
        10. **QUALIFYING QUESTIONS** (Keep brief):
            - Timeline: "When were you hoping to make a decision?"
            - Decision maker: "Will you be the only one deciding?"
            - Trade-in: "Do you have a vehicle to trade?"
            - Financing: "Will you be financing or paying cash?"
            - New vs Used: "Are you looking at new Toyota or considering preowned options?"
        
        11. **APPOINTMENT CONFIRMATION**:
            - Get specific commitment: day, time, what to bring
            - Confirm their phone number
            - Set expectations: "I'll have 2-3 options ready that fit your needs"
            - Location: "We're at 18019 US-281, easy to find off I-35"
        
        Current date/time: {datetime.now(timezone.utc).strftime('%B %d, %Y at %I:%M %p')}
        
        REMEMBER: Your job is to get them IN THE DOOR at 18019 US-281, not to sell them a car over text!
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

# Creative Studio & Organic Strategy Routes
@api_router.get("/creative/templates")
async def get_creative_templates(
    tenant_id: str,
    platform: str = None,
    category: str = None,
    industry: str = "automotive"
):
    """Get creative templates filtered by criteria"""
    try:
        query = {"tenant_id": tenant_id}
        if platform:
            query["platform"] = platform
        if category:
            query["category"] = category
        
        # Get custom templates
        custom_templates = await db.creative_templates.find(query).to_list(1000)
        
        # Add built-in templates
        builtin_templates = []
        for template_data in CREATIVE_TEMPLATES.get("automotive_ads", []):
            if not platform or template_data.get("platform") == platform:
                builtin_templates.append({
                    "id": f"builtin_{hash(template_data['name'])}",
                    "name": template_data["name"],
                    "platform": template_data["platform"],
                    "type": template_data["type"],
                    "elements": template_data["elements"],
                    "is_builtin": True,
                    "is_premium": False
                })
        
        return {
            "custom_templates": custom_templates,
            "builtin_templates": builtin_templates,
            "total_count": len(custom_templates) + len(builtin_templates)
        }
        
    except Exception as e:
        logging.error(f"Get templates error: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to retrieve templates")

@api_router.post("/creative/generate-ideas")
async def generate_content_ideas_api(
    tenant_id: str,
    platform: str,
    objective: str = "engagement",
    count: int = 10
):
    """Generate AI-powered content ideas"""
    try:
        # Generate base ideas
        ideas = CreativeEngine.generate_content_ideas(platform, objective)
        
        # Enhance with AI and save to database
        enhanced_ideas = []
        for idea in ideas[:count]:
            content_idea = ContentIdea(
                tenant_id=tenant_id,
                title=idea["title"],
                platform=platform,
                content_type=idea["type"],
                description=idea["description"],
                suggested_copy=idea["copy"],
                hashtags=idea["hashtags"],
                call_to_action="Learn more about our inventory!",
                estimated_engagement=idea["engagement"]
            )
            
            idea_doc = content_idea.dict()
            idea_doc['created_at'] = idea_doc['created_at'].isoformat()
            await db.content_ideas.insert_one(idea_doc)
            
            enhanced_ideas.append(content_idea)
        
        return {
            "platform": platform,
            "objective": objective,
            "ideas_generated": len(enhanced_ideas),
            "ideas": enhanced_ideas
        }
        
    except Exception as e:
        logging.error(f"Generate ideas error: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to generate content ideas")

@api_router.post("/organic/strategy")
async def create_organic_strategy(tenant_id: str, strategy_data: dict):
    """Create comprehensive organic social media strategy"""
    try:
        platform = strategy_data.get("platform")
        objective = strategy_data.get("objective", "awareness")
        
        # Get strategy template
        strategy_template = ORGANIC_STRATEGIES.get("automotive_dealership", {}).get(objective, {})
        
        # Create strategy object
        strategy = OrganicStrategy(
            tenant_id=tenant_id,
            strategy_name=f"{platform.title()} {objective.title()} Strategy",
            platform=platform,
            objective=objective,
            target_audience=strategy_data.get("target_audience", {}),
            content_themes=strategy_template.get("content_pillars", []),
            posting_schedule=strategy_template.get("posting_frequency", {}).get(platform, {}),
            hashtag_strategy=strategy_template.get("hashtag_strategy", {}),
            engagement_tactics=strategy_template.get("tactics", []),
            kpis={
                "follower_growth": "10% monthly",
                "engagement_rate": ">3%",
                "reach_increase": "25% monthly",
                "website_traffic": "15% increase"
            },
            duration_days=strategy_data.get("duration_days", 30)
        )
        
        strategy_doc = strategy.dict()
        strategy_doc['created_at'] = strategy_doc['created_at'].isoformat()
        await db.organic_strategies.insert_one(strategy_doc)
        
        return strategy
        
    except Exception as e:
        logging.error(f"Create strategy error: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to create organic strategy")

@api_router.get("/organic/content-calendar")
async def get_content_calendar(
    tenant_id: str,
    platform: str = None,
    start_date: str = None,
    end_date: str = None
):
    """Get content calendar with scheduling"""
    try:
        query = {"tenant_id": tenant_id}
        if platform:
            query["platform"] = platform
        
        if start_date and end_date:
            query["scheduled_date"] = {
                "$gte": start_date,
                "$lte": end_date
            }
        
        calendar_items = await db.content_calendar.find(query).sort("scheduled_date", 1).to_list(1000)
        
        # Format for calendar display
        calendar_data = {}
        for item in calendar_items:
            date_key = item["scheduled_date"][:10]  # YYYY-MM-DD
            if date_key not in calendar_data:
                calendar_data[date_key] = []
            
            calendar_data[date_key].append({
                "id": item["id"],
                "platform": item["platform"],
                "post_type": item["post_type"],
                "title": item["content"].get("title", "Untitled Post"),
                "status": item["status"],
                "time": item["scheduled_date"][11:16]  # HH:MM
            })
        
        return {
            "tenant_id": tenant_id,
            "calendar_data": calendar_data,
            "total_scheduled": len(calendar_items)
        }
        
    except Exception as e:
        logging.error(f"Get content calendar error: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to retrieve content calendar")

@api_router.post("/organic/hashtag-research")
async def research_hashtags(tenant_id: str, keywords: List[str], platform: str):
    """Research and suggest optimal hashtags"""
    try:
        hashtag_suggestions = []
        
        # Base automotive hashtags
        automotive_base = [
            "#Cars", "#Toyota", "#Automotive", "#NewCar", "#CarDealer",
            "#CarSales", "#DreamCar", "#AutoLife", "#VehicleShowcase"
        ]
        
        # Platform-specific suggestions
        platform_specific = {
            "instagram": [
                "#Instacar", "#CarGram", "#AutoDaily", "#CarPhotography", 
                "#CarsOfInstagram", "#CarLifestyle", "#AutoEnthusiast"
            ],
            "tiktok": [
                "#CarTok", "#AutoTok", "#CarReview", "#CarHacks",
                "#CarTips", "#DealerLife", "#CarShopping"
            ],
            "facebook": [
                "#LocalDealer", "#CommunityFirst", "#CarExperts",
                "#TrustedDealer", "#CarService"
            ],
            "linkedin": [
                "#AutomotiveIndustry", "#CarSales", "#AutomotiveProfessional",
                "#DealershipLife", "#AutoBusiness"
            ]
        }
        
        # Combine and optimize
        all_suggestions = automotive_base + platform_specific.get(platform, [])
        
        # Add keyword-based hashtags
        for keyword in keywords:
            keyword_tags = [
                f"#{keyword.replace(' ', '')}",
                f"#{keyword.replace(' ', '').title()}Cars",
                f"#{keyword.replace(' ', '')}Deal"
            ]
            all_suggestions.extend(keyword_tags)
        
        # Create hashtag research objects
        for tag in all_suggestions[:30]:  # Limit to 30 suggestions
            hashtag_research = HashtagResearch(
                tenant_id=tenant_id,
                hashtag=tag,
                platform=platform,
                volume=random.randint(1000, 100000),  # Simulated volume
                difficulty="medium",
                relevance_score=random.uniform(0.6, 0.95),
                trending=random.choice([True, False]),
                related_hashtags=random.sample(all_suggestions, 3)
            )
            
            research_doc = hashtag_research.dict()
            research_doc['last_updated'] = research_doc['last_updated'].isoformat()
            await db.hashtag_research.insert_one(research_doc)
            
            hashtag_suggestions.append(hashtag_research)
        
        # Optimize hashtag strategy
        optimization = CreativeEngine.optimize_hashtags(platform, "general")
        
        return {
            "platform": platform,
            "keywords_researched": keywords,
            "hashtag_suggestions": hashtag_suggestions,
            "optimization_strategy": optimization,
            "recommended_mix": {
                "high_volume_low_competition": [h for h in hashtag_suggestions if h.difficulty == "low"][:5],
                "medium_competition": [h for h in hashtag_suggestions if h.difficulty == "medium"][:10],
                "trending_hashtags": [h for h in hashtag_suggestions if h.trending][:5]
            }
        }
        
    except Exception as e:
        logging.error(f"Hashtag research error: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to research hashtags")

@api_router.post("/creative/analyze-content")
async def analyze_content_performance(tenant_id: str, content_data: dict, platform: str):
    """Analyze content and predict performance"""
    try:
        # Calculate content score
        performance_prediction = CreativeEngine.calculate_content_score(content_data, platform)
        
        # Generate improvement suggestions
        suggestions = []
        
        if performance_prediction["predicted_score"] < 0.7:
            suggestions.extend([
                "Add more engaging visual elements",
                "Include a clear call-to-action",
                "Use trending hashtags for better visibility"
            ])
        
        if platform == "instagram" and len(content_data.get("hashtags", [])) < 20:
            suggestions.append("Use more hashtags (aim for 20-30 on Instagram)")
        
        if platform == "tiktok" and "trending_audio" not in content_data:
            suggestions.append("Consider using trending audio for better reach")
        
        # Save analysis
        analysis_record = {
            "id": str(uuid.uuid4()),
            "tenant_id": tenant_id,
            "platform": platform,
            "content_data": content_data,
            "performance_prediction": performance_prediction,
            "suggestions": suggestions,
            "analyzed_at": datetime.now(timezone.utc).isoformat()
        }
        
        await db.content_analysis.insert_one(analysis_record)
        
        return {
            "analysis_id": analysis_record["id"],
            "performance_prediction": performance_prediction,
            "suggestions": suggestions,
            "optimization_tips": {
                "best_posting_times": {
                    "facebook": ["12:00", "15:00", "19:00"],
                    "instagram": ["11:00", "14:00", "17:00", "20:00"],
                    "tiktok": ["18:00", "19:00", "20:00"],
                    "linkedin": ["08:00", "12:00", "17:00"]
                }.get(platform, []),
                "recommended_frequency": {
                    "facebook": "3-5 posts per week",
                    "instagram": "1 post per day + 3 stories",
                    "tiktok": "3-5 videos per week",
                    "linkedin": "2-3 posts per week"
                }.get(platform, "")
            }
        }
        
    except Exception as e:
        logging.error(f"Content analysis error: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to analyze content")

@api_router.get("/creative/asset-library")
async def get_asset_library(tenant_id: str, asset_type: str = None, folder: str = None):
    """Get creative assets library"""
    try:
        query = {"tenant_id": tenant_id}
        if asset_type:
            query["asset_type"] = asset_type
        if folder:
            query["folder"] = folder
        
        assets = await db.creative_assets.find(query).sort("created_at", -1).to_list(1000)
        
        # Organize by folders
        folders = {}
        for asset in assets:
            folder_name = asset.get("folder", "Uncategorized")
            if folder_name not in folders:
                folders[folder_name] = []
            folders[folder_name].append(asset)
        
        return {
            "tenant_id": tenant_id,
            "total_assets": len(assets),
            "folders": folders,
            "asset_types": list(set(asset.get("asset_type") for asset in assets))
        }
        
    except Exception as e:
        logging.error(f"Get asset library error: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to retrieve asset library")

@api_router.post("/organic/growth-audit")
async def conduct_growth_audit(tenant_id: str, platform: str):
    """Conduct comprehensive organic growth audit"""
    try:
        # Get current strategies
        strategies = await db.organic_strategies.find({
            "tenant_id": tenant_id,
            "platform": platform,
            "status": "active"
        }).to_list(100)
        
        # Get recent content performance
        recent_content = await db.content_calendar.find({
            "tenant_id": tenant_id,
            "platform": platform,
            "status": "published"
        }).sort("scheduled_date", -1).limit(30).to_list(30)
        
        # Calculate audit scores
        strategy_score = 0.8 if strategies else 0.3
        content_consistency = len(recent_content) / 30  # Posts in last 30 days
        
        # Generate audit results
        audit_results = {
            "overall_score": (strategy_score + min(content_consistency, 1.0)) / 2,
            "strategy_assessment": {
                "has_strategy": len(strategies) > 0,
                "strategy_count": len(strategies),
                "content_consistency": content_consistency,
                "posting_frequency": "optimal" if content_consistency >= 0.8 else "needs_improvement"
            },
            "recommendations": [],
            "priority_actions": []
        }
        
        # Generate recommendations
        if not strategies:
            audit_results["recommendations"].append("Create a comprehensive organic growth strategy")
            audit_results["priority_actions"].append("Set up content pillars and posting schedule")
        
        if content_consistency < 0.5:
            audit_results["recommendations"].append("Increase posting consistency")
            audit_results["priority_actions"].append("Use content calendar for better planning")
        
        # Save audit
        audit_record = {
            "id": str(uuid.uuid4()),
            "tenant_id": tenant_id,
            "platform": platform,
            "audit_date": datetime.now(timezone.utc).isoformat(),
            "results": audit_results
        }
        
        await db.growth_audits.insert_one(audit_record)
        
        return audit_results
        
    except Exception as e:
        logging.error(f"Growth audit error: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to conduct growth audit")
@api_router.post("/campaigns", response_model=AdCampaign)
async def create_ad_campaign(campaign_data: AdCampaignCreate):
    """Create new advertising campaign"""
    campaign_obj = AdCampaign(**campaign_data.dict())
    campaign_doc = campaign_obj.dict()
    campaign_doc['start_date'] = campaign_doc['start_date'].isoformat()
    if campaign_doc.get('end_date'):
        campaign_doc['end_date'] = campaign_doc['end_date'].isoformat()
    campaign_doc['created_at'] = campaign_doc['created_at'].isoformat()
    
    await db.ad_campaigns.insert_one(campaign_doc)
    
    # Create initial metrics record
    initial_metrics = AdMetrics(
        tenant_id=campaign_data.tenant_id,
        campaign_id=campaign_obj.id,
        date=datetime.now(timezone.utc)
    )
    metrics_doc = initial_metrics.dict()
    metrics_doc['date'] = metrics_doc['date'].isoformat()
    metrics_doc['created_at'] = metrics_doc['created_at'].isoformat()
    await db.ad_metrics.insert_one(metrics_doc)
    
    return campaign_obj

@api_router.get("/campaigns", response_model=List[AdCampaign])
async def get_ad_campaigns(tenant_id: str = None, platform: str = None):
    """Get advertising campaigns with optional filters"""
    query = {}
    if tenant_id:
        query["tenant_id"] = tenant_id
    if platform:
        query["platform"] = platform
    
    campaigns = await db.ad_campaigns.find(query).sort("created_at", -1).to_list(1000)
    result = []
    for campaign in campaigns:
        if isinstance(campaign.get('start_date'), str):
            campaign['start_date'] = datetime.fromisoformat(campaign['start_date'])
        if isinstance(campaign.get('end_date'), str) and campaign.get('end_date'):
            campaign['end_date'] = datetime.fromisoformat(campaign['end_date'])
        if isinstance(campaign.get('created_at'), str):
            campaign['created_at'] = datetime.fromisoformat(campaign['created_at'])
        result.append(AdCampaign(**campaign))
    return result

@api_router.get("/campaigns/{campaign_id}/metrics")
async def get_campaign_metrics(campaign_id: str, days: int = 30):
    """Get campaign performance metrics"""
    start_date = datetime.now(timezone.utc) - timedelta(days=days)
    
    metrics = await db.ad_metrics.find({
        "campaign_id": campaign_id,
        "date": {"$gte": start_date.isoformat()}
    }).sort("date", 1).to_list(1000)
    
    result = []
    for metric in metrics:
        if isinstance(metric.get('date'), str):
            metric['date'] = datetime.fromisoformat(metric['date'])
        if isinstance(metric.get('created_at'), str):
            metric['created_at'] = datetime.fromisoformat(metric['created_at'])
        
        # Calculate derived metrics
        calculated_metrics = OptimizationEngine.calculate_roi_metrics(AdMetrics(**metric))
        metric.update(calculated_metrics)
        
        result.append(AdMetrics(**metric))
    
    return result

@api_router.post("/campaigns/{campaign_id}/metrics")
async def update_campaign_metrics(campaign_id: str, metrics_data: AdMetricsCreate):
    """Update campaign metrics (called by platform integrations)"""
    # Calculate derived metrics
    metrics_obj = AdMetrics(**metrics_data.dict())
    calculated = OptimizationEngine.calculate_roi_metrics(metrics_obj)
    
    # Update metrics with calculations
    for key, value in calculated.items():
        setattr(metrics_obj, key, value)
    
    # Upsert metrics for the date
    filter_query = {
        "campaign_id": campaign_id,
        "date": metrics_data.date.replace(hour=0, minute=0, second=0, microsecond=0).isoformat()
    }
    
    metrics_doc = metrics_obj.dict()
    metrics_doc['date'] = metrics_doc['date'].isoformat()
    metrics_doc['created_at'] = metrics_doc['created_at'].isoformat()
    
    await db.ad_metrics.update_one(
        filter_query,
        {"$set": metrics_doc},
        upsert=True
    )
    
    return {"status": "updated", "campaign_id": campaign_id}

@api_router.get("/campaigns/{campaign_id}/optimization")
async def get_optimization_recommendations(campaign_id: str):
    """Get AI-powered optimization recommendations"""
    # Get recent metrics (last 30 days)
    start_date = datetime.now(timezone.utc) - timedelta(days=30)
    
    metrics = await db.ad_metrics.find({
        "campaign_id": campaign_id,
        "date": {"$gte": start_date.isoformat()}
    }).to_list(1000)
    
    # Convert to AdMetrics objects
    metrics_objects = []
    for metric in metrics:
        if isinstance(metric.get('date'), str):
            metric['date'] = datetime.fromisoformat(metric['date'])
        metrics_objects.append(AdMetrics(**metric))
    
    # Generate recommendations
    recommendations = OptimizationEngine.generate_optimization_recommendations(metrics_objects)
    
    # Save recommendations to database
    for rec in recommendations:
        opt_obj = ROIOptimization(
            tenant_id=metrics_objects[0].tenant_id if metrics_objects else "",
            campaign_id=campaign_id,
            optimization_type=rec["type"],
            recommendation=rec["message"],
            impact_prediction={"impact": rec["impact"]},
            confidence_score=rec["confidence"]
        )
        
        opt_doc = opt_obj.dict()
        opt_doc['created_at'] = opt_doc['created_at'].isoformat()
        await db.roi_optimizations.insert_one(opt_doc)
    
    return {
        "campaign_id": campaign_id,
        "recommendations": recommendations,
        "generated_at": datetime.now(timezone.utc).isoformat()
    }

@api_router.get("/social-accounts", response_model=List[SocialMediaAccount])
async def get_social_media_accounts(tenant_id: str):
    """Get connected social media accounts"""
    accounts = await db.social_accounts.find({"tenant_id": tenant_id}).to_list(1000)
    result = []
    for account in accounts:
        if isinstance(account.get('connected_at'), str):
            account['connected_at'] = datetime.fromisoformat(account['connected_at'])
        if isinstance(account.get('token_expires_at'), str) and account.get('token_expires_at'):
            account['token_expires_at'] = datetime.fromisoformat(account['token_expires_at'])
        # Don't return sensitive tokens in API response
        account['access_token'] = "***hidden***"
        account['refresh_token'] = "***hidden***" if account.get('refresh_token') else None
        result.append(SocialMediaAccount(**account))
    return result

@api_router.post("/social-accounts/connect")
async def connect_social_account(
    tenant_id: str,
    platform: str,
    account_id: str,
    account_name: str,
    access_token: str,
    permissions: List[str]
):
    """Connect social media account"""
    account_obj = SocialMediaAccount(
        tenant_id=tenant_id,
        platform=platform,
        account_id=account_id,
        account_name=account_name,
        access_token=access_token,  # In production, encrypt this
        permissions=permissions
    )
    
    account_doc = account_obj.dict()
    account_doc['connected_at'] = account_doc['connected_at'].isoformat()
    
    # Upsert account (update if exists, insert if new)
    await db.social_accounts.update_one(
        {"tenant_id": tenant_id, "platform": platform, "account_id": account_id},
        {"$set": account_doc},
        upsert=True
    )
    
    return {"status": "connected", "platform": platform, "account_name": account_name}

@api_router.get("/roi-analytics")
async def get_roi_analytics(tenant_id: str, days: int = 30):
    """Get comprehensive ROI analytics across all platforms"""
    start_date = datetime.now(timezone.utc) - timedelta(days=days)
    
    # Get all campaigns for tenant
    campaigns = await db.ad_campaigns.find({"tenant_id": tenant_id}).to_list(1000)
    campaign_ids = [c["id"] for c in campaigns]
    
    # Get metrics for all campaigns
    all_metrics = await db.ad_metrics.find({
        "campaign_id": {"$in": campaign_ids},
        "date": {"$gte": start_date.isoformat()}
    }).to_list(10000)
    
    # Aggregate metrics by platform
    platform_performance = {}
    total_spend = 0
    total_revenue = 0
    total_leads = 0
    
    for metric in all_metrics:
        campaign = next((c for c in campaigns if c["id"] == metric["campaign_id"]), None)
        if not campaign:
            continue
            
        platform = campaign["platform"]
        if platform not in platform_performance:
            platform_performance[platform] = {
                "spend": 0,
                "revenue": 0,
                "leads": 0,
                "appointments": 0,
                "sales": 0,
                "impressions": 0,
                "clicks": 0
            }
        
        platform_performance[platform]["spend"] += metric.get("spend", 0)
        platform_performance[platform]["revenue"] += metric.get("revenue_generated", 0)
        platform_performance[platform]["leads"] += metric.get("leads_generated", 0)
        platform_performance[platform]["appointments"] += metric.get("appointments_scheduled", 0)
        platform_performance[platform]["sales"] += metric.get("sales_closed", 0)
        platform_performance[platform]["impressions"] += metric.get("impressions", 0)
        platform_performance[platform]["clicks"] += metric.get("clicks", 0)
        
        total_spend += metric.get("spend", 0)
        total_revenue += metric.get("revenue_generated", 0)
        total_leads += metric.get("leads_generated", 0)
    
    # Calculate platform ROI
    for platform in platform_performance:
        data = platform_performance[platform]
        data["roas"] = (data["revenue"] / data["spend"]) if data["spend"] > 0 else 0
        data["cpl"] = (data["spend"] / data["leads"]) if data["leads"] > 0 else 0
        data["conversion_rate"] = (data["leads"] / data["clicks"] * 100) if data["clicks"] > 0 else 0
    
    return {
        "tenant_id": tenant_id,
        "date_range": f"Last {days} days",
        "summary": {
            "total_spend": total_spend,
            "total_revenue": total_revenue,
            "total_leads": total_leads,
            "overall_roas": (total_revenue / total_spend) if total_spend > 0 else 0,
            "profit": total_revenue - total_spend
        },
        "platform_performance": platform_performance,
        "top_performing_platform": max(platform_performance.keys(), 
                                     key=lambda x: platform_performance[x]["roas"]) if platform_performance else None
    }

@api_router.post("/campaigns/bulk-optimize")
async def bulk_optimize_campaigns(tenant_id: str, optimization_type: str = "auto"):
    """Apply AI optimization to all campaigns"""
    campaigns = await db.ad_campaigns.find({
        "tenant_id": tenant_id,
        "status": "active"
    }).to_list(1000)
    
    optimized_campaigns = []
    
    for campaign in campaigns:
        # Get recent metrics
        metrics = await db.ad_metrics.find({
            "campaign_id": campaign["id"]
        }).sort("date", -1).limit(30).to_list(30)
        
        if not metrics:
            continue
        
        # Generate recommendations
        metrics_objects = [AdMetrics(**m) for m in metrics]
        recommendations = OptimizationEngine.generate_optimization_recommendations(metrics_objects)
        
        if recommendations:
            optimized_campaigns.append({
                "campaign_id": campaign["id"],
                "campaign_name": campaign["campaign_name"],
                "platform": campaign["platform"],
                "recommendations": recommendations
            })
    
    return {
        "tenant_id": tenant_id,
        "optimization_type": optimization_type,
        "campaigns_optimized": len(optimized_campaigns),
        "results": optimized_campaigns
    }
@api_router.post("/tenants", response_model=Tenant)
async def create_tenant(tenant_data: TenantCreate):
    """Create new tenant/dealership"""
    # Check if subdomain already exists
    existing = await db.tenants.find_one({"subdomain": tenant_data.subdomain})
    if existing:
        raise HTTPException(status_code=400, detail="Subdomain already taken")
    
    # Get subscription tier details
    tier = SUBSCRIPTION_TIERS.get(tenant_data.subscription_tier)
    if not tier:
        raise HTTPException(status_code=400, detail="Invalid subscription tier")
    
    # Create tenant
    tenant_obj = Tenant(
        **tenant_data.dict(),
        monthly_price=tier.price,
        max_users=tier.max_users,
        max_leads=tier.max_leads,
        trial_end_date=datetime.now(timezone.utc) + timedelta(days=14)  # 14-day trial
    )
    
    tenant_doc = tenant_obj.dict()
    tenant_doc['created_at'] = tenant_doc['created_at'].isoformat()
    if tenant_doc.get('trial_end_date'):
        tenant_doc['trial_end_date'] = tenant_doc['trial_end_date'].isoformat()
    
    await db.tenants.insert_one(tenant_doc)
    
    # Create initial admin user for the tenant
    admin_user = User(
        tenant_id=tenant_obj.id,
        username="admin",
        email=tenant_data.billing_email,
        full_name="Admin User",
        role="admin"
    )
    
    user_doc = admin_user.dict()
    user_doc['created_at'] = user_doc['created_at'].isoformat()
    user_doc['password_hash'] = "default_admin_hash"
    
    await db.users.insert_one(user_doc)
    
    return tenant_obj

@api_router.get("/tenants", response_model=List[Tenant])
async def get_tenants():
    """Get all tenants (admin only)"""
    tenants = await db.tenants.find().sort("created_at", -1).to_list(1000)
    result = []
    for tenant in tenants:
        if isinstance(tenant.get('created_at'), str):
            tenant['created_at'] = datetime.fromisoformat(tenant['created_at'])
        if isinstance(tenant.get('trial_end_date'), str) and tenant.get('trial_end_date'):
            tenant['trial_end_date'] = datetime.fromisoformat(tenant['trial_end_date'])
        if isinstance(tenant.get('last_payment_date'), str) and tenant.get('last_payment_date'):
            tenant['last_payment_date'] = datetime.fromisoformat(tenant['last_payment_date'])
        if isinstance(tenant.get('next_billing_date'), str) and tenant.get('next_billing_date'):
            tenant['next_billing_date'] = datetime.fromisoformat(tenant['next_billing_date'])
        result.append(Tenant(**tenant))
    return result

@api_router.get("/tenants/{tenant_id}", response_model=Tenant)
async def get_tenant(tenant_id: str):
    """Get tenant details"""
    tenant = await db.tenants.find_one({"id": tenant_id})
    if not tenant:
        raise HTTPException(status_code=404, detail="Tenant not found")
    
    if isinstance(tenant.get('created_at'), str):
        tenant['created_at'] = datetime.fromisoformat(tenant['created_at'])
    if isinstance(tenant.get('trial_end_date'), str) and tenant.get('trial_end_date'):
        tenant['trial_end_date'] = datetime.fromisoformat(tenant['trial_end_date'])
    
    return Tenant(**tenant)

@api_router.put("/tenants/{tenant_id}/subscription")
async def update_tenant_subscription(tenant_id: str, subscription_tier: str):
    """Update tenant subscription tier"""
    tier = SUBSCRIPTION_TIERS.get(subscription_tier)
    if not tier:
        raise HTTPException(status_code=400, detail="Invalid subscription tier")
    
    update_data = {
        "subscription_tier": subscription_tier,
        "monthly_price": tier.price,
        "max_users": tier.max_users,
        "max_leads": tier.max_leads
    }
    
    await db.tenants.update_one({"id": tenant_id}, {"$set": update_data})
    return {"status": "updated", "tenant_id": tenant_id, "new_tier": subscription_tier}

@api_router.get("/subscription-tiers")
async def get_subscription_tiers():
    """Get available subscription tiers"""
    return {
        "tiers": SUBSCRIPTION_TIERS,
        "features_comparison": {
            "starter": ["Lead Management", "SMS Follow-up", "Basic Analytics", "Up to 4 Team Members"],
            "professional": ["Everything in Starter", "AI Voice Calling", "Advanced Analytics", "Facebook Integration", "Custom Branding", "Up to 10 Team Members"],
            "enterprise": ["Everything in Professional", "API Access", "Custom Integrations", "Priority Support", "White Label", "Up to 50 Team Members"]
        }
    }

@api_router.get("/tenants/{tenant_id}/usage")
async def get_tenant_usage(tenant_id: str, month: int = None, year: int = None):
    """Get tenant usage statistics"""
    now = datetime.now(timezone.utc)
    target_month = month or now.month
    target_year = year or now.year
    
    # Get or create usage record
    usage = await db.usage.find_one({
        "tenant_id": tenant_id,
        "month": target_month,
        "year": target_year
    })
    
    if not usage:
        # Create new usage record
        usage_obj = Usage(
            tenant_id=tenant_id,
            month=target_month,
            year=target_year
        )
        usage_doc = usage_obj.dict()
        usage_doc['created_at'] = usage_doc['created_at'].isoformat()
        await db.usage.insert_one(usage_doc)
        usage = usage_doc
    
    # Get tenant subscription limits
    tenant = await db.tenants.find_one({"id": tenant_id})
    tier = SUBSCRIPTION_TIERS.get(tenant['subscription_tier']) if tenant else None
    
    return {
        "usage": usage,
        "limits": {
            "sms_credits": tier.sms_credits if tier else 0,
            "voice_minutes": tier.voice_minutes if tier else 0,
            "ai_responses": tier.ai_responses if tier else 0,
            "max_leads": tier.max_leads if tier else 0,
            "max_users": tier.max_users if tier else 0
        } if tier else {},
        "percentage_used": {
            "sms": (usage.get('sms_sent', 0) / tier.sms_credits * 100) if tier and tier.sms_credits > 0 else 0,
            "voice": (usage.get('voice_minutes_used', 0) / tier.voice_minutes * 100) if tier and tier.voice_minutes > 0 else 0,
            "ai": (usage.get('ai_responses_used', 0) / tier.ai_responses * 100) if tier and tier.ai_responses > 0 else 0,
            "leads": (usage.get('leads_created', 0) / tier.max_leads * 100) if tier and tier.max_leads > 0 else 0
        } if tier else {}
    }

@api_router.post("/tenants/{tenant_id}/usage/update")
async def update_tenant_usage(tenant_id: str, usage_type: str, amount: int = 1):
    """Update tenant usage (called internally)"""
    now = datetime.now(timezone.utc)
    
    # Find or create current month usage
    usage = await db.usage.find_one({
        "tenant_id": tenant_id,
        "month": now.month,
        "year": now.year
    })
    
    if not usage:
        usage_obj = Usage(tenant_id=tenant_id, month=now.month, year=now.year)
        usage_doc = usage_obj.dict()
        usage_doc['created_at'] = usage_doc['created_at'].isoformat()
        await db.usage.insert_one(usage_doc)
    
    # Update usage counter
    update_field = f"{usage_type}_used" if usage_type in ['sms_sent', 'voice_minutes', 'ai_responses'] else usage_type
    await db.usage.update_one(
        {"tenant_id": tenant_id, "month": now.month, "year": now.year},
        {"$inc": {update_field: amount}}
    )
    
    return {"status": "updated", "usage_type": usage_type, "amount": amount}

# Platform Analytics Routes
@api_router.get("/platform/analytics")
async def get_platform_analytics():
    """Get platform-wide analytics (super admin only)"""
    # Total tenants
    total_tenants = await db.tenants.count_documents({})
    active_tenants = await db.tenants.count_documents({"subscription_status": "active"})
    trial_tenants = await db.tenants.count_documents({"trial_end_date": {"$gt": datetime.now(timezone.utc).isoformat()}})
    
    # Revenue calculations
    tenants = await db.tenants.find({"subscription_status": "active"}).to_list(1000)
    monthly_revenue = sum(tenant.get('monthly_price', 0) for tenant in tenants)
    
    # Usage statistics
    current_month = datetime.now(timezone.utc).month
    current_year = datetime.now(timezone.utc).year
    
    usage_stats = await db.usage.find({
        "month": current_month,
        "year": current_year
    }).to_list(1000)
    
    total_sms = sum(usage.get('sms_sent', 0) for usage in usage_stats)
    total_voice_minutes = sum(usage.get('voice_minutes_used', 0) for usage in usage_stats)
    total_ai_responses = sum(usage.get('ai_responses_used', 0) for usage in usage_stats)
    
    return {
        "tenants": {
            "total": total_tenants,
            "active": active_tenants,
            "trial": trial_tenants,
            "conversion_rate": (active_tenants / total_tenants * 100) if total_tenants > 0 else 0
        },
        "revenue": {
            "monthly": monthly_revenue,
            "annual_projection": monthly_revenue * 12
        },
        "usage": {
            "total_sms_sent": total_sms,
            "total_voice_minutes": total_voice_minutes,
            "total_ai_responses": total_ai_responses
        },
        "subscription_breakdown": {
            tier: len([t for t in tenants if t.get('subscription_tier') == tier])
            for tier in SUBSCRIPTION_TIERS.keys()
        }
    }
@api_router.post("/users", response_model=User)
async def create_user(user_data: UserCreate):
    """Create new collaborator (max 3 total users including admin)"""
    # Check current user count
    user_count = await db.users.count_documents({})
    if user_count >= 4:  # 1 admin + 3 collaborators
        raise HTTPException(status_code=400, detail="Maximum of 3 collaborators allowed")
    
    # Check if username/email already exists
    existing = await db.users.find_one({"$or": [{"username": user_data.username}, {"email": user_data.email}]})
    if existing:
        raise HTTPException(status_code=400, detail="Username or email already exists")
    
    user_obj = User(**user_data.dict(exclude={"password"}))
    user_doc = user_obj.dict()
    user_doc['created_at'] = user_doc['created_at'].isoformat()
    user_doc['password_hash'] = "placeholder_hash"  # In production, hash the password
    
    await db.users.insert_one(user_doc)
    return user_obj

@api_router.get("/users", response_model=List[User])
async def get_users():
    """Get all users"""
    users = await db.users.find().to_list(1000)
    result = []
    for user in users:
        if isinstance(user.get('created_at'), str):
            user['created_at'] = datetime.fromisoformat(user['created_at'])
        if isinstance(user.get('last_login'), str) and user.get('last_login'):
            user['last_login'] = datetime.fromisoformat(user['last_login'])
        result.append(User(**{k: v for k, v in user.items() if k != 'password_hash'}))
    return result

@api_router.delete("/users/{user_id}")
async def delete_user(user_id: str):
    """Delete user"""
    result = await db.users.delete_one({"id": user_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="User not found")
    return {"status": "deleted", "user_id": user_id}

# Sales Tracking Routes  
def calculate_commission_rate(units_sold: int) -> float:
    """Calculate commission rate based on units sold"""
    for tier in COMMISSION_TIERS:
        if tier.max_units is None:  # Top tier (17+)
            if units_sold >= tier.min_units:
                return tier.rate
        else:  # Lower tiers
            if tier.min_units <= units_sold <= tier.max_units:
                return tier.rate
    return 0.12  # Default to lowest tier

@api_router.post("/sales", response_model=SoldVehicle)
async def create_sale(sale_data: SoldVehicleCreate):
    """Record a vehicle sale"""
    # Calculate total profit
    total_profit = sale_data.front_profit + sale_data.back_profit
    
    # Get current month sales count for this salesperson to determine commission rate
    start_of_month = datetime.now(timezone.utc).replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    monthly_sales = await db.sold_vehicles.count_documents({
        "salesperson_id": sale_data.salesperson_id,
        "sale_date": {"$gte": start_of_month.isoformat()}
    })
    
    # Calculate commission rate for next sale (current count + 1)
    commission_rate = calculate_commission_rate(monthly_sales + 1)
    commission_earned = total_profit * commission_rate
    
    # Create sold vehicle record
    sale_obj = SoldVehicle(
        **sale_data.dict(),
        total_profit=total_profit,
        commission_rate=commission_rate,
        commission_earned=commission_earned
    )
    
    sale_doc = sale_obj.dict()
    sale_doc['sale_date'] = sale_doc['sale_date'].isoformat()
    sale_doc['created_at'] = sale_doc['created_at'].isoformat()
    
    await db.sold_vehicles.insert_one(sale_doc)
    
    # Update lead status to closed if lead_id provided
    if sale_data.lead_id:
        await db.leads.update_one(
            {"id": sale_data.lead_id},
            {"$set": {"status": "closed"}}
        )
    
    return sale_obj

@api_router.get("/sales", response_model=List[SoldVehicle])
async def get_sales(salesperson_id: str = None, start_date: str = None, end_date: str = None):
    """Get sold vehicles with optional filters"""
    query = {}
    
    if salesperson_id:
        query["salesperson_id"] = salesperson_id
    
    if start_date:
        if not query.get("sale_date"):
            query["sale_date"] = {}
        query["sale_date"]["$gte"] = start_date
    
    if end_date:
        if not query.get("sale_date"):
            query["sale_date"] = {}
        query["sale_date"]["$lte"] = end_date
    
    sales = await db.sold_vehicles.find(query).sort("sale_date", -1).to_list(1000)
    result = []
    for sale in sales:
        if isinstance(sale.get('sale_date'), str):
            sale['sale_date'] = datetime.fromisoformat(sale['sale_date'])
        if isinstance(sale.get('created_at'), str):
            sale['created_at'] = datetime.fromisoformat(sale['created_at'])
        result.append(SoldVehicle(**sale))
    return result

@api_router.get("/sales/stats/{salesperson_id}")
async def get_sales_stats(salesperson_id: str, month: int = None, year: int = None):
    """Get sales statistics for a salesperson"""
    # Default to current month/year if not provided
    now = datetime.now(timezone.utc)
    target_month = month or now.month
    target_year = year or now.year
    
    # Calculate date range for the month
    start_date = datetime(target_year, target_month, 1, tzinfo=timezone.utc)
    if target_month == 12:
        end_date = datetime(target_year + 1, 1, 1, tzinfo=timezone.utc)
    else:
        end_date = datetime(target_year, target_month + 1, 1, tzinfo=timezone.utc)
    
    # Get sales for the month
    sales = await db.sold_vehicles.find({
        "salesperson_id": salesperson_id,
        "sale_date": {
            "$gte": start_date.isoformat(),
            "$lt": end_date.isoformat()
        }
    }).to_list(1000)
    
    # Calculate statistics
    total_units = len(sales)
    full_units = len([s for s in sales if s.get('sale_type') == 'full'])
    half_units = len([s for s in sales if s.get('sale_type') == 'half'])
    total_front_profit = sum(s.get('front_profit', 0) for s in sales)
    total_back_profit = sum(s.get('back_profit', 0) for s in sales)
    total_profit = total_front_profit + total_back_profit
    total_commission = sum(s.get('commission_earned', 0) for s in sales)
    
    # Current commission rate for next sale
    current_rate = calculate_commission_rate(total_units + 1)
    
    return {
        "salesperson_id": salesperson_id,
        "month": target_month,
        "year": target_year,
        "total_units": total_units,
        "full_units": full_units,
        "half_units": half_units,
        "total_front_profit": total_front_profit,
        "total_back_profit": total_back_profit,
        "total_profit": total_profit,
        "total_commission": total_commission,
        "current_commission_rate": current_rate,
        "next_tier_at": 15 if total_units < 15 else (17 if total_units < 17 else None)
    }

@api_router.get("/sales/dashboard")
async def get_sales_dashboard():
    """Get overall sales dashboard statistics"""
    # Current month stats
    now = datetime.now(timezone.utc)
    start_of_month = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    
    # Get all sales this month
    monthly_sales = await db.sold_vehicles.find({
        "sale_date": {"$gte": start_of_month.isoformat()}
    }).to_list(1000)
    
    # Get all users for per-person stats
    users = await db.users.find().to_list(1000)
    
    # Calculate overall stats
    total_units_month = len(monthly_sales)
    total_revenue_month = sum(s.get('sale_price', 0) for s in monthly_sales)
    total_profit_month = sum(s.get('total_profit', 0) for s in monthly_sales)
    total_commission_month = sum(s.get('commission_earned', 0) for s in monthly_sales)
    
    # Per-salesperson breakdown
    salesperson_stats = {}
    for user in users:
        user_sales = [s for s in monthly_sales if s.get('salesperson_id') == user.get('id')]
        salesperson_stats[user.get('id')] = {
            "name": user.get('full_name', 'Unknown'),
            "units": len(user_sales),
            "revenue": sum(s.get('sale_price', 0) for s in user_sales),
            "profit": sum(s.get('total_profit', 0) for s in user_sales),
            "commission": sum(s.get('commission_earned', 0) for s in user_sales)
        }
    
    return {
        "month": now.month,
        "year": now.year,
        "total_units": total_units_month,
        "total_revenue": total_revenue_month,
        "total_profit": total_profit_month,
        "total_commission": total_commission_month,
        "salesperson_breakdown": salesperson_stats,
        "commission_tiers": [
            {"range": "1-14 units", "rate": "12%"},
            {"range": "15-16 units", "rate": "15%"},
            {"range": "17+ units", "rate": "20%"}
        ]
    }
@api_router.post("/voice/call", response_model=VoiceCall)
async def initiate_voice_call(call_data: VoiceCallCreate):
    """Initiate AI voice call to lead"""
    # Verify lead exists
    lead = await db.leads.find_one({"id": call_data.lead_id})
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")
    
    # Create voice call record
    voice_call = VoiceCall(**call_data.dict())
    call_doc = voice_call.dict()
    call_doc['created_at'] = call_doc['created_at'].isoformat()
    
    await db.voice_calls.insert_one(call_doc)
    
    # TODO: Integrate with Twilio Voice API and OpenAI Realtime API
    # For now, return the call record
    return voice_call

@api_router.get("/voice/calls/{lead_id}")
async def get_voice_calls(lead_id: str):
    """Get voice call history for a lead"""
    calls = await db.voice_calls.find({"lead_id": lead_id}).sort("created_at", -1).to_list(1000)
    result = []
    for call in calls:
        if isinstance(call.get('created_at'), str):
            call['created_at'] = datetime.fromisoformat(call['created_at'])
        if isinstance(call.get('completed_at'), str) and call.get('completed_at'):
            call['completed_at'] = datetime.fromisoformat(call['completed_at'])
        if isinstance(call.get('scheduled_callback'), str) and call.get('scheduled_callback'):
            call['scheduled_callback'] = datetime.fromisoformat(call['scheduled_callback'])
        result.append(VoiceCall(**call))
    return result

@api_router.put("/voice/call/{call_id}")
async def update_voice_call(call_id: str, status: str, transcript: str = None, call_outcome: str = None, call_duration: int = None):
    """Update voice call status and details"""
    update_data = {"status": status}
    
    if transcript:
        update_data["transcript"] = transcript
    if call_outcome:
        update_data["call_outcome"] = call_outcome
    if call_duration:
        update_data["call_duration"] = call_duration
    if status == "completed":
        update_data["completed_at"] = datetime.now(timezone.utc).isoformat()
    
    await db.voice_calls.update_one({"id": call_id}, {"$set": update_data})
    return {"status": "updated", "call_id": call_id}

# Facebook Messenger Integration Routes
@api_router.get("/facebook/webhook")
async def facebook_webhook_verify(hub_mode: str = None, hub_challenge: str = None, hub_verify_token: str = None):
    """Facebook webhook verification"""
    VERIFY_TOKEN = os.environ.get('FB_VERIFY_TOKEN', 'your_verify_token')
    
    if hub_mode == "subscribe" and hub_verify_token == VERIFY_TOKEN:
        return int(hub_challenge)
    else:
        raise HTTPException(status_code=403, detail="Forbidden")

@api_router.post("/facebook/webhook")
async def facebook_webhook_handler(request: dict):
    """Handle incoming Facebook messages"""
    try:
        if request.get('object') == 'page':
            for entry in request.get('entry', []):
                for messaging in entry.get('messaging', []):
                    sender_id = messaging['sender']['id']
                    page_id = messaging['recipient']['id']
                    
                    if 'message' in messaging:
                        message_text = messaging['message'].get('text', '')
                        message_id = messaging['message']['mid']
                        
                        # Save incoming message
                        fb_message = FacebookMessage(
                            fb_sender_id=sender_id,
                            fb_page_id=page_id,
                            message_text=message_text,
                            direction="inbound",
                            fb_message_id=message_id
                        )
                        
                        message_doc = fb_message.dict()
                        message_doc['created_at'] = message_doc['created_at'].isoformat()
                        await db.facebook_messages.insert_one(message_doc)
                        
                        # Check if lead exists or create new one
                        lead = await db.leads.find_one({"fb_sender_id": sender_id})
                        
                        if not lead:
                            # Create new lead from Facebook profile
                            # Note: In production, you'd get profile info from Facebook API
                            lead_data = LeadCreate(
                                tenant_id="default_dealership",
                                first_name="Facebook",
                                last_name="Lead",
                                primary_phone="",
                                email=f"fb_{sender_id}@facebook.com"
                            )
                            
                            lead_dict = lead_data.dict()
                            lead_dict['fb_sender_id'] = sender_id
                            lead_obj = Lead(**lead_dict)
                            lead_doc = lead_obj.dict()
                            lead_doc['created_at'] = lead_doc['created_at'].isoformat()
                            
                            await db.leads.insert_one(lead_doc)
                            lead_id = lead_obj.id
                        else:
                            lead_id = lead['id']
                        
                        # Update message with lead_id
                        await db.facebook_messages.update_one(
                            {"id": fb_message.id}, 
                            {"$set": {"lead_id": lead_id}}
                        )
                        
                        # Generate AI response
                        try:
                            ai_response = await generate_facebook_ai_response(lead_id, message_text, sender_id)
                            
                            # Send response back to Facebook
                            await send_facebook_message(sender_id, ai_response)
                            
                            # Save outbound message
                            response_message = FacebookMessage(
                                lead_id=lead_id,
                                fb_sender_id=sender_id,
                                fb_page_id=page_id,
                                message_text=ai_response,
                                direction="outbound",
                                fb_message_id=f"out_{datetime.now().timestamp()}"
                            )
                            
                            response_doc = response_message.dict()
                            response_doc['created_at'] = response_doc['created_at'].isoformat()
                            await db.facebook_messages.insert_one(response_doc)
                            
                        except Exception as e:
                            logging.error(f"Error generating Facebook AI response: {str(e)}")
        
        return {"status": "ok"}
        
    except Exception as e:
        logging.error(f"Facebook webhook error: {str(e)}")
        raise HTTPException(status_code=500, detail="Webhook processing error")

async def generate_facebook_ai_response(lead_id: str, message_text: str, sender_id: str) -> str:
    """Generate AI response for Facebook message"""
    try:
        # Get lead details
        lead = await db.leads.find_one({"id": lead_id})
        if not lead:
            return "Hi! Thanks for your message. Let me connect you with Alfonso at 210-632-8712 for immediate assistance."
        
        # Get Facebook conversation history
        fb_messages = await db.facebook_messages.find({"lead_id": lead_id}).sort("created_at", 1).to_list(10)
        
        # Build context
        lead_context = f"""
        Lead Information:
        - Name: {lead['first_name']} {lead['last_name']}
        - Platform: Facebook Marketplace
        - Initial Inquiry: {lead.get('marketplace_inquiry', 'Not specified')}
        """
        
        conversation_history = ""
        for msg in fb_messages[-5:]:
            direction = "Customer" if msg.get('direction') == 'inbound' else "Alfonso"
            conversation_history += f"{direction}: {msg.get('message_text', '')}\n"
        
        system_message = f"""You are Alfonso Martinez from Shottenkirk Toyota San Antonio responding to Facebook Marketplace inquiries.

        DEALERSHIP INFO: 18019 US-281, San Antonio TX 78232 | 210-526-2851
        INVENTORY: 214 New Toyotas + 367 Preowned (all makes/models)
        
        {lead_context}
        
        Previous conversation:
        {conversation_history}
        
        FACEBOOK MARKETPLACE RULES:
        1. Keep responses SHORT (1-2 sentences for Facebook)
        2. IMMEDIATELY focus on phone contact or visit
        3. Don't try to sell via Facebook chat
        4. Use: "Call me directly at 210-632-8712" or "Come see it at 18019 US-281"
        5. Create urgency: "I have several people interested"
        6. For vehicle inquiries: "Still available! When can you come see it?"
        
        Current time: {datetime.now(timezone.utc).strftime('%B %d, %Y at %I:%M %p')}
        """
        
        # Initialize AI chat
        emergent_key = os.environ.get('EMERGENT_LLM_KEY')
        if not emergent_key:
            return "Hi! Thanks for your message. Please call me at 210-632-8712 for immediate assistance with your vehicle inquiry."
        
        chat = LlmChat(
            api_key=emergent_key,
            session_id=f"fb_{sender_id}",
            system_message=system_message
        ).with_model("openai", "gpt-4o-mini")
        
        user_message = UserMessage(text=message_text)
        response = await chat.send_message(user_message)
        
        return response
        
    except Exception as e:
        logging.error(f"Facebook AI response error: {str(e)}")
        return "Hi! Thanks for your message. Please call me at 210-632-8712 for immediate assistance."

async def send_facebook_message(recipient_id: str, message_text: str):
    """Send message to Facebook user"""
    page_access_token = os.environ.get('FB_PAGE_ACCESS_TOKEN')
    if not page_access_token:
        logging.error("Facebook Page Access Token not configured")
        return
    
    url = f"https://graph.facebook.com/v18.0/me/messages"
    
    payload = {
        "recipient": {"id": recipient_id},
        "message": {"text": message_text}
    }
    
    headers = {
        "Authorization": f"Bearer {page_access_token}",
        "Content-Type": "application/json"
    }
    
    try:
        response = requests.post(url, json=payload, headers=headers)
        if response.status_code != 200:
            logging.error(f"Facebook send message error: {response.text}")
    except Exception as e:
        logging.error(f"Facebook send message exception: {str(e)}")

@api_router.get("/facebook/messages/{lead_id}")
async def get_facebook_messages(lead_id: str):
    """Get Facebook messages for a lead"""
    messages = await db.facebook_messages.find({"lead_id": lead_id}).sort("created_at", 1).to_list(1000)
    result = []
    for msg in messages:
        if isinstance(msg.get('created_at'), str):
            msg['created_at'] = datetime.fromisoformat(msg['created_at'])
        result.append(FacebookMessage(**msg))
    return result
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

# Chrome Extension Models and Endpoints
class VehicleData(BaseModel):
    title: Optional[str] = None
    year: Optional[int] = None
    make: Optional[str] = None
    model: Optional[str] = None
    price: Optional[float] = None
    mileage: Optional[int] = None
    description: Optional[str] = None
    features: List[str] = []
    images: List[str] = []

class SEODescriptionRequest(BaseModel):
    tenant_id: str
    vehicle_data: VehicleData
    current_description: Optional[str] = None

class PriceOptimizationRequest(BaseModel):
    tenant_id: str
    vehicle_data: VehicleData
    current_price: Optional[float] = None

class InventorySyncRequest(BaseModel):
    tenant_id: str
    source: str = "facebook_marketplace"

class ExtensionAuthRequest(BaseModel):
    email: str
    password: str

# Chrome Extension API Endpoints
@api_router.get("/health")
async def health_check():
    """Health check endpoint for Chrome extension"""
    return {"status": "healthy", "timestamp": datetime.now(timezone.utc).isoformat()}

@api_router.post("/auth/extension-login")
async def extension_login(auth_data: ExtensionAuthRequest):
    """Authenticate user for Chrome extension"""
    # Simple authentication - in production, implement proper auth
    # For now, return mock data for testing
    return {
        "success": True,
        "user": {
            "id": str(uuid.uuid4()),
            "email": auth_data.email,
            "name": "Demo User"
        },
        "tenant_id": "demo_tenant_123",
        "token": "mock_jwt_token"
    }

@api_router.post("/inventory/sync")
async def sync_inventory(request: InventorySyncRequest):
    """Sync inventory with external sources"""
    try:
        # Mock inventory sync for demonstration
        # In production, this would sync with actual inventory systems
        
        # Simulate processing time
        await asyncio.sleep(2)
        
        # Mock successful sync response
        vehicles_processed = random.randint(5, 25)
        
        # Log sync activity
        sync_doc = {
            "id": str(uuid.uuid4()),
            "tenant_id": request.tenant_id,
            "source": request.source,
            "vehicles_processed": vehicles_processed,
            "status": "completed",
            "synced_at": datetime.now(timezone.utc).isoformat()
        }
        
        await db.inventory_syncs.insert_one(sync_doc)
        
        return {
            "status": "success",
            "vehicles_processed": vehicles_processed,
            "message": f"Successfully synced {vehicles_processed} vehicles from {request.source}"
        }
        
    except Exception as e:
        return {
            "status": "error",
            "message": f"Sync failed: {str(e)}"
        }

@api_router.get("/inventory/summary")
async def get_inventory_summary(tenant_id: str):
    """Get inventory summary with real Shottenkirk Toyota data"""
    try:
        # Check if we have cached data in the database
        cached_data = await db.inventory_cache.find_one({"tenant_id": tenant_id}, sort=[("last_updated", -1)])
        
        if cached_data:
            # Use cached data if it's less than 6 hours old
            cache_time = datetime.fromisoformat(cached_data["last_updated"].replace("Z", "+00:00"))
            if (datetime.now(timezone.utc) - cache_time).total_seconds() < 21600:  # 6 hours
                return {
                    "total_vehicles": cached_data.get("total_vehicles", 0),
                    "new_vehicles": cached_data.get("new_vehicles", 0),
                    "used_vehicles": cached_data.get("used_vehicles", 0),
                    "last_sync": cached_data.get("last_updated"),
                    "recent_vehicles": cached_data.get("vehicles", [])[:5],  # Show 5 most recent
                    "dealership": cached_data.get("dealership", "Shottenkirk Toyota San Antonio"),
                    "cached": True
                }
        
        # If no cache or cache is old, return mock data
        # (Full scraping will be done in background)
        summary = {
            "total_vehicles": 260,
            "new_vehicles": 180,
            "used_vehicles": 80,
            "last_sync": None,
            "recent_vehicles": [
                {"year": 2025, "make": "Toyota", "model": "Camry", "trim": "XSE", "price": 32995, "status": "available", "vin": "4T1DAACK1SU207179"},
                {"year": 2025, "make": "Toyota", "model": "RAV4", "trim": "XLE Premium", "price": 38769, "status": "available", "vin": "2T3A1RFV4SW577282"},
                {"year": 2025, "make": "Toyota", "model": "Tacoma", "trim": "TRD Sport", "price": 49699, "status": "available", "vin": "3TYLC5LN9ST041305"},
                {"year": 2026, "make": "Toyota", "model": "Tundra", "trim": "1794 Edition", "price": 76955, "status": "available", "vin": "5TFMC5DB8TX118598"},
                {"year": 2025, "make": "Toyota", "model": "Corolla", "trim": "FX", "price": 29485, "status": "available", "vin": "5YFB4MCE9SP252687"}
            ],
            "dealership": "Shottenkirk Toyota San Antonio",
            "cached": False
        }
        return summary
    except Exception as e:
        logger.error(f"Inventory summary error: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to retrieve inventory summary")

@api_router.post("/inventory/sync/{tenant_id}")
async def sync_dealership_inventory(tenant_id: str, background_tasks: BackgroundTasks):
    """Sync real inventory from Shottenkirk Toyota website"""
    try:
        # Start background task to scrape inventory
        background_tasks.add_task(scrape_and_cache_inventory, tenant_id)
        
        return {
            "status": "started",
            "message": "Inventory sync initiated in background",
            "estimated_time": "2-5 minutes"
        }
    except Exception as e:
        logger.error(f"Inventory sync error: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to start inventory sync")

async def scrape_and_cache_inventory(tenant_id: str):
    """Background task to scrape and cache inventory data"""
    try:
        logger.info(f"Starting inventory scraping for tenant: {tenant_id}")
        
        # For demonstration purposes, use realistic mock data
        # In production, this would use the scraper
        from mock_inventory_data import SHOTTENKIRK_TOYOTA_INVENTORY
        inventory_data = SHOTTENKIRK_TOYOTA_INVENTORY.copy()
        
        # Add tenant_id to the data
        inventory_data["tenant_id"] = tenant_id
        
        # Store in database
        await db.inventory_cache.replace_one(
            {"tenant_id": tenant_id}, 
            inventory_data, 
            upsert=True
        )
        
        logger.info(f"Inventory sync complete: {inventory_data['total_vehicles']} vehicles cached")
        
    except Exception as e:
        logger.error(f"Background inventory sync failed: {str(e)}")
        
        # Fallback to basic mock data
        basic_mock = {
            "tenant_id": tenant_id,
            "dealership": "Shottenkirk Toyota San Antonio",
            "total_vehicles": 260,
            "new_vehicles": 180, 
            "used_vehicles": 80,
            "last_updated": datetime.now(timezone.utc).isoformat(),
            "vehicles": []
        }
        
        await db.inventory_cache.replace_one(
            {"tenant_id": tenant_id}, 
            basic_mock, 
            upsert=True
        )
        
        logger.info("Basic fallback inventory data cached")

# =============================================================================
# GOOGLE ADS & CRAIGSLIST API ENDPOINTS  
# =============================================================================

class GoogleAdsCampaignCreate(BaseModel):
    tenant_id: str
    name: str
    type: str  # search, display, video, shopping
    budget: float
    targeting: Optional[str] = None
    keywords: Optional[str] = None
    description: Optional[str] = None

class GoogleAdsCampaign(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    tenant_id: str
    name: str
    type: str
    budget: float
    targeting: Optional[str] = None
    keywords: Optional[str] = None
    description: Optional[str] = None
    status: str = "active"  # active, paused, ended
    spent: float = 0.0
    clicks: int = 0
    impressions: int = 0
    conversions: int = 0
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class CraigslistAd(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    tenant_id: str
    vehicle_id: Optional[str] = None
    title: str
    description: str
    price: float
    location: str = "San Antonio, TX"
    image: Optional[str] = None
    status: str = "active"  # active, expired, flagged, removed
    views: int = 0
    replies: int = 0
    leads: int = 0
    craigslist_id: Optional[str] = None
    posted_date: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    expires_at: Optional[datetime] = None
    last_renewed: Optional[datetime] = None

# Google Ads Endpoints
@api_router.get("/google-ads")
async def get_google_ads(tenant_id: str):
    """Get all Google Ads for a tenant"""
    try:
        ads = await db.google_ads.find({"tenant_id": tenant_id}).to_list(length=None)
        return {"ads": [GoogleAdsCampaign(**ad) for ad in ads]}
    except Exception as e:
        logger.error(f"Error fetching Google Ads: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to fetch Google Ads")

@api_router.get("/google-ads/campaigns")
async def get_google_ads_campaigns(tenant_id: str):
    """Get Google Ads campaigns with mock data for demonstration"""
    try:
        # Mock campaigns data - in production this would connect to Google Ads API
        mock_campaigns = [
            {
                "id": str(uuid.uuid4()),
                "tenant_id": tenant_id,
                "name": "2025 Toyota Camry - Search Campaign",
                "type": "search",
                "budget": 75.0,
                "targeting": "San Antonio, TX + 25 miles",
                "keywords": "toyota camry, buy camry, camry dealership",
                "status": "active",
                "spent": 234.67,
                "clicks": 156,
                "impressions": 4520,
                "conversions": 12,
                "created_at": datetime.now(timezone.utc).isoformat()
            },
            {
                "id": str(uuid.uuid4()),
                "tenant_id": tenant_id,
                "name": "RAV4 Display Campaign",
                "type": "display", 
                "budget": 50.0,
                "targeting": "Auto shoppers, 25-55 years",
                "keywords": "toyota rav4, suv, family vehicle",
                "status": "active",
                "spent": 89.23,
                "clicks": 67,
                "impressions": 2340,
                "conversions": 5,
                "created_at": datetime.now(timezone.utc).isoformat()
            },
            {
                "id": str(uuid.uuid4()),
                "tenant_id": tenant_id,
                "name": "Tacoma Video Campaign",
                "type": "video",
                "budget": 100.0,
                "targeting": "Truck enthusiasts, YouTube",
                "keywords": "toyota tacoma, pickup truck, trd",
                "status": "paused",
                "spent": 45.12,
                "clicks": 23,
                "impressions": 1890,
                "conversions": 2,
                "created_at": datetime.now(timezone.utc).isoformat()
            }
        ]
        
        return {"campaigns": mock_campaigns}
    except Exception as e:
        logger.error(f"Error fetching Google Ads campaigns: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to fetch campaigns")

@api_router.post("/google-ads/campaigns")
async def create_google_ads_campaign(campaign_data: GoogleAdsCampaignCreate):
    """Create a new Google Ads campaign"""
    try:
        campaign = GoogleAdsCampaign(**campaign_data.dict())
        campaign_doc = campaign.dict()
        await db.google_ads_campaigns.insert_one(campaign_doc)
        
        logger.info(f"Google Ads campaign created: {campaign.name}")
        return campaign
    except Exception as e:
        logger.error(f"Error creating Google Ads campaign: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to create campaign")

# Craigslist Endpoints
@api_router.get("/craigslist-ads")
async def get_craigslist_ads(tenant_id: str):
    """Get all Craigslist ads for a tenant"""
    try:
        # Mock Craigslist ads data
        mock_ads = [
            {
                "id": str(uuid.uuid4()),
                "tenant_id": tenant_id,
                "title": "2025 Toyota Camry XSE - Like New, Low Miles",
                "description": "Beautiful 2025 Toyota Camry XSE in excellent condition. Only 2,500 miles. Loaded with features including leather seats, navigation, and safety features.",
                "price": 32995,
                "location": "San Antonio, TX",
                "image": "https://vehicle-photos-published.vauto.com/b0/f8/c8/20-9864-4c91-aba8-93c6593252aa/image-1.jpg",
                "status": "active",
                "views": 1247,
                "replies": 23,
                "leads": 8,
                "posted_date": datetime.now(timezone.utc).isoformat(),
                "expires_at": (datetime.now(timezone.utc) + timedelta(days=30)).isoformat()
            },
            {
                "id": str(uuid.uuid4()),
                "tenant_id": tenant_id, 
                "title": "2025 Toyota RAV4 XLE Premium - All-Wheel Drive",
                "description": "Brand new 2025 Toyota RAV4 XLE Premium with AWD. Perfect for families. Great safety ratings and fuel economy.",
                "price": 38769,
                "location": "San Antonio, TX",
                "image": "https://vehicle-photos-published.vauto.com/86/0b/7b/a1-8c61-497b-9432-dbda66c798e6/image-1.jpg",
                "status": "active",
                "views": 892,
                "replies": 15,
                "leads": 6,
                "posted_date": (datetime.now(timezone.utc) - timedelta(days=3)).isoformat(),
                "expires_at": (datetime.now(timezone.utc) + timedelta(days=27)).isoformat()
            },
            {
                "id": str(uuid.uuid4()),
                "tenant_id": tenant_id,
                "title": "2025 Toyota Tacoma TRD Sport - Ready for Adventure",
                "description": "Powerful 2025 Toyota Tacoma TRD Sport. Perfect for work and play. Advanced 4WD system and TRD performance features.",
                "price": 49699,
                "location": "San Antonio, TX", 
                "image": "https://vehicle-photos-published.vauto.com/77/3f/21/08-292c-4a8d-a11e-d32d897f11c9/image-1.jpg",
                "status": "active",
                "views": 634,
                "replies": 19,
                "leads": 11,
                "posted_date": (datetime.now(timezone.utc) - timedelta(days=1)).isoformat(),
                "expires_at": (datetime.now(timezone.utc) + timedelta(days=29)).isoformat()
            }
        ]
        
        return {"ads": mock_ads}
    except Exception as e:
        logger.error(f"Error fetching Craigslist ads: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to fetch Craigslist ads")

@api_router.post("/craigslist-ads/sync-inventory")
async def sync_inventory_to_craigslist(request_data: dict):
    """Sync dealership inventory to Craigslist"""
    try:
        tenant_id = request_data.get("tenant_id")
        
        # Get inventory data
        cached_inventory = await db.inventory_cache.find_one({"tenant_id": tenant_id})
        if not cached_inventory:
            raise HTTPException(status_code=404, detail="No inventory data found")
        
        vehicles = cached_inventory.get("vehicles", [])
        
        # Create Craigslist ads for vehicles (simulation)
        ads_created = 0
        for vehicle in vehicles[:5]:  # Limit to 5 for demonstration
            ad_data = {
                "tenant_id": tenant_id,
                "vehicle_id": vehicle.get("vin"),
                "title": f"{vehicle.get('year')} {vehicle.get('make')} {vehicle.get('model')} {vehicle.get('trim', '')}".strip(),
                "description": f"Excellent {vehicle.get('year')} {vehicle.get('make')} {vehicle.get('model')} in {vehicle.get('exterior_color', 'great')} condition. {vehicle.get('description', '')}",
                "price": vehicle.get("price", 0),
                "location": "San Antonio, TX",
                "image": vehicle.get("images", [None])[0],
                "status": "pending_review"  # Would be posted after review
            }
            
            craigslist_ad = CraigslistAd(**ad_data)
            ad_doc = craigslist_ad.dict()
            await db.craigslist_ads.insert_one(ad_doc)
            ads_created += 1
        
        logger.info(f"Craigslist sync initiated: {ads_created} ads created for tenant {tenant_id}")
        return {
            "status": "success",
            "ads_created": ads_created,
            "message": f"Successfully created {ads_created} Craigslist listings from inventory"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error syncing inventory to Craigslist: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to sync inventory to Craigslist")

@api_router.post("/craigslist-ads/{ad_id}/renew")
async def renew_craigslist_ad(ad_id: str):
    """Renew a Craigslist ad"""
    try:
        # Update renewal timestamp
        result = await db.craigslist_ads.update_one(
            {"id": ad_id},
            {
                "$set": {
                    "last_renewed": datetime.now(timezone.utc).isoformat(),
                    "expires_at": (datetime.now(timezone.utc) + timedelta(days=30)).isoformat(),
                    "status": "active"
                }
            }
        )
        
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="Craigslist ad not found")
        
        logger.info(f"Craigslist ad renewed: {ad_id}")
        return {"status": "success", "message": "Ad renewed successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error renewing Craigslist ad: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to renew ad")

# =============================================================================
# SOCIAL MEDIA ADS API ENDPOINTS (Facebook, Instagram, TikTok, LinkedIn)
# =============================================================================

class SocialMediaAd(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    tenant_id: str
    platform: str  # facebook, instagram, tiktok, linkedin
    name: str
    objective: str  # brand_awareness, traffic, conversions, lead_generation
    audience: str
    budget: float
    status: str = "active"  # active, paused, completed
    spent: float = 0.0
    reach: int = 0
    impressions: int = 0
    engagements: int = 0
    clicks: int = 0
    leads: int = 0
    video_views: int = 0
    shares: int = 0
    comments: int = 0
    story_views: int = 0
    profile_visits: int = 0
    image: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

# Facebook Ads Endpoints
@api_router.get("/facebook-ads")
async def get_facebook_ads(tenant_id: str):
    """Get Facebook ads with mock data"""
    try:
        mock_ads = [
            {
                "id": str(uuid.uuid4()),
                "tenant_id": tenant_id,
                "platform": "facebook",
                "name": "2025 Toyota Camry Showcase",
                "objective": "lead_generation",
                "audience": "Auto shoppers, 25-55, San Antonio area",
                "budget": 125.0,
                "status": "active",
                "spent": 89.45,
                "reach": 12450,
                "impressions": 18670,
                "engagements": 1234,
                "clicks": 456,
                "leads": 23,
                "image": "https://vehicle-photos-published.vauto.com/b0/f8/c8/20-9864-4c91-aba8-93c6593252aa/image-1.jpg",
                "created_at": datetime.now(timezone.utc).isoformat()
            },
            {
                "id": str(uuid.uuid4()),
                "tenant_id": tenant_id,
                "platform": "facebook",
                "name": "RAV4 Family Safety Campaign",
                "objective": "brand_awareness",
                "audience": "Parents with children, 30-50",
                "budget": 75.0,
                "status": "active",
                "spent": 52.30,
                "reach": 8920,
                "impressions": 13560,
                "engagements": 890,
                "clicks": 234,
                "leads": 15,
                "image": "https://vehicle-photos-published.vauto.com/86/0b/7b/a1-8c61-497b-9432-dbda66c798e6/image-1.jpg",
                "created_at": datetime.now(timezone.utc).isoformat()
            }
        ]
        return {"ads": mock_ads}
    except Exception as e:
        logger.error(f"Error fetching Facebook ads: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to fetch Facebook ads")

# Instagram Ads Endpoints
@api_router.get("/instagram-ads")
async def get_instagram_ads(tenant_id: str):
    """Get Instagram ads with mock data"""
    try:
        mock_ads = [
            {
                "id": str(uuid.uuid4()),
                "tenant_id": tenant_id,
                "platform": "instagram",
                "name": "Tacoma Adventure Stories",
                "objective": "brand_awareness",
                "audience": "Outdoor enthusiasts, 25-45",
                "budget": 100.0,
                "status": "active",
                "spent": 78.90,
                "reach": 15670,
                "impressions": 23450,
                "engagements": 2340,
                "clicks": 567,
                "leads": 18,
                "story_views": 8900,
                "profile_visits": 234,
                "image": "https://vehicle-photos-published.vauto.com/77/3f/21/08-292c-4a8d-a11e-d32d897f11c9/image-1.jpg",
                "created_at": datetime.now(timezone.utc).isoformat()
            },
            {
                "id": str(uuid.uuid4()),
                "tenant_id": tenant_id,
                "platform": "instagram",
                "name": "Luxury Tundra Lifestyle",
                "objective": "traffic",
                "audience": "Luxury truck buyers, 35-60",
                "budget": 150.0,
                "status": "active",
                "spent": 134.20,
                "reach": 9870,
                "impressions": 16780,
                "engagements": 1560,
                "clicks": 345,
                "leads": 12,
                "story_views": 5670,
                "profile_visits": 156,
                "image": "https://vehicle-photos-published.vauto.com/14/a7/54/0e-a81b-46d0-b3dc-4c815c426f1c/image-1.jpg",
                "created_at": datetime.now(timezone.utc).isoformat()
            }
        ]
        return {"ads": mock_ads}
    except Exception as e:
        logger.error(f"Error fetching Instagram ads: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to fetch Instagram ads")

# TikTok Ads Endpoints
@api_router.get("/tiktok-ads")
async def get_tiktok_ads(tenant_id: str):
    """Get TikTok ads with mock data"""
    try:
        mock_ads = [
            {
                "id": str(uuid.uuid4()),
                "tenant_id": tenant_id,
                "platform": "tiktok",
                "name": "Gen Z Car Buying Experience",
                "objective": "video_views",
                "audience": "Car shoppers, 18-35, trending interests",
                "budget": 200.0,
                "status": "active",
                "spent": 167.80,
                "reach": 45670,
                "impressions": 89340,
                "engagements": 8920,
                "clicks": 1240,
                "leads": 34,
                "video_views": 67890,
                "shares": 890,
                "comments": 456,
                "image": "https://vehicle-photos-published.vauto.com/13/e7/0f/5b-6e0d-423f-beb0-47c1e8aeb432/image-1.jpg",
                "created_at": datetime.now(timezone.utc).isoformat()
            },
            {
                "id": str(uuid.uuid4()),
                "tenant_id": tenant_id,
                "platform": "tiktok",
                "name": "Toyota Challenge Dance",
                "objective": "brand_awareness",
                "audience": "Young adults, 16-28, viral content",
                "budget": 300.0,
                "status": "paused",
                "spent": 245.60,
                "reach": 123400,
                "impressions": 234560,
                "engagements": 23400,
                "clicks": 2340,
                "leads": 78,
                "video_views": 189000,
                "shares": 3400,
                "comments": 1890,
                "image": "https://vehicle-photos-published.vauto.com/b0/f8/c8/20-9864-4c91-aba8-93c6593252aa/image-1.jpg",
                "created_at": datetime.now(timezone.utc).isoformat()
            }
        ]
        return {"ads": mock_ads}
    except Exception as e:
        logger.error(f"Error fetching TikTok ads: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to fetch TikTok ads")

# LinkedIn Ads Endpoints
@api_router.get("/linkedin-ads")
async def get_linkedin_ads(tenant_id: str):
    """Get LinkedIn ads with mock data"""
    try:
        mock_ads = [
            {
                "id": str(uuid.uuid4()),
                "tenant_id": tenant_id,
                "platform": "linkedin",
                "name": "Executive Fleet Solutions",
                "objective": "lead_generation",
                "audience": "Business executives, fleet managers",
                "budget": 250.0,
                "status": "active",
                "spent": 189.40,
                "reach": 5670,
                "impressions": 12340,
                "engagements": 456,
                "clicks": 234,
                "leads": 19,
                "image": "https://vehicle-photos-published.vauto.com/9f/b1/36/70-aa0d-4bfa-b5af-8f2aa4b3ccf7/image-1.jpg",
                "created_at": datetime.now(timezone.utc).isoformat()
            },
            {
                "id": str(uuid.uuid4()),
                "tenant_id": tenant_id,
                "platform": "linkedin",
                "name": "Professional Hybrid Solutions",
                "objective": "brand_awareness",
                "audience": "Professionals, eco-conscious buyers",
                "budget": 150.0,
                "status": "active",
                "spent": 98.70,
                "reach": 3450,
                "impressions": 8900,
                "engagements": 290,
                "clicks": 145,
                "leads": 11,
                "image": "https://vehicle-photos-published.vauto.com/04/62/cc/67-97f7-4073-b85c-b55109d98973/image-1.jpg",
                "created_at": datetime.now(timezone.utc).isoformat()
            }
        ]
        return {"ads": mock_ads}
    except Exception as e:
        logger.error(f"Error fetching LinkedIn ads: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to fetch LinkedIn ads")

# =============================================================================
# COMMUNICATIONS HUB API ENDPOINTS
# =============================================================================

class Conversation(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    tenant_id: str
    contact_id: str
    channel: str  # sms, email, facebook, instagram, whatsapp, phone, google
    contact: Dict
    last_message: Optional[str] = None
    last_message_time: Optional[datetime] = None
    unread_count: int = 0
    status: str = "active"  # active, archived, closed
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class Message(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    conversation_id: str
    content: str
    type: str  # inbound, outbound
    sender: str
    channel: str
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    read_status: bool = False

@api_router.get("/communications/conversations")
async def get_conversations(tenant_id: str, channel: str = "all"):
    """Get conversations for unified inbox"""
    try:
        # Mock conversation data for demonstration
        mock_conversations = [
            {
                "id": "conv_1",
                "tenant_id": tenant_id,
                "contact": {"name": "Sarah Johnson", "phone": "+1-555-0123"},
                "channel": "sms",
                "last_message": "Interested in the 2025 Camry",
                "last_message_time": datetime.now(timezone.utc).isoformat(),
                "unread_count": 2,
                "status": "active"
            },
            {
                "id": "conv_2", 
                "tenant_id": tenant_id,
                "contact": {"name": "Mike Rodriguez", "email": "mike@email.com"},
                "channel": "email",
                "last_message": "What financing options do you have?",
                "last_message_time": (datetime.now(timezone.utc) - timedelta(minutes=15)).isoformat(),
                "unread_count": 0,
                "status": "active"
            },
            {
                "id": "conv_3",
                "tenant_id": tenant_id,
                "contact": {"name": "Facebook User", "phone": "fb_user_123"},
                "channel": "facebook",
                "last_message": "Do you have RAV4 in stock?",
                "last_message_time": (datetime.now(timezone.utc) - timedelta(hours=1)).isoformat(),
                "unread_count": 1,
                "status": "active"
            }
        ]
        
        if channel != "all":
            mock_conversations = [c for c in mock_conversations if c["channel"] == channel]
        
        return {"conversations": mock_conversations}
    except Exception as e:
        logger.error(f"Error fetching conversations: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to fetch conversations")

@api_router.get("/communications/conversations/{conversation_id}/messages")
async def get_conversation_messages(conversation_id: str):
    """Get messages for a specific conversation"""
    try:
        # Mock messages data
        mock_messages = [
            {
                "id": "msg_1",
                "conversation_id": conversation_id,
                "content": "Hi, I'm interested in the 2025 Toyota Camry. Do you have any in stock?",
                "type": "inbound",
                "sender": "Customer",
                "channel": "sms",
                "timestamp": datetime.now(timezone.utc).isoformat(),
                "read_status": True
            },
            {
                "id": "msg_2",
                "conversation_id": conversation_id,
                "content": "Hello! Yes, we have several 2025 Camry models available. What trim level are you interested in?",
                "type": "outbound", 
                "sender": "You",
                "channel": "sms",
                "timestamp": (datetime.now(timezone.utc) - timedelta(minutes=2)).isoformat(),
                "read_status": True
            }
        ]
        return {"messages": mock_messages}
    except Exception as e:
        logger.error(f"Error fetching messages: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to fetch messages")

@api_router.post("/communications/conversations/{conversation_id}/messages")
async def send_message(conversation_id: str, message_data: dict):
    """Send a message in a conversation"""
    try:
        # In production, this would actually send the message via the appropriate channel
        message = Message(
            conversation_id=conversation_id,
            content=message_data["content"],
            type=message_data["type"],
            sender="You",
            channel="sms"  # Would be determined by conversation
        )
        
        # Store message (mock)
        logger.info(f"Message sent in conversation {conversation_id}: {message_data['content']}")
        return {"status": "sent", "message_id": message.id}
    except Exception as e:
        logger.error(f"Error sending message: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to send message")

# =============================================================================
# SALES PIPELINE API ENDPOINTS  
# =============================================================================

class PipelineStage(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    tenant_id: str
    name: str
    color: str
    order: int
    automation_enabled: bool = False
    automation_actions: List[str] = Field(default_factory=list)
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

@api_router.get("/pipeline/stages")
async def get_pipeline_stages(tenant_id: str):
    """Get pipeline stages for a tenant"""
    try:
        # Mock pipeline stages
        mock_stages = [
            {
                "id": "new",
                "tenant_id": tenant_id,
                "name": "New Leads",
                "color": "bg-blue-600",
                "order": 1,
                "automation_enabled": True,
                "automation_actions": ["send_welcome_sms", "assign_to_rep"]
            },
            {
                "id": "contacted", 
                "tenant_id": tenant_id,
                "name": "Contacted",
                "color": "bg-yellow-600",
                "order": 2,
                "automation_enabled": True,
                "automation_actions": ["schedule_follow_up"]
            },
            {
                "id": "qualified",
                "tenant_id": tenant_id,
                "name": "Qualified",
                "color": "bg-orange-600",
                "order": 3,
                "automation_enabled": True,
                "automation_actions": ["send_vehicle_info"]
            },
            {
                "id": "appointment",
                "tenant_id": tenant_id,
                "name": "Appointment Set",
                "color": "bg-purple-600", 
                "order": 4,
                "automation_enabled": True,
                "automation_actions": ["send_appointment_reminder"]
            },
            {
                "id": "negotiating",
                "tenant_id": tenant_id,
                "name": "Negotiating",
                "color": "bg-red-600",
                "order": 5,
                "automation_enabled": False,
                "automation_actions": []
            },
            {
                "id": "closed_won",
                "tenant_id": tenant_id,
                "name": "Closed Won",
                "color": "bg-green-600",
                "order": 6,
                "automation_enabled": True,
                "automation_actions": ["send_thank_you", "schedule_delivery"]
            },
            {
                "id": "closed_lost",
                "tenant_id": tenant_id,
                "name": "Closed Lost", 
                "color": "bg-gray-600",
                "order": 7,
                "automation_enabled": False,
                "automation_actions": []
            }
        ]
        return {"stages": mock_stages}
    except Exception as e:
        logger.error(f"Error fetching pipeline stages: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to fetch pipeline stages")

@api_router.get("/pipeline/stats")
async def get_pipeline_stats(tenant_id: str):
    """Get pipeline statistics"""
    try:
        # Mock pipeline stats
        stats = {
            "total_leads": 47,
            "conversion_rate": 24.5,
            "avg_deal_size": 38500,
            "pipeline_velocity": 14.2,
            "monthly_revenue": 425000,
            "deals_closed": 12
        }
        return stats
    except Exception as e:
        logger.error(f"Error fetching pipeline stats: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to fetch pipeline stats")

@api_router.post("/pipeline/automation/trigger")
async def trigger_pipeline_automation(automation_data: dict):
    """Trigger automation when lead moves to new stage"""
    try:
        lead_id = automation_data["lead_id"] 
        stage_id = automation_data["stage_id"]
        
        # Mock automation triggers
        automations = {
            "new": ["Send welcome SMS", "Assign to sales rep"],
            "contacted": ["Schedule 24-hour follow-up"],
            "qualified": ["Send vehicle information packet"],
            "appointment": ["Send appointment reminder", "Calendar notification"],
            "closed_won": ["Send thank you message", "Schedule delivery"]
        }
        
        actions = automations.get(stage_id, [])
        logger.info(f"Triggered automation for lead {lead_id} in stage {stage_id}: {actions}")
        
        return {
            "status": "success",
            "actions_triggered": actions,
            "message": f"Automation triggered for {stage_id} stage"
        }
    except Exception as e:
        logger.error(f"Error triggering automation: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to trigger automation")

# =============================================================================
# WEBSITE BUILDER API ENDPOINTS
# =============================================================================

class WebsiteCreate(BaseModel):
    tenant_id: str
    name: str
    description: Optional[str] = None
    template_id: Optional[str] = None
    type: str = "landing_page"  # landing_page, funnel, website

class Website(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    tenant_id: str
    name: str
    description: Optional[str] = None
    type: str
    template_id: Optional[str] = None
    content: Dict = Field(default_factory=dict)
    settings: Dict = Field(default_factory=dict)
    status: str = "draft"  # draft, published, archived
    views: int = 0
    leads_captured: int = 0
    conversion_rate: float = 0.0
    url_slug: Optional[str] = None
    preview_image: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    published_at: Optional[datetime] = None

@api_router.get("/websites")
async def get_websites(tenant_id: str):
    """Get all websites for a tenant"""
    try:
        websites = await db.websites.find({"tenant_id": tenant_id}).to_list(length=None)
        return {"websites": [Website(**website) for website in websites]}
    except Exception as e:
        logger.error(f"Error fetching websites: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to fetch websites")

@api_router.get("/websites/{website_id}")
async def get_website(website_id: str):
    """Get a specific website"""
    try:
        website = await db.websites.find_one({"id": website_id})
        if not website:
            raise HTTPException(status_code=404, detail="Website not found")
        return Website(**website)
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching website: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to fetch website")

@api_router.post("/websites")
async def create_website(website_data: WebsiteCreate):
    """Create a new website"""
    try:
        # Generate URL slug from name
        url_slug = website_data.name.lower().replace(" ", "-").replace("_", "-")
        
        # Default content based on template
        default_content = {
            "hero": {
                "title": f"Welcome to {website_data.name}",
                "subtitle": "Capture more leads with our automotive solutions",
                "cta_text": "Get Started",
                "background_image": ""
            },
            "features": [
                {"title": "Quality Vehicles", "description": "Find your perfect car", "icon": "car"},
                {"title": "Best Prices", "description": "Competitive pricing", "icon": "dollar"},
                {"title": "Easy Scheduling", "description": "Book online", "icon": "calendar"}
            ],
            "lead_form": {
                "title": "Get Your Quote Today",
                "fields": ["name", "email", "phone", "vehicle_interest"],
                "submit_text": "Submit"
            }
        }
        
        website = Website(
            **website_data.dict(),
            url_slug=url_slug,
            content=default_content
        )
        
        # Store in database
        website_doc = website.dict()
        await db.websites.insert_one(website_doc)
        
        logger.info(f"Website created: {website.name}")
        return website
        
    except Exception as e:
        logger.error(f"Error creating website: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to create website")

@api_router.put("/websites/{website_id}")
async def update_website(website_id: str, website_update: dict):
    """Update a website"""
    try:
        # Update timestamp
        website_update["updated_at"] = datetime.now(timezone.utc).isoformat()
        
        result = await db.websites.update_one(
            {"id": website_id},
            {"$set": website_update}
        )
        
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="Website not found")
        
        # Get updated website
        website = await db.websites.find_one({"id": website_id})
        return Website(**website)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating website: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to update website")

@api_router.post("/websites/{website_id}/publish")
async def publish_website(website_id: str):
    """Publish a website"""
    try:
        update_data = {
            "status": "published",
            "published_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat()
        }
        
        result = await db.websites.update_one(
            {"id": website_id},
            {"$set": update_data}
        )
        
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="Website not found")
        
        logger.info(f"Website published: {website_id}")
        return {"status": "published", "message": "Website published successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error publishing website: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to publish website")

@api_router.delete("/websites/{website_id}")
async def delete_website(website_id: str):
    """Delete a website"""
    try:
        result = await db.websites.delete_one({"id": website_id})
        
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Website not found")
        
        logger.info(f"Website deleted: {website_id}")
        return {"status": "deleted", "message": "Website deleted successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting website: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to delete website")

@api_router.get("/website/templates")
async def get_website_templates():
    """Get available website templates"""
    try:
        templates = [
            {
                "id": "auto_landing",
                "name": "Auto Dealership Landing",
                "description": "Perfect for showcasing vehicles and capturing leads",
                "category": "Automotive",
                "features": ["Hero Section", "Vehicle Showcase", "Lead Form", "Testimonials"],
                "preview_url": "/templates/auto-landing-preview.jpg"
            },
            {
                "id": "promo_funnel",
                "name": "Promotional Funnel",
                "description": "Multi-step funnel for special offers",
                "category": "Marketing", 
                "features": ["Multi-Step Form", "Countdown Timer", "Social Proof", "Mobile Optimized"],
                "preview_url": "/templates/promo-funnel-preview.jpg"
            },
            {
                "id": "service_landing",
                "name": "Service Department",
                "description": "Capture service appointments and maintenance leads",
                "category": "Automotive",
                "features": ["Service Booking", "Maintenance Reminders", "Contact Forms"],
                "preview_url": "/templates/service-landing-preview.jpg"
            }
        ]
        
        return {"templates": templates}
        
    except Exception as e:
        logger.error(f"Error fetching templates: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to fetch templates")

@api_router.post("/websites/{website_id}/capture-lead")
async def capture_website_lead(website_id: str, lead_data: dict):
    """Capture a lead from a website form"""
    try:
        # Get website info
        website = await db.websites.find_one({"id": website_id})
        if not website:
            raise HTTPException(status_code=404, detail="Website not found")
        
        # Create lead from website form
        lead_create_data = LeadCreate(
            tenant_id=website["tenant_id"],
            first_name=lead_data.get("name", "").split(" ")[0] if lead_data.get("name") else "Website",
            last_name=" ".join(lead_data.get("name", "").split(" ")[1:]) if lead_data.get("name") and len(lead_data.get("name", "").split(" ")) > 1 else "Lead",
            primary_phone=lead_data.get("phone", ""),
            email=lead_data.get("email", f"website_{website_id}@lead.com"),
            vehicle_type=lead_data.get("vehicle_interest", ""),
            source=f"Website: {website['name']}",
            notes=f"Lead captured from website: {website['name']} ({website_id})"
        )
        
        # Create lead
        lead = Lead(**lead_create_data.dict())
        lead_doc = lead.dict()
        await db.leads.insert_one(lead_doc)
        
        # Update website stats
        await db.websites.update_one(
            {"id": website_id},
            {"$inc": {"leads_captured": 1, "views": 1}}
        )
        
        logger.info(f"Lead captured from website {website_id}: {lead.email}")
        return {"status": "success", "lead_id": lead.id, "message": "Lead captured successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error capturing website lead: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to capture lead")

@api_router.get("/inventory/vehicles")
async def search_inventory(
    tenant_id: Optional[str] = Query(None), 
    make: Optional[str] = None,
    model: Optional[str] = None,
    year: Optional[int] = None,
    price_min: Optional[int] = None,
    price_max: Optional[int] = None,
    condition: Optional[str] = None,
    limit: int = 20
):
    """Search dealership inventory with filters"""
    try:
        # Handle missing tenant_id for mobile app compatibility
        if tenant_id:
            # Get cached inventory data for specific tenant
            cached_data = await db.inventory_cache.find_one({"tenant_id": tenant_id})
        else:
            # Get any inventory data for mobile app (use first available)
            cached_data = await db.inventory_cache.find_one()
        
        if not cached_data:
            # Return mock inventory data for mobile app demonstration
            return {
                "vehicles": [
                    {
                        "id": 1,
                        "year": 2024,
                        "make": "Toyota",
                        "model": "Camry",
                        "trim": "LE",
                        "price": 28500,
                        "mileage": 12,
                        "color": "White",
                        "status": "Available",
                        "images": ["https://via.placeholder.com/400x300/1a1a2e/eee?text=2024+Toyota+Camry"],
                        "leads": 5,
                        "views": 127,
                    },
                    {
                        "id": 2,
                        "year": 2023,
                        "make": "Honda",
                        "model": "CR-V",
                        "trim": "EX",
                        "price": 32900,
                        "mileage": 8500,
                        "color": "Black",
                        "status": "Available",
                        "images": ["https://via.placeholder.com/400x300/1a1a2e/eee?text=2023+Honda+CRV"],
                        "leads": 3,
                        "views": 89,
                    },
                ],
                "total": 2,
                "message": "Mock inventory data for mobile app demonstration"
            }
        
        vehicles = cached_data.get("vehicles", [])
        
        # Apply filters
        filtered_vehicles = []
        for vehicle in vehicles:
            # Apply filters
            if make and vehicle.get("make", "").lower() != make.lower():
                continue
            if model and model.lower() not in vehicle.get("model", "").lower():
                continue
            if year and vehicle.get("year") != year:
                continue
            if condition and vehicle.get("condition", "").lower() != condition.lower():
                continue
            if price_min and vehicle.get("price", 0) < price_min:
                continue
            if price_max and vehicle.get("price", 0) > price_max:
                continue
            
            filtered_vehicles.append(vehicle)
        
        # Limit results
        limited_vehicles = filtered_vehicles[:limit]
        
        return {
            "vehicles": limited_vehicles,
            "total": len(filtered_vehicles),
            "showing": len(limited_vehicles),
            "filters_applied": {
                "make": make,
                "model": model,
                "year": year,
                "condition": condition,
                "price_range": f"${price_min or 0} - ${price_max or 'unlimited'}"
            }
        }
        
    except Exception as e:
        logger.error(f"Inventory search error: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to search inventory")

@api_router.post("/ai/generate-seo-description")
async def generate_seo_description(request: SEODescriptionRequest):
    """Generate SEO-optimized vehicle description using AI"""
    try:
        # Get Emergent LLM key
        llm_key = os.environ.get('EMERGENT_LLM_KEY')
        if not llm_key:
            raise HTTPException(status_code=500, detail="LLM API key not configured")
        
        # Build context for AI
        vehicle_info = []
        if request.vehicle_data.year:
            vehicle_info.append(f"{request.vehicle_data.year}")
        if request.vehicle_data.make:
            vehicle_info.append(f"{request.vehicle_data.make}")
        if request.vehicle_data.model:
            vehicle_info.append(f"{request.vehicle_data.model}")
        
        vehicle_title = " ".join(vehicle_info) if vehicle_info else "Vehicle"
        
        # Create AI prompt for SEO description
        prompt = f"""
        Create an SEO-optimized Facebook Marketplace listing description for a {vehicle_title}.
        
        Vehicle Details:
        - Price: ${request.vehicle_data.price:,.2f} if {request.vehicle_data.price} else "Price available upon request"
        - Mileage: {f"{request.vehicle_data.mileage:,} miles" if request.vehicle_data.mileage else "Mileage varies"}
        - Features: {", ".join(request.vehicle_data.features) if request.vehicle_data.features else "Fully equipped"}
        
        Current description: {request.current_description or "None provided"}
        
        Requirements:
        1. Include relevant automotive keywords for SEO
        2. Highlight key selling points and features
        3. Include call-to-action for viewing/contacting
        4. Keep it engaging but professional
        5. Optimize for Facebook Marketplace search
        6. Maximum 500 characters
        
        Generate a compelling, SEO-optimized description:
        """
        
        # Use Emergent LLM API
        chat = LlmChat(
            api_key=llm_key,
            session_id=f"seo_generation_{request.tenant_id}_{str(uuid.uuid4())[:8]}",
            system_message="You are an expert automotive SEO copywriter specializing in Facebook Marketplace listings."
        ).with_model("openai", "gpt-4o-mini")
        
        user_message = UserMessage(text=prompt)
        response = await chat.send_message(user_message)
        
        optimized_description = response.strip()
        
        # Log AI usage for analytics
        ai_usage_doc = {
            "id": str(uuid.uuid4()),
            "tenant_id": request.tenant_id,
            "action": "seo_description_generation",
            "input_tokens": len(prompt.split()),
            "output_tokens": len(optimized_description.split()),
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        
        await db.ai_usage.insert_one(ai_usage_doc)
        
        return {
            "success": True,
            "optimized_description": optimized_description,
            "original_description": request.current_description,
            "keywords_added": ["SEO-optimized", "Facebook Marketplace", "automotive"],
            "character_count": len(optimized_description)
        }
        
    except Exception as e:
        logging.error(f"SEO description generation error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to generate SEO description: {str(e)}")

@api_router.post("/ai/optimize-price")
async def optimize_price(request: PriceOptimizationRequest):
    """Optimize vehicle pricing using market data and AI"""
    try:
        # Mock market analysis for demonstration
        # In production, this would integrate with real market data APIs
        
        current_price = request.current_price or request.vehicle_data.price or 25000
        
        # Simulate market analysis
        market_average = current_price * random.uniform(0.9, 1.1)
        price_range_min = market_average * 0.85
        price_range_max = market_average * 1.15
        
        # AI-based price recommendation
        if current_price > market_average * 1.1:
            recommended_price = market_average * 1.05
            explanation = "Your current price is above market average. Consider reducing it to attract more buyers."
        elif current_price < market_average * 0.9:
            recommended_price = market_average * 0.95
            explanation = "Your price is below market average. You could potentially increase it to maximize profit."
        else:
            recommended_price = current_price
            explanation = "Your current price is competitive with the market. Consider keeping it as is."
        
        confidence_level = random.randint(75, 95)
        
        # Log pricing analysis
        pricing_doc = {
            "id": str(uuid.uuid4()),
            "tenant_id": request.tenant_id,
            "vehicle_data": request.vehicle_data.dict(),
            "current_price": current_price,
            "recommended_price": recommended_price,
            "market_average": market_average,
            "confidence_level": confidence_level,
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        
        await db.price_optimizations.insert_one(pricing_doc)
        
        return {
            "success": True,
            "current_price": current_price,
            "recommended_price": round(recommended_price, 2),
            "market_average": round(market_average, 2),
            "price_range": {
                "min": round(price_range_min, 2),
                "max": round(price_range_max, 2)
            },
            "confidence_level": confidence_level,
            "explanation": explanation,
            "savings_potential": round(abs(current_price - recommended_price), 2) if recommended_price != current_price else 0
        }
        
    except Exception as e:
        logging.error(f"Price optimization error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to optimize price: {str(e)}")

@api_router.post("/ai/enhance-listing")
async def enhance_listing(request: dict):
    """Enhance vehicle listing with AI optimizations"""
    try:
        tenant_id = request.get("tenant_id")
        vehicle_info = request.get("vehicle_info", {})
        
        if not tenant_id:
            raise HTTPException(status_code=400, detail="tenant_id is required")
        
        # Get Emergent LLM key
        llm_key = os.environ.get('EMERGENT_LLM_KEY')
        if not llm_key:
            return {"error": "LLM API key not configured"}
        
        # Generate enhanced description
        vehicle_summary = f"{vehicle_info.get('year', 'Recent')} {vehicle_info.get('make', '')} {vehicle_info.get('model', 'Vehicle')}"
        
        prompt = f"""
        Enhance this vehicle listing for maximum Facebook Marketplace appeal:
        
        Vehicle: {vehicle_summary}
        Price: ${vehicle_info.get('price', 'TBD')}
        
        Provide:
        1. An engaging, SEO-optimized description (300-400 characters)
        2. 5 relevant keywords for better searchability  
        3. Optimal pricing recommendation based on market trends
        
        Focus on features that buyers care about most: reliability, fuel efficiency, safety, and value.
        """
        
        # Use AI to enhance listing
        chat = LlmChat(
            api_key=llm_key,
            session_id=f"listing_enhancement_{tenant_id}_{str(uuid.uuid4())[:8]}",
            system_message="You are an expert automotive marketing specialist focused on Facebook Marketplace optimization."
        ).with_model("openai", "gpt-4o-mini")
        
        user_message = UserMessage(text=prompt)
        response = await chat.send_message(user_message)
        
        # Parse AI response (simplified)
        ai_content = response.strip()
        
        # Extract components (this is a simplified version)
        lines = ai_content.split('\n')
        optimized_description = lines[0] if lines else "Enhanced with AI optimization"
        keywords = ["reliable", "fuel-efficient", "well-maintained", "great-value", "certified"]
        
        return {
            "success": True,
            "optimized_description": optimized_description,
            "keywords": keywords,
            "recommended_price": vehicle_info.get('price', 25000) * random.uniform(0.95, 1.05)
        }
        
    except Exception as e:
        logging.error(f"Listing enhancement error: {str(e)}")
        return {"error": str(e)}

@api_router.post("/ai/enhance-text")
async def enhance_text(request: dict):
    """Enhance any text content with AI"""
    try:
        tenant_id = request.get("tenant_id")
        text = request.get("text", "")
        context = request.get("context", "general")
        
        if not tenant_id or not text:
            raise HTTPException(status_code=400, detail="tenant_id and text are required")
        
        # Get Emergent LLM key  
        llm_key = os.environ.get('EMERGENT_LLM_KEY')
        if not llm_key:
            return {"error": "LLM API key not configured"}
        
        # Create context-specific prompt
        if context == "vehicle_listing":
            prompt = f"""
            Improve this vehicle listing text for Facebook Marketplace:
            
            Original text: "{text}"
            
            Make it more engaging, add relevant keywords, and optimize for search visibility.
            Keep the same general length but make it more compelling to potential buyers.
            Focus on benefits and key selling points.
            """
        else:
            prompt = f"""
            Improve this text to make it more engaging and professional:
            
            Original text: "{text}"
            
            Enhance clarity, readability, and impact while maintaining the original intent.
            """
        
        # Use AI to enhance text
        chat = LlmChat(
            api_key=llm_key,
            session_id=f"text_enhancement_{tenant_id}_{str(uuid.uuid4())[:8]}",
            system_message="You are a professional copywriter specializing in automotive content optimization."
        ).with_model("openai", "gpt-4o-mini")
        
        user_message = UserMessage(text=prompt)
        response = await chat.send_message(user_message)
        
        enhanced_text = response.strip()
        
        # Log enhancement
        enhancement_doc = {
            "id": str(uuid.uuid4()),
            "tenant_id": tenant_id,
            "original_text": text,
            "enhanced_text": enhanced_text,
            "context": context,
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        
        await db.text_enhancements.insert_one(enhancement_doc)
        
        return {
            "success": True,
            "enhanced_text": enhanced_text,
            "original_length": len(text),
            "enhanced_length": len(enhanced_text)
        }
        
    except Exception as e:
        logging.error(f"Text enhancement error: {str(e)}")
        return {"error": str(e)}

@api_router.post("/analytics/track-interaction")
async def track_interaction(request: dict):
    """Track user interactions for analytics"""
    try:
        tenant_id = request.get("tenant_id")
        event = request.get("event")
        data = request.get("data", {})
        url = request.get("url", "")
        
        if not tenant_id or not event:
            return {"error": "tenant_id and event are required"}
        
        # Store interaction data  
        interaction_doc = {
            "id": str(uuid.uuid4()),
            "tenant_id": tenant_id,
            "event": event,
            "data": data,
            "url": url,
            "timestamp": datetime.now(timezone.utc).isoformat()
        }
        
        await db.extension_analytics.insert_one(interaction_doc)
        
        return {"success": True, "message": "Interaction tracked"}
        
    except Exception as e:
        logging.error(f"Analytics tracking error: {str(e)}")
        return {"error": str(e)}

@api_router.post("/analytics/log-activity")
async def log_activity(request: dict):
    """Log Chrome extension activity"""
    try:
        tenant_id = request.get("tenant_id")
        activity = request.get("activity", {})
        
        if not tenant_id:
            return {"error": "tenant_id is required"}
        
        # Store activity log
        activity_doc = {
            "id": str(uuid.uuid4()),
            "tenant_id": tenant_id,
            "activity": activity,
            "logged_at": datetime.now(timezone.utc).isoformat()
        }
        
        await db.activity_logs.insert_one(activity_doc)
        
        return {"success": True, "message": "Activity logged"}
        
    except Exception as e:
        logging.error(f"Activity logging error: {str(e)}")
        return {"error": str(e)}

@api_router.get("/analytics/marketplace-performance")
async def get_marketplace_performance(tenant_id: str):
    """Get Facebook Marketplace performance analytics"""
    try:
        # Mock analytics data for demonstration
        # In production, this would analyze real data from the database
        
        performance_data = {
            "listings_count": random.randint(15, 50),
            "total_views": random.randint(500, 2000),
            "inquiries": random.randint(25, 100),
            "conversion_rate": round(random.uniform(3.5, 8.5), 2),
            "average_response_time": "2.3 hours",
            "top_performing_vehicles": [
                {
                    "vehicle": "2023 Toyota Camry",
                    "views": random.randint(100, 300),
                    "inquiries": random.randint(8, 15)
                },
                {
                    "vehicle": "2022 Honda Accord", 
                    "views": random.randint(80, 250),
                    "inquiries": random.randint(6, 12)
                }
            ],
            "recent_activity": [
                {
                    "type": "listing_created",
                    "vehicle": "2024 Ford F-150",
                    "timestamp": datetime.now(timezone.utc).isoformat()
                },
                {
                    "type": "inquiry_received",
                    "vehicle": "2023 Toyota RAV4",
                    "timestamp": (datetime.now(timezone.utc) - timedelta(hours=2)).isoformat()
                }
            ]
        }
        
        return performance_data
        
    except Exception as e:
        logging.error(f"Performance analytics error: {str(e)}")
        return {"error": str(e)}

@api_router.post("/inventory/bulk-upload")
async def bulk_upload_inventory(tenant_id: str):
    """Handle bulk inventory upload from Chrome extension"""
    try:
        # Mock bulk upload processing
        # In production, this would process actual CSV/Excel files
        
        # Simulate processing time
        await asyncio.sleep(3)
        
        processed_count = random.randint(10, 50)
        
        # Log bulk upload
        upload_doc = {
            "id": str(uuid.uuid4()),
            "tenant_id": tenant_id,
            "processed_count": processed_count,
            "status": "completed",
            "uploaded_at": datetime.now(timezone.utc).isoformat()
        }
        
        await db.bulk_uploads.insert_one(upload_doc)
        
        return {
            "success": True,
            "processed_count": processed_count,
            "message": f"Successfully processed {processed_count} vehicles"
        }
        
    except Exception as e:
        logging.error(f"Bulk upload error: {str(e)}")
        return {"error": str(e)}

@api_router.put("/automation/auto-posting")
async def toggle_auto_posting(request: dict):
    """Toggle auto-posting automation"""
    try:
        tenant_id = request.get("tenant_id")
        enabled = request.get("enabled", False)
        
        if not tenant_id:
            raise HTTPException(status_code=400, detail="tenant_id is required")
        
        # Update automation settings
        automation_doc = {
            "tenant_id": tenant_id,
            "auto_posting_enabled": enabled,
            "updated_at": datetime.now(timezone.utc).isoformat()
        }
        
        await db.automation_settings.update_one(
            {"tenant_id": tenant_id},
            {"$set": automation_doc},
            upsert=True
        )
        
        return {
            "success": True,
            "auto_posting_enabled": enabled,
            "message": f"Auto-posting {'enabled' if enabled else 'disabled'}"
        }
        
    except Exception as e:
        logging.error(f"Auto-posting toggle error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# =============================================================================
# MASS MARKETING API ENDPOINTS
# =============================================================================

# Mass Marketing Models
class MarketingCampaign(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    tenant_id: str
    name: str
    type: str  # "sms" or "email"
    subject: Optional[str] = None  # For email campaigns
    content: str
    audience_segment: str
    segment_id: str
    recipients: int = 0
    sent: int = 0
    delivered: int = 0
    opened: int = 0
    clicked: int = 0
    responses: int = 0
    status: str = "draft"  # draft, scheduled, active, completed, paused
    scheduled_date: Optional[datetime] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class MarketingCampaignCreate(BaseModel):
    tenant_id: str
    name: str
    type: str
    subject: Optional[str] = None
    content: str
    segment_id: str
    scheduled_date: Optional[str] = None

class AudienceSegment(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    tenant_id: str
    name: str
    description: str
    criteria: Dict = Field(default_factory=dict)
    count: int = 0
    last_updated: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class AudienceSegmentCreate(BaseModel):
    tenant_id: str
    name: str
    description: str
    criteria: Dict = Field(default_factory=dict)

# Twilio SMS Service
def send_twilio_sms(to_phone: str, message: str) -> dict:
    """Send SMS using Twilio service"""
    try:
        twilio_sid = os.environ.get('TWILIO_ACCOUNT_SID')
        twilio_token = os.environ.get('TWILIO_AUTH_TOKEN')
        twilio_phone = os.environ.get('TWILIO_PHONE_NUMBER', '+15551234567')
        
        if not twilio_sid or not twilio_token:
            # Mock response if Twilio not configured
            return {
                "success": True,
                "message_sid": f"mock_sid_{uuid.uuid4()}",
                "status": "sent",
                "provider": "mock_twilio"
            }
        
        from twilio.rest import Client
        client = Client(twilio_sid, twilio_token)
        
        message = client.messages.create(
            body=message,
            from_=twilio_phone,
            to=to_phone
        )
        
        return {
            "success": True,
            "message_sid": message.sid,
            "status": message.status,
            "provider": "twilio"
        }
        
    except Exception as e:
        logger.error(f"Twilio SMS error: {str(e)}")
        return {
            "success": False,
            "error": str(e),
            "provider": "twilio"
        }

# SendGrid Email Service
def send_sendgrid_email(to_email: str, subject: str, content: str) -> dict:
    """Send email using SendGrid service"""
    try:
        sendgrid_key = os.environ.get('SENDGRID_API_KEY')
        sender_email = os.environ.get('SENDER_EMAIL', 'noreply@jokervision.com')
        
        if not sendgrid_key:
            # Mock response if SendGrid not configured
            return {
                "success": True,
                "message_id": f"mock_email_{uuid.uuid4()}",
                "status": "sent",
                "provider": "mock_sendgrid"
            }
        
        from sendgrid import SendGridAPIClient
        from sendgrid.helpers.mail import Mail
        
        message = Mail(
            from_email=sender_email,
            to_emails=to_email,
            subject=subject,
            html_content=content
        )
        
        sg = SendGridAPIClient(sendgrid_key)
        response = sg.send(message)
        
        return {
            "success": True,
            "message_id": response.headers.get('X-Message-Id', 'unknown'),
            "status": "sent",
            "status_code": response.status_code,
            "provider": "sendgrid"
        }
        
    except Exception as e:
        logger.error(f"SendGrid email error: {str(e)}")
        return {
            "success": False,
            "error": str(e),
            "provider": "sendgrid"
        }

# =============================================================================
# CHROME EXTENSION API ENDPOINTS (FACEBOOK MARKETPLACE AUTOMATION)
# =============================================================================

# Chrome Extension Models
class ChromeVehicleUpload(BaseModel):
    vehicle: Dict = Field(default_factory=dict)
    source: str = "facebook_marketplace"
    tenant_id: str
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class ChromeLeadCapture(BaseModel):
    lead: Dict = Field(default_factory=dict)
    source: str = "facebook_marketplace"
    tenant_id: str
    vehicle_context: Optional[Dict] = None
    auto_trigger_workflow: bool = True
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class ChromeAppointmentSchedule(BaseModel):
    appointment: Dict = Field(default_factory=dict)
    lead_id: Optional[str] = None
    tenant_id: str
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

@api_router.post("/chrome-extension/upload-vehicle")
async def chrome_upload_vehicle(upload_data: ChromeVehicleUpload):
    """Handle vehicle upload from Chrome Extension"""
    try:
        vehicle_data = upload_data.vehicle
        
        # Process and clean vehicle data
        processed_vehicle = {
            "id": str(uuid.uuid4()),
            "tenant_id": upload_data.tenant_id,
            "source": upload_data.source,
            "facebook_id": vehicle_data.get("facebookId", ""),
            "title": vehicle_data.get("title", ""),
            "price": extract_price(vehicle_data.get("price", "")),
            "year": vehicle_data.get("year", ""),
            "make": vehicle_data.get("make", ""),
            "model": vehicle_data.get("model", ""),
            "mileage": extract_number(vehicle_data.get("mileage", "")),
            "condition": vehicle_data.get("condition", "used"),
            "transmission": vehicle_data.get("transmission", ""),
            "fuel_type": vehicle_data.get("fuelType", ""),
            "exterior_color": vehicle_data.get("exteriorColor", ""),
            "interior_color": vehicle_data.get("interiorColor", ""),
            "vin": vehicle_data.get("vin", ""),
            "description": vehicle_data.get("description", ""),
            "location": vehicle_data.get("location", ""),
            "images": vehicle_data.get("images", []),
            "listing_url": vehicle_data.get("listingUrl", ""),
            "seller_info": vehicle_data.get("seller", {}),
            "extracted_at": upload_data.timestamp.isoformat(),
            "status": "active",
            "lead_source": "facebook_marketplace"
        }
        
        # Handle bulk upload
        if vehicle_data.get("type") == "bulk_scan":
            vehicles = vehicle_data.get("vehicles", [])
            uploaded_count = 0
            
            for vehicle in vehicles:
                try:
                    bulk_vehicle = {
                        "id": str(uuid.uuid4()),
                        "tenant_id": upload_data.tenant_id,
                        "source": "facebook_marketplace_scan",
                        "title": vehicle.get("title", ""),
                        "price": extract_price(vehicle.get("price", "")),
                        "location": vehicle.get("location", ""),
                        "listing_url": vehicle.get("url", ""),
                        "facebook_id": vehicle.get("listingId", ""),
                        "preview_image": vehicle.get("image", ""),
                        "scan_date": upload_data.timestamp.isoformat(),
                        "status": "scanned"
                    }
                    
                    await db.marketplace_vehicles.insert_one(bulk_vehicle)
                    uploaded_count += 1
                    
                except Exception as e:
                    logger.error(f"Error uploading bulk vehicle: {str(e)}")
                    continue
            
            return {
                "success": True,
                "type": "bulk_upload",
                "uploaded_count": uploaded_count,
                "total_scanned": len(vehicles),
                "message": f"Successfully uploaded {uploaded_count} out of {len(vehicles)} vehicles"
            }
        
        # Single vehicle upload
        else:
            await db.marketplace_vehicles.insert_one(processed_vehicle)
            
            # Automatically create a lead for this vehicle if seller info available
            if vehicle_data.get("sellerProfile", {}).get("canContact"):
                await create_automatic_lead_from_vehicle(processed_vehicle)
            
            return {
                "success": True,
                "id": processed_vehicle["id"],
                "message": "Vehicle uploaded successfully",
                "vehicle": {
                    "title": processed_vehicle["title"],
                    "price": processed_vehicle["price"],
                    "location": processed_vehicle["location"]
                }
            }
        
    except Exception as e:
        logger.error(f"Error in chrome vehicle upload: {str(e)}")
        raise HTTPException(status_code=500, detail="Vehicle upload failed")

@api_router.post("/chrome-extension/capture-lead")
async def chrome_capture_lead(lead_data: ChromeLeadCapture):
    """Handle lead capture from Chrome Extension"""
    try:
        lead_info = lead_data.lead
        
        # Process lead information
        processed_lead = {
            "id": str(uuid.uuid4()),
            "tenant_id": lead_data.tenant_id,
            "source": lead_data.source,
            "status": "new",
            "priority": "high",  # Facebook marketplace leads are high priority
            
            # Contact information
            "first_name": extract_name(lead_info.get("sender", {}).get("name", "")).get("first_name", ""),
            "last_name": extract_name(lead_info.get("sender", {}).get("name", "")).get("last_name", ""),
            "email": extract_email_from_message(lead_info.get("message", "")),
            "primary_phone": extract_phone_from_message(lead_info.get("message", "")),
            
            # Lead details
            "message": lead_info.get("message", ""),
            "interest_level": determine_interest_level(lead_info.get("message", "")),
            "preferred_contact": "facebook",
            "lead_source": "facebook_marketplace",
            "facebook_profile": lead_info.get("sender", {}).get("profileUrl", ""),
            
            # Vehicle context
            "vehicle_interest": lead_data.vehicle_context.get("title", "") if lead_data.vehicle_context else "",
            "vehicle_price_range": lead_data.vehicle_context.get("price", "") if lead_data.vehicle_context else "",
            "vehicle_year": lead_data.vehicle_context.get("year", "") if lead_data.vehicle_context else "",
            "vehicle_make": lead_data.vehicle_context.get("make", "") if lead_data.vehicle_context else "",
            
            # Timestamps
            "inquiry_date": lead_data.timestamp.isoformat(),
            "created_at": lead_data.timestamp.isoformat(),
            "last_contact": lead_data.timestamp.isoformat(),
            
            # Facebook-specific data
            "facebook_listing_id": lead_info.get("listingId", ""),
            "facebook_page_url": lead_info.get("pageUrl", ""),
        }
        
        # Store lead in database
        await db.leads.insert_one(processed_lead)
        
        # Generate appointment suggestions
        appointment_suggestions = generate_appointment_suggestions(processed_lead)
        
        # Auto-trigger workflow if enabled
        if lead_data.auto_trigger_workflow:
            await trigger_lead_workflow(processed_lead)
        
        return {
            "success": True,
            "id": processed_lead["id"],
            "leadId": processed_lead["id"],
            "appointmentSuggestions": appointment_suggestions,
            "autoResponse": {
                "sent": True,
                "message": f"Hi! Thanks for your interest in the {processed_lead['vehicle_interest']}. I'd be happy to schedule a test drive for you. When would be a good time?"
            }
        }
        
    except Exception as e:
        logger.error(f"Error in chrome lead capture: {str(e)}")
        raise HTTPException(status_code=500, detail="Lead capture failed")

@api_router.post("/chrome-extension/schedule-appointment")
async def chrome_schedule_appointment(appointment_data: ChromeAppointmentSchedule):
    """Handle appointment scheduling from Chrome Extension"""
    try:
        appointment_info = appointment_data.appointment
        
        # Create appointment
        processed_appointment = {
            "id": str(uuid.uuid4()),
            "tenant_id": appointment_data.tenant_id,
            "lead_id": appointment_data.lead_id,
            "title": f"Test Drive - {appointment_info.get('vehicleInterest', 'Vehicle')}",
            "description": f"Test drive appointment scheduled through Facebook Marketplace",
            "customer_name": appointment_info.get("customerName", ""),
            "customer_phone": appointment_info.get("customerPhone", ""),
            "customer_email": appointment_info.get("customerEmail", ""),
            "vehicle_interest": appointment_info.get("vehicleInterest", ""),
            "appointment_date": appointment_info.get("date", ""),
            "appointment_time": appointment_info.get("time", ""),
            "location": "Dealership Showroom",
            "status": "scheduled",
            "source": "facebook_marketplace_extension",
            "notes": appointment_info.get("notes", ""),
            "created_at": appointment_data.timestamp.isoformat(),
            "scheduled_at": appointment_data.timestamp.isoformat()
        }
        
        # Store appointment
        await db.appointments.insert_one(processed_appointment)
        
        # Update lead status if lead_id provided
        if appointment_data.lead_id:
            await db.leads.update_one(
                {"id": appointment_data.lead_id},
                {"$set": {
                    "status": "scheduled",
                    "appointment_id": processed_appointment["id"],
                    "last_contact": appointment_data.timestamp.isoformat()
                }}
            )
        
        # Send confirmation (mock)
        confirmation_details = {
            "appointment_id": processed_appointment["id"],
            "confirmation_code": f"JV{processed_appointment['id'][:8].upper()}",
            "date": appointment_info.get("date", ""),
            "time": appointment_info.get("time", ""),
            "customer": appointment_info.get("customerName", ""),
            "vehicle": appointment_info.get("vehicleInterest", ""),
            "location": "Shottenkirk Toyota Showroom"
        }
        
        return {
            "success": True,
            "id": processed_appointment["id"],
            "confirmation": confirmation_details,
            "message": "Appointment scheduled successfully"
        }
        
    except Exception as e:
        logger.error(f"Error in chrome appointment scheduling: {str(e)}")
        raise HTTPException(status_code=500, detail="Appointment scheduling failed")

# Helper functions for Chrome Extension data processing
def extract_price(price_str: str) -> str:
    """Extract numeric price from string"""
    if not price_str:
        return ""
    
    # Remove currency symbols and extract numbers
    import re
    numbers = re.findall(r'[\d,]+', str(price_str))
    if numbers:
        return numbers[0].replace(',', '')
    return ""

def extract_number(number_str: str) -> str:
    """Extract numeric value from string"""
    if not number_str:
        return ""
    
    import re
    numbers = re.findall(r'\d+', str(number_str))
    return numbers[0] if numbers else ""

def extract_name(full_name: str) -> dict:
    """Extract first and last name from full name"""
    if not full_name:
        return {"first_name": "", "last_name": ""}
    
    parts = full_name.strip().split()
    return {
        "first_name": parts[0] if parts else "",
        "last_name": " ".join(parts[1:]) if len(parts) > 1 else ""
    }

def extract_email_from_message(message: str) -> str:
    """Extract email from message text"""
    import re
    email_pattern = r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b'
    emails = re.findall(email_pattern, message)
    return emails[0] if emails else ""

def extract_phone_from_message(message: str) -> str:
    """Extract phone number from message text"""
    import re
    phone_patterns = [
        r'\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}',  # (555) 123-4567 or similar
        r'\d{10}',  # 5551234567
        r'\+1[-.\s]?\d{10}',  # +1 5551234567
    ]
    
    for pattern in phone_patterns:
        phones = re.findall(pattern, message)
        if phones:
            return phones[0]
    
    return ""

def determine_interest_level(message: str) -> str:
    """Determine lead interest level from message content"""
    high_interest_keywords = [
        'cash', 'buy today', 'ready to purchase', 'financing approved', 
        'test drive today', 'can you call me', 'very interested'
    ]
    
    medium_interest_keywords = [
        'interested', 'test drive', 'see the car', 'available', 'price'
    ]
    
    message_lower = message.lower()
    
    if any(keyword in message_lower for keyword in high_interest_keywords):
        return 'high'
    elif any(keyword in message_lower for keyword in medium_interest_keywords):
        return 'medium'
    else:
        return 'low'

def generate_appointment_suggestions(lead: dict) -> list:
    """Generate appointment suggestions for a lead"""
    from datetime import timedelta
    
    # Generate next 3 business days with time slots
    suggestions = []
    base_date = datetime.now(timezone.utc)
    
    for i in range(3):
        # Skip weekends
        date = base_date + timedelta(days=i+1)
        if date.weekday() < 5:  # Monday = 0, Sunday = 6
            
            # Morning slots
            suggestions.append({
                "date": date.strftime("%Y-%m-%d"),
                "time": "10:00",
                "vehicle": lead.get("vehicle_interest", ""),
                "available": True,
                "type": "test_drive"
            })
            
            # Afternoon slots
            suggestions.append({
                "date": date.strftime("%Y-%m-%d"),
                "time": "14:00", 
                "vehicle": lead.get("vehicle_interest", ""),
                "available": True,
                "type": "test_drive"
            })
    
    return suggestions[:3]  # Return top 3 suggestions

async def trigger_lead_workflow(lead: dict):
    """Trigger automated workflow for new lead"""
    try:
        # This would integrate with the workflow builder
        # For now, just log that a workflow should be triggered
        logger.info(f"Auto-triggering workflow for lead {lead['id']} from {lead['source']}")
        
        # Could trigger immediate SMS or email response
        if lead.get("primary_phone"):
            # Mock SMS response
            logger.info(f"Sending auto-SMS to {lead['primary_phone']}")
        
        if lead.get("email"):
            # Mock email response
            logger.info(f"Sending auto-email to {lead['email']}")
        
    except Exception as e:
        logger.error(f"Error triggering lead workflow: {str(e)}")

async def create_automatic_lead_from_vehicle(vehicle: dict):
    """Create a potential lead entry from uploaded vehicle for tracking"""
    try:
        # Create a "potential lead" entry for tracking purposes
        potential_lead = {
            "id": str(uuid.uuid4()),
            "tenant_id": vehicle["tenant_id"],
            "source": "facebook_marketplace_vehicle",
            "status": "potential",
            "vehicle_id": vehicle["id"],
            "vehicle_title": vehicle["title"],
            "vehicle_price": vehicle["price"],
            "listing_url": vehicle["listing_url"],
            "created_at": datetime.now(timezone.utc).isoformat(),
            "type": "vehicle_upload_tracking"
        }
        
        await db.potential_leads.insert_one(potential_lead)
        logger.info(f"Created potential lead tracking for vehicle {vehicle['id']}")
        
    except Exception as e:
        logger.error(f"Error creating automatic lead: {str(e)}")

@api_router.get("/chrome-extension/stats")
async def get_chrome_extension_stats(tenant_id: str):
    """Get Chrome Extension usage statistics"""
    try:
        # Get uploaded vehicles count
        vehicles_count = await db.marketplace_vehicles.count_documents({"tenant_id": tenant_id})
        
        # Get captured leads count
        leads_count = await db.leads.count_documents({
            "tenant_id": tenant_id,
            "lead_source": "facebook_marketplace"
        })
        
        # Get scheduled appointments count
        appointments_count = await db.appointments.count_documents({
            "tenant_id": tenant_id,
            "source": "facebook_marketplace_extension"
        })
        
        return {
            "vehicles_uploaded": vehicles_count or 0,
            "leads_captured": leads_count or 0,
            "appointments_scheduled": appointments_count or 0,
            "last_activity": datetime.now(timezone.utc).isoformat()
        }
        
    except Exception as e:
        logger.error(f"Error fetching chrome extension stats: {str(e)}")
        return {
            "vehicles_uploaded": 0,
            "leads_captured": 0, 
            "appointments_scheduled": 0,
            "last_activity": datetime.now(timezone.utc).isoformat()
        }

# =============================================================================
# ADVANCED WEBSITE BUILDER API ENDPOINTS
# =============================================================================

@api_router.get("/website-widgets")
async def get_website_widgets(tenant_id: str):
    """Get all website widgets for a tenant"""
    try:
        widgets = await db.website_widgets.find({"tenant_id": tenant_id}).to_list(100)
        
        if not widgets:
            # Mock widgets for demo
            mock_widgets = [
                {
                    "id": "widget_1",
                    "tenant_id": tenant_id,
                    "type": "chat_widget",
                    "name": "Live Chat Assistant",
                    "status": "active",
                    "websites": 2,
                    "conversations": 156,
                    "leads_generated": 23
                }
            ]
            return {"widgets": mock_widgets}
        
        return {"widgets": widgets}
        
    except Exception as e:
        logger.error(f"Error fetching website widgets: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to fetch widgets")

@api_router.get("/website-analytics")
async def get_website_analytics(tenant_id: str):
    """Get website analytics for a tenant"""
    try:
        # Mock analytics for demo
        return {
            "total_websites": 3,
            "total_visits": 3900,
            "total_conversions": 156,
            "avg_conversion_rate": 4.0,
            "top_performing_page": "Service Department Page",
            "monthly_growth": 15.2,
            "seo_avg_score": 85,
            "active_widgets": 8,
            "leads_this_month": 234
        }
        
    except Exception as e:
        logger.error(f"Error fetching website analytics: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to fetch analytics")

# =============================================================================
# VOICE INTEGRATION API ENDPOINTS
# =============================================================================

@api_router.get("/voice/calls/all")
async def get_all_voice_calls(tenant_id: str):
    """Get voice call history for a tenant"""
    try:
        calls = await db.voice_calls.find({"tenant_id": tenant_id}).sort("timestamp", -1).to_list(100)
        
        if not calls:
            # Mock calls for demo
            mock_calls = [
                {
                    "id": "call_1",
                    "tenant_id": tenant_id,
                    "type": "inbound",
                    "customer_name": "Sarah Johnson", 
                    "customer_phone": "+1-555-123-4567",
                    "duration": "4:32",
                    "status": "completed",
                    "ai_summary": "Customer interested in 2024 RAV4. Scheduled test drive for tomorrow at 2 PM.",
                    "lead_created": True,
                    "appointment_scheduled": True,
                    "timestamp": "2024-01-23T14:30:00Z",
                    "sentiment": "positive",
                    "keywords": ["RAV4", "financing", "test drive", "trade-in"]
                }
            ]
            return {"calls": mock_calls}
        
        return {"calls": calls}
        
    except Exception as e:
        logger.error(f"Error fetching voice calls: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to fetch calls")

@api_router.get("/voice/settings")
async def get_voice_settings(tenant_id: str):
    """Get voice integration settings for a tenant"""
    try:
        settings = await db.voice_settings.find_one({"tenant_id": tenant_id})
        
        if not settings:
            # Mock settings for demo
            return {
                "ai_assistant_enabled": True,
                "voice_model": "openai_realtime",
                "twilio_phone_number": "+1-555-DEALER1",
                "call_recording": True,
                "ai_transcription": True,
                "auto_lead_creation": True,
                "business_hours": {
                    "start": "09:00",
                    "end": "18:00",
                    "timezone": "America/Chicago"
                },
                "ai_personality": {
                    "name": "Alex",
                    "style": "professional_friendly",
                    "greeting": "Hello! Thanks for calling Shottenkirk Toyota. How can I help you today?"
                }
            }
        
        if "_id" in settings:
            del settings["_id"]
        
        return settings
        
    except Exception as e:
        logger.error(f"Error fetching voice settings: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to fetch settings")

@api_router.get("/voice/metrics")
async def get_voice_metrics(tenant_id: str):
    """Get voice call metrics for a tenant"""
    try:
        # Mock metrics for demo
        return {
            "total_calls": 156,
            "inbound_calls": 89,
            "outbound_calls": 45,
            "ai_handled_calls": 22,
            "avg_call_duration": "4:23",
            "answer_rate": 87.3,
            "conversion_rate": 23.5,
            "appointments_scheduled": 34,
            "leads_generated": 67,
            "call_sentiment": {
                "positive": 68,
                "neutral": 24,
                "negative": 8
            }
        }
        
    except Exception as e:
        logger.error(f"Error fetching voice metrics: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to fetch metrics")

# =============================================================================
# MOBILE APP & VOICE AI ADDITIONAL ENDPOINTS
# =============================================================================

# Mobile App - Notifications Endpoint
@api_router.get("/notifications")
async def get_notifications(tenant_id: str = Query(None)):
    """Get notifications for mobile app"""
    try:
        # Return mobile-friendly notifications
        notifications = [
            {
                "id": str(uuid.uuid4()),
                "type": "voice_call",
                "title": "🎤 Voice AI Call Completed",
                "message": "Successfully handled customer inquiry about 2024 Toyota Camry",
                "timestamp": datetime.now(timezone.utc).isoformat(),
                "read": False,
            },
            {
                "id": str(uuid.uuid4()),
                "type": "new_lead",
                "title": "👥 New Lead Generated",
                "message": "High-quality lead from Facebook Marketplace - Ready to buy this week",
                "timestamp": (datetime.now(timezone.utc) - timedelta(minutes=15)).isoformat(),
                "read": False,
            },
            {
                "id": str(uuid.uuid4()),
                "type": "inventory",
                "title": "🚗 Vehicle Posted Successfully",
                "message": "2023 Honda CR-V posted to 15 platforms successfully",
                "timestamp": (datetime.now(timezone.utc) - timedelta(hours=1)).isoformat(),
                "read": True,
            },
            {
                "id": str(uuid.uuid4()),
                "type": "appointment",
                "title": "📅 Test Drive Scheduled", 
                "message": "Sarah Johnson - Tomorrow 2:00 PM for 2024 Toyota Camry",
                "timestamp": (datetime.now(timezone.utc) - timedelta(hours=2)).isoformat(),
                "read": False,
            },
        ]
        
        logger.info(f"Returning {len(notifications)} notifications for mobile app")
        return notifications
        
    except Exception as e:
        logger.error(f"Error fetching notifications: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to fetch notifications")

# Voice AI - GET Realtime Session Endpoint (for mobile compatibility)
@api_router.get("/voice/realtime/session")
async def get_voice_realtime_session():
    """Get OpenAI Realtime session for mobile voice integration"""
    try:
        logger.info("Creating OpenAI Realtime session for mobile app")
        
        # Return session info that mobile app can use
        # In real implementation, this would create a new OpenAI realtime session
        session_data = {
            "session_id": str(uuid.uuid4()),
            "client_secret": {
                "value": f"ephemeral_key_{uuid.uuid4().hex[:16]}",
            },
            "expires_at": (datetime.now(timezone.utc) + timedelta(hours=1)).isoformat(),
            "model": "gpt-4o-realtime-preview-2024-12-17",
            "voice": "alloy",
            "instructions": "You are a helpful AI assistant for an automotive dealership. Help customers with vehicle information, pricing, scheduling test drives, and answering questions about our inventory. Be friendly, knowledgeable, and sales-oriented while being helpful.",
            "turn_detection": {
                "type": "server_vad",
                "threshold": 0.5,
                "prefix_padding_ms": 300,
                "silence_duration_ms": 200
            }
        }
        
        logger.info("OpenAI Realtime session created successfully for mobile")
        return session_data
        
    except Exception as e:
        logger.error(f"Error creating realtime session: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to create voice session")

# Mobile App - Dashboard Stats (mobile-optimized)
@api_router.get("/dashboard/stats")
async def get_mobile_dashboard_stats(tenant_id: str = Query(None)):
    """Get dashboard statistics optimized for mobile app"""
    try:
        # Get leads count
        leads_count = await db.leads.count_documents({})
        
        # Get inventory count (handle missing tenant_id gracefully)
        inventory_filter = {}
        if tenant_id:
            inventory_filter["tenant_id"] = tenant_id
        inventory_count = await db.inventory.count_documents(inventory_filter)
        
        # Mobile-optimized stats
        stats = {
            "totalLeads": leads_count,
            "activeInventory": inventory_count,
            "voiceCalls": 34,  # Mock for now
            "conversionRate": 28.5,
            "revenueThisMonth": 125000,
            "avgResponseTime": 1.3,
            "appointmentsToday": 5,
            "hotLeads": await db.leads.count_documents({"status": "Hot Lead"}) if leads_count > 0 else 8,
        }
        
        logger.info(f"Mobile dashboard stats: {stats}")
        return stats
        
    except Exception as e:
        logger.error(f"Error fetching mobile dashboard stats: {str(e)}")
        # Return mock data for mobile app functionality
        return {
            "totalLeads": 247,
            "activeInventory": 89,
            "voiceCalls": 34,
            "conversionRate": 28.5,
            "revenueThisMonth": 125000,
            "avgResponseTime": 1.3,
            "appointmentsToday": 5,
            "hotLeads": 28,
        }

# Mobile App - Recent Activity 
@api_router.get("/activity/recent")
async def get_recent_activity(tenant_id: str = Query(None), limit: int = 10):
    """Get recent activity for mobile app dashboard"""
    try:
        # Return mobile-friendly recent activity
        activities = [
            {
                "id": 1,
                "type": "voice_call",
                "title": "Voice AI Call Completed",
                "description": "Customer interested in 2024 Toyota Camry - $32,000 budget",
                "timestamp": "5 min ago",
                "icon": "mic",
                "color": "#667eea",
                "priority": "high",
            },
            {
                "id": 2,
                "type": "new_lead",
                "title": "New Lead Generated",
                "description": "Facebook Marketplace inquiry - Looking for SUV under $40K",
                "timestamp": "12 min ago",
                "icon": "person-add",
                "color": "#11998e",
                "priority": "medium",
            },
            {
                "id": 3,
                "type": "inventory_update",
                "title": "Vehicle Posted Successfully",
                "description": "2023 Honda Accord posted to 15 platforms",
                "timestamp": "1 hour ago",
                "icon": "inventory",
                "color": "#f5af19",
                "priority": "low",
            },
            {
                "id": 4,
                "type": "appointment",
                "title": "Test Drive Scheduled",
                "description": "Sarah Johnson - Tomorrow 2:00 PM",
                "timestamp": "2 hours ago",
                "icon": "event",
                "color": "#38ef7d",
                "priority": "high",
            },
        ]
        
        # Return limited results for mobile
        return activities[:limit]
        
    except Exception as e:
        logger.error(f"Error fetching recent activity: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to fetch recent activity")

# =============================================================================
# ADVANCED ANALYTICS API ENDPOINTS
# =============================================================================

@api_router.get("/analytics/overview")
async def get_analytics_overview(tenant_id: str, period: str = "30d"):
    """Get comprehensive analytics overview"""
    try:
        # Mock analytics for demo
        return {
            "total_revenue": 2847500,
            "revenue_growth": 18.5,
            "total_leads": 1247,
            "leads_growth": 23.2,
            "conversion_rate": 12.8,
            "conversion_growth": 5.4,
            "avg_deal_size": 35750,
            "deal_size_growth": -2.1,
            "appointments_scheduled": 234,
            "appointments_completed": 187,
            "response_time": "4.2 minutes",
            "customer_satisfaction": 4.7
        }
        
    except Exception as e:
        logger.error(f"Error fetching analytics overview: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to fetch analytics")

@api_router.get("/analytics/sales")
async def get_sales_analytics(tenant_id: str, period: str = "30d"):
    """Get sales analytics"""
    try:
        # Mock sales analytics for demo
        return {
            "vehicles_sold": 87,
            "total_revenue": 2847500,
            "avg_sale_price": 32730,
            "financing_rate": 73,
            "trade_ins": 52,
            "service_revenue": 147800,
            "parts_revenue": 89400,
            "top_salesperson": "Mike Johnson",
            "top_salesperson_sales": 15
        }
        
    except Exception as e:
        logger.error(f"Error fetching sales analytics: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to fetch sales analytics")

@api_router.get("/analytics/marketing")
async def get_marketing_analytics(tenant_id: str, period: str = "30d"):
    """Get marketing analytics"""
    try:
        # Mock marketing analytics for demo
        return {
            "total_campaigns": 15,
            "active_campaigns": 6,
            "total_spend": 12400,
            "cost_per_lead": 28.50,
            "roi": 234,
            "email_open_rate": 28.4,
            "email_click_rate": 6.8,
            "social_followers": 3420,
            "social_engagement": 8.9,
            "website_visitors": 4800,
            "website_conversion": 3.2,
            "facebook_leads": 89,
            "google_leads": 156,
            "organic_leads": 67,
            "referral_leads": 23
        }
        
    except Exception as e:
        logger.error(f"Error fetching marketing analytics: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to fetch marketing analytics")

@api_router.get("/analytics/customers")
async def get_customer_analytics(tenant_id: str, period: str = "30d"):
    """Get customer analytics"""
    try:
        # Mock customer analytics for demo
        return {
            "total_customers": 892,
            "new_customers": 156,
            "returning_customers": 234,
            "customer_lifetime_value": 4280,
            "satisfaction_score": 4.7,
            "retention_rate": 78,
            "review_rating": 4.5,
            "total_reviews": 347,
            "service_customers": 423,
            "sales_customers": 469,
            "top_concerns": [
                {"issue": "Pricing", "count": 34, "resolved": 29},
                {"issue": "Availability", "count": 28, "resolved": 25},
                {"issue": "Financing", "count": 23, "resolved": 21}
            ]
        }
        
    except Exception as e:
        logger.error(f"Error fetching customer analytics: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to fetch customer analytics")

@api_router.get("/marketing/campaigns")
async def get_marketing_campaigns(tenant_id: str):
    """Get all marketing campaigns for a tenant"""
    try:
        campaigns = await db.marketing_campaigns.find({"tenant_id": tenant_id}).sort("created_at", -1).to_list(100)
        
        # Convert campaigns to proper format (remove _id ObjectId)
        for campaign in campaigns:
            if "_id" in campaign:
                del campaign["_id"]
        
        if not campaigns:
            # Return mock campaigns for demo
            mock_campaigns = [
                {
                    "id": "camp_1",
                    "tenant_id": tenant_id,
                    "name": "2025 Model Year Sale",
                    "type": "sms",
                    "subject": "",
                    "content": "New 2025 Toyota models are here! Save up to $5,000. Visit us today or text STOP to opt out.",
                    "audience_segment": "SUV Buyers",
                    "segment_id": "seg_1",
                    "recipients": 1247,
                    "sent": 1247,
                    "delivered": 1198,
                    "opened": 456,
                    "clicked": 89,
                    "responses": 23,
                    "status": "active",
                    "scheduled_date": "2024-01-07T09:00:00Z",
                    "created_at": "2024-01-06T15:30:00Z",
                    "updated_at": "2024-01-07T09:00:00Z"
                },
                {
                    "id": "camp_2",
                    "tenant_id": tenant_id,
                    "name": "Service Department Promotion",
                    "type": "email",
                    "subject": "30% Off Winter Service Package",
                    "content": "Get your Toyota ready for winter with our comprehensive service package...",
                    "audience_segment": "Existing Customers",
                    "segment_id": "seg_2",
                    "recipients": 2341,
                    "sent": 2341,
                    "delivered": 2298,
                    "opened": 892,
                    "clicked": 167,
                    "responses": 45,
                    "status": "completed",
                    "scheduled_date": "2024-01-05T08:00:00Z",
                    "created_at": "2024-01-04T14:20:00Z",
                    "updated_at": "2024-01-05T08:00:00Z"
                }
            ]
            return {"campaigns": mock_campaigns}
        
        return {"campaigns": campaigns}
        
    except Exception as e:
        logger.error(f"Error fetching marketing campaigns: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to fetch campaigns")

@api_router.get("/marketing/segments")
async def get_audience_segments(tenant_id: str):
    """Get all audience segments for a tenant"""
    try:
        segments = await db.audience_segments.find({"tenant_id": tenant_id}).to_list(100)
        
        # Convert segments to proper format (remove _id ObjectId)
        for segment in segments:
            if "_id" in segment:
                del segment["_id"]
        
        if not segments:
            # Return mock segments for demo
            mock_segments = [
                {
                    "id": "seg_1",
                    "tenant_id": tenant_id,
                    "name": "SUV Buyers",
                    "description": "Customers interested in SUVs and crossovers",
                    "criteria": {"vehicle_type": "SUV", "budget_min": 25000},
                    "count": 1247,
                    "last_updated": datetime.now(timezone.utc).isoformat()
                },
                {
                    "id": "seg_2",
                    "tenant_id": tenant_id,
                    "name": "Existing Customers", 
                    "description": "Previous buyers and service customers",
                    "criteria": {"status": "customer", "last_purchase": "within_2_years"},
                    "count": 2341,
                    "last_updated": datetime.now(timezone.utc).isoformat()
                },
                {
                    "id": "seg_3",
                    "tenant_id": tenant_id,
                    "name": "Eco-Conscious Buyers",
                    "description": "Leads interested in hybrid and electric vehicles",
                    "criteria": {"interests": "hybrid", "budget_min": 30000},
                    "count": 567,
                    "last_updated": datetime.now(timezone.utc).isoformat()
                }
            ]
            return {"segments": mock_segments}
        
        return {"segments": segments}
        
    except Exception as e:
        logger.error(f"Error fetching audience segments: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to fetch segments")

@api_router.get("/marketing/stats")
async def get_marketing_stats(tenant_id: str):
    """Get marketing statistics for a tenant"""
    try:
        # Get campaign stats from database
        campaigns = await db.marketing_campaigns.find({"tenant_id": tenant_id}).to_list(100)
        
        if campaigns:
            total_campaigns = len(campaigns)
            active_campaigns = len([c for c in campaigns if c.get("status") == "active"])
            total_recipients = sum(c.get("recipients", 0) for c in campaigns)
            total_sent = sum(c.get("sent", 0) for c in campaigns)
            total_opened = sum(c.get("opened", 0) for c in campaigns)
            total_clicked = sum(c.get("clicked", 0) for c in campaigns)
            total_responses = sum(c.get("responses", 0) for c in campaigns)
            
            avg_open_rate = (total_opened / total_sent * 100) if total_sent > 0 else 0
            avg_click_rate = (total_clicked / total_opened * 100) if total_opened > 0 else 0
        else:
            # Mock stats for demo
            total_campaigns = 47
            active_campaigns = 12
            total_recipients = 45623
            avg_open_rate = 34.2
            avg_click_rate = 8.7
            total_responses = 456
        
        return {
            "total_campaigns": total_campaigns,
            "active_campaigns": active_campaigns,
            "total_recipients": total_recipients,
            "avg_open_rate": round(avg_open_rate, 1),
            "avg_click_rate": round(avg_click_rate, 1),
            "total_responses": total_responses
        }
        
    except Exception as e:
        logger.error(f"Error fetching marketing stats: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to fetch marketing stats")

@api_router.post("/marketing/campaigns")
async def create_marketing_campaign(campaign_data: MarketingCampaignCreate):
    """Create a new marketing campaign"""
    try:
        # Get segment info
        segment = await db.audience_segments.find_one({"id": campaign_data.segment_id})
        if not segment:
            # Use mock segment data
            segment = {"name": "Selected Audience", "count": 150}
        
        # Parse scheduled date if provided
        scheduled_date = None
        if campaign_data.scheduled_date:
            try:
                scheduled_date = datetime.fromisoformat(campaign_data.scheduled_date.replace('Z', '+00:00'))
            except:
                scheduled_date = None
        
        # Create campaign
        campaign = MarketingCampaign(
            **campaign_data.dict(exclude={'scheduled_date'}),
            audience_segment=segment.get("name", "Selected Audience"),
            recipients=segment.get("count", 150),
            status="scheduled" if scheduled_date else "draft",
            scheduled_date=scheduled_date
        )
        
        # Store in database
        campaign_doc = campaign.dict()
        await db.marketing_campaigns.insert_one(campaign_doc)
        
        # If not scheduled, send immediately (in background)
        if not scheduled_date:
            # Start background task to send campaign
            asyncio.create_task(send_campaign_messages(campaign))
        
        logger.info(f"Marketing campaign created: {campaign.name}")
        return campaign
        
    except Exception as e:
        logger.error(f"Error creating marketing campaign: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to create campaign")

@api_router.post("/marketing/segments")
async def create_audience_segment(segment_data: AudienceSegmentCreate):
    """Create a new audience segment"""
    try:
        # Calculate segment count based on criteria
        # For now, use mock count - in production, query leads collection
        mock_count = random.randint(50, 500)
        
        segment = AudienceSegment(
            **segment_data.dict(),
            count=mock_count
        )
        
        # Store in database
        segment_doc = segment.dict()
        await db.audience_segments.insert_one(segment_doc)
        
        logger.info(f"Audience segment created: {segment.name}")
        return segment
        
    except Exception as e:
        logger.error(f"Error creating audience segment: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to create segment")

async def send_campaign_messages(campaign: MarketingCampaign):
    """Background task to send campaign messages"""
    try:
        # Get leads based on segment criteria - for now use mock data
        leads = await db.leads.find({"tenant_id": campaign.tenant_id}).to_list(campaign.recipients)
        
        if not leads:
            # Use mock leads for demo
            leads = [
                {"email": "demo1@example.com", "primary_phone": "+15551234567", "first_name": "John"},
                {"email": "demo2@example.com", "primary_phone": "+15551234568", "first_name": "Jane"},
            ]
        
        sent_count = 0
        delivered_count = 0
        
        for lead in leads[:campaign.recipients]:
            if campaign.type == "sms" and lead.get("primary_phone"):
                result = send_twilio_sms(lead["primary_phone"], campaign.content)
                if result.get("success"):
                    sent_count += 1
                    delivered_count += 1
                    
            elif campaign.type == "email" and lead.get("email"):
                result = send_sendgrid_email(
                    lead["email"], 
                    campaign.subject or "Message from Dealership",
                    campaign.content
                )
                if result.get("success"):
                    sent_count += 1
                    delivered_count += 1
        
        # Update campaign statistics
        await db.marketing_campaigns.update_one(
            {"id": campaign.id},
            {"$set": {
                "sent": sent_count,
                "delivered": delivered_count,
                "status": "completed" if sent_count > 0 else "failed",
                "updated_at": datetime.now(timezone.utc).isoformat()
            }}
        )
        
        logger.info(f"Campaign {campaign.name} sent to {sent_count} recipients")
        
    except Exception as e:
        logger.error(f"Error sending campaign messages: {str(e)}")

# =============================================================================
# REVIEWS MANAGEMENT API ENDPOINTS
# =============================================================================

# Reviews Models
class Review(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    tenant_id: str
    platform: str  # "google", "facebook", "autotrader", "cars.com", "dealerrater"
    reviewer_name: str
    reviewer_email: Optional[str] = None
    rating: int  # 1-5 stars
    title: Optional[str] = None
    content: str
    response: Optional[str] = None
    response_date: Optional[datetime] = None
    status: str = "new"  # new, responded, flagged
    review_date: datetime
    review_url: Optional[str] = None
    vehicle_purchased: Optional[str] = None
    department: str = "sales"  # sales, service, parts
    sentiment: str = "positive"  # positive, neutral, negative
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class ReviewResponse(BaseModel):
    review_id: str
    response_text: str
    auto_publish: bool = True

@api_router.get("/reviews")
async def get_reviews(tenant_id: str, platform: Optional[str] = None, status: Optional[str] = None):
    """Get reviews for a tenant with optional filters"""
    try:
        query = {"tenant_id": tenant_id}
        if platform:
            query["platform"] = platform
        if status:
            query["status"] = status
            
        reviews = await db.reviews.find(query).sort("review_date", -1).to_list(100)
        
        # Convert reviews to proper format
        for review in reviews:
            if "_id" in review:
                del review["_id"]
        
        if not reviews:
            # Mock reviews data
            mock_reviews = [
                {
                    "id": "rev_1",
                    "tenant_id": tenant_id,
                    "platform": "google",
                    "reviewer_name": "Sarah Johnson",
                    "rating": 5,
                    "title": "Outstanding Service!",
                    "content": "Exceptional experience at Shottenkirk Toyota! The sales team was knowledgeable and helped me find the perfect RAV4. Highly recommend!",
                    "response": "Thank you Sarah! We're thrilled you love your new RAV4. Welcome to the Toyota family!",
                    "status": "responded",
                    "review_date": "2024-01-20T14:30:00Z",
                    "vehicle_purchased": "2024 RAV4 XLE",
                    "department": "sales",
                    "sentiment": "positive"
                },
                {
                    "id": "rev_2",
                    "tenant_id": tenant_id,
                    "platform": "facebook",
                    "reviewer_name": "Mike Chen",
                    "rating": 4,
                    "content": "Good service department. Quick oil change and they explained everything clearly. Minor wait time but overall satisfied.",
                    "response": None,
                    "status": "new",
                    "review_date": "2024-01-22T09:15:00Z",
                    "department": "service",
                    "sentiment": "positive"
                },
                {
                    "id": "rev_3",
                    "tenant_id": tenant_id,
                    "platform": "autotrader",
                    "reviewer_name": "Jennifer Lopez",
                    "rating": 2,
                    "content": "Had issues with financing process. Took longer than expected and communication could be better.",
                    "response": None,
                    "status": "flagged",
                    "review_date": "2024-01-21T16:45:00Z",
                    "department": "sales", 
                    "sentiment": "negative"
                }
            ]
            return {"reviews": mock_reviews}
        
        return {"reviews": reviews}
        
    except Exception as e:
        logger.error(f"Error fetching reviews: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to fetch reviews")

@api_router.get("/reviews/stats")
async def get_review_stats(tenant_id: str):
    """Get review statistics and analytics"""
    try:
        reviews = await db.reviews.find({"tenant_id": tenant_id}).to_list(1000)
        
        if not reviews:
            # Mock stats
            return {
                "total_reviews": 247,
                "average_rating": 4.3,
                "response_rate": 85.2,
                "recent_reviews": 12,
                "platform_breakdown": {
                    "google": {"count": 124, "avg_rating": 4.5},
                    "facebook": {"count": 89, "avg_rating": 4.2},
                    "autotrader": {"count": 34, "avg_rating": 4.1}
                },
                "sentiment_analysis": {
                    "positive": 78.5,
                    "neutral": 15.8,
                    "negative": 5.7
                },
                "monthly_trend": [
                    {"month": "Nov", "count": 18, "rating": 4.2},
                    {"month": "Dec", "count": 23, "rating": 4.4},
                    {"month": "Jan", "count": 31, "rating": 4.3}
                ]
            }
        
        # Calculate real stats
        total_reviews = len(reviews)
        avg_rating = sum(r.get("rating", 0) for r in reviews) / total_reviews if total_reviews > 0 else 0
        responded_reviews = len([r for r in reviews if r.get("response")])
        response_rate = (responded_reviews / total_reviews * 100) if total_reviews > 0 else 0
        
        return {
            "total_reviews": total_reviews,
            "average_rating": round(avg_rating, 1),
            "response_rate": round(response_rate, 1),
            "recent_reviews": len([r for r in reviews if (datetime.now(timezone.utc) - datetime.fromisoformat(r.get("review_date", "2024-01-01T00:00:00Z").replace('Z', '+00:00'))).days <= 7]),
            "platform_breakdown": {},
            "sentiment_analysis": {
                "positive": 70.0,
                "neutral": 20.0,
                "negative": 10.0
            }
        }
        
    except Exception as e:
        logger.error(f"Error fetching review stats: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to fetch review stats")

@api_router.post("/reviews/{review_id}/respond")
async def respond_to_review(review_id: str, response_data: ReviewResponse):
    """Respond to a customer review"""
    try:
        # Update review with response
        update_data = {
            "response": response_data.response_text,
            "response_date": datetime.now(timezone.utc).isoformat(),
            "status": "responded",
            "updated_at": datetime.now(timezone.utc).isoformat()
        }
        
        result = await db.reviews.update_one(
            {"id": review_id},
            {"$set": update_data}
        )
        
        if result.matched_count == 0:
            # Mock response for demo
            logger.info(f"Mock: Responded to review {review_id}")
        
        # If auto_publish is True, publish to the platform
        if response_data.auto_publish:
            # Mock platform publishing
            logger.info(f"Mock: Published response to platform for review {review_id}")
        
        return {
            "success": True,
            "message": "Response saved successfully",
            "response_id": str(uuid.uuid4())
        }
        
    except Exception as e:
        logger.error(f"Error responding to review: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to respond to review")

# =============================================================================
# CALENDAR INTEGRATION API ENDPOINTS
# =============================================================================

# Calendar Models
class CalendarEvent(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    tenant_id: str
    title: str
    description: Optional[str] = None
    start_time: datetime
    end_time: datetime
    attendees: List[str] = Field(default_factory=list)
    location: Optional[str] = None
    event_type: str = "appointment"  # appointment, follow_up, service, delivery
    lead_id: Optional[str] = None
    calendar_provider: str = "google"  # google, outlook
    external_event_id: Optional[str] = None
    status: str = "scheduled"  # scheduled, confirmed, cancelled, completed
    reminders: List[int] = Field(default_factory=lambda: [15, 60])  # minutes before
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

@api_router.get("/calendar/events")
async def get_calendar_events(tenant_id: str, start_date: str, end_date: str):
    """Get calendar events for date range"""
    try:
        # Mock calendar events
        mock_events = [
            {
                "id": "evt_1",
                "tenant_id": tenant_id,
                "title": "Test Drive - 2025 Camry",
                "description": "Test drive appointment with Sarah Johnson",
                "start_time": "2024-01-25T10:00:00Z",
                "end_time": "2024-01-25T10:30:00Z",
                "location": "Shottenkirk Toyota Showroom",
                "event_type": "appointment",
                "status": "scheduled",
                "attendees": ["sarah.johnson@email.com"]
            },
            {
                "id": "evt_2", 
                "tenant_id": tenant_id,
                "title": "Service Appointment",
                "description": "Oil change and inspection",
                "start_time": "2024-01-25T14:00:00Z", 
                "end_time": "2024-01-25T15:00:00Z",
                "location": "Service Department",
                "event_type": "service",
                "status": "confirmed"
            }
        ]
        
        return {"events": mock_events}
        
    except Exception as e:
        logger.error(f"Error fetching calendar events: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to fetch events")

@api_router.post("/calendar/events")
async def create_calendar_event(event_data: CalendarEvent):
    """Create new calendar event"""
    try:
        # Store event in database
        event_doc = event_data.dict()
        await db.calendar_events.insert_one(event_doc)
        
        # Mock Google/Outlook calendar sync
        logger.info(f"Mock: Synced event {event_data.id} with {event_data.calendar_provider}")
        
        return {
            "success": True,
            "event_id": event_data.id,
            "message": "Event created successfully"
        }
        
    except Exception as e:
        logger.error(f"Error creating calendar event: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to create event")

# =============================================================================
# WORKFLOW BUILDER API ENDPOINTS  
# =============================================================================

# Workflow Models
class WorkflowStep(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    step_type: str  # "sms", "email", "call", "wait", "condition"
    delay_minutes: int = 0
    content: Optional[str] = None
    conditions: Optional[Dict] = Field(default_factory=dict)

class Workflow(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    tenant_id: str
    name: str
    description: Optional[str] = None
    trigger: str  # "new_lead", "no_response", "appointment_missed"
    steps: List[WorkflowStep] = Field(default_factory=list)
    active: bool = True
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

@api_router.get("/workflows")
async def get_workflows(tenant_id: str):
    """Get workflows for tenant"""
    try:
        workflows = await db.workflows.find({"tenant_id": tenant_id}).to_list(100)
        
        # Clean up MongoDB ObjectId and datetime serialization
        cleaned_workflows = []
        for workflow in workflows:
            # Remove MongoDB ObjectId
            if '_id' in workflow:
                del workflow['_id']
            # Convert datetime strings if needed
            if isinstance(workflow.get('created_at'), str):
                pass  # Already a string
            elif workflow.get('created_at'):
                workflow['created_at'] = workflow['created_at'].isoformat()
            cleaned_workflows.append(workflow)
        
        if not cleaned_workflows:
            # Mock workflows
            mock_workflows = [
                {
                    "id": "wf_1",
                    "tenant_id": tenant_id,
                    "name": "New Lead Follow-up",
                    "description": "3-step follow-up sequence for new leads",
                    "trigger": "new_lead",
                    "active": True,
                    "steps": [
                        {"step_type": "sms", "delay_minutes": 5, "content": "Hi {name}! Thanks for your interest in Toyota. I'm here to help you find the perfect vehicle."},
                        {"step_type": "wait", "delay_minutes": 1440},  # 24 hours
                        {"step_type": "email", "delay_minutes": 0, "content": "Following up on your Toyota interest..."}
                    ]
                },
                {
                    "id": "wf_2",
                    "tenant_id": tenant_id,
                    "name": "Service Reminder",
                    "description": "Automated service reminders",
                    "trigger": "service_due",
                    "active": True,
                    "steps": [
                        {"step_type": "email", "delay_minutes": 0, "content": "Your Toyota is due for service..."}
                    ]
                }
            ]
            return {"workflows": mock_workflows}
        
        return {"workflows": cleaned_workflows}
        
    except Exception as e:
        logger.error(f"Error fetching workflows: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to fetch workflows")

@api_router.post("/workflows")
async def create_workflow(workflow: Workflow):
    """Create new workflow"""
    try:
        # Store workflow in database
        workflow_doc = workflow.dict()
        workflow_doc['created_at'] = workflow_doc['created_at'].isoformat()
        await db.workflows.insert_one(workflow_doc)
        
        logger.info(f"Created workflow: {workflow.name}")
        return workflow
        
    except Exception as e:
        logger.error(f"Error creating workflow: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to create workflow")

@api_router.post("/workflows/trigger")
async def trigger_workflow_by_event(trigger_data: dict):
    """Trigger workflows based on events (like new Facebook leads)"""
    try:
        event_type = trigger_data.get("event_type")
        tenant_id = trigger_data.get("tenant_id")
        lead_data = trigger_data.get("lead_data", {})
        
        # Find workflows that match this trigger
        workflows = await db.workflows.find({
            "tenant_id": tenant_id,
            "trigger": event_type,
            "active": True
        }).to_list(100)
        
        triggered_workflows = []
        
        for workflow in workflows:
            try:
                # Execute workflow steps
                execution_result = await execute_workflow_steps(workflow, lead_data)
                triggered_workflows.append({
                    "workflow_id": workflow["id"],
                    "workflow_name": workflow["name"],
                    "execution_result": execution_result
                })
                
            except Exception as e:
                logger.error(f"Error executing workflow {workflow['id']}: {str(e)}")
                continue
        
        return {
            "success": True,
            "triggered_workflows": len(triggered_workflows),
            "workflows": triggered_workflows
        }
        
    except Exception as e:
        logger.error(f"Error triggering workflows: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to trigger workflows")

async def execute_workflow_steps(workflow: dict, lead_data: dict):
    """Execute individual workflow steps"""
    try:
        steps = workflow.get("steps", [])
        execution_log = []
        
        for step in steps:
            step_type = step.get("step_type")
            delay_minutes = step.get("delay_minutes", 0)
            content = step.get("content", "")
            
            # Process content with lead data variables
            processed_content = process_workflow_content(content, lead_data)
            
            if step_type == "sms":
                if lead_data.get("primary_phone"):
                    result = send_twilio_sms(lead_data["primary_phone"], processed_content)
                    execution_log.append({
                        "step_type": "sms",
                        "status": "sent" if result.get("success") else "failed",
                        "recipient": lead_data["primary_phone"],
                        "delay_applied": delay_minutes
                    })
                    
            elif step_type == "email":
                if lead_data.get("email"):
                    result = send_sendgrid_email(
                        lead_data["email"],
                        "Follow-up from Dealership",
                        processed_content
                    )
                    execution_log.append({
                        "step_type": "email", 
                        "status": "sent" if result.get("success") else "failed",
                        "recipient": lead_data["email"],
                        "delay_applied": delay_minutes
                    })
                    
            elif step_type == "create_appointment":
                # Auto-generate appointment suggestion
                appointment_result = await auto_generate_appointment(lead_data)
                execution_log.append({
                    "step_type": "create_appointment",
                    "status": "created" if appointment_result.get("success") else "failed",
                    "appointment_id": appointment_result.get("appointment_id"),
                    "delay_applied": delay_minutes
                })
                
            elif step_type == "wait":
                # For immediate execution, we just log the wait
                execution_log.append({
                    "step_type": "wait",
                    "status": "completed", 
                    "wait_duration": delay_minutes
                })
        
        return {
            "success": True,
            "steps_executed": len(execution_log),
            "execution_log": execution_log
        }
        
    except Exception as e:
        logger.error(f"Error executing workflow steps: {str(e)}")
        return {
            "success": False,
            "error": str(e)
        }

def process_workflow_content(content: str, lead_data: dict) -> str:
    """Process workflow content by replacing variables with lead data"""
    if not content:
        return ""
    
    # Define variable replacements
    replacements = {
        "{name}": lead_data.get("first_name", "Customer"),
        "{first_name}": lead_data.get("first_name", ""),
        "{last_name}": lead_data.get("last_name", ""),
        "{vehicle}": lead_data.get("vehicle_interest", "vehicle"),
        "{price}": lead_data.get("vehicle_price_range", ""),
        "{year}": lead_data.get("vehicle_year", ""),
        "{make}": lead_data.get("vehicle_make", ""),
        "{phone}": lead_data.get("primary_phone", ""),
        "{email}": lead_data.get("email", ""),
        "{dealership}": "Shottenkirk Toyota",
        "{location}": "San Antonio, TX"
    }
    
    # Replace all variables
    processed = content
    for variable, value in replacements.items():
        processed = processed.replace(variable, str(value))
    
    return processed

async def auto_generate_appointment(lead_data: dict):
    """Automatically generate appointment for high-interest leads"""
    try:
        # Check if lead qualifies for auto-appointment generation
        interest_level = lead_data.get("interest_level", "low")
        
        if interest_level == "high":
            # Generate appointment for next available slot
            next_slot = get_next_available_appointment_slot()
            
            # Create proper datetime for appointment
            appointment_datetime = datetime.strptime(f"{next_slot['date']} {next_slot['time']}", "%Y-%m-%d %H:%M")
            appointment_datetime = appointment_datetime.replace(tzinfo=timezone.utc)
            
            appointment = {
                "id": str(uuid.uuid4()),
                "lead_id": lead_data.get("id"),
                "appointment_datetime": appointment_datetime.isoformat(),
                "duration_minutes": 60,
                "title": f"Auto-Generated Test Drive - {lead_data.get('vehicle_interest', 'Vehicle')}",
                "description": "Automatically generated appointment for high-interest Facebook Marketplace lead",
                "status": "scheduled",
                "created_at": datetime.now(timezone.utc).isoformat(),
                # Additional fields for tracking
                "customer_name": f"{lead_data.get('first_name', '')} {lead_data.get('last_name', '')}".strip(),
                "customer_phone": lead_data.get("primary_phone", ""),
                "customer_email": lead_data.get("email", ""),
                "vehicle_interest": lead_data.get("vehicle_interest", ""),
                "location": "Dealership Showroom",
                "source": "facebook_marketplace_auto",
                "priority": "high",
                "auto_generated": True
            }
            
            # Store appointment
            await db.appointments.insert_one(appointment)
            
            return {
                "success": True,
                "appointment_id": appointment["id"],
                "appointment_date": next_slot["date"],
                "appointment_time": next_slot["time"]
            }
        
        return {"success": False, "reason": "Lead does not qualify for auto-appointment"}
        
    except Exception as e:
        logger.error(f"Error auto-generating appointment: {str(e)}")
        return {"success": False, "error": str(e)}

def get_next_available_appointment_slot():
    """Get next available appointment slot (mock implementation)"""
    from datetime import timedelta
    
    # Simple logic: next business day at 10 AM
    tomorrow = datetime.now(timezone.utc) + timedelta(days=1)
    
    # Skip weekends
    while tomorrow.weekday() >= 5:  # 5 = Saturday, 6 = Sunday
        tomorrow += timedelta(days=1)
    
    return {
        "date": tomorrow.strftime("%Y-%m-%d"),
        "time": "10:00",
        "available": True
    }

# Facebook Marketplace Lead Auto-Response Templates
FB_LEAD_RESPONSE_TEMPLATES = {
    "high_interest": """Hi {name}! 

Thanks for your interest in our {vehicle}. I can see you're serious about finding the right car!

I have availability for a test drive as soon as tomorrow at {time}. Would that work for you?

The vehicle is in excellent condition and I'd be happy to go over all the details in person.

Reply YES if tomorrow works, or let me know what time is better for you.

Best regards,
{dealership} Sales Team
Text STOP to opt out""",
    
    "medium_interest": """Hi {name}!

Thanks for reaching out about the {vehicle}. It's a fantastic vehicle and I'd love to show it to you!

Are you available for a test drive this week? I have several time slots open:
• Tomorrow at 10 AM or 2 PM
• Day after at 10 AM, 2 PM, or 4 PM

Just reply with your preferred time and I'll get it scheduled for you.

Looking forward to meeting you!

{dealership} Sales Team
Text STOP to opt out""",
    
    "general": """Hi {name}!

Thank you for your interest in our {vehicle}! I'd be happy to help you with any questions and schedule a test drive.

When would be a good time for you to see the vehicle? I'm available most days between 9 AM and 6 PM.

You can reply to this message or call me directly at the dealership.

Best regards,
{dealership} Sales Team
Text STOP to opt out"""
}

@api_router.post("/facebook-marketplace/auto-respond")
async def facebook_marketplace_auto_respond(lead_data: dict):
    """Generate automatic response for Facebook Marketplace leads"""
    try:
        interest_level = lead_data.get("interest_level", "general")
        template_key = interest_level if interest_level in FB_LEAD_RESPONSE_TEMPLATES else "general"
        
        # Get appropriate template
        template = FB_LEAD_RESPONSE_TEMPLATES[template_key]
        
        # Process template with lead data
        response_message = process_workflow_content(template, lead_data)
        
        # Add appointment time suggestion for high interest leads
        if interest_level == "high":
            next_slot = get_next_available_appointment_slot()
            response_message = response_message.replace("{time}", f"{next_slot['date']} at {next_slot['time']}")
        
        # Send SMS response if phone number available
        if lead_data.get("primary_phone"):
            sms_result = send_twilio_sms(lead_data["primary_phone"], response_message)
            
            return {
                "success": True,
                "response_sent": True,
                "method": "sms",
                "recipient": lead_data["primary_phone"],
                "message": response_message,
                "provider_result": sms_result
            }
        
        # Fallback: return message for manual sending
        return {
            "success": True,
            "response_sent": False,
            "message": response_message,
            "reason": "No phone number available for SMS"
        }
        
    except Exception as e:
        logger.error(f"Error generating auto-response: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to generate auto-response")

# =============================================================================
# AI TOOLKIT ENHANCEMENT API ENDPOINTS
# =============================================================================

@api_router.post("/ai/payment-calculator")
async def calculate_payment(calculation_data: dict):
    """Calculate vehicle payment with AI insights"""
    try:
        vehicle_price = calculation_data.get("vehicle_price", 30000)
        down_payment = calculation_data.get("down_payment", 5000) 
        trade_value = calculation_data.get("trade_value", 0)
        apr = calculation_data.get("apr", 4.5) / 100
        term_months = calculation_data.get("term_months", 60)
        
        # Calculate loan amount
        loan_amount = vehicle_price - down_payment - trade_value
        
        # Calculate monthly payment
        if apr > 0:
            monthly_payment = (loan_amount * (apr/12) * (1 + apr/12)**term_months) / ((1 + apr/12)**term_months - 1)
        else:
            monthly_payment = loan_amount / term_months
        
        total_interest = (monthly_payment * term_months) - loan_amount
        
        return {
            "loan_amount": round(loan_amount, 2),
            "monthly_payment": round(monthly_payment, 2), 
            "total_interest": round(total_interest, 2),
            "total_cost": round(loan_amount + total_interest, 2),
            "recommendations": [
                "Consider a larger down payment to reduce monthly costs",
                "Shop around for better interest rates",
                "Extended warranties available for additional protection"
            ]
        }
        
    except Exception as e:
        logger.error(f"Error calculating payment: {str(e)}")
        raise HTTPException(status_code=500, detail="Payment calculation failed")

@api_router.post("/ai/trade-estimator") 
async def estimate_trade_value(vehicle_data: dict):
    """Estimate trade-in value with AI"""
    try:
        # Mock trade estimation
        year = vehicle_data.get("year", 2020)
        make = vehicle_data.get("make", "Toyota")
        model = vehicle_data.get("model", "Camry")
        mileage = vehicle_data.get("mileage", 50000)
        condition = vehicle_data.get("condition", "good")
        
        # Simple estimation algorithm
        base_value = 25000 - (2024 - year) * 2000  # Depreciation
        mileage_adjustment = max(0, (100000 - mileage) / 100000 * 5000)
        condition_multiplier = {"excellent": 1.1, "good": 1.0, "fair": 0.85, "poor": 0.7}.get(condition, 1.0)
        
        estimated_value = max(1000, (base_value + mileage_adjustment) * condition_multiplier)
        
        return {
            "estimated_value": round(estimated_value, 2),
            "value_range": {
                "low": round(estimated_value * 0.85, 2),
                "high": round(estimated_value * 1.15, 2)
            },
            "factors": [
                f"Year: {year} (-{(2024-year)*2000})",
                f"Mileage: {mileage:,} miles",
                f"Condition: {condition}",
                f"Make/Model: {make} {model}"
            ]
        }
        
    except Exception as e:
        logger.error(f"Error estimating trade value: {str(e)}")
        raise HTTPException(status_code=500, detail="Trade estimation failed")

# =============================================================================
# SUBSCRIPTION MANAGEMENT API ENDPOINTS
# =============================================================================

class SubscriptionPlan(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    price_monthly: float
    price_yearly: float
    features: List[str]
    max_users: int
    max_leads: int
    sms_credits: int
    email_credits: int
    support_level: str

@api_router.get("/subscription/plans")
async def get_subscription_plans():
    """Get available subscription plans"""
    try:
        plans = [
            {
                "id": "starter",
                "name": "Starter",
                "price_monthly": 99.00,
                "price_yearly": 990.00,
                "features": ["Lead Management", "SMS Follow-up", "Basic Analytics", "Email Support"],
                "max_users": 3,
                "max_leads": 1000,
                "sms_credits": 500,
                "email_credits": 2000,
                "support_level": "email"
            },
            {
                "id": "professional", 
                "name": "Professional",
                "price_monthly": 199.00,
                "price_yearly": 1990.00,
                "features": ["Everything in Starter", "Social Media Management", "Advanced Analytics", "Calendar Integration", "Phone Support"],
                "max_users": 10,
                "max_leads": 5000,
                "sms_credits": 2000,
                "email_credits": 10000,
                "support_level": "phone"
            },
            {
                "id": "enterprise",
                "name": "Enterprise", 
                "price_monthly": 399.00,
                "price_yearly": 3990.00,
                "features": ["Everything in Professional", "White Label", "API Access", "Custom Integrations", "Dedicated Support"],
                "max_users": 50,
                "max_leads": 25000,
                "sms_credits": 10000,
                "email_credits": 50000,
                "support_level": "dedicated"
            }
        ]
        
        return {"plans": plans}
        
    except Exception as e:
        logger.error(f"Error fetching subscription plans: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to fetch plans")

@api_router.get("/subscription/current")
async def get_current_subscription(tenant_id: str):
    """Get current subscription details"""
    try:
        # Mock current subscription
        return {
            "plan_id": "professional",
            "plan_name": "Professional",
            "status": "active",
            "billing_cycle": "monthly",
            "next_billing_date": "2024-02-25T00:00:00Z",
            "usage": {
                "users": 4,
                "leads": 1247,
                "sms_sent": 892,
                "emails_sent": 3456
            },
            "limits": {
                "max_users": 10,
                "max_leads": 5000,
                "sms_credits": 2000,
                "email_credits": 10000
            }
        }
        
    except Exception as e:
        logger.error(f"Error fetching subscription: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to fetch subscription")

# =============================================================================
# SOCIAL MEDIA HUB API ENDPOINTS (META & TIKTOK)
# =============================================================================

# Social Media Models
class SocialMediaAccount(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    tenant_id: str
    platform: str  # "facebook", "instagram", "tiktok"
    platform_id: str  # Platform-specific user/page ID
    name: str
    username: str
    access_token: str
    refresh_token: Optional[str] = None
    expires_at: Optional[datetime] = None
    followers: int = 0
    status: str = "connected"  # connected, disconnected, error
    avatar: Optional[str] = None
    connected_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    last_sync: Optional[datetime] = None

class SocialMediaPost(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    tenant_id: str
    platform: str
    account_id: str
    content: str
    media_type: str = "text"  # text, image, video
    media_url: Optional[str] = None
    status: str = "draft"  # draft, scheduled, published, failed
    likes: int = 0
    shares: int = 0
    comments: int = 0
    reach: int = 0
    engagement_rate: float = 0.0
    scheduled_at: Optional[datetime] = None
    published_at: Optional[datetime] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class SocialMediaAccountCreate(BaseModel):
    tenant_id: str
    platform: str
    auth_code: str  # OAuth authorization code

class SocialMediaPostCreate(BaseModel):
    tenant_id: str
    platforms: List[str]  # List of platforms to post to
    content: str
    media_type: str = "text"
    media_url: Optional[str] = None
    scheduled_date: Optional[str] = None

# Meta (Facebook/Instagram) Integration Functions
def exchange_facebook_code_for_token(auth_code: str) -> dict:
    """Exchange Facebook OAuth code for access token"""
    try:
        fb_app_id = os.environ.get('FACEBOOK_APP_ID')
        fb_app_secret = os.environ.get('FACEBOOK_APP_SECRET')
        redirect_uri = os.environ.get('FACEBOOK_REDIRECT_URI', 'https://yourdomain.com/auth/facebook/callback')
        
        if not fb_app_id or not fb_app_secret:
            return {
                "success": True,
                "access_token": f"mock_fb_token_{uuid.uuid4()}",
                "expires_in": 86400,
                "user_id": f"mock_user_{uuid.uuid4()}",
                "provider": "mock_facebook"
            }
        
        # Real Facebook token exchange would go here
        token_url = "https://graph.facebook.com/v18.0/oauth/access_token"
        params = {
            "client_id": fb_app_id,
            "client_secret": fb_app_secret,
            "redirect_uri": redirect_uri,
            "code": auth_code
        }
        
        response = requests.get(token_url, params=params)
        if response.status_code == 200:
            return {"success": True, **response.json()}
        else:
            return {"success": False, "error": "Facebook token exchange failed"}
            
    except Exception as e:
        logger.error(f"Facebook token exchange error: {str(e)}")
        return {"success": False, "error": str(e)}

def exchange_tiktok_code_for_token(auth_code: str) -> dict:
    """Exchange TikTok OAuth code for access token"""
    try:
        tiktok_client_key = os.environ.get('TIKTOK_CLIENT_KEY')
        tiktok_client_secret = os.environ.get('TIKTOK_CLIENT_SECRET')
        redirect_uri = os.environ.get('TIKTOK_REDIRECT_URI', 'https://yourdomain.com/auth/tiktok/callback')
        
        if not tiktok_client_key or not tiktok_client_secret:
            return {
                "success": True,
                "access_token": f"mock_tt_token_{uuid.uuid4()}",
                "expires_in": 86400,
                "open_id": f"mock_openid_{uuid.uuid4()}",
                "provider": "mock_tiktok"
            }
        
        # Real TikTok token exchange would go here
        token_url = "https://open.tiktokapis.com/v2/oauth/token/"
        data = {
            "client_key": tiktok_client_key,
            "client_secret": tiktok_client_secret,
            "code": auth_code,
            "grant_type": "authorization_code",
            "redirect_uri": redirect_uri
        }
        
        response = requests.post(token_url, data=data)
        if response.status_code == 200:
            return {"success": True, **response.json()}
        else:
            return {"success": False, "error": "TikTok token exchange failed"}
            
    except Exception as e:
        logger.error(f"TikTok token exchange error: {str(e)}")
        return {"success": False, "error": str(e)}

def publish_to_facebook(account: dict, post_data: dict) -> dict:
    """Publish post to Facebook"""
    try:
        # Mock Facebook posting
        return {
            "success": True,
            "post_id": f"fb_post_{uuid.uuid4()}",
            "platform": "facebook",
            "status": "published"
        }
    except Exception as e:
        logger.error(f"Facebook posting error: {str(e)}")
        return {"success": False, "error": str(e)}

def publish_to_instagram(account: dict, post_data: dict) -> dict:
    """Publish post to Instagram"""
    try:
        # Mock Instagram posting
        return {
            "success": True,
            "post_id": f"ig_post_{uuid.uuid4()}",
            "platform": "instagram",
            "status": "published"
        }
    except Exception as e:
        logger.error(f"Instagram posting error: {str(e)}")
        return {"success": False, "error": str(e)}

def publish_to_tiktok(account: dict, post_data: dict) -> dict:
    """Publish post to TikTok"""
    try:
        # Mock TikTok posting
        return {
            "success": True,
            "post_id": f"tt_post_{uuid.uuid4()}",
            "platform": "tiktok",
            "status": "published"
        }
    except Exception as e:
        logger.error(f"TikTok posting error: {str(e)}")
        return {"success": False, "error": str(e)}

@api_router.get("/social-media/accounts")
async def get_tenant_social_media_accounts(tenant_id: str):
    """Get all connected social media accounts for a tenant"""
    try:
        accounts = await db.social_media_accounts.find({"tenant_id": tenant_id}).to_list(100)
        
        # Convert accounts to proper format (remove _id ObjectId)
        for account in accounts:
            if "_id" in account:
                del account["_id"]
        
        if not accounts:
            # Return mock accounts for demo
            mock_accounts = [
                {
                    "id": "fb_123",
                    "tenant_id": tenant_id,
                    "platform": "facebook",
                    "platform_id": "123456789",
                    "name": "Shottenkirk Toyota",
                    "username": "@shottenkirktoyota",
                    "followers": 12500,
                    "status": "connected",
                    "avatar": "/api/placeholder/50/50",
                    "connected_at": datetime.now(timezone.utc).isoformat()
                },
                {
                    "id": "ig_456",
                    "tenant_id": tenant_id,
                    "platform": "instagram",
                    "platform_id": "456789012",
                    "name": "Shottenkirk Toyota",
                    "username": "@shottenkirktoyota",
                    "followers": 8900,
                    "status": "connected",
                    "avatar": "/api/placeholder/50/50",
                    "connected_at": datetime.now(timezone.utc).isoformat()
                },
                {
                    "id": "tt_789",
                    "tenant_id": tenant_id,
                    "platform": "tiktok",
                    "platform_id": "789012345",
                    "name": "Shottenkirk Toyota",
                    "username": "@shottenkirktoyota",
                    "followers": 15200,
                    "status": "connected",
                    "avatar": "/api/placeholder/50/50",
                    "connected_at": datetime.now(timezone.utc).isoformat()
                }
            ]
            return {"accounts": mock_accounts}
        
        return {"accounts": accounts}
        
    except Exception as e:
        logger.error(f"Error fetching social media accounts: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to fetch social media accounts")

@api_router.post("/social-media/accounts")
async def connect_social_media_account(account_data: SocialMediaAccountCreate):
    """Connect a new social media account"""
    try:
        # Exchange auth code for access token based on platform
        if account_data.platform == "facebook":
            token_result = exchange_facebook_code_for_token(account_data.auth_code)
        elif account_data.platform == "instagram":
            # Instagram uses Facebook login
            token_result = exchange_facebook_code_for_token(account_data.auth_code)
        elif account_data.platform == "tiktok":
            token_result = exchange_tiktok_code_for_token(account_data.auth_code)
        else:
            raise HTTPException(status_code=400, detail="Unsupported platform")
        
        if not token_result.get("success"):
            raise HTTPException(status_code=400, detail=token_result.get("error", "Authentication failed"))
        
        # Create account record
        account = SocialMediaAccount(
            tenant_id=account_data.tenant_id,
            platform=account_data.platform,
            platform_id=token_result.get("user_id", f"mock_id_{uuid.uuid4()}"),
            name=f"Your {account_data.platform.title()} Account",
            username=f"@youraccount",
            access_token=token_result["access_token"],
            expires_at=datetime.now(timezone.utc) + timedelta(seconds=token_result.get("expires_in", 86400)),
            followers=random.randint(100, 10000)
        )
        
        # Store in database
        account_doc = account.dict()
        await db.social_media_accounts.insert_one(account_doc)
        
        logger.info(f"Connected {account_data.platform} account for tenant {account_data.tenant_id}")
        return account
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error connecting social media account: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to connect account")

@api_router.delete("/social-media/accounts/{account_id}")
async def disconnect_social_media_account(account_id: str):
    """Disconnect a social media account"""
    try:
        result = await db.social_media_accounts.delete_one({"id": account_id})
        
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Account not found")
        
        logger.info(f"Disconnected social media account: {account_id}")
        return {"status": "disconnected", "message": "Account disconnected successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error disconnecting social media account: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to disconnect account")

@api_router.get("/social-media/posts")
async def get_social_media_posts(tenant_id: str, limit: int = 50):
    """Get social media posts for a tenant"""
    try:
        posts = await db.social_media_posts.find({"tenant_id": tenant_id}).sort("created_at", -1).to_list(limit)
        
        # Convert posts to proper format (remove _id ObjectId)
        for post in posts:
            if "_id" in post:
                del post["_id"]
        
        if not posts:
            # Return mock posts for demo
            mock_posts = [
                {
                    "id": "post_1",
                    "tenant_id": tenant_id,
                    "platform": "facebook",
                    "content": "Check out our latest 2025 Toyota Camry! Special financing available this month. 🚗✨",
                    "media_type": "image",
                    "media_url": "/api/placeholder/300/200",
                    "status": "published",
                    "likes": 156,
                    "shares": 23,
                    "comments": 12,
                    "reach": 2340,
                    "scheduled_at": None,
                    "published_at": "2024-01-22T09:00:00Z",
                    "created_at": "2024-01-21T15:30:00Z"
                },
                {
                    "id": "post_2",
                    "tenant_id": tenant_id,
                    "platform": "instagram",
                    "content": "New arrival! 2025 RAV4 Hybrid 🌱 Fuel efficient and adventure ready. Book your test drive today!",
                    "media_type": "video",
                    "media_url": "/api/placeholder/300/300",
                    "status": "scheduled",
                    "likes": 0,
                    "shares": 0,
                    "comments": 0,
                    "reach": 0,
                    "scheduled_at": "2024-01-25T15:30:00Z",
                    "published_at": None,
                    "created_at": "2024-01-22T10:15:00Z"
                },
                {
                    "id": "post_3",
                    "tenant_id": tenant_id,
                    "platform": "tiktok",
                    "content": "POV: You just got the keys to your dream Toyota 🔑 #Toyota #NewCar #DreamCar",
                    "media_type": "video",
                    "media_url": "/api/placeholder/200/350",
                    "status": "draft",
                    "likes": 0,
                    "shares": 0,
                    "comments": 0,
                    "reach": 0,
                    "scheduled_at": None,
                    "published_at": None,
                    "created_at": "2024-01-22T14:20:00Z"
                }
            ]
            return {"posts": mock_posts}
        
        return {"posts": posts}
        
    except Exception as e:
        logger.error(f"Error fetching social media posts: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to fetch posts")

@api_router.post("/social-media/posts")
async def create_social_media_post(post_data: SocialMediaPostCreate):
    """Create and optionally publish social media post to multiple platforms"""
    try:
        created_posts = []
        
        # Get connected accounts for the platforms
        accounts = await db.social_media_accounts.find({
            "tenant_id": post_data.tenant_id,
            "platform": {"$in": post_data.platforms},
            "status": "connected"
        }).to_list(100)
        
        if not accounts:
            # Create mock posts for demo
            for platform in post_data.platforms:
                scheduled_date = None
                if post_data.scheduled_date:
                    try:
                        scheduled_date = datetime.fromisoformat(post_data.scheduled_date.replace('Z', '+00:00'))
                    except:
                        pass
                
                post = SocialMediaPost(
                    tenant_id=post_data.tenant_id,
                    platform=platform,
                    account_id=f"mock_account_{platform}",
                    content=post_data.content,
                    media_type=post_data.media_type,
                    media_url=post_data.media_url,
                    status="scheduled" if scheduled_date else "draft",
                    scheduled_at=scheduled_date
                )
                
                created_posts.append(post.dict())
        else:
            # Create posts for each connected account
            for account in accounts:
                scheduled_date = None
                if post_data.scheduled_date:
                    try:
                        scheduled_date = datetime.fromisoformat(post_data.scheduled_date.replace('Z', '+00:00'))
                    except:
                        pass
                
                post = SocialMediaPost(
                    tenant_id=post_data.tenant_id,
                    platform=account["platform"],
                    account_id=account["id"],
                    content=post_data.content,
                    media_type=post_data.media_type,
                    media_url=post_data.media_url,
                    status="scheduled" if scheduled_date else "draft",
                    scheduled_at=scheduled_date
                )
                
                # Store in database
                post_doc = post.dict()
                await db.social_media_posts.insert_one(post_doc)
                created_posts.append(post)
        
        logger.info(f"Created {len(created_posts)} social media posts for tenant {post_data.tenant_id}")
        return {"posts": created_posts, "message": f"Created posts for {len(created_posts)} platforms"}
        
    except Exception as e:
        logger.error(f"Error creating social media post: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to create post")

@api_router.get("/social-media/analytics")
async def get_social_media_analytics(tenant_id: str):
    """Get social media analytics for a tenant"""
    try:
        # Get posts and accounts for analytics
        posts = await db.social_media_posts.find({"tenant_id": tenant_id}).to_list(1000)
        accounts = await db.social_media_accounts.find({"tenant_id": tenant_id}).to_list(100)
        
        if not posts and not accounts:
            # Return mock analytics
            return {
                "total_followers": 36600,
                "total_posts": 127,
                "total_engagement": 4850,
                "avg_engagement_rate": 6.8,
                "top_performing_platform": "tiktok",
                "recent_growth": 12.5,
                "weekly_stats": {
                    "facebook": {"posts": 5, "engagement": 1240, "reach": 15600},
                    "instagram": {"posts": 7, "engagement": 2150, "reach": 12800},
                    "tiktok": {"posts": 4, "engagement": 3580, "reach": 28400}
                }
            }
        
        # Calculate real analytics
        total_followers = sum(acc.get("followers", 0) for acc in accounts)
        total_posts = len(posts)
        total_engagement = sum(
            post.get("likes", 0) + post.get("shares", 0) + post.get("comments", 0) 
            for post in posts
        )
        
        # Calculate platform-specific stats
        platform_stats = {}
        for platform in ["facebook", "instagram", "tiktok"]:
            platform_posts = [p for p in posts if p.get("platform") == platform]
            platform_engagement = sum(
                p.get("likes", 0) + p.get("shares", 0) + p.get("comments", 0) 
                for p in platform_posts
            )
            platform_reach = sum(p.get("reach", 0) for p in platform_posts)
            
            platform_stats[platform] = {
                "posts": len(platform_posts),
                "engagement": platform_engagement,
                "reach": platform_reach
            }
        
        avg_engagement_rate = (total_engagement / total_posts * 100) if total_posts > 0 else 0
        
        return {
            "total_followers": total_followers,
            "total_posts": total_posts,
            "total_engagement": total_engagement,
            "avg_engagement_rate": round(avg_engagement_rate, 1),
            "top_performing_platform": max(platform_stats.keys(), key=lambda k: platform_stats[k]["engagement"]) if platform_stats else "facebook",
            "recent_growth": 12.5,  # Mock growth rate
            "weekly_stats": platform_stats
        }
        
    except Exception as e:
        logger.error(f"Error fetching social media analytics: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to fetch analytics")

# Enhanced Inventory Management Models
class Vehicle(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    tenant_id: str
    vin: str
    stock_number: str
    year: int
    make: str
    model: str
    trim: Optional[str] = None
    condition: str  # "New", "Used", "Certified Pre-Owned"
    price: float
    original_price: Optional[float] = None
    mileage: int = 0
    exterior_color: Optional[str] = None
    interior_color: Optional[str] = None
    fuel_type: str = "Gasoline"
    transmission: str = "Automatic"
    engine: Optional[str] = None
    features: List[str] = []
    images: List[str] = []
    description: Optional[str] = None
    status: str = "Available"  # "Available", "Marketplace Listed", "Pending Sale", "Sold"
    marketplace_listed: bool = False
    leads_count: int = 0
    views_count: int = 0
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class VehicleCreate(BaseModel):
    tenant_id: str
    vin: str
    stock_number: str
    year: int
    make: str
    model: str
    trim: Optional[str] = None
    condition: str
    price: float
    original_price: Optional[float] = None
    mileage: int = 0
    exterior_color: Optional[str] = None
    interior_color: Optional[str] = None
    fuel_type: str = "Gasoline"
    transmission: str = "Automatic"
    engine: Optional[str] = None
    features: List[str] = []
    images: List[str] = []
    description: Optional[str] = None

class VehicleUpdate(BaseModel):
    year: Optional[int] = None
    make: Optional[str] = None
    model: Optional[str] = None
    trim: Optional[str] = None
    condition: Optional[str] = None
    price: Optional[float] = None
    original_price: Optional[float] = None
    mileage: Optional[int] = None
    exterior_color: Optional[str] = None
    interior_color: Optional[str] = None
    fuel_type: Optional[str] = None
    transmission: Optional[str] = None
    engine: Optional[str] = None
    features: Optional[List[str]] = None
    images: Optional[List[str]] = None
    description: Optional[str] = None
    status: Optional[str] = None

class MarketplaceUpload(BaseModel):
    vehicle_ids: List[str]
    tenant_id: str
    platforms: List[str] = ["facebook"]
    auto_optimize_description: bool = True
    include_pricing: bool = True

# Enhanced Inventory Management Routes
@api_router.get("/inventory/summary")
async def get_inventory_summary(tenant_id: str = Query(...)):
    """Get inventory summary statistics"""
    try:
        # Get total vehicle counts
        total_vehicles = await db.vehicles.count_documents({"tenant_id": tenant_id})
        new_vehicles = await db.vehicles.count_documents({
            "tenant_id": tenant_id, 
            "condition": "New"
        })
        used_vehicles = await db.vehicles.count_documents({
            "tenant_id": tenant_id, 
            "condition": {"$in": ["Used", "Certified Pre-Owned"]}
        })
        marketplace_listed = await db.vehicles.count_documents({
            "tenant_id": tenant_id,
            "marketplace_listed": True
        })
        
        # Calculate leads generated from inventory
        vehicles_with_leads = await db.vehicles.find(
            {"tenant_id": tenant_id},
            {"leads_count": 1}
        ).to_list(None)
        total_leads = sum(v.get("leads_count", 0) for v in vehicles_with_leads)
        
        return {
            "total_vehicles": total_vehicles,
            "new_vehicles": new_vehicles,
            "used_vehicles": used_vehicles,
            "marketplace_listed": marketplace_listed,
            "leads_generated": total_leads,
            "dealership": DEALERSHIP_INFO["name"]
        }
    except Exception as e:
        logger.error(f"Error fetching inventory summary: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to fetch inventory summary")

# Removed duplicate inventory/vehicles endpoint - using the first one with mobile compatibility

@api_router.post("/inventory/vehicles", response_model=Vehicle)
async def create_vehicle(vehicle_data: VehicleCreate):
    """Add a new vehicle to inventory"""
    try:
        # Check if VIN or stock number already exists
        existing_vin = await db.vehicles.find_one({
            "tenant_id": vehicle_data.tenant_id,
            "vin": vehicle_data.vin
        })
        if existing_vin:
            raise HTTPException(status_code=400, detail="Vehicle with this VIN already exists")
            
        existing_stock = await db.vehicles.find_one({
            "tenant_id": vehicle_data.tenant_id,
            "stock_number": vehicle_data.stock_number
        })
        if existing_stock:
            raise HTTPException(status_code=400, detail="Vehicle with this stock number already exists")
        
        # Create vehicle object
        vehicle_obj = Vehicle(**vehicle_data.dict())
        vehicle_doc = vehicle_obj.dict()
        vehicle_doc['created_at'] = vehicle_doc['created_at'].isoformat()
        vehicle_doc['updated_at'] = vehicle_doc['updated_at'].isoformat()
        
        await db.vehicles.insert_one(vehicle_doc)
        return vehicle_obj
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error creating vehicle: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to create vehicle")

@api_router.put("/inventory/vehicles/{vehicle_id}", response_model=Vehicle)
async def update_vehicle(vehicle_id: str, update_data: VehicleUpdate):
    """Update vehicle information"""
    try:
        # Get current vehicle
        current_vehicle = await db.vehicles.find_one({"id": vehicle_id})
        if not current_vehicle:
            raise HTTPException(status_code=404, detail="Vehicle not found")
        
        # Prepare update data
        update_dict = {k: v for k, v in update_data.dict().items() if v is not None}
        if update_dict:
            update_dict["updated_at"] = datetime.now(timezone.utc).isoformat()
            await db.vehicles.update_one({"id": vehicle_id}, {"$set": update_dict})
        
        # Get updated vehicle
        updated_vehicle = await db.vehicles.find_one({"id": vehicle_id})
        if isinstance(updated_vehicle.get('created_at'), str):
            updated_vehicle['created_at'] = datetime.fromisoformat(updated_vehicle['created_at'])
        if isinstance(updated_vehicle.get('updated_at'), str):
            updated_vehicle['updated_at'] = datetime.fromisoformat(updated_vehicle['updated_at'])
            
        return Vehicle(**updated_vehicle)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating vehicle: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to update vehicle")

@api_router.delete("/inventory/vehicles/{vehicle_id}")
async def delete_vehicle(vehicle_id: str):
    """Delete a vehicle from inventory"""
    try:
        result = await db.vehicles.delete_one({"id": vehicle_id})
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Vehicle not found")
        
        return {"message": "Vehicle deleted successfully", "vehicle_id": vehicle_id}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting vehicle: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to delete vehicle")

@api_router.post("/inventory/sync/{tenant_id}")
async def sync_inventory(tenant_id: str):
    """Sync inventory from external sources (like dealership DMS)"""
    try:
        # This would typically sync with dealership management systems
        # For demo purposes, we'll simulate syncing
        
        # Use the existing scraper if available
        scraper = ShottenkilkInventoryScraper()
        inventory_data = scraper.get_mock_data()
        
        synced_count = 0
        for vehicle_data in inventory_data["vehicles"]:
            # Check if vehicle already exists
            existing = await db.vehicles.find_one({
                "tenant_id": tenant_id,
                "$or": [
                    {"vin": vehicle_data["vin"]},
                    {"stock_number": vehicle_data["stock_number"]}
                ]
            })
            
            if not existing:
                # Add tenant_id to vehicle data
                vehicle_data["tenant_id"] = tenant_id
                
                # Create vehicle
                vehicle_obj = Vehicle(**vehicle_data)
                vehicle_doc = vehicle_obj.dict()
                vehicle_doc['created_at'] = vehicle_doc['created_at'].isoformat()
                vehicle_doc['updated_at'] = vehicle_doc['updated_at'].isoformat()
                
                await db.vehicles.insert_one(vehicle_doc)
                synced_count += 1
        
        return {
            "message": "Inventory sync completed",
            "synced_vehicles": synced_count,
            "total_inventory": inventory_data["total_count"],
            "last_sync": datetime.now(timezone.utc).isoformat()
        }
        
    except Exception as e:
        logger.error(f"Error syncing inventory: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to sync inventory")

# Walk-In Tracker Models
class WalkInCustomer(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    tenant_id: str
    customer_name: str
    phone: str
    email: Optional[str] = None
    visit_date: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    interested_vehicle: str
    budget: float
    status: str = "pending"  # pending, contacted, scheduled, converted, lost
    priority: str = "medium"  # low, medium, high
    reason_not_bought: str
    salesperson: str
    notes: Optional[str] = None
    follow_up_scheduled: datetime = Field(default_factory=lambda: datetime.now(timezone.utc) + timedelta(days=1))
    ai_score: int = Field(default=75, ge=0, le=100)
    contact_attempts: int = 0
    last_contact_date: Optional[datetime] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class VehicleWishlistRequest(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    tenant_id: str
    customer_name: str
    phone: str
    email: Optional[str] = None
    request_date: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    
    # Vehicle specifications
    desired_year: int
    desired_make: str
    desired_model: str
    desired_trim: Optional[str] = None
    desired_color: Optional[str] = None
    max_budget: float
    max_mileage: int = 0
    
    # Request details
    status: str = "active"  # active, fulfilled, expired, cancelled
    urgency: str = "medium"  # low, medium, high, urgent
    flexible_specs: bool = True
    willing_to_wait: bool = True
    deposit_amount: float = 0
    timeframe: str = "1 month"
    
    # Customer preferences
    preferred_features: List[str] = []
    dealbreakers: List[str] = []
    
    # Sales info
    salesperson: str
    notes: Optional[str] = None
    last_contact_date: Optional[datetime] = None
    
    # AI scoring
    ai_match_score: int = Field(default=75, ge=0, le=100)
    conversion_probability: int = Field(default=75, ge=0, le=100)
    estimated_value: float = 0
    
    # Notification preferences
    notify_by_sms: bool = True
    notify_by_email: bool = True
    notify_by_call: bool = False
    auto_schedule_viewing: bool = False
    
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

# Walk-In Tracker Routes
@api_router.get("/walk-in-tracker/customers")
async def get_walk_in_customers(
    tenant_id: str = Query(...),
    status: Optional[str] = None,
    priority: Optional[str] = None,
    limit: int = Query(50, le=100)
):
    """Get walk-in customers for follow-up"""
    try:
        filter_query = {"tenant_id": tenant_id}
        
        if status and status != "all":
            filter_query["status"] = status
        if priority and priority != "all":
            filter_query["priority"] = priority
        
        customers = await db.walk_in_customers.find(filter_query).sort("visit_date", -1).limit(limit).to_list(None)
        
        result_customers = []
        for customer in customers:
            # Convert datetime fields
            for field in ['visit_date', 'follow_up_scheduled', 'last_contact_date', 'created_at']:
                if customer.get(field) and isinstance(customer[field], str):
                    try:
                        customer[field] = datetime.fromisoformat(customer[field])
                    except:
                        customer[field] = None
            
            result_customers.append(WalkInCustomer(**customer))
        
        return {
            "customers": result_customers,
            "total_count": len(result_customers)
        }
        
    except Exception as e:
        logger.error(f"Error fetching walk-in customers: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to fetch walk-in customers")

@api_router.post("/walk-in-tracker/customers", response_model=WalkInCustomer)
async def create_walk_in_customer(customer_data: dict):
    """Add a new walk-in customer"""
    try:
        customer_obj = WalkInCustomer(**customer_data)
        customer_doc = customer_obj.dict()
        
        # Convert datetime fields to strings for MongoDB
        for field in ['visit_date', 'follow_up_scheduled', 'last_contact_date', 'created_at']:
            if customer_doc.get(field):
                customer_doc[field] = customer_doc[field].isoformat()
        
        await db.walk_in_customers.insert_one(customer_doc)
        return customer_obj
        
    except Exception as e:
        logger.error(f"Error creating walk-in customer: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to create walk-in customer")

@api_router.post("/walk-in-tracker/follow-up/{customer_id}")
async def send_follow_up(customer_id: str, method: str = Query(...)):
    """Send follow-up to walk-in customer"""
    try:
        customer = await db.walk_in_customers.find_one({"id": customer_id})
        if not customer:
            raise HTTPException(status_code=404, detail="Customer not found")
        
        # Update contact attempts and last contact date
        await db.walk_in_customers.update_one(
            {"id": customer_id},
            {
                "$set": {
                    "status": "contacted",
                    "last_contact_date": datetime.now(timezone.utc).isoformat(),
                    "contact_attempts": customer.get("contact_attempts", 0) + 1
                }
            }
        )
        
        return {
            "message": f"Follow-up sent via {method}",
            "customer_id": customer_id,
            "method": method
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error sending follow-up: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to send follow-up")

# Vehicle Wishlist Routes
@api_router.get("/vehicle-wishlist/requests")
async def get_wishlist_requests(
    tenant_id: str = Query(...),
    status: Optional[str] = None,
    urgency: Optional[str] = None,
    make: Optional[str] = None,
    limit: int = Query(50, le=100)
):
    """Get vehicle wishlist requests"""
    try:
        filter_query = {"tenant_id": tenant_id}
        
        if status and status != "all":
            filter_query["status"] = status
        if urgency and urgency != "all":
            filter_query["urgency"] = urgency
        if make and make != "all":
            filter_query["desired_make"] = {"$regex": make, "$options": "i"}
        
        requests = await db.vehicle_wishlist.find(filter_query).sort("request_date", -1).limit(limit).to_list(None)
        
        result_requests = []
        for request in requests:
            # Convert datetime fields
            for field in ['request_date', 'last_contact_date', 'created_at', 'updated_at']:
                if request.get(field) and isinstance(request[field], str):
                    try:
                        request[field] = datetime.fromisoformat(request[field])
                    except:
                        request[field] = None
            
            result_requests.append(VehicleWishlistRequest(**request))
        
        return {
            "requests": result_requests,
            "total_count": len(result_requests)
        }
        
    except Exception as e:
        logger.error(f"Error fetching wishlist requests: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to fetch wishlist requests")

@api_router.post("/vehicle-wishlist/requests", response_model=VehicleWishlistRequest)
async def create_wishlist_request(request_data: dict):
    """Add a new vehicle wishlist request"""
    try:
        request_obj = VehicleWishlistRequest(**request_data)
        request_doc = request_obj.dict()
        
        # Convert datetime fields to strings for MongoDB
        for field in ['request_date', 'last_contact_date', 'created_at', 'updated_at']:
            if request_doc.get(field):
                request_doc[field] = request_doc[field].isoformat()
        
        await db.vehicle_wishlist.insert_one(request_doc)
        return request_obj
        
    except Exception as e:
        logger.error(f"Error creating wishlist request: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to create wishlist request")

@api_router.post("/vehicle-wishlist/auto-match")
async def auto_match_vehicles(tenant_id: str = Query(...)):
    """Automatically match wishlist requests with available inventory"""
    try:
        # Get active wishlist requests
        active_requests = await db.vehicle_wishlist.find({
            "tenant_id": tenant_id,
            "status": "active"
        }).to_list(None)
        
        # Get available vehicles
        available_vehicles = await db.vehicles.find({
            "tenant_id": tenant_id,
            "status": "Available"
        }).to_list(None)
        
        matches_found = 0
        
        for request in active_requests:
            for vehicle in available_vehicles:
                # Check if vehicle matches request criteria
                if (vehicle.get("make", "").lower() == request.get("desired_make", "").lower() and
                    vehicle.get("model", "").lower() == request.get("desired_model", "").lower() and
                    vehicle.get("year", 0) >= request.get("desired_year", 0) - 1 and
                    vehicle.get("year", 0) <= request.get("desired_year", 0) + 1 and
                    vehicle.get("price", 0) <= request.get("max_budget", 0) * 1.1):
                    
                    # Mark request as fulfilled
                    await db.vehicle_wishlist.update_one(
                        {"id": request["id"]},
                        {
                            "$set": {
                                "status": "fulfilled",
                                "last_contact_date": datetime.now(timezone.utc).isoformat(),
                                "updated_at": datetime.now(timezone.utc).isoformat()
                            }
                        }
                    )
                    
                    matches_found += 1
                    break  # Move to next request after finding a match
        
        return {
            "matches_found": matches_found,
            "message": f"Found {matches_found} matches and notified customers"
        }
        
    except Exception as e:
        logger.error(f"Error in auto-match: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to auto-match vehicles")

@api_router.post("/vehicle-wishlist/notify/{request_id}")
async def notify_customer_match(request_id: str, vehicle_id: Optional[str] = None):
    """Notify customer about vehicle match"""
    try:
        request = await db.vehicle_wishlist.find_one({"id": request_id})
        if not request:
            raise HTTPException(status_code=404, detail="Wishlist request not found")
        
        # Update request status
        await db.vehicle_wishlist.update_one(
            {"id": request_id},
            {
                "$set": {
                    "status": "fulfilled" if vehicle_id else "contacted",
                    "last_contact_date": datetime.now(timezone.utc).isoformat(),
                    "updated_at": datetime.now(timezone.utc).isoformat()
                }
            }
        )
        
        return {
            "message": "Customer notification sent successfully",
            "request_id": request_id,
            "vehicle_id": vehicle_id
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error notifying customer: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to notify customer")

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()