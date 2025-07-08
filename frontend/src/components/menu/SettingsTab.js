import React, { useState } from 'react';
import useKeyControls from '../../hooks/useKeyControls';

const SettingsTab = () => {
  const { keyBindings, updateKeyBinding } = useKeyControls();
  const [editingKey, setEditingKey] = useState(null);
  const [musicVolume, setMusicVolume] = useState(75);
  const [sfxVolume, setSfxVolume] = useState(80);
  const [graphics, setGraphics] = useState('high');

  const keyActions = [
    { key: 'forward', label: 'Move Forward' },
    { key: 'backward', label: 'Move Backward' },
    { key: 'left', label: 'Move Left' },
    { key: 'right', label: 'Move Right' },
    { key: 'jump', label: 'Jump' },
    { key: 'crouch', label: 'Crouch' },
    { key: 'run', label: 'Run' },
    { key: 'interact', label: 'Interact' },
    { key: 'fly', label: 'Fly' },
    { key: 'swim', label: 'Swim' },
    { key: 'quickMenu', label: 'Quick Menu' },
    { key: 'chat', label: 'Chat' },
    { key: 'journal', label: 'Journal' },
    { key: 'inventory', label: 'Inventory' },
    { key: 'spells', label: 'Spells' }
  ];

  const handleKeyBinding = (action, event) => {
    event.preventDefault();
    updateKeyBinding(action, event.code);
    setEditingKey(null);
  };

  return (
    <div>
      <h3 style={{ color: '#9333ea', marginBottom: '20px' }}>Settings</h3>
      
      {/* Key Bindings */}
      <div style={{ marginBottom: '30px' }}>
        <h4 style={{ color: '#ec4899', marginBottom: '15px' }}>Key Bindings</h4>
        <div style={{ display: 'grid', gap: '10px' }}>
          {keyActions.map(action => (
            <div key={action.key} style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '8px',
              background: 'rgba(255, 255, 255, 0.1)',
              borderRadius: '6px'
            }}>
              <span>{action.label}</span>
              <button
                onClick={() => setEditingKey(action.key)}
                onKeyDown={editingKey === action.key ? (e) => handleKeyBinding(action.key, e) : undefined}
                style={{
                  background: editingKey === action.key ? '#ec4899' : 'rgba(147, 51, 234, 0.6)',
                  border: 'none',
                  borderRadius: '4px',
                  color: 'white',
                  padding: '4px 8px',
                  cursor: 'pointer',
                  minWidth: '80px'
                }}
              >
                {editingKey === action.key ? 'Press key...' : keyBindings[action.key]}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Audio Settings */}
      <div style={{ marginBottom: '30px' }}>
        <h4 style={{ color: '#ec4899', marginBottom: '15px' }}>Audio</h4>
        
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>
            Music Volume: {musicVolume}%
          </label>
          <input
            type="range"
            min="0"
            max="100"
            value={musicVolume}
            onChange={(e) => setMusicVolume(e.target.value)}
            style={{ width: '100%' }}
          />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>
            Sound Effects: {sfxVolume}%
          </label>
          <input
            type="range"
            min="0"
            max="100"
            value={sfxVolume}
            onChange={(e) => setSfxVolume(e.target.value)}
            style={{ width: '100%' }}
          />
        </div>
      </div>

      {/* Graphics Settings */}
      <div style={{ marginBottom: '30px' }}>
        <h4 style={{ color: '#ec4899', marginBottom: '15px' }}>Graphics</h4>
        
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>Quality</label>
          <select
            value={graphics}
            onChange={(e) => setGraphics(e.target.value)}
            style={{
              width: '100%',
              padding: '8px',
              background: 'rgba(255, 255, 255, 0.1)',
              border: '1px solid rgba(147, 51, 234, 0.3)',
              borderRadius: '4px',
              color: 'white'
            }}
          >
            <option value="low" style={{ background: '#1f2937' }}>Low</option>
            <option value="medium" style={{ background: '#1f2937' }}>Medium</option>
            <option value="high" style={{ background: '#1f2937' }}>High</option>
            <option value="ultra" style={{ background: '#1f2937' }}>Ultra</option>
          </select>
        </div>
      </div>

      {/* Game Settings */}
      <div>
        <h4 style={{ color: '#ec4899', marginBottom: '15px' }}>Game</h4>
        
        <div style={{ display: 'grid', gap: '10px' }}>
          <label style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            cursor: 'pointer'
          }}>
            <input type="checkbox" defaultChecked />
            <span>Auto-save enabled</span>
          </label>
          
          <label style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            cursor: 'pointer'
          }}>
            <input type="checkbox" defaultChecked />
            <span>Show interaction prompts</span>
          </label>
          
          <label style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            cursor: 'pointer'
          }}>
            <input type="checkbox" />
            <span>Hardcore mode (no auto-save)</span>
          </label>
        </div>
      </div>
    </div>
  );
};

export default SettingsTab;