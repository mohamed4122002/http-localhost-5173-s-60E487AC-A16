from fastapi import APIRouter, Depends, HTTPException
from typing import Annotated, Dict, Any, List
from bson import ObjectId
from datetime import datetime, timedelta

from backend.models import User
from backend.database import db
from backend.routers.auth import get_current_user

router = APIRouter(prefix="/analytics", tags=["analytics"])

@router.get("/funnel/{survey_id}")
async def get_funnel_analytics(
    survey_id: str,
    current_user: Annotated[User, Depends(get_current_user)]
):
    if not ObjectId.is_valid(survey_id):
        raise HTTPException(status_code=400, detail="Invalid survey ID")
        
    pipeline = [
        {"$match": {"survey_id": survey_id}},
        {
            "$group": {
                "_id": "$status",
                "count": {"$sum": 1}
            }
        }
    ]
    
    results = await db.get_collection("tokens").aggregate(pipeline).to_list(100)
    
    stats = {
        "unused": 0,
        "passed": 0,
        "failed": 0,
        "submitted": 0,
        "total": 0
    }
    
    for item in results:
        status_val = item["_id"]
        count = item["count"]
        if status_val in stats:
            stats[status_val] = count
            stats["total"] += count
            
    # Calculate Rates
    total_engaged = stats["passed"] + stats["failed"]
    stats["qualification_rate"] = (stats["passed"] / total_engaged * 100) if total_engaged > 0 else 0
    stats["completion_rate"] = (stats["submitted"] / stats["passed"] * 100) if stats["passed"] > 0 else 0
    stats["drop_off_rate"] = ((stats["passed"] - stats["submitted"]) / stats["passed"] * 100) if stats["passed"] > 0 else 0
    
    return stats

@router.get("/trends/{survey_id}")
async def get_survey_trends(
    survey_id: str,
    current_user: Annotated[User, Depends(get_current_user)],
    days: int = 30
):
    if not ObjectId.is_valid(survey_id):
        raise HTTPException(status_code=400, detail="Invalid survey ID")
        
    start_date = datetime.utcnow() - timedelta(days=days)
    
    pipeline = [
        {
            "$match": {
                "survey_id": survey_id,
                "created_at": {"$gte": start_date}
            }
        },
        {
            "$project": {
                "day": {"$dateToString": {"format": "%Y-%m-%d", "date": "$created_at"}},
                "status": 1
            }
        },
        {
            "$group": {
                "_id": "$day",
                "submissions": {"$sum": {"$cond": [{"$eq": ["$status", "submitted"]}, 1, 0]}},
                "passed": {"$sum": {"$cond": [{"$eq": ["$status", "passed"]}, 1, 0]}},
                "failed": {"$sum": {"$cond": [{"$eq": ["$status", "failed"]}, 1, 0]}}
            }
        },
        {"$sort": {"_id": 1}}
    ]
    
    trends = await db.get_collection("tokens").aggregate(pipeline).to_list(100)
    
    for day in trends:
        total_attempts = day["passed"] + day["failed"]
        day["pass_rate"] = (day["passed"] / total_attempts * 100) if total_attempts > 0 else 0
        
    return trends

@router.get("/orphans")
async def get_orphan_summary(
    current_user: Annotated[User, Depends(get_current_user)]
):
    pipeline = [
        {
            "$group": {
                "_id": "$reason",
                "count": {"$sum": 1},
                "latest_attempt": {"$max": "$timestamp"}
            }
        },
        {"$sort": {"count": -1}}
    ]
    
    orphans = await db.get_collection("orphan_submissions").aggregate(pipeline).to_list(100)
    total_orphans = sum(item["count"] for item in orphans)
    
    return {
        "total_attempts": total_orphans,
        "categories": orphans
    }

@router.get("/orphans/{reason}")
async def get_orphan_details(
    reason: str,
    current_user: Annotated[User, Depends(get_current_user)],
    limit: int = 10
):
    logs = await db.get_collection("orphan_submissions")\
        .find({"reason": reason})\
        .sort("timestamp", -1)\
        .limit(limit)\
        .to_list(limit)
        
    # Convert ObjectIds to strings for JSON
    for log in logs:
        log["_id"] = str(log["_id"])
        if "timestamp" in log and isinstance(log["timestamp"], datetime):
            log["timestamp"] = log["timestamp"].isoformat()
            
    return logs
