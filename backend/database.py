from motor.motor_asyncio import AsyncIOMotorClient
from backend.config import settings

class Database:
    client: AsyncIOMotorClient = None
    db = None

    def connect(self):
        self.client = AsyncIOMotorClient(settings.MONGO_URI)
        self.db = self.client[settings.DATABASE_NAME]

    def close(self):
        self.client.close()

    def get_collection(self, collection_name: str):
        return self.db[collection_name]

db = Database()
