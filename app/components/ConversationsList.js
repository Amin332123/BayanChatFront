'use client'

import { useState, useEffect, useCallback } from 'react'

const API = process.env.NEXT_PUBLIC_API_URL || 'https://bayanchat-api.onrender.com'

const EMOTION_ICONS = {
  sadness: '😢', anxiety: '😰', anger: '😤', gratitude: '🤲',
  happiness: '😊', hope: '🌟', guilt: '😔', yearning: '💕',
  financial_worry: '💰', contentment: '🕊', grief: '🤍', crisis: '⚠️',
}

const TONE_LABELS = {
  casual: 'Casual', lightly_emotional: 'Light', emotional: 'Emotional',
  deeply_emotional: 'Deep', crisis: 'Crisis',
}

const TONE_CLASSES = {
  casual: 'tone-casual', lightly_emotional: 'tone-light',
  emotional: 'tone-emotional', deeply_emotional: 'tone-deep', crisis: 'tone-crisis',
}

function formatRelativeTime(ts) {
  const diff = Date.now() - new Date(ts).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'now'
  if (mins < 60) return `${mins}m`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}d`
  return new Date(ts).toLocaleDateString()
}

export default function ConversationsList({ onSelect }) {
  const [conversations, setConversations] = useState([])
  const [loading, setLoading] = useState(true)
  const [showNew, setShowNew] = useState(false)
  const [users, setUsers] = useState([])
  const [search, setSearch] = useState('')

  const load = useCallback(async () => {
    try {
      const res = await fetch(`${API}/api/conversations`)
      const data = await res.json()
      setConversations(data.data || [])
    } catch {} finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  const startPrivate = async (otherId) => {
    try {
      const res = await fetch(`${API}/api/conversations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'private', participant_ids: [otherId] }),
      })
      const data = await res.json()
      setShowNew(false)
      setSearch('')
      onSelect(data.data)
    } catch {}
  }

  const filtered = users.filter(
    (u) => u.name.toLowerCase().includes(search.toLowerCase()),
  )

  const tone = (c) => c.tone || 'casual'
  const emotionIcon = (c) => EMOTION_ICONS[c.dominant_emotion] || ''
  const latestText = (c) => c.latest_message?.content || ''

  return (
    <div className="view-content">
      <div className="conversations-view">
        <div className="conversations-header">
          <h2>Messages</h2>
          <button className="new-chat-btn" onClick={() => { setShowNew(!showNew); if (!showNew) loadUsers() }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            New Chat
          </button>
        </div>

        {showNew && (
          <div className="new-chat-panel">
            <input
              type="text"
              className="search-input"
              placeholder="Search users..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              autoFocus
            />
            <div className="users-list">
              {filtered.length === 0 ? (
                <div className="users-empty">No users found</div>
              ) : (
                filtered.map((u) => (
                  <button key={u.id} className="user-row" onClick={() => startPrivate(u.id)}>
                    <div className="user-avatar-sm">{u.name[0]}</div>
                    <span>{u.name}</span>
                  </button>
                ))
              )}
            </div>
          </div>
        )}

        {loading ? (
          <div className="loading-spinner" />
        ) : conversations.length === 0 ? (
          <div className="conversations-empty">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="48" height="48"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
            <p>No conversations yet</p>
            <span>Start a new chat with someone</span>
          </div>
        ) : (
          <div className="conversation-list">
            {conversations.map((c) => (
              <button key={c.id} className="conversation-row" onClick={() => onSelect(c)}>
                <div className="conv-avatar">
                  {c.type === 'group' ? (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                  ) : (
                    <span className="conv-avatar-letter">
                      {c.participants?.[0]?.name?.[0] || '?'}
                    </span>
                  )}
                </div>
                <div className="conv-info">
                  <div className="conv-top">
                    <span className="conv-name">
                      {c.type === 'group'
                        ? (c.name || 'Group')
                        : (c.participants?.[0]?.name || 'Unknown')}
                    </span>
                    <span className="conv-time">
                      {c.latest_message?.created_at ? formatRelativeTime(c.latest_message.created_at) : ''}
                    </span>
                  </div>
                  <div className="conv-bottom">
                    {c.dominant_emotion && (
                      <span className={`conv-tone ${TONE_CLASSES[tone(c)]}`}>
                        {emotionIcon(c)} {TONE_LABELS[tone(c)] || tone(c)}
                      </span>
                    )}
                    {c.unread_count > 0 && (
                      <span className="conv-unread">{c.unread_count}</span>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )

  async function loadUsers() {
    try {
      const res = await fetch(`${API}/api/users`)
      const data = await res.json()
      setUsers(data.data || [])
    } catch {}
  }
}
