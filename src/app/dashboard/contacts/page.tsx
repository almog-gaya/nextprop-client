'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { GHLApi, Contact } from '@/lib/ghl-api'
import { FiPlus, FiFilter, FiSearch, FiMail, FiPhone } from 'react-icons/fi'

export default function ContactsPage() {
  const { data: session } = useSession()
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [contacts, setContacts] = useState<Contact[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [filteredContacts, setFilteredContacts] = useState<Contact[]>([])

  useEffect(() => {
    const fetchContacts = async () => {
      if (!session?.accessToken || !session?.user?.locationId) return

      setIsLoading(true)
      setError(null)

      try {
        const ghlApi = new GHLApi(session.accessToken)
        const locationId = session.user.locationId

        // Fetch contacts
        const fetchedContacts = await ghlApi.getContacts(locationId)
        setContacts(fetchedContacts)
        setFilteredContacts(fetchedContacts)

      } catch (err: any) {
        console.error('Error fetching contacts:', err)
        setError(err.message || 'An error occurred while fetching contacts')
      } finally {
        setIsLoading(false)
      }
    }

    fetchContacts()
  }, [session])

  useEffect(() => {
    // Filter contacts based on search term
    if (searchTerm.trim() === '') {
      setFilteredContacts(contacts)
    } else {
      const term = searchTerm.toLowerCase()
      const filtered = contacts.filter(
        contact =>
          contact.firstName.toLowerCase().includes(term) ||
          contact.lastName.toLowerCase().includes(term) ||
          contact.email.toLowerCase().includes(term) ||
          contact.phone.toLowerCase().includes(term)
      )
      setFilteredContacts(filtered)
    }
  }, [searchTerm, contacts])

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value)
  }

  if (isLoading && contacts.length === 0) {
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
      <div className="pb-5 border-b border-gray-200 sm:flex sm:items-center sm:justify-between">
        <h1 className="text-3xl font-bold leading-tight text-gray-900">Contacts</h1>
        <div className="mt-3 sm:mt-0 sm:ml-4">
          <button
            type="button"
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            <FiPlus className="-ml-1 mr-2 h-5 w-5" />
            New Contact
          </button>
        </div>
      </div>

      <div className="mt-6">
        {/* Search and filters */}
        <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
          <div className="w-full sm:w-auto relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiSearch className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              className="focus:ring-primary-500 focus:border-primary-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
              placeholder="Search contacts"
              value={searchTerm}
              onChange={handleSearch}
            />
          </div>
          <div className="flex items-center">
            <button
              type="button"
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              <FiFilter className="-ml-1 mr-2 h-5 w-5 text-gray-400" />
              Filter
            </button>
            <div className="ml-4 text-sm text-gray-500">
              {filteredContacts.length} contacts
            </div>
          </div>
        </div>

        {/* Contacts table */}
        <div className="flex flex-col">
          <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
            <div className="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
              <div className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Name
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Email
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Phone
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Tags
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Created
                      </th>
                      <th scope="col" className="relative px-6 py-3">
                        <span className="sr-only">Actions</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredContacts.length > 0 ? (
                      filteredContacts.map((contact) => (
                        <tr key={contact.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {contact.firstName} {contact.lastName}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-500">{contact.email}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-500">{contact.phone}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex flex-wrap gap-1">
                              {contact.tags && contact.tags.length > 0 ? (
                                contact.tags.slice(0, 3).map((tag, index) => (
                                  <span
                                    key={index}
                                    className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-primary-100 text-primary-800"
                                  >
                                    {tag}
                                  </span>
                                ))
                              ) : (
                                <span className="text-sm text-gray-500">No tags</span>
                              )}
                              {contact.tags && contact.tags.length > 3 && (
                                <span className="text-xs text-gray-500">+{contact.tags.length - 3} more</span>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(contact.createdAt).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex space-x-2 justify-end">
                              <button
                                type="button"
                                className="text-primary-600 hover:text-primary-900"
                                title="Send Email"
                              >
                                <FiMail className="h-5 w-5" />
                              </button>
                              <button
                                type="button"
                                className="text-primary-600 hover:text-primary-900"
                                title="Call"
                              >
                                <FiPhone className="h-5 w-5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={6} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                          No contacts found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 