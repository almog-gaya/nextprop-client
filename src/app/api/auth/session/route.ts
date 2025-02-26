import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

/**
 * GET handler to retrieve the current session
 */
export async function GET(request: NextRequest) {
  try {
    const cookieStore = cookies()
    
    // Get the user data from cookies
    const userCookie = cookieStore.get('ghl_user')
    const accessTokenCookie = cookieStore.get('ghl_access_token')
    
    if (!userCookie || !accessTokenCookie) {
      return NextResponse.json({ user: null })
    }
    
    // Parse the user data
    const user = JSON.parse(userCookie.value)
    const accessToken = accessTokenCookie.value
    
    return NextResponse.json({ 
      user,
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours from now
    })
  } catch (error) {
    console.error('Error retrieving session data:', error)
    return NextResponse.json({ user: null })
  }
} 