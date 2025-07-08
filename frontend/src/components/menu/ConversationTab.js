import React, { useState, useEffect } from 'react';
import { useGame } from '../../contexts/GameContext';
import { getChatHistory } from '../../utils/api';

const ConversationTab = () => {
  const { gameState } = useGame();
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterMood, setFilterMood] = useState('all');

  // Load conversation history
  useEffect(() => {
    const loadConversations = async () => {
      try {
        const history = await getChatHistory(gameState.player_name);
        setConversations(history);
      } catch (error) {
        console.error('Error loading conversation history:', error);
      }
    };

    loadConversations();
  }, [gameState.player_name]);

  // Group conversations by date
  const groupedConversations = conversations.reduce((groups, conv) => {
    const date = new Date(conv.timestamp).toDateString();
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(conv);
    return groups;
  }, {});

  // Filter conversations
  const filteredGroups = Object.entries(groupedConversations).reduce((filtered, [date, convs]) => {
    const filteredConvs = convs.filter(conv => {
      const matchesSearch = !searchTerm || 
        conv.message.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesMood = filterMood === 'all' || 
        (conv.context?.mood_change === filterMood);
      return matchesSearch && matchesMood;
    });
    
    if (filteredConvs.length > 0) {
      filtered[date] = filteredConvs;
    }
    return filtered;
  }, {});

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
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

  const exportConversations = () => {
    const exportData = conversations.map(conv => ({
      timestamp: conv.timestamp,
      speaker: conv.context?.is_echo ? 'Echo' : gameState.player_name,
      message: conv.message,
      mood: conv.context?.mood_change || 'neutral'
    }));

    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `echo_chambers_conversations_${gameState.player_name}.json`;
    link.click();
  };

  return (
    <div>
      <h3 style={{ color: '#9333ea', marginBottom: '20px' }}>
        💭 Conversations with Echo ({conversations.length} messages)
      </h3>

      {/* Search and Filter */}
      <div style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
          <input
            type="text"
            placeholder="Search conversations..."
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
          
          <select
            value={filterMood}
            onChange={(e) => setFilterMood(e.target.value)}
            style={{
              padding: '8px 12px',
              background: 'rgba(255, 255, 255, 0.1)',
              border: '1px solid rgba(147, 51, 234, 0.3)',
              borderRadius: '6px',
              color: 'white',
              fontSize: '0.9rem'
            }}
          >
            <option value="all" style={{ background: '#1f2937' }}>All Moods</option>
            <option value="melancholic" style={{ background: '#1f2937' }}>Melancholic</option>
            <option value="radiant" style={{ background: '#1f2937' }}>Radiant</option>
            <option value="contemplative" style={{ background: '#1f2937' }}>Contemplative</option>
            <option value="peaceful" style={{ background: '#1f2937' }}>Peaceful</option>
          </select>
        </div>

        <button
          onClick={exportConversations}
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
          📤 Export Conversations
        </button>
      </div>

      {/* Conversations by Date */}
      {Object.keys(filteredGroups).length > 0 ? (
        <div style={{ display: 'grid', gap: '20px' }}>
          {Object.entries(filteredGroups)
            .sort(([a], [b]) => new Date(b) - new Date(a))
            .map(([date, convs]) => (
              <div key={date}>
                <h4 style={{
                  color: '#ec4899',
                  marginBottom: '15px',
                  padding: '8px 0',
                  borderBottom: '1px solid rgba(147, 51, 234, 0.3)'
                }}>
                  {new Date(date).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </h4>

                <div style={{ display: 'grid', gap: '10px' }}>
                  {convs.map(conv => (
                    <div
                      key={conv.id}
                      style={{
                        background: conv.context?.is_echo ? 'rgba(147, 51, 234, 0.2)' : 'rgba(255, 255, 255, 0.1)',
                        border: conv.context?.is_echo ? '1px solid rgba(147, 51, 234, 0.5)' : '1px solid rgba(255, 255, 255, 0.2)',
                        borderRadius: '8px',
                        padding: '12px',
                        position: 'relative'
                      }}
                    >
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '8px'
                      }}>
                        <span style={{
                          fontWeight: 'bold',
                          color: conv.context?.is_echo ? '#9333ea' : '#ec4899'
                        }}>
                          {conv.context?.is_echo ? '✨ Echo' : `🧚‍♀️ ${gameState.player_name}`}
                        </span>
                        
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          {conv.context?.mood_change && (
                            <span style={{
                              background: getMoodColor(conv.context.mood_change),
                              color: 'white',
                              padding: '2px 6px',
                              borderRadius: '4px',
                              fontSize: '0.6rem',
                              textTransform: 'capitalize'
                            }}>
                              {conv.context.mood_change}
                            </span>
                          )}
                          <span style={{ fontSize: '0.7rem', opacity: 0.6 }}>
                            {formatTime(conv.timestamp)}
                          </span>
                        </div>
                      </div>

                      <p style={{
                        margin: 0,
                        lineHeight: '1.4',
                        fontSize: '0.9rem'
                      }}>
                        {conv.message}
                      </p>

                      {/* Show if this conversation unlocked something */}
                      {conv.context?.area_unlocked && (
                        <div style={{
                          marginTop: '8px',
                          padding: '6px 10px',
                          background: 'rgba(16, 185, 129, 0.2)',
                          border: '1px solid rgba(16, 185, 129, 0.3)',
                          borderRadius: '4px',
                          fontSize: '0.7rem'
                        }}>
                          🗝️ Unlocked: {conv.context.area_unlocked.replace('_', ' ')}
                        </div>
                      )}

                      {conv.context?.spell_learned && (
                        <div style={{
                          marginTop: '8px',
                          padding: '6px 10px',
                          background: 'rgba(251, 191, 36, 0.2)',
                          border: '1px solid rgba(251, 191, 36, 0.3)',
                          borderRadius: '4px',
                          fontSize: '0.7rem'
                        }}>
                          ✨ Learned Spell: {conv.context.spell_learned.name}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
        </div>
      ) : conversations.length > 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '40px',
          opacity: 0.6
        }}>
          <p>No conversations match your search</p>
          <p style={{ fontSize: '0.8rem' }}>
            Try adjusting your search terms or filters
          </p>
        </div>
      ) : (
        <div style={{
          textAlign: 'center',
          padding: '40px',
          opacity: 0.6
        }}>
          <p>No conversations yet</p>
          <p style={{ fontSize: '0.8rem' }}>
            Start chatting with Echo to see your conversation history here
          </p>
        </div>
      )}

      {/* Conversation Stats */}
      {conversations.length > 0 && (
        <div style={{
          marginTop: '30px',
          background: 'rgba(255, 255, 255, 0.1)',
          border: '1px solid rgba(147, 51, 234, 0.3)',
          borderRadius: '8px',
          padding: '15px'
        }}>
          <h4 style={{ color: '#ec4899', marginBottom: '10px' }}>
            📊 Conversation Statistics
          </h4>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '10px' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#9333ea' }}>
                {conversations.length}
              </div>
              <div style={{ fontSize: '0.7rem', opacity: 0.7 }}>Total Messages</div>
            </div>
            
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#ec4899' }}>
                {conversations.filter(c => c.context?.is_echo).length}
              </div>
              <div style={{ fontSize: '0.7rem', opacity: 0.7 }}>Echo's Responses</div>
            </div>
            
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#10b981' }}>
                {conversations.filter(c => c.context?.mood_change).length}
              </div>
              <div style={{ fontSize: '0.7rem', opacity: 0.7 }}>Mood Changes</div>
            </div>
            
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#fbbf24' }}>
                {Object.keys(groupedConversations).length}
              </div>
              <div style={{ fontSize: '0.7rem', opacity: 0.7 }}>Active Days</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConversationTab;