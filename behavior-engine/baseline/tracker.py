class BaselineTracker:
    def __init__(self):
        self.baselines = {}

    def update_baseline(self, seat_id: str, features: dict):
        if seat_id not in self.baselines:
            self.baselines[seat_id] = []
        self.baselines[seat_id].append(features)

    def get_baseline(self, seat_id: str):
        return self.baselines.get(seat_id, {})
