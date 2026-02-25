import os
from dotenv import load_dotenv

load_dotenv()

BASE_URL = os.getenv("BASE_URL", "http://localhost:8003")

def test_survey_creation():
    # 1. Login to get token
    login_data = {
        "username": os.getenv("ADMIN_USERNAME", "admin"),
        "password": os.getenv("ADMIN_PASSWORD", "admin123")
    }
    # If login fails, we'll try to find a user or skip auth if possible
    # But usually it's better to just check the DB after a manual creation if I can't login
    pass

async def check_db_directly():
    # Since I don't have the user's password easily, I'll just check the DB 
    # for ANY survey created in the last 60 seconds and see if it has tokens.
    import asyncio
    from motor.motor_asyncio import AsyncIOMotorClient
    import os
    import sys
    from datetime import datetime, timedelta

    sys.path.append(os.getcwd())
    from backend.config import settings

    client = AsyncIOMotorClient(settings.MONGO_URI)
    db = client[settings.DATABASE_NAME]
    
    now = datetime.utcnow()
    one_min_ago = now - timedelta(minutes=1)
    
    print(f"Checking for surveys created after {one_min_ago}")
    surveys = await db['surveys'].find({'created_at': {'$gt': one_min_ago}}).to_list(10)
    
    if not surveys:
        print("No new surveys found yet.")
    else:
        for s in surveys:
            print(f"Survey {s['_id']} | Tokens: {len(s.get('generated_tokens', []))}")
            
    client.close()

if __name__ == "__main__":
    import asyncio
    asyncio.run(check_db_directly())
