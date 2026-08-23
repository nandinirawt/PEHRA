import cv2
import mediapipe as mp
import time
import sys
import os
import math


# ============================================================
# PATH SETUP
# ============================================================

BASE_DIR = os.path.dirname(
    os.path.dirname(
        os.path.abspath(__file__)
    )
)

if BASE_DIR not in sys.path:
    sys.path.append(BASE_DIR)


from representation.anonymous_features import (
    get_body_orientation,
    get_hand_state
)

from client.backend_client import send_pose_data


# ============================================================
# MODEL PATHS
# ============================================================

POSE_MODEL_PATH = os.path.join(
    BASE_DIR,
    "models",
    "pose_landmarker.task"
)

HAND_MODEL_PATH = os.path.join(
    BASE_DIR,
    "models",
    "hand_landmarker.task"
)


# ============================================================
# CONFIGURATION
# ============================================================

MAX_PEOPLE = 3
SEND_INTERVAL = 5


# ============================================================
# MEDIAPIPE POSE SKELETON CONNECTIONS
# ============================================================

POSE_CONNECTIONS = [
    # Face
    (0, 1), (1, 2), (2, 3), (3, 7),
    (0, 4), (4, 5), (5, 6), (6, 8),
    (9, 10),

    # Shoulders
    (11, 12),

    # Left arm
    (11, 13), (13, 15),
    (15, 17), (15, 19), (15, 21),
    (17, 19),

    # Right arm
    (12, 14), (14, 16),
    (16, 18), (16, 20), (16, 22),
    (18, 20),

    # Torso
    (11, 23), (12, 24), (23, 24),

    # Left leg
    (23, 25), (25, 27),
    (27, 29), (29, 31), (27, 31),

    # Right leg
    (24, 26), (26, 28),
    (28, 30), (30, 32), (28, 32)
]


# ============================================================
# HEAD DIRECTION
# ============================================================

def get_head_direction(pose_landmarks):

    LEFT_EAR = 7
    RIGHT_EAR = 8
    NOSE = 0

    try:
        nose_x = pose_landmarks[NOSE].x
        left_ear_x = pose_landmarks[LEFT_EAR].x
        right_ear_x = pose_landmarks[RIGHT_EAR].x

        ear_center = (
            left_ear_x + right_ear_x
        ) / 2

        difference = nose_x - ear_center

        if difference < -0.035:
            return "left"

        elif difference > 0.035:
            return "right"

        return "center"

    except (IndexError, AttributeError):
        return "unknown"


# ============================================================
# DISTANCE FUNCTION
# ============================================================

def calculate_distance(point1, point2):

    return math.sqrt(
        (point1.x - point2.x) ** 2
        +
        (point1.y - point2.y) ** 2
    )


# ============================================================
# MATCH HAND TO CLOSEST PERSON
# ============================================================

def find_closest_person(
    hand_landmarks,
    people_data
):

    if not hand_landmarks or not people_data:
        return None

    wrist = hand_landmarks[0]

    closest_person_index = None
    minimum_distance = float("inf")

    LEFT_SHOULDER = 11
    RIGHT_SHOULDER = 12

    for person in people_data:

        pose_landmarks = person["pose_landmarks"]

        try:
            left_shoulder = pose_landmarks[
                LEFT_SHOULDER
            ]

            right_shoulder = pose_landmarks[
                RIGHT_SHOULDER
            ]

            shoulder_center_x = (
                left_shoulder.x
                + right_shoulder.x
            ) / 2

            shoulder_center_y = (
                left_shoulder.y
                + right_shoulder.y
            ) / 2

            distance = math.sqrt(
                (wrist.x - shoulder_center_x) ** 2
                +
                (wrist.y - shoulder_center_y) ** 2
            )

            if distance < minimum_distance:

                minimum_distance = distance

                closest_person_index = person[
                    "person_index"
                ]

        except IndexError:
            continue

    return closest_person_index


# ============================================================
# MAIN DETECTION
# ============================================================

