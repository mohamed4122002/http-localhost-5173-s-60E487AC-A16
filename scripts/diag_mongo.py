import asyncio
import certifi
from motor.motor_asyncio import AsyncIOMotorClient
import sys
import os

# Set working directory to project root
os.chdir(r"d:\Questioner")

from dotenv import load_dotenv

load_dotenv()

# Use environment variable for MONGO_URI
MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017")

async def test_connection(use_certifi=False, allow_insecure=False):
    print(f"\nTesting connection with use_certifi={use_certifi}, allow_insecure={allow_insecure}...")
    kwargs = {}
    if use_certifi:
        kwargs['tlsCAFile'] = certifi.where()
    if allow_insecure:
        kwargs['tlsAllowInvalidCertificates'] = True
    
    client = AsyncIOMotorClient(MONGO_URI, **kwargs)
    try:
        # The ismaster command is cheap and does not require auth.
        await client.admin.command('ismaster')
        print("✅ Connection successful!")
        return True
    except Exception as e:
        print(f"❌ Connection failed: {e}")
        return False
    finally:
        client.close()

async def main():
    # Test 1: Default
    if await test_connection():
        print("Default connection works. No changes needed?")
        return

    # Test 2: With Certifi
    if await test_connection(use_certifi=True):
        print("Connection works with certifi. Suggesting fix.")
        return

    # Test 3: Insecure (Diagnostic only)
    if await test_connection(allow_insecure=True):
        print("Connection works with tlsAllowInvalidCertificates. SSL issue confirmed.")
        return

    print("All connection attempts failed.")

if __name__ == "__main__":
    asyncio.run(main())
