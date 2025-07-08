import React, { useState } from 'react';
import { useGame } from '../../contexts/GameContext';

const InventoryTab = () => {
  const { gameState, removeFromInventory } = useGame();
  const [selectedItem, setSelectedItem] = useState(null);
  const [filter, setFilter] = useState('all');

  const getItemIcon = (type) => {
    switch (type) {
      case 'crystal':
        return '💎';
      case 'rune':
        return '🔮';
      case 'essence':
        return '✨';
      case 'memory':
        return '🌙';
      case 'material':
        return '🪨';
      case 'artifact':
        return '🏺';
      case 'spell_component':
        return '🧪';
      case 'key':
        return '🗝️';
      default:
        return '📦';
    }
  };

  const getItemRarity = (item) => {
    // Determine rarity based on item properties
    if (item.type === 'memory' || item.type === 'essence') return 'legendary';
    if (item.type === 'crystal' || item.type === 'rune') return 'rare';
    if (item.type === 'artifact') return 'epic';
    return 'common';
  };

  const getRarityColor = (rarity) => {
    switch (rarity) {
      case 'legendary':
        return '#fbbf24';
      case 'epic':
        return '#a855f7';
      case 'rare':
        return '#3b82f6';
      case 'uncommon':
        return '#10b981';
      default:
        return '#6b7280';
    }
  };

  const filteredItems = gameState.inventory.filter(item => {
    if (filter === 'all') return true;
    return item.type === filter;
  });

  const itemTypes = [...new Set(gameState.inventory.map(item => item.type))];

  const handleUseItem = (item) => {
    // Handle item usage based on type
    switch (item.type) {
      case 'key':
        alert(`Used ${item.name}! A new path has opened.`);
        removeFromInventory(item.id);
        break;
      case 'essence':
        alert(`Absorbed ${item.name}! Your magical energy feels stronger.`);
        removeFromInventory(item.id);
        break;
      case 'crystal':
        alert(`Activated ${item.name}! It glows with mystical power.`);
        break;
      default:
        alert(`You examine the ${item.name} carefully. It might be useful later.`);
    }
  };

  const craftingMaterials = gameState.inventory.filter(item => 
    item.type === 'material' || item.type === 'spell_component'
  );

  return (
    <div>
      <h3 style={{ color: '#9333ea', marginBottom: '20px' }}>
        🎒 Inventory ({gameState.inventory.length} items)
      </h3>

      {/* Filter Buttons */}
      <div style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          <button
            onClick={() => setFilter('all')}
            style={{
              background: filter === 'all' ? 'rgba(147, 51, 234, 0.8)' : 'rgba(147, 51, 234, 0.3)',
              border: '1px solid rgba(147, 51, 234, 0.5)',
              borderRadius: '6px',
              color: 'white',
              padding: '4px 12px',
              cursor: 'pointer',
              fontSize: '0.8rem'
            }}
          >
            All ({gameState.inventory.length})
          </button>
          
          {itemTypes.map(type => (
            <button
              key={type}
              onClick={() => setFilter(type)}
              style={{
                background: filter === type ? 'rgba(147, 51, 234, 0.8)' : 'rgba(147, 51, 234, 0.3)',
                border: '1px solid rgba(147, 51, 234, 0.5)',
                borderRadius: '6px',
                color: 'white',
                padding: '4px 12px',
                cursor: 'pointer',
                fontSize: '0.8rem'
              }}
            >
              {getItemIcon(type)} {type.charAt(0).toUpperCase() + type.slice(1)} 
              ({gameState.inventory.filter(item => item.type === type).length})
            </button>
          ))}
        </div>
      </div>

      {/* Items Grid */}
      {filteredItems.length > 0 ? (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
          gap: '15px',
          marginBottom: '20px'
        }}>
          {filteredItems.map(item => {
            const rarity = getItemRarity(item);
            const rarityColor = getRarityColor(rarity);
            
            return (
              <div
                key={item.id}
                onClick={() => setSelectedItem(item)}
                style={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  border: selectedItem?.id === item.id ? `2px solid ${rarityColor}` : `1px solid ${rarityColor}`,
                  borderRadius: '8px',
                  padding: '12px',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  textAlign: 'center'
                }}
              >
                <div style={{ fontSize: '2rem', marginBottom: '8px' }}>
                  {getItemIcon(item.type)}
                </div>
                <div style={{
                  fontSize: '0.8rem',
                  fontWeight: 'bold',
                  marginBottom: '4px',
                  color: rarityColor
                }}>
                  {item.name}
                </div>
                <div style={{
                  fontSize: '0.7rem',
                  opacity: 0.7,
                  textTransform: 'capitalize'
                }}>
                  {rarity}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div style={{
          textAlign: 'center',
          padding: '40px',
          opacity: 0.6
        }}>
          <p>No items found</p>
          <p style={{ fontSize: '0.8rem' }}>
            Explore the world to discover mystical items and artifacts
          </p>
        </div>
      )}

      {/* Item Details */}
      {selectedItem && (
        <div style={{
          background: 'rgba(255, 255, 255, 0.1)',
          border: `2px solid ${getRarityColor(getItemRarity(selectedItem))}`,
          borderRadius: '10px',
          padding: '15px',
          marginBottom: '20px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
            <span style={{ fontSize: '2rem' }}>{getItemIcon(selectedItem.type)}</span>
            <div>
              <h4 style={{ 
                margin: 0, 
                color: getRarityColor(getItemRarity(selectedItem))
              }}>
                {selectedItem.name}
              </h4>
              <p style={{ 
                margin: 0, 
                fontSize: '0.8rem', 
                opacity: 0.7,
                textTransform: 'capitalize'
              }}>
                {selectedItem.type} • {getItemRarity(selectedItem)}
              </p>
            </div>
          </div>
          
          <p style={{ margin: '0 0 15px 0', lineHeight: '1.4' }}>
            {selectedItem.description || 'A mysterious item with unknown properties.'}
          </p>
          
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={() => handleUseItem(selectedItem)}
              style={{
                background: 'linear-gradient(45deg, #10b981, #059669)',
                border: 'none',
                borderRadius: '6px',
                color: 'white',
                padding: '8px 16px',
                cursor: 'pointer',
                fontSize: '0.8rem'
              }}
            >
              Use Item
            </button>
            
            {selectedItem.type === 'material' || selectedItem.type === 'spell_component' ? (
              <button
                style={{
                  background: 'linear-gradient(45deg, #9333ea, #7c3aed)',
                  border: 'none',
                  borderRadius: '6px',
                  color: 'white',
                  padding: '8px 16px',
                  cursor: 'pointer',
                  fontSize: '0.8rem'
                }}
              >
                Use in Crafting
              </button>
            ) : null}
            
            <button
              onClick={() => {
                if (confirm(`Are you sure you want to discard ${selectedItem.name}?`)) {
                  removeFromInventory(selectedItem.id);
                  setSelectedItem(null);
                }
              }}
              style={{
                background: 'rgba(239, 68, 68, 0.6)',
                border: 'none',
                borderRadius: '6px',
                color: 'white',
                padding: '8px 16px',
                cursor: 'pointer',
                fontSize: '0.8rem'
              }}
            >
              Discard
            </button>
          </div>
        </div>
      )}

      {/* Quick Crafting Section */}
      {craftingMaterials.length > 0 && (
        <div style={{
          background: 'rgba(255, 255, 255, 0.1)',
          border: '1px solid rgba(147, 51, 234, 0.3)',
          borderRadius: '10px',
          padding: '15px'
        }}>
          <h4 style={{ color: '#ec4899', marginBottom: '10px' }}>
            🔨 Quick Crafting
          </h4>
          <p style={{ fontSize: '0.8rem', opacity: 0.7, marginBottom: '10px' }}>
            You have {craftingMaterials.length} crafting materials
          </p>
          
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {craftingMaterials.slice(0, 5).map(item => (
              <span
                key={item.id}
                style={{
                  background: 'rgba(147, 51, 234, 0.3)',
                  padding: '4px 8px',
                  borderRadius: '4px',
                  fontSize: '0.7rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                {getItemIcon(item.type)} {item.name}
              </span>
            ))}
            {craftingMaterials.length > 5 && (
              <span style={{ fontSize: '0.7rem', opacity: 0.6 }}>
                +{craftingMaterials.length - 5} more...
              </span>
            )}
          </div>
          
          <button
            style={{
              background: 'linear-gradient(45deg, #f59e0b, #d97706)',
              border: 'none',
              borderRadius: '6px',
              color: 'white',
              padding: '8px 16px',
              cursor: 'pointer',
              fontSize: '0.8rem',
              marginTop: '10px'
            }}
          >
            🔨 Open Crafting Menu
          </button>
        </div>
      )}
    </div>
  );
};

export default InventoryTab;