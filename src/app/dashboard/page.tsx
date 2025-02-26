'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { FiUsers, FiPieChart, FiDollarSign, FiCalendar } from 'react-icons/fi'
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
      
      // Update stats
      setStats({
        contacts: contacts?.length || 0,
        opportunities: opportunities.length,
        pipelines: pipelines.length,
        revenue: totalRevenue,
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
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
        {error}
      </div>
    )
  }

  return (
    <div>
      <div className="pb-5 border-b border-gray-200">
        <h1 className="text-3xl font-bold leading-tight text-gray-900">Dashboard</h1>
      </div>

      <div className="mt-6">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {/* Contacts stat */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-primary-100 rounded-md p-3">
                  <FiUsers className="h-6 w-6 text-primary-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Total Contacts</dt>
                    <dd>
                      <div className="text-lg font-medium text-gray-900">{stats.contacts}</div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          {/* Opportunities stat */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-primary-100 rounded-md p-3">
                  <FiPieChart className="h-6 w-6 text-primary-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Opportunities</dt>
                    <dd>
                      <div className="text-lg font-medium text-gray-900">{stats.opportunities}</div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          {/* Pipelines stat */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-primary-100 rounded-md p-3">
                  <FiCalendar className="h-6 w-6 text-primary-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Pipelines</dt>
                    <dd>
                      <div className="text-lg font-medium text-gray-900">{stats.pipelines}</div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          {/* Revenue stat */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-primary-100 rounded-md p-3">
                  <FiDollarSign className="h-6 w-6 text-primary-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Total Revenue</dt>
                    <dd>
                      <div className="text-lg font-medium text-gray-900">
                        ${stats.revenue.toLocaleString()}
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Recent Opportunities */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 border-b border-gray-200 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Recent Opportunities</h3>
          </div>
          <div className="px-4 py-3 sm:px-6">
            {recentOpportunities.length > 0 ? (
              <ul className="divide-y divide-gray-200">
                {recentOpportunities.map((opportunity) => (
                  <li key={opportunity.id} className="py-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{opportunity.name}</p>
                        <p className="text-sm text-gray-500">
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
              <p className="text-sm text-gray-500 py-4">No opportunities found.</p>
            )}
          </div>
        </div>

        {/* Recent Contacts */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 border-b border-gray-200 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Recent Contacts</h3>
          </div>
          <div className="px-4 py-3 sm:px-6">
            {recentContacts.length > 0 ? (
              <ul className="divide-y divide-gray-200">
                {recentContacts.map((contact) => (
                  <li key={contact.id} className="py-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {contact.firstName} {contact.lastName}
                        </p>
                        <p className="text-sm text-gray-500">{contact.email}</p>
                      </div>
                      <div className="text-sm text-gray-500">
                        {new Date(contact.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-500 py-4">No contacts found.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
} 