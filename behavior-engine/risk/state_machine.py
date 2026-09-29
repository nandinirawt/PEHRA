from config import (
    MAX_RISK_SCORE,
    MIN_RISK_SCORE,
    SCORE_UNDER_REVIEW_MIN,
    SCORE_HIGH_RISK_MIN,
)


NORMAL = "normal"
UNDER_REVIEW = "under_review"
HIGH_RISK = "high_risk"


def get_risk_state(score: float) -> str:
    """
    Convert a risk score into the PEHRA risk state.
    """

    if score >= SCORE_HIGH_RISK_MIN:
        return HIGH_RISK

    if score >= SCORE_UNDER_REVIEW_MIN:
        return UNDER_REVIEW

    return NORMAL


def calculate_risk_score(
    head_turn_points: int = 0,
    body_orientation_points: int = 0,
    hand_anomaly_points: int = 0,
    neighbor_interaction_points: int = 0,
    temporal_points: int = 0,
) -> dict:

    contributions = [
        {
            "signal": "repeated_head_turns",
            "points": head_turn_points,
        },
        {
            "signal": "body_orientation",
            "points": body_orientation_points,
        },
        {
            "signal": "hand_anomaly",
            "points": hand_anomaly_points,
        },
        {
            "signal": "neighbor_interaction",
            "points": neighbor_interaction_points,
        },
        {
            "signal": "temporal_pattern",
            "points": temporal_points,
        },
    ]

    score = sum(
        item["points"]
        for item in contributions
    )

    score = min(
        MAX_RISK_SCORE,
        max(MIN_RISK_SCORE, score),
    )

    active_signals = sum(
        1
        for item in contributions
        if item["points"] > 0
    )

    # A single weak signal cannot directly create
    # an under-review/high-risk state.
    if active_signals < 2:
        score = min(
            score,
            SCORE_UNDER_REVIEW_MIN - 1,
        )

    status = get_risk_state(score)

    return {
        "risk_score": score,
        "status": status,
        "contributions": contributions,
    }


if __name__ == "__main__":

    print(
        "Single head turn:",
        calculate_risk_score(
            head_turn_points=18
        )
    )

    print(
        "Repeated movement + body orientation:",
        calculate_risk_score(
            head_turn_points=18,
            body_orientation_points=20,
        )
    )

    print(
        "Multi-signal suspicious pattern:",
        calculate_risk_score(
            head_turn_points=18,
            body_orientation_points=20,
            hand_anomaly_points=8,
            neighbor_interaction_points=12,
            temporal_points=24,
        )
    )
