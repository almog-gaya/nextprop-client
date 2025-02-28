'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/lib/hooks/useAuth'

export default function Home() {
  const { user, isAuthenticated, isLoading, error, signIn } = useAuth()
  const router = useRouter()
  const [showNewUserOption, setShowNewUserOption] = useState(false)
  const [debugInfo, setDebugInfo] = useState<string | null>(null)

  useEffect(() => {
    // If user is authenticated and has a location, redirect to dashboard
    if (isAuthenticated && user?.locationId) {
      router.push('/dashboard')
    }
    // If user is authenticated but doesn't have a location, redirect to onboarding
    else if (isAuthenticated && !user?.locationId) {
      router.push('/onboarding')
    }
    
    // Check for URL error parameters
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const urlError = urlParams.get('error');
      if (urlError) {
        setDebugInfo(`Error from URL: ${urlError}`);
      }
    }
  }, [user, isAuthenticated, router])

  const handleSignIn = () => {
    console.log('Signing in with Go High Level...')
    setDebugInfo('Initiating sign-in process...')
    
    try {
      // Try direct navigation first
      window.location.href = '/api/auth/gohighlevel'
      
      // Set a fallback timeout in case the redirect doesn't happen
      setTimeout(() => {
        setDebugInfo('Redirect timeout - trying alternative method...')
        // Try fetch as a fallback
        fetch('/api/auth/gohighlevel')
          .then(response => {
            if (response.redirected) {
              window.location.href = response.url
            } else {
              setDebugInfo(`API responded but no redirect. Status: ${response.status}`)
            }
          })
          .catch(err => {
            setDebugInfo(`Fetch error: ${err.message}`)
            // Last resort - try the signIn from useAuth
            signIn()
          })
      }, 1000)
    } catch (error) {
      console.error('Error during sign-in:', error)
      setDebugInfo(`Sign-in error: ${error instanceof Error ? error.message : 'Unknown error'}`)
      // Try the hook's signIn as a fallback
      signIn()
    }
  }

  const handleNewUser = () => {
    console.log('Creating new account, navigating to /register...')
    try {
      router.push('/register')
    } catch (error) {
      console.error('Navigation error:', error)
      setDebugInfo(`Navigation error: ${error instanceof Error ? error.message : 'Unknown error'}`)
      // Fallback to window.location if router fails
      window.location.href = '/register'
    }
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 sm:p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-center font-mono text-sm flex flex-col">
        <div className="mb-12 flex flex-col items-center">
          <h1 className="text-4xl md:text-6xl font-bold text-center mb-4">
            Welcome to <span className="text-primary-600">NextProp.ai</span>
          </h1>
          <p className="text-xl md:text-2xl text-center text-gray-600 max-w-2xl">
            The ultimate real estate CRM platform powered by Go High Level
          </p>
        </div>

        <div className="flex flex-col items-center gap-8 mb-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-4xl">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold mb-2">Manage Leads</h3>
              <p className="text-gray-600">
                Track and nurture your real estate leads through the entire sales process.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold mb-2">Automate Marketing</h3>
              <p className="text-gray-600">
                Set up automated campaigns to stay in touch with clients and prospects.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold mb-2">Close Deals</h3>
              <p className="text-gray-600">
                Track opportunities and close more deals with our powerful pipeline tools.
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center gap-4">
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 max-w-md w-full">
              <p className="font-bold">Authentication Error</p>
              <p>{error}</p>
            </div>
          )}
          
          {debugInfo && (
            <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded mb-4 max-w-md w-full">
              <p className="font-bold">Debug Info</p>
              <p>{debugInfo}</p>
              {/* Add direct link as fallback */}
              <p className="mt-2">
                If the sign-in button doesn't work, try{' '}
                <a 
                  href="/api/auth/gohighlevel" 
                  className="text-blue-800 underline font-semibold"
                >
                  clicking here
                </a>
              </p>
            </div>
          )}
          
          {isLoading ? (
            <div className="flex flex-col items-center gap-4">
              <div className="flex items-center justify-center mb-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                <span className="ml-2">Loading...</span>
              </div>
              
              {/* Show sign-in button even during loading for better UX */}
              <button
                onClick={handleSignIn}
                className="bg-primary-600 hover:bg-primary-700 text-white font-bold py-3 px-6 rounded-lg text-lg transition-colors"
              >
                Sign In with Go High Level
              </button>
              <p className="text-gray-500 text-sm">
                Don't have a Go High Level account?{' '}
                <button
                  onClick={handleNewUser}
                  className="text-primary-600 hover:text-primary-700 font-semibold"
                >
                  Create a new account
                </button>
              </p>
              <p className="text-gray-500 text-sm mt-2">
                Having trouble signing in?{' '}
                <a 
                  href="/api/auth/gohighlevel" 
                  className="text-primary-600 hover:text-primary-700 font-semibold"
                >
                  Click here to sign in directly
                </a>
              </p>
            </div>
          ) : !showNewUserOption ? (
            <>
              <button
                onClick={handleSignIn}
                className="bg-primary-600 hover:bg-primary-700 text-white font-bold py-3 px-6 rounded-lg text-lg transition-colors"
                disabled={isLoading}
              >
                Sign In with Go High Level
              </button>
              <p className="text-gray-500 text-sm">
                Don't have a Go High Level account?{' '}
                <button
                  onClick={handleNewUser}
                  className="text-primary-600 hover:text-primary-700 font-semibold"
                >
                  Create a new account
                </button>
              </p>
              <p className="text-gray-500 text-sm mt-2">
                Having trouble signing in?{' '}
                <a 
                  href="/api/auth/gohighlevel" 
                  className="text-primary-600 hover:text-primary-700 font-semibold"
                >
                  Click here to sign in directly
                </a>
              </p>
            </>
          ) : (
            <>
              <div className="flex flex-col gap-4 items-center bg-white p-6 rounded-lg shadow-md w-full max-w-md">
                <h3 className="text-xl font-semibold">New to Go High Level?</h3>
                <p className="text-gray-600 text-center">
                  Create a new account to get started with NextProp.ai and Go High Level.
                </p>
                <button
                  onClick={handleNewUser}
                  className="bg-primary-600 hover:bg-primary-700 text-white font-bold py-3 px-6 rounded-lg text-lg transition-colors w-full"
                >
                  Create New Account
                </button>
                <button
                  onClick={() => setShowNewUserOption(false)}
                  className="text-primary-600 hover:text-primary-700 font-semibold"
                >
                  Back to Sign In
                </button>
              </div>
            </>
          )}
          
          {/* Development information section */}
          <div className="mt-8 p-4 border border-gray-200 rounded-lg max-w-md w-full">
            <h3 className="text-lg font-semibold mb-2">Debug Information</h3>
            <div className="text-sm text-gray-600">
              <p>Authentication Status: {isAuthenticated ? 'Authenticated' : 'Not Authenticated'}</p>
              <p>Loading: {isLoading ? 'Yes' : 'No'}</p>
              {user && (
                <div className="mt-2">
                  <p>User ID: {user.id}</p>
                  <p>Email: {user.email || 'N/A'}</p>
                  <p>Location ID: {user.locationId || 'N/A'}</p>
                  <p>Client ID: {user.client_id || 'N/A'}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  )
} 