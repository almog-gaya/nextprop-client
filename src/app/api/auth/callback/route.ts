import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

// Go High Level OAuth credentials
const CLIENT_ID = process.env.GHL_CLIENT_ID || ''
const CLIENT_SECRET = process.env.GHL_CLIENT_SECRET || ''
const REDIRECT_URI = process.env.GHL_REDIRECT_URI || 'http://localhost:3000/api/auth/callback'

// OAuth endpoints
const TOKEN_ENDPOINT = 'https://services.leadconnectorhq.com/oauth/token'
const USER_ENDPOINT = 'https://services.leadconnectorhq.com/oauth/userinfo'

/**
 * GET handler for the OAuth callback
 */
export async function GET(request: NextRequest) {
  try {
    console.log('OAuth callback received')
    
    // Get the authorization code from the URL
    const { searchParams } = new URL(request.url)
    const code = searchParams.get('code')
    
    console.log('Authorization code received:', code ? 'present' : 'missing')
    
    if (!code) {
      console.error('No authorization code provided')
      return NextResponse.redirect(new URL('/?error=No+authorization+code+provided', request.url))
    }
    
    // Exchange the authorization code for an access token
    console.log('Exchanging code for token...')
    console.log('Token endpoint:', TOKEN_ENDPOINT)
    console.log('Redirect URI:', REDIRECT_URI)
    
    const tokenResponse = await fetch(TOKEN_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        redirect_uri: REDIRECT_URI,
        grant_type: 'authorization_code',
        code,
      }),
    })
    
    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text()
      console.error('Failed to exchange code for token:', errorText)
      return NextResponse.redirect(new URL(`/?error=Token+exchange+failed`, request.url))
    }
    
    const tokenData = await tokenResponse.json()
    console.log('Token received successfully')
    
    const { access_token, refresh_token, expires_in } = tokenData
    
    // Fetch user information
    console.log('Fetching user information...')
    const userResponse = await fetch(USER_ENDPOINT, {
      headers: {
        'Authorization': `Bearer ${access_token}`,
      },
    })
    
    if (!userResponse.ok) {
      const errorText = await userResponse.text()
      console.error('Failed to fetch user information:', errorText)
      return NextResponse.redirect(new URL(`/?error=User+info+fetch+failed`, request.url))
    }
    
    const userData = await userResponse.json()
    console.log('User data received successfully')
    
    // Store tokens and user data in cookies
    const cookieStore = cookies()
    
    cookieStore.set('access_token', access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: expires_in,
      path: '/',
      sameSite: 'lax'
    })
    
    if (refresh_token) {
      cookieStore.set('refresh_token', refresh_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 30 * 24 * 60 * 60, // 30 days
        path: '/',
        sameSite: 'lax'
      })
    }
    
    // Store user data as a string
    cookieStore.set('user', JSON.stringify({
      ...userData,
      id: String(userData.id),
      locationId: userData.locationId ? String(userData.locationId) : null,
      client_id: String(userData.client_id || CLIENT_ID)
    }), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: expires_in,
      path: '/',
      sameSite: 'lax'
    })
    
    console.log('Authentication successful, redirecting to dashboard')
    
    // Redirect to dashboard or onboarding based on whether the user has a location
    if (userData.locationId) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    } else {
      return NextResponse.redirect(new URL('/onboarding', request.url))
    }
  } catch (error) {
    console.error('Error in OAuth callback:', error)
    return NextResponse.redirect(new URL('/?error=Authentication+failed', request.url))
  }
} 