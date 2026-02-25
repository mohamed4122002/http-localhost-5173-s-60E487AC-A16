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
    
    print("\n--- SEARCHING FOR SURVEY 670B ---")
    # Search by last 4 of hex ID or company name "Testing"
    all_surveys = await db['surveys'].find().sort('created_at', -1).to_list(10)
    for s in all_surveys:
        s_id = str(s['_id'])
        if s_id.upper().endswith("670B") or s_id.upper().endswith("670A"):
            print(f"\nFOUND MATCH: {s_id}")
            print(json.dumps(s, indent=2, default=str))
            
            tokens = await db['tokens'].find({'survey_id': s_id}).to_list(100)
            print(f"Tokens in DB: {len(tokens)}")
            break
    else:
        print("Survey with suffix 670B not found in last 10 surveys.")
        print("Last survey ID was:", str(all_surveys[0]['_id']) if all_surveys else "None")

    client.close()

if __name__ == "__main__":
    asyncio.run(main())
