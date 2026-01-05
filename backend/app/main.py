from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
import logging
from app.core.config import settings
from app.api import auth, cases, dcas, admin, reports, webhooks

# Configure logging
logging.basicConfig(
    level=settings.LOG_LEVEL,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler(settings.LOG_FILE),
        logging.StreamHandler()
    ]
)

logger = logging.getLogger(__name__)

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="AI-powered Debt Collection Agency Management Platform",
    version="1.0.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Security Middleware
app.add_middleware(
    TrustedHostMiddleware,
    allowed_hosts=["*"]  # Configure properly in production
)

# Include API routers
app.include_router(auth.router, prefix="/api/v1/auth", tags=["authentication"])
app.include_router(cases.router, prefix="/api/v1/cases", tags=["cases"])
app.include_router(dcas.router, prefix="/api/v1/dcas", tags=["dcas"])
app.include_router(admin.router, prefix="/api/v1/admin", tags=["admin"])
app.include_router(reports.router, prefix="/api/v1/reports", tags=["reports"])
app.include_router(webhooks.router, prefix="/api/v1/webhooks", tags=["webhooks"])

@app.on_event("startup")
async def startup_event():
    """Initialize services on startup"""
    logger.info("Starting RecoverAI Pro Backend...")
    
    # Initialize database
    from app.core.database import engine
    from app.models import user, case, dca, audit, sla
    
    # Create tables (in production, use Alembic migrations)
    # Base.metadata.create_all(bind=engine)
    
    # Initialize AI models
    from app.ml.scoring_model import ScoringModel
    ScoringModel.initialize()
    
    logger.info("RecoverAI Pro Backend started successfully")

@app.on_event("shutdown")
async def shutdown_event():
    """Cleanup on shutdown"""
    logger.info("Shutting down RecoverAI Pro Backend...")

@app.get("/")
def root():
    return {
        "status": "running",
        "service": "RecoverAI Pro Backend",
        "version": "1.0.0",
        "docs": "/api/docs",
        "health": "/api/health"
    }

@app.get("/api/health")
def health_check():
    """Health check endpoint for load balancers"""
    return {
        "status": "healthy",
        "timestamp": "2024-01-15T10:30:00Z",
        "service": "recoverai-backend"
    }

# Start workflow scheduler (from your existing code)
try:
    from app.services.workflow_scheduler import start_scheduler
    start_scheduler()
except ImportError as e:
    logger.warning(f"Workflow scheduler not available: {e}")