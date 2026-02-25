from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel
from typing import Dict, Any, List
from bson import ObjectId
from datetime import datetime

from backend.database import db
from backend.models import Token, Survey, Response

router = APIRouter(prefix="/s", tags=["public"])

class Layer1Response(BaseModel):
    answers: Dict[str, Any]
    phone: str

def extract_layer1_questions(doc: dict) -> list:
    """Robustly extract questions from both legacy and structured template formats."""
    questions = doc.get("layer1_questions", [])
    if not isinstance(questions, list): questions = []
    
    l1_struct = doc.get("layer1_structure", {})
    if isinstance(l1_struct, dict):
        # 1. Try nested sections (standard for imported templates)
        sections = l1_struct.get("sections", [])
        if sections and isinstance(sections, list):
            for section in sections:
                if isinstance(section, dict):
                    qs = section.get("questions", [])
                    if isinstance(qs, list):
                        for q in qs:
                            if q not in questions: questions.append(q)
        
        # 2. Try direct questions in structure
        struct_qs = l1_struct.get("questions", [])
        if struct_qs and isinstance(struct_qs, list):
            for q in struct_qs:
                if q not in questions: questions.append(q)
                
    # Deduplicate by ID to be safe
    seen = set()
    deduped = []
    for q in questions:
        qid = q.get("id") or str(q.get("label"))
        if qid not in seen:
            seen.add(qid)
            deduped.append(q)
    return deduped

@router.get("/{token}")
async def get_survey_by_token(token: str):
    token_doc = await db.get_collection("tokens").find_one({"token": token})
    
    if not token_doc:
        raise HTTPException(status_code=404, detail="Invalid token")
    
    if token_doc["status"] == "submitted":
        raise HTTPException(status_code=403, detail="Survey already completed for this link")
    
    if token_doc["status"] == "failed":
        raise HTTPException(status_code=403, detail="Validation failed for this link")
    
    survey_id = token_doc["survey_id"]
    survey = await db.get_collection("surveys").find_one({"_id": ObjectId(survey_id)})
    
    if not survey:
        raise HTTPException(status_code=404, detail="Survey not found")
    
    # Fetch template for fallback and name
    template_doc = await db.get_collection("templates").find_one({"_id": ObjectId(survey["template_id"])})
    
    # Robust question extraction with fallback to template
    questions = survey.get("template_snapshot_questions", [])
    if not questions and template_doc:
        from backend.utils.logging_utils import logger
        logger.info(f"Gateway fallback: extracting questions from template {template_doc.get('name')} for survey {survey_id}")
        questions = extract_layer1_questions(template_doc)
            
    schema = survey.get("template_snapshot_schema", {})
    if not schema and template_doc:
        schema = template_doc.get("layer1_question_schema", {})
        if not schema and "layer1_structure" in template_doc:
            schema = template_doc["layer1_structure"].get("schema", {})

    # Return Layer 1 configuration
    # AUTO-INJECT: If rules require Age/Gender but they aren't in questions, add them
    rules = survey.get("layer1_rules", {})
    
    # DEFAULT RESPONDENT QUESTIONS
    default_qs = [
        {"id": "name", "label": "Full Name", "type": "text", "required": True},
        {"id": "age_auto", "label": "Age Range", "type": "mcq", "options": ["12-18", "19-25", "26-40", "41-60"], "required": True},
        {"id": "gender_auto", "label": "Gender", "type": "mcq", "options": ["Male", "Female"], "required": True},
        {"id": "area", "label": "Area", "type": "text", "required": True, "suggestions": ["Cairo, Egypt", "Giza, Egypt", "Dammam, KSA"]},
        {"id": "email", "label": "Email Address", "type": "email", "required": True}
    ]
    
    # Inject missing default questions
    for dq in reversed(default_qs):
        dq_id = dq["id"]
        # Check if a question with similar ID or label already exists
        exists = any(
            dq_id in (q.get("id", "").lower()) or 
            dq["label"].lower().replace(" ", "") in (q.get("label", "").lower().replace(" ", ""))
            for q in questions
        )
        if not exists:
            questions.insert(0, dq)

    # Fallback for empty labels and Layer 2 extraction
    for q in questions:
        if not q.get("label"):
            q["label"] = f"Question {q.get('id', '')}"

    l2_content = survey.get("template_snapshot_l2", {})
    if not l2_content and template_doc:
        l2_content = template_doc.get("layer2_structure", {})

    return {
        "company_name": survey["company_name"],
        "customizations": survey["customizations"],
        "layer1_rules": rules,
        "template_name": template_doc.get("name") if template_doc else "Active Study",
        "questions": questions,
        "layer2_questions": l2_content,
        "schema": schema,
        "google_form_url": survey.get("google_form_url")
    }

