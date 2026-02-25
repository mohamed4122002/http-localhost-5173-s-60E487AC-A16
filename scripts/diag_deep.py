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
    
    print("\n--- DETAILED SURVEY DUMP ---")
    surveys = await db['surveys'].find().sort('created_at', -1).limit(3).to_list(3)
    for s in surveys:
        s_id = str(s['_id'])
        print(f"\n[SURVEY {s_id}]")
        print(json.dumps(s, indent=2, default=str))
        
        tokens = await db['tokens'].find({'survey_id': s_id}).to_list(100)
        print(f"Tokens in DB for this survey: {len(tokens)}")
        if tokens:
            print(f"Sample token: {tokens[0]['token']} (Status: {tokens[0]['status']})")
        
    client.close()

if __name__ == "__main__":
    asyncio.run(main())
