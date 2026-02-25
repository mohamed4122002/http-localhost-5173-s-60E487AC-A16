import asyncio
import json
from motor.motor_asyncio import AsyncIOMotorClient
import os
import sys

# Look for config
sys.path.append(os.getcwd())
from backend.config import settings

async def main():
    client = AsyncIOMotorClient(settings.MONGO_URI)
    db = client[settings.DATABASE_NAME]
    
    # 1. Template
    t = await db['templates'].find_one({'name': 'Standard'})
    print("--- TEMPLATE DATA ---")
    if t:
        # Convert ObjectId to string for printing
        t['_id'] = str(t['_id'])
        print(json.dumps(t, indent=2, default=str))
    else:
        print("Standard template not found")
        
    # 2. Recent Survey
    s = await db['surveys'].find().sort('created_at', -1).to_list(1)
    print("\n--- RECENT SURVEY DATA ---")
    if s:
        s0 = s[0]
        s0['_id'] = str(s0['_id'])
        print(json.dumps(s0, indent=2, default=str))
    else:
        print("No surveys found")
        
    client.close()

if __name__ == "__main__":
    asyncio.run(main())
