import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

/**
 * GET handler for retrieving the authenticated user
 */
export async function GET(request: NextRequest) {
  try {
    const cookieStore = cookies()
    const userCookie = cookieStore.get('user')
    const accessTokenCookie = cookieStore.get('access_token')

    // Check if the user is authenticated
    if (!userCookie || !accessTokenCookie) {
      console.log('User not authenticated - missing cookies')
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    try {
      // Parse the user data from the cookie
      const userData = JSON.parse(userCookie.value)
      
      // Ensure all IDs are strings to prevent ObjectId casting issues
      const user = {
        ...userData,
        id: String(userData.id),
        locationId: userData.locationId ? String(userData.locationId) : null,
        client_id: String(userData.client_id || process.env.GHL_CLIENT_ID || '')
      }

      // Return the user data and access token
      return NextResponse.json({
        user,
        accessToken: accessTokenCookie.value
      })
    } catch (parseError) {
      console.error('Error parsing user data from cookie:', parseError)
      return NextResponse.json({ error: 'Invalid user data' }, { status: 500 })
    }
  } catch (error) {
    console.error('Error retrieving user data:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
} 