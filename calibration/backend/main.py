from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from calibration.backend.routes import router


app = FastAPI(
    title="PEHRA Calibration API",
    version="0.1.0",
    description="Development API for PEHRA camera-to-seat calibration.",
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(router)


@app.get("/")
def root():
    return {
        "service": "PEHRA Calibration API",
        "status": "running",
    }


@app.get("/health")
def health():
    return {
        "status": "ok",
    }