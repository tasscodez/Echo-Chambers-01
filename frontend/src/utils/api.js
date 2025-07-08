import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Game API
export const saveGame = async (gameState) => {
  const response = await axios.post(`${API}/game/save`, gameState);
  return response.data;
};

export const loadGame = async (playerName) => {
  const response = await axios.get(`${API}/game/load/${playerName}`);
  return response.data;
};

// Chat API
export const chatWithEcho = async (playerName, message, context = {}) => {
  const response = await axios.post(`${API}/chat/echo`, {
    player_name: playerName,
    message,
    context
  });
  return response.data;
};

export const getChatHistory = async (playerName) => {
  const response = await axios.get(`${API}/chat/history/${playerName}`);
  return response.data;
};

// Journal API
export const createJournalEntry = async (playerName, title, content, mood, location) => {
  const response = await axios.post(`${API}/journal/entry`, {
    player_name: playerName,
    title,
    content,
    mood,
    location
  });
  return response.data;
};

export const getJournalEntries = async (playerName) => {
  const response = await axios.get(`${API}/journal/entries/${playerName}`);
  return response.data;
};

// Quick Notes API
export const createQuickNote = async (playerName, content) => {
  const response = await axios.post(`${API}/notes/quick`, {
    player_name: playerName,
    content
  });
  return response.data;
};

export const getQuickNotes = async (playerName) => {
  const response = await axios.get(`${API}/notes/quick/${playerName}`);
  return response.data;
};