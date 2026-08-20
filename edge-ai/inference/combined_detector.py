
import cv2
import mediapipe as mp
import time
import sys
import os
from datetime import datetime, timezone


# Allow importing from the edge-ai root folder
sys.path.append(
    os.path.dirname(
        os.path.dirname(
            os.path.abspath(__file__)
        )
    )
)


from representation.anonymous_features import (
    get_body_orientation,
    get_hand_state,
    get_head_direction
)

from client.backend_client import send_pose_data


POSE_MODEL_PATH = "models/pose_landmarker.task"
HAND_MODEL_PATH = "models/hand_landmarker.task"


def start_combined_detection():

    # Open webcam
    camera = cv2.VideoCapture(0)

    if not camera.isOpened():
        print("Error: Could not open webcam.")
        return


    # =====================================
    # MEDIAPIPE CLASSES
    # =====================================

    BaseOptions = mp.tasks.BaseOptions

    PoseLandmarker = mp.tasks.vision.PoseLandmarker
    PoseLandmarkerOptions = mp.tasks.vision.PoseLandmarkerOptions

    HandLandmarker = mp.tasks.vision.HandLandmarker
    HandLandmarkerOptions = mp.tasks.vision.HandLandmarkerOptions

    RunningMode = mp.tasks.vision.RunningMode


    # =====================================
    # POSE DETECTOR CONFIGURATION
    # =====================================

    pose_options = PoseLandmarkerOptions(
        base_options=BaseOptions(
            model_asset_path=POSE_MODEL_PATH
        ),
        running_mode=RunningMode.VIDEO,

        # Detect up to 3 people
        num_poses=3,

        min_pose_detection_confidence=0.5,
        min_pose_presence_confidence=0.5,
        min_tracking_confidence=0.5
    )


    # =====================================
    # HAND DETECTOR CONFIGURATION
    # =====================================

    hand_options = HandLandmarkerOptions(
        base_options=BaseOptions(
            model_asset_path=HAND_MODEL_PATH
        ),
        running_mode=RunningMode.VIDEO,

        # Maximum 3 people × 2 hands
        num_hands=6,

        min_hand_detection_confidence=0.5,
        min_hand_presence_confidence=0.5,
        min_tracking_confidence=0.5
    )


    # =====================================
    # HAND STATE VARIABLES
    # =====================================

    previous_hand_landmarks = None
    unusual_frames_remaining = 0


    # =====================================
    # BACKEND SEND CONFIGURATION
    # =====================================

    last_send_time = 0
    SEND_INTERVAL = 1


    print("Multi-person combined detection started.")
    print("Detecting up to 3 people.")
    print("Press Q to close.")


    # =====================================
    # START DETECTORS
    # =====================================

    with PoseLandmarker.create_from_options(
        pose_options
    ) as pose_detector, HandLandmarker.create_from_options(
        hand_options
    ) as hand_detector:

        start_time = time.time()

        while True:

            # =====================================
            # READ WEBCAM FRAME
            # =====================================

            success, frame = camera.read()

            if not success:
                print("Error: Could not read frame.")
                break


            # Mirror webcam
            frame = cv2.flip(frame, 1)


            # Convert BGR → RGB
            rgb_frame = cv2.cvtColor(
                frame,
                cv2.COLOR_BGR2RGB
            )


            # Create MediaPipe image
            mp_image = mp.Image(
                image_format=mp.ImageFormat.SRGB,
                data=rgb_frame
            )


            # Increasing timestamp for VIDEO mode
            timestamp_ms = int(
                (time.time() - start_time) * 1000
            )


            # =====================================
            # DETECT POSES
            # =====================================

            pose_result = pose_detector.detect_for_video(
                mp_image,
                timestamp_ms
            )


            # =====================================
            # DETECT HANDS
            # =====================================

            hand_result = hand_detector.detect_for_video(
                mp_image,
                timestamp_ms
            )


            # =====================================
            # EXTRACT FEATURES FOR ALL PEOPLE
            # =====================================

            person_features = []

            if pose_result.pose_landmarks:

                for person_index, pose_landmarks in enumerate(
                    pose_result.pose_landmarks
                ):

                    # Separate orientation history
                    # for each detected person for now
                    orientation_history = []

                    # Get head direction
                    head_direction = get_head_direction(
                        pose_landmarks
                    )


                    # Get body orientation
                    body_orientation = get_body_orientation(
                        pose_landmarks,
                        orientation_history
                    )


                    # Store this person's features
                    person_features.append({
                        "person_index": person_index + 1,
                        "head_direction": head_direction,
                        "body_orientation": body_orientation
                    })


            # =====================================
            # HAND STATE
            # =====================================
            #
            # At this stage, hands are detected globally.
            # Person-to-hand matching will be added next.
            #

            hand_state, unusual_frames_remaining = get_hand_state(
                hand_result.hand_landmarks,
                previous_hand_landmarks,
                unusual_frames_remaining
            )


            # Save hands for next frame
            previous_hand_landmarks = (
                hand_result.hand_landmarks
            )


            # Add current hand state to each person
            #
            # Temporary: same global hand state is shown
            # until person-hand matching is implemented.

            for person in person_features:
                person["hand_state"] = hand_state


            # =====================================
            # SEND DATA TO BACKEND
            # =====================================

            current_time = time.time()

            if (
                person_features
                and current_time - last_send_time >= SEND_INTERVAL
            ):

                print("\nDetected People:")

                for person in person_features:

                    print(person)

                    pose_data = {
                        "seat_id": f"PERSON-{person['person_index']}",
                        "timestamp": datetime.now(
                            timezone.utc
                        ).isoformat(),
                        "presence": True,
                        "confidence": 0.95,
                        "pose_features": {
                            "head_direction": person[
                                "head_direction"
                            ],
                            "body_orientation": person[
                                "body_orientation"
                            ],
                            "hand_state": person[
                                "hand_state"
                            ]
                        }
                    }

                    send_pose_data(pose_data)

                last_send_time = current_time


            # =====================================
            # DRAW LANDMARKS
            # =====================================

            height, width, _ = frame.shape


            # Draw pose landmarks for every person
            if pose_result.pose_landmarks:

                for pose_landmarks in pose_result.pose_landmarks:

                    for landmark in pose_landmarks:

                        x = int(landmark.x * width)
                        y = int(landmark.y * height)

                        cv2.circle(
                            frame,
                            (x, y),
                            4,
                            (0, 255, 0),
                            -1
                        )


            # Draw all detected hands
            if hand_result.hand_landmarks:

                for hand_landmarks in hand_result.hand_landmarks:

                    for landmark in hand_landmarks:

                        x = int(landmark.x * width)
                        y = int(landmark.y * height)

                        cv2.circle(
                            frame,
                            (x, y),
                            4,
                            (0, 255, 0),
                            -1
                        )


            # =====================================
            # DISPLAY EACH PERSON'S FEATURES
            # =====================================

            y_position = 35

            for person in person_features:

                person_number = person["person_index"]

                cv2.putText(
                    frame,
                    f"P{person_number} Head: "
                    f"{person['head_direction']}",
                    (20, y_position),
                    cv2.FONT_HERSHEY_SIMPLEX,
                    0.6,
                    (0, 255, 0),
                    2
                )

                y_position += 25

                cv2.putText(
                    frame,
                    f"P{person_number} Body: "
                    f"{person['body_orientation']}",
                    (20, y_position),
                    cv2.FONT_HERSHEY_SIMPLEX,
                    0.6,
                    (0, 255, 0),
                    2
                )

                y_position += 25

                cv2.putText(
                    frame,
                    f"P{person_number} Hands: "
                    f"{person['hand_state']}",
                    (20, y_position),
                    cv2.FONT_HERSHEY_SIMPLEX,
                    0.6,
                    (0, 255, 0),
                    2
                )

                y_position += 40


            # =====================================
            # SHOW WINDOW
            # =====================================

            cv2.imshow(
                "PEHRA Edge AI - Multi-Person Detection",
                frame
            )


            # Press Q to close
            if cv2.waitKey(1) & 0xFF == ord("q"):
                break


    # =====================================
    # CLEANUP
    # =====================================

    camera.release()
    cv2.destroyAllWindows()


if __name__ == "__main__":
    start_combined_detection()

