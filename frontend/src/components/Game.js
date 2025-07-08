import React, { useState, useRef, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { Physics } from '@react-three/drei';
import GameWorld from './GameWorld';
import Player from './Player';
import Echo from './Echo';
import QuickMenu from './QuickMenu';
import ChatInterface from './ChatInterface';
import UIOverlay from './UIOverlay';
import { useGame } from '../contexts/GameContext';
import useKeyControls from '../hooks/useKeyControls';

const Game = () => {
  const { gameState, isLoading } = useGame();
  const [showQuickMenu, setShowQuickMenu] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [currentMusic, setCurrentMusic] = useState(null);
  const { isKeyPressed } = useKeyControls();
  const audioRef = useRef(null);

  // Handle key press for menu toggles
  useEffect(() => {
    const handleKeyPress = (event) => {
      if (event.code === 'KeyM' && !event.repeat) {
        setShowQuickMenu(prev => !prev);
      }
      if (event.code === 'KeyT' && !event.repeat) {
        setShowChat(prev => !prev);
      }
      if (event.code === 'Escape') {
        setShowQuickMenu(false);
        setShowChat(false);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  // Music system
  useEffect(() => {
    const updateMusic = () => {
      let newTrack = null;
      
      switch (gameState.mood) {
        case 'melancholic':
          newTrack = 'sadness_track.mp3';
          break;
        case 'radiant':
          newTrack = 'joy_track.mp3';
          break;
        case 'contemplative':
          newTrack = 'reflection_track.mp3';
          break;
        case 'peaceful':
          newTrack = 'calm_track.mp3';
          break;
        default:
          newTrack = 'ambient_track.mp3';
      }

      if (newTrack !== currentMusic) {
        setCurrentMusic(newTrack);
        // Here you would actually load and play the music
        // For now, we'll just log it
        console.log(`Playing music: ${newTrack}`);
      }
    };

    updateMusic();
  }, [gameState.mood, currentMusic]);

  if (isLoading) {
    return <div className="loading-screen">Loading your world...</div>;
  }

  return (
    <div className="game-canvas">
      <Canvas
        camera={{ position: [0, 5, 10], fov: 60 }}
        shadows
        gl={{ antialias: true }}
      >
        <Physics>
          <GameWorld />
          <Player />
          <Echo />
        </Physics>
      </Canvas>
      
      <UIOverlay 
        showQuickMenu={showQuickMenu}
        setShowQuickMenu={setShowQuickMenu}
        showChat={showChat}
        setShowChat={setShowChat}
      />
      
      <QuickMenu 
        isOpen={showQuickMenu}
        onClose={() => setShowQuickMenu(false)}
      />
      
      <ChatInterface 
        isOpen={showChat}
        onClose={() => setShowChat(false)}
      />
    </div>
  );
};

export default Game;