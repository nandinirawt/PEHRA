import asyncio
import time
from contextlib import asynccontextmanager

from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from app.db import engine, Base, SessionLocal
from app.models.models import Seat, Exam
from app.routers import exams, seats, calibration, pose, events, risk, reviews, privacy
from app.routers.pose import risk_engine
from app.ws.manager import ws_manager

Base.metadata.create_all(bind=engine)


async def background_decay_worker():
    """
    Background worker that runs every second.
    Decays risk scores for seats that have had no anomalous activity.
    """
    while True:
        await asyncio.sleep(1.0)
        current_time = time.time()

        db: Session = SessionLocal()
        try:
            # Query active exams (e.g., status == 'live')
            active_exams = db.query(Exam).filter(Exam.status == "live").all()

            for exam in active_exams:
                exam_seats = db.query(Seat).filter(Seat.exam_id == exam.exam_id).all()
                active_seat_ids = [s.seat_id for s in exam_seats]

                if active_seat_ids:
                    # Apply decay via behavior engine
                    risk_engine.tick_decay_all(active_seat_ids, current_time, exam_id=exam.exam_id)
        except Exception as err:
            # Silent catch to avoid killing the background loop
            pass
        finally:
            db.close()


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Start decay loop on server boot
    decay_task = asyncio.create_task(background_decay_worker())
    yield
    # Cancel task on shutdown
    decay_task.cancel()


app = FastAPI(title="PEHRA Backend API", version="1.0.0", lifespan=lifespan)

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