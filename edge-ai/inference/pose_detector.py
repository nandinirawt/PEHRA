import cv2
import mediapipe as mp
import time


MODEL_PATH = "models/pose_landmarker.task"


def start_pose_detection():
    camera = cv2.VideoCapture(0)

    if not camera.isOpened():
        print("Error: Could not open webcam.")
        return

    BaseOptions = mp.tasks.BaseOptions
    PoseLandmarker = mp.tasks.vision.PoseLandmarker
    PoseLandmarkerOptions = mp.tasks.vision.PoseLandmarkerOptions
    RunningMode = mp.tasks.vision.RunningMode

    options = PoseLandmarkerOptions(
        base_options=BaseOptions(
            model_asset_path=MODEL_PATH
        ),
        running_mode=RunningMode.VIDEO,
        num_poses=1,
        min_pose_detection_confidence=0.5,
        min_pose_presence_confidence=0.5,
        min_tracking_confidence=0.5
    )

    print("Pose detection started. Press Q to close.")

    with PoseLandmarker.create_from_options(options) as detector:

        start_time = time.time()

        while True:
            success, frame = camera.read()

            if not success:
                print("Error: Could not read frame.")
                break
            frame = cv2.flip(frame, 1)
            # OpenCV frame: BGR -> RGB
            rgb_frame = cv2.cvtColor(
                frame,
                cv2.COLOR_BGR2RGB
            )

            # Convert frame into MediaPipe Image
            mp_image = mp.Image(
                image_format=mp.ImageFormat.SRGB,
                data=rgb_frame
            )

            # Timestamp must increase for VIDEO mode
            timestamp_ms = int(
                (time.time() - start_time) * 1000
            )

            # Detect pose landmarks
            result = detector.detect_for_video(
                mp_image,
                timestamp_ms
            )

            # Draw detected landmarks
            if result.pose_landmarks:
                height, width, _ = frame.shape

                for pose_landmarks in result.pose_landmarks:
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

            cv2.imshow(
                "PEHRA Edge AI - Pose Detection",
                frame
            )

            # Press Q to close
            if cv2.waitKey(1) & 0xFF == ord("q"):
                break

    camera.release()
    cv2.destroyAllWindows()


if __name__ == "__main__":
    start_pose_detection()