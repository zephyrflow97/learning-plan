"""
API Router - aggregate all route modules
"""
from fastapi import APIRouter

api_router = APIRouter()

# Import and include sub-routers here
# from src.api.datasets import router as datasets_router
# from src.api.analysis import router as analysis_router
# from src.api.auth import router as auth_router
# api_router.include_router(auth_router, prefix="/auth", tags=["Auth"])
# api_router.include_router(datasets_router, prefix="/datasets", tags=["Datasets"])
# api_router.include_router(analysis_router, prefix="/analysis", tags=["Analysis"])


@api_router.get("/")
async def root() -> dict:
    return {"message": "Data Analytics Platform API v1"}
