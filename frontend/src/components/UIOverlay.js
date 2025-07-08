import React from 'react';
import { useGame } from '../contexts/GameContext';
import useKeyControls from '../hooks/useKeyControls';

const UIOverlay = ({ showQuickMenu, setShowQuickMenu, showChat, setShowChat }) => {
  const { gameState } = useGame();
  const { keyBindings } = useKeyControls();

  return (
    <div className="ui-overlay">
      {/* Quick Menu Toggle */}
      <button 
        className="quick-menu-toggle"
        onClick={() => setShowQuickMenu(!showQuickMenu)}
        title="Quick Menu (M)"
      >
        ☰
      </button>

      {/* Chat Toggle */}
      <button 
        className="chat-toggle"
        onClick={() => setShowChat(!showChat)}
        title="Chat with Echo (T)"
      >
        💬
      </button>

      {/* Controls Display */}
      <div className="controls-display">
        <h3>Controls</h3>
        <p><strong>Move:</strong> {keyBindings.forward}/{keyBindings.left}/{keyBindings.backward}/{keyBindings.right}</p>
        <p><strong>Jump:</strong> {keyBindings.jump}</p>
        <p><strong>Fly:</strong> {keyBindings.fly} (hold)</p>
        <p><strong>Run:</strong> {keyBindings.run} (hold)</p>
        <p><strong>Crouch:</strong> {keyBindings.crouch}</p>
        <p><strong>Interact:</strong> {keyBindings.interact}</p>
        <p><strong>Swim:</strong> {keyBindings.swim}</p>
        <p><strong>Menu:</strong> {keyBindings.quickMenu}</p>
        <p><strong>Chat:</strong> {keyBindings.chat}</p>
      </div>

      {/* Mood Indicator */}
      <div className="mood-indicator">
        <h3>Current Mood</h3>
        <div 
          className="mood-orb"
          style={{
            background: getMoodColor(gameState.mood)
          }}
        ></div>
        <p>{gameState.mood.charAt(0).toUpperCase() + gameState.mood.slice(1)}</p>
      </div>

      {/* Player Stats */}
      <div className="player-stats" style={{
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        background: 'rgba(0, 0, 0, 0.8)',
        border: '2px solid rgba(147, 51, 234, 0.5)',
        borderRadius: '10px',
        padding: '15px',
        backdropFilter: 'blur(10px)',
        minWidth: '150px'
      }}>
        <h3 style={{ marginBottom: '10px', color: '#9333ea' }}>Stats</h3>
        <p style={{ marginBottom: '5px', opacity: '0.8' }}>
          Spells: {gameState.spells.length}
        </p>
        <p style={{ marginBottom: '5px', opacity: '0.8' }}>
          Items: {gameState.inventory.length}
        </p>
        <p style={{ marginBottom: '5px', opacity: '0.8' }}>
          Areas: {gameState.unlocked_areas.length}
        </p>
        <p style={{ opacity: '0.8' }}>
          Position: ({Math.round(gameState.position.x)}, {Math.round(gameState.position.z)})
        </p>
      </div>

      {/* Interaction Prompts */}
      <div className="interaction-prompts" style={{
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        textAlign: 'center',
        pointerEvents: 'none'
      }}>
        {/* These would be conditionally shown based on proximity to interactive objects */}
        {/* For now, just a placeholder */}
      </div>
    </div>
  );
};

const getMoodColor = (mood) => {
  switch (mood) {
    case 'melancholic':
      return 'radial-gradient(circle, #6366f1, #4f46e5)';
    case 'radiant':
      return 'radial-gradient(circle, #fbbf24, #d97706)';
    case 'contemplative':
      return 'radial-gradient(circle, #8b5cf6, #7c3aed)';
    case 'peaceful':
      return 'radial-gradient(circle, #10b981, #047857)';
    default:
      return 'radial-gradient(circle, #9333ea, #ec4899)';
  }
};

export default UIOverlay;