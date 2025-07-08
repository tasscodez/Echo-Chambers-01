import React, { useState, useEffect } from 'react';
import { useGame } from '../../contexts/GameContext';
import { createJournalEntry, getJournalEntries } from '../../utils/api';

const JournalTab = () => {
  const { gameState } = useGame();
  const [entries, setEntries] = useState([]);
  const [isWriting, setIsWriting] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [newEntry, setNewEntry] = useState({
    title: '',
    content: '',
    mood: gameState.mood || 'neutral'
  });

  // Load journal entries
  useEffect(() => {
    const loadEntries = async () => {
      try {
        const journalEntries = await getJournalEntries(gameState.player_name);
        setEntries(journalEntries);
      } catch (error) {
        console.error('Error loading journal entries:', error);
      }
    };

    loadEntries();
  }, [gameState.player_name]);

  const handleCreateEntry = async () => {
    if (!newEntry.title.trim() || !newEntry.content.trim()) return;

    try {
      await createJournalEntry(
        gameState.player_name,
        newEntry.title.trim(),
        newEntry.content.trim(),
        newEntry.mood,
        getCurrentLocation()
      );

      // Reload entries
      const journalEntries = await getJournalEntries(gameState.player_name);
      setEntries(journalEntries);

      // Reset form
      setNewEntry({
        title: '',
        content: '',
        mood: gameState.mood || 'neutral'
      });
      setIsWriting(false);
    } catch (error) {
      console.error('Error creating journal entry:', error);
      alert('Failed to save journal entry. Please try again.');
    }
  };

  const getCurrentLocation = () => {
    // Determine current location based on position
    const pos = gameState.position;
    if (Math.abs(pos.x) < 5 && Math.abs(pos.z + 10) < 5) return 'castle_entrance';
    if (pos.x < -10) return 'thornwood_forest';
    if (pos.x > 10) return 'crystal_caverns';
    return 'unknown_location';
  };

  const getMoodColor = (mood) => {
    switch (mood) {
      case 'melancholic':
        return '#6366f1';
      case 'radiant':
        return '#fbbf24';
      case 'contemplative':
        return '#8b5cf6';
      case 'peaceful':
        return '#10b981';
      default:
        return '#9333ea';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const journalPrompts = [
    "What emotions are flowing through me right now?",
    "What did I discover about myself today?",
    "How has Echo's guidance changed my perspective?",
    "What mysteries in this world call to me?",
    "What spell or power do I wish to understand?",
    "How do the shadows and light in this realm reflect my inner state?",
    "What would I tell my past self about this journey?",
    "What fears am I ready to face?"
  ];

  return (
    <div>
      <h3 style={{ color: '#9333ea', marginBottom: '20px' }}>
        📖 Journal ({entries.length} entries)
      </h3>

      {/* New Entry Button */}
      {!isWriting && (
        <button
          onClick={() => setIsWriting(true)}
          style={{
            background: 'linear-gradient(45deg, #9333ea, #ec4899)',
            border: 'none',
            borderRadius: '8px',
            color: 'white',
            padding: '12px 24px',
            cursor: 'pointer',
            marginBottom: '20px',
            fontSize: '1rem'
          }}
        >
          ✍️ Write New Entry
        </button>
      )}

      {/* New Entry Form */}
      {isWriting && (
        <div style={{
          background: 'rgba(255, 255, 255, 0.1)',
          border: '2px solid rgba(147, 51, 234, 0.5)',
          borderRadius: '10px',
          padding: '20px',
          marginBottom: '20px'
        }}>
          <h4 style={{ color: '#ec4899', marginBottom: '15px' }}>
            New Journal Entry
          </h4>

          <input
            type="text"
            placeholder="Entry title..."
            value={newEntry.title}
            onChange={(e) => setNewEntry(prev => ({ ...prev, title: e.target.value }))}
            style={{
              width: '100%',
              padding: '10px',
              background: 'rgba(255, 255, 255, 0.1)',
              border: '1px solid rgba(147, 51, 234, 0.3)',
              borderRadius: '6px',
              color: 'white',
              marginBottom: '15px'
            }}
          />

          <textarea
            placeholder="What's on your mind?"
            value={newEntry.content}
            onChange={(e) => setNewEntry(prev => ({ ...prev, content: e.target.value }))}
            style={{
              width: '100%',
              height: '150px',
              padding: '10px',
              background: 'rgba(255, 255, 255, 0.1)',
              border: '1px solid rgba(147, 51, 234, 0.3)',
              borderRadius: '6px',
              color: 'white',
              resize: 'vertical',
              fontFamily: 'inherit',
              marginBottom: '15px'
            }}
          />

          <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '15px' }}>
            <label style={{ fontSize: '0.9rem' }}>Mood:</label>
            <select
              value={newEntry.mood}
              onChange={(e) => setNewEntry(prev => ({ ...prev, mood: e.target.value }))}
              style={{
                padding: '6px 12px',
                background: 'rgba(255, 255, 255, 0.1)',
                border: '1px solid rgba(147, 51, 234, 0.3)',
                borderRadius: '6px',
                color: 'white'
              }}
            >
              <option value="neutral" style={{ background: '#1f2937' }}>Neutral</option>
              <option value="melancholic" style={{ background: '#1f2937' }}>Melancholic</option>
              <option value="radiant" style={{ background: '#1f2937' }}>Radiant</option>
              <option value="contemplative" style={{ background: '#1f2937' }}>Contemplative</option>
              <option value="peaceful" style={{ background: '#1f2937' }}>Peaceful</option>
            </select>
          </div>

          {/* Writing Prompts */}
          <div style={{ marginBottom: '15px' }}>
            <p style={{ fontSize: '0.8rem', opacity: 0.7, marginBottom: '8px' }}>
              Need inspiration? Try one of these prompts:
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {journalPrompts.slice(0, 3).map((prompt, index) => (
                <button
                  key={index}
                  onClick={() => setNewEntry(prev => ({ 
                    ...prev, 
                    content: prev.content + (prev.content ? '\n\n' : '') + prompt + '\n\n'
                  }))}
                  style={{
                    background: 'rgba(147, 51, 234, 0.3)',
                    border: '1px solid rgba(147, 51, 234, 0.5)',
                    borderRadius: '4px',
                    color: 'white',
                    padding: '4px 8px',
                    cursor: 'pointer',
                    fontSize: '0.7rem'
                  }}
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={handleCreateEntry}
              disabled={!newEntry.title.trim() || !newEntry.content.trim()}
              style={{
                background: 'linear-gradient(45deg, #10b981, #059669)',
                border: 'none',
                borderRadius: '6px',
                color: 'white',
                padding: '8px 16px',
                cursor: 'pointer',
                opacity: (!newEntry.title.trim() || !newEntry.content.trim()) ? 0.5 : 1
              }}
            >
              Save Entry
            </button>
            <button
              onClick={() => {
                setIsWriting(false);
                setNewEntry({ title: '', content: '', mood: gameState.mood || 'neutral' });
              }}
              style={{
                background: 'rgba(107, 114, 128, 0.6)',
                border: 'none',
                borderRadius: '6px',
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

      {/* Entries List */}
      {entries.length > 0 ? (
        <div style={{ display: 'grid', gap: '15px' }}>
          {entries.map(entry => (
            <div
              key={entry.id}
              onClick={() => setSelectedEntry(selectedEntry?.id === entry.id ? null : entry)}
              style={{
                background: 'rgba(255, 255, 255, 0.1)',
                border: `1px solid ${getMoodColor(entry.mood)}`,
                borderRadius: '8px',
                padding: '15px',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <h4 style={{ 
                  margin: 0, 
                  color: getMoodColor(entry.mood)
                }}>
                  {entry.title}
                </h4>
                <span style={{ fontSize: '0.7rem', opacity: 0.6 }}>
                  {formatDate(entry.timestamp)}
                </span>
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                <span style={{
                  background: getMoodColor(entry.mood),
                  color: 'white',
                  padding: '2px 8px',
                  borderRadius: '4px',
                  fontSize: '0.7rem',
                  textTransform: 'capitalize'
                }}>
                  {entry.mood}
                </span>
                <span style={{ fontSize: '0.7rem', opacity: 0.6 }}>
                  📍 {gameState.location_names?.[entry.location] || entry.location}
                </span>
              </div>

              {selectedEntry?.id === entry.id ? (
                <div style={{ marginTop: '15px' }}>
                  <p style={{ 
                    lineHeight: '1.5', 
                    whiteSpace: 'pre-wrap',
                    margin: 0
                  }}>
                    {entry.content}
                  </p>
                </div>
              ) : (
                <p style={{ 
                  margin: 0, 
                  opacity: 0.7, 
                  fontSize: '0.9rem',
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden'
                }}>
                  {entry.content}
                </p>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div style={{
          textAlign: 'center',
          padding: '40px',
          opacity: 0.6
        }}>
          <p>No journal entries yet</p>
          <p style={{ fontSize: '0.8rem' }}>
            Start writing to document your journey through the mystical realm
          </p>
        </div>
      )}
    </div>
  );
};

export default JournalTab;