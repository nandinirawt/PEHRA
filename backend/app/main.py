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
    print("[DECAY WORKER] Active and monitoring decay...")
    while True:
        await asyncio.sleep(1.0)
        current_time = time.time()

        db: Session = SessionLocal()
        try:
            # Query all active exams or fallback to both common exam IDs
            db_exams = db.query(Exam).all()
            exam_ids = [e.exam_id for e in db_exams] if db_exams else []
            for target_id in ["EXAM-101", "EXAM-01"]:
                if target_id not in exam_ids:
                    exam_ids.append(target_id)

            for e_id in exam_ids:
                # Query seats for this exam or track B-04
                db_seats = db.query(Seat).filter(Seat.exam_id == e_id).all()
                active_seats = [s.seat_id for s in db_seats] if db_seats else ["B-04"]

                decay_updates = risk_engine.tick_decay_all(active_seats, current_time, exam_id=e_id)
                if decay_updates:
                    for upd in decay_updates:
                        upd["exam_id"] = e_id
                        await ws_manager.broadcast(e_id, {
                            "type": "RISK_UPDATE",
                            "data": upd
                        })
        except Exception as err:
            print(f"[DECAY WORKER ERROR]: {err}")
        finally:
            db.close()


@asynccontextmanager
async def lifespan(app: FastAPI):
    decay_task = asyncio.create_task(background_decay_worker())
    yield
    decay_task.cancel()


app = FastAPI(title="PEHRA Backend API", version="1.0.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(exams.router)
app.include_router(seats.router)
app.include_router(calibration.router)
app.include_router(pose.router)
app.include_router(events.router)
app.include_router(risk.router)
app.include_router(reviews.router)
app.include_router(privacy.router)

@app.websocket("/ws/exams/{exam_id}")
async def exam_websocket_endpoint(websocket: WebSocket, exam_id: str):
    await ws_manager.connect(exam_id, websocket)
    try:
        while True:
            _ = await websocket.receive_text()
    except WebSocketDisconnect:
        ws_manager.disconnect(exam_id, websocket)
