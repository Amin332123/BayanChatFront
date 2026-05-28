'use client'

import { useState, useEffect, useRef } from 'react'

const STORAGE_KEY = 'bayan_messages'

function loadMessages() {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function saveMessages(messages) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(messages))
}

function isArabic(text) {
  return /[\u0600-\u06FF]/.test(text)
}

function parseVerseText(text) {
  const parts = []
  const regex = /<sup\s+foot_note=(\d+)>(\d+)<\/sup>/g
  let last = 0
  let m
  while ((m = regex.exec(text)) !== null) {
    if (m.index > last) parts.push({ t: 'txt', v: text.slice(last, m.index) })
    parts.push({ t: 'sup', id: m[1], label: m[2] })
    last = regex.lastIndex
  }
  if (last < text.length) parts.push({ t: 'txt', v: text.slice(last) })
  return parts
}

function formatTime(ts) {
  const d = new Date(ts)
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

const SURAH_NAMES = {
  1: { en: 'Al-Fatiha', ar: 'الفاتحة' },
  2: { en: 'Al-Baqarah', ar: 'البقرة' },
  3: { en: 'Aal-Imran', ar: 'آل عمران' },
  4: { en: 'An-Nisa', ar: 'النساء' },
  5: { en: 'Al-Maidah', ar: 'المائدة' },
  6: { en: 'Al-Anam', ar: 'الأنعام' },
  7: { en: 'Al-Araf', ar: 'الأعراف' },
  8: { en: 'Al-Anfal', ar: 'الأنفال' },
  9: { en: 'At-Tawbah', ar: 'التوبة' },
  10: { en: 'Yunus', ar: 'يونس' },
  11: { en: 'Hud', ar: 'هود' },
  12: { en: 'Yusuf', ar: 'يوسف' },
  13: { en: 'Ar-Rad', ar: 'الرعد' },
  14: { en: 'Ibrahim', ar: 'إبراهيم' },
  15: { en: 'Al-Hijr', ar: 'الحجر' },
  16: { en: 'An-Nahl', ar: 'النحل' },
  17: { en: 'Al-Isra', ar: 'الإسراء' },
  18: { en: 'Al-Kahf', ar: 'الكهف' },
  19: { en: 'Maryam', ar: 'مريم' },
  20: { en: 'Ta-Ha', ar: 'طه' },
  21: { en: 'Al-Anbiya', ar: 'الأنبياء' },
  22: { en: 'Al-Hajj', ar: 'الحج' },
  23: { en: 'Al-Muminun', ar: 'المؤمنون' },
  24: { en: 'An-Nur', ar: 'النور' },
  25: { en: 'Al-Furqan', ar: 'الفرقان' },
  26: { en: 'Ash-Shuara', ar: 'الشعراء' },
  27: { en: 'An-Naml', ar: 'النمل' },
  28: { en: 'Al-Qasas', ar: 'القصص' },
  29: { en: 'Al-Ankabut', ar: 'العنكبوت' },
  30: { en: 'Ar-Rum', ar: 'الروم' },
  31: { en: 'Luqman', ar: 'لقمان' },
  32: { en: 'As-Sajdah', ar: 'السجدة' },
  33: { en: 'Al-Ahzab', ar: 'الأحزاب' },
  34: { en: 'Saba', ar: 'سبأ' },
  35: { en: 'Fatir', ar: 'فاطر' },
  36: { en: 'Ya-Sin', ar: 'يس' },
  37: { en: 'As-Saffat', ar: 'الصافات' },
  38: { en: 'Sad', ar: 'ص' },
  39: { en: 'Az-Zumar', ar: 'الزمر' },
  40: { en: 'Ghafir', ar: 'غافر' },
  41: { en: 'Fussilat', ar: 'فصلت' },
  42: { en: 'Ash-Shura', ar: 'الشورى' },
  43: { en: 'Az-Zukhruf', ar: 'الزخرف' },
  44: { en: 'Ad-Dukhan', ar: 'الدخان' },
  45: { en: 'Al-Jathiyah', ar: 'الجاثية' },
  46: { en: 'Al-Ahqaf', ar: 'الأحقاف' },
  47: { en: 'Muhammad', ar: 'محمد' },
  48: { en: 'Al-Fath', ar: 'الفتح' },
  49: { en: 'Al-Hujurat', ar: 'الحجرات' },
  50: { en: 'Qaf', ar: 'ق' },
  51: { en: 'Adh-Dhariyat', ar: 'الذاريات' },
  52: { en: 'At-Tur', ar: 'الطور' },
  53: { en: 'An-Najm', ar: 'النجم' },
  54: { en: 'Al-Qamar', ar: 'القمر' },
  55: { en: 'Ar-Rahman', ar: 'الرحمن' },
  56: { en: 'Al-Waqiah', ar: 'الواقعة' },
  57: { en: 'Al-Hadid', ar: 'الحديد' },
  58: { en: 'Al-Mujadilah', ar: 'المجادلة' },
  59: { en: 'Al-Hashr', ar: 'الحشر' },
  60: { en: 'Al-Mumtahanah', ar: 'الممتحنة' },
  61: { en: 'As-Saf', ar: 'الصف' },
  62: { en: 'Al-Jumuah', ar: 'الجمعة' },
  63: { en: 'Al-Munafiqun', ar: 'المنافقون' },
  64: { en: 'At-Taghabun', ar: 'التغابن' },
  65: { en: 'At-Talaq', ar: 'الطلاق' },
  66: { en: 'At-Tahrim', ar: 'التحريم' },
  67: { en: 'Al-Mulk', ar: 'الملك' },
  68: { en: 'Al-Qalam', ar: 'القلم' },
  69: { en: 'Al-Haqqah', ar: 'الحاقة' },
  70: { en: 'Al-Maarij', ar: 'المعارج' },
  71: { en: 'Nuh', ar: 'نوح' },
  72: { en: 'Al-Jinn', ar: 'الجن' },
  73: { en: 'Al-Muzzammil', ar: 'المزمل' },
  74: { en: 'Al-Muddaththir', ar: 'المدثر' },
  75: { en: 'Al-Qiyamah', ar: 'القيامة' },
  76: { en: 'Al-Insan', ar: 'الإنسان' },
  77: { en: 'Al-Mursalat', ar: 'المرسلات' },
  78: { en: 'An-Naba', ar: 'النبأ' },
  79: { en: 'An-Naziat', ar: 'النازعات' },
  80: { en: 'Abasa', ar: 'عبس' },
  81: { en: 'At-Takwir', ar: 'التكوير' },
  82: { en: 'Al-Infitar', ar: 'الإنفطار' },
  83: { en: 'Al-Mutaffifin', ar: 'المطففين' },
  84: { en: 'Al-Inshiqaq', ar: 'الانشقاق' },
  85: { en: 'Al-Buruj', ar: 'البروج' },
  86: { en: 'At-Tariq', ar: 'الطارق' },
  87: { en: 'Al-Ala', ar: 'الأعلى' },
  88: { en: 'Al-Ghashiyah', ar: 'الغاشية' },
  89: { en: 'Al-Fajr', ar: 'الفجر' },
  90: { en: 'Al-Balad', ar: 'البلد' },
  91: { en: 'Ash-Shams', ar: 'الشمس' },
  92: { en: 'Al-Layl', ar: 'الليل' },
  93: { en: 'Ad-Duha', ar: 'الضحى' },
  94: { en: 'Ash-Sharh', ar: 'الشرح' },
  95: { en: 'At-Tin', ar: 'التين' },
  96: { en: 'Al-Alaq', ar: 'العلق' },
  97: { en: 'Al-Qadr', ar: 'القدر' },
  98: { en: 'Al-Bayyinah', ar: 'البينة' },
  99: { en: 'Az-Zalzalah', ar: 'الزلزلة' },
  100: { en: 'Al-Adiyat', ar: 'العاديات' },
  101: { en: 'Al-Qariah', ar: 'القارعة' },
  102: { en: 'At-Takathur', ar: 'التكاثر' },
  103: { en: 'Al-Asr', ar: 'العصر' },
  104: { en: 'Al-Humazah', ar: 'الهمزة' },
  105: { en: 'Al-Fil', ar: 'الفيل' },
  106: { en: 'Quraysh', ar: 'قريش' },
  107: { en: 'Al-Maun', ar: 'الماعون' },
  108: { en: 'Al-Kawthar', ar: 'الكوثر' },
  109: { en: 'Al-Kafirun', ar: 'الكافرون' },
  110: { en: 'An-Nasr', ar: 'النصر' },
  111: { en: 'Al-Masad', ar: 'المسد' },
  112: { en: 'Al-Ikhlas', ar: 'الإخلاص' },
  113: { en: 'Al-Falaq', ar: 'الفلق' },
  114: { en: 'An-Nas', ar: 'الناس' },
}

const SUGGESTIONS = [
  'I feel lonely',
  'I feel anxious',
  'I feel sad',
  'I feel lost',
  'I need guidance',
  'I feel grateful',
  'I feel peaceful',
  'I feel stressed',
  'I feel hopeful',
]

const categoryLabel = {
  loneliness: 'Loneliness',
  anxiety: 'Anxiety',
  sadness: 'Sadness',
  financial_worry: 'Financial Worry',
  yearning: 'Yearning',
  grief: 'Grief',
  guilt: 'Guilt',
  anger: 'Anger',
  happiness: 'Happiness',
  gratitude: 'Gratitude',
  hope: 'Hope',
  contentment: 'Contentment',
  crisis: 'Crisis',
}

export default function Page() {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [footnote, setFootnote] = useState(null)
  const [hasMounted, setHasMounted] = useState(false)
  const chatRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    const saved = loadMessages()
    if (saved.length > 0) {
      setMessages(saved)
    }
    setHasMounted(true)
  }, [])

  useEffect(() => {
    if (hasMounted) {
      saveMessages(messages)
    }
  }, [messages, hasMounted])

  useEffect(() => {
    const el = chatRef.current
    if (!el) return
    const threshold = 80
    const isNearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < threshold
    if (isNearBottom) {
      el.scrollTop = el.scrollHeight
    }
  }, [messages, loading])

  useEffect(() => {
    if (!footnote) return
    const handler = (e) => {
      if (!e.target.closest('.fn-popup') && !e.target.closest('.verse-fn')) {
        setFootnote(null)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [footnote])

  const handleSubmit = async (text) => {
    if (!text.trim() || loading) return

    const userMsg = { role: 'user', text: text.trim(), timestamp: Date.now() }
    setMessages((prev) => [...prev, userMsg])
    setInput('')
    setLoading(true)

    setTimeout(() => {
      chatRef.current?.scrollTo({ top: chatRef.current.scrollHeight, behavior: 'smooth' })
    }, 0)

    try {
      const res = await fetch('https://bayanchat-api.onrender.com/api/process-reflection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input: text.trim() }),
      })

      const data = await res.json()

      if (data.status === 'rejected') {
        setMessages((prev) => [...prev, { role: 'bot', type: 'rejected', text: data.message, timestamp: Date.now() }])
      } else if (data.status === 'approved') {
        setMessages((prev) => [
          ...prev,
          { role: 'bot', type: 'verses', category: data.category, language: data.language, verses: data.verses, timestamp: Date.now() },
        ])
      } else {
        setMessages((prev) => [
          ...prev,
          { role: 'bot', type: 'rejected', text: 'Something went wrong. Please try again.', timestamp: Date.now() },
        ])
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: 'bot', type: 'rejected', text: 'Service is not running now. Try it later.', timestamp: Date.now() },
      ])
    } finally {
      setLoading(false)
    }
  }

  const handleFormSubmit = (e) => {
    e.preventDefault()
    handleSubmit(input)
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(input)
    }
  }

  return (
    <div className="app">
      <div className="header">
        <div className="header-inner">
          <div className="header-logo">
            <img src="/logo.png" alt="Bayan Chat" />
          </div>
          <div className="header-text">
            <h1>Bayan Chat</h1>
            <p>Speak your heart &mdash; find clarity in the Quran</p>
          </div>
        </div>
      </div>

      <div className="chat" ref={chatRef}>
        {messages.length === 0 && !loading ? (
          <div className="empty-state">
            <div className="empty-glow">
              <img src="/logo.png" alt="Bayan Chat" />
            </div>
            <h2>What&rsquo;s on your heart?</h2>
            <p>Tell me what you&rsquo;re feeling, and I&rsquo;ll bring you verses from the Quran that speak to your soul.</p>
            <div className="suggestions">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  className="suggestion-chip"
                  onClick={() => handleSubmit(s)}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((msg, i) => (
            <div key={i}>
              {msg.role === 'user' ? (
                <div className="message user">
                  <div className="message-label">You</div>
                  <div className={`message-bubble${isArabic(msg.text) ? ' arabic-text' : ''}`}>{msg.text}</div>
                  {msg.timestamp && <div className="message-time">{formatTime(msg.timestamp)}</div>}
                </div>
              ) : msg.type === 'rejected' ? (
                <div className="message bot">
                  <div className="message-label">Bayan</div>
                  <div className="rejected-message">
                    <span className="rejected-icon">🕊</span>
                    <span className={`rejected-text${isArabic(msg.text) ? ' arabic-text' : ''}`}>{msg.text}</span>
                  </div>
                  {msg.timestamp && <div className="message-time">{formatTime(msg.timestamp)}</div>}
                </div>
              ) : (
                <div className="message bot">
                  <div className="message-label">
                    Bayan &middot; {categoryLabel[msg.category] || msg.category}
                  </div>
                  <div className="verse-card">
                    <div className="verse-card-header">
                      <div className="verse-card-icon">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                          <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                        </svg>
                      </div>
                      <span className="verse-card-title">
                        {msg.language === 'arabic' ? 'الآيات' : 'Quranic Verses'}
                      </span>
                      <span className="verse-card-subtitle">
                        {categoryLabel[msg.category] || msg.category}
                      </span>
                    </div>
                    <div className="verses-section">
                      {msg.verses.map((v, j) => {
                        const [surahNum, ayahNum] = v.reference.split(':')
                        const surah = SURAH_NAMES[parseInt(surahNum)]
                        return (
                          <div key={j} className="verse-item">
                            <div className="verse-reference">
                              <span className={`verse-surah-name${msg.language === 'arabic' ? ' arabic-surah' : ''}`}>
                                {msg.language === 'arabic'
                                  ? (surah?.ar || `سورة ${surahNum}`)
                                  : (surah?.en || `Surah ${surahNum}`)}
                              </span>
                              <span className="verse-ayah-num">
                                {msg.language === 'arabic' ? `الآية ${ayahNum}` : `Verse ${ayahNum}`}
                              </span>
                            </div>
                            <div className={`verse-text ${msg.language === 'arabic' ? 'arabic-text' : ''}`}>
                              {parseVerseText(v.text).map((part, pi) =>
                                part.t === 'txt'
                                  ? <span key={pi}>{part.v}</span>
                                  : <sup key={pi} className="verse-fn" onClick={(e) => { e.stopPropagation(); setFootnote(part.id === footnote ? null : part.id) }}>{part.label}</sup>
                              )}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                    {footnote && (
                      <div className="fn-popup">
                        <div className="fn-popup-header">
                          <span>Footnote</span>
                          <button className="fn-close" onClick={() => setFootnote(null)}>&times;</button>
                        </div>
                        <div className="fn-popup-body">
                          Reference ID: {footnote}
                        </div>
                      </div>
                    )}
                  </div>
                  {msg.timestamp && <div className="message-time">{formatTime(msg.timestamp)}</div>}
                </div>
              )}
            </div>
          ))
        )}

        {loading && (
          <div className="typing">
            <div className="typing-dot" />
            <div className="typing-dot" />
            <div className="typing-dot" />
          </div>
        )}


      </div>

      <div className="input-area">
        <form className="input-form" onSubmit={handleFormSubmit}>
          <div className="input-wrapper">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Share what&rsquo;s on your heart..."
              rows={1}
              disabled={loading}
            />
          </div>
          <button type="submit" className="send-btn" disabled={loading || !input.trim()}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="22" y1="2" x2="11" y2="13" />
              <polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          </button>
        </form>
      </div>
    </div>
  )
}
