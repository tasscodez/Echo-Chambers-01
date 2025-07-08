import React, { useState } from 'react';
import { useGame } from '../../contexts/GameContext';

const WorldMapTab = () => {
  const { gameState, updateGameState } = useGame();
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [isRenaming, setIsRenaming] = useState(false);
  const [newLocationName, setNewLocationName] = useState('');

  const locations = [
    {
      id: 'castle_entrance',
      name: gameState.location_names?.castle_entrance || 'Castle Entrance',
      x: 50,
      y: 60,
      unlocked: true,
      type: 'castle',
      description: 'The grand entrance to your mystical castle home.'
    },
    {
      id: 'memory_garden',
      name: gameState.location_names?.memory_garden || 'Memory Garden',
      x: 30,
      y: 40,
      unlocked: gameState.unlocked_areas.includes('memory_garden'),
      type: 'garden',
      description: 'A serene garden where memories bloom like flowers.'
    },
    {
      id: 'shadow_realm',
      name: gameState.location_names?.shadow_realm || 'Shadow Realm',
      x: 70,
      y: 40,
      unlocked: gameState.unlocked_areas.includes('shadow_realm'),
      type: 'mystical',
      description: 'A mysterious realm of shadows and reflection.'
    },
    {
      id: 'crystal_caverns',
      name: gameState.location_names?.crystal_caverns || 'Crystal Caverns',
      x: 50,
      y: 20,
      unlocked: gameState.unlocked_areas.includes('crystal_caverns'),
      type: 'cave',
      description: 'Underwater caves filled with luminous crystals.'
    },
    {
      id: 'thornwood_forest',
      name: gameState.location_names?.thornwood_forest || 'Thornwood Forest',
      x: 20,
      y: 70,
      unlocked: gameState.unlocked_areas.includes('thornwood_forest'),
      type: 'forest',
      description: 'A dark forest where ancient magic still lingers.'
    },
    {
      id: 'dream_realm',
      name: gameState.location_names?.dream_realm || 'Dream Realm',
      x: 50,
      y: 80,
      unlocked: gameState.unlocked_areas.includes('dream_realm'),
      type: 'dream',
      description: 'The ethereal realm accessed through sleep.'
    },
    {
      id: 'mini_game_arcade',
      name: gameState.location_names?.mini_game_arcade || 'Mystic Arcade',
      x: 80,
      y: 60,
      unlocked: gameState.mini_games_unlocked.length > 0,
      type: 'minigame',
      description: 'Portals to various mini-game dimensions.'
    }
  ];

  const getLocationIcon = (type, unlocked) => {
    if (!unlocked) return '❓';
    
    switch (type) {
      case 'castle':
        return '🏰';
      case 'garden':
        return '🌸';
      case 'mystical':
        return '🌙';
      case 'cave':
        return '💎';
      case 'forest':
        return '🌲';
      case 'dream':
        return '☁️';
      case 'minigame':
        return '🎮';
      default:
        return '📍';
    }
  };

  const getLocationColor = (type, unlocked) => {
    if (!unlocked) return '#6b7280';
    
    switch (type) {
      case 'castle':
        return '#9333ea';
      case 'garden':
        return '#10b981';
      case 'mystical':
        return '#6366f1';
      case 'cave':
        return '#0ea5e9';
      case 'forest':
        return '#059669';
      case 'dream':
        return '#ec4899';
      case 'minigame':
        return '#f59e0b';
      default:
        return '#8b5cf6';
    }
  };

  const handleLocationRename = (locationId) => {
    if (newLocationName.trim()) {
      updateGameState({
        location_names: {
          ...gameState.location_names,
          [locationId]: newLocationName.trim()
        }
      });
      setIsRenaming(false);
      setNewLocationName('');
      setSelectedLocation(null);
    }
  };

  return (
    <div>
      <h3 style={{ color: '#9333ea', marginBottom: '20px' }}>World Map</h3>
      
      {/* Map Container */}
      <div style={{
        position: 'relative',
        width: '100%',
        height: '300px',
        background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
        border: '2px solid rgba(147, 51, 234, 0.3)',
        borderRadius: '10px',
        overflow: 'hidden',
        marginBottom: '20px'
      }}>
        {/* Background elements */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `
            radial-gradient(circle at 20% 80%, rgba(120, 119, 198, 0.1) 0%, transparent 50%),
            radial-gradient(circle at 80% 20%, rgba(255, 119, 198, 0.1) 0%, transparent 50%)
          `
        }} />
        
        {/* Player position indicator */}
        <div style={{
          position: 'absolute',
          left: `${50 + (gameState.position.x / 100) * 40}%`,
          top: `${50 + (gameState.position.z / 100) * 40}%`,
          transform: 'translate(-50%, -50%)',
          width: '12px',
          height: '12px',
          background: '#ec4899',
          borderRadius: '50%',
          border: '2px solid white',
          zIndex: 10,
          animation: 'pulse 2s infinite'
        }} />
        
        {/* Locations */}
        {locations.map(location => (
          <button
            key={location.id}
            onClick={() => setSelectedLocation(location)}
            style={{
              position: 'absolute',
              left: `${location.x}%`,
              top: `${location.y}%`,
              transform: 'translate(-50%, -50%)',
              background: location.unlocked ? getLocationColor(location.type, true) : 'rgba(107, 114, 128, 0.5)',
              border: selectedLocation?.id === location.id ? '2px solid white' : 'none',
              borderRadius: '50%',
              width: '30px',
              height: '30px',
              cursor: location.unlocked ? 'pointer' : 'default',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '14px',
              transition: 'all 0.3s ease',
              opacity: location.unlocked ? 1 : 0.5
            }}
            disabled={!location.unlocked}
          >
            {getLocationIcon(location.type, location.unlocked)}
          </button>
        ))}
      </div>

      {/* Location Details */}
      {selectedLocation && (
        <div style={{
          background: 'rgba(255, 255, 255, 0.1)',
          border: '1px solid rgba(147, 51, 234, 0.3)',
          borderRadius: '10px',
          padding: '15px',
          marginBottom: '20px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <h4 style={{ color: getLocationColor(selectedLocation.type, selectedLocation.unlocked), margin: 0 }}>
              {getLocationIcon(selectedLocation.type, selectedLocation.unlocked)} {selectedLocation.name}
            </h4>
            {selectedLocation.unlocked && (
              <button
                onClick={() => {
                  setIsRenaming(true);
                  setNewLocationName(selectedLocation.name);
                }}
                style={{
                  background: 'rgba(147, 51, 234, 0.6)',
                  border: 'none',
                  borderRadius: '4px',
                  color: 'white',
                  padding: '4px 8px',
                  cursor: 'pointer',
                  fontSize: '0.8rem'
                }}
              >
                ✏️ Rename
              </button>
            )}
          </div>
          
          <p style={{ margin: '0 0 10px 0', opacity: 0.8, fontSize: '0.9rem' }}>
            {selectedLocation.description}
          </p>
          
          <p style={{ margin: 0, fontSize: '0.8rem', opacity: 0.6 }}>
            Status: {selectedLocation.unlocked ? '✅ Unlocked' : '🔒 Locked'}
          </p>
        </div>
      )}

      {/* Rename Modal */}
      {isRenaming && selectedLocation && (
        <div style={{
          background: 'rgba(0, 0, 0, 0.9)',
          border: '2px solid rgba(147, 51, 234, 0.5)',
          borderRadius: '10px',
          padding: '20px',
          marginBottom: '20px'
        }}>
          <h4 style={{ color: '#9333ea', marginBottom: '15px' }}>
            Rename Location
          </h4>
          
          <input
            type="text"
            value={newLocationName}
            onChange={(e) => setNewLocationName(e.target.value)}
            placeholder="Enter new name..."
            style={{
              width: '100%',
              padding: '10px',
              background: 'rgba(255, 255, 255, 0.1)',
              border: '1px solid rgba(147, 51, 234, 0.3)',
              borderRadius: '8px',
              color: 'white',
              marginBottom: '15px'
            }}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleLocationRename(selectedLocation.id);
              }
            }}
          />
          
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={() => handleLocationRename(selectedLocation.id)}
              style={{
                background: 'linear-gradient(45deg, #10b981, #059669)',
                border: 'none',
                borderRadius: '8px',
                color: 'white',
                padding: '8px 16px',
                cursor: 'pointer'
              }}
            >
              Save
            </button>
            <button
              onClick={() => {
                setIsRenaming(false);
                setNewLocationName('');
              }}
              style={{
                background: 'rgba(107, 114, 128, 0.6)',
                border: 'none',
                borderRadius: '8px',
                color: 'white',
                padding: '8px 16px',
                cursor: 'pointer'
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Legend */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.1)',
        border: '1px solid rgba(147, 51, 234, 0.3)',
        borderRadius: '10px',
        padding: '15px'
      }}>
        <h4 style={{ color: '#ec4899', marginBottom: '10px' }}>Legend</h4>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '5px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '12px', height: '12px', background: '#ec4899', borderRadius: '50%' }} />
            <span style={{ fontSize: '0.8rem' }}>Your Location</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>🏰</span>
            <span style={{ fontSize: '0.8rem' }}>Castle</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>🌸</span>
            <span style={{ fontSize: '0.8rem' }}>Garden</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>💎</span>
            <span style={{ fontSize: '0.8rem' }}>Cave</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>🎮</span>
            <span style={{ fontSize: '0.8rem' }}>Mini-games</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>❓</span>
            <span style={{ fontSize: '0.8rem' }}>Locked</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorldMapTab;