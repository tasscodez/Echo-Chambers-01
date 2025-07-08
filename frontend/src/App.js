import React, { useState, useEffect } from 'react';
import './App.css';
import Game from './components/Game';
import LoadingScreen from './components/LoadingScreen';
import { GameProvider } from './contexts/GameContext';

function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [playerName, setPlayerName] = useState('');

  useEffect(() => {
    // Simulate loading time
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (!playerName) {
    return (
      <div className="name-input-screen">
        <div className="castle-bg">
          <div className="name-input-container">
            <h1 className="game-title">Echo Chambers</h1>
            <p className="game-subtitle">Enter your name to begin your journey</p>
            <input
              type="text"
              placeholder="Your name..."
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              className="name-input"
              onKeyPress={(e) => e.key === 'Enter' && playerName.trim() && setPlayerName(playerName.trim())}
            />
            <button
              onClick={() => playerName.trim() && setPlayerName(playerName.trim())}
              className="start-button"
              disabled={!playerName.trim()}
            >
              Enter the Castle
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <GameProvider playerName={playerName}>
      <div className="App">
        <Game />
      </div>
    </GameProvider>
  );
}

export default App;