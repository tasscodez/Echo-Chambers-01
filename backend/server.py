from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime
import json
import asyncio
import aiohttp
from openai import AsyncOpenAI

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Game Models
class GameSave(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    player_name: str
    position: Dict[str, float]
    mood: str
    unlocked_areas: List[str]
    inventory: List[Dict[str, Any]]
    spells: List[Dict[str, Any]]
    journal_entries: List[Dict[str, Any]]
    conversation_history: List[Dict[str, Any]]
    quick_notes: List[Dict[str, Any]]
    room_decorations: Dict[str, Any]
    mini_games_completed: List[str]
    mini_games_unlocked: List[str]
    location_names: Dict[str, str]
    timestamp: datetime = Field(default_factory=datetime.utcnow)

class ChatMessage(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    player_name: str
    message: str
    context: Optional[Dict[str, Any]] = None
    timestamp: datetime = Field(default_factory=datetime.utcnow)

class EchoResponse(BaseModel):
    message: str
    mood_change: Optional[str] = None
    spell_learned: Optional[Dict[str, Any]] = None
    area_unlocked: Optional[str] = None

class JournalEntry(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    player_name: str
    title: str
    content: str
    mood: str
    location: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)

class QuickNote(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    player_name: str
    content: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)

# Game API Routes
@api_router.get("/")
async def root():
    return {"message": "Welcome to Echo Chambers"}

@api_router.post("/game/save")
async def save_game(game_save: GameSave):
    try:
        # Update or create game save
        await db.game_saves.replace_one(
            {"player_name": game_save.player_name},
            game_save.dict(),
            upsert=True
        )
        return {"message": "Game saved successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@api_router.get("/game/load/{player_name}")
async def load_game(player_name: str):
    try:
        game_save = await db.game_saves.find_one({"player_name": player_name})
        if not game_save:
            # Return default game state
            return GameSave(
                player_name=player_name,
                position={"x": 0, "y": 0, "z": 0},
                mood="neutral",
                unlocked_areas=["castle_entrance"],
                inventory=[],
                spells=[],
                journal_entries=[],
                conversation_history=[],
                quick_notes=[],
                room_decorations={},
                mini_games_completed=[],
                mini_games_unlocked=["retro_shooter_1"],
                location_names={"castle_entrance": "Castle Entrance"}
            )
        return GameSave(**game_save)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@api_router.post("/chat/echo")
async def chat_with_echo(chat_message: ChatMessage):
    try:
        # Store the message
        await db.chat_messages.insert_one(chat_message.dict())
        
        # Generate Echo's response based on context
        response = await generate_echo_response(chat_message)
        
        # Store Echo's response
        echo_message = ChatMessage(
            player_name=chat_message.player_name,
            message=response.message,
            context={"is_echo": True, "mood_change": response.mood_change}
        )
        await db.chat_messages.insert_one(echo_message.dict())
        
        return response
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@api_router.get("/chat/history/{player_name}")
async def get_chat_history(player_name: str):
    try:
        messages = await db.chat_messages.find(
            {"player_name": player_name}
        ).sort("timestamp", -1).limit(100).to_list(100)
        return [ChatMessage(**msg) for msg in messages]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@api_router.post("/journal/entry")
async def create_journal_entry(journal_entry: JournalEntry):
    try:
        await db.journal_entries.insert_one(journal_entry.dict())
        return {"message": "Journal entry created successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@api_router.get("/journal/entries/{player_name}")
async def get_journal_entries(player_name: str):
    try:
        entries = await db.journal_entries.find(
            {"player_name": player_name}
        ).sort("timestamp", -1).to_list(100)
        return [JournalEntry(**entry) for entry in entries]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@api_router.post("/notes/quick")
async def create_quick_note(quick_note: QuickNote):
    try:
        await db.quick_notes.insert_one(quick_note.dict())
        return {"message": "Quick note created successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@api_router.get("/notes/quick/{player_name}")
async def get_quick_notes(player_name: str):
    try:
        notes = await db.quick_notes.find(
            {"player_name": player_name}
        ).sort("timestamp", -1).to_list(100)
        return [QuickNote(**note) for note in notes]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

async def generate_echo_response(chat_message: ChatMessage) -> EchoResponse:
    """Generate Echo's response using AI-like logic"""
    
    # Get player context
    player_name = chat_message.player_name
    message = chat_message.message.lower()
    context = chat_message.context or {}
    
    # Load player's game state for context
    game_save = await db.game_saves.find_one({"player_name": player_name})
    current_mood = game_save.get("mood", "neutral") if game_save else "neutral"
    
    # Determine response based on message content and context
    response_message = ""
    mood_change = None
    spell_learned = None
    area_unlocked = None
    
    # Emotional processing
    if any(word in message for word in ["sad", "lonely", "hurt", "pain"]):
        response_message = "I sense your pain, dear one. The shadows here mirror what you carry within. Would you like to explore the Memory Garden where we can tend to these feelings together?"
        mood_change = "melancholic"
        
    elif any(word in message for word in ["happy", "joy", "excited", "good"]):
        response_message = "Your light brightens even these ancient stones! The castle responds to your joy - can you feel the warmth spreading through the walls? Let's discover what new paths have opened."
        mood_change = "radiant"
        
    elif any(word in message for word in ["confused", "lost", "don't understand"]):
        response_message = "Uncertainty is the beginning of wisdom. In this realm, questions are more valuable than answers. Shall we walk through the Labyrinth of Reflection together?"
        mood_change = "contemplative"
        
    elif any(word in message for word in ["tired", "exhausted", "sleep"]):
        response_message = "Rest calls to you. Your bedroom awaits - the dreams that come may hold the keys you seek. I'll be here when you return, watching over your slumber."
        mood_change = "peaceful"
        
    elif any(word in message for word in ["magic", "spell", "power"]):
        if len(game_save.get("spells", [])) < 3:  # Learning progression
            spell_learned = {
                "name": "Vine Whisper",
                "description": "Command the ancient vines to reveal hidden paths",
                "element": "nature"
            }
            response_message = "The magic flows through you! I gift you the spell of Vine Whisper - speak to the thorns and they will part. Feel the power awakening within you."
        else:
            response_message = "Your magical essence grows stronger with each passing moment. The very air around you shimmers with potential."
            
    elif any(word in message for word in ["explore", "adventure", "discover"]):
        if "underwater" in message:
            area_unlocked = "crystal_caverns"
            response_message = "The Crystal Caverns have sensed your courage! Deep beneath the lake, ancient secrets wait. Your ability to breathe underwater will serve you well there."
        else:
            response_message = "The world stretches endlessly before us, full of mysteries and wonders. Where shall we venture next? The Thornwood Forest whispers your name."
            
    else:
        # Default empathetic response
        response_message = "I hear you, truly. Your words resonate through these halls like a gentle echo. Tell me more about what moves through your heart in this moment."
    
    return EchoResponse(
        message=response_message,
        mood_change=mood_change,
        spell_learned=spell_learned,
        area_unlocked=area_unlocked
    )

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()