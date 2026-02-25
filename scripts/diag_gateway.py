import asyncio
import json
from motor.motor_asyncio import AsyncIOMotorClient
import os
import sys

sys.path.append(os.getcwd())
from backend.config import settings

async def main():
    client = AsyncIOMotorClient(settings.MONGO_URI)
    db = client[settings.DATABASE_NAME]
    
    # User's current survey ID suffix is AD5
    s = await db['surveys'].find_one({'_id': {'$regex': 'ad5$', '$options': 'i'}})
    if not s:
        # Fallback to last one
        s = await db['surveys'].find_one(sort=[('created_at', -1)])
        
    print("\n--- SURVEY SNAPSHOT ---")
    if s:
        print(json.dumps({
            "id": str(s['_id']),
            "questions": s.get("template_snapshot_questions"),
            "rules": s.get("layer1_rules")
        }, indent=2, default=str))
    else:
        print("No survey found")

    client.close()

if __name__ == "__main__":
    asyncio.run(main())
