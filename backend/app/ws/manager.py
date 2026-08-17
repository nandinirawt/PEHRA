from typing import Dict, List
from fastapi import WebSocket

class ConnectionManager:
    def __init__(self):
        # exam_id -> list of active websockets
        self.active_connections: Dict[str, List[WebSocket]] = {}

    async def connect(self, exam_id: str, websocket: WebSocket):
        await websocket.accept()
        if exam_id not in self.active_connections:
            self.active_connections[exam_id] = []
        self.active_connections[exam_id].append(websocket)

    def disconnect(self, exam_id: str, websocket: WebSocket):
        if exam_id in self.active_connections:
            self.active_connections[exam_id].remove(websocket)
            if not self.active_connections[exam_id]:
                del self.active_connections[exam_id]

    async def broadcast_to_exam(self, exam_id: str, message: dict):
        if exam_id in self.active_connections:
            for connection in self.active_connections[exam_id]:
                try:
                    await connection.send_json(message)
                except Exception:
                    pass

ws_manager = ConnectionManager()