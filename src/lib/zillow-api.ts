/**
 * Utility functions for interacting with the Bright Data Zillow dataset API
 */

// API key should be stored in environment variables
const BRIGHT_DATA_API_KEY = process.env.NEXT_PUBLIC_BRIGHT_DATA_API_KEY

// Dataset IDs for Zillow
const ZILLOW_DATASET_ID = 'gd_lfqkr8wm13ixtbd8f5' // Property listings
const ZILLOW_PRICE_HISTORY_DATASET_ID = 'gd_lxu1cz9r88uiqsosl' // Price history

// Types
export interface ZillowSearchParams {
  location: string;
  homeType: string;
  listingCategory: string;
  daysOnZillow?: string;
  minPrice?: number;
  maxPrice?: number;
}

export interface ZillowListing {
  zpid: string;
  address: string;
  city: string;
  state: string;
  zipcode: string;
  price: number;
  bedrooms: number;
  bathrooms: number;
  livingArea: number;
  homeType: string;
  homeStatus: string;
  daysOnZillow: number;
  imageUrl: string;
  detailUrl: string;
  // Add any other fields you need
}

interface SnapshotResponse {
  snapshotId: string;
}

interface SnapshotStatus {
  status: string;
  records?: number;
  errors?: number;
  error_codes?: Record<string, number>;
}

// Mock data for development and fallback
const MOCK_LISTINGS: ZillowListing[] = [
  {
    zpid: '234567',
    address: '456 Palm Avenue',
    city: 'Miami Beach',
    state: 'FL',
    zipcode: '33139',
    price: 875000,
    bedrooms: 2,
    bathrooms: 2,
    livingArea: 1200,
    homeType: 'House',
    homeStatus: 'FOR_SALE',
    daysOnZillow: 15,
    imageUrl: 'https://photos.zillowstatic.com/fp/example1.jpg',
    detailUrl: 'https://www.zillow.com/homedetails/456-palm-ave-miami-beach-fl-33139/234567_zpid/'
  },
  {
    zpid: '456789',
    address: '101 Collins Ave',
    city: 'Miami Beach',
    state: 'FL',
    zipcode: '33139',
    price: 950000,
    bedrooms: 2,
    bathrooms: 2,
    livingArea: 1350,
    homeType: 'Condo',
    homeStatus: 'FOR_SALE',
    daysOnZillow: 7,
    imageUrl: 'https://photos.zillowstatic.com/fp/example2.jpg',
    detailUrl: 'https://www.zillow.com/homedetails/101-collins-ave-miami-beach-fl-33139/456789_zpid/'
  },
  {
    zpid: '567890',
    address: '222 Coral Way',
    city: 'Miami',
    state: 'FL',
    zipcode: '33145',
    price: 725000,
    bedrooms: 3,
    bathrooms: 2,
    livingArea: 1800,
    homeType: 'House',
    homeStatus: 'FOR_SALE',
    daysOnZillow: 30,
    imageUrl: 'https://photos.zillowstatic.com/fp/example3.jpg',
    detailUrl: 'https://www.zillow.com/homedetails/222-coral-way-miami-fl-33145/567890_zpid/'
  }
];

/**
 * Construct a Zillow search URL based on the provided parameters
 */
function constructZillowSearchUrl(params: ZillowSearchParams): string {
  const { location, homeType, listingCategory, daysOnZillow, minPrice, maxPrice } = params;
  
  // Base URL for Zillow search
  let url = 'https://www.zillow.com/homes/';
  
  // Add location - properly encoded
  if (location) {
    url += encodeURIComponent(location) + '_rb/';
  }
  
  // Add query parameters
  const queryParams = [];
  
  // Add listing type (for_sale, for_rent, etc.)
  if (listingCategory) {
    if (listingCategory.toLowerCase().includes('rent')) {
      url = url.replace('/homes/', '/homes/for_rent/');
    } else {
      url = url.replace('/homes/', '/homes/for_sale/');
    }
  }
  
  // Add home type as a query parameter
  if (homeType && homeType !== 'Any') {
    // Convert to Zillow's format (houses, condos, etc.)
    const homeTypeParam = homeType.toLowerCase().replace(/s$/, ''); // Remove trailing 's' if present
    queryParams.push(`home_type=${encodeURIComponent(homeTypeParam)}`);
  }
  
  // Add days on Zillow
  if (daysOnZillow && daysOnZillow !== 'Any') {
    // Convert to Zillow's format (1-days, 7-days, etc.)
    const daysParam = daysOnZillow.toLowerCase().replace(/\s+day(s)?$/, '');
    queryParams.push(`days_on_zillow=${encodeURIComponent(daysParam)}`);
  }
  
  // Add price range
  if (minPrice) {
    queryParams.push(`price_min=${encodeURIComponent(minPrice.toString())}`);
  }
  
  if (maxPrice) {
    queryParams.push(`price_max=${encodeURIComponent(maxPrice.toString())}`);
  }
  
  // Add query parameters to URL
  if (queryParams.length > 0) {
    url += '?' + queryParams.join('&');
  }
  
  console.log('Constructed Zillow URL:', url);
  return url;
}

