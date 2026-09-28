import cv2
import mediapipe as mp
import time


MODEL_PATH = "models/hand_landmarker.task"


def start_hand_detection():
    camera = cv2.VideoCapture(0)

    if not camera.isOpened():
        print("Error: Could not open webcam.")
        return

    BaseOptions = mp.tasks.BaseOptions
    HandLandmarker = mp.tasks.vision.HandLandmarker
    HandLandmarkerOptions = mp.tasks.vision.HandLandmarkerOptions
    RunningMode = mp.tasks.vision.RunningMode

    options = HandLandmarkerOptions(
        base_options=BaseOptions(
            model_asset_path=MODEL_PATH
        ),
        running_mode=RunningMode.VIDEO,
        num_hands=2,
        min_hand_detection_confidence=0.5,
        min_hand_presence_confidence=0.5,
        min_tracking_confidence=0.5
    )

    print("Hand detection started. Press Q to close.")

    with HandLandmarker.create_from_options(options) as detector:

        start_time = time.time()

        while True:
            success, frame = camera.read()

            if not success:
                print("Error: Could not read frame.")
                break

            # Mirror the webcam
            frame = cv2.flip(frame, 1)

            # Convert BGR to RGB
            rgb_frame = cv2.cvtColor(
                frame,
                cv2.COLOR_BGR2RGB
            )

            # Convert to MediaPipe Image
            mp_image = mp.Image(
                image_format=mp.ImageFormat.SRGB,
                data=rgb_frame
            )

            # Increasing timestamp for VIDEO mode
            timestamp_ms = int(
                (time.time() - start_time) * 1000
            )

            # Detect hands
            result = detector.detect_for_video(
                mp_image,
                timestamp_ms
            )

            # Draw hand landmarks
            if result.hand_landmarks:
                height, width, _ = frame.shape

                for hand_landmarks in result.hand_landmarks:
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

            cv2.imshow(
                "PEHRA Edge AI - Hand Detection",
                frame
            )

            # Press Q to close
            if cv2.waitKey(1) & 0xFF == ord("q"):
                break

    camera.release()
    cv2.destroyAllWindows()


if __name__ == "__main__":
    start_hand_detection()