import { useState, useEffect, useCallback } from 'react'

interface User {
  id: string
  name?: string
  email?: string
  locationId?: string
  client_id?: string
}

interface AuthState {
  user: User | null
  accessToken: string | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
}

export function useAuth(): AuthState & {
  signIn: () => void
  signOut: () => void
  refreshToken: () => Promise<boolean>
} {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    accessToken: null,
    isAuthenticated: false,
    isLoading: true,
    error: null
  })

  // Function to get the user from cookies
  const getUser = useCallback(async () => {
    try {
      // Fetch the user data from the API
      console.log('Fetching user data from API...')
      const response = await fetch('/api/auth/user')
      
      if (response.ok) {
        const data = await response.json()
        console.log('User data fetched successfully')
        
        // Ensure client_id is a string
        if (data.user && data.user.client_id) {
          data.user.client_id = String(data.user.client_id);
        }
        
        setAuthState({
          user: data.user,
          accessToken: data.accessToken,
          isAuthenticated: true,
          isLoading: false,
          error: null
        })
        
        return true
      } else {
        // Handle 401 Unauthorized or other error responses
        console.log('User not authenticated or error response:', response.status)
        let errorMessage = 'Authentication failed';
        
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        } catch (parseError) {
          console.error('Error parsing error response:', parseError);
        }
        
        setAuthState({
          user: null,
          accessToken: null,
          isAuthenticated: false,
          isLoading: false,
          error: response.status === 401 ? null : errorMessage // Don't show error for normal unauthenticated state
        })
        
        return false
      }
    } catch (error) {
      console.error('Error fetching user:', error)
      setAuthState({
        user: null,
        accessToken: null,
        isAuthenticated: false,
        isLoading: false,
        error: error instanceof Error ? error.message : 'An unknown error occurred'
      })
      
      return false
    }
  }, [])

  useEffect(() => {
    // Check if we're in a browser environment
    if (typeof window === 'undefined') {
      return
    }

    // Set a timeout to ensure loading state doesn't persist indefinitely
    const timeoutId = setTimeout(() => {
      if (authState.isLoading) {
        console.log('Loading timeout reached, resetting loading state')
        setAuthState(prev => ({
          ...prev,
          isLoading: false,
          error: prev.error || 'Request timed out'
        }))
      }
    }, 5000) // 5 second timeout

    getUser()

    // Clear timeout on cleanup
    return () => clearTimeout(timeoutId)
  }, [getUser, authState.isLoading])

  const signIn = () => {
    // Add debugging logs
    console.log('Starting Go High Level OAuth flow from useAuth hook...')
    
    try {
      // Set loading state
      setAuthState(prev => ({ ...prev, isLoading: true, error: null }))
      
      // Try direct navigation with a link element for better browser compatibility
      const link = document.createElement('a')
      link.href = '/api/auth/gohighlevel'
      link.style.display = 'none'
      document.body.appendChild(link)
      
      console.log('Created link element, clicking it...')
      link.click()
      
      // Clean up
      setTimeout(() => {
        document.body.removeChild(link)
        
        // Fallback if the link click doesn't work
        setTimeout(() => {
          console.log('Fallback: using window.location.href')
          window.location.href = '/api/auth/gohighlevel'
        }, 500)
      }, 100)
    } catch (error) {
      console.error('Error during redirect:', error)
      setAuthState(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: error instanceof Error ? error.message : 'Failed to redirect to authentication page'
      }))
      
      // Last resort fallback
      try {
        console.log('Last resort: using window.open')
        window.open('/api/auth/gohighlevel', '_self')
      } catch (fallbackError) {
        console.error('Fallback redirect also failed:', fallbackError)
      }
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
        error: null
      })
      
      // Redirect to the home page
      window.location.href = '/'
    } catch (error) {
      console.error('Error signing out:', error)
      setAuthState(prev => ({ 
        ...prev, 
        error: error instanceof Error ? error.message : 'Failed to sign out'
      }))
    }
  }

  const refreshToken = async (): Promise<boolean> => {
    try {
      console.log('Attempting to refresh access token')
      setAuthState(prev => ({ ...prev, isLoading: true, error: null }))
      
      const response = await fetch('/api/auth/refresh', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      })
      
      if (response.ok) {
        console.log('Token refreshed successfully')
        // Refresh the user data after token refresh
        return await getUser()
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Failed to refresh token' }))
        console.error('Token refresh failed:', errorData.error)
        setAuthState(prev => ({ 
          ...prev, 
          isLoading: false, 
          error: errorData.error || 'Failed to refresh token'
        }))
        return false
      }
    } catch (error) {
      console.error('Error refreshing token:', error)
      setAuthState(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: error instanceof Error ? error.message : 'Failed to refresh token'
      }))
      return false
    }
  }

  return {
    ...authState,
    signIn,
    signOut,
    refreshToken
  }
} 