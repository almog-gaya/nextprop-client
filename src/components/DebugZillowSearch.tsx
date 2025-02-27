'use client'

import { useState } from 'react'
import { FiSearch, FiX, FiLoader, FiPlus, FiTrash2, FiRefreshCw, FiAlertTriangle } from 'react-icons/fi'
import { ZillowListing, ZillowSearchParams } from '@/lib/zillow-api'

export default function DebugZillowSearch() {
  const [isOpen, setIsOpen] = useState(false)
  const [isBatchMode, setIsBatchMode] = useState(false)
  const [location, setLocation] = useState('Miami')
  const [homeType, setHomeType] = useState('Houses')
  const [listingCategory, setListingCategory] = useState('House for sale')
  const [daysOnZillow, setDaysOnZillow] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [listings, setListings] = useState<ZillowListing[]>([])
  
  // Batch search state
  const [batchSearches, setBatchSearches] = useState<ZillowSearchParams[]>([
    { location: 'Miami', homeType: 'Houses', listingCategory: 'House for sale', daysOnZillow: '' },
    { location: 'New York', homeType: 'Condos', listingCategory: 'House for rent', daysOnZillow: '7 days' },
  ])

  const handleSearch = async () => {
    setIsLoading(true)
    setError(null)
    setListings([])
    
    try {
      // Call our API endpoint which handles the Bright Data API interaction
      const response = await fetch('/api/zillow-search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(
          isBatchMode 
            ? { batchMode: true, searches: batchSearches }
            : {
                location,
                homeType,
                listingCategory,
                daysOnZillow
              }
        ),
      })
      
      const data = await response.json()
      
      if (!response.ok || !data.success) {
        throw new Error(data.error || `Request failed with status ${response.status}`)
      }
      
      setListings(data.listings || [])
    } catch (err) {
      console.error('Error fetching listings:', err)
      setError(err instanceof Error ? err.message : 'An unknown error occurred')
    } finally {
      setIsLoading(false)
    }
  }
  
  const clearResults = () => {
    setListings([])
    setError(null)
  }
  
  const addBatchSearch = () => {
    setBatchSearches([
      ...batchSearches,
      { location: '', homeType: 'Houses', listingCategory: 'House for sale', daysOnZillow: '' }
    ])
  }
  
  const removeBatchSearch = (index: number) => {
    setBatchSearches(batchSearches.filter((_, i) => i !== index))
  }
  
  const updateBatchSearch = (index: number, field: keyof ZillowSearchParams, value: string) => {
    const updatedSearches = [...batchSearches]
    updatedSearches[index] = { ...updatedSearches[index], [field]: value }
    setBatchSearches(updatedSearches)
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-4 right-4 z-50 bg-accent-500 hover:bg-accent-600 text-white p-3 rounded-full shadow-button transition-all duration-200"
        title="Debug Zillow Search"
      >
        {isOpen ? <FiX className="h-5 w-5" /> : <FiSearch className="h-5 w-5" />}
      </button>

      {isOpen && (
        <div className="fixed bottom-16 right-4 z-50 bg-white rounded-xl shadow-card p-4 w-full max-w-md">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-dark-700">Debug Zillow Search</h3>
            <button 
              onClick={() => setIsOpen(false)}
              className="text-dark-400 hover:text-dark-600"
            >
              <FiX className="h-5 w-5" />
            </button>
          </div>
          
          <div className="mb-4">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setIsBatchMode(false)}
                className={`px-3 py-2 rounded-lg text-sm font-medium ${
                  !isBatchMode 
                    ? 'bg-primary-100 text-primary-700' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Single Search
              </button>
              <button
                onClick={() => setIsBatchMode(true)}
                className={`px-3 py-2 rounded-lg text-sm font-medium ${
                  isBatchMode 
                    ? 'bg-primary-100 text-primary-700' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Batch Search
              </button>
            </div>
          </div>

          {!isBatchMode ? (
            <div className="space-y-4">
              <div>
                <label htmlFor="location" className="block text-sm font-medium text-dark-500 mb-1">
                  Location
                </label>
                <input
                  type="text"
                  id="location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="City, State, or ZIP"
                />
              </div>

              <div>
                <label htmlFor="homeType" className="block text-sm font-medium text-dark-500 mb-1">
                  Home Type
                </label>
                <select
                  id="homeType"
                  value={homeType}
                  onChange={(e) => setHomeType(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="Houses">Houses</option>
                  <option value="Condos">Condos</option>
                  <option value="Apartments">Apartments</option>
                  <option value="Townhomes">Townhomes</option>
                </select>
              </div>

              <div>
                <label htmlFor="listingCategory" className="block text-sm font-medium text-dark-500 mb-1">
                  Listing Category
                </label>
                <select
                  id="listingCategory"
                  value={listingCategory}
                  onChange={(e) => setListingCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="House for sale">For Sale</option>
                  <option value="House for rent">For Rent</option>
                  <option value="Sold">Sold</option>
                </select>
              </div>

              <div>
                <label htmlFor="daysOnZillow" className="block text-sm font-medium text-dark-500 mb-1">
                  Days on Zillow
                </label>
                <select
                  id="daysOnZillow"
                  value={daysOnZillow}
                  onChange={(e) => setDaysOnZillow(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">Any</option>
                  <option value="1 day">1 day</option>
                  <option value="7 days">7 days</option>
                  <option value="14 days">14 days</option>
                  <option value="30 days">30 days</option>
                </select>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="max-h-64 overflow-y-auto pr-2">
                {batchSearches.map((search, index) => (
                  <div key={index} className="mb-4 p-3 border border-gray-200 rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="text-sm font-medium text-dark-600">Search #{index + 1}</h4>
                      <button 
                        onClick={() => removeBatchSearch(index)}
                        className="text-red-500 hover:text-red-700"
                        disabled={batchSearches.length <= 1}
                      >
                        <FiTrash2 className="h-4 w-4" />
                      </button>
                    </div>
                    
                    <div className="space-y-2">
                      <div>
                        <label className="block text-xs font-medium text-dark-500 mb-1">
                          Location
                        </label>
                        <input
                          type="text"
                          value={search.location}
                          onChange={(e) => updateBatchSearch(index, 'location', e.target.value)}
                          className="w-full px-2 py-1 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary-500"
                          placeholder="City, State, or ZIP"
                        />
                      </div>
                      
                      <div className="grid grid-cols-3 gap-2">
                        <div>
                          <label className="block text-xs font-medium text-dark-500 mb-1">
                            Home Type
                          </label>
                          <select
                            value={search.homeType}
                            onChange={(e) => updateBatchSearch(index, 'homeType', e.target.value)}
                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary-500"
                          >
                            <option value="Houses">Houses</option>
                            <option value="Condos">Condos</option>
                            <option value="Apartments">Apartments</option>
                            <option value="Townhomes">Townhomes</option>
                          </select>
                        </div>
                        
                        <div>
                          <label className="block text-xs font-medium text-dark-500 mb-1">
                            Category
                          </label>
                          <select
                            value={search.listingCategory}
                            onChange={(e) => updateBatchSearch(index, 'listingCategory', e.target.value)}
                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary-500"
                          >
                            <option value="House for sale">For Sale</option>
                            <option value="House for rent">For Rent</option>
                            <option value="Sold">Sold</option>
                          </select>
                        </div>
                        
                        <div>
                          <label className="block text-xs font-medium text-dark-500 mb-1">
                            Days on Zillow
                          </label>
                          <select
                            value={search.daysOnZillow}
                            onChange={(e) => updateBatchSearch(index, 'daysOnZillow', e.target.value)}
                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary-500"
                          >
                            <option value="">Any</option>
                            <option value="1 day">1 day</option>
                            <option value="7 days">7 days</option>
                            <option value="14 days">14 days</option>
                            <option value="30 days">30 days</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              <button
                onClick={addBatchSearch}
                className="w-full flex items-center justify-center px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-dark-500 hover:bg-gray-50"
              >
                <FiPlus className="h-4 w-4 mr-2" />
                Add Search
              </button>
            </div>
          )}

          <div className="flex space-x-2 mt-4">
            <button
              onClick={handleSearch}
              disabled={isLoading}
              className="flex-1 btn-primary flex justify-center items-center"
            >
              {isLoading ? (
                <>
                  <FiLoader className="animate-spin h-5 w-5 mr-2" />
                  Searching...
                </>
              ) : (
                'Search'
              )}
            </button>
            
            {listings.length > 0 && (
              <button
                onClick={clearResults}
                className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-dark-500 rounded-lg transition-colors duration-200"
                title="Clear Results"
              >
                <FiRefreshCw className="h-5 w-5" />
              </button>
            )}
          </div>

          {/* Results Panel */}
          <div className="mt-4">
            {/* Error Message */}
            {error && (
              <div className="p-3 bg-red-50 text-red-700 rounded-lg flex items-start">
                <FiAlertTriangle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Listings Results */}
            {listings.length > 0 && (
              <div className="mt-4">
                <h4 className="text-md font-semibold text-dark-700 mb-3">Results ({listings.length})</h4>
                <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                  {listings.map((listing, index) => (
                    <div key={listing.zpid || `listing-${index}`} className="border border-gray-200 rounded-lg p-3 hover:shadow-soft transition-all duration-200">
                      <div className="flex justify-between">
                        <div>
                          <p className="font-medium text-dark-700">{listing.address?.streetAddress || 'Address not available'}</p>
                          <p className="text-sm text-dark-500">
                            {listing.address ? `${listing.address.city}, ${listing.address.state} ${listing.address.zipcode}` : 'Location not available'}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-primary-600">{listing.price ? `$${listing.price.toLocaleString()}` : 'Price not available'}</p>
                          <p className="text-xs text-dark-400">{listing.daysOnZillow ? `${listing.daysOnZillow} days on Zillow` : ''}</p>
                        </div>
                      </div>
                      <div className="mt-2 flex text-sm text-dark-500">
                        {listing.bedrooms && <p className="mr-3">{listing.bedrooms} beds</p>}
                        {listing.bathrooms && <p className="mr-3">{listing.bathrooms} baths</p>}
                        {listing.livingArea && <p>{listing.livingArea.toLocaleString()} sqft</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
} 