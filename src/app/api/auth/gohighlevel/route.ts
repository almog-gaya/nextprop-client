import { NextRequest, NextResponse } from 'next/server'
import { getAbsoluteUrl } from '@/lib/utils'

// Go High Level OAuth credentials
const CLIENT_ID = process.env.GHL_CLIENT_ID
const CLIENT_SECRET = process.env.GHL_CLIENT_SECRET
// Use dynamic redirect URI based on environment
const REDIRECT_URI = process.env.GHL_REDIRECT_URI || getAbsoluteUrl('/api/auth/callback/gohighlevel')

// OAuth endpoints
// Using the chooselocation endpoint as shown in the test scripts
const AUTHORIZATION_URL = 'https://marketplace.gohighlevel.com/oauth/chooselocation'
const TOKEN_URL = 'https://services.leadconnectorhq.com/oauth/token'
const USERINFO_URL = 'https://services.leadconnectorhq.com/oauth/userinfo'

// Scopes for the OAuth request
const SCOPES = 'businesses.readonly contacts.readonly opportunities.readonly opportunities.write'

/**
 * GET handler for initiating the OAuth flow
 */
export async function GET(request: NextRequest) {
  try {
    console.log('Starting Go High Level OAuth flow...')
    console.log('Client ID:', CLIENT_ID)
    console.log('Redirect URI:', REDIRECT_URI)
    
    // Ensure CLIENT_ID is treated as a string
    if (!CLIENT_ID || typeof CLIENT_ID !== 'string') {
      throw new Error('Invalid CLIENT_ID: Must be a string')
    }
    
    // Generate the authorization URL
    // Using the chooselocation endpoint which is the correct one according to the test scripts
    const authUrl = `${AUTHORIZATION_URL}?response_type=code&client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&scope=${SCOPES}`
    
    console.log('Authorization URL:', authUrl)
    
    // Redirect the user to the authorization URL
    return NextResponse.redirect(authUrl)
  } catch (error) {
    console.error('Error in Go High Level OAuth route:', error)
    return NextResponse.json({ error: 'Failed to initiate OAuth flow' }, { status: 500 })
  }
} 