/**
 * Get the base URL for the application based on the environment
 * This is useful for generating absolute URLs for API endpoints and redirects
 */
export function getBaseUrl() {
  if (typeof window !== 'undefined') {
    // In the browser, use the current window location
    return window.location.origin;
  }
  
  // In server-side rendering or during build time
  if (process.env.VERCEL_URL) {
    // Vercel automatically sets this environment variable
    return `https://${process.env.VERCEL_URL}`;
  }
  
  // Fallback to the NEXTAUTH_URL or localhost in development
  return process.env.NEXTAUTH_URL || 'http://localhost:3000';
}

/**
 * Get the absolute URL for a path
 * @param path - The path to append to the base URL
 */
export function getAbsoluteUrl(path: string) {
  const baseUrl = getBaseUrl();
  return `${baseUrl}${path.startsWith('/') ? path : `/${path}`}`;
} 