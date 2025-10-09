#!/usr/bin/env python3
"""
Production Database Setup Script
Creates indexes and optimizes MongoDB for production use
"""

import asyncio
import os
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv

async def setup_production_database():
    """Setup database indexes and configuration for production"""
    
    # Load environment variables
    load_dotenv()
    
    # Connect to MongoDB
    mongo_url = os.environ.get('MONGO_URL')
    db_name = os.environ.get('DB_NAME')
    
    if not mongo_url or not db_name:
        print("❌ Error: MONGO_URL and DB_NAME must be set")
        return False
    
    client = AsyncIOMotorClient(mongo_url)
    db = client[db_name]
    
    print(f"🔗 Connected to MongoDB: {db_name}")
    
    try:
        # Create indexes for leads collection
        print("📊 Creating indexes for leads collection...")
        await db.leads.create_index("tenant_id")
        await db.leads.create_index("email")
        await db.leads.create_index("primary_phone")
        await db.leads.create_index([("tenant_id", 1), ("created_at", -1)])
        await db.leads.create_index([("tenant_id", 1), ("status", 1)])
        
        # Create indexes for sms_messages collection
        print("📊 Creating indexes for sms_messages collection...")
        await db.sms_messages.create_index("lead_id")
        await db.sms_messages.create_index([("lead_id", 1), ("created_at", -1)])
        
        # Create indexes for appointments collection
        print("📊 Creating indexes for appointments collection...")
        await db.appointments.create_index("lead_id")
        await db.appointments.create_index("appointment_date")
        await db.appointments.create_index([("tenant_id", 1), ("appointment_date", 1)])
        
        # Create indexes for sales collection
        print("📊 Creating indexes for sales collection...")
        await db.sales.create_index("lead_id")
        await db.sales.create_index("user_id")
        await db.sales.create_index([("tenant_id", 1), ("sale_date", -1)])
        
        # Create indexes for users collection
        print("📊 Creating indexes for users collection...")
        await db.users.create_index("email", unique=True)
        await db.users.create_index("tenant_id")
        
        # Create indexes for campaigns collection (marketing)
        print("📊 Creating indexes for campaigns collection...")
        await db.campaigns.create_index("tenant_id")
        await db.campaigns.create_index([("tenant_id", 1), ("status", 1)])
        await db.campaigns.create_index([("tenant_id", 1), ("created_at", -1)])
        
        # Create indexes for social_media_accounts collection
        print("📊 Creating indexes for social_media_accounts collection...")
        await db.social_media_accounts.create_index("tenant_id")
        await db.social_media_accounts.create_index([("tenant_id", 1), ("platform", 1)])
        
        # Create indexes for inventory collection
        print("📊 Creating indexes for inventory collection...")
        await db.inventory.create_index("tenant_id")
        await db.inventory.create_index([("tenant_id", 1), ("status", 1)])
        await db.inventory.create_index([("make", 1), ("model", 1), ("year", 1)])
        
        # Create compound indexes for common queries
        print("📊 Creating compound indexes...")
        await db.leads.create_index([
            ("tenant_id", 1), 
            ("status", 1), 
            ("created_at", -1)
        ])
        
        await db.sms_messages.create_index([
            ("lead_id", 1),
            ("direction", 1),
            ("created_at", -1)
        ])
        
        print("✅ Database indexes created successfully!")
        
        # Test database connectivity
        print("🔍 Testing database connectivity...")
        ping_result = await client.admin.command('ping')
        if ping_result:
            print("✅ Database connectivity test passed!")
        
        # Show database statistics
        stats = await db.command("dbstats")
        print(f"📈 Database stats:")
        print(f"   Collections: {stats.get('collections', 0)}")
        print(f"   Data size: {stats.get('dataSize', 0)} bytes")
        print(f"   Index size: {stats.get('indexSize', 0)} bytes")
        
        return True
        
    except Exception as e:
        print(f"❌ Error setting up database: {str(e)}")
        return False
        
    finally:
        client.close()

if __name__ == "__main__":
    success = asyncio.run(setup_production_database())
    if success:
        print("\n🎉 Production database setup completed successfully!")
    else:
        print("\n💥 Production database setup failed!")
        exit(1)