#!/usr/bin/env python3
"""
Chatting with Emotion - Backend Server
"""

import uuid
import hashlib
import json
from datetime import datetime
from typing import Optional, Dict, Any
from pathlib import Path
import sys

from fastapi import FastAPI, WebSocket, WebSocketDisconnect, Depends, HTTPException, Query
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel

# ==================== 경로 설정 ====================
CURRENT_DIR = Path(__file__).parent
sys.path.insert(0, str(CURRENT_DIR / "public"))

# ==================== 회원 정보 영구 저장 ====================
USERS_FILE = CURRENT_DIR / "users.json"

def load_users():
    if USERS_FILE.exists():
        with open(USERS_FILE, "r", encoding="utf-8") as f:
            data = json.load(f)
            for uid, user in data.items():
                users_db[uid] = user
    print(f"[INFO] Loaded {len(users_db)} users from file")

def save_users():
    with open(USERS_FILE, "w", encoding="utf-8") as f:
        json.dump(users_db, f, ensure_ascii=False, indent=2)

# ==================== Mood Engine ====================
USE_REAL_MOOD_ENGINE = False
MOOD_ENGINE = None
try:
    from mood_engine import get_engine
    MOOD_ENGINE = get_engine()
    USE_REAL_MOOD_ENGINE = True
except Exception as e:
    print(f"[WARN] mood_engine 로드 실패: {e}")

app = FastAPI(title="Chatting with Emotion")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

security = HTTPBearer(auto_error=False)

# ==================== 저장소 ====================
users_db: Dict[str, Dict[str, Any]] = {}
tokens_db: Dict[str, str] = {}
rooms_db: Dict[str, Dict[str, Any]] = {}
active_connections: Dict[str, Dict[str, WebSocket]] = {}

# ==================== Pydantic 모델 ====================
class LoginRequest(BaseModel):
    id: str
    password: str

class SignupRequest(BaseModel):
    nickname: str
    id: str
    password: str

class CreateRoomRequest(BaseModel):
    title: str
    subtitle: Optional[str] = ""
    maxParticipants: int = 6
    isPrivate: bool = False
    password: Optional[str] = None

class DelegateHostRequest(BaseModel):
    new_host: str

# ==================== 헬퍼 ====================
def hash_password(pw: str) -> str:
    return hashlib.sha256(pw.encode()).hexdigest()

def verify_password(plain: str, hashed: str) -> bool:
    return hash_password(plain) == hashed

def get_current_user(credentials: Optional[HTTPAuthorizationCredentials] = Depends(security)):
    if not credentials:
        raise HTTPException(401, "인증이 필요합니다")
    token = credentials.credentials
    if token not in tokens_db:
        raise HTTPException(401, "유효하지 않은 토큰")
    uid = tokens_db[token]
    if uid not in users_db:
        raise HTTPException(401, "사용자를 찾을 수 없습니다")
    return users_db[uid]

def analyze_mood_simple(text: str) -> str:
    if not text: return "neutral"
    msg = text.lower()
    if any(w in msg for w in ["happy","good","great","awesome","love","joy","excited","wonderful","nice","fun","beautiful","amazing"]): return "Happy"
    if any(w in msg for w in ["sad","bad","cry","depressed","unhappy","sorry","miss","lonely","hurt"]): return "Sad"
    if any(w in msg for w in ["angry","hate","furious","mad","annoyed","rage"]): return "Angry"
    return "neutral"

async def get_mood(user_id: str, room_id: str, message: str) -> str:
    if USE_REAL_MOOD_ENGINE and MOOD_ENGINE:
        try:
            mood = await MOOD_ENGINE.query(user_id=user_id, room_id=room_id, message=message)
            if mood in ("Happy", "Sad", "Angry"): return mood
        except Exception as e:
            print(f"[MoodEngine Error] {e}")
    return analyze_mood_simple(message)

def get_participants(room):
    parts = room.get("participants", {})
    lst = [{"name": n, "isOnline": v.get("is_online", False), "lastSeen": v.get("last_seen")} for n, v in parts.items()]
    lst.sort(key=lambda x: (not x["isOnline"], x["name"].lower()))
    return lst

def get_messages(room, limit=50):
    msgs = room.get("messages", [])[-limit:]
    return [{"senderName": m.get("senderName", m.get("username", "Unknown")), 
             "message": m.get("message", ""), 
             "emotion": m.get("emotion", "neutral")} for m in msgs]

# ==================== API 라우트 ====================
@app.get("/api/check-id")
async def check_id(id: str = Query(..., min_length=4)):
    if id in users_db:
        raise HTTPException(409, "This ID is already in use.")
    return {"available": True}

@app.post("/api/signup")
async def signup(data: SignupRequest):
    if data.id in users_db:
        raise HTTPException(409, "This ID is already in use.")
    
    users_db[data.id] = {
        "id": data.id,
        "nickname": data.nickname or data.id,
        "password": hash_password(data.password),
        "created_at": datetime.now().isoformat()
    }
    save_users()                    # ← 회원가입 시 저장
    return {"message": "회원가입 성공"}

@app.post("/api/login")
async def login(data: LoginRequest):
    if data.id not in users_db or not verify_password(data.password, users_db[data.id]["password"]):
        raise HTTPException(401, "ID 또는 비밀번호가 잘못되었습니다")
    token = str(uuid.uuid4())
    tokens_db[token] = data.id
    return {"token": token, "userName": users_db[data.id]["nickname"]}

