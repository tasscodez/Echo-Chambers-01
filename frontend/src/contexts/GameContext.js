import React, { createContext, useContext, useState, useEffect } from 'react';
import { saveGame, loadGame } from '../utils/api';

const GameContext = createContext();

export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
};

export const GameProvider = ({ children, playerName }) => {
  const [gameState, setGameState] = useState({
    player_name: playerName,
    position: { x: 0, y: 0, z: 0 },
    mood: 'neutral',
    unlocked_areas: ['castle_entrance'],
    inventory: [],
    spells: [],
    journal_entries: [],
    conversation_history: [],
    quick_notes: [],
    room_decorations: {},
    mini_games_completed: [],
    mini_games_unlocked: ['retro_shooter_1'],
    location_names: { 'castle_entrance': 'Castle Entrance' }
  });

  const [isLoading, setIsLoading] = useState(true);

  // Load game on startup
  useEffect(() => {
    const loadPlayerGame = async () => {
      try {
        const savedGame = await loadGame(playerName);
        setGameState(savedGame);
      } catch (error) {
        console.error('Error loading game:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadPlayerGame();
  }, [playerName]);

  // Auto-save every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      saveGameState();
    }, 30000);

    return () => clearInterval(interval);
  }, [gameState]);

  const saveGameState = async () => {
    try {
      await saveGame(gameState);
    } catch (error) {
      console.error('Error saving game:', error);
    }
  };

  const updateGameState = (updates) => {
    setGameState(prev => ({
      ...prev,
      ...updates
    }));
  };

  const addToInventory = (item) => {
    setGameState(prev => ({
      ...prev,
      inventory: [...prev.inventory, { ...item, id: Date.now() }]
    }));
  };

  const removeFromInventory = (itemId) => {
    setGameState(prev => ({
      ...prev,
      inventory: prev.inventory.filter(item => item.id !== itemId)
    }));
  };

  const unlockArea = (areaId, areaName) => {
    setGameState(prev => ({
      ...prev,
      unlocked_areas: [...prev.unlocked_areas, areaId],
      location_names: {
        ...prev.location_names,
        [areaId]: areaName
      }
    }));
  };

  const learnSpell = (spell) => {
    setGameState(prev => ({
      ...prev,
      spells: [...prev.spells, { ...spell, id: Date.now() }]
    }));
  };

  const updateMood = (newMood) => {
    setGameState(prev => ({
      ...prev,
      mood: newMood
    }));
  };

  const addConversation = (message, isEcho = false) => {
    setGameState(prev => ({
      ...prev,
      conversation_history: [...prev.conversation_history, {
        id: Date.now(),
        message,
        isEcho,
        timestamp: new Date().toISOString()
      }]
    }));
  };

  const value = {
    gameState,
    isLoading,
    updateGameState,
    addToInventory,
    removeFromInventory,
    unlockArea,
    learnSpell,
    updateMood,
    addConversation,
    saveGameState
  };

  return (
    <GameContext.Provider value={value}>
      {children}
    </GameContext.Provider>
  );
};