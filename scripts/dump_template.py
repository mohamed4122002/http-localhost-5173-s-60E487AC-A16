import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from bson import ObjectId
import json

import os
import sys
from dotenv import load_dotenv

# Add working directory to sys.path to find backend
sys.path.append(os.getcwd())

from backend.config import settings

load_dotenv()

async def dump_template():
    client = AsyncIOMotorClient(settings.MONGO_URI)
    db = client[settings.DATABASE_NAME]
    templates_col = db.templates
    
    # Get latest template
    template = await templates_col.find_one(sort=[("created_at", -1)])
    if template:
        # Convert ObjectId to string for JSON serialization
        template['_id'] = str(template['_id'])
        if 'created_at' in template:
            template['created_at'] = template['created_at'].isoformat()
        
        print(json.dumps(template, indent=2))
    else:
        print("No templates found")

if __name__ == "__main__":
    asyncio.run(dump_template())
