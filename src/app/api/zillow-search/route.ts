import { NextResponse } from 'next/server'
import { searchZillowListings, getSnapshotStatus, getSnapshotData } from '@/lib/zillow-api'

// Maximum time to wait for a snapshot to complete (in milliseconds)
const MAX_WAIT_TIME = 15000 // 15 seconds - increased from 5 seconds
const POLL_INTERVAL = 1000 // 1 second - adjusted from 0.5 seconds
const MAX_POLL_ATTEMPTS = 10 // Maximum number of polling attempts - increased from 5

// Helper function to clean error messages
function cleanErrorMessage(error: any): string {
  const message = error instanceof Error ? error.message : String(error)
  
  // Remove HTML content
  if (message.includes('<!DOCTYPE html>') || message.includes('<html')) {
    // Extract just the status code and endpoint if possible
    const statusMatch = message.match(/(\d{3})/)
    const endpointMatch = message.match(/Cannot (GET|POST|PUT|DELETE) ([^\s<]+)/)
    
    if (statusMatch && endpointMatch) {
      return `API Error ${statusMatch[1]}: ${endpointMatch[0]}`
    }
    
    if (statusMatch) {
      return `API Error ${statusMatch[1]}`
    }
    
    if (endpointMatch) {
      return `API Error: ${endpointMatch[0]}`
    }
    
    return 'API Error: The server returned an HTML response instead of JSON'
  }
  
  return message
}

