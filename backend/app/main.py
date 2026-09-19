from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from app.db import engine, Base
from app.routers import exams, seats, calibration, pose, events, risk, reviews, privacy
from app.ws.manager import ws_manager

Base.metadata.create_all(bind=engine)

app = FastAPI(title="PEHRA Backend API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register All Routers
app.include_router(exams.router)
app.include_router(seats.router)
app.include_router(calibration.router)
app.include_router(pose.router)
app.include_router(events.router)
app.include_router(risk.router)
app.include_router(reviews.router)
app.include_router(privacy.router)

# Real-Time WebSocket Channel
@app.websocket("/ws/exams/{exam_id}")
async def exam_websocket_endpoint(websocket: WebSocket, exam_id: str):
    await ws_manager.connect(exam_id, websocket)
    try:
        while True:
            _ = await websocket.receive_text()
    except WebSocketDisconnect:
        ws_manager.disconnect(exam_id, websocket)