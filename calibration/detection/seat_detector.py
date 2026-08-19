import cv2
import math
from ultralytics import YOLO

# Pretrained lightweight model.
model = YOLO("yolo26x.pt")

# COCO class used for chairs.
CHAIR_CLASS_ID = 56



def calculate_iou(box1, box2):
    x1 = max(box1[0], box2[0])
    y1 = max(box1[1], box2[1])
    x2 = min(box1[2], box2[2])
    y2 = min(box1[3], box2[3])

    intersection_width = max(0, x2 - x1)
    intersection_height = max(0, y2 - y1)

    intersection = (
        intersection_width * intersection_height
    )

    area1 = (
        (box1[2] - box1[0]) *
        (box1[3] - box1[1])
    )

    area2 = (
        (box2[2] - box2[0]) *
        (box2[3] - box2[1])
    )

    union = area1 + area2 - intersection

    if union == 0:
        return 0

    return intersection / union


def remove_duplicate_seats(
    detections,
    iou_threshold=0.45
):

    detections = sorted(
        detections,
        key=lambda d: d["confidence"],
        reverse=True
    )

    kept = []

    for detection in detections:

        duplicate = False

        for existing in kept:

            iou = calculate_iou(
                detection["bbox"],
                existing["bbox"]
            )

            if iou > iou_threshold:
                duplicate = True
                break

        if not duplicate:
            kept.append(detection)

    return kept

def detect_chairs(image):
    """
    Detect chairs in one image.

    Returns:
        [
            {
                "bbox": [x1, y1, x2, y2],
                "center": [cx, cy],
                "confidence": 0.91
            },
            ...
        ]
    """

    results = model.predict(
    source=image,
   conf=0.20,
    iou=0.45,
    imgsz=1536,
    verbose=False,
)
    detections = []

    for result in results:
        if result.boxes is None:
            continue

        for box in result.boxes:
            class_id = int(box.cls[0])

            if class_id != CHAIR_CLASS_ID:
                continue

            confidence = float(box.conf[0])

            x1, y1, x2, y2 = map(
                int,
                box.xyxy[0].tolist(),
            )

            cx = (x1 + x2) / 2
            cy = (y1 + y2) / 2

            detections.append(
                {
                    "bbox": [x1, y1, x2, y2],
                    "center": [cx, cy],
                    "confidence": round(
                        confidence,
                        3,
                    ),
                }
            )
              
    return remove_duplicate_seats(detections)


if __name__ == "__main__":
    image_path = input(
        "Enter classroom image path: "
    ).strip()

    image = cv2.imread(image_path)

    if image is None:
        raise FileNotFoundError(
            f"Could not read image: {image_path}"
        )

    detections = detect_chairs(image)

    print(
        f"\nDetected chairs: {len(detections)}"
    )

    for index, detection in enumerate(
        detections,
        start=1,
    ):
        print(
            index,
            detection,
        )

    # Draw detections for visual verification.
    for detection in detections:
        x1, y1, x2, y2 = detection["bbox"]

        cv2.rectangle(
            image,
            (x1, y1),
            (x2, y2),
            (0, 255, 255),
            2,
        )

        cx, cy = detection["center"]

        cv2.circle(
            image,
            (int(cx), int(cy)),
            4,
            (0, 255, 255),
            -1,
        )

    output_path = (
        "calibration/detection/detected.jpg"
    )

    cv2.imwrite(
        output_path,
        image,
    )

    print(
        f"\nSaved annotated image to: {output_path}"
    )