'use client'

import { useState } from 'react'
import { useAuth } from './context/AuthContext'
import Sidebar from './components/Sidebar'
import LoginForm from './components/LoginForm'
import RegisterForm from './components/RegisterForm'
import AIChat from './components/AIChat'
import ConversationsList from './components/ConversationsList'
import ConversationView from './components/ConversationView'

export default function Page() {
  const { user, loading } = useAuth()
  const [view, setView] = useState('chat')
  const [authView, setAuthView] = useState('login')
  const [activeConversation, setActiveConversation] = useState(null)

  if (loading) {
    return (
      <div className="app">
        <div className="loading-screen">
          <div className="loading-logo">
            <img src="/logo.png" alt="" />
          </div>
          <div className="loading-dots">
            <div className="typing-dot" /><div className="typing-dot" /><div className="typing-dot" />
          </div>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="app">
        {authView === 'login' ? (
          <LoginForm onSwitch={setAuthView} />
        ) : (
          <RegisterForm onSwitch={setAuthView} />
        )}
      </div>
    )
  }

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
