NORMAL = "normal"
UNDER_REVIEW = "under_review"
HIGH_RISK = "high_risk"


def get_risk_state(score: float) -> str:
    """
    Convert a risk score (0-100) into a PEHRA risk state.
    """

    if score >= 65:
        return HIGH_RISK

    if score >= 35:
        return UNDER_REVIEW

    return NORMAL


def calculate_risk_score(
    head_turn_points: int = 0,
    body_orientation_points: int = 0,
    hand_anomaly_points: int = 0,
    neighbor_interaction_points: int = 0,
    temporal_points: int = 0,
) -> dict:
    """
    Calculate an explainable prototype risk score.
    """

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

    score = sum(item["points"] for item in contributions)

    score = min(score, 100)

    # Prevent a single weak signal from immediately becoming high risk.
    active_signals = sum(
        1 for item in contributions if item["points"] > 0
    )

    if active_signals < 2:
        score = min(score, 34)

    status = get_risk_state(score)

    return {
        "risk_score": score,
        "status": status,
        "contributions": contributions,
    }


if __name__ == "__main__":
    # Test 1: one small movement
    print(
        "Single head turn:",
        calculate_risk_score(
            head_turn_points=18
        )
    )

    # Test 2: two signals
    print(
        "Repeated movement + body orientation:",
        calculate_risk_score(
            head_turn_points=18,
            body_orientation_points=20,
        )
    )

    # Test 3: multiple persistent signals
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