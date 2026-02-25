import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from backend.config import settings

async def create_indexes():
    client = AsyncIOMotorClient(settings.MONGO_URI)
    db = client[settings.DATABASE_NAME]
    
    # Templates Indexes
    templates_col = db.get_collection("templates")
    await templates_col.create_index([("name", 1), ("version", 1)], unique=True)
    await templates_col.create_index("is_deleted")
    
    # Tokens Indexes
    tokens_col = db.get_collection("tokens")
    await tokens_col.create_index("token", unique=True)
    await tokens_col.create_index("status")
    await tokens_col.create_index("survey_id")
    await tokens_col.create_index("created_at")
    await tokens_col.create_index("last_accessed")
    
    # Surveys Indexes
    surveys_col = db.get_collection("surveys")
    await surveys_col.create_index("template_id")
    await surveys_col.create_index("status")

    # Orphan Submissions Indexes
    orphans_col = db.get_collection("orphan_submissions")
    await orphans_col.create_index("timestamp")
    await orphans_col.create_index("reason")

    # Respondents Indexes
    respondents_col = db.get_collection("respondents")
    await respondents_col.create_index("phone", unique=True)
    await respondents_col.create_index("created_at")
    
    print("Successfully created MongoDB indexes.")
    client.close()

if __name__ == "__main__":
    asyncio.run(create_indexes())
