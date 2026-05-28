'use client'

import { createContext, useContext, useState, useEffect, useCallback } from 'react'

const API = process.env.NEXT_PUBLIC_API_URL || 'https://bayanchat-api.onrender.com'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const saved = localStorage.getItem('bayan_token')
    if (saved) {
      setToken(saved)
      fetch(`${API}/api/user`, {
        headers: { Authorization: `Bearer ${saved}` },
      })
        .then((r) => (r.ok ? r.json() : Promise.reject()))
        .then((d) => setUser(d.user))
        .catch(() => {
          localStorage.removeItem('bayan_token')
          setToken(null)
        })
        .finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [])

  const login = useCallback(async (email, password) => {
    const res = await fetch(`${API}/api/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })
    if (!res.ok) {
      const err = await res.json()
      throw new Error(err.errors?.email?.[0] || 'Login failed')
    }
    const data = await res.json()
    localStorage.setItem('bayan_token', data.token)
    setToken(data.token)
    setUser(data.user)
  }, [])

  const register = useCallback(async (name, email, password, passwordConfirmation) => {
    const res = await fetch(`${API}/api/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password, password_confirmation: passwordConfirmation }),
    })
    if (!res.ok) {
      const err = await res.json()
      const msg = Object.values(err.errors || {}).flat()[0] || 'Registration failed'
      throw new Error(msg)
    }
    const data = await res.json()
    localStorage.setItem('bayan_token', data.token)
    setToken(data.token)
    setUser(data.user)
  }, [])

  const logout = useCallback(async () => {
    if (token) {
      await fetch(`${API}/api/logout`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      }).catch(() => {})
    }
    localStorage.removeItem('bayan_token')
    setToken(null)
    setUser(null)
  }, [token])

  const authFetch = useCallback(
    async (path, options = {}) => {
      const headers = { ...options.headers }
      if (token) {
        headers.Authorization = `Bearer ${token}`
      }
      if (!headers['Content-Type'] && !(options.body instanceof FormData)) {
        headers['Content-Type'] = 'application/json'
      }
      const res = await fetch(`${API}${path}`, { ...options, headers })
      if (res.status === 401) {
        logout()
        throw new Error('Session expired')
      }
      return res
    },
    [token, logout],
  )

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, authFetch }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be inside AuthProvider')
  return ctx
}
