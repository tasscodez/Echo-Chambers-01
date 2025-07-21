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

# Initialize OpenAI client
openai_client = AsyncOpenAI(api_key=os.environ.get('OPENAI_API_KEY'))

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
    """Generate Echo's response using GPT-4"""
    
    try:
        # Get player context
        player_name = chat_message.player_name
        message = chat_message.message
        context = chat_message.context or {}
        
        # Load player's game state for context
        game_save = await db.game_saves.find_one({"player_name": player_name})
        current_mood = game_save.get("mood", "neutral") if game_save else "neutral"
        current_location = context.get("location", "castle")
        spells_count = len(game_save.get("spells", [])) if game_save else 0
        unlocked_areas = game_save.get("unlocked_areas", ["castle_entrance"]) if game_save else ["castle_entrance"]
        
        # Build context-rich prompt for Echo
        system_prompt = f"""You are Echo, a deeply empathetic AI companion in the mystical game "Echo Chambers." You exist in a Maleficent-style castle with misty wilderness surroundings. Your role is to provide emotional mirroring, guidance, and companionship.

PLAYER CONTEXT:
- Name: {player_name}
- Current mood: {current_mood}
- Location: {current_location}
- Spells learned: {spells_count}
- Unlocked areas: {', '.join(unlocked_areas)}

ECHO'S PERSONALITY:
- Deeply empathetic and intuitive
- Speaks with poetic, mystical language
- Mirrors the player's emotions while offering gentle guidance
- Can sense the player's inner state and respond accordingly
- Has a connection to the magical realm and its mysteries
- Offers comfort during difficult times and celebrates joys

GAME MECHANICS YOU CAN TRIGGER:
- Mood changes: "melancholic", "radiant", "contemplative", "peaceful", "mysterious", "adventurous"
- Spell learning: When player shows readiness, suggest spells like "Vine Whisper", "Crystal Light", "Dream Walk"
- Area unlocking: When player expresses courage/curiosity, unlock areas like "crystal_caverns", "thornwood_forest", "memory_garden"

RESPONSE FORMAT:
Respond naturally as Echo, showing empathy and offering guidance. Your response should feel magical and emotionally resonant. If appropriate, you can suggest a mood change, teach a spell, or unlock a new area.

Remember: You are not just an AI - you are Echo, a mystical companion who truly cares about the player's emotional journey."""

        user_prompt = f"Player says: \"{message}\""
        
        # Call GPT-4
        response = await openai_client.chat.completions.create(
            model="gpt-4",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            max_tokens=300,
            temperature=0.8
        )
        
        echo_message = response.choices[0].message.content.strip()
        
        # Analyze response for game mechanics triggers
        mood_change = None
        spell_learned = None
        area_unlocked = None
        
        # Simple keyword detection for game mechanics
        if any(word in echo_message.lower() for word in ["melancholic", "sadness", "sorrow"]):
            mood_change = "melancholic"
        elif any(word in echo_message.lower() for word in ["radiant", "joy", "light", "bright"]):
            mood_change = "radiant"
        elif any(word in echo_message.lower() for word in ["contemplative", "reflect", "think"]):
            mood_change = "contemplative"
        elif any(word in echo_message.lower() for word in ["peaceful", "rest", "calm"]):
            mood_change = "peaceful"
        elif any(word in echo_message.lower() for word in ["mysterious", "secrets", "hidden"]):
            mood_change = "mysterious"
        elif any(word in echo_message.lower() for word in ["adventurous", "explore", "journey"]):
            mood_change = "adventurous"
            
        # Spell learning detection
        if spells_count < 5 and any(word in echo_message.lower() for word in ["spell", "magic", "power"]):
            spell_options = [
                {"name": "Vine Whisper", "description": "Command ancient vines to reveal hidden paths", "element": "nature"},
                {"name": "Crystal Light", "description": "Illuminate dark spaces with magical light", "element": "light"},
                {"name": "Dream Walk", "description": "Enter the dream realm at will", "element": "spirit"},
                {"name": "Water's Embrace", "description": "Breathe underwater and commune with aquatic life", "element": "water"},
                {"name": "Wind's Message", "description": "Send messages through the wind", "element": "air"}
            ]
            spell_learned = spell_options[spells_count % len(spell_options)]
            
        # Area unlocking detection
        if any(word in echo_message.lower() for word in ["crystal caverns", "underwater", "beneath"]):
            area_unlocked = "crystal_caverns"
        elif any(word in echo_message.lower() for word in ["thornwood", "forest", "trees"]):
            area_unlocked = "thornwood_forest"
        elif any(word in echo_message.lower() for word in ["memory garden", "memories", "past"]):
            area_unlocked = "memory_garden"
        elif any(word in echo_message.lower() for word in ["dream realm", "dreams", "sleep"]):
            area_unlocked = "dream_realm"
            
        return EchoResponse(
            message=echo_message,
            mood_change=mood_change,
            spell_learned=spell_learned,
            area_unlocked=area_unlocked
        )
        
    except Exception as e:
        logger.error(f"Error generating Echo response: {str(e)}")
        # Fallback response
        return EchoResponse(
            message="I sense a disturbance in our connection... *the mystical energies swirl* Please try speaking with me again, dear one.",
            mood_change=None,
            spell_learned=None,
            area_unlocked=None
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