import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

// Go High Level OAuth credentials
const CLIENT_ID = process.env.GHL_CLIENT_ID
const CLIENT_SECRET = process.env.GHL_CLIENT_SECRET
const REDIRECT_URI = process.env.GHL_REDIRECT_URI || 'http://localhost:3000/api/auth/gohighlevel/callback'

// OAuth endpoints
const TOKEN_URL = 'https://services.leadconnectorhq.com/oauth/token'
const USERINFO_URL = 'https://services.leadconnectorhq.com/oauth/userinfo'

/**
 * GET handler for the OAuth callback
 */
export async function GET(request: NextRequest) {
  console.log('OAuth callback received')
  
  // Get the authorization code from the URL
  const searchParams = request.nextUrl.searchParams
  const code = searchParams.get('code')
  
  console.log('Authorization code:', code ? 'Received' : 'Missing')
  
  if (!code) {
    return NextResponse.json({ error: 'No authorization code provided' }, { status: 400 })
  }
  
  try {
    console.log('Exchanging authorization code for token...')
    console.log('Client ID:', CLIENT_ID)
    console.log('Redirect URI:', REDIRECT_URI)
    
    // Exchange the authorization code for an access token
    const tokenResponse = await fetch(TOKEN_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: CLIENT_ID as string,
        client_secret: CLIENT_SECRET as string,
        grant_type: 'authorization_code',
        code,
        redirect_uri: REDIRECT_URI,
      }),
    })
    
    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.json()
      console.error('Token exchange error:', errorData)
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
      const errorData = await userResponse.json()
      console.error('User info error:', errorData)
      return NextResponse.json({ error: 'Failed to get user information' }, { status: 500 })
    }
    
    const userData = await userResponse.json()
    console.log('User data received:', JSON.stringify({
      id: userData.id || userData.sub,
      name: userData.name,
      email: userData.email,
      locationId: userData.locationId,
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
    
    // Ensure the ID is stored as a string to avoid ObjectId casting issues
    cookieStore.set('ghl_user', JSON.stringify({
      id: String(userData.id || userData.sub),
      name: userData.name,
      email: userData.email,
      locationId: userData.locationId ? String(userData.locationId) : null,
    }), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 30 * 24 * 60 * 60, // 30 days
      path: '/',
    })
    
    // Redirect to the dashboard or onboarding page
    console.log('Authentication successful, redirecting...')
    if (userData.locationId) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    } else {
      return NextResponse.redirect(new URL('/onboarding', request.url))
    }
  } catch (error) {
    console.error('OAuth callback error:', error)
    return NextResponse.json({ error: 'An error occurred during authentication' }, { status: 500 })
  }
} 