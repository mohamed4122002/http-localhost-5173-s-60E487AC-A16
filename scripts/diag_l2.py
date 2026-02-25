import asyncio
import json
from motor.motor_asyncio import AsyncIOMotorClient
import os
import sys
from bson import ObjectId

sys.path.append(os.getcwd())
from backend.config import settings

async def main():
    client = AsyncIOMotorClient(settings.MONGO_URI)
    db = client[settings.DATABASE_NAME]
    
    # User's latest survey ID suffix is AD5
    s = await db['surveys'].find_one({'_id': ObjectId('699c41bfc7243dd912f2c429')})
    if not s:
        s = await db['surveys'].find_one(sort=[('created_at', -1)])
        
    print("\n--- SURVEY LAYER 2 ---")
    if s:
        # Fetch template to see full structure if snapshot is missing L2
        template = await db['templates'].find_one({'_id': ObjectId(s['template_id'])})
        print(json.dumps({
            "id": str(s['_id']),
            "survey_l2": s.get("template_snapshot_schema_l2"), # Might be missing
            "template_l2": template.get("layer2_structure") if template else None
        }, indent=2, default=str))
    else:
        print("No survey found")

    client.close()

if __name__ == "__main__":
    asyncio.run(main())
