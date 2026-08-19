from fastapi import APIRouter, HTTPException

from calibration.p6_backend.models import (
    StartCalibrationRequest,
    UpdateCalibrationRequest,
    CalibrationResult,
)

from calibration.p6_backend.service import (
    CalibrationService,
)


router = APIRouter(
    prefix="/api/calibration",
    tags=["P6 Calibration"],
)

service = CalibrationService()


@router.post("/start")
def start_calibration(
    request: StartCalibrationRequest,
):
    return service.start(request)


@router.post(
    "/{exam_id}/update",
    response_model=CalibrationResult,
)
def update_calibration(
    exam_id: str,
    request: UpdateCalibrationRequest,
):

    try:
        return service.update(
            exam_id,
            request.seats,
        )

    except ValueError as error:
        raise HTTPException(
            status_code=404,
            detail=str(error),
        )


@router.post(
    "/{exam_id}/validate",
    response_model=CalibrationResult,
)
def validate_calibration(
    exam_id: str,
):

    try:
        return service.validate(
            exam_id
        )

    except ValueError as error:
        raise HTTPException(
            status_code=404,
            detail=str(error),
        )


@router.get("/{exam_id}")
def get_calibration(
    exam_id: str,
):

    try:
        return service.get(
            exam_id
        )

    except ValueError as error:
        raise HTTPException(
            status_code=404,
            detail=str(error),
        )


@router.post("/{exam_id}/complete")
def complete_calibration(
    exam_id: str
):

    try:
        result = service.validate(
            exam_id
        )

        if result.status != "calibrated":
            raise HTTPException(
                status_code=400,
                detail={
                    "message":
                        "Calibration is not valid yet.",
                    "status":
                        result.status,
                    "missing_seats":
                        result.missing_seats,
                    "duplicate_seats":
                        result.duplicate_seats,
                },
            )

        return {
            "exam_id": exam_id,
            "status": "completed",
            "calibration":
                result.model_dump(),
        }

    except ValueError as error:
        raise HTTPException(
            status_code=404,
            detail=str(error),
        )