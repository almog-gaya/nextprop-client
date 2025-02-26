import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

/**
 * GET handler to retrieve the authenticated user
 */
export async function GET(request: NextRequest) {
  try {
    const cookieStore = cookies()
    
    // Get the user data from cookies
    const userCookie = cookieStore.get('ghl_user')
    const accessTokenCookie = cookieStore.get('ghl_access_token')
    
    if (!userCookie || !accessTokenCookie) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }
    
    // Parse the user data
    const user = JSON.parse(userCookie.value)
    const accessToken = accessTokenCookie.value
    
    return NextResponse.json({ user, accessToken })
  } catch (error) {
    console.error('Error retrieving user data:', error)
    return NextResponse.json({ error: 'Invalid user data' }, { status: 500 })
  }
} 