import { useState, useEffect } from 'react'
import { blink } from '../lib/blink'
import type { UserProfile } from '../types'

export function useAuth() {
  const [user, setUser] = useState<Record<string, unknown> | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = blink.auth.onAuthStateChanged(async (state) => {
      setUser(state.user as Record<string, unknown> | null)
      if (!state.isLoading) {
        setIsLoading(false)
        if (state.user) {
          // Load user profile
          try {
            const profiles = await blink.db.userProfiles.list({
              where: { userId: state.user.id as string },
              limit: 1,
            })
            if (profiles.length > 0) {
              const p = profiles[0] as Record<string, unknown>
              setProfile({
                ...p,
                address: typeof p.address === 'string' ? JSON.parse(p.address as string || '{}') : (p.address || {}),
                role: (p.role as 'customer' | 'admin') || 'customer',
              } as UserProfile)
            } else {
              // Create profile if it doesn't exist
              const newProfile = await blink.db.userProfiles.create({
                id: `profile_${Date.now()}`,
                userId: state.user.id as string,
                displayName: (state.user.displayName as string) || (state.user.email as string)?.split('@')[0] || 'Customer',
                role: 'customer',
                address: '{}',
              })
              setProfile({
                ...newProfile,
                address: {},
                role: 'customer',
              } as unknown as UserProfile)
            }
          } catch {
            // ignore profile load errors
          }
        } else {
          setProfile(null)
        }
      }
    })
    return unsubscribe
  }, [])

  const isAdmin = profile?.role === 'admin'
  const isAuthenticated = !!user

  return { user, profile, isLoading, isAdmin, isAuthenticated }
}