export async function POST(request: Request) {
  const startTime = Date.now();
  try {
    const body = await request.json()
    
    // Check if API key is available
    const apiKey = process.env.NEXT_PUBLIC_BRIGHT_DATA_API_KEY
    if (!apiKey) {
      console.warn('API key not configured, using mock data')
    }
    
    // Extract all parameters with proper defaults
    const { 
      location = 'Miami, FL', 
      homeType = 'Houses', 
      listingCategory = 'House for sale', 
      daysOnZillow = '', 
      minPrice = 1, 
      maxPrice = 10000000,
      // New parameter for direct property URL approach
      propertyUrl
    } = body
    
    // Ensure daysOnZillow is never undefined in logs
    const formattedDaysOnZillow = daysOnZillow || 'Any'
    
    console.log('Starting search with params:', { 
      location, 
      homeType, 
      listingCategory, 
      daysOnZillow: formattedDaysOnZillow,
      minPrice,
      maxPrice,
      propertyUrl: propertyUrl ? 'Provided' : 'Not provided'
    });
    
    // Add price parameters to the log
    console.log(`Price range: $${minPrice} - $${maxPrice}`);
    
    // Start the search
    let snapshotId;
    try {
      // If a specific property URL is provided, use it directly
      // This is more reliable than search URLs
      if (propertyUrl && propertyUrl.includes('zillow.com')) {
        console.log(`Using direct property URL: ${propertyUrl}`);
        
        // Create a custom search params object with the property URL
        const result = await searchZillowListings({
          location: propertyUrl, // Use the URL as the location
          homeType: 'Any',
          listingCategory: 'Any'
        });
        
        snapshotId = result.snapshotId;
      } else {
        // Use the regular search approach
        const result = await searchZillowListings({
          location,
          homeType,
          listingCategory,
          daysOnZillow: formattedDaysOnZillow,
          minPrice,
          maxPrice
        });
        
        snapshotId = result.snapshotId;
      }
      
      console.log(`Search initiated with snapshot ID: ${snapshotId}`);
    } catch (error) {
      console.error('Error initiating search:', error);
      return NextResponse.json(
        { 
          success: false, 
          error: `Error initiating search: ${cleanErrorMessage(error)}`,
          isMockData: true,
          responseTime: Date.now() - startTime
        },
        { status: 500 }
      );
    }
    
    // If we're using mock data, return it immediately
    if (snapshotId === 'mock-snapshot-id') {
      console.log('Using mock data (API key not set or error occurred)');
      const mockData = await getSnapshotData(snapshotId);
      
      // Apply price filtering
      const filteredListings = mockData.filter(listing => {
        const price = listing.price || 0;
        return price >= minPrice && price <= maxPrice;
      });
      
      console.log(`Returning ${filteredListings.length} mock listings`);
      
      return NextResponse.json({ 
        success: true, 
        listings: filteredListings.slice(0, 3),
        total: filteredListings.length,
        isMockData: true,
        responseTime: Date.now() - startTime
      });
    }
    
    // Poll for snapshot completion, but with a limited number of attempts
    let isComplete = false;
    let status: any = { status: 'pending' };
    let pollAttempts = 0;
    
    while (!isComplete && Date.now() - startTime < MAX_WAIT_TIME && pollAttempts < MAX_POLL_ATTEMPTS) {
      pollAttempts++;
      try {
        console.log(`Checking status for snapshot ID: ${snapshotId} (attempt ${pollAttempts}/${MAX_POLL_ATTEMPTS})`);
        status = await getSnapshotStatus(snapshotId);
        console.log(`Snapshot ${snapshotId} status: ${status.status}`);
        
        if (status.status === 'completed' || status.status === 'done' || status.status === 'ready') {
          isComplete = true;
          break;
        } else if (status.status === 'failed' || status.status === 'error') {
          console.log(`Snapshot failed with status: ${status.status}`);
          if (status.error_codes) {
            console.log('Error codes:', status.error_codes);
          }
          console.log('Using mock data instead');
          // Continue with mock data
          isComplete = true;
          break;
        }
        
        // Wait before polling again
        await new Promise(resolve => setTimeout(resolve, POLL_INTERVAL));
      } catch (error) {
        console.error('Error polling snapshot status:', error);
        // Continue with mock data
        isComplete = true;
        break;
      }
    }
    
    // If we timed out waiting for the snapshot or reached max poll attempts
    if (!isComplete) {
      console.log(`Snapshot ${snapshotId} did not complete within time limit or max poll attempts reached`);
      console.log('Using mock data instead');
    }
    
    // Get the data (real or mock)
    try {
      console.log(`Fetching data for snapshot: ${snapshotId}`);
      
      const data = await getSnapshotData(snapshotId);
      
      // Log the structure of the data to help with debugging
      console.log('Data received:', typeof data, Array.isArray(data) ? `Array[${data.length}]` : typeof data === 'object' ? 'Object' : typeof data);
      
      if (!data || (Array.isArray(data) && data.length === 0)) {
        console.log('No data returned from snapshot');
        return NextResponse.json(
          { 
            success: false, 
            error: 'No properties found. Please try again with different search parameters.',
            isMockData: true,
            responseTime: Date.now() - startTime
          },
          { status: 404 }
        );
      }
      
      // Apply price filtering
      const filteredListings = data.filter(listing => {
        const price = listing.price || 0;
        return price >= minPrice && price <= maxPrice;
      });
      
      console.log(`Filtered ${data.length} listings to ${filteredListings.length} based on price range $${minPrice} - $${maxPrice}`);
      
      if (filteredListings.length === 0) {
        return NextResponse.json(
          { 
            success: false, 
            error: 'No properties found in the specified price range.',
            isMockData: true,
            responseTime: Date.now() - startTime
          },
          { status: 404 }
        );
      }
      
      // Limit to 3 results
      const limitedListings = filteredListings.slice(0, 3);
      
      // Determine if we're using mock data
      const isMockData = snapshotId === 'mock-snapshot-id' || 
                         (status.errors !== undefined && status.errors > 0) || 
                         !isComplete;
      
      return NextResponse.json({ 
        success: true, 
        listings: limitedListings,
        total: filteredListings.length,
        isMockData,
        responseTime: Date.now() - startTime
      });
    } catch (error) {
      console.error('Error fetching snapshot data:', error);
      return NextResponse.json(
        { 
          success: false, 
          error: `Error fetching property data: ${cleanErrorMessage(error)}`,
          isMockData: true,
          responseTime: Date.now() - startTime
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Unexpected error in API route:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: `Unexpected error: ${cleanErrorMessage(error)}`,
        isMockData: true,
        responseTime: Date.now() - startTime
      },
      { status: 500 }
    );
  }
} 