import asyncio
import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import auth, sniper
from app.services.worker import worker_loop

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Start campaign worker on boot; cancel it cleanly on shutdown."""
    task = asyncio.create_task(worker_loop(), name="campaign-worker")
    logger.info("[Startup] Campaign worker task created")
    try:
        yield
    finally:
        task.cancel()
        try:
            await task
        except asyncio.CancelledError:
            pass
        logger.info("[Shutdown] Campaign worker stopped")


app = FastAPI(
    title="Astraventa FB Sniper API",
    description="Multi-tenant SaaS automation platform for Facebook interactions",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origin_regex=".*",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(sniper.router, prefix="/api/sniper", tags=["sniper"])

@app.get("/")
async def root():
    return {"message": "Astraventa FB Sniper API", "status": "operational"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}
