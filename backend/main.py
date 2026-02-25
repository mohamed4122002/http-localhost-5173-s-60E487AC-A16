from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.database import db
from backend.routers import auth, templates, surveys, tokens, public, webhook, analytics
from backend.utils.logging_utils import setup_logging, LoggingMiddleware

@asynccontextmanager
async def lifespan(app: FastAPI):
    setup_logging()
    db.connect()
    try:
        yield
    finally:
        db.close()

app = FastAPI(title="Survey Platform API", lifespan=lifespan)

# Logging Middleware
app.add_middleware(LoggingMiddleware)

# CORS
origins = [
    "http://localhost:5173",  # Vite dev server
    "http://localhost:3000",
    "http://localhost:8000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(templates.router)
app.include_router(surveys.router)
app.include_router(tokens.router)
app.include_router(public.router)
app.include_router(webhook.router)
app.include_router(analytics.router)

@app.get("/")
async def root():
    return {"message": "Survey Platform API is running"}
