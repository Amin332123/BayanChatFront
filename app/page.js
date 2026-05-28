'use client'

import { useState } from 'react'
import Sidebar from './components/Sidebar'
import AIChat from './components/AIChat'
import ConversationsList from './components/ConversationsList'
import ConversationView from './components/ConversationView'

export default function Page() {
  const [view, setView] = useState('chat')
  const [activeConversation, setActiveConversation] = useState(null)

  const handleNavigate = (v) => {
    setView(v)
    if (v !== 'conversation') setActiveConversation(null)
  }

  const handleSelectConversation = (conv) => {
    setActiveConversation(conv)
    setView('conversation')
  }

  return (
    <div className="app">
      <Sidebar activeView={view === 'conversation' ? 'conversations' : view} onNavigate={handleNavigate} />
      <div className="main-area">
        {view === 'chat' && <AIChat />}
        {view === 'conversations' && (
          <ConversationsList onSelect={handleSelectConversation} />
        )}
        {view === 'conversation' && activeConversation && (
          <ConversationView
            conversation={activeConversation}
            onBack={() => { setView('conversations'); setActiveConversation(null) }}
          />
        )}
      </div>
    </div>
  )
}
