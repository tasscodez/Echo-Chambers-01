import React, { useState, useRef, useEffect } from 'react';
import { useGame } from '../contexts/GameContext';
import { chatWithEcho } from '../utils/api';

const ChatInterface = ({ isOpen, onClose }) => {
  const { gameState, addConversation, updateMood, learnSpell, unlockArea } = useGame();
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [chatHistory, setChatHistory] = useState([]);
  const messagesEndRef = useRef(null);

  // Load conversation history on mount
  useEffect(() => {
    setChatHistory(gameState.conversation_history || []);
  }, [gameState.conversation_history]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory]);

  const sendMessage = async () => {
    if (!message.trim()) return;

    const userMessage = message.trim();
    setMessage('');
    setIsTyping(true);

    // Add user message to history
    const userMsgObj = {
      id: Date.now(),
      message: userMessage,
      isEcho: false,
      timestamp: new Date().toISOString()
    };
    
    setChatHistory(prev => [...prev, userMsgObj]);
    addConversation(userMessage, false);

    try {
      // Send to Echo API
      const response = await chatWithEcho(
        gameState.player_name,
        userMessage,
        {
          mood: gameState.mood,
          location: gameState.position,
          spells: gameState.spells,
          unlocked_areas: gameState.unlocked_areas
        }
      );

      // Add Echo's response
      const echoMsgObj = {
        id: Date.now() + 1,
        message: response.message,
        isEcho: true,
        timestamp: new Date().toISOString()
      };

      setChatHistory(prev => [...prev, echoMsgObj]);
      addConversation(response.message, true);

      // Handle game state changes from Echo's response
      if (response.mood_change) {
        updateMood(response.mood_change);
      }

      if (response.spell_learned) {
        learnSpell(response.spell_learned);
      }

      if (response.area_unlocked) {
        unlockArea(response.area_unlocked, response.area_unlocked.replace('_', ' '));
      }

    } catch (error) {
      console.error('Error chatting with Echo:', error);
      
      // Fallback response
      const errorMsgObj = {
        id: Date.now() + 1,
        message: "I feel a disturbance in our connection... please try speaking to me again.",
        isEcho: true,
        timestamp: new Date().toISOString()
      };
      
      setChatHistory(prev => [...prev, errorMsgObj]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className={`chat-interface ${isOpen ? 'open' : ''}`}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
        <h3 style={{ color: '#9333ea', margin: 0 }}>
          💫 Speaking with Echo
        </h3>
        <button
          onClick={onClose}
          style={{
            background: 'rgba(239, 68, 68, 0.8)',
            border: 'none',
            borderRadius: '8px',
            color: 'white',
            padding: '4px 8px',
            cursor: 'pointer',
            fontSize: '0.8rem'
          }}
        >
          ✕
        </button>
      </div>

      <div className="chat-messages">
        {chatHistory.map(msg => (
          <div
            key={msg.id}
            className={`chat-message ${msg.isEcho ? 'echo' : ''}`}
          >
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '5px'
            }}>
              <strong style={{ color: msg.isEcho ? '#9333ea' : '#ec4899' }}>
                {msg.isEcho ? 'Echo' : gameState.player_name}
              </strong>
              <span style={{ fontSize: '0.7rem', opacity: 0.6 }}>
                {new Date(msg.timestamp).toLocaleTimeString()}
              </span>
            </div>
            <p style={{ margin: 0, lineHeight: '1.4' }}>{msg.message}</p>
          </div>
        ))}
        
        {isTyping && (
          <div className="chat-message echo">
            <strong style={{ color: '#9333ea' }}>Echo</strong>
            <p style={{ margin: 0, fontStyle: 'italic', opacity: 0.7 }}>
              Echo is contemplating your words...
            </p>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      <div className="chat-input-container">
        <textarea
          className="chat-input"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Speak your thoughts to Echo..."
          rows={2}
          disabled={isTyping}
          style={{
            resize: 'none',
            fontFamily: 'inherit'
          }}
        />
        <button
          className="chat-send-button"
          onClick={sendMessage}
          disabled={isTyping || !message.trim()}
        >
          {isTyping ? '...' : '📤'}
        </button>
      </div>

      {/* Quick conversation starters */}
      <div style={{ marginTop: '10px' }}>
        <p style={{ fontSize: '0.8rem', opacity: 0.7, marginBottom: '5px' }}>
          Quick thoughts:
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
          {[
            "I feel lost...",
            "Show me magic",
            "I want to explore",
            "Tell me about this place",
            "I need guidance"
          ].map(starter => (
            <button
              key={starter}
              onClick={() => setMessage(starter)}
              style={{
                background: 'rgba(147, 51, 234, 0.3)',
                border: '1px solid rgba(147, 51, 234, 0.5)',
                borderRadius: '12px',
                color: 'white',
                padding: '4px 8px',
                fontSize: '0.7rem',
                cursor: 'pointer'
              }}
            >
              {starter}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;