@app.get("/api/rooms")
async def list_rooms(page: int = 1, limit: int = 20, search: str = ""):
    q = search.lower().strip()
    filtered = []
    for rid, r in rooms_db.items():
        if not q or q in r.get("title","").lower() or q in str(r.get("host","")).lower():
            filtered.append({
                "id": rid, "title": r.get("title"), "host": r.get("host"),
                "count": r.get("count", len(r.get("participants", {}))), "max": r.get("max_participants", 6)
            })
    filtered.sort(key=lambda x: rooms_db.get(x["id"],{}).get("created_at",""), reverse=True)
    start = (page-1)*limit
    return {"rooms": filtered[start:start+limit], "totalRooms": len(filtered)}

@app.post("/api/rooms")
async def create_room(data: CreateRoomRequest, user=Depends(get_current_user)):
    rid = str(uuid.uuid4())[:8]
    nick = user["nickname"]
    rooms_db[rid] = {
        "id": rid, "title": data.title, "subtitle": data.subtitle or "",
        "host": nick, "max_participants": data.maxParticipants,
        "is_private": data.isPrivate, "password": data.password if data.isPrivate else None,
        "count": 1, "created_at": datetime.now().isoformat(),
        "messages": [], "participants": {nick: {"is_online": False, "last_seen": None}}
    }
    return {"roomId": rid, "status": "success"}

@app.get("/api/rooms/{room_id}/")
async def get_room(room_id: str, user=Depends(get_current_user)):
    if room_id not in rooms_db:
        raise HTTPException(404, "방을 찾을 수 없습니다")
    r = rooms_db[room_id]
    return {"hostName": r["host"], "users": get_participants(r), "messages": get_messages(r)}

@app.delete("/api/rooms/{room_id}/")
async def delete_room(room_id: str, user=Depends(get_current_user)):
    if room_id not in rooms_db or rooms_db[room_id]["host"] != user["nickname"]:
        raise HTTPException(403, "권한이 없습니다")
    if room_id in active_connections:
        for ws in list(active_connections[room_id].values()):
            try: await ws.close()
            except: pass
        del active_connections[room_id]
    del rooms_db[room_id]
    return {"status": "deleted"}

@app.post("/api/rooms/{room_id}/delegate/")
async def delegate_host(room_id: str, data: DelegateHostRequest, user=Depends(get_current_user)):
    if room_id not in rooms_db or rooms_db[room_id]["host"] != user["nickname"]:
        raise HTTPException(403, "권한이 없습니다")
    rooms_db[room_id]["host"] = data.new_host
    return {"status": "success", "newHost": data.new_host}

@app.post("/api/rooms/{room_id}/leave/")
async def leave_room(room_id: str, user=Depends(get_current_user)):
    if room_id in rooms_db and user["nickname"] in rooms_db[room_id].get("participants", {}):
        rooms_db[room_id]["participants"][user["nickname"]]["is_online"] = False
    return {"status": "ok"}

# ==================== WebSocket ====================
@app.websocket("/ws/chat/{room_id}/")
async def websocket_chat(ws: WebSocket, room_id: str, token: str = Query(...)):
    if token not in tokens_db:
        await ws.close(1008); return
    uid = tokens_db[token]
    if uid not in users_db:
        await ws.close(1008); return
    nick = users_db[uid]["nickname"]
    if room_id not in rooms_db:
        await ws.close(1003); return

    room = rooms_db[room_id]
    await ws.accept()
    active_connections.setdefault(room_id, {})[nick] = ws
    room.setdefault("participants", {}).setdefault(nick, {"is_online": False, "last_seen": None})["is_online"] = True

    try:
        while True:
            data = await ws.receive_json()
            text = data.get("message", "").strip()
            if not text: continue

            mood = await get_mood(nick, room_id, text)
            emotion = mood if mood in ("Happy", "Sad", "Angry") else "neutral"

            msg_record = {"senderName": nick, "message": text, "emotion": emotion, "timestamp": datetime.now().isoformat()}
            room.setdefault("messages", []).append(msg_record)
            if len(room["messages"]) > 200:
                room["messages"] = room["messages"][-200:]

            payload = {"message": text, "username": nick, "emotion": emotion}
            for target_ws in list(active_connections.get(room_id, {}).values()):
                try: await target_ws.send_json(payload)
                except: pass
    except WebSocketDisconnect:
        pass
    finally:
        if room_id in active_connections and nick in active_connections[room_id]:
            del active_connections[room_id][nick]
        if nick in room.get("participants", {}):
            room["participants"][nick]["is_online"] = False
            room["participants"][nick]["last_seen"] = datetime.now().isoformat()

# ==================== /api.js 우회 라우트 ====================
@app.get("/api.js", include_in_schema=False)
async def serve_api_js():
    return FileResponse(str(CURRENT_DIR / "public" / "js" / "api.js"), media_type="application/javascript")

# ==================== 정적 파일 서빙 ====================
app.mount("/", StaticFiles(directory="public", html=True), name="static")

# ==================== Startup ====================
@app.on_event("startup")
async def startup_event():
    load_users()   # ← 회원 정보 불러오기

    mood_mode = "DeepSeek LLM (실제)" if USE_REAL_MOOD_ENGINE else "간단 키워드 분석 (데모)"
    print("\n" + "="*65)
    print("🚀 Chatting with Emotion 서버 시작!")
    print(f"   접속 주소 : http://localhost:8000")
    print(f"   Mood 분석 : {mood_mode}")
    print("="*65 + "\n")

    if "testuser" not in users_db:
        users_db["testuser"] = {
            "id": "testuser", "nickname": "testuser",
            "password": hash_password("12345678"),
            "created_at": datetime.now().isoformat()
        }
        print("✅ 테스트 계정 생성 완료 → ID: testuser / PW: 12345678\n")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("server:app", host="0.0.0.0", port=8000, reload=True)