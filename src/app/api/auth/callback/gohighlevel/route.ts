import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { getAbsoluteUrl } from '@/lib/utils'

// Go High Level OAuth credentials
const CLIENT_ID = process.env.GHL_CLIENT_ID
const CLIENT_SECRET = process.env.GHL_CLIENT_SECRET
// Use dynamic redirect URI based on environment
const REDIRECT_URI = process.env.GHL_REDIRECT_URI || getAbsoluteUrl('/api/auth/callback/gohighlevel')

// OAuth endpoints
const TOKEN_URL = 'https://services.leadconnectorhq.com/oauth/token'
const USERINFO_URL = 'https://services.leadconnectorhq.com/oauth/userinfo'

/**
 * GET handler for the OAuth callback
 */
export async function GET(request: NextRequest) {
  console.log('OAuth callback received at expected path')
  
  // Get the authorization code from the URL
  const searchParams = request.nextUrl.searchParams
  const code = searchParams.get('code')
  const error = searchParams.get('error')
  const errorDescription = searchParams.get('error_description')
  const locationId = searchParams.get('locationId') // Get locationId if provided by chooselocation endpoint
  
  console.log('Authorization code:', code ? 'Received' : 'Missing')
  console.log('Location ID from params:', locationId || 'Not provided')
  
  if (error) {
    console.error('OAuth error:', error, errorDescription)
    return NextResponse.redirect(new URL('/?error=' + encodeURIComponent(errorDescription || error), request.url))
  }
  
  if (!code) {
    return NextResponse.json({ error: 'No authorization code provided' }, { status: 400 })
  }
  
  try {
    console.log('Exchanging authorization code for token...')
    console.log('Client ID:', CLIENT_ID)
    console.log('Redirect URI:', REDIRECT_URI)
    console.log('Full URL params:', Object.fromEntries(searchParams.entries()))
    
    // Ensure CLIENT_ID and CLIENT_SECRET are treated as strings
    if (!CLIENT_ID || typeof CLIENT_ID !== 'string') {
      throw new Error('Invalid CLIENT_ID: Must be a string')
    }
    
    if (!CLIENT_SECRET || typeof CLIENT_SECRET !== 'string') {
      throw new Error('Invalid CLIENT_SECRET: Must be a string')
    }
    
    // Exchange the authorization code for an access token
    console.log('Making token request to:', TOKEN_URL)
    const tokenResponse = await fetch(TOKEN_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        grant_type: 'authorization_code',
        code,
        redirect_uri: REDIRECT_URI,
      }),
    })
    
    console.log('Token response status:', tokenResponse.status, tokenResponse.statusText)
    
    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text()
      console.error('Token exchange error:', errorText)
      try {
        const errorData = JSON.parse(errorText)
        console.error('Parsed error data:', errorData)
      } catch (e) {
        // Ignore parsing error
        console.error('Could not parse error response as JSON')
      }
      return NextResponse.json({ error: 'Failed to exchange authorization code for token' }, { status: 500 })
    }
    
    const tokenData = await tokenResponse.json()
    console.log('Token received successfully')
    
    // Get user information
    console.log('Fetching user information...')
    const userResponse = await fetch(USERINFO_URL, {
      headers: {
        'Authorization': `Bearer ${tokenData.access_token}`,
      },
    })
    
    if (!userResponse.ok) {
      const errorText = await userResponse.text()
      console.error('User info error:', errorText)
      try {
        const errorData = JSON.parse(errorText)
        console.error('Parsed error data:', errorData)
      } catch (e) {
        // Ignore parsing error
      }
      return NextResponse.json({ error: 'Failed to get user information' }, { status: 500 })
    }
    
    const userData = await userResponse.json()
    console.log('User data received:', JSON.stringify({
      id: userData.id || userData.sub,
      name: userData.name,
      email: userData.email,
      locationId: userData.locationId || locationId,
    }))
    
    // Store the tokens and user data in cookies
    console.log('Setting cookies...')
    const cookieStore = cookies()
    
    // Set secure cookies with the tokens and user data
    cookieStore.set('ghl_access_token', tokenData.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: tokenData.expires_in,
      path: '/',
    })
    
    cookieStore.set('ghl_refresh_token', tokenData.refresh_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 30 * 24 * 60 * 60, // 30 days
      path: '/',
    })
    
    // Use locationId from URL params if not in user data
    const userLocationId = userData.locationId || locationId;
    
    // Ensure the ID is stored as a string to avoid ObjectId casting issues
    cookieStore.set('ghl_user', JSON.stringify({
      id: String(userData.id || userData.sub),
      name: userData.name,
      email: userData.email,
      locationId: userLocationId ? String(userLocationId) : null,
    }), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 30 * 24 * 60 * 60, // 30 days
      path: '/',
    })
    
    // Redirect to the dashboard or onboarding page
    console.log('Authentication successful, redirecting...')
    if (userLocationId) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    } else {
      return NextResponse.redirect(new URL('/onboarding', request.url))
    }
  } catch (error) {
    console.error('OAuth callback error:', error)
    return NextResponse.json({ error: 'An error occurred during authentication' }, { status: 500 })
  }
} 