@router.post("/{token}/layer2")
async def submit_layer2(token: str, answers: Dict[str, Any]):
    token_doc = await db.get_collection("tokens").find_one({"token": token})
    if not token_doc:
        raise HTTPException(status_code=404, detail="Invalid token")
    
    if token_doc["status"] == "submitted":
        raise HTTPException(status_code=403, detail="Survey already completed")
        
    # Create the response document
    response_doc = {
        "survey_id": token_doc["survey_id"],
        "token": token,
        "phone": token_doc.get("phone"),
        "answers": answers,
        "source": "in_app_gateway",
        "submitted_at": datetime.utcnow()
    }
    
    await db.get_collection("responses").insert_one(response_doc)
    
    # Update token status to submitted
    from backend.services.token_service import token_service
    await token_service.update_token_status(token, "submitted")
    
    return {"status": "success", "message": "Evaluation submitted successfully"}

@router.post("/{token}/layer1")
async def submit_layer1(token: str, response: Layer1Response):
    token_doc = await db.get_collection("tokens").find_one({"token": token})
    
    if not token_doc:
        raise HTTPException(status_code=404, detail="Invalid token")
    
    if token_doc["status"] == "submitted":
        raise HTTPException(status_code=403, detail="Survey already completed")
    
    if token_doc["status"] == "failed":
        raise HTTPException(status_code=403, detail="Validation failed for this link")
    
    survey_id = token_doc["survey_id"]
    survey = await db.get_collection("surveys").find_one({"_id": ObjectId(survey_id)})
    
    if not survey:
        raise HTTPException(status_code=404, detail="Survey not found")
    
    # Validate Layer 1 against Template "Correct Answers"
    questions = survey.get("template_snapshot_questions", [])
    answers = response.answers
    phone = response.phone
    passed = True
    fail_reason = ""
    
    from backend.utils.logging_utils import logger
    logger.info(f"--- VALIDATING LAYER 1 | Token: {token} | Answers: {answers} ---")
    
    # Iterate through all questions that have a defined correct_answer
    for q in questions:
        q_id = q.get("id")
        correct_val = q.get("correct_answer")
        
        if correct_val is not None:
            user_val = answers.get(q_id)
            if user_val != correct_val:
                passed = False
                fail_reason = f"Question {q_id}: expected '{correct_val}', got '{user_val}'"
                break
            
    if not passed:
        logger.warning(f"Validation FAILED for token {token}: {fail_reason}")
        # Mark token as failed
        await db.get_collection("tokens").update_one(
            {"_id": token_doc["_id"]},
            {"$set": {"status": "failed", "layer1_passed": False, "phone": phone}}
        )
        return {"passed": False, "message": "You do not qualify for this study."}
    
    logger.info(f"Validation PASSED for token {token}")
    
    # Mark token as passed (but still unused until they submit Layer 2)
    # Actually, the requirement says "Token marked as failed" if failed.
    # If passes, redirect to Google Form.
    # Token is marked as used when Google Form submits via webhook.
    
    # Update phone number and transition to 'passed'
    from backend.services.token_service import token_service
    await token_service.update_token_status(token, "passed")
    await db.get_collection("tokens").update_one(
        {"token": token},
        {"$set": {"phone": response.phone}}
    )
    
    # Construct Google Form URL with prefilled token
    # Assuming the Google Form has a prefilled entry for token
    # URL format: https://docs.google.com/forms/d/e/ID/viewform?entry.123456=TOKEN
    google_form_url = survey["google_form_url"]
    
    # --- STORE RESPONDENT DATA ---
    try:
        # Save L1 answers as a response record
        await db.get_collection("responses").insert_one({
            "survey_id": survey_id,
            "token": token,
            "phone": phone,
            "answers": answers,
            "source": "layer1",
            "submitted_at": datetime.utcnow()
        })
        
        # Upsert Respondent record
        respondent_data = {
            "phone": phone,
            "name": answers.get("name") or answers.get("Full Name"),
            "email": answers.get("email") or answers.get("Email Address"),
            "age_range": answers.get("Age Range") or answers.get("age_auto"),
            "area": answers.get("area") or answers.get("Area"),
            "gender": answers.get("gender") or answers.get("gender_auto") or answers.get("Gender"),
            "updated_at": datetime.utcnow()
        }
        
        # Clean None/0 values
        respondent_data = {k: v for k, v in respondent_data.items() if v}
        
        await db.get_collection("respondents").update_one(
            {"phone": phone},
            {
                "$set": respondent_data,
                "$setOnInsert": {"created_at": datetime.utcnow()}
            },
            upsert=True
        )
    except Exception as e:
        logger.error(f"Failed to store respondent data: {e}")

    return {
        "passed": True,
        "google_form_url": google_form_url,
        "token": token
    }
