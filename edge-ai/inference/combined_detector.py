import cv2
import mediapipe as mp
import time
import sys
import os


# Allow importing from the representation folder
sys.path.append(
    os.path.dirname(
        os.path.dirname(
            os.path.abspath(__file__)
        )
    )
)

from representation.anonymous_features import (
    get_body_orientation,
    get_hand_state
)


POSE_MODEL_PATH = "models/pose_landmarker.task"
HAND_MODEL_PATH = "models/hand_landmarker.task"


def start_combined_detection():

    camera = cv2.VideoCapture(0)

    if not camera.isOpened():
        print("Error: Could not open webcam.")
        return


    # MediaPipe classes
    BaseOptions = mp.tasks.BaseOptions

    PoseLandmarker = mp.tasks.vision.PoseLandmarker
    PoseLandmarkerOptions = mp.tasks.vision.PoseLandmarkerOptions

    HandLandmarker = mp.tasks.vision.HandLandmarker
    HandLandmarkerOptions = mp.tasks.vision.HandLandmarkerOptions

    RunningMode = mp.tasks.vision.RunningMode


    # Pose detector configuration
    pose_options = PoseLandmarkerOptions(
        base_options=BaseOptions(
            model_asset_path=POSE_MODEL_PATH
        ),
        running_mode=RunningMode.VIDEO,
        num_poses=1,
        min_pose_detection_confidence=0.5,
        min_pose_presence_confidence=0.5,
        min_tracking_confidence=0.5
    )


    # Hand detector configuration
    hand_options = HandLandmarkerOptions(
        base_options=BaseOptions(
            model_asset_path=HAND_MODEL_PATH
        ),
        running_mode=RunningMode.VIDEO,
        num_hands=2,
        min_hand_detection_confidence=0.5,
        min_hand_presence_confidence=0.5,
        min_tracking_confidence=0.5
    )


    # State variables
    previous_hand_landmarks = None
    orientation_history = []
    unusual_frames_remaining = 0


    print("Combined detection started. Press Q to close.")


    with PoseLandmarker.create_from_options(
        pose_options
    ) as pose_detector, HandLandmarker.create_from_options(
        hand_options
    ) as hand_detector:

        start_time = time.time()

        while True:

            # Read webcam frame
            success, frame = camera.read()

            if not success:
                print("Error: Could not read frame.")
                break


            # Mirror webcam frame
            frame = cv2.flip(frame, 1)


            # Convert BGR to RGB
            rgb_frame = cv2.cvtColor(
                frame,
                cv2.COLOR_BGR2RGB
            )


            # Create MediaPipe image
            mp_image = mp.Image(
                image_format=mp.ImageFormat.SRGB,
                data=rgb_frame
            )


            # Timestamp for VIDEO mode
            timestamp_ms = int(
                (time.time() - start_time) * 1000
            )


            # Detect pose
            pose_result = pose_detector.detect_for_video(
                mp_image,
                timestamp_ms
            )


            # Detect hands
            hand_result = hand_detector.detect_for_video(
                mp_image,
                timestamp_ms
            )


            # Default feature values
            body_orientation = "unknown"


            # Extract body orientation
            if pose_result.pose_landmarks:

                pose_landmarks = pose_result.pose_landmarks[0]

                body_orientation = get_body_orientation(
                    pose_landmarks,
                    orientation_history
                )


            # Extract hand state
            hand_state, unusual_frames_remaining = get_hand_state(
                hand_result.hand_landmarks,
                previous_hand_landmarks,
                unusual_frames_remaining
            )


            # Save current hands for next frame
            previous_hand_landmarks = hand_result.hand_landmarks


            # =====================================
            # DRAW LANDMARKS
            # =====================================

            height, width, _ = frame.shape


            # Draw pose landmarks
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


            # Draw hand landmarks
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
            # DISPLAY FEATURES
            # =====================================

            cv2.putText(
                frame,
                f"Body: {body_orientation}",
                (20, 40),
                cv2.FONT_HERSHEY_SIMPLEX,
                1,
                (0, 255, 0),
                2
            )


            cv2.putText(
                frame,
                f"Hands: {hand_state}",
                (20, 80),
                cv2.FONT_HERSHEY_SIMPLEX,
                1,
                (0, 255, 0),
                2
            )


            # Show webcam window
            cv2.imshow(
                "PEHRA Edge AI - Combined Detection",
                frame
            )


            # Press Q to close
            if cv2.waitKey(1) & 0xFF == ord("q"):
                break


    # Release camera
    camera.release()
    cv2.destroyAllWindows()


if __name__ == "__main__":
    start_combined_detection()