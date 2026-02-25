from pydantic import BaseModel, Field, EmailStr, BeforeValidator, ConfigDict, field_validator
from typing import List, Optional, Dict, Any, Annotated
from datetime import datetime
from bson import ObjectId

# Custom type for ObjectId
PyObjectId = Annotated[str, BeforeValidator(str)]


class MongoBaseModel(BaseModel):
    id: Optional[PyObjectId] = Field(alias="_id", default=None)

    model_config = ConfigDict(
        populate_by_name=True,
        arbitrary_types_allowed=True,
        json_encoders={ObjectId: str},
    )


# Template Models
class TemplateBase(BaseModel):
    name: str
    type: str  # e.g., "taste_test"
    version: int = 1
    is_deleted: bool = False
    layer1_question_schema: Dict[str, Any] = Field(default_factory=dict)  # JSON schema for answers
    layer1_questions: List[Dict[str, Any]] = Field(default_factory=list)  # UI definition for L1 questions (deprecated: use layer1_structure)
    layer1_structure: Dict[str, Any] = Field(default_factory=dict) # New structured L1
    layer2_structure: Dict[str, Any] = Field(default_factory=dict)


class TemplateCreate(TemplateBase):
    pass


class Template(TemplateBase, MongoBaseModel):
    created_at: datetime = Field(default_factory=datetime.utcnow)


# Survey Models
class Customization(BaseModel):
    brands: List[str] = []
    category: str = ""
    modified_questions: List[Dict[str, Any]] = []


class Layer1Rules(BaseModel):
    gender: Optional[str] = None
    age_min: Optional[int] = None
    age_max: Optional[int] = None
    extra_conditions: List[Dict[str, Any]] = []


class SurveyBase(BaseModel):
    company_name: str
    template_id: str
    template_version: int
    template_snapshot_schema: Dict[str, Any]
    template_snapshot_questions: List[Dict[str, Any]]
    customizations: Customization
    layer1_rules: Layer1Rules
    google_form_id: str
    google_form_url: str
    status: str = "draft" # draft, active, closed
    link_count: int = 0
    template_snapshot_l2: Optional[Dict[str, Any]] = None
    generated_tokens: Optional[List[str]] = None
    is_deleted: bool = False


class SurveyCreate(BaseModel):
    company_name: str
    template_id: str
    customizations: Customization = Field(default_factory=Customization)
    layer1_rules: Layer1Rules = Field(default_factory=Layer1Rules)
    google_form_id: str
    google_form_url: str
    link_count: int = 0


class SurveyUpdate(BaseModel):
    company_name: Optional[str] = None
    customizations: Optional[Customization] = None
    layer1_rules: Optional[Layer1Rules] = None
    google_form_id: Optional[str] = None
    google_form_url: Optional[str] = None
    status: Optional[str] = None # draft, active, closed
    is_deleted: Optional[bool] = None


class Survey(SurveyBase, MongoBaseModel):
    created_at: datetime = Field(default_factory=datetime.utcnow)


# Token Models
class TokenBase(BaseModel):
    survey_id: str
    token: str
    phone: Optional[str] = None
    status: str = "unused"  # unused, passed, failed, submitted
    layer1_passed: bool = False
    batch_id: Optional[str] = None
    created_by: Optional[str] = None
    last_accessed: Optional[datetime] = None
    expires_at: Optional[datetime] = None


class TokenCreate(BaseModel):
    survey_id: str
    count: int


class Token(TokenBase, MongoBaseModel):
    created_at: datetime = Field(default_factory=datetime.utcnow)


class TokenBulkUpdate(BaseModel):
    token_ids: List[str]
    status: Optional[str] = None
    expires_at: Optional[datetime] = None


# Response Models
class ResponseBase(BaseModel):
    survey_id: str
    token: str
    phone: Optional[str] = None
    answers: Dict[str, Any]
    source: str = "layer2"  # layer1 or layer2


class Response(ResponseBase, MongoBaseModel):
    submitted_at: datetime = Field(default_factory=datetime.utcnow)


# User/Auth
class UserBase(BaseModel):
    username: str
    email: Optional[EmailStr] = None
    is_active: bool = True

    @field_validator("email", mode="before")
    @classmethod
    def empty_str_to_none(cls, v: Any) -> Any:
        if v == "":
            return None
        return v


class UserCreate(UserBase):
    password: str


class UserInDB(UserBase, MongoBaseModel):
    hashed_password: str
    created_at: datetime = Field(default_factory=datetime.utcnow)


class User(UserBase, MongoBaseModel):
    created_at: datetime = Field(default_factory=datetime.utcnow)


class TokenData(BaseModel):
    username: Optional[str] = None


# Respondent/Client Models
class Respondent(MongoBaseModel):
    name: str
    phone: str  # Unique identifier
    email: Optional[EmailStr] = None
    age: Optional[int] = None
    area: Optional[str] = None
    gender: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
