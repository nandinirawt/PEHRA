from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import cv2
import numpy as np
import math
from grid_detector import order_detections_into_grid

from seat_detector import detect_chairs

def get_grid_position(
    seat_index: int,
    rows: int,
    columns: int,
):
    """
    Convert a zero-based seat index into
    a logical row and column.
    """

    row = (seat_index // columns) + 1
    column = (seat_index % columns) + 1

    return {
        "row": row,
        "column": column,
        "label": f"R{row}-C{column}",
    }
class ClickRequest(BaseModel):
    x: float
    y: float


app = FastAPI(
    title="PEHRA Calibration API"
)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def root():
    return {
        "service": "PEHRA Calibration API",
        "status": "running"
    }


@app.post("/calibration/detect")
async def detect_seats(
    file: UploadFile = File(...)
):
    # Read uploaded image
    contents = await file.read()

    image_array = np.frombuffer(
        contents,
        dtype=np.uint8
    )

    image = cv2.imdecode(
        image_array,
        cv2.IMREAD_COLOR
    )

    if image is None:
        return {
            "success": False,
            "error": "Invalid image"
        }

    # Detect physical seats
    detections = detect_chairs(image)

    # Order detections spatially
    detections = order_detections_into_grid(
        detections,
        expected_rows=4,
        expected_columns=4
    )

    seats = []

    for index, detection in enumerate(
        detections
    ):
        row = (index // 4) + 1
        column = (index % 4) + 1

        x, y = detection["center"]

        seats.append({
            "id": index + 1,
            "row": row,
            "column": column,
            "label": f"R{row}-C{column}",
            "x": round(x, 2),
            "y": round(y, 2),
            "bbox": detection["bbox"],
            "confidence": detection["confidence"]
        })

    return {
        "success": True,
        "seat_count": len(seats),
        "seats": seats
    }
           

@app.post("/calibration/click")
async def identify_clicked_seat(request: ClickRequest):

    image = cv2.imread(
        "calibration/data/classroom.jpg"
    )

    if image is None:
        return {
            "success": False,
            "error": "Calibration image not found."
        }

    detections = detect_chairs(image)

    if not detections:
        return {
            "success": False,
            "error": "No seats detected."
        }
        detections = order_detections_into_grid(
        detections,
        expected_rows=4,
        expected_columns=4
    )

    closest = None
    closest_distance = float("inf")
    closest_index = None

    for index, detection in enumerate(
        detections
    ):
        cx, cy = detection["center"]

        distance = math.sqrt(
            (request.x - cx) ** 2
            + (request.y - cy) ** 2
        )

        if distance < closest_distance:
            closest_distance = distance
            closest = detection
            closest_index = index

    # Convert detection index to logical grid position
    row = (closest_index // 4) + 1
    column = (closest_index % 4) + 1

    return {
        "success": True,

        "seat": {
            "detected_id": closest_index + 1,
            "row": row,
            "column": column,
            "label": f"R{row}-C{column}",

            "x": round(
                closest["center"][0],
                2
            ),

            "y": round(
                closest["center"][1],
                2
            ),

            "bbox": closest["bbox"],

            "confidence": closest["confidence"]
        },

        "click": {
            "x": request.x,
            "y": request.y
        },

        "distance": round(
            closest_distance,
            2
        )
    }