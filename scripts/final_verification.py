import os
from dotenv import load_dotenv

load_dotenv()

BASE_URL = os.getenv("BASE_URL", "http://127.0.0.1:8003")
ADMIN_USER = os.getenv("ADMIN_USERNAME", "admin")
ADMIN_PASS = os.getenv("ADMIN_PASSWORD", "admin123")

async def test_final_compliance():
    async with httpx.AsyncClient(timeout=30.0) as client:
        # 1. Login
        print("--- Testing Auth ---")
        login_res = await client.post(f"{BASE_URL}/auth/token", data={"username": ADMIN_USER, "password": ADMIN_PASS})
        if login_res.status_code != 200:
            print(f"Login failed: {login_res.status_code}")
            print(login_res.text)
            return
        token = login_res.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}
        print("Portal Access: OK")

        # 2. Setup Test Data (Template & Survey)
        print("\n--- Setting up Test Data ---")
        tpl_name = f"Verify_Tpl_{int(datetime.now().timestamp())}"
        tpl_res = await client.post(f"{BASE_URL}/templates/", json={
            "name": tpl_name, "type": "taste_test", "layer1_questions": [{"id": "age", "label": "Age", "type": "number"}]
        }, headers=headers)
        tpl_data = tpl_res.json()
        tpl_id = tpl_data["_id"]
        print(f"Template Created: {tpl_id}")

        srv_res = await client.post(f"{BASE_URL}/surveys/", json={
            "company_name": "Verification Corp",
            "template_id": tpl_id,
            "google_form_id": "mock_id",
            "google_form_url": "https://docs.google.com/forms/mock",
            "layer1_rules": {"age_min": 18}
        }, headers=headers)
        if srv_res.status_code != 200:
            print(f"Survey creation failed: {srv_res.status_code}")
            print(srv_res.text)
            return
        srv_data = srv_res.json()
        survey_id = srv_data["_id"]
        print(f"Survey Created: {survey_id}")

        # 3. Bulk Token Ops (Test Batching)
        print("\n--- Testing Bulk Token Ops ---")
        print(f"Generating 20 tokens (Batch 1)...")
        await client.post(f"{BASE_URL}/tokens/generate", json={"survey_id": survey_id, "count": 10}, headers=headers)
        
        print("Generating 20 tokens (Batch 2)...")
        await client.post(f"{BASE_URL}/tokens/generate", json={"survey_id": survey_id, "count": 10}, headers=headers)
        
        # List tokens with pagination
        tokens_res = await client.get(f"{BASE_URL}/tokens/survey/{survey_id}?page=1&page_size=5", headers=headers)
        if tokens_res.status_code != 200:
            print(f"Tokens listing failed: {tokens_res.status_code}")
            print(f"Response text: {tokens_res.text}")
            return
            
        try:
            data = tokens_res.json()
            print(f"Pagination Check: Items={len(data['items'])}, Total={data['total']}, Page={data['page']}")
        except Exception as e:
            print(f"Failed to parse tokens JSON: {e}")
            print(f"Response content: {tokens_res.text}")
            return
        
        # 4. Template Rollback Integrity
        print("\n--- Testing Template Rollback Integrity ---")
        # Update to V2
        await client.put(f"{BASE_URL}/templates/{tpl_id}", json={
            "name": tpl_name, "type": "taste_test", "layer1_questions": [{"id": "age", "label": "V2"}]
        }, headers=headers)
        print("Template V2 Updated")

        # Get History
        hist_res = await client.get(f"{BASE_URL}/templates/history/{tpl_name}", headers=headers)
        history = hist_res.json()
        print(f"History Count: {len(history)}")
        
        # Rollback to V1 (tpl_id is v1)
        rollback_res = await client.post(f"{BASE_URL}/templates/rollback/{tpl_id}", headers=headers)
        tpl_v3 = rollback_res.json()
        print(f"Rolled back! New Version: {tpl_v3['version']}")
        print(f"Content Check: {tpl_v3['layer1_questions'][0]['label']} (Expected: Age)")

        # 5. Orphan Logs
        print("\n--- Testing Orphan Log Visibility ---")
        orphans_res = await client.get(f"{BASE_URL}/analytics/orphans", headers=headers)
        print(f"Orphan Summary: {orphans_res.json()['total_attempts']} attempts found.")
        print("\nVerification Complete!")

if __name__ == "__main__":
    asyncio.run(test_final_compliance())
