import { useAuth } from './useAuth'
import { GHLApi } from '../ghl-api'
import { useEffect, useState } from 'react'

/**
 * Custom hook to use the Go High Level API in components
 * This hook automatically uses the access token from our authentication system
 */
export function useGHLApi() {
  const { accessToken, isAuthenticated, isLoading } = useAuth()
  const [api, setApi] = useState<GHLApi | null>(null)

  useEffect(() => {
    if (isAuthenticated && accessToken) {
      setApi(new GHLApi(accessToken))
    } else {
      setApi(null)
    }
  }, [accessToken, isAuthenticated])

  return {
    api,
    isLoading,
    isAuthenticated,
  }
}

/**
 * Custom hook to get locations from the Go High Level API
 */
export function useLocations() {
  const { api, isLoading, isAuthenticated } = useGHLApi()
  const [locations, setLocations] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    async function fetchLocations() {
      if (!api) return

      setLoading(true)
      setError(null)

      try {
        const data = await api.getLocations()
        setLocations(data)
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch locations'))
      } finally {
        setLoading(false)
      }
    }

    if (api) {
      fetchLocations()
    }
  }, [api])

  return {
    locations,
    loading: isLoading || loading,
    error,
    isAuthenticated,
  }
}

/**
 * Custom hook to get contacts for a location from the Go High Level API
 */
export function useContacts(locationId: string | null) {
  const { api, isLoading, isAuthenticated } = useGHLApi()
  const [contacts, setContacts] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    async function fetchContacts() {
      if (!api || !locationId) return

      setLoading(true)
      setError(null)

      try {
        const data = await api.getContacts(locationId)
        setContacts(data)
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch contacts'))
      } finally {
        setLoading(false)
      }
    }

    if (api && locationId) {
      fetchContacts()
    }
  }, [api, locationId])

  return {
    contacts,
    loading: isLoading || loading,
    error,
    isAuthenticated,
  }
}

/**
 * Custom hook to get pipelines for a location from the Go High Level API
 */
export function usePipelines(locationId: string | null) {
  const { api, isLoading, isAuthenticated } = useGHLApi()
  const [pipelines, setPipelines] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    async function fetchPipelines() {
      if (!api || !locationId) return

      setLoading(true)
      setError(null)

      try {
        const data = await api.getPipelines(locationId)
        setPipelines(data)
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch pipelines'))
      } finally {
        setLoading(false)
      }
    }

    if (api && locationId) {
      fetchPipelines()
    }
  }, [api, locationId])

  return {
    pipelines,
    loading: isLoading || loading,
    error,
    isAuthenticated,
  }
}

/**
 * Custom hook to get opportunities for a pipeline from the Go High Level API
 */
export function useOpportunities(pipelineId: string | null) {
  const { api, isLoading, isAuthenticated } = useGHLApi()
  const [opportunities, setOpportunities] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    async function fetchOpportunities() {
      if (!api || !pipelineId) return

      setLoading(true)
      setError(null)

      try {
        const data = await api.getOpportunities(pipelineId)
        setOpportunities(data)
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch opportunities'))
      } finally {
        setLoading(false)
      }
    }

    if (api && pipelineId) {
      fetchOpportunities()
    }
  }, [api, pipelineId])

  return {
    opportunities,
    loading: isLoading || loading,
    error,
    isAuthenticated,
  }
} 