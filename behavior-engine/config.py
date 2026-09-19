# Risk State Thresholds
SCORE_UNDER_REVIEW_MIN = 40
SCORE_HIGH_RISK_MIN = 70
MAX_RISK_SCORE = 100
MIN_RISK_SCORE = 0

# Multi-Signal Weights
WEIGHTS = {
    'repeated_head_turns': 18,
    'body_orientation': 20,
    'hand_anomaly': 8,
    'temporal_pattern': 24,
    'neighbor_interaction': 12
}

# Temporal Window & Persistence Settings
WINDOW_DURATION_SECONDS = 45.0
PERSISTENCE_MIN_OCCURRENCES = 3
MIN_INDEPENDENT_SIGNALS = 2

# Risk Decay Constants
# Grace period: Wait 45 seconds of normal behavior before risk even begins to decay
DECAY_GRACE_PERIOD_SECONDS = 45.0

# Decay rate: 0.5 points per second (Takes ~80 seconds to decay from High Risk 80 -> Under Review 40)
DECAY_RATE_PER_SECOND = 0.5

# Backend API Endpoints
DEFAULT_BACKEND_URL = 'http://127.0.0.1:8000/api'