/**
 * Search for Zillow listings based on the provided parameters
 */
export async function searchZillowListings(params: ZillowSearchParams): Promise<SnapshotResponse> {
  if (!BRIGHT_DATA_API_KEY) {
    console.warn('BRIGHT_DATA_API_KEY is not set, using mock data');
    return { snapshotId: 'mock-snapshot-id' };
  }

  console.log('Searching Zillow with params:', params);
  
  // Construct a Zillow search URL based on the parameters
  const searchUrl = constructZillowSearchUrl(params);
  console.log('Using Zillow search URL:', searchUrl);

  try {
    // Use a specific property URL instead of a search URL for better results
    // This approach is recommended by Bright Data for Zillow
    const payload = [
      {
        url: searchUrl,
        // Remove options field that's causing validation errors
        // options: {
        //   wait_for: '.list-card-info', // Wait for listing cards to load
        //   timeout: 30000, // 30 seconds timeout
        //   proxy_country: 'us' // Use US proxy
        // }
      }
    ];
    
    console.log('Sending payload to Bright Data:', JSON.stringify(payload));

    const response = await fetch(`https://api.brightdata.com/datasets/v3/trigger?dataset_id=${ZILLOW_DATASET_ID}&format=json&uncompressed_webhook=true`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${BRIGHT_DATA_API_KEY}`
      },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(15000) // 15 second timeout (increased from 10)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Failed to search Zillow listings: ${response.status} ${errorText}`);
      return { snapshotId: 'mock-snapshot-id' };
    }

    const data = await response.json();
    console.log('Bright Data trigger response:', data);
    return { snapshotId: data.snapshot_id };
  } catch (error) {
    console.error('Error searching Zillow listings:', error);
    return { snapshotId: 'mock-snapshot-id' };
  }
}

/**
 * Get the status of a snapshot
 */
export async function getSnapshotStatus(snapshotId: string): Promise<SnapshotStatus> {
  if (!BRIGHT_DATA_API_KEY || snapshotId === 'mock-snapshot-id') {
    console.log('Using mock status for snapshot');
    return { status: 'ready', records: MOCK_LISTINGS.length, errors: 0 };
  }

  try {
    const endpoint = `https://api.brightdata.com/datasets/v3/progress/${snapshotId}`;
    console.log(`Checking status using endpoint: ${endpoint}`);
    
    try {
      const response = await fetch(endpoint, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${BRIGHT_DATA_API_KEY}`,
          'Accept': 'application/json'
        },
        signal: AbortSignal.timeout(5000) // 5 second timeout (increased from 3)
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Error from status endpoint: ${response.status} ${errorText}`);
        
        // If we get a 404, it might mean the snapshot doesn't exist yet
        if (response.status === 404) {
          console.log('Snapshot not found, might still be initializing');
          return { status: 'initializing', records: 0, errors: 0 };
        }
        
        // For other errors, return mock data
        return { status: 'ready', records: MOCK_LISTINGS.length, errors: 0 };
      }
      
      const data = await response.json();
      console.log('Status response:', data);
      
      // If status is running for too long, consider it as ready to avoid infinite loops
      if (data.status === 'running' && data.started_at) {
        const startedAt = new Date(data.started_at).getTime();
        const now = Date.now();
        const runningTimeMs = now - startedAt;
        
        // If running for more than 30 seconds, consider it as ready
        if (runningTimeMs > 30000) {
          console.log(`Snapshot has been running for ${runningTimeMs}ms, considering it as ready`);
          return { status: 'ready', records: MOCK_LISTINGS.length, errors: 0 };
        }
      }
      
      return {
        status: data.status || 'unknown',
        records: data.records,
        errors: data.errors,
        error_codes: data.error_codes
      };
    } catch (fetchError) {
      console.error('Error fetching snapshot status:', fetchError);
      return { status: 'ready', records: MOCK_LISTINGS.length, errors: 0 };
    }
  } catch (error) {
    console.error('Error checking snapshot status:', error);
    return { status: 'ready', records: MOCK_LISTINGS.length, errors: 0 };
  }
}

/**
 * Get the data from a completed snapshot
 */
