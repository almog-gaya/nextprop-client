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
  FiMail
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
    { name: 'Settings', href: '/dashboard/settings', icon: FiSettings },
  ]

  const handleSignOut = () => {
    signOut()
  }

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="h-screen flex overflow-hidden bg-gray-100">
      {/* Mobile sidebar */}
      <div
        className={`fixed inset-0 flex z-40 md:hidden ${
          sidebarOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        } transition-opacity ease-linear duration-300`}
      >
        <div
          className={`fixed inset-0 bg-gray-600 bg-opacity-75 ${
            sidebarOpen ? 'opacity-100' : 'opacity-0'
          } transition-opacity ease-linear duration-300`}
          onClick={() => setSidebarOpen(false)}
        />

        <div
          className={`relative flex-1 flex flex-col max-w-xs w-full pt-5 pb-4 bg-white ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          } transition ease-in-out duration-300 transform`}
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

          <div className="flex-shrink-0 flex items-center px-4">
            <h1 className="text-xl font-bold text-primary-600">NextProp.ai</h1>
          </div>
          <div className="mt-5 flex-1 h-0 overflow-y-auto">
            <nav className="px-2 space-y-1">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`group flex items-center px-2 py-2 text-base font-medium rounded-md ${
                    pathname === item.href
                      ? 'bg-primary-50 text-primary-600'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <item.icon
                    className={`mr-4 h-6 w-6 ${
                      pathname === item.href
                        ? 'text-primary-600'
                        : 'text-gray-400 group-hover:text-gray-500'
                    }`}
                  />
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>
          <div className="flex-shrink-0 flex border-t border-gray-200 p-4">
            <button
              onClick={handleSignOut}
              className="flex-shrink-0 group block w-full flex items-center"
            >
              <div className="flex items-center">
                <div>
                  <FiLogOut className="inline-block h-5 w-5 text-gray-400 group-hover:text-gray-500" />
                </div>
                <div className="ml-3">
                  <p className="text-base font-medium text-gray-700 group-hover:text-gray-900">
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
        <div className="flex flex-col w-64">
          <div className="flex flex-col h-0 flex-1">
            <div className="flex items-center h-16 flex-shrink-0 px-4 bg-white border-b border-gray-200">
              <h1 className="text-xl font-bold text-primary-600">NextProp.ai</h1>
            </div>
            <div className="flex-1 flex flex-col overflow-y-auto bg-white">
              <nav className="flex-1 px-2 py-4 space-y-1">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                      pathname === item.href
                        ? 'bg-primary-50 text-primary-600'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <item.icon
                      className={`mr-3 h-5 w-5 ${
                        pathname === item.href
                          ? 'text-primary-600'
                          : 'text-gray-400 group-hover:text-gray-500'
                      }`}
                    />
                    {item.name}
                  </Link>
                ))}
              </nav>
              <div className="flex-shrink-0 flex border-t border-gray-200 p-4">
                <button
                  onClick={handleSignOut}
                  className="flex-shrink-0 w-full group block"
                >
                  <div className="flex items-center">
                    <div>
                      <FiLogOut className="inline-block h-5 w-5 text-gray-400 group-hover:text-gray-500" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-700 group-hover:text-gray-900">
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
        <div className="relative z-10 flex-shrink-0 flex h-16 bg-white shadow md:hidden">
          <button
            type="button"
            className="px-4 border-r border-gray-200 text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500 md:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <span className="sr-only">Open sidebar</span>
            <FiMenu className="h-6 w-6" />
          </button>
          <div className="flex-1 px-4 flex justify-between">
            <div className="flex-1 flex items-center">
              <h1 className="text-xl font-bold text-primary-600 md:hidden">NextProp.ai</h1>
            </div>
          </div>
        </div>

        <main className="flex-1 relative overflow-y-auto focus:outline-none">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
} 