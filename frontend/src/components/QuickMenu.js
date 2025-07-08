import React, { useState } from 'react';
import { useGame } from '../contexts/GameContext';
import SettingsTab from './menu/SettingsTab';
import WorldMapTab from './menu/WorldMapTab';
import InventoryTab from './menu/InventoryTab';
import JournalTab from './menu/JournalTab';
import ConversationTab from './menu/ConversationTab';
import NotesTab from './menu/NotesTab';
import SpellbookTab from './menu/SpellbookTab';

const QuickMenu = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState('settings');
  const { gameState, saveGameState } = useGame();

  const tabs = [
    { id: 'settings', name: 'Settings', icon: '⚙️' },
    { id: 'map', name: 'World Map', icon: '🗺️' },
    { id: 'inventory', name: 'Bag', icon: '🎒' },
    { id: 'journal', name: 'Journal', icon: '📖' },
    { id: 'conversations', name: 'Conversations', icon: '💭' },
    { id: 'notes', name: 'Quick Notes', icon: '📝' },
    { id: 'spells', name: 'Spellbook', icon: '✨' }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'settings':
        return <SettingsTab />;
      case 'map':
        return <WorldMapTab />;
      case 'inventory':
        return <InventoryTab />;
      case 'journal':
        return <JournalTab />;
      case 'conversations':
        return <ConversationTab />;
      case 'notes':
        return <NotesTab />;
      case 'spells':
        return <SpellbookTab />;
      default:
        return <div>Select a tab</div>;
    }
  };

  const handleSaveGame = async () => {
    await saveGameState();
    alert('Game saved successfully!');
  };

  return (
    <div className={`quick-menu ${isOpen ? 'open' : ''}`}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 style={{ color: '#9333ea', margin: 0 }}>Quick Menu</h2>
        <div>
          <button
            onClick={handleSaveGame}
            style={{
              background: 'linear-gradient(45deg, #10b981, #059669)',
              border: 'none',
              borderRadius: '8px',
              color: 'white',
              padding: '8px 16px',
              marginRight: '10px',
              cursor: 'pointer'
            }}
          >
            💾 Save
          </button>
          <button
            onClick={onClose}
            style={{
              background: 'rgba(239, 68, 68, 0.8)',
              border: 'none',
              borderRadius: '8px',
              color: 'white',
              padding: '8px 16px',
              cursor: 'pointer'
            }}
          >
            ✕
          </button>
        </div>
      </div>

      <div className="menu-tabs">
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`menu-tab ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.icon} {tab.name}
          </button>
        ))}
      </div>

      <div className="menu-content">
        {renderTabContent()}
      </div>
    </div>
  );
};

export default QuickMenu;