def start_combined_detection():

    # LIVE CAMERA ONLY
    camera = cv2.VideoCapture(0)

    if not camera.isOpened():
        print("Error: Could not open webcam.")
        return


    # Camera resolution
    camera.set(
        cv2.CAP_PROP_FRAME_WIDTH,
        640
    )

    camera.set(
        cv2.CAP_PROP_FRAME_HEIGHT,
        480
    )


    # ========================================================
    # MEDIAPIPE CLASSES
    # ========================================================

    BaseOptions = mp.tasks.BaseOptions

    PoseLandmarker = (
        mp.tasks.vision.PoseLandmarker
    )

    PoseLandmarkerOptions = (
        mp.tasks.vision.PoseLandmarkerOptions
    )

    HandLandmarker = (
        mp.tasks.vision.HandLandmarker
    )

    HandLandmarkerOptions = (
        mp.tasks.vision.HandLandmarkerOptions
    )

    RunningMode = (
        mp.tasks.vision.RunningMode
    )


    # ========================================================
    # POSE DETECTOR
    # ========================================================

    pose_options = PoseLandmarkerOptions(

        base_options=BaseOptions(
            model_asset_path=POSE_MODEL_PATH
        ),

        running_mode=RunningMode.VIDEO,

        num_poses=MAX_PEOPLE,

        min_pose_detection_confidence=0.5,

        min_pose_presence_confidence=0.5,

        min_tracking_confidence=0.5
    )


    # ========================================================
    # HAND DETECTOR
    # ========================================================

    hand_options = HandLandmarkerOptions(

        base_options=BaseOptions(
            model_asset_path=HAND_MODEL_PATH
        ),

        running_mode=RunningMode.VIDEO,

        num_hands=MAX_PEOPLE * 2,

        min_hand_detection_confidence=0.5,

        min_hand_presence_confidence=0.5,

        min_tracking_confidence=0.5
    )


    # ========================================================
    # SEPARATE STATE FOR EACH PERSON
    # ========================================================

    orientation_histories = {}

    previous_person_hands = {}

    unusual_frames_remaining = {}


    last_send_time = time.time()


    print("\nLive camera detection started.")
    print(f"Detecting up to {MAX_PEOPLE} people.")
    print("Press Q to stop.\n")


    # ========================================================
    # START DETECTORS
    # ========================================================

    with PoseLandmarker.create_from_options(
        pose_options
    ) as pose_detector, HandLandmarker.create_from_options(
        hand_options
    ) as hand_detector:

        start_time = time.time()


        while True:

            # =================================================
            # READ LIVE CAMERA
            # =================================================

            success, frame = camera.read()

            if not success:
                print("Error: Could not read frame.")
                break


            # Mirror webcam
            frame = cv2.flip(
                frame,
                1
            )


            # =================================================
            # CONVERT BGR TO RGB
            # =================================================

            rgb_frame = cv2.cvtColor(
                frame,
                cv2.COLOR_BGR2RGB
            )


            mp_image = mp.Image(

                image_format=mp.ImageFormat.SRGB,

                data=rgb_frame
            )


            # Increasing timestamp required for VIDEO mode
            timestamp_ms = int(
                (time.time() - start_time) * 1000
            )


            # =================================================
            # DETECT POSES
            # =================================================

            pose_result = (
                pose_detector.detect_for_video(
                    mp_image,
                    timestamp_ms
                )
            )


            # =================================================
            # DETECT HANDS
            # =================================================

            hand_result = (
                hand_detector.detect_for_video(
                    mp_image,
                    timestamp_ms
                )
            )


            # =================================================
            # CREATE DATA FOR DETECTED PEOPLE
            # =================================================

            people_data = []


            if pose_result.pose_landmarks:

                for person_index, pose_landmarks in enumerate(
                    pose_result.pose_landmarks
                ):

                    # Persistent orientation history
                    if (
                        person_index
                        not in orientation_histories
                    ):
                        orientation_histories[
                            person_index
                        ] = []


                    # Head direction
                    head_direction = get_head_direction(
                        pose_landmarks
                    )


                    # Body orientation
                    body_orientation = get_body_orientation(
                        pose_landmarks,
                        orientation_histories[
                            person_index
                        ]
                    )


                    people_data.append({

                        "person_index":
                            person_index,

                        "pose_landmarks":
                            pose_landmarks,

                        "head_direction":
                            head_direction,

                        "body_orientation":
                            body_orientation,

                        "hand_state":
                            "normal",

                        "hands":
                            []
                    })


            # =================================================
            # MATCH HANDS TO INDIVIDUAL PEOPLE
            # =================================================

            if hand_result.hand_landmarks:

                for hand_landmarks in (
                    hand_result.hand_landmarks
                ):

                    closest_person_index = (
                        find_closest_person(
                            hand_landmarks,
                            people_data
                        )
                    )


                    if closest_person_index is not None:

                        for person in people_data:

                            if (
                                person["person_index"]
                                ==
                                closest_person_index
                            ):

                                person["hands"].append(
                                    hand_landmarks
                                )

                                break


            # =================================================
            # CALCULATE HAND STATE FOR EACH PERSON SEPARATELY
            # =================================================

            for person in people_data:

                person_index = person[
                    "person_index"
                ]


                if (
                    person_index
                    not in previous_person_hands
                ):
                    previous_person_hands[
                        person_index
                    ] = None


                if (
                    person_index
                    not in unusual_frames_remaining
                ):
                    unusual_frames_remaining[
                        person_index
                    ] = 0


                hand_state, remaining_frames = (
                    get_hand_state(

                        person["hands"],

                        previous_person_hands[
                            person_index
                        ],

                        unusual_frames_remaining[
                            person_index
                        ]
                    )
                )


                person["hand_state"] = hand_state


                unusual_frames_remaining[
                    person_index
                ] = remaining_frames


                previous_person_hands[
                    person_index
                ] = person["hands"]


            # =================================================
            # DRAW RESULTS
            # =================================================

            height, width, _ = frame.shape


            # =================================================
            # DRAW CONNECTED POSE SKELETON
            # =================================================

            if pose_result.pose_landmarks:

                for pose_landmarks in (
                    pose_result.pose_landmarks
                ):

                    # Draw skeleton lines first
                    for start_index, end_index in (
                        POSE_CONNECTIONS
                    ):

                        start_landmark = pose_landmarks[
                            start_index
                        ]

                        end_landmark = pose_landmarks[
                            end_index
                        ]


                        start_x = int(
                            start_landmark.x * width
                        )

                        start_y = int(
                            start_landmark.y * height
                        )

                        end_x = int(
                            end_landmark.x * width
                        )

                        end_y = int(
                            end_landmark.y * height
                        )


                        cv2.line(
                            frame,
                            (start_x, start_y),
                            (end_x, end_y),
                            (0, 255, 0),
                            2
                        )


                    # Draw dots over skeleton lines
                    for landmark in pose_landmarks:

                        x = int(
                            landmark.x * width
                        )

                        y = int(
                            landmark.y * height
                        )


                        cv2.circle(
                            frame,
                            (x, y),
                            4,
                            (0, 255, 0),
                            -1
                        )


            # =================================================
            # DRAW HAND LANDMARKS
            # =================================================

            if hand_result.hand_landmarks:

                for hand_landmarks in (
                    hand_result.hand_landmarks
                ):

                    for landmark in hand_landmarks:

                        x = int(
                            landmark.x * width
                        )

                        y = int(
                            landmark.y * height
                        )


                        cv2.circle(
                            frame,
                            (x, y),
                            3,
                            (255, 0, 0),
                            -1
                        )


            # =================================================
            # DISPLAY FEATURES FOR EACH PERSON
            # =================================================

            for person in people_data:

                person_index = person[
                    "person_index"
                ]


                y_position = (
                    40
                    + person_index * 100
                )


                cv2.putText(
                    frame,
                    f"Person {person_index + 1}",
                    (20, y_position),
                    cv2.FONT_HERSHEY_SIMPLEX,
                    0.7,
                    (255, 255, 255),
                    2
                )


                cv2.putText(
                    frame,
                    f"Head: {person['head_direction']}",
                    (20, y_position + 25),
                    cv2.FONT_HERSHEY_SIMPLEX,
                    0.6,
                    (0, 255, 0),
                    2
                )


                cv2.putText(
                    frame,
                    f"Body: {person['body_orientation']}",
                    (20, y_position + 50),
                    cv2.FONT_HERSHEY_SIMPLEX,
                    0.6,
                    (0, 255, 0),
                    2
                )


                cv2.putText(
                    frame,
                    f"Hands: {person['hand_state']}",
                    (20, y_position + 75),
                    cv2.FONT_HERSHEY_SIMPLEX,
                    0.6,
                    (0, 255, 0),
                    2
                )


            # =================================================
            # SEND DATA TO BACKEND
            # =================================================

            current_time = time.time()


            if (
                current_time - last_send_time
                >= SEND_INTERVAL
            ):

                for person in people_data:

                    pose_data = {

                        "seat_id":
                            f"PERSON-{person['person_index'] + 1}",

                        "timestamp":
                            time.strftime(
                                "%Y-%m-%dT%H:%M:%SZ",
                                time.gmtime()
                            ),

                        "presence":
                            True,

                        "confidence":
                            0.95,

                        "pose_features": {

                            "head_direction":
                                person["head_direction"],

                            "body_orientation":
                                person["body_orientation"],

                            "hand_state":
                                person["hand_state"]
                        }
                    }


                    send_pose_data(
                        pose_data
                    )


                last_send_time = current_time


            # =================================================
            # SHOW LIVE CAMERA
            # =================================================

            cv2.imshow(
                "PEHRA Edge AI - Multi Person Detection",
                frame
            )


            # Press Q to close
            if (
                cv2.waitKey(1) & 0xFF
                == ord("q")
            ):
                break


    # ========================================================
    # CLEANUP
    # ========================================================

    camera.release()
    cv2.destroyAllWindows()


# ============================================================
# RUN
# ============================================================

if __name__ == "__main__":
    start_combined_detection()