/**
 * Utility functions for making authenticated API calls
 */

/**
 * Make an authenticated API call with automatic token refreshing
 * @param url The URL to fetch
 * @param options Fetch options
 * @returns The fetch response
 */
export async function fetchWithAuth(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  // First attempt with current token
  const response = await fetch(url, options);
  
  // If unauthorized, try to refresh the token and retry
  if (response.status === 401) {
    console.log('Unauthorized response, attempting to refresh token');
    
    // Try to refresh the token
    const refreshResponse = await fetch('/api/auth/refresh', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    // If token refresh was successful, retry the original request
    if (refreshResponse.ok) {
      console.log('Token refreshed successfully, retrying original request');
      return fetch(url, options);
    } else {
      console.error('Token refresh failed');
      // If refresh failed, throw an error or return the original 401 response
      throw new Error('Authentication failed');
    }
  }
  
  return response;
}

/**
 * Make a GET request with authentication
 * @param url The URL to fetch
 * @param options Additional fetch options
 * @returns The fetch response
 */
export async function getWithAuth<T>(
  url: string,
  options: RequestInit = {}
): Promise<T> {
  const response = await fetchWithAuth(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });
  
  if (!response.ok) {
    throw new Error(`API error: ${response.status} ${response.statusText}`);
  }
  
  return response.json();
}

/**
 * Make a POST request with authentication
 * @param url The URL to fetch
 * @param data The data to send
 * @param options Additional fetch options
 * @returns The fetch response
 */
export async function postWithAuth<T>(
  url: string,
  data: any,
  options: RequestInit = {}
): Promise<T> {
  const response = await fetchWithAuth(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    body: JSON.stringify(data),
    ...options,
  });
  
  if (!response.ok) {
    throw new Error(`API error: ${response.status} ${response.statusText}`);
  }
  
  return response.json();
}

/**
 * Make a PUT request with authentication
 * @param url The URL to fetch
 * @param data The data to send
 * @param options Additional fetch options
 * @returns The fetch response
 */
export async function putWithAuth<T>(
  url: string,
  data: any,
  options: RequestInit = {}
): Promise<T> {
  const response = await fetchWithAuth(url, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    body: JSON.stringify(data),
    ...options,
  });
  
  if (!response.ok) {
    throw new Error(`API error: ${response.status} ${response.statusText}`);
  }
  
  return response.json();
}

/**
 * Make a DELETE request with authentication
 * @param url The URL to fetch
 * @param options Additional fetch options
 * @returns The fetch response
 */
export async function deleteWithAuth<T>(
  url: string,
  options: RequestInit = {}
): Promise<T> {
  const response = await fetchWithAuth(url, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });
  
  if (!response.ok) {
    throw new Error(`API error: ${response.status} ${response.statusText}`);
  }
  
  return response.json();
} 