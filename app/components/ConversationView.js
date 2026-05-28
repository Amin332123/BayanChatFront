'use client'

import { useState, useEffect, useRef, useCallback } from 'react'

const API = process.env.NEXT_PUBLIC_API_URL || 'https://bayanchat-api.onrender.com'

const EMOJIS = ['❤️', '👍', '😂', '😢', '😡', '🤲']

const EMOTION_ICONS = {
  sadness: '😢', anxiety: '😰', anger: '😤', gratitude: '🤲',
  happiness: '😊', hope: '🌟', guilt: '😔', yearning: '💕',
  financial_worry: '💰', contentment: '🕊', grief: '🤍', crisis: '⚠️',
}

function formatTime(ts) {
  const d = new Date(ts)
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

function formatDate(ts) {
  const d = new Date(ts)
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)
  if (d.toDateString() === today.toDateString()) return 'Today'
  if (d.toDateString() === yesterday.toDateString()) return 'Yesterday'
  return d.toLocaleDateString()
}

export default function ConversationView({ conversation, onBack }) {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const [loading, setLoading] = useState(true)
  const [analysis, setAnalysis] = useState(null)
  const [showAnalysis, setShowAnalysis] = useState(false)
  const [showEmoji, setShowEmoji] = useState(null)
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)

  const otherParticipant = conversation.participants?.[0]
  const convName = conversation.type === 'group'
    ? (conversation.name || 'Group')
    : (otherParticipant?.name || 'Unknown')

  const loadMessages = useCallback(async () => {
    try {
      const res = await fetch(`${API}/api/conversations/${conversation.id}/messages?per_page=100`)
      const data = await res.json()
      const msgs = data.data?.data || data.data || []
      setMessages(msgs.reverse())
      markRead()
    } catch {} finally {
      setLoading(false)
    }
  }, [conversation.id])

  const loadAnalysis = useCallback(async () => {
    try {
      const res = await fetch(`${API}/api/conversations/${conversation.id}/analyze`)
      const data = await res.json()
      setAnalysis(data.data)
    } catch {}
  }, [conversation.id])

  const markRead = async () => {
    try {
      await fetch(`${API}/api/conversations/${conversation.id}/read`, { method: 'POST' })
    } catch {}
  }

  useEffect(() => { loadMessages(); loadAnalysis() }, [loadMessages, loadAnalysis])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = async (e) => {
    e.preventDefault()
    if (!input.trim() || sending) return
    setSending(true)
    const text = input.trim()
    setInput('')
    try {
      const res = await fetch(`${API}/api/conversations/${conversation.id}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: text }),
      })
      const data = await res.json()
      setMessages((prev) => [...prev, data.data])
      loadAnalysis()
    } catch {
      setInput(text)
    } finally {
      setSending(false)
    }
  }

  const handleReact = async (msgId, reaction) => {
    try {
      await fetch(`${API}/api/conversations/${conversation.id}/messages/${msgId}/react`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reaction }),
      })
      loadMessages()
    } catch {}
  }

  const handleUnreact = async (msgId, reaction) => {
    try {
      await fetch(`${API}/api/conversations/${conversation.id}/messages/${msgId}/unreact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reaction }),
      })
      loadMessages()
    } catch {}
  }

  const hasMyReaction = (msg, reaction) => {
    return msg.reactions?.some((r) => r.reaction === reaction)
  }

  const groupedReactions = (msg) => {
    const groups = {}
    msg.reactions?.forEach((r) => {
      groups[r.reaction] = (groups[r.reaction] || 0) + 1
    })
    return groups
  }

  const showDateSeparator = (msg, index) => {
    if (index === 0) return true
    const prev = messages[index - 1]
    return formatDate(msg.created_at) !== formatDate(prev.created_at)
  }

  return (
    <div className="view-content">
      <div className="conversation-view">
        <div className="conv-view-header">
          <button className="back-btn" onClick={onBack}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
          </button>
          <div className="conv-view-info">
            <span className="conv-view-name">{convName}</span>
            {conversation.dominant_emotion && (
              <span className="conv-view-tone">
                {EMOTION_ICONS[conversation.dominant_emotion] || ''}
                {' '}{conversation.dominant_emotion}
              </span>
            )}
          </div>
          <button
            className={`analysis-btn${showAnalysis ? ' active' : ''}`}
            onClick={() => setShowAnalysis(!showAnalysis)}
            title="Conversation Analysis"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          </button>
        </div>

        {showAnalysis && analysis && (
          <div className="analysis-panel">
            <div className="analysis-grid">
              <div className="analysis-item">
                <span className="analysis-label">Tone</span>
                <span className="analysis-value">{analysis.tone}</span>
              </div>
              <div className="analysis-item">
                <span className="analysis-label">Dominant Emotion</span>
                <span className="analysis-value">{analysis.dominant_emotion || 'None'}</span>
              </div>
              <div className="analysis-item">
                <span className="analysis-label">Messages</span>
                <span className="analysis-value">{analysis.total_messages}</span>
              </div>
              <div className="analysis-item">
                <span className="analysis-label">Emotional Ratio</span>
                <span className="analysis-value">{Math.round(analysis.emotional_ratio * 100)}%</span>
              </div>
              <div className="analysis-item">
                <span className="analysis-label">Intensity</span>
                <span className="analysis-value">{analysis.average_intensity}</span>
              </div>
              {analysis.crisis_detected && (
                <div className="analysis-item crisis">
                  <span className="analysis-label">⚠ Crisis Detected</span>
                  <span className="analysis-value">Yes</span>
                </div>
              )}
            </div>
            {analysis.emotion_frequency && Object.keys(analysis.emotion_frequency).length > 0 && (
              <div className="analysis-emotions">
                {Object.entries(analysis.emotion_frequency).map(([emotion, count]) => (
                  <span key={emotion} className="emotion-chip">
                    {EMOTION_ICONS[emotion] || ''} {emotion} ({count})
                  </span>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="conv-messages">
          {loading ? (
            <div className="loading-spinner" />
          ) : messages.length === 0 ? (
            <div className="conv-empty-msg">
              <p>No messages yet. Say hello!</p>
            </div>
          ) : (
            messages.map((msg, i) => (
              <div key={msg.id}>
                {showDateSeparator(msg, i) && (
                  <div className="date-separator">{formatDate(msg.created_at)}</div>
                )}
                <div className="conv-msg other">
                  {msg.sender?.name && (
                    <div className="conv-msg-sender">{msg.sender.name}</div>
                  )}
                  <div className={`conv-msg-bubble ${msg.type === 'system' ? 'system' : ''}`}>
                    {msg.parent && (
                      <div className="reply-preview">
                        <span>{msg.parent.content?.slice(0, 80)}</span>
                      </div>
                    )}
                    <div className="conv-msg-text">
                      {msg.content}
                    </div>
                    <div className="conv-msg-footer">
                      <span className="conv-msg-time">{formatTime(msg.created_at)}</span>
                      {msg.analysis?.has_emotion && msg.analysis?.dominant_emotion && (
                        <span className="conv-msg-emotion" title={msg.analysis.dominant_emotion}>
                          {EMOTION_ICONS[msg.analysis.dominant_emotion]}
                        </span>
                      )}
                    </div>
                  </div>

                  {Object.keys(groupedReactions(msg)).length > 0 && (
                    <div className="conv-reactions">
                      {Object.entries(groupedReactions(msg)).map(([reaction, count]) => (
                        <span key={reaction} className="conv-reaction">
                          {reaction} {count > 1 ? count : ''}
                        </span>
                      ))}
                    </div>
                  )}

                  {msg.type === 'text' && (
                    <div className="conv-msg-actions">
                      <button
                        className="emoji-toggle"
                        onClick={() => setShowEmoji(showEmoji === msg.id ? null : msg.id)}
                      >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>
                      </button>
                      {showEmoji === msg.id && (
                        <div className="emoji-picker">
                          {EMOJIS.map((emoji) => (
                            <button
                              key={emoji}
                              className={`emoji-option${hasMyReaction(msg, emoji) ? ' active' : ''}`}
                              onClick={() => hasMyReaction(msg, emoji) ? handleUnreact(msg.id, emoji) : handleReact(msg.id, emoji)}
                            >
                              {emoji}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="conv-input-area">
          <form onSubmit={sendMessage} className="conv-input-form">
            <div className="conv-input-wrapper">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(e) } }}
                placeholder={`Message ${convName}...`}
                rows={1}
                disabled={sending}
              />
            </div>
            <button type="submit" className="send-btn" disabled={sending || !input.trim()}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
