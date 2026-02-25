from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
import pandas as pd
import io
from typing import List, Annotated
from datetime import datetime
from bson import ObjectId

from backend.models import Template, TemplateCreate, User
from backend.database import db
from backend.routers.auth import get_current_user

router = APIRouter(prefix="/templates", tags=["templates"])

@router.post("/", response_model=Template)
async def create_template(
    template: TemplateCreate,
    current_user: Annotated[User, Depends(get_current_user)]
):
    templates_col = db.get_collection("templates")
    
    # Ensure name is unique for first version
    existing = await templates_col.find_one({"name": template.name, "version": 1})
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Template with this name already exists"
        )
        
    new_template = Template(**template.model_dump())
    new_template.version = 1
    new_template.is_deleted = False
    
    result = await templates_col.insert_one(
        new_template.model_dump(by_alias=True, exclude=["id"])
    )
    created_template = await templates_col.find_one(
        {"_id": result.inserted_id}
    )
    return created_template

@router.get("/", response_model=List[Template])
async def list_templates(
    current_user: Annotated[User, Depends(get_current_user)]
):
    # Return latest version of each unique name that is not deleted
    pipeline = [
        {"$match": {"is_deleted": False}},
        {"$sort": {"version": -1}},
        {
            "$group": {
                "_id": "$name",
                "latest": {"$first": "$$ROOT"}
            }
        },
        {"$replaceRoot": {"newRoot": "$latest"}}
    ]
    templates_list = await db.get_collection("templates").aggregate(pipeline).to_list(1000)
    return templates_list

@router.get("/{template_id}", response_model=Template)
async def get_template(
    template_id: str,
    current_user: Annotated[User, Depends(get_current_user)]
):
    if not ObjectId.is_valid(template_id):
        raise HTTPException(status_code=400, detail="Invalid template ID")
        
    template = await db.get_collection("templates").find_one({"_id": ObjectId(template_id)})
    if template is None or template.get("is_deleted"):
        raise HTTPException(status_code=404, detail="Template not found")
    return template

@router.put("/{template_id}", response_model=Template)
async def update_template(
    template_id: str,
    template_in: TemplateCreate,
    current_user: Annotated[User, Depends(get_current_user)]
):
    if not ObjectId.is_valid(template_id):
        raise HTTPException(status_code=400, detail="Invalid template ID")
        
    templates_col = db.get_collection("templates")
    existing = await templates_col.find_one({"_id": ObjectId(template_id)})
    if not existing:
        raise HTTPException(status_code=404, detail="Template not found")

    # Find the latest version for this template name
    latest = await templates_col.find_one(
        {"name": existing["name"]},
        sort=[("version", -1)]
    )
    
    # Create a NEW document with incremented version
    new_version = latest["version"] + 1
    new_data = template_in.model_dump()
    new_data["version"] = new_version
    new_data["is_deleted"] = False
    new_data["created_at"] = datetime.utcnow()
    
    result = await templates_col.insert_one(new_data)
    updated = await templates_col.find_one({"_id": result.inserted_id})
    return updated

@router.delete("/{template_id}")
async def delete_template(
    template_id: str,
    current_user: Annotated[User, Depends(get_current_user)]
):
    if not ObjectId.is_valid(template_id):
        raise HTTPException(status_code=400, detail="Invalid template ID")
        
    templates_col = db.get_collection("templates")
    target = await templates_col.find_one({"_id": ObjectId(template_id)})
    if not target:
         raise HTTPException(status_code=404, detail="Template not found")
         
    # Soft delete ALL versions of this template name
    await templates_col.update_many(
        {"name": target["name"]},
        {"$set": {"is_deleted": True}}
    )
    
    return {"status": "success", "message": "Template and all versions soft-deleted"}
@router.post("/upload", response_model=Template)
async def upload_template(
    current_user: Annotated[User, Depends(get_current_user)],
    file: UploadFile = File(...)
):
    if not file.filename.endswith(('.xlsx', '.xls', '.csv')):
        raise HTTPException(status_code=400, detail="Invalid file format")
    
    try:
        content = await file.read()
        
        # 1. Parse Layer 1 (Screening)
        l1_questions = []
        # 1. Parse Layer 1 (Screening)
        l1_questions = []
        try:
            df_s = pd.read_excel(io.BytesIO(content), sheet_name="Screening")
            current_q = None
            
            for _, row in df_s.iterrows():
                row_vals = [str(x).strip() for x in row.values if str(x) != 'nan']
                if not row_vals: continue
                
                # Detect Code (S1, D1, etc.)
                code = ""
                text = ""
                for i, val in enumerate(row_vals):
                    if (val.startswith(('S', 'D', 'Q')) and any(c.isdigit() for c in val) and len(val) <= 5):
                        code = val
                        # Heuristic: the first "long" string after the code is the label
                        for j in range(i + 1, len(row_vals)):
                            if len(row_vals[j]) > 5:
                                text = row_vals[j]
                                break
                        break
                
                if code:
                    if current_q: l1_questions.append(current_q)
                    current_q = {"id": code, "label": text, "options": [], "type": "mcq"}
                    # Heuristic for age: if label contains age, type is age
                    if "age" in text.lower() or "سن" in text:
                        current_q["type"] = "age"
                elif current_q and row_vals:
                    # Potential options or more label text
                    for v in row_vals:
                        if v and v not in [current_q["id"], current_q["label"], "Instructions"]:
                            if len(v) < 50: # Likely an option, not another question
                                if v not in current_q["options"]:
                                    current_q["options"].append(v)
            
            if current_q: l1_questions.append(current_q)
        except Exception as e:
            from backend.utils.logging_utils import logger
            logger.error(f"Screening parse failed: {str(e)}")
            pass

        # 2. Parse Layer 2 (Evaluation Sheets)
        l2_structure = {"sections": []}
        evaluation_sheets = [
            'Product Attribute (Taste Test)', 
            'Purchase Intention', 
            'Overall Evaluation', 
            'Awareness & Usage Module',
            'Shopping Behavior'
        ]
        
        for sheet in evaluation_sheets:
            try:
                df_p = pd.read_excel(io.BytesIO(content), sheet_name=sheet)
                section = {"title": sheet, "questions": []}
                
                # Heuristic for question detection:
                # Often questions are in columns with specific names or patterns
                for _, row in df_p.iterrows():
                    row_data = [str(x) for x in row.values if str(x) != 'nan']
                    if not row_data: continue
                    
                    # Detect Question Code (e.g., Q1, PI1, OE1)
                    code = ""
                    text = ""
                    
                    # Search for code in columns 0-8
                    for i in range(min(len(row), 10)):
                        val = str(row.iloc[i])
                        if val.startswith(('Q', 'PI', 'OE', 'AU', 'SB')) and any(c.isdigit() for c in val):
                            code = val
                            # Usually text follows a few columns later
                            for j in range(i + 1, len(row)):
                                t_val = str(row.iloc[j])
                                if t_val and t_val != 'nan' and len(t_val) > 10: # Long enough to be a question
                                    text = t_val
                                    break
                            break
                    
                    if code and text:
                        section["questions"].append({
                            "id": f"{sheet}_{code}",
                            "text": text,
                            "type": "scale" if "مدى" in text or "scale" in text.lower() else "mcq",
                            "options": ["1", "2", "3", "4", "5"]
                        })
                
                if section["questions"]:
                    l2_structure["sections"].append(section)
            except Exception:
                continue

        # 3. Create Template
        new_template = Template(
            name=f"Imported: {file.filename.split('.')[0]}",
            type="taste_test",
            version=1,
            layer1_questions=l1_questions,
            layer1_structure={"sections": [{"title": "Screening", "questions": l1_questions}]} if l1_questions else {"sections": []},
            layer1_question_schema={}, # Can be generated if needed
            layer2_structure=l2_structure,
            created_at=datetime.utcnow()
        )
        
        templates_col = db.get_collection("templates")
        result = await templates_col.insert_one(
            new_template.model_dump(by_alias=True, exclude=["id"])
        )
        created = await templates_col.find_one({"_id": result.inserted_id})
        return created

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to parse file: {str(e)}")

@router.get("/history/{name}", response_model=List[Template])
async def get_template_history(
    name: str,
    current_user: Annotated[User, Depends(get_current_user)]
):
    templates = await db.get_collection("templates")\
        .find({"name": name, "is_deleted": False})\
        .sort("version", -1)\
        .to_list(100)
    return templates

@router.post("/rollback/{template_id}", response_model=Template)
async def rollback_template(
    template_id: str,
    current_user: Annotated[User, Depends(get_current_user)]
):
    if not ObjectId.is_valid(template_id):
        raise HTTPException(status_code=400, detail="Invalid template ID")
        
    templates_col = db.get_collection("templates")
    # Get the target version to rollback TO
    target = await templates_col.find_one({"_id": ObjectId(template_id)})
    if not target:
        raise HTTPException(status_code=404, detail="Source version not found")
        
    # Find the current LATEST version to get the next version number
    latest = await templates_col.find_one(
        {"name": target["name"]},
        sort=[("version", -1)]
    )
    
    # Create a NEW document (e.g., if target is v2 and latest is v4, new is v5 which is a copy of v2)
    new_version = latest["version"] + 1
    new_data = target.copy()
    del new_data["_id"]
    new_data["version"] = new_version
    new_data["created_at"] = datetime.utcnow()
    # Ensure it's not marked as deleted
    new_data["is_deleted"] = False
    
    result = await templates_col.insert_one(new_data)
    rolled_back = await templates_col.find_one({"_id": result.inserted_id})
    return rolled_back
