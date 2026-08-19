from fastapi import APIRouter, HTTPException

from calibration.backend.schemas import (
    LayoutRequest,
    LayoutResponse,
    CalibrationMappingRequest,
    ValidateCalibrationRequest,
    CalibrationResult,
)

from calibration.service import CalibrationService


router = APIRouter(
    prefix="/api/calibration",
    tags=["Calibration"],
)

service = CalibrationService()

# Temporary in-memory store.
# Later Person 4 can move this into SQLite.
calibration_store = {}


@router.post("/layout", response_model=LayoutResponse)
def create_layout(request: LayoutRequest):
    """
    Create the expected seating structure for an exam.
    """

    return service.create_expected_layout(
        rows=request.rows,
        columns=request.columns,
    )


@router.post("/mapping")
def save_mapping(request: CalibrationMappingRequest):
    """
    Save one camera-zone -> seat mapping.
    """

    if not request.seat_ids:
        raise HTTPException(
            status_code=400,
            detail="At least one seat must be mapped.",
        )

    if len(request.bbox) != 4:
        raise HTTPException(
            status_code=400,
            detail="bbox must contain [x, y, width, height].",
        )

    camera_id = request.camera_id

    if camera_id not in calibration_store:
        calibration_store[camera_id] = []

    # Prevent duplicate seat mappings for the same camera.
    existing_seats = []

    for mapping in calibration_store[camera_id]:
        existing_seats.extend(mapping["seat_ids"])

    duplicates = [
        seat
        for seat in request.seat_ids
        if seat in existing_seats
    ]

    if duplicates:
        raise HTTPException(
            status_code=409,
            detail={
                "message": "Seat already mapped.",
                "duplicate_seats": duplicates,
            },
        )

    mapping = {
        "camera_id": request.camera_id,
        "zone_id": request.zone_id,
        "seat_ids": request.seat_ids,
        "bbox": request.bbox,
    }

    calibration_store[camera_id].append(mapping)

    return {
        "status": "mapped",
        "mapping": mapping,
    }


@router.get("/{camera_id}/mappings")
def get_mappings(camera_id: str):
    """
    Return all mappings for a camera.
    """

    return {
        "camera_id": camera_id,
        "mappings": calibration_store.get(
            camera_id,
            [],
        ),
    }


@router.post(
    "/{camera_id}/validate",
    response_model=CalibrationResult,
)
def validate_camera_calibration(
    camera_id: str,
    request: ValidateCalibrationRequest,
):
    """
    Validate all mappings currently stored for a camera.
    """

    mappings = calibration_store.get(
        camera_id,
        [],
    )

    mapped_seats = []

    for mapping in mappings:
        mapped_seats.extend(
            mapping["seat_ids"]
        )

    result = service.validate(
        rows=request.rows,
        columns=request.columns,
        mapped_seats=mapped_seats,
    )

    return result