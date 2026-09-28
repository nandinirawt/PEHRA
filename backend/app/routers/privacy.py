from fastapi import APIRouter

router = APIRouter(prefix="/api/privacy", tags=["Privacy"])

@router.get("/status")
def get_privacy_status():
    return {
        "face_recognition": "Disabled",
        "cloud_processing": "Disabled",
        "identifiable_video_transmission": "Disabled",
        "local_processing": "Active",
        "identity_data": "Not required",
        "data_minimization": "Enabled",
        "pipeline": "CAMERA -> EDGE -> ANONYMOUS POSE -> BEHAVIOR -> INVIGILATOR"
    }
