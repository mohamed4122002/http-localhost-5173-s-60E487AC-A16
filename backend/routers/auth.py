from datetime import timedelta
from typing import Annotated, Optional

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from jose import JWTError, jwt

from backend.config import settings
from backend.database import db
from backend.models import TokenData, User, UserCreate, UserInDB
from backend.utils.security import (
    create_access_token,
    get_password_hash,
    verify_password,
)
from backend.utils.logging_utils import logger

router = APIRouter(prefix="/auth", tags=["auth"])

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/token")


async def _get_user(username: str) -> Optional[UserInDB]:
    users_col = db.get_collection("users")
    raw = await users_col.find_one({"username": username})
    if not raw:
        return None
    return UserInDB(**raw)


async def _create_user(user_in: UserCreate) -> User:
    users_col = db.get_collection("users")

    existing = await users_col.find_one({"username": user_in.username})
    if existing:
        logger.warning(f"Signup failed: Username {user_in.username} already registered")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already registered",
        )

    hashed_pw = get_password_hash(user_in.password)
    doc = {
        "username": user_in.username,
        "email": user_in.email,
        "is_active": user_in.is_active,
        "hashed_password": hashed_pw,
        "created_at": UserInDB.model_fields["created_at"].default_factory(),
    }
    result = await users_col.insert_one(doc)
    created = await users_col.find_one({"_id": result.inserted_id})
    logger.info(f"User created successfully: {user_in.username}")
    return User(**created)


async def get_current_user(token: Annotated[str, Depends(oauth2_scheme)]) -> User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(
            token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM]
        )
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
        token_data = TokenData(username=username)
    except JWTError:
        raise credentials_exception

    user_in_db = await _get_user(token_data.username)
    if not user_in_db or not user_in_db.is_active:
        raise credentials_exception

    return User(**user_in_db.model_dump())


@router.post("/signup")
async def signup(user_in: UserCreate):
    """
    Register a new user and return an access token.
    """
    user = await _create_user(user_in)

    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.username}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}


@router.post("/token")
async def login_for_access_token(
    form_data: Annotated[OAuth2PasswordRequestForm, Depends()]
):
    """
    Authenticate a user with username & password and issue a JWT.
    If no user exists yet and credentials match ADMIN_* settings, seed the first admin.
    """
    user_in_db = await _get_user(form_data.username)

    # Seed initial admin user if database is empty and credentials match settings
    if not user_in_db and form_data.username == settings.ADMIN_USERNAME:
        # Create admin on first successful login attempt
        if form_data.password != settings.ADMIN_PASSWORD:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect username or password",
                headers={"WWW-Authenticate": "Bearer"},
            )
        seed_user = UserCreate(
            username=settings.ADMIN_USERNAME,
            email=None,
            is_active=True,
            password=settings.ADMIN_PASSWORD,
        )
        await _create_user(seed_user)
        user_in_db = await _get_user(form_data.username)

    if not user_in_db or not verify_password(
        form_data.password, user_in_db.hashed_password
    ):
        logger.warning(f"Login failure for user: {form_data.username}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    logger.info(f"User logged in: {user_in_db.username}")

    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user_in_db.username}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}


@router.get("/me", response_model=User)
async def read_users_me(current_user: Annotated[User, Depends(get_current_user)]):
    return current_user


@router.post("/logout")
async def logout():
    """
    Stateless JWT logout: the client should forget the token.
    Provided for frontend symmetry.
    """
    return {"detail": "Logged out"}
