import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

/**
 * POST handler for signing out the user
 */
export async function POST(request: NextRequest) {
  try {
    console.log('Processing sign-out request')
    
    // Get the cookie store
    const cookieStore = cookies()
    
    // Clear all authentication cookies
    cookieStore.delete('access_token')
    cookieStore.delete('refresh_token')
    cookieStore.delete('user')
    
    console.log('User signed out successfully')
    
    // Return success response
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error during sign-out:', error)
    return NextResponse.json({ error: 'Failed to sign out' }, { status: 500 })
  }
}

/**
 * GET handler for signing out the user (alternative method)
 */
export async function GET(request: NextRequest) {
  try {
    console.log('Processing sign-out request (GET method)')
    
    // Get the cookie store
    const cookieStore = cookies()
    
    // Clear all authentication cookies
    cookieStore.delete('access_token')
    cookieStore.delete('refresh_token')
    cookieStore.delete('user')
    
    console.log('User signed out successfully')
    
    // Redirect to home page
    return NextResponse.redirect(new URL('/', request.url))
  } catch (error) {
    console.error('Error during sign-out:', error)
    return NextResponse.redirect(
      new URL(`/?error=${encodeURIComponent('Failed to sign out')}`, request.url)
    )
  }
} 