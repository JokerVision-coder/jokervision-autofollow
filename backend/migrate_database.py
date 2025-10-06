#!/usr/bin/env python3
"""
Database Migration Script for JokerVision AutoFollow
This script adds missing tenant_id field to existing database records
"""

import asyncio
import os
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
from pathlib import Path

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

DEFAULT_TENANT_ID = "default_dealership"

async def migrate_add_tenant_id():
    """Add tenant_id field to all collections that are missing it"""
    
    print("🚀 Starting database migration...")
    
    collections_to_migrate = [
        ("leads", "leads"),
        ("users", "users"), 
        ("sales", "sales"),
        ("appointments", "appointments"),
        ("sms_messages", "sms_messages"),
        ("campaigns", "campaigns"),
        ("analytics", "analytics")
    ]
    
    total_modified = 0
    
    for collection_name, display_name in collections_to_migrate:
        try:
            collection = db[collection_name]
            
            # Count documents missing tenant_id
            missing_count = await collection.count_documents({"tenant_id": {"$exists": False}})
            
            if missing_count > 0:
                print(f"📝 Migrating {display_name}: {missing_count} documents missing tenant_id")
                
                # Update all documents missing tenant_id field
                result = await collection.update_many(
                    {"tenant_id": {"$exists": False}},
                    {"$set": {"tenant_id": DEFAULT_TENANT_ID}}
                )
                
                print(f"✅ {display_name}: Updated {result.modified_count} documents")
                total_modified += result.modified_count
            else:
                print(f"✅ {display_name}: No migration needed")
                
        except Exception as e:
            print(f"❌ Error migrating {display_name}: {str(e)}")
    
    print(f"\n🎉 Migration complete! Total documents updated: {total_modified}")
    return total_modified

async def verify_migration():
    """Verify that all documents now have tenant_id field"""
    
    print("\n🔍 Verifying migration...")
    
    collections_to_check = ["leads", "users", "sales", "appointments", "sms_messages"]
    all_good = True
    
    for collection_name in collections_to_check:
        try:
            collection = db[collection_name]
            missing_count = await collection.count_documents({"tenant_id": {"$exists": False}})
            total_count = await collection.count_documents({})
            
            if missing_count > 0:
                print(f"❌ {collection_name}: {missing_count}/{total_count} documents still missing tenant_id")
                all_good = False
            else:
                print(f"✅ {collection_name}: All {total_count} documents have tenant_id")
                
        except Exception as e:
            print(f"❌ Error checking {collection_name}: {str(e)}")
            all_good = False
    
    if all_good:
        print("\n🎉 All documents successfully migrated!")
    else:
        print("\n⚠️  Some documents still need migration")
    
    return all_good

async def show_sample_data():
    """Show sample of migrated data"""
    
    print("\n📊 Sample migrated data:")
    
    try:
        # Show sample leads
        leads = await db.leads.find({}).limit(2).to_list(2)
        print(f"Sample leads: {len(leads)} found")
        for i, lead in enumerate(leads):
            print(f"  Lead {i+1}: {lead.get('first_name', 'Unknown')} {lead.get('last_name', 'Unknown')} - tenant_id: {lead.get('tenant_id', 'MISSING')}")
        
        # Show sample users
        users = await db.users.find({}).limit(2).to_list(2)
        print(f"Sample users: {len(users)} found")
        for i, user in enumerate(users):
            print(f"  User {i+1}: {user.get('full_name', 'Unknown')} - tenant_id: {user.get('tenant_id', 'MISSING')}")
            
    except Exception as e:
        print(f"❌ Error showing sample data: {str(e)}")

async def main():
    """Main migration function"""
    
    print("=" * 60)
    print("🔧 JokerVision AutoFollow Database Migration")
    print("=" * 60)
    
    try:
        # Run migration
        modified_count = await migrate_add_tenant_id()
        
        # Verify migration
        success = await verify_migration()
        
        # Show sample data
        await show_sample_data()
        
        if success and modified_count >= 0:
            print("\n✅ Migration completed successfully!")
            print("🚀 You can now restart the backend server")
        else:
            print("\n⚠️  Migration may not be complete. Please check manually.")
            
    except Exception as e:
        print(f"\n❌ Migration failed: {str(e)}")
    finally:
        client.close()

if __name__ == "__main__":
    asyncio.run(main())