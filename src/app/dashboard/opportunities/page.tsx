'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { GHLApi, Pipeline, Opportunity, PipelineStage } from '@/lib/ghl-api'
import { FiPlus, FiFilter, FiChevronDown } from 'react-icons/fi'

export default function OpportunitiesPage() {
  const { data: session } = useSession()
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [pipelines, setPipelines] = useState<Pipeline[]>([])
  const [opportunities, setOpportunities] = useState<Opportunity[]>([])
  const [selectedPipeline, setSelectedPipeline] = useState<string | null>(null)
  const [pipelineStages, setPipelineStages] = useState<Record<string, PipelineStage[]>>({})

  useEffect(() => {
    const fetchPipelines = async () => {
      if (!session?.accessToken || !session?.user?.locationId) return

      setIsLoading(true)
      setError(null)

      try {
        const ghlApi = new GHLApi(session.accessToken)
        const locationId = session.user.locationId

        // Fetch pipelines
        const fetchedPipelines = await ghlApi.getPipelines(locationId)
        setPipelines(fetchedPipelines)

        // Set the first pipeline as selected by default
        if (fetchedPipelines.length > 0 && !selectedPipeline) {
          setSelectedPipeline(fetchedPipelines[0].id)
        }

        // Create a map of pipeline stages
        const stagesMap: Record<string, PipelineStage[]> = {}
        fetchedPipelines.forEach(pipeline => {
          stagesMap[pipeline.id] = pipeline.stages || []
        })
        setPipelineStages(stagesMap)

      } catch (err: any) {
        console.error('Error fetching pipelines:', err)
        setError(err.message || 'An error occurred while fetching pipelines')
      } finally {
        setIsLoading(false)
      }
    }

    fetchPipelines()
  }, [session, selectedPipeline])

  useEffect(() => {
    const fetchOpportunities = async () => {
      if (!session?.accessToken || !selectedPipeline) return

      setIsLoading(true)
      setError(null)

      try {
        const ghlApi = new GHLApi(session.accessToken)
        
        // Fetch opportunities for the selected pipeline
        const fetchedOpportunities = await ghlApi.getOpportunities(selectedPipeline)
        setOpportunities(fetchedOpportunities)

      } catch (err: any) {
        console.error('Error fetching opportunities:', err)
        setError(err.message || 'An error occurred while fetching opportunities')
      } finally {
        setIsLoading(false)
      }
    }

    if (selectedPipeline) {
      fetchOpportunities()
    }
  }, [session, selectedPipeline])

  const handlePipelineChange = (pipelineId: string) => {
    setSelectedPipeline(pipelineId)
  }

  const getStageName = (stageId: string): string => {
    if (!selectedPipeline || !pipelineStages[selectedPipeline]) return 'Unknown Stage'
    
    const stage = pipelineStages[selectedPipeline].find(s => s.id === stageId)
    return stage ? stage.name : 'Unknown Stage'
  }

  if (isLoading && pipelines.length === 0) {
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
        <h1 className="text-3xl font-bold leading-tight text-gray-900">Opportunities</h1>
        <div className="mt-3 sm:mt-0 sm:ml-4">
          <button
            type="button"
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            <FiPlus className="-ml-1 mr-2 h-5 w-5" />
            New Opportunity
          </button>
        </div>
      </div>

      <div className="mt-6">
        {/* Pipeline selector */}
        <div className="mb-6">
          <label htmlFor="pipeline" className="block text-sm font-medium text-gray-700">
            Pipeline
          </label>
          <select
            id="pipeline"
            name="pipeline"
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
            value={selectedPipeline || ''}
            onChange={(e) => handlePipelineChange(e.target.value)}
          >
            {pipelines.map((pipeline) => (
              <option key={pipeline.id} value={pipeline.id}>
                {pipeline.name}
              </option>
            ))}
          </select>
        </div>

        {/* Filters */}
        <div className="mb-6 flex justify-between items-center">
          <div className="flex items-center">
            <button
              type="button"
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              <FiFilter className="-ml-1 mr-2 h-5 w-5 text-gray-400" />
              Filter
            </button>
          </div>
          <div className="text-sm text-gray-500">
            {opportunities.length} opportunities
          </div>
        </div>

        {/* Opportunities table */}
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
                        Stage
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Value
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Status
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Created
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {opportunities.length > 0 ? (
                      opportunities.map((opportunity) => (
                        <tr key={opportunity.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{opportunity.name}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-500">{getStageName(opportunity.pipelineStageId)}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">${opportunity.monetaryValue?.toLocaleString() || '0'}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                              {opportunity.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(opportunity.createdAt).toLocaleDateString()}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                          No opportunities found in this pipeline.
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