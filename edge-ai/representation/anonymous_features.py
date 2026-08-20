def get_body_orientation(pose_landmarks, orientation_history):
    """
    Determines body orientation using shoulder depth
    and smooths the result across recent frames.
    """

    if not pose_landmarks:
        return "unknown"

    LEFT_SHOULDER = 11
    RIGHT_SHOULDER = 12

    left_shoulder = pose_landmarks[LEFT_SHOULDER]
    right_shoulder = pose_landmarks[RIGHT_SHOULDER]

    depth_difference = abs(
        left_shoulder.z - right_shoulder.z
    )

    if depth_difference < 0.15:
        current_orientation = "forward"
    elif left_shoulder.z < right_shoulder.z:
        current_orientation = "left"
    else:
        current_orientation = "right"

    orientation_history.append(current_orientation)

    if len(orientation_history) > 15:
        orientation_history.pop(0)

    return max(
        set(orientation_history),
        key=orientation_history.count
    )


def get_hand_state(
    current_hand_landmarks,
    previous_hand_landmarks,
    unusual_frames_remaining
):
    """
    Detects significant hand movement and keeps the
    unusual state visible for several frames.
    """

    if not current_hand_landmarks:
        if unusual_frames_remaining > 0:
            return "unusual_movement", unusual_frames_remaining - 1

        return "normal", 0

    if not previous_hand_landmarks:
        if unusual_frames_remaining > 0:
            return "unusual_movement", unusual_frames_remaining - 1

        return "normal", 0

    max_movement = 0

    for current_hand, previous_hand in zip(
        current_hand_landmarks,
        previous_hand_landmarks
    ):
        current_wrist = current_hand[0]
        previous_wrist = previous_hand[0]

        movement = (
            (current_wrist.x - previous_wrist.x) ** 2
            + (current_wrist.y - previous_wrist.y) ** 2
        ) ** 0.5

        max_movement = max(max_movement, movement)

    # Strong movement detected
    if max_movement > 0.025:
        # Keep unusual state for 15 frames
        return "unusual_movement", 15

    # Continue showing unusual state briefly
    if unusual_frames_remaining > 0:
        return (
            "unusual_movement",
            unusual_frames_remaining - 1
        )

    return "normal", 0
def get_head_direction(pose_landmarks):
    """
    Estimates head direction using nose position
    relative to the shoulders.
    """

    if not pose_landmarks:
        return "unknown"

    NOSE = 0
    LEFT_SHOULDER = 11
    RIGHT_SHOULDER = 12

    nose = pose_landmarks[NOSE]
    left_shoulder = pose_landmarks[LEFT_SHOULDER]
    right_shoulder = pose_landmarks[RIGHT_SHOULDER]

    shoulder_center_x = (
        left_shoulder.x + right_shoulder.x
    ) / 2

    difference = nose.x - shoulder_center_x

    if difference < -0.04:
        return "left"
    elif difference > 0.04:
        return "right"

    return "center"