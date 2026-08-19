from fastapi import FastAPI

from calibration.p6_backend.routes import router


app = FastAPI(
    title="PEHRA P6 Calibration API",
    version="0.1.0",
)

app.include_router(router)


@app.get("/")
def root():
    return {
        "service": "PEHRA P6 Calibration API",
        "status": "running",
    }


@app.get("/health")
def health():
    return {
        "status": "ok",
    }