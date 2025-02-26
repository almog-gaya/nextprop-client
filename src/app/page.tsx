'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/lib/hooks/useAuth'

export default function Home() {
  const { user, isAuthenticated, isLoading, signIn } = useAuth()
  const router = useRouter()
  const [showNewUserOption, setShowNewUserOption] = useState(false)

  useEffect(() => {
    // If user is authenticated and has a location, redirect to dashboard
    if (isAuthenticated && user?.locationId) {
      router.push('/dashboard')
    }
    // If user is authenticated but doesn't have a location, redirect to onboarding
    else if (isAuthenticated && !user?.locationId) {
      router.push('/onboarding')
    }
  }, [user, isAuthenticated, router])

  const handleSignIn = () => {
    console.log('Signing in with Go High Level...')
    signIn()
  }

  const handleNewUser = () => {
    console.log('Creating new account, navigating to /register...')
    try {
      router.push('/register')
    } catch (error) {
      console.error('Navigation error:', error)
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
          {!showNewUserOption ? (
            <>
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
         
          {/* Temporary development links 
          <div className="mt-8 p-4 border border-gray-200 rounded-lg">
            <h3 className="text-lg font-semibold mb-2">Development Navigation</h3>
            <div className="flex flex-col gap-2">
              <Link href="/dashboard" className="text-primary-600 hover:underline">
                Dashboard (Dev Only)
              </Link>
              <Link href="/onboarding" className="text-primary-600 hover:underline">
                Onboarding (Dev Only)
              </Link>
              <Link href="/register" className="text-primary-600 hover:underline">
                Register (Dev Only)
              </Link>
            </div>
          </div>
*/}
        </div>
      </div>
    </main>
  )
} 