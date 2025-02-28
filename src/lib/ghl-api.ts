/**
 * Go High Level API Utility Functions
 * 
 * This file contains utility functions for interacting with the Go High Level API.
 * It leverages the access token obtained through our authentication system.
 */
import { getWithAuth, postWithAuth, putWithAuth, deleteWithAuth } from './api';

// API Base URLs
const API_1_0_BASE_URL = "https://rest.gohighlevel.com/v1";
const API_2_0_BASE_URL = "https://services.leadconnectorhq.com";

// Default API headers
const DEFAULT_HEADERS = {
  'Version': '2023-07-01',
  'Content-Type': 'application/json'
};

// Type definitions for API responses
export interface LocationsResponse {
  locations: Location[];
}

export interface PipelinesResponse {
  pipelines: Pipeline[];
}

export interface OpportunitiesResponse {
  opportunities: Opportunity[];
}

export interface ContactsResponse {
  contacts: Contact[];
}

/**
 * Get all locations for the authenticated user
 */
export async function getLocations(accessToken: string): Promise<LocationsResponse> {
  return getWithAuth<LocationsResponse>(`${API_2_0_BASE_URL}/locations/v1`, {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      ...DEFAULT_HEADERS
    }
  });
}

/**
 * Get details for a specific location
 */
export async function getLocationDetails(accessToken: string, locationId: string): Promise<Location> {
  return getWithAuth<Location>(`${API_2_0_BASE_URL}/locations/v1/${locationId}`, {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      ...DEFAULT_HEADERS
    }
  });
}

/**
 * Create a new location (subaccount)
 */
export async function createLocation(accessToken: string, locationData: Partial<Location>): Promise<Location> {
  return postWithAuth<Location>(`${API_2_0_BASE_URL}/locations/v1`, locationData, {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      ...DEFAULT_HEADERS
    }
  });
}

/**
 * Get all contacts for a location
 */
export async function getContacts(accessToken: string, locationId: string): Promise<ContactsResponse> {
  return getWithAuth<ContactsResponse>(`${API_2_0_BASE_URL}/contacts/v1?locationId=${locationId}`, {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      ...DEFAULT_HEADERS
    }
  });
}

/**
 * Get all pipelines for a location
 */
export async function getPipelines(accessToken: string, locationId: string): Promise<PipelinesResponse> {
  return getWithAuth<PipelinesResponse>(`${API_2_0_BASE_URL}/pipelines/v1?locationId=${locationId}`, {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      ...DEFAULT_HEADERS
    }
  });
}

/**
 * Get all opportunities for a pipeline
 */
export async function getOpportunities(accessToken: string, pipelineId: string): Promise<OpportunitiesResponse> {
  return getWithAuth<OpportunitiesResponse>(`${API_2_0_BASE_URL}/opportunities/v1?pipelineId=${pipelineId}`, {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      ...DEFAULT_HEADERS
    }
  });
}

/**
 * Create a new opportunity in a pipeline
 */
export async function createOpportunity(accessToken: string, opportunityData: Partial<Opportunity>): Promise<Opportunity> {
  return postWithAuth<Opportunity>(`${API_2_0_BASE_URL}/opportunities/v1`, opportunityData, {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      ...DEFAULT_HEADERS
    }
  });
}

/**
 * Get user information
 */
export async function getUserInfo(accessToken: string): Promise<any> {
  return getWithAuth<any>(`${API_2_0_BASE_URL}/oauth/user`, {
    headers: {
      'Authorization': `Bearer ${accessToken}`
    }
  });
}

export interface Location {
  id: string
  name: string
  address?: string
  city?: string
  state?: string
  country?: string
  postalCode?: string
  website?: string
  timezone?: string
  phone?: string
  email?: string
  business?: {
    name: string
    email: string
    address?: string
    city?: string
    state?: string
    country?: string
    postalCode?: string
    website?: string
    timezone?: string
  }
}

export interface Pipeline {
  id: string
  name: string
  locationId: string
  stages: PipelineStage[]
}

export interface PipelineStage {
  id: string
  name: string
  order: number
}

export interface Opportunity {
  id: string
  name: string
  pipelineId: string
  pipelineStageId: string
  status: string
  monetaryValue: number
  assignedTo: string
  contactId: string
  locationId: string
  createdAt: string
  updatedAt: string
}

export interface Contact {
  id: string
  locationId: string
  firstName: string
  lastName: string
  email: string
  phone: string
  tags: string[]
  customFields: Record<string, any>
  createdAt: string
  updatedAt: string
}

export class GHLApi {
  private accessToken: string

  constructor(accessToken: string) {
    this.accessToken = accessToken
  }

  // Location methods
  async getLocations(): Promise<Location[]> {
    const data = await getLocations(this.accessToken)
    return data.locations
  }

  async getLocation(locationId: string): Promise<Location> {
    return getLocationDetails(this.accessToken, locationId)
  }

  async createLocation(locationData: Partial<Location>): Promise<Location> {
    return createLocation(this.accessToken, locationData)
  }

  // Pipeline methods
  async getPipelines(locationId: string): Promise<Pipeline[]> {
    const data = await getPipelines(this.accessToken, locationId)
    return data.pipelines
  }

  // Opportunity methods
  async getOpportunities(pipelineId: string): Promise<Opportunity[]> {
    const data = await getOpportunities(this.accessToken, pipelineId)
    return data.opportunities
  }

  async createOpportunity(opportunityData: Partial<Opportunity>): Promise<Opportunity> {
    return createOpportunity(this.accessToken, opportunityData)
  }

  // Contact methods
  async getContacts(locationId: string): Promise<Contact[]> {
    const data = await getContacts(this.accessToken, locationId)
    return data.contacts
  }

  // User methods
  async getUserInfo() {
    return getUserInfo(this.accessToken)
  }
} 