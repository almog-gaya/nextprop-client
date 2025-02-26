import { useState, useEffect } from 'react'

interface User {
  id: string
  name?: string
  email?: string
  locationId?: string
}

interface AuthState {
  user: User | null
  accessToken: string | null
  isAuthenticated: boolean
  isLoading: boolean
}

export function useAuth(): AuthState & {
  signIn: () => void
  signOut: () => void
} {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    accessToken: null,
    isAuthenticated: false,
    isLoading: true,
  })

  useEffect(() => {
    // Check if we're in a browser environment
    if (typeof window === 'undefined') {
      return
    }

    // Function to get the user from cookies
    const getUser = async () => {
      try {
        // Fetch the user data from the API
        const response = await fetch('/api/auth/user')
        
        if (response.ok) {
          const data = await response.json()
          
          setAuthState({
            user: data.user,
            accessToken: data.accessToken,
            isAuthenticated: true,
            isLoading: false,
          })
        } else {
          setAuthState({
            user: null,
            accessToken: null,
            isAuthenticated: false,
            isLoading: false,
          })
        }
      } catch (error) {
        console.error('Error fetching user:', error)
        setAuthState({
          user: null,
          accessToken: null,
          isAuthenticated: false,
          isLoading: false,
        })
      }
    }

    getUser()
  }, [])

  const signIn = () => {
    // Add debugging logs
    console.log('Starting Go High Level OAuth flow...')
    console.log('Redirecting to:', '/api/auth/gohighlevel')
    
    try {
      // Redirect to the Go High Level OAuth flow
      window.location.href = '/api/auth/gohighlevel'
    } catch (error) {
      console.error('Error during redirect:', error)
    }
  }

  const signOut = async () => {
    try {
      // Call the sign-out API
      await fetch('/api/auth/signout', { method: 'POST' })
      
      // Update the auth state
      setAuthState({
        user: null,
        accessToken: null,
        isAuthenticated: false,
        isLoading: false,
      })
      
      // Redirect to the home page
      window.location.href = '/'
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  return {
    ...authState,
    signIn,
    signOut,
  }
} 