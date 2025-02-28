import { NextRequest, NextResponse } from 'next/server'

// Go High Level OAuth credentials
const CLIENT_ID = process.env.GHL_CLIENT_ID || ''
const CLIENT_SECRET = process.env.GHL_CLIENT_SECRET || ''
const REDIRECT_URI = process.env.GHL_REDIRECT_URI || 'http://localhost:3000/api/auth/callback/gohighlevel'

// OAuth endpoints
const AUTHORIZE_ENDPOINT = 'https://marketplace.gohighlevel.com/oauth/chooselocation'

// OAuth scope - ensure no extra spaces and proper formatting
const SCOPE = 'contacts/readonly contacts/write locations/readonly opportunities/readonly opportunities/write pipelines/readonly'

/**
 * GET handler to initiate the OAuth flow
 */
export async function GET(request: NextRequest) {
  try {
    console.log('Initiating GoHighLevel OAuth flow')
    console.log('Using redirect URI:', REDIRECT_URI)
    console.log('Using client ID:', CLIENT_ID)
    
    if (!CLIENT_ID) {
      console.error('Missing GHL_CLIENT_ID environment variable')
      return NextResponse.redirect(new URL('/?error=Missing+GoHighLevel+client+ID', request.url))
    }
    
    // Generate the authorization URL exactly as in the documentation
    const authUrl = new URL(AUTHORIZE_ENDPOINT)
    authUrl.searchParams.append('response_type', 'code')
    authUrl.searchParams.append('client_id', CLIENT_ID)
    authUrl.searchParams.append('redirect_uri', REDIRECT_URI)
    authUrl.searchParams.append('scope', SCOPE)
    
    // Add state parameter for security
    const state = Math.random().toString(36).substring(2, 15)
    authUrl.searchParams.append('state', state)
    
    console.log('Redirecting to GoHighLevel authorization URL:', authUrl.toString())
    
    // Redirect the user to the authorization URL
    return NextResponse.redirect(authUrl.toString())
  } catch (error) {
    console.error('Error initiating GoHighLevel OAuth flow:', error)
    return NextResponse.redirect(new URL('/?error=Failed+to+initiate+authentication', request.url))
  }
} 