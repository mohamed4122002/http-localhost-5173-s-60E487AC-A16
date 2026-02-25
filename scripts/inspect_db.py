import asyncio
import os
import sys
from bson import ObjectId

# Add current directory to path
sys.path.append(os.getcwd())

from backend.database import db

async def inspect():
    # Initialize connection
    db.connect()
    
    # 1. Check Standard Template
    template = await db.get_collection('templates').find_one({'name': 'Standard'})
    print("--- STANDARD TEMPLATE ---")
    if template:
        print(f"ID: {template['_id']}")
        # Check both fields
        print(f"Questions (L1 - Field): {template.get('layer1_questions')}")
        print(f"Structure (L1 - Dict): {template.get('layer1_structure')}")
        l1_struct = template.get('layer1_structure', {})
        if l1_struct:
             print(f"Questions inside Structure: {l1_struct.get('questions')}")
    else:
        print("Standard template not found")

    # 2. Check Specific Survey (from Screenshot)
    # The screenshot shows ID suffix 4C2566E8
    print("\n--- RECENT SURVEYS ---")
    surveys = await db.get_collection('surveys').find().sort('created_at', -1).to_list(10)
    for s in surveys:
        sid_str = str(s['_id']).upper()
        print(f"Survey ID: {s['_id']} (Suffix: {sid_str[-8:]}), Company: {s.get('company_name')}")
        print(f"Status: {s.get('status')}")
        print(f"Generated Tokens Count: {len(s.get('generated_tokens', []))}")
        print(f"Snapshot Questions Count: {len(s.get('template_snapshot_questions', []))}")
        print(f"Link Count Field: {s.get('link_count')}")
        print("---")

    db.close()

if __name__ == "__main__":
    asyncio.run(inspect())
