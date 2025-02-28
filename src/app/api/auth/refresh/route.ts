import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

// Go High Level OAuth credentials
const CLIENT_ID = process.env.GHL_CLIENT_ID || ''
const CLIENT_SECRET = process.env.GHL_CLIENT_SECRET || ''

// OAuth endpoints
const TOKEN_ENDPOINT = 'https://services.leadconnectorhq.com/oauth/token'
const USER_ENDPOINT = 'https://services.leadconnectorhq.com/oauth/userinfo'

/**
 * POST handler for refreshing the access token
 */
export async function POST(request: NextRequest) {
  try {
    console.log('Processing token refresh request')
    
    // Get the refresh token from cookies
    const cookieStore = cookies()
    const refreshTokenCookie = cookieStore.get('refresh_token')
    const userCookie = cookieStore.get('user')
    
    // Check if the refresh token exists
    if (!refreshTokenCookie) {
      console.error('No refresh token found')
      return NextResponse.json({ error: 'No refresh token found' }, { status: 401 })
    }
    
    // Get the refresh token value
    const refreshToken = refreshTokenCookie.value
    
    // Exchange the refresh token for a new access token
    const tokenResponse = await fetch(TOKEN_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
      }),
    })
    
    // Check if the token request was successful
    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.text()
      console.error('Failed to refresh token:', errorData)
      
      // Clear cookies on refresh token failure
      cookieStore.delete('access_token')
      cookieStore.delete('refresh_token')
      cookieStore.delete('user')
      
      return NextResponse.json({ error: 'Failed to refresh token' }, { status: 401 })
    }
    
    // Parse the token response
    const tokenData = await tokenResponse.json()
    const { access_token, refresh_token, expires_in } = tokenData
    
    if (!access_token) {
      console.error('No access token received')
      return NextResponse.json({ error: 'No access token received' }, { status: 500 })
    }
    
    // Set the new access token cookie
    cookieStore.set('access_token', access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: expires_in,
      path: '/',
      sameSite: 'lax'
    })
    
    // Set the new refresh token cookie if provided
    if (refresh_token) {
      cookieStore.set('refresh_token', refresh_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 30 * 24 * 60 * 60, // 30 days
        path: '/',
        sameSite: 'lax'
      })
    }
    
    // Fetch updated user information if needed
    if (userCookie) {
      try {
        const userData = JSON.parse(userCookie.value)
        
        // Fetch user information using the new access token
        const userResponse = await fetch(USER_ENDPOINT, {
          headers: {
            Authorization: `Bearer ${access_token}`,
          },
        })
        
        if (userResponse.ok) {
          const newUserData = await userResponse.json()
          
          // Ensure all IDs are strings to prevent ObjectId casting issues
          const sanitizedUserData = {
            ...newUserData,
            id: String(newUserData.id),
            locationId: newUserData.locationId ? String(newUserData.locationId) : (userData.locationId ? String(userData.locationId) : null),
            client_id: String(newUserData.client_id || CLIENT_ID)
          }
          
          // Set the updated user data cookie
          cookieStore.set('user', JSON.stringify(sanitizedUserData), {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: expires_in,
            path: '/',
            sameSite: 'lax'
          })
        }
      } catch (error) {
        console.error('Error updating user data during token refresh:', error)
        // Continue with the token refresh even if user data update fails
      }
    }
    
    console.log('Token refreshed successfully')
    
    // Return success response
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error during token refresh:', error)
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Failed to refresh token' 
    }, { status: 500 })
  }
} 