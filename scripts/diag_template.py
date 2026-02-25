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
    
    tid = "699c11fe549415ee4c2566ba"
    t = await db['templates'].find_one({'_id': ObjectId(tid)})
    
    print("\n--- TEMPLATE STRUCTURE ---")
    if t:
        print(json.dumps({
            "name": t.get("name"),
            "layer1_questions": t.get("layer1_questions"),
            "layer1_structure": t.get("layer1_structure")
        }, indent=2, default=str))
    else:
        print("Template not found")

    client.close()

if __name__ == "__main__":
    asyncio.run(main())
