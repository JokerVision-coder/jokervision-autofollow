"""
JokerVision AutoFollow - WebSocket Manager
Revolutionary real-time communication for automotive dealership management
"""

import asyncio
import json
import logging
from datetime import datetime, timezone, timedelta
from typing import Dict, List, Set, Any, Optional
from fastapi import WebSocket, WebSocketDisconnect
import uuid
from ml_models import get_ml_engine

logger = logging.getLogger(__name__)

class ConnectionManager:
    """Revolutionary WebSocket connection manager for real-time dealership operations"""
    
    def __init__(self):
        self.active_connections: Dict[str, WebSocket] = {}
        self.user_connections: Dict[str, List[str]] = {}  # user_id -> [connection_ids]
        self.connection_metadata: Dict[str, Dict[str, Any]] = {}
        self.subscription_topics: Dict[str, Set[str]] = {}  # topic -> {connection_ids}
        
        # Start background tasks
        self.background_task = None
        self.start_background_tasks()
    
    def start_background_tasks(self):
        """Start background tasks for real-time updates"""
        if not self.background_task or self.background_task.done():
            self.background_task = asyncio.create_task(self._background_update_loop())
    
    async def connect(self, websocket: WebSocket, connection_id: str, user_id: Optional[str] = None) -> str:
        """Connect a new WebSocket client"""
        try:
            await websocket.accept()
            
            self.active_connections[connection_id] = websocket
            self.connection_metadata[connection_id] = {
                "user_id": user_id,
                "connected_at": datetime.now(timezone.utc),
                "last_activity": datetime.now(timezone.utc),
                "subscriptions": set()
            }
            
            if user_id:
                if user_id not in self.user_connections:
                    self.user_connections[user_id] = []
                self.user_connections[user_id].append(connection_id)
            
            logger.info(f"🔗 WebSocket connected: {connection_id} (user: {user_id})")
            
            # Send welcome message with connection info
            await self.send_personal_message({
                "type": "connection_established",
                "connection_id": connection_id,
                "timestamp": datetime.now(timezone.utc).isoformat(),
                "message": "🚀 Connected to JokerVision AutoFollow real-time system"
            }, connection_id)
            
            return connection_id
            
        except Exception as e:
            logger.error(f"Error connecting WebSocket {connection_id}: {str(e)}")
            raise
    
    async def disconnect(self, connection_id: str):
        """Disconnect a WebSocket client"""
        try:
            if connection_id in self.active_connections:
                # Remove from active connections
                del self.active_connections[connection_id]
                
                # Remove from user connections
                metadata = self.connection_metadata.get(connection_id, {})
                user_id = metadata.get("user_id")
                if user_id and user_id in self.user_connections:
                    if connection_id in self.user_connections[user_id]:
                        self.user_connections[user_id].remove(connection_id)
                    if not self.user_connections[user_id]:
                        del self.user_connections[user_id]
                
                # Remove from subscriptions
                subscriptions = metadata.get("subscriptions", set())
                for topic in subscriptions:
                    if topic in self.subscription_topics:
                        self.subscription_topics[topic].discard(connection_id)
                        if not self.subscription_topics[topic]:
                            del self.subscription_topics[topic]
                
                # Remove metadata
                if connection_id in self.connection_metadata:
                    del self.connection_metadata[connection_id]
                
                logger.info(f"🔌 WebSocket disconnected: {connection_id}")
                
        except Exception as e:
            logger.error(f"Error disconnecting WebSocket {connection_id}: {str(e)}")
    
    async def send_personal_message(self, message: Dict[str, Any], connection_id: str):
        """Send message to a specific connection"""
        try:
            if connection_id in self.active_connections:
                websocket = self.active_connections[connection_id]
                await websocket.send_text(json.dumps(message))
                
                # Update last activity
                if connection_id in self.connection_metadata:
                    self.connection_metadata[connection_id]["last_activity"] = datetime.now(timezone.utc)
                
        except WebSocketDisconnect:
            await self.disconnect(connection_id)
        except Exception as e:
            logger.error(f"Error sending message to {connection_id}: {str(e)}")
            await self.disconnect(connection_id)
    
    async def send_to_user(self, message: Dict[str, Any], user_id: str):
        """Send message to all connections for a specific user"""
        if user_id in self.user_connections:
            for connection_id in self.user_connections[user_id][:]:  # Copy to avoid modification during iteration
                await self.send_personal_message(message, connection_id)
    
    async def broadcast_to_topic(self, message: Dict[str, Any], topic: str):
        """Broadcast message to all subscribers of a topic"""
        if topic in self.subscription_topics:
            for connection_id in self.subscription_topics[topic].copy():  # Copy to avoid modification during iteration
                await self.send_personal_message(message, connection_id)
    
    async def broadcast_to_all(self, message: Dict[str, Any]):
        """Broadcast message to all active connections"""
        for connection_id in list(self.active_connections.keys()):  # Copy to avoid modification during iteration
            await self.send_personal_message(message, connection_id)
    
    async def subscribe_to_topic(self, connection_id: str, topic: str):
        """Subscribe a connection to a topic"""
        try:
            if connection_id in self.active_connections:
                # Add to subscription topics
                if topic not in self.subscription_topics:
                    self.subscription_topics[topic] = set()
                self.subscription_topics[topic].add(connection_id)
                
                # Update connection metadata
                if connection_id in self.connection_metadata:
                    self.connection_metadata[connection_id]["subscriptions"].add(topic)
                
                logger.info(f"📡 Connection {connection_id} subscribed to topic: {topic}")
                
                # Send confirmation
                await self.send_personal_message({
                    "type": "subscription_confirmed",
                    "topic": topic,
                    "message": f"Subscribed to {topic} updates"
                }, connection_id)
                
        except Exception as e:
            logger.error(f"Error subscribing {connection_id} to {topic}: {str(e)}")
    
    async def unsubscribe_from_topic(self, connection_id: str, topic: str):
        """Unsubscribe a connection from a topic"""
        try:
            if topic in self.subscription_topics:
                self.subscription_topics[topic].discard(connection_id)
                if not self.subscription_topics[topic]:
                    del self.subscription_topics[topic]
            
            if connection_id in self.connection_metadata:
                self.connection_metadata[connection_id]["subscriptions"].discard(topic)
            
            logger.info(f"📡 Connection {connection_id} unsubscribed from topic: {topic}")
            
        except Exception as e:
            logger.error(f"Error unsubscribing {connection_id} from {topic}: {str(e)}")
    
    async def handle_client_message(self, message: Dict[str, Any], connection_id: str):
        """Handle incoming messages from clients"""
        try:
            message_type = message.get("type")
            
            if message_type == "subscribe":
                topic = message.get("topic")
                if topic:
                    await self.subscribe_to_topic(connection_id, topic)
            
            elif message_type == "unsubscribe":
                topic = message.get("topic")
                if topic:
                    await self.unsubscribe_from_topic(connection_id, topic)
            
            elif message_type == "ping":
                await self.send_personal_message({
                    "type": "pong",
                    "timestamp": datetime.now(timezone.utc).isoformat()
                }, connection_id)
            
            elif message_type == "get_ai_insights":
                await self._send_ai_insights(connection_id)
            
            elif message_type == "trigger_lead_analysis":
                await self._trigger_lead_analysis(connection_id)
            
            else:
                logger.warning(f"Unknown message type from {connection_id}: {message_type}")
                
        except Exception as e:
            logger.error(f"Error handling client message from {connection_id}: {str(e)}")
    
    async def _send_ai_insights(self, connection_id: str):
        """Send AI insights to a specific connection"""
        try:
            ml_engine = await get_ml_engine()
            insights = await ml_engine.generate_predictive_insights_dashboard()
            
            await self.send_personal_message({
                "type": "ai_insights_update",
                "data": insights,
                "timestamp": datetime.now(timezone.utc).isoformat()
            }, connection_id)
            
        except Exception as e:
            logger.error(f"Error sending AI insights to {connection_id}: {str(e)}")
    
    async def _trigger_lead_analysis(self, connection_id: str):
        """Trigger real-time lead analysis"""
        try:
            # Simulate real-time lead analysis
            analysis_result = {
                "new_high_probability_leads": 2,
                "conversion_opportunities": [
                    {
                        "lead_name": "Alex Thompson", 
                        "score": 94, 
                        "action": "Call within 1 hour - hot prospect"
                    },
                    {
                        "lead_name": "Maria Rodriguez", 
                        "score": 87, 
                        "action": "Send personalized inventory options"
                    }
                ],
                "market_insights": "Voice AI leads converting 32% higher than traditional sources"
            }
            
            await self.send_personal_message({
                "type": "lead_analysis_result",
                "data": analysis_result,
                "timestamp": datetime.now(timezone.utc).isoformat()
            }, connection_id)
            
        except Exception as e:
            logger.error(f"Error triggering lead analysis for {connection_id}: {str(e)}")
    
    async def _background_update_loop(self):
        """Background loop for sending periodic updates"""
        while True:
            try:
                await asyncio.sleep(30)  # Update every 30 seconds
                
                if not self.active_connections:
                    continue
                
                # Generate real-time updates
                current_time = datetime.now(timezone.utc)
                
                # Real-time dashboard update
                dashboard_update = {
                    "type": "dashboard_update",
                    "data": {
                        "active_leads": len(self.active_connections) * 12 + 147,  # Simulate dynamic data
                        "voice_ai_calls": len(self.active_connections) * 3 + 23,
                        "conversion_rate": 16.8 + (len(self.active_connections) * 0.5),
                        "revenue_today": 25600 + (len(self.active_connections) * 1200),
                        "last_update": current_time.isoformat()
                    },
                    "timestamp": current_time.isoformat()
                }
                
                # Send to dashboard subscribers
                await self.broadcast_to_topic(dashboard_update, "dashboard_updates")
                
                # AI Alert simulation (every 2 minutes)
                if current_time.minute % 2 == 0:
                    ai_alert = {
                        "type": "ai_alert",
                        "data": {
                            "alert_type": "high_priority_lead",
                            "message": "New 95% probability lead detected - immediate action required",
                            "lead_name": "Jennifer Park",
                            "ai_score": 95,
                            "source": "Voice AI Call",
                            "action": "Contact within 15 minutes for optimal conversion"
                        },
                        "timestamp": current_time.isoformat()
                    }
                    
                    await self.broadcast_to_topic(ai_alert, "ai_alerts")
                
                # Inventory update simulation (every 5 minutes)
                if current_time.minute % 5 == 0:
                    inventory_update = {
                        "type": "inventory_update",
                        "data": {
                            "update_type": "demand_spike",
                            "message": "SUV demand increased 18% in last hour",
                            "affected_vehicles": ["2024 Toyota RAV4", "2023 Honda CR-V", "2024 Ford Escape"],
                            "recommendation": "Feature SUVs prominently on homepage and social media",
                            "confidence": 89
                        },
                        "timestamp": current_time.isoformat()
                    }
                    
                    await self.broadcast_to_topic(inventory_update, "inventory_updates")
                
            except Exception as e:
                logger.error(f"Error in background update loop: {str(e)}")
                await asyncio.sleep(10)  # Wait before retrying
    
    def get_connection_stats(self) -> Dict[str, Any]:
        """Get current connection statistics"""
        return {
            "total_connections": len(self.active_connections),
            "unique_users": len(self.user_connections),
            "active_topics": list(self.subscription_topics.keys()),
            "topic_subscribers": {topic: len(subscribers) for topic, subscribers in self.subscription_topics.items()},
            "uptime": datetime.now(timezone.utc).isoformat()
        }

