'use client'

export default function Sidebar({ activeView, onNavigate }) {
  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <img src="/logo.png" alt="Bayan" />
        </div>
        <span className="sidebar-brand">Bayan</span>
      </div>

      <nav className="sidebar-nav">
        <button
          className={`sidebar-link${activeView === 'chat' ? ' active' : ''}`}
          onClick={() => onNavigate('chat')}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
          AI Reflection
        </button>

        <button
          className={`sidebar-link${activeView === 'conversations' ? ' active' : ''}`}
          onClick={() => onNavigate('conversations')}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
          Messages
        </button>
      </nav>
    </div>
  )
}
