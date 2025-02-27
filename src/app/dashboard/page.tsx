'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { 
  FiUsers, 
  FiPieChart, 
  FiDollarSign, 
  FiCalendar, 
  FiMessageSquare, 
  FiPhoneCall,
  FiTrendingUp,
  FiTarget,
  FiBarChart2,
  FiArrowUpRight,
  FiTrendingDown
} from 'react-icons/fi'
import { useLocations, useContacts, usePipelines, useOpportunities } from '@/lib/hooks/useGHLApi'
import { Opportunity, Contact } from '@/lib/ghl-api'

export default function DashboardPage() {
  const { data: session } = useSession()
  const locationId = session?.user?.locationId as string
  
  // Use our custom hooks to fetch data
  const { locations, loading: locationsLoading, error: locationsError } = useLocations()
  const { contacts, loading: contactsLoading, error: contactsError } = useContacts(locationId)
  const { pipelines, loading: pipelinesLoading, error: pipelinesError } = usePipelines(locationId)
  
  const [allOpportunities, setAllOpportunities] = useState<Opportunity[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [stats, setStats] = useState({
    contacts: 0,
    opportunities: 0,
    pipelines: 0,
    revenue: 0,
    aiEngagements: 0,
    conversations: 0,
    calls: 0,
    conversionRate: 0
  })
  const [recentOpportunities, setRecentOpportunities] = useState<Opportunity[]>([])
  const [recentContacts, setRecentContacts] = useState<Contact[]>([])

  // Fetch opportunities for each pipeline
  useEffect(() => {
    const fetchAllOpportunities = async () => {
      if (!pipelines || pipelines.length === 0) return
      
      let opportunities: Opportunity[] = []
      let totalRevenue = 0
      
      // For simplicity, we'll just use the first pipeline
      // In a real app, you might want to fetch opportunities for all pipelines
      if (pipelines.length > 0) {
        const firstPipeline = pipelines[0]
        const { opportunities: pipelineOpportunities } = useOpportunities(firstPipeline.id)
        
        if (pipelineOpportunities) {
          opportunities = [...opportunities, ...pipelineOpportunities]
          
          // Calculate total revenue
          pipelineOpportunities.forEach(opp => {
            totalRevenue += opp.monetaryValue || 0
          })
        }
      }
      
      setAllOpportunities(opportunities)
      
      // Update stats with mock data for new metrics
      setStats({
        contacts: contacts?.length || 0,
        opportunities: opportunities.length,
        pipelines: pipelines.length,
        revenue: totalRevenue,
        aiEngagements: 156,
        conversations: 42,
        calls: 18,
        conversionRate: 24
      })
      
      // Sort opportunities by date (newest first)
      const sortedOpportunities = opportunities.sort((a, b) => 
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      )
      
      // Sort contacts by date (newest first)
      const sortedContacts = contacts ? contacts.sort((a, b) => 
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      ) : []
      
      // Set recent items
      setRecentOpportunities(sortedOpportunities.slice(0, 5))
      setRecentContacts(sortedContacts.slice(0, 5))
    }
    
    fetchAllOpportunities()
  }, [pipelines, contacts])

  // Update loading and error states
  useEffect(() => {
    setIsLoading(locationsLoading || contactsLoading || pipelinesLoading)
    
    if (locationsError) {
      setError(locationsError.message)
    } else if (contactsError) {
      setError(contactsError.message)
    } else if (pipelinesError) {
      setError(pipelinesError.message)
    } else {
      setError(null)
    }
  }, [locationsLoading, contactsLoading, pipelinesLoading, locationsError, contactsError, pipelinesError])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl">
        {error}
      </div>
    )
  }

  return (
    <div className="animate-fade-in">
      <div className="pb-6 border-b border-gray-200 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold leading-tight text-dark-700 font-display">Dashboard</h1>
          <p className="mt-1 text-sm text-dark-400">Welcome back! Here's an overview of your real estate business.</p>
        </div>
        <div>
          <button className="btn-primary">
            New Campaign
          </button>
        </div>
      </div>

      {/* Main Stats */}
      <div className="mt-8 animate-slide-up">
        <h2 className="text-xl font-semibold text-dark-700 mb-4 font-display">Key Metrics</h2>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {/* Contacts stat */}
          <div className="stat-card">
            <div className="flex items-center">
              <div className="stat-icon bg-primary-100">
                <FiUsers className="h-6 w-6 text-primary-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="stat-label">Total Contacts</dt>
                  <dd>
                    <div className="stat-value">{stats.contacts}</div>
                  </dd>
                </dl>
              </div>
            </div>
            <div className="mt-4 trend-indicator">
              <span className="trend-positive flex items-center">
                <FiTrendingUp className="h-4 w-4 mr-1" />
                12%
              </span>
              <span className="text-dark-400 ml-2">vs last month</span>
            </div>
          </div>

          {/* Opportunities stat */}
          <div className="stat-card">
            <div className="flex items-center">
              <div className="stat-icon bg-primary-100">
                <FiPieChart className="h-6 w-6 text-primary-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="stat-label">Opportunities</dt>
                  <dd>
                    <div className="stat-value">{stats.opportunities}</div>
                  </dd>
                </dl>
              </div>
            </div>
            <div className="mt-4 trend-indicator">
              <span className="trend-positive flex items-center">
                <FiTrendingUp className="h-4 w-4 mr-1" />
                8%
              </span>
              <span className="text-dark-400 ml-2">vs last month</span>
            </div>
          </div>

          {/* AI Engagements stat */}
          <div className="stat-card">
            <div className="flex items-center">
              <div className="stat-icon bg-primary-100">
                <FiBarChart2 className="h-6 w-6 text-primary-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="stat-label">AI Engagements</dt>
                  <dd>
                    <div className="stat-value">{stats.aiEngagements}</div>
                  </dd>
                </dl>
              </div>
            </div>
            <div className="mt-4 trend-indicator">
              <span className="trend-positive flex items-center">
                <FiTrendingUp className="h-4 w-4 mr-1" />
                24%
              </span>
              <span className="text-dark-400 ml-2">vs last month</span>
            </div>
          </div>

          {/* Revenue stat */}
          <div className="stat-card">
            <div className="flex items-center">
              <div className="stat-icon bg-primary-100">
                <FiDollarSign className="h-6 w-6 text-primary-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="stat-label">Total Revenue</dt>
                  <dd>
                    <div className="stat-value">
                      ${stats.revenue.toLocaleString()}
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
            <div className="mt-4 trend-indicator">
              <span className="trend-positive flex items-center">
                <FiTrendingUp className="h-4 w-4 mr-1" />
                18%
              </span>
              <span className="text-dark-400 ml-2">vs last month</span>
            </div>
          </div>
        </div>
      </div>

      {/* Communication Stats */}
      <div className="mt-10 animate-slide-up" style={{ animationDelay: '0.1s' }}>
        <h2 className="text-xl font-semibold text-dark-700 mb-4 font-display">Communication</h2>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {/* Conversations stat */}
          <div className="stat-card">
            <div className="flex items-center">
              <div className="stat-icon bg-secondary-100">
                <FiMessageSquare className="h-6 w-6 text-secondary-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="stat-label">Conversations</dt>
                  <dd>
                    <div className="stat-value">{stats.conversations}</div>
                  </dd>
                </dl>
              </div>
            </div>
            <div className="mt-4 trend-indicator">
              <span className="trend-positive flex items-center">
                <FiTrendingUp className="h-4 w-4 mr-1" />
                15%
              </span>
              <span className="text-dark-400 ml-2">vs last month</span>
            </div>
          </div>

          {/* Calls stat */}
          <div className="stat-card">
            <div className="flex items-center">
              <div className="stat-icon bg-secondary-100">
                <FiPhoneCall className="h-6 w-6 text-secondary-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="stat-label">Calls</dt>
                  <dd>
                    <div className="stat-value">{stats.calls}</div>
                  </dd>
                </dl>
              </div>
            </div>
            <div className="mt-4 trend-indicator">
              <span className="trend-negative flex items-center">
                <FiTrendingDown className="h-4 w-4 mr-1" />
                3%
              </span>
              <span className="text-dark-400 ml-2">vs last month</span>
            </div>
          </div>

          {/* Conversion Rate stat */}
          <div className="stat-card">
            <div className="flex items-center">
              <div className="stat-icon bg-secondary-100">
                <FiTarget className="h-6 w-6 text-secondary-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="stat-label">Conversion Rate</dt>
                  <dd>
                    <div className="stat-value">{stats.conversionRate}%</div>
                  </dd>
                </dl>
              </div>
            </div>
            <div className="mt-4 trend-indicator">
              <span className="trend-positive flex items-center">
                <FiTrendingUp className="h-4 w-4 mr-1" />
                5%
              </span>
              <span className="text-dark-400 ml-2">vs last month</span>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-10 grid grid-cols-1 gap-8 lg:grid-cols-2 animate-slide-up" style={{ animationDelay: '0.2s' }}>
        {/* Recent Opportunities */}
        <div className="bg-white shadow-card rounded-xl transition-all duration-200 hover:shadow-lg">
          <div className="px-6 py-5 border-b border-gray-200">
            <h3 className="text-lg leading-6 font-semibold text-dark-700 font-display">Recent Opportunities</h3>
          </div>
          <div className="px-6 py-5">
            {recentOpportunities.length > 0 ? (
              <ul className="divide-y divide-gray-200">
                {recentOpportunities.map((opportunity) => (
                  <li key={opportunity.id} className="py-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-dark-700">{opportunity.name}</p>
                        <p className="text-xs text-dark-400 mt-1">
                          {new Date(opportunity.updatedAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-sm font-medium text-primary-600">
                        ${opportunity.monetaryValue?.toLocaleString() || '0'}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="py-6 text-center">
                <p className="text-sm text-dark-400">No opportunities found.</p>
                <button className="mt-3 text-sm text-primary-600 font-medium hover:text-primary-700">
                  Create your first opportunity
                </button>
              </div>
            )}
          </div>
          <div className="px-6 py-3 bg-gray-50 border-t border-gray-200 rounded-b-xl">
            <a href="/dashboard/opportunities" className="text-sm font-medium text-primary-600 hover:text-primary-700 flex items-center">
              View all opportunities
              <FiArrowUpRight className="ml-1 h-4 w-4" />
            </a>
          </div>
        </div>

        {/* Recent Contacts */}
        <div className="bg-white shadow-card rounded-xl transition-all duration-200 hover:shadow-lg">
          <div className="px-6 py-5 border-b border-gray-200">
            <h3 className="text-lg leading-6 font-semibold text-dark-700 font-display">Recent Contacts</h3>
          </div>
          <div className="px-6 py-5">
            {recentContacts.length > 0 ? (
              <ul className="divide-y divide-gray-200">
                {recentContacts.map((contact) => (
                  <li key={contact.id} className="py-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-dark-700">
                          {contact.firstName} {contact.lastName}
                        </p>
                        <p className="text-xs text-dark-400 mt-1">{contact.email || 'No email'}</p>
                      </div>
                      <div className="text-xs text-dark-400">
                        {new Date(contact.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="py-6 text-center">
                <p className="text-sm text-dark-400">No contacts found.</p>
                <button className="mt-3 text-sm text-primary-600 font-medium hover:text-primary-700">
                  Add your first contact
                </button>
              </div>
            )}
          </div>
          <div className="px-6 py-3 bg-gray-50 border-t border-gray-200 rounded-b-xl">
            <a href="/dashboard/contacts" className="text-sm font-medium text-primary-600 hover:text-primary-700 flex items-center">
              View all contacts
              <FiArrowUpRight className="ml-1 h-4 w-4" />
            </a>
          </div>
        </div>
      </div>
    </div>
  )
} 