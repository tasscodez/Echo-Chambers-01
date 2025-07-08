import React, { useState, useEffect } from 'react';
import { useGame } from '../../contexts/GameContext';
import { createQuickNote, getQuickNotes } from '../../utils/api';

const NotesTab = () => {
  const { gameState } = useGame();
  const [notes, setNotes] = useState([]);
  const [newNote, setNewNote] = useState('');
  const [selectedNote, setSelectedNote] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  // Load quick notes
  useEffect(() => {
    const loadNotes = async () => {
      try {
        const quickNotes = await getQuickNotes(gameState.player_name);
        setNotes(quickNotes);
      } catch (error) {
        console.error('Error loading quick notes:', error);
      }
    };

    loadNotes();
  }, [gameState.player_name]);

  const handleCreateNote = async () => {
    if (!newNote.trim()) return;

    try {
      await createQuickNote(gameState.player_name, newNote.trim());
      
      // Reload notes
      const quickNotes = await getQuickNotes(gameState.player_name);
      setNotes(quickNotes);
      
      // Reset form
      setNewNote('');
      setIsCreating(false);
    } catch (error) {
      console.error('Error creating quick note:', error);
      alert('Failed to save note. Please try again.');
    }
  };

  const handleDeleteNote = async (noteId) => {
    if (!confirm('Are you sure you want to delete this note?')) return;
    
    // For now, just remove from local state
    // In a real app, you'd call a delete API
    setNotes(prev => prev.filter(note => note.id !== noteId));
    setSelectedNote(null);
  };

  const filteredNotes = notes.filter(note =>
    !searchTerm || note.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTimeAgo = (dateString) => {
    const now = new Date();
    const noteDate = new Date(dateString);
    const diffMs = now - noteDate;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return formatDate(dateString);
  };

  const quickTemplates = [
    "🔍 Found something interesting at...",
    "💭 Thinking about...",
    "🎯 Goal for next session:",
    "❓ Question for Echo:",
    "✨ Spell idea:",
    "🗺️ Want to explore:",
    "💡 Random thought:",
    "📖 Story idea:"
  ];

  const exportNotes = () => {
    const exportData = notes.map(note => ({
      timestamp: note.timestamp,
      content: note.content
    }));

    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `echo_chambers_notes_${gameState.player_name}.json`;
    link.click();
  };

  return (
    <div>
      <h3 style={{ color: '#9333ea', marginBottom: '20px' }}>
        📝 Quick Notes ({notes.length} notes)
      </h3>

      {/* Search and New Note */}
      <div style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
          <input
            type="text"
            placeholder="Search notes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              flex: 1,
              padding: '8px 12px',
              background: 'rgba(255, 255, 255, 0.1)',
              border: '1px solid rgba(147, 51, 234, 0.3)',
              borderRadius: '6px',
              color: 'white',
              fontSize: '0.9rem'
            }}
          />
          
          <button
            onClick={() => setIsCreating(!isCreating)}
            style={{
              background: 'linear-gradient(45deg, #9333ea, #ec4899)',
              border: 'none',
              borderRadius: '6px',
              color: 'white',
              padding: '8px 16px',
              cursor: 'pointer',
              fontSize: '0.9rem'
            }}
          >
            {isCreating ? '✕' : '✍️ New Note'}
          </button>
        </div>

        {notes.length > 0 && (
          <button
            onClick={exportNotes}
            style={{
              background: 'linear-gradient(45deg, #10b981, #059669)',
              border: 'none',
              borderRadius: '6px',
              color: 'white',
              padding: '6px 12px',
              cursor: 'pointer',
              fontSize: '0.8rem'
            }}
          >
            📤 Export Notes
          </button>
        )}
      </div>

      {/* New Note Form */}
      {isCreating && (
        <div style={{
          background: 'rgba(255, 255, 255, 0.1)',
          border: '2px solid rgba(147, 51, 234, 0.5)',
          borderRadius: '10px',
          padding: '15px',
          marginBottom: '20px'
        }}>
          <h4 style={{ color: '#ec4899', marginBottom: '10px' }}>Quick Note</h4>
          
          <textarea
            placeholder="Jot down a quick thought..."
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            style={{
              width: '100%',
              height: '80px',
              padding: '10px',
              background: 'rgba(255, 255, 255, 0.1)',
              border: '1px solid rgba(147, 51, 234, 0.3)',
              borderRadius: '6px',
              color: 'white',
              resize: 'vertical',
              fontFamily: 'inherit',
              marginBottom: '10px'
            }}
          />

          {/* Quick Templates */}
          <div style={{ marginBottom: '15px' }}>
            <p style={{ fontSize: '0.8rem', opacity: 0.7, marginBottom: '8px' }}>
              Quick templates:
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {quickTemplates.slice(0, 4).map((template, index) => (
                <button
                  key={index}
                  onClick={() => setNewNote(template + ' ')}
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
                  {template}
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={handleCreateNote}
              disabled={!newNote.trim()}
              style={{
                background: 'linear-gradient(45deg, #10b981, #059669)',
                border: 'none',
                borderRadius: '6px',
                color: 'white',
                padding: '8px 16px',
                cursor: 'pointer',
                opacity: !newNote.trim() ? 0.5 : 1
              }}
            >
              Save Note
            </button>
            <button
              onClick={() => {
                setIsCreating(false);
                setNewNote('');
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

      {/* Notes List */}
      {filteredNotes.length > 0 ? (
        <div style={{ display: 'grid', gap: '10px' }}>
          {filteredNotes
            .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
            .map(note => (
              <div
                key={note.id}
                onClick={() => setSelectedNote(selectedNote?.id === note.id ? null : note)}
                style={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  border: selectedNote?.id === note.id ? '2px solid #9333ea' : '1px solid rgba(147, 51, 234, 0.3)',
                  borderRadius: '8px',
                  padding: '12px',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
              >
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '8px'
                }}>
                  <span style={{ fontSize: '0.7rem', opacity: 0.6 }}>
                    {getTimeAgo(note.timestamp)}
                  </span>
                  
                  {selectedNote?.id === note.id && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteNote(note.id);
                      }}
                      style={{
                        background: 'rgba(239, 68, 68, 0.6)',
                        border: 'none',
                        borderRadius: '4px',
                        color: 'white',
                        padding: '4px 8px',
                        cursor: 'pointer',
                        fontSize: '0.7rem'
                      }}
                    >
                      🗑️ Delete
                    </button>
                  )}
                </div>

                <p style={{
                  margin: 0,
                  lineHeight: '1.4',
                  fontSize: '0.9rem',
                  display: selectedNote?.id === note.id ? 'block' : '-webkit-box',
                  WebkitLineClamp: selectedNote?.id === note.id ? 'none' : 3,
                  WebkitBoxOrient: 'vertical',
                  overflow: selectedNote?.id === note.id ? 'visible' : 'hidden',
                  whiteSpace: selectedNote?.id === note.id ? 'pre-wrap' : 'normal'
                }}>
                  {note.content}
                </p>

                {selectedNote?.id === note.id && (
                  <div style={{
                    marginTop: '10px',
                    fontSize: '0.7rem',
                    opacity: 0.6,
                    borderTop: '1px solid rgba(147, 51, 234, 0.3)',
                    paddingTop: '8px'
                  }}>
                    Created: {formatDate(note.timestamp)}
                  </div>
                )}
              </div>
            ))}
        </div>
      ) : notes.length > 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '40px',
          opacity: 0.6
        }}>
          <p>No notes match your search</p>
          <p style={{ fontSize: '0.8rem' }}>
            Try adjusting your search terms
          </p>
        </div>
      ) : (
        <div style={{
          textAlign: 'center',
          padding: '40px',
          opacity: 0.6
        }}>
          <p>No quick notes yet</p>
          <p style={{ fontSize: '0.8rem' }}>
            Perfect for capturing fleeting thoughts and discoveries
          </p>
        </div>
      )}

      {/* Notes Stats */}
      {notes.length > 0 && (
        <div style={{
          marginTop: '20px',
          background: 'rgba(255, 255, 255, 0.1)',
          border: '1px solid rgba(147, 51, 234, 0.3)',
          borderRadius: '8px',
          padding: '15px'
        }}>
          <h4 style={{ color: '#ec4899', marginBottom: '10px' }}>
            📊 Notes Overview
          </h4>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', gap: '10px' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#9333ea' }}>
                {notes.length}
              </div>
              <div style={{ fontSize: '0.7rem', opacity: 0.7 }}>Total Notes</div>
            </div>
            
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#ec4899' }}>
                {notes.filter(n => n.content.length > 100).length}
              </div>
              <div style={{ fontSize: '0.7rem', opacity: 0.7 }}>Detailed Notes</div>
            </div>
            
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#10b981' }}>
                {Math.round(notes.reduce((sum, n) => sum + n.content.length, 0) / notes.length)}
              </div>
              <div style={{ fontSize: '0.7rem', opacity: 0.7 }}>Avg Length</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotesTab;