'use client'

import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { 
  FiHome, 
  FiUsers, 
  FiPieChart, 
  FiSettings, 
  FiLogOut, 
  FiMenu, 
  FiX,
  FiMessageSquare,
  FiPhoneCall,
  FiMail,
  FiBarChart2,
  FiTarget
} from 'react-icons/fi'
import { useAuth } from '@/lib/hooks/useAuth'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, isAuthenticated, isLoading, signOut } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isClient, setIsClient] = useState(false)

  // This effect ensures we only run client-side code after hydration
  useEffect(() => {
    setIsClient(true)
  }, [])

  // Only run these redirects on the client side
  useEffect(() => {
    if (!isClient) return

    // Redirect to home if not authenticated
    if (!isLoading && !isAuthenticated) {
      router.push('/')
    }
  }, [isAuthenticated, isLoading, router, isClient])

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: FiHome },
    { name: 'Contacts', href: '/dashboard/contacts', icon: FiUsers },
    { name: 'Opportunities', href: '/dashboard/opportunities', icon: FiPieChart },
    { name: 'Messages', href: '/dashboard/messages', icon: FiMessageSquare },
    { name: 'Calls', href: '/dashboard/calls', icon: FiPhoneCall },
    { name: 'Email', href: '/dashboard/email', icon: FiMail },
    { name: 'Analytics', href: '/dashboard/analytics', icon: FiBarChart2 },
    { name: 'Strategies', href: '/dashboard/strategies', icon: FiTarget },
    { name: 'Settings', href: '/dashboard/settings', icon: FiSettings },
  ]

  const handleSignOut = () => {
    signOut()
  }

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-primary-50 to-white">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="h-screen flex overflow-hidden bg-gray-50">
      {/* Mobile sidebar */}
      <div
        className={`fixed inset-0 flex z-40 md:hidden ${
          sidebarOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        } transition-opacity ease-linear duration-300`}
      >
        <div
          className={`fixed inset-0 bg-dark-700 bg-opacity-75 ${
            sidebarOpen ? 'opacity-100' : 'opacity-0'
          } transition-opacity ease-linear duration-300`}
          onClick={() => setSidebarOpen(false)}
        />

        <div
          className={`relative flex-1 flex flex-col max-w-xs w-full pt-5 pb-4 bg-white ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          } transition ease-in-out duration-300 transform shadow-lg`}
        >
          <div className="absolute top-0 right-0 -mr-12 pt-2">
            <button
              type="button"
              className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
              onClick={() => setSidebarOpen(false)}
            >
              <span className="sr-only">Close sidebar</span>
              <FiX className="h-6 w-6 text-white" />
            </button>
          </div>

          <div className="flex-shrink-0 flex items-center px-6">
            <h1 className="text-2xl font-bold text-primary-600 font-display">NextProp.ai</h1>
          </div>
          <div className="mt-8 flex-1 h-0 overflow-y-auto">
            <nav className="px-4 space-y-2">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`group flex items-center px-4 py-3 text-base font-medium rounded-xl transition-all duration-200 ${
                    pathname === item.href
                      ? 'bg-primary-50 text-primary-600 shadow-soft'
                      : 'text-dark-500 hover:bg-gray-50 hover:text-primary-600'
                  }`}
                >
                  <item.icon
                    className={`mr-4 h-5 w-5 ${
                      pathname === item.href
                        ? 'text-primary-600'
                        : 'text-dark-400 group-hover:text-primary-500'
                    }`}
                  />
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>
          <div className="flex-shrink-0 flex border-t border-gray-200 p-4 mx-4 mt-4">
            <button
              onClick={handleSignOut}
              className="flex-shrink-0 group block w-full flex items-center px-4 py-2 rounded-xl hover:bg-gray-50 transition-all duration-200"
            >
              <div className="flex items-center">
                <div>
                  <FiLogOut className="inline-block h-5 w-5 text-dark-400 group-hover:text-primary-500" />
                </div>
                <div className="ml-3">
                  <p className="text-base font-medium text-dark-500 group-hover:text-primary-600">
                    Sign Out
                  </p>
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden md:flex md:flex-shrink-0">
        <div className="flex flex-col w-72">
          <div className="flex flex-col h-0 flex-1">
            <div className="flex items-center h-20 flex-shrink-0 px-6 bg-white border-b border-gray-200">
              <h1 className="text-2xl font-bold text-primary-600 font-display">NextProp.ai</h1>
            </div>
            <div className="flex-1 flex flex-col overflow-y-auto bg-white shadow-soft">
              <nav className="flex-1 px-4 py-6 space-y-2">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`group flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${
                      pathname === item.href
                        ? 'bg-primary-50 text-primary-600 shadow-soft'
                        : 'text-dark-500 hover:bg-gray-50 hover:text-primary-600'
                    }`}
                  >
                    <item.icon
                      className={`mr-3 h-5 w-5 ${
                        pathname === item.href
                          ? 'text-primary-600'
                          : 'text-dark-400 group-hover:text-primary-500'
                      }`}
                    />
                    {item.name}
                  </Link>
                ))}
              </nav>
              <div className="flex-shrink-0 flex border-t border-gray-200 p-4 mx-4 mt-4">
                <button
                  onClick={handleSignOut}
                  className="flex-shrink-0 w-full group block px-4 py-2 rounded-xl hover:bg-gray-50 transition-all duration-200"
                >
                  <div className="flex items-center">
                    <div>
                      <FiLogOut className="inline-block h-5 w-5 text-dark-400 group-hover:text-primary-500" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-dark-500 group-hover:text-primary-600">
                        Sign Out
                      </p>
                    </div>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col w-0 flex-1 overflow-hidden">
        <div className="relative z-10 flex-shrink-0 flex h-16 bg-white shadow-soft md:hidden">
          <button
            type="button"
            className="px-4 border-r border-gray-200 text-dark-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500 md:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <span className="sr-only">Open sidebar</span>
            <FiMenu className="h-6 w-6" />
          </button>
          <div className="flex-1 px-4 flex justify-between">
            <div className="flex-1 flex items-center">
              <h1 className="text-xl font-bold text-primary-600 font-display md:hidden">NextProp.ai</h1>
            </div>
          </div>
        </div>

        <main className="flex-1 relative overflow-y-auto focus:outline-none bg-gray-50">
          <div className="py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
} 