# Global connection manager instance
connection_manager = ConnectionManager()

# Real-time event triggers
async def trigger_real_time_lead_update(lead_data: Dict[str, Any]):
    """Trigger real-time lead update to all connected clients"""
    try:
        message = {
            "type": "new_lead_alert",
            "data": {
                "lead_name": lead_data.get("name", "New Lead"),
                "source": lead_data.get("source", "Unknown"),
                "ai_score": lead_data.get("ai_score", 75),
                "priority": "High" if lead_data.get("ai_score", 75) >= 80 else "Medium",
                "action": "Review and contact immediately" if lead_data.get("ai_score", 75) >= 80 else "Add to follow-up queue"
            },
            "timestamp": datetime.now(timezone.utc).isoformat()
        }
        
        await connection_manager.broadcast_to_topic(message, "lead_updates")
        logger.info(f"🚨 Real-time lead alert sent: {lead_data.get('name')}")
        
    except Exception as e:
        logger.error(f"Error sending real-time lead update: {str(e)}")

async def trigger_voice_ai_completion(call_data: Dict[str, Any]):
    """Trigger real-time Voice AI call completion update"""
    try:
        message = {
            "type": "voice_ai_completion",
            "data": {
                "call_duration": call_data.get("duration", "3:45"),
                "customer_satisfaction": call_data.get("satisfaction", 4.8),
                "lead_quality": call_data.get("lead_quality", "High"),
                "follow_up_required": call_data.get("follow_up_required", True),
                "ai_insights": call_data.get("ai_insights", "Customer ready to purchase, schedule test drive")
            },
            "timestamp": datetime.now(timezone.utc).isoformat()
        }
        
        await connection_manager.broadcast_to_topic(message, "voice_ai_updates")
        logger.info(f"🎤 Voice AI completion alert sent")
        
    except Exception as e:
        logger.error(f"Error sending Voice AI completion update: {str(e)}")

# Export for use in server.py
def get_connection_manager():
    """Get the global connection manager instance"""
    return connection_manager