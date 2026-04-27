from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .core.database import engine, Base
from .routers import scans_router

# Create DB tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="LLM Vulnerability Scanner API")

# Setup CORS for local React development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # allowing all for dev
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(scans_router)
