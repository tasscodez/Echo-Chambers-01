import React, { useState } from 'react';
import { useGame } from '../../contexts/GameContext';

const SpellbookTab = () => {
  const { gameState } = useGame();
  const [selectedSpell, setSelectedSpell] = useState(null);
  const [activeCategory, setActiveCategory] = useState('all');

  // Spell categories
  const spellCategories = {
    nature: { name: 'Nature', icon: '🌿', color: '#10b981' },
    mystical: { name: 'Mystical', icon: '🔮', color: '#8b5cf6' },
    elemental: { name: 'Elemental', icon: '⚡', color: '#f59e0b' },
    healing: { name: 'Healing', icon: '💚', color: '#06b6d4' },
    transformation: { name: 'Transformation', icon: '🦋', color: '#ec4899' }
  };

  // Available spells (including unlocked and locked)
  const allSpells = [
    {
      id: 'vine_whisper',
      name: 'Vine Whisper',
      category: 'nature',
      element: 'nature',
      description: 'Command ancient vines to reveal hidden paths and clear obstacles.',
      incantation: 'Verdant threads, hear my call, part the way and let me pass',
      cost: 'Low',
      cooldown: 'None',
      unlocked: gameState.spells.some(s => s.name === 'Vine Whisper'),
      learnedFrom: 'Echo - First magical lesson'
    },
    {
      id: 'crystal_sight',
      name: 'Crystal Sight',
      category: 'mystical',
      element: 'divination',
      description: 'See through illusions and reveal hidden objects glowing with magical auras.',
      incantation: 'Crystal clear, pierce the veil, show me truths that never fail',
      cost: 'Medium',
      cooldown: '30 seconds',
      unlocked: gameState.spells.some(s => s.name === 'Crystal Sight'),
      learnedFrom: 'Ancient Crystal in the Caverns'
    },
    {
      id: 'memory_bloom',
      name: 'Memory Bloom',
      category: 'healing',
      element: 'memory',
      description: 'Heal emotional wounds by transforming painful memories into blooming flowers.',
      incantation: 'From shadow\'s depth, let beauty rise, transform the pain before my eyes',
      cost: 'High',
      cooldown: '5 minutes',
      unlocked: gameState.spells.some(s => s.name === 'Memory Bloom'),
      learnedFrom: 'Deep meditation in the Memory Garden'
    },
    {
      id: 'storm_dance',
      name: 'Storm Dance',
      category: 'elemental',
      element: 'storm',
      description: 'Call forth rain and wind to cleanse areas and reveal new paths.',
      incantation: 'Winds of change and healing rain, wash away both dirt and pain',
      cost: 'High',
      cooldown: '10 minutes',
      unlocked: gameState.spells.some(s => s.name === 'Storm Dance'),
      learnedFrom: 'Echo - After mastering emotional storms'
    },
    {
      id: 'shadow_step',
      name: 'Shadow Step',
      category: 'mystical',
      element: 'shadow',
      description: 'Step through shadows to teleport short distances or pass through barriers.',
      incantation: 'Through darkness deep, I make my way, to emerge where shadows play',
      cost: 'Medium',
      cooldown: '1 minute',
      unlocked: gameState.spells.some(s => s.name === 'Shadow Step'),
      learnedFrom: 'Shadow Realm exploration'
    },
    {
      id: 'fae_flight',
      name: 'Fae Flight',
      category: 'transformation',
      element: 'air',
      description: 'Transform into fae form for extended flight and ethereal movement.',
      incantation: 'Wings of starlight, carry me high, through realms of earth and endless sky',
      cost: 'Very High',
      cooldown: '20 minutes',
      unlocked: gameState.spells.some(s => s.name === 'Fae Flight'),
      learnedFrom: 'Echo - Ultimate transformation gift'
    }
  ];

  const filteredSpells = allSpells.filter(spell => {
    if (activeCategory === 'all') return true;
    if (activeCategory === 'unlocked') return spell.unlocked;
    if (activeCategory === 'locked') return !spell.unlocked;
    return spell.category === activeCategory;
  });

  const getSpellIcon = (category) => {
    return spellCategories[category]?.icon || '✨';
  };

  const getSpellColor = (category) => {
    return spellCategories[category]?.color || '#9333ea';
  };

  const getCostColor = (cost) => {
    switch (cost.toLowerCase()) {
      case 'low':
        return '#10b981';
      case 'medium':
        return '#f59e0b';
      case 'high':
        return '#ef4444';
      case 'very high':
        return '#dc2626';
      default:
        return '#6b7280';
    }
  };

  const castSpell = (spell) => {
    if (!spell.unlocked) {
      alert('This spell has not been learned yet.');
      return;
    }

    // Simulate spell casting
    alert(`✨ Casting ${spell.name}!\n\n"${spell.incantation}"\n\n${spell.description}`);
    
    // Here you would implement actual spell effects in the game
    console.log(`Spell cast: ${spell.name}`);
  };

  const practiceSpell = (spell) => {
    if (!spell.unlocked) return;
    
    alert(`🧙‍♀️ Practicing ${spell.name}...\n\nYou feel the magical energy flowing through you as you recite:\n\n"${spell.incantation}"\n\nYour mastery grows stronger.`);
  };

  return (
    <div>
      <h3 style={{ color: '#9333ea', marginBottom: '20px' }}>
        ✨ Spellbook ({gameState.spells.length}/{allSpells.length} spells learned)
      </h3>

      {/* Category Filters */}
      <div style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          <button
            onClick={() => setActiveCategory('all')}
            style={{
              background: activeCategory === 'all' ? 'rgba(147, 51, 234, 0.8)' : 'rgba(147, 51, 234, 0.3)',
              border: '1px solid rgba(147, 51, 234, 0.5)',
              borderRadius: '6px',
              color: 'white',
              padding: '6px 12px',
              cursor: 'pointer',
              fontSize: '0.8rem'
            }}
          >
            📜 All ({allSpells.length})
          </button>
          
          <button
            onClick={() => setActiveCategory('unlocked')}
            style={{
              background: activeCategory === 'unlocked' ? 'rgba(16, 185, 129, 0.8)' : 'rgba(16, 185, 129, 0.3)',
              border: '1px solid rgba(16, 185, 129, 0.5)',
              borderRadius: '6px',
              color: 'white',
              padding: '6px 12px',
              cursor: 'pointer',
              fontSize: '0.8rem'
            }}
          >
            ✅ Learned ({gameState.spells.length})
          </button>
          
          <button
            onClick={() => setActiveCategory('locked')}
            style={{
              background: activeCategory === 'locked' ? 'rgba(107, 114, 128, 0.8)' : 'rgba(107, 114, 128, 0.3)',
              border: '1px solid rgba(107, 114, 128, 0.5)',
              borderRadius: '6px',
              color: 'white',
              padding: '6px 12px',
              cursor: 'pointer',
              fontSize: '0.8rem'
            }}
          >
            🔒 Unknown ({allSpells.length - gameState.spells.length})
          </button>

          {Object.entries(spellCategories).map(([key, category]) => (
            <button
              key={key}
              onClick={() => setActiveCategory(key)}
              style={{
                background: activeCategory === key ? `${category.color}CC` : `${category.color}4D`,
                border: `1px solid ${category.color}80`,
                borderRadius: '6px',
                color: 'white',
                padding: '6px 12px',
                cursor: 'pointer',
                fontSize: '0.8rem'
              }}
            >
              {category.icon} {category.name}
            </button>
          ))}
        </div>
      </div>

      {/* Spells Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
        gap: '15px',
        marginBottom: '20px'
      }}>
        {filteredSpells.map(spell => (
          <div
            key={spell.id}
            onClick={() => setSelectedSpell(spell)}
            style={{
              background: spell.unlocked ? 'rgba(255, 255, 255, 0.1)' : 'rgba(107, 114, 128, 0.1)',
              border: selectedSpell?.id === spell.id 
                ? `2px solid ${getSpellColor(spell.category)}` 
                : `1px solid ${spell.unlocked ? getSpellColor(spell.category) : '#6b7280'}`,
              borderRadius: '10px',
              padding: '15px',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              opacity: spell.unlocked ? 1 : 0.7,
              position: 'relative'
            }}
          >
            {!spell.unlocked && (
              <div style={{
                position: 'absolute',
                top: '10px',
                right: '10px',
                background: 'rgba(107, 114, 128, 0.8)',
                borderRadius: '50%',
                width: '24px',
                height: '24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.8rem'
              }}>
                🔒
              </div>
            )}

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
              <span style={{ fontSize: '1.5rem' }}>{getSpellIcon(spell.category)}</span>
              <div>
                <h4 style={{
                  margin: 0,
                  color: spell.unlocked ? getSpellColor(spell.category) : '#6b7280'
                }}>
                  {spell.unlocked ? spell.name : '???'}
                </h4>
                <p style={{
                  margin: 0,
                  fontSize: '0.7rem',
                  opacity: 0.7,
                  textTransform: 'capitalize'
                }}>
                  {spellCategories[spell.category]?.name || 'Unknown'} • {spell.element}
                </p>
              </div>
            </div>

            <p style={{
              margin: '0 0 10px 0',
              fontSize: '0.8rem',
              lineHeight: '1.3',
              opacity: 0.8
            }}>
              {spell.unlocked ? spell.description : 'A mysterious spell waiting to be discovered...'}
            </p>

            {spell.unlocked && (
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                <span style={{
                  background: getCostColor(spell.cost),
                  color: 'white',
                  padding: '2px 6px',
                  borderRadius: '4px',
                  fontSize: '0.6rem'
                }}>
                  {spell.cost} Cost
                </span>
                <span style={{
                  background: 'rgba(147, 51, 234, 0.6)',
                  color: 'white',
                  padding: '2px 6px',
                  borderRadius: '4px',
                  fontSize: '0.6rem'
                }}>
                  {spell.cooldown}
                </span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Spell Details */}
      {selectedSpell && (
        <div style={{
          background: 'rgba(255, 255, 255, 0.1)',
          border: `2px solid ${getSpellColor(selectedSpell.category)}`,
          borderRadius: '10px',
          padding: '20px',
          marginBottom: '20px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '15px' }}>
            <span style={{ fontSize: '3rem' }}>{getSpellIcon(selectedSpell.category)}</span>
            <div>
              <h3 style={{
                margin: 0,
                color: getSpellColor(selectedSpell.category)
              }}>
                {selectedSpell.unlocked ? selectedSpell.name : 'Unknown Spell'}
              </h3>
              <p style={{
                margin: 0,
                fontSize: '0.9rem',
                opacity: 0.7,
                textTransform: 'capitalize'
              }}>
                {spellCategories[selectedSpell.category]?.name} Magic • {selectedSpell.element} Element
              </p>
            </div>
          </div>

          {selectedSpell.unlocked ? (
            <>
              <p style={{ margin: '0 0 15px 0', lineHeight: '1.5' }}>
                {selectedSpell.description}
              </p>

              <div style={{
                background: 'rgba(0, 0, 0, 0.3)',
                border: '1px solid rgba(147, 51, 234, 0.3)',
                borderRadius: '8px',
                padding: '12px',
                marginBottom: '15px'
              }}>
                <h4 style={{ margin: '0 0 8px 0', color: '#ec4899' }}>Incantation</h4>
                <p style={{
                  margin: 0,
                  fontStyle: 'italic',
                  lineHeight: '1.4',
                  color: '#fbbf24'
                }}>
                  "{selectedSpell.incantation}"
                </p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '10px', marginBottom: '15px' }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '0.7rem', opacity: 0.7 }}>Energy Cost</div>
                  <div style={{ color: getCostColor(selectedSpell.cost), fontWeight: 'bold' }}>
                    {selectedSpell.cost}
                  </div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '0.7rem', opacity: 0.7 }}>Cooldown</div>
                  <div style={{ color: '#8b5cf6', fontWeight: 'bold' }}>
                    {selectedSpell.cooldown}
                  </div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '0.7rem', opacity: 0.7 }}>Learned From</div>
                  <div style={{ color: '#10b981', fontWeight: 'bold', fontSize: '0.8rem' }}>
                    {selectedSpell.learnedFrom}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  onClick={() => castSpell(selectedSpell)}
                  style={{
                    background: `linear-gradient(45deg, ${getSpellColor(selectedSpell.category)}, ${getSpellColor(selectedSpell.category)}CC)`,
                    border: 'none',
                    borderRadius: '8px',
                    color: 'white',
                    padding: '10px 20px',
                    cursor: 'pointer',
                    fontWeight: 'bold'
                  }}
                >
                  ✨ Cast Spell
                </button>
                
                <button
                  onClick={() => practiceSpell(selectedSpell)}
                  style={{
                    background: 'rgba(147, 51, 234, 0.6)',
                    border: 'none',
                    borderRadius: '8px',
                    color: 'white',
                    padding: '10px 20px',
                    cursor: 'pointer'
                  }}
                >
                  🧙‍♀️ Practice
                </button>
              </div>
            </>
          ) : (
            <div style={{ textAlign: 'center', opacity: 0.6 }}>
              <p>This spell remains a mystery...</p>
              <p style={{ fontSize: '0.8rem' }}>
                Continue your journey with Echo to unlock new magical abilities
              </p>
            </div>
          )}
        </div>
      )}

      {/* Spellbook Progress */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.1)',
        border: '1px solid rgba(147, 51, 234, 0.3)',
        borderRadius: '10px',
        padding: '15px'
      }}>
        <h4 style={{ color: '#ec4899', marginBottom: '15px' }}>
          📊 Magical Progress
        </h4>
        
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
          gap: '15px'
        }}>
          {Object.entries(spellCategories).map(([key, category]) => {
            const categorySpells = allSpells.filter(s => s.category === key);
            const unlockedCount = categorySpells.filter(s => s.unlocked).length;
            const progress = (unlockedCount / categorySpells.length) * 100;
            
            return (
              <div key={key} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '1.5rem', marginBottom: '5px' }}>
                  {category.icon}
                </div>
                <div style={{ fontSize: '0.8rem', fontWeight: 'bold', color: category.color }}>
                  {category.name}
                </div>
                <div style={{ fontSize: '0.7rem', opacity: 0.7 }}>
                  {unlockedCount}/{categorySpells.length} learned
                </div>
                <div style={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  borderRadius: '10px',
                  height: '4px',
                  marginTop: '5px',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    background: category.color,
                    height: '100%',
                    width: `${progress}%`,
                    transition: 'width 0.3s ease'
                  }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default SpellbookTab;