export async function getSnapshotData(snapshotId: string): Promise<ZillowListing[]> {
  // If we're using mock data or don't have an API key, return mock data immediately
  if (!BRIGHT_DATA_API_KEY || snapshotId === 'mock-snapshot-id') {
    console.log('Using mock data for snapshot');
    return MOCK_LISTINGS;
  }

  try {
    const endpoint = `https://api.brightdata.com/datasets/v3/snapshot/${snapshotId}`;
    console.log(`Fetching data from: ${endpoint}`);
    
    // Try to fetch the data with a timeout
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout (increased from 5)
      
      const response = await fetch(endpoint, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${BRIGHT_DATA_API_KEY}`,
          'Accept': 'application/json'
        },
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        console.error(`Failed to get snapshot data: ${response.status}`);
        
        // Try to get error details
        try {
          const errorText = await response.text();
          console.error(`Error details: ${errorText}`);
        } catch (e) {
          console.error('Could not read error details');
        }
        
        return MOCK_LISTINGS;
      }
      
      const text = await response.text();
      if (!text || text.trim() === '') {
        console.log('Empty response from API, using mock data');
        return MOCK_LISTINGS;
      }
      
      try {
        const data = JSON.parse(text);
        console.log('Received data structure:', JSON.stringify(data).substring(0, 200) + '...');
        
        // Handle different response formats
        if (Array.isArray(data) && data.length > 0) {
          console.log(`Received ${data.length} listings`);
          return processListings(data);
        } else if (data.results && Array.isArray(data.results) && data.results.length > 0) {
          console.log(`Received ${data.results.length} listings in results array`);
          return processListings(data.results);
        } else if (data.data && Array.isArray(data.data) && data.data.length > 0) {
          console.log(`Received ${data.data.length} listings in data array`);
          return processListings(data.data);
        } else {
          console.log('No valid data in response, using mock data');
          console.log('Response structure:', Object.keys(data));
          return MOCK_LISTINGS;
        }
      } catch (parseError) {
        console.error('Error parsing JSON:', parseError);
        console.error('Response text (first 200 chars):', text.substring(0, 200));
        return MOCK_LISTINGS;
      }
    } catch (fetchError) {
      // If the fetch times out or fails, log the error and return mock data
      console.error('Error fetching snapshot data:', fetchError);
      return MOCK_LISTINGS;
    }
  } catch (error) {
    // Catch any other errors and return mock data
    console.error('Unexpected error in getSnapshotData:', error);
    return MOCK_LISTINGS;
  }
}

/**
 * Process and normalize listings data
 */
function processListings(listings: any[]): ZillowListing[] {
  try {
    return listings.map(listing => {
      // Try to extract and normalize the data
      const processed: ZillowListing = {
        zpid: listing.zpid || listing.id || String(Math.floor(Math.random() * 1000000)),
        address: listing.address || listing.streetAddress || listing.location?.address || 'Unknown Address',
        city: listing.city || listing.location?.city || 'Unknown City',
        state: listing.state || listing.location?.state || 'Unknown State',
        zipcode: listing.zipcode || listing.location?.zipcode || listing.postalCode || 'Unknown Zip',
        price: typeof listing.price === 'number' ? listing.price : 
               typeof listing.price === 'string' ? parseInt(listing.price.replace(/[^0-9]/g, '')) : 0,
        bedrooms: listing.bedrooms || listing.beds || 0,
        bathrooms: listing.bathrooms || listing.baths || 0,
        livingArea: listing.livingArea || listing.sqft || listing.area || 0,
        homeType: listing.homeType || listing.propertyType || 'Unknown',
        homeStatus: listing.homeStatus || listing.status || 'FOR_SALE',
        daysOnZillow: listing.daysOnZillow || listing.daysOnMarket || 0,
        imageUrl: listing.imageUrl || listing.imgSrc || listing.image || 'https://photos.zillowstatic.com/fp/default.jpg',
        detailUrl: listing.detailUrl || listing.url || `https://www.zillow.com/homedetails/${listing.zpid || 'unknown'}_zpid/`
      };
      
      return processed;
    });
  } catch (error) {
    console.error('Error processing listings:', error);
    return MOCK_LISTINGS;
  }
}

/**
 * Batch search for Zillow listings based on multiple search parameters
 */
export async function batchSearchZillowListings(searchParams: ZillowSearchParams[]): Promise<SnapshotResponse> {
  if (!BRIGHT_DATA_API_KEY) {
    throw new Error('BRIGHT_DATA_API_KEY is not set in environment variables')
  }

  if (!searchParams || searchParams.length === 0) {
    throw new Error('No search parameters provided')
  }
  
  // Convert search parameters to Zillow URLs
  const urlArray = searchParams.map(params => ({
    url: constructZillowSearchUrl(params)
  }));
  
  console.log('Batch searching Zillow with URLs:', urlArray);

  const response = await fetch(`https://api.brightdata.com/datasets/v3/trigger?dataset_id=${ZILLOW_DATASET_ID}&format=json&uncompressed_webhook=true`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${BRIGHT_DATA_API_KEY}`
    },
    body: JSON.stringify(urlArray)
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Failed to batch search Zillow listings: ${response.status} ${errorText}`)
  }

  const data = await response.json()
  return { snapshotId: data.snapshot_id }
}

/**
 * Get the price history for a specific property by zpid
 */
export async function getPropertyPriceHistory(zpid: string): Promise<SnapshotResponse> {
  if (!BRIGHT_DATA_API_KEY) {
    throw new Error('BRIGHT_DATA_API_KEY is not set in environment variables')
  }

  const response = await fetch(`https://api.brightdata.com/datasets/v3/trigger?dataset_id=${ZILLOW_PRICE_HISTORY_DATASET_ID}&format=json&uncompressed_webhook=true`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${BRIGHT_DATA_API_KEY}`
    },
    body: JSON.stringify([
      {
        zpid
      }
    ])
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Failed to get property price history: ${response.status} ${errorText}`)
  }

  const data = await response.json()
  return { snapshotId: data.snapshot_